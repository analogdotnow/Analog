import type { CalendarEvent } from "@repo/api/interfaces";

export type iCalendarEvent = Omit<
  CalendarEvent,
  "providerId" | "accountId" | "calendarId"
>;

export interface iCalendar {
  name?: string;
  events: iCalendarEvent[];
}
