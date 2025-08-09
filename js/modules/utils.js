/**
 * Utility functions for Jesster's Combat Tracker
 */
class Utils {
    constructor() {
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
     * Format a date
     * @param {Date} date - The date to format
     * @returns {string} - The formatted date
     */
    formatDate(date) {
        return date.toLocaleString();
    }
    
    /**
     * Format a time
     * @param {Date} date - The date to format
     * @returns {string} - The formatted time
     */
    formatTime(date) {
        return date.toLocaleTimeString();
    }
    
    /**
     * Deep clone an object
     * @param {any} obj - The object to clone
     * @returns {any} - The cloned object
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
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
     * Parse a dice notation string
     * @param {string} notation - The dice notation (e.g., "2d6+3")
     * @returns {Object} - The parsed dice notation
     */
    parseDiceNotation(notation) {
        // Remove all spaces
        notation = notation.replace(/\s+/g, '');
        
        // Match dice notation pattern
        const pattern = /^(\d+)?d(\d+)([+-]\d+)?$/i;
        const match = notation.match(pattern);
        
        if (!match) {
            return null;
        }
        
        // Extract count, dice, and modifier
        const count = match[1] ? parseInt(match[1]) : 1;
        const dice = parseInt(match[2]);
        const modifier = match[3] ? parseInt(match[3]) : 0;
        
        return {
            count,
            dice,
            modifier
        };
    }
    
    /**
     * Roll dice based on notation
     * @param {string} notation - The dice notation (e.g., "2d6+3")
     * @returns {Object} - The roll result
     */
    rollDice(notation) {
        const parsed = this.parseDiceNotation(notation);
        if (!parsed) {
            return null;
        }
        
        const { count, dice, modifier } = parsed;
        
        // Roll the dice
        const rolls = [];
        for (let i = 0; i < count; i++) {
            rolls.push(Math.floor(Math.random() * dice) + 1);
        }
        
        // Calculate the total
        const total = rolls.reduce((sum, roll) => sum + roll, 0) + modifier;
        
        return {
            notation,
            count,
            dice,
            modifier,
            rolls,
            total
        };
    }
    
    /**
     * Calculate average damage from dice notation
     * @param {string} notation - The dice notation (e.g., "2d6+3")
     * @returns {number} - The average damage
     */
    calculateAverageDamage(notation) {
        const parsed = this.parseDiceNotation(notation);
        if (!parsed) {
            return 0;
        }
        
        const { count, dice, modifier } = parsed;
        
        // Calculate average damage
        // Average of a die is (max + min) / 2
        const averageDie = (dice + 1) / 2;
        const averageDamage = count * averageDie + modifier;
        
        return averageDamage;
    }
    
    /**
     * Format a modifier
     * @param {number} modifier - The modifier
     * @returns {string} - The formatted modifier
     */
    formatModifier(modifier) {
        return modifier >= 0 ? `+${modifier}` : `${modifier}`;
    }
    
    /**
     * Calculate a modifier from an ability score
     * @param {number} score - The ability score
     * @returns {number} - The modifier
     */
    calculateModifier(score) {
        return Math.floor((score - 10) / 2);
    }
    
    /**
     * Format an ability score with modifier
     * @param {number} score - The ability score
     * @returns {string} - The formatted ability score
     */
    formatAbilityScore(score) {
        const modifier = this.calculateModifier(score);
        return `${score} (${this.formatModifier(modifier)})`;
    }
    
    /**
     * Convert a challenge rating to XP
     * @param {string|number} cr - The challenge rating
     * @returns {number} - The XP value
     */
    crToXP(cr) {
        const crToXPMap = {
            '0': 10,
            '1/8': 25,
            '1/4': 50,
            '1/2': 100,
            '1': 200,
            '2': 450,
            '3': 700,
            '4': 1100,
            '5': 1800,
            '6': 2300,
            '7': 2900,
            '8': 3900,
            '9': 5000,
            '10': 5900,
            '11': 7200,
            '12': 8400,
            '13': 10000,
            '14': 11500,
            '15': 13000,
            '16': 15000,
            '17': 18000,
            '18': 20000,
            '19': 22000,
            '20': 25000,
            '21': 33000,
            '22': 41000,
            '23': 50000,
            '24': 62000,
            '25': 75000,
            '26': 90000,
            '27': 105000,
            '28': 120000,
            '29': 135000,
            '30': 155000
        };
        
        // Convert number to string for lookup
        const crString = cr.toString();
        
        return crToXPMap[crString] || 0;
    }
    
    /**
     * Calculate encounter difficulty
     * @param {Array} monsters - Array of monsters with CR
     * @param {Array} players - Array of players with level
     * @returns {Object} - Encounter difficulty information
     */
    calculateEncounterDifficulty(monsters, players) {
        // Calculate total XP
        const totalXP = monsters.reduce((sum, monster) => sum + this.crToXP(monster.cr), 0);
        
        // Calculate XP thresholds for the party
        const thresholds = {
            easy: 0,
            medium: 0,
            hard: 0,
            deadly: 0
        };
        
        // XP thresholds by character level
        const xpThresholds = {
            1: { easy: 25, medium: 50, hard: 75, deadly: 100 },
            2: { easy: 50, medium: 100, hard: 150, deadly: 200 },
            3: { easy: 75, medium: 150, hard: 225, deadly: 400 },
            4: { easy: 125, medium: 250, hard: 375, deadly: 500 },
            5: { easy: 250, medium: 500, hard: 750, deadly: 1100 },
            6: { easy: 300, medium: 600, hard: 900, deadly: 1400 },
            7: { easy: 350, medium: 750, hard: 1100, deadly: 1700 },
            8: { easy: 450, medium: 900, hard: 1400, deadly: 2100 },
            9: { easy: 550, medium: 1100, hard: 1600, deadly: 2400 },
            10: { easy: 600, medium: 1200, hard: 1900, deadly: 2800 },
            11: { easy: 800, medium: 1600, hard: 2400, deadly: 3600 },
            12: { easy: 1000, medium: 2000, hard: 3000, deadly: 4500 },
            13: { easy: 1100, medium: 2200, hard: 3400, deadly: 5100 },
            14: { easy: 1250, medium: 2500, hard: 3800, deadly: 5700 },
            15: { easy: 1400, medium: 2800, hard: 4300, deadly: 6400 },
            16: { easy: 1600, medium: 3200, hard: 4800, deadly: 7200 },
            17: { easy: 2000, medium: 3900, hard: 5900, deadly: 8800 },
            18: { easy: 2100, medium: 4200, hard: 6300, deadly: 9500 },
            19: { easy: 2400, medium: 4900, hard: 7300, deadly: 10900 },
            20: { easy: 2800, medium: 5700, hard: 8500, deadly: 12700 }
        };
        
        // Calculate thresholds for the party
        players.forEach(player => {
            const level = Math.min(Math.max(player.level, 1), 20);
            thresholds.easy += xpThresholds[level].easy;
            thresholds.medium += xpThresholds[level].medium;
            thresholds.hard += xpThresholds[level].hard;
            thresholds.deadly += xpThresholds[level].deadly;
        });
        
        // Apply multiplier based on number of monsters
        let multiplier = 1;
        if (monsters.length === 2) {
            multiplier = 1.5;
        } else if (monsters.length >= 3 && monsters.length <= 6) {
            multiplier = 2;
        } else if (monsters.length >= 7 && monsters.length <= 10) {
            multiplier = 2.5;
        } else if (monsters.length >= 11 && monsters.length <= 14) {
            multiplier = 3;
        } else if (monsters.length >= 15) {
            multiplier = 4;
        }
        
        const adjustedXP = totalXP * multiplier;
        
        // Determine difficulty
        let difficulty = 'trivial';
        if (adjustedXP >= thresholds.deadly) {
            difficulty = 'deadly';
        } else if (adjustedXP >= thresholds.hard) {
            difficulty = 'hard';
        } else if (adjustedXP >= thresholds.medium) {
            difficulty = 'medium';
        } else if (adjustedXP >= thresholds.easy) {
            difficulty = 'easy';
        }
        
        return {
            totalXP,
            adjustedXP,
            thresholds,
            difficulty
        };
    }
}
