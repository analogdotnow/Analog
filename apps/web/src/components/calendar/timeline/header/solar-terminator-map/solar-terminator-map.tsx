"use client";

import * as React from "react";
import { geoEquirectangular } from "d3-geo";
import { line } from "d3-shape";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ProjectionFunction,
} from "react-simple-maps";
import { Temporal } from "temporal-polyfill";

import { TIMEZONE_LOCATIONS } from "@repo/timezone-coordinates";

import { useZonedDateTime } from "@/components/calendar/context/datetime-provider";
import { useDefaultTimeZone } from "@/store/hooks";
import WorldMap from "./land-110m.json";

interface UseTerminatorProps {
  step?: number;
  date: Temporal.PlainDate;
}

function useTerminator({ step = 2, date }: UseTerminatorProps) {
  const now = useZonedDateTime();

  return React.useMemo(() => {
    const plainTime = now.withTimeZone("UTC").toPlainTime();
    const timeInUTC = date.toZonedDateTime({ timeZone: "UTC", plainTime });
    // Calculate the sun's subsolar point (where sun is directly overhead)
    const declination =
      (23.45 *
        Math.sin(
          (((360 * (284 + timeInUTC.dayOfYear)) / 365) * Math.PI) / 180,
        ) *
        Math.PI) /
      180;

    // Solar longitude (where the sun is at zenith)
    const utcHours =
      timeInUTC.hour + timeInUTC.minute / 60 + timeInUTC.second / 3600;
    const solarLongitude = (utcHours - 12) * 15; // 15 degrees per hour

    const φ0 = (declination * 180) / Math.PI; // Sun's declination in degrees
    const λ0 = -solarLongitude; // Sun's longitude in degrees (negative because sun moves west)

    const pts: [number, number][] = [];

    // Calculate terminator coordinates using the parametric form
    for (let λ = -180; λ <= 180; λ += step) {
      // Solar zenith angle = 90° at the terminator
      const φ =
        (Math.atan(
          -Math.cos(((λ - λ0) * Math.PI) / 180) /
            Math.tan((φ0 * Math.PI) / 180),
        ) *
          180) /
        Math.PI;

      // Only add valid coordinates
      if (!isNaN(φ) && isFinite(φ) && φ >= -90 && φ <= 90) {
        pts.push([λ, φ]);
      }
    }

    return {
      terminator: pts,
      sunLongitude: λ0,
      sunDeclination: φ0,
    };
  }, [now, step, date]);
}

interface SolarTerminatorMapProps {
  timeZoneId: string;
  date: Temporal.PlainDate;
}

export function SolarTerminatorMap({
  timeZoneId,
  date,
}: SolarTerminatorMapProps) {
  const projection = React.useMemo(
    () => geoEquirectangular().scale(128).translate([400, 200]),
    [],
  );

  const { terminator, sunDeclination } = useTerminator({ step: 2, date });

  // Create the terminator path
  const terminatorPath = React.useMemo(() => {
    if (terminator.length === 0) return "";

    const lineGenerator = line<[number, number]>()
      .x(([λ, φ]) => {
        const projected = projection([λ, φ]);
        return projected ? projected[0] : 0;
      })
      .y(([λ, φ]) => {
        const projected = projection([λ, φ]);
        return projected ? projected[1] : 0;
      })
      .defined(([λ, φ]) => {
        const projected = projection([λ, φ]);
        return (
          projected !== null && !isNaN(projected[0]) && !isNaN(projected[1])
        );
      });

    return lineGenerator(terminator) || "";
  }, [terminator, projection]);

  // Create day overlay polygon
  const dayPolygonPath = React.useMemo(() => {
    if (terminator.length === 0) return "";

    // Create the day polygon by extending terminator to map boundaries
    const dayCoords: [number, number][] = [];

    // Add terminator points for the day side
    dayCoords.push(...terminator);

    // Complete the polygon by adding boundary points to enclose the day side
    // Choose hemisphere to close over based on declination (north if >= 0, south if < 0)
    if (terminator.length > 0) {
      // Go to right edge at same latitude
      dayCoords.push([180, terminator[terminator.length - 1]?.[1] || 0]);
      if ((sunDeclination ?? 0) >= 0) {
        // Close across the northern boundary when the sun is over the northern hemisphere
        dayCoords.push([180, 90]);
        dayCoords.push([-180, 90]);
      } else {
        // Close across the southern boundary when the sun is over the southern hemisphere
        dayCoords.push([180, -90]);
        dayCoords.push([-180, -90]);
      }
      // Return to left edge at start latitude
      dayCoords.push([-180, terminator[0]?.[1] || 0]);
    }

    const lineGenerator = line<[number, number]>()
      .x(([λ, φ]) => {
        const projected = projection([λ, φ]);
        return projected ? projected[0] : 0;
      })
      .y(([λ, φ]) => {
        const projected = projection([λ, φ]);
        return projected ? projected[1] : 0;
      })
      .defined(([λ, φ]) => {
        const projected = projection([λ, φ]);
        return (
          projected !== null && !isNaN(projected[0]) && !isNaN(projected[1])
        );
      });

    return lineGenerator(dayCoords) + "Z" || "";
  }, [terminator, projection, sunDeclination]);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="overflow-hidden rounded-md">
        <svg className="h-full w-full" viewBox="0 0 800 400">
          <ComposableMap
            projection={projection as unknown as ProjectionFunction}
            width={800}
            height={400}
          >
            <defs>
              <mask id="map" fill="white">
                <Geographies geography={WorldMap}>
                  {({ geographies }) =>
                    geographies.map((geo) => (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        className="fill-white stroke-white outline-none"
                        strokeWidth={1}
                      />
                    ))
                  }
                </Geographies>
              </mask>
              <mask id="night" fill="white">
                <rect width="100%" height="100%" />
                <path d={dayPolygonPath} fill="black" stroke="none" />
              </mask>
            </defs>

            <rect
              className="fill-primary/20"
              width="100%"
              height="100%"
              mask="url(#map)"
            />

            <rect
              className="fill-black/30"
              width="100%"
              height="100%"
              mask="url(#night)"
            />

            <path
              d={terminatorPath}
              className="fill-none stroke-primary/20"
              strokeWidth={2}
            />
            <TimeZoneMarkers timeZoneId={timeZoneId} />
          </ComposableMap>
        </svg>
      </div>
    </div>
  );
}

interface TimeZoneMarkersProps {
  timeZoneId: string;
}

function TimeZoneMarkers({ timeZoneId }: TimeZoneMarkersProps) {
  const defaultTimeZone = useDefaultTimeZone();

  if (timeZoneId === defaultTimeZone) {
    const coordinates = TIMEZONE_LOCATIONS[defaultTimeZone];

    if (!coordinates) {
      return null;
    }
    return (
      <Marker coordinates={[coordinates[1], coordinates[0]]}>
        <circle r={4} className="fill-red-500/80" />
      </Marker>
    );
  }

  const coordinatesA = TIMEZONE_LOCATIONS[timeZoneId];
  const coordinatesB = TIMEZONE_LOCATIONS[defaultTimeZone];

  return (
    <>
      {coordinatesA ? (
        <Marker coordinates={[coordinatesA[1], coordinatesA[0]]}>
          <circle r={4} className="fill-red-500/80" />
        </Marker>
      ) : null}
      {coordinatesB ? (
        <Marker coordinates={[coordinatesB[1], coordinatesB[0]]}>
          <circle r={4} className="fill-yellow-500/80" />
        </Marker>
      ) : null}
    </>
  );
}
