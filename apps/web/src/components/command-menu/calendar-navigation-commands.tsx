import { useAtomValue, useSetAtom } from "jotai";
import { Temporal } from "temporal-polyfill";

import { commandMenuOpenAtom, commandMenuPageAtom } from "@/atoms/command-menu";
import { currentDateAtom } from "@/atoms/view-preferences";
import { CommandGroup, CommandItem } from "@/components/ui/command";

export function CalendarNavigationCommands() {
  const setCurrentDate = useSetAtom(currentDateAtom);
  const page = useAtomValue(commandMenuPageAtom);
  const setOpen = useSetAtom(commandMenuOpenAtom);

  if (page) {
    return null;
  }

  return (
    <CommandGroup heading="Calendar">
      <CommandItem
        value="today"
        onSelect={() => {
          setCurrentDate(Temporal.Now.plainDateISO());
          setOpen(false);
        }}
      >
        Today
      </CommandItem>
    </CommandGroup>
  );
}
