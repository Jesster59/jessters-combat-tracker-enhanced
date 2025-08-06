/**
 * Action Economy Tracker for Jesster's Combat Tracker
 * Handles tracking of actions, bonus actions, reactions, and movement
 */
class ActionEconomyTracker {
  constructor(app) {
    this.app = app;
  }
  
  initializeActionEconomy(combatantId) {
    const combatant = document.getElementById(combatantId);
    if (!combatant) return;
    
    // Get or create hidden data element
    let hiddenData = combatant.querySelector('.hidden-data');
    if (!hiddenData) {
      hiddenData = document.createElement('div');
      hiddenData.className = 'hidden-data hidden';
      combatant.appendChild(hiddenData);
    }
    
    // Initialize action economy data
    hiddenData.dataset.actionEconomy = JSON.stringify({
      action: true,
      bonusAction: true,
      reaction: true,
      movement: true,
      speed: 30 // Default speed
    });
    
    // Create action economy UI
    this.createActionEconomyUI(combatantId);
  }
  
  createActionEconomyUI(combatantId) {
    const combatant = document.getElementById(combatantId);
    if (!combatant) return;
    
    // Check if action economy UI already exists
    if (combatant.querySelector('.action-economy-container')) return;
    
    // Get action economy data
    const hiddenData = combatant.querySelector('.hidden-data');
    if (!hiddenData || !hiddenData.dataset.actionEconomy) return;
    
    let actionEconomy;
    try {
      actionEconomy = JSON.parse(hiddenData.dataset.actionEconomy);
    } catch (e) {
      console.error("Error parsing action economy data:", e);
      return;
    }
    
    // Create action economy container
    const container = document.createElement('div');
    container.className = 'action-economy-container mt-2 grid grid-cols-4 gap-1';
    
    // Create action button
    const actionBtn = document.createElement('button');
    actionBtn.className = `action-btn text-xs py-1 px-2 rounded ${actionEconomy.action ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'} text-white`;
    actionBtn.textContent = 'Action';
    actionBtn.dataset.type = 'action';
    actionBtn.dataset.combatantId = combatantId;
    
    // Create bonus action button
    const bonusActionBtn = document.createElement('button');
    bonusActionBtn.className = `bonus-action-btn text-xs py-1 px-2 rounded ${actionEconomy.bonusAction ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'} text-white`;
    bonusActionBtn.textContent = 'Bonus';
    bonusActionBtn.dataset.type = 'bonusAction';
    bonusActionBtn.dataset.combatantId = combatantId;
    
    // Create reaction button
    const reactionBtn = document.createElement('button');
    reactionBtn.className = `reaction-btn text-xs py-1 px-2 rounded ${actionEconomy.reaction ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-600 hover:bg-gray-700'} text-white`;
    reactionBtn.textContent = 'Reaction';
    reactionBtn.dataset.type = 'reaction';
    reactionBtn.dataset.combatantId = combatantId;
    
    // Create movement button
    const movementBtn = document.createElement('button');
    movementBtn.className = `movement-btn text-xs py-1 px-2 rounded ${actionEconomy.movement ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-600 hover:bg-gray-700'} text-white`;
    movementBtn.textContent = 'Move';
    movementBtn.dataset.type = 'movement';
    movementBtn.dataset.combatantId = combatantId;
    
    // Add event listeners
    actionBtn.addEventListener('click', () => this.toggleAction(combatantId, 'action'));
    bonusActionBtn.addEventListener('click', () => this.toggleAction(combatantId, 'bonusAction'));
    reactionBtn.addEventListener('click', () => this.toggleAction(combatantId, 'reaction'));
    movementBtn.addEventListener('click', () => this.toggleAction(combatantId, 'movement'));
    
    // Add buttons to container
    container.appendChild(actionBtn);
    container.appendChild(bonusActionBtn);
    container.appendChild(reactionBtn);
    container.appendChild(movementBtn);
    
    // Add container to combatant card
    const statsContainer = combatant.querySelector('.mt-2');
    if (statsContainer) {
      statsContainer.parentNode.insertBefore(container, statsContainer.nextSibling);
    } else {
      combatant.appendChild(container);
    }
  }
  
  toggleAction(combatantId, actionType) {
    const combatant = document.getElementById(combatantId);
    if (!combatant) return;
    
    // Get action economy data
    const hiddenData = combatant.querySelector('.hidden-data');
    if (!hiddenData || !hiddenData.dataset.actionEconomy) return;
    
    let actionEconomy;
    try {
      actionEconomy = JSON.parse(hiddenData.dataset.actionEconomy);
    } catch (e) {
      console.error("Error parsing action economy data:", e);
      return;
    }
    
    // Toggle the action
    actionEconomy[actionType] = !actionEconomy[actionType];
    
    // Update hidden data
    hiddenData.dataset.actionEconomy = JSON.stringify(actionEconomy);
    
    // Update UI
    this.updateActionEconomyUI(combatantId);
    
    // Log the action
    const combatantName = combatant.querySelector('.combatant-name')?.textContent || 'Unknown';
    const actionName = this.getActionName(actionType);
    const status = actionEconomy[actionType] ? 'available' : 'used';
    this.app.logEvent(`${combatantName}'s ${actionName} is now ${status}.`);
  }
  
  updateActionEconomyUI(combatantId) {
    const combatant = document.getElementById(combatantId);
    if (!combatant) return;
    
    // Get action economy data
    const hiddenData = combatant.querySelector('.hidden-data');
    if (!hiddenData || !hiddenData.dataset.actionEconomy) return;
    
    let actionEconomy;
    try {
      actionEconomy = JSON.parse(hiddenData.dataset.actionEconomy);
    } catch (e) {
      console.error("Error parsing action economy data:", e);
      return;
    }
    
    // Update action button
    const actionBtn = combatant.querySelector('.action-btn');
    if (actionBtn) {
      actionBtn.className = `action-btn text-xs py-1 px-2 rounded ${actionEconomy.action ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'} text-white`;
    }
    
    // Update bonus action button
    const bonusActionBtn = combatant.querySelector('.bonus-action-btn');
    if (bonusActionBtn) {
      bonusActionBtn.className = `bonus-action-btn text-xs py-1 px-2 rounded ${actionEconomy.bonusAction ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'} text-white`;
    }
    
    // Update reaction button
    const reactionBtn = combatant.querySelector('.reaction-btn');
    if (reactionBtn) {
      reactionBtn.className = `reaction-btn text-xs py-1 px-2 rounded ${actionEconomy.reaction ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-600 hover:bg-gray-700'} text-white`;
    }
    
    // Update movement button
    const movementBtn = combatant.querySelector('.movement-btn');
    if (movementBtn) {
      movementBtn.className = `movement-btn text-xs py-1 px-2 rounded ${actionEconomy.movement ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-600 hover:bg-gray-700'} text-white`;
    }
  }
  
  resetActionEconomy(combatantId) {
    const combatant = document.getElementById(combatantId);
    if (!combatant) return;
    
    // Get action economy data
    const hiddenData = combatant.querySelector('.hidden-data');
    if (!hiddenData) return;
    
    // Reset action economy data
    hiddenData.dataset.actionEconomy = JSON.stringify({
      action: true,
      bonusAction: true,
      reaction: true,
      movement: true,
      speed: 30 // Default speed
    });
    
    // Update UI
    this.updateActionEconomyUI(combatantId);
  }
  
  resetAllActionEconomy() {
    // Reset action economy for all combatants
    const allCombatants = [
      ...Array.from(document.querySelectorAll('#heroes-list .combatant-card')),
      ...Array.from(document.querySelectorAll('#monsters-list .combatant-card'))
    ];
    
    allCombatants.forEach(combatant => {
      this.resetActionEconomy(combatant.id);
    });
    
    this.app.logEvent("Reset action economy for all combatants.");
  }
  
  getActionName(actionType) {
    switch (actionType) {
      case 'action': return 'Action';
      case 'bonusAction': return 'Bonus Action';
      case 'reaction': return 'Reaction';
      case 'movement': return 'Movement';
      default: return actionType;
    }
  }
}
