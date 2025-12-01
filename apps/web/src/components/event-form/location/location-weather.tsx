import { Weather } from "@/components/command-bar/widgets/weather";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface LocationWeatherProps {
  location: string;
  disabled?: boolean;
}

export function LocationWeather({ location, disabled }: LocationWeatherProps) {
  if (!location) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger render={<Weather variant="small" />} />
      <PopoverContent></PopoverContent>
    </Popover>
  );
}
