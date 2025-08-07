/**
 * Conditions Manager for Jesster's Combat Tracker
 * Handles applying, removing, and tracking conditions on combatants
 */
class ConditionsManager {
  constructor(app) {
    this.app = app;
    this.conditions = [
      { id: 'blinded', name: 'Blinded', icon: '👁️', description: 'A blinded creature can\'t see and automatically fails any ability check that requires sight.' },
      { id: 'charmed', name: 'Charmed', icon: '❤️', description: 'A charmed creature can\'t attack the charmer or target them with harmful abilities or magical effects.' },
      { id: 'deafened', name: 'Deafened', icon: '👂', description: 'A deafened creature can\'t hear and automatically fails any ability check that requires hearing.' },
      { id: 'frightened', name: 'Frightened', icon: '😨', description: 'A frightened creature has disadvantage on ability checks and attack rolls while the source of its fear is within line of sight.' },
      { id: 'grappled', name: 'Grappled', icon: '✋', description: 'A grappled creature\'s speed becomes 0, and it can\'t benefit from any bonus to its speed.' },
      { id: 'incapacitated', name: 'Incapacitated', icon: '💫', description: 'An incapacitated creature can\'t take actions or reactions.' },
      { id: 'invisible', name: 'Invisible', icon: '👻', description: 'An invisible creature is impossible to see without the aid of magic or a special sense.' },
      { id: 'paralyzed', name: 'Paralyzed', icon: '⚡', description: 'A paralyzed creature is incapacitated and can\'t move or speak.' },
      { id: 'petrified', name: 'Petrified', icon: '🗿', description: 'A petrified creature is transformed, along with any nonmagical object it is wearing or carrying, into a solid inanimate substance.' },
      { id: 'poisoned', name: 'Poisoned', icon: '☠️', description: 'A poisoned creature has disadvantage on attack rolls and ability checks.' },
      { id: 'prone', name: 'Prone', icon: '⬇️', description: 'A prone creature\'s only movement option is to crawl, unless it stands up and thereby ends the condition.' },
      { id: 'restrained', name: 'Restrained', icon: '🔒', description: 'A restrained creature\'s speed becomes 0, and it can\'t benefit from any bonus to its speed.' },
      { id: 'stunned', name: 'Stunned', icon: '💥', description: 'A stunned creature is incapacitated, can\'t move, and can speak only falteringly.' },
      { id: 'unconscious', name: 'Unconscious', icon: '💤', description: 'An unconscious creature is incapacitated, can\'t move or speak, and is unaware of its surroundings.' },
      { id: 'exhaustion', name: 'Exhaustion', icon: '😫', description: 'Exhaustion is measured in six levels. An effect can give a creature one or more levels of exhaustion.' },
      { id: 'concentration', name: 'Concentration', icon: '🧠', description: 'Some spells require you to maintain concentration in order to keep their magic active.' }
    ];
    console.log("Conditions.js loaded successfully");
  }
  
  /**
   * Get all available conditions
   * @returns {Array} - Array of condition objects
   */
  getAllConditions() {
    return this.conditions;
  }
  
  /**
   * Get a condition by ID
   * @param {string} id - The condition ID
   * @returns {Object|null} - The condition object or null if not found
   */
  getConditionById(id) {
    return this.conditions.find(condition => condition.id === id) || null;
  }
  
  /**
   * Get all conditions for a combatant
   * @param {string} combatantId - The ID of the combatant
   * @returns {Array} - Array of condition objects
   */
  getCombatantConditions(combatantId) {
    const card = document.getElementById(combatantId);
    if (!card) return [];
    
    const hiddenData = card.querySelector('.hidden-data');
    if (!hiddenData) return [];
    
    try {
      return JSON.parse(hiddenData.dataset.conditionsData || '[]');
    } catch (e) {
      console.error("Error parsing conditions data:", e);
      return [];
    }
  }
  
  /**
   * Add a condition to a combatant
   * @param {string} combatantId - The ID of the combatant
   * @param {string} conditionId - The ID of the condition to add
   * @param {number} [duration=0] - The duration in rounds (0 = indefinite)
   * @returns {boolean} - Whether the condition was successfully added
   */
  addConditionToCombatant(combatantId, conditionId, duration = 0) {
    const card = document.getElementById(combatantId);
    if (!card) return false;
    
    const condition = this.getConditionById(conditionId);
    if (!condition) return false;
    
    const hiddenData = card.querySelector('.hidden-data');
    if (!hiddenData) return false;
    
    // Get current conditions
    let conditions = [];
    try {
      conditions = JSON.parse(hiddenData.dataset.conditionsData || '[]');
    } catch (e) {
      console.error("Error parsing conditions data:", e);
    }
    
    // Check if condition already exists
    const existingIndex = conditions.findIndex(c => c.id === conditionId);
    if (existingIndex !== -1) {
      // Update duration if condition already exists
      conditions[existingIndex].duration = duration;
    } else {
      // Add new condition
      conditions.push({
        id: condition.id,
        name: condition.name,
        icon: condition.icon,
        startRound: this.app.state.roundNumber,
        duration: duration
      });
    }
    
    // Update hidden data
    hiddenData.dataset.conditionsData = JSON.stringify(conditions);
    
    // Update UI
    this.updateConditionsDisplay(card);
    
    // Log the action
    const name = card.querySelector('.combatant-name').textContent;
    const durationText = duration > 0 ? ` for ${duration} rounds` : '';
    this.app.logEvent(`${name} is now ${condition.name}${durationText}.`);
    
    return true;
  }
  
  /**
   * Remove a condition from a combatant
   * @param {string} combatantId - The ID of the combatant
   * @param {string} conditionId - The ID of the condition to remove
   * @returns {boolean} - Whether the condition was successfully removed
   */
  removeConditionFromCombatant(combatantId, conditionId) {
    const card = document.getElementById(combatantId);
    if (!card) return false;
    
    const hiddenData = card.querySelector('.hidden-data');
    if (!hiddenData) return false;
    
    // Get current conditions
    let conditions = [];
    try {
      conditions = JSON.parse(hiddenData.dataset.conditionsData || '[]');
    } catch (e) {
      console.error("Error parsing conditions data:", e);
      return false;
    }
    
    // Find the condition
    const conditionIndex = conditions.findIndex(c => c.id === conditionId);
    if (conditionIndex === -1) return false;
    
    // Get condition name for logging
    const conditionName = conditions[conditionIndex].name;
    
    // Remove the condition
    conditions.splice(conditionIndex, 1);
    
    // Update hidden data
    hiddenData.dataset.conditionsData = JSON.stringify(conditions);
    
    // Update UI
    this.updateConditionsDisplay(card);
    
    // Log the action
    const name = card.querySelector('.combatant-name').textContent;
    this.app.logEvent(`${name} is no longer ${conditionName}.`);
    
    return true;
  }
  
  /**
   * Update the conditions display for a combatant
   * @param {HTMLElement} card - The combatant card element
   */
  updateConditionsDisplay(card) {
    if (!card) return;
    
    // Check if conditions display already exists
    let conditionsDisplay = card.querySelector('.conditions-display');
    if (!conditionsDisplay) {
      // Create conditions display
      conditionsDisplay = document.createElement('div');
      conditionsDisplay.className = 'conditions-display flex flex-wrap gap-1 mt-2';
      
      // Insert after HP bar
      const hpSection = card.querySelector('.hp-input').parentNode;
      hpSection.parentNode.insertBefore(conditionsDisplay, hpSection.nextSibling);
    }
    
    // Get conditions
    const conditions = this.getCombatantConditions(card.id);
    
    // Clear the display
    conditionsDisplay.innerHTML = '';
    
    // Add each condition
    conditions.forEach(condition => {
      const conditionTag = document.createElement('div');
      conditionTag.className = 'condition-tag bg-yellow-600 text-black text-xs font-semibold px-2 py-0.5 rounded-full flex items-center';
      
      const durationText = condition.duration > 0 ? ` (${condition.duration})` : '';
      conditionTag.innerHTML = `
        <span class="mr-1">${condition.icon || ''}</span>
        <span>${condition.name}${durationText}</span>
        <button class="remove-condition-btn ml-1 text-black hover:text-red-800">×</button>
      `;
      
      // Add event listener to remove button
      conditionTag.querySelector('.remove-condition-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeConditionFromCombatant(card.id, condition.id);
      });
      
      conditionsDisplay.appendChild(conditionTag);
    });
    
    // Hide the display if no conditions
    if (conditions.length === 0) {
      conditionsDisplay.classList.add('hidden');
    } else {
      conditionsDisplay.classList.remove('hidden');
    }
  }
  
  /**
   * Check for expired conditions at the end of a turn
   */
  checkExpiredConditions() {
    // Get all combatants
    const allCombatants = [
      ...Array.from(document.querySelectorAll('#heroes-list .combatant-card')),
      ...Array.from(document.querySelectorAll('#monsters-list .combatant-card'))
    ];
    
    allCombatants.forEach(card => {
      const hiddenData = card.querySelector('.hidden-data');
      if (!hiddenData) return;
      
      // Get current conditions
      let conditions = [];
      try {
        conditions = JSON.parse(hiddenData.dataset.conditionsData || '[]');
      } catch (e) {
        console.error("Error parsing conditions data:", e);
        return;
      }
      
      // Check each condition
      let updated = false;
      conditions = conditions.filter(condition => {
        if (condition.duration > 0) {
          condition.duration--;
          if (condition.duration === 0) {
            // Condition has expired
            const name = card.querySelector('.combatant-name').textContent;
            this.app.logEvent(`${name} is no longer ${condition.name} (expired).`);
            updated = true;
            return false;
          }
        }
        return true;
      });
      
      if (updated) {
        // Update hidden data
        hiddenData.dataset.conditionsData = JSON.stringify(conditions);
        
        // Update UI
        this.updateConditionsDisplay(card);
      }
    });
  }
  
  /**
   * Open the conditions modal for a combatant
   * @param {string} combatantId - The ID of the combatant
   */
  openConditionsModal(combatantId) {
    const card = document.getElementById(combatantId);
    if (!card) return;
    
    const name = card.querySelector('.combatant-name').textContent;
    const currentConditions = this.getCombatantConditions(combatantId);
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 flex items-center justify-center z-50 p-4';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    
    modal.innerHTML = `
      <div class="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-lg w-full mx-auto">
        <h3 class="text-xl font-bold text-yellow-400 mb-4">Manage Conditions: ${name}</h3>
        
        <div class="mb-4">
          <h4 class="font-semibold text-gray-300 mb-2">Current Conditions:</h4>
          <div id="current-conditions-list" class="space-y-2">
            ${currentConditions.length === 0 ? 
              '<p class="text-gray-500">No conditions applied.</p>' : 
              currentConditions.map(condition => `
                <div class="flex items-center justify-between bg-gray-700 p-2 rounded">
                  <div class="flex items-center">
                    <span class="mr-2">${condition.icon || ''}</span>
                    <span>${condition.name}</span>
                    ${condition.duration > 0 ? `<span class="text-xs text-gray-400 ml-2">(${condition.duration} rounds)</span>` : ''}
                  </div>
                  <button class="remove-condition-btn text-red-400 hover:text-red-300" data-condition-id="${condition.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              `).join('')
            }
          </div>
        </div>
        
        <div class="mb-4">
          <h4 class="font-semibold text-gray-300 mb-2">Add Condition:</h4>
          <div class="flex space-x-2">
            <select id="condition-select" class="bg-gray-700 rounded px-2 py-1 text-white flex-grow">
              <option value="">-- Select Condition --</option>
              ${this.conditions.map(condition => `
                <option value="${condition.id}">${condition.icon || ''} ${condition.name}</option>
              `).join('')}
            </select>
            <input type="number" id="condition-duration" class="bg-gray-700 rounded px-2 py-1 text-white w-20" placeholder="Rounds" min="0">
            <button id="add-condition-btn" class="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded">
              Add
            </button>
          </div>
          <p id="condition-description" class="text-sm text-gray-400 mt-2"></p>
        </div>
        
        <div class="flex justify-end mt-4">
          <button id="conditions-close-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            Close
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('conditions-close-btn').addEventListener('click', () => {
      modal.remove();
    });
    
    // Add condition button
    document.getElementById('add-condition-btn').addEventListener('click', () => {
      const conditionId = document.getElementById('condition-select').value;
      if (!conditionId) return;
      
      const duration = parseInt(document.getElementById('condition-duration').value) || 0;
      this.addConditionToCombatant(combatantId, conditionId, duration);
      
      // Update the current conditions list
      this.updateCurrentConditionsList(combatantId);
    });
    
    // Remove condition buttons
    document.querySelectorAll('.remove-condition-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const conditionId = btn.dataset.conditionId;
        this.removeConditionFromCombatant(combatantId, conditionId);
        
        // Update the current conditions list
        this.updateCurrentConditionsList(combatantId);
      });
    });
    
    // Show condition description when selected
    document.getElementById('condition-select').addEventListener('change', (e) => {
      const conditionId = e.target.value;
      const descriptionElement = document.getElementById('condition-description');
      
      if (conditionId) {
        const condition = this.getConditionById(conditionId);
        if (condition) {
          descriptionElement.textContent = condition.description;
        } else {
          descriptionElement.textContent = '';
        }
      } else {
        descriptionElement.textContent = '';
      }
    });
  }
  
  /**
   * Update the current conditions list in the modal
   * @param {string} combatantId - The ID of the combatant
   */
  updateCurrentConditionsList(combatantId) {
    const listElement = document.getElementById('current-conditions-list');
    if (!listElement) return;
    
    const currentConditions = this.getCombatantConditions(combatantId);
    
    if (currentConditions.length === 0) {
      listElement.innerHTML = '<p class="text-gray-500">No conditions applied.</p>';
      return;
    }
    
    listElement.innerHTML = currentConditions.map(condition => `
      <div class="flex items-center justify-between bg-gray-700 p-2 rounded">
        <div class="flex items-center">
          <span class="mr-2">${condition.icon || ''}</span>
          <span>${condition.name}</span>
          ${condition.duration > 0 ? `<span class="text-xs text-gray-400 ml-2">(${condition.duration} rounds)</span>` : ''}
        </div>
        <button class="remove-condition-btn text-red-400 hover:text-red-300" data-condition-id="${condition.id}">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    `).join('');
    
    // Re-add event listeners
    document.querySelectorAll('.remove-condition-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const conditionId = btn.dataset.conditionId;
        this.removeConditionFromCombatant(combatantId, conditionId);
        
        // Update the current conditions list
        this.updateCurrentConditionsList(combatantId);
      });
    });
  }
  
  /**
   * Add conditions button to a combatant card
   * @param {HTMLElement} card - The combatant card element
   */
  addConditionsButtonToCombatantCard(card) {
    if (!card) return;
    
    // Check if conditions button already exists
    if (card.querySelector('.conditions-btn')) return;
    
    // Create the conditions button
    const conditionsBtn = document.createElement('button');
    conditionsBtn.className = 'conditions-btn text-gray-400 hover:text-yellow-400 ml-1';
    conditionsBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    `;
    
    // Add event listener
    conditionsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.openConditionsModal(card.id);
    });
    
    // Find the appropriate place to insert the button
    const cardHeader = card.querySelector('.combatant-header') || card.querySelector('.combatant-name').parentNode;
    cardHeader.appendChild(conditionsBtn);
  }
  
  /**
   * Open the group conditions modal
   */
  openGroupConditionsModal() {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 flex items-center justify-center z-50 p-4';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    
    modal.innerHTML = `
      <div class="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-lg w-full mx-auto">
        <h3 class="text-xl font-bold text-yellow-400 mb-4">Apply Group Condition</h3>
        
        <div class="mb-4">
          <label class="block text-gray-300 mb-2">Condition:</label>
          <select id="group-condition-select" class="bg-gray-700 w-full rounded px-2 py-1 text-white">
            <option value="">-- Select Condition --</option>
            ${this.conditions.map(condition => `
              <option value="${condition.id}">${condition.icon || ''} ${condition.name}</option>
            `).join('')}
          </select>
          <p id="group-condition-description" class="text-sm text-gray-400 mt-2"></p>
        </div>
        
        <div class="mb-4">
          <label class="block text-gray-300 mb-2">Duration (rounds):</label>
          <input type="number" id="group-condition-duration" class="bg-gray-700 w-full rounded px-2 py-1 text-white" value="0" min="0">
          <p class="text-sm text-gray-400 mt-1">0 = indefinite</p>
        </div>
        
        <div class="mb-4">
          <label class="block text-gray-300 mb-2">Apply to:</label>
          <div class="flex space-x-4">
            <label class="inline-flex items-center">
              <input type="checkbox" id="apply-to-heroes" class="mr-2" checked>
              <span class="text-blue-300">Heroes</span>
            </label>
            <label class="inline-flex items-center">
              <input type="checkbox" id="apply-to-monsters" class="mr-2" checked>
              <span class="text-red-300">Monsters</span>
            </label>
          </div>
        </div>
        
        <div class="flex justify-end mt-4 space-x-2">
          <button id="group-condition-cancel-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            Cancel
          </button>
          <button id="group-condition-apply-btn" class="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
            Apply Condition
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('group-condition-cancel-btn').addEventListener('click', () => {
      modal.remove();
    });
    
    // Show condition description when selected
    document.getElementById('group-condition-select').addEventListener('change', (e) => {
      const conditionId = e.target.value;
      const descriptionElement = document.getElementById('group-condition-description');
      
      if (conditionId) {
        const condition = this.getConditionById(conditionId);
        if (condition) {
          descriptionElement.textContent = condition.description;
        } else {
          descriptionElement.textContent = '';
        }
      } else {
        descriptionElement.textContent = '';
      }
    });
    
    // Apply group condition button
    document.getElementById('group-condition-apply-btn').addEventListener('click', () => {
      const conditionId = document.getElementById('group-condition-select').value;
      if (!conditionId) {
        this.app.showAlert('Please select a condition.', 'Error');
        return;
      }
      
      const duration = parseInt(document.getElementById('group-condition-duration').value) || 0;
      const applyToHeroes = document.getElementById('apply-to-heroes').checked;
      const applyToMonsters = document.getElementById('apply-to-monsters').checked;
      
      // Get all applicable combatants
      const combatants = [];
      
      if (applyToHeroes) {
        const heroes = Array.from(document.querySelectorAll('#heroes-list .combatant-card'));
        combatants.push(...heroes);
      }
      
      if (applyToMonsters) {
        const monsters = Array.from(document.querySelectorAll('#monsters-list .combatant-card'));
        combatants.push(...monsters);
      }
      
      if (combatants.length === 0) {
        this.app.showAlert('No combatants selected.', 'Error');
        return;
      }
      
      // Apply condition to all combatants
      const condition = this.getConditionById(conditionId);
      this.app.logEvent(`Applying ${condition.name} to multiple combatants...`);
      
      combatants.forEach(combatant => {
        this.addConditionToCombatant(combatant.id, conditionId, duration);
      });
      
      modal.remove();
    });
  }
  
  /**
   * Add group conditions button to the combat controls
   */
  addGroupConditionsButton() {
    // Add a button to the combat controls section
    const combatControls = document.querySelector('.md\\:col-span-2.flex.flex-wrap.justify-center.gap-4');
    if (!combatControls) return;
    
    const groupConditionsBtn = document.createElement('button');
    groupConditionsBtn.id = 'group-conditions-btn';
    groupConditionsBtn.className = 'bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300';
    groupConditionsBtn.textContent = 'Group Conditions';
    groupConditionsBtn.addEventListener('click', () => this.openGroupConditionsModal());
    
    combatControls.appendChild(groupConditionsBtn);
  }
}
