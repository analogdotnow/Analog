import { useAtom } from "jotai";
import { waitlistJoinedAtom } from "@/atoms/waitlist-persistence";

export function useWaitlistPersistence() {
  const [hasJoined, setHasJoined] = useAtom(waitlistJoinedAtom);

  const markAsJoined = () => {
    setHasJoined(true);
  };

  return { hasJoined, markAsJoined };
}