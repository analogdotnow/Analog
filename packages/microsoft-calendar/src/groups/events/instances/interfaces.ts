import type {
  DeltaCollectionResponse,
  Event,
  EventCollectionResponse,
  MicrosoftCalendarRequestOptions,
} from "../../../interfaces";

export interface GroupEventListInstanceInput extends MicrosoftCalendarRequestOptions {
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

export type GroupEventListInstanceResponse = EventCollectionResponse;

export interface GroupEventInstanceDeltaInput extends MicrosoftCalendarRequestOptions {
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

export type GroupEventInstanceDeltaResponse = DeltaCollectionResponse<Event>;
