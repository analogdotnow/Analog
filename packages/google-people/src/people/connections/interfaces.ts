import type {
  GooglePeopleRequestOptions,
  ReadSourceType,
  SortOrder,
} from "../../interfaces";

export interface ListConnectionsInput extends GooglePeopleRequestOptions {
  resourceName: string;
  pageSize?: number;
  pageToken?: string;
  personFields?: string;
  requestMaskIncludeField?: string;
  requestSyncToken?: boolean;
  sortOrder?: SortOrder;
  sources?: ReadSourceType[];
  syncToken?: string;
}
