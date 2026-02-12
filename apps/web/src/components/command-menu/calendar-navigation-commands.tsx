import { Temporal } from "temporal-polyfill";

import { CommandGroup, CommandItem } from "@/components/ui/command";
import {
  useCommandMenuPage,
  useSetCommandMenuOpen,
  useSetCurrentDate,
} from "@/store/hooks";

export function CalendarNavigationCommands() {
  const setCurrentDate = useSetCurrentDate();
  const page = useCommandMenuPage();
  const setOpen = useSetCommandMenuOpen();

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
