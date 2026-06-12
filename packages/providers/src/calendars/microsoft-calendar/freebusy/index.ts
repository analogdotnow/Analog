import type { MicrosoftCalendar } from "@analog/microsoft-calendar";

import type {
  CalendarProviderFreeBusy,
  CalendarProviderFreeBusyQueryOptions,
} from "../../../interfaces/providers";
import { ProviderError } from "../../../lib/provider-error";
import { toMicrosoftDate } from "../utils";
import { parseScheduleItem } from "./utils";

export class MicrosoftCalendarFreeBusy implements CalendarProviderFreeBusy {
  constructor(private readonly client: MicrosoftCalendar) {}

  async query({
    schedules,
    timeMin,
    timeMax,
  }: CalendarProviderFreeBusyQueryOptions) {
    return this.withErrorHandler("freeBusy.query", async () => {
      const response = await this.client.users.calendar.getSchedule({
        userId: "me",
        schedules,
        startTime: toMicrosoftDate({ value: timeMin }),
        endTime: toMicrosoftDate({ value: timeMax }),
      });

      // TODO: Handle errors
      const data = response.value ?? [];

      return data.map((info) => ({
        scheduleId: info.scheduleId!,
        busy: info.scheduleItems?.map(parseScheduleItem) ?? [],
      }));
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
