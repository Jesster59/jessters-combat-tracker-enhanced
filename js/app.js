/**
 * Main Application for Jesster's Combat Tracker
 * Initializes and coordinates all modules
 */
class JessterCombatTracker {
  constructor() {
    // Initialize state
    this.state = {
      combatStarted: false,
      roundNumber: 1,
      currentTurn: null,
      combatLog: [],
      normalInitiativeOrder: [],
      currentNormalInitiativeIndex: 0,
      combatStartTime: null
    };
    
    // Initialize only the modules that actually exist
    this.ui = new UIManager(this);
    this.dice = new DiceRoller(this);
    this.combat = new CombatManager(this);
    this.conditions = new ConditionsManager(this);
    // this.damage = new DamageTracker(this); // Commented out until we verify the class exists
    this.saves = new SavingThrowManager(this);
    this.actions = new ActionEconomyTracker(this);
    this.legendary = new LegendaryActionsTracker(this);
    this.lair = new LairActionsTracker(this);
    this.notes = new CombatNotesManager(this);
    this.stats = new CombatStatisticsManager(this);
    this.spells = new SpellTracker(this);
    this.audio = new AudioManager(this);
    
    // Initialize the app
    this.init();
  }
  
  /**
   * Initialize the application
   */
  init() {
    // Find the app container
    const appContainer = document.getElementById('app');
    if (!appContainer) {
      console.error("Fatal Error: Could not find app container element");
      return;
    }
    
    // Render the initial UI
    this.ui.renderInitialUI(appContainer);
    
    // Cache DOM elements for better performance
    this.ui.cacheDOMElements();
    
    // Set up event listeners
    this.ui.setupEventListeners();
    
    // Initialize modules that need initialization (with error handling)
    try {
      if (this.conditions && typeof this.conditions.addGroupConditionsButton === 'function') {
        this.conditions.addGroupConditionsButton();
      }
      
      if (this.actions && typeof this.actions.addActionReferenceButton === 'function') {
        this.actions.addActionReferenceButton();
      }
      
      if (this.notes && typeof this.notes.init === 'function') {
        this.notes.init();
      }
      
      if (this.stats && typeof this.stats.init === 'function') {
        this.stats.init();
      }
      
      if (this.audio && typeof this.audio.init === 'function') {
        this.audio.init();
      }
      
      if (this.spells && typeof this.spells.addConcentrationCheckButton === 'function') {
        this.spells.addConcentrationCheckButton();
      }
      
      // Add dice history button
      if (this.dice && typeof this.dice.addDiceHistoryButton === 'function') {
        this.dice.addDiceHistoryButton();
      }
    } catch (error) {
      console.error("Error initializing modules:", error);
    }
    
    // Log initialization
    this.logEvent("Combat Tracker initialized.");
    console.log("Jesster's Combat Tracker initialized successfully");
  }
  
  /**
   * Log an event to the combat log
   * @param {string} message - The message to log
   */
  logEvent(message) {
    // Add timestamp
    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    const logEntry = `[${timestamp}] ${message}`;
    
    // Add to log
    this.state.combatLog.push(logEntry);
    
    // Update the UI
    if (this.ui && typeof this.ui.renderCombatLog === 'function') {
      this.ui.renderCombatLog();
    }
  }
  
  /**
   * Show an alert message
   * @param {string} message - The message to show
   * @param {string} [title='Notification'] - The title of the alert
   */
  showAlert(message, title = 'Notification') {
    if (this.ui && typeof this.ui.showAlert === 'function') {
      this.ui.showAlert(message, title);
    } else {
      // Fallback to browser alert
      alert(`${title}: ${message}`);
    }
  }
  
  /**
   * Show a confirmation dialog
   * @param {string} message - The message to show
   * @param {Function} onConfirm - The function to call when confirmed
   */
  showConfirm(message, onConfirm) {
    if (this.ui && typeof this.ui.showConfirm === 'function') {
      this.ui.showConfirm(message, onConfirm);
    } else {
      // Fallback to browser confirm
      if (confirm(message)) {
        onConfirm();
      }
    }
  }
  
  /**
   * Get the current combat duration as a formatted string
   * @returns {string} - The formatted duration
   */
  getCombatDuration() {
    if (!this.state.combatStartTime) return '0m 0s';
    
    const now = new Date();
    const durationMs = now - this.state.combatStartTime;
    
    return this.formatTime(durationMs);
  }
  
  /**
   * Format a time duration in milliseconds
   * @param {number} ms - The duration in milliseconds
   * @returns {string} - The formatted duration
   */
  formatTime(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else {
      return `${minutes}m ${seconds}s`;
    }
  }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.jessterCombatTracker = new JessterCombatTracker();
});
