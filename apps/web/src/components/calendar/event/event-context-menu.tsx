"use client";

import * as React from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { useQuery } from "@tanstack/react-query";
import { CheckIcon } from "lucide-react";

import type { AttendeeStatus } from "@repo/api/interfaces";

import { canMoveBetweenCalendars } from "@/components/calendar/utils/move";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuRadioGroup,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { KeyboardShortcut } from "@/components/ui/keyboard-shortcut";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { CalendarEvent } from "@/lib/interfaces";
import { useTRPC } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { useDeleteAction } from "../flows/delete-event/use-delete-action";
import { useUpdateAction } from "../flows/update-event/use-update-action";

function CalendarRadioItem({
  className,
  children,
  disabled,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioItem>) {
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      className={cn(
        "peer relative size-3 shrink-0 rounded-[4px] outline-hidden transition-opacity duration-150 hover:opacity-80",
        "ring-offset-2 ring-offset-popover focus-visible:border-ring focus-visible:ring-[1px] focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=checked]:border-primary",
        "bg-(--calendar-color) disabled:bg-muted",
        disabled && "bg-(--calendar-color)/50",
        className,
      )}
      disabled={disabled}
      {...props}
    >
      <span className="pointer-events-none absolute inset-0 flex size-3 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <CheckIcon
            className="size-2.5 stroke-white/80 dark:stroke-black/60"
            size={10}
            strokeWidth={4}
          />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
}

interface EventContextMenuCalendarListProps {
  event: CalendarEvent;
}

function EventContextMenuCalendarList({
  event,
}: EventContextMenuCalendarListProps) {
  const trpc = useTRPC();
  const calendarQuery = useQuery(trpc.calendars.list.queryOptions());

  const updateAction = useUpdateAction();

  const moveEvent = React.useCallback(
    (accountId: string, calendarId: string) => {
      updateAction({
        event: {
          ...event,
          accountId,
          calendarId,
        },
        notify: true,
      });
    },
    [updateAction, event],
  );

  return (
    <div className="mb-1 flex scrollbar-hidden gap-3 overflow-x-auto px-2 py-2">
      {calendarQuery.data?.accounts.map((account, index) => (
        <React.Fragment key={index}>
          {account.calendars.map((calendar, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <CalendarRadioItem
                  value={`${calendar.accountId}-${calendar.id}`}
                  style={
                    {
                      "--calendar-color": calendar.color,
                    } as React.CSSProperties
                  }
                  disabled={!canMoveBetweenCalendars(event, calendar)}
                  onSelect={() => moveEvent(calendar.accountId, calendar.id)}
                />
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

interface EventContextMenuProps {
  event: CalendarEvent;
  children: React.ReactNode;
}

export function EventContextMenu({ event, children }: EventContextMenuProps) {
  const responseStatus = event.response?.status;

  const updateAction = useUpdateAction();

  const handleRespond = React.useCallback(
    (status: AttendeeStatus) => {
      if (!responseStatus || status === responseStatus) {
        return;
      }

      updateAction({
        event: {
          ...event,
          response: { status },
        },
        // TODO: should this be the default?
        notify: true,
      });
    },
    [updateAction, event, responseStatus],
  );

  const deleteAction = useDeleteAction();

  const handleDelete = React.useCallback(() => {
    deleteAction({ event });
  }, [deleteAction, event]);

  return (
    <ContextMenu>
      {children}
      <ContextMenuContent className="w-64">
        <ContextMenuRadioGroup value={`${event.accountId}-${event.calendarId}`}>
          <EventContextMenuCalendarList event={event} />
        </ContextMenuRadioGroup>

        <ContextMenuSeparator />
        {/* Status options */}
        <ContextMenuCheckboxItem
          className="font-medium"
          checked={responseStatus === "accepted"}
          disabled={!responseStatus}
          onSelect={() => handleRespond("accepted")}
        >
          Going
          <KeyboardShortcut className="ml-auto bg-transparent text-muted-foreground">
            Y
          </KeyboardShortcut>
        </ContextMenuCheckboxItem>

        <ContextMenuCheckboxItem
          className="font-medium"
          checked={responseStatus === "tentative"}
          disabled={!responseStatus}
          onSelect={() => handleRespond("tentative")}
        >
          Maybe
          <KeyboardShortcut className="ml-auto bg-transparent text-muted-foreground">
            M
          </KeyboardShortcut>
        </ContextMenuCheckboxItem>

        <ContextMenuCheckboxItem
          className="font-medium"
          checked={responseStatus === "declined"}
          disabled={!responseStatus}
          onSelect={() => handleRespond("declined")}
        >
          Not going
          <KeyboardShortcut className="ml-auto bg-transparent text-muted-foreground">
            N
          </KeyboardShortcut>
        </ContextMenuCheckboxItem>

        <ContextMenuSeparator />

        {/* Meeting actions */}
        <ContextMenuItem
          className="ps-8 font-medium"
          disabled={!event.conference?.video?.joinUrl}
          asChild
        >
          <a
            href={event.conference?.video?.joinUrl?.value}
            target="_blank"
            rel="noopener noreferrer"
          >
            Join meeting
            <KeyboardShortcut className="ml-auto bg-transparent text-muted-foreground">
              J
            </KeyboardShortcut>
          </a>
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* Edit actions */}
        <ContextMenuItem className="ps-8 font-medium" disabled>
          Cut
          <KeyboardShortcut className="ml-auto bg-transparent text-muted-foreground">
            X
          </KeyboardShortcut>
        </ContextMenuItem>

        <ContextMenuItem className="ps-8 font-medium" disabled>
          Copy
          <KeyboardShortcut className="ml-auto bg-transparent text-muted-foreground">
            C
          </KeyboardShortcut>
        </ContextMenuItem>

        <ContextMenuItem className="ps-8 font-medium" disabled>
          Paste
          <KeyboardShortcut className="ml-auto bg-transparent text-muted-foreground">
            P
          </KeyboardShortcut>
        </ContextMenuItem>

        <ContextMenuItem className="ps-8 font-medium" disabled>
          Duplicate
          <KeyboardShortcut className="ml-auto bg-transparent text-muted-foreground">
            D
          </KeyboardShortcut>
        </ContextMenuItem>

        <ContextMenuItem
          className="ps-8 font-medium"
          disabled={event.readOnly}
          variant="destructive"
          onClick={handleDelete}
        >
          Delete
          <KeyboardShortcut className="ml-auto bg-transparent">
            ⌫
          </KeyboardShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
