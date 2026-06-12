import type { MicrosoftCalendar } from "../../../client";
import { CalendarPermissions } from "./calendar-permissions";
import { CalendarView } from "./calendar-view";
import { Events } from "./events";
import type {
  CalendarGroupCalendarAllowedCalendarSharingRolesInput,
  CalendarGroupCalendarAllowedCalendarSharingRolesResponse,
  CalendarGroupCalendarGetCountInput,
  CalendarGroupCalendarGetCountResponse,
  CalendarGroupCalendarGetScheduleInput,
  CalendarGroupCalendarGetScheduleResponse,
  CalendarGroupCalendarPermanentDeleteInput,
  CalendarGroupCreateCalendarInput,
  CalendarGroupCreateCalendarResponse,
  CalendarGroupDeleteCalendarInput,
  CalendarGroupGetCalendarInput,
  CalendarGroupGetCalendarResponse,
  CalendarGroupListCalendarInput,
  CalendarGroupListCalendarResponse,
  CalendarGroupUpdateCalendarInput,
  CalendarGroupUpdateCalendarResponse,
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

  async list(
    params: CalendarGroupListCalendarInput,
  ): Promise<CalendarGroupListCalendarResponse> {
    return this.client.get<CalendarGroupListCalendarResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars`,
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

  async create(
    params: CalendarGroupCreateCalendarInput,
  ): Promise<CalendarGroupCreateCalendarResponse> {
    return this.client.post<CalendarGroupCreateCalendarResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars`,
      undefined,
      params.calendar,
      params.signal,
      params.headers,
    );
  }

  async $count(
    params: CalendarGroupCalendarGetCountInput,
  ): Promise<CalendarGroupCalendarGetCountResponse> {
    return this.client.number(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars/$count`,
      {
        $search: params.search,
        $filter: params.filter,
      },
      params.signal,
      params.headers,
    );
  }

  async delete(params: CalendarGroupDeleteCalendarInput): Promise<void> {
    return this.client.delete(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars/${encodeURIComponent(params.calendarId)}`,
      undefined,
      params.signal,
      {
        ...(params.ifMatch ? { "If-Match": params.ifMatch } : {}),
        ...params.headers,
      },
    );
  }

  async get(
    params: CalendarGroupGetCalendarInput,
  ): Promise<CalendarGroupGetCalendarResponse> {
    return this.client.get<CalendarGroupGetCalendarResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars/${encodeURIComponent(params.calendarId)}`,
      {
        $select: params.select,
        $expand: params.expand,
      },
      params.signal,
      params.headers,
    );
  }

  async update(
    params: CalendarGroupUpdateCalendarInput,
  ): Promise<CalendarGroupUpdateCalendarResponse> {
    return this.client.patch<CalendarGroupUpdateCalendarResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars/${encodeURIComponent(params.calendarId)}`,
      undefined,
      params.calendar,
      params.signal,
      params.headers,
    );
  }

  async allowedCalendarSharingRoles(
    params: CalendarGroupCalendarAllowedCalendarSharingRolesInput,
  ): Promise<CalendarGroupCalendarAllowedCalendarSharingRolesResponse> {
    return this.client.get<CalendarGroupCalendarAllowedCalendarSharingRolesResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars/${encodeURIComponent(params.calendarId)}/microsoft.graph.allowedCalendarSharingRoles(User='${encodeURIComponent(params.user.replace(/'/g, "''"))}')`,
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

  async getSchedule(
    params: CalendarGroupCalendarGetScheduleInput,
  ): Promise<CalendarGroupCalendarGetScheduleResponse> {
    return this.client.post<CalendarGroupCalendarGetScheduleResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars/${encodeURIComponent(params.calendarId)}/microsoft.graph.getSchedule`,
      undefined,
      {
        schedules: params.schedules,
        endTime: params.endTime,
        startTime: params.startTime,
        availabilityViewInterval: params.availabilityViewInterval,
      },
      params.signal,
      params.headers,
    );
  }

  async permanentDelete(
    params: CalendarGroupCalendarPermanentDeleteInput,
  ): Promise<void> {
    return this.client.post(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars/${encodeURIComponent(params.calendarId)}/microsoft.graph.permanentDelete`,
      undefined,
      undefined,
      params.signal,
      params.headers,
    );
  }
}
