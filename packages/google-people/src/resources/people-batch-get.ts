// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import * as PeopleBatchCreateContactsAPI from './people-batch-create-contacts';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';

export class PeopleBatchGet extends APIResource {
  /**
   * Provides information about a list of specific people by specifying a list of
   * requested resource names. Use `people/me` to indicate the authenticated user.
   * The request returns a 400 error if 'personFields' is not specified.
   */
  retrieve(
    query: PeopleBatchGetRetrieveParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<PeopleBatchGetRetrieveResponse> {
    return this._client.get('/v1/people:batchGet', { query, ...options });
  }
}

/**
 * The response to a get request for a list of people by resource name.
 */
export interface PeopleBatchGetRetrieveResponse {
  /**
   * The response for each requested resource name.
   */
  responses?: Array<PeopleBatchCreateContactsAPI.PersonResponse>;
}

export interface PeopleBatchGetRetrieveParams {
  $?: PeopleBatchGetRetrieveParams._;

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

  requestMask?: PeopleBatchGetRetrieveParams.RequestMask;

  /**
   * Required. The resource names of the people to provide information about. It's
   * repeatable. The URL query parameter should be
   * resourceNames=<name1>&resourceNames=<name2>&... - To get information about the
   * authenticated user, specify `people/me`. - To get information about a google
   * account, specify `people/{account_id}`. - To get information about a contact,
   * specify the resource name that identifies the contact as returned by
   * `people.connections.list`. There is a maximum of 200 resource names.
   */
  resourceNames?: Array<string>;

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
   * Upload protocol for media (e.g. "raw", "multipart").
   */
  upload_protocol?: string;

  /**
   * Legacy upload protocol for media (e.g. "media", "multipart").
   */
  uploadType?: string;
}

export namespace PeopleBatchGetRetrieveParams {
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

export declare namespace PeopleBatchGet {
  export {
    type PeopleBatchGetRetrieveResponse as PeopleBatchGetRetrieveResponse,
    type PeopleBatchGetRetrieveParams as PeopleBatchGetRetrieveParams,
  };
}
