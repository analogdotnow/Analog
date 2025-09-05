import { z } from "zod";

export const createApiKeySchema = z.object({
  name: z.string().optional(),
  expiresIn: z.number().optional(),
  prefix: z.string().optional(),
  permissions: z.record(z.string(), z.array(z.string())).optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export const updateApiKeySchema = z.object({
  keyId: z.string(),
  name: z.string().optional(),
});

export const deleteApiKeySchema = z.object({
  keyId: z.string(),
});

export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
export type UpdateApiKeyInput = z.infer<typeof updateApiKeySchema>;
export type DeleteApiKeyInput = z.infer<typeof deleteApiKeySchema>;
