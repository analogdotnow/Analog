import {
  GlobeAmericasIcon,
  GlobeAsiaAustraliaIcon,
  GlobeEuropeAfricaIcon,
} from "@heroicons/react/16/solid";

interface TimeZoneAwareGlobeIconProps {
  offset: number;
  className?: string;
}

/**
 * Globe icon component that shows the appropriate region based on timezone offset
 * @param offset - The numeric UTC offset (e.g., -5, +1, +9)
 * @param className - Optional CSS classes to apply to the icon
 */
export function TimeZoneAwareGlobeIcon({
  offset,
  className,
}: TimeZoneAwareGlobeIconProps) {
  "use memo";

  // Americas: UTC-11 to UTC-3 (Hawaii to Brazil)
  if (offset >= -11 && offset <= -3) {
    return <GlobeAmericasIcon className={className} />;
  }

  // Asia/Australia: UTC+4 to UTC+14 (Middle East to Pacific)
  if (offset >= 4 && offset <= 14) {
    return <GlobeAsiaAustraliaIcon className={className} />;
  }

  // Europe/Africa: UTC-1 to UTC+3 and edge cases
  return <GlobeEuropeAfricaIcon className={className} />;
}
