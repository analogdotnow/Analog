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

interface RecurringEditScopeDialogProps {
  open: boolean;
  onInstance: () => void;
  onSeries: () => void;
  onCancel: () => void;
  close: () => void;
}

export function RecurringEditScopeDialog({
  open,
  onInstance,
  onSeries,
  onCancel,
  close,
}: RecurringEditScopeDialogProps) {
  const confirmedRef = React.useRef(false);

  const handleClose = React.useCallback(() => {
    if (confirmedRef.current) {
      confirmedRef.current = false;
      return;
    }

    onCancel();
    close();
  }, [onCancel, close]);

  return (
    <AlertDialog
      open={open}
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
                onInstance();
                close();
              }}
            >
              This event only
            </AlertDialogAction>
            <AlertDialogAction
              onClick={() => {
                confirmedRef.current = true;
                onSeries();
                close();
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
