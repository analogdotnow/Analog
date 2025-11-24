import { atom } from "jotai";

export const cellHeightAtom = atom<number>(64);
export const columnHeightAtom = atom<number>((get) => get(cellHeightAtom) * 24);
