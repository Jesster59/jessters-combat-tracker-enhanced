/**
 * Audio Manager for Jesster's Combat Tracker
 * Handles sound effects and background music
 */
class AudioManager {
  constructor(app) {
    this.app = app;
    this.sounds = {
      combatStart: new Audio('audio/combat-start.mp3'),
      roundStart: new Audio('audio/round-start.mp3'),
      turnEnd: new Audio('audio/turn-end.mp3'),
      diceRoll: new Audio('audio/dice-roll.mp3'),
      hit: new Audio('audio/hit.mp3'),
      miss: new Audio('audio/miss.mp3'),
      criticalHit: new Audio('audio/critical-hit.mp3'),
      heal: new Audio('audio/heal.mp3'),
      spellCast: new Audio('audio/spell-cast.mp3')
    };
    this.backgroundMusic = null;
    this.soundEnabled = true;
    this.musicEnabled = false;
    this.musicVolume = 0.3;
    this.soundVolume = 0.5;
    console.log("Audio.js loaded successfully");
  }
  
  /**
   * Initialize the audio manager
   */
  init() {
    // Load settings from localStorage
    this.loadSettings();
    
    // Create the audio controls
    this.createAudioControls();
  }
  
  /**
   * Load audio settings from localStorage
   */
  loadSettings() {
    try {
      const settings = JSON.parse(localStorage.getItem('jesstersCombatAudioSettings'));
      if (settings) {
        this.soundEnabled = settings.soundEnabled !== undefined ? settings.soundEnabled : true;
        this.musicEnabled = settings.musicEnabled !== undefined ? settings.musicEnabled : false;
        this.musicVolume = settings.musicVolume !== undefined ? settings.musicVolume : 0.3;
        this.soundVolume = settings.soundVolume !== undefined ? settings.soundVolume : 0.5;
      }
    } catch (error) {
      console.error("Error loading audio settings:", error);
    }
  }
  
  /**
   * Save audio settings to localStorage
   */
  saveSettings() {
    try {
      const settings = {
        soundEnabled: this.soundEnabled,
        musicEnabled: this.musicEnabled,
        musicVolume: this.musicVolume,
        soundVolume: this.soundVolume
      };
      localStorage.setItem('jesstersCombatAudioSettings', JSON.stringify(settings));
    } catch (error) {
      console.error("Error saving audio settings:", error);
    }
  }
  
  /**
   * Create the audio controls
   */
  createAudioControls() {
    // Check if controls already exist
    if (document.getElementById('audio-controls')) return;
    
    // Create the controls container
    const controls = document.createElement('div');
    controls.id = 'audio-controls';
    controls.className = 'fixed bottom-4 left-4 bg-gray-800 rounded-lg shadow-lg p-2 z-30 flex items-center space-x-2';
    
    // Create the controls content
    controls.innerHTML = `
      <button id="toggle-sound-btn" class="text-gray-400 hover:text-white p-1 rounded">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${this.soundEnabled ? 
            'M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z' : 
            'M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2'}" />
        </svg>
      </button>
      
      <button id="toggle-music-btn" class="text-gray-400 hover:text-white p-1 rounded">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${this.musicEnabled ? 
            'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3' : 
            'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3 M14 11l3-1'}" />
        </svg>
      </button>
      
      <button id="audio-settings-btn" class="text-gray-400 hover:text-white p-1 rounded">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    `;
    
    // Add the controls to the document
    document.body.appendChild(controls);
    
    // Add event listeners
    document.getElementById('toggle-sound-btn').addEventListener('click', () => {
      this.toggleSound();
    });
    
    document.getElementById('toggle-music-btn').addEventListener('click', () => {
      this.toggleMusic();
    });
    
    document.getElementById('audio-settings-btn').addEventListener('click', () => {
      this.openAudioSettingsModal();
    });
  }
  
  /**
   * Toggle sound effects on/off
   */
  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    
    // Update the button icon
    const soundBtn = document.getElementById('toggle-sound-btn');
    if (soundBtn) {
      soundBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${this.soundEnabled ? 
            'M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z' : 
            'M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2'}" />
        </svg>
      `;
    }
    
    // Save settings
    this.saveSettings();
    
    // Log the action
    this.app.logEvent(`Sound effects ${this.soundEnabled ? 'enabled' : 'disabled'}.`);
  }
  
  /**
   * Toggle background music on/off
   */
  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    
    // Update the button icon
    const musicBtn = document.getElementById('toggle-music-btn');
    if (musicBtn) {
      musicBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${this.musicEnabled ? 
            'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3' : 
            'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3 M14 11l3-1'}" />
        </svg>
      `;
    }
    
    // Start or stop the music
    if (this.musicEnabled) {
      this.startBackgroundMusic();
    } else {
      this.stopBackgroundMusic();
    }
    
    // Save settings
    this.saveSettings();
    
    // Log the action
    this.app.logEvent(`Background music ${this.musicEnabled ? 'enabled' : 'disabled'}.`);
  }
  
  /**
   * Start playing background music
   */
  startBackgroundMusic() {
    if (!this.backgroundMusic) {
      this.backgroundMusic = new Audio('audio/background-music.mp3');
      this.backgroundMusic.loop = true;
      this.backgroundMusic.volume = this.musicVolume;
    }
    
    this.backgroundMusic.play().catch(error => {
      console.error("Error playing background music:", error);
    });
  }
  
  /**
   * Stop playing background music
   */
  stopBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
    }
  }
  
  /**
   * Play a sound effect
   * @param {string} soundName - The name of the sound to play
   */
  play(soundName) {
    if (!this.soundEnabled) return;
    
    const sound = this.sounds[soundName];
    if (sound) {
      sound.volume = this.soundVolume;
      sound.currentTime = 0;
      sound.play().catch(error => {
        console.error(`Error playing sound ${soundName}:`, error);
      });
    }
  }
  
  /**
   * Open the audio settings modal
   */
  openAudioSettingsModal() {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 flex items-center justify-center z-50 p-4';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    
    modal.innerHTML = `
      <div class="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-md w-full mx-auto">
        <h3 class="text-xl font-bold text-blue-400 mb-4">Audio Settings</h3>
        
        <div class="mb-4">
          <label class="flex items-center justify-between">
            <span class="text-gray-300">Sound Effects:</span>
            <div class="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full">
              <input type="checkbox" id="sound-toggle" class="absolute w-6 h-6 transition duration-200 ease-in-out bg-white border-2 border-gray-600 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-600 checked:bg-blue-600 checked:border-blue-600 checked:right-0"
                ${this.soundEnabled ? 'checked' : ''}>
              <label for="sound-toggle" class="block w-full h-full cursor-pointer rounded-full bg-gray-600"></label>
            </div>
          </label>
        </div>
        
        <div class="mb-4">
          <label class="block text-gray-300 mb-2">Sound Volume:</label>
          <input type="range" id="sound-volume" class="w-full" min="0" max="1" step="0.1" value="${this.soundVolume}">
          <div class="flex justify-between text-xs text-gray-400">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
        
        <div class="mb-4">
          <label class="flex items-center justify-between">
            <span class="text-gray-300">Background Music:</span>
            <div class="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full">
              <input type="checkbox" id="music-toggle" class="absolute w-6 h-6 transition duration-200 ease-in-out bg-white border-2 border-gray-600 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-600 checked:bg-blue-600 checked:border-blue-600 checked:right-0"
                ${this.musicEnabled ? 'checked' : ''}>
              <label for="music-toggle" class="block w-full h-full cursor-pointer rounded-full bg-gray-600"></label>
            </div>
          </label>
        </div>
        
        <div class="mb-4">
          <label class="block text-gray-300 mb-2">Music Volume:</label>
          <input type="range" id="music-volume" class="w-full" min="0" max="1" step="0.1" value="${this.musicVolume}">
          <div class="flex justify-between text-xs text-gray-400">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
        
        <div class="mb-4">
          <label class="block text-gray-300 mb-2">Test Sounds:</label>
          <div class="grid grid-cols-2 gap-2">
            <button id="test-combat-start" class="bg-gray-700 hover:bg-gray-600 text-white py-1 px-2 rounded text-sm">Combat Start</button>
            <button id="test-round-start" class="bg-gray-700 hover:bg-gray-600 text-white py-1 px-2 rounded text-sm">Round Start</button>
            <button id="test-turn-end" class="bg-gray-700 hover:bg-gray-600 text-white py-1 px-2 rounded text-sm">Turn End</button>
            <button id="test-dice-roll" class="bg-gray-700 hover:bg-gray-600 text-white py-1 px-2 rounded text-sm">Dice Roll</button>
            <button id="test-hit" class="bg-gray-700 hover:bg-gray-600 text-white py-1 px-2 rounded text-sm">Hit</button>
            <button id="test-critical-hit" class="bg-gray-700 hover:bg-gray-600 text-white py-1 px-2 rounded text-sm">Critical Hit</button>
          </div>
        </div>
        
        <div class="flex justify-end space-x-2">
          <button id="audio-settings-cancel-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            Cancel
          </button>
          <button id="audio-settings-save-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Save Settings
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('audio-settings-cancel-btn').addEventListener('click', () => {
      modal.remove();
    });
    
    document.getElementById('audio-settings-save-btn').addEventListener('click', () => {
      // Save the settings
      this.soundEnabled = document.getElementById('sound-toggle').checked;
      this.musicEnabled = document.getElementById('music-toggle').checked;
      this.soundVolume = parseFloat(document.getElementById('sound-volume').value);
      this.musicVolume = parseFloat(document.getElementById('music-volume').value);
      
      // Update background music volume if playing
      if (this.backgroundMusic) {
        this.backgroundMusic.volume = this.musicVolume;
      }
      
      // Start or stop the music based on the setting
      if (this.musicEnabled) {
        this.startBackgroundMusic();
      } else {
        this.stopBackgroundMusic();
      }
      
      // Save settings
      this.saveSettings();
      
      // Update the UI
      this.updateAudioControlsUI();
      
      modal.remove();
      this.app.logEvent("Audio settings updated.");
    });
    
    // Test sound buttons
    document.getElementById('test-combat-start').addEventListener('click', () => {
      this.play('combatStart');
    });
    
    document.getElementById('test-round-start').addEventListener('click', () => {
      this.play('roundStart');
    });
    
    document.getElementById('test-turn-end').addEventListener('click', () => {
      this.play('turnEnd');
    });
    
    document.getElementById('test-dice-roll').addEventListener('click', () => {
      this.play('diceRoll');
    });
    
    document.getElementById('test-hit').addEventListener('click', () => {
      this.play('hit');
    });
    
    document.getElementById('test-critical-hit').addEventListener('click', () => {
      this.play('criticalHit');
    });
    
    // Live update sound volume
    document.getElementById('sound-volume').addEventListener('input', (e) => {
      this.soundVolume = parseFloat(e.target.value);
    });
    
    // Live update music volume
    document.getElementById('music-volume').addEventListener('input', (e) => {
      this.musicVolume = parseFloat(e.target.value);
      if (this.backgroundMusic) {
        this.backgroundMusic.volume = this.musicVolume;
      }
    });
  }
  
  /**
   * Update the audio controls UI
   */
  updateAudioControlsUI() {
    // Update sound button
    const soundBtn = document.getElementById('toggle-sound-btn');
    if (soundBtn) {
      soundBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${this.soundEnabled ? 
            'M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z' : 
            'M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2'}" />
        </svg>
      `;
    }
    
    // Update music button
    const musicBtn = document.getElementById('toggle-music-btn');
    if (musicBtn) {
      musicBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${this.musicEnabled ? 
            'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3' : 
            'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3 M14 11l3-1'}" />
        </svg>
      `;
    }
  }
}
