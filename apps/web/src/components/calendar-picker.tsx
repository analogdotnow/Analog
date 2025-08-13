"use client";

import * as React from "react";
import {
  EllipsisHorizontalIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/16/solid";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { CheckIcon } from "lucide-react";
import { toast } from "sonner";

import {
  calendarPreferencesAtom,
  getCalendarPreference,
  setCalendarPreference,
} from "@/atoms/calendar-preferences";
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
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { calendarColorVariable } from "@/lib/css";
import { Calendar } from "@/lib/interfaces";
import { useTRPC } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { CalendarToggle } from "./calendar-toggle";

interface VisibleCalendarProps {
  calendars?: Calendar[];
}

function VisibleCalendars({ calendars }: VisibleCalendarProps) {
  return (
    <div className="flex -space-x-1">
      {calendars
        ?.slice(0, calendars.length > 3 ? 3 : calendars.length)
        .map((calendar) => (
          <div
            key={`${calendar.accountId}.${calendar.id}`}
            className="size-4 rounded-full bg-(--calendar-color) ring-2 ring-background group-hover/trigger:ring-border"
            style={
              {
                "--calendar-color": `var(${calendarColorVariable(calendar.accountId, calendar.id)}, var(--color-muted-foreground))`,
              } as React.CSSProperties
            }
          ></div>
        ))}
    </div>
  );
}

function CalendarColorRadioItem({
  className,
  children,
  disabled,
  color,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem> & {
  color: string;
}) {
  return (
    <DropdownMenuPrimitive.RadioItem
      className={cn(
        "peer relative size-3 shrink-0 rounded-[4px] outline-hidden transition-opacity duration-150 hover:opacity-80",
        "ring-offset-2 ring-offset-popover focus-visible:border-ring focus-visible:ring-[1px] focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=checked]:border-primary",
        "bg-(--calendar-color) disabled:bg-muted",
        disabled && "bg-(--calendar-color)/50",
        className,
      )}
      style={
        {
          "--calendar-color": color,
        } as React.CSSProperties
      }
      disabled={disabled}
      {...props}
    >
      <span className="pointer-events-none absolute inset-0 flex size-3 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon
            className="size-2.5 stroke-white/80 dark:stroke-black/60"
            size={10}
            strokeWidth={4}
          />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}
interface CalendarColorPickerProps {
  calendar: Calendar;
  disabled?: boolean;
  onColorChange?: (
    calendarId: string,
    accountId: string,
    color: string,
  ) => void;
}

const COLORS = [
  "#FB2C36", // Red
  "#FF6900", // Orange
  "#F0B100", // Yellow
  "#00C950", // Green
  "#2B7FFF", // Blue
  "#AD46FF", // Purple
  "#DE3BBE", // Pink
  "#a3a3a3", // Gray
  "#525252", // Dark gray

  "#f43f5e", // Rose - warm red
  "#d946ef", // Fuchsia - vibrant pink
  "#a855f7", // Purple
  "#6366f1", // Indigo - deep blue-purple
  "#3b82f6", // Blue - primary blue
  "#14b8a6", // Teal - blue-green
  "#10b981", // Emerald - true green
  "#84cc16", // Lime - yellow-green
  "#f59e0b", // Amber - orange-yellow
  "#f97316", // Orange - pure orange
  "#64748b", // Slate - neutral gray
];

function CalendarColorPicker({
  calendar,
  disabled,
  onColorChange,
}: CalendarColorPickerProps) {
  const [calendarPreferences, setCalendarPreferences] = useAtom(
    calendarPreferencesAtom,
  );

  // Get the current override color for this calendar
  const currentPreference = getCalendarPreference(
    calendarPreferences,
    calendar.accountId,
    calendar.id,
  );
  const currentColor = currentPreference?.color ?? calendar.color;

  const handleColorChange = (newColor: string) => {
    // Update the calendar preferences atom
    setCalendarPreferences((prev) =>
      setCalendarPreference(prev, calendar.accountId, calendar.id, {
        color: newColor,
      }),
    );

    // Call optional callback
    onColorChange?.(calendar.id, calendar.accountId, newColor);
  };

  return (
    <DropdownMenuRadioGroup
      value={currentColor}
      onValueChange={handleColorChange}
    >
      <div className="mb-1 flex scrollbar-hidden gap-3 overflow-x-auto px-2 py-2">
        {COLORS.map((colorOption) => (
          <CalendarColorRadioItem
            key={colorOption}
            value={colorOption}
            color={colorOption}
            disabled={disabled}
          />
        ))}
      </div>
    </DropdownMenuRadioGroup>
  );
}

interface CalendarActionsProps {
  calendar: Calendar;
  onRename: () => void;
  onDelete: () => void;
}

function CalendarActionsMenu({
  calendar,
  onRename,
  onDelete,
}: CalendarActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="invisible ml-auto size-6 group-hover/calendar-item:visible group-has-[[data-state=open]]/calendar-item:visible"
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <EllipsisHorizontalIcon className="size-4" />
          <span className="sr-only">Calendar actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={17}
        alignOffset={-6}
        side="right"
        className="w-65"
      >
        <CalendarColorPicker calendar={calendar} />
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            if (calendar.readOnly) return;
            onRename();
          }}
          disabled={calendar.readOnly}
        >
          <PencilSquareIcon className="size-4" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={(e) => {
            e.preventDefault();
            if (calendar.readOnly || calendar.primary) return;
            onDelete();
          }}
          disabled={calendar.readOnly || calendar.primary}
        >
          <TrashIcon className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface CalendarRenameDialogProps {
  calendar: Calendar;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (newName: string) => void;
  isLoading?: boolean;
}

function CalendarRenameDialog({
  calendar,
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: CalendarRenameDialogProps) {
  const [newName, setNewName] = React.useState(calendar.name);

  React.useEffect(() => {
    setNewName(calendar.name);
  }, [calendar.name, open]);

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
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(newName.trim())}
            disabled={
              newName.trim().length === 0 || calendar.readOnly || isLoading
            }
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface CalendarDeleteDialogProps {
  calendar: Calendar;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

function CalendarDeleteDialog({
  calendar,
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: CalendarDeleteDialogProps) {
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
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onConfirm}
            disabled={calendar.readOnly || calendar.primary || isLoading}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function CalendarListItem({ calendar }: { calendar: Calendar }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [calendarPreferences, setCalendarPreferences] = useAtom(
    calendarPreferencesAtom,
  );
  const [renameOpen, setRenameOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const updateMutation = useMutation(
    trpc.calendars.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.calendars.pathKey() });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const deleteMutation = useMutation(
    trpc.calendars.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.calendars.pathKey() });
        queryClient.invalidateQueries({ queryKey: trpc.events.pathKey() });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const handleRename = React.useCallback(
    (calendarId: string, newName: string) => {
      updateMutation.mutate({
        id: calendarId,
        accountId: calendar.accountId,
        name: newName,
      });
    },
    [updateMutation, calendar.accountId],
  );

  const handleDelete = React.useCallback(
    (calendarId: string) => {
      deleteMutation.mutate({
        accountId: calendar.accountId,
        calendarId,
      });
    },
    [deleteMutation, calendar.accountId],
  );

  const handleCalendarVisibilityChange = React.useCallback(
    (checked: boolean, calendarId: string, accountId: string) => {
      setCalendarPreferences((prev) =>
        setCalendarPreference(prev, accountId, calendarId, {
          hidden: !checked,
        }),
      );
    },
    [setCalendarPreferences],
  );

  const preference = getCalendarPreference(
    calendarPreferences,
    calendar.accountId,
    calendar.id,
  );
  const checked = !preference?.hidden;

  const handleRenameClick = React.useCallback(() => {
    setRenameOpen(true);
  }, []);

  const handleDeleteClick = React.useCallback(() => {
    setDeleteOpen(true);
  }, []);

  const handleRenameConfirm = React.useCallback(
    (newName: string) => {
      handleRename(calendar.id, newName);
      setRenameOpen(false);
    },
    [handleRename, calendar.id],
  );

  const handleDeleteConfirm = React.useCallback(() => {
    handleDelete(calendar.id);
    setDeleteOpen(false);
  }, [handleDelete, calendar.id]);

  return (
    <>
      <CommandItem
        className="group/calendar-item h-8 gap-3 ps-3"
        value={`${calendar.name}`}
        onSelect={() => {
          handleCalendarVisibilityChange(
            !checked,
            calendar.id,
            calendar.accountId,
          );
        }}
        // Prevent cmdk selection
        onMouseDown={(e) => e.preventDefault()}
      >
        <CalendarToggle
          style={
            {
              "--calendar-color": `var(${calendarColorVariable(calendar.accountId, calendar.id)}, var(--color-muted-foreground))`,
            } as React.CSSProperties
          }
          className="dark:border-neutral-700"
          checked={checked}
          onCheckedChange={(checked: boolean) => {
            handleCalendarVisibilityChange(
              checked,
              calendar.id,
              calendar.accountId,
            );
          }}
          primaryCalendar={calendar.primary}
        />
        <span className="flex-1 truncate">{calendar.name}</span>
        <div
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <CalendarActionsMenu
            calendar={calendar}
            onRename={handleRenameClick}
            onDelete={handleDeleteClick}
          />
        </div>
      </CommandItem>
      <CalendarRenameDialog
        calendar={calendar}
        open={renameOpen}
        onOpenChange={setRenameOpen}
        onConfirm={handleRenameConfirm}
        isLoading={updateMutation.isPending}
      />

      <CalendarDeleteDialog
        calendar={calendar}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}

export function CalendarPicker() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.calendars.list.queryOptions());
  const [open, setOpen] = React.useState(false);
  const [calendarPreferences] = useAtom(calendarPreferencesAtom);

  const visibleCalendars = React.useMemo(() => {
    return data?.accounts
      .flatMap((account) => account.calendars)
      .filter((calendar) => {
        const preference = getCalendarPreference(
          calendarPreferences,
          calendar.accountId,
          calendar.id,
        );
        return !preference?.hidden;
      });
  }, [data, calendarPreferences]);

  if (!data) {
    return null;
  }

  return (
    <div className="flex items-center space-x-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="group/trigger w-10 p-0 hover:bg-transparent dark:hover:bg-transparent"
          >
            <span className="sr-only">Select calendars</span>
            <VisibleCalendars calendars={visibleCalendars} />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-fit max-w-72 min-w-64 p-0"
          side="bottom"
          align="center"
        >
          <Command>
            <CommandInput placeholder="Search calendars..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              {data.accounts.map((account) => (
                <CommandGroup
                  heading={account.name}
                  key={account.id}
                  value={account.name}
                >
                  {account.calendars.map((calendar) => (
                    <CalendarListItem
                      calendar={calendar}
                      key={`${calendar.accountId}-${calendar.id}`}
                    />
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
