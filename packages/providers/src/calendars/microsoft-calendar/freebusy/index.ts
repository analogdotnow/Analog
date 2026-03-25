import { Client } from "@microsoft/microsoft-graph-client";
import type { ScheduleInformation } from "@microsoft/microsoft-graph-types";

import type {
  CalendarProviderFreeBusy,
  CalendarProviderFreeBusyQueryOptions,
} from "../../../interfaces/providers";
import { ProviderError } from "../../../lib/provider-error";
import { toMicrosoftDate } from "../utils";
import { parseScheduleItem } from "./utils";

interface MicrosoftScheduleResponse {
  value: ScheduleInformation[];
}

export class MicrosoftCalendarFreeBusy implements CalendarProviderFreeBusy {
  constructor(private readonly graphClient: Client) {}

  async query({
    schedules,
    timeMin,
    timeMax,
  }: CalendarProviderFreeBusyQueryOptions) {
    return this.withErrorHandler("freeBusy.query", async () => {
      const body = {
        schedules,
        startTime: toMicrosoftDate({ value: timeMin }),
        endTime: toMicrosoftDate({ value: timeMax }),
      };

      const response: MicrosoftScheduleResponse = await this.graphClient
        .api("/me/calendar/getSchedule")
        .post(body);

      // TODO: Handle errors
      const data = response.value;

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
