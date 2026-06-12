import { MicrosoftCalendar } from "@analog/microsoft-calendar";

import type { CalendarProvider } from "../interfaces/providers";
import { MicrosoftCalendarCalendars } from "./microsoft-calendar/calendars";
import { MicrosoftCalendarEvents } from "./microsoft-calendar/events";
import { MicrosoftCalendarFreeBusy } from "./microsoft-calendar/freebusy";

interface MicrosoftCalendarProviderOptions {
  accessToken: string;
  providerAccountId: string;
}

export class MicrosoftCalendarProvider implements CalendarProvider {
  public readonly providerId = "microsoft" as const;
  public readonly providerAccountId: string;
  private client: MicrosoftCalendar;
  public readonly calendars: MicrosoftCalendarCalendars;
  public readonly events: MicrosoftCalendarEvents;
  public readonly freeBusy: MicrosoftCalendarFreeBusy;

  constructor({
    accessToken,
    providerAccountId,
  }: MicrosoftCalendarProviderOptions) {
    this.providerAccountId = providerAccountId;
    this.client = new MicrosoftCalendar(accessToken);
    this.calendars = new MicrosoftCalendarCalendars(
      this.client,
      providerAccountId,
    );
    this.events = new MicrosoftCalendarEvents(this.client);
    this.freeBusy = new MicrosoftCalendarFreeBusy(this.client);
  }
}
