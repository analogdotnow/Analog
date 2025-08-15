import {
  GenericEndpointContext,
  Account as HookAccountRecord,
} from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { eq } from "drizzle-orm";

import { getCalendarProvider } from "@repo/api/providers";
import { db } from "@repo/db";
import { account as accountTable } from "@repo/db/schema";

export const createProviderHandler = async (
  account: HookAccountRecord,
  ctx: GenericEndpointContext | undefined,
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

  // Validate parameters before database update
  if (!account.userId || !account.id) {
    console.error("Invalid parameters for default account update:", {
      userId: account.userId,
      accountId: account.id,
    });
  } else {
    try {
      await ctx?.context.internalAdapter.updateUser(account.userId, {
        defaultAccountId: account.id,
      });
    } catch (error) {
      console.error("Failed to update user default account:", {
        userId: account.userId,
        accountId: account.id,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Don't throw here as this is not critical for the account creation flow
      // The user can set their default account later
    }
  }
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

    // Validate parameters before database update
    if (!user.id || !newDefaultAccount.id) {
      console.error(
        "Invalid parameters for user update during account unlink:",
        {
          userId: user.id,
          newDefaultAccountId: newDefaultAccount.id,
          primaryCalendarId: primaryCalendar?.id,
        },
      );

      throw new APIError("INTERNAL_SERVER_ERROR", {
        message:
          "Invalid parameters for updating user default settings during account unlink",
      });
    }

    try {
      await ctx.context.internalAdapter.updateUser(
        user.id,
        {
          defaultAccountId: newDefaultAccount.id,
          defaultCalendarId: primaryCalendar?.id,
        },
        ctx,
      );
    } catch (error) {
      console.error("Failed to update user during account unlink:", {
        userId: user.id,
        defaultAccountId: newDefaultAccount.id,
        defaultCalendarId: primaryCalendar?.id,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      throw new APIError("INTERNAL_SERVER_ERROR", {
        message: "Failed to update user default settings during account unlink",
      });
    }
  }
});
