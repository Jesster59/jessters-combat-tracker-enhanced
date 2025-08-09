/**
 * Utils class for Jesster's Combat Tracker
 * Contains utility functions used throughout the application
 */
class Utils {
    constructor() {
        console.log("Utils initialized");
    }

    /**
     * Generate a unique ID
     * @returns {string} A unique ID
     */
    generateId() {
        return `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }

    /**
     * Format a date as a string
     * @param {Date} date - The date to format
     * @returns {string} The formatted date
     */
    formatDate(date = new Date()) {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    /**
     * Format a time as a string
     * @param {Date} date - The date to format
     * @returns {string} The formatted time
     */
    formatTime(date = new Date()) {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    /**
     * Calculate ability modifier from ability score
     * @param {number} score - The ability score
     * @returns {number} The ability modifier
     */
    getAbilityModifier(score) {
        return Math.floor((score - 10) / 2);
    }

    /**
     * Format ability modifier as a string with + or -
     * @param {number} modifier - The ability modifier
     * @returns {string} The formatted modifier
     */
    formatModifier(modifier) {
        return modifier >= 0 ? `+${modifier}` : `${modifier}`;
    }

    /**
     * Deep clone an object
     * @param {Object} obj - The object to clone
     * @returns {Object} The cloned object
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * Parse a dice notation string (e.g., "2d6+3")
     * @param {string} notation - The dice notation
     * @returns {Object|null} The parsed dice notation or null if invalid
     */
    parseDiceNotation(notation) {
        if (!notation) return null;
        
        const regex = /^(\d+)?d(\d+)([+-]\d+)?$/i;
        const match = notation.match(regex);
        
        if (!match) return null;
        
        return {
            count: parseInt(match[1] || '1'),
            sides: parseInt(match[2]),
            modifier: parseInt(match[3] || '0')
        };
    }

    /**
     * Format HP for player view based on view mode
     * @param {number} current - Current HP
     * @param {number} max - Max HP
     * @param {string} mode - View mode (descriptive, exact, hidden)
     * @returns {string} Formatted HP string
     */
    formatHpForPlayerView(current, max, mode) {
        if (mode === 'hidden') return '';
        if (mode === 'exact') return `${current}/${max}`;
        
        // Descriptive mode
        const percentage = (current / max) * 100;
        if (current <= 0) return 'Down';
        if (percentage <= 25) return 'Critical';
        if (percentage <= 50) return 'Bloodied';
        if (percentage <= 75) return 'Wounded';
        return 'Healthy';
    }

    /**
     * Evaluate a mathematical expression in string form
     * @param {string} expression - The expression to evaluate
     * @param {number} current - The current value (for relative expressions)
     * @returns {number} The result of the expression
     */
    evaluateMathExpression(expression, current = 0) {
        // Simple and safe evaluation for basic math expressions
        expression = String(expression).trim();
        
        // If it's just a number, parse it
        if (/^-?\d+$/.test(expression)) {
            return parseInt(expression, 10);
        }
        
        // If it's a +/- operation, apply it to current
        if (expression.startsWith('+') || expression.startsWith('-')) {
            const change = parseInt(expression, 10);
            return isNaN(change) ? current : current + change;
        }
        
        // For safety, return current for anything else
        return current;
    }

    /**
     * Sanitize HTML to prevent XSS
     * @param {string} html - The HTML to sanitize
     * @returns {string} The sanitized HTML
     */
    sanitizeHtml(html) {
        const element = document.createElement('div');
        element.textContent = html;
        return element.innerHTML;
    }

    /**
     * Format a challenge rating as a fraction or decimal
     * @param {string|number} cr - The challenge rating
     * @returns {string} The formatted challenge rating
     */
    formatChallengeRating(cr) {
        if (cr === '0') return '0';
        if (cr === '1/8') return '⅛';
        if (cr === '1/4') return '¼';
        if (cr === '1/2') return '½';
        return cr.toString();
    }

    /**
     * Calculate proficiency bonus based on challenge rating or level
     * @param {string|number} crOrLevel - The challenge rating or level
     * @returns {number} The proficiency bonus
     */
    getProficiencyBonus(crOrLevel) {
        let level = crOrLevel;
        
        // Convert CR to number if it's a fraction
        if (typeof crOrLevel === 'string') {
            if (crOrLevel === '1/8') level = 0.125;
            else if (crOrLevel === '1/4') level = 0.25;
            else if (crOrLevel === '1/2') level = 0.5;
            else level = parseFloat(crOrLevel);
        }
        
        return Math.max(2, Math.floor((level - 1) / 4) + 2);
    }

    /**
     * Calculate average result of a dice roll
     * @param {string} diceNotation - Dice notation (e.g., "2d6+3")
     * @returns {number} Average result
     */
    getAverageDiceResult(diceNotation) {
        const parsed = this.parseDiceNotation(diceNotation);
        if (!parsed) return 0;
        
        // Average of a die is (sides + 1) / 2
        const averagePerDie = (parsed.sides + 1) / 2;
        return (parsed.count * averagePerDie) + parsed.modifier;
    }

    /**
     * Convert seconds to a formatted time string (MM:SS)
     * @param {number} seconds - Total seconds
     * @returns {string} Formatted time string
     */
    formatTimeFromSeconds(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Parse a time string (MM:SS) to seconds
     * @param {string} timeString - Time string in MM:SS format
     * @returns {number} Total seconds
     */
    parseTimeToSeconds(timeString) {
        const parts = timeString.split(':');
        if (parts.length !== 2) return 60; // Default to 1 minute if format is wrong
        
        const minutes = parseInt(parts[0], 10) || 0;
        const seconds = parseInt(parts[1], 10) || 0;
        return (minutes * 60) + seconds;
    }

    /**
     * Get color for monster type
     * @param {string} type - Monster type
     * @returns {string} Hex color code
     */
    getColorForMonsterType(type) {
        const typeColors = {
            'aberration': '#8A2BE2',
            'beast': '#8B4513',
            'celestial': '#FFD700',
            'construct': '#B8860B',
            'dragon': '#FF4500',
            'elemental': '#00FFFF',
            'fey': '#FF69B4',
            'fiend': '#FF0000',
            'giant': '#A0522D',
            'humanoid': '#32CD32',
            'monstrosity': '#9932CC',
            'ooze': '#00FF00',
            'plant': '#006400',
            'undead': '#708090'
        };
        
        return typeColors[type.toLowerCase()] || '#808080';
    }

    /**
     * Debounce function to limit how often a function can be called
     * @param {Function} func - Function to debounce
     * @param {number} wait - Milliseconds to wait
     * @returns {Function} Debounced function
     */
    debounce(func, wait = 300) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    /**
     * Throttle function to limit how often a function can be called
     * @param {Function} func - Function to throttle
     * @param {number} limit - Milliseconds to limit
     * @returns {Function} Throttled function
     */
    throttle(func, limit = 300) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Check if a string contains another string, case insensitive
     * @param {string} haystack - String to search in
     * @param {string} needle - String to search for
     * @returns {boolean} True if needle is found in haystack
     */
    caseInsensitiveContains(haystack, needle) {
        return haystack.toLowerCase().includes(needle.toLowerCase());
    }
}
