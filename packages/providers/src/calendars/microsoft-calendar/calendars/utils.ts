import type { Calendar as MicrosoftCalendar } from "@analog/microsoft-calendar";

import type { Calendar } from "../../../interfaces";

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
