import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { Temporal } from "temporal-polyfill";
import { zZonedDateTimeInstance } from "temporal-zod";
import * as z from "zod";

import { recurrenceSchema } from "@repo/api/schemas";

export const { fieldContext, formContext, useFieldContext } =
  createFormHookContexts();

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {},
  formComponents: {},
});

export const formSchema = z.object({
  id: z.string(),
  type: z.enum(["draft", "event"]),
  title: z.string(),
  start: zZonedDateTimeInstance,
  end: zZonedDateTimeInstance,
  isAllDay: z.boolean(),
  location: z.string(),
  recurrence: recurrenceSchema.optional(),
  recurringEventId: z.string().optional(),
  description: z.string(),
  calendar: z.object({
    accountId: z.string(),
    calendarId: z.string(),
  }),
  attendees: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().optional(),
      email: z.string(),
      status: z.enum(["accepted", "declined", "tentative", "unknown"]),
      type: z.enum(["required", "optional", "resource"]),
      organizer: z.boolean().optional(),
      comment: z.string().optional(),
    }),
  ),
  providerId: z.enum(["google", "microsoft"]),
});

export type FormValues = z.infer<typeof formSchema>;

export const defaultValues: FormValues = {
  id: "",
  type: "draft",
  title: "",
  start: Temporal.Now.zonedDateTimeISO(),
  end: Temporal.Now.zonedDateTimeISO().add({ hours: 2 }),
  isAllDay: false,
  location: "",
  description: "",
  recurrence: undefined,
  recurringEventId: undefined,
  attendees: [],
  calendar: {
    accountId: "",
    calendarId: "",
  },
  providerId: "google",
};
