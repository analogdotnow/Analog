import { PlacesClient } from "@googlemaps/places";

import { env } from "@repo/env/server";

import { ProviderError } from "../lib/provider-error";
import type {
  AutocompleteOptions,
  PlaceResult,
  PlaceType,
  PlacesProvider,
} from "./interfaces";

export class GooglePlacesProvider implements PlacesProvider {
  private client: PlacesClient;

  constructor() {
    this.client = new PlacesClient({
      apiKey: env.GOOGLE_MAPS_API_KEY,
    });
  }

  async autocomplete(
    input: string,
    options: AutocompleteOptions = {},
  ): Promise<PlaceResult[]> {
    try {
      const [response] = await this.client.autocompletePlaces({
        input,
        languageCode: options.languageCode || "en",
      });

      const results =
        response.suggestions
          ?.slice(0, options.limit || 5)
          .map((suggestion) => ({
            placeId: suggestion.placePrediction?.placeId || "",
            displayName:
              suggestion.placePrediction?.structuredFormat?.mainText?.text ||
              undefined,
            formattedAddress: suggestion.placePrediction?.text?.text || "",
            type: (suggestion.placePrediction?.types?.[0]
              ?.split("_")
              .join(" ") || "address") as PlaceType,
          })) || [];

      return results;
    } catch (error) {
      throw new ProviderError(error as Error, "autocomplete", { input });
    }
  }
}
