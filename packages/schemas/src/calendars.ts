import * as z from "zod";

export const createCalendarInputSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  timeZone: z.string().optional(),
  provider: z.object({
    id: z.enum(["google", "microsoft"]),
    accountId: z.string(),
  }),
});

export const updateCalendarInputSchema = createCalendarInputSchema.extend({
  id: z.string(),
  etag: z.string().optional(),
});

export type CreateCalendarInput = Omit<
  z.infer<typeof createCalendarInputSchema>,
  "provider"
>;
export type UpdateCalendarInput = Omit<
  z.infer<typeof updateCalendarInputSchema>,
  "provider"
>;
