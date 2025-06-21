import { CalendarEvent } from "@/components/event-calendar";
import { ProviderId } from "@/lib/constants";
import { EventOutputData } from "@/lib/schemas/event-form/form";
import { generateRRule } from "./rrule-utils";
import { getZonedEventTimes } from "./time-utils";

type TransformParams = {
  data: EventOutputData;
  providerId: ProviderId;
  accountId: string;
};

export function toCalendarEvent({
  data,
  providerId,
  accountId,
}: TransformParams): CalendarEvent | null {
  const { startTime, endTime } = getZonedEventTimes(data);
  if (!startTime || !endTime) {
    return null;
  }
  const endDateUTC = endTime
    .with({
      year: data.endDate.year,
      month: data.endDate.month,
      day: data.endDate.day,
    })
    .withTimeZone("UTC");

  const recurrenceRule = data.repeatType
    ? generateRRule({
        repeatType: data.repeatType,
        eventDates: { startDate: startTime, endDate: endDateUTC },
        timezone: data.timezone,
      })
    : "";

  const adjustedStartTime = data.isAllDay ? startTime.toPlainDate() : startTime;
  const adjustedEndTime = data.isAllDay ? endTime.toPlainDate() : endTime;

  return {
    id: "",
    title: data.title,
    description: data.description,
    start: adjustedStartTime,
    end: adjustedEndTime,
    allDay: data.isAllDay,
    location: data.location ?? "",
    calendarId: "primary",
    color: undefined,
    providerId,
    accountId,
  };
}
