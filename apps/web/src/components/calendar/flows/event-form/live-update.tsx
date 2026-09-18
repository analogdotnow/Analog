"use client";

import * as React from "react";
import { useAtomValue } from "jotai";

import { formAtom } from "@/components/event-form/atoms/form";
import { optimisticActionsByEventIdAtom } from "@/hooks/calendar/optimistic-actions";
import { useLiveEventById } from "@/lib/db";
import { useWriteLane } from "../write-lane-provider";
import { EventFormStateContext } from "./event-form-state-provider";
import { getDifferences } from "./merge-changes";

interface LiveUpdateProviderProps {
  children: React.ReactNode;
}

// Keeps the form in step with the event it shows: the lane's own state while
// it holds a write, otherwise the stored (server) copy. Staged edits (prompts,
// deferrals) ride on the overlay but are not written yet, so they must never
// become the baseline the form diffs against. Whether a LOAD rehydrates or
// merges is decided by the form (see useEventForm).
export function LiveUpdateProvider({ children }: LiveUpdateProviderProps) {
  const actorRef = EventFormStateContext.useActorRef();
  const lane = useWriteLane();
  const baseline = useAtomValue(formAtom).event;
  const id = baseline ? baseline.id : "";

  const stored = useLiveEventById(id);
  // The overlay changes with every lane state change, so reading it keeps
  // `incoming` in step with the lane. A lane holding only staged edits knows
  // nothing the stored copy does not, and must not hide remote changes.
  const overlay = useAtomValue(optimisticActionsByEventIdAtom)[id];
  const incoming = overlay && lane.busy(id) ? lane.current(id) : stored;

  React.useEffect(() => {
    if (!incoming || !baseline) {
      return;
    }

    if (getDifferences(baseline, incoming).length === 0) {
      return;
    }

    actorRef.send({ type: "LOAD", item: incoming });
  }, [incoming, baseline, actorRef]);

  return <>{children}</>;
}
