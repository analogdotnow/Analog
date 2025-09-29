// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIPromise } from "../core/api-promise";
import { APIResource } from "../core/resource";
import { RequestOptions } from "../internal/request-options";
import * as ContactGroupsBatchGetAPI from "./contact-groups-batch-get";
import * as PeopleCreateContactAPI from "./people-create-contact";

export class PeopleBatchCreateContacts extends APIResource {
  /**
   * Create a batch of new contacts and return the PersonResponses for the newly
   * Mutate requests for the same user should be sent sequentially to avoid increased
   * latency and failures.
   */
  create(
    params: PeopleBatchCreateContactCreateParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<PeopleBatchCreateContactCreateResponse> {
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
    return this._client.post("/v1/people:batchCreateContacts", {
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
 * The response for a single person
 */
export interface PersonResponse {
  /**
   * @deprecated **DEPRECATED** (Please use status instead) [HTTP 1.1 status code]
   * (http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html).
   */
  httpStatusCode?: number;

  /**
   * The person.
   */
  person?: PeopleCreateContactAPI.PersonMerged;

  /**
   * The original requested resource name. May be different than the resource name on
   * the returned person. The resource name can change when adding or removing fields
   * that link a contact and profile such as a verified email, verified phone number,
   * or a profile URL.
   */
  requestedResourceName?: string;

  /**
   * The status of the response.
   */
  status?: ContactGroupsBatchGetAPI.Status;
}

/**
 * If not successful, returns BatchCreateContactsErrorDetails which contains a list
 * of errors for each invalid contact. The response to a request to create a batch
 * of contacts.
 */
export interface PeopleBatchCreateContactCreateResponse {
  /**
   * The contacts that were created, unless the request `read_mask` is empty.
   */
  createdPeople?: Array<PersonResponse>;
}

export interface PeopleBatchCreateContactCreateParams {
  /**
   * Query param:
   */
  $?: PeopleBatchCreateContactCreateParams._;

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
   * Body param: Required. The contact to create. Allows up to 200 contacts in a
   * single request.
   */
  contacts?: Array<PeopleBatchCreateContactCreateParams.Contact>;

  /**
   * Body param: Required. A field mask to restrict which fields on each person are
   * returned in the response. Multiple fields can be specified by separating them
   * with commas. If read mask is left empty, the post-mutate-get is skipped and no
   * data will be returned in the response. Valid values are: _ addresses _ ageRanges
   * _ biographies _ birthdays _ calendarUrls _ clientData _ coverPhotos _
   * emailAddresses _ events _ externalIds _ genders _ imClients _ interests _
   * locales _ locations _ memberships _ metadata _ miscKeywords _ names _ nicknames
   * _ occupations _ organizations _ phoneNumbers _ photos _ relations _ sipAddresses
   * _ skills _ urls \* userDefined
   */
  readMask?: string;

  /**
   * Body param: Optional. A mask of what source types to return in the post mutate
   * read. Defaults to READ_SOURCE_TYPE_CONTACT and READ_SOURCE_TYPE_PROFILE if not
   * set.
   */
  sources?: Array<
    | "READ_SOURCE_TYPE_UNSPECIFIED"
    | "READ_SOURCE_TYPE_PROFILE"
    | "READ_SOURCE_TYPE_CONTACT"
    | "READ_SOURCE_TYPE_DOMAIN_CONTACT"
  >;
}

export namespace PeopleBatchCreateContactCreateParams {
  export interface _ {
    /**
     * V1 error format.
     */
    xgafv?: "1" | "2";
  }

  /**
   * A wrapper that contains the person data to populate a newly created source.
   */
  export interface Contact {
    /**
     * Required. The person data to populate a newly created source.
     */
    contactPerson?: PeopleCreateContactAPI.PersonMerged;
  }
}

export declare namespace PeopleBatchCreateContacts {
  export {
    type PersonResponse as PersonResponse,
    type PeopleBatchCreateContactCreateResponse as PeopleBatchCreateContactCreateResponse,
    type PeopleBatchCreateContactCreateParams as PeopleBatchCreateContactCreateParams,
  };
}
