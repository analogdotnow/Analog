import type { MicrosoftCalendar } from "../../../../client";
import type {
  DefaultCalendarEventInstanceDeltaInput,
  DefaultCalendarEventInstanceDeltaResponse,
  DefaultCalendarEventListInstanceInput,
  DefaultCalendarEventListInstanceResponse,
} from "./interfaces";

export class Instances {
  constructor(private readonly client: MicrosoftCalendar) {}

  async list(
    params: DefaultCalendarEventListInstanceInput,
  ): Promise<DefaultCalendarEventListInstanceResponse> {
    return this.client.get<DefaultCalendarEventListInstanceResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendar/events/${encodeURIComponent(params.eventId)}/instances`,
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
    params: DefaultCalendarEventInstanceDeltaInput,
  ): Promise<DefaultCalendarEventInstanceDeltaResponse> {
    return this.client.get<DefaultCalendarEventInstanceDeltaResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendar/events/${encodeURIComponent(params.eventId)}/instances/microsoft.graph.delta()`,
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
