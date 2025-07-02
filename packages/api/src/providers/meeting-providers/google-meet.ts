import { Temporal } from "temporal-polyfill";

import { GoogleCalendar } from "@repo/google-calendar";

import type {
  CreateMeetingOptions,
  Meeting,
  MeetingProvider,
  UpdateMeetingOptions,
} from "../interfaces";
import { ProviderError } from "../utils";

interface GoogleMeetProviderOptions {
  accessToken: string;
}

export class GoogleMeetProvider implements MeetingProvider {
  public readonly providerId = "google" as const;
  private client: GoogleCalendar;

  constructor({ accessToken }: GoogleMeetProviderOptions) {
    this.client = new GoogleCalendar({
      accessToken,
    });
  }

  async createMeeting(options: CreateMeetingOptions): Promise<Meeting> {
    return this.withErrorHandler("createMeeting", async () => {
      const event = await this.client.calendars.events.create("primary", {
        summary: options.title,
        start: {
          dateTime: options.startTime.toInstant().toString(),
          timeZone: options.timezone,
        },
        end: {
          dateTime: options.startTime
            .add({ minutes: options.duration })
            .toInstant()
            .toString(),
          timeZone: options.timezone,
        },
        conferenceData: {
          createRequest: {
            requestId: `google-meet-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            conferenceSolutionKey: {
              type: "hangoutsMeet",
            },
          },
        },
      });

      const conferenceData = event.conferenceData;
      if (!conferenceData?.entryPoints) {
        throw new Error("Failed to create Google Meet conference data");
      }

      const videoEntry = conferenceData.entryPoints.find(
        (entry) => entry.entryPointType === "video",
      );
      const phoneEntry = conferenceData.entryPoints.find(
        (entry) => entry.entryPointType === "phone",
      );

      if (!videoEntry?.uri) {
        throw new Error(
          "No video entry point found in Google Meet conference data",
        );
      }

      return {
        id: event.id!,
        joinUrl: videoEntry.uri,
        hostUrl: videoEntry.uri, // Google Meet doesn't distinguish host/participant URLs
        password: conferenceData.conferenceId || undefined,
        dialInNumbers: phoneEntry?.uri ? [phoneEntry.uri] : [],
        providerId: "google",
        settings: {
          conferenceId: conferenceData.conferenceId,
          signature: conferenceData.signature,
          entryPoints: conferenceData.entryPoints,
          notes: conferenceData.notes,
        },
      };
    });
  }

  async updateMeeting(
    meetingId: string,
    options: UpdateMeetingOptions,
  ): Promise<Meeting> {
    return this.withErrorHandler("updateMeeting", async () => {
      const updateData: Record<string, any> = {};

      if (options.title) {
        updateData.summary = options.title;
      }

      if (options.startTime) {
        updateData.start = {
          dateTime: options.startTime.toInstant().toString(),
          timeZone: options.timezone || "UTC",
        };

        if (options.duration) {
          updateData.end = {
            dateTime: options.startTime
              .add({ minutes: options.duration })
              .toInstant()
              .toString(),
            timeZone: options.timezone || "UTC",
          };
        }
      }

      const updatedEvent = await this.client.calendars.events.update(
        meetingId,
        {
          calendarId: "primary",
          ...updateData,
        },
      );

      const conferenceData = updatedEvent.conferenceData;
      if (!conferenceData?.entryPoints) {
        throw new Error("No conference data found in updated event");
      }

      const videoEntry = conferenceData.entryPoints.find(
        (entry) => entry.entryPointType === "video",
      );
      const phoneEntry = conferenceData.entryPoints.find(
        (entry) => entry.entryPointType === "phone",
      );

      return {
        id: updatedEvent.id!,
        joinUrl: videoEntry?.uri || "",
        hostUrl: videoEntry?.uri || "",
        password: conferenceData.conferenceId || undefined,
        dialInNumbers: phoneEntry?.uri ? [phoneEntry.uri] : [],
        providerId: "google",
        settings: {
          conferenceId: conferenceData.conferenceId,
          signature: conferenceData.signature,
          entryPoints: conferenceData.entryPoints,
          notes: conferenceData.notes,
        },
      };
    });
  }

  async deleteMeeting(meetingId: string): Promise<void> {
    return this.withErrorHandler("deleteMeeting", async () => {
      await this.client.calendars.events.delete(meetingId, {
        calendarId: "primary",
      });
    });
  }

  async getMeeting(meetingId: string): Promise<Meeting> {
    return this.withErrorHandler("getMeeting", async () => {
      const event = await this.client.calendars.events.retrieve(meetingId, {
        calendarId: "primary",
      });

      const conferenceData = event.conferenceData;
      if (!conferenceData?.entryPoints) {
        throw new Error("No conference data found for this meeting");
      }

      const videoEntry = conferenceData.entryPoints.find(
        (entry) => entry.entryPointType === "video",
      );
      const phoneEntry = conferenceData.entryPoints.find(
        (entry) => entry.entryPointType === "phone",
      );

      if (!videoEntry?.uri) {
        throw new Error("No video entry point found in meeting");
      }

      return {
        id: event.id!,
        joinUrl: videoEntry.uri,
        hostUrl: videoEntry.uri,
        password: conferenceData.conferenceId || undefined,
        dialInNumbers: phoneEntry?.uri ? [phoneEntry.uri] : [],
        providerId: "google",
        settings: {
          conferenceId: conferenceData.conferenceId,
          signature: conferenceData.signature,
          entryPoints: conferenceData.entryPoints,
          notes: conferenceData.notes,
        },
      };
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
