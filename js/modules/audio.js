/**
 * Audio Manager for Jesster's Combat Tracker
 * Handles sound effects
 */
export class AudioManager {
  constructor(app) {
    this.app = app;
    this.enabled = true;
    this.volume = 0.5;
    this.sounds = {};
  }
  
  init() {
    // Load settings from local storage
    this.enabled = localStorage.getItem('jessterAudioEnabled') !== 'false';
    this.volume = parseFloat(localStorage.getItem('jessterAudioVolume') || '0.5');
    
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
    
    // Create audio objects
    Object.entries(soundFiles).forEach(([name, path]) => {
      this.sounds[name] = new Audio(path);
      this.sounds[name].volume = this.volume;
      
      // Add error handler to prevent console errors if sound file is missing
      this.sounds[name].addEventListener('error', () => {
        console.warn(`Sound file not found: ${path}`);
      });
    });
    
    // Create audio controls
    this.createAudioControls();
  }
  
  play(soundName) {
    if (!this.enabled || !this.sounds[soundName]) return;
    
    try {
      // Stop the sound if it's already playing
      this.sounds[soundName].pause();
      this.sounds[soundName].currentTime = 0;
      
      // Play the sound
      this.sounds[soundName].play().catch(e => {
        // This is often triggered by browsers that require user interaction before playing audio
        console.warn(`Failed to play sound ${soundName}:`, e);
      });
    } catch (error) {
      console.error(`Error playing sound ${soundName}:`, error);
    }
  }
  
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    
    // Update volume for all sounds
    Object.values(this.sounds).forEach(sound => {
      sound.volume = this.volume;
    });
    
    // Save to local storage
    localStorage.setItem('jessterAudioVolume', this.volume.toString());
  }
  
  toggleEnabled() {
    this.enabled = !this.enabled;
    localStorage.setItem('jessterAudioEnabled', this.enabled.toString());
    return this.enabled;
  }
  
  createAudioControls() {
    const container = document.getElementById('audio-controls');
    if (!container) return;
    
    container.innerHTML = `
      <div class="flex items-center space-x-2">
        <button id="toggle-audio-btn" class="text-sm bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded">
          ${this.enabled ? 'Mute' : 'Unmute'}
        </button>
        <input type="range" id="audio-volume" min="0" max="100" value="${this.volume * 100}" class="w-24">
        <span id="volume-label" class="text-xs">${Math.round(this.volume * 100)}%</span>
      </div>
    `;
    
    // Add event listeners
    document.getElementById('toggle-audio-btn').addEventListener('click', () => {
      const enabled = this.toggleEnabled();
      document.getElementById('toggle-audio-btn').textContent = enabled ? 'Mute' : 'Unmute';
    });
    
    document.getElementById('audio-volume').addEventListener('input', (e) => {
      const volume = parseInt(e.target.value) / 100;
      this.setVolume(volume);
      document.getElementById('volume-label').textContent = `${Math.round(volume * 100)}%`;
    });
  }
}
