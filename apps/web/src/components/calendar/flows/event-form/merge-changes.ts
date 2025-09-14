import { IChange, diff } from "json-diff-ts";

export function getDifferences<T>(a: T, b: T) {
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
      change.type === "ADD" &&
      (change.value === "" || change.value === undefined)
    ) {
      continue;
    }

    if (
      change.type === "REMOVE" &&
      (change.oldValue === "" || change.oldValue === undefined)
    ) {
      continue;
    }

    filtered.push(change);
  }

  return filtered;
}
