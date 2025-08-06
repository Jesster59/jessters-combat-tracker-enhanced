/**
 * Encounter Builder for Jesster's Combat Tracker
 * Helps create balanced encounters based on party level and monster CR
 */
class EncounterBuilder {
  constructor(app) {
    this.app = app;
    this.partyLevels = [1, 1, 1, 1]; // Default party of 4 level 1 characters
    this.selectedMonsters = [];
    this.monsterDatabase = this.initializeMonsterDatabase();
    this.difficultyThresholds = {
      easy: [25, 50, 75, 125, 250, 300, 350, 450, 550, 600, 800, 1000, 1100, 1250, 1400, 1600, 2000, 2100, 2400, 2800],
      medium: [50, 100, 150, 250, 500, 600, 750, 900, 1100, 1200, 1600, 2000, 2200, 2500, 2800, 3200, 3900, 4200, 4900, 5700],
      hard: [75, 150, 225, 375, 750, 900, 1100, 1400, 1600, 1900, 2400, 3000, 3400, 3800, 4300, 4800, 5900, 6300, 7300, 8500],
      deadly: [100, 200, 400, 500, 1100, 1400, 1700, 2100, 2400, 2800, 3600, 4500, 5100, 5700, 6400, 7200, 8800, 9500, 10900, 12700]
    };
    this.encounterMultipliers = [
      { min: 1, max: 1, multiplier: 1 },
      { min: 2, max: 2, multiplier: 1.5 },
      { min: 3, max: 6, multiplier: 2 },
      { min: 7, max: 10, multiplier: 2.5 },
      { min: 11, max: 14, multiplier: 3 },
      { min: 15, max: Infinity, multiplier: 4 }
    ];
  }
  
  initializeMonsterDatabase() {
    // This is a simplified monster database with just a few monsters
    // In a real application, this would be loaded from an external source
    return [
      { name: "Goblin", cr: 0.25, hp: 7, ac: 15, type: "Humanoid" },
      { name: "Orc", cr: 0.5, hp: 15, ac: 13, type: "Humanoid" },
      { name: "Bugbear", cr: 1, hp: 27, ac: 16, type: "Humanoid" },
      { name: "Ogre", cr: 2, hp: 59, ac: 11, type: "Giant" },
      { name: "Troll", cr: 5, hp: 84, ac: 15, type: "Giant" },
      { name: "Young White Dragon", cr: 6, hp: 133, ac: 17, type: "Dragon" },
      { name: "Young Red Dragon", cr: 10, hp: 178, ac: 18, type: "Dragon" },
      { name: "Adult White Dragon", cr: 13, hp: 200, ac: 18, type: "Dragon" },
      { name: "Adult Red Dragon", cr: 17, hp: 256, ac: 19, type: "Dragon" },
      { name: "Ancient White Dragon", cr: 20, hp: 333, ac: 20, type: "Dragon" },
      { name: "Ancient Red Dragon", cr: 24, hp: 546, ac: 22, type: "Dragon" },
      { name: "Zombie", cr: 0.25, hp: 22, ac: 8, type: "Undead" },
      { name: "Skeleton", cr: 0.25, hp: 13, ac: 13, type: "Undead" },
      { name: "Ghoul", cr: 1, hp: 22, ac: 12, type: "Undead" },
      { name: "Bandit", cr: 0.125, hp: 11, ac: 12, type: "Humanoid" },
      { name: "Bandit Captain", cr: 2, hp: 65, ac: 15, type: "Humanoid" },
      { name: "Cult Fanatic", cr: 2, hp: 33, ac: 13, type: "Humanoid" },
      { name: "Knight", cr: 3, hp: 52, ac: 18, type: "Humanoid" },
      { name: "Mage", cr: 6, hp: 40, ac: 12, type: "Humanoid" },
      { name: "Archmage", cr: 12, hp: 99, ac: 12, type: "Humanoid" }
    ];
  }
  
  openEncounterBuilder() {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-4xl w-full mx-auto">
        <h3 class="text-2xl font-bold text-green-400 mb-4">Encounter Builder</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Party Configuration -->
          <div>
            <h4 class="text-xl font-semibold mb-2">Party Configuration</h4>
            <div id="party-config" class="space-y-2 mb-4">
              ${this.partyLevels.map((level, index) => `
                <div class="flex items-center space-x-2">
                  <span>Character ${index + 1}:</span>
                  <input type="number" class="party-level-input bg-gray-700 rounded px-2 py-1 w-20 text-center" 
                         value="${level}" min="1" max="20" data-index="${index}">
                  <button class="remove-character-btn text-red-500 hover:text-red-400 font-bold text-xl">✖</button>
                </div>
              `).join('')}
            </div>
            <button id="add-character-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm">
              Add Character
            </button>
            
            <div class="mt-6">
              <h4 class="text-xl font-semibold mb-2">Difficulty Thresholds</h4>
              <div id="difficulty-thresholds" class="grid grid-cols-2 gap-2">
                <div class="bg-gray-700 p-2 rounded">
                  <span class="text-green-400">Easy:</span>
                  <span id="easy-threshold">0 XP</span>
                </div>
                <div class="bg-gray-700 p-2 rounded">
                  <span class="text-yellow-400">Medium:</span>
                  <span id="medium-threshold">0 XP</span>
                </div>
                <div class="bg-gray-700 p-2 rounded">
                  <span class="text-orange-400">Hard:</span>
                  <span id="hard-threshold">0 XP</span>
                </div>
                <div class="bg-gray-700 p-2 rounded">
                  <span class="text-red-400">Deadly:</span>
                  <span id="deadly-threshold">0 XP</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Monster Selection -->
          <div>
            <h4 class="text-xl font-semibold mb-2">Monster Selection</h4>
            <div class="mb-4">
              <input type="text" id="monster-search" class="bg-gray-700 w-full rounded px-2 py-1 text-white" 
                     placeholder="Search monsters...">
            </div>
            
            <div class="grid grid-cols-2 gap-2 mb-4">
              <div>
                <label class="block text-gray-300 mb-1">Filter by CR:</label>
                <select id="cr-filter" class="bg-gray-700 w-full rounded px-2 py-1 text-white">
                  <option value="all">All CRs</option>
                  <option value="0-1">CR 0-1</option>
                  <option value="2-5">CR 2-5</option>
                  <option value="6-10">CR 6-10</option>
                  <option value="11-15">CR 11-15</option>
                  <option value="16+">CR 16+</option>
                </select>
              </div>
              <div>
                <label class="block text-gray-300 mb-1">Filter by Type:</label>
                <select id="type-filter" class="bg-gray-700 w-full rounded px-2 py-1 text-white">
                  <option value="all">All Types</option>
                  <option value="Humanoid">Humanoid</option>
                  <option value="Beast">Beast</option>
                  <option value="Dragon">Dragon</option>
                  <option value="Undead">Undead</option>
                  <option value="Giant">Giant</option>
                </select>
              </div>
            </div>
            
            <div class="h-48 overflow-y-auto bg-gray-700 p-2 rounded mb-4">
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-left border-b border-gray-600">
                    <th class="pb-1">Name</th>
                    <th class="pb-1">CR</th>
                    <th class="pb-1">HP</th>
                    <th class="pb-1">AC</th>
                    <th class="pb-1"></th>
                  </tr>
                </thead>
                <tbody id="monster-list">
                  <!-- Monster list will be populated here -->
                </tbody>
              </table>
            </div>
            
            <h4 class="text-xl font-semibold mb-2">Selected Monsters</h4>
            <div id="selected-monsters" class="h-48 overflow-y-auto bg-gray-700 p-2 rounded mb-4">
              <!-- Selected monsters will be displayed here -->
              <p class="text-gray-500 text-center" id="no-monsters-message">No monsters selected.</p>
            </div>
            
            <div class="bg-gray-700 p-2 rounded mb-4">
              <div class="flex justify-between">
                <span>Encounter XP:</span>
                <span id="encounter-xp">0 XP</span>
              </div>
              <div class="flex justify-between">
                <span>Adjusted XP:</span>
                <span id="adjusted-xp">0 XP</span>
              </div>
              <div class="flex justify-between">
                <span>Difficulty:</span>
                <span id="encounter-difficulty">N/A</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end gap-2 mt-4">
          <button id="add-to-combat-btn" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Add to Combat
          </button>
          <button class="close-btn bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            Close
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    this.setupEncounterBuilderEvents(modal);
    
    // Initialize the monster list and calculations
    this.updateMonsterList();
    this.updateDifficultyThresholds();
    this.updateEncounterDifficulty();
  }
  
  setupEncounterBuilderEvents(modal) {
    const self = this;
    
    // Close button
    modal.querySelector('.close-btn').addEventListener('click', () => {
      modal.remove();
    });
    
    // Add character button
    modal.querySelector('#add-character-btn').addEventListener('click', () => {
      this.partyLevels.push(1);
      this.updatePartyConfig(modal);
      this.updateDifficultyThresholds();
      this.updateEncounterDifficulty();
    });
    
    // Party level inputs
    modal.querySelectorAll('.party-level-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const index = parseInt(e.target.dataset.index);
        const level = parseInt(e.target.value) || 1;
        this.partyLevels[index] = Math.max(1, Math.min(20, level));
        this.updateDifficultyThresholds();
        this.updateEncounterDifficulty();
      });
    });
    
    // Remove character buttons
    modal.querySelectorAll('.remove-character-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.previousElementSibling.dataset.index);
        this.partyLevels.splice(index, 1);
        this.updatePartyConfig(modal);
        this.updateDifficultyThresholds();
        this.updateEncounterDifficulty();
      });
    });
    
    // Monster search
    modal.querySelector('#monster-search').addEventListener('input', () => {
      this.updateMonsterList();
    });
    
    // CR filter
    modal.querySelector('#cr-filter').addEventListener('change', () => {
      this.updateMonsterList();
    });
    
    // Type filter
    modal.querySelector('#type-filter').addEventListener('change', () => {
      this.updateMonsterList();
    });
    
    // Add to combat button
    modal.querySelector('#add-to-combat-btn').addEventListener('click', () => {
      this.addSelectedMonstersToCombat();
      modal.remove();
    });
  }
  
  updatePartyConfig(modal) {
    const partyConfig = modal.querySelector('#party-config');
    partyConfig.innerHTML = this.partyLevels.map((level, index) => `
      <div class="flex items-center space-x-2">
        <span>Character ${index + 1}:</span>
        <input type="number" class="party-level-input bg-gray-700 rounded px-2 py-1 w-20 text-center" 
               value="${level}" min="1" max="20" data-index="${index}">
        <button class="remove-character-btn text-red-500 hover:text-red-400 font-bold text-xl">✖</button>
      </div>
    `).join('');
    
    // Re-add event listeners
    partyConfig.querySelectorAll('.party-level-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const index = parseInt(e.target.dataset.index);
        const level = parseInt(e.target.value) || 1;
        this.partyLevels[index] = Math.max(1, Math.min(20, level));
        this.updateDifficultyThresholds();
        this.updateEncounterDifficulty();
      });
    });
    
    partyConfig.querySelectorAll('.remove-character-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.previousElementSibling.dataset.index);
        this.partyLevels.splice(index, 1);
        this.updatePartyConfig(modal);
        this.updateDifficultyThresholds();
        this.updateEncounterDifficulty();
      });
    });
  }
  
  updateMonsterList() {
    const monsterList = document.querySelector('#monster-list');
    if (!monsterList) return;
    
    const searchTerm = document.querySelector('#monster-search').value.toLowerCase();
    const crFilter = document.querySelector('#cr-filter').value;
    const typeFilter = document.querySelector('#type-filter').value;
    
    // Filter monsters based on search term and filters
    const filteredMonsters = this.monsterDatabase.filter(monster => {
      // Search term filter
      if (searchTerm && !monster.name.toLowerCase().includes(searchTerm)) {
        return false;
      }
      
      // CR filter
      if (crFilter !== 'all') {
        if (crFilter === '0-1' && monster.cr > 1) return false;
        if (crFilter === '2-5' && (monster.cr < 2 || monster.cr > 5)) return false;
        if (crFilter === '6-10' && (monster.cr < 6 || monster.cr > 10)) return false;
        if (crFilter === '11-15' && (monster.cr < 11 || monster.cr > 15)) return false;
        if (crFilter === '16+' && monster.cr < 16) return false;
      }
      
      // Type filter
      if (typeFilter !== 'all' && monster.type !== typeFilter) {
        return false;
      }
      
      return true;
    });
    
    // Generate HTML for filtered monsters
    monsterList.innerHTML = filteredMonsters.map(monster => `
      <tr class="border-b border-gray-600 hover:bg-gray-600">
        <td class="py-1">${monster.name}</td>
        <td class="py-1">${monster.cr}</td>
        <td class="py-1">${monster.hp}</td>
        <td class="py-1">${monster.ac}</td>
        <td class="py-1">
          <button class="add-monster-btn bg-green-600 hover:bg-green-700 text-white text-xs py-0.5 px-2 rounded"
                  data-monster-name="${monster.name}">
            Add
          </button>
        </td>
      </tr>
    `).join('');
    
    // Add event listeners to the Add buttons
    monsterList.querySelectorAll('.add-monster-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const monsterName = btn.dataset.monsterName;
        const monster = this.monsterDatabase.find(m => m.name === monsterName);
        if (monster) {
          this.selectedMonsters.push({ ...monster, count: 1 });
          this.updateSelectedMonsters();
          this.updateEncounterDifficulty();
        }
      });
    });
  }
  
  updateSelectedMonsters() {
    const selectedMonstersContainer = document.querySelector('#selected-monsters');
    const noMonstersMessage = document.querySelector('#no-monsters-message');
    
    if (!selectedMonstersContainer) return;
    
    if (this.selectedMonsters.length === 0) {
      if (noMonstersMessage) noMonstersMessage.style.display = 'block';
      selectedMonstersContainer.innerHTML = '<p class="text-gray-500 text-center" id="no-monsters-message">No monsters selected.</p>';
      return;
    }
    
    if (noMonstersMessage) noMonstersMessage.style.display = 'none';
    
    // Group monsters by name and count
    const groupedMonsters = {};
    this.selectedMonsters.forEach(monster => {
      if (!groupedMonsters[monster.name]) {
        groupedMonsters[monster.name] = { ...monster };
      } else {
        groupedMonsters[monster.name].count += monster.count;
      }
    });
    
    // Generate HTML for selected monsters
    selectedMonstersContainer.innerHTML = Object.values(groupedMonsters).map(monster => `
      <div class="flex justify-between items-center mb-2 bg-gray-600 p-2 rounded">
        <div>
          <span class="font-bold">${monster.name}</span>
          <span class="text-xs text-gray-400">(CR ${monster.cr})</span>
        </div>
        <div class="flex items-center space-x-2">
          <button class="decrease-monster-btn text-red-500 hover:text-red-400 font-bold text-lg"
                  data-monster-name="${monster.name}">-</button>
          <span class="monster-count">${monster.count}</span>
          <button class="increase-monster-btn text-green-500 hover:text-green-400 font-bold text-lg"
                  data-monster-name="${monster.name}">+</button>
          <button class="remove-monster-btn text-red-500 hover:text-red-400 font-bold text-xl ml-2"
                  data-monster-name="${monster.name}">✖</button>
        </div>
      </div>
    `).join('');
    
    // Add event listeners
    selectedMonstersContainer.querySelectorAll('.decrease-monster-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const monsterName = btn.dataset.monsterName;
        const monsterIndex = this.selectedMonsters.findIndex(m => m.name === monsterName);
        if (monsterIndex !== -1) {
          if (this.selectedMonsters[monsterIndex].count > 1) {
            this.selectedMonsters[monsterIndex].count--;
          } else {
            this.selectedMonsters.splice(monsterIndex, 1);
          }
          this.updateSelectedMonsters();
          this.updateEncounterDifficulty();
        }
      });
    });
    
    selectedMonstersContainer.querySelectorAll('.increase-monster-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const monsterName = btn.dataset.monsterName;
        const monsterIndex = this.selectedMonsters.findIndex(m => m.name === monsterName);
        if (monsterIndex !== -1) {
          this.selectedMonsters[monsterIndex].count++;
          this.updateSelectedMonsters();
          this.updateEncounterDifficulty();
        }
      });
    });
    
    selectedMonstersContainer.querySelectorAll('.remove-monster-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const monsterName = btn.dataset.monsterName;
        this.selectedMonsters = this.selectedMonsters.filter(m => m.name !== monsterName);
        this.updateSelectedMonsters();
        this.updateEncounterDifficulty();
      });
    });
  }
  
  updateDifficultyThresholds() {
    const easyThreshold = document.querySelector('#easy-threshold');
    const mediumThreshold = document.querySelector('#medium-threshold');
    const hardThreshold = document.querySelector('#hard-threshold');
    const deadlyThreshold = document.querySelector('#deadly-threshold');
    
    if (!easyThreshold || !mediumThreshold || !hardThreshold || !deadlyThreshold) return;
    
    // Calculate thresholds based on party levels
    const thresholds = {
      easy: 0,
      medium: 0,
      hard: 0,
      deadly: 0
    };
    
    this.partyLevels.forEach(level => {
      const index = level - 1; // Array is 0-indexed, levels are 1-indexed
      thresholds.easy += this.difficultyThresholds.easy[index];
      thresholds.medium += this.difficultyThresholds.medium[index];
      thresholds.hard += this.difficultyThresholds.hard[index];
      thresholds.deadly += this.difficultyThresholds.deadly[index];
    });
    
    // Update the UI
    easyThreshold.textContent = `${thresholds.easy.toLocaleString()} XP`;
    mediumThreshold.textContent = `${thresholds.medium.toLocaleString()} XP`;
    hardThreshold.textContent = `${thresholds.hard.toLocaleString()} XP`;
    deadlyThreshold.textContent = `${thresholds.deadly.toLocaleString()} XP`;
  }
  
  updateEncounterDifficulty() {
    const encounterXP = document.querySelector('#encounter-xp');
    const adjustedXP = document.querySelector('#adjusted-xp');
    const encounterDifficulty = document.querySelector('#encounter-difficulty');
    
    if (!encounterXP || !adjustedXP || !encounterDifficulty) return;
    
    // Calculate total XP
    let totalXP = 0;
    let totalMonsters = 0;
    
    this.selectedMonsters.forEach(monster => {
      const xp = this.getCRExperience(monster.cr);
      totalXP += xp * monster.count;
      totalMonsters += monster.count;
    });
    
    // Calculate adjusted XP based on number of monsters
    const multiplier = this.getEncounterMultiplier(totalMonsters);
    const adjustedXPValue = totalXP * multiplier;
    
    // Determine difficulty
    const difficulty = this.getEncounterDifficulty(adjustedXPValue);
    
    // Update the UI
    encounterXP.textContent = `${totalXP.toLocaleString()} XP`;
    adjustedXP.textContent = `${adjustedXPValue.toLocaleString()} XP (×${multiplier})`;
    
    // Set difficulty with appropriate color
    encounterDifficulty.textContent = difficulty;
    encounterDifficulty.className = ''; // Reset classes
    
    switch (difficulty) {
      case 'Easy':
        encounterDifficulty.classList.add('text-green-400');
        break;
      case 'Medium':
        encounterDifficulty.classList.add('text-yellow-400');
        break;
      case 'Hard':
        encounterDifficulty.classList.add('text-orange-400');
        break;
      case 'Deadly':
        encounterDifficulty.classList.add('text-red-400');
        break;
      case 'TPK':
        encounterDifficulty.classList.add('text-red-600', 'font-bold');
        break;
      default:
        encounterDifficulty.classList.add('text-gray-400');
    }
  }
  
  getCRExperience(cr) {
    // XP values by CR
    const crXP = {
      0: 10,
      0.125: 25,
      0.25: 50,
      0.5: 100,
      1: 200,
      2: 450,
      3: 700,
      4: 1100,
      5: 1800,
      6: 2300,
      7: 2900,
      8: 3900,
      9: 5000,
      10: 5900,
      11: 7200,
      12: 8400,
      13: 10000,
      14: 11500,
      15: 13000,
      16: 15000,
      17: 18000,
      18: 20000,
      19: 22000,
      20: 25000,
      21: 33000,
      22: 41000,
      23: 50000,
      24: 62000,
      25: 75000,
      26: 90000,
      27: 105000,
      28: 120000,
      29: 135000,
      30: 155000
    };
    
    return crXP[cr] || 0;
  }
  
  getEncounterMultiplier(monsterCount) {
    for (const range of this.encounterMultipliers) {
      if (monsterCount >= range.min && monsterCount <= range.max) {
        return range.multiplier;
      }
    }
    return 1; // Default multiplier
  }
  
  getEncounterDifficulty(adjustedXP) {
    // Calculate thresholds based on party levels
    const thresholds = {
      easy: 0,
      medium: 0,
      hard: 0,
      deadly: 0
    };
    
    this.partyLevels.forEach(level => {
      const index = level - 1; // Array is 0-indexed, levels are 1-indexed
      thresholds.easy += this.difficultyThresholds.easy[index];
      thresholds.medium += this.difficultyThresholds.medium[index];
      thresholds.hard += this.difficultyThresholds.hard[index];
      thresholds.deadly += this.difficultyThresholds.deadly[index];
    });
    
    // Determine difficulty based on adjusted XP
    if (adjustedXP === 0) return 'N/A';
    if (adjustedXP < thresholds.easy) return 'Trivial';
    if (adjustedXP < thresholds.medium) return 'Easy';
    if (adjustedXP < thresholds.hard) return 'Medium';
    if (adjustedXP < thresholds.deadly) return 'Hard';
    if (adjustedXP < thresholds.deadly * 1.5) return 'Deadly';
    return 'TPK';
  }
  
  addSelectedMonstersToCombat() {
    // Group monsters by name and count
    const groupedMonsters = {};
    this.selectedMonsters.forEach(monster => {
      if (!groupedMonsters[monster.name]) {
        groupedMonsters[monster.name] = { ...monster };
      } else {
        groupedMonsters[monster.name].count += monster.count;
      }
    });
    
    // Add each monster to combat
    Object.values(groupedMonsters).forEach(monster => {
      for (let i = 0; i < monster.count; i++) {
        // Add a suffix if there are multiple monsters of the same type
        const name = monster.count > 1 ? `${monster.name} ${i + 1}` : monster.name;
        
        this.app.monsters.addMonsterToCombat({
          name: name,
          hp: monster.hp,
          ac: monster.ac
        });
      }
    });
    
    // Log the event
    const totalMonsters = this.selectedMonsters.reduce((sum, monster) => sum + monster.count, 0);
    this.app.logEvent(`Added ${totalMonsters} monsters to combat from the Encounter Builder.`);
  }
}
