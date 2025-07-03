import { db } from "@repo/db";
import { GoogleCalendar } from "@repo/google-calendar";
import { eq } from "drizzle-orm";
import { calendars, events, account as accounts } from "@repo/db/schema";
import { parseGoogleCalendarEvent, parseGoogleCalendarCalendarListEntry } from "./utils";
import { Temporal } from "temporal-polyfill";

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

// Utility: parse the `X-Goog-Channel-Token` header. We expect a base64 encoded JSON string
// of the shape: { type: "google.calendar-list" | "google.calendar-events", accountId: string, calendarId?: string }
function parseToken(token?: string | null):
  | ({
      type: "google.calendar-list" | "google.calendar-events";
      accountId: string;
      calendarId?: string;
    })
  | null {
  if (!token) return null;

  try {
    const decoded = Buffer.from(token, "base64").toString("utf8");
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

// Helper to convert Temporal.* values to javascript Date for database persistence
function temporalToDate(
  value: Temporal.PlainDate | Temporal.Instant | Temporal.ZonedDateTime,
): Date {
  if (value instanceof Temporal.Instant) {
    return new Date(value.epochMilliseconds);
  }

  if (value instanceof Temporal.ZonedDateTime) {
    return new Date(value.toInstant().epochMilliseconds);
  }

  // Temporal.PlainDate
  return new Date(value.toString());
}

export async function handleCalendarListMessage(request: Request) {
  const token = parseToken(request.headers.get("X-Goog-Channel-Token"));
  if (!token || token.type !== "google.calendar-list") {
    return;
  }

  // Locate account so that we can talk to Google on its behalf
  const [accountRow] = await db
    .select()
    .from(accounts)
    .where(eq(accounts.id, token.accountId));

  if (!accountRow?.accessToken) return;

  const client = new GoogleCalendar({ accessToken: accountRow.accessToken });

  // Fetch latest calendar list
  const { items } = await client.users.me.calendarList.list();
  if (!items) return;

  // Upsert calendars
  for (const item of items) {
    if (!item.id) continue;

    // Use utils parser to transform API response into internal Calendar type
    const parsedCalendar = parseGoogleCalendarCalendarListEntry({
      accountId: accountRow.id,
      entry: item,
    });

    const values = {
      id: parsedCalendar.id,
      name: parsedCalendar.name,
      description: parsedCalendar.description ?? null,
      timeZone: parsedCalendar.timeZone ?? null,
      primary: parsedCalendar.primary,
      color: parsedCalendar.color ?? null,
      calendarId: parsedCalendar.id,
      providerId: "google" as const,
      accountId: parsedCalendar.accountId,
      updatedAt: new Date(),
    };

    const calendarIdStr = parsedCalendar.id;

    const existing = await db.query.calendars.findFirst({
      where: (table, { eq }) => eq(table.id, calendarIdStr),
    });

    if (existing) {
      await db.update(calendars).set(values).where(eq(calendars.id, calendarIdStr));
    } else {
      await db.insert(calendars).values({
        ...values,
        createdAt: new Date(),
      });
    }
  }
}

export async function handleEventsMessage(request: Request) {
  const token = parseToken(request.headers.get("X-Goog-Channel-Token"));
  if (!token || token.type !== "google.calendar-events" || !token.calendarId) {
    return;
  }

  const calendarId = token.calendarId;

  // Locate account & calendar rows
  const [accountRow] = await db
    .select()
    .from(accounts)
    .where(eq(accounts.id, token.accountId));
  if (!accountRow?.accessToken) return;

  const [calendarRow] = await db
    .select()
    .from(calendars)
    .where(eq(calendars.id, calendarId));

  const client = new GoogleCalendar({ accessToken: accountRow.accessToken });

  const listParams: Record<string, unknown> = {
    singleEvents: true,
    showDeleted: true,
    maxResults: 2500,
  };

  if (calendarRow?.syncToken) {
    listParams["syncToken"] = calendarRow.syncToken;
  }

  const response = await client.calendars.events.list(calendarId, listParams);

  // Persist nextSyncToken if present
  if (response.nextSyncToken) {
    await db
      .update(calendars)
      .set({ syncToken: response.nextSyncToken, updatedAt: new Date() })
      .where(eq(calendars.id, calendarId));
  }

  const items = response.items ?? [];
  if (items.length === 0) return;

  const calendarObj = {
    id: calendarId,
    name: calendarRow?.name ?? "",
    readOnly: calendarRow?.primary === false,
    providerId: "google" as const,
    accountId: accountRow.id,
    timeZone: calendarRow?.timeZone ?? undefined,
    primary: Boolean(calendarRow?.primary),
    color: calendarRow?.color ?? null,
  } as const;

  for (const event of items) {
    if (event.status === "cancelled") {
      // Delete locally
      await db.delete(events).where(eq(events.id, event.id!));
      continue;
    }

    const parsed = parseGoogleCalendarEvent({
      calendar: calendarObj as any, // minimal calendar satisfies function
      accountId: accountRow.id,
      event,
    });

    const values = { 
      id: parsed.id,
      title: parsed.title,
      description: parsed.description ?? null,
      start: temporalToDate(parsed.start),
      startTimeZone: "timeZone" in parsed.start ? (parsed.start as any).timeZone : null,
      end: temporalToDate(parsed.end),
      endTimeZone: "timeZone" in parsed.end ? (parsed.end as any).timeZone : null,
      allDay: parsed.allDay,
      location: parsed.location ?? null,
      status: parsed.status ?? null,
      url: parsed.url ?? null,
      calendarId: calendarId,
      providerId: "google" as const,
      accountId: accountRow.id,
    
      } as const;

    const existingEvent = await db.query.events.findFirst({
      where: (table, { eq }) => eq(table.id, parsed.id),
    });

    await db.insert(events).values(values).onConflictDoUpdate({
        target: [events.id],
        set: {
          ...values,
        },
      });
  }
}

export async function handler() {
  const POST = async (request: Request) => {
    // Quick health-check: Google expects a 2xx response to acknowledge.

    // Decide which handler to invoke based on the token header
    const token = parseToken(request.headers.get("X-Goog-Channel-Token"));

    if (!token) {
      return new Response("Missing or invalid channel token", { status: 202 });
    }

    if (token.type === "google.calendar-list") {
      await handleCalendarListMessage(request);
    } else if (token.type === "google.calendar-events") {
      await handleEventsMessage(request);
    }

    return new Response(null, { status: 204 });
  };

  return {
    POST,
  };
}