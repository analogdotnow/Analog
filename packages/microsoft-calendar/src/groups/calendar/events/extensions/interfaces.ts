import type {
  Extension,
  ExtensionCollectionResponse,
  MicrosoftCalendarRequestOptions,
} from "../../../../interfaces";

export interface GroupCalendarEventListExtensionInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
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

export type GroupCalendarEventListExtensionResponse =
  ExtensionCollectionResponse;

export interface GroupCalendarEventCreateExtensionInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  eventId: string;
  extension: Extension;
}

export type GroupCalendarEventCreateExtensionResponse = Extension;

export interface GroupCalendarEventExtensionGetCountInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  eventId: string;
  search?: string;
  filter?: string;
}

export type GroupCalendarEventExtensionGetCountResponse = number;

export interface GroupCalendarEventDeleteExtensionInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  eventId: string;
  extensionId: string;
  ifMatch?: string;
}

export interface GroupCalendarEventGetExtensionInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  eventId: string;
  extensionId: string;
  select?: string[];
  expand?: string[];
}

export type GroupCalendarEventGetExtensionResponse = Extension;

export interface GroupCalendarEventUpdateExtensionInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  eventId: string;
  extensionId: string;
  extension: Extension;
}

export type GroupCalendarEventUpdateExtensionResponse = Extension;
