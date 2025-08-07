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
                id: `hero-${this.app.utils.generateShortId()}`,
                name: name,
                type: 'hero',
                maxHp: hp,
                currentHp: hp,
                ac: ac,
                initiativeModifier: init,
                conditions: []
            };
            
            this.app.combat.addCreature(combatantData);
            this.closeModal(modal);
        });
    }
    
    /**
     * Open the add monster modal
     */
    async openAddMonsterModal() {
        const monsters = await this.app.storage.getAllMonsters();
        
        const modal = this.createModal({
            title: 'Add Monster',
            content: `
                <div class="space-y-6">
                    <div>
                        <h4 class="text-lg font-semibold text-primary-300 mb-2">Search Open5e SRD</h4>
                        <div class="flex space-x-2 mb-2">
                            <input type="text" id="modal-monster-search" placeholder="Search monsters..." class="flex-1 bg-gray-700 text-white px-3 py-2 rounded">
                            <button id="modal-monster-search-btn" class="bg-lime-600 hover:bg-lime-700 text-white font-bold py-2 px-4 rounded">
                                Search
                            </button>
                        </div>
                        <div id="modal-monster-results" class="max-h-40 overflow-y-auto bg-gray-900 p-2 rounded">
                            <p class="text-gray-400 text-center p-4">Enter a search term above</p>
                        </div>
                    </div>
                    
                    <div class="border-t border-gray-700 pt-4">
                        <h4 class="text-lg font-semibold text-primary-300 mb-2">Your Monster Collection</h4>
                        <div id="saved-monsters-list" class="max-h-40 overflow-y-auto space-y-2 bg-gray-900 p-2 rounded">
                            ${monsters.length === 0 ? 
                                '<p class="text-gray-400 text-center p-4">No saved monsters. Search the SRD above to add some.</p>' :
                                monsters.map(monster => this.renderTemplate(this.templates.monsterCard, {
                                    id: monster.id,
                                    name: monster.name,
                                    hp: monster.hp || 'Varies',
                                    ac: monster.ac || '?',
                                    cr: monster.cr || '?'
                                })).join('')
                            }
                        </div>
                    </div>
                    
                    <div class="border-t border-gray-700 pt-4">
                        <h4 class="text-lg font-semibold text-primary-300 mb-2">Create Quick Monster</h4>
                        <form id="quick-monster-form" class="space-y-4">
                            <div>
                                <label class="block text-gray-300 mb-1">Name:</label>
                                <input type="text" id="quick-monster-name" class="w-full bg-gray-700 text-white px-3 py-2 rounded" required>
                            </div>
                            
                            <div class="grid grid-cols-3 gap-4">
                                <div>
                                    <label class="block text-gray-300 mb-1">HP:</label>
                                    <input type="number" id="quick-monster-hp" class="w-full bg-gray-700 text-white px-3 py-2 rounded" required>
                                </div>
                                <div>
                                    <label class="block text-gray-300 mb-1">AC:</label>
                                    <input type="number" id="quick-monster-ac" class="w-full bg-gray-700 text-white px-3 py-2 rounded" required>
                                </div>
                                <div>
                                    <label class="block text-gray-300 mb-1">Initiative:</label>
                                    <input type="number" id="quick-monster-init" class="w-full bg-gray-700 text-white px-3 py-2 rounded" required>
                                </div>
                            </div>
                            
                            <div class="flex justify-between items-center">
                                <div class="flex items-center space-x-2">
                                    <label class="text-gray-300">Quantity:</label>
                                    <input type="number" id="quick-monster-quantity" class="w-16 bg-gray-700 text-white px-3 py-2 rounded" value="1" min="1">
                                </div>
                                <button type="submit" class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
                                    Add Monster(s)
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            `,
            width: 'max-w-3xl'
        });
        
        // Add event listeners for monster search
        const modalMonsterSearch = modal.querySelector('#modal-monster-search');
        const modalMonsterSearchBtn = modal.querySelector('#modal-monster-search-btn');
        const modalMonsterResults = modal.querySelector('#modal-monster-results');
        
        modalMonsterSearchBtn.addEventListener('click', async () => {
            const query = modalMonsterSearch.value.trim();
            if (query.length < 2) {
                this.app.showAlert('Please enter at least 2 characters to search');
                return;
            }
            
            modalMonsterResults.innerHTML = '<p class="text-center text-gray-400">Searching...</p>';
            
            const monsters = await this.app.api.searchMonsters(query);
            
            if (monsters.length === 0) {
                modalMonsterResults.innerHTML = '<p class="text-center text-gray-400">No monsters found</p>';
                return;
            }
            
            modalMonsterResults.innerHTML = monsters.map(monster => this.renderTemplate(this.templates.monsterSearchResult, {
                slug: monster.slug,
                name: monster.name,
                cr: monster.challenge_rating
            })).join('');
            
            // Add event listeners to monster results
            modalMonsterResults.querySelectorAll('.monster-result').forEach(el => {
                el.addEventListener('click', async () => {
                    const monsterId = el.dataset.monsterId;
                    const monster = monsters.find(m => m.slug === monsterId);
                    if (monster) {
                        this.displayMonsterStatblock(monster);
                    }
                });
            });
        });
        
        modalMonsterSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                modalMonsterSearchBtn.click();
            }
        });
        
        // Add event listeners for saved monsters
        modal.querySelectorAll('.add-monster-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const monsterId = btn.dataset.id;
                const monster = await this.app.storage.getMonster(monsterId);
                
                if (monster) {
                    const quantity = parseInt(modal.querySelector('#quick-monster-quantity').value) || 1;
                    
                    for (let i = 0; i < quantity; i++) {
                        const combatantData = {
                            id: `monster-${this.app.utils.generateShortId()}`,
                            name: quantity > 1 ? `${monster.name} ${i + 1}` : monster.name,
                            type: 'monster',
                            maxHp: monster.hp || 10,
                            currentHp: monster.hp || 10,
                            ac: monster.ac || 10,
                            initiativeModifier: monster.initiativeModifier || 0,
                            str: monster.str,
                            dex: monster.dex,
                            con: monster.con,
                            int: monster.int,
                            wis: monster.wis,
                            cha: monster.cha,
                            pp: monster.pp,
                            saves: monster.saves,
                            actions: monster.actions,
                            conditions: []
                        };
                        
                        this.app.combat.addCreature(combatantData);
                    }
                    
                    this.closeModal(modal);
                }
            });
        });
        
        modal.querySelectorAll('.view-monster-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const monsterId = btn.dataset.id;
                const monster = await this.app.storage.getMonster(monsterId);
                
                if (monster) {
                    this.displayMonsterStatblock(monster);
                }
            });
        });
        
        // Add event listener for quick monster form
        const quickMonsterForm = modal.querySelector('#quick-monster-form');
        quickMonsterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = modal.querySelector('#quick-monster-name').value;
            const hp = parseInt(modal.querySelector('#quick-monster-hp').value);
            const ac = parseInt(modal.querySelector('#quick-monster-ac').value);
            const init = parseInt(modal.querySelector('#quick-monster-init').value);
            const quantity = parseInt(modal.querySelector('#quick-monster-quantity').value) || 1;
            
            for (let i = 0; i < quantity; i++) {
                const combatantData = {
                    id: `monster-${this.app.utils.generateShortId()}`,
                    name: quantity > 1 ? `${name} ${i + 1}` : name,
                    type: 'monster',
                    maxHp: hp,
                    currentHp: hp,
                    ac: ac,
                    initiativeModifier: init,
                    conditions: []
                };
                
                this.app.combat.addCreature(combatantData);
            }
            
            this.closeModal(modal);
        });
    }
    
    /**
     * Open the character management modal
     */
    async openCharacterManagementModal() {
        const characters = await this.app.storage.getAllCharacters();
        
        const modal = this.createModal({
            title: 'Character Management',
            content: `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Character Form -->
                    <div>
                        <h4 class="text-xl font-semibold text-primary-300 mb-4">Add/Edit Character</h4>
                        <form id="character-form" class="space-y-4">
                            <input type="hidden" id="character-id">
                            
                            <div>
                                <label class="block text-gray-300 mb-1">Character Name:</label>
                                <input type="text" id="character-name" class="w-full bg-gray-700 text-white px-3 py-2 rounded" required>
                            </div>
                            
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-gray-300 mb-1">Max HP:</label>
                                    <input type="number" id="character-max-hp" class="w-full bg-gray-700 text-white px-3 py-2 rounded" required>
                                </div>
                                <div>
                                    <label class="block text-gray-300 mb-1">AC:</label>
                                    <input type="number" id="character-ac" class="w-full bg-gray-700 text-white px-3 py-2 rounded" required>
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-3 gap-4">
                                <div>
                                    <label class="block text-gray-300 mb-1">Initiative Bonus:</label>
                                    <input type="number" id="character-init" class="w-full bg-gray-700 text-white px-3 py-2 rounded" required>
                                </div>
                                <div>
                                    <label class="block text-gray-300 mb-1">Passive Perception:</label>
                                    <input type="number" id="character-pp" class="w-full bg-gray-700 text-white px-3 py-2 rounded" required>
                                </div>
                                <div>
                                    <label class="block text-gray-300 mb-1">Spell DC:</label>
                                    <input type="number" id="character-dc" class="w-full bg-gray-700 text-white px-3 py-2 rounded">
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-6 gap-2">
                                <div>
                                    <label class="block text-gray-300 mb-1">STR:</label>
                                    <input type="number" id="character-str" class="w-full bg-gray-700 text-white px-3 py-2 rounded" required>
                                </div>
                                <div>
                                    <label class="block text-gray-300 mb-1">DEX:</label>
                                    <input type="number" id="character-dex" class="w-full bg-gray-700 text-white px-3 py-2 rounded" required>
                                </div>
                                <div>
                                    <label class="block text-gray-300 mb-1">CON:</label>
                                    <input type="number" id="character-con" class="w-full bg-gray-700 text-white px-3 py-2 rounded" required>
                                </div>
                                <div>
                                    <label class="block text-gray-300 mb-1">INT:</label>
                                    <input type="number" id="character-int" class="w-full bg-gray-700 text-white px-3 py-2 rounded" required>
                                </div>
                                <div>
                                    <label class="block text-gray-300 mb-1">WIS:</label>
                                    <input type="number" id="character-wis" class="w-full bg-gray-700 text-white px-3 py-2 rounded" required>
                                </div>
                                <div>
                                    <label class="block text-gray-300 mb-1">CHA:</label>
                                    <input type="number" id="character-cha" class="w-full bg-gray-700 text-white px-3 py-2 rounded" required>
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-gray-300 mb-1">Saving Throws (e.g., "STR +5, DEX +3"):</label>
                                <input type="text" id="character-saves" class="w-full bg-gray-700 text-white px-3 py-2 rounded">
                            </div>
                            
                            <div>
                                <label class="block text-gray-300 mb-1">Notes:</label>
                                <textarea id="character-notes" class="w-full bg-gray-700 text-white px-3 py-2 rounded" rows="3"></textarea>
                            </div>
                            
                            <div class="flex justify-between space-x-2">
                                <button type="button" id="clear-character-form-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                                    Clear
                                </button>
                                <button type="button" id="import-dndbeyond-form-btn" class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
                                    Import from D&D Beyond
                                </button>
                                <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                    Save Character
                                </button>
                            </div>
                        </form>
                    </div>
                    
                    <!-- Character List -->
                    <div>
                        <h4 class="text-xl font-semibold text-primary-300 mb-4">Saved Characters</h4>
                        <div id="character-list" class="space-y-2 max-h-[500px] overflow-y-auto">
                            ${characters.length === 0 ? 
                                '<p class="text-gray-400 text-center p-4">No saved characters yet</p>' : 
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
                </div>
            `,
            width: 'max-w-5xl'
        });
        
        // Add event listeners for character form
        const characterForm = modal.querySelector('#character-form');
        const clearFormBtn = modal.querySelector('#clear-character-form-btn');
        const importDndbeyondBtn = modal.querySelector('#import-dndbeyond-form-btn');
        
        characterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const character = {
                id: modal.querySelector('#character-id').value || this.app.utils.generateUUID(),
                name: modal.querySelector('#character-name').value,
                maxHp: parseInt(modal.querySelector('#character-max-hp').value),
                ac: parseInt(modal.querySelector('#character-ac').value),
                initiativeBonus: parseInt(modal.querySelector('#character-init').value),
                pp: parseInt(modal.querySelector('#character-pp').value),
                dc: parseInt(modal.querySelector('#character-dc').value) || null,
                str: parseInt(modal.querySelector('#character-str').value),
                dex: parseInt(modal.querySelector('#character-dex').value),
                con: parseInt(modal.querySelector('#character-con').value),
                int: parseInt(modal.querySelector('#character-int').value),
                wis: parseInt(modal.querySelector('#character-wis').value),
                cha: parseInt(modal.querySelector('#character-cha').value),
                saves: modal.querySelector('#character-saves').value,
                notes: modal.querySelector('#character-notes').value,
                updatedAt: Date.now()
            };
            
            if (!character.name) {
                this.app.showAlert('Character name is required.');
                return;
            }
            
            try {
                await this.app.storage.saveCharacter(character);
                this.app.showAlert(`Character ${character.name} saved successfully!`);
                this.openCharacterManagementModal(); // Refresh the modal
            } catch (error) {
                console.error('Error saving character:', error);
                this.app.showAlert(`Error saving character: ${error.message}`);
            }
        });
        
        clearFormBtn.addEventListener('click', () => {
            characterForm.reset();
            modal.querySelector('#character-id').value = '';
        });
        
        importDndbeyondBtn.addEventListener('click', () => {
            this.closeModal(modal);
            this.openDnDBeyondImportModal();
        });
        
        // Add event listeners for character list
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
        
        modal.querySelectorAll('.edit-character-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const characterId = btn.dataset.id;
                const character = await this.app.storage.getCharacter(characterId);
                
                if (character) {
                    // Populate the form with character data
                    modal.querySelector('#character-id').value = character.id;
                    modal.querySelector('#character-name').value = character.name;
                    modal.querySelector('#character-max-hp').value = character.maxHp;
                    modal.querySelector('#character-ac').value = character.ac;
                    modal.querySelector('#character-init').value = character.initiativeBonus || 0;
                    modal.querySelector('#character-pp').value = character.pp || 10;
                    modal.querySelector('#character-dc').value = character.dc || '';
                    modal.querySelector('#character-str').value = character.str || 10;
                    modal.querySelector('#character-dex').value = character.dex || 10;
                    modal.querySelector('#character-con').value = character.con || 10;
                    modal.querySelector('#character-int').value = character.int || 10;
                    modal.querySelector('#character-wis').value = character.wis || 10;
                    modal.querySelector('#character-cha').value = character.cha || 10;
                    modal.querySelector('#character-saves').value = character.saves || '';
                    modal.querySelector('#character-notes').value = character.notes || '';
                    
                    // Scroll to the form
                    modal.querySelector('#character-name').scrollIntoView({ behavior: 'smooth' });
                    modal.querySelector('#character-name').focus();
                }
            });
        });
        
        modal.querySelectorAll('.delete-character-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const characterId = btn.dataset.id;
                const character = await this.app.storage.getCharacter(characterId);
                
                if (character) {
                    this.app.showConfirm(`Are you sure you want to delete ${character.name}?`, async () => {
                        try {
                            await this.app.storage.deleteCharacter(characterId);
                            this.app.showAlert(`Character ${character.name} deleted successfully!`);
                            this.openCharacterManagementModal(); // Refresh the modal
                        } catch (error) {
                            console.error('Error deleting character:', error);
                            this.app.showAlert(`Error deleting character: ${error.message}`);
                        }
                    });
                }
            });
        });
    }
    
    /**
     * Open the D&D Beyond import modal
     */
    openDnDBeyondImportModal() {
        const modal = this.createModal({
            title: 'Import from D&D Beyond',
            content: `
                <div class="mb-6">
                    <p class="text-gray-300 mb-4">To import your character from D&D Beyond, follow these steps:</p>
                    <ol class="list-decimal list-inside text-gray-300 space-y-2">
                        <li>Open your character sheet on D&D Beyond</li>
                        <li>Press <span class="bg-gray-700 px-2 py-1 rounded">Ctrl+Shift+I</span> (or <span class="bg-gray-700 px-2 py-1 rounded">Cmd+Option+I</span> on Mac) to open developer tools</li>
                        <li>Go to the "Console" tab</li>
                        <li>Paste the following code and press Enter:
                            <pre class="bg-gray-700 p-2 rounded mt-1 overflow-x-auto text-xs">${this.app.api.getDnDBeyondImportScript()}</pre>
                        </li>
                        <li>Copy the JSON output that appears in the console</li>
                        <li>Paste it below:</li>
                    </ol>
                </div>
                
                <div class="mb-6">
                    <label class="block text-gray-300 mb-2">Paste Character JSON:</label>
                    <textarea id="dndb-json-input" class="w-full bg-gray-700 text-white px-3 py-2 rounded" rows="6" placeholder='{"name":"Gandalf","classes":"Wizard 10","level":10,...}'></textarea>
                </div>
                
                <div class="flex justify-end space-x-2">
                    <button id="import-dndb-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Import Character
                    </button>
                </div>
            `,
            width: 'max-w-3xl'
        });
        
        // Add event listener for import button
        const importBtn = modal.querySelector('#import-dndb-btn');
        importBtn.addEventListener('click', async () => {
            const jsonInput = modal.querySelector('#dndb-json-input').value.trim();
            
            if (!jsonInput) {
                this.app.showAlert('Please paste the character JSON from D&D Beyond');
                return;
            }
            
            try {
                const dndbData = JSON.parse(jsonInput);
                const character = this.app.api.parseDnDBeyondCharacter(dndbData);
                
                await this.app.storage.saveCharacter(character);
                this.app.showAlert(`Successfully imported ${character.name} from D&D Beyond!`);
                this.closeModal(modal);
                
                // Open character management modal to show the imported character
                this.openCharacterManagementModal();
            } catch (error) {
                console.error('Error parsing D&D Beyond data:', error);
                this.app.showAlert(`Error importing character: ${error.message}`);
            }
        });
    }
    
    /**
     * Open the save encounter modal
     */
    async openSaveEncounterModal() {
        const modal = this.createModal({
            title: 'Save Encounter',
            content: `
                <div class="space-y-4">
                    <div>
                        <label class="block text-gray-300 mb-2">Encounter Name:</label>
                        <input type="text" id="encounter-name" class="w-full bg-gray-700 text-white px-3 py-2 rounded" required>
                    </div>
                    
                    <div>
                        <label class="block text-gray-300 mb-2">Description (optional):</label>
                        <textarea id="encounter-description" class="w-full bg-gray-700 text-white px-3 py-2 rounded" rows="3"></textarea>
                    </div>
                    
                    <div class="flex justify-end space-x-2">
                        <button id="save-encounter-confirm-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Save Encounter
                        </button>
                    </div>
                </div>
            `,
            width: 'max-w-md'
        });
        
        // Add event listener for save button
        const saveBtn = modal.querySelector('#save-encounter-confirm-btn');
        saveBtn.addEventListener('click', async () => {
            const name = modal.querySelector('#encounter-name').value.trim();
            const description = modal.querySelector('#encounter-description').value.trim();
            
            if (!name) {
                this.app.showAlert('Please enter a name for the encounter');
                return;
            }
            
            try {
                const encounter = {
                    id: this.app.utils.generateUUID(),
                    name: name,
                    description: description,
                    heroes: this.app.combat.getHeroes().map(hero => ({
                        id: hero.id,
                        name: hero.name,
                        type: hero.type,
                        maxHp: hero.maxHp,
                        ac: hero.ac,
                        initiativeModifier: hero.initiativeModifier,
                        str: hero.str,
                        dex: hero.dex,
                        con: hero.con,
                        int: hero.int,
                        wis: hero.wis,
                        cha: hero.cha,
                        pp: hero.pp,
                        saves: hero.saves,
                        notes: hero.notes
                    })),
                    monsters: this.app.combat.getMonsters().map(monster => ({
                        id: monster.id,
                        name: monster.name,
                        type: monster.type,
                        maxHp: monster.maxHp,
                        ac: monster.ac,
                        initiativeModifier: monster.initiativeModifier,
                        str: monster.str,
                        dex: monster.dex,
                        con: monster.con,
                        int: monster.int,
                        wis: monster.wis,
                        cha: monster.cha,
                        pp: monster.pp,
                        saves: monster.saves,
                        actions: monster.actions,
                        notes: monster.notes
                    })),
                    createdAt: Date.now()
                };
                
                await this.app.storage.saveEncounter(encounter);
                this.app.showAlert(`Encounter "${name}" saved successfully!`);
                this.closeModal(modal);
            } catch (error) {
                console.error('Error saving encounter:', error);
                this.app.showAlert(`Error saving encounter: ${error.message}`);
            }
        });
    }
    
       /**
     * Open the load encounter modal
     */
    async openLoadEncounterModal() {
        const encounters = await this.app.storage.getAllEncounters();
        
        const modal = this.createModal({
            title: 'Load Encounter',
            content: `
                <div class="space-y-4">
                    <div id="encounters-list" class="space-y-2 max-h-[400px] overflow-y-auto">
                        ${encounters.length === 0 ? 
                            '<p class="text-gray-400 text-center p-4">No saved encounters yet</p>' : 
                            encounters.map(encounter => this.renderTemplate(this.templates.encounterCard, {
                                id: encounter.id,
                                name: encounter.name,
                                heroCount: encounter.heroes ? encounter.heroes.length : 0,
                                monsterCount: encounter.monsters ? encounter.monsters.length : 0
                            })).join('')
                        }
                    </div>
                </div>
            `,
            width: 'max-w-lg'
        });
        
        // Add event listeners for encounter list
        modal.querySelectorAll('.load-encounter-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const encounterId = btn.dataset.id;
                const encounter = await this.app.storage.getEncounter(encounterId);
                
                if (encounter) {
                    this.app.showConfirm(`This will replace all current combatants with the encounter "${encounter.name}". Are you sure?`, async () => {
                        try {
                            // Clear current combatants
                            this.app.combat.clearCombatants();
                            
                            // Add heroes from encounter
                            if (encounter.heroes && encounter.heroes.length > 0) {
                                for (const hero of encounter.heroes) {
                                    const heroData = {
                                        ...hero,
                                        id: `hero-${this.app.utils.generateShortId()}`,
                                        currentHp: hero.maxHp,
                                        conditions: []
                                    };
                                    this.app.combat.addCreature(heroData);
                                }
                            }
                            
                            // Add monsters from encounter
                            if (encounter.monsters && encounter.monsters.length > 0) {
                                for (const monster of encounter.monsters) {
                                    const monsterData = {
                                        ...monster,
                                        id: `monster-${this.app.utils.generateShortId()}`,
                                        currentHp: monster.maxHp,
                                        conditions: []
                                    };
                                    this.app.combat.addCreature(monsterData);
                                }
                            }
                            
                            this.app.showAlert(`Encounter "${encounter.name}" loaded successfully!`);
                            this.closeModal(modal);
                        } catch (error) {
                            console.error('Error loading encounter:', error);
                            this.app.showAlert(`Error loading encounter: ${error.message}`);
                        }
                    });
                }
            });
        });
        
        modal.querySelectorAll('.delete-encounter-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const encounterId = btn.dataset.id;
                const encounter = await this.app.storage.getEncounter(encounterId);
                
                if (encounter) {
                    this.app.showConfirm(`Are you sure you want to delete the encounter "${encounter.name}"?`, async () => {
                        try {
                            await this.app.storage.deleteEncounter(encounterId);
                            this.app.showAlert(`Encounter "${encounter.name}" deleted successfully!`);
                            this.openLoadEncounterModal(); // Refresh the modal
                        } catch (error) {
                            console.error('Error deleting encounter:', error);
                            this.app.showAlert(`Error deleting encounter: ${error.message}`);
                        }
                    });
                }
            });
        });
    }
    
    /**
     * Open the player view window
     */
    openPlayerView() {
        if (this.app.state.playerViewWindow && !this.app.state.playerViewWindow.closed) {
            this.app.state.playerViewWindow.focus();
            this.app.updatePlayerView();
            this.app.logEvent("Refreshed Player View.");
            return;
        }
        
        this.app.state.playerViewWindow = window.open("", "Player View", "width=800,height=900");
        
        if (this.app.state.playerViewWindow) {
            this.app.updatePlayerView();
            this.app.logEvent("Opened Player View.");
        } else {
            this.app.showAlert("Pop-up blocked! Please allow pop-ups for this site to use the Player View.");
            this.app.logEvent("Failed to open Player View: Pop-up blocked.");
        }
    }
    
    /**
     * Generate HTML for the player view
     * @returns {string} - The HTML for the player view
     */
    generatePlayerViewHTML() {
        const themes = {
            default: { bg: '#111827', cardBg: 'rgba(31, 41, 55, 0.9)', textColor: '#F3F4F6', headingColor: '#93C5FD' },
            dungeon: { bg: 'url("img/backgrounds/dungeon.jpg")', cardBg: 'rgba(17, 24, 39, 0.8)', textColor: '#D1D5DB', headingColor: '#9CA3AF' },
            forest: { bg: 'url("img/backgrounds/forest.jpg")', cardBg: 'rgba(13, 53, 26, 0.8)', textColor: '#F0FFF4', headingColor: '#A7F3D0' },
            castle: { bg: 'url("img/backgrounds/castle.jpg")', cardBg: 'rgba(31, 41, 55, 0.8)', textColor: '#F5F5F5', headingColor: '#E5E7EB' },
            tavern: { bg: 'url("img/backgrounds/tavern.jpg")', cardBg: 'rgba(55, 48, 41, 0.8)', textColor: '#FEF3C7', headingColor: '#FBBF24' }
        };
        
        const hpView = this.elements.playerHpView?.value || 'descriptive';
        const themeChoice = this.elements.playerViewTheme?.value || 'default';
        
        let currentTheme;
        if (themeChoice === 'custom' && this.elements.customThemeUrl?.value) {
            currentTheme = { 
                bg: `url("${this.elements.customThemeUrl.value}")`, 
                cardBg: 'rgba(31, 41, 55, 0.8)', 
                textColor: '#FFFFFF', 
                headingColor: '#FFFFFF' 
            };
        } else {
            currentTheme = themes[themeChoice] || themes.default;
        }
        
        const heroes = this.app.combat.getHeroes();
        const monsters = this.app.combat.getMonsters();
        
        const generateCombatantHTML = (combatant) => {
            let hpDisplay = '';
            if (hpView === 'descriptive') {
                const status = this.app.utils.getHpStatus(combatant.currentHp, combatant.maxHp);
                hpDisplay = `<span class="px-2 py-1 text-xs font-bold rounded-full ${status.color} text-white">${status.text}</span>`;
            } else if (hpView === 'exact') {
                if (combatant.type === 'hero') {
                    hpDisplay = `${combatant.currentHp} / ${combatant.maxHp} HP`;
                } else {
                    hpDisplay = ' '; // Empty space for monsters
                }
            } else {
                hpDisplay = ' '; // Hidden for both
            }
            
            if (combatant.tempHp > 0) {
                hpDisplay += ` <span class="text-blue-400">(+${combatant.tempHp} temp)</span>`;
            }
            
            const conditionsHTML = combatant.conditions.map(cond => {
                let condText = typeof cond === 'string' ? cond : cond.name;
                if (cond.roundsLeft !== null && cond.roundsLeft !== undefined) {
                    condText += ` (${cond.roundsLeft})`;
                }
                return `<span class="bg-yellow-600 text-black text-xs font-semibold px-2 py-0.5 rounded-full">${condText}</span>`;
            }).join(' ');
            
            let turnActiveClass = 'border-transparent';
            if (this.app.state.combatStarted) {
                if (this.app.state.currentTurn === combatant.id) {
                    turnActiveClass = 'border-yellow-400';
                }
            }
            
            const inspirationHTML = combatant.inspiration ? '<span class="text-yellow-400 text-2xl" title="Has Inspiration">★</span>' : '';
            
            // Determine if action economy items are used (crossed out)
            const actionUsed = combatant.action ? 'text-gray-600 line-through' : 'text-green-400';
            const bonusUsed = combatant.bonusAction ? 'text-gray-600 line-through' : 'text-green-400';
            const reactionUsed = combatant.reaction ? 'text-gray-600 line-through' : 'text-green-400';
            
            const actionEconomyHTML = `<div class="flex items-center space-x-2 mt-1"><span class="text-xs font-bold ${actionUsed}">Action</span><span class="text-xs font-bold ${bonusUsed}">Bonus</span><span class="text-xs font-bold ${reactionUsed}">Reaction</span></div>`;
            
            return `
                <div class="player-card p-4 rounded-lg flex items-center justify-between shadow-lg mb-3 border-4 ${turnActiveClass} transition-all duration-300">
                    <div class="flex items-center">
                        <img src="${combatant.img || `https://placehold.co/60x60/${combatant.type === 'hero' ? '3498db' : 'e74c3c'}/ffffff?text=${combatant.name.charAt(0).toUpperCase()}`}" 
                             onerror="this.onerror=null;this.src='https://placehold.co/60x60/1f2937/ffffff?text=?';" 
                             class="w-16 h-16 rounded-full mr-4 border-4 ${combatant.type === 'hero' ? 'border-blue-400' : 'border-red-400'}">
                        <div>
                            <p class="font-bold text-xl flex items-center gap-2">${inspirationHTML} ${combatant.name}</p>
                            ${actionEconomyHTML}
                            <div class="flex flex-wrap items-center gap-2 mt-1">
                                ${combatant.concentrating ? '<span class="text-xs font-bold text-purple-400 border border-purple-400 px-1 rounded-full">Concentrating</span>' : ''}
                                ${conditionsHTML}
                            </div>
                        </div>
                    </div>
                    <div class="text-right">
                        <span class="font-bold text-2xl text-gray-200">${combatant.initiative || ''}</span>
                        <p class="text-sm text-gray-400 mt-1 h-6">${hpDisplay}</p>
                    </div>
                </div>
            `;
        };
        
        const heroesHTML = heroes.length > 0 ? 
            heroes.map(hero => generateCombatantHTML(hero)).join('') : 
            '<p class="text-gray-500 text-center">No heroes in combat.</p>';
            
        const monstersHTML = monsters.length > 0 ? 
            monsters.map(monster => generateCombatantHTML(monster)).join('') : 
            '<p class="text-gray-500 text-center">No monsters in combat.</p>';
        
        let turnText = "Combat has not started";
        if (this.app.state.combatStarted) {
            const currentCreature = this.app.combat.getCreatureById(this.app.state.currentTurn);
            if (currentCreature) {
                turnText = `${currentCreature.name}'s Turn`;
            }
        }
        
        const headerHTML = this.app.state.combatStarted ?
            `<header class="text-center mb-6">
                <h1 class="text-4xl font-bold">Round ${this.app.state.roundNumber}</h1>
                <p class="text-3xl font-bold mt-2" style="color: #FBBF24;">${turnText}</p>
            </header>` :
            '<h1 class="text-3xl font-bold text-center mb-6">Prepare for Combat!</h1>';
        
        const bodyContent = `
            ${headerHTML}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto">
                <div>
                    <h2 class="text-2xl font-bold text-center mb-4" style="color: ${currentTheme.headingColor};">Heroes</h2>
                    ${heroesHTML}
                </div>
                <div>
                    <h2 class="text-2xl font-bold text-center mb-4" style="color: ${currentTheme.headingColor};">Monsters</h2>
                    ${monstersHTML}
                </div>
            </div>
        `;
        
        const styleHTML = `
            <style>
                body {
                    font-family: 'Inter', sans-serif;
                    background: ${currentTheme.bg};
                    background-size: cover;
                    background-position: center;
                    background-attachment: fixed;
                    color: ${currentTheme.textColor};
                    padding: 2rem;
                }
                .player-card {
                    background-color: ${currentTheme.cardBg};
                    backdrop-filter: blur(5px);
                    -webkit-backdrop-filter: blur(5px);
                }
                header h1 {
                   text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
                }
                @media (max-width: 768px) {
                    body {
                        padding: 1rem;
                    }
                }
            </style>
        `;
        
        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Combat Tracker - Player View</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
                <script src="https://cdn.tailwindcss.com"></script>
                ${styleHTML}
            </head>
            <body>
                ${bodyContent}
                <script>
                    // Auto-refresh every 5 seconds
                    setTimeout(() => {
                        location.reload();
                    }, 5000);
                </script>
            </body>
            </html>`;
    }
    
    /**
     * Search for monsters
     */
    async searchMonsters() {
        const query = this.elements.monsterSearchInput.value.trim();
        if (query.length < 2) {
            this.app.showAlert('Please enter at least 2 characters to search');
            return;
        }
        
        this.elements.monsterSearchResults.innerHTML = '<p class="text-center text-gray-400">Searching...</p>';
        
        const monsters = await this.app.api.searchMonsters(query);
        
        if (monsters.length === 0) {
            this.elements.monsterSearchResults.innerHTML = '<p class="text-center text-gray-400">No monsters found</p>';
            return;
        }
        
        this.elements.monsterSearchResults.innerHTML = monsters.map(monster => this.renderTemplate(this.templates.monsterSearchResult, {
            slug: monster.slug,
            name: monster.name,
            cr: monster.challenge_rating
        })).join('');
        
        // Add event listeners to monster results
        this.elements.monsterSearchResults.querySelectorAll('.monster-result').forEach(el => {
            el.addEventListener('click', async () => {
                const monsterId = el.dataset.monsterId;
                const monster = monsters.find(m => m.slug === monsterId);
                if (monster) {
                    this.displayMonsterStatblock(monster);
                }
            });
        });
    }
    
    /**
     * Display monster statblock
     * @param {Object} monster - The monster data
     */
    displayMonsterStatblock(monster) {
        // Helper to get modifier
        const getMod = (score) => {
            const mod = Math.floor((score - 10) / 2);
            return mod >= 0 ? `+${mod}` : mod;
        };
        
        // Format monster actions
        const formatActions = (actions) => {
            if (!actions || actions.length === 0) return '';
            
            return `
                <div class="mt-4">
                    <h4 class="text-lg font-semibold text-gray-300 border-b border-gray-600 pb-1 mb-2">Actions</h4>
                    ${actions.map(action => `
                        <div class="mb-2">
                            <p class="font-semibold">${action.name}</p>
                            <p class="text-sm">${action.desc}</p>
                        </div>
                    `).join('')}
                </div>
            `;
        };
        
        // Format special abilities
        const formatSpecialAbilities = (abilities) => {
            if (!abilities || abilities.length === 0) return '';
            
            return `
                <div class="mt-4">
                    <h4 class="text-lg font-semibold text-gray-300 border-b border-gray-600 pb-1 mb-2">Special Abilities</h4>
                    ${abilities.map(ability => `
                        <div class="mb-2">
                            <p class="font-semibold">${ability.name}</p>
                            <p class="text-sm">${ability.desc}</p>
                        </div>
                    `).join('')}
                </div>
            `;
        };
        
        // Format legendary actions
        const formatLegendaryActions = (actions) => {
            if (!actions || actions.length === 0) return '';
            
            return `
                <div class="mt-4">
                    <h4 class="text-lg font-semibold text-gray-300 border-b border-gray-600 pb-1 mb-2">Legendary Actions</h4>
                    <p class="text-sm mb-2">${monster.legendary_desc || ''}</p>
                    ${actions.map(action => `
                        <div class="mb-2">
                            <p class="font-semibold">${action.name}</p>
                            <p class="text-sm">${action.desc}</p>
                        </div>
                    `).join('')}
                </div>
            `;
        };
        
        const modal = this.createModal({
            title: monster.name,
            content: `
                <div class="text-gray-300">
                    <p class="mb-4">${monster.size} ${monster.type}, ${monster.alignment}</p>
                    
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <p><span class="font-semibold text-gray-400">Armor Class:</span> ${monster.armor_class}</p>
                            <p><span class="font-semibold text-gray-400">Hit Points:</span> ${monster.hit_points} (${monster.hit_dice})</p>
                            <p><span class="font-semibold text-gray-400">Speed:</span> ${Object.entries(monster.speed || {}).map(([type, value]) => `${type} ${value}`).join(', ')}</p>
                        </div>
                        <div>
                            <p><span class="font-semibold text-gray-400">Challenge Rating:</span> ${monster.challenge_rating}</p>
                            <p><span class="font-semibold text-gray-400">XP:</span> ${monster.xp || 'N/A'}</p>
                            <p><span class="font-semibold text-gray-400">Passive Perception:</span> ${monster.passive_perception || 10}</p>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-6 gap-2 text-center mb-4 bg-gray-700 p-2 rounded">
                        <div>
                            <p class="font-semibold text-gray-400">STR</p>
                            <p>${monster.strength} (${getMod(monster.strength)})</p>
                        </div>
                        <div>
                            <p class="font-semibold text-gray-400">DEX</p>
                            <p>${monster.dexterity} (${getMod(monster.dexterity)})</p>
                        </div>
                        <div>
                            <p class="font-semibold text-gray-400">CON</p>
                            <p>${monster.constitution} (${getMod(monster.constitution)})</p>
                        </div>
                        <div>
                            <p class="font-semibold text-gray-400">INT</p>
                            <p>${monster.intelligence} (${getMod(monster.intelligence)})</p>
                        </div>
                        <div>
                            <p class="font-semibold text-gray-400">WIS</p>
                            <p>${monster.wisdom} (${getMod(monster.wisdom)})</p>
                        </div>
                        <div>
                            <p class="font-semibold text-gray-400">CHA</p>
                            <p>${monster.charisma} (${getMod(monster.charisma)})</p>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <p><span class="font-semibold text-gray-400">Saving Throws:</span> ${
                                [
                                    monster.strength_save ? `Str +${monster.strength_save}` : null,
                                    monster.dexterity_save ? `Dex +${monster.dexterity_save}` : null,
                                    monster.constitution_save ? `Con +${monster.constitution_save}` : null,
                                    monster.intelligence_save ? `Int +${monster.intelligence_save}` : null,
                                    monster.wisdom_save ? `Wis +${monster.wisdom_save}` : null,
                                    monster.charisma_save ? `Cha +${monster.charisma_save}` : null
                                ].filter(Boolean).join(', ') || 'None'
                            }</p>
                        </div>
                        <div>
                            <p><span class="font-semibold text-gray-400">Skills:</span> ${
                                monster.skills ? Object.entries(monster.skills).map(([skill, bonus]) => 
                                    `${skill.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} +${bonus}`
                                ).join(', ') : 'None'
                            }</p>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <p><span class="font-semibold text-gray-400">Damage Vulnerabilities:</span> ${monster.damage_vulnerabilities || 'None'}</p>
                            <p><span class="font-semibold text-gray-400">Damage Resistances:</span> ${monster.damage_resistances || 'None'}</p>
                            <p><span class="font-semibold text-gray-400">Damage Immunities:</span> ${monster.damage_immunities || 'None'}</p>
                        </div>
                        <div>
                            <p><span class="font-semibold text-gray-400">Condition Immunities:</span> ${monster.condition_immunities || 'None'}</p>
                            <p><span class="font-semibold text-gray-400">Senses:</span> ${monster.senses || 'None'}</p>
                            <p><span class="font-semibold text-gray-400">Languages:</span> ${monster.languages || 'None'}</p>
                        </div>
                    </div>
                    
                    ${formatSpecialAbilities(monster.special_abilities)}
                    ${formatActions(monster.actions)}
                    ${formatLegendaryActions(monster.legendary_actions)}
                    
                    <div class="mt-6 flex justify-between">
                        <button id="add-to-combat-btn" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                            Add to Combat
                        </button>
                        <div class="flex items-center">
                            <label class="mr-2">Quantity:</label>
                            <input type="number" id="monster-quantity" value="1" min="1" class="bg-gray-700 w-16 text-center rounded p-1">
                        </div>
                    </div>
                </div>
            `,
            width: 'max-w-4xl'
        });
        
        // Add event listener for add to combat button
        const addToCombatBtn = modal.querySelector('#add-to-combat-btn');
        addToCombatBtn.addEventListener('click', async () => {
            const quantity = parseInt(modal.querySelector('#monster-quantity').value) || 1;
            
            // Calculate initiative modifier (DEX)
            const dexMod = Math.floor((monster.dexterity - 10) / 2);
            
            for (let i = 0; i < quantity; i++) {
                const monsterData = {
                    id: `monster-${this.app.utils.generateShortId()}`,
                    name: quantity > 1 ? `${monster.name} ${i + 1}` : monster.name,
                    type: 'monster',
                    maxHp: monster.hit_points,
                    currentHp: monster.hit_points,
                    ac: monster.armor_class,
                    initiativeModifier: dexMod,
                    str: monster.strength,
                    dex: monster.dexterity,
                    con: monster.constitution,
                    int: monster.intelligence,
                    wis: monster.wisdom,
                    cha: monster.charisma,
                    pp: monster.passive_perception || 10,
                    conditions: [],
                    srdData: monster
                };
                
                this.app.combat.addCreature(monsterData);
            }
            
            this.closeModal(modal);
        });
        
        // Add event listener to save monster to collection
        const saveBtn = document.createElement('button');
        saveBtn.className = 'bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded';
        saveBtn.textContent = 'Save to Collection';
        saveBtn.addEventListener('click', async () => {
            try {
                // Format monster data for storage
                const monsterData = {
                    id: `srd-${monster.slug}`,
                    name: monster.name,
                    type: 'monster',
                    hp: monster.hit_points,
                    ac: monster.armor_class,
                    cr: monster.challenge_rating,
                    str: monster.strength,
                    dex: monster.dexterity,
                    con: monster.constitution,
                    int: monster.intelligence,
                    wis: monster.wisdom,
                    cha: monster.charisma,
                    initiativeModifier: Math.floor((monster.dexterity - 10) / 2),
                    pp: monster.passive_perception || 10,
                    srdData: monster,
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                };
                
                await this.app.storage.saveMonster(monsterData);
                this.app.showAlert(`${monster.name} saved to your collection!`);
            } catch (error) {
                console.error('Error saving monster:', error);
                this.app.showAlert(`Error saving monster: ${error.message}`);
            }
        });
        
        // Add the save button to the modal
        const buttonContainer = modal.querySelector('#add-to-combat-btn').parentElement;
        buttonContainer.insertBefore(saveBtn, buttonContainer.firstChild);
    }
    
    /**
     * Open the about modal
     */
    openAboutModal() {
        const modal = this.createModal({
            title: `About Jesster's Combat Tracker`,
            content: `
                <div class="text-center mb-6">
                    <p class="text-xl font-semibold text-primary-400">Version ${this.app.state.version}</p>
                    <p class="text-gray-300 mt-2">Created by Jesster</p>
                </div>
                
                <div class="space-y-4 text-gray-300">
                    <p>Jesster's Combat Tracker is a tool designed to help Dungeon Masters run combat encounters in tabletop role-playing games like Dungeons & Dragons.</p>
                    
                    <p>Features include:</p>
                    <ul class="list-disc list-inside space-y-1 pl-4">
                        <li>Initiative tracking</li>
                        <li>HP and condition management</li>
                        <li>Dice rolling</li>
                        <li>Player view for sharing with your group</li>
                        <li>Monster search with Open5e integration</li>
                        <li>Character management with D&D Beyond import</li>
                        <li>Encounter saving and loading</li>
                    </ul>
                    
                    <p class="mt-4">This application is not affiliated with Wizards of the Coast or D&D Beyond.</p>
                    
                    <p class="mt-4">Monster data is provided by the <a href="https://open5e.com/" target="_blank" class="text-primary-400 hover:text-primary-300">Open5e API</a> under the OGL.</p>
                </div>
            `,
            width: 'max-w-2xl'
        });
    }
    
       /**
     * Create a modal
     * @param {Object} options - Modal options
     * @param {string} options.title - Modal title
     * @param {string} options.content - Modal content
     * @param {string} [options.width='max-w-lg'] - Modal width
     * @returns {HTMLElement} - The modal element
     */
    createModal(options) {
        const { title, content, width = 'max-w-lg' } = options;
        
        // Create modal container
        const modalContainer = document.createElement('div');
        modalContainer.className = 'fixed inset-0 flex items-center justify-center z-50 p-4 modal-backdrop';
        modalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
        modalContainer.style.backdropFilter = 'blur(4px)';
        
        // Create modal content
        modalContainer.innerHTML = `
            <div class="bg-gray-800 rounded-lg shadow-2xl p-6 ${width} w-full mx-auto fade-in" style="max-height: 90vh; overflow-y: auto;">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-2xl font-bold text-primary-400">${title}</h3>
                    <button class="modal-close-btn text-red-500 hover:text-red-400 font-bold text-2xl">✖</button>
                </div>
                ${content}
            </div>
        `;
        
        // Add to DOM
        document.body.appendChild(modalContainer);
        
        // Add event listener for close button
        const closeBtn = modalContainer.querySelector('.modal-close-btn');
        closeBtn.addEventListener('click', () => {
            this.closeModal(modalContainer);
        });
        
        // Add event listener for clicking outside
        modalContainer.addEventListener('click', (e) => {
            if (e.target === modalContainer) {
                this.closeModal(modalContainer);
            }
        });
        
        // Add to modal stack
        this.modalStack.push(modalContainer);
        
        return modalContainer;
    }
    
    /**
     * Close a modal
     * @param {HTMLElement} modal - The modal to close
     */
    closeModal(modal) {
        // Remove from modal stack
        this.modalStack = this.modalStack.filter(m => m !== modal);
        
        // Remove from DOM
        modal.remove();
    }
    
    /**
     * Close all modals
     */
    closeAllModals() {
        // Close all modals in the stack
        while (this.modalStack.length > 0) {
            const modal = this.modalStack.pop();
            modal.remove();
        }
    }
    
    /**
     * Show an alert message
     * @param {string} message - The message to show
     * @param {string} [title='Notification'] - The title of the alert
     */
    showAlert(message, title = 'Notification') {
        const modal = this.createModal({
            title: title,
            content: `
                <p class="text-gray-300 mb-6">${message}</p>
                <div class="flex justify-end">
                    <button class="alert-ok-btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">OK</button>
                </div>
            `,
            width: 'max-w-md'
        });
        
        const okBtn = modal.querySelector('.alert-ok-btn');
        okBtn.addEventListener('click', () => {
            this.closeModal(modal);
        });
        
        // Focus the OK button
        okBtn.focus();
    }
    
    /**
     * Show a confirmation dialog
     * @param {string} message - The message to show
     * @param {Function} onConfirm - The function to call when confirmed
     * @param {string} [title='Confirm'] - The title of the confirmation
     */
    showConfirm(message, onConfirm, title = 'Confirm') {
        const modal = this.createModal({
            title: title,
            content: `
                <p class="text-gray-300 mb-6">${message}</p>
                <div class="flex justify-end space-x-2">
                    <button class="confirm-cancel-btn bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Cancel</button>
                    <button class="confirm-ok-btn bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Confirm</button>
                </div>
            `,
            width: 'max-w-md'
        });
        
        const cancelBtn = modal.querySelector('.confirm-cancel-btn');
        const okBtn = modal.querySelector('.confirm-ok-btn');
        
        cancelBtn.addEventListener('click', () => {
            this.closeModal(modal);
        });
        
        okBtn.addEventListener('click', () => {
            onConfirm();
            this.closeModal(modal);
        });
        
        // Focus the OK button
        okBtn.focus();
    }
    
    /**
     * Render the combat log
     */
    renderCombatLog() {
        const logContainer = this.elements.combatLog;
        if (!logContainer) return;
        
        const logs = this.app.state.combatLog;
        
        if (logs.length === 0) {
            logContainer.innerHTML = '<div class="text-gray-400">Combat log will appear here...</div>';
            return;
        }
        
        // Only show the last 100 log entries to prevent performance issues
        const recentLogs = logs.slice(-100);
        
        logContainer.innerHTML = recentLogs.map(log => `
            <div class="log-entry">${log}</div>
        `).join('');
        
        // Scroll to bottom
        logContainer.scrollTop = logContainer.scrollHeight;
    }
    
    /**
     * Render creatures
     */
    renderCreatures() {
        const container = this.elements.creaturesContainer;
        if (!container) return;
        
        const creatures = this.app.combat.getAllCreatures();
        
        if (creatures.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-400 py-8">
                    No creatures added yet. Click "Add Hero" or "Add Monster" to begin.
                </div>
            `;
            return;
        }
        
        container.innerHTML = creatures.map(creature => this.renderTemplate(this.templates.creatureCard, {
            id: creature.id,
            name: creature.name,
            typeIcon: creature.type === 'hero' ? '🛡️' : '👹',
            currentHp: creature.currentHp,
            maxHp: creature.maxHp,
            ac: creature.ac,
            initiative: creature.initiative,
            conditions: creature.conditions
        })).join('');
        
        // Add event listeners for creature buttons
        container.querySelectorAll('.damage-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const creatureId = e.target.dataset.creatureId;
                this.openDamageModal(creatureId);
            });
        });
        
        container.querySelectorAll('.heal-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const creatureId = e.target.dataset.creatureId;
                this.openHealModal(creatureId);
            });
        });
        
        container.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const creatureId = e.target.dataset.creatureId;
                const creature = this.app.combat.getCreatureById(creatureId);
                
                if (creature) {
                    this.app.showConfirm(`Are you sure you want to remove ${creature.name} from combat?`, () => {
                        this.app.combat.removeCreature(creatureId);
                    });
                }
            });
        });
    }
    
    /**
     * Render initiative order
     */
    renderInitiativeOrder() {
        const container = this.elements.initiativeContainer;
        if (!container) return;
        
        const creatures = this.app.combat.getCreaturesWithInitiative();
        
        if (creatures.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-400 py-4">
                    No initiative rolled yet
                </div>
            `;
            return;
        }
        
        container.innerHTML = creatures.map((creature, index) => this.renderTemplate(this.templates.initiativeItem, {
            index: index + 1,
            name: creature.name,
            typeIcon: creature.type === 'hero' ? '🛡️' : '👹',
            initiative: creature.initiative,
            active: creature.id === this.app.state.currentTurn
        })).join('');
    }
    
    /**
     * Open damage modal
     * @param {string} creatureId - The ID of the creature to damage
     */
    openDamageModal(creatureId) {
        const creature = this.app.combat.getCreatureById(creatureId);
        if (!creature) return;
        
        const modal = this.createModal({
            title: `Damage ${creature.name}`,
            content: `
                <div class="space-y-4">
                    <div>
                        <label class="block text-gray-300 mb-2">Damage Amount:</label>
                        <input type="number" id="damage-amount" class="w-full bg-gray-700 text-white px-3 py-2 rounded" min="0" required>
                    </div>
                    
                    <div>
                        <label class="block text-gray-300 mb-2">Damage Type (optional):</label>
                        <select id="damage-type" class="w-full bg-gray-700 text-white px-3 py-2 rounded">
                            <option value="">-- Select Type --</option>
                            <option value="acid">Acid</option>
                            <option value="bludgeoning">Bludgeoning</option>
                            <option value="cold">Cold</option>
                            <option value="fire">Fire</option>
                            <option value="force">Force</option>
                            <option value="lightning">Lightning</option>
                            <option value="necrotic">Necrotic</option>
                            <option value="piercing">Piercing</option>
                            <option value="poison">Poison</option>
                            <option value="psychic">Psychic</option>
                            <option value="radiant">Radiant</option>
                            <option value="slashing">Slashing</option>
                            <option value="thunder">Thunder</option>
                        </select>
                    </div>
                    
                    <div class="flex justify-end space-x-2">
                        <button class="damage-cancel-btn bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                            Cancel
                        </button>
                        <button class="damage-apply-btn bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                            Apply Damage
                        </button>
                    </div>
                </div>
            `,
            width: 'max-w-md'
        });
        
        const damageAmount = modal.querySelector('#damage-amount');
        const damageType = modal.querySelector('#damage-type');
        const cancelBtn = modal.querySelector('.damage-cancel-btn');
        const applyBtn = modal.querySelector('.damage-apply-btn');
        
        // Focus the damage amount input
        damageAmount.focus();
        
        cancelBtn.addEventListener('click', () => {
            this.closeModal(modal);
        });
        
        applyBtn.addEventListener('click', () => {
            const amount = parseInt(damageAmount.value);
            const type = damageType.value;
            
            if (!amount || amount <= 0) {
                this.app.showAlert('Please enter a valid damage amount.');
                return;
            }
            
            this.app.damage.applyDamage(creatureId, amount, type);
            this.closeModal(modal);
        });
        
        // Add enter key support
        damageAmount.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                applyBtn.click();
            }
        });
    }
    
    /**
     * Open heal modal
     * @param {string} creatureId - The ID of the creature to heal
     */
    openHealModal(creatureId) {
        const creature = this.app.combat.getCreatureById(creatureId);
        if (!creature) return;
        
        const modal = this.createModal({
            title: `Heal ${creature.name}`,
            content: `
                <div class="space-y-4">
                    <div>
                        <label class="block text-gray-300 mb-2">Healing Amount:</label>
                        <input type="number" id="heal-amount" class="w-full bg-gray-700 text-white px-3 py-2 rounded" min="0" required>
                    </div>
                    
                    <div>
                        <label class="block text-gray-300 mb-2">Temporary HP (optional):</label>
                        <input type="number" id="temp-hp" class="w-full bg-gray-700 text-white px-3 py-2 rounded" min="0">
                    </div>
                    
                    <div class="flex justify-end space-x-2">
                        <button class="heal-cancel-btn bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                            Cancel
                        </button>
                        <button class="heal-apply-btn bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                            Apply Healing
                        </button>
                    </div>
                </div>
            `,
            width: 'max-w-md'
        });
        
        const healAmount = modal.querySelector('#heal-amount');
        const tempHp = modal.querySelector('#temp-hp');
        const cancelBtn = modal.querySelector('.heal-cancel-btn');
        const applyBtn = modal.querySelector('.heal-apply-btn');
        
        // Focus the heal amount input
        healAmount.focus();
        
        cancelBtn.addEventListener('click', () => {
            this.closeModal(modal);
        });
        
        applyBtn.addEventListener('click', () => {
            const amount = parseInt(healAmount.value) || 0;
            const temp = parseInt(tempHp.value) || 0;
            
            if (amount <= 0 && temp <= 0) {
                this.app.showAlert('Please enter a valid healing amount or temporary HP.');
                return;
            }
            
            if (amount > 0) {
                this.app.damage.applyHealing(creatureId, amount);
            }
            
            if (temp > 0) {
                this.app.damage.applyTempHp(creatureId, temp);
            }
            
            this.closeModal(modal);
        });
        
        // Add enter key support
        healAmount.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                applyBtn.click();
            }
        });
    }
    
    /**
     * Render a template with data
     * @param {string} template - The template string
     * @param {Object} data - The data to render
     * @returns {string} - The rendered template
     */
    renderTemplate(template, data) {
        let result = template;
        
        // Replace simple variables
        for (const key in data) {
            const value = data[key];
            result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }
        
        // Handle conditionals
        result = result.replace(/{{#if ([^}]+)}}\s*([\s\S]*?)\s*{{\/if}}/g, (match, condition, content) => {
            const value = this.evaluateCondition(condition, data);
            return value ? content : '';
        });
        
        // Handle loops
        result = result.replace(/{{#each ([^}]+)}}\s*([\s\S]*?)\s*{{\/each}}/g, (match, arrayName, content) => {
            const array = data[arrayName];
            if (!array || !Array.isArray(array) || array.length === 0) {
                return '';
            }
            
            return array.map(item => {
                let itemContent = content;
                
                // Replace item properties
                if (typeof item === 'object') {
                    for (const key in item) {
                        itemContent = itemContent.replace(new RegExp(`{{this.${key}}}`, 'g'), item[key]);
                    }
                } else {
                    itemContent = itemContent.replace(/{{this}}/g, item);
                }
                
                return itemContent;
            }).join('');
        });
        
        return result;
    }
    
    /**
     * Evaluate a condition for template rendering
     * @param {string} condition - The condition to evaluate
     * @param {Object} data - The data context
     * @returns {boolean} - The result of the condition
     */
    evaluateCondition(condition, data) {
        // Simple property check
        if (data[condition] !== undefined) {
            return Boolean(data[condition]);
        }
        
        // Array length check
        const lengthMatch = condition.match(/([a-zA-Z0-9_]+)\.length/);
        if (lengthMatch && data[lengthMatch[1]] && Array.isArray(data[lengthMatch[1]])) {
            return data[lengthMatch[1]].length > 0;
        }
        
        // Comparison operators
        const compareMatch = condition.match(/([a-zA-Z0-9_]+)\s*(===|==|!==|!=|>=|<=|>|<)\s*([a-zA-Z0-9_'"]+)/);
        if (compareMatch) {
            const [, left, operator, right] = compareMatch;
            const leftValue = data[left];
            
            // Parse right value (could be a literal or another property)
            let rightValue;
            if (right.startsWith("'") || right.startsWith('"')) {
                rightValue = right.slice(1, -1); // Remove quotes
            } else if (!isNaN(right)) {
                rightValue = Number(right);
            } else {
                rightValue = data[right];
            }
            
            switch (operator) {
                case '===':
                case '==': return leftValue == rightValue;
                case '!==':
                case '!=': return leftValue != rightValue;
                case '>=': return leftValue >= rightValue;
                case '<=': return leftValue <= rightValue;
                case '>': return leftValue > rightValue;
                case '<': return leftValue < rightValue;
                default: return false;
            }
        }
        
        return false;
    }
}
