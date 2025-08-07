/**
 * Combat Manager for Jesster's Combat Tracker
 * Handles combat mechanics and creature management
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
        // Ensure the creature has all required properties
        const defaultCreature = {
            id: this.app.utils.generateUUID(),
            name: 'Unknown',
            type: 'monster', // 'hero' or 'monster'
            maxHp: 10,
            currentHp: 10,
            ac: 10,
            initiativeBonus: 0,
            initiative: null,
            conditions: [],
            imageUrl: null,
            source: null
        };
        
        // Merge with defaults
        const newCreature = { ...defaultCreature, ...creature };
        
        // Add to creatures array
        this.creatures.push(newCreature);
        
        // Update UI
        this.app.ui.renderCreatures();
        
        // Log the event
        const sourceText = newCreature.source ? ` from ${newCreature.source}` : '';
        this.app.logEvent(`${newCreature.name} added to combat${sourceText}.`);
    }
    
    /**
     * Remove a creature from combat
     * @param {string} id - The ID of the creature to remove
     */
    removeCreature(id) {
        const creature = this.getCreatureById(id);
        if (!creature) return;
        
        // Remove from creatures array
        this.creatures = this.creatures.filter(c => c.id !== id);
        
        // If this was the current turn, advance to the next turn
        if (this.app.state.combatStarted && this.app.state.currentTurn === id) {
            this.nextTurn();
        }
        
        // Update UI
        this.app.ui.renderCreatures();
        this.app.ui.renderInitiativeOrder();
        this.app.updatePlayerView();
        
        // Log the event
        this.app.logEvent(`${creature.name} removed from combat.`);
    }
    
    /**
     * Get a creature by ID
     * @param {string} id - The ID of the creature
     * @returns {Object|null} - The creature or null if not found
     */
    getCreatureById(id) {
        return this.creatures.find(c => c.id === id) || null;
    }
    
    /**
     * Get all creatures
     * @returns {Array} - All creatures
     */
    getAllCreatures() {
        return [...this.creatures];
    }
    
    /**
     * Clear all combatants
     */
    clearCombatants() {
        this.creatures = [];
        this.app.ui.renderCreatures();
        this.app.ui.renderInitiativeOrder();
        this.app.updatePlayerView();
        this.app.logEvent('All combatants cleared.');
    }
    
    /**
     * Roll initiative for all creatures
     */
    rollInitiativeForAll() {
        if (this.creatures.length === 0) {
            this.app.showAlert('No creatures to roll initiative for.');
            return;
        }
        
        // Roll initiative for each creature
        this.creatures.forEach(creature => {
            // Make sure we're passing a string or number to the roll function
            const roll = this.app.dice.roll(20, 1, 0); // Roll 1d20
            creature.initiative = roll.total + creature.initiativeBonus;
            this.app.logEvent(`${creature.name} rolled ${roll.total} + ${creature.initiativeBonus} = ${creature.initiative} for initiative.`);
        });
        
        // Sort by initiative
        this.sortByInitiative();
        
        // Update UI
        this.app.ui.renderCreatures();
        this.app.ui.renderInitiativeOrder();
        this.app.updatePlayerView();
        
        // Play sound
        this.app.audio.play('diceRoll');
        
        // Log the event
        this.app.logEvent('Initiative rolled for all creatures.');
    }
    
    /**
     * Sort creatures by initiative
     */
    sortByInitiative() {
        this.creatures.sort((a, b) => {
            // Sort by initiative (highest first)
            if (b.initiative !== a.initiative) {
                return b.initiative - a.initiative;
            }
            
            // If initiative is tied, sort by dexterity (assuming dex is stored)
            if (b.dex !== a.dex && b.dex !== undefined && a.dex !== undefined) {
                return b.dex - a.dex;
            }
            
            // If dexterity is tied or not available, sort alphabetically
            return a.name.localeCompare(b.name);
        });
    }
    
    /**
     * Get the initiative order
     * @returns {Array} - Creatures sorted by initiative
     */
    getInitiativeOrder() {
        // Filter out creatures with no initiative
        const creaturesWithInitiative = this.creatures.filter(c => c.initiative !== null);
        
        // Sort by initiative
        return [...creaturesWithInitiative].sort((a, b) => {
            // Sort by initiative (highest first)
            if (b.initiative !== a.initiative) {
                return b.initiative - a.initiative;
            }
            
            // If initiative is tied, sort by dexterity (assuming dex is stored)
            if (b.dex !== a.dex && b.dex !== undefined && a.dex !== undefined) {
                return b.dex - a.dex;
            }
            
            // If dexterity is tied or not available, sort alphabetically
            return a.name.localeCompare(b.name);
        });
    }
    
    /**
     * Start combat
     */
    startCombat() {
        if (this.creatures.length === 0) {
            this.app.showAlert('No creatures to start combat with.');
            return;
        }
        
        // Check if all creatures have initiative
        const creaturesWithoutInitiative = this.creatures.filter(c => c.initiative === null);
        if (creaturesWithoutInitiative.length > 0) {
            this.app.showConfirm('Some creatures don\'t have initiative. Roll initiative for all creatures?', () => {
                this.rollInitiativeForAll();
                this.startCombat();
            });
            return;
        }
        
        // Set combat state
        this.app.state.combatStarted = true;
        this.app.state.combatStartTime = Date.now();
        this.app.state.roundNumber = 1;
        
        // Sort by initiative
        this.sortByInitiative();
        
        // Set current turn to the first creature
        if (this.creatures.length > 0) {
            this.app.state.currentTurn = this.creatures[0].id;
        }
        
        // Update UI
        this.app.ui.renderCreatures();
        this.app.ui.renderInitiativeOrder();
        this.app.updatePlayerView();
        
        // Play sound
        this.app.audio.play('combatStart');
        
        // Log the event
        this.app.logEvent('Combat started.');
    }
    
    /**
     * End combat
     */
    endCombat() {
        // Reset combat state
        this.app.state.combatStarted = false;
        this.app.state.combatStartTime = null;
        this.app.state.currentTurn = null;
        this.app.state.roundNumber = 1;
        
        // Update UI
        this.app.ui.renderCreatures();
        this.app.ui.renderInitiativeOrder();
        this.app.updatePlayerView();
        
        // Log the event
        this.app.logEvent('Combat ended.');
    }
    
    /**
     * Advance to the next turn
     */
    nextTurn() {
        if (!this.app.state.combatStarted) {
            this.app.showAlert('Combat has not started yet.');
            return;
        }
        
        if (this.creatures.length === 0) {
            this.app.showAlert('No creatures in combat.');
            return;
        }
        
        // Get the current turn index
        const currentIndex = this.creatures.findIndex(c => c.id === this.app.state.currentTurn);
        
        // Calculate the next turn index
        let nextIndex = currentIndex + 1;
        
        // If we've reached the end of the round, start a new round
        if (nextIndex >= this.creatures.length) {
            nextIndex = 0;
            this.app.state.roundNumber++;
            this.app.logEvent(`Round ${this.app.state.roundNumber} begins.`);
            this.app.audio.play('roundStart');
            
            // Process end-of-round effects
            this.processEndOfRound();
        }
        
        // Set the current turn
        this.app.state.currentTurn = this.creatures[nextIndex].id;
        
        // Update UI
        this.app.ui.renderCreatures();
        this.app.ui.renderInitiativeOrder();
        this.app.updatePlayerView();
        
        // Play sound
        this.app.audio.play('turnStart');
        
        // Log the event
        this.app.logEvent(`${this.creatures[nextIndex].name}'s turn.`);
    }
    
    /**
     * Process end-of-round effects
     */
    processEndOfRound() {
        // Process conditions with durations
        this.creatures.forEach(creature => {
            if (!creature.conditions) return;
            
            const expiredConditions = [];
            
            // Update condition durations
            creature.conditions = creature.conditions.map(condition => {
                // Skip conditions without duration
                if (typeof condition === 'string' || condition.roundsLeft === null) {
                    return condition;
                }
                
                // Decrease duration
                const updatedCondition = {
                    ...condition,
                    roundsLeft: condition.roundsLeft - 1
                };
                
                // Check if expired
                if (updatedCondition.roundsLeft <= 0) {
                    expiredConditions.push(updatedCondition.name);
                    return null;
                }
                
                return updatedCondition;
            }).filter(Boolean);
            
            // Log expired conditions
            if (expiredConditions.length > 0) {
                this.app.logEvent(`${creature.name} is no longer ${expiredConditions.join(', ')}.`);
            }
        });
    }
    
    /**
     * Apply damage to a creature
     * @param {string} id - The ID of the creature
     * @param {number} amount - The amount of damage
     * @param {boolean} [isCritical=false] - Whether the damage is critical
     */
    applyDamage(id, amount, isCritical = false) {
        const creature = this.getCreatureById(id);
        if (!creature) return;
        
        // Apply damage
        creature.currentHp = Math.max(0, creature.currentHp - amount);
        
        // Update UI
        this.app.ui.renderCreatures();
        this.app.updatePlayerView();
        
        // Play sound
        if (isCritical) {
            this.app.audio.play('criticalHit');
        } else {
            this.app.audio.play('hit');
        }
        
        // Log the event
        const criticalText = isCritical ? ' critical' : '';
        this.app.logEvent(`${creature.name} takes ${amount}${criticalText} damage. (${creature.currentHp}/${creature.maxHp} HP)`);
        
        // Check if the creature is unconscious
        if (creature.currentHp === 0) {
            this.app.logEvent(`${creature.name} is unconscious!`);
            
            // Add unconscious condition if not already present
            if (!creature.conditions.some(c => (typeof c === 'string' ? c : c.name) === 'Unconscious')) {
                this.addCondition(id, { name: 'Unconscious', roundsLeft: null });
            }
        }
    }
    
    /**
     * Apply healing to a creature
     * @param {string} id - The ID of the creature
     * @param {number} amount - The amount of healing
     */
    applyHealing(id, amount) {
        const creature = this.getCreatureById(id);
        if (!creature) return;
        
        // Apply healing
        creature.currentHp = Math.min(creature.maxHp, creature.currentHp + amount);
        
        // Update UI
        this.app.ui.renderCreatures();
        this.app.updatePlayerView();
        
        // Play sound
        this.app.audio.play('heal');
        
        // Log the event
        this.app.logEvent(`${creature.name} heals ${amount} HP. (${creature.currentHp}/${creature.maxHp} HP)`);
        
        // Remove unconscious condition if HP > 0
        if (creature.currentHp > 0) {
            this.removeCondition(id, 'Unconscious');
        }
    }
    
    /**
     * Add a condition to a creature
     * @param {string} id - The ID of the creature
     * @param {Object|string} condition - The condition to add
     */
    addCondition(id, condition) {
        const creature = this.getCreatureById(id);
        if (!creature) return;
        
        // Ensure conditions array exists
        if (!creature.conditions) {
            creature.conditions = [];
        }
        
        // Add the condition
        creature.conditions.push(condition);
        
        // Update UI
        this.app.ui.renderCreatures();
        this.app.updatePlayerView();
        
        // Log the event
        const conditionName = typeof condition === 'string' ? condition : condition.name;
        const durationText = typeof condition === 'object' && condition.roundsLeft !== null ? 
            ` for ${condition.roundsLeft} rounds` : '';
        this.app.logEvent(`${creature.name} is now ${conditionName}${durationText}.`);
    }
    
    /**
     * Remove a condition from a creature
     * @param {string} id - The ID of the creature
     * @param {string} conditionName - The name of the condition to remove
     */
    removeCondition(id, conditionName) {
        const creature = this.getCreatureById(id);
        if (!creature || !creature.conditions) return;
        
        // Remove the condition
        creature.conditions = creature.conditions.filter(c => {
            const name = typeof c === 'string' ? c : c.name;
            return name !== conditionName;
        });
        
        // Update UI
        this.app.ui.renderCreatures();
        this.app.updatePlayerView();
        
        // Log the event
        this.app.logEvent(`${creature.name} is no longer ${conditionName}.`);
    }
    
    /**
     * Update a creature
     * @param {string} id - The ID of the creature to update
     * @param {Object} updates - The updates to apply
     * @returns {boolean} - Whether the update was successful
     */
    updateCreature(id, updates) {
        const index = this.creatures.findIndex(c => c.id === id);
        if (index === -1) return false;
        
        // Apply updates
        this.creatures[index] = {
            ...this.creatures[index],
            ...updates
        };
        
        // Update UI
        this.app.ui.renderCreatures();
        this.app.ui.renderInitiativeOrder();
        this.app.updatePlayerView();
        
        return true;
    }
}
