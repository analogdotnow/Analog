import type { MicrosoftCalendar } from "../../client";
import type { ListMoreInput } from "../../interfaces";
import { CalendarPermissions } from "./calendar-permissions";
import { CalendarView } from "./calendar-view";
import { Events } from "./events";
import type {
  GetGroupCalendarInput,
  GetGroupCalendarResponse,
  GroupCalendarAllowedCalendarSharingRolesInput,
  GroupCalendarAllowedCalendarSharingRolesResponse,
  GroupCalendarGetScheduleInput,
  GroupCalendarGetScheduleResponse,
  GroupCalendarPermanentDeleteInput,
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

  async get(params: GetGroupCalendarInput): Promise<GetGroupCalendarResponse> {
    return this.client.get<GetGroupCalendarResponse>(
      `/groups/${encodeURIComponent(params.groupId)}/calendar`,
      {
        $select: params.select,
        $expand: params.expand,
      },
      params.signal,
      params.headers,
    );
  }

  async allowedCalendarSharingRoles(
    params: GroupCalendarAllowedCalendarSharingRolesInput,
  ): Promise<GroupCalendarAllowedCalendarSharingRolesResponse> {
    return this.client.get<GroupCalendarAllowedCalendarSharingRolesResponse>(
      `/groups/${encodeURIComponent(params.groupId)}/calendar/microsoft.graph.allowedCalendarSharingRoles(User='${encodeURIComponent(params.user.replace(/'/g, "''"))}')`,
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

  async allowedCalendarSharingRolesMore(
    params: ListMoreInput,
  ): Promise<GroupCalendarAllowedCalendarSharingRolesResponse> {
    return this.client.get<GroupCalendarAllowedCalendarSharingRolesResponse>(
      params.nextLink,
      undefined,
      params.signal,
      params.headers,
    );
  }

  async getSchedule(
    params: GroupCalendarGetScheduleInput,
  ): Promise<GroupCalendarGetScheduleResponse> {
    return this.client.post<GroupCalendarGetScheduleResponse>(
      `/groups/${encodeURIComponent(params.groupId)}/calendar/microsoft.graph.getSchedule`,
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

  async getScheduleMore(
    params: ListMoreInput,
  ): Promise<GroupCalendarGetScheduleResponse> {
    return this.client.get<GroupCalendarGetScheduleResponse>(
      params.nextLink,
      undefined,
      params.signal,
      params.headers,
    );
  }

  async permanentDelete(
    params: GroupCalendarPermanentDeleteInput,
  ): Promise<void> {
    return this.client.post(
      `/groups/${encodeURIComponent(params.groupId)}/calendar/microsoft.graph.permanentDelete`,
      undefined,
      undefined,
      params.signal,
      params.headers,
    );
  }
}
