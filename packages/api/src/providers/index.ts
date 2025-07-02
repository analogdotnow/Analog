import { account } from "@repo/db/schema";

import { GoogleCalendarProvider } from "./google-calendar";
import type { CalendarProvider, MeetingProvider } from "./interfaces";
import { GoogleMeetProvider, ZoomProvider } from "./meeting-providers";
import { MicrosoftCalendarProvider } from "./microsoft-calendar";

const supportedProviders = {
  google: GoogleCalendarProvider,
  microsoft: MicrosoftCalendarProvider,
} as const;

const supportedMeetingProviders = {
  google: GoogleMeetProvider,
  zoom: ZoomProvider,
} as const;

export function accountToProvider(
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

export function accountToMeetingProvider(
  activeAccount: typeof account.$inferSelect,
  providerId: "google" | "zoom",
): MeetingProvider {
  if (!activeAccount.accessToken || !activeAccount.refreshToken) {
    throw new Error("Invalid account");
  }

  const Provider = supportedMeetingProviders[providerId];

  if (!Provider) {
    throw new Error("Meeting provider not supported");
  }

  return new Provider({
    accessToken: activeAccount.accessToken,
  });
}
