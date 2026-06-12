import type { MicrosoftCalendar } from "../../../../client";
import type {
  CalendarEventInstanceDeltaInput,
  CalendarEventInstanceDeltaResponse,
  CalendarEventListInstanceInput,
  CalendarEventListInstanceResponse,
} from "./interfaces";

export class Instances {
  constructor(private readonly client: MicrosoftCalendar) {}

  async list(
    params: CalendarEventListInstanceInput,
  ): Promise<CalendarEventListInstanceResponse> {
    return this.client.get<CalendarEventListInstanceResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/instances`,
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
    params: CalendarEventInstanceDeltaInput,
  ): Promise<CalendarEventInstanceDeltaResponse> {
    return this.client.get<CalendarEventInstanceDeltaResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/instances/microsoft.graph.delta()`,
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
