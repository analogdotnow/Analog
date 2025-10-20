import { zZonedDateTimeInstance } from "temporal-zod";
import * as z from "zod";

export const directionsInputSchema = z.object({
  origin: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  destination: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  travelMode: z.enum(["DRIVE", "WALK", "BICYCLE", "TRANSIT", "TWO_WHEELER"]),
  units: z.enum(["METRIC", "IMPERIAL"]),
  departure: zZonedDateTimeInstance.optional(),
  arrival: zZonedDateTimeInstance.optional(),
  language: z.string().optional(),
});

export type DirectionsInput = z.infer<typeof directionsInputSchema>;
