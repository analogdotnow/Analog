"use client";

import * as React from "react";
import { useAtomValue } from "jotai";
import { useHotkeys } from "react-hotkeys-hook";
import { Temporal } from "temporal-polyfill";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { selectedEventIdsAtom } from "@/atoms/selected-events";
import { useDeleteAction } from "@/components/calendar/flows/delete-event/use-delete-action";
import {
  useCreateDraftAction,
  useUnselectAllAction,
} from "@/components/calendar/hooks/use-optimistic-mutations";
import { DeleteEventConfirmation } from "@/components/dialogs/delete-event-confirmation";
import { createDraftEvent } from "@/lib/utils/calendar";
import { getEventById } from "../db";

const KEYBOARD_SHORTCUTS = {
  CREATE_EVENT: "c",
  JOIN_MEETING: "j",
  DELETE_EVENT: "backspace",
  UNSELECT_EVENT: "esc",
} as const;

export function EventHotkeys() {
  const settings = useAtomValue(calendarSettingsAtom);
  const selectedEventIds = useAtomValue(selectedEventIdsAtom);

  const createDraftAction = useCreateDraftAction();

  const [open, setOpen] = React.useState(false);

  useHotkeys(
    KEYBOARD_SHORTCUTS.CREATE_EVENT,
    () => {
      const start = Temporal.Now.zonedDateTimeISO(settings.defaultTimeZone);

      const end = start.add({ minutes: settings.defaultEventDuration });

      const event = createDraftEvent({ start, end });

      createDraftAction(event);
    },
    { scopes: ["event"] },
  );

  useHotkeys(
    KEYBOARD_SHORTCUTS.JOIN_MEETING,
    async () => {
      if (!selectedEventIds[0]) {
        return;
      }

      const event = await getEventById(selectedEventIds[0]);

      if (
        event?.conference?.type !== "conference" ||
        !event?.conference?.video?.joinUrl
      ) {
        return;
      }

      window.open(
        event.conference.video.joinUrl.value,
        "_blank",
        "noopener,noreferrer",
      );
    },
    { scopes: ["event"] },
  );

  useHotkeys(
    KEYBOARD_SHORTCUTS.DELETE_EVENT,
    () => {
      if (!selectedEventIds[0]) {
        return;
      }

      setOpen(true);
    },
    { scopes: ["event"] },
  );

  const deleteAction = useDeleteAction();
  const unselectAllAction = useUnselectAllAction();

  useHotkeys(
    KEYBOARD_SHORTCUTS.UNSELECT_EVENT,
    () => {
      unselectAllAction();
    },
    { scopes: ["event"] },
  );

  const onConfirm = React.useCallback(async () => {
    if (!selectedEventIds[0]) {
      return;
    }

    const event = await getEventById(selectedEventIds[0]);

    if (!event) {
      unselectAllAction();
      return;
    }

    deleteAction({ event });
  }, [selectedEventIds, deleteAction, unselectAllAction]);

  if (!selectedEventIds[0]) {
    return null;
  }

  return (
    <DeleteEventConfirmation
      open={open}
      onOpenChange={setOpen}
      onConfirm={onConfirm}
    />
  );
}
