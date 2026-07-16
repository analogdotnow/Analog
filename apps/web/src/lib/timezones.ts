import { Temporal } from "temporal-polyfill";

import { toDate } from "@repo/temporal";
import TIMEZONES from "@repo/timezones";

const timezones = Intl.supportedValuesOf("timeZone").concat(["UTC"]);

function getShortName(timeZone: string, dateTime: Temporal.ZonedDateTime) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "short",
  });

  const parts = formatter.formatToParts(toDate(dateTime, { timeZone }));

  return parts.find((part) => part.type === "timeZoneName")?.value || "";
}

export interface TimeZoneDisplayValue {
  id: string;
  abbreviation: string;
  name: string;
  fullName: string;
  city?: string;
  offset: {
    sign: "-" | "+";
    label: {
      short: string;
      long: string;
    };
    value: number;
  };
}

const now = Temporal.Now.plainDateISO();

export const TIMEZONES_DISPLAY: TimeZoneDisplayValue[] = timezones
  .map((timeZone) => getDisplayValue(timeZone, now))
  .sort((a, b) => a.offset.value - b.offset.value);

function isDaylightSavingTime(dateTime: Temporal.ZonedDateTime) {
  const timeZone = TIMEZONES[dateTime.timeZoneId];

  if (!timeZone?.dst) {
    return false;
  }

  const standardOffset = timeZone.offset.findLast(
    ({ start }) => start === undefined || start <= dateTime.epochNanoseconds,
  );

  if (!standardOffset) {
    return false;
  }

  return timeZone.dst.offset.some(
    ({ start, end, value }) =>
      (start === undefined || start <= dateTime.epochNanoseconds) &&
      (end === undefined || dateTime.epochNanoseconds < end) &&
      dateTime.offsetNanoseconds === standardOffset.value + value,
  );
}

export function getDisplayValue(
  timeZoneId: string,
  date: Temporal.PlainDate,
): TimeZoneDisplayValue {
  const timeZone = TIMEZONES[timeZoneId];

  const dateTime = date.toZonedDateTime(timeZoneId);
  const title =
    timeZone?.dst && isDaylightSavingTime(dateTime) ? timeZone.dst : timeZone;

  return {
    id: timeZoneId,
    abbreviation:
      title?.abbreviation ?? fallbackAbbreviation(timeZoneId, dateTime),
    name: title?.name ?? timeZone?.name ?? fallbackName(timeZoneId),
    fullName: fallbackName(timeZoneId),
    city: timeZone?.location?.city,
    offset: {
      sign: dateTime.offsetNanoseconds < 0 ? "-" : "+",
      label: {
        short: shortOffset(dateTime),
        long: longOffset(dateTime),
      },
      value: dateTime.offsetNanoseconds,
    },
  };
}

function fallbackName(timeZoneId: string) {
  return timeZoneId
    .replace(/_/g, " ")
    .replaceAll("/", " - ")
    .replace("UTC", "Coordinated Universal Time");
}

function fallbackAbbreviation(
  timeZoneId: string,
  dateTime: Temporal.ZonedDateTime,
) {
  return getShortName(timeZoneId, dateTime).replace("GMT", "UTC");
}

function longOffset(dateTime: Temporal.ZonedDateTime) {
  return `UTC${dateTime.offset}`;
}

function shortOffset(dateTime: Temporal.ZonedDateTime) {
  const hours = Math.floor(
    Math.abs(dateTime.offsetNanoseconds) / 3600000000000,
  );

  const minutes = Math.floor(
    (Math.abs(dateTime.offsetNanoseconds) % 3600000000000) / 60000000000,
  );

  const sign = dateTime.offsetNanoseconds < 0 ? "-" : "+";

  if (minutes === 0) {
    return `UTC${sign}${hours}`;
  }

  return `UTC${sign}${hours}:${minutes}`;
}
