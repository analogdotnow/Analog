// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import * as DistanceMatrixAPI from './distance-matrix';
import * as DirectionsAPI from './directions';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';

export class DistanceMatrix extends APIResource {
  /**
   * Takes in a list of origins and destinations and returns a stream containing
   * route information for each combination of origin and destination.
   *
   * **NOTE:** This method requires that you specify a response field mask in the
   * input. You can provide the response field mask by using the URL parameter
   * `$fields` or `fields`, or by using the HTTP/gRPC header `X-Goog-FieldMask` (see
   * the
   * [available URL parameters and headers](https://cloud.google.com/apis/docs/system-parameters)).
   * The value is a comma separated list of field paths. See this detailed
   * documentation about
   * [how to construct the field paths](https://github.com/protocolbuffers/protobuf/blob/master/src/google/protobuf/field_mask.proto).
   *
   * For example, in this method:
   *
   * - Field mask of all available fields (for manual inspection):
   *   `X-Goog-FieldMask: *`
   * - Field mask of route durations, distances, element status, condition, and
   *   element indices (an example production setup):
   *   `X-Goog-FieldMask: originIndex,destinationIndex,status,condition,distanceMeters,duration`
   *
   * It is critical that you include `status` in your field mask as otherwise all
   * messages will appear to be OK. Google discourages the use of the wildcard (`*`)
   * response field mask, because:
   *
   * - Selecting only the fields that you need helps our server save computation
   *   cycles, allowing us to return the result to you with a lower latency.
   * - Selecting only the fields that you need in your production job ensures stable
   *   latency performance. We might add more response fields in the future, and
   *   those new fields might require extra computation time. If you select all
   *   fields, or if you select all fields at the top level, then you might
   *   experience performance degradation because any new field we add will be
   *   automatically included in the response.
   * - Selecting only the fields that you need results in a smaller response size,
   *   and thus higher network throughput.
   */
  computeRouteMatrix(
    body: DistanceMatrixComputeRouteMatrixParams,
    options?: RequestOptions,
  ): APIPromise<DistanceMatrixComputeRouteMatrixResponse> {
    return this._client.post('/distanceMatrix/v2:computeRouteMatrix', { body, ...options });
  }
}

/**
 * Localized variant of a text in a particular language.
 */
export interface LocalizedText {
  /**
   * The text's BCP-47 language code, such as "en-US" or "sr-Latn".
   *
   * For more information, see
   * http://www.unicode.org/reports/tr35/#Unicode_locale_identifier.
   */
  languageCode?: string;

  /**
   * Localized string in the language corresponding to `language_code' below.
   */
  text?: string;
}

/**
 * Represents an amount of money with its currency type.
 */
export interface Money {
  /**
   * The three-letter currency code defined in ISO 4217.
   */
  currencyCode?: string;

  /**
   * Number of nano (10^-9) units of the amount. The value must be between
   * -999,999,999 and +999,999,999 inclusive. If `units` is positive, `nanos` must be
   * positive or zero. If `units` is zero, `nanos` can be positive, zero, or
   * negative. If `units` is negative, `nanos` must be negative or zero. For example
   * $-1.75 is represented as `units`=-1 and `nanos`=-750,000,000.
   */
  nanos?: number;

  /**
   * The whole units of the amount. For example if `currencyCode` is `"USD"`, then 1
   * unit is one US dollar.
   */
  units?: string;
}

/**
 * Contains the additional information that the user should be informed about, such
 * as possible traffic zone restrictions.
 */
export interface RouteTravelAdvisory {
  /**
   * The predicted fuel consumption in microliters.
   */
  fuelConsumptionMicroliters?: string;

  /**
   * Returned route may have restrictions that are not suitable for requested travel
   * mode or route modifiers.
   */
  routeRestrictionsPartiallyIgnored?: boolean;

  /**
   * Speed reading intervals detailing traffic density. Applicable in case of
   * `TRAFFIC_AWARE` and `TRAFFIC_AWARE_OPTIMAL` routing preferences. The intervals
   * cover the entire polyline of the route without overlap. The start point of a
   * specified interval is the same as the end point of the preceding interval.
   *
   * Example:
   *
   *      polyline: A ---- B ---- C ---- D ---- E ---- F ---- G
   *      speed_reading_intervals: [A,C), [C,D), [D,G).
   */
  speedReadingIntervals?: Array<SpeedReadingInterval>;

  /**
   * Encapsulates toll information on a [`Route`][google.maps.routing.v2.Route] or on
   * a [`RouteLeg`][google.maps.routing.v2.RouteLeg].
   */
  tollInfo?: TollInfo;

  /**
   * Represents an amount of money with its currency type.
   */
  transitFare?: Money;
}

/**
 * Traffic density indicator on a contiguous segment of a polyline or path. Given a
 * path with points P_0, P_1, ... , P_N (zero-based index), the
 * `SpeedReadingInterval` defines an interval and describes its traffic using the
 * following categories.
 */
export interface SpeedReadingInterval {
  /**
   * The ending index of this interval in the polyline.
   */
  endPolylinePointIndex?: number;

  /**
   * Traffic speed in this interval.
   */
  speed?: number;

  /**
   * The starting index of this interval in the polyline.
   */
  startPolylinePointIndex?: number;
}

/**
 * The `Status` type defines a logical error model that is suitable for different
 * programming environments, including REST APIs and RPC APIs. It is used by
 * [gRPC](https://github.com/grpc). Each `Status` message contains three pieces of
 * data: error code, error message, and error details. You can find out more about
 * this error model and how to work with it in the
 * [API Design Guide](https://cloud.google.com/apis/design/errors).
 */
export interface Status {
  /**
   * The status code, which should be an enum value of
   * [google.rpc.Code][google.rpc.Code].
   */
  code?: number;

  /**
   * A list of messages that carry the error details. There is a common set of
   * message types for APIs to use.
   */
  details?: Array<Status.Detail>;

  /**
   * A developer-facing error message, which should be in English. Any user-facing
   * error message should be localized and sent in the
   * [google.rpc.Status.details][google.rpc.Status.details] field, or localized by
   * the client.
   */
  message?: string;
}

export namespace Status {
  /**
   * Contains an arbitrary serialized message along with a @type that describes the
   * type of the serialized message.
   */
  export interface Detail {
    /**
     * The type of the serialized message.
     */
    '@type'?: string;

    [k: string]: unknown;
  }
}

/**
 * Encapsulates toll information on a [`Route`][google.maps.routing.v2.Route] or on
 * a [`RouteLeg`][google.maps.routing.v2.RouteLeg].
 */
export interface TollInfo {
  /**
   * The monetary amount of tolls for the corresponding
   * [`Route`][google.maps.routing.v2.Route] or
   * [`RouteLeg`][google.maps.routing.v2.RouteLeg]. This list contains a money amount
   * for each currency that is expected to be charged by the toll stations. Typically
   * this list will contain only one item for routes with tolls in one currency. For
   * international trips, this list may contain multiple items to reflect tolls in
   * different currencies.
   */
  estimatedPrice?: Array<Money>;
}

/**
 * Contains route information computed for an origin/destination pair in the
 * ComputeRouteMatrix API. This proto can be streamed to the client.
 */
export interface DistanceMatrixComputeRouteMatrixResponse {
  /**
   * Indicates whether the route was found or not. Independent of status.
   */
  condition?: number;

  /**
   * Zero-based index of the destination in the request.
   */
  destinationIndex?: number;

  /**
   * The travel distance of the route, in meters.
   */
  distanceMeters?: number;

  /**
   * The length of time needed to navigate the route. If you set the
   * [routing_preference][google.maps.routing.v2.ComputeRouteMatrixRequest.routing_preference]
   * to `TRAFFIC_UNAWARE`, then this value is the same as `static_duration`. If you
   * set the `routing_preference` to either `TRAFFIC_AWARE` or
   * `TRAFFIC_AWARE_OPTIMAL`, then this value is calculated taking traffic conditions
   * into account.
   */
  duration?: string;

  /**
   * Information related to how and why a fallback result was used. If this field is
   * set, then it means the server used a different routing mode from your preferred
   * mode as fallback.
   */
  fallbackInfo?: DirectionsAPI.FallbackInfo;

  /**
   * Text representations of certain properties.
   */
  localizedValues?: DistanceMatrixComputeRouteMatrixResponse.LocalizedValues;

  /**
   * Zero-based index of the origin in the request.
   */
  originIndex?: number;

  /**
   * The duration of traveling through the route without taking traffic conditions
   * into consideration.
   */
  staticDuration?: string;

  /**
   * The `Status` type defines a logical error model that is suitable for different
   * programming environments, including REST APIs and RPC APIs. It is used by
   * [gRPC](https://github.com/grpc). Each `Status` message contains three pieces of
   * data: error code, error message, and error details. You can find out more about
   * this error model and how to work with it in the
   * [API Design Guide](https://cloud.google.com/apis/design/errors).
   */
  status?: Status;

  /**
   * Contains the additional information that the user should be informed about, such
   * as possible traffic zone restrictions.
   */
  travelAdvisory?: RouteTravelAdvisory;
}

export namespace DistanceMatrixComputeRouteMatrixResponse {
  /**
   * Text representations of certain properties.
   */
  export interface LocalizedValues {
    /**
     * Localized variant of a text in a particular language.
     */
    distance?: DistanceMatrixAPI.LocalizedText;

    /**
     * Localized variant of a text in a particular language.
     */
    duration?: DistanceMatrixAPI.LocalizedText;

    /**
     * Localized variant of a text in a particular language.
     */
    staticDuration?: DistanceMatrixAPI.LocalizedText;

    /**
     * Localized variant of a text in a particular language.
     */
    transitFare?: DistanceMatrixAPI.LocalizedText;
  }
}

export interface DistanceMatrixComputeRouteMatrixParams {
  /**
   * Required. Array of destinations, which determines the columns of the response
   * matrix.
   */
  destinations: Array<DistanceMatrixComputeRouteMatrixParams.Destination>;

  /**
   * Required. Array of origins, which determines the rows of the response matrix.
   * Several size restrictions apply to the cardinality of origins and destinations:
   *
   * - The sum of the number of origins + the number of destinations specified as
   *   either `place_id` or `address` must be no greater than 50.
   * - The product of number of origins × number of destinations must be no greater
   *   than 625 in any case.
   * - The product of the number of origins × number of destinations must be no
   *   greater than 100 if routing_preference is set to `TRAFFIC_AWARE_OPTIMAL`.
   * - The product of the number of origins × number of destinations must be no
   *   greater than 100 if travel_mode is set to `TRANSIT`.
   */
  origins: Array<DistanceMatrixComputeRouteMatrixParams.Origin>;

  /**
   * Optional. The arrival time. NOTE: Can only be set when
   * [`RouteTravelMode`][google.maps.routing.v2.RouteTravelMode] is set to `TRANSIT`.
   * You can specify either `departure_time` or `arrival_time`, but not both.
   */
  arrivalTime?: string;

  /**
   * Optional. The departure time. If you don't set this value, then this value
   * defaults to the time that you made the request. NOTE: You can only specify a
   * `departure_time` in the past when
   * [`RouteTravelMode`][google.maps.routing.v2.RouteTravelMode] is set to `TRANSIT`.
   */
  departureTime?: string;

  /**
   * Optional. A list of extra computations which may be used to complete the
   * request. Note: These extra computations may return extra fields on the response.
   * These extra fields must also be specified in the field mask to be returned in
   * the response.
   */
  extraComputations?: Array<number>;

  /**
   * Optional. The BCP-47 language code, such as "en-US" or "sr-Latn". For more
   * information, see
   * [Unicode Locale Identifier](http://www.unicode.org/reports/tr35/#Unicode_locale_identifier).
   * See [Language Support](https://developers.google.com/maps/faq#languagesupport)
   * for the list of supported languages. When you don't provide this value, the
   * display language is inferred from the location of the first origin.
   */
  languageCode?: string;

  /**
   * Optional. The region code, specified as a ccTLD ("top-level domain")
   * two-character value. For more information see
   * [Country code top-level domains](https://en.wikipedia.org/wiki/List_of_Internet_top-level_domains#Country_code_top-level_domains).
   */
  regionCode?: string;

  /**
   * Optional. Specifies how to compute the route. The server attempts to use the
   * selected routing preference to compute the route. If the routing preference
   * results in an error or an extra long latency, an error is returned. You can
   * specify this option only when the `travel_mode` is `DRIVE` or `TWO_WHEELER`,
   * otherwise the request fails.
   */
  routingPreference?: number;

  /**
   * Optional. Specifies the assumptions to use when calculating time in traffic.
   * This setting affects the value returned in the duration field in the
   * [RouteMatrixElement][google.maps.routing.v2.RouteMatrixElement] which contains
   * the predicted time in traffic based on historical averages.
   * [RoutingPreference][google.maps.routing.v2.RoutingPreference] to
   * `TRAFFIC_AWARE_OPTIMAL` and
   * [RouteTravelMode][google.maps.routing.v2.RouteTravelMode] to `DRIVE`. Defaults
   * to `BEST_GUESS` if traffic is requested and `TrafficModel` is not specified.
   */
  trafficModel?: number;

  /**
   * Preferences for `TRANSIT` based routes that influence the route that is
   * returned.
   */
  transitPreferences?: DirectionsAPI.TransitPreferences;

  /**
   * Optional. Specifies the mode of transportation.
   */
  travelMode?: number;

  /**
   * Optional. Specifies the units of measure for the display fields.
   */
  units?: number;
}

export namespace DistanceMatrixComputeRouteMatrixParams {
  /**
   * A single destination for ComputeRouteMatrixRequest
   */
  export interface Destination {
    /**
     * Encapsulates a waypoint. Waypoints mark both the beginning and end of a route,
     * and include intermediate stops along the route.
     */
    waypoint: DirectionsAPI.Waypoint;
  }

  /**
   * A single origin for ComputeRouteMatrixRequest
   */
  export interface Origin {
    /**
     * Encapsulates a waypoint. Waypoints mark both the beginning and end of a route,
     * and include intermediate stops along the route.
     */
    waypoint: DirectionsAPI.Waypoint;

    /**
     * Encapsulates a set of optional conditions to satisfy when calculating the
     * routes.
     */
    routeModifiers?: DirectionsAPI.RouteModifiers;
  }
}

export declare namespace DistanceMatrix {
  export {
    type LocalizedText as LocalizedText,
    type Money as Money,
    type RouteTravelAdvisory as RouteTravelAdvisory,
    type SpeedReadingInterval as SpeedReadingInterval,
    type Status as Status,
    type TollInfo as TollInfo,
    type DistanceMatrixComputeRouteMatrixResponse as DistanceMatrixComputeRouteMatrixResponse,
    type DistanceMatrixComputeRouteMatrixParams as DistanceMatrixComputeRouteMatrixParams,
  };
}
