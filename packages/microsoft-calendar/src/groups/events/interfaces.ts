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

export interface GroupListEventInput extends MicrosoftCalendarRequestOptions {
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

export type GroupListEventResponse = EventCollectionResponse;

export interface GroupCreateEventInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  event: Event;
}

export type GroupCreateEventResponse = Event;

export interface GroupEventGetCountInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  search?: string;
  filter?: string;
}

export type GroupEventGetCountResponse = number;

export interface GroupEventDeltaInput extends MicrosoftCalendarRequestOptions {
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

export type GroupEventDeltaResponse = DeltaCollectionResponse<Event>;

export interface GroupDeleteEventInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  eventId: string;
  ifMatch?: string;
}

export interface GroupGetEventInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  eventId: string;
  select?: string[];
  expand?: string[];
}

export type GroupGetEventResponse = Event;

export interface GroupUpdateEventInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  eventId: string;
  event: Event;
}

export type GroupUpdateEventResponse = Event;

export interface GroupEventGetCalendarInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  eventId: string;
  select?: string[];
  expand?: string[];
}

export type GroupEventGetCalendarResponse = Calendar;

export interface GroupEventAcceptInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  eventId: string;
  sendResponse?: boolean | null;
  comment?: string | null;
}

export interface GroupEventCancelInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  eventId: string;
  comment?: string | null;
}

export interface GroupEventDeclineInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  eventId: string;
  proposedNewTime?: TimeSlot;
  sendResponse?: boolean | null;
  comment?: string | null;
}

export interface GroupEventDismissReminderInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  eventId: string;
}

export interface GroupEventForwardInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  eventId: string;
  toRecipients?: Recipient[];
  comment?: string | null;
}

export interface GroupEventPermanentDeleteInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  eventId: string;
}

export interface GroupEventSnoozeReminderInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  eventId: string;
  newReminderTime: DateTimeTimeZone;
}

export interface GroupEventTentativelyAcceptInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  eventId: string;
  proposedNewTime?: TimeSlot;
  sendResponse?: boolean | null;
  comment?: string | null;
}
