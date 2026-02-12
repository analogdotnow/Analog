"use client";

import { ChevronUpIcon, TrashIcon } from "@heroicons/react/16/solid";

import { ActionButton, ActionShortcut } from "@/components/command-bar/actions";
import { Window } from "@/components/command-bar/window";
import { Key } from "@/components/ui/keyboard-shortcut";
import { useSelectedEventList } from "@/store/hooks";

export function BulkActionWindow() {
  const selectedEvents = useSelectedEventList();

  return (
    <Window className="min-h-12 w-lg max-w-screen overflow-hidden">
      <div className="flex h-12 items-center gap-x-2 px-2">
        <p className="text-sm font-medium text-muted-foreground select-none">
          <span className="rounded-md bg-muted-foreground/10 px-2 py-1 text-muted-foreground">
            {selectedEvents.length}
          </span>{" "}
          <span className="ps-0.5 text-muted-foreground">Selected</span>
        </p>
        <div className="flex grow justify-between gap-2">
          <ActionButton variant="ghost" className="gap-1" disabled>
            Move
            <ChevronUpIcon className="size-4" />
          </ActionButton>
          <ActionButton onClick={() => {}} variant="destructive" disabled>
            <TrashIcon className="size-4 text-destructive" />
            Delete
            <ActionShortcut className="bg-destructive/10 text-destructive/80">
              <Key>⌘</Key>
              <Key>⌫</Key>
            </ActionShortcut>
          </ActionButton>
        </div>
      </div>
    </Window>
  );
}
