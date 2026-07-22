import type { MicrosoftCalendar } from "../../../client";
import type { ListMoreInput } from "../../../interfaces";
import type {
  InstanceDeltaInput,
  InstanceDeltaResponse,
  ListInstanceInput,
  ListInstanceResponse,
} from "./interfaces";

export class Instances {
  constructor(private readonly client: MicrosoftCalendar) {}

  async list(params: ListInstanceInput): Promise<ListInstanceResponse> {
    return this.client.get<ListInstanceResponse>(
      `/users/${encodeURIComponent(params.userId)}/events/${encodeURIComponent(params.eventId)}/instances`,
      {
        startDateTime: params.startDateTime,
        endDateTime: params.endDateTime,
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

  async listMore(params: ListMoreInput): Promise<ListInstanceResponse> {
    return this.client.get<ListInstanceResponse>(
      params.nextLink,
      undefined,
      params.signal,
      params.headers,
    );
  }

  async delta(params: InstanceDeltaInput): Promise<InstanceDeltaResponse> {
    return this.client.get<InstanceDeltaResponse>(
      `/users/${encodeURIComponent(params.userId)}/events/${encodeURIComponent(params.eventId)}/instances/microsoft.graph.delta()`,
      {
        startDateTime: params.startDateTime,
        endDateTime: params.endDateTime,
        $top: params.top,
        $skip: params.skip,
        $search: params.search,
        $filter: params.filter,
        $count: params.count,
        $select: params.select,
        $orderby: params.orderby,
        $expand: params.expand,
      },
      params.signal,
      params.headers,
    );
  }

  async deltaMore(params: ListMoreInput): Promise<InstanceDeltaResponse> {
    return this.client.get<InstanceDeltaResponse>(
      params.nextLink,
      undefined,
      params.signal,
      params.headers,
    );
  }
}
