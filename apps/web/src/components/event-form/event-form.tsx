"use client";

import * as React from "react";
import { RepeatIcon } from "lucide-react";
import { Temporal } from "temporal-polyfill";

import {
  CalendarSettings,
  useCalendarSettings,
} from "@/atoms/calendar-settings";
import { useEventOperations } from "@/components/event-calendar/hooks";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { DateInputSection } from "./date-input-section";
import { DescriptionField } from "./description-field";
import { RepeatSelect } from "./repeat-select";
import { formSchema, useAppForm, type FormValues } from "./form";
import { CalendarEvent } from "../event-calendar/types";

function roundTo15Minutes(
  date: Temporal.ZonedDateTime,
): Temporal.ZonedDateTime {
  const roundedMinutes = Math.round(date.minute / 15) * 15;

  return date.with({ minute: roundedMinutes });
}

interface CreateDefaultEvent {
  settings: CalendarSettings;
}

export function createDefaultEvent({ settings }: CreateDefaultEvent): FormValues {
  const timeZone =
    settings.defaultCalendar.timeZone ?? settings.defaultTimeZone;
  const now = Temporal.Now.zonedDateTimeISO(timeZone);

  const start = roundTo15Minutes(now);
  const duration = Temporal.Duration.from({
    minutes: settings.defaultEventDuration,
  });

  return {
    title: "",
    start,
    end: start.add(duration),
    description: "",
    isAllDay: false,
    repeat: {},
    calendarId: settings.defaultCalendar.calendarId,
    accountId: settings.defaultCalendar.accountId,
    providerId: settings.defaultCalendar.providerId,
  };
}

interface ToZonedDateTime {
  date: Temporal.ZonedDateTime | Temporal.Instant | Temporal.PlainDate;
  defaultTimeZone: string;
}

function toZonedDateTime({
  date,
  defaultTimeZone,
}: ToZonedDateTime): Temporal.ZonedDateTime {
  if (date instanceof Temporal.ZonedDateTime) {
    return date;
  }

  if (date instanceof Temporal.Instant) {
    return date.toZonedDateTimeISO(defaultTimeZone);
  }

  return date.toZonedDateTime(defaultTimeZone);
}

interface ParseEvent {
  event: CalendarEvent;
  settings: CalendarSettings;
}

function parseEvent({ event, settings }: ParseEvent): FormValues {
  const start = toZonedDateTime({
    date: event.start,
    defaultTimeZone: settings.defaultTimeZone,
  });
  const end = toZonedDateTime({
    date: event.end,
    defaultTimeZone: settings.defaultTimeZone,
  });

  const formValues: FormValues = {
    title: event.title ?? "",
    start: start,
    end: end,
    description: event.description ?? "",
    isAllDay: event.allDay ?? false,
    repeat: {},
    calendarId: event.calendarId,
    accountId: event.accountId,
    providerId: event.providerId as "google" | "microsoft",
  };

  // console.log("formValues", formValues);
  return formValues;
}

interface ToCalendarEvent {
  formValues: FormValues;
  event?: CalendarEvent;
}

function toCalendarEvent({ formValues, event }: ToCalendarEvent): CalendarEvent {
  return {
    ...event,
    id: event?.id ?? crypto.randomUUID(),
    title: formValues.title,
    description: formValues.description,
    allDay: formValues.isAllDay,
    calendarId: formValues.calendarId,
    accountId: formValues.accountId,
    providerId: formValues.providerId as "google" | "microsoft",
    start: formValues.isAllDay ? formValues.start.toPlainDate() : formValues.start,
    end: formValues.isAllDay ? formValues.end.toPlainDate() : formValues.end,
  };
}

interface EventFormProps {
  event?: CalendarEvent;
}

export function EventForm({ event }: EventFormProps) {
  const { handleEventSave } = useEventOperations();
  const settings = useCalendarSettings();
  const disabled = false;

  const form = useAppForm({
    defaultValues: event
      ? parseEvent({ event, settings })
      : createDefaultEvent({ settings }),
    validators: {
      onBlur: formSchema,
    },
    onSubmit: async ({ value }) => {
      // console.log(value);
    },
    listeners: {
      onBlur: ({ formApi, fieldApi }) => {
        if (!formApi.state.isValid) {
          return;
        }

        const f = toCalendarEvent({ formValues: formApi.state.values, event });

        handleEventSave(f);

        // formApi.handleSubmit();
      },
      onChange: ({ formApi, fieldApi }) => {},
    },
  });

  React.useEffect(() => {
    form.reset();
  }, [event]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();

        form.handleSubmit();
      }}
    >
      <div className={cn("flex flex-col gap-y-1", !event && "hidden")}>
        <div className="p-1">
          <form.Field name="title">
            {(field) => (
              <>
                <label htmlFor={field.name} className="sr-only">
                  Title
                </label>
                <Input
                  id={field.name}
                  className="border-none bg-transparent px-3.5 text-base shadow-none dark:bg-transparent"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Title"
                  disabled={disabled}
                />
              </>
            )}
          </form.Field>
        </div>
        <div className="flex flex-col gap-y-2 rounded-2xl border border-input bg-background px-0.5 py-2.5">
          <div className="px-2.5">
            <DateInputSection form={form} disabled={disabled} />
          </div>
          <Separator />
          <div className="relative grid grid-cols-(--grid-event-form) items-center gap-1 px-2">
            <div className="pointer-events-none absolute inset-0 grid grid-cols-(--grid-event-form) items-center gap-2">
              <div className="col-start-3 ps-1.5">
                <RepeatIcon className="size-4 text-muted-foreground opacity-50 peer-hover:text-foreground" />
              </div>
            </div>
            <form.Field name="isAllDay">
              {(field) => (
                <>
                  <div className="col-start-1 flex ps-1.5">
                    <Switch
                      id={field.name}
                      checked={field.state.value}
                      onCheckedChange={field.handleChange}
                      onBlur={field.handleBlur}
                      size="sm"
                      disabled={disabled}
                    />
                  </div>
                  <Label htmlFor={field.name} className="col-start-2 ps-3.5">
                    All Day
                  </Label>
                </>
              )}
            </form.Field>
            <form.Field name="repeat">
              {(field) => (
                <div className="relative col-span-2 col-start-3">
                  <label htmlFor={field.name} className="sr-only">
                    Repeat
                  </label>
                  <RepeatSelect
                    className="ps-8 shadow-none"
                    value={field.state.value}
                    onChange={field.handleChange}
                    onBlur={field.handleBlur}
                    disabled={disabled}
                  />
                </div>
              )}
            </form.Field>
          </div>
          <Separator />
          <div className="px-2">
            <form.Field name="description">
              {(field) => (
                <>
                  <label htmlFor={field.name} className="sr-only">
                    Description
                  </label>
                  <DescriptionField
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    disabled={disabled}
                  />
                  {/* <FieldInfo field={field} /> */}
                </>
              )}
            </form.Field>
          </div>
        </div>
      </div>
    </form>
  );
}
