import type {
  Channel,
  ChannelInput,
  ConferenceProperties,
  EventReminder,
  GoogleCalendarRequestOptions,
} from "../interfaces";

export interface CalendarList {
  etag?: string;
  items?: CalendarListEntry[];
  kind?: string;
  nextPageToken?: string;
  nextSyncToken?: string;
}

export interface CalendarListEntry {
  accessRole?: string;
  backgroundColor?: string;
  colorId?: string;
  conferenceProperties?: ConferenceProperties;
  defaultReminders?: EventReminder[];
  deleted?: boolean;
  description?: string;
  etag?: string;
  foregroundColor?: string;
  hidden?: boolean;
  id?: string;
  kind?: string;
  location?: string;
  notificationSettings?: { notifications?: CalendarNotification[] };
  primary?: boolean;
  selected?: boolean;
  summary?: string;
  summaryOverride?: string;
  timeZone?: string;
}

export interface CalendarNotification {
  method?: string;
  type?: string;
}

export type CalendarListEntryInput = Omit<
  CalendarListEntry,
  | "accessRole"
  | "deleted"
  | "description"
  | "etag"
  | "id"
  | "kind"
  | "location"
  | "primary"
  | "summary"
  | "timeZone"
>;

export interface ListCalendarListInput extends GoogleCalendarRequestOptions {
  maxResults?: number;
  minAccessRole?: "freeBusyReader" | "owner" | "reader" | "writer";
  pageToken?: string;
  showDeleted?: boolean;
  showHidden?: boolean;
  syncToken?: string;
}

export type ListCalendarListResponse = CalendarList;

export interface InsertCalendarListInput
  extends GoogleCalendarRequestOptions, CalendarListEntryInput {
  /** Identifier of the calendar to add to the user's calendar list. */
  id: string;
  colorRgbFormat?: boolean;
}

export type InsertCalendarListResponse = CalendarListEntry;

export interface WatchCalendarListInput
  extends GoogleCalendarRequestOptions, ChannelInput {
  maxResults?: number;
  minAccessRole?: "freeBusyReader" | "owner" | "reader" | "writer";
  pageToken?: string;
  showDeleted?: boolean;
  showHidden?: boolean;
  syncToken?: string;
}

export type WatchCalendarListResponse = Channel;

export interface DeleteCalendarListInput extends GoogleCalendarRequestOptions {
  calendarId: string;
}

export interface GetCalendarListInput extends GoogleCalendarRequestOptions {
  calendarId: string;
}

export type GetCalendarListResponse = CalendarListEntry;

export interface PatchCalendarListInput
  extends GoogleCalendarRequestOptions, CalendarListEntryInput {
  calendarId: string;
  colorRgbFormat?: boolean;
}

export type PatchCalendarListResponse = CalendarListEntry;

export interface UpdateCalendarListInput
  extends GoogleCalendarRequestOptions, CalendarListEntryInput {
  calendarId: string;
  colorRgbFormat?: boolean;
}

export type UpdateCalendarListResponse = CalendarListEntry;
