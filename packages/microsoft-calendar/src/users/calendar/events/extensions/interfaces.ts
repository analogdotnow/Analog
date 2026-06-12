import type {
  Extension,
  ExtensionCollectionResponse,
  MicrosoftCalendarRequestOptions,
} from "../../../../interfaces";

export interface DefaultCalendarEventListExtensionInput extends MicrosoftCalendarRequestOptions {
  userId: string;
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

export type DefaultCalendarEventListExtensionResponse =
  ExtensionCollectionResponse;

export interface DefaultCalendarEventCreateExtensionInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  eventId: string;
  extension: Extension;
}

export type DefaultCalendarEventCreateExtensionResponse = Extension;

export interface DefaultCalendarEventExtensionGetCountInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  eventId: string;
  search?: string;
  filter?: string;
}

export type DefaultCalendarEventExtensionGetCountResponse = number;

export interface DefaultCalendarEventDeleteExtensionInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  eventId: string;
  extensionId: string;
  ifMatch?: string;
}

export interface DefaultCalendarEventGetExtensionInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  eventId: string;
  extensionId: string;
  select?: string[];
  expand?: string[];
}

export type DefaultCalendarEventGetExtensionResponse = Extension;

export interface DefaultCalendarEventUpdateExtensionInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  eventId: string;
  extensionId: string;
  extension: Extension;
}

export type DefaultCalendarEventUpdateExtensionResponse = Extension;
