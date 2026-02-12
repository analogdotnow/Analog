import { CommandGroup, CommandItem } from "@/components/ui/command";
import {
  useCommandMenuPage,
  useSetCommandMenuOpen,
  useSetViewPreferences,
  useViewPreferences,
} from "@/store/hooks";

export function PreferencesCommands() {
  const preferences = useViewPreferences();
  const setViewPreferences = useSetViewPreferences();
  const page = useCommandMenuPage();
  const setOpen = useSetCommandMenuOpen();

  if (page) {
    return null;
  }

  return (
    <CommandGroup heading="Preferences">
      <CommandItem
        onSelect={() => {
          setViewPreferences({ showWeekends: !preferences.showWeekends });
          setOpen(false);
        }}
      >
        {preferences.showWeekends ? "Hide weekends" : "Show weekends"}
      </CommandItem>
      <CommandItem
        onSelect={() => {
          setViewPreferences({ showWeekNumbers: !preferences.showWeekNumbers });
          setOpen(false);
        }}
      >
        {preferences.showWeekNumbers
          ? "Hide week numbers"
          : "Show week numbers"}
      </CommandItem>
      <CommandItem
        onSelect={() => {
          setViewPreferences({
            showDeclinedEvents: !preferences.showDeclinedEvents,
          });
          setOpen(false);
        }}
      >
        {preferences.showDeclinedEvents
          ? "Hide declined events"
          : "Show declined events"}
      </CommandItem>
    </CommandGroup>
  );
}
