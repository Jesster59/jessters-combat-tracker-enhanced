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
        this.hotbarActions = [];
        console.log("UI Manager initialized");
    }
    
    /**
     * Initialize the UI manager
     */
    async init() {
        // Load templates
        this.loadTemplates();
        
        // Load player view settings
        this.loadPlayerViewSettings();
        
        // Add event listeners for dynamic elements
        this.addDynamicEventListeners();
        
        // Create hotbar
        this.createHotbar();
        
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
     * Load player view settings
     */
    loadPlayerViewSettings() {
        const settings = this.app.storage.loadData('playerViewSettings', null);
        if (settings) {
            this.playerViewSettings = { ...this.playerViewSettings, ...settings };
        }
    }
    
    /**
     * Save player view settings
     */
    savePlayerViewSettings() {
        this.app.storage.saveData('playerViewSettings', this.playerViewSettings);
    }
    
    /**
     * Add event listeners for dynamically created elements
     */
    addDynamicEventListeners() {
        // Use event delegation for dynamically created elements
        document.addEventListener('click', (event) => {
            // Edit button
            if (event.target.closest('.edit-btn')) {
                const btn = event.target.closest('.edit-btn');
                const creatureId = btn.dataset.creatureId;
                this.openEditCreatureModal(creatureId);
            }
            
            // Stat Block button
            if (event.target.closest('.stat-block-btn')) {
                const btn = event.target.closest('.stat-block-btn');
                const creatureId = btn.dataset.creatureId;
                this.openStatBlockModal(creatureId);
            }
            
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
                if (!event.target.closest('.edit-btn') && 
                    !event.target.closest('.stat-block-btn') &&
                    !event.target.closest('.damage-btn') && 
                    !event.target.closest('.heal-btn') && 
                    !event.target.closest('.remove-btn')) {
                    // Handle left-click on creature card
                    // For example, show details or select the creature
                }
            }
            
            // Roll attack button
            if (event.target.closest('.roll-attack-btn')) {
                const btn = event.target.closest('.roll-attack-btn');
                const creatureId = btn.dataset.creatureId;
                const actionName = btn.dataset.actionName;
                const creature = this.app.combat.getCreatureById(creatureId);
                if (creature) {
                    this.rollMonsterAttack(creature, actionName);
                }
            }
            
            // Death save button
            if (event.target.closest('.death-save-btn')) {
                const btn = event.target.closest('.death-save-btn');
                const creatureId = btn.dataset.creatureId;
                this.app.combat.handleDeathSavingThrow(creatureId);
            }
            
            // Concentration check button
            if (event.target.closest('.concentration-check-btn')) {
                const btn = event.target.closest('.concentration-check-btn');
                const creatureId = btn.dataset.creatureId;
                const dc = parseInt(btn.dataset.dc) || 10;
                this.app.combat.checkConcentration(creatureId, dc * 2); // DC = damage/2, so multiply by 2
            }
            
            // Legendary action button
            if (event.target.closest('.legendary-action-btn')) {
                const btn = event.target.closest('.legendary-action-btn');
                const creatureId = btn.dataset.creatureId;
                const used = parseInt(btn.dataset.used) || 0;
                this.app.combat.trackLegendaryActions(creatureId, used);
            }
            
            // Lair action button
            if (event.target.closest('.lair-action-btn')) {
                const btn = event.target.closest('.lair-action-btn');
                const lairActionId = btn.dataset.lairActionId;
                this.app.combat.useLairAction(lairActionId);
            }
            
            // Hotbar action button
            if (event.target.closest('.hotbar-action-btn')) {
                const btn = event.target.closest('.hotbar-action-btn');
                const actionIndex = parseInt(btn.dataset.actionIndex);
                this.executeHotbarAction(actionIndex);
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
            
            // Handle source badge
            let sourceHtml = '';
            if (creature.source) {
                sourceHtml = `<span class="ml-2 text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">${creature.source}</span>`;
            }
            
            // Handle monster details
            let monsterDetailsHtml = '';
            if (creature.cr) {
                monsterDetailsHtml = `
                    <div class="mt-2 text-xs text-gray-400">
                        <span>CR ${creature.cr}</span>
                        ${creature.size ? ` • <span>${creature.size}</span>` : ''}
                        ${creature.alignment ? ` • <span>${creature.alignment}</span>` : ''}
                    </div>
                `;
            }
            
            // Handle concentration
            let concentrationHtml = '';
            if (creature.concentration) {
                concentrationHtml = `
                    <div class="mt-2 flex items-center">
                        <span class="bg-purple-600 text-purple-100 px-2 py-0.5 rounded-full text-xs">
                            Concentrating: ${creature.concentration.spell}
                        </span>
                        <button class="concentration-check-btn ml-2 bg-purple-700 hover:bg-purple-800 text-white text-xs py-0.5 px-2 rounded" 
                            data-creature-id="${creature.id}" data-dc="10">
                            Check (DC 10)
                        </button>
                    </div>
                `;
            }
            
            // Handle death saves for heroes
            let deathSavesHtml = '';
            if (creature.type === 'hero' && creature.currentHp === 0 && creature.deathSaves) {
                deathSavesHtml = `
                    <div class="mt-2">
                        <div class="flex items-center justify-between">
                            <span class="text-xs text-gray-400">Death Saves:</span>
                            <button class="death-save-btn bg-red-600 hover:bg-red-700 text-white text-xs py-0.5 px-2 rounded" 
                                data-creature-id="${creature.id}">
                                Roll
                            </button>
                        </div>
                        <div class="flex space-x-1 mt-1">
                            <div class="flex space-x-0.5">
                                ${Array(3).fill(0).map((_, i) => `
                                    <span class="w-4 h-4 flex items-center justify-center ${i < creature.deathSaves.successes ? 'bg-green-600' : 'bg-gray-700'} rounded-full text-xs">
                                        ${i < creature.deathSaves.successes ? '✓' : ''}
                                    </span>
                                `).join('')}
                            </div>
                            <span class="text-xs mx-1">|</span>
                            <div class="flex space-x-0.5">
                                ${Array(3).fill(0).map((_, i) => `
                                    <span class="w-4 h-4 flex items-center justify-center ${i < creature.deathSaves.failures ? 'bg-red-600' : 'bg-gray-700'} rounded-full text-xs">
                                        ${i < creature.deathSaves.failures ? '✗' : ''}
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                `;
            }
            
            // Handle legendary actions for monsters
            let legendaryActionsHtml = '';
            if (creature.type === 'monster' && creature.legendaryActions) {
                legendaryActionsHtml = `
                    <div class="mt-2">
                        <div class="flex items-center justify-between">
                            <span class="text-xs text-gray-400">Legendary Actions:</span>
                            <div class="flex space-x-1">
                                ${Array(creature.legendaryActions.max).fill(0).map((_, i) => `
                                    <button class="legendary-action-btn w-6 h-6 flex items-center justify-center 
                                        ${i < creature.legendaryActions.used ? 'bg-gray-600' : 'bg-gray-800 hover:bg-gray-700'} rounded" 
                                        data-creature-id="${creature.id}" data-used="${i + 1}">
                                        ${i + 1}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                `;
            }
            
            const cardElement = document.createElement('div');
            cardElement.className = 'creature-card bg-gray-700 rounded-lg shadow mb-4 p-3';
            cardElement.dataset.id = creature.id;
            
            cardElement.innerHTML = `
                <div class="flex justify-between items-center mb-2">
                    <div class="flex items-center">
                        ${imageHtml}
                        <span class="text-xl font-bold">${typeIcon} ${creature.name}</span>
                        ${sourceHtml}
                    </div>
                    <div class="flex space-x-1">
                        <button class="edit-btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs" data-creature-id="${creature.id}">
                            Edit
                        </button>
                        ${creature.type === 'monster' && (creature.actions || creature.specialAbilities) ? `
                        <button class="stat-block-btn bg-purple-600 hover:bg-purple-700 text-white font-bold py-1 px-2 rounded text-xs" data-creature-id="${creature.id}">
                            Stat Block
                        </button>
                        ` : ''}
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
                
                ${monsterDetailsHtml}
                ${concentrationHtml}
                ${deathSavesHtml}
                ${legendaryActionsHtml}
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
        
        // Add lair actions if any
        if (this.app.combat.lairActions && this.app.combat.lairActions.length > 0) {
            this.app.combat.lairActions.forEach(lairAction => {
                const isActive = this.app.state.combatStarted && 
                                 this.app.state.currentTurn === null && 
                                 !lairAction.used;
                
                const itemElement = document.createElement('div');
                itemElement.className = `initiative-item p-2 mb-1 rounded flex justify-between items-center ${isActive ? 'bg-red-900' : 'bg-gray-700'}`;
                
                itemElement.innerHTML = `
                    <div class="flex items-center">
                        <span class="w-6 h-6 flex items-center justify-center bg-red-800 rounded-full text-sm mr-2">L</span>
                        <span>⚡ ${lairAction.name}</span>
                    </div>
                    <div class="flex items-center">
                        <div class="font-bold mr-2">${lairAction.initiative}</div>
                        <button class="lair-action-btn bg-red-700 hover:bg-red-800 text-white text-xs py-1 px-2 rounded ${lairAction.used ? 'opacity-50 cursor-not-allowed' : ''}" 
                            data-lair-action-id="${lairAction.id}" ${lairAction.used ? 'disabled' : ''}>
                            ${lairAction.used ? 'Used' : 'Use'}
                        </button>
                    </div>
                `;
                
                container.appendChild(itemElement);
            });
        }
        
        // Add creatures
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
     * Open the monster stat block modal
     * @param {string} creatureId - The ID of the creature
     */
    openStatBlockModal(creatureId) {
        const creature = this.app.combat.getCreatureById(creatureId);
        if (!creature || creature.type !== 'monster') return;
        
        // Get additional monster data if available
        const monsterData = creature;
        
        // Format ability scores with modifiers
        const formatAbilityScore = (score) => {
            const modifier = Math.floor((score - 10) / 2);
            const sign = modifier >= 0 ? '+' : '';
            return `${score} (${sign}${modifier})`;
        };
        
        // Format actions with attack buttons
        const formatActions = (actions) => {
            if (!actions || actions.length === 0) return '<div class="text-gray-400">No actions available</div>';
            
            return actions.map(action => {
                // Check if this is an attack action
                const isAttack = action.desc && (action.desc.includes('Attack:') || action.desc.includes('Hit:'));
                const attackButton = isAttack ? 
                    `<button class="roll-attack-btn bg-red-600 hover:bg-red-700 text-white text-xs py-1 px-2 rounded ml-2" 
                        data-creature-id="${creature.id}" 
                        data-action-name="${action.name}">
                        Roll Attack
                    </button>` : '';
                
                return `
                    <div class="mb-3">
                        <div class="font-semibold flex justify-between">
                            ${action.name}
                            ${attackButton}
                        </div>
                        <div class="text-sm">${action.desc}</div>
                    </div>
                `;
            }).join('');
        };
        
        // Get ability scores
        const str = monsterData.abilities?.str || monsterData.str || 10;
        const dex = monsterData.abilities?.dex || monsterData.dex || 10;
        const con = monsterData.abilities?.con || monsterData.con || 10;
        const int = monsterData.abilities?.int || monsterData.int || 10;
        const wis = monsterData.abilities?.wis || monsterData.wis || 10;
        const cha = monsterData.abilities?.cha || monsterData.cha || 10;
        
        const modal = this.createModal({
            title: `${creature.name} - Stat Block`,
            content: `
                <div class="space-y-4 stat-block">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="text-xl font-bold">${creature.name}</h3>
                            <div class="text-gray-400">
                                ${monsterData.size || ''} ${monsterData.type || 'monster'}, ${monsterData.alignment || 'unaligned'}
                            </div>
                        </div>
                        ${creature.imageUrl ? `<img src="${creature.imageUrl}" alt="${creature.name}" class="w-20 h-20 rounded object-cover">` : ''}
                    </div>
                    
                    <hr class="border-gray-600">
                    
                    <div class="grid grid-cols-2 gap-2">
                        <div><span class="font-semibold">Armor Class:</span> ${creature.ac}</div>
                        <div><span class="font-semibold">Hit Points:</span> ${creature.currentHp}/${creature.maxHp}</div>
                        <div><span class="font-semibold">Speed:</span> ${monsterData.speed || 'Unknown'}</div>
                        <div><span class="font-semibold">Challenge Rating:</span> ${monsterData.cr || 'Unknown'}</div>
                    </div>
                    
                    <hr class="border-gray-600">
                    
                    <div class="grid grid-cols-6 gap-2 text-center">
                        <div>
                            <div class="font-semibold">STR</div>
                            <div>${formatAbilityScore(str)}</div>
                        </div>
                        <div>
                            <div class="font-semibold">DEX</div>
                            <div>${formatAbilityScore(dex)}</div>
                        </div>
                        <div>
                            <div class="font-semibold">CON</div>
                            <div>${formatAbilityScore(con)}</div>
                        </div>
                        <div>
                            <div class="font-semibold">INT</div>
                            <div>${formatAbilityScore(int)}</div>
                        </div>
                        <div>
                            <div class="font-semibold">WIS</div>
                            <div>${formatAbilityScore(wis)}</div>
                        </div>
                        <div>
                            <div class="font-semibold">CHA</div>
                            <div>${formatAbilityScore(cha)}</div>
                        </div>
                    </div>
                    
                    <hr class="border-gray-600">
                    
                    <div class="grid grid-cols-2 gap-2 text-sm">
                        ${monsterData.senses ? `<div><span class="font-semibold">Senses:</span> ${monsterData.senses}</div>` : ''}
                        ${monsterData.languages ? `<div><span class="font-semibold">Languages:</span> ${monsterData.languages}</div>` : ''}
                        ${monsterData.damageVulnerabilities ? `<div><span class="font-semibold">Vulnerabilities:</span> ${monsterData.damageVulnerabilities}</div>` : ''}
                        ${monsterData.damageResistances ? `<div><span class="font-semibold">Resistances:</span> ${monsterData.damageResistances}</div>` : ''}
                        ${monsterData.damageImmunities ? `<div><span class="font-semibold">Immunities:</span> ${monsterData.damageImmunities}</div>` : ''}
                        ${monsterData.conditionImmunities ? `<div><span class="font-semibold">Condition Immunities:</span> ${monsterData.conditionImmunities}</div>` : ''}
                    </div>
                    
                    ${monsterData.specialAbilities && monsterData.specialAbilities.length > 0 ? `
                        <hr class="border-gray-600">
                        <div>
                            <h4 class="font-bold mb-2">Special Abilities</h4>
                            ${formatActions(monsterData.specialAbilities)}
                        </div>
                    ` : ''}
                    
                    ${monsterData.actions && monsterData.actions.length > 0 ? `
                        <hr class="border-gray-600">
                        <div>
                            <h4 class="font-bold mb-2">Actions</h4>
                            ${formatActions(monsterData.actions)}
                        </div>
                    ` : ''}
                    
                    ${monsterData.legendaryActions && monsterData.legendaryActions.length > 0 ? `
                        <hr class="border-gray-600">
                        <div>
                            <h4 class="font-bold mb-2">Legendary Actions</h4>
                            ${formatActions(monsterData.legendaryActions)}
                        </div>
                    ` : ''}
                    
                    <div class="flex justify-between mt-4">
                        <button id="add-to-hotbar-btn" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
                            Add to Hotbar
                        </button>
                        <button id="close-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                            Close
                        </button>
                    </div>
                </div>
            `,
            width: 'max-w-3xl'
        });
        
        // Add event listeners
        const closeBtn = modal.querySelector('#close-btn');
        closeBtn.addEventListener('click', () => {
            this.closeModal(modal.parentNode);
        });
        
        // Add to hotbar button
        const addToHotbarBtn = modal.querySelector('#add-to-hotbar-btn');
        if (addToHotbarBtn) {
            addToHotbarBtn.addEventListener('click', () => {
                this.addToHotbar({
                    type: 'statBlock',
                    creatureId: creature.id,
                    label: creature.name.substring(0, 1),
                    tooltip: `${creature.name} Stat Block`
                });
                this.app.showAlert(`Added ${creature.name} to the hotbar.`);
            });
        }
        
        // Add event listeners for attack rolls
        modal.querySelectorAll('.roll-attack-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const actionName = btn.dataset.actionName;
                this.rollMonsterAttack(creature, actionName);
            });
        });
    }
    
    /**
     * Roll a monster attack
     * @param {Object} monster - The monster
     * @param {string} actionName - The name of the action
     */
    rollMonsterAttack(monster, actionName) {
        // Find the action
        const action = monster.actions?.find(a => a.name === actionName) || 
                      monster.specialAbilities?.find(a => a.name === actionName) ||
                      monster.legendaryActions?.find(a => a.name === actionName);
        
        if (!action) return;
        
        // Parse attack bonus from description
        const attackBonusMatch = action.desc.match(/\+(\d+) to hit/);
        const attackBonus = attackBonusMatch ? parseInt(attackBonusMatch[1]) : 0;
        
        // Parse damage from description
        const damageMatch = action.desc.match(/(\d+d\d+(?:\s*\+\s*\d+)?) (\w+) damage/);
        const damageDice = damageMatch ? damageMatch[1].replace(/\s+/g, '') : null;
        const damageType = damageMatch ? damageMatch[2] : null;
        
        // Roll attack
        const attackRoll = this.app.dice.roll(20);
        const isCrit = attackRoll.rolls[0] === 20;
        const isFumble = attackRoll.rolls[0] === 1;
        const attackTotal = isFumble ? 0 : (attackRoll.total + attackBonus);
        
        // Roll damage if applicable
        let damageRoll = null;
        if (damageDice) {
            damageRoll = this.app.dice.roll(damageDice);
            // Double damage dice on crit
            if (isCrit) {
                const critDamageRoll = this.app.dice.roll(damageDice);
                damageRoll.rolls = [...damageRoll.rolls, ...critDamageRoll.rolls];
                damageRoll.total = damageRoll.total + critDamageRoll.total;
            }
        }
        
        // Display results
        let resultMessage = `<div class="text-xl font-bold">${monster.name} uses ${actionName}</div>`;
        
        if (isCrit) {
            resultMessage += `<div class="text-green-400 font-bold">CRITICAL HIT!</div>`;
        } else if (isFumble) {
            resultMessage += `<div class="text-red-400 font-bold">CRITICAL MISS!</div>`;
        }
        
        resultMessage += `<div>Attack roll: ${attackRoll.rolls[0]} + ${attackBonus} = ${attackTotal}</div>`;
        
        if (damageRoll) {
            resultMessage += `<div>Damage${isCrit ? ' (critical)' : ''}: ${damageRoll.rolls.join(' + ')} = ${damageRoll.total} ${damageType}</div>`;
        }
        
        // Show the result
        this.app.showAlert(resultMessage, `${monster.name} - ${actionName}`);
        
        // Log the event
        this.app.logEvent(`${monster.name} uses ${actionName}: ${attackTotal} to hit${damageRoll ? `, ${damageRoll.total} ${damageType} damage` : ''}`);
        
        // Play sound
        if (isCrit) {
            this.app.audio.play('criticalHit');
        } else if (isFumble) {
            this.app.audio.play('miss');
        } else {
            this.app.audio.play('hit');
        }
    }
    
    /**
     * Open the initiative management modal
     */
    openInitiativeManagementModal() {
        const creatures = this.app.combat.getAllCreatures();
        
        if (creatures.length === 0) {
            this.app.showAlert('No creatures to manage initiative for.');
            return;
        }
        
        const modal = this.createModal({
            title: 'Manage Initiative Order',
            content: `
                <div class="space-y-4">
                    <p class="text-sm text-gray-400">Edit initiative values directly or use the up/down buttons to reorder.</p>
                    
                    <div id="initiative-list" class="space-y-2">
                        ${creatures.map((creature, index) => `
                            <div class="initiative-item bg-gray-700 p-2 rounded flex justify-between items-center" data-id="${creature.id}">
                                <div class="flex items-center">
                                    <span>${creature.type === 'hero' ? '👤' : '👹'} ${creature.name}</span>
                                </div>
                                <div class="flex items-center space-x-2">
                                    <input type="number" class="initiative-input bg-gray-600 text-white w-16 px-2 py-1 rounded" 
                                        value="${creature.initiative !== null ? creature.initiative : ''}" 
                                        placeholder="Init">
                                    <div class="flex flex-col">
                                        <button class="move-up-btn text-xs bg-gray-600 hover:bg-gray-500 px-2 py-0.5 rounded-t ${index === 0 ? 'opacity-50 cursor-not-allowed' : ''}" 
                                            ${index === 0 ? 'disabled' : ''}>▲</button>
                                        <button class="move-down-btn text-xs bg-gray-600 hover:bg-gray-500 px-2 py-0.5 rounded-b ${index === creatures.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}" 
                                            ${index === creatures.length - 1 ? 'disabled' : ''}>▼</button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="flex justify-end space-x-2">
                        <button id="cancel-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                            Cancel
                        </button>
                        <button id="save-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Save Order
                        </button>
                    </div>
                </div>
            `,
            width: 'max-w-lg'
        });
        
        // Add event listeners
        const cancelBtn = modal.querySelector('#cancel-btn');
        const saveBtn = modal.querySelector('#save-btn');
        const initiativeList = modal.querySelector('#initiative-list');
        
        // Add event listeners for move up/down buttons
        initiativeList.querySelectorAll('.move-up-btn').forEach((btn, index) => {
            if (index > 0) {
                btn.addEventListener('click', () => {
                    const item = btn.closest('.initiative-item');
                    const prevItem = item.previousElementSibling;
                    if (prevItem) {
                        initiativeList.insertBefore(item, prevItem);
                        updateMoveButtons();
                    }
                });
            }
        });
        
        initiativeList.querySelectorAll('.move-down-btn').forEach((btn, index) => {
            if (index < creatures.length - 1) {
                btn.addEventListener('click', () => {
                    const item = btn.closest('.initiative-item');
                    const nextItem = item.nextElementSibling;
                    if (nextItem) {
                        initiativeList.insertBefore(nextItem, item);
                        updateMoveButtons();
                    }
                });
            }
        });
        
        // Function to update move buttons after reordering
        function updateMoveButtons() {
            const items = initiativeList.querySelectorAll('.initiative-item');
            items.forEach((item, index) => {
                const upBtn = item.querySelector('.move-up-btn');
                const downBtn = item.querySelector('.move-down-btn');
                
                if (index === 0) {
                    upBtn.disabled = true;
                    upBtn.classList.add('opacity-50', 'cursor-not-allowed');
                } else {
                    upBtn.disabled = false;
                    upBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                }
                
                if (index === items.length - 1) {
                    downBtn.disabled = true;
                    downBtn.classList.add('opacity-50', 'cursor-not-allowed');
                } else {
                    downBtn.disabled = false;
                    downBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                }
            });
        }
        
        cancelBtn.addEventListener('click', () => {
            this.closeModal(modal.parentNode);
        });
        
        saveBtn.addEventListener('click', () => {
            // Get the new order and initiative values
            const initiativeItems = modal.querySelectorAll('.initiative-item');
            const newOrder = [];
            
            initiativeItems.forEach(item => {
                const id = item.dataset.id;
                const initiativeInput = item.querySelector('.initiative-input');
                const initiative = initiativeInput.value.trim() !== '' ? parseInt(initiativeInput.value) : null;
                
                newOrder.push({ id, initiative });
            });
            
            // Update the initiative values
            newOrder.forEach(item => {
                const creature = this.app.combat.getCreatureById(item.id);
                if (creature) {
                    creature.initiative = item.initiative;
                }
            });
            
            // Reorder the creatures array
            this.app.combat.reorderCreatures(newOrder.map(item => item.id));
            
            // Update UI
            this.app.ui.renderCreatures();
            this.app.ui.renderInitiativeOrder();
            this.app.updatePlayerView();
            
            // Close the modal
            this.closeModal(modal.parentNode);
            
            // Log the event
            this.app.logEvent('Initiative order updated manually.');
        });
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
            { text: 'Edit Character', icon: '✏️', action: () => this.openEditCreatureModal(creatureId) }
        ];
        
        // Add stat block option for monsters
        if (creature.type === 'monster' && (creature.actions || creature.specialAbilities)) {
            items.push({ text: 'View Stat Block', icon: '📋', action: () => this.openStatBlockModal(creatureId) });
        }
        
        // Add other options
        items.push(
            { text: 'Apply Damage', icon: '🗡️', action: () => this.app.damage.openDamageModal(creatureId) },
            { text: 'Apply Healing', icon: '❤️', action: () => this.app.damage.openHealModal(creatureId) },
            { text: 'Add Condition', icon: '⚠️', action: () => this.app.conditions.openAddConditionModal(creatureId) },
            { text: 'Manage Conditions', icon: '📋', action: () => this.app.conditions.openManageConditionsModal(creatureId) },
            { text: 'Set Image URL', icon: '🖼️', action: () => this.openSetImageModal(creatureId) }
        );
        
        // Add concentration option
        if (creature.concentration) {
            items.push({ 
                text: `End Concentration (${creature.concentration.spell})`, 
                icon: '🧠', 
                action: () => {
                    creature.concentration = null;
                    this.app.logEvent(`${creature.name} is no longer concentrating.`);
                    this.app.ui.renderCreatures();
                }
            });
        } else {
            items.push({ 
                text: 'Add Concentration Spell', 
                icon: '🧠', 
                action: () => this.openAddConcentrationModal(creatureId) 
            });
        }
        
        // Add death save option for unconscious heroes
        if (creature.type === 'hero' && creature.currentHp === 0) {
            items.push({ 
                text: 'Roll Death Save', 
                icon: '💀', 
                action: () => this.app.combat.handleDeathSavingThrow(creatureId) 
            });
        }
        
        // Add legendary action option for monsters
        if (creature.type === 'monster') {
            if (creature.legendaryActions) {
                items.push({ 
                    text: 'Reset Legendary Actions', 
                    icon: '⚜️', 
                    action: () => {
                        creature.legendaryActions.used = 0;
                        this.app.logEvent(`${creature.name}'s legendary actions reset.`);
                        this.app.ui.renderCreatures();
                    }
                });
            } else {
                items.push({ 
                    text: 'Add Legendary Actions', 
                    icon: '⚜️', 
                    action: () => {
                        creature.legendaryActions = { max: 3, used: 0 };
                        this.app.logEvent(`${creature.name} now has legendary actions.`);
                        this.app.ui.renderCreatures();
                    }
                });
            }
        }
        
        // Add remove option
        items.push({ 
            text: 'Remove from Combat', 
            icon: '❌', 
            action: () => {
                this.app.showConfirm(`Are you sure you want to remove ${creature.name} from combat?`, () => {
                    this.app.combat.removeCreature(creatureId);
                });
            }
        });
        
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
     * Open the edit creature modal
     * @param {string} creatureId - The ID of the creature to edit
     */
    openEditCreatureModal(creatureId) {
        const creature = this.app.combat.getCreatureById(creatureId);
        if (!creature) return;
        
        const modal = this.createModal({
            title: `Edit ${creature.type === 'hero' ? 'Hero' : 'Monster'}: ${creature.name}`,
            content: `
                <div class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-gray-300 mb-2">Name:</label>
                            <input type="text" id="edit-name" class="w-full bg-gray-700 text-white px-3 py-2 rounded" value="${creature.name || ''}">
                        </div>
                        <div>
                            <label class="block text-gray-300 mb-2">Initiative Bonus:</label>
                            <input type="number" id="edit-initiative" class="w-full bg-gray-700 text-white px-3 py-2 rounded" value="${creature.initiativeBonus || 0}">
                        </div>
                        <div>
                            <label class="block text-gray-300 mb-2">Max HP:</label>
                            <input type="number" id="edit-max-hp" class="w-full bg-gray-700 text-white px-3 py-2 rounded" min="1" value="${creature.maxHp || 10}">
                        </div>
                        <div>
                            <label class="block text-gray-300 mb-2">Current HP:</label>
                            <input type="number" id="edit-current-hp" class="w-full bg-gray-700 text-white px-3 py-2 rounded" min="0" value="${creature.currentHp || 0}">
                        </div>
                        <div>
                            <label class="block text-gray-300 mb-2">AC:</label>
                            <input type="number" id="edit-ac" class="w-full bg-gray-700 text-white px-3 py-2 rounded" min="1" value="${creature.ac || 10}">
                        </div>
                                             <div>
                            <label class="block text-gray-300 mb-2">AC:</label>
                            <input type="number" id="edit-ac" class="w-full bg-gray-700 text-white px-3 py-2 rounded" min="1" value="${creature.ac || 10}">
                        </div>
                        <div>
                            <label class="block text-gray-300 mb-2">Image URL:</label>
                            <input type="text" id="edit-image-url" class="w-full bg-gray-700 text-white px-3 py-2 rounded" value="${creature.imageUrl || ''}">
                        </div>
                    </div>
                    
                    <div id="image-preview" class="${creature.imageUrl ? '' : 'hidden'} flex justify-center items-center">
                        <img src="${creature.imageUrl || ''}" alt="Preview" class="max-h-40 rounded">
                    </div>
                    
                    <div class="flex justify-end space-x-2">
                        <button id="cancel-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                            Cancel
                        </button>
                        <button id="save-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Save Changes
                        </button>
                    </div>
                </div>
            `,
            width: 'max-w-2xl'
        });
        
        // Add event listeners
        const nameInput = modal.querySelector('#edit-name');
        const initiativeInput = modal.querySelector('#edit-initiative');
        const maxHpInput = modal.querySelector('#edit-max-hp');
        const currentHpInput = modal.querySelector('#edit-current-hp');
        const acInput = modal.querySelector('#edit-ac');
        const imageUrlInput = modal.querySelector('#edit-image-url');
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
            this.closeModal(modal.parentNode);
        });
        
        saveBtn.addEventListener('click', () => {
            // Validate inputs
            const name = nameInput.value.trim();
            const initiativeBonus = parseInt(initiativeInput.value) || 0;
            const maxHp = parseInt(maxHpInput.value) || 10;
            const currentHp = parseInt(currentHpInput.value) || 0;
            const ac = parseInt(acInput.value) || 10;
            const imageUrl = imageUrlInput.value.trim() || null;
            
            if (!name) {
                this.app.showAlert('Please enter a name.');
                return;
            }
            
            if (maxHp < 1) {
                this.app.showAlert('Max HP must be at least 1.');
                return;
            }
            
            if (currentHp < 0) {
                this.app.showAlert('Current HP cannot be negative.');
                return;
            }
            
            if (ac < 1) {
                this.app.showAlert('AC must be at least 1.');
                return;
            }
            
            // Update the creature
            const updates = {
                name,
                initiativeBonus,
                maxHp,
                currentHp,
                ac,
                imageUrl
            };
            
            this.app.combat.updateCreature(creatureId, updates);
            
            // Close the modal
            this.closeModal(modal.parentNode);
            
            // Log the event
            this.app.logEvent(`${name} has been updated.`);
        });
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
            this.closeModal(modal.parentNode);
        });
        
        saveBtn.addEventListener('click', () => {
            const url = imageUrlInput.value.trim();
            
            // Update the creature
            this.app.combat.updateCreature(creatureId, { imageUrl: url || null });
            
            // Close the modal
            this.closeModal(modal.parentNode);
            
            // Log the event
            this.app.logEvent(`Image updated for ${creature.name}.`);
        });
    }
    
    /**
     * Open the add concentration modal for a creature
     * @param {string} creatureId - The ID of the creature
     */
    openAddConcentrationModal(creatureId) {
        const creature = this.app.combat.getCreatureById(creatureId);
        if (!creature) return;
        
        const modal = this.createModal({
            title: `Add Concentration Spell for ${creature.name}`,
            content: `
                <div class="space-y-4">
                    <div class="mb-4">
                        <label class="block text-gray-300 mb-2">Spell Name:</label>
                        <input type="text" id="spell-name-input" class="w-full bg-gray-700 text-white px-3 py-2 rounded" 
                            placeholder="e.g., Bless, Hold Person, etc.">
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-gray-300 mb-2">Duration (rounds):</label>
                        <input type="number" id="spell-duration-input" class="w-full bg-gray-700 text-white px-3 py-2 rounded" 
                            placeholder="Leave blank for 'Until dispelled'">
                        <p class="text-sm text-gray-400 mt-1">
                            Leave blank for spells that last until concentration is broken.
                        </p>
                    </div>
                    
                    <div class="flex justify-end space-x-2">
                        <button id="cancel-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                            Cancel
                        </button>
                        <button id="save-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Add Spell
                        </button>
                    </div>
                </div>
            `,
            width: 'max-w-md'
        });
        
        // Add event listeners
        const spellNameInput = modal.querySelector('#spell-name-input');
        const spellDurationInput = modal.querySelector('#spell-duration-input');
        const cancelBtn = modal.querySelector('#cancel-btn');
        const saveBtn = modal.querySelector('#save-btn');
        
        cancelBtn.addEventListener('click', () => {
            this.closeModal(modal.parentNode);
        });
        
        saveBtn.addEventListener('click', () => {
            const spellName = spellNameInput.value.trim();
            const duration = spellDurationInput.value.trim() !== '' ? parseInt(spellDurationInput.value) : null;
            
            if (!spellName) {
                this.app.showAlert('Please enter a spell name.');
                return;
            }
            
            // Add concentration
            this.app.combat.addConcentrationSpell(creatureId, spellName, duration);
            
            // Close the modal
            this.closeModal(modal.parentNode);
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
            this.closeModal(modal.parentNode);
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
                imageUrl: imageUrl,
                source: 'Custom'
            };
            
            // Add the hero to combat
            this.app.combat.addCreature(hero);
            
            // Close the modal
            this.closeModal(modal.parentNode);
            
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
            this.closeModal(modal.parentNode);
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
                imageUrl: imageUrl,
                source: 'Custom'
            };
            
            // Add the monster to combat
            this.app.combat.addCreature(monster);
            
            // Close the modal
            this.closeModal(modal.parentNode);
            
            // Log the event
            this.app.logEvent(`${name} added to combat.`);
        });
    }
    
    /**
     * Open the monster search modal
     */
    openMonsterSearchModal() {
        const modal = this.createModal({
            title: 'Search Monsters (Open5e SRD)',
            content: `
                <div class="space-y-4">
                    <div class="flex">
                        <input type="text" id="monster-search-input" class="flex-1 bg-gray-700 text-white px-3 py-2 rounded-l" placeholder="Search for monsters...">
                        <button id="search-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r">
                            Search
                        </button>
                    </div>
                    
                    <div id="search-results" class="max-h-96 overflow-y-auto">
                        <div class="text-center text-gray-400 py-4">
                            Enter a search term to find monsters
                        </div>
                    </div>
                    
                    <div class="flex justify-end">
                        <button id="close-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                            Close
                        </button>
                    </div>
                </div>
            `,
            width: 'max-w-2xl'
        });
        
        // Add event listeners
        const searchInput = modal.querySelector('#monster-search-input');
        const searchBtn = modal.querySelector('#search-btn');
        const searchResults = modal.querySelector('#search-results');
        const closeBtn = modal.querySelector('#close-btn');
        
        // Search function
        const performSearch = async () => {
            const query = searchInput.value.trim();
            if (!query) return;
            
            // Show loading state
            searchResults.innerHTML = `
                <div class="text-center text-gray-400 py-4">
                    <svg class="animate-spin h-6 w-6 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching...
                </div>
            `;
            
            // Perform search
            const monsters = await this.app.api.searchMonsters(query);
            
            // Display results
            if (monsters.length === 0) {
                searchResults.innerHTML = `
                    <div class="text-center text-gray-400 py-4">
                        No monsters found matching "${query}"
                    </div>
                `;
                return;
            }
            
            // Create results HTML
            searchResults.innerHTML = `
                <div class="grid grid-cols-1 gap-2">
                    ${monsters.map(monster => `
                        <div class="monster-result bg-gray-700 hover:bg-gray-600 p-3 rounded cursor-pointer" data-slug="${monster.slug}">
                    ${monsters.map(monster => `
                        <div class="monster-result bg-gray-700 hover:bg-gray-600 p-3 rounded cursor-pointer" data-slug="${monster.slug}">
                            <div class="flex justify-between items-center">
                                <div>
                                    <div class="font-semibold">${monster.name}</div>
                                    <div class="text-sm text-gray-400">${monster.size} ${monster.type}, CR ${monster.challenge_rating}</div>
                                </div>
                                <div class="text-sm">
                                    <span class="bg-gray-800 px-2 py-1 rounded">HP: ${monster.hit_points}</span>
                                    <span class="bg-gray-800 px-2 py-1 rounded ml-1">AC: ${monster.armor_class}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            
            // Add click event for monster selection
            searchResults.querySelectorAll('.monster-result').forEach(element => {
                element.addEventListener('click', async () => {
                    const slug = element.dataset.slug;
                    const monsterData = await this.app.api.getMonster(slug);
                    
                    if (monsterData) {
                        // Convert to our format
                        const monster = this.app.api.convertOpen5eMonster(monsterData);
                        
                        // Add to combat
                        this.app.combat.addCreature(monster);
                        
                        // Close the modal
                        this.app.ui.closeModal(modal.parentNode);
                        
                        // Log the event
                        this.app.logEvent(`${monster.name} added to combat from Open5e SRD.`);
                    }
                });
            });
        };
        
        // Add event listeners
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        closeBtn.addEventListener('click', () => {
            this.closeModal(modal.parentNode);
        });
        
        // Focus the search input
        searchInput.focus();
    }
    
    /**
     * Open the D&D Beyond import modal
     */
    openDnDBeyondImportModal() {
        const modal = this.createModal({
            title: 'Import from D&D Beyond',
            content: `
                <div class="space-y-4">
                    <div class="bg-gray-700 p-4 rounded">
                        <h3 class="font-semibold mb-2">Instructions:</h3>
                        <ol class="list-decimal list-inside space-y-2 text-sm">
                            <li>Open your character sheet on D&D Beyond</li>
                            <li>Open the browser console (F12 or right-click > Inspect > Console)</li>
                            <li>Copy the script below and paste it into the console</li>
                            <li>Copy the JSON output between the lines of equal signs (=====)</li>
                            <li>Paste the JSON below (make sure it starts with { and ends with })</li>
                        </ol>
                    </div>
                    
                    <div>
                        <label class="block text-gray-300 mb-2">Copy this script:</label>
                        <div class="relative">
                            <textarea id="import-script" class="w-full bg-gray-800 text-white px-3 py-2 rounded h-32 font-mono text-xs" readonly></textarea>
                            <button id="copy-script-btn" class="absolute top-2 right-2 bg-gray-600 hover:bg-gray-500 text-white text-xs py-1 px-2 rounded">
                                Copy
                            </button>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-gray-300 mb-2">Paste the JSON result here:</label>
                        <textarea id="import-json" class="w-full bg-gray-700 text-white px-3 py-2 rounded h-32 font-mono text-xs" placeholder='{"name": "Character Name", ...}'></textarea>
                    </div>
                    
                    <div class="flex justify-end space-x-2">
                        <button id="cancel-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                            Cancel
                        </button>
                        <button id="import-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Import Character
                        </button>
                    </div>
                </div>
            `,
            width: 'max-w-2xl'
        });
        
        // Add event listeners
        const importScript = modal.querySelector('#import-script');
        const copyScriptBtn = modal.querySelector('#copy-script-btn');
        const importJson = modal.querySelector('#import-json');
        const cancelBtn = modal.querySelector('#cancel-btn');
        const importBtn = modal.querySelector('#import-btn');
        
        // Set the import script
        importScript.value = this.app.api.getDnDBeyondImportScript();
        
        // Copy script button
        copyScriptBtn.addEventListener('click', () => {
            importScript.select();
            document.execCommand('copy');
            copyScriptBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyScriptBtn.textContent = 'Copy';
            }, 2000);
        });
        
        cancelBtn.addEventListener('click', () => {
            this.closeModal(modal.parentNode);
        });
        
        importBtn.addEventListener('click', () => {
            let jsonText = importJson.value.trim();
            if (!jsonText) {
                this.app.showAlert('Please paste the JSON data from D&D Beyond.');
                return;
            }
            
            try {
                // Fix common JSON issues
                
                // Add missing braces if needed
                if (!jsonText.startsWith('{')) {
                    jsonText = '{' + jsonText;
                }
                if (!jsonText.endsWith('}')) {
                    jsonText = jsonText + '}';
                }
                
                // Clean up the JSON text - remove any console prefixes or extra text
                if (jsonText.includes('\n')) {
                    // Try to extract just the JSON object from multiple lines
                    const lines = jsonText.split('\n');
                    let jsonLines = [];
                    let inJson = false;
                    
                    for (const line of lines) {
                        const trimmedLine = line.trim();
                        
                        if (trimmedLine === '{') {
                            inJson = true;
                            jsonLines.push('{');
                        } else if (trimmedLine === '}') {
                            jsonLines.push('}');
                            inJson = false;
                        } else if (inJson) {
                            jsonLines.push(trimmedLine);
                        }
                    }
                    
                    if (jsonLines.length > 0) {
                        jsonText = jsonLines.join('\n');
                    }
                }
                
                // Parse the JSON
                const data = JSON.parse(jsonText);
                
                // Check for error
                if (data.error) {
                    throw new Error(data.error);
                }
                
                // Parse the character
                const character = this.app.api.parseDnDBeyondCharacter(data);
                
                // Add to combat
                this.app.combat.addCreature(character);
                
                // Close the modal
                this.closeModal(modal.parentNode);
                
                // Log the event
                this.app.logEvent(`${character.name} imported from D&D Beyond.`);
            } catch (error) {
                this.app.showAlert(`Error importing character: ${error.message}\n\nMake sure you've copied the entire JSON output from the console and it starts with { and ends with }.`);
                console.error('JSON parsing error:', error);
                console.log('Attempted to parse:', jsonText);
            }
        });
    }
    
    /**
     * Open the encounter builder modal
     */
    openEncounterBuilderModal() {
        const modal = this.createModal({
            title: 'Encounter Builder',
            content: `
                <div class="space-y-4">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold">Build Your Encounter</h3>
                        <div>
                            <button id="save-encounter-btn" class="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm">
                                Save Current
                            </button>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 class="font-semibold mb-2">Add Creatures</h4>
                            <div class="space-y-2">
                                <button id="add-hero-to-encounter" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                    Add Hero
                                </button>
                                <button id="add-monster-to-encounter" class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                                    Add Monster
                                </button>
                                <button id="add-group-to-encounter" class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
                                    Add Monster Group
                                </button>
                            </div>
                            
                            <div class="mt-4">
                                <h4 class="font-semibold mb-2">Current Encounter</h4>
                                <div id="encounter-creatures" class="bg-gray-700 rounded p-2 max-h-64 overflow-y-auto">
                                    <div class="text-gray-400 text-center py-2">No creatures added yet</div>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <h4 class="font-semibold mb-2">Saved Encounters</h4>
                            <div id="saved-encounters" class="bg-gray-700 rounded p-2 max-h-80 overflow-y-auto">
                                <div class="text-gray-400 text-center py-2">No saved encounters</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex justify-end mt-4">
                        <button id="close-encounter-builder-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                            Close
                        </button>
                    </div>
                </div>
            `,
            width: 'max-w-4xl'
        });
        
        // Load saved encounters
        this.loadSavedEncounters(modal.querySelector('#saved-encounters'));
        
        // Add event listeners
        modal.querySelector('#add-hero-to-encounter').addEventListener('click', () => {
            this.openAddHeroModal(true); // true = for encounter builder
        });
        
        modal.querySelector('#add-monster-to-encounter').addEventListener('click', () => {
            this.openAddMonsterModal(true); // true = for encounter builder
        });
        
        modal.querySelector('#add-group-to-encounter').addEventListener('click', () => {
            this.openAddMonsterGroupModal();
        });
        
        modal.querySelector('#save-encounter-btn').addEventListener('click', () => {
            this.openSaveEncounterModal();
        });
        
        modal.querySelector('#close-encounter-builder-btn').addEventListener('click', () => {
            this.closeModal(modal.parentNode);
        });
    }
    
    /**
     * Load saved encounters into the encounter builder
     * @param {HTMLElement} container - The container to load encounters into
     */
    loadSavedEncounters(container) {
        const encounters = this.app.storage.loadData('encounters', []);
        
        if (encounters.length === 0) {
            container.innerHTML = `<div class="text-gray-400 text-center py-2">No saved encounters</div>`;
            return;
        }
        
        container.innerHTML = encounters.map(encounter => `
            <div class="encounter-item bg-gray-600 hover:bg-gray-500 p-2 mb-2 rounded">
                <div class="flex justify-between items-center">
                    <div class="font-semibold">${encounter.name}</div>
                    <div class="flex space-x-1">
                        <button class="load-encounter-btn bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded" data-encounter-id="${encounter.id}">
                            Load
                        </button>
                        <button class="delete-encounter-btn bg-red-600 hover:bg-red-700 text-white text-xs py-1 px-2 rounded" data-encounter-id="${encounter.id}">
                            Delete
                        </button>
                    </div>
                </div>
                <div class="text-sm text-gray-300 mt-1">
                    ${encounter.creatures.length} creatures
                    <span class="text-xs text-gray-400">
                        (${encounter.creatures.filter(c => c.type === 'hero').length} heroes, 
                        ${encounter.creatures.filter(c => c.type === 'monster').length} monsters)
                    </span>
                </div>
                ${encounter.description ? `<div class="text-sm text-gray-400 mt-1">${encounter.description}</div>` : ''}
            </div>
        `).join('');
        
        // Add event listeners
        container.querySelectorAll('.load-encounter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const encounterId = btn.dataset.encounterId;
                this.app.storage.loadEncounter(encounterId);
                this.closeModal(container.closest('.modal-backdrop'));
            });
        });
        
        container.querySelectorAll('.delete-encounter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const encounterId = btn.dataset.encounterId;
                const encounterName = encounters.find(e => e.id === encounterId)?.name || 'Unknown';
                
                this.app.showConfirm(`Are you sure you want to delete the encounter "${encounterName}"?`, () => {
                    this.app.storage.deleteEncounter(encounterId);
                    this.loadSavedEncounters(container);
                });
            });
        });
    }
    
    /**
     * Open the save encounter modal
     */
    openSaveEncounterModal() {
        const creatures = this.app.combat.getAllCreatures();
        
        if (creatures.length === 0) {
            this.app.showAlert('No creatures to save.');
            return;
        }
        
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
                        <textarea id="encounter-description" class="w-full bg-gray-700 text-white px-3 py-2 rounded h-20" placeholder="Enter a description for this encounter..."></textarea>
                    </div>
                    
                    <div>
                        <label class="block text-gray-300 mb-2">Creatures in this encounter:</label>
                        <div class="bg-gray-800 p-2 rounded max-h-40 overflow-y-auto">
                            <ul class="list-disc list-inside">
                                ${creatures.map(c => `
                                    <li>${c.type === 'hero' ? '👤' : '👹'} ${c.name} (HP: ${c.maxHp}, AC: ${c.ac})</li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                    
                    <div class="flex justify-end space-x-2">
                        <button id="cancel-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                            Cancel
                        </button>
                        <button id="save-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Save Encounter
                        </button>
                    </div>
                </div>
            `,
            width: 'max-w-md'
        });
        
        // Add event listeners
        const nameInput = modal.querySelector('#encounter-name');
        const descriptionInput = modal.querySelector('#encounter-description');
        const cancelBtn = modal.querySelector('#cancel-btn');
        const saveBtn = modal.querySelector('#save-btn');
        
        cancelBtn.addEventListener('click', () => {
            this.closeModal(modal.parentNode);
        });
        
        saveBtn.addEventListener('click', () => {
            const name = nameInput.value.trim();
            const description = descriptionInput.value.trim();
            
            if (!name) {
                this.app.showAlert('Please enter a name for the encounter.');
                return;
            }
            
            // Save the encounter
            const encounterId = this.app.storage.saveEncounter(name, description);
            
            if (encounterId) {
                this.app.showAlert(`Encounter "${name}" saved successfully.`);
                this.closeModal(modal.parentNode);
            }
        });
    }
    
    /**
     * Open the add monster group modal
     */
    openAddMonsterGroupModal() {
        const modal = this.createModal({
            title: 'Add Monster Group',
            content: `
                <div class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-gray-300 mb-2">Monster Name:</label>
                            <input type="text" id="monster-name" class="w-full bg-gray-700 text-white px-3 py-2 rounded" required>
                        </div>
                        <div>
                            <label class="block text-gray-300 mb-2">Number of Monsters:</label>
                            <input type="number" id="monster-count" class="w-full bg-gray-700 text-white px-3 py-2 rounded" min="1" value="4">
                        </div>
                        <div>
                            <label class="block text-gray-300 mb-2">Initiative Bonus:</label>
                            <input type="number" id="monster-initiative" class="w-full bg-gray-700 text-white px-3 py-2 rounded" value="0">
                        </div>
                        <div>
                            <label class="block text-gray-300 mb-2">HP per Monster:</label>
                            <input type="number" id="monster-hp" class="w-full bg-gray-700 text-white px-3 py-2 rounded" min="1" value="10" required>
                        </div>
                        <div>
                            <label class="block text-gray-300 mb-2">AC:</label>
                            <input type="number" id="monster-ac" class="w-full bg-gray-700 text-white px-3 py-2 rounded" min="1" value="10" required>
                        </div>
                        <div>
                            <label class="block text-gray-300 mb-2">HP Variation (%):</label>
                            <input type="number" id="hp-variation" class="w-full bg-gray-700 text-white px-3 py-2 rounded" min="0" max="50" value="10">
                            <p class="text-xs text-gray-400 mt-1">Randomizes HP by ±X% for variety</p>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-gray-300 mb-2">Naming Style:</label>
                        <div class="flex space-x-4">
                            <label class="flex items-center">
                                <input type="radio" name="naming-style" value="number" class="mr-2" checked>
                                <span>Numbered (Goblin 1, Goblin 2)</span>
                            </label>
                            <label class="flex items-center">
                                <input type="radio" name="naming-style" value="letter" class="mr-2">
                                <span>Lettered (Goblin A, Goblin B)</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="flex justify-end space-x-2">
                        <button id="cancel-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                            Cancel
                        </button>
                        <button id="add-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Add Group
                        </button>
                    </div>
                </div>
            `,
            width: 'max-w-2xl'
        });
        
        // Add event listeners
        const nameInput = modal.querySelector('#monster-name');
        const countInput = modal.querySelector('#monster-count');
        const initiativeInput = modal.querySelector('#monster-initiative');
        const hpInput = modal.querySelector('#monster-hp');
        const acInput = modal.querySelector('#monster-ac');
        const hpVariationInput = modal.querySelector('#hp-variation');
        const namingStyleInputs = modal.querySelectorAll('input[name="naming-style"]');
        const cancelBtn = modal.querySelector('#cancel-btn');
        const addBtn = modal.querySelector('#add-btn');
        
        cancelBtn.addEventListener('click', () => {
            this.closeModal(modal.parentNode);
        });
        
        addBtn.addEventListener('click', () => {
            // Validate inputs
            const name = nameInput.value.trim();
            const count = parseInt(countInput.value) || 4;
            const initiativeBonus = parseInt(initiativeInput.value) || 0;
            const hp = parseInt(hpInput.value) || 10;
            const ac = parseInt(acInput.value) || 10;
            const hpVariation = parseInt(hpVariationInput.value) || 0;
            
            // Get naming style
            let namingStyle = 'number';
            namingStyleInputs.forEach(input => {
                if (input.checked) {
                    namingStyle = input.value;
                }
            });
            
            if (!name) {
                this.app.showAlert('Please enter a name for the monsters.');
                return;
            }
            
            if (count < 1) {
                this.app.showAlert('Number of monsters must be at least 1.');
                return;
            }
            
            if (hp < 1) {
                this.app.showAlert('HP must be at least 1.');
                return;
            }
            
            if (ac < 1) {
                this.app.showAlert('AC must be at least 1.');
                return;
            }
            
            // Create the monsters
            for (let i = 0; i < count; i++) {
                // Generate suffix based on naming style
                let suffix;
                if (namingStyle === 'letter') {
                    suffix = String.fromCharCode(65 + i); // A, B, C, ...
                } else {
                    suffix = (i + 1).toString(); // 1, 2, 3, ...
                }
                
                // Calculate HP with variation
                let monsterHp = hp;
                if (hpVariation > 0) {
                    const variation = hp * (hpVariation / 100);
                    const min = Math.max(1, Math.floor(hp - variation));
                    const max = Math.ceil(hp + variation);
                    monsterHp = Math.floor(Math.random() * (max - min + 1)) + min;
                }
                
                const monster = {
                    id: this.app.utils.generateUUID(),
                    name: `${name} ${suffix}`,
                    type: 'monster',
                    maxHp: monsterHp,
                    currentHp: monsterHp,
                    ac: ac,
                    initiativeBonus: initiativeBonus,
                    initiative: null,
                    conditions: [],
                    source: 'Group'
                };
                
                // Add the monster to combat
                this.app.combat.addCreature(monster);
            }
            
            // Close the modal
            this.closeModal(modal.parentNode);
            
            // Log the event
            this.app.logEvent(`Added ${count} ${name} monsters to combat.`);
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
        backdrop.className = 'modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
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
                    <div class="alert-message">${message}</div>
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
        
        okBtn.addEventListener('click
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
    
    /**
     * Open the player view settings modal
     */
    openPlayerViewSettingsModal() {
        const modal = this.createModal({
            title: 'Player View Settings',
            content: `
                <div class="space-y-4">
                    <div>
                        <label class="block text-gray-300 mb-2">HP Display Style:</label>
                        <select id="hp-display-style" class="w-full bg-gray-700 text-white px-3 py-2 rounded">
                            <option value="descriptive" ${this.playerViewSettings.hpDisplay === 'descriptive' ? 'selected' : ''}>Descriptive (Healthy, Bloodied, etc.)</option>
                            <option value="exact" ${this.playerViewSettings.hpDisplay === 'exact' ? 'selected' : ''}>Exact Numbers for Heroes</option>
                            <option value="hidden" ${this.playerViewSettings.hpDisplay === 'hidden' ? 'selected' : ''}>Hidden</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-gray-300 mb-2">Background Theme:</label>
                        <select id="background-theme" class="w-full bg-gray-700 text-white px-3 py-2 rounded">
                            <option value="default" ${this.playerViewSettings.theme === 'default' ? 'selected' : ''}>Default (Dark)</option>
                            <option value="dungeon" ${this.playerViewSettings.theme === 'dungeon' ? 'selected' : ''}>Dungeon</option>
                            <option value="forest" ${this.playerViewSettings.theme === 'forest' ? 'selected' : ''}>Forest</option>
                            <option value="castle" ${this.playerViewSettings.theme === 'castle' ? 'selected' : ''}>Castle</option>
                            <option value="tavern" ${this.playerViewSettings.theme === 'tavern' ? 'selected' : ''}>Tavern</option>
                            <option value="custom" ${this.playerViewSettings.theme === 'custom' ? 'selected' : ''}>Custom URL</option>
                        </select>
                    </div>
                    
                    <div id="custom-background-container" class="${this.playerViewSettings.theme === 'custom' ? '' : 'hidden'}">
                        <label class="block text-gray-300 mb-2">Custom Background URL:</label>
                        <input type="text" id="custom-background-url" class="w-full bg-gray-700 text-white px-3 py-2 rounded" 
                            value="${this.playerViewSettings.customBackground || ''}">
                        <p class="text-xs text-gray-400 mt-1">Enter the URL of an image to use as the background</p>
                    </div>
                    
                    <div class="flex justify-end space-x-2">
                        <button id="cancel-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                            Cancel
                        </button>
                        <button id="save-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Save Settings
                        </button>
                    </div>
                </div>
            `,
            width: 'max-w-md'
        });
        
        // Add event listeners
        const hpDisplayStyle = modal.querySelector('#hp-display-style');
        const backgroundTheme = modal.querySelector('#background-theme');
        const customBackgroundContainer = modal.querySelector('#custom-background-container');
        const customBackgroundUrl = modal.querySelector('#custom-background-url');
        const cancelBtn = modal.querySelector('#cancel-btn');
        const saveBtn = modal.querySelector('#save-btn');
        
        // Show/hide custom background URL input
        backgroundTheme.addEventListener('change', () => {
            if (backgroundTheme.value === 'custom') {
                customBackgroundContainer.classList.remove('hidden');
            } else {
                customBackgroundContainer.classList.add('hidden');
            }
        });
        
        cancelBtn.addEventListener('click', () => {
            this.closeModal(modal.parentNode);
        });
        
        saveBtn.addEventListener('click', () => {
            // Update settings
            this.playerViewSettings.hpDisplay = hpDisplayStyle.value;
            this.playerViewSettings.theme = backgroundTheme.value;
            this.playerViewSettings.customBackground = customBackgroundUrl.value.trim();
            
            // Save settings
            this.savePlayerViewSettings();
            
            // Update player view if open
            if (this.app.state.playerViewWindow && !this.app.state.playerViewWindow.closed) {
                this.app.updatePlayerView();
            }
            
            // Close modal
            this.closeModal(modal.parentNode);
            
            // Log event
            this.app.logEvent('Player view settings updated.');
        });
    }
    
    /**
     * Create the hotbar
     */
    createHotbar() {
        // Check if hotbar already exists
        if (document.getElementById('action-hotbar')) return;
        
        // Load hotbar actions
        this.hotbarActions = this.app.storage.loadData('hotbarActions', []);
        
        // Create hotbar container
        const hotbar = document.createElement('div');
        hotbar.id = 'action-hotbar';
        hotbar.className = 'fixed bottom-4 right-4 bg-gray-800 rounded-lg shadow-lg p-2 z-30';
        
        // Create hotbar content
        hotbar.innerHTML = `
            <div class="flex space-x-2">
                ${Array(5).fill(0).map((_, index) => {
                    const action = this.hotbarActions[index];
                    return `
                        <div class="hotbar-slot" data-slot="${index}">
                            <button class="hotbar-action-btn w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center text-white font-bold" 
                                data-action-index="${index}" title="${action ? action.tooltip || '' : 'Empty slot'}">
                                ${action ? action.label : '+'}
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        // Add to document
        document.body.appendChild(hotbar);
        
        // Add event listeners
        hotbar.querySelectorAll('.hotbar-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const actionIndex = parseInt(btn.dataset.actionIndex);
                this.executeHotbarAction(actionIndex);
            });
            
            // Right-click to edit
            btn.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                const actionIndex = parseInt(btn.dataset.actionIndex);
                this.editHotbarAction(actionIndex);
            });
        });
    }
    
    /**
     * Add an action to the hotbar
     * @param {Object} action - The action to add
     */
    addToHotbar(action) {
        // Find an empty slot or use the first slot
        let slotIndex = this.hotbarActions.findIndex(a => !a);
        if (slotIndex === -1) slotIndex = 0;
        
        // Add the action
        this.hotbarActions[slotIndex] = action;
        
        // Save hotbar actions
        this.app.storage.saveData('hotbarActions', this.hotbarActions);
        
        // Update hotbar UI
        this.updateHotbarUI();
    }
    
    /**
     * Execute a hotbar action
     * @param {number} index - The index of the action to execute
     */
    executeHotbarAction(index) {
        const action = this.hotbarActions[index];
        if (!action) {
            this.editHotbarAction(index);
            return;
        }
        
        switch (action.type) {
            case 'statBlock':
                const creature = this.app.combat.getCreatureById(action.creatureId);
                if (creature) {
                    this.openStatBlockModal(action.creatureId);
                } else {
                    this.app.showAlert('Creature not found.');
                    this.hotbarActions[index] = null;
                    this.app.storage.saveData('hotbarActions', this.hotbarActions);
                    this.updateHotbarUI();
                }
                break;
            case 'diceRoll':
                this.app.dice.rollAndDisplay(action.dice);
                break;
            case 'customAction':
                if (action.callback && typeof action.callback === 'function') {
                    action.callback();
                }
                break;
            default:
                this.app.showAlert('Unknown action type.');
        }
    }
    
    /**
     * Edit a hotbar action
     * @param {number} index - The index of the action to edit
     */
    editHotbarAction(index) {
        const action = this.hotbarActions[index];
        
        const modal = this.createModal({
            title: action ? 'Edit Hotbar Action' : 'Add Hotbar Action',
            content: `
                <div class="space-y-4">
                    <div>
                        <label class="block text-gray-300 mb-2">Action Type:</label>
                        <select id="action-type" class="w-full bg-gray-700 text-white px-3 py-2 rounded">
                            <option value="diceRoll" ${action && action.type === 'diceRoll' ? 'selected' : ''}>Dice Roll</option>
                            <option value="empty" ${!action ? 'selected' : ''}>Empty Slot</option>
                        </select>
                    </div>
                    
                    <div id="dice-roll-options" class="${action && action.type === 'diceRoll' ? '' : 'hidden'}">
                        <label class="block text-gray-300 mb-2">Dice Expression:</label>
                        <input type="text" id="dice-expression" class="w-full bg-gray-700 text-white px-3 py-2 rounded" 
                            value="${action && action.type === 'diceRoll' ? action.dice : '1d20'}" placeholder="e.g., 1d20+5, 2d6">
                    </div>
                    
                    <div>
                        <label class="block text-gray-300 mb-2">Label (1-2 characters):</label>
                        <input type="text" id="action-label" class="w-full bg-gray-700 text-white px-3 py-2 rounded" maxlength="2"
                            value="${action ? action.label : ''}" placeholder="e.g., D, 20">
                    </div>
                    
                    <div>
                        <label class="block text-gray-300 mb-2">Tooltip:</label>
                        <input type="text" id="action-tooltip" class="w-full bg-gray-700 text-white px-3 py-2 rounded"
                            value="${action && action.tooltip ? action.tooltip : ''}" placeholder="e.g., Roll d20">
                    </div>
                    
                    <div class="flex justify-end space-x-2">
                        ${action ? `
                        <button id="remove-btn" class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                            Remove
                        </button>
                        ` : ''}
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
        const actionType = modal.querySelector('#action-type');
        const diceRollOptions = modal.querySelector('#dice-roll-options');
        const diceExpression = modal.querySelector('#dice-expression');
        const actionLabel = modal.querySelector('#action-label');
        const actionTooltip = modal.querySelector('#action-tooltip');
        const cancelBtn = modal.querySelector('#cancel-btn');
        const saveBtn = modal.querySelector('#save-btn');
        const removeBtn = modal.querySelector('#remove-btn');
        
        // Show/hide options based on action type
        actionType.addEventListener('change', () => {
            if (actionType.value === 'diceRoll') {
                diceRollOptions.classList.remove('hidden');
            } else {
                diceRollOptions.classList.add('hidden');
            }
        });
        
        cancelBtn.addEventListener('click', () => {
            this.closeModal(modal.parentNode);
        });
        
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                this.hotbarActions[index] = null;
                this.app.storage.saveData('hotbarActions', this.hotbarActions);
                this.updateHotbarUI();
                this.closeModal(modal.parentNode);
            });
        }
        
        saveBtn.addEventListener('click', () => {
            if (actionType.value === 'empty') {
                this.hotbarActions[index] = null;
            } else if (actionType.value === 'diceRoll') {
                const dice = diceExpression.value.trim();
                const label = actionLabel.value.trim() || 'D';
                const tooltip = actionTooltip.value.trim() || `Roll ${dice}`;
                
                if (!dice) {
                    this.app.showAlert('Please enter a dice expression.');
                    return;
                }
                
                this.hotbarActions[index] = {
                    type: 'diceRoll',
                    dice: dice,
                    label: label,
                    tooltip: tooltip
                };
            }
            
            // Save hotbar actions
            this.app.storage.saveData('hotbarActions', this.hotbarActions);
            
            // Update hotbar UI
            this.updateHotbarUI();
            
            // Close modal
            this.closeModal(modal.parentNode);
        });
    }
    
    /**
     * Update the hotbar UI
     */
    updateHotbarUI() {
        const hotbar = document.getElementById('action-hotbar');
        if (!hotbar) return;
        
        const slots = hotbar.querySelectorAll('.hotbar-action-btn');
        slots.forEach((slot, index) => {
            const action = this.hotbarActions[index];
            if (action) {
                slot.textContent = action.label || '+';
                slot.title = action.tooltip || '';
            } else {
                slot.textContent = '+';
                slot.title = 'Empty slot';
            }
        });
    }
    
    /**
     * Update theme elements based on current theme
     */
    updateThemeElements() {
        const theme = this.app.settings.getSetting('theme', 'theme-default');
        document.documentElement.className = theme;
    }
}
