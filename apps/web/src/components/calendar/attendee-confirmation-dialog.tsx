"use client";

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
  confirmationDialog: ConfirmationDialogState;
}

export function AttendeeConfirmationDialog({
  confirmationDialog,
}: AttendeeConfirmationDialogProps) {
  return (
    <AlertDialog
      open={confirmationDialog.open}
      onOpenChange={(open) => {
        if (!open) {
          confirmationDialog.onCancel();
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {confirmationDialog.type === "update"
              ? "Update Event"
              : "Delete Event"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {confirmationDialog.type === "update"
              ? "This event has other attendees. How would you like to proceed?"
              : "This event has other attendees. Do you want to notify them about the deletion?"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-between">
          <AlertDialogCancel onClick={confirmationDialog.onCancel}>
            Discard
          </AlertDialogCancel>
          <div className="flex gap-2">
            <AlertDialogAction
              variant="outline"
              onClick={() => confirmationDialog.onConfirm(false)}
            >
              {confirmationDialog.type === "update" ? "Save" : "Delete"}
            </AlertDialogAction>
            <AlertDialogAction onClick={() => confirmationDialog.onConfirm(true)}>
              {confirmationDialog.type === "update"
                ? "Save and notify attendees"
                : "Delete and notify attendees"}
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
