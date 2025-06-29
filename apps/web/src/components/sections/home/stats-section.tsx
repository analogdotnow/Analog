import { Github, Shield, Users, Zap } from "lucide-react";
import { Variants } from "motion/react";

import { AnimatedGroup } from "@/components/ui/animated-group";

const stats = [
  {
    icon: Github,
    value: "2.4k+",
    label: "GitHub Stars",
    description: "Community support",
  },
  {
    icon: Users,
    value: "15k+",
    label: "Active Users",
    description: "Worldwide adoption",
  },
  {
    icon: Zap,
    value: "99.9%",
    label: "Uptime",
    description: "Reliable performance",
  },
  {
    icon: Shield,
    value: "100%",
    label: "Open Source",
    description: "Transparent code",
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
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        bounce: 0.3,
        duration: 0.8,
      },
    },
  },
};

export function StatsSection() {
  return (
    <section className="w-full bg-muted/20 py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <AnimatedGroup variants={transitionVariants}>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <AnimatedGroup key={index} variants={transitionVariants}>
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <stat.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="mb-2 font-satoshi text-3xl font-bold text-foreground md:text-4xl">
                    {stat.value}
                  </div>
                  <div className="mb-1 text-lg font-semibold text-foreground">
                    {stat.label}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.description}
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
