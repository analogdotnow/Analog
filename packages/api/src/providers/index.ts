import { connection } from "@repo/db/schema";

import { GoogleCalendarProvider } from "./google-calendar";
import { MicrosoftCalendarProvider } from "./microsoft-calendar";

const supportedProviders = {
  google: GoogleCalendarProvider,
  microsoft: MicrosoftCalendarProvider,
};

export function connectionToProvider(
  activeConnection: typeof connection.$inferInsert,
) {
  if (!activeConnection.accessToken || !activeConnection.refreshToken) {
    throw new Error("Invalid connection");
  }

  const Provider = supportedProviders[activeConnection.providerId];

  if (!Provider) {
    throw new Error("Provider not supported");
  }

  return new Provider({ accessToken: activeConnection.accessToken });
}
