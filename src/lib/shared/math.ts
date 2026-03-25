export const roundTo2 = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export const clampAtLeastZero = (value: number): number =>
  Number.isFinite(value) ? Math.max(0, value) : 0;
