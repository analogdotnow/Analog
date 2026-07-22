import type { MicrosoftCalendar } from "../../client";
import type { ListMoreInput } from "../../interfaces";
import type {
  CalendarViewDeltaInput,
  CalendarViewDeltaResponse,
  ListCalendarViewInput,
  ListCalendarViewResponse,
} from "./interfaces";

export class CalendarView {
  constructor(private readonly client: MicrosoftCalendar) {}

  async list(params: ListCalendarViewInput): Promise<ListCalendarViewResponse> {
    return this.client.get<ListCalendarViewResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendarView`,
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

  async listMore(params: ListMoreInput): Promise<ListCalendarViewResponse> {
    return this.client.get<ListCalendarViewResponse>(
      params.nextLink,
      undefined,
      params.signal,
      params.headers,
    );
  }

  async delta(
    params: CalendarViewDeltaInput,
  ): Promise<CalendarViewDeltaResponse> {
    return this.client.get<CalendarViewDeltaResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendarView/microsoft.graph.delta()`,
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

  async deltaMore(params: ListMoreInput): Promise<CalendarViewDeltaResponse> {
    return this.client.get<CalendarViewDeltaResponse>(
      params.nextLink,
      undefined,
      params.signal,
      params.headers,
    );
  }
}
