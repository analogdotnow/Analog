// Google Routes API v2 – directions/v2:computeRoutes
// Enums replaced with string unions. Includes audit-driven fixes and JSDoc constraints.

// ===== Common primitives =====
export interface LatLng {
  latitude?: number;
  longitude?: number;
}

/**
 * Required by API. Box with two opposite corners. Must not be empty.
 */
export interface Viewport {
  low: LatLng;
  high: LatLng;
}

export interface LocalizedText {
  text?: string;
  languageCode?: string;
}

/** google.rpc.Status */
export interface Status {
  code?: number;
  message?: string;
  details?: Array<Record<string, unknown>>;
}

/** Money amounts; units are integer decimal units as string; nanos are fractional */
export interface Money {
  currencyCode?: string;
  units?: string;
  nanos?: number;
}

// ===== String literal unions (instead of enums) =====
export type RouteTravelMode =
  | "TRAVEL_MODE_UNSPECIFIED"
  | "DRIVE"
  | "BICYCLE"
  | "WALK"
  | "TWO_WHEELER"
  | "TRANSIT";

export type RoutingPreference =
  | "ROUTING_PREFERENCE_UNSPECIFIED"
  | "TRAFFIC_UNAWARE"
  | "TRAFFIC_AWARE"
  | "TRAFFIC_AWARE_OPTIMAL";

export type PolylineQuality =
  | "POLYLINE_QUALITY_UNSPECIFIED"
  | "HIGH_QUALITY"
  | "OVERVIEW";

export type PolylineEncoding =
  | "POLYLINE_ENCODING_UNSPECIFIED"
  | "ENCODED_POLYLINE"
  | "GEO_JSON_LINESTRING";

export type Units = "UNITS_UNSPECIFIED" | "METRIC" | "IMPERIAL";

export type ReferenceRoute =
  | "REFERENCE_ROUTE_UNSPECIFIED"
  | "FUEL_EFFICIENT"
  | "SHORTER_DISTANCE"; // experimental; incompatible with via waypoints & optimizeWaypointOrder

export type ExtraComputation =
  | "EXTRA_COMPUTATION_UNSPECIFIED"
  | "TOLLS"
  | "FUEL_CONSUMPTION"
  | "TRAFFIC_ON_POLYLINE"
  | "HTML_FORMATTED_NAVIGATION_INSTRUCTIONS"
  | "FLYOVER_INFO_ON_POLYLINE"
  | "NARROW_ROAD_INFO_ON_POLYLINE";

export type TrafficModel =
  | "TRAFFIC_MODEL_UNSPECIFIED"
  | "BEST_GUESS"
  | "OPTIMISTIC"
  | "PESSIMISTIC"; // Only valid with routingPreference=TRAFFIC_AWARE_OPTIMAL and travelMode=DRIVE

export type Maneuver =
  | "MANEUVER_UNSPECIFIED"
  | "TURN_SLIGHT_LEFT"
  | "TURN_SHARP_LEFT"
  | "UTURN_LEFT"
  | "TURN_LEFT"
  | "TURN_SLIGHT_RIGHT"
  | "TURN_SHARP_RIGHT"
  | "UTURN_RIGHT"
  | "TURN_RIGHT"
  | "STRAIGHT"
  | "RAMP_LEFT"
  | "RAMP_RIGHT"
  | "MERGE"
  | "FORK_LEFT"
  | "FORK_RIGHT"
  | "FERRY"
  | "FERRY_TRAIN"
  | "ROUNDABOUT_LEFT"
  | "ROUNDABOUT_RIGHT"
  | "DEPART"
  | "NAME_CHANGE";

export type TransitVehicleType =
  | "TRANSIT_VEHICLE_TYPE_UNSPECIFIED"
  | "BUS"
  | "CABLE_CAR"
  | "COMMUTER_TRAIN"
  | "FERRY"
  | "FUNICULAR"
  | "GONDOLA_LIFT"
  | "HEAVY_RAIL"
  | "HIGH_SPEED_TRAIN"
  | "INTERCITY_BUS"
  | "LONG_DISTANCE_TRAIN"
  | "METRO_RAIL"
  | "MONORAIL"
  | "OTHER"
  | "RAIL"
  | "SHARE_TAXI"
  | "SUBWAY"
  | "TRAM"
  | "TROLLEYBUS";

export type RoadFeatureState =
  | "ROAD_FEATURE_STATE_UNSPECIFIED"
  | "EXISTS"
  | "DOES_NOT_EXIST";

export type RouteLabel =
  | "ROUTE_LABEL_UNSPECIFIED"
  | "DEFAULT_ROUTE"
  | "DEFAULT_ROUTE_ALTERNATE"
  | "FUEL_EFFICIENT"
  | "SHORTER_DISTANCE";

export type VehicleEmissionType =
  | "VEHICLE_EMISSION_TYPE_UNSPECIFIED"
  | "GASOLINE"
  | "ELECTRIC"
  | "HYBRID"
  | "DIESEL";

export type TransitTravelMode =
  | "TRANSIT_TRAVEL_MODE_UNSPECIFIED"
  | "BUS"
  | "SUBWAY"
  | "TRAIN"
  | "LIGHT_RAIL"
  | "RAIL";

export type TransitRoutingPreference =
  | "TRANSIT_ROUTING_PREFERENCE_UNSPECIFIED"
  | "LESS_WALKING"
  | "FEWER_TRANSFERS";

export type SpeedReadingSpeed =
  | "SPEED_UNSPECIFIED"
  | "NORMAL"
  | "SLOW"
  | "TRAFFIC_JAM";

export type FallbackRoutingMode =
  | "FALLBACK_ROUTING_MODE_UNSPECIFIED"
  | "FALLBACK_TRAFFIC_UNAWARE"
  | "FALLBACK_TRAFFIC_AWARE";

export type FallbackReason =
  | "FALLBACK_REASON_UNSPECIFIED"
  | "SERVER_ERROR"
  | "LATENCY_EXCEEDED";

// ===== Request/Response =====
export interface ComputeRoutesRequest {
  origin: Waypoint; // Required
  destination: Waypoint; // Required
  intermediates?: Waypoint[]; // up to 25
  travelMode?: RouteTravelMode;
  routingPreference?: RoutingPreference;
  polylineQuality?: PolylineQuality;
  polylineEncoding?: PolylineEncoding;
  /** RFC 3339; only past for TRANSIT; if set, do NOT set arrivalTime */
  departureTime?: string;
  /** RFC 3339; TRANSIT-only; if set, do NOT set departureTime */
  arrivalTime?: string;
  /** Also returns up to 3 routes when true; none if via intermediates present */
  computeAlternativeRoutes?: boolean;
  routeModifiers?: RouteModifiers;
  languageCode?: string; // BCP-47
  regionCode?: string; // ccTLD two-letter
  units?: Units;
  /** If true, you must request routes.optimized_intermediate_waypoint_index in field mask */
  optimizeWaypointOrder?: boolean;
  requestedReferenceRoutes?: ReferenceRoute[]; // watch SHORTER_DISTANCE caveats
  /** Extra computations require corresponding fields in X-Goog-FieldMask */
  extraComputations?: ExtraComputation[];
  /** Only valid with routingPreference=TRAFFIC_AWARE_OPTIMAL and travelMode=DRIVE */
  trafficModel?: TrafficModel;
  /** TRANSIT only */
  transitPreferences?: TransitPreferences;
}

export interface ComputeRoutesResponse {
  routes?: Route[]; // empty array means no route found
  fallbackInfo?: FallbackInfo;
  geocodingResults?: GeocodingResults; // for address waypoints
}

// ===== Inputs =====
export interface Waypoint {
  location?: Location;
  placeId?: string;
  address?: string;
  via?: boolean;
  vehicleStopover?: boolean;
  sideOfRoad?: boolean;
}

export interface Location {
  latLng?: LatLng;
  heading?: number /* degrees [0,360) */;
}

export interface RouteModifiers {
  avoidTolls?: boolean;
  avoidHighways?: boolean;
  avoidFerries?: boolean;
  avoidIndoor?: boolean;
  vehicleInfo?: VehicleInfo;
  tollPasses?: TollPass[]; // keep as string[] unless you want strict union of pass codes
}

export interface VehicleInfo {
  emissionType?: VehicleEmissionType;
}
export type TollPass = string;

export interface TransitPreferences {
  allowedTravelModes?: TransitTravelMode[];
  routingPreference?: TransitRoutingPreference;
}

// ===== Route model =====
export interface Route {
  routeLabels?: RouteLabel[];
  legs?: RouteLeg[];
  distanceMeters?: number;
  /** Length taking traffic into account when traffic-aware */
  duration?: string; // e.g. "3.5s"
  /** Length without traffic */
  staticDuration?: string; // e.g. "3.5s"
  polyline?: Polyline; // overall route polyline
  description?: string;
  warnings?: string[];
  viewport?: Viewport;
  travelAdvisory?: RouteTravelAdvisory;
  /** Present only when optimizeWaypointOrder=true */
  optimizedIntermediateWaypointIndex?: number[];
  localizedValues?: RouteLocalizedValues;
  /** Only with traffic-aware routing; not for routes with Via waypoints */
  routeToken?: string;
  polylineDetails?: PolylineDetails;
}

export interface RouteLeg {
  distanceMeters?: number;
  /** Length taking traffic into account when traffic-aware */
  duration?: string; // e.g. "3.5s"
  /** Length without traffic */
  staticDuration?: string; // e.g. "3.5s"
  polyline?: Polyline; // includes each step polyline
  startLocation?: Location;
  endLocation?: Location;
  steps?: RouteLegStep[]; // sequence of nav instructions
  travelAdvisory?: RouteLegTravelAdvisory;
  localizedValues?: RouteLegLocalizedValues;
  /** Only populated for TRANSIT routes */
  stepsOverview?: StepsOverview;
}

export interface RouteLegStep {
  distanceMeters?: number;
  staticDuration?: string; // e.g. "3.5s"
  polyline?: Polyline;
  startLocation?: Location;
  endLocation?: Location;
  navigationInstruction?: NavigationInstruction;
  travelAdvisory?: RouteLegStepTravelAdvisory;
  localizedValues?: RouteLegStepLocalizedValues;
  transitDetails?: RouteLegStepTransitDetails; // when travelMode=TRANSIT
  travelMode?: RouteTravelMode;
}

export interface NavigationInstruction {
  maneuver?: Maneuver;
  instructions?: string;
}

export interface RouteLegStepTravelAdvisory {
  speedReadingIntervals?: SpeedReadingInterval[];
}

export interface SpeedReadingInterval {
  startPolylinePointIndex?: number;
  endPolylinePointIndex?: number;
  speed?: SpeedReadingSpeed;
}

export interface RouteLegStepLocalizedValues {
  distance?: LocalizedText;
  staticDuration?: LocalizedText;
}

export interface RouteLegStepTransitDetails {
  stopDetails?: TransitStopDetails;
  localizedValues?: TransitDetailsLocalizedValues;
  headsign?: string;
  headway?: string; // duration
  transitLine?: TransitLine;
  stopCount?: number;
  tripShortText?: string;
}

export interface TransitStopDetails {
  arrivalStop?: TransitStop;
  arrivalTime?: string; // RFC 3339
  departureStop?: TransitStop;
  departureTime?: string; // RFC 3339
}

export interface TransitStop {
  name?: string;
  location?: Location;
}

export interface TransitDetailsLocalizedValues {
  arrivalTime?: LocalizedTime;
  departureTime?: LocalizedTime;
}
export interface LocalizedTime {
  time?: LocalizedText;
  timeZone?: string;
}

export interface TransitLine {
  agencies?: TransitAgency[];
  name?: string;
  uri?: string;
  color?: string; // hex
  iconUri?: string;
  nameShort?: string;
  textColor?: string; // hex
  vehicle?: TransitVehicle;
}

export interface TransitAgency {
  name?: string;
  phoneNumber?: string;
  uri?: string;
}
export interface TransitVehicle {
  name?: LocalizedText;
  type?: TransitVehicleType;
  iconUri?: string;
  localIconUri?: string;
}

export interface RouteLegTravelAdvisory {
  tollInfo?: TollInfo;
  speedReadingIntervals?: SpeedReadingInterval[];
}
export interface TollInfo {
  estimatedPrice?: Money[];
}

export interface RouteLegLocalizedValues {
  distance?: LocalizedText;
  duration?: LocalizedText; // traffic-aware text if requested
  staticDuration?: LocalizedText;
}

export interface StepsOverview {
  multiModalSegments?: MultiModalSegment[];
}
export interface MultiModalSegment {
  navigationInstruction?: NavigationInstruction;
  travelMode?: RouteTravelMode; // of the segment
  stepStartIndex?: number;
  stepEndIndex?: number;
}

// ===== Polyline =====
export interface GeoJSONLineString {
  type: "LineString";
  /** [longitude, latitude] pairs per GeoJSON spec */
  coordinates: Array<[number, number]>;
  properties?: Record<string, unknown>;
}

export interface Polyline {
  /** String encoding per Google polyline algorithm */
  encodedPolyline?: string;
  /**
   * Docs expose this as a generic Struct; typed here for common GeoJSON consumers.
   * If you don't use GeoJSON, treat as Record<string, unknown>.
   */
  geoJsonLinestring?: GeoJSONLineString | Record<string, unknown>;
}

export interface RouteTravelAdvisory {
  tollInfo?: TollInfo;
  speedReadingIntervals?: SpeedReadingInterval[];
  fuelConsumptionMicroliters?: string; // int64 string when FUEL_CONSUMPTION requested
  routeRestrictionsPartiallyIgnored?: boolean;
  transitFare?: Money;
}

export interface RouteLocalizedValues {
  distance?: LocalizedText;
  duration?: LocalizedText; // traffic-aware text if requested
  staticDuration?: LocalizedText;
  transitFare?: LocalizedText;
}

export interface PolylineDetails {
  flyoverInfo?: FlyoverInfo[];
  narrowRoadInfo?: NarrowRoadInfo[];
}
export interface FlyoverInfo {
  flyoverPresence?: RoadFeatureState;
  polylinePointIndex?: PolylinePointIndex;
}
export interface NarrowRoadInfo {
  narrowRoadPresence?: RoadFeatureState;
  polylinePointIndex?: PolylinePointIndex;
}
export interface PolylinePointIndex {
  startIndex?: number;
  endIndex?: number;
}

// ===== Geocoding & fallback =====
export interface GeocodingResults {
  origin?: GeocodedWaypoint;
  destination?: GeocodedWaypoint;
  intermediates?: GeocodedWaypoint[];
}
export interface GeocodedWaypoint {
  geocoderStatus?: Status;
  type?: string[];
  partialMatch?: boolean;
  placeId?: string;
  intermediateWaypointRequestIndex?: number; // index into request.intermediates
}

export interface FallbackInfo {
  routingMode?: FallbackRoutingMode;
  reason?: FallbackReason;
}
