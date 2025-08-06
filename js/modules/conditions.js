/**
 * Conditions Manager for Jesster's Combat Tracker
 * Handles condition tracking and effects
 */
class ConditionsManager {
  constructor(app) {
    this.app = app;
    this.standardConditions = [
      { id: 'blinded', name: 'Blinded', icon: '👁️‍🗨️', description: 'A blinded creature can\'t see and automatically fails any ability check that requires sight.' },
      { id: 'charmed', name: 'Charmed', icon: '💕', description: 'A charmed creature can\'t attack the charmer or target them with harmful abilities or magical effects.' },
      { id: 'deafened', name: 'Deafened', icon: '🔇', description: 'A deafened creature can\'t hear and automatically fails any ability check that requires hearing.' },
      { id: 'frightened', name: 'Frightened', icon: '😨', description: 'A frightened creature has disadvantage on ability checks and attack rolls while the source of its fear is within line of sight.' },
      { id: 'grappled', name: 'Grappled', icon: '✋', description: 'A grappled creature\'s speed becomes 0, and it can\'t benefit from any bonus to its speed.' },
      { id: 'incapacitated', name: 'Incapacitated', icon: '💫', description: 'An incapacitated creature can\'t take actions or reactions.' },
      { id: 'invisible', name: 'Invisible', icon: '👻', description: 'An invisible creature is impossible to see without the aid of magic or a special sense.' },
      { id: 'paralyzed', name: 'Paralyzed', icon: '⚡', description: 'A paralyzed creature is incapacitated and can\'t move or speak.' },
      { id: 'petrified', name: 'Petrified', icon: '🗿', description: 'A petrified creature is transformed, along with any nonmagical object it is wearing or carrying, into a solid inanimate substance.' },
      { id: 'poisoned', name: 'Poisoned', icon: '☠️', description: 'A poisoned creature has disadvantage on attack rolls and ability checks.' },
      { id: 'prone', name: 'Prone', icon: '🛌', description: 'A prone creature\'s only movement option is to crawl, unless it stands up and thereby ends the condition.' },
      { id: 'restrained', name: 'Restrained', icon: '🔒', description: 'A restrained creature\'s speed becomes 0, and it can\'t benefit from any bonus to its speed.' },
      { id: 'stunned', name: 'Stunned', icon: '💫', description: 'A stunned creature is incapacitated, can\'t move, and can speak only falteringly.' },
      { id: 'unconscious', name: 'Unconscious', icon: '💤', description: 'An unconscious creature is incapacitated, can\'t move or speak, and is unaware of its surroundings.' },
      { 
        id: 'exhaustion', 
        name: 'Exhaustion', 
        icon: '😩', 
        description: 'Exhaustion is measured in six levels with cumulative effects:\n' +
          '1: Disadvantage on ability checks\n' +
          '2: Speed halved\n' +
          '3: Disadvantage on attack rolls and saving throws\n' +
          '4: Hit point maximum halved\n' +
          '5: Speed reduced to 0\n' +
          '6: Death',
        hasLevels: true,
        maxLevel: 6
      },
      { id: 'concentration', name: 'Concentration', icon: '🧠', description: 'Maintaining concentration on a spell or ability.' }
    ];
    
    this.customConditions = [];
  }
  
  getAllConditions() {
    return [...this.standardConditions, ...this.customConditions];
  }
  
  getConditionById(id) {
    return this.getAllConditions().find(condition => condition.id === id);
  }
  
  addConditionToCombatant(combatantId, conditionId, duration = null, level = 1) {
    const combatant = document.getElementById(combatantId);
    if (!combatant) return false;
    
    const condition = this.getConditionById(conditionId);
    if (!condition) return false;
    
    // Get or create hidden data element
    let hiddenData = combatant.querySelector('.hidden-data');
    if (!hiddenData) {
      hiddenData = document.createElement('div');
      hiddenData.className = 'hidden-data hidden';
      hiddenData.dataset.conditionsData = '[]';
      combatant.appendChild(hiddenData);
    }
    
    // Get current conditions
    let conditions = [];
    try {
      conditions = JSON.parse(hiddenData.dataset.conditionsData || '[]');
    } catch (e) {
      conditions = [];
    }
    
    // Check if condition already exists
    const existingIndex = conditions.findIndex(c => c.id === conditionId);
    
    if (existingIndex >= 0) {
      // Update existing condition
      if (condition.hasLevels) {
        // For conditions with levels (like exhaustion), update the level
        const currentLevel = conditions[existingIndex].level || 1;
        const newLevel = Math.min(condition.maxLevel || 6, currentLevel + (level || 1));
        
        conditions[existingIndex] = {
          ...conditions[existingIndex],
          level: newLevel,
          name: `${condition.name} (Level ${newLevel})`
        };
      } else {
        // For regular conditions, update the duration
        conditions[existingIndex] = {
          ...conditions[existingIndex],
          duration: duration,
          expiresAt: duration ? this.app.state.roundNumber + duration : null
        };
      }
    } else {
      // Add new condition
      if (condition.hasLevels) {
        // For conditions with levels (like exhaustion)
        conditions.push({
          id: conditionId,
          name: `${condition.name} (Level ${level})`,
          icon: condition.icon,
          addedAt: this.app.state.roundNumber,
          level: level || 1,
          hasLevels: true,
          maxLevel: condition.maxLevel || 6
        });
      } else {
        // For regular conditions
        conditions.push({
          id: conditionId,
          name: condition.name,
          icon: condition.icon,
          addedAt: this.app.state.roundNumber,
          duration: duration,
          expiresAt: duration ? this.app.state.roundNumber + duration : null
        });
      }
    }
    
    // Save conditions back to hidden data
    hiddenData.dataset.conditionsData = JSON.stringify(conditions);
    
    // Update visual indicator
    this.updateConditionIndicators(combatant);
    
    // Log the event
    const combatantName = combatant.querySelector('.combatant-name')?.textContent || 'Unknown';
    const existingCondition = existingIndex >= 0;
    
    if (condition.hasLevels) {
      const level = conditions.find(c => c.id === conditionId)?.level || 1;
      this.app.logEvent(`${existingCondition ? 'Updated' : 'Added'} ${condition.name} (Level ${level}) to ${combatantName}.`);
    } else {
      this.app.logEvent(`${existingCondition ? 'Updated' : 'Added'} condition "${condition.name}" to ${combatantName}.`);
    }
    
    return true;
  }
  
  removeConditionFromCombatant(combatantId, conditionId, decreaseLevel = false) {
    const combatant = document.getElementById(combatantId);
    if (!combatant) return false;
    
    // Get hidden data element
    const hiddenData = combatant.querySelector('.hidden-data');
    if (!hiddenData) return false;
    
    // Get current conditions
    let conditions = [];
    try {
      conditions = JSON.parse(hiddenData.dataset.conditionsData || '[]');
    } catch (e) {
      return false;
    }
    
    // Find the condition
    const conditionIndex = conditions.findIndex(c => c.id === conditionId);
    if (conditionIndex === -1) return false;
    
    const condition = conditions[conditionIndex];
    const combatantName = combatant.querySelector('.combatant-name')?.textContent || 'Unknown';
    
    // Check if it's a leveled condition and we're just decreasing the level
    if (decreaseLevel && condition.hasLevels && condition.level > 1) {
      // Decrease the level
      condition.level--;
      condition.name = `${this.getConditionById(conditionId).name} (Level ${condition.level})`;
      
      // Save conditions back to hidden data
      hiddenData.dataset.conditionsData = JSON.stringify(conditions);
      
      // Update visual indicator
      this.updateConditionIndicators(combatant);
      
      // Log the event
      this.app.logEvent(`Decreased ${condition.name} on ${combatantName} to level ${condition.level}.`);
      
      return true;
    } else {
      // Remove the condition completely
      conditions.splice(conditionIndex, 1);
      
      // Save conditions back to hidden data
      hiddenData.dataset.conditionsData = JSON.stringify(conditions);
      
      // Update visual indicator
      this.updateConditionIndicators(combatant);
      
      // Log the event
      const conditionObj = this.getConditionById(conditionId);
      this.app.logEvent(`Removed condition "${conditionObj?.name || conditionId}" from ${combatantName}.`);
      
      return true;
    }
  }
  
  updateConditionIndicators(combatant) {
    // Get hidden data element
    const hiddenData = combatant.querySelector('.hidden-data');
    if (!hiddenData) return;
    
    // Get current conditions
    let conditions = [];
    try {
      conditions = JSON.parse(hiddenData.dataset.conditionsData || '[]');
    } catch (e) {
      conditions = [];
    }
    
    // Find or create conditions container
    let conditionsContainer = combatant.querySelector('.conditions-container');
    if (!conditionsContainer) {
      conditionsContainer = document.createElement('div');
      conditionsContainer.className = 'conditions-container flex flex-wrap gap-1 mt-1';
      
      // Insert after combatant name
      const nameElement = combatant.querySelector('.combatant-name');
      if (nameElement && nameElement.parentNode) {
        nameElement.parentNode.appendChild(conditionsContainer);
      }
    }
    
    // Clear existing indicators
    conditionsContainer.innerHTML = '';
    
    // Add indicators for each condition
    conditions.forEach(condition => {
      const indicator = document.createElement('span');
      indicator.className = 'condition-indicator bg-yellow-600 text-black text-xs font-semibold px-2 py-0.5 rounded-full cursor-pointer';
      
      if (condition.hasLevels) {
        indicator.title = `${condition.name}`;
        indicator.textContent = `${condition.icon} ${condition.name}`;
      } else {
        indicator.title = `${condition.name}${condition.duration ? ` (${condition.duration} rounds)` : ''}`;
        indicator.textContent = `${condition.icon} ${condition.name}`;
      }
      
      indicator.dataset.conditionId = condition.id;
      
      // Add click handler to remove condition
      indicator.addEventListener('click', (e) => {
        e.stopPropagation();
        this.showConditionMenu(combatant.id, condition.id);
      });
      
      conditionsContainer.appendChild(indicator);
    });
  }
  
  showConditionMenu(combatantId, conditionId) {
    const combatant = document.getElementById(combatantId);
    if (!combatant) return;
    
    const condition = this.getConditionById(conditionId);
    if (!condition) return;
    
    // Get the current condition data from the combatant
    const hiddenData = combatant.querySelector('.hidden-data');
    if (!hiddenData) return;
    
    let conditions = [];
    try {
      conditions = JSON.parse(hiddenData.dataset.conditionsData || '[]');
    } catch (e) {
      return;
    }
    
    const currentCondition = conditions.find(c => c.id === conditionId);
    if (!currentCondition) return;
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4';
    
    // Different UI for exhaustion vs regular conditions
    if (condition.hasLevels) {
      modal.innerHTML = `
        <div class="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-lg w-full mx-auto">
          <h3 class="text-xl font-bold text-yellow-400 mb-4">${condition.icon} ${condition.name}</h3>
          <p class="text-gray-300 mb-4">${condition.description}</p>
          <div class="mb-4">
            <label class="block text-gray-300 mb-2">Current Level: ${currentCondition.level} of ${condition.maxLevel}</label>
            <div class="flex items-center space-x-2">
              <button class="decrease-btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded">-</button>
              <div class="flex-1 bg-gray-700 h-4 rounded-full">
                <div class="bg-red-600 h-4 rounded-full" style="width: ${(currentCondition.level / condition.maxLevel) * 100}%"></div>
              </div>
              <button class="increase-btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded">+</button>
            </div>
          </div>
          <div class="flex justify-end gap-2">
            <button class="remove-btn bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Remove Completely</button>
            <button class="close-btn bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Close</button>
          </div>
        </div>
      `;
    } else {
      modal.innerHTML = `
        <div class="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-lg w-full mx-auto">
          <h3 class="text-xl font-bold text-yellow-400 mb-4">${condition.icon} ${condition.name}</h3>
          <p class="text-gray-300 mb-4">${condition.description}</p>
          <div class="mb-4">
            <label class="block text-gray-300 mb-2">Duration (rounds):</label>
            <input type="number" id="condition-duration" class="bg-gray-700 w-full rounded px-2 py-1 text-white" min="1" value="${currentCondition.duration || ''}" placeholder="Leave empty for indefinite">
          </div>
          <div class="flex justify-end gap-2">
            <button class="update-btn bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Update</button>
            <button class="remove-btn bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Remove</button>
            <button class="close-btn bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Close</button>
          </div>
        </div>
      `;
    }
    
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.close-btn').addEventListener('click', () => {
      modal.remove();
    });
    
    if (condition.hasLevels) {
      // For exhaustion, add level increase/decrease buttons
      modal.querySelector('.decrease-btn').addEventListener('click', () => {
        this.removeConditionFromCombatant(combatantId, conditionId, true);
        modal.remove();
      });
      
      modal.querySelector('.increase-btn').addEventListener('click', () => {
        if (currentCondition.level < condition.maxLevel) {
          this.addConditionToCombatant(combatantId, conditionId, null, 1);
          modal.remove();
        }
      });
      
      modal.querySelector('.remove-btn').addEventListener('click', () => {
        this.removeConditionFromCombatant(combatantId, conditionId);
        modal.remove();
      });
    } else {
      // For regular conditions
      const updateBtn = modal.querySelector('.update-btn');
      if (updateBtn) {
        updateBtn.addEventListener('click', () => {
          const durationInput = modal.querySelector('#condition-duration');
          const duration = durationInput ? parseInt(durationInput.value) : null;
          
          this.addConditionToCombatant(combatantId, conditionId, duration);
          modal.remove();
        });
      }
      
      modal.querySelector('.remove-btn').addEventListener('click', () => {
        this.removeConditionFromCombatant(combatantId, conditionId);
        modal.remove();
      });
    }
  }
  
  showAddConditionModal(combatantId) {
    const combatant = document.getElementById(combatantId);
    if (!combatant) return;
    
    const combatantName = combatant.querySelector('.combatant-name')?.textContent || 'Unknown';
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-lg w-full mx-auto">
        <h3 class="text-xl font-bold text-yellow-400 mb-4">Add Condition to ${combatantName}</h3>
        <div class="mb-4">
          <label class="block text-gray-300 mb-2">Condition:</label>
          <select id="condition-select" class="bg-gray-700 w-full rounded px-2 py-1 text-white">
            ${this.getAllConditions().map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('')}
          </select>
        </div>
        <div id="duration-container" class="mb-4">
          <label class="block text-gray-300 mb-2">Duration (rounds, optional):</label>
          <input type="number" id="condition-duration" class="bg-gray-700 w-full rounded px-2 py-1 text-white" min="1" placeholder="Leave empty for indefinite">
        </div>
        <div id="level-container" class="mb-4 hidden">
          <label class="block text-gray-300 mb-2">Level:</label>
          <input type="number" id="condition-level" class="bg-gray-700 w-full rounded px-2 py-1 text-white" min="1" max="6" value="1">
        </div>
        <div class="flex justify-end gap-2">
          <button class="add-btn bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Add</button>
          <button class="cancel-btn bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Cancel</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    const conditionSelect = modal.querySelector('#condition-select');
    const durationContainer = modal.querySelector('#duration-container');
    const levelContainer = modal.querySelector('#level-container');
    
    // Show/hide appropriate fields based on condition type
    conditionSelect.addEventListener('change', () => {
      const selectedCondition = this.getConditionById(conditionSelect.value);
      if (selectedCondition && selectedCondition.hasLevels) {
        durationContainer.classList.add('hidden');
        levelContainer.classList.remove('hidden');
      } else {
        durationContainer.classList.remove('hidden');
        levelContainer.classList.add('hidden');
      }
    });
    
    // Initial check
    const initialCondition = this.getConditionById(conditionSelect.value);
    if (initialCondition && initialCondition.hasLevels) {
      durationContainer.classList.add('hidden');
      levelContainer.classList.remove('hidden');
    }
    
    modal.querySelector('.cancel-btn').addEventListener('click', () => {
      modal.remove();
    });
    
    modal.querySelector('.add-btn').addEventListener('click', () => {
      const conditionId = conditionSelect.value;
      const selectedCondition = this.getConditionById(conditionId);
      
      if (selectedCondition && selectedCondition.hasLevels) {
        const levelInput = modal.querySelector('#condition-level');
        const level = parseInt(levelInput.value) || 1;
        this.addConditionToCombatant(combatantId, conditionId, null, level);
      } else {
        const durationInput = modal.querySelector('#condition-duration');
        const duration = durationInput.value ? parseInt(durationInput.value) : null;
        this.addConditionToCombatant(combatantId, conditionId, duration);
      }
      
      modal.remove();
    });
  }
  
  checkExpiredConditions() {
    const allCombatants = [
      ...Array.from(document.querySelectorAll('#heroes-list .combatant-card')),
      ...Array.from(document.querySelectorAll('#monsters-list .combatant-card'))
    ];
    
    allCombatants.forEach(combatant => {
      const hiddenData = combatant.querySelector('.hidden-data');
      if (!hiddenData) return;
      
      // Get current conditions
      let conditions = [];
      try {
        conditions = JSON.parse(hiddenData.dataset.conditionsData || '[]');
      } catch (e) {
        return;
      }
      
      // Check for expired conditions (only those with expiresAt property)
      const currentRound = this.app.state.roundNumber;
      const expiredConditions = conditions.filter(c => c.expiresAt && c.expiresAt <= currentRound);
      
      // Remove expired conditions
      expiredConditions.forEach(condition => {
        this.removeConditionFromCombatant(combatant.id, condition.id);
      });
    });
  }
  
  addCustomCondition(name, icon, description, hasLevels = false, maxLevel = 1) {
    const id = 'custom-' + name.toLowerCase().replace(/\s+/g, '-');
    
    // Check if condition with this ID already exists
    if (this.getConditionById(id)) {
      return false;
    }
    
    this.customConditions.push({
      id: id,
      name: name,
      icon: icon || '❓',
      description: description || 'Custom condition',
      hasLevels: hasLevels,
      maxLevel: maxLevel
    });
    
    return true;
  }
}
