import { Pane } from "tweakpane";
import { params } from "../config/params";

export class GUIManager {
  pane = new Pane();
  params = params;
  constructor() {
    this.createPane();
  }

  createPane() {
    this.pane.addBinding(this.params, "maxPixelSize", {
      step: 1,
      min: 4,
      max: 128,
    });
    this.pane.addBinding(this.params, "fftSize", {
      options: {
        "32": 32,
        "64": 64,
        "128": 128,
        "256": 256,
        "512": 512,
        "1024": 1024,
        "2048": 2048,
        "4096": 4096,
        "8192": 8192,
        "16384": 16384,
        "32768": 32768,
      },
    });
  }
}
