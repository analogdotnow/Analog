import type {
  CalendarPermission,
  CalendarPermissionCollectionResponse,
  MicrosoftCalendarRequestOptions,
} from "../../../interfaces";

export interface GroupCalendarListCalendarPermissionInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  top?: number;
  skip?: number;
  search?: string;
  filter?: string;
  count?: boolean;
  orderby?: string[];
  select?: string[];
  expand?: string[];
}

export type GroupCalendarListCalendarPermissionResponse =
  CalendarPermissionCollectionResponse;

export interface GroupCalendarCreateCalendarPermissionInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  calendarPermission: CalendarPermission;
}

export type GroupCalendarCreateCalendarPermissionResponse = CalendarPermission;

export interface GroupCalendarCalendarPermissionGetCountInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  search?: string;
  filter?: string;
}

export type GroupCalendarCalendarPermissionGetCountResponse = number;

export interface GroupCalendarDeleteCalendarPermissionInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  calendarPermissionId: string;
  ifMatch?: string;
}

export interface GroupCalendarGetCalendarPermissionInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  calendarPermissionId: string;
  select?: string[];
  expand?: string[];
}

export type GroupCalendarGetCalendarPermissionResponse = CalendarPermission;

export interface GroupCalendarUpdateCalendarPermissionInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  calendarPermissionId: string;
  calendarPermission: CalendarPermission;
}

export type GroupCalendarUpdateCalendarPermissionResponse = CalendarPermission;
