import type { Calendar as MicrosoftCalendar } from "@microsoft/microsoft-graph-types";

import type { Calendar } from "../../interfaces";

interface ParseMicrosoftCalendarOptions {
  providerAccountId: string;
  calendar: MicrosoftCalendar;
}

export function parseMicrosoftCalendar({
  providerAccountId,
  calendar,
}: ParseMicrosoftCalendarOptions): Calendar {
  return {
    id: calendar.id!,
    name: calendar.name!,
    primary: calendar.isDefaultCalendar!,
    provider: {
      id: "microsoft",
      accountId: providerAccountId,
    },
    color: calendar.hexColor!,
    readOnly: !calendar.canEdit,
    syncToken: null,
  };
}

export function calendarPath(calendarId: string) {
  return calendarId === "primary"
    ? "/me/calendar"
    : `/me/calendars/${calendarId}`;
}
