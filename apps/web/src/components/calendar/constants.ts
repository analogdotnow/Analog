const EVENT_HEIGHT = 24;

// Vertical gap between events in pixels - controls spacing in month view
const EVENT_GAP = 4;

const AGENDA_DAYS_TO_DISPLAY = 30;

const HOURS_IN_DAY = 24;
const MINUTES_IN_HOUR = 60;
const TOTAL_MINUTES_IN_DAY = HOURS_IN_DAY * MINUTES_IN_HOUR;

const TIME_INTERVALS = {
  SNAP_THRESHOLD: 7.5,
  DEFAULT_EVENT_DURATION_HOURS: 1,
} as const;

export {
  EVENT_HEIGHT,
  EVENT_GAP,
  AGENDA_DAYS_TO_DISPLAY,
  MINUTES_IN_HOUR,
  TOTAL_MINUTES_IN_DAY,
  TIME_INTERVALS,
};
