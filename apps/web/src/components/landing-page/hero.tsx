import Image from "next/image";
import Link from "next/link";
import { ArrowRight, StarIcon } from "lucide-react";

import PreviewDark from "@/assets/dark-preview.png";
import PreviewLight from "@/assets/preview.png";
import { GitHub } from "@/components/icons";
import { AnimatedGroup } from "@/components/ui/animated-group";
import {
  delayedTransitionVariants,
  transitionVariants,
} from "@/lib/transitions";
import { URLS } from "@/lib/urls";

export function Hero() {
  return (
    <div className="flex w-full max-w-6xl flex-col gap-12 md:gap-16">
      <AnimatedGroup variants={transitionVariants}>
        <div className="flex flex-col gap-12 px-4 md:px-6">
          <div className="flex flex-col gap-y-4">
            <AnimatedGroup variants={transitionVariants}>
              <Link
                href={URLS.GITHUB}
                target="_blank"
                rel="noopener noreferrer"
                className="group mx-auto flex w-fit items-center gap-2 rounded-full border bg-muted/30 p-1 pl-2.5 shadow-sm shadow-neutral-300/20 transition-colors duration-300 hover:bg-background dark:border-border/10 dark:shadow-md dark:shadow-neutral-950/20 dark:hover:border-border/20"
              >
                <span className="inline-flex items-center gap-2 text-sm text-foreground">
                  <GitHub className="size-4 fill-primary" />
                  GitHub
                  <span className="inline-flex items-center gap-2">
                    <StarIcon className="size-3 fill-primary stroke-primary transition-colors duration-500 group-hover:fill-yellow-500 group-hover:stroke-yellow-500" />
                    1.2k
                  </span>
                </span>
                <span className="block h-6 w-0.5 border-l bg-white dark:border-background dark:bg-neutral-700/20"></span>

                <div className="size-6 overflow-hidden rounded-full bg-muted/40 duration-500 group-hover:bg-muted">
                  <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                    <span className="flex size-6">
                      <ArrowRight className="m-auto size-3" />
                    </span>
                    <span className="flex size-6">
                      <ArrowRight className="m-auto size-3" />
                    </span>
                  </div>
                </div>
              </Link>
            </AnimatedGroup>

            <div className="flex flex-col items-center justify-center gap-3 text-center md:gap-6">
              <h1 className="font-satoshi text-4xl leading-tight md:text-5xl">
                Reimagining the Calendar, <br /> to make the most of your time
              </h1>
              <p>
                Analog is an open source calendar that redefines what it means
                to use a calendar.
                {/* Calendars have been the same for decades. */}
              </p>
              {/* <p className="max-w-xl text-base text-muted-foreground md:text-lg">
              Analog redefines what it means to use a calendar. Analog is an AI-powered calendar that understands your life, and helps you organize and save time. It's an AI-powered calendar that understands your life, and helps you organize and save time.
            </p> */}
            </div>
          </div>
        </div>
      </AnimatedGroup>

      <AnimatedGroup
        variants={delayedTransitionVariants}
        className="overflow-hidden"
      >
        <div className="mx-auto w-full min-w-[300vw] px-4 sm:max-w-7xl sm:min-w-0 sm:translate-x-0 sm:px-6">
          {/* <div className="w-full [--base-height:874px] [--display-height:calc(var(--base-height)_*_var(--preview-scale))] [--preview-scale:0.5] sm:[--preview-scale:0.8]">
            <div className="[--item-width:1400px]">
              <CalendarWindow className="h-(--base-height) w-(--item-width) scale-(--preview-scale) origin-top-left" />
            </div>
          </div>
          <CalendarWindow className="w-full h-[50vh]" /> */}
          <Image
            src={PreviewDark}
            alt="Hero"
            className="hidden rounded-lg dark:block"
            unoptimized
          />
          <Image
            src={PreviewLight}
            alt="Hero"
            className="block rounded-lg dark:hidden"
            unoptimized
          />
        </div>
      </AnimatedGroup>
    </div>
  );
}
