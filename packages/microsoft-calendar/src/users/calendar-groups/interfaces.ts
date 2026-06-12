import type {
  CalendarGroup,
  CalendarGroupCollectionResponse,
  MicrosoftCalendarRequestOptions,
} from "../../interfaces";

export interface ListCalendarGroupInput extends MicrosoftCalendarRequestOptions {
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

export type ListCalendarGroupResponse = CalendarGroupCollectionResponse;

export interface CreateCalendarGroupInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroup: CalendarGroup;
}

export type CreateCalendarGroupResponse = CalendarGroup;

export interface CalendarGroupGetCountInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  search?: string;
  filter?: string;
}

export type CalendarGroupGetCountResponse = number;

export interface DeleteCalendarGroupInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
  ifMatch?: string;
}

export interface GetCalendarGroupInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
  select?: string[];
  expand?: string[];
}

export type GetCalendarGroupResponse = CalendarGroup;

export interface UpdateCalendarGroupInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
  calendarGroup: CalendarGroup;
}

export type UpdateCalendarGroupResponse = CalendarGroup;
