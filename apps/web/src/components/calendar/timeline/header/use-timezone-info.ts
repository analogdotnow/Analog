import * as React from "react";
import { getTimeZones } from "@vvo/tzdb";
import { Temporal } from "temporal-polyfill";

import { startOfDay, toDate } from "@repo/temporal";

const TIME_ZONES = getTimeZones({ includeUtc: true });

interface UseTimeZoneLabelOptions {
  date: Temporal.PlainDate;
  locale: string;
  timeZoneId: string;
}

export function useTimeZoneLabel({
  date,
  locale,
  timeZoneId,
}: UseTimeZoneLabelOptions) {
  return React.useMemo(() => {
    const timeZone = TIME_ZONES.find((tz) => tz.name === timeZoneId);

    if (timeZone?.abbreviation) {
      return timeZone.abbreviation;
    }

    const start = startOfDay(date, { timeZone: timeZoneId });
    const value = toDate(start, { timeZone: timeZoneId });

    const parts = new Intl.DateTimeFormat(locale, {
      timeZoneName: "short",
      timeZone: timeZoneId,
    }).formatToParts(value);

    return parts.find((part) => part.type === "timeZoneName")?.value ?? " ";
  }, [date, locale, timeZoneId]);
}

function getShortName(timeZone: string, dateTime: Temporal.ZonedDateTime) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "short",
  });

  const parts = formatter.formatToParts(toDate(dateTime, { timeZone }));
  return parts.find((part) => part.type === "timeZoneName")?.value || "";
}

interface TimeZoneDisplayValue {
  id: string;
  abbreviation: string;
  name: string;
  city?: string;
  offset: {
    sign: "-" | "+";
    label: string;
    value: number;
  };
}

export function timeZoneAbbreviation(
  timeZoneId: string,
  date: Temporal.PlainDate,
): string {
  const timeZoneMeta = TIME_ZONES.find((tz) => tz.name === timeZoneId);
  const dateTime = date.toZonedDateTime(timeZoneId);

  if (timeZoneMeta?.abbreviation) {
    return timeZoneMeta.abbreviation;
  }

  return getShortName(timeZoneId, dateTime).replace("GMT", "UTC");
}

interface UseTimeZoneDisplayOptions {
  date: Temporal.PlainDate;
  timeZoneId: string;
}

export function useTimeZoneDisplay({
  date,
  timeZoneId,
}: UseTimeZoneDisplayOptions): TimeZoneDisplayValue {
  return React.useMemo(() => {
    const timeZoneMeta = TIME_ZONES.find((tz) => tz.name === timeZoneId);
    const dateTime = date.toZonedDateTime(timeZoneId);
    const modifiedLabel = timeZoneId
      .replace(/_/g, " ")
      .replaceAll("/", " - ")
      .replace("UTC", "Coordinated Universal Time");

    const abbreviation =
      timeZoneMeta?.abbreviation ??
      getShortName(timeZoneId, dateTime).replace("GMT", "UTC");

    return {
      id: timeZoneId,
      abbreviation,
      name: timeZoneMeta?.alternativeName ?? modifiedLabel,
      city: timeZoneMeta?.mainCities[0],
      offset: {
        sign: dateTime.offsetNanoseconds < 0 ? "-" : "+",
        label: dateTime.offset,
        value: dateTime.offsetNanoseconds,
      },
    };
  }, [date, timeZoneId]);
}
