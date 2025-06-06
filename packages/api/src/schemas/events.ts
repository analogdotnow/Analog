import {
  zInstantInstance,
  zPlainDateInstance,
  zZonedDateTimeInstance,
} from "temporal-zod";
import { z } from "zod";

export const dateInputSchema = z.union([
  zPlainDateInstance,
  zInstantInstance,
  zZonedDateTimeInstance,
]);

export const createEventInputSchema = z.object({
  title: z.string().optional(),
  start: dateInputSchema,
  end: dateInputSchema,
  allDay: z.boolean().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  color: z.string().optional(),
  accountId: z.string(),
  calendarId: z.string(),
});

export const updateEventInputSchema = createEventInputSchema.extend({
  id: z.string(),
});

export type CreateEventInput = z.infer<typeof createEventInputSchema>;
export type UpdateEventInput = z.infer<typeof updateEventInputSchema>;
