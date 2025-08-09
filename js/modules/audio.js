/**
 * Audio Manager for Jesster's Combat Tracker
 * Handles sound effects and background music
 */
class AudioManager {
    constructor(app) {
        this.app = app;
        this.sounds = {};
        this.backgroundMusic = null;
        this.soundEnabled = true;
        this.musicEnabled = false;
        this.musicVolume = 0.3;
        this.soundVolume = 0.5;
        this.audioInitialized = false;
        
        // Define sound mappings
        this.soundMappings = {
            'combatStart': 'audio/combat-start.mp3',
            'roundStart': 'audio/round-start.mp3',
            'turnStart': 'audio/turn-start.mp3',
            'turnEnd': 'audio/turn-end.mp3',
            'diceRoll': 'audio/dice-roll.mp3',
            'hit': 'audio/hit.mp3',
            'miss': 'audio/miss.mp3',
            'criticalHit': 'audio/critical-hit.mp3',
            'heal': 'audio/heal.mp3',
            'spellCast': 'audio/spell-cast.mp3'
        };
        
        // Background music options
        this.musicTracks = [
            'audio/background-music-1.mp3',
            'audio/background-music-2.mp3'
        ];
        
        console.log("Audio Manager initialized");
    }
    
    /**
     * Initialize the audio manager
     */
    async init() {
        // Load settings from localStorage
        this.loadSettings();
        
        // Create the audio controls
        this.createAudioControls();
        
        // Setup audio initialization on user interaction
        this.setupAudioInitialization();
    }
    
    /**
     * Setup audio initialization on user interaction
     */
    setupAudioInitialization() {
        // Create placeholder objects for all sounds
        for (const name of Object.keys(this.soundMappings)) {
            this.sounds[name] = {
                loaded: false
            };
        }
        
        // Add a one-time event listener to initialize audio on first user interaction
        const initAudioOnUserInteraction = () => {
            if (!this.audioInitialized) {
                this.initializeAudio();
                this.audioInitialized = true;
            }
            document.removeEventListener('click', initAudioOnUserInteraction);
            document.removeEventListener('keydown', initAudioOnUserInteraction);
        };
        
        document.addEventListener('click', initAudioOnUserInteraction);
        document.addEventListener('keydown', initAudioOnUserInteraction);
    }
    
    /**
     * Initialize audio after user interaction
     */
    initializeAudio() {
        try {
            // Preload all sound effects
            for (const [name, path] of Object.entries(this.soundMappings)) {
                // Create a new Audio object for each sound
                const audio = new Audio();
                audio.preload = 'auto';
                audio.src = path;
                
                // Store the audio object
                this.sounds[name] = {
                    audio: audio,
                    loaded: true
                };
                
                // Add error handler
                audio.onerror = (e) => {
                    console.warn(`Error loading sound ${name} from ${path}:`, e);
                    this.sounds[name].loaded = false;
                };
                
                // Add load handler
                audio.oncanplaythrough = () => {
                    console.log(`Sound ${name} loaded successfully`);
                    this.sounds[name].loaded = true;
                };
            }
            
            console.log("Audio initialized after user interaction");
            
            // If music was enabled in settings, start it now
            if (this.musicEnabled) {
                this.startBackgroundMusic();
            }
            
            // Play a silent sound to unlock audio on iOS
            const silentSound = new Audio("data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV6urq6urq6urq6urq6urq6urq6urq6urq6v////////////////////////////////8AAAAATGF2YzU4LjU0AAAAAAAAAAAAAAAAJAAAAAAAAAAAASDs90hvAAAAAAAAAAAAAAAAAAAA//MUZAAAAAGkAAAAAAAAA0gAAAAATEFN//MUZAMAAAGkAAAAAAAAA0gAAAAARTMu//MUZAYAAAGkAAAAAAAAA0gAAAAAOTku//MUZAkAAAGkAAAAAAAAA0gAAAAANVVV");
            silentSound.volume = 0.01;
            silentSound.play().catch(e => console.warn("Silent sound playback failed:", e));
            
            return true;
        } catch (e) {
            console.error("Error initializing audio:", e);
            return false;
        }
    }
    
    /**
     * Load settings from localStorage
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
     * Save settings to localStorage
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
            <button id="toggle-sound-btn" class="text-gray-400 hover:text-white p-1 rounded" title="Toggle Sound Effects">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${this.soundEnabled ? 
                        'M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z' : 
                        'M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2'}" />
                </svg>
            </button>
            
            <button id="toggle-music-btn" class="text-gray-400 hover:text-white p-1 rounded" title="Toggle Background Music">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
            </button>
            
            <button id="audio-settings-btn" class="text-gray-400 hover:text-white p-1 rounded" title="Audio Settings">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </button>
        `;
        
        // Add the controls to the document
        document.body.appendChild(controls);
        
        // Add event listeners
        const toggleSoundBtn = document.getElementById('toggle-sound-btn');
        const toggleMusicBtn = document.getElementById('toggle-music-btn');
        const audioSettingsBtn = document.getElementById('audio-settings-btn');
        
        if (toggleSoundBtn) {
            toggleSoundBtn.addEventListener('click', () => {
                this.toggleSound();
            });
        }
        
        if (toggleMusicBtn) {
            toggleMusicBtn.addEventListener('click', () => {
                this.toggleMusic();
            });
        }
        
        if (audioSettingsBtn) {
            audioSettingsBtn.addEventListener('click', () => {
                this.openAudioSettingsModal();
            });
        }
        
        // Update initial UI state
        this.updateAudioControlsUI();
    }
    
    /**
     * Play a sound effect
     * @param {string} soundName - The name of the sound to play
     */
    play(soundName) {
        if (!this.soundEnabled || !this.audioInitialized) {
            console.log(`Sound ${soundName} not played: sound disabled or audio not initialized`);
            return;
        }
        
        // Check if sound exists
        if (!this.sounds[soundName] || !this.sounds[soundName].loaded) {
            console.warn(`Sound ${soundName} not found or not loaded`);
            return;
        }
        
        try {
            // Create a new audio element to allow overlapping sounds
            const audio = new Audio(this.soundMappings[soundName]);
            audio.volume = this.soundVolume;
            
            // Play the sound
            audio.play().catch(e => {
                console.warn(`Error playing sound ${soundName}:`, e);
                
                // If this is a user interaction error, try to initialize audio again
                if (e.name === 'NotAllowedError') {
                    this.audioInitialized = false;
                    this.initializeAudio();
                }
            });
            
            console.log(`Playing sound: ${soundName}`);
        } catch (e) {
            console.error(`Error playing sound ${soundName}:`, e);
        }
    }
    
    /**
     * Toggle sound effects on/off
     */
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.updateAudioControlsUI();
        this.saveSettings();
        this.app.logEvent(`Sound effects ${this.soundEnabled ? 'enabled' : 'disabled'}.`);
        
        // Initialize audio if this is the first user interaction
        if (!this.audioInitialized && this.soundEnabled) {
            this.initializeAudio();
            this.audioInitialized = true;
        }
        
        // Play a test sound if enabled
        if (this.soundEnabled) {
            // Use a small timeout to ensure the audio context is ready
            setTimeout(() => {
                this.play('diceRoll');
            }, 100);
        }
    }
    
    /**
     * Toggle background music on/off
     */
    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        
        if (this.musicEnabled) {
            // Initialize audio if this is the first user interaction
            if (!this.audioInitialized) {
                this.initializeAudio();
                this.audioInitialized = true;
            }
            this.startBackgroundMusic();
        } else {
            this.stopBackgroundMusic();
        }
        
        this.updateAudioControlsUI();
        this.saveSettings();
        this.app.logEvent(`Background music ${this.musicEnabled ? 'enabled' : 'disabled'}.`);
    }
    
    /**
     * Start playing background music
     */
    startBackgroundMusic() {
        // Stop any existing music
        this.stopBackgroundMusic();
        
        // Check if we have any music tracks
        if (this.musicTracks.length === 0) {
            console.warn("No music tracks available");
            return;
        }
        
        try {
            // Select a random track
            const trackIndex = Math.floor(Math.random() * this.musicTracks.length);
            const trackPath = this.musicTracks[trackIndex];
            
            // Create and configure the audio element
            this.backgroundMusic = new Audio(trackPath);
            this.backgroundMusic.volume = this.musicVolume;
            this.backgroundMusic.loop = true;
            
            // Play the music
            this.backgroundMusic.play().catch(e => {
                console.warn("Error playing background music:", e);
                
                // If this is a user interaction error, try to initialize audio again
                if (e.name === 'NotAllowedError') {
                    this.audioInitialized = false;
                    this.initializeAudio();
                }
            });
            
            console.log(`Playing background music: ${trackPath}`);
        } catch (e) {
            console.error("Error starting background music:", e);
        }
    }
    
    /**
     * Stop playing background music
     */
    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            try {
                this.backgroundMusic.pause();
                this.backgroundMusic.currentTime = 0;
                this.backgroundMusic = null;
                console.log("Background music stopped");
            } catch (e) {
                console.error("Error stopping background music:", e);
            }
        }
    }
    
    /**
     * Update the audio controls UI
     */
    updateAudioControlsUI() {
        // Update sound button
        const soundBtn = document.getElementById('toggle-sound-btn');
        if (soundBtn) {
            soundBtn.className = `p-1 rounded ${this.soundEnabled ? 'text-white' : 'text-gray-400'} hover:text-white`;
            
            // Update the SVG path
            const soundPath = soundBtn.querySelector('path');
            if (soundPath) {
                soundPath.setAttribute('d', this.soundEnabled ? 
                    'M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z' : 
                    'M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2');
            }
        }
        
        // Update music button
        const musicBtn = document.getElementById('toggle-music-btn');
        if (musicBtn) {
            musicBtn.className = `p-1 rounded ${this.musicEnabled ? 'text-white' : 'text-gray-400'} hover:text-white`;
        }
    }
    
    /**
     * Open the audio settings modal
     */
    openAudioSettingsModal() {
        const modal = this.app.ui.createModal({
            title: 'Audio Settings',
            content: `
                <div class="space-y-4">
                    <div class="mb-4">
                        <label class="flex items-center justify-between">
                            <span class="text-gray-300">Sound Effects:</span>
                            <input type="checkbox" id="sound-toggle" class="form-checkbox h-5 w-5 text-blue-600" ${this.soundEnabled ? 'checked' : ''}>
                        </label>
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-gray-300 mb-2">Sound Volume:</label>
                        <input type="range" id="sound-volume" class="w-full" min="0" max="1" step="0.1" value="${this.soundVolume}">
                        <div class="flex justify-between text-xs text-gray-400 mt-1">
                            <span>0%</span>
                            <span>50%</span>
                            <span>100%</span>
                        </div>
                    </div>
                    
                    <div class="mb-4">
                        <label class="flex items-center justify-between">
                            <span class="text-gray-300">Background Music:</span>
                            <input type="checkbox" id="music-toggle" class="form-checkbox h-5 w-5 text-blue-600" ${this.musicEnabled ? 'checked' : ''}>
                        </label>
                    </div>
                    
                    <div class="mb-6">
                        <label class="block text-gray-300 mb-2">Music Volume:</label>
                        <input type="range" id="music-volume" class="w-full" min="0" max="1" step="0.1" value="${this.musicVolume}">
                        <div class="flex justify-between text-xs text-gray-400 mt-1">
                            <span>0%</span>
                            <span>50%</span>
                            <span>100%</span>
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
            `,
            width: 'max-w-md'
        });
        
        // Add event listeners
        const soundToggle = modal.querySelector('#sound-toggle');
        const soundVolume = modal.querySelector('#sound-volume');
        const musicToggle = modal.querySelector('#music-toggle');
        const musicVolume = modal.querySelector('#music-volume');
        const cancelBtn = modal.querySelector('#audio-settings-cancel-btn');
        const saveBtn = modal.querySelector('#audio-settings-save-btn');
        
        // Test sound button
        const testSoundBtn = document.createElement('button');
        testSoundBtn.className = 'bg-gray-600 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded text-xs ml-2';
        testSoundBtn.textContent = 'Test';
        soundToggle.parentNode.appendChild(testSoundBtn);
        
        testSoundBtn.addEventListener('click', () => {
            // Initialize audio if needed
            if (!this.audioInitialized) {
                this.initializeAudio();
                this.audioInitialized = true;
            }
            
            // Play a test sound
            const tempEnabled = this.soundEnabled;
            this.soundEnabled = true;
            this.soundVolume = parseFloat(soundVolume.value);
            this.play('diceRoll');
            this.soundEnabled = tempEnabled;
        });
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.app.ui.closeModal(modal.parentNode);
            });
        }
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                // Update settings
                this.soundEnabled = soundToggle.checked;
                this.soundVolume = parseFloat(soundVolume.value);
                this.musicEnabled = musicToggle.checked;
                this.musicVolume = parseFloat(musicVolume.value);
                
                // Initialize audio if this is the first user interaction and either sound or music is enabled
                if (!this.audioInitialized && (this.soundEnabled || this.musicEnabled)) {
                    this.initializeAudio();
                    this.audioInitialized = true;
                }
                
                // Apply settings
                if (this.musicEnabled) {
                    this.startBackgroundMusic();
                } else {
                    this.stopBackgroundMusic();
                }
                
                // Update volume if background music is playing
                if (this.backgroundMusic) {
                    this.backgroundMusic.volume = this.musicVolume;
                }
                
                // Save settings
                this.saveSettings();
                
                // Update UI
                this.updateAudioControlsUI();
                
                // Close modal
                this.app.ui.closeModal(modal.parentNode);
                
                this.app.logEvent('Audio settings updated.');
            });
        }
    }
}
