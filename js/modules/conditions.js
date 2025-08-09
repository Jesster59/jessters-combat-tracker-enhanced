/**
 * Conditions Manager for Jesster's Combat Tracker
 * Handles adding and managing conditions for creatures
 */
class ConditionsManager {
    constructor(app) {
        this.app = app;
        
        // Standard D&D 5e conditions
        this.standardConditions = [
            { name: 'Blinded', description: 'A blinded creature can\'t see and automatically fails any ability check that requires sight. Attack rolls against the creature have advantage, and the creature\'s attack rolls have disadvantage.' },
            { name: 'Charmed', description: 'A charmed creature can\'t attack the charmer or target the charmer with harmful abilities or magical effects. The charmer has advantage on any ability check to interact socially with the creature.' },
            { name: 'Deafened', description: 'A deafened creature can\'t hear and automatically fails any ability check that requires hearing.' },
            { name: 'Frightened', description: 'A frightened creature has disadvantage on ability checks and attack rolls while the source of its fear is within line of sight. The creature can\'t willingly move closer to the source of its fear.' },
            { name: 'Grappled', description: 'A grappled creature\'s speed becomes 0, and it can\'t benefit from any bonus to its speed. The condition ends if the grappler is incapacitated. The condition also ends if an effect removes the grappled creature from the reach of the grappler or grappling effect.' },
            { name: 'Incapacitated', description: 'An incapacitated creature can\'t take actions or reactions.' },
            { name: 'Invisible', description: 'An invisible creature is impossible to see without the aid of magic or a special sense. For the purpose of hiding, the creature is heavily obscured. The creature\'s location can be detected by any noise it makes or any tracks it leaves. Attack rolls against the creature have disadvantage, and the creature\'s attack rolls have advantage.' },
            { name: 'Paralyzed', description: 'A paralyzed creature is incapacitated and can\'t move or speak. The creature automatically fails Strength and Dexterity saving throws. Attack rolls against the creature have advantage. Any attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature.' },
            { name: 'Petrified', description: 'A petrified creature is transformed, along with any nonmagical object it is wearing or carrying, into a solid inanimate substance (usually stone). Its weight increases by a factor of ten, and it ceases aging. The creature is incapacitated, can\'t move or speak, and is unaware of its surroundings. Attack rolls against the creature have advantage. The creature automatically fails Strength and Dexterity saving throws. The creature has resistance to all damage. The creature is immune to poison and disease, although a poison or disease already in its system is suspended, not neutralized.' },
            { name: 'Poisoned', description: 'A poisoned creature has disadvantage on attack rolls and ability checks.' },
            { name: 'Prone', description: 'A prone creature\'s only movement option is to crawl, unless it stands up and thereby ends the condition. The creature has disadvantage on attack rolls. An attack roll against the creature has advantage if the attacker is within 5 feet of the creature. Otherwise, the attack roll has disadvantage.' },
            { name: 'Restrained', description: 'A restrained creature\'s speed becomes 0, and it can\'t benefit from any bonus to its speed. Attack rolls against the creature have advantage, and the creature\'s attack rolls have disadvantage. The creature has disadvantage on Dexterity saving throws.' },
            { name: 'Stunned', description: 'A stunned creature is incapacitated, can\'t move, and can speak only falteringly. The creature automatically fails Strength and Dexterity saving throws. Attack rolls against the creature have advantage.' },
            { name: 'Unconscious', description: 'An unconscious creature is incapacitated, can\'t move or speak, and is unaware of its surroundings. The creature drops whatever it\'s holding and falls prone. The creature automatically fails Strength and Dexterity saving throws. Attack rolls against the creature have advantage. Any attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature.' },
            { name: 'Exhaustion', description: 'Exhaustion is measured in six levels. An effect can give a creature one or more levels of exhaustion, as specified in the effect\'s description. 1: Disadvantage on ability checks. 2: Speed halved. 3: Disadvantage on attack rolls and saving throws. 4: Hit point maximum halved. 5: Speed reduced to 0. 6: Death.' },
            { name: 'Stable', description: 'A stable creature doesn\'t make death saving throws, even though it has 0 hit points, but it does remain unconscious. The creature stops being stable, and must start making death saving throws again, if it takes any damage. A stable creature that isn\'t healed regains 1 hit point after 1d4 hours.' },
            { name: 'Dead', description: 'A creature that has died can\'t be healed by normal means, though it can be brought back to life via magic.' }
        ];
        
        // Custom conditions (loaded from storage)
        this.customConditions = [];
        
        console.log("Conditions Manager initialized");
    }
    
    /**
     * Initialize the conditions manager
     */
    async init() {
        // Load custom conditions from storage
        this.loadCustomConditions();
        
        console.log("Conditions Manager initialized");
    }
    
    /**
     * Load custom conditions from storage
     */
    loadCustomConditions() {
        const customConditions = this.app.storage.loadData('customConditions', []);
        this.customConditions = customConditions;
    }
    
    /**
     * Save custom conditions to storage
     */
    saveCustomConditions() {
        this.app.storage.saveData('customConditions', this.customConditions);
    }
    
    /**
     * Get all conditions (standard + custom)
     * @returns {Array} - All conditions
     */
    getAllConditions() {
        return [...this.standardConditions, ...this.customConditions];
    }
    
    /**
     * Add a custom condition
     * @param {Object} condition - The condition to add
     */
    addCustomCondition(condition) {
        this.customConditions.push(condition);
        this.saveCustomConditions();
    }
    
    /**
     * Remove a custom condition
     * @param {string} name - The name of the condition to remove
     */
    removeCustomCondition(name) {
        this.customConditions = this.customConditions.filter(c => c.name !== name);
        this.saveCustomConditions();
    }
    
    /**
     * Open the add condition modal for a creature
     * @param {string} creatureId - The ID of the creature
     */
    openAddConditionModal(creatureId) {
        const creature = this.app.combat.getCreatureById(creatureId);
        if (!creature) return;
        
        const conditions = this.getAllConditions();
        
        const modal = this.app.ui.createModal({
            title: `Add Condition to ${creature.name}`,
            content: `
                <div class="space-y-4">
                    <div>
                        <label class="block text-gray-300 mb-2">Condition:</label>
                        <select id="condition-select" class="w-full bg-gray-700 text-white px-3 py-2 rounded">
                            <option value="">Select a condition...</option>
                            ${conditions.map(condition => `
                                <option value="${condition.name}">${condition.name}</option>
                            `).join('')}
                            <option value="custom">Custom Condition...</option>
                        </select>
                    </div>
                    
                    <div id="custom-condition-container" class="hidden">
                        <label class="block text-gray-300 mb-2">Custom Condition Name:</label>
                        <input type="text" id="custom-condition-name" class="w-full bg-gray-700 text-white px-3 py-2 rounded" placeholder="Enter condition name...">
                    </div>
                    
                    <div>
                        <label class="block text-gray-300 mb-2">Duration (rounds):</label>
                        <input type="number" id="condition-duration" class="w-full bg-gray-700 text-white px-3 py-2 rounded" min="1" placeholder="Leave blank for indefinite">
                        <p class="text-xs text-gray-400 mt-1">Leave blank for conditions that last until removed</p>
                    </div>
                    
                    <div id="condition-description" class="bg-gray-700 p-3 rounded text-sm hidden">
                        <p></p>
                    </div>
                    
                    <div class="flex justify-end space-x-2">
                        <button id="cancel-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                            Cancel
                        </button>
                        <button id="add-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Add Condition
                        </button>
                    </div>
                </div>
            `,
            width: 'max-w-md'
        });
        
        // Add event listeners
        const conditionSelect = modal.querySelector('#condition-select');
        const customConditionContainer = modal.querySelector('#custom-condition-container');
        const customConditionName = modal.querySelector('#custom-condition-name');
        const conditionDuration = modal.querySelector('#condition-duration');
        const conditionDescription = modal.querySelector('#condition-description');
        const cancelBtn = modal.querySelector('#cancel-btn');
        const addBtn = modal.querySelector('#add-btn');
        
        // Show/hide custom condition input and description
        conditionSelect.addEventListener('change', () => {
            const selectedValue = conditionSelect.value;
            
            if (selectedValue === 'custom') {
                customConditionContainer.classList.remove('hidden');
                conditionDescription.classList.add('hidden');
            } else if (selectedValue) {
                customConditionContainer.classList.add('hidden');
                
                // Show description for standard conditions
                const condition = conditions.find(c => c.name === selectedValue);
                if (condition && condition.description) {
                    conditionDescription.querySelector('p').textContent = condition.description;
                    conditionDescription.classList.remove('hidden');
                } else {
                    conditionDescription.classList.add('hidden');
                }
            } else {
                customConditionContainer.classList.add('hidden');
                conditionDescription.classList.add('hidden');
            }
        });
        
        cancelBtn.addEventListener('click', () => {
            this.app.ui.closeModal(modal.parentNode);
        });
        
        addBtn.addEventListener('click', () => {
            let conditionName = conditionSelect.value;
            
            // Handle custom condition
            if (conditionName === 'custom') {
                conditionName = customConditionName.value.trim();
                if (!conditionName) {
                    this.app.showAlert('Please enter a name for the custom condition.');
                    return;
                }
            } else if (!conditionName) {
                this.app.showAlert('Please select a condition.');
                return;
            }
            
            // Get duration
            const duration = conditionDuration.value.trim() ? parseInt(conditionDuration.value) : null;
            
            // Create condition object
            let condition;
            if (duration !== null) {
                condition = {
                    name: conditionName,
                    roundsLeft: duration
                };
            } else {
                condition = conditionName;
            }
            
            // Add condition to creature
            this.app.combat.addCondition(creatureId, condition);
            
            // Close modal
            this.app.ui.closeModal(modal.parentNode);
        });
    }
    
    /**
     * Open the manage conditions modal for a creature
     * @param {string} creatureId - The ID of the creature
     */
    openManageConditionsModal(creatureId) {
        const creature = this.app.combat.getCreatureById(creatureId);
        if (!creature || !creature.conditions || creature.conditions.length === 0) {
            this.app.showAlert(`${creature ? creature.name : 'Creature'} has no conditions to manage.`);
            return;
        }
        
        const modal = this.app.ui.createModal({
            title: `Manage Conditions for ${creature.name}`,
            content: `
                <div class="space-y-4">
                    <div>
                        <label class="block text-gray-300 mb-2">Current Conditions:</label>
                        <div id="conditions-list" class="space-y-2">
                            ${creature.conditions.map((condition, index) => {
                                const name = typeof condition === 'string' ? condition : condition.name;
                                const duration = typeof condition === 'object' && condition.roundsLeft !== null ? 
                                    `${condition.roundsLeft} rounds` : 'Until removed';
                                
                                return `
                                    <div class="condition-item bg-gray-700 p-2 rounded flex justify-between items-center">
                                        <div>
                                            <span class="font-semibold">${name}</span>
                                            <span class="text-sm text-gray-400">(${duration})</span>
                                        </div>
                                        <button class="remove-condition-btn bg-red-600 hover:bg-red-700 text-white text-xs py-1 px-2 rounded" data-index="${index}">
                                            Remove
                                        </button>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                    
                    <div class="flex justify-between">
                        <button id="add-condition-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Add Condition
                        </button>
                        <button id="close-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                            Close
                        </button>
                    </div>
                </div>
            `,
            width: 'max-w-md'
        });
        
        // Add event listeners
        const conditionsList = modal.querySelector('#conditions-list');
        const addConditionBtn = modal.querySelector('#add-condition-btn');
        const closeBtn = modal.querySelector('#close-btn');
        
        // Add event listeners for remove buttons
        conditionsList.querySelectorAll('.remove-condition-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                const condition = creature.conditions[index];
                const conditionName = typeof condition === 'string' ? condition : condition.name;
                
                // Remove the condition
                this.app.combat.removeCondition(creatureId, conditionName);
                
                // Close and reopen the modal to refresh
                this.app.ui.closeModal(modal.parentNode);
                this.openManageConditionsModal(creatureId);
            });
        });
        
        addConditionBtn.addEventListener('click', () => {
            // Close this modal and open the add condition modal
            this.app.ui.closeModal(modal.parentNode);
            this.openAddConditionModal(creatureId);
        });
        
        closeBtn.addEventListener('click', () => {
            this.app.ui.closeModal(modal.parentNode);
        });
    }
    
    /**
     * Open the custom conditions manager modal
     */
    openCustomConditionsManagerModal() {
        const modal = this.app.ui.createModal({
            title: 'Custom Conditions Manager',
            content: `
                <div class="space-y-4">
                    <div>
                        <label class="block text-gray-300 mb-2">Custom Conditions:</label>
                        <div id="custom-conditions-list" class="space-y-2 max-h-64 overflow-y-auto">
                            ${this.customConditions.length === 0 ? 
                                '<div class="text-gray-400 text-center py-4">No custom conditions added yet</div>' :
                                this.customConditions.map((condition, index) => `
                                    <div class="condition-item bg-gray-700 p-2 rounded flex justify-between items-center">
                                        <div>
                                            <span class="font-semibold">${condition.name}</span>
                                            ${condition.description ? `<p class="text-sm text-gray-400">${condition.description}</p>` : ''}
                                        </div>
                                        <button class="delete-condition-btn bg-red-600 hover:bg-red-700 text-white text-xs py-1 px-2 rounded" data-index="${index}">
                                            Delete
                                        </button>
                                    </div>
                                `).join('')
                            }
                        </div>
                    </div>
                    
                    <div class="border-t border-gray-700 pt-4">
                        <h3 class="font-semibold mb-2">Add New Custom Condition</h3>
                        <div class="space-y-2">
                            <div>
                                <label class="block text-gray-300 mb-1">Name:</label>
                                <input type="text" id="new-condition-name" class="w-full bg-gray-700 text-white px-3 py-2 rounded" placeholder="Enter condition name...">
                            </div>
                            <div>
                                <label class="block text-gray-300 mb-1">Description (optional):</label>
                                <textarea id="new-condition-description" class="w-full bg-gray-700 text-white px-3 py-2 rounded h-20" placeholder="Enter condition description..."></textarea>
                            </div>
                            <div class="flex justify-end">
                                <button id="add-custom-condition-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                    Add Condition
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex justify-end">
                        <button id="close-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                            Close
                        </button>
                    </div>
                </div>
            `,
            width: 'max-w-2xl'
        });
        
        // Add event listeners
        const customConditionsList = modal.querySelector('#custom-conditions-list');
        const newConditionName = modal.querySelector('#new-condition-name');
        const newConditionDescription = modal.querySelector('#new-condition-description');
        const addCustomConditionBtn = modal.querySelector('#add-custom-condition-btn');
        const closeBtn = modal.querySelector('#close-btn');
        
        // Add event listeners for delete buttons
        customConditionsList.querySelectorAll('.delete-condition-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                const condition = this.customConditions[index];
                
                this.app.showConfirm(`Are you sure you want to delete the custom condition "${condition.name}"?`, () => {
                    // Remove the condition
                    this.customConditions.splice(index, 1);
                    this.saveCustomConditions();
                    
                    // Close and reopen the modal to refresh
                    this.app.ui.closeModal(modal.parentNode);
                    this.openCustomConditionsManagerModal();
                });
            });
        });
        
        addCustomConditionBtn.addEventListener('click', () => {
            const name = newConditionName.value.trim();
            const description = newConditionDescription.value.trim();
            
            if (!name) {
                this.app.showAlert('Please enter a name for the custom condition.');
                return;
            }
            
            // Check if condition with this name already exists
            if (this.standardConditions.some(c => c.name.toLowerCase() === name.toLowerCase()) || 
                this.customConditions.some(c => c.name.toLowerCase() === name.toLowerCase())) {
                this.app.showAlert(`A condition named "${name}" already exists.`);
                return;
            }
            
            // Add the custom condition
            this.addCustomCondition({
                name: name,
                description: description || null
            });
            
            // Close and reopen the modal to refresh
            this.app.ui.closeModal(modal.parentNode);
            this.openCustomConditionsManagerModal();
        });
        
        closeBtn.addEventListener('click', () => {
            this.app.ui.closeModal(modal.parentNode);
        });
    }
}
