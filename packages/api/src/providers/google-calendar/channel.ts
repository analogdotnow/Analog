import { Account, auth } from "@repo/auth/server";
import { db } from "@repo/db";
import { GoogleCalendar } from "@repo/google-calendar";

import { parseHeaders } from "./channels/headers";
import { handleCalendarListMessage } from "./channels/calendars";
import { handleEventsMessage } from "./channels/events";

const DEFAULT_TTL = "3600";

interface SubscribeCalendarListOptions {
  client: GoogleCalendar;
  subscriptionId: string;
  webhookUrl: string;
}

export async function subscribeCalendarList({
  client,
  subscriptionId,
  webhookUrl,
}: SubscribeCalendarListOptions) {
  const response = await client.users.me.calendarList.watch({
    id: subscriptionId,
    type: "web_hook",
    address: webhookUrl,
    params: {
      ttl: DEFAULT_TTL,
    },
  });

  return {
    type: "google.calendar-list",
    subscriptionId,
    resourceId: response.resourceId!,
    expiresAt: new Date(response.expiration!),
  };
}

interface SubscribeEventsOptions {
  client: GoogleCalendar;
  calendarId: string;
  subscriptionId: string;
  webhookUrl: string;
}

export async function subscribeEvents({
  client,
  calendarId,
  subscriptionId,
  webhookUrl,
}: SubscribeEventsOptions) {
  const response = await client.calendars.events.watch(calendarId, {
    id: subscriptionId,
    type: "web_hook",
    address: webhookUrl,
    params: {
      ttl: DEFAULT_TTL,
    },
  });

  return {
    type: "google.calendar-events",
    subscriptionId,
    calendarId,
    resourceId: response.resourceId!,
    expiresAt: new Date(response.expiration!),
  };
}

interface UnsubscribeOptions {
  client: GoogleCalendar;
  subscriptionId: string;
  resourceId: string;
}

export async function unsubscribe({
  client,
  subscriptionId,
  resourceId,
}: UnsubscribeOptions) {
  await client.stopWatching.stopWatching({
    id: subscriptionId,
    resourceId,
  });
}

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
    accessToken: accessToken ?? account.accessToken,
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

export async function handler() {
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

    const account = await findAccount({ accountId: channel.accountId });

    if (!account.accessToken) {
      return new Response("Failed to obtain a valid access token", {
        status: 500,
      });
    }

    if (channel.type === "google.calendar") {
      await handleCalendarListMessage({ channel, headers, account: account as Account & { accessToken: string } });
    } else if (channel.type === "google.event") {
      await handleEventsMessage({ channel, headers, account: account as Account & { accessToken: string } });
    } else {
      return new Response("Invalid channel type", { status: 400 });
    }

    return new Response(null, { status: 204 });
  };

  return {
    POST,
  };
}
