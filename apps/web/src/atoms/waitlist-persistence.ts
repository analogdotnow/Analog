import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const waitlistJoinedAtom = atomWithStorage<boolean>(
  "analog-waitlist-joined",
  false,
);

export function useWaitlistPersistence() {
  const [hasJoined, setHasJoined] = useAtom(waitlistJoinedAtom);

  const markAsJoined = () => {
    setHasJoined(true);
  };

  return { hasJoined, markAsJoined };
}
