import { JourneyItem } from "@/components/calendar/display-item/journey-item";
import { JourneyDisplayItem } from "@/lib/display-item";

interface WeekViewSideItemProps {
  item: JourneyDisplayItem;
  position: {
    top: number;
    height: number;
  };
}

export function WeekViewSideItem({ item, position }: WeekViewSideItemProps) {
  "use memo";

  return <JourneyItem item={item} position={position} />;
}
