import { Temporal } from "temporal-polyfill";

import type { Attendee, AttendeeStatus } from "./calendars";

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

export interface ConferenceEntryPoint {
  joinUrl: {
    label?: string;
    value: string;
  };
  meetingCode?: string;
  accessCode?: string;
  password?: string;
}

export interface Conference {
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
