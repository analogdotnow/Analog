/**
 * Min-max heap for double-ended priority queue operations.
 * O(log n) push/pop for min or max, O(1) peek for min or max.
 */
export class MinMaxHeap<T> {
  private items: T[] = [];

  constructor(private compare: (a: T, b: T) => number) {}

  get size() {
    return this.items.length;
  }

  peekMin() {
    return this.items[0];
  }

  peekMax() {
    if (this.items.length === 0) {
      return undefined;
    }

    if (this.items.length === 1) {
      return this.items[0];
    }

    if (this.items.length === 2) {
      return this.items[1];
    }

    return this.compare(this.items[1]!, this.items[2]!) > 0
      ? this.items[1]
      : this.items[2];
  }

  push(item: T) {
    this.items.push(item);
    this.bubbleUp(this.items.length - 1);
  }

  popMin() {
    if (this.items.length === 0) {
      return undefined;
    }

    if (this.items.length === 1) {
      return this.items.pop();
    }

    const min = this.items[0];
    const last = this.items.pop()!;

    this.items[0] = last;
    this.trickleDown(0);

    return min;
  }

  popMax() {
    if (this.items.length === 0) {
      return undefined;
    }

    if (this.items.length === 1) {
      return this.items.pop();
    }

    let maxIndex = 1;

    if (
      this.items.length > 2 &&
      this.compare(this.items[2]!, this.items[1]!) > 0
    ) {
      maxIndex = 2;
    }

    const max = this.items[maxIndex]!;
    const last = this.items.pop()!;

    if (maxIndex < this.items.length) {
      this.items[maxIndex] = last;
      this.trickleDown(maxIndex);
    }

    return max;
  }

  toArray() {
    return [...this.items];
  }

  private bubbleUp(index: number) {
    if (index === 0) {
      return;
    }

    const parent = this.parentIndex(index);

    if (this.isMinLevel(index)) {
      if (this.compare(this.items[index]!, this.items[parent]!) > 0) {
        this.swap(index, parent);
        this.bubbleUpMax(parent);
      } else {
        this.bubbleUpMin(index);
      }
    } else {
      if (this.compare(this.items[index]!, this.items[parent]!) < 0) {
        this.swap(index, parent);
        this.bubbleUpMin(parent);
      } else {
        this.bubbleUpMax(index);
      }
    }
  }

  private bubbleUpMin(index: number) {
    let current = index;

    while (true) {
      const grandparent = this.grandparentIndex(current);

      if (grandparent < 0) {
        break;
      }

      if (this.compare(this.items[current]!, this.items[grandparent]!) < 0) {
        this.swap(current, grandparent);
        current = grandparent;
        continue;
      }

      break;
    }
  }

  private bubbleUpMax(index: number) {
    let current = index;

    while (true) {
      const grandparent = this.grandparentIndex(current);

      if (grandparent < 0) {
        break;
      }

      if (this.compare(this.items[current]!, this.items[grandparent]!) > 0) {
        this.swap(current, grandparent);
        current = grandparent;
        continue;
      }

      break;
    }
  }

  private trickleDown(index: number) {
    if (this.isMinLevel(index)) {
      this.trickleDownMin(index);
    } else {
      this.trickleDownMax(index);
    }
  }

  private trickleDownMin(index: number) {
    let current = index;

    while (true) {
      const candidate = this.minDescendantIndex(current);

      if (candidate < 0) {
        break;
      }

      if (this.isGrandchild(current, candidate)) {
        if (this.compare(this.items[candidate]!, this.items[current]!) < 0) {
          this.swap(candidate, current);
          const parent = this.parentIndex(candidate);

          if (this.compare(this.items[candidate]!, this.items[parent]!) > 0) {
            this.swap(candidate, parent);
          }

          current = candidate;
          continue;
        }
      } else {
        if (this.compare(this.items[candidate]!, this.items[current]!) < 0) {
          this.swap(candidate, current);
        }
      }

      break;
    }
  }

  private trickleDownMax(index: number) {
    let current = index;

    while (true) {
      const candidate = this.maxDescendantIndex(current);

      if (candidate < 0) {
        break;
      }

      if (this.isGrandchild(current, candidate)) {
        if (this.compare(this.items[candidate]!, this.items[current]!) > 0) {
          this.swap(candidate, current);
          const parent = this.parentIndex(candidate);

          if (this.compare(this.items[candidate]!, this.items[parent]!) < 0) {
            this.swap(candidate, parent);
          }

          current = candidate;
          continue;
        }
      } else {
        if (this.compare(this.items[candidate]!, this.items[current]!) > 0) {
          this.swap(candidate, current);
        }
      }

      break;
    }
  }

  private minDescendantIndex(index: number) {
    return this.bestDescendantIndex(index, (a, b) => a < b);
  }

  private maxDescendantIndex(index: number) {
    return this.bestDescendantIndex(index, (a, b) => a > b);
  }

  private bestDescendantIndex(
    index: number,
    better: (value: number, best: number) => boolean,
  ) {
    const length = this.items.length;
    const candidates: number[] = [];
    const left = 2 * index + 1;
    const right = left + 1;

    if (left < length) {
      candidates.push(left);
    }

    if (right < length) {
      candidates.push(right);
    }

    const firstGrandchild = 4 * index + 3;

    for (let offset = 0; offset < 4; offset += 1) {
      const child = firstGrandchild + offset;

      if (child < length) {
        candidates.push(child);
      }
    }

    if (candidates.length === 0) {
      return -1;
    }

    let best = candidates[0]!;

    for (let i = 1; i < candidates.length; i += 1) {
      const candidate = candidates[i]!;
      const comparison = this.compare(
        this.items[candidate]!,
        this.items[best]!,
      );

      if (better(comparison, 0)) {
        best = candidate;
      }
    }

    return best;
  }

  private isMinLevel(index: number) {
    const level = Math.floor(Math.log2(index + 1));
    return level % 2 === 0;
  }

  private parentIndex(index: number) {
    return (index - 1) >> 1;
  }

  private grandparentIndex(index: number) {
    const parent = this.parentIndex(index);

    if (parent <= 0) {
      return -1;
    }

    return this.parentIndex(parent);
  }

  private isGrandchild(ancestor: number, index: number) {
    const parent = this.parentIndex(index);

    if (parent < 0) {
      return false;
    }

    const grandparent = this.parentIndex(parent);

    return grandparent === ancestor;
  }

  private swap(left: number, right: number) {
    [this.items[left], this.items[right]] = [
      this.items[right]!,
      this.items[left]!,
    ];
  }
}
