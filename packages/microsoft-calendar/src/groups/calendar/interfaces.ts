import type {
  Calendar,
  CalendarRoleType,
  CollectionResponse,
  DateTimeTimeZone,
  MicrosoftCalendarRequestOptions,
  ScheduleInformation,
} from "../../interfaces";

export interface GetGroupCalendarInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  select?: string[];
  expand?: string[];
}

export type GetGroupCalendarResponse = Calendar;

export interface GroupCalendarAllowedCalendarSharingRolesInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  user: string;
  top?: number;
  skip?: number;
  search?: string;
  filter?: string;
  count?: boolean;
}

export type GroupCalendarAllowedCalendarSharingRolesResponse =
  CollectionResponse<CalendarRoleType>;

export interface GroupCalendarGetScheduleInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  schedules: (string | null)[];
  startTime: DateTimeTimeZone;
  endTime: DateTimeTimeZone;
  availabilityViewInterval?: number | null;
}

export type GroupCalendarGetScheduleResponse =
  CollectionResponse<ScheduleInformation>;

export interface GroupCalendarPermanentDeleteInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
}
