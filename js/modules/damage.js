/**
 * Damage Tracker for Jesster's Combat Tracker
 * Handles damage and healing
 */
class DamageTracker {
    constructor(app) {
        this.app = app;
        console.log("Damage Tracker initialized");
    }
    
    /**
     * Open the damage modal for a creature
     * @param {string} creatureId - The ID of the creature
     */
    openDamageModal(creatureId) {
        const creature = this.app.combat.getCreatureById(creatureId);
        if (!creature) return;
        
        const modal = this.app.ui.createModal({
            title: `Damage ${creature.name}`,
            content: `
                <div class="space-y-4">
                    <div>
                        <label class="block text-gray-300 mb-2">Amount:</label>
                        <input type="number" id="damage-amount" class="w-full bg-gray-700 text-white px-3 py-2 rounded" min="1" value="1">
                    </div>
                    
                    <div class="flex items-center">
                        <input type="checkbox" id="critical-hit" class="form-checkbox h-5 w-5 text-blue-600">
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
        const criticalHit = modal.querySelector('#critical-hit');
        const cancelBtn = modal.querySelector('#cancel-btn');
        const applyBtn = modal.querySelector('#apply-btn');
        
        cancelBtn.addEventListener('click', () => {
            this.app.ui.closeModal(modal.parentNode);
        });
        
        applyBtn.addEventListener('click', () => {
            const amount = parseInt(damageAmount.value) || 0;
            const isCritical = criticalHit.checked;
            
            if (amount <= 0) {
                this.app.showAlert('Please enter a valid damage amount.');
                return;
            }
            
            // Apply damage
            this.app.combat.applyDamage(creatureId, amount, isCritical);
            
            // Close the modal
            this.app.ui.closeModal(modal.parentNode);
        });
        
        // Focus the input
        damageAmount.focus();
    }
    
    /**
     * Open the heal modal for a creature
     * @param {string} creatureId - The ID of the creature
     */
    openHealModal(creatureId) {
        const creature = this.app.combat.getCreatureById(creatureId);
        if (!creature) return;
        
        const modal = this.app.ui.createModal({
            title: `Heal ${creature.name}`,
            content: `
                <div class="space-y-4">
                    <div>
                        <label class="block text-gray-300 mb-2">Amount:</label>
                        <input type="number" id="heal-amount" class="w-full bg-gray-700 text-white px-3 py-2 rounded" min="1" value="1">
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
        const healAmount = modal.querySelector('#heal-amount');
        const cancelBtn = modal.querySelector('#cancel-btn');
        const applyBtn = modal.querySelector('#apply-btn');
        
        cancelBtn.addEventListener('click', () => {
            this.app.ui.closeModal(modal.parentNode);
        });
        
        applyBtn.addEventListener('click', () => {
            const amount = parseInt(healAmount.value) || 0;
            
            if (amount <= 0) {
                this.app.showAlert('Please enter a valid healing amount.');
                return;
            }
            
            // Apply healing
            this.app.combat.applyHealing(creatureId, amount);
            
            // Close the modal
            this.app.ui.closeModal(modal.parentNode);
        });
        
        // Focus the input
        healAmount.focus();
    }
}
