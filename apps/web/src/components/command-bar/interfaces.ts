export interface EventWindowEntry {
  id: string;
  type: "event";
  eventId: string;
}

export interface DirectionsWindowEntry {
  id: string;
  type: "directions";
  eventId: string;
}

export interface WeatherForecastWindowEntry {
  id: string;
  type: "weather-forecast";
  eventId: string;
}

export type StackWindowEntry =
  | EventWindowEntry
  | DirectionsWindowEntry
  | WeatherForecastWindowEntry;
