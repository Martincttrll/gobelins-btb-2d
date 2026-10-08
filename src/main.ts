import { GUIManager } from "./classes/GUIManager";
import AudioManager from "./classes/AudioManager";
import Canvas from "./classes/CanvasManager";

class App {
  video?: HTMLVideoElement;

  //GUI
  GUIManager?: GUIManager;

  //Managers
  audioManager?: AudioManager;
  canvasManager?: Canvas;

  //Timer
  delta = 0;
  time = 0;
  elapsed = 0;
  frameRequest: number | undefined;

  //Video
  isCamAccessible = false;

  constructor() {
    console.log("App init");

    this.audioManager = new AudioManager();
    this.canvasManager = new Canvas();
    this.GUIManager = new GUIManager();

    this.audioManager.canvasManager = this.canvasManager;

    this.getCamStream();
    this.addEnventListeners();
    this.onResize();
  }

  getCamStream() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Aucune webcam détectée ou API non supportée par ce navigateur.");
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        this.video = document.createElement("video");
        this.video.srcObject = stream;
        this.video.autoplay = true;
        this.video.playsInline = true;

        this.isCamAccessible = true;

        this.video.onloadedmetadata = () => {
          this.video!.play();
          if (this.canvasManager) this.canvasManager.video = this.video!;
        };
      })
      .catch((err) => {
        console.error(err);
        alert(err);
      });
  }

  addEnventListeners() {
    window.addEventListener("resize", this.onResize.bind(this));
    window.addEventListener("click", this.onClick.bind(this));
  }

  onResize() {
    this.canvasManager?.onResize();
  }

  onClick() {
    if (!this.frameRequest) {
      this.tick();
    }
    this.audioManager?.onClick();
  }

  render() {
    const currentTime = Date.now();
    this.delta = currentTime - this.time;
    this.time = currentTime;
    this.elapsed += this.delta;

    this.audioManager?.render();
    this.canvasManager?.render();
  }

  tick() {
    this.render();
    this.frameRequest = requestAnimationFrame(() => {
      this.tick();
    });
  }
}

new App();
