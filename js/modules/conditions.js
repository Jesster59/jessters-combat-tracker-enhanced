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
      { id: 'exhaustion', name: 'Exhaustion', icon: '😩', description: 'Exhaustion is measured in six levels. Effects are cumulative.' },
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
  
  addConditionToCombatant(combatantId, conditionId, duration = null) {
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
      conditions[existingIndex] = {
        id: conditionId,
        name: condition.name,
        icon: condition.icon,
        addedAt: conditions[existingIndex].addedAt,
        duration: duration,
        expiresAt: duration ? this.app.state.roundNumber + duration : null
      };
    } else {
      // Add new condition
      conditions.push({
        id: conditionId,
        name: condition.name,
        icon: condition.icon,
        addedAt: this.app.state.roundNumber,
        duration: duration,
        expiresAt: duration ? this.app.state.roundNumber + duration : null
      });
    }
    
    // Save conditions back to hidden data
    hiddenData.dataset.conditionsData = JSON.stringify(conditions);
    
    // Update visual indicator
    this.updateConditionIndicators(combatant);
    
    // Log the event
    const combatantName = combatant.querySelector('.combatant-name')?.textContent || 'Unknown';
    this.app.logEvent(`Added condition "${condition.name}" to ${combatantName}.`);
    
    return true;
  }
  
  removeConditionFromCombatant(combatantId, conditionId) {
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
    
    // Find and remove the condition
    const initialLength = conditions.length;
    conditions = conditions.filter(c => c.id !== conditionId);
    
    if (conditions.length === initialLength) {
      // Condition wasn't found
      return false;
    }
    
    // Save conditions back to hidden data
    hiddenData.dataset.conditionsData = JSON.stringify(conditions);
    
    // Update visual indicator
    this.updateConditionIndicators(combatant);
    
    // Log the event
    const combatantName = combatant.querySelector('.combatant-name')?.textContent || 'Unknown';
    const condition = this.getConditionById(conditionId);
    this.app.logEvent(`Removed condition "${condition?.name || conditionId}" from ${combatantName}.`);
    
    return true;
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
      indicator.title = `${condition.name}${condition.duration ? ` (${condition.duration} rounds)` : ''}`;
      indicator.textContent = `${condition.icon} ${condition.name}`;
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
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-lg w-full mx-auto">
        <h3 class="text-xl font-bold text-yellow-400 mb-4">${condition.icon} ${condition.name}</h3>
        <p class="text-gray-300 mb-4">${condition.description}</p>
        <div class="flex justify-end gap-2">
          <button class="remove-btn bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Remove Condition</button>
          <button class="close-btn bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Close</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.close-btn').addEventListener('click', () => {
      modal.remove();
    });
    
    modal.querySelector('.remove-btn').addEventListener('click', () => {
      this.removeConditionFromCombatant(combatantId, conditionId);
      modal.remove();
    });
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
        <div class="mb-4">
          <label class="block text-gray-300 mb-2">Duration (rounds, optional):</label>
          <input type="number" id="condition-duration" class="bg-gray-700 w-full rounded px-2 py-1 text-white" min="1" placeholder="Leave empty for indefinite">
        </div>
        <div class="flex justify-end gap-2">
          <button class="add-btn bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Add</button>
          <button class="cancel-btn bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Cancel</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.cancel-btn').addEventListener('click', () => {
      modal.remove();
    });
    
    modal.querySelector('.add-btn').addEventListener('click', () => {
      const conditionId = modal.querySelector('#condition-select').value;
      const durationInput = modal.querySelector('#condition-duration').value;
      const duration = durationInput ? parseInt(durationInput) : null;
      
      this.addConditionToCombatant(combatantId, conditionId, duration);
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
      
      // Check for expired conditions
      const currentRound = this.app.state.roundNumber;
      const expiredConditions = conditions.filter(c => c.expiresAt && c.expiresAt <= currentRound);
      
      // Remove expired conditions
      expiredConditions.forEach(condition => {
        this.removeConditionFromCombatant(combatant.id, condition.id);
      });
    });
  }
  
  addCustomCondition(name, icon, description) {
    const id = 'custom-' + name.toLowerCase().replace(/\s+/g, '-');
    
    // Check if condition with this ID already exists
    if (this.getConditionById(id)) {
      return false;
    }
    
    this.customConditions.push({
      id: id,
      name: name,
      icon: icon || '❓',
      description: description || 'Custom condition'
    });
    
    return true;
  }
}
