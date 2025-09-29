// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIPromise } from "../core/api-promise";
import { APIResource } from "../core/resource";
import { RequestOptions } from "../internal/request-options";
import * as PeopleCreateContactAPI from "./people-create-contact";

export class PeopleSearchDirectoryPeople extends APIResource {
  /**
   * Provides a list of domain profiles and domain contacts in the authenticated
   * user's domain directory that match the search query.
   */
  search(
    query: PeopleSearchDirectoryPersonSearchParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<PeopleSearchDirectoryPersonSearchResponse> {
    return this._client.get("/v1/people:searchDirectoryPeople", {
      query,
      ...options,
    });
  }
}

/**
 * The response to a request for people in the authenticated user's domain
 * directory that match the specified query.
 */
export interface PeopleSearchDirectoryPersonSearchResponse {
  /**
   * A token, which can be sent as `page_token` to retrieve the next page. If this
   * field is omitted, there are no subsequent pages.
   */
  nextPageToken?: string;

  /**
   * The list of people in the domain directory that match the query.
   */
  people?: Array<PeopleCreateContactAPI.PersonMerged>;

  /**
   * The total number of items in the list without pagination.
   */
  totalSize?: number;
}

export interface PeopleSearchDirectoryPersonSearchParams {
  $?: PeopleSearchDirectoryPersonSearchParams._;

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
   * between 1 and 500, inclusive. Defaults to 100 if not set or set to 0.
   */
  pageSize?: number;

  /**
   * Optional. A page token, received from a previous response `next_page_token`.
   * Provide this to retrieve the subsequent page. When paginating, all other
   * parameters provided to `SearchDirectoryPeople` must match the first call that
   * provided the page token.
   */
  pageToken?: string;

  /**
   * Returns response with indentations and line breaks.
   */
  prettyPrint?: boolean;

  /**
   * Required. Prefix query that matches fields in the person. Does NOT use the
   * read_mask for determining what fields to match.
   */
  query?: string;

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
   * Required. Directory sources to return.
   */
  sources?: Array<
    | "DIRECTORY_SOURCE_TYPE_UNSPECIFIED"
    | "DIRECTORY_SOURCE_TYPE_DOMAIN_CONTACT"
    | "DIRECTORY_SOURCE_TYPE_DOMAIN_PROFILE"
  >;

  /**
   * Upload protocol for media (e.g. "raw", "multipart").
   */
  upload_protocol?: string;

  /**
   * Legacy upload protocol for media (e.g. "media", "multipart").
   */
  uploadType?: string;
}

export namespace PeopleSearchDirectoryPersonSearchParams {
  export interface _ {
    /**
     * V1 error format.
     */
    xgafv?: "1" | "2";
  }
}

export declare namespace PeopleSearchDirectoryPeople {
  export {
    type PeopleSearchDirectoryPersonSearchResponse as PeopleSearchDirectoryPersonSearchResponse,
    type PeopleSearchDirectoryPersonSearchParams as PeopleSearchDirectoryPersonSearchParams,
  };
}
