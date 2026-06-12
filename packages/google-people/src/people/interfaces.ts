import type {
  BatchCreateContactsRequest,
  BatchDeleteContactsRequest,
  BatchUpdateContactsRequest,
  DirectoryMergeSourceType,
  DirectorySourceType,
  GooglePeopleRequestOptions,
  Person,
  PersonInput,
  ReadSourceType,
} from "../interfaces";

export interface BatchCreateContactsInput
  extends GooglePeopleRequestOptions, BatchCreateContactsRequest {}

export interface BatchDeleteContactsInput
  extends GooglePeopleRequestOptions, BatchDeleteContactsRequest {}

export interface BatchGetPeopleInput extends GooglePeopleRequestOptions {
  personFields?: string;
  requestMaskIncludeField?: string;
  resourceNames?: string[];
  sources?: ReadSourceType[];
}

export interface BatchUpdateContactsInput
  extends GooglePeopleRequestOptions, BatchUpdateContactsRequest {}

export interface CreateContactInput extends GooglePeopleRequestOptions {
  person?: PersonInput;
  personFields?: string;
  sources?: ReadSourceType[];
}

export interface ListDirectoryPeopleInput extends GooglePeopleRequestOptions {
  mergeSources?: DirectoryMergeSourceType[];
  pageSize?: number;
  pageToken?: string;
  readMask?: string;
  requestSyncToken?: boolean;
  sources?: DirectorySourceType[];
  syncToken?: string;
}

export interface SearchContactsInput extends GooglePeopleRequestOptions {
  pageSize?: number;
  query?: string;
  readMask?: string;
  sources?: ReadSourceType[];
}

export interface SearchDirectoryPeopleInput extends GooglePeopleRequestOptions {
  mergeSources?: DirectoryMergeSourceType[];
  pageSize?: number;
  pageToken?: string;
  query?: string;
  readMask?: string;
  sources?: DirectorySourceType[];
}

export interface GetPersonInput extends GooglePeopleRequestOptions {
  resourceName: string;
  personFields?: string;
  requestMaskIncludeField?: string;
  sources?: ReadSourceType[];
}

export interface UpdateContactInput extends GooglePeopleRequestOptions {
  resourceName: string;
  person?: Person;
  personFields?: string;
  sources?: ReadSourceType[];
  updatePersonFields?: string;
}

export interface DeleteContactInput extends GooglePeopleRequestOptions {
  resourceName: string;
}

export interface DeleteContactPhotoInput extends GooglePeopleRequestOptions {
  resourceName: string;
  personFields?: string;
  sources?: ReadSourceType[];
}

export interface UpdateContactPhotoInput extends GooglePeopleRequestOptions {
  resourceName: string;
  personFields?: string;
  photoBytes?: string;
  sources?: ReadSourceType[];
}
