import type {
  Channel,
  ChannelInput,
  EventReminder,
  EventReminderInput,
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

export interface ConferenceSolutionInput {
  iconUri?: string;
  key: ConferenceSolutionKeyInput;
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

export interface CreateConferenceRequestInput {
  conferenceSolutionKey?: ConferenceSolutionKeyInput;
  requestId: string;
}

export interface ConferenceSolutionKeyInput {
  type: string;
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

export interface EntryPointInput {
  accessCode?: string;
  entryPointFeatures?: string[];
  entryPointType: string;
  label?: string;
  meetingCode?: string;
  passcode?: string;
  password?: string;
  pin?: string;
  regionCode?: string;
  uri: string;
}

export interface Event {
  anyoneCanAddSelf?: boolean;
  attachments?: EventAttachment[];
  attendees?: EventAttendee[];
  attendeesOmitted?: boolean;
  birthdayProperties?: EventBirthdayProperties;
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
  eventLabelId?: string;
  eventType?: EventType;
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
  status?: "cancelled" | "confirmed" | "tentative";
  summary?: string;
  transparency?: "opaque" | "transparent";
  updated?: string;
  visibility?: "confidential" | "default" | "private" | "public";
  workingLocationProperties?: EventWorkingLocationProperties;
}

export type EventType =
  | "birthday"
  | "default"
  | "focusTime"
  | "fromGmail"
  | "outOfOffice"
  | "workingLocation";

export interface EventInput {
  anyoneCanAddSelf?: boolean;
  attachments?: EventAttachmentInput[];
  attendees?: EventAttendeeInput[];
  attendeesOmitted?: boolean;
  birthdayProperties?: EventBirthdayPropertiesInput;
  colorId?: string;
  conferenceData?: ConferenceDataInput;
  description?: string;
  end: EventDateTime;
  eventLabelId?: string;
  extendedProperties?: {
    private?: Record<string, string>;
    shared?: Record<string, string>;
  };
  focusTimeProperties?: EventFocusTimeProperties;
  guestsCanInviteOthers?: boolean;
  guestsCanModify?: boolean;
  guestsCanSeeOtherGuests?: boolean;
  location?: string;
  originalStartTime?: EventDateTime;
  outOfOfficeProperties?: EventOutOfOfficeProperties;
  recurrence?: string[];
  reminders?: { overrides?: EventReminderInput[]; useDefault?: boolean };
  sequence?: number;
  source?: { title?: string; url?: string };
  start: EventDateTime;
  status?: "cancelled" | "confirmed" | "tentative";
  summary?: string;
  transparency?: "opaque" | "transparent";
  visibility?: "confidential" | "default" | "private" | "public";
  workingLocationProperties?: EventWorkingLocationPropertiesInput;
}

type ConferenceDataCreateInput = {
  createRequest: CreateConferenceRequestInput;
} & Partial<Record<Exclude<keyof ConferenceData, "createRequest">, never>>;

export type ConferenceDataCopyInput = ConferenceData & {
  conferenceSolution: ConferenceSolution;
  entryPoints: [EntryPoint, ...EntryPoint[]];
};

type ConferenceDataClearInput = Partial<Record<keyof ConferenceData, never>>;

export type ConferenceDataInput =
  | ConferenceDataClearInput
  | ConferenceDataCopyInput
  | ConferenceDataCreateInput;

export interface EventAttachment {
  fileId?: string;
  fileUrl?: string;
  iconLink?: string;
  mimeType?: string;
  title?: string;
}

export interface EventAttachmentInput {
  fileUrl: string;
  iconLink?: string;
  mimeType?: string;
  title?: string;
}

export interface EventAttendee {
  additionalGuests?: number;
  asyncOperation?: "inProgress";
  comment?: string;
  displayName?: string;
  email?: string;
  id?: string;
  optional?: boolean;
  organizer?: boolean;
  resource?: boolean;
  responseStatus?: "accepted" | "declined" | "needsAction" | "tentative";
  self?: boolean;
}

export interface EventAttendeeInput {
  additionalGuests?: number;
  comment?: string;
  displayName?: string;
  email: string;
  optional?: boolean;
  resource?: boolean;
  responseStatus?: "accepted" | "declined" | "needsAction" | "tentative";
}

interface AllDayEventDateTime {
  date: string;
  dateTime?: never;
  // Required for recurring events: specifies the zone in which the recurrence is expanded.
  timeZone?: string;
}

interface TimedEventDateTime {
  date?: never;
  dateTime: string;
  timeZone?: string;
}

export type EventDateTime = AllDayEventDateTime | TimedEventDateTime;

export interface EventBirthdayProperties {
  contact?: string;
  customTypeName?: string;
  type?: "anniversary" | "birthday" | "custom" | "other" | "self";
}

export interface EventBirthdayPropertiesInput {
  type: "birthday";
}

export interface EventFocusTimeProperties {
  autoDeclineMode?:
    | "declineAllConflictingInvitations"
    | "declineNone"
    | "declineOnlyNewConflictingInvitations";
  chatStatus?: "available" | "doNotDisturb";
  declineMessage?: string;
}

export interface EventOutOfOfficeProperties {
  autoDeclineMode?:
    | "declineAllConflictingInvitations"
    | "declineNone"
    | "declineOnlyNewConflictingInvitations";
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
  type?: "customLocation" | "homeOffice" | "officeLocation";
}

export interface EventWorkingLocationPropertiesInput extends EventWorkingLocationProperties {
  type: "customLocation" | "homeOffice" | "officeLocation";
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

interface EventsListOptions {
  calendarId: string;
  alwaysIncludeEmail?: boolean;
  eventTypes?: EventType[];
  maxAttendees?: number;
  maxResults?: number;
  pageToken?: string;
  showHiddenInvitations?: boolean;
  timeZone?: string;
}

type EventsOrderOptions =
  | { orderBy?: "updated"; singleEvents?: boolean }
  | { orderBy: "startTime"; singleEvents: true };

type EventsSyncOptions =
  | (EventsOrderOptions & {
      iCalUID?: string;
      privateExtendedProperty?: string[];
      q?: string;
      sharedExtendedProperty?: string[];
      showDeleted?: boolean;
      syncToken?: never;
      timeMax?: string;
      timeMin?: string;
      updatedMin?: string;
    })
  | {
      iCalUID?: never;
      orderBy?: never;
      privateExtendedProperty?: never;
      q?: never;
      sharedExtendedProperty?: never;
      showDeleted?: true;
      singleEvents?: boolean;
      syncToken?: string;
      timeMax?: never;
      timeMin?: never;
      updatedMin?: never;
    };

export type ListEventsInput = GoogleCalendarRequestOptions &
  EventsListOptions &
  EventsSyncOptions;

export type ListEventsResponse = Events;

interface InsertEventsOptions extends GoogleCalendarRequestOptions {
  calendarId: string;
  eventType?:
    | "birthday"
    | "default"
    | "focusTime"
    | "outOfOffice"
    | "workingLocation";
  id?: string;
  maxAttendees?: number;
  sendNotifications?: boolean;
  sendUpdates?: "all" | "externalOnly" | "none";
}

interface EventAttachmentOptions {
  attachments?: EventAttachmentInput[];
  supportsAttachments?: boolean;
}

interface EventConferenceOptions {
  conferenceData?: ConferenceDataInput;
  conferenceDataVersion?: 0 | 1;
}

// With eventLabelVersion=1 Google processes eventLabelId and ignores colorId; version 0 processes colorId only.
type EventLabelOptions =
  | {
      colorId?: string;
      eventLabelId?: never;
      eventLabelVersion?: 0;
    }
  | {
      colorId?: never;
      eventLabelId?: string;
      eventLabelVersion: 1;
    };

type EventFeatureOptions = EventAttachmentOptions &
  EventConferenceOptions &
  EventLabelOptions;

type EventInputWithoutFeatures = Omit<
  EventInput,
  "attachments" | "colorId" | "conferenceData" | "eventLabelId"
>;

type EventRange =
  | { end: AllDayEventDateTime; start: AllDayEventDateTime }
  | { end: TimedEventDateTime; start: TimedEventDateTime };

type StandardInsertEventInput = Omit<
  EventInputWithoutFeatures,
  | "birthdayProperties"
  | "focusTimeProperties"
  | "outOfOfficeProperties"
  | "workingLocationProperties"
> &
  (
    | {
        birthdayProperties?: never;
        eventType?: "default";
        focusTimeProperties?: never;
        outOfOfficeProperties?: never;
        workingLocationProperties?: never;
      }
    | {
        birthdayProperties?: never;
        end: TimedEventDateTime;
        eventType: "focusTime";
        focusTimeProperties: EventFocusTimeProperties;
        outOfOfficeProperties?: never;
        start: TimedEventDateTime;
        transparency: "opaque";
        workingLocationProperties?: never;
      }
    | {
        birthdayProperties?: never;
        end: TimedEventDateTime;
        eventType: "outOfOffice";
        focusTimeProperties?: never;
        outOfOfficeProperties: EventOutOfOfficeProperties;
        start: TimedEventDateTime;
        transparency: "opaque";
        workingLocationProperties?: never;
      }
    | ({
        birthdayProperties?: never;
        eventType: "workingLocation";
        focusTimeProperties?: never;
        outOfOfficeProperties?: never;
        transparency: "transparent";
        visibility: "public";
        workingLocationProperties: EventWorkingLocationPropertiesInput;
      } & EventRange)
  );

type BirthdayEventProperty =
  | "birthdayProperties"
  | "end"
  | "recurrence"
  | "reminders"
  | "start"
  | "summary"
  | "transparency"
  | "visibility";

type BirthdayInsertEventInput = Pick<
  EventInputWithoutFeatures,
  BirthdayEventProperty
> &
  Partial<
    Record<
      Exclude<keyof EventInputWithoutFeatures, BirthdayEventProperty>,
      never
    >
  > & {
    attachments?: never;
    conferenceData?: never;
    end: AllDayEventDateTime;
    eventLabelId?: never;
    eventType: "birthday";
    id?: never;
    recurrence:
      | ["RRULE:FREQ=YEARLY"]
      | ["RRULE:FREQ=YEARLY;BYMONTH=2;BYMONTHDAY=-1"];
    start: AllDayEventDateTime;
    transparency: "transparent";
    visibility: "private";
  };

type InsertEventInput = StandardInsertEventInput | BirthdayInsertEventInput;

type BirthdayUpdateRange =
  | { end?: never; start?: never }
  | { end: AllDayEventDateTime; start: AllDayEventDateTime };

type BirthdayUpdateEventProperty = "reminders" | "summary";

type BirthdayUpdateEventInput = Pick<
  EventInputWithoutFeatures,
  BirthdayUpdateEventProperty
> &
  Partial<
    Record<
      Exclude<
        keyof EventInputWithoutFeatures,
        BirthdayUpdateEventProperty | "end" | "start"
      >,
      never
    >
  > &
  BirthdayUpdateRange & { eventType: "birthday" };

type FromGmailUpdateEventProperty =
  | "attendees"
  | "extendedProperties"
  | "reminders"
  | "status"
  | "transparency"
  | "visibility";

type FromGmailUpdateEventInput = Pick<
  EventInputWithoutFeatures,
  FromGmailUpdateEventProperty
> &
  Partial<
    Record<
      Exclude<keyof EventInputWithoutFeatures, FromGmailUpdateEventProperty>,
      never
    >
  > & { eventType: "fromGmail" };

interface RestrictedEventBodyFeatures {
  attachments?: never;
  colorId?: string;
  conferenceData?: never;
  conferenceDataVersion?: never;
  eventLabelId?: never;
  eventLabelVersion?: 0;
  supportsAttachments?: never;
}

// The standard arm reuses the nullable patch body so an explicit null clears a
// field in the full-replace PUT; start/end stay required per the update docs.
export type EventUpdateInput =
  | (StandardPatchEventInput & Pick<EventInput, "end" | "start">)
  | ((BirthdayUpdateEventInput | FromGmailUpdateEventInput) &
      RestrictedEventBodyFeatures);

export type InsertEventsInput = InsertEventsOptions &
  InsertEventInput &
  EventFeatureOptions;

export type InsertEventsResponse = Event;

interface ImportEventsOptions extends GoogleCalendarRequestOptions {
  calendarId: string;
  eventType?: "default";
  iCalUID: string;
  organizer?: { displayName?: string; email?: string };
}

export type ImportEventsInput = ImportEventsOptions &
  EventInputWithoutFeatures &
  EventFeatureOptions;

export type ImportEventsResponse = Event;

export interface QuickAddEventsInput extends GoogleCalendarRequestOptions {
  calendarId: string;
  text: string;
  sendNotifications?: boolean;
  sendUpdates?: "all" | "externalOnly" | "none";
}

export type QuickAddEventsResponse = Event;

export type WatchEventsInput = GoogleCalendarRequestOptions &
  ChannelInput &
  EventsListOptions &
  EventsSyncOptions;

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

interface PatchEventsOptions extends GoogleCalendarRequestOptions {
  calendarId: string;
  eventId: string;
  alwaysIncludeEmail?: boolean;
  maxAttendees?: number;
  sendNotifications?: boolean;
  sendUpdates?: "all" | "externalOnly" | "none";
}

type NullableEventPatchProperty = Exclude<
  keyof EventInputWithoutFeatures,
  "attendees" | "birthdayProperties" | "end" | "extendedProperties" | "start"
>;

type EventPatchBody = Partial<
  Pick<EventInputWithoutFeatures, "end" | "start">
> & {
  [Property in NullableEventPatchProperty]?:
    | EventInputWithoutFeatures[Property]
    | null;
} & {
  attendees?:
    | (Omit<EventAttendeeInput, "comment"> & {
        comment?: string | null;
      })[]
    | null;
  birthdayProperties?: never;
  extendedProperties?: {
    private?: Record<string, string | null> | null;
    shared?: Record<string, string | null> | null;
  } | null;
};

// Patch never sends the eventType discriminator on the wire; update echoes the
// existing value. Google forbids changing an event's type after creation.
type StandardPatchEventInput = EventPatchBody & {
  eventType?: "default" | "focusTime" | "outOfOffice" | "workingLocation";
} & EventAttachmentOptions & {
    conferenceData?: ConferenceDataInput | null;
    conferenceDataVersion?: 0 | 1;
  } & (
    | { colorId?: string | null; eventLabelId?: never; eventLabelVersion?: 0 }
    | { colorId?: never; eventLabelId?: string; eventLabelVersion: 1 }
  );

interface RestrictedEventPatchFeatures {
  attachments?: never;
  colorId?: string | null;
  conferenceData?: never;
  conferenceDataVersion?: never;
  eventLabelId?: never;
  eventLabelVersion?: 0;
  supportsAttachments?: never;
}

type BirthdayPatchEventProperty = "reminders" | "summary";

type BirthdayPatchEventInput = Pick<
  EventPatchBody,
  BirthdayPatchEventProperty
> &
  Partial<
    Record<
      Exclude<
        keyof EventInputWithoutFeatures,
        BirthdayPatchEventProperty | "end" | "start"
      >,
      never
    >
  > & {
    end?: AllDayEventDateTime;
    eventType: "birthday";
    start?: AllDayEventDateTime;
  } & RestrictedEventPatchFeatures;

type FromGmailPatchEventProperty =
  | "attendees"
  | "extendedProperties"
  | "reminders"
  | "status"
  | "transparency"
  | "visibility";

type FromGmailPatchEventInput = Pick<
  EventPatchBody,
  FromGmailPatchEventProperty
> &
  Partial<
    Record<
      Exclude<keyof EventInputWithoutFeatures, FromGmailPatchEventProperty>,
      never
    >
  > & { eventType: "fromGmail" } & RestrictedEventPatchFeatures;

export type PatchEventsInput = PatchEventsOptions &
  (
    | StandardPatchEventInput
    | BirthdayPatchEventInput
    | FromGmailPatchEventInput
  );

export type PatchEventsResponse = Event;

interface UpdateEventsOptions extends GoogleCalendarRequestOptions {
  calendarId: string;
  eventId: string;
  alwaysIncludeEmail?: boolean;
  maxAttendees?: number;
  sendNotifications?: boolean;
  sendUpdates?: "all" | "externalOnly" | "none";
}

export type UpdateEventsInput = UpdateEventsOptions & EventUpdateInput;

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
