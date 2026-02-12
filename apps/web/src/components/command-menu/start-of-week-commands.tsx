import { useCommandState } from "cmdk";

import { CommandGroup, CommandItem } from "@/components/ui/command";
import {
  useCommandMenuPage,
  usePushCommandMenuPage,
  useSetCalendarSettings,
  useSetCommandMenuOpen,
} from "@/store/hooks";

export function StartOfWeekCommands() {
  const search = useCommandState((state) => state.search);
  const page = useCommandMenuPage();
  const pushCommandMenuPage = usePushCommandMenuPage();

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
      <CommandItem onSelect={() => pushCommandMenuPage("start-of-week")}>
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
  const setCalendarSettings = useSetCalendarSettings();
  const setOpen = useSetCommandMenuOpen();

  const prefix = prefixWith ? `${prefixWith} > ` : "";

  return (
    <>
      <CommandItem
        value="start-of-week-monday"
        keywords={["Monday"]}
        onSelect={() => {
          setCalendarSettings({ weekStartsOn: 1 });
          setOpen(false);
        }}
      >
        {prefix} Monday
      </CommandItem>
      <CommandItem
        value="start-of-week-tuesday"
        keywords={["Tuesday"]}
        onSelect={() => {
          setCalendarSettings({ weekStartsOn: 2 });
          setOpen(false);
        }}
      >
        {prefix} Tuesday
      </CommandItem>
      <CommandItem
        value="start-of-week-wednesday"
        keywords={["Wednesday"]}
        onSelect={() => {
          setCalendarSettings({ weekStartsOn: 3 });
          setOpen(false);
        }}
      >
        {prefix} Wednesday
      </CommandItem>
      <CommandItem
        value="start-of-week-thursday"
        keywords={["Thursday"]}
        onSelect={() => {
          setCalendarSettings({ weekStartsOn: 4 });
          setOpen(false);
        }}
      >
        {prefix} Thursday
      </CommandItem>
      <CommandItem
        value="start-of-week-friday"
        keywords={["Friday"]}
        onSelect={() => {
          setCalendarSettings({ weekStartsOn: 5 });
          setOpen(false);
        }}
      >
        {prefix} Friday
      </CommandItem>
      <CommandItem
        value="start-of-week-saturday"
        keywords={["Saturday"]}
        onSelect={() => {
          setCalendarSettings({ weekStartsOn: 6 });
          setOpen(false);
        }}
      >
        {prefix} Saturday
      </CommandItem>
      <CommandItem
        value="start-of-week-sunday"
        keywords={["Sunday"]}
        onSelect={() => {
          setCalendarSettings({ weekStartsOn: 7 });
          setOpen(false);
        }}
      >
        {prefix} Sunday
      </CommandItem>
    </>
  );
}
