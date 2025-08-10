/**
 * Conditions module for Jesster's Combat Tracker
 * Handles status conditions for combatants
 */
class Conditions {
    constructor(storage) {
        // Store reference to storage module
        this.storage = storage;
        
        // Standard D&D 5e conditions
        this.standardConditions = [
            {
                id: 'blinded',
                name: 'Blinded',
                description: 'A blinded creature can\'t see and automatically fails any ability check that requires sight. Attack rolls against the creature have advantage, and the creature\'s attack rolls have disadvantage.',
                icon: '👁️',
                color: '#5C5C5C',
                rules: {
                    attackDisadvantage: true,
                    incomingAttackAdvantage: true,
                    autoFailSightChecks: true
                }
            },
            {
                id: 'charmed',
                name: 'Charmed',
                description: 'A charmed creature can\'t attack the charmer or target the charmer with harmful abilities or magical effects. The charmer has advantage on any ability check to interact socially with the creature.',
                icon: '❤️',
                color: '#FF69B4',
                rules: {
                    cannotAttackCharmer: true,
                    charmerHasSocialAdvantage: true
                }
            },
            {
                id: 'deafened',
                name: 'Deafened',
                description: 'A deafened creature can\'t hear and automatically fails any ability check that requires hearing.',
                icon: '👂',
                color: '#A9A9A9',
                rules: {
                    autoFailHearingChecks: true
                }
            },
            {
                id: 'frightened',
                name: 'Frightened',
                description: 'A frightened creature has disadvantage on ability checks and attack rolls while the source of its fear is within line of sight. The creature can\'t willingly move closer to the source of its fear.',
                icon: '😱',
                color: '#800080',
                rules: {
                    checkDisadvantage: true,
                    attackDisadvantage: true,
                    cannotMoveCloserToSource: true
                }
            },
            {
                id: 'grappled',
                name: 'Grappled',
                description: 'A grappled creature\'s speed becomes 0, and it can\'t benefit from any bonus to its speed.',
                icon: '✋',
                color: '#8B4513',
                rules: {
                    speedZero: true
                }
            },
            {
                id: 'incapacitated',
                name: 'Incapacitated',
                description: 'An incapacitated creature can\'t take actions or reactions.',
                icon: '💫',
                color: '#708090',
                rules: {
                    noActions: true,
                    noReactions: true
                }
            },
            {
                id: 'invisible',
                name: 'Invisible',
                description: 'An invisible creature is impossible to see without the aid of magic or a special sense. For the purpose of hiding, the creature is heavily obscured. The creature\'s location can be detected by any noise it makes or any tracks it leaves. Attack rolls against the creature have disadvantage, and the creature\'s attack rolls have advantage.',
                icon: '👻',
                color: '#ADD8E6',
                rules: {
                    attackAdvantage: true,
                    incomingAttackDisadvantage: true,
                    heavilyObscured: true
                }
            },
            {
                id: 'paralyzed',
                name: 'Paralyzed',
                description: 'A paralyzed creature is incapacitated and can\'t move or speak. The creature automatically fails Strength and Dexterity saving throws. Attack rolls against the creature have advantage. Any attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature.',
                icon: '⚡',
                color: '#FFD700',
                rules: {
                    incapacitated: true,
                    cannotMove: true,
                    cannotSpeak: true,
                    autoFailStrDexSaves: true,
                    incomingAttackAdvantage: true,
                    incomingMeleeCritical: true
                }
            },
            {
                id: 'petrified',
                name: 'Petrified',
                description: 'A petrified creature is transformed, along with any nonmagical object it is wearing or carrying, into a solid inanimate substance (usually stone). Its weight increases by a factor of ten, and it ceases aging. The creature is incapacitated, can\'t move or speak, and is unaware of its surroundings. Attack rolls against the creature have advantage. The creature automatically fails Strength and Dexterity saving throws. The creature has resistance to all damage. The creature is immune to poison and disease, although a poison or disease already in its system is suspended, not neutralized.',
                icon: '🗿',
                color: '#A9A9A9',
                rules: {
                    incapacitated: true,
                    cannotMove: true,
                    cannotSpeak: true,
                    unawareOfSurroundings: true,
                    incomingAttackAdvantage: true,
                    autoFailStrDexSaves: true,
                    resistAllDamage: true,
                    immuneToPoisonDisease: true
                }
            },
            {
                id: 'poisoned',
                name: 'Poisoned',
                description: 'A poisoned creature has disadvantage on attack rolls and ability checks.',
                icon: '☠️',
                color: '#008000',
                rules: {
                    attackDisadvantage: true,
                    checkDisadvantage: true
                }
            },
            {
                id: 'prone',
                name: 'Prone',
                description: 'A prone creature\'s only movement option is to crawl, unless it stands up and thereby ends the condition. The creature has disadvantage on attack rolls. An attack roll against the creature has advantage if the attacker is within 5 feet of the creature. Otherwise, the attack roll has disadvantage.',
                icon: '🛌',
                color: '#CD853F',
                rules: {
                    attackDisadvantage: true,
                    incomingMeleeAttackAdvantage: true,
                    incomingRangedAttackDisadvantage: true,
                    movementCrawlOnly: true
                }
            },
            {
                id: 'restrained',
                name: 'Restrained',
                description: 'A restrained creature\'s speed becomes 0, and it can\'t benefit from any bonus to its speed. Attack rolls against the creature have advantage, and the creature\'s attack rolls have disadvantage. The creature has disadvantage on Dexterity saving throws.',
                icon: '🔗',
                color: '#B8860B',
                rules: {
                    speedZero: true,
                    attackDisadvantage: true,
                    incomingAttackAdvantage: true,
                    dexSaveDisadvantage: true
                }
            },
            {
                id: 'stunned',
                name: 'Stunned',
                description: 'A stunned creature is incapacitated, can\'t move, and can speak only falteringly. The creature automatically fails Strength and Dexterity saving throws. Attack rolls against the creature have advantage.',
                icon: '🌀',
                color: '#4169E1',
                rules: {
                    incapacitated: true,
                    cannotMove: true,
                    difficultSpeech: true,
                    autoFailStrDexSaves: true,
                    incomingAttackAdvantage: true
                }
            },
            {
                id: 'unconscious',
                name: 'Unconscious',
                description: 'An unconscious creature is incapacitated, can\'t move or speak, and is unaware of its surroundings. The creature drops whatever it\'s holding and falls prone. The creature automatically fails Strength and Dexterity saving throws. Attack rolls against the creature have advantage. Any attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature.',
                icon: '💤',
                color: '#000000',
                rules: {
                    incapacitated: true,
                    cannotMove: true,
                    cannotSpeak: true,
                    unawareOfSurroundings: true,
                    dropItems: true,
                    prone: true,
                    autoFailStrDexSaves: true,
                    incomingAttackAdvantage: true,
                    incomingMeleeCritical: true
                }
            },
            {
                id: 'exhaustion-1',
                name: 'Exhaustion (Level 1)',
                description: 'Disadvantage on ability checks',
                icon: '😓',
                color: '#8B0000',
                rules: {
                    checkDisadvantage: true
                },
                group: 'exhaustion',
                level: 1
            },
            {
                id: 'exhaustion-2',
                name: 'Exhaustion (Level 2)',
                description: 'Speed halved',
                icon: '😓',
                color: '#8B0000',
                rules: {
                    checkDisadvantage: true,
                    speedHalved: true
                },
                group: 'exhaustion',
                level: 2
            },
            {
                id: 'exhaustion-3',
                name: 'Exhaustion (Level 3)',
                description: 'Disadvantage on attack rolls and saving throws',
                icon: '😓',
                color: '#8B0000',
                rules: {
                    checkDisadvantage: true,
                    speedHalved: true,
                    attackDisadvantage: true,
                    saveDisadvantage: true
                },
                group: 'exhaustion',
                level: 3
            },
            {
                id: 'exhaustion-4',
                name: 'Exhaustion (Level 4)',
                description: 'Hit point maximum halved',
                icon: '😓',
                color: '#8B0000',
                rules: {
                    checkDisadvantage: true,
                    speedHalved: true,
                    attackDisadvantage: true,
                    saveDisadvantage: true,
                    hpMaxHalved: true
                },
                group: 'exhaustion',
                level: 4
            },
            {
                id: 'exhaustion-5',
                name: 'Exhaustion (Level 5)',
                description: 'Speed reduced to 0',
                icon: '😓',
                color: '#8B0000',
                rules: {
                    checkDisadvantage: true,
                    speedZero: true,
                    attackDisadvantage: true,
                    saveDisadvantage: true,
                    hpMaxHalved: true
                },
                group: 'exhaustion',
                level: 5
            },
            {
                id: 'exhaustion-6',
                name: 'Exhaustion (Level 6)',
                description: 'Death',
                icon: '💀',
                color: '#8B0000',
                rules: {
                    dead: true
                },
                group: 'exhaustion',
                level: 6
            }
        ];
        
        // Common additional conditions
        this.additionalConditions = [
            {
                id: 'concentrating',
                name: 'Concentrating',
                description: 'The creature is concentrating on a spell or ability. If the creature takes damage, it must make a Constitution saving throw to maintain concentration.',
                icon: '🧠',
                color: '#9370DB',
                rules: {
                    requiresConcentrationCheck: true
                },
                isCustom: true
            },
            {
                id: 'blessed',
                name: 'Blessed',
                description: 'The creature has a +1d4 bonus to attack rolls and saving throws.',
                icon: '✨',
                color: '#FFD700',
                rules: {
                    attackBonus: '1d4',
                    saveBonus: '1d4'
                },
                isCustom: true
            },
            {
                id: 'cursed',
                name: 'Cursed',
                description: 'The creature has a -1d4 penalty to attack rolls and saving throws.',
                icon: '👎',
                color: '#8B0000',
                rules: {
                    attackPenalty: '1d4',
                    savePenalty: '1d4'
                },
                isCustom: true
            },
            {
                id: 'hasted',
                name: 'Hasted',
                description: 'The creature\'s speed is doubled, it gains a +2 bonus to AC, it has advantage on Dexterity saving throws, and it gains an additional action on each of its turns.',
                icon: '⚡',
                color: '#00FFFF',
                rules: {
                    speedDoubled: true,
                    acBonus: 2,
                    dexSaveAdvantage: true,
                    extraAction: true
                },
                isCustom: true
            },
            {
                id: 'slowed',
                name: 'Slowed',
                description: 'The creature\'s speed is halved, it takes a -2 penalty to AC and Dexterity saving throws, and it can\'t use reactions. On its turn, it can use either an action or a bonus action, not both. Regardless of the creature\'s abilities or magic items, it can\'t make more than one melee or ranged attack during its turn.',
                icon: '🐌',
                color: '#708090',
                rules: {
                    speedHalved: true,
                    acPenalty: 2,
                    dexSavePenalty: 2,
                    noReactions: true,
                    actionOrBonus: true,
                    oneAttackOnly: true
                },
                isCustom: true
            },
            {
                id: 'raging',
                name: 'Raging',
                description: 'The creature has advantage on Strength checks and Strength saving throws, gains a bonus to melee weapon damage rolls, and has resistance to bludgeoning, piercing, and slashing damage.',
                icon: '😡',
                color: '#FF4500',
                rules: {
                    strCheckAdvantage: true,
                    strSaveAdvantage: true,
                    meleeDamageBonus: true,
                    resistBPS: true
                },
                isCustom: true
            },
            {
                id: 'dodging',
                name: 'Dodging',
                description: 'Attack rolls against the creature have disadvantage, and the creature makes Dexterity saving throws with advantage.',
                icon: '🤸',
                color: '#32CD32',
                rules: {
                    incomingAttackDisadvantage: true,
                    dexSaveAdvantage: true
                },
                isCustom: true
            },
            {
                id: 'hiding',
                name: 'Hiding',
                description: 'The creature is hidden from others. Creatures that can\'t see it have disadvantage on attack rolls against it, and the creature has advantage on attack rolls against them.',
                icon: '🥷',
                color: '#808080',
                rules: {
                    incomingAttackDisadvantage: true,
                    attackAdvantage: true
                },
                isCustom: true
            },
            {
                id: 'invisible-detected',
                name: 'Invisible (Detected)',
                description: 'The creature is invisible but its location is known. Attack rolls against it have disadvantage, and it has advantage on attack rolls.',
                icon: '👁️‍🗨️',
                color: '#87CEEB',
                rules: {
                    incomingAttackDisadvantage: true,
                    attackAdvantage: true
                },
                isCustom: true
            },
            {
                id: 'flying',
                name: 'Flying',
                description: 'The creature is airborne, either through magical or natural means.',
                icon: '🦅',
                color: '#87CEEB',
                rules: {
                    flying: true
                },
                isCustom: true
            },
            {
                id: 'underwater',
                name: 'Underwater',
                description: 'The creature is submerged in water. It may have disadvantage on certain attacks and limited movement options.',
                icon: '🌊',
                color: '#1E90FF',
                rules: {
                    underwater: true
                },
                isCustom: true
            },
            {
                id: 'surprised',
                name: 'Surprised',
                description: 'A surprised creature can\'t move or take an action on its first turn of combat, and it can\'t take a reaction until that turn ends.',
                icon: '😲',
                color: '#FFA500',
                rules: {
                    cannotMove: true,
                    noActions: true,
                    noReactions: true
                },
                isCustom: true,
                duration: 1
            }
        ];
        
        // All conditions (standard + additional)
        this.allConditions = [...this.standardConditions, ...this.additionalConditions];
        
        // Custom conditions (loaded from storage)
        this.customConditions = [];
        
        // Load custom conditions
        this._loadCustomConditions();
        
        console.log("Conditions module initialized");
    }

    /**
     * Load custom conditions from storage
     * @private
     */
    async _loadCustomConditions() {
        try {
            const customConditions = await this.storage.load('customConditions', { useLocalStorage: true });
            if (customConditions && Array.isArray(customConditions)) {
                this.customConditions = customConditions;
                // Add custom conditions to allConditions
                this.allConditions = [...this.standardConditions, ...this.additionalConditions, ...this.customConditions];
            }
        } catch (error) {
            console.error('Error loading custom conditions:', error);
        }
    }

    /**
     * Save custom conditions to storage
     * @private
     */
    async _saveCustomConditions() {
        try {
            await this.storage.save('customConditions', this.customConditions, { useLocalStorage: true });
        } catch (error) {
            console.error('Error saving custom conditions:', error);
        }
    }

    /**
     * Get all conditions
     * @returns {Array} All conditions
     */
    getAllConditions() {
        return [...this.allConditions];
    }

    /**
     * Get standard conditions
     * @returns {Array} Standard conditions
     */
    getStandardConditions() {
        return [...this.standardConditions];
    }

    /**
     * Get additional conditions
     * @returns {Array} Additional conditions
     */
    getAdditionalConditions() {
        return [...this.additionalConditions];
    }

    /**
     * Get custom conditions
     * @returns {Array} Custom conditions
     */
    getCustomConditions() {
        return [...this.customConditions];
    }

    /**
     * Get condition by ID
     * @param {string} id - Condition ID
     * @returns {Object|null} Condition object or null if not found
     */
    getCondition(id) {
        return this.allConditions.find(condition => condition.id === id) || null;
    }

    /**
     * Add a custom condition
     * @param {Object} condition - Condition object
     * @returns {Promise<boolean>} Success status
     */
    async addCustomCondition(condition) {
        // Validate condition
        if (!condition.id || !condition.name) {
            console.error('Invalid condition:', condition);
            return false;
        }
        
        // Check if condition ID already exists
        if (this.getCondition(condition.id)) {
            console.error('Condition ID already exists:', condition.id);
            return false;
        }
        
        // Add custom flag
        condition.isCustom = true;
        
        // Add to custom conditions
        this.customConditions.push(condition);
        
        // Update all conditions
        this.allConditions = [...this.standardConditions, ...this.additionalConditions, ...this.customConditions];
        
        // Save custom conditions
        await this._saveCustomConditions();
        
        return true;
    }

    /**
     * Update a custom condition
     * @param {string} id - Condition ID
     * @param {Object} updates - Condition updates
     * @returns {Promise<boolean>} Success status
     */
    async updateCustomCondition(id, updates) {
        // Find condition index
        const index = this.customConditions.findIndex(condition => condition.id === id);
        
        // Check if condition exists
        if (index === -1) {
            console.error('Custom condition not found:', id);
            return false;
        }
        
        // Update condition
        this.customConditions[index] = { ...this.customConditions[index], ...updates };
        
        // Update all conditions
        this.allConditions = [...this.standardConditions, ...this.additionalConditions, ...this.customConditions];
        
        // Save custom conditions
        await this._saveCustomConditions();
        
        return true;
    }

    /**
     * Delete a custom condition
     * @param {string} id - Condition ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteCustomCondition(id) {
        // Find condition index
        const index = this.customConditions.findIndex(condition => condition.id === id);
        
        // Check if condition exists
        if (index === -1) {
            console.error('Custom condition not found:', id);
            return false;
        }
        
        // Remove condition
        this.customConditions.splice(index, 1);
        
        // Update all conditions
        this.allConditions = [...this.standardConditions, ...this.additionalConditions, ...this.customConditions];
        
        // Save custom conditions
        await this._saveCustomConditions();
        
        return true;
    }

    /**
     * Apply a condition to a combatant
     * @param {Object} combatant - Combatant object
     * @param {string} conditionId - Condition ID
     * @param {Object} options - Options
     * @param {number} options.duration - Duration in rounds
     * @param {string} options.source - Source of the condition
     * @param {number} options.saveDC - Save DC to end the condition
     * @param {string} options.saveAbility - Ability to save with
     * @param {string} options.notes - Additional notes
     * @returns {Object} Updated combatant
     */
    applyCondition(combatant, conditionId, options = {}) {
        // Get condition
        const condition = this.getCondition(conditionId);
        if (!condition) {
            console.error('Condition not found:', conditionId);
            return combatant;
        }
        
        // Initialize conditions array if it doesn't exist
        if (!combatant.conditions) {
            combatant.conditions = [];
        }
        
        // Check if condition is already applied
        const existingIndex = combatant.conditions.findIndex(c => c.id === conditionId);
        
        // Get options
        const {
            duration = null,
            source = null,
            saveDC = null,
            saveAbility = null,
            notes = null
        } = options;
        
        // Create applied condition
        const appliedCondition = {
            id: conditionId,
            name: condition.name,
            icon: condition.icon,
            color: condition.color,
            appliedAt: Date.now(),
            duration: duration || condition.duration || null,
            source,
            saveDC,
            saveAbility,
            notes
        };
        
        // If condition is exhaustion, remove any existing exhaustion
        if (condition.group === 'exhaustion') {
            combatant.conditions = combatant.conditions.filter(c => {
                const cond = this.getCondition(c.id);
                return !cond || cond.group !== 'exhaustion';
            });
        }
        
        // Add or update condition
        if (existingIndex !== -1) {
            combatant.conditions[existingIndex] = appliedCondition;
        } else {
            combatant.conditions.push(appliedCondition);
        }
        
        return combatant;
    }

    /**
     * Remove a condition from a combatant
     * @param {Object} combatant - Combatant object
     * @param {string} conditionId - Condition ID
     * @returns {Object} Updated combatant
     */
    removeCondition(combatant, conditionId) {
        // Check if combatant has conditions
        if (!combatant.conditions) {
            return combatant;
        }
        
        // Remove condition
        combatant.conditions = combatant.conditions.filter(condition => condition.id !== conditionId);
        
        return combatant;
    }

    /**
     * Check if a combatant has a condition
     * @param {Object} combatant - Combatant object
     * @param {string} conditionId - Condition ID
     * @returns {boolean} True if combatant has condition
     */
    hasCondition(combatant, conditionId) {
        return combatant.conditions && combatant.conditions.some(condition => condition.id === conditionId);
    }

    /**
     * Get all conditions applied to a combatant
     * @param {Object} combatant - Combatant object
     * @returns {Array} Applied conditions
     */
    getCombatantConditions(combatant) {
        return combatant.conditions || [];
    }

    /**
     * Update condition durations at the end of a combatant's turn
     * @param {Object} combatant - Combatant object
     * @returns {Object} Updated combatant with expired conditions removed
     */
    updateConditionDurations(combatant) {
        // Check if combatant has conditions
        if (!combatant.conditions || combatant.conditions.length === 0) {
            return combatant;
        }
        
        // Update durations and filter out expired conditions
        combatant.conditions = combatant.conditions.filter(condition => {
            // If condition has no duration, keep it
            if (condition.duration === null || condition.duration === undefined) {
                return true;
            }
            
            // Decrement duration
            condition.duration--;
            
            // Keep condition if duration is still positive
            return condition.duration > 0;
        });
        
        return combatant;
    }

    /**
     * Process saving throws for conditions at the start of a combatant's turn
     * @param {Object} combatant - Combatant object
     * @param {Function} rollSave - Function to roll a saving throw
     * @returns {Promise<Object>} Updated combatant and save results
     */
    async processConditionSaves(combatant, rollSave) {
        // Check if combatant has conditions
        if (!combatant.conditions || combatant.conditions.length === 0) {
            return { combatant, results: [] };
        }
        
        const results = [];
        const updatedConditions = [];
        
        // Process each condition
        for (const condition of combatant.conditions) {
            // Skip conditions without save DC
            if (!condition.saveDC || !condition.saveAbility) {
                updatedConditions.push(condition);
                continue;
            }
            
            // Roll save
            const saveResult = await rollSave(combatant, condition.saveAbility, condition.saveDC);
            
            // Check if save succeeded
            if (saveResult.success) {
                // Save succeeded, condition ends
                results.push({
                    condition,
                    roll: saveResult.roll,
                    success: true,
                    message: `${combatant.name} succeeded on a ${condition.saveAbility} save (DC ${condition.saveDC}) and is no longer ${condition.name}.`
                });
            } else {
                // Save failed, condition continues
                updatedConditions.push(condition);
                results.push({
                    condition,
                    roll: saveResult.roll,
                    success: false,
                    message: `${combatant.name} failed a ${condition.saveAbility} save (DC ${condition.saveDC}) and remains ${condition.name}.`
                });
            }
        }
        
        // Update combatant conditions
        combatant.conditions = updatedConditions;
        
        return { combatant, results };
    }

    /**
     * Get condition effects for a combatant
     * @param {Object} combatant - Combatant object
     * @returns {Object} Condition effects
     */
    getConditionEffects(combatant) {
        // Initialize effects
        const effects = {
            // Attack effects
            attackAdvantage: false,
            attackDisadvantage: false,
            incomingAttackAdvantage: false,
            incomingAttackDisadvantage: false,
            incomingMeleeAttackAdvantage: false,
            incomingRangedAttackDisadvantage: false,
            incomingMeleeCritical: false,
            attackBonus: 0,
            attackPenalty: 0,
            
            // Defense effects
            acBonus: 0,
            acPenalty: 0,
            
            // Save effects
            saveAdvantage: false,
            saveDisadvantage: false,
            saveBonus: 0,
            savePenalty: 0,
            autoFailStrDexSaves: false,
            dexSaveAdvantage: false,
            dexSaveDisadvantage: false,
            strSaveAdvantage: false,
            
            // Check effects
            checkAdvantage: false,
            checkDisadvantage: false,
            strCheckAdvantage: false,
            
            // Movement effects
            speedZero: false,
            speedHalved: false,
            speedDoubled: false,
            cannotMove: false,
            cannotMoveCloserToSource: false,
            movementCrawlOnly: false,
            flying: false,
            underwater: false,
            
            // Action effects
            noActions: false,
            noReactions: false,
            extraAction: false,
            actionOrBonus: false,
            oneAttackOnly: false,
            
            // Special effects
            requiresConcentrationCheck: false,
            resistAllDamage: false,
            resistBPS: false,
            immuneToPoisonDisease: false,
            cannotAttackCharmer: false,
            charmerHasSocialAdvantage: false,
            autoFailSightChecks: false,
            autoFailHearingChecks: false,
            heavilyObscured: false,
            unawareOfSurroundings: false,
            cannotSpeak: false,
            difficultSpeech: false,
            dropItems: false,
            prone: false,
            hpMaxHalved: false,
            meleeDamageBonus: false,
            dead: false
        };
        
        // Check if combatant has conditions
        if (!combatant.conditions || combatant.conditions.length === 0) {
            return effects;
        }
        
        // Process each condition
        for (const appliedCondition of combatant.conditions) {
            // Get condition details
            const condition = this.getCondition(appliedCondition.id);
            if (!condition || !condition.rules) continue;
            
            // Apply condition rules
            const rules = condition.rules;
            
            // Attack effects
            if (rules.attackAdvantage) effects.attackAdvantage = true;
                       if (rules.incomingAttackAdvantage) effects.incomingAttackAdvantage = true;
            if (rules.incomingAttackDisadvantage) effects.incomingAttackDisadvantage = true;
            if (rules.incomingMeleeAttackAdvantage) effects.incomingMeleeAttackAdvantage = true;
            if (rules.incomingRangedAttackDisadvantage) effects.incomingRangedAttackDisadvantage = true;
            if (rules.incomingMeleeCritical) effects.incomingMeleeCritical = true;
            if (rules.attackBonus) effects.attackBonus += rules.attackBonus;
            if (rules.attackPenalty) effects.attackPenalty += rules.attackPenalty;
            
            // Defense effects
            if (rules.acBonus) effects.acBonus += rules.acBonus;
            if (rules.acPenalty) effects.acPenalty += rules.acPenalty;
            
            // Save effects
            if (rules.saveAdvantage) effects.saveAdvantage = true;
            if (rules.saveDisadvantage) effects.saveDisadvantage = true;
            if (rules.saveBonus) effects.saveBonus += rules.saveBonus;
            if (rules.savePenalty) effects.savePenalty += rules.savePenalty;
            if (rules.autoFailStrDexSaves) effects.autoFailStrDexSaves = true;
            if (rules.dexSaveAdvantage) effects.dexSaveAdvantage = true;
            if (rules.dexSaveDisadvantage) effects.dexSaveDisadvantage = true;
            if (rules.strSaveAdvantage) effects.strSaveAdvantage = true;
            
            // Check effects
            if (rules.checkAdvantage) effects.checkAdvantage = true;
            if (rules.checkDisadvantage) effects.checkDisadvantage = true;
            if (rules.strCheckAdvantage) effects.strCheckAdvantage = true;
            
            // Movement effects
            if (rules.speedZero) effects.speedZero = true;
            if (rules.speedHalved) effects.speedHalved = true;
            if (rules.speedDoubled) effects.speedDoubled = true;
            if (rules.cannotMove) effects.cannotMove = true;
            if (rules.cannotMoveCloserToSource) effects.cannotMoveCloserToSource = true;
            if (rules.movementCrawlOnly) effects.movementCrawlOnly = true;
            if (rules.flying) effects.flying = true;
            if (rules.underwater) effects.underwater = true;
            
            // Action effects
            if (rules.noActions) effects.noActions = true;
            if (rules.noReactions) effects.noReactions = true;
            if (rules.extraAction) effects.extraAction = true;
            if (rules.actionOrBonus) effects.actionOrBonus = true;
            if (rules.oneAttackOnly) effects.oneAttackOnly = true;
            
            // Special effects
            if (rules.requiresConcentrationCheck) effects.requiresConcentrationCheck = true;
            if (rules.resistAllDamage) effects.resistAllDamage = true;
            if (rules.resistBPS) effects.resistBPS = true;
            if (rules.immuneToPoisonDisease) effects.immuneToPoisonDisease = true;
            if (rules.cannotAttackCharmer) effects.cannotAttackCharmer = true;
            if (rules.charmerHasSocialAdvantage) effects.charmerHasSocialAdvantage = true;
            if (rules.autoFailSightChecks) effects.autoFailSightChecks = true;
            if (rules.autoFailHearingChecks) effects.autoFailHearingChecks = true;
            if (rules.heavilyObscured) effects.heavilyObscured = true;
            if (rules.unawareOfSurroundings) effects.unawareOfSurroundings = true;
            if (rules.cannotSpeak) effects.cannotSpeak = true;
            if (rules.difficultSpeech) effects.difficultSpeech = true;
            if (rules.dropItems) effects.dropItems = true;
            if (rules.prone) effects.prone = true;
            if (rules.hpMaxHalved) effects.hpMaxHalved = true;
            if (rules.meleeDamageBonus) effects.meleeDamageBonus = true;
            if (rules.dead) effects.dead = true;
        }
        
        return effects;
    }

    /**
     * Get condition description for a combatant
     * @param {Object} combatant - Combatant object
     * @returns {string} Condition description
     */
    getConditionDescription(combatant) {
        // Check if combatant has conditions
        if (!combatant.conditions || combatant.conditions.length === 0) {
            return '';
        }
        
        // Get condition descriptions
        const descriptions = combatant.conditions.map(appliedCondition => {
            const condition = this.getCondition(appliedCondition.id);
            if (!condition) return '';
            
            let description = condition.description;
            
            // Add duration if available
            if (appliedCondition.duration) {
                description += ` (${appliedCondition.duration} rounds remaining)`;
            }
            
            // Add source if available
            if (appliedCondition.source) {
                description += ` [Source: ${appliedCondition.source}]`;
            }
            
            // Add save info if available
            if (appliedCondition.saveDC && appliedCondition.saveAbility) {
                description += ` [${appliedCondition.saveAbility.toUpperCase()} save DC ${appliedCondition.saveDC} to end]`;
            }
            
            // Add notes if available
            if (appliedCondition.notes) {
                description += ` [Note: ${appliedCondition.notes}]`;
            }
            
            return description;
        });
        
        return descriptions.join('\n\n');
    }

    /**
     * Get condition icons for a combatant
     * @param {Object} combatant - Combatant object
     * @returns {Array} Condition icons
     */
    getConditionIcons(combatant) {
        // Check if combatant has conditions
        if (!combatant.conditions || combatant.conditions.length === 0) {
            return [];
        }
        
        // Get condition icons
        return combatant.conditions.map(appliedCondition => {
            const condition = this.getCondition(appliedCondition.id);
            if (!condition) return null;
            
            return {
                id: appliedCondition.id,
                icon: condition.icon,
                color: condition.color,
                name: condition.name,
                duration: appliedCondition.duration
            };
        }).filter(icon => icon !== null);
    }

    /**
     * Create a new custom condition
     * @param {Object} conditionData - Condition data
     * @returns {Promise<Object|null>} Created condition or null if failed
     */
    async createCustomCondition(conditionData) {
        // Generate ID if not provided
        if (!conditionData.id) {
            conditionData.id = `custom-${Date.now()}`;
        }
        
        // Set default values
        const condition = {
            id: conditionData.id,
            name: conditionData.name || 'Custom Condition',
            description: conditionData.description || '',
            icon: conditionData.icon || '❓',
            color: conditionData.color || '#808080',
            rules: conditionData.rules || {},
            isCustom: true
        };
        
        // Add condition
        const success = await this.addCustomCondition(condition);
        
        return success ? condition : null;
    }

    /**
     * Check if a condition is a standard condition
     * @param {string} conditionId - Condition ID
     * @returns {boolean} True if condition is standard
     */
    isStandardCondition(conditionId) {
        return this.standardConditions.some(condition => condition.id === conditionId);
    }

    /**
     * Check if a condition is a custom condition
     * @param {string} conditionId - Condition ID
     * @returns {boolean} True if condition is custom
     */
    isCustomCondition(conditionId) {
        return this.customConditions.some(condition => condition.id === conditionId);
    }

    /**
     * Get condition by name (case-insensitive)
     * @param {string} name - Condition name
     * @returns {Object|null} Condition object or null if not found
     */
    getConditionByName(name) {
        return this.allConditions.find(
            condition => condition.name.toLowerCase() === name.toLowerCase()
        ) || null;
    }

    /**
     * Search conditions by name or description
     * @param {string} query - Search query
     * @returns {Array} Matching conditions
     */
    searchConditions(query) {
        if (!query) return this.getAllConditions();
        
        const lowerQuery = query.toLowerCase();
        
        return this.allConditions.filter(condition => 
            condition.name.toLowerCase().includes(lowerQuery) || 
            condition.description.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Get conditions by category
     * @param {string} category - Category (standard, additional, custom)
     * @returns {Array} Conditions in category
     */
    getConditionsByCategory(category) {
        switch (category.toLowerCase()) {
            case 'standard':
                return this.getStandardConditions();
            case 'additional':
                return this.getAdditionalConditions();
            case 'custom':
                return this.getCustomConditions();
            default:
                return this.getAllConditions();
        }
    }

    /**
     * Get exhaustion level for a combatant
     * @param {Object} combatant - Combatant object
     * @returns {number} Exhaustion level (0-6)
     */
    getExhaustionLevel(combatant) {
        // Check if combatant has conditions
        if (!combatant.conditions) return 0;
        
        // Find exhaustion condition
        for (const appliedCondition of combatant.conditions) {
            const condition = this.getCondition(appliedCondition.id);
            if (condition && condition.group === 'exhaustion') {
                return condition.level || 0;
            }
        }
        
        return 0;
    }

    /**
     * Set exhaustion level for a combatant
     * @param {Object} combatant - Combatant object
     * @param {number} level - Exhaustion level (0-6)
     * @returns {Object} Updated combatant
     */
    setExhaustionLevel(combatant, level) {
        // Validate level
        level = Math.max(0, Math.min(6, level));
        
        // Remove any existing exhaustion
        if (combatant.conditions) {
            combatant.conditions = combatant.conditions.filter(appliedCondition => {
                const condition = this.getCondition(appliedCondition.id);
                return !condition || condition.group !== 'exhaustion';
            });
        }
        
        // If level is 0, just return the combatant
        if (level === 0) {
            return combatant;
        }
        
        // Apply new exhaustion level
        return this.applyCondition(combatant, `exhaustion-${level}`);
    }

    /**
     * Increase exhaustion level for a combatant
     * @param {Object} combatant - Combatant object
     * @param {number} amount - Amount to increase (default: 1)
     * @returns {Object} Updated combatant
     */
    increaseExhaustionLevel(combatant, amount = 1) {
        const currentLevel = this.getExhaustionLevel(combatant);
        return this.setExhaustionLevel(combatant, currentLevel + amount);
    }

    /**
     * Decrease exhaustion level for a combatant
     * @param {Object} combatant - Combatant object
     * @param {number} amount - Amount to decrease (default: 1)
     * @returns {Object} Updated combatant
     */
    decreaseExhaustionLevel(combatant, amount = 1) {
        const currentLevel = this.getExhaustionLevel(combatant);
        return this.setExhaustionLevel(combatant, currentLevel - amount);
    }

    /**
     * Get condition duration for a combatant
     * @param {Object} combatant - Combatant object
     * @param {string} conditionId - Condition ID
     * @returns {number|null} Condition duration or null if not found
     */
    getConditionDuration(combatant, conditionId) {
        // Check if combatant has conditions
        if (!combatant.conditions) return null;
        
        // Find condition
        const appliedCondition = combatant.conditions.find(c => c.id === conditionId);
        return appliedCondition ? appliedCondition.duration : null;
    }

    /**
     * Set condition duration for a combatant
     * @param {Object} combatant - Combatant object
     * @param {string} conditionId - Condition ID
     * @param {number} duration - New duration
     * @returns {Object} Updated combatant
     */
    setConditionDuration(combatant, conditionId, duration) {
        // Check if combatant has conditions
        if (!combatant.conditions) return combatant;
        
        // Find and update condition
        const index = combatant.conditions.findIndex(c => c.id === conditionId);
        if (index !== -1) {
            combatant.conditions[index].duration = duration;
        }
        
        return combatant;
    }

    /**
     * Get condition notes for a combatant
     * @param {Object} combatant - Combatant object
     * @param {string} conditionId - Condition ID
     * @returns {string|null} Condition notes or null if not found
     */
    getConditionNotes(combatant, conditionId) {
        // Check if combatant has conditions
        if (!combatant.conditions) return null;
        
        // Find condition
        const appliedCondition = combatant.conditions.find(c => c.id === conditionId);
        return appliedCondition ? appliedCondition.notes : null;
    }

    /**
     * Set condition notes for a combatant
     * @param {Object} combatant - Combatant object
     * @param {string} conditionId - Condition ID
     * @param {string} notes - New notes
     * @returns {Object} Updated combatant
     */
    setConditionNotes(combatant, conditionId, notes) {
        // Check if combatant has conditions
        if (!combatant.conditions) return combatant;
        
        // Find and update condition
        const index = combatant.conditions.findIndex(c => c.id === conditionId);
        if (index !== -1) {
            combatant.conditions[index].notes = notes;
        }
        
        return combatant;
    }

    /**
     * Get conditions that require concentration
     * @returns {Array} Conditions that require concentration
     */
    getConcentrationConditions() {
        return this.allConditions.filter(condition => 
            condition.rules && condition.rules.requiresConcentrationCheck
        );
    }

    /**
     * Check if a combatant is concentrating
     * @param {Object} combatant - Combatant object
     * @returns {boolean} True if combatant is concentrating
     */
    isConcentrating(combatant) {
        return this.hasCondition(combatant, 'concentrating');
    }

    /**
     * Get condition rules for a specific condition
     * @param {string} conditionId - Condition ID
     * @returns {Object|null} Condition rules or null if not found
     */
    getConditionRules(conditionId) {
        const condition = this.getCondition(conditionId);
        return condition ? condition.rules : null;
    }

    /**
     * Check if a condition affects a specific rule
     * @param {string} conditionId - Condition ID
     * @param {string} rule - Rule to check
     * @returns {boolean} True if condition affects rule
     */
    doesConditionAffectRule(conditionId, rule) {
        const rules = this.getConditionRules(conditionId);
        return rules ? !!rules[rule] : false;
    }

    /**
     * Get all conditions that affect a specific rule
     * @param {string} rule - Rule to check
     * @returns {Array} Conditions that affect rule
     */
    getConditionsAffectingRule(rule) {
        return this.allConditions.filter(condition => 
            condition.rules && condition.rules[rule]
        );
    }
}

// Export the Conditions class
export default Conditions;
