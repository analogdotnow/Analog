import { account } from "@repo/db/schema";

import { GoogleCalendarProvider } from "./calendars/google-calendar";
import { MicrosoftCalendarProvider } from "./calendars/microsoft-calendar";
import type { CalendarProvider, TaskProvider } from "./interfaces";
import { GoogleTasksProvider } from "./tasks/google-tasks";

const supportedProviders = {
  google: GoogleCalendarProvider,
  microsoft: MicrosoftCalendarProvider,
} as const;

const supportedTaskProviders = {
  google: GoogleTasksProvider,
} as const;

export function accountToCalendarProvider(
  activeAccount: typeof account.$inferSelect,
): CalendarProvider {
  if (!activeAccount.accessToken || !activeAccount.refreshToken) {
    throw new Error("Invalid account");
  }

  const Provider = supportedProviders[activeAccount.providerId];

  if (!Provider) {
    throw new Error("Provider not supported");
  }

  return new Provider({
    accessToken: activeAccount.accessToken,
    accountId: activeAccount.accountId,
  });
}


export function accountToTasksProvider(
  activeAccount: typeof account.$inferSelect,
): TaskProvider {
  if (!activeAccount.accessToken || !activeAccount.refreshToken) {
    throw new Error("Invalid account");
  }

  const Provider = supportedTaskProviders["google"];

  if (!Provider) {
    throw new Error("Provider not supported");
  }

  return new Provider({ accessToken: activeAccount.accessToken });
}
