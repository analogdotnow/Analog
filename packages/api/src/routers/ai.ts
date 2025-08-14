import { Temporal } from "temporal-polyfill";
import { zZonedDateTimeInstance } from "temporal-zod";
import { z } from "zod/v3";

import { env } from "@repo/env/server";
import { computeRoutes } from "@repo/google-routes";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const aiRouter = createTRPCRouter({
  directions: protectedProcedure
    .input(
      z.object({
        origin: z.union([
          z.object({
            address: z.undefined().optional(),
            location: z.object({
              latitude: z.number(),
              longitude: z.number(),
            }),
          }),
          z.object({
            address: z.string(),
            location: z.undefined().optional(),
          }),
        ]),
        destination: z.union([
          z.object({
            address: z.undefined().optional(),
            location: z.object({
              latitude: z.number(),
              longitude: z.number(),
            }),
          }),
          z.object({
            address: z.string(),
            location: z.undefined().optional(),
          }),
        ]),
        time: zZonedDateTimeInstance.optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const origin = input.origin;
      const destination = input.destination;

      console.log(JSON.stringify(input, null, 2));
      const routes = await computeRoutes({
        request: {
          origin: {
            ...(origin.address
              ? { address: origin.address }
              : { location: { latLng: origin.location } }),
          },
          destination: {
            ...(destination.address
              ? { address: destination.address }
              : { location: { latLng: destination.location } }),
          },
        },
        apiKey: env.GOOGLE_MAPS_API_KEY!,
      });

      console.log(routes);

      return { routes };
    }),
});
