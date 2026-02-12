"use client";

import * as React from "react";
import {
  EllipsisHorizontalIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/16/solid";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { CheckIcon } from "lucide-react";

import { COLORS } from "@repo/providers/lib";

import { Button } from "@/components/ui/button";
import { CommandItem } from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useCalendarStore } from "@/providers/calendar-store-provider";
import { getCalendarPreference } from "@/store/calendar-store";
import {
  CalendarPickerItemProvider,
  useCalendarPickerItem,
} from "./calendar-picker-item-provider";
import { CalendarPickerItemToggle } from "./calendar-picker-item-toggle";
import { useCalendarPickerContext } from "./calendar-picker-provider";

type CalendarColorRadioItemProps = React.ComponentProps<
  typeof DropdownMenuPrimitive.RadioItem
>;

function CalendarColorRadioItem({
  className,
  children,
  disabled,
  value,
  ...props
}: CalendarColorRadioItemProps) {
  "use memo";

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
      style={{ "--calendar-color": value }}
      disabled={disabled}
      value={value}
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

function CalendarColorPicker() {
  "use memo";

  const { calendar } = useCalendarPickerItem();
  const calendarPreferences = useCalendarStore((s) => s.calendarPreferences);
  const setCalendarPreference = useCalendarStore(
    (s) => s.setCalendarPreference,
  );

  const currentPreference = getCalendarPreference(
    calendarPreferences,
    calendar.provider.accountId,
    calendar.id,
  );

  const currentColor = currentPreference?.color ?? calendar.color;

  const onColorChange = (newColor: string) => {
    setCalendarPreference(calendar.provider.accountId, calendar.id, {
      color: newColor,
    });
  };

  return (
    <DropdownMenuRadioGroup value={currentColor} onValueChange={onColorChange}>
      <div className="mb-1 flex scrollbar-hidden gap-3 overflow-x-auto px-2 py-2">
        {COLORS.map((colorOption) => (
          <CalendarColorRadioItem
            key={colorOption}
            value={colorOption}
            color={colorOption}
          />
        ))}
      </div>
    </DropdownMenuRadioGroup>
  );
}

function useCalendarVisibility() {
  "use memo";

  const { calendar } = useCalendarPickerItem();
  const calendarPreferences = useCalendarStore((s) => s.calendarPreferences);
  const setCalendarPreference = useCalendarStore(
    (s) => s.setCalendarPreference,
  );

  const preference = getCalendarPreference(
    calendarPreferences,
    calendar.provider.accountId,
    calendar.id,
  );

  const visible = !preference?.hidden;

  const setVisible = React.useCallback(
    (visible: boolean) => {
      setCalendarPreference(calendar.provider.accountId, calendar.id, {
        hidden: !visible,
      });
    },
    [setCalendarPreference, calendar.provider.accountId, calendar.id],
  );

  return { visible, setVisible };
}

export function CalendarPickerItemActionsMenu() {
  "use memo";

  const { setActionMenuOpen } = useCalendarPickerContext();
  const { calendar, setRenameDialogOpen, setDeleteDialogOpen } =
    useCalendarPickerItem();

  return (
    <DropdownMenu onOpenChange={setActionMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="invisible ml-auto size-6 group-hover/calendar-item:visible group-has-data-[state=open]/calendar-item:visible hover:bg-primary/10 dark:hover:bg-primary/10"
        >
          <EllipsisHorizontalIcon className="size-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        alignOffset={-6}
        side="bottom"
        className="w-65"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <CalendarColorPicker />
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();

            setRenameDialogOpen(true);
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

            setDeleteDialogOpen(true);
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

interface CalendarPickerItemContentProps {
  children?: React.ReactNode;
}

export function CalendarPickerItemContent({
  children,
}: CalendarPickerItemContentProps) {
  const { calendar } = useCalendarPickerItem();
  const { visible, setVisible } = useCalendarVisibility();

  return (
    <CommandItem
      className="group/calendar-item h-8 gap-3 ps-3"
      value={calendar.name}
      onSelect={() => setVisible(!visible)}
      onMouseDown={(e) => e.preventDefault()}
    >
      <CalendarPickerItemToggle
        checked={visible}
        onCheckedChange={setVisible}
      />
      <span className="flex-1 truncate">{calendar.name}</span>
      {children}
    </CommandItem>
  );
}

export const CalendarPickerItem = CalendarPickerItemProvider;
