import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

import { db } from "@repo/db";
import { account } from "@repo/db/schema";
import { env } from "@repo/env/server";

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

interface MicrosoftTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

interface RefreshTokenOptions {
  refreshToken: string;
  accountId: string;
}

export async function refreshGoogleAccessToken({
  refreshToken,
  accountId,
}: RefreshTokenOptions): Promise<string> {
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to refresh Google access token:", error);

      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Failed to refresh access token. Please re-authenticate.",
      });
    }

    const data: GoogleTokenResponse = await response.json();
    const expiresAt = new Date(Date.now() + data.expires_in * 1000);

    await db
      .update(account)
      .set({
        accessToken: data.access_token,
        accessTokenExpiresAt: expiresAt,
        ...(data.refresh_token && { refreshToken: data.refresh_token }),
        updatedAt: new Date(),
      })
      .where(eq(account.id, accountId));

    console.info(
      `Successfully refreshed Google access token for account ${accountId}`,
    );
    return data.access_token;
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }

    console.error("Error refreshing Google access token:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to refresh access token",
    });
  }
}

export async function refreshMicrosoftAccessToken({
  refreshToken,
  accountId,
}: RefreshTokenOptions): Promise<string> {
  try {
    const response = await fetch(
      "https://login.microsoftonline.com/common/oauth2/v2.0/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: env.MICROSOFT_CLIENT_ID,
          client_secret: env.MICROSOFT_CLIENT_SECRET,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        }),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to refresh Microsoft access token:", error);

      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Failed to refresh access token. Please re-authenticate.",
      });
    }

    const data: MicrosoftTokenResponse = await response.json();
    const expiresAt = new Date(Date.now() + data.expires_in * 1000);

    await db
      .update(account)
      .set({
        accessToken: data.access_token,
        accessTokenExpiresAt: expiresAt,
        ...(data.refresh_token && { refreshToken: data.refresh_token }),
        updatedAt: new Date(),
      })
      .where(eq(account.id, accountId));

    console.info(
      `Successfully refreshed Microsoft access token for account ${accountId}`,
    );
    return data.access_token;
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }

    console.error("Error refreshing Microsoft access token:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to refresh access token",
    });
  }
}
