import { z } from "zod/v3";

export const autocompleteInputSchema = z.object({
  input: z.string().min(1).max(256),
  languageCode: z.string().optional().default("en"),
  limit: z.number().int().min(1).max(10).optional().default(5),
});

const placeResultSchema = z.object({
  placeId: z.string(),
  displayName: z.string().optional(),
  formattedAddress: z.string(),
  type: z.string(),
});

export type AutocompleteInput = z.infer<typeof autocompleteInputSchema>;
type PlaceResult = z.infer<typeof placeResultSchema>;
