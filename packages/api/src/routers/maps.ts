import { directionsInputSchema } from "@repo/schemas";

import { createTRPCRouter, publicProcedure } from "../trpc";
import { defaultLanguageCode } from "../utils/headers";
import { directions } from "../utils/maps/routes/directions";

export const mapsRouter = createTRPCRouter({
  directions: publicProcedure
    .input(directionsInputSchema)
    .mutation(async ({ input, ctx }) => {
      return (
        directions({
          ...input,
          language: input.language ?? defaultLanguageCode(ctx.headers),
        }) ?? null
      );
    }),
});
