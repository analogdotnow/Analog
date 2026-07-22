export type QueryParamItem = string | number | boolean;
export type QueryParamValue =
  | QueryParamItem
  | QueryParamItem[]
  | null
  | undefined;
export type QueryParams = Record<string, QueryParamValue>;
export type RequestHeaders = Record<string, string>;

export interface MicrosoftPeopleRequestOptions {
  signal?: AbortSignal;
  headers?: RequestHeaders;
}

export interface ListMoreInput extends MicrosoftPeopleRequestOptions {
  nextLink: string;
}

export interface CollectionResponse<T> {
  value?: T[];
  "@odata.nextLink"?: string | null;
  [key: string]: unknown;
}

export type ODataCountResponse = number;

export interface Entity {
  id?: string;
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

export interface OutlookGeoCoordinates {
  accuracy?: number | null;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  [key: string]: unknown;
}

export interface Person extends Entity {
  birthday?: string | null;
  companyName?: string | null;
  department?: string | null;
  displayName?: string | null;
  givenName?: string | null;
  imAddress?: string | null;
  isFavorite?: boolean | null;
  jobTitle?: string | null;
  officeLocation?: string | null;
  personNotes?: string | null;
  personType?: PersonType;
  phones?: Phone[];
  postalAddresses?: Location[];
  profession?: string | null;
  scoredEmailAddresses?: ScoredEmailAddress[];
  surname?: string | null;
  userPrincipalName?: string | null;
  websites?: Website[];
  yomiCompany?: string | null;
  [key: string]: unknown;
}

export interface PersonCollectionResponse extends CollectionResponse<Person> {}

export interface PersonType {
  class?: string | null;
  subclass?: string | null;
  [key: string]: unknown;
}

export interface Phone {
  language?: string | null;
  number?: string | null;
  region?: string | null;
  type?: PhoneType;
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

export interface ScoredEmailAddress {
  address?: string | null;
  itemId?: string | null;
  relevanceScore?: number | null;
  selectionLikelihood?: SelectionLikelihoodInfo;
  [key: string]: unknown;
}

export type SelectionLikelihoodInfo = "notSpecified" | "high";

export interface Website {
  address?: string | null;
  displayName?: string | null;
  type?: WebsiteType;
  [key: string]: unknown;
}

export type WebsiteType = "other" | "home" | "work" | "blog" | "profile";
