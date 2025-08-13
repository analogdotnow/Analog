import "server-only";

import * as Sentry from "@sentry/node";
import { TRPCError, initTRPC } from "@trpc/server";
import { Ratelimit } from "@unkey/ratelimit";
import { ZodError } from "zod/v3";

import { auth } from "@repo/auth/server";
import { db } from "@repo/db";
import { env } from "@repo/env/server";

import {
  getCalendarProvider,
  getTaskProvider,
  isCalendarProvider,
  isTaskProvider,
} from "./providers";
import { getAccounts } from "./utils/accounts";
import { getIp } from "./utils/ip";
import { superjson } from "./utils/superjson";

type Unit = "ms" | "s" | "m" | "h" | "d";
type Duration = `${number} ${Unit}` | `${number}${Unit}`;

export interface Meta {
  procedureName: string;
  ratelimit: {
    namespace: string;
    limit: number;
    duration: Duration;
  };
}

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth.api.getSession({
    headers: opts.headers,
  });

  return {
    authContext: await auth.$context,
    db,
    session: session?.session,
    user: session?.user,
    rateLimit: {
      id: session?.user?.id ?? getIp(opts.headers),
    },
    ...opts,
  };
};

export const t = initTRPC
  .context<typeof createTRPCContext>()
  .meta<Meta>()
  .create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
      return {
        ...shape,
        data: {
          ...shape.data,
          zodError:
            error.cause instanceof ZodError ? error.cause.flatten() : null,
        },
      };
    },
  });

export const createCallerFactory = t.createCallerFactory;

export const createTRPCRouter = t.router;

const sentryMiddleware = t.middleware(Sentry.trpcMiddleware());

export const rateLimitMiddleware = t.middleware(async ({ ctx, meta, next }) => {
  if (!meta?.ratelimit) {
    return next();
  }

  const limiter = new Ratelimit({
    namespace: meta.ratelimit.namespace,
    limit: meta.ratelimit.limit,
    duration: meta.ratelimit.duration,
    rootKey: env.UNKEY_ROOT_KEY,
  });

  const identifier = `${meta.procedureName}:${ctx.rateLimit.id}`;
  const result = await limiter.limit(identifier);

  if (!result.success) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
  }

  return next();
});

export const publicProcedure = t.procedure
  .use(sentryMiddleware)
  .use(rateLimitMiddleware);

export const protectedProcedure = t.procedure
  .use(sentryMiddleware)
  .use(rateLimitMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return next({
      ctx: {
        ...ctx,
        session: { ...ctx.session },
        user: { ...ctx.user },
      },
    });
  });

export const calendarProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    try {
      const accounts = await getAccounts(ctx.user, ctx.headers);

      const providers = accounts
        .filter((provider) => isCalendarProvider(provider.providerId))
        .map((account) => ({
          account: {
            ...account,
            providerId: account.providerId as "google" | "microsoft",
          },
          client: getCalendarProvider(account),
        }));

      return next({
        ctx: {
          ...ctx,
          providers,
          accounts,
        },
      });
    } catch (error) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);

export const taskProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  try {
    const accounts = await getAccounts(ctx.user, ctx.headers);

    const providers = accounts
      .filter((provider) => isTaskProvider(provider.providerId))
      .map((account) => ({
        account: {
          ...account,
          providerId: account.providerId as "google" | "microsoft",
        },
        client: getTaskProvider(account),
      }));

    return next({
      ctx: {
        ...ctx,
        providers,
        accounts,
      },
    });
  } catch (error) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
