import * as React from "react";
import { useAtom, useSetAtom } from "jotai";
import { useQueryState } from "nuqs";
import { useHotkeys, useHotkeysContext } from "react-hotkeys-hook";

import {
  commandMenuOpenAtom,
  commandMenuPagesAtom,
} from "@/atoms/command-menu";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { AppearanceCommands } from "./appearance-commands";
import { CalendarNavigationCommands } from "./calendar-navigation-commands";
import { EventSearchCommands } from "./event-search-commands";
import { LayoutCommands } from "./layout-commands";
import { LocalizationCommands } from "./localization-commands";
import { PreferencesCommands } from "./preferences-commands";
import { StartOfWeekCommands } from "./start-of-week-commands";

export function AppCommandMenu() {
  const [open, setOpen] = useAtom(commandMenuOpenAtom);
  const [pages, setPages] = useAtom(commandMenuPagesAtom);
  const { disableScope, enableScope } = useHotkeysContext();
  const [search, setSearch] = useQueryState("search");

  React.useEffect(() => {
    if (!search) {
      return;
    }

    setOpen(true);
  }, [search, setOpen]);

  React.useEffect(() => {
    if (open) {
      enableScope("command-menu");
      disableScope("calendar");
      disableScope("event");

      return;
    }

    enableScope("calendar");
    enableScope("event");
    disableScope("command-menu");
  }, [open, disableScope, enableScope]);

  React.useEffect(() => {
    if (open || search) {
      return;
    }

    setPages([]);
  }, [open, search, setPages]);

  const onOpenChange = (open: boolean) => {
    if (!open && !search && pages.length > 0) {
      setPages((pages) => pages.slice(0, -1));

      return;
    }

    setOpen(open);

    if (!open) {
      setSearch(null);
    }
  };

  useHotkeys("mod+k", () => setOpen((open) => !open), {
    preventDefault: true,
  });

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      className="max-w-xl"
      showCloseButton={false}
    >
      <Command className="h-80 max-h-svh">
        <CommandContent />
      </Command>
    </CommandDialog>
  );
}

function CommandContent() {
  const [search, setSearch] = useQueryState("search");
  const setPages = useSetAtom(commandMenuPagesAtom);

  useHotkeys(
    "backspace",
    () => {
      setPages((pages) => pages.slice(0, -1));
    },
    {
      preventDefault: true,
      scopes: ["command-menu"],
      enabled: !search,
    },
  );

  const onSearchChange = (value: string) => {
    if (value.trim().length === 0) {
      setSearch(null);
    }

    setSearch(value);
  };

  return (
    <>
      <CommandInput
        placeholder="Type a command or search..."
        value={search ?? undefined}
        onValueChange={onSearchChange}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CalendarNavigationCommands />
        <EventSearchCommands />
        <LayoutCommands />
        <PreferencesCommands />
        <AppearanceCommands />
        <LocalizationCommands />
        <StartOfWeekCommands />
      </CommandList>
    </>
  );
}
