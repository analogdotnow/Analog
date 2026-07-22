import type {
  Attendee as MicrosoftEventAttendee,
  DayOfWeek as MicrosoftDayOfWeek,
  Event as MicrosoftEvent,
  ResponseStatus as MicrosoftEventAttendeeResponseStatus,
  PatternedRecurrence,
  RecurrencePattern,
  RecurrenceRange,
  WeekIndex,
} from "@analog/microsoft-calendar";
import { Temporal } from "temporal-polyfill";

import type {
  CreateEventInput,
  MicrosoftEventMetadata,
  UpdateEventPatch,
} from "@repo/schemas";
import { toPlainDate, toZonedDateTime } from "@repo/temporal";

import type {
  Attendee,
  AttendeeStatus,
  Calendar,
  CalendarEvent,
  Recurrence,
  Weekday,
} from "../../../interfaces";
import { parseDateTime, parseTimeZone, toMicrosoftDate } from "../utils";
import {
  parseMicrosoftConference,
  toMicrosoftConferenceData,
} from "./conferences/utils";

function parseDate(date: string) {
  return Temporal.PlainDate.from(date);
}

const WEEKDAY_TO_MICROSOFT_DAY: Record<Weekday, MicrosoftDayOfWeek> = {
  MO: "monday",
  TU: "tuesday",
  WE: "wednesday",
  TH: "thursday",
  FR: "friday",
  SA: "saturday",
  SU: "sunday",
};

const MICROSOFT_DAY_TO_WEEKDAY: Record<MicrosoftDayOfWeek, Weekday> = {
  monday: "MO",
  tuesday: "TU",
  wednesday: "WE",
  thursday: "TH",
  friday: "FR",
  saturday: "SA",
  sunday: "SU",
};

const WEEK_INDEX_TO_SET_POS: Record<WeekIndex, number> = {
  first: 1,
  second: 2,
  third: 3,
  fourth: 4,
  last: -1,
};

// ISO dayOfWeek is 1 (Monday) through 7 (Sunday).
const ISO_DAY_TO_MICROSOFT_DAY: MicrosoftDayOfWeek[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export class RecurrenceConversionError extends Error {
  constructor(message: string) {
    super(`Cannot convert recurrence for Microsoft Calendar: ${message}`);
    this.name = "RecurrenceConversionError";
  }
}

function toSetPosWeekIndex(recurrence: Recurrence): WeekIndex {
  const bySetPos = recurrence.bySetPos;

  if (!bySetPos || bySetPos.length !== 1) {
    throw new RecurrenceConversionError(
      "bySetPos must contain exactly one of 1, 2, 3, 4, or -1",
    );
  }

  switch (bySetPos[0]) {
    case 1:
      return "first";
    case 2:
      return "second";
    case 3:
      return "third";
    case 4:
      return "fourth";
    case -1:
      return "last";
    default:
      throw new RecurrenceConversionError(
        `bySetPos value ${bySetPos[0]} has no Microsoft equivalent (supported: 1, 2, 3, 4, -1)`,
      );
  }
}

function toMicrosoftDaysOfWeek(byDay: Weekday[]): MicrosoftDayOfWeek[] {
  return byDay.map((day) => WEEKDAY_TO_MICROSOFT_DAY[day]);
}

function toMicrosoftDayOfWeek(dayOfWeek: number): MicrosoftDayOfWeek {
  const day = ISO_DAY_TO_MICROSOFT_DAY[dayOfWeek - 1];

  if (!day) {
    throw new RecurrenceConversionError(`invalid ISO weekday ${dayOfWeek}`);
  }

  return day;
}

function assertConvertibleRecurrence(recurrence: Recurrence) {
  const unsupported: string[] = [];

  if (recurrence.byYearDay?.length) unsupported.push("byYearDay");
  if (recurrence.byWeekNo?.length) unsupported.push("byWeekNo");
  if (recurrence.byHour?.length) unsupported.push("byHour");
  if (recurrence.byMinute?.length) unsupported.push("byMinute");
  if (recurrence.bySecond?.length) unsupported.push("bySecond");
  if (recurrence.rDate?.length) unsupported.push("rDate");
  if (recurrence.exDate?.length) unsupported.push("exDate");

  if (recurrence.rscale && recurrence.rscale !== "GREGORIAN") {
    unsupported.push(`rscale=${recurrence.rscale}`);
  }

  if (recurrence.skip && recurrence.skip !== "OMIT") {
    unsupported.push(`skip=${recurrence.skip}`);
  }

  if (unsupported.length > 0) {
    throw new RecurrenceConversionError(
      `unsupported rule parts: ${unsupported.join(", ")}`,
    );
  }

  if (recurrence.count !== undefined && recurrence.until !== undefined) {
    throw new RecurrenceConversionError(
      "count and until are mutually exclusive",
    );
  }

  if (recurrence.freq === "WEEKLY" && recurrence.bySetPos?.length) {
    throw new RecurrenceConversionError("bySetPos is not supported for WEEKLY");
  }

  if (
    recurrence.until !== undefined &&
    !(recurrence.until instanceof Temporal.PlainDate)
  ) {
    throw new RecurrenceConversionError(
      "Microsoft recurrence only supports date-valued until",
    );
  }
}

function toMicrosoftRecurrencePattern(
  recurrence: Recurrence,
  start: Temporal.ZonedDateTime,
): RecurrencePattern {
  const interval = recurrence.interval ?? 1;

  if (recurrence.byMonth && recurrence.freq !== "YEARLY") {
    throw new RecurrenceConversionError(
      `byMonth is only supported for YEARLY, got ${recurrence.freq}`,
    );
  }

  if (
    recurrence.byMonthDay &&
    recurrence.freq !== "MONTHLY" &&
    recurrence.freq !== "YEARLY"
  ) {
    throw new RecurrenceConversionError(
      `byMonthDay is only supported for MONTHLY and YEARLY, got ${recurrence.freq}`,
    );
  }

  switch (recurrence.freq) {
    case "DAILY": {
      if (recurrence.byDay?.length) {
        throw new RecurrenceConversionError("byDay is not supported for DAILY");
      }

      return { type: "daily", interval };
    }
    case "WEEKLY": {
      return {
        type: "weekly",
        interval,
        daysOfWeek: recurrence.byDay?.length
          ? toMicrosoftDaysOfWeek(recurrence.byDay)
          : [toMicrosoftDayOfWeek(start.dayOfWeek)],
        firstDayOfWeek: WEEKDAY_TO_MICROSOFT_DAY[recurrence.wkst ?? "MO"],
      };
    }
    case "MONTHLY": {
      if (recurrence.byDay?.length) {
        return {
          type: "relativeMonthly",
          interval,
          daysOfWeek: toMicrosoftDaysOfWeek(recurrence.byDay),
          index: toSetPosWeekIndex(recurrence),
        };
      }

      if (recurrence.byMonthDay && recurrence.byMonthDay.length !== 1) {
        throw new RecurrenceConversionError(
          "byMonthDay must contain exactly one day for MONTHLY",
        );
      }

      const dayOfMonth = recurrence.byMonthDay?.[0] ?? start.day;

      // RFC 5545 skips months without this day, but Outlook substitutes the
      // month's last day, silently changing the rule's meaning.
      if (dayOfMonth > 28) {
        throw new RecurrenceConversionError(
          `MONTHLY on day ${dayOfMonth} means "last day" in short months on Outlook, unlike the RFC rule`,
        );
      }

      return { type: "absoluteMonthly", interval, dayOfMonth };
    }
    case "YEARLY": {
      if (recurrence.byMonth && recurrence.byMonth.length !== 1) {
        throw new RecurrenceConversionError(
          "byMonth must contain exactly one month for YEARLY",
        );
      }

      const month = recurrence.byMonth?.[0] ?? start.month;

      if (recurrence.byDay?.length) {
        return {
          type: "relativeYearly",
          interval,
          month,
          daysOfWeek: toMicrosoftDaysOfWeek(recurrence.byDay),
          index: toSetPosWeekIndex(recurrence),
        };
      }

      if (recurrence.byMonthDay && recurrence.byMonthDay.length !== 1) {
        throw new RecurrenceConversionError(
          "byMonthDay must contain exactly one day for YEARLY",
        );
      }

      const dayOfMonth = recurrence.byMonthDay?.[0] ?? start.day;

      // Same Outlook substitution as MONTHLY: Feb 29 and days beyond a fixed
      // month's length roll to the month's last day instead of skipping.
      const stableDays =
        month === 2 ? 28 : [4, 6, 9, 11].includes(month) ? 30 : 31;

      if (dayOfMonth > stableDays) {
        throw new RecurrenceConversionError(
          `YEARLY on month ${month}, day ${dayOfMonth} does not occur every year and rolls to the month's last day on Outlook`,
        );
      }

      return { type: "absoluteYearly", interval, month, dayOfMonth };
    }
    default: {
      throw new RecurrenceConversionError(
        `frequency ${recurrence.freq ?? "(none)"} is not supported`,
      );
    }
  }
}

interface ToMicrosoftRecurrenceOptions {
  recurrence: Recurrence;
  // The series master's start, never a selected occurrence's: Graph requires
  // range.startDate to match the master event's start date.
  start: Temporal.PlainDate | Temporal.Instant | Temporal.ZonedDateTime;
  recurrenceTimeZone?: string;
}

export function toMicrosoftRecurrence({
  recurrence,
  start,
  recurrenceTimeZone,
}: ToMicrosoftRecurrenceOptions): PatternedRecurrence {
  assertConvertibleRecurrence(recurrence);

  // Graph gets the zone verbatim (it may be a Windows name); Temporal
  // conversions need the IANA equivalent.
  const timeZone =
    recurrenceTimeZone ??
    (start instanceof Temporal.ZonedDateTime ? start.timeZoneId : "UTC");
  const conversionTimeZone = parseTimeZone(timeZone) ?? "UTC";

  // Graph expects range dates and pattern defaults (weekday, day of month)
  // in recurrenceTimeZone, not the zone the event happened to be parsed in
  // (events.get parses in the requested Prefer time zone, typically UTC).
  const startDate = toPlainDate(start, { timeZone: conversionTimeZone });

  const range: RecurrenceRange = {
    startDate: startDate.toString(),
    recurrenceTimeZone: timeZone,
    ...(recurrence.count !== undefined
      ? { type: "numbered", numberOfOccurrences: recurrence.count }
      : recurrence.until !== undefined
        ? {
            type: "endDate",
            endDate: toPlainDate(recurrence.until, {
              timeZone: conversionTimeZone,
            }).toString(),
          }
        : { type: "noEnd" }),
  };

  return {
    pattern: toMicrosoftRecurrencePattern(
      recurrence,
      toZonedDateTime(start, { timeZone: conversionTimeZone }),
    ),
    range,
  };
}

export function parseMicrosoftRecurrence(
  recurrence: PatternedRecurrence,
): Recurrence | undefined {
  const { pattern, range } = recurrence;

  if (!pattern?.type) {
    return undefined;
  }

  const shared: Recurrence = {
    ...(pattern.interval !== undefined ? { interval: pattern.interval } : {}),
    ...(range?.type === "numbered" && range.numberOfOccurrences !== undefined
      ? { count: range.numberOfOccurrences }
      : {}),
    // Graph's endDate is inclusive, matching RFC 5545 UNTIL for date values.
    ...(range?.type === "endDate" && range.endDate
      ? { until: Temporal.PlainDate.from(range.endDate) }
      : {}),
  };

  const byDay = pattern.daysOfWeek?.map((day) => MICROSOFT_DAY_TO_WEEKDAY[day]);
  const wkst = pattern.firstDayOfWeek
    ? MICROSOFT_DAY_TO_WEEKDAY[pattern.firstDayOfWeek]
    : undefined;

  switch (pattern.type) {
    case "daily":
      return { ...shared, freq: "DAILY" };
    case "weekly":
      return {
        ...shared,
        freq: "WEEKLY",
        ...(byDay?.length ? { byDay } : {}),
        // Graph defaults firstDayOfWeek to sunday, unlike RFC 5545's implicit
        // WKST=MO, so a missing field must parse as an explicit SU.
        wkst: wkst ?? "SU",
      };
    case "absoluteMonthly":
      return {
        ...shared,
        freq: "MONTHLY",
        ...(pattern.dayOfMonth !== undefined
          ? { byMonthDay: [pattern.dayOfMonth] }
          : {}),
      };
    case "relativeMonthly":
      return {
        ...shared,
        freq: "MONTHLY",
        ...(byDay?.length ? { byDay } : {}),
        bySetPos: [WEEK_INDEX_TO_SET_POS[pattern.index ?? "first"]],
      };
    case "absoluteYearly":
      return {
        ...shared,
        freq: "YEARLY",
        ...(pattern.month !== undefined ? { byMonth: [pattern.month] } : {}),
        ...(pattern.dayOfMonth !== undefined
          ? { byMonthDay: [pattern.dayOfMonth] }
          : {}),
      };
    case "relativeYearly":
      return {
        ...shared,
        freq: "YEARLY",
        ...(pattern.month !== undefined ? { byMonth: [pattern.month] } : {}),
        ...(byDay?.length ? { byDay } : {}),
        bySetPos: [WEEK_INDEX_TO_SET_POS[pattern.index ?? "first"]],
      };
    default:
      return undefined;
  }
}

interface ParseMicrosoftEventOptions {
  calendar: Calendar;
  event: MicrosoftEvent;
}

function parseResponseStatus(
  event: MicrosoftEvent,
): AttendeeStatus | undefined {
  return event.responseStatus?.response
    ? parseMicrosoftAttendeeStatus(event.responseStatus.response)
    : undefined;
}

function parseMicrosoftVisibility(
  sensitivity: MicrosoftEvent["sensitivity"],
): CalendarEvent["visibility"] {
  if (sensitivity === "normal") return "default";
  if (sensitivity === "personal") return "private";
  return sensitivity;
}

function toMicrosoftSensitivity(
  visibility: CreateEventInput["visibility"],
): MicrosoftEvent["sensitivity"] {
  if (visibility === "default") return "normal";
  if (visibility === "public") return "normal";
  return visibility;
}

function toMicrosoftAttendee(attendee: Attendee): MicrosoftEventAttendee {
  return {
    emailAddress: {
      address: attendee.email,
      name: attendee.name,
    },
    type: attendee.type,
  };
}

export function parseMicrosoftEvent({
  calendar,
  event,
}: ParseMicrosoftEventOptions): CalendarEvent {
  const { start, end, isAllDay } = event;

  if (!start || !end) {
    throw new Error("Event start or end is missing");
  }

  const responseStatus = parseResponseStatus(event);
  const recurrence = event.recurrence
    ? parseMicrosoftRecurrence(event.recurrence)
    : undefined;

  return {
    id: event.id!,
    title: event.subject!,
    description: event.body?.content ?? undefined,
    start: isAllDay
      ? parseDate(start.dateTime!)
      : parseDateTime(start.dateTime!, start.timeZone!),
    end: isAllDay
      ? parseDate(end.dateTime!)
      : parseDateTime(end.dateTime!, end.timeZone!),
    allDay: isAllDay ?? false,
    location: event.location?.displayName ?? undefined,
    availability: event.showAs === "free" ? "free" : "busy",
    visibility: parseMicrosoftVisibility(event.sensitivity),
    attendees: event.attendees?.map(parseMicrosoftAttendee) ?? [],
    url: event.webLink ?? undefined,
    etag: event["@odata.etag"],
    calendar: {
      id: calendar.id,
      provider: calendar.provider,
    },
    readOnly: calendar.readOnly,
    conference: parseMicrosoftConference(event),
    recurringEventId: event.seriesMasterId ?? undefined,
    ...(recurrence ? { recurrence } : {}),
    ...(responseStatus ? { response: { status: responseStatus } } : {}),
    ...(event.createdDateTime
      ? { createdAt: Temporal.Instant.from(event.createdDateTime) }
      : {}),
    ...(event.lastModifiedDateTime
      ? { updatedAt: Temporal.Instant.from(event.lastModifiedDateTime) }
      : {}),
    metadata: {
      ...(event.originalStartTimeZone
        ? {
            originalStartTimeZone: {
              raw: event.originalStartTimeZone,
              parsed: event.originalStartTimeZone
                ? parseTimeZone(event.originalStartTimeZone)
                : undefined,
            },
          }
        : {}),
      ...(event.originalEndTimeZone
        ? {
            originalEndTimeZone: {
              raw: event.originalEndTimeZone,
              parsed: event.originalEndTimeZone
                ? parseTimeZone(event.originalEndTimeZone)
                : undefined,
            },
          }
        : {}),
      onlineMeeting: event.onlineMeeting,
      ...(event.recurrence?.range?.recurrenceTimeZone
        ? { recurrenceTimeZone: event.recurrence.range.recurrenceTimeZone }
        : {}),
    },
  } as CalendarEvent;
}

export function toMicrosoftEvent(event: CreateEventInput): MicrosoftEvent {
  const metadata = toMicrosoftMetadata(event.metadata);

  return {
    subject: event.title,
    ...(event.description
      ? {
          body: { contentType: "text", content: event.description },
        }
      : {}),
    start: toMicrosoftDate({
      value: event.start,
      originalTimeZone: metadata?.originalStartTimeZone,
    }),
    end: toMicrosoftDate({
      value: event.end,
      originalTimeZone: metadata?.originalEndTimeZone,
    }),
    isAllDay: event.allDay ?? false,
    ...(event.location ? { location: { displayName: event.location } } : {}),
    ...(event.conference ? toMicrosoftConferenceData(event.conference) : {}),
    showAs: event.availability,
    sensitivity: toMicrosoftSensitivity(event.visibility),
    attendees: event.attendees?.map(toMicrosoftAttendee),
    ...(event.recurrence
      ? {
          recurrence: toMicrosoftRecurrence({
            recurrence: event.recurrence,
            start: event.start,
            recurrenceTimeZone: metadata?.recurrenceTimeZone,
          }),
        }
      : {}),
  };
}

interface ToMicrosoftEventPatchOptions {
  // Resolved master start for recurrence serialization; Graph requires
  // range.startDate to match the master event's start date, which a sparse
  // patch does not necessarily carry.
  startForRecurrence?:
    | Temporal.PlainDate
    | Temporal.Instant
    | Temporal.ZonedDateTime;
}

function toMicrosoftMetadata(
  metadata: CreateEventInput["metadata"],
): MicrosoftEventMetadata {
  if (!metadata) return {};
  if ("originalStartTimeZone" in metadata) return metadata;
  if ("originalEndTimeZone" in metadata) return metadata;
  if ("onlineMeeting" in metadata) return metadata;
  if ("recurrenceTimeZone" in metadata) return metadata;
  return {};
}

function toMicrosoftRecurrencePatch(
  recurrence: UpdateEventPatch["recurrence"],
  start:
    | Temporal.PlainDate
    | Temporal.Instant
    | Temporal.ZonedDateTime
    | undefined,
  recurrenceTimeZone?: string,
) {
  if (recurrence === undefined) return {};
  if (recurrence === null) return { recurrence: null };

  if (!start) {
    throw new RecurrenceConversionError(
      "a recurrence change requires the event start to anchor range.startDate",
    );
  }

  return {
    recurrence: toMicrosoftRecurrence({
      recurrence,
      start,
      recurrenceTimeZone,
    }),
  };
}

export function toMicrosoftEventPatch(
  event: UpdateEventPatch,
  options: ToMicrosoftEventPatchOptions = {},
): MicrosoftEvent {
  const metadata = toMicrosoftMetadata(event.metadata);

  const recurrenceStart = options.startForRecurrence ?? event.start;

  return {
    ...(event.title !== undefined ? { subject: event.title } : {}),
    ...(event.description !== undefined
      ? {
          body: { contentType: "text", content: event.description ?? "" },
        }
      : {}),
    ...(event.start !== undefined
      ? {
          start: toMicrosoftDate({
            value: event.start,
            originalTimeZone: metadata?.originalStartTimeZone,
          }),
        }
      : {}),
    ...(event.end !== undefined
      ? {
          end: toMicrosoftDate({
            value: event.end,
            originalTimeZone: metadata?.originalEndTimeZone,
          }),
        }
      : {}),
    ...(event.allDay !== undefined ? { isAllDay: event.allDay } : {}),
    ...(event.location !== undefined
      ? { location: { displayName: event.location } }
      : {}),
    ...(event.availability !== undefined ? { showAs: event.availability } : {}),
    ...(event.visibility !== undefined
      ? { sensitivity: toMicrosoftSensitivity(event.visibility) }
      : {}),
    ...(event.attendees !== undefined
      ? { attendees: event.attendees.map(toMicrosoftAttendee) }
      : {}),
    // Graph has no conference field to null out: clearing demotes the online
    // meeting via isOnlineMeeting=false with the provider reset to "unknown".
    ...(event.conference === null
      ? { isOnlineMeeting: false, onlineMeetingProvider: "unknown" as const }
      : event.conference
        ? toMicrosoftConferenceData(event.conference)
        : {}),
    ...toMicrosoftRecurrencePatch(
      event.recurrence,
      recurrenceStart,
      metadata.recurrenceTimeZone,
    ),
  };
}

function parseMicrosoftAttendeeStatus(
  status: MicrosoftEventAttendeeResponseStatus["response"],
): AttendeeStatus {
  if (status === "notResponded" || status === "none") {
    return "unknown";
  }

  if (status === "accepted" || status === "organizer") {
    return "accepted";
  }

  if (status === "tentativelyAccepted") {
    return "tentative";
  }

  if (status === "declined") {
    return "declined";
  }

  return "unknown";
}

export function parseMicrosoftAttendee(
  attendee: MicrosoftEventAttendee,
): Attendee {
  return {
    email: attendee.emailAddress!.address!,
    name: attendee.emailAddress?.name ?? undefined,
    status: parseMicrosoftAttendeeStatus(attendee.status?.response),
    type: attendee.type!,
  };
}
