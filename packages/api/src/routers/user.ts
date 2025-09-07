import * as z from "zod";

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
  geolocation: publicProcedure.query(({ ctx }) => {
    const result = coordinatesSchema.safeParse({
      latitude: ctx.headers.get("x-vercel-ip-latitude"),
      longitude: ctx.headers.get("x-vercel-ip-longitude"),
    });

    if (!result.success) {
      return undefined;
    }

    return result.data;
  }),
});

const coordinatesSchema = z.object({
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
});
