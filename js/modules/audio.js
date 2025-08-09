/**
 * Audio module for Jesster's Combat Tracker
 * Handles sound effects and background music
 */
class Audio {
    constructor(settings) {
        // Store reference to settings module
        this.settings = settings;
        
        // Audio state
        this.soundEnabled = this.settings.areSoundsEnabled();
        this.musicEnabled = this.settings.isMusicEnabled();
        this.volume = this.settings.getVolume();
        this.musicVolume = this.settings.getMusicVolume();
        
        // Audio elements
        this.sounds = {};
        this.music = {};
        this.currentMusic = null;
        
        // Sound paths
        this.soundPaths = {
            'dice-roll': 'sounds/dice-roll.mp3',
            'critical-hit': 'sounds/critical-hit.mp3',
            'critical-miss': 'sounds/critical-miss.mp3',
            'damage': 'sounds/damage.mp3',
            'healing': 'sounds/healing.mp3',
            'turn-start': 'sounds/turn-start.mp3',
            'turn-end': 'sounds/turn-end.mp3',
            'round-start': 'sounds/round-start.mp3',
            'timer-end': 'sounds/timer-end.mp3',
            'victory': 'sounds/victory.mp3'
        };
        
        // Music paths (to be populated)
        this.musicPaths = {
            'combat': 'sounds/music/combat.mp3',
            'exploration': 'sounds/music/exploration.mp3',
            'tension': 'sounds/music/tension.mp3',
            'victory': 'sounds/music/victory.mp3',
            'defeat': 'sounds/music/defeat.mp3'
        };
        
        // Initialize audio context
        this._initAudioContext();
        
        console.log("Audio module initialized");
    }

    /**
     * Initialize Web Audio API context
     * @private
     */
    _initAudioContext() {
        try {
            // Create audio context
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            // Create gain nodes for volume control
            this.soundGain = this.audioContext.createGain();
            this.musicGain = this.audioContext.createGain();
            
            // Connect gain nodes to destination
            this.soundGain.connect(this.audioContext.destination);
            this.musicGain.connect(this.audioContext.destination);
            
            // Set initial volume
            this.soundGain.gain.value = this.volume;
            this.musicGain.gain.value = this.musicVolume;
            
            // Flag for audio context state
            this.audioContextInitialized = true;
        } catch (error) {
            console.error('Web Audio API not supported:', error);
            this.audioContextInitialized = false;
        }
    }

    /**
     * Resume audio context (must be called from a user interaction)
     */
    resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    /**
     * Preload all sounds
     * @returns {Promise<void>} Promise that resolves when all sounds are loaded
     */
    async preloadSounds() {
        if (!this.audioContextInitialized) return;
        
        const loadPromises = [];
        
        // Preload sound effects
        for (const [id, path] of Object.entries(this.soundPaths)) {
            loadPromises.push(this._loadSound(id, path));
        }
        
        // Wait for all sounds to load
        await Promise.all(loadPromises);
    }

    /**
     * Load a sound
     * @private
     * @param {string} id - Sound ID
     * @param {string} path - Sound file path
     * @returns {Promise<void>} Promise that resolves when sound is loaded
     */
    async _loadSound(id, path) {
        if (!this.audioContextInitialized) return;
        
        try {
            // Fetch audio file
            const response = await fetch(path);
            const arrayBuffer = await response.arrayBuffer();
            
            // Decode audio data
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            // Store audio buffer
            this.sounds[id] = audioBuffer;
        } catch (error) {
            console.error(`Error loading sound ${id}:`, error);
        }
    }

    /**
     * Play a sound
     * @param {string} id - Sound ID
     * @param {Object} options - Playback options
     * @param {number} options.volume - Volume override (0-1)
     * @param {number} options.pitch - Pitch adjustment (0.5-2)
     * @param {boolean} options.loop - Whether to loop the sound
     * @returns {Object|null} Sound control object or null if sound couldn't be played
     */
    play(id, options = {}) {
        // Check if sound is enabled
        if (!this.soundEnabled || !this.audioContextInitialized) return null;
        
        // Get options
        const {
            volume = 1,
            pitch = 1,
            loop = false
        } = options;
        
        // Get sound buffer
        const buffer = this.sounds[id];
        if (!buffer) {
            // Try to load the sound if it's not loaded yet
            if (this.soundPaths[id]) {
                this._loadSound(id, this.soundPaths[id]);
            }
            return null;
        }
        
        // Create source node
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = loop;
        
        // Set playback rate (pitch)
        source.playbackRate.value = pitch;
        
        // Create gain node for this sound
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = volume * this.volume;
        
        // Connect nodes
        source.connect(gainNode);
        gainNode.connect(this.soundGain);
        
        // Start playback
        source.start(0);
        
        // Return control object
        return {
            source,
            gainNode,
            stop: () => {
                try {
                    source.stop();
                } catch (error) {
                    // Ignore errors when stopping already stopped sources
                }
            },
            setVolume: (newVolume) => {
                gainNode.gain.value = newVolume * this.volume;
            },
            setPitch: (newPitch) => {
                source.playbackRate.value = newPitch;
            }
        };
    }

    /**
     * Play music
     * @param {string} id - Music ID
     * @param {Object} options - Playback options
     * @param {number} options.volume - Volume override (0-1)
     * @param {boolean} options.loop - Whether to loop the music
     * @param {number} options.fadeIn - Fade in duration in milliseconds
     * @returns {Object|null} Music control object or null if music couldn't be played
     */
    playMusic(id, options = {}) {
        // Check if music is enabled
        if (!this.musicEnabled || !this.audioContextInitialized) return null;
        
        // Get options
        const {
            volume = 1,
            loop = true,
            fadeIn = 1000
        } = options;
        
        // Stop current music
        this.stopMusic({ fadeOut: fadeIn / 2 });
        
        // Get music buffer
        let buffer = this.sounds[id];
        if (!buffer) {
            // Try to load the music if it's not loaded yet
            if (this.musicPaths[id]) {
                this._loadSound(id, this.musicPaths[id]);
            }
            return null;
        }
        
        // Create source node
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = loop;
        
        // Create gain node for this music
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 0; // Start at 0 for fade in
        
        // Connect nodes
        source.connect(gainNode);
        gainNode.connect(this.musicGain);
        
        // Start playback
        source.start(0);
        
        // Fade in
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(volume * this.musicVolume, now + fadeIn / 1000);
        
        // Create control object
        const control = {
            source,
            gainNode,
            id,
            stop: (options = {}) => {
                const { fadeOut = 0 } = options;
                
                if (fadeOut > 0) {
                    // Fade out
                    const now = this.audioContext.currentTime;
                    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
                    gainNode.gain.linearRampToValueAtTime(0, now + fadeOut / 1000);
                    
                    // Stop after fade out
                    setTimeout(() => {
                        try {
                            source.stop();
                        } catch (error) {
                            // Ignore errors when stopping already stopped sources
                        }
                    }, fadeOut);
                } else {
                    // Stop immediately
                    try {
                        source.stop();
                    } catch (error) {
                        // Ignore errors when stopping already stopped sources
                    }
                }
            },
            setVolume: (newVolume) => {
                gainNode.gain.value = newVolume * this.musicVolume;
            }
        };
        
        // Store current music
        this.currentMusic = control;
        
        return control;
    }

    /**
     * Stop music
     * @param {Object} options - Stop options
     * @param {number} options.fadeOut - Fade out duration in milliseconds
     */
    stopMusic(options = {}) {
        const { fadeOut = 0 } = options;
        
        if (this.currentMusic) {
            this.currentMusic.stop({ fadeOut });
            this.currentMusic = null;
        }
    }

    /**
     * Set sound volume
     * @param {number} volume - Volume level (0-1)
     */
    setSoundVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        if (this.audioContextInitialized) {
            this.soundGain.gain.value = this.volume;
        }
    }

    /**
     * Set music volume
     * @param {number} volume - Volume level (0-1)
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        
        if (this.audioContextInitialized && this.currentMusic) {
            this.musicGain.gain.value = this.musicVolume;
        }
    }

    /**
     * Enable or disable sound
     * @param {boolean} enabled - Whether sound is enabled
     */
    enableSound(enabled) {
        this.soundEnabled = enabled;
        
        // Update settings
        this.settings.set('soundEnabled', enabled);
    }

    /**
     * Enable or disable music
     * @param {boolean} enabled - Whether music is enabled
     */
    enableMusic(enabled) {
        this.musicEnabled = enabled;
        
        // Update settings
        this.settings.set('musicEnabled', enabled);
        
        // Stop music if disabled
        if (!enabled && this.currentMusic) {
            this.stopMusic({ fadeOut: 500 });
        }
    }

    /**
     * Play a sound effect with a random pitch variation
     * @param {string} id - Sound ID
     * @param {Object} options - Playback options
     * @returns {Object|null} Sound control object
     */
    playWithVariation(id, options = {}) {
        // Add random pitch variation
        const pitchVariation = 0.1; // 10% variation
        const pitch = 1 + (Math.random() * pitchVariation * 2 - pitchVariation);
        
        return this.play(id, { ...options, pitch });
    }

    /**
     * Play a dice roll sound
     * @returns {Object|null} Sound control object
     */
    playDiceRoll() {
        return this.playWithVariation('dice-roll');
    }

    /**
     * Play a critical hit sound
     * @returns {Object|null} Sound control object
     */
    playCriticalHit() {
        return this.play('critical-hit');
    }

    /**
     * Play a critical miss sound
     * @returns {Object|null} Sound control object
     */
    playCriticalMiss() {
        return this.play('critical-miss');
    }

    /**
     * Play a damage sound
     * @returns {Object|null} Sound control object
     */
    playDamage() {
        return this.playWithVariation('damage');
    }

    /**
     * Play a healing sound
     * @returns {Object|null} Sound control object
     */
    playHealing() {
        return this.play('healing');
    }

    /**
     * Play a turn start sound
     * @returns {Object|null} Sound control object
     */
    playTurnStart() {
        return this.play('turn-start');
    }

    /**
     * Play a turn end sound
     * @returns {Object|null} Sound control object
     */
    playTurnEnd() {
        return this.play('turn-end');
    }

    /**
     * Play a round start sound
     * @returns {Object|null} Sound control object
     */
    playRoundStart() {
        return this.play('round-start');
    }

    /**
     * Play a timer end sound
     * @returns {Object|null} Sound control object
     */
    playTimerEnd() {
        return this.play('timer-end');
    }

    /**
     * Play a victory sound
     * @returns {Object|null} Sound control object
     */
    playVictory() {
        return this.play('victory');
    }

    /**
     * Add a custom sound
     * @param {string} id - Sound ID
     * @param {string} path - Sound file path
     * @returns {Promise<boolean>} Promise that resolves to true if sound was added successfully
     */
    async addCustomSound(id, path) {
        if (!this.audioContextInitialized) return false;
        
        try {
            await this._loadSound(id, path);
            this.soundPaths[id] = path;
            return true;
        } catch (error) {
            console.error(`Error adding custom sound ${id}:`, error);
            return false;
        }
    }

    /**
     * Add a custom music track
     * @param {string} id - Music ID
     * @param {string} path - Music file path
     * @returns {Promise<boolean>} Promise that resolves to true if music was added successfully
     */
    async addCustomMusic(id, path) {
        if (!this.audioContextInitialized) return false;
        
        try {
            await this._loadSound(id, path);
            this.musicPaths[id] = path;
            return true;
        } catch (error) {
            console.error(`Error adding custom music ${id}:`, error);
            return false;
        }
    }

    /**
     * Check if audio context is initialized
     * @returns {boolean} True if audio context is initialized
     */
    isAudioContextInitialized() {
        return this.audioContextInitialized;
    }

    /**
     * Get current music ID
     * @returns {string|null} Current music ID or null if no music is playing
     */
    getCurrentMusicId() {
        return this.currentMusic ? this.currentMusic.id : null;
    }

    /**
     * Check if a sound is loaded
     * @param {string} id - Sound ID
     * @returns {boolean} True if sound is loaded
     */
    isSoundLoaded(id) {
        return !!this.sounds[id];
    }

    /**
     * Get all available sound IDs
     * @returns {string[]} Array of sound IDs
     */
    getAvailableSounds() {
        return Object.keys(this.soundPaths);
    }

    /**
     * Get all available music IDs
     * @returns {string[]} Array of music IDs
     */
    getAvailableMusic() {
        return Object.keys(this.musicPaths);
    }

    /**
     * Play ambient sound
     * @param {string} id - Sound ID
     * @param {Object} options - Playback options
     * @returns {Object|null} Sound control object
     */
    playAmbient(id, options = {}) {
        return this.play(id, { ...options, loop: true, volume: 0.3 });
    }

    /**
     * Create a sound sequence
     * @param {string[]} soundIds - Array of sound IDs
     * @param {number} interval - Interval between sounds in milliseconds
     * @returns {Object} Sequence control object
     */
    createSequence(soundIds, interval = 1000) {
        let currentIndex = 0;
        let isPlaying = false;
        let timeoutId = null;
        let currentSound = null;
        
        const playNext = () => {
            if (!isPlaying) return;
            
            const id = soundIds[currentIndex];
            currentSound = this.play(id);
            
            currentIndex = (currentIndex + 1) % soundIds.length;
            
            timeoutId = setTimeout(playNext, interval);
        };
        
        return {
            start: () => {
                isPlaying = true;
                playNext();
            },
            stop: () => {
                isPlaying = false;
                if (timeoutId) {
                    clearTimeout(timeoutId);
                    timeoutId = null;
                }
                if (currentSound) {
                    currentSound.stop();
                    currentSound = null;
                }
            },
            isPlaying: () => isPlaying
        };
    }

    /**
     * Create a crossfade between two music tracks
     * @param {string} fromId - Current music ID
     * @param {string} toId - Target music ID
     * @param {number} duration - Crossfade duration in milliseconds
     * @returns {Promise<Object|null>} Promise that resolves to the new music control object
     */
    async crossfadeMusic(fromId, toId, duration = 2000) {
        if (!this.musicEnabled || !this.audioContextInitialized) return null;
        
        // If no current music, just play the new one
        if (!this.currentMusic) {
            return this.playMusic(toId, { fadeIn: duration });
        }
        
        // Start fading out current music
        const currentGain = this.currentMusic.gainNode.gain.value;
        const now = this.audioContext.currentTime;
        this.currentMusic.gainNode.gain.setValueAtTime(currentGain, now);
        this.currentMusic.gainNode.gain.linearRampToValueAtTime(0, now + duration / 1000);
        
        // Schedule stopping the current music
        const currentMusic = this.currentMusic;
        setTimeout(() => {
            try {
                currentMusic.source.stop();
            } catch (error) {
                // Ignore errors when stopping already stopped sources
            }
        }, duration);
        
        // Start new music
        this.currentMusic = null; // Prevent stopMusic from being called
        return this.playMusic(toId, { fadeIn: duration });
    }
}

// Export the Audio class
export default Audio;
