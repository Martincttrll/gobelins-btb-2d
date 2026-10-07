import { mapRange } from "../utils/math";

type Params = {
  pixelSize: number;
  minPixelSize: number;
  maxPixelSize: number;
};

export default class Canvas {
  //Canvas
  canvas = document.querySelector("canvas")!;
  ctx = this.canvas.getContext("2d")!;
  camRT = document.createElement("canvas");
  ctxRT = this.camRT.getContext("2d");

  video?: HTMLVideoElement;

  analyserBuffer?: Uint8Array;

  cols?: number;
  rows?: number;

  params: Params = {
    pixelSize: 8,
    minPixelSize: 1,
    maxPixelSize: 36,
  };

  constructor() {
    document.querySelector("body")!.appendChild(this.camRT);
  }

  render() {
    if (!this.video || !this.ctxRT) return;

    if (this.analyserBuffer) {
      // amplitude moyenne (0 → 1) autour de 128
      let sum = 0;
      for (let i = 0; i < this.analyserBuffer.length; i++) {
        sum += this.analyserBuffer[i];
      }
      const avg = sum / this.analyserBuffer.length;
      this.params.pixelSize = mapRange(
        avg,
        0,
        255,
        1,
        this.params.maxPixelSize,
      );
    }

    const size = Math.max(1, Math.round(this.params.pixelSize));
    const cols = Math.floor(window.innerWidth / size);
    const rows = Math.floor(window.innerHeight / size);
    if (cols !== this.cols || rows !== this.rows) {
      this.cols = cols;
      this.rows = rows;
      this.camRT.width = cols;
      this.camRT.height = rows;
    }

    this.ctxRT.drawImage(this.video, 0, 0, this.cols, this.rows);

    this.ctx.imageSmoothingEnabled = false;
    this.ctx.drawImage(this.camRT, 0, 0, window.innerWidth, window.innerHeight);

    //TOUT LE TRAITEMENT DANS CAM RT -> AFFICHE A LA FIN DANS LE CANVAS DE BASE

    //Convert pixel to rect (colors, size..)

    //draw result from camRT on canvas
    // this.ctx.putImageData(editedImageData, 0, 0);
  }

  // convertPixelToRandomFigure(pixels, width) {
  //   //Quel traitement appliquer a l'image en fonction du son ?
  // }

  onResize() {
    this.cols = Math.floor(window.innerWidth / this.params.pixelSize);
    this.rows = Math.floor(window.innerHeight / this.params.pixelSize);

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.camRT.width = this.cols;
    this.camRT.height = this.rows;
  }

  updatePixelSize(canvas: HTMLCanvasElement) {
    this.cols = Math.floor(window.innerWidth / this.params.pixelSize);
    this.rows = Math.floor(window.innerHeight / this.params.pixelSize);
    canvas.width = this.cols;
    canvas.height = this.rows;
  }
}
