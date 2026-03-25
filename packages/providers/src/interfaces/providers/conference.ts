import type { Conference } from "../../interfaces";

export interface ConferencingProviderCreateConferenceOptions {
  agenda: string;
  startTime: string;
  endTime: string;
  timeZone?: string;
  calendarId?: string;
  eventId?: string;
}

export interface ConferencingProvider {
  providerId: "zoom" | "google";
  createConference(
    options: ConferencingProviderCreateConferenceOptions,
  ): Promise<Conference>;
}
