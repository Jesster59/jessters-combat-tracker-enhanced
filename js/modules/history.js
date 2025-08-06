/**
 * Action History for Jesster's Combat Tracker
 * Handles undo/redo functionality
 */
export class ActionHistory {
  constructor(app) {
    this.app = app;
    this.history = [];
    this.currentIndex = -1;
    this.maxHistory = 50;
  }
  
  addAction(action) {
    // Remove any future actions if we're not at the end
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }
    
    // Add the new action
    this.history.push(action);
    this.currentIndex++;
    
    // Trim history if it's too long
    if (this.history.length > this.maxHistory) {
      this.history.shift();
      this.currentIndex--;
    }
    
    // Enable/disable undo/redo buttons
    this.updateButtons();
  }
  
  undo() {
    if (this.currentIndex >= 0) {
      const action = this.history[this.currentIndex];
      this.executeReverse(action);
      this.currentIndex--;
      this.updateButtons();
      this.app.logEvent(`Undid action: ${action.description}`);
      return true;
    }
    return false;
  }
  
  redo() {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      const action = this.history[this.currentIndex];
      this.executeForward(action);
      this.updateButtons();
      this.app.logEvent(`Redid action: ${action.description}`);
      return true;
    }
    return false;
  }
  
  executeReverse(action) {
    // Flag to prevent recording the reversal as a new action
    this.app.isUndoRedoAction = true;
    
    switch (action.type) {
      case 'damage':
        this.reverseDamage(action);
        break;
      case 'heal':
        this.reverseHeal(action);
        break;
      case 'condition':
        this.reverseCondition(action);
        break;
      case 'initiative':
        this.reverseInitiative(action);
        break;
      // Add more action types as needed
    }
    
    this.app.isUndoRedoAction = false;
  }
  
  executeForward(action) {
    // Flag to prevent recording the re-execution as a new action
    this.app.isUndoRedoAction = true;
    
    switch (action.type) {
      case 'damage':
        this.applyDamage(action);
        break;
      case 'heal':
        this.applyHeal(action);
        break;
      case 'condition':
        this.applyCondition(action);
        break;
      case 'initiative':
        this.applyInitiative(action);
        break;
      // Add more action types as needed
    }
    
    this.app.isUndoRedoAction = false;
  }
  
  updateButtons() {
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    
    if (undoBtn) {
      undoBtn.disabled = this.currentIndex < 0;
      undoBtn.classList.toggle('opacity-50', this.currentIndex < 0);
    }
    
    if (redoBtn) {
      redoBtn.disabled = this.currentIndex >= this.history.length - 1;
      redoBtn.classList.toggle('opacity-50', this.currentIndex >= this.history.length - 1);
    }
  }
  
  applyDamage(action) {
    const card = document.getElementById(action.targetId);
    if (!card) return;
    
    const hpInput = card.querySelector('.hp-input');
    if (!hpInput) return;
    
    const currentHp = parseInt(hpInput.value) || 0;
    hpInput.value = currentHp - action.amount;
    
    // Trigger HP change handler
    const event = new Event('change');
    hpInput.dispatchEvent(event);
  }
  
  reverseDamage(action) {
    const card = document.getElementById(action.targetId);
    if (!card) return;
    
    const hpInput = card.querySelector('.hp-input');
    if (!hpInput) return;
    
    const currentHp = parseInt(hpInput.value) || 0;
    hpInput.value = currentHp + action.amount;
    
    // Trigger HP change handler
    const event = new Event('change');
    hpInput.dispatchEvent(event);
  }
  
  applyHeal(action) {
    const card = document.getElementById(action.targetId);
    if (!card) return;
    
    const hpInput = card.querySelector('.hp-input');
    if (!hpInput) return;
    
    const currentHp = parseInt(hpInput.value) || 0;
    hpInput.value = currentHp + action.amount;
    
    // Trigger HP change handler
    const event = new Event('change');
    hpInput.dispatchEvent(event);
  }
  
  reverseHeal(action) {
    const card = document.getElementById(action.targetId);
    if (!card) return;
    
    const hpInput = card.querySelector('.hp-input');
    if (!hpInput) return;
    
    const currentHp = parseInt(hpInput.value) || 0;
    hpInput.value = currentHp - action.amount;
    
    // Trigger HP change handler
    const event = new Event('change');
    hpInput.dispatchEvent(event);
  }
  
    applyCondition(action) {
    const card = document.getElementById(action.targetId);
    if (!card) return;
    
    const hiddenData = card.querySelector('.hidden-data');
    if (!hiddenData) return;
    
    let conditions = [];
    try {
      conditions = JSON.parse(hiddenData.dataset.conditionsData || '[]');
    } catch (e) {
      console.error("Error parsing conditions:", e);
      conditions = [];
    }
    
    // Add the condition if it doesn't exist
    if (!conditions.some(c => c.name === action.condition.name)) {
      conditions.push(action.condition);
      hiddenData.dataset.conditionsData = JSON.stringify(conditions);
      
      // Update condition display
      this.app.combat.updateConditionDisplay(card);
    }
  }
  
  reverseCondition(action) {
    const card = document.getElementById(action.targetId);
    if (!card) return;
    
    const hiddenData = card.querySelector('.hidden-data');
    if (!hiddenData) return;
    
    let conditions = [];
    try {
      conditions = JSON.parse(hiddenData.dataset.conditionsData || '[]');
    } catch (e) {
      console.error("Error parsing conditions:", e);
      conditions = [];
    }
    
    // Remove the condition
    conditions = conditions.filter(c => c.name !== action.condition.name);
    hiddenData.dataset.conditionsData = JSON.stringify(conditions);
    
    // Update condition display
    this.app.combat.updateConditionDisplay(card);
  }
  
  applyInitiative(action) {
    const card = document.getElementById(action.targetId);
    if (!card) return;
    
    const initiativeInput = card.querySelector('.initiative-input');
    if (!initiativeInput) return;
    
    initiativeInput.value = action.newValue;
  }
  
  reverseInitiative(action) {
    const card = document.getElementById(action.targetId);
    if (!card) return;
    
    const initiativeInput = card.querySelector('.initiative-input');
    if (!initiativeInput) return;
    
    initiativeInput.value = action.oldValue;
  }
}
