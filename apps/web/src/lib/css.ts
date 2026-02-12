import { CalendarEvent } from "./interfaces";

/**
 * Sanitizes an arbitrary string to be safe for use as a segment in a CSS custom property name.
 * - Lowercases the input
 * - Replaces all characters except [a-z0-9-_] with '-'
 * - Collapses consecutive '-' characters
 * - Trims leading/trailing '-'
 */
function sanitize(input: string): string {
  return String(input)
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function calendarColorVariable(
  accountId: string,
  calendarId: string,
): `--calendar-color-${string}` {
  return `--calendar-color-${sanitize(accountId)}-${sanitize(calendarId)}`;
}

export function eventColorVariable(
  event: CalendarEvent,
): `--calendar-color-${string}` {
  return calendarColorVariable(
    event.calendar.provider.accountId,
    event.calendar.id,
  );
}
