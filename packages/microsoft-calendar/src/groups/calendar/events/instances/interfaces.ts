import type {
  DeltaCollectionResponse,
  Event,
  EventCollectionResponse,
  MicrosoftCalendarRequestOptions,
} from "../../../../interfaces";

export interface GroupCalendarEventListInstanceInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
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

export type GroupCalendarEventListInstanceResponse = EventCollectionResponse;

export interface GroupCalendarEventInstanceDeltaInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
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

export type GroupCalendarEventInstanceDeltaResponse =
  DeltaCollectionResponse<Event>;
