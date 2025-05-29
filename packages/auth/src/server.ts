import "server-only";
import { betterAuth, type Account } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";

import { db } from "@repo/db";
import { connection } from "@repo/db/schema";
import { env } from "@repo/env/server";

import { createdProvider } from "./providers";
import { GOOGLE_OAUTH_SCOPES } from "./providers/google";
import { MICROSOFT_OAUTH_SCOPES } from "./providers/microsoft";

const connectionHandlerHook = async (account: Account) => {
  if (!account.accessToken || !account.refreshToken) {
    throw new APIError("UNAUTHORIZED", {
      message: "Missing access or refresh token",
    });
  }

  const provider = createdProvider(
    account.providerId as "google" | "microsoft",
    {
      auth: {
        accessToken: account.accessToken,
        refreshToken: account.refreshToken,
        userId: account.userId,
        email: "",
      },
    },
  );

  const userInfo = await provider.getUserInfo().catch(() => {
    throw new APIError("UNAUTHORIZED", { message: "Failed to get user info" });
  });

  if (!userInfo?.email) {
    throw new APIError("BAD_REQUEST", {
      message: "Missing email in user info",
    });
  }

  const updatingInfo = {
    name: userInfo.name ?? "Unknown",
    image: userInfo.image ?? "",
    accessToken: account.accessToken,
    refreshToken: account.refreshToken,
    scope: provider.getScope(),
    expiresAt: new Date(
      Date.now() + (account.accessTokenExpiresAt?.getTime() ?? 3600000),
    ),
  };

  await db
    .insert(connection)
    .values({
      providerId: account.providerId as "google" | "microsoft",
      email: userInfo.email,
      userId: account.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...updatingInfo,
    })
    .onConflictDoUpdate({
      target: [connection.email, connection.userId],
      set: {
        ...updatingInfo,
        updatedAt: new Date(),
      },
    });
};

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  databaseHooks: {
    account: {
      create: {
        after: connectionHandlerHook,
      },
      update: {
        after: connectionHandlerHook,
      },
    },
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      scope: GOOGLE_OAUTH_SCOPES,
      accessType: "offline",
    },
    microsoft: {
      clientId: env.MICROSOFT_CLIENT_ID,
      clientSecret: env.MICROSOFT_CLIENT_SECRET,
      scope: MICROSOFT_OAUTH_SCOPES,
    },
  },
});
