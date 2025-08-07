/**
 * UI Manager for Jesster's Combat Tracker
 * Handles all UI-related functionality
 */
class UIManager {
  constructor(app) {
    this.app = app;
    this.dicePresets = [
      { label: 'd20', value: '1d20' },
      { label: 'Adv', value: '2d20kh1' },
      { label: 'Dis', value: '2d20kl1' },
      { label: 'd4', value: '1d4' },
      { label: 'd6', value: '1d6' },
      { label: 'd8', value: '1d8' },
      { label: 'd10', value: '1d10' },
      { label: 'd12', value: '1d12' },
      { label: 'd100', value: '1d100' }
    ];
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
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-semibold">Combat Timeline</h2>
            <div class="flex items-center">
              <span class="text-gray-400 mr-2">Turn:</span>
              <span id="turn-indicator" class="text-xl font-bold text-yellow-400">Waiting to Start</span>
            </div>
          </div>
          <div id="combat-timeline" class="combat-timeline flex items-center justify-between mt-3">
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
          <button id="end-combat-btn" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300">End Combat</button>
        </div>
        
        <!-- Combat Log -->
        <div class="md:col-span-2 bg-gray-800 p-4 rounded-lg">
          <div class="flex justify-between items-center mb-2">
            <h2 class="text-xl font-semibold">Combat Log</h2>
            <div class="flex space-x-2">
              <button id="clear-log-btn" class="text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button id="export-log-btn" class="text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </div>
          </div>
          <div id="combat-log" class="bg-gray-900 p-3 rounded-lg h-40 overflow-y-auto text-sm"></div>
        </div>
        
        <!-- Dice Roller -->
        <div class="md:col-span-2 bg-gray-800 p-4 rounded-lg">
          <h2 class="text-xl font-semibold mb-2">Dice Roller</h2>
          <div class="flex flex-wrap gap-2 mb-3">
            ${this.dicePresets.map(preset => `
              <button class="dice-preset-btn bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1 px-3 rounded" data-value="${preset.value}">
                ${preset.label}
              </button>
            `).join('')}
          </div>
          <div class="flex gap-2">
            <input type="text" id="dice-input" class="bg-gray-700 rounded px-3 py-2 text-white flex-grow" placeholder="e.g., 2d6+3">
            <button id="roll-dice-btn" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">Roll</button>
          </div>
          <div id="dice-results" class="mt-2 text-gray-300"></div>
        </div>
        
        <!-- Hidden elements for modals and alerts -->
        <div id="modal-container" class="fixed inset-0 flex items-center justify-center z-50 hidden">
          <div class="modal-backdrop fixed inset-0 bg-black opacity-50"></div>
          <div class="modal-content bg-gray-800 rounded-lg shadow-xl p-6 max-w-lg w-full mx-auto z-10">
            <!-- Modal content will be inserted here -->
          </div>
        </div>
        
        <div id="alert-container" class="fixed top-4 right-4 z-50">
          <!-- Alerts will be inserted here -->
        </div>
        
        <!-- Hidden inputs for lair actions -->
        <div class="hidden">
          <input type="checkbox" id="lair-action-enable">
          <textarea id="lair-action-text"></textarea>
        </div>
      </div>
    `;
  }
  
  cacheDOMElements() {
    // Cache commonly used elements for better performance
    this.elements = {
      heroesColumn: document.getElementById('heroes-column'),
      monsterColumn: document.getElementById('monsters-column'),
      heroesList: document.getElementById('heroes-list'),
      monstersList: document.getElementById('monsters-list'),
      combatLog: document.getElementById('combat-log'),
      diceInput: document.getElementById('dice-input'),
      diceResults: document.getElementById('dice-results'),
      modalContainer: document.getElementById('modal-container'),
      modalContent: document.querySelector('#modal-container .modal-content'),
      alertContainer: document.getElementById('alert-container'),
      turnIndicator: document.getElementById('turn-indicator'),
      roundCounter: document.getElementById('round-counter')
    };
  }
  
  setupEventListeners() {
    // Combat controls
    document.getElementById('roll-all-btn').addEventListener('click', () => {
      this.app.combat.rollAllInitiative();
    });
    
    document.getElementById('start-combat-btn').addEventListener('click', () => {
      this.app.combat.startCombat();
    });
    
    document.getElementById('end-turn-btn').addEventListener('click', () => {
      this.app.combat.endTurn();
    });
    
    document.getElementById('reset-combat-btn').addEventListener('click', () => {
      this.app.combat.resetCombat();
    });
    
    document.getElementById('end-combat-btn').addEventListener('click', () => {
      this.app.combat.endCombat();
    });
    
    // Add combatants
    document.getElementById('add-hero-btn').addEventListener('click', () => {
      this.app.roster.openAddHeroModal();
    });
    
    document.getElementById('add-monster-btn').addEventListener('click', () => {
      this.app.monsters.openAddMonsterModal();
    });
    
    // Encounter builder
    document.getElementById('open-encounter-builder-btn').addEventListener('click', () => {
      if (this.app.encounter) {
        this.app.encounter.openEncounterBuilder();
      }
    });
    
    // Player view
    document.getElementById('open-player-view-btn').addEventListener('click', () => {
      this.app.combat.openOrRefreshPlayerView();
    });
    
    // Combat log controls
    document.getElementById('clear-log-btn').addEventListener('click', () => {
      this.app.state.combatLog = [];
      this.renderCombatLog();
      this.app.logEvent("Combat log cleared.");
    });
    
    document.getElementById('export-log-btn').addEventListener('click', () => {
      this.exportCombatLog();
    });
    
    // Dice roller
    document.getElementById('roll-dice-btn').addEventListener('click', () => {
      const diceExpression = this.elements.diceInput.value;
      if (diceExpression) {
        this.app.dice.rollAndDisplay(diceExpression);
      }
    });
    
    // Dice presets
    document.querySelectorAll('.dice-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const diceExpression = btn.dataset.value;
        this.app.dice.rollAndDisplay(diceExpression);
      });
    });
    
    // Allow Enter key to roll dice
    this.elements.diceInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const diceExpression = this.elements.diceInput.value;
        if (diceExpression) {
          this.app.dice.rollAndDisplay(diceExpression);
        }
      }
    });
    
    // Modal backdrop click to close
    document.querySelector('.modal-backdrop')?.addEventListener('click', () => {
      this.hideModal();
    });
    
    // Initialize the initiative tracker
    if (this.app.initiative) {
      setTimeout(() => {
        this.app.initiative.init();
      }, 100);
    }
    
    // Add group saving throw button
    if (this.app.saves) {
      setTimeout(() => {
        this.app.saves.addGroupSavingThrowButton();
      }, 100);
    }
    
    // Add lair actions button
    if (this.app.lair) {
      setTimeout(() => {
        this.app.lair.addLairActionsButton();
      }, 100);
    }
  }
  
  renderCombatLog() {
    if (!this.elements.combatLog) return;
    
    const logEntries = this.app.state.combatLog;
    
    // Clear the log
    this.elements.combatLog.innerHTML = '';
    
    // Add each log entry
    logEntries.forEach(entry => {
      const logItem = document.createElement('div');
      logItem.className = 'mb-1 text-gray-300';
      logItem.textContent = entry;
      this.elements.combatLog.appendChild(logItem);
    });
    
    // Scroll to bottom
    this.elements.combatLog.scrollTop = this.elements.combatLog.scrollHeight;
  }
  
  exportCombatLog() {
    const logText = this.app.state.combatLog.join('\n');
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `combat-log-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.app.logEvent("Combat log exported.");
  }
  
  showModal(content) {
    if (!this.elements.modalContainer || !this.elements.modalContent) return;
    
    this.elements.modalContent.innerHTML = content;
    this.elements.modalContainer.classList.remove('hidden');
  }
  
  hideModal() {
    if (!this.elements.modalContainer) return;
    
    this.elements.modalContainer.classList.add('hidden');
  }
  
  showAlert(message, title = 'Notification') {
    if (!this.elements.alertContainer) return;
    
    const alertId = 'alert-' + Date.now();
    const alert = document.createElement('div');
    alert.id = alertId;
    alert.className = 'bg-gray-800 text-white p-4 rounded-lg shadow-lg mb-3 transform translate-x-full transition-transform duration-300 ease-in-out';
    
    alert.innerHTML = `
      <div class="flex justify-between items-start">
        <div>
          <h3 class="font-bold text-yellow-400">${title}</h3>
          <p class="mt-1">${message}</p>
        </div>
        <button class="text-gray-400 hover:text-white close-alert-btn">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    `;
    
    this.elements.alertContainer.appendChild(alert);
    
    // Add event listener to close button
    alert.querySelector('.close-alert-btn').addEventListener('click', () => {
      this.dismissAlert(alertId);
    });
    
    // Animate in
    setTimeout(() => {
      alert.classList.remove('translate-x-full');
    }, 10);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      this.dismissAlert(alertId);
    }, 5000);
  }
  
  dismissAlert(alertId) {
    const alert = document.getElementById(alertId);
    if (!alert) return;
    
    // Animate out
    alert.classList.add('translate-x-full');
    
    // Remove after animation
    setTimeout(() => {
      alert.remove();
    }, 300);
  }
  
  showConfirm(message, onConfirm) {
    const content = `
      <h3 class="text-xl font-bold text-yellow-400 mb-4">Confirmation</h3>
      <p class="mb-6">${message}</p>
      <div class="flex justify-end space-x-2">
        <button id="confirm-cancel-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
          Cancel
        </button>
        <button id="confirm-ok-btn" class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
          Confirm
        </button>
      </div>
    `;
    
    this.showModal(content);
    
    // Add event listeners
    document.getElementById('confirm-cancel-btn').addEventListener('click', () => {
      this.hideModal();
    });
    
    document.getElementById('confirm-ok-btn').addEventListener('click', () => {
      this.hideModal();
      if (typeof onConfirm === 'function') {
        onConfirm();
      }
    });
  }
  
  createCombatantCard(data) {
    const card = document.createElement('div');
    card.id = data.id;
    card.className = 'combatant-card bg-gray-700 rounded-lg p-3 shadow-md';
    card.dataset.type = data.type;
    
    // Create the card content
    card.innerHTML = `
      <div class="flex justify-between items-start">
        <div class="flex items-center combatant-header">
          <img src="${data.image || 'img/default-avatar.png'}" alt="${data.name}" class="combatant-img w-10 h-10 rounded-full mr-3 border-2 ${data.type === 'hero' ? 'border-blue-300' : 'border-red-300'}">
          <div>
            <h3 class="combatant-name font-bold text-lg">${data.name}</h3>
            <div class="flex items-center text-sm text-gray-400">
              <span>AC: ${data.ac || '—'}</span>
              <span class="mx-2">|</span>
              <span>Init: <input type="number" class="initiative-input bg-gray-600 w-12 text-center rounded" value="${data.initiative || ''}"></span>
            </div>
          </div>
        </div>
        <div class="flex">
          <button class="edit-combatant-btn text-gray-400 hover:text-white mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button class="remove-combatant-btn text-gray-400 hover:text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      
      <div class="mt-3">
        <div class="flex items-center justify-between mb-1">
          <span class="text-sm text-gray-400">HP:</span>
          <span class="text-sm text-gray-400">${data.currentHp || 0}/${data.maxHp || 0}</span>
        </div>
        <div class="hp-bar bg-gray-600 rounded-full h-2 overflow-hidden">
          <div class="hp-bar-current bg-green-500 h-full" style="width: ${data.maxHp ? (data.currentHp / data.maxHp) * 100 : 0}%"></div>
        </div>
        <div class="flex items-center mt-2">
          <button class="hp-minus-btn bg-red-600 hover:bg-red-700 text-white w-6 h-6 rounded-l flex items-center justify-center">-</button>
          <input type="number" class="hp-input bg-gray-600 text-center w-full" value="${data.currentHp || 0}" data-max-hp="${data.maxHp || 0}">
          <button class="hp-plus-btn bg-green-600 hover:bg-green-700 text-white w-6 h-6 rounded-r flex items-center justify-center">+</button>
        </div>
      </div>
      
      <div class="hidden-data" 
        data-str="${data.str || 10}" 
        data-dex="${data.dex || 10}" 
        data-con="${data.con || 10}" 
        data-int="${data.int || 10}" 
        data-wis="${data.wis || 10}" 
        data-cha="${data.cha || 10}"
        data-prof-bonus="${data.profBonus || 2}"
        data-init-mod="${data.initMod || ''}"
        data-conditions-data="[]"
        data-resistances="[]"
        data-immunities="[]"
        data-vulnerabilities="[]"
        data-save-proficiencies="${JSON.stringify(data.saveProficiencies || [])}"
      ></div>
    `;
    
    // Add event listeners
    this.addCombatantCardEventListeners(card, data);
    
    // Add initiative modifier display if initiative tracker exists
    if (this.app.initiative) {
      this.app.initiative.addInitiativeModifierDisplay(card);
    }
    
    // Add damage button if damage manager exists
    if (this.app.damage) {
      this.app.damage.addDamageButtonToCombatantCard(card);
      this.app.damage.addDamageModifiersButtonToCombatantCard(card);
    }
    
    // Add saving throw button if saves manager exists
    if (this.app.saves) {
      this.app.saves.addSavingThrowButtonToCombatantCard(card);
    }
    
    // Add notes button if notes manager exists
    if (this.app.notes) {
      this.app.notes.addNoteButtonToCombatantCard(card);
    }
    
    // Add legendary actions button if legendary actions tracker exists and it's a monster
    if (this.app.legendary && data.type === 'monster') {
      this.app.legendary.addLegendaryActionsButtonToMonsterCard(card);
    }
    
    return card;
  }
  
  addCombatantCardEventListeners(card, data) {
    // HP adjustment buttons
    card.querySelector('.hp-minus-btn').addEventListener('click', () => {
      const input = card.querySelector('.hp-input');
      const currentHp = parseInt(input.value) || 0;
      if (currentHp > 0) {
        input.value = currentHp - 1;
        this.updateHPBar(card);
      }
    });
    
    card.querySelector('.hp-plus-btn').addEventListener('click', () => {
      const input = card.querySelector('.hp-input');
      const currentHp = parseInt(input.value) || 0;
      const maxHp = parseInt(input.dataset.maxHp) || 0;
      if (currentHp < maxHp) {
        input.value = currentHp + 1;
        this.updateHPBar(card);
      }
    });
    
    card.querySelector('.hp-input').addEventListener('change', () => {
      this.updateHPBar(card);
    });
    
    // Edit button
    card.querySelector('.edit-combatant-btn').addEventListener('click', () => {
      if (data.type === 'hero') {
        this.app.roster.openEditHeroModal(card.id);
      } else {
        this.app.monsters.openEditMonsterModal(card.id);
      }
    });
    
    // Remove button
    card.querySelector('.remove-combatant-btn').addEventListener('click', () => {
      this.app.showConfirm(`Remove ${data.name} from combat?`, () => {
        card.remove();
        this.app.logEvent(`${data.name} removed from combat.`);
      });
    });
  }
  
  updateHPBar(card) {
    const input = card.querySelector('.hp-input');
    const bar = card.querySelector('.hp-bar-current');
    
    if (!input || !bar) return;
    
    const currentHp = parseInt(input.value) || 0;
    const maxHp = parseInt(input.dataset.maxHp) || 1;
    const percentage = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));
    
    bar.style.width = `${percentage}%`;
    
    // Update color based on percentage
    if (percentage <= 25) {
      bar.className = 'hp-bar-current bg-red-600 h-full';
    } else if (percentage <= 50) {
      bar.className = 'hp-bar-current bg-yellow-500 h-full';
    } else {
      bar.className = 'hp-bar-current bg-green-500 h-full';
    }
  }
  
  getThemeColors() {
    return {
      primary: '#4C51BF', // indigo-600
      secondary: '#ED8936', // orange-500
      success: '#48BB78', // green-500
      danger: '#E53E3E', // red-600
      warning: '#ECC94B', // yellow-500
      info: '#4299E1', // blue-500
      light: '#E2E8F0', // gray-300
      dark: '#1A202C', // gray-900
      heroColor: '#63B3ED', // blue-400
      monsterColor: '#FC8181' // red-400
    };
  }
}
