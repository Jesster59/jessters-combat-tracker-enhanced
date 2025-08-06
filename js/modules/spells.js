/**
 * Spell Tracker for Jesster's Combat Tracker
 * Handles tracking of spells, durations, and concentration
 */
class SpellTracker {
  constructor(app) {
    this.app = app;
    this.activeSpells = [];
    this.spellId = 0;
  }
  
  addSpell(combatantId, spellName, level, duration, requiresConcentration = false) {
    const combatant = document.getElementById(combatantId);
    if (!combatant) return false;
    
    const combatantName = combatant.querySelector('.combatant-name')?.textContent || 'Unknown';
    
    // Check if combatant is already concentrating on a spell
    if (requiresConcentration) {
      const existingConcentrationSpell = this.activeSpells.find(
        spell => spell.combatantId === combatantId && spell.requiresConcentration
      );
      
      if (existingConcentrationSpell) {
        // Ask if they want to drop concentration on the existing spell
        this.app.showConfirm(
          `${combatantName} is already concentrating on "${existingConcentrationSpell.name}". Drop concentration on it to cast ${spellName}?`,
          () => {
            this.removeSpell(existingConcentrationSpell.id);
            this._addNewSpell(combatantId, combatantName, spellName, level, duration, requiresConcentration);
          }
        );
        return true;
      }
    }
    
    return this._addNewSpell(combatantId, combatantName, spellName, level, duration, requiresConcentration);
  }
  
  _addNewSpell(combatantId, combatantName, spellName, level, duration, requiresConcentration) {
    // Create a new spell entry
    const spell = {
      id: `spell-${this.spellId++}`,
      combatantId: combatantId,
      combatantName: combatantName,
      name: spellName,
      level: level,
      castAt: this.app.state.roundNumber,
      duration: duration,
      expiresAt: duration ? this.app.state.roundNumber + duration : null,
      requiresConcentration: requiresConcentration
    };
    
    // Add to active spells
    this.activeSpells.push(spell);
    
    // If it requires concentration, add the concentration condition to the combatant
    if (requiresConcentration && this.app.conditions) {
      this.app.conditions.addConditionToCombatant(combatantId, 'concentration', duration);
    }
    
    // Log the spell casting
    this.app.logEvent(`${combatantName} cast ${spellName} (Level ${level})${requiresConcentration ? ' [Concentration]' : ''}.`);
    
    // Update the UI
    this.renderActiveSpells();
    
    return true;
  }
  
  removeSpell(spellId) {
    const spellIndex = this.activeSpells.findIndex(spell => spell.id === spellId);
    if (spellIndex === -1) return false;
    
    const spell = this.activeSpells[spellIndex];
    
    // Remove the spell from active spells
    this.activeSpells.splice(spellIndex, 1);
    
    // If it required concentration, remove the concentration condition
    if (spell.requiresConcentration && this.app.conditions) {
      this.app.conditions.removeConditionFromCombatant(spell.combatantId, 'concentration');
    }
    
    // Log the spell ending
    this.app.logEvent(`${spell.combatantName}'s spell "${spell.name}" has ended.`);
    
    // Update the UI
    this.renderActiveSpells();
    
    return true;
  }
  
  checkExpiredSpells() {
    const currentRound = this.app.state.roundNumber;
    const expiredSpells = this.activeSpells.filter(spell => spell.expiresAt && spell.expiresAt <= currentRound);
    
    expiredSpells.forEach(spell => {
      this.removeSpell(spell.id);
    });
  }
  
  renderActiveSpells() {
    // Find or create the active spells container
    let container = document.getElementById('active-spells-container');
    if (!container) {
      // Create the container if it doesn't exist
      const combatTimeline = document.getElementById('combat-timeline');
      if (!combatTimeline) return;
      
      const spellsSection = document.createElement('div');
      spellsSection.className = 'md:col-span-2 bg-gray-800 p-4 rounded-lg mt-4';
      spellsSection.innerHTML = `
        <div class="flex justify-between items-center mb-2">
          <h2 class="text-xl font-semibold">Active Spells</h2>
          <button id="add-spell-btn" class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-1 px-3 rounded text-sm">
            Add Spell
          </button>
        </div>
        <div id="active-spells-container" class="space-y-2"></div>
      `;
      
      // Insert after combat timeline
      combatTimeline.parentNode.insertBefore(spellsSection, combatTimeline.nextSibling);
      
      container = document.getElementById('active-spells-container');
      
      // Add event listener to the Add Spell button
      const addSpellBtn = document.getElementById('add-spell-btn');
      if (addSpellBtn) {
        addSpellBtn.addEventListener('click', () => {
          this.showAddSpellModal();
        });
      }
    }
    
    // Clear the container
    container.innerHTML = '';
    
    // If no active spells, show a message
    if (this.activeSpells.length === 0) {
      container.innerHTML = '<p class="text-gray-500 text-center">No active spells.</p>';
      return;
    }
    
    // Sort spells by expiration (null/indefinite duration at the end)
    const sortedSpells = [...this.activeSpells].sort((a, b) => {
      if (a.expiresAt === null && b.expiresAt === null) return 0;
      if (a.expiresAt === null) return 1;
      if (b.expiresAt === null) return -1;
      return a.expiresAt - b.expiresAt;
    });
    
    // Add each spell to the container
    sortedSpells.forEach(spell => {
      const spellElement = document.createElement('div');
      spellElement.className = `spell-item bg-gray-700 p-2 rounded flex justify-between items-center ${spell.requiresConcentration ? 'border-l-4 border-purple-500' : ''}`;
      
      let durationText = 'Indefinite';
      if (spell.expiresAt) {
        const roundsLeft = spell.expiresAt - this.app.state.roundNumber;
        durationText = `${roundsLeft} round${roundsLeft !== 1 ? 's' : ''} left`;
      }
      
      spellElement.innerHTML = `
        <div>
          <span class="font-bold">${spell.name}</span>
          <span class="text-xs text-gray-400">(Level ${spell.level})</span>
          <div class="text-xs">Cast by: ${spell.combatantName}</div>
        </div>
        <div class="flex items-center">
          <span class="text-sm mr-2">${durationText}</span>
          <button class="remove-spell-btn text-red-500 hover:text-red-400 font-bold text-xl" data-spell-id="${spell.id}">✖</button>
        </div>
      `;
      
      // Add event listener to remove button
      const removeBtn = spellElement.querySelector('.remove-spell-btn');
      removeBtn.addEventListener('click', () => {
        this.removeSpell(spell.id);
      });
      
      container.appendChild(spellElement);
    });
  }
  
  showAddSpellModal() {
    // Get all combatants
    const allCombatants = [
      ...Array.from(document.querySelectorAll('#heroes-list .combatant-card')),
      ...Array.from(document.querySelectorAll('#monsters-list .combatant-card'))
    ];
    
    if (allCombatants.length === 0) {
      this.app.showAlert("Please add some combatants before casting spells.");
      return;
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-lg w-full mx-auto">
        <h3 class="text-xl font-bold text-purple-400 mb-4">Add Spell</h3>
        
        <div class="mb-4">
          <label class="block text-gray-300 mb-2">Caster:</label>
          <select id="spell-caster" class="bg-gray-700 w-full rounded px-2 py-1 text-white">
            ${allCombatants.map(c => {
              const name = c.querySelector('.combatant-name').textContent;
              return `<option value="${c.id}">${name}</option>`;
            }).join('')}
          </select>
        </div>
        
        <div class="mb-4">
          <label class="block text-gray-300 mb-2">Spell Name:</label>
          <input type="text" id="spell-name" class="bg-gray-700 w-full rounded px-2 py-1 text-white" placeholder="e.g., Fireball, Bless, etc.">
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
          <label class="block text-gray-300 mb-2">Duration (rounds):</label>
          <input type="number" id="spell-duration" class="bg-gray-700 w-full rounded px-2 py-1 text-white" min="1" placeholder="Leave empty for indefinite">
        </div>
        
        <div class="mb-4">
          <label class="flex items-center text-gray-300">
            <input type="checkbox" id="spell-concentration" class="mr-2">
            Requires Concentration
          </label>
        </div>
        
        <div class="flex justify-end gap-2">
          <button class="add-btn bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">Add Spell</button>
          <button class="cancel-btn bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Cancel</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.cancel-btn').addEventListener('click', () => {
      modal.remove();
    });
    
    modal.querySelector('.add-btn').addEventListener('click', () => {
      const casterId = modal.querySelector('#spell-caster').value;
      const spellName = modal.querySelector('#spell-name').value.trim();
      const spellLevel = modal.querySelector('#spell-level').value;
      const durationInput = modal.querySelector('#spell-duration').value;
      const duration = durationInput ? parseInt(durationInput) : null;
      const requiresConcentration = modal.querySelector('#spell-concentration').checked;
      
      if (!spellName) {
        this.app.showAlert("Please enter a spell name.");
        return;
      }
      
      this.addSpell(casterId, spellName, spellLevel, duration, requiresConcentration);
      modal.remove();
    });
  }
  
  // Call this at the end of each turn to check for expired spells
  checkSpellsAtEndOfTurn() {
    this.checkExpiredSpells();
  }
  
  // Call this when a combatant takes damage to check for concentration
  checkConcentration(combatantId, damageAmount) {
    // Find any concentration spells for this combatant
    const concentrationSpells = this.activeSpells.filter(
      spell => spell.combatantId === combatantId && spell.requiresConcentration
    );
    
    if (concentrationSpells.length === 0) return;
    
    // DC is 10 or half the damage taken, whichever is higher
    const dc = Math.max(10, Math.floor(damageAmount / 2));
    
    // Roll a Constitution saving throw (simplified - just using a d20)
    const roll = Math.floor(Math.random() * 20) + 1;
    const success = roll >= dc;
    
    const combatantName = document.getElementById(combatantId)?.querySelector('.combatant-name')?.textContent || 'Unknown';
    
    if (success) {
      this.app.logEvent(`${combatantName} maintained concentration (DC ${dc}, rolled ${roll}).`);
    } else {
      this.app.logEvent(`${combatantName} failed to maintain concentration (DC ${dc}, rolled ${roll}).`);
      
      // If there are multiple concentration spells (shouldn't happen, but just in case),
      // ask which one to end
      if (concentrationSpells.length === 1) {
        this.removeSpell(concentrationSpells[0].id);
      } else {
        // In a real implementation, you'd show a UI to choose which spell to end
        this.removeSpell(concentrationSpells[0].id);
      }
    }
  }
}
