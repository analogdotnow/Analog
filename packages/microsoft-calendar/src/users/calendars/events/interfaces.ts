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

export interface CalendarListEventInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarId: string;
  top?: number;
  skip?: number;
  search?: string;
  filter?: string;
  count?: boolean;
  orderby?: string[];
  select?: string[];
  expand?: string[];
}

export type CalendarListEventResponse = EventCollectionResponse;

export interface CalendarCreateEventInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarId: string;
  event: Event;
}

export type CalendarCreateEventResponse = Event;

export interface CalendarEventGetCountInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarId: string;
  search?: string;
  filter?: string;
}

export type CalendarEventGetCountResponse = number;

export interface CalendarEventDeltaInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarId: string;
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

export type CalendarEventDeltaResponse = DeltaCollectionResponse<Event>;

export interface CalendarDeleteEventInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarId: string;
  eventId: string;
  ifMatch?: string;
}

export interface CalendarGetEventInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarId: string;
  eventId: string;
  select?: string[];
  expand?: string[];
}

export type CalendarGetEventResponse = Event;

export interface CalendarUpdateEventInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarId: string;
  eventId: string;
  event: Event;
}

export type CalendarUpdateEventResponse = Event;

export interface CalendarEventGetCalendarInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarId: string;
  eventId: string;
  select?: string[];
  expand?: string[];
}

export type CalendarEventGetCalendarResponse = Calendar;

export interface CalendarEventAcceptInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarId: string;
  eventId: string;
  sendResponse?: boolean | null;
  comment?: string | null;
}

export interface CalendarEventCancelInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarId: string;
  eventId: string;
  comment?: string | null;
}

export interface CalendarEventDeclineInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarId: string;
  eventId: string;
  proposedNewTime?: TimeSlot;
  sendResponse?: boolean | null;
  comment?: string | null;
}

export interface CalendarEventDismissReminderInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarId: string;
  eventId: string;
}

export interface CalendarEventForwardInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarId: string;
  eventId: string;
  toRecipients?: Recipient[];
  comment?: string | null;
}

export interface CalendarEventPermanentDeleteInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarId: string;
  eventId: string;
}

export interface CalendarEventSnoozeReminderInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarId: string;
  eventId: string;
  newReminderTime: DateTimeTimeZone;
}

export interface CalendarEventTentativelyAcceptInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarId: string;
  eventId: string;
  proposedNewTime?: TimeSlot;
  sendResponse?: boolean | null;
  comment?: string | null;
}
