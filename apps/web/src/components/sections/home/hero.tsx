import Image from "next/image";
import PreviewDark from "@/assets/dark-preview.png";
import PreviewLight from "@/assets/preview.png";
import { WaitlistForm } from "./waitlist-form";
import { HydrateClient, prefetch, trpc } from "@/lib/trpc/server";

export function Hero() {
  prefetch(trpc.waitlist.getWaitlistCount.queryOptions());

  return (
    <div className="flex flex-col gap-8 md:gap-16 w-full max-w-6xl overflow-hidden">
      <div className="flex flex-col gap-12 px-4 md:px-6">
        <div className="flex flex-col gap-3 md:gap-6 items-center justify-center text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-tight font-satoshi">
            Beyond Scheduling. <br className="hidden md:block" /> A calendar
            that understands your life.
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-xl">
            Analog is an open-source alternative that turns intentions into
            actions.
          </p>
        </div>

        <HydrateClient>
          <WaitlistForm />
        </HydrateClient>
      </div>

      <div className="min-w-[300vw] px-4 sm:px-6 w-full sm:max-w-7xl sm:min-w-0 sm:translate-x-0 mx-auto">
        <Image
          src={PreviewDark}
          alt="Hero"
          className="rounded-lg hidden dark:block"
        />
        <Image
          src={PreviewLight}
          alt="Hero"
          className="rounded-lg block dark:hidden"
        />
      </div>
    </div>
  );
}
