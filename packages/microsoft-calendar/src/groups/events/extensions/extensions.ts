import type { MicrosoftCalendar } from "../../../client";
import type {
  GroupEventCreateExtensionInput,
  GroupEventCreateExtensionResponse,
  GroupEventDeleteExtensionInput,
  GroupEventExtensionGetCountInput,
  GroupEventExtensionGetCountResponse,
  GroupEventGetExtensionInput,
  GroupEventGetExtensionResponse,
  GroupEventListExtensionInput,
  GroupEventListExtensionResponse,
  GroupEventUpdateExtensionInput,
  GroupEventUpdateExtensionResponse,
} from "./interfaces";

export class Extensions {
  constructor(private readonly client: MicrosoftCalendar) {}

  async list(
    params: GroupEventListExtensionInput,
  ): Promise<GroupEventListExtensionResponse> {
    return this.client.get<GroupEventListExtensionResponse>(
      `/groups/${encodeURIComponent(params.groupId)}/events/${encodeURIComponent(params.eventId)}/extensions`,
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
    params: GroupEventCreateExtensionInput,
  ): Promise<GroupEventCreateExtensionResponse> {
    return this.client.post<GroupEventCreateExtensionResponse>(
      `/groups/${encodeURIComponent(params.groupId)}/events/${encodeURIComponent(params.eventId)}/extensions`,
      undefined,
      params.extension,
      params.signal,
      params.headers,
    );
  }

  async $count(
    params: GroupEventExtensionGetCountInput,
  ): Promise<GroupEventExtensionGetCountResponse> {
    return this.client.number(
      `/groups/${encodeURIComponent(params.groupId)}/events/${encodeURIComponent(params.eventId)}/extensions/$count`,
      {
        $search: params.search,
        $filter: params.filter,
      },
      params.signal,
      params.headers,
    );
  }

  async delete(params: GroupEventDeleteExtensionInput): Promise<void> {
    return this.client.delete(
      `/groups/${encodeURIComponent(params.groupId)}/events/${encodeURIComponent(params.eventId)}/extensions/${encodeURIComponent(params.extensionId)}`,
      undefined,
      params.signal,
      {
        ...(params.ifMatch ? { "If-Match": params.ifMatch } : {}),
        ...params.headers,
      },
    );
  }

  async get(
    params: GroupEventGetExtensionInput,
  ): Promise<GroupEventGetExtensionResponse> {
    return this.client.get<GroupEventGetExtensionResponse>(
      `/groups/${encodeURIComponent(params.groupId)}/events/${encodeURIComponent(params.eventId)}/extensions/${encodeURIComponent(params.extensionId)}`,
      {
        $select: params.select,
        $expand: params.expand,
      },
      params.signal,
      params.headers,
    );
  }

  async update(
    params: GroupEventUpdateExtensionInput,
  ): Promise<GroupEventUpdateExtensionResponse> {
    return this.client.patch<GroupEventUpdateExtensionResponse>(
      `/groups/${encodeURIComponent(params.groupId)}/events/${encodeURIComponent(params.eventId)}/extensions/${encodeURIComponent(params.extensionId)}`,
      undefined,
      params.extension,
      params.signal,
      params.headers,
    );
  }
}
