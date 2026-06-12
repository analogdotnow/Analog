import type {
  Calendar,
  CalendarCollectionResponse,
  CalendarRoleType,
  CollectionResponse,
  DateTimeTimeZone,
  MicrosoftCalendarRequestOptions,
  ScheduleInformation,
} from "../../interfaces";

export interface ListCalendarInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  top?: number;
  skip?: number;
  search?: string;
  filter?: string;
  count?: boolean;
  orderby?: string[];
  select?: string[];
  expand?: string[];
}

export type ListCalendarResponse = CalendarCollectionResponse;

export interface CreateCalendarInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendar: Calendar;
}

export type CreateCalendarResponse = Calendar;

export interface CalendarGetCountInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  search?: string;
  filter?: string;
}

export type CalendarGetCountResponse = number;

export interface DeleteCalendarInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarId: string;
  ifMatch?: string;
}

export interface GetCalendarInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarId: string;
  select?: string[];
  expand?: string[];
}

export type GetCalendarResponse = Calendar;

export interface UpdateCalendarInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarId: string;
  calendar: Calendar;
}

export type UpdateCalendarResponse = Calendar;

export interface AllowedCalendarSharingRolesInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarId: string;
  user: string;
  top?: number;
  skip?: number;
  search?: string;
  filter?: string;
  count?: boolean;
}

export type AllowedCalendarSharingRolesResponse =
  CollectionResponse<CalendarRoleType>;

export interface GetScheduleInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarId: string;
  schedules: (string | null)[];
  startTime: DateTimeTimeZone;
  endTime: DateTimeTimeZone;
  availabilityViewInterval?: number | null;
}

export type GetScheduleResponse = CollectionResponse<ScheduleInformation>;

export interface CalendarPermanentDeleteInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarId: string;
}
