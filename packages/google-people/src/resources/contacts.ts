// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIPromise } from "../core/api-promise";
import { APIResource } from "../core/resource";
import { RequestOptions } from "../internal/request-options";
import { path } from "../internal/utils/path";
import * as PeopleCreateContactAPI from "./people-create-contact";

export class Contacts extends APIResource {
  /**
   * Delete a contact's photo. Mutate requests for the same user should be done
   * sequentially to avoid // lock contention.
   */
  deletePhoto(
    resourceName: string,
    params: ContactDeletePhotoParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<ContactDeletePhotoResponse> {
    const {
      $,
      access_token,
      alt,
      callback,
      fields,
      key,
      oauth_token,
      personFields,
      prettyPrint,
      quotaUser,
      sources,
      upload_protocol,
      uploadType,
    } = params ?? {};
    return this._client.delete(path`/v1/${resourceName}:deleteContactPhoto`, {
      query: {
        $,
        access_token,
        alt,
        callback,
        fields,
        key,
        oauth_token,
        personFields,
        prettyPrint,
        quotaUser,
        sources,
        upload_protocol,
        uploadType,
      },
      ...options,
    });
  }
}

/**
 * The response for deleting a contact's photo.
 */
export interface ContactDeletePhotoResponse {
  /**
   * The updated person, if person_fields is set in the DeleteContactPhotoRequest;
   * otherwise this will be unset.
   */
  person?: PeopleCreateContactAPI.PersonMerged;
}

export interface ContactDeletePhotoParams {
  $?: ContactDeletePhotoParams._;

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
   * Optional. A field mask to restrict which fields on the person are returned.
   * Multiple fields can be specified by separating them with commas. Defaults to
   * empty if not set, which will skip the post mutate get. Valid values are: _
   * addresses _ ageRanges _ biographies _ birthdays _ calendarUrls _ clientData _
   * coverPhotos _ emailAddresses _ events _ externalIds _ genders _ imClients _
   * interests _ locales _ locations _ memberships _ metadata _ miscKeywords _ names
   * _ nicknames _ occupations _ organizations _ phoneNumbers _ photos _ relations _
   * sipAddresses _ skills _ urls \* userDefined
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

  /**
   * Optional. A mask of what source types to return. Defaults to
   * READ_SOURCE_TYPE_CONTACT and READ_SOURCE_TYPE_PROFILE if not set.
   */
  sources?: Array<
    | "READ_SOURCE_TYPE_UNSPECIFIED"
    | "READ_SOURCE_TYPE_PROFILE"
    | "READ_SOURCE_TYPE_CONTACT"
    | "READ_SOURCE_TYPE_DOMAIN_CONTACT"
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

export namespace ContactDeletePhotoParams {
  export interface _ {
    /**
     * V1 error format.
     */
    xgafv?: "1" | "2";
  }
}

export declare namespace Contacts {
  export {
    type ContactDeletePhotoResponse as ContactDeletePhotoResponse,
    type ContactDeletePhotoParams as ContactDeletePhotoParams,
  };
}
