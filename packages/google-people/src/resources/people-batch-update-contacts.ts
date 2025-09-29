// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import * as PeopleBatchCreateContactsAPI from './people-batch-create-contacts';
import * as PeopleCreateContactAPI from './people-create-contact';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';

export class PeopleBatchUpdateContacts extends APIResource {
  /**
   * Update a batch of contacts and return a map of resource names to PersonResponses
   * for the updated contacts. Mutate requests for the same user should be sent
   * sequentially to avoid increased latency and failures.
   */
  updateBatch(
    params: PeopleBatchUpdateContactUpdateBatchParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<PeopleBatchUpdateContactUpdateBatchResponse> {
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
    return this._client.post('/v1/people:batchUpdateContacts', {
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
}

/**
 * If not successful, returns BatchUpdateContactsErrorDetails, a list of errors
 * corresponding to each contact. The response to a request to update a batch of
 * contacts.
 */
export interface PeopleBatchUpdateContactUpdateBatchResponse {
  /**
   * A map of resource names to the contacts that were updated, unless the request
   * `read_mask` is empty.
   */
  updateResult?: { [key: string]: PeopleBatchCreateContactsAPI.PersonResponse };
}

export interface PeopleBatchUpdateContactUpdateBatchParams {
  /**
   * Query param:
   */
  $?: PeopleBatchUpdateContactUpdateBatchParams._;

  /**
   * Query param: OAuth access token.
   */
  access_token?: string;

  /**
   * Query param: Data format for response.
   */
  alt?: 'json' | 'media' | 'proto';

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
   * Body param: Required. A map of resource names to the person data to be updated.
   * Allows up to 200 contacts in a single request.
   */
  contacts?: { [key: string]: PeopleCreateContactAPI.PersonMerged };

  /**
   * Body param: Required. A field mask to restrict which fields on each person are
   * returned. Multiple fields can be specified by separating them with commas. If
   * read mask is left empty, the post-mutate-get is skipped and no data will be
   * returned in the response. Valid values are: _ addresses _ ageRanges _
   * biographies _ birthdays _ calendarUrls _ clientData _ coverPhotos _
   * emailAddresses _ events _ externalIds _ genders _ imClients _ interests _
   * locales _ locations _ memberships _ metadata _ miscKeywords _ names _ nicknames
   * _ occupations _ organizations _ phoneNumbers _ photos _ relations _ sipAddresses
   * _ skills _ urls \* userDefined
   */
  readMask?: string;

  /**
   * Body param: Optional. A mask of what source types to return. Defaults to
   * READ_SOURCE_TYPE_CONTACT and READ_SOURCE_TYPE_PROFILE if not set.
   */
  sources?: Array<
    | 'READ_SOURCE_TYPE_UNSPECIFIED'
    | 'READ_SOURCE_TYPE_PROFILE'
    | 'READ_SOURCE_TYPE_CONTACT'
    | 'READ_SOURCE_TYPE_DOMAIN_CONTACT'
  >;

  /**
   * Body param: Required. A field mask to restrict which fields on the person are
   * updated. Multiple fields can be specified by separating them with commas. All
   * specified fields will be replaced, or cleared if left empty for each person.
   * Valid values are: _ addresses _ biographies _ birthdays _ calendarUrls _
   * clientData _ emailAddresses _ events _ externalIds _ genders _ imClients _
   * interests _ locales _ locations _ memberships _ miscKeywords _ names _ nicknames
   * _ occupations _ organizations _ phoneNumbers _ relations _ sipAddresses _ urls _
   * userDefined
   */
  updateMask?: string;
}

export namespace PeopleBatchUpdateContactUpdateBatchParams {
  export interface _ {
    /**
     * V1 error format.
     */
    xgafv?: '1' | '2';
  }
}

export declare namespace PeopleBatchUpdateContacts {
  export {
    type PeopleBatchUpdateContactUpdateBatchResponse as PeopleBatchUpdateContactUpdateBatchResponse,
    type PeopleBatchUpdateContactUpdateBatchParams as PeopleBatchUpdateContactUpdateBatchParams,
  };
}
