/**
 * Timer module for Jesster's Combat Tracker
 * Handles turn timers and other time-related functionality
 */
class Timer {
    constructor(settings, audio) {
        // Store references to other modules
        this.settings = settings;
        this.audio = audio;
        
        // Timer state
        this.timers = {};
        this.activeTimers = new Set();
        
        // Default timer settings
        this.defaults = {
            turnTimer: {
                duration: this.settings.getTurnTimerDuration() || 60,
                warning: this.settings.getTurnTimerWarning() || 10,
                autoEnd: this.settings.shouldTurnTimerAutoEnd() || false,
                sound: true
            },
            roundTimer: {
                duration: 300, // 5 minutes
                warning: 60,   // 1 minute
                autoEnd: false,
                sound: true
            },
            shortRest: {
                duration: 3600, // 1 hour
                warning: 300,   // 5 minutes
                autoEnd: false,
                sound: true
            },
            longRest: {
                duration: 28800, // 8 hours
                warning: 1800,   // 30 minutes
                autoEnd: false,
                sound: true
            },
            custom: {
                duration: 300,
                warning: 60,
                autoEnd: false,
                sound: true
            }
        };
        
        // Event callbacks
        this.callbacks = {
            onTimerStart: {},
            onTimerTick: {},
            onTimerWarning: {},
            onTimerPause: {},
            onTimerResume: {},
            onTimerEnd: {},
            onTimerCancel: {}
        };
        
        console.log("Timer module initialized");
    }

    /**
     * Create a new timer
     * @param {string} id - Timer ID
     * @param {Object} options - Timer options
     * @param {number} options.duration - Duration in seconds
     * @param {number} options.warning - Warning threshold in seconds
     * @param {boolean} options.autoEnd - Whether to automatically end when time is up
     * @param {boolean} options.sound - Whether to play sounds
     * @param {string} options.type - Timer type (turnTimer, roundTimer, shortRest, longRest, custom)
     * @returns {Object} Timer object
     */
    createTimer(id, options = {}) {
        // Generate ID if not provided
        if (!id) {
            id = `timer-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        }
        
        // Get timer type and default settings
        const type = options.type || 'custom';
        const defaults = this.defaults[type] || this.defaults.custom;
        
        // Create timer object
        const timer = {
            id,
            type,
            duration: options.duration !== undefined ? options.duration : defaults.duration,
            warning: options.warning !== undefined ? options.warning : defaults.warning,
            autoEnd: options.autoEnd !== undefined ? options.autoEnd : defaults.autoEnd,
            sound: options.sound !== undefined ? options.sound : defaults.sound,
            remaining: options.duration !== undefined ? options.duration : defaults.duration,
            startTime: null,
            endTime: null,
            pauseTime: null,
            interval: null,
            status: 'ready', // ready, running, paused, completed, cancelled
            warningTriggered: false,
            label: options.label || type
        };
        
        // Store timer
        this.timers[id] = timer;
        
        return timer;
    }

    /**
     * Start a timer
     * @param {string} id - Timer ID
     * @returns {Object|null} Timer object or null if not found
     */
    startTimer(id) {
        // Find timer
        const timer = this.timers[id];
        if (!timer) {
            console.warn(`Timer not found: ${id}`);
            return null;
        }
        
        // Check if timer is already running
        if (timer.status === 'running') {
            return timer;
        }
        
        // Set timer state
        timer.status = 'running';
        timer.startTime = Date.now();
        timer.endTime = Date.now() + (timer.remaining * 1000);
        timer.warningTriggered = false;
        
        // Add to active timers
        this.activeTimers.add(id);
        
        // Start interval
        timer.interval = setInterval(() => this._updateTimer(id), 1000);
        
        // Trigger callbacks
        this._triggerCallbacks('onTimerStart', id, timer);
        
        return timer;
    }

    /**
     * Pause a timer
     * @param {string} id - Timer ID
     * @returns {Object|null} Timer object or null if not found
     */
    pauseTimer(id) {
        // Find timer
        const timer = this.timers[id];
        if (!timer) {
            console.warn(`Timer not found: ${id}`);
            return null;
        }
        
        // Check if timer is running
        if (timer.status !== 'running') {
            return timer;
        }
        
        // Set timer state
        timer.status = 'paused';
        timer.pauseTime = Date.now();
        
        // Calculate remaining time
        timer.remaining = Math.max(0, Math.ceil((timer.endTime - Date.now()) / 1000));
        
        // Clear interval
        if (timer.interval) {
            clearInterval(timer.interval);
            timer.interval = null;
        }
        
        // Trigger callbacks
        this._triggerCallbacks('onTimerPause', id, timer);
        
        return timer;
    }

    /**
     * Resume a paused timer
     * @param {string} id - Timer ID
     * @returns {Object|null} Timer object or null if not found
     */
    resumeTimer(id) {
        // Find timer
        const timer = this.timers[id];
        if (!timer) {
            console.warn(`Timer not found: ${id}`);
            return null;
        }
        
        // Check if timer is paused
        if (timer.status !== 'paused') {
            return timer;
        }
        
        // Set timer state
        timer.status = 'running';
        timer.endTime = Date.now() + (timer.remaining * 1000);
        
        // Start interval
        timer.interval = setInterval(() => this._updateTimer(id), 1000);
        
        // Add to active timers
        this.activeTimers.add(id);
        
        // Trigger callbacks
        this._triggerCallbacks('onTimerResume', id, timer);
        
        return timer;
    }

    /**
     * Cancel a timer
     * @param {string} id - Timer ID
     * @returns {Object|null} Timer object or null if not found
     */
    cancelTimer(id) {
        // Find timer
        const timer = this.timers[id];
        if (!timer) {
            console.warn(`Timer not found: ${id}`);
            return null;
        }
        
        // Set timer state
        timer.status = 'cancelled';
        
        // Clear interval
        if (timer.interval) {
            clearInterval(timer.interval);
            timer.interval = null;
        }
        
        // Remove from active timers
        this.activeTimers.delete(id);
        
        // Trigger callbacks
        this._triggerCallbacks('onTimerCancel', id, timer);
        
        return timer;
    }

    /**
     * Reset a timer
     * @param {string} id - Timer ID
     * @returns {Object|null} Timer object or null if not found
     */
    resetTimer(id) {
        // Find timer
        const timer = this.timers[id];
        if (!timer) {
            console.warn(`Timer not found: ${id}`);
            return null;
        }
        
        // Cancel timer if running
        if (timer.status === 'running' || timer.status === 'paused') {
            this.cancelTimer(id);
        }
        
        // Reset timer state
        timer.status = 'ready';
        timer.remaining = timer.duration;
        timer.startTime = null;
        timer.endTime = null;
        timer.pauseTime = null;
        timer.warningTriggered = false;
        
        return timer;
    }

    /**
     * Get a timer
     * @param {string} id - Timer ID
     * @returns {Object|null} Timer object or null if not found
     */
    getTimer(id) {
        return this.timers[id] || null;
    }

    /**
     * Get all timers
     * @returns {Object} All timers
     */
    getAllTimers() {
        return { ...this.timers };
    }

    /**
     * Get active timers
     * @returns {Array} Active timers
     */
    getActiveTimers() {
        return Array.from(this.activeTimers).map(id => this.timers[id]).filter(timer => timer);
    }

    /**
     * Update timer state
     * @private
     * @param {string} id - Timer ID
     */
    _updateTimer(id) {
        // Find timer
        const timer = this.timers[id];
        if (!timer || timer.status !== 'running') {
            return;
        }
        
        // Calculate remaining time
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((timer.endTime - now) / 1000));
        
        // Update timer
        timer.remaining = remaining;
        
        // Check if timer has ended
        if (remaining <= 0) {
            // Play sound
            if (timer.sound && this.audio) {
                this.audio.play('timer-end');
            }
            
            // Set timer state
            timer.status = 'completed';
            timer.remaining = 0;
            
            // Clear interval
            if (timer.interval) {
                clearInterval(timer.interval);
                timer.interval = null;
            }
            
            // Remove from active timers
            this.activeTimers.delete(id);
            
            // Trigger callbacks
            this._triggerCallbacks('onTimerEnd', id, timer);
            
            return;
        }
        
        // Check if warning threshold is reached
        if (!timer.warningTriggered && remaining <= timer.warning) {
            // Play warning sound
            if (timer.sound && this.audio) {
                this.audio.play('turn-end');
            }
            
            // Set warning flag
            timer.warningTriggered = true;
            
            // Trigger callbacks
            this._triggerCallbacks('onTimerWarning', id, timer);
        }
        
        // Trigger tick callbacks
        this._triggerCallbacks('onTimerTick', id, timer);
    }

    /**
     * Register a callback
     * @param {string} event - Event name
     * @param {string} id - Callback ID
     * @param {Function} callback - Callback function
     * @returns {boolean} Success status
     */
    on(event, id, callback) {
        if (!this.callbacks[event]) {
            console.warn(`Unknown event: ${event}`);
            return false;
        }
        
        this.callbacks[event][id] = callback;
        return true;
    }

    /**
     * Unregister a callback
     * @param {string} event - Event name
     * @param {string} id - Callback ID
     * @returns {boolean} Success status
     */
    off(event, id) {
        if (!this.callbacks[event]) {
            console.warn(`Unknown event: ${event}`);
            return false;
        }
        
        if (this.callbacks[event][id]) {
            delete this.callbacks[event][id];
            return true;
        }
        
        return false;
    }

    /**
     * Trigger callbacks for an event
     * @private
     * @param {string} event - Event name
     * @param {string} timerId - Timer ID
     * @param {Object} timer - Timer object
     */
    _triggerCallbacks(event, timerId, timer) {
        if (!this.callbacks[event]) {
            return;
        }
        
        Object.values(this.callbacks[event]).forEach(callback => {
            try {
                callback(timer, timerId);
            } catch (error) {
                console.error(`Error in ${event} callback:`, error);
            }
        });
    }

    /**
     * Create a turn timer
     * @param {Object} options - Timer options
     * @returns {Object} Timer object
     */
    createTurnTimer(options = {}) {
        // Get default settings
        const defaults = this.defaults.turnTimer;
        
        // Create timer
        return this.createTimer('turn-timer', {
            type: 'turnTimer',
            duration: options.duration !== undefined ? options.duration : defaults.duration,
            warning: options.warning !== undefined ? options.warning : defaults.warning,
            autoEnd: options.autoEnd !== undefined ? options.autoEnd : defaults.autoEnd,
            sound: options.sound !== undefined ? options.sound : defaults.sound,
            label: options.label || 'Turn Timer'
        });
    }

    /**
     * Create a round timer
     * @param {Object} options - Timer options
     * @returns {Object} Timer object
     */
    createRoundTimer(options = {}) {
        // Get default settings
        const defaults = this.defaults.roundTimer;
        
        // Create timer
        return this.createTimer('round-timer', {
            type: 'roundTimer',
            duration: options.duration !== undefined ? options.duration : defaults.duration,
            warning: options.warning !== undefined ? options.warning : defaults.warning,
            autoEnd: options.autoEnd !== undefined ? options.autoEnd : defaults.autoEnd,
            sound: options.sound !== undefined ? options.sound : defaults.sound,
            label: options.label || 'Round Timer'
        });
    }

    /**
     * Create a short rest timer
     * @param {Object} options - Timer options
     * @returns {Object} Timer object
     */
    createShortRestTimer(options = {}) {
        // Get default settings
        const defaults = this.defaults.shortRest;
        
        // Create timer
        return this.createTimer('short-rest', {
            type: 'shortRest',
            duration: options.duration !== undefined ? options.duration : defaults.duration,
            warning: options.warning !== undefined ? options.warning : defaults.warning,
            autoEnd: options.autoEnd !== undefined ? options.autoEnd : defaults.autoEnd,
            sound: options.sound !== undefined ? options.sound : defaults.sound,
            label: options.label || 'Short Rest'
        });
    }

    /**
     * Create a long rest timer
     * @param {Object} options - Timer options
     * @returns {Object} Timer object
     */
    createLongRestTimer(options = {}) {
        // Get default settings
        const defaults = this.defaults.longRest;
        
        // Create timer
        return this.createTimer('long-rest', {
            type: 'longRest',
            duration: options.duration !== undefined ? options.duration : defaults.duration,
            warning: options.warning !== undefined ? options.warning : defaults.warning,
            autoEnd: options.autoEnd !== undefined ? options.autoEnd : defaults.autoEnd,
            sound: options.sound !== undefined ? options.sound : defaults.sound,
            label: options.label || 'Long Rest'
        });
    }

    /**
     * Create a custom timer
     * @param {string} id - Timer ID
     * @param {Object} options - Timer options
     * @returns {Object} Timer object
     */
    createCustomTimer(id, options = {}) {
        // Get default settings
        const defaults = this.defaults.custom;
        
        // Create timer
        return this.createTimer(id, {
            type: 'custom',
            duration: options.duration !== undefined ? options.duration : defaults.duration,
            warning: options.warning !== undefined ? options.warning : defaults.warning,
            autoEnd: options.autoEnd !== undefined ? options.autoEnd : defaults.autoEnd,
            sound: options.sound !== undefined ? options.sound : defaults.sound,
            label: options.label || 'Custom Timer'
        });
    }

    /**
     * Format time in seconds to MM:SS or HH:MM:SS
     * @param {number} seconds - Time in seconds
     * @param {boolean} showHours - Whether to show hours
     * @returns {string} Formatted time
     */
    formatTime(seconds, showHours = false) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (showHours || hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
    }

    /**
     * Parse time string to seconds
     * @param {string} timeString - Time string (MM:SS or HH:MM:SS)
     * @returns {number} Time in seconds
     */
    parseTime(timeString) {
        // Check for empty string
        if (!timeString) {
            return 0;
        }
        
        // Split time string
        const parts = timeString.split(':').map(part => parseInt(part, 10));
        
        // Calculate seconds
        if (parts.length === 3) {
            // HH:MM:SS
            return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
        } else if (parts.length === 2) {
            // MM:SS
            return (parts[0] * 60) + parts[1];
        } else {
            // Invalid format
            return 0;
        }
    }

    /**
     * Update timer settings
     * @param {string} type - Timer type
     * @param {Object} settings - Timer settings
     * @returns {boolean} Success status
     */
    updateTimerSettings(type, settings) {
        if (!this.defaults[type]) {
            console.warn(`Unknown timer type: ${type}`);
            return false;
        }
        
        // Update settings
        this.defaults[type] = { ...this.defaults[type], ...settings };
        
        // Save turn timer settings
        if (type === 'turnTimer') {
            this.settings.set('turnTimerDuration', this.defaults.turnTimer.duration);
            this.settings.set('turnTimerWarning', this.defaults.turnTimer.warning);
            this.settings.set('turnTimerAutoEnd', this.defaults.turnTimer.autoEnd);
        }
        
        return true;
    }

    /**
     * Get timer settings
     * @param {string} type - Timer type
     * @returns {Object|null} Timer settings or null if not found
     */
    getTimerSettings(type) {
        return this.defaults[type] || null;
    }

    /**
     * Get all timer settings
     * @returns {Object} All timer settings
     */
    getAllTimerSettings() {
        return { ...this.defaults };
    }

    /**
     * Add time to a timer
     * @param {string} id - Timer ID
     * @param {number} seconds - Seconds to add
     * @returns {Object|null} Timer object or null if not found
     */
    addTime(id, seconds) {
        // Find timer
        const timer = this.timers[id];
        if (!timer) {
            console.warn(`Timer not found: ${id}`);
            return null;
        }
        
        // Add time
        if (timer.status === 'running') {
            timer.endTime += seconds * 1000;
            timer.remaining = Math.ceil((timer.endTime - Date.now()) / 1000);
        } else {
            timer.remaining += seconds;
            if (timer.remaining < 0) {
                timer.remaining = 0;
            }
        }
        
        return timer;
    }

    /**
     * Subtract time from a timer
     * @param {string} id - Timer ID
     * @param {number} seconds - Seconds to subtract
     * @returns {Object|null} Timer object or null if not found
     */
    subtractTime(id, seconds) {
        return this.addTime(id, -seconds);
    }

    /**
     * Set timer duration
     * @param {string} id - Timer ID
     * @param {number} seconds - Duration in seconds
     * @returns {Object|null} Timer object or null if not found
     */
    setDuration(id, seconds) {
        // Find timer
        const timer = this.timers[id];
        if (!timer) {
            console.warn(`Timer not found: ${id}`);
            return null;
        }
        
        // Set duration
        timer.duration = Math.max(1, seconds);
        
        // Reset timer if not running
        if (timer.status === 'ready') {
            timer.remaining = timer.duration;
        }
        
        return timer;
    }

    /**
     * Get timer progress
     * @param {string} id - Timer ID
     * @returns {number} Progress percentage (0-100)
     */
    getProgress(id) {
        // Find timer
        const timer = this.timers[id];
        if (!timer) {
            console.warn(`Timer not found: ${id}`);
            return 0;
        }
        
        // Calculate progress
        const progress = 100 - ((timer.remaining / timer.duration) * 100);
        
        return Math.min(100, Math.max(0, progress));
    }

    /**
     * Get timer status text
     * @param {string} id - Timer ID
     * @returns {string} Status text
     */
    getStatusText(id) {
        // Find timer
        const timer = this.timers[id];
        if (!timer) {
            console.warn(`Timer not found: ${id}`);
            return 'Not found';
        }
        
        // Get status text
        switch (timer.status) {
            case 'ready':
                return 'Ready';
            case 'running':
                return 'Running';
            case 'paused':
                return 'Paused';
            case 'completed':
                return 'Completed';
            case 'cancelled':
                return 'Cancelled';
            default:
                return 'Unknown';
        }
    }

    /**
     * Check if a timer is active
     * @param {string} id - Timer ID
     * @returns {boolean} True if timer is active
     */
    isActive(id) {
        return this.activeTimers.has(id);
    }

    /**
     * Remove a timer
     * @param {string} id - Timer ID
     * @returns {boolean} Success status
     */
    removeTimer(id) {
        // Find timer
        const timer = this.timers[id];
        if (!timer) {
            console.warn(`Timer not found: ${id}`);
            return false;
        }
        
        // Cancel timer if running
        if (timer.status === 'running' || timer.status === 'paused') {
            this.cancelTimer(id);
        }
        
        // Remove timer
        delete this.timers[id];
        
        return true;
    }

    /**
     * Remove all timers
     * @returns {boolean} Success status
     */
    removeAllTimers() {
        // Cancel all active timers
        this.activeTimers.forEach(id => {
            this.cancelTimer(id);
        });
        
        // Clear timers
        this.timers = {};
        this.activeTimers.clear();
        
        return true;
    }

    /**
     * Create a countdown timer
     * @param {number} seconds - Duration in seconds
     * @param {Function} onTick - Tick callback
     * @param {Function} onComplete - Complete callback
     * @returns {Object} Timer control object
     */
    countdown(seconds, onTick, onComplete) {
        // Create unique ID
        const id = `countdown-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        
        // Create timer
        const timer = this.createTimer(id, {
            type: 'custom',
            duration: seconds,
            warning: Math.min(10, Math.floor(seconds / 10)),
            sound: false,
            label: 'Countdown'
        });
        
        // Register callbacks
        if (onTick) {
            this.on('onTimerTick', id, onTick);
        }
        
        if (onComplete) {
            this.on('onTimerEnd', id, onComplete);
        }
        
        // Start timer
        this.startTimer(id);
        
        // Return control object
        return {
            id,
            pause: () => this.pauseTimer(id),
            resume: () => this.resumeTimer(id),
            cancel: () => {
                this.cancelTimer(id);
                this.off('onTimerTick', id);
                this.off('onTimerEnd', id);
            },
            getRemaining: () => {
                const t = this.getTimer(id);
                return t ? t.remaining : 0;
            },
            addTime: (s) => this.addTime(id, s),
            subtractTime: (s) => this.subtractTime(id, s)
        };
    }

    /**
     * Create a stopwatch
     * @param {Function} onTick - Tick callback
     * @returns {Object} Stopwatch control object
     */
    stopwatch(onTick) {
        // Create unique ID
        const id = `stopwatch-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        
        // Variables
        let startTime = 0;
        let elapsedTime = 0;
        let isRunning = false;
        let interval = null;
        
        // Start function
        const start = () => {
            if (isRunning) return;
            
            isRunning = true;
            startTime = Date.now() - elapsedTime;
            
            interval = setInterval(() => {
                elapsedTime = Date.now() - startTime;
                
                if (onTick) {
                    onTick(Math.floor(elapsedTime / 1000));
                }
            }, 1000);
        };
        
        // Stop function
        const stop = () => {
            if (!isRunning) return;
            
            isRunning = false;
            clearInterval(interval);
        };
        
        // Reset function
        const reset = () => {
            stop();
            elapsedTime = 0;
            
            if (onTick) {
                onTick(0);
            }
        };
        
        // Return control object
        return {
            id,
            start,
            stop,
            reset,
            isRunning: () => isRunning,
            getElapsed: () => Math.floor(elapsedTime / 1000),
            getFormattedTime: () => this.formatTime(Math.floor(elapsedTime / 1000), true)
        };
    }
}

// Export the Timer class
export default Timer;

