import type {
  Extension,
  ExtensionCollectionResponse,
  MicrosoftCalendarRequestOptions,
} from "../../../../../interfaces";

export interface CalendarGroupCalendarEventListExtensionInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
  calendarId: string;
  eventId: string;
  top?: number;
  skip?: number;
  search?: string;
  filter?: string;
  count?: boolean;
  orderby?: string[];
  select?: string[];
  expand?: string[];
}

export type CalendarGroupCalendarEventListExtensionResponse =
  ExtensionCollectionResponse;

export interface CalendarGroupCalendarEventCreateExtensionInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
  calendarId: string;
  eventId: string;
  extension: Extension;
}

export type CalendarGroupCalendarEventCreateExtensionResponse = Extension;

export interface CalendarGroupCalendarEventExtensionGetCountInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
  calendarId: string;
  eventId: string;
  search?: string;
  filter?: string;
}

export type CalendarGroupCalendarEventExtensionGetCountResponse = number;

export interface CalendarGroupCalendarEventDeleteExtensionInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
  calendarId: string;
  eventId: string;
  extensionId: string;
  ifMatch?: string;
}

export interface CalendarGroupCalendarEventGetExtensionInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
  calendarId: string;
  eventId: string;
  extensionId: string;
  select?: string[];
  expand?: string[];
}

export type CalendarGroupCalendarEventGetExtensionResponse = Extension;

export interface CalendarGroupCalendarEventUpdateExtensionInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
  calendarId: string;
  eventId: string;
  extensionId: string;
  extension: Extension;
}

export type CalendarGroupCalendarEventUpdateExtensionResponse = Extension;
