import { account } from "@repo/db/schema";

import { GoogleCalendarProvider } from "./google-calendar";
import { MicrosoftCalendarProvider } from "./microsoft-calendar";
import type { CalendarProvider } from "./types";

const supportedProviders = {
  google: GoogleCalendarProvider,
  microsoft: MicrosoftCalendarProvider,
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

  return new Provider({ accessToken: activeAccount.accessToken });
}
