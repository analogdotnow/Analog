import type {
  CalendarPermission,
  CalendarPermissionCollectionResponse,
  MicrosoftCalendarRequestOptions,
} from "../../../../interfaces";

export interface CalendarGroupCalendarListCalendarPermissionInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
  calendarId: string;
  top?: number;
  skip?: number;
  search?: string;
  filter?: string;
  count?: boolean;
  orderby?: string[];
  select?: string[];
  expand?: string[];
}

export type CalendarGroupCalendarListCalendarPermissionResponse =
  CalendarPermissionCollectionResponse;

export interface CalendarGroupCalendarCreateCalendarPermissionInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
  calendarId: string;
  calendarPermission: CalendarPermission;
}

export type CalendarGroupCalendarCreateCalendarPermissionResponse =
  CalendarPermission;

export interface CalendarGroupCalendarCalendarPermissionGetCountInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
  calendarId: string;
  search?: string;
  filter?: string;
}

export type CalendarGroupCalendarCalendarPermissionGetCountResponse = number;

export interface CalendarGroupCalendarDeleteCalendarPermissionInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
  calendarId: string;
  calendarPermissionId: string;
  ifMatch?: string;
}

export interface CalendarGroupCalendarGetCalendarPermissionInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
  calendarId: string;
  calendarPermissionId: string;
  select?: string[];
  expand?: string[];
}

export type CalendarGroupCalendarGetCalendarPermissionResponse =
  CalendarPermission;

export interface CalendarGroupCalendarUpdateCalendarPermissionInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
  calendarId: string;
  calendarPermissionId: string;
  calendarPermission: CalendarPermission;
}

export type CalendarGroupCalendarUpdateCalendarPermissionResponse =
  CalendarPermission;
