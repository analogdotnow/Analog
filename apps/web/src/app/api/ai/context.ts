import { CalendarEvent } from "@/lib/interfaces";
import { Temporal } from "temporal-polyfill";
import { z } from "zod";

const eventSchema = z.object({
  id: z.string(),
  title: z.string(),
  start: z.instanceof(Temporal.ZonedDateTime),
  end: z.instanceof(Temporal.ZonedDateTime).optional(),
});

const calendarContextSchema = z.object({
  type: z.literal("calendar"),
  view: z.object({
    type: z.enum(["day", "week", "month", "year"]),
    start: z.instanceof(Temporal.ZonedDateTime),
    end: z.instanceof(Temporal.ZonedDateTime).optional(),
  }),
  events: z.array(eventSchema),
});

export interface CalendarContext {
  type: "calendar";
  view: {
    type: "day" | "week" | "month" | "year";
    start: Temporal.ZonedDateTime;
    end?: Temporal.ZonedDateTime | undefined;
  };
  events: CalendarEvent[];
}

export function createContext(

