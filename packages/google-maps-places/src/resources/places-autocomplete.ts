// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIPromise } from "../core/api-promise";
import { APIResource } from "../core/resource";
import { RequestOptions } from "../internal/request-options";
import * as PlacesAutocompleteAPI from "./places-autocomplete";
import * as PlacesAPI from "./places/places";

export class PlacesAutocomplete extends APIResource {
  /**
   * Returns predictions for the given input.
   */
  predict(
    body: PlacesAutocompletePredictParams,
    options?: RequestOptions,
  ): APIPromise<PlacesAutocompletePredictResponse> {
    return this._client.post("/v1/places:autocomplete", { body, ...options });
  }
}

/**
 * Circle with a LatLng as center and radius.
 */
export interface Circle {
  /**
   * An object that represents a latitude/longitude pair. This is expressed as a pair
   * of doubles to represent degrees latitude and degrees longitude. Unless specified
   * otherwise, this must conform to the
   * <a href="http://www.unoosa.org/pdf/icg/2012/template/WGS_84.pdf">WGS84
   * standard</a>. Values must be within normalized ranges.
   */
  center: PlacesAPI.LatLng;

  /**
   * Required. Radius measured in meters. The radius must be within [0.0, 50000.0].
   */
  radius: number;
}

/**
 * Text representing a Place or query prediction. The text may be used as is or
 * formatted.
 */
export interface SuggestionFormatableText {
  /**
   * A list of string ranges identifying where the input request matched in `text`.
   * The ranges can be used to format specific parts of `text`. The substrings may
   * not be exact matches of `input` if the matching was determined by criteria other
   * than string matching (for example, spell corrections or transliterations).
   *
   * These values are Unicode character offsets of `text`. The ranges are guaranteed
   * to be ordered in increasing offset values.
   */
  matches?: Array<SuggestionFormatableText.Match>;

  /**
   * Text that may be used as is or formatted with `matches`.
   */
  text?: string;
}

export namespace SuggestionFormatableText {
  /**
   * Identifies a substring within a given text.
   */
  export interface Match {
    /**
     * Zero-based offset of the last Unicode character (exclusive).
     */
    endOffset?: number;

    /**
     * Zero-based offset of the first Unicode character of the string (inclusive).
     */
    startOffset?: number;
  }
}

/**
 * Contains a breakdown of a Place or query prediction into main text and secondary
 * text.
 *
 * For Place predictions, the main text contains the specific name of the Place.
 * For query predictions, the main text contains the query.
 *
 * The secondary text contains additional disambiguating features (such as a city
 * or region) to further identify the Place or refine the query.
 */
export interface SuggestionStructuredFormat {
  /**
   * Text representing a Place or query prediction. The text may be used as is or
   * formatted.
   */
  mainText?: SuggestionFormatableText;

  /**
   * Text representing a Place or query prediction. The text may be used as is or
   * formatted.
   */
  secondaryText?: SuggestionFormatableText;
}

/**
 * Response proto for AutocompletePlaces.
 */
export interface PlacesAutocompletePredictResponse {
  /**
   * Contains a list of suggestions, ordered in descending order of relevance.
   */
  suggestions?: Array<PlacesAutocompletePredictResponse.Suggestion>;
}

export namespace PlacesAutocompletePredictResponse {
  /**
   * An Autocomplete suggestion result.
   */
  export interface Suggestion {
    /**
     * Prediction results for a Place Autocomplete prediction.
     */
    placePrediction?: Suggestion.PlacePrediction;

    /**
     * Prediction results for a Query Autocomplete prediction.
     */
    queryPrediction?: Suggestion.QueryPrediction;
  }

  export namespace Suggestion {
    /**
     * Prediction results for a Place Autocomplete prediction.
     */
    export interface PlacePrediction {
      /**
       * The length of the geodesic in meters from `origin` if `origin` is specified.
       * Certain predictions such as routes may not populate this field.
       */
      distanceMeters?: number;

      /**
       * The resource name of the suggested Place. This name can be used in other APIs
       * that accept Place names.
       */
      place?: string;

      /**
       * The unique identifier of the suggested Place. This identifier can be used in
       * other APIs that accept Place IDs.
       */
      placeId?: string;

      /**
       * Contains a breakdown of a Place or query prediction into main text and secondary
       * text.
       *
       * For Place predictions, the main text contains the specific name of the Place.
       * For query predictions, the main text contains the query.
       *
       * The secondary text contains additional disambiguating features (such as a city
       * or region) to further identify the Place or refine the query.
       */
      structuredFormat?: PlacesAutocompleteAPI.SuggestionStructuredFormat;

      /**
       * Text representing a Place or query prediction. The text may be used as is or
       * formatted.
       */
      text?: PlacesAutocompleteAPI.SuggestionFormatableText;

      /**
       * List of types that apply to this Place from Table A or Table B in
       * https://developers.google.com/maps/documentation/places/web-service/place-types.
       *
       * A type is a categorization of a Place. Places with shared types will share
       * similar characteristics.
       */
      types?: Array<string>;
    }

    /**
     * Prediction results for a Query Autocomplete prediction.
     */
    export interface QueryPrediction {
      /**
       * Contains a breakdown of a Place or query prediction into main text and secondary
       * text.
       *
       * For Place predictions, the main text contains the specific name of the Place.
       * For query predictions, the main text contains the query.
       *
       * The secondary text contains additional disambiguating features (such as a city
       * or region) to further identify the Place or refine the query.
       */
      structuredFormat?: PlacesAutocompleteAPI.SuggestionStructuredFormat;

      /**
       * Text representing a Place or query prediction. The text may be used as is or
       * formatted.
       */
      text?: PlacesAutocompleteAPI.SuggestionFormatableText;
    }
  }
}

export interface PlacesAutocompletePredictParams {
  /**
   * Required. The text string on which to search.
   */
  input: string;

  /**
   * Optional. Included primary Place type (for example, "restaurant" or
   * "gas_station") in Place Types
   * (https://developers.google.com/maps/documentation/places/web-service/place-types),
   * or only `(regions)`, or only `(cities)`. A Place is only returned if its primary
   * type is included in this list. Up to 5 values can be specified. If no types are
   * specified, all Place types are returned.
   */
  includedPrimaryTypes?: Array<string>;

  /**
   * Optional. Only include results in the specified regions, specified as up to 15
   * CLDR two-character region codes. An empty set will not restrict the results. If
   * both `location_restriction` and `included_region_codes` are set, the results
   * will be located in the area of intersection.
   */
  includedRegionCodes?: Array<string>;

  /**
   * Optional. Include pure service area businesses if the field is set to true. Pure
   * service area business is a business that visits or delivers to customers
   * directly but does not serve customers at their business address. For example,
   * businesses like cleaning services or plumbers. Those businesses do not have a
   * physical address or location on Google Maps. Places will not return fields
   * including `location`, `plus_code`, and other location related fields for these
   * businesses.
   */
  includePureServiceAreaBusinesses?: boolean;

  /**
   * Optional. If true, the response will include both Place and query predictions.
   * Otherwise the response will only return Place predictions.
   */
  includeQueryPredictions?: boolean;

  /**
   * Optional. A zero-based Unicode character offset of `input` indicating the cursor
   * position in `input`. The cursor position may influence what predictions are
   * returned.
   *
   * If empty, defaults to the length of `input`.
   */
  inputOffset?: number;

  /**
   * Optional. The language in which to return results. Defaults to en-US. The
   * results may be in mixed languages if the language used in `input` is different
   * from `language_code` or if the returned Place does not have a translation from
   * the local language to `language_code`.
   */
  languageCode?: string;

  /**
   * The region to search. The results may be biased around the specified region.
   */
  locationBias?: PlacesAutocompletePredictParams.LocationBias;

  /**
   * The region to search. The results will be restricted to the specified region.
   */
  locationRestriction?: PlacesAutocompletePredictParams.LocationRestriction;

  /**
   * An object that represents a latitude/longitude pair. This is expressed as a pair
   * of doubles to represent degrees latitude and degrees longitude. Unless specified
   * otherwise, this must conform to the
   * <a href="http://www.unoosa.org/pdf/icg/2012/template/WGS_84.pdf">WGS84
   * standard</a>. Values must be within normalized ranges.
   */
  origin?: PlacesAPI.LatLng;

  /**
   * Optional. The region code, specified as a CLDR two-character region code. This
   * affects address formatting, result ranking, and may influence what results are
   * returned. This does not restrict results to the specified region. To restrict
   * results to a region, use `region_code_restriction`.
   */
  regionCode?: string;

  /**
   * Optional. A string which identifies an Autocomplete session for billing
   * purposes. Must be a URL and filename safe base64 string with at most 36 ASCII
   * characters in length. Otherwise an INVALID_ARGUMENT error is returned.
   *
   * The session begins when the user starts typing a query, and concludes when they
   * select a place and a call to Place Details or Address Validation is made. Each
   * session can have multiple queries, followed by one Place Details or Address
   * Validation request. The credentials used for each request within a session must
   * belong to the same Google Cloud Console project. Once a session has concluded,
   * the token is no longer valid; your app must generate a fresh token for each
   * session. If the `session_token` parameter is omitted, or if you reuse a session
   * token, the session is charged as if no session token was provided (each request
   * is billed separately).
   *
   * We recommend the following guidelines:
   *
   * - Use session tokens for all Place Autocomplete calls.
   * - Generate a fresh token for each session. Using a version 4 UUID is
   *   recommended.
   * - Ensure that the credentials used for all Place Autocomplete, Place Details,
   *   and Address Validation requests within a session belong to the same Cloud
   *   Console project.
   * - Be sure to pass a unique session token for each new session. Using the same
   *   token for more than one session will result in each request being billed
   *   individually.
   */
  sessionToken?: string;
}

export namespace PlacesAutocompletePredictParams {
  /**
   * The region to search. The results may be biased around the specified region.
   */
  export interface LocationBias {
    /**
     * Circle with a LatLng as center and radius.
     */
    circle?: PlacesAutocompleteAPI.Circle;

    /**
     * A latitude-longitude viewport, represented as two diagonally opposite `low` and
     * `high` points. A viewport is considered a closed region, i.e. it includes its
     * boundary. The latitude bounds must range between -90 to 90 degrees inclusive,
     * and the longitude bounds must range between -180 to 180 degrees inclusive.
     * Various cases include:
     *
     * - If `low` = `high`, the viewport consists of that single point.
     *
     * - If `low.longitude` > `high.longitude`, the longitude range is inverted (the
     *   viewport crosses the 180 degree longitude line).
     *
     * - If `low.longitude` = -180 degrees and `high.longitude` = 180 degrees, the
     *   viewport includes all longitudes.
     *
     * - If `low.longitude` = 180 degrees and `high.longitude` = -180 degrees, the
     *   longitude range is empty.
     *
     * - If `low.latitude` > `high.latitude`, the latitude range is empty.
     *
     * Both `low` and `high` must be populated, and the represented box cannot be empty
     * (as specified by the definitions above). An empty viewport will result in an
     * error.
     *
     * For example, this viewport fully encloses New York City:
     *
     * { "low": { "latitude": 40.477398, "longitude": -74.259087 }, "high": {
     * "latitude": 40.91618, "longitude": -73.70018 } }
     */
    rectangle?: PlacesAPI.Viewport;
  }

  /**
   * The region to search. The results will be restricted to the specified region.
   */
  export interface LocationRestriction {
    /**
     * Circle with a LatLng as center and radius.
     */
    circle?: PlacesAutocompleteAPI.Circle;

    /**
     * A latitude-longitude viewport, represented as two diagonally opposite `low` and
     * `high` points. A viewport is considered a closed region, i.e. it includes its
     * boundary. The latitude bounds must range between -90 to 90 degrees inclusive,
     * and the longitude bounds must range between -180 to 180 degrees inclusive.
     * Various cases include:
     *
     * - If `low` = `high`, the viewport consists of that single point.
     *
     * - If `low.longitude` > `high.longitude`, the longitude range is inverted (the
     *   viewport crosses the 180 degree longitude line).
     *
     * - If `low.longitude` = -180 degrees and `high.longitude` = 180 degrees, the
     *   viewport includes all longitudes.
     *
     * - If `low.longitude` = 180 degrees and `high.longitude` = -180 degrees, the
     *   longitude range is empty.
     *
     * - If `low.latitude` > `high.latitude`, the latitude range is empty.
     *
     * Both `low` and `high` must be populated, and the represented box cannot be empty
     * (as specified by the definitions above). An empty viewport will result in an
     * error.
     *
     * For example, this viewport fully encloses New York City:
     *
     * { "low": { "latitude": 40.477398, "longitude": -74.259087 }, "high": {
     * "latitude": 40.91618, "longitude": -73.70018 } }
     */
    rectangle?: PlacesAPI.Viewport;
  }
}

export declare namespace PlacesAutocomplete {
  export {
    type Circle as Circle,
    type SuggestionFormatableText as SuggestionFormatableText,
    type SuggestionStructuredFormat as SuggestionStructuredFormat,
    type PlacesAutocompletePredictResponse as PlacesAutocompletePredictResponse,
    type PlacesAutocompletePredictParams as PlacesAutocompletePredictParams,
  };
}
