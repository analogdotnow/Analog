import deepmerge from "deepmerge";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

/*
 * Need to quickly add an API key for testing?
 * Open your browser's console (F12) and run the local storage update as below.
 * After running, refresh the page or trigger a re-render to pick up the new keys.
 * Cheers!
 */
export const DEV_ONLY_KEYS = () => {
  // copy this thing below
  localStorage.setItem(
    "analog-api-keys",
    JSON.stringify({
      openai: "sk-YOUR_OPENAI_KEY_HERE",
      // Add other keys as needed, e.g.,
      // resend: "xxxxx",
    }),
  );
};

export type ApiKeys = {
  [apiKey: string]: string;
};

const baseApiKeysAtom = atomWithStorage<ApiKeys>("analog-api-keys", {});

export const apiKeysAtom = atom(
  (get) => get(baseApiKeysAtom),
  (get, set, update: ApiKeys) => {
    const currentKeys = get(baseApiKeysAtom);
    const mergedKeys = deepmerge(currentKeys, update);
    set(baseApiKeysAtom, mergedKeys);
  },
);
