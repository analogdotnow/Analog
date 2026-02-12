import type { Temporal } from "temporal-polyfill";

type EventTime = Temporal.PlainDate | Temporal.Instant | Temporal.ZonedDateTime;

type TimeFields<TTime extends EventTime> = TTime extends Temporal.PlainDate
  ? { allDay: true; start: TTime; end: TTime }
  : TTime extends Temporal.Instant | Temporal.ZonedDateTime
    ? { allDay: false; start: TTime; end: TTime }
    : never;

export type CalendarEvent<TTime extends EventTime = EventTime> = {
  id: string;
  title?: string;
  description?: string;
  location?: string;
  status?: string;
  availability?: "busy" | "free";
  attendees?: Attendee[];
  url?: string;
  etag?: string;
  color?: string | null;
  visibility?: "default" | "public" | "private" | "confidential";
  readOnly: boolean;
  calendar: {
    id: string;
    provider: {
      id: "google" | "microsoft";
      accountId: string;
    };
  };
  createdAt?: Temporal.Instant;
  updatedAt?: Temporal.Instant;
  response?: {
    status: AttendeeStatus;
    comment?: string | null;
  };
  metadata?: Record<string, unknown>;
  conference?: Conference | null;
  recurrence?: Recurrence | null;
  recurringEventId?: string;
  type?: "draft" | "event";
} & TimeFields<TTime>;

export type AllDayEvent = CalendarEvent<Temporal.PlainDate>;
export type TimedInstantEvent = CalendarEvent<Temporal.Instant>;
export type TimedZonedEvent = CalendarEvent<Temporal.ZonedDateTime>;

// export type CalendarEvent = {
//   id: string;
//   title?: string;
//   description?: string;
//   allDay?: boolean;
//   location?: string;
//   status?: string;
//   availability?: "busy" | "free";
//   attendees?: Attendee[];
//   url?: string;
//   etag?: string;
//   color?: string | null;
//   visibility?: "default" | "public" | "private" | "confidential";
//   readOnly: boolean;
//   calendar: {
//     id: string;
//     provider: {
//       id: "google" | "microsoft";
//       accountId: string;
//     };
//   };
//   createdAt?: Temporal.Instant;
//   updatedAt?: Temporal.Instant;
//   response?: {
//     status: AttendeeStatus;
//     comment?: string | null;
//   };
//   metadata?: Record<string, unknown>;
//   conference?: Conference | null;
//   recurrence?: Recurrence | null;
//   recurringEventId?: string;
// } & (
//   | { allDay: true; start: Temporal.PlainDate; end: Temporal.PlainDate }
//   | { allDay: false; start: Temporal.Instant; end: Temporal.Instant }
//   | {
//       allDay: false;
//       start: Temporal.ZonedDateTime;
//       end: Temporal.ZonedDateTime;
//     }
// );

export type CalendarEventSyncItem =
  | {
      status: "updated";
      event: CalendarEvent;
    }
  | {
      status: "deleted";
      event: {
        id: string;
        calendar: {
          id: string;
          provider: {
            id: "google" | "microsoft";
            accountId: string;
          };
        };
      };
    };

export interface ConferenceEntryPoint {
  joinUrl: {
    label?: string;
    value: string;
  };
  meetingCode?: string;
  accessCode?: string;
  password?: string;
  pin?: string;
}

export interface CreateConferenceRequest {
  type: "create";
  providerId: "google" | "microsoft";
  requestId: string;
}

export type Conference = ConferenceData | CreateConferenceRequest;

export interface ConferenceData {
  type: "conference";
  providerId: "google" | "microsoft";

  id?: string;

  /** Provider-specific meeting identifier (e.g. Google Meet code, Zoom UUID). */
  conferenceId?: string;

  /** Human-friendly provider or meeting name (e.g. "Google Meet", "Teams"). */
  name?: string;

  /** Video conference entry point */
  video?: ConferenceEntryPoint;

  /** SIP conference entry point */
  sip?: ConferenceEntryPoint;

  /** Phone conference entry points */
  phone?: ConferenceEntryPoint[];

  /** Host-only URL when the provider differentiates (e.g. Zoom start_url). */
  hostUrl?: string;

  /** Additional free-form notes such as SIP information. */
  notes?: string;

  /** Provider-specific extra fields preserved for debugging / extensions. */
  extra?: Record<string, unknown>;
}

export interface Attendee {
  id?: string;
  email: string;
  name?: string;
  status: "accepted" | "tentative" | "declined" | "unknown";
  type: "required" | "optional" | "resource";
  comment?: string; // Google only
  organizer?: boolean;
  additionalGuests?: number; // Google only
}

export type AttendeeStatus = Attendee["status"];

export type Weekday = "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU";

export type Frequency =
  | "SECONDLY"
  | "MINUTELY"
  | "HOURLY"
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY"
  | "YEARLY";

export type RScale =
  | "GREGORIAN"
  | "BUDDHIST"
  | "CHINESE"
  | "COPTIC"
  | "DANGI"
  | "ETHIOPIC"
  | "ETHIOAA"
  | "HEBREW"
  | "INDIAN"
  | "ISLAMIC"
  | "ISLAMIC-CIVIL"
  | "ISLAMIC-TBLA"
  | "ISLAMIC-UMALQURA"
  | "ISLAMIC-RGSA"
  | "ISO8601"
  | "JAPANESE"
  | "PERSIAN"
  | "ROC";

export interface Recurrence {
  freq?: Frequency;
  interval?: number;
  count?: number;
  until?: Temporal.PlainDate | Temporal.Instant | Temporal.ZonedDateTime;
  byDay?: Weekday[];
  byMonth?: number[];
  byMonthDay?: number[];
  byYearDay?: number[];
  byWeekNo?: number[];
  byHour?: number[];
  byMinute?: number[];
  bySecond?: number[];

  bySetPos?: number[];
  exDate?: (Temporal.PlainDate | Temporal.Instant | Temporal.ZonedDateTime)[];
  rDate?: (Temporal.PlainDate | Temporal.Instant | Temporal.ZonedDateTime)[];
  dtstart?: Temporal.PlainDate | Temporal.Instant | Temporal.ZonedDateTime;
  wkst?: Weekday;
  rscale?: RScale;
  skip?: "OMIT" | "BACKWARD" | "FORWARD";
}
