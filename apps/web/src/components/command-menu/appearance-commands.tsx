import { useCommandState } from "cmdk";
import { useAtomValue, useSetAtom } from "jotai";
import { useTheme } from "next-themes";

import {
  commandMenuOpenAtom,
  commandMenuPageAtom,
  commandMenuPagesAtom,
} from "@/atoms/command-menu";
import { CommandGroup, CommandItem } from "@/components/ui/command";

export function AppearanceCommands() {
  const search = useCommandState((state) => state.search);
  const page = useAtomValue(commandMenuPageAtom);
  const setPages = useSetAtom(commandMenuPagesAtom);

  if (page && page !== "theme") {
    return null;
  }

  if (page === "theme") {
    return (
      <CommandGroup heading="Appearance">
        <AppearanceCommandsContent />
      </CommandGroup>
    );
  }

  return (
    <CommandGroup heading="Appearance">
      <CommandItem onSelect={() => setPages((pages) => [...pages, "theme"])}>
        Change theme
      </CommandItem>
      {search?.trim() ? (
        <AppearanceCommandsContent prefixWith="Change theme" />
      ) : null}
    </CommandGroup>
  );
}

interface AppearanceCommandsContentProps {
  prefixWith?: string;
}

function AppearanceCommandsContent({
  prefixWith,
}: AppearanceCommandsContentProps) {
  const { setTheme } = useTheme();
  const setOpen = useSetAtom(commandMenuOpenAtom);
  const prefix = prefixWith ? `${prefixWith} > ` : "";

  return (
    <>
      <CommandItem
        value="system"
        keywords={["system", "automatic"]}
        onSelect={() => {
          setTheme("system");
          setOpen(false);
        }}
      >
        {prefix} Automatic (system)
      </CommandItem>
      <CommandItem
        value="light"
        keywords={["light"]}
        onSelect={() => {
          setTheme("light");
          setOpen(false);
        }}
      >
        {prefix} Light
      </CommandItem>
      <CommandItem
        value="dark"
        keywords={["dark"]}
        onSelect={() => {
          setTheme("dark");
          setOpen(false);
        }}
      >
        {prefix} Dark
      </CommandItem>
    </>
  );
}
