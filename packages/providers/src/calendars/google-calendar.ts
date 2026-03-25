import { GoogleCalendar } from "@repo/google-calendar";

import type { CalendarProvider } from "../interfaces/providers";
import { GoogleCalendarCalendars } from "./google-calendar/calendars";
import { GoogleCalendarEvents } from "./google-calendar/events";
import { GoogleCalendarFreeBusy } from "./google-calendar/freebusy";
import { GoogleCalendarNotifications } from "./google-calendar/notifications";

export type { GoogleCalendarEvent } from "./google-calendar/interfaces";

interface GoogleCalendarProviderOptions {
  accessToken: string;
  providerAccountId: string;
}

export class GoogleCalendarProvider implements CalendarProvider {
  public readonly providerId = "google" as const;
  public readonly providerAccountId: string;
  private client: GoogleCalendar;
  public readonly calendars: GoogleCalendarCalendars;
  public readonly events: GoogleCalendarEvents;
  public readonly freeBusy: GoogleCalendarFreeBusy;
  public readonly notifications: GoogleCalendarNotifications;

  constructor({
    accessToken,
    providerAccountId,
  }: GoogleCalendarProviderOptions) {
    this.providerAccountId = providerAccountId;
    this.client = new GoogleCalendar({
      accessToken,
    });
    this.calendars = new GoogleCalendarCalendars(
      this.client,
      providerAccountId,
    );
    this.events = new GoogleCalendarEvents(this.client);
    this.freeBusy = new GoogleCalendarFreeBusy(this.client);
    this.notifications = new GoogleCalendarNotifications(this.client);
  }
}
