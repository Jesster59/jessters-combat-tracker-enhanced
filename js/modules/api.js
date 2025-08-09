/**
 * API Manager for Jesster's Combat Tracker
 * Handles API calls and data integration
 */
class APIManager {
    constructor(app) {
        this.app = app;
        this.monsterCompendium = null;
        this.spellDatabase = null;
        console.log("API Manager initialized");
    }
    
    /**
     * Initialize the API manager
     */
    async init() {
        // Preload monster compendium if enabled
        if (this.app.settings.getSetting('preloadMonsterCompendium', true)) {
            this.loadMonsterCompendium().catch(error => {
                console.warn('Failed to preload monster compendium:', error);
            });
        }
        
        console.log("API Manager initialized");
    }
    
    /**
     * Search for monsters in the Open5e API
     * @param {string} query - The search query
     * @returns {Promise<Array>} - The search results
     */
    async searchMonsters(query) {
        try {
            const response = await fetch(`https://api.open5e.com/monsters/?search=${encodeURIComponent(query)}&limit=20`);
            const data = await response.json();
            return data.results || [];
        } catch (error) {
            console.error('Error searching monsters:', error);
            this.app.showAlert('Error searching monsters. Please try again later.');
            return [];
        }
    }
    
    /**
     * Get a monster from the Open5e API
     * @param {string} slug - The monster slug
     * @returns {Promise<Object>} - The monster data
     */
    async getMonster(slug) {
        try {
            const response = await fetch(`https://api.open5e.com/monsters/${slug}/`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error getting monster:', error);
            this.app.showAlert('Error getting monster data. Please try again later.');
            return null;
        }
    }
    
    /**
     * Convert an Open5e monster to our format
     * @param {Object} monster - The Open5e monster data
     * @returns {Object} - The converted monster
     */
    convertOpen5eMonster(monster) {
        // Parse hit points
        let hp = 10;
        const hpMatch = monster.hit_points_roll?.match(/(\d+)d(\d+)(?:\s*\+\s*(\d+))?/);
        if (hpMatch) {
            const count = parseInt(hpMatch[1]);
            const dice = parseInt(hpMatch[2]);
            const bonus = hpMatch[3] ? parseInt(hpMatch[3]) : 0;
            hp = monster.hit_points || (Math.floor(count * (dice + 1) / 2) + bonus);
        } else {
            hp = monster.hit_points || 10;
        }
        
        // Calculate initiative bonus from dexterity
        const dexMod = Math.floor((monster.dexterity - 10) / 2);
        
        // Convert actions
        const actions = monster.actions ? monster.actions.map(action => {
            return {
                name: action.name,
                desc: action.desc
            };
        }) : [];
        
        // Convert special abilities
        const specialAbilities = monster.special_abilities ? monster.special_abilities.map(ability => {
            return {
                name: ability.name,
                desc: ability.desc
            };
        }) : [];
        
        // Convert legendary actions
        const legendaryActions = monster.legendary_actions ? monster.legendary_actions.map(action => {
            return {
                name: action.name,
                desc: action.desc
            };
        }) : [];
        
        // Create the monster object
        return {
            id: this.app.utils.generateUUID(),
            name: monster.name,
            type: 'monster',
            size: monster.size,
            cr: monster.challenge_rating,
            alignment: monster.alignment,
            maxHp: hp,
            currentHp: hp,
            ac: monster.armor_class,
            initiativeBonus: dexMod,
            initiative: null,
            conditions: [],
            str: monster.strength,
            dex: monster.dexterity,
            con: monster.constitution,
            int: monster.intelligence,
            wis: monster.wisdom,
            cha: monster.charisma,
            speed: monster.speed,
            senses: monster.senses,
            languages: monster.languages,
            damageVulnerabilities: monster.damage_vulnerabilities,
            damageResistances: monster.damage_resistances,
            damageImmunities: monster.damage_immunities,
            conditionImmunities: monster.condition_immunities,
            actions: actions,
            specialAbilities: specialAbilities,
            legendaryActions: legendaryActions.length > 0 ? {
                actions: legendaryActions,
                max: 3,
                used: 0
            } : null,
            source: 'Open5e SRD'
        };
    }
    
    /**
     * Load the monster compendium
     * @returns {Promise<Array>} - The monster compendium
     */
    async loadMonsterCompendium() {
        try {
            const response = await fetch('data/monster-compendium.json');
            const data = await response.json();
            
            this.monsterCompendium = data;
            console.log(`Loaded ${data.length} monsters into compendium`);
            return data;
        } catch (error) {
            console.error('Error loading monster compendium:', error);
            return [];
        }
    }
    
    /**
     * Open the monster compendium
     */
    openMonsterCompendium() {
        // Load compendium if not already loaded
        if (!this.monsterCompendium) {
            this.loadMonsterCompendium().then(data => {
                if (data.length > 0) {
                    this.showMonsterCompendiumUI(data);
                } else {
                    this.app.showAlert('Failed to load monster compendium.');
                }
            });
        } else {
            this.showMonsterCompendiumUI(this.monsterCompendium);
        }
    }
    
    /**
     * Show the monster compendium UI
     * @param {Array} monsters - The monster compendium data
     */
    showMonsterCompendiumUI(monsters) {
        const modal = this.app.ui.createModal({
            title: 'Monster Compendium',
            content: `
                <div class="space-y-4">
                    <div class="flex mb-4">
                        <input type="text" id="monster-search" class="flex-1 bg-gray-700 text-white px-3 py-2 rounded-l" placeholder="Search monsters...">
                        <button id="search-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r">
                            Search
                        </button>
                    </div>
                    
                    <div class="flex space-x-4">
                        <div class="w-1/3">
                            <h3 class="font-semibold mb-2">Filters</h3>
                            <div class="space-y-2">
                                <div>
                                    <label class="block text-gray-300 mb-1">Challenge Rating</label>
                                    <select id="cr-filter" class="w-full bg-gray-700 text-white px-3 py-2 rounded">
                                        <option value="">Any CR</option>
                                        <option value="0-1">CR 0-1</option>
                                        <option value="2-5">CR 2-5</option>
                                        <option value="6-10">CR 6-10</option>
                                        <option value="11-15">CR 11-15</option>
                                        <option value="16+">CR 16+</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-gray-300 mb-1">Type</label>
                                    <select id="type-filter" class="w-full bg-gray-700 text-white px-3 py-2 rounded">
                                        <option value="">Any Type</option>
                                        <option value="aberration">Aberration</option>
                                        <option value="beast">Beast</option>
                                        <option value="celestial">Celestial</option>
                                        <option value="construct">Construct</option>
                                        <option value="dragon">Dragon</option>
                                        <option value="elemental">Elemental</option>
                                        <option value="fey">Fey</option>
                                        <option value="fiend">Fiend</option>
                                        <option value="giant">Giant</option>
                                        <option value="humanoid">Humanoid</option>
                                        <option value="monstrosity">Monstrosity</option>
                                        <option value="ooze">Ooze</option>
                                        <option value="plant">Plant</option>
                                        <option value="undead">Undead</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-gray-300 mb-1">Size</label>
                                    <select id="size-filter" class="w-full bg-gray-700 text-white px-3 py-2 rounded">
                                        <option value="">Any Size</option>
                                        <option value="tiny">Tiny</option>
                                        <option value="small">Small</option>
                                        <option value="medium">Medium</option>
                                        <option value="large">Large</option>
                                        <option value="huge">Huge</option>
                                        <option value="gargantuan">Gargantuan</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div class="w-2/3">
                            <h3 class="font-semibold mb-2">Results</h3>
                            <div id="monster-results" class="bg-gray-700 rounded p-2 max-h-96 overflow-y-auto">
                                <div class="text-gray-400 text-center py-4">Use the search and filters to find monsters</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex justify-end mt-4">
                        <button id="close-compendium-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                            Close
                        </button>
                    </div>
                </div>
            `,
            width: 'max-w-5xl'
        });
        
        // Add event listeners
        const searchInput = modal.querySelector('#monster-search');
        const searchBtn = modal.querySelector('#search-btn');
        const crFilter = modal.querySelector('#cr-filter');
        const typeFilter = modal.querySelector('#type-filter');
        const sizeFilter = modal.querySelector('#size-filter');
        const resultsContainer = modal.querySelector('#monster-results');
        const closeBtn = modal.querySelector('#close-compendium-btn');
        
        // Search function
        const performSearch = () => {
            const query = searchInput.value.toLowerCase();
            const cr = crFilter.value;
            const type = typeFilter.value;
            const size = sizeFilter.value;
            
            // Filter monsters
            const filteredMonsters = monsters.filter(monster => {
                // Name search
                if (query && !monster.name.toLowerCase().includes(query)) {
                    return false;
                }
                
                // CR filter
                if (cr) {
                    const monsterCR = parseFloat(monster.challenge_rating) || 0;
                    if (cr === '0-1' && monsterCR > 1) return false;
                    if (cr === '2-5' && (monsterCR < 2 || monsterCR > 5)) return false;
                    if (cr === '6-10' && (monsterCR < 6 || monsterCR > 10)) return false;
                    if (cr === '11-15' && (monsterCR < 11 || monsterCR > 15)) return false;
                    if (cr === '16+' && monsterCR < 16) return false;
                }
                
                // Type filter
                if (type && monster.type !== type) {
                    return false;
                }
                
                // Size filter
                if (size && monster.size !== size) {
                    return false;
                }
                
                return true;
            });
            
            // Display results
            if (filteredMonsters.length === 0) {
                resultsContainer.innerHTML = `<div class="text-gray-400 text-center py-4">No monsters found matching your criteria</div>`;
            } else {
                resultsContainer.innerHTML = filteredMonsters.map(monster => `
                    <div class="monster-item bg-gray-600 hover:bg-gray-500 p-2 mb-2 rounded cursor-pointer" data-monster-id="${monster.id}">
                        <div class="flex justify-between">
                            <div class="font-semibold">${monster.name}</div>
                            <div class="text-sm">CR ${monster.challenge_rating}</div>
                        </div>
                        <div class="text-sm text-gray-300">${monster.size} ${monster.type}, ${monster.alignment}</div>
                    </div>
                `).join('');
                
                // Add click event for monsters
                resultsContainer.querySelectorAll('.monster-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const monsterId = item.dataset.monsterId;
                        const monster = monsters.find(m => m.id === monsterId);
                        if (monster) {
                            this.app.ui.openMonsterDetailModal(monster);
                        }
                    });
                });
            }
        };
        
        // Add event listeners
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', e => {
            if (e.key === 'Enter') performSearch();
        });
        
        crFilter.addEventListener('change', performSearch);
        typeFilter.addEventListener('change', performSearch);
        sizeFilter.addEventListener('change', performSearch);
        
        closeBtn.addEventListener('click', () => {
            this.app.ui.closeModal(modal.parentNode);
        });
        
        // Initial search to show all monsters
        performSearch();
    }
    
    /**
     * Load the spell database
     * @returns {Promise<Array>} - The spell database
     */
    async loadSpellDatabase() {
        try {
            const response = await fetch('data/spells.json');
            const data = await response.json();
            
            this.spellDatabase = data;
            console.log(`Loaded ${data.length} spells into database`);
            return data;
        } catch (error) {
            console.error('Error loading spell database:', error);
            return [];
        }
    }
    
    /**
     * Open the spell database
     */
    openSpellDatabase() {
        // Load database if not already loaded
        if (!this.spellDatabase) {
            this.loadSpellDatabase().then(data => {
                if (data.length > 0) {
                    this.showSpellDatabaseUI(data);
                } else {
                    this.app.showAlert('Failed to load spell database.');
                }
            });
        } else {
            this.showSpellDatabaseUI(this.spellDatabase);
        }
    }
    
    /**
     * Show the spell database UI
     * @param {Array} spells - The spell database data
     */
    showSpellDatabaseUI(spells) {
        const modal = this.app.ui.createModal({
            title: 'Spell Database',
            content: `
                <div class="space-y-4">
                    <div class="flex mb-4">
                        <input type="text" id="spell-search" class="flex-1 bg-gray-700 text-white px-3 py-2 rounded-l" placeholder="Search spells...">
                        <button id="search-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r">
                            Search
                        </button>
                    </div>
                    
                    <div class="flex space-x-4">
                        <div class="w-1/3">
                            <h3 class="font-semibold mb-2">Filters</h3>
                            <div class="space-y-2">
                                <div>
                                    <label class="block text-gray-300 mb-1">Level</label>
                                    <select id="level-filter" class="w-full bg-gray-700 text-white px-3 py-2 rounded">
                                        <option value="">Any Level</option>
                                        <option value="0">Cantrip</option>
                                        <option value="1">1st Level</option>
                                        <option value="2">2nd Level</option>
                                        <option value="3">3rd Level</option>
                                        <option value="4">4th Level</option>
                                        <option value="5">5th Level</option>
                                        <option value="6">6th Level</option>
                                        <option value="7">7th Level</option>
                                        <option value="8">8th Level</option>
                                        <option value="9">9th Level</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-gray-300 mb-1">School</label>
                                    <select id="school-filter" class="w-full bg-gray-700 text-white px-3 py-2 rounded">
                                        <option value="">Any School</option>
                                        <option value="abjuration">Abjuration</option>
                                        <option value="conjuration">Conjuration</option>
                                        <option value="divination">Divination</option>
                                        <option value="enchantment">Enchantment</option>
                                        <option value="evocation">Evocation</option>
                                        <option value="illusion">Illusion</option>
                                        <option value="necromancy">Necromancy</option>
                                        <option value="transmutation">Transmutation</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-gray-300 mb-1">Class</label>
                                    <select id="class-filter" class="w-full bg-gray-700 text-white px-3 py-2 rounded">
                                        <option value="">Any Class</option>
                                        <option value="bard">Bard</option>
                                        <option value="cleric">Cleric</option>
                                        <option value="druid">Druid</option>
                                        <option value="paladin">Paladin</option>
                                        <option value="ranger">Ranger</option>
                                        <option value="sorcerer">Sorcerer</option>
                                        <option value="warlock">Warlock</option>
                                        <option value="wizard">Wizard</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-gray-300 mb-1">Concentration</label>
                                    <select id="concentration-filter" class="w-full bg-gray-700 text-white px-3 py-2 rounded">
                                        <option value="">Any</option>
                                        <option value="yes">Concentration</option>
                                        <option value="no">Non-Concentration</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div class="w-2/3">
                            <h3 class="font-semibold mb-2">Results</h3>
                            <div id="spell-results" class="bg-gray-700 rounded p-2 max-h-96 overflow-y-auto">
                                <div class="text-gray-400 text-center py-4">Use the search and filters to find spells</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex justify-end mt-4">
                        <button id="close-database-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                            Close
                        </button>
                    </div>
                </div>
            `,
            width: 'max-w-5xl'
        });
        
        // Add event listeners
        const searchInput = modal.querySelector('#spell-search');
        const searchBtn = modal.querySelector('#search-btn');
        const levelFilter = modal.querySelector('#level-filter');
        const schoolFilter = modal.querySelector('#school-filter');
        const classFilter = modal.querySelector('#class-filter');
        const concentrationFilter = modal.querySelector('#concentration-filter');
        const resultsContainer = modal.querySelector('#spell-results');
        const closeBtn = modal.querySelector('#close-database-btn');
        
        // Search function
        const performSearch = () => {
            const query = searchInput.value.toLowerCase();
            const level = levelFilter.value;
            const school = schoolFilter.value;
            const characterClass = classFilter.value;
            const concentration = concentrationFilter.value;
            
            // Filter spells
            const filteredSpells = spells.filter(spell => {
                // Name search
                if (query && !spell.name.toLowerCase().includes(query)) {
                    return false;
                }
                
                // Level filter
                if (level && spell.level.toString() !== level) {
                    return false;
                }
                
                // School filter
                if (school && spell.school.toLowerCase() !== school) {
                    return false;
                }
                
                // Class filter
                if (characterClass && !spell.classes.includes(characterClass)) {
                    return false;
                }
                
                // Concentration filter
                if (concentration === 'yes' && !spell.concentration) {
                    return false;
                }
                if (concentration === 'no' && spell.concentration) {
                    return false;
                }
                
                return true;
            });
            
            // Display results
            if (filteredSpells.length === 0) {
                resultsContainer.innerHTML = `<div class="text-gray-400 text-center py-4">No spells found matching your criteria</div>`;
            } else {
                                resultsContainer.innerHTML = filteredSpells.map(spell => `
                    <div class="spell-item bg-gray-600 hover:bg-gray-500 p-2 mb-2 rounded cursor-pointer" data-spell-id="${spell.id}">
                        <div class="flex justify-between">
                            <div class="font-semibold">${spell.name}</div>
                            <div class="text-sm">${spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`}</div>
                        </div>
                        <div class="text-sm text-gray-300">${spell.school} • ${spell.casting_time} • ${spell.concentration ? 'Concentration' : 'Non-Concentration'}</div>
                    </div>
                `).join('');
                
                // Add click event for spells
                resultsContainer.querySelectorAll('.spell-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const spellId = item.dataset.spellId;
                        const spell = spells.find(s => s.id === spellId);
                        if (spell) {
                            this.showSpellDetailModal(spell);
                        }
                    });
                });
            }
        };
        
        // Add event listeners
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', e => {
            if (e.key === 'Enter') performSearch();
        });
        
        levelFilter.addEventListener('change', performSearch);
        schoolFilter.addEventListener('change', performSearch);
        classFilter.addEventListener('change', performSearch);
        concentrationFilter.addEventListener('change', performSearch);
        
        closeBtn.addEventListener('click', () => {
            this.app.ui.closeModal(modal.parentNode);
        });
        
        // Initial search to show all spells
        performSearch();
    }
    
    /**
     * Show the spell detail modal
     * @param {Object} spell - The spell data
     */
    showSpellDetailModal(spell) {
        const modal = this.app.ui.createModal({
            title: spell.name,
            content: `
                <div class="space-y-4">
                    <div class="text-sm text-gray-400">
                        ${spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`} ${spell.school}
                        ${spell.ritual ? ' (ritual)' : ''}
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div><span class="font-semibold">Casting Time:</span> ${spell.casting_time}</div>
                        <div><span class="font-semibold">Range:</span> ${spell.range}</div>
                        <div><span class="font-semibold">Components:</span> ${spell.components}</div>
                        <div><span class="font-semibold">Duration:</span> ${spell.concentration ? 'Concentration, ' : ''}${spell.duration}</div>
                    </div>
                    
                    <div class="text-sm">
                        <span class="font-semibold">Classes:</span> ${spell.classes.join(', ')}
                    </div>
                    
                    <div class="border-t border-gray-600 pt-4">
                        ${spell.description.split('\n').map(p => `<p class="mb-2">${p}</p>`).join('')}
                    </div>
                    
                    ${spell.higher_levels ? `
                        <div class="mt-2">
                            <span class="font-semibold">At Higher Levels:</span> ${spell.higher_levels}
                        </div>
                    ` : ''}
                    
                    <div class="flex justify-between mt-4">
                        ${spell.concentration ? `
                            <button id="add-concentration-btn" class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
                                Add as Concentration
                            </button>
                        ` : `
                            <div></div>
                        `}
                        <button id="close-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                            Close
                        </button>
                    </div>
                </div>
            `,
            width: 'max-w-2xl'
        });
        
        // Add event listeners
        const closeBtn = modal.querySelector('#close-btn');
        closeBtn.addEventListener('click', () => {
            this.app.ui.closeModal(modal.parentNode);
        });
        
        // Add concentration button
        const addConcentrationBtn = modal.querySelector('#add-concentration-btn');
        if (addConcentrationBtn) {
            addConcentrationBtn.addEventListener('click', () => {
                // Show creature selection modal
                this.showConcentrationCreatureSelectionModal(spell);
            });
        }
    }
    
    /**
     * Show the concentration creature selection modal
     * @param {Object} spell - The spell data
     */
    showConcentrationCreatureSelectionModal(spell) {
        const creatures = this.app.combat.getAllCreatures();
        
        if (creatures.length === 0) {
            this.app.showAlert('No creatures in combat to add concentration to.');
            return;
        }
        
        const modal = this.app.ui.createModal({
            title: `Add ${spell.name} as Concentration`,
            content: `
                <div class="space-y-4">
                    <p>Select a creature to add this spell as a concentration spell:</p>
                    
                    <div class="max-h-64 overflow-y-auto">
                        ${creatures.map(creature => `
                            <div class="creature-select-item bg-gray-700 hover:bg-gray-600 p-2 mb-2 rounded cursor-pointer" data-creature-id="${creature.id}">
                                <div class="flex justify-between">
                                    <div>${creature.type === 'hero' ? '👤' : '👹'} ${creature.name}</div>
                                    ${creature.concentration ? `
                                        <div class="text-sm text-yellow-400">
                                            Already concentrating on ${creature.concentration.spell}
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="flex justify-end mt-4">
                        <button id="cancel-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                            Cancel
                        </button>
                    </div>
                </div>
            `,
            width: 'max-w-md'
        });
        
        // Add event listeners
        const cancelBtn = modal.querySelector('#cancel-btn');
        cancelBtn.addEventListener('click', () => {
            this.app.ui.closeModal(modal.parentNode);
        });
        
        // Add click event for creature selection
        modal.querySelectorAll('.creature-select-item').forEach(item => {
            item.addEventListener('click', () => {
                const creatureId = item.dataset.creatureId;
                const creature = creatures.find(c => c.id === creatureId);
                
                if (creature) {
                    // If already concentrating, confirm replacement
                    if (creature.concentration) {
                        this.app.showConfirm(`${creature.name} is already concentrating on ${creature.concentration.spell}. Replace with ${spell.name}?`, () => {
                            this.addConcentrationSpell(creatureId, spell);
                            this.app.ui.closeModal(modal.parentNode);
                        });
                    } else {
                        this.addConcentrationSpell(creatureId, spell);
                        this.app.ui.closeModal(modal.parentNode);
                    }
                }
            });
        });
    }
    
    /**
     * Add a concentration spell to a creature
     * @param {string} creatureId - The ID of the creature
     * @param {Object} spell - The spell data
     */
    addConcentrationSpell(creatureId, spell) {
        // Parse duration to get number of rounds
        let duration = null;
        if (spell.duration) {
            const minutesMatch = spell.duration.match(/(\d+) minute/i);
            if (minutesMatch) {
                duration = parseInt(minutesMatch[1]) * 10; // 1 minute = 10 rounds
            }
            
            const roundsMatch = spell.duration.match(/(\d+) round/i);
            if (roundsMatch) {
                duration = parseInt(roundsMatch[1]);
            }
        }
        
        // Add concentration to creature
        this.app.combat.addConcentrationSpell(creatureId, spell.name, duration);
    }
    
    /**
     * Get the D&D Beyond import script
     * @returns {string} - The import script
     */
    getDnDBeyondImportScript() {
        return `
// Jesster's Combat Tracker - D&D Beyond Character Importer
// Run this script on a D&D Beyond character sheet page

(function() {
    try {
        // Check if we're on a D&D Beyond character page
        if (!window.location.href.includes('dndbeyond.com/characters/')) {
            console.error('This script must be run on a D&D Beyond character sheet page.');
            return;
        }
        
        // Get character data from the page
        const characterData = window.CharacterSheet?.characterData;
        if (!characterData) {
            console.error('Character data not found. Make sure you are on a character sheet page.');
            return;
        }
        
        // Extract basic character info
        const character = {
            name: characterData.name || 'Unknown Character',
            race: characterData.race?.fullName || characterData.race?.name || 'Unknown Race',
            classes: characterData.classes.map(c => \`\${c.definition.name} \${c.level}\`).join(', '),
            level: characterData.classes.reduce((total, c) => total + c.level, 0),
            
            // Stats
            hp: {
                current: characterData.overrideHitPoints !== null ? characterData.overrideHitPoints : characterData.baseHitPoints + characterData.temporaryHitPoints,
                max: characterData.baseHitPoints,
                temp: characterData.temporaryHitPoints || 0
            },
            ac: characterData.armorClass,
            
            // Abilities
            abilities: {
                str: characterData.stats[0].value,
                dex: characterData.stats[1].value,
                con: characterData.stats[2].value,
                int: characterData.stats[3].value,
                wis: characterData.stats[4].value,
                cha: characterData.stats[5].value
            },
            
            // Modifiers
            modifiers: {
                str: Math.floor((characterData.stats[0].value - 10) / 2),
                dex: Math.floor((characterData.stats[1].value - 10) / 2),
                con: Math.floor((characterData.stats[2].value - 10) / 2),
                int: Math.floor((characterData.stats[3].value - 10) / 2),
                wis: Math.floor((characterData.stats[4].value - 10) / 2),
                cha: Math.floor((characterData.stats[5].value - 10) / 2)
            },
            
            // Initiative
            initiative: Math.floor((characterData.stats[1].value - 10) / 2) + (characterData.initiativeBonus || 0),
            
            // Proficiency bonus
            profBonus: characterData.proficiencyBonus,
            
            // Saving throws
            savingThrows: characterData.stats.map(stat => ({
                name: stat.name,
                modifier: stat.saveModifier,
                proficient: stat.saveProficient
            })),
            
            // Skills
            skills: characterData.skills.map(skill => ({
                name: skill.name,
                modifier: skill.modifier,
                proficient: skill.proficient
            })),
            
            // Character image
            imageUrl: characterData.avatarUrl || null
        };
        
        console.log('='.repeat(50));
        console.log('Character data extracted successfully!');
        console.log('Copy the JSON below and paste it into Jesster\\'s Combat Tracker:');
        console.log('='.repeat(50));
        console.log(JSON.stringify(character, null, 2));
        console.log('='.repeat(50));
        
        return character;
    } catch (error) {
        console.error('Error extracting character data:', error);
        return { error: error.message };
    }
})();
        `;
    }
    
    /**
     * Parse a D&D Beyond character
     * @param {Object} data - The character data
     * @returns {Object} - The parsed character
     */
    parseDnDBeyondCharacter(data) {
        // Create the character object
        return {
            id: this.app.utils.generateUUID(),
            name: data.name,
            type: 'hero',
            maxHp: data.hp.max,
            currentHp: data.hp.current,
            ac: data.ac,
            initiativeBonus: data.initiative,
            initiative: null,
            conditions: [],
            imageUrl: data.imageUrl,
            source: 'D&D Beyond',
            
            // Additional character data
            str: data.abilities.str,
            dex: data.abilities.dex,
            con: data.abilities.con,
            int: data.abilities.int,
            wis: data.abilities.wis,
            cha: data.abilities.cha,
            
            level: data.level,
            race: data.race,
            classes: data.classes,
            profBonus: data.profBonus,
            
            savingThrows: data.savingThrows,
            skills: data.skills
        };
    }
}
