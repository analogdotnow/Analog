import { Temporal } from "temporal-polyfill";
import * as z from "zod";

export const createTaskCollectionInputSchema = z.object({
  title: z.string(),
});

export const createTaskInputSchema = z.object({
  title: z.string(),
  taskCollectionId: z.string(),
  description: z.string().optional(),
  provider: z.object({
    id: z.enum(["google", "microsoft"]),
    accountId: z.string(),
  }),
  completed: z
    .union([
      z.instanceof(Temporal.PlainDate),
      z.instanceof(Temporal.Instant),
      z.instanceof(Temporal.ZonedDateTime),
    ])
    .optional(),
  due: z
    .union([
      z.instanceof(Temporal.PlainDate),
      z.instanceof(Temporal.Instant),
      z.instanceof(Temporal.ZonedDateTime),
    ])
    .optional(),
});

export const updateTaskInputSchema = createTaskInputSchema.extend({
  id: z.string(),
});

export type CreateTaskCollectionInput = z.infer<
  typeof createTaskCollectionInputSchema
>;
export type CreateTaskInput = z.infer<typeof createTaskInputSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskInputSchema>;
