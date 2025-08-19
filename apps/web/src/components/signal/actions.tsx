import * as React from "react";

import { Button } from "@/components/ui/button";
import { KeyboardShortcut } from "@/components/ui/keyboard-shortcut";
import { cn } from "@/lib/utils";

type ActionButtonProps = React.ComponentProps<typeof Button>;

export function ActionButton({ children, ...props }: ActionButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        "h-7 gap-2 rounded-md ps-2 pe-1 text-xs shadow-none dark:bg-neutral-700/40",
      )}
      {...props}
    >
      {children}
    </Button>
  );
}

interface ActionProps
  extends Omit<React.ComponentProps<typeof Button>, "type"> {
  type?: "button" | "link";
  href?: string;
}

export function Action({ children, type, href, ...props }: ActionProps) {
  if (type === "link") {
    return (
      <ActionButton asChild {...props}>
        <a href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      </ActionButton>
    );
  }

  return <ActionButton {...props}>{children}</ActionButton>;
}

interface ActionShortcutProps {
  children: React.ReactNode;
}

export function ActionShortcut({ children }: ActionShortcutProps) {
  return (
    <KeyboardShortcut className="bg-neutral-700 text-neutral-400">
      {children}
    </KeyboardShortcut>
  );
}
