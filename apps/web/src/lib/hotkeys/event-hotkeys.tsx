"use client";

import * as React from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Temporal } from "temporal-polyfill";

import { useDeleteAction } from "@/components/calendar/flows/delete-event/use-delete-action";
import { DeleteEventConfirmation } from "@/components/dialogs/delete-event-confirmation";
import {
  useCreateDraftAction,
  useUnselectAllAction,
} from "@/hooks/calendar/use-optimistic-mutations";
import { getEventById } from "@/lib/db";
import { isOnlineMeeting } from "@/lib/utils/events";
import {
  useDefaultEventDuration,
  useDefaultTimeZone,
  useSelectedEventList,
} from "@/store/hooks";

const KEYBOARD_SHORTCUTS = {
  CREATE_EVENT: "c",
  JOIN_MEETING: "j",
  DELETE_EVENT: "backspace",
  UNSELECT_EVENT: "esc",
} as const;

export function EventHotkeys() {
  const defaultTimeZone = useDefaultTimeZone();
  const defaultEventDuration = useDefaultEventDuration();
  const selectedEventIds = useSelectedEventList();

  const createDraftAction = useCreateDraftAction();

  const [open, setOpen] = React.useState(false);

  useHotkeys(
    KEYBOARD_SHORTCUTS.CREATE_EVENT,
    () => {
      const start = Temporal.Now.zonedDateTimeISO(defaultTimeZone);

      const end = start.add({ minutes: defaultEventDuration });

      createDraftAction({ start, end });
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

      if (!event || !isOnlineMeeting(event)) {
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
