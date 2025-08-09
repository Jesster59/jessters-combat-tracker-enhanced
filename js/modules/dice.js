/**
 * Dice Manager for Jesster's Combat Tracker
 * Handles dice rolling and display
 */
class DiceManager {
    constructor(app) {
        this.app = app;
        console.log("Dice Manager initialized");
    }
    
    /**
     * Roll dice
     * @param {number|string} dice - The dice to roll (e.g., 20 for d20, or "2d6+3")
     * @param {number} [count=1] - The number of dice to roll
     * @param {number} [modifier=0] - The modifier to add to the roll
     * @returns {Object} - The roll result
     */
    roll(dice, count = 1, modifier = 0) {
        // If dice is a string, parse it
        if (typeof dice === 'string') {
            return this.parseDiceNotation(dice);
        }
        
        // Roll the dice
        const rolls = [];
        for (let i = 0; i < count; i++) {
            rolls.push(Math.floor(Math.random() * dice) + 1);
        }
        
        // Calculate the total
        const total = rolls.reduce((sum, roll) => sum + roll, 0) + modifier;
        
        return {
            dice: dice,
            count: count,
            modifier: modifier,
            rolls: rolls,
            total: total
        };
    }
    
    /**
     * Parse dice notation (e.g., "2d6+3")
     * @param {string} notation - The dice notation
     * @returns {Object} - The roll result
     */
    parseDiceNotation(notation) {
        // Remove all spaces
        notation = notation.replace(/\s+/g, '');
        
        // Match dice notation pattern
        const pattern = /^(\d+)?d(\d+)([+-]\d+)?$/i;
        const match = notation.match(pattern);
        
        if (!match) {
            // Try to handle more complex notation
            return this.parseComplexDiceNotation(notation);
        }
        
        // Extract count, dice, and modifier
        const count = match[1] ? parseInt(match[1]) : 1;
        const dice = parseInt(match[2]);
        const modifier = match[3] ? parseInt(match[3]) : 0;
        
        // Roll the dice
        return this.roll(dice, count, modifier);
    }
    
    /**
     * Parse complex dice notation (e.g., "2d6+1d8+3")
     * @param {string} notation - The dice notation
     * @returns {Object} - The roll result
     */
    parseComplexDiceNotation(notation) {
        // Split by + and -
        const parts = notation.split(/([+-])/);
        
        // Initialize result
        const result = {
            notation: notation,
            rolls: [],
            total: 0,
            details: []
        };
        
        // Process each part
        let currentSign = '+';
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i].trim();
            
            // Skip empty parts
            if (!part) continue;
            
            // Check if this is a sign
            if (part === '+' || part === '-') {
                currentSign = part;
                continue;
            }
            
            // Check if this is a dice roll
            const diceMatch = part.match(/^(\d+)?d(\d+)$/i);
            if (diceMatch) {
                const count = diceMatch[1] ? parseInt(diceMatch[1]) : 1;
                const dice = parseInt(diceMatch[2]);
                
                // Roll the dice
                const rolls = [];
                for (let j = 0; j < count; j++) {
                    const roll = Math.floor(Math.random() * dice) + 1;
                    rolls.push(roll);
                    
                    // Add or subtract based on the sign
                    if (currentSign === '+') {
                        result.total += roll;
                    } else {
                        result.total -= roll;
                    }
                }
                
                // Add to result
                result.rolls.push(...rolls);
                result.details.push({
                    type: 'dice',
                    dice: dice,
                    count: count,
                    rolls: rolls,
                    sign: currentSign
                });
            } else {
                // This is a modifier
                const modifier = parseInt(part);
                if (!isNaN(modifier)) {
                    // Add or subtract based on the sign
                    if (currentSign === '+') {
                        result.total += modifier;
                    } else {
                        result.total -= modifier;
                    }
                    
                    // Add to result
                    result.details.push({
                        type: 'modifier',
                        value: modifier,
                        sign: currentSign
                    });
                }
            }
        }
        
        return result;
    }
    
    /**
     * Roll with advantage
     * @param {number} dice - The dice to roll
     * @param {number} [modifier=0] - The modifier to add to the roll
     * @returns {Object} - The roll result
     */
    rollWithAdvantage(dice = 20, modifier = 0) {
        const roll1 = this.roll(dice);
        const roll2 = this.roll(dice);
        
        const result = {
            type: 'advantage',
            dice: dice,
            modifier: modifier,
            rolls: [roll1.total, roll2.total],
            total: Math.max(roll1.total, roll2.total) + modifier
        };
        
        return result;
    }
    
    /**
     * Roll with disadvantage
     * @param {number} dice - The dice to roll
     * @param {number} [modifier=0] - The modifier to add to the roll
     * @returns {Object} - The roll result
     */
    rollWithDisadvantage(dice = 20, modifier = 0) {
        const roll1 = this.roll(dice);
        const roll2 = this.roll(dice);
        
        const result = {
            type: 'disadvantage',
            dice: dice,
            modifier: modifier,
            rolls: [roll1.total, roll2.total],
            total: Math.min(roll1.total, roll2.total) + modifier
        };
        
        return result;
    }
    
    /**
     * Roll and display the result
     * @param {string|number} notation - The dice notation or dice value
     */
    rollAndDisplay(notation) {
        const result = this.roll(notation);
        this.displayRollResult(result);
    }
    
        /**
     * Display a roll result
     * @param {Object} result - The roll result
     */
    displayRollResult(result) {
        // Get the dice results container
        const diceResults = document.getElementById('dice-results');
        if (!diceResults) return;
        
        // Format the result
        let resultText = '';
        let detailText = '';
        
        if (result.type === 'advantage' || result.type === 'disadvantage') {
            // Advantage or disadvantage roll
            const rollType = result.type === 'advantage' ? 'Advantage' : 'Disadvantage';
            resultText = `${result.total}`;
            detailText = `${rollType}: [${result.rolls.join(', ')}]${result.modifier !== 0 ? ` ${result.modifier >= 0 ? '+' : ''}${result.modifier}` : ''}`;
        } else if (result.notation) {
            // Complex dice notation
            resultText = `${result.total}`;
            
            // Build detail text
            const parts = [];
            result.details.forEach(detail => {
                if (detail.type === 'dice') {
                    parts.push(`${detail.sign === '-' ? '-' : ''}[${detail.rolls.join(', ')}]`);
                } else if (detail.type === 'modifier') {
                    parts.push(`${detail.sign}${detail.value}`);
                }
            });
            
            detailText = `${result.notation}: ${parts.join(' ')}`;
        } else {
            // Simple dice roll
            resultText = `${result.total}`;
            
            if (result.count === 1 && result.modifier === 0) {
                detailText = `d${result.dice}: ${result.rolls[0]}`;
            } else {
                detailText = `${result.count}d${result.dice}${result.modifier !== 0 ? `${result.modifier >= 0 ? '+' : ''}${result.modifier}` : ''}: [${result.rolls.join(', ')}]${result.modifier !== 0 ? ` ${result.modifier >= 0 ? '+' : ''}${result.modifier}` : ''}`;
            }
        }
        
        // Update the dice results
        diceResults.innerHTML = `
            <div class="text-2xl font-bold">${resultText}</div>
            <div class="text-sm text-gray-400">${detailText}</div>
        `;
        
        // Play sound
        this.app.audio.play('diceRoll');
        
        // Log the roll
        this.app.logEvent(`Rolled ${detailText} = ${resultText}`);
    }
    
    /**
     * Roll a check (ability check, saving throw, etc.)
     * @param {string} checkType - The type of check (e.g., "Strength", "Dexterity Save")
     * @param {number} modifier - The modifier to add to the roll
     * @param {boolean} [advantage=false] - Whether to roll with advantage
     * @param {boolean} [disadvantage=false] - Whether to roll with disadvantage
     * @returns {Object} - The roll result
     */
    rollCheck(checkType, modifier, advantage = false, disadvantage = false) {
        let result;
        
        // Cancel out advantage and disadvantage
        if (advantage && disadvantage) {
            advantage = false;
            disadvantage = false;
        }
        
        // Roll with advantage, disadvantage, or normally
        if (advantage) {
            result = this.rollWithAdvantage(20, modifier);
        } else if (disadvantage) {
            result = this.rollWithDisadvantage(20, modifier);
        } else {
            result = this.roll(20, 1, modifier);
        }
        
        // Add check type
        result.checkType = checkType;
        
        // Display the result
        this.displayCheckResult(result);
        
        return result;
    }
    
    /**
     * Display a check result
     * @param {Object} result - The check result
     */
    displayCheckResult(result) {
        // Get the dice results container
        const diceResults = document.getElementById('dice-results');
        if (!diceResults) return;
        
        // Format the result
        let resultText = `${result.total}`;
        let detailText = '';
        
        if (result.type === 'advantage' || result.type === 'disadvantage') {
            // Advantage or disadvantage roll
            const rollType = result.type === 'advantage' ? 'Advantage' : 'Disadvantage';
            detailText = `${result.checkType} (${rollType}): [${result.rolls.join(', ')}]${result.modifier !== 0 ? ` ${result.modifier >= 0 ? '+' : ''}${result.modifier}` : ''}`;
        } else {
            // Normal roll
            detailText = `${result.checkType}: ${result.rolls[0]}${result.modifier !== 0 ? ` ${result.modifier >= 0 ? '+' : ''}${result.modifier}` : ''}`;
        }
        
        // Update the dice results
        diceResults.innerHTML = `
            <div class="text-2xl font-bold">${resultText}</div>
            <div class="text-sm text-gray-400">${detailText}</div>
        `;
        
        // Play sound
        this.app.audio.play('diceRoll');
        
        // Log the roll
        this.app.logEvent(`${detailText} = ${resultText}`);
    }
    
    /**
     * Roll a damage roll
     * @param {string} damageType - The type of damage (e.g., "slashing", "fire")
     * @param {string} diceNotation - The dice notation (e.g., "2d6+3")
     * @param {boolean} [critical=false] - Whether this is a critical hit
     * @returns {Object} - The roll result
     */
    rollDamage(damageType, diceNotation, critical = false) {
        // Parse the dice notation
        const result = this.parseDiceNotation(diceNotation);
        
        // If critical hit, roll the dice again and add to the result
        if (critical && result.dice && result.count) {
            const critRolls = [];
            for (let i = 0; i < result.count; i++) {
                critRolls.push(Math.floor(Math.random() * result.dice) + 1);
            }
            
            result.critRolls = critRolls;
            result.total += critRolls.reduce((sum, roll) => sum + roll, 0);
        }
        
        // Add damage type and critical flag
        result.damageType = damageType;
        result.critical = critical;
        
        // Display the result
        this.displayDamageResult(result);
        
        return result;
    }
    
    /**
     * Display a damage result
     * @param {Object} result - The damage result
     */
    displayDamageResult(result) {
        // Get the dice results container
        const diceResults = document.getElementById('dice-results');
        if (!diceResults) return;
        
        // Format the result
        let resultText = `${result.total}`;
        let detailText = '';
        
        if (result.critical) {
            // Critical hit
            detailText = `${result.count}d${result.dice}${result.modifier !== 0 ? `${result.modifier >= 0 ? '+' : ''}${result.modifier}` : ''} ${result.damageType} (Critical): [${result.rolls.join(', ')}] + [${result.critRolls.join(', ')}]${result.modifier !== 0 ? ` ${result.modifier >= 0 ? '+' : ''}${result.modifier}` : ''}`;
        } else {
            // Normal damage
            detailText = `${result.count}d${result.dice}${result.modifier !== 0 ? `${result.modifier >= 0 ? '+' : ''}${result.modifier}` : ''} ${result.damageType}: [${result.rolls.join(', ')}]${result.modifier !== 0 ? ` ${result.modifier >= 0 ? '+' : ''}${result.modifier}` : ''}`;
        }
        
        // Update the dice results
        diceResults.innerHTML = `
            <div class="text-2xl font-bold">${resultText}</div>
            <div class="text-sm text-gray-400">${detailText}</div>
        `;
        
        // Play sound
        if (result.critical) {
            this.app.audio.play('criticalHit');
        } else {
            this.app.audio.play('hit');
        }
        
        // Log the roll
        this.app.logEvent(`${detailText} = ${resultText}`);
    }
}
