import type { MicrosoftCalendar } from "../../../client";
import type { ListMoreInput } from "../../../interfaces";
import type {
  CalendarPermissionGetCountInput,
  CalendarPermissionGetCountResponse,
  CreateCalendarPermissionInput,
  CreateCalendarPermissionResponse,
  DeleteCalendarPermissionInput,
  GetCalendarPermissionInput,
  GetCalendarPermissionResponse,
  ListCalendarPermissionInput,
  ListCalendarPermissionResponse,
  UpdateCalendarPermissionInput,
  UpdateCalendarPermissionResponse,
} from "./interfaces";

export class CalendarPermissions {
  constructor(private readonly client: MicrosoftCalendar) {}

  async list(
    params: ListCalendarPermissionInput,
  ): Promise<ListCalendarPermissionResponse> {
    return this.client.get<ListCalendarPermissionResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendars/${encodeURIComponent(params.calendarId)}/calendarPermissions`,
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
  ): Promise<ListCalendarPermissionResponse> {
    return this.client.get<ListCalendarPermissionResponse>(
      params.nextLink,
      undefined,
      params.signal,
      params.headers,
    );
  }

  async create(
    params: CreateCalendarPermissionInput,
  ): Promise<CreateCalendarPermissionResponse> {
    return this.client.post<CreateCalendarPermissionResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendars/${encodeURIComponent(params.calendarId)}/calendarPermissions`,
      undefined,
      params.calendarPermission,
      params.signal,
      params.headers,
    );
  }

  async $count(
    params: CalendarPermissionGetCountInput,
  ): Promise<CalendarPermissionGetCountResponse> {
    return this.client.number(
      `/users/${encodeURIComponent(params.userId)}/calendars/${encodeURIComponent(params.calendarId)}/calendarPermissions/$count`,
      {
        $search: params.search,
        $filter: params.filter,
      },
      params.signal,
      params.headers,
    );
  }

  async delete(params: DeleteCalendarPermissionInput): Promise<void> {
    return this.client.delete(
      `/users/${encodeURIComponent(params.userId)}/calendars/${encodeURIComponent(params.calendarId)}/calendarPermissions/${encodeURIComponent(params.calendarPermissionId)}`,
      undefined,
      params.signal,
      {
        ...(params.ifMatch ? { "If-Match": params.ifMatch } : {}),
        ...params.headers,
      },
    );
  }

  async get(
    params: GetCalendarPermissionInput,
  ): Promise<GetCalendarPermissionResponse> {
    return this.client.get<GetCalendarPermissionResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendars/${encodeURIComponent(params.calendarId)}/calendarPermissions/${encodeURIComponent(params.calendarPermissionId)}`,
      {
        $select: params.select,
        $expand: params.expand,
      },
      params.signal,
      params.headers,
    );
  }

  async update(
    params: UpdateCalendarPermissionInput,
  ): Promise<UpdateCalendarPermissionResponse> {
    return this.client.patch<UpdateCalendarPermissionResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendars/${encodeURIComponent(params.calendarId)}/calendarPermissions/${encodeURIComponent(params.calendarPermissionId)}`,
      undefined,
      params.calendarPermission,
      params.signal,
      params.headers,
    );
  }
}
