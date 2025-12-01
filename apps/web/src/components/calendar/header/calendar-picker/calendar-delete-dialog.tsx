"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
import { useTRPC } from "@/lib/trpc/client";
import { useCalendarPickerItem } from "./calendar-picker-item-provider";

export function CalendarDeleteDialog() {
  "use memo";

  const {
    calendar,
    deleteDialogOpen: open,
    setDeleteDialogOpen: onOpenChange,
  } = useCalendarPickerItem();

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation(
    trpc.calendars.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.calendars.pathKey() });
        queryClient.invalidateQueries({ queryKey: trpc.events.pathKey() });

        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const onDelete = () => {
    mutate({
      accountId: calendar.accountId,
      calendarId: calendar.id,
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete calendar</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            calendar and its events.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onDelete}
            disabled={isPending}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
