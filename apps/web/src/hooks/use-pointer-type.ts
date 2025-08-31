import { useMatchMedia } from "@/hooks/use-match-media";

export const usePointerType = () => {
  const isFine = useMatchMedia("(pointer: fine)");

  if (isFine) {
    return "mouse";
  }

  return "touch";
};
