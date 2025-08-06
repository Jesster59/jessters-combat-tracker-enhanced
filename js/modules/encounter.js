/**
 * Encounter Builder for Jesster's Combat Tracker
 * Handles encounter difficulty calculation
 */
export class EncounterBuilder {
  constructor(app) {
    this.app = app;
    this.crXpTable = {
      '0': 10, '1/8': 25, '1/4': 50, '1/2': 100, '1': 200,
      '2': 450, '3': 700, '4': 1100, '5': 1800, '6': 2300,
      '7': 2900, '8': 3900, '9': 5000, '10': 5900, '11': 7200,
      '12': 8400, '13': 10000, '14': 11500, '15': 13000, '16': 15000,
      '17': 18000, '18': 20000, '19': 22000, '20': 25000, '21': 33000,
      '22': 41000, '23': 50000, '24': 62000, '25': 75000, '26': 90000,
      '27': 105000, '28': 120000, '29': 135000, '30': 155000
    };
    
    this.difficultyThresholds = {
      '1': { easy: 25, medium: 50, hard: 75, deadly: 100 },
      '2': { easy: 50, medium: 100, hard: 150, deadly: 200 },
      '3': { easy: 75, medium: 150, hard: 225, deadly: 400 },
      '4': { easy: 125, medium: 250, hard: 375, deadly: 500 },
      '5': { easy: 250, medium: 500, hard: 750, deadly: 1100 },
      '6': { easy: 300, medium: 600, hard: 900, deadly: 1400 },
      '7': { easy: 350, medium: 750, hard: 1100, deadly: 1700 },
      '8': { easy: 450, medium: 900, hard: 1400, deadly: 2100 },
      '9': { easy: 550, medium: 1100, hard: 1600, deadly: 2400 },
      '10': { easy: 600, medium: 1200, hard: 1900, deadly: 2800 },
      '11': { easy: 800, medium: 1600, hard: 2400, deadly: 3600 },
      '12': { easy: 1000, medium: 2000, hard: 3000, deadly: 4500 },
      '13': { easy: 1100, medium: 2200, hard: 3400, deadly: 5100 },
      '14': { easy: 1250, medium: 2500, hard: 3800, deadly: 5700 },
      '15': { easy: 1400, medium: 2800, hard: 4300, deadly: 6400 },
      '16': { easy: 1600, medium: 3200, hard: 4800, deadly: 7200 },
      '17': { easy: 2000, medium: 3900, hard: 5900, deadly: 8800 },
      '18': { easy: 2100, medium: 4200, hard: 6300, deadly: 9500 },
      '19': { easy: 2400, medium: 4900, hard: 7300, deadly: 10900 },
      '20': { easy: 2800, medium: 5700, hard: 8500, deadly: 12700 }
    };
  }
  
  calculateEncounterDifficulty() {
    // Get all monsters in the encounter
    const monsters = Array.from(document.querySelectorAll('#monsters-list .combatant-card'))
      .map(card => {
        const hiddenData = card.querySelector('.hidden-data');
        const srdData = hiddenData?.dataset.fullSrdJson ? JSON.parse(hiddenData.dataset.fullSrdJson) : null;
        
        return {
          name: card.querySelector('.combatant-name').textContent,
          cr: srdData?.challenge_rating || '0'
        };
      });
    
    // Get all heroes and their levels
    const heroes = Array.from(document.querySelectorAll('#heroes-list .combatant-card'))
      .map(card => {
        // In a real app, we'd store and retrieve the hero's level
        // For now, we'll assume all heroes are level 5 as a placeholder
        return {
          name: card.querySelector('.combatant-name').textContent,
          level: 5
        };
      });
    
    // Calculate total XP from monsters
    let totalXp = monsters.reduce((sum, monster) => {
      return sum + (this.crXpTable[monster.cr] || 0);
    }, 0);
    
    // Apply multiplier based on number of monsters
    const monsterCount = monsters.length;
    let multiplier = 1;
    if (monsterCount === 2) multiplier = 1.5;
    else if (monsterCount >= 3 && monsterCount <= 6) multiplier = 2;
    else if (monsterCount >= 7 && monsterCount <= 10) multiplier = 2.5;
    else if (monsterCount >= 11 && monsterCount <= 14) multiplier = 3;
    else if (monsterCount >= 15) multiplier = 4;
    
    const adjustedXp = totalXp * multiplier;
    
    // Calculate difficulty thresholds for the party
    const partyThresholds = {
      easy: 0,
      medium: 0,
      hard: 0,
      deadly: 0
    };
    
    heroes.forEach(hero => {
      const level = Math.min(Math.max(hero.level, 1), 20);
      const thresholds = this.difficultyThresholds[level];
      partyThresholds.easy += thresholds.easy;
      partyThresholds.medium += thresholds.medium;
      partyThresholds.hard += thresholds.hard;
      partyThresholds.deadly += thresholds.deadly;
    });
    
    // Determine difficulty
    let difficulty = 'trivial';
    if (adjustedXp >= partyThresholds.deadly) difficulty = 'deadly';
    else if (adjustedXp >= partyThresholds.hard) difficulty = 'hard';
    else if (adjustedXp >= partyThresholds.medium) difficulty = 'medium';
    else if (adjustedXp >= partyThresholds.easy) difficulty = 'easy';
    
    return {
      rawXp: totalXp,
      adjustedXp,
      difficulty,
      thresholds: partyThresholds,
      monsters,
      heroes
    };
  }
  
  displayEncounterDifficulty() {
    const result = this.calculateEncounterDifficulty();
    
    // Create or update encounter difficulty display
    let difficultyDisplay = document.getElementById('encounter-difficulty-display');
    if (!difficultyDisplay) {
      difficultyDisplay = document.createElement('div');
      difficultyDisplay.id = 'encounter-difficulty-display';
      difficultyDisplay.className = 'bg-gray-800 p-3 rounded-lg mb-4';
      
      // Insert after the combat timeline
      const timeline = document.getElementById('combat-timeline');
      if (timeline) {
        timeline.insertAdjacentElement('afterend', difficultyDisplay);
      } else {
        // If timeline doesn't exist, insert at the beginning of the app container
        const appContainer = document.getElementById('app-container');
        if (appContainer) {
          appContainer.insertAdjacentElement('afterbegin', difficultyDisplay);
        }
      }
    }
    
    // Set difficulty color
    let difficultyColor = 'text-gray-400';
    if (result.difficulty === 'easy') difficultyColor = 'text-green-400';
    else if (result.difficulty === 'medium') difficultyColor = 'text-yellow-400';
    else if (result.difficulty === 'hard') difficultyColor = 'text-orange-400';
    else if (result.difficulty === 'deadly') difficultyColor = 'text-red-400';
    
    // Update content
    difficultyDisplay.innerHTML = `
      <div class="flex justify-between items-center">
        <h3 class="font-bold">Encounter Difficulty</h3>
        <span class="font-bold uppercase ${difficultyColor}">${result.difficulty}</span>
      </div>
      <div class="flex justify-between text-sm mt-1">
        <span>XP: ${result.rawXp} (Adjusted: ${result.adjustedXp})</span>
        <span>
          Party Thresholds: 
          <span class="text-green-400">${result.thresholds.easy}</span> / 
          <span class="text-yellow-400">${result.thresholds.medium}</span> / 
          <span class="text-orange-400">${result.thresholds.hard}</span> / 
          <span class="text-red-400">${result.thresholds.deadly}</span>
        </span>
      </div>
    `;
  }
}
