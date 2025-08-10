/**
 * Encounter module for Jesster's Combat Tracker
 * Handles encounter management, generation, and difficulty calculation
 */
class Encounter {
    constructor(storage, combat) {
        // Store references to other modules
        this.storage = storage;
        this.combat = combat;
        
        // Encounter data
        this.currentEncounter = null;
        this.savedEncounters = [];
        
        // XP thresholds by character level
        this.xpThresholds = {
            1: { easy: 25, medium: 50, hard: 75, deadly: 100 },
            2: { easy: 50, medium: 100, hard: 150, deadly: 200 },
            3: { easy: 75, medium: 150, hard: 225, deadly: 400 },
            4: { easy: 125, medium: 250, hard: 375, deadly: 500 },
            5: { easy: 250, medium: 500, hard: 750, deadly: 1100 },
            6: { easy: 300, medium: 600, hard: 900, deadly: 1400 },
            7: { easy: 350, medium: 750, hard: 1100, deadly: 1700 },
            8: { easy: 450, medium: 900, hard: 1400, deadly: 2100 },
            9: { easy: 550, medium: 1100, hard: 1600, deadly: 2400 },
            10: { easy: 600, medium: 1200, hard: 1900, deadly: 2800 },
            11: { easy: 800, medium: 1600, hard: 2400, deadly: 3600 },
            12: { easy: 1000, medium: 2000, hard: 3000, deadly: 4500 },
            13: { easy: 1100, medium: 2200, hard: 3400, deadly: 5100 },
            14: { easy: 1250, medium: 2500, hard: 3800, deadly: 5700 },
            15: { easy: 1400, medium: 2800, hard: 4300, deadly: 6400 },
            16: { easy: 1600, medium: 3200, hard: 4800, deadly: 7200 },
            17: { easy: 2000, medium: 3900, hard: 5900, deadly: 8800 },
            18: { easy: 2100, medium: 4200, hard: 6300, deadly: 9500 },
            19: { easy: 2400, medium: 4900, hard: 7300, deadly: 10900 },
            20: { easy: 2800, medium: 5700, hard: 8500, deadly: 12700 }
        };
        
        // XP multipliers based on number of monsters
        this.xpMultipliers = [
            { count: 1, multiplier: 1 },
            { count: 2, multiplier: 1.5 },
            { count: 3, multiplier: 2 },
            { count: 7, multiplier: 2.5 },
            { count: 11, multiplier: 3 },
            { count: 15, multiplier: 4 }
        ];
        
        // Load saved encounters
        this._loadSavedEncounters();
        
        console.log("Encounter module initialized");
    }

    /**
     * Create a new encounter
     * @param {string} name - Encounter name
     * @param {Array} monsters - Array of monsters
     * @param {Array} players - Array of players
     * @returns {Object} Created encounter
     */
    createEncounter(name, monsters = [], players = []) {
        // Generate encounter ID
        const encounterId = `encounter-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        
        // Create encounter object
        const encounter = {
            id: encounterId,
            name: name || `Encounter ${new Date().toLocaleDateString()}`,
            description: '',
            monsters: [...monsters],
            players: [...players],
            created: Date.now(),
            modified: Date.now(),
            tags: [],
            notes: '',
            environment: '',
            difficulty: this.calculateDifficulty(monsters, players)
        };
        
        // Set as current encounter
        this.currentEncounter = encounter;
        
        return encounter;
    }

    /**
     * Save the current encounter
     * @returns {Promise<boolean>} Success status
     */
    async saveCurrentEncounter() {
        if (!this.currentEncounter) {
            console.warn('No current encounter to save');
            return false;
        }
        
        // Update modified timestamp
        this.currentEncounter.modified = Date.now();
        
        // Save to storage
        try {
            await this.storage.save('encounters', this.currentEncounter);
            
            // Update saved encounters list
            const index = this.savedEncounters.findIndex(e => e.id === this.currentEncounter.id);
            if (index !== -1) {
                this.savedEncounters[index] = this.currentEncounter;
            } else {
                this.savedEncounters.push(this.currentEncounter);
            }
            
            return true;
        } catch (error) {
            console.error('Error saving encounter:', error);
            return false;
        }
    }

    /**
     * Load an encounter
     * @param {string} encounterId - Encounter ID
     * @returns {Promise<Object|null>} Loaded encounter or null if not found
     */
    async loadEncounter(encounterId) {
        try {
            const encounter = await this.storage.load('encounters', encounterId);
            if (!encounter) {
                console.warn(`Encounter not found: ${encounterId}`);
                return null;
            }
            
            this.currentEncounter = encounter;
            return encounter;
        } catch (error) {
            console.error('Error loading encounter:', error);
            return null;
        }
    }

    /**
     * Delete an encounter
     * @param {string} encounterId - Encounter ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteEncounter(encounterId) {
        try {
            await this.storage.delete('encounters', encounterId);
            
            // Update saved encounters list
            this.savedEncounters = this.savedEncounters.filter(e => e.id !== encounterId);
            
            // Clear current encounter if it was deleted
            if (this.currentEncounter && this.currentEncounter.id === encounterId) {
                this.currentEncounter = null;
            }
            
            return true;
        } catch (error) {
            console.error('Error deleting encounter:', error);
            return false;
        }
    }

    /**
     * Get all saved encounters
     * @returns {Promise<Array>} Saved encounters
     */
    async getSavedEncounters() {
        await this._loadSavedEncounters();
        return [...this.savedEncounters];
    }

    /**
     * Load saved encounters from storage
     * @private
     */
    async _loadSavedEncounters() {
        try {
            const encounters = await this.storage.getAll('encounters');
            this.savedEncounters = encounters || [];
        } catch (error) {
            console.error('Error loading saved encounters:', error);
            this.savedEncounters = [];
        }
    }

    /**
     * Start the current encounter
     * @returns {boolean} Success status
     */
    startCurrentEncounter() {
        if (!this.currentEncounter) {
            console.warn('No current encounter to start');
            return false;
        }
        
        // Prepare combatants
        const combatants = [];
        
        // Add monsters
        this.currentEncounter.monsters.forEach(monster => {
            // Clone monster to avoid modifying the original
            const monsterCombatant = { ...monster };
            
            // Set default values if not present
            monsterCombatant.type = 'monster';
            monsterCombatant.hp = monsterCombatant.hp || monsterCombatant.maxHp || 0;
            
            combatants.push(monsterCombatant);
        });
        
        // Add players
        this.currentEncounter.players.forEach(player => {
            // Clone player to avoid modifying the original
            const playerCombatant = { ...player };
            
            // Set default values if not present
            playerCombatant.type = 'pc';
            playerCombatant.hp = playerCombatant.hp || playerCombatant.maxHp || 0;
            
            combatants.push(playerCombatant);
        });
        
        // Start combat
        return this.combat.startCombat(combatants);
    }

    /**
     * Calculate encounter difficulty
     * @param {Array} monsters - Array of monsters
     * @param {Array} players - Array of players
     * @returns {Object} Encounter difficulty
     */
    calculateDifficulty(monsters, players) {
        // Calculate player thresholds
        const partyThresholds = {
            easy: 0,
            medium: 0,
            hard: 0,
            deadly: 0
        };
        
        players.forEach(player => {
            const level = player.level || 1;
            const thresholds = this.xpThresholds[level] || this.xpThresholds[1];
            
            partyThresholds.easy += thresholds.easy;
            partyThresholds.medium += thresholds.medium;
            partyThresholds.hard += thresholds.hard;
            partyThresholds.deadly += thresholds.deadly;
        });
        
        // Calculate monster XP
        let totalMonsterXP = 0;
        let monsterCount = 0;
        
        monsters.forEach(monster => {
            const xp = monster.xp || this._estimateMonsterXP(monster);
            const count = monster.count || 1;
            
            totalMonsterXP += xp * count;
            monsterCount += count;
        });
        
        // Apply XP multiplier based on number of monsters
        const multiplier = this._getXPMultiplier(monsterCount);
        const adjustedXP = totalMonsterXP * multiplier;
        
        // Determine difficulty
        let difficulty = 'trivial';
        if (adjustedXP >= partyThresholds.deadly) {
            difficulty = 'deadly';
        } else if (adjustedXP >= partyThresholds.hard) {
            difficulty = 'hard';
        } else if (adjustedXP >= partyThresholds.medium) {
            difficulty = 'medium';
        } else if (adjustedXP >= partyThresholds.easy) {
            difficulty = 'easy';
        }
        
        // Calculate XP per player
        const xpPerPlayer = players.length > 0 ? Math.floor(totalMonsterXP / players.length) : 0;
        
        return {
            difficulty,
            totalXP: totalMonsterXP,
            adjustedXP,
            xpPerPlayer,
            thresholds: partyThresholds,
            multiplier
        };
    }

    /**
     * Get XP multiplier based on number of monsters
     * @private
     * @param {number} monsterCount - Number of monsters
     * @returns {number} XP multiplier
     */
    _getXPMultiplier(monsterCount) {
        // Find the appropriate multiplier
        for (let i = this.xpMultipliers.length - 1; i >= 0; i--) {
            if (monsterCount >= this.xpMultipliers[i].count) {
                return this.xpMultipliers[i].multiplier;
            }
        }
        
        return 1; // Default multiplier
    }

    /**
     * Estimate monster XP based on CR
     * @private
     * @param {Object} monster - Monster object
     * @returns {number} Estimated XP
     */
    _estimateMonsterXP(monster) {
        // Use XP if provided
        if (monster.xp) {
            return monster.xp;
        }
        
        // Estimate XP based on CR
        const cr = monster.cr || '0';
        
        // CR to XP mapping
        const crToXP = {
            '0': 10,
            '1/8': 25,
            '1/4': 50,
            '1/2': 100,
            '1': 200,
            '2': 450,
            '3': 700,
            '4': 1100,
            '5': 1800,
            '6': 2300,
            '7': 2900,
            '8': 3900,
            '9': 5000,
            '10': 5900,
            '11': 7200,
            '12': 8400,
            '13': 10000,
            '14': 11500,
            '15': 13000,
            '16': 15000,
            '17': 18000,
            '18': 20000,
            '19': 22000,
            '20': 25000,
            '21': 33000,
            '22': 41000,
            '23': 50000,
            '24': 62000,
            '25': 75000,
            '26': 90000,
            '27': 105000,
            '28': 120000,
            '29': 135000,
            '30': 155000
        };
        
        return crToXP[cr] || 10;
    }

    /**
     * Add a monster to the current encounter
     * @param {Object} monster - Monster object
     * @returns {Object|null} Updated encounter or null if no current encounter
     */
    addMonster(monster) {
        if (!this.currentEncounter) {
            console.warn('No current encounter');
            return null;
        }
        
        // Clone monster to avoid modifying the original
        const monsterCopy = { ...monster };
        
        // Add to encounter
        this.currentEncounter.monsters.push(monsterCopy);
        
        // Update difficulty
        this.currentEncounter.difficulty = this.calculateDifficulty(
            this.currentEncounter.monsters,
            this.currentEncounter.players
        );
        
        // Update modified timestamp
        this.currentEncounter.modified = Date.now();
        
        return this.currentEncounter;
    }

    /**
     * Add a player to the current encounter
     * @param {Object} player - Player object
     * @returns {Object|null} Updated encounter or null if no current encounter
     */
    addPlayer(player) {
        if (!this.currentEncounter) {
            console.warn('No current encounter');
            return null;
        }
        
        // Clone player to avoid modifying the original
        const playerCopy = { ...player };
        
        // Add to encounter
        this.currentEncounter.players.push(playerCopy);
        
        // Update difficulty
        this.currentEncounter.difficulty = this.calculateDifficulty(
            this.currentEncounter.monsters,
            this.currentEncounter.players
        );
        
        // Update modified timestamp
        this.currentEncounter.modified = Date.now();
        
        return this.currentEncounter;
    }

    /**
     * Remove a monster from the current encounter
     * @param {string} monsterId - Monster ID
     * @returns {Object|null} Updated encounter or null if no current encounter
     */
    removeMonster(monsterId) {
        if (!this.currentEncounter) {
            console.warn('No current encounter');
            return null;
        }
        
        // Find monster index
        const index = this.currentEncounter.monsters.findIndex(m => m.id === monsterId);
        if (index === -1) {
            console.warn(`Monster not found: ${monsterId}`);
            return this.currentEncounter;
        }
        
        // Remove monster
        this.currentEncounter.monsters.splice(index, 1);
        
        // Update difficulty
        this.currentEncounter.difficulty = this.calculateDifficulty(
            this.currentEncounter.monsters,
            this.currentEncounter.players
        );
        
        // Update modified timestamp
        this.currentEncounter.modified = Date.now();
        
        return this.currentEncounter;
    }

    /**
     * Remove a player from the current encounter
     * @param {string} playerId - Player ID
     * @returns {Object|null} Updated encounter or null if no current encounter
     */
    removePlayer(playerId) {
        if (!this.currentEncounter) {
            console.warn('No current encounter');
            return null;
        }
        
        // Find player index
        const index = this.currentEncounter.players.findIndex(p => p.id === playerId);
        if (index === -1) {
            console.warn(`Player not found: ${playerId}`);
            return this.currentEncounter;
        }
        
        // Remove player
        this.currentEncounter.players.splice(index, 1);
        
        // Update difficulty
        this.currentEncounter.difficulty = this.calculateDifficulty(
            this.currentEncounter.monsters,
            this.currentEncounter.players
        );
        
        // Update modified timestamp
        this.currentEncounter.modified = Date.now();
        
        return this.currentEncounter;
    }

    /**
     * Update the current encounter
     * @param {Object} updates - Updates to apply
     * @returns {Object|null} Updated encounter or null if no current encounter
     */
    updateCurrentEncounter(updates) {
        if (!this.currentEncounter) {
            console.warn('No current encounter');
            return null;
        }
        
        // Apply updates
        this.currentEncounter = {
            ...this.currentEncounter,
            ...updates,
            modified: Date.now()
        };
        
        // Recalculate difficulty if monsters or players were updated
        if (updates.monsters || updates.players) {
            this.currentEncounter.difficulty = this.calculateDifficulty(
                this.currentEncounter.monsters,
                this.currentEncounter.players
            );
        }
        
        return this.currentEncounter;
    }

    /**
     * Duplicate an encounter
     * @param {string} encounterId - Encounter ID
     * @returns {Promise<Object|null>} Duplicated encounter or null if not found
     */
    async duplicateEncounter(encounterId) {
        // Load the encounter
        const encounter = await this.storage.load('encounters', encounterId);
        if (!encounter) {
            console.warn(`Encounter not found: ${encounterId}`);
            return null;
        }
        
        // Create a new encounter based on the loaded one
        const newEncounter = {
            ...encounter,
            id: `encounter-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            name: `${encounter.name} (Copy)`,
            created: Date.now(),
            modified: Date.now()
        };
        
        // Save the new encounter
        await this.storage.save('encounters', newEncounter);
        
        // Add to saved encounters list
        this.savedEncounters.push(newEncounter);
        
        // Set as current encounter
        this.currentEncounter = newEncounter;
        
        return newEncounter;
    }

    /**
     * Generate a random encounter
     * @param {Object} options - Generation options
     * @param {string} options.difficulty - Target difficulty (easy, medium, hard, deadly)
     * @param {Array} options.players - Array of players
     * @param {Array} options.monsterPool - Pool of monsters to choose from
     * @param {string} options.environment - Environment type
     * @param {number} options.minMonsters - Minimum number of monsters
     * @param {number} options.maxMonsters - Maximum number of monsters
     * @returns {Object} Generated encounter
     */
    generateRandomEncounter(options) {
        const {
            difficulty = 'medium',
            players = [],
            monsterPool = [],
            environment = '',
            minMonsters = 1,
            maxMonsters = 6
        } = options;
        
        // Calculate target XP based on difficulty
        const partyThresholds = {
            easy: 0,
            medium: 0,
            hard: 0,
            deadly: 0
        };
        
        players.forEach(player => {
            const level = player.level || 1;
            const thresholds = this.xpThresholds[level] || this.xpThresholds[1];
            
            partyThresholds.easy += thresholds.easy;
            partyThresholds.medium += thresholds.medium;
            partyThresholds.hard += thresholds.hard;
            partyThresholds.deadly += thresholds.deadly;
        });
        
        let targetXP = partyThresholds[difficulty] || partyThresholds.medium;
        
        // Filter monster pool by environment if specified
        let availableMonsters = [...monsterPool];
        if (environment && environment !== 'any') {
            availableMonsters = availableMonsters.filter(monster => 
                monster.environment && monster.environment.includes(environment)
            );
            
            // If no monsters match the environment, use the full pool
            if (availableMonsters.length === 0) {
                availableMonsters = [...monsterPool];
            }
        }
        
        // Sort monsters by XP (ascending)
        availableMonsters.sort((a, b) => {
            const aXP = a.xp || this._estimateMonsterXP(a);
            const bXP = b.xp || this._estimateMonsterXP(b);
            return aXP - bXP;
        });
        
        // Generate encounter
        const selectedMonsters = [];
        let currentXP = 0;
        let attempts = 0;
        const maxAttempts = 100;
        
        while (currentXP < targetXP && selectedMonsters.length < maxMonsters && attempts < maxAttempts) {
            attempts++;
            
            // Find monsters that don't exceed the target XP
            const suitableMonsters = availableMonsters.filter(monster => {
                const xp = monster.xp || this._estimateMonsterXP(monster);
                return currentXP + xp <= targetXP * 1.2; // Allow up to 20% over target
            });
            
            if (suitableMonsters.length === 0) {
                // No suitable monsters found, try to add the lowest XP monster
                if (availableMonsters.length > 0 && selectedMonsters.length < minMonsters) {
                    const lowestXPMonster = availableMonsters[0];
                    selectedMonsters.push({ ...lowestXPMonster, count: 1 });
                    currentXP += lowestXPMonster.xp || this._estimateMonsterXP(lowestXPMonster);
                }
                break;
            }
            
            // Select a random monster from suitable ones
            const randomIndex = Math.floor(Math.random() * suitableMonsters.length);
            const selectedMonster = suitableMonsters[randomIndex];
            
            // Check if this monster is already in the encounter
            const existingIndex = selectedMonsters.findIndex(m => m.id === selectedMonster.id);
            if (existingIndex !== -1) {
                // Increment count
                selectedMonsters[existingIndex].count = (selectedMonsters[existingIndex].count || 1) + 1;
            } else {
                // Add new monster
                selectedMonsters.push({ ...selectedMonster, count: 1 });
            }
            
            // Update current XP
            currentXP += selectedMonster.xp || this._estimateMonsterXP(selectedMonster);
        }
        
        // Ensure minimum number of monsters
        while (selectedMonsters.length < minMonsters && availableMonsters.length > 0) {
            const lowestXPMonster = availableMonsters[0];
            selectedMonsters.push({ ...lowestXPMonster, count: 1 });
        }
        
        // Expand monsters by count
        const expandedMonsters = [];
        selectedMonsters.forEach(monster => {
            const count = monster.count || 1;
            for (let i = 0; i < count; i++) {
                // Create a copy without the count property
                const { count: _, ...monsterCopy } = monster;
                
                // Add a number suffix to name for multiple monsters
                if (count > 1) {
                    monsterCopy.name = `${monsterCopy.name} ${i + 1}`;
                    monsterCopy.id = `${monsterCopy.id}-${i + 1}`;
                }
                
                expandedMonsters.push(monsterCopy);
            }
        });
        
        // Create encounter
        const encounter = this.createEncounter(
            `Random ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Encounter`,
            expandedMonsters,
            players
        );
        
        // Add environment
        if (environment) {
            encounter.environment = environment;
        }
        
        return encounter;
    }

    /**
     * Get encounter difficulty description
     * @param {Object} difficulty - Difficulty object
     * @returns {string} Difficulty description
     */
    getDifficultyDescription(difficulty) {
        if (!difficulty) return 'Unknown';
        
        const { totalXP, adjustedXP, thresholds } = difficulty;
        
        if (adjustedXP >= thresholds.deadly) {
            return 'Deadly';
        } else if (adjustedXP >= thresholds.hard) {
            return 'Hard';
        } else if (adjustedXP >= thresholds.medium) {
            return 'Medium';
        } else if (adjustedXP >= thresholds.easy) {
            return 'Easy';
        } else {
            return 'Trivial';
        }
    }

    /**
     * Format XP value
     * @param {number} xp - XP value
     * @returns {string} Formatted XP
     */
    formatXP(xp) {
        return xp.toLocaleString();
    }

    /**
     * Get the current encounter
     * @returns {Object|null} Current encounter or null if none
     */
    getCurrentEncounter() {
        return this.currentEncounter;
    }

    /**
     * Clear the current encounter
     */
    clearCurrentEncounter() {
        this.currentEncounter = null;
    }

    /**
     * Search saved encounters
     * @param {string} query - Search query
     * @returns {Array} Matching encounters
     */
    searchEncounters(query) {
        if (!query) return this.savedEncounters;
        
        const lowerQuery = query.toLowerCase();
        
        return this.savedEncounters.filter(encounter => 
            encounter.name.toLowerCase().includes(lowerQuery) ||
            encounter.description.toLowerCase().includes(lowerQuery) ||
            encounter.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
            encounter.environment.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Filter encounters by tag
     * @param {string} tag - Tag to filter by
     * @returns {Array} Matching encounters
     */
    filterEncountersByTag(tag) {
        if (!tag) return this.savedEncounters;
        
        return this.savedEncounters.filter(encounter => 
            encounter.tags && encounter.tags.includes(tag)
        );
    }

    /**
     * Filter encounters by environment
     * @param {string} environment - Environment to filter by
     * @returns {Array} Matching encounters
     */
    filterEncountersByEnvironment(environment) {
        if (!environment) return this.savedEncounters;
        
        return this.savedEncounters.filter(encounter => 
            encounter.environment === environment
        );
    }

    /**
     * Get all unique tags from saved encounters
     * @returns {Array} Unique tags
     */
    getAllTags() {
        const tags = new Set();
        
        this.savedEncounters.forEach(encounter => {
            if (encounter.tags && Array.isArray(encounter.tags)) {
                encounter.tags.forEach(tag => tags.add(tag));
            }
        });
        
        return Array.from(tags).sort();
    }

    /**
     * Get all unique environments from saved encounters
     * @returns {Array} Unique environments
     */
    getAllEnvironments() {
        const environments = new Set();
        
        this.savedEncounters.forEach(encounter => {
            if (encounter.environment) {
                environments.add(encounter.environment);
            }
        });
        
        return Array.from(environments).sort();
    }

    /**
     * Add a tag to the current encounter
     * @param {string} tag - Tag to add
     * @returns {Object|null} Updated encounter or null if no current encounter
     */
    addTag(tag) {
        if (!this.currentEncounter) {
            console.warn('No current encounter');
            return null;
        }
        
        // Initialize tags array if it doesn't exist
        if (!this.currentEncounter.tags) {
            this.currentEncounter.tags = [];
        }
        
        // Add tag if it doesn't already exist
        if (!this.currentEncounter.tags.includes(tag)) {
            this.currentEncounter.tags.push(tag);
            this.currentEncounter.modified = Date.now();
        }
        
        return this.currentEncounter;
    }

    /**
     * Remove a tag from the current encounter
     * @param {string} tag - Tag to remove
     * @returns {Object|null} Updated encounter or null if no current encounter
     */
    removeTag(tag) {
        if (!this.currentEncounter || !this.currentEncounter.tags) {
            return this.currentEncounter;
        }
        
        // Remove tag
        this.currentEncounter.tags = this.currentEncounter.tags.filter(t => t !== tag);
        this.currentEncounter.modified = Date.now();
        
        return this.currentEncounter;
    }

    /**
     * Set the environment for the current encounter
     * @param {string} environment - Environment
     * @returns {Object|null} Updated encounter or null if no current encounter
     */
    setEnvironment(environment) {
        if (!this.currentEncounter) {
            console.warn('No current encounter');
            return null;
        }
        
        this.currentEncounter.environment = environment;
        this.currentEncounter.modified = Date.now();
        
        return this.currentEncounter;
    }

    /**
     * Set notes for the current encounter
     * @param {string} notes - Notes
     * @returns {Object|null} Updated encounter or null if no current encounter
     */
    setNotes(notes) {
        if (!this.currentEncounter) {
            console.warn('No current encounter');
            return null;
        }
        
        this.currentEncounter.notes = notes;
        this.currentEncounter.modified = Date.now();
        
        return this.currentEncounter;
    }

    /**
     * Get standard environments
     * @returns {Array} Standard environments
     */
    getStandardEnvironments() {
        return [
            'Arctic',
            'Coastal',
            'Desert',
            'Forest',
            'Grassland',
            'Hill',
            'Mountain',
            'Swamp',
            'Underdark',
            'Underwater',
            'Urban',
            'Dungeon',
            'Planar'
        ];
    }

    /**
     * Balance an encounter to a target difficulty
     * @param {Object} encounter - Encounter to balance
     * @param {string} targetDifficulty - Target difficulty (easy, medium, hard, deadly)
     * @returns {Object} Balanced encounter
     */
        balanceEncounter(encounter, targetDifficulty) {
        // Clone encounter to avoid modifying the original
        const balancedEncounter = JSON.parse(JSON.stringify(encounter));
        
        // Calculate target XP based on difficulty
        const partyThresholds = {
            easy: 0,
            medium: 0,
            hard: 0,
            deadly: 0
        };
        
        balancedEncounter.players.forEach(player => {
            const level = player.level || 1;
            const thresholds = this.xpThresholds[level] || this.xpThresholds[1];
            
            partyThresholds.easy += thresholds.easy;
            partyThresholds.medium += thresholds.medium;
            partyThresholds.hard += thresholds.hard;
            partyThresholds.deadly += thresholds.deadly;
        });
        
        const targetXP = partyThresholds[targetDifficulty] || partyThresholds.medium;
        
        // Calculate current XP
        let currentXP = 0;
        balancedEncounter.monsters.forEach(monster => {
            currentXP += monster.xp || this._estimateMonsterXP(monster);
        });
        
        // Calculate XP multiplier based on number of monsters
        const multiplier = this._getXPMultiplier(balancedEncounter.monsters.length);
        const adjustedXP = currentXP * multiplier;
        
        // Check if encounter is already balanced
        if (adjustedXP >= targetXP * 0.9 && adjustedXP <= targetXP * 1.1) {
            // Already within 10% of target, no changes needed
            return balancedEncounter;
        }
        
        // Adjust monster count
        if (adjustedXP < targetXP) {
            // Need to add monsters
            this._addMonstersToBalance(balancedEncounter, targetXP);
        } else {
            // Need to remove monsters
            this._removeMonstersToBalance(balancedEncounter, targetXP);
        }
        
        // Recalculate difficulty
        balancedEncounter.difficulty = this.calculateDifficulty(
            balancedEncounter.monsters,
            balancedEncounter.players
        );
        
        return balancedEncounter;
    }

    /**
     * Add monsters to balance an encounter
     * @private
     * @param {Object} encounter - Encounter to modify
     * @param {number} targetXP - Target XP
     */
    _addMonstersToBalance(encounter, targetXP) {
        // Group monsters by type
        const monsterTypes = {};
        
        encounter.monsters.forEach(monster => {
            const baseType = monster.name.replace(/\s+\d+$/, ''); // Remove trailing numbers
            
            if (!monsterTypes[baseType]) {
                monsterTypes[baseType] = {
                    template: { ...monster },
                    count: 0
                };
            }
            
            monsterTypes[baseType].count++;
        });
        
        // Calculate current XP
        let currentXP = 0;
        encounter.monsters.forEach(monster => {
            currentXP += monster.xp || this._estimateMonsterXP(monster);
        });
        
        // Add monsters until we reach the target XP
        let currentMonsterCount = encounter.monsters.length;
        let attempts = 0;
        const maxAttempts = 20;
        
        while (currentXP < targetXP && attempts < maxAttempts) {
            attempts++;
            
            // Choose a random monster type to add
            const monsterTypeKeys = Object.keys(monsterTypes);
            const randomTypeKey = monsterTypeKeys[Math.floor(Math.random() * monsterTypeKeys.length)];
            const monsterType = monsterTypes[randomTypeKey];
            
            // Create a new monster based on the template
            const newMonster = { ...monsterType.template };
            newMonster.name = `${randomTypeKey} ${monsterType.count + 1}`;
            newMonster.id = `${newMonster.id.split('-')[0]}-${Date.now()}-${monsterType.count + 1}`;
            
            // Add monster to encounter
            encounter.monsters.push(newMonster);
            monsterType.count++;
            currentMonsterCount++;
            
            // Update XP
            const monsterXP = newMonster.xp || this._estimateMonsterXP(newMonster);
            currentXP += monsterXP;
            
            // Recalculate XP with new multiplier
            const multiplier = this._getXPMultiplier(currentMonsterCount);
            const adjustedXP = currentXP * multiplier;
            
            // Check if we've reached the target
            if (adjustedXP >= targetXP) {
                break;
            }
        }
    }

    /**
     * Remove monsters to balance an encounter
     * @private
     * @param {Object} encounter - Encounter to modify
     * @param {number} targetXP - Target XP
     */
    _removeMonstersToBalance(encounter, targetXP) {
        // Calculate current XP
        let currentXP = 0;
        encounter.monsters.forEach(monster => {
            currentXP += monster.xp || this._estimateMonsterXP(monster);
        });
        
        // Sort monsters by XP (descending)
        encounter.monsters.sort((a, b) => {
            const aXP = a.xp || this._estimateMonsterXP(a);
            const bXP = b.xp || this._estimateMonsterXP(b);
            return bXP - aXP;
        });
        
        // Remove monsters until we reach the target XP
        let currentMonsterCount = encounter.monsters.length;
        let attempts = 0;
        const maxAttempts = 20;
        
        while (currentXP > targetXP * 1.1 && attempts < maxAttempts && currentMonsterCount > 1) {
            attempts++;
            
            // Remove the highest XP monster
            const removedMonster = encounter.monsters.pop();
            currentMonsterCount--;
            
            // Update XP
            const monsterXP = removedMonster.xp || this._estimateMonsterXP(removedMonster);
            currentXP -= monsterXP;
            
            // Recalculate XP with new multiplier
            const multiplier = this._getXPMultiplier(currentMonsterCount);
            const adjustedXP = currentXP * multiplier;
            
            // Check if we've reached the target
            if (adjustedXP <= targetXP * 1.1) {
                break;
            }
        }
    }

    /**
     * Export an encounter to JSON
     * @param {string} encounterId - Encounter ID
     * @returns {Promise<string>} JSON string
     */
    async exportEncounter(encounterId) {
        try {
            const encounter = await this.storage.load('encounters', encounterId);
            if (!encounter) {
                console.warn(`Encounter not found: ${encounterId}`);
                return null;
            }
            
            return JSON.stringify(encounter, null, 2);
        } catch (error) {
            console.error('Error exporting encounter:', error);
            return null;
        }
    }

    /**
     * Import an encounter from JSON
     * @param {string} json - JSON string
     * @returns {Promise<Object|null>} Imported encounter or null if failed
     */
    async importEncounter(json) {
        try {
            const encounter = JSON.parse(json);
            
            // Validate encounter structure
            if (!encounter.name || !Array.isArray(encounter.monsters) || !Array.isArray(encounter.players)) {
                console.warn('Invalid encounter format');
                return null;
            }
            
            // Generate new ID to avoid conflicts
            encounter.id = `encounter-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            encounter.imported = true;
            encounter.created = Date.now();
            encounter.modified = Date.now();
            
            // Save encounter
            await this.storage.save('encounters', encounter);
            
            // Add to saved encounters list
            this.savedEncounters.push(encounter);
            
            // Set as current encounter
            this.currentEncounter = encounter;
            
            return encounter;
        } catch (error) {
            console.error('Error importing encounter:', error);
            return null;
        }
    }

    /**
     * Get daily XP budget for a party
     * @param {Array} players - Array of players
     * @returns {Object} Daily XP budget
     */
    getDailyXPBudget(players) {
        // XP budget by level (adjusted for 6-8 encounters per day)
        const dailyXPByLevel = {
            1: 300,
            2: 600,
            3: 1200,
            4: 1700,
            5: 3500,
            6: 4000,
            7: 5000,
            8: 6000,
            9: 7500,
            10: 9000,
            11: 10500,
            12: 11500,
            13: 13500,
            14: 15000,
            15: 18000,
            16: 20000,
            17: 25000,
            18: 27000,
            19: 30000,
            20: 40000
        };
        
        let totalBudget = 0;
        
        players.forEach(player => {
            const level = player.level || 1;
            totalBudget += dailyXPByLevel[level] || dailyXPByLevel[1];
        });
        
        // Calculate budgets for different encounter counts
        return {
            total: totalBudget,
            perDay: totalBudget,
            perEncounter: {
                easy: Math.floor(totalBudget / 8), // 8 easy encounters
                medium: Math.floor(totalBudget / 6), // 6 medium encounters
                hard: Math.floor(totalBudget / 4), // 4 hard encounters
                deadly: Math.floor(totalBudget / 3) // 3 deadly encounters
            }
        };
    }

    /**
     * Create an encounter from combat
     * @returns {Object|null} Created encounter or null if no active combat
     */
    createEncounterFromCombat() {
        if (!this.combat.isActive()) {
            console.warn('No active combat');
            return null;
        }
        
        // Get combatants
        const combatants = this.combat.getAllCombatants();
        
        // Separate into monsters and players
        const monsters = combatants.filter(c => c.type === 'monster');
        const players = combatants.filter(c => c.type === 'pc');
        
        // Create encounter
        return this.createEncounter(
            `Encounter from Combat ${new Date().toLocaleDateString()}`,
            monsters,
            players
        );
    }

    /**
     * Get recommended number of monsters based on party size
     * @param {number} partySize - Number of players
     * @param {string} difficulty - Target difficulty
     * @returns {Object} Recommended monster counts
     */
    getRecommendedMonsterCount(partySize, difficulty = 'medium') {
        // Base recommendations
        const baseRecommendations = {
            easy: { min: 1, max: Math.ceil(partySize / 2) },
            medium: { min: 1, max: partySize },
            hard: { min: Math.ceil(partySize / 2), max: partySize + 2 },
            deadly: { min: partySize, max: partySize * 2 }
        };
        
        // Get recommendation for specified difficulty
        const recommendation = baseRecommendations[difficulty] || baseRecommendations.medium;
        
        // Adjust for very small or large parties
        if (partySize <= 2) {
            recommendation.max = Math.max(1, recommendation.max - 1);
        } else if (partySize >= 6) {
            recommendation.max += Math.floor((partySize - 5) / 2);
        }
        
        return recommendation;
    }

    /**
     * Get encounter difficulty color
     * @param {string} difficulty - Difficulty level
     * @returns {string} CSS color
     */
    getDifficultyColor(difficulty) {
        const colors = {
            trivial: '#808080', // Gray
            easy: '#008000',    // Green
            medium: '#FFA500',  // Orange
            hard: '#FF4500',    // OrangeRed
            deadly: '#FF0000'   // Red
        };
        
        return colors[difficulty] || colors.medium;
    }
}

// Export the Encounter class
export default Encounter;
