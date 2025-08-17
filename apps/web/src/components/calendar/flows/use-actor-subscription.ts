"use client";

import * as React from "react";
import { Actor, AnyActorLogic, SnapshotFrom } from "xstate";

interface UseActorRefSubscriptionProps<T extends AnyActorLogic> {
  actorRef: Actor<T>;
  onUpdate: (snapshot: SnapshotFrom<T>) => void;
}

export function useActorRefSubscription<T extends AnyActorLogic>({
  actorRef,
  onUpdate,
}: UseActorRefSubscriptionProps<T>) {
  React.useEffect(() => {
    const subscription = actorRef.subscribe((snapshot) => {
      onUpdate(snapshot);
    });

    return subscription.unsubscribe;
  }, [actorRef, onUpdate]);
}
