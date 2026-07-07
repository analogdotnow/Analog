import { Temporal } from "temporal-polyfill";

import { CommandGroup, CommandItem } from "@/components/ui/command";
import {
  useCommandMenuPage,
  useNavigateTo,
  useSetCommandMenuOpen,
} from "@/store/hooks";

export function CalendarNavigationCommands() {
  const navigateTo = useNavigateTo();
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
          navigateTo(Temporal.Now.plainDateISO());
          setOpen(false);
        }}
      >
        Today
      </CommandItem>
    </CommandGroup>
  );
}
