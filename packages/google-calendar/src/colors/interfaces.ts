import type { GoogleCalendarRequestOptions } from "../interfaces";

export interface ColorDefinition {
  background?: string;
  foreground?: string;
}

export interface Colors {
  calendar?: Record<string, ColorDefinition>;
  event?: Record<string, ColorDefinition>;
  kind?: string;
  updated?: string;
}

export interface GetColorsInput extends GoogleCalendarRequestOptions {}

export type GetColorsResponse = Colors;
