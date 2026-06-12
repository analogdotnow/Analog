import type {
  Calendar,
  CalendarListEntry,
  ConferenceData,
  Event,
  EventAttendee,
  FreeBusyCalendar,
  FreeBusyResponse,
  InsertEventsInput,
  TimePeriod,
  UpdateEventsInput,
} from "@analog/google-calendar";

export type GoogleCalendarCalendar = Calendar;
export type GoogleCalendarCalendarListEntry = CalendarListEntry;
export type GoogleCalendarEvent = Event;
export type GoogleCalendarEventConferenceData = ConferenceData;

export type GoogleCalendarEventCreateParams = Omit<
  InsertEventsInput,
  "calendarId"
>;
export type GoogleCalendarEventUpdateParams = Omit<
  UpdateEventsInput,
  "eventId"
>;

export type GoogleCalendarFreeBusyResponse = FreeBusyResponse;

export type GoogleCalendarFreeBusyResponseCalendars = FreeBusyCalendar;
export type GoogleCalendarFreeBusySlot = TimePeriod;

export interface GoogleCalendarDate {
  date: string;
}

export interface GoogleCalendarDateTime {
  dateTime: string;
  timeZone?: string;
}

export type AllDayGoogleCalendarEvent = GoogleCalendarEvent & {
  start: GoogleCalendarDate;
  end: GoogleCalendarDate;
};

export type DateTimeGoogleCalendarEvent = GoogleCalendarEvent & {
  start: GoogleCalendarDateTime;
  end: GoogleCalendarDateTime;
};

export type GoogleCalendarEventAttendee = EventAttendee;
export type GoogleCalendarEventAttendeeResponseStatus =
  | "needsAction"
  | "accepted"
  | "declined"
  | "tentative";
