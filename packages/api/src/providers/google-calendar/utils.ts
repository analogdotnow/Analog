

export function toGoogleCalendarRecurrenceOptions(
  recurrence?: {
  frequency?: "daily" | "weekly" | "monthly" | "yearly";
  interval?: number;
  count?: number;
  until?: Temporal.PlainDate | Temporal.ZonedDateTime | Temporal.Instant;
  byDay?: ("SU" | "MO" | "TU" | "WE" | "TH" | "FR" | "SA")[];
  byMonth?: number[];
  byMonthDay?: number[];
  byYearDay?: number[];
  byWeekNo?: number[];
  byHour?: number[];
  byMinute?: number[];
  bySecond?: number[];
  }
): string[]{
  console.log(`toGoogleCalendarRecurrenceOptions called with recurrence: ${JSON.stringify(recurrence)}`);
  if (!recurrence) {
    return [];
  }

  let formatedUntil: string | undefined;
  if (recurrence.until) {
    if (recurrence.until instanceof Temporal.PlainDate) {
      formatedUntil = recurrence.until.toString().replace(/-/g, "");
    } else if (recurrence.until instanceof Temporal.ZonedDateTime) {
      formatedUntil = recurrence.until.toInstant().toString().replace(/[-:]/g, "").slice(0, 15) + "Z";
    } else if (recurrence.until instanceof Temporal.Instant) {
      formatedUntil = recurrence.until.toString().replace(/[-:]/g, "").slice(0, 15) + "Z";
    }
  }

  // Google Calendar expects a single string for recurrence rules
  let rule = ["RRULE:" + [
    `FREQ=${recurrence.frequency?.toUpperCase() || "DAILY"}`,
    `INTERVAL=${recurrence.interval || 1}`,
    recurrence.count ? `COUNT=${recurrence.count}` : "",
    recurrence.until ? `UNTIL=${formatedUntil}` : "",
    recurrence.byDay ? `BYDAY=${recurrence.byDay.join(",")}` : "",
    recurrence.byMonth ? `BYMONTH=${recurrence.byMonth.join(",")}` : "",
    recurrence.byMonthDay ? `BYMONTHDAY=${recurrence.byMonthDay.join(",")}` : "",
    recurrence.byYearDay ? `BYYEARDAY=${recurrence.byYearDay.join(",")}` : "",
    recurrence.byWeekNo ? `BYWEEKNO=${recurrence.byWeekNo.join(",")}` : "",
    recurrence.byHour ? `BYHOUR=${recurrence.byHour.join(",")}` : "",
    recurrence.byMinute ? `BYMINUTE=${recurrence.byMinute.join(",")}` : "",
    recurrence.bySecond ? `BYSECOND=${recurrence.bySecond.join(",")}` : "",
  ].filter(Boolean).join(";")];
  console.log(`Generated recurrence rule: ${rule}`);
  return rule;
}