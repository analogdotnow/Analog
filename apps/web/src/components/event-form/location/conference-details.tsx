import * as React from "react";

import type {
  ConferenceData,
  ConferenceEntryPoint,
} from "@repo/providers/interfaces";

import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";

function ConferenceItem({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "group/conference-item flex h-8 items-center gap-2",
        className,
      )}
      {...props}
    />
  );
}

function ConferenceItemLabel({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "shrink-0 text-sm text-muted-foreground select-none",
        className,
      )}
      {...props}
    />
  );
}

function ConferenceItemLink({
  className,
  ...props
}: React.ComponentProps<"a">) {
  return <a className={cn("truncate text-sm", className)} {...props} />;
}

function ConferenceItemContent({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return <span className={cn("truncate text-sm", className)} {...props} />;
}

function ConferenceItemActions({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("hidden group-hover/conference-item:flex", className)}
      {...props}
    />
  );
}

interface ConferenceVideoProps {
  name: string;
  entryPoint: ConferenceEntryPoint;
  disabled?: boolean;
}

function ConferenceVideo({ name, entryPoint, disabled }: ConferenceVideoProps) {
  // const isDuplicateCode = (code: string) => {
  //   return entryPoint.meetingCode && code === entryPoint.meetingCode;
  // };

  return (
    <div className="flex flex-col gap-1">
      <ConferenceItem className="grow truncate">
        <ConferenceItemLabel>{name}</ConferenceItemLabel>
        <ConferenceItemLink
          href={entryPoint.joinUrl.value}
          target="_blank"
          rel="noopener noreferrer"
        >
          {entryPoint.joinUrl.value}
        </ConferenceItemLink>
        <ConferenceItemActions>
          <CopyButton value={entryPoint.joinUrl.value} disabled={disabled}>
            <span className="sr-only">Copy join URL</span>
          </CopyButton>
        </ConferenceItemActions>
      </ConferenceItem>
      {/* {entryPoint.meetingCode && (
        <ConferenceItem>
          <ConferenceItemLabel>Code</ConferenceItemLabel>
          <ConferenceItemContent>
            {entryPoint.meetingCode}
          </ConferenceItemContent>
          <ConferenceItemActions>
            <CopyButton value={entryPoint.meetingCode}>
              <span className="sr-only">Copy meeting code</span>
            </CopyButton>
          </ConferenceItemActions>
        </ConferenceItem>
      )}
      {entryPoint.accessCode && !isDuplicateCode(entryPoint.accessCode) && (
        <ConferenceItem>
          <ConferenceItemLabel>Access code</ConferenceItemLabel>
          <ConferenceItemContent>{entryPoint.accessCode}</ConferenceItemContent>
          <ConferenceItemActions>
            <CopyButton value={entryPoint.accessCode}>
              <span className="sr-only">Copy access code</span>
            </CopyButton>
          </ConferenceItemActions>
        </ConferenceItem>
      )}
      {entryPoint.password && !isDuplicateCode(entryPoint.password) && (
        <ConferenceItem>
          <ConferenceItemLabel>Password</ConferenceItemLabel>
          <ConferenceItemContent>{entryPoint.password}</ConferenceItemContent>
          <ConferenceItemActions>
            <CopyButton value={entryPoint.password}>
              <span className="sr-only">Copy password</span>
            </CopyButton>
          </ConferenceItemActions>
        </ConferenceItem>
      )}
      {entryPoint.pin && !isDuplicateCode(entryPoint.pin) && (
        <ConferenceItem>
          <ConferenceItemLabel>PIN</ConferenceItemLabel>
          <ConferenceItemContent>{entryPoint.pin}</ConferenceItemContent>
          <ConferenceItemActions>
            <CopyButton value={entryPoint.pin}>
              <span className="sr-only">Copy PIN</span>
            </CopyButton>
          </ConferenceItemActions>
        </ConferenceItem>
      )} */}
    </div>
  );
}

interface ConferencePhoneProps {
  entryPoint: ConferenceEntryPoint;
  disabled?: boolean;
}

function ConferencePhone({ entryPoint, disabled }: ConferencePhoneProps) {
  return (
    <div>
      <ConferenceItem>
        <ConferenceItemLink href={entryPoint.joinUrl.value}>
          {entryPoint.joinUrl.label ?? entryPoint.joinUrl.value}
        </ConferenceItemLink>
        <ConferenceItemActions>
          <CopyButton value={entryPoint.joinUrl.value} disabled={disabled}>
            <span className="sr-only">Copy</span>
          </CopyButton>
        </ConferenceItemActions>
      </ConferenceItem>
    </div>
  );
}

interface ConferenceSipProps {
  entryPoint: ConferenceEntryPoint;
  disabled?: boolean;
}

function ConferenceSip({ entryPoint, disabled }: ConferenceSipProps) {
  return (
    <div>
      <ConferenceItem>
        <ConferenceItemLink href={entryPoint.joinUrl.value}>
          {entryPoint.joinUrl.label ?? entryPoint.joinUrl.value}
        </ConferenceItemLink>
        <ConferenceItemActions>
          <CopyButton value={entryPoint.joinUrl.value} disabled={disabled}>
            <span className="sr-only">Copy</span>
          </CopyButton>
        </ConferenceItemActions>
      </ConferenceItem>
    </div>
  );
}

interface ConferenceDetailsProps {
  conference: ConferenceData;
  disabled?: boolean;
}

export function ConferenceDetails({
  conference,
  disabled = false,
}: ConferenceDetailsProps) {
  if (conference.type !== "conference") {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 ps-1">
      {conference.video ? (
        <ConferenceVideo
          name={conference.name ?? "Join link"}
          entryPoint={conference.video}
          disabled={disabled}
        />
      ) : null}
      {conference.sip ? (
        <ConferenceSip entryPoint={conference.sip} disabled={disabled} />
      ) : null}
      {conference.phone?.map((phone, idx) => (
        <ConferencePhone key={idx} entryPoint={phone} disabled={disabled} />
      ))}
    </div>
  );
}
