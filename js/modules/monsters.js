/**
 * Monster Manager for Jesster's Combat Tracker
 * Handles monster manual and monster management
 */
class MonsterManager {
  constructor(app) {
    this.app = app;
  }
  
  openMonsterManualModal() {
    // For now, just add a simple monster
    const monsterName = prompt("Enter monster name:");
    if (!monsterName) return;
    
    const monsterHP = prompt("Enter monster HP:", "20");
    const monsterAC = prompt("Enter monster AC:", "12");
    
    this.addMonsterToCombat({
      name: monsterName,
      hp: parseInt(monsterHP) || 20,
      ac: parseInt(monsterAC) || 12
    });
  }
  
  addMonsterToCombat(monsterData) {
    // Create a unique ID for the monster
    const monsterId = 'monster-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    
    // Create the monster card
    const monsterCard = document.createElement('div');
    monsterCard.id = monsterId;
    monsterCard.className = 'combatant-card bg-gray-700 p-3 rounded-md shadow-md';
    monsterCard.dataset.type = 'monster';
    
    monsterCard.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <img src="https://placehold.co/60x60/e74c3c/ffffff?text=${monsterData.name.charAt(0).toUpperCase()}" 
               alt="${monsterData.name}" 
               class="w-12 h-12 rounded-full mr-3 border-2 border-red-300 combatant-img">
          <div>
            <p class="font-bold text-lg combatant-name">${monsterData.name}</p>
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
                 value="${monsterData.hp}" data-max-hp="${monsterData.hp}">
          <span>/${monsterData.hp}</span>
        </div>
        <div class="flex items-center space-x-1" title="Armor Class">
          <span>🛡️</span>
          <input type="number" class="ac-input bg-gray-600 rounded px-1 py-0.5 w-full text-center" 
                 value="${monsterData.ac}">
        </div>
        <div class="flex items-center space-x-1" title="Passive Perception">
          <span>👁️</span>
          <input type="number" class="pp-input bg-gray-600 rounded px-1 py-0.5 w-full text-center" 
                 value="${monsterData.pp || 10}">
        </div>
      </div>
    `;
    
    // Add hidden data
    const hiddenData = document.createElement('div');
    hiddenData.className = 'hidden-data hidden';
    hiddenData.dataset.str = monsterData.str || 10;
    hiddenData.dataset.dex = monsterData.dex || 10;
    hiddenData.dataset.con = monsterData.con || 10;
    hiddenData.dataset.int = monsterData.int || 10;
    hiddenData.dataset.wis = monsterData.wis || 10;
    hiddenData.dataset.cha = monsterData.cha || 10;
    hiddenData.dataset.conditionsData = '[]';
    
    monsterCard.appendChild(hiddenData);
    
    // Add event listeners
    const removeBtn = monsterCard.querySelector('.remove-btn');
    removeBtn.addEventListener('click', () => {
      monsterCard.remove();
      this.app.logEvent(`Removed ${monsterData.name} from combat.`);
    });
    
    // Add condition button
    const conditionBtn = document.createElement('button');
    conditionBtn.className = 'condition-btn text-yellow-500 hover:text-yellow-400 font-bold text-sm ml-2';
    conditionBtn.textContent = '+ Condition';
    conditionBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.app.conditions.showAddConditionModal(monsterCard.id);
    });

    // Add it to the card
    const nameElement = monsterCard.querySelector('.combatant-name');
    if (nameElement && nameElement.parentNode) {
      nameElement.parentNode.appendChild(conditionBtn);
    }
    
    // Add to monsters list
    const monstersList = document.getElementById('monsters-list');
    monstersList.appendChild(monsterCard);
    
    this.app.logEvent(`Added monster: ${monsterData.name}`);
  }
}
