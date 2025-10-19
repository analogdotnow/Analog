import { TRPCError } from "@trpc/server";

import { Account } from "@repo/auth/server";
import type { Calendar, CalendarProvider } from "@repo/providers/interfaces";

interface Provider {
  account: Account;
  client: CalendarProvider;
}

export function findProviderOrThrow(providers: Provider[], accountId: string) {
  const provider = providers.find(
    ({ account }) => account.accountId === accountId,
  );

  if (!provider?.client) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Could not find provider for account id: ${accountId}`,
    });
  }

  return provider;
}

export function findCalendarOrThrow(calendars: Calendar[], calendarId: string) {
  const calendar = calendars.find((calendar) => calendar.id === calendarId);

  if (!calendar) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Calendar not found for id: ${calendarId}`,
    });
  }

  return calendar;
}
