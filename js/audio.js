/**
 * Audio module for Jesster's Combat Tracker
 * Handles sound effects and background music
 */
class Audio {
    constructor(settings) {
        // Store reference to settings module
        this.settings = settings;
        
        // Audio context
        this.context = null;
        
        // Sound effects
        this.sounds = {};
        
        // Background music
        this.music = {};
        this.currentMusic = null;
        
        // Volume
        this.volume = this.settings.getVolume();
        this.musicVolume = this.settings.getMusicVolume();
        
        // Mute state
        this.muted = !this.settings.areSoundsEnabled();
        this.musicMuted = !this.settings.isMusicEnabled();
        
        // Default sounds
        this.defaultSounds = [
            { id: 'dice-roll', url: 'assets/audio/dice-roll.mp3' },
            { id: 'combat-start', url: 'assets/audio/combat-start.mp3' },
            { id: 'combat-end', url: 'assets/audio/combat-end.mp3' },
            { id: 'turn-start', url: 'assets/audio/turn-start.mp3' },
            { id: 'turn-end', url: 'assets/audio/turn-end.mp3' },
            { id: 'hit', url: 'assets/audio/hit.mp3' },
            { id: 'miss', url: 'assets/audio/miss.mp3' },
            { id: 'critical-hit', url: 'assets/audio/critical-hit.mp3' },
            { id: 'critical-miss', url: 'assets/audio/critical-miss.mp3' },
            { id: 'heal', url: 'assets/audio/heal.mp3' },
            { id: 'death', url: 'assets/audio/death.mp3' },
            { id: 'timer-end', url: 'assets/audio/timer-end.mp3' },
            { id: 'button-click', url: 'assets/audio/button-click.mp3' },
            { id: 'notification', url: 'assets/audio/notification.mp3' }
        ];
        
        // Default music
        this.defaultMusic = [
            { id: 'combat', name: 'Combat', url: 'assets/audio/music/combat.mp3', loop: true },
            { id: 'tavern', name: 'Tavern', url: 'assets/audio/music/tavern.mp3', loop: true },
            { id: 'dungeon', name: 'Dungeon', url: 'assets/audio/music/dungeon.mp3', loop: true },
            { id: 'forest', name: 'Forest', url: 'assets/audio/music/forest.mp3', loop: true },
            { id: 'city', name: 'City', url: 'assets/audio/music/city.mp3', loop: true }
        ];
        
        // Initialize audio
        this._initAudio();
        
        console.log("Audio module initialized");
    }

    /**
     * Initialize audio
     * @private
     */
    async _initAudio() {
        // Create audio context
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.context = new AudioContext();
        } catch (error) {
            console.warn('Web Audio API not supported');
            return;
        }
        
        // Load default sounds
        for (const sound of this.defaultSounds) {
            await this.loadSound(sound.id, sound.url);
        }
        
        // Load default music
        for (const music of this.defaultMusic) {
            await this.loadMusic(music.id, music.url, music.name, music.loop);
        }
    }

    /**
     * Load a sound effect
     * @param {string} id - Sound ID
     * @param {string} url - Sound URL
     * @returns {Promise<boolean>} Success status
     */
    async loadSound(id, url) {
        // Check if audio context is available
        if (!this.context) {
            return false;
        }
        
        try {
            // Fetch audio file
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            
            // Decode audio data
            const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
            
            // Store sound
            this.sounds[id] = {
                buffer: audioBuffer,
                source: null
            };
            
            return true;
        } catch (error) {
            console.error(`Error loading sound ${id}:`, error);
            return false;
        }
    }

    /**
     * Load background music
     * @param {string} id - Music ID
     * @param {string} url - Music URL
     * @param {string} name - Music name
     * @param {boolean} loop - Whether to loop the music
     * @returns {Promise<boolean>} Success status
     */
    async loadMusic(id, url, name = '', loop = true) {
        try {
            // Create audio element
            const audio = new Audio();
            audio.src = url;
            audio.loop = loop;
            audio.volume = this.musicVolume;
            audio.muted = this.musicMuted;
            
            // Store music
            this.music[id] = {
                audio,
                name: name || id,
                loop
            };
            
            return true;
        } catch (error) {
            console.error(`Error loading music ${id}:`, error);
            return false;
        }
    }

    /**
     * Play a sound effect
     * @param {string} id - Sound ID
     * @param {Object} options - Playback options
     * @param {number} options.volume - Volume (0-1)
     * @param {number} options.pitch - Pitch (0.5-2)
     * @param {boolean} options.loop - Whether to loop the sound
     * @returns {Object|null} Sound source or null if failed
     */
    play(id, options = {}) {
        // Check if audio is muted
        if (this.muted) {
            return null;
        }
        
        // Check if sound exists
        if (!this.sounds[id]) {
            console.warn(`Sound not found: ${id}`);
            return null;
        }
        
        // Check if audio context is available
        if (!this.context) {
            return null;
        }
        
        // Default options
        const {
            volume = 1,
            pitch = 1,
            loop = false
        } = options;
        
        try {
            // Resume audio context if suspended
            if (this.context.state === 'suspended') {
                this.context.resume();
            }
            
            // Create source
            const source = this.context.createBufferSource();
            source.buffer = this.sounds[id].buffer;
            source.loop = loop;
            source.playbackRate.value = pitch;
            
            // Create gain node
            const gainNode = this.context.createGain();
            gainNode.gain.value = volume * this.volume;
            
            // Connect nodes
            source.connect(gainNode);
            gainNode.connect(this.context.destination);
            
            // Play sound
            source.start(0);
            
            // Store source
            this.sounds[id].source = source;
            
            // Clean up when finished
            source.onended = () => {
                if (this.sounds[id].source === source) {
                    this.sounds[id].source = null;
                }
            };
            
            return source;
        } catch (error) {
            console.error(`Error playing sound ${id}:`, error);
            return null;
        }
    }

    /**
     * Stop a sound effect
     * @param {string} id - Sound ID
     * @returns {boolean} Success status
     */
    stop(id) {
        // Check if sound exists
        if (!this.sounds[id] || !this.sounds[id].source) {
            return false;
        }
        
        try {
            // Stop sound
            this.sounds[id].source.stop();
            this.sounds[id].source = null;
            return true;
        } catch (error) {
            console.error(`Error stopping sound ${id}:`, error);
            return false;
        }
    }

    /**
     * Play background music
     * @param {string} id - Music ID
     * @param {Object} options - Playback options
     * @param {boolean} options.fadeIn - Whether to fade in
     * @param {number} options.fadeInDuration - Fade in duration in milliseconds
     * @returns {boolean} Success status
     */
    playMusic(id, options = {}) {
        // Check if music is muted
        if (this.musicMuted) {
            return false;
        }
        
        // Check if music exists
        if (!this.music[id]) {
            console.warn(`Music not found: ${id}`);
            return false;
        }
        
        // Default options
        const {
            fadeIn = false,
            fadeInDuration = 1000
        } = options;
        
        try {
            // Stop current music
            this.stopMusic();
            
            // Get music
            const music = this.music[id];
            
            // Set volume
            if (fadeIn) {
                music.audio.volume = 0;
            } else {
                music.audio.volume = this.musicVolume;
            }
            
            // Play music
            music.audio.play();
            
            // Fade in
            if (fadeIn) {
                const startTime = Date.now();
                const fadeInterval = setInterval(() => {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(1, elapsed / fadeInDuration);
                    
                    music.audio.volume = progress * this.musicVolume;
                    
                    if (progress >= 1) {
                        clearInterval(fadeInterval);
                    }
                }, 50);
            }
            
            // Set current music
            this.currentMusic = id;
            
            return true;
        } catch (error) {
            console.error(`Error playing music ${id}:`, error);
            return false;
        }
    }

    /**
     * Stop background music
     * @param {Object} options - Stop options
     * @param {boolean} options.fadeOut - Whether to fade out
     * @param {number} options.fadeOutDuration - Fade out duration in milliseconds
     * @returns {boolean} Success status
     */
    stopMusic(options = {}) {
        // Check if music is playing
        if (!this.currentMusic) {
            return false;
        }
        
        // Default options
        const {
            fadeOut = false,
            fadeOutDuration = 1000
        } = options;
        
        try {
            // Get music
            const music = this.music[this.currentMusic];
            
            // Fade out
            if (fadeOut) {
                const startVolume = music.audio.volume;
                const startTime = Date.now();
                
                const fadeInterval = setInterval(() => {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(1, elapsed / fadeOutDuration);
                    
                    music.audio.volume = startVolume * (1 - progress);
                    
                    if (progress >= 1) {
                        clearInterval(fadeInterval);
                        music.audio.pause();
                        music.audio.currentTime = 0;
                    }
                }, 50);
            } else {
                // Stop music
                music.audio.pause();
                music.audio.currentTime = 0;
            }
            
            // Clear current music
            this.currentMusic = null;
            
            return true;
        } catch (error) {
            console.error('Error stopping music:', error);
            return false;
        }
    }

    /**
     * Pause background music
     * @returns {boolean} Success status
     */
    pauseMusic() {
        // Check if music is playing
        if (!this.currentMusic) {
            return false;
        }
        
        try {
            // Pause music
            this.music[this.currentMusic].audio.pause();
            return true;
        } catch (error) {
            console.error('Error pausing music:', error);
            return false;
        }
    }

    /**
     * Resume background music
     * @returns {boolean} Success status
     */
    resumeMusic() {
        // Check if music is paused
        if (!this.currentMusic) {
            return false;
        }
        
        try {
            // Resume music
            this.music[this.currentMusic].audio.play();
            return true;
        } catch (error) {
            console.error('Error resuming music:', error);
            return false;
        }
    }

    /**
     * Set volume
     * @param {number} volume - Volume (0-1)
     */
    setVolume(volume) {
        // Clamp volume
        this.volume = Math.max(0, Math.min(1, volume));
        
        // Save to settings
        this.settings.setVolume(this.volume);
    }

    /**
     * Set music volume
     * @param {number} volume - Volume (0-1)
     */
    setMusicVolume(volume) {
        // Clamp volume
        this.musicVolume = Math.max(0, Math.min(1, volume));
        
        // Update current music
        if (this.currentMusic) {
            this.music[this.currentMusic].audio.volume = this.musicVolume;
        }
        
        // Save to settings
        this.settings.setMusicVolume(this.musicVolume);
    }

    /**
     * Mute all audio
     * @param {boolean} muted - Muted state
     */
    setMuted(muted) {
        this.muted = muted;
        
        // Save to settings
        this.settings.setSoundsEnabled(!muted);
    }

    /**
     * Mute music
     * @param {boolean} muted - Muted state
     */
    setMusicMuted(muted) {
        this.musicMuted = muted;
        
        // Update current music
        if (this.currentMusic) {
            this.music[this.currentMusic].audio.muted = muted;
        }
        
        // Save to settings
        this.settings.setMusicEnabled(!muted);
    }

    /**
     * Toggle mute
     * @returns {boolean} New muted state
     */
    toggleMute() {
        this.setMuted(!this.muted);
        return this.muted;
    }

    /**
     * Toggle music mute
     * @returns {boolean} New muted state
     */
    toggleMusicMute() {
        this.setMusicMuted(!this.musicMuted);
        return this.musicMuted;
    }

    /**
     * Get all sounds
     * @returns {Object} Sounds
     */
    getSounds() {
        const sounds = {};
        
        Object.keys(this.sounds).forEach(id => {
            sounds[id] = {
                id,
                loaded: !!this.sounds[id].buffer,
                playing: !!this.sounds[id].source
            };
        });
        
        return sounds;
    }

    /**
     * Get all music
     * @returns {Object} Music
     */
    getMusic() {
        const music = {};
        
        Object.keys(this.music).forEach(id => {
            music[id] = {
                id,
                name: this.music[id].name,
                loaded: !!this.music[id].audio,
                playing: this.currentMusic === id
            };
        });
        
        return music;
    }

    /**
     * Get current music
     * @returns {string|null} Current music ID
     */
    getCurrentMusic() {
        return this.currentMusic;
    }

    /**
     * Check if a sound is playing
     * @param {string} id - Sound ID
     * @returns {boolean} True if playing
     */
    isPlaying(id) {
        return !!this.sounds[id] && !!this.sounds[id].source;
    }

    /**
     * Check if music is playing
     * @returns {boolean} True if playing
     */
    isMusicPlaying() {
        return !!this.currentMusic && !this.music[this.currentMusic].audio.paused;
    }

    /**
     * Check if audio is muted
     * @returns {boolean} True if muted
     */
    isMuted() {
        return this.muted;
    }

    /**
     * Check if music is muted
     * @returns {boolean} True if muted
     */
    isMusicMuted() {
        return this.musicMuted;
    }

    /**
     * Get volume
     * @returns {number} Volume (0-1)
     */
    getVolume() {
        return this.volume;
    }

    /**
     * Get music volume
     * @returns {number} Volume (0-1)
     */
    getMusicVolume() {
        return this.musicVolume;
    }

    /**
     * Play a sequence of sounds
     * @param {Array} sequence - Array of sound IDs or objects
     * @param {Object} options - Sequence options
     * @param {number} options.interval - Interval between sounds in milliseconds
     * @param {boolean} options.loop - Whether to loop the sequence
     * @returns {Object} Sequence controller
     */
    playSequence(sequence, options = {}) {
        // Default options
        const {
            interval = 500,
            loop = false
        } = options;
        
        // Variables
        let currentIndex = 0;
        let intervalId = null;
        let playing = false;
        
        // Play function
        const playNext = () => {
            // Check if sequence is complete
            if (currentIndex >= sequence.length) {
                if (loop) {
                    currentIndex = 0;
                } else {
                    stop();
                    return;
                }
            }
            
            // Get sound
            const sound = sequence[currentIndex];
            
            // Play sound
            if (typeof sound === 'string') {
                this.play(sound);
            } else {
                this.play(sound.id, sound.options);
            }
            
            // Increment index
            currentIndex++;
        };
        
        // Start function
        const start = () => {
            if (playing) return;
            
            playing = true;
            currentIndex = 0;
            
            // Play first sound
            playNext();
            
            // Set interval
            intervalId = setInterval(playNext, interval);
        };
        
        // Stop function
        const stop = () => {
            if (!playing) return;
            
            playing = false;
            
            // Clear interval
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
        };
        
        // Start sequence
        start();
        
        // Return controller
        return {
            start,
            stop,
            isPlaying: () => playing,
            setInterval: (newInterval) => {
                interval = newInterval;
                
                if (playing) {
                    // Restart interval
                    clearInterval(intervalId);
                    intervalId = setInterval(playNext, interval);
                }
            }
        };
    }

    /**
     * Create a sound mixer
     * @param {Array} tracks - Array of track objects
     * @returns {Object} Mixer controller
     */
    createMixer(tracks) {
        // Create audio elements for each track
        const audioTracks = tracks.map(track => {
            const audio = new Audio();
            audio.src = track.url;
            audio.loop = true;
            audio.volume = track.volume || 0;
            audio.muted = this.musicMuted;
            
            return {
                id: track.id,
                name: track.name || track.id,
                audio,
                volume: track.volume || 0
            };
        });
        
        // Variables
        let playing = false;
        
        // Start function
        const start = () => {
            if (playing) return;
            
            playing = true;
            
            // Play all tracks
            audioTracks.forEach(track => {
                track.audio.play();
            });
        };
        
        // Stop function
        const stop = () => {
            if (!playing) return;
            
            playing = false;
            
            // Stop all tracks
            audioTracks.forEach(track => {
                track.audio.pause();
                track.audio.currentTime = 0;
            });
        };
        
        // Set track volume
        const setTrackVolume = (id, volume) => {
            // Find track
            const track = audioTracks.find(t => t.id === id);
            if (!track) return false;
            
            // Set volume
            track.volume = Math.max(0, Math.min(1, volume));
            track.audio.volume = track.volume * this.musicVolume;
            
            return true;
        };
        
        // Get track volume
        const getTrackVolume = (id) => {
            // Find track
            const track = audioTracks.find(t => t.id === id);
            if (!track) return 0;
            
            return track.volume;
        };
        
        // Update volumes when music volume changes
        const updateVolumes = () => {
            audioTracks.forEach(track => {
                track.audio.volume = track.volume * this.musicVolume;
                track.audio.muted = this.musicMuted;
            });
        };
        
        // Add event listener for volume changes
        this.addEventListener('volumeChange', updateVolumes);
        
        // Return controller
        return {
            start,
            stop,
            isPlaying: () => playing,
            setTrackVolume,
            getTrackVolume,
            getTracks: () => audioTracks.map(track => ({
                id: track.id,
                name: track.name,
                volume: track.volume
            })),
            destroy: () => {
                // Stop all tracks
                stop();
                
                // Remove event listener
                this.removeEventListener('volumeChange', updateVolumes);
            }
        };
    }

    /**
     * Add event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     * @returns {string} Listener ID
     */
    addEventListener(event, callback) {
        // Generate ID
        const id = `listener-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        
        // Initialize event array if needed
        if (!this.eventListeners) {
            this.eventListeners = {};
        }
        
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = {};
        }
        
        // Add listener
        this.eventListeners[event][id] = callback;
        
        // Return ID
        return id;
    }

    /**
     * Remove event listener
     * @param {string} event - Event name
     * @param {string} id - Listener ID
     * @returns {boolean} Success status
     */
    removeEventListener(event, id) {
        // Check if event exists
        if (!this.eventListeners || !this.eventListeners[event]) {
            return false;
        }
        
        // Check if listener exists
        if (!this.eventListeners[event][id]) {
            return false;
        }
        
        // Remove listener
        delete this.eventListeners[event][id];
        
        return true;
    }

    /**
     * Trigger event
     * @private
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    _triggerEvent(event, data) {
        // Check if event exists
        if (!this.eventListeners || !this.eventListeners[event]) {
            return;
        }
        
        // Call listeners
        Object.values(this.eventListeners[event]).forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in ${event} event listener:`, error);
            }
        });
    }

    /**
     * Load a custom sound
     * @param {string} id - Sound ID
     * @param {File} file - Audio file
     * @returns {Promise<boolean>} Success status
     */
    async loadCustomSound(id, file) {
        // Check if audio context is available
        if (!this.context) {
            return false;
        }
        
        try {
            // Read file
            const arrayBuffer = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => resolve(event.target.result);
                reader.onerror = reject;
                reader.readAsArrayBuffer(file);
            });
            
            // Decode audio data
            const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
            
            // Store sound
            this.sounds[id] = {
                buffer: audioBuffer,
                source: null,
                custom: true
            };
            
            return true;
        } catch (error) {
            console.error(`Error loading custom sound ${id}:`, error);
            return false;
        }
    }

    /**
     * Load a custom music track
     * @param {string} id - Music ID
     * @param {File} file - Audio file
     * @param {string} name - Music name
     * @param {boolean} loop - Whether to loop the music
     * @returns {Promise<boolean>} Success status
     */
    async loadCustomMusic(id, file, name = '', loop = true) {
        try {
            // Create object URL
            const url = URL.createObjectURL(file);
            
            // Create audio element
            const audio = new Audio();
            audio.src = url;
            audio.loop = loop;
            audio.volume = this.musicVolume;
            audio.muted = this.musicMuted;
            
            // Store music
            this.music[id] = {
                audio,
                name: name || id,
                loop,
                custom: true,
                url
            };
            
            return true;
        } catch (error) {
            console.error(`Error loading custom music ${id}:`, error);
            return false;
        }
    }

    /**
     * Remove a custom sound
     * @param {string} id - Sound ID
     * @returns {boolean} Success status
     */
    removeCustomSound(id) {
        // Check if sound exists
        if (!this.sounds[id] || !this.sounds[id].custom) {
            return false;
        }
        
        // Stop sound if playing
        this.stop(id);
        
        // Remove sound
        delete this.sounds[id];
        
        return true;
    }

    /**
     * Remove a custom music track
     * @param {string} id - Music ID
     * @returns {boolean} Success status
     */
    removeCustomMusic(id) {
        // Check if music exists
        if (!this.music[id] || !this.music[id].custom) {
            return false;
        }
        
        // Stop music if playing
        if (this.currentMusic === id) {
            this.stopMusic();
        }
        
        // Revoke object URL
        if (this.music[id].url) {
            URL.revokeObjectURL(this.music[id].url);
        }
        
        // Remove music
        delete this.music[id];
        
        return true;
    }
}

// Export the Audio class
export default Audio;
