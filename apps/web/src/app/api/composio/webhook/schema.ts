import { z } from "zod";

const connectedAccountSchema = z.object({
  id: z.string(),
  uuid: z.string(),
  userId: z.string(),
  authConfigId: z.string(),
  authConfigUUID: z.string(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

const metadataSchema = z.object({
  id: z.string(),
  uuid: z.string(),
  toolkitSlug: z.string(),
  triggerSlug: z.string(),
  triggerConfig: z.record(z.string(), z.unknown()),
  triggerData: z.string().optional(),
  connectedAccount: connectedAccountSchema,
});

const incomingTriggerSchema = z.object({
  id: z.string(),
  uuid: z.string(),
  triggerSlug: z.string(),
  toolkitSlug: z.string(),
  userId: z.string(),
  payload: z.unknown().optional(),
  originalPayload: z.unknown().optional(),
  metadata: metadataSchema,
});

export type IncomingTrigger = z.infer<typeof incomingTriggerSchema>;
export type GmailTriggerEvent = IncomingTrigger & { toolkitSlug: "gmail" };

export function parseIncomingTrigger(input: unknown) {
  return incomingTriggerSchema.safeParse(input);
}
