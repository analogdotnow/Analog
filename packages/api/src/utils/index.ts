import { TRPCError } from "@trpc/server";

import { Account } from "@repo/auth/server";
import type { Calendar, CalendarProvider } from "@repo/providers/interfaces";

interface Provider {
  account: Account;
  client: CalendarProvider;
}

export function findProviderOrThrow(
  providers: Provider[],
  providerAccountId: string,
) {
  const provider = providers.find(
    ({ account }) => account.accountId === providerAccountId,
  );

  if (!provider?.client) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Could not find provider for providerAccountId: ${providerAccountId}`,
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
