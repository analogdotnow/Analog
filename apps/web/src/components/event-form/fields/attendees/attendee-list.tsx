import * as React from "react";
import {
  CheckCircleIcon,
  EllipsisHorizontalIcon,
  EnvelopeIcon,
  QuestionMarkCircleIcon,
  TrashIcon,
  XCircleIcon,
} from "@heroicons/react/16/solid";

import type { AttendeeStatus } from "@repo/providers/interfaces";

import { CopyButton } from "@/components/copy-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface AttendeeAvatarProps {
  name?: string;
  email: string;
  className?: string;
}

function AttendeeAvatar({ name, email, className }: AttendeeAvatarProps) {
  const initials = React.useMemo(() => {
    const initials =
      name?.trim().length && name?.trim().length > 0
        ? name?.charAt(0)
        : email.charAt(0);

    return initials.toUpperCase();
  }, [name, email]);

  return (
    <div
      className={cn("flex shrink-0 items-start self-stretch pt-0.5", className)}
    >
      <Avatar className="size-6">
        {/* <AvatarImage src="https://github.com/shadcn.png" /> */}
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
    </div>
  );
}

interface AttendeeInfoProps {
  name?: string;
  email: string;
  organizer?: boolean;
  className?: string;
}

function AttendeeInfo({
  name,
  email,
  organizer,
  className,
}: AttendeeInfoProps) {
  const showName = name?.trim()?.length && name?.trim().length > 0;

  return (
    <div className={cn("flex min-w-0 grow flex-col select-none", className)}>
      <p className="truncate text-sm font-medium">{showName ? name : email}</p>

      {organizer ? (
        <p className="truncate text-xs text-muted-foreground">Organizer</p>
      ) : null}

      {!organizer && showName ? (
        <p className="truncate text-xs text-muted-foreground">{email}</p>
      ) : null}
    </div>
  );
}

interface AttendeeStatusProps {
  status: AttendeeStatus;
  className?: string;
}

function AttendeeStatusIcon({ status, className }: AttendeeStatusProps) {
  const getStatusLabel = (status: AttendeeStatus): string => {
    switch (status) {
      case "accepted":
        return "Going";
      case "tentative":
        return "Maybe";
      case "declined":
        return "Not going";
      case "unknown":
        return "Unknown";
      default:
        return "Unknown";
    }
  };

  const Icon = () => {
    switch (status) {
      case "declined":
        return <XCircleIcon className="size-4 text-red-500" />;
      case "tentative":
        return <QuestionMarkCircleIcon className="size-4 text-yellow-500" />;
      case "unknown":
        return (
          <QuestionMarkCircleIcon className="size-4 text-muted-foreground" />
        );
      case "accepted":
        return <CheckCircleIcon className="size-4 text-green-500" />;
      default:
        return null;
    }
  };

  if (!Icon) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-start self-stretch pt-1.5 opacity-60",
        className,
      )}
    >
      <Tooltip>
        <TooltipTrigger>
          <Icon />
        </TooltipTrigger>
        <TooltipContent sideOffset={8}>{getStatusLabel(status)}</TooltipContent>
      </Tooltip>
    </div>
  );
}

interface AttendeeActionsProps {
  children: React.ReactNode;
  className?: string;
}

function AttendeeActions({ children, className }: AttendeeActionsProps) {
  return (
    <div
      className={cn(
        "hidden items-start gap-1 self-stretch pe-0.5 group-hover/attendee:flex group-has-aria-expanded/attendee:flex group-has-data-[state=open]/attendee:flex",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface AttendeeListItemProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "children"
> {
  name?: string;
  email: string;
  status: AttendeeStatus;
  type?: "required" | "optional" | "resource";
  onRemove: () => void;
  onToggleOptional: (nextType: "required" | "optional") => void;
  disabled?: boolean;
  organizer?: boolean;
  onChangeStatus?: (status: AttendeeStatus) => void;
}

export function AttendeeListItem({
  className,
  name,
  email,
  type,
  onRemove,
  onToggleOptional,
  disabled,
  organizer,
  status,
  onChangeStatus,
  ...props
}: AttendeeListItemProps) {
  return (
    <div
      className={cn(
        "group/attendee flex min-h-7 w-full items-center gap-2 ps-8",
        className,
      )}
      {...props}
    >
      <AttendeeAvatar name={name} email={email} />
      <AttendeeInfo name={name} email={email} organizer={organizer} />
      <AttendeeStatusIcon
        status={status}
        className="ml-auto pr-1 group-hover/attendee:pr-0 group-has-aria-expanded/attendee:pr-0 group-has-data-[state=open]/attendee:pr-0"
      />
      <AttendeeActions>
        <CopyButton value={email} disabled={disabled}>
          <span className="sr-only">Copy email</span>
        </CopyButton>
        <AttendeeActionsDropdown
          email={email}
          type={type}
          onRemove={onRemove}
          onToggleOptional={onToggleOptional}
          disabled={disabled}
          organizer={organizer}
          status={status}
          onChangeStatus={onChangeStatus}
        />
      </AttendeeActions>
    </div>
  );
}

interface AttendeeActionsDropdownProps {
  email: string;
  type?: "required" | "optional" | "resource";
  onRemove: () => void;
  onToggleOptional: (type: "required" | "optional") => void;
  disabled?: boolean;
  organizer?: boolean;
  status?: AttendeeStatus;
  onChangeStatus?: (status: AttendeeStatus) => void;
}

function AttendeeActionsDropdown({
  email,
  type,
  onRemove,
  onToggleOptional,
  disabled,
  organizer,
  status,
  onChangeStatus,
}: AttendeeActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="-mr-1 size-7 text-muted-foreground"
          disabled={disabled}
        >
          <EllipsisHorizontalIcon className="size-4" />
          <span className="sr-only">Attendee actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        {organizer ? (
          <>
            <DropdownMenuRadioGroup
              value={(status ?? "unknown") as string}
              onValueChange={(v: string) =>
                onChangeStatus?.(v as AttendeeStatus)
              }
            >
              <DropdownMenuRadioItem value="accepted">
                Going
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="tentative">
                Maybe
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="declined">
                Not going
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
          </>
        ) : null}
        {/* <DropdownMenuCheckboxItem
          checked={type === "optional"}
          onCheckedChange={(checked) => {
            onToggleOptional(checked ? "optional" : "required");
          }}
        >
          Mark as {type === "optional" ? "required" : "optional"}
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator /> */}
        <DropdownMenuItem asChild>
          <a href={`mailto:${email}`} target="_blank" rel="noopener noreferrer">
            <EnvelopeIcon /> Send email
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => onRemove()}>
          <TrashIcon /> Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type AttendeeListProps = React.ComponentPropsWithoutRef<"div">;

export function AttendeeList({
  children,
  className,
  ...props
}: AttendeeListProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      {children}
    </div>
  );
}
