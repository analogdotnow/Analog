import { Temporal } from "temporal-polyfill";

import type { CalendarFreeBusy } from "../../../interfaces";
import type { GoogleCalendarFreeBusyResponse } from "../interfaces";

export function parseGoogleCalendarFreeBusy(
  response: GoogleCalendarFreeBusyResponse,
): CalendarFreeBusy[] {
  return Object.entries(response.calendars).map<CalendarFreeBusy>(
    ([scheduleId, calendar]) => {
      const error = calendar.errors?.[0];

      if (error) {
        return {
          scheduleId,
          message: `Failed to get free/busy for ${scheduleId}`,
          code: error.reason ?? "unknown",
        };
      }

      return {
        scheduleId,
        busy: calendar.busy.map((slot) => ({
          start: Temporal.Instant.from(slot.start).toZonedDateTimeISO("UTC"),
          end: Temporal.Instant.from(slot.end).toZonedDateTimeISO("UTC"),
          status: "busy",
        })),
      };
    },
  );
}
