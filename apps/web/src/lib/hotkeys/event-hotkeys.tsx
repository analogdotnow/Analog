"use client";

import * as React from "react";
import { useAtomValue } from "jotai";
import { useHotkeys } from "react-hotkeys-hook";
import { Temporal } from "temporal-polyfill";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { useDeleteAction } from "@/components/calendar/flows/delete-event/use-delete-action";
import {
  useCreateDraftAction,
  useUnselectAllAction,
} from "@/components/calendar/hooks/use-optimistic-mutations";
import { useSelectedEvents } from "@/components/calendar/hooks/use-selected-events";
import { DeleteEventConfirmation } from "@/components/delete-event-confirmation";
import { useSidebarWithSide } from "@/components/ui/sidebar";
import { createDraftEvent, isDraftEvent } from "@/lib/utils/calendar";

const KEYBOARD_SHORTCUTS = {
  CREATE_EVENT: "c",
  JOIN_MEETING: "j",
  DELETE_EVENT: "backspace",
  UNSELECT_EVENT: "esc",
} as const;

export function EventHotkeys() {
  const { open: rightSidebarOpen, setOpen: setRightSidebarOpen } =
    useSidebarWithSide("right");
  const settings = useAtomValue(calendarSettingsAtom);
  const selectedEvents = useSelectedEvents();

  const createDraftAction = useCreateDraftAction();

  useHotkeys(
    KEYBOARD_SHORTCUTS.CREATE_EVENT,
    () => {
      const start = Temporal.Now.zonedDateTimeISO(settings.defaultTimeZone);

      const end = start.add({ minutes: settings.defaultEventDuration });

      if (!rightSidebarOpen) {
        setRightSidebarOpen(true);
      }

      const event = createDraftEvent({ start, end });

      createDraftAction(event);
    },
    { scopes: ["event"] },
  );

  useHotkeys(
    KEYBOARD_SHORTCUTS.JOIN_MEETING,
    () => {
      if (!selectedEvents[0] || !selectedEvents[0].conference) {
        return;
      }

      if (!selectedEvents[0].conference?.video?.joinUrl) {
        return;
      }

      window.open(
        selectedEvents[0].conference.video.joinUrl.value,
        "_blank",
        "noopener,noreferrer",
      );
    },
    { scopes: ["event"] },
  );

  useHotkeys(
    KEYBOARD_SHORTCUTS.DELETE_EVENT,
    () => {
      if (!selectedEvents[0]) {
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

  const [open, setOpen] = React.useState(false);

  const onConfirm = React.useCallback(() => {
    if (!selectedEvents[0]) {
      return;
    }

    if (isDraftEvent(selectedEvents[0])) {
      unselectAllAction();
      return;
    }

    deleteAction({ event: selectedEvents[0] });
  }, [selectedEvents, deleteAction, unselectAllAction]);

  if (!selectedEvents[0]) {
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
