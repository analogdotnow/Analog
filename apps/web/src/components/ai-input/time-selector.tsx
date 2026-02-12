import * as React from "react";

import { cn } from "@/lib/utils";

interface SuggestionItem {
  type: "time" | "duration";
  label: string;
  value: string;
  id: string;
}

export interface TimeSelectorProps {
  items: SuggestionItem[];
  command: (item: SuggestionItem) => void;
  ref: React.RefObject<unknown | null>;
}

export function TimeSelector({ items, command, ref }: TimeSelectorProps) {
  const [selectedValue, setSelectedValue] = React.useState<string | null>(null);

  const selectItemByValue = React.useCallback(
    (value: string) => {
      const item = items.find((it) => it.value === value);

      if (!item) {
        return;
      }

      command({
        ...item,
        id: "mention-" + item.type,
      });
    },
    [items, command],
  );

  const upHandler = React.useCallback(() => {
    if (items.length === 0) return;
    const currentIndex = Math.max(
      0,
      items.findIndex((i) => i.value === selectedValue),
    );
    const nextIndex = (currentIndex + items.length - 1) % items.length;
    setSelectedValue(items[nextIndex]?.value ?? null);
  }, [selectedValue, items]);

  const downHandler = React.useCallback(() => {
    if (items.length === 0) return;
    const currentIndex = Math.max(
      0,
      items.findIndex((i) => i.value === selectedValue),
    );
    const nextIndex = (currentIndex + 1) % items.length;
    setSelectedValue(items[nextIndex]?.value ?? null);
  }, [selectedValue, items]);

  const enterHandler = React.useCallback(() => {
    const valueToSelect = selectedValue ?? items[0]?.value;
    if (valueToSelect) {
      selectItemByValue(valueToSelect);
    }
  }, [selectedValue, items, selectItemByValue]);

  React.useEffect(() => {
    setSelectedValue(items[0]?.value ?? null);
  }, [items]);

  React.useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === "ArrowUp") {
        upHandler();
        return true;
      }

      if (event.key === "ArrowDown") {
        downHandler();
        return true;
      }

      if (event.key === "Enter") {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  const groupedItems = items.reduce(
    (acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = [];
      }
      acc[item.type]?.push(item);
      return acc;
    },
    {} as Record<string, SuggestionItem[]>,
  );

  return (
    <div
      className={cn(
        "z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
      )}
    >
      <div className="flex flex-col gap-2">
        {Object.entries(groupedItems).map(([type, groupItems]) => (
          <div key={type}>
            <p className="px-1 pb-1 text-sm font-medium text-muted-foreground capitalize">
              {type}
            </p>
            <div className="flex flex-col items-start gap-1">
              {groupItems.map((item) => (
                <button
                  key={item.value}
                  onClick={() => selectItemByValue(item.value)}
                  data-state={
                    item.value === selectedValue ? "selected" : "unselected"
                  }
                  className="w-full rounded-sm px-2 text-left text-sm hover:bg-accent-light data-[state=selected]:bg-accent-light"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {items.length === 0 && (
        <div className="px-1 text-sm font-medium text-muted-foreground">
          No results
        </div>
      )}
    </div>
  );
}
