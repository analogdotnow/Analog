import { Client } from "@microsoft/microsoft-graph-client";
import type { Calendar as MicrosoftCalendar } from "@microsoft/microsoft-graph-types";

import type { Calendar } from "../../../interfaces";
import type {
  CalendarProviderCalendarsCreateOptions,
  CalendarProviderCalendarsDeleteOptions,
  CalendarProviderCalendarsGetOptions,
  CalendarProviderCalendarsUpdateOptions,
} from "../../../interfaces/providers";
import { ProviderError } from "../../../lib/provider-error";
import { calendarPath } from "../utils";
import { parseMicrosoftCalendar } from "./utils";

export class MicrosoftCalendarCalendars {
  constructor(
    private readonly graphClient: Client,
    private readonly providerAccountId: string,
  ) {}

  async list(): Promise<Calendar[]> {
    return this.withErrorHandler("calendars.list", async () => {
      const response: { value: MicrosoftCalendar[] } = await this.graphClient
        .api(
          "/me/calendars?$select=id,name,isDefaultCalendar,canEdit,hexColor,isRemovable,owner,calendarPermissions",
        )
        .get();

      return response.value.map((calendar) =>
        parseMicrosoftCalendar({
          calendar,
          providerAccountId: this.providerAccountId,
        }),
      );
    });
  }

  async get({
    calendarId,
  }: CalendarProviderCalendarsGetOptions): Promise<Calendar> {
    return this.withErrorHandler("calendars.get", async () => {
      const calendar: MicrosoftCalendar = await this.graphClient
        .api(calendarPath(calendarId))
        .select(
          "id,name,isDefaultCalendar,canEdit,hexColor,owner,calendarPermissions",
        )
        .get();

      return parseMicrosoftCalendar({
        calendar,
        providerAccountId: this.providerAccountId,
      });
    });
  }

  async create({
    calendar,
  }: CalendarProviderCalendarsCreateOptions): Promise<Calendar> {
    return this.withErrorHandler("calendars.create", async () => {
      const createdCalendar: MicrosoftCalendar = await this.graphClient
        .api("/me/calendars")
        .post({
          name: calendar.name,
        });

      return parseMicrosoftCalendar({
        calendar: createdCalendar,
        providerAccountId: this.providerAccountId,
      });
    });
  }

  async update({
    calendarId,
    calendar,
  }: CalendarProviderCalendarsUpdateOptions): Promise<Calendar> {
    return this.withErrorHandler("calendars.update", async () => {
      const updatedCalendar: MicrosoftCalendar = await this.graphClient
        .api(calendarPath(calendarId))
        .patch(calendar);

      return parseMicrosoftCalendar({
        calendar: updatedCalendar,
        providerAccountId: this.providerAccountId,
      });
    });
  }

  async delete({
    calendarId,
  }: CalendarProviderCalendarsDeleteOptions): Promise<void> {
    return this.withErrorHandler("calendars.delete", async () => {
      await this.graphClient.api(calendarPath(calendarId)).delete();
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
