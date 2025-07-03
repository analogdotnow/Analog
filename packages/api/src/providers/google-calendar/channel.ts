import { db } from "@repo/db";
import { GoogleCalendar } from "@repo/google-calendar";

const DEFAULT_TTL = "3600";

interface SubscribeCalendarListOptions {
  client: GoogleCalendar;
  subscriptionId: string;
  webhookUrl: string;
}

export async function subscribeCalendarList({ client, subscriptionId, webhookUrl }: SubscribeCalendarListOptions) {
  const response = await client.users.me.calendarList.watch({
    id: subscriptionId,
    type: "web_hook",
    address: webhookUrl,
    params: {
      ttl: DEFAULT_TTL
    }
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

export async function subscribeEvents({ client, calendarId, subscriptionId, webhookUrl }: SubscribeEventsOptions) {
  const response = await client.calendars.events.watch(calendarId, {
    id: subscriptionId,
    type: "web_hook",
    address: webhookUrl,
    params: {
      ttl: DEFAULT_TTL
    }
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

export async function unsubscribe({ client, subscriptionId, resourceId }: UnsubscribeOptions) {
  await client.stopWatching.stopWatching({
    id: subscriptionId,
    resourceId,
  });
}

export function handleCalendarListMessage(request: Request) {
  
}

export function handleEventsMessage(request: Request) {
  
}



export async function handler() {
  const POST = async (request: Request) => {
    // Handle channel message
  }

  return {
    POST,
  };
}