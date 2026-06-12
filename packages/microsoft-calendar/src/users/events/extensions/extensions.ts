import type { MicrosoftCalendar } from "../../../client";
import type {
  CreateExtensionInput,
  CreateExtensionResponse,
  DeleteExtensionInput,
  ExtensionGetCountInput,
  ExtensionGetCountResponse,
  GetExtensionInput,
  GetExtensionResponse,
  ListExtensionInput,
  ListExtensionResponse,
  UpdateExtensionInput,
  UpdateExtensionResponse,
} from "./interfaces";

export class Extensions {
  constructor(private readonly client: MicrosoftCalendar) {}

  async list(params: ListExtensionInput): Promise<ListExtensionResponse> {
    return this.client.get<ListExtensionResponse>(
      `/users/${encodeURIComponent(params.userId)}/events/${encodeURIComponent(params.eventId)}/extensions`,
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

  async create(params: CreateExtensionInput): Promise<CreateExtensionResponse> {
    return this.client.post<CreateExtensionResponse>(
      `/users/${encodeURIComponent(params.userId)}/events/${encodeURIComponent(params.eventId)}/extensions`,
      undefined,
      params.extension,
      params.signal,
      params.headers,
    );
  }

  async $count(
    params: ExtensionGetCountInput,
  ): Promise<ExtensionGetCountResponse> {
    return this.client.number(
      `/users/${encodeURIComponent(params.userId)}/events/${encodeURIComponent(params.eventId)}/extensions/$count`,
      {
        $search: params.search,
        $filter: params.filter,
      },
      params.signal,
      params.headers,
    );
  }

  async delete(params: DeleteExtensionInput): Promise<void> {
    return this.client.delete(
      `/users/${encodeURIComponent(params.userId)}/events/${encodeURIComponent(params.eventId)}/extensions/${encodeURIComponent(params.extensionId)}`,
      undefined,
      params.signal,
      {
        ...(params.ifMatch ? { "If-Match": params.ifMatch } : {}),
        ...params.headers,
      },
    );
  }

  async get(params: GetExtensionInput): Promise<GetExtensionResponse> {
    return this.client.get<GetExtensionResponse>(
      `/users/${encodeURIComponent(params.userId)}/events/${encodeURIComponent(params.eventId)}/extensions/${encodeURIComponent(params.extensionId)}`,
      {
        $select: params.select,
        $expand: params.expand,
      },
      params.signal,
      params.headers,
    );
  }

  async update(params: UpdateExtensionInput): Promise<UpdateExtensionResponse> {
    return this.client.patch<UpdateExtensionResponse>(
      `/users/${encodeURIComponent(params.userId)}/events/${encodeURIComponent(params.eventId)}/extensions/${encodeURIComponent(params.extensionId)}`,
      undefined,
      params.extension,
      params.signal,
      params.headers,
    );
  }
}
