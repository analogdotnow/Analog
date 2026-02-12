import type {
  FormAttendee,
  FormValues,
} from "@/components/event-form/utils/schema";
import type { Calendar, CalendarEvent, DraftEvent } from "@/lib/interfaces";

interface ToCalendarEvent {
  values: FormValues;
  event?: CalendarEvent | DraftEvent;
  calendar?: Calendar;
}

function toResponse(attendees: FormAttendee[]) {
  const organizer = attendees.find((a) => a.organizer);

  if (!organizer) {
    return undefined;
  }

  return {
    status: organizer.status,
  };
}

export function toCalendarEvent({ values, event }: ToCalendarEvent) {
  return {
    ...event,
    type: "event",
    id: event?.id ?? values.id,
    title: values.title,
    location: values.location,
    description: values.description,
    availability: values.availability,
    allDay: values.isAllDay,
    calendar: values.calendar,
    start: values.isAllDay ? values.start.toPlainDate() : values.start,
    end: values.isAllDay ? values.end.toPlainDate() : values.end,
    readOnly: event?.readOnly ?? false,
    attendees: values.attendees.length > 0 ? values.attendees : undefined,
    recurrence: values.recurrence ?? undefined,
    recurringEventId: values.recurringEventId,
    response: toResponse(values.attendees),
    conference: values.conference,
    visibility: values.visibility,
  } as CalendarEvent;
}
