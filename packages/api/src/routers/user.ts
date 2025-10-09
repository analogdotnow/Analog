import "server-only";

import { locationSchema } from "@repo/schemas";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  me: protectedProcedure.query(({ ctx }) => {
    return {
      ...ctx.user,
      session: {
        id: ctx.session.id,
        ipAddress: ctx.session.ipAddress,
        userAgent: ctx.session.userAgent,
      },
    };
  }),
  approximateLocation: publicProcedure.query(({ ctx }) => {
    const result = locationSchema.safeParse({
      latitude: ctx.headers.get("x-vercel-ip-latitude"),
      longitude: ctx.headers.get("x-vercel-ip-longitude"),
      continent: ctx.headers.get("x-vercel-ip-continent"),
      country: ctx.headers.get("x-vercel-ip-country"),
      region: ctx.headers.get("x-vercel-ip-country-region"),
      city: ctx.headers.get("x-vercel-ip-city"),
      postalCode: ctx.headers.get("x-vercel-ip-postal-code"),
      timezone: ctx.headers.get("x-vercel-ip-timezone"),
    });

    if (!result.success) {
      return undefined;
    }

    return result.data;
  }),
});
