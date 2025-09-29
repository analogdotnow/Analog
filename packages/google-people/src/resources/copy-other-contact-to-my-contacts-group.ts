// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIPromise } from "../core/api-promise";
import { APIResource } from "../core/resource";
import { RequestOptions } from "../internal/request-options";
import { path } from "../internal/utils/path";
import * as PeopleCreateContactAPI from "./people-create-contact";

export class CopyOtherContactToMyContactsGroup extends APIResource {
  /**
   * Copies an "Other contact" to a new contact in the user's "myContacts" group
   * Mutate requests for the same user should be sent sequentially to avoid increased
   * latency and failures.
   */
  copy(
    resourceName: string,
    params: CopyOtherContactToMyContactsGroupCopyParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<PeopleCreateContactAPI.PersonMerged> {
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
    return this._client.post(
      path`/v1/${resourceName}:copyOtherContactToMyContactsGroup`,
      {
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
      },
    );
  }
}

export interface CopyOtherContactToMyContactsGroupCopyParams {
  /**
   * Query param:
   */
  $?: CopyOtherContactToMyContactsGroupCopyParams._;

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
   * Body param: Required. A field mask to restrict which fields are copied into the
   * new contact. Valid values are: _ emailAddresses _ names \* phoneNumbers
   */
  copyMask?: string;

  /**
   * Body param: Optional. A field mask to restrict which fields on the person are
   * returned. Multiple fields can be specified by separating them with commas.
   * Defaults to the copy mask with metadata and membership fields if not set. Valid
   * values are: _ addresses _ ageRanges _ biographies _ birthdays _ calendarUrls _
   * clientData _ coverPhotos _ emailAddresses _ events _ externalIds _ genders _
   * imClients _ interests _ locales _ locations _ memberships _ metadata _
   * miscKeywords _ names _ nicknames _ occupations _ organizations _ phoneNumbers _
   * photos _ relations _ sipAddresses _ skills _ urls \* userDefined
   */
  readMask?: string;

  /**
   * Body param: Optional. A mask of what source types to return. Defaults to
   * READ_SOURCE_TYPE_CONTACT and READ_SOURCE_TYPE_PROFILE if not set.
   */
  sources?: Array<
    | "READ_SOURCE_TYPE_UNSPECIFIED"
    | "READ_SOURCE_TYPE_PROFILE"
    | "READ_SOURCE_TYPE_CONTACT"
    | "READ_SOURCE_TYPE_DOMAIN_CONTACT"
  >;
}

export namespace CopyOtherContactToMyContactsGroupCopyParams {
  export interface _ {
    /**
     * V1 error format.
     */
    xgafv?: "1" | "2";
  }
}

export declare namespace CopyOtherContactToMyContactsGroup {
  export { type CopyOtherContactToMyContactsGroupCopyParams as CopyOtherContactToMyContactsGroupCopyParams };
}
