"use client";

import {
  ArrowTopRightOnSquareIcon,
  ClipboardDocumentListIcon,
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
  onDelete?: () => void;
}

export function ConferenceFieldDropdown({
  conference,
  disabled,
  onDelete,
}: ConferenceFieldDropdownProps) {
  const onCopyJoinUrl = async () => {
    if (!conference.video?.joinUrl.value) {
      return;
    }
    
    try {
      await navigator.clipboard.writeText(conference.video?.joinUrl.value);
    } catch {
      // ignore clipboard errors
    }
  };

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
        <DropdownMenuItem asChild disabled={!conference.video?.joinUrl.value}>
          <a href={conference.video?.joinUrl.value} target="_blank" rel="noopener noreferrer">
            <ArrowTopRightOnSquareIcon className="size-4" />
            Join Meeting
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onCopyJoinUrl} disabled={!conference.video?.joinUrl.value}>
          <ClipboardDocumentListIcon className="size-4" />
          Copy Join URL
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={onDelete}>
          <TrashIcon className="size-4" />
          Remove Video Call
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
