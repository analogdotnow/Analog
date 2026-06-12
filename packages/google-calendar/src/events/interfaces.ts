import type {
  Channel,
  ChannelInput,
  EventReminder,
  GoogleCalendarRequestOptions,
} from "../interfaces";

export interface ConferenceData {
  conferenceId?: string;
  conferenceSolution?: ConferenceSolution;
  createRequest?: CreateConferenceRequest;
  entryPoints?: EntryPoint[];
  notes?: string;
  parameters?: ConferenceParameters;
  signature?: string;
}

export interface ConferenceParameters {
  addOnParameters?: ConferenceParametersAddOnParameters;
}

export interface ConferenceParametersAddOnParameters {
  parameters?: Record<string, string>;
}

export interface ConferenceRequestStatus {
  statusCode?: string;
}

export interface ConferenceSolution {
  iconUri?: string;
  key?: ConferenceSolutionKey;
  name?: string;
}

export interface ConferenceSolutionKey {
  type?: string;
}

export interface CreateConferenceRequest {
  conferenceSolutionKey?: ConferenceSolutionKey;
  requestId?: string;
  status?: ConferenceRequestStatus;
}

export interface EntryPoint {
  accessCode?: string;
  entryPointFeatures?: string[];
  entryPointType?: string;
  label?: string;
  meetingCode?: string;
  passcode?: string;
  password?: string;
  pin?: string;
  regionCode?: string;
  uri?: string;
}

export interface Event {
  anyoneCanAddSelf?: boolean;
  attachments?: EventAttachment[];
  attendees?: EventAttendee[];
  attendeesOmitted?: boolean;
  colorId?: string;
  conferenceData?: ConferenceData;
  created?: string;
  creator?: {
    displayName?: string;
    email?: string;
    id?: string;
    self?: boolean;
  };
  description?: string;
  end?: EventDateTime;
  endTimeUnspecified?: boolean;
  etag?: string;
  eventType?: string;
  extendedProperties?: {
    private?: Record<string, string>;
    shared?: Record<string, string>;
  };
  focusTimeProperties?: EventFocusTimeProperties;
  gadget?: {
    display?: string;
    height?: number;
    iconLink?: string;
    link?: string;
    preferences?: Record<string, string>;
    title?: string;
    type?: string;
    width?: number;
  };
  guestsCanInviteOthers?: boolean;
  guestsCanModify?: boolean;
  guestsCanSeeOtherGuests?: boolean;
  hangoutLink?: string;
  htmlLink?: string;
  iCalUID?: string;
  id?: string;
  kind?: string;
  location?: string;
  locked?: boolean;
  organizer?: {
    displayName?: string;
    email?: string;
    id?: string;
    self?: boolean;
  };
  originalStartTime?: EventDateTime;
  outOfOfficeProperties?: EventOutOfOfficeProperties;
  privateCopy?: boolean;
  recurrence?: string[];
  recurringEventId?: string;
  reminders?: { overrides?: EventReminder[]; useDefault?: boolean };
  sequence?: number;
  source?: { title?: string; url?: string };
  start?: EventDateTime;
  status?: string;
  summary?: string;
  transparency?: string;
  updated?: string;
  visibility?: string;
  workingLocationProperties?: EventWorkingLocationProperties;
}

export type EventInput = Omit<
  Event,
  | "created"
  | "creator"
  | "etag"
  | "hangoutLink"
  | "htmlLink"
  | "kind"
  | "locked"
  | "organizer"
  | "updated"
>;

export interface EventAttachment {
  fileId?: string;
  fileUrl?: string;
  iconLink?: string;
  mimeType?: string;
  title?: string;
}

export interface EventAttendee {
  additionalGuests?: number;
  comment?: string;
  displayName?: string;
  email?: string;
  id?: string;
  optional?: boolean;
  organizer?: boolean;
  resource?: boolean;
  responseStatus?: string;
  self?: boolean;
}

export interface EventDateTime {
  date?: string;
  dateTime?: string;
  timeZone?: string;
}

export interface EventFocusTimeProperties {
  autoDeclineMode?: string;
  chatStatus?: string;
  declineMessage?: string;
}

export interface EventOutOfOfficeProperties {
  autoDeclineMode?: string;
  declineMessage?: string;
}

export interface EventWorkingLocationProperties {
  customLocation?: { label?: string };
  homeOffice?: unknown;
  officeLocation?: {
    buildingId?: string;
    deskId?: string;
    floorId?: string;
    floorSectionId?: string;
    label?: string;
  };
  type?: string;
}

export interface Events {
  accessRole?: string;
  defaultReminders?: EventReminder[];
  description?: string;
  etag?: string;
  items?: Event[];
  kind?: string;
  nextPageToken?: string;
  nextSyncToken?: string;
  summary?: string;
  timeZone?: string;
  updated?: string;
}

export interface ListEventsInput extends GoogleCalendarRequestOptions {
  calendarId: string;
  alwaysIncludeEmail?: boolean;
  eventTypes?: ("default" | "focusTime" | "outOfOffice" | "workingLocation")[];
  iCalUID?: string;
  maxAttendees?: number;
  maxResults?: number;
  orderBy?: "startTime" | "updated";
  pageToken?: string;
  privateExtendedProperty?: string[];
  q?: string;
  sharedExtendedProperty?: string[];
  showDeleted?: boolean;
  showHiddenInvitations?: boolean;
  singleEvents?: boolean;
  syncToken?: string;
  timeMax?: string;
  timeMin?: string;
  timeZone?: string;
  updatedMin?: string;
}

export type ListEventsResponse = Events;

export interface InsertEventsInput
  extends GoogleCalendarRequestOptions, EventInput {
  calendarId: string;
  conferenceDataVersion?: number;
  maxAttendees?: number;
  sendNotifications?: boolean;
  sendUpdates?: "all" | "externalOnly" | "none";
  supportsAttachments?: boolean;
}

export type InsertEventsResponse = Event;

export interface ImportEventsInput
  extends GoogleCalendarRequestOptions, EventInput {
  calendarId: string;
  conferenceDataVersion?: number;
  supportsAttachments?: boolean;
}

export type ImportEventsResponse = Event;

export interface QuickAddEventsInput extends GoogleCalendarRequestOptions {
  calendarId: string;
  text: string;
  sendNotifications?: boolean;
  sendUpdates?: "all" | "externalOnly" | "none";
}

export type QuickAddEventsResponse = Event;

export interface WatchEventsInput
  extends GoogleCalendarRequestOptions, ChannelInput {
  calendarId: string;
  alwaysIncludeEmail?: boolean;
  eventTypes?: ("default" | "focusTime" | "outOfOffice" | "workingLocation")[];
  iCalUID?: string;
  maxAttendees?: number;
  maxResults?: number;
  orderBy?: "startTime" | "updated";
  pageToken?: string;
  privateExtendedProperty?: string[];
  q?: string;
  sharedExtendedProperty?: string[];
  showDeleted?: boolean;
  showHiddenInvitations?: boolean;
  singleEvents?: boolean;
  syncToken?: string;
  timeMax?: string;
  timeMin?: string;
  timeZone?: string;
  updatedMin?: string;
}

export type WatchEventsResponse = Channel;

export interface DeleteEventsInput extends GoogleCalendarRequestOptions {
  calendarId: string;
  eventId: string;
  sendNotifications?: boolean;
  sendUpdates?: "all" | "externalOnly" | "none";
}

export interface GetEventsInput extends GoogleCalendarRequestOptions {
  calendarId: string;
  eventId: string;
  alwaysIncludeEmail?: boolean;
  maxAttendees?: number;
  timeZone?: string;
}

export type GetEventsResponse = Event;

export interface PatchEventsInput
  extends GoogleCalendarRequestOptions, EventInput {
  calendarId: string;
  eventId: string;
  alwaysIncludeEmail?: boolean;
  conferenceDataVersion?: number;
  maxAttendees?: number;
  sendNotifications?: boolean;
  sendUpdates?: "all" | "externalOnly" | "none";
  supportsAttachments?: boolean;
}

export type PatchEventsResponse = Event;

export interface UpdateEventsInput
  extends GoogleCalendarRequestOptions, Omit<EventInput, "conferenceData"> {
  calendarId: string;
  eventId: string;
  // null clears the conference on the event
  conferenceData?: ConferenceData | null;
  alwaysIncludeEmail?: boolean;
  conferenceDataVersion?: number;
  maxAttendees?: number;
  sendNotifications?: boolean;
  sendUpdates?: "all" | "externalOnly" | "none";
  supportsAttachments?: boolean;
}

export type UpdateEventsResponse = Event;

export interface InstancesEventsInput extends GoogleCalendarRequestOptions {
  calendarId: string;
  eventId: string;
  alwaysIncludeEmail?: boolean;
  maxAttendees?: number;
  maxResults?: number;
  originalStart?: string;
  pageToken?: string;
  showDeleted?: boolean;
  timeMax?: string;
  timeMin?: string;
  timeZone?: string;
}

export type InstancesEventsResponse = Events;

export interface MoveEventsInput extends GoogleCalendarRequestOptions {
  calendarId: string;
  eventId: string;
  destination: string;
  sendNotifications?: boolean;
  sendUpdates?: "all" | "externalOnly" | "none";
}

export type MoveEventsResponse = Event;
