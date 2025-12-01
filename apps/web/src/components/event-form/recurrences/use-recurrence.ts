import * as React from "react";
import { RRuleTemporal } from "rrule-temporal";
import { toText } from "rrule-temporal/totext";
import { Temporal } from "temporal-polyfill";

import { Recurrence } from "@repo/providers/interfaces";
import { toRRule } from "@repo/providers/lib";
import { toZonedDateTime } from "@repo/temporal";

type RecurrenceWithFrequency = Recurrence & Required<Pick<Recurrence, "freq">>;

interface ToDescriptionOptions {
  recurrence: RecurrenceWithFrequency;
  timeZone: string;
  date: Temporal.ZonedDateTime;
}

function toDescription({ recurrence, timeZone, date }: ToDescriptionOptions) {
  const rule = new RRuleTemporal({
    ...recurrence,
    rDate: recurrence.rDate?.map((date) => toZonedDateTime(date, { timeZone })),
    exDate: recurrence.exDate?.map((date) =>
      toZonedDateTime(date, { timeZone }),
    ),
    until: recurrence.until
      ? toZonedDateTime(recurrence.until, { timeZone })
      : undefined,
    dtstart: date,
  });

  return toText(rule);
}

function isRecurrenceWithFrequency(
  recurrence: Recurrence,
): recurrence is RecurrenceWithFrequency {
  return recurrence.freq !== undefined;
}

interface UseRecurrenceOptions {
  recurrence: Recurrence | undefined | null;
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
      return { description: undefined, rrule: undefined };
    }

    if (!isRecurrenceWithFrequency(recurrence)) {
      return {
        description: undefined,
        rrule: toRRule(recurrence),
      };
    }

    return {
      description: toDescription({ recurrence, timeZone, date }),
      rrule: toRRule(recurrence),
    };
  }, [date, recurrence, timeZone]);
}
