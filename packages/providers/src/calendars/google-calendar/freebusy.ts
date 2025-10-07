import { Temporal } from "temporal-polyfill";

import type { CalendarFreeBusy, FreeBusySlot } from "../../interfaces";
import type {
  GoogleCalendarFreeBusyResponse,
  GoogleCalendarFreeBusyResponseCalendars,
} from "./interfaces";

function parseGoogleCalendarFreeBusySlot(
  calendar: GoogleCalendarFreeBusyResponseCalendars,
) {
  if (!calendar.busy) {
    return [];
  }

  const slots: FreeBusySlot[] = [];

  for (const slot of calendar.busy) {
    if (!slot.start || !slot.end) {
      continue;
    }

    slots.push({
      start: Temporal.Instant.from(slot.start).toZonedDateTimeISO("UTC"),
      end: Temporal.Instant.from(slot.end).toZonedDateTimeISO("UTC"),
      status: "busy",
    });
  }

  return slots;
}

export function parseGoogleCalendarFreeBusySlots(
  scheduleId: string,
  calendar: GoogleCalendarFreeBusyResponseCalendars,
) {
  // TODO: Handle errors in calendar.errors
  return {
    scheduleId,
    busy: parseGoogleCalendarFreeBusySlot(calendar),
  };
}

export function parseGoogleCalendarFreeBusy(
  response: GoogleCalendarFreeBusyResponse,
): CalendarFreeBusy[] {
  if (!response.calendars) {
    return [];
  }

  const result: CalendarFreeBusy[] = [];

  for (const [id, data] of Object.entries(response.calendars)) {
    result.push(parseGoogleCalendarFreeBusySlots(id, data));
  }

  return result;
}
