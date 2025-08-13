import { GooglePlacesProvider } from "../providers/google-places";
import { autocompleteInputSchema } from "../schemas/places";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const placesRouter = createTRPCRouter({
  autocomplete: publicProcedure
    .meta({
      procedureName: "places.autocomplete",
      ratelimit: {
        namespace: "google-places",
        limit: 20,
        duration: "1m",
      },
    })
    .input(autocompleteInputSchema)
    .query(async ({ input }) => {
      const placesProvider = new GooglePlacesProvider();

      return await placesProvider.autocomplete(input.input, {
        languageCode: input.languageCode,
        limit: input.limit,
      });
    }),
});
