import { Eye, Github, Lock, Users } from "lucide-react";
import { Variants } from "motion/react";

import { AnimatedGroup } from "@/components/ui/animated-group";
import { Button } from "@/components/ui/button";

const benefits = [
  {
    icon: Eye,
    title: "Transparency",
    description:
      "Every line of code is open for review. No hidden features or data collection.",
  },
  {
    icon: Lock,
    title: "Security",
    description:
      "Community-driven security audits and rapid vulnerability fixes.",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "Join thousands of developers contributing to make Analog better.",
  },
  {
    icon: Github,
    title: "Freedom",
    description:
      "Deploy your own instance, modify features, or contribute back to the project.",
  },
];

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

export function WhyOpensourceSection() {
  return (
    <section className="w-full bg-muted/30 py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <AnimatedGroup variants={transitionVariants}>
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-satoshi text-3xl font-semibold md:text-4xl lg:text-5xl">
              Why Open Source Matters
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              When your calendar is open source, you get more than just
              features—you get trust, transparency, and control.
            </p>
          </div>

          <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2">
            {benefits.map((benefit, index) => (
              <AnimatedGroup key={index} variants={transitionVariants}>
                <div className="flex items-start gap-4 rounded-xl border border-border/50 bg-background p-6">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-semibold">
                      {benefit.title}
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </AnimatedGroup>
            ))}
          </div>

          <div className="text-center">
            <Button size="lg" className="mr-4 mb-4">
              <Github className="mr-2 h-5 w-5" />
              View on GitHub
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </AnimatedGroup>
      </div>
    </section>
  );
}
