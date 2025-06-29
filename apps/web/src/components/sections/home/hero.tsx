// import { CalendarWindow } from "./calendar-window";
// import { cn } from "@/lib/utils";

import { Titillium_Web } from "next/font/google";
import Image from "next/image";
import { Variants } from "motion/react";

import PreviewDark from "@/assets/dark-preview.png";
import PreviewLight from "@/assets/preview.png";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { HydrateClient, prefetch, trpc } from "@/lib/trpc/server";
import { WaitlistForm } from "./waitlist-form";

const titillium = Titillium_Web({
  subsets: ["latin"],
  weight: ["200", "400", "600", "700", "900"],
  style: "italic",
});

const transitionVariants: Record<string, Variants> = {
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring",
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
};

export function Hero() {
  prefetch(trpc.earlyAccess.getWaitlistCount.queryOptions());

  return (
    <div className="relative w-full overflow-hidden py-0">
      {/* Background gradient circles - now outside the content box */}
      <div className="pointer-events-none absolute inset-0 -z-10 h-full w-full overflow-hidden">
        {/* Soft gradient orbs */}
        <div className="absolute -top-64 -left-64 h-96 w-96 rounded-full bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 blur-3xl" />
        <div className="absolute top-32 -right-48 h-64 w-64 rounded-full bg-gradient-to-bl from-emerald-500/5 via-teal-500/5 to-cyan-500/5 blur-2xl" />
        <div className="via-red-500/05 absolute bottom-48 -left-32 h-48 w-48 rounded-full bg-gradient-to-tr from-orange-500/5 to-pink-500/5 blur-xl" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] dark:bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)]" />
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 md:gap-16">
        <AnimatedGroup variants={transitionVariants}>
          <div className="flex flex-col gap-12 px-4 md:px-6">
            <div className="flex flex-col items-center justify-center gap-6 text-center md:gap-8">
              {/* Badge */}
              <div className="inline-flex items-center rounded-full border border-border/50 bg-background/50 px-4 py-2 text-sm font-medium text-muted-foreground backdrop-blur-sm">
                <span className="mr-2 h-2 w-2 rounded-full bg-green-500"></span>
                Open Source Calendar
              </div>

              <h1 className="font-satoshi text-4xl leading-tight font-bold tracking-tight md:text-5xl lg:text-6xl xl:text-7xl">
                Beyond Scheduling. <br />
                <span>A calendar that </span>
                <span
                  className={`${titillium.className} bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent`}
                >
                  understands your life.
                </span>
              </h1>

              <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                Analog is an open-source alternative that turns intentions into
                actions. Built for developers, by developers.
              </p>
            </div>

            <HydrateClient>
              <WaitlistForm />
            </HydrateClient>
          </div>
        </AnimatedGroup>

        <AnimatedGroup
          variants={{
            container: {
              visible: {
                transition: {
                  staggerChildren: 0.05,
                  delayChildren: 0.25,
                },
              },
            },
            ...transitionVariants,
          }}
        >
          <div className="mx-auto w-full min-w-[300vw] px-4 sm:max-w-7xl sm:min-w-0 sm:translate-x-0 sm:px-6">
            <div className="relative">
              {/* Subtle shadow behind the image */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-black/5 to-transparent blur-2xl" />
              <Image
                src={PreviewDark}
                alt="Analog Calendar Interface"
                className="relative hidden rounded-2xl border border-border/50 shadow-2xl dark:block"
                unoptimized
              />
              <Image
                src={PreviewLight}
                alt="Analog Calendar Interface"
                className="relative block rounded-2xl border border-border/50 shadow-2xl dark:hidden"
                unoptimized
              />
            </div>
          </div>
        </AnimatedGroup>
      </div>
    </div>
  );
}
