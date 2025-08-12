import { auth } from "@repo/auth/server";

import {
  createApiKeySchema,
  deleteApiKeySchema,
  updateApiKeySchema,
} from "../schemas/api-keys";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const apiKeysRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const apiKeys = await auth.api.listApiKeys({
      headers: ctx.headers,
    });

    return apiKeys || [];
  }),

  create: protectedProcedure
    .input(createApiKeySchema)
    .mutation(async ({ ctx, input }) => {
      const apiKey = await auth.api.createApiKey({
        body: {
          name: input.name,
          expiresIn: input.expiresIn,
          userId: ctx.user.id,
          prefix: input.prefix,
          metadata: input.metadata,
          permissions: input.permissions,
        },
      });

      return apiKey;
    }),

  update: protectedProcedure
    .input(updateApiKeySchema)
    .mutation(async ({ ctx, input }) => {
      const apiKey = await auth.api.updateApiKey({
        body: {
          keyId: input.keyId,
          name: input.name,
          userId: ctx.user.id,
        },
      });

      return apiKey;
    }),

  delete: protectedProcedure
    .input(deleteApiKeySchema)
    .mutation(async ({ ctx, input }) => {
      const result = await auth.api.deleteApiKey({
        body: {
          keyId: input.keyId,
        },
        headers: ctx.headers,
      });

      return result;
    }),
});
