import { and, eq } from "drizzle-orm";

import { Account } from "@repo/auth/server";
import { db } from "@repo/db";
import { account as accounts, calendars } from "@repo/db/schema";
import { GoogleCalendar } from "@repo/google-calendar";

import type { Calendar } from "../../../interfaces";
import { parseGoogleCalendarCalendarListEntry } from "../../calendars/google-calendar/calendars";
import { GoogleCalendarCalendarListEntry } from "../../calendars/google-calendar/interfaces";
import { syncCalendarList } from "../sync";

async function upsertCalendar(calendar: Calendar) {
  await db
    .insert(calendars)
    .values({
      ...calendar,
      calendarId: calendar.id,
    })
    .onConflictDoUpdate({
      target: [calendars.calendarId, calendars.accountId],
      set: calendar,
    });
}

interface HandleCalendarListMessageOptions {
  account: Account;
}

export async function handleCalendarListMessage({
  account,
}: HandleCalendarListMessageOptions) {
  const client = new GoogleCalendar({ accessToken: account.accessToken! });

  const syncToken = account.calendarListSyncToken;

  const { nextSyncToken } = await syncCalendarList({
    client,
    syncToken,
    onInvalidSyncToken: async () => {
      await db
        .delete(calendars)
        .where(
          and(
            eq(calendars.accountId, account.id),
            eq(calendars.providerId, "google"),
          ),
        );

      await db
        .update(accounts)
        .set({ calendarListSyncToken: null })
        .where(eq(accounts.id, account.id));
    },
    onUpsert: async (item: GoogleCalendarCalendarListEntry) => {
      const parsedCalendar = parseGoogleCalendarCalendarListEntry({
        accountId: account.id,
        entry: item,
      });

      await upsertCalendar(parsedCalendar);
    },
    onDelete: async (calendarId: string) => {
      await db.delete(calendars).where(eq(calendars.id, calendarId));
    },
  });

  if (nextSyncToken) {
    await db
      .update(accounts)
      .set({ calendarListSyncToken: nextSyncToken })
      .where(eq(accounts.id, account.id));
  }
}
