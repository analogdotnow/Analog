import type { z } from "zod";

import { baseEventFormSchema } from "./form";

export const aiInputSchema = baseEventFormSchema.omit({
  account: true,
  selectedParticipants: true,
});

export type AiOutputData = z.infer<typeof aiInputSchema>;
