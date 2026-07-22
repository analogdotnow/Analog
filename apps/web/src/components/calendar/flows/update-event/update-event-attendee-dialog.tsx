"use client";

import * as React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { isNotifyRequired } from "@/lib/providers";
import { UpdateQueueContext } from "./update-queue-provider";

export function UpdateEventAttendeeDialog() {
  "use memo";

  const actorRef = UpdateQueueContext.useActorRef();
  const open = UpdateQueueContext.useSelector((snapshot) =>
    snapshot.matches("askNotifyAttendee"),
  );
  const notifyRequired = UpdateQueueContext.useSelector((snapshot) =>
    isNotifyRequired(snapshot.context.item?.event.calendar.provider.id),
  );

  const onSaveAndNotify = React.useCallback(() => {
    actorRef.send({ type: "NOTIFY_CHOICE", notify: true });
  }, [actorRef]);

  const onSave = React.useCallback(() => {
    actorRef.send({ type: "NOTIFY_CHOICE", notify: false });
  }, [actorRef]);

  const onCancel = React.useCallback(() => {
    actorRef.send({ type: "CANCEL" });
  }, [actorRef]);

  return (
    <AlertDialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          onCancel();
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Update Event</AlertDialogTitle>
          <AlertDialogDescription>
            This event has other attendees. How would you like to proceed?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-between">
          <AlertDialogCancel>Discard</AlertDialogCancel>
          <div className="flex gap-2">
            <AlertDialogAction
              variant="outline"
              disabled={notifyRequired}
              onClick={onSave}
            >
              Save
            </AlertDialogAction>
            <AlertDialogAction onClick={onSaveAndNotify}>
              Save and notify attendees
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
