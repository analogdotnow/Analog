"use client";

import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GoogleMeet } from "../icons";
import { ConferenceDetails } from "./conference/conference-details";
import { FormConference } from "./utils/schema";

interface ConferenceFieldProps {
  value?: FormConference | null;
  onChange: (value: FormConference | null) => void;
  onBlur: () => void;
}

export function ConferenceField({
  value,
  onChange,
  onBlur,
}: ConferenceFieldProps) {
  if (value?.type === "conference") {
    return <ConferenceDetails conference={value} />;
  }

  if (value?.type === "create") {
    return (
      <div className="flex h-8 items-center ps-8 text-sm text-muted-foreground">
        <span className="animate-pulse">Loading...</span>
      </div>
    );
  }

  return <ConferenceSelect onChange={onChange} onBlur={onBlur} />;
}

interface ConferenceSelectProps {
  onChange: (value: FormConference) => void;
  onBlur: () => void;
}

function ConferenceSelect({ onChange, onBlur }: ConferenceSelectProps) {
  const onValueChange = React.useCallback(
    (value: string) => {
      onChange({
        type: "create",
        providerId: value as "google" | "microsoft",
        requestId: crypto.randomUUID(),
      });
      onBlur();
    },
    [onChange, onBlur],
  );

  return (
    <div className="group/conference-select h-8">
      <DropdownMenu>
        <DropdownMenuTrigger className="hover:bg-input-focus focus:bg-input-focus focus-visible:bg-input-focus data-[state=open]:bg-input-focus dark:hover:bg-input-focus dark:focus:bg-input-focus dark:focus-visible:bg-input-focus data-[state=open]:dark:bg-input-focus flex h-8 w-full items-center justify-start gap-2 rounded-md border-none bg-transparent ps-8 text-sm text-muted-foreground/70 shadow-none ring-0 dark:bg-transparent">
          Conference
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)">
          <DropdownMenuItem onSelect={() => onValueChange("google")}>
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
