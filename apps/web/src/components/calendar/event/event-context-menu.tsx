"use client";

import * as React from "react";
import { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu";
import { useQuery } from "@tanstack/react-query";
import { CheckIcon } from "lucide-react";

import type { AttendeeStatus } from "@repo/providers/interfaces";

import { useDeleteAction } from "@/components/calendar/flows/delete-event/use-delete-action";
import { usePartialUpdateAction } from "@/components/calendar/flows/update-event/use-update-action";
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
import { isOnlineMeeting } from "@/lib/utils/events";

function CalendarRadioItem({
  className,
  children,
  disabled,
  ...props
}: ContextMenuPrimitive.RadioItem.Props & { disabled?: boolean }) {
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      className={cn(
        "peer relative size-3 shrink-0 rounded-[4px] outline-hidden transition-opacity duration-150",
        "ring-offset-2 ring-offset-popover focus-visible:border-ring focus-visible:ring-[1px] focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-checked:border-primary",
        "bg-(--calendar-color) disabled:bg-muted",
        "data-disabled:pointer-events-none data-disabled:opacity-40",
        disabled && "bg-(--calendar-color)/50",
        className,
      )}
      disabled={disabled}
      {...props}
    >
      <span className="pointer-events-none absolute inset-0 flex size-3 items-center justify-center">
        <ContextMenuPrimitive.RadioItemIndicator>
          <CheckIcon
            className="size-2.5 stroke-white/80 dark:stroke-black/60"
            size={10}
            strokeWidth={4}
          />
        </ContextMenuPrimitive.RadioItemIndicator>
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
  "use memo";

  const trpc = useTRPC();
  const { data } = useQuery(trpc.calendars.list.queryOptions());

  const updateAction = usePartialUpdateAction();

  const moveEvent = React.useCallback(
    (calendar: {
      id: string;
      provider: { id: "google" | "microsoft"; accountId: string };
    }) => {
      updateAction({
        changes: {
          id: event.id,
          calendar,
          type: event.type,
        },
        notify: true,
      });
    },
    [updateAction, event.id, event.type],
  );

  return (
    <div className="flex scrollbar-hidden gap-3 overflow-x-auto px-2 py-2">
      {data?.accounts.map((account, index) => (
        <React.Fragment key={index}>
          {account.calendars.map((calendar, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <CalendarRadioItem
                  value={`${calendar.provider.accountId}-${calendar.id}`}
                  style={{
                    "--calendar-color": calendar.color,
                  }}
                  disabled={!canMoveBetweenCalendars(event, calendar)}
                  onSelect={() =>
                    moveEvent({ id: calendar.id, provider: calendar.provider })
                  }
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
  children: React.ReactNode;
  event: CalendarEvent;
}

export function EventContextMenu({ children, event }: EventContextMenuProps) {
  "use memo";

  const updateAction = usePartialUpdateAction();
  const deleteAction = useDeleteAction();

  const onRespond = (status: AttendeeStatus) => {
    if (!event.response || status === event.response.status) {
      return;
    }

    updateAction({
      changes: {
        id: event.id,
        response: { status },
        type: event.type,
      },
      // TODO: should this be the default?
      notify: true,
    });
  };

  return (
    <ContextMenu>
      {children}
      <ContextMenuContent className="w-64">
        <ContextMenuRadioGroup
          value={`${event.calendar.provider.accountId}-${event.calendar.id}`}
        >
          <EventContextMenuCalendarList event={event} />
        </ContextMenuRadioGroup>

        <ContextMenuSeparator />
        {/* Status options */}
        <ContextMenuCheckboxItem
          className="font-medium"
          checked={event.response?.status === "accepted"}
          disabled={!event.response}
          onSelect={() => onRespond("accepted")}
        >
          Going
          <KeyboardShortcut className="ml-auto bg-transparent text-muted-foreground">
            Y
          </KeyboardShortcut>
        </ContextMenuCheckboxItem>

        <ContextMenuCheckboxItem
          className="font-medium"
          checked={event.response?.status === "tentative"}
          disabled={!event.response}
          onSelect={() => onRespond("tentative")}
        >
          Maybe
          <KeyboardShortcut className="ml-auto bg-transparent text-muted-foreground">
            M
          </KeyboardShortcut>
        </ContextMenuCheckboxItem>

        <ContextMenuCheckboxItem
          className="font-medium"
          checked={event.response?.status === "declined"}
          disabled={!event.response}
          onSelect={() => onRespond("declined")}
        >
          Not going
          <KeyboardShortcut className="ml-auto bg-transparent text-muted-foreground">
            N
          </KeyboardShortcut>
        </ContextMenuCheckboxItem>

        <ContextMenuSeparator />

        {/* Meeting actions */}
        {isOnlineMeeting(event) ? (
          <ContextMenuItem
            className="ps-8 font-medium"
            render={
              <a
                href={event.conference.video.joinUrl.value}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            Join meeting
            <KeyboardShortcut className="ml-auto bg-transparent text-muted-foreground">
              J
            </KeyboardShortcut>
          </ContextMenuItem>
        ) : (
          <ContextMenuItem className="ps-8 font-medium" disabled>
            Join meeting
            <KeyboardShortcut className="ml-auto bg-transparent text-muted-foreground">
              J
            </KeyboardShortcut>
          </ContextMenuItem>
        )}

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
          onClick={() => deleteAction({ event })}
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
