import * as R from "remeda";

export function insertIntoSorted<T>(
  array: T[],
  item: T,
  predicate: (value: T, index: number, data: readonly T[]) => boolean,
) {
  const index = R.sortedIndexWith(array, predicate);
  return [...array.slice(0, index), item, ...array.slice(index)];
}
