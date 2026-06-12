import type { MicrosoftCalendar } from "../../../../../client";
import type {
  CalendarGroupCalendarEventCreateExtensionInput,
  CalendarGroupCalendarEventCreateExtensionResponse,
  CalendarGroupCalendarEventDeleteExtensionInput,
  CalendarGroupCalendarEventExtensionGetCountInput,
  CalendarGroupCalendarEventExtensionGetCountResponse,
  CalendarGroupCalendarEventGetExtensionInput,
  CalendarGroupCalendarEventGetExtensionResponse,
  CalendarGroupCalendarEventListExtensionInput,
  CalendarGroupCalendarEventListExtensionResponse,
  CalendarGroupCalendarEventUpdateExtensionInput,
  CalendarGroupCalendarEventUpdateExtensionResponse,
} from "./interfaces";

export class Extensions {
  constructor(private readonly client: MicrosoftCalendar) {}

  async list(
    params: CalendarGroupCalendarEventListExtensionInput,
  ): Promise<CalendarGroupCalendarEventListExtensionResponse> {
    return this.client.get<CalendarGroupCalendarEventListExtensionResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/extensions`,
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
    params: CalendarGroupCalendarEventCreateExtensionInput,
  ): Promise<CalendarGroupCalendarEventCreateExtensionResponse> {
    return this.client.post<CalendarGroupCalendarEventCreateExtensionResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/extensions`,
      undefined,
      params.extension,
      params.signal,
      params.headers,
    );
  }

  async $count(
    params: CalendarGroupCalendarEventExtensionGetCountInput,
  ): Promise<CalendarGroupCalendarEventExtensionGetCountResponse> {
    return this.client.number(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/extensions/$count`,
      {
        $search: params.search,
        $filter: params.filter,
      },
      params.signal,
      params.headers,
    );
  }

  async delete(
    params: CalendarGroupCalendarEventDeleteExtensionInput,
  ): Promise<void> {
    return this.client.delete(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/extensions/${encodeURIComponent(params.extensionId)}`,
      undefined,
      params.signal,
      {
        ...(params.ifMatch ? { "If-Match": params.ifMatch } : {}),
        ...params.headers,
      },
    );
  }

  async get(
    params: CalendarGroupCalendarEventGetExtensionInput,
  ): Promise<CalendarGroupCalendarEventGetExtensionResponse> {
    return this.client.get<CalendarGroupCalendarEventGetExtensionResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/extensions/${encodeURIComponent(params.extensionId)}`,
      {
        $select: params.select,
        $expand: params.expand,
      },
      params.signal,
      params.headers,
    );
  }

  async update(
    params: CalendarGroupCalendarEventUpdateExtensionInput,
  ): Promise<CalendarGroupCalendarEventUpdateExtensionResponse> {
    return this.client.patch<CalendarGroupCalendarEventUpdateExtensionResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/extensions/${encodeURIComponent(params.extensionId)}`,
      undefined,
      params.extension,
      params.signal,
      params.headers,
    );
  }
}
