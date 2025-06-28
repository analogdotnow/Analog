import { ArrowRight, Star } from "lucide-react";
import { Variants } from "motion/react";

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
    <section className="w-full py-20">
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <AnimatedGroup variants={transitionVariants}>
          <div className="mb-12 text-center">
            <div className="mb-4 flex items-center justify-center gap-2">
              <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
              <span className="text-sm font-medium text-muted-foreground">
                Join thousands of developers
              </span>
            </div>
            <h2 className="mb-4 font-satoshi text-3xl font-semibold md:text-4xl lg:text-5xl">
              Ready to transform your calendar?
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Be among the first to experience the future of scheduling. Join
              our waitlist and get early access.
            </p>
          </div>

          <div className="mb-8">
            <WaitlistForm />
          </div>

          <div className="text-center">
            <p className="mb-4 text-sm text-muted-foreground">
              Already convinced? Help us build the future.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button variant="outline" size="lg">
                <ArrowRight className="mr-2 h-4 w-4" />
                Contribute on GitHub
              </Button>
              <Button variant="outline" size="lg">
                Read Documentation
              </Button>
            </div>
          </div>
        </AnimatedGroup>
      </div>
    </section>
  );
}
