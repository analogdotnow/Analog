import type {
  CollectionResponse,
  MicrosoftCalendar,
  ScheduleInformation,
} from "@analog/microsoft-calendar";

import type { CalendarFreeBusy } from "../../../interfaces";
import type {
  CalendarProviderFreeBusy,
  CalendarProviderFreeBusyQueryOptions,
} from "../../../interfaces/providers";
import { ProviderError } from "../../../lib/provider-error";
import { toMicrosoftDate } from "../utils";
import { parseScheduleItem } from "./utils";

const MAX_SCHEDULES_PER_REQUEST = 20;

export class MicrosoftCalendarFreeBusy implements CalendarProviderFreeBusy {
  constructor(private readonly client: MicrosoftCalendar) {}

  async query({
    schedules,
    timeMin,
    timeMax,
  }: CalendarProviderFreeBusyQueryOptions) {
    return this.withErrorHandler("freeBusy.query", async () => {
      const listPages = async (
        response: CollectionResponse<ScheduleInformation>,
      ): Promise<CalendarFreeBusy[]> => {
        const freeBusy = (response.value ?? []).map<CalendarFreeBusy>(
          (info) => {
            if (info.error) {
              return {
                scheduleId: info.scheduleId,
                message: info.error.message ?? "Failed to get schedule",
                code: info.error.responseCode ?? "unknown",
              };
            }

            return {
              scheduleId: info.scheduleId,
              busy: info.scheduleItems?.map(parseScheduleItem) ?? [],
            };
          },
        );

        if (!response["@odata.nextLink"]) {
          return freeBusy;
        }

        const nextPage = await this.client.users.calendar.getScheduleMore({
          nextLink: response["@odata.nextLink"],
        });

        return freeBusy.concat(await listPages(nextPage));
      };

      const batches = Array.from(
        {
          length: Math.ceil(schedules.length / MAX_SCHEDULES_PER_REQUEST),
        },
        (_, index) =>
          schedules.slice(
            index * MAX_SCHEDULES_PER_REQUEST,
            (index + 1) * MAX_SCHEDULES_PER_REQUEST,
          ),
      );

      const freeBusy = await Promise.all(
        batches.map(async (batch) =>
          listPages(
            await this.client.users.calendar.getSchedule({
              userId: "me",
              schedules: batch,
              startTime: toMicrosoftDate({ value: timeMin }),
              endTime: toMicrosoftDate({ value: timeMax }),
            }),
          ),
        ),
      );

      return freeBusy.flat();
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
