/**
 * Legendary Actions Tracker for Jesster's Combat Tracker
 * Handles tracking and using legendary actions for monsters
 */
class LegendaryActionsTracker {
  constructor(app) {
    this.app = app;
    this.legendaryActionsMap = {}; // Maps monster ID to legendary actions data
    console.log("Legendary.js loaded successfully");
  }
  
  /**
   * Initialize legendary actions for a monster
   * @param {string} monsterId - The ID of the monster
   * @param {number} maxActions - The maximum number of legendary actions
   * @param {Array} actions - Array of legendary action objects
   */
  initializeLegendaryActions(monsterId, maxActions = 3, actions = []) {
    this.legendaryActionsMap[monsterId] = {
      maxActions: maxActions,
      remainingActions: maxActions,
      actions: actions.length > 0 ? actions : [
        { name: "Legendary Action 1", cost: 1, description: "Description of legendary action 1" },
        { name: "Legendary Action 2", cost: 2, description: "Description of legendary action 2" },
        { name: "Legendary Action 3", cost: 3, description: "Description of legendary action 3" }
      ]
    };
    
    this.app.logEvent(`Initialized ${maxActions} legendary actions for monster.`);
  }
  
  /**
   * Get legendary actions data for a monster
   * @param {string} monsterId - The ID of the monster
   * @returns {Object|null} - The legendary actions data or null if not found
   */
  getLegendaryActionsData(monsterId) {
    return this.legendaryActionsMap[monsterId] || null;
  }
  
  /**
   * Use a legendary action
   * @param {string} monsterId - The ID of the monster
   * @param {number} actionIndex - The index of the action in the actions array
   * @returns {boolean} - Whether the action was successfully used
   */
  useLegendaryAction(monsterId, actionIndex) {
    const data = this.getLegendaryActionsData(monsterId);
    if (!data) return false;
    
    const action = data.actions[actionIndex];
    if (!action) return false;
    
    if (data.remainingActions < action.cost) {
      this.app.showAlert(`Not enough legendary actions remaining. Needs ${action.cost}, has ${data.remainingActions}.`, "Legendary Action Error");
      return false;
    }
    
    // Use the action
    data.remainingActions -= action.cost;
    
    // Get the monster name
    const monsterCard = document.getElementById(monsterId);
    const monsterName = monsterCard ? monsterCard.querySelector('.combatant-name').textContent : "Monster";
    
    this.app.logEvent(`${monsterName} uses legendary action: ${action.name} (${action.cost} action${action.cost > 1 ? 's' : ''}). ${data.remainingActions} remaining.`);
    
    // Update the UI if the legendary actions panel is open
    const panel = document.querySelector(`.legendary-actions-panel[data-monster-id="${monsterId}"]`);
    if (panel) {
      this.updateLegendaryActionsPanel(panel, data);
    }
    
    return true;
  }
  
  /**
   * Reset legendary actions at the start of the monster's turn
   * @param {string} monsterId - The ID of the monster
   */
  resetLegendaryActions(monsterId) {
    const data = this.getLegendaryActionsData(monsterId);
    if (!data) return;
    
    data.remainingActions = data.maxActions;
    
    // Get the monster name
    const monsterCard = document.getElementById(monsterId);
    const monsterName = monsterCard ? monsterCard.querySelector('.combatant-name').textContent : "Monster";
    
    this.app.logEvent(`${monsterName}'s legendary actions reset to ${data.maxActions}.`);
    
    // Update the UI if the legendary actions panel is open
    const panel = document.querySelector(`.legendary-actions-panel[data-monster-id="${monsterId}"]`);
    if (panel) {
      this.updateLegendaryActionsPanel(panel, data);
    }
  }
  
  /**
   * Reset legendary actions for all monsters at the start of a new round
   */
  resetLegendaryActionsAtRoundStart() {
    // Reset legendary actions for all monsters
    for (const monsterId in this.legendaryActionsMap) {
      this.resetLegendaryActions(monsterId);
    }
  }
  
  /**
   * Open the legendary actions panel for a monster
   * @param {string} monsterId - The ID of the monster
   */
  openLegendaryActionsPanel(monsterId) {
    // Check if the monster has legendary actions
    let data = this.getLegendaryActionsData(monsterId);
    
    // If no data exists, initialize with default values
    if (!data) {
      this.initializeLegendaryActions(monsterId);
      data = this.getLegendaryActionsData(monsterId);
    }
    
    // Get the monster name
    const monsterCard = document.getElementById(monsterId);
    if (!monsterCard) return;
    
    const monsterName = monsterCard.querySelector('.combatant-name').textContent;
    
    // Check if panel already exists
    let panel = document.querySelector(`.legendary-actions-panel[data-monster-id="${monsterId}"]`);
    
    if (panel) {
      // Panel exists, just update it
      this.updateLegendaryActionsPanel(panel, data);
      return;
    }
    
    // Create the panel
    panel = document.createElement('div');
    panel.className = 'legendary-actions-panel fixed bottom-4 left-4 bg-gray-800 rounded-lg shadow-lg p-4 z-40';
    panel.dataset.monsterId = monsterId;
    
    panel.innerHTML = `
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-lg font-bold text-yellow-400">Legendary Actions: ${monsterName}</h3>
        <div class="flex items-center">
          <button class="edit-legendary-actions-btn text-gray-400 hover:text-white mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button class="close-legendary-actions-btn text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <div class="mb-3">
        <div class="flex items-center justify-between">
          <span class="text-gray-300">Remaining Actions:</span>
          <div class="flex items-center">
            <button class="decrement-actions-btn bg-red-600 hover:bg-red-700 text-white w-6 h-6 rounded-l flex items-center justify-center">-</button>
            <span class="remaining-actions-display bg-gray-700 text-white px-3 py-1">${data.remainingActions}/${data.maxActions}</span>
            <button class="increment-actions-btn bg-green-600 hover:bg-green-700 text-white w-6 h-6 rounded-r flex items-center justify-center">+</button>
          </div>
        </div>
      </div>
      
      <div class="legendary-actions-list space-y-2">
        <!-- Actions will be inserted here -->
      </div>
    `;
    
    // Add the panel to the document
    document.body.appendChild(panel);
    
    // Add event listeners
    panel.querySelector('.close-legendary-actions-btn').addEventListener('click', () => {
      panel.remove();
    });
    
    panel.querySelector('.edit-legendary-actions-btn').addEventListener('click', () => {
      this.openLegendaryActionsEditor(monsterId);
    });
    
    panel.querySelector('.decrement-actions-btn').addEventListener('click', () => {
      if (data.remainingActions > 0) {
        data.remainingActions--;
        this.updateLegendaryActionsPanel(panel, data);
        this.app.logEvent(`${monsterName} uses 1 legendary action. ${data.remainingActions} remaining.`);
      }
    });
    
    panel.querySelector('.increment-actions-btn').addEventListener('click', () => {
      if (data.remainingActions < data.maxActions) {
        data.remainingActions++;
        this.updateLegendaryActionsPanel(panel, data);
        this.app.logEvent(`${monsterName} gains 1 legendary action. ${data.remainingActions} remaining.`);
      }
    });
    
    // Update the panel with the current data
    this.updateLegendaryActionsPanel(panel, data);
  }
  
  /**
   * Update the legendary actions panel with current data
   * @param {HTMLElement} panel - The panel element
   * @param {Object} data - The legendary actions data
   */
  updateLegendaryActionsPanel(panel, data) {
    // Update the remaining actions display
    panel.querySelector('.remaining-actions-display').textContent = `${data.remainingActions}/${data.maxActions}`;
    
    // Update the actions list
    const actionsList = panel.querySelector('.legendary-actions-list');
    actionsList.innerHTML = '';
    
    data.actions.forEach((action, index) => {
      const actionElement = document.createElement('div');
      actionElement.className = `legendary-action-item bg-gray-700 p-2 rounded ${data.remainingActions < action.cost ? 'opacity-50' : ''}`;
      
      actionElement.innerHTML = `
        <div class="flex justify-between items-center">
          <div>
            <span class="font-medium text-yellow-300">${action.name}</span>
            <span class="text-xs text-gray-400 ml-2">(${action.cost} action${action.cost > 1 ? 's' : ''})</span>
          </div>
          <button class="use-action-btn bg-yellow-600 hover:bg-yellow-700 text-white text-xs py-1 px-2 rounded ${data.remainingActions < action.cost ? 'cursor-not-allowed' : ''}">
            Use
          </button>
        </div>
        <p class="text-sm text-gray-300 mt-1">${action.description}</p>
      `;
      
      // Add event listener to use action button
      const useBtn = actionElement.querySelector('.use-action-btn');
      useBtn.addEventListener('click', () => {
        const monsterId = panel.dataset.monsterId;
        this.useLegendaryAction(monsterId, index);
      });
      
      actionsList.appendChild(actionElement);
    });
  }
  
  /**
   * Open the legendary actions editor
   * @param {string} monsterId - The ID of the monster
   */
  openLegendaryActionsEditor(monsterId) {
    // Get the current legendary actions data
    let data = this.getLegendaryActionsData(monsterId);
    
    // If no data exists, initialize with default values
    if (!data) {
      this.initializeLegendaryActions(monsterId);
      data = this.getLegendaryActionsData(monsterId);
    }
    
    // Get the monster name
    const monsterCard = document.getElementById(monsterId);
    if (!monsterCard) return;
    
    const monsterName = monsterCard.querySelector('.combatant-name').textContent;
    
    // Create the editor modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 flex items-center justify-center z-50 p-4';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    
    modal.innerHTML = `
      <div class="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-lg w-full mx-auto">
        <h3 class="text-xl font-bold text-yellow-400 mb-4">Edit Legendary Actions: ${monsterName}</h3>
        
        <div class="mb-4">
          <label class="block text-gray-300 mb-2">Max Actions per Round:</label>
          <input type="number" id="max-legendary-actions" class="bg-gray-700 w-full rounded px-2 py-1 text-white" value="${data.maxActions}" min="1" max="10">
        </div>
        
        <div class="mb-4">
          <div class="flex justify-between items-center mb-2">
            <label class="text-gray-300">Legendary Actions:</label>
            <button id="add-legendary-action-btn" class="bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-2 rounded">
              Add Action
            </button>
          </div>
          <div id="legendary-actions-editor-list" class="space-y-3">
            <!-- Action editors will be inserted here -->
          </div>
        </div>
        
        <div class="flex justify-end space-x-2">
          <button id="legendary-actions-cancel-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            Cancel
          </button>
          <button id="legendary-actions-save-btn" class="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
            Save
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Populate the actions list
    const actionsList = document.getElementById('legendary-actions-editor-list');
    
    const renderActionEditor = (action, index) => {
      const actionEditor = document.createElement('div');
      actionEditor.className = 'legendary-action-editor bg-gray-700 p-3 rounded';
      actionEditor.dataset.index = index;
      
      actionEditor.innerHTML = `
        <div class="flex justify-between items-center mb-2">
          <input type="text" class="action-name-input bg-gray-600 rounded px-2 py-1 text-white flex-grow mr-2" value="${action.name}" placeholder="Action Name">
          <div class="flex items-center">
            <label class="text-gray-400 text-xs mr-1">Cost:</label>
            <input type="number" class="action-cost-input bg-gray-600 rounded px-2 py-1 text-white w-12" value="${action.cost}" min="1" max="3">
            <button class="remove-action-btn text-red-400 hover:text-red-300 ml-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        <textarea class="action-description-input bg-gray-600 w-full rounded px-2 py-1 text-white h-16" placeholder="Action Description">${action.description}</textarea>
      `;
      
      // Add event listener to remove button
      actionEditor.querySelector('.remove-action-btn').addEventListener('click', () => {
        actionEditor.remove();
      });
      
      actionsList.appendChild(actionEditor);
    };
    
    // Render existing actions
    data.actions.forEach((action, index) => {
      renderActionEditor(action, index);
    });
    
    // Add event listeners
    document.getElementById('legendary-actions-cancel-btn').addEventListener('click', () => {
      modal.remove();
    });
    
    document.getElementById('add-legendary-action-btn').addEventListener('click', () => {
      const newAction = {
        name: "New Action",
        cost: 1,
        description: "Description of the new action"
      };
      
      renderActionEditor(newAction, data.actions.length);
    });
    
    document.getElementById('legendary-actions-save-btn').addEventListener('click', () => {
      // Collect the updated data
      const maxActions = parseInt(document.getElementById('max-legendary-actions').value) || 3;
      
      const actions = [];
      const actionEditors = document.querySelectorAll('.legendary-action-editor');
      
      actionEditors.forEach(editor => {
        const name = editor.querySelector('.action-name-input').value;
        const cost = parseInt(editor.querySelector('.action-cost-input').value) || 1;
        const description = editor.querySelector('.action-description-input').value;
        
        actions.push({ name, cost, description });
      });
      
      // Update the legendary actions data
      this.legendaryActionsMap[monsterId] = {
        maxActions,
        remainingActions: Math.min(data.remainingActions, maxActions), // Ensure remaining doesn't exceed new max
        actions
      };
      
      // Update any open panels
      const panel = document.querySelector(`.legendary-actions-panel[data-monster-id="${monsterId}"]`);
      if (panel) {
        this.updateLegendaryActionsPanel(panel, this.legendaryActionsMap[monsterId]);
      }
      
      this.app.logEvent(`Updated legendary actions for ${monsterName}.`);
      
      modal.remove();
    });
  }
  
  /**
   * Add legendary actions button to a monster card
   * @param {HTMLElement} card - The monster card element
   */
  addLegendaryActionsButtonToMonsterCard(card) {
    if (!card || card.dataset.type !== 'monster') return;
    
    // Check if legendary actions button already exists
    if (card.querySelector('.legendary-actions-btn')) return;
    
    // Create the legendary actions button
    const legendaryBtn = document.createElement('button');
    legendaryBtn.className = 'legendary-actions-btn text-gray-400 hover:text-yellow-400 ml-1';
    legendaryBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    `;
    
    // Add event listener
    legendaryBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.openLegendaryActionsPanel(card.id);
    });
    
    // Find the appropriate place to insert the button
    const cardHeader = card.querySelector('.combatant-header') || card.querySelector('.combatant-name').parentNode;
    cardHeader.appendChild(legendaryBtn);
  }
}
