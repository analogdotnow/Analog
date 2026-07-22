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
import { DeleteQueueContext } from "./delete-queue-provider";

export function DeleteEventAttendeeDialog() {
  "use memo";

  const actorRef = DeleteQueueContext.useActorRef();
  const open = DeleteQueueContext.useSelector((snapshot) =>
    snapshot.matches("askNotifyAttendee"),
  );
  const notifyRequired = DeleteQueueContext.useSelector((snapshot) =>
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
          <AlertDialogTitle>Delete Event</AlertDialogTitle>
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
              Delete
            </AlertDialogAction>
            <AlertDialogAction onClick={onSaveAndNotify}>
              Delete and notify attendees
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
