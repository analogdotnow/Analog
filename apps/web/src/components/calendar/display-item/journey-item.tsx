"use memo";

import {
  Bike,
  Car,
  Footprints,
  Package,
  Plane,
  Ship,
  Train,
} from "lucide-react";

import type { JourneyDisplayItem, JourneyMode } from "@/lib/display-item";
import { cn } from "@/lib/utils";
import {
  AugmentedItem,
  AugmentedItemContent,
  AugmentedItemHeader,
  AugmentedItemTitle,
} from "./augmented-item";

interface JourneyModeIconProps {
  className?: string;
  mode?: JourneyMode;
}

function JourneyModeIcon({ className, mode }: JourneyModeIconProps) {
  switch (mode) {
    case "driving":
      return <Car className={cn(className)} strokeWidth={2.5} />;
    case "transit":
    case "train":
      return <Train className={cn(className)} strokeWidth={2.5} />;
    case "walking":
      return <Footprints className={cn(className)} strokeWidth={2.5} />;
    case "cycling":
      return <Bike className={cn(className)} strokeWidth={2.5} />;
    case "flight":
      return <Plane className={cn(className)} strokeWidth={2.5} />;
    case "ferry":
      return <Ship className={cn(className)} strokeWidth={2.5} />;
    default:
      return <Package className={cn(className)} strokeWidth={2.5} />;
  }
}

interface JourneyItemProps extends React.ComponentProps<"div"> {
  item: JourneyDisplayItem;
  position: {
    top: number;
    height: number;
  };
}

export function JourneyItem({ item, position, ...props }: JourneyItemProps) {
  "use memo";

  return (
    <AugmentedItem
      role="button"
      className="group absolute left-0.5 z-20 [--item-color:var(--journey)] [--item-stripe-color:var(--journey-stripe)]"
      style={{
        top: `${position.top}px`,
        height: `${position.height}px`,
      }}
      {...props}
    >
      <AugmentedItemHeader>
        <JourneyModeIcon
          className="size-3.5 text-journey/80 transition-colors duration-100 group-hover:text-white"
          mode={item.value.mode}
        />
      </AugmentedItemHeader>
      <AugmentedItemContent className="size-4 shrink-0 rounded-full" />
      <AugmentedItemTitle>
        Journey from {item.value.from} to {item.value.to}
      </AugmentedItemTitle>
    </AugmentedItem>
  );
}
