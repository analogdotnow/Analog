import { Quote } from "lucide-react";
import { Variants } from "motion/react";

import { AnimatedGroup } from "@/components/ui/animated-group";
import { testimonials } from "@/lib/constants/testimonials";

const transitionVariants: Record<string, Variants> = {
  container: {
    visible: {
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  },
  item: {
    hidden: {
      opacity: 0,
      y: 30,
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

export function TestimonialsSection() {
  return (
    <section className="w-full py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <AnimatedGroup variants={transitionVariants}>
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-satoshi text-3xl font-semibold md:text-4xl lg:text-5xl">
              Loved by developers worldwide
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Join thousands of developers who have already transformed their
              scheduling experience.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <AnimatedGroup key={index} variants={transitionVariants}>
                <div className="group relative rounded-2xl border border-border/50 bg-card/50 p-8 transition-all duration-300 hover:bg-card/80 hover:shadow-lg">
                  <Quote className="absolute -top-3 left-8 h-6 w-6 text-primary/20" />
                  <blockquote className="mb-6 text-lg leading-relaxed text-foreground">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
                      <span className="text-sm font-semibold text-primary">
                        {testimonial.author
                          .split(" ")
                          .filter((n) => n.length > 0)
                          .map((n) => n[0]?.toUpperCase())
                          .filter(Boolean)
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">
                        {testimonial.author}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role} at {testimonial.company}
                      </div>
                    </div>
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
