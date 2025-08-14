"use client";

import * as React from "react";
import {
  ArrowPathIcon,
  MapPinIcon,
  PencilSquareIcon,
  UsersIcon,
  VideoCameraIcon,
} from "@heroicons/react/16/solid";
import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";

import {
  CalendarSettings,
  calendarSettingsAtom,
} from "@/atoms/calendar-settings";
import type { Action } from "@/components/calendar/hooks/use-optimistic-events";
import {
  createDefaultEvent,
  parseCalendarEvent,
  parseDraftEvent,
  toCalendarEvent,
} from "@/components/event-form/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Calendar, CalendarEvent, DraftEvent } from "@/lib/interfaces";
import { useTRPC } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { createEventId, isDraftEvent } from "@/lib/utils/calendar";
import { isUserOnlyAttendee } from "@/lib/utils/events";
import { AttendeeList, AttendeeListItem } from "./attendees/attendee-list";
import { AttendeeListInput } from "./attendees/attendee-list-input";
import { CalendarField } from "./calendar-field";
import { ConferenceDetails } from "./conference/conference-details";
import { DateInputSection } from "./date-input-section";
import { DescriptionField } from "./description-field";
import { FormValues, defaultValues, formSchema, useAppForm } from "./form";
import { FormRow, FormRowIcon } from "./form-row";
import { LocationField } from "./location-field";
import { RecurrenceField } from "./recurrences/recurrence-field";
import { SendUpdateButton } from "./send-update-button";

interface GetDefaultValuesOptions {
  event?: CalendarEvent | DraftEvent;
  defaultCalendar?: Calendar;
  settings: CalendarSettings;
}

function getDefaultValues({
  event,
  defaultCalendar,
  settings,
}: GetDefaultValuesOptions): FormValues {
  if (!defaultCalendar) {
    return {
      ...defaultValues,
      id: createEventId(),
    };
  }

  if (!event) {
    return createDefaultEvent({ settings, defaultCalendar });
  }

  if (isDraftEvent(event)) {
    return parseDraftEvent({
      event,
      defaultCalendar,
      settings,
    });
  }

  return parseCalendarEvent({ event, settings });
}

interface EventFormProps {
  selectedEvent?: CalendarEvent | DraftEvent;
  dispatchAsyncAction: (action: Action) => Promise<void>;
  defaultCalendar?: Calendar;
}

export function EventForm({
  selectedEvent,
  dispatchAsyncAction,
  defaultCalendar,
}: EventFormProps) {
  const settings = useAtomValue(calendarSettingsAtom);

  const trpc = useTRPC();
  const query = useQuery(trpc.calendars.list.queryOptions());

  const [event, setEvent] = React.useState(selectedEvent);
  const [manualSubmit, setManualSubmit] = React.useState(false);

  const disabled = event?.readOnly;

  const defaultValues = React.useMemo(() => {
    return getDefaultValues({
      event,
      defaultCalendar,
      settings,
    });
  }, [event, defaultCalendar, settings]);

  const form = useAppForm({
    defaultValues,
    validators: {
      onBlur: formSchema,
      onSubmit: ({ value }) => {
        const calendar = query.data?.accounts
          .flatMap((a) => a.calendars)
          .find((c) => c.id === value.calendar.calendarId);

        if (!calendar) {
          return {
            fields: {
              calendar: "Calendar not found",
            },
          };
        }

        const isNewEvent = !event || isDraftEvent(event);

        if (isNewEvent && value.title.trim() === "") {
          return {
            fields: {
              title: "Title is required",
            },
          };
        }

        return undefined;
      },
    },
    onSubmit: async ({ value, formApi }) => {
      const calendar = query.data?.accounts
        .flatMap((a) => a.calendars)
        .find((c) => c.id === value.calendar.calendarId);

      if (!formApi.state.isDirty) {
        return;
      }

      await dispatchAsyncAction({
        type: "update",
        event: toCalendarEvent({ values: value, event, calendar }),
        force: {
          sendUpdate: true,
        },
      });

      setManualSubmit(false);
    },
    listeners: {
      onBlur: async ({ formApi }) => {
        if (!formApi.state.isValid || formApi.state.isDefaultValue) {
          setManualSubmit(false);
          return;
        }

        if (
          formApi.state.fieldMeta.attendees.isDirty ||
          !isUserOnlyAttendee(formApi.state.values.attendees)
        ) {
          setManualSubmit(true);
          return;
        }

        await formApi.handleSubmit();
      },
    },
  });

  const saveEvent = React.useCallback(async () => {
    const calendar = query.data?.accounts
      .flatMap((a) => a.calendars)
      .find((c) => c.id === form.state.values.calendar.calendarId);

    if (!calendar) {
      return;
    }

    const isNewEvent = !event || isDraftEvent(event);

    if (isNewEvent && form.state.values.title.trim() === "") {
      return;
    }

    await dispatchAsyncAction({
      type: "update",
      event: toCalendarEvent({ values: form.state.values, event, calendar }),
    });
  }, [dispatchAsyncAction, event, form.state.values, query.data?.accounts]);

  React.useEffect(() => {
    // If the form is modified and the event changes, keep the modified values
    if (form.state.isDirty && selectedEvent?.id === event?.id) {
      return;
    }

    if (!form.state.isDefaultValue) {
      saveEvent();
    }

    setManualSubmit(false);
    setEvent(selectedEvent);

    form.reset();
  }, [selectedEvent, event, form, saveEvent]);

  return (
    <form
      className={cn("flex flex-col gap-y-1")}
      onSubmit={async (e) => {
        e.preventDefault();
        e.stopPropagation();

        await form.handleSubmit();
      }}
    >
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
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.currentTarget.blur();
                  }
                }}
                placeholder="Title"
                disabled={disabled}
              />
            </>
          )}
        </form.Field>
      </div>
      <FormContainer>
        <div className="px-2">
          <DateInputSection form={form} disabled={disabled} />
        </div>
        <Separator />
        <FormRow className="gap-x-1">
          <div className="pointer-events-none absolute inset-0 grid grid-cols-(--grid-event-form) items-center gap-2">
            <div className="col-start-3 ps-1.5">
              <ArrowPathIcon className="size-4 text-muted-foreground peer-hover:text-foreground" />
            </div>
          </div>
          <form.Field name="isAllDay">
            {(field) => (
              <>
                <div className="col-start-1 flex ps-2">
                  <Switch
                    id={field.name}
                    checked={field.state.value}
                    onCheckedChange={field.handleChange}
                    onBlur={field.handleBlur}
                    size="sm"
                    disabled={disabled}
                  />
                </div>
                <Label
                  htmlFor={field.name}
                  className={cn(
                    "col-start-2 ps-3.5",
                    disabled && "text-muted-foreground/70",
                  )}
                >
                  All Day
                </Label>
              </>
            )}
          </form.Field>
          <form.Field name="recurrence">
            {(field) => (
              <div className="relative col-span-2 col-start-3">
                <label htmlFor={field.name} className="sr-only">
                  Repeat
                </label>
                <RecurrenceField
                  id={field.name}
                  className="ps-8"
                  recurringEventId={event?.recurringEventId}
                  date={form.state.values.start}
                  value={field.state.value}
                  onChange={field.handleChange}
                  onBlur={field.handleBlur}
                  disabled={disabled}
                />
              </div>
            )}
          </form.Field>
        </FormRow>
        <Separator />
        {event?.conference ? (
          <>
            <FormRow>
              <FormRowIcon icon={VideoCameraIcon} />
              <div className="col-span-4 col-start-1 flex flex-col pe-1">
                <ConferenceDetails conference={event?.conference} />
              </div>
            </FormRow>
            <Separator />
          </>
        ) : null}
        <FormRow>
          <FormRowIcon icon={MapPinIcon} />
          <form.Field name="location">
            {(field) => (
              <div className="col-span-4 col-start-1">
                <label htmlFor={field.name} className="sr-only">
                  Location
                </label>
                <LocationField
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    field.handleChange(e.target.value)
                  }
                />
              </div>
            )}
          </form.Field>
        </FormRow>
        <Separator />
        <FormRow>
          <FormRowIcon icon={UsersIcon} />
          <form.Field name="attendees" mode="array">
            {(field) => {
              return (
                <>
                  <div className="col-span-4 col-start-1 flex flex-col pe-1">
                    <AttendeeList
                      className={cn(field.state.value.length > 0 && "py-0.5")}
                    >
                      {field.state.value.filter(Boolean).map((v, i) => {
                        return (
                          <form.Field key={i} name={`attendees[${i}]`}>
                            {(subField) => {
                              // This is a workaround, for some reason the value is sometimes undefined
                              if (!subField.state.value) {
                                return null;
                              }

                              return (
                                <AttendeeListItem
                                  name={subField.state.value.name}
                                  email={subField.state.value.email}
                                  status={subField.state.value.status}
                                  type={subField.state.value.type}
                                  organizer={subField.state.value.organizer}
                                  disabled={disabled}
                                  onRemove={() => {
                                    field.removeValue(i);
                                    field.handleBlur();
                                  }}
                                  onToggleOptional={(type) => {
                                    subField.handleChange({
                                      ...subField.state.value,
                                      type,
                                    });
                                    subField.handleBlur();
                                  }}
                                />
                              );
                            }}
                          </form.Field>
                        );
                      })}
                    </AttendeeList>
                  </div>
                  <div
                    className={cn(
                      "col-span-4 col-start-1 flex flex-col gap-y-2",
                      field.state.value.length > 0 &&
                        "col-span-3 col-start-2 ps-2 pt-1",
                    )}
                  >
                    <AttendeeListInput
                      className={cn(
                        "ps-8",
                        field.state.value.length > 0 && "ps-2.5",
                      )}
                      onComplete={(email) => {
                        field.pushValue({
                          name: "",
                          email,
                          status: "unknown",
                          type: "required",
                        });
                      }}
                      disabled={disabled}
                      unConfirmed={
                        field.state.meta.isDirty && !field.state.meta.isBlurred
                      }
                    />
                  </div>
                </>
              );
            }}
          </form.Field>
          {manualSubmit ? (
            <SendUpdateButton
              className="col-span-4 col-start-1"
              onSave={() => form.handleSubmit({ meta: { sendUpdate: true } })}
              onSaveWithoutNotifying={() =>
                form.handleSubmit({ meta: { sendUpdate: false } })
              }
              onDiscard={() => form.reset()}
            />
          ) : null}
        </FormRow>
        <Separator />
        <FormRow>
          <FormRowIcon icon={PencilSquareIcon} />
          <form.Field name="description">
            {(field) => (
              <div className="col-span-4 col-start-1">
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
              </div>
            )}
          </form.Field>
        </FormRow>
      </FormContainer>
      <div className="">
        <form.Field name="calendar">
          {(field) => (
            <>
              <label htmlFor={field.name} className="sr-only">
                Title
              </label>
              <CalendarField
                className="px-4 text-base"
                id={field.name}
                value={field.state.value}
                items={query.data?.accounts ?? []}
                onChange={(value) => {
                  field.handleChange(value);
                  field.handleBlur();
                }}
                disabled={disabled}
              />
            </>
          )}
        </form.Field>
      </div>
    </form>
  );
}

function FormContainer({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col gap-y-2 rounded-2xl border border-input bg-background px-0.5 py-2.5",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
