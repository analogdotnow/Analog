import { TRPCError } from "@trpc/server";

import { auth } from "@repo/auth/server";

interface RefreshTokenOptions {
  accountId: string;
  providerId: string;
}

interface RefreshTokenOptionsWithDefault {
  accountId: string;
  providerId?: string;
}

export async function refreshAccessToken({
  accountId,
  providerId,
}: RefreshTokenOptions): Promise<string> {
  try {
    const { accessToken } = await auth.api.getAccessToken({
      body: {
        providerId,
        accountId,
      },
    });

    if (!accessToken) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Failed to refresh access token. Please re-authenticate.",
      });
    }

    console.info(
      `Successfully refreshed ${providerId} access token for account ${accountId}`,
    );
    return accessToken;
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }

    console.error(`Error refreshing ${providerId} access token:`, error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to refresh access token",
    });
  }
}

export async function refreshGoogleAccessToken({
  accountId,
  providerId = "google",
}: RefreshTokenOptionsWithDefault): Promise<string> {
  return refreshAccessToken({ accountId, providerId });
}

export async function refreshMicrosoftAccessToken({
  accountId,
  providerId = "microsoft",
}: RefreshTokenOptionsWithDefault): Promise<string> {
  return refreshAccessToken({ accountId, providerId });
}
