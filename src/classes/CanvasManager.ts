import { mapRange } from "../utils/math";
import { params } from "../config/params";
export default class Canvas {
  params = params;

  lastPreset = 1;
  //Canvas
  canvas = document.querySelector("canvas")!;
  ctx = this.canvas.getContext("2d")!;
  camRT = document.createElement("canvas");
  ctxRT = this.camRT.getContext("2d");

  video?: HTMLVideoElement;

  analyserBuffer?: Uint8Array;

  cols?: number;
  rows?: number;

  pixelSize = 1;

  lastAvg?: number;
  lastPointerX?: number;
  lastPointerY?: number;

  pointerX = 0;
  pointerY = 0;
  easedPointerX = 0;
  easedPointerY = 0;

  delta?: number;
  elapsed?: number;

  logged = false;

  updatedPixels: Array<Array<number>> = [];

  constructor() {
    document.querySelector("body")!.appendChild(this.camRT);
    this.addEventListeners();
  }

  render() {
    if (!this.video || !this.ctxRT || !this.analyserBuffer) return;

    if (this.params.preset != 1) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctxRT.clearRect(0, 0, this.camRT.width, this.camRT.height);
    }

    //Reset on preset change
    if (this.lastPreset != this.params.preset) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctxRT.clearRect(0, 0, this.camRT.width, this.camRT.height);
      this.ctx.globalCompositeOperation = "source-over";
      this.ctxRT.globalCompositeOperation = "source-over";
      this.canvas.style.filter = "invert(0)";
      this.lastPreset = this.params.preset;
      console.log("CLEAR");
    }

    let sum = 0;
    for (let i = 0; i < this.analyserBuffer.length; i++) {
      sum += this.analyserBuffer[i];
    }

    //Pixel size
    const avg = sum / this.analyserBuffer.length;
    this.params.applyPixelSizeUpdate
      ? (this.pixelSize = mapRange(avg, 0, 255, 1, this.params.maxPixelSize))
      : (this.pixelSize = 1);

    const size =
      this.params.preset === 1 ? Math.max(1, Math.round(this.pixelSize)) : 16;
    const cols = Math.floor(window.innerWidth / size);
    const rows = Math.floor(window.innerHeight / size);
    if (cols !== this.cols || rows !== this.rows) {
      this.cols = cols;
      this.rows = rows;
      this.camRT.width = cols;
      this.camRT.height = rows;
    }

    //Ratio video
    if (this.cols && this.rows) {
      const videoRatio = this.video?.videoWidth / this.video?.videoHeight;
      const targetRatio = this.cols / this.rows;

      let sh, sw, sx, sy;
      if (videoRatio > targetRatio) {
        sh = this.video.videoHeight;
        sw = this.video.videoHeight * targetRatio;
        sx = (this.video.videoWidth - sw) / 2;
        sy = 0;
      } else {
        sw = this.video.videoWidth;
        sh = this.video.videoWidth / targetRatio;
        sx = 0;
        sy = (this.video.videoHeight - sh) / 2;
      }

      this.ctxRT.drawImage(
        this.video,
        sx,
        sy,
        sw,
        sh,
        0,
        0,
        this.cols,
        this.rows,
      );
    }

    ///FONCTION A UPDATE AU GUI -> appel meme fonction dans la render() pour eviter branching
    switch (this.params.preset) {
      case 1:
        this.applyPreset1(avg);
        break;
      case 2:
        this.applyPreset2(avg);
        break;
      default:
        console.log("no preset detected");
    }

    this.ctx.imageSmoothingEnabled = false;
    this.ctx.drawImage(this.camRT, 0, 0, window.innerWidth, window.innerHeight);
  }

  applyPreset1(avg: number) {
    if (avg < 30) {
      this.ctxRT!.globalCompositeOperation = "source-over";
    }
    if (avg < 70) {
      this.canvas.style.filter = "invert(0)";
    }
    if (avg > this.params.blendingThresholdDiff) {
      this.ctx.globalCompositeOperation = "difference";
    }
    if (avg > this.params.blendingThresholdColorDodge) {
      this.ctx.globalCompositeOperation = "color-dodge";
      this.canvas.style.filter = "invert(1)";
    }

    if (avg > 40) {
      const rRatio = this.params.applyPixelSizeUpdate ? 5 : 0.8;
      const x = Math.floor(Math.random() * this.cols!);
      const y = Math.floor(Math.random() * this.rows!);
      const r = Math.floor(Math.random() * (avg / rRatio));

      const gradient = this.ctxRT!.createLinearGradient(0, 0, 200, 0);
      gradient.addColorStop(0, "purple");
      gradient.addColorStop(1, "white");
      this.ctxRT!.fillStyle = gradient;

      this.ctxRT!.beginPath();
      this.ctxRT!.arc(x, y, r, 0, Math.PI * 2);
      this.ctxRT!.fill();
    }
  }

  applyPreset2(avg: number) {
    if (!this.delta || !this.elapsed) return;
    this.ctxRT!.globalCompositeOperation = "source-over";
    this.ctx!.globalCompositeOperation = "source-over";
    this.canvas.style.filter = "invert(0)";

    const imageData = this.ctxRT!.getImageData(0, 0, this.cols!, this.rows!);
    this.easedPointerX +=
      (this.pointerX - this.easedPointerX) * Math.min(1, this.delta * 0.01);
    this.easedPointerY +=
      (this.pointerY - this.easedPointerY) * Math.min(1, this.delta * 0.01);

    const pixels = imageData.data;

    if (avg > 70) {
      for (let i = 0; i < avg / 6; i++) {
        const index = Math.floor((Math.random() * pixels.length) / 4) * 4;

        const r = pixels[index];
        const g = pixels[index + 1];
        const b = pixels[index + 2];
        const a = pixels[index + 3];

        const pixelBirthDate = this.elapsed + Math.random() * 1000;

        this.updatedPixels.push([
          index,
          r,
          g,
          b,
          a,
          pixelBirthDate,
          Math.random() * 255,
          Math.random() * 255,
          Math.random() * 255,
        ]);
      }
    }

    this.updatedPixels.forEach((newPixel) => {
      if (newPixel[5] < this.elapsed! - 1000) return;
      if (
        this.easedPointerX === (newPixel[0] * 16) % this.cols! &&
        this.easedPointerY === (newPixel[0] % this.cols!) * 16
      )
        return;

      if (this.params.randomizePixelColor) {
        imageData.data[newPixel[0]] = newPixel[6];
        imageData.data[newPixel[0] + 1] = newPixel[7];
        imageData.data[newPixel[0] + 2] = newPixel[8];
        imageData.data[newPixel[0] + 3] = 255;
      } else {
        imageData.data[newPixel[0]] = 255;
        imageData.data[newPixel[0] + 1] = 255;
        imageData.data[newPixel[0] + 2] = 255;
        imageData.data[newPixel[0] + 3] = 255;
      }
    });

    this.ctxRT!.putImageData(imageData, 0, 0);
  }

  onResize() {
    this.cols = Math.floor(window.innerWidth / this.pixelSize);
    this.rows = Math.floor(window.innerHeight / this.pixelSize);

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.camRT.width = this.cols;
    this.camRT.height = this.rows;
  }

  addEventListeners() {
    window.addEventListener("pointermove", (e) => {
      this.pointerX = e.clientX;
      this.pointerY = e.clientY;
    });
  }
}
