import { Temporal } from "@js-temporal/polyfill";
import { z } from "zod";

const createTaskCollectionInputSchema = z.object({
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

const updateTaskInputSchema = createTaskInputSchema
  .extend({
    id: z.string(),
  })
  .refine((data) => data.title || data.description, {
    message: "Either title or description must be provided",
    path: ["title"],
  });

type CreateTaskCollectionInput = z.infer<
  typeof createTaskCollectionInputSchema
>;
export type CreateTaskInput = z.infer<typeof createTaskInputSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskInputSchema>;
