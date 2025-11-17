import { atom } from "jotai";

export const commandMenuOpenAtom = atom(false);

export const commandMenuPagesAtom = atom<string[]>([]);

export const commandMenuPageAtom = atom((get) => {
  const pages = get(commandMenuPagesAtom);

  if (pages.length === 0) {
    return undefined;
  }

  return pages[pages.length - 1];
});
