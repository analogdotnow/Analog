// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import * as OtherContactsSearchAPI from './other-contacts-search';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';

export class PeopleSearchContacts extends APIResource {
  /**
   * Provides a list of contacts in the authenticated user's grouped contacts that
   * matches the search query. The query matches on a contact's `names`, `nickNames`,
   * `emailAddresses`, `phoneNumbers`, and `organizations` fields that are from the
   * CONTACT source. **IMPORTANT**: Before searching, clients should send a warmup
   * request with an empty query to update the cache. See
   * https://developers.google.com/people/v1/contacts#search_the_users_contacts
   */
  search(
    query: PeopleSearchContactSearchParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<OtherContactsSearchAPI.SearchResponse> {
    return this._client.get('/v1/people:searchContacts', { query, ...options });
  }
}

export interface PeopleSearchContactSearchParams {
  $?: PeopleSearchContactSearchParams._;

  /**
   * OAuth access token.
   */
  access_token?: string;

  /**
   * Data format for response.
   */
  alt?: 'json' | 'media' | 'proto';

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
   * are: _ addresses _ ageRanges _ biographies _ birthdays _ calendarUrls _
   * clientData _ coverPhotos _ emailAddresses _ events _ externalIds _ genders _
   * imClients _ interests _ locales _ locations _ memberships _ metadata _
   * miscKeywords _ names _ nicknames _ occupations _ organizations _ phoneNumbers _
   * photos _ relations _ sipAddresses _ skills _ urls \* userDefined
   */
  readMask?: string;

  /**
   * Optional. A mask of what source types to return. Defaults to
   * READ_SOURCE_TYPE_CONTACT if not set.
   */
  sources?: Array<
    | 'READ_SOURCE_TYPE_UNSPECIFIED'
    | 'READ_SOURCE_TYPE_PROFILE'
    | 'READ_SOURCE_TYPE_CONTACT'
    | 'READ_SOURCE_TYPE_DOMAIN_CONTACT'
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

export namespace PeopleSearchContactSearchParams {
  export interface _ {
    /**
     * V1 error format.
     */
    xgafv?: '1' | '2';
  }
}

export declare namespace PeopleSearchContacts {
  export { type PeopleSearchContactSearchParams as PeopleSearchContactSearchParams };
}
