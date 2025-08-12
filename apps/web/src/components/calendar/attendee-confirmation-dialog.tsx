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
import type { CalendarEvent } from "@/lib/interfaces";

interface ConfirmationDialogState {
  open: boolean;
  type: "update" | "delete";
  event: CalendarEvent | null;
  onConfirm: (sendUpdate: boolean) => void;
  onCancel: () => void;
}

interface AttendeeConfirmationDialogProps {
  dialog: ConfirmationDialogState;
}

export function AttendeeConfirmationDialog({
  dialog,
}: AttendeeConfirmationDialogProps) {
  const confirmedRef = React.useRef(false);

  const onClose = React.useCallback(() => {
    if (confirmedRef.current) {
      confirmedRef.current = false;
      return;
    }

    dialog.onCancel();
  }, [dialog]);

  return (
    <AlertDialog
      open={dialog.open}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {dialog.type === "update" ? "Update Event" : "Delete Event"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {dialog.type === "update"
              ? "This event has other attendees. How would you like to proceed?"
              : "This event has other attendees. Do you want to notify them about the deletion?"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-between">
          <AlertDialogCancel>Discard</AlertDialogCancel>
          <div className="flex gap-2">
            <AlertDialogAction
              variant="outline"
              onClick={() => {
                confirmedRef.current = true;
                dialog.onConfirm(false);
              }}
            >
              {dialog.type === "update" ? "Save" : "Delete"}
            </AlertDialogAction>
            <AlertDialogAction
              onClick={() => {
                confirmedRef.current = true;
                dialog.onConfirm(true);
              }}
            >
              {dialog.type === "update"
                ? "Save and notify attendees"
                : "Delete and notify attendees"}
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
