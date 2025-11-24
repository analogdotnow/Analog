"use client";

import {
  ClipboardDocumentListIcon,
  MapIcon,
  TrashIcon,
} from "@heroicons/react/16/solid";

import { ConferenceData } from "@repo/providers/interfaces";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ConferenceFieldDropdownProps {
  className?: string;
  conference: ConferenceData;
  disabled?: boolean;
}

export function ConferenceFieldDropdown({
  conference,
  disabled,
}: ConferenceFieldDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button
          variant="secondary"
          size="sm"
          className="h-7 max-w-36 justify-start truncate px-2 text-xs"
          disabled={disabled}
        >
          <span className="truncate">{conference.video?.joinUrl.value}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem>
          <MapIcon className="size-4" />
          Open in Google Meet
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <ClipboardDocumentListIcon className="size-4" />
          Copy Join URL
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <TrashIcon className="size-4" />
          Remove Video Call
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
