import type { MicrosoftCalendar } from "../../../../client";
import type { ListMoreInput } from "../../../../interfaces";
import type {
  DefaultCalendarEventCreateExtensionInput,
  DefaultCalendarEventCreateExtensionResponse,
  DefaultCalendarEventDeleteExtensionInput,
  DefaultCalendarEventExtensionGetCountInput,
  DefaultCalendarEventExtensionGetCountResponse,
  DefaultCalendarEventGetExtensionInput,
  DefaultCalendarEventGetExtensionResponse,
  DefaultCalendarEventListExtensionInput,
  DefaultCalendarEventListExtensionResponse,
  DefaultCalendarEventUpdateExtensionInput,
  DefaultCalendarEventUpdateExtensionResponse,
} from "./interfaces";

export class Extensions {
  constructor(private readonly client: MicrosoftCalendar) {}

  async list(
    params: DefaultCalendarEventListExtensionInput,
  ): Promise<DefaultCalendarEventListExtensionResponse> {
    return this.client.get<DefaultCalendarEventListExtensionResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendar/events/${encodeURIComponent(params.eventId)}/extensions`,
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
  ): Promise<DefaultCalendarEventListExtensionResponse> {
    return this.client.get<DefaultCalendarEventListExtensionResponse>(
      params.nextLink,
      undefined,
      params.signal,
      params.headers,
    );
  }

  async create(
    params: DefaultCalendarEventCreateExtensionInput,
  ): Promise<DefaultCalendarEventCreateExtensionResponse> {
    return this.client.post<DefaultCalendarEventCreateExtensionResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendar/events/${encodeURIComponent(params.eventId)}/extensions`,
      undefined,
      params.extension,
      params.signal,
      params.headers,
    );
  }

  async $count(
    params: DefaultCalendarEventExtensionGetCountInput,
  ): Promise<DefaultCalendarEventExtensionGetCountResponse> {
    return this.client.number(
      `/users/${encodeURIComponent(params.userId)}/calendar/events/${encodeURIComponent(params.eventId)}/extensions/$count`,
      {
        $search: params.search,
        $filter: params.filter,
      },
      params.signal,
      params.headers,
    );
  }

  async delete(
    params: DefaultCalendarEventDeleteExtensionInput,
  ): Promise<void> {
    return this.client.delete(
      `/users/${encodeURIComponent(params.userId)}/calendar/events/${encodeURIComponent(params.eventId)}/extensions/${encodeURIComponent(params.extensionId)}`,
      undefined,
      params.signal,
      {
        ...(params.ifMatch ? { "If-Match": params.ifMatch } : {}),
        ...params.headers,
      },
    );
  }

  async get(
    params: DefaultCalendarEventGetExtensionInput,
  ): Promise<DefaultCalendarEventGetExtensionResponse> {
    return this.client.get<DefaultCalendarEventGetExtensionResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendar/events/${encodeURIComponent(params.eventId)}/extensions/${encodeURIComponent(params.extensionId)}`,
      {
        $select: params.select,
        $expand: params.expand,
      },
      params.signal,
      params.headers,
    );
  }

  async update(
    params: DefaultCalendarEventUpdateExtensionInput,
  ): Promise<DefaultCalendarEventUpdateExtensionResponse> {
    return this.client.patch<DefaultCalendarEventUpdateExtensionResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendar/events/${encodeURIComponent(params.eventId)}/extensions/${encodeURIComponent(params.extensionId)}`,
      undefined,
      params.extension,
      params.signal,
      params.headers,
    );
  }
}
