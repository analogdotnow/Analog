import type { Calendar } from "../../../interfaces";
import type { GoogleCalendarCalendarListEntry } from "./interfaces";

interface ParsedGoogleCalendarCalendarListEntryOptions {
  accountId: string;
  entry: GoogleCalendarCalendarListEntry;
}

export function parseGoogleCalendarCalendarListEntry({
  accountId,
  entry,
}: ParsedGoogleCalendarCalendarListEntryOptions): Calendar {
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
    providerId: "google",
    accountId,
    providerAccountId: accountId,
    color: entry.backgroundColor,
    syncToken: null,
  };
}
