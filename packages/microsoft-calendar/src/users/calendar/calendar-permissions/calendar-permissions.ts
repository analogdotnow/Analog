import type { MicrosoftCalendar } from "../../../client";
import type {
  DefaultCalendarCalendarPermissionGetCountInput,
  DefaultCalendarCalendarPermissionGetCountResponse,
  DefaultCalendarCreateCalendarPermissionInput,
  DefaultCalendarCreateCalendarPermissionResponse,
  DefaultCalendarDeleteCalendarPermissionInput,
  DefaultCalendarGetCalendarPermissionInput,
  DefaultCalendarGetCalendarPermissionResponse,
  DefaultCalendarListCalendarPermissionInput,
  DefaultCalendarListCalendarPermissionResponse,
  DefaultCalendarUpdateCalendarPermissionInput,
  DefaultCalendarUpdateCalendarPermissionResponse,
} from "./interfaces";

export class CalendarPermissions {
  constructor(private readonly client: MicrosoftCalendar) {}

  async list(
    params: DefaultCalendarListCalendarPermissionInput,
  ): Promise<DefaultCalendarListCalendarPermissionResponse> {
    return this.client.get<DefaultCalendarListCalendarPermissionResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendar/calendarPermissions`,
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
    params: DefaultCalendarCreateCalendarPermissionInput,
  ): Promise<DefaultCalendarCreateCalendarPermissionResponse> {
    return this.client.post<DefaultCalendarCreateCalendarPermissionResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendar/calendarPermissions`,
      undefined,
      params.calendarPermission,
      params.signal,
      params.headers,
    );
  }

  async $count(
    params: DefaultCalendarCalendarPermissionGetCountInput,
  ): Promise<DefaultCalendarCalendarPermissionGetCountResponse> {
    return this.client.number(
      `/users/${encodeURIComponent(params.userId)}/calendar/calendarPermissions/$count`,
      {
        $search: params.search,
        $filter: params.filter,
      },
      params.signal,
      params.headers,
    );
  }

  async delete(
    params: DefaultCalendarDeleteCalendarPermissionInput,
  ): Promise<void> {
    return this.client.delete(
      `/users/${encodeURIComponent(params.userId)}/calendar/calendarPermissions/${encodeURIComponent(params.calendarPermissionId)}`,
      undefined,
      params.signal,
      {
        ...(params.ifMatch ? { "If-Match": params.ifMatch } : {}),
        ...params.headers,
      },
    );
  }

  async get(
    params: DefaultCalendarGetCalendarPermissionInput,
  ): Promise<DefaultCalendarGetCalendarPermissionResponse> {
    return this.client.get<DefaultCalendarGetCalendarPermissionResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendar/calendarPermissions/${encodeURIComponent(params.calendarPermissionId)}`,
      {
        $select: params.select,
        $expand: params.expand,
      },
      params.signal,
      params.headers,
    );
  }

  async update(
    params: DefaultCalendarUpdateCalendarPermissionInput,
  ): Promise<DefaultCalendarUpdateCalendarPermissionResponse> {
    return this.client.patch<DefaultCalendarUpdateCalendarPermissionResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendar/calendarPermissions/${encodeURIComponent(params.calendarPermissionId)}`,
      undefined,
      params.calendarPermission,
      params.signal,
      params.headers,
    );
  }
}
