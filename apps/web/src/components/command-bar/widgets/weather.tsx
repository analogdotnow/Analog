"use client";

import * as React from "react";
import {
  CloudFogIcon,
  CloudIcon,
  CloudLightningIcon,
  CloudRainIcon,
  CloudRainWindIcon,
  CloudSunIcon,
  SnowflakeIcon,
  SunIcon,
} from "lucide-react";
import * as motion from "motion/react-client";

import {
  MorphingPopover,
  MorphingPopoverContent,
  MorphingPopoverTrigger,
} from "@/components/ui/morphing-popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { useCalendarStore } from "@/providers/calendar-store-provider";
import { Cloudy } from "./weather/cloudy";
import { toFahrenheit } from "./weather/utils";

// "clear-sky" | "few-clouds" | "scattered-clouds" | "broken-clouds" | "shower-rain" | "rain" | "thunderstorm" | "snow" | "mist"

// "thunderstorm" | "drizzle" | "rain" | "snow" | "mist" | "smoke" | "haze" | "dust" | "fog" | "sand" | "dust" | "ash" | "squall" | "tornado" | "clear" | "clouds"

export type WeatherCondition =
  | "clear-sky"
  | "few-clouds"
  | "scattered-clouds"
  | "broken-clouds"
  | "shower-rain"
  | "rain"
  | "thunderstorm"
  | "snow"
  | "mist";

export interface WeatherData {
  location: string;
  temperature: {
    current: number;
    high: number;
    low: number;
  };
  conditions:
    | "clear-sky"
    | "few-clouds"
    | "scattered-clouds"
    | "broken-clouds"
    | "shower-rain"
    | "rain"
    | "thunderstorm"
    | "snow"
    | "mist";
  forecast: {
    hourly: {
      hour: string;
      temperature: number;
      conditions:
        | "clear-sky"
        | "few-clouds"
        | "scattered-clouds"
        | "broken-clouds"
        | "shower-rain"
        | "rain"
        | "thunderstorm"
        | "snow"
        | "mist";
    }[];
  };
}

const FALLBACK_WEATHER_DATA: WeatherData = {
  location: "Groningen",
  temperature: {
    current: 22,
    high: 23,
    low: 8,
  },
  conditions: "clear-sky",
  forecast: {
    hourly: [
      {
        hour: "13",
        temperature: 22,
        conditions: "clear-sky",
      },
      {
        hour: "14",
        temperature: 23,
        conditions: "few-clouds",
      },
      {
        hour: "15",
        temperature: 22,
        conditions: "clear-sky",
      },
      {
        hour: "16",
        temperature: 21,
        conditions: "clear-sky",
      },
      {
        hour: "17",
        temperature: 19,
        conditions: "clear-sky",
      },
    ],
  },
};

const formatTemperature = (value: number, unit: "C" | "F") => {
  return `${Math.round(unit === "F" ? toFahrenheit(value) : value)}°`;
};

interface ConditionIconProps {
  condition: WeatherCondition;
  className?: string;
}

function WeatherConditionIcon({ condition, className }: ConditionIconProps) {
  switch (condition) {
    case "clear-sky":
      return (
        <SunIcon
          className={cn("size-4 fill-yellow-400 stroke-yellow-400", className)}
        />
      );
    case "few-clouds":
      return (
        <Cloudy className={cn("size-4 fill-white stroke-white", className)} />
      );
    case "scattered-clouds":
      return (
        <CloudSunIcon
          className={cn("size-4 fill-white stroke-white", className)}
        />
      );
    case "broken-clouds":
      return (
        <CloudIcon
          className={cn("size-4 fill-white stroke-white", className)}
        />
      );
    case "shower-rain":
      return (
        <CloudRainWindIcon
          className={cn("size-4 fill-white stroke-white", className)}
        />
      );
    case "rain":
      return (
        <CloudRainIcon
          className={cn("size-4 fill-white stroke-white", className)}
        />
      );
    case "thunderstorm":
      return (
        <CloudLightningIcon
          className={cn("size-4 fill-white stroke-white", className)}
        />
      );
    case "snow":
      return (
        <SnowflakeIcon
          className={cn("size-4 fill-white stroke-white", className)}
        />
      );
    case "mist":
      return (
        <CloudFogIcon
          className={cn("size-4 fill-white stroke-white", className)}
        />
      );
  }

  return null;
}

interface WeatherDisplayProps extends Omit<
  React.ComponentProps<"div">,
  "children"
> {
  data: WeatherData;
}

export function WeatherSmall({
  className,
  data,
  ...props
}: WeatherDisplayProps) {
  const unit = useCalendarStore((s) => s.temperatureUnit);

  return (
    <div
      className={cn(
        "relative flex w-fit items-center gap-x-2 rounded-md bg-linear-to-b from-[#2879C4] to-[#6E99C0] py-1.5 ps-2 pe-3 transition-colors duration-300 before:pointer-events-none before:absolute before:inset-0 before:rounded-md before:border-1 before:border-white/20 hover:from-[#2879C4]/80 hover:to-[#6E99C0]/80 hover:before:border-white/20 dark:from-[#2879C4]/40 dark:to-[#6E99C0]/40 dark:before:border-white/5 hover:dark:from-[#2879C4]/80 hover:dark:to-[#6E99C0]/80",
        className,
      )}
      {...props}
    >
      <WeatherConditionIcon condition={data.conditions} className="size-4" />
      <motion.p
        suppressHydrationWarning
        layoutId="weather-temperature"
        layout="position"
        className="text-xs font-semibold text-white"
      >
        {formatTemperature(data.temperature.current, unit)}
      </motion.p>
    </div>
  );
}

export function WeatherMedium({
  className,
  data,
  ...props
}: WeatherDisplayProps) {
  const unit = useCalendarStore((s) => s.temperatureUnit);

  return (
    <div
      className={cn(
        "relative flex w-fit items-center gap-x-2 rounded-md bg-linear-to-b from-[#2879C4] to-[#6E99C0] py-1.5 ps-2 pe-3 before:pointer-events-none before:absolute before:inset-0 before:rounded-md before:border before:border-white/20 dark:from-[#2879C4]/40 dark:to-[#6E99C0]/40 dark:before:border-white/5",
        className,
        "transition-colors duration-150 hover:from-[#2879C4]/80 hover:to-[#6E99C0]/80 hover:before:border-white/20",
      )}
      {...props}
    >
      <WeatherConditionIcon condition={data.conditions} className="size-4" />
      <div className="flex">
        {/* <div className="flex items-center gap-x-1">
          <motion.p
            layoutId="weather-location"
            layout="position"
            className="text-sm font-semibold text-white"
          >
            {data.location}
          </motion.p>
        </div> */}
        <div className="flex items-center justify-between gap-x-1">
          <motion.p
            // layoutId="weather-temperature"
            layout="position"
            suppressHydrationWarning
            className="text-xs font-semibold text-white"
          >
            {formatTemperature(data.temperature.current, unit)}
          </motion.p>
          <p className="flex items-center gap-x-1">
            <motion.span
              // layoutId="weather-high"
              layout="position"
              suppressHydrationWarning
              className="line-clamp-1 text-xs font-medium text-white/80"
            >
              H:{formatTemperature(data.temperature.high, unit)}
            </motion.span>
            <motion.span
              // layoutId="weather-low"
              layout="position"
              suppressHydrationWarning
              className="line-clamp-1 text-xs font-medium text-white/80"
            >
              L:{formatTemperature(data.temperature.low, unit)}
            </motion.span>
          </p>
        </div>
      </div>
    </div>
  );
}

function WeatherUnitToggle() {
  const unit = useCalendarStore((s) => s.temperatureUnit);
  const setUnit = useCalendarStore((s) => s.setTemperatureUnit);

  const toggleUnit = React.useCallback(
    (nextUnit: string) => {
      setUnit(nextUnit as "C" | "F");
    },
    [setUnit],
  );

  return (
    <ToggleGroup
      value={[unit]}
      onValueChange={(value: string[]) => toggleUnit(value[0]!)}
    >
      <ToggleGroupItem value="C">C</ToggleGroupItem>
      <ToggleGroupItem value="F">F</ToggleGroupItem>
    </ToggleGroup>
  );
}

export function WeatherLarge({
  className,
  data,
  ...props
}: WeatherDisplayProps) {
  const forecastItems = data.forecast.hourly.slice(0, 8);
  const unit = useCalendarStore((s) => s.temperatureUnit);

  return (
    <div
      className={cn(
        "relative flex w-fit min-w-36 flex-col items-start gap-4 rounded-xl bg-linear-to-b from-[#2879C4] to-[#6E99C0] px-4 py-4 before:pointer-events-none before:absolute before:inset-0 before:rounded-xl before:border-2 before:border-white/20 dark:from-[#2879C4]/40 dark:to-[#6E99C0]/40 dark:before:border-white/5",
        className,
      )}
      {...props}
    >
      <div className="flex w-full items-stretch justify-between gap-x-2">
        <div className="flex flex-col items-start justify-between gap-x-4">
          {/* <NavigationIcon className="size-2.5 fill-white stroke-white" /> */}
          <motion.p
            layoutId="weather-location"
            layout="position"
            className="text-lg font-semibold text-white"
          >
            {data.location}
          </motion.p>
          <motion.p
            layoutId="weather-temperature"
            layout="position"
            suppressHydrationWarning
            className="text-3xl font-medium text-white"
          >
            {formatTemperature(data.temperature.current, unit)}
          </motion.p>
        </div>

        <div className="flex flex-col items-end justify-between gap-y-1">
          <WeatherConditionIcon
            condition={data.conditions}
            className="size-8"
          />
          <p className="flex items-center gap-x-1">
            <motion.span
              layoutId="weather-high"
              layout="position"
              suppressHydrationWarning
              className="pb-0.75 text-xs font-medium text-white/80"
            >
              H: {formatTemperature(data.temperature.high, unit)}
            </motion.span>
            <motion.span
              layoutId="weather-low"
              layout="position"
              suppressHydrationWarning
              className="pb-0.75 text-xs font-medium text-white/80"
            >
              L: {formatTemperature(data.temperature.low, unit)}
            </motion.span>
          </p>
        </div>
      </div>
      <div className="flex w-full items-center justify-between gap-x-4">
        {forecastItems.map((forecast) => (
          <div
            key={forecast.hour}
            className="flex flex-col items-center gap-y-1"
          >
            <p className="text-xs font-medium text-white/80">{forecast.hour}</p>
            <WeatherConditionIcon
              condition={forecast.conditions}
              className="size-4"
            />
            <p
              className="text-xs font-medium text-white"
              suppressHydrationWarning
            >
              {formatTemperature(forecast.temperature, unit)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

interface WeatherProps extends Omit<React.ComponentProps<"div">, "children"> {
  variant?: "small" | "medium" | "large";
  data?: WeatherData;
}

export function Weather({
  className,
  variant = "medium",
  data = FALLBACK_WEATHER_DATA,
  ...props
}: WeatherProps) {
  if (variant === "small") {
    return (
      <WeatherSmall
        className={cn("select-none", className)}
        data={data}
        {...props}
      />
    );
  }

  if (variant === "medium") {
    return (
      <WeatherMedium
        className={cn("select-none", className)}
        data={data}
        {...props}
      />
    );
  }

  return (
    <WeatherLarge
      className={cn("select-none", className)}
      data={data}
      {...props}
    />
  );
}

export function Weather2({
  className,
  variant = "medium",
  data,
  ...props
}: WeatherProps) {
  const [open, setOpen] = React.useState(false);

  const weatherData = data ?? FALLBACK_WEATHER_DATA;

  if (variant === "large") {
    return (
      <WeatherLarge
        className={cn("select-none", className)}
        data={weatherData}
        {...props}
      />
    );
  }

  return (
    <MorphingPopover open={open} onOpenChange={setOpen} className={className}>
      <MorphingPopoverTrigger>
        {variant === "small" ? (
          <WeatherSmall className="select-none" data={weatherData} />
        ) : (
          <WeatherMedium className="select-none" data={weatherData} />
        )}
      </MorphingPopoverTrigger>
      <MorphingPopoverContent className="z-50 rounded-xl border-none p-0">
        <WeatherLarge data={weatherData} />
      </MorphingPopoverContent>
    </MorphingPopover>
  );
}
