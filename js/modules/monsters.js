/**
 * Monster Manager for Jesster's Combat Tracker
 * Handles monster management and SRD integration
 */
export class MonsterManager {
  constructor(app) {
    this.app = app;
  }
  
  openMonsterManualModal() {
    // Create and show the monster manual modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4';
    modal.id = 'monster-manual-modal';
    
    modal.innerHTML = `
      <div class="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-4xl w-full mx-auto" style="max-height: 90vh; overflow-y: auto;">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="text-xl font-bold text-lime-400 mb-4">Create/Edit Monster</h3>
            <form id="monster-manual-form" class="space-y-2 text-sm overflow-y-auto" style="max-height: 75vh;">
              <input type="hidden" id="monster-id">
              <div><label>Name: <input type="text" id="monster-name" class="w-full bg-gray-700 rounded p-1"></label></div>
              <div><label>Image URL: <input type="text" id="monster-img" class="w-full bg-gray-700 rounded p-1"></label></div>
              <div class="grid grid-cols-2 gap-2">
                <div><label>HP (Dice): <input type="text" id="monster-hp" class="w-full bg-gray-700 rounded p-1" placeholder="e.g. 10d8+20"></label></div>
                <div><label>AC: <input type="number" id="monster-ac" class="w-full bg-gray-700 rounded p-1"></label></div>
              </div>
              <div class="grid grid-cols-6 gap-2">
                <div><label>STR: <input type="number" id="monster-str" class="w-full bg-gray-700 rounded p-1" value="10"></label></div>
                <div><label>DEX: <input type="number" id="monster-dex" class="w-full bg-gray-700 rounded p-1" value="10"></label></div>
                <div><label>CON: <input type="number" id="monster-con" class="w-full bg-gray-700 rounded p-1" value="10"></label></div>
                <div><label>INT: <input type="number" id="monster-int" class="w-full bg-gray-700 rounded p-1" value="10"></label></div>
                <div><label>WIS: <input type="number" id="monster-wis" class="w-full bg-gray-700 rounded p-1" value="10"></label></div>
                <div><label>CHA: <input type="number" id="monster-cha" class="w-full bg-gray-700 rounded p-1" value="10"></label></div>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div><label>Init Mod: <input type="number" id="monster-init-mod" class="w-full bg-gray-700 rounded p-1" placeholder="+0"></label></div>
                <div><label>PP: <input type="number" id="monster-pp" class="w-full bg-gray-700 rounded p-1"></label></div>
              </div>
              <div><label>Saves: <input type="text" id="monster-saves" class="w-full bg-gray-700 rounded p-1" placeholder="e.g. STR +5, DEX +2"></label></div>
              <div><label>Skills: <input type="text" id="monster-skills" class="w-full bg-gray-700 rounded p-1" placeholder="e.g. Perception +4"></label></div>
              <div><label>Senses: <input type="text" id="monster-senses" class="w-full bg-gray-700 rounded p-1" placeholder="e.g. darkvision 60 ft."></label></div>
              <div><label>Languages: <input type="text" id="monster-languages" class="w-full bg-gray-700 rounded p-1" placeholder="e.g. Common, Draconic"></label></div>
              <div><label>Damage R/V/I: <input type="text" id="monster-damage-info" class="w-full bg-gray-700 rounded p-1" placeholder="Vuln: Fire; Resist: Cold"></label></div>
              <div><label>Cond. Immune: <input type="text" id="monster-cond-immune" class="w-full bg-gray-700 rounded p-1"></label></div>
              <div><label>Movement: <input type="text" id="monster-movement" class="w-full bg-gray-700 rounded p-1"></label></div>

              <div class="mt-4">
                <h4 class="font-semibold text-gray-300">Actions</h4>
                <div id="monster-actions-container" class="space-y-2 mt-1"></div>
                <button type="button" id="add-monster-action-btn" class="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded mt-2">Add Action</button>
              </div>
              
              <div class="mt-4">
                <h4 class="font-semibold text-gray-300">Legendary Actions (Description)</h4>
                <textarea id="monster-legendary-actions" class="w-full bg-gray-700 rounded p-1" rows="2"></textarea>
              </div>

              <div class="pt-4 flex justify-end space-x-2">
                <button type="button" id="clear-manual-form-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">New</button>
                <button type="submit" class="bg-lime-600 hover:bg-lime-700 text-white font-bold py-2 px-4 rounded">Save Monster</button>
              </div>
            </form>
          </div>
          <div>
            <h3 class="text-xl font-bold text-lime-400 mb-4">Monster Manual</h3>
            <div id="monster-manual-list" class="overflow-y-auto bg-gray-900 p-2 rounded space-y-2" style="height: 60vh;"></div>
            <div class="mt-4 flex justify-end">
              <button id="close-manual-btn" class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Close</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('close-manual-btn').addEventListener('click', () => {
      document.getElementById('monster-manual-modal').remove();
    });
    
    document.getElementById('clear-manual-form-btn').addEventListener('click', () => {
      this.clearManualForm();
    });
    
    document.getElementById('monster-manual-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveMonsterToManual();
    });
    
    document.getElementById('add-monster-action-btn').addEventListener('click', () => {
      this.addMonsterActionInput();
    });
    
    // Render monster manual list
    this.renderMonsterManual();
  }
  
  closeMonsterManualModal() {
    const modal = document.getElementById('monster-manual-modal');
    if (modal) modal.remove();
  }
  
  clearManualForm() {
    const form = document.getElementById('monster-manual-form');
    if (!form) return;
    
    form.reset();
    document.getElementById('monster-id').value = '';
    document.getElementById('monster-actions-container').innerHTML = '';
  }
  
  addMonsterActionInput(action = {}) {
    const container = document.getElementById('monster-actions-container');
    if (!container) return;
    
    const actionGroup = document.createElement('div');
    actionGroup.className = 'monster-action-group grid grid-cols-12 gap-2 items-center';
    actionGroup.innerHTML = `
      <input type="text" class="action-name col-span-4 bg-gray-600 rounded p-1" placeholder="Action Name" value="${action.name || ''}">
      <input type="number" class="action-tohit col-span-2 bg-gray-600 rounded p-1" placeholder="Hit" value="${action.toHit || ''}">
      <input type="text" class="action-damage col-span-3 bg-gray-600 rounded p-1" placeholder="Damage" value="${action.damage || ''}">
      <input type="text" class="action-dc col-span-2 bg-gray-600 rounded p-1" placeholder="DC" value="${action.dc || ''}">
      <button type="button" class="remove-action-btn col-span-1 text-red-500 text-center">✖</button>
    `;
    
    container.appendChild(actionGroup);
    
    actionGroup.querySelector('.remove-action-btn').addEventListener('click', () => {
      actionGroup.remove();
    });
  }
  
  saveMonsterToManual() {
    const form = document.getElementById('monster-manual-form');
    if (!form) return;
    
    const monsterId = document.getElementById('monster-id').value || crypto.randomUUID();
    
    // Get actions from form
    const actions = Array.from(document.querySelectorAll('.monster-action-group')).map(group => ({
      name: group.querySelector('.action-name').value,
      toHit: parseInt(group.querySelector('.action-tohit').value) || null,
      damage: group.querySelector('.action-damage').value,
      dc: group.querySelector('.action-dc').value
    }));
    
    const monsterData = {
      id: monsterId,
      name: document.getElementById('monster-name').value || 'Unnamed Monster',
      img: document.getElementById('monster-img').value,
      hp: document.getElementById('monster-hp').value,
      ac: parseInt(document.getElementById('monster-ac').value) || 10,
      initMod: parseInt(document.getElementById('monster-init-mod').value) || 0,
      pp: parseInt(document.getElementById('monster-pp').value) || 10,
      str: parseInt(document.getElementById('monster-str').value) || 10,
      dex: parseInt(document.getElementById('monster-dex').value) || 10,
      con: parseInt(document.getElementById('monster-con').value) || 10,
      int: parseInt(document.getElementById('monster-int').value) || 10,
      wis: parseInt(document.getElementById('monster-wis').value) || 10,
      cha: parseInt(document.getElementById('monster-cha').value) || 10,
      saves: document.getElementById('monster-saves').value,
      skills: document.getElementById('monster-skills').value,
      senses: document.getElementById('monster-senses').value,
      languages: document.getElementById('monster-languages').value,
      damageInfo: document.getElementById('monster-damage-info').value,
      condImmune: document.getElementById('monster-cond-immune').value,
      movement: document.getElementById('monster-movement').value,
      legendaryActions: document.getElementById('monster-legendary-actions').value,
      actions: actions,
      type: 'monster'
    };
    
    if (!monsterData.name) {
      this.app.showAlert('Monster name is required.');
      return;
    }
    
    // Save to data manager
    this.app.data.saveMonster(monsterData).then(success => {
      if (success) {
        this.clearManualForm();
        this.renderMonsterManual();
      }
    });
  }
  
  renderMonsterManual() {
    const listElement = document.getElementById('monster-manual-list');
    if (!listElement) return;
    
    listElement.innerHTML = '';
    const manual = this.app.data.monsterManual;
    
    if (manual.length === 0) {
      listElement.innerHTML = `<p class="text-gray-400 text-center p-4">Your monster manual is empty. Use the form to create new monsters or search the SRD.</p>`;
      return;
    }
    
    manual.sort((a, b) => a.name.localeCompare(b.name)).forEach(monster => {
      const monsterDiv = document.createElement('div');
      monsterDiv.className = 'bg-gray-700 p-2 rounded flex justify-between items-center';
      monsterDiv.innerHTML = `
        <span>${monster.name}</span>
        <div>
          <button class="edit-monster-btn text-sm bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded" data-id="${monster.id}">Edit</button>
          <button class="delete-monster-btn text-sm bg-red-500 hover:bg-red-600 px-2 py-1 rounded ml-2" data-id="${monster.id}">Del</button>
        </div>
      `;
      listElement.appendChild(monsterDiv);
    });
    
    // Add event listeners
    listElement.querySelectorAll('.delete-monster-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.deleteMonsterFromManual(e.target.dataset.id);
      });
    });
    
    listElement.querySelectorAll('.edit-monster-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.editMonsterInManual(e.target.dataset.id);
      });
    });
  }
  
  deleteMonsterFromManual(monsterId) {
    const monster = this.app.data.monsterManual.find(m => m.id === monsterId);
    if (!monster) return;
    
    this.app.showConfirm(`Are you sure you want to delete ${monster.name} from your monster manual?`, () => {
      this.app.data.deleteMonster(monsterId).then(success => {
        if (success) {
          this.renderMonsterManual();
        }
      });
    });
  }
  
  editMonsterInManual(monsterId) {
    const monster = this.app.data.monsterManual.find(m => m.id === monsterId);
    if (!monster) return;
    
    // Populate the form
    document.getElementById('monster-id').value = monster.id;
    document.getElementById('monster-name').value = monster.name || '';
    document.getElementById('monster-img').value = monster.img || '';
    document.getElementById('monster-hp').value = monster.hp || '';
    document.getElementById('monster-ac').value = monster.ac || '';
    document.getElementById('monster-str').value = monster.str || '';
    document.getElementById('monster-dex').value = monster.dex || '';
    document.getElementById('monster-con').value = monster.con || '';
    document.getElementById('monster-int').value = monster.int || '';
    document.getElementById('monster-wis').value = monster.wis || '';
    document.getElementById('monster-cha').value = monster.cha || '';
    document.getElementById('monster-init-mod').value = monster.initMod || '';
    document.getElementById('monster-pp').value = monster.pp || '';
    document.getElementById('monster-saves').value = monster.saves || '';
    document.getElementById('monster-skills').value = monster.skills || '';
    document.getElementById('monster-senses').value = monster.senses || '';
    document.getElementById('monster-languages').value = monster.languages || '';
    document.getElementById('monster-damage-info').value = monster.damageInfo || '';
    document.getElementById('monster-cond-immune').value = monster.condImmune || '';
    document.getElementById('monster-movement').value = monster.movement || '';
    document.getElementById('monster-legendary-actions').value = monster.legendaryActions || '';
    
    // Clear existing actions
    document.getElementById('monster-actions-container').innerHTML = '';
    
    // Add actions
    if (monster.actions && Array.isArray(monster.actions)) {
      monster.actions.forEach(action => {
        this.addMonsterActionInput(action);
      });
    }
  }
  
  async searchSrdMonsters() {
    const searchInput = document.getElementById('srd-search-input');
    const resultsContainer = document.getElementById('srd-search-results');
    
    if (!searchInput || !resultsContainer) return;
    
    const query = searchInput.value.trim();
    if (query.length < 2) {
      resultsContainer.innerHTML = '<p class="text-gray-400 text-center">Please enter at least 2 characters.</p>';
      return;
    }
    
    resultsContainer.innerHTML = '<p class="text-gray-400 text-center">Searching...</p>';
    
    try {
      const response = await fetch(`https://api.open5e.com/v1/monsters/?search=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) throw new Error(`API error: ${response.statusText}`);
      
      const data = await response.json();
      
      resultsContainer.innerHTML = '';
      
      if (data.results && data.results.length > 0) {
        data.results.forEach(monster => {
          const div = document.createElement('div');
          div.className = 'p-2 rounded cursor-pointer text-white hover:bg-gray-700';
          div.textContent = `${monster.name} (CR ${monster.challenge_rating})`;
          div.dataset.monster = JSON.stringify(monster);
          
          div.addEventListener('click', (e) => {
            const monsterData = JSON.parse(e.target.dataset.monster);
            this.addSrdMonsterToManual(monsterData);
          });
          
          resultsContainer.appendChild(div);
        });
        
        this.app.logEvent(`Found ${data.results.length} SRD monsters for '${query}'.`);
      } else {
        resultsContainer.innerHTML = '<p class="text-gray-400 text-center">No monsters found.</p>';
        this.app.logEvent(`No SRD monsters found for '${query}'.`);
      }
    } catch (error) {
      console.error("SRD Search Error:", error);
      resultsContainer.innerHTML = '<p class="text-red-400 text-center">Error fetching data.</p>';
      this.app.logEvent(`Error searching SRD: ${error.message}`);
    }
  }
  
    async addSrdMonsterToManual(srdMonster) {
    // Calculate ability modifiers
    const getMod = (score) => Math.floor(((score || 10) - 10) / 2);
    
    // Format saving throws
    const saves = [
      srdMonster.strength_save ? `STR +${srdMonster.strength_save}` : null,
      srdMonster.dexterity_save ? `DEX +${srdMonster.dexterity_save}` : null,
      srdMonster.constitution_save ? `CON +${srdMonster.constitution_save}` : null,
      srdMonster.intelligence_save ? `INT +${srdMonster.intelligence_save}` : null,
      srdMonster.wisdom_save ? `WIS +${srdMonster.wisdom_save}` : null,
      srdMonster.charisma_save ? `CHA +${srdMonster.charisma_save}` : null,
    ].filter(Boolean).join(', ');
    
    // Format damage info
    const damageVuln = srdMonster.damage_vulnerabilities || "";
    const damageRes = srdMonster.damage_resistances || "";
    const damageImm = srdMonster.damage_immunities || "";
    let damageInfo = '';
    if (damageVuln) damageInfo += `Vulnerabilities ${damageVuln}. `;
    if (damageRes) damageInfo += `Resistances ${damageRes}. `;
    if (damageImm) damageInfo += `Immunities ${damageImm}. `;
    damageInfo = damageInfo.trim() || 'N/A';
    
    // Format actions
    const actions = (srdMonster.actions || []).map(a => ({
      name: a.name || 'Unknown Action',
      toHit: a.attack_bonus || null,
      damage: a.damage_dice || '',
      dc: a.dc ? `${a.dc.dc_type.name.toUpperCase()} ${a.dc.dc_value}` : ''
    }));
    
    // Helper to format senses/skills names
    const formatCamelCaseToTitle = (str) => {
      return str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };
    
    const skills = srdMonster.skills ? Object.entries(srdMonster.skills).map(([skill, val]) => `${formatCamelCaseToTitle(skill)} +${val}`).join(', ') : '';
    const senses = srdMonster.senses ? Object.entries(srdMonster.senses).map(([sense, val]) => `${formatCamelCaseToTitle(sense)} ${val}`).join(', ') : '';
    
    const movement = Object.entries(srdMonster.speed || {}).map(([type, dist]) => `${type} ${dist}ft.`).join(', ');
    
    const monsterData = {
      id: `srd-${srdMonster.slug}`,
      name: srdMonster.name || 'Unnamed SRD Monster',
      img: srdMonster.image || '',
      hp: srdMonster.hit_dice || `${srdMonster.hit_points || 1}d8`,
      ac: srdMonster.armor_class ?? 10,
      str: srdMonster.strength ?? 10,
      dex: srdMonster.dexterity ?? 10,
      con: srdMonster.constitution ?? 10,
      int: srdMonster.intelligence ?? 10,
      wis: srdMonster.wisdom ?? 10,
      cha: srdMonster.charisma ?? 10,
      initMod: getMod(srdMonster.dexterity),
      pp: srdMonster.passive_perception ?? 10,
      saves: saves,
      skills: skills,
      senses: senses,
      languages: srdMonster.languages || '',
      damageInfo: damageInfo,
      condImmune: srdMonster.condition_immunities || "",
      movement: movement,
      actions: actions,
      legendaryActions: srdMonster.legendary_desc || '',
      type: 'monster',
      srd: '5.1',
      fullSrdJson: srdMonster
    };
    
    const success = await this.app.data.saveMonster(monsterData);
    if (success) {
      this.app.showAlert(`${srdMonster.name} has been added to your manual!`);
      this.app.logEvent(`Added SRD monster '${srdMonster.name}' to personal manual.`);
      
      // Clear search results
      const searchResults = document.getElementById('srd-search-results');
      if (searchResults) searchResults.innerHTML = '';
      
      // Clear search input
      const searchInput = document.getElementById('srd-search-input');
      if (searchInput) searchInput.value = '';
      
      // Refresh monster manual list
      this.renderMonsterManual();
    }
  }
  
  openEncounterModal() {
    // Create and show the encounter modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4';
    modal.id = 'encounter-modal';
    
    modal.innerHTML = `
      <div class="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-lg w-full mx-auto">
        <h3 class="text-xl font-bold text-amber-400 mb-4 text-center">Manage Encounters</h3>
        <div class="flex flex-col gap-4">
          <div>
            <h4 class="font-semibold text-lg text-amber-200 mb-2">Save Current Combatants as New Encounter</h4>
            <input type="text" id="new-encounter-name-input" class="w-full bg-gray-700 rounded p-2 mb-2" placeholder="Enter name for this encounter...">
            <button id="create-encounter-btn" class="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold py-2 px-4 rounded">Save Encounter</button>
          </div>
          <hr class="border-gray-600">
          <div>
            <h4 class="font-semibold text-lg text-amber-200 mb-2">Load Saved Encounter</h4>
            <div id="saved-encounters-list" class="max-h-60 overflow-y-auto bg-gray-900 p-2 rounded space-y-2"></div>
          </div>
        </div>
        <div class="mt-6 flex justify-end">
          <button id="close-encounter-modal-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Close</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('close-encounter-modal-btn').addEventListener('click', () => {
      document.getElementById('encounter-modal').remove();
    });
    
    document.getElementById('create-encounter-btn').addEventListener('click', () => {
      this.saveEncounter();
    });
    
    // Render encounter list
    this.renderEncounterList();
  }
  
  closeEncounterModal() {
    const modal = document.getElementById('encounter-modal');
    if (modal) modal.remove();
  }
  
  renderEncounterList() {
    const listElement = document.getElementById('saved-encounters-list');
    if (!listElement) return;
    
    listElement.innerHTML = '';
    const encounters = this.app.data.encounters;
    
    if (encounters.length === 0) {
      listElement.innerHTML = `<p class="text-gray-400 text-center p-4">No saved encounters.</p>`;
      return;
    }
    
    encounters.sort((a, b) => a.name.localeCompare(b.name)).forEach(encounter => {
      const encounterDiv = document.createElement('div');
      encounterDiv.className = 'bg-gray-700 p-2 rounded flex justify-between items-center';
      encounterDiv.innerHTML = `
        <span>${encounter.name}</span>
        <div>
          <button class="load-encounter-btn text-sm bg-green-600 hover:bg-green-700 px-2 py-1 rounded" data-id="${encounter.id}">Load</button>
          <button class="delete-encounter-btn text-sm bg-red-600 hover:bg-red-700 px-2 py-1 rounded ml-2" data-id="${encounter.id}">Del</button>
        </div>
      `;
      listElement.appendChild(encounterDiv);
    });
    
    // Add event listeners
    listElement.querySelectorAll('.load-encounter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.loadEncounter(e.target.dataset.id);
      });
    });
    
    listElement.querySelectorAll('.delete-encounter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.deleteEncounter(e.target.dataset.id);
      });
    });
  }
  
  saveEncounter() {
    const encounterName = document.getElementById('new-encounter-name-input').value.trim();
    if (!encounterName) {
      this.app.showAlert("Please enter a name for the encounter.");
      return;
    }
    
    // Get current combatants
    const heroes = Array.from(document.querySelectorAll('#heroes-list .combatant-card')).map(card => {
      return this.app.combat.getCombatantData(card);
    });
    
    const monsters = Array.from(document.querySelectorAll('#monsters-list .combatant-card')).map(card => {
      return this.app.combat.getCombatantData(card);
    });
    
    const encounterData = {
      name: encounterName,
      heroes: heroes,
      monsters: monsters
    };
    
    this.app.data.saveEncounter(encounterData).then(success => {
      if (success) {
        document.getElementById('new-encounter-name-input').value = '';
        this.renderEncounterList();
        this.app.showAlert(`Encounter '${encounterName}' saved!`);
      }
    });
  }
  
  loadEncounter(encounterId) {
    const encounter = this.app.data.encounters.find(e => e.id === encounterId);
    if (!encounter) return;
    
    this.app.showConfirm(`Load encounter '${encounter.name}'? This will replace all current combatants.`, () => {
      // Reset combat
      this.app.combat.resetCombat();
      
      // Clear current combatants
      document.getElementById('heroes-list').innerHTML = '';
      document.getElementById('monsters-list').innerHTML = '';
      
      // Add heroes from encounter
      encounter.heroes.forEach(heroData => {
        const heroCopy = {
          ...heroData,
          currentHp: heroData.hp,
          id: `combatant-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        };
        this.app.roster.addHeroToCombat(heroCopy);
      });
      
      // Add monsters from encounter
      encounter.monsters.forEach(monsterData => {
        const monsterCopy = {
          ...monsterData,
          id: `combatant-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        };
        this.addMonsterToCombat(monsterCopy);
      });
      
      this.app.logEvent(`Loaded encounter '${encounter.name}'.`);
      this.closeEncounterModal();
    });
  }
  
  deleteEncounter(encounterId) {
    const encounter = this.app.data.encounters.find(e => e.id === encounterId);
    if (!encounter) return;
    
    this.app.showConfirm(`Are you sure you want to delete encounter '${encounter.name}'?`, () => {
      this.app.data.deleteEncounter(encounterId).then(success => {
        if (success) {
          this.renderEncounterList();
        }
      });
    });
  }
  
  addMonsterToCombat(monsterData) {
    // Create a copy of the monster data for combat
    const combatMonster = {
      ...monsterData,
      id: `combatant-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    };
    
    // If HP is a dice string, roll it
    if (typeof combatMonster.hp === 'string' && combatMonster.hp.includes('d')) {
      this.app.dice.roll(combatMonster.hp).then(rolledHp => {
        combatMonster.currentHp = rolledHp;
        combatMonster.maxHp = rolledHp;
        
        // Create monster card
        const card = this.createMonsterCard(combatMonster);
        
        // Add to monsters list
        document.getElementById('monsters-list').appendChild(card);
        
        this.app.logEvent(`Added monster '${monsterData.name}' to combat.`);
      });
    } else {
      // Use the provided HP
      combatMonster.currentHp = parseInt(combatMonster.hp) || 10;
      combatMonster.maxHp = combatMonster.currentHp;
      
      // Create monster card
      const card = this.createMonsterCard(combatMonster);
      
      // Add to monsters list
      document.getElementById('monsters-list').appendChild(card);
      
      this.app.logEvent(`Added monster '${monsterData.name}' to combat.`);
    }
  }
  
  createMonsterCard(monsterData) {
    // This would create a monster card for the combat tracker
    // For brevity, I'm providing a simplified version
    
    const card = document.createElement('div');
    card.className = 'combatant-card bg-gray-700 p-3 rounded-md shadow-md';
    card.dataset.type = 'monster';
    card.id = monsterData.id;
    
    card.innerHTML = `
      <div class="flex items-start justify-between">
        <div class="flex items-center flex-1 min-w-0">
          <div class="w-8 flex-shrink-0"></div>
          <img src="${monsterData.img || 'https://placehold.co/60x60/e74c3c/ffffff?text=' + monsterData.name.charAt(0).toUpperCase()}" alt="${monsterData.name}" class="w-12 h-12 rounded-full mr-3 border-2 border-red-300 flex-shrink-0 combatant-img">
          <div class="min-w-0 flex-1">
            <p contenteditable="true" class="font-bold text-lg truncate combatant-name focus:outline-none focus:ring-2 focus:ring-red-400 rounded px-1">${monsterData.name}</p>
          </div>
        </div>
        <div class="flex items-center space-x-2 flex-shrink-0 ml-4">
          <input type="number" class="initiative-input font-bold text-xl text-gray-200 bg-gray-600 w-16 text-center rounded" value="${monsterData.initiative || ''}" placeholder="Init">
          <div class="flex flex-col items-center text-xs"><span>Conc.</span><input type="checkbox" class="concentration-check"></div>
          <button class="remove-btn text-red-500 hover:text-red-400 font-bold text-xl">✖</button>
        </div>
      </div>
      <div class="mt-2 space-y-2">
        <div class="flex items-center space-x-0.5 text-sm text-gray-400">
          <button class="hp-adjust-btn bg-green-700 hover:bg-green-600 text-white px-1 py-0.5 rounded-sm text-xs" data-hp-change="1" title="Heal 1 HP">+</button>
          <button class="hp-adjust-btn bg-green-700 hover:bg-green-600 text-white px-1 py-0.5 rounded-sm text-xs" data-hp-change="5" title="Heal 5 HP">++</button>
          <div class="flex items-center space-x-1 flex-1" title="Health Points"><span class="text-lg">❤️</span><input type="text" class="hp-input bg-gray-700 rounded px-1 py-0.5 w-full text-center" value="${monsterData.currentHp}" data-previous-hp="${monsterData.currentHp}" data-max-hp="${monsterData.maxHp}"><span class="hp-display">/${monsterData.maxHp}</span></div>
          <button class="hp-adjust-btn bg-red-700 hover:bg-red-600 text-white px-1 py-0.5 rounded-sm text-xs" data-hp-change="-1" title="Take 1 Damage">-</button>
          <button class="hp-adjust-btn bg-red-700 hover:bg-red-600 text-white px-1 py-0.5 rounded-sm text-xs" data-hp-change="-5" title="Take 5 Damage">--</button>
          <div class="flex items-center space-x-1 flex-1 ml-2" title="Temporary HP"><span class="text-lg">➕</span><input type="number" class="temp-hp-input bg-gray-700 rounded px-1 py-0.5 w-full text-center" value="" placeholder="0"></div>
          <div class="flex items-center space-x-1 flex-1" title="Armor Class"><span class="text-lg">🛡️</span><input type="number" class="ac-input bg-gray-600 rounded px-1 py-0.5 w-full text-center" value="${monsterData.ac || 10}"></div>
          <div class="flex items-center space-x-1 flex-1" title="Passive Perception"><span class="text-lg">🔍</span><input type="number" class="pp-input bg-gray-600 rounded px-1 py-0.5 w-full text-center" value="${monsterData.pp || 10}"></div>
        </div>
        <div class="flex items-center text-sm text-gray-400"><span class="font-semibold w-20 flex-shrink-0">Movement:</span><input type="text" class="movement-input bg-gray-600 w-full rounded px-2 py-1 text-white" value="${monsterData.movement || '30ft'}" placeholder="e.g., 30ft, fly 60ft"></div>
        <div class="flex items-center justify-between space-x-2 text-xs mt-2 text-gray-300">
          <div class="flex items-center space-x-2">
            <button class="roll-save-btn text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded">Save</button>
            <button class="toggle-stats-btn text-gray-400 hover:text-white" title="Toggle Stats">🔍</button>
          </div>
          <div class="flex items-center space-x-2">
            <label class="flex items-center space-x-1"><input type="checkbox" class="action-check rounded-sm"><span>Action</span></label>
            <label class="flex items-center space-x-1"><input type="checkbox" class="bonus-action-check rounded-sm"><span>Bonus</span></label>
            <label class="flex items-center space-x-1"><input type="checkbox" class="reaction-check rounded-sm"><span>Reaction</span></label>
          </div>
        </div>
        <div class="text-sm text-gray-400"><div class="flex items-center justify-between"><span class="font-semibold">Conditions:</span><button class="add-condition-btn text-xs bg-green-600 hover:bg-green-700 px-2 py-1 rounded">+</button></div><div class="conditions-list flex flex-wrap gap-1 mt-1"></div></div>
        <div class="flex items-center text-sm text-gray-400 mt-1"><span class="font-semibold w-16">Notes:</span><input type="text" class="notes-input bg-gray-600 w-full rounded px-2 py-1 text-white" value="" placeholder="Temporary effects, etc."></div>
        <div class="detailed-stats hidden mt-2 pt-2 border-t border-gray-600 text-xs text-gray-300 space-y-1">
          <p><strong>Saves:</strong> ${monsterData.saves || 'N/A'}</p>
          <p><strong>Skills:</strong> ${monsterData.skills || 'N/A'}</p>
          <p><strong>Senses:</strong> ${monsterData.senses || 'N/A'}</p>
          <p><strong>Languages:</strong> ${monsterData.languages || 'N/A'}</p>
          <p><strong>Damage R/V/I:</strong> ${monsterData.damageInfo || 'N/A'}</p>
          <p><strong>Cond. Immune:</strong> ${monsterData.condImmune || 'N/A'}</p>
        </div>
      </div>
    `;
    
    // Add monster actions if available
    if (monsterData.actions && monsterData.actions.length > 0) {
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'mt-2 pt-2 border-t border-gray-600';
      actionsDiv.innerHTML = `
        <h4 class="font-semibold text-sm text-gray-300 mb-1">Actions</h4>
        <div class="space-y-1"></div>
      `;
      
      const actionsContainer = actionsDiv.querySelector('div');
      
      monsterData.actions.forEach(action => {
        const actionDiv = document.createElement('div');
        actionDiv.className = 'flex justify-between items-center text-xs';
        
        let actionDetail = '';
        if (action.toHit) {
          actionDetail = `+${action.toHit} to hit`;
        } else if (action.dc) {
          actionDetail = `DC ${action.dc}`;
        }
        
        actionDiv.innerHTML = `
          <span class="text-gray-200">${action.name} ${actionDetail ? `(${actionDetail})` : ''}</span>
          <button class="roll-monster-attack-btn bg-red-600 hover:bg-red-700 px-2 py-1 rounded" data-action-name="${action.name}" data-action-tohit="${action.toHit || ''}" data-action-damage="${action.damage || ''}" data-action-dc="${action.dc || ''}">Use</button>
        `;
        
        actionsContainer.appendChild(actionDiv);
      });
      
      card.appendChild(actionsDiv);
    }
    
    // Add hidden data
    const hiddenData = document.createElement('div');
    hiddenData.className = 'hidden-data hidden';
    hiddenData.dataset.str = monsterData.str || 10;
    hiddenData.dataset.dex = monsterData.dex || 10;
    hiddenData.dataset.con = monsterData.con || 10;
    hiddenData.dataset.int = monsterData.int || 10;
    hiddenData.dataset.wis = monsterData.wis || 10;
    hiddenData.dataset.cha = monsterData.cha || 10;
    hiddenData.dataset.saves = monsterData.saves || '';
    hiddenData.dataset.initMod = monsterData.initMod || 0;
    hiddenData.dataset.conditionsData = '[]';
    
    if (monsterData.actions) {
      hiddenData.dataset.actions = JSON.stringify(monsterData.actions);
    }
    
    if (monsterData.srd) {
      hiddenData.dataset.srd = monsterData.srd;
    }
    
    if (monsterData.fullSrdJson) {
      hiddenData.dataset.fullSrdJson = JSON.stringify(monsterData.fullSrdJson);
    }
    
    card.appendChild(hiddenData);
    
    // Add event listeners
    this.addCardEventListeners(card);
    
    return card;
  }
  
  addCardEventListeners(card) {
    // Add event listeners for card functionality
    // This would be implemented in a real application
    
    // For example:
    card.querySelector('.remove-btn').addEventListener('click', () => {
      card.remove();
      this.app.logEvent(`Removed ${card.dataset.type} from combat.`);
    });
    
    // More event listeners would be added here
  }
}
