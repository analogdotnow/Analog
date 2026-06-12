import type {
  Extension,
  ExtensionCollectionResponse,
  MicrosoftCalendarRequestOptions,
} from "../../../interfaces";

export interface ListExtensionInput extends MicrosoftCalendarRequestOptions {
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

export type ListExtensionResponse = ExtensionCollectionResponse;

export interface CreateExtensionInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  eventId: string;
  extension: Extension;
}

export type CreateExtensionResponse = Extension;

export interface ExtensionGetCountInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  eventId: string;
  search?: string;
  filter?: string;
}

export type ExtensionGetCountResponse = number;

export interface DeleteExtensionInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  eventId: string;
  extensionId: string;
  ifMatch?: string;
}

export interface GetExtensionInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  eventId: string;
  extensionId: string;
  select?: string[];
  expand?: string[];
}

export type GetExtensionResponse = Extension;

export interface UpdateExtensionInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  eventId: string;
  extensionId: string;
  extension: Extension;
}

export type UpdateExtensionResponse = Extension;
