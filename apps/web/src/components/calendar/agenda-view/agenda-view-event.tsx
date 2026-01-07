"use client";

import * as React from "react";

import { DisplayItemComponent } from "@/components/calendar/display-item/display-item";
import { useSelectAction } from "@/components/calendar/hooks/use-optimistic-mutations";
import {
  DisplayItem,
  InlineDisplayItem,
  isEvent,
  isInlineItem,
} from "@/lib/display-item";

interface AgendaViewItemProps {
  item: DisplayItem;
}

export function AgendaViewItem({ item }: AgendaViewItemProps) {
  if (!isInlineItem(item)) {
    return null;
  }

  return <AgendaViewInlineItem item={item} />;
}

interface AgendaViewInlineItemProps {
  item: InlineDisplayItem;
}

function AgendaViewInlineItem({ item }: AgendaViewInlineItemProps) {
  const selectAction = useSelectAction();

  const onClick = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isEvent(item)) {
        selectAction(item.event);
      }
    },
    [selectAction, item],
  );

  return (
    <DisplayItemComponent
      key={item.id}
      item={item}
      view="agenda"
      onClick={onClick}
    />
  );
}
