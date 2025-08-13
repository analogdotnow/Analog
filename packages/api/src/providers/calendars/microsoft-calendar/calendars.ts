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
    id: calendar.id as string,
    providerId: "microsoft",
    name: calendar.name as string,
    primary: calendar.isDefaultCalendar as boolean,
    accountId,
    providerAccountId: accountId,
    color: calendar.hexColor as string,
    readOnly: !calendar.canEdit,
  };
}

export function calendarPath(calendarId: string) {
  return calendarId === "primary"
    ? "/me/calendar"
    : `/me/calendars/${calendarId}`;
}
