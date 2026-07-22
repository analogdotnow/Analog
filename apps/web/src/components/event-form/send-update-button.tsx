"use client";

import * as React from "react";
import {
  BellSlashIcon,
  ChevronDownIcon,
  TrashIcon,
} from "@heroicons/react/16/solid";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface SendUpdateButtonProps {
  className?: string;
  // Microsoft Calendar always notifies attendees, so saving without notifying is not supported.
  notifyRequired?: boolean;
  onSave: () => void;
  onSaveWithoutNotifying: () => void;
  onDiscard: () => void;
}

export function SendUpdateButton({
  className,
  notifyRequired,
  onSave,
  onSaveWithoutNotifying,
  onDiscard,
}: SendUpdateButtonProps) {
  return (
    <div className={cn("flex items-center justify-end", className)}>
      <Button
        variant="outline"
        className="rounded-r-none"
        size="sm"
        type="submit"
        onClick={onSave}
      >
        Save update
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="rounded-l-none border-l-0 px-2"
            size="sm"
          >
            <ChevronDownIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            disabled={notifyRequired}
            onClick={onSaveWithoutNotifying}
          >
            <BellSlashIcon />
            Save update without notifying
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={onDiscard}>
            <TrashIcon />
            Discard changes
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
