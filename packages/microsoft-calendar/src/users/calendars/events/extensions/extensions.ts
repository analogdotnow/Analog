import type { MicrosoftCalendar } from "../../../../client";
import type {
  CalendarEventCreateExtensionInput,
  CalendarEventCreateExtensionResponse,
  CalendarEventDeleteExtensionInput,
  CalendarEventExtensionGetCountInput,
  CalendarEventExtensionGetCountResponse,
  CalendarEventGetExtensionInput,
  CalendarEventGetExtensionResponse,
  CalendarEventListExtensionInput,
  CalendarEventListExtensionResponse,
  CalendarEventUpdateExtensionInput,
  CalendarEventUpdateExtensionResponse,
} from "./interfaces";

export class Extensions {
  constructor(private readonly client: MicrosoftCalendar) {}

  async list(
    params: CalendarEventListExtensionInput,
  ): Promise<CalendarEventListExtensionResponse> {
    return this.client.get<CalendarEventListExtensionResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/extensions`,
      {
        $top: params.top,
        $skip: params.skip,
        $search: params.search,
        $filter: params.filter,
        $count: params.count,
        $orderby: params.orderby,
        $select: params.select,
        $expand: params.expand,
      },
      params.signal,
      params.headers,
    );
  }

  async create(
    params: CalendarEventCreateExtensionInput,
  ): Promise<CalendarEventCreateExtensionResponse> {
    return this.client.post<CalendarEventCreateExtensionResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/extensions`,
      undefined,
      params.extension,
      params.signal,
      params.headers,
    );
  }

  async $count(
    params: CalendarEventExtensionGetCountInput,
  ): Promise<CalendarEventExtensionGetCountResponse> {
    return this.client.number(
      `/users/${encodeURIComponent(params.userId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/extensions/$count`,
      {
        $search: params.search,
        $filter: params.filter,
      },
      params.signal,
      params.headers,
    );
  }

  async delete(params: CalendarEventDeleteExtensionInput): Promise<void> {
    return this.client.delete(
      `/users/${encodeURIComponent(params.userId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/extensions/${encodeURIComponent(params.extensionId)}`,
      undefined,
      params.signal,
      {
        ...(params.ifMatch ? { "If-Match": params.ifMatch } : {}),
        ...params.headers,
      },
    );
  }

  async get(
    params: CalendarEventGetExtensionInput,
  ): Promise<CalendarEventGetExtensionResponse> {
    return this.client.get<CalendarEventGetExtensionResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/extensions/${encodeURIComponent(params.extensionId)}`,
      {
        $select: params.select,
        $expand: params.expand,
      },
      params.signal,
      params.headers,
    );
  }

  async update(
    params: CalendarEventUpdateExtensionInput,
  ): Promise<CalendarEventUpdateExtensionResponse> {
    return this.client.patch<CalendarEventUpdateExtensionResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/extensions/${encodeURIComponent(params.extensionId)}`,
      undefined,
      params.extension,
      params.signal,
      params.headers,
    );
  }
}
