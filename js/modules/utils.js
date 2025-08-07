/**
 * Utility functions for Jesster's Combat Tracker
 */
class Utils {
    constructor(app) {
        this.app = app;
    }
    
    /**
     * Format a time duration in milliseconds
     * @param {number} ms - The duration in milliseconds
     * @returns {string} - The formatted duration
     */
    formatTime(ms) {
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        const hours = Math.floor(ms / (1000 * 60 * 60));
        
        if (hours > 0) {
            return `${hours}h ${minutes}m ${seconds}s`;
        } else {
            return `${minutes}m ${seconds}s`;
        }
    }
    
    /**
     * Generate a UUID
     * @returns {string} - A UUID
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    /**
     * Generate a short ID
     * @returns {string} - A short ID
     */
    generateShortId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    }
    
    /**
     * Deep clone an object
     * @param {Object} obj - The object to clone
     * @returns {Object} - The cloned object
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
    
    /**
     * Calculate ability modifier from ability score
     * @param {number} score - The ability score
     * @returns {number} - The ability modifier
     */
    getAbilityModifier(score) {
        return Math.floor((score - 10) / 2);
    }
    
    /**
     * Format ability modifier as string (e.g., "+3" or "-1")
     * @param {number} modifier - The ability modifier
     * @returns {string} - The formatted modifier
     */
    formatModifier(modifier) {
        return modifier >= 0 ? `+${modifier}` : `${modifier}`;
    }
    
    /**
     * Debounce a function
     * @param {Function} func - The function to debounce
     * @param {number} wait - The debounce wait time in milliseconds
     * @returns {Function} - The debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
    
    /**
     * Throttle a function
     * @param {Function} func - The function to throttle
     * @param {number} limit - The throttle limit in milliseconds
     * @returns {Function} - The throttled function
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    /**
     * Check if a string is a valid dice notation
     * @param {string} notation - The dice notation to check
     * @returns {boolean} - Whether the notation is valid
     */
    isValidDiceNotation(notation) {
        return /^(\d*d\d+|\d+)([+\-*/]\s*(\d*d\d+|\d+))*$/.test(notation.replace(/\s/g, ''));
    }
    
    /**
     * Parse dice notation into components
     * @param {string} notation - The dice notation to parse
     * @returns {Object} - The parsed components
     */
    parseDiceNotation(notation) {
        const cleanNotation = notation.replace(/\s/g, '');
        const match = cleanNotation.match(/^(\d*)d(\d+)([+\-]\d+)?$/);
        
        if (!match) return null;
        
        const numDice = match[1] ? parseInt(match[1]) : 1;
        const numSides = parseInt(match[2]);
        const modifier = match[3] ? parseInt(match[3]) : 0;
        
        return { numDice, numSides, modifier };
    }
    
    /**
     * Get a descriptive HP status based on current/max HP
     * @param {number} current - Current HP
     * @param {number} max - Maximum HP
     * @returns {Object} - Status object with text and color
     */
    getHpStatus(current, max) {
        if (max <= 0) return { text: 'Unknown', color: 'bg-gray-500' };
        if (current <= 0) return { text: 'Down', color: 'bg-black' };
        
        const percentage = (current / max) * 100;
        
        if (percentage <= 25) return { text: 'Critical', color: 'bg-red-700' };
        if (percentage <= 50) return { text: 'Bloodied', color: 'bg-red-500' };
        if (percentage <= 75) return { text: 'Injured', color: 'bg-yellow-500' };
        if (percentage < 100) return { text: 'Scratched', color: 'bg-green-500' };
        
        return { text: 'Healthy', color: 'bg-emerald-500' };
    }
    
    /**
     * Format a number with ordinal suffix (1st, 2nd, 3rd, etc.)
     * @param {number} n - The number to format
     * @returns {string} - The formatted number
     */
    ordinal(n) {
        const s = ['th', 'st', 'nd', 'rd'];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    }
    
    /**
     * Check if the device is mobile
     * @returns {boolean} - Whether the device is mobile
     */
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    /**
     * Check if the device is in dark mode
     * @returns {boolean} - Whether the device is in dark mode
     */
    isDarkMode() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
}
