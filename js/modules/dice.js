/**
 * Dice Roller for Jesster's Combat Tracker
 * Handles dice rolling functionality
 */
class DiceRoller {
    constructor(app) {
        this.app = app;
        console.log("Dice Roller initialized");
    }
    
    /**
     * Roll dice based on notation
     * @param {string|number} notation - The dice notation (e.g., "2d6+3") or number of sides
     * @param {number} [count=1] - The number of dice to roll (if notation is a number)
     * @param {number} [modifier=0] - The modifier to add (if notation is a number)
     * @returns {Object} - The roll result
     */
    roll(notation, count = 1, modifier = 0) {
        try {
            // If notation is a number, convert to standard notation
            if (typeof notation === 'number') {
                notation = `${count}d${notation}${modifier !== 0 ? (modifier > 0 ? '+' + modifier : modifier) : ''}`;
            }
            
            // Ensure notation is a string
            if (typeof notation !== 'string') {
                throw new Error('Invalid dice notation');
            }
            
            // Parse the notation
            const regex = /(\d+)d(\d+)(?:\s*([+-])\s*(\d+))?/i;
            const match = notation.replace(/\s+/g, '').match(regex);
            
            if (!match) {
                throw new Error('Invalid dice notation format');
            }
            
            const numDice = parseInt(match[1]);
            const numSides = parseInt(match[2]);
            const hasModifier = match[3] !== undefined;
            const modifierSign = hasModifier ? match[3] : '+';
            const modifierValue = hasModifier ? parseInt(match[4]) : 0;
            
            // Validate the dice
            if (numDice <= 0 || numSides <= 0) {
                throw new Error('Number of dice and sides must be positive');
            }
            
            if (numDice > 100) {
                throw new Error('Too many dice (maximum 100)');
            }
            
            // Roll the dice
            const rolls = [];
            let total = 0;
            
            for (let i = 0; i < numDice; i++) {
                const roll = Math.floor(Math.random() * numSides) + 1;
                rolls.push(roll);
                total += roll;
            }
            
            // Apply modifier
            if (hasModifier) {
                if (modifierSign === '+') {
                    total += modifierValue;
                } else {
                    total -= modifierValue;
                }
            }
            
            // Return the result
            return {
                notation: notation,
                rolls: rolls,
                modifier: hasModifier ? (modifierSign === '+' ? modifierValue : -modifierValue) : 0,
                total: total
            };
        } catch (error) {
            console.error('Error rolling dice:', error);
            // Return a default result instead of throwing
            return {
                notation: String(notation),
                rolls: [0],
                modifier: 0,
                total: 0,
                error: error.message
            };
        }
    }
    
    /**
     * Roll multiple dice
     * @param {Array} notations - Array of dice notations
     * @returns {Array} - Array of roll results
     */
    rollMultiple(notations) {
        return notations.map(notation => this.roll(notation));
    }
    
    /**
     * Roll dice and display the result
     * @param {string|number} notation - The dice notation or number of sides
     * @param {number} [count=1] - The number of dice to roll (if notation is a number)
     * @param {number} [modifier=0] - The modifier to add (if notation is a number)
     * @returns {Object} - The roll result
     */
    rollAndDisplay(notation, count = 1, modifier = 0) {
        // Roll the dice
        const result = this.roll(notation, count, modifier);
        
        // Play sound
        this.app.audio.play('diceRoll');
        
        // Update the UI
        this.updateDiceResultsUI(result);
        
        // Log the roll
        this.logRoll(result);
        
        return result;
    }
    
    /**
     * Update the dice results UI
     * @param {Object} result - The roll result
     */
    updateDiceResultsUI(result) {
        const diceResults = document.getElementById('dice-results');
        if (!diceResults) return;
        
        // Format the result
        const rollsText = result.rolls.join(', ');
        const modifierText = result.modifier !== 0 ? 
            (result.modifier > 0 ? ` + ${result.modifier}` : ` - ${Math.abs(result.modifier)}`) : '';
        
        // Update the UI
        diceResults.innerHTML = `
            <div class="text-2xl font-bold">${result.total}</div>
            <div class="text-sm text-gray-400">${result.notation}: [${rollsText}]${modifierText}</div>
        `;
    }
    
    /**
     * Log a dice roll
     * @param {Object} result - The roll result
     */
    logRoll(result) {
        const rollsText = result.rolls.join(', ');
        const modifierText = result.modifier !== 0 ? 
            (result.modifier > 0 ? ` + ${result.modifier}` : ` - ${Math.abs(result.modifier)}`) : '';
        
        this.app.logEvent(`Rolled ${result.notation}: [${rollsText}]${modifierText} = ${result.total}`);
    }
}
