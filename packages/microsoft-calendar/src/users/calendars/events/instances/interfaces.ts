import type {
  DeltaCollectionResponse,
  Event,
  EventCollectionResponse,
  MicrosoftCalendarRequestOptions,
} from "../../../../interfaces";

export interface CalendarEventListInstanceInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarId: string;
  eventId: string;
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

export type CalendarEventListInstanceResponse = EventCollectionResponse;

export interface CalendarEventInstanceDeltaInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarId: string;
  eventId: string;
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

export type CalendarEventInstanceDeltaResponse = DeltaCollectionResponse<Event>;
