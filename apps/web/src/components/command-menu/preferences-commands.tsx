import { useAtom, useAtomValue, useSetAtom } from "jotai";

import { commandMenuOpenAtom, commandMenuPageAtom } from "@/atoms/command-menu";
import { viewPreferencesAtom } from "@/atoms/view-preferences";
import { CommandGroup, CommandItem } from "@/components/ui/command";

export function PreferencesCommands() {
  const [preferences, setPreferences] = useAtom(viewPreferencesAtom);
  const page = useAtomValue(commandMenuPageAtom);
  const setOpen = useSetAtom(commandMenuOpenAtom);

  if (page) {
    return null;
  }

  return (
    <CommandGroup heading="Preferences">
      <CommandItem
        onSelect={() => {
          setPreferences((p) => ({
            ...p,
            showWeekends: !p.showWeekends,
          }));

          setOpen(false);
        }}
      >
        {preferences.showWeekends ? "Hide weekends" : "Show weekends"}
      </CommandItem>
      <CommandItem
        onSelect={() => {
          setPreferences((p) => ({
            ...p,
            showWeekNumbers: !p.showWeekNumbers,
          }));

          setOpen(false);
        }}
      >
        {preferences.showWeekNumbers
          ? "Hide week numbers"
          : "Show week numbers"}
      </CommandItem>
      <CommandItem
        onSelect={() => {
          setPreferences((p) => ({
            ...p,
            showDeclinedEvents: !p.showDeclinedEvents,
          }));

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
