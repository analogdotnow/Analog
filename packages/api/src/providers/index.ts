import { account } from "@repo/db/schema";

import { GoogleCalendarProvider } from "./calendars/google-calendar";
import { MicrosoftCalendarProvider } from "./calendars/microsoft-calendar";
import { GoogleMeetProvider } from "./conferencing/google-meet";
import { ZoomProvider } from "./conferencing/zoom";
import type {
  CalendarProvider,
  ConferencingProvider,
  ProviderConfig,
  TaskProvider,
} from "./interfaces";
import { GoogleTasksProvider } from "./tasks/google-tasks";

const supportedCalendarProviders = {
  google: GoogleCalendarProvider,
  microsoft: MicrosoftCalendarProvider,
} as const;

const supportedTaskProviders = {
  google: GoogleTasksProvider,
} as const;

const supportedConferencingProviders = {
  google: GoogleMeetProvider,
  zoom: ZoomProvider,
} as const;

const CALENDAR_PROVIDERS = ["google", "microsoft"];
const TASK_PROVIDERS = ["google"];

function accountToProvider<
  TProvider extends CalendarProvider | TaskProvider,
  TProviderMap extends Record<
    string,
    new (config: ProviderConfig) => TProvider
  >,
>(
  activeAccount: typeof account.$inferSelect,
  providerMap: TProviderMap,
): TProvider {
  if (!activeAccount.accessToken || !activeAccount.refreshToken) {
    throw new Error("Invalid account");
  }

  const Provider = providerMap[activeAccount.providerId as keyof TProviderMap];

  if (!Provider) {
    throw new Error("Provider not supported");
  }

  return new Provider({
    accessToken: activeAccount.accessToken,
    accountId: activeAccount.accountId,
  });
}

export function getCalendarProvider(
  activeAccount: typeof account.$inferSelect,
): CalendarProvider {
  return accountToProvider(
    activeAccount,
    supportedCalendarProviders,
  ) as CalendarProvider;
}

export function getTaskProvider(
  activeAccount: typeof account.$inferSelect,
): TaskProvider {
  return accountToProvider(
    activeAccount,
    supportedTaskProviders,
  ) as TaskProvider;
}

export function accountToConferencingProvider(
  activeAccount: typeof account.$inferSelect,
  providerId: "google" | "zoom",
): ConferencingProvider {
  if (!activeAccount.accessToken || !activeAccount.refreshToken) {
    throw new Error("Invalid account");
  }

  const Provider = supportedConferencingProviders[providerId];

  if (!Provider) {
    throw new Error("Conferencing provider not supported");
  }

  return new Provider({
    accessToken: activeAccount.accessToken,
    accountId: activeAccount.accountId,
  });
}

export function isCalendarProvider(providerId: string) {
  return CALENDAR_PROVIDERS.includes(providerId);
}

export function isTaskProvider(providerId: string) {
  return TASK_PROVIDERS.includes(providerId);
}
