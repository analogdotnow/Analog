import { Temporal } from "temporal-polyfill";
import { zZonedDateTimeInstance } from "temporal-zod";
import { z } from "zod/v3";

import { calendarProcedure, createTRPCRouter } from "../trpc";

export const freeBusyRouter = createTRPCRouter({
  list: calendarProcedure
    .input(
      z.object({
        schedules: z.array(z.string()).min(1),
        timeMin: zZonedDateTimeInstance,
        timeMax: zZonedDateTimeInstance,
      }),
    )
    .query(async ({ ctx, input }) => {
      const promises = ctx.providers.map(async ({ client }) => {
        if (client.providerId === "google") {
          return [];
        }

        return await client.freeBusy(
          input.schedules,
          input.timeMin,
          input.timeMax,
        );
      });

      const freeBusy = await Promise.all(promises);

      return { blocks: freeBusy.flat() };
    }),
});
