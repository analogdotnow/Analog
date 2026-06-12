import type {
  ContactGroupInput,
  GooglePeopleRequestOptions,
} from "../interfaces";

export interface ListContactGroupsInput extends GooglePeopleRequestOptions {
  groupFields?: string;
  pageSize?: number;
  pageToken?: string;
  syncToken?: string;
}

export interface CreateContactGroupsInput extends GooglePeopleRequestOptions {
  contactGroup?: ContactGroupInput;
  readGroupFields?: string;
}

export interface BatchGetContactGroupsInput extends GooglePeopleRequestOptions {
  groupFields?: string;
  maxMembers?: number;
  resourceNames: string[];
}

export interface DeleteContactGroupsInput extends GooglePeopleRequestOptions {
  resourceName: string;
  deleteContacts?: boolean;
}

export interface UpdateContactGroupsInput extends GooglePeopleRequestOptions {
  resourceName: string;
  contactGroup?: ContactGroupInput;
  readGroupFields?: string;
  updateGroupFields?: string;
}
