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

export interface GroupCalendarListEventInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  top?: number;
  skip?: number;
  search?: string;
  filter?: string;
  count?: boolean;
  orderby?: string[];
  select?: string[];
  expand?: string[];
}

export type GroupCalendarListEventResponse = EventCollectionResponse;

export interface GroupCalendarCreateEventInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  event: Event;
}

export type GroupCalendarCreateEventResponse = Event;

export interface GroupCalendarEventGetCountInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  search?: string;
  filter?: string;
}

export type GroupCalendarEventGetCountResponse = number;

export interface GroupCalendarEventDeltaInput extends MicrosoftCalendarRequestOptions {
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

export type GroupCalendarEventDeltaResponse = DeltaCollectionResponse<Event>;

export interface GroupCalendarDeleteEventInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  eventId: string;
  ifMatch?: string;
}

export interface GroupCalendarGetEventInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  eventId: string;
  select?: string[];
  expand?: string[];
}

export type GroupCalendarGetEventResponse = Event;

export interface GroupCalendarUpdateEventInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  eventId: string;
  event: Event;
}

export type GroupCalendarUpdateEventResponse = Event;

export interface GroupCalendarEventGetCalendarInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  eventId: string;
  select?: string[];
  expand?: string[];
}

export type GroupCalendarEventGetCalendarResponse = Calendar;

export interface GroupCalendarEventAcceptInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  eventId: string;
  sendResponse?: boolean | null;
  comment?: string | null;
}

export interface GroupCalendarEventCancelInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  eventId: string;
  comment?: string | null;
}

export interface GroupCalendarEventDeclineInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  eventId: string;
  proposedNewTime?: TimeSlot;
  sendResponse?: boolean | null;
  comment?: string | null;
}

export interface GroupCalendarEventDismissReminderInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  eventId: string;
}

export interface GroupCalendarEventForwardInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  eventId: string;
  toRecipients?: Recipient[];
  comment?: string | null;
}

export interface GroupCalendarEventPermanentDeleteInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  eventId: string;
}

export interface GroupCalendarEventSnoozeReminderInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  eventId: string;
  newReminderTime: DateTimeTimeZone;
}

export interface GroupCalendarEventTentativelyAcceptInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  eventId: string;
  proposedNewTime?: TimeSlot;
  sendResponse?: boolean | null;
  comment?: string | null;
}
