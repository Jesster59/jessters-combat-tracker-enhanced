/**
 * UI Manager for Jesster's Combat Tracker
 * Handles all user interface rendering and interactions
 */
class UIManager {
    constructor(app) {
        this.app = app;
        this.elements = {};
        this.templates = {};
        this.modalStack = [];
    }
    
    /**
     * Initialize the UI manager
     */
    init() {
        // Find the app container
        const appContainer = document.getElementById('app');
        if (!appContainer) {
            console.error("Fatal Error: Could not find app container element");
            return;
        }
        
        // Render the initial UI
        this.renderInitialUI(appContainer);
        
        // Cache DOM elements for better performance
        this.cacheDOMElements();
        
        // Load templates
        this.loadTemplates();
        
        console.log("UI Manager initialized");
    }
    
       /**
     * Render the initial UI structure
     * @param {HTMLElement} container - The container element
     */
    renderInitialUI(container) {
        container.innerHTML = `
            <div class="min-h-screen bg-gray-900 text-white">
                <!-- Header -->
                <header class="bg-gray-800 shadow-lg">
                    <div class="container mx-auto px-4 py-6">
                        <div class="flex items-center justify-between">
                            <h1 class="text-3xl font-bold text-primary-400">⚔️ Jesster's Combat Tracker</h1>
                            <div class="flex items-center space-x-4">
                                <div id="combat-status" class="text-lg font-semibold text-gray-300">
                                    Combat Not Started
                                </div>
                                <button id="start-combat-btn" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                                    Start Combat
                                </button>
                                <button id="end-combat-btn" class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded hidden">
                                    End Combat
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <!-- Main Content -->
                <main class="container mx-auto px-4 py-8">
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        <!-- Left Column: Creatures -->
                        <div class="lg:col-span-2">
                            <div class="bg-gray-800 rounded-lg shadow-lg p-6">
                                <div class="flex items-center justify-between mb-6">
                                    <h2 class="text-2xl font-bold text-primary-400">Combat Participants</h2>
                                    <div class="flex space-x-2">
                                        <button id="add-hero-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                            Add Hero
                                        </button>
                                        <button id="add-monster-btn" class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
                                            Add Monster
                                        </button>
                                    </div>
                                </div>
                                
                                <div id="creatures-container" class="space-y-4">
                                    <div class="text-center text-gray-400 py-8">
                                        No creatures added yet. Click "Add Hero" or "Add Monster" to begin.
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Right Column: Tools and Log -->
                        <div class="space-y-6">
                            
                            <!-- Initiative Tracker -->
                            <div class="bg-gray-800 rounded-lg shadow-lg p-6">
                                <h3 class="text-xl font-bold text-primary-400 mb-4">Initiative Order</h3>
                                <div id="initiative-container" class="space-y-2">
                                    <div class="text-center text-gray-400 py-4">
                                        No initiative rolled yet
                                    </div>
                                </div>
                                <div class="mt-4 flex space-x-2">
                                    <button id="roll-initiative-btn" class="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded flex-1">
                                        Roll Initiative
                                    </button>
                                    <button id="next-turn-btn" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex-1 hidden">
                                        Next Turn
                                    </button>
                                </div>
                            </div>

                            <!-- Quick Dice Roller -->
                            <div class="bg-gray-800 rounded-lg shadow-lg p-6">
                                <h3 class="text-xl font-bold text-primary-400 mb-4">Quick Dice</h3>
                                <div class="grid grid-cols-3 gap-2 mb-4">
                                    <button class="dice-btn bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-3 rounded" data-dice="1d4">d4</button>
                                    <button class="dice-btn bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-3 rounded" data-dice="1d6">d6</button>
                                    <button class="dice-btn bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-3 rounded" data-dice="1d8">d8</button>
                                    <button class="dice-btn bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-3 rounded" data-dice="1d10">d10</button>
                                    <button class="dice-btn bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-3 rounded" data-dice="1d12">d12</button>
                                    <button class="dice-btn bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-3 rounded" data-dice="1d20">d20</button>
                                </div>
                                <div class="flex space-x-2">
                                    <input type="text" id="custom-dice-input" placeholder="2d6+3" class="flex-1 bg-gray-700 text-white px-3 py-2 rounded">
                                    <button id="roll-custom-dice-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                        Roll
                                    </button>
                                </div>
                                <div id="dice-results" class="mt-4 p-3 bg-gray-700 rounded min-h-[60px]">
                                    <div class="text-gray-400 text-center">Roll some dice to see results</div>
                                </div>
                            </div>
                            
                            <!-- Player View -->
                            <div class="bg-gray-800 rounded-lg shadow-lg p-6">
                                <h3 class="text-xl font-bold text-primary-400 mb-4">Player View</h3>
                                <button id="player-view-btn" class="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded">
                                    Open Player View
                                </button>
                                <div class="mt-4">
                                    <label for="player-hp-view" class="block text-sm font-medium text-gray-300 mb-2">HP Display:</label>
                                    <select id="player-hp-view" class="bg-gray-700 text-white text-sm rounded p-2 w-full">
                                        <option value="descriptive" selected>Descriptive</option>
                                        <option value="exact">Exact</option>
                                        <option value="hidden">Hidden</option>
                                    </select>
                                </div>
                                <div class="mt-4">
                                    <label for="player-view-theme" class="block text-sm font-medium text-gray-300 mb-2">Theme:</label>
                                    <select id="player-view-theme" class="bg-gray-700 text-white text-sm rounded p-2 w-full">
                                        <option value="default" selected>Default</option>
                                        <option value="dungeon">Dungeon</option>
                                        <option value="forest">Forest</option>
                                        <option value="castle">Castle</option>
                                        <option value="tavern">Tavern</option>
                                        <option value="custom">Custom URL</option>
                                    </select>
                                </div>
                                <div id="custom-theme-container" class="mt-4 hidden">
                                    <label for="custom-theme-url" class="block text-sm font-medium text-gray-300 mb-2">Custom Theme URL:</label>
                                    <input type="text" id="custom-theme-url" placeholder="https://example.com/image.jpg" class="bg-gray-700 text-white text-sm rounded p-2 w-full">
                                </div>
                            </div>
                            
                            <!-- Monster Search -->
                            <div class="bg-gray-800 rounded-lg shadow-lg p-6">
                                <h3 class="text-xl font-bold text-primary-400 mb-4">Monster Search</h3>
                                <div class="flex space-x-2">
                                    <input type="text" id="monster-search-input" placeholder="Search monsters..." class="flex-1 bg-gray-700 text-white px-3 py-2 rounded">
                                    <button id="monster-search-btn" class="bg-lime-600 hover:bg-lime-700 text-white font-bold py-2 px-4 rounded">
                                        Search
                                    </button>
                                </div>
                                <div id="monster-search-results" class="mt-4 max-h-60 overflow-y-auto">
                                    <!-- Search results will appear here -->
                                </div>
                            </div>
                            
                            <!-- Character Management -->
                            <div class="bg-gray-800 rounded-lg shadow-lg p-6">
                                <h3 class="text-xl font-bold text-primary-400 mb-4">Character Management</h3>
                                <div class="space-y-2">
                                    <button id="manage-characters-btn" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                        Manage Characters
                                    </button>
                                    <button id="import-dndbeyond-btn" class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
                                        Import from D&D Beyond
                                    </button>
                                </div>
                            </div>

                            <!-- Combat Log -->
                            <div class="bg-gray-800 rounded-lg shadow-lg p-6">
                                <h3 class="text-xl font-bold text-primary-400 mb-4">Combat Log</h3>
                                <div id="combat-log" class="bg-gray-900 rounded p-4 h-64 overflow-y-auto text-sm combat-log-container">
                                    <div class="text-gray-400">Combat log will appear here...</div>
                                </div>
                                <div class="mt-2 flex justify-between">
                                    <button id="export-log-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm">
                                        Export Log
                                    </button>
                                    <button id="clear-log-btn" class="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm">
                                        Clear Log
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Bottom Action Bar -->
                    <div class="mt-6 flex flex-wrap justify-center gap-4">
                        <button id="save-state-btn" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300">
                            Save State
                        </button>
                        <button id="load-state-btn" class="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300">
                            Load State
                        </button>
                        <button id="save-encounter-btn" class="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300">
                            Save Encounter
                        </button>
                        <button id="load-encounter-btn" class="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300">
                            Load Encounter
                        </button>
                        <button id="settings-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300">
                            Settings
                        </button>
                        <button id="help-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300">
                            Help
                        </button>
                    </div>
                </main>
                
                <!-- Footer -->
                <footer class="bg-gray-800 py-4 mt-8">
                    <div class="container mx-auto px-4 text-center text-gray-400">
                        <p>Jesster's Combat Tracker v${this.app.state.version} | <a href="#" id="about-link" class="text-primary-400 hover:text-primary-300">About</a></p>
                    </div>
                </footer>
            </div>
        `;
    }
    
    /**
     * Cache DOM elements for better performance
     */
    cacheDOMElements() {
        const elementIds = [
            'combat-status', 'start-combat-btn', 'end-combat-btn', 'add-hero-btn', 'add-monster-btn',
            'creatures-container', 'initiative-container', 'roll-initiative-btn', 'next-turn-btn',
            'custom-dice-input', 'roll-custom-dice-btn', 'dice-results', 'combat-log', 'clear-log-btn',
            'export-log-btn', 'player-view-btn', 'player-hp-view', 'player-view-theme', 'custom-theme-container',
            'custom-theme-url', 'monster-search-input', 'monster-search-btn', 'monster-search-results',
            'manage-characters-btn', 'import-dndbeyond-btn', 'save-state-btn', 'load-state-btn',
            'save-encounter-btn', 'load-encounter-btn', 'settings-btn', 'help-btn', 'about-link'
        ];
        
        elementIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                this.elements[id.replace(/-./g, match => match[1].toUpperCase())] = element;
            } else {
                console.warn(`Element with ID '${id}' not found.`);
            }
        });
    }
    
    /**
     * Load HTML templates
     */
    loadTemplates() {
        this.templates.creatureCard = `
            <div class="creature-card bg-gray-700 rounded-lg p-4 shadow-md border-2 border-transparent">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <div class="text-2xl">{{typeIcon}}</div>
                        <div>
                            <h4 class="text-lg font-bold text-white">{{name}}</h4>
                            <div class="text-sm text-gray-300">
                                HP: {{currentHp}}/{{maxHp}} | AC: {{ac}}
                                {{#if initiative}}
                                | Init: {{initiative}}
                                {{/if}}
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex items-center space-x-2">
                        <button class="damage-btn bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm" data-creature-id="{{id}}">
                            Damage
                        </button>
                        <button class="heal-btn bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm" data-creature-id="{{id}}">
                            Heal
                        </button>
                        <button class="remove-btn bg-gray-600 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded text-sm" data-creature-id="{{id}}">
                            Remove
                        </button>
                    </div>
                </div>
                
                {{#if conditions.length}}
                <div class="mt-2">
                    <div class="text-xs text-gray-400 mb-1">Conditions:</div>
                    <div class="flex flex-wrap gap-1">
                        {{#each conditions}}
                        <span class="condition-tag bg-yellow-600 text-yellow-100">{{this}}</span>
                        {{/each}}
                    </div>
                </div>
                {{/if}}
            </div>
        `;
        
        this.templates.initiativeItem = `
            <div class="flex items-center justify-between p-2 rounded {{#if active}}bg-blue-600{{else}}bg-gray-700{{/if}}">
                <div class="flex items-center space-x-2">
                    <span class="text-lg font-bold">{{index}}.</span>
                    <span class="text-sm">{{typeIcon}}</span>
                    <span class="font-semibold">{{name}}</span>
                </div>
                <span class="font-bold text-yellow-400">{{initiative}}</span>
            </div>
        `;
        
        this.templates.characterCard = `
            <div class="bg-gray-700 p-3 rounded flex justify-between items-center">
                <div>
                    <p class="font-semibold">{{name}}</p>
                    <p class="text-sm text-gray-400">HP: {{maxHp}} | AC: {{ac}} | Init: {{initiativeBonus}}</p>
                </div>
                <div class="flex space-x-2">
                    <button class="add-to-combat-btn bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm" data-id="{{id}}">
                        Add
                    </button>
                    <button class="edit-character-btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm" data-id="{{id}}">
                        Edit
                    </button>
                    <button class="delete-character-btn bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm" data-id="{{id}}">
                        Del
                    </button>
                </div>
            </div>
        `;
        
        this.templates.monsterCard = `
            <div class="bg-gray-700 p-3 rounded flex justify-between items-center">
                <div>
                    <p class="font-semibold">{{name}}</p>
                    <p class="text-sm text-gray-400">HP: {{hp}} | AC: {{ac}} | CR: {{cr}}</p>
                </div>
                <div class="flex space-x-2">
                    <button class="view-monster-btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm" data-id="{{id}}">
                        View
                    </button>
                    <button class="add-monster-btn bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm" data-id="{{id}}">
                        Add
                    </button>
                </div>
            </div>
        `;
        
        this.templates.encounterCard = `
            <div class="bg-gray-700 p-3 rounded flex justify-between items-center">
                <div>
                    <p class="font-semibold">{{name}}</p>
                    <p class="text-sm text-gray-400">{{heroCount}} heroes | {{monsterCount}} monsters</p>
                </div>
                <div class="flex space-x-2">
                    <button class="load-encounter-btn bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm" data-id="{{id}}">
                        Load
                    </button>
                    <button class="delete-encounter-btn bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm" data-id="{{id}}">
                        Del
                    </button>
                </div>
            </div>
        `;
        
        this.templates.monsterSearchResult = `
            <div class="monster-result p-2 hover:bg-gray-700 cursor-pointer rounded flex justify-between items-center" data-monster-id="{{slug}}">
                <span>{{name}}</span>
                <span class="text-gray-400">CR {{cr}}</span>
            </div>
        `;
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Combat controls
        this.elements.startCombatBtn?.addEventListener('click', () => {
            this.app.combat.startCombat();
        });
        
        this.elements.endCombatBtn?.addEventListener('click', () => {
            this.app.combat.endCombat();
        });
        
        // Add creature buttons
        this.elements.addHeroBtn?.addEventListener('click', () => {
            this.openAddHeroModal();
        });
        
        this.elements.addMonsterBtn?.addEventListener('click', () => {
            this.openAddMonsterModal();
        });
        
        // Initiative controls
        this.elements.rollInitiativeBtn?.addEventListener('click', () => {
            this.app.combat.rollInitiativeForAll();
        });
        
        this.elements.nextTurnBtn?.addEventListener('click', () => {
            this.app.combat.nextTurn();
        });
        
        // Dice rolling
        document.querySelectorAll('.dice-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const diceNotation = e.target.dataset.dice;
                this.app.dice.rollAndDisplay(diceNotation);
            });
        });
        
        this.elements.rollCustomDiceBtn?.addEventListener('click', () => {
            const diceNotation = this.elements.customDiceInput.value.trim();
            if (diceNotation) {
                this.app.dice.rollAndDisplay(diceNotation);
                this.elements.customDiceInput.value = '';
            }
        });
        
        this.elements.customDiceInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.elements.rollCustomDiceBtn.click();
            }
        });
        
        // Combat log
        this.elements.clearLogBtn?.addEventListener('click', () => {
            this.app.state.combatLog = [];
            this.renderCombatLog();
        });
        
        this.elements.exportLogBtn?.addEventListener('click', () => {
            this.app.export.exportCombatLog();
        });
        
        // Player view
        this.elements.playerViewBtn?.addEventListener('click', () => {
            this.openPlayerView();
        });
        
        this.elements.playerHpView?.addEventListener('change', () => {
            this.app.updatePlayerView();
        });
        
        this.elements.playerViewTheme?.addEventListener('change', () => {
            // Show/hide custom URL input based on theme selection
            this.elements.customThemeContainer.classList.toggle('hidden', this.elements.playerViewTheme.value !== 'custom');
            this.app.updatePlayerView();
        });
        
        this.elements.customThemeUrl?.addEventListener('input', () => {
            this.app.updatePlayerView();
        });
        
        // Monster search
        this.elements.monsterSearchBtn?.addEventListener('click', async () => {
            await this.searchMonsters();
        });
        
        this.elements.monsterSearchInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchMonsters();
            }
        });
        
        // Character management
        this.elements.manageCharactersBtn?.addEventListener('click', () => {
            this.openCharacterManagementModal();
        });
        
        this.elements.importDndbeyondBtn?.addEventListener('click', () => {
            this.openDnDBeyondImportModal();
        });
        
        // Save/load state
        this.elements.saveStateBtn?.addEventListener('click', () => {
            this.app.export.saveCombatState();
        });
        
        this.elements.loadStateBtn?.addEventListener('click', () => {
            this.app.export.loadCombatState();
        });
        
        // Encounters
        this.elements.saveEncounterBtn?.addEventListener('click', () => {
            this.openSaveEncounterModal();
        });
        
        this.elements.loadEncounterBtn?.addEventListener('click', () => {
            this.openLoadEncounterModal();
        });
        
        // Settings and help
        this.elements.settingsBtn?.addEventListener('click', () => {
            this.app.settings.openSettingsModal();
        });
        
        this.elements.helpBtn?.addEventListener('click', () => {
            this.app.help.openHelpModal();
        });
        
        this.elements.aboutLink?.addEventListener('click', (e) => {
            e.preventDefault();
            this.openAboutModal();
        });
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.app.keyboard.handleKeyDown(e);
        });
    }
    
    /**
     * Open the add hero modal
     */
    async openAddHeroModal() {
        const characters = await this.app.storage.getAllCharacters();
        
        const modal = this.createModal({
            title: 'Add Hero',
            content: `
                <div class="space-y-6">
                    <div>
                        <h4 class="text-lg font-semibold text-primary-300 mb-2">Select from Characters</h4>
                        <div id="character-selection" class="max-h-60 overflow-y-auto space-y-2 bg-gray-900 p-2 rounded">
                            ${characters.length === 0 ? 
                                '<p class="text-gray-400 text-center p-4">No saved characters. Create some in Character Management.</p>' :
                                characters.map(char => this.renderTemplate(this.templates.characterCard, {
                                    id: char.id,
                                    name: char.name,
                                    maxHp: char.maxHp,
                                    ac: char.ac,
                                    initiativeBonus: char.initiativeBonus || 0
                                })).join('')
                            }
                        </div>
                    </div>
                    
                    <div class="border-t border-gray-700 pt-4">
                        <h4 class="text-lg font-semibold text-primary-300 mb-2">Create New Hero</h4>
                        <form id="quick-hero-form" class="space-y-4">
                            <div>
                                <label class="block text-gray-300 mb-1">Name:</label>
                                <input type="text" id="quick-hero-name" class="w-full bg-gray-700 text-white px-3 py-2 rounded" required>
                            </div>
                            
                            <div class="grid grid-cols-3 gap-4">
                                <div>
                                    <label class="block text-gray-300 mb-1">HP:</label>
                                    <input type="number" id="quick-hero-hp" class="w-full bg-gray-700 text-white px-3 py-2 rounded" required>
                                </div>
                                <div>
                                    <label class="block text-gray-300 mb-1">AC:</label>
                                    <input type="number" id="quick-hero-ac" class="w-full bg-gray-700 text-white px-3 py-2 rounded" required>
                                </div>
                                <div>
                                    <label class="block text-gray-300 mb-1">Initiative:</label>
                                    <input type="number" id="quick-hero-init" class="w-full bg-gray-700 text-white px-3 py-2 rounded" required>
                                </div>
                            </div>
                            
                            <div class="flex justify-end">
                                <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                    Add New Hero
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            `,
            width: 'max-w-2xl'
        });
        
        // Add event listeners for character selection
        modal.querySelectorAll('.add-to-combat-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const characterId = btn.dataset.id;
                const character = await this.app.storage.getCharacter(characterId);
                
                if (character) {
                    const combatantData = {
                        id: `hero-${this.app.utils.generateShortId()}`,
                        name: character.name,
                        type: 'hero',
                        maxHp: character.maxHp,
                        currentHp: character.maxHp,
                        ac: character.ac,
                        initiativeModifier: character.initiativeBonus || 0,
                        str: character.str,
                        dex: character.dex,
                        con: character.con,
                        int: character.int,
                        wis: character.wis,
                        cha: character.cha,
                        pp: character.pp,
                        dc: character.dc,
                        saves: character.saves,
                        notes: character.notes,
                        conditions: []
                    };
                    
                    this.app.combat.addCreature(combatantData);
                    this.closeModal(modal);
                }
            });
        });
        
        // Add event listener for quick hero form
        const quickHeroForm = modal.querySelector('#quick-hero-form');
        quickHeroForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = modal.querySelector('#quick-hero-name').value;
            const hp = parseInt(modal.querySelector('#quick-hero-hp').value);
            const ac = parseInt(modal.querySelector('#quick-hero-ac').value);
            const init = parseInt(modal.querySelector('#quick-hero-init').value);
            
            const combatantData = {
                id:
