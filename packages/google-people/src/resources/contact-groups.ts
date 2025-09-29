// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIPromise } from "../core/api-promise";
import { APIResource } from "../core/resource";
import { RequestOptions } from "../internal/request-options";

export class ContactGroups extends APIResource {
  /**
   * Create a new contact group owned by the authenticated user. Created contact
   * group names must be unique to the users contact groups. Attempting to create a
   * group with a duplicate name will return a HTTP 409 error. Mutate requests for
   * the same user should be sent sequentially to avoid increased latency and
   * failures.
   */
  create(
    params: ContactGroupCreateParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<ContactGroup> {
    const {
      $,
      access_token,
      alt,
      callback,
      fields,
      key,
      oauth_token,
      prettyPrint,
      quotaUser,
      upload_protocol,
      uploadType,
      ...body
    } = params ?? {};
    return this._client.post("/v1/contactGroups", {
      query: {
        $,
        access_token,
        alt,
        callback,
        fields,
        key,
        oauth_token,
        prettyPrint,
        quotaUser,
        upload_protocol,
        uploadType,
      },
      body,
      ...options,
    });
  }

  /**
   * List all contact groups owned by the authenticated user. Members of the contact
   * groups are not populated.
   */
  list(
    query: ContactGroupListParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<ContactGroupListResponse> {
    return this._client.get("/v1/contactGroups", { query, ...options });
  }
}

/**
 * A contact group.
 */
export interface ContactGroup {
  /**
   * The group's client data.
   */
  clientData?: Array<ContactGroup.ClientData>;

  /**
   * The [HTTP entity tag](https://en.wikipedia.org/wiki/HTTP_ETag) of the resource.
   * Used for web cache validation.
   */
  etag?: string;

  /**
   * Output only. The name translated and formatted in the viewer's account locale or
   * the `Accept-Language` HTTP header locale for system groups names. Group names
   * set by the owner are the same as name.
   */
  formattedName?: string;

  /**
   * Output only. The contact group type.
   */
  groupType?:
    | "GROUP_TYPE_UNSPECIFIED"
    | "USER_CONTACT_GROUP"
    | "SYSTEM_CONTACT_GROUP";

  /**
   * Output only. The total number of contacts in the group irrespective of max
   * members in specified in the request.
   */
  memberCount?: number;

  /**
   * Output only. The list of contact person resource names that are members of the
   * contact group. The field is only populated for GET requests and will only return
   * as many members as `maxMembers` in the get request.
   */
  memberResourceNames?: Array<string>;

  /**
   * Output only. Metadata about the contact group.
   */
  metadata?: ContactGroup.Metadata;

  /**
   * The contact group name set by the group owner or a system provided name for
   * system groups. For
   * [`contactGroups.create`](/people/api/rest/v1/contactGroups/create) or
   * [`contactGroups.update`](/people/api/rest/v1/contactGroups/update) the name must
   * be unique to the users contact groups. Attempting to create a group with a
   * duplicate name will return a HTTP 409 error.
   */
  name?: string;

  /**
   * The resource name for the contact group, assigned by the server. An ASCII
   * string, in the form of `contactGroups/{contact_group_id}`.
   */
  resourceName?: string;
}

export namespace ContactGroup {
  /**
   * Arbitrary client data that is populated by clients. Duplicate keys and values
   * are allowed.
   */
  export interface ClientData {
    /**
     * The client specified key of the client data.
     */
    key?: string;

    /**
     * The client specified value of the client data.
     */
    value?: string;
  }

  /**
   * Output only. Metadata about the contact group.
   */
  export interface Metadata {
    /**
     * Output only. True if the contact group resource has been deleted. Populated only
     * for [`ListContactGroups`](/people/api/rest/v1/contactgroups/list) requests that
     * include a sync token.
     */
    deleted?: boolean;

    /**
     * Output only. The time the group was last updated.
     */
    updateTime?: string;
  }
}

/**
 * The response to a list contact groups request.
 */
export interface ContactGroupListResponse {
  /**
   * The list of contact groups. Members of the contact groups are not populated.
   */
  contactGroups?: Array<ContactGroup>;

  /**
   * The token that can be used to retrieve the next page of results.
   */
  nextPageToken?: string;

  /**
   * The token that can be used to retrieve changes since the last request.
   */
  nextSyncToken?: string;

  /**
   * The total number of items in the list without pagination.
   */
  totalItems?: number;
}

export interface ContactGroupCreateParams {
  /**
   * Query param:
   */
  $?: ContactGroupCreateParams._;

  /**
   * Query param: OAuth access token.
   */
  access_token?: string;

  /**
   * Query param: Data format for response.
   */
  alt?: "json" | "media" | "proto";

  /**
   * Query param: JSONP
   */
  callback?: string;

  /**
   * Query param: Selector specifying which fields to include in a partial response.
   */
  fields?: string;

  /**
   * Query param: API key. Your API key identifies your project and provides you with
   * API access, quota, and reports. Required unless you provide an OAuth 2.0 token.
   */
  key?: string;

  /**
   * Query param: OAuth 2.0 token for the current user.
   */
  oauth_token?: string;

  /**
   * Query param: Returns response with indentations and line breaks.
   */
  prettyPrint?: boolean;

  /**
   * Query param: Available to use for quota purposes for server-side applications.
   * Can be any arbitrary string assigned to a user, but should not exceed 40
   * characters.
   */
  quotaUser?: string;

  /**
   * Query param: Upload protocol for media (e.g. "raw", "multipart").
   */
  upload_protocol?: string;

  /**
   * Query param: Legacy upload protocol for media (e.g. "media", "multipart").
   */
  uploadType?: string;

  /**
   * Body param: Required. The contact group to create.
   */
  contactGroup?: ContactGroup;

  /**
   * Body param: Optional. A field mask to restrict which fields on the group are
   * returned. Defaults to `metadata`, `groupType`, and `name` if not set or set to
   * empty. Valid fields are: _ clientData _ groupType _ metadata _ name
   */
  readGroupFields?: string;
}

export namespace ContactGroupCreateParams {
  export interface _ {
    /**
     * V1 error format.
     */
    xgafv?: "1" | "2";
  }
}

export interface ContactGroupListParams {
  $?: ContactGroupListParams._;

  /**
   * OAuth access token.
   */
  access_token?: string;

  /**
   * Data format for response.
   */
  alt?: "json" | "media" | "proto";

  /**
   * JSONP
   */
  callback?: string;

  /**
   * Selector specifying which fields to include in a partial response.
   */
  fields?: string;

  /**
   * Optional. A field mask to restrict which fields on the group are returned.
   * Defaults to `metadata`, `groupType`, `memberCount`, and `name` if not set or set
   * to empty. Valid fields are: _ clientData _ groupType _ memberCount _ metadata \*
   * name
   */
  groupFields?: string;

  /**
   * API key. Your API key identifies your project and provides you with API access,
   * quota, and reports. Required unless you provide an OAuth 2.0 token.
   */
  key?: string;

  /**
   * OAuth 2.0 token for the current user.
   */
  oauth_token?: string;

  /**
   * Optional. The maximum number of resources to return. Valid values are between 1
   * and 1000, inclusive. Defaults to 30 if not set or set to 0.
   */
  pageSize?: number;

  /**
   * Optional. The next_page_token value returned from a previous call to
   * [ListContactGroups](/people/api/rest/v1/contactgroups/list). Requests the next
   * page of resources.
   */
  pageToken?: string;

  /**
   * Returns response with indentations and line breaks.
   */
  prettyPrint?: boolean;

  /**
   * Available to use for quota purposes for server-side applications. Can be any
   * arbitrary string assigned to a user, but should not exceed 40 characters.
   */
  quotaUser?: string;

  /**
   * Optional. A sync token, returned by a previous call to `contactgroups.list`.
   * Only resources changed since the sync token was created will be returned.
   */
  syncToken?: string;

  /**
   * Upload protocol for media (e.g. "raw", "multipart").
   */
  upload_protocol?: string;

  /**
   * Legacy upload protocol for media (e.g. "media", "multipart").
   */
  uploadType?: string;
}

export namespace ContactGroupListParams {
  export interface _ {
    /**
     * V1 error format.
     */
    xgafv?: "1" | "2";
  }
}

export declare namespace ContactGroups {
  export {
    type ContactGroup as ContactGroup,
    type ContactGroupListResponse as ContactGroupListResponse,
    type ContactGroupCreateParams as ContactGroupCreateParams,
    type ContactGroupListParams as ContactGroupListParams,
  };
}
