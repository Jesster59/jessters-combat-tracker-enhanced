/**
 * Saving Throw Manager for Jesster's Combat Tracker
 * Handles saving throws and ability checks for combatants
 */
class SavingThrowManager {
  constructor(app) {
    this.app = app;
    this.abilityScores = [
      { id: 'str', name: 'Strength', shortName: 'STR' },
      { id: 'dex', name: 'Dexterity', shortName: 'DEX' },
      { id: 'con', name: 'Constitution', shortName: 'CON' },
      { id: 'int', name: 'Intelligence', shortName: 'INT' },
      { id: 'wis', name: 'Wisdom', shortName: 'WIS' },
      { id: 'cha', name: 'Charisma', shortName: 'CHA' }
    ];
    console.log("Saves.js loaded successfully");
  }
  
  /**
   * Initialize the saving throw manager
   */
  init() {
    // Nothing to initialize at the moment
  }
  
  /**
   * Get all ability scores
   * @returns {Array} - Array of ability score objects
   */
  getAllAbilityScores() {
    return this.abilityScores;
  }
  
  /**
   * Get an ability score by ID
   * @param {string} id - The ability score ID
   * @returns {Object|null} - The ability score object or null if not found
   */
  getAbilityScoreById(id) {
    return this.abilityScores.find(ability => ability.id === id) || null;
  }
  
  /**
   * Calculate ability modifier from score
   * @param {number} score - The ability score
   * @returns {number} - The ability modifier
   */
  calculateModifier(score) {
    return Math.floor((score - 10) / 2);
  }
  
  /**
   * Format a modifier as a string with + or -
   * @param {number} modifier - The modifier value
   * @returns {string} - Formatted modifier string
   */
  formatModifier(modifier) {
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  }
  
  /**
   * Roll a saving throw for a combatant
   * @param {string} combatantId - The ID of the combatant
   * @param {string} abilityId - The ability ID for the saving throw
   * @param {number} [dc=10] - The difficulty class for the saving throw
   * @returns {Promise<Object>} - The result of the saving throw
   */
  async rollSavingThrow(combatantId, abilityId, dc = 10) {
    const card = document.getElementById(combatantId);
    if (!card) {
      return { success: false, error: 'Combatant not found' };
    }
    
    const name = card.querySelector('.combatant-name').textContent;
    const ability = this.getAbilityScoreById(abilityId);
    
    if (!ability) {
      return { success: false, error: 'Invalid ability score' };
    }
    
    // Get the ability score and proficiency bonus
    const hiddenData = card.querySelector('.hidden-data');
    let abilityScore = 10;
    let proficiencyBonus = 2;
    let isProficient = false;
    
    if (hiddenData) {
      abilityScore = parseInt(hiddenData.dataset[abilityId]) || 10;
      proficiencyBonus = parseInt(hiddenData.dataset.profBonus) || 2;
      
      // Check if proficient in this saving throw
      try {
        const saveProficiencies = JSON.parse(hiddenData.dataset.saveProficiencies || '[]');
        isProficient = saveProficiencies.includes(abilityId);
      } catch (e) {
        console.error("Error parsing save proficiencies:", e);
      }
    }
    
    // Calculate the modifier
    let modifier = this.calculateModifier(abilityScore);
    if (isProficient) {
      modifier += proficiencyBonus;
    }
    
    // Roll the d20
    const roll = await this.app.dice.roll('1d20');
    const total = roll + modifier;
    
    // Determine success or failure
    const success = total >= dc;
    
    // Log the result
    const modifierStr = this.formatModifier(modifier);
    const profStr = isProficient ? ' (proficient)' : '';
    this.app.logEvent(`${name} rolls a ${ability.name} save: ${roll} ${modifierStr}${profStr} = ${total} vs DC ${dc}. ${success ? 'Success!' : 'Failure!'}`);
    
    return {
      success,
      roll,
      modifier,
      total,
      dc,
      abilityId,
      abilityName: ability.name,
      isProficient
    };
  }
  
  /**
   * Roll an ability check for a combatant
   * @param {string} combatantId - The ID of the combatant
   * @param {string} abilityId - The ability ID for the check
   * @param {number} [dc=10] - The difficulty class for the check
   * @returns {Promise<Object>} - The result of the ability check
   */
  async rollAbilityCheck(combatantId, abilityId, dc = 10) {
    const card = document.getElementById(combatantId);
    if (!card) {
      return { success: false, error: 'Combatant not found' };
    }
    
    const name = card.querySelector('.combatant-name').textContent;
    const ability = this.getAbilityScoreById(abilityId);
    
    if (!ability) {
      return { success: false, error: 'Invalid ability score' };
    }
    
    // Get the ability score
    const hiddenData = card.querySelector('.hidden-data');
    let abilityScore = 10;
    
    if (hiddenData) {
      abilityScore = parseInt(hiddenData.dataset[abilityId]) || 10;
    }
    
    // Calculate the modifier
    const modifier = this.calculateModifier(abilityScore);
    
    // Roll the d20
    const roll = await this.app.dice.roll('1d20');
    const total = roll + modifier;
    
    // Determine success or failure
    const success = total >= dc;
    
    // Log the result
    const modifierStr = this.formatModifier(modifier);
    this.app.logEvent(`${name} rolls a ${ability.name} check: ${roll} ${modifierStr} = ${total} vs DC ${dc}. ${success ? 'Success!' : 'Failure!'}`);
    
    return {
      success,
      roll,
      modifier,
      total,
      dc,
      abilityId,
      abilityName: ability.name
    };
  }
  
  /**
   * Open the saving throw modal for a combatant
   * @param {string} combatantId - The ID of the combatant
   */
  openSavingThrowModal(combatantId) {
    const card = document.getElementById(combatantId);
    if (!card) return;
    
    const name = card.querySelector('.combatant-name').textContent;
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 flex items-center justify-center z-50 p-4';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    
    modal.innerHTML = `
      <div class="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-md w-full mx-auto">
        <h3 class="text-xl font-bold text-blue-400 mb-4">Saving Throw for ${name}</h3>
        
        <div class="mb-4">
          <label class="block text-gray-300 mb-2">Ability:</label>
          <div class="grid grid-cols-3 gap-2">
            ${this.abilityScores.map(ability => `
              <button class="ability-btn bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded" data-ability="${ability.id}">
                ${ability.shortName}
              </button>
            `).join('')}
          </div>
        </div>
        
        <div class="mb-4">
          <label class="block text-gray-300 mb-2">Difficulty Class (DC):</label>
          <input type="number" id="save-dc" class="bg-gray-700 w-full rounded px-2 py-1 text-white" value="10" min="1">
        </div>
        
        <div class="flex justify-between">
          <div>
            <label class="inline-flex items-center">
              <input type="checkbox" id="save-advantage" class="mr-2">
              <span class="text-gray-300">Advantage</span>
            </label>
          </div>
          <div>
            <label class="inline-flex items-center">
              <input type="checkbox" id="save-disadvantage" class="mr-2">
              <span class="text-gray-300">Disadvantage</span>
            </label>
          </div>
        </div>
        
        <div class="flex justify-end mt-4 space-x-2">
          <button id="ability-check-btn" class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
            Ability Check
          </button>
          <button id="saving-throw-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Saving Throw
          </button>
          <button id="save-cancel-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            Cancel
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('save-cancel-btn').addEventListener('click', () => {
      modal.remove();
    });
    
    // Add event listeners to ability buttons
    const abilityBtns = modal.querySelectorAll('.ability-btn');
    abilityBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Toggle active state
        abilityBtns.forEach(b => b.classList.remove('bg-blue-600', 'hover:bg-blue-700'));
        btn.classList.remove('bg-gray-700', 'hover:bg-gray-600');
        btn.classList.add('bg-blue-600', 'hover:bg-blue-700');
      });
    });
    
    // Advantage and disadvantage are mutually exclusive
    const advantageCheckbox = document.getElementById('save-advantage');
    const disadvantageCheckbox = document.getElementById('save-disadvantage');
    
    advantageCheckbox.addEventListener('change', () => {
      if (advantageCheckbox.checked) {
        disadvantageCheckbox.checked = false;
      }
    });
    
    disadvantageCheckbox.addEventListener('change', () => {
      if (disadvantageCheckbox.checked) {
        advantageCheckbox.checked = false;
      }
    });
    
    // Saving throw button
    document.getElementById('saving-throw-btn').addEventListener('click', async () => {
      const activeAbilityBtn = modal.querySelector('.ability-btn.bg-blue-600');
      if (!activeAbilityBtn) {
        this.app.showAlert('Please select an ability score.', 'Error');
        return;
      }
      
      const abilityId = activeAbilityBtn.dataset.ability;
      const dc = parseInt(document.getElementById('save-dc').value) || 10;
      const hasAdvantage = document.getElementById('save-advantage').checked;
      const hasDisadvantage = document.getElementById('save-disadvantage').checked;
      
      // Determine the dice expression based on advantage/disadvantage
      let diceExpression = '1d20';
      if (hasAdvantage) {
        diceExpression = '2d20kh1'; // Keep highest of 2d20
      } else if (hasDisadvantage) {
        diceExpression = '2d20kl1'; // Keep lowest of 2d20
      }
      
      // Override the dice roll method temporarily
      const originalRoll = this.app.dice.roll;
      this.app.dice.roll = async () => {
        const result = await originalRoll.call(this.app.dice, diceExpression);
        return parseInt(result);
      };
      
      // Roll the saving throw
      await this.rollSavingThrow(combatantId, abilityId, dc);
      
      // Restore the original roll method
      this.app.dice.roll = originalRoll;
      
      modal.remove();
    });
    
    // Ability check button
    document.getElementById('ability-check-btn').addEventListener('click', async () => {
      const activeAbilityBtn = modal.querySelector('.ability-btn.bg-blue-600');
      if (!activeAbilityBtn) {
        this.app.showAlert('Please select an ability score.', 'Error');
        return;
      }
      
      const abilityId = activeAbilityBtn.dataset.ability;
      const dc = parseInt(document.getElementById('save-dc').value) || 10;
      const hasAdvantage = document.getElementById('save-advantage').checked;
      const hasDisadvantage = document.getElementById('save-disadvantage').checked;
      
      // Determine the dice expression based on advantage/disadvantage
      let diceExpression = '1d20';
      if (hasAdvantage) {
        diceExpression = '2d20kh1'; // Keep highest of 2d20
      } else if (hasDisadvantage) {
        diceExpression = '2d20kl1'; // Keep lowest of 2d20
      }
      
      // Override the dice roll method temporarily
      const originalRoll = this.app.dice.roll;
      this.app.dice.roll = async () => {
        const result = await originalRoll.call(this.app.dice, diceExpression);
        return parseInt(result);
      };
      
      // Roll the ability check
      await this.rollAbilityCheck(combatantId, abilityId, dc);
      
      // Restore the original roll method
      this.app.dice.roll = originalRoll;
      
      modal.remove();
    });
  }
  
  /**
   * Add saving throw button to a combatant card
   * @param {HTMLElement} card - The combatant card element
   */
  addSavingThrowButtonToCombatantCard(card) {
    if (!card) return;
    
    // Check if save button already exists
    if (card.querySelector('.save-btn')) return;
    
    // Create the save button
    const saveBtn = document.createElement('button');
    saveBtn.className = 'save-btn text-gray-400 hover:text-blue-400 ml-1';
    saveBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    `;
    
    // Add event listener
    saveBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.openSavingThrowModal(card.id);
    });
    
    // Find the appropriate place to insert the button
    const cardHeader = card.querySelector('.combatant-header') || card.querySelector('.combatant-name').parentNode;
    cardHeader.appendChild(saveBtn);
  }
  
  /**
   * Open the group saving throw modal
   */
  openGroupSavingThrowModal() {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 flex items-center justify-center z-50 p-4';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    
    modal.innerHTML = `
      <div class="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-lg w-full mx-auto">
        <h3 class="text-xl font-bold text-blue-400 mb-4">Group Saving Throw</h3>
        
        <div class="mb-4">
          <label class="block text-gray-300 mb-2">Ability:</label>
          <div class="grid grid-cols-3 gap-2">
            ${this.abilityScores.map(ability => `
              <button class="ability-btn bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded" data-ability="${ability.id}">
                ${ability.shortName}
              </button>
            `).join('')}
          </div>
        </div>
        
        <div class="mb-4">
          <label class="block text-gray-300 mb-2">Difficulty Class (DC):</label>
          <input type="number" id="group-save-dc" class="bg-gray-700 w-full rounded px-2 py-1 text-white" value="10" min="1">
        </div>
        
        <div class="mb-4">
          <label class="block text-gray-300 mb-2">Apply to:</label>
          <div class="flex space-x-4">
            <label class="inline-flex items-center">
              <input type="checkbox" id="apply-to-heroes" class="mr-2" checked>
              <span class="text-blue-300">Heroes</span>
            </label>
            <label class="inline-flex items-center">
              <input type="checkbox" id="apply-to-monsters" class="mr-2" checked>
              <span class="text-red-300">Monsters</span>
            </label>
          </div>
        </div>
        
        <div class="flex justify-end mt-4 space-x-2">
          <button id="group-save-cancel-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            Cancel
          </button>
          <button id="group-save-roll-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Roll Saves
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('group-save-cancel-btn').addEventListener('click', () => {
      modal.remove();
    });
    
    // Add event listeners to ability buttons
    const abilityBtns = modal.querySelectorAll('.ability-btn');
    abilityBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Toggle active state
        abilityBtns.forEach(b => b.classList.remove('bg-blue-600', 'hover:bg-blue-700'));
        btn.classList.remove('bg-gray-700', 'hover:bg-gray-600');
        btn.classList.add('bg-blue-600', 'hover:bg-blue-700');
      });
    });
    
    // Roll group saves button
    document.getElementById('group-save-roll-btn').addEventListener('click', async () => {
      const activeAbilityBtn = modal.querySelector('.ability-btn.bg-blue-600');
      if (!activeAbilityBtn) {
        this.app.showAlert('Please select an ability score.', 'Error');
        return;
      }
      
      const abilityId = activeAbilityBtn.dataset.ability;
      const dc = parseInt(document.getElementById('group-save-dc').value) || 10;
      const applyToHeroes = document.getElementById('apply-to-heroes').checked;
      const applyToMonsters = document.getElementById('apply-to-monsters').checked;
      
      // Get all applicable combatants
      const combatants = [];
      
      if (applyToHeroes) {
        const heroes = Array.from(document.querySelectorAll('#heroes-list .combatant-card'));
        combatants.push(...heroes);
      }
      
      if (applyToMonsters) {
        const monsters = Array.from(document.querySelectorAll('#monsters-list .combatant-card'));
        combatants.push(...monsters);
      }
      
      if (combatants.length === 0) {
        this.app.showAlert('No combatants selected.', 'Error');
        return;
      }
      
      // Roll saving throws for all combatants
      const ability = this.getAbilityScoreById(abilityId);
      this.app.logEvent(`Group ${ability.name} saving throw (DC ${dc}):`);
      
      let successes = 0;
      let failures = 0;
      
      for (const combatant of combatants) {
        const result = await this.rollSavingThrow(combatant.id, abilityId, dc);
        if (result.success) {
          successes++;
        } else {
          failures++;
        }
      }
      
      this.app.logEvent(`Results: ${successes} successes, ${failures} failures.`);
      
      modal.remove();
    });
  }
  
  /**
   * Add group saving throw button to the combat controls
   */
  addGroupSavingThrowButton() {
    // Add a button to the combat controls section
    const combatControls = document.querySelector('.md\\:col-span-2.flex.flex-wrap.justify-center.gap-4');
    if (!combatControls) return;
    
    const groupSaveBtn = document.createElement('button');
    groupSaveBtn.id = 'group-saving-throw-btn';
    groupSaveBtn.className = 'bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300';
    groupSaveBtn.textContent = 'Group Saving Throw';
    groupSaveBtn.addEventListener('click', () => this.openGroupSavingThrowModal());
    
    combatControls.appendChild(groupSaveBtn);
  }
}
