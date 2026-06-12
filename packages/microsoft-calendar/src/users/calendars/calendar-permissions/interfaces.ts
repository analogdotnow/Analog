import type {
  CalendarPermission,
  CalendarPermissionCollectionResponse,
  MicrosoftCalendarRequestOptions,
} from "../../../interfaces";

export interface ListCalendarPermissionInput extends MicrosoftCalendarRequestOptions {
  userId: string;
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

export type ListCalendarPermissionResponse =
  CalendarPermissionCollectionResponse;

export interface CreateCalendarPermissionInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarId: string;
  calendarPermission: CalendarPermission;
}

export type CreateCalendarPermissionResponse = CalendarPermission;

export interface CalendarPermissionGetCountInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarId: string;
  search?: string;
  filter?: string;
}

export type CalendarPermissionGetCountResponse = number;

export interface DeleteCalendarPermissionInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarId: string;
  calendarPermissionId: string;
  ifMatch?: string;
}

export interface GetCalendarPermissionInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarId: string;
  calendarPermissionId: string;
  select?: string[];
  expand?: string[];
}

export type GetCalendarPermissionResponse = CalendarPermission;

export interface UpdateCalendarPermissionInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarId: string;
  calendarPermissionId: string;
  calendarPermission: CalendarPermission;
}

export type UpdateCalendarPermissionResponse = CalendarPermission;
