import { Client } from "@microsoft/microsoft-graph-client";

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
  private graphClient: Client;
  public readonly calendars: MicrosoftCalendarCalendars;
  public readonly events: MicrosoftCalendarEvents;
  public readonly freeBusy: MicrosoftCalendarFreeBusy;

  constructor({
    accessToken,
    providerAccountId,
  }: MicrosoftCalendarProviderOptions) {
    this.providerAccountId = providerAccountId;
    this.graphClient = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => accessToken,
      },
    });
    this.calendars = new MicrosoftCalendarCalendars(
      this.graphClient,
      providerAccountId,
    );
    this.events = new MicrosoftCalendarEvents(this.graphClient);
    this.freeBusy = new MicrosoftCalendarFreeBusy(this.graphClient);
  }
}
