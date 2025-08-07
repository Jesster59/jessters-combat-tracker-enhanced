/**
 * Damage Type Manager for Jesster's Combat Tracker
 * Handles damage types, resistances, immunities, and vulnerabilities
 */
class DamageTypeManager {
  constructor(app) {
    this.app = app;
    this.damageTypes = [
      { id: 'acid', name: 'Acid', color: 'bg-green-500' },
      { id: 'bludgeoning', name: 'Bludgeoning', color: 'bg-gray-500' },
      { id: 'cold', name: 'Cold', color: 'bg-blue-300' },
      { id: 'fire', name: 'Fire', color: 'bg-red-500' },
      { id: 'force', name: 'Force', color: 'bg-purple-400' },
      { id: 'lightning', name: 'Lightning', color: 'bg-yellow-300' },
      { id: 'necrotic', name: 'Necrotic', color: 'bg-gray-800' },
      { id: 'piercing', name: 'Piercing', color: 'bg-gray-400' },
      { id: 'poison', name: 'Poison', color: 'bg-green-700' },
      { id: 'psychic', name: 'Psychic', color: 'bg-pink-400' },
      { id: 'radiant', name: 'Radiant', color: 'bg-yellow-200' },
      { id: 'slashing', name: 'Slashing', color: 'bg-gray-600' },
      { id: 'thunder', name: 'Thunder', color: 'bg-blue-500' }
    ];
    console.log("Damage.js loaded successfully");
  }
  
  /**
   * Initialize the damage type manager
   */
  init() {
    // Nothing to initialize at the moment
  }
  
  /**
   * Get all damage types
   * @returns {Array} - Array of damage type objects
   */
  getAllDamageTypes() {
    return this.damageTypes;
  }
  
  /**
   * Get a damage type by ID
   * @param {string} id - The damage type ID
   * @returns {Object|null} - The damage type object or null if not found
   */
  getDamageTypeById(id) {
    return this.damageTypes.find(type => type.id === id) || null;
  }
  
  /**
   * Apply damage to a combatant with damage type consideration
   * @param {string} combatantId - The ID of the combatant
   * @param {number} amount - The amount of damage
   * @param {string} damageTypeId - The damage type ID
   * @returns {number} - The actual damage applied after resistances/vulnerabilities
   */
  applyDamage(combatantId, amount, damageTypeId) {
    const card = document.getElementById(combatantId);
    if (!card) return 0;
    
    // Get the current HP
    const hpInput = card.querySelector('.hp-input');
    if (!hpInput) return 0;
    
    const currentHp = parseInt(hpInput.value) || 0;
    
    // Get resistances, immunities, and vulnerabilities
    const hiddenData = card.querySelector('.hidden-data');
    let resistances = [];
    let immunities = [];
    let vulnerabilities = [];
    
    if (hiddenData) {
      try {
        resistances = JSON.parse(hiddenData.dataset.resistances || '[]');
        immunities = JSON.parse(hiddenData.dataset.immunities || '[]');
        vulnerabilities = JSON.parse(hiddenData.dataset.vulnerabilities || '[]');
      } catch (e) {
        console.error("Error parsing damage modifiers:", e);
      }
    }
    
    // Calculate actual damage based on resistances, immunities, and vulnerabilities
    let actualDamage = amount;
    let damageModifier = '';
    
    if (damageTypeId) {
      if (immunities.includes(damageTypeId)) {
        actualDamage = 0;
        damageModifier = 'immune';
      } else if (resistances.includes(damageTypeId)) {
        actualDamage = Math.floor(amount / 2);
        damageModifier = 'resistant';
      } else if (vulnerabilities.includes(damageTypeId)) {
        actualDamage = amount * 2;
        damageModifier = 'vulnerable';
      }
    }
    
    // Apply the damage
    const newHp = Math.max(0, currentHp - actualDamage);
    hpInput.value = newHp;
    
    // Update HP bar if it exists
    const hpBar = card.querySelector('.hp-bar-current');
    if (hpBar) {
      const maxHp = parseInt(hpInput.dataset.maxHp) || 1;
      const percentage = (newHp / maxHp) * 100;
      hpBar.style.width = `${percentage}%`;
    }
    
    // Log the damage
    const name = card.querySelector('.combatant-name')?.textContent || 'Unknown';
    const damageType = this.getDamageTypeById(damageTypeId)?.name || 'untyped';
    
    if (damageModifier) {
      this.app.logEvent(`${name} takes ${actualDamage} ${damageType} damage (${damageModifier} to ${amount} damage).`);
    } else {
      this.app.logEvent(`${name} takes ${actualDamage} ${damageType} damage.`);
    }
    
    // Update combat statistics
    if (this.app.stats) {
      if (card.dataset.type === 'hero') {
        this.app.stats.recordDamageReceived(actualDamage);
      } else {
        this.app.stats.recordDamageDealt(actualDamage);
      }
    }
    
    // Check if the combatant is unconscious
    if (newHp === 0) {
      this.app.logEvent(`${name} is unconscious!`);
      
      // Add unconscious condition if conditions manager exists
      if (this.app.conditions) {
        this.app.conditions.addConditionToCombatant(combatantId, 'unconscious');
      }
    }
    
    return actualDamage;
  }
  
  /**
   * Apply healing to a combatant
   * @param {string} combatantId - The ID of the combatant
   * @param {number} amount - The amount of healing
   * @returns {number} - The actual healing applied
   */
  applyHealing(combatantId, amount) {
    const card = document.getElementById(combatantId);
    if (!card) return 0;
    
    // Get the current HP
    const hpInput = card.querySelector('.hp-input');
    if (!hpInput) return 0;
    
    const currentHp = parseInt(hpInput.value) || 0;
    const maxHp = parseInt(hpInput.dataset.maxHp) || 0;
    
    // Apply the healing, not exceeding max HP
    const newHp = Math.min(maxHp, currentHp + amount);
    hpInput.value = newHp;
    
    // Update HP bar if it exists
    const hpBar = card.querySelector('.hp-bar-current');
    if (hpBar) {
      const percentage = (newHp / maxHp) * 100;
      hpBar.style.width = `${percentage}%`;
    }
    
    // Log the healing
    const name = card.querySelector('.combatant-name')?.textContent || 'Unknown';
    this.app.logEvent(`${name} heals for ${amount} hit points.`);
    
    // Update combat statistics
    if (this.app.stats) {
      this.app.stats.recordHealingDone(amount);
    }
    
    // Remove unconscious condition if the combatant is no longer at 0 HP
    if (currentHp === 0 && newHp > 0 && this.app.conditions) {
      this.app.conditions.removeConditionFromCombatant(combatantId, 'unconscious');
    }
    
    return amount;
  }
  
  /**
   * Open the damage application modal
   * @param {string} combatantId - The ID of the combatant
   */
  openDamageModal(combatantId) {
    const card = document.getElementById(combatantId);
    if (!card) return;
    
    const name = card.querySelector('.combatant-name').textContent;
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 flex items-center justify-center z-50 p-4';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    
    modal.innerHTML = `
      <div class="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-md w-full mx-auto">
        <h3 class="text-xl font-bold text-red-400 mb-4">Apply Damage to ${name}</h3>
        
        <div class="mb-4">
          <label class="block text-gray-300 mb-2">Amount:</label>
          <input type="number" id="damage-amount" class="bg-gray-700 w-full rounded px-2 py-1 text-white" value="0" min="0">
        </div>
        
        <div class="mb-4">
          <label class="block text-gray-300 mb-2">Damage Type:</label>
          <select id="damage-type" class="bg-gray-700 w-full rounded px-2 py-1 text-white">
            <option value="">-- Select Type --</option>
            ${this.damageTypes.map(type => `<option value="${type.id}">${type.name}</option>`).join('')}
          </select>
        </div>
        
        <div class="flex justify-end space-x-2">
          <button id="damage-heal-btn" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Heal Instead
          </button>
          <button id="damage-apply-btn" class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
            Apply Damage
          </button>
          <button id="damage-cancel-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            Cancel
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('damage-cancel-btn').addEventListener('click', () => {
      modal.remove();
    });
    
    document.getElementById('damage-apply-btn').addEventListener('click', () => {
      const amount = parseInt(document.getElementById('damage-amount').value) || 0;
      const damageTypeId = document.getElementById('damage-type').value;
      
      if (amount > 0) {
        this.applyDamage(combatantId, amount, damageTypeId);
      }
      
      modal.remove();
    });
    
    document.getElementById('damage-heal-btn').addEventListener('click', () => {
      const amount = parseInt(document.getElementById('damage-amount').value) || 0;
      
      if (amount > 0) {
        this.applyHealing(combatantId, amount);
      }
      
      modal.remove();
    });
    
    // Focus the amount input
    setTimeout(() => {
      document.getElementById('damage-amount').focus();
    }, 100);
  }
  
  /**
   * Add damage button to a combatant card
   * @param {HTMLElement} card - The combatant card element
   */
  addDamageButtonToCombatantCard(card) {
    if (!card) return;
    
    // Check if damage button already exists
    if (card.querySelector('.damage-btn')) return;
    
    // Create the damage button
    const damageBtn = document.createElement('button');
    damageBtn.className = 'damage-btn text-gray-400 hover:text-red-400 ml-1';
    damageBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    `;
    
    // Add event listener
    damageBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.openDamageModal(card.id);
    });
    
    // Find the appropriate place to insert the button
    const cardHeader = card.querySelector('.combatant-header') || card.querySelector('.combatant-name').parentNode;
    cardHeader.appendChild(damageBtn);
  }
  
  /**
   * Open the resistance/immunity/vulnerability editor
   * @param {string} combatantId - The ID of the combatant
   */
  openDamageModifiersModal(combatantId) {
    const card = document.getElementById(combatantId);
    if (!card) return;
    
    const name = card.querySelector('.combatant-name').textContent;
    
    // Get current resistances, immunities, and vulnerabilities
    const hiddenData = card.querySelector('.hidden-data');
    let resistances = [];
    let immunities = [];
    let vulnerabilities = [];
    
    if (hiddenData) {
      try {
        resistances = JSON.parse(hiddenData.dataset.resistances || '[]');
        immunities = JSON.parse(hiddenData.dataset.immunities || '[]');
        vulnerabilities = JSON.parse(hiddenData.dataset.vulnerabilities || '[]');
      } catch (e) {
        console.error("Error parsing damage modifiers:", e);
      }
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 flex items-center justify-center z-50 p-4';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    
    modal.innerHTML = `
      <div class="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-lg w-full mx-auto">
        <h3 class="text-xl font-bold text-purple-400 mb-4">Damage Modifiers for ${name}</h3>
        
        <div class="grid grid-cols-3 gap-4">
          <div>
            <h4 class="font-semibold text-gray-300 mb-2">Resistances</h4>
            <div id="resistances-list" class="space-y-1">
              ${this.damageTypes.map(type => `
                <label class="flex items-center">
                  <input type="checkbox" class="resistance-checkbox mr-2" value="${type.id}" ${resistances.includes(type.id) ? 'checked' : ''}>
                  <span class="text-sm">${type.name}</span>
                </label>
              `).join('')}
            </div>
          </div>
          
          <div>
            <h4 class="font-semibold text-gray-300 mb-2">Immunities</h4>
            <div id="immunities-list" class="space-y-1">
              ${this.damageTypes.map(type => `
                <label class="flex items-center">
                  <input type="checkbox" class="immunity-checkbox mr-2" value="${type.id}" ${immunities.includes(type.id) ? 'checked' : ''}>
                  <span class="text-sm">${type.name}</span>
                </label>
              `).join('')}
            </div>
          </div>
          
          <div>
            <h4 class="font-semibold text-gray-300 mb-2">Vulnerabilities</h4>
            <div id="vulnerabilities-list" class="space-y-1">
              ${this.damageTypes.map(type => `
                <label class="flex items-center">
                  <input type="checkbox" class="vulnerability-checkbox mr-2" value="${type.id}" ${vulnerabilities.includes(type.id) ? 'checked' : ''}>
                  <span class="text-sm">${type.name}</span>
                </label>
              `).join('')}
            </div>
          </div>
        </div>
        
        <div class="flex justify-end mt-4 space-x-2">
          <button id="modifiers-cancel-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            Cancel
          </button>
          <button id="modifiers-save-btn" class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
            Save
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('modifiers-cancel-btn').addEventListener('click', () => {
      modal.remove();
    });
    
    document.getElementById('modifiers-save-btn').addEventListener('click', () => {
      // Collect selected resistances
      const newResistances = Array.from(document.querySelectorAll('.resistance-checkbox:checked'))
        .map(checkbox => checkbox.value);
      
      // Collect selected immunities
      const newImmunities = Array.from(document.querySelectorAll('.immunity-checkbox:checked'))
        .map(checkbox => checkbox.value);
      
      // Collect selected vulnerabilities
      const newVulnerabilities = Array.from(document.querySelectorAll('.vulnerability-checkbox:checked'))
        .map(checkbox => checkbox.value);
      
      // Update the hidden data
      if (hiddenData) {
        hiddenData.dataset.resistances = JSON.stringify(newResistances);
        hiddenData.dataset.immunities = JSON.stringify(newImmunities);
        hiddenData.dataset.vulnerabilities = JSON.stringify(newVulnerabilities);
      }
      
      modal.remove();
      this.app.logEvent(`Damage modifiers updated for ${name}.`);
    });
  }
  
  /**
   * Add damage modifiers button to a combatant card
   * @param {HTMLElement} card - The combatant card element
   */
  addDamageModifiersButtonToCombatantCard(card) {
    if (!card) return;
    
    // Check if modifiers button already exists
    if (card.querySelector('.modifiers-btn')) return;
    
    // Create the modifiers button
    const modifiersBtn = document.createElement('button');
    modifiersBtn.className = 'modifiers-btn text-gray-400 hover:text-purple-400 ml-1';
    modifiersBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
      </svg>
    `;
    
    // Add event listener
    modifiersBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.openDamageModifiersModal(card.id);
    });
    
    // Find the appropriate place to insert the button
    const cardHeader = card.querySelector('.combatant-header') || card.querySelector('.combatant-name').parentNode;
    cardHeader.appendChild(modifiersBtn);
  }
}
