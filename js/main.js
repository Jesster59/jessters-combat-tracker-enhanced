/**
 * Main entry point for Jesster's Combat Tracker
 * Initializes all modules and sets up the application
 */

// Import modules
import Storage from './modules/storage.js';
import Settings from './modules/settings.js';
import UI from './modules/ui.js';
import Audio from './modules/audio.js';
import Dice from './modules/dice.js';
import Combat from './modules/combat.js';
import Encounter from './modules/encounter.js';
import Roster from './modules/roster.js';
import Notes from './modules/notes.js';
import Timer from './modules/timer.js';
import API from './modules/api.js';

// Main application class
class JessterCombatTracker {
    constructor() {
        // Version
        this.version = '2.3.1';
        
        // Modules
        this.modules = {};
        
        // Application state
        this.state = {
            initialized: false,
            currentView: 'combat',
            loading: true,
            error: null
        };
        
        // Initialize application
        this._init();
    }

    /**
     * Initialize application
     * @private
     */
    async _init() {
        try {
            console.log(`Initializing Jesster's Combat Tracker v${this.version}`);
            
            // Show loading screen
            this._showLoadingScreen();
            
            // Initialize modules
            await this._initModules();
            
            // Set up event listeners
            this._setupEventListeners();
            
            // Load initial view
            this._loadInitialView();
            
            // Hide loading screen
            this._hideLoadingScreen();
            
            // Set initialized flag
            this.state.initialized = true;
            
            console.log('Initialization complete');
        } catch (error) {
            console.error('Initialization error:', error);
            this._showErrorScreen(error);
        }
    }

    /**
     * Initialize modules
     * @private
     */
    async _initModules() {
        console.log('Initializing modules');
        
        // Initialize storage module first
        this.modules.storage = new Storage();
        
        // Initialize settings module
        this.modules.settings = new Settings(this.modules.storage);
        
        // Initialize UI module
        this.modules.ui = new UI(this.modules.settings);
        this.modules.ui.init();
        
        // Initialize audio module
        this.modules.audio = new Audio(this.modules.settings);
        
        // Initialize dice module
        this.modules.dice = new Dice(this.modules.settings, this.modules.audio);
        
        // Initialize timer module
        this.modules.timer = new Timer(this.modules.settings, this.modules.audio);
        
        // Initialize API module
        this.modules.api = new API(this.modules.settings);
        this.modules.api.init();
        
        // Initialize roster module
        this.modules.roster = new Roster(this.modules.storage, this.modules.dice);
        
        // Initialize encounter module
        this.modules.encounter = new Encounter(this.modules.storage, this.modules.dice, this.modules.roster);
        
        // Initialize combat module
        this.modules.combat = new Combat(
            this.modules.storage,
            this.modules.dice,
            this.modules.timer,
            this.modules.audio,
            this.modules.settings,
            this.modules.roster
        );
        
        // Initialize notes module
        this.modules.notes = new Notes(this.modules.storage);
        
        // Apply settings
        this.modules.settings.applySettings();
    }

    /**
     * Set up event listeners
     * @private
     */
    _setupEventListeners() {
        console.log('Setting up event listeners');
        
        // Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                
                // Get view name
                const view = link.getAttribute('data-view');
                
                // Switch view
                this.switchView(view);
            });
        });
        
        // Button click sound
        document.addEventListener('click', (event) => {
            if (event.target.tagName === 'BUTTON' || event.target.classList.contains('button')) {
                this.modules.audio.play('button-click', { volume: 0.5 });
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            // Check if modal is open
            const modalOpen = document.body.classList.contains('modal-open');
            
            // Ctrl+S: Save
            if (event.ctrlKey && event.key === 's') {
                event.preventDefault();
                this._saveAll();
            }
            
            // Escape: Close modal or cancel action
            if (event.key === 'Escape' && !modalOpen) {
                // Handle escape in current view
                this._handleEscapeKey();
            }
            
            // F1: Help
            if (event.key === 'F1') {
                event.preventDefault();
                this._showHelp();
            }
        });
        
        // Window beforeunload
        window.addEventListener('beforeunload', (event) => {
            // Check if combat is active
            if (this.modules.combat.isActive()) {
                // Show confirmation
                event.preventDefault();
                event.returnValue = 'Combat is in progress. Are you sure you want to leave?';
                return event.returnValue;
            }
        });
        
        // Theme change listener
        this.modules.settings.listenForThemeChanges();
    }

    /**
     * Load initial view
     * @private
     */
    _loadInitialView() {
        // Get last view from settings
        const lastView = this.modules.settings.getLastView();
        
        // Switch to last view
        this.switchView(lastView || 'combat');
    }

    /**
     * Show loading screen
     * @private
     */
    _showLoadingScreen() {
        // Create loading screen if it doesn't exist
        if (!document.getElementById('loading-screen')) {
            const loadingScreen = document.createElement('div');
            loadingScreen.id = 'loading-screen';
            loadingScreen.className = 'loading-screen';
            
            const spinner = document.createElement('div');
            spinner.className = 'spinner';
            loadingScreen.appendChild(spinner);
            
            const text = document.createElement('div');
            text.className = 'loading-text';
            text.textContent = "Loading Jesster's Combat Tracker...";
            loadingScreen.appendChild(text);
            
            const version = document.createElement('div');
            version.className = 'version-text';
            version.textContent = `v${this.version}`;
            loadingScreen.appendChild(version);
            
            document.body.appendChild(loadingScreen);
        }
        
        // Show loading screen
        document.getElementById('loading-screen').style.display = 'flex';
        
        // Set loading state
        this.state.loading = true;
    }

    /**
     * Hide loading screen
     * @private
     */
    _hideLoadingScreen() {
        // Hide loading screen
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            // Add fade-out class
            loadingScreen.classList.add('fade-out');
            
            // Remove after animation
            setTimeout(() => {
                if (loadingScreen.parentNode) {
                    loadingScreen.parentNode.removeChild(loadingScreen);
                }
            }, 500);
        }
        
        // Set loading state
        this.state.loading = false;
    }

    /**
     * Show error screen
     * @private
     * @param {Error} error - Error object
     */
    _showErrorScreen(error) {
        // Create error screen if it doesn't exist
        if (!document.getElementById('error-screen')) {
            const errorScreen = document.createElement('div');
            errorScreen.id = 'error-screen';
            errorScreen.className = 'error-screen';
            
            const icon = document.createElement('div');
            icon.className = 'error-icon';
            icon.innerHTML = '⚠️';
            errorScreen.appendChild(icon);
            
            const title = document.createElement('h1');
            title.className = 'error-title';
            title.textContent = 'Initialization Error';
            errorScreen.appendChild(title);
            
            const message = document.createElement('div');
            message.className = 'error-message';
            message.textContent = error.message || 'An unknown error occurred.';
            errorScreen.appendChild(message);
            
            const details = document.createElement('div');
            details.className = 'error-details';
            details.textContent = error.stack || '';
            errorScreen.appendChild(details);
            
            const button = document.createElement('button');
            button.className = 'error-button';
            button.textContent = 'Reload Application';
            button.addEventListener('click', () => {
                window.location.reload();
            });
            errorScreen.appendChild(button);
            
            document.body.appendChild(errorScreen);
        }
        
        // Show error screen
        document.getElementById('error-screen').style.display = 'flex';
        
        // Hide loading screen
        this._hideLoadingScreen();
        
        // Set error state
        this.state.error = error;
    }

    /**
     * Switch view
     * @param {string} view - View name
     */
    switchView(view) {
        // Check if view exists
        const viewElement = document.getElementById(`${view}-view`);
        if (!viewElement) {
            console.warn(`View not found: ${view}`);
            return;
        }
        
        // Hide all views
        document.querySelectorAll('.view').forEach(el => {
            el.style.display = 'none';
        });
        
        // Show selected view
        viewElement.style.display = 'block';
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            
            if (link.getAttribute('data-view') === view) {
                link.classList.add('active');
            }
        });
        
        // Update current view
        this.state.currentView = view;
        
        // Save last view to settings
        this.modules.settings.setLastView(view);
        
        // Initialize view
        this._initializeView(view);
    }

    /**
     * Initialize view
     * @private
     * @param {string} view - View name
     */
    _initializeView(view) {
        switch (view) {
            case 'combat':
                this._initCombatView();
                break;
            case 'encounter':
                this._initEncounterView();
                break;
            case 'roster':
                this._initRosterView();
                break;
            case 'notes':
                this._initNotesView();
                break;
            case 'settings':
                this._initSettingsView();
                break;
            default:
                console.warn(`No initialization for view: ${view}`);
        }
    }

    /**
     * Initialize combat view
     * @private
     */
    _initCombatView() {
        console.log('Initializing combat view');
        
        // Get combat view elements
        const combatView = document.getElementById('combat-view');
        const initiativeList = combatView.querySelector('.initiative-list');
        const combatControls = combatView.querySelector('.combat-controls');
        
        // Clear initiative list
        initiativeList.innerHTML = '';
        
        // Render combat state
        this.modules.combat.renderCombat(initiativeList);
        
        // Render combat controls
        this._renderCombatControls(combatControls);
    }

    /**
     * Render combat controls
     * @private
     * @param {HTMLElement} container - Container element
     */
    _renderCombatControls(container) {
        // Clear container
        container.innerHTML = '';
        
        // Check if combat is active
        const isActive = this.modules.combat.isActive();
        
        if (isActive) {
            // Create next turn button
            const nextTurnButton = document.createElement('button');
            nextTurnButton.className = 'button primary-button';
            nextTurnButton.innerHTML = '<i class="fas fa-step-forward"></i> Next Turn';
            nextTurnButton.addEventListener('click', () => {
                this.modules.combat.nextTurn();
                this._initCombatView();
            });
            container.appendChild(nextTurnButton);
            
            // Create previous turn button
            const prevTurnButton = document.createElement('button');
            prevTurnButton.className = 'button secondary-button';
            prevTurnButton.innerHTML = '<i class="fas fa-step-backward"></i> Previous Turn';
            prevTurnButton.addEventListener('click', () => {
                this.modules.combat.previousTurn();
                this._initCombatView();
            });
            container.appendChild(prevTurnButton);
            
            // Create end combat button
            const endCombatButton = document.createElement('button');
            endCombatButton.className = 'button danger-button';
            endCombatButton.innerHTML = '<i class="fas fa-stop"></i> End Combat';
            endCombatButton.addEventListener('click', () => {
                this.modules.ui.showConfirmation({
                    title: 'End Combat',
                    message: 'Are you sure you want to end the current combat?',
                    confirmText: 'End Combat',
                    cancelText: 'Cancel',
                    onConfirm: () => {
                        this.modules.combat.endCombat();
                        this._initCombatView();
                    }
                });
            });
            container.appendChild(endCombatButton);
        } else {
            // Create start combat button
            const startCombatButton = document.createElement('button');
            startCombatButton.className = 'button primary-button';
            startCombatButton.innerHTML = '<i class="fas fa-play"></i> Start Combat';
            startCombatButton.addEventListener('click', () => {
                this._showStartCombatDialog();
            });
            container.appendChild(startCombatButton);
            
            // Create load encounter button
            const loadEncounterButton = document.createElement('button');
            loadEncounterButton.className = 'button secondary-button';
            loadEncounterButton.innerHTML = '<i class="fas fa-folder-open"></i> Load Encounter';
            loadEncounterButton.addEventListener('click', () => {
                this._showLoadEncounterDialog();
            });
            container.appendChild(loadEncounterButton);
        }
    }

    /**
     * Show start combat dialog
     * @private
     */
    _showStartCombatDialog() {
        // Create content
        const content = document.createElement('div');
        content.className = 'start-combat-dialog';
        
        // Create combatant list
        const combatantList = document.createElement('div');
        combatantList.className = 'combatant-list';
        
        // Add players
        const players = this.modules.roster.getPlayers();
        if (players.length > 0) {
            const playersHeader = document.createElement('h3');
            playersHeader.textContent = 'Players';
            combatantList.appendChild(playersHeader);
            
            players.forEach(player => {
                const playerItem = document.createElement('div');
                playerItem.className = 'combatant-item';
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = true;
                checkbox.dataset.id = player.id;
                checkbox.dataset.type = 'player';
                
                const label = document.createElement('label');
                label.textContent = player.name;
                
                playerItem.appendChild(checkbox);
                playerItem.appendChild(label);
                combatantList.appendChild(playerItem);
            });
        }
        
        // Add monsters
        const monsters = this.modules.roster.getMonsters();
        if (monsters.length > 0) {
            const monstersHeader = document.createElement('h3');
            monstersHeader.textContent = 'Monsters';
            combatantList.appendChild(monstersHeader);
            
            monsters.forEach(monster => {
                const monsterItem = document.createElement('div');
                monsterItem.className = 'combatant-item';
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = true;
                checkbox.dataset.id = monster.id;
                checkbox.dataset.type = 'monster';
                
                const label = document.createElement('label');
                label.textContent = monster.name;
                
                monsterItem.appendChild(checkbox);
                monsterItem.appendChild(label);
                combatantList.appendChild(monsterItem);
            });
        }
        
        // Add to content
        content.appendChild(combatantList);
        
        // Create options
        const options = document.createElement('div');
        options.className = 'combat-options';
        
        // Roll initiative option
        const rollInitiativeOption = document.createElement('div');
        rollInitiativeOption.className = 'option';
        
        const rollInitiativeCheckbox = document.createElement('input');
        rollInitiativeCheckbox.type = 'checkbox';
        rollInitiativeCheckbox.id = 'roll-initiative';
        rollInitiativeCheckbox.checked = true;
        
        const rollInitiativeLabel = document.createElement('label');
        rollInitiativeLabel.htmlFor = 'roll-initiative';
        rollInitiativeLabel.textContent = 'Roll Initiative';
        
        rollInitiativeOption.appendChild(rollInitiativeCheckbox);
        rollInitiativeOption.appendChild(rollInitiativeLabel);
        options.appendChild(rollInitiativeOption);
        
        // Add to content
        content.appendChild(options);
        
        // Show modal
        this.modules.ui.showModal({
            title: 'Start Combat',
            content,
            buttons: [
                {
                    text: 'Cancel',
                    className: 'button-secondary',
                    onClick: (modal) => {
                        this.modules.ui.closeModal(modal);
                    }
                },
                {
                    text: 'Start Combat',
                    className: 'button-primary',
                    onClick: (modal) => {
                        // Get selected combatants
                        const selectedCombatants = [];
                        
                        combatantList.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
                            const id = checkbox.dataset.id;
                            const type = checkbox.dataset.type;
                            
                            if (type === 'player') {
                                const player = this.modules.roster.getPlayer(id);
                                if (player) {
                                    selectedCombatants.push(player);
                                }
                            } else if (type === 'monster') {
                                const monster = this.modules.roster.getMonster(id);
                                if (monster) {
                                    selectedCombatants.push(monster);
                                }
                            }
                        });
                        
                        // Get options
                        const rollInitiative = rollInitiativeCheckbox.checked;
                        
                        // Start combat
                        this.modules.combat.startCombat(selectedCombatants, { rollInitiative });
                        
                        // Close modal
                        this.modules.ui.closeModal(modal);
                        
                        // Refresh view
                        this._initCombatView();
                    }
                }
            ]
        });
    }

    /**
     * Show load encounter dialog
     * @private
     */
    _showLoadEncounterDialog() {
        // Get saved encounters
        const encounters = this.modules.encounter.getSavedEncounters();
        
        // Create content
        const content = document.createElement('div');
        content.className = 'load-encounter-dialog';
        
        if (encounters.length === 0) {
            content.textContent = 'No saved encounters found.';
        } else {
            // Create encounter list
            const encounterList = document.createElement('div');
            encounterList.className = 'encounter-list';
            
            encounters.forEach(encounter => {
                const encounterItem = document.createElement('div');
                encounterItem.className = 'encounter-item';
                encounterItem.dataset.id = encounter.id;
                
                const name = document.createElement('div');
                name.className = 'encounter-name';
                name.textContent = encounter.name;
                
                const info = document.createElement('div');
                info.className = 'encounter-info';
                info.textContent = `${encounter.monsters.length} monsters, ${encounter.players.length} players`;
                
                encounterItem.appendChild(name);
                encounterItem.appendChild(info);
                
                // Add click event
                encounterItem.addEventListener('click', () => {
                    // Select this encounter
                    encounterList.querySelectorAll('.encounter-item').forEach(item => {
                        item.classList.remove('selected');
                    });
                    encounterItem.classList.add('selected');
                });
                
                // Add double click event
                encounterItem.addEventListener('dblclick', () => {
                    // Load this encounter
                    this._loadEncounter(encounter.id);
                    this.modules.ui.closeAllModals();
                });
                
                encounterList.appendChild(encounterItem);
            });
            
            content.appendChild(encounterList);
        }
        
        // Show modal
        this.modules.ui.showModal({
            title: 'Load Encounter',
            content,
            buttons: [
                {
                    text: 'Cancel',
                    className: 'button-secondary',
                    onClick: (modal) => {
                        this.modules.ui.closeModal(modal);
                    }
                },
                {
                    text: 'Load',
                    className: 'button-primary',
                    onClick: (modal) => {
                        // Get selected encounter
                        const selectedItem = content.querySelector('.encounter-item.selected');
                        if (selectedItem) {
                            const encounterId = selectedItem.dataset.id;
                            this._loadEncounter(encounterId);
                        }
                        
                        // Close modal
                        this.modules.ui.closeModal(modal);
                    }
                }
            ]
        });
    }

    /**
     * Load encounter
     * @private
     * @param {string} encounterId - Encounter ID
     */
    _loadEncounter(encounterId) {
        // Get encounter
        const encounter = this.modules.encounter.getEncounter(encounterId);
        if (!encounter) {
            console.warn(`Encounter not found: ${encounterId}`);
            return;
        }
        
        // Start combat with encounter
        this.modules.combat.startCombatFromEncounter(encounter);
        
        // Refresh view
        this._initCombatView();
    }

    /**
     * Initialize encounter view
     * @private
     */
    _initEncounterView() {
        console.log('Initializing encounter view');
        
        // Get encounter view elements
        const encounterView = document.getElementById('encounter-view');
        const encounterList = encounterView.querySelector('.encounter-list');
        const encounterDetails = encounterView.querySelector('.encounter-details');
        
        // Clear encounter list
        encounterList.innerHTML = '';
        
        // Clear encounter details
        encounterDetails.innerHTML = '';
        
        // Get saved encounters
        const encounters = this.modules.encounter.getSavedEncounters();
        
        // Render encounters
        encounters.forEach(encounter => {
            const encounterItem = document.createElement('div');
            encounterItem.className = 'encounter-item';
            encounterItem.dataset.id = encounter.id;
            
            const name = document.createElement('div');
            name.className = 'encounter-name';
            name.textContent = encounter.name;
            
            const info = document.createElement('div');
            info.className = 'encounter-info';
            info.textContent = `${encounter.monsters.length} monsters, ${encounter.players.length} players`;
            
            encounterItem.appendChild(name);
            encounterItem.appendChild(info);
            
            // Add click event
            encounterItem.addEventListener('click', () => {
                // Select this encounter
                encounterList.querySelectorAll('.encounter-item').forEach(item => {
                    item.classList.remove('selected');
                });
                encounterItem.classList.add('selected');
                
                // Show encounter details
                this._showEncounterDetails(encounter, encounterDetails);
            });
            
            encounterList.appendChild(encounterItem);
        });
        
        // Add new encounter button
        const newEncounterButton = document.createElement('button');
        newEncounterButton.className = 'button primary-button new-encounter-button';
        newEncounterButton.innerHTML = '<i class="fas fa-plus"></i> New Encounter';
        newEncounterButton.addEventListener('click', () => {
            this._showNewEncounterDialog();
        });
        encounterList.appendChild(newEncounterButton);
    }

    /**
     * Show encounter details
     * @private
     * @param {Object} encounter - Encounter object
     * @param {HTMLElement} container - Container element
     */
    _showEncounterDetails(encounter, container) {
        // Clear container
        container.innerHTML = '';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'encounter-header';
        
        const title = document.createElement('h2');
        title.textContent = encounter.name;
        header.appendChild(title);
        
        // Create difficulty badge
        const difficulty = this.modules.encounter.calculateDifficulty(encounter.monsters, encounter.players);
        const difficultyBadge = document.createElement('div');
        difficultyBadge.className = `difficulty-badge ${difficulty.difficulty}`;
        difficultyBadge.textContent = difficulty.difficulty.charAt(0).toUpperCase() + difficulty.difficulty.slice(1);
        header.appendChild(difficultyBadge);
        
        container.appendChild(header);
        
        // Create monsters section
        const monstersSection = document.createElement('div');
        monstersSection.className = 'encounter-section';
        
        const monstersHeader = document.createElement('h3');
        monstersHeader.textContent = 'Monsters';
        monstersSection.appendChild(monstersHeader);
        
        const monstersList = document.createElement('div');
        monstersList.className = 'monsters-list';
        
        encounter.monsters.forEach(monster => {
            const monsterItem = document.createElement('div');
            monsterItem.className = 'monster-item';
            
            const monsterName = document.createElement('div');
            monsterName.className = 'monster-name';
            monsterName.textContent = monster.name;
            
            const monsterInfo = document.createElement('div');
            monsterInfo.className = 'monster-info';
            monsterInfo.textContent = `HP: ${monster.hp}/${monster.maxHp || '?'}, AC: ${monster.ac || '?'}`;
            
            monsterItem.appendChild(monsterName);
            monsterItem.appendChild(monsterInfo);
            monstersList.appendChild(monsterItem);
        });
        
        monstersSection.appendChild(monstersList);
        container.appendChild(monstersSection);
        
        // Create players section
        const playersSection = document.createElement('div');
        playersSection.className = 'encounter-section';
        
        const playersHeader = document.createElement('h3');
        playersHeader.textContent = 'Players';
        playersSection.appendChild(playersHeader);
        
        const playersList = document.createElement('div');
        playersList.className = 'players-list';
        
        encounter.players.forEach(player => {
            const playerItem = document.createElement('div');
            playerItem.className = 'player-item';
            
            const playerName = document.createElement('div');
            playerName.className = 'player-name';
            playerName.textContent = player.name;
            
            const playerInfo = document.createElement('div');
            playerInfo.className = 'player-info';
            playerInfo.textContent = `Level ${player.level || 1} ${player.race || ''} ${player.class || ''}`;
            
            playerItem.appendChild(playerName);
            playerItem.appendChild(playerInfo);
            playersList.appendChild(playerItem);
        });
        
        playersSection.appendChild(playersList);
        container.appendChild(playersSection);
        
        // Create buttons
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'encounter-buttons';
        
        const startButton = document.createElement('button');
        startButton.className = 'button primary-button';
        startButton.innerHTML = '<i class="fas fa-play"></i> Start Combat';
        startButton.addEventListener('click', () => {
            this._loadEncounter(encounter.id);
            this.switchView('combat');
        });
        buttonsContainer.appendChild(startButton);
        
        const editButton = document.createElement('button');
        editButton.className = 'button secondary-button';
        editButton.innerHTML = '<i class="fas fa-edit"></i> Edit';
        editButton.addEventListener('click', () => {
            this._showEditEncounterDialog(encounter);
        });
        buttonsContainer.appendChild(editButton);
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'button danger-button';
        deleteButton.innerHTML = '<i class="fas fa-trash"></i> Delete';
        deleteButton.addEventListener('click', () => {
            this._showDeleteEncounterDialog(encounter);
        });
        buttonsContainer.appendChild(deleteButton);
        
        container.appendChild(buttonsContainer);
    }

    /**
     * Show new encounter dialog
     * @private
     */
    _showNewEncounterDialog() {
        // Create content
        const content = document.createElement('div');
        content.className = 'new-encounter-dialog';
        
        // Create form
        const form = document.createElement('form');
        
        // Create name field
        const nameField = document.createElement('div');
        nameField.className = 'form-field';
        
        const nameLabel = document.createElement('label');
        nameLabel.textContent = 'Encounter Name';
        nameLabel.htmlFor = 'encounter-name';
        
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.id = 'encounter-name';
        nameInput.value = `Encounter ${new Date().toLocaleDateString()}`;
        
        nameField.appendChild(nameLabel);
        nameField.appendChild(nameInput);
        form.appendChild(nameField);
        
        // Create tabs
        const tabs = document.createElement('div');
        tabs.className = 'tabs';
        
        const monstersTab = document.createElement('div');
        monstersTab.className = 'tab active';
        monstersTab.textContent = 'Monsters';
        monstersTab.dataset.tab = 'monsters';
        
        const playersTab = document.createElement('div');
        playersTab.className = 'tab';
        playersTab.textContent = 'Players';
        playersTab.dataset.tab = 'players';
        
        tabs.appendChild(monstersTab);
        tabs.appendChild(playersTab);
        form.appendChild(tabs);
        
        // Create tab content
        const tabContent = document.createElement('div');
        tabContent.className = 'tab-content';
        
        // Create monsters tab content
        const monstersContent = document.createElement('div');
        monstersContent.className = 'tab-pane active';
        monstersContent.dataset.tab = 'monsters';
        
                // Get monster templates
        const monsterTemplates = this.modules.roster.getMonsterTemplates();
        
        // Create monster list
        const monsterList = document.createElement('div');
        monsterList.className = 'monster-list';
        
        // Create monster search
        const monsterSearch = document.createElement('input');
        monsterSearch.type = 'text';
        monsterSearch.placeholder = 'Search monsters...';
        monsterSearch.className = 'monster-search';
        monsterSearch.addEventListener('input', () => {
            const query = monsterSearch.value.toLowerCase();
            
            // Filter monsters
            monsterList.querySelectorAll('.monster-item').forEach(item => {
                const name = item.querySelector('.monster-name').textContent.toLowerCase();
                item.style.display = name.includes(query) ? '' : 'none';
            });
        });
        
        monstersContent.appendChild(monsterSearch);
        monstersContent.appendChild(monsterList);
        
        // Add monsters to list
        monsterTemplates.forEach(monster => {
            const monsterItem = document.createElement('div');
            monsterItem.className = 'monster-item';
            monsterItem.dataset.id = monster.id;
            
            const monsterName = document.createElement('div');
            monsterName.className = 'monster-name';
            monsterName.textContent = monster.name;
            
            const monsterInfo = document.createElement('div');
            monsterInfo.className = 'monster-info';
            monsterInfo.textContent = `CR ${monster.cr || '?'}, HP ${monster.maxHp || '?'}`;
            
            const addButton = document.createElement('button');
            addButton.className = 'add-button';
            addButton.innerHTML = '+';
            addButton.addEventListener('click', () => {
                // Add monster to selected list
                this._addMonsterToSelectedList(monster, selectedMonsters);
            });
            
            monsterItem.appendChild(monsterName);
            monsterItem.appendChild(monsterInfo);
            monsterItem.appendChild(addButton);
            monsterList.appendChild(monsterItem);
        });
        
        // Create selected monsters
        const selectedMonstersContainer = document.createElement('div');
        selectedMonstersContainer.className = 'selected-monsters';
        
        const selectedMonstersHeader = document.createElement('h3');
        selectedMonstersHeader.textContent = 'Selected Monsters';
        selectedMonstersContainer.appendChild(selectedMonstersHeader);
        
        const selectedMonsters = document.createElement('div');
        selectedMonsters.className = 'selected-list';
        selectedMonstersContainer.appendChild(selectedMonsters);
        
        monstersContent.appendChild(selectedMonstersContainer);
        
        // Create players tab content
        const playersContent = document.createElement('div');
        playersContent.className = 'tab-pane';
        playersContent.dataset.tab = 'players';
        
        // Get players
        const players = this.modules.roster.getPlayers();
        
        // Create player list
        const playerList = document.createElement('div');
        playerList.className = 'player-list';
        
        // Add players to list
        players.forEach(player => {
            const playerItem = document.createElement('div');
            playerItem.className = 'player-item';
            playerItem.dataset.id = player.id;
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = true;
            checkbox.dataset.id = player.id;
            
            const playerName = document.createElement('div');
            playerName.className = 'player-name';
            playerName.textContent = player.name;
            
            const playerInfo = document.createElement('div');
            playerInfo.className = 'player-info';
            playerInfo.textContent = `Level ${player.level || 1} ${player.race || ''} ${player.class || ''}`;
            
            playerItem.appendChild(checkbox);
            playerItem.appendChild(playerName);
            playerItem.appendChild(playerInfo);
            playerList.appendChild(playerItem);
        });
        
        playersContent.appendChild(playerList);
        
        // Add tab content
        tabContent.appendChild(monstersContent);
        tabContent.appendChild(playersContent);
        form.appendChild(tabContent);
        
        // Add tab switching
        tabs.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                // Deactivate all tabs
                tabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                tabContent.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
                
                // Activate this tab
                tab.classList.add('active');
                tabContent.querySelector(`.tab-pane[data-tab="${tab.dataset.tab}"]`).classList.add('active');
            });
        });
        
        content.appendChild(form);
        
        // Show modal
        this.modules.ui.showModal({
            title: 'New Encounter',
            content,
            buttons: [
                {
                    text: 'Cancel',
                    className: 'button-secondary',
                    onClick: (modal) => {
                        this.modules.ui.closeModal(modal);
                    }
                },
                {
                    text: 'Create',
                    className: 'button-primary',
                    onClick: (modal) => {
                        // Get encounter name
                        const name = nameInput.value || `Encounter ${new Date().toLocaleDateString()}`;
                        
                        // Get selected monsters
                        const selectedMonsterIds = [];
                        selectedMonsters.querySelectorAll('.selected-item').forEach(item => {
                            const monsterId = item.dataset.templateId;
                            const count = parseInt(item.querySelector('.monster-count').value, 10) || 1;
                            
                            for (let i = 0; i < count; i++) {
                                selectedMonsterIds.push(monsterId);
                            }
                        });
                        
                        // Get selected players
                        const selectedPlayerIds = [];
                        playerList.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
                            selectedPlayerIds.push(checkbox.dataset.id);
                        });
                        
                        // Create encounter
                        this.modules.encounter.createEncounter(name, selectedMonsterIds, selectedPlayerIds)
                            .then(() => {
                                // Refresh view
                                this._initEncounterView();
                                
                                // Close modal
                                this.modules.ui.closeModal(modal);
                            })
                            .catch(error => {
                                console.error('Error creating encounter:', error);
                                this.modules.ui.showToast({
                                    message: 'Error creating encounter',
                                    type: 'error'
                                });
                            });
                    }
                }
            ]
        });
    }

    /**
     * Add monster to selected list
     * @private
     * @param {Object} monster - Monster object
     * @param {HTMLElement} container - Container element
     */
    _addMonsterToSelectedList(monster, container) {
        // Check if monster is already in list
        const existingItem = container.querySelector(`.selected-item[data-template-id="${monster.id}"]`);
        
        if (existingItem) {
            // Increment count
            const countInput = existingItem.querySelector('.monster-count');
            countInput.value = parseInt(countInput.value, 10) + 1;
        } else {
            // Create new item
            const item = document.createElement('div');
            item.className = 'selected-item';
            item.dataset.templateId = monster.id;
            
            const name = document.createElement('div');
            name.className = 'monster-name';
            name.textContent = monster.name;
            
            const countContainer = document.createElement('div');
            countContainer.className = 'count-container';
            
            const countLabel = document.createElement('label');
            countLabel.textContent = 'Count:';
            
            const countInput = document.createElement('input');
            countInput.type = 'number';
            countInput.className = 'monster-count';
            countInput.min = 1;
            countInput.value = 1;
            
            const removeButton = document.createElement('button');
            removeButton.className = 'remove-button';
            removeButton.innerHTML = '×';
            removeButton.addEventListener('click', () => {
                container.removeChild(item);
            });
            
            countContainer.appendChild(countLabel);
            countContainer.appendChild(countInput);
            
            item.appendChild(name);
            item.appendChild(countContainer);
            item.appendChild(removeButton);
            
            container.appendChild(item);
        }
    }

    /**
     * Show edit encounter dialog
     * @private
     * @param {Object} encounter - Encounter object
     */
    _showEditEncounterDialog(encounter) {
        // Create content
        const content = document.createElement('div');
        content.className = 'edit-encounter-dialog';
        
        // Create form
        const form = document.createElement('form');
        
        // Create name field
        const nameField = document.createElement('div');
        nameField.className = 'form-field';
        
        const nameLabel = document.createElement('label');
        nameLabel.textContent = 'Encounter Name';
        nameLabel.htmlFor = 'encounter-name';
        
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.id = 'encounter-name';
        nameInput.value = encounter.name;
        
        nameField.appendChild(nameLabel);
        nameField.appendChild(nameInput);
        form.appendChild(nameField);
        
        // Create tabs
        const tabs = document.createElement('div');
        tabs.className = 'tabs';
        
        const monstersTab = document.createElement('div');
        monstersTab.className = 'tab active';
        monstersTab.textContent = 'Monsters';
        monstersTab.dataset.tab = 'monsters';
        
        const playersTab = document.createElement('div');
        playersTab.className = 'tab';
        playersTab.textContent = 'Players';
        playersTab.dataset.tab = 'players';
        
        tabs.appendChild(monstersTab);
        tabs.appendChild(playersTab);
        form.appendChild(tabs);
        
        // Create tab content
        const tabContent = document.createElement('div');
        tabContent.className = 'tab-content';
        
        // Create monsters tab content
        const monstersContent = document.createElement('div');
        monstersContent.className = 'tab-pane active';
        monstersContent.dataset.tab = 'monsters';
        
        // Create monster list
        const monsterList = document.createElement('div');
        monsterList.className = 'monster-list';
        
        // Add monsters to list
        encounter.monsters.forEach(monster => {
            const monsterItem = document.createElement('div');
            monsterItem.className = 'monster-item';
            monsterItem.dataset.id = monster.id;
            
            const monsterName = document.createElement('div');
            monsterName.className = 'monster-name';
            monsterName.textContent = monster.name;
            
            const monsterInfo = document.createElement('div');
            monsterInfo.className = 'monster-info';
            monsterInfo.textContent = `HP: ${monster.hp}/${monster.maxHp || '?'}, AC: ${monster.ac || '?'}`;
            
            const removeButton = document.createElement('button');
            removeButton.className = 'remove-button';
            removeButton.innerHTML = '×';
            removeButton.addEventListener('click', () => {
                monsterList.removeChild(monsterItem);
            });
            
            monsterItem.appendChild(monsterName);
            monsterItem.appendChild(monsterInfo);
            monsterItem.appendChild(removeButton);
            monsterList.appendChild(monsterItem);
        });
        
        monstersContent.appendChild(monsterList);
        
        // Create add monster button
        const addMonsterButton = document.createElement('button');
        addMonsterButton.className = 'button secondary-button';
        addMonsterButton.innerHTML = '<i class="fas fa-plus"></i> Add Monster';
        addMonsterButton.addEventListener('click', () => {
            this._showAddMonsterDialog(monsterList);
        });
        monstersContent.appendChild(addMonsterButton);
        
        // Create players tab content
        const playersContent = document.createElement('div');
        playersContent.className = 'tab-pane';
        playersContent.dataset.tab = 'players';
        
        // Get all players
        const allPlayers = this.modules.roster.getPlayers();
        
        // Create player list
        const playerList = document.createElement('div');
        playerList.className = 'player-list';
        
        // Add players to list
        allPlayers.forEach(player => {
            const playerItem = document.createElement('div');
            playerItem.className = 'player-item';
            playerItem.dataset.id = player.id;
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = encounter.players.some(p => p.id === player.id);
            checkbox.dataset.id = player.id;
            
            const playerName = document.createElement('div');
            playerName.className = 'player-name';
            playerName.textContent = player.name;
            
            const playerInfo = document.createElement('div');
            playerInfo.className = 'player-info';
            playerInfo.textContent = `Level ${player.level || 1} ${player.race || ''} ${player.class || ''}`;
            
            playerItem.appendChild(checkbox);
            playerItem.appendChild(playerName);
            playerItem.appendChild(playerInfo);
            playerList.appendChild(playerItem);
        });
        
        playersContent.appendChild(playerList);
        
        // Add tab content
        tabContent.appendChild(monstersContent);
        tabContent.appendChild(playersContent);
        form.appendChild(tabContent);
        
        // Add tab switching
        tabs.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                // Deactivate all tabs
                tabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                tabContent.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
                
                // Activate this tab
                tab.classList.add('active');
                tabContent.querySelector(`.tab-pane[data-tab="${tab.dataset.tab}"]`).classList.add('active');
            });
        });
        
        content.appendChild(form);
        
        // Show modal
        this.modules.ui.showModal({
            title: 'Edit Encounter',
            content,
            buttons: [
                {
                    text: 'Cancel',
                    className: 'button-secondary',
                    onClick: (modal) => {
                        this.modules.ui.closeModal(modal);
                    }
                },
                {
                    text: 'Save',
                    className: 'button-primary',
                    onClick: (modal) => {
                        // Get encounter name
                        const name = nameInput.value || encounter.name;
                        
                        // Get selected monsters
                        const selectedMonsterIds = [];
                        monsterList.querySelectorAll('.monster-item').forEach(item => {
                            selectedMonsterIds.push(item.dataset.id);
                        });
                        
                        // Get selected players
                        const selectedPlayerIds = [];
                        playerList.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
                            selectedPlayerIds.push(checkbox.dataset.id);
                        });
                        
                        // Update encounter
                        this.modules.encounter.updateEncounter(encounter.id, {
                            name,
                            monsterIds: selectedMonsterIds,
                            playerIds: selectedPlayerIds
                        })
                            .then(() => {
                                // Refresh view
                                this._initEncounterView();
                                
                                // Close modal
                                this.modules.ui.closeModal(modal);
                            })
                            .catch(error => {
                                console.error('Error updating encounter:', error);
                                this.modules.ui.showToast({
                                    message: 'Error updating encounter',
                                    type: 'error'
                                });
                            });
                    }
                }
            ]
        });
    }

    /**
     * Show add monster dialog
     * @private
     * @param {HTMLElement} container - Container element
     */
    _showAddMonsterDialog(container) {
        // Get monster templates
        const monsterTemplates = this.modules.roster.getMonsterTemplates();
        
        // Create content
        const content = document.createElement('div');
        content.className = 'add-monster-dialog';
        
        // Create monster search
        const monsterSearch = document.createElement('input');
        monsterSearch.type = 'text';
        monsterSearch.placeholder = 'Search monsters...';
        monsterSearch.className = 'monster-search';
        
        content.appendChild(monsterSearch);
        
        // Create monster list
        const monsterList = document.createElement('div');
        monsterList.className = 'monster-list';
        
        // Add monsters to list
        monsterTemplates.forEach(monster => {
            const monsterItem = document.createElement('div');
            monsterItem.className = 'monster-item';
            monsterItem.dataset.id = monster.id;
            
            const monsterName = document.createElement('div');
            monsterName.className = 'monster-name';
            monsterName.textContent = monster.name;
            
            const monsterInfo = document.createElement('div');
            monsterInfo.className = 'monster-info';
            monsterInfo.textContent = `CR ${monster.cr || '?'}, HP ${monster.maxHp || '?'}`;
            
            monsterItem.appendChild(monsterName);
            monsterItem.appendChild(monsterInfo);
            monsterList.appendChild(monsterItem);
            
            // Add click event
            monsterItem.addEventListener('click', () => {
                // Create monster from template
                this.modules.roster.createMonsterFromTemplate(monster.id)
                    .then(newMonster => {
                        // Add monster to container
                        const newMonsterItem = document.createElement('div');
                        newMonsterItem.className = 'monster-item';
                        newMonsterItem.dataset.id = newMonster.id;
                        
                        const newMonsterName = document.createElement('div');
                        newMonsterName.className = 'monster-name';
                        newMonsterName.textContent = newMonster.name;
                        
                        const newMonsterInfo = document.createElement('div');
                        newMonsterInfo.className = 'monster-info';
                        newMonsterInfo.textContent = `HP: ${newMonster.hp}/${newMonster.maxHp || '?'}, AC: ${newMonster.ac || '?'}`;
                        
                        const removeButton = document.createElement('button');
                        removeButton.className = 'remove-button';
                        removeButton.innerHTML = '×';
                        removeButton.addEventListener('click', () => {
                            container.removeChild(newMonsterItem);
                        });
                        
                        newMonsterItem.appendChild(newMonsterName);
                        newMonsterItem.appendChild(newMonsterInfo);
                        newMonsterItem.appendChild(removeButton);
                        container.appendChild(newMonsterItem);
                        
                        // Close modal
                        this.modules.ui.closeModal();
                    })
                    .catch(error => {
                        console.error('Error creating monster:', error);
                        this.modules.ui.showToast({
                            message: 'Error creating monster',
                            type: 'error'
                        });
                    });
            });
        });
        
        content.appendChild(monsterList);
        
        // Add search functionality
        monsterSearch.addEventListener('input', () => {
            const query = monsterSearch.value.toLowerCase();
            
            // Filter monsters
            monsterList.querySelectorAll('.monster-item').forEach(item => {
                const name = item.querySelector('.monster-name').textContent.toLowerCase();
                item.style.display = name.includes(query) ? '' : 'none';
            });
        });
        
        // Show modal
        this.modules.ui.showModal({
            title: 'Add Monster',
            content,
            buttons: [
                {
                    text: 'Cancel',
                    className: 'button-secondary',
                    onClick: (modal) => {
                        this.modules.ui.closeModal(modal);
                    }
                }
            ]
        });
    }

    /**
     * Show delete encounter dialog
     * @private
     * @param {Object} encounter - Encounter object
     */
    _showDeleteEncounterDialog(encounter) {
        this.modules.ui.showConfirmation({
            title: 'Delete Encounter',
            message: `Are you sure you want to delete "${encounter.name}"?`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            onConfirm: () => {
                this.modules.encounter.deleteEncounter(encounter.id)
                    .then(() => {
                        // Refresh view
                        this._initEncounterView();
                    })
                    .catch(error => {
                        console.error('Error deleting encounter:', error);
                        this.modules.ui.showToast({
                            message: 'Error deleting encounter',
                            type: 'error'
                        });
                    });
            }
        });
    }

    /**
     * Initialize roster view
     * @private
     */
    _initRosterView() {
        console.log('Initializing roster view');
        
        // Get roster view elements
        const rosterView = document.getElementById('roster-view');
        const tabs = rosterView.querySelector('.roster-tabs');
        const tabContent = rosterView.querySelector('.roster-tab-content');
        
        // Clear tabs
        tabs.innerHTML = '';
        
        // Clear tab content
        tabContent.innerHTML = '';
        
        // Create tabs
        const playersTab = document.createElement('div');
        playersTab.className = 'tab active';
        playersTab.textContent = 'Players';
        playersTab.dataset.tab = 'players';
        
        const monstersTab = document.createElement('div');
        monstersTab.className = 'tab';
        monstersTab.textContent = 'Monsters';
        monstersTab.dataset.tab = 'monsters';
        
        const templatesTab = document.createElement('div');
        templatesTab.className = 'tab';
        templatesTab.textContent = 'Templates';
        templatesTab.dataset.tab = 'templates';
        
        const partiesTab = document.createElement('div');
        partiesTab.className = 'tab';
        partiesTab.textContent = 'Parties';
        partiesTab.dataset.tab = 'parties';
        
        tabs.appendChild(playersTab);
        tabs.appendChild(monstersTab);
        tabs.appendChild(templatesTab);
        tabs.appendChild(partiesTab);
        
        // Create tab content
        const playersContent = document.createElement('div');
        playersContent.className = 'tab-pane active';
        playersContent.dataset.tab = 'players';
        
        const monstersContent = document.createElement('div');
        monstersContent.className = 'tab-pane';
        monstersContent.dataset.tab = 'monsters';
        
        const templatesContent = document.createElement('div');
        templatesContent.className = 'tab-pane';
        templatesContent.dataset.tab = 'templates';
        
        const partiesContent = document.createElement('div');
        partiesContent.className = 'tab-pane';
        partiesContent.dataset.tab = 'parties';
        
        // Initialize players tab
        this._initPlayersTab(playersContent);
        
        // Initialize monsters tab
        this._initMonstersTab(monstersContent);
        
        // Initialize templates tab
        this._initTemplatesTab(templatesContent);
        
        // Initialize parties tab
        this._initPartiesTab(partiesContent);
        
        // Add tab content
        tabContent.appendChild(playersContent);
        tabContent.appendChild(monstersContent);
        tabContent.appendChild(templatesContent);
        tabContent.appendChild(partiesContent);
        
        // Add tab switching
        tabs.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                // Deactivate all tabs
                tabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                tabContent.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
                
                // Activate this tab
                tab.classList.add('active');
                tabContent.querySelector(`.tab-pane[data-tab="${tab.dataset.tab}"]`).classList.add('active');
            });
        });
    }

    /**
     * Initialize players tab
     * @private
     * @param {HTMLElement} container - Container element
     */
    _initPlayersTab(container) {
        // Get players
        const players = this.modules.roster.getPlayers();
        
        // Create player list
        const playerList = document.createElement('div');
        playerList.className = 'player-list';
        
        // Add players to list
        players.forEach(player => {
            const playerItem = document.createElement('div');
            playerItem.className = 'player-item';
            playerItem.dataset.id = player.id;
            
            const playerName = document.createElement('div');
            playerName.className = 'player-name';
            playerName.textContent = player.name;
            
            const playerInfo = document.createElement('div');
            playerInfo.className = 'player-info';
            playerInfo.textContent = `Level ${player.level || 1} ${player.race || ''} ${player.class || ''}`;
            
            const playerActions = document.createElement('div');
            playerActions.className = 'player-actions';
            
            const editButton = document.createElement('button');
            editButton.className = 'edit-button';
            editButton.innerHTML = '<i class="fas fa-edit"></i>';
            editButton.addEventListener('click', () => {
                this._showEditPlayerDialog(player);
            });
            
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-button';
            deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
            deleteButton.addEventListener('click', () => {
                this._showDeletePlayerDialog(player);
            });
            
            playerActions.appendChild(editButton);
            playerActions.appendChild(deleteButton);
            
            playerItem.appendChild(playerName);
            playerItem.appendChild(playerInfo);
            playerItem.appendChild(playerActions);
            playerList.appendChild(playerItem);
        });
        
        container.appendChild(playerList);
        
        // Create add player button
        const addPlayerButton = document.createElement('button');
        addPlayerButton.className = 'button primary-button add-player-button';
        addPlayerButton.innerHTML = '<i class="fas fa-plus"></i> Add Player';
        addPlayerButton.addEventListener('click', () => {
            this._showAddPlayerDialog();
        });
        container.appendChild(addPlayerButton);
    }

    /**
     * Initialize monsters tab
     * @private
     * @param {HTMLElement} container - Container element
     */
    _initMonstersTab(container) {
        // Get monsters
        const monsters = this.modules.roster.getMonsters();
        
        // Create monster list
        const monsterList = document.createElement('div');
        monsterList.className = 'monster-list';
        
        // Add monsters to list
        monsters.forEach(monster => {
            const monsterItem = document.createElement('div');
            monsterItem.className = 'monster-item';
            monsterItem.dataset.id = monster.id;
            
            const monsterName = document.createElement('div');
            monsterName.className = 'monster-name';
            monsterName.textContent = monster.name;
            
            const monsterInfo = document.createElement('div');
            monsterInfo.className = 'monster-info';
            monsterInfo.textContent = `HP: ${monster.hp}/${monster.maxHp || '?'}, AC: ${monster.ac || '?'}`;
            
            const monsterActions = document.createElement('div');
            monsterActions.className = 'monster-actions';
            
            const editButton = document.createElement('button');
            editButton.className = 'edit-button';
            editButton.innerHTML = '<i class="fas fa-edit"></i>';
            editButton.addEventListener('click', () => {
                this._showEditMonsterDialog(monster);
            });
            
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-button';
            deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
            deleteButton.addEventListener('click', () => {
                this._showDeleteMonsterDialog(monster);
            });
            
            monsterActions.appendChild(editButton);
            monsterActions.appendChild(deleteButton);
            
            monsterItem.appendChild(monsterName);
            monsterItem.appendChild(monsterInfo);
            monsterItem.appendChild(monsterActions);
            monsterList.appendChild(monsterItem);
        });
        
        container.appendChild(monsterList);
        
        // Create add monster button
        const addMonsterButton = document.createElement('button');
        addMonsterButton.className = 'button primary-button add-monster-button';
        addMonsterButton.innerHTML = '<i class="fas fa-plus"></i> Add Monster';
        addMonsterButton.addEventListener('click', () => {
            this._showAddMonsterFromTemplateDialog();
        });
        container.appendChild(addMonsterButton);
    }

    /**
     * Initialize templates tab
     * @private
     * @param {HTMLElement} container - Container element
     */
    _initTemplatesTab(container) {
        // Get monster templates
        const templates = this.modules.roster.getMonsterTemplates();
        
        // Create template list
        const templateList = document.createElement('div');
        templateList.className = 'template-list';
        
        // Add templates to list
        templates.forEach(template => {
            const templateItem = document.createElement('div');
            templateItem.className = 'template-item';
            templateItem.dataset.id = template.id;
            
            const templateName = document.createElement('div');
            templateName.className = 'template-name';
            templateName.textContent = template.name;
            
            const templateInfo = document.createElement('div');
            templateInfo.className = 'template-info';
            templateInfo.textContent = `CR ${template.cr || '?'}, HP ${template.maxHp || '?'}`;
            
            const templateActions = document.createElement('div');
            templateActions.className = 'template-actions';
            
            const editButton = document.createElement('button');
            editButton.className = 'edit-button';
            editButton.innerHTML = '<i class="fas fa-edit"></i>';
            editButton.addEventListener('click', () => {
                this._showEditTemplateDialog(template);
            });
            
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-button';
            deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
            deleteButton.addEventListener('click', () => {
                this._showDeleteTemplateDialog(template);
            });
            
            templateActions.appendChild(editButton);
            templateActions.appendChild(deleteButton);
            
            templateItem.appendChild(templateName);
            templateItem.appendChild(templateInfo);
            templateItem.appendChild(templateActions);
            templateList.appendChild(templateItem);
        });
        
        container.appendChild(templateList);
        
                // Create add template button
        const addTemplateButton = document.createElement('button');
        addTemplateButton.className = 'button primary-button add-template-button';
        addTemplateButton.innerHTML = '<i class="fas fa-plus"></i> Add Template';
        addTemplateButton.addEventListener('click', () => {
            this._showAddTemplateDialog();
        });
        container.appendChild(addTemplateButton);
        
        // Create import button
        const importButton = document.createElement('button');
        importButton.className = 'button secondary-button import-button';
        importButton.innerHTML = '<i class="fas fa-file-import"></i> Import';
        importButton.addEventListener('click', () => {
            this._showImportTemplateDialog();
        });
        container.appendChild(importButton);
    }

    /**
     * Initialize parties tab
     * @private
     * @param {HTMLElement} container - Container element
     */
    _initPartiesTab(container) {
        // Get parties
        const parties = this.modules.roster.getParties();
        
        // Create party list
        const partyList = document.createElement('div');
        partyList.className = 'party-list';
        
        // Add parties to list
        parties.forEach(party => {
            const partyItem = document.createElement('div');
            partyItem.className = 'party-item';
            partyItem.dataset.id = party.id;
            
            const partyName = document.createElement('div');
            partyName.className = 'party-name';
            partyName.textContent = party.name;
            
            const partyInfo = document.createElement('div');
            partyInfo.className = 'party-info';
            partyInfo.textContent = `${party.players.length} players, Avg Level ${party.averageLevel || 1}`;
            
            const partyActions = document.createElement('div');
            partyActions.className = 'party-actions';
            
            const editButton = document.createElement('button');
            editButton.className = 'edit-button';
            editButton.innerHTML = '<i class="fas fa-edit"></i>';
            editButton.addEventListener('click', () => {
                this._showEditPartyDialog(party);
            });
            
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-button';
            deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
            deleteButton.addEventListener('click', () => {
                this._showDeletePartyDialog(party);
            });
            
            partyActions.appendChild(editButton);
            partyActions.appendChild(deleteButton);
            
            partyItem.appendChild(partyName);
            partyItem.appendChild(partyInfo);
            partyItem.appendChild(partyActions);
            partyList.appendChild(partyItem);
        });
        
        container.appendChild(partyList);
        
        // Create add party button
        const addPartyButton = document.createElement('button');
        addPartyButton.className = 'button primary-button add-party-button';
        addPartyButton.innerHTML = '<i class="fas fa-plus"></i> Add Party';
        addPartyButton.addEventListener('click', () => {
            this._showAddPartyDialog();
        });
        container.appendChild(addPartyButton);
    }

    /**
     * Show add player dialog
     * @private
     */
    _showAddPlayerDialog() {
        // Create form fields
        const fields = [
            {
                name: 'name',
                label: 'Name',
                type: 'text',
                required: true
            },
            {
                name: 'race',
                label: 'Race',
                type: 'text'
            },
            {
                name: 'class',
                label: 'Class',
                type: 'text'
            },
            {
                name: 'level',
                label: 'Level',
                type: 'number',
                min: 1,
                max: 20,
                value: 1
            },
            {
                name: 'hp',
                label: 'HP',
                type: 'number',
                min: 1,
                value: 10
            },
            {
                name: 'ac',
                label: 'AC',
                type: 'number',
                min: 1,
                value: 10
            },
            {
                name: 'initiativeModifier',
                label: 'Initiative Modifier',
                type: 'number',
                value: 0
            }
        ];
        
        // Create form
        const form = this.modules.ui.createForm(document.createElement('div'), fields, {
            submitText: 'Add Player',
            onSubmit: (data) => {
                // Create player
                this.modules.roster.addPlayer(data)
                    .then(() => {
                        // Refresh view
                        this._initRosterView();
                        
                        // Close modal
                        this.modules.ui.closeAllModals();
                        
                        // Show success message
                        this.modules.ui.showToast({
                            message: 'Player added successfully',
                            type: 'success'
                        });
                    })
                    .catch(error => {
                        console.error('Error adding player:', error);
                        this.modules.ui.showToast({
                            message: 'Error adding player',
                            type: 'error'
                        });
                    });
            }
        });
        
        // Show modal
        this.modules.ui.showModal({
            title: 'Add Player',
            content: form.form,
            size: 'medium'
        });
    }

    /**
     * Show edit player dialog
     * @private
     * @param {Object} player - Player object
     */
    _showEditPlayerDialog(player) {
        // Create form fields
        const fields = [
            {
                name: 'name',
                label: 'Name',
                type: 'text',
                required: true,
                value: player.name
            },
            {
                name: 'race',
                label: 'Race',
                type: 'text',
                value: player.race || ''
            },
            {
                name: 'class',
                label: 'Class',
                type: 'text',
                value: player.class || ''
            },
            {
                name: 'level',
                label: 'Level',
                type: 'number',
                min: 1,
                max: 20,
                value: player.level || 1
            },
            {
                name: 'hp',
                label: 'HP',
                type: 'number',
                min: 0,
                value: player.hp || 0
            },
            {
                name: 'maxHp',
                label: 'Max HP',
                type: 'number',
                min: 1,
                value: player.maxHp || 10
            },
            {
                name: 'ac',
                label: 'AC',
                type: 'number',
                min: 1,
                value: player.ac || 10
            },
            {
                name: 'initiativeModifier',
                label: 'Initiative Modifier',
                type: 'number',
                value: player.initiativeModifier || 0
            }
        ];
        
        // Create form
        const form = this.modules.ui.createForm(document.createElement('div'), fields, {
            submitText: 'Save Player',
            onSubmit: (data) => {
                // Update player
                this.modules.roster.updatePlayer(player.id, data)
                    .then(() => {
                        // Refresh view
                        this._initRosterView();
                        
                        // Close modal
                        this.modules.ui.closeAllModals();
                        
                        // Show success message
                        this.modules.ui.showToast({
                            message: 'Player updated successfully',
                            type: 'success'
                        });
                    })
                    .catch(error => {
                        console.error('Error updating player:', error);
                        this.modules.ui.showToast({
                            message: 'Error updating player',
                            type: 'error'
                        });
                    });
            }
        });
        
        // Show modal
        this.modules.ui.showModal({
            title: 'Edit Player',
            content: form.form,
            size: 'medium'
        });
    }

    /**
     * Show delete player dialog
     * @private
     * @param {Object} player - Player object
     */
    _showDeletePlayerDialog(player) {
        this.modules.ui.showConfirmation({
            title: 'Delete Player',
            message: `Are you sure you want to delete "${player.name}"?`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            onConfirm: () => {
                this.modules.roster.removePlayer(player.id)
                    .then(() => {
                        // Refresh view
                        this._initRosterView();
                        
                        // Show success message
                        this.modules.ui.showToast({
                            message: 'Player deleted successfully',
                            type: 'success'
                        });
                    })
                    .catch(error => {
                        console.error('Error deleting player:', error);
                        this.modules.ui.showToast({
                            message: 'Error deleting player',
                            type: 'error'
                        });
                    });
            }
        });
    }

    /**
     * Show add monster from template dialog
     * @private
     */
    _showAddMonsterFromTemplateDialog() {
        // Get monster templates
        const templates = this.modules.roster.getMonsterTemplates();
        
        // Create content
        const content = document.createElement('div');
        content.className = 'add-monster-dialog';
        
        // Create monster search
        const monsterSearch = document.createElement('input');
        monsterSearch.type = 'text';
        monsterSearch.placeholder = 'Search templates...';
        monsterSearch.className = 'monster-search';
        
        content.appendChild(monsterSearch);
        
        // Create monster list
        const monsterList = document.createElement('div');
        monsterList.className = 'monster-list';
        
        // Add monsters to list
        templates.forEach(template => {
            const monsterItem = document.createElement('div');
            monsterItem.className = 'monster-item';
            monsterItem.dataset.id = template.id;
            
            const monsterName = document.createElement('div');
            monsterName.className = 'monster-name';
            monsterName.textContent = template.name;
            
            const monsterInfo = document.createElement('div');
            monsterInfo.className = 'monster-info';
            monsterInfo.textContent = `CR ${template.cr || '?'}, HP ${template.maxHp || '?'}`;
            
            monsterItem.appendChild(monsterName);
            monsterItem.appendChild(monsterInfo);
            monsterList.appendChild(monsterItem);
            
            // Add click event
            monsterItem.addEventListener('click', () => {
                // Show count dialog
                this._showMonsterCountDialog(template);
            });
        });
        
        content.appendChild(monsterList);
        
        // Add search functionality
        monsterSearch.addEventListener('input', () => {
            const query = monsterSearch.value.toLowerCase();
            
            // Filter monsters
            monsterList.querySelectorAll('.monster-item').forEach(item => {
                const name = item.querySelector('.monster-name').textContent.toLowerCase();
                item.style.display = name.includes(query) ? '' : 'none';
            });
        });
        
        // Show modal
        this.modules.ui.showModal({
            title: 'Add Monster',
            content,
            buttons: [
                {
                    text: 'Cancel',
                    className: 'button-secondary',
                    onClick: (modal) => {
                        this.modules.ui.closeModal(modal);
                    }
                }
            ]
        });
    }

    /**
     * Show monster count dialog
     * @private
     * @param {Object} template - Monster template
     */
    _showMonsterCountDialog(template) {
        // Create content
        const content = document.createElement('div');
        content.className = 'monster-count-dialog';
        
        // Create count field
        const countField = document.createElement('div');
        countField.className = 'form-field';
        
        const countLabel = document.createElement('label');
        countLabel.textContent = 'Number of Monsters';
        countLabel.htmlFor = 'monster-count';
        
        const countInput = document.createElement('input');
        countInput.type = 'number';
        countInput.id = 'monster-count';
        countInput.min = 1;
        countInput.value = 1;
        
        countField.appendChild(countLabel);
        countField.appendChild(countInput);
        content.appendChild(countField);
        
        // Show modal
        this.modules.ui.showModal({
            title: `Add ${template.name}`,
            content,
            buttons: [
                {
                    text: 'Cancel',
                    className: 'button-secondary',
                    onClick: (modal) => {
                        this.modules.ui.closeModal(modal);
                    }
                },
                {
                    text: 'Add',
                    className: 'button-primary',
                    onClick: (modal) => {
                        // Get count
                        const count = parseInt(countInput.value, 10) || 1;
                        
                        // Create monsters
                        this.modules.roster.createMultipleMonsters(template.id, count)
                            .then(() => {
                                // Refresh view
                                this._initRosterView();
                                
                                // Close all modals
                                this.modules.ui.closeAllModals();
                                
                                // Show success message
                                this.modules.ui.showToast({
                                    message: `${count} monster(s) added successfully`,
                                    type: 'success'
                                });
                            })
                            .catch(error => {
                                console.error('Error creating monsters:', error);
                                this.modules.ui.showToast({
                                    message: 'Error creating monsters',
                                    type: 'error'
                                });
                            });
                    }
                }
            ]
        });
    }

    /**
     * Show edit monster dialog
     * @private
     * @param {Object} monster - Monster object
     */
    _showEditMonsterDialog(monster) {
        // Create form fields
        const fields = [
            {
                name: 'name',
                label: 'Name',
                type: 'text',
                required: true,
                value: monster.name
            },
            {
                name: 'hp',
                label: 'HP',
                type: 'number',
                min: 0,
                value: monster.hp || 0
            },
            {
                name: 'maxHp',
                label: 'Max HP',
                type: 'number',
                min: 1,
                value: monster.maxHp || 10
            },
            {
                name: 'ac',
                label: 'AC',
                type: 'number',
                min: 1,
                value: monster.ac || 10
            },
            {
                name: 'initiativeModifier',
                label: 'Initiative Modifier',
                type: 'number',
                value: monster.initiativeModifier || 0
            }
        ];
        
        // Create form
        const form = this.modules.ui.createForm(document.createElement('div'), fields, {
            submitText: 'Save Monster',
            onSubmit: (data) => {
                // Update monster
                this.modules.roster.updateMonster(monster.id, data)
                    .then(() => {
                        // Refresh view
                        this._initRosterView();
                        
                        // Close modal
                        this.modules.ui.closeAllModals();
                        
                        // Show success message
                        this.modules.ui.showToast({
                            message: 'Monster updated successfully',
                            type: 'success'
                        });
                    })
                    .catch(error => {
                        console.error('Error updating monster:', error);
                        this.modules.ui.showToast({
                            message: 'Error updating monster',
                            type: 'error'
                        });
                    });
            }
        });
        
        // Show modal
        this.modules.ui.showModal({
            title: 'Edit Monster',
            content: form.form,
            size: 'medium'
        });
    }

    /**
     * Show delete monster dialog
     * @private
     * @param {Object} monster - Monster object
     */
    _showDeleteMonsterDialog(monster) {
        this.modules.ui.showConfirmation({
            title: 'Delete Monster',
            message: `Are you sure you want to delete "${monster.name}"?`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            onConfirm: () => {
                this.modules.roster.removeMonster(monster.id)
                    .then(() => {
                        // Refresh view
                        this._initRosterView();
                        
                        // Show success message
                        this.modules.ui.showToast({
                            message: 'Monster deleted successfully',
                            type: 'success'
                        });
                    })
                    .catch(error => {
                        console.error('Error deleting monster:', error);
                        this.modules.ui.showToast({
                            message: 'Error deleting monster',
                            type: 'error'
                        });
                    });
            }
        });
    }

    /**
     * Show add template dialog
     * @private
     */
    _showAddTemplateDialog() {
        // Create form fields
        const fields = [
            {
                name: 'name',
                label: 'Name',
                type: 'text',
                required: true
            },
            {
                name: 'cr',
                label: 'Challenge Rating',
                type: 'text',
                value: '1'
            },
            {
                name: 'maxHp',
                label: 'HP',
                type: 'number',
                min: 1,
                value: 10
            },
            {
                name: 'ac',
                label: 'AC',
                type: 'number',
                min: 1,
                value: 10
            },
            {
                name: 'initiativeModifier',
                label: 'Initiative Modifier',
                type: 'number',
                value: 0
            },
            {
                name: 'size',
                label: 'Size',
                type: 'select',
                options: [
                    { value: 'Tiny', label: 'Tiny' },
                    { value: 'Small', label: 'Small' },
                    { value: 'Medium', label: 'Medium' },
                    { value: 'Large', label: 'Large' },
                    { value: 'Huge', label: 'Huge' },
                    { value: 'Gargantuan', label: 'Gargantuan' }
                ],
                value: 'Medium'
            },
            {
                name: 'monsterType',
                label: 'Type',
                type: 'text',
                value: 'Humanoid'
            }
        ];
        
        // Create form
        const form = this.modules.ui.createForm(document.createElement('div'), fields, {
            submitText: 'Add Template',
            onSubmit: (data) => {
                // Create template
                this.modules.roster.addMonsterTemplate(data)
                    .then(() => {
                        // Refresh view
                        this._initRosterView();
                        
                        // Close modal
                        this.modules.ui.closeAllModals();
                        
                        // Show success message
                        this.modules.ui.showToast({
                            message: 'Template added successfully',
                            type: 'success'
                        });
                    })
                    .catch(error => {
                        console.error('Error adding template:', error);
                        this.modules.ui.showToast({
                            message: 'Error adding template',
                            type: 'error'
                        });
                    });
            }
        });
        
        // Show modal
        this.modules.ui.showModal({
            title: 'Add Monster Template',
            content: form.form,
            size: 'medium'
        });
    }

    /**
     * Show edit template dialog
     * @private
     * @param {Object} template - Template object
     */
    _showEditTemplateDialog(template) {
        // Create form fields
        const fields = [
            {
                name: 'name',
                label: 'Name',
                type: 'text',
                required: true,
                value: template.name
            },
            {
                name: 'cr',
                label: 'Challenge Rating',
                type: 'text',
                value: template.cr || '1'
            },
            {
                name: 'maxHp',
                label: 'HP',
                type: 'number',
                min: 1,
                value: template.maxHp || 10
            },
            {
                name: 'ac',
                label: 'AC',
                type: 'number',
                min: 1,
                value: template.ac || 10
            },
            {
                name: 'initiativeModifier',
                label: 'Initiative Modifier',
                type: 'number',
                value: template.initiativeModifier || 0
            },
            {
                name: 'size',
                label: 'Size',
                type: 'select',
                options: [
                    { value: 'Tiny', label: 'Tiny' },
                    { value: 'Small', label: 'Small' },
                    { value: 'Medium', label: 'Medium' },
                    { value: 'Large', label: 'Large' },
                    { value: 'Huge', label: 'Huge' },
                    { value: 'Gargantuan', label: 'Gargantuan' }
                ],
                value: template.size || 'Medium'
            },
            {
                name: 'monsterType',
                label: 'Type',
                type: 'text',
                value: template.monsterType || 'Humanoid'
            }
        ];
        
        // Create form
        const form = this.modules.ui.createForm(document.createElement('div'), fields, {
            submitText: 'Save Template',
            onSubmit: (data) => {
                // Update template
                this.modules.roster.updateMonsterTemplate(template.id, data)
                    .then(() => {
                        // Refresh view
                        this._initRosterView();
                        
                        // Close modal
                        this.modules.ui.closeAllModals();
                        
                        // Show success message
                        this.modules.ui.showToast({
                            message: 'Template updated successfully',
                            type: 'success'
                        });
                    })
                    .catch(error => {
                        console.error('Error updating template:', error);
                        this.modules.ui.showToast({
                            message: 'Error updating template',
                            type: 'error'
                        });
                    });
            }
        });
        
        // Show modal
        this.modules.ui.showModal({
            title: 'Edit Monster Template',
            content: form.form,
            size: 'medium'
        });
    }

    /**
     * Show delete template dialog
     * @private
     * @param {Object} template - Template object
     */
    _showDeleteTemplateDialog(template) {
        this.modules.ui.showConfirmation({
            title: 'Delete Template',
            message: `Are you sure you want to delete "${template.name}"?`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            onConfirm: () => {
                this.modules.roster.removeMonsterTemplate(template.id)
                    .then(() => {
                        // Refresh view
                        this._initRosterView();
                        
                        // Show success message
                        this.modules.ui.showToast({
                            message: 'Template deleted successfully',
                            type: 'success'
                        });
                    })
                    .catch(error => {
                        console.error('Error deleting template:', error);
                        this.modules.ui.showToast({
                            message: 'Error deleting template',
                            type: 'error'
                        });
                    });
            }
        });
    }

    /**
     * Show import template dialog
     * @private
     */
    _showImportTemplateDialog() {
        // Create content
        const content = document.createElement('div');
        content.className = 'import-template-dialog';
        
        // Create tabs
        const tabs = document.createElement('div');
        tabs.className = 'tabs';
        
        const apiTab = document.createElement('div');
        apiTab.className = 'tab active';
        apiTab.textContent = 'API';
        apiTab.dataset.tab = 'api';
        
        const jsonTab = document.createElement('div');
        jsonTab.className = 'tab';
        jsonTab.textContent = 'JSON';
        jsonTab.dataset.tab = 'json';
        
        tabs.appendChild(apiTab);
        tabs.appendChild(jsonTab);
        content.appendChild(tabs);
        
        // Create tab content
        const tabContent = document.createElement('div');
        tabContent.className = 'tab-content';
        
        // Create API tab content
        const apiContent = document.createElement('div');
        apiContent.className = 'tab-pane active';
        apiContent.dataset.tab = 'api';
        
        // Create search field
        const searchField = document.createElement('div');
        searchField.className = 'form-field';
        
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search monsters...';
        searchInput.className = 'api-search';
        
        const searchButton = document.createElement('button');
        searchButton.className = 'button primary-button';
        searchButton.textContent = 'Search';
        
        searchField.appendChild(searchInput);
        searchField.appendChild(searchButton);
        apiContent.appendChild(searchField);
        
        // Create results container
        const resultsContainer = document.createElement('div');
        resultsContainer.className = 'api-results';
        apiContent.appendChild(resultsContainer);
        
        // Add search functionality
        searchButton.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (!query) return;
            
            // Show loading
            resultsContainer.innerHTML = '<div class="loading">Searching...</div>';
            
            // Search monsters
            this.modules.api.searchMonsters(query)
                .then(results => {
                    // Clear results
                    resultsContainer.innerHTML = '';
                    
                    if (results.length === 0) {
                        resultsContainer.innerHTML = '<div class="no-results">No monsters found</div>';
                        return;
                    }
                    
                    // Create results list
                    const resultsList = document.createElement('div');
                    resultsList.className = 'results-list';
                    
                    // Add results
                    results.forEach(result => {
                        const resultItem = document.createElement('div');
                        resultItem.className = 'result-item';
                        resultItem.textContent = result.name;
                        
                        // Add click event
                        resultItem.addEventListener('click', () => {
                            // Show loading
                            resultItem.innerHTML = '<div class="loading">Loading...</div>';
                            
                            // Get monster
                            this.modules.api.getMonster(result.index)
                                .then(monster => {
                                    // Add monster template
                                    this.modules.roster.addMonsterTemplate(monster)
                                        .then(() => {
                                            // Refresh view
                                            this._initRosterView();
                                            
                                            // Close modal
                                            this.modules.ui.closeAllModals();
                                            
                                            // Show success message
                                            this.modules.ui.showToast({
                                                message: `${monster.name} imported successfully`,
                                                type: 'success'
                                            });
                                        })
                                        .catch(error => {
                                            console.error('Error adding monster template:', error);
                                            this.modules.ui.showToast({
                                                message: 'Error adding monster template',
                                                type: 'error'
                                            });
                                        });
                                })
                                .catch(error => {
                                    console.error('Error getting monster:', error);
                                    this.modules.ui.showToast({
                                        message: 'Error getting monster',
                                        type: 'error'
                                    });
                                });
                        });
                        
                        resultsList.appendChild(resultItem);
                    });
                    
                    resultsContainer.appendChild(resultsList);
                })
                .catch(error => {
                    console.error('Error searching monsters:', error);
                    resultsContainer.innerHTML = '<div class="error">Error searching monsters</div>';
                });
        });
        
        // Create JSON tab content
        const jsonContent = document.createElement('div');
        jsonContent.className = 'tab-pane';
        jsonContent.dataset.tab = 'json';
        
        // Create JSON field
        const jsonField = document.createElement('div');
        jsonField.className = 'form-field';
        
        const jsonLabel = document.createElement('label');
        jsonLabel.textContent = 'Paste JSON';
        
        const jsonTextarea = document.createElement('textarea');
        jsonTextarea.rows = 10;
        jsonTextarea.placeholder = '{"name": "Monster Name", "cr": "1", "maxHp": 10, ...}';
        
        jsonField.appendChild(jsonLabel);
        jsonField.appendChild(jsonTextarea);
        jsonContent.appendChild(jsonField);
        
        // Create import button
        const importJsonButton = document.createElement('button');
        importJsonButton.className = 'button primary-button';
        importJsonButton.textContent = 'Import';
        importJsonButton.addEventListener('click', () => {
            try {
                // Parse JSON
                const json = JSON.parse(jsonTextarea.value);
                
                // Add monster template
                this.modules.roster.addMonsterTemplate(json)
                    .then(() => {
                        // Refresh view
                        this._initRosterView();
                        
                        // Close modal
                        this.modules.ui.closeAllModals();
                        
                        // Show success message
                        this.modules.ui.showToast({
                            message: `${json.name} imported successfully`,
                            type: 'success'
                        });
                    })
                    .catch(error => {
                        console.error('Error adding monster template:', error);
                        this.modules.ui.showToast({
                            message: 'Error adding monster template',
                            type: 'error'
                        });
                    });
            } catch (error) {
                console.error('Error parsing JSON:', error);
                this.modules.ui.showToast({
                    message: 'Invalid JSON',
                    type: 'error'
                });
            }
        });
        
        jsonContent.appendChild(importJsonButton);
        
        // Add tab content
        tabContent.appendChild(apiContent);
        tabContent.appendChild(jsonContent);
        content.appendChild(tabContent);
        
                // Add tab switching
        tabs.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                // Deactivate all tabs
                tabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                tabContent.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
                
                // Activate this tab
                tab.classList.add('active');
                tabContent.querySelector(`.tab-pane[data-tab="${tab.dataset.tab}"]`).classList.add('active');
            });
        });
        
        // Show modal
        this.modules.ui.showModal({
            title: 'Import Monster Template',
            content,
            size: 'large',
            buttons: [
                {
                    text: 'Cancel',
                    className: 'button-secondary',
                    onClick: (modal) => {
                        this.modules.ui.closeModal(modal);
                    }
                }
            ]
        });
    }

    /**
     * Show add party dialog
     * @private
     */
    _showAddPartyDialog() {
        // Get players
        const players = this.modules.roster.getPlayers();
        
        // Create content
        const content = document.createElement('div');
        content.className = 'add-party-dialog';
        
        // Create name field
        const nameField = document.createElement('div');
        nameField.className = 'form-field';
        
        const nameLabel = document.createElement('label');
        nameLabel.textContent = 'Party Name';
        nameLabel.htmlFor = 'party-name';
        
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.id = 'party-name';
        nameInput.value = 'New Party';
        
        nameField.appendChild(nameLabel);
        nameField.appendChild(nameInput);
        content.appendChild(nameField);
        
        // Create player list
        const playerList = document.createElement('div');
        playerList.className = 'player-list';
        
        // Add players to list
        players.forEach(player => {
            const playerItem = document.createElement('div');
            playerItem.className = 'player-item';
            playerItem.dataset.id = player.id;
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = true;
            checkbox.dataset.id = player.id;
            
            const playerName = document.createElement('div');
            playerName.className = 'player-name';
            playerName.textContent = player.name;
            
            const playerInfo = document.createElement('div');
            playerInfo.className = 'player-info';
            playerInfo.textContent = `Level ${player.level || 1} ${player.race || ''} ${player.class || ''}`;
            
            playerItem.appendChild(checkbox);
            playerItem.appendChild(playerName);
            playerItem.appendChild(playerInfo);
            playerList.appendChild(playerItem);
        });
        
        content.appendChild(playerList);
        
        // Show modal
        this.modules.ui.showModal({
            title: 'Add Party',
            content,
            buttons: [
                {
                    text: 'Cancel',
                    className: 'button-secondary',
                    onClick: (modal) => {
                        this.modules.ui.closeModal(modal);
                    }
                },
                {
                    text: 'Create',
                    className: 'button-primary',
                    onClick: (modal) => {
                        // Get party name
                        const name = nameInput.value || 'New Party';
                        
                        // Get selected players
                        const selectedPlayerIds = [];
                        playerList.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
                            selectedPlayerIds.push(checkbox.dataset.id);
                        });
                        
                        // Create party
                        this.modules.roster.createParty(name, selectedPlayerIds)
                            .then(() => {
                                // Refresh view
                                this._initRosterView();
                                
                                // Close modal
                                this.modules.ui.closeModal(modal);
                                
                                // Show success message
                                this.modules.ui.showToast({
                                    message: 'Party created successfully',
                                    type: 'success'
                                });
                            })
                            .catch(error => {
                                console.error('Error creating party:', error);
                                this.modules.ui.showToast({
                                    message: 'Error creating party',
                                    type: 'error'
                                });
                            });
                    }
                }
            ]
        });
    }

    /**
     * Show edit party dialog
     * @private
     * @param {Object} party - Party object
     */
    _showEditPartyDialog(party) {
        // Get all players
        const allPlayers = this.modules.roster.getPlayers();
        
        // Create content
        const content = document.createElement('div');
        content.className = 'edit-party-dialog';
        
        // Create name field
        const nameField = document.createElement('div');
        nameField.className = 'form-field';
        
        const nameLabel = document.createElement('label');
        nameLabel.textContent = 'Party Name';
        nameLabel.htmlFor = 'party-name';
        
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.id = 'party-name';
        nameInput.value = party.name;
        
        nameField.appendChild(nameLabel);
        nameField.appendChild(nameInput);
        content.appendChild(nameField);
        
        // Create player list
        const playerList = document.createElement('div');
        playerList.className = 'player-list';
        
        // Add players to list
        allPlayers.forEach(player => {
            const playerItem = document.createElement('div');
            playerItem.className = 'player-item';
            playerItem.dataset.id = player.id;
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = party.players.some(p => p.id === player.id);
            checkbox.dataset.id = player.id;
            
            const playerName = document.createElement('div');
            playerName.className = 'player-name';
            playerName.textContent = player.name;
            
            const playerInfo = document.createElement('div');
            playerInfo.className = 'player-info';
            playerInfo.textContent = `Level ${player.level || 1} ${player.race || ''} ${player.class || ''}`;
            
            playerItem.appendChild(checkbox);
            playerItem.appendChild(playerName);
            playerItem.appendChild(playerInfo);
            playerList.appendChild(playerItem);
        });
        
        content.appendChild(playerList);
        
        // Show modal
        this.modules.ui.showModal({
            title: 'Edit Party',
            content,
            buttons: [
                {
                    text: 'Cancel',
                    className: 'button-secondary',
                    onClick: (modal) => {
                        this.modules.ui.closeModal(modal);
                    }
                },
                {
                    text: 'Save',
                    className: 'button-primary',
                    onClick: (modal) => {
                        // Get party name
                        const name = nameInput.value || party.name;
                        
                        // Get selected players
                        const selectedPlayerIds = [];
                        playerList.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
                            selectedPlayerIds.push(checkbox.dataset.id);
                        });
                        
                        // Update party
                        this.modules.roster.updateParty(party.id, {
                            name,
                            playerIds: selectedPlayerIds
                        })
                            .then(() => {
                                // Refresh view
                                this._initRosterView();
                                
                                // Close modal
                                this.modules.ui.closeModal(modal);
                                
                                // Show success message
                                this.modules.ui.showToast({
                                    message: 'Party updated successfully',
                                    type: 'success'
                                });
                            })
                            .catch(error => {
                                console.error('Error updating party:', error);
                                this.modules.ui.showToast({
                                    message: 'Error updating party',
                                    type: 'error'
                                });
                            });
                    }
                }
            ]
        });
    }

    /**
     * Show delete party dialog
     * @private
     * @param {Object} party - Party object
     */
    _showDeletePartyDialog(party) {
        this.modules.ui.showConfirmation({
            title: 'Delete Party',
            message: `Are you sure you want to delete "${party.name}"?`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            onConfirm: () => {
                this.modules.roster.removeParty(party.id)
                    .then(() => {
                        // Refresh view
                        this._initRosterView();
                        
                        // Show success message
                        this.modules.ui.showToast({
                            message: 'Party deleted successfully',
                            type: 'success'
                        });
                    })
                    .catch(error => {
                        console.error('Error deleting party:', error);
                        this.modules.ui.showToast({
                            message: 'Error deleting party',
                            type: 'error'
                        });
                    });
            }
        });
    }

    /**
     * Initialize notes view
     * @private
     */
    _initNotesView() {
        console.log('Initializing notes view');
        
        // Get notes view elements
        const notesView = document.getElementById('notes-view');
        const notesList = notesView.querySelector('.notes-list');
        const notesContent = notesView.querySelector('.notes-content');
        
        // Clear notes list
        notesList.innerHTML = '';
        
        // Clear notes content
        notesContent.innerHTML = '';
        
        // Get notes
        const notes = this.modules.notes.getActiveNotes();
        
        // Sort notes by modified date (newest first)
        const sortedNotes = this.modules.notes.sortNotes(notes, 'modified', false);
        
        // Add notes to list
        sortedNotes.forEach(note => {
            const noteItem = document.createElement('div');
            noteItem.className = 'note-item';
            noteItem.dataset.id = note.id;
            
            // Add selected class if this is the current note
            const currentNote = this.modules.notes.getCurrentNote();
            if (currentNote && currentNote.id === note.id) {
                noteItem.classList.add('selected');
            }
            
            const noteTitle = document.createElement('div');
            noteTitle.className = 'note-title';
            noteTitle.textContent = note.title;
            
            const noteDate = document.createElement('div');
            noteDate.className = 'note-date';
            noteDate.textContent = new Date(note.modified).toLocaleDateString();
            
            noteItem.appendChild(noteTitle);
            noteItem.appendChild(noteDate);
            
            // Add click event
            noteItem.addEventListener('click', () => {
                // Select this note
                notesList.querySelectorAll('.note-item').forEach(item => {
                    item.classList.remove('selected');
                });
                noteItem.classList.add('selected');
                
                // Set current note
                this.modules.notes.setCurrentNote(note.id);
                
                // Show note content
                this._showNoteContent(note, notesContent);
            });
            
            notesList.appendChild(noteItem);
        });
        
        // Add new note button
        const newNoteButton = document.createElement('button');
        newNoteButton.className = 'button primary-button new-note-button';
        newNoteButton.innerHTML = '<i class="fas fa-plus"></i> New Note';
        newNoteButton.addEventListener('click', () => {
            this._showNewNoteDialog();
        });
        notesList.appendChild(newNoteButton);
        
        // Show current note if available
        const currentNote = this.modules.notes.getCurrentNote();
        if (currentNote) {
            this._showNoteContent(currentNote, notesContent);
        } else {
            // Show empty state
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <div class="empty-icon"><i class="fas fa-book"></i></div>
                <h2>No Note Selected</h2>
                <p>Select a note from the list or create a new one.</p>
            `;
            notesContent.appendChild(emptyState);
        }
    }

    /**
     * Show note content
     * @private
     * @param {Object} note - Note object
     * @param {HTMLElement} container - Container element
     */
    _showNoteContent(note, container) {
        // Clear container
        container.innerHTML = '';
        
        // Create note header
        const noteHeader = document.createElement('div');
        noteHeader.className = 'note-header';
        
        const noteTitle = document.createElement('h2');
        noteTitle.className = 'note-title';
        noteTitle.textContent = note.title;
        
        const noteActions = document.createElement('div');
        noteActions.className = 'note-actions';
        
        const editButton = document.createElement('button');
        editButton.className = 'button secondary-button';
        editButton.innerHTML = '<i class="fas fa-edit"></i> Edit';
        editButton.addEventListener('click', () => {
            this._showEditNoteDialog(note);
        });
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'button danger-button';
        deleteButton.innerHTML = '<i class="fas fa-trash"></i> Delete';
        deleteButton.addEventListener('click', () => {
            this._showDeleteNoteDialog(note);
        });
        
        noteActions.appendChild(editButton);
        noteActions.appendChild(deleteButton);
        
        noteHeader.appendChild(noteTitle);
        noteHeader.appendChild(noteActions);
        container.appendChild(noteHeader);
        
        // Create note metadata
        const noteMetadata = document.createElement('div');
        noteMetadata.className = 'note-metadata';
        
        const createdDate = new Date(note.created).toLocaleString();
        const modifiedDate = new Date(note.modified).toLocaleString();
        
        noteMetadata.innerHTML = `
            <div class="metadata-item">Created: ${createdDate}</div>
            <div class="metadata-item">Modified: ${modifiedDate}</div>
        `;
        
        // Add category if available
        if (note.categoryId) {
            const category = this.modules.notes.getCategory(note.categoryId);
            if (category) {
                const categoryBadge = document.createElement('div');
                categoryBadge.className = 'category-badge';
                categoryBadge.textContent = category.name;
                categoryBadge.style.backgroundColor = category.color;
                
                noteMetadata.appendChild(categoryBadge);
            }
        }
        
        // Add tags if available
        if (note.tags && note.tags.length > 0) {
            const tagsContainer = document.createElement('div');
            tagsContainer.className = 'tags-container';
            
            note.tags.forEach(tag => {
                const tagBadge = document.createElement('div');
                tagBadge.className = 'tag-badge';
                tagBadge.textContent = tag;
                
                tagsContainer.appendChild(tagBadge);
            });
            
            noteMetadata.appendChild(tagsContainer);
        }
        
        container.appendChild(noteMetadata);
        
        // Create note content
        const noteContent = document.createElement('div');
        noteContent.className = 'note-content';
        
        // Parse markdown
        const parsedContent = this.modules.notes.parseMarkdown(note.content);
        noteContent.innerHTML = parsedContent;
        
        container.appendChild(noteContent);
    }

    /**
     * Show new note dialog
     * @private
     */
    _showNewNoteDialog() {
        // Get categories
        const categories = this.modules.notes.getAllCategories();
        
        // Create form fields
        const fields = [
            {
                name: 'title',
                label: 'Title',
                type: 'text',
                required: true,
                value: 'New Note'
            },
            {
                name: 'categoryId',
                label: 'Category',
                type: 'select',
                options: [
                    { value: '', label: 'None' },
                    ...categories.map(category => ({
                        value: category.id,
                        label: category.name
                    }))
                ]
            },
            {
                name: 'tags',
                label: 'Tags (comma separated)',
                type: 'text'
            },
            {
                name: 'content',
                label: 'Content',
                type: 'textarea',
                rows: 10
            }
        ];
        
        // Create form
        const form = this.modules.ui.createForm(document.createElement('div'), fields, {
            submitText: 'Create Note',
            onSubmit: (data) => {
                // Process tags
                const tags = data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
                
                // Create note
                this.modules.notes.createNote({
                    title: data.title,
                    content: data.content,
                    categoryId: data.categoryId || null,
                    tags
                })
                    .then(() => {
                        // Refresh view
                        this._initNotesView();
                        
                        // Close modal
                        this.modules.ui.closeAllModals();
                        
                        // Show success message
                        this.modules.ui.showToast({
                            message: 'Note created successfully',
                            type: 'success'
                        });
                    })
                    .catch(error => {
                        console.error('Error creating note:', error);
                        this.modules.ui.showToast({
                            message: 'Error creating note',
                            type: 'error'
                        });
                    });
            }
        });
        
        // Show modal
        this.modules.ui.showModal({
            title: 'New Note',
            content: form.form,
            size: 'large'
        });
    }

    /**
     * Show edit note dialog
     * @private
     * @param {Object} note - Note object
     */
    _showEditNoteDialog(note) {
        // Get categories
        const categories = this.modules.notes.getAllCategories();
        
        // Create form fields
        const fields = [
            {
                name: 'title',
                label: 'Title',
                type: 'text',
                required: true,
                value: note.title
            },
            {
                name: 'categoryId',
                label: 'Category',
                type: 'select',
                options: [
                    { value: '', label: 'None' },
                    ...categories.map(category => ({
                        value: category.id,
                        label: category.name
                    }))
                ],
                value: note.categoryId || ''
            },
            {
                name: 'tags',
                label: 'Tags (comma separated)',
                type: 'text',
                value: note.tags ? note.tags.join(', ') : ''
            },
            {
                name: 'content',
                label: 'Content',
                type: 'textarea',
                rows: 10,
                value: note.content
            }
        ];
        
        // Create form
        const form = this.modules.ui.createForm(document.createElement('div'), fields, {
            submitText: 'Save Note',
            onSubmit: (data) => {
                // Process tags
                const tags = data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
                
                // Update note
                this.modules.notes.updateNote(note.id, {
                    title: data.title,
                    content: data.content,
                    categoryId: data.categoryId || null,
                    tags
                })
                    .then(() => {
                        // Refresh view
                        this._initNotesView();
                        
                        // Close modal
                        this.modules.ui.closeAllModals();
                        
                        // Show success message
                        this.modules.ui.showToast({
                            message: 'Note updated successfully',
                            type: 'success'
                        });
                    })
                    .catch(error => {
                        console.error('Error updating note:', error);
                        this.modules.ui.showToast({
                            message: 'Error updating note',
                            type: 'error'
                        });
                    });
            }
        });
        
        // Show modal
        this.modules.ui.showModal({
            title: 'Edit Note',
            content: form.form,
            size: 'large'
        });
    }

    /**
     * Show delete note dialog
     * @private
     * @param {Object} note - Note object
     */
    _showDeleteNoteDialog(note) {
        this.modules.ui.showConfirmation({
            title: 'Delete Note',
            message: `Are you sure you want to delete "${note.title}"?`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            onConfirm: () => {
                this.modules.notes.deleteNote(note.id)
                    .then(() => {
                        // Refresh view
                        this._initNotesView();
                        
                        // Show success message
                        this.modules.ui.showToast({
                            message: 'Note deleted successfully',
                            type: 'success'
                        });
                    })
                    .catch(error => {
                        console.error('Error deleting note:', error);
                        this.modules.ui.showToast({
                            message: 'Error deleting note',
                            type: 'error'
                        });
                    });
            }
        });
    }

    /**
     * Initialize settings view
     * @private
     */
    _initSettingsView() {
        console.log('Initializing settings view');
        
        // Get settings view elements
        const settingsView = document.getElementById('settings-view');
        const settingsList = settingsView.querySelector('.settings-list');
        const settingsContent = settingsView.querySelector('.settings-content');
        
        // Clear settings list
        settingsList.innerHTML = '';
        
        // Clear settings content
        settingsContent.innerHTML = '';
        
        // Get settings categories
        const categories = this.modules.settings.getSettingsCategories();
        
        // Add categories to list
        categories.forEach((category, index) => {
            const categoryItem = document.createElement('div');
            categoryItem.className = 'category-item';
            categoryItem.dataset.id = category.id;
            
            // Add selected class to first category
            if (index === 0) {
                categoryItem.classList.add('selected');
            }
            
            const categoryIcon = document.createElement('div');
            categoryIcon.className = 'category-icon';
            categoryIcon.innerHTML = `<i class="fas fa-${category.icon}"></i>`;
            
            const categoryName = document.createElement('div');
            categoryName.className = 'category-name';
            categoryName.textContent = category.name;
            
            categoryItem.appendChild(categoryIcon);
            categoryItem.appendChild(categoryName);
            
            // Add click event
            categoryItem.addEventListener('click', () => {
                // Select this category
                settingsList.querySelectorAll('.category-item').forEach(item => {
                    item.classList.remove('selected');
                });
                categoryItem.classList.add('selected');
                
                // Show category settings
                this._showCategorySettings(category, settingsContent);
            });
            
            settingsList.appendChild(categoryItem);
        });
        
        // Show first category settings
        if (categories.length > 0) {
            this._showCategorySettings(categories[0], settingsContent);
        }
    }

    /**
     * Show category settings
     * @private
     * @param {Object} category - Category object
     * @param {HTMLElement} container - Container element
     */
    _showCategorySettings(category, container) {
        // Clear container
        container.innerHTML = '';
        
        // Create category header
        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'category-header';
        
        const categoryTitle = document.createElement('h2');
        categoryTitle.className = 'category-title';
        categoryTitle.innerHTML = `<i class="fas fa-${category.icon}"></i> ${category.name}`;
        
        categoryHeader.appendChild(categoryTitle);
        container.appendChild(categoryHeader);
        
        // Create settings form
        const settingsForm = document.createElement('form');
        settingsForm.className = 'settings-form';
        
        // Add settings
        category.settings.forEach(settingKey => {
            const metadata = this.modules.settings.getSettingMetadata(settingKey);
            if (!metadata) return;
            
            const settingContainer = document.createElement('div');
            settingContainer.className = 'setting-container';
            
            const settingLabel = document.createElement('label');
            settingLabel.className = 'setting-label';
            settingLabel.textContent = metadata.label;
            settingLabel.htmlFor = `setting-${settingKey}`;
            
            const settingDescription = document.createElement('div');
            settingDescription.className = 'setting-description';
            settingDescription.textContent = metadata.description;
            
            const settingControl = document.createElement('div');
            settingControl.className = 'setting-control';
            
            // Get current value
            const currentValue = this.modules.settings.get(settingKey);
            
            // Create control based on type
            switch (metadata.type) {
                case 'boolean':
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.id = `setting-${settingKey}`;
                    checkbox.checked = currentValue;
                    
                    checkbox.addEventListener('change', () => {
                        this.modules.settings.set(settingKey, checkbox.checked);
                        
                        // Apply settings if needed
                        if (['theme', 'fontSize'].includes(settingKey)) {
                            this.modules.settings.applySettings();
                        }
                    });
                    
                    settingControl.appendChild(checkbox);
                    break;
                    
                case 'select':
                    const select = document.createElement('select');
                    select.id = `setting-${settingKey}`;
                    
                    metadata.options.forEach(option => {
                        const optionElement = document.createElement('option');
                        optionElement.value = option.value;
                        optionElement.textContent = option.label;
                        optionElement.selected = option.value === currentValue;
                        
                        select.appendChild(optionElement);
                    });
                    
                    select.addEventListener('change', () => {
                        this.modules.settings.set(settingKey, select.value);
                        
                        // Apply settings if needed
                        if (['theme', 'fontSize'].includes(settingKey)) {
                            this.modules.settings.applySettings();
                        }
                    });
                    
                    settingControl.appendChild(select);
                    break;
                    
                case 'number':
                    const number = document.createElement('input');
                    number.type = 'number';
                    number.id = `setting-${settingKey}`;
                    number.value = currentValue;
                    
                    if (metadata.min !== undefined) {
                        number.min = metadata.min;
                    }
                    
                    if (metadata.max !== undefined) {
                        number.max = metadata.max;
                    }
                    
                    if (metadata.step !== undefined) {
                        number.step = metadata.step;
                    }
                    
                    number.addEventListener('change', () => {
                        this.modules.settings.set(settingKey, Number(number.value));
                    });
                    
                    settingControl.appendChild(number);
                    break;
                    
                case 'range':
                    const rangeContainer = document.createElement('div');
                    rangeContainer.className = 'range-container';
                    
                    const range = document.createElement('input');
                    range.type = 'range';
                    range.id = `setting-${settingKey}`;
                    range.value = currentValue;
                    range.min = metadata.min || 0;
                    range.max = metadata.max || 1;
                    range.step = metadata.step || 0.1;
                    
                    const rangeValue = document.createElement('span');
                    rangeValue.className = 'range-value';
                    rangeValue.textContent = currentValue;
                    
                    range.addEventListener('input', () => {
                        rangeValue.textContent = range.value;
                    });
                    
                    range.addEventListener('change', () => {
                        this.modules.settings.set(settingKey, Number(range.value));
                    });
                    
                    rangeContainer.appendChild(range);
                    rangeContainer.appendChild(rangeValue);
                    settingControl.appendChild(rangeContainer);
                    break;
                    
                case 'password':
                    const password = document.createElement('input');
                    password.type = 'password';
                    password.id = `setting-${settingKey}`;
                    password.value = currentValue;
                    
                    password.addEventListener('change', () => {
                        this.modules.settings.set(settingKey, password.value);
                    });
                    
                    settingControl.appendChild(password);
                    break;
                    
                default:
                    const text = document.createElement('input');
                    text.type = 'text';
                    text.id = `setting-${settingKey}`;
                    text.value = currentValue;
                    
                    text.addEventListener('change', () => {
                        this.modules.settings.set(settingKey, text.value);
                    });
                    
                    settingControl.appendChild(text);
            }
            
            settingContainer.appendChild(settingLabel);
            settingContainer.appendChild(settingDescription);
            settingContainer.appendChild(settingControl);
            settingsForm.appendChild(settingContainer);
        });
        
        container.appendChild(settingsForm);
        
        // Add reset button
        const resetButton = document.createElement('button');
        resetButton.className = 'button danger-button reset-button';
        resetButton.textContent = 'Reset to Defaults';
        resetButton.addEventListener('click', () => {
            this._showResetSettingsDialog(category);
        });
        container.appendChild(resetButton);
    }

    /**
     * Show reset settings dialog
     * @private
     * @param {Object} category - Category object
     */
    _showResetSettingsDialog(category) {
        this.modules.ui.showConfirmation({
            title: 'Reset Settings',
            message: `Are you sure you want to reset all ${category.name} settings to their default values?`,
            confirmText: 'Reset',
            cancelText: 'Cancel',
            onConfirm: () => {
                // Reset settings
                category.settings.forEach(settingKey => {
                    this.modules.settings.reset(settingKey);
                });
                
                                // Apply settings
                this.modules.settings.applySettings();
                
                // Refresh view
                this._initSettingsView();
                
                // Show success message
                this.modules.ui.showToast({
                    message: 'Settings reset successfully',
                    type: 'success'
                });
            }
        });
    }

    /**
     * Handle escape key
     * @private
     */
    _handleEscapeKey() {
        // Handle based on current view
        switch (this.state.currentView) {
            case 'combat':
                // Cancel current action if any
                break;
            case 'encounter':
                // Deselect encounter if selected
                break;
            case 'roster':
                // Deselect item if selected
                break;
            case 'notes':
                // Deselect note if selected
                break;
            case 'settings':
                // Go back to previous view
                this.switchView(this.modules.settings.getLastView() || 'combat');
                break;
        }
    }

    /**
     * Save all data
     * @private
     */
    _saveAll() {
        // Show saving toast
        this.modules.ui.showToast({
            message: 'Saving...',
            type: 'info',
            duration: 1000
        });
        
        // Save combat state
        this.modules.combat.save();
        
        // Show success toast
        setTimeout(() => {
            this.modules.ui.showToast({
                message: 'All data saved successfully',
                type: 'success'
            });
        }, 1000);
    }

    /**
     * Show help
     * @private
     */
    _showHelp() {
        // Create content
        const content = document.createElement('div');
        content.className = 'help-dialog';
        
        // Add help content
        content.innerHTML = `
            <h3>Keyboard Shortcuts</h3>
            <table class="shortcuts-table">
                <tr>
                    <td><kbd>Ctrl</kbd> + <kbd>S</kbd></td>
                    <td>Save all data</td>
                </tr>
                <tr>
                    <td><kbd>Esc</kbd></td>
                    <td>Cancel current action</td>
                </tr>
                <tr>
                    <td><kbd>F1</kbd></td>
                    <td>Show this help</td>
                </tr>
            </table>
            
            <h3>Combat Controls</h3>
            <ul>
                <li><strong>Start Combat</strong>: Begin a new combat encounter</li>
                <li><strong>Next Turn</strong>: Advance to the next combatant's turn</li>
                <li><strong>Previous Turn</strong>: Go back to the previous combatant's turn</li>
                <li><strong>End Combat</strong>: End the current combat encounter</li>
            </ul>
            
            <h3>About</h3>
            <p>Jesster's Combat Tracker v${this.version}</p>
            <p>A tabletop RPG combat management tool</p>
        `;
        
        // Show modal
        this.modules.ui.showModal({
            title: 'Help',
            content,
            buttons: [
                {
                    text: 'Close',
                    className: 'button-primary',
                    onClick: (modal) => {
                        this.modules.ui.closeModal(modal);
                    }
                }
            ]
        });
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new JessterCombatTracker();
});
