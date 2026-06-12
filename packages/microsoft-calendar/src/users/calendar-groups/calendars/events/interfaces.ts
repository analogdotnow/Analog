import type {
  Calendar,
  DateTimeTimeZone,
  DeltaCollectionResponse,
  Event,
  EventCollectionResponse,
  MicrosoftCalendarRequestOptions,
  Recipient,
  TimeSlot,
} from "../../../../interfaces";

export interface CalendarGroupCalendarListEventInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
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

export type CalendarGroupCalendarListEventResponse = EventCollectionResponse;

export interface CalendarGroupCalendarCreateEventInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
  calendarId: string;
  event: Event;
}

export type CalendarGroupCalendarCreateEventResponse = Event;

export interface CalendarGroupCalendarEventGetCountInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
  calendarId: string;
  search?: string;
  filter?: string;
}

export type CalendarGroupCalendarEventGetCountResponse = number;

export interface CalendarGroupCalendarEventDeltaInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
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

export type CalendarGroupCalendarEventDeltaResponse =
  DeltaCollectionResponse<Event>;

export interface CalendarGroupCalendarDeleteEventInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
  calendarId: string;
  eventId: string;
  ifMatch?: string;
}

export interface CalendarGroupCalendarGetEventInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
  calendarId: string;
  eventId: string;
  select?: string[];
  expand?: string[];
}

export type CalendarGroupCalendarGetEventResponse = Event;

export interface CalendarGroupCalendarUpdateEventInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
  calendarId: string;
  eventId: string;
  event: Event;
}

export type CalendarGroupCalendarUpdateEventResponse = Event;

export interface CalendarGroupCalendarEventGetCalendarInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
  calendarId: string;
  eventId: string;
  select?: string[];
  expand?: string[];
}

export type CalendarGroupCalendarEventGetCalendarResponse = Calendar;

export interface CalendarGroupCalendarEventAcceptInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
  calendarId: string;
  eventId: string;
  sendResponse?: boolean | null;
  comment?: string | null;
}

export interface CalendarGroupCalendarEventCancelInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
  calendarId: string;
  eventId: string;
  comment?: string | null;
}

export interface CalendarGroupCalendarEventDeclineInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
  calendarId: string;
  eventId: string;
  proposedNewTime?: TimeSlot;
  sendResponse?: boolean | null;
  comment?: string | null;
}

export interface CalendarGroupCalendarEventDismissReminderInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
  calendarId: string;
  eventId: string;
}

export interface CalendarGroupCalendarEventForwardInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
  calendarId: string;
  eventId: string;
  toRecipients?: Recipient[];
  comment?: string | null;
}

export interface CalendarGroupCalendarEventPermanentDeleteInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
  calendarId: string;
  eventId: string;
}

export interface CalendarGroupCalendarEventSnoozeReminderInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
  calendarId: string;
  eventId: string;
  newReminderTime: DateTimeTimeZone;
}

export interface CalendarGroupCalendarEventTentativelyAcceptInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
  calendarId: string;
  eventId: string;
  proposedNewTime?: TimeSlot;
  sendResponse?: boolean | null;
  comment?: string | null;
}
