/**
 * Roster Manager for Jesster's Combat Tracker
 * Handles hero roster management
 */
export class RosterManager {
  constructor(app) {
    this.app = app;
  }
  
  openRosterModal() {
    // Create a simple placeholder for now
    this.app.showAlert("Roster functionality will be implemented soon!");
    
    // For testing, let's add a simple hero to the combat
    this.addHeroToCombat({
      name: "Test Hero",
      hp: 20,
      ac: 15,
      pp: 12,
      str: 14,
      dex: 16,
      con: 14,
      int: 12,
      wis: 10,
      cha: 8
    });
  }
  
  addHeroToCombat(heroData) {
    // Create a copy of the hero data for combat
    const combatHero = {
      ...heroData,
      id: `combatant-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type: 'hero',
      currentHp: heroData.hp,
      maxHp: heroData.hp
    };
    
    // Create hero card
    const card = this.createHeroCard(combatHero);
    
    // Add to heroes list
    document.getElementById('heroes-list').appendChild(card);
    
    this.app.logEvent(`Added hero '${heroData.name}' to combat.`);
  }
  
  createHeroCard(heroData) {
    const card = document.createElement('div');
    card.className = 'combatant-card bg-gray-700 p-3 rounded-md shadow-md';
    card.dataset.type = 'hero';
    card.id = heroData.id;
    
    card.innerHTML = `
      <div class="flex items-start justify-between">
        <div class="flex items-center flex-1 min-w-0">
          <div class="w-8 flex-shrink-0"></div>
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
    hiddenData.dataset.conditionsData = '[]';
    
    card.appendChild(hiddenData);
    
    // Add event listeners
    this.addCardEventListeners(card);
    
    return card;
  }
  
  addCardEventListeners(card) {
    // Add event listeners for card functionality
    
    // For example:
    card.querySelector('.remove-btn').addEventListener('click', () => {
      card.remove();
      this.app.logEvent(`Removed ${card.dataset.type} from combat.`);
    });
    
    // More event listeners would be added here
  }
}
