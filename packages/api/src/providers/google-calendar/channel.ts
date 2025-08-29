import { Account, auth } from "@repo/auth/server";
import { db } from "@repo/db";

import { handleCalendarListMessage } from "./channels/calendars";
import { handleEventsMessage } from "./channels/events";
import { parseHeaders } from "./channels/headers";

interface FindChannelOptions {
  channelId: string;
}

async function findChannel({ channelId }: FindChannelOptions) {
  return await db.query.channel.findFirst({
    where: (table, { eq }) => eq(table.id, channelId),
  });
}

export async function withAccessToken(account: Account) {
  const { accessToken } = await auth.api.getAccessToken({
    body: {
      providerId: account.providerId,
      accountId: account.id,
      userId: account.userId,
    },
  });

  return {
    ...account,
    accessToken: accessToken ?? account.accessToken!,
  };
}

interface FindAccountOptions {
  accountId: string;
}

async function findAccount({ accountId }: FindAccountOptions) {
  const account = await db.query.account.findFirst({
    where: (table, { eq }) => eq(table.id, accountId),
  });

  if (!account) {
    throw new Error(`Account ${accountId} not found`);
  }

  return await withAccessToken(account);
}

export function handler() {
  const POST = async (request: Request) => {
    const headers = await parseHeaders({ headers: request.headers });

    if (!headers) {
      return new Response("Missing or invalid headers", { status: 400 });
    }

    if (headers.resourceState === "sync") {
      return new Response("OK", { status: 200 });
    }

    const channel = await findChannel({ channelId: headers.id });

    if (!channel) {
      return new Response("Channel not found", { status: 404 });
    }

    if (!headers.token || headers.token !== channel.token) {
      return new Response("Invalid channel token", { status: 401 });
    }

    if (headers.resourceId !== channel.resourceId) {
      return new Response("Mismatched resource", { status: 400 });
    }

    const account = await findAccount({ accountId: channel.accountId });

    if (!account.accessToken) {
      return new Response("Failed to obtain a valid access token", {
        status: 500,
      });
    }

    if (channel.type === "google.calendar") {
      await handleCalendarListMessage({
        account,
      });
    } else if (channel.type === "google.event") {
      const calendarId = extractCalendarId(headers.resourceUri);

      if (!calendarId) {
        return new Response("Missing calendar id", { status: 400 });
      }

      await handleEventsMessage({ calendarId, account });
    } else {
      return new Response("Invalid channel type", { status: 400 });
    }

    return new Response(null, { status: 204 });
  };

  return {
    POST,
  };
}

function extractCalendarId(uri: string): string | null {
  const match = /\/calendars\/([^/?#]+)/.exec(uri);

  if (!match) {
    return null;
  }

  return decodeURIComponent(match[1]!);
}
