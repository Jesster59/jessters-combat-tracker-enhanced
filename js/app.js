// Import dependencies
import { TemplateManager } from './templates.js';
import { ThemeManager } from './theme.js';
import { createTacticalCombatManager } from './tactical.js';

// Define application states
const AppState = {
  INITIALIZING: 'initializing',
  READY: 'ready',
  LOADING: 'loading',
  SAVING: 'saving',
  ERROR: 'error'
};

/**
 * Main application class for the Combat Tracker
 */
class CombatTrackerApp {
  /**
   * Create a new Combat Tracker application
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    console.log('App constructor started');
    
    // Default options
    this.options = {
      containerId: 'jct-app',
      storageKey: 'jct-data',
      autoSave: true,
      autoSaveInterval: 60000, // 1 minute
      ...options
    };
    
    // Initialize properties
    this.container = null;
    this.ui = {};
    this.combat = null;
    this.initialized = false;
    this.state = AppState.INITIALIZING;
    this.templateManager = new TemplateManager();
    this.themeManager = new ThemeManager();
    
    // Initialize the application
    this._initialize();
    
    console.log('App constructor completed');
  }
  
  /**
   * Initialize the application
   * @private
   */
  _initialize() {
    console.log('Initialization started');
    
    // Set a timeout to detect if initialization hangs
    const initTimeout = setTimeout(() => {
      console.error('Initialization timeout after 15 seconds. Current state:', this.state);
      console.trace('Initialization stack trace');
      alert('The application is taking longer than expected to load. Check the console for details or try refreshing the page.');
    }, 15000); // 15 seconds
    
    try {
      // Step 1: Find container element
      console.time('Find container');
      this.container = document.getElementById(this.options.containerId);
      console.timeEnd('Find container');
      console.log('Container found:', !!this.container);
      
      if (!this.container) {
        console.error(`Container element with ID "${this.options.containerId}" not found`);
        this.state = AppState.ERROR;
        clearTimeout(initTimeout);
        return;
      }
      
      // Step 2: Load saved data
      console.time('Load saved data');
      console.log('Loading saved data...');
      this._loadData();
      console.log('Saved data loaded');
      console.timeEnd('Load saved data');
      
      // Step 3: Create UI
      console.time('Create UI');
      console.log('Creating UI...');
      this._createUI();
      console.log('UI created');
      console.timeEnd('Create UI');
      
      // Step 4: Set up event listeners
      console.time('Setup event listeners');
      console.log('Setting up event listeners...');
      this._setupEventListeners();
      console.log('Event listeners set up');
      console.timeEnd('Setup event listeners');
      
      // Step 5: Set up auto-save
      if (this.options.autoSave) {
        console.time('Setup auto-save');
        console.log('Setting up auto-save...');
        this._setupAutoSave();
        console.log('Auto-save set up');
        console.timeEnd('Setup auto-save');
      }
      
      // Step 6: Initialize the tactical map
      console.time('Initialize tactical map');
      console.log('Initializing tactical map...');
      this._initializeTacticalMap();
      console.log('Tactical map initialized');
      console.timeEnd('Initialize tactical map');
      
      // Mark as initialized
      this.initialized = true;
      this.state = AppState.READY;
      console.log('App marked as initialized');
      
      // Dispatch initialized event
      this._dispatchEvent('initialized', { app: this });
      console.log('Initialization completed');
      
      // Clear the timeout since initialization completed successfully
      clearTimeout(initTimeout);
      
    } catch (error) {
      console.error('Initialization failed:', error);
      this.state = AppState.ERROR;
      alert('Failed to initialize application: ' + error.message);
      clearTimeout(initTimeout);
    }
  }
  
  /**
   * Load saved data from localStorage
   * @private
   */
  _loadData() {
    try {
      console.log('Starting to load data from localStorage');
      const savedData = localStorage.getItem(this.options.storageKey);
      
      if (savedData) {
        console.log('Found saved data in localStorage');
        const parsedData = JSON.parse(savedData);
        
        console.log('Parsing combat data');
        if (parsedData.combat) {
          this.combat = parsedData.combat;
          console.log('Combat data loaded successfully');
        } else {
          console.log('No combat data found, creating new combat');
          this.combat = this._createNewCombat();
        }
        
        console.log('Parsing template data');
        if (parsedData.templates) {
          this.templateManager.importAllFromJson(JSON.stringify(parsedData.templates));
          console.log('Template data loaded successfully');
        }
      } else {
        console.log('No saved data found, creating new combat');
        this.combat = this._createNewCombat();
      }
    } catch (error) {
      console.error('Error loading data:', error);
      this.combat = this._createNewCombat();
    }
  }
  
  /**
   * Create the user interface
   * @private
   */
  _createUI() {
    console.log('Creating main UI components');
    
    // Create loading modal
    console.log('Creating loading modal');
    this.ui.loadingModal = document.createElement('div');
    this.ui.loadingModal.className = 'jct-loading-modal';
    this.ui.loadingModal.innerHTML = `
      <div class="jct-loading-content">
        <div class="jct-spinner"></div>
        <div class="jct-loading-text">Loading...</div>
      </div>
    `;
    this.container.appendChild(this.ui.loadingModal);
    
    // Create main UI containers
    console.log('Creating main UI containers');
    this.ui.header = document.createElement('header');
    this.ui.header.className = 'jct-header';
    
    this.ui.main = document.createElement('main');
    this.ui.main.className = 'jct-main';
    
    this.ui.sidebar = document.createElement('aside');
    this.ui.sidebar.className = 'jct-sidebar';
    
    this.ui.footer = document.createElement('footer');
    this.ui.footer.className = 'jct-footer';
    
    // Add containers to the DOM
    this.container.appendChild(this.ui.header);
    this.container.appendChild(this.ui.main);
    this.container.appendChild(this.ui.sidebar);
    this.container.appendChild(this.ui.footer);
    
    // Create header content
    console.log('Creating header content');
    this.ui.header.innerHTML = `
      <h1>Combat Tracker</h1>
      <div class="jct-controls">
        <button id="jct-new-combat" class="jct-button">New Combat</button>
        <button id="jct-save" class="jct-button">Save</button>
        <button id="jct-load" class="jct-button">Load</button>
        <button id="jct-settings" class="jct-button">Settings</button>
      </div>
    `;
    
    // Create main content
    console.log('Creating main content');
    this.ui.combatantList = document.createElement('div');
    this.ui.combatantList.className = 'jct-combatant-list';
    this.ui.main.appendChild(this.ui.combatantList);
    
    // Create sidebar content
    console.log('Creating sidebar content');
    this.ui.sidebar.innerHTML = `
      <div class="jct-sidebar-section">
        <h2>Add Combatant</h2>
        <form id="jct-add-combatant-form">
          <div class="jct-form-group">
            <label for="jct-combatant-name">Name</label>
            <input type="text" id="jct-combatant-name" required>
          </div>
          <div class="jct-form-group">
            <label for="jct-combatant-initiative">Initiative</label>
            <input type="number" id="jct-combatant-initiative" required>
          </div>
          <div class="jct-form-group">
            <label for="jct-combatant-hp">HP</label>
            <input type="number" id="jct-combatant-hp" required>
          </div>
          <div class="jct-form-group">
            <label for="jct-combatant-ac">AC</label>
            <input type="number" id="jct-combatant-ac" required>
          </div>
          <button type="submit" class="jct-button">Add</button>
        </form>
      </div>
      <div class="jct-sidebar-section">
        <h2>Templates</h2>
        <div id="jct-template-list"></div>
        <button id="jct-add-template" class="jct-button">Add Template</button>
      </div>
    `;
    
    // Create footer content
    console.log('Creating footer content');
    this.ui.footer.innerHTML = `
      <div class="jct-round-tracker">Round: <span id="jct-round">1</span></div>
      <div class="jct-controls">
        <button id="jct-next" class="jct-button">Next Turn</button>
        <button id="jct-prev" class="jct-button">Previous Turn</button>
      </div>
      <div class="jct-credits">Combat Tracker v2.3.1</div>
    `;
    
    // Create tactical map container
    console.log('Creating tactical map container');
    this.ui.tacticalMapContainer = document.createElement('div');
    this.ui.tacticalMapContainer.className = 'jct-tactical-map-container';
    this.ui.tacticalMapContainer.style.display = 'none';
    this.container.appendChild(this.ui.tacticalMapContainer);
    
    // Create tactical map toggle button
    console.log('Creating tactical map toggle button');
    this.ui.tacticalMapToggle = document.createElement('button');
    this.ui.tacticalMapToggle.id = 'jct-tactical-map-toggle';
    this.ui.tacticalMapToggle.className = 'jct-button jct-floating-button';
    this.ui.tacticalMapToggle.textContent = 'Tactical Map';
    this.container.appendChild(this.ui.tacticalMapToggle);
    
    // Update the UI with current combat data
    console.log('Updating UI with combat data');
    this._updateUI();
    
    // Hide loading modal
    console.log('Hiding loading modal');
    this.ui.loadingModal.style.display = 'none';
  }
  
  /**
   * Set up event listeners
   * @private
   */
  _setupEventListeners() {
    console.log('Setting up button event listeners');
    
    // New combat button
    document.getElementById('jct-new-combat').addEventListener('click', () => {
      console.log('New combat button clicked');
      if (confirm('Start a new combat? This will clear the current combat.')) {
        this.combat = this._createNewCombat();
        this._updateUI();
        this.saveData();
      }
    });
    
    // Save button
    document.getElementById('jct-save').addEventListener('click', () => {
      console.log('Save button clicked');
      this.saveData();
    });
    
    // Load button
    document.getElementById('jct-load').addEventListener('click', () => {
      console.log('Load button clicked');
      this._loadData();
      this._updateUI();
    });
    
    // Settings button
    document.getElementById('jct-settings').addEventListener('click', () => {
      console.log('Settings button clicked');
      // TODO: Implement settings modal
      alert('Settings not yet implemented');
    });
    
    // Add combatant form
    console.log('Setting up add combatant form listener');
    document.getElementById('jct-add-combatant-form').addEventListener('submit', (event) => {
      event.preventDefault();
      console.log('Add combatant form submitted');
      
      const name = document.getElementById('jct-combatant-name').value;
      const initiative = parseInt(document.getElementById('jct-combatant-initiative').value);
      const hp = parseInt(document.getElementById('jct-combatant-hp').value);
      const ac = parseInt(document.getElementById('jct-combatant-ac').value);
      
      this._addCombatant({
        name,
        initiative,
        hp,
        maxHp: hp,
        ac
      });
      
      // Reset form
      document.getElementById('jct-add-combatant-form').reset();
    });
    
    // Next turn button
    console.log('Setting up next turn button listener');
    document.getElementById('jct-next').addEventListener('click', () => {
      console.log('Next turn button clicked');
      this._nextTurn();
    });
    
    // Previous turn button
    console.log('Setting up previous turn button listener');
    document.getElementById('jct-prev').addEventListener('click', () => {
      console.log('Previous turn button clicked');
      this._previousTurn();
    });
    
    // Add template button
    console.log('Setting up add template button listener');
    document.getElementById('jct-add-template').addEventListener('click', () => {
      console.log('Add template button clicked');
      // TODO: Implement template creation
      alert('Template creation not yet implemented');
    });
    
    // Tactical map toggle button
    console.log('Setting up tactical map toggle button listener');
    this.ui.tacticalMapToggle.addEventListener('click', () => {
      console.log('Tactical map toggle button clicked');
      this._toggleTacticalMap();
    });
    
    console.log('All event listeners set up successfully');
  }
  
  /**
   * Set up auto-save functionality
   * @private
   */
  _setupAutoSave() {
    console.log(`Setting up auto-save with interval: ${this.options.autoSaveInterval}ms`);
    this.autoSaveInterval = setInterval(() => {
      console.log('Auto-save triggered');
      this.saveData();
    }, this.options.autoSaveInterval);
  }
  
  /**
   * Initialize the tactical map
   * @private
   */
  _initializeTacticalMap() {
    console.log('Starting tactical map initialization');
    try {
      console.log('Creating tactical combat manager');
      this.tacticalCombatManager = createTacticalCombatManager({
        container: this.ui.tacticalMapContainer,
        combat: this.combat
      });
      console.log('Tactical combat manager created successfully');
    } catch (error) {
      console.error('Failed to initialize tactical map:', error);
    }
  }
  
  /**
   * Create a new combat
   * @returns {Object} New combat object
   * @private
   */
  _createNewCombat() {
    console.log('Creating new combat object');
    return {
      round: 1,
      turn: 0,
      combatants: [],
      active: false
    };
  }
  
  /**
   * Add a combatant to the combat
   * @param {Object} combatant - Combatant data
   * @private
   */
  _addCombatant(combatant) {
    console.log(`Adding combatant: ${combatant.name}`);
    
    // Add default properties if not provided
    const newCombatant = {
      id: Date.now().toString(),
      conditions: [],
      notes: '',
      ...combatant
    };
    
    // Add to combatants array
    this.combat.combatants.push(newCombatant);
    
    // Sort by initiative
    this.combat.combatants.sort((a, b) => b.initiative - a.initiative);
    
    // Update UI
    this._updateUI();
    
    // Save data
    this.saveData();
    
    console.log(`Combatant added successfully: ${newCombatant.name} (ID: ${newCombatant.id})`);
  }
  
  /**
   * Move to the next turn
   * @private
   */
  _nextTurn() {
    console.log('Moving to next turn');
    
    if (this.combat.combatants.length === 0) {
      console.log('No combatants, cannot advance turn');
      return;
    }
    
    this.combat.turn++;
    
    // If we've gone through all combatants, advance to the next round
    if (this.combat.turn >= this.combat.combatants.length) {
      this.combat.turn = 0;
      this.combat.round++;
      console.log(`Advanced to round ${this.combat.round}`);
    }
    
    // Update UI
    this._updateUI();
    
    // Save data
    this.saveData();
    
    console.log(`Now on turn: ${this.combat.turn} (${this.combat.combatants[this.combat.turn]?.name})`);
  }
  
  /**
   * Move to the previous turn
   * @private
   */
  _previousTurn() {
    console.log('Moving to previous turn');
    
    if (this.combat.combatants.length === 0) {
      console.log('No combatants, cannot go back a turn');
      return;
    }
    
    this.combat.turn--;
    
    // If we've gone before the first combatant, go to the previous round
    if (this.combat.turn < 0) {
      if (this.combat.round > 1) {
        this.combat.round--;
        this.combat.turn = this.combat.combatants.length - 1;
        console.log(`Went back to round ${this.combat.round}`);
      } else {
        this.combat.turn = 0;
        console.log('Already at the first turn of the first round');
      }
    }
    
    // Update UI
    this._updateUI();
    
    // Save data
    this.saveData();
    
    console.log(`Now on turn: ${this.combat.turn} (${this.combat.combatants[this.combat.turn]?.name})`);
  }
  
  /**
   * Toggle the tactical map display
   * @private
   */
  _toggleTacticalMap() {
    console.log('Toggling tactical map');
    
    const isVisible = this.ui.tacticalMapContainer.style.display !== 'none';
    
    if (isVisible) {
      console.log('Hiding tactical map');
      this.ui.tacticalMapContainer.style.display = 'none';
    } else {
      console.log('Showing tactical map');
      this.ui.tacticalMapContainer.style.display = 'block';
      
      // Refresh the map if needed
      if (this.tacticalCombatManager) {
        console.log('Refreshing tactical map');
        this.tacticalCombatManager.refresh();
      }
    }
  }
  
  /**
   * Update the UI with current combat data
   * @private
   */
  _updateUI() {
    console.log('Updating UI with current combat data');
    
    // Update round counter
    document.getElementById('jct-round').textContent = this.combat.round;
    
    // Update combatant list
    this.ui.combatantList.innerHTML = '';
    
    if (this.combat.combatants.length === 0) {
      console.log('No combatants to display');
      this.ui.combatantList.innerHTML = '<div class="jct-empty-state">No combatants added yet.</div>';
      return;
    }
    
    console.log(`Rendering ${this.combat.combatants.length} combatants`);
    
    this.combat.combatants.forEach((combatant, index) => {
      const isActive = index === this.combat.turn;
      
      const combatantEl = document.createElement('div');
      combatantEl.className = `jct-combatant ${isActive ? 'jct-active' : ''}`;
      combatantEl.dataset.id = combatant.id;
      
      combatantEl.innerHTML = `
        <div class="jct-combatant-initiative">${combatant.initiative}</div>
        <div class="jct-combatant-name">${combatant.name}</div>
        <div class="jct-combatant-hp">
          <span class="jct-hp-current">${combatant.hp}</span>/<span class="jct-hp-max">${combatant.maxHp}</span>
        </div>
        <div class="jct-combatant-ac">AC: ${combatant.ac}</div>
        <div class="jct-combatant-controls">
          <button class="jct-button jct-damage-button" data-id="${combatant.id}">Damage</button>
          <button class="jct-button jct-heal-button" data-id="${combatant.id}">Heal</button>
          <button class="jct-button jct-remove-button" data-id="${combatant.id}">Remove</button>
        </div>
      `;
      
      this.ui.combatantList.appendChild(combatantEl);
      
      // Add event listeners for the combatant buttons
      combatantEl.querySelector('.jct-damage-button').addEventListener('click', () => {
        const amount = parseInt(prompt(`Damage amount for ${combatant.name}:`, '0'));
        if (!isNaN(amount) && amount > 0) {
          this._damageCombatant(combatant.id, amount);
        }
      });
      
      combatantEl.querySelector('.jct-heal-button').addEventListener('click', () => {
        const amount = parseInt(prompt(`Healing amount for ${combatant.name}:`, '0'));
        if (!isNaN(amount) && amount > 0) {
          this._healCombatant(combatant.id, amount);
        }
      });
      
      combatantEl.querySelector('.jct-remove-button').addEventListener('click', () => {
        if (confirm(`Remove ${combatant.name} from combat?`)) {
          this._removeCombatant(combatant.id);
        }
      });
    });
    
    console.log('UI updated successfully');
  }
  
  /**
   * Apply damage to a combatant
   * @param {string} id - Combatant ID
   * @param {number} amount - Damage amount
   * @private
   */
  _damageCombatant(id, amount) {
    console.log(`Applying ${amount} damage to combatant ${id}`);
    
    const combatant = this.combat.combatants.find(c => c.id === id);
    if (!combatant) {
      console.error(`Combatant with ID ${id} not found`);
      return;
    }
    
    combatant.hp = Math.max(0, combatant.hp - amount);
    
    // Update UI
    this._updateUI();
    
    // Save data
    this.saveData();
    
    console.log(`Combatant ${combatant.name} now has ${combatant.hp}/${combatant.maxHp} HP`);
  }
  
  /**
   * Heal a combatant
   * @param {string} id - Combatant ID
   * @param {number} amount - Healing amount
   * @private
   */
  _healCombatant(id, amount) {
    console.log(`Applying ${amount} healing to combatant ${id}`);
    
    const combatant = this.combat.combatants.find(c => c.id === id);
    if (!combatant) {
      console.error(`Combatant with ID ${id} not found`);
      return;
    }
    
    combatant.hp = Math.min(combatant.maxHp, combatant.hp + amount);
    
    // Update UI
    this._updateUI();
    
    // Save data
    this.saveData();
    
    console.log(`Combatant ${combatant.name} now has ${combatant.hp}/${combatant.maxHp} HP`);
  }
  
  /**
   * Remove a combatant from combat
   * @param {string} id - Combatant ID
   * @private
   */
  _removeCombatant(id) {
    console.log(`Removing combatant ${id}`);
    
    const index = this.combat.combatants.findIndex(c => c.id === id);
    if (index === -1) {
      console.error(`Combatant with ID ${id} not found`);
      return;
    }
    
    // Remove the combatant
    const removed = this.combat.combatants.splice(index, 1)[0];
    console.log(`Removed combatant: ${removed.name}`);
    
    // Adjust the current turn if needed
    if (index <= this.combat.turn && this.combat.turn > 0) {
      this.combat.turn--;
    }
    
    // Update UI
    this._updateUI();
    
    // Save data
    this.saveData();
    
    console.log(`Combat now has ${this.combat.combatants.length} combatants`);
  }
  
  /**
   * Save data to localStorage
   */
  saveData() {
    console.log('Saving data to localStorage');
    this.state = AppState.SAVING;
    
    try {
      const dataToSave = {
        combat: this.combat,
        templates: JSON.parse(this.templateManager.exportAllToJson())
      };
      
      localStorage.setItem(this.options.storageKey, JSON.stringify(dataToSave));
      
      this.state = AppState.READY;
      console.log('Data saved successfully');
    } catch (error) {
      console.error('Error saving data:', error);
      this.state = AppState.ERROR;
      alert('Failed to save data: ' + error.message);
    }
  }
  
  /**
   * Dispatch a custom event
   * @param {string} name - Event name
   * @param {Object} detail - Event details
   * @private
   */
  _dispatchEvent(name, detail = {}) {
    console.log(`Dispatching event: ${name}`, detail);
    
    const event = new CustomEvent(`jct:${name}`, {
      bubbles: true,
      detail
    });
    
    this.container.dispatchEvent(event);
  }
}

/**
 * Factory function to create a new CombatTrackerApp instance
 * @param {Object} options - Configuration options
 * @returns {CombatTrackerApp} New CombatTrackerApp instance
 */
function createCombatTrackerApp(options = {}) {
  console.log('Creating new CombatTrackerApp instance with options:', options);
  return new CombatTrackerApp(options);
}

// Export both the class and the factory function
export { CombatTrackerApp, createCombatTrackerApp };
