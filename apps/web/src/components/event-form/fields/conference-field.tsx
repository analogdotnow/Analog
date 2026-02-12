"use client";

import * as React from "react";

import { ConferenceDetails } from "@/components/event-form/location/conference-details";
import { FormConference } from "@/components/event-form/utils/schema";
import { GoogleMeet } from "@/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ConferenceFieldProps {
  value?: FormConference | null;
  onChange: (value: FormConference | null) => void;
  onBlur: () => void;
  disabled?: boolean;
}

export function ConferenceField({
  value,
  onChange,
  onBlur,
  disabled = false,
}: ConferenceFieldProps) {
  if (value?.type === "conference") {
    return <ConferenceDetails conference={value} disabled={disabled} />;
  }

  if (value?.type === "create") {
    return (
      <div className="flex h-8 items-center ps-8 text-sm text-muted-foreground">
        <span className="animate-pulse">Loading...</span>
      </div>
    );
  }

  return (
    <ConferenceSelect onChange={onChange} onBlur={onBlur} disabled={disabled} />
  );
}

interface ConferenceSelectProps {
  onChange: (value: FormConference) => void;
  onBlur: () => void;
  disabled?: boolean;
}

function ConferenceSelect({
  onChange,
  onBlur,
  disabled = false,
}: ConferenceSelectProps) {
  const onValueChange = React.useCallback(
    (value: string) => {
      if (disabled) {
        return;
      }

      onChange({
        type: "create",
        providerId: value as "google" | "microsoft",
        requestId: crypto.randomUUID(),
      });
      onBlur();
    },
    [onChange, onBlur, disabled],
  );

  return (
    <div className="group/conference-select h-8">
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex h-8 w-full items-center justify-start gap-2 rounded-md border-none bg-transparent ps-8 text-sm text-muted-foreground/70 shadow-none ring-0 focus:bg-accent-light focus:ring-0 focus:ring-offset-0 focus-visible:bg-accent-light enabled:hover:bg-accent-light disabled:opacity-60 data-[state=open]:bg-accent-light dark:bg-transparent dark:focus:bg-accent-light dark:focus-visible:bg-accent-light dark:enabled:hover:bg-accent-light data-[state=open]:dark:bg-accent-light"
          disabled={disabled}
        >
          Conference
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)">
          <DropdownMenuItem
            onSelect={() => onValueChange("google")}
            disabled={disabled}
          >
            <span className="line-clamp-1 flex w-full items-center gap-2">
              <GoogleMeet />
              Google Meet
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
