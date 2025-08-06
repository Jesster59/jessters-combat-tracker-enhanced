/**
 * Lair Actions Tracker for Jesster's Combat Tracker
 * Handles tracking and triggering of lair actions at initiative count 20
 */
class LairActionsTracker {
  constructor(app) {
    this.app = app;
    this.lairActions = [];
    this.currentLairActionIndex = 0;
  }
  
  initializeLairActions() {
    // Check if lair actions are enabled in the UI
    const lairActionEnabled = document.getElementById('lair-action-enable')?.checked || false;
    if (!lairActionEnabled) return;
    
    // Get lair action text from the UI
    const lairActionText = document.getElementById('lair-action-text')?.value || '';
    if (!lairActionText.trim()) return;
    
    // Parse lair actions (split by semicolons or newlines)
    this.lairActions = lairActionText
      .split(/[;\n]/)
      .map(action => action.trim())
      .filter(action => action.length > 0);
    
    this.currentLairActionIndex = 0;
    
    if (this.lairActions.length > 0) {
      this.app.logEvent(`Initialized ${this.lairActions.length} lair actions.`);
    }
  }
  
  triggerLairAction() {
    if (!this.lairActions.length) return false;
    
    const action = this.lairActions[this.currentLairActionIndex];
    this.app.showAlert(action, 'Lair Action (Initiative 20)');
    this.app.logEvent(`Lair Action: ${action}`);
    
    // Advance to the next lair action for the next round
    this.currentLairActionIndex = (this.currentLairActionIndex + 1) % this.lairActions.length;
    
    return true;
  }
  
  openLairActionsModal() {
    // Create modal for managing lair actions
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    
    modal.innerHTML = `
      <div class="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-lg w-full mx-auto">
        <h3 class="text-xl font-bold text-orange-400 mb-4">Manage Lair Actions</h3>
        
        <div class="mb-4">
          <label class="block text-gray-300 mb-2">Lair Actions (one per line):</label>
          <textarea id="lair-actions-textarea" class="bg-gray-700 w-full rounded px-2 py-1 text-white h-40" 
                    placeholder="Enter lair actions, one per line or separated by semicolons...">${this.getLairActionsText()}</textarea>
        </div>
        
        <div class="mb-4">
          <label class="flex items-center space-x-2">
            <input type="checkbox" id="lair-actions-enable-checkbox" ${document.getElementById('lair-action-enable')?.checked ? 'checked' : ''}>
            <span class="text-gray-300">Enable Lair Actions</span>
          </label>
        </div>
        
        <div class="flex justify-end space-x-2">
          <button id="lair-actions-save-btn" class="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded">
            Save Lair Actions
          </button>
          <button id="lair-actions-cancel-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            Cancel
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('lair-actions-save-btn').addEventListener('click', () => {
      const lairActionsText = document.getElementById('lair-actions-textarea').value;
      const lairActionsEnabled = document.getElementById('lair-actions-enable-checkbox').checked;
      
      // Update the UI elements
      document.getElementById('lair-action-text').value = lairActionsText;
      document.getElementById('lair-action-enable').checked = lairActionsEnabled;
      
      // Re-initialize lair actions
      this.initializeLairActions();
      
      modal.remove();
      this.app.logEvent("Lair actions updated.");
    });
    
    document.getElementById('lair-actions-cancel-btn').addEventListener('click', () => {
      modal.remove();
    });
  }
  
  getLairActionsText() {
    // Get the current lair actions text from the UI
    return document.getElementById('lair-action-text')?.value || '';
  }
  
  addLairActionsButton() {
    // Add a button to the combat controls section
    const combatControls = document.querySelector('.md\\:col-span-2.flex.flex-wrap.justify-center.gap-4');
    if (!combatControls) return;
    
    const lairBtn = document.createElement('button');
    lairBtn.id = 'manage-lair-actions-btn';
    lairBtn.className = 'bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300';
    lairBtn.textContent = 'Manage Lair Actions';
    lairBtn.addEventListener('click', () => this.openLairActionsModal());
    
    combatControls.appendChild(lairBtn);
  }
  
  // Check if it's time to trigger a lair action (initiative count 20)
  checkLairActionTrigger(initiativeCount) {
    if (initiativeCount === 20) {
      return this.triggerLairAction();
    }
    return false;
  }
}
