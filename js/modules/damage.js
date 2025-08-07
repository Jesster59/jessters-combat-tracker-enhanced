/**
 * Damage Tracker for Jesster's Combat Tracker
 * Handles damage calculations and tracking
 */
class DamageTracker {
    constructor(app) {
        this.app = app;
        this.damageTypes = [
            'acid', 'bludgeoning', 'cold', 'fire', 'force', 'lightning',
            'necrotic', 'piercing', 'poison', 'psychic', 'radiant', 'slashing', 'thunder'
        ];
        console.log("Damage Tracker initialized");
    }
    
    /**
     * Apply damage to a creature
     * @param {string} creatureId - The ID of the creature
     * @param {number} damage - The amount of damage
     * @param {string} [damageType] - The type of damage
     * @returns {boolean} - Whether the damage was applied successfully
     */
    applyDamage(creatureId, damage, damageType = '') {
        const creature = this.app.combat.getCreatureById(creatureId);
        if (!creature) {
            console.error(`Creature with ID ${creatureId} not found`);
            return false;
        }
        
        // Apply damage to temp HP first
        let remainingDamage = damage;
        let tempHpDamage = 0;
        
        if (creature.tempHp > 0) {
            tempHpDamage = Math.min(creature.tempHp, remainingDamage);
            creature.tempHp -= tempHpDamage;
            remainingDamage -= tempHpDamage;
        }
        
        // Apply remaining damage to current HP
        if (remainingDamage > 0) {
            creature.currentHp = Math.max(0, creature.currentHp - remainingDamage);
        }
        
        // Log the damage
        let logMessage = `${creature.name} takes ${damage} damage`;
        if (damageType) {
            logMessage += ` (${damageType})`;
        }
        
        if (tempHpDamage > 0) {
            logMessage += ` (${tempHpDamage} absorbed by temp HP)`;
        }
        
        logMessage += `. HP: ${creature.currentHp}/${creature.maxHp}`;
        
        this.app.logEvent(logMessage);
        
        // Check for concentration
        if (creature.concentrating && damage > 0) {
            const concentrationDC = Math.max(10, Math.floor(damage / 2));
            this.app.logEvent(`${creature.name} must make a Constitution save (DC ${concentrationDC}) to maintain concentration.`);
            
            // Prompt for concentration check
            this.promptConcentrationCheck(creature, concentrationDC);
        }
        
        // Check for death
        if (creature.currentHp <= 0) {
            if (creature.type === 'hero') {
                this.app.logEvent(`${creature.name} is unconscious and must start making death saving throws.`);
            } else {
                this.app.logEvent(`${creature.name} is defeated!`);
            }
        }
        
        // Update UI
        this.app.ui.renderCreatures();
        this.app.updatePlayerView();
        
        // Play sound
        this.app.audio.play('hit');
        
        return true;
    }
    
    /**
     * Apply healing to a creature
     * @param {string} creatureId - The ID of the creature
     * @param {number} healing - The amount of healing
     * @returns {boolean} - Whether the healing was applied successfully
     */
    applyHealing(creatureId, healing) {
        const creature = this.app.combat.getCreatureById(creatureId);
        if (!creature) {
            console.error(`Creature with ID ${creatureId} not found`);
            return false;
        }
        
        // Apply healing
        const oldHp = creature.currentHp;
        creature.currentHp = Math.min(creature.maxHp, creature.currentHp + healing);
        const actualHealing = creature.currentHp - oldHp;
        
        // Log the healing
        this.app.logEvent(`${creature.name} heals for ${actualHealing} HP. HP: ${creature.currentHp}/${creature.maxHp}`);
        
        // Update UI
        this.app.ui.renderCreatures();
        this.app.updatePlayerView();
        
        // Play sound
        this.app.audio.play('heal');
        
        return true;
    }
    
    /**
     * Apply temporary HP to a creature
     * @param {string} creatureId - The ID of the creature
     * @param {number} tempHp - The amount of temporary HP
     * @returns {boolean} - Whether the temporary HP was applied successfully
     */
    applyTempHp(creatureId, tempHp) {
        const creature = this.app.combat.getCreatureById(creatureId);
        if (!creature) {
            console.error(`Creature with ID ${creatureId} not found`);
            return false;
        }
        
        // Apply temp HP (doesn't stack, take the higher value)
        const oldTempHp = creature.tempHp || 0;
        creature.tempHp = Math.max(oldTempHp, tempHp);
        
        // Log the temp HP
        if (creature.tempHp > oldTempHp) {
            this.app.logEvent(`${creature.name} gains ${creature.tempHp} temporary HP.`);
        } else {
            this.app.logEvent(`${creature.name} already has ${oldTempHp} temporary HP (higher than ${tempHp}).`);
        }
        
        // Update UI
        this.app.ui.renderCreatures();
        this.app.updatePlayerView();
        
        return true;
    }
    
    /**
     * Prompt for a concentration check
     * @param {Object} creature - The creature
     * @param {number} dc - The DC of the concentration check
     */
    promptConcentrationCheck(creature, dc) {
        // Create a modal for the concentration check
        const modal = this.app.ui.createModal({
            title: 'Concentration Check',
            content: `
                <div class="space-y-4">
                    <p class="text-gray-300">${creature.name} took damage while concentrating on a spell.</p>
                    <p class="text-xl font-bold text-center">Constitution saving throw (DC ${dc}) required to maintain concentration.</p>
                    
                    <div class="flex justify-center space-x-4">
                        <button id="roll-concentration-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Roll Save
                        </button>
                        <button id="fail-concentration-btn" class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                            Fail Save
                        </button>
                    </div>
                </div>
            `,
            width: 'max-w-md'
        });
        
        // Add event listeners
        const rollBtn = modal.querySelector('#roll-concentration-btn');
        const failBtn = modal.querySelector('#fail-concentration-btn');
        
        rollBtn.addEventListener('click', async () => {
            // Make the concentration save (Constitution)
            const result = await this.app.combat.makeSavingThrow(creature.id, 'con', dc);
            
            if (result.success) {
                this.app.logEvent(`${creature.name} maintains concentration!`);
            } else {
                this.app.logEvent(`${creature.name} loses concentration!`);
                this.app.combat.toggleConcentration(creature.id, false);
            }
            
            this.app.ui.closeModal(modal);
        });
        
        failBtn.addEventListener('click', () => {
            this.app.logEvent(`${creature.name} loses concentration!`);
            this.app.combat.toggleConcentration(creature.id, false);
            this.app.ui.closeModal(modal);
        });
    }
}
