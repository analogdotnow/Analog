"use client";

import * as React from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { useQuery } from "@tanstack/react-query";
import { CheckIcon } from "lucide-react";

import { CalendarEvent } from "@/components/event-calendar/types";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuRadioGroup,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { useTRPC } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { KeyboardShortcut } from "./ui/keyboard-shortcut";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

function CalendarRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioItem>) {
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      className={cn(
        "peer relative size-3 shrink-0 rounded-[4px]",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed",
        "disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=checked]:border-primary",
        "bg-(--calendar-color) dark:aria-invalid:ring-destructive/40",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute inset-0 flex size-3 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <CheckIcon
            className="size-2.5 stroke-black/60"
            size={10}
            strokeWidth={4}
          />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
}

interface EventContextMenuProps {
  event: CalendarEvent;
  children: React.ReactNode;
}

function EventContextMenuCalendarList() {
  const trpc = useTRPC();
  const calendarQuery = useQuery(trpc.calendars.list.queryOptions());

  return (
    <div className="mb-1 flex scrollbar-hidden gap-3 overflow-x-auto px-2 py-2">
      {calendarQuery.data?.accounts.map((account, index) => (
        <React.Fragment key={index}>
          {account.calendars.map((calendar, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <CalendarRadioItem
                  value={`${account.id}-${calendar.id}`}
                  style={
                    {
                      "--calendar-color": calendar.color,
                    } as React.CSSProperties
                  }
                ></CalendarRadioItem>
              </TooltipTrigger>
              <TooltipContent className="w-full max-w-48" sideOffset={8}>
                <span className="break-all">{calendar.name}</span>
              </TooltipContent>
            </Tooltip>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
}

export function EventContextMenu({ event, children }: EventContextMenuProps) {
  const responseStatus: string | undefined = "going";

  return (
    <ContextMenu>
      {children}
      <ContextMenuContent className="w-64">
        <ContextMenuRadioGroup value={`${event.accountId}-${event.calendarId}`}>
          <EventContextMenuCalendarList />
        </ContextMenuRadioGroup>

        <ContextMenuSeparator />
        {/* Status options */}
        <ContextMenuCheckboxItem
          checked={responseStatus === "going"}
          disabled={!responseStatus}
        >
          Going
          <KeyboardShortcut className="ml-auto bg-transparent text-muted-foreground">
            Y
          </KeyboardShortcut>
        </ContextMenuCheckboxItem>

        <ContextMenuCheckboxItem
          checked={responseStatus === "maybe"}
          disabled={!responseStatus}
        >
          Maybe
          <KeyboardShortcut className="ml-auto bg-transparent text-muted-foreground">
            M
          </KeyboardShortcut>
        </ContextMenuCheckboxItem>

        <ContextMenuCheckboxItem
          checked={responseStatus === "not_going"}
          disabled={!responseStatus}
        >
          Not going
          <KeyboardShortcut className="ml-auto bg-transparent text-muted-foreground">
            N
          </KeyboardShortcut>
        </ContextMenuCheckboxItem>

        <ContextMenuSeparator />

        {/* Meeting actions */}
        <ContextMenuItem className="ps-8" disabled>
          Join meeting
          <KeyboardShortcut className="ml-auto bg-transparent text-muted-foreground">
            J
          </KeyboardShortcut>
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* Edit actions */}
        <ContextMenuItem className="ps-8" disabled>
          Cut
          <KeyboardShortcut className="ml-auto bg-transparent text-muted-foreground">
            X
          </KeyboardShortcut>
        </ContextMenuItem>

        <ContextMenuItem className="ps-8" disabled>
          Copy
          <KeyboardShortcut className="ml-auto bg-transparent text-muted-foreground">
            C
          </KeyboardShortcut>
        </ContextMenuItem>

        <ContextMenuItem className="ps-8" disabled>
          Paste
          <KeyboardShortcut className="ml-auto bg-transparent text-muted-foreground">
            P
          </KeyboardShortcut>
        </ContextMenuItem>

        <ContextMenuItem className="ps-8" disabled>
          Duplicate
          <KeyboardShortcut className="ml-auto bg-transparent text-muted-foreground">
            D
          </KeyboardShortcut>
        </ContextMenuItem>

        <ContextMenuItem className="ps-8 text-red-400">
          Delete
          <KeyboardShortcut className="ml-auto bg-transparent text-red-400">
            ⌫
          </KeyboardShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export const MemoizedEventContextMenu = React.memo(
  EventContextMenu,
  (prevProps, nextProps) => {
    return (
      prevProps.event.id === nextProps.event.id &&
      prevProps.event.accountId === nextProps.event.accountId &&
      prevProps.event.calendarId === nextProps.event.calendarId
    );
  },
);
