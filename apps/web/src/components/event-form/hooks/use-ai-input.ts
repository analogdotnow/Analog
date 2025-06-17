import { useCallback, useMemo, useState } from "react";
import { useKeyboardEvent, useToggle } from "@react-hookz/web";
import { useAtomValue } from "jotai";

import { apiKeysAtom } from "@/atoms/api-keys";
import type { AiOutputData } from "@/lib/schemas/event-form/ai-data";
import { aiInputPredicate, generateEventFormData } from "../support/ai-input";

export const useAiInput = (getPrompt: () => string) => {
  const [isLoading, toggleLoading] = useToggle(false);
  const [data, setData] = useState<AiOutputData | null>(null);
  const apiKeys = useAtomValue(apiKeysAtom);

  const aiKey = useMemo(() => apiKeys["openai"] || null, [apiKeys]);

  const enabled = aiKey !== null;

  const generateInput = useCallback(
    async (userInput: string) => {
      if (!aiKey) return;
      toggleLoading();
      const generatedInput = await generateEventFormData(userInput, aiKey);
      toggleLoading();
      setData(generatedInput);
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
