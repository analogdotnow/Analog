import { importEvent, importCalendar, isCalendar, isEvent } from "@analog/ical";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

const FETCH_TIMEOUT = 10000;

export const icsRouter = createTRPCRouter({
  parseFromUrl: publicProcedure
    .input(
      z.object({
        url: z.url(),
      }),
    )
    .query(async ({ input }) => {
      const response = await fetch(input.url, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT),
      });

      if (!response.ok) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Failed to fetch ICS file: ${response.status} ${response.statusText}`,
        });
      }

      const content = await response.text();

      if (!content.trim()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "ICS file is empty",
        });
      }

      try {
        if (isCalendar(content)) {
          const calendar = importCalendar(content);
          return {
            type: "calendar",
            events: calendar.events,
          };
        }

        if (isEvent(content)) {
          const event = importEvent(content);
          return {
            type: "event",
            events: [event],
          };
        }

        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid ICS content: not a VCALENDAR or VEVENT",
        });
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process ICS file",
          cause: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }),
});
