// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIPromise } from "../core/api-promise";
import { APIResource } from "../core/resource";
import { RequestOptions } from "../internal/request-options";
import * as ContactGroupsAPI from "./contact-groups";
import * as ContactGroupsBatchGetAPI from "./contact-groups-batch-get";

export class ContactGroupsBatchGet extends APIResource {
  /**
   * Get a list of contact groups owned by the authenticated user by specifying a
   * list of contact group resource names.
   */
  list(
    query: ContactGroupsBatchGetListParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<ContactGroupsBatchGetListResponse> {
    return this._client.get("/v1/contactGroups:batchGet", {
      query,
      ...options,
    });
  }
}

/**
 * The `Status` type defines a logical error model that is suitable for different
 * programming environments, including REST APIs and RPC APIs. It is used by
 * [gRPC](https://github.com/grpc). Each `Status` message contains three pieces of
 * data: error code, error message, and error details. You can find out more about
 * this error model and how to work with it in the
 * [API Design Guide](https://cloud.google.com/apis/design/errors).
 */
export interface Status {
  /**
   * The status code, which should be an enum value of google.rpc.Code.
   */
  code?: number;

  /**
   * A list of messages that carry the error details. There is a common set of
   * message types for APIs to use.
   */
  details?: Array<{ [key: string]: unknown }>;

  /**
   * A developer-facing error message, which should be in English. Any user-facing
   * error message should be localized and sent in the google.rpc.Status.details
   * field, or localized by the client.
   */
  message?: string;
}

/**
 * The response to a batch get contact groups request.
 */
export interface ContactGroupsBatchGetListResponse {
  /**
   * The list of responses for each requested contact group resource.
   */
  responses?: Array<ContactGroupsBatchGetListResponse.Response>;
}

export namespace ContactGroupsBatchGetListResponse {
  /**
   * The response for a specific contact group.
   */
  export interface Response {
    /**
     * The contact group.
     */
    contactGroup?: ContactGroupsAPI.ContactGroup;

    /**
     * The original requested resource name.
     */
    requestedResourceName?: string;

    /**
     * The status of the response.
     */
    status?: ContactGroupsBatchGetAPI.Status;
  }
}

export interface ContactGroupsBatchGetListParams {
  $?: ContactGroupsBatchGetListParams._;

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
   * Optional. Specifies the maximum number of members to return for each group.
   * Defaults to 0 if not set, which will return zero members.
   */
  maxMembers?: number;

  /**
   * OAuth 2.0 token for the current user.
   */
  oauth_token?: string;

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
   * Required. The resource names of the contact groups to get. There is a maximum of
   * 200 resource names.
   */
  resourceNames?: Array<string>;

  /**
   * Upload protocol for media (e.g. "raw", "multipart").
   */
  upload_protocol?: string;

  /**
   * Legacy upload protocol for media (e.g. "media", "multipart").
   */
  uploadType?: string;
}

export namespace ContactGroupsBatchGetListParams {
  export interface _ {
    /**
     * V1 error format.
     */
    xgafv?: "1" | "2";
  }
}

export declare namespace ContactGroupsBatchGet {
  export {
    type Status as Status,
    type ContactGroupsBatchGetListResponse as ContactGroupsBatchGetListResponse,
    type ContactGroupsBatchGetListParams as ContactGroupsBatchGetListParams,
  };
}
