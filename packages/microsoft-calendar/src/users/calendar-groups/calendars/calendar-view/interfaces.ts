import type {
  DeltaCollectionResponse,
  Event,
  EventCollectionResponse,
  MicrosoftCalendarRequestOptions,
} from "../../../../interfaces";

export interface CalendarGroupCalendarListCalendarViewInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
  calendarId: string;
  startDateTime: string;
  endDateTime: string;
  top?: number;
  skip?: number;
  search?: string;
  filter?: string;
  count?: boolean;
  orderby?: string[];
  select?: string[];
  expand?: string[];
}

export type CalendarGroupCalendarListCalendarViewResponse =
  EventCollectionResponse;

export interface CalendarGroupCalendarCalendarViewDeltaInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
  calendarId: string;
  startDateTime: string;
  endDateTime: string;
  top?: number;
  skip?: number;
  search?: string;
  filter?: string;
  count?: boolean;
  select?: string[];
  orderby?: string[];
  expand?: string[];
}

export type CalendarGroupCalendarCalendarViewDeltaResponse =
  DeltaCollectionResponse<Event>;
