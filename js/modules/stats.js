/**
 * Combat Statistics Manager for Jesster's Combat Tracker
 * Tracks and displays combat statistics
 */
class CombatStatisticsManager {
  constructor(app) {
    this.app = app;
    this.stats = {
      damageDealt: 0,
      damageReceived: 0,
      healingDone: 0,
      criticalHits: 0,
      missedAttacks: 0,
      roundsCompleted: 0,
      combatDuration: 0,
      savingThrows: {
        success: 0,
        failure: 0
      },
      abilityChecks: {
        success: 0,
        failure: 0
      },
      combatantStats: {}
    };
    this.updateInterval = null;
    console.log("Stats.js loaded successfully");
  }
  
  /**
   * Initialize the statistics manager
   */
  init() {
    // Create the statistics panel if it doesn't exist
    this.createStatsPanel();
    
    // Create toggle button for the statistics panel
    this.createStatsPanelToggle();
  }
  
  /**
   * Create the statistics panel
   */
  createStatsPanel() {
    // Check if panel already exists
    if (document.getElementById('stats-panel')) return;
    
    // Create the panel container
    const panel = document.createElement('div');
    panel.id = 'stats-panel';
    panel.className = 'fixed right-0 bottom-0 bg-gray-800 w-80 shadow-lg transform translate-y-full transition-transform duration-300 ease-in-out z-40 flex flex-col rounded-t-lg';
    
    // Create the panel content
    panel.innerHTML = `
      <div class="p-4 border-b border-gray-700 flex justify-between items-center cursor-pointer" id="stats-panel-header">
        <h3 class="text-xl font-bold text-green-400">Combat Statistics</h3>
        <button id="close-stats-panel" class="text-gray-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      <div class="p-4 overflow-y-auto max-h-96">
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-gray-700 p-3 rounded">
            <h4 class="text-sm font-semibold text-gray-300 mb-1">Damage Dealt</h4>
            <p id="stat-damage-dealt" class="text-xl font-bold text-red-400">0</p>
          </div>
          <div class="bg-gray-700 p-3 rounded">
            <h4 class="text-sm font-semibold text-gray-300 mb-1">Damage Received</h4>
            <p id="stat-damage-received" class="text-xl font-bold text-red-400">0</p>
          </div>
          <div class="bg-gray-700 p-3 rounded">
            <h4 class="text-sm font-semibold text-gray-300 mb-1">Healing Done</h4>
            <p id="stat-healing-done" class="text-xl font-bold text-green-400">0</p>
          </div>
          <div class="bg-gray-700 p-3 rounded">
            <h4 class="text-sm font-semibold text-gray-300 mb-1">Critical Hits</h4>
            <p id="stat-critical-hits" class="text-xl font-bold text-yellow-400">0</p>
          </div>
          <div class="bg-gray-700 p-3 rounded">
            <h4 class="text-sm font-semibold text-gray-300 mb-1">Rounds Completed</h4>
            <p id="stat-rounds-completed" class="text-xl font-bold text-blue-400">0</p>
          </div>
          <div class="bg-gray-700 p-3 rounded">
            <h4 class="text-sm font-semibold text-gray-300 mb-1">Combat Duration</h4>
            <p id="stat-combat-duration" class="text-xl font-bold text-purple-400">0m 0s</p>
          </div>
        </div>
        
        <div class="mt-4">
          <h4 class="text-lg font-semibold text-gray-300 mb-2">Saving Throws</h4>
          <div class="flex items-center">
            <div class="w-full bg-gray-700 rounded-full h-4">
              <div id="save-success-bar" class="bg-green-500 h-4 rounded-full" style="width: 0%"></div>
            </div>
            <div class="ml-2 text-sm">
              <span id="save-success-count" class="text-green-400">0</span>/<span id="save-total-count">0</span>
            </div>
          </div>
        </div>
        
        <div class="mt-4">
          <h4 class="text-lg font-semibold text-gray-300 mb-2">Ability Checks</h4>
          <div class="flex items-center">
            <div class="w-full bg-gray-700 rounded-full h-4">
              <div id="check-success-bar" class="bg-blue-500 h-4 rounded-full" style="width: 0%"></div>
            </div>
            <div class="ml-2 text-sm">
              <span id="check-success-count" class="text-blue-400">0</span>/<span id="check-total-count">0</span>
            </div>
          </div>
        </div>
        
        <div class="mt-4" id="combatant-stats-container">
          <h4 class="text-lg font-semibold text-gray-300 mb-2">Combatant Statistics</h4>
          <div id="combatant-stats-list" class="space-y-2">
            <!-- Combatant stats will be inserted here -->
          </div>
        </div>
      </div>
    `;
    
    // Add the panel to the document
    document.body.appendChild(panel);
    
    // Add event listeners
    document.getElementById('stats-panel-header').addEventListener('click', () => {
      this.toggleStatsPanel();
    });
    
    document.getElementById('close-stats-panel').addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleStatsPanel(false);
    });
  }
  
  /**
   * Create the toggle button for the statistics panel
   */
  createStatsPanelToggle() {
    // Check if toggle already exists
    if (document.getElementById('stats-panel-toggle')) return;
    
    // Create the toggle button
    const toggle = document.createElement('button');
    toggle.id = 'stats-panel-toggle';
    toggle.className = 'fixed right-4 bottom-0 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-t-lg shadow-lg z-30';
    toggle.innerHTML = `
      <div class="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span>Statistics</span>
      </div>
    `;
    
    // Add event listener
    toggle.addEventListener('click', () => {
      this.toggleStatsPanel();
    });
    
    // Add the toggle to the document
    document.body.appendChild(toggle);
  }
  
  /**
   * Toggle the statistics panel
   * @param {boolean} [show] - Force show or hide
   */
  toggleStatsPanel(show) {
    const panel = document.getElementById('stats-panel');
    if (!panel) return;
    
    const isVisible = !panel.classList.contains('translate-y-full');
    
    if (show === undefined) {
      // Toggle
      if (isVisible) {
        panel.classList.add('translate-y-full');
        this.stopAutoUpdate();
      } else {
        panel.classList.remove('translate-y-full');
        this.updateStats();
        this.startAutoUpdate();
      }
    } else if (show) {
      // Force show
      panel.classList.remove('translate-y-full');
      this.updateStats();
      this.startAutoUpdate();
    } else {
      // Force hide
      panel.classList.add('translate-y-full');
      this.stopAutoUpdate();
    }
  }
  
  /**
   * Start auto-updating the statistics
   */
  startAutoUpdate() {
    if (this.updateInterval) return;
    
    this.updateInterval = setInterval(() => {
      this.updateStats();
    }, 1000);
  }
  
  /**
   * Stop auto-updating the statistics
   */
  stopAutoUpdate() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
  
  /**
   * Update the statistics display
   */
  updateStats() {
    // Update basic stats
    document.getElementById('stat-damage-dealt').textContent = this.stats.damageDealt;
    document.getElementById('stat-damage-received').textContent = this.stats.damageReceived;
    document.getElementById('stat-healing-done').textContent = this.stats.healingDone;
    document.getElementById('stat-critical-hits').textContent = this.stats.criticalHits;
    document.getElementById('stat-rounds-completed').textContent = this.app.state.roundNumber - 1;
    
    // Update combat duration
    if (this.app.state.combatStarted) {
      document.getElementById('stat-combat-duration').textContent = this.app.getCombatDuration();
    }
    
    // Update saving throws
    const saveTotal = this.stats.savingThrows.success + this.stats.savingThrows.failure;
    const saveSuccessPercentage = saveTotal > 0 ? (this.stats.savingThrows.success / saveTotal) * 100 : 0;
    
    document.getElementById('save-success-bar').style.width = `${saveSuccessPercentage}%`;
    document.getElementById('save-success-count').textContent = this.stats.savingThrows.success;
    document.getElementById('save-total-count').textContent = saveTotal;
    
    // Update ability checks
    const checkTotal = this.stats.abilityChecks.success + this.stats.abilityChecks.failure;
    const checkSuccessPercentage = checkTotal > 0 ? (this.stats.abilityChecks.success / checkTotal) * 100 : 0;
    
    document.getElementById('check-success-bar').style.width = `${checkSuccessPercentage}%`;
    document.getElementById('check-success-count').textContent = this.stats.abilityChecks.success;
    document.getElementById('check-total-count').textContent = checkTotal;
    
    // Update combatant stats
    this.updateCombatantStats();
  }
  
  /**
   * Update the combatant statistics
   */
  updateCombatantStats() {
    const container = document.getElementById('combatant-stats-list');
    if (!container) return;
    
    // Clear the container
    container.innerHTML = '';
    
    // Get all combatants
    const allCombatants = [
      ...Array.from(document.querySelectorAll('#heroes-list .combatant-card')),
      ...Array.from(document.querySelectorAll('#monsters-list .combatant-card'))
    ];
    
    if (allCombatants.length === 0) {
      container.innerHTML = '<p class="text-gray-500">No combatants added yet.</p>';
      return;
    }
    
    // Create stat sections for each combatant
    allCombatants.forEach(card => {
      const id = card.id;
      const name = card.querySelector('.combatant-name').textContent;
      const type = card.dataset.type;
      
      // Initialize combatant stats if they don't exist
      if (!this.stats.combatantStats[id]) {
        this.stats.combatantStats[id] = {
          damageDealt: 0,
          damageReceived: 0,
          healingDone: 0,
          healingReceived: 0,
          criticalHits: 0,
          missedAttacks: 0
        };
      }
      
      const combatantStats = this.stats.combatantStats[id];
      
      const statSection = document.createElement('div');
      statSection.className = 'bg-gray-700 p-3 rounded';
      statSection.innerHTML = `
        <div class="flex justify-between items-center mb-2">
          <h5 class="font-medium ${type === 'hero' ? 'text-blue-300' : 'text-red-300'}">${name}</h5>
          <span class="text-xs text-gray-400">${type === 'hero' ? 'Hero' : 'Monster'}</span>
        </div>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span class="text-gray-400">Damage Dealt:</span>
            <span class="text-red-400 ml-1">${combatantStats.damageDealt}</span>
          </div>
          <div>
            <span class="text-gray-400">Damage Received:</span>
            <span class="text-red-400 ml-1">${combatantStats.damageReceived}</span>
          </div>
          <div>
            <span class="text-gray-400">Healing Done:</span>
            <span class="text-green-400 ml-1">${combatantStats.healingDone}</span>
          </div>
          <div>
            <span class="text-gray-400">Healing Received:</span>
            <span class="text-green-400 ml-1">${combatantStats.healingReceived}</span>
          </div>
        </div>
      `;
      
      container.appendChild(statSection);
    });
  }
  
  /**
   * Record damage dealt
   * @param {number} amount - The amount of damage dealt
   * @param {string} [dealerId] - The ID of the combatant who dealt the damage
   */
  recordDamageDealt(amount, dealerId) {
    this.stats.damageDealt += amount;
    
    if (dealerId && this.stats.combatantStats[dealerId]) {
      this.stats.combatantStats[dealerId].damageDealt += amount;
    }
  }
  
  /**
   * Record damage received
   * @param {number} amount - The amount of damage received
   * @param {string} [receiverId] - The ID of the combatant who received the damage
   */
  recordDamageReceived(amount, receiverId) {
    this.stats.damageReceived += amount;
    
    if (receiverId && this.stats.combatantStats[receiverId]) {
      this.stats.combatantStats[receiverId].damageReceived += amount;
    }
  }
  
  /**
   * Record healing done
   * @param {number} amount - The amount of healing done
   * @param {string} [healerId] - The ID of the combatant who did the healing
   * @param {string} [receiverId] - The ID of the combatant who received the healing
   */
  recordHealingDone(amount, healerId, receiverId) {
    this.stats.healingDone += amount;
    
    if (healerId && this.stats.combatantStats[healerId]) {
      this.stats.combatantStats[healerId].healingDone += amount;
    }
    
    if (receiverId && this.stats.combatantStats[receiverId]) {
      this.stats.combatantStats[receiverId].healingReceived += amount;
    }
  }
  
  /**
   * Record a critical hit
   * @param {string} [attackerId] - The ID of the combatant who scored the critical hit
   */
  recordCriticalHit(attackerId) {
    this.stats.criticalHits++;
    
    if (attackerId && this.stats.combatantStats[attackerId]) {
      this.stats.combatantStats[attackerId].criticalHits++;
    }
  }
  
  /**
   * Record a missed attack
   * @param {string} [attackerId] - The ID of the combatant who missed the attack
   */
  recordMissedAttack(attackerId) {
    this.stats.missedAttacks++;
    
    if (attackerId && this.stats.combatantStats[attackerId]) {
      this.stats.combatantStats[attackerId].missedAttacks++;
    }
  }
  
  /**
   * Record a saving throw result
   * @param {boolean} success - Whether the saving throw was successful
   */
  recordSavingThrow(success) {
    if (success) {
      this.stats.savingThrows.success++;
    } else {
      this.stats.savingThrows.failure++;
    }
  }
  
  /**
   * Record an ability check result
   * @param {boolean} success - Whether the ability check was successful
   */
  recordAbilityCheck(success) {
    if (success) {
      this.stats.abilityChecks.success++;
    } else {
      this.stats.abilityChecks.failure++;
    }
  }
  
  /**
   * Reset all statistics
   */
  resetStats() {
    this.stats = {
      damageDealt: 0,
      damageReceived: 0,
      healingDone: 0,
      criticalHits: 0,
      missedAttacks: 0,
      roundsCompleted: 0,
      combatDuration: 0,
      savingThrows: {
        success: 0,
        failure: 0
      },
      abilityChecks: {
        success: 0,
        failure: 0
      },
      combatantStats: {}
    };
    
    this.updateStats();
  }
  
  /**
   * Start tracking combat statistics
   */
  startCombatTracking() {
    // Reset stats when combat starts
    this.resetStats();
    
    // Record the start time
    this.app.state.combatStartTime = new Date();
  }
  
  /**
   * End combat statistics tracking
   */
  endCombatTracking() {
    // Calculate final combat duration
    if (this.app.state.combatStartTime) {
      const endTime = new Date();
      this.stats.combatDuration = endTime - this.app.state.combatStartTime;
      this.app.state.combatStartTime = null;
    }
    
    // Show the final statistics
    this.updateStats();
    this.toggleStatsPanel(true);
    
    // Log the combat summary
    this.logCombatSummary();
  }
  
  /**
   * Log a summary of the combat statistics
   */
  logCombatSummary() {
    const duration = this.app.formatTime(this.stats.combatDuration);
    const rounds = this.app.state.roundNumber - 1;
    
    this.app.logEvent('Combat Summary:');
    this.app.logEvent(`Duration: ${duration}, Rounds: ${rounds}`);
    this.app.logEvent(`Damage: ${this.stats.damageDealt} dealt, ${this.stats.damageReceived} received`);
    this.app.logEvent(`Healing: ${this.stats.healingDone}`);
    this.app.logEvent(`Critical Hits: ${this.stats.criticalHits}`);
    
    const saveTotal = this.stats.savingThrows.success + this.stats.savingThrows.failure;
    if (saveTotal > 0) {
      const saveSuccessRate = Math.round((this.stats.savingThrows.success / saveTotal) * 100);
      this.app.logEvent(`Saving Throws: ${this.stats.savingThrows.success}/${saveTotal} (${saveSuccessRate}% success)`);
    }
    
    const checkTotal = this.stats.abilityChecks.success + this.stats.abilityChecks.failure;
    if (checkTotal > 0) {
      const checkSuccessRate = Math.round((this.stats.abilityChecks.success / checkTotal) * 100);
      this.app.logEvent(`Ability Checks: ${this.stats.abilityChecks.success}/${checkTotal} (${checkSuccessRate}% success)`);
    }
  }
}
