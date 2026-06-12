import type {
  DeltaCollectionResponse,
  Event,
  EventCollectionResponse,
  MicrosoftCalendarRequestOptions,
} from "../../../interfaces";

export interface CalendarListCalendarViewInput extends MicrosoftCalendarRequestOptions {
  userId: string;
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

export type CalendarListCalendarViewResponse = EventCollectionResponse;

export interface CalendarCalendarViewDeltaInput extends MicrosoftCalendarRequestOptions {
  userId: string;
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

export type CalendarCalendarViewDeltaResponse = DeltaCollectionResponse<Event>;
