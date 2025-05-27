import { GoogleCalendar } from "@repo/google-calendar";

export type CreateEventOptions = Omit<
  GoogleCalendar.Calendars.Events.EventCreateParams,
  "calendarId"
>;

export type UpdateEventOptions = Omit<
  GoogleCalendar.Calendars.Events.EventUpdateParams,
  "calendarId"
>;
