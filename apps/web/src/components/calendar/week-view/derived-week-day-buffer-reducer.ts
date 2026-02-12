import {
  deriveWeekDayBufferResult,
  deriveWeekDayBufferSnapshot,
  type DerivedWeekDayBufferInput,
  type DerivedWeekDayBufferResult,
  type DerivedWeekDayBufferSnapshot,
} from "./use-derived-week-day-buffer";

export interface DerivedWeekDayBufferState {
  snapshot: DerivedWeekDayBufferSnapshot | null;
  result: DerivedWeekDayBufferResult | null;
}

export type DerivedWeekDayBufferAction = {
  type: "derive";
  input: DerivedWeekDayBufferInput;
};

function isSameResult(
  previous: DerivedWeekDayBufferResult | null,
  next: DerivedWeekDayBufferResult,
) {
  if (!previous) {
    return false;
  }

  if (previous.snapshot !== next.snapshot) {
    return false;
  }

  if (previous.window.start !== next.window.start) {
    return false;
  }

  if (previous.window.end !== next.window.end) {
    return false;
  }

  return true;
}

export function derivedWeekDayBufferReducer(
  state: DerivedWeekDayBufferState,
  action: DerivedWeekDayBufferAction,
) {
  const snapshot = deriveWeekDayBufferSnapshot(state.snapshot, action.input);
  const result = deriveWeekDayBufferResult(snapshot, action.input);

  if (snapshot === state.snapshot && isSameResult(state.result, result)) {
    return state;
  }

  return {
    snapshot,
    result,
  };
}
