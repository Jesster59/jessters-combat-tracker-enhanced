/**
 * Audio Manager for Jesster's Combat Tracker
 * Handles sound effects
 */
export class AudioManager {
  constructor(app) {
    this.app = app;
    this.sounds = {};
    this.enabled = true;
  }
  
  init() {
    // Define sound files
    const soundFiles = {
      turnStart: 'sounds/turn-start.mp3',
      turnEnd: 'sounds/turn-end.mp3',
      damage: 'sounds/damage.mp3',
      healing: 'sounds/healing.mp3',
      criticalHit: 'sounds/critical-hit.mp3',
      criticalMiss: 'sounds/critical-miss.mp3',
      victory: 'sounds/victory.mp3',
      roundStart: 'sounds/round-start.mp3',
      diceRoll: 'sounds/dice-roll.mp3',
      timerEnd: 'sounds/timer-end.mp3'
    };
    
    // Preload sounds
    for (const [name, path] of Object.entries(soundFiles)) {
      this.sounds[name] = new Audio(path);
      this.sounds[name].preload = 'auto';
      
      // Add error handler to prevent console errors if sound files are missing
      this.sounds[name].addEventListener('error', () => {
        console.log(`Sound file not found: ${path}`);
      });
    }
    
    console.log("Audio system initialized");
  }
  
  play(soundName) {
    if (!this.enabled) return;
    
    const sound = this.sounds[soundName];
    if (sound) {
      // Stop and reset the sound if it's already playing
      sound.pause();
      sound.currentTime = 0;
      
      // Play the sound
      sound.play().catch(error => {
        // Ignore errors (common in browsers that block autoplay)
        console.log(`Could not play sound: ${soundName}`, error);
      });
    }
  }
  
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}
