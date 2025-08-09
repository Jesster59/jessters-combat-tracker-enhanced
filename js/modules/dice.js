/**
 * Dice module for Jesster's Combat Tracker
 * Handles dice rolling functionality
 */
class Dice {
    constructor(settings, audio) {
        // Store references to other modules
        this.settings = settings;
        this.audio = audio;
        
        // Dice history
        this.history = [];
        this.maxHistory = this.settings.getMaxDiceHistory();
        
        // Dice state
        this.lastRoll = null;
        this.isRolling = false;
        
        // Dice DOM elements
        this.diceContainer = null;
        this.historyContainer = null;
        
        console.log("Dice module initialized");
    }

    /**
     * Initialize the dice module
     * @param {HTMLElement} diceContainer - Container for dice animations
     * @param {HTMLElement} historyContainer - Container for dice history
     */
    init(diceContainer, historyContainer) {
        this.diceContainer = diceContainer;
        this.historyContainer = historyContainer;
        
        // Load history from localStorage
        this._loadHistory();
        
        // Render history
        if (this.historyContainer) {
            this._renderHistory();
        }
    }

    /**
     * Roll dice with a given notation
     * @param {string} notation - Dice notation (e.g., "2d6+3")
     * @param {Object} options - Roll options
     * @param {string} options.name - Roll name
     * @param {string} options.type - Roll type (attack, damage, save, check, etc.)
     * @param {boolean} options.advantage - Roll with advantage
     * @param {boolean} options.disadvantage - Roll with disadvantage
     * @param {boolean} options.critical - Critical hit
     * @param {boolean} options.silent - Don't play sound or show animation
     * @returns {Promise<Object>} Roll result
     */
    async roll(notation, options = {}) {
        const {
            name = '',
            type = 'custom',
            advantage = false,
            disadvantage = false,
            critical = false,
            silent = false
        } = options;
        
        // Parse notation
        const parsedNotation = this._parseNotation(notation);
        if (!parsedNotation) {
            console.error(`Invalid dice notation: ${notation}`);
            return null;
        }
        
        // Set rolling state
        this.isRolling = true;
        
        // Play sound if enabled and not silent
        if (this.settings.isDiceSoundEnabled() && !silent && this.audio) {
            this.audio.play('dice-roll');
        }
        
        // Show animation if enabled and not silent
        if (this.settings.areDiceAnimationsEnabled() && !silent && this.diceContainer) {
            this._showDiceAnimation(parsedNotation);
        }
        
        // Calculate results
        let results = [];
        let total = 0;
        
        // Handle advantage/disadvantage
        if ((advantage || disadvantage) && parsedNotation.dice.length === 1 && parsedNotation.dice[0].sides === 20) {
            // Roll twice for advantage/disadvantage
            const roll1 = this._rollDie(20);
            const roll2 = this._rollDie(20);
            
            // Use higher for advantage, lower for disadvantage
            const useRoll = advantage ? Math.max(roll1, roll2) : Math.min(roll1, roll2);
            
            results.push({
                die: 'd20',
                rolls: [roll1, roll2],
                useRoll,
                advantage,
                disadvantage
            });
            
            total = useRoll + parsedNotation.modifier;
        } 
        // Handle critical hit
        else if (critical && type === 'damage') {
            // Double dice for critical hit
            for (const die of parsedNotation.dice) {
                const rolls = [];
                let dieTotal = 0;
                
                // Roll each die twice (critical hit doubles dice)
                for (let i = 0; i < die.count * 2; i++) {
                    const roll = this._rollDie(die.sides);
                    rolls.push(roll);
                    dieTotal += roll;
                }
                
                results.push({
                    die: `d${die.sides}`,
                    rolls,
                    total: dieTotal
                });
                
                total += dieTotal;
            }
            
            total += parsedNotation.modifier;
        }
        // Normal roll
        else {
            for (const die of parsedNotation.dice) {
                const rolls = [];
                let dieTotal = 0;
                
                for (let i = 0; i < die.count; i++) {
                    const roll = this._rollDie(die.sides);
                    rolls.push(roll);
                    dieTotal += roll;
                }
                
                results.push({
                    die: `d${die.sides}`,
                    rolls,
                    total: dieTotal
                });
                
                total += dieTotal;
            }
            
            total += parsedNotation.modifier;
        }
        
        // Create roll result
        const rollResult = {
            notation,
            name,
            type,
            results,
            total,
            advantage,
            disadvantage,
            critical,
            timestamp: Date.now()
        };
        
        // Add to history
        this._addToHistory(rollResult);
        
        // Update last roll
        this.lastRoll = rollResult;
        
        // Reset rolling state after a short delay
        setTimeout(() => {
            this.isRolling = false;
        }, 500);
        
        return rollResult;
    }

    /**
     * Roll a single die
     * @private
     * @param {number} sides - Number of sides
     * @returns {number} Roll result
     */
    _rollDie(sides) {
        return Math.floor(Math.random() * sides) + 1;
    }

    /**
     * Parse dice notation
     * @private
     * @param {string} notation - Dice notation (e.g., "2d6+3")
     * @returns {Object|null} Parsed notation or null if invalid
     */
    _parseNotation(notation) {
        // Remove all whitespace
        notation = notation.replace(/\s+/g, '');
        
        // Match dice notation pattern
        const diceRegex = /(\d*d\d+)([+-]\d+)?/i;
        const match = notation.match(diceRegex);
        
        if (!match) return null;
        
        // Parse dice
        const diceParts = match[1].split('d');
        const count = diceParts[0] ? parseInt(diceParts[0]) : 1;
        const sides = parseInt(diceParts[1]);
        
        // Parse modifier
        const modifier = match[2] ? parseInt(match[2]) : 0;
        
        // Create parsed notation
        const parsedNotation = {
            dice: [{
                count,
                sides
            }],
            modifier
        };
        
        return parsedNotation;
    }

    /**
     * Parse complex dice notation (e.g., "2d6+1d4+3")
     * @param {string} notation - Complex dice notation
     * @returns {Object|null} Parsed notation or null if invalid
     */
    parseComplexNotation(notation) {
        // Remove all whitespace
        notation = notation.replace(/\s+/g, '');
        
        // Initialize result
        const result = {
            dice: [],
            modifier: 0
        };
        
        // Match all dice parts
        const diceRegex = /(\d*)d(\d+)/gi;
        let match;
        
        while ((match = diceRegex.exec(notation)) !== null) {
            const count = match[1] ? parseInt(match[1]) : 1;
            const sides = parseInt(match[2]);
            
            result.dice.push({
                count,
                sides
            });
        }
        
        // Match modifier
        const modifierRegex = /([+-]\d+)$/;
        const modifierMatch = notation.match(modifierRegex);
        
        if (modifierMatch) {
            result.modifier = parseInt(modifierMatch[1]);
        }
        
        // Return null if no dice found
        if (result.dice.length === 0) return null;
        
        return result;
    }

    /**
     * Show dice animation
     * @private
     * @param {Object} parsedNotation - Parsed dice notation
     */
    _showDiceAnimation(parsedNotation) {
        if (!this.diceContainer) return;
        
        // Clear container
        this.diceContainer.innerHTML = '';
        
        // Create dice elements
        for (const die of parsedNotation.dice) {
            for (let i = 0; i < die.count; i++) {
                const dieElement = document.createElement('div');
                dieElement.className = `die d${die.sides}`;
                
                // Add animation
                dieElement.style.animation = `roll-die ${Math.random() * 0.5 + 0.5}s ease-out`;
                
                // Add random position and rotation
                const size = 50; // die size in pixels
                const maxX = this.diceContainer.clientWidth - size;
                const maxY = this.diceContainer.clientHeight - size;
                
                dieElement.style.left = `${Math.random() * maxX}px`;
                dieElement.style.top = `${Math.random() * maxY}px`;
                dieElement.style.transform = `rotate(${Math.random() * 360}deg)`;
                
                // Add to container
                this.diceContainer.appendChild(dieElement);
                
                // Update with result after animation
                setTimeout(() => {
                    dieElement.textContent = this._rollDie(die.sides);
                    dieElement.classList.add('rolled');
                }, Math.random() * 500 + 500);
            }
        }
        
        // Clear animation after delay
        setTimeout(() => {
            this.diceContainer.innerHTML = '';
        }, 3000);
    }

    /**
     * Add roll to history
     * @private
     * @param {Object} roll - Roll result
     */
    _addToHistory(roll) {
        // Add to history
        this.history.unshift(roll);
        
        // Limit history size
        if (this.history.length > this.maxHistory) {
            this.history = this.history.slice(0, this.maxHistory);
        }
        
        // Save history
        this._saveHistory();
        
        // Update history display
        if (this.historyContainer) {
            this._renderHistory();
        }
    }

    /**
     * Save history to localStorage
     * @private
     */
    _saveHistory() {
        if (!this.settings.shouldKeepDiceHistory()) return;
        
        try {
            localStorage.setItem('diceHistory', JSON.stringify(this.history));
        } catch (error) {
            console.error('Error saving dice history:', error);
        }
    }

    /**
     * Load history from localStorage
     * @private
     */
    _loadHistory() {
        if (!this.settings.shouldKeepDiceHistory()) return;
        
        try {
            const savedHistory = localStorage.getItem('diceHistory');
            if (savedHistory) {
                this.history = JSON.parse(savedHistory);
            }
        } catch (error) {
            console.error('Error loading dice history:', error);
            this.history = [];
        }
    }

    /**
     * Render history in the history container
     * @private
     */
    _renderHistory() {
        if (!this.historyContainer) return;
        
        // Clear container
        this.historyContainer.innerHTML = '';
        
        // Check if history is empty
        if (this.history.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'dice-history-empty';
            emptyMessage.textContent = 'No dice rolls yet';
            this.historyContainer.appendChild(emptyMessage);
            return;
        }
        
        // Create history items
        this.history.forEach((roll, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = `dice-history-item ${roll.type}`;
            if (index === 0) historyItem.classList.add('latest');
            
            // Create header
            const header = document.createElement('div');
            header.className = 'dice-history-header';
            
            // Add roll name/type
            const name = document.createElement('span');
            name.className = 'dice-history-name';
            name.textContent = roll.name || roll.type;
            header.appendChild(name);
            
            // Add timestamp
            const timestamp = document.createElement('span');
            timestamp.className = 'dice-history-time';
            timestamp.textContent = this._formatTimestamp(roll.timestamp);
            header.appendChild(timestamp);
            
            // Create body
            const body = document.createElement('div');
            body.className = 'dice-history-body';
            
            // Add notation
            const notation = document.createElement('div');
            notation.className = 'dice-history-notation';
            notation.textContent = roll.notation;
            body.appendChild(notation);
            
            // Add results
            const results = document.createElement('div');
            results.className = 'dice-history-results';
            
            // Handle advantage/disadvantage
            if (roll.advantage || roll.disadvantage) {
                const dieResult = roll.results[0];
                const [roll1, roll2] = dieResult.rolls;
                const useRoll = dieResult.useRoll;
                
                const advantageText = roll.advantage ? 'Advantage' : 'Disadvantage';
                results.innerHTML = `
                    <span class="dice-roll ${roll1 === useRoll ? 'used' : 'unused'}">${roll1}</span>
                    <span class="dice-roll ${roll2 === useRoll ? 'used' : 'unused'}">${roll2}</span>
                    <span class="dice-advantage">${advantageText}</span>
                `;
            } 
            // Handle normal rolls
            else {
                roll.results.forEach(dieResult => {
                    const dieType = document.createElement('span');
                    dieType.className = 'dice-type';
                    dieType.textContent = dieResult.die;
                    results.appendChild(dieType);
                    
                    dieResult.rolls.forEach(dieRoll => {
                        const dieRollElement = document.createElement('span');
                        dieRollElement.className = 'dice-roll';
                        
                        // Highlight max/min rolls
                        if (dieRoll === parseInt(dieResult.die.substring(1))) {
                            dieRollElement.classList.add('max');
                        } else if (dieRoll === 1) {
                            dieRollElement.classList.add('min');
                        }
                        
                        dieRollElement.textContent = dieRoll;
                        results.appendChild(dieRollElement);
                    });
                });
            }
            
            body.appendChild(results);
            
            // Add total
            const total = document.createElement('div');
            total.className = 'dice-history-total';
            total.textContent = roll.total;
            body.appendChild(total);
            
            // Add to history item
            historyItem.appendChild(header);
            historyItem.appendChild(body);
            
            // Add to container
            this.historyContainer.appendChild(historyItem);
        });
    }

    /**
     * Format timestamp
     * @private
     * @param {number} timestamp - Timestamp in milliseconds
     * @returns {string} Formatted timestamp
     */
    _formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        
        return `${hours}:${minutes}:${seconds}`;
    }

    /**
     * Clear dice history
     */
    clearHistory() {
        this.history = [];
        this._saveHistory();
        
        if (this.historyContainer) {
            this._renderHistory();
        }
    }

    /**
     * Get dice history
     * @returns {Array} Dice history
     */
    getHistory() {
        return [...this.history];
    }

    /**
     * Get the last roll
     * @returns {Object|null} Last roll or null if no rolls
     */
    getLastRoll() {
        return this.lastRoll;
    }

    /**
     * Check if dice are currently rolling
     * @returns {boolean} True if dice are rolling
     */
    isCurrentlyRolling() {
        return this.isRolling;
    }

    /**
     * Roll a d20
     * @param {Object} options - Roll options
     * @returns {Promise<Object>} Roll result
     */
    async rollD20(options = {}) {
        return await this.roll('1d20', options);
    }

    /**
     * Roll a d12
     * @param {Object} options - Roll options
     * @returns {Promise<Object>} Roll result
     */
    async rollD12(options = {}) {
        return await this.roll('1d12', options);
    }

    /**
     * Roll a d10
     * @param {Object} options - Roll options
     * @returns {Promise<Object>} Roll result
     */
    async rollD10(options = {}) {
        return await this.roll('1d10', options);
    }

    /**
     * Roll a d8
     * @param {Object} options - Roll options
     * @returns {Promise<Object>} Roll result
     */
    async rollD8(options = {}) {
        return await this.roll('1d8', options);
    }

    /**
     * Roll a d6
     * @param {Object} options - Roll options
     * @returns {Promise<Object>} Roll result
     */
    async rollD6(options = {}) {
        return await this.roll('1d6', options);
    }

    /**
     * Roll a d4
     * @param {Object} options - Roll options
     * @returns {Promise<Object>} Roll result
     */
    async rollD4(options = {}) {
        return await this.roll('1d4', options);
    }

    /**
     * Roll a d100
     * @param {Object} options - Roll options
     * @returns {Promise<Object>} Roll result
     */
    async rollD100(options = {}) {
        return await this.roll('1d100', options);
    }

    /**
     * Roll an ability check
     * @param {string} ability - Ability name
     * @param {number} modifier - Ability modifier
     * @param {Object} options - Roll options
     * @returns {Promise<Object>} Roll result
     */
    async rollAbilityCheck(ability, modifier, options = {}) {
        const notation = `1d20${modifier >= 0 ? '+' + modifier : modifier}`;
        return await this.roll(notation, {
            name: `${ability} Check`,
            type: 'check',
            ...options
        });
    }

    /**
     * Roll a saving throw
     * @param {string} ability - Ability name
     * @param {number} modifier - Save modifier
     * @param {Object} options - Roll options
     * @returns {Promise<Object>} Roll result
     */
    async rollSavingThrow(ability, modifier, options = {}) {
        const notation = `1d20${modifier >= 0 ? '+' + modifier : modifier}`;
        return await this.roll(notation, {
            name: `${ability} Save`,
            type: 'save',
            ...options
        });
    }

    /**
     * Roll an attack
     * @param {string} attackName - Attack name
     * @param {number} modifier - Attack modifier
     * @param {Object} options - Roll options
     * @returns {Promise<Object>} Roll result
     */
    async rollAttack(attackName, modifier, options = {}) {
        const notation = `1d20${modifier >= 0 ? '+' + modifier : modifier}`;
        return await this.roll(notation, {
            name: attackName,
            type: 'attack',
            ...options
        });
    }

    /**
     * Roll damage
     * @param {string} damageFormula - Damage formula
     * @param {string} damageType - Damage type
     * @param {Object} options - Roll options
     * @returns {Promise<Object>} Roll result
     */
    async rollDamage(damageFormula, damageType, options = {}) {
        return await this.roll(damageFormula, {
            name: `${damageType || 'Damage'}`,
            type: 'damage',
            ...options
        });
    }

    /**
     * Roll initiative
     * @param {string} name - Combatant name
     * @param {number} modifier - Initiative modifier
     * @param {Object} options - Roll options
     * @returns {Promise<Object>} Roll result
     */
    async rollInitiative(name, modifier, options = {}) {
        const notation = `1d20${modifier >= 0 ? '+' + modifier : modifier}`;
        return await this.roll(notation, {
            name: `${name} Initiative`,
            type: 'initiative',
            ...options
        });
    }

    /**
     * Roll a death saving throw
     * @param {Object} options - Roll options
     * @returns {Promise<Object>} Roll result
     */
    async rollDeathSave(options = {}) {
        return await this.roll('1d20', {
            name: 'Death Save',
            type: 'death-save',
            ...options
        });
    }

    /**
     * Roll hit dice
     * @param {string} hitDice - Hit dice (e.g., "1d8")
     * @param {number} conModifier - Constitution modifier
     * @param {Object} options - Roll options
     * @returns {Promise<Object>} Roll result
     */
    async rollHitDice(hitDice, conModifier, options = {}) {
        const notation = `${hitDice}${conModifier >= 0 ? '+' + conModifier : conModifier}`;
        return await this.roll(notation, {
            name: 'Hit Dice',
            type: 'hit-dice',
            ...options
        });
    }

    /**
     * Roll a skill check
     * @param {string} skillName - Skill name
     * @param {number} modifier - Skill modifier
     * @param {Object} options - Roll options
     * @returns {Promise<Object>} Roll result
     */
    async rollSkillCheck(skillName, modifier, options = {}) {
        const notation = `1d20${modifier >= 0 ? '+' + modifier : modifier}`;
        return await this.roll(notation, {
            name: `${skillName}`,
            type: 'skill',
            ...options
        });
    }

    /**
     * Roll with advantage based on settings
     * @param {string} notation - Dice notation
     * @param {Object} options - Roll options
     * @returns {Promise<Object>} Roll result
     */
    async rollWithAdvantage(notation, options = {}) {
        const advantageMode = this.settings.getAdvantageMode();
        
        if (advantageMode === 'advantage') {
            return await this.roll(notation, { ...options, advantage: true });
        } else if (advantageMode === 'disadvantage') {
            return await this.roll(notation, { ...options, disadvantage: true });
        } else if (advantageMode === 'query') {
            // In a real implementation, this would show a UI to ask the user
            // For now, we'll just roll normally
            return await this.roll(notation, options);
        } else {
            return await this.roll(notation, options);
        }
    }
}

// Export the Dice class
export default Dice;
