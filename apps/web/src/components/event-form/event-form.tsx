"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowPathIcon,
  MapPinIcon,
  PencilSquareIcon,
  UsersIcon,
  VideoCameraIcon,
} from "@heroicons/react/16/solid";
import { useOnClickOutside } from "usehooks-ts";

import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { requiresAttendeeConfirmation } from "@/lib/utils/events";
import { useTRPC } from "@/lib/trpc/client";
import { useEventQueryParams } from "@/components/calendar/hooks/use-events";
import { toCalendarEvent } from "@/components/event-form/utils";
import { useFormAction } from "@/components/calendar/flows/event-form/use-form-action";
import { toast } from "sonner";
import { AttendeeList, AttendeeListItem } from "./attendees/attendee-list";
import { AttendeeListInput } from "./attendees/attendee-list-input";
import { CalendarField } from "./calendar-field";
import { ConferenceSelect } from "./conference-select";
import { DateInputSection } from "./date-input-section";
import { DescriptionField } from "./description-field";
import { FormRow, FormRowIcon } from "./form-row";
import { LocationField } from "./location-field";
import { RecurrenceField } from "./recurrences/recurrence-field";
import { SendUpdateButton } from "./send-update-button";
import { TitleField } from "./title-field";
import { useEventForm } from "./use-event-form";

function useClickOutsideEventForm(onClickOutside: () => void) {
  const ref = React.useRef<HTMLFormElement>(null);
  const focusRef = React.useRef(false);

  const handleClickOutside = React.useCallback(async () => {
    if (!focusRef.current) {
      return;
    }

    focusRef.current = false;

    onClickOutside();
  }, [onClickOutside, focusRef]);

  useOnClickOutside(ref as React.RefObject<HTMLElement>, handleClickOutside);
}

export function EventForm() {
  const { form, disabled } = useEventForm();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { queryKey } = useEventQueryParams();
  const formAction = useFormAction();

  const ref = React.useRef<HTMLFormElement>(null);
  const focusRef = React.useRef(false);

  const handleClickOutside = React.useCallback(async () => {
    if (!focusRef.current) {
      return;
    }

    focusRef.current = false;

    form.handleSubmit();
  }, [form, focusRef]);

  useOnClickOutside(ref as React.RefObject<HTMLElement>, handleClickOutside);

  // Create Google Meet when the user selects "Create" in conference field
  const createConferenceMutation = useMutation(
    trpc.conferencing.create.mutationOptions({
      onError: (err) => {
        toast.error(err.message);
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey });
      },
    }),
  );

  const creatingRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    const values = form.state.values;
    const conf = values.conference;

    // Only handle Google provider for now
    if (conf?.type !== "create") {
      return;
    }

    if (values.providerId !== "google") {
      // Reset selection and inform the user
      toast.error("Conference creation is only supported on Google calendars.");
      const updated = { ...values, conference: undefined } as const;
      formAction(toCalendarEvent({ values: updated }));
      return;
    }

    // Avoid duplicate runs per event id
    if (creatingRef.current === values.id) {
      return;
    }

    // If this is a draft, save it first; the effect will re-run once it's an event
    if (values.type === "draft") {
      void form.handleSubmit();
      return;
    }

    creatingRef.current = values.id;

    const payload = {
      calendarId: values.calendar.calendarId,
      eventId: values.id,
      conferencingAccountId: values.calendar.accountId,
      calendarAccountId: values.calendar.accountId,
      providerId: "google" as const,
      agenda: values.title || "Meeting",
      startTime: values.start.toInstant().toString(),
      endTime: values.end.toInstant().toString(),
      timeZone: values.start.timeZoneId,
    };

    createConferenceMutation
      .mutateAsync(payload)
      .then((res) => {
        if (!res?.conference) return;

        // Update the form event with the new conference details
        const updated = {
          ...values,
          conference: { type: "conference", conference: res.conference },
        } as const;

        formAction(toCalendarEvent({ values: updated }));
      })
      .catch(() => {
        // Reset to no conference on failure
        const updated = { ...values, conference: undefined } as const;
        formAction(toCalendarEvent({ values: updated }));
      })
      .finally(() => {
        // Allow re-trying for this event id in case user toggles again
        creatingRef.current = null;
      });
  }, [form.state.values, createConferenceMutation, formAction, queryClient, queryKey]);

  return (
    <form
      ref={ref}
      className={cn("flex flex-col gap-y-1")}
      onFocusCapture={() => {
        focusRef.current = true;
      }}
      onSubmit={async (e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div className="px-2 py-1">
        <form.Field name="title">
          {(field) => (
            <>
              <label htmlFor={field.name} className="sr-only">
                Title
              </label>
              <TitleField
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={field.handleChange}
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
                  recurringEventId={form.state.values.recurringEventId}
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
        <FormRow>
          <FormRowIcon icon={VideoCameraIcon} />
          <form.Field name="conference">
            {(field) => (
              <div className="col-span-4 col-start-1">
                <label htmlFor={field.name} className="sr-only">
                  Conference
                </label>
                <ConferenceSelect
                  value={field.state.value}
                  onChange={field.handleChange}
                  onBlur={field.handleBlur}
                />
              </div>
            )}
          </form.Field>
        </FormRow>
        <Separator />
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
                  onChange={field.handleChange}
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
          <form.Subscribe
            selector={(state) => {
              return {
                isDefaultValue: state.isDefaultValue,
                values: state.values.attendees,
              };
            }}>
              {({ isDefaultValue, values }) => {
                if (isDefaultValue || !requiresAttendeeConfirmation(values)) {
                  return null;
                }

                return (
                  <SendUpdateButton
                    className="col-span-4 col-start-1 pt-2"
                    onSave={() => form.handleSubmit({ sendUpdate: true })}
                    onSaveWithoutNotifying={() =>
                      form.handleSubmit({ sendUpdate: false })
                    }
                    onDiscard={() => form.reset()}
                  />
                );
              }}
            </form.Subscribe>
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
                  onChange={field.handleChange}
                  disabled={disabled}
                />
              </div>
            )}
          </form.Field>
        </FormRow>
      </FormContainer>
      <div className="px-2">
        <form.Field name="calendar">
          {(field) => (
            <>
              <label htmlFor={field.name} className="sr-only">
                Calendar
              </label>
              <CalendarField
                className="px-1.5 text-base"
                id={field.name}
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
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
      className={cn("flex flex-col gap-y-2 px-0 py-2.5", className)}
      {...props}
    >
      {children}
    </div>
  );
}
