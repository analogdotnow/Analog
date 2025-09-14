import { Temporal } from "temporal-polyfill";

import type { CalendarSettings } from "@/atoms/calendar-settings";
import type { Calendar, CalendarEvent } from "@/lib/interfaces";
import { createEventId, roundTo15Minutes } from "@/lib/utils/calendar";
import { FormMeta } from "./form";
import type { FormValues } from "./schema";
import { toCalendarEvent } from "./transform/output";

export const initialValues: FormValues = {
  id: createEventId(),
  type: "draft",
  title: "",
  start: Temporal.Now.zonedDateTimeISO().round({
    smallestUnit: "minute",
    roundingIncrement: 15,
    roundingMode: "floor",
  }),
  end: Temporal.Now.zonedDateTimeISO().add({ hours: 2 }).round({
    smallestUnit: "minute",
    roundingIncrement: 15,
    roundingMode: "halfExpand",
  }),
  isAllDay: false,
  location: "",
  availability: "busy",
  description: "",
  recurrence: undefined,
  recurringEventId: undefined,
  attendees: [],
  calendar: {
    accountId: "",
    calendarId: "",
  },
  conference: undefined,
  providerId: "google",
  visibility: "default",
};

interface CreateDefaultEvent {
  settings: CalendarSettings;
  defaultCalendar: Calendar;
}

export function getDefaultValues({
  settings,
  defaultCalendar,
}: CreateDefaultEvent): FormValues {
  const timeZone = defaultCalendar?.timeZone ?? settings.defaultTimeZone;
  const now = Temporal.Now.zonedDateTimeISO(timeZone);

  const start = roundTo15Minutes(now);
  const duration = Temporal.Duration.from({
    minutes: settings.defaultEventDuration,
  });

  return {
    id: createEventId(),
    type: "draft",
    title: "",
    start,
    end: start.add(duration),
    location: "",
    description: "",
    isAllDay: false,
    availability: "busy",
    attendees: [],
    calendar: {
      accountId: defaultCalendar.accountId,
      calendarId: defaultCalendar.id,
    },
    providerId: defaultCalendar.providerId,
    visibility: "default",
  };
}

export function getDefaultEvent({
  settings,
  defaultCalendar,
}: CreateDefaultEvent): CalendarEvent {
  const values = getDefaultValues({ settings, defaultCalendar });

  return toCalendarEvent({ values });
}

export const defaultFormMeta: FormMeta = {
  sendUpdate: true,
};
