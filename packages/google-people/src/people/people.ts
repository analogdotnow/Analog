import type { GooglePeople } from "../client";
import type {
  BatchCreateContactsResponse,
  BatchUpdateContactsResponse,
  DeleteContactPhotoResponse,
  Empty,
  GetPeopleResponse,
  ListDirectoryPeopleResponse,
  Person,
  SearchDirectoryPeopleResponse,
  SearchResponse,
  UpdateContactPhotoResponse,
} from "../interfaces";
import { Connections } from "./connections";
import type {
  BatchCreateContactsInput,
  BatchDeleteContactsInput,
  BatchGetPeopleInput,
  BatchUpdateContactsInput,
  CreateContactInput,
  DeleteContactInput,
  DeleteContactPhotoInput,
  GetPersonInput,
  ListDirectoryPeopleInput,
  SearchContactsInput,
  SearchDirectoryPeopleInput,
  UpdateContactInput,
  UpdateContactPhotoInput,
} from "./interfaces";

export class People {
  public readonly connections: Connections;

  constructor(private readonly client: GooglePeople) {
    this.connections = new Connections(client);
  }

  async batchCreateContacts(
    params: BatchCreateContactsInput,
  ): Promise<BatchCreateContactsResponse> {
    return this.client.post<BatchCreateContactsResponse>(
      "/v1/people:batchCreateContacts",
      {
        alt: params.alt,
        callback: params.callback,
        fields: params.fields,
        key: params.key,
        prettyPrint: params.prettyPrint,
        quotaUser: params.quotaUser,
        upload_protocol: params.uploadProtocol,
        uploadType: params.uploadType,
      },
      {
        contacts: params.contacts,
        readMask: params.readMask,
        sources: params.sources,
      },
      params.signal,
    );
  }

  async batchDeleteContacts(params: BatchDeleteContactsInput): Promise<Empty> {
    return this.client.post<Empty>(
      "/v1/people:batchDeleteContacts",
      {
        alt: params.alt,
        callback: params.callback,
        fields: params.fields,
        key: params.key,
        prettyPrint: params.prettyPrint,
        quotaUser: params.quotaUser,
        upload_protocol: params.uploadProtocol,
        uploadType: params.uploadType,
      },
      {
        resourceNames: params.resourceNames,
      },
      params.signal,
    );
  }

  async batchGet(params: BatchGetPeopleInput): Promise<GetPeopleResponse> {
    return this.client.get<GetPeopleResponse>(
      "/v1/people:batchGet",
      {
        alt: params.alt,
        callback: params.callback,
        fields: params.fields,
        key: params.key,
        prettyPrint: params.prettyPrint,
        quotaUser: params.quotaUser,
        upload_protocol: params.uploadProtocol,
        uploadType: params.uploadType,
        personFields: params.personFields,
        "requestMask.includeField": params.requestMaskIncludeField,
        resourceNames: params.resourceNames,
        sources: params.sources,
      },
      params.signal,
    );
  }

  async batchUpdateContacts(
    params: BatchUpdateContactsInput,
  ): Promise<BatchUpdateContactsResponse> {
    return this.client.post<BatchUpdateContactsResponse>(
      "/v1/people:batchUpdateContacts",
      {
        alt: params.alt,
        callback: params.callback,
        fields: params.fields,
        key: params.key,
        prettyPrint: params.prettyPrint,
        quotaUser: params.quotaUser,
        upload_protocol: params.uploadProtocol,
        uploadType: params.uploadType,
      },
      {
        contacts: params.contacts,
        readMask: params.readMask,
        sources: params.sources,
        updateMask: params.updateMask,
      },
      params.signal,
    );
  }

  async createContact(params: CreateContactInput): Promise<Person> {
    return this.client.post<Person>(
      "/v1/people:createContact",
      {
        alt: params.alt,
        callback: params.callback,
        fields: params.fields,
        key: params.key,
        prettyPrint: params.prettyPrint,
        quotaUser: params.quotaUser,
        upload_protocol: params.uploadProtocol,
        uploadType: params.uploadType,
        personFields: params.personFields,
        sources: params.sources,
      },
      params.person,
      params.signal,
    );
  }

  async listDirectoryPeople(
    params: ListDirectoryPeopleInput,
  ): Promise<ListDirectoryPeopleResponse> {
    return this.client.get<ListDirectoryPeopleResponse>(
      "/v1/people:listDirectoryPeople",
      {
        alt: params.alt,
        callback: params.callback,
        fields: params.fields,
        key: params.key,
        prettyPrint: params.prettyPrint,
        quotaUser: params.quotaUser,
        upload_protocol: params.uploadProtocol,
        uploadType: params.uploadType,
        mergeSources: params.mergeSources,
        pageSize: params.pageSize,
        pageToken: params.pageToken,
        readMask: params.readMask,
        requestSyncToken: params.requestSyncToken,
        sources: params.sources,
        syncToken: params.syncToken,
      },
      params.signal,
    );
  }

  async searchContacts(params: SearchContactsInput): Promise<SearchResponse> {
    return this.client.get<SearchResponse>(
      "/v1/people:searchContacts",
      {
        alt: params.alt,
        callback: params.callback,
        fields: params.fields,
        key: params.key,
        prettyPrint: params.prettyPrint,
        quotaUser: params.quotaUser,
        upload_protocol: params.uploadProtocol,
        uploadType: params.uploadType,
        pageSize: params.pageSize,
        query: params.query,
        readMask: params.readMask,
        sources: params.sources,
      },
      params.signal,
    );
  }

  async searchDirectoryPeople(
    params: SearchDirectoryPeopleInput,
  ): Promise<SearchDirectoryPeopleResponse> {
    return this.client.get<SearchDirectoryPeopleResponse>(
      "/v1/people:searchDirectoryPeople",
      {
        alt: params.alt,
        callback: params.callback,
        fields: params.fields,
        key: params.key,
        prettyPrint: params.prettyPrint,
        quotaUser: params.quotaUser,
        upload_protocol: params.uploadProtocol,
        uploadType: params.uploadType,
        mergeSources: params.mergeSources,
        pageSize: params.pageSize,
        pageToken: params.pageToken,
        query: params.query,
        readMask: params.readMask,
        sources: params.sources,
      },
      params.signal,
    );
  }

  async get(params: GetPersonInput): Promise<Person> {
    return this.client.get<Person>(
      `/v1/${params.resourceName}`,
      {
        alt: params.alt,
        callback: params.callback,
        fields: params.fields,
        key: params.key,
        prettyPrint: params.prettyPrint,
        quotaUser: params.quotaUser,
        upload_protocol: params.uploadProtocol,
        uploadType: params.uploadType,
        personFields: params.personFields,
        "requestMask.includeField": params.requestMaskIncludeField,
        sources: params.sources,
      },
      params.signal,
    );
  }

  async updateContact(params: UpdateContactInput): Promise<Person> {
    return this.client.patch<Person>(
      `/v1/${params.resourceName}:updateContact`,
      {
        alt: params.alt,
        callback: params.callback,
        fields: params.fields,
        key: params.key,
        prettyPrint: params.prettyPrint,
        quotaUser: params.quotaUser,
        upload_protocol: params.uploadProtocol,
        uploadType: params.uploadType,
        personFields: params.personFields,
        sources: params.sources,
        updatePersonFields: params.updatePersonFields,
      },
      params.person,
      params.signal,
    );
  }

  async deleteContact(params: DeleteContactInput): Promise<Empty> {
    return this.client.delete<Empty>(
      `/v1/${params.resourceName}:deleteContact`,
      {
        alt: params.alt,
        callback: params.callback,
        fields: params.fields,
        key: params.key,
        prettyPrint: params.prettyPrint,
        quotaUser: params.quotaUser,
        upload_protocol: params.uploadProtocol,
        uploadType: params.uploadType,
      },
      params.signal,
    );
  }

  async deleteContactPhoto(
    params: DeleteContactPhotoInput,
  ): Promise<DeleteContactPhotoResponse> {
    return this.client.delete<DeleteContactPhotoResponse>(
      `/v1/${params.resourceName}:deleteContactPhoto`,
      {
        alt: params.alt,
        callback: params.callback,
        fields: params.fields,
        key: params.key,
        prettyPrint: params.prettyPrint,
        quotaUser: params.quotaUser,
        upload_protocol: params.uploadProtocol,
        uploadType: params.uploadType,
        personFields: params.personFields,
        sources: params.sources,
      },
      params.signal,
    );
  }

  async updateContactPhoto(
    params: UpdateContactPhotoInput,
  ): Promise<UpdateContactPhotoResponse> {
    return this.client.patch<UpdateContactPhotoResponse>(
      `/v1/${params.resourceName}:updateContactPhoto`,
      {
        alt: params.alt,
        callback: params.callback,
        fields: params.fields,
        key: params.key,
        prettyPrint: params.prettyPrint,
        quotaUser: params.quotaUser,
        upload_protocol: params.uploadProtocol,
        uploadType: params.uploadType,
      },
      {
        personFields: params.personFields,
        photoBytes: params.photoBytes,
        sources: params.sources,
      },
      params.signal,
    );
  }
}
