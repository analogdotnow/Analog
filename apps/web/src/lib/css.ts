// Utilities for working with CSS custom properties and identifiers

/**
 * Sanitizes an arbitrary string to be safe for use as a segment in a CSS custom property name.
 * - Lowercases the input
 * - Replaces all characters except [a-z0-9-_] with '-'
 * - Collapses consecutive '-' characters
 * - Trims leading/trailing '-'
 */
function sanitizeAsCssIdentifierSegment(input: string): string {
  const lowerCased = String(input).toLowerCase();
  const replaced = lowerCased.replace(/[^a-z0-9_-]/g, "-");
  const collapsed = replaced.replace(/-+/g, "-");
  return collapsed.replace(/^-+/, "").replace(/-+$/, "");
}

/**
 * Builds the CSS custom property name used to store a calendar's color.
 * Uses both accountId and calendarId to ensure uniqueness across accounts.
 * Example output: `--calendar-color-account-123-my-calendar-id`
 */
export function calendarColorVariable(
  accountId: string,
  calendarId: string,
): `--calendar-color-${string}` {
  const sanitizedAccountId = sanitizeAsCssIdentifierSegment(accountId);
  const sanitizedCalendarId = sanitizeAsCssIdentifierSegment(calendarId);
  return `--calendar-color-${sanitizedAccountId}-${sanitizedCalendarId}`;
}
