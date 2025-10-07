// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIPromise } from "../../core/api-promise";
import { APIResource } from "../../core/resource";
import { RequestOptions } from "../../internal/request-options";
import { path } from "../../internal/utils/path";

export class Photos extends APIResource {
  /**
   * Get a photo media with a photo reference string.
   */
  retrieveMedia(
    photo: string,
    params: PhotoRetrieveMediaParams,
    options?: RequestOptions,
  ): APIPromise<PhotoRetrieveMediaResponse> {
    const { place, ...query } = params;
    return this._client.get(path`/v1/places/${place}/photos/${photo}/media`, {
      query,
      ...options,
    });
  }
}

/**
 * A photo media from Places API.
 */
export interface PhotoRetrieveMediaResponse {
  /**
   * The resource name of a photo media in the format:
   * `places/{place_id}/photos/{photo_reference}/media`.
   */
  name?: string;

  /**
   * A short-lived uri that can be used to render the photo.
   */
  photoUri?: string;
}

export interface PhotoRetrieveMediaParams {
  /**
   * Path param: The place id.
   */
  place: string;

  /**
   * Query param: Optional. Specifies the maximum desired height, in pixels, of the
   * image. If the image is smaller than the values specified, the original image
   * will be returned. If the image is larger in either dimension, it will be scaled
   * to match the smaller of the two dimensions, restricted to its original aspect
   * ratio. Both the max_height_px and max_width_px properties accept an integer
   * between 1 and 4800, inclusively. If the value is not within the allowed range,
   * an INVALID_ARGUMENT error will be returned.
   *
   * At least one of max_height_px or max_width_px needs to be specified. If neither
   * max_height_px nor max_width_px is specified, an INVALID_ARGUMENT error will be
   * returned.
   */
  maxHeightPx?: number;

  /**
   * Query param: Optional. Specifies the maximum desired width, in pixels, of the
   * image. If the image is smaller than the values specified, the original image
   * will be returned. If the image is larger in either dimension, it will be scaled
   * to match the smaller of the two dimensions, restricted to its original aspect
   * ratio. Both the max_height_px and max_width_px properties accept an integer
   * between 1 and 4800, inclusively. If the value is not within the allowed range,
   * an INVALID_ARGUMENT error will be returned.
   *
   * At least one of max_height_px or max_width_px needs to be specified. If neither
   * max_height_px nor max_width_px is specified, an INVALID_ARGUMENT error will be
   * returned.
   */
  maxWidthPx?: number;

  /**
   * Query param: Optional. If set, skip the default HTTP redirect behavior and
   * render a text format (for example, in JSON format for HTTP use case) response.
   * If not set, an HTTP redirect will be issued to redirect the call to the image
   * media. This option is ignored for non-HTTP requests.
   */
  skipHttpRedirect?: boolean;
}

export declare namespace Photos {
  export {
    type PhotoRetrieveMediaResponse as PhotoRetrieveMediaResponse,
    type PhotoRetrieveMediaParams as PhotoRetrieveMediaParams,
  };
}
