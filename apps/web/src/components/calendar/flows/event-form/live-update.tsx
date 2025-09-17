"use client";

import * as React from "react";

import { useLiveEventById } from "@/lib/db";
import { useActorRefSubscription } from "../use-actor-subscription";
import { EventFormStateContext } from "./event-form-state-provider";
import { getDifferences } from "./merge-changes";

function useEventFormId() {
  const actorRef = EventFormStateContext.useActorRef();
  const [id, setId] = React.useState<string>("");

  useActorRefSubscription({
    actorRef,
    onUpdate: (snapshot) => {
      if (snapshot.matches("loading")) {
        setId(snapshot.context.formEvent?.id ?? "");
      }
    },
  });

  return id;
}

interface LiveUpdateProviderProps {
  children: React.ReactNode;
}

export function ClientLiveUpdateProvider({
  children,
}: LiveUpdateProviderProps) {
  const actorRef = EventFormStateContext.useActorRef();
  const id = useEventFormId();

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

interface LiveUpdateProviderProps {
  children: React.ReactNode;
}

export function LiveUpdateProvider({ children }: LiveUpdateProviderProps) {
  if (typeof window === "undefined") {
    return <>{children}</>;
  }

  return <ClientLiveUpdateProvider>{children}</ClientLiveUpdateProvider>;
}
