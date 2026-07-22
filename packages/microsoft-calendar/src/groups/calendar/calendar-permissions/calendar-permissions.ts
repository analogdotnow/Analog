import type { MicrosoftCalendar } from "../../../client";
import type { ListMoreInput } from "../../../interfaces";
import type {
  GroupCalendarCalendarPermissionGetCountInput,
  GroupCalendarCalendarPermissionGetCountResponse,
  GroupCalendarCreateCalendarPermissionInput,
  GroupCalendarCreateCalendarPermissionResponse,
  GroupCalendarDeleteCalendarPermissionInput,
  GroupCalendarGetCalendarPermissionInput,
  GroupCalendarGetCalendarPermissionResponse,
  GroupCalendarListCalendarPermissionInput,
  GroupCalendarListCalendarPermissionResponse,
  GroupCalendarUpdateCalendarPermissionInput,
  GroupCalendarUpdateCalendarPermissionResponse,
} from "./interfaces";

export class CalendarPermissions {
  constructor(private readonly client: MicrosoftCalendar) {}

  async list(
    params: GroupCalendarListCalendarPermissionInput,
  ): Promise<GroupCalendarListCalendarPermissionResponse> {
    return this.client.get<GroupCalendarListCalendarPermissionResponse>(
      `/groups/${encodeURIComponent(params.groupId)}/calendar/calendarPermissions`,
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
  ): Promise<GroupCalendarListCalendarPermissionResponse> {
    return this.client.get<GroupCalendarListCalendarPermissionResponse>(
      params.nextLink,
      undefined,
      params.signal,
      params.headers,
    );
  }

  async create(
    params: GroupCalendarCreateCalendarPermissionInput,
  ): Promise<GroupCalendarCreateCalendarPermissionResponse> {
    return this.client.post<GroupCalendarCreateCalendarPermissionResponse>(
      `/groups/${encodeURIComponent(params.groupId)}/calendar/calendarPermissions`,
      undefined,
      params.calendarPermission,
      params.signal,
      params.headers,
    );
  }

  async $count(
    params: GroupCalendarCalendarPermissionGetCountInput,
  ): Promise<GroupCalendarCalendarPermissionGetCountResponse> {
    return this.client.number(
      `/groups/${encodeURIComponent(params.groupId)}/calendar/calendarPermissions/$count`,
      {
        $search: params.search,
        $filter: params.filter,
      },
      params.signal,
      params.headers,
    );
  }

  async delete(
    params: GroupCalendarDeleteCalendarPermissionInput,
  ): Promise<void> {
    return this.client.delete(
      `/groups/${encodeURIComponent(params.groupId)}/calendar/calendarPermissions/${encodeURIComponent(params.calendarPermissionId)}`,
      undefined,
      params.signal,
      {
        ...(params.ifMatch ? { "If-Match": params.ifMatch } : {}),
        ...params.headers,
      },
    );
  }

  async get(
    params: GroupCalendarGetCalendarPermissionInput,
  ): Promise<GroupCalendarGetCalendarPermissionResponse> {
    return this.client.get<GroupCalendarGetCalendarPermissionResponse>(
      `/groups/${encodeURIComponent(params.groupId)}/calendar/calendarPermissions/${encodeURIComponent(params.calendarPermissionId)}`,
      {
        $select: params.select,
        $expand: params.expand,
      },
      params.signal,
      params.headers,
    );
  }

  async update(
    params: GroupCalendarUpdateCalendarPermissionInput,
  ): Promise<GroupCalendarUpdateCalendarPermissionResponse> {
    return this.client.patch<GroupCalendarUpdateCalendarPermissionResponse>(
      `/groups/${encodeURIComponent(params.groupId)}/calendar/calendarPermissions/${encodeURIComponent(params.calendarPermissionId)}`,
      undefined,
      params.calendarPermission,
      params.signal,
      params.headers,
    );
  }
}
