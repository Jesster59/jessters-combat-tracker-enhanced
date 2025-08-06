/**
 * Legendary Actions Tracker for Jesster's Combat Tracker
 * Handles tracking of legendary actions for boss monsters
 */
class LegendaryActionsTracker {
  constructor(app) {
    this.app = app;
  }
  
  initializeLegendaryActions(combatantId, maxActions = 3) {
    const combatant = document.getElementById(combatantId);
    if (!combatant) return;
    
    // Only apply to monsters
    if (combatant.dataset.type !== 'monster') return;
    
    // Get or create hidden data element
    let hiddenData = combatant.querySelector('.hidden-data');
    if (!hiddenData) {
      hiddenData = document.createElement('div');
      hiddenData.className = 'hidden-data hidden';
      combatant.appendChild(hiddenData);
    }
    
    // Initialize legendary actions data
    hiddenData.dataset.legendaryActions = JSON.stringify({
      max: maxActions,
      current: maxActions,
      isLegendary: true
    });
    
    // Create legendary actions UI
    this.createLegendaryActionsUI(combatantId);
    
    // Log the event
    const name = combatant.querySelector('.combatant-name')?.textContent || 'Unknown';
    this.app.logEvent(`${name} has been marked as a legendary creature with ${maxActions} legendary actions.`);
  }
  
  createLegendaryActionsUI(combatantId) {
    const combatant = document.getElementById(combatantId);
    if (!combatant) return;
    
    // Check if legendary actions UI already exists
    if (combatant.querySelector('.legendary-actions-container')) return;
    
    // Get legendary actions data
    const hiddenData = combatant.querySelector('.hidden-data');
    if (!hiddenData || !hiddenData.dataset.legendaryActions) return;
    
    let legendaryData;
    try {
      legendaryData = JSON.parse(hiddenData.dataset.legendaryActions);
    } catch (e) {
      console.error("Error parsing legendary actions data:", e);
      return;
    }
    
    // Create legendary actions container
    const container = document.createElement('div');
    container.className = 'legendary-actions-container mt-2';
    
    // Create legendary actions header
    const header = document.createElement('div');
    header.className = 'flex justify-between items-center mb-1';
    header.innerHTML = `
      <span class="text-sm font-bold text-yellow-400">Legendary Actions</span>
      <button class="reset-legendary-btn text-xs bg-yellow-600 hover:bg-yellow-700 text-white py-0.5 px-2 rounded">
        Reset
      </button>
    `;
    
    // Create legendary actions tracker
    const tracker = document.createElement('div');
    tracker.className = 'flex space-x-1';
    
    // Create action dots
    for (let i = 0; i < legendaryData.max; i++) {
      const dot = document.createElement('button');
      dot.className = `legendary-action-dot w-6 h-6 rounded-full ${i < legendaryData.current ? 'bg-yellow-500' : 'bg-gray-600'}`;
      dot.dataset.index = i;
      
      dot.addEventListener('click', () => {
        this.toggleLegendaryAction(combatantId, i);
      });
      
      tracker.appendChild(dot);
    }
    
    // Add event listener to reset button
    header.querySelector('.reset-legendary-btn').addEventListener('click', () => {
      this.resetLegendaryActions(combatantId);
    });
    
    // Assemble the UI
    container.appendChild(header);
    container.appendChild(tracker);
    
    // Add container to combatant card
    const actionEconomyContainer = combatant.querySelector('.action-economy-container');
    if (actionEconomyContainer) {
      actionEconomyContainer.parentNode.insertBefore(container, actionEconomyContainer.nextSibling);
    } else {
      const statsContainer = combatant.querySelector('.mt-2');
      if (statsContainer) {
        statsContainer.parentNode.insertBefore(container, statsContainer.nextSibling);
      } else {
        combatant.appendChild(container);
      }
    }
  }
  
  toggleLegendaryAction(combatantId, index) {
    const combatant = document.getElementById(combatantId);
    if (!combatant) return;
    
    // Get legendary actions data
    const hiddenData = combatant.querySelector('.hidden-data');
    if (!hiddenData || !hiddenData.dataset.legendaryActions) return;
    
    let legendaryData;
    try {
      legendaryData = JSON.parse(hiddenData.dataset.legendaryActions);
    } catch (e) {
      console.error("Error parsing legendary actions data:", e);
      return;
    }
    
    // Get all dots
    const dots = combatant.querySelectorAll('.legendary-action-dot');
    
    // If clicking an active dot, deactivate it and all dots to the right
    if (index < legendaryData.current) {
      legendaryData.current = index;
      
      // Update UI
      dots.forEach((dot, i) => {
        if (i >= index) {
          dot.classList.remove('bg-yellow-500');
          dot.classList.add('bg-gray-600');
        }
      });
      
      // Log the event
      const name = combatant.querySelector('.combatant-name')?.textContent || 'Unknown';
      this.app.logEvent(`${name} used a legendary action (${legendaryData.current}/${legendaryData.max} remaining).`);
    } 
    // If clicking an inactive dot, activate it and all dots to the left
    else {
      legendaryData.current = index + 1;
      
      // Update UI
      dots.forEach((dot, i) => {
        if (i < legendaryData.current) {
          dot.classList.add('bg-yellow-500');
          dot.classList.remove('bg-gray-600');
        }
      });
      
      // Log the event
      const name = combatant.querySelector('.combatant-name')?.textContent || 'Unknown';
      this.app.logEvent(`${name} regained a legendary action (${legendaryData.current}/${legendaryData.max} available).`);
    }
    
    // Update hidden data
    hiddenData.dataset.legendaryActions = JSON.stringify(legendaryData);
  }
  
  resetLegendaryActions(combatantId) {
    const combatant = document.getElementById(combatantId);
    if (!combatant) return;
    
    // Get legendary actions data
    const hiddenData = combatant.querySelector('.hidden-data');
    if (!hiddenData || !hiddenData.dataset.legendaryActions) return;
    
    let legendaryData;
    try {
      legendaryData = JSON.parse(hiddenData.dataset.legendaryActions);
    } catch (e) {
      console.error("Error parsing legendary actions data:", e);
      return;
    }
    
    // Reset to max actions
    legendaryData.current = legendaryData.max;
    
    // Update hidden data
    hiddenData.dataset.legendaryActions = JSON.stringify(legendaryData);
    
    // Update UI
    const dots = combatant.querySelectorAll('.legendary-action-dot');
    dots.forEach(dot => {
      dot.classList.add('bg-yellow-500');
      dot.classList.remove('bg-gray-600');
    });
    
    // Log the event
    const name = combatant.querySelector('.combatant-name')?.textContent || 'Unknown';
    this.app.logEvent(`${name}'s legendary actions have been reset (${legendaryData.current}/${legendaryData.max} available).`);
  }
  
  resetAllLegendaryActions() {
    // Reset legendary actions for all monsters
    const monsterCards = Array.from(document.querySelectorAll('#monsters-list .combatant-card'));
    
    monsterCards.forEach(card => {
      const hiddenData = card.querySelector('.hidden-data');
      if (hiddenData && hiddenData.dataset.legendaryActions) {
        this.resetLegendaryActions(card.id);
      }
    });
  }
  
  addLegendaryActionsButton(combatantId) {
    const combatant = document.getElementById(combatantId);
    if (!combatant) return;
    
    // Only apply to monsters
    if (combatant.dataset.type !== 'monster') return;
    
    // Check if the button already exists
    if (combatant.querySelector('.legendary-btn')) return;
    
    // Create the legendary button
    const legendaryBtn = document.createElement('button');
    legendaryBtn.className = 'legendary-btn text-yellow-500 hover:text-yellow-400 font-bold text-sm ml-2';
    legendaryBtn.textContent = '+ Legendary';
    legendaryBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showLegendaryModal(combatantId);
    });
    
    // Add it to the card
    const conditionBtn = combatant.querySelector('.condition-btn');
    if (conditionBtn) {
      conditionBtn.parentNode.insertBefore(legendaryBtn, conditionBtn.nextSibling);
    } else {
      const nameElement = combatant.querySelector('.combatant-name');
      if (nameElement && nameElement.parentNode) {
        nameElement.parentNode.appendChild(legendaryBtn);
      }
    }
  }
  
  showLegendaryModal(combatantId) {
    const combatant = document.getElementById(combatantId);
    if (!combatant) return;
    
    const name = combatant.querySelector('.combatant-name')?.textContent || 'Unknown';
    
    // Check if already legendary
    const hiddenData = combatant.querySelector('.hidden-data');
    let isLegendary = false;
    let currentMax = 3;
    
    if (hiddenData && hiddenData.dataset.legendaryActions) {
      try {
        const legendaryData = JSON.parse(hiddenData.dataset.legendaryActions);
        isLegendary = legendaryData.isLegendary;
        currentMax = legendaryData.max;
      } catch (e) { /* ignore */ }
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    
    modal.innerHTML = `
      <div class="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-md w-full mx-auto">
        <h3 class="text-xl font-bold text-yellow-400 mb-4">Legendary Actions for ${name}</h3>
        
        <div class="mb-4">
          <label class="block text-gray-300 mb-2">Number of Legendary Actions:</label>
          <input type="number" id="legendary-actions-count" class="bg-gray-700 w-full rounded px-2 py-1 text-white" 
                 min="1" max="10" value="${currentMax}">
        </div>
        
        <div class="flex justify-end gap-2">
          ${isLegendary ? `
            <button class="remove-btn bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
              Remove Legendary Status
            </button>
          ` : ''}
          <button class="save-btn bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
            ${isLegendary ? 'Update' : 'Add Legendary Actions'}
          </button>
          <button class="cancel-btn bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            Cancel
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.cancel-btn').addEventListener('click', () => {
      modal.remove();
    });
    
    modal.querySelector('.save-btn').addEventListener('click', () => {
      const actionsCount = parseInt(modal.querySelector('#legendary-actions-count').value) || 3;
      this.initializeLegendaryActions(combatantId, actionsCount);
      modal.remove();
    });
    
    const removeBtn = modal.querySelector('.remove-btn');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        this.removeLegendaryStatus(combatantId);
        modal.remove();
      });
    }
  }
  
  removeLegendaryStatus(combatantId) {
    const combatant = document.getElementById(combatantId);
    if (!combatant) return;
    
    // Get legendary actions data
    const hiddenData = combatant.querySelector('.hidden-data');
    if (!hiddenData) return;
    
    // Remove legendary actions data
    delete hiddenData.dataset.legendaryActions;
    
    // Remove legendary actions UI
    const container = combatant.querySelector('.legendary-actions-container');
    if (container) {
      container.remove();
    }
    
    // Log the event
    const name = combatant.querySelector('.combatant-name')?.textContent || 'Unknown';
    this.app.logEvent(`${name} is no longer a legendary creature.`);
  }
  
  // Call this at the start of each round to reset legendary actions
  resetLegendaryActionsAtRoundStart() {
    this.resetAllLegendaryActions();
  }
}
