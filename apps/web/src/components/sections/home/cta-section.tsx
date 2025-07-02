import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { Variants } from "motion/react";

import { GitHub } from "@/components/icons";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { Button } from "@/components/ui/button";
import { WaitlistForm } from "./waitlist-form";

const transitionVariants: Record<string, Variants> = {
  container: {
    visible: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  },
  item: {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        bounce: 0.3,
        duration: 0.8,
      },
    },
  },
};

export function CTASection() {
  return (
    <section className="relative w-full py-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />

      <div className="relative mx-auto max-w-4xl px-4 md:px-6">
        <AnimatedGroup variants={transitionVariants}>
          <div className="mb-12 text-center">
            <div className="mb-6 flex items-center justify-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                Join our growing community
              </span>
            </div>
            <h2 className="mb-6 font-satoshi text-3xl font-semibold md:text-4xl lg:text-5xl">
              Ready to transform your calendar?
            </h2>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Be among the first to experience the future of scheduling. Join
              our waitlist and get early access to the most developer-friendly
              calendar.
            </p>
          </div>

          <div className="mb-12">
            <WaitlistForm />
          </div>

          <div className="text-center">
            <p className="mb-6 text-sm text-muted-foreground">
              Already convinced? Help us build the future of calendar apps.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="https://github.com/analogdotnow/analog">
                <Button variant="outline" size="lg" className="group">
                  <GitHub className="mr-2 h-4 w-4 fill-primary transition-transform group-hover:scale-110" />
                  Contribute on GitHub
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </AnimatedGroup>
      </div>
    </section>
  );
}
