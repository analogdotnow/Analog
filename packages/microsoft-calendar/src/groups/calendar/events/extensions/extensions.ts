import type { MicrosoftCalendar } from "../../../../client";
import type { ListMoreInput } from "../../../../interfaces";
import type {
  GroupCalendarEventCreateExtensionInput,
  GroupCalendarEventCreateExtensionResponse,
  GroupCalendarEventDeleteExtensionInput,
  GroupCalendarEventExtensionGetCountInput,
  GroupCalendarEventExtensionGetCountResponse,
  GroupCalendarEventGetExtensionInput,
  GroupCalendarEventGetExtensionResponse,
  GroupCalendarEventListExtensionInput,
  GroupCalendarEventListExtensionResponse,
  GroupCalendarEventUpdateExtensionInput,
  GroupCalendarEventUpdateExtensionResponse,
} from "./interfaces";

export class Extensions {
  constructor(private readonly client: MicrosoftCalendar) {}

  async list(
    params: GroupCalendarEventListExtensionInput,
  ): Promise<GroupCalendarEventListExtensionResponse> {
    return this.client.get<GroupCalendarEventListExtensionResponse>(
      `/groups/${encodeURIComponent(params.groupId)}/calendar/events/${encodeURIComponent(params.eventId)}/extensions`,
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
  ): Promise<GroupCalendarEventListExtensionResponse> {
    return this.client.get<GroupCalendarEventListExtensionResponse>(
      params.nextLink,
      undefined,
      params.signal,
      params.headers,
    );
  }

  async create(
    params: GroupCalendarEventCreateExtensionInput,
  ): Promise<GroupCalendarEventCreateExtensionResponse> {
    return this.client.post<GroupCalendarEventCreateExtensionResponse>(
      `/groups/${encodeURIComponent(params.groupId)}/calendar/events/${encodeURIComponent(params.eventId)}/extensions`,
      undefined,
      params.extension,
      params.signal,
      params.headers,
    );
  }

  async $count(
    params: GroupCalendarEventExtensionGetCountInput,
  ): Promise<GroupCalendarEventExtensionGetCountResponse> {
    return this.client.number(
      `/groups/${encodeURIComponent(params.groupId)}/calendar/events/${encodeURIComponent(params.eventId)}/extensions/$count`,
      {
        $search: params.search,
        $filter: params.filter,
      },
      params.signal,
      params.headers,
    );
  }

  async delete(params: GroupCalendarEventDeleteExtensionInput): Promise<void> {
    return this.client.delete(
      `/groups/${encodeURIComponent(params.groupId)}/calendar/events/${encodeURIComponent(params.eventId)}/extensions/${encodeURIComponent(params.extensionId)}`,
      undefined,
      params.signal,
      {
        ...(params.ifMatch ? { "If-Match": params.ifMatch } : {}),
        ...params.headers,
      },
    );
  }

  async get(
    params: GroupCalendarEventGetExtensionInput,
  ): Promise<GroupCalendarEventGetExtensionResponse> {
    return this.client.get<GroupCalendarEventGetExtensionResponse>(
      `/groups/${encodeURIComponent(params.groupId)}/calendar/events/${encodeURIComponent(params.eventId)}/extensions/${encodeURIComponent(params.extensionId)}`,
      {
        $select: params.select,
        $expand: params.expand,
      },
      params.signal,
      params.headers,
    );
  }

  async update(
    params: GroupCalendarEventUpdateExtensionInput,
  ): Promise<GroupCalendarEventUpdateExtensionResponse> {
    return this.client.patch<GroupCalendarEventUpdateExtensionResponse>(
      `/groups/${encodeURIComponent(params.groupId)}/calendar/events/${encodeURIComponent(params.eventId)}/extensions/${encodeURIComponent(params.extensionId)}`,
      undefined,
      params.extension,
      params.signal,
      params.headers,
    );
  }
}
