import type {
  BatchCreateContactsRequest,
  BatchDeleteContactsRequest,
  BatchUpdateContactsRequest,
  ContactSourceToUpdate,
  ContactToUpdate,
  DirectoryMergeSourceType,
  DirectorySourceType,
  GooglePeopleRequestOptions,
  PersonInput,
  ReadSourceType,
  SourceInput,
} from "../interfaces";

export interface BatchCreateContactsInput
  extends GooglePeopleRequestOptions, BatchCreateContactsRequest {}

export interface BatchDeleteContactsInput
  extends GooglePeopleRequestOptions, BatchDeleteContactsRequest {}

export interface BatchGetPeopleInput extends GooglePeopleRequestOptions {
  personFields: string;
  requestMaskIncludeField?: string;
  resourceNames: string[];
  sources?: ReadSourceType[];
}

export interface BatchUpdateContactsInput<
  TContacts extends Record<string, SourceInput[]> = Record<
    string,
    [ContactSourceToUpdate]
  >,
>
  extends GooglePeopleRequestOptions, BatchUpdateContactsRequest<TContacts> {}

export interface CreateContactInput extends GooglePeopleRequestOptions {
  person: PersonInput;
  personFields: string;
  sources?: ReadSourceType[];
}

export interface ListDirectoryPeopleInput extends GooglePeopleRequestOptions {
  mergeSources?: DirectoryMergeSourceType[];
  pageSize?: number;
  pageToken?: string;
  readMask: string;
  requestSyncToken?: boolean;
  sources: DirectorySourceType[];
  syncToken?: string;
}

export interface SearchContactsInput extends GooglePeopleRequestOptions {
  pageSize?: number;
  query: string;
  readMask: string;
  sources?: ReadSourceType[];
}

export interface SearchDirectoryPeopleInput extends GooglePeopleRequestOptions {
  mergeSources?: DirectoryMergeSourceType[];
  pageSize?: number;
  pageToken?: string;
  query: string;
  readMask: string;
  sources: DirectorySourceType[];
}

export interface GetPersonInput extends GooglePeopleRequestOptions {
  resourceName: string;
  personFields: string;
  requestMaskIncludeField?: string;
  sources?: ReadSourceType[];
}

export interface UpdateContactInput<
  TSources extends SourceInput[] = [ContactSourceToUpdate],
> extends GooglePeopleRequestOptions {
  resourceName: string;
  person: ContactToUpdate<TSources>;
  personFields?: string;
  sources?: ReadSourceType[];
  updatePersonFields: string;
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
  photoBytes: string;
  sources?: ReadSourceType[];
}
