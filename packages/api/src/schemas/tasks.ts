import { Temporal } from "temporal-polyfill";
import { z } from "zod";

export const createTaskCollectionInputSchema = z.object({
  title: z.string(),
});

export const createTaskInputSchema = z
  .object({
    title: z.string().optional(),
    taskCollectionId: z.string(),
    description: z.string().optional(),
    accountId: z.string(),
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
  })
  .refine((data) => data.title || data.description, {
    message: "Either title or description must be provided",
    path: ["title"],
  });

export const updateTaskInputSchema = createTaskInputSchema
  .safeExtend({
    id: z.string(),
  })
  .refine((data) => data.title || data.description, {
    message: "Either title or description must be provided",
    path: ["title"],
  });

export type CreateTaskCollectionInput = z.infer<
  typeof createTaskCollectionInputSchema
>;
export type CreateTaskInput = z.infer<typeof createTaskInputSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskInputSchema>;
