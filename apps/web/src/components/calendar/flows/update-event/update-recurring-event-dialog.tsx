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
import { UpdateQueueContext } from "./update-queue-provider";

export function UpdateRecurringEventDialog() {
  "use memo";

  const actorRef = UpdateQueueContext.useActorRef();
  const open = UpdateQueueContext.useSelector((snapshot) =>
    snapshot.matches("askRecurringScope"),
  );

  const onSelectInstance = React.useCallback(() => {
    actorRef.send({ type: "SCOPE_INSTANCE" });
  }, [actorRef]);

  const onSelectAll = React.useCallback(() => {
    actorRef.send({ type: "SCOPE_SERIES" });
  }, [actorRef]);

  const onCancel = React.useCallback(() => {
    actorRef.send({ type: "CANCEL" });
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
          {/* Plain buttons: an AlertDialogAction closes the dialog itself and
              its onOpenChange(false) would CANCEL the next queued item. */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onSelectInstance}>
              This event only
            </Button>
            <Button onClick={onSelectAll}>All events in the series</Button>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
