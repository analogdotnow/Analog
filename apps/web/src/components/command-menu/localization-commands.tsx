import { useCommandState } from "cmdk";
import { useAtomValue, useSetAtom } from "jotai";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import {
  commandMenuOpenAtom,
  commandMenuPageAtom,
  commandMenuPagesAtom,
} from "@/atoms/command-menu";
import { CommandGroup, CommandItem } from "@/components/ui/command";

export function LocalizationCommands() {
  const search = useCommandState((state) => state.search);
  const page = useAtomValue(commandMenuPageAtom);
  const setPages = useSetAtom(commandMenuPagesAtom);

  if (page && page !== "time-format") {
    return null;
  }

  if (page === "time-format") {
    return (
      <CommandGroup heading="Localization">
        <LocalizationCommandsContent />
      </CommandGroup>
    );
  }

  return (
    <CommandGroup heading="Localization">
      <CommandItem
        onSelect={() => setPages((pages) => [...pages, "time-format"])}
      >
        Change time format
      </CommandItem>
      {search?.trim() ? (
        <LocalizationCommandsContent prefixWith="Change time format" />
      ) : null}
    </CommandGroup>
  );
}

interface LocalizationCommandsContentProps {
  prefixWith?: string;
}

function LocalizationCommandsContent({
  prefixWith,
}: LocalizationCommandsContentProps) {
  const setCalendarSettings = useSetAtom(calendarSettingsAtom);
  const setOpen = useSetAtom(commandMenuOpenAtom);
  const prefix = prefixWith ? `${prefixWith} > ` : "";

  return (
    <>
      <CommandItem
        keywords={["24 hour clock", "24h clock"]}
        onSelect={() => {
          setCalendarSettings((p) => ({
            ...p,
            use12Hour: false,
          }));

          setOpen(false);
        }}
      >
        {prefix} Use 24-hour clock
      </CommandItem>
      <CommandItem
        keywords={["12 hour clock", "12h clock"]}
        onSelect={() => {
          setCalendarSettings((p) => ({
            ...p,
            use12Hour: true,
          }));

          setOpen(false);
        }}
      >
        {prefix} Use 12-hour clock
      </CommandItem>
    </>
  );
}
