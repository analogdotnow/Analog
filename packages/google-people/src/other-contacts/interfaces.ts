import type { GooglePeopleRequestOptions, ReadSourceType } from "../interfaces";

export interface ListOtherContactsInput extends GooglePeopleRequestOptions {
  pageSize?: number;
  pageToken?: string;
  readMask: string;
  requestSyncToken?: boolean;
  sources?:
    | ["READ_SOURCE_TYPE_CONTACT"]
    | ["READ_SOURCE_TYPE_CONTACT", "READ_SOURCE_TYPE_PROFILE"]
    | ["READ_SOURCE_TYPE_PROFILE", "READ_SOURCE_TYPE_CONTACT"];
  syncToken?: string;
}

export interface SearchOtherContactsInput extends GooglePeopleRequestOptions {
  pageSize?: number;
  query: string;
  readMask: string;
}

export interface CopyOtherContactToMyContactsGroupInput extends GooglePeopleRequestOptions {
  resourceName: string;
  copyMask: string;
  readMask?: string;
  sources?: ReadSourceType[];
}
