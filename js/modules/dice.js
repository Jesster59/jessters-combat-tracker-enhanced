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
        this.maxHistory = this.settings.getMaxDiceHistory() || 50;
        
        // Dice presets
        this.presets = [
            { name: 'Attack Roll', formula: '1d20', description: 'Standard attack roll' },
            { name: 'Damage (Dagger)', formula: '1d4', description: 'Dagger damage' },
            { name: 'Damage (Shortsword)', formula: '1d6', description: 'Shortsword damage' },
            { name: 'Damage (Longsword)', formula: '1d8', description: 'Longsword damage' },
            { name: 'Damage (Greatsword)', formula: '2d6', description: 'Greatsword damage' },
            { name: 'Sneak Attack (Level 3)', formula: '2d6', description: 'Rogue sneak attack' },
            { name: 'Fireball', formula: '8d6', description: 'Fireball spell damage' },
            { name: 'Healing Word', formula: '1d4', description: 'Healing Word spell' },
            { name: 'Cure Wounds', formula: '1d8', description: 'Cure Wounds spell' }
        ];
        
        // Custom dice presets
        this.customPresets = [];
        
        // Load custom presets
        this._loadCustomPresets();
        
        console.log("Dice module initialized");
    }

    /**
     * Load custom presets from settings
     * @private
     */
    async _loadCustomPresets() {
        try {
            const customPresets = await this.settings.get('diceCustomPresets');
            if (customPresets && Array.isArray(customPresets)) {
                this.customPresets = customPresets;
            }
        } catch (error) {
            console.error('Error loading custom dice presets:', error);
        }
    }

    /**
     * Save custom presets to settings
     * @private
     */
    async _saveCustomPresets() {
        try {
            await this.settings.set('diceCustomPresets', this.customPresets);
        } catch (error) {
            console.error('Error saving custom dice presets:', error);
        }
    }

    /**
     * Roll dice
     * @param {string} formula - Dice formula (e.g., "2d6+3")
     * @param {Object} options - Roll options
     * @param {string} options.name - Roll name
     * @param {string} options.type - Roll type (attack, damage, save, check, etc.)
     * @param {boolean} options.advantage - Roll with advantage
     * @param {boolean} options.disadvantage - Roll with disadvantage
     * @param {boolean} options.critical - Critical hit (double dice)
     * @param {boolean} options.silent - Don't play sound or add to history
     * @returns {Promise<Object>} Roll result
     */
    async roll(formula, options = {}) {
        // Get options
        const {
            name = 'Roll',
            type = 'generic',
            advantage = false,
            disadvantage = false,
            critical = false,
            silent = false
        } = options;
        
        // Parse formula
        const parsedFormula = this._parseFormula(formula);
        
        // Apply critical hit (double dice)
        if (critical && type === 'damage') {
            parsedFormula.dice = parsedFormula.dice.map(die => ({
                ...die,
                count: die.count * 2
            }));
        }
        
        // Roll dice
        const rollResult = this._rollDice(parsedFormula, { advantage, disadvantage });
        
        // Create result object
        const result = {
            formula,
            parsedFormula,
            name,
            type,
            advantage,
            disadvantage,
            critical,
            timestamp: Date.now(),
            results: rollResult.results,
            total: rollResult.total,
            rolls: rollResult.rolls
        };
        
        // Play sound
        if (!silent && this.audio && this.settings.isDiceSoundEnabled()) {
            this.audio.play('dice-roll');
        }
        
        // Add to history
        if (!silent && this.settings.shouldKeepDiceHistory()) {
            this._addToHistory(result);
        }
        
        return result;
    }

    /**
     * Roll initiative
     * @param {string} name - Combatant name
     * @param {number} modifier - Initiative modifier
     * @param {Object} options - Roll options
     * @param {boolean} options.advantage - Roll with advantage
     * @param {boolean} options.disadvantage - Roll with disadvantage
     * @returns {Promise<Object>} Roll result
     */
    async rollInitiative(name, modifier = 0, options = {}) {
        // Create formula
        const formula = modifier >= 0 ? `1d20+${modifier}` : `1d20${modifier}`;
        
        // Roll dice
        return await this.roll(formula, {
            name: `${name} Initiative`,
            type: 'initiative',
            ...options
        });
    }

    /**
     * Roll attack
     * @param {string} name - Attack name
     * @param {number} modifier - Attack modifier
     * @param {Object} options - Roll options
     * @param {boolean} options.advantage - Roll with advantage
     * @param {boolean} options.disadvantage - Roll with disadvantage
     * @returns {Promise<Object>} Roll result
     */
    async rollAttack(name, modifier = 0, options = {}) {
        // Create formula
        const formula = modifier >= 0 ? `1d20+${modifier}` : `1d20${modifier}`;
        
        // Roll dice
        return await this.roll(formula, {
            name: `${name} Attack`,
            type: 'attack',
            ...options
        });
    }

    /**
     * Roll damage
     * @param {string} formula - Damage formula
     * @param {string} name - Attack name
     * @param {Object} options - Roll options
     * @param {boolean} options.critical - Critical hit
     * @returns {Promise<Object>} Roll result
     */
    async rollDamage(formula, name, options = {}) {
        // Roll dice
        return await this.roll(formula, {
            name: `${name} Damage`,
            type: 'damage',
            ...options
        });
    }

    /**
     * Roll saving throw
     * @param {string} ability - Ability (str, dex, con, int, wis, cha)
     * @param {number} modifier - Save modifier
     * @param {string} name - Combatant name
     * @param {Object} options - Roll options
     * @param {boolean} options.advantage - Roll with advantage
     * @param {boolean} options.disadvantage - Roll with disadvantage
     * @returns {Promise<Object>} Roll result
     */
    async rollSave(ability, modifier = 0, name = '', options = {}) {
        // Create formula
        const formula = modifier >= 0 ? `1d20+${modifier}` : `1d20${modifier}`;
        
        // Roll dice
        return await this.roll(formula, {
            name: `${name} ${ability.toUpperCase()} Save`,
            type: 'save',
            ...options
        });
    }

    /**
     * Roll ability check
     * @param {string} ability - Ability (str, dex, con, int, wis, cha)
     * @param {number} modifier - Check modifier
     * @param {string} name - Combatant name
     * @param {Object} options - Roll options
     * @param {boolean} options.advantage - Roll with advantage
     * @param {boolean} options.disadvantage - Roll with disadvantage
     * @returns {Promise<Object>} Roll result
     */
    async rollCheck(ability, modifier = 0, name = '', options = {}) {
        // Create formula
        const formula = modifier >= 0 ? `1d20+${modifier}` : `1d20${modifier}`;
        
        // Roll dice
        return await this.roll(formula, {
            name: `${name} ${ability.toUpperCase()} Check`,
            type: 'check',
            ...options
        });
    }

    /**
     * Roll skill check
     * @param {string} skill - Skill name
     * @param {number} modifier - Skill modifier
     * @param {string} name - Combatant name
     * @param {Object} options - Roll options
     * @param {boolean} options.advantage - Roll with advantage
     * @param {boolean} options.disadvantage - Roll with disadvantage
     * @returns {Promise<Object>} Roll result
     */
    async rollSkill(skill, modifier = 0, name = '', options = {}) {
        // Create formula
        const formula = modifier >= 0 ? `1d20+${modifier}` : `1d20${modifier}`;
        
        // Roll dice
        return await this.roll(formula, {
            name: `${name} ${skill} Check`,
            type: 'skill',
            ...options
        });
    }

    /**
     * Roll death save
     * @param {string} name - Combatant name
     * @param {Object} options - Roll options
     * @param {boolean} options.advantage - Roll with advantage
     * @param {boolean} options.disadvantage - Roll with disadvantage
     * @returns {Promise<Object>} Roll result
     */
    async rollDeathSave(name = '', options = {}) {
        // Roll dice
        return await this.roll('1d20', {
            name: `${name} Death Save`,
            type: 'death-save',
            ...options
        });
    }

    /**
     * Roll hit dice
     * @param {string} hitDice - Hit dice (e.g., "1d8")
     * @param {number} constitutionModifier - Constitution modifier
     * @param {string} name - Combatant name
     * @returns {Promise<Object>} Roll result
     */
    async rollHitDice(hitDice, constitutionModifier = 0, name = '') {
        // Create formula
        const formula = constitutionModifier >= 0 ? 
            `${hitDice}+${constitutionModifier}` : 
            `${hitDice}${constitutionModifier}`;
        
        // Roll dice
        return await this.roll(formula, {
            name: `${name} Hit Dice`,
            type: 'hit-dice'
        });
    }

    /**
     * Parse dice formula
     * @private
     * @param {string} formula - Dice formula
     * @returns {Object} Parsed formula
     */
    _parseFormula(formula) {
        // Initialize result
        const result = {
            original: formula,
            dice: [],
            modifiers: [],
            error: null
        };
        
        try {
            // Remove whitespace
            const cleanFormula = formula.replace(/\s+/g, '');
            
            // Match dice and modifiers
            const diceRegex = /(\d+)d(\d+)/g;
            const modifierRegex = /[+\-]\d+/g;
            
            // Extract dice
            let diceMatch;
            while ((diceMatch = diceRegex.exec(cleanFormula)) !== null) {
                result.dice.push({
                    count: parseInt(diceMatch[1], 10),
                    sides: parseInt(diceMatch[2], 10)
                });
            }
            
            // Extract modifiers
            let modifierMatch;
            while ((modifierMatch = modifierRegex.exec(cleanFormula)) !== null) {
                result.modifiers.push(parseInt(modifierMatch[0], 10));
            }
        } catch (error) {
            result.error = `Error parsing formula: ${error.message}`;
        }
        
        return result;
    }

    /**
     * Roll dice
     * @private
     * @param {Object} parsedFormula - Parsed formula
     * @param {Object} options - Roll options
     * @param {boolean} options.advantage - Roll with advantage
     * @param {boolean} options.disadvantage - Roll with disadvantage
     * @returns {Object} Roll result
     */
    _rollDice(parsedFormula, options = {}) {
        const { advantage = false, disadvantage = false } = options;
        
        // Initialize result
        const result = {
            results: [],
            total: 0,
            rolls: []
        };
        
        // Check for errors
        if (parsedFormula.error) {
            result.error = parsedFormula.error;
            return result;
        }
        
        // Roll dice
        parsedFormula.dice.forEach(die => {
            const dieResult = {
                die: `d${die.sides}`,
                count: die.count,
                rolls: []
            };
            
            // Handle advantage/disadvantage for d20 rolls
            if (die.sides === 20 && die.count === 1 && (advantage || disadvantage)) {
                // Roll twice
                const roll1 = Math.floor(Math.random() * die.sides) + 1;
                const roll2 = Math.floor(Math.random() * die.sides) + 1;
                
                // Determine which roll to use
                const useRoll = advantage ? Math.max(roll1, roll2) : Math.min(roll1, roll2);
                
                dieResult.rolls = [roll1, roll2];
                dieResult.total = useRoll;
                dieResult.advantage = advantage;
                dieResult.disadvantage = disadvantage;
                dieResult.useRoll = useRoll;
                
                result.rolls.push({ die: `d${die.sides}`, roll: roll1 });
                result.rolls.push({ die: `d${die.sides}`, roll: roll2 });
            } else {
                // Normal dice rolling
                let dieTotal = 0;
                
                for (let i = 0; i < die.count; i++) {
                    const roll = Math.floor(Math.random() * die.sides) + 1;
                    dieResult.rolls.push(roll);
                    dieTotal += roll;
                    
                    result.rolls.push({ die: `d${die.sides}`, roll });
                }
                
                dieResult.total = dieTotal;
            }
            
            result.results.push(dieResult);
            result.total += dieResult.total;
        });
        
        // Add modifiers
        parsedFormula.modifiers.forEach(modifier => {
            result.results.push({
                modifier,
                total: modifier
            });
            
            result.total += modifier;
        });
        
        return result;
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
            this.history.pop();
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
     * Clear dice history
     */
    clearHistory() {
        this.history = [];
    }

    /**
     * Get dice presets
     * @returns {Array} Dice presets
     */
    getPresets() {
        return [...this.presets];
    }

    /**
     * Get custom dice presets
     * @returns {Array} Custom dice presets
     */
    getCustomPresets() {
        return [...this.customPresets];
    }

    /**
     * Add custom dice preset
     * @param {Object} preset - Preset object
     * @param {string} preset.name - Preset name
     * @param {string} preset.formula - Dice formula
     * @param {string} preset.description - Preset description
     * @returns {Promise<boolean>} Success status
     */
    async addCustomPreset(preset) {
        // Validate preset
        if (!preset.name || !preset.formula) {
            return false;
        }
        
        // Add preset
        this.customPresets.push({
            id: `preset-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            name: preset.name,
            formula: preset.formula,
            description: preset.description || ''
        });
        
        // Save presets
        await this._saveCustomPresets();
        
        return true;
    }

    /**
     * Update custom dice preset
     * @param {string} presetId - Preset ID
     * @param {Object} updates - Updates to apply
     * @returns {Promise<boolean>} Success status
     */
    async updateCustomPreset(presetId, updates) {
        // Find preset
        const index = this.customPresets.findIndex(preset => preset.id === presetId);
        if (index === -1) {
            return false;
        }
        
        // Update preset
        this.customPresets[index] = {
            ...this.customPresets[index],
            ...updates
        };
        
        // Save presets
        await this._saveCustomPresets();
        
        return true;
    }

    /**
     * Delete custom dice preset
     * @param {string} presetId - Preset ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteCustomPreset(presetId) {
        // Find preset
        const index = this.customPresets.findIndex(preset => preset.id === presetId);
        if (index === -1) {
            return false;
        }
        
        // Remove preset
        this.customPresets.splice(index, 1);
        
        // Save presets
        await this._saveCustomPresets();
        
        return true;
    }

    /**
     * Roll dice using preset
     * @param {string} presetId - Preset ID
     * @param {Object} options - Roll options
     * @returns {Promise<Object>} Roll result
     */
    async rollPreset(presetId, options = {}) {
        // Find preset
        const preset = [...this.presets, ...this.customPresets].find(p => p.id === presetId);
        if (!preset) {
            return null;
        }
        
        // Roll dice
        return await this.roll(preset.formula, {
            name: preset.name,
            ...options
        });
    }

    /**
     * Format roll result for display
     * @param {Object} roll - Roll result
     * @returns {string} Formatted roll result
     */
    formatRollResult(roll) {
        if (!roll) return '';
        
        let result = `${roll.name}: ${roll.total}`;
        
        // Add details for advantage/disadvantage
        if (roll.advantage) {
            result += ' (with advantage)';
        } else if (roll.disadvantage) {
            result += ' (with disadvantage)';
        }
        
        // Add critical hit
        if (roll.critical) {
            result += ' (critical hit)';
        }
        
        return result;
    }

    /**
     * Get detailed roll description
     * @param {Object} roll - Roll result
     * @returns {string} Roll description
     */
    getRollDescription(roll) {
        if (!roll) return '';
        
        let description = `${roll.name}\n`;
        description += `Formula: ${roll.formula}\n`;
        description += `Result: ${roll.total}\n\n`;
        
        // Add dice results
        roll.results.forEach(result => {
            if (result.die) {
                description += `${result.count}${result.die}: [${result.rolls.join(', ')}] = ${result.total}\n`;
            } else if (result.modifier) {
                description += `Modifier: ${result.modifier}\n`;
            }
        });
        
        return description;
    }

    /**
     * Check if roll is a critical hit
     * @param {Object} roll - Roll result
     * @returns {boolean} True if critical hit
     */
    isCriticalHit(roll) {
        if (!roll || roll.type !== 'attack') return false;
        
        // Check for natural 20
        const d20Result = roll.results.find(r => r.die === 'd20');
        if (!d20Result) return false;
        
        // For advantage, check if either roll is 20
        if (roll.advantage) {
            return d20Result.rolls.includes(20);
        }
        
        // For normal or disadvantage, check if the used roll is 20
        return d20Result.useRoll === 20 || d20Result.total === 20;
    }

    /**
     * Check if roll is a critical miss
     * @param {Object} roll - Roll result
     * @returns {boolean} True if critical miss
     */
    isCriticalMiss(roll) {
        if (!roll || roll.type !== 'attack') return false;
        
        // Check for natural 1
        const d20Result = roll.results.find(r => r.die === 'd20');
        if (!d20Result) return false;
        
        // For disadvantage, check if either roll is 1
        if (roll.disadvantage) {
            return d20Result.rolls.includes(1);
        }
        
        // For normal or advantage, check if the used roll is 1
        return d20Result.useRoll === 1 || d20Result.total === 1;
    }

    /**
     * Calculate average result for a dice formula
     * @param {string} formula - Dice formula
     * @returns {number} Average result
     */
    calculateAverage(formula) {
        // Parse formula
        const parsedFormula = this._parseFormula(formula);
        
        // Calculate average
        let average = 0;
        
        // Add dice averages
        parsedFormula.dice.forEach(die => {
            // Average of a die is (sides + 1) / 2
            const dieAverage = (die.sides + 1) / 2;
            average += die.count * dieAverage;
        });
        
        // Add modifiers
        parsedFormula.modifiers.forEach(modifier => {
            average += modifier;
        });
        
        return average;
    }

    /**
     * Calculate minimum result for a dice formula
     * @param {string} formula - Dice formula
     * @returns {number} Minimum result
     */
    calculateMinimum(formula) {
        // Parse formula
        const parsedFormula = this._parseFormula(formula);
        
        // Calculate minimum
        let minimum = 0;
        
        // Add dice minimums (1 per die)
        parsedFormula.dice.forEach(die => {
            minimum += die.count;
        });
        
        // Add modifiers
        parsedFormula.modifiers.forEach(modifier => {
            minimum += modifier;
        });
        
        return minimum;
    }

    /**
     * Calculate maximum result for a dice formula
     * @param {string} formula - Dice formula
     * @returns {number} Maximum result
     */
    calculateMaximum(formula) {
        // Parse formula
        const parsedFormula = this._parseFormula(formula);
        
        // Calculate maximum
        let maximum = 0;
        
        // Add dice maximums
        parsedFormula.dice.forEach(die => {
            maximum += die.count * die.sides;
        });
        
        // Add modifiers
        parsedFormula.modifiers.forEach(modifier => {
            maximum += modifier;
        });
        
        return maximum;
    }

    /**
     * Validate dice formula
     * @param {string} formula - Dice formula
     * @returns {Object} Validation result
     */
    validateFormula(formula) {
        // Parse formula
        const parsedFormula = this._parseFormula(formula);
        
        // Check for errors
        if (parsedFormula.error) {
            return {
                valid: false,
                error: parsedFormula.error
            };
        }
        
        // Check if any dice were found
        if (parsedFormula.dice.length === 0) {
            return {
                valid: false,
                error: 'No dice found in formula'
            };
        }
        
        // Check for valid dice
        for (const die of parsedFormula.dice) {
            if (die.count <= 0) {
                return {
                    valid: false,
                    error: `Invalid dice count: ${die.count}`
                };
            }
            
            if (die.sides <= 0) {
                return {
                    valid: false,
                    error: `Invalid dice sides: ${die.sides}`
                };
            }
        }
        
        return {
            valid: true,
            parsedFormula
        };
    }
}

// Export the Dice class
export default Dice;
