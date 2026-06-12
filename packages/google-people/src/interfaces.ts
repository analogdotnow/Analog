export type QueryParamItem = string | number | boolean;
export type QueryParamValue =
  | QueryParamItem
  | QueryParamItem[]
  | null
  | undefined;
export type QueryParams = Record<string, QueryParamValue>;

export interface GooglePeopleRequestOptions {
  signal?: AbortSignal;
  alt?: "json" | "media" | "proto";
  callback?: string;
  fields?: string;
  key?: string;
  prettyPrint?: boolean;
  quotaUser?: string;
  uploadProtocol?: string;
  uploadType?: string;
}

export type ReadSourceType =
  | "READ_SOURCE_TYPE_UNSPECIFIED"
  | "READ_SOURCE_TYPE_PROFILE"
  | "READ_SOURCE_TYPE_CONTACT"
  | "READ_SOURCE_TYPE_DOMAIN_CONTACT";

export type DirectorySourceType =
  | "DIRECTORY_SOURCE_TYPE_UNSPECIFIED"
  | "DIRECTORY_SOURCE_TYPE_DOMAIN_CONTACT"
  | "DIRECTORY_SOURCE_TYPE_DOMAIN_PROFILE";

export type DirectoryMergeSourceType =
  | "DIRECTORY_MERGE_SOURCE_TYPE_UNSPECIFIED"
  | "DIRECTORY_MERGE_SOURCE_TYPE_CONTACT";

export type SortOrder =
  | "LAST_MODIFIED_ASCENDING"
  | "LAST_MODIFIED_DESCENDING"
  | "FIRST_NAME_ASCENDING"
  | "LAST_NAME_ASCENDING";

export interface Address {
  city?: string;
  country?: string;
  countryCode?: string;
  extendedAddress?: string;
  formattedType?: string;
  formattedValue?: string;
  metadata?: FieldMetadata;
  poBox?: string;
  postalCode?: string;
  region?: string;
  streetAddress?: string;
  type?: string;
}

export interface AgeRangeType {
  ageRange?:
    | "AGE_RANGE_UNSPECIFIED"
    | "LESS_THAN_EIGHTEEN"
    | "EIGHTEEN_TO_TWENTY"
    | "TWENTY_ONE_OR_OLDER";
  metadata?: FieldMetadata;
}

export interface BatchCreateContactsRequest {
  contacts?: Array<ContactToCreate>;
  readMask?: string;
  sources?: Array<
    | "READ_SOURCE_TYPE_UNSPECIFIED"
    | "READ_SOURCE_TYPE_PROFILE"
    | "READ_SOURCE_TYPE_CONTACT"
    | "READ_SOURCE_TYPE_DOMAIN_CONTACT"
  >;
}

export interface BatchCreateContactsResponse {
  createdPeople?: Array<PersonResponse>;
}

export interface BatchDeleteContactsRequest {
  resourceNames?: Array<string>;
}

export interface BatchGetContactGroupsResponse {
  responses?: Array<ContactGroupResponse>;
}

export interface BatchUpdateContactsRequest {
  contacts?: Record<string, Person>;
  readMask?: string;
  sources?: Array<
    | "READ_SOURCE_TYPE_UNSPECIFIED"
    | "READ_SOURCE_TYPE_PROFILE"
    | "READ_SOURCE_TYPE_CONTACT"
    | "READ_SOURCE_TYPE_DOMAIN_CONTACT"
  >;
  updateMask?: string;
}

export interface BatchUpdateContactsResponse {
  updateResult?: Record<string, PersonResponse>;
}

export interface Biography {
  contentType?: "CONTENT_TYPE_UNSPECIFIED" | "TEXT_PLAIN" | "TEXT_HTML";
  metadata?: FieldMetadata;
  value?: string;
}

export interface Birthday {
  date?: Date;
  metadata?: FieldMetadata;
  text?: string;
}

export interface BraggingRights {
  metadata?: FieldMetadata;
  value?: string;
}

export interface CalendarUrl {
  formattedType?: string;
  metadata?: FieldMetadata;
  type?: string;
  url?: string;
}

export interface ClientData {
  key?: string;
  metadata?: FieldMetadata;
  value?: string;
}

export interface ContactGroup {
  clientData?: Array<GroupClientData>;
  etag?: string;
  formattedName?: string;
  groupType?:
    | "GROUP_TYPE_UNSPECIFIED"
    | "USER_CONTACT_GROUP"
    | "SYSTEM_CONTACT_GROUP";
  memberCount?: number;
  memberResourceNames?: Array<string>;
  metadata?: ContactGroupMetadata;
  name?: string;
  resourceName?: string;
}

export interface ContactGroupMembership {
  contactGroupId?: string;
  contactGroupResourceName?: string;
}

export interface ContactGroupMetadata {
  deleted?: boolean;
  updateTime?: string;
}

export interface ContactGroupResponse {
  contactGroup?: ContactGroup;
  requestedResourceName?: string;
  status?: Status;
}

export interface ContactToCreate {
  contactPerson?: Person;
}

export interface CopyOtherContactToMyContactsGroupRequest {
  copyMask?: string;
  readMask?: string;
  sources?: Array<
    | "READ_SOURCE_TYPE_UNSPECIFIED"
    | "READ_SOURCE_TYPE_PROFILE"
    | "READ_SOURCE_TYPE_CONTACT"
    | "READ_SOURCE_TYPE_DOMAIN_CONTACT"
  >;
}

export interface CoverPhoto {
  metadata?: FieldMetadata;
  url?: string;
}

export interface CreateContactGroupRequest {
  contactGroup?: ContactGroupInput;
  readGroupFields?: string;
}

export interface Date {
  day?: number;
  month?: number;
  year?: number;
}

export interface DeleteContactPhotoResponse {
  person?: Person;
}

export interface DomainMembership {
  inViewerDomain?: boolean;
}

export interface EmailAddress {
  displayName?: string;
  formattedType?: string;
  metadata?: FieldMetadata;
  type?: string;
  value?: string;
}

export type Empty = Record<string, unknown>;

export interface Event {
  date?: Date;
  formattedType?: string;
  metadata?: FieldMetadata;
  type?: string;
}

export interface ExternalId {
  formattedType?: string;
  metadata?: FieldMetadata;
  type?: string;
  value?: string;
}

export interface FieldMetadata {
  primary?: boolean;
  source?: Source;
  sourcePrimary?: boolean;
  verified?: boolean;
}

export interface FileAs {
  metadata?: FieldMetadata;
  value?: string;
}

export interface Gender {
  addressMeAs?: string;
  formattedValue?: string;
  metadata?: FieldMetadata;
  value?: string;
}

export interface GetPeopleResponse {
  responses?: Array<PersonResponse>;
}

export interface GroupClientData {
  key?: string;
  value?: string;
}

export interface ImClient {
  formattedProtocol?: string;
  formattedType?: string;
  metadata?: FieldMetadata;
  protocol?: string;
  type?: string;
  username?: string;
}

export interface Interest {
  metadata?: FieldMetadata;
  value?: string;
}

export interface ListConnectionsResponse {
  connections?: Array<Person>;
  nextPageToken?: string;
  nextSyncToken?: string;
  totalItems?: number;
  totalPeople?: number;
}

export interface ListContactGroupsResponse {
  contactGroups?: Array<ContactGroup>;
  nextPageToken?: string;
  nextSyncToken?: string;
  totalItems?: number;
}

export interface ListDirectoryPeopleResponse {
  nextPageToken?: string;
  nextSyncToken?: string;
  people?: Array<Person>;
}

export interface ListOtherContactsResponse {
  nextPageToken?: string;
  nextSyncToken?: string;
  otherContacts?: Array<Person>;
  totalSize?: number;
}

export interface Locale {
  metadata?: FieldMetadata;
  value?: string;
}

export interface Location {
  buildingId?: string;
  current?: boolean;
  deskCode?: string;
  floor?: string;
  floorSection?: string;
  metadata?: FieldMetadata;
  type?: string;
  value?: string;
}

export interface Membership {
  contactGroupMembership?: ContactGroupMembership;
  domainMembership?: DomainMembership;
  metadata?: FieldMetadata;
}

export interface MiscKeyword {
  formattedType?: string;
  metadata?: FieldMetadata;
  type?:
    | "TYPE_UNSPECIFIED"
    | "OUTLOOK_BILLING_INFORMATION"
    | "OUTLOOK_DIRECTORY_SERVER"
    | "OUTLOOK_KEYWORD"
    | "OUTLOOK_MILEAGE"
    | "OUTLOOK_PRIORITY"
    | "OUTLOOK_SENSITIVITY"
    | "OUTLOOK_SUBJECT"
    | "OUTLOOK_USER"
    | "HOME"
    | "WORK"
    | "OTHER";
  value?: string;
}

export interface ModifyContactGroupMembersRequest {
  resourceNamesToAdd?: Array<string>;
  resourceNamesToRemove?: Array<string>;
}

export interface ModifyContactGroupMembersResponse {
  canNotRemoveLastContactGroupResourceNames?: Array<string>;
  notFoundResourceNames?: Array<string>;
}

export interface Name {
  displayName?: string;
  displayNameLastFirst?: string;
  familyName?: string;
  givenName?: string;
  honorificPrefix?: string;
  honorificSuffix?: string;
  metadata?: FieldMetadata;
  middleName?: string;
  phoneticFamilyName?: string;
  phoneticFullName?: string;
  phoneticGivenName?: string;
  phoneticHonorificPrefix?: string;
  phoneticHonorificSuffix?: string;
  phoneticMiddleName?: string;
  unstructuredName?: string;
}

export interface Nickname {
  metadata?: FieldMetadata;
  type?:
    | "DEFAULT"
    | "MAIDEN_NAME"
    | "INITIALS"
    | "GPLUS"
    | "OTHER_NAME"
    | "ALTERNATE_NAME"
    | "SHORT_NAME";
  value?: string;
}

export interface Occupation {
  metadata?: FieldMetadata;
  value?: string;
}

export interface Organization {
  costCenter?: string;
  current?: boolean;
  department?: string;
  domain?: string;
  endDate?: Date;
  formattedType?: string;
  fullTimeEquivalentMillipercent?: number;
  jobDescription?: string;
  location?: string;
  metadata?: FieldMetadata;
  name?: string;
  phoneticName?: string;
  startDate?: Date;
  symbol?: string;
  title?: string;
  type?: string;
}

export interface Person {
  addresses?: Array<Address>;
  ageRange?:
    | "AGE_RANGE_UNSPECIFIED"
    | "LESS_THAN_EIGHTEEN"
    | "EIGHTEEN_TO_TWENTY"
    | "TWENTY_ONE_OR_OLDER";
  ageRanges?: Array<AgeRangeType>;
  biographies?: Array<Biography>;
  birthdays?: Array<Birthday>;
  braggingRights?: Array<BraggingRights>;
  calendarUrls?: Array<CalendarUrl>;
  clientData?: Array<ClientData>;
  coverPhotos?: Array<CoverPhoto>;
  emailAddresses?: Array<EmailAddress>;
  etag?: string;
  events?: Array<Event>;
  externalIds?: Array<ExternalId>;
  fileAses?: Array<FileAs>;
  genders?: Array<Gender>;
  imClients?: Array<ImClient>;
  interests?: Array<Interest>;
  locales?: Array<Locale>;
  locations?: Array<Location>;
  memberships?: Array<Membership>;
  metadata?: PersonMetadata;
  miscKeywords?: Array<MiscKeyword>;
  names?: Array<Name>;
  nicknames?: Array<Nickname>;
  occupations?: Array<Occupation>;
  organizations?: Array<Organization>;
  phoneNumbers?: Array<PhoneNumber>;
  photos?: Array<Photo>;
  relations?: Array<Relation>;
  relationshipInterests?: Array<RelationshipInterest>;
  relationshipStatuses?: Array<RelationshipStatus>;
  residences?: Array<Residence>;
  resourceName?: string;
  sipAddresses?: Array<SipAddress>;
  skills?: Array<Skill>;
  taglines?: Array<Tagline>;
  urls?: Array<Url>;
  userDefined?: Array<UserDefined>;
}

export interface PersonMetadata {
  deleted?: boolean;
  linkedPeopleResourceNames?: Array<string>;
  objectType?: "OBJECT_TYPE_UNSPECIFIED" | "PERSON" | "PAGE";
  previousResourceNames?: Array<string>;
  sources?: Array<Source>;
}

export interface PersonResponse {
  httpStatusCode?: number;
  person?: Person;
  requestedResourceName?: string;
  status?: Status;
}

export interface PhoneNumber {
  canonicalForm?: string;
  formattedType?: string;
  metadata?: FieldMetadata;
  type?: string;
  value?: string;
}

export interface Photo {
  metadata?: FieldMetadata;
  url?: string;
}

export interface ProfileMetadata {
  objectType?: "OBJECT_TYPE_UNSPECIFIED" | "PERSON" | "PAGE";
  userTypes?: Array<
    "USER_TYPE_UNKNOWN" | "GOOGLE_USER" | "GPLUS_USER" | "GOOGLE_APPS_USER"
  >;
}

export interface Relation {
  formattedType?: string;
  metadata?: FieldMetadata;
  person?: string;
  type?: string;
}

export interface RelationshipInterest {
  formattedValue?: string;
  metadata?: FieldMetadata;
  value?: string;
}

export interface RelationshipStatus {
  formattedValue?: string;
  metadata?: FieldMetadata;
  value?: string;
}

export interface Residence {
  current?: boolean;
  metadata?: FieldMetadata;
  value?: string;
}

export interface SearchDirectoryPeopleResponse {
  nextPageToken?: string;
  people?: Array<Person>;
  totalSize?: number;
}

export interface SearchResponse {
  results?: Array<SearchResult>;
}

export interface SearchResult {
  person?: Person;
}

export interface SipAddress {
  formattedType?: string;
  metadata?: FieldMetadata;
  type?: string;
  value?: string;
}

export interface Skill {
  metadata?: FieldMetadata;
  value?: string;
}

export interface Source {
  etag?: string;
  id?: string;
  profileMetadata?: ProfileMetadata;
  type?:
    | "SOURCE_TYPE_UNSPECIFIED"
    | "ACCOUNT"
    | "PROFILE"
    | "DOMAIN_PROFILE"
    | "CONTACT"
    | "OTHER_CONTACT"
    | "DOMAIN_CONTACT";
  updateTime?: string;
}

export interface Status {
  code?: number;
  details?: Array<Record<string, unknown>>;
  message?: string;
}

export interface Tagline {
  metadata?: FieldMetadata;
  value?: string;
}

export interface UpdateContactGroupRequest {
  contactGroup?: ContactGroupInput;
  readGroupFields?: string;
  updateGroupFields?: string;
}

export interface UpdateContactPhotoRequest {
  personFields?: string;
  photoBytes?: string;
  sources?: Array<
    | "READ_SOURCE_TYPE_UNSPECIFIED"
    | "READ_SOURCE_TYPE_PROFILE"
    | "READ_SOURCE_TYPE_CONTACT"
    | "READ_SOURCE_TYPE_DOMAIN_CONTACT"
  >;
}

export interface UpdateContactPhotoResponse {
  person?: Person;
}

export interface Url {
  formattedType?: string;
  metadata?: FieldMetadata;
  type?: string;
  value?: string;
}

export interface UserDefined {
  key?: string;
  metadata?: FieldMetadata;
  value?: string;
}

export type ContactGroupInput = Omit<
  ContactGroup,
  | "formattedName"
  | "groupType"
  | "memberCount"
  | "memberResourceNames"
  | "metadata"
>;

export type PersonInput = Omit<
  Person,
  | "ageRange"
  | "ageRanges"
  | "coverPhotos"
  | "metadata"
  | "photos"
  | "relationshipInterests"
  | "relationshipStatuses"
  | "taglines"
>;
