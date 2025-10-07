export interface PlaceResult {
  placeId: string;
  displayName?: string;
  formattedAddress: string;
  type: PlaceType;
}

export type PlaceType =
  | "address"
  | "establishment"
  | "point_of_interest"
  | string;

export interface AutocompleteOptions {
  languageCode?: string;
  limit?: number;
}

export interface PlacesProvider {
  autocomplete(
    input: string,
    options?: AutocompleteOptions,
  ): Promise<PlaceResult[]>;
}
