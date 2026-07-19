import type { MicrosoftCalendar } from "../../../../client";
import type { ListMoreInput } from "../../../../interfaces";
import type {
  GroupCalendarEventInstanceDeltaInput,
  GroupCalendarEventInstanceDeltaResponse,
  GroupCalendarEventListInstanceInput,
  GroupCalendarEventListInstanceResponse,
} from "./interfaces";

export class Instances {
  constructor(private readonly client: MicrosoftCalendar) {}

  async list(
    params: GroupCalendarEventListInstanceInput,
  ): Promise<GroupCalendarEventListInstanceResponse> {
    return this.client.get<GroupCalendarEventListInstanceResponse>(
      `/groups/${encodeURIComponent(params.groupId)}/calendar/events/${encodeURIComponent(params.eventId)}/instances`,
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

  async listMore(
    params: ListMoreInput,
  ): Promise<GroupCalendarEventListInstanceResponse> {
    return this.client.get<GroupCalendarEventListInstanceResponse>(
      params.nextLink,
      undefined,
      params.signal,
      params.headers,
    );
  }

  async delta(
    params: GroupCalendarEventInstanceDeltaInput,
  ): Promise<GroupCalendarEventInstanceDeltaResponse> {
    return this.client.get<GroupCalendarEventInstanceDeltaResponse>(
      `/groups/${encodeURIComponent(params.groupId)}/calendar/events/${encodeURIComponent(params.eventId)}/instances/microsoft.graph.delta()`,
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

  async deltaMore(
    params: ListMoreInput,
  ): Promise<GroupCalendarEventInstanceDeltaResponse> {
    return this.client.get<GroupCalendarEventInstanceDeltaResponse>(
      params.nextLink,
      undefined,
      params.signal,
      params.headers,
    );
  }
}
