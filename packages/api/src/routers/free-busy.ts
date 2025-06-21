import { TRPCError } from "@trpc/server";
import { Temporal } from "temporal-polyfill";
import { zZonedDateTimeInstance } from "temporal-zod";
import { z } from "zod";

import {
  createEventInputSchema,
  updateEventInputSchema,
} from "../schemas/events";
import { calendarProcedure, createTRPCRouter } from "../trpc";
import { toInstant } from "../utils/temporal";

export const freeBusyRouter = createTRPCRouter({
  list: calendarProcedure
    .input(
      z.object({
        calendars: z.array(z.string()).default([]),
        timeMin: zZonedDateTimeInstance,
        timeMax: zZonedDateTimeInstance,
      }),
    )
    .query(async ({ ctx, input }) => {
      const allEvents = await Promise.all(
        ctx.providers.map(async ({ client }) => {
          const calendars = await client.calendars();

          const r = await client.freeBusy(
            input.calendars.length === 0
              ? calendars.map((c) => c.id)
              : input.calendars,
            input.timeMin,
            input.timeMax,
          );

          return r;
        }),
      );

      const events = allEvents
        .flat()
        .map(
          (v) => [v, toInstant({ value: v.start, timeZone: "UTC" })] as const,
        )
        .sort(([, i1], [, i2]) => Temporal.Instant.compare(i1, i2))
        .map(([v]) => v);

      return { events };
    }),
});
