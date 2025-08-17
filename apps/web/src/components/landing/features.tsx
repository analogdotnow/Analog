import { Cpu, Lock, Sparkles, Zap } from "lucide-react";

import { cn } from "@/lib/utils";

interface FeaturesProps {
  className?: string;
}

export function Features({ className }: FeaturesProps) {
  return (
    <div
      className={cn(
        "relative mx-auto grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-8 lg:grid-cols-4",
        className,
      )}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="size-4" />
          <h3 className="text-sm font-medium">Faaast</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          It supports an entire helping developers and innovate.
        </p>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Cpu className="size-4" />
          <h3 className="text-sm font-medium">Powerful</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          It supports an entire helping developers and businesses.
        </p>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Lock className="size-4" />
          <h3 className="text-sm font-medium">Security</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          It supports an helping developers businesses innovate.
        </p>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4" />

          <h3 className="text-sm font-medium">AI Powered</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          It supports an helping developers businesses innovate.
        </p>
      </div>
    </div>
  );
}
