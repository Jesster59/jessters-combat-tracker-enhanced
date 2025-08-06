/**
 * Spell Tracker for Jesster's Combat Tracker
 * Handles spell slots and active spells
 */
export class SpellTracker {
  constructor(app) {
    this.app = app;
  }
  
  addSpellTrackingToCard(card, spellData = {}) {
    // Check if card already has spell tracking
    if (card.querySelector('.spell-tracking')) return;
    
    const spellTracking = document.createElement('div');
    spellTracking.className = 'spell-tracking mt-2 pt-2 border-t border-gray-600';
    spellTracking.innerHTML = `
      <div class="flex justify-between items-center">
        <h4 class="font-semibold text-sm text-gray-300">Spell Slots</h4>
        <button class="edit-spells-btn text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded">Edit</button>
      </div>
      <div class="spell-slots grid grid-cols-9 gap-1 mt-1">
        ${this.renderSpellSlots(spellData.slots || {})}
      </div>
      <div class="active-spells mt-2">
        <h4 class="font-semibold text-xs text-gray-300">Active Spells</h4>
        <div class="active-spells-list flex flex-wrap gap-1 mt-1">
          ${this.renderActiveSpells(spellData.activeSpells || [])}
        </div>
      </div>
    `;
    
    // Find where to insert spell tracking (after detailed stats if present)
    const detailedStats = card.querySelector('.detailed-stats');
    if (detailedStats) {
      detailedStats.insertAdjacentElement('afterend', spellTracking);
    } else {
      card.appendChild(spellTracking);
    }
    
    // Add event listeners
    card.querySelector('.edit-spells-btn').addEventListener('click', () => {
      this.openSpellEditor(card);
    });
    
    // Add click handlers for spell slots
    spellTracking.querySelectorAll('.spell-slot').forEach(slot => {
      slot.addEventListener('click', () => {
        slot.classList.toggle('used');
        this.updateSpellSlotsData(card);
      });
    });
    
    // Add click handlers for active spells
    spellTracking.querySelectorAll('.active-spell').forEach(spell => {
      spell.addEventListener('click', () => {
        this.editActiveSpell(card, spell.dataset.spellName);
      });
    });
  }
  
  renderSpellSlots(slots) {
    const levels = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    return levels.map(level => {
      const levelData = slots[level] || { max: 0, used: 0 };
      return `
        <div class="spell-level flex flex-col items-center">
          <span class="text-xs">${level}</span>
          <div class="slots-display" data-level="${level}" data-max="${levelData.max}" data-used="${levelData.used}">
            ${this.renderSlotCircles(levelData.max, levelData.used)}
          </div>
        </div>
      `;
    }).join('');
  }
  
  renderSlotCircles(max, used) {
    let html = '';
    for (let i = 0; i < max; i++) {
      html += `<span class="spell-slot ${i < used ? 'used' : ''}">•</span>`;
    }
    return html;
  }
  
  renderActiveSpells(activeSpells) {
    return activeSpells.map(spell => {
      return `
        <span class="active-spell bg-purple-600 text-white text-xs font-semibold px-2 py-1 rounded-full"
              data-spell-name="${spell.name}"
              data-spell-duration="${spell.duration}"
              data-spell-rounds="${spell.rounds || ''}"
              title="${spell.name} (${spell.duration})">
          ${spell.name} ${spell.rounds ? `(${spell.rounds})` : ''}
        </span>
      `;
    }).join('');
  }
  
  updateSpellSlotsData(card) {
    const hiddenData = card.querySelector('.hidden-data');
    if (!hiddenData) return;
    
    const slots = {};
    card.querySelectorAll('.slots-display').forEach(display => {
      const level = parseInt(display.dataset.level);
      const max = parseInt(display.dataset.max) || 0;
      const used = Array.from(display.querySelectorAll('.spell-slot.used')).length;
      
      slots[level] = { max, used };
    });
    
    // Store spell slots data
    try {
      const spellData = JSON.parse(hiddenData.dataset.spellData || '{}');
      spellData.slots = slots;
      hiddenData.dataset.spellData = JSON.stringify(spellData);
    } catch (e) {
      console.error("Error updating spell slots data:", e);
    }
  }
  
  openSpellEditor(card) {
    const hiddenData = card.querySelector('.hidden-data');
    if (!hiddenData) return;
    
    let spellData = {};
    try {
      spellData = JSON.parse(hiddenData.dataset.spellData || '{}');
    } catch (e) {
      console.error("Error parsing spell data:", e);
    }
    
    const slots = spellData.slots || {};
    const activeSpells = spellData.activeSpells || [];
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4';
    modal.id = 'spell-editor-modal';
    
    modal.innerHTML = `
      <div class="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-lg w-full mx-auto">
        <h3 class="text-xl font-bold text-purple-400 mb-4">Spell Management</h3>
        
        <div class="mb-4">
          <h4 class="font-semibold text-lg mb-2">Spell Slots</h4>
          <div class="grid grid-cols-9 gap-4">
            ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => {
              const levelData = slots[level] || { max: 0, used: 0 };
              return `
                <div class="text-center">
                  <div class="text-sm font-semibold mb-1">Level ${level}</div>
                  <input type="number" class="spell-slot-max w-full bg-gray-700 rounded p-1 text-center" data-level="${level}" value="${levelData.max}" min="0" max="9">
                  <div class="text-xs mt-1">Max Slots</div>
                  <input type="number" class="spell-slot-used w-full bg-gray-700 rounded p-1 text-center mt-2" data-level="${level}" value="${levelData.used}" min="0" max="${levelData.max}">
                  <div class="text-xs mt-1">Used</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
        
        <div class="mb-4">
          <h4 class="font-semibold text-lg mb-2">Active Spells</h4>
          <div id="active-spells-list" class="space-y-2">
            ${activeSpells.map((spell, index) => `
              <div class="active-spell-item flex items-center space-x-2">
                <input type="text" class="spell-name bg-gray-700 rounded p-1 flex-grow" placeholder="Spell Name" value="${spell.name}">
                <input type="text" class="spell-duration bg-gray-700 rounded p-1 w-24" placeholder="Duration" value="${spell.duration}">
                <input type="number" class="spell-rounds bg-gray-700 rounded p-1 w-16" placeholder="Rounds" value="${spell.rounds || ''}">
                <button type="button" class="remove-spell-btn text-red-500 hover:text-red-400 font-bold text-xl" data-index="${index}">✖</button>
              </div>
            `).join('')}
          </div>
          <button type="button" id="add-active-spell-btn" class="mt-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold py-1 px-2 rounded">Add Spell</button>
        </div>
        
        <div class="flex justify-end space-x-3">
          <button type="button" id="cancel-spell-edit-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Cancel</button>
          <button type="button" id="save-spell-edit-btn" class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">Save</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('cancel-spell-edit-btn').addEventListener('click', () => {
      modal.remove();
    });
    
    document.getElementById('save-spell-edit-btn').addEventListener('click', () => {
      this.saveSpellEdits(card, modal);
    });
    
    document.getElementById('add-active-spell-btn').addEventListener('click', () => {
      this.addActiveSpellInput();
    });
    
    // Add event listeners to remove buttons
    modal.querySelectorAll('.remove-spell-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        e.target.closest('.active-spell-item').remove();
        
        // Update indices for remaining items
        modal.querySelectorAll('.remove-spell-btn').forEach((btn, i) => {
          btn.dataset.index = i;
        });
      });
    });
  }
  
  addActiveSpellInput() {
    const list = document.getElementById('active-spells-list');
    if (!list) return;
    
    const index = list.children.length;
    
    const item = document.createElement('div');
    item.className = 'active-spell-item flex items-center space-x-2';
    item.innerHTML = `
      <input type="text" class="spell-name bg-gray-700 rounded p-1 flex-grow" placeholder="Spell Name" value="">
      <input type="text" class="spell-duration bg-gray-700 rounded p-1 w-24" placeholder="Duration" value="">
      <input type="number" class="spell-rounds bg-gray-700 rounded p-1 w-16" placeholder="Rounds" value="">
      <button type="button" class="remove-spell-btn text-red-500 hover:text-red-400 font-bold text-xl" data-index="${index}">✖</button>
    `;
    
    list.appendChild(item);
    
    item.querySelector('.remove-spell-btn').addEventListener('click', (e) => {
      item.remove();
      
      // Update indices for remaining items
      list.querySelectorAll('.remove-spell-btn').forEach((btn, i) => {
        btn.dataset.index = i;
      });
    });
  }
  
  saveSpellEdits(card, modal) {
    const hiddenData = card.querySelector('.hidden-data');
    if (!hiddenData) return;
    
    // Gather spell slots data
    const slots = {};
    modal.querySelectorAll('.spell-slot-max').forEach(input => {
      const level = parseInt(input.dataset.level);
      const max = parseInt(input.value) || 0;
      const usedInput = modal.querySelector(`.spell-slot-used[data-level="${level}"]`);
      const used = parseInt(usedInput?.value) || 0;
      
      slots[level] = { max, used };
    });
    
    // Gather active spells data
    const activeSpells = [];
    modal.querySelectorAll('.active-spell-item').forEach(item => {
      const name = item.querySelector('.spell-name').value.trim();
      const duration = item.querySelector('.spell-duration').value.trim();
      const rounds = item.querySelector('.spell-rounds').value.trim();
      
      if (name) {
        activeSpells.push({
          name,
          duration: duration || 'Concentration',
          rounds: rounds ? parseInt(rounds) : null
        });
      }
    });
    
    // Save spell data
    try {
      const spellData = { slots, activeSpells };
      hiddenData.dataset.spellData = JSON.stringify(spellData);
      
      // Update spell tracking display
      const spellTracking = card.querySelector('.spell-tracking');
      if (spellTracking) {
        spellTracking.querySelector('.spell-slots').innerHTML = this.renderSpellSlots(slots);
        spellTracking.querySelector('.active-spells-list').innerHTML = this.renderActiveSpells(activeSpells);
        
        // Re-add click handlers for spell slots
        spellTracking.querySelectorAll('.spell-slot').forEach(slot => {
          slot.addEventListener('click', () => {
            slot.classList.toggle('used');
            this.updateSpellSlotsData(card);
          });
        });
        
        // Re-add click handlers for active spells
        spellTracking.querySelectorAll('.active-spell').forEach(spell => {
          spell.addEventListener('click', () => {
            this.editActiveSpell(card, spell.dataset.spellName);
          });
        });
      }
      
      this.app.logEvent(`Updated spell information for ${card.querySelector('.combatant-name').textContent}.`);
    } catch (e) {
      console.error("Error saving spell data:", e);
    }
    
    // Close modal
    modal.remove();
  }
  
  editActiveSpell(card, spellName) {
    const hiddenData = card.querySelector('.hidden-data');
    if (!hiddenData) return;
    
    let spellData = {};
    try {
      spellData = JSON.parse(hiddenData.dataset.spellData || '{}');
    } catch (e) {
      console.error("Error parsing spell data:", e);
      return;
    }
    
    const activeSpells = spellData.activeSpells || [];
    const spell = activeSpells.find(s => s.name === spellName);
    if (!spell) return;
    
    // Prompt for rounds remaining
    const newRounds = prompt(
      `Edit rounds remaining for ${spellName} (currently ${spell.rounds !== null ? spell.rounds : 'permanent'}). 
      Enter 0 or leave blank to remove, or a new number of rounds:`,
      spell.rounds !== null ? spell.rounds : ''
    );
    
    if (newRounds === null) return; // User cancelled
    
    if (newRounds === '' || parseInt(newRounds) === 0) {
      // Remove the spell
      spellData.activeSpells = activeSpells.filter(s => s.name !== spellName);
      this.app.logEvent(`Removed active spell '${spellName}'.`);
    } else {
      // Update the spell
      const roundsNum = parseInt(newRounds);
      if (!isNaN(roundsNum) && roundsNum > 0) {
        spell.rounds = roundsNum;
        this.app.logEvent(`Updated active spell '${spellName}' to ${roundsNum} rounds.`);
      } else {
        this.app.showAlert("Invalid number of rounds entered. Spell not changed.");
        return;
      }
    }
    
    // Save updated spell data
    hiddenData.dataset.spellData = JSON.stringify(spellData);
    
    // Update spell tracking display
    const spellTracking = card.querySelector('.spell-tracking');
    if (spellTracking) {
      spellTracking.querySelector('.active-spells-list').innerHTML = this.renderActiveSpells(spellData.activeSpells || []);
      
      // Re-add click handlers for active spells
      spellTracking.querySelectorAll('.active-spell').forEach(spell => {
        spell.addEventListener('click', () => {
          this.editActiveSpell(card, spell.dataset.spellName);
        });
      });
    }
  }
}
