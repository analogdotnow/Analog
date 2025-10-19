import { GooglePlacesProvider } from "@repo/providers/google-places";
import { autocompleteInputSchema } from "@repo/schemas";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const placesRouter = createTRPCRouter({
  autocomplete: publicProcedure
    .input(autocompleteInputSchema)
    .query(async ({ input }) => {
      const placesProvider = new GooglePlacesProvider();

      return await placesProvider.autocomplete(input.input, {
        languageCode: input.languageCode,
        limit: input.limit,
      });
    }),
});
