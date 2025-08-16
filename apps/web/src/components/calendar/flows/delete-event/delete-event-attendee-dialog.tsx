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
import { useActorRefSubscription } from "../use-actor-subscription";
import { DeleteQueueContext } from "./delete-queue-provider";

export function DeleteEventAttendeeDialog() {
  // const item = DeleteQueueContext.useSelector((state) => state.context.item);
  const actorRef = DeleteQueueContext.useActorRef();

  const [open, setOpen] = React.useState(false);

  useActorRefSubscription({
    actorRef,
    onUpdate: (snapshot) => {
      if (snapshot.matches("askNotifyAttendee")) {
        setOpen(true);
      }
    },
  });

  const onSaveAndNotify = React.useCallback(() => {
    actorRef.send({ type: "NOTIFY_CHOICE", notify: true });
    setOpen(false);
  }, [actorRef]);

  const onSave = React.useCallback(() => {
    actorRef.send({ type: "NOTIFY_CHOICE", notify: false });
    setOpen(false);
  }, [actorRef]);

  const onCancel = React.useCallback(() => {
    actorRef.send({ type: "CANCEL" });
    setOpen(false);
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
            <AlertDialogAction variant="outline" onClick={onSave}>
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
