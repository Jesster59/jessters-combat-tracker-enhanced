/**
 * Conditions Manager for Jesster's Combat Tracker
 * Handles condition tracking and effects
 */
class ConditionsManager {
    constructor(app) {
        this.app = app;
        this.conditions = [
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
            { name: 'Exhaustion', description: 'Exhaustion is measured in six levels. An effect can give a creature one or more levels of exhaustion, as specified in the effect\'s description. 1: Disadvantage on ability checks. 2: Speed halved. 3: Disadvantage on attack rolls and saving throws. 4: Hit point maximum halved. 5: Speed reduced to 0. 6: Death.' }
        ];
        console.log("Conditions Manager initialized");
    }
    
    /**
     * Initialize the conditions manager
     */
    async init() {
        // Load conditions from data file if available
        try {
            const response = await fetch('data/conditions.json');
            if (response.ok) {
                const data = await response.json();
                this.conditions = data;
            }
        } catch (error) {
            console.warn('Could not load conditions data file, using defaults:', error);
        }
    }
    
    /**
     * Get all conditions
     * @returns {Array} - All conditions
     */
    getAllConditions() {
        return this.conditions;
    }
    
    /**
     * Get a condition by name
     * @param {string} name - The name of the condition
     * @returns {Object|null} - The condition or null if not found
     */
    getCondition(name) {
        return this.conditions.find(c => c.name.toLowerCase() === name.toLowerCase()) || null;
    }
    
    /**
     * Add a condition to a creature
     * @param {string} creatureId - The ID of the creature
     * @param {string} conditionName - The name of the condition
     * @param {number} [rounds=null] - The number of rounds the condition lasts (null for indefinite)
     */
    addCondition(creatureId, conditionName, rounds = null) {
        const condition = this.getCondition(conditionName);
        if (!condition) {
            console.error(`Condition "${conditionName}" not found`);
            return;
        }
        
        this.app.combat.addCondition(creatureId, {
            name: condition.name,
            roundsLeft: rounds
        });
    }
    
    /**
     * Remove a condition from a creature
     * @param {string} creatureId - The ID of the creature
     * @param {string} conditionName - The name of the condition
     */
    removeCondition(creatureId, conditionName) {
        this.app.combat.removeCondition(creatureId, conditionName);
    }
    
    /**
     * Open the add condition modal
     * @param {string} creatureId - The ID of the creature
     */
    openAddConditionModal(creatureId) {
        const creature = this.app.combat.getCreatureById(creatureId);
        if (!creature) return;
        
        const modal = this.app.ui.createModal({
            title: `Add Condition to ${creature.name}`,
            content: `
                <div class="space-y-4">
                    <div class="grid grid-cols-2 gap-2">
                        ${this.conditions.map(condition => `
                            <label class="flex items-center space-x-2 p-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-600">
                                <input type="checkbox" class="condition-checkbox form-checkbox h-5 w-5 text-blue-600" value="${condition.name}">
                                <span>${condition.name}</span>
                            </label>
                        `).join('')}
                    </div>
                    
                    <div id="condition-description" class="p-3 bg-gray-700 rounded min-h-[100px] text-sm">
                        <p class="text-gray-400 text-center">Select a condition to see its description</p>
                    </div>
                    
                    <div>
                        <label class="block text-gray-300 mb-2">Duration (rounds):</label>
                        <input type="number" id="condition-duration" class="w-full bg-gray-700 text-white px-3 py-2 rounded" min="1" placeholder="Leave empty for indefinite">
                    </div>
                    
                    <div class="flex justify-end space-x-2">
                        <button class="cancel-btn bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                            Cancel
                        </button>
                        <button class="apply-btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Apply Conditions
                        </button>
                    </div>
                </div>
            `,
            width: 'max-w-2xl'
        });
        
        // Add event listeners
        const checkboxes = modal.querySelectorAll('.condition-checkbox');
        const descriptionDiv = modal.querySelector('#condition-description');
        const durationInput = modal.querySelector('#condition-duration');
        const cancelBtn = modal.querySelector('.cancel-btn');
        const applyBtn = modal.querySelector('.apply-btn');
        
        // Show description when hovering over a condition
        checkboxes.forEach(checkbox => {
            const conditionName = checkbox.value;
            const condition = this.getCondition(conditionName);
            
            checkbox.parentElement.addEventListener('mouseenter', () => {
                if (condition) {
                    descriptionDiv.innerHTML = `
                        <h4 class="font-semibold mb-1">${condition.name}</h4>
                        <p>${condition.description}</p>
                    `;
                }
            });
        });
        
        // Reset description when not hovering over any condition
        modal.querySelector('.grid').addEventListener('mouseleave', () => {
            descriptionDiv.innerHTML = `<p class="text-gray-400 text-center">Select a condition to see its description</p>`;
        });
        
        cancelBtn.addEventListener('click', () => {
            this.app.ui.closeModal(modal);
        });
        
        applyBtn.addEventListener('click', () => {
            const selectedConditions = Array.from(checkboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.value);
            
            if (selectedConditions.length === 0) {
                this.app.showAlert('Please select at least one condition to apply.');
                return;
            }
            
            const duration = durationInput.value ? parseInt(durationInput.value) : null;
            
            // Apply each selected condition
            selectedConditions.forEach(conditionName => {
                this.addCondition(creatureId, conditionName, duration);
            });
            
            this.app.ui.closeModal(modal);
        });
    }
    
    /**
     * Open the manage conditions modal
     * @param {string} creatureId - The ID of the creature
     */
    openManageConditionsModal(creatureId) {
        const creature = this.app.combat.getCreatureById(creatureId);
        if (!creature) return;
        
        const modal = this.app.ui.createModal({
            title: `Manage Conditions for ${creature.name}`,
            content: `
                <div class="space-y-4">
                    <div class="bg-gray-700 p-3 rounded">
                        <h4 class="font-semibold mb-2">Current Conditions:</h4>
                        <div id="current-conditions" class="flex flex-wrap gap-2">
                            ${creature.conditions.length === 0 ? 
                                '<p class="text-gray-400">No active conditions</p>' : 
                                creature.conditions.map(cond => {
                                    const condName = typeof cond === 'string' ? cond : cond.name;
                                    const rounds = typeof cond === 'string' ? null : cond.roundsLeft;
                                    return `
                                        <div class="condition-tag bg-yellow-600 text-yellow-100 px-2 py-1 rounded-full flex items-center">
                                            <span>${condName}${rounds !== null ? ` (${rounds})` : ''}</span>
                                            <button class="remove-condition-btn ml-2 text-yellow-200 hover:text-white" data-condition="${condName}">✕</button>
                                        </div>
                                    `;
                                }).join('')
                            }
                        </div>
                    </div>
                    
                    <div>
                        <h4 class="font-semibold mb-2">Add New Condition:</h4>
                        <div class="flex space-x-2">
                            <select id="new-condition" class="flex-1 bg-gray-700 text-white px-3 py-2 rounded">
                                <option value="">-- Select Condition --</option>
                                ${this.conditions.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
                            </select>
                            <input type="number" id="new-condition-duration" class="w-24 bg-gray-700 text-white px-3 py-2 rounded" min="1" placeholder="Rounds">
                            <button id="add-new-condition-btn" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                                Add
                            </button>
                        </div>
                    </div>
                    
                    <div id="condition-description" class="p-3 bg-gray-700 rounded min-h-[100px] text-sm">
                        <p class="text-gray-400 text-center">Select a condition to see its description</p>
                    </div>
                    
                    <div class="flex justify-end">
                        <button class="close-btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Close
                        </button>
                    </div>
                </div>
            `,
            width: 'max-w-lg'
        });
        
        // Add event listeners
        const newConditionSelect = modal.querySelector('#new-condition');
        const newConditionDuration = modal.querySelector('#new-condition-duration');
        const addNewConditionBtn = modal.querySelector('#add-new-condition-btn');
        const descriptionDiv = modal.querySelector('#condition-description');
        const closeBtn = modal.querySelector('.close-btn');
        
        // Show description when selecting a condition
        newConditionSelect.addEventListener('change', () => {
            const conditionName = newConditionSelect.value;
            const condition = this.getCondition(conditionName);
            
            if (condition) {
                descriptionDiv.innerHTML = `
                    <h4 class="font-semibold mb-1">${condition.name}</h4>
                    <p>${condition.description}</p>
                `;
            } else {
                descriptionDiv.innerHTML = `<p class="text-gray-400 text-center">Select a condition to see its description</p>`;
            }
        });
        
        // Add new condition
        addNewConditionBtn.addEventListener('click', () => {
            const conditionName = newConditionSelect.value;
            if (!conditionName) {
                this.app.showAlert('Please select a condition to add.');
                return;
            }
            
            const duration = newConditionDuration.value ? parseInt(newConditionDuration.value) : null;
            this.addCondition(creatureId, conditionName, duration);
            
            // Refresh the modal
            this.app.ui.closeModal(modal);
            this.openManageConditionsModal(creatureId);
        });
        
        // Remove condition
        modal.querySelectorAll('.remove-condition-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const conditionName = btn.dataset.condition;
                this.removeCondition(creatureId, conditionName);
                
                // Refresh the modal
                this.app.ui.closeModal(modal);
                this.openManageConditionsModal(creatureId);
            });
        });
        
        closeBtn.addEventListener('click', () => {
            this.app.ui.closeModal(modal);
        });
    }
}
