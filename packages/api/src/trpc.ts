import "server-only";
import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { auth } from "@repo/auth/server";
import { db } from "@repo/db";

import { GoogleCalendarProvider } from "./providers/google-calendar";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth.api.getSession({
    headers: opts.headers,
  });

  return {
    db,
    session: session?.session,
    user: session?.user,
    ...opts,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
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

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const { session, user } = ctx;

  return next({
    ctx: {
      session,
      user,
    },
  });
});

export const withGoogleCalendar = t.middleware(async ({ ctx, next }) => {
  const { accessToken } = await auth.api.getAccessToken({
    body: {
      providerId: "google",
    },
    headers: ctx.headers,
  });

  if (!accessToken) throw new TRPCError({ code: "UNAUTHORIZED" });

  const client = new GoogleCalendarProvider({
    accessToken,
  });

  return next({
    ctx: {
      calendarClient: client
    }
  })
});
