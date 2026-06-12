import type { MicrosoftCalendar } from "../../client";
import { CalendarPermissions } from "./calendar-permissions";
import { CalendarView } from "./calendar-view";
import { Events } from "./events";
import type {
  DefaultCalendarAllowedCalendarSharingRolesInput,
  DefaultCalendarAllowedCalendarSharingRolesResponse,
  DefaultCalendarGetScheduleInput,
  DefaultCalendarGetScheduleResponse,
  DefaultCalendarPermanentDeleteInput,
  GetDefaultCalendarInput,
  GetDefaultCalendarResponse,
  UpdateDefaultCalendarInput,
  UpdateDefaultCalendarResponse,
} from "./interfaces";

export class Calendar {
  public readonly calendarPermissions: CalendarPermissions;
  public readonly calendarView: CalendarView;
  public readonly events: Events;

  constructor(private readonly client: MicrosoftCalendar) {
    this.calendarPermissions = new CalendarPermissions(client);
    this.calendarView = new CalendarView(client);
    this.events = new Events(client);
  }

  async get(
    params: GetDefaultCalendarInput,
  ): Promise<GetDefaultCalendarResponse> {
    return this.client.get<GetDefaultCalendarResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendar`,
      {
        $select: params.select,
        $expand: params.expand,
      },
      params.signal,
      params.headers,
    );
  }

  async update(
    params: UpdateDefaultCalendarInput,
  ): Promise<UpdateDefaultCalendarResponse> {
    return this.client.patch<UpdateDefaultCalendarResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendar`,
      undefined,
      params.calendar,
      params.signal,
      params.headers,
    );
  }

  async allowedCalendarSharingRoles(
    params: DefaultCalendarAllowedCalendarSharingRolesInput,
  ): Promise<DefaultCalendarAllowedCalendarSharingRolesResponse> {
    return this.client.get<DefaultCalendarAllowedCalendarSharingRolesResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendar/microsoft.graph.allowedCalendarSharingRoles(User='${encodeURIComponent(params.user.replace(/'/g, "''"))}')`,
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
    params: DefaultCalendarGetScheduleInput,
  ): Promise<DefaultCalendarGetScheduleResponse> {
    return this.client.post<DefaultCalendarGetScheduleResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendar/microsoft.graph.getSchedule`,
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

  async permanentDelete(
    params: DefaultCalendarPermanentDeleteInput,
  ): Promise<void> {
    return this.client.post(
      `/users/${encodeURIComponent(params.userId)}/calendar/microsoft.graph.permanentDelete`,
      undefined,
      undefined,
      params.signal,
      params.headers,
    );
  }
}
