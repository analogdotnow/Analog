import { atomWithStorage } from "jotai/utils";

export const waitlistJoinedAtom = atomWithStorage<boolean>(
  "analog-waitlist-joined",
  false
);