"use client";

import { ClipboardDocumentListIcon } from "@heroicons/react/16/solid";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  children: React.ReactNode;
  className?: string;
  value: string;
  disabled?: boolean;
}

export function CopyButton({
  children,
  className,
  value,
  disabled,
}: CopyButtonProps) {
  "use memo";

  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      className={cn("size-7 text-muted-foreground", className)}
      disabled={disabled}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
        } catch {
          // ignore clipboard errors
        }
      }}
    >
      <ClipboardDocumentListIcon className="size-4" />
      {children}
    </Button>
  );
}
