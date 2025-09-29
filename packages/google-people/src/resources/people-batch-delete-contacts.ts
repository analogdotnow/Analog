// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';

export class PeopleBatchDeleteContacts extends APIResource {
  /**
   * Delete a batch of contacts. Any non-contact data will not be deleted. Mutate
   * requests for the same user should be sent sequentially to avoid increased
   * latency and failures.
   */
  deleteBatch(
    params: PeopleBatchDeleteContactDeleteBatchParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<unknown> {
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
    return this._client.post('/v1/people:batchDeleteContacts', {
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
 * A generic empty message that you can re-use to avoid defining duplicated empty
 * messages in your APIs. A typical example is to use it as the request or the
 * response type of an API method. For instance: service Foo { rpc
 * Bar(google.protobuf.Empty) returns (google.protobuf.Empty); }
 */
export type Empty = unknown;

export interface PeopleBatchDeleteContactDeleteBatchParams {
  /**
   * Query param:
   */
  $?: PeopleBatchDeleteContactDeleteBatchParams._;

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
   * Body param: Required. The resource names of the contact to delete. It's
   * repeatable. Allows up to 500 resource names in a single request.
   */
  resourceNames?: Array<string>;
}

export namespace PeopleBatchDeleteContactDeleteBatchParams {
  export interface _ {
    /**
     * V1 error format.
     */
    xgafv?: '1' | '2';
  }
}

export declare namespace PeopleBatchDeleteContacts {
  export {
    type Empty as Empty,
    type PeopleBatchDeleteContactDeleteBatchParams as PeopleBatchDeleteContactDeleteBatchParams,
  };
}
