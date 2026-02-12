"use client";

import {
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/16/solid";
import { LoaderCircleIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

import { buttonVariants } from "@/components/ui/button";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={{
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)",
      }}
      icons={{
        success: <CheckIcon className="size-4" />,
        info: <InformationCircleIcon className="size-4" />,
        warning: <ExclamationTriangleIcon className="size-4" />,
        error: <XMarkIcon className="size-4" />,
        loading: <LoaderCircleIcon className="size-4 animate-spin" />,
        close: <XMarkIcon className="size-4" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "!bg-transparent !bg-linear-to-b !from-popover/90 !to-popover/60 before:-inset-[1px] before:absolute before:content-[''] before:rounded-lg before:border-t before:border-foreground/5 p-4 text-popover-foreground shadow-3xl backdrop-blur-lg !rounded-lg z-100 !border-border/40 !px-3 !py-3 !items-start",
          title: "font-semibold!",
          description: "text-muted-foreground! font-normal!",
          actionButton: buttonVariants({ variant: "outline" }),
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
