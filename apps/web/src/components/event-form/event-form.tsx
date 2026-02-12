"use client";

import * as React from "react";
import {
  ArrowPathIcon,
  CalendarIcon,
  EyeIcon,
  MapPinIcon,
  // EyeIcon,
  PencilSquareIcon,
  UsersIcon,
} from "@heroicons/react/16/solid";
import { useAtomValue } from "jotai";

import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { requiresAttendeeConfirmation } from "@/lib/utils/events";
import { useCalendarStore } from "@/providers/calendar-store-provider";
import { formDisabledAtom } from "./atoms/form";
import { DateInputSection } from "./date-input-section";
import {
  AttendeeList,
  AttendeeListItem,
} from "./fields/attendees/attendee-list";
import { AttendeeListInput } from "./fields/attendees/attendee-list-input";
import { AvailabilityField } from "./fields/availability-field";
import { CalendarField } from "./fields/calendar-field";
import { DescriptionField } from "./fields/description-field";
import { TitleField } from "./fields/title-field";
import { VisibilityField } from "./fields/visibility-field";
import { FormRow, FormRowIcon } from "./form";
import { LocationField } from "./location/location-field";
import { RecurrenceField } from "./recurrences/recurrence-field";
import { SendUpdateButton } from "./send-update-button";
import { useEventForm } from "./utils/use-event-form";
import { useSubmitOnClickOutside } from "./utils/use-submit-on-click-outside";

interface EventFormProps {
  className?: string;
}

export function EventForm({ className }: EventFormProps) {
  const form = useEventForm();
  const disabled = useAtomValue(formDisabledAtom);
  const setActiveLayout = useCalendarStore((s) => s.setActiveLayout);

  useSubmitOnClickOutside(form);

  const onSubmit = React.useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      e.stopPropagation();
    },
    [],
  );

  const onFocus = React.useCallback(() => {
    setActiveLayout("form");
  }, [setActiveLayout]);

  return (
    <form
      className={cn("flex flex-col gap-y-1", className)}
      onFocusCapture={onFocus}
      onSubmit={onSubmit}
    >
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
      <div className="flex">
        <DateInputSection form={form} disabled={disabled} />
        <div className="flex w-32 flex-col items-end gap-y-1">
          <div className="grid h-8 grid-cols-(--grid-event-form-half) items-center gap-x-1">
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
                      "col-start-2 line-clamp-1 ps-3 pe-4 transition-colors",
                      disabled && "text-muted-foreground/70",
                      !field.state.value && "text-muted-foreground/70",
                    )}
                  >
                    All Day
                  </Label>
                </>
              )}
            </form.Field>
          </div>
          <div className="relative grid grid-cols-(--grid-event-form-half) gap-x-1">
            <form.Field name="recurrence">
              {(field) => (
                <div className="relative col-span-2 col-start-1">
                  <label htmlFor={field.name} className="sr-only">
                    Repeat
                  </label>
                  <RecurrenceField
                    id={field.name}
                    className="w-fit ps-8"
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
            <div className="pointer-events-none absolute inset-0 grid grid-cols-(--grid-event-form-half) items-start gap-2 pt-2">
              <div className="col-start-1 ps-2">
                <ArrowPathIcon
                  className={cn(
                    "size-4 text-muted-foreground/60",
                    disabled && "opacity-50",
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <FormRow>
        <FormRowIcon disabled={disabled}>
          <MapPinIcon />
        </FormRowIcon>
        <form.Field name="location">
          {(field) => (
            <div className="col-span-4 col-start-1">
              <label htmlFor={field.name} className="sr-only">
                Location
              </label>
              <form.Field name="conference">
                {(conferenceField) => (
                  <LocationField
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={field.handleChange}
                    disabled={disabled}
                    conference={conferenceField.state.value}
                    onRemoveConference={() =>
                      conferenceField.handleChange(null)
                    }
                  />
                )}
              </form.Field>
            </div>
          )}
        </form.Field>
      </FormRow>
      <Separator />
      <FormRow>
        <FormRowIcon disabled={disabled}>
          <UsersIcon />
        </FormRowIcon>
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
          }}
        >
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
        <FormRowIcon disabled={disabled}>
          <PencilSquareIcon />
        </FormRowIcon>
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
      <div className="flex gap-x-1 px-0">
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
        <FormRow>
          <FormRowIcon disabled={disabled}>
            <EyeIcon />
          </FormRowIcon>
          <form.Field name="visibility">
            {(field) => (
              <div className="col-span-4 col-start-1">
                <label htmlFor={field.name} className="sr-only">
                  Visibility
                </label>
                <VisibilityField
                  id={field.name}
                  value={field.state.value}
                  onChange={field.handleChange}
                  disabled={disabled}
                  showConfidential={
                    form.state.values.visibility === "confidential"
                  }
                />
              </div>
            )}
          </form.Field>
        </FormRow>
        <FormRow>
          <FormRowIcon disabled={disabled}>
            <CalendarIcon />
          </FormRowIcon>
          <form.Field name="availability">
            {(field) => (
              <div className="col-span-4 col-start-1">
                <label htmlFor={field.name} className="sr-only">
                  Show as
                </label>
                <AvailabilityField
                  id={field.name}
                  value={field.state.value}
                  onChange={field.handleChange}
                  disabled={disabled}
                />
              </div>
            )}
          </form.Field>
        </FormRow>
      </div>
    </form>
  );
}
