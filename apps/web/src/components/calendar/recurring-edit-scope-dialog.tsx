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
import { CalendarEvent } from "@/lib/interfaces";

type RecurringEditScopeDialogState = {
  open: boolean;
  event: CalendarEvent | null;
  onInstance: () => void;
  onSeries: () => void;
  onCancel: () => void;
  close: () => void;
};

interface RecurringEditScopeDialogProps {
  dialog: RecurringEditScopeDialogState;
}

export function RecurringEditScopeDialog({
  dialog,
}: RecurringEditScopeDialogProps) {
  const confirmedRef = React.useRef(false);

  const handleClose = React.useCallback(() => {
    if (confirmedRef.current) {
      confirmedRef.current = false;
      return;
    }

    dialog.onCancel();
    dialog.close();
  }, [dialog]);

  return (
    <AlertDialog
      open={dialog.open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose();
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
            <AlertDialogAction
              variant="outline"
              onClick={() => {
                confirmedRef.current = true;
                dialog.onInstance();
                dialog.close();
              }}
            >
              This event only
            </AlertDialogAction>
            <AlertDialogAction
              onClick={() => {
                confirmedRef.current = true;
                dialog.onSeries();
                dialog.close();
              }}
            >
              All events in the series
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
