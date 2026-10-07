import { Pane } from "tweakpane";

type Params = {
  pixelSize: number;
  maxPixelSize: number;
};

export class GUIManager {
  params: Params;
  pane = new Pane();
  constructor(params: Params) {
    this.params = params;
    this.createPane();
  }

  createPane() {
    this.pane.addBinding(this.params, "pixelSize", {
      step: 1,
      min: 1,
      max: this.params.maxPixelSize,
    });
    this.pane.addBinding(this.params, "maxPixelSize", {
      step: 1,
      min: 4,
      max: 128,
    });
  }
}
