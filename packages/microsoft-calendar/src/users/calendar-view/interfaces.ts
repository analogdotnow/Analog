import type {
  DeltaCollectionResponse,
  Event,
  EventCollectionResponse,
  MicrosoftCalendarRequestOptions,
} from "../../interfaces";

export interface ListCalendarViewInput extends MicrosoftCalendarRequestOptions {
  userId: string;
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

export type ListCalendarViewResponse = EventCollectionResponse;

export interface CalendarViewDeltaInput extends MicrosoftCalendarRequestOptions {
  userId: string;
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

export type CalendarViewDeltaResponse = DeltaCollectionResponse<Event>;
