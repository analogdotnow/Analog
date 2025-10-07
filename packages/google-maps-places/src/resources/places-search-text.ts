// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIPromise } from "../core/api-promise";
import { APIResource } from "../core/resource";
import { RequestOptions } from "../internal/request-options";
import * as PlacesAutocompleteAPI from "./places-autocomplete";
import * as PlacesSearchNearbyAPI from "./places-search-nearby";
import * as PlacesAPI from "./places/places";

export class PlacesSearchText extends APIResource {
  /**
   * Text query based place search.
   */
  search(
    body: PlacesSearchTextSearchParams,
    options?: RequestOptions,
  ): APIPromise<PlacesSearchTextSearchResponse> {
    return this._client.post("/v1/places:searchText", { body, ...options });
  }
}

/**
 * Response proto for SearchText.
 */
export interface PlacesSearchTextSearchResponse {
  /**
   * Experimental: See
   * https://developers.google.com/maps/documentation/places/web-service/experimental/places-generative
   * for more details.
   *
   * A list of contextual contents where each entry associates to the corresponding
   * place in the same index in the places field. The contents that are relevant to
   * the `text_query` in the request are preferred. If the contextual content is not
   * available for one of the places, it will return non-contextual content. It will
   * be empty only when the content is unavailable for this place. This list will
   * have as many entries as the list of places if requested.
   */
  contextualContents?: Array<PlacesSearchTextSearchResponse.ContextualContent>;

  /**
   * A list of places that meet the user's text search criteria.
   */
  places?: Array<PlacesAPI.Place>;

  /**
   * A list of routing summaries where each entry associates to the corresponding
   * place in the same index in the `places` field. If the routing summary is not
   * available for one of the places, it will contain an empty entry. This list will
   * have as many entries as the list of places if requested.
   */
  routingSummaries?: Array<PlacesSearchNearbyAPI.RoutingSummary>;
}

export namespace PlacesSearchTextSearchResponse {
  /**
   * Experimental: See
   * https://developers.google.com/maps/documentation/places/web-service/experimental/places-generative
   * for more details.
   *
   * Content that is contextual to the place query.
   */
  export interface ContextualContent {
    /**
     * Experimental: See
     * https://developers.google.com/maps/documentation/places/web-service/experimental/places-generative
     * for more details.
     *
     * Justifications for the place.
     */
    justifications?: Array<ContextualContent.Justification>;

    /**
     * Information (including references) about photos of this place, contexual to the
     * place query.
     */
    photos?: Array<PlacesAPI.Photo>;

    /**
     * List of reviews about this place, contexual to the place query.
     */
    reviews?: Array<PlacesAPI.Review>;
  }

  export namespace ContextualContent {
    /**
     * Experimental: See
     * https://developers.google.com/maps/documentation/places/web-service/experimental/places-generative
     * for more details.
     *
     * Justifications for the place. Justifications answers the question of why a place
     * could interest an end user.
     */
    export interface Justification {
      /**
       * Experimental: See
       * https://developers.google.com/maps/documentation/places/web-service/experimental/places-generative
       * for more details. BusinessAvailabilityAttributes justifications. This shows some
       * attributes a business has that could interest an end user.
       */
      businessAvailabilityAttributesJustification?: Justification.BusinessAvailabilityAttributesJustification;

      /**
       * Experimental: See
       * https://developers.google.com/maps/documentation/places/web-service/experimental/places-generative
       * for more details.
       *
       * User review justifications. This highlights a section of the user review that
       * would interest an end user. For instance, if the search query is "firewood
       * pizza", the review justification highlights the text relevant to the search
       * query.
       */
      reviewJustification?: Justification.ReviewJustification;
    }

    export namespace Justification {
      /**
       * Experimental: See
       * https://developers.google.com/maps/documentation/places/web-service/experimental/places-generative
       * for more details. BusinessAvailabilityAttributes justifications. This shows some
       * attributes a business has that could interest an end user.
       */
      export interface BusinessAvailabilityAttributesJustification {
        /**
         * If a place provides delivery.
         */
        delivery?: boolean;

        /**
         * If a place provides dine-in.
         */
        dineIn?: boolean;

        /**
         * If a place provides takeout.
         */
        takeout?: boolean;
      }

      /**
       * Experimental: See
       * https://developers.google.com/maps/documentation/places/web-service/experimental/places-generative
       * for more details.
       *
       * User review justifications. This highlights a section of the user review that
       * would interest an end user. For instance, if the search query is "firewood
       * pizza", the review justification highlights the text relevant to the search
       * query.
       */
      export interface ReviewJustification {
        /**
         * The text highlighted by the justification. This is a subset of the review
         * itself. The exact word to highlight is marked by the HighlightedTextRange. There
         * could be several words in the text being highlighted.
         */
        highlightedText?: ReviewJustification.HighlightedText;

        /**
         * Information about a review of a place.
         */
        review?: PlacesAPI.Review;
      }

      export namespace ReviewJustification {
        /**
         * The text highlighted by the justification. This is a subset of the review
         * itself. The exact word to highlight is marked by the HighlightedTextRange. There
         * could be several words in the text being highlighted.
         */
        export interface HighlightedText {
          /**
           * The list of the ranges of the highlighted text.
           */
          highlightedTextRanges?: Array<HighlightedText.HighlightedTextRange>;

          text?: string;
        }

        export namespace HighlightedText {
          /**
           * The range of highlighted text.
           */
          export interface HighlightedTextRange {
            endIndex?: number;

            startIndex?: number;
          }
        }
      }
    }
  }
}

export interface PlacesSearchTextSearchParams {
  /**
   * Required. The text query for textual search.
   */
  textQuery: string;

  /**
   * Searchable EV options of a place search request.
   */
  evOptions?: PlacesSearchTextSearchParams.EvOptions;

  /**
   * The requested place type. Full list of types supported:
   * https://developers.google.com/maps/documentation/places/web-service/place-types.
   * Only support one included type.
   */
  includedType?: string;

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
   * Place details will be displayed with the preferred language if available. If the
   * language code is unspecified or unrecognized, place details of any language may
   * be returned, with a preference for English if such details exist.
   *
   * Current list of supported languages:
   * https://developers.google.com/maps/faq#languagesupport.
   */
  languageCode?: string;

  /**
   * The region to search. This location serves as a bias which means results around
   * given location might be returned.
   */
  locationBias?: PlacesSearchTextSearchParams.LocationBias;

  /**
   * The region to search. This location serves as a restriction which means results
   * outside given location will not be returned.
   */
  locationRestriction?: PlacesSearchTextSearchParams.LocationRestriction;

  /**
   * Maximum number of results to return. It must be between 1 and 20, inclusively.
   * The default is 20. If the number is unset, it falls back to the upper limit. If
   * the number is set to negative or exceeds the upper limit, an INVALID_ARGUMENT
   * error is returned.
   */
  maxResultCount?: number;

  /**
   * Filter out results whose average user rating is strictly less than this limit. A
   * valid value must be a float between 0 and 5 (inclusively) at a 0.5 cadence i.e.
   * [0, 0.5, 1.0, ... , 5.0] inclusively. The input rating will round up to the
   * nearest 0.5(ceiling). For instance, a rating of 0.6 will eliminate all results
   * with a less than 1.0 rating.
   */
  minRating?: number;

  /**
   * Used to restrict the search to places that are currently open. The default is
   * false.
   */
  openNow?: boolean;

  /**
   * Used to restrict the search to places that are marked as certain price levels.
   * Users can choose any combinations of price levels. Default to select all price
   * levels.
   */
  priceLevels?: Array<
    | "PRICE_LEVEL_UNSPECIFIED"
    | "PRICE_LEVEL_FREE"
    | "PRICE_LEVEL_INEXPENSIVE"
    | "PRICE_LEVEL_MODERATE"
    | "PRICE_LEVEL_EXPENSIVE"
    | "PRICE_LEVEL_VERY_EXPENSIVE"
  >;

  /**
   * How results will be ranked in the response.
   */
  rankPreference?: "RANK_PREFERENCE_UNSPECIFIED" | "DISTANCE" | "RELEVANCE";

  /**
   * The Unicode country/region code (CLDR) of the location where the request is
   * coming from. This parameter is used to display the place details, like
   * region-specific place name, if available. The parameter can affect results based
   * on applicable law.
   *
   * For more information, see
   * https://www.unicode.org/cldr/charts/latest/supplemental/territory_language_information.html.
   *
   * Note that 3-digit region codes are not currently supported.
   */
  regionCode?: string;

  /**
   * Parameters to configure the routing calculations to the places in the response,
   * both along a route (where result ranking will be influenced) and for calculating
   * travel times on results.
   */
  routingParameters?: PlacesSearchNearbyAPI.RoutingParameters;

  /**
   * Specifies a precalculated polyline from the
   * [Routes API](https://developers.google.com/maps/documentation/routes) defining
   * the route to search. Searching along a route is similar to using the
   * `locationBias` or `locationRestriction` request option to bias the search
   * results. However, while the `locationBias` and `locationRestriction` options let
   * you specify a region to bias the search results, this option lets you bias the
   * results along a trip route.
   *
   * Results are not guaranteed to be along the route provided, but rather are ranked
   * within the search area defined by the polyline and, optionally, by the
   * `locationBias` or `locationRestriction` based on minimal detour times from
   * origin to destination. The results might be along an alternate route, especially
   * if the provided polyline does not define an optimal route from origin to
   * destination.
   */
  searchAlongRouteParameters?: PlacesSearchTextSearchParams.SearchAlongRouteParameters;

  /**
   * Used to set strict type filtering for included_type. If set to true, only
   * results of the same type will be returned. Default to false.
   */
  strictTypeFiltering?: boolean;
}

export namespace PlacesSearchTextSearchParams {
  /**
   * Searchable EV options of a place search request.
   */
  export interface EvOptions {
    /**
     * Optional. The list of preferred EV connector types. A place that does not
     * support any of the listed connector types is filtered out.
     */
    connectorTypes?: Array<
      | "EV_CONNECTOR_TYPE_UNSPECIFIED"
      | "EV_CONNECTOR_TYPE_OTHER"
      | "EV_CONNECTOR_TYPE_J1772"
      | "EV_CONNECTOR_TYPE_TYPE_2"
      | "EV_CONNECTOR_TYPE_CHADEMO"
      | "EV_CONNECTOR_TYPE_CCS_COMBO_1"
      | "EV_CONNECTOR_TYPE_CCS_COMBO_2"
      | "EV_CONNECTOR_TYPE_TESLA"
      | "EV_CONNECTOR_TYPE_UNSPECIFIED_GB_T"
      | "EV_CONNECTOR_TYPE_UNSPECIFIED_WALL_OUTLET"
      | "EV_CONNECTOR_TYPE_NACS"
    >;

    /**
     * Optional. Minimum required charging rate in kilowatts. A place with a charging
     * rate less than the specified rate is filtered out.
     */
    minimumChargingRateKw?: number;
  }

  /**
   * The region to search. This location serves as a bias which means results around
   * given location might be returned.
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
   * The region to search. This location serves as a restriction which means results
   * outside given location will not be returned.
   */
  export interface LocationRestriction {
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
   * Specifies a precalculated polyline from the
   * [Routes API](https://developers.google.com/maps/documentation/routes) defining
   * the route to search. Searching along a route is similar to using the
   * `locationBias` or `locationRestriction` request option to bias the search
   * results. However, while the `locationBias` and `locationRestriction` options let
   * you specify a region to bias the search results, this option lets you bias the
   * results along a trip route.
   *
   * Results are not guaranteed to be along the route provided, but rather are ranked
   * within the search area defined by the polyline and, optionally, by the
   * `locationBias` or `locationRestriction` based on minimal detour times from
   * origin to destination. The results might be along an alternate route, especially
   * if the provided polyline does not define an optimal route from origin to
   * destination.
   */
  export interface SearchAlongRouteParameters {
    /**
     * A route polyline. Only supports an
     * [encoded polyline](https://developers.google.com/maps/documentation/utilities/polylinealgorithm),
     * which can be passed as a string and includes compression with minimal lossiness.
     * This is the Routes API default output.
     */
    polyline: SearchAlongRouteParameters.Polyline;
  }

  export namespace SearchAlongRouteParameters {
    /**
     * A route polyline. Only supports an
     * [encoded polyline](https://developers.google.com/maps/documentation/utilities/polylinealgorithm),
     * which can be passed as a string and includes compression with minimal lossiness.
     * This is the Routes API default output.
     */
    export interface Polyline {
      /**
       * An
       * [encoded polyline](https://developers.google.com/maps/documentation/utilities/polylinealgorithm),
       * as returned by the
       * [Routes API by default](https://developers.google.com/maps/documentation/routes/reference/rest/v2/TopLevel/computeRoutes#polylineencoding).
       * See the
       * [encoder](https://developers.google.com/maps/documentation/utilities/polylineutility)
       * and
       * [decoder](https://developers.google.com/maps/documentation/routes/polylinedecoder)
       * tools.
       */
      encodedPolyline?: string;
    }
  }
}

export declare namespace PlacesSearchText {
  export {
    type PlacesSearchTextSearchResponse as PlacesSearchTextSearchResponse,
    type PlacesSearchTextSearchParams as PlacesSearchTextSearchParams,
  };
}
