import * as React from "react";

import type { ConferenceData, ConferenceEntryPoint } from "@repo/api/interfaces";

import { cn } from "@/lib/utils";
import { CopyButton } from "../copy-button";

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
}

function ConferenceVideo({ name, entryPoint }: ConferenceVideoProps) {
  return (
    <div className="flex flex-col gap-1">
      <ConferenceItem>
        <ConferenceItemLabel>{name}</ConferenceItemLabel>
        <ConferenceItemLink
          href={entryPoint.joinUrl.value}
          target="_blank"
          rel="noopener noreferrer"
        >
          {entryPoint.joinUrl.value}
        </ConferenceItemLink>
        <ConferenceItemActions>
          <CopyButton value={entryPoint.joinUrl.value}>
            <span className="sr-only">Copy join URL</span>
          </CopyButton>
        </ConferenceItemActions>
      </ConferenceItem>
      {entryPoint.meetingCode && (
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
      {entryPoint.accessCode && (
        <ConferenceItem>
          <ConferenceItemLabel>Code</ConferenceItemLabel>
          <ConferenceItemContent>{entryPoint.accessCode}</ConferenceItemContent>
          <ConferenceItemActions>
            <CopyButton value={entryPoint.accessCode}>
              <span className="sr-only">Copy access code</span>
            </CopyButton>
          </ConferenceItemActions>
        </ConferenceItem>
      )}
      {entryPoint.password && (
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
    </div>
  );
}

interface ConferencePhoneProps {
  entryPoint: ConferenceEntryPoint;
}

function ConferencePhone({ entryPoint }: ConferencePhoneProps) {
  return (
    <div>
      <ConferenceItem>
        <ConferenceItemLink href={entryPoint.joinUrl.value}>
          {entryPoint.joinUrl.label ?? entryPoint.joinUrl.value}
        </ConferenceItemLink>
        <ConferenceItemActions>
          <CopyButton value={entryPoint.joinUrl.value}>
            <span className="sr-only">Copy</span>
          </CopyButton>
        </ConferenceItemActions>
      </ConferenceItem>
    </div>
  );
}

interface ConferenceSipProps {
  entryPoint: ConferenceEntryPoint;
}

function ConferenceSip({ entryPoint }: ConferenceSipProps) {
  return (
    <div>
      <ConferenceItem>
        <ConferenceItemLink href={entryPoint.joinUrl.value}>
          {entryPoint.joinUrl.label ?? entryPoint.joinUrl.value}
        </ConferenceItemLink>
        <ConferenceItemActions>
          <CopyButton value={entryPoint.joinUrl.value}>
            <span className="sr-only">Copy</span>
          </CopyButton>
        </ConferenceItemActions>
      </ConferenceItem>
    </div>
  );
}

interface ConferenceDetailsProps {
  conference: ConferenceData;
}

export function ConferenceDetails({ conference }: ConferenceDetailsProps) {
  return (
    <div className="flex flex-col gap-2 ps-8">
      {/* {JSON.stringify(conference)} */}
      {conference.video ? (
        <ConferenceVideo
          name={conference.name ?? "Join link"}
          entryPoint={conference.video}
        />
      ) : null}
      {conference.sip ? <ConferenceSip entryPoint={conference.sip} /> : null}
      {conference.phone
        ? conference.phone.map((phone, idx) => (
            <ConferencePhone key={idx} entryPoint={phone} />
          ))
        : null}
    </div>
  );
}
