/**
 * Roster Manager for Jesster's Combat Tracker
 * Handles hero roster management
 */
class RosterManager {
  constructor(app) {
    this.app = app;
  }
  
  openRosterModal() {
    // For now, just add a simple hero
    const heroName = prompt("Enter hero name:");
    if (!heroName) return;
    
    const heroHP = prompt("Enter hero HP:", "10");
    const heroAC = prompt("Enter hero AC:", "15");
    
    this.addHeroToCombat({
      name: heroName,
      hp: parseInt(heroHP) || 10,
      ac: parseInt(heroAC) || 15
    });
  }
  
  addHeroToCombat(heroData) {
    // Create a unique ID for the hero
    const heroId = 'hero-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    
    // Create the hero card
    const heroCard = document.createElement('div');
    heroCard.id = heroId;
    heroCard.className = 'combatant-card bg-gray-700 p-3 rounded-md shadow-md';
    heroCard.dataset.type = 'hero';
    
    heroCard.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <img src="https://placehold.co/60x60/3498db/ffffff?text=${heroData.name.charAt(0).toUpperCase()}" 
               alt="${heroData.name}" 
               class="w-12 h-12 rounded-full mr-3 border-2 border-blue-300 combatant-img">
          <div>
            <p class="font-bold text-lg combatant-name">${heroData.name}</p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <input type="number" class="initiative-input bg-gray-600 w-16 text-center rounded" placeholder="Init">
          <button class="remove-btn text-red-500 hover:text-red-400 font-bold text-xl">✖</button>
        </div>
      </div>
      <div class="mt-2 grid grid-cols-3 gap-2 text-sm">
        <div class="flex items-center space-x-1" title="Health Points">
          <span>❤️</span>
          <input type="number" class="hp-input bg-gray-600 rounded px-1 py-0.5 w-full text-center" 
                 value="${heroData.hp}" data-max-hp="${heroData.hp}">
          <span>/${heroData.hp}</span>
        </div>
        <div class="flex items-center space-x-1" title="Armor Class">
          <span>🛡️</span>
          <input type="number" class="ac-input bg-gray-600 rounded px-1 py-0.5 w-full text-center" 
                 value="${heroData.ac}">
        </div>
        <div class="flex items-center space-x-1" title="Passive Perception">
          <span>👁️</span>
          <input type="number" class="pp-input bg-gray-600 rounded px-1 py-0.5 w-full text-center" 
                 value="${heroData.pp || 10}">
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
    hiddenData.dataset.conditionsData = '[]';
    
    heroCard.appendChild(hiddenData);
    
    // Add event listeners
    const removeBtn = heroCard.querySelector('.remove-btn');
    removeBtn.addEventListener('click', () => {
      heroCard.remove();
      this.app.logEvent(`Removed ${heroData.name} from combat.`);
    });
    
    // Add to heroes list
    const heroesList = document.getElementById('heroes-list');
    heroesList.appendChild(heroCard);
    
    this.app.logEvent(`Added hero: ${heroData.name}`);
  }
}
