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
import { UpdateQueueContext } from "./update-queue-provider";

export function UpdateRecurringEventDialog() {
  const actorRef = UpdateQueueContext.useActorRef();
  const [open, setOpen] = React.useState(false);

  useActorRefSubscription({
    actorRef,
    onUpdate: (snapshot) => {
      if (snapshot.matches("askRecurringScope")) {
        setOpen(true);
      }
    },
  });

  const onSelectInstance = React.useCallback(() => {
    actorRef.send({ type: "SCOPE_INSTANCE" });
    setOpen(false);
  }, [actorRef]);

  const onSelectAll = React.useCallback(() => {
    actorRef.send({ type: "SCOPE_SERIES" });
    setOpen(false);
  }, [actorRef]);

  const onCancel = React.useCallback(() => {
    actorRef.send({ type: "CANCEL" });
    setOpen(false);
  }, [actorRef]);

  return (
    <AlertDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onCancel();
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Edit recurring event</AlertDialogTitle>
          <AlertDialogDescription>
            Do you want to edit only this event or the entire series?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-between">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <div className="flex gap-2">
            <AlertDialogAction variant="outline" onClick={onSelectInstance}>
              This event only
            </AlertDialogAction>
            <AlertDialogAction onClick={onSelectAll}>
              All events in the series
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
