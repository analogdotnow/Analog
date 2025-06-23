import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { Temporal } from "temporal-polyfill";
import { zZonedDateTimeInstance } from "temporal-zod";
import { z } from "zod";

export const { fieldContext, formContext, useFieldContext } =
  createFormHookContexts();

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {},
  formComponents: {},
});

export const formSchema = z.object({
  title: z.string(),
  start: zZonedDateTimeInstance,
  end: zZonedDateTimeInstance,
  isAllDay: z.boolean(),
  repeat: z.object({
    type: z.enum(["daily", "weekly", "monthly"]).optional(),
  }),
  description: z.string(),
  calendarId: z.string(),
  accountId: z.string(),
  providerId: z.enum(["google", "microsoft"]),
});

export type FormValues = z.infer<typeof formSchema>;
export type RepeatType = FormValues["repeat"];

export const defaultValues: FormValues = {
  title: "",
  start: Temporal.Now.zonedDateTimeISO(),
  end: Temporal.Now.zonedDateTimeISO().add({ hours: 2 }),
  isAllDay: true,
  description: "",
  repeat: {},
  calendarId: "",
  accountId: "",
  providerId: "google",
};
