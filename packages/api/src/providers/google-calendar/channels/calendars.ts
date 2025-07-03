import { Channel, ChannelHeaders } from "./headers";
import { GoogleCalendar } from "@repo/google-calendar";
import { db } from "@repo/db";
import { calendars } from "@repo/db/schema";
import { parseGoogleCalendarCalendarListEntry } from "../utils";
import { Account } from "@repo/auth/server";
import { revalidateTag } from "next/cache";

interface HandleCalendarListMessageOptions {
  channel: Channel;
  headers: ChannelHeaders;
  account: Account & { accessToken: string };
}

export async function handleCalendarListMessage({
  channel,
  headers,
  account,
}: HandleCalendarListMessageOptions) {
  const calendar = await db.query.calendars.findFirst({
    where: (table, { eq }) => eq(table.id, channel.resourceId),
  });

  if (!calendar) {
    throw new Error(`Calendar ${channel.resourceId} not found`);
  }

  revalidateTag(`calendar.${calendar.accountId}.${calendar.id}`);

  // const client = new GoogleCalendar({ accessToken: account.accessToken });

  // const { items } = await client.users.me.calendarList.list();
  // if (!items) {
  //   return;
  // }

  // for (const item of items) {
  //   if (!item.id) continue;

  //   const parsedCalendar = parseGoogleCalendarCalendarListEntry({
  //     accountId: account.id,
  //     entry: item,
  //   });

  //   const values = {
  //     id: parsedCalendar.id,
  //     name: parsedCalendar.name,
  //     description: parsedCalendar.description ?? null,
  //     timeZone: parsedCalendar.timeZone ?? null,
  //     primary: parsedCalendar.primary,
  //     color: parsedCalendar.color ?? null,
  //     calendarId: parsedCalendar.id,
  //     providerId: "google" as const,
  //     accountId: parsedCalendar.accountId,
  //     updatedAt: new Date(),
  //   };
  // }
}
