import type {
  Extension,
  ExtensionCollectionResponse,
  MicrosoftCalendarRequestOptions,
} from "../../../../interfaces";

export interface CalendarEventListExtensionInput extends MicrosoftCalendarRequestOptions {
  userId: string;
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

export type CalendarEventListExtensionResponse = ExtensionCollectionResponse;

export interface CalendarEventCreateExtensionInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarId: string;
  eventId: string;
  extension: Extension;
}

export type CalendarEventCreateExtensionResponse = Extension;

export interface CalendarEventExtensionGetCountInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarId: string;
  eventId: string;
  search?: string;
  filter?: string;
}

export type CalendarEventExtensionGetCountResponse = number;

export interface CalendarEventDeleteExtensionInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarId: string;
  eventId: string;
  extensionId: string;
  ifMatch?: string;
}

export interface CalendarEventGetExtensionInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarId: string;
  eventId: string;
  extensionId: string;
  select?: string[];
  expand?: string[];
}

export type CalendarEventGetExtensionResponse = Extension;

export interface CalendarEventUpdateExtensionInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarId: string;
  eventId: string;
  extensionId: string;
  extension: Extension;
}

export type CalendarEventUpdateExtensionResponse = Extension;
