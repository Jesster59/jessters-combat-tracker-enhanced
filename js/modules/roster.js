/**
 * Roster Manager for Jesster's Combat Tracker
 * Handles hero roster management
 */
export class RosterManager {
  constructor(app) {
    this.app = app;
  }
  
  openRosterModal() {
    // Create and show the roster modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4';
    modal.id = 'roster-modal';
    
    modal.innerHTML = `
      <div class="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6" style="max-height: 90vh; overflow-y: auto;">
        <div>
          <h3 class="text-xl font-bold text-cyan-400 mb-4">Create/Edit Hero</h3>
          <form id="roster-form" class="space-y-3 text-sm">
            <input type="hidden" id="hero-id">
            <div><label>Name: <input type="text" id="hero-name" class="w-full bg-gray-700 rounded p-1"></label></div>
            <div><label>Image URL: <input type="text" id="hero-img" class="w-full bg-gray-700 rounded p-1"></label></div>
            <div class="grid grid-cols-3 gap-2">
              <div><label>Current HP: <input type="number" id="hero-hp" class="w-full bg-gray-700 rounded p-1"></label></div>
              <div><label>Max HP: <input type="number" id="hero-max-hp" class="w-full bg-gray-700 rounded p-1"></label></div>
              <div><label>AC: <input type="number" id="hero-ac" class="w-full bg-gray-700 rounded p-1"></label></div>
            </div>
            <div class="grid grid-cols-6 gap-2">
              <div><label>STR: <input type="number" id="hero-str" class="w-full bg-gray-700 rounded p-1" value="10"></label></div>
              <div><label>DEX: <input type="number" id="hero-dex" class="w-full bg-gray-700 rounded p-1" value="10"></label></div>
              <div><label>CON: <input type="number" id="hero-con" class="w-full bg-gray-700 rounded p-1" value="10"></label></div>
              <div><label>INT: <input type="number" id="hero-int" class="w-full bg-gray-700 rounded p-1" value="10"></label></div>
              <div><label>WIS: <input type="number" id="hero-wis" class="w-full bg-gray-700 rounded p-1" value="10"></label></div>
              <div><label>CHA: <input type="number" id="hero-cha" class="w-full bg-gray-700 rounded p-1" value="10"></label></div>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div><label>PP: <input type="number" id="hero-pp" class="w-full bg-gray-700 rounded p-1"></label></div>
              <div><label>DC: <input type="number" id="hero-dc" class="w-full bg-gray-700 rounded p-1"></label></div>
            </div>
            <div><label>Saves: <input type="text" id="hero-saves" class="w-full bg-gray-700 rounded p-1" placeholder="e.g. STR +5, DEX +2"></label></div>
            <div class="pt-4 flex justify-end space-x-2">
              <button type="button" id="clear-roster-form-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">New</button>
              <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Save Hero</button>
            </div>
          </form>
        </div>
        <div>
          <h3 class="text-xl font-bold text-cyan-400 mb-4">Hero Roster</h3>
          <div id="roster-list" class="overflow-y-auto bg-gray-900 p-2 rounded space-y-2" style="height: 60vh;"></div>
        </div>
        <div>
          <h3 class="text-xl font-bold text-teal-400 mb-4">Party Management</h3>
          <div id="party-list" class="overflow-y-auto bg-gray-900 p-2 rounded space-y-2" style="height: 50vh;"></div>
          <div class="flex flex-col gap-2 mt-4">
            <input type="text" id="party-name-input" class="w-full bg-gray-700 rounded p-2" placeholder="New Party Name...">
            <button id="save-party-btn" class="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded">Save Current Roster as Party</button>
          </div>
          <div class="mt-4 flex justify-end">
            <button id="close-roster-btn" class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Close</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('close-roster-btn').addEventListener('click', () => {
      document.getElementById('roster-modal').remove();
    });
    
    document.getElementById('clear-roster-form-btn').addEventListener('click', () => {
      this.clearRosterForm();
    });
    
    document.getElementById('roster-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveHeroToRoster();
    });
    
    document.getElementById('save-party-btn').addEventListener('click', () => {
      this.saveParty();
    });
    
    // Render roster and party lists
    this.renderRosterList();
    this.renderPartyList();
  }
  
  closeRosterModal() {
    const modal = document.getElementById('roster-modal');
    if (modal) modal.remove();
  }
  
  clearRosterForm() {
    const form = document.getElementById('roster-form');
    if (!form) return;
    
    form.reset();
    document.getElementById('hero-id').value = '';
  }
  
  saveHeroToRoster() {
    const form = document.getElementById('roster-form');
    if (!form) return;
    
    const heroId = document.getElementById('hero-id').value || crypto.randomUUID();
    const heroData = {
      id: heroId,
      name: document.getElementById('hero-name').value || 'Unnamed Hero',
      img: document.getElementById('hero-img').value,
      hp: parseInt(document.getElementById('hero-hp').value) || 1,
      maxHp: parseInt(document.getElementById('hero-max-hp').value) || 1,
      ac: parseInt(document.getElementById('hero-ac').value) || 10,
      str: parseInt(document.getElementById('hero-str').value) || 10,
      dex: parseInt(document.getElementById('hero-dex').value) || 10,
      con: parseInt(document.getElementById('hero-con').value) || 10,
      int: parseInt(document.getElementById('hero-int').value) || 10,
      wis: parseInt(document.getElementById('hero-wis').value) || 10,
      cha: parseInt(document.getElementById('hero-cha').value) || 10,
      pp: parseInt(document.getElementById('hero-pp').value) || 10,
      dc: parseInt(document.getElementById('hero-dc').value) || 10,
      saves: document.getElementById('hero-saves').value,
      type: 'hero'
    };
    
    if (!heroData.name) {
      this.app.showAlert('Hero name is required.');
      return;
    }
    
    // Save to data manager
    this.app.data.saveHero(heroData).then(success => {
      if (success) {
        this.clearRosterForm();
        this.renderRosterList();
      }
    });
  }
  
  renderRosterList() {
    const listElement = document.getElementById('roster-list');
    if (!listElement) return;
    
    listElement.innerHTML = '';
    const roster = this.app.data.heroRoster;
    
    if (roster.length === 0) {
      listElement.innerHTML = `<p class="text-gray-400 text-center p-4">Your Hero Roster is empty. Use the form to create new heroes.</p>`;
      return;
    }
    
    roster.sort((a, b) => a.name.localeCompare(b.name)).forEach(hero => {
      const heroDiv = document.createElement('div');
      heroDiv.className = 'bg-gray-700 p-2 rounded flex justify-between items-center';
      heroDiv.innerHTML = `
        <span>${hero.name}</span>
        <div>
          <button class="edit-roster-hero-btn text-sm bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded" data-id="${hero.id}">Edit</button>
          <button class="delete-roster-hero-btn text-sm bg-red-500 hover:bg-red-600 px-2 py-1 rounded ml-2" data-id="${hero.id}">Del</button>
        </div>
      `;
      listElement.appendChild(heroDiv);
    });
    
    // Add event listeners
    listElement.querySelectorAll('.delete-roster-hero-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.deleteHeroFromRoster(e.target.dataset.id);
      });
    });
    
    listElement.querySelectorAll('.edit-roster-hero-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.editHeroInRoster(e.target.dataset.id);
      });
    });
  }
  
  deleteHeroFromRoster(heroId) {
    const hero = this.app.data.heroRoster.find(h => h.id === heroId);
    if (!hero) return;
    
    this.app.showConfirm(`Are you sure you want to delete ${hero.name} from your roster?`, () => {
      this.app.data.deleteHero(heroId).then(success => {
        if (success) {
          this.renderRosterList();
        }
      });
    });
  }
  
  editHeroInRoster(heroId) {
    const hero = this.app.data.heroRoster.find(h => h.id === heroId);
    if (!hero) return;
    
    // Populate the form
    document.getElementById('hero-id').value = hero.id;
    document.getElementById('hero-name').value = hero.name || '';
    document.getElementById('hero-img').value = hero.img || '';
    document.getElementById('hero-hp').value = hero.hp || '';
    document.getElementById('hero-max-hp').value = hero.maxHp || hero.hp || '';
    document.getElementById('hero-ac').value = hero.ac || '';
    document.getElementById('hero-str').value = hero.str || '';
    document.getElementById('hero-dex').value = hero.dex || '';
    document.getElementById('hero-con').value = hero.con || '';
    document.getElementById('hero-int').value = hero.int || '';
    document.getElementById('hero-wis').value = hero.wis || '';
    document.getElementById('hero-cha').value = hero.cha || '';
    document.getElementById('hero-pp').value = hero.pp || '';
    document.getElementById('hero-dc').value = hero.dc || '';
    document.getElementById('hero-saves').value = hero.saves || '';
  }
  
  saveParty() {
    const partyName = document.getElementById('party-name-input').value.trim();
    if (!partyName) {
      this.app.showAlert("Please enter a name for the party.");
      return;
    }
    
    if (this.app.data.heroRoster.length === 0) {
      this.app.showAlert("Add some heroes to the roster before saving a party.");
      return;
    }
    
    const partyData = {
      name: partyName,
      heroIds: this.app.data.heroRoster.map(hero => hero.id)
    };
    
    this.app.data.saveParty(partyData).then(success => {
      if (success) {
        document.getElementById('party-name-input').value = '';
        this.renderPartyList();
        this.app.showAlert(`Party '${partyName}' saved!`);
      }
    });
  }
  
  renderPartyList() {
    const listElement = document.getElementById('party-list');
    if (!listElement) return;
    
    listElement.innerHTML = '';
    const parties = this.app.data.parties;
    
    if (parties.length === 0) {
      listElement.innerHTML = `<p class="text-gray-400 text-center p-4">No saved parties.</p>`;
      return;
    }
    
    parties.sort((a, b) => a.name.localeCompare(b.name)).forEach(party => {
      const partyDiv = document.createElement('div');
      partyDiv.className = 'bg-gray-700 p-2 rounded flex justify-between items-center';
      partyDiv.innerHTML = `
        <span>${party.name}</span>
        <div>
          <button class="load-party-btn text-sm bg-green-600 hover:bg-green-700 px-2 py-1 rounded" data-id="${party.id}">Load</button>
          <button class="delete-party-btn text-sm bg-red-600 hover:bg-red-700 px-2 py-1 rounded ml-2" data-id="${party.id}">Del</button>
        </div>
      `;
      listElement.appendChild(partyDiv);
    });
    
    // Add event listeners
    listElement.querySelectorAll('.load-party-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.loadParty(e.target.dataset.id);
      });
    });
    
    listElement.querySelectorAll('.delete-party-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.deleteParty(e.target.dataset.id);
      });
    });
  }
  
  loadParty(partyId) {
    const party = this.app.data.parties.find(p => p.id === partyId);
    if (!party) return;
    
    this.app.showConfirm(`Load party '${party.name}'? This will add all heroes from the party to the combat tracker.`, () => {
      // Add each hero from the party to the combat tracker
      party.heroIds.forEach(heroId => {
        const hero = this.app.data.heroRoster.find(h => h.id === heroId);
        if (hero) {
          this.addHeroToCombat(hero);
        }
      });
      
      this.app.logEvent(`Loaded party '${party.name}'.`);
      this.closeRosterModal();
    });
  }
  
  deleteParty(partyId) {
    const party = this.app.data.parties.find(p => p.id === partyId);
    if (!party) return;
    
    this.app.showConfirm(`Are you sure you want to delete party '${party.name}'?`, () => {
      this.app.data.deleteParty(partyId).then(success => {
        if (success) {
          this.renderPartyList();
        }
      });
    });
  }
  
  addHeroToCombat(heroData) {
    // Create a copy of the hero data for combat
    const combatHero = {
      ...heroData,
      currentHp: heroData.hp,
      id: `combatant-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    };
    
    // Create a hero card
    const card = this.createHeroCard(combatHero);
    
    // Add to heroes list
    document.getElementById('heroes-list').appendChild(card);
    
    this.app.logEvent(`Added hero '${heroData.name}' to combat.`);
  }
  
  createHeroCard(heroData) {
    // This would create a hero card for the combat tracker
    // For brevity, I'm providing a simplified version
    
    const card = document.createElement('div');
    card.className = 'combatant-card bg-gray-700 p-3 rounded-md shadow-md';
    card.dataset.type = 'hero';
    card.id = heroData.id;
    
    card.innerHTML = `
      <div class="flex items-start justify-between">
        <div class="flex items-center flex-1 min-w-0">
          <button class="inspiration-btn text-2xl text-gray-500 hover:text-yellow-400 mr-2 flex-shrink-0" title="Inspiration">★</button>
          <img src="${heroData.img || 'https://placehold.co/60x60/3498db/ffffff?text=' + heroData.name.charAt(0).toUpperCase()}" alt="${heroData.name}" class="w-12 h-12 rounded-full mr-3 border-2 border-blue-300 flex-shrink-0 combatant-img">
          <div class="min-w-0 flex-1">
            <p contenteditable="true" class="font-bold text-lg truncate combatant-name focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-1">${heroData.name}</p>
          </div>
        </div>
        <div class="flex items-center space-x-2 flex-shrink-0 ml-4">
          <input type="number" class="initiative-input font-bold text-xl text-gray-200 bg-gray-600 w-16 text-center rounded" value="${heroData.initiative || ''}" placeholder="Init">
          <div class="flex flex-col items-center text-xs"><span>Conc.</span><input type="checkbox" class="concentration-check"></div>
          <button class="remove-btn text-red-500 hover:text-red-400 font-bold text-xl">✖</button>
        </div>
      </div>
      <div class="mt-2 space-y-2">
        <div class="flex items-center space-x-0.5 text-sm text-gray-400">
          <button class="hp-adjust-btn bg-green-700 hover:bg-green-600 text-white px-1 py-0.5 rounded-sm text-xs" data-hp-change="1" title="Heal 1 HP">+</button>
          <button class="hp-adjust-btn bg-green-700 hover:bg-green-600 text-white px-1 py-0.5 rounded-sm text-xs" data-hp-change="5" title="Heal 5 HP">++</button>
          <div class="flex items-center space-x-1 flex-1" title="Health Points"><span class="text-lg">❤️</span><input type="text" class="hp-input bg-gray-700 rounded px-1 py-0.5 w-full text-center" value="${heroData.currentHp}" data-previous-hp="${heroData.currentHp}" data-max-hp="${heroData.maxHp}"><span class="hp-display">/${heroData.maxHp}</span></div>
          <button class="hp-adjust-btn bg-red-700 hover:bg-red-600 text-white px-1 py-0.5 rounded-sm text-xs" data-hp-change="-1" title="Take 1 Damage">-</button>
          <button class="hp-adjust-btn bg-red-700 hover:bg-red-600 text-white px-1 py-0.5 rounded-sm text-xs" data-hp-change="-5" title="Take 5 Damage">--</button>
          <div class="flex items-center space-x-1 flex-1 ml-2" title="Temporary HP"><span class="text-lg">➕</span><input type="number" class="temp-hp-input bg-gray-700 rounded px-1 py-0.5 w-full text-center" value="" placeholder="0"></div>
          <div class="flex items-center space-x-1 flex-1" title="Armor Class"><span class="text-lg">🛡️</span><input type="number" class="ac-input bg-gray-600 rounded px-1 py-0.5 w-full text-center" value="${heroData.ac || 10}"></div>
          <div class="flex items-center space-x-1 flex-1" title="Passive Perception"><span class="text-lg">🔍</span><input type="number" class="pp-input bg-gray-600 rounded px-1 py-0.5 w-full text-center" value="${heroData.pp || 10}"></div>
        </div>
        <div class="flex items-center text-sm text-gray-400"><span class="font-semibold w-20 flex-shrink-0">Movement:</span><input type="text" class="movement-input bg-gray-600 w-full rounded px-2 py-1 text-white" value="30ft" placeholder="e.g., 30ft, fly 60ft"></div>
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
        <div class="death-saves-tracker hidden mt-2 pt-2 border-t border-gray-600"><p class="text-center font-semibold text-red-400 mb-1">Death Saving Throws</p><div class="flex justify-around"><div class="successes"><span class="text-sm">Successes:</span><input type="checkbox"> <input type="checkbox"> <input type="checkbox"></div><div class="failures"><span class="text-sm">Failures:</span><input type="checkbox"> <input type="checkbox"> <input type="checkbox"></div></div></div>
        <div class="detailed-stats hidden mt-2 pt-2 border-t border-gray-600 text-xs text-gray-300 space-y-1">
          <p><strong>Saves:</strong> ${heroData.saves || 'N/A'}</p>
          <p><strong>STR:</strong> ${heroData.str || 10} <strong>DEX:</strong> ${heroData.dex || 10} <strong>CON:</strong> ${heroData.con || 10}</p>
          <p><strong>INT:</strong> ${heroData.int || 10} <strong>WIS:</strong> ${heroData.wis || 10} <strong>CHA:</strong> ${heroData.cha || 10}</p>
        </div>
      </div>
    `;
    
    // Add hidden data
    const hiddenData = document.createElement('div');
    hiddenData.className = 'hidden-data hidden';
    hiddenData.dataset.str = heroData.str || 10;
    hiddenData.dataset.dex = heroData.dex || 10;
    hiddenData.dataset.con = heroData.con || 10;
    hiddenData.dataset.int = heroData.int || 10;
    hiddenData.dataset.wis = heroData.wis || 10;
    hiddenData.dataset.cha = heroData.cha || 10;
    hiddenData.dataset.saves = heroData.saves || '';
    hiddenData.dataset.conditionsData = '[]';
    
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
