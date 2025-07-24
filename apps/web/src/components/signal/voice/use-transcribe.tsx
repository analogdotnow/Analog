import * as React from "react";
import { LiveTranscriptionEvents, createClient } from "@deepgram/sdk";
import { useQueryClient } from "@tanstack/react-query";

const TIMESLICE = 250;
const DEEPGRAM_API_KEY = "";

interface UseTranscribeProps {
  onTranscript: (transcript: string) => void;
}

export const useDeepgramSubscription = () => {
  React.useEffect(() => {
    const deepgramClient = createClient(DEEPGRAM_API_KEY);

    const deepgramConnection = deepgramClient.listen.live({
      model: "nova-3",
      // live transcription options
    });

    deepgramConnection.on(LiveTranscriptionEvents.Open, () => {
      deepgramConnection.on(LiveTranscriptionEvents.Transcript, (data) => {
        console.log(data);
      });

      source.addListener("got-some-audio", async (event) => {
        deepgramConnection.send(event.raw_audio_data);
      });
    });
  });
};

export function useTranscribe({ onTranscript }: UseTranscribeProps) {
  const [transcript, setTranscript] = React.useState("");
  const [isTranscribing, setIsTranscribing] = React.useState(false);
  const socketRef = React.useRef<WebSocket | null>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  const stopTranscription = () => {
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    socketRef.current?.close();
    setIsTranscribing(false);
  };

  const handleTranscriptionToggle = async () => {
    if (isTranscribing) {
      stopTranscription();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });
      mediaRecorderRef.current = mediaRecorder;

      const socket = new WebSocket(
        "wss://api.deepgram.com/v1/listen?model=nova-3",
        ["token", DEEPGRAM_API_KEY],
      );

      socketRef.current = socket;

      socket.onopen = () => {
        mediaRecorder.addEventListener("dataavailable", (event) => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(event.data);
          }
        });
        mediaRecorder.start(TIMESLICE);
      };

      socket.onmessage = (message) => {
        const received = JSON.parse(message.data);
        const result = received.channel.alternatives[0]?.transcript;
        if (result) {
          setTranscript((prev) => prev + " " + result);
        }
      };

      setIsTranscribing(true);
    } catch (err) {
      console.error("Failed to start transcription:", err);
    }
  };

  return {
    isTranscribing,
    transcript,
  };
}
