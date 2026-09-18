import { toast } from "sonner";

import { jotaiStore } from "@/atoms/store";
import {
  addOptimisticActionAtom,
  removeDraftOptimisticActionsByEventIdAtom,
  removeOptimisticActionAtom,
} from "@/hooks/calendar/optimistic-actions";
import { getEventById } from "@/lib/db";
import type { CalendarEvent, EventChanges } from "@/lib/interfaces";
import type { RouterInputs, RouterOutputs } from "@/lib/trpc";
import {
  buildUpdateEvent,
  buildUpdateSeries,
  changedFields,
  isEmptyUpdate,
} from "./update-event/utils";

type Scope = "series" | "instance";

// Success passes back the canonical event returned by the provider (absent
// when the update diffed to nothing), so callers can advance the baseline
// they diff subsequent edits against.
export type OnWriteSuccess = (event?: CalendarEvent) => void;

export interface CreateWrite {
  kind: "create";
  event: CalendarEvent;
  notify?: boolean;
  onSuccess?: OnWriteSuccess;
  // The staged preview this write takes over.
  token?: StageToken;
}

export interface UpdateWrite {
  kind: "update";
  id: string;
  changes: EventChanges;
  scope?: Scope;
  notify?: boolean;
  onSuccess?: OnWriteSuccess;
  token?: StageToken;
}

export interface DeleteWrite {
  kind: "delete";
  event: CalendarEvent;
  scope?: Scope;
  notify?: boolean;
  token?: StageToken;
}

export type Write = CreateWrite | UpdateWrite | DeleteWrite;

// An edit shown on the calendar before it is written: waiting on a prompt,
// or deferred into a dirty form until its next save.
export type Staged =
  | { kind: "create"; event: CalendarEvent }
  | { kind: "update"; changes: EventChanges }
  | { kind: "delete" };

export interface StageToken {
  readonly id: string;
}

type Pending =
  | {
      kind: "create";
      event: CalendarEvent;
      notify?: boolean;
      onSuccess: OnWriteSuccess[];
    }
  | {
      kind: "update";
      changes: EventChanges;
      scope?: Scope;
      notify?: boolean;
      onSuccess: OnWriteSuccess[];
    }
  | { kind: "delete"; scope?: Scope; notify?: boolean };

// One lane per event: `sent` is the write in flight, `pending` is every write
// enqueued since, merged into one. `baseline` is the last server-confirmed
// event (absent while the create has not returned yet, or for a draft that
// only exists as overlays). `staged` are the previews riding on top of that
// state; they keep the lane alive but are not its to write. `generation`
// counts the writes taken so a settle that started before a later write
// cannot tear the lane down.
interface Lane {
  id: string;
  baseline: CalendarEvent | undefined;
  sent: Pending | undefined;
  pending: Pending | undefined;
  staged: Map<StageToken, Staged>;
  generation: number;
  // True while `finish` refreshes the caches after the last write; the lane
  // still speaks for the event until the stored copy has caught up.
  settling: boolean;
}

export interface WriteLaneDeps {
  create: (
    input: RouterInputs["events"]["create"],
  ) => Promise<RouterOutputs["events"]["create"]>;
  update: (
    input: RouterInputs["events"]["update"],
  ) => Promise<RouterOutputs["events"]["update"]>;
  delete: (input: RouterInputs["events"]["delete"]) => Promise<unknown>;
  // Replace the event by id in every list cache and the local db.
  writeThrough: (event: CalendarEvent) => Promise<void>;
  // Drop the event by id from every list cache and the local db.
  remove: (eventId: string) => Promise<void>;
  // Refetch the list caches and resolve once they hold fresh server state.
  settle: () => Promise<void>;
  onIdChanged: (previousId: string, event: CalendarEvent) => void;
}

export interface WriteLane {
  setDeps: (deps: WriteLaneDeps) => void;
  enqueue: (write: Write) => Promise<void>;
  has: (eventId: string) => boolean;
  // True while the lane has a write in flight, queued, or settling into the
  // caches: only then does `current` know more than the stored copy.
  busy: (eventId: string) => boolean;
  // The event as it will look once every queued write has landed; undefined
  // when the lane is deleting it. Staged edits are not included, so this is
  // what the form may treat as its baseline.
  current: (eventId: string) => CalendarEvent | undefined;
  // The event as the calendar shows it: `current` plus every staged edit.
  shown: (eventId: string) => CalendarEvent | undefined;
  // Show an edit before it is written; the token hands it to the write that
  // takes it over (`enqueue`) or drops it (`unstage`). Undefined (after a
  // toast) when the stored event could not be read.
  stage: (eventId: string, staged: Staged) => Promise<StageToken | undefined>;
  unstage: (token: StageToken) => void;
  // Drops every overlay the lane put up; for when the calendar unmounts.
  dispose: () => void;
}

function unreachable(value: never): never {
  throw new Error(`Unhandled write: ${JSON.stringify(value)}`);
}

// Partial changes carry the id they were made under; after a re-key that is
// stale, so the target's id always wins.
function applyChanges(
  event: CalendarEvent,
  changes: EventChanges,
): CalendarEvent {
  return Object.assign({}, event, changes, { id: event.id });
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

// The lane outlives the renders that refresh the mutation and cache handles
// it works with; `setDeps` swaps them in without dropping lane state.
export function createWriteLane(initialDeps: WriteLaneDeps): WriteLane {
  const lanes = new Map<string, Lane>();
  // Old id → new id after a provider re-keyed an event, so an edit that was
  // queued (e.g. behind a prompt) under the old id still finds its lane.
  const aliases = new Map<string, string>();

  let deps = initialDeps;

  const getDeps = () => deps;

  function resolve(id: string): string {
    const next = aliases.get(id);

    return next ? resolve(next) : id;
  }

  function project(
    baseline: CalendarEvent | undefined,
    writes: Iterable<Pending | Staged | undefined>,
  ) {
    let event = baseline;

    for (const write of writes) {
      if (!write) {
        continue;
      }

      switch (write.kind) {
        case "create":
          // Once the create has returned, the server copy is the truth.
          if (!event) {
            event = write.event;
          }
          break;
        case "update":
          event = event ? applyChanges(event, write.changes) : event;
          break;
        case "delete":
          return undefined;
        default:
          return unreachable(write);
      }
    }

    return event;
  }

  function overlayEvent(lane: Lane) {
    return project(lane.baseline, [lane.sent, lane.pending]);
  }

  function shownEvent(lane: Lane) {
    return project(overlayEvent(lane), lane.staged.values());
  }

  function isDeleting(lane: Lane) {
    return [lane.sent, lane.pending, ...lane.staged.values()].some(
      (write) => write?.kind === "delete",
    );
  }

  function setOverlay(lane: Lane) {
    if (isDeleting(lane)) {
      previewDelete(lane.id);

      return;
    }

    const event = shownEvent(lane);

    if (!event) {
      jotaiStore.set(removeOptimisticActionAtom, lane.id);

      return;
    }

    preview(event);
  }

  function preview(event: CalendarEvent) {
    const id = resolve(event.id);

    jotaiStore.set(addOptimisticActionAtom, {
      id,
      type: "update",
      eventId: id,
      event: id === event.id ? event : { ...event, id },
    });
  }

  function previewDelete(eventId: string) {
    const id = resolve(eventId);

    jotaiStore.set(addOptimisticActionAtom, {
      id,
      type: "delete",
      eventId: id,
    });
  }

  function register(id: string, baseline: CalendarEvent | undefined) {
    const lane: Lane = {
      id,
      baseline,
      sent: undefined,
      pending: undefined,
      staged: new Map(),
      generation: 0,
      settling: false,
    };

    lanes.set(id, lane);

    return lane;
  }

  // Registers a lane from the stored event; undefined when there is none.
  // Callers look the lane up synchronously first: yielding for the db read
  // while a lane exists would let a `finish` resuming in the same tick tear
  // that lane down underneath the write.
  async function laneFor(requestedId: string) {
    const id = resolve(requestedId);
    const baseline = await getEventById(id);

    // Another enqueue may have registered the lane while the db read was
    // pending; it owns the id now.
    const raced = lanes.get(id);

    if (raced) {
      return raced;
    }

    if (!baseline) {
      return undefined;
    }

    return register(id, baseline);
  }

  // A lane without a stored event is a draft that only exists as overlays.
  async function laneForStaging(eventId: string) {
    const existing = lanes.get(resolve(eventId));

    if (existing) {
      return existing;
    }

    try {
      return (await laneFor(eventId)) ?? register(resolve(eventId), undefined);
    } catch (error) {
      toast.error(errorMessage(error));

      return undefined;
    }
  }

  async function stage(eventId: string, staged: Staged) {
    const lane = await laneForStaging(eventId);

    if (!lane) {
      return undefined;
    }

    const token: StageToken = { id: lane.id };

    lane.staged.set(token, staged);
    setOverlay(lane);

    return token;
  }

  function unstage(token: StageToken) {
    const lane = lanes.get(resolve(token.id));

    if (!lane?.staged.delete(token)) {
      return;
    }

    if (lane.sent || lane.pending || lane.staged.size > 0) {
      setOverlay(lane);

      return;
    }

    lanes.delete(lane.id);
    jotaiStore.set(removeOptimisticActionAtom, lane.id);
  }

  function mergeUpdate(lane: Lane, write: UpdateWrite) {
    const onSuccess = write.onSuccess ? [write.onSuccess] : [];
    const pending = lane.pending;

    if (!pending) {
      lane.pending = {
        kind: "update",
        changes: write.changes,
        scope: write.scope,
        notify: write.notify,
        onSuccess,
      };

      return;
    }

    switch (pending.kind) {
      case "create":
        // Not sent yet: fold the edit into the create instead of a follow-up.
        pending.event = applyChanges(pending.event, write.changes);
        pending.onSuccess.push(...onSuccess);
        return;
      case "update":
        pending.changes = { ...pending.changes, ...write.changes };
        pending.scope = write.scope ?? pending.scope;
        pending.notify = write.notify ?? pending.notify;
        pending.onSuccess.push(...onSuccess);
        return;
      case "delete":
        return;
      default:
        return unreachable(pending);
    }
  }

  function writeId(write: Write) {
    return resolve(write.kind === "update" ? write.id : write.event.id);
  }

  // Nothing is queued when taking a write fails (the db read for the lane
  // threw), so the overlay falls back to what the lane still shows.
  async function enqueue(write: Write) {
    try {
      await take(write);
    } catch (error) {
      toast.error(errorMessage(error));

      const lane = lanes.get(writeId(write));

      if (lane) {
        setOverlay(lane);

        return;
      }

      jotaiStore.set(removeOptimisticActionAtom, writeId(write));
    }
  }

  async function take(write: Write) {
    // The write owns the change from here; the preview goes with it.
    if (write.token) {
      lanes.get(resolve(write.token.id))?.staged.delete(write.token);
    }

    switch (write.kind) {
      case "create": {
        const existing = lanes.get(resolve(write.event.id));

        if (existing) {
          const owned = overlayEvent(existing);

          // The form still calls the event a draft until the create returns,
          // so a second save in that window is an edit of the pending create,
          // not another create.
          if (owned) {
            mergeUpdate(existing, {
              kind: "update",
              id: existing.id,
              changes: changedFields(write.event, owned),
              notify: write.notify,
              onSuccess: write.onSuccess,
            });
            setOverlay(existing);
            void drain(existing);

            return;
          }

          // A queued delete wins over a late save; a lane holding only
          // staged edits of the draft takes the create.
          if (existing.sent || existing.pending) {
            return;
          }
        }

        const lane = existing ?? register(write.event.id, undefined);

        lane.pending = {
          kind: "create",
          event: write.event,
          notify: write.notify,
          onSuccess: write.onSuccess ? [write.onSuccess] : [],
        };
        setOverlay(lane);
        void drain(lane);

        return;
      }
      case "update": {
        const lane = lanes.get(resolve(write.id)) ?? (await laneFor(write.id));

        if (!lane) {
          jotaiStore.set(removeOptimisticActionAtom, resolve(write.id));
          toast.error("Event not found");

          return;
        }

        mergeUpdate(lane, write);
        setOverlay(lane);
        void drain(lane);

        return;
      }
      case "delete": {
        const lane =
          lanes.get(resolve(write.event.id)) ?? (await laneFor(write.event.id));

        if (
          !lane ||
          (!lane.baseline && !lane.sent && lane.pending?.kind !== "create")
        ) {
          // A draft only exists as overlays.
          const id = resolve(write.event.id);

          lanes.delete(id);
          jotaiStore.set(removeDraftOptimisticActionsByEventIdAtom, id);
          jotaiStore.set(removeOptimisticActionAtom, id);

          return;
        }

        if (lane.pending?.kind === "create") {
          // The create never left the client; there is nothing to delete.
          lanes.delete(lane.id);
          jotaiStore.set(removeOptimisticActionAtom, lane.id);

          return;
        }

        lane.pending = {
          kind: "delete",
          scope: write.scope,
          notify: write.notify,
        };
        setOverlay(lane);
        void drain(lane);

        return;
      }
      default:
        return unreachable(write);
    }
  }

  async function drain(lane: Lane) {
    if (lane.sent || !lane.pending) {
      return;
    }

    const sent = lane.pending;

    lane.sent = sent;
    lane.pending = undefined;
    lane.generation += 1;

    try {
      await perform(lane, sent);
    } catch (error) {
      fail(lane, sent, error);
    }

    lane.sent = undefined;

    if (lane.pending) {
      setOverlay(lane);

      return drain(lane);
    }

    await finish(lane);
  }

  async function buildUpdatePayload(
    merged: CalendarEvent,
    baseline: CalendarEvent,
    sent: Extract<Pending, { kind: "update" }>,
  ) {
    if (merged.recurringEventId && sent.scope === "series") {
      // Whole-series edits target the master with only the changed fields;
      // sending an occurrence's dates under the master ID re-anchors the
      // series on the provider side.
      const master = await getEventById(merged.recurringEventId);

      if (!master) {
        throw new Error("The series this event belongs to isn't loaded yet.");
      }

      return buildUpdateSeries(merged, baseline, master, {
        sendUpdate: sent.notify,
      });
    }

    return buildUpdateEvent(merged, baseline, { sendUpdate: sent.notify });
  }

  async function perform(lane: Lane, sent: Pending) {
    const deps = getDeps();

    switch (sent.kind) {
      case "create": {
        const { event } = await deps.create({
          ...sent.event,
          sendUpdate: sent.notify,
        });

        if (event.id === lane.id) {
          lane.baseline = event;
        } else {
          await rekey(lane, event);
        }

        for (const onSuccess of sent.onSuccess) {
          onSuccess(event);
        }

        return;
      }
      case "update": {
        if (!lane.baseline) {
          throw new Error("Event not found");
        }

        const baseline = lane.baseline;
        const merged = applyChanges(baseline, sent.changes);
        const payload = await buildUpdatePayload(merged, baseline, sent);

        if (isEmptyUpdate(payload)) {
          for (const onSuccess of sent.onSuccess) {
            onSuccess();
          }

          return;
        }

        const { event } = await deps.update(payload);

        if (event.id === lane.id) {
          lane.baseline = event;
        } else if (event.id === merged.recurringEventId) {
          // A series write returns the master; the occurrence itself is only
          // known locally until the next refetch.
          lane.baseline = merged;
          await deps.writeThrough(event);
        } else {
          await rekey(lane, event);
        }

        // Callers get the event they edited (the occurrence for a series
        // write), never the master that came back.
        for (const onSuccess of sent.onSuccess) {
          onSuccess(lane.baseline);
        }

        return;
      }
      case "delete": {
        if (!lane.baseline) {
          throw new Error("Event not found");
        }

        const baseline = lane.baseline;
        const eventId =
          baseline.recurringEventId && sent.scope === "series"
            ? baseline.recurringEventId
            : lane.id;

        await deps.delete({
          calendar: baseline.calendar,
          eventId,
          sendUpdate: sent.notify,
        });
        await deps.remove(lane.id);

        lane.baseline = undefined;

        return;
      }
      default:
        return unreachable(sent);
    }
  }

  // The provider already rebased and retried; what remains is a real
  // failure. The baseline stays, so the overlay falls back to server state
  // for the failed fields while later pending writes still go out.
  function fail(lane: Lane, sent: Pending, error: unknown) {
    toast.error(errorMessage(error));

    if (sent.kind === "create") {
      lane.pending = undefined;
    }
  }

  // Microsoft creates and cross-calendar moves hand back a new id; the lane,
  // its overlay, selection, and form follow it.
  async function rekey(lane: Lane, event: CalendarEvent) {
    const previousId = lane.id;

    lanes.delete(previousId);
    aliases.set(previousId, event.id);
    lane.id = event.id;
    lane.baseline = event;
    lanes.set(lane.id, lane);

    jotaiStore.set(removeOptimisticActionAtom, previousId);
    setOverlay(lane);

    await getDeps().remove(previousId);
    getDeps().onIdChanged(previousId, event);
  }

  // Write-through first, then wait for the refetch, and only then drop the
  // overlay so the event never flickers back to stale cache state.
  async function finish(lane: Lane) {
    const deps = getDeps();
    const generation = lane.generation;

    lane.settling = true;

    // The write itself succeeded; a failed cache refresh must still let the
    // lane go, or the overlay would stay up for good.
    try {
      if (lane.baseline) {
        await deps.writeThrough(lane.baseline);
      }

      await deps.settle();
    } catch (error) {
      toast.error(errorMessage(error));
    }

    lane.settling = false;

    // A write taken while settling owns the lane now, and only its own
    // settle may tear the lane down. A lane re-created under the same id in
    // the meantime owns the overlay too.
    if (
      generation !== lane.generation ||
      lane.sent ||
      lane.pending ||
      lanes.get(lane.id) !== lane
    ) {
      return;
    }

    // Staged edits need the baseline to show against; the lane stays until
    // they are taken or dropped.
    if (lane.staged.size > 0) {
      setOverlay(lane);

      return;
    }

    jotaiStore.set(removeOptimisticActionAtom, lane.id);
    lanes.delete(lane.id);
  }

  return {
    setDeps: (next) => {
      deps = next;
    },
    enqueue,
    has: (eventId) => lanes.has(resolve(eventId)),
    busy: (eventId) => {
      const lane = lanes.get(resolve(eventId));

      return Boolean(lane && (lane.sent || lane.pending || lane.settling));
    },
    current: (eventId) => {
      const lane = lanes.get(resolve(eventId));

      return lane ? overlayEvent(lane) : undefined;
    },
    shown: (eventId) => {
      const lane = lanes.get(resolve(eventId));

      return lane ? shownEvent(lane) : undefined;
    },
    stage,
    unstage,
    dispose: () => {
      for (const id of lanes.keys()) {
        jotaiStore.set(removeOptimisticActionAtom, id);
      }

      lanes.clear();
      aliases.clear();
    },
  };
}
