import { Temporal } from "temporal-polyfill";

import {
  DisplayItem,
  JourneyDisplayItem,
  LocationDisplayItem,
  TaskDisplayItem,
  createJourneyDisplayItem,
  createLocationDisplayItem,
  createTaskDisplayItem,
} from "@/lib/display-item";

interface GenerateMockTasksOptions {
  startDate: Temporal.PlainDate;
  timeZone: string;
  count?: number;
}

export function generateMockTasks({
  startDate,
  timeZone,
  count = 3,
}: GenerateMockTasksOptions): TaskDisplayItem[] {
  const tasks: TaskDisplayItem[] = [];

  const taskTemplates = [
    {
      title: "Review PR #123",
      allDay: false,
      offsetHours: 10,
      durationHours: 1,
    },
    {
      title: "Team standup",
      allDay: false,
      offsetHours: 9,
      durationHours: 0.5,
    },
    {
      title: "Deploy to staging",
      allDay: true,
      offsetHours: 0,
      durationHours: 24,
    },
    {
      title: "Write documentation",
      allDay: false,
      offsetHours: 14,
      durationHours: 2,
    },
    { title: "Code review", allDay: false, offsetHours: 15, durationHours: 1 },
  ];

  for (let i = 0; i < count; i++) {
    const template = taskTemplates[i % taskTemplates.length]!;
    const dayOffset = Math.floor(i / taskTemplates.length);
    const taskDate = startDate.add({ days: dayOffset });

    const start = template.allDay
      ? Temporal.ZonedDateTime.from({
          year: taskDate.year,
          month: taskDate.month,
          day: taskDate.day,
          hour: 0,
          minute: 0,
          timeZone,
        })
      : Temporal.ZonedDateTime.from({
          year: taskDate.year,
          month: taskDate.month,
          day: taskDate.day,
          hour: template.offsetHours,
          minute: 0,
          timeZone,
        });

    const end = start.add({ hours: template.durationHours });

    tasks.push(
      createTaskDisplayItem(
        `mock-task-${i}`,
        template.title,
        template.allDay,
        start,
        end,
      ),
    );
  }

  return tasks;
}

interface GenerateMockLocationsOptions {
  startDate: Temporal.PlainDate;
  timeZone: string;
  count?: number;
}

export function generateMockLocations({
  startDate,
  timeZone,
  count = 2,
}: GenerateMockLocationsOptions): LocationDisplayItem[] {
  const locations: LocationDisplayItem[] = [];

  const locationTemplates = [
    { name: "Office", offsetHours: 9, durationHours: 8 },
    { name: "Coffee shop", offsetHours: 14, durationHours: 2 },
    { name: "Home", offsetHours: 17, durationHours: 5 },
  ];

  for (let i = 0; i < count; i++) {
    const template = locationTemplates[i % locationTemplates.length]!;
    const dayOffset = Math.floor(i / locationTemplates.length);
    const locationDate = startDate.add({ days: dayOffset });

    const start = Temporal.ZonedDateTime.from({
      year: locationDate.year,
      month: locationDate.month,
      day: locationDate.day,
      hour: template.offsetHours,
      minute: 0,
      timeZone,
    });

    const end = start.add({ hours: template.durationHours });

    locations.push(
      createLocationDisplayItem(
        `mock-location-${i}`,
        { name: template.name },
        start,
        end,
      ),
    );
  }

  return locations;
}

interface GenerateMockJourneysOptions {
  startDate: Temporal.PlainDate;
  timeZone: string;
  count?: number;
}

export function generateMockJourneys({
  startDate,
  timeZone,
  count = 1,
}: GenerateMockJourneysOptions): JourneyDisplayItem[] {
  const journeys: JourneyDisplayItem[] = [];

  const journeyTemplates = [
    { from: "Home", to: "Office", offsetHours: 8, durationMinutes: 45 },
    { from: "Office", to: "Coffee shop", offsetHours: 13, durationMinutes: 15 },
    { from: "Office", to: "Home", offsetHours: 17, durationMinutes: 45 },
  ];

  for (let i = 0; i < count; i++) {
    const template = journeyTemplates[i % journeyTemplates.length]!;
    const dayOffset = Math.floor(i / journeyTemplates.length);
    const journeyDate = startDate.add({ days: dayOffset });

    const start = Temporal.ZonedDateTime.from({
      year: journeyDate.year,
      month: journeyDate.month,
      day: journeyDate.day,
      hour: template.offsetHours,
      minute: 0,
      timeZone,
    });

    const end = start.add({ minutes: template.durationMinutes });

    journeys.push(
      createJourneyDisplayItem(
        `mock-journey-${i}`,
        { from: template.from, to: template.to },
        start,
        end,
      ),
    );
  }

  return journeys;
}

interface GenerateMockDisplayItemsOptions {
  startDate: Temporal.PlainDate;
  timeZone: string;
  taskCount?: number;
  locationCount?: number;
  journeyCount?: number;
}

export function generateMockDisplayItems({
  startDate,
  timeZone,
  taskCount = 3,
  locationCount = 0,
  journeyCount = 0,
}: GenerateMockDisplayItemsOptions): DisplayItem[] {
  const items: DisplayItem[] = [];

  items.push(...generateMockTasks({ startDate, timeZone, count: taskCount }));
  items.push(
    ...generateMockLocations({ startDate, timeZone, count: locationCount }),
  );
  items.push(
    ...generateMockJourneys({ startDate, timeZone, count: journeyCount }),
  );

  return items;
}
