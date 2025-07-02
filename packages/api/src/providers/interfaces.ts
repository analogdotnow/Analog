import { Temporal } from "temporal-polyfill";

import type { CreateEventInput, UpdateEventInput } from "../schemas/events";

export type TemporalDate =
  | Temporal.PlainDate
  | Temporal.Instant
  | Temporal.ZonedDateTime;

export interface Calendar {
  id: string;
  providerId: string;
  name: string;
  description?: string;
  timeZone?: string;
  primary: boolean;
  accountId: string;
  color?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Temporal.PlainDate | Temporal.Instant | Temporal.ZonedDateTime;
  end: Temporal.PlainDate | Temporal.Instant | Temporal.ZonedDateTime;
  allDay?: boolean;
  location?: string;
  status?: string;
  attendees?: Attendee[];
  url?: string;
  color?: string;
  providerId: string;
  accountId: string;
  calendarId: string;
  metadata?: Record<string, unknown>;
  conferenceData?: {
    entryPoints: EntryPoint[];
    conferenceId: string;
    conferenceSolution: {
      name: string;
    };
  };
}

export interface EntryPoint {
  entryPointType: "video" | "phone";
  uri: string;
  label: string;
  passcode: string;
}

export interface Attendee {
  id?: string;
  email?: string;
  name?: string;
  status: "accepted" | "tentative" | "declined" | "unknown";
  type: "required" | "optional" | "resource";
  comment?: string; // Google only
  additionalGuests?: number; // Google only
}

export type AttendeeStatus = Attendee["status"];

export interface CalendarProvider {
  providerId: "google" | "microsoft";
  calendars(): Promise<Calendar[]>;
  createCalendar(
    calendar: Omit<Calendar, "id" | "providerId">,
  ): Promise<Calendar>;
  updateCalendar(
    calendarId: string,
    calendar: Partial<Calendar>,
  ): Promise<Calendar>;
  deleteCalendar(calendarId: string): Promise<void>;
  events(
    calendarId: string,
    timeMin: Temporal.ZonedDateTime,
    timeMax: Temporal.ZonedDateTime,
  ): Promise<CalendarEvent[]>;
  createEvent(
    calendarId: string,
    event: CreateEventInput,
  ): Promise<CalendarEvent>;
  updateEvent(
    calendarId: string,
    eventId: string,
    event: UpdateEventInput,
  ): Promise<CalendarEvent>;
  deleteEvent(calendarId: string, eventId: string): Promise<void>;
  responseToEvent(
    calendarId: string,
    eventId: string,
    response: {
      status: "accepted" | "tentative" | "declined";
      comment?: string;
    },
  ): Promise<void>;
}

export interface MeetingProvider {
  providerId: "zoom" | "google";
  createMeeting(options: CreateMeetingOptions): Promise<Meeting>;
  updateMeeting(
    meetingId: string,
    options: UpdateMeetingOptions,
  ): Promise<Meeting>;
  deleteMeeting(meetingId: string): Promise<void>;
  getMeeting(meetingId: string): Promise<Meeting>;
}

export interface Meeting {
  id: string;
  joinUrl: string;
  hostUrl?: string;
  password?: string;
  dialInNumbers?: string[];
  providerId: string;
  settings?: Record<string, unknown>;
}

export interface CreateMeetingOptions {
  title: string;
  startTime: Temporal.ZonedDateTime;
  duration: number; // minutes
  timezone: string;
  settings?: MeetingSettings;
}

export interface UpdateMeetingOptions {
  title?: string;
  startTime?: Temporal.ZonedDateTime;
  duration?: number;
  timezone?: string;
  settings?: MeetingSettings;
}

export interface MeetingSettings {
  waitingRoom?: boolean;
  muteOnEntry?: boolean;
  allowRecording?: boolean;
  requirePassword?: boolean;
  // Provider-specific settings can be added via additional properties
  [key: string]: unknown;
}
