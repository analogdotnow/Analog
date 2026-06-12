import type {
  Extension,
  ExtensionCollectionResponse,
  MicrosoftCalendarRequestOptions,
} from "../../../interfaces";

export interface GroupEventListExtensionInput extends MicrosoftCalendarRequestOptions {
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

export type GroupEventListExtensionResponse = ExtensionCollectionResponse;

export interface GroupEventCreateExtensionInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  eventId: string;
  extension: Extension;
}

export type GroupEventCreateExtensionResponse = Extension;

export interface GroupEventExtensionGetCountInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  eventId: string;
  search?: string;
  filter?: string;
}

export type GroupEventExtensionGetCountResponse = number;

export interface GroupEventDeleteExtensionInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  eventId: string;
  extensionId: string;
  ifMatch?: string;
}

export interface GroupEventGetExtensionInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  eventId: string;
  extensionId: string;
  select?: string[];
  expand?: string[];
}

export type GroupEventGetExtensionResponse = Extension;

export interface GroupEventUpdateExtensionInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  eventId: string;
  extensionId: string;
  extension: Extension;
}

export type GroupEventUpdateExtensionResponse = Extension;
