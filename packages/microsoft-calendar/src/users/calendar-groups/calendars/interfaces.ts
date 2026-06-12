import type {
  Calendar,
  CalendarCollectionResponse,
  CalendarRoleType,
  CollectionResponse,
  DateTimeTimeZone,
  MicrosoftCalendarRequestOptions,
  ScheduleInformation,
} from "../../../interfaces";

export interface CalendarGroupListCalendarInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
  top?: number;
  skip?: number;
  search?: string;
  filter?: string;
  count?: boolean;
  orderby?: string[];
  select?: string[];
  expand?: string[];
}

export type CalendarGroupListCalendarResponse = CalendarCollectionResponse;

export interface CalendarGroupCreateCalendarInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
  calendar: Calendar;
}

export type CalendarGroupCreateCalendarResponse = Calendar;

export interface CalendarGroupCalendarGetCountInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
  search?: string;
  filter?: string;
}

export type CalendarGroupCalendarGetCountResponse = number;

export interface CalendarGroupDeleteCalendarInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
  calendarId: string;
  ifMatch?: string;
}

export interface CalendarGroupGetCalendarInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
  calendarId: string;
  select?: string[];
  expand?: string[];
}

export type CalendarGroupGetCalendarResponse = Calendar;

export interface CalendarGroupUpdateCalendarInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
  calendarId: string;
  calendar: Calendar;
}

export type CalendarGroupUpdateCalendarResponse = Calendar;

export interface CalendarGroupCalendarAllowedCalendarSharingRolesInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
  calendarId: string;
  user: string;
  top?: number;
  skip?: number;
  search?: string;
  filter?: string;
  count?: boolean;
}

export type CalendarGroupCalendarAllowedCalendarSharingRolesResponse =
  CollectionResponse<CalendarRoleType>;

export interface CalendarGroupCalendarGetScheduleInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
  calendarId: string;
  schedules: (string | null)[];
  startTime: DateTimeTimeZone;
  endTime: DateTimeTimeZone;
  availabilityViewInterval?: number | null;
}

export type CalendarGroupCalendarGetScheduleResponse =
  CollectionResponse<ScheduleInformation>;

export interface CalendarGroupCalendarPermanentDeleteInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
  calendarId: string;
}
