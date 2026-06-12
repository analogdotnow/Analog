import type { MicrosoftCalendar } from "../../../../../client";
import type {
  CalendarGroupCalendarEventInstanceDeltaInput,
  CalendarGroupCalendarEventInstanceDeltaResponse,
  CalendarGroupCalendarEventListInstanceInput,
  CalendarGroupCalendarEventListInstanceResponse,
} from "./interfaces";

export class Instances {
  constructor(private readonly client: MicrosoftCalendar) {}

  async list(
    params: CalendarGroupCalendarEventListInstanceInput,
  ): Promise<CalendarGroupCalendarEventListInstanceResponse> {
    return this.client.get<CalendarGroupCalendarEventListInstanceResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/instances`,
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
    params: CalendarGroupCalendarEventInstanceDeltaInput,
  ): Promise<CalendarGroupCalendarEventInstanceDeltaResponse> {
    return this.client.get<CalendarGroupCalendarEventInstanceDeltaResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/instances/microsoft.graph.delta()`,
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
