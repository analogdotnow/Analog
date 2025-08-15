import * as React from "react";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { deepEqual } from "fast-equals";
import { useAtom, useAtomValue } from "jotai";
import { diff } from "json-diff-ts";
import * as R from "remeda";

import { isBefore } from "@repo/temporal";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { SelectedEvents, selectedEventsAtom } from "@/atoms/selected-events";
import type { CalendarEvent, DraftEvent } from "@/lib/interfaces";
import { EventCollectionItem, convertEventToItem } from "./event-collection";
import {
  buildUpdateEvent,
  buildUpdateSeries,
  requiresAttendeeConfirmation,
} from "./update-utils";
import { useEvents } from "./use-events";

export type Action =
  | { type: "draft"; event: DraftEvent }
  | {
      type: "update";
      event: CalendarEvent;
      force?: { sendUpdate?: boolean; recurrenceScope?: "instance" | "series" };
    }
  | { type: "select"; event: CalendarEvent }
  | { type: "unselect"; eventId?: string }
  | {
      type: "delete";
      eventId: string;
      force?: { sendUpdate?: boolean; recurrenceScope?: "instance" | "series" };
    }
  | {
      type: "move";
      eventId: string;
      source: { accountId: string; calendarId: string };
      destination: { accountId: string; calendarId: string };
      force?: { sendUpdate?: boolean; recurrenceScope?: "instance" | "series" };
    };

type OptimisticAction =
  | { type: "update"; event: CalendarEvent }
  | { type: "delete"; eventId: string };

type ConfirmationDialogState = {
  open: boolean;
  type: "update" | "delete";
  event: CalendarEvent | null;
  onConfirm: (sendUpdate: boolean) => void;
  onCancel: () => void;
  close: () => void;
};

type RecurringEditScopeDialogState = {
  open: boolean;
  event: CalendarEvent | null;
  onInstance: () => void;
  onSeries: () => void;
  onCancel: () => void;
  close: () => void;
};

type CreateConfirmationDialogProps = {
  type: "update" | "delete";
  event: CalendarEvent;
  onConfirm: (sendUpdate: boolean) => void;
  onCancel: () => void;
};

type CreateRecurringScopeDialogProps = {
  event: CalendarEvent;
  onInstance: () => void;
  onSeries: () => void;
  onCancel: () => void;
};

export function useOptimisticEvents() {
  const {
    events,
    createMutation,
    updateMutation,
    deleteMutation,
    moveMutation,
    eventsQueryKey,
    masterRecurringEvents,
  } = useEvents();

  const [selectedEvents, setSelectedEvents] = useAtom(selectedEventsAtom);
  const { defaultTimeZone } = useAtomValue(calendarSettingsAtom);

  const [isPending, startTransition] = React.useTransition();
  const [confirmationDialog, setConfirmationDialog] =
    React.useState<ConfirmationDialogState>({
      open: false,
      type: "update",
      event: null,
      onConfirm: () => {},
      onCancel: () => {},
      close: () => {},
    });

  const createConfirmationDialog = React.useCallback(
    ({ type, event, onConfirm, onCancel }: CreateConfirmationDialogProps) => {
      setConfirmationDialog({
        open: true,
        type,
        event,
        onConfirm,
        onCancel,
        close: () => {
          setConfirmationDialog((prev) => ({ ...prev, open: false }));
        },
      });
    },
    [],
  );

  const createRecurringScopeDialog = React.useCallback(
    ({
      event,
      onInstance,
      onSeries,
      onCancel,
    }: CreateRecurringScopeDialogProps) => {
      setRecurringScopeDialog({
        open: true,
        event,
        onInstance,
        onSeries,
        onCancel,
        close: () => {
          setRecurringScopeDialog((prev) => ({ ...prev, open: false }));
        },
      });
    },
    [],
  );

  const [recurringScopeDialog, setRecurringScopeDialog] =
    React.useState<RecurringEditScopeDialogState>({
      open: false,
      event: null,
      onInstance: () => {},
      onSeries: () => {},
      onCancel: () => {},
      close: () => {},
    });

  const [optimisticEvents, applyOptimistic] = React.useOptimistic(
    events,
    (state: EventCollectionItem[], action: OptimisticAction) => {
      if (action.type === "delete") {
        return state.filter((item) => item.event.id !== action.eventId);
      }

      const withoutEvent = state.filter(
        (item) => item.event.id !== action.event.id,
      );

      const updatedItem = convertEventToItem(action.event, defaultTimeZone);

      const insertIdx = R.sortedIndexWith(withoutEvent, (item) =>
        isBefore(item.start, updatedItem.start),
      );

      return [
        ...withoutEvent.slice(0, insertIdx),
        updatedItem,
        ...withoutEvent.slice(insertIdx),
      ];
    },
  );

  const queryClient = useQueryClient();

  const resetOptimisticEvents = React.useCallback(() => {
    const previousEvents = queryClient.getQueryData(eventsQueryKey);

    queryClient.setQueryData(eventsQueryKey, previousEvents);
  }, [queryClient, eventsQueryKey]);

  const handleEventSave = React.useCallback(
    (
      event: CalendarEvent,
      force?: { sendUpdate?: boolean; recurrenceScope?: "instance" | "series" },
    ) => {
      startTransition(() => applyOptimistic({ type: "update", event }));

      const exists = optimisticEvents.find(
        (item) => item.event.id === event.id,
      );

      if (!exists) {
        createMutation.mutate(event);
        return;
      }

      if (deepEqual(event, exists.event)) {
        return;
      }

      // If editing a recurring instance, ask for scope before proceeding
      if (event.recurringEventId) {
        // Bypass dialog if recurrenceScope is provided
        if (force?.recurrenceScope === "instance") {
          if (force?.sendUpdate || !requiresAttendeeConfirmation(event)) {
            updateMutation.mutate(
              buildUpdateEvent(event, exists.event, {
                sendUpdate: force?.sendUpdate,
              }),
            );

            return;
          }

          createConfirmationDialog({
            type: "update",
            event,
            onConfirm: (sendUpdate: boolean) => {
              updateMutation.mutate(
                buildUpdateEvent(event, exists.event, { sendUpdate }),
              );
            },
            onCancel: () => {
              resetOptimisticEvents();
            },
          });
          return;
        }

        if (force?.recurrenceScope === "series") {
          if (force?.sendUpdate || !requiresAttendeeConfirmation(event)) {
            updateMutation.mutate(
              buildUpdateSeries(event, exists.event, {
                sendUpdate: force?.sendUpdate,
              }),
            );
            return;
          }

          // attendee confirmation for series
          createConfirmationDialog({
            type: "update",
            event,
            onConfirm: (sendUpdate: boolean) => {
              updateMutation.mutate(
                buildUpdateSeries(event, exists.event, { sendUpdate }),
              );
            },
            onCancel: () => {
              resetOptimisticEvents();
            },
          });

          return;
        }

        createRecurringScopeDialog({
          event,
          onInstance: () => {
            if (force?.sendUpdate || !requiresAttendeeConfirmation(event)) {
              updateMutation.mutate(
                buildUpdateEvent(event, exists.event, {
                  sendUpdate: force?.sendUpdate,
                }),
              );
              return;
            }

            // Ask attendee confirmation
            createConfirmationDialog({
              type: "update",
              event,
              onConfirm: (sendUpdate: boolean) => {
                updateMutation.mutate(
                  buildUpdateEvent(event, exists.event, { sendUpdate }),
                );
              },
              onCancel: () => {
                resetOptimisticEvents();
              },
            });
          },
          onSeries: () => {
            const master = masterRecurringEvents[event.recurringEventId!];
            if (!master) {
              // Fallback to instance behavior if master not found
              setRecurringScopeDialog((prev) => ({ ...prev, open: false }));

              updateMutation.mutate(
                buildUpdateEvent(event, exists.event, {
                  sendUpdate: force?.sendUpdate,
                }),
              );
              return;
            }

            if (force?.sendUpdate || !requiresAttendeeConfirmation(event)) {
              updateMutation.mutate(
                buildUpdateSeries(event, exists.event, {
                  sendUpdate: force?.sendUpdate,
                }),
              );
              setRecurringScopeDialog((prev) => ({ ...prev, open: false }));
              return;
            }

            // Ask attendee confirmation for series update
            createConfirmationDialog({
              type: "update",
              event,
              onConfirm: (sendUpdate: boolean) => {
                updateMutation.mutate(
                  buildUpdateSeries(event, exists.event, { sendUpdate }),
                );
              },
              onCancel: () => {
                resetOptimisticEvents();
              },
            });
          },
          onCancel: () => {
            resetOptimisticEvents();
          },
        });

        return;
      }

      if (force?.sendUpdate || !requiresAttendeeConfirmation(event)) {
        updateMutation.mutate(
          buildUpdateEvent(event, exists.event, {
            sendUpdate: force?.sendUpdate,
          }),
        );
        return;
      }

      createConfirmationDialog({
        type: "update",
        event,
        onConfirm: (sendUpdate: boolean) => {
          updateMutation.mutate(
            buildUpdateEvent(event, exists.event, { sendUpdate }),
          );
        },
        onCancel: () => {
          resetOptimisticEvents();
        },
      });
    },
    [
      optimisticEvents,
      createConfirmationDialog,
      applyOptimistic,
      createMutation,
      createRecurringScopeDialog,
      updateMutation,
      resetOptimisticEvents,
      masterRecurringEvents,
    ],
  );

  const asyncUpdateEvent = React.useCallback(
    async (
      event: CalendarEvent,
      force?: { sendUpdate?: boolean; recurrenceScope?: "instance" | "series" },
    ) => {
      startTransition(() => applyOptimistic({ type: "update", event }));

      const exists = optimisticEvents.find(
        (item) => item.event.id === event.id,
      );

      if (!exists) {
        await createMutation.mutateAsync(event);
        return;
      }

      if (deepEqual(event, exists.event)) {
        return;
      }

      // If editing a recurring instance, ask for scope before proceeding (async)
      if (event.recurringEventId) {
        // Bypass dialog if recurrenceScope is provided (async)
        if (force?.recurrenceScope === "instance") {
          if (force?.sendUpdate || !requiresAttendeeConfirmation(event)) {
            await updateMutation.mutateAsync(
              buildUpdateEvent(event, exists.event, {
                sendUpdate: force?.sendUpdate,
              }),
            );
            return;
          }

          // attendee confirmation still required
          await new Promise<void>((resolve) => {
            createConfirmationDialog({
              type: "update",
              event,
              onConfirm: async (sendUpdate: boolean) => {
                await updateMutation.mutateAsync(
                  buildUpdateEvent(event, exists.event, { sendUpdate }),
                );
                resolve();
              },
              onCancel: () => {
                resetOptimisticEvents();
                resolve();
              },
            });
          });
          return;
        }

        if (force?.recurrenceScope === "series") {
          const master = masterRecurringEvents[event.recurringEventId!];
          if (!master) {
            console.error(
              `Master recurring event not found for event ${event.id}`,
            );
            return;
          }
          if (force?.sendUpdate || !requiresAttendeeConfirmation(event)) {
            await updateMutation.mutateAsync(
              buildUpdateSeries(event, exists.event, {
                sendUpdate: force?.sendUpdate,
              }),
            );
            return;
          }

          await new Promise<void>((resolve) => {
            createConfirmationDialog({
              type: "update",
              event,
              onConfirm: async (sendUpdate: boolean) => {
                await updateMutation.mutateAsync(
                  buildUpdateSeries(event, exists.event, { sendUpdate }),
                );
                resolve();
              },
              onCancel: () => {
                resetOptimisticEvents();
                resolve();
              },
            });
          });
          return;
        }

        await new Promise<void>((resolve) => {
          createRecurringScopeDialog({
            event,
            onInstance: async () => {
              if (force?.sendUpdate || !requiresAttendeeConfirmation(event)) {
                await updateMutation.mutateAsync(
                  buildUpdateEvent(event, exists.event, {
                    sendUpdate: force?.sendUpdate,
                  }),
                );
                resolve();
                return;
              }

              createConfirmationDialog({
                type: "update",
                event,
                onConfirm: async (sendUpdate: boolean) => {
                  await updateMutation.mutateAsync(
                    buildUpdateEvent(event, exists.event, { sendUpdate }),
                  );
                  resolve();
                },
                onCancel: () => {
                  resetOptimisticEvents();
                  resolve();
                },
              });
            },
            onSeries: async () => {
              const master = masterRecurringEvents[event.recurringEventId!];
              if (!master) {
                setRecurringScopeDialog((prev) => ({ ...prev, open: false }));
                await updateMutation.mutateAsync(
                  buildUpdateEvent(event, exists.event, {
                    sendUpdate: force?.sendUpdate,
                  }),
                );
                resolve();
                return;
              }

              if (force?.sendUpdate || !requiresAttendeeConfirmation(event)) {
                await updateMutation.mutateAsync(
                  buildUpdateSeries(event, exists.event, {
                    sendUpdate: force?.sendUpdate,
                  }),
                );

                resolve();
                return;
              }

              createConfirmationDialog({
                type: "update",
                event,
                onConfirm: async (sendUpdate: boolean) => {
                  await updateMutation.mutateAsync(
                    buildUpdateSeries(event, exists.event, { sendUpdate }),
                  );
                  resolve();
                },
                onCancel: () => {
                  resetOptimisticEvents();
                  resolve();
                },
              });
            },
            onCancel: () => {
              resetOptimisticEvents();
              resolve();
            },
          });
        });

        return;
      }

      if (force?.sendUpdate || !requiresAttendeeConfirmation(event)) {
        await updateMutation.mutateAsync(
          buildUpdateEvent(event, exists.event, {
            sendUpdate: force?.sendUpdate,
          }),
        );

        return;
      }

      createConfirmationDialog({
        type: "update",
        event,
        onConfirm: async (sendUpdate: boolean) => {
          await updateMutation.mutateAsync(
            buildUpdateEvent(event, exists.event, { sendUpdate }),
          );
        },
        onCancel: () => {
          resetOptimisticEvents();
        },
      });
    },
    [
      optimisticEvents,
      createConfirmationDialog,
      applyOptimistic,
      createMutation,
      updateMutation,
      resetOptimisticEvents,
      masterRecurringEvents,
      createRecurringScopeDialog,
    ],
  );

  const handleEventDelete = React.useCallback(
    (
      eventId: string,
      force?: { sendUpdate?: boolean; recurrenceScope?: "instance" | "series" },
    ) => {
      const deletedEventItem = optimisticEvents.find(
        (item) => item.event.id === eventId,
      );

      if (!deletedEventItem) {
        console.error(`Event with id ${eventId} not found`);
        return;
      }

      startTransition(() => applyOptimistic({ type: "delete", eventId }));

      const deletedEvent = deletedEventItem.event;

      if (force?.sendUpdate || !requiresAttendeeConfirmation(deletedEvent)) {
        setSelectedEvents((prev) => prev.filter((e) => e.id !== eventId));

        deleteMutation.mutate({
          accountId: deletedEvent.accountId,
          calendarId: deletedEvent.calendarId,
          eventId,
          sendUpdate: force?.sendUpdate,
        });

        return;
      }

      createConfirmationDialog({
        type: "delete",
        event: deletedEvent,
        onConfirm: (sendUpdate: boolean) => {
          setSelectedEvents((prev) => prev.filter((e) => e.id !== eventId));

          deleteMutation.mutate({
            accountId: deletedEvent.accountId,
            calendarId: deletedEvent.calendarId,
            eventId,
            sendUpdate,
          });
        },
        onCancel: () => {
          resetOptimisticEvents();
        },
      });
    },
    [
      optimisticEvents,
      createConfirmationDialog,
      applyOptimistic,
      setSelectedEvents,
      deleteMutation,
      resetOptimisticEvents,
    ],
  );

  const dispatchAction = React.useCallback(
    (action: Action) => {
      if (action.type === "draft" || action.type === "select") {
        setSelectedEvents([action.event]);
      } else if (action.type === "unselect") {
        setSelectedEvents([]);
      } else if (action.type === "update") {
        handleEventSave(action.event, action.force);
      } else if (action.type === "delete") {
        handleEventDelete(action.eventId, action.force);
      } else if (action.type === "move") {
        const optimistic = optimisticEvents.find(
          (item) => item.event.id === action.eventId,
        );

        if (!optimistic) {
          return;
        }

        const movedEvent = {
          ...optimistic.event,
          ...action.destination,
        } as CalendarEvent;

        startTransition(() =>
          applyOptimistic({
            type: "update",
            event: movedEvent,
          }),
        );

        if (
          action.force?.sendUpdate ||
          !requiresAttendeeConfirmation(movedEvent)
        ) {
          moveMutation.mutate({
            source: {
              providerId: "google",
              ...action.source,
            },
            destination: {
              providerId: "google",
              ...action.destination,
            },
            eventId: action.eventId,
            sendUpdate: action.force?.sendUpdate ?? true,
          });

          return;
        }

        createConfirmationDialog({
          type: "update",
          event: movedEvent,
          onConfirm: (sendUpdate: boolean) => {
            moveMutation.mutate({
              source: {
                providerId: "google",
                ...action.source,
              },
              destination: {
                providerId: "google",
                ...action.destination,
              },
              eventId: action.eventId,
              sendUpdate,
            });
          },
          onCancel: () => {
            resetOptimisticEvents();
          },
        });
      }
    },
    [
      setSelectedEvents,
      handleEventSave,
      handleEventDelete,
      optimisticEvents,
      createConfirmationDialog,
      applyOptimistic,
      moveMutation,
      resetOptimisticEvents,
    ],
  );

  const dispatchAsyncAction = React.useCallback(
    async (action: Action) => {
      if (action.type === "update") {
        await asyncUpdateEvent(action.event, action.force);
      }
    },
    [asyncUpdateEvent],
  );

  // Derive optimistic selected events from optimistic events - this ensures perfect sync
  const optimisticSelectedEvents = React.useMemo(() => {
    return selectedEvents.reduce<SelectedEvents>((acc, selectedEvent) => {
      const updatedEventItem = optimisticEvents.find(
        (item) => item.event.id === selectedEvent.id,
      );

      acc.push(updatedEventItem?.event ?? selectedEvent);

      return acc;
    }, []);
  }, [optimisticEvents, selectedEvents]);

  return {
    events: optimisticEvents,
    selectedEvents: optimisticSelectedEvents,
    isPending,
    dispatchAction,
    dispatchAsyncAction,
    confirmationDialog,
    recurringScopeDialog,
  };
}
