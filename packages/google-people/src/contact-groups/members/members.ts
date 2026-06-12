import type { GooglePeople } from "../../client";
import type { ModifyContactGroupMembersResponse } from "../../interfaces";
import type { ModifyContactGroupMembersInput } from "./interfaces";

export class Members {
  constructor(private readonly client: GooglePeople) {}

  async modify(
    params: ModifyContactGroupMembersInput,
  ): Promise<ModifyContactGroupMembersResponse> {
    return this.client.post<ModifyContactGroupMembersResponse>(
      `/v1/${params.resourceName}/members:modify`,
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
        resourceNamesToAdd: params.resourceNamesToAdd,
        resourceNamesToRemove: params.resourceNamesToRemove,
      },
      params.signal,
    );
  }
}
