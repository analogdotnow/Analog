import type {
  Channel,
  ChannelInput,
  GoogleCalendarRequestOptions,
} from "../interfaces";

export interface Setting {
  etag?: string;
  id?: string;
  kind?: string;
  value?: string;
}

export interface Settings {
  etag?: string;
  items?: Setting[];
  kind?: string;
  nextPageToken?: string;
  nextSyncToken?: string;
}

export interface ListSettingsInput extends GoogleCalendarRequestOptions {
  maxResults?: number;
  pageToken?: string;
  syncToken?: string;
}

export type ListSettingsResponse = Settings;

export interface WatchSettingsInput
  extends GoogleCalendarRequestOptions, ChannelInput {
  maxResults?: number;
  pageToken?: string;
  syncToken?: string;
}

export type WatchSettingsResponse = Channel;

export interface GetSettingsInput extends GoogleCalendarRequestOptions {
  setting: string;
}

export type GetSettingsResponse = Setting;
