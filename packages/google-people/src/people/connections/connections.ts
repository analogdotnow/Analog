import type { GooglePeople } from "../../client";
import type { ListConnectionsResponse } from "../../interfaces";
import type { ListConnectionsInput } from "./interfaces";

export class Connections {
  constructor(private readonly client: GooglePeople) {}

  async list(params: ListConnectionsInput): Promise<ListConnectionsResponse> {
    return this.client.get<ListConnectionsResponse>(
      `/v1/${params.resourceName}/connections`,
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
        personFields: params.personFields,
        "requestMask.includeField": params.requestMaskIncludeField,
        requestSyncToken: params.requestSyncToken,
        sortOrder: params.sortOrder,
        sources: params.sources,
        syncToken: params.syncToken,
      },
      params.signal,
    );
  }
}
