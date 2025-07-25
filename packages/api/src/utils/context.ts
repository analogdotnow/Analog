import { User } from "@repo/auth/server";

import { accountToProvider, isCalendarProvider } from "../providers";
import { getAccounts } from "./accounts";

export async function getCalendarProviders(user: User, headers: Headers) {
  const accounts = await getAccounts(user, headers);

  return accounts
    .filter((provider) => isCalendarProvider(provider.providerId))
    .map((account) => ({
      account: {
        ...account,
        providerId: account.providerId as "google" | "microsoft",
      },
      client: accountToProvider(account),
    }));
}
