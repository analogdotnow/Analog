import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConnectAccountProps {
  className?: string;
}

export function ConnectAccount({ className }: ConnectAccountProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Button>Connect Account</Button>
    </div>
  );
}
