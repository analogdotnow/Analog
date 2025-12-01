import { getTimeZones } from "@vvo/tzdb";
import { Temporal } from "temporal-polyfill";

import { toDate } from "@repo/temporal";

const TIME_ZONES = getTimeZones({ includeUtc: true });

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

const timezones = Intl.supportedValuesOf("timeZone").concat(["UTC"]);

const now = Temporal.Now.plainDateISO();

export const TIMEZONES_DISPLAY: TimeZoneDisplayValue[] = timezones
  .map((timeZone) => getDisplayValue(timeZone, now))
  .sort((a, b) => a.offset.value - b.offset.value);

export function getDisplayValue(
  timeZoneId: string,
  date: Temporal.PlainDate,
): TimeZoneDisplayValue {
  const timeZone = TIME_ZONES.find((tz) => tz.name === timeZoneId);
  const dateTime = date.toZonedDateTime(timeZoneId);
  const modifiedLabel = timeZoneId
    .replace(/_/g, " ")
    .replaceAll("/", " - ")
    .replace("UTC", "Coordinated Universal Time");

  const abbreviation =
    timeZone?.abbreviation.replace("GMT", "UTC") ??
    getShortName(timeZoneId, dateTime).replace("GMT", "UTC");

  return {
    id: timeZoneId,
    abbreviation,
    name: timeZone?.alternativeName ?? modifiedLabel,
    fullName: modifiedLabel,
    city: cityName(timeZoneId),
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

function abbreviation(dateTime: Temporal.ZonedDateTime) {}

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

function cityName(timeZoneId: string) {
  if (!timeZoneId.includes("/")) {
    return undefined;
  }

  return timeZoneId.split("/").pop()?.replace("_", " ");
}
