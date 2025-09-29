// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import * as ContactGroupsAPI from './contact-groups';

export interface DeleteResourceParams {
  $?: DeleteResourceParams._;

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
   * Optional. Set to true to also delete the contacts in the specified group.
   */
  deleteContacts?: boolean;

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
   * Returns response with indentations and line breaks.
   */
  prettyPrint?: boolean;

  /**
   * Available to use for quota purposes for server-side applications. Can be any
   * arbitrary string assigned to a user, but should not exceed 40 characters.
   */
  quotaUser?: string;

  /**
   * Upload protocol for media (e.g. "raw", "multipart").
   */
  upload_protocol?: string;

  /**
   * Legacy upload protocol for media (e.g. "media", "multipart").
   */
  uploadType?: string;
}

export namespace DeleteResourceParams {
  export interface _ {
    /**
     * V1 error format.
     */
    xgafv?: '1' | '2';
  }
}

export interface RetrieveResourceParams {
  $?: RetrieveResourceParams._;

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
   * Required. A field mask to restrict which fields on the person are returned.
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

  requestMask?: RetrieveResourceParams.RequestMask;

  /**
   * Optional. A mask of what source types to return. Defaults to
   * READ_SOURCE_TYPE_PROFILE and READ_SOURCE_TYPE_CONTACT if not set.
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

export namespace RetrieveResourceParams {
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

export interface UpdateResourceParams {
  /**
   * Query param:
   */
  $?: UpdateResourceParams._;

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
   * Body param: Required. The contact group to update.
   */
  contactGroup?: ContactGroupsAPI.ContactGroup;

  /**
   * Body param: Optional. A field mask to restrict which fields on the group are
   * returned. Defaults to `metadata`, `groupType`, and `name` if not set or set to
   * empty. Valid fields are: _ clientData _ groupType _ memberCount _ metadata \*
   * name
   */
  readGroupFields?: string;

  /**
   * Body param: Optional. A field mask to restrict which fields on the group are
   * updated. Multiple fields can be specified by separating them with commas.
   * Defaults to `name` if not set or set to empty. Updated fields are replaced.
   * Valid values are: _ clientData _ name
   */
  updateGroupFields?: string;
}

export namespace UpdateResourceParams {
  export interface _ {
    /**
     * V1 error format.
     */
    xgafv?: '1' | '2';
  }
}

export declare namespace TopLevel {
  export {
    type DeleteResourceParams as DeleteResourceParams,
    type RetrieveResourceParams as RetrieveResourceParams,
    type UpdateResourceParams as UpdateResourceParams,
  };
}
