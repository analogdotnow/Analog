import * as React from "react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { env } from "@repo/env/client";

import { useTRPC } from "@/lib/trpc/client";

if (typeof window !== "undefined") {
  setOptions({
    key: env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });
}

type AutocompleteRequest = google.maps.places.AutocompleteRequest;
type AutocompleteSessionToken = google.maps.places.AutocompleteSessionToken;

export function usePlacesSearch(request: AutocompleteRequest) {
  const sessionTokenRef = React.useRef<AutocompleteSessionToken>(undefined);

  const sessionToken = sessionTokenRef.current;
  const trpc = useTRPC();
  const query = useQuery(trpc.user.approximateLocation.queryOptions());

  return useQuery({
    queryKey: [request.input],
    queryFn: async () => {
      if (request.input.trim() === "") {
        return {
          suggestions: [],
        };
      }

      const { AutocompleteSuggestion, AutocompleteSessionToken } =
        await importLibrary("places");

      if (!sessionTokenRef.current) {
        sessionTokenRef.current = new AutocompleteSessionToken();
      }

      const coordinates = query.data;

      return await AutocompleteSuggestion.fetchAutocompleteSuggestions({
        ...request,
        locationBias: coordinates
          ? {
              center: {
                lat: coordinates.latitude,
                lng: coordinates.longitude,
              },
              radius: 20000,
            }
          : "IP_BIAS",
        sessionToken: sessionToken,
      });
    },
    placeholderData: keepPreviousData,
    staleTime: 1,
  });
}
