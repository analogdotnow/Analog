import { Temporal } from "temporal-polyfill";

import type { CalendarSettings } from "@/atoms/calendar-settings";
import type { Calendar, CalendarEvent, DraftEvent } from "@/lib/interfaces";
import { createEventId, isDraftEvent } from "@/lib/utils/calendar";
import type { FormAttendee, FormValues } from "../schema";

interface ParseDateTimeOptions {
  defaultTimeZone: string;
}

function parseDateTime(
  date: Temporal.ZonedDateTime | Temporal.Instant | Temporal.PlainDate,
  { defaultTimeZone }: ParseDateTimeOptions,
): Temporal.ZonedDateTime {
  if (date instanceof Temporal.ZonedDateTime) {
    return date;
  }

  if (date instanceof Temporal.Instant) {
    return date.toZonedDateTimeISO(defaultTimeZone);
  }

  return date.toZonedDateTime(defaultTimeZone);
}

export function parseAttendees(
  event: CalendarEvent | DraftEvent,
): FormAttendee[] {
  return (
    event.attendees?.map((attendee) => ({
      id: attendee.id,
      email: attendee.email ?? "",
      status: attendee.status,
      type: attendee.type,
      name: attendee.name ?? "",
      organizer: attendee.organizer,
      comment: attendee.comment,
    })) ?? []
  );
}

interface ParseDraftEventOptions {
  event: DraftEvent;
  defaultCalendar: Calendar;
  settings: CalendarSettings;
}

export function parseDraftEvent({
  event,
  defaultCalendar,
  settings,
}: ParseDraftEventOptions): FormValues {
  const defaultTimeZone = defaultCalendar.timeZone ?? settings.defaultTimeZone;

  const start = parseDateTime(event.start, { defaultTimeZone });

  const end = parseDateTime(event.end, { defaultTimeZone });

  return {
    id: event?.id ?? createEventId(),
    type: "draft",
    title: event.title ?? "",
    start,
    end,
    location: event.location ?? "",
    description: event.description ?? "",
    isAllDay: event.allDay ?? false,
    availability: event.availability ?? "busy",
    recurrence: event.recurrence,
    recurringEventId: event.recurringEventId,
    attendees: parseAttendees(event),
    calendar: {
      accountId: event?.accountId ?? defaultCalendar.accountId,
      calendarId: event?.calendarId ?? defaultCalendar.id,
    },
    providerId: event?.providerId ?? defaultCalendar.providerId,
    conference: event.conference,
    visibility: event.visibility ?? "default",
  };
}

interface ParseCalendarEventOptions {
  event: CalendarEvent;
  settings: CalendarSettings;
}

export function parseCalendarEvent({
  event,
  settings,
}: ParseCalendarEventOptions): FormValues {
  const start = parseDateTime(event.start, settings);

  const end = parseDateTime(event.end, settings);

  return {
    id: event.id,
    type: "event",
    title: event.title ?? "",
    start,
    end,
    location: event.location ?? "",
    description: event.description ?? "",
    isAllDay: event.allDay ?? false,
    availability: event.availability ?? "busy",
    recurrence: event.recurrence,
    recurringEventId: event.recurringEventId,
    attendees: parseAttendees(event),
    calendar: {
      accountId: event.accountId ?? "",
      calendarId: event.calendarId ?? "",
    },
    providerId: event.providerId,
    conference: event.conference,
    visibility: event.visibility ?? "default",
  };
}

export function parseFormValues(
  event: CalendarEvent,
  defaultCalendar: Calendar,
  settings: CalendarSettings,
): FormValues {
  if (isDraftEvent(event)) {
    return parseDraftEvent({ event, defaultCalendar, settings });
  }

  return parseCalendarEvent({ event, settings });
}
