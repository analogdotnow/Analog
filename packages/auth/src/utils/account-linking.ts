import {
  GenericEndpointContext,
  Account as HookAccountRecord,
} from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { eq } from "drizzle-orm";

import { db } from "@repo/db";
import { account as accountTable } from "@repo/db/schema";
import { getCalendarProvider } from "@repo/providers";

export const createProviderHandler = async (
  account: HookAccountRecord,
  ctx: GenericEndpointContext | null,
) => {
  if (!account.accessToken || !account.refreshToken) {
    throw new APIError("INTERNAL_SERVER_ERROR", {
      message: "Access token or refresh token is not set",
    });
  }

  const provider = ctx?.context.socialProviders.find(
    (p) => p.id === account.providerId,
  );

  if (!provider) {
    throw new APIError("INTERNAL_SERVER_ERROR", {
      message: `Provider account provider is ${account.providerId} but it is not configured`,
    });
  }

  const profile = await provider.getUserInfo({
    accessToken: account.accessToken,
    refreshToken: account.refreshToken,
    scopes: account.scope?.split(",") ?? [],
    idToken: account.idToken ?? undefined,
  });

  if (!profile?.user) {
    throw new APIError("INTERNAL_SERVER_ERROR", {
      message: "User info is not available",
    });
  }

  await db
    .update(accountTable)
    .set({
      name: profile.user.name,
      email: profile.user.email ?? "",
      image: profile.user.image,
    })
    .where(eq(accountTable.id, account.id));

  if (ctx?.context.session?.user?.defaultAccountId) {
    return;
  }

  await ctx?.context.internalAdapter.updateUser(account.userId, {
    defaultAccountId: account.id,
  });
};

export const handleUnlinkAccount = createAuthMiddleware(async (ctx) => {
  if (ctx.path === "/unlink-account") {
    const user = ctx.context.session?.user;

    if (!user) {
      throw new APIError("UNAUTHORIZED", {
        message: "Unauthorized",
      });
    }

    const defaultAccount = await db.query.account.findFirst({
      where: (table, { eq }) => eq(table.id, user!.defaultAccountId),
    });

    if (defaultAccount?.accountId !== ctx.body?.accountId) {
      return;
    }

    const newDefaultAccount = await db.query.account.findFirst({
      where: (table, { eq }) => eq(table.userId, user!.id),
    });

    if (!newDefaultAccount) {
      return;
    }

    const calendarProvider = getCalendarProvider(newDefaultAccount);
    const calendars = await calendarProvider.calendars();
    const primaryCalendar = calendars.find((calendar) => calendar.primary);

    await ctx.context.internalAdapter.updateUser(user.id, {
      defaultAccountId: newDefaultAccount.id,
      defaultCalendarId: primaryCalendar?.id,
    });
  }
});
