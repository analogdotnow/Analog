import type {
  CalendarCollectionResponse,
  GetDefaultCalendarInput,
  MicrosoftCalendar,
  UpdateDefaultCalendarInput,
} from "@analog/microsoft-calendar";

import type { Calendar } from "../../../interfaces";
import type {
  CalendarProviderCalendarsCreateOptions,
  CalendarProviderCalendarsDeleteOptions,
  CalendarProviderCalendarsGetOptions,
  CalendarProviderCalendarsUpdateOptions,
} from "../../../interfaces/providers";
import { ProviderError } from "../../../lib/provider-error";
import { parseMicrosoftCalendar } from "./utils";

export class MicrosoftCalendarCalendars {
  constructor(
    private readonly client: MicrosoftCalendar,
    private readonly providerAccountId: string,
  ) {}

  // "primary" is an app-level alias for the default calendar, which Graph
  // addresses via /me/calendar instead of /me/calendars/{id}.
  private calendarFor(calendarId: string) {
    if (calendarId === "primary") {
      return this.client.users.calendar;
    }

    const calendars = this.client.users.calendars;

    return {
      get: (params: GetDefaultCalendarInput) =>
        calendars.get({ ...params, calendarId }),
      update: (params: UpdateDefaultCalendarInput) =>
        calendars.update({ ...params, calendarId }),
    };
  }

  async list(): Promise<Calendar[]> {
    return this.withErrorHandler("calendars.list", async () => {
      const listPages = async (
        response: CalendarCollectionResponse,
      ): Promise<Calendar[]> => {
        const calendars = (response.value ?? []).map((calendar) =>
          parseMicrosoftCalendar({
            calendar,
            providerAccountId: this.providerAccountId,
          }),
        );

        if (!response["@odata.nextLink"]) {
          return calendars;
        }

        const nextPage = await this.client.users.calendars.listMore({
          nextLink: response["@odata.nextLink"],
        });

        return calendars.concat(await listPages(nextPage));
      };

      const response = await this.client.users.calendars.list({
        userId: "me",
        select: [
          "id",
          "name",
          "isDefaultCalendar",
          "canEdit",
          "hexColor",
          "isRemovable",
          "owner",
          "calendarPermissions",
        ],
      });

      return listPages(response);
    });
  }

  async get({
    calendarId,
  }: CalendarProviderCalendarsGetOptions): Promise<Calendar> {
    return this.withErrorHandler("calendars.get", async () => {
      const select = [
        "id",
        "name",
        "isDefaultCalendar",
        "canEdit",
        "hexColor",
        "owner",
        "calendarPermissions",
      ];

      const calendar = await this.calendarFor(calendarId).get({
        userId: "me",
        select,
      });

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
      const createdCalendar = await this.client.users.calendars.create({
        userId: "me",
        calendar: {
          name: calendar.name,
        },
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
      const updatedCalendar = await this.calendarFor(calendarId).update({
        userId: "me",
        calendar: { name: calendar.name },
      });

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
      // Graph forbids deleting the default calendar (isRemovable: false), so
      // fail with a clear error instead of sending the literal id "primary".
      if (calendarId === "primary") {
        throw new Error("The default calendar cannot be deleted");
      }

      await this.client.users.calendars.delete({ userId: "me", calendarId });
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
