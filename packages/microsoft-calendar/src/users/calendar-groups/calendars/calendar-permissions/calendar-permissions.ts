import type { MicrosoftCalendar } from "../../../../client";
import type { ListMoreInput } from "../../../../interfaces";
import type {
  CalendarGroupCalendarCalendarPermissionGetCountInput,
  CalendarGroupCalendarCalendarPermissionGetCountResponse,
  CalendarGroupCalendarCreateCalendarPermissionInput,
  CalendarGroupCalendarCreateCalendarPermissionResponse,
  CalendarGroupCalendarDeleteCalendarPermissionInput,
  CalendarGroupCalendarGetCalendarPermissionInput,
  CalendarGroupCalendarGetCalendarPermissionResponse,
  CalendarGroupCalendarListCalendarPermissionInput,
  CalendarGroupCalendarListCalendarPermissionResponse,
  CalendarGroupCalendarUpdateCalendarPermissionInput,
  CalendarGroupCalendarUpdateCalendarPermissionResponse,
} from "./interfaces";

export class CalendarPermissions {
  constructor(private readonly client: MicrosoftCalendar) {}

  async list(
    params: CalendarGroupCalendarListCalendarPermissionInput,
  ): Promise<CalendarGroupCalendarListCalendarPermissionResponse> {
    return this.client.get<CalendarGroupCalendarListCalendarPermissionResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars/${encodeURIComponent(params.calendarId)}/calendarPermissions`,
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

  async listMore(
    params: ListMoreInput,
  ): Promise<CalendarGroupCalendarListCalendarPermissionResponse> {
    return this.client.get<CalendarGroupCalendarListCalendarPermissionResponse>(
      params.nextLink,
      undefined,
      params.signal,
      params.headers,
    );
  }

  async create(
    params: CalendarGroupCalendarCreateCalendarPermissionInput,
  ): Promise<CalendarGroupCalendarCreateCalendarPermissionResponse> {
    return this.client.post<CalendarGroupCalendarCreateCalendarPermissionResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars/${encodeURIComponent(params.calendarId)}/calendarPermissions`,
      undefined,
      params.calendarPermission,
      params.signal,
      params.headers,
    );
  }

  async $count(
    params: CalendarGroupCalendarCalendarPermissionGetCountInput,
  ): Promise<CalendarGroupCalendarCalendarPermissionGetCountResponse> {
    return this.client.number(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars/${encodeURIComponent(params.calendarId)}/calendarPermissions/$count`,
      {
        $search: params.search,
        $filter: params.filter,
      },
      params.signal,
      params.headers,
    );
  }

  async delete(
    params: CalendarGroupCalendarDeleteCalendarPermissionInput,
  ): Promise<void> {
    return this.client.delete(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars/${encodeURIComponent(params.calendarId)}/calendarPermissions/${encodeURIComponent(params.calendarPermissionId)}`,
      undefined,
      params.signal,
      {
        ...(params.ifMatch ? { "If-Match": params.ifMatch } : {}),
        ...params.headers,
      },
    );
  }

  async get(
    params: CalendarGroupCalendarGetCalendarPermissionInput,
  ): Promise<CalendarGroupCalendarGetCalendarPermissionResponse> {
    return this.client.get<CalendarGroupCalendarGetCalendarPermissionResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars/${encodeURIComponent(params.calendarId)}/calendarPermissions/${encodeURIComponent(params.calendarPermissionId)}`,
      {
        $select: params.select,
        $expand: params.expand,
      },
      params.signal,
      params.headers,
    );
  }

  async update(
    params: CalendarGroupCalendarUpdateCalendarPermissionInput,
  ): Promise<CalendarGroupCalendarUpdateCalendarPermissionResponse> {
    return this.client.patch<CalendarGroupCalendarUpdateCalendarPermissionResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars/${encodeURIComponent(params.calendarId)}/calendarPermissions/${encodeURIComponent(params.calendarPermissionId)}`,
      undefined,
      params.calendarPermission,
      params.signal,
      params.headers,
    );
  }
}
