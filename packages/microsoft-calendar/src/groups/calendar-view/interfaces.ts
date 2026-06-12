import type {
  DeltaCollectionResponse,
  Event,
  EventCollectionResponse,
  MicrosoftCalendarRequestOptions,
} from "../../interfaces";

export interface GroupListCalendarViewInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
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

export type GroupListCalendarViewResponse = EventCollectionResponse;

export interface GroupCalendarViewDeltaInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
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

export type GroupCalendarViewDeltaResponse = DeltaCollectionResponse<Event>;
