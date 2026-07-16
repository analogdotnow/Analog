import { Temporal } from "temporal-polyfill";

import type { CalendarEvent } from "@/lib/interfaces";

function isTemporal(
  value: unknown,
): value is Temporal.PlainDate | Temporal.Instant | Temporal.ZonedDateTime {
  return (
    value instanceof Temporal.PlainDate ||
    value instanceof Temporal.Instant ||
    value instanceof Temporal.ZonedDateTime
  );
}

function isSameDateValue(
  a: Temporal.PlainDate | Temporal.Instant | Temporal.ZonedDateTime,
  b: Temporal.PlainDate | Temporal.Instant | Temporal.ZonedDateTime,
) {
  if (a instanceof Temporal.PlainDate && b instanceof Temporal.PlainDate) {
    return a.equals(b);
  }

  if (a instanceof Temporal.Instant && b instanceof Temporal.Instant) {
    return a.equals(b);
  }

  if (
    a instanceof Temporal.ZonedDateTime &&
    b instanceof Temporal.ZonedDateTime
  ) {
    // equals() also compares time zones, so a pure zone change is a change.
    return a.equals(b);
  }

  return false;
}

function isDeepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) {
    return true;
  }

  if (isTemporal(a) || isTemporal(b)) {
    return isTemporal(a) && isTemporal(b) && isSameDateValue(a, b);
  }

  if (Array.isArray(a) || Array.isArray(b)) {
    return (
      Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((item, index) => isDeepEqual(item, b[index]))
    );
  }

  if (
    typeof a !== "object" ||
    typeof b !== "object" ||
    a === null ||
    b === null
  ) {
    return false;
  }

  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);

  return Array.from(keys).every((key) =>
    isDeepEqual(
      (a as Record<string, unknown>)[key],
      (b as Record<string, unknown>)[key],
    ),
  );
}

// The changed, non-envelope fields of an edit: absent means "leave as is",
// null means "clear". Times are emitted as a unit (start/end/allDay) so
// providers never see a half-updated all-day transition. Text fields compare
// with "" as the empty value, so clearing an unset field is not a change.
function diffEventFields(event: CalendarEvent, previous: CalendarEvent) {
  const timeChanged =
    event.allDay !== previous.allDay ||
    !isSameDateValue(event.start, previous.start) ||
    !isSameDateValue(event.end, previous.end);

  return {
    ...((event.title ?? "") === (previous.title ?? "")
      ? {}
      : { title: event.title ?? "" }),
    ...((event.description ?? "") === (previous.description ?? "")
      ? {}
      : { description: event.description ?? null }),
    ...((event.location ?? "") === (previous.location ?? "")
      ? {}
      : { location: event.location ?? null }),
    ...(event.availability === previous.availability ||
    event.availability === undefined
      ? {}
      : { availability: event.availability }),
    ...(event.visibility === previous.visibility ||
    event.visibility === undefined
      ? {}
      : { visibility: event.visibility }),
    ...((event.color ?? null) === (previous.color ?? null)
      ? {}
      : { color: event.color ?? null }),
    ...(timeChanged
      ? { start: event.start, end: event.end, allDay: event.allDay }
      : {}),
    ...(isDeepEqual(event.attendees ?? [], previous.attendees ?? [])
      ? {}
      : { attendees: event.attendees ?? [] }),
    ...(isDeepEqual(event.conference ?? null, previous.conference ?? null)
      ? {}
      : { conference: event.conference ?? null }),
    ...(isDeepEqual(event.recurrence ?? null, previous.recurrence ?? null)
      ? {}
      : { recurrence: event.recurrence ?? null }),
  };
}

export function isMovedBetweenCalendars(
  updated: CalendarEvent,
  previous: CalendarEvent,
) {
  return (
    updated.calendar.provider.accountId !==
      previous.calendar.provider.accountId ||
    updated.calendar.id !== previous.calendar.id
  );
}

interface BuildResponseOptions {
  sendUpdate?: boolean;
}

function buildResponse(
  event: CalendarEvent,
  previous: CalendarEvent,
  options: BuildResponseOptions,
) {
  const status = event.response?.status ?? "unknown";
  const statusChanged = status !== (previous.response?.status ?? "unknown");

  if (!options.sendUpdate && !statusChanged) {
    return {};
  }

  return {
    response: {
      status,
      sendUpdate: options.sendUpdate ?? false,
    },
  };
}

function buildMove(event: CalendarEvent, previous: CalendarEvent) {
  if (!isMovedBetweenCalendars(event, previous)) {
    return {};
  }

  return {
    move: {
      source: previous.calendar,
      destination: event.calendar,
    },
  };
}

interface BuildUpdateEventOptions {
  sendUpdate?: boolean;
}

export function buildUpdateEvent(
  event: CalendarEvent,
  previous: CalendarEvent,
  options: BuildUpdateEventOptions,
) {
  const isCalendarChanged = isMovedBetweenCalendars(event, previous);

  return {
    data: {
      ...diffEventFields(event, previous),
      id: event.id,
      calendar: isCalendarChanged ? previous.calendar : event.calendar,
      readOnly: event.readOnly,
      ...(previous.etag ? { etag: previous.etag } : {}),
      ...(previous.metadata ? { metadata: previous.metadata } : {}),
      ...(previous.recurringEventId
        ? { recurringEventId: previous.recurringEventId }
        : {}),
      ...buildResponse(event, previous, options),
    },
    ...buildMove(event, previous),
  };
}

export type UpdateEventPayload = ReturnType<typeof buildUpdateEvent>;

// The envelope identifies and routes a patch; it is carried on every update,
// so only fields outside it are actual changes.
const PATCH_ENVELOPE = new Set([
  "id",
  "calendar",
  "readOnly",
  "etag",
  "metadata",
  "recurringEventId",
]);

export function isEmptyUpdate(payload: UpdateEventPayload) {
  if (payload.move) {
    return false;
  }

  return Object.keys(payload.data).every((key) => PATCH_ENVELOPE.has(key));
}

interface BuildUpdateSeriesOptions {
  sendUpdate?: boolean;
}

// Whole-series edits retarget the occurrence's changed fields at the master.
// Time fields still transfer verbatim for now; deriving them from the master
// comes with master-first series updates.
export function buildUpdateSeries(
  event: CalendarEvent,
  previous: CalendarEvent,
  options: BuildUpdateSeriesOptions,
) {
  const isCalendarChanged = isMovedBetweenCalendars(event, previous);

  return {
    data: {
      ...diffEventFields(event, previous),
      id: event.recurringEventId!,
      calendar: isCalendarChanged ? previous.calendar : event.calendar,
      readOnly: event.readOnly,
      ...(previous.metadata ? { metadata: previous.metadata } : {}),
      ...buildResponse(event, previous, options),
    },
    ...buildMove(event, previous),
  };
}
