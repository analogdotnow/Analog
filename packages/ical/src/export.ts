import { Temporal } from "temporal-polyfill";
import {
  generateIcsCalendar,
  generateIcsEvent,
  generateIcsTimezone,
  type IcsAttendee,
  type IcsCalendar,
  type IcsDateObject,
  type IcsEvent,
  type IcsTimezone,
} from "ts-ics";

import type { Attendee } from "@repo/api/interfaces";
import type { iCalendarEvent } from "./interfaces";

function formatOffset(offset: string): string {
  return offset.replace(":", "");
}

function toDate(value: iCalendarEvent["start"]): Date {
  if (value instanceof Temporal.PlainDate) {
    return new Date(value.toString());
  }

  if (value instanceof Temporal.Instant) {
    return new Date(value.epochMilliseconds);
  }

  return new Date(value.toInstant().epochMilliseconds);
}

function toAttendee(attendee: Attendee): IcsAttendee {
  const result: IcsAttendee = {
    email: attendee.email ?? "",
  };

  if (attendee.name) {
    result.name = attendee.name;
  }

  if (attendee.status) {
    if (attendee.status === "accepted") {
      result.partstat = "ACCEPTED";
    } else if (attendee.status === "declined") {
      result.partstat = "DECLINED";
    } else if (attendee.status === "tentative") {
      result.partstat = "TENTATIVE";
    } else {
      result.partstat = "NEEDS-ACTION";
    }
  }

  if (attendee.type) {
    if (attendee.type === "optional") {
      result.role = "OPT-PARTICIPANT";
    } else if (attendee.type === "resource") {
      result.role = "NON-PARTICIPANT";
    } else {
      result.role = "REQ-PARTICIPANT";
    }
  }

  return result;
}

function toIcsEvent(event: iCalendarEvent): IcsEvent {
  const start: IcsDateObject = {
    date: toDate(event.start),
    type: event.allDay ? "DATE" : "DATE-TIME",
  };

  const end: IcsDateObject = {
    date: toDate(event.end),
    type: event.allDay ? "DATE" : "DATE-TIME",
  };

  if (!event.allDay) {
    if (event.start instanceof Temporal.ZonedDateTime) {
      start.local = {
        date: start.date,
        timezone: event.start.timeZoneId,
        tzoffset: formatOffset(event.start.offset),
      };
    }

    if (event.end instanceof Temporal.ZonedDateTime) {
      end.local = {
        date: end.date,
        timezone: event.end.timeZoneId,
        tzoffset: formatOffset(event.end.offset),
      };
    }
  }

  return {
    uid: event.id,
    summary: event.title ?? "",
    stamp: { date: new Date() },
    start,
    end,
    ...(event.description && { description: event.description }),
    ...(event.location && { location: event.location }),
    ...(event.url && { url: event.url }),
    ...(event.attendees &&
      event.attendees.length > 0 && {
        attendees: event.attendees.map(toAttendee),
      }),
  };
}

export function exportEvent(event: iCalendarEvent): string {
  return generateIcsEvent(toIcsEvent(event));
}

export function exportEvents(events: iCalendarEvent[]): string {
  const calendar: IcsCalendar = {
    prodId: "@analog/ical",
    version: "2.0",
    events: events.map(toIcsEvent),
  };
  return generateIcsCalendar(calendar);
}

export function exportTimezone(timezone: IcsTimezone): string {
  return generateIcsTimezone(timezone);
}

