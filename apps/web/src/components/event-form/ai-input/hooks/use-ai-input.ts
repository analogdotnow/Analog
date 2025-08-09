import { useCallback, useMemo, useState } from "react";
import { useKeyboardEvent, useToggle } from "@react-hookz/web";
import { useAtomValue } from "jotai";
import { toast } from "sonner";

import {
  aiInputPredicate,
  generateEventFormData,
} from "@/components/event-form/ai-input/support/ai-input";
import type { AiOutputData } from "@/lib/schemas/event-form";

export const useAiInput = (getPrompt: () => string) => {
  const [isLoading, toggleLoading] = useToggle(false);
  const [data, setData] = useState<AiOutputData | null>(null);
  // const apiKeys = useAtomValue(apiKeysAtom);

  const aiKey = "sk-proj-1234567890";

  const enabled = aiKey !== null;

  const generateInput = useCallback(
    async (userInput: string) => {
      if (!aiKey) return;
      toggleLoading();
      try {
        const generatedInput = await generateEventFormData(userInput, aiKey);
        setData(generatedInput);
      } catch {
        toast.error("Failed to get AI input");
      } finally {
        toggleLoading();
      }
    },
    [toggleLoading, aiKey],
  );

  useKeyboardEvent(
    aiInputPredicate,
    () => enabled && generateInput(getPrompt()),
    [getPrompt, generateInput, enabled],
    { eventOptions: { passive: true } },
  );

  return { isLoading, generateInput, data, enabled };
};
