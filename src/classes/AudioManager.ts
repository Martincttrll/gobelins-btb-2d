import Canvas from "./Canvas";

export default class AudioManager {
  //Audio
  audio = new Audio("/audio.mp3");
  audioCtx?: AudioContext;
  playing = false;
  analyser?: AnalyserNode;
  analyserBuffer?: Uint8Array;
  a = false;

  canvasManager?: Canvas;

  constructor() {
    console.log("AudioManager init");
  }

  render() {
    this.analyserBuffer &&
      this.analyser &&
      this.analyser.getByteFrequencyData(this.analyserBuffer);

    if (this.canvasManager)
      this.canvasManager.analyserBuffer = this.analyserBuffer;
  }

  async startContext() {
    this.audioCtx = new AudioContext();
    const mediaSourceNode = this.audioCtx.createMediaElementSource(this.audio);
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 1024;
    this.analyserBuffer = new Uint8Array(this.analyser.frequencyBinCount);

    mediaSourceNode.connect(this.analyser);
    mediaSourceNode.connect(this.audioCtx.destination);
  }

  onClick() {
    this.playing ? this.pause() : this.play();
    this.playing = !this.playing;
  }

  async play() {
    if (!this.playing) {
      this.audioCtx || (await this.startContext());
      this.audio.play();
    }
  }

  pause() {
    if (this.playing) {
      this.audio.pause();
    }
  }
}
