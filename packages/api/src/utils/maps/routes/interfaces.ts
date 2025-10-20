import type { Temporal } from "temporal-polyfill";

export type TravelMode =
  | "DRIVE"
  | "WALK"
  | "BICYCLE"
  | "TRANSIT"
  | "TRAVEL_MODE_UNSPECIFIED"
  | "TWO_WHEELER";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Location {
  coordinates?: Coordinates;
  heading?: number;
}

export interface Navigation {
  maneuver?: string;
  instructions: string;
}

export interface Agency {
  name?: string;
  phoneNumber?: string;
  uri?: string;
}

export interface Vehicle {
  type?: string;
  name?: string;
  iconUri?: string;
  localIconUri?: string;
}

export interface Line {
  agencies?: Agency[];
  name?: string;
  nameShort?: string;
  uri?: string;
  textColor?: string;
  color?: string;
  vehicle?: Vehicle;
}

export interface TransitStop {
  time?: Temporal.ZonedDateTime;
  name?: string;
  coordinates?: Coordinates;
  heading?: number;
}

export interface Transit {
  arrival?: TransitStop;
  departure?: TransitStop;
  line?: Line;
  headsign?: string;
  headway?: string;
  stops?: number;
  stopCount?: number;
  tripShortText?: string;
}

export interface Step {
  navigation?: Navigation;
  start?: Location;
  end?: Location;
  duration?: Temporal.Duration;
  travelMode?: TravelMode;
  transit?: Transit;
  distance?: number;
}

export interface Part {
  steps?: Step[];
  navigation?: Navigation;
  travelMode?: TravelMode;
}

export interface Leg {
  parts?: Part[];
  start?: Location;
  end?: Location;
  duration?: RouteDuration;
}

export interface RouteDuration {
  trafficAware?: Temporal.Duration | undefined;
  static?: Temporal.Duration | undefined;
}

export interface DirectionsRoute {
  description?: string;
  warnings?: string[];
  legs?: Leg[];
  distance?: number;
  duration?: RouteDuration;
}
