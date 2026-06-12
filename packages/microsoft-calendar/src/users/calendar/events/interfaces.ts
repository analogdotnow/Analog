import type {
  Calendar,
  DateTimeTimeZone,
  DeltaCollectionResponse,
  Event,
  EventCollectionResponse,
  MicrosoftCalendarRequestOptions,
  Recipient,
  TimeSlot,
} from "../../../interfaces";

export interface DefaultCalendarListEventInput extends MicrosoftCalendarRequestOptions {
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

export type DefaultCalendarListEventResponse = EventCollectionResponse;

export interface DefaultCalendarCreateEventInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  event: Event;
}

export type DefaultCalendarCreateEventResponse = Event;

export interface DefaultCalendarEventGetCountInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  search?: string;
  filter?: string;
}

export type DefaultCalendarEventGetCountResponse = number;

export interface DefaultCalendarEventDeltaInput extends MicrosoftCalendarRequestOptions {
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

export type DefaultCalendarEventDeltaResponse = DeltaCollectionResponse<Event>;

export interface DefaultCalendarDeleteEventInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  eventId: string;
  ifMatch?: string;
}

export interface DefaultCalendarGetEventInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  eventId: string;
  select?: string[];
  expand?: string[];
}

export type DefaultCalendarGetEventResponse = Event;

export interface DefaultCalendarUpdateEventInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  eventId: string;
  event: Event;
}

export type DefaultCalendarUpdateEventResponse = Event;

export interface DefaultCalendarEventGetCalendarInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  eventId: string;
  select?: string[];
  expand?: string[];
}

export type DefaultCalendarEventGetCalendarResponse = Calendar;

export interface DefaultCalendarEventAcceptInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  eventId: string;
  sendResponse?: boolean | null;
  comment?: string | null;
}

export interface DefaultCalendarEventCancelInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  eventId: string;
  comment?: string | null;
}

export interface DefaultCalendarEventDeclineInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  eventId: string;
  proposedNewTime?: TimeSlot;
  sendResponse?: boolean | null;
  comment?: string | null;
}

export interface DefaultCalendarEventDismissReminderInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  eventId: string;
}

export interface DefaultCalendarEventForwardInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  eventId: string;
  toRecipients?: Recipient[];
  comment?: string | null;
}

export interface DefaultCalendarEventPermanentDeleteInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  eventId: string;
}

export interface DefaultCalendarEventSnoozeReminderInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  eventId: string;
  newReminderTime: DateTimeTimeZone;
}

export interface DefaultCalendarEventTentativelyAcceptInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  eventId: string;
  proposedNewTime?: TimeSlot;
  sendResponse?: boolean | null;
  comment?: string | null;
}
