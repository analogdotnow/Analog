import { memo, useEffect, useState } from "react";
import { format } from "date-fns";
import {
  AnimatePresence,
  motion,
  type MotionProps,
  type Variants,
} from "motion/react";
import type { CaptionLabelProps } from "react-day-picker";

export const CalendarAnimatedLabel = memo(
  ({ displayMonth }: CaptionLabelProps) => {
    const [currentDate, setCurrentDate] = useState(displayMonth);
    const [previousDate, setPreviousDate] = useState<Date | null>(null);
    const [direction, setDirection] = useState<"forward" | "backward">(
      "forward",
    );

    useEffect(() => {
      if (displayMonth.getTime() !== currentDate.getTime()) {
        const isForward = displayMonth > currentDate;
        setPreviousDate(currentDate);
        setDirection(isForward ? "forward" : "backward");
        setCurrentDate(displayMonth);
      }
    }, [displayMonth, currentDate]);

    return (
      <div className="flex items-center gap-2">
        <AnimatedLabelPart
          currentDate={currentDate}
          previousDate={previousDate}
          direction={direction}
          variant="month"
        />
        <AnimatedLabelPart
          currentDate={currentDate}
          previousDate={previousDate}
          direction={direction}
          variant="year"
        />
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.displayMonth.getTime() === nextProps.displayMonth.getTime()
    );
  },
);

CalendarAnimatedLabel.displayName = "CalendarAnimatedLabel";

const motionVariants: Variants = {
  enter: ({ distance, isForward }) => ({
    y: isForward ? -distance : distance,
    opacity: 0,
  }),
  center: { y: 0, opacity: 1 },
  exit: ({ distance, isForward }) => ({
    y: isForward ? distance : -distance,
    opacity: 0,
  }),
};

const motionProps: MotionProps = {
  transition: {
    type: "spring" as const,
    stiffness: 400,
    damping: 30,
    mass: 1,
    duration: 0.3,
  },
  animate: "center",
};

const AnimatedLabelPart = ({
  currentDate,
  previousDate,
  direction,
  variant,
  slideDistance = 30,
}: {
  currentDate: Date;
  previousDate: Date | null;
  direction: "forward" | "backward";
  variant: "year" | "month";
  slideDistance?: number;
}) => {
  const getCurrentValue = (date: Date) =>
    variant === "month" ? format(date, "MMMM") : format(date, "yyyy");

  const getDateKey = (date: Date) =>
    variant === "month" ? date.getMonth() : date.getFullYear();

  const currentKey = getDateKey(currentDate);
  const previousKey = previousDate ? getDateKey(previousDate) : null;
  const hasValueChanged = previousKey !== null && previousKey !== currentKey;
  const isForward = direction === "forward";

  return (
    <div className="relative overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={`${variant}-${currentKey}`}
          className="block"
          custom={{ distance: slideDistance, isForward }}
          initial={hasValueChanged ? "enter" : "center"}
          exit={hasValueChanged ? "exit" : undefined}
          variants={motionVariants}
          {...motionProps}
        >
          {getCurrentValue(currentDate)}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};
