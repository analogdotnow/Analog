"use client";

import { useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, UIMessage } from "ai";

interface ChatProps {
  signal: AbortSignal;
  initialMessages: UIMessage[];
  onFinish: () => void;
}

export function Chat({ signal, initialMessages, onFinish }: ChatProps) {
  const { messages, regenerate, stop } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/ai",
    }),
    onFinish,
    messages: initialMessages,
  });

  useEffect(() => {
    const controller = new AbortController();

    regenerate();

    signal.addEventListener("abort", () => stop(), {
      signal: controller.signal,
    });

    return () => controller.abort();
  }, [signal, stop, regenerate]);

  return (
    <div>
      <div>
        {messages?.map((m) => (
          <div key={m.id}>
            <strong>{`${m.role}: `}</strong>
            {m.parts?.map((part, i) => {
              switch (part.type) {
                case "text":
                  return <div key={i}>{part.text}</div>;
                case "tool-call":
                  return (
                    <div key={i}>
                      <pre>{JSON.stringify(part, null, 2)}</pre>
                    </div>
                  );
              }
            })}
            <br />
          </div>
        ))}
      </div>
    </div>
  );
}
