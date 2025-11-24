import * as React from "react";

import { Button } from "@/components/ui/button";
import { KeyboardShortcut } from "@/components/ui/keyboard-shortcut";
import { cn } from "@/lib/utils";

type ActionButtonProps = React.ComponentProps<typeof Button>;

type CommandActionProps = React.ComponentProps<typeof Button>;

export function CommandAction({
  children,
  className,
  ...props
}: CommandActionProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "relative flex size-9 rounded-2xl border border-border/20 bg-popover/80 inset-fade-shadow-light backdrop-blur-lg",
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
}

export function ActionButton({
  children,
  className,
  variant = "outline",
  ...props
}: ActionButtonProps) {
  return (
    <Button
      variant={variant}
      size="sm"
      className={cn("h-8 gap-2 rounded-md ps-2 pe-1 text-sm", className)}
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
      <ActionButton {...props}>
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
  className?: string;
}

export function ActionShortcut({ children, className }: ActionShortcutProps) {
  return (
    <KeyboardShortcut className={cn("bg-white/10 text-white/60", className)}>
      {children}
    </KeyboardShortcut>
  );
}
