import type { MicrosoftCalendar } from "../../../../client";
import type {
  CalendarGroupCalendarCalendarViewDeltaInput,
  CalendarGroupCalendarCalendarViewDeltaResponse,
  CalendarGroupCalendarListCalendarViewInput,
  CalendarGroupCalendarListCalendarViewResponse,
} from "./interfaces";

export class CalendarView {
  constructor(private readonly client: MicrosoftCalendar) {}

  async list(
    params: CalendarGroupCalendarListCalendarViewInput,
  ): Promise<CalendarGroupCalendarListCalendarViewResponse> {
    return this.client.get<CalendarGroupCalendarListCalendarViewResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars/${encodeURIComponent(params.calendarId)}/calendarView`,
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
    params: CalendarGroupCalendarCalendarViewDeltaInput,
  ): Promise<CalendarGroupCalendarCalendarViewDeltaResponse> {
    return this.client.get<CalendarGroupCalendarCalendarViewDeltaResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars/${encodeURIComponent(params.calendarId)}/calendarView/microsoft.graph.delta()`,
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
