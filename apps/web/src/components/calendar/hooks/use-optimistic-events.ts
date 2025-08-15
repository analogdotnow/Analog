import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { deepEqual } from "fast-equals";
import { useAtom, useAtomValue } from "jotai";
import * as R from "remeda";

import { isBefore } from "@repo/temporal";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { SelectedEvents, selectedEventsAtom } from "@/atoms/selected-events";
import type { CalendarEvent, DraftEvent } from "@/lib/interfaces";
import { isUserOnlyAttendee } from "@/lib/utils/events";
import { EventCollectionItem, convertEventToItem } from "./event-collection";
import { insertIntoSorted, useEvents } from "./use-events";

export type Action =
  | { type: "draft"; event: DraftEvent }
  | { type: "update"; event: CalendarEvent; force?: { sendUpdate?: boolean, recurrenceScope?: "instance" | "series" } }
  | { type: "select"; event: CalendarEvent }
  | { type: "unselect"; eventId?: string }
  | { type: "delete"; eventId: string; force?: { sendUpdate?: boolean, recurrenceScope?: "instance" | "series" } }
  | {
      type: "move";
      eventId: string;
      source: { accountId: string; calendarId: string };
      destination: { accountId: string; calendarId: string };
      force?: { sendUpdate?: boolean, recurrenceScope?: "instance" | "series" };
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
};

type RecurringEditScopeDialogState = {
  open: boolean;
  event: CalendarEvent | null;
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
    });

  const [recurringScopeDialog, setRecurringScopeDialog] =
    React.useState<RecurringEditScopeDialogState>({
      open: false,
      event: null,
      onInstance: () => {},
      onSeries: () => {},
      onCancel: () => {},
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
          const isCalendarChanged =
            !!exists &&
            (event.accountId !== exists.event.accountId ||
              event.calendarId !== exists.event.calendarId);

          if (force?.sendUpdate !== undefined || !event.attendees || isUserOnlyAttendee(event.attendees)) {
            updateMutation.mutate({
              data: {
                ...event,
                ...(isCalendarChanged && {
                  accountId: exists.event.accountId,
                  calendarId: exists.event.calendarId,
                }),
                ...(force?.sendUpdate !== undefined && {
                  response: {
                    status: event.response?.status ?? "unknown",
                    sendUpdate: force.sendUpdate,
                  },
                }),
              },
              ...(isCalendarChanged && {
                move: {
                  source: {
                    accountId: exists.event.accountId,
                    calendarId: exists.event.calendarId,
                  },
                  destination: {
                    accountId: event.accountId,
                    calendarId: event.calendarId,
                  },
                },
              }),
            });
            return;
          }

          // attendee confirmation still required
          const previousEvents = queryClient.getQueryData(eventsQueryKey);
          setConfirmationDialog({
            open: true,
            type: "update",
            event,
            onConfirm: (sendUpdate: boolean) => {
              const isCalendarChangedConfirm =
                !!exists &&
                (event.accountId !== exists.event.accountId ||
                  event.calendarId !== exists.event.calendarId);

              updateMutation.mutate({
                data: {
                  ...event,
                  ...(isCalendarChangedConfirm && {
                    accountId: exists.event.accountId,
                    calendarId: exists.event.calendarId,
                  }),
                  response: {
                    status: event.response?.status ?? "unknown",
                    sendUpdate,
                  },
                },
                ...(isCalendarChangedConfirm && {
                  move: {
                    source: {
                      accountId: exists.event.accountId,
                      calendarId: exists.event.calendarId,
                    },
                    destination: {
                      accountId: event.accountId,
                      calendarId: event.calendarId,
                    },
                  },
                }),
              });

              setConfirmationDialog((prev) => ({ ...prev, open: false }));
            },
            onCancel: () => {
              queryClient.setQueryData(eventsQueryKey, previousEvents);
              setConfirmationDialog((prev) => ({ ...prev, open: false }));
            },
          });
          return;
        }

        if (force?.recurrenceScope === "series") {
          const master = masterRecurringEvents[event.recurringEventId!];
          const previousEvents = queryClient.getQueryData(eventsQueryKey);
          if (!master) {
            // fallback to instance behavior
            const isCalendarChanged =
              !!exists &&
              (event.accountId !== exists.event.accountId ||
                event.calendarId !== exists.event.calendarId);
            updateMutation.mutate({
              data: {
                ...event,
                ...(isCalendarChanged && {
                  accountId: exists.event.accountId,
                  calendarId: exists.event.calendarId,
                }),
                ...(force?.sendUpdate !== undefined && {
                  response: {
                    status: event.response?.status ?? "unknown",
                    sendUpdate: force.sendUpdate,
                  },
                }),
              },
              ...(isCalendarChanged && {
                move: {
                  source: {
                    accountId: exists.event.accountId,
                    calendarId: exists.event.calendarId,
                  },
                  destination: {
                    accountId: event.accountId,
                    calendarId: event.calendarId,
                  },
                },
              }),
            });
            return;
          }

          const seriesUpdate = {
            ...event,
            id: master.id,
            recurringEventId: undefined,
            accountId: event.accountId,
            calendarId: event.calendarId,
          } as CalendarEvent;

          const isSeriesCalendarChanged =
            master.accountId !== seriesUpdate.accountId ||
            master.calendarId !== seriesUpdate.calendarId;

          if (force?.sendUpdate !== undefined || !seriesUpdate.attendees || isUserOnlyAttendee(seriesUpdate.attendees)) {
            updateMutation.mutate({
              data: {
                ...seriesUpdate,
                ...(force?.sendUpdate !== undefined && {
                  response: {
                    status: seriesUpdate.response?.status ?? "unknown",
                    sendUpdate: force.sendUpdate,
                  },
                }),
              },
              ...(isSeriesCalendarChanged && {
                move: {
                  source: {
                    accountId: master.accountId,
                    calendarId: master.calendarId,
                  },
                  destination: {
                    accountId: seriesUpdate.accountId,
                    calendarId: seriesUpdate.calendarId,
                  },
                },
              }),
            });
            return;
          }

          // attendee confirmation for series
          setConfirmationDialog({
            open: true,
            type: "update",
            event: seriesUpdate,
            onConfirm: (sendUpdate: boolean) => {
              const moveForSeries = isSeriesCalendarChanged
                ? {
                    source: {
                      accountId: master.accountId,
                      calendarId: master.calendarId,
                    },
                    destination: {
                      accountId: seriesUpdate.accountId,
                      calendarId: seriesUpdate.calendarId,
                    },
                  }
                : undefined;

              updateMutation.mutate({
                data: {
                  ...seriesUpdate,
                  response: {
                    status: seriesUpdate.response?.status ?? "unknown",
                    sendUpdate,
                  },
                },
                ...(moveForSeries && { move: moveForSeries }),
              });

              setConfirmationDialog((prev) => ({ ...prev, open: false }));
            },
            onCancel: () => {
              queryClient.setQueryData(eventsQueryKey, previousEvents);
              setConfirmationDialog((prev) => ({ ...prev, open: false }));
            },
          });
          return;
        }

        const previousEvents = queryClient.getQueryData(eventsQueryKey);

        setRecurringScopeDialog({
          open: true,
          event,
          onInstance: () => {
            // Proceed with instance update below (same logic as non-recurring branch)
            const isCalendarChanged =
              !!exists &&
              (event.accountId !== exists.event.accountId ||
                event.calendarId !== exists.event.calendarId);

            if (force || !event.attendees || isUserOnlyAttendee(event.attendees)) {
              updateMutation.mutate({
                data: {
                  ...event,
                  ...(isCalendarChanged && {
                    accountId: exists.event.accountId,
                    calendarId: exists.event.calendarId,
                  }),
                  ...(force && {
                    response: {
                      status: event.response?.status ?? "unknown",
                      sendUpdate: force.sendUpdate,
                    },
                  }),
                },
                ...(isCalendarChanged && {
                  move: {
                    source: {
                      accountId: exists.event.accountId,
                      calendarId: exists.event.calendarId,
                    },
                    destination: {
                      accountId: event.accountId,
                      calendarId: event.calendarId,
                    },
                  },
                }),
              });
              setRecurringScopeDialog((prev) => ({ ...prev, open: false }));
              return;
            }

            // Ask attendee confirmation
            setConfirmationDialog({
              open: true,
              type: "update",
              event,
              onConfirm: (sendUpdate: boolean) => {
                const isCalendarChangedConfirm =
                  !!exists &&
                  (event.accountId !== exists.event.accountId ||
                    event.calendarId !== exists.event.calendarId);

                updateMutation.mutate({
                  data: {
                    ...event,
                    ...(isCalendarChangedConfirm && {
                      accountId: exists.event.accountId,
                      calendarId: exists.event.calendarId,
                    }),
                    response: {
                      status: event.response?.status ?? "unknown",
                      sendUpdate,
                    },
                  },
                  ...(isCalendarChangedConfirm && {
                    move: {
                      source: {
                        accountId: exists.event.accountId,
                        calendarId: exists.event.calendarId,
                      },
                      destination: {
                        accountId: event.accountId,
                        calendarId: event.calendarId,
                      },
                    },
                  }),
                });

                setConfirmationDialog((prev) => ({ ...prev, open: false }));
                setRecurringScopeDialog((prev) => ({ ...prev, open: false }));
              },
              onCancel: () => {
                queryClient.setQueryData(eventsQueryKey, previousEvents);
                setConfirmationDialog((prev) => ({ ...prev, open: false }));
                setRecurringScopeDialog((prev) => ({ ...prev, open: false }));
              },
            });
          },
          onSeries: () => {
            const master = masterRecurringEvents[event.recurringEventId!];
            if (!master) {
              // Fallback to instance behavior if master not found
              setRecurringScopeDialog((prev) => ({ ...prev, open: false }));
              const isCalendarChanged =
                !!exists &&
                (event.accountId !== exists.event.accountId ||
                  event.calendarId !== exists.event.calendarId);
              updateMutation.mutate({
                data: {
                  ...event,
                  ...(isCalendarChanged && {
                    accountId: exists.event.accountId,
                    calendarId: exists.event.calendarId,
                  }),
                },
                ...(isCalendarChanged && {
                  move: {
                    source: {
                      accountId: exists.event.accountId,
                      calendarId: exists.event.calendarId,
                    },
                    destination: {
                      accountId: event.accountId,
                      calendarId: event.calendarId,
                    },
                  },
                }),
              });
              return;
            }

            const seriesUpdate = {
              ...event,
              id: master.id,
              recurringEventId: undefined,
              accountId: event.accountId,
              calendarId: event.calendarId,
            } as CalendarEvent;

            const isSeriesCalendarChanged =
              master.accountId !== seriesUpdate.accountId ||
              master.calendarId !== seriesUpdate.calendarId;

            if (
              force ||
              !seriesUpdate.attendees ||
              isUserOnlyAttendee(seriesUpdate.attendees)
            ) {
              updateMutation.mutate({
                data: {
                  ...seriesUpdate,
                  ...(force && {
                    response: {
                      status: seriesUpdate.response?.status ?? "unknown",
                      sendUpdate: force.sendUpdate,
                    },
                  }),
                },
                ...(isSeriesCalendarChanged && {
                  move: {
                    source: {
                      accountId: master.accountId,
                      calendarId: master.calendarId,
                    },
                    destination: {
                      accountId: seriesUpdate.accountId,
                      calendarId: seriesUpdate.calendarId,
                    },
                  },
                }),
              });
              setRecurringScopeDialog((prev) => ({ ...prev, open: false }));
              return;
            }

            // Ask attendee confirmation for series update
            setConfirmationDialog({
              open: true,
              type: "update",
              event: seriesUpdate,
              onConfirm: (sendUpdate: boolean) => {
                const moveForSeries = isSeriesCalendarChanged
                  ? {
                      source: {
                        accountId: master.accountId,
                        calendarId: master.calendarId,
                      },
                      destination: {
                        accountId: seriesUpdate.accountId,
                        calendarId: seriesUpdate.calendarId,
                      },
                    }
                  : undefined;

                updateMutation.mutate({
                  data: {
                    ...seriesUpdate,
                    response: {
                      status: seriesUpdate.response?.status ?? "unknown",
                      sendUpdate,
                    },
                  },
                  ...(moveForSeries && { move: moveForSeries }),
                });

                setConfirmationDialog((prev) => ({ ...prev, open: false }));
                setRecurringScopeDialog((prev) => ({ ...prev, open: false }));
              },
              onCancel: () => {
                queryClient.setQueryData(eventsQueryKey, previousEvents);
                setConfirmationDialog((prev) => ({ ...prev, open: false }));
                setRecurringScopeDialog((prev) => ({ ...prev, open: false }));
              },
            });
          },
          onCancel: () => {
            queryClient.setQueryData(eventsQueryKey, previousEvents);
            setRecurringScopeDialog((prev) => ({ ...prev, open: false }));
          },
        });

        return;
      }

      if (force?.sendUpdate !== undefined || !event.attendees || isUserOnlyAttendee(event.attendees)) {
        const isCalendarChanged =
          !!exists &&
          (event.accountId !== exists.event.accountId ||
            event.calendarId !== exists.event.calendarId);

        updateMutation.mutate({
          data: {
            ...event,
            ...(isCalendarChanged && {
              accountId: exists.event.accountId,
              calendarId: exists.event.calendarId,
            }),
            ...(force?.sendUpdate !== undefined && {
              response: {
                status: event.response?.status ?? "unknown",
                sendUpdate: force.sendUpdate,
              },
            }),
          },
          ...(isCalendarChanged && {
            move: {
              source: {
                accountId: exists.event.accountId,
                calendarId: exists.event.calendarId,
              },
              destination: {
                accountId: event.accountId,
                calendarId: event.calendarId,
              },
            },
          }),
        });
        return;
      }

      const previousEvents = queryClient.getQueryData(eventsQueryKey);

      queryClient.setQueryData(eventsQueryKey, (prev) => {
        if (!prev) {
          return prev;
        }

        const withoutEvent = prev.events.filter((e) => e.id !== event.id);

        const events = insertIntoSorted(withoutEvent, event, (a) =>
          isBefore(a.start, event.start, { timeZone: defaultTimeZone }),
        );

        return {
          ...prev,
          events,
        };
      });

      setConfirmationDialog({
        open: true,
        type: "update",
        event,
        onConfirm: (sendUpdate: boolean) => {
          const isCalendarChanged =
            !!exists &&
            (event.accountId !== exists.event.accountId ||
              event.calendarId !== exists.event.calendarId);

          updateMutation.mutate({
            data: {
              ...event,
              ...(isCalendarChanged && {
                accountId: exists.event.accountId,
                calendarId: exists.event.calendarId,
              }),
              response: {
                status: event.response?.status ?? "unknown",
                sendUpdate,
              },
            },
            ...(isCalendarChanged && {
              move: {
                source: {
                  accountId: exists.event.accountId,
                  calendarId: exists.event.calendarId,
                },
                destination: {
                  accountId: event.accountId,
                  calendarId: event.calendarId,
                },
              },
            }),
          });

          setConfirmationDialog((prev) => ({ ...prev, open: false }));
        },
        onCancel: () => {
          queryClient.setQueryData(eventsQueryKey, previousEvents);
          setConfirmationDialog((prev) => ({ ...prev, open: false }));
        },
      });
    },
    [
      optimisticEvents,
      queryClient,
      eventsQueryKey,
      applyOptimistic,
      createMutation,
      updateMutation,
      defaultTimeZone,
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
          const isCalendarChanged =
            !!exists &&
            (event.accountId !== exists.event.accountId ||
              event.calendarId !== exists.event.calendarId);

          if (force?.sendUpdate !== undefined || !event.attendees || isUserOnlyAttendee(event.attendees)) {
            await updateMutation.mutateAsync({
              data: {
                ...event,
                ...(force?.sendUpdate !== undefined && {
                  response: {
                    status: event.response?.status ?? "unknown",
                    sendUpdate: force.sendUpdate,
                  },
                }),
              },
              ...(isCalendarChanged && {
                move: {
                  source: {
                    accountId: exists.event.accountId,
                    calendarId: exists.event.calendarId,
                  },
                  destination: {
                    accountId: event.accountId,
                    calendarId: event.calendarId,
                  },
                },
              }),
            });
            return;
          }

          // attendee confirmation still required
          const previousEvents = queryClient.getQueryData(eventsQueryKey);
          await new Promise<void>((resolve) => {
            setConfirmationDialog({
              open: true,
              type: "update",
              event,
              onConfirm: async (sendUpdate: boolean) => {
                const isCalendarChangedConfirm =
                  !!exists &&
                  (event.accountId !== exists.event.accountId ||
                    event.calendarId !== exists.event.calendarId);

                await updateMutation.mutateAsync({
                  data: {
                    ...event,
                    response: {
                      status: event.response?.status ?? "unknown",
                      sendUpdate,
                    },
                  },
                  ...(isCalendarChangedConfirm && {
                    move: {
                      source: {
                        accountId: exists.event.accountId,
                        calendarId: exists.event.calendarId,
                      },
                      destination: {
                        accountId: event.accountId,
                        calendarId: event.calendarId,
                      },
                    },
                  }),
                });
                setConfirmationDialog((prev) => ({ ...prev, open: false }));
                resolve();
              },
              onCancel: () => {
                queryClient.setQueryData(eventsQueryKey, previousEvents);
                setConfirmationDialog((prev) => ({ ...prev, open: false }));
                resolve();
              },
            });
          });
          return;
        }

        if (force?.recurrenceScope === "series") {
          const master = masterRecurringEvents[event.recurringEventId!];
          const previousEvents = queryClient.getQueryData(eventsQueryKey);
          if (!master) {
            await updateMutation.mutateAsync({
              data: { ...event },
            });
            return;
          }

          const seriesUpdate = {
            ...event,
            id: master.id,
            recurringEventId: undefined,
            accountId: event.accountId,
            calendarId: event.calendarId,
          } as CalendarEvent;

          const isSeriesCalendarChanged =
            master.accountId !== seriesUpdate.accountId ||
            master.calendarId !== seriesUpdate.calendarId;

          if (force?.sendUpdate !== undefined || !seriesUpdate.attendees || isUserOnlyAttendee(seriesUpdate.attendees)) {
            await updateMutation.mutateAsync({
              data: {
                ...seriesUpdate,
                ...(force?.sendUpdate !== undefined && {
                  response: {
                    status: seriesUpdate.response?.status ?? "unknown",
                    sendUpdate: force.sendUpdate,
                  },
                }),
              },
              ...(isSeriesCalendarChanged && {
                move: {
                  source: {
                    accountId: master.accountId,
                    calendarId: master.calendarId,
                  },
                  destination: {
                    accountId: seriesUpdate.accountId,
                    calendarId: seriesUpdate.calendarId,
                  },
                },
              }),
            });
            return;
          }

          await new Promise<void>((resolve) => {
            setConfirmationDialog({
              open: true,
              type: "update",
              event: seriesUpdate,
              onConfirm: async (sendUpdate: boolean) => {
                const moveForSeries = isSeriesCalendarChanged
                  ? {
                      source: {
                        accountId: master.accountId,
                        calendarId: master.calendarId,
                      },
                      destination: {
                        accountId: seriesUpdate.accountId,
                        calendarId: seriesUpdate.calendarId,
                      },
                    }
                  : undefined;

                await updateMutation.mutateAsync({
                  data: {
                    ...seriesUpdate,
                    response: {
                      status: seriesUpdate.response?.status ?? "unknown",
                      sendUpdate,
                    },
                  },
                  ...(moveForSeries && { move: moveForSeries }),
                });
                setConfirmationDialog((prev) => ({ ...prev, open: false }));
                resolve();
              },
              onCancel: () => {
                queryClient.setQueryData(eventsQueryKey, previousEvents);
                setConfirmationDialog((prev) => ({ ...prev, open: false }));
                resolve();
              },
            });
          });
          return;
        }

        const previousEvents = queryClient.getQueryData(eventsQueryKey);

        await new Promise<void>((resolve) => {
          setRecurringScopeDialog({
            open: true,
            event,
            onInstance: async () => {
              const isCalendarChanged =
                !!exists &&
                (event.accountId !== exists.event.accountId ||
                  event.calendarId !== exists.event.calendarId);

              if (force || !event.attendees || isUserOnlyAttendee(event.attendees)) {
                await updateMutation.mutateAsync({
                  data: {
                    ...event,
                    ...(force && {
                      response: {
                        status: event.response?.status ?? "unknown",
                        sendUpdate: force.sendUpdate,
                      },
                    }),
                  },
                  ...(isCalendarChanged && {
                    move: {
                      source: {
                        accountId: exists.event.accountId,
                        calendarId: exists.event.calendarId,
                      },
                      destination: {
                        accountId: event.accountId,
                        calendarId: event.calendarId,
                      },
                    },
                  }),
                });
                setRecurringScopeDialog((prev) => ({ ...prev, open: false }));
                resolve();
                return;
              }

              setConfirmationDialog({
                open: true,
                type: "update",
                event,
                onConfirm: async (sendUpdate: boolean) => {
                  const isCalendarChangedConfirm =
                    !!exists &&
                    (event.accountId !== exists.event.accountId ||
                      event.calendarId !== exists.event.calendarId);

                  await updateMutation.mutateAsync({
                    data: {
                      ...event,
                      response: {
                        status: event.response?.status ?? "unknown",
                        sendUpdate,
                      },
                    },
                    ...(isCalendarChangedConfirm && {
                      move: {
                        source: {
                          accountId: exists.event.accountId,
                          calendarId: exists.event.calendarId,
                        },
                        destination: {
                          accountId: event.accountId,
                          calendarId: event.calendarId,
                        },
                      },
                    }),
                  });
                  setConfirmationDialog((prev) => ({ ...prev, open: false }));
                  setRecurringScopeDialog((prev) => ({ ...prev, open: false }));
                  resolve();
                },
                onCancel: () => {
                  queryClient.setQueryData(eventsQueryKey, previousEvents);
                  setConfirmationDialog((prev) => ({ ...prev, open: false }));
                  setRecurringScopeDialog((prev) => ({ ...prev, open: false }));
                  resolve();
                },
              });
            },
            onSeries: async () => {
              const master = masterRecurringEvents[event.recurringEventId!];
              if (!master) {
                setRecurringScopeDialog((prev) => ({ ...prev, open: false }));
                await updateMutation.mutateAsync({
                  data: { ...event },
                });
                resolve();
                return;
              }

              const seriesUpdate = {
                ...event,
                id: master.id,
                recurringEventId: undefined,
                accountId: event.accountId,
                calendarId: event.calendarId,
              } as CalendarEvent;

              const isSeriesCalendarChanged =
                master.accountId !== seriesUpdate.accountId ||
                master.calendarId !== seriesUpdate.calendarId;

              if (
                force ||
                !seriesUpdate.attendees ||
                isUserOnlyAttendee(seriesUpdate.attendees)
              ) {
                await updateMutation.mutateAsync({
                  data: {
                    ...seriesUpdate,
                    ...(force && {
                      response: {
                        status: seriesUpdate.response?.status ?? "unknown",
                        sendUpdate: force.sendUpdate,
                      },
                    }),
                  },
                  ...(isSeriesCalendarChanged && {
                    move: {
                      source: {
                        accountId: master.accountId,
                        calendarId: master.calendarId,
                      },
                      destination: {
                        accountId: seriesUpdate.accountId,
                        calendarId: seriesUpdate.calendarId,
                      },
                    },
                  }),
                });
                setRecurringScopeDialog((prev) => ({ ...prev, open: false }));
                resolve();
                return;
              }

              setConfirmationDialog({
                open: true,
                type: "update",
                event: seriesUpdate,
                onConfirm: async (sendUpdate: boolean) => {
                  const moveForSeries = isSeriesCalendarChanged
                    ? {
                        source: {
                          accountId: master.accountId,
                          calendarId: master.calendarId,
                        },
                        destination: {
                          accountId: seriesUpdate.accountId,
                          calendarId: seriesUpdate.calendarId,
                        },
                      }
                    : undefined;

                  await updateMutation.mutateAsync({
                    data: {
                      ...seriesUpdate,
                      response: {
                        status: seriesUpdate.response?.status ?? "unknown",
                        sendUpdate,
                      },
                    },
                    ...(moveForSeries && { move: moveForSeries }),
                  });
                  setConfirmationDialog((prev) => ({ ...prev, open: false }));
                  setRecurringScopeDialog((prev) => ({ ...prev, open: false }));
                  resolve();
                },
                onCancel: () => {
                  queryClient.setQueryData(eventsQueryKey, previousEvents);
                  setConfirmationDialog((prev) => ({ ...prev, open: false }));
                  setRecurringScopeDialog((prev) => ({ ...prev, open: false }));
                  resolve();
                },
              });
            },
            onCancel: () => {
              queryClient.setQueryData(eventsQueryKey, previousEvents);
              setRecurringScopeDialog((prev) => ({ ...prev, open: false }));
              resolve();
            },
          });
        });

        return;
      }

      if (force || !event.attendees || isUserOnlyAttendee(event.attendees)) {
        const isCalendarChanged =
          !!exists &&
          (event.accountId !== exists.event.accountId ||
            event.calendarId !== exists.event.calendarId);

        await updateMutation.mutateAsync({
          data: {
            ...event,
            ...(force && {
              response: {
                status: event.response?.status ?? "unknown",
                sendUpdate: force.sendUpdate,
              },
            }),
          },
          ...(isCalendarChanged && {
            move: {
              source: {
                accountId: exists.event.accountId,
                calendarId: exists.event.calendarId,
              },
              destination: {
                accountId: event.accountId,
                calendarId: event.calendarId,
              },
            },
          }),
        });
        return;
      }

      const isCalendarChanged =
        !!exists &&
        (event.accountId !== exists.event.accountId ||
          event.calendarId !== exists.event.calendarId);

      setConfirmationDialog({
        open: true,
        type: "update",
        event,
        onConfirm: async (sendUpdate: boolean) => {
          await updateMutation.mutateAsync({
            data: {
              ...event,
              response: {
                status: event.response?.status ?? "unknown",
                sendUpdate,
              },
            },
            ...(isCalendarChanged && {
              move: {
                source: {
                  accountId: exists.event.accountId,
                  calendarId: exists.event.calendarId,
                },
                destination: {
                  accountId: event.accountId,
                  calendarId: event.calendarId,
                },
              },
            }),
          });

          setConfirmationDialog((prev) => ({ ...prev, open: false }));
        },
        onCancel: () => {
          setConfirmationDialog((prev) => ({ ...prev, open: false }));
        },
      });
    },
    [
      applyOptimistic,
      createMutation,
      optimisticEvents,
      updateMutation,
      masterRecurringEvents,
      queryClient,
      eventsQueryKey,
    ],
  );

  const handleEventDelete = React.useCallback(
    (eventId: string, force?: { sendUpdate?: boolean, recurrenceScope?: "instance" | "series" }) => {
      const deletedEventItem = optimisticEvents.find(
        (item) => item.event.id === eventId,
      );

      if (!deletedEventItem) {
        console.error(`Event with id ${eventId} not found`);
        return;
      }

      startTransition(() => applyOptimistic({ type: "delete", eventId }));

      const deletedEvent = deletedEventItem.event;

      if (
        force ||
        !deletedEvent.attendees ||
        isUserOnlyAttendee(deletedEvent.attendees)
      ) {
        setSelectedEvents((prev) => prev.filter((e) => e.id !== eventId));

        deleteMutation.mutate({
          accountId: deletedEvent.accountId,
          calendarId: deletedEvent.calendarId,
          eventId,
          sendUpdate: force?.sendUpdate,
        });

        return;
      }

      setConfirmationDialog({
        open: true,
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

          setConfirmationDialog((prev) => ({ ...prev, open: false }));
        },
        onCancel: () => {
          // Revert the optimistic delete
          applyOptimistic({ type: "update", event: deletedEvent });
          setConfirmationDialog((prev) => ({ ...prev, open: false }));
        },
      });
    },
    [
      applyOptimistic,
      optimisticEvents,
      deleteMutation,
      startTransition,
      setSelectedEvents,
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

        const shouldPrompt =
          !action.force?.sendUpdate &&
          !!optimistic.event.attendees &&
          !isUserOnlyAttendee(optimistic.event.attendees);

        if (!shouldPrompt) {
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

        setConfirmationDialog({
          open: true,
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

            setConfirmationDialog((prev) => ({ ...prev, open: false }));
          },
          onCancel: () => {
            // Revert the optimistic move
            applyOptimistic({ type: "update", event: optimistic.event });
            setConfirmationDialog((prev) => ({ ...prev, open: false }));
          },
        });
      }
    },
    [
      handleEventSave,
      handleEventDelete,
      setSelectedEvents,
      optimisticEvents,
      applyOptimistic,
      moveMutation,
      startTransition,
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
