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
    // null is meaningful: it removes the recurrence on save. The update diff
    // treats null and undefined as equal, so untouched events are unaffected.
    recurrence: values.recurrence,
    recurringEventId: values.recurringEventId,
    response: toResponse(values.attendees),
    conference: values.conference,
    visibility: values.visibility,
  } as CalendarEvent;
}
