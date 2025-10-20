import { Temporal } from "temporal-polyfill";
import * as z from "zod";

import { env } from "@repo/env/server";
import { GoogleRoutes } from "@repo/google-maps-routes";
import type { DirectionsInput } from "@repo/schemas";

import type { DirectionsRoute, Leg, Step } from "./interfaces";

// TODO: Use field mask to reduce the amount of data returned
const computeRoutesFieldMask = [
  // Route-level fields
  "routes.description",
  "routes.distanceMeters",
  "routes.duration",
  "routes.staticDuration",
  "routes.routeLabels",
  "routes.warnings",

  // Leg-level fields
  "routes.legs.startLocation.latLng",
  "routes.legs.startLocation.heading",
  "routes.legs.endLocation.latLng",
  "routes.legs.endLocation.heading",
  "routes.legs.duration",
  "routes.legs.staticDuration",
  "routes.legs.stepsOverview",
  "routes.legs.stepsOverview.multiModalSegments.stepStartIndex",
  "routes.legs.stepsOverview.multiModalSegments.stepEndIndex",
  "routes.legs.stepsOverview.multiModalSegments.navigationInstruction.maneuver",
  "routes.legs.stepsOverview.multiModalSegments.navigationInstruction.instructions",
  "routes.legs.stepsOverview.multiModalSegments.travelMode",

  // Step-level fields
  "routes.legs.steps.navigationInstruction.maneuver",
  "routes.legs.steps.navigationInstruction.instructions",
  "routes.legs.steps.startLocation.latLng",
  "routes.legs.steps.startLocation.heading",
  "routes.legs.steps.endLocation.latLng",
  "routes.legs.steps.endLocation.heading",
  "routes.legs.steps.staticDuration",
  "routes.legs.steps.distanceMeters",
  "routes.legs.steps.travelMode",

  // Transit details
  "routes.legs.steps.transitDetails.stopDetails.arrivalTime",
  "routes.legs.steps.transitDetails.stopDetails.arrivalStop.name",
  "routes.legs.steps.transitDetails.stopDetails.arrivalStop.location.latLng",
  "routes.legs.steps.transitDetails.stopDetails.arrivalStop.location.heading",
  "routes.legs.steps.transitDetails.stopDetails.departureTime",
  "routes.legs.steps.transitDetails.stopDetails.departureStop.name",
  "routes.legs.steps.transitDetails.stopDetails.departureStop.location.latLng",
  "routes.legs.steps.transitDetails.stopDetails.departureStop.location.heading",
  "routes.legs.steps.transitDetails.transitLine.agencies.name",
  "routes.legs.steps.transitDetails.transitLine.agencies.phoneNumber",
  "routes.legs.steps.transitDetails.transitLine.agencies.uri",
  "routes.legs.steps.transitDetails.transitLine.name",
  "routes.legs.steps.transitDetails.transitLine.nameShort",
  "routes.legs.steps.transitDetails.transitLine.uri",
  "routes.legs.steps.transitDetails.transitLine.color",
  "routes.legs.steps.transitDetails.transitLine.textColor",
  "routes.legs.steps.transitDetails.transitLine.vehicle.type",
  "routes.legs.steps.transitDetails.transitLine.vehicle.name.text",
  "routes.legs.steps.transitDetails.transitLine.vehicle.iconUri",
  "routes.legs.steps.transitDetails.transitLine.vehicle.localIconUri",
  "routes.legs.steps.transitDetails.stopCount",
  "routes.legs.steps.transitDetails.headsign",
  "routes.legs.steps.transitDetails.headway",
  "routes.legs.steps.transitDetails.tripShortText",
  "routes.legs.steps.transitDetails.localizedValues.arrivalTime.timeZone",
  "routes.legs.steps.transitDetails.localizedValues.departureTime.timeZone",
].join(",");

export const maps = new GoogleRoutes({
  apiKey: env.GOOGLE_MAPS_API_KEY,
});

export async function directions(input: DirectionsInput) {
  const response = await maps.directions.computeRoutes(
    {
      origin: {
        location: {
          latLng: {
            latitude: input.origin.latitude,
            longitude: input.origin.longitude,
          },
        },
      },
      destination: {
        location: {
          latLng: {
            latitude: input.destination.latitude,
            longitude: input.destination.longitude,
          },
        },
      },
      travelMode: input.travelMode,
      units: input.units,
      departureTime: input.departure?.toInstant().toString(),
      arrivalTime: input.arrival?.toInstant().toString(),
      languageCode: input.language,
    },
    {
      headers: {
        "X-Goog-FieldMask": "*",
      },
    },
  );

  return response.routes?.map((route) => {
    const legs = route.legs?.flatMap((leg) => {
      const steps = leg.steps?.map((step) => ({
        ...(step.navigationInstruction &&
        step.navigationInstruction.instructions
          ? {
              navigation: {
                maneuver: step.navigationInstruction.maneuver,
                instructions: step.navigationInstruction.instructions,
              },
            }
          : undefined),
        ...(step.startLocation
          ? {
              start: {
                coordinates: step.startLocation.latLng
                  ? {
                      latitude: step.startLocation.latLng.latitude!,
                      longitude: step.startLocation.latLng.longitude!,
                    }
                  : undefined,
                heading: step.startLocation.heading,
              },
            }
          : undefined),
        ...(step.endLocation
          ? {
              end: {
                coordinates: step.endLocation.latLng
                  ? {
                      latitude: step.endLocation.latLng.latitude!,
                      longitude: step.endLocation.latLng.longitude!,
                    }
                  : undefined,
                heading: step.endLocation.heading,
              },
            }
          : undefined),
        duration: step.staticDuration
          ? parseDuration(step.staticDuration)
          : undefined,
        travelMode: step.travelMode,
        transit: step.transitDetails
          ? {
              ...(step.transitDetails.stopDetails
                ? {
                    arrival: {
                      time: step.transitDetails.stopDetails.arrivalTime
                        ? Temporal.Instant.from(
                            step.transitDetails.stopDetails.arrivalTime,
                          ).toZonedDateTimeISO(
                            step.transitDetails.localizedValues?.arrivalTime
                              ?.timeZone ?? "UTC",
                          )
                        : undefined,
                      name: step.transitDetails.stopDetails.arrivalStop?.name,
                      coordinates: step.transitDetails.stopDetails.arrivalStop
                        ?.location?.latLng
                        ? {
                            latitude:
                              step.transitDetails.stopDetails.arrivalStop
                                .location.latLng.latitude!,
                            longitude:
                              step.transitDetails.stopDetails.arrivalStop
                                .location.latLng.longitude!,
                          }
                        : undefined,
                      heading:
                        step.transitDetails.stopDetails.arrivalStop?.location
                          ?.heading,
                    },
                    departure: {
                      time: step.transitDetails.stopDetails.departureTime
                        ? Temporal.Instant.from(
                            step.transitDetails.stopDetails.departureTime,
                          ).toZonedDateTimeISO(
                            step.transitDetails.localizedValues?.departureTime
                              ?.timeZone ?? "UTC",
                          )
                        : undefined,
                      name: step.transitDetails.stopDetails.departureStop?.name,
                      coordinates: step.transitDetails.stopDetails.departureStop
                        ?.location?.latLng
                        ? {
                            latitude:
                              step.transitDetails.stopDetails.departureStop
                                .location.latLng.latitude!,
                            longitude:
                              step.transitDetails.stopDetails.departureStop
                                .location.latLng.longitude!,
                          }
                        : undefined,
                      heading:
                        step.transitDetails.stopDetails.departureStop?.location
                          ?.heading,
                    },
                    ...(step.transitDetails.transitLine
                      ? {
                          line: {
                            agencies:
                              step.transitDetails.transitLine.agencies?.map(
                                (agency) => ({
                                  name: agency.name,
                                  phoneNumber: agency.phoneNumber,
                                  uri: agency.uri,
                                }),
                              ),
                            name: step.transitDetails.transitLine.name,
                            nameShort:
                              step.transitDetails.transitLine.nameShort,
                            uri: step.transitDetails.transitLine.uri,
                            textColor:
                              step.transitDetails.transitLine.textColor,
                            color: step.transitDetails.transitLine.color,
                            ...(step.transitDetails.transitLine.vehicle
                              ? {
                                  vehicle: {
                                    type: step.transitDetails.transitLine
                                      .vehicle.type,
                                    name: step.transitDetails.transitLine
                                      .vehicle.name?.text,
                                    iconUri:
                                      step.transitDetails.transitLine.vehicle.iconUri?.startsWith(
                                        "//",
                                      )
                                        ? `https:${step.transitDetails.transitLine.vehicle.iconUri}`
                                        : step.transitDetails.transitLine
                                            .vehicle.iconUri,
                                    localIconUri:
                                      step.transitDetails.transitLine.vehicle.localIconUri?.startsWith(
                                        "//",
                                      )
                                        ? `https:${step.transitDetails.transitLine.vehicle.localIconUri}`
                                        : step.transitDetails.transitLine
                                            .vehicle.localIconUri,
                                  },
                                }
                              : undefined),
                          },
                        }
                      : undefined),
                  }
                : undefined),
              stops: step.transitDetails.stopCount,
              headsign: step.transitDetails.headsign,
              headway: step.transitDetails.headway,
              stopCount: step.transitDetails.stopCount,
              tripShortText: step.transitDetails.tripShortText,
            }
          : undefined,
        distance: step.distanceMeters,
      })) satisfies Step[] | undefined;

      return {
        ...(leg.startLocation
          ? {
              start: {
                coordinates: leg.startLocation.latLng
                  ? {
                      latitude: leg.startLocation.latLng.latitude!,
                      longitude: leg.startLocation.latLng.longitude!,
                    }
                  : undefined,
                heading: leg.startLocation.heading,
              },
            }
          : undefined),
        ...(leg.endLocation
          ? {
              end: {
                coordinates: leg.endLocation.latLng
                  ? {
                      latitude: leg.endLocation.latLng.latitude!,
                      longitude: leg.endLocation.latLng.longitude!,
                    }
                  : undefined,
                heading: leg.endLocation.heading,
              },
            }
          : undefined),
        ...(leg.duration
          ? {
              duration: {
                trafficAware: leg.duration
                  ? parseDuration(leg.duration)
                  : undefined,
                static: leg.staticDuration
                  ? parseDuration(leg.staticDuration)
                  : undefined,
              },
            }
          : undefined),
        parts: leg.stepsOverview?.multiModalSegments?.map((segment) => ({
          steps:
            segment.stepStartIndex && segment.stepEndIndex
              ? steps?.slice(segment.stepStartIndex, segment.stepEndIndex + 1)
              : steps,
          ...(segment.navigationInstruction &&
          segment.navigationInstruction.instructions
            ? {
                navigation: {
                  maneuver: segment.navigationInstruction.maneuver,
                  instructions: segment.navigationInstruction.instructions,
                },
              }
            : undefined),
          travelMode: segment.travelMode,
        })),
      } satisfies Leg;
    });

    return {
      description: route.description,
      warnings: route.warnings,
      legs,
      distance: route.distanceMeters,
      duration: {
        trafficAware: route.duration
          ? parseDuration(route.duration)
          : undefined,
        static: route.staticDuration
          ? parseDuration(route.staticDuration)
          : undefined,
      },
    } satisfies DirectionsRoute;
  });
}

function parseDuration(duration: string) {
  const match = duration.trim().match(/^(-?\d+(?:\.\d+)?)s$/i);

  if (!match) {
    return undefined;
  }

  const result = z.coerce.number().safeParse(match[1]);

  if (result.error) {
    return undefined;
  }

  return Temporal.Duration.from({
    seconds: result.data,
  });
}
