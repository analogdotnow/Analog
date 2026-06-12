import type { MicrosoftCalendar } from "../../client";
import { CalendarPermissions } from "./calendar-permissions";
import { CalendarView } from "./calendar-view";
import { Events } from "./events";
import type {
  AllowedCalendarSharingRolesInput,
  AllowedCalendarSharingRolesResponse,
  CalendarGetCountInput,
  CalendarGetCountResponse,
  CalendarPermanentDeleteInput,
  CreateCalendarInput,
  CreateCalendarResponse,
  DeleteCalendarInput,
  GetCalendarInput,
  GetCalendarResponse,
  GetScheduleInput,
  GetScheduleResponse,
  ListCalendarInput,
  ListCalendarResponse,
  UpdateCalendarInput,
  UpdateCalendarResponse,
} from "./interfaces";

export class Calendars {
  public readonly calendarPermissions: CalendarPermissions;
  public readonly calendarView: CalendarView;
  public readonly events: Events;

  constructor(private readonly client: MicrosoftCalendar) {
    this.calendarPermissions = new CalendarPermissions(client);
    this.calendarView = new CalendarView(client);
    this.events = new Events(client);
  }

  async list(params: ListCalendarInput): Promise<ListCalendarResponse> {
    return this.client.get<ListCalendarResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendars`,
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

  async create(params: CreateCalendarInput): Promise<CreateCalendarResponse> {
    return this.client.post<CreateCalendarResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendars`,
      undefined,
      params.calendar,
      params.signal,
      params.headers,
    );
  }

  async $count(
    params: CalendarGetCountInput,
  ): Promise<CalendarGetCountResponse> {
    return this.client.number(
      `/users/${encodeURIComponent(params.userId)}/calendars/$count`,
      {
        $search: params.search,
        $filter: params.filter,
      },
      params.signal,
      params.headers,
    );
  }

  async delete(params: DeleteCalendarInput): Promise<void> {
    return this.client.delete(
      `/users/${encodeURIComponent(params.userId)}/calendars/${encodeURIComponent(params.calendarId)}`,
      undefined,
      params.signal,
      {
        ...(params.ifMatch ? { "If-Match": params.ifMatch } : {}),
        ...params.headers,
      },
    );
  }

  async get(params: GetCalendarInput): Promise<GetCalendarResponse> {
    return this.client.get<GetCalendarResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendars/${encodeURIComponent(params.calendarId)}`,
      {
        $select: params.select,
        $expand: params.expand,
      },
      params.signal,
      params.headers,
    );
  }

  async update(params: UpdateCalendarInput): Promise<UpdateCalendarResponse> {
    return this.client.patch<UpdateCalendarResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendars/${encodeURIComponent(params.calendarId)}`,
      undefined,
      params.calendar,
      params.signal,
      params.headers,
    );
  }

  async allowedCalendarSharingRoles(
    params: AllowedCalendarSharingRolesInput,
  ): Promise<AllowedCalendarSharingRolesResponse> {
    return this.client.get<AllowedCalendarSharingRolesResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendars/${encodeURIComponent(params.calendarId)}/microsoft.graph.allowedCalendarSharingRoles(User='${encodeURIComponent(params.user.replace(/'/g, "''"))}')`,
      {
        $top: params.top,
        $skip: params.skip,
        $search: params.search,
        $filter: params.filter,
        $count: params.count,
      },
      params.signal,
      params.headers,
    );
  }

  async getSchedule(params: GetScheduleInput): Promise<GetScheduleResponse> {
    return this.client.post<GetScheduleResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendars/${encodeURIComponent(params.calendarId)}/microsoft.graph.getSchedule`,
      undefined,
      {
        schedules: params.schedules,
        startTime: params.startTime,
        endTime: params.endTime,
        availabilityViewInterval: params.availabilityViewInterval,
      },
      params.signal,
      params.headers,
    );
  }

  async permanentDelete(params: CalendarPermanentDeleteInput): Promise<void> {
    return this.client.post(
      `/users/${encodeURIComponent(params.userId)}/calendars/${encodeURIComponent(params.calendarId)}/microsoft.graph.permanentDelete`,
      undefined,
      undefined,
      params.signal,
      params.headers,
    );
  }
}
