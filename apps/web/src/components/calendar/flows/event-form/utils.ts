import { Temporal } from "temporal-polyfill";

import { CalendarEvent } from "@repo/api/interfaces";

function isStartDateTimeEqual(
  event: CalendarEvent,
  masterEvent: CalendarEvent,
) {
  if (
    event.start instanceof Temporal.ZonedDateTime &&
    masterEvent.start instanceof Temporal.ZonedDateTime
  ) {
    return Temporal.ZonedDateTime.compare(event.start, masterEvent.start) === 0;
  }

  if (
    event.start instanceof Temporal.Instant &&
    masterEvent.start instanceof Temporal.Instant
  ) {
    return Temporal.Instant.compare(event.start, masterEvent.start) === 0;
  }

  if (
    event.start instanceof Temporal.PlainDate &&
    masterEvent.start instanceof Temporal.PlainDate
  ) {
    return Temporal.PlainDate.compare(event.start, masterEvent.start) === 0;
  }

  return false;
}

export function isFirstInstance(
  event: CalendarEvent,
  masterEvent: CalendarEvent,
) {
  if (event.recurringEventId !== masterEvent.id) {
    return false;
  }

  return isStartDateTimeEqual(event, masterEvent);
}
