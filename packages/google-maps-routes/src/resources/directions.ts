// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import * as DirectionsAPI from './directions';
import * as DistanceMatrixAPI from './distance-matrix';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';

export class Directions extends APIResource {
  /**
   * Returns the primary route along with optional alternate routes, given a set of
   * terminal and intermediate waypoints.
   *
   * **NOTE:** This method requires that you specify a response field mask in the
   * input. You can provide the response field mask by using URL parameter `$fields`
   * or `fields`, or by using an HTTP/gRPC header `X-Goog-FieldMask` (see the
   * [available URL parameters and headers](https://cloud.google.com/apis/docs/system-parameters)).
   * The value is a comma separated list of field paths. See detailed documentation
   * about
   * [how to construct the field paths](https://github.com/protocolbuffers/protobuf/blob/master/src/google/protobuf/field_mask.proto).
   *
   * For example, in this method:
   *
   * - Field mask of all available fields (for manual inspection):
   *   `X-Goog-FieldMask: *`
   * - Field mask of Route-level duration, distance, and polyline (an example
   *   production setup):
   *   `X-Goog-FieldMask: routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline`
   *
   * Google discourage the use of the wildcard (`*`) response field mask, or
   * specifying the field mask at the top level (`routes`), because:
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
  computeRoutes(
    body: DirectionComputeRoutesParams,
    options?: RequestOptions,
  ): APIPromise<DirectionComputeRoutesResponse> {
    return this._client.post('/directions/v2:computeRoutes', { body, ...options });
  }
}

/**
 * Information related to how and why a fallback result was used. If this field is
 * set, then it means the server used a different routing mode from your preferred
 * mode as fallback.
 */
export interface FallbackInfo {
  /**
   * The reason why fallback response was used instead of the original response. This
   * field is only populated when the fallback mode is triggered and the fallback
   * response is returned.
   */
  reason?: number;

  /**
   * Routing mode used for the response. If fallback was triggered, the mode may be
   * different from routing preference set in the original client request.
   */
  routingMode?: number;
}

/**
 * Details about the locations used as waypoints. Only populated for address
 * waypoints. Includes details about the geocoding results for the purposes of
 * determining what the address was geocoded to.
 */
export interface GeocodedWaypoint {
  /**
   * The `Status` type defines a logical error model that is suitable for different
   * programming environments, including REST APIs and RPC APIs. It is used by
   * [gRPC](https://github.com/grpc). Each `Status` message contains three pieces of
   * data: error code, error message, and error details. You can find out more about
   * this error model and how to work with it in the
   * [API Design Guide](https://cloud.google.com/apis/design/errors).
   */
  geocoderStatus?: DistanceMatrixAPI.Status;

  /**
   * The index of the corresponding intermediate waypoint in the request. Only
   * populated if the corresponding waypoint is an intermediate waypoint.
   */
  intermediateWaypointRequestIndex?: number;

  /**
   * Indicates that the geocoder did not return an exact match for the original
   * request, though it was able to match part of the requested address. You may wish
   * to examine the original request for misspellings and/or an incomplete address.
   */
  partialMatch?: boolean;

  /**
   * The place ID for this result.
   */
  placeId?: string;

  /**
   * The type(s) of the result, in the form of zero or more type tags. Supported
   * types:
   * [Address types and address component types](https://developers.google.com/maps/documentation/geocoding/requests-geocoding#Types).
   */
  type?: Array<string>;
}

/**
 * An object that represents a latitude/longitude pair. This is expressed as a pair
 * of doubles to represent degrees latitude and degrees longitude. Unless specified
 * otherwise, this must conform to the
 * <a href="http://www.unoosa.org/pdf/icg/2012/template/WGS_84.pdf">WGS84
 * standard</a>. Values must be within normalized ranges.
 */
export interface LatLng {
  /**
   * The latitude in degrees. It must be in the range [-90.0, +90.0].
   */
  latitude?: number;

  /**
   * The longitude in degrees. It must be in the range [-180.0, +180.0].
   */
  longitude?: number;
}

/**
 * Localized description of time.
 */
export interface LocalizedTime {
  /**
   * Localized variant of a text in a particular language.
   */
  time?: DistanceMatrixAPI.LocalizedText;

  /**
   * Contains the time zone. The value is the name of the time zone as defined in the
   * [IANA Time Zone Database](http://www.iana.org/time-zones), e.g.
   * "America/New_York".
   */
  timeZone?: string;
}

/**
 * Encapsulates a location (a geographic point, and an optional heading).
 */
export interface Location {
  /**
   * The compass heading associated with the direction of the flow of traffic. This
   * value specifies the side of the road for pickup and drop-off. Heading values can
   * be from 0 to 360, where 0 specifies a heading of due North, 90 specifies a
   * heading of due East, and so on. You can use this field only for `DRIVE` and
   * `TWO_WHEELER` [`RouteTravelMode`][google.maps.routing.v2.RouteTravelMode].
   */
  heading?: number;

  /**
   * An object that represents a latitude/longitude pair. This is expressed as a pair
   * of doubles to represent degrees latitude and degrees longitude. Unless specified
   * otherwise, this must conform to the
   * <a href="http://www.unoosa.org/pdf/icg/2012/template/WGS_84.pdf">WGS84
   * standard</a>. Values must be within normalized ranges.
   */
  latLng?: LatLng;
}

/**
 * Encapsulates navigation instructions for a
 * [`RouteLegStep`][google.maps.routing.v2.RouteLegStep].
 */
export interface NavigationInstruction {
  /**
   * Instructions for navigating this step.
   */
  instructions?: string;

  /**
   * Encapsulates the navigation instructions for the current step (for example, turn
   * left, merge, or straight). This field determines which icon to display.
   */
  maneuver?: number;
}

/**
 * Encapsulates an encoded polyline.
 */
export interface Polyline {
  /**
   * The string encoding of the polyline using the
   * [polyline encoding algorithm](https://developers.google.com/maps/documentation/utilities/polylinealgorithm)
   */
  encodedPolyline?: string;

  /**
   * Specifies a polyline using the
   * [GeoJSON LineString format](https://tools.ietf.org/html/rfc7946#section-3.1.4).
   */
  geoJsonLinestring?: unknown;
}

/**
 * Encapsulates the start and end indexes for a polyline detail. For instances
 * where the data corresponds to a single point, `start_index` and `end_index` will
 * be equal.
 */
export interface PolylinePointIndex {
  /**
   * The end index of this detail in the polyline.
   */
  endIndex?: number;

  /**
   * The start index of this detail in the polyline.
   */
  startIndex?: number;
}

/**
 * Encapsulates a set of optional conditions to satisfy when calculating the
 * routes.
 */
export interface RouteModifiers {
  /**
   * When set to true, avoids ferries where reasonable, giving preference to routes
   * not containing ferries. Applies only to the `DRIVE` and`TWO_WHEELER`
   * [`RouteTravelMode`][google.maps.routing.v2.RouteTravelMode].
   */
  avoidFerries?: boolean;

  /**
   * When set to true, avoids highways where reasonable, giving preference to routes
   * not containing highways. Applies only to the `DRIVE` and `TWO_WHEELER`
   * [`RouteTravelMode`][google.maps.routing.v2.RouteTravelMode].
   */
  avoidHighways?: boolean;

  /**
   * When set to true, avoids navigating indoors where reasonable, giving preference
   * to routes not containing indoor navigation. Applies only to the `WALK`
   * [`RouteTravelMode`][google.maps.routing.v2.RouteTravelMode].
   */
  avoidIndoor?: boolean;

  /**
   * When set to true, avoids toll roads where reasonable, giving preference to
   * routes not containing toll roads. Applies only to the `DRIVE` and `TWO_WHEELER`
   * [`RouteTravelMode`][google.maps.routing.v2.RouteTravelMode].
   */
  avoidTolls?: boolean;

  /**
   * Encapsulates information about toll passes. If toll passes are provided, the API
   * tries to return the pass price. If toll passes are not provided, the API treats
   * the toll pass as unknown and tries to return the cash price. Applies only to the
   * `DRIVE` and `TWO_WHEELER`
   * [`RouteTravelMode`][google.maps.routing.v2.RouteTravelMode].
   */
  tollPasses?: Array<number>;

  /**
   * Contains the vehicle information, such as the vehicle emission type.
   */
  vehicleInfo?: RouteModifiers.VehicleInfo;
}

export namespace RouteModifiers {
  /**
   * Contains the vehicle information, such as the vehicle emission type.
   */
  export interface VehicleInfo {
    /**
     * Describes the vehicle's emission type. Applies only to the `DRIVE`
     * [`RouteTravelMode`][google.maps.routing.v2.RouteTravelMode].
     */
    emissionType?: number;
  }
}

/**
 * Preferences for `TRANSIT` based routes that influence the route that is
 * returned.
 */
export interface TransitPreferences {
  /**
   * A set of travel modes to use when getting a `TRANSIT` route. Defaults to all
   * supported modes of travel.
   */
  allowedTravelModes?: Array<number>;

  /**
   * A routing preference that, when specified, influences the `TRANSIT` route
   * returned.
   */
  routingPreference?: number;
}

/**
 * Information about a transit stop.
 */
export interface TransitStop {
  /**
   * Encapsulates a location (a geographic point, and an optional heading).
   */
  location?: Location;

  /**
   * The name of the transit stop.
   */
  name?: string;
}

/**
 * Encapsulates a waypoint. Waypoints mark both the beginning and end of a route,
 * and include intermediate stops along the route.
 */
export interface Waypoint {
  /**
   * Human readable address or a plus code. See https://plus.codes for details.
   */
  address?: string;

  /**
   * Encapsulates a location (a geographic point, and an optional heading).
   */
  location?: Location;

  /**
   * The POI Place ID associated with the waypoint.
   */
  placeId?: string;

  /**
   * Indicates that the location of this waypoint is meant to have a preference for
   * the vehicle to stop at a particular side of road. When you set this value, the
   * route will pass through the location so that the vehicle can stop at the side of
   * road that the location is biased towards from the center of the road. This
   * option works only for `DRIVE` and `TWO_WHEELER`
   * [`RouteTravelMode`][google.maps.routing.v2.RouteTravelMode].
   */
  sideOfRoad?: boolean;

  /**
   * Indicates that the waypoint is meant for vehicles to stop at, where the
   * intention is to either pickup or drop-off. When you set this value, the
   * calculated route won't include non-`via` waypoints on roads that are unsuitable
   * for pickup and drop-off. This option works only for `DRIVE` and `TWO_WHEELER`
   * travel modes, and when the `location_type` is
   * [`Location`][google.maps.routing.v2.Location].
   */
  vehicleStopover?: boolean;

  /**
   * Marks this waypoint as a milestone rather a stopping point. For each non-via
   * waypoint in the request, the response appends an entry to the
   * [`legs`][google.maps.routing.v2.Route.legs] array to provide the details for
   * stopovers on that leg of the trip. Set this value to true when you want the
   * route to pass through this waypoint without stopping over. Via waypoints don't
   * cause an entry to be added to the `legs` array, but they do route the journey
   * through the waypoint. You can only set this value on waypoints that are
   * intermediates. The request fails if you set this field on terminal waypoints. If
   * `ComputeRoutesRequest.optimize_waypoint_order` is set to true then this field
   * cannot be set to true; otherwise, the request fails.
   */
  via?: boolean;
}

/**
 * ComputeRoutes the response message.
 */
export interface DirectionComputeRoutesResponse {
  /**
   * Information related to how and why a fallback result was used. If this field is
   * set, then it means the server used a different routing mode from your preferred
   * mode as fallback.
   */
  fallbackInfo?: FallbackInfo;

  /**
   * Contains [`GeocodedWaypoints`][google.maps.routing.v2.GeocodedWaypoint] for
   * origin, destination and intermediate waypoints. Only populated for address
   * waypoints.
   */
  geocodingResults?: DirectionComputeRoutesResponse.GeocodingResults;

  /**
   * Contains an array of computed routes (up to three) when you specify
   * `compute_alternatives_routes`, and contains just one route when you don't. When
   * this array contains multiple entries, the first one is the most recommended
   * route. If the array is empty, then it means no route could be found.
   */
  routes?: Array<DirectionComputeRoutesResponse.Route>;
}

export namespace DirectionComputeRoutesResponse {
  /**
   * Contains [`GeocodedWaypoints`][google.maps.routing.v2.GeocodedWaypoint] for
   * origin, destination and intermediate waypoints. Only populated for address
   * waypoints.
   */
  export interface GeocodingResults {
    /**
     * Details about the locations used as waypoints. Only populated for address
     * waypoints. Includes details about the geocoding results for the purposes of
     * determining what the address was geocoded to.
     */
    destination?: DirectionsAPI.GeocodedWaypoint;

    /**
     * A list of intermediate geocoded waypoints each containing an index field that
     * corresponds to the zero-based position of the waypoint in the order they were
     * specified in the request.
     */
    intermediates?: Array<DirectionsAPI.GeocodedWaypoint>;

    /**
     * Details about the locations used as waypoints. Only populated for address
     * waypoints. Includes details about the geocoding results for the purposes of
     * determining what the address was geocoded to.
     */
    origin?: DirectionsAPI.GeocodedWaypoint;
  }

  /**
   * Contains a route, which consists of a series of connected road segments that
   * join beginning, ending, and intermediate waypoints.
   */
  export interface Route {
    /**
     * A description of the route.
     */
    description?: string;

    /**
     * The travel distance of the route, in meters.
     */
    distanceMeters?: number;

    /**
     * The length of time needed to navigate the route. If you set the
     * `routing_preference` to `TRAFFIC_UNAWARE`, then this value is the same as
     * `static_duration`. If you set the `routing_preference` to either `TRAFFIC_AWARE`
     * or `TRAFFIC_AWARE_OPTIMAL`, then this value is calculated taking traffic
     * conditions into account.
     */
    duration?: string;

    /**
     * A collection of legs (path segments between waypoints) that make up the route.
     * Each leg corresponds to the trip between two non-`via`
     * [`Waypoints`][google.maps.routing.v2.Waypoint]. For example, a route with no
     * intermediate waypoints has only one leg. A route that includes one non-`via`
     * intermediate waypoint has two legs. A route that includes one `via` intermediate
     * waypoint has one leg. The order of the legs matches the order of waypoints from
     * `origin` to `intermediates` to `destination`.
     */
    legs?: Array<Route.Leg>;

    /**
     * Text representations of certain properties.
     */
    localizedValues?: Route.LocalizedValues;

    /**
     * If you set
     * [`optimize_waypoint_order`][google.maps.routing.v2.ComputeRoutesRequest.optimize_waypoint_order]
     * to true, this field contains the optimized ordering of intermediate waypoints.
     * Otherwise, this field is empty. For example, if you give an input of Origin: LA;
     * Intermediate waypoints: Dallas, Bangor, Phoenix; Destination: New York; and the
     * optimized intermediate waypoint order is Phoenix, Dallas, Bangor, then this
     * field contains the values [2, 0, 1]. The index starts with 0 for the first
     * intermediate waypoint provided in the input.
     */
    optimizedIntermediateWaypointIndex?: Array<number>;

    /**
     * Encapsulates an encoded polyline.
     */
    polyline?: DirectionsAPI.Polyline;

    /**
     * Details corresponding to a given index or contiguous segment of a polyline.
     * Given a polyline with points P_0, P_1, ... , P_N (zero-based index), the
     * `PolylineDetails` defines an interval and associated metadata.
     */
    polylineDetails?: Route.PolylineDetails;

    /**
     * Labels for the `Route` that are useful to identify specific properties of the
     * route to compare against others.
     */
    routeLabels?: Array<number>;

    /**
     * An opaque token that can be passed to
     * [Navigation SDK](https://developers.google.com/maps/documentation/navigation) to
     * reconstruct the route during navigation, and, in the event of rerouting, honor
     * the original intention when the route was created. Treat this token as an opaque
     * blob. Don't compare its value across requests as its value may change even if
     * the service returns the exact same route.
     *
     * NOTE: `Route.route_token` is only available for requests that have set
     * `ComputeRoutesRequest.routing_preference` to `TRAFFIC_AWARE` or
     * `TRAFFIC_AWARE_OPTIMAL`. `Route.route_token` is not supported for requests that
     * have Via waypoints.
     */
    routeToken?: string;

    /**
     * The duration of travel through the route without taking traffic conditions into
     * consideration.
     */
    staticDuration?: string;

    /**
     * Contains the additional information that the user should be informed about, such
     * as possible traffic zone restrictions.
     */
    travelAdvisory?: DistanceMatrixAPI.RouteTravelAdvisory;

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
    viewport?: Route.Viewport;

    /**
     * An array of warnings to show when displaying the route.
     */
    warnings?: Array<string>;
  }

  export namespace Route {
    /**
     * Contains a segment between non-`via` waypoints.
     */
    export interface Leg {
      /**
       * The travel distance of the route leg, in meters.
       */
      distanceMeters?: number;

      /**
       * The length of time needed to navigate the leg. If the `route_preference` is set
       * to `TRAFFIC_UNAWARE`, then this value is the same as `static_duration`. If the
       * `route_preference` is either `TRAFFIC_AWARE` or `TRAFFIC_AWARE_OPTIMAL`, then
       * this value is calculated taking traffic conditions into account.
       */
      duration?: string;

      /**
       * Encapsulates a location (a geographic point, and an optional heading).
       */
      endLocation?: DirectionsAPI.Location;

      /**
       * Text representations of certain properties.
       */
      localizedValues?: Leg.LocalizedValues;

      /**
       * Encapsulates an encoded polyline.
       */
      polyline?: DirectionsAPI.Polyline;

      /**
       * Encapsulates a location (a geographic point, and an optional heading).
       */
      startLocation?: DirectionsAPI.Location;

      /**
       * The duration of travel through the leg, calculated without taking traffic
       * conditions into consideration.
       */
      staticDuration?: string;

      /**
       * An array of steps denoting segments within this leg. Each step represents one
       * navigation instruction.
       */
      steps?: Array<Leg.Step>;

      /**
       * Provides overview information about a list of `RouteLegStep`s.
       */
      stepsOverview?: Leg.StepsOverview;

      /**
       * Contains the additional information that the user should be informed about on a
       * leg step, such as possible traffic zone restrictions.
       */
      travelAdvisory?: Leg.TravelAdvisory;
    }

    export namespace Leg {
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
      }

      /**
       * Contains a segment of a [`RouteLeg`][google.maps.routing.v2.RouteLeg]. A step
       * corresponds to a single navigation instruction. Route legs are made up of steps.
       */
      export interface Step {
        /**
         * The travel distance of this step, in meters. In some circumstances, this field
         * might not have a value.
         */
        distanceMeters?: number;

        /**
         * Encapsulates a location (a geographic point, and an optional heading).
         */
        endLocation?: DirectionsAPI.Location;

        /**
         * Text representations of certain properties.
         */
        localizedValues?: Step.LocalizedValues;

        /**
         * Encapsulates navigation instructions for a
         * [`RouteLegStep`][google.maps.routing.v2.RouteLegStep].
         */
        navigationInstruction?: DirectionsAPI.NavigationInstruction;

        /**
         * Encapsulates an encoded polyline.
         */
        polyline?: DirectionsAPI.Polyline;

        /**
         * Encapsulates a location (a geographic point, and an optional heading).
         */
        startLocation?: DirectionsAPI.Location;

        /**
         * The duration of travel through this step without taking traffic conditions into
         * consideration. In some circumstances, this field might not have a value.
         */
        staticDuration?: string;

        /**
         * Additional information for the `RouteLegStep` related to `TRANSIT` routes.
         */
        transitDetails?: Step.TransitDetails;

        /**
         * Contains the additional information that the user should be informed about, such
         * as possible traffic zone restrictions on a leg step.
         */
        travelAdvisory?: Step.TravelAdvisory;

        /**
         * The travel mode used for this step.
         */
        travelMode?: number;
      }

      export namespace Step {
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
          staticDuration?: DistanceMatrixAPI.LocalizedText;
        }

        /**
         * Additional information for the `RouteLegStep` related to `TRANSIT` routes.
         */
        export interface TransitDetails {
          /**
           * Specifies the direction in which to travel on this line as marked on the vehicle
           * or at the departure stop. The direction is often the terminus station.
           */
          headsign?: string;

          /**
           * Specifies the expected time as a duration between departures from the same stop
           * at this time. For example, with a headway seconds value of 600, you would expect
           * a ten minute wait if you should miss your bus.
           */
          headway?: string;

          /**
           * Localized descriptions of values for `RouteTransitDetails`.
           */
          localizedValues?: TransitDetails.LocalizedValues;

          /**
           * The number of stops from the departure to the arrival stop. This count includes
           * the arrival stop, but excludes the departure stop. For example, if your route
           * leaves from Stop A, passes through stops B and C, and arrives at stop D,
           * <code>stop_count</code> returns 3.
           */
          stopCount?: number;

          /**
           * Details about the transit stops for the `RouteLegStep`.
           */
          stopDetails?: TransitDetails.StopDetails;

          /**
           * Contains information about the transit line used in this step.
           */
          transitLine?: TransitDetails.TransitLine;

          /**
           * The text that appears in schedules and sign boards to identify a transit trip to
           * passengers. The text should uniquely identify a trip within a service day. For
           * example, "538" is the `trip_short_text` of the Amtrak train that leaves San
           * Jose, CA at 15:10 on weekdays to Sacramento, CA.
           */
          tripShortText?: string;
        }

        export namespace TransitDetails {
          /**
           * Localized descriptions of values for `RouteTransitDetails`.
           */
          export interface LocalizedValues {
            /**
             * Localized description of time.
             */
            arrivalTime?: DirectionsAPI.LocalizedTime;

            /**
             * Localized description of time.
             */
            departureTime?: DirectionsAPI.LocalizedTime;
          }

          /**
           * Details about the transit stops for the `RouteLegStep`.
           */
          export interface StopDetails {
            /**
             * Information about a transit stop.
             */
            arrivalStop?: DirectionsAPI.TransitStop;

            /**
             * The estimated time of arrival for the step.
             */
            arrivalTime?: string;

            /**
             * Information about a transit stop.
             */
            departureStop?: DirectionsAPI.TransitStop;

            /**
             * The estimated time of departure for the step.
             */
            departureTime?: string;
          }

          /**
           * Contains information about the transit line used in this step.
           */
          export interface TransitLine {
            /**
             * The transit agency (or agencies) that operates this transit line.
             */
            agencies?: Array<TransitLine.Agency>;

            /**
             * The color commonly used in signage for this line. Represented in hexadecimal.
             */
            color?: string;

            /**
             * The URI for the icon associated with this line.
             */
            iconUri?: string;

            /**
             * The full name of this transit line, For example, "8 Avenue Local".
             */
            name?: string;

            /**
             * The short name of this transit line. This name will normally be a line number,
             * such as "M7" or "355".
             */
            nameShort?: string;

            /**
             * The color commonly used in text on signage for this line. Represented in
             * hexadecimal.
             */
            textColor?: string;

            /**
             * the URI for this transit line as provided by the transit agency.
             */
            uri?: string;

            /**
             * Information about a vehicle used in transit routes.
             */
            vehicle?: TransitLine.Vehicle;
          }

          export namespace TransitLine {
            /**
             * A transit agency that operates a transit line.
             */
            export interface Agency {
              /**
               * The name of this transit agency.
               */
              name?: string;

              /**
               * The transit agency's locale-specific formatted phone number.
               */
              phoneNumber?: string;

              /**
               * The transit agency's URI.
               */
              uri?: string;
            }

            /**
             * Information about a vehicle used in transit routes.
             */
            export interface Vehicle {
              /**
               * The URI for an icon associated with this vehicle type.
               */
              iconUri?: string;

              /**
               * The URI for the icon associated with this vehicle type, based on the local
               * transport signage.
               */
              localIconUri?: string;

              /**
               * Localized variant of a text in a particular language.
               */
              name?: DistanceMatrixAPI.LocalizedText;

              /**
               * The type of vehicle used.
               */
              type?: number;
            }
          }
        }

        /**
         * Contains the additional information that the user should be informed about, such
         * as possible traffic zone restrictions on a leg step.
         */
        export interface TravelAdvisory {
          /**
           * NOTE: This field is not currently populated.
           */
          speedReadingIntervals?: Array<DistanceMatrixAPI.SpeedReadingInterval>;
        }
      }

      /**
       * Provides overview information about a list of `RouteLegStep`s.
       */
      export interface StepsOverview {
        /**
         * Summarized information about different multi-modal segments of the
         * `RouteLeg.steps`. This field is not populated if the `RouteLeg` does not contain
         * any multi-modal segments in the steps.
         */
        multiModalSegments?: Array<StepsOverview.MultiModalSegment>;
      }

      export namespace StepsOverview {
        /**
         * Provides summarized information about different multi-modal segments of the
         * `RouteLeg.steps`. A multi-modal segment is defined as one or more contiguous
         * `RouteLegStep` that have the same `RouteTravelMode`. This field is not populated
         * if the `RouteLeg` does not contain any multi-modal segments in the steps.
         */
        export interface MultiModalSegment {
          /**
           * Encapsulates navigation instructions for a
           * [`RouteLegStep`][google.maps.routing.v2.RouteLegStep].
           */
          navigationInstruction?: DirectionsAPI.NavigationInstruction;

          /**
           * The corresponding `RouteLegStep` index that is the end of a multi-modal segment.
           */
          stepEndIndex?: number;

          /**
           * The corresponding `RouteLegStep` index that is the start of a multi-modal
           * segment.
           */
          stepStartIndex?: number;

          /**
           * The travel mode of the multi-modal segment.
           */
          travelMode?: number;
        }
      }

      /**
       * Contains the additional information that the user should be informed about on a
       * leg step, such as possible traffic zone restrictions.
       */
      export interface TravelAdvisory {
        /**
         * Speed reading intervals detailing traffic density. Applicable in case of
         * `TRAFFIC_AWARE` and `TRAFFIC_AWARE_OPTIMAL` routing preferences. The intervals
         * cover the entire polyline of the `RouteLeg` without overlap. The start point of
         * a specified interval is the same as the end point of the preceding interval.
         *
         * Example:
         *
         *      polyline: A ---- B ---- C ---- D ---- E ---- F ---- G
         *      speed_reading_intervals: [A,C), [C,D), [D,G).
         */
        speedReadingIntervals?: Array<DistanceMatrixAPI.SpeedReadingInterval>;

        /**
         * Encapsulates toll information on a [`Route`][google.maps.routing.v2.Route] or on
         * a [`RouteLeg`][google.maps.routing.v2.RouteLeg].
         */
        tollInfo?: DistanceMatrixAPI.TollInfo;
      }
    }

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

    /**
     * Details corresponding to a given index or contiguous segment of a polyline.
     * Given a polyline with points P_0, P_1, ... , P_N (zero-based index), the
     * `PolylineDetails` defines an interval and associated metadata.
     */
    export interface PolylineDetails {
      /**
       * Flyover details along the polyline.
       */
      flyoverInfo?: Array<PolylineDetails.FlyoverInfo>;

      /**
       * Narrow road details along the polyline.
       */
      narrowRoadInfo?: Array<PolylineDetails.NarrowRoadInfo>;
    }

    export namespace PolylineDetails {
      /**
       * Encapsulates information about flyovers along the polyline.
       */
      export interface FlyoverInfo {
        /**
         * Output only. Denotes whether a flyover exists for a given stretch of the
         * polyline.
         */
        flyoverPresence?: number;

        /**
         * Encapsulates the start and end indexes for a polyline detail. For instances
         * where the data corresponds to a single point, `start_index` and `end_index` will
         * be equal.
         */
        polylinePointIndex?: DirectionsAPI.PolylinePointIndex;
      }

      /**
       * Encapsulates information about narrow roads along the polyline.
       */
      export interface NarrowRoadInfo {
        /**
         * Output only. Denotes whether a narrow road exists for a given stretch of the
         * polyline.
         */
        narrowRoadPresence?: number;

        /**
         * Encapsulates the start and end indexes for a polyline detail. For instances
         * where the data corresponds to a single point, `start_index` and `end_index` will
         * be equal.
         */
        polylinePointIndex?: DirectionsAPI.PolylinePointIndex;
      }
    }

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
    export interface Viewport {
      /**
       * An object that represents a latitude/longitude pair. This is expressed as a pair
       * of doubles to represent degrees latitude and degrees longitude. Unless specified
       * otherwise, this must conform to the
       * <a href="http://www.unoosa.org/pdf/icg/2012/template/WGS_84.pdf">WGS84
       * standard</a>. Values must be within normalized ranges.
       */
      high?: DirectionsAPI.LatLng;

      /**
       * An object that represents a latitude/longitude pair. This is expressed as a pair
       * of doubles to represent degrees latitude and degrees longitude. Unless specified
       * otherwise, this must conform to the
       * <a href="http://www.unoosa.org/pdf/icg/2012/template/WGS_84.pdf">WGS84
       * standard</a>. Values must be within normalized ranges.
       */
      low?: DirectionsAPI.LatLng;
    }
  }
}

export interface DirectionComputeRoutesParams {
  /**
   * Encapsulates a waypoint. Waypoints mark both the beginning and end of a route,
   * and include intermediate stops along the route.
   */
  destination: Waypoint;

  /**
   * Encapsulates a waypoint. Waypoints mark both the beginning and end of a route,
   * and include intermediate stops along the route.
   */
  origin: Waypoint;

  /**
   * Optional. The arrival time. NOTE: Can only be set when
   * [RouteTravelMode][google.maps.routing.v2.RouteTravelMode] is set to `TRANSIT`.
   * You can specify either `departure_time` or `arrival_time`, but not both. Transit
   * trips are available for up to 7 days in the past or 100 days in the future.
   */
  arrivalTime?: string;

  /**
   * Optional. Specifies whether to calculate alternate routes in addition to the
   * route. No alternative routes are returned for requests that have intermediate
   * waypoints.
   */
  computeAlternativeRoutes?: boolean;

  /**
   * Optional. The departure time. If you don't set this value, then this value
   * defaults to the time that you made the request. NOTE: You can only specify a
   * `departure_time` in the past when
   * [`RouteTravelMode`][google.maps.routing.v2.RouteTravelMode] is set to `TRANSIT`.
   * Transit trips are available for up to 7 days in the past or 100 days in the
   * future.
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
   * Optional. A set of waypoints along the route (excluding terminal points), for
   * either stopping at or passing by. Up to 25 intermediate waypoints are supported.
   */
  intermediates?: Array<Waypoint>;

  /**
   * Optional. The BCP-47 language code, such as "en-US" or "sr-Latn". For more
   * information, see
   * [Unicode Locale Identifier](http://www.unicode.org/reports/tr35/#Unicode_locale_identifier).
   * See [Language Support](https://developers.google.com/maps/faq#languagesupport)
   * for the list of supported languages. When you don't provide this value, the
   * display language is inferred from the location of the route request.
   */
  languageCode?: string;

  /**
   * Optional. If set to true, the service attempts to minimize the overall cost of
   * the route by re-ordering the specified intermediate waypoints. The request fails
   * if any of the intermediate waypoints is a `via` waypoint. Use
   * `ComputeRoutesResponse.Routes.optimized_intermediate_waypoint_index` to find the
   * new ordering. If
   * `ComputeRoutesResponseroutes.optimized_intermediate_waypoint_index` is not
   * requested in the `X-Goog-FieldMask` header, the request fails. If
   * `optimize_waypoint_order` is set to false,
   * `ComputeRoutesResponse.optimized_intermediate_waypoint_index` will be empty.
   */
  optimizeWaypointOrder?: boolean;

  /**
   * Optional. Specifies the preferred encoding for the polyline.
   */
  polylineEncoding?: number;

  /**
   * Optional. Specifies your preference for the quality of the polyline.
   */
  polylineQuality?: number;

  /**
   * Optional. The region code, specified as a ccTLD ("top-level domain")
   * two-character value. For more information see
   * [Country code top-level domains](https://en.wikipedia.org/wiki/List_of_Internet_top-level_domains#Country_code_top-level_domains).
   */
  regionCode?: string;

  /**
   * Optional. Specifies what reference routes to calculate as part of the request in
   * addition to the default route. A reference route is a route with a different
   * route calculation objective than the default route. For example a
   * `FUEL_EFFICIENT` reference route calculation takes into account various
   * parameters that would generate an optimal fuel efficient route. When using this
   * feature, look for [`route_labels`][google.maps.routing.v2.Route.route_labels] on
   * the resulting routes.
   */
  requestedReferenceRoutes?: Array<number>;

  /**
   * Encapsulates a set of optional conditions to satisfy when calculating the
   * routes.
   */
  routeModifiers?: RouteModifiers;

  /**
   * Optional. Specifies how to compute the route. The server attempts to use the
   * selected routing preference to compute the route. If the routing preference
   * results in an error or an extra long latency, then an error is returned. You can
   * specify this option only when the `travel_mode` is `DRIVE` or `TWO_WHEELER`,
   * otherwise the request fails.
   */
  routingPreference?: number;

  /**
   * Optional. Specifies the assumptions to use when calculating time in traffic.
   * This setting affects the value returned in the duration field in the
   * [`Route`][google.maps.routing.v2.Route] and
   * [`RouteLeg`][google.maps.routing.v2.RouteLeg] which contains the predicted time
   * in traffic based on historical averages. `TrafficModel` is only available for
   * requests that have set
   * [`RoutingPreference`][google.maps.routing.v2.RoutingPreference] to
   * `TRAFFIC_AWARE_OPTIMAL` and
   * [`RouteTravelMode`][google.maps.routing.v2.RouteTravelMode] to `DRIVE`. Defaults
   * to `BEST_GUESS` if traffic is requested and `TrafficModel` is not specified.
   */
  trafficModel?: number;

  /**
   * Preferences for `TRANSIT` based routes that influence the route that is
   * returned.
   */
  transitPreferences?: TransitPreferences;

  /**
   * Optional. Specifies the mode of transportation.
   */
  travelMode?: number;

  /**
   * Optional. Specifies the units of measure for the display fields. These fields
   * include the `instruction` field in
   * [`NavigationInstruction`][google.maps.routing.v2.NavigationInstruction]. The
   * units of measure used for the route, leg, step distance, and duration are not
   * affected by this value. If you don't provide this value, then the display units
   * are inferred from the location of the first origin.
   */
  units?: number;
}

export declare namespace Directions {
  export {
    type FallbackInfo as FallbackInfo,
    type GeocodedWaypoint as GeocodedWaypoint,
    type LatLng as LatLng,
    type LocalizedTime as LocalizedTime,
    type Location as Location,
    type NavigationInstruction as NavigationInstruction,
    type Polyline as Polyline,
    type PolylinePointIndex as PolylinePointIndex,
    type RouteModifiers as RouteModifiers,
    type TransitPreferences as TransitPreferences,
    type TransitStop as TransitStop,
    type Waypoint as Waypoint,
    type DirectionComputeRoutesResponse as DirectionComputeRoutesResponse,
    type DirectionComputeRoutesParams as DirectionComputeRoutesParams,
  };
}
