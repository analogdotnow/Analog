import { Video } from "lucide-react";

import { Button } from "@/components/ui/button";

const VideoConferencingButton = () => {
  return (
    <div className="px-4">
      <Button
        variant="secondary"
        type="button"
        className="h-7 w-full bg-input/70 text-[0.8rem] text-muted-foreground shadow-none select-none hover:bg-input/40"
      >
        <Video /> Link Video Conferencing
      </Button>
    </div>
  );
};

export default VideoConferencingButton;
