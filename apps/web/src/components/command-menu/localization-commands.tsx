import { useCommandState } from "cmdk";

import { CommandGroup, CommandItem } from "@/components/ui/command";
import {
  useCommandMenuPage,
  usePushCommandMenuPage,
  useSetCalendarSettings,
  useSetCommandMenuOpen,
} from "@/store/hooks";

export function LocalizationCommands() {
  const search = useCommandState((state) => state.search);
  const page = useCommandMenuPage();
  const pushCommandMenuPage = usePushCommandMenuPage();

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
      <CommandItem onSelect={() => pushCommandMenuPage("time-format")}>
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
  const setCalendarSettings = useSetCalendarSettings();
  const setOpen = useSetCommandMenuOpen();
  const prefix = prefixWith ? `${prefixWith} > ` : "";

  return (
    <>
      <CommandItem
        keywords={["24 hour clock", "24h clock"]}
        onSelect={() => {
          setCalendarSettings({ use12Hour: false });
          setOpen(false);
        }}
      >
        {prefix} Use 24-hour clock
      </CommandItem>
      <CommandItem
        keywords={["12 hour clock", "12h clock"]}
        onSelect={() => {
          setCalendarSettings({ use12Hour: true });
          setOpen(false);
        }}
      >
        {prefix} Use 12-hour clock
      </CommandItem>
    </>
  );
}
