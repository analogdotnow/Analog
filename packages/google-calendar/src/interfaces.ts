export type QueryParamItem = string | number | boolean;
export type QueryParamValue =
  | QueryParamItem
  | QueryParamItem[]
  | null
  | undefined;
export type QueryParams = Record<string, QueryParamValue>;

export interface GoogleCalendarRequestOptions {
  signal?: AbortSignal;
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
  type?: string;
}

export type ChannelInput = Omit<Channel, "resourceUri">;

export interface ConferenceProperties {
  allowedConferenceSolutionTypes?: string[];
}

export interface EventReminder {
  method?: string;
  minutes?: number;
}
