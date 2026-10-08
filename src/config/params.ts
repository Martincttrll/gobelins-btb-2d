export type Params = {
  maxPixelSize: number;
  preset: number;
  applyPixelSizeUpdate: boolean;
  blendingThresholdDiff: number;
  blendingThresholdColorDodge: number;
};

export const params: Params = {
  maxPixelSize: 36,
  preset: 1,
  applyPixelSizeUpdate: true,
  blendingThresholdDiff: 10,
  blendingThresholdColorDodge: 80,
};
