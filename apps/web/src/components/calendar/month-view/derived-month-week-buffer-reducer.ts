import {
  deriveMonthWeekBufferResult,
  deriveMonthWeekBufferSnapshot,
  type DerivedMonthWeekBufferInput,
  type DerivedMonthWeekBufferResult,
  type DerivedMonthWeekBufferSnapshot,
} from "./use-derived-month-week-buffer";

export interface DerivedMonthWeekBufferState {
  snapshot: DerivedMonthWeekBufferSnapshot | null;
  result: DerivedMonthWeekBufferResult | null;
}

export type DerivedMonthWeekBufferAction = {
  type: "derive";
  input: DerivedMonthWeekBufferInput;
};

function isSameResult(
  previous: DerivedMonthWeekBufferResult | null,
  next: DerivedMonthWeekBufferResult,
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

export function derivedMonthWeekBufferReducer(
  state: DerivedMonthWeekBufferState,
  action: DerivedMonthWeekBufferAction,
) {
  const snapshot = deriveMonthWeekBufferSnapshot(state.snapshot, action.input);
  const result = deriveMonthWeekBufferResult(snapshot, action.input);

  if (snapshot === state.snapshot && isSameResult(state.result, result)) {
    return state;
  }

  return {
    snapshot,
    result,
  };
}
