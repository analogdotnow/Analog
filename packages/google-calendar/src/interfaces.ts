export type QueryParamItem = string | number | boolean;
export type QueryParamValue =
  | QueryParamItem
  | QueryParamItem[]
  | null
  | undefined;
export type QueryParams = Record<string, QueryParamValue>;
export type RequestHeaders = Record<string, string>;

export interface GoogleCalendarRequestOptions {
  signal?: AbortSignal;
  headers?: RequestHeaders;
  alt?: "json";
  fields?: string;
  key?: string;
  prettyPrint?: boolean;
  quotaUser?: string;
  userIp?: string;
}

export interface Channel {
  address?: string;
  expiration?: string;
  id?: string;
  kind?: string;
  params?: Record<string, string>;
  payload?: boolean;
  resourceId?: string;
  resourceUri?: string;
  token?: string;
  type?: "web_hook" | "webhook";
}

export interface ChannelInput {
  address: string;
  expiration?: string;
  id: string;
  params?: Record<string, string>;
  payload?: boolean;
  token?: string;
  type: "web_hook" | "webhook";
}

export interface ConferenceProperties {
  allowedConferenceSolutionTypes?: string[];
}

export interface EventReminder {
  method?: "email" | "popup";
  minutes?: number;
}

export interface EventReminderInput extends EventReminder {
  method: "email" | "popup";
  minutes: number;
}
