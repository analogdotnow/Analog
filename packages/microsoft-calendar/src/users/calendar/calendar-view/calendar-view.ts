import type { MicrosoftCalendar } from "../../../client";
import type {
  DefaultCalendarCalendarViewDeltaInput,
  DefaultCalendarCalendarViewDeltaResponse,
  DefaultCalendarListCalendarViewInput,
  DefaultCalendarListCalendarViewResponse,
} from "./interfaces";

export class CalendarView {
  constructor(private readonly client: MicrosoftCalendar) {}

  async list(
    params: DefaultCalendarListCalendarViewInput,
  ): Promise<DefaultCalendarListCalendarViewResponse> {
    return this.client.get<DefaultCalendarListCalendarViewResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendar/calendarView`,
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
    params: DefaultCalendarCalendarViewDeltaInput,
  ): Promise<DefaultCalendarCalendarViewDeltaResponse> {
    return this.client.get<DefaultCalendarCalendarViewDeltaResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendar/calendarView/microsoft.graph.delta()`,
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
