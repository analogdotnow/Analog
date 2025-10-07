import type { Conference } from "../../interfaces";

export interface ConferencingProvider {
  providerId: "zoom" | "google";
  createConference(
    agenda: string,
    startTime: string,
    endTime: string,
    timeZone?: string,
    calendarId?: string,
    eventId?: string,
  ): Promise<Conference>;
}
