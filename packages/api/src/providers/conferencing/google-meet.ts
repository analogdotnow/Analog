import GoogleCalendar from "@repo/google-calendar";

import type { Conference } from "../../interfaces";
import { parseGoogleCalendarConferenceData } from "../calendars/google-calendar/conferences";
import { ProviderError } from "../lib/provider-error";
import type { ConferencingProvider } from "./interfaces";

interface GoogleMeetProviderOptions {
  accessToken: string;
  refreshToken: string;
  accountId: string;
}

export class GoogleMeetProvider implements ConferencingProvider {
  public readonly providerId = "google" as const;
  public readonly accountId: string;
  private client: GoogleCalendar;

  constructor({
    accessToken,
    refreshToken,
    accountId,
  }: GoogleMeetProviderOptions) {
    this.accountId = accountId;
    // Note: conferencing provider can use same refresh logic as calendar provider when needed
    this.client = new GoogleCalendar({
      accessToken,
    });
  }

  async createConference(
    agenda: string,
    startTime: string,
    endTime: string,
    timeZone?: string,
    calendarId?: string,
    eventId?: string,
  ): Promise<Conference> {
    return this.withErrorHandler("createConferencing", async () => {
      if (!eventId || !calendarId) {
        throw new Error("Google Meet requires a calendarId and eventId");
      }

      const existingEvent = await this.client.calendars.events.retrieve(
        eventId,
        {
          calendarId,
        },
      );

      const updatedEvent = await this.client.calendars.events.update(eventId, {
        calendarId,
        ...existingEvent,
        conferenceDataVersion: 1, // This ensures the conference data is created, DO NOT REMOVE
        conferenceData: {
          createRequest: {
            requestId: crypto.randomUUID(),
            conferenceSolutionKey: {
              type: "hangoutsMeet",
            },
          },
        },
      });

      if (!updatedEvent.conferenceData) {
        throw new Error("Failed to create conference data");
      }

      return parseGoogleCalendarConferenceData(updatedEvent)!;
    });
  }

  private async withErrorHandler<T>(
    operation: string,
    fn: () => Promise<T> | T,
    context?: Record<string, unknown>,
  ): Promise<T> {
    try {
      return await Promise.resolve(fn());
    } catch (error: unknown) {
      console.error(`Failed to ${operation}:`, error);

      throw new ProviderError(error as Error, operation, context);
    }
  }
}
