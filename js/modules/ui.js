/**
 * UI Manager for Jesster's Combat Tracker
 * Handles all UI-related functionality
 */
class UIManager {
    constructor(app) {
        this.app = app;
        this.modals = [];
        this.templates = {};
        this.playerViewSettings = {
            hpDisplay: 'descriptive', // 'descriptive', 'exact', 'hidden'
            theme: 'default',
            customBackground: ''
        };
    }
    
    /**
     * Initialize the UI manager
     */
    async init() {
        // Load templates
        this.loadTemplates();
        
        // Add event listeners for dynamic elements
        this.addDynamicEventListeners();
        
        console.log("UI Manager initialized");
    }
    
    /**
     * Load HTML templates
     */
    loadTemplates() {
        // Get all templates
        const templateElements = document.querySelectorAll('template');
        
        // Store each template by ID
        templateElements.forEach(template => {
            const id = template.id.replace('-template', '');
            this.templates[id] = template.innerHTML;
        });
    }
    
    /**
     * Add event listeners for dynamically created elements
     */
    addDynamicEventListeners() {
        // Use event delegation for dynamically created elements
        document.addEventListener('click', (event) => {
            // Damage button
            if (event.target.closest('.damage-btn')) {
                const btn = event.target.closest('.damage-btn');
                const creatureId = btn.dataset.creatureId;
                this.app.damage.openDamageModal(creatureId);
            }
            
            // Heal button
            if (event.target.closest('.heal-btn')) {
                const btn = event.target.closest('.heal-btn');
                const creatureId = btn.dataset.creatureId;
                this.app.damage.openHealModal(creatureId);
            }
            
            // Remove button
            if (event.target.closest('.remove-btn')) {
                const btn = event.target.closest('.remove-btn');
                const creatureId = btn.dataset.creatureId;
                const creature = this.app.combat.getCreatureById(creatureId);
                
                if (creature) {
                    this.app.showConfirm(`Are you sure you want to remove ${creature.name} from combat?`, () => {
                        this.app.combat.removeCreature(creatureId);
                    });
                }
            }
            
            // Creature card (for context menu)
            if (event.target.closest('.creature-card')) {
                const card = event.target.closest('.creature-card');
                // Only handle right-click in a separate handler
                if (!event.target.closest('.damage-btn') && 
                    !event.target.closest('.heal-btn') && 
                    !event.target.closest('.remove-btn')) {
                    // Handle left-click on creature card
                    // For example, show details or select the creature
                }
            }
        });
        
        // Context menu for creature cards
        document.addEventListener('contextmenu', (event) => {
            const card = event.target.closest('.creature-card');
            if (card) {
                event.preventDefault();
                const creatureId = card.dataset.id;
                this.showCreatureContextMenu(creatureId, event.clientX, event.clientY);
            }
        });
    }
    
    /**
     * Render all creatures
     */
    renderCreatures() {
        const container = document.getElementById('creatures-container');
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
        
        container.innerHTML = '';
        
        creatures.forEach(creature => {
            const hpPercentage = Math.max(0, Math.min(100, (creature.currentHp / creature.maxHp) * 100));
            const typeIcon = creature.type === 'hero' ? '👤' : '👹';
            
            const html = this.templates['creature-card']
                .replace(/{{id}}/g, creature.id)
                .replace(/{{name}}/g, creature.name)
                .replace(/{{typeIcon}}/g, typeIcon)
                .replace(/{{currentHp}}/g, creature.currentHp)
                .replace(/{{maxHp}}/g, creature.maxHp)
                .replace(/{{hpPercentage}}/g, hpPercentage)
                .replace(/{{ac}}/g, creature.ac)
                .replace(/{{initiative}}/g, creature.initiative !== null ? creature.initiative : '-');
            
            // Handle conditions
            let conditionsHtml = '';
            if (creature.conditions && creature.conditions.length > 0) {
                conditionsHtml = creature.conditions.map(condition => {
                    const name = typeof condition === 'string' ? condition : condition.name;
                    const rounds = typeof condition === 'string' ? null : condition.roundsLeft;
                    return `<span class="bg-yellow-600 text-yellow-100 px-1 py-0.5 rounded-full text-xs">${name}${rounds !== null ? ` (${rounds})` : ''}</span>`;
                }).join(' ');
            } else {
                conditionsHtml = '<span class="text-gray-400 text-xs">None</span>';
            }
            
            // Handle character image
            let imageHtml = '';
            if (creature.imageUrl) {
                imageHtml = `<img src="${creature.imageUrl}" alt="${creature.name}" class="character-image mr-2">`;
            }
            
            const cardElement = document.createElement('div');
            cardElement.className = 'creature-card bg-gray-700 rounded-lg shadow mb-4 p-3';
            cardElement.dataset.id = creature.id;
            
            cardElement.innerHTML = `
                <div class="flex justify-between items-center mb-2">
                    <div class="flex items-center">
                        ${imageHtml}
                        <span class="text-xl font-bold">${typeIcon} ${creature.name}</span>
                    </div>
                    <div class="flex space-x-1">
                        <button class="damage-btn bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs" data-creature-id="${creature.id}">
                            Damage
                        </button>
                        <button class="heal-btn bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-xs" data-creature-id="${creature.id}">
                            Heal
                        </button>
                        <button class="remove-btn bg-gray-600 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded text-xs" data-creature-id="${creature.id}">
                            Remove
                        </button>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-2 mb-2">
                    <div>
                        <div class="text-xs text-gray-400">HP</div>
                        <div class="flex items-center">
                            <span class="font-semibold">${creature.currentHp}/${creature.maxHp}</span>
                            <div class="ml-2 flex-1 hp-bar bg-gray-600">
                                <div class="bg-green-600 h-full" style="width: ${hpPercentage}%"></div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div class="text-xs text-gray-400">AC</div>
                        <div class="font-semibold">${creature.ac}</div>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-2 mb-2">
                    <div>
                        <div class="text-xs text-gray-400">Initiative</div>
                        <div class="font-semibold">${creature.initiative !== null ? creature.initiative : '-'}</div>
                    </div>
                    <div>
                        <div class="text-xs text-gray-400">Conditions</div>
                        <div class="flex flex-wrap gap-1">
                            ${conditionsHtml}
                        </div>
                    </div>
                </div>
            `;
            
            container.appendChild(cardElement);
            
            // Highlight the current turn
            if (this.app.state.combatStarted && this.app.state.currentTurn === creature.id) {
                cardElement.classList.add('ring-2', 'ring-blue-500');
            }
        });
    }
    
    /**
     * Render the initiative order
     */
    renderInitiativeOrder() {
        const container = document.getElementById('initiative-container');
        if (!container) return;
        
        const creatures = this.app.combat.getInitiativeOrder();
        
        if (creatures.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-400 py-4">
                    No initiative rolled yet
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        
        creatures.forEach((creature, index) => {
            const typeIcon = creature.type === 'hero' ? '👤' : '👹';
            const isActive = this.app.state.combatStarted && this.app.state.currentTurn === creature.id;
            
            // Handle character image
            let imageHtml = '';
            if (creature.imageUrl) {
                imageHtml = `<img src="${creature.imageUrl}" alt="${creature.name}" class="character-image w-6 h-6 mr-2">`;
            }
            
            const itemElement = document.createElement('div');
            itemElement.className = `initiative-item p-2 mb-1 rounded flex justify-between items-center ${isActive ? 'bg-blue-900' : 'bg-gray-700'}`;
            
            itemElement.innerHTML = `
                <div class="flex items-center">
                    <span class="w-6 h-6 flex items-center justify-center bg-gray-600 rounded-full text-sm mr-2">${index + 1}</span>
                    ${imageHtml}
                    <span>${typeIcon} ${creature.name}</span>
                </div>
                <div class="font-bold">${creature.initiative}</div>
            `;
            
            container.appendChild(itemElement);
        });
    }
    
    /**
     * Render the combat log
     */
    renderCombatLog() {
        const container = document.getElementById('combat-log');
        if (!container) return;
        
        const log = this.app.state.combatLog;
        
        if (log.length === 0) {
            container.innerHTML = `<div class="text-gray-400">Combat log will appear here...</div>`;
            return;
        }
        
        container.innerHTML = '';
        
        log.forEach(entry => {
            const entryElement = document.createElement('div');
            entryElement.className = 'log-entry text-sm';
            entryElement.textContent = entry;
            container.appendChild(entryElement);
        });
        
        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    }
    
    /**
     * Show a creature context menu
     * @param {string} creatureId - The ID of the creature
     * @param {number} x - The x position of the menu
     * @param {number} y - The y position of the menu
     */
    showCreatureContextMenu(creatureId, x, y) {
        const creature = this.app.combat.getCreatureById(creatureId);
        if (!creature) return;
        
        // Remove any existing context menu
        this.closeContextMenu();
        
        // Create the context menu
        const menu = document.createElement('div');
        menu.id = 'context-menu';
        menu.className = 'fixed bg-gray-800 rounded shadow-lg z-50 overflow-hidden';
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
        
        // Menu items
        const items = [
            { text: 'Apply Damage', icon: '🗡️', action: () => this.app.damage.openDamageModal(creatureId) },
            { text: 'Apply Healing', icon: '❤️', action: () => this.app.damage.openHealModal(creatureId) },
            { text: 'Add Condition', icon: '⚠️', action: () => this.app.conditions.openAddConditionModal(creatureId) },
            { text: 'Manage Conditions', icon: '📋', action: () => this.app.conditions.openManageConditionsModal(creatureId) },
            { text: 'Edit Character', icon: '✏️', action: () => this.openEditCreatureModal(creatureId) },
            { text: 'Set Image URL', icon: '🖼️', action: () => this.openSetImageModal(creatureId) },
            { text: 'Remove from Combat', icon: '❌', action: () => {
                this.app.showConfirm(`Are you sure you want to remove ${creature.name} from combat?`, () => {
                    this.app.combat.removeCreature(creatureId);
                });
            }}
        ];
        
        // Create menu items
        items.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'px-4 py-2 hover:bg-gray-700 cursor-pointer flex items-center';
            menuItem.innerHTML = `<span class="mr-2">${item.icon}</span> ${item.text}`;
            menuItem.addEventListener('click', () => {
                this.closeContextMenu();
                item.action();
            });
            menu.appendChild(menuItem);
        });
        
        // Add the menu to the document
        document.body.appendChild(menu);
        
        // Close the menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', this.closeContextMenu);
        }, 0);
    }
    
    /**
     * Close the context menu
     */
    closeContextMenu() {
        const menu = document.getElementById('context-menu');
        if (menu) {
            menu.remove();
            document.removeEventListener('click', this.closeContextMenu);
        }
    }
    
    /**
     * Open the set image modal for a creature
     * @param {string} creatureId - The ID of the creature
     */
    openSetImageModal(creatureId) {
        const creature = this.app.combat.getCreatureById(creatureId);
        if (!creature) return;
        
        const modal = this.createModal({
            title: `Set Image for ${creature.name}`,
            content: `
                <div class="space-y-4">
                    <p class="text-gray-300 mb-4">Enter the URL of the character image:</p>
                    
                    <div class="mb-4">
                        <label class="block text-gray-300 mb-2">Image URL:</label>
                        <input type="text" id="image-url-input" class="w-full bg-gray-700 text-white px-3 py-2 rounded" 
                            value="${creature.imageUrl || ''}" placeholder="https://example.com/character-image.jpg">
                    </div>
                    
                    <div class="mb-4">
                        <p class="text-sm text-gray-400">
                            For D&D Beyond characters, you can right-click on the character portrait and select "Copy Image Address".
                        </p>
                    </div>
                    
                    <div id="image-preview" class="mb-4 flex justify-center items-center ${creature.imageUrl ? '' : 'hidden'}">
                        <img src="${creature.imageUrl || ''}" alt="Preview" class="max-h-40 rounded">
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
        const imageUrlInput = modal.querySelector('#image-url-input');
        const imagePreview = modal.querySelector('#image-preview');
        const cancelBtn = modal.querySelector('#cancel-btn');
        const saveBtn = modal.querySelector('#save-btn');
        
        // Preview image when URL changes
        imageUrlInput.addEventListener('input', () => {
            const url = imageUrlInput.value.trim();
            if (url) {
                const img = imagePreview.querySelector('img');
                img.src = url;
                imagePreview.classList.remove('hidden');
                
                // Handle image load error
                img.onerror = () => {
                    img.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2232%22%20height%3D%2232%22%20viewBox%3D%220%200%2032%2032%22%3E%3Cpath%20fill%3D%22%23D32F2F%22%20d%3D%22M16%202C8.268%202%202%208.268%202%2016s6.268%2014%2014%2014%2014-6.268%2014-14S23.732%202%2016%202zm0%2025.6c-6.408%200-11.6-5.192-11.6-11.6S9.592%204.4%2016%204.4%2027.6%209.592%2027.6%2016%2022.408%2027.6%2016%2027.6z%22%2F%3E%3Cpath%20fill%3D%22%23D32F2F%22%20d%3D%22M14.8%2010.4h2.4v8h-2.4v-8zm0%2010.4h2.4v2.4h-2.4v-2.4z%22%2F%3E%3C%2Fsvg%3E';
                };
                
                // Reset error handler when image loads successfully
                img.onload = () => {
                    img.onerror = null;
                };
            } else {
                imagePreview.classList.add('hidden');
            }
        });
        
        cancelBtn.addEventListener('click', () => {
            this.closeModal(modal);
        });
        
        saveBtn.addEventListener('click', () => {
            const url = imageUrlInput.value.trim();
            
            // Update the creature
            this.app.combat.updateCreature(creatureId, { imageUrl: url || null });
            
            // Close the modal
            this.closeModal(modal);
            
            // Log the event
            this.app.logEvent(`Image updated for ${creature.name}.`);
        });
    }
    
        /**
     * Open the add hero modal
     */
    openAddHeroModal() {
        const modal = this.createModal({
            title: 'Add Hero',
            content: `
                <div class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-gray-300 mb-2">Name:</label>
                            <input type="text" id="hero-name" class="w-full bg-gray-700 text-white px-3 py-2 rounded" required>
                        </div>
                        <div>
                            <label class="block text-gray-300 mb-2">Initiative Bonus:</label>
                            <input type="number" id="hero-initiative" class="w-full bg-gray-700 text-white px-3 py-2 rounded" value="0">
                        </div>
                        <div>
                            <label class="block text-gray-300 mb-2">Max HP:</label>
                            <input type="number" id="hero-max-hp" class="w-full bg-gray-700 text-white px-3 py-2 rounded" min="1" value="10" required>
                        </div>
                        <div>
                            <label class="block text-gray-300 mb-2">AC:</label>
                            <input type="number" id="hero-ac" class="w-full bg-gray-700 text-white px-3 py-2 rounded" min="1" value="10" required>
                        </div>
                        <div>
                            <label class="block text-gray-300 mb-2">Image URL (optional):</label>
                            <input type="text" id="hero-image-url" class="w-full bg-gray-700 text-white px-3 py-2 rounded" placeholder="https://example.com/character.jpg">
                            <p class="text-xs text-gray-400 mt-1">For D&D Beyond characters, right-click portrait and select "Copy Image Address"</p>
                        </div>
                        <div id="image-preview" class="hidden flex justify-center items-center">
                            <img src="" alt="Preview" class="max-h-24 rounded">
                        </div>
                    </div>
                    
                    <div class="flex justify-end space-x-2">
                        <button id="cancel-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                            Cancel
                        </button>
                        <button id="add-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Add Hero
                        </button>
                    </div>
                </div>
            `,
            width: 'max-w-2xl'
        });
        
        // Add event listeners
        const nameInput = modal.querySelector('#hero-name');
        const initiativeInput = modal.querySelector('#hero-initiative');
        const maxHpInput = modal.querySelector('#hero-max-hp');
        const acInput = modal.querySelector('#hero-ac');
        const imageUrlInput = modal.querySelector('#hero-image-url');
        const imagePreview = modal.querySelector('#image-preview');
        const cancelBtn = modal.querySelector('#cancel-btn');
        const addBtn = modal.querySelector('#add-btn');
        
        // Preview image when URL changes
        imageUrlInput.addEventListener('input', () => {
            const url = imageUrlInput.value.trim();
            if (url) {
                const img = imagePreview.querySelector('img');
                img.src = url;
                imagePreview.classList.remove('hidden');
                
                // Handle image load error
                img.onerror = () => {
                    img.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2232%22%20height%3D%2232%22%20viewBox%3D%220%200%2032%2032%22%3E%3Cpath%20fill%3D%22%23D32F2F%22%20d%3D%22M16%202C8.268%202%202%208.268%202%2016s6.268%2014%2014%2014%2014-6.268%2014-14S23.732%202%2016%202zm0%2025.6c-6.408%200-11.6-5.192-11.6-11.6S9.592%204.4%2016%204.4%2027.6%209.592%2027.6%2016%2022.408%2027.6%2016%2027.6z%22%2F%3E%3Cpath%20fill%3D%22%23D32F2F%22%20d%3D%22M14.8%2010.4h2.4v8h-2.4v-8zm0%2010.4h2.4v2.4h-2.4v-2.4z%22%2F%3E%3C%2Fsvg%3E';
                };
                
                // Reset error handler when image loads successfully
                img.onload = () => {
                    img.onerror = null;
                };
            } else {
                imagePreview.classList.add('hidden');
            }
        });
        
        cancelBtn.addEventListener('click', () => {
            this.closeModal(modal);
        });
        
        addBtn.addEventListener('click', () => {
            // Validate inputs
            const name = nameInput.value.trim();
            const initiativeBonus = parseInt(initiativeInput.value) || 0;
            const maxHp = parseInt(maxHpInput.value) || 10;
            const ac = parseInt(acInput.value) || 10;
            const imageUrl = imageUrlInput.value.trim() || null;
            
            if (!name) {
                this.app.showAlert('Please enter a name for the hero.');
                return;
            }
            
            if (maxHp < 1) {
                this.app.showAlert('Max HP must be at least 1.');
                return;
            }
            
            if (ac < 1) {
                this.app.showAlert('AC must be at least 1.');
                return;
            }
            
            // Create the hero
            const hero = {
                id: this.app.utils.generateUUID(),
                name: name,
                type: 'hero',
                maxHp: maxHp,
                currentHp: maxHp,
                ac: ac,
                initiativeBonus: initiativeBonus,
                initiative: null,
                conditions: [],
                imageUrl: imageUrl
            };
            
            // Add the hero to combat
            this.app.combat.addCreature(hero);
            
            // Close the modal
            this.closeModal(modal);
            
            // Log the event
            this.app.logEvent(`${name} added to combat.`);
        });
    }
    
    /**
     * Open the add monster modal
     */
    openAddMonsterModal() {
        const modal = this.createModal({
            title: 'Add Monster',
            content: `
                <div class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-gray-300 mb-2">Name:</label>
                            <input type="text" id="monster-name" class="w-full bg-gray-700 text-white px-3 py-2 rounded" required>
                        </div>
                        <div>
                            <label class="block text-gray-300 mb-2">Initiative Bonus:</label>
                            <input type="number" id="monster-initiative" class="w-full bg-gray-700 text-white px-3 py-2 rounded" value="0">
                        </div>
                        <div>
                            <label class="block text-gray-300 mb-2">Max HP:</label>
                            <input type="number" id="monster-max-hp" class="w-full bg-gray-700 text-white px-3 py-2 rounded" min="1" value="10" required>
                        </div>
                        <div>
                            <label class="block text-gray-300 mb-2">AC:</label>
                            <input type="number" id="monster-ac" class="w-full bg-gray-700 text-white px-3 py-2 rounded" min="1" value="10" required>
                        </div>
                        <div>
                            <label class="block text-gray-300 mb-2">Image URL (optional):</label>
                            <input type="text" id="monster-image-url" class="w-full bg-gray-700 text-white px-3 py-2 rounded" placeholder="https://example.com/monster.jpg">
                        </div>
                        <div id="image-preview" class="hidden flex justify-center items-center">
                            <img src="" alt="Preview" class="max-h-24 rounded">
                        </div>
                    </div>
                    
                    <div class="flex justify-end space-x-2">
                        <button id="cancel-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                            Cancel
                        </button>
                        <button id="add-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Add Monster
                        </button>
                    </div>
                </div>
            `,
            width: 'max-w-2xl'
        });
        
        // Add event listeners
        const nameInput = modal.querySelector('#monster-name');
        const initiativeInput = modal.querySelector('#monster-initiative');
        const maxHpInput = modal.querySelector('#monster-max-hp');
        const acInput = modal.querySelector('#monster-ac');
        const imageUrlInput = modal.querySelector('#monster-image-url');
        const imagePreview = modal.querySelector('#image-preview');
        const cancelBtn = modal.querySelector('#cancel-btn');
        const addBtn = modal.querySelector('#add-btn');
        
        // Preview image when URL changes
        imageUrlInput.addEventListener('input', () => {
            const url = imageUrlInput.value.trim();
            if (url) {
                const img = imagePreview.querySelector('img');
                img.src = url;
                imagePreview.classList.remove('hidden');
                
                // Handle image load error
                img.onerror = () => {
                    img.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2232%22%20height%3D%2232%22%20viewBox%3D%220%200%2032%2032%22%3E%3Cpath%20fill%3D%22%23D32F2F%22%20d%3D%22M16%202C8.268%202%202%208.268%202%2016s6.268%2014%2014%2014%2014-6.268%2014-14S23.732%202%2016%202zm0%2025.6c-6.408%200-11.6-5.192-11.6-11.6S9.592%204.4%2016%204.4%2027.6%209.592%2027.6%2016%2022.408%2027.6%2016%2027.6z%22%2F%3E%3Cpath%20fill%3D%22%23D32F2F%22%20d%3D%22M14.8%2010.4h2.4v8h-2.4v-8zm0%2010.4h2.4v2.4h-2.4v-2.4z%22%2F%3E%3C%2Fsvg%3E';
                };
                
                // Reset error handler when image loads successfully
                img.onload = () => {
                    img.onerror = null;
                };
            } else {
                imagePreview.classList.add('hidden');
            }
        });
        
        cancelBtn.addEventListener('click', () => {
            this.closeModal(modal);
        });
        
        addBtn.addEventListener('click', () => {
            // Validate inputs
            const name = nameInput.value.trim();
            const initiativeBonus = parseInt(initiativeInput.value) || 0;
            const maxHp = parseInt(maxHpInput.value) || 10;
            const ac = parseInt(acInput.value) || 10;
            const imageUrl = imageUrlInput.value.trim() || null;
            
            if (!name) {
                this.app.showAlert('Please enter a name for the monster.');
                return;
            }
            
            if (maxHp < 1) {
                this.app.showAlert('Max HP must be at least 1.');
                return;
            }
            
            if (ac < 1) {
                this.app.showAlert('AC must be at least 1.');
                return;
            }
            
            // Create the monster
            const monster = {
                id: this.app.utils.generateUUID(),
                name: name,
                type: 'monster',
                maxHp: maxHp,
                currentHp: maxHp,
                ac: ac,
                initiativeBonus: initiativeBonus,
                initiative: null,
                conditions: [],
                imageUrl: imageUrl
            };
            
            // Add the monster to combat
            this.app.combat.addCreature(monster);
            
            // Close the modal
            this.closeModal(modal);
            
            // Log the event
            this.app.logEvent(`${name} added to combat.`);
        });
    }
    
    /**
     * Create a modal
     * @param {Object} options - Modal options
     * @param {string} options.title - The modal title
     * @param {string} options.content - The modal content (HTML)
     * @param {string} [options.width='max-w-lg'] - The modal width
     * @returns {HTMLElement} - The modal element
     */
    createModal(options) {
        // Create the modal backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
        // Create the modal
        const modal = document.createElement('div');
        modal.className = `bg-gray-800 rounded-lg shadow-xl overflow-hidden ${options.width || 'max-w-lg'} w-full mx-4 fade-in`;
        
        // Create the modal header
        const header = document.createElement('div');
        header.className = 'bg-gray-700 px-4 py-3 flex justify-between items-center';
        header.innerHTML = `
            <h3 class="text-lg font-semibold text-white">${options.title}</h3>
            <button class="close-modal-btn text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        `;
        
        // Create the modal body
        const body = document.createElement('div');
        body.className = 'p-4';
        body.innerHTML = options.content;
        
        // Assemble the modal
        modal.appendChild(header);
        modal.appendChild(body);
        backdrop.appendChild(modal);
        
        // Add the modal to the document
        document.body.appendChild(backdrop);
        
        // Add event listener for close button
        const closeBtn = modal.querySelector('.close-modal-btn');
        closeBtn.addEventListener('click', () => {
            this.closeModal(backdrop);
        });
        
        // Add event listener for clicking outside the modal
        backdrop.addEventListener('click', (event) => {
            if (event.target === backdrop) {
                this.closeModal(backdrop);
            }
        });
        
        // Add the modal to the modals array
        this.modals.push(backdrop);
        
        // Return the modal body for adding event listeners
        return body;
    }
    
    /**
     * Close a modal
     * @param {HTMLElement} modal - The modal element
     */
    closeModal(modal) {
        // Remove the modal from the DOM
        if (modal && modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
        
        // Remove the modal from the modals array
        this.modals = this.modals.filter(m => m !== modal);
    }
    
    /**
     * Close all modals
     */
    closeAllModals() {
        // Close all modals
        this.modals.forEach(modal => {
            if (modal && modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        });
        
        // Clear the modals array
        this.modals = [];
    }
    
    /**
     * Show an alert
     * @param {string} message - The alert message
     * @param {string} [title='Alert'] - The alert title
     */
    showAlert(message, title = 'Alert') {
        const modal = this.createModal({
            title: title,
            content: `
                <div class="space-y-4">
                    <p>${message}</p>
                    <div class="flex justify-end">
                        <button id="alert-ok-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            OK
                        </button>
                    </div>
                </div>
            `,
            width: 'max-w-md'
        });
        
        // Add event listener for OK button
        const okBtn = modal.querySelector('#alert-ok-btn');
        okBtn.addEventListener('click', () => {
            this.closeModal(modal.parentNode);
        });
        
        // Focus the OK button
        okBtn.focus();
    }
    
    /**
     * Show a confirmation dialog
     * @param {string} message - The confirmation message
     * @param {Function} onConfirm - The function to call when confirmed
     * @param {string} [title='Confirm'] - The confirmation title
     */
    showConfirm(message, onConfirm, title = 'Confirm') {
        const modal = this.createModal({
            title: title,
            content: `
                <div class="space-y-4">
                    <p>${message}</p>
                    <div class="flex justify-end space-x-2">
                        <button id="confirm-cancel-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                            Cancel
                        </button>
                        <button id="confirm-ok-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            OK
                        </button>
                    </div>
                </div>
            `,
            width: 'max-w-md'
        });
        
        // Add event listeners
        const cancelBtn = modal.querySelector('#confirm-cancel-btn');
        const okBtn = modal.querySelector('#confirm-ok-btn');
        
        cancelBtn.addEventListener('click', () => {
            this.closeModal(modal.parentNode);
        });
        
        okBtn.addEventListener('click', () => {
            this.closeModal(modal.parentNode);
            onConfirm();
        });
        
        // Focus the OK button
        okBtn.focus();
    }
    
    /**
     * Open the player view
     */
    openPlayerView() {
        // Close existing player view if open
        if (this.app.state.playerViewWindow && !this.app.state.playerViewWindow.closed) {
            this.app.state.playerViewWindow.close();
        }
        
        // Open a new window
        this.app.state.playerViewWindow = window.open('', 'playerView', 'width=800,height=600');
        
        // Update the player view
        this.app.updatePlayerView();
        
        // Set up auto-refresh
        const refreshRate = this.app.settings.getSetting('playerViewRefreshRate', 5) * 1000;
        const refreshInterval = setInterval(() => {
            if (this.app.state.playerViewWindow && !this.app.state.playerViewWindow.closed) {
                this.app.updatePlayerView();
            } else {
                clearInterval(refreshInterval);
            }
        }, refreshRate);
        
        // Log the event
        this.app.logEvent('Player view opened.');
    }
    
    /**
     * Generate HTML for the player view
     * @returns {string} - The player view HTML
     */
    generatePlayerViewHTML() {
        const creatures = this.app.combat.getInitiativeOrder();
        const currentTurn = this.app.state.currentTurn;
        const roundNumber = this.app.state.roundNumber;
        const combatStarted = this.app.state.combatStarted;
        
        // Generate creature HTML
        let creaturesHTML = '';
        if (creatures.length > 0) {
            creaturesHTML = creatures.map((creature, index) => {
                const isActive = combatStarted && currentTurn === creature.id;
                const typeIcon = creature.type === 'hero' ? '👤' : '👹';
                
                // Handle HP display based on settings
                let hpDisplay = '';
                if (this.playerViewSettings.hpDisplay === 'exact' && creature.type === 'hero') {
                    hpDisplay = `${creature.currentHp}/${creature.maxHp}`;
                } else if (this.playerViewSettings.hpDisplay === 'descriptive') {
                    const hpPercentage = (creature.currentHp / creature.maxHp) * 100;
                    if (creature.currentHp <= 0) {
                        hpDisplay = 'Unconscious';
                    } else if (hpPercentage <= 25) {
                        hpDisplay = 'Critical';
                    } else if (hpPercentage <= 50) {
                        hpDisplay = 'Bloodied';
                    } else if (hpPercentage <= 75) {
                        hpDisplay = 'Injured';
                    } else {
                        hpDisplay = 'Healthy';
                    }
                } else {
                    hpDisplay = '—';
                }
                
                // Handle conditions
                let conditionsHTML = '';
                if (creature.conditions && creature.conditions.length > 0) {
                    conditionsHTML = creature.conditions.map(condition => {
                        const name = typeof condition === 'string' ? condition : condition.name;
                        const rounds = typeof condition === 'string' ? null : condition.roundsLeft;
                        return `<span class="condition-tag">${name}${rounds !== null ? ` (${rounds})` : ''}</span>`;
                    }).join(' ');
                }
                
                // Handle character image
                let imageHTML = '';
                if (creature.imageUrl) {
                    imageHTML = `<img src="${creature.imageUrl}" alt="${creature.name}" class="character-image">`;
                }
                
                return `
                    <div class="creature ${isActive ? 'active' : ''}">
                        <div class="creature-header">
                            <div class="creature-info">
                                ${imageHTML}
                                <span class="creature-name">${typeIcon} ${creature.name}</span>
                            </div>
                            <div class="creature-initiative">${creature.initiative}</div>
                        </div>
                        <div class="creature-details">
                            <div class="creature-hp">${hpDisplay}</div>
                            <div class="creature-conditions">${conditionsHTML}</div>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            creaturesHTML = '<div class="no-creatures">No creatures in combat</div>';
        }
        
        // Generate the full HTML
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Combat Tracker - Player View</title>
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        background-color: #111827;
                        color: #f3f4f6;
                        margin: 0;
                        padding: 0;
                        background-image: ${this.playerViewSettings.theme === 'custom' && this.playerViewSettings.customBackground ? 
                            `url('${this.playerViewSettings.customBackground}')` : 
                            this.getThemeBackground()};
                        background-size: cover;
                        background-position: center;
                        background-attachment: fixed;
                    }
                    
                    .container {
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    
                    .header {
                        background-color: rgba(17, 24, 39, 0.8);
                        padding: 15px;
                        border-radius: 8px;
                        margin-bottom: 20px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    
                    .title {
                        font-size: 24px;
                        font-weight: bold;
                        color: #818cf8;
                    }
                    
                    .round {
                        font-size: 18px;
                        font-weight: bold;
                    }
                    
                    .creatures-container {
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                    }
                    
                    .creature {
                        background-color: rgba(31, 41, 55, 0.8);
                        border-radius: 8px;
                        padding: 10px;
                        transition: all 0.3s ease;
                    }
                    
                    .creature.active {
                        background-color: rgba(30, 58, 138, 0.8);
                        box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
                    }
                    
                    .creature-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 8px;
                    }
                    
                    .creature-info {
                        display: flex;
                        align-items: center;
                    }
                    
                    .creature-name {
                        font-size: 18px;
                        font-weight: bold;
                    }
                    
                    .creature-initiative {
                        font-size: 18px;
                        font-weight: bold;
                        background-color: rgba(17, 24, 39, 0.8);
                        width: 30px;
                        height: 30px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 50%;
                    }
                    
                    .creature-details {
                        display: flex;
                        justify-content: space-between;
                    }
                    
                    .creature-hp {
                        font-size: 14px;
                    }
                    
                    .creature-conditions {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 5px;
                    }
                    
                    .condition-tag {
                        background-color: rgba(217, 119, 6, 0.8);
                        color: #fff;
                        font-size: 12px;
                        padding: 2px 8px;
                        border-radius: 10px;
                    }
                    
                    .no-creatures {
                        text-align: center;
                        padding: 20px;
                        color: #9ca3af;
                    }
                    
                    .character-image {
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        object-fit: cover;
                        margin-right: 10px;
                        border: 2px solid #4b5563;
                    }
                    
                    .footer {
                        margin-top: 20px;
                        text-align: center;
                        font-size: 12px;
                        color: rgba(156, 163, 175, 0.8);
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="title">Combat Tracker</div>
                        <div class="round">${combatStarted ? `Round ${roundNumber}` : 'Combat not started'}</div>
                    </div>
                    
                    <div class="creatures-container">
                        ${creaturesHTML}
                    </div>
                    
                    <div class="footer">
                        Dungeons & Dragons, D&D, their respective logos, and all Wizards titles and characters are property of Wizards of the Coast LLC in the U.S.A. and other countries. ©2024 Wizards.
                    </div>
                </div>
            </body>
            </html>
        `;
    }
    
    /**
     * Get the background image URL for the current theme
     * @returns {string} - The background image URL
     */
    getThemeBackground() {
        switch (this.playerViewSettings.theme) {
            case 'dungeon':
                return "url('https://i.imgur.com/JsVWNQn.jpg')";
            case 'forest':
                return "url('https://i.imgur.com/3H8EVLJ.jpg')";
            case 'castle':
                return "url('https://i.imgur.com/7wYmAi9.jpg')";
            case 'tavern':
                return "url('https://i.imgur.com/QFqiRsD.jpg')";
            default:
                return "none";
        }
    }
}
