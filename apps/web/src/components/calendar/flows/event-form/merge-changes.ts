import { IChange, applyChangeset, diff } from "json-diff-ts";

import type { FormValues } from "@/components/event-form/utils/schema";
import type { CalendarEvent } from "@/lib/interfaces";

function safeDiff(a: unknown, b: unknown) {
  const changes = diff(a, b);
  const filtered: IChange[] = [];

  for (const change of changes) {
    if (
      change.type === "UPDATE" &&
      JSON.stringify(change.value) === JSON.stringify(change.oldValue)
    ) {
      continue;
    }

    if (
      (change.type === "ADD" && change.value === "") ||
      change.value === undefined
    ) {
      continue;
    }

    if (
      (change.type === "REMOVE" && change.oldValue === "") ||
      change.oldValue === undefined
    ) {
      continue;
    }

    filtered.push(change);
  }

  return filtered;
}

export function compareFormValues(a: FormValues, b: FormValues) {
  console.log(a.title, b.title);
  return safeDiff(a, b);
}

export function compareEvents(a: CalendarEvent, b: CalendarEvent) {
  const isLatest =
    (a.updatedAt?.epochMilliseconds ?? 0) >
    (b.updatedAt?.epochMilliseconds ?? 0);

  const changes = safeDiff(a, b);

  console.log("changes", isLatest, a.title, b.title);

  if (!isLatest) {
    return changes;
  }

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

  console.log("FUCK YOU");
  console.log("result", JSON.stringify(result, null, 2));

  if (result.length === 0) {
    // return {
    //   values: options.update.values,
    // };
  }

  console.log("options.form.defaultValues", options.form.defaultValues.title, options.form.values.title);
  const a = compareFormValues(
    options.form.defaultValues,
    options.update.values,
  );
  const b = compareFormValues(
    options.form.defaultValues,
    options.form.values,
  );

  console.log("a changeset", JSON.stringify(a, null, 2));
  console.log("b changeset", JSON.stringify(b, null, 2));

  // Form not modified, replace with new event
  if (a.length === 0) {
    return {
      values: options.update.values,
      state: "default" as const,
    };
  }

  const formResult = mergeFormValues({
    form: {
      values: options.form.values,
      changeset: a,
    },
    update: {
      values: options.update.values,
    },
  });

  console.log("formResult", JSON.stringify(formResult, null, 2));

  return {
    values: formResult.values,
    state: "updated" as const,
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

  // if (changes.length === 0) {
  //   console.log("changes", changes);
  //   return {
  //     values: options.update.values,
  //   };
  // }

  const conflicts = detectConflicts(options.form.changeset, changes);

  // if (conflicts.length > 0) {
  //   console.log("conflicts", conflicts);
  //   return {
  //     values: options.update.values,
  //   };
  // }

  return {
    values: applyChangeset(options.form.values, options.form.changeset) as FormValues,
    changes,
  };
}

function detectConflicts(a: IChange[], b: IChange[]) {
  for (const change of a) {
    if (b.some((c) => c.key === change.key)) {
      return [change.key];
    }
  }
  return [];
}
