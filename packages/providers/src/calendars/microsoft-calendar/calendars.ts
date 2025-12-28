import type { Calendar as MicrosoftCalendar } from "@microsoft/microsoft-graph-types";

import type { Calendar } from "../../interfaces";

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
    primary: Boolean(calendar.isDefaultCalendar),
    provider: {
      id: "microsoft",
      accountId: providerAccountId,
    },
    color: calendar.hexColor!,
    readOnly: calendar.canEdit === false,
    syncToken: null,
  };
}
