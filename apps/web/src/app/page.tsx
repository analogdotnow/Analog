'use client'

import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Image from "next/image";

import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import calendarPreview from "@/assets/preview.png";
import calendarPreviewDark from "@/assets/dark-preview.png";

export default function Home() {
  const { resolvedTheme } = useTheme()
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setIsDarkMode(resolvedTheme === "dark");
  }, [resolvedTheme]);

  return (
    <main className="flex flex-col gap-16 w-full items-center justify-center">
      <div className="flex flex-col gap-11">
        <div className="flex flex-col gap-6 items-center justify-center text-center">
          <h1 className="font-safiro text-5xl">
            Beyond Scheduling. <br /> A calendar that understands your life.
          </h1>
          <p className="text-muted-foreground text-base">
            The open-source alternative that turns intentions into actions.
          </p>
        </div>

        <div className="flex flex-col gap-3 items-center justify-center">
          <div className="flex flex-row gap-3 max-w-lg w-full mx-auto h-10.5">
            <Input
              placeholder="john@acme.de"
              className="font-medium h-full placeholder:text-muted-foreground placeholder:font-medium bg-white outline outline-neutral-200 w-full rounded-md px-4"
            />
            <Button className="w-fit pl-4 pr-3 h-full">
              Join Waitlist <ChevronRight />
            </Button>
          </div>

          <div className="relative flex flex-row gap-2 items-center justify-center">
            <span className="bg-green-400 size-2 rounded-full" />
            <span className="bg-green-400 size-2 rounded-full blur-xs left-0 absolute" />
            <span className="text-green-400">285 people already joined</span>
          </div>
        </div>
      </div>

      <div className="rounded-md shadow-lg max-w-7xl">
        <Image src={isDarkMode ? calendarPreviewDark : calendarPreview} alt="Calendar Preview" aria-hidden />
      </div>
    </main>
  );
}
