// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIPromise } from "../core/api-promise";
import { APIResource } from "../core/resource";
import { RequestOptions } from "../internal/request-options";
import * as PeopleCreateContactAPI from "./people-create-contact";

export class OtherContactsSearch extends APIResource {
  /**
   * Provides a list of contacts in the authenticated user's other contacts that
   * matches the search query. The query matches on a contact's `names`,
   * `emailAddresses`, and `phoneNumbers` fields that are from the OTHER_CONTACT
   * source. **IMPORTANT**: Before searching, clients should send a warmup request
   * with an empty query to update the cache. See
   * https://developers.google.com/people/v1/other-contacts#search_the_users_other_contacts
   */
  search(
    query: OtherContactsSearchSearchParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<SearchResponse> {
    return this._client.get("/v1/otherContacts:search", { query, ...options });
  }
}

/**
 * The response to a search request for the authenticated user, given a query.
 */
export interface SearchResponse {
  /**
   * The results of the request.
   */
  results?: Array<SearchResponse.Result>;
}

export namespace SearchResponse {
  /**
   * A result of a search query.
   */
  export interface Result {
    /**
     * The matched Person.
     */
    person?: PeopleCreateContactAPI.PersonMerged;
  }
}

export interface OtherContactsSearchSearchParams {
  $?: OtherContactsSearchSearchParams._;

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
   * OAuth 2.0 token for the current user.
   */
  oauth_token?: string;

  /**
   * Optional. The number of results to return. Defaults to 10 if field is not set,
   * or set to 0. Values greater than 30 will be capped to 30.
   */
  pageSize?: number;

  /**
   * Returns response with indentations and line breaks.
   */
  prettyPrint?: boolean;

  /**
   * Required. The plain-text query for the request. The query is used to match
   * prefix phrases of the fields on a person. For example, a person with name "foo
   * name" matches queries such as "f", "fo", "foo", "foo n", "nam", etc., but not
   * "oo n".
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
   * are: _ emailAddresses _ metadata _ names _ phoneNumbers
   */
  readMask?: string;

  /**
   * Upload protocol for media (e.g. "raw", "multipart").
   */
  upload_protocol?: string;

  /**
   * Legacy upload protocol for media (e.g. "media", "multipart").
   */
  uploadType?: string;
}

export namespace OtherContactsSearchSearchParams {
  export interface _ {
    /**
     * V1 error format.
     */
    xgafv?: "1" | "2";
  }
}

export declare namespace OtherContactsSearch {
  export {
    type SearchResponse as SearchResponse,
    type OtherContactsSearchSearchParams as OtherContactsSearchSearchParams,
  };
}
