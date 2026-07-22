import type { MicrosoftCalendar } from "../../client";
import type { ListMoreInput } from "../../interfaces";
import { Calendars } from "./calendars";
import type {
  CalendarGroupGetCountInput,
  CalendarGroupGetCountResponse,
  CreateCalendarGroupInput,
  CreateCalendarGroupResponse,
  DeleteCalendarGroupInput,
  GetCalendarGroupInput,
  GetCalendarGroupResponse,
  ListCalendarGroupInput,
  ListCalendarGroupResponse,
  UpdateCalendarGroupInput,
  UpdateCalendarGroupResponse,
} from "./interfaces";

export class CalendarGroups {
  public readonly calendars: Calendars;

  constructor(private readonly client: MicrosoftCalendar) {
    this.calendars = new Calendars(client);
  }

  async list(
    params: ListCalendarGroupInput,
  ): Promise<ListCalendarGroupResponse> {
    return this.client.get<ListCalendarGroupResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups`,
      {
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

  async listMore(params: ListMoreInput): Promise<ListCalendarGroupResponse> {
    return this.client.get<ListCalendarGroupResponse>(
      params.nextLink,
      undefined,
      params.signal,
      params.headers,
    );
  }

  async create(
    params: CreateCalendarGroupInput,
  ): Promise<CreateCalendarGroupResponse> {
    return this.client.post<CreateCalendarGroupResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups`,
      undefined,
      params.calendarGroup,
      params.signal,
      params.headers,
    );
  }

  async $count(
    params: CalendarGroupGetCountInput,
  ): Promise<CalendarGroupGetCountResponse> {
    return this.client.number(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/$count`,
      {
        $search: params.search,
        $filter: params.filter,
      },
      params.signal,
      params.headers,
    );
  }

  async delete(params: DeleteCalendarGroupInput): Promise<void> {
    return this.client.delete(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}`,
      undefined,
      params.signal,
      {
        ...(params.ifMatch ? { "If-Match": params.ifMatch } : {}),
        ...params.headers,
      },
    );
  }

  async get(params: GetCalendarGroupInput): Promise<GetCalendarGroupResponse> {
    return this.client.get<GetCalendarGroupResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}`,
      {
        $select: params.select,
        $expand: params.expand,
      },
      params.signal,
      params.headers,
    );
  }

  async update(
    params: UpdateCalendarGroupInput,
  ): Promise<UpdateCalendarGroupResponse> {
    return this.client.patch<UpdateCalendarGroupResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}`,
      undefined,
      params.calendarGroup,
      params.signal,
      params.headers,
    );
  }
}
