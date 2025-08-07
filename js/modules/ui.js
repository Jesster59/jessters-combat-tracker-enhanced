/**
 * UI Manager for Jesster's Combat Tracker
 * Handles all user interface rendering and interactions
 */
class UIManager {
  constructor(app) {
    this.app = app;
    this.elements = {};
    console.log("UI.js loaded successfully");
  }
  
  /**
   * Render the initial UI structure
   */
  renderInitialUI(container) {
    container.innerHTML = `
      <div class="min-h-screen bg-gray-900 text-white">
        <!-- Header -->
        <header class="bg-gray-800 shadow-lg">
          <div class="container mx-auto px-4 py-6">
            <div class="flex items-center justify-between">
              <h1 class="text-3xl font-bold text-blue-400">⚔️ Jesster's Combat Tracker</h1>
              <div class="flex items-center space-x-4">
                <div id="combat-status" class="text-lg font-semibold text-gray-300">
                  Combat Not Started
                </div>
                <button id="start-combat-btn" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                  Start Combat
                </button>
                <button id="end-combat-btn" class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded hidden">
                  End Combat
                </button>
              </div>
            </div>
          </div>
        </header>

        <!-- Main Content -->
        <main class="container mx-auto px-4 py-8">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <!-- Left Column: Creatures -->
            <div class="lg:col-span-2">
              <div class="bg-gray-800 rounded-lg shadow-lg p-6">
                <div class="flex items-center justify-between mb-6">
                  <h2 class="text-2xl font-bold text-blue-400">Combat Participants</h2>
                  <div class="flex space-x-2">
                    <button id="add-hero-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                      Add Hero
                    </button>
                    <button id="add-monster-btn" class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
                      Add Monster
                    </button>
                  </div>
                </div>
                
                <div id="creatures-container" class="space-y-4">
                  <div class="text-center text-gray-400 py-8">
                    No creatures added yet. Click "Add Hero" or "Add Monster" to begin.
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column: Tools and Log -->
            <div class="space-y-6">
              
              <!-- Initiative Tracker -->
              <div class="bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 class="text-xl font-bold text-blue-400 mb-4">Initiative Order</h3>
                <div id="initiative-container" class="space-y-2">
                  <div class="text-center text-gray-400 py-4">
                    No initiative rolled yet
                  </div>
                </div>
                <div class="mt-4 flex space-x-2">
                  <button id="roll-initiative-btn" class="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded flex-1">
                    Roll Initiative
                  </button>
                  <button id="next-turn-btn" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex-1 hidden">
                    Next Turn
                  </button>
                </div>
              </div>

              <!-- Quick Dice Roller -->
              <div class="bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 class="text-xl font-bold text-blue-400 mb-4">Quick Dice</h3>
                <div class="grid grid-cols-3 gap-2 mb-4">
                  <button class="dice-btn bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-3 rounded" data-dice="1d4">d4</button>
                  <button class="dice-btn bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-3 rounded" data-dice="1d6">d6</button>
                  <button class="dice-btn bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-3 rounded" data-dice="1d8">d8</button>
                  <button class="dice-btn bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-3 rounded" data-dice="1d10">d10</button>
                  <button class="dice-btn bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-3 rounded" data-dice="1d12">d12</button>
                  <button class="dice-btn bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-3 rounded" data-dice="1d20">d20</button>
                </div>
                <div class="flex space-x-2">
                  <input type="text" id="custom-dice-input" placeholder="2d6+3" class="flex-1 bg-gray-700 text-white px-3 py-2 rounded">
                  <button id="roll-custom-dice-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Roll
                  </button>
                </div>
                <div id="dice-results" class="mt-4 p-3 bg-gray-700 rounded min-h-[60px]">
                  <div class="text-gray-400 text-center">Roll some dice to see results</div>
                </div>
              </div>

              <!-- Combat Log -->
              <div class="bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 class="text-xl font-bold text-blue-400 mb-4">Combat Log</h3>
                <div id="combat-log" class="bg-gray-900 rounded p-4 h-64 overflow-y-auto text-sm">
                  <div class="text-gray-400">Combat log will appear here...</div>
                </div>
                <button id="clear-log-btn" class="mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm">
                  Clear Log
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    `;
  }
  
  /**
   * Cache DOM elements for better performance
   */
  cacheDOMElements() {
    this.elements = {
      combatStatus: document.getElementById('combat-status'),
      startCombatBtn: document.getElementById('start-combat-btn'),
      endCombatBtn: document.getElementById('end-combat-btn'),
      addHeroBtn: document.getElementById('add-hero-btn'),
      addMonsterBtn: document.getElementById('add-monster-btn'),
      creaturesContainer: document.getElementById('creatures-container'),
      initiativeContainer: document.getElementById('initiative-container'),
      rollInitiativeBtn: document.getElementById('roll-initiative-btn'),
      nextTurnBtn: document.getElementById('next-turn-btn'),
      customDiceInput: document.getElementById('custom-dice-input'),
      rollCustomDiceBtn: document.getElementById('roll-custom-dice-btn'),
      diceResults: document.getElementById('dice-results'),
      combatLog: document.getElementById('combat-log'),
      clearLogBtn: document.getElementById('clear-log-btn')
    };
  }
  
  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Combat controls
    this.elements.startCombatBtn?.addEventListener('click', () => {
      this.app.combat.startCombat();
    });
    
    this.elements.endCombatBtn?.addEventListener('click', () => {
      this.app.combat.endCombat();
    });
    
    // Add creature buttons
    this.elements.addHeroBtn?.addEventListener('click', () => {
      this.openAddCreatureModal('hero');
    });
    
    this.elements.addMonsterBtn?.addEventListener('click', () => {
      this.openAddCreatureModal('monster');
    });
    
    // Initiative controls
    this.elements.rollInitiativeBtn?.addEventListener('click', () => {
      this.app.combat.rollInitiativeForAll();
    });
    
    this.elements.nextTurnBtn?.addEventListener('click', () => {
      this.app.combat.nextTurn();
    });
    
    // Dice rolling
    document.querySelectorAll('.dice-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const diceNotation = e.target.dataset.dice;
        this.app.dice.rollAndDisplay(diceNotation);
      });
    });
    
    this.elements.rollCustomDiceBtn?.addEventListener('click', () => {
      const diceNotation = this.elements.customDiceInput.value.trim();
      if (diceNotation) {
        this.app.dice.rollAndDisplay(diceNotation);
        this.elements.customDiceInput.value = '';
      }
    });
    
    this.elements.customDiceInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.elements.rollCustomDiceBtn.click();
      }
    });
    
    // Clear log
    this.elements.clearLogBtn?.addEventListener('click', () => {
      this.app.state.combatLog = [];
      this.renderCombatLog();
    });
  }
  
  /**
   * Open the add creature modal
   */
  openAddCreatureModal(type) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 flex items-center justify-center z-50 p-4 modal-backdrop';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    
    const isHero = type === 'hero';
    const title = isHero ? 'Add Hero' : 'Add Monster';
    const bgColor = isHero ? 'bg-blue-600' : 'bg-purple-600';
    const hoverColor = isHero ? 'hover:bg-blue-700' : 'hover:bg-purple-700';
    
    modal.innerHTML = `
      <div class="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-md w-full mx-auto fade-in">
        <h3 class="text-xl font-bold text-blue-400 mb-4">${title}</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-gray-300 mb-2">Name:</label>
            <input type="text" id="creature-name" class="w-full bg-gray-700 text-white px-3 py-2 rounded" placeholder="Enter name">
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-300 mb-2">Max HP:</label>
              <input type="number" id="creature-max-hp" class="w-full bg-gray-700 text-white px-3 py-2 rounded" placeholder="100">
            </div>
            <div>
              <label class="block text-gray-300 mb-2">AC:</label>
              <input type="number" id="creature-ac" class="w-full bg-gray-700 text-white px-3 py-2 rounded" placeholder="15">
            </div>
          </div>
          
          <div>
            <label class="block text-gray-300 mb-2">Initiative Modifier:</label>
            <input type="number" id="creature-init" class="w-full bg-gray-700 text-white px-3 py-2 rounded" placeholder="2">
          </div>
        </div>
        
        <div class="flex justify-end space-x-2 mt-6">
          <button id="cancel-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            Cancel
          </button>
          <button id="add-creature-btn" class="${bgColor} ${hoverColor} text-white font-bold py-2 px-4 rounded">
            Add ${isHero ? 'Hero' : 'Monster'}
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Focus on name input
    document.getElementById('creature-name').focus();
    
    // Event listeners
    document.getElementById('cancel-btn').addEventListener('click', () => {
      modal.remove();
    });
    
    document.getElementById('add-creature-btn').addEventListener('click', () => {
      const name = document.getElementById('creature-name').value.trim();
      const maxHP = parseInt(document.getElementById('creature-max-hp').value) || 100;
      const ac = parseInt(document.getElementById('creature-ac').value) || 15;
      const initMod = parseInt(document.getElementById('creature-init').value) || 0;
      
      if (!name) {
        alert('Please enter a name for the creature.');
        return;
      }
      
      const creature = {
        id: Date.now().toString(),
        name: name,
        type: type,
        maxHP: maxHP,
        currentHP: maxHP,
        ac: ac,
        initiativeModifier: initMod,
        initiative: null,
        conditions: [],
        notes: ''
      };
      
      this.app.combat.addCreature(creature);
      modal.remove();
    });
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }
  
  /**
   * Render the creatures list
   */
  renderCreatures() {
    const container = this.elements.creaturesContainer;
    if (!container) return;
    
    const creatures = this.app.combat.creatures || [];
    
    if (creatures.length === 0) {
      container.innerHTML = `
        <div class="text-center text-gray-400 py-8">
          No creatures added yet. Click "Add Hero" or "Add Monster" to begin.
        </div>
      `;
      return;
    }
    
    container.innerHTML = creatures.map(creature => `
      <div class="creature-card bg-gray-700 rounded-lg p-4 ${creature.id === this.app.state.currentTurn ? 'active-turn' : ''}">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="text-2xl">${creature.type === 'hero' ? '🛡️' : '👹'}</div>
            <div>
              <h4 class="text-lg font-bold text-white">${creature.name}</h4>
              <div class="text-sm text-gray-300">
                HP: ${creature.currentHP}/${creature.maxHP} | AC: ${creature.ac}
                ${creature.initiative !== null ? ` | Init: ${creature.initiative}` : ''}
              </div>
            </div>
          </div>
          
          <div class="flex items-center space-x-2">
            <button class="damage-btn bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm" data-creature-id="${creature.id}">
              Damage
            </button>
            <button class="heal-btn bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm" data-creature-id="${creature.id}">
              Heal
            </button>
            <button class="remove-btn bg-gray-600 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded text-sm" data-creature-id="${creature.id}">
              Remove
            </button>
          </div>
        </div>
        
        ${creature.conditions.length > 0 ? `
          <div class="mt-2">
            <div class="text-xs text-gray-400 mb-1">Conditions:</div>
            <div class="flex flex-wrap gap-1">
              ${creature.conditions.map(condition => `
                <span class="condition-tag bg-yellow-600 text-yellow-100">${condition}</span>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `).join('');
    
    // Add event listeners for creature buttons
    container.querySelectorAll('.damage-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const creatureId = e.target.dataset.creatureId;
        this.openDamageModal(creatureId);
      });
    });
    
    container.querySelectorAll('.heal-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const creatureId = e.target.dataset.creatureId;
        this.openHealModal(creatureId);
      });
    });
    
    container.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const creatureId = e.target.dataset.creatureId;
        if (confirm('Are you sure you want to remove this creature?')) {
          this.app.combat.removeCreature(creatureId);
        }
      });
    });
  }
  
  /**
   * Open damage modal
   */
  openDamageModal(creatureId) {
    const creature = this.app.combat.getCreature(creatureId);
    if (!creature) return;
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 flex items-center justify-center z-50 p-4 modal-backdrop';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    
    modal.innerHTML = `
      <div class="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-sm w-full mx-auto fade-in">
        <h3 class="text-xl font-bold text-red-400 mb-4">Damage ${creature.name}</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-gray-300 mb-2">Damage Amount:</label>
            <input type="number" id="damage-amount" class="w-full bg-gray-700 text-white px-3 py-2 rounded" placeholder="10" min="0">
          </div>
        </div>
        
        <div class="flex justify-end space-x-2 mt-6">
          <button id="cancel-damage-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            Cancel
          </button>
          <button id="apply-damage-btn" class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
            Apply Damage
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    document.getElementById('damage-amount').focus();
    
    document.getElementById('cancel-damage-btn').addEventListener('click', () => {
      modal.remove();
    });
    
    document.getElementById('apply-damage-btn').addEventListener('click', () => {
      const damage = parseInt(document.getElementById('damage-amount').value) || 0;
      if (damage > 0) {
        this.app.damage.applyDamage(creatureId, damage);
      }
      modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }
  
  /**
   * Open heal modal
   */
  openHealModal(creatureId) {
    const creature = this.app.combat.getCreature(creatureId);
    if (!creature) return;
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 flex items-center justify-center z-50 p-4 modal-backdrop';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    
    modal.innerHTML = `
      <div class="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-sm w-full mx-auto fade-in">
        <h3 class="text-xl font-bold text-green-400 mb-4">Heal ${creature.name}</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-gray-300 mb-2">Healing Amount:</label>
            <input type="number" id="heal-amount" class="w-full bg-gray-700 text-white px-3 py-2 rounded" placeholder="10" min="0">
          </div>
        </div>
        
        <div class="flex justify-end space-x-2 mt-6">
          <button id="cancel-heal-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            Cancel
          </button>
          <button id="apply-heal-btn" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Apply Healing
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    document.getElementById('heal-amount').focus();
    
    document.getElementById('cancel-heal-btn').addEventListener('click', () => {
      modal.remove();
    });
    
    document.getElementById('apply-heal-btn').addEventListener('click', () => {
      const healing = parseInt(document.getElementById('heal-amount').value) || 0;
      if (healing > 0) {
        this.app.damage.applyHealing(creatureId, healing);
      }
      modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }
  
  /**
   * Render the initiative order
   */
  renderInitiativeOrder() {
    const container = this.elements.initiativeContainer;
    if (!container) return;
    
    const creatures = this.app.combat.creatures || [];
    const sortedCreatures = creatures
      .filter(c => c.initiative !== null)
      .sort((a, b) => b.initiative - a.initiative);
    
    if (sortedCreatures.length === 0) {
      container.innerHTML = `
        <div class="text-center text-gray-400 py-4">
          No initiative rolled yet
        </div>
      `;
      return;
    }
    
    container.innerHTML = sortedCreatures.map((creature, index) => `
      <div class="flex items-center justify-between p-2 rounded ${creature.id === this.app.state.currentTurn ? 'bg-blue-600' : 'bg-gray-700'}">
        <div class="flex items-center space-x-2">
          <span class="text-lg font-bold">${index + 1}.</span>
          <span class="text-sm">${creature.type === 'hero' ? '🛡️' : '👹'}</span>
          <span class="font-semibold">${creature.name}</span>
        </div>
        <span class="font-bold text-yellow-400">${creature.initiative}</span>
      </div>
    `).join('');
  }
  
  /**
   * Render the combat log
   */
  renderCombatLog() {
    const container = this.elements.combatLog;
    if (!container) return;
    
    const logs = this.app.state.combatLog || [];
    
    if (logs.length === 0) {
      container.innerHTML = '<div class="text-gray-400">Combat log will appear here...</div>';
      return;
    }
    
    container.innerHTML = logs.map(log => `
      <div class="mb-1 text-gray-300">${log}</div>
    `).join('');
    
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
  }
  
  /**
   * Update combat status display
   */
  updateCombatStatus() {
    if (!this.elements.combatStatus) return;
    
    if (this.app.state.combatStarted) {
      this.elements.combatStatus.textContent = `Round ${this.app.state.roundNumber} - Combat Active`;
      this.elements.startCombatBtn?.classList.add('hidden');
      this.elements.endCombatBtn?.classList.remove('hidden');
      this.elements.nextTurnBtn?.classList.remove('hidden');
    } else {
      this.elements.combatStatus.textContent = 'Combat Not Started';
      this.elements.startCombatBtn?.classList.remove('hidden');
      this.elements.endCombatBtn?.classList.add('hidden');
      this.elements.nextTurnBtn?.classList.add('hidden');
    }
  }
  
  /**
   * Show an alert message
   */
  showAlert(message, title = 'Notification') {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 flex items-center justify-center z-50 p-4 modal-backdrop';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    
    modal.innerHTML = `
      <div class="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-sm w-full mx-auto fade-in">
        <h3 class="text-xl font-bold text-blue-400 mb-4">${title}</h3>
        <p class="text-gray-300 mb-6">${message}</p>
        <div class="flex justify-end">
          <button id="alert-ok-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            OK
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('alert-ok-btn').addEventListener('click', () => {
      modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }
  
  /**
   * Show a confirmation dialog
   */
  showConfirm(message, onConfirm) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 flex items-center justify-center z-50 p-4 modal-backdrop';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    
    modal.innerHTML = `
      <div class="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-sm w-full mx-auto fade-in">
        <h3 class="text-xl font-bold text-yellow-400 mb-4">Confirm</h3>
        <p class="text-gray-300 mb-6">${message}</p>
        <div class="flex justify-end space-x-2">
          <button id="confirm-cancel-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            Cancel
          </button>
          <button id="confirm-ok-btn" class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
            Confirm
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('confirm-cancel-btn').addEventListener('click', () => {
      modal.remove();
    });
    
    document.getElementById('confirm-ok-btn').addEventListener('click', () => {
      onConfirm();
      modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }
}
