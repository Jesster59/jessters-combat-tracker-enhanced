class AudioManager {
  constructor(app) {
    this.app = app;
  }
  
  init() {
    console.log("Audio system initialized");
  }
  
  play(soundName) {
    console.log("Playing sound:", soundName);
  }
}
