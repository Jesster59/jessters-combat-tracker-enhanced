/**
 * Utility functions for Jesster's Combat Tracker
 */
class Utils {
    constructor(app) {
        this.app = app;
        console.log("Utils initialized");
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
        return Math.random().toString(36).substring(2, 10);
    }
    
    /**
     * Format a modifier
     * @param {number} modifier - The modifier to format
     * @returns {string} - The formatted modifier
     */
    formatModifier(modifier) {
        return modifier >= 0 ? `+${modifier}` : `${modifier}`;
    }
    
    /**
     * Get the modifier for an ability score
     * @param {number} score - The ability score
     * @returns {number} - The modifier
     */
    getAbilityModifier(score) {
        return Math.floor((score - 10) / 2);
    }
    
    /**
     * Get HP status based on current and max HP
     * @param {number} current - Current HP
     * @param {number} max - Max HP
     * @returns {Object} - Status object with text and color
     */
    getHpStatus(current, max) {
        const percentage = (current / max) * 100;
        
        if (current <= 0) {
            return { text: 'Unconscious', color: 'bg-red-800' };
        } else if (percentage <= 25) {
            return { text: 'Critical', color: 'bg-red-600' };
        } else if (percentage <= 50) {
            return { text: 'Bloodied', color: 'bg-orange-600' };
        } else if (percentage <= 75) {
            return { text: 'Injured', color: 'bg-yellow-600' };
        } else {
            return { text: 'Healthy', color: 'bg-green-600' };
        }
    }
    
    /**
     * Format a date
     * @param {Date|number|string} date - The date to format
     * @returns {string} - The formatted date
     */
    formatDate(date) {
        const d = new Date(date);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
    }
    
    /**
     * Format elapsed time
     * @param {number} milliseconds - The elapsed time in milliseconds
     * @returns {string} - The formatted time
     */
    formatElapsedTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
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
     * Deep clone an object
     * @param {Object} obj - The object to clone
     * @returns {Object} - The cloned object
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
    
    /**
     * Check if an object is empty
     * @param {Object} obj - The object to check
     * @returns {boolean} - Whether the object is empty
     */
    isEmptyObject(obj) {
        return Object.keys(obj).length === 0;
    }
    
    /**
     * Sanitize HTML to prevent XSS
     * @param {string} html - The HTML to sanitize
     * @returns {string} - The sanitized HTML
     */
    sanitizeHTML(html) {
        const element = document.createElement('div');
        element.textContent = html;
        return element.innerHTML;
    }
    
    /**
     * Get the ordinal suffix for a number
     * @param {number} n - The number
     * @returns {string} - The ordinal suffix
     */
    getOrdinalSuffix(n) {
        const s = ['th', 'st', 'nd', 'rd'];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    }
    
    /**
     * Calculate average damage from a dice expression
     * @param {string} diceExpression - The dice expression (e.g., "2d6+3")
     * @returns {number} - The average damage
     */
    calculateAverageDamage(diceExpression) {
        try {
            // Parse the dice expression
            const match = diceExpression.match(/(\d+)d(\d+)(?:\s*([+-])\s*(\d+))?/);
            if (!match) return 0;
            
            const numDice = parseInt(match[1]);
            const diceSize = parseInt(match[2]);
            const modifier = match[3] && match[4] ? (match[3] === '+' ? parseInt(match[4]) : -parseInt(match[4])) : 0;
            
            // Calculate average
            const averageDie = (diceSize + 1) / 2;
            return numDice * averageDie + modifier;
        } catch (error) {
            console.error('Error calculating average damage:', error);
            return 0;
        }
    }
    
    /**
     * Parse a dice expression
     * @param {string} expression - The dice expression
     * @returns {Object} - The parsed expression
     */
    parseDiceExpression(expression) {
        try {
            const result = {
                numDice: 0,
                diceSize: 0,
                modifier: 0,
                original: expression
            };
            
            const match = expression.match(/(\d+)d(\d+)(?:\s*([+-])\s*(\d+))?/);
            if (!match) return result;
            
            result.numDice = parseInt(match[1]);
            result.diceSize = parseInt(match[2]);
            
            if (match[3] && match[4]) {
                result.modifier = match[3] === '+' ? parseInt(match[4]) : -parseInt(match[4]);
            }
            
            return result;
        } catch (error) {
            console.error('Error parsing dice expression:', error);
            return {
                numDice: 0,
                diceSize: 0,
                modifier: 0,
                original: expression
            };
        }
    }
}
