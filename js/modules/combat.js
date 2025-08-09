/**
 * Combat module for Jesster's Combat Tracker
 * Handles combat management, initiative tracking, and turn order
 */
class Combat {
    constructor(storage, dice, audio, conditions, damage, settings) {
        // Store references to other modules
        this.storage = storage;
        this.dice = dice;
        this.audio = audio;
        this.conditions = conditions;
        this.damage = damage;
        this.settings = settings;
        
        // Combat state
        this.active = false;
        this.round = 0;
        this.turnIndex = -1;
        this.combatants = [];
        this.initiativeOrder = [];
        this.history = [];
        this.startTime = null;
        this.elapsedTime = 0;
        this.timer = null;
        this.timerInterval = null;
        this.turnTimer = null;
        this.turnTimerInterval = null;
        this.turnTimerDuration = this.settings.getTurnTimerDuration();
        this.turnTimerRemaining = 0;
        this.turnTimerWarning = this.settings.getTurnTimerWarning();
        this.turnTimerAutoEnd = this.settings.shouldTurnTimerAutoEnd();
        this.initiativeSystem = this.settings.getInitiativeSystem();
        
        // Event callbacks
        this.callbacks = {
            onCombatStart: [],
            onCombatEnd: [],
            onRoundStart: [],
            onRoundEnd: [],
            onTurnStart: [],
            onTurnEnd: [],
            onInitiativeChange: [],
            onCombatantAdded: [],
            onCombatantRemoved: [],
            onCombatantUpdated: [],
            onTimerTick: [],
            onTurnTimerTick: [],
            onTurnTimerExpired: []
        };
        
        console.log("Combat module initialized");
    }

    /**
     * Start combat
     * @param {Array} combatants - Optional array of combatants to add
     * @returns {boolean} Success status
     */
    startCombat(combatants = []) {
        // Check if combat is already active
        if (this.active) {
            console.warn('Combat is already active');
            return false;
        }
        
        // Reset combat state
        this.active = true;
        this.round = 1;
        this.turnIndex = -1;
        this.combatants = [];
        this.initiativeOrder = [];
        this.history = [];
        this.startTime = new Date();
        this.elapsedTime = 0;
        
        // Add combatants if provided
        if (combatants && combatants.length > 0) {
            combatants.forEach(combatant => this.addCombatant(combatant));
        }
        
        // Roll initiative for all combatants
        this._rollInitiative();
        
        // Start combat timer
        this._startTimer();
        
        // Log combat start
        this._addToHistory('combat-start', {
            round: this.round,
            startTime: this.startTime
        });
        
        // Trigger callbacks
        this._triggerCallbacks('onCombatStart', {
            round: this.round,
            combatants: this.combatants
        });
        
        // Start first round
        this._startRound();
        
        return true;
    }

    /**
     * End combat
     * @returns {boolean} Success status
     */
    endCombat() {
        // Check if combat is active
        if (!this.active) {
            console.warn('Combat is not active');
            return false;
        }
        
        // Stop timers
        this._stopTimer();
        this._stopTurnTimer();
        
        // Log combat end
        this._addToHistory('combat-end', {
            round: this.round,
            elapsedTime: this.elapsedTime
        });
        
        // Reset combat state
        const combatData = {
            active: this.active,
            round: this.round,
            turnIndex: this.turnIndex,
            combatants: [...this.combatants],
            initiativeOrder: [...this.initiativeOrder],
            history: [...this.history],
            startTime: this.startTime,
            elapsedTime: this.elapsedTime
        };
        
        this.active = false;
        this.round = 0;
        this.turnIndex = -1;
        this.startTime = null;
        
        // Trigger callbacks
        this._triggerCallbacks('onCombatEnd', {
            round: this.round,
            combatants: this.combatants,
            elapsedTime: this.elapsedTime
        });
        
        return true;
    }

    /**
     * Add a combatant to the combat
     * @param {Object} combatant - Combatant object
     * @param {boolean} rollInitiative - Whether to roll initiative for the combatant
     * @returns {Object} Added combatant
     */
    addCombatant(combatant, rollInitiative = false) {
        // Generate ID if not provided
        if (!combatant.id) {
            combatant.id = `combatant-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        }
        
        // Set default values
        combatant.initiative = combatant.initiative || 0;
        combatant.initiativeRoll = combatant.initiativeRoll || null;
        combatant.hp = combatant.hp !== undefined ? combatant.hp : (combatant.maxHp || 0);
        combatant.tempHp = combatant.tempHp || 0;
        combatant.conditions = combatant.conditions || [];
        combatant.hidden = combatant.hidden || false;
        combatant.defeated = combatant.defeated || false;
        
        // Add to combatants array
        this.combatants.push(combatant);
        
        // Roll initiative if requested
        if (rollInitiative && this.active) {
            this._rollInitiativeForCombatant(combatant);
        }
        
        // Update initiative order
        this._updateInitiativeOrder();
        
        // Log combatant added
        this._addToHistory('combatant-added', {
            combatantId: combatant.id,
            combatantName: combatant.name
        });
        
        // Trigger callbacks
        this._triggerCallbacks('onCombatantAdded', {
            combatant
        });
        
        return combatant;
    }

    /**
     * Remove a combatant from the combat
     * @param {string} combatantId - Combatant ID
     * @returns {boolean} Success status
     */
    removeCombatant(combatantId) {
        // Find combatant
        const index = this.combatants.findIndex(c => c.id === combatantId);
        if (index === -1) {
            console.warn(`Combatant not found: ${combatantId}`);
            return false;
        }
        
        // Get combatant
        const combatant = this.combatants[index];
        
        // Remove from combatants array
        this.combatants.splice(index, 1);
        
        // Update initiative order
        this._updateInitiativeOrder();
        
        // Adjust turn index if necessary
        if (this.active && this.turnIndex >= this.initiativeOrder.length) {
            this.turnIndex = 0;
        }
        
        // Log combatant removed
        this._addToHistory('combatant-removed', {
            combatantId: combatant.id,
            combatantName: combatant.name
        });
        
        // Trigger callbacks
        this._triggerCallbacks('onCombatantRemoved', {
            combatant
        });
        
        return true;
    }

    /**
     * Update a combatant
     * @param {string} combatantId - Combatant ID
     * @param {Object} updates - Updates to apply
     * @returns {Object|null} Updated combatant or null if not found
     */
    updateCombatant(combatantId, updates) {
        // Find combatant
        const index = this.combatants.findIndex(c => c.id === combatantId);
        if (index === -1) {
            console.warn(`Combatant not found: ${combatantId}`);
            return null;
        }
        
        // Update combatant
        const combatant = this.combatants[index];
        const updatedCombatant = { ...combatant, ...updates };
        this.combatants[index] = updatedCombatant;
        
        // Update initiative order if initiative changed
        if (updates.initiative !== undefined && updates.initiative !== combatant.initiative) {
            this._updateInitiativeOrder();
            
            // Trigger initiative change callbacks
            this._triggerCallbacks('onInitiativeChange', {
                combatant: updatedCombatant,
                oldInitiative: combatant.initiative,
                newInitiative: updatedCombatant.initiative
            });
        }
        
        // Log combatant updated
        this._addToHistory('combatant-updated', {
            combatantId: updatedCombatant.id,
            combatantName: updatedCombatant.name,
            updates
        });
        
        // Trigger callbacks
        this._triggerCallbacks('onCombatantUpdated', {
            combatant: updatedCombatant,
            updates
        });
        
        return updatedCombatant;
    }

    /**
     * Get a combatant by ID
     * @param {string} combatantId - Combatant ID
     * @returns {Object|null} Combatant or null if not found
     */
    getCombatant(combatantId) {
        return this.combatants.find(c => c.id === combatantId) || null;
    }

    /**
     * Get all combatants
     * @returns {Array} All combatants
     */
    getAllCombatants() {
        return [...this.combatants];
    }

    /**
     * Get active combatants (not defeated)
     * @returns {Array} Active combatants
     */
    getActiveCombatants() {
        return this.combatants.filter(c => !c.defeated);
    }

    /**
     * Get defeated combatants
     * @returns {Array} Defeated combatants
     */
    getDefeatedCombatants() {
        return this.combatants.filter(c => c.defeated);
    }

    /**
     * Get visible combatants (not hidden)
     * @returns {Array} Visible combatants
     */
    getVisibleCombatants() {
        return this.combatants.filter(c => !c.hidden);
    }

    /**
     * Get hidden combatants
     * @returns {Array} Hidden combatants
     */
    getHiddenCombatants() {
        return this.combatants.filter(c => c.hidden);
    }

    /**
     * Get the current initiative order
     * @returns {Array} Initiative order
     */
    getInitiativeOrder() {
        return [...this.initiativeOrder];
    }

    /**
     * Get the current round
     * @returns {number} Current round
     */
    getCurrentRound() {
        return this.round;
    }

    /**
     * Get the current turn index
     * @returns {number} Current turn index
     */
    getCurrentTurnIndex() {
        return this.turnIndex;
    }

    /**
     * Get the current combatant
     * @returns {Object|null} Current combatant or null if no active combat
     */
    getCurrentCombatant() {
        if (!this.active || this.turnIndex < 0 || this.turnIndex >= this.initiativeOrder.length) {
            return null;
        }
        
        return this.initiativeOrder[this.turnIndex];
    }

    /**
     * Get the next combatant
     * @returns {Object|null} Next combatant or null if no active combat
     */
    getNextCombatant() {
        if (!this.active || this.initiativeOrder.length === 0) {
            return null;
        }
        
        const nextIndex = (this.turnIndex + 1) % this.initiativeOrder.length;
        return this.initiativeOrder[nextIndex];
    }

    /**
     * Get the previous combatant
     * @returns {Object|null} Previous combatant or null if no active combat
     */
    getPreviousCombatant() {
        if (!this.active || this.initiativeOrder.length === 0) {
            return null;
        }
        
        const prevIndex = (this.turnIndex - 1 + this.initiativeOrder.length) % this.initiativeOrder.length;
        return this.initiativeOrder[prevIndex];
    }

    /**
     * Start the next turn
     * @returns {Object|null} New current combatant or null if no active combat
     */
    nextTurn() {
        // Check if combat is active
        if (!this.active) {
            console.warn('Combat is not active');
            return null;
        }
        
        // Check if there are any combatants
        if (this.initiativeOrder.length === 0) {
            console.warn('No combatants in initiative order');
            return null;
        }
        
        // End current turn
        if (this.turnIndex >= 0 && this.turnIndex < this.initiativeOrder.length) {
            this._endTurn();
        }
        
        // Increment turn index
        this.turnIndex = (this.turnIndex + 1) % this.initiativeOrder.length;
        
        // Check if we've completed a round
        if (this.turnIndex === 0) {
            this._endRound();
            this._startRound();
        }
        
        // Start new turn
        return this._startTurn();
    }

    /**
     * Start the previous turn
     * @returns {Object|null} New current combatant or null if no active combat
     */
    previousTurn() {
        // Check if combat is active
        if (!this.active) {
            console.warn('Combat is not active');
            return null;
        }
        
        // Check if there are any combatants
        if (this.initiativeOrder.length === 0) {
            console.warn('No combatants in initiative order');
            return null;
        }
        
        // End current turn
        if (this.turnIndex >= 0 && this.turnIndex < this.initiativeOrder.length) {
            this._endTurn();
        }
        
        // Decrement turn index
        this.turnIndex = (this.turnIndex - 1 + this.initiativeOrder.length) % this.initiativeOrder.length;
        
        // Check if we've gone back a round
        if (this.turnIndex === this.initiativeOrder.length - 1) {
            this.round = Math.max(1, this.round - 1);
            
            // Log round start
            this._addToHistory('round-start', {
                round: this.round
            });
            
            // Trigger callbacks
            this._triggerCallbacks('onRoundStart', {
                round: this.round,
                combatants: this.combatants
            });
        }
        
        // Start new turn
        return this._startTurn();
    }

    /**
     * Jump to a specific combatant's turn
     * @param {string} combatantId - Combatant ID
     * @returns {Object|null} New current combatant or null if not found
     */
    jumpToTurn(combatantId) {
        // Check if combat is active
        if (!this.active) {
            console.warn('Combat is not active');
            return null;
        }
        
        // Find combatant in initiative order
        const index = this.initiativeOrder.findIndex(c => c.id === combatantId);
        if (index === -1) {
            console.warn(`Combatant not found in initiative order: ${combatantId}`);
            return null;
        }
        
        // End current turn
        if (this.turnIndex >= 0 && this.turnIndex < this.initiativeOrder.length) {
            this._endTurn();
        }
        
        // Set turn index
        this.turnIndex = index;
        
        // Start new turn
        return this._startTurn();
    }

    /**
     * Roll initiative for all combatants
     * @param {boolean} reroll - Whether to reroll for combatants that already have initiative
     * @returns {Array} Initiative results
     */
    rollInitiative(reroll = false) {
        return this._rollInitiative(reroll);
    }

    /**
     * Roll initiative for a specific combatant
     * @param {string} combatantId - Combatant ID
     * @returns {Object|null} Initiative result or null if combatant not found
     */
    rollInitiativeForCombatant(combatantId) {
        // Find combatant
        const combatant = this.getCombatant(combatantId);
        if (!combatant) {
            console.warn(`Combatant not found: ${combatantId}`);
            return null;
        }
        
        // Roll initiative
        return this._rollInitiativeForCombatant(combatant);
    }

    /**
     * Set initiative for a combatant
     * @param {string} combatantId - Combatant ID
     * @param {number} initiative - Initiative value
     * @returns {Object|null} Updated combatant or null if not found
     */
    setInitiative(combatantId, initiative) {
        // Find combatant
        const combatant = this.getCombatant(combatantId);
        if (!combatant) {
            console.warn(`Combatant not found: ${combatantId}`);
            return null;
        }
        
        // Update initiative
        return this.updateCombatant(combatantId, {
            initiative: Number(initiative),
            initiativeRoll: null // Clear initiative roll since it was manually set
        });
    }

    /**
     * Mark a combatant as defeated
     * @param {string} combatantId - Combatant ID
     * @returns {Object|null} Updated combatant or null if not found
     */
    defeatCombatant(combatantId) {
        // Find combatant
        const combatant = this.getCombatant(combatantId);
        if (!combatant) {
            console.warn(`Combatant not found: ${combatantId}`);
            return null;
        }
        
        // Update combatant
        const updatedCombatant = this.updateCombatant(combatantId, {
            defeated: true,
            hp: 0
        });
        
        // Log combatant defeated
        this._addToHistory('combatant-defeated', {
            combatantId: combatant.id,
            combatantName: combatant.name
        });
        
        return updatedCombatant;
    }

    /**
     * Revive a defeated combatant
     * @param {string} combatantId - Combatant ID
     * @param {number} hp - HP to revive with (default: 1)
     * @returns {Object|null} Updated combatant or null if not found
     */
    reviveCombatant(combatantId, hp = 1) {
        // Find combatant
        const combatant = this.getCombatant(combatantId);
        if (!combatant) {
            console.warn(`Combatant not found: ${combatantId}`);
            return null;
        }
        
        // Update combatant
        const updatedCombatant = this.updateCombatant(combatantId, {
            defeated: false,
            hp: Math.max(1, hp)
        });
        
        // Log combatant revived
        this._addToHistory('combatant-revived', {
            combatantId: combatant.id,
            combatantName: combatant.name,
            hp
        });
        
        return updatedCombatant;
    }

    /**
     * Toggle a combatant's hidden status
     * @param {string} combatantId - Combatant ID
     * @returns {Object|null} Updated combatant or null if not found
     */
    toggleHidden(combatantId) {
        // Find combatant
        const combatant = this.getCombatant(combatantId);
        if (!combatant) {
            console.warn(`Combatant not found: ${combatantId}`);
            return null;
        }
        
        // Update combatant
        return this.updateCombatant(combatantId, {
            hidden: !combatant.hidden
        });
    }

    /**
     * Apply a condition to a combatant
     * @param {string} combatantId - Combatant ID
     * @param {string} conditionId - Condition ID
     * @param {Object} options - Condition options
     * @returns {Object|null} Updated combatant or null if not found
     */
    applyCondition(combatantId, conditionId, options = {}) {
        // Find combatant
        const combatant = this.getCombatant(combatantId);
        if (!combatant) {
            console.warn(`Combatant not found: ${combatantId}`);
            return null;
        }
        
        // Apply condition
        const updatedCombatant = this.conditions.applyCondition(combatant, conditionId, options);
        
        // Update combatant
        return this.updateCombatant(combatantId, {
            conditions: updatedCombatant.conditions
        });
    }

    /**
     * Remove a condition from a combatant
     * @param {string} combatantId - Combatant ID
     * @param {string} conditionId - Condition ID
     * @returns {Object|null} Updated combatant or null if not found
     */
    removeCondition(combatantId, conditionId) {
        // Find combatant
        const combatant = this.getCombatant(combatantId);
        if (!combatant) {
            console.warn(`Combatant not found: ${combatantId}`);
            return null;
        }
        
        // Remove condition
        const updatedCombatant = this.conditions.removeCondition(combatant, conditionId);
        
        // Update combatant
        return this.updateCombatant(combatantId, {
            conditions: updatedCombatant.conditions
        });
    }

    /**
     * Apply damage to a combatant
     * @param {string} combatantId - Combatant ID
     * @param {number|string} amount - Damage amount or formula
     * @param {Object} options - Damage options
     * @returns {Promise<Object|null>} Damage result or null if combatant not found
     */
    async applyDamage(combatantId, amount, options = {}) {
        // Find combatant
        const combatant = this.getCombatant(combatantId);
        if (!combatant) {
            console.warn(`Combatant not found: ${combatantId}`);
            return null;
        }
        
        // Apply damage
        const damageResult = await this.damage.applyDamage(combatant, amount, options);
        
        // Update combatant
        this.updateCombatant(combatantId, {
            hp: damageResult.newHP,
            // If the combatant is dead, mark as defeated
            defeated: damageResult.isDead
        });
        
        // Check for concentration
        if (this.conditions.hasCondition(combatant, 'concentrating') && damageResult.finalDamage > 0) {
            const concentrationCheck = this.damage.applyConcentrationCheck(combatant, damageResult.finalDamage);
            
            // Log concentration check
            this._addToHistory('concentration-check', {
                combatantId: combatant.id,
                combatantName: combatant.name,
                damage: damageResult.finalDamage,
                dc: concentrationCheck.checkDC
            });
        }
        
        return damageResult;
    }

    /**
     * Apply healing to a combatant
     * @param {string} combatantId - Combatant ID
     * @param {number|string} amount - Healing amount or formula
     * @param {Object} options - Healing options
     * @returns {Promise<Object|null>} Healing result or null if combatant not found
     */
    async applyHealing(combatantId, amount, options = {}) {
        // Find combatant
        const combatant = this.getCombatant(combatantId);
        if (!combatant) {
            console.warn(`Combatant not found: ${combatantId}`);
            return null;
        }
        
        // Apply healing
        const healingResult = await this.damage.applyHealing(combatant, amount, options);
        
        // Update combatant
        if (options.temporary) {
            this.updateCombatant(combatantId, {
                tempHp: healingResult.newTempHP
            });
        } else {
            this.updateCombatant(combatantId, {
                hp: healingResult.newHP,
                // If the combatant was defeated but now has HP, unmark as defeated
                defeated: healingResult.newHP > 0 ? false : combatant.defeated
            });
        }
        
        return healingResult;
    }

    /**
     * Apply a death save to a combatant
     * @param {string} combatantId - Combatant ID
     * @param {number|null} roll - Death save roll (if null, will roll automatically)
     * @returns {Promise<Object|null>} Death save result or null if combatant not found
     */
    async applyDeathSave(combatantId, roll = null) {
        // Find combatant
        const combatant = this.getCombatant(combatantId);
        if (!combatant) {
            console.warn(`Combatant not found: ${combatantId}`);
            return null;
        }
        
        // Check if combatant is at 0 HP
        if (combatant.hp > 0) {
            console.warn(`Combatant is not at 0 HP: ${combatantId}`);
            return null;
        }
        
        // Roll death save if not provided
        if (roll === null) {
            const rollResult = await this.dice.roll('1d20', {
                name: 'Death Save',
                type: 'death-save'
            });
            roll = rollResult.total;
        }
        
        // Apply death save
        const deathSaveResult = this.damage.applyDeathSave(combatant, roll);
        
        // Update combatant
        this.updateCombatant(combatantId, {
            hp: deathSaveResult.combatant.hp,
            deathSaves: deathSaveResult.combatant.deathSaves,
            // If the combatant is dead, mark as defeated
            defeated: deathSaveResult.isDead
        });
        
        // Log death save
        this._addToHistory('death-save', {
            combatantId: combatant.id,
            combatantName: combatant.name,
            roll,
            result: deathSaveResult.result,
            successes: deathSaveResult.successes,
            failures: deathSaveResult.failures,
            isStabilized: deathSaveResult.isStabilized,
            isDead: deathSaveResult.isDead
        });
        
        return deathSaveResult;
    }

    /**
     * Stabilize a dying combatant
     * @param {string} combatantId - Combatant ID
     * @returns {Object|null} Updated combatant or null if not found
     */
    stabilizeCombatant(combatantId) {
        // Find combatant
        const combatant = this.getCombatant(combatantId);
        if (!combatant) {
            console.warn(`Combatant not found: ${combatantId}`);
            return null;
        }
        
        // Stabilize combatant
        const stabilizedCombatant = this.damage.stabilizeCombatant(combatant);
        
        // Update combatant
        const updatedCombatant = this.updateCombatant(combatantId, {
            deathSaves: stabilizedCombatant.deathSaves
        });
        
        // Log stabilization
        this._addToHistory('stabilize', {
            combatantId: combatant.id,
            combatantName: combatant.name
        });
        
        return updatedCombatant;
    }

    /**
     * Get combat history
     * @returns {Array} Combat history
     */
    getHistory() {
        return [...this.history];
    }

    /**
     * Get combat statistics
     * @returns {Object} Combat statistics
     */
    getStatistics() {
        // Calculate statistics
        const stats = {
            round: this.round,
            elapsedTime: this.elapsedTime,
            combatantCount: this.combatants.length,
            activeCount: this.getActiveCombatants().length,
            defeatedCount: this.getDefeatedCombatants().length,
            turnCount: 0,
            averageTurnTime: 0,
            damageDealt: 0,
            healingDone: 0,
            criticalHits: 0,
            criticalMisses: 0
        };
        
        // Process history for turn count and damage
        let totalTurnTime = 0;
        let turnCount = 0;
        
        this.history.forEach(entry => {
            if (entry.type === 'turn-end' && entry.data.duration) {
                totalTurnTime += entry.data.duration;
                turnCount++;
            }
            
            if (entry.type === 'damage') {
                stats.damageDealt += entry.data.damage || 0;
            }
            
            if (entry.type === 'healing') {
                stats.healingDone += entry.data.healing || 0;
            }
            
            if (entry.type === 'attack' && entry.data.critical) {
                stats.criticalHits++;
            }
            
            if (entry.type === 'attack' && entry.data.fumble) {
                stats.criticalMisses++;
            }
        });
        
        // Calculate average turn time
        stats.turnCount = turnCount;
        stats.averageTurnTime = turnCount > 0 ? Math.round(totalTurnTime / turnCount) : 0;
        
        return stats;
    }

    /**
     * Save combat state
     * @param {string} name - Combat name
     * @returns {Promise<boolean>} Success status
     */
    async save(name = '') {
        // Create combat data
        const combatData = {
            id: `combat-${Date.now()}`,
            name: name || `Combat ${new Date().toLocaleString()}`,
            timestamp: Date.now(),
            active: this.active,
            round: this.round,
            turnIndex: this.turnIndex,
            combatants: this.combatants,
            initiativeOrder: this.initiativeOrder,
                        history: this.history,
            startTime: this.startTime ? this.startTime.getTime() : null,
            elapsedTime: this.elapsedTime
        };
        
        // Save to storage
        try {
            await this.storage.save('combats', combatData);
            return true;
        } catch (error) {
            console.error('Error saving combat:', error);
            return false;
        }
    }

    /**
     * Load combat state
     * @param {string} id - Combat ID
     * @returns {Promise<boolean>} Success status
     */
    async load(id) {
        // Load from storage
        try {
            const combatData = await this.storage.load('combats', id);
            if (!combatData) {
                console.warn(`Combat not found: ${id}`);
                return false;
            }
            
            // Stop current combat if active
            if (this.active) {
                this.endCombat();
            }
            
            // Restore combat state
            this.active = combatData.active;
            this.round = combatData.round;
            this.turnIndex = combatData.turnIndex;
            this.combatants = combatData.combatants;
            this.initiativeOrder = combatData.initiativeOrder;
            this.history = combatData.history;
            this.startTime = combatData.startTime ? new Date(combatData.startTime) : null;
            this.elapsedTime = combatData.elapsedTime;
            
            // Restart timer if combat is active
            if (this.active) {
                this._startTimer();
                
                // Restart turn timer if needed
                if (this.settings.isTurnTimerEnabled()) {
                    this._startTurnTimer();
                }
            }
            
            return true;
        } catch (error) {
            console.error('Error loading combat:', error);
            return false;
        }
    }

    /**
     * Register a callback
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     * @returns {Function} Function to unregister the callback
     */
    on(event, callback) {
        if (!this.callbacks[event]) {
            console.warn(`Unknown event: ${event}`);
            return () => {};
        }
        
        this.callbacks[event].push(callback);
        
        // Return function to unregister the callback
        return () => {
            this.off(event, callback);
        };
    }

    /**
     * Unregister a callback
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    off(event, callback) {
        if (!this.callbacks[event]) {
            console.warn(`Unknown event: ${event}`);
            return;
        }
        
        this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
    }

    /**
     * Roll initiative for all combatants
     * @private
     * @param {boolean} reroll - Whether to reroll for combatants that already have initiative
     * @returns {Array} Initiative results
     */
    async _rollInitiative(reroll = false) {
        const results = [];
        
        // Group combatants by type for group initiative
        const groupedCombatants = {};
        
        // Process each combatant
        for (const combatant of this.combatants) {
            // Skip if already has initiative and not rerolling
            if (!reroll && combatant.initiative !== undefined && combatant.initiative !== null) {
                continue;
            }
            
            // Handle group initiative
            if (this.initiativeSystem === 'group' && combatant.type === 'monster') {
                // Group by monster name
                const groupKey = combatant.name.replace(/\s+\d+$/, ''); // Remove trailing numbers
                
                if (!groupedCombatants[groupKey]) {
                    // Roll initiative for this group
                    const result = await this._rollInitiativeForCombatant(combatant);
                    groupedCombatants[groupKey] = result.initiative;
                    results.push(result);
                } else {
                    // Use the group's initiative
                    const initiative = groupedCombatants[groupKey];
                    this.updateCombatant(combatant.id, { initiative, initiativeRoll: null });
                    results.push({
                        combatant,
                        initiative,
                        roll: null,
                        modifier: combatant.initiativeModifier || 0,
                        group: groupKey
                    });
                }
            } else {
                // Roll individual initiative
                const result = await this._rollInitiativeForCombatant(combatant);
                results.push(result);
            }
        }
        
        // Update initiative order
        this._updateInitiativeOrder();
        
        return results;
    }

    /**
     * Roll initiative for a specific combatant
     * @private
     * @param {Object} combatant - Combatant object
     * @returns {Object} Initiative result
     */
    async _rollInitiativeForCombatant(combatant) {
        // Get initiative modifier
        const modifier = combatant.initiativeModifier || 0;
        
        // Roll initiative
        const rollResult = await this.dice.rollInitiative(
            combatant.name,
            modifier,
            { advantage: combatant.initiativeAdvantage, disadvantage: combatant.initiativeDisadvantage }
        );
        
        // Set initiative
        const initiative = rollResult.total;
        this.updateCombatant(combatant.id, { initiative, initiativeRoll: rollResult });
        
        // Log initiative roll
        this._addToHistory('initiative-roll', {
            combatantId: combatant.id,
            combatantName: combatant.name,
            roll: rollResult.total,
            modifier
        });
        
        return {
            combatant,
            initiative,
            roll: rollResult,
            modifier
        };
    }

    /**
     * Update initiative order
     * @private
     */
    _updateInitiativeOrder() {
        // Get active combatants
        const activeCombatants = this.combatants.filter(c => !c.defeated);
        
        // Sort by initiative (descending)
        activeCombatants.sort((a, b) => {
            // Sort by initiative
            if (b.initiative !== a.initiative) {
                return b.initiative - a.initiative;
            }
            
            // If initiative is tied, sort by dexterity if available
            if (a.abilities && b.abilities && a.abilities.dex !== b.abilities.dex) {
                return b.abilities.dex - a.abilities.dex;
            }
            
            // If still tied, sort by name
            return a.name.localeCompare(b.name);
        });
        
        // Update initiative order
        this.initiativeOrder = activeCombatants;
        
        // Adjust turn index if necessary
        if (this.active && this.turnIndex >= this.initiativeOrder.length) {
            this.turnIndex = 0;
        }
        
        // Trigger callbacks
        this._triggerCallbacks('onInitiativeChange', {
            initiativeOrder: this.initiativeOrder
        });
    }

    /**
     * Start a round
     * @private
     */
    _startRound() {
        // Log round start
        this._addToHistory('round-start', {
            round: this.round
        });
        
        // Trigger callbacks
        this._triggerCallbacks('onRoundStart', {
            round: this.round,
            combatants: this.combatants
        });
        
        // Play round start sound
        if (this.audio) {
            this.audio.play('round-start');
        }
        
        // Start first turn
        if (this.initiativeOrder.length > 0) {
            this.turnIndex = 0;
            this._startTurn();
        }
    }

    /**
     * End a round
     * @private
     */
    _endRound() {
        // Log round end
        this._addToHistory('round-end', {
            round: this.round
        });
        
        // Trigger callbacks
        this._triggerCallbacks('onRoundEnd', {
            round: this.round,
            combatants: this.combatants
        });
        
        // Increment round
        this.round++;
    }

    /**
     * Start a turn
     * @private
     * @returns {Object|null} Current combatant or null if no active combat
     */
    _startTurn() {
        // Check if combat is active
        if (!this.active) {
            return null;
        }
        
        // Check if there are any combatants
        if (this.initiativeOrder.length === 0) {
            return null;
        }
        
        // Get current combatant
        const combatant = this.initiativeOrder[this.turnIndex];
        if (!combatant) {
            return null;
        }
        
        // Record turn start time
        combatant.turnStartTime = Date.now();
        
        // Start turn timer if enabled
        if (this.settings.isTurnTimerEnabled()) {
            this._startTurnTimer();
        }
        
        // Process conditions at start of turn
        this._processConditionsAtTurnStart(combatant);
        
        // Log turn start
        this._addToHistory('turn-start', {
            round: this.round,
            turnIndex: this.turnIndex,
            combatantId: combatant.id,
            combatantName: combatant.name
        });
        
        // Trigger callbacks
        this._triggerCallbacks('onTurnStart', {
            round: this.round,
            turnIndex: this.turnIndex,
            combatant
        });
        
        // Play turn start sound
        if (this.audio) {
            this.audio.play('turn-start');
        }
        
        return combatant;
    }

    /**
     * End a turn
     * @private
     * @returns {Object|null} Current combatant or null if no active combat
     */
    _endTurn() {
        // Check if combat is active
        if (!this.active) {
            return null;
        }
        
        // Check if there are any combatants
        if (this.initiativeOrder.length === 0) {
            return null;
        }
        
        // Get current combatant
        const combatant = this.initiativeOrder[this.turnIndex];
        if (!combatant) {
            return null;
        }
        
        // Calculate turn duration
        const turnDuration = combatant.turnStartTime ? 
            Math.floor((Date.now() - combatant.turnStartTime) / 1000) : 0;
        
        // Stop turn timer
        this._stopTurnTimer();
        
        // Process conditions at end of turn
        this._processConditionsAtTurnEnd(combatant);
        
        // Log turn end
        this._addToHistory('turn-end', {
            round: this.round,
            turnIndex: this.turnIndex,
            combatantId: combatant.id,
            combatantName: combatant.name,
            duration: turnDuration
        });
        
        // Trigger callbacks
        this._triggerCallbacks('onTurnEnd', {
            round: this.round,
            turnIndex: this.turnIndex,
            combatant,
            duration: turnDuration
        });
        
        // Play turn end sound
        if (this.audio) {
            this.audio.play('turn-end');
        }
        
        return combatant;
    }

    /**
     * Process conditions at the start of a combatant's turn
     * @private
     * @param {Object} combatant - Combatant object
     */
    async _processConditionsAtTurnStart(combatant) {
        // Check for death saves
        if (combatant.hp === 0 && combatant.type === 'pc') {
            // Apply death save
            await this.applyDeathSave(combatant.id);
        }
        
        // Process condition saves
        if (combatant.conditions && combatant.conditions.length > 0) {
            // Define roll save function
            const rollSave = async (combatant, ability, dc) => {
                // Get ability modifier
                const modifier = combatant.abilities ? 
                    Math.floor((combatant.abilities[ability] - 10) / 2) : 0;
                
                // Roll save
                const rollResult = await this.dice.roll(`1d20${modifier >= 0 ? '+' + modifier : modifier}`, {
                    name: `${ability.toUpperCase()} Save`,
                    type: 'save'
                });
                
                // Check if save succeeded
                const success = rollResult.total >= dc;
                
                return { roll: rollResult, success };
            };
            
            // Process saves
            const { combatant: updatedCombatant, results } = 
                await this.conditions.processConditionSaves(combatant, rollSave);
            
            // Update combatant
            if (results.length > 0) {
                this.updateCombatant(combatant.id, {
                    conditions: updatedCombatant.conditions
                });
                
                // Log condition saves
                results.forEach(result => {
                    this._addToHistory('condition-save', {
                        combatantId: combatant.id,
                        combatantName: combatant.name,
                        condition: result.condition.name,
                        roll: result.roll.total,
                        dc: result.condition.saveDC,
                        ability: result.condition.saveAbility,
                        success: result.success,
                        message: result.message
                    });
                });
            }
        }
    }

    /**
     * Process conditions at the end of a combatant's turn
     * @private
     * @param {Object} combatant - Combatant object
     */
    _processConditionsAtTurnEnd(combatant) {
        // Update condition durations
        if (combatant.conditions && combatant.conditions.length > 0) {
            const updatedCombatant = this.conditions.updateConditionDurations(combatant);
            
            // Update combatant
            this.updateCombatant(combatant.id, {
                conditions: updatedCombatant.conditions
            });
        }
    }

    /**
     * Start the combat timer
     * @private
     */
    _startTimer() {
        // Clear existing timer
        this._stopTimer();
        
        // Set start time if not set
        if (!this.startTime) {
            this.startTime = new Date();
        }
        
        // Start timer interval
        this.timerInterval = setInterval(() => {
            // Calculate elapsed time
            this.elapsedTime = Math.floor((Date.now() - this.startTime.getTime()) / 1000);
            
            // Trigger callbacks
            this._triggerCallbacks('onTimerTick', {
                elapsedTime: this.elapsedTime
            });
        }, 1000);
    }

    /**
     * Stop the combat timer
     * @private
     */
    _stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    /**
     * Start the turn timer
     * @private
     */
    _startTurnTimer() {
        // Clear existing timer
        this._stopTurnTimer();
        
        // Get turn timer duration
        this.turnTimerDuration = this.settings.getTurnTimerDuration();
        this.turnTimerRemaining = this.turnTimerDuration;
        this.turnTimerWarning = this.settings.getTurnTimerWarning();
        this.turnTimerAutoEnd = this.settings.shouldTurnTimerAutoEnd();
        
        // Start timer interval
        this.turnTimerInterval = setInterval(() => {
            // Decrement remaining time
            this.turnTimerRemaining--;
            
            // Trigger callbacks
            this._triggerCallbacks('onTurnTimerTick', {
                remaining: this.turnTimerRemaining,
                duration: this.turnTimerDuration,
                warning: this.turnTimerRemaining <= this.turnTimerWarning
            });
            
            // Check if timer has expired
            if (this.turnTimerRemaining <= 0) {
                // Play timer end sound
                if (this.audio) {
                    this.audio.play('timer-end');
                }
                
                // Trigger callbacks
                this._triggerCallbacks('onTurnTimerExpired', {
                    duration: this.turnTimerDuration
                });
                
                // Auto-end turn if enabled
                if (this.turnTimerAutoEnd) {
                    this.nextTurn();
                } else {
                    // Stop timer
                    this._stopTurnTimer();
                }
            }
            // Play warning sound
            else if (this.turnTimerRemaining === this.turnTimerWarning && this.audio) {
                this.audio.play('turn-end');
            }
        }, 1000);
    }

    /**
     * Stop the turn timer
     * @private
     */
    _stopTurnTimer() {
        if (this.turnTimerInterval) {
            clearInterval(this.turnTimerInterval);
            this.turnTimerInterval = null;
        }
    }

    /**
     * Add an entry to the combat history
     * @private
     * @param {string} type - Entry type
     * @param {Object} data - Entry data
     */
    _addToHistory(type, data) {
        const entry = {
            type,
            data,
            timestamp: Date.now(),
            round: this.round
        };
        
        this.history.push(entry);
    }

    /**
     * Trigger callbacks for an event
     * @private
     * @param {string} event - Event name
     * @param {Object} data - Event data
     */
    _triggerCallbacks(event, data) {
        if (!this.callbacks[event]) {
            return;
        }
        
        this.callbacks[event].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in ${event} callback:`, error);
            }
        });
    }

    /**
     * Sort combatants by initiative
     * @param {Array} combatants - Combatants to sort
     * @returns {Array} Sorted combatants
     */
    sortByInitiative(combatants) {
        return [...combatants].sort((a, b) => {
            // Sort by initiative (descending)
            if (b.initiative !== a.initiative) {
                return b.initiative - a.initiative;
            }
            
            // If initiative is tied, sort by dexterity if available
            if (a.abilities && b.abilities && a.abilities.dex !== b.abilities.dex) {
                return b.abilities.dex - a.abilities.dex;
            }
            
            // If still tied, sort by name
            return a.name.localeCompare(b.name);
        });
    }

    /**
     * Get the elapsed time formatted as HH:MM:SS
     * @returns {string} Formatted elapsed time
     */
    getFormattedElapsedTime() {
        const hours = Math.floor(this.elapsedTime / 3600);
        const minutes = Math.floor((this.elapsedTime % 3600) / 60);
        const seconds = this.elapsedTime % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Get the turn timer formatted as MM:SS
     * @returns {string} Formatted turn timer
     */
    getFormattedTurnTimer() {
        if (!this.turnTimerRemaining) {
            return '00:00';
        }
        
        const minutes = Math.floor(this.turnTimerRemaining / 60);
        const seconds = this.turnTimerRemaining % 60;
        
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Check if combat is active
     * @returns {boolean} True if combat is active
     */
    isActive() {
        return this.active;
    }

    /**
     * Check if a combatant's turn is active
     * @param {string} combatantId - Combatant ID
     * @returns {boolean} True if it's the combatant's turn
     */
    isCombatantsTurn(combatantId) {
        const currentCombatant = this.getCurrentCombatant();
        return currentCombatant && currentCombatant.id === combatantId;
    }

    /**
     * Reorder a combatant in the initiative order
     * @param {string} combatantId - Combatant ID
     * @param {number} newIndex - New index in the initiative order
     * @returns {boolean} Success status
     */
    reorderInitiative(combatantId, newIndex) {
        // Find combatant
        const combatant = this.getCombatant(combatantId);
        if (!combatant) {
            console.warn(`Combatant not found: ${combatantId}`);
            return false;
        }
        
        // Find current index in initiative order
        const currentIndex = this.initiativeOrder.findIndex(c => c.id === combatantId);
        if (currentIndex === -1) {
            console.warn(`Combatant not in initiative order: ${combatantId}`);
            return false;
        }
        
        // Validate new index
        if (newIndex < 0 || newIndex >= this.initiativeOrder.length) {
            console.warn(`Invalid initiative index: ${newIndex}`);
            return false;
        }
        
        // Remove from current position
        const [removed] = this.initiativeOrder.splice(currentIndex, 1);
        
        // Insert at new position
        this.initiativeOrder.splice(newIndex, 0, removed);
        
        // Adjust turn index if necessary
        if (this.active) {
            if (currentIndex === this.turnIndex) {
                // If the current turn combatant was moved, update turn index
                this.turnIndex = newIndex;
            } else if (currentIndex < this.turnIndex && newIndex >= this.turnIndex) {
                // If a combatant was moved from before the current turn to after it, decrement turn index
                this.turnIndex--;
            } else if (currentIndex > this.turnIndex && newIndex <= this.turnIndex) {
                // If a combatant was moved from after the current turn to before it, increment turn index
                this.turnIndex++;
            }
        }
        
        // Log initiative reorder
        this._addToHistory('initiative-reorder', {
            combatantId: combatant.id,
            combatantName: combatant.name,
            oldIndex: currentIndex,
            newIndex
        });
        
        // Trigger callbacks
        this._triggerCallbacks('onInitiativeChange', {
            initiativeOrder: this.initiativeOrder
        });
        
        return true;
    }

    /**
     * Delay a combatant's turn
     * @param {string} combatantId - Combatant ID
     * @returns {boolean} Success status
     */
    delayCombatantTurn(combatantId) {
        // Check if it's the combatant's turn
        if (!this.isCombatantsTurn(combatantId)) {
            console.warn(`Not ${combatantId}'s turn`);
            return false;
        }
        
        // Move combatant to the end of the initiative order
        const currentIndex = this.turnIndex;
        const newIndex = this.initiativeOrder.length - 1;
        
        // Reorder initiative
        const success = this.reorderInitiative(combatantId, newIndex);
        if (!success) {
            return false;
        }
        
        // Log delay turn
        this._addToHistory('delay-turn', {
            combatantId,
            combatantName: this.getCombatant(combatantId).name
        });
        
        // Move to next combatant's turn
        this.turnIndex = currentIndex % this.initiativeOrder.length;
        this._startTurn();
        
        return true;
    }

    /**
     * Ready an action for a combatant
     * @param {string} combatantId - Combatant ID
     * @param {string} action - Action description
     * @param {string} trigger - Action trigger
     * @returns {boolean} Success status
     */
    readyCombatantAction(combatantId, action, trigger) {
        // Check if it's the combatant's turn
        if (!this.isCombatantsTurn(combatantId)) {
            console.warn(`Not ${combatantId}'s turn`);
            return false;
        }
        
        // Update combatant
        const combatant = this.getCombatant(combatantId);
        if (!combatant) {
            return false;
        }
        
        this.updateCombatant(combatantId, {
            readiedAction: {
                action,
                trigger,
                readiedAt: Date.now()
            }
        });
        
        // Log ready action
        this._addToHistory('ready-action', {
            combatantId,
            combatantName: combatant.name,
            action,
            trigger
        });
        
        // Move to next turn
        this.nextTurn();
        
        return true;
    }

    /**
     * Trigger a readied action
     * @param {string} combatantId - Combatant ID
     * @returns {boolean} Success status
     */
    triggerReadiedAction(combatantId) {
        // Get combatant
        const combatant = this.getCombatant(combatantId);
        if (!combatant || !combatant.readiedAction) {
            console.warn(`No readied action for combatant: ${combatantId}`);
            return false;
        }
        
        // Log trigger readied action
        this._addToHistory('trigger-readied-action', {
            combatantId,
            combatantName: combatant.name,
            action: combatant.readiedAction.action,
            trigger: combatant.readiedAction.trigger
        });
        
        // Clear readied action
        this.updateCombatant(combatantId, {
            readiedAction: null
        });
        
        return true;
    }

    /**
     * Add a custom event to the combat history
     * @param {string} eventType - Event type
     * @param {Object} eventData - Event data
     */
    addCustomEvent(eventType, eventData) {
        this._addToHistory(`custom-${eventType}`, eventData);
    }
}

// Export the Combat class
export default Combat;
