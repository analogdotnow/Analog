import { IChange, applyChangeset, diff } from "json-diff-ts";

import { CalendarSettings } from "@/atoms/calendar-settings";
import { FormValues } from "@/components/event-form/utils/schema";
import {
  parseCalendarEvent,
  parseDraftEvent,
} from "@/components/event-form/utils/transform/input";
import { Calendar, CalendarEvent } from "@/lib/interfaces";
import { isDraftEvent } from "@/lib/utils/calendar";

export function compareFormValues(a: FormValues, b: FormValues) {
  const changes = diff(a, b);
  const filtered: IChange[] = [];

  for (const change of changes) {
    if (change.type === "UPDATE") {
      continue;
    }

    if (
      change.type === "ADD" &&
      change.value === "" &&
      change.oldValue === undefined
    ) {
      continue;
    }

    if (change.type === "REMOVE" && change.oldValue === "") {
      continue;
    }

    filtered.push(change);
  }

  return filtered;
}

export function compareEvents(a: CalendarEvent, b: CalendarEvent) {
  const isLatest =
    (a.updatedAt?.epochMilliseconds ?? 0) >
    (b.updatedAt?.epochMilliseconds ?? 0);
  if (!isLatest) {
    console.log("not latest");
    return [];
  }

  console.log("latest");

  const changes = diff(a, b);

  return changes;
}

interface MergeChangesOptions {
  form: {
    defaultValues: FormValues;
    values: FormValues;
    event: CalendarEvent;
  };
  update: {
    event: CalendarEvent;
    values: FormValues;
  };
}

export function mergeChanges(options: MergeChangesOptions) {
  const result = compareEvents(options.form.event, options.update.event);

  if (result.length === 0) {
    return {
      values: undefined,
    };
  }

  const formChangeset = compareFormValues(
    options.form.defaultValues,
    options.form.values,
  );

  // Form not modified, replace with new event
  if (formChangeset.length === 0) {
    return {
      values: undefined,
    };
  }

  const formResult = mergeFormValues({
    form: {
      values: options.form.values,
      changeset: formChangeset,
    },
    update: {
      values: options.update.values,
    },
  });

  return {
    values: formResult.values,
  };
}

interface MergeFormValuesOptions {
  form: {
    values: FormValues;
    changeset: IChange[];
  };
  update: {
    values: FormValues;
  };
}

function mergeFormValues(options: MergeFormValuesOptions) {
  const changes = diff(options.form.values, options.update.values);

  console.log("changes", JSON.stringify(changes, null, 2));
  if (changes.length === 0) {
    return {
      values: options.update.values,
    };
  }

  const conflicts = detectConflicts(options.form.changeset, changes);

  console.log("conflicts", JSON.stringify(conflicts, null, 2));
  if (conflicts.length > 0) {
    return {
      values: options.update.values,
    };
  }

  return {
    values: applyChangeset(options.form.values, changes) as FormValues,
    changes,
  };
}

function detectConflicts(a: IChange[], b: IChange[]) {
  return a
    .filter((change) => b.some((c) => c.key === change.key))
    .map((change) => change.key);
}
