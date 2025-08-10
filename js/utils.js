/**
 * Utils class for Jesster's Combat Tracker
 * Contains utility functions used throughout the application
 */
class Utils {
    constructor() {
        console.log("Utils module initialized");
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

    /**
     * Format a number with ordinal suffix (1st, 2nd, 3rd, etc.)
     * @param {number} n - The number to format
     * @returns {string} The formatted number with ordinal suffix
     */
    ordinalSuffix(n) {
        const s = ['th', 'st', 'nd', 'rd'];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    }

    /**
     * Capitalize the first letter of a string
     * @param {string} str - The string to capitalize
     * @returns {string} The capitalized string
     */
    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Convert a string to title case
     * @param {string} str - The string to convert
     * @returns {string} The title case string
     */
    titleCase(str) {
        if (!str) return '';
        return str.toLowerCase().split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Get a random integer between min and max (inclusive)
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Random integer
     */
    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Check if an object is empty
     * @param {Object} obj - The object to check
     * @returns {boolean} True if the object is empty
     */
    isEmptyObject(obj) {
        return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
    }

    /**
     * Format file size in bytes to human-readable format
     * @param {number} bytes - The file size in bytes
     * @returns {string} Formatted file size
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Get URL parameters as an object
     * @returns {Object} URL parameters
     */
    getUrlParams() {
        const params = {};
        new URLSearchParams(window.location.search).forEach((value, key) => {
            params[key] = value;
        });
        return params;
    }

    /**
     * Create URL with query parameters
     * @param {string} baseUrl - Base URL
     * @param {Object} params - Query parameters
     * @returns {string} URL with query parameters
     */
    createUrlWithParams(baseUrl, params) {
        const url = new URL(baseUrl, window.location.origin);
        Object.keys(params).forEach(key => {
            url.searchParams.append(key, params[key]);
        });
        return url.toString();
    }

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>} Success status
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Failed to copy text: ', err);
            return false;
        }
    }

    /**
     * Check if device is mobile
     * @returns {boolean} True if device is mobile
     */
    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * Check if browser supports a specific feature
     * @param {string} feature - Feature to check
     * @returns {boolean} True if feature is supported
     */
    supportsFeature(feature) {
        const features = {
            serviceWorker: 'serviceWorker' in navigator,
            webp: document.createElement('canvas')
                .toDataURL('image/webp').indexOf('data:image/webp') === 0,
            notification: 'Notification' in window,
            localStorage: (() => {
                try {
                    localStorage.setItem('test', 'test');
                    localStorage.removeItem('test');
                    return true;
                } catch (e) {
                    return false;
                }
            })(),
            indexedDB: 'indexedDB' in window
        };
        
        return features[feature] || false;
    }

    /**
     * Format a date relative to now (e.g., "5 minutes ago")
     * @param {Date|string} date - The date to format
     * @returns {string} Relative time string
     */
    timeAgo(date) {
        const now = new Date();
        const past = new Date(date);
        const seconds = Math.floor((now - past) / 1000);
        
        // Time units in seconds
        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };
        
        // Check each interval
        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) {
                return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
            }
        }
        
        return 'just now';
    }

    /**
     * Truncate text to a specific length with ellipsis
     * @param {string} text - Text to truncate
     * @param {number} length - Maximum length
     * @returns {string} Truncated text
     */
    truncateText(text, length = 50) {
        if (!text || text.length <= length) return text;
        return text.substring(0, length - 3) + '...';
    }

    /**
     * Convert a string to kebab-case
     * @param {string} str - String to convert
     * @returns {string} Kebab-case string
     */
    toKebabCase(str) {
        return str
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .replace(/[\s_]+/g, '-')
            .toLowerCase();
    }

    /**
     * Convert a string to camelCase
     * @param {string} str - String to convert
     * @returns {string} camelCase string
     */
    toCamelCase(str) {
        return str
            .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
                index === 0 ? word.toLowerCase() : word.toUpperCase())
            .replace(/\s+/g, '');
    }

    /**
     * Get browser and OS information
     * @returns {Object} Browser and OS info
     */
    getBrowserInfo() {
        const ua = navigator.userAgent;
        let browser = "Unknown";
        let os = "Unknown";
        
        // Detect browser
        if (ua.indexOf("Firefox") > -1) {
            browser = "Firefox";
        } else if (ua.indexOf("SamsungBrowser") > -1) {
            browser = "Samsung Browser";
        } else if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) {
            browser = "Opera";
        } else if (ua.indexOf("Trident") > -1) {
            browser = "Internet Explorer";
        } else if (ua.indexOf("Edge") > -1) {
            browser = "Edge";
        } else if (ua.indexOf("Chrome") > -1) {
            browser = "Chrome";
        } else if (ua.indexOf("Safari") > -1) {
            browser = "Safari";
        }
        
        // Detect OS
        if (ua.indexOf("Windows") > -1) {
            os = "Windows";
        } else if (ua.indexOf("Mac") > -1) {
            os = "MacOS";
        } else if (ua.indexOf("Linux") > -1) {
            os = "Linux";
        } else if (ua.indexOf("Android") > -1) {
            os = "Android";
        } else if (ua.indexOf("iPhone") > -1 || ua.indexOf("iPad") > -1) {
            os = "iOS";
        }
        
        return { browser, os };
    }
}

// Export the Utils class
export default Utils;
