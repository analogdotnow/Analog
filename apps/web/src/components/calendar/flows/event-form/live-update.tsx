"use client";

import * as React from "react";
import { useAtomValue } from "jotai";

import { formAtom } from "@/components/event-form/atoms/form";
import { optimisticActionsByEventIdAtom } from "@/hooks/calendar/optimistic-actions";
import { useLiveEventById } from "@/lib/db";
import { EventFormStateContext } from "./event-form-state-provider";
import { getDifferences } from "./merge-changes";

interface LiveUpdateProviderProps {
  children: React.ReactNode;
}

// Keeps the form in step with the event it shows: a queued write's overlay
// while one is pending, otherwise the stored (server) copy. Whether a LOAD
// rehydrates or merges is decided by the form (see useEventForm).
export function LiveUpdateProvider({ children }: LiveUpdateProviderProps) {
  const actorRef = EventFormStateContext.useActorRef();
  const baseline = useAtomValue(formAtom).event;
  const id = baseline ? baseline.id : "";

  const stored = useLiveEventById(id);
  const overlay = useAtomValue(optimisticActionsByEventIdAtom)[id];
  const incoming =
    overlay && overlay.type !== "delete" ? overlay.event : stored;

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
