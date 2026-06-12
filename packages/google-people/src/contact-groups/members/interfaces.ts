import type { GooglePeopleRequestOptions } from "../../interfaces";

export interface ModifyContactGroupMembersInput extends GooglePeopleRequestOptions {
  resourceName: string;
  resourceNamesToAdd?: string[];
  resourceNamesToRemove?: string[];
}
