import type { MicrosoftCalendar } from "../../client";
import type {
  GroupCalendarViewDeltaInput,
  GroupCalendarViewDeltaResponse,
  GroupListCalendarViewInput,
  GroupListCalendarViewResponse,
} from "./interfaces";

export class CalendarView {
  constructor(private readonly client: MicrosoftCalendar) {}

  async list(
    params: GroupListCalendarViewInput,
  ): Promise<GroupListCalendarViewResponse> {
    return this.client.get<GroupListCalendarViewResponse>(
      `/groups/${encodeURIComponent(params.groupId)}/calendarView`,
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
    params: GroupCalendarViewDeltaInput,
  ): Promise<GroupCalendarViewDeltaResponse> {
    return this.client.get<GroupCalendarViewDeltaResponse>(
      `/groups/${encodeURIComponent(params.groupId)}/calendarView/microsoft.graph.delta()`,
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
