"use client";

import * as React from "react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
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
          {/* Plain buttons: an AlertDialogAction closes the dialog itself and
              its onOpenChange(false) would CANCEL the next queued item. */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={notifyRequired}
              onClick={onSave}
            >
              Delete
            </Button>
            <Button onClick={onSaveAndNotify}>
              Delete and notify attendees
            </Button>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
