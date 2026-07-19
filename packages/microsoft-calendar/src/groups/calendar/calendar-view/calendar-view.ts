import type { MicrosoftCalendar } from "../../../client";
import type { ListMoreInput } from "../../../interfaces";
import type {
  GroupCalendarCalendarViewDeltaInput,
  GroupCalendarCalendarViewDeltaResponse,
  GroupCalendarListCalendarViewInput,
  GroupCalendarListCalendarViewResponse,
} from "./interfaces";

export class CalendarView {
  constructor(private readonly client: MicrosoftCalendar) {}

  async list(
    params: GroupCalendarListCalendarViewInput,
  ): Promise<GroupCalendarListCalendarViewResponse> {
    return this.client.get<GroupCalendarListCalendarViewResponse>(
      `/groups/${encodeURIComponent(params.groupId)}/calendar/calendarView`,
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
  ): Promise<GroupCalendarListCalendarViewResponse> {
    return this.client.get<GroupCalendarListCalendarViewResponse>(
      params.nextLink,
      undefined,
      params.signal,
      params.headers,
    );
  }

  async delta(
    params: GroupCalendarCalendarViewDeltaInput,
  ): Promise<GroupCalendarCalendarViewDeltaResponse> {
    return this.client.get<GroupCalendarCalendarViewDeltaResponse>(
      `/groups/${encodeURIComponent(params.groupId)}/calendar/calendarView/microsoft.graph.delta()`,
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
  ): Promise<GroupCalendarCalendarViewDeltaResponse> {
    return this.client.get<GroupCalendarCalendarViewDeltaResponse>(
      params.nextLink,
      undefined,
      params.signal,
      params.headers,
    );
  }
}
