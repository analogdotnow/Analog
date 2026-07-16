interface OffsetPeriod {
  start?: number;
  value: number;
  end?: number;
}

declare const timezones: Record<
  string,
  {
    type: "canonical" | "link" | "canonical-link";
    abbreviation: string;
    name: string;
    offset: OffsetPeriod[];
    dst?: {
      abbreviation?: string;
      name?: string;
      offset: OffsetPeriod[];
    };
    location?: {
      city: string;
      country?: string;
    };
  }
>;

export default timezones;
