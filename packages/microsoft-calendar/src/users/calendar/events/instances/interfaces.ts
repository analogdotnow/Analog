import type {
  DeltaCollectionResponse,
  Event,
  EventCollectionResponse,
  MicrosoftCalendarRequestOptions,
} from "../../../../interfaces";

export interface DefaultCalendarEventListInstanceInput extends MicrosoftCalendarRequestOptions {
  userId: string;
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

export type DefaultCalendarEventListInstanceResponse = EventCollectionResponse;

export interface DefaultCalendarEventInstanceDeltaInput extends MicrosoftCalendarRequestOptions {
  userId: string;
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

export type DefaultCalendarEventInstanceDeltaResponse =
  DeltaCollectionResponse<Event>;
