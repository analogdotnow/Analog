"use client";

import * as React from "react";

import { EventItem } from "@/components/calendar/event/event-item";
import type { EventCollectionItem } from "@/components/calendar/hooks/event-collection";
import { useSelectAction } from "@/components/calendar/hooks/use-optimistic-mutations";

interface AgendaViewEventProps {
  item: EventCollectionItem;
}

export function AgendaViewEvent({ item }: AgendaViewEventProps) {
  const selectAction = useSelectAction();

  const onClick = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      selectAction(item.event);
    },
    [selectAction, item.event],
  );

  return (
    <EventItem
      key={item.event.id}
      item={item}
      view="agenda"
      onClick={onClick}
    />
  );
}
