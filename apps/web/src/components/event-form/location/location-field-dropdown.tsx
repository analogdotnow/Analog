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
  onDelete?: () => void;
}

export function LocationFieldDropdown({
  location,
  disabled,
  onDelete,
}: LocationFieldDropdownProps) {
  const onCopyLocation = async () => {
    try {
      await navigator.clipboard.writeText(location);
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
          <span className="truncate">{location}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem asChild>
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`} target="_blank" rel="noopener noreferrer">
            <MapIcon className="size-4" />
            Open in Google Maps
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onCopyLocation}>
          <ClipboardDocumentListIcon className="size-4" />
          Copy Location
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={onDelete}>
          <TrashIcon className="size-4" />
          Remove Location
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
