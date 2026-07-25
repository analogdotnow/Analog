import type { Calendar as MicrosoftCalendar } from "@analog/microsoft-calendar";

import type { Calendar } from "../../../interfaces";

interface ParseCalendarOptions {
  providerAccountId: string;
  calendar: MicrosoftCalendar;
}

export function parseCalendar({
  providerAccountId,
  calendar,
}: ParseCalendarOptions): Calendar {
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
