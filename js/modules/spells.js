/**
 * Spell Tracker for Jesster's Combat Tracker
 * Handles tracking spells, spell slots, and concentration
 */
class SpellTracker {
  constructor(app) {
    this.app = app;
    this.activeSpells = {}; // Maps combatant ID to array of active spells
    console.log("Spells.js loaded successfully");
  }
  
  /**
   * Get active spells for a combatant
   * @param {string} combatantId - The ID of the combatant
   * @returns {Array} - Array of active spell objects
   */
  getActiveSpells(combatantId) {
    return this.activeSpells[combatantId] || [];
  }
  
  /**
   * Add an active spell to a combatant
   * @param {string} combatantId - The ID of the combatant
   * @param {Object} spell - The spell object
   * @returns {boolean} - Whether the spell was successfully added
   */
  addActiveSpell(combatantId, spell) {
    if (!this.activeSpells[combatantId]) {
      this.activeSpells[combatantId] = [];
    }
    
    // Check if the spell requires concentration
    if (spell.concentration) {
      // Remove any existing concentration spells
      this.activeSpells[combatantId] = this.activeSpells[combatantId].filter(s => !s.concentration);
    }
    
    // Add the new spell
    this.activeSpells[combatantId].push(spell);
    
    // If the spell requires concentration, add the concentration condition
    if (spell.concentration && this.app.conditions) {
      this.app.conditions.addConditionToCombatant(combatantId, 'concentration');
    }
    
    // Update the UI if the spell tracker panel is open
    const panel = document.querySelector(`.spell-tracker-panel[data-combatant-id="${combatantId}"]`);
    if (panel) {
      this.updateSpellTrackerPanel(panel, this.activeSpells[combatantId]);
    }
    
    return true;
  }
  
  /**
   * Remove an active spell from a combatant
   * @param {string} combatantId - The ID of the combatant
   * @param {number} spellIndex - The index of the spell in the active spells array
   * @returns {boolean} - Whether the spell was successfully removed
   */
  removeActiveSpell(combatantId, spellIndex) {
    if (!this.activeSpells[combatantId] || spellIndex >= this.activeSpells[combatantId].length) {
      return false;
    }
    
    // Get the spell for logging
    const spell = this.activeSpells[combatantId][spellIndex];
    
    // Remove the spell
    this.activeSpells[combatantId].splice(spellIndex, 1);
    
    // If the spell required concentration and there are no more concentration spells, remove the condition
    if (spell.concentration) {
      const hasConcentrationSpell = this.activeSpells[combatantId].some(s => s.concentration);
      if (!hasConcentrationSpell && this.app.conditions) {
        this.app.conditions.removeConditionFromCombatant(combatantId, 'concentration');
      }
    }
    
    // Update the UI if the spell tracker panel is open
    const panel = document.querySelector(`.spell-tracker-panel[data-combatant-id="${combatantId}"]`);
    if (panel) {
      this.updateSpellTrackerPanel(panel, this.activeSpells[combatantId]);
    }
    
    return true;
  }
  
  /**
   * Check for spells that expire at the end of a turn
   */
  checkSpellsAtEndOfTurn() {
    // Get all combatants
    const allCombatants = [
      ...Array.from(document.querySelectorAll('#heroes-list .combatant-card')),
      ...Array.from(document.querySelectorAll('#monsters-list .combatant-card'))
    ];
    
    allCombatants.forEach(card => {
      const combatantId = card.id;
      const activeSpells = this.getActiveSpells(combatantId);
      
      if (!activeSpells || activeSpells.length === 0) return;
      
      // Check each spell
      let updated = false;
      const expiredSpells = [];
      
      for (let i = activeSpells.length - 1; i >= 0; i--) {
        const spell = activeSpells[i];
        
        if (spell.duration && spell.duration.type === 'rounds') {
          spell.duration.value--;
          
          if (spell.duration.value <= 0) {
            // Spell has expired
            expiredSpells.push(spell);
            this.removeActiveSpell(combatantId, i);
            updated = true;
          }
        }
      }
      
      // Log expired spells
      if (expiredSpells.length > 0) {
        const name = card.querySelector('.combatant-name').textContent;
        expiredSpells.forEach(spell => {
          this.app.logEvent(`${name}'s spell ${spell.name} has expired.`);
        });
      }
    });
  }
  
  /**
   * Open the spell tracker panel for a combatant
   * @param {string} combatantId - The ID of the combatant
   */
  openSpellTrackerPanel(combatantId) {
    // Get the combatant name
    const combatantCard = document.getElementById(combatantId);
    if (!combatantCard) return;
    
    const combatantName = combatantCard.querySelector('.combatant-name').textContent;
    
    // Check if panel already exists
    let panel = document.querySelector(`.spell-tracker-panel[data-combatant-id="${combatantId}"]`);
    
    if (panel) {
      // Panel exists, just update it
      this.updateSpellTrackerPanel(panel, this.getActiveSpells(combatantId));
      return;
    }
    
    // Create the panel
    panel = document.createElement('div');
    panel.className = 'spell-tracker-panel fixed top-20 right-4 bg-gray-800 rounded-lg shadow-lg p-4 z-40';
    panel.dataset.combatantId = combatantId;
    
    panel.innerHTML = `
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-lg font-bold text-blue-400">Spells: ${combatantName}</h3>
        <div class="flex items-center">
          <button class="add-spell-btn text-gray-400 hover:text-white mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          <button class="close-spell-tracker-btn text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <div class="spell-slots-section mb-3">
        <h4 class="text-sm font-semibold text-gray-300 mb-1">Spell Slots</h4>
        <div class="spell-slots-grid grid grid-cols-9 gap-1">
          ${Array.from({ length: 9 }, (_, i) => `
            <div class="spell-slot-level">
              <div class="text-xs text-center text-gray-400">${i + 1}</div>
              <div class="flex justify-center">
                <input type="number" class="spell-slot-input bg-gray-700 w-8 h-8 text-center rounded" data-level="${i + 1}" value="0" min="0">
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="active-spells-section">
        <div class="flex justify-between items-center mb-1">
          <h4 class="text-sm font-semibold text-gray-300">Active Spells</h4>
          <span class="text-xs text-gray-400">Duration</span>
        </div>
        <div class="active-spells-list space-y-2">
          <!-- Active spells will be inserted here -->
          <p class="text-gray-500 text-sm">No active spells.</p>
        </div>
      </div>
    `;
    
    // Add the panel to the document
    document.body.appendChild(panel);
    
    // Add event listeners
    panel.querySelector('.close-spell-tracker-btn').addEventListener('click', () => {
      panel.remove();
    });
    
    panel.querySelector('.add-spell-btn').addEventListener('click', () => {
      this.openAddSpellModal(combatantId);
    });
    
    // Update the panel with the current data
    this.updateSpellTrackerPanel(panel, this.getActiveSpells(combatantId));
  }
  
  /**
   * Update the spell tracker panel with current data
   * @param {HTMLElement} panel - The panel element
   * @param {Array} activeSpells - The active spells array
   */
  updateSpellTrackerPanel(panel, activeSpells) {
    // Update the active spells list
    const spellsList = panel.querySelector('.active-spells-list');
    
    if (!activeSpells || activeSpells.length === 0) {
      spellsList.innerHTML = '<p class="text-gray-500 text-sm">No active spells.</p>';
      return;
    }
    
    spellsList.innerHTML = '';
    
    activeSpells.forEach((spell, index) => {
      const spellElement = document.createElement('div');
      spellElement.className = 'active-spell-item flex justify-between items-center bg-gray-700 p-2 rounded';
      
      const durationText = spell.duration ? 
        (spell.duration.type === 'rounds' ? `${spell.duration.value} rounds` : spell.duration.value) : 
        'Instantaneous';
      
      spellElement.innerHTML = `
        <div>
          <div class="flex items-center">
            <span class="font-medium text-blue-300">${spell.name}</span>
            ${spell.concentration ? '<span class="ml-2 text-xs bg-purple-600 text-white px-1 rounded">Conc</span>' : ''}
          </div>
          <div class="text-xs text-gray-400">Level ${spell.level}</div>
        </div>
        <div class="flex items-center">
          <span class="text-sm text-gray-300 mr-2">${durationText}</span>
          <button class="remove-spell-btn text-red-400 hover:text-red-300" data-index="${index}">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      `;
      
      // Add event listener to remove button
      spellElement.querySelector('.remove-spell-btn').addEventListener('click', () => {
        const combatantId = panel.dataset.combatantId;
        const spellIndex = parseInt(spellElement.querySelector('.remove-spell-btn').dataset.index);
        
        // Get the combatant name and spell name for logging
        const combatantCard = document.getElementById(combatantId);
        const combatantName = combatantCard ? combatantCard.querySelector('.combatant-name').textContent : "Combatant";
        
        this.app.logEvent(`${combatantName}'s spell ${spell.name} has ended.`);
        
        this.removeActiveSpell(combatantId, spellIndex);
      });
      
      spellsList.appendChild(spellElement);
    });
  }
  
  /**
   * Open the add spell modal
   * @param {string} combatantId - The ID of the combatant
   */
  openAddSpellModal(combatantId) {
    // Get the combatant name
    const combatantCard = document.getElementById(combatantId);
    if (!combatantCard) return;
    
    const combatantName = combatantCard.querySelector('.combatant-name').textContent;
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 flex items-center justify-center z-50 p-4';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    
    modal.innerHTML = `
      <div class="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-md w-full mx-auto">
        <h3 class="text-xl font-bold text-blue-400 mb-4">Add Spell for ${combatantName}</h3>
        
        <div class="mb-4">
          <label class="block text-gray-300 mb-2">Spell Name:</label>
          <input type="text" id="spell-name" class="bg-gray-700 w-full rounded px-2 py-1 text-white" placeholder="Enter spell name...">
        </div>
        
        <div class="mb-4">
          <label class="block text-gray-300 mb-2">Spell Level:</label>
          <select id="spell-level" class="bg-gray-700 w-full rounded px-2 py-1 text-white">
            <option value="0">Cantrip</option>
            <option value="1">1st Level</option>
            <option value="2">2nd Level</option>
            <option value="3">3rd Level</option>
            <option value="4">4th Level</option>
            <option value="5">5th Level</option>
            <option value="6">6th Level</option>
            <option value="7">7th Level</option>
            <option value="8">8th Level</option>
            <option value="9">9th Level</option>
          </select>
        </div>
        
        <div class="mb-4">
          <label class="block text-gray-300 mb-2">Duration:</label>
          <div class="flex space-x-2">
            <input type="number" id="duration-value" class="bg-gray-700 rounded px-2 py-1 text-white w-20" value="1" min="1">
            <select id="duration-type" class="bg-gray-700 rounded px-2 py-1 text-white flex-grow">
              <option value="rounds">Rounds</option>
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
              <option value="instantaneous">Instantaneous</option>
            </select>
          </div>
        </div>
        
        <div class="mb-4">
          <label class="flex items-center">
            <input type="checkbox" id="concentration-checkbox" class="mr-2">
            <span class="text-gray-300">Requires Concentration</span>
          </label>
        </div>
        
        <div class="flex justify-end space-x-2">
          <button id="add-spell-cancel-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            Cancel
          </button>
          <button id="add-spell-save-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Add Spell
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('add-spell-cancel-btn').addEventListener('click', () => {
      modal.remove();
    });
    
    document.getElementById('add-spell-save-btn').addEventListener('click', () => {
      const name = document.getElementById('spell-name').value;
      if (!name) {
        this.app.showAlert('Please enter a spell name.', 'Error');
        return;
      }
      
      const level = parseInt(document.getElementById('spell-level').value);
      const durationType = document.getElementById('duration-type').value;
      const durationValue = parseInt(document.getElementById('duration-value').value) || 1;
      const concentration = document.getElementById('concentration-checkbox').checked;
      
      // Create the spell object
      const spell = {
        name,
        level,
        concentration,
        duration: durationType === 'instantaneous' ? null : {
          type: durationType,
          value: durationValue
        }
      };
      
      // Add the spell
      this.addActiveSpell(combatantId, spell);
      
      // Log the action
      this.app.logEvent(`${combatantName} casts ${name} (${concentration ? 'concentration, ' : ''}${durationType === 'instantaneous' ? 'instantaneous' : `${durationValue} ${durationType}`}).`);
      
      modal.remove();
    });
    
    // Show/hide duration inputs based on instantaneous selection
    document.getElementById('duration-type').addEventListener('change', (e) => {
      const durationType = e.target.value;
      const durationValue = document.getElementById('duration-value');
      
      if (durationType === 'instantaneous') {
        durationValue.disabled = true;
        durationValue.classList.add('opacity-50');
      } else {
        durationValue.disabled = false;
        durationValue.classList.remove('opacity-50');
      }
    });
  }
  
  /**
   * Add spell tracker button to a combatant card
   * @param {HTMLElement} card - The combatant card element
   */
  addSpellTrackerButtonToCombatantCard(card) {
    if (!card) return;
    
    // Check if spell tracker button already exists
    if (card.querySelector('.spell-tracker-btn')) return;
    
    // Create the spell tracker button
    const spellTrackerBtn = document.createElement('button');
    spellTrackerBtn.className = 'spell-tracker-btn text-gray-400 hover:text-blue-400 ml-1';
    spellTrackerBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    `;
    
    // Add event listener
    spellTrackerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.openSpellTrackerPanel(card.id);
    });
    
    // Find the appropriate place to insert the button
    const cardHeader = card.querySelector('.combatant-header') || card.querySelector('.combatant-name').parentNode;
    cardHeader.appendChild(spellTrackerBtn);
  }
  
  /**
   * Open the concentration check modal
   * @param {string} combatantId - The ID of the combatant
   * @param {number} dc - The DC for the concentration check
   */
  openConcentrationCheckModal(combatantId, dc = 10) {
    // Get the combatant
    const combatantCard = document.getElementById(combatantId);
    if (!combatantCard) return;
    
    const combatantName = combatantCard.querySelector('.combatant-name').textContent;
    
    // Check if the combatant has any concentration spells
    const activeSpells = this.getActiveSpells(combatantId);
    const concentrationSpells = activeSpells.filter(spell => spell.concentration);
    
    if (concentrationSpells.length === 0) {
      this.app.showAlert(`${combatantName} is not concentrating on any spells.`, 'Concentration Check');
      return;
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 flex items-center justify-center z-50 p-4';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    
    modal.innerHTML = `
      <div class="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-md w-full mx-auto">
        <h3 class="text-xl font-bold text-purple-400 mb-4">Concentration Check: ${combatantName}</h3>
        
        <div class="mb-4">
          <p class="text-gray-300">
            ${combatantName} is concentrating on:
            <span class="font-semibold text-blue-300">${concentrationSpells.map(spell => spell.name).join(', ')}</span>
          </p>
        </div>
        
        <div class="mb-4">
          <label class="block text-gray-300 mb-2">DC:</label>
          <input type="number" id="concentration-dc" class="bg-gray-700 w-full rounded px-2 py-1 text-white" value="${dc}" min="1">
          <p class="text-xs text-gray-400 mt-1">Minimum DC 10 or half the damage taken, whichever is higher</p>
        </div>
        
        <div class="flex justify-end space-x-2">
          <button id="concentration-cancel-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            Cancel
          </button>
          <button id="concentration-roll-btn" class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
            Roll Constitution Save
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('concentration-cancel-btn').addEventListener('click', () => {
      modal.remove();
    });
    
    document.getElementById('concentration-roll-btn').addEventListener('click', async () => {
      const dc = Math.max(10, parseInt(document.getElementById('concentration-dc').value) || 10);
      
      // Roll the save using the saving throw manager if available
      if (this.app.saves) {
        const result = await this.app.saves.rollSavingThrow(combatantId, 'con', dc);
        
        if (result.success) {
          this.app.logEvent(`${combatantName} maintains concentration.`);
        } else {
          // Failed the save, remove concentration
          concentrationSpells.forEach(spell => {
            this.app.logEvent(`${combatantName}'s concentration on ${spell.name} is broken.`);
          });
          
          // Remove all concentration spells
          for (let i = activeSpells.length - 1; i >= 0; i--) {
            if (activeSpells[i].concentration) {
              this.removeActiveSpell(combatantId, i);
            }
          }
          
          // Remove the concentration condition
          if (this.app.conditions) {
            this.app.conditions.removeConditionFromCombatant(combatantId, 'concentration');
          }
        }
      } else {
        // Fallback to a simple d20 roll
        const roll = Math.floor(Math.random() * 20) + 1;
        
        // Get the CON modifier
        const hiddenData = combatantCard.querySelector('.hidden-data');
        let conMod = 0;
        
        if (hiddenData && hiddenData.dataset.con) {
          const con = parseInt(hiddenData.dataset.con) || 10;
          conMod = Math.floor((con - 10) / 2);
        }
        
        const total = roll + conMod;
        const success = total >= dc;
        
        this.app.logEvent(`${combatantName} rolls concentration check: ${roll} + ${conMod} = ${total} vs DC ${dc}. ${success ? 'Success!' : 'Failure!'}`);
        
        if (!success) {
          // Failed the save, remove concentration
          concentrationSpells.forEach(spell => {
            this.app.logEvent(`${combatantName}'s concentration on ${spell.name} is broken.`);
          });
          
          // Remove all concentration spells
          for (let i = activeSpells.length - 1; i >= 0; i--) {
            if (activeSpells[i].concentration) {
              this.removeActiveSpell(combatantId, i);
            }
          }
          
          // Remove the concentration condition
          if (this.app.conditions) {
            this.app.conditions.removeConditionFromCombatant(combatantId, 'concentration');
          }
        }
      }
      
      modal.remove();
    });
  }
  
  /**
   * Add concentration check button to the combat controls
   */
  addConcentrationCheckButton() {
    // Add a button to the combat controls section
    const combatControls = document.querySelector('.md\\:col-span-2.flex.flex-wrap.justify-center.gap-4');
    if (!combatControls) return;
    
    const concentrationCheckBtn = document.createElement('button');
    concentrationCheckBtn.id = 'concentration-check-btn';
    concentrationCheckBtn.className = 'bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300';
    concentrationCheckBtn.textContent = 'Concentration Check';
    concentrationCheckBtn.addEventListener('click', () => {
      // Open a modal to select a combatant for the concentration check
      this.openSelectCombatantForConcentrationModal();
    });
    
    combatControls.appendChild(concentrationCheckBtn);
  }
  
  /**
   * Open a modal to select a combatant for concentration check
   */
  openSelectCombatantForConcentrationModal() {
    // Get all combatants with concentration
    const allCombatants = [
      ...Array.from(document.querySelectorAll('#heroes-list .combatant-card')),
      ...Array.from(document.querySelectorAll('#monsters-list .combatant-card'))
    ];
    
    const combatantsWithConcentration = allCombatants.filter(card => {
      const combatantId = card.id;
      const activeSpells = this.getActiveSpells(combatantId);
      return activeSpells && activeSpells.some(spell => spell.concentration);
    });
    
    if (combatantsWithConcentration.length === 0) {
      this.app.showAlert('No combatants are currently concentrating on spells.', 'Concentration Check');
      return;
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 flex items-center justify-center z-50 p-4';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    
    modal.innerHTML = `
      <div class="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-md w-full mx-auto">
        <h3 class="text-xl font-bold text-purple-400 mb-4">Select Combatant for Concentration Check</h3>
        
        <div class="mb-4">
          <label class="block text-gray-300 mb-2">Combatant:</label>
          <select id="concentration-combatant-select" class="bg-gray-700 w-full rounded px-2 py-1 text-white">
            ${combatantsWithConcentration.map(card => {
              const name = card.querySelector('.combatant-name').textContent;
              return `<option value="${card.id}">${name}</option>`;
            }).join('')}
          </select>
        </div>
        
        <div class="mb-4">
          <label class="block text-gray-300 mb-2">DC:</label>
          <input type="number" id="concentration-select-dc" class="bg-gray-700 w-full rounded px-2 py-1 text-white" value="10" min="10">
          <p class="text-xs text-gray-400 mt-1">Minimum DC 10 or half the damage taken, whichever is higher</p>
        </div>
        
        <div class="flex justify-end space-x-2">
          <button id="concentration-select-cancel-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            Cancel
          </button>
          <button id="concentration-select-continue-btn" class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
            Continue
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('concentration-select-cancel-btn').addEventListener('click', () => {
      modal.remove();
    });
    
    document.getElementById('concentration-select-continue-btn').addEventListener('click', () => {
      const combatantId = document.getElementById('concentration-combatant-select').value;
      const dc = parseInt(document.getElementById('concentration-select-dc').value) || 10;
      
      modal.remove();
      this.openConcentrationCheckModal(combatantId, dc);
    });
  }
}
