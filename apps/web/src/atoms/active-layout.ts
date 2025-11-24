import { atom } from "jotai";

export const activeLayoutAtom = atom<"form" | "calendar" | undefined>(
  undefined,
);
