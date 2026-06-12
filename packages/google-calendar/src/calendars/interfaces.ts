import type {
  ConferenceProperties,
  GoogleCalendarRequestOptions,
} from "../interfaces";

export interface Calendar {
  conferenceProperties?: ConferenceProperties;
  description?: string;
  etag?: string;
  id?: string;
  kind?: string;
  location?: string;
  summary?: string;
  timeZone?: string;
}

export type CalendarInput = Omit<Calendar, "etag" | "id" | "kind">;

export interface InsertCalendarsInput
  extends GoogleCalendarRequestOptions, CalendarInput {}

export type InsertCalendarsResponse = Calendar;

export interface DeleteCalendarsInput extends GoogleCalendarRequestOptions {
  calendarId: string;
}

export interface GetCalendarsInput extends GoogleCalendarRequestOptions {
  calendarId: string;
}

export type GetCalendarsResponse = Calendar;

export interface PatchCalendarsInput
  extends GoogleCalendarRequestOptions, CalendarInput {
  calendarId: string;
}

export type PatchCalendarsResponse = Calendar;

export interface UpdateCalendarsInput
  extends GoogleCalendarRequestOptions, CalendarInput {
  calendarId: string;
}

export type UpdateCalendarsResponse = Calendar;

export interface ClearCalendarsInput extends GoogleCalendarRequestOptions {
  calendarId: string;
}
