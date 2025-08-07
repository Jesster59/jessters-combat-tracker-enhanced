/**
 * Combat Manager for Jesster's Combat Tracker
 * Handles combat flow, creatures, and turn management
 */
class CombatManager {
    constructor(app) {
        this.app = app;
        this.creatures = [];
        console.log("Combat Manager initialized");
    }
    
    /**
     * Add a creature to combat
     * @param {Object} creature - The creature to add
     */
    addCreature(creature) {
        // Ensure creature has required properties
        const creatureData = {
            id: creature.id || `creature-${this.app.utils.generateShortId()}`,
            name: creature.name || 'Unnamed Creature',
            type: creature.type || 'monster',
            maxHp: creature.maxHp || 10,
            currentHp: creature.currentHp !== undefined ? creature.currentHp : creature.maxHp,
            tempHp: creature.tempHp || 0,
            ac: creature.ac || 10,
            initiativeModifier: creature.initiativeModifier || 0,
            initiative: creature.initiative || null,
            conditions: creature.conditions || [],
            str: creature.str || 10,
            dex: creature.dex || 10,
            con: creature.con || 10,
            int: creature.int || 10,
            wis: creature.wis || 10,
            cha: creature.cha || 10,
            pp: creature.pp || 10,
            saves: creature.saves || '',
            notes: creature.notes || '',
            action: false,
            bonusAction: false,
            reaction: false,
            concentrating: creature.concentrating || false,
            inspiration: creature.inspiration || false,
            img: creature.img || '',
            actions: creature.actions || []
        };
        
        this.creatures.push(creatureData);
        this.app.logEvent(`${creatureData.name} (${creatureData.type}) added to combat.`);
        this.app.ui.renderCreatures();
        this.app.ui.renderInitiativeOrder();
        this.app.updatePlayerView();
        
        return creatureData;
    }
    
    /**
     * Remove a creature from combat
     * @param {string} creatureId - The ID of the creature to remove
     */
    removeCreature(creatureId) {
        const creature = this.getCreatureById(creatureId);
        if (creature) {
            this.creatures = this.creatures.filter(c => c.id !== creatureId);
            this.app.logEvent(`${creature.name} removed from combat.`);
            this.app.ui.renderCreatures();
            this.app.ui.renderInitiativeOrder();
            this.app.updatePlayerView();
            
            // If the removed creature was the current turn, advance to the next turn
            if (this.app.state.combatStarted && this.app.state.currentTurn === creatureId) {
                this.nextTurn();
            }
        }
    }
    
    /**
     * Clear all combatants
     */
    clearCombatants() {
        this.creatures = [];
        this.app.ui.renderCreatures();
        this.app.ui.renderInitiativeOrder();
        this.app.updatePlayerView();
    }
    
    /**
     * Get a creature by ID
     * @param {string} creatureId - The ID of the creature
     * @returns {Object|null} - The creature or null if not found
     */
    getCreatureById(creatureId) {
        return this.creatures.find(c => c.id === creatureId) || null;
    }
    
    /**
     * Get all creatures
     * @returns {Array} - All creatures
     */
    getAllCreatures() {
        return this.creatures;
    }
    
    /**
     * Get all heroes
     * @returns {Array} - All heroes
     */
    getHeroes() {
        return this.creatures.filter(c => c.type === 'hero');
    }
    
    /**
     * Get all monsters
     * @returns {Array} - All monsters
     */
    getMonsters() {
        return this.creatures.filter(c => c.type === 'monster');
    }
    
    /**
     * Get all creatures with initiative
     * @returns {Array} - All creatures with initiative, sorted by initiative
     */
    getCreaturesWithInitiative() {
        return this.creatures
            .filter(c => c.initiative !== null)
            .sort((a, b) => {
                // Sort by initiative (descending)
                if (b.initiative !== a.initiative) {
                    return b.initiative - a.initiative;
                }
                
                // If initiative is tied, sort by dexterity (descending)
                if (b.dex !== a.dex) {
                    return b.dex - a.dex;
                }
                
                // If dexterity is tied, sort by name (ascending)
                return a.name.localeCompare(b.name);
            });
    }
    
    /**
     * Start combat
     */
    startCombat() {
        if (this.creatures.length === 0) {
            this.app.showAlert('Add some creatures before starting combat!');
            return;
        }
        
        this.app.state.combatStarted = true;
        this.app.state.combatStartTime = new Date();
        this.app.state.roundNumber = 1;
        
        this.app.logEvent('Combat started!');
        
        // Auto-roll initiative if not already rolled
        const hasInitiative = this.creatures.some(c => c.initiative !== null);
        if (!hasInitiative) {
            this.rollInitiativeForAll();
        }
        
        // Determine first turn
        this.determineFirstTurn();
        
        // Update UI
        this.app.ui.renderCreatures();
        this.app.ui.renderInitiativeOrder();
        this.app.updatePlayerView();
        
        // Play sound effect
        this.app.audio.play('combatStart');
    }
    
    /**
     * End combat
     */
    endCombat() {
        this.app.showConfirm('Are you sure you want to end combat?', () => {
            this.app.state.combatStarted = false;
            this.app.state.currentTurn = null;
            this.app.state.roundNumber = 1;
            this.app.state.combatStartTime = null;
            
            // Reset all creatures' initiative and action economy
            this.creatures.forEach(creature => {
                creature.initiative = null;
                creature.action = false;
                creature.bonusAction = false;
                creature.reaction = false;
            });
            
            this.app.logEvent('Combat ended.');
            
            // Update UI
            this.app.ui.renderCreatures();
            this.app.ui.renderInitiativeOrder();
            this.app.updatePlayerView();
        });
    }
    
    /**
     * Roll initiative for all creatures
     */
    async rollInitiativeForAll() {
        for (const creature of this.creatures) {
            const roll = await this.app.dice.roll('1d20');
            creature.initiative = roll.total + creature.initiativeModifier;
            this.app.logEvent(`${creature.name} rolls initiative: ${roll.total} + ${creature.initiativeModifier} = ${creature.initiative}`);
        }
        
        this.app.ui.renderInitiativeOrder();
        this.app.updatePlayerView();
    }
    
    /**
     * Determine the first turn
     */
    determineFirstTurn() {
        const sortedCreatures = this.getCreaturesWithInitiative();
        
        if (sortedCreatures.length > 0) {
            this.app.state.currentTurn = sortedCreatures[0].id;
            this.app.logEvent(`${sortedCreatures[0].name}'s turn begins!`);
            
            // Play sound effect
            this.app.audio.play('turnStart');
        }
    }
    
    /**
     * Move to the next turn
     */
    nextTurn() {
        if (!this.app.state.combatStarted) return;
        
        const sortedCreatures = this.getCreaturesWithInitiative();
        
        if (sortedCreatures.length === 0) return;
        
        const currentIndex = sortedCreatures.findIndex(c => c.id === this.app.state.currentTurn);
        let nextIndex = currentIndex + 1;
        
        // If we've reached the end, start a new round
        if (nextIndex >= sortedCreatures.length) {
            nextIndex = 0;
            this.app.state.roundNumber++;
            this.app.logEvent(`--- Round ${this.app.state.roundNumber} begins ---`);
            
            // Reset action economy for all creatures
            this.creatures.forEach(creature => {
                creature.action = false;
                creature.bonusAction = false;
                creature.reaction = false;
            });
            
            // Play round start sound
            this.app.audio.play('roundStart');
        }
        
        // Update current turn
        this.app.state.currentTurn = sortedCreatures[nextIndex].id;
        this.app.logEvent(`${sortedCreatures[nextIndex].name}'s turn begins!`);
        
        // Update UI
        this.app.ui.renderCreatures();
        this.app.ui.renderInitiativeOrder();
        this.app.updatePlayerView();
        
        // Play turn end sound
        this.app.audio.play('turnEnd');
    }
    
    /**
     * Add a condition to a creature
     * @param {string} creatureId - The ID of the creature
     * @param {string|Object} condition - The condition to add (string or object with name and roundsLeft)
     */
    addCondition(creatureId, condition) {
        const creature = this.getCreatureById(creatureId);
        if (!creature) return;
        
        // Normalize condition to object format
        const conditionObj = typeof condition === 'string' ? { name: condition, roundsLeft: null } : condition;
        
        // Check if condition already exists
        const existingIndex = creature.conditions.findIndex(c => {
            if (typeof c === 'string') {
                return c === conditionObj.name;
            }
            return c.name === conditionObj.name;
        });
        
        if (existingIndex !== -1) {
            // Update existing condition
            creature.conditions[existingIndex] = conditionObj;
        } else {
            // Add new condition
            creature.conditions.push(conditionObj);
        }
        
        this.app.logEvent(`${creature.name} gained condition: ${conditionObj.name}${conditionObj.roundsLeft ? ` (${conditionObj.roundsLeft} rounds)` : ''}`);
        
        // Update UI
        this.app.ui.renderCreatures();
        this.app.updatePlayerView();
    }
    
    /**
     * Remove a condition from a creature
     * @param {string} creatureId - The ID of the creature
     * @param {string} conditionName - The name of the condition to remove
     */
    removeCondition(creatureId, conditionName) {
        const creature = this.getCreatureById(creatureId);
        if (!creature) return;
        
        // Filter out the condition
        creature.conditions = creature.conditions.filter(c => {
            if (typeof c === 'string') {
                return c !== conditionName;
            }
            return c.name !== conditionName;
        });
        
        this.app.logEvent(`${creature.name} lost condition: ${conditionName}`);
        
        // Update UI
        this.app.ui.renderCreatures();
        this.app.updatePlayerView();
    }
    
    /**
     * Update a creature's initiative
     * @param {string} creatureId - The ID of the creature
     * @param {number} initiative - The new initiative value
     */
    updateInitiative(creatureId, initiative) {
        const creature = this.getCreatureById(creatureId);
        if (!creature) return;
        
        creature.initiative = initiative;
        this.app.logEvent(`${creature.name}'s initiative updated to ${initiative}`);
        
        // Update UI
        this.app.ui.renderInitiativeOrder();
        this.app.updatePlayerView();
    }
    
        /**
     * Toggle concentration for a creature
     * @param {string} creatureId - The ID of the creature
     * @param {boolean} [isConcentrating] - Whether the creature is concentrating (if not provided, toggles current state)
     */
    toggleConcentration(creatureId, isConcentrating) {
        const creature = this.getCreatureById(creatureId);
        if (!creature) return;
        
        // If isConcentrating is not provided, toggle the current state
        if (isConcentrating === undefined) {
            isConcentrating = !creature.concentrating;
        }
        
        creature.concentrating = isConcentrating;
        
        if (isConcentrating) {
            this.app.logEvent(`${creature.name} is now concentrating on a spell.`);
        } else {
            this.app.logEvent(`${creature.name} is no longer concentrating.`);
        }
        
        // Update UI
        this.app.ui.renderCreatures();
        this.app.updatePlayerView();
    }
    
    /**
     * Toggle inspiration for a hero
     * @param {string} creatureId - The ID of the hero
     * @param {boolean} [hasInspiration] - Whether the hero has inspiration (if not provided, toggles current state)
     */
    toggleInspiration(creatureId, hasInspiration) {
        const creature = this.getCreatureById(creatureId);
        if (!creature || creature.type !== 'hero') return;
        
        // If hasInspiration is not provided, toggle the current state
        if (hasInspiration === undefined) {
            hasInspiration = !creature.inspiration;
        }
        
        creature.inspiration = hasInspiration;
        
        if (hasInspiration) {
            this.app.logEvent(`${creature.name} gained inspiration.`);
        } else {
            this.app.logEvent(`${creature.name} used inspiration.`);
        }
        
        // Update UI
        this.app.ui.renderCreatures();
        this.app.updatePlayerView();
    }
    
    /**
     * Toggle action usage for a creature
     * @param {string} creatureId - The ID of the creature
     * @param {string} actionType - The type of action ('action', 'bonusAction', or 'reaction')
     * @param {boolean} [used] - Whether the action is used (if not provided, toggles current state)
     */
    toggleAction(creatureId, actionType, used) {
        const creature = this.getCreatureById(creatureId);
        if (!creature) return;
        
        // Validate action type
        if (!['action', 'bonusAction', 'reaction'].includes(actionType)) {
            console.error(`Invalid action type: ${actionType}`);
            return;
        }
        
        // If used is not provided, toggle the current state
        if (used === undefined) {
            used = !creature[actionType];
        }
        
        creature[actionType] = used;
        
        // Format action type for logging
        const actionTypeFormatted = actionType === 'bonusAction' ? 'bonus action' : actionType;
        
        if (used) {
            this.app.logEvent(`${creature.name} used their ${actionTypeFormatted}.`);
        } else {
            this.app.logEvent(`${creature.name}'s ${actionTypeFormatted} was restored.`);
        }
        
        // Update UI
        this.app.ui.renderCreatures();
        this.app.updatePlayerView();
    }
    
    /**
     * Make a saving throw for a creature
     * @param {string} creatureId - The ID of the creature
     * @param {string} ability - The ability to use ('str', 'dex', 'con', 'int', 'wis', 'cha')
     * @param {number} dc - The DC of the saving throw
     * @param {Object} [options] - Additional options
     * @param {boolean} [options.advantage] - Whether the creature has advantage
     * @param {boolean} [options.disadvantage] - Whether the creature has disadvantage
     * @returns {Promise<Object>} - The result of the saving throw
     */
    async makeSavingThrow(creatureId, ability, dc, options = {}) {
        const creature = this.getCreatureById(creatureId);
        if (!creature) return null;
        
        // Validate ability
        if (!['str', 'dex', 'con', 'int', 'wis', 'cha'].includes(ability)) {
            console.error(`Invalid ability: ${ability}`);
            return null;
        }
        
        // Calculate modifier
        let modifier = this.app.utils.getAbilityModifier(creature[ability]);
        
        // Check for proficiency in the save
        if (creature.saves) {
            const saveMatch = creature.saves.match(new RegExp(`${ability.toUpperCase()}\\s*([+-])\\s*(\\d+)`));
            if (saveMatch) {
                const sign = saveMatch[1];
                const value = parseInt(saveMatch[2]);
                modifier = sign === '+' ? value : -value;
            }
        }
        
        // Roll the save
        const roll = await this.app.dice.roll('1d20', {
            advantage: options.advantage,
            disadvantage: options.disadvantage
        });
        
        const total = roll.total + modifier;
        const success = total >= dc;
        
        // Log the result
        const abilityNames = {
            str: 'Strength',
            dex: 'Dexterity',
            con: 'Constitution',
            int: 'Intelligence',
            wis: 'Wisdom',
            cha: 'Charisma'
        };
        
        const modifierStr = this.app.utils.formatModifier(modifier);
        const rollDetails = roll.rolls.length > 1 ? 
            `[${roll.rolls.join(', ')}]${modifierStr}` : 
            `${roll.rolls[0]}${modifierStr}`;
        
        this.app.logEvent(`${creature.name} makes a ${abilityNames[ability]} saving throw (DC ${dc}): ${rollDetails} = ${total} (${success ? 'Success' : 'Failure'})`);
        
        return {
            creature,
            ability,
            dc,
            roll,
            modifier,
            total,
            success
        };
    }
    
    /**
     * Make an ability check for a creature
     * @param {string} creatureId - The ID of the creature
     * @param {string} ability - The ability to use ('str', 'dex', 'con', 'int', 'wis', 'cha')
     * @param {Object} [options] - Additional options
     * @param {boolean} [options.advantage] - Whether the creature has advantage
     * @param {boolean} [options.disadvantage] - Whether the creature has disadvantage
     * @returns {Promise<Object>} - The result of the ability check
     */
    async makeAbilityCheck(creatureId, ability, options = {}) {
        const creature = this.getCreatureById(creatureId);
        if (!creature) return null;
        
        // Validate ability
        if (!['str', 'dex', 'con', 'int', 'wis', 'cha'].includes(ability)) {
            console.error(`Invalid ability: ${ability}`);
            return null;
        }
        
        // Calculate modifier
        const modifier = this.app.utils.getAbilityModifier(creature[ability]);
        
        // Roll the check
        const roll = await this.app.dice.roll('1d20', {
            advantage: options.advantage,
            disadvantage: options.disadvantage
        });
        
        const total = roll.total + modifier;
        
        // Log the result
        const abilityNames = {
            str: 'Strength',
            dex: 'Dexterity',
            con: 'Constitution',
            int: 'Intelligence',
            wis: 'Wisdom',
            cha: 'Charisma'
        };
        
        const modifierStr = this.app.utils.formatModifier(modifier);
        const rollDetails = roll.rolls.length > 1 ? 
            `[${roll.rolls.join(', ')}]${modifierStr}` : 
            `${roll.rolls[0]}${modifierStr}`;
        
        this.app.logEvent(`${creature.name} makes a ${abilityNames[ability]} check: ${rollDetails} = ${total}`);
        
        return {
            creature,
            ability,
            roll,
            modifier,
            total
        };
    }
    
    /**
     * Make an attack roll for a creature
     * @param {string} attackerId - The ID of the attacker
     * @param {string} targetId - The ID of the target
     * @param {Object} attackData - The attack data
     * @param {number} [attackData.toHit] - The attack bonus
     * @param {string} [attackData.damage] - The damage dice
     * @param {string} [attackData.damageType] - The damage type
     * @param {Object} [options] - Additional options
     * @param {boolean} [options.advantage] - Whether the attacker has advantage
     * @param {boolean} [options.disadvantage] - Whether the attacker has disadvantage
     * @returns {Promise<Object>} - The result of the attack
     */
    async makeAttack(attackerId, targetId, attackData, options = {}) {
        const attacker = this.getCreatureById(attackerId);
        const target = this.getCreatureById(targetId);
        
        if (!attacker || !target) return null;
        
        // Roll the attack
        const attackRoll = await this.app.dice.roll('1d20', {
            advantage: options.advantage,
            disadvantage: options.disadvantage
        });
        
        const toHit = attackData.toHit || 0;
        const attackTotal = attackRoll.total + toHit;
        
        // Determine if the attack hits
        const isCriticalHit = attackRoll.rolls.includes(20);
        const isCriticalMiss = attackRoll.rolls.includes(1);
        const isHit = isCriticalHit || (!isCriticalMiss && attackTotal >= target.ac);
        
        // Roll damage if the attack hits
        let damageRoll = null;
        let damageTotal = 0;
        
        if (isHit && attackData.damage) {
            if (isCriticalHit) {
                // Handle critical hit damage based on settings
                const critRule = this.app.settings.getSetting('critRule', 'perkins');
                
                if (critRule === 'perkins') {
                    // Perkins rule: Maximum damage dice + roll damage dice again
                    const diceMatch = attackData.damage.match(/(\d+)d(\d+)([+-]\d+)?/);
                    if (diceMatch) {
                        const numDice = parseInt(diceMatch[1]) || 1;
                        const diceSize = parseInt(diceMatch[2]);
                        const modifier = parseInt(diceMatch[3] || '+0');
                        
                        // Maximum damage for the dice
                        const maxDice = numDice * diceSize;
                        
                        // Roll the dice again
                        const extraRoll = await this.app.dice.roll(attackData.damage);
                        
                        damageTotal = maxDice + extraRoll.total;
                        damageRoll = {
                            formula: `max(${numDice}d${diceSize}) + ${attackData.damage}`,
                            total: damageTotal,
                            breakdown: `${maxDice} + ${extraRoll.total}`
                        };
                    } else {
                        // Fallback to regular damage roll
                        damageRoll = await this.app.dice.roll(attackData.damage);
                        damageTotal = damageRoll.total;
                    }
                } else {
                    // RAW rule: Roll damage dice twice
                    const regularRoll = await this.app.dice.roll(attackData.damage);
                    const critRoll = await this.app.dice.roll(attackData.damage);
                    
                    damageTotal = regularRoll.total + critRoll.total;
                    damageRoll = {
                        formula: `${attackData.damage} + ${attackData.damage}`,
                        total: damageTotal,
                        breakdown: `${regularRoll.total} + ${critRoll.total}`
                    };
                }
            } else {
                // Regular hit damage
                damageRoll = await this.app.dice.roll(attackData.damage);
                damageTotal = damageRoll.total;
            }
        }
        
        // Log the result
        const attackModifierStr = this.app.utils.formatModifier(toHit);
        const rollDetails = attackRoll.rolls.length > 1 ? 
            `[${attackRoll.rolls.join(', ')}]${attackModifierStr}` : 
            `${attackRoll.rolls[0]}${attackModifierStr}`;
        
        if (isCriticalHit) {
            this.app.logEvent(`${attacker.name} attacks ${target.name} (AC ${target.ac}): ${rollDetails} = ${attackTotal} - CRITICAL HIT!`);
            if (damageRoll) {
                this.app.logEvent(`${attacker.name} deals ${damageTotal} damage to ${target.name}${attackData.damageType ? ` (${attackData.damageType})` : ''}.`);
            }
        } else if (isCriticalMiss) {
            this.app.logEvent(`${attacker.name} attacks ${target.name} (AC ${target.ac}): ${rollDetails} = ${attackTotal} - CRITICAL MISS!`);
        } else if (isHit) {
            this.app.logEvent(`${attacker.name} attacks ${target.name} (AC ${target.ac}): ${rollDetails} = ${attackTotal} - HIT!`);
            if (damageRoll) {
                this.app.logEvent(`${attacker.name} deals ${damageTotal} damage to ${target.name}${attackData.damageType ? ` (${attackData.damageType})` : ''}.`);
            }
        } else {
            this.app.logEvent(`${attacker.name} attacks ${target.name} (AC ${target.ac}): ${rollDetails} = ${attackTotal} - MISS!`);
        }
        
        // Apply damage if the attack hits
        if (isHit && damageTotal > 0) {
            this.app.damage.applyDamage(targetId, damageTotal, attackData.damageType);
        }
        
        // Use the attacker's action
        this.toggleAction(attackerId, 'action', true);
        
        return {
            attacker,
            target,
            attackRoll,
            toHit,
            attackTotal,
            isCriticalHit,
            isCriticalMiss,
            isHit,
            damageRoll,
            damageTotal,
            damageType: attackData.damageType
        };
    }
}
