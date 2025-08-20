import { TRPCError } from "@trpc/server";

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
  if (!activeAccount.accessToken) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Invalid account: Missing access token for provider '${activeAccount.providerId}' (accountId: ${activeAccount.accountId})`,
    });
  }

  if (!activeAccount.refreshToken) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Invalid account: Missing refresh token for provider '${activeAccount.providerId}' (accountId: ${activeAccount.accountId})`,
    });
  }

  const Provider = providerMap[activeAccount.providerId as keyof TProviderMap];

  if (!Provider) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Provider not supported: '${activeAccount.providerId}' (accountId: ${activeAccount.accountId})`,
    });
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
  if (!activeAccount.accessToken) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Invalid account: Missing access token for provider '${activeAccount.providerId}' (accountId: ${activeAccount.accountId})`,
    });
  }

  if (!activeAccount.refreshToken) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Invalid account: Missing refresh token for provider '${activeAccount.providerId}' (accountId: ${activeAccount.accountId})`,
    });
  }

  const Provider = supportedConferencingProviders[providerId];

  if (!Provider) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Conferencing provider not supported: '${providerId}' for account '${activeAccount.providerId}' (accountId: ${activeAccount.accountId})`,
    });
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
