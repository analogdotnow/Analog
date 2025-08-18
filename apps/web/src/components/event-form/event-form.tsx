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
import { useAtom, useAtomValue } from "jotai";
import { diff } from "json-diff-ts";
import { useOnClickOutside } from "usehooks-ts";

import {
  CalendarSettings,
  calendarSettingsAtom,
} from "@/atoms/calendar-settings";
import { formEventAtom, selectedEventsAtom } from "@/atoms/selected-events";
import {
  createDefaultEvent,
  fieldDiff,
  parseCalendarEvent,
  parseDraftEvent,
  toCalendarEvent,
} from "@/components/event-form/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Calendar, CalendarEvent, DraftEvent } from "@/lib/interfaces";
import { RouterOutputs } from "@/lib/trpc";
import { useTRPC } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { createEventId, isDraftEvent } from "@/lib/utils/calendar";
import {
  requiresAttendeeConfirmation,
  requiresRecurrenceConfirmation,
} from "@/lib/utils/events";
import { useCreateAction } from "../calendar/flows/create-event/use-create-action";
import { useUpdateAction } from "../calendar/flows/update-event/use-update-action";
import { useSelectedEvents } from "../calendar/hooks/use-selected-events";
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
      type: "draft",
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
  defaultCalendar?: Calendar;
}

interface EventFormMeta {
  sendUpdate?: boolean;
}

interface FindCalendarOptions {
  calendarId: string;
  accountId: string;
}

function findCalendar(
  accounts: RouterOutputs["calendars"]["list"]["accounts"],
  { calendarId, accountId }: FindCalendarOptions,
): Calendar | undefined {
  return accounts
    .flatMap((a) => a.calendars)
    .find((c) => c.id === calendarId && c.accountId === accountId);
}


export function EventForm() {
  const settings = useAtomValue(calendarSettingsAtom);
  const selectedEvents = useSelectedEvents();
  // const selectedEvents = useAtomValue(selectedEventsAtom);
  const trpc = useTRPC();
  const { data: calendars } = useQuery(trpc.calendars.list.queryOptions());
  const defaultCalendar = calendars?.defaultCalendar;

  const [event, setEvent] = useAtom(formEventAtom);

  const disabled = event?.readOnly;

  const defaultValues = React.useMemo(() => {
    return getDefaultValues({
      event,
      defaultCalendar,
      settings,
    });
  }, [event, defaultCalendar, settings]);

  const ref = React.useRef<HTMLFormElement>(null);
  const focusRef = React.useRef(false);
  const updateAction = useUpdateAction();
  const createAction = useCreateAction();

  const form = useAppForm({
    defaultValues,
    validators: {
      onBlur: formSchema,
      onSubmit: ({ value }) => {
        if (!calendars) {
          return {
            fields: {
              calendar: "Calendar not found",
            },
          };
        }

        const calendar = findCalendar(calendars.accounts, {
          calendarId: value.calendar.calendarId,
          accountId: value.calendar.accountId,
        });

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
    onSubmit: async ({ value, formApi, meta }) => {
      // Already validated in the validators
      const calendar = findCalendar(calendars!.accounts, {
        calendarId: value.calendar.calendarId,
        accountId: value.calendar.accountId,
      })!;

      // If unchanged, do nothing
      if (!formApi.state.isDirty && formApi.state.isDefaultValue) {
        return;
      }

      const formMeta = meta as EventFormMeta | undefined;

      if (value.type === "draft") {
        console.log("createAction", JSON.stringify(value, null, 2));
        await createAction({
          event: toCalendarEvent({ values: value, event, calendar }),
          notify: formMeta?.sendUpdate,
        });
      } else {
        console.log("updateAction", JSON.stringify(value, null, 2));
        await updateAction({
          event: toCalendarEvent({ values: value, event, calendar }),
          notify: formMeta?.sendUpdate,
        });
      }

      focusRef.current = false;
      formApi.reset();
    },
    listeners: {
      onBlur: async ({ formApi }) => {
        focusRef.current = true;

        // console.log("formApi.state.isValid", formApi.state.isValid);
        // console.log(
        //   "formApi.state.isDefaultValue",
        //   formApi.state.isDefaultValue,
        // );
        // console.log("formApi.state.isDirty", formApi.state.isDirty);
        // console.log(
        //   "formApi.state.values",
        //   formApi.state.values.start.toString(),
        // );
        // console.log("formApi.state.values", formApi.state.values.end.toString());
        // If unchanged or invalid, do nothing

        if (
          !formApi.state.isValid ||
          (formApi.state.isDefaultValue && !formApi.state.isDirty)
        ) {
          console.log("unsubmitted");
          return;
        }

        if (
          requiresAttendeeConfirmation(formApi.state.values.attendees) ||
          requiresRecurrenceConfirmation(event?.recurringEventId)
        ) {
          // console.log(
          //   "requiresAttendeeConfirmation",
          //   formApi.state.values.attendees,
          // );
          // console.log(
          //   "requiresRecurrenceConfirmation",
          //   event?.recurringEventId,
          // );
          return;
        }

        await formApi.handleSubmit();
      },
    },
  });

  const handleClickOutside = React.useCallback(async () => {
    if (!focusRef.current) {
      return;
    }

    focusRef.current = false;

    form.handleSubmit();
  }, [form]);

  useOnClickOutside(ref as React.RefObject<HTMLElement>, handleClickOutside);

  React.useEffect(() => {
    const selectedEvent = selectedEvents[0];

    if (!selectedEvent) {
      console.log("no selectedEvent");
      return;
    }

    // console.log(
    //   "diff",
    //   JSON.stringify(
    //     diff(
    //       form.state.values,
    //       getDefaultValues({ event: selectedEvent, defaultCalendar, settings }),
    //     ),
    //     null,
    //     2,
    //   ),
    // );
    // console.log(
    //   "fieldDiff",
    //   JSON.stringify(
    //     fieldDiff(
    //       form.state.values,
    //       getDefaultValues({ event: selectedEvent, defaultCalendar, settings }),
    //     ),
    //     null,
    //     2,
    //   ),
    // );
    // console.log(
    //   "selectedEvent",
    //   form.state.isDefaultValue,
    //   selectedEvent?.id,
    //   event?.id,
    // );
    // If the form is modified and the event changes, keep the modified values
    console.log("form.state.isDefaultValue", form.state.isDefaultValue, "dirty", form.state.isSubmitted);
    if (!form.state.isDefaultValue && form.state.isDirty && selectedEvent?.id === event?.id) {
      console.log("no change");
      return;
    }

    console.log("form.state.isDefaultValue", form.state.isDefaultValue, "dirty", form.state.isSubmitted);
    if (!form.state.isDefaultValue && form.state.isDirty) {
      console.log("handleSubmit");
      form.handleSubmit();
    }


    if (!selectedEvent && !event) {
      console.log("no event");
      return;
    }

    setEvent(selectedEvent);
    focusRef.current = true;

    console.log("reset");
    form.reset();
  }, [selectedEvents, event, form, defaultCalendar, settings, setEvent]);

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
          <form.Subscribe
            selector={(state) => {
              return {
                isDefaultValue: state.isDefaultValue,
                values: state.values.attendees,
              };
            }}
            // eslint-disable-next-line react/no-children-prop
            children={(state) => {
              if (
                state.isDefaultValue ||
                !requiresAttendeeConfirmation(state.values)
              ) {
                return null;
              }

              return (
                <SendUpdateButton
                  className="col-span-4 col-start-1 pt-2"
                  onSave={() =>
                    form.handleSubmit({ meta: { sendUpdate: true } })
                  }
                  onSaveWithoutNotifying={() =>
                    form.handleSubmit({ meta: { sendUpdate: false } })
                  }
                  onDiscard={() => form.reset()}
                />
              );
            }}
          />
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
                items={calendars?.accounts ?? []}
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
