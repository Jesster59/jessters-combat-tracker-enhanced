/**
 * UI Manager for Jesster's Combat Tracker
 * Handles all UI-related functionality
 */
class UIManager {
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
          <div id="combat-timeline" class="combat-timeline flex items-center justify-between">
            <!-- Round counter -->
            <div class="flex items-center justify-center bg-gray-700 px-4 py-2 rounded-lg">
              <span class="text-gray-400 mr-2">Round:</span>
              <span id="round-counter" class="text-xl font-bold">1</span>
            </div>
            
            <!-- Initiative type selector -->
            <div class="flex items-center bg-gray-700 px-4 py-2 rounded-lg">
              <span class="text-gray-400 mr-2">Initiative:</span>
              <select id="initiative-type" class="bg-gray-600 rounded px-2 py-1 text-white">
                <option value="dynamic">Dynamic (Team)</option>
                <option value="team">Fixed Team</option>
                <option value="normal">Individual</option>
              </select>
            </div>
            
            <!-- Player view options -->
            <div class="flex items-center bg-gray-700 px-4 py-2 rounded-lg">
              <span class="text-gray-400 mr-2">Player View:</span>
              <select id="player-hp-view" class="bg-gray-600 rounded px-2 py-1 text-white">
                <option value="descriptive">Descriptive HP</option>
                <option value="exact">Exact HP</option>
                <option value="none">No HP</option>
              </select>
            </div>
            
            <!-- Player view button -->
            <button id="open-player-view-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
              Open Player View
            </button>
          </div>
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
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-semibold text-center text-red-400">Monsters</h2>
            <button id="open-encounter-builder-btn" class="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm">
              Encounter Builder
            </button>
          </div>
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
    var criticalElements = [
      'heroes-list', 'monsters-list', 'add-hero-btn', 'add-monster-btn',
      'combat-log-container', 'roll-all-btn', 'start-combat-btn', 'end-turn-btn',
      'initiative-type', 'player-hp-view', 'open-player-view-btn', 'open-encounter-builder-btn'
    ];
    
    var allFound = true;
    for (var i = 0; i < criticalElements.length; i++) {
      var id = criticalElements[i];
      var element = document.getElementById(id);
      if (!element) {
        console.error("Critical element #" + id + " was not created!");
        allFound = false;
      }
    }
    
    if (!allFound) {
      console.error("Some critical elements were not created. UI may not function correctly.");
    }
    
    // After rendering the UI, also render these components
    setTimeout(() => {
      this.renderDicePresets();
    }, 0);
  }

  cacheDOMElements() {
    var elementIds = [
      'app-container', 'combat-log-container', 'turn-indicator', 'roll-all-btn', 
      'start-combat-btn', 'end-turn-btn', 'reset-combat-btn', 'end-combat-btn',
      'heroes-list', 'monsters-list', 'add-hero-btn', 'add-monster-btn',
      'combat-timeline', 'dice-roll-input', 'dice-roll-btn', 'dice-roll-output',
      'dice-presets-container', 'heroes-column', 'monsters-column', 'round-counter',
      'initiative-type', 'player-hp-view', 'open-player-view-btn', 'open-encounter-builder-btn'
    ];
    
    this.app.elements = {};
    
    for (var i = 0; i < elementIds.length; i++) {
      var id = elementIds[i];
      var element = document.getElementById(id);
      if (element) {
        this.app.elements[this.camelCase(id)] = element;
      } else {
        // Instead of just warning, let's create these elements if they don't exist
        if (id === 'initiative-type' || id === 'player-hp-view' || id === 'open-player-view-btn') {
          console.warn(`Element with ID "${id}" not found. Creating it now.`);
          this.createMissingElement(id);
        } else {
          console.warn(`Element with ID "${id}" not found.`);
        }
      }
    }
  }
  
  // ... [rest of the UIManager class remains unchanged]
  
  setupEventListeners() {
    // Set up event listeners for the main UI elements
    var self = this;
    
    // Add hero button
    if (this.app.elements.addHeroBtn) {
      this.app.elements.addHeroBtn.addEventListener('click', function() {
        self.app.roster.openRosterModal();
      });
    }
    
    // Add monster button
    if (this.app.elements.addMonsterBtn) {
      this.app.elements.addMonsterBtn.addEventListener('click', function() {
        self.app.monsters.openMonsterManualModal();
      });
    }
    
    // Roll all initiative button
    if (this.app.elements.rollAllBtn) {
      this.app.elements.rollAllBtn.addEventListener('click', function() {
        self.app.combat.rollAllInitiative();
      });
    }
    
    // Start combat button
    if (this.app.elements.startCombatBtn) {
      this.app.elements.startCombatBtn.addEventListener('click', function() {
        self.app.combat.startCombat();
      });
    }
    
    // End turn button
    if (this.app.elements.endTurnBtn) {
      this.app.elements.endTurnBtn.addEventListener('click', function() {
        self.app.combat.endTurn();
      });
    }
    
    // Reset combat button
    if (this.app.elements.resetCombatBtn) {
      this.app.elements.resetCombatBtn.addEventListener('click', function() {
        self.app.combat.resetCombat();
      });
    }
    
    // End combat button
    if (this.app.elements.endCombatBtn) {
      this.app.elements.endCombatBtn.addEventListener('click', function() {
        self.app.combat.endCombat();
      });
    }
    
    // Player view button
    if (this.app.elements.openPlayerViewBtn) {
      this.app.elements.openPlayerViewBtn.addEventListener('click', function() {
        self.app.combat.openOrRefreshPlayerView();
      });
    }
    
    // Encounter builder button
    if (this.app.elements.openEncounterBuilderBtn) {
      this.app.elements.openEncounterBuilderBtn.addEventListener('click', function() {
        self.app.encounter.openEncounterBuilder();
      });
    }
    
    // Dice roller
    if (this.app.elements.diceRollBtn && this.app.elements.diceRollInput) {
      this.app.elements.diceRollBtn.addEventListener('click', function() {
        var diceExpression = self.app.elements.diceRollInput.value;
        if (diceExpression) {
          self.app.dice.roll(diceExpression).then(function(result) {
            if (self.app.elements.diceRollOutput) {
              self.app.elements.diceRollOutput.textContent = result;
            }
            self.app.logEvent("Rolled " + diceExpression + ": " + result);
          });
        }
      });
      
      this.app.elements.diceRollInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          self.app.elements.diceRollBtn.click();
        }
      });
    }
    
    // Add dice presets
    this.renderDicePresets();
    
    console.log("Event listeners set up.");
  }
  
  // ... [rest of the UIManager class remains unchanged]
}
