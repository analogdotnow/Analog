"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTRPC } from "@/lib/trpc/client";
import { useCalendarPickerItem } from "./calendar-picker-item-provider";

export function CalendarRenameDialog() {
  "use memo";

  const {
    calendar,
    renameDialogOpen: open,
    setRenameDialogOpen: onOpenChange,
  } = useCalendarPickerItem();

  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [name, setName] = React.useState(calendar.name);

  React.useEffect(() => {
    setName(calendar.name);
  }, [calendar.name, open]);

  const { mutate, isPending } = useMutation(
    trpc.calendars.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.calendars.pathKey() });
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const onSubmit = () => {
    mutate({
      id: calendar.id,
      accountId: calendar.accountId,
      name: name.trim(),
    });
  };

  const onCancel = () => {
    setName(calendar.name);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename calendar</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`rename-${calendar.id}`}>Name</Label>
          <Input
            id={`rename-${calendar.id}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isPending}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
