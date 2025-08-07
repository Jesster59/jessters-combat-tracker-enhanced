/**
 * Dice Roller for Jesster's Combat Tracker
 * Handles dice rolling and results display
 */
class DiceRoller {
    constructor(app) {
        this.app = app;
        this.history = [];
        this.maxHistoryLength = 20;
        console.log("Dice Roller initialized");
    }
    
    /**
     * Roll dice
     * @param {string} notation - The dice notation (e.g., "2d6+3")
     * @param {Object} [options] - Roll options
     * @param {boolean} [options.advantage] - Whether to roll with advantage
     * @param {boolean} [options.disadvantage] - Whether to roll with disadvantage
     * @returns {Promise<Object>} - The roll result
     */
    async roll(notation, options = {}) {
        try {
            // Clean up notation
            const cleanNotation = notation.replace(/\s/g, '').toLowerCase();
            
            // Handle advantage/disadvantage for d20 rolls
            if (cleanNotation.match(/^(\d*)d20/) && (options.advantage || options.disadvantage)) {
                return this.rollWithAdvantageOrDisadvantage(cleanNotation, options);
            }
            
            // Parse the notation
            const { dice, modifier } = this.parseNotation(cleanNotation);
            
            // Roll the dice
            const rolls = [];
            let total = 0;
            
            for (const die of dice) {
                for (let i = 0; i < die.count; i++) {
                    const roll = Math.floor(Math.random() * die.sides) + 1;
                    rolls.push(roll);
                    total += roll;
                }
            }
            
            // Add modifier
            total += modifier;
            
            // Add to history
            this.addToHistory({
                notation: cleanNotation,
                rolls,
                modifier,
                total
            });
            
            // Play sound
            this.app.audio.play('diceRoll');
            
            return {
                notation: cleanNotation,
                rolls,
                modifier,
                total
            };
        } catch (error) {
            console.error('Error rolling dice:', error);
            return {
                notation,
                rolls: [],
                modifier: 0,
                total: 0,
                error: error.message
            };
        }
    }
    
    /**
     * Roll with advantage or disadvantage
     * @param {string} notation - The dice notation
     * @param {Object} options - Roll options
     * @returns {Promise<Object>} - The roll result
     */
    async rollWithAdvantageOrDisadvantage(notation, options) {
        // Parse the notation
        const { dice, modifier } = this.parseNotation(notation);
        
        // Make sure it's a d20 roll
        if (dice.length !== 1 || dice[0].sides !== 20) {
            throw new Error('Advantage/disadvantage only applies to d20 rolls');
        }
        
        // Roll twice
        const roll1 = Math.floor(Math.random() * 20) + 1;
        const roll2 = Math.floor(Math.random() * 20) + 1;
        
        // Determine which roll to use
        const useRoll = options.advantage ? Math.max(roll1, roll2) : Math.min(roll1, roll2);
        
        // Calculate total
        const total = useRoll + modifier;
        
        // Add to history
        this.addToHistory({
            notation,
            rolls: [roll1, roll2],
            modifier,
            total,
            advantage: options.advantage,
            disadvantage: options.disadvantage
        });
        
        // Play sound
        this.app.audio.play('diceRoll');
        
        return {
            notation,
            rolls: [roll1, roll2],
            modifier,
            total,
            advantage: options.advantage,
            disadvantage: options.disadvantage
        };
    }
    
    /**
     * Parse dice notation
     * @param {string} notation - The dice notation
     * @returns {Object} - The parsed notation
     */
    parseNotation(notation) {
        // Simple regex to match dice notation
        const diceRegex = /(\d*)d(\d+)/g;
        const modifierRegex = /([+-]\d+)(?![^d]*d)/g;
        
        // Extract dice
        const dice = [];
        let match;
        while ((match = diceRegex.exec(notation)) !== null) {
            const count = match[1] ? parseInt(match[1]) : 1;
            const sides = parseInt(match[2]);
            dice.push({ count, sides });
        }
        
        // Extract modifier
        let modifier = 0;
        while ((match = modifierRegex.exec(notation)) !== null) {
            modifier += parseInt(match[1]);
        }
        
        return { dice, modifier };
    }
    
    /**
     * Add a roll to history
     * @param {Object} roll - The roll to add
     */
    addToHistory(roll) {
        this.history.unshift(roll);
        
        // Limit history length
        if (this.history.length > this.maxHistoryLength) {
            this.history.pop();
        }
    }
    
    /**
     * Get roll history
     * @returns {Array} - The roll history
     */
    getHistory() {
        return this.history;
    }
    
    /**
     * Clear roll history
     */
    clearHistory() {
        this.history = [];
    }
    
    /**
     * Roll and display result
     * @param {string} notation - The dice notation
     */
    async rollAndDisplay(notation) {
        const result = await this.roll(notation);
        
        // Format the result for display
        let displayText = '';
        
        if (result.error) {
            displayText = `Error: ${result.error}`;
        } else {
            displayText = `${result.total}`;
            
            // Add breakdown for complex rolls
            if (result.rolls.length > 1 || result.modifier !== 0) {
                let breakdown = `[${result.rolls.join(' + ')}]`;
                if (result.modifier !== 0) {
                    const sign = result.modifier > 0 ? '+' : '';
                    breakdown += ` ${sign}${result.modifier}`;
                }
                displayText += ` (${breakdown})`;
            }
        }
        
        // Update the UI
        if (this.app.ui.elements.diceResults) {
            this.app.ui.elements.diceResults.innerHTML = `
                <div class="text-center">
                    <div class="text-2xl font-bold">${result.total}</div>
                    <div class="text-sm text-gray-400">${notation}</div>
                    ${result.rolls.length > 1 || result.modifier !== 0 ? 
                        `<div class="text-xs text-gray-500">[${result.rolls.join(', ')}]${result.modifier !== 0 ? ` ${result.modifier >= 0 ? '+' : ''}${result.modifier}` : ''}</div>` : 
                        ''}
                </div>
            `;
        }
        
        // Log the roll
        this.app.logEvent(`Rolled ${notation}: ${result.total}`);
        
        return result;
    }
}
