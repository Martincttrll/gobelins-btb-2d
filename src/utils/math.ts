export const mapRange = (
  value: number,
  oldMin: number,
  oldMax: number,
  newMin: number,
  newMax: number,
): number =>
  ((value - oldMin) / (oldMax - oldMin)) * (newMax - newMin) + newMin;