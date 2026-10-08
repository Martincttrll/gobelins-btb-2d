export type Params = {
  maxPixelSize: number;
  fftSize: number;
  preset: number;
  applyPixelSizeUpdate: boolean;
};

export const params: Params = {
  maxPixelSize: 36,
  fftSize: 1024,
  preset: 1,
  applyPixelSizeUpdate: true,
};
