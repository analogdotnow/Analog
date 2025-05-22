"use client";

import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Image from "next/image";

import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import calendarPreview from "@/assets/preview.png";
import calendarPreviewDark from "@/assets/dark-preview.png";

export default function Home() {
  const { resolvedTheme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setIsDarkMode(resolvedTheme === "dark");
  }, [resolvedTheme]);

  return (
    <main className="flex flex-col gap-8 md:gap-12 w-full items-center justify-center px-4 md:px-6">
      <div className="flex flex-col gap-6 w-full max-w-3xl">
        <div className="flex flex-col gap-3 md:gap-4 items-center justify-center text-center">
          <h1 className="font-safiro text-4xl sm:text-5xl md:text-6xl leading-tight">
            Beyond Scheduling. <br className="hidden sm:block" /> A calendar
            that understands your life.
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-xl">
            The open-source alternative that turns intentions into actions.
          </p>
        </div>

        <div className="flex flex-col gap-3 items-center justify-center w-full">
          <form className="flex flex-col sm:flex-row gap-3 w-full max-w-lg mx-auto">
            <Input
              placeholder="john@acme.de"
              className="font-medium h-11 placeholder:text-muted-foreground placeholder:font-medium bg-white outline outline-neutral-200 w-full rounded-md px-4"
            />
            <Button className="w-full sm:w-fit pl-4 pr-3 h-11" type="submit">
              Join Waitlist <ChevronRight className="h-5 w-5" />
            </Button>
          </form>

          <div className="relative flex flex-row gap-2 items-center justify-center">
            <span className="bg-green-400 size-2 rounded-full" />
            <span className="bg-green-400 size-2 rounded-full blur-xs left-0 absolute" />
            <span className="text-green-400 text-sm sm:text-base">
              285 people already joined
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-md shadow-lg w-[300%] md:w-full translate-x-1/3 md:translate-x-0 overflow-hidden">
        <Image
          src={isDarkMode ? calendarPreviewDark : calendarPreview}
          alt="Calendar Preview"
          aria-hidden
          className="w-full h-auto"
          priority
        />
      </div>
    </main>
  );
}
