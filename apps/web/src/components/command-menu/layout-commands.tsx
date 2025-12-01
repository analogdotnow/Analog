import { useAtomValue, useSetAtom } from "jotai";

import { commandMenuOpenAtom, commandMenuPageAtom } from "@/atoms/command-menu";
import { calendarViewAtom } from "@/atoms/view-preferences";
import { CommandGroup, CommandItem } from "@/components/ui/command";

export function LayoutCommands() {
  const setView = useSetAtom(calendarViewAtom);
  const page = useAtomValue(commandMenuPageAtom);
  const setOpen = useSetAtom(commandMenuOpenAtom);

  if (page) {
    return null;
  }

  return (
    <CommandGroup heading="Layout">
      <CommandItem
        value="month"
        onSelect={() => {
          setView("month");
          setOpen(false);
        }}
      >
        Switch to month view
      </CommandItem>
      <CommandItem
        value="week"
        onSelect={() => {
          setView("week");
          setOpen(false);
        }}
      >
        Switch to week view
      </CommandItem>
      <CommandItem
        value="day"
        onSelect={() => {
          setView("day");
          setOpen(false);
        }}
      >
        Switch to day view
      </CommandItem>
      <CommandItem
        value="agenda"
        onSelect={() => {
          setView("agenda");
          setOpen(false);
        }}
      >
        Switch to agenda view
      </CommandItem>
    </CommandGroup>
  );
}
