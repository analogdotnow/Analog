import * as z from "zod";

export const locationSchema = z.object({
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  continent: z.string(),
  country: z.string(),
  region: z.string(),
  city: z.string(),
  postalCode: z.string().nullable(),
  timezone: z.string(),
});
