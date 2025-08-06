/**
 * UI Manager for Jesster's Combat Tracker
 * Handles all UI-related functionality
 */
export class UIManager {
  constructor(app) {
    this.app = app;
  }
  
  renderInitialUI(appContainer) {
    // This function now takes the appContainer as a parameter
    // to ensure we're working with the correct element
    if (!appContainer) {
      console.error("Fatal Error: appContainer not provided to renderInitialUI");
      return;
    }
    
    appContainer.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Combat Timeline -->
        <div class="md:col-span-2 bg-gray-800 p-4 rounded-lg">
          <h2 class="text-xl font-semibold mb-2">Combat Timeline</h2>
          <div id="combat-timeline" class="combat-timeline"></div>
        </div>
        
        <!-- Heroes Column -->
        <div id="heroes-column" class="bg-gray-800 p-4 rounded-lg shadow-lg border-2 border-transparent">
          <h2 class="text-2xl font-semibold mb-4 text-center text-blue-400">Heroes</h2>
          <div id="heroes-list" class="overflow-y-auto tracker-column space-y-3 pr-2"></div>
          <div class="mt-4">
            <button id="add-hero-btn" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300">Add Hero</button>
          </div>
        </div>
        
        <!-- Monsters Column -->
        <div id="monsters-column" class="bg-gray-800 p-4 rounded-lg shadow-lg border-2 border-transparent">
          <h2 class="text-2xl font-semibold mb-4 text-center text-red-400">Monsters</h2>
          <div id="monsters-list" class="overflow-y-auto tracker-column space-y-3 pr-2"></div>
          <div class="mt-4">
            <button id="add-monster-btn" class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300">Add Monster</button>
          </div>
        </div>
        
        <!-- Combat Controls -->
        <div class="md:col-span-2 flex flex-wrap justify-center gap-4">
          <button id="roll-all-btn" class="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300">Roll All Initiative</button>
          <button id="start-combat-btn" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300" disabled>Start Combat</button>
          <button id="end-turn-btn" class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300" disabled>End Turn</button>
          <button id="reset-combat-btn" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300">Reset Combat</button>
          <button id="end-combat-btn" class="bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300">End Combat</button>
        </div>
        
        <!-- Dice Roller -->
        <div class="md:col-span-2 max-w-md mx-auto bg-gray-800 p-4 rounded-lg flex flex-col items-center space-y-2">
          <h2 class="text-xl font-semibold">Dice Roller</h2>
          <div class="flex w-full items-center space-x-2">
            <input id="dice-roll-input" type="text" class="bg-gray-700 w-full rounded px-2 py-1" placeholder="e.g., 2d8+5 or 1d20">
            <button id="dice-roll-btn" class="bg-gray-600 hover:bg-gray-500 font-bold py-1 px-3 rounded">Roll</button>
            <span id="dice-roll-output" class="font-bold text-lg text-green-400 w-24 text-center">--</span>
          </div>
          <div id="dice-presets-container" class="flex flex-wrap w-full"></div>
        </div>
        
        <!-- Combat Log -->
        <div class="md:col-span-2">
          <h2 class="text-xl font-bold text-gray-100 mb-2">Combat Log</h2>
          <div id="combat-log-container" class="border border-gray-700 p-2 rounded-lg h-48 overflow-y-auto"></div>
        </div>
      </div>
    `;
    
    // Verify that key elements were created
    const criticalElements = [
      'heroes-list', 'monsters-list', 'add-hero-btn', 'add-monster-btn',
      'combat-log-container', 'roll-all-btn', 'start-combat-btn', 'end-turn-btn'
    ];
    
    let allFound = true;
    criticalElements.forEach(id => {
      const element = document.getElementById(id);
      if (!element) {
        console.error(`Critical element #${id} was not created!`);
        allFound = false;
      }
    });
    
    if (!allFound) {
      console.error("Some critical elements were not created. UI may not function correctly.");
    }
  }

  cacheDOMElements() {
    const elementIds = [
      'app-container', 'combat-log-container', 'turn-indicator', 'roll-all-btn', 
      'start-combat-btn', 'end-turn-btn', 'reset-combat-btn', 'end-combat-btn',
      'heroes-list', 'monsters-list', 'add-hero-btn', 'add-monster-btn',
      'combat-timeline', 'dice-roll-input', 'dice-roll-btn', 'dice-roll-output',
      'dice-presets-container', 'heroes-column', 'monsters-column', 'round-counter'
    ];
    
    this.app.elements = {};
    
    elementIds.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        this.app.elements[this.camelCase(id)] = element;
      } else {
        console.warn(`Element with ID "${id}" not found.`);
      }
    });
  }
  
  camelCase(str) {
    return str.replace(/-./g, match => match.charAt(1).toUpperCase());
  }
  
  setupEventListeners() {
    // Set up event listeners for the main UI elements
    
    // Add hero button
    if (this.app.elements.addHeroBtn) {
      this.app.elements.addHeroBtn.addEventListener('click', () => {
        this.app.roster.openRosterModal();
      });
    }
    
    // Add monster button
    if (this.app.elements.addMonsterBtn) {
      this.app.elements.addMonsterBtn.addEventListener('click', () => {
        this.app.monsters.openMonsterManualModal();
      });
    }
    
    // Roll all initiative button
    if (this.app.elements.rollAllBtn) {
      this.app.elements.rollAllBtn.addEventListener('click', () => {
        this.app.combat.rollAllInitiative();
      });
    }
    
    // Start combat button
    if (this.app.elements.startCombatBtn) {
      this.app.elements.startCombatBtn.addEventListener('click', () => {
        this.app.combat.startCombat();
      });
    }
    
    // End turn button
    if (this.app.elements.endTurnBtn) {
      this.app.elements.endTurnBtn.addEventListener('click', () => {
        this.app.combat.endTurn();
      });
    }
    
    // Reset combat button
    if (this.app.elements.resetCombatBtn) {
      this.app.elements.resetCombatBtn.addEventListener('click', () => {
        this.app.combat.resetCombat();
      });
    }
    
    // End combat button
    if (this.app.elements.endCombatBtn) {
      this.app.elements.endCombatBtn.addEventListener('click', () => {
        this.app.combat.endCombat();
      });
    }
    
    // Dice roller
    if (this.app.elements.diceRollBtn && this.app.elements.diceRollInput) {
      this.app.elements.diceRollBtn.addEventListener('click', () => {
        const diceExpression = this.app.elements.diceRollInput.value;
        if (diceExpression) {
          this.app.dice.roll(diceExpression).then(result => {
            if (this.app.elements.diceRollOutput) {
              this.app.elements.diceRollOutput.textContent = result;
            }
            this.app.logEvent(`Rolled ${diceExpression}: ${result}`);
          });
        }
      });
      
      this.app.elements.diceRollInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.app.elements.diceRollBtn.click();
        }
      });
    }
    
    console.log("Event listeners set up.");
  }
  
  renderCombatLog() {
    const logDiv = document.getElementById('combat-log-container');
    if (!logDiv) return;
    
    logDiv.innerHTML = '';
    
    this.app.state.combatLog.slice(-50).forEach(entry => {
      const p = document.createElement('p');
      p.className = 'log-entry text-sm';
      p.textContent = entry;
      logDiv.appendChild(p);
    });
    
    logDiv.scrollTop = logDiv.scrollHeight;
  }
  
  showAlert(message, title = 'Notification') {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-lg w-full mx-auto text-center">
        <h3 class="text-xl font-bold text-yellow-400 mb-4">${title}</h3>
        <p class="text-gray-300 mb-4 whitespace-pre-wrap">${message}</p>
        <button class="close-alert-btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">OK</button>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.close-alert-btn').addEventListener('click', () => {
      modal.remove();
    });
  }
  
  showConfirm(message, onConfirm) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-lg w-full mx-auto text-center">
        <h3 class="text-xl font-bold text-red-400 mb-4">Confirm Action</h3>
        <p class="text-gray-300 mb-6">${message}</p>
        <div class="flex justify-center gap-4">
          <button class="cancel-btn bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Cancel</button>
          <button class="confirm-btn bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Confirm</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.cancel-btn').addEventListener('click', () => {
      modal.remove();
    });
    
    modal.querySelector('.confirm-btn').addEventListener('click', () => {
      onConfirm();
      modal.remove();
    });
  }
}
