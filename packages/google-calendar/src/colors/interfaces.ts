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

export type GetColorsInput = GoogleCalendarRequestOptions;

export type GetColorsResponse = Colors;
