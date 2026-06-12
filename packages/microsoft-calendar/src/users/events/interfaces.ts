import type {
  Calendar,
  DateTimeTimeZone,
  DeltaCollectionResponse,
  Event,
  EventCollectionResponse,
  MicrosoftCalendarRequestOptions,
  Recipient,
  TimeSlot,
} from "../../interfaces";

export interface ListEventInput extends MicrosoftCalendarRequestOptions {
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

export type ListEventResponse = EventCollectionResponse;

export interface CreateEventInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  event: Event;
}

export type CreateEventResponse = Event;

export interface GetCountInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  search?: string;
  filter?: string;
}

export type GetCountResponse = number;

export interface DeltaInput extends MicrosoftCalendarRequestOptions {
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

export type DeltaResponse = DeltaCollectionResponse<Event>;

export interface DeleteEventInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  eventId: string;
  ifMatch?: string;
}

export interface GetEventInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  eventId: string;
  select?: string[];
  expand?: string[];
}

export type GetEventResponse = Event;

export interface UpdateEventInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  eventId: string;
  event: Event;
}

export type UpdateEventResponse = Event;

export interface EventGetCalendarInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  eventId: string;
  select?: string[];
  expand?: string[];
}

export type EventGetCalendarResponse = Calendar;

export interface AcceptInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  eventId: string;
  sendResponse?: boolean | null;
  comment?: string | null;
}

export interface CancelInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  eventId: string;
  comment?: string | null;
}

export interface DeclineInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  eventId: string;
  proposedNewTime?: TimeSlot;
  sendResponse?: boolean | null;
  comment?: string | null;
}

export interface DismissReminderInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  eventId: string;
}

export interface ForwardInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  eventId: string;
  toRecipients?: Recipient[];
  comment?: string | null;
}

export interface PermanentDeleteInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  eventId: string;
}

export interface SnoozeReminderInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  eventId: string;
  newReminderTime: DateTimeTimeZone;
}

export interface TentativelyAcceptInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  eventId: string;
  proposedNewTime?: TimeSlot;
  sendResponse?: boolean | null;
  comment?: string | null;
}
