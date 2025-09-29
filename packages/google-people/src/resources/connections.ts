// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import * as PeopleCreateContactAPI from './people-create-contact';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';

export class Connections extends APIResource {
  /**
   * Provides a list of the authenticated user's contacts. Sync tokens expire 7 days
   * after the full sync. A request with an expired sync token will get an error with
   * an
   * [google.rpc.ErrorInfo](https://cloud.google.com/apis/design/errors#error_info)
   * with reason "EXPIRED_SYNC_TOKEN". In the case of such an error clients should
   * make a full sync request without a `sync_token`. The first page of a full sync
   * request has an additional quota. If the quota is exceeded, a 429 error will be
   * returned. This quota is fixed and can not be increased. When the `sync_token` is
   * specified, resources deleted since the last sync will be returned as a person
   * with `PersonMetadata.deleted` set to true. When the `page_token` or `sync_token`
   * is specified, all other request parameters must match the first call. Writes may
   * have a propagation delay of several minutes for sync requests. Incremental syncs
   * are not intended for read-after-write use cases. See example usage at
   * [List the user's contacts that have changed](/people/v1/contacts#list_the_users_contacts_that_have_changed).
   */
  list(
    resourceName: string,
    query: ConnectionListParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<ConnectionListResponse> {
    return this._client.get(path`/v1/${resourceName}/connections`, { query, ...options });
  }
}

/**
 * The response to a request for the authenticated user's connections.
 */
export interface ConnectionListResponse {
  /**
   * The list of people that the requestor is connected to.
   */
  connections?: Array<PeopleCreateContactAPI.PersonMerged>;

  /**
   * A token, which can be sent as `page_token` to retrieve the next page. If this
   * field is omitted, there are no subsequent pages.
   */
  nextPageToken?: string;

  /**
   * A token, which can be sent as `sync_token` to retrieve changes since the last
   * request. Request must set `request_sync_token` to return the sync token. When
   * the response is paginated, only the last page will contain `nextSyncToken`.
   */
  nextSyncToken?: string;

  /**
   * The total number of items in the list without pagination.
   */
  totalItems?: number;

  /**
   * @deprecated **DEPRECATED** (Please use totalItems) The total number of people in
   * the list without pagination.
   */
  totalPeople?: number;
}

export interface ConnectionListParams {
  $?: ConnectionListParams._;

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
   * Optional. The number of connections to include in the response. Valid values are
   * between 1 and 1000, inclusive. Defaults to 100 if not set or set to 0.
   */
  pageSize?: number;

  /**
   * Optional. A page token, received from a previous response `next_page_token`.
   * Provide this to retrieve the subsequent page. When paginating, all other
   * parameters provided to `people.connections.list` must match the first call that
   * provided the page token.
   */
  pageToken?: string;

  /**
   * Required. A field mask to restrict which fields on each person are returned.
   * Multiple fields can be specified by separating them with commas. Valid values
   * are: _ addresses _ ageRanges _ biographies _ birthdays _ calendarUrls _
   * clientData _ coverPhotos _ emailAddresses _ events _ externalIds _ genders _
   * imClients _ interests _ locales _ locations _ memberships _ metadata _
   * miscKeywords _ names _ nicknames _ occupations _ organizations _ phoneNumbers _
   * photos _ relations _ sipAddresses _ skills _ urls \* userDefined
   */
  personFields?: string;

  /**
   * Returns response with indentations and line breaks.
   */
  prettyPrint?: boolean;

  /**
   * Available to use for quota purposes for server-side applications. Can be any
   * arbitrary string assigned to a user, but should not exceed 40 characters.
   */
  quotaUser?: string;

  requestMask?: ConnectionListParams.RequestMask;

  /**
   * Optional. Whether the response should return `next_sync_token` on the last page
   * of results. It can be used to get incremental changes since the last request by
   * setting it on the request `sync_token`. More details about sync behavior at
   * `people.connections.list`.
   */
  requestSyncToken?: boolean;

  /**
   * Optional. The order in which the connections should be sorted. Defaults to
   * `LAST_MODIFIED_ASCENDING`.
   */
  sortOrder?:
    | 'LAST_MODIFIED_ASCENDING'
    | 'LAST_MODIFIED_DESCENDING'
    | 'FIRST_NAME_ASCENDING'
    | 'LAST_NAME_ASCENDING';

  /**
   * Optional. A mask of what source types to return. Defaults to
   * READ_SOURCE_TYPE_CONTACT and READ_SOURCE_TYPE_PROFILE if not set.
   */
  sources?: Array<
    | 'READ_SOURCE_TYPE_UNSPECIFIED'
    | 'READ_SOURCE_TYPE_PROFILE'
    | 'READ_SOURCE_TYPE_CONTACT'
    | 'READ_SOURCE_TYPE_DOMAIN_CONTACT'
  >;

  /**
   * Optional. A sync token, received from a previous response `next_sync_token`
   * Provide this to retrieve only the resources changed since the last request. When
   * syncing, all other parameters provided to `people.connections.list` must match
   * the first call that provided the sync token. More details about sync behavior at
   * `people.connections.list`.
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

export namespace ConnectionListParams {
  export interface _ {
    /**
     * V1 error format.
     */
    xgafv?: '1' | '2';
  }

  export interface RequestMask {
    /**
     * Required. Comma-separated list of person fields to be included in the response.
     * Each path should start with `person.`: for example, `person.names` or
     * `person.photos`.
     */
    includeField?: string;
  }
}

export declare namespace Connections {
  export {
    type ConnectionListResponse as ConnectionListResponse,
    type ConnectionListParams as ConnectionListParams,
  };
}
