export type QueryParamItem = string | number | boolean;
export type QueryParamValue =
  | QueryParamItem
  | QueryParamItem[]
  | null
  | undefined;
export type QueryParams = Record<string, QueryParamValue>;
export type RequestHeaders = Record<string, string>;

export interface MicrosoftCalendarRequestOptions {
  signal?: AbortSignal;
  headers?: RequestHeaders;
}

export interface ListMoreInput extends MicrosoftCalendarRequestOptions {
  nextLink: string;
}

export interface CollectionResponse<T> {
  value?: T[];
  "@odata.nextLink"?: string | null;
  "@odata.count"?: number;
  [key: string]: unknown;
}

export interface DeltaCollectionResponse<T> extends CollectionResponse<T> {
  "@odata.deltaLink"?: string | null;
}

export interface DeltaRemovedEvent {
  id: string;
  "@removed": {
    reason: "deleted";
  };
}

export type ODataCountResponse = number;

export interface Attachment extends Entity {
  "@odata.type"?:
    | "#microsoft.graph.attachment"
    | "#microsoft.graph.fileAttachment"
    | "#microsoft.graph.itemAttachment"
    | "#microsoft.graph.referenceAttachment";
  contentBytes?: string | null;
  contentId?: string | null;
  contentLocation?: string | null;
  contentType?: string | null;
  isInline?: boolean;
  item?: OutlookItem;
  lastModifiedDateTime?: string | null;
  name?: string | null;
  permission?: string | null;
  previewUrl?: string | null;
  providerType?: string | null;
  size?: number;
  sourceUrl?: string | null;
  thumbnailUrl?: string | null;
  [key: string]: unknown;
}

export interface AttachmentCollectionResponse extends CollectionResponse<Attachment> {}

export interface AttachmentItem {
  attachmentType: AttachmentType;
  contentId?: string | null;
  contentType?: string | null;
  isInline?: boolean | null;
  name: string;
  size: number;
  [key: string]: unknown;
}

export type AttachmentType = "file" | "item" | "reference";

export interface Attendee extends AttendeeBase {
  proposedNewTime?: TimeSlot;
  status?: ResponseStatus;
  [key: string]: unknown;
}

export interface AttendeeBase extends Recipient {
  type?: AttendeeType;
  [key: string]: unknown;
}

export type AttendeeType = "required" | "optional" | "resource";

export type BodyType = "text" | "html";

export interface Calendar extends Entity {
  allowedOnlineMeetingProviders?: OnlineMeetingProviderType[];
  canEdit?: boolean | null;
  canShare?: boolean | null;
  canViewPrivateItems?: boolean | null;
  changeKey?: string | null;
  color?: CalendarColor;
  defaultOnlineMeetingProvider?: OnlineMeetingProviderType;
  hexColor?: string | null;
  isDefaultCalendar?: boolean | null;
  isRemovable?: boolean | null;
  isTallyingResponses?: boolean | null;
  name?: string | null;
  owner?: EmailAddress;
  calendarPermissions?: CalendarPermission[];
  calendarView?: Event[];
  events?: Event[];
  multiValueExtendedProperties?: MultiValueLegacyExtendedProperty[];
  singleValueExtendedProperties?: SingleValueLegacyExtendedProperty[];
  [key: string]: unknown;
}

export interface CalendarCollectionResponse extends CollectionResponse<Calendar> {}

export type CalendarColor =
  | "auto"
  | "lightBlue"
  | "lightGreen"
  | "lightOrange"
  | "lightGray"
  | "lightYellow"
  | "lightTeal"
  | "lightPink"
  | "lightBrown"
  | "lightRed"
  | "maxColor";

export interface CalendarGroup extends Entity {
  changeKey?: string | null;
  classId?: string | null;
  name?: string | null;
  calendars?: Calendar[];
  [key: string]: unknown;
}

export interface CalendarGroupCollectionResponse extends CollectionResponse<CalendarGroup> {}

export interface CalendarPermission extends Entity {
  allowedRoles?: CalendarRoleType[];
  emailAddress?: EmailAddress;
  isInsideOrganization?: boolean | null;
  isRemovable?: boolean | null;
  role?: CalendarRoleType;
  [key: string]: unknown;
}

export interface CalendarPermissionCollectionResponse extends CollectionResponse<CalendarPermission> {}

export type CalendarRoleType =
  | "none"
  | "freeBusyRead"
  | "limitedRead"
  | "read"
  | "write"
  | "delegateWithoutPrivateEventAccess"
  | "delegateWithPrivateEventAccess"
  | "custom";

// Graph's OpenAPI marks every field optional. The docs only define dateTime and
// timeZone; both are expected when the type is present.
// https://learn.microsoft.com/en-us/graph/api/resources/datetimetimezone
export interface DateTimeTimeZone {
  dateTime: string;
  timeZone: string;
  [key: string]: unknown;
}

export type DayOfWeek =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

export interface EmailAddress {
  address?: string | null;
  name?: string | null;
  [key: string]: unknown;
}

export interface Entity {
  id?: string;
  [key: string]: unknown;
}

// Graph's OpenAPI marks every field optional. Calendar event docs always
// expect start and end on GET/create; PATCH sends Partial<Event> with only
// changed fields.
// https://learn.microsoft.com/en-us/graph/api/resources/event
export interface Event extends OutlookItem {
  allowNewTimeProposals?: boolean | null;
  attendees?: Attendee[];
  body?: ItemBody;
  bodyPreview?: string | null;
  cancelledOccurrences?: string[];
  end: DateTimeTimeZone;
  hasAttachments?: boolean | null;
  hideAttendees?: boolean | null;
  iCalUId?: string | null;
  importance?: Importance;
  isAllDay?: boolean | null;
  isCancelled?: boolean | null;
  isDraft?: boolean | null;
  isOnlineMeeting?: boolean | null;
  isOrganizer?: boolean | null;
  isReminderOn?: boolean | null;
  location?: Location;
  locations?: Location[];
  onlineMeeting?: OnlineMeetingInfo;
  onlineMeetingProvider?: OnlineMeetingProviderType;
  onlineMeetingUrl?: string | null;
  organizer?: Recipient;
  originalEndTimeZone?: string | null;
  originalStart?: string | null;
  originalStartTimeZone?: string | null;
  // null is meaningful on update: Graph removes the recurrence, turning the
  // series master back into a single event.
  recurrence?: PatternedRecurrence | null;
  reminderMinutesBeforeStart?: number | null;
  responseRequested?: boolean | null;
  responseStatus?: ResponseStatus;
  sensitivity?: Sensitivity;
  seriesMasterId?: string | null;
  showAs?: FreeBusyStatus;
  start: DateTimeTimeZone;
  subject?: string | null;
  transactionId?: string | null;
  type?: EventType;
  webLink?: string | null;
  attachments?: Attachment[];
  calendar?: Calendar;
  exceptionOccurrences?: Event[];
  extensions?: Extension[];
  instances?: Event[];
  multiValueExtendedProperties?: MultiValueLegacyExtendedProperty[];
  singleValueExtendedProperties?: SingleValueLegacyExtendedProperty[];
  [key: string]: unknown;
}

export interface EventCollectionResponse extends CollectionResponse<Event> {}

export type EventType =
  | "singleInstance"
  | "occurrence"
  | "exception"
  | "seriesMaster";

export interface Extension extends Entity {
  [key: string]: unknown;
}

export interface ExtensionCollectionResponse extends CollectionResponse<Extension> {}

export interface FreeBusyError {
  message?: string | null;
  responseCode?: string | null;
  [key: string]: unknown;
}

export type FreeBusyStatus =
  | "unknown"
  | "free"
  | "tentative"
  | "busy"
  | "oof"
  | "workingElsewhere";

export type Importance = "low" | "normal" | "high";

export interface ItemBody {
  content?: string | null;
  contentType?: BodyType;
  [key: string]: unknown;
}

export interface Location {
  address?: PhysicalAddress;
  coordinates?: OutlookGeoCoordinates;
  displayName?: string | null;
  locationEmailAddress?: string | null;
  locationType?: LocationType;
  locationUri?: string | null;
  uniqueId?: string | null;
  uniqueIdType?: LocationUniqueIdType;
  [key: string]: unknown;
}

export type LocationType =
  | "default"
  | "conferenceRoom"
  | "homeAddress"
  | "businessAddress"
  | "geoCoordinates"
  | "streetAddress"
  | "hotel"
  | "restaurant"
  | "localBusiness"
  | "postalAddress";

export type LocationUniqueIdType =
  | "unknown"
  | "locationStore"
  | "directory"
  | "private"
  | "bing";

// Graph's OpenAPI marks every field optional. Create docs require id and
// value for each property in multiValueExtendedProperties.
// https://learn.microsoft.com/en-us/graph/api/multivaluelegacyextendedproperty-post-multivalueextendedproperties?view=graph-rest-1.0
export interface MultiValueLegacyExtendedProperty extends Entity {
  id: string;
  value: (string | null)[];
  [key: string]: unknown;
}

export interface OnlineMeetingInfo {
  conferenceId?: string | null;
  joinUrl?: string | null;
  phones?: Phone[];
  quickDial?: string | null;
  tollFreeNumbers?: (string | null)[];
  tollNumber?: string | null;
  [key: string]: unknown;
}

export type OnlineMeetingProviderType =
  | "unknown"
  | "skypeForBusiness"
  | "skypeForConsumer"
  | "teamsForBusiness";

export interface OutlookGeoCoordinates {
  accuracy?: number | null;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  [key: string]: unknown;
}

export interface OutlookItem extends Entity {
  categories?: (string | null)[];
  changeKey?: string | null;
  createdDateTime?: string | null;
  lastModifiedDateTime?: string | null;
  [key: string]: unknown;
}

// Graph's OpenAPI marks both as optional (the type is shared with access
// reviews, which omit pattern for one-time reviews). For calendar events,
// both are required when recurrence is set.
// https://learn.microsoft.com/en-us/graph/outlook-schedule-recurring-events
export interface PatternedRecurrence {
  pattern: RecurrencePattern;
  range: RecurrenceRange;
  [key: string]: unknown;
}

// Graph's OpenAPI marks every field optional. The docs only define number and
// type; both are expected on a phone entry.
// https://learn.microsoft.com/en-us/graph/api/resources/phone?view=graph-rest-1.0
export interface Phone {
  language?: string | null;
  number: string;
  region?: string | null;
  type: PhoneType;
  [key: string]: unknown;
}

export type PhoneType =
  | "home"
  | "business"
  | "mobile"
  | "other"
  | "assistant"
  | "homeFax"
  | "businessFax"
  | "otherFax"
  | "pager"
  | "radio";

export interface PhysicalAddress {
  city?: string | null;
  countryOrRegion?: string | null;
  postalCode?: string | null;
  state?: string | null;
  street?: string | null;
  [key: string]: unknown;
}

// Graph's OpenAPI marks emailAddress optional. The docs only define
// emailAddress; it is expected on a recipient.
// https://learn.microsoft.com/en-us/graph/api/resources/recipient
export interface Recipient {
  emailAddress: EmailAddress;
  [key: string]: unknown;
}

// Graph's OpenAPI marks every field optional. Docs require type and interval
// for every pattern; other fields are required only for specific types.
// https://learn.microsoft.com/en-us/graph/api/resources/recurrencepattern
export interface RecurrencePattern {
  dayOfMonth?: number;
  daysOfWeek?: DayOfWeek[];
  firstDayOfWeek?: DayOfWeek;
  index?: WeekIndex;
  interval: number;
  month?: number;
  type: RecurrencePatternType;
  [key: string]: unknown;
}

export type RecurrencePatternType =
  | "daily"
  | "weekly"
  | "absoluteMonthly"
  | "relativeMonthly"
  | "absoluteYearly"
  | "relativeYearly";

// Graph's OpenAPI marks every field optional. Docs require type and startDate
// for every range; endDate / numberOfOccurrences depend on type.
// https://learn.microsoft.com/en-us/graph/api/resources/recurrencerange
export interface RecurrenceRange {
  endDate?: string | null;
  numberOfOccurrences?: number;
  recurrenceTimeZone?: string | null;
  startDate: string;
  type: RecurrenceRangeType;
  [key: string]: unknown;
}

export type RecurrenceRangeType = "endDate" | "noEnd" | "numbered";

export interface ResponseStatus {
  response?: ResponseType;
  time?: string | null;
  [key: string]: unknown;
}

export type ResponseType =
  | "none"
  | "organizer"
  | "tentativelyAccepted"
  | "accepted"
  | "declined"
  | "notResponded";

export interface ScheduleInformation {
  availabilityView?: string | null;
  error?: FreeBusyError;
  /** SMTP address of the user, distribution list, or resource represented by this schedule information. */
  scheduleId: string;
  scheduleItems?: ScheduleItem[];
  workingHours?: WorkingHours;
  [key: string]: unknown;
}

// Graph's OpenAPI marks every field optional. Docs mark only isPrivate,
// location, and subject as optional; start, end, and status are expected.
// https://learn.microsoft.com/en-us/graph/api/resources/scheduleitem
export interface ScheduleItem {
  end: DateTimeTimeZone;
  isPrivate?: boolean | null;
  location?: string | null;
  start: DateTimeTimeZone;
  status: FreeBusyStatus;
  subject?: string | null;
  [key: string]: unknown;
}

export type Sensitivity = "normal" | "personal" | "private" | "confidential";

// Graph's OpenAPI marks id/value optional (id via Entity). Create docs require
// both id and value for each property in the collection.
// https://learn.microsoft.com/en-us/graph/api/singlevaluelegacyextendedproperty-post-singlevalueextendedproperties?view=graph-rest-1.0
export interface SingleValueLegacyExtendedProperty extends Entity {
  id: string;
  value: string;
  [key: string]: unknown;
}

// Graph's OpenAPI marks every field optional. The docs only define start and
// end; both are expected on a time slot.
// https://learn.microsoft.com/en-us/graph/api/resources/timeslot
export interface TimeSlot {
  end: DateTimeTimeZone;
  start: DateTimeTimeZone;
  [key: string]: unknown;
}

// Graph's OpenAPI marks name optional. Docs only define name; it is expected
// when the type is present.
// https://learn.microsoft.com/en-us/graph/api/resources/timezonebase
export interface TimeZoneBase {
  name: string;
  [key: string]: unknown;
}

// Graph's OpenAPI marks every field optional. createUploadSession always
// returns uploadUrl, expirationDateTime, and nextExpectedRanges.
// https://learn.microsoft.com/en-us/graph/api/attachment-createuploadsession?view=graph-rest-1.0
export interface UploadSession {
  expirationDateTime: string;
  nextExpectedRanges: string[];
  uploadUrl: string;
  [key: string]: unknown;
}

export type WeekIndex = "first" | "second" | "third" | "fourth" | "last";

export interface WorkingHours {
  daysOfWeek?: DayOfWeek[];
  endTime?: string | null;
  startTime?: string | null;
  timeZone?: TimeZoneBase;
  [key: string]: unknown;
}
