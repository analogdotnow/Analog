import { useCommandState } from "cmdk";
import { useAtomValue, useSetAtom } from "jotai";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import {
  commandMenuOpenAtom,
  commandMenuPageAtom,
  commandMenuPagesAtom,
} from "@/atoms/command-menu";
import { CommandGroup, CommandItem } from "@/components/ui/command";

export function StartOfWeekCommands() {
  const search = useCommandState((state) => state.search);
  const page = useAtomValue(commandMenuPageAtom);
  const setPages = useSetAtom(commandMenuPagesAtom);

  if (page && page !== "start-of-week") {
    return null;
  }

  if (page === "start-of-week") {
    return (
      <CommandGroup heading="Calendar">
        <StartOfWeekCommandsContent />
      </CommandGroup>
    );
  }

  return (
    <CommandGroup heading="Calendar">
      <CommandItem
        onSelect={() => setPages((pages) => [...pages, "start-of-week"])}
      >
        Change start of week
      </CommandItem>
      {search?.trim() ? (
        <StartOfWeekCommandsContent prefixWith="Change start of week" />
      ) : null}
    </CommandGroup>
  );
}

interface StartOfWeekCommandsContentProps {
  prefixWith?: string;
}

function StartOfWeekCommandsContent({
  prefixWith,
}: StartOfWeekCommandsContentProps) {
  const setCalendarSettings = useSetAtom(calendarSettingsAtom);
  const setOpen = useSetAtom(commandMenuOpenAtom);

  const prefix = prefixWith ? `${prefixWith} > ` : "";

  return (
    <>
      <CommandItem
        value="start-of-week-monday"
        keywords={["Monday"]}
        onSelect={() => {
          setCalendarSettings((p) => ({ ...p, weekStartsOn: 1 }));
          setOpen(false);
        }}
      >
        {prefix} Monday
      </CommandItem>
      <CommandItem
        value="start-of-week-tuesday"
        keywords={["Tuesday"]}
        onSelect={() => {
          setCalendarSettings((p) => ({ ...p, weekStartsOn: 2 }));
          setOpen(false);
        }}
      >
        {prefix} Tuesday
      </CommandItem>
      <CommandItem
        value="start-of-week-wednesday"
        keywords={["Wednesday"]}
        onSelect={() => {
          setCalendarSettings((p) => ({ ...p, weekStartsOn: 3 }));
          setOpen(false);
        }}
      >
        {prefix} Wednesday
      </CommandItem>
      <CommandItem
        value="start-of-week-thursday"
        keywords={["Thursday"]}
        onSelect={() => {
          setCalendarSettings((p) => ({ ...p, weekStartsOn: 4 }));
          setOpen(false);
        }}
      >
        {prefix} Thursday
      </CommandItem>
      <CommandItem
        value="start-of-week-friday"
        keywords={["Friday"]}
        onSelect={() => {
          setCalendarSettings((p) => ({ ...p, weekStartsOn: 5 }));
          setOpen(false);
        }}
      >
        {prefix} Friday
      </CommandItem>
      <CommandItem
        value="start-of-week-saturday"
        keywords={["Saturday"]}
        onSelect={() => {
          setCalendarSettings((p) => ({ ...p, weekStartsOn: 6 }));
          setOpen(false);
        }}
      >
        {prefix} Saturday
      </CommandItem>
      <CommandItem
        value="start-of-week-sunday"
        keywords={["Sunday"]}
        onSelect={() => {
          setCalendarSettings((p) => ({ ...p, weekStartsOn: 7 }));
          setOpen(false);
        }}
      >
        {prefix} Sunday
      </CommandItem>
    </>
  );
}
