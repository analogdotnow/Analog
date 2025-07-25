import { env } from "@repo/env/client";
import * as React from "react";
import { createClient, ListenLiveClient, LiveTranscriptionEvents } from "@deepgram/sdk";

const TIMESLICE = 250;
const KEEP_ALIVE_INTERVAL = 3000; // 3 seconds

interface UseTranscribeProps {
  onTranscript?: (transcript: string) => void;
}

export function useTranscribe({ onTranscript }: UseTranscribeProps) {
  const [transcript, setTranscript] = React.useState("");
  const [isTranscribing, setIsTranscribing] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  
  const connectionRef = React.useRef<ListenLiveClient | null>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const keepAliveTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Notify parent of transcript changes
  React.useEffect(() => {
    if (transcript) {
      onTranscript?.(transcript);
    }
  }, [transcript, onTranscript]);

  const sendKeepAlive = React.useCallback(() => {
    if (connectionRef.current) {
      try {
        connectionRef.current.keepAlive();
        console.log("Sent KeepAlive");
      } catch (error) {
        console.error("Failed to send KeepAlive:", error);
      }
    }
  }, []);

  const startKeepAlive = React.useCallback(() => {
    if (keepAliveTimerRef.current) {
      clearInterval(keepAliveTimerRef.current);
    }
    keepAliveTimerRef.current = setInterval(sendKeepAlive, KEEP_ALIVE_INTERVAL);
  }, [sendKeepAlive]);

  const stopKeepAlive = React.useCallback(() => {
    if (keepAliveTimerRef.current) {
      clearInterval(keepAliveTimerRef.current);
      keepAliveTimerRef.current = null;
    }
  }, []);

  const pauseTranscription = React.useCallback(() => {
    if (!isTranscribing || isPaused) return;
    
    console.log("Pausing transcription");
    mediaRecorderRef.current?.pause();
    setIsPaused(true);
    startKeepAlive(); // Keep connection alive during pause
  }, [isTranscribing, isPaused, startKeepAlive]);

  const resumeTranscription = React.useCallback(() => {
    if (!isTranscribing || !isPaused) return;
    
    console.log("Resuming transcription");
    stopKeepAlive();
    mediaRecorderRef.current?.resume();
    setIsPaused(false);
  }, [isTranscribing, isPaused, stopKeepAlive]);

  const stopTranscription = React.useCallback(() => {
    console.log("Stopping transcription");
    
    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    streamRef.current?.getTracks().forEach((track) => track.stop());
    
    if (connectionRef.current) {
      connectionRef.current.requestClose();
      connectionRef.current = null;
    }
    
    // Clean up timers
    stopKeepAlive();
    
    setIsTranscribing(false);
    setIsPaused(false);
  }, [stopKeepAlive]);

  const handleTranscriptionToggle = async () => {
    if (isTranscribing) {
      stopTranscription();
      return;
    }

    try {
      console.log("Starting transcription...");
      
      // Clear previous transcript
      setTranscript("");
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });
      mediaRecorderRef.current = mediaRecorder;

      console.log("env.NEXT_PUBLIC_DEEPGRAM_API_KEY", env.NEXT_PUBLIC_DEEPGRAM_API_KEY);
      
      // Create Deepgram client and connection
      const deepgram = createClient(env.NEXT_PUBLIC_DEEPGRAM_API_KEY);
      const connection = deepgram.listen.live({
        model: "nova-3",
        punctuate: true,
        smart_format: true,
        interim_results: true,
        endpointing: 300, // 300ms silence before considering speech ended
      });

      connectionRef.current = connection;

      connection.on(LiveTranscriptionEvents.Open, () => {
        console.log("Deepgram connection opened");
        
        mediaRecorder.addEventListener("dataavailable", (event) => {
          if (event.data.size > 0 && connectionRef.current) {
            connectionRef.current.send(event.data);
          }
        });
        
        mediaRecorder.start(TIMESLICE);
        setIsTranscribing(true);
      });

      connection.on(LiveTranscriptionEvents.Transcript, (data) => {
        console.log("Transcript data:", JSON.stringify(data.channel, null, 2));
        if (data.channel.alternatives[0]?.transcript) {
          setTranscript(data.channel.alternatives[0]?.transcript);
        }
      });

      connection.on(LiveTranscriptionEvents.Metadata, (data) => {
        console.log("Metadata:", data);
      });

      connection.on(LiveTranscriptionEvents.Error, (error) => {
        console.error("Deepgram error:", error);
        stopTranscription();
      });

      connection.on(LiveTranscriptionEvents.Close, () => {
        console.log("Deepgram connection closed");
        setIsTranscribing(false);
        setIsPaused(false);
      });

    } catch (err) {
      console.error("Failed to start transcription:", err);
    }
  };

  return {
    isTranscribing,
    isPaused,
    transcript,
    handleTranscriptionToggle,
    pauseTranscription,
    resumeTranscription,
  };
}
