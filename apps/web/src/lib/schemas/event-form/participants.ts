import { z } from "zod";

export const participantSchema = z.object({
  id: z.string().min(1, "Participant ID is required"),
  name: z.string().trim().optional(),
  email: z.string().email("Invalid email format"),
});

export type Participant = z.infer<typeof participantSchema>;
