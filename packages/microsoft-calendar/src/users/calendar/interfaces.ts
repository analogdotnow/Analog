import type {
  Calendar,
  CalendarRoleType,
  CollectionResponse,
  DateTimeTimeZone,
  MicrosoftCalendarRequestOptions,
  ScheduleInformation,
} from "../../interfaces";

export interface GetDefaultCalendarInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  select?: string[];
  expand?: string[];
}

export type GetDefaultCalendarResponse = Calendar;

export interface UpdateDefaultCalendarInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendar: Calendar;
}

export type UpdateDefaultCalendarResponse = Calendar;

export interface DefaultCalendarAllowedCalendarSharingRolesInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  user: string;
  top?: number;
  skip?: number;
  search?: string;
  filter?: string;
  count?: boolean;
}

export type DefaultCalendarAllowedCalendarSharingRolesResponse =
  CollectionResponse<CalendarRoleType>;

export interface DefaultCalendarGetScheduleInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  schedules: (string | null)[];
  startTime: DateTimeTimeZone;
  endTime: DateTimeTimeZone;
  availabilityViewInterval?: number | null;
}

export type DefaultCalendarGetScheduleResponse =
  CollectionResponse<ScheduleInformation>;

export interface DefaultCalendarPermanentDeleteInput extends MicrosoftCalendarRequestOptions {
  userId: string;
}
