export interface Calendar {
  id: string;
  providerId: "google" | "microsoft";
  name: string;
  description?: string;
  timeZone?: string;
  primary: boolean;
  accountId: string;
  color?: string;
  readOnly: boolean;
}

export interface Attendee {
  id?: string;
  email?: string;
  name?: string;
  status: "accepted" | "tentative" | "declined" | "unknown";
  type: "required" | "optional" | "resource";
  comment?: string; // Google only
  additionalGuests?: number; // Google only
}

export type AttendeeStatus = Attendee["status"];
