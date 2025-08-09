/**
 * Damage Manager for Jesster's Combat Tracker
 * Handles damage and healing calculations
 */
class DamageManager {
    constructor(app) {
        this.app = app;
        console.log("Damage Manager initialized");
    }
    
    /**
     * Open the damage modal for a creature
     * @param {string} creatureId - The ID of the creature
     */
    openDamageModal(creatureId) {
        const creature = this.app.combat.getCreatureById(creatureId);
        if (!creature) return;
        
        const modal = this.app.ui.createModal({
            title: `Apply Damage to ${creature.name}`,
            content: `
                <div class="space-y-4">
                    <div>
                        <label class="block text-gray-300 mb-2">Damage Amount:</label>
                        <input type="number" id="damage-amount" class="w-full bg-gray-700 text-white px-3 py-2 rounded" min="1" value="1">
                    </div>
                    
                    <div>
                        <label class="block text-gray-300 mb-2">Damage Type (optional):</label>
                        <select id="damage-type" class="w-full bg-gray-700 text-white px-3 py-2 rounded">
                            <option value="">Select damage type...</option>
                            <option value="acid">Acid</option>
                            <option value="bludgeoning">Bludgeoning</option>
                            <option value="cold">Cold</option>
                            <option value="fire">Fire</option>
                            <option value="force">Force</option>
                            <option value="lightning">Lightning</option>
                            <option value="necrotic">Necrotic</option>
                            <option value="piercing">Piercing</option>
                            <option value="poison">Poison</option>
                            <option value="psychic">Psychic</option>
                            <option value="radiant">Radiant</option>
                            <option value="slashing">Slashing</option>
                            <option value="thunder">Thunder</option>
                        </select>
                    </div>
                    
                    <div class="flex items-center">
                        <input type="checkbox" id="critical-hit" class="form-checkbox h-5 w-5 text-red-600">
                        <label for="critical-hit" class="ml-2 text-gray-300">Critical Hit</label>
                    </div>
                    
                    <div class="flex justify-end space-x-2">
                        <button id="cancel-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                            Cancel
                        </button>
                        <button id="apply-btn" class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                            Apply Damage
                        </button>
                    </div>
                </div>
            `,
            width: 'max-w-md'
        });
        
        // Add event listeners
        const damageAmount = modal.querySelector('#damage-amount');
        const damageType = modal.querySelector('#damage-type');
        const criticalHit = modal.querySelector('#critical-hit');
        const cancelBtn = modal.querySelector('#cancel-btn');
        const applyBtn = modal.querySelector('#apply-btn');
        
        // Focus the damage amount input
        damageAmount.focus();
        
        cancelBtn.addEventListener('click', () => {
            this.app.ui.closeModal(modal.parentNode);
        });
        
        applyBtn.addEventListener('click', () => {
            const amount = parseInt(damageAmount.value);
            const type = damageType.value;
            const isCritical = criticalHit.checked;
            
            if (isNaN(amount) || amount < 1) {
                this.app.showAlert('Please enter a valid damage amount.');
                return;
            }
            
            // Apply damage
            this.applyDamage(creatureId, amount, type, isCritical);
            
            // Close modal
            this.app.ui.closeModal(modal.parentNode);
        });
        
        // Allow Enter key to submit
        damageAmount.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                applyBtn.click();
            }
        });
    }
    
    /**
     * Open the heal modal for a creature
     * @param {string} creatureId - The ID of the creature
     */
    openHealModal(creatureId) {
        const creature = this.app.combat.getCreatureById(creatureId);
        if (!creature) return;
        
        const modal = this.app.ui.createModal({
            title: `Apply Healing to ${creature.name}`,
            content: `
                <div class="space-y-4">
                    <div>
                        <label class="block text-gray-300 mb-2">Healing Amount:</label>
                        <input type="number" id="healing-amount" class="w-full bg-gray-700 text-white px-3 py-2 rounded" min="1" value="1">
                    </div>
                    
                    <div class="flex items-center">
                        <input type="checkbox" id="temp-hp" class="form-checkbox h-5 w-5 text-green-600">
                        <label for="temp-hp" class="ml-2 text-gray-300">Temporary HP</label>
                    </div>
                    
                    <div class="flex justify-end space-x-2">
                        <button id="cancel-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                            Cancel
                        </button>
                        <button id="apply-btn" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                            Apply Healing
                        </button>
                    </div>
                </div>
            `,
            width: 'max-w-md'
        });
        
        // Add event listeners
        const healingAmount = modal.querySelector('#healing-amount');
        const tempHp = modal.querySelector('#temp-hp');
        const cancelBtn = modal.querySelector('#cancel-btn');
        const applyBtn = modal.querySelector('#apply-btn');
        
        // Focus the healing amount input
        healingAmount.focus();
        
        cancelBtn.addEventListener('click', () => {
            this.app.ui.closeModal(modal.parentNode);
        });
        
        applyBtn.addEventListener('click', () => {
            const amount = parseInt(healingAmount.value);
            const isTemp = tempHp.checked;
            
            if (isNaN(amount) || amount < 1) {
                this.app.showAlert('Please enter a valid healing amount.');
                return;
            }
            
            // Apply healing
            this.applyHealing(creatureId, amount, isTemp);
            
            // Close modal
            this.app.ui.closeModal(modal.parentNode);
        });
        
        // Allow Enter key to submit
        healingAmount.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                applyBtn.click();
            }
        });
    }
    
    /**
     * Apply damage to a creature
     * @param {string} creatureId - The ID of the creature
     * @param {number} amount - The amount of damage
     * @param {string} [type=''] - The damage type
     * @param {boolean} [isCritical=false] - Whether the damage is critical
     */
    applyDamage(creatureId, amount, type = '', isCritical = false) {
        const creature = this.app.combat.getCreatureById(creatureId);
        if (!creature) return;
        
        // Apply damage
        this.app.combat.applyDamage(creatureId, amount, isCritical);
        
        // Check for concentration if the creature is concentrating
        if (creature.concentration && amount > 0) {
            this.app.combat.checkConcentration(creatureId, amount);
        }
    }
    
    /**
     * Apply healing to a creature
     * @param {string} creatureId - The ID of the creature
     * @param {number} amount - The amount of healing
     * @param {boolean} [isTemp=false] - Whether the healing is temporary HP
     */
    applyHealing(creatureId, amount, isTemp = false) {
        // Apply healing
        this.app.combat.applyHealing(creatureId, amount);
    }
}
