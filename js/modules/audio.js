/**
 * Audio Manager for Jesster's Combat Tracker
 * Handles sound effects
 */
class AudioManager {
  constructor(app) {
    this.app = app;
    this.sounds = {};
    this.enabled = true;
    this.maxDuration = 6; // Maximum duration in seconds
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
    for (const name in soundFiles) {
      if (soundFiles.hasOwnProperty(name)) {
        const path = soundFiles[name];
        this.sounds[name] = new Audio(path);
        this.sounds[name].preload = 'auto';
        
        // Add event listener to stop audio after maxDuration
        this.sounds[name].addEventListener('timeupdate', () => {
          if (this.sounds[name].currentTime >= this.maxDuration) {
            this.sounds[name].pause();
            this.sounds[name].currentTime = 0;
          }
        });
        
        // Add error handler to prevent console errors if sound files are missing
        this.sounds[name].addEventListener('error', () => {
          console.log(`Sound file not found: ${path}`);
        });
      }
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
      
      // Set a timeout to stop the sound after maxDuration
      setTimeout(() => {
        if (!sound.paused) {
          sound.pause();
          sound.currentTime = 0;
        }
      }, this.maxDuration * 1000);
    }
  }
  
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}
