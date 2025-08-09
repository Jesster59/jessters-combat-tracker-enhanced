/**
 * Damage module for Jesster's Combat Tracker
 * Handles damage calculation and application to combatants
 */
class Damage {
    constructor(dice, audio) {
        // Store references to other modules
        this.dice = dice;
        this.audio = audio;
        
        // Damage types
        this.damageTypes = [
            { id: 'acid', name: 'Acid', color: '#00FF00' },
            { id: 'bludgeoning', name: 'Bludgeoning', color: '#8B4513' },
            { id: 'cold', name: 'Cold', color: '#ADD8E6' },
            { id: 'fire', name: 'Fire', color: '#FF4500' },
            { id: 'force', name: 'Force', color: '#9370DB' },
            { id: 'lightning', name: 'Lightning', color: '#FFFF00' },
            { id: 'necrotic', name: 'Necrotic', color: '#800080' },
            { id: 'piercing', name: 'Piercing', color: '#A9A9A9' },
            { id: 'poison', name: 'Poison', color: '#008000' },
            { id: 'psychic', name: 'Psychic', color: '#FF69B4' },
            { id: 'radiant', name: 'Radiant', color: '#FFFF99' },
            { id: 'slashing', name: 'Slashing', color: '#C0C0C0' },
            { id: 'thunder', name: 'Thunder', color: '#4682B4' }
        ];
        
        // Damage history
        this.damageHistory = [];
        
        console.log("Damage module initialized");
    }

    /**
     * Get all damage types
     * @returns {Array} Damage types
     */
    getDamageTypes() {
        return [...this.damageTypes];
    }

    /**
     * Get damage type by ID
     * @param {string} id - Damage type ID
     * @returns {Object|null} Damage type or null if not found
     */
    getDamageType(id) {
        return this.damageTypes.find(type => type.id === id) || null;
    }

    /**
     * Apply damage to a combatant
     * @param {Object} combatant - Combatant object
     * @param {number|string} amount - Damage amount or formula
     * @param {Object} options - Damage options
     * @param {string} options.type - Damage type
     * @param {boolean} options.critical - Whether the damage is from a critical hit
     * @param {string} options.source - Source of the damage
     * @param {boolean} options.ignoreResistance - Whether to ignore resistance
     * @param {boolean} options.ignoreImmunity - Whether to ignore immunity
     * @param {boolean} options.ignoreVulnerability - Whether to ignore vulnerability
     * @returns {Promise<Object>} Damage result
     */
    async applyDamage(combatant, amount, options = {}) {
        // Get options
        const {
            type = null,
            critical = false,
            source = null,
            ignoreResistance = false,
            ignoreImmunity = false,
            ignoreVulnerability = false
        } = options;
        
        // Get damage type
        const damageType = type ? this.getDamageType(type) : null;
        
        // Calculate raw damage
        let rawDamage = 0;
        
        // If amount is a number, use it directly
        if (typeof amount === 'number') {
            rawDamage = amount;
        }
        // If amount is a string, it could be a formula or a simple number
        else if (typeof amount === 'string') {
            // Check if it's a simple number
            if (/^-?\d+$/.test(amount)) {
                rawDamage = parseInt(amount, 10);
            }
            // If it's a relative value (e.g., "+5" or "-3")
            else if (/^[+-]\d+$/.test(amount)) {
                rawDamage = parseInt(amount, 10);
            }
            // Otherwise, treat it as a dice formula
            else {
                const rollResult = await this.dice.roll(amount, {
                    name: `${damageType ? damageType.name : 'Damage'}`,
                    type: 'damage',
                    critical
                });
                
                rawDamage = rollResult.total;
            }
        }
        
        // Check for negative damage (healing)
        if (rawDamage < 0) {
            return this.applyHealing(combatant, -rawDamage, { source });
        }
        
        // Apply damage modifiers based on resistances, immunities, and vulnerabilities
        let finalDamage = rawDamage;
        let damageModifier = 'normal';
        
        if (damageType && combatant.damageModifiers) {
            // Check for immunity
            if (!ignoreImmunity && combatant.damageModifiers.immunities && 
                combatant.damageModifiers.immunities.includes(damageType.id)) {
                finalDamage = 0;
                damageModifier = 'immune';
            }
            // Check for resistance
            else if (!ignoreResistance && combatant.damageModifiers.resistances && 
                     combatant.damageModifiers.resistances.includes(damageType.id)) {
                finalDamage = Math.floor(rawDamage / 2);
                damageModifier = 'resistant';
            }
            // Check for vulnerability
            else if (!ignoreVulnerability && combatant.damageModifiers.vulnerabilities && 
                     combatant.damageModifiers.vulnerabilities.includes(damageType.id)) {
                finalDamage = rawDamage * 2;
                damageModifier = 'vulnerable';
            }
        }
        
        // Update combatant HP
        const oldHP = combatant.hp || 0;
        const newHP = Math.max(0, oldHP - finalDamage);
        combatant.hp = newHP;
        
        // Check if combatant is unconscious
        const isUnconscious = newHP === 0 && oldHP > 0;
        
        // Check if combatant is dead (depends on creature type)
        const isDead = newHP === 0 && (
            // For monsters, they die at 0 HP
            (combatant.type === 'monster') ||
            // For PCs, they die if damage >= max HP + current HP
            (combatant.type === 'pc' && finalDamage >= (combatant.maxHp + oldHP))
        );
        
        // Play sound effect
        if (this.audio && !isDead) {
            this.audio.play('damage');
        } else if (this.audio && isDead) {
            // Play different sound for death
            this.audio.play('critical-hit');
        }
        
        // Record damage in history
        const damageRecord = {
            combatantId: combatant.id,
            combatantName: combatant.name,
            timestamp: Date.now(),
            type: 'damage',
            damageType: damageType ? damageType.id : null,
            rawDamage,
            finalDamage,
            damageModifier,
            oldHP,
            newHP,
            source,
            critical
        };
        
        this.damageHistory.push(damageRecord);
        
        // Return damage result
        return {
            combatant,
            rawDamage,
            finalDamage,
            damageModifier,
            oldHP,
            newHP,
            isUnconscious,
            isDead,
            damageType: damageType ? damageType.id : null
        };
    }

    /**
     * Apply healing to a combatant
     * @param {Object} combatant - Combatant object
     * @param {number|string} amount - Healing amount or formula
     * @param {Object} options - Healing options
     * @param {string} options.source - Source of the healing
     * @param {boolean} options.temporary - Whether the healing is temporary HP
     * @returns {Promise<Object>} Healing result
     */
    async applyHealing(combatant, amount, options = {}) {
        // Get options
        const {
            source = null,
            temporary = false
        } = options;
        
        // Calculate raw healing
        let rawHealing = 0;
        
        // If amount is a number, use it directly
        if (typeof amount === 'number') {
            rawHealing = amount;
        }
        // If amount is a string, it could be a formula or a simple number
        else if (typeof amount === 'string') {
            // Check if it's a simple number
            if (/^\d+$/.test(amount)) {
                rawHealing = parseInt(amount, 10);
            }
            // Otherwise, treat it as a dice formula
            else {
                const rollResult = await this.dice.roll(amount, {
                    name: 'Healing',
                    type: 'healing'
                });
                
                rawHealing = rollResult.total;
            }
        }
        
        // Ensure healing is positive
        rawHealing = Math.max(0, rawHealing);
        
        // Apply healing
        const oldHP = combatant.hp || 0;
        let newHP = oldHP;
        
        // Handle temporary HP
        if (temporary) {
            const oldTempHP = combatant.tempHp || 0;
            const newTempHP = Math.max(oldTempHP, rawHealing);
            combatant.tempHp = newTempHP;
            
            // Record healing in history
            const healingRecord = {
                combatantId: combatant.id,
                combatantName: combatant.name,
                timestamp: Date.now(),
                type: 'temp-hp',
                rawHealing,
                finalHealing: newTempHP - oldTempHP,
                oldTempHP,
                newTempHP,
                source
            };
            
            this.damageHistory.push(healingRecord);
            
            // Play sound effect
            if (this.audio) {
                this.audio.play('healing');
            }
            
            // Return healing result
            return {
                combatant,
                rawHealing,
                finalHealing: newTempHP - oldTempHP,
                oldTempHP,
                newTempHP,
                temporary: true
            };
        }
        // Regular healing
        else {
            const maxHP = combatant.maxHp || 0;
            newHP = Math.min(maxHP, oldHP + rawHealing);
            combatant.hp = newHP;
            
            // Record healing in history
            const healingRecord = {
                combatantId: combatant.id,
                combatantName: combatant.name,
                timestamp: Date.now(),
                type: 'healing',
                rawHealing,
                finalHealing: newHP - oldHP,
                oldHP,
                newHP,
                source
            };
            
            this.damageHistory.push(healingRecord);
            
            // Play sound effect
            if (this.audio) {
                this.audio.play('healing');
            }
            
            // Return healing result
            return {
                combatant,
                rawHealing,
                finalHealing: newHP - oldHP,
                oldHP,
                newHP,
                temporary: false
            };
        }
    }

    /**
     * Apply temporary HP to a combatant
     * @param {Object} combatant - Combatant object
     * @param {number|string} amount - Temporary HP amount or formula
     * @param {Object} options - Options
     * @param {string} options.source - Source of the temporary HP
     * @returns {Promise<Object>} Result
     */
    async applyTemporaryHP(combatant, amount, options = {}) {
        return this.applyHealing(combatant, amount, { ...options, temporary: true });
    }

    /**
     * Set a combatant's current HP
     * @param {Object} combatant - Combatant object
     * @param {number} hp - New HP value
     * @returns {Object} Updated combatant
     */
    setHP(combatant, hp) {
        const oldHP = combatant.hp || 0;
        const maxHP = combatant.maxHp || 0;
        
        // Ensure HP is within valid range
        const newHP = Math.max(0, Math.min(maxHP, hp));
        combatant.hp = newHP;
        
        // Record in history
        const record = {
            combatantId: combatant.id,
            combatantName: combatant.name,
            timestamp: Date.now(),
            type: 'set-hp',
            oldHP,
            newHP
        };
        
        this.damageHistory.push(record);
        
        return combatant;
    }

    /**
     * Set a combatant's maximum HP
     * @param {Object} combatant - Combatant object
     * @param {number} maxHp - New maximum HP value
     * @returns {Object} Updated combatant
     */
    setMaxHP(combatant, maxHp) {
        const oldMaxHP = combatant.maxHp || 0;
        const oldHP = combatant.hp || 0;
        
        // Ensure max HP is positive
        const newMaxHP = Math.max(1, maxHp);
        combatant.maxHp = newMaxHP;
        
        // Adjust current HP if it exceeds new max
        if (oldHP > newMaxHP) {
            combatant.hp = newMaxHP;
        }
        
        // Record in history
        const record = {
            combatantId: combatant.id,
            combatantName: combatant.name,
            timestamp: Date.now(),
            type: 'set-max-hp',
            oldMaxHP,
            newMaxHP,
            oldHP,
            newHP: combatant.hp
        };
        
        this.damageHistory.push(record);
        
        return combatant;
    }

    /**
     * Set a combatant's temporary HP
     * @param {Object} combatant - Combatant object
     * @param {number} tempHp - New temporary HP value
     * @returns {Object} Updated combatant
     */
    setTemporaryHP(combatant, tempHp) {
        const oldTempHP = combatant.tempHp || 0;
        
        // Ensure temp HP is non-negative
        const newTempHP = Math.max(0, tempHp);
        combatant.tempHp = newTempHP;
        
        // Record in history
        const record = {
            combatantId: combatant.id,
            combatantName: combatant.name,
            timestamp: Date.now(),
            type: 'set-temp-hp',
            oldTempHP,
            newTempHP
        };
        
        this.damageHistory.push(record);
        
        return combatant;
    }

    /**
     * Apply damage resistance to a combatant
     * @param {Object} combatant - Combatant object
     * @param {string} damageType - Damage type ID
     * @returns {Object} Updated combatant
     */
    addResistance(combatant, damageType) {
        // Initialize damage modifiers if they don't exist
        if (!combatant.damageModifiers) {
            combatant.damageModifiers = {};
        }
        
        // Initialize resistances array if it doesn't exist
        if (!combatant.damageModifiers.resistances) {
            combatant.damageModifiers.resistances = [];
        }
        
        // Add resistance if it doesn't already exist
        if (!combatant.damageModifiers.resistances.includes(damageType)) {
            combatant.damageModifiers.resistances.push(damageType);
        }
        
        return combatant;
    }

    /**
     * Remove damage resistance from a combatant
     * @param {Object} combatant - Combatant object
     * @param {string} damageType - Damage type ID
     * @returns {Object} Updated combatant
     */
    removeResistance(combatant, damageType) {
        // Check if damage modifiers and resistances exist
        if (!combatant.damageModifiers || !combatant.damageModifiers.resistances) {
            return combatant;
        }
        
        // Remove resistance
        combatant.damageModifiers.resistances = combatant.damageModifiers.resistances.filter(
            type => type !== damageType
        );
        
        return combatant;
    }

    /**
     * Apply damage immunity to a combatant
     * @param {Object} combatant - Combatant object
     * @param {string} damageType - Damage type ID
     * @returns {Object} Updated combatant
     */
    addImmunity(combatant, damageType) {
        // Initialize damage modifiers if they don't exist
        if (!combatant.damageModifiers) {
            combatant.damageModifiers = {};
        }
        
        // Initialize immunities array if it doesn't exist
        if (!combatant.damageModifiers.immunities) {
            combatant.damageModifiers.immunities = [];
        }
        
        // Add immunity if it doesn't already exist
        if (!combatant.damageModifiers.immunities.includes(damageType)) {
            combatant.damageModifiers.immunities.push(damageType);
        }
        
        return combatant;
    }

    /**
     * Remove damage immunity from a combatant
     * @param {Object} combatant - Combatant object
     * @param {string} damageType - Damage type ID
     * @returns {Object} Updated combatant
     */
    removeImmunity(combatant, damageType) {
        // Check if damage modifiers and immunities exist
        if (!combatant.damageModifiers || !combatant.damageModifiers.immunities) {
            return combatant;
        }
        
        // Remove immunity
        combatant.damageModifiers.immunities = combatant.damageModifiers.immunities.filter(
            type => type !== damageType
        );
        
        return combatant;
    }

    /**
     * Apply damage vulnerability to a combatant
     * @param {Object} combatant - Combatant object
     * @param {string} damageType - Damage type ID
     * @returns {Object} Updated combatant
     */
    addVulnerability(combatant, damageType) {
        // Initialize damage modifiers if they don't exist
        if (!combatant.damageModifiers) {
            combatant.damageModifiers = {};
        }
        
        // Initialize vulnerabilities array if it doesn't exist
        if (!combatant.damageModifiers.vulnerabilities) {
            combatant.damageModifiers.vulnerabilities = [];
        }
        
        // Add vulnerability if it doesn't already exist
        if (!combatant.damageModifiers.vulnerabilities.includes(damageType)) {
            combatant.damageModifiers.vulnerabilities.push(damageType);
        }
        
        return combatant;
    }

    /**
     * Remove damage vulnerability from a combatant
     * @param {Object} combatant - Combatant object
     * @param {string} damageType - Damage type ID
     * @returns {Object} Updated combatant
     */
    removeVulnerability(combatant, damageType) {
        // Check if damage modifiers and vulnerabilities exist
        if (!combatant.damageModifiers || !combatant.damageModifiers.vulnerabilities) {
            return combatant;
        }
        
        // Remove vulnerability
        combatant.damageModifiers.vulnerabilities = combatant.damageModifiers.vulnerabilities.filter(
            type => type !== damageType
        );
        
        return combatant;
    }

    /**
     * Check if a combatant is resistant to a damage type
     * @param {Object} combatant - Combatant object
     * @param {string} damageType - Damage type ID
     * @returns {boolean} True if resistant
     */
    isResistant(combatant, damageType) {
        return combatant.damageModifiers && 
               combatant.damageModifiers.resistances && 
               combatant.damageModifiers.resistances.includes(damageType);
    }

    /**
     * Check if a combatant is immune to a damage type
     * @param {Object} combatant - Combatant object
     * @param {string} damageType - Damage type ID
     * @returns {boolean} True if immune
     */
    isImmune(combatant, damageType) {
        return combatant.damageModifiers && 
               combatant.damageModifiers.immunities && 
               combatant.damageModifiers.immunities.includes(damageType);
    }

    /**
     * Check if a combatant is vulnerable to a damage type
     * @param {Object} combatant - Combatant object
     * @param {string} damageType - Damage type ID
     * @returns {boolean} True if vulnerable
     */
    isVulnerable(combatant, damageType) {
        return combatant.damageModifiers && 
               combatant.damageModifiers.vulnerabilities && 
               combatant.damageModifiers.vulnerabilities.includes(damageType);
    }

    /**
     * Get damage history for a combatant
     * @param {string} combatantId - Combatant ID
     * @returns {Array} Damage history
     */
    getCombatantDamageHistory(combatantId) {
        return this.damageHistory.filter(record => record.combatantId === combatantId);
    }

    /**
     * Get damage history for the current combat
     * @param {number} limit - Maximum number of records to return
     * @returns {Array} Damage history
     */
    getDamageHistory(limit = 0) {
        const history = [...this.damageHistory];
        history.sort((a, b) => b.timestamp - a.timestamp); // Sort by timestamp (newest first)
        
        return limit > 0 ? history.slice(0, limit) : history;
    }

    /**
     * Clear damage history
     */
    clearDamageHistory() {
        this.damageHistory = [];
    }

    /**
     * Calculate damage for a weapon attack
     * @param {Object} weapon - Weapon object
     * @param {Object} attacker - Attacker object
     * @param {Object} options - Options
     * @param {boolean} options.critical - Whether the attack is a critical hit
     * @param {string} options.ability - Ability used for damage bonus
     * @returns {Promise<Object>} Damage result
     */
    async calculateWeaponDamage(weapon, attacker, options = {}) {
        const {
            critical = false,
            ability = 'str'
        } = options;
        
        // Get weapon damage formula
        let damageFormula = weapon.damage || '1d4';
        
        // Add ability modifier to damage
        const abilityMod = attacker.abilities ? 
            Math.floor((attacker.abilities[ability] - 10) / 2) : 0;
        
        if (abilityMod !== 0) {
            damageFormula += abilityMod >= 0 ? `+${abilityMod}` : abilityMod;
        }
        
        // Roll damage
        const damageResult = await this.dice.roll(damageFormula, {
            name: `${weapon.name || 'Weapon'} Damage`,
            type: 'damage',
            critical
        });
        
        return {
            weapon,
            damageFormula,
            damageType: weapon.damageType || 'bludgeoning',
            damageResult,
            total: damageResult.total
        };
    }

    /**
     * Calculate damage for a spell attack
     * @param {Object} spell - Spell object
     * @param {Object} caster - Caster object
     * @param {Object} options - Options
     * @param {boolean} options.critical - Whether the attack is a critical hit
     * @param {number} options.spellLevel - Spell slot level used
     * @param {string} options.spellAbility - Spellcasting ability
     * @returns {Promise<Object>} Damage result
     */
    async calculateSpellDamage(spell, caster, options = {}) {
        const {
            critical = false,
            spellLevel = spell.level || 0,
            spellAbility = 'int'
        } = options;
        
        // Get spell damage formula
        let damageFormula = spell.damage || '1d10';
        
        // Scale damage for higher level slots
        if (spell.higherLevelDamage && spellLevel > spell.level) {
            const levelDifference = spellLevel - spell.level;
            damageFormula += ` + ${levelDifference}${spell.higherLevelDamage}`;
        }
        
        // Add spellcasting ability modifier if cantrip
        if (spell.level === 0) {
            const abilityMod = caster.abilities ? 
                Math.floor((caster.abilities[spellAbility] - 10) / 2) : 0;
            
            if (abilityMod !== 0) {
                damageFormula += abilityMod >= 0 ? `+${abilityMod}` : abilityMod;
            }
        }
        
        // Roll damage
        const damageResult = await this.dice.roll(damageFormula, {
            name: `${spell.name || 'Spell'} Damage`,
            type: 'damage',
            critical
        });
        
        return {
            spell,
            damageFormula,
            damageType: spell.damageType || 'force',
            damageResult,
            total: damageResult.total
        };
    }

    /**
     * Apply death saving throw to a combatant
     * @param {Object} combatant - Combatant object
     * @param {number} roll - Death save roll result
     * @returns {Object} Death save result
     */
    applyDeathSave(combatant, roll) {
        // Initialize death saves if they don't exist
        if (!combatant.deathSaves) {
            combatant.deathSaves = {
                successes: 0,
                failures: 0
            };
        }
        
        // Determine result
        let result = '';
        
        if (roll === 20) {
            // Natural 20: regain 1 HP
            combatant.hp = 1;
            combatant.deathSaves.successes = 0;
            combatant.deathSaves.failures = 0;
            result = 'revived';
        } else if (roll === 1) {
            // Natural 1: two failures
            combatant.deathSaves.failures += 2;
            result = 'double-failure';
        } else if (roll >= 10) {
            // Success
            combatant.deathSaves.successes += 1;
            result = 'success';
        } else {
            // Failure
            combatant.deathSaves.failures += 1;
            result = 'failure';
        }
        
        // Check for stabilization or death
        let isStabilized = false;
        let isDead = false;
        
        if (combatant.deathSaves.successes >= 3) {
            // Stabilized
            combatant.deathSaves.successes = 0;
            combatant.deathSaves.failures = 0;
            isStabilized = true;
            result = 'stabilized';
        } else if (combatant.deathSaves.failures >= 3) {
            // Dead
            isDead = true;
            result = 'dead';
        }
        
        // Record in history
        const record = {
            combatantId: combatant.id,
            combatantName: combatant.name,
            timestamp: Date.now(),
            type: 'death-save',
            roll,
            result,
            successes: combatant.deathSaves.successes,
            failures: combatant.deathSaves.failures,
            isStabilized,
            isDead
        };
        
        this.damageHistory.push(record);
        
        // Return result
        return {
            combatant,
            roll,
            result,
            successes: combatant.deathSaves.successes,
            failures: combatant.deathSaves.failures,
            isStabilized,
            isDead
        };
    }

    /**
     * Reset death saves for a combatant
     * @param {Object} combatant - Combatant object
     * @returns {Object} Updated combatant
     */
    resetDeathSaves(combatant) {
        combatant.deathSaves = {
            successes: 0,
            failures: 0
        };
        
        return combatant;
    }

    /**
     * Stabilize a dying combatant
     * @param {Object} combatant - Combatant object
     * @returns {Object} Updated combatant
     */
    stabilizeCombatant(combatant) {
        // Reset death saves
        combatant.deathSaves = {
            successes: 0,
            failures: 0
        };
        
        // Record in history
        const record = {
            combatantId: combatant.id,
            combatantName: combatant.name,
            timestamp: Date.now(),
            type: 'stabilize'
        };
        
        this.damageHistory.push(record);
        
        return combatant;
    }

    /**
     * Kill a combatant
     * @param {Object} combatant - Combatant object
     * @returns {Object} Updated combatant
     */
    killCombatant(combatant) {
        // Set HP to 0
        combatant.hp = 0;
        
        // Set death saves to 3 failures
        combatant.deathSaves = {
            successes: 0,
            failures: 3
        };
        
        // Record in history
        const record = {
            combatantId: combatant.id,
            combatantName: combatant.name,
            timestamp: Date.now(),
            type: 'kill'
        };
        
        this.damageHistory.push(record);
        
        return combatant;
    }

    /**
     * Revive a dead combatant
     * @param {Object} combatant - Combatant object
     * @param {number} hp - HP to revive with
     * @returns {Object} Updated combatant
     */
    reviveCombatant(combatant, hp = 1) {
        // Set HP
        combatant.hp = Math.max(1, hp);
        
        // Reset death saves
        combatant.deathSaves = {
            successes: 0,
            failures: 0
        };
        
        // Record in history
        const record = {
            combatantId: combatant.id,
            combatantName: combatant.name,
            timestamp: Date.now(),
            type: 'revive',
                        hp: combatant.hp
        };
        
        this.damageHistory.push(record);
        
        return combatant;
    }

    /**
     * Check if a combatant is dead
     * @param {Object} combatant - Combatant object
     * @returns {boolean} True if combatant is dead
     */
    isDead(combatant) {
        // Check if HP is 0
        if (combatant.hp > 0) {
            return false;
        }
        
        // For monsters, they die at 0 HP
        if (combatant.type === 'monster') {
            return true;
        }
        
        // For PCs, check death saves
        return combatant.deathSaves && combatant.deathSaves.failures >= 3;
    }

    /**
     * Check if a combatant is dying (unconscious but not dead)
     * @param {Object} combatant - Combatant object
     * @returns {boolean} True if combatant is dying
     */
    isDying(combatant) {
        // Check if HP is 0
        if (combatant.hp > 0) {
            return false;
        }
        
        // For monsters, they die at 0 HP
        if (combatant.type === 'monster') {
            return false;
        }
        
        // For PCs, check death saves
        return !combatant.deathSaves || combatant.deathSaves.failures < 3;
    }

    /**
     * Check if a combatant is stable (unconscious but stable)
     * @param {Object} combatant - Combatant object
     * @returns {boolean} True if combatant is stable
     */
    isStable(combatant) {
        // Check if HP is 0
        if (combatant.hp > 0) {
            return false;
        }
        
        // For monsters, they die at 0 HP
        if (combatant.type === 'monster') {
            return false;
        }
        
        // For PCs, check if they have death saves
        return combatant.deathSaves && 
               combatant.deathSaves.successes === 0 && 
               combatant.deathSaves.failures === 0;
    }

    /**
     * Get HP percentage for a combatant
     * @param {Object} combatant - Combatant object
     * @returns {number} HP percentage (0-100)
     */
    getHPPercentage(combatant) {
        const currentHP = combatant.hp || 0;
        const maxHP = combatant.maxHp || 1;
        
        return Math.floor((currentHP / maxHP) * 100);
    }

    /**
     * Get HP status description for a combatant
     * @param {Object} combatant - Combatant object
     * @returns {string} HP status description
     */
    getHPStatus(combatant) {
        const percentage = this.getHPPercentage(combatant);
        
        if (percentage <= 0) {
            if (this.isDead(combatant)) {
                return 'Dead';
            } else if (this.isStable(combatant)) {
                return 'Unconscious (Stable)';
            } else {
                return 'Unconscious (Dying)';
            }
        } else if (percentage <= 25) {
            return 'Critical';
        } else if (percentage <= 50) {
            return 'Bloodied';
        } else if (percentage <= 75) {
            return 'Wounded';
        } else {
            return 'Healthy';
        }
    }

    /**
     * Apply massive damage rule
     * @param {Object} combatant - Combatant object
     * @param {number} damage - Damage amount
     * @returns {Object} Massive damage result
     */
    applyMassiveDamage(combatant, damage) {
        // Massive damage rule: If damage >= max HP, make a DC 15 CON save or die
        if (damage < combatant.maxHp) {
            return { 
                combatant, 
                requiresSave: false 
            };
        }
        
        // Record in history
        const record = {
            combatantId: combatant.id,
            combatantName: combatant.name,
            timestamp: Date.now(),
            type: 'massive-damage',
            damage
        };
        
        this.damageHistory.push(record);
        
        return {
            combatant,
            requiresSave: true,
            saveDC: 15,
            saveAbility: 'con',
            damage
        };
    }

    /**
     * Apply concentration check
     * @param {Object} combatant - Combatant object
     * @param {number} damage - Damage amount
     * @returns {Object} Concentration check result
     */
    applyConcentrationCheck(combatant, damage) {
        // Concentration check: DC = 10 or half the damage taken, whichever is higher
        const dc = Math.max(10, Math.floor(damage / 2));
        
        // Record in history
        const record = {
            combatantId: combatant.id,
            combatantName: combatant.name,
            timestamp: Date.now(),
            type: 'concentration-check',
            damage,
            dc
        };
        
        this.damageHistory.push(record);
        
        return {
            combatant,
            requiresCheck: true,
            checkDC: dc,
            damage
        };
    }

    /**
     * Apply damage to multiple combatants
     * @param {Array} combatants - Array of combatant objects
     * @param {number|string} amount - Damage amount or formula
     * @param {Object} options - Damage options
     * @returns {Promise<Array>} Array of damage results
     */
    async applyDamageToMultiple(combatants, amount, options = {}) {
        const results = [];
        
        for (const combatant of combatants) {
            const result = await this.applyDamage(combatant, amount, options);
            results.push(result);
        }
        
        return results;
    }

    /**
     * Apply healing to multiple combatants
     * @param {Array} combatants - Array of combatant objects
     * @param {number|string} amount - Healing amount or formula
     * @param {Object} options - Healing options
     * @returns {Promise<Array>} Array of healing results
     */
    async applyHealingToMultiple(combatants, amount, options = {}) {
        const results = [];
        
        for (const combatant of combatants) {
            const result = await this.applyHealing(combatant, amount, options);
            results.push(result);
        }
        
        return results;
    }

    /**
     * Get damage statistics for a combat
     * @returns {Object} Damage statistics
     */
    getDamageStatistics() {
        // Initialize statistics
        const stats = {
            totalDamageDealt: 0,
            totalHealingDone: 0,
            totalTemporaryHP: 0,
            damageByType: {},
            damageBySource: {},
            healingBySource: {},
            damageByTarget: {},
            healingByTarget: {}
        };
        
        // Process damage history
        this.damageHistory.forEach(record => {
            if (record.type === 'damage') {
                // Total damage
                stats.totalDamageDealt += record.finalDamage;
                
                // Damage by type
                if (record.damageType) {
                    if (!stats.damageByType[record.damageType]) {
                        stats.damageByType[record.damageType] = 0;
                    }
                    stats.damageByType[record.damageType] += record.finalDamage;
                }
                
                // Damage by source
                if (record.source) {
                    if (!stats.damageBySource[record.source]) {
                        stats.damageBySource[record.source] = 0;
                    }
                    stats.damageBySource[record.source] += record.finalDamage;
                }
                
                // Damage by target
                if (!stats.damageByTarget[record.combatantId]) {
                    stats.damageByTarget[record.combatantId] = {
                        name: record.combatantName,
                        total: 0
                    };
                }
                stats.damageByTarget[record.combatantId].total += record.finalDamage;
            } 
            else if (record.type === 'healing') {
                // Total healing
                stats.totalHealingDone += record.finalHealing;
                
                // Healing by source
                if (record.source) {
                    if (!stats.healingBySource[record.source]) {
                        stats.healingBySource[record.source] = 0;
                    }
                    stats.healingBySource[record.source] += record.finalHealing;
                }
                
                // Healing by target
                if (!stats.healingByTarget[record.combatantId]) {
                    stats.healingByTarget[record.combatantId] = {
                        name: record.combatantName,
                        total: 0
                    };
                }
                stats.healingByTarget[record.combatantId].total += record.finalHealing;
            }
            else if (record.type === 'temp-hp') {
                // Total temporary HP
                stats.totalTemporaryHP += record.finalHealing;
            }
        });
        
        return stats;
    }

    /**
     * Format damage for display
     * @param {number} damage - Damage amount
     * @param {string} damageType - Damage type
     * @returns {string} Formatted damage string
     */
    formatDamage(damage, damageType = null) {
        if (!damageType) {
            return `${damage} damage`;
        }
        
        const type = this.getDamageType(damageType);
        if (!type) {
            return `${damage} damage`;
        }
        
        return `${damage} ${type.name.toLowerCase()} damage`;
    }

    /**
     * Format healing for display
     * @param {number} healing - Healing amount
     * @param {boolean} temporary - Whether the healing is temporary HP
     * @returns {string} Formatted healing string
     */
    formatHealing(healing, temporary = false) {
        if (temporary) {
            return `${healing} temporary HP`;
        }
        
        return `${healing} healing`;
    }

    /**
     * Get damage color for a damage type
     * @param {string} damageType - Damage type ID
     * @returns {string} Damage color
     */
    getDamageColor(damageType) {
        const type = this.getDamageType(damageType);
        return type ? type.color : '#808080';
    }

    /**
     * Roll damage for a monster attack
     * @param {Object} attack - Attack object
     * @param {boolean} critical - Whether the attack is a critical hit
     * @returns {Promise<Object>} Damage result
     */
    async rollMonsterAttackDamage(attack, critical = false) {
        // Get damage formula
        const damageFormula = attack.damage || '1d4';
        
        // Roll damage
        const damageResult = await this.dice.roll(damageFormula, {
            name: `${attack.name || 'Attack'} Damage`,
            type: 'damage',
            critical
        });
        
        return {
            attack,
            damageFormula,
            damageType: attack.damageType || 'bludgeoning',
            damageResult,
            total: damageResult.total
        };
    }
}

// Export the Damage class
export default Damage;

