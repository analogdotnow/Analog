import type {
  ConferenceProperties,
  GoogleCalendarRequestOptions,
} from "../interfaces";

export interface Calendar {
  autoAcceptInvitations?: boolean;
  conferenceProperties?: ConferenceProperties;
  dataOwner?: string;
  description?: string;
  etag?: string;
  id?: string;
  kind?: string;
  labelProperties?: LabelProperties;
  location?: string;
  summary?: string;
  timeZone?: string;
}

export interface EventLabel {
  backgroundColor?: string;
  id?: string;
  name?: string;
}

export interface LabelProperties {
  eventLabels?: EventLabel[];
}

export interface EventLabelInput {
  backgroundColor: string;
  id?: string;
  name?: string;
}

export interface LabelPropertiesInput {
  eventLabels: EventLabelInput[];
}

export interface CalendarInput {
  description?: string;
  labelProperties?: LabelPropertiesInput;
  location?: string;
  summary?: string;
  timeZone?: string;
}

export interface InsertCalendarsInput
  extends GoogleCalendarRequestOptions, CalendarInput {
  summary: string;
}

export type InsertCalendarsResponse = Calendar;

export interface DeleteCalendarsInput extends GoogleCalendarRequestOptions {
  calendarId: string;
}

export interface GetCalendarsInput extends GoogleCalendarRequestOptions {
  calendarId: string;
}

export type GetCalendarsResponse = Calendar;

type CalendarPatchInput = {
  [Property in keyof CalendarInput]?: CalendarInput[Property] | null;
};

export type PatchCalendarsInput = GoogleCalendarRequestOptions &
  CalendarPatchInput & { calendarId: string };

export type PatchCalendarsResponse = Calendar;

export interface UpdateCalendarsInput
  extends GoogleCalendarRequestOptions, CalendarInput {
  calendarId: string;
}

export type UpdateCalendarsResponse = Calendar;

export interface ClearCalendarsInput extends GoogleCalendarRequestOptions {
  calendarId: string;
}

export interface TransferOwnershipCalendarsInput extends GoogleCalendarRequestOptions {
  calendarId: string;
  newDataOwner: string;
  useAdminAccess: true;
}
