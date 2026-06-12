import type { GooglePeople } from "../client";
import type {
  ListOtherContactsResponse,
  Person,
  SearchResponse,
} from "../interfaces";
import type {
  CopyOtherContactToMyContactsGroupInput,
  ListOtherContactsInput,
  SearchOtherContactsInput,
} from "./interfaces";

export class OtherContacts {
  constructor(private readonly client: GooglePeople) {}

  async list(
    params: ListOtherContactsInput,
  ): Promise<ListOtherContactsResponse> {
    return this.client.get<ListOtherContactsResponse>(
      "/v1/otherContacts",
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
        pageToken: params.pageToken,
        readMask: params.readMask,
        requestSyncToken: params.requestSyncToken,
        sources: params.sources,
        syncToken: params.syncToken,
      },
      params.signal,
    );
  }

  async search(params: SearchOtherContactsInput): Promise<SearchResponse> {
    return this.client.get<SearchResponse>(
      "/v1/otherContacts:search",
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
      },
      params.signal,
    );
  }

  async copyToMyContactsGroup(
    params: CopyOtherContactToMyContactsGroupInput,
  ): Promise<Person> {
    return this.client.post<Person>(
      `/v1/${params.resourceName}:copyOtherContactToMyContactsGroup`,
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
        copyMask: params.copyMask,
        readMask: params.readMask,
        sources: params.sources,
      },
      params.signal,
    );
  }
}
