/**
 * Main application class for Jesster's Combat Tracker
 */
class App {
    constructor() {
        this.version = '2.3.1';
        this.state = {
            combatStarted: false,
            combatStartTime: null,
            roundNumber: 1,
            currentTurn: null,
            combatLog: [],
            playerViewWindow: null
        };
        
        // Initialize utility classes
        this.utils = new Utils();
        
        // Initialize managers
        this.storage = new StorageManager(this);
        this.settings = new SettingsManager(this);
        this.ui = new UIManager(this);
        this.combat = new CombatManager(this);
        this.dice = new DiceManager(this);
        this.keyboard = new KeyboardManager(this);
        this.api = new APIManager(this);
        this.audio = new AudioManager(this);
        
        console.log(`Jesster's Combat Tracker v${this.version} initialized`);
    }
    
    /**
     * Initialize the application
     */
    async init() {
        try {
            // Initialize managers
            await this.storage.init();
            await this.settings.init();
            await this.ui.init();
            await this.combat.init();
            await this.dice.init();
            await this.keyboard.init();
            await this.api.init();
            await this.audio.init();
            
            // Add event listeners
            this.addEventListeners();
            
            // Set up auto-save if enabled
            this.setupAutoSave();
            
            console.log(`Jesster's Combat Tracker v${this.version} ready`);
            
            // Log startup
            this.logEvent(`Combat Tracker v${this.version} started`);
        } catch (error) {
            console.error('Error initializing application:', error);
        }
    }
    
    /**
     * Add event listeners
     */
    addEventListeners() {
        // Add Hero button
        const addHeroBtn = document.getElementById('add-hero-btn');
        if (addHeroBtn) {
            addHeroBtn.addEventListener('click', () => {
                this.ui.openAddHeroModal();
            });
        }
        
        // Add Monster button
        const addMonsterBtn = document.getElementById('add-monster-btn');
        if (addMonsterBtn) {
            addMonsterBtn.addEventListener('click', () => {
                this.ui.openAddMonsterModal();
            });
        }
        
        // Roll Initiative button
        const rollInitiativeBtn = document.getElementById('roll-initiative-btn');
        if (rollInitiativeBtn) {
            rollInitiativeBtn.addEventListener('click', () => {
                this.combat.rollInitiativeForAll();
            });
        }
        
        // Start Combat button
        const startCombatBtn = document.getElementById('start-combat-btn');
        if (startCombatBtn) {
            startCombatBtn.addEventListener('click', () => {
                this.combat.startCombat();
            });
        }
        
        // Next Turn button
        const nextTurnBtn = document.getElementById('next-turn-btn');
        if (nextTurnBtn) {
            nextTurnBtn.addEventListener('click', () => {
                this.combat.nextTurn();
            });
        }
        
        // End Combat button
        const endCombatBtn = document.getElementById('end-combat-btn');
        if (endCombatBtn) {
            endCombatBtn.addEventListener('click', () => {
                if (this.settings.getSetting('confirmEndCombat', true)) {
                    this.showConfirm('Are you sure you want to end combat?', () => {
                        this.combat.endCombat();
                    });
                } else {
                    this.combat.endCombat();
                }
            });
        }
        
        // Manage Initiative button
        const manageInitiativeBtn = document.getElementById('manage-initiative-btn');
        if (manageInitiativeBtn) {
            manageInitiativeBtn.addEventListener('click', () => {
                this.ui.openInitiativeManagementModal();
            });
        }
        
        // Open Player View button
        const playerViewBtn = document.getElementById('open-player-view-btn');
        if (playerViewBtn) {
            playerViewBtn.addEventListener('click', () => {
                this.ui.openPlayerView();
            });
        }
        
        // Settings button
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.settings.openSettingsModal();
            });
        }
        
        // Help button
        const helpBtn = document.getElementById('help-btn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => {
                this.showHelpModal();
            });
        }
        
        // Roll dice buttons
        const diceButtons = document.querySelectorAll('.dice-btn');
        diceButtons.forEach(button => {
            button.addEventListener('click', () => {
                const dice = button.dataset.dice;
                this.dice.rollAndDisplay(dice);
            });
        });
        
                // Custom dice roll button
        const rollCustomBtn = document.getElementById('roll-custom-btn');
        const customDiceInput = document.getElementById('custom-dice-input');
        if (rollCustomBtn && customDiceInput) {
            rollCustomBtn.addEventListener('click', () => {
                const diceNotation = customDiceInput.value.trim();
                if (diceNotation) {
                    this.dice.rollAndDisplay(diceNotation);
                }
            });
            
            customDiceInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const diceNotation = customDiceInput.value.trim();
                    if (diceNotation) {
                        this.dice.rollAndDisplay(diceNotation);
                    }
                }
            });
        }
        
        // Search Monster button
        const searchMonsterBtn = document.getElementById('search-monster-btn');
        if (searchMonsterBtn) {
            searchMonsterBtn.addEventListener('click', () => {
                this.ui.openMonsterSearchModal();
            });
        }
        
        // Import from D&D Beyond button
        const importDnDBeyondBtn = document.getElementById('import-dndbeyond-btn');
        if (importDnDBeyondBtn) {
            importDnDBeyondBtn.addEventListener('click', () => {
                this.ui.openDnDBeyondImportModal();
            });
        }
        
        // Add Monster Group button
        const addMonsterGroupBtn = document.getElementById('add-monster-group-btn');
        if (addMonsterGroupBtn) {
            addMonsterGroupBtn.addEventListener('click', () => {
                this.ui.openAddMonsterGroupModal();
            });
        }
        
        // Encounter Builder button
        const encounterBuilderBtn = document.getElementById('encounter-builder-btn');
        if (encounterBuilderBtn) {
            encounterBuilderBtn.addEventListener('click', () => {
                this.ui.openEncounterBuilderModal();
            });
        }
        
        // Monster Compendium button
        const monsterCompendiumBtn = document.getElementById('monster-compendium-btn');
        if (monsterCompendiumBtn) {
            monsterCompendiumBtn.addEventListener('click', () => {
                this.api.openMonsterCompendium();
            });
        }
        
        // Spell Database button
        const spellDatabaseBtn = document.getElementById('spell-database-btn');
        if (spellDatabaseBtn) {
            spellDatabaseBtn.addEventListener('click', () => {
                this.api.openSpellDatabase();
            });
        }
        
        // Save Combat button
        const saveCombatBtn = document.getElementById('save-combat-btn');
        if (saveCombatBtn) {
            saveCombatBtn.addEventListener('click', () => {
                this.openSaveCombatModal();
            });
        }
        
        // Load Combat button
        const loadCombatBtn = document.getElementById('load-combat-btn');
        if (loadCombatBtn) {
            loadCombatBtn.addEventListener('click', () => {
                this.openLoadCombatModal();
            });
        }
    }
    
    /**
     * Set up auto-save
     */
    setupAutoSave() {
        if (this.settings.getSetting('autoSave', true)) {
            const interval = this.settings.getSetting('autoSaveInterval', 5) * 60 * 1000; // Convert minutes to milliseconds
            
            this.autoSaveInterval = setInterval(() => {
                if (this.combat.getAllCreatures().length > 0) {
                    this.storage.saveCombatState('Auto-save');
                }
            }, interval);
            
            console.log(`Auto-save enabled, interval: ${interval / 60000} minutes`);
        }
    }
    
    /**
     * Log an event to the combat log
     * @param {string} message - The message to log
     */
    logEvent(message) {
        // Add timestamp
        const timestamp = new Date();
        const formattedTime = this.utils.formatTime(timestamp);
        const logMessage = `[${formattedTime}] ${message}`;
        
        // Add to combat log
        this.state.combatLog.push(logMessage);
        
        // Limit log size
        const maxLogSize = 100;
        if (this.state.combatLog.length > maxLogSize) {
            this.state.combatLog = this.state.combatLog.slice(-maxLogSize);
        }
        
        // Update UI
        this.ui.renderCombatLog();
        
        // Log to console
        console.log(message);
    }
    
    /**
     * Show an alert
     * @param {string} message - The message to show
     * @param {string} [title='Alert'] - The alert title
     */
    showAlert(message, title = 'Alert') {
        this.ui.showAlert(message, title);
    }
    
    /**
     * Show a confirmation dialog
     * @param {string} message - The message to show
     * @param {Function} onConfirm - The function to call when confirmed
     * @param {string} [title='Confirm'] - The confirmation title
     */
    showConfirm(message, onConfirm, title = 'Confirm') {
        this.ui.showConfirm(message, onConfirm, title);
    }
    
    /**
     * Show the help modal
     */
    showHelpModal() {
        const modal = this.ui.createModal({
            title: 'Help & About',
            content: `
                <div class="space-y-6">
                    <div class="text-center">
                        <h2 class="text-xl font-bold">Jesster's Combat Tracker v${this.version}</h2>
                        <p class="text-gray-400">A D&D 5e combat tracker for DMs</p>
                    </div>
                    
                    <div class="space-y-4">
                        <h3 class="text-lg font-semibold border-b border-gray-700 pb-2">Quick Start Guide</h3>
                        
                        <ol class="list-decimal list-inside space-y-2">
                            <li>Add heroes and monsters using the buttons at the top</li>
                            <li>Roll initiative for all creatures</li>
                            <li>Start combat to begin tracking turns</li>
                            <li>Use the "Next Turn" button to advance through the initiative order</li>
                            <li>Apply damage/healing and conditions as needed</li>
                            <li>End combat when the encounter is over</li>
                        </ol>
                    </div>
                    
                    <div class="space-y-4">
                        <h3 class="text-lg font-semibold border-b border-gray-700 pb-2">Features</h3>
                        
                        <ul class="list-disc list-inside space-y-2">
                            <li>Track initiative and turns</li>
                            <li>Manage HP, AC, and conditions</li>
                            <li>Roll dice with a built-in dice roller</li>
                            <li>Import monsters from the SRD</li>
                            <li>Import characters from D&D Beyond</li>
                            <li>Player view for displaying to your players</li>
                            <li>Save and load encounters</li>
                            <li>Keyboard shortcuts for quick actions</li>
                        </ul>
                    </div>
                    
                    <div class="space-y-4">
                        <h3 class="text-lg font-semibold border-b border-gray-700 pb-2">Keyboard Shortcuts</h3>
                        
                        <button id="view-shortcuts-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded w-full">
                            View Keyboard Shortcuts
                        </button>
                    </div>
                    
                    <div class="text-center text-sm text-gray-400 mt-4">
                        <p>Created by Jesster</p>
                        <p>Dungeons & Dragons, D&D, their respective logos, and all Wizards titles and characters are property of Wizards of the Coast LLC in the U.S.A. and other countries. ©2024 Wizards.</p>
                    </div>
                    
                    <div class="flex justify-end">
                        <button id="close-help-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Close
                        </button>
                    </div>
                </div>
            `,
            width: 'max-w-2xl'
        });
        
        // Add event listeners
        const viewShortcutsBtn = modal.querySelector('#view-shortcuts-btn');
        const closeHelpBtn = modal.querySelector('#close-help-btn');
        
        viewShortcutsBtn.addEventListener('click', () => {
            this.keyboard.showShortcutsPanel();
        });
        
        closeHelpBtn.addEventListener('click', () => {
            this.ui.closeModal(modal.parentNode);
        });
    }
    
    /**
     * Open the save combat modal
     */
    openSaveCombatModal() {
        const creatures = this.combat.getAllCreatures();
        
        if (creatures.length === 0) {
            this.showAlert('No creatures to save.');
            return;
        }
        
        const modal = this.ui.createModal({
            title: 'Save Combat State',
            content: `
                <div class="space-y-4">
                    <div>
                        <label class="block text-gray-300 mb-2">Save Name:</label>
                        <input type="text" id="save-name" class="w-full bg-gray-700 text-white px-3 py-2 rounded" placeholder="Enter a name for this save...">
                    </div>
                    
                    <div>
                        <label class="block text-gray-300 mb-2">Current Combat:</label>
                        <div class="bg-gray-800 p-2 rounded max-h-40 overflow-y-auto">
                            <ul class="list-disc list-inside">
                                <li>Round: ${this.state.roundNumber}</li>
                                <li>Combat Started: ${this.state.combatStarted ? 'Yes' : 'No'}</li>
                                <li>Creatures: ${creatures.length}</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="flex justify-end space-x-2">
                        <button id="cancel-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                            Cancel
                        </button>
                        <button id="save-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Save
                        </button>
                    </div>
                </div>
            `,
            width: 'max-w-md'
        });
        
        // Add event listeners
        const nameInput = modal.querySelector('#save-name');
        const cancelBtn = modal.querySelector('#cancel-btn');
        const saveBtn = modal.querySelector('#save-btn');
        
        // Set default name
        const date = new Date();
        nameInput.value = `Combat ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        
        cancelBtn.addEventListener('click', () => {
            this.ui.closeModal(modal.parentNode);
        });
        
        saveBtn.addEventListener('click', () => {
            const name = nameInput.value.trim() || nameInput.placeholder;
            
            // Save the combat state
            this.storage.saveCombatState(name);
            
            // Close the modal
            this.ui.closeModal(modal.parentNode);
        });
    }
    
    /**
     * Open the load combat modal
     */
    openLoadCombatModal() {
        const savedStates = this.storage.loadData('savedCombatStates', []);
        
        if (savedStates.length === 0) {
            this.showAlert('No saved combat states found.');
            return;
        }
        
        const modal = this.ui.createModal({
            title: 'Load Combat State',
            content: `
                <div class="space-y-4">
                    <div>
                        <label class="block text-gray-300 mb-2">Select a saved combat state:</label>
                        <div id="saved-states" class="bg-gray-700 rounded p-2 max-h-96 overflow-y-auto">
                            ${savedStates.map((state, index) => `
                                <div class="saved-state-item bg-gray-600 hover:bg-gray-500 p-2 mb-2 rounded cursor-pointer" data-index="${index}">
                                    <div class="flex justify-between">
                                        <div class="font-semibold">${state.name}</div>
                                        <div class="text-sm text-gray-400">${new Date(state.savedAt).toLocaleString()}</div>
                                    </div>
                                    <div class="text-sm">
                                        Round ${state.roundNumber} • ${state.creatures.length} creatures
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="flex justify-end space-x-2">
                        <button id="delete-btn" class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" disabled>
                            Delete
                        </button>
                        <button id="cancel-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                            Cancel
                        </button>
                        <button id="load-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" disabled>
                            Load
                        </button>
                    </div>
                </div>
            `,
            width: 'max-w-2xl'
        });
        
        // Add event listeners
        const savedStatesContainer = modal.querySelector('#saved-states');
        const deleteBtn = modal.querySelector('#delete-btn');
        const cancelBtn = modal.querySelector('#cancel-btn');
        const loadBtn = modal.querySelector('#load-btn');
        
        let selectedIndex = null;
        
        // Add click event for saved states
        savedStatesContainer.querySelectorAll('.saved-state-item').forEach(item => {
            item.addEventListener('click', () => {
                // Remove selected class from all items
                savedStatesContainer.querySelectorAll('.saved-state-item').forEach(i => {
                    i.classList.remove('bg-blue-800');
                    i.classList.add('bg-gray-600');
                    i.classList.add('hover:bg-gray-500');
                });
                
                // Add selected class to clicked item
                item.classList.remove('bg-gray-600', 'hover:bg-gray-500');
                item.classList.add('bg-blue-800');
                
                // Update selected index
                selectedIndex = parseInt(item.dataset.index);
                
                // Enable buttons
                deleteBtn.disabled = false;
                loadBtn.disabled = false;
            });
        });
        
        cancelBtn.addEventListener('click', () => {
            this.ui.closeModal(modal.parentNode);
        });
        
        deleteBtn.addEventListener('click', () => {
            if (selectedIndex !== null) {
                const state = savedStates[selectedIndex];
                
                this.showConfirm(`Are you sure you want to delete "${state.name}"?`, () => {
                    this.storage.deleteCombatState(selectedIndex);
                    this.ui.closeModal(modal.parentNode);
                    this.openLoadCombatModal(); // Reopen the modal with updated list
                });
            }
        });
        
        loadBtn.addEventListener('click', () => {
            if (selectedIndex !== null) {
                this.storage.loadCombatState(selectedIndex);
                this.ui.closeModal(modal.parentNode);
            }
        });
    }
    
    /**
     * Update the player view
     */
    updatePlayerView() {
        if (!this.state.playerViewWindow || this.state.playerViewWindow.closed) {
            return;
        }
        
        try {
            // Generate the player view HTML
            const html = this.ui.generatePlayerViewHTML();
            
            // Update the player view window
            const doc = this.state.playerViewWindow.document;
            doc.open();
            doc.write(html);
            doc.close();
        } catch (error) {
            console.error('Error updating player view:', error);
        }
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
    window.app.init();
});
