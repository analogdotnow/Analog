import type { FormValues } from "@/components/event-form/utils/schema";
import type { Calendar, CalendarEvent, DraftEvent } from "@/lib/interfaces";

interface ToCalendarEvent {
  values: FormValues;
  event?: CalendarEvent | DraftEvent;
  calendar?: Calendar;
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
    allDay: values.allDay,
    calendar: values.calendar,
    start: values.allDay ? values.start.toPlainDate() : values.start,
    end: values.allDay ? values.end.toPlainDate() : values.end,
    readOnly: event?.readOnly ?? false,
    attendees: values.attendees.length > 0 ? values.attendees : undefined,
    // null is meaningful: it removes the recurrence on save. The update diff
    // treats null and undefined as equal, so untouched events are unaffected.
    recurrence: values.recurrence,
    recurringEventId: values.recurringEventId,
    response: values.response,
    conference: values.conference,
    visibility: values.visibility,
  } as CalendarEvent;
}
