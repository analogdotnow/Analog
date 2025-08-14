// Fetch example for Google Routes API v2: directions/v2:computeRoutes
// Uses string unions + interfaces from your patched types file.
// Node 18+ (global fetch) or browsers.

import { ComputeRoutesRequest, ComputeRoutesResponse } from "./interfaces";

const ROUTES_ENDPOINT =
  "https://routes.googleapis.com/directions/v2:computeRoutes";

export interface ComputeRoutesOptions {
  request: ComputeRoutesRequest;
  fieldMask?: string | string[]; // e.g., ["routes.duration","routes.distanceMeters","routes.polyline.encodedPolyline"]
  apiKey: string; // preferred for Maps Platform
  fetchInit?: Omit<RequestInit, "method" | "headers" | "body">; // optional extras
}

function normalizeFieldMask(mask: string | string[]): string {
  return Array.isArray(mask) ? mask.join(",") : mask;
}

export async function computeRoutes(
  options: ComputeRoutesOptions,
): Promise<ComputeRoutesResponse> {
  const res = await fetch(ROUTES_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-FieldMask": normalizeFieldMask(
        options.fieldMask ?? ["routes.duration", "routes.distanceMeters"],
      ),
      "X-Goog-Api-Key": options.apiKey,
    },
    body: JSON.stringify(options.request),
    ...options.fetchInit,
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;

    try {
      const errText = await res.text();
      msg += `\n${errText}`;
    } catch {
      /* empty */
    }

    throw new Error(msg);
  }

  return (await res.json()) as ComputeRoutesResponse;
}
