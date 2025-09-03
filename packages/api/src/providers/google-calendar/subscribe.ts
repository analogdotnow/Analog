import { GoogleCalendar } from "@repo/google-calendar";

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
    type: "google.calendar" as const,
    subscriptionId,
    resourceId: response.resourceId!,
    expiresAt: new Date(Number(response.expiration!)),
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
    type: "google.event" as const,
    subscriptionId,
    calendarId,
    resourceId: response.resourceId!,
    expiresAt: new Date(Number(response.expiration!)),
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
