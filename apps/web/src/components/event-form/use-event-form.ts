"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAtom, useAtomValue } from "jotai";
import { useOnClickOutside } from "usehooks-ts";

import {
  CalendarSettings,
  calendarSettingsAtom,
} from "@/atoms/calendar-settings";
import { formEventAtom } from "@/atoms/selected-events";
import {
  createDefaultEvent,
  parseCalendarEvent,
  parseDraftEvent,
  toCalendarEvent,
} from "@/components/event-form/utils";
import { Calendar, CalendarEvent, DraftEvent } from "@/lib/interfaces";
import { RouterOutputs } from "@/lib/trpc";
import { useTRPC } from "@/lib/trpc/client";
import { createEventId, isDraftEvent } from "@/lib/utils/calendar";
import {
  requiresAttendeeConfirmation,
  requiresRecurrenceConfirmation,
} from "@/lib/utils/events";
import { useCreateAction } from "../calendar/flows/create-event/use-create-action";
import { useUpdateAction } from "../calendar/flows/update-event/use-update-action";
import { useSelectedEvents } from "../calendar/hooks/use-selected-events";
import { FormValues, defaultValues, formSchema, useAppForm } from "./form";

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

export function useEventForm() {
  const settings = useAtomValue(calendarSettingsAtom);
  const selectedEvents = useSelectedEvents();

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
        await createAction({
          event: toCalendarEvent({ values: value, event, calendar }),
          notify: formMeta?.sendUpdate,
        });

        focusRef.current = false;
        formApi.reset();
      } else {
        await updateAction({
          event: toCalendarEvent({ values: value, event, calendar }),
          notify: formMeta?.sendUpdate,
        });

        focusRef.current = false;
        formApi.reset();
      }
    },
    listeners: {
      onBlur: async ({ formApi }) => {
        focusRef.current = true;

        // If unchanged or invalid, do nothing
        if (
          !formApi.state.isValid ||
          (formApi.state.isDefaultValue && !formApi.state.isDirty)
        ) {
          return;
        }

        if (
          requiresAttendeeConfirmation(formApi.state.values.attendees) ||
          requiresRecurrenceConfirmation(event?.recurringEventId)
        ) {
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
      return;
    }

    // If the form is modified and the event changes, keep the modified values
    if (
      !form.state.isDefaultValue &&
      form.state.isDirty &&
      selectedEvent?.id === event?.id
    ) {
      return;
    }

    if (!form.state.isDefaultValue && form.state.isDirty) {
      form.handleSubmit();
    }

    if (!selectedEvent && !event) {
      return;
    }

    setEvent(selectedEvent);
    focusRef.current = true;

    form.reset();
  }, [selectedEvents, event, form, defaultCalendar, settings, setEvent]);

  return {
    form,
    disabled,
    ref,
    focusRef,
    calendars,
    event,
  };
}
