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
    this.pane
      .addBinding(this.params, "preset", {
        options: {
          "1": 1,
          "2": 2,
          "3": 3,
        },
      })
      .on("change", (e) => {
        console.log(e);
      });

    const folderP1 = this.pane.addFolder({
      title: "Preset 1",
    });

    folderP1.addBinding(this.params, "blendingThresholdDiff", {
      step: 1,
      min: 1,
      max: 100,
    });
    folderP1.addBinding(this.params, "blendingThresholdColorDodge", {
      step: 1,
      min: 1,
      max: 100,
    });
    this.pane.addBinding(this.params, "applyPixelSizeUpdate");
  }
}
