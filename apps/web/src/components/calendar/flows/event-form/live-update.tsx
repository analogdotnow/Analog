import * as React from "react";
import { useLiveQuery } from "dexie-react-hooks";

import { db, eventQuery } from "@/lib/db";
import { useActorRefSubscription } from "../use-actor-subscription";
import { EventFormStateContext } from "./event-form-state-provider";
import { compareEvents } from "./merge-changes";

function useEventFormId() {
  const actorRef = EventFormStateContext.useActorRef();
  const [id, setId] = React.useState<string>("");

  useActorRefSubscription({
    actorRef,
    onUpdate: (snapshot) => {
      if (snapshot.matches("ready")) {
        setId(snapshot.context.formEvent?.id ?? "");
      }
    },
  });

  return id;
}

export function useLiveUpdate() {
  const actorRef = EventFormStateContext.useActorRef();
  const id = useEventFormId();

  const result = useLiveQuery(
    () => db.events.where("id").equals(id).first(),
    [id],
  );

  React.useEffect(() => {
    // console.log("dexie event", row);
    if (!result) {
      return;
    }

    const snapshot = actorRef.getSnapshot();

    if (!snapshot.context.formEvent) {
      return;
    }

    const event = eventQuery(result);
    // const differences = compareEvents(snapshot.context.formEvent, event);
    // // console.log("differences", JSON.stringify(differences, null, 2));
    // if (differences.length === 0) {
    //   return;
    // }

    actorRef.send({ type: "LOAD", item: event });
  }, [result, actorRef]);
}
