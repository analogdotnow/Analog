"use client";

import * as React from "react";

import { useLiveEventById } from "@/lib/db";
import { EventFormStateContext } from "./event-form-state-provider";
import { getDifferences } from "./merge-changes";

function useEventFormId() {
  return EventFormStateContext.useSelector((snapshot) =>
    snapshot.matches("loading") ? (snapshot.context.formEvent?.id ?? "") : "",
  );
}

interface LiveUpdateProviderProps {
  children: React.ReactNode;
}

export function LiveUpdateProvider({ children }: LiveUpdateProviderProps) {
  const actorRef = EventFormStateContext.useActorRef();
  const id = useEventFormId();

  const formEvent = EventFormStateContext.useSelector((snapshot) =>
    snapshot.matches("loading") ? snapshot.context.formEvent : null,
  );

  const event = useLiveEventById(id);

  React.useEffect(() => {
    if (!event) {
      return;
    }

    const snapshot = actorRef.getSnapshot();

    if (!snapshot.context.formEvent) {
      return;
    }

    const differences = getDifferences(snapshot.context.formEvent, event);

    if (differences.length === 0) {
      return;
    }

    actorRef.send({ type: "LOAD", item: event });
  }, [event, actorRef]);

  return <>{children}</>;
}
