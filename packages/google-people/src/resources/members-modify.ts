// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';

export class MembersModify extends APIResource {
  /**
   * Modify the members of a contact group owned by the authenticated user. The only
   * system contact groups that can have members added are `contactGroups/myContacts`
   * and `contactGroups/starred`. Other system contact groups are deprecated and can
   * only have contacts removed.
   */
  modify(
    resourceName: string,
    params: MembersModifyModifyParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<MembersModifyModifyResponse> {
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
    return this._client.post(path`/v1/${resourceName}/members:modify`, {
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
 * The response to a modify contact group members request.
 */
export interface MembersModifyModifyResponse {
  /**
   * The contact people resource names that cannot be removed from their last contact
   * group.
   */
  canNotRemoveLastContactGroupResourceNames?: Array<string>;

  /**
   * The contact people resource names that were not found.
   */
  notFoundResourceNames?: Array<string>;
}

export interface MembersModifyModifyParams {
  /**
   * Query param:
   */
  $?: MembersModifyModifyParams._;

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
   * Body param: Optional. The resource names of the contact people to add in the
   * form of `people/{person_id}`. The total number of resource names in
   * `resource_names_to_add` and `resource_names_to_remove` must be less than or
   * equal to 1000.
   */
  resourceNamesToAdd?: Array<string>;

  /**
   * Body param: Optional. The resource names of the contact people to remove in the
   * form of `people/{person_id}`. The total number of resource names in
   * `resource_names_to_add` and `resource_names_to_remove` must be less than or
   * equal to 1000.
   */
  resourceNamesToRemove?: Array<string>;
}

export namespace MembersModifyModifyParams {
  export interface _ {
    /**
     * V1 error format.
     */
    xgafv?: '1' | '2';
  }
}

export declare namespace MembersModify {
  export {
    type MembersModifyModifyResponse as MembersModifyModifyResponse,
    type MembersModifyModifyParams as MembersModifyModifyParams,
  };
}
