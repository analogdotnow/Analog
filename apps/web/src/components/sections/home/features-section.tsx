import { Variants } from "motion/react";

import { AnimatedGroup } from "@/components/ui/animated-group";
import { features } from "@/lib/constants/features";

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

export function FeaturesSection() {
  return (
    <section className="w-full py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <AnimatedGroup variants={transitionVariants}>
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-satoshi text-3xl font-semibold md:text-4xl lg:text-5xl">
              Everything you need in a calendar
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Built for modern teams who demand more than just basic scheduling.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <AnimatedGroup key={index} variants={transitionVariants}>
                <div
                  className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-8 transition-all duration-500 hover:bg-card/80 hover:shadow-xl hover:shadow-primary/5"
                  role="article"
                  aria-labelledby={`feature-${index}-title`}
                >
                  {/* Gradient background on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                  />

                  <div className="relative">
                    <div className="mb-6 flex items-center gap-4">
                      <div className="rounded-xl bg-primary/10 p-3 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                        <feature.icon
                          className="h-6 w-6 text-primary transition-colors"
                          aria-hidden="true"
                        />
                      </div>
                      <h3
                        id={`feature-${index}-title`}
                        className="text-xl font-semibold transition-colors group-hover:text-primary"
                      >
                        {feature.title}
                      </h3>
                    </div>
                    <p className="leading-relaxed text-muted-foreground transition-colors group-hover:text-foreground/80">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </AnimatedGroup>
            ))}
          </div>
        </AnimatedGroup>
      </div>
    </section>
  );
}
