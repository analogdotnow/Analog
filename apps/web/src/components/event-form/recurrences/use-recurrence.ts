import * as React from "react";
import { RRuleTemporal } from "rrule-temporal";
import { toText } from "rrule-temporal/totext";
import { Temporal } from "temporal-polyfill";

import { toZonedDateTime } from "@repo/temporal";

import { Recurrence } from "@/lib/interfaces";

interface UseRecurrenceOptions {
  recurrence: Recurrence | undefined;
  date: Temporal.ZonedDateTime;
  timeZone: string;
}

export function useRecurrence({
  recurrence,
  date,
  timeZone,
}: UseRecurrenceOptions) {
  return React.useMemo(() => {
    if (!recurrence) {
      return { description: undefined, rrule: undefined, rule: undefined };
    }

    const { until, rDate, exDate, ...params } = recurrence;

    const rule = new RRuleTemporal({
      ...params,
      rDate: rDate?.map((date) => toZonedDateTime(date, { timeZone })),
      exDate: exDate?.map((date) => toZonedDateTime(date, { timeZone })),
      until: until ? toZonedDateTime(until, { timeZone }) : undefined,
      dtstart: date,
    });

    return {
      description: toText(rule),
      rule,
      rrule: rule.toString(),
    };
  }, [date, recurrence, timeZone]);
}
