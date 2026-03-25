import type { GoogleCalendar } from "@repo/google-calendar";

import type { Calendar } from "../../../interfaces";
import type {
  CalendarProviderCalendarsCreateOptions,
  CalendarProviderCalendarsDeleteOptions,
  CalendarProviderCalendarsGetOptions,
  CalendarProviderCalendarsUpdateOptions,
} from "../../../interfaces/providers";
import { ProviderError } from "../../../lib/provider-error";
import { parseGoogleCalendarCalendarListEntry } from "./utils";

export class GoogleCalendarCalendars {
  constructor(
    private readonly client: GoogleCalendar,
    private readonly providerAccountId: string,
  ) {}

  async list(): Promise<Calendar[]> {
    return this.withErrorHandler("calendars.list", async () => {
      const { items } = await this.client.users.me.calendarList.list();

      if (!items) {
        return [];
      }

      return items.map((calendar) =>
        parseGoogleCalendarCalendarListEntry({
          providerAccountId: this.providerAccountId,
          entry: calendar,
        }),
      );
    });
  }

  async get({
    calendarId,
  }: CalendarProviderCalendarsGetOptions): Promise<Calendar> {
    return this.withErrorHandler("calendars.get", async () => {
      const calendar =
        await this.client.users.me.calendarList.retrieve(calendarId);

      return parseGoogleCalendarCalendarListEntry({
        providerAccountId: this.providerAccountId,
        entry: calendar,
      });
    });
  }

  async create({
    calendar,
  }: CalendarProviderCalendarsCreateOptions): Promise<Calendar> {
    return this.withErrorHandler("calendars.create", async () => {
      const createdCalendar = await this.client.calendars.create({
        summary: calendar.name,
        description: calendar.description,
        timeZone: calendar.timeZone,
      });

      return parseGoogleCalendarCalendarListEntry({
        providerAccountId: this.providerAccountId,
        entry: createdCalendar,
      });
    });
  }

  async update({
    calendarId,
    calendar,
  }: CalendarProviderCalendarsUpdateOptions): Promise<Calendar> {
    return this.withErrorHandler("calendars.update", async () => {
      const updatedCalendar = await this.client.calendars.update(calendarId, {
        summary: calendar.name,
      });

      return parseGoogleCalendarCalendarListEntry({
        providerAccountId: this.providerAccountId,
        entry: updatedCalendar,
      });
    });
  }

  async delete({
    calendarId,
  }: CalendarProviderCalendarsDeleteOptions): Promise<void> {
    return this.withErrorHandler("calendars.delete", async () => {
      await this.client.calendars.delete(calendarId);
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
