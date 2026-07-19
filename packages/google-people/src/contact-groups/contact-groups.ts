import type { GooglePeople } from "../client";
import type {
  BatchGetContactGroupsResponse,
  ContactGroup,
  ListContactGroupsResponse,
} from "../interfaces";
import type {
  BatchGetContactGroupsInput,
  CreateContactGroupsInput,
  DeleteContactGroupsInput,
  GetContactGroupsInput,
  ListContactGroupsInput,
  UpdateContactGroupsInput,
} from "./interfaces";
import { Members } from "./members";

export class ContactGroups {
  public readonly members: Members;

  constructor(private readonly client: GooglePeople) {
    this.members = new Members(client);
  }

  async list(
    params: ListContactGroupsInput,
  ): Promise<ListContactGroupsResponse> {
    return this.client.get<ListContactGroupsResponse>(
      "/v1/contactGroups",
      {
        alt: params.alt,
        callback: params.callback,
        fields: params.fields,
        key: params.key,
        prettyPrint: params.prettyPrint,
        quotaUser: params.quotaUser,
        upload_protocol: params.uploadProtocol,
        uploadType: params.uploadType,
        groupFields: params.groupFields,
        pageSize: params.pageSize,
        pageToken: params.pageToken,
        syncToken: params.syncToken,
      },
      params.signal,
    );
  }

  async create(params: CreateContactGroupsInput): Promise<ContactGroup> {
    return this.client.post<ContactGroup>(
      "/v1/contactGroups",
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
        contactGroup: params.contactGroup,
        readGroupFields: params.readGroupFields,
      },
      params.signal,
    );
  }

  async batchGet(
    params: BatchGetContactGroupsInput,
  ): Promise<BatchGetContactGroupsResponse> {
    return this.client.get<BatchGetContactGroupsResponse>(
      "/v1/contactGroups:batchGet",
      {
        alt: params.alt,
        callback: params.callback,
        fields: params.fields,
        key: params.key,
        prettyPrint: params.prettyPrint,
        quotaUser: params.quotaUser,
        upload_protocol: params.uploadProtocol,
        uploadType: params.uploadType,
        groupFields: params.groupFields,
        maxMembers: params.maxMembers,
        resourceNames: params.resourceNames,
      },
      params.signal,
    );
  }

  async get(params: GetContactGroupsInput): Promise<ContactGroup> {
    return this.client.get<ContactGroup>(
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
        groupFields: params.groupFields,
        maxMembers: params.maxMembers,
      },
      params.signal,
    );
  }

  async delete(params: DeleteContactGroupsInput): Promise<void> {
    return this.client.delete<void>(
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
        deleteContacts: params.deleteContacts,
      },
      params.signal,
      true,
    );
  }

  async update(params: UpdateContactGroupsInput): Promise<ContactGroup> {
    return this.client.put<ContactGroup>(
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
      },
      {
        contactGroup: params.contactGroup,
        readGroupFields: params.readGroupFields,
        updateGroupFields: params.updateGroupFields,
      },
      params.signal,
    );
  }
}
