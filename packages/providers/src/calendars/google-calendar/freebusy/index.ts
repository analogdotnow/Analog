import type { GoogleCalendar } from "@repo/google-calendar";

import type {
  CalendarProviderFreeBusy,
  CalendarProviderFreeBusyQueryOptions,
} from "../../../interfaces/providers";
import { ProviderError } from "../../../lib/provider-error";
import { parseGoogleCalendarFreeBusy } from "./utils";

export class GoogleCalendarFreeBusy implements CalendarProviderFreeBusy {
  constructor(private readonly client: GoogleCalendar) {}

  async query({
    schedules,
    timeMin,
    timeMax,
  }: CalendarProviderFreeBusyQueryOptions) {
    return this.withErrorHandler("freeBusy.query", async () => {
      const response = await this.client.checkFreeBusy.checkFreeBusy({
        timeMin: timeMin.withTimeZone("UTC").toInstant().toString(),
        timeMax: timeMax.withTimeZone("UTC").toInstant().toString(),
        timeZone: "UTC",
        items: schedules.map((id) => ({ id })),
      });

      return parseGoogleCalendarFreeBusy(response);
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
