import type { Calendar as MicrosoftCalendar } from "@microsoft/microsoft-graph-types";

import type { Calendar } from "../../../interfaces";

interface ParseMicrosoftCalendarOptions {
  accountId: string;
  calendar: MicrosoftCalendar;
}

export function parseMicrosoftCalendar({
  accountId,
  calendar,
}: ParseMicrosoftCalendarOptions): Calendar {
  return {
    id: calendar.id!,
    providerId: "microsoft",
    name: calendar.name!,
    primary: calendar.isDefaultCalendar!,
    accountId,
    providerAccountId: accountId,
    color: calendar.hexColor!,
    readOnly: !calendar.canEdit,
  };
}

export function calendarPath(calendarId: string) {
  return calendarId === "primary"
    ? "/me/calendar"
    : `/me/calendars/${calendarId}`;
}
