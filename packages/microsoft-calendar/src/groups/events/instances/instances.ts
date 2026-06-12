import type { MicrosoftCalendar } from "../../../client";
import type {
  GroupEventInstanceDeltaInput,
  GroupEventInstanceDeltaResponse,
  GroupEventListInstanceInput,
  GroupEventListInstanceResponse,
} from "./interfaces";

export class Instances {
  constructor(private readonly client: MicrosoftCalendar) {}

  async list(
    params: GroupEventListInstanceInput,
  ): Promise<GroupEventListInstanceResponse> {
    return this.client.get<GroupEventListInstanceResponse>(
      `/groups/${encodeURIComponent(params.groupId)}/events/${encodeURIComponent(params.eventId)}/instances`,
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

  async delta(
    params: GroupEventInstanceDeltaInput,
  ): Promise<GroupEventInstanceDeltaResponse> {
    return this.client.get<GroupEventInstanceDeltaResponse>(
      `/groups/${encodeURIComponent(params.groupId)}/events/${encodeURIComponent(params.eventId)}/instances/microsoft.graph.delta()`,
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
}
