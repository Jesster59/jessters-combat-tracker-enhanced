/**
 * Action Economy Tracker for Jesster's Combat Tracker
 * Handles tracking and managing actions, bonus actions, reactions, etc.
 */
class ActionEconomyTracker {
  constructor(app) {
    this.app = app;
    this.actionEconomy = {}; // Maps combatant ID to action economy data
    console.log("Actions.js loaded successfully");
  }
  
  /**
   * Initialize action economy for a combatant
   * @param {string} combatantId - The ID of the combatant
   */
  initializeActionEconomy(combatantId) {
    this.actionEconomy[combatantId] = {
      action: true,
      bonusAction: true,
      reaction: true,
      movement: true,
      freeAction: true,
      objectInteraction: true
    };
  }
  
  /**
   * Get action economy data for a combatant
   * @param {string} combatantId - The ID of the combatant
   * @returns {Object|null} - The action economy data or null if not found
   */
  getActionEconomyData(combatantId) {
    return this.actionEconomy[combatantId] || null;
  }
  
  /**
   * Reset action economy for a combatant
   * @param {string} combatantId - The ID of the combatant
   */
  resetActionEconomy(combatantId) {
    this.actionEconomy[combatantId] = {
      action: true,
      bonusAction: true,
      reaction: true,
      movement: true,
      freeAction: true,
      objectInteraction: true
    };
    
    // Update the UI if the action economy panel is open
    const panel = document.querySelector(`.action-economy-panel[data-combatant-id="${combatantId}"]`);
    if (panel) {
      this.updateActionEconomyPanel(panel, this.actionEconomy[combatantId]);
    }
  }
  
  /**
   * Reset action economy for all combatants
   */
  resetAllActionEconomy() {
    // Get all combatants
    const allCombatants = [
      ...Array.from(document.querySelectorAll('#heroes-list .combatant-card')),
      ...Array.from(document.querySelectorAll('#monsters-list .combatant-card'))
    ];
    
    // Reset action economy for each combatant
    allCombatants.forEach(card => {
      this.resetActionEconomy(card.id);
    });
  }
  
  /**
   * Use an action
   * @param {string} combatantId - The ID of the combatant
   * @param {string} actionType - The type of action to use
   * @returns {boolean} - Whether the action was successfully used
   */
  useAction(combatantId, actionType) {
    const data = this.getActionEconomyData(combatantId);
    if (!data) {
      this.initializeActionEconomy(combatantId);
      return this.useAction(combatantId, actionType);
    }
    
    if (!data[actionType]) {
      return false; // Action already used
    }
    
    // Use the action
    data[actionType] = false;
    
    // Get the combatant name
    const combatantCard = document.getElementById(combatantId);
    const combatantName = combatantCard ? combatantCard.querySelector('.combatant-name').textContent : "Combatant";
    
    // Format action type for display
    const formattedActionType = this.formatActionType(actionType);
    
    this.app.logEvent(`${combatantName} uses ${formattedActionType}.`);
    
    // Update the UI if the action economy panel is open
    const panel = document.querySelector(`.action-economy-panel[data-combatant-id="${combatantId}"]`);
    if (panel) {
      this.updateActionEconomyPanel(panel, data);
    }
    
    return true;
  }
  
  /**
   * Format action type for display
   * @param {string} actionType - The action type
   * @returns {string} - Formatted action type
   */
  formatActionType(actionType) {
    switch (actionType) {
      case 'action':
        return 'Action';
      case 'bonusAction':
        return 'Bonus Action';
      case 'reaction':
        return 'Reaction';
      case 'movement':
        return 'Movement';
      case 'freeAction':
        return 'Free Action';
      case 'objectInteraction':
        return 'Object Interaction';
      default:
        return actionType;
    }
  }
  
  /**
   * Open the action economy panel for a combatant
   * @param {string} combatantId - The ID of the combatant
   */
  openActionEconomyPanel(combatantId) {
    // Check if the combatant has action economy data
    let data = this.getActionEconomyData(combatantId);
    
    // If no data exists, initialize
    if (!data) {
      this.initializeActionEconomy(combatantId);
      data = this.getActionEconomyData(combatantId);
    }
    
    // Get the combatant name
    const combatantCard = document.getElementById(combatantId);
    if (!combatantCard) return;
    
    const combatantName = combatantCard.querySelector('.combatant-name').textContent;
    
    // Check if panel already exists
    let panel = document.querySelector(`.action-economy-panel[data-combatant-id="${combatantId}"]`);
    
    if (panel) {
      // Panel exists, just update it
      this.updateActionEconomyPanel(panel, data);
      return;
    }
    
    // Create the panel
    panel = document.createElement('div');
    panel.className = 'action-economy-panel fixed bottom-4 right-4 bg-gray-800 rounded-lg shadow-lg p-4 z-40';
    panel.dataset.combatantId = combatantId;
    
    panel.innerHTML = `
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-lg font-bold text-purple-400">Actions: ${combatantName}</h3>
        <button class="close-action-economy-btn text-gray-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div class="action-economy-list space-y-2">
        <!-- Actions will be inserted here -->
      </div>
      
      <div class="mt-3">
        <button class="reset-actions-btn w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-1 px-3 rounded">
          Reset All Actions
        </button>
      </div>
    `;
    
    // Add the panel to the document
    document.body.appendChild(panel);
    
    // Add event listeners
    panel.querySelector('.close-action-economy-btn').addEventListener('click', () => {
      panel.remove();
    });
    
    panel.querySelector('.reset-actions-btn').addEventListener('click', () => {
      this.resetActionEconomy(combatantId);
      this.app.logEvent(`${combatantName}'s actions reset.`);
    });
    
    // Update the panel with the current data
    this.updateActionEconomyPanel(panel, data);
  }
  
  /**
   * Update the action economy panel with current data
   * @param {HTMLElement} panel - The panel element
   * @param {Object} data - The action economy data
   */
  updateActionEconomyPanel(panel, data) {
    // Update the actions list
    const actionsList = panel.querySelector('.action-economy-list');
    actionsList.innerHTML = '';
    
    // Define the actions to display
    const actions = [
      { id: 'action', name: 'Action', icon: '⚔️' },
      { id: 'bonusAction', name: 'Bonus Action', icon: '🔮' },
      { id: 'reaction', name: 'Reaction', icon: '⚡' },
      { id: 'movement', name: 'Movement', icon: '👣' },
      { id: 'objectInteraction', name: 'Object Interaction', icon: '🧤' },
      { id: 'freeAction', name: 'Free Action', icon: '🆓' }
    ];
    
    actions.forEach(action => {
      const isAvailable = data[action.id];
      
      const actionElement = document.createElement('div');
      actionElement.className = `action-economy-item flex justify-between items-center p-2 rounded ${isAvailable ? 'bg-gray-700' : 'bg-gray-900 opacity-50'}`;
      
      actionElement.innerHTML = `
        <div class="flex items-center">
          <span class="mr-2">${action.icon}</span>
          <span>${action.name}</span>
        </div>
        <button class="action-toggle-btn ${isAvailable ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white text-xs py-1 px-2 rounded">
          ${isAvailable ? 'Available' : 'Used'}
        </button>
      `;
      
      // Add event listener to toggle button
      const toggleBtn = actionElement.querySelector('.action-toggle-btn');
      toggleBtn.addEventListener('click', () => {
        const combatantId = panel.dataset.combatantId;
        const actionData = this.getActionEconomyData(combatantId);
        
        if (actionData) {
          // Toggle the action state
          actionData[action.id] = !actionData[action.id];
          
          // Get the combatant name
          const combatantCard = document.getElementById(combatantId);
          const combatantName = combatantCard ? combatantCard.querySelector('.combatant-name').textContent : "Combatant";
          
          // Log the action
          if (actionData[action.id]) {
            this.app.logEvent(`${combatantName} regains ${action.name}.`);
          } else {
            this.app.logEvent(`${combatantName} uses ${action.name}.`);
          }
          
          // Update the UI
          this.updateActionEconomyPanel(panel, actionData);
        }
      });
      
      actionsList.appendChild(actionElement);
    });
  }
  
  /**
   * Add action economy button to a combatant card
   * @param {HTMLElement} card - The combatant card element
   */
  addActionEconomyButtonToCombatantCard(card) {
    if (!card) return;
    
    // Check if action economy button already exists
    if (card.querySelector('.action-economy-btn')) return;
    
    // Create the action economy button
    const actionEconomyBtn = document.createElement('button');
    actionEconomyBtn.className = 'action-economy-btn text-gray-400 hover:text-purple-400 ml-1';
    actionEconomyBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    `;
    
    // Add event listener
    actionEconomyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.openActionEconomyPanel(card.id);
    });
    
    // Find the appropriate place to insert the button
    const cardHeader = card.querySelector('.combatant-header') || card.querySelector('.combatant-name').parentNode;
    cardHeader.appendChild(actionEconomyBtn);
  }
  
  /**
   * Open the action reference modal
   */
  openActionReferenceModal() {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 flex items-center justify-center z-50 p-4';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    
    modal.innerHTML = `
      <div class="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-2xl w-full mx-auto overflow-y-auto max-h-[80vh]">
        <h3 class="text-xl font-bold text-purple-400 mb-4">Action Reference</h3>
        
        <div class="space-y-4">
          <div class="bg-gray-700 p-3 rounded">
            <h4 class="font-semibold text-white mb-1">Action</h4>
            <p class="text-gray-300 text-sm">Attack, Cast a Spell, Dash, Disengage, Dodge, Help, Hide, Ready, Search, Use an Object</p>
          </div>
          
          <div class="bg-gray-700 p-3 rounded">
            <h4 class="font-semibold text-white mb-1">Bonus Action</h4>
            <p class="text-gray-300 text-sm">Certain spells, class features, and other abilities can be used as a bonus action.</p>
          </div>
          
          <div class="bg-gray-700 p-3 rounded">
            <h4 class="font-semibold text-white mb-1">Reaction</h4>
            <p class="text-gray-300 text-sm">Opportunity Attack, Ready Action, certain spells and class features.</p>
          </div>
          
          <div class="bg-gray-700 p-3 rounded">
            <h4 class="font-semibold text-white mb-1">Movement</h4>
            <p class="text-gray-300 text-sm">Move up to your speed. Can be split before and after your action.</p>
          </div>
          
          <div class="bg-gray-700 p-3 rounded">
            <h4 class="font-semibold text-white mb-1">Object Interaction</h4>
            <p class="text-gray-300 text-sm">Draw or sheathe a weapon, open a door, retrieve an item from a backpack, etc.</p>
          </div>
          
          <div class="bg-gray-700 p-3 rounded">
            <h4 class="font-semibold text-white mb-1">Free Action</h4>
            <p class="text-gray-300 text-sm">Speaking, dropping an item, etc.</p>
          </div>
        </div>
        
        <div class="mt-6">
          <h4 class="font-semibold text-white mb-2">Combat Actions</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="bg-gray-700 p-3 rounded">
              <h5 class="font-medium text-white">Attack</h5>
              <p class="text-gray-300 text-sm">Make a melee or ranged attack against a target.</p>
            </div>
            <div class="bg-gray-700 p-3 rounded">
              <h5 class="font-medium text-white">Cast a Spell</h5>
              <p class="text-gray-300 text-sm">Cast a spell with a casting time of 1 action.</p>
            </div>
            <div class="bg-gray-700 p-3 rounded">
              <h5 class="font-medium text-white">Dash</h5>
              <p class="text-gray-300 text-sm">Gain extra movement equal to your speed.</p>
            </div>
            <div class="bg-gray-700 p-3 rounded">
              <h5 class="font-medium text-white">Disengage</h5>
              <p class="text-gray-300 text-sm">Your movement doesn't provoke opportunity attacks.</p>
            </div>
            <div class="bg-gray-700 p-3 rounded">
              <h5 class="font-medium text-white">Dodge</h5>
              <p class="text-gray-300 text-sm">Attacks against you have disadvantage, and you have advantage on Dexterity saving throws.</p>
            </div>
            <div class="bg-gray-700 p-3 rounded">
              <h5 class="font-medium text-white">Help</h5>
              <p class="text-gray-300 text-sm">Give advantage to another creature's ability check or attack roll.</p>
            </div>
            <div class="bg-gray-700 p-3 rounded">
              <h5 class="font-medium text-white">Hide</h5>
              <p class="text-gray-300 text-sm">Make a Dexterity (Stealth) check to hide.</p>
            </div>
            <div class="bg-gray-700 p-3 rounded">
              <h5 class="font-medium text-white">Ready</h5>
              <p class="text-gray-300 text-sm">Prepare to take an action when a trigger occurs.</p>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end mt-6">
          <button id="action-reference-close-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            Close
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('action-reference-close-btn').addEventListener('click', () => {
      modal.remove();
    });
  }
  
  /**
   * Add action reference button to the combat controls
   */
  addActionReferenceButton() {
    // Add a button to the combat controls section
    const combatControls = document.querySelector('.md\\:col-span-2.flex.flex-wrap.justify-center.gap-4');
    if (!combatControls) return;
    
    const actionReferenceBtn = document.createElement('button');
    actionReferenceBtn.id = 'action-reference-btn';
    actionReferenceBtn.className = 'bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300';
    actionReferenceBtn.textContent = 'Action Reference';
    actionReferenceBtn.addEventListener('click', () => this.openActionReferenceModal());
    
    combatControls.appendChild(actionReferenceBtn);
  }
}
