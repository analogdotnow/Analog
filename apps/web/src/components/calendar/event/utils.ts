interface CalculateRowDeltaOptions {
  deltaY: number;
  containerHeight: number;
  rows: number;
}

export function calculateRowOffset(options: CalculateRowDeltaOptions) {
  return Math.round((options.deltaY / options.containerHeight) * options.rows);
}

export function calculateOffsetInMinutes(deltaY: number, cellHeight: number) {
  return Math.round((deltaY / cellHeight) * 60);
}

interface CalculateColumnOffsetOptions {
  deltaX: number;
  containerWidth: number;
  columns: number;
}

export function calculateColumnOffset(options: CalculateColumnOffsetOptions) {
  return Math.round(
    (options.deltaX / options.containerWidth) * options.columns,
  );
}
