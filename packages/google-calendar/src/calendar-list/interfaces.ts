import type {
  Channel,
  ChannelInput,
  ConferenceProperties,
  EventReminder,
  EventReminderInput,
  GoogleCalendarRequestOptions,
} from "../interfaces";

export interface CalendarList {
  etag?: string;
  // Optional in the API reference, but always present: empty lists (e.g. service accounts) are returned as [].
  items: CalendarListEntry[];
  kind?: string;
  nextPageToken?: string;
  nextSyncToken?: string;
}

export interface CalendarListEntry {
  accessRole?: string;
  autoAcceptInvitations?: boolean;
  backgroundColor?: string;
  colorId?: string;
  conferenceProperties?: ConferenceProperties;
  dataOwner?: string;
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

export type CalendarAccessRole =
  | "freeBusyReader"
  | "owner"
  | "reader"
  | "writer"
  | "writerWithoutPrivateAccess";

export interface CalendarNotification {
  method?: "email";
  type?:
    | "agenda"
    | "eventCancellation"
    | "eventChange"
    | "eventCreation"
    | "eventResponse";
}

export interface CalendarNotificationInput extends CalendarNotification {
  method: "email";
  type:
    | "agenda"
    | "eventCancellation"
    | "eventChange"
    | "eventCreation"
    | "eventResponse";
}

export interface CalendarListEntryInput {
  backgroundColor?: string;
  colorId?: string;
  defaultReminders?: EventReminderInput[];
  foregroundColor?: string;
  hidden?: boolean;
  notificationSettings?: { notifications?: CalendarNotificationInput[] };
  selected?: boolean;
  summaryOverride?: string;
}

type CalendarListColorOptions =
  | {
      backgroundColor?: never;
      colorRgbFormat?: boolean;
      foregroundColor?: never;
    }
  | {
      backgroundColor?: string;
      colorRgbFormat: true;
      foregroundColor?: string;
    };

type CalendarListPatchColorOptions =
  | {
      backgroundColor?: never;
      colorRgbFormat?: boolean;
      foregroundColor?: never;
    }
  | {
      backgroundColor?: string | null;
      colorRgbFormat: true;
      foregroundColor?: string | null;
    };

type CalendarListEntryInputWithoutRgb = Omit<
  CalendarListEntryInput,
  "backgroundColor" | "foregroundColor"
>;

type CalendarListPatchEntryInputWithoutRgb = {
  [Property in keyof CalendarListEntryInputWithoutRgb]?:
    | CalendarListEntryInputWithoutRgb[Property]
    | null;
};

interface CalendarListOptions {
  maxResults?: number;
  pageToken?: string;
}

type CalendarListSyncOptions =
  | {
      minAccessRole?: CalendarAccessRole;
      showDeleted?: boolean;
      showHidden?: boolean;
      showOwnOrganizationOnly?: boolean;
      syncToken?: never;
    }
  | {
      minAccessRole?: never;
      showDeleted?: true;
      showHidden?: true;
      showOwnOrganizationOnly?: never;
      syncToken: string;
    };

export type ListCalendarListInput = GoogleCalendarRequestOptions &
  CalendarListOptions &
  CalendarListSyncOptions;

export type ListCalendarListResponse = CalendarList;

export type InsertCalendarListInput = GoogleCalendarRequestOptions &
  CalendarListEntryInputWithoutRgb &
  CalendarListColorOptions & {
    /** Identifier of the calendar to add to the user's calendar list. */
    id: string;
  };

export type InsertCalendarListResponse = CalendarListEntry;

export type WatchCalendarListInput = GoogleCalendarRequestOptions &
  ChannelInput &
  CalendarListOptions &
  CalendarListSyncOptions;

export type WatchCalendarListResponse = Channel;

export interface DeleteCalendarListInput extends GoogleCalendarRequestOptions {
  calendarId: string;
}

export interface GetCalendarListInput extends GoogleCalendarRequestOptions {
  calendarId: string;
}

export type GetCalendarListResponse = CalendarListEntry;

export type PatchCalendarListInput = GoogleCalendarRequestOptions &
  CalendarListPatchEntryInputWithoutRgb &
  CalendarListPatchColorOptions & { calendarId: string };

export type PatchCalendarListResponse = CalendarListEntry;

export type UpdateCalendarListInput = GoogleCalendarRequestOptions &
  CalendarListEntryInputWithoutRgb &
  CalendarListColorOptions & { calendarId: string };

export type UpdateCalendarListResponse = CalendarListEntry;
