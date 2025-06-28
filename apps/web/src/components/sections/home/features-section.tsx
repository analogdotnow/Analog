import { Calendar, Code, Heart, Shield, Users, Zap } from "lucide-react";
import { Variants } from "motion/react";

import { AnimatedGroup } from "@/components/ui/animated-group";

const features = [
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description:
      "Intelligent event management with natural language input and AI-powered suggestions.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Seamlessly coordinate with your team through shared calendars and real-time updates.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Built for speed with instant sync across all your devices and integrations.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "Your data stays yours. No tracking, no ads, complete control over your information.",
  },
  {
    icon: Code,
    title: "Open Source",
    description:
      "Transparent, auditable, and community-driven. Contribute and customize as you need.",
  },
  {
    icon: Heart,
    title: "Built with Love",
    description:
      "Crafted by developers who believe in the power of open collaboration.",
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
                <div className="group rounded-xl border border-border/50 bg-card/50 p-6 transition-all duration-300 hover:bg-card/80 hover:shadow-lg">
                  <div className="mb-4 flex items-center gap-4">
                    <div className="rounded-lg bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                  </div>
                  <p className="leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </AnimatedGroup>
            ))}
          </div>
        </AnimatedGroup>
      </div>
    </section>
  );
}
