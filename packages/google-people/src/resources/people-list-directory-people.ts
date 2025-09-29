// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIPromise } from "../core/api-promise";
import { APIResource } from "../core/resource";
import { RequestOptions } from "../internal/request-options";
import * as PeopleCreateContactAPI from "./people-create-contact";

export class PeopleListDirectoryPeople extends APIResource {
  /**
   * Provides a list of domain profiles and domain contacts in the authenticated
   * user's domain directory. When the `sync_token` is specified, resources deleted
   * since the last sync will be returned as a person with `PersonMetadata.deleted`
   * set to true. When the `page_token` or `sync_token` is specified, all other
   * request parameters must match the first call. Writes may have a propagation
   * delay of several minutes for sync requests. Incremental syncs are not intended
   * for read-after-write use cases. See example usage at
   * [List the directory people that have changed](/people/v1/directory#list_the_directory_people_that_have_changed).
   */
  list(
    query: PeopleListDirectoryPersonListParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<PeopleListDirectoryPersonListResponse> {
    return this._client.get("/v1/people:listDirectoryPeople", {
      query,
      ...options,
    });
  }
}

/**
 * The response to a request for the authenticated user's domain directory.
 */
export interface PeopleListDirectoryPersonListResponse {
  /**
   * A token, which can be sent as `page_token` to retrieve the next page. If this
   * field is omitted, there are no subsequent pages.
   */
  nextPageToken?: string;

  /**
   * A token, which can be sent as `sync_token` to retrieve changes since the last
   * request. Request must set `request_sync_token` to return the sync token.
   */
  nextSyncToken?: string;

  /**
   * The list of people in the domain directory.
   */
  people?: Array<PeopleCreateContactAPI.PersonMerged>;
}

export interface PeopleListDirectoryPersonListParams {
  $?: PeopleListDirectoryPersonListParams._;

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
   * API key. Your API key identifies your project and provides you with API access,
   * quota, and reports. Required unless you provide an OAuth 2.0 token.
   */
  key?: string;

  /**
   * Optional. Additional data to merge into the directory sources if they are
   * connected through verified join keys such as email addresses or phone numbers.
   */
  mergeSources?: Array<
    | "DIRECTORY_MERGE_SOURCE_TYPE_UNSPECIFIED"
    | "DIRECTORY_MERGE_SOURCE_TYPE_CONTACT"
  >;

  /**
   * OAuth 2.0 token for the current user.
   */
  oauth_token?: string;

  /**
   * Optional. The number of people to include in the response. Valid values are
   * between 1 and 1000, inclusive. Defaults to 100 if not set or set to 0.
   */
  pageSize?: number;

  /**
   * Optional. A page token, received from a previous response `next_page_token`.
   * Provide this to retrieve the subsequent page. When paginating, all other
   * parameters provided to `people.listDirectoryPeople` must match the first call
   * that provided the page token.
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
   * Required. A field mask to restrict which fields on each person are returned.
   * Multiple fields can be specified by separating them with commas. Valid values
   * are: _ addresses _ ageRanges _ biographies _ birthdays _ calendarUrls _
   * clientData _ coverPhotos _ emailAddresses _ events _ externalIds _ genders _
   * imClients _ interests _ locales _ locations _ memberships _ metadata _
   * miscKeywords _ names _ nicknames _ occupations _ organizations _ phoneNumbers _
   * photos _ relations _ sipAddresses _ skills _ urls \* userDefined
   */
  readMask?: string;

  /**
   * Optional. Whether the response should return `next_sync_token`. It can be used
   * to get incremental changes since the last request by setting it on the request
   * `sync_token`. More details about sync behavior at `people.listDirectoryPeople`.
   */
  requestSyncToken?: boolean;

  /**
   * Required. Directory sources to return.
   */
  sources?: Array<
    | "DIRECTORY_SOURCE_TYPE_UNSPECIFIED"
    | "DIRECTORY_SOURCE_TYPE_DOMAIN_CONTACT"
    | "DIRECTORY_SOURCE_TYPE_DOMAIN_PROFILE"
  >;

  /**
   * Optional. A sync token, received from a previous response `next_sync_token`
   * Provide this to retrieve only the resources changed since the last request. When
   * syncing, all other parameters provided to `people.listDirectoryPeople` must
   * match the first call that provided the sync token. More details about sync
   * behavior at `people.listDirectoryPeople`.
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

export namespace PeopleListDirectoryPersonListParams {
  export interface _ {
    /**
     * V1 error format.
     */
    xgafv?: "1" | "2";
  }
}

export declare namespace PeopleListDirectoryPeople {
  export {
    type PeopleListDirectoryPersonListResponse as PeopleListDirectoryPersonListResponse,
    type PeopleListDirectoryPersonListParams as PeopleListDirectoryPersonListParams,
  };
}
