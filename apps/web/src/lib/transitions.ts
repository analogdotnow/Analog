import type { Variants } from "motion/react";

export const transitionVariants: Record<string, Variants> = {
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

export const delayedTransitionVariants: Record<string, Variants> = {
  container: {
    visible: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.25,
      },
    },
  },
  ...transitionVariants,
};
