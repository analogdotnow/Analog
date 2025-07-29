import { Temporal } from "temporal-polyfill";

import type { CreateEventInput, UpdateEventInput } from "../schemas/events";

export type TemporalDate =
  | Temporal.PlainDate
  | Temporal.Instant
  | Temporal.ZonedDateTime;

export interface ProviderConfig {
  accessToken: string;
  accountId: string;
}

export interface Calendar {
  id: string;
  providerId: "google" | "microsoft";
  name: string;
  description?: string;
  timeZone?: string;
  primary: boolean;
  accountId: string;
  color?: string;
  readOnly: boolean;
}

export interface CalendarEvent {
  id: string;
  title?: string;
  description?: string;
  start: Temporal.PlainDate | Temporal.Instant | Temporal.ZonedDateTime;
  end: Temporal.PlainDate | Temporal.Instant | Temporal.ZonedDateTime;
  allDay?: boolean;
  location?: string;
  status?: string;
  attendees?: Attendee[];
  url?: string;
  color?: string;
  readOnly: boolean;
  providerId: "google" | "microsoft";
  accountId: string;
  calendarId: string;
  /** Current user's response status for this event */
  response?: {
    status: AttendeeStatus;
    comment?: string;
  };
  metadata?: Record<string, unknown>;
  conference?: Conference;
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

export interface ResponseToEventInput {
  status: "accepted" | "tentative" | "declined" | "unknown";
  comment?: string;
  sendUpdate: boolean;
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
    calendar: Calendar,
    timeMin: Temporal.ZonedDateTime,
    timeMax: Temporal.ZonedDateTime,
    timeZone?: string,
  ): Promise<CalendarEvent[]>;
  createEvent(
    calendar: Calendar,
    event: CreateEventInput,
  ): Promise<CalendarEvent>;
  updateEvent(
    calendar: Calendar,
    eventId: string,
    event: UpdateEventInput,
  ): Promise<CalendarEvent>;
  deleteEvent(calendarId: string, eventId: string): Promise<void>;
  responseToEvent(
    calendarId: string,
    eventId: string,
    response: ResponseToEventInput,
  ): Promise<void>;
}

export interface ConferencingProvider {
  providerId: "zoom" | "google";
  createConference(
    agenda: string,
    startTime: string,
    endTime: string,
    timeZone?: string,
    calendarId?: string,
    eventId?: string,
  ): Promise<Conference>;
}

export interface Conference {
  /** Provider-specific meeting identifier (e.g. Google Meet code, Zoom UUID). */
  id?: string;

  /** Human-friendly provider or meeting name (e.g. "Google Meet", "Teams"). */
  name?: string;

  /** Primary join URL for participants (video URL). */
  joinUrl?: string;

  /** Host-only URL when the provider differentiates (e.g. Zoom start_url). */
  hostUrl?: string;

  /** Meeting code or numeric ID displayed to users. */
  meetingCode?: string;

  /** Password / pass-code if required to join. */
  password?: string;

  /** One or more dial-in phone numbers (E.164 / plain). */
  phoneNumbers?: string[];

  /** Additional free-form notes such as SIP information. */
  notes?: string;

  /** Provider-specific extra fields preserved for debugging / extensions. */
  extra?: Record<string, unknown>;
}

export interface TaskCollection {
  id: string;
  providerId?: string;
  title?: string;
  updated?: string;
  accountId: string;
}

export interface TaskCollectionWithTasks extends TaskCollection {
  tasks: Task[];
}

export interface Task {
  id: string;
  accountId: string;
  taskCollectionId: string;
  providerId?: string;
  title?: string;
  etag?: string;
  completed?: Temporal.ZonedDateTime | Temporal.Instant | Temporal.PlainDate;
  description?: string;
  due?: Temporal.ZonedDateTime | Temporal.Instant | Temporal.PlainDate;
}

export interface TaskProvider {
  providerId: "google";
  tasks(): Promise<TaskCollectionWithTasks[]>;
  taskCollections(): Promise<TaskCollection[]>;
  tasksForTaskCollection(taskCollectionId: string): Promise<Task[]>;
  createTask(task: Omit<Task, "id">): Promise<Task>;
  updateTask(task: Task): Promise<Task>;
  deleteTask(task: Task): Promise<void>;
}
