import type {
  CalendarPermission,
  CalendarPermissionCollectionResponse,
  MicrosoftCalendarRequestOptions,
} from "../../../interfaces";

export interface DefaultCalendarListCalendarPermissionInput extends MicrosoftCalendarRequestOptions {
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

export type DefaultCalendarListCalendarPermissionResponse =
  CalendarPermissionCollectionResponse;

export interface DefaultCalendarCreateCalendarPermissionInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarPermission: CalendarPermission;
}

export type DefaultCalendarCreateCalendarPermissionResponse =
  CalendarPermission;

export interface DefaultCalendarCalendarPermissionGetCountInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  search?: string;
  filter?: string;
}

export type DefaultCalendarCalendarPermissionGetCountResponse = number;

export interface DefaultCalendarDeleteCalendarPermissionInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarPermissionId: string;
  ifMatch?: string;
}

export interface DefaultCalendarGetCalendarPermissionInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarPermissionId: string;
  select?: string[];
  expand?: string[];
}

export type DefaultCalendarGetCalendarPermissionResponse = CalendarPermission;

export interface DefaultCalendarUpdateCalendarPermissionInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarPermissionId: string;
  calendarPermission: CalendarPermission;
}

export type DefaultCalendarUpdateCalendarPermissionResponse =
  CalendarPermission;
