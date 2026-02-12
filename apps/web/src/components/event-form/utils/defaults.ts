import { Temporal } from "temporal-polyfill";

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
    id: "",
    provider: {
      id: "google",
      accountId: "",
    },
  },
  conference: undefined,
  visibility: "default",
};

interface CreateDefaultEventOptions {
  defaultCalendar: Calendar;
  defaultTimeZone: string;
  defaultEventDuration: number;
}

export function getDefaultValues({
  defaultCalendar,
  defaultTimeZone,
  defaultEventDuration,
}: CreateDefaultEventOptions): FormValues {
  const timeZone = defaultCalendar?.timeZone ?? defaultTimeZone;
  const now = Temporal.Now.zonedDateTimeISO(timeZone);

  const start = roundTo15Minutes(now);
  const duration = Temporal.Duration.from({
    minutes: defaultEventDuration,
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
      id: defaultCalendar.id,
      provider: defaultCalendar.provider,
    },
    visibility: "default",
  };
}

export function getDefaultEvent({
  defaultCalendar,
  defaultTimeZone,
  defaultEventDuration,
}: CreateDefaultEventOptions): CalendarEvent {
  const values = getDefaultValues({
    defaultCalendar,
    defaultTimeZone,
    defaultEventDuration,
  });

  return toCalendarEvent({ values });
}

export const defaultFormMeta: FormMeta = {
  sendUpdate: true,
};
