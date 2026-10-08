import { mapRange } from "../utils/math";
import { params } from "../config/params";
export default class Canvas {
  params = params;
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

  constructor() {
    document.querySelector("body")!.appendChild(this.camRT);
  }

  render() {
    if (!this.video || !this.ctxRT || !this.analyserBuffer) return;

    let sum = 0;
    for (let i = 0; i < this.analyserBuffer.length; i++) {
      sum += this.analyserBuffer[i];
    }

    //Pixel size
    const avg = sum / this.analyserBuffer.length;
    this.params.applyPixelSizeUpdate
      ? (this.pixelSize = mapRange(avg, 0, 255, 1, this.params.maxPixelSize))
      : (this.pixelSize = 1);
    // this.pixelSize = 1;

    const size = Math.max(1, Math.round(this.pixelSize));
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
    switch (this.params.preset) {
      case 1:
        this.applyPreset1(avg);
        console.log("PRESET 1");
        break;
      case 2:
        this.applyPreset2(avg);
        console.log("PRESET 2");
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

    if (avg > 10) {
      this.ctx.globalCompositeOperation = "difference";
    }
    if (avg > 80) {
      this.ctx.globalCompositeOperation = "color-dodge";
      this.canvas.style.filter = "invert(1)";
    }

    if (avg > 40) {
      const rRatio = this.params.applyPixelSizeUpdate ? 5 : 0.8;
      const x = Math.floor(Math.random() * this.cols!);
      const y = Math.floor(Math.random() * this.rows!);
      const r = Math.floor(Math.random() * (avg / rRatio));

      const gradient = this.ctxRT!.createLinearGradient(0, 0, 200, 0);
      gradient.addColorStop(0, "green");
      gradient.addColorStop(1, "white");
      this.ctxRT!.fillStyle = gradient;

      this.ctxRT!.beginPath();
      this.ctxRT!.arc(x, y, r, 0, Math.PI * 2);
      this.ctxRT!.fill();
    }
  }

  applyPreset2(avg: number) {
    this.ctxRT!.globalCompositeOperation = "source-over";

    this.lastAvg = avg;
    const gradient = this.ctxRT!.createLinearGradient(0, 0, 280, 0);
    gradient.addColorStop(0, "lightblue");
    gradient.addColorStop(0.5, "purple");
    gradient.addColorStop(1, "darkblue");
    this.ctxRT!.strokeStyle = gradient;

    if (avg > this.lastAvg) {
      this.ctxRT!.lineWidth *= 1.2;
    } else {
      this.ctxRT!.lineWidth *= 0.8;
    }

    if (!this.lastPointerX || !this.lastPointerY) {
      this.lastPointerX = this.canvas.width / 2;
      this.lastPointerY = this.canvas.height / 2;
    }
    this.ctxRT!.beginPath();
    this.ctxRT?.moveTo(this.lastPointerX, this.lastPointerY);
    this.ctxRT?.quadraticCurveTo(
      Math.random() * this.canvas.width,
      Math.random() * this.canvas.height,
      Math.random() * 30,
      Math.random() * 30,
    );
    this.ctxRT!.stroke();
  }

  onResize() {
    this.cols = Math.floor(window.innerWidth / this.pixelSize);
    this.rows = Math.floor(window.innerHeight / this.pixelSize);

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.camRT.width = this.cols;
    this.camRT.height = this.rows;
  }
}
