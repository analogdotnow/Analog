import { Temporal } from "temporal-polyfill";

import type {
  FormAttendee,
  FormValues,
} from "@/components/event-form/utils/schema";
import type { Calendar, CalendarEvent, DraftEvent } from "@/lib/interfaces";
import { createEventId, isDraftEvent } from "@/lib/utils/calendar";

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
  defaultTimeZone: string;
}

export function parseDraftEvent({
  event,
  defaultCalendar,
  defaultTimeZone,
}: ParseDraftEventOptions): FormValues {
  const timeZone = defaultCalendar.timeZone ?? defaultTimeZone;

  const start = parseDateTime(event.start, { defaultTimeZone: timeZone });

  const end = parseDateTime(event.end, { defaultTimeZone: timeZone });

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
    calendar: event?.calendar ?? {
      id: defaultCalendar.id,
      provider: defaultCalendar.provider,
    },
    conference: event.conference,
    visibility: event.visibility ?? "default",
  };
}

interface ParseCalendarEventOptions {
  event: CalendarEvent;
  defaultTimeZone: string;
}

export function parseCalendarEvent({
  event,
  defaultTimeZone,
}: ParseCalendarEventOptions): FormValues {
  const start = parseDateTime(event.start, { defaultTimeZone });

  const end = parseDateTime(event.end, { defaultTimeZone });

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
    calendar: event.calendar,
    conference: event.conference,
    visibility: event.visibility ?? "default",
  };
}

export function parseFormValues(
  event: CalendarEvent,
  defaultCalendar: Calendar,
  defaultTimeZone: string,
): FormValues {
  if (isDraftEvent(event)) {
    return parseDraftEvent({ event, defaultCalendar, defaultTimeZone });
  }

  return parseCalendarEvent({ event, defaultTimeZone });
}
