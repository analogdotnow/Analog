"use client";

import {
  ClipboardDocumentListIcon,
  MapIcon,
  TrashIcon,
} from "@heroicons/react/16/solid";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LocationFieldDropdownProps {
  className?: string;
  location: string;
  disabled?: boolean;
}

export function LocationFieldDropdown({
  location,
  disabled,
}: LocationFieldDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button
          variant="secondary"
          size="sm"
          className="h-7 max-w-36 justify-start truncate px-2 text-xs"
          disabled={disabled}
        >
          <span className="truncate">{location}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem>
          <MapIcon className="size-4" />
          Open in Google Maps
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <ClipboardDocumentListIcon className="size-4" />
          Copy Location
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <TrashIcon className="size-4" />
          Remove Location
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
