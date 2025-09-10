import { Temporal } from "temporal-polyfill";
import {
  convertIcsCalendar,
  convertIcsEvent,
  getEventEnd,
  type IcsAttendee,
  type IcsDateObject,
  type IcsEvent,
} from "ts-ics";

import type { Attendee } from "@repo/api/interfaces";

import type { iCalendar, iCalendarEvent } from "./interfaces";

function toTemporal(dateObj: IcsDateObject): iCalendarEvent["start"] {
  if (dateObj.type === "DATE") {
    return Temporal.PlainDate.from(dateObj.date.toISOString().slice(0, 10));
  }

  if (dateObj.local) {
    const instant = Temporal.Instant.from(dateObj.date.toISOString());
    return instant.toZonedDateTimeISO(dateObj.local.timezone);
  }

  return Temporal.Instant.from(dateObj.date.toISOString());
}

function attendeeStatus(partstat: IcsAttendee["partstat"]): Attendee["status"] {
  if (partstat === "ACCEPTED") {
    return "accepted";
  } else if (partstat === "DECLINED") {
    return "declined";
  } else if (partstat === "TENTATIVE") {
    return "tentative";
  }

  return "unknown";
}

function attendeeType(role: IcsAttendee["role"]): Attendee["type"] {
  if (role === "OPT-PARTICIPANT") {
    return "optional";
  } else if (role === "NON-PARTICIPANT") {
    return "resource";
  }

  return "required";
}

function fromAttendee(attendee: IcsAttendee): Attendee {
  const status = attendeeStatus(attendee.partstat);

  const type = attendeeType(attendee.role);

  return {
    email: attendee.email,
    name: attendee.name,
    status,
    type,
  };
}

function computeEndDateObject(event: IcsEvent): IcsDateObject | undefined {
  if (event.end) {
    return event.end;
  }

  if (!event.duration) {
    return undefined;
  }

  return {
    date: getEventEnd(event),
    type: event.start.type,
    ...(event.start.local && {
      local: {
        date: getEventEnd(event),
        timezone: event.start.local.timezone,
        // tzoffset is not used by our converter; reuse start offset
        tzoffset: event.start.local.tzoffset,
      },
    }),
  };
}

function mapAttendees(event: IcsEvent): Attendee[] {
  const attendees = (event.attendees?.map(fromAttendee) ?? []).slice();
  if (event.organizer?.email) {
    const idx = attendees.findIndex(
      (a) => a.email.toLowerCase() === event.organizer!.email.toLowerCase(),
    );
    if (idx >= 0) {
      attendees[idx] = { ...attendees[idx]!, organizer: true };
    } else {
      attendees.unshift({
        email: event.organizer.email,
        name: event.organizer.name,
        status: "unknown",
        type: "required",
        organizer: true,
      });
    }
  }
  return attendees;
}

function mapAvailability(
  event: IcsEvent,
): iCalendarEvent["availability"] | undefined {
  if (event.timeTransparent === "TRANSPARENT") {
    return "free";
  }

  if (event.timeTransparent === "OPAQUE") {
    return "busy";
  }

  return undefined;
}

function mapVisibility(
  event: IcsEvent,
): iCalendarEvent["visibility"] | undefined {
  if (event.class) {
    return event.class.toLowerCase() as iCalendarEvent["visibility"];
  }

  return undefined;
}

function mapRecurrence(event: IcsEvent): iCalendarEvent["recurrence"] {
  if (!event.recurrenceRule) {
    return undefined;
  }

  return {
    freq: event.recurrenceRule.frequency,
    interval: event.recurrenceRule.interval,
    count: event.recurrenceRule.count,
    until: event.recurrenceRule.until
      ? toTemporal(event.recurrenceRule.until)
      : undefined,
    bySecond: event.recurrenceRule.bySecond,
    byMinute: event.recurrenceRule.byMinute,
    byHour: event.recurrenceRule.byHour,
    byDay: event.recurrenceRule.byDay?.map((wd) => wd.day),
    byMonthDay: event.recurrenceRule.byMonthday,
    byYearDay: event.recurrenceRule.byYearday,
    byWeekNo: event.recurrenceRule.byWeekNo,
    byMonth: event.recurrenceRule.byMonth,
    bySetPos: event.recurrenceRule.bySetPos,
    wkst: event.recurrenceRule.workweekStart,
    exDate: event.exceptionDates?.map((d) => toTemporal(d)),
    // rDate not provided by ts-ics VEVENT parser
  };
}

function fromIcsEvent(event: IcsEvent): iCalendarEvent {
  const endDateObject = computeEndDateObject(event);
  const attendees = mapAttendees(event);
  const availability = mapAvailability(event);
  const visibility = mapVisibility(event);
  const recurrence = mapRecurrence(event);

  return {
    id: event.uid,
    title: event.summary,
    description: event.description,
    start: toTemporal(event.start),
    end: endDateObject ? toTemporal(endDateObject) : toTemporal(event.start),
    allDay: event.start.type === "DATE",
    location: event.location,
    status: event.status?.toLowerCase(),
    attendees,
    url: event.url,
    availability,
    visibility,
    ...(recurrence ? { recurrence } : {}),
    color: undefined,
    readOnly: false,
  };
}

export function importEvent(ics: string): iCalendarEvent {
  const event = convertIcsEvent(undefined, ics);
  return fromIcsEvent(event);
}

export function importCalendar(ics: string): iCalendar {
  const calendar = convertIcsCalendar(undefined, ics);

  return {
    name: calendar.name,
    events: calendar.events?.map(fromIcsEvent) ?? [],
  };
}

export function isCalendar(ics: string): boolean {
  return ics.trim().toUpperCase().includes("BEGIN:VCALENDAR");
}

export function isEvent(ics: string): boolean {
  return ics.trim().toUpperCase().includes("BEGIN:VEVENT");
}
