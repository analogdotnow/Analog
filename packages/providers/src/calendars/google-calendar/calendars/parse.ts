import type { Calendar } from "../../../interfaces";
import type { GoogleCalendarCalendarListEntry } from "../interfaces";

interface ParseCalendarOptions {
  providerAccountId: string;
  entry: GoogleCalendarCalendarListEntry;
}

export function parseCalendar({
  providerAccountId,
  entry,
}: ParseCalendarOptions): Calendar {
  return {
    id: entry.id!,
    name: entry.summaryOverride ?? entry.summary!,
    description: entry.description,
    etag: entry.etag,
    // location: entry.location,
    timeZone: entry.timeZone,
    primary: entry.primary!,
    readOnly:
      entry.accessRole === "reader" || entry.accessRole === "freeBusyReader",
    provider: {
      id: "google",
      accountId: providerAccountId,
    },
    color: entry.backgroundColor,
    syncToken: null,
  };
}
