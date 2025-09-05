import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { Temporal } from "temporal-polyfill";
import { zZonedDateTimeInstance } from "temporal-zod";
import { z } from "zod/v3";

import { recurrenceSchema } from "@repo/api/schemas";

import { createEventId } from "@/lib/utils/calendar";

export const { fieldContext, formContext, useFieldContext } =
  createFormHookContexts();

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {},
  formComponents: {},
});

const conferenceEntryPointSchema = z.object({
  joinUrl: z.object({
    label: z.string().optional(),
    value: z.string(),
  }),
  meetingCode: z.string().optional(),
  accessCode: z.string().optional(),
  password: z.string().optional(),
});

export const conferenceSchema = z.union([
  z.object({
    type: z.literal("create"),
    providerId: z.literal("google"),
  }),
  z.object({
    type: z.literal("conference"),
    conference: z.object({
      id: z.string().optional(),
      conferenceId: z.string().optional(),
      name: z.string().optional(),
      video: conferenceEntryPointSchema.optional(),
      sip: conferenceEntryPointSchema.optional(),
      phone: z.array(conferenceEntryPointSchema).optional(),
      hostUrl: z.string().url().optional(),
      notes: z.string().optional(),
      extra: z.record(z.string(), z.unknown()).optional(),
    }),
  }),
]);

export type FormConference = z.infer<typeof conferenceSchema>;

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
  conference: conferenceSchema.optional(),
  providerId: z.enum(["google", "microsoft"]),
});

export type FormValues = z.infer<typeof formSchema>;

export const initialValues: FormValues = {
  id: createEventId(),
  type: "draft",
  title: "",
  start: Temporal.Now.zonedDateTimeISO().round({
    smallestUnit: "minute",
    roundingIncrement: 15,
    roundingMode: "floor",
  }),
  end: Temporal.Now.zonedDateTimeISO().add({ hours: 2 }).round({
    smallestUnit: "minute",
    roundingIncrement: 15,
    roundingMode: "halfExpand",
  }),
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
  conference: undefined,
  providerId: "google",
};

export interface FormMeta {
  sendUpdate?: boolean;
}

export const defaultFormMeta: FormMeta = {
  sendUpdate: true,
};
