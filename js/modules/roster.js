/**
 * Roster module for Jesster's Combat Tracker
 * Handles player character and monster roster management
 */
class Roster {
    constructor(storage, dice) {
        // Store references to other modules
        this.storage = storage;
        this.dice = dice;
        
        // Roster data
        this.players = [];
        this.monsters = [];
        this.monsterTemplates = [];
        this.parties = [];
        
        // Load roster data
        this._loadRoster();
        
        console.log("Roster module initialized");
    }

    /**
     * Load roster data from storage
     * @private
     */
    async _loadRoster() {
        try {
            // Load players
            const players = await this.storage.load('players', { useLocalStorage: true });
            if (players && Array.isArray(players)) {
                this.players = players;
            }
            
            // Load monsters
            const monsters = await this.storage.load('monsters', { useLocalStorage: true });
            if (monsters && Array.isArray(monsters)) {
                this.monsters = monsters;
            }
            
            // Load monster templates
            const monsterTemplates = await this.storage.load('monsterTemplates', { useLocalStorage: true });
            if (monsterTemplates && Array.isArray(monsterTemplates)) {
                this.monsterTemplates = monsterTemplates;
            }
            
            // Load parties
            const parties = await this.storage.load('parties', { useLocalStorage: true });
            if (parties && Array.isArray(parties)) {
                this.parties = parties;
            }
        } catch (error) {
            console.error('Error loading roster:', error);
        }
    }

    /**
     * Save roster data to storage
     * @private
     */
    async _saveRoster() {
        try {
            // Save players
            await this.storage.save('players', this.players, { useLocalStorage: true });
            
            // Save monsters
            await this.storage.save('monsters', this.monsters, { useLocalStorage: true });
            
            // Save monster templates
            await this.storage.save('monsterTemplates', this.monsterTemplates, { useLocalStorage: true });
            
            // Save parties
            await this.storage.save('parties', this.parties, { useLocalStorage: true });
        } catch (error) {
            console.error('Error saving roster:', error);
        }
    }

    /**
     * Get all players
     * @returns {Array} Players
     */
    getPlayers() {
        return [...this.players];
    }

    /**
     * Get a player by ID
     * @param {string} playerId - Player ID
     * @returns {Object|null} Player or null if not found
     */
    getPlayer(playerId) {
        return this.players.find(player => player.id === playerId) || null;
    }

    /**
     * Add a player
     * @param {Object} player - Player data
     * @returns {Promise<Object>} Added player
     */
    async addPlayer(player) {
        // Generate ID if not provided
        if (!player.id) {
            player.id = `player-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        }
        
        // Set default values
        player.type = 'pc';
        player.hp = player.hp !== undefined ? player.hp : player.maxHp || 0;
        player.tempHp = player.tempHp || 0;
        player.conditions = player.conditions || [];
        player.initiativeModifier = player.initiativeModifier !== undefined ? 
            player.initiativeModifier : 
            this._calculateInitiativeModifier(player);
        
        // Add to players array
        this.players.push(player);
        
        // Save roster
        await this._saveRoster();
        
        return player;
    }

    /**
     * Update a player
     * @param {string} playerId - Player ID
     * @param {Object} updates - Updates to apply
     * @returns {Promise<Object|null>} Updated player or null if not found
     */
    async updatePlayer(playerId, updates) {
        // Find player
        const index = this.players.findIndex(player => player.id === playerId);
        if (index === -1) {
            console.warn(`Player not found: ${playerId}`);
            return null;
        }
        
        // Update player
        this.players[index] = { ...this.players[index], ...updates };
        
        // Save roster
        await this._saveRoster();
        
        return this.players[index];
    }

    /**
     * Remove a player
     * @param {string} playerId - Player ID
     * @returns {Promise<boolean>} Success status
     */
    async removePlayer(playerId) {
        // Find player
        const index = this.players.findIndex(player => player.id === playerId);
        if (index === -1) {
            console.warn(`Player not found: ${playerId}`);
            return false;
        }
        
        // Remove player
        this.players.splice(index, 1);
        
        // Save roster
        await this._saveRoster();
        
        return true;
    }

    /**
     * Get all monsters
     * @returns {Array} Monsters
     */
    getMonsters() {
        return [...this.monsters];
    }

    /**
     * Get a monster by ID
     * @param {string} monsterId - Monster ID
     * @returns {Object|null} Monster or null if not found
     */
    getMonster(monsterId) {
        return this.monsters.find(monster => monster.id === monsterId) || null;
    }

    /**
     * Add a monster
     * @param {Object} monster - Monster data
     * @returns {Promise<Object>} Added monster
     */
    async addMonster(monster) {
        // Generate ID if not provided
        if (!monster.id) {
            monster.id = `monster-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        }
        
        // Set default values
        monster.type = 'monster';
        monster.hp = monster.hp !== undefined ? monster.hp : monster.maxHp || 0;
        monster.tempHp = monster.tempHp || 0;
        monster.conditions = monster.conditions || [];
        monster.initiativeModifier = monster.initiativeModifier !== undefined ? 
            monster.initiativeModifier : 
            this._calculateInitiativeModifier(monster);
        
        // Add to monsters array
        this.monsters.push(monster);
        
        // Save roster
        await this._saveRoster();
        
        return monster;
    }

    /**
     * Update a monster
     * @param {string} monsterId - Monster ID
     * @param {Object} updates - Updates to apply
     * @returns {Promise<Object|null>} Updated monster or null if not found
     */
    async updateMonster(monsterId, updates) {
        // Find monster
        const index = this.monsters.findIndex(monster => monster.id === monsterId);
        if (index === -1) {
            console.warn(`Monster not found: ${monsterId}`);
            return null;
        }
        
        // Update monster
        this.monsters[index] = { ...this.monsters[index], ...updates };
        
        // Save roster
        await this._saveRoster();
        
        return this.monsters[index];
    }

    /**
     * Remove a monster
     * @param {string} monsterId - Monster ID
     * @returns {Promise<boolean>} Success status
     */
    async removeMonster(monsterId) {
        // Find monster
        const index = this.monsters.findIndex(monster => monster.id === monsterId);
        if (index === -1) {
            console.warn(`Monster not found: ${monsterId}`);
            return false;
        }
        
        // Remove monster
        this.monsters.splice(index, 1);
        
        // Save roster
        await this._saveRoster();
        
        return true;
    }

    /**
     * Get all monster templates
     * @returns {Array} Monster templates
     */
    getMonsterTemplates() {
        return [...this.monsterTemplates];
    }

    /**
     * Get a monster template by ID
     * @param {string} templateId - Template ID
     * @returns {Object|null} Monster template or null if not found
     */
    getMonsterTemplate(templateId) {
        return this.monsterTemplates.find(template => template.id === templateId) || null;
    }

    /**
     * Add a monster template
     * @param {Object} template - Monster template data
     * @returns {Promise<Object>} Added template
     */
    async addMonsterTemplate(template) {
        // Generate ID if not provided
        if (!template.id) {
            template.id = `template-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        }
        
        // Set default values
        template.type = 'monster';
        
        // Add to templates array
        this.monsterTemplates.push(template);
        
        // Save roster
        await this._saveRoster();
        
        return template;
    }

    /**
     * Update a monster template
     * @param {string} templateId - Template ID
     * @param {Object} updates - Updates to apply
     * @returns {Promise<Object|null>} Updated template or null if not found
     */
    async updateMonsterTemplate(templateId, updates) {
        // Find template
        const index = this.monsterTemplates.findIndex(template => template.id === templateId);
        if (index === -1) {
            console.warn(`Monster template not found: ${templateId}`);
            return null;
        }
        
        // Update template
        this.monsterTemplates[index] = { ...this.monsterTemplates[index], ...updates };
        
        // Save roster
        await this._saveRoster();
        
        return this.monsterTemplates[index];
    }

    /**
     * Remove a monster template
     * @param {string} templateId - Template ID
     * @returns {Promise<boolean>} Success status
     */
    async removeMonsterTemplate(templateId) {
        // Find template
        const index = this.monsterTemplates.findIndex(template => template.id === templateId);
        if (index === -1) {
            console.warn(`Monster template not found: ${templateId}`);
            return false;
        }
        
        // Remove template
        this.monsterTemplates.splice(index, 1);
        
        // Save roster
        await this._saveRoster();
        
        return true;
    }

    /**
     * Create a monster from a template
     * @param {string} templateId - Template ID
     * @param {Object} options - Creation options
     * @param {string} options.name - Custom name (optional)
     * @param {number} options.hp - Custom HP (optional)
     * @param {boolean} options.rollHP - Whether to roll HP
     * @returns {Promise<Object|null>} Created monster or null if template not found
     */
    async createMonsterFromTemplate(templateId, options = {}) {
        // Find template
        const template = this.getMonsterTemplate(templateId);
        if (!template) {
            console.warn(`Monster template not found: ${templateId}`);
            return null;
        }
        
        // Create monster from template
        const monster = { ...template };
        
        // Generate new ID
        monster.id = `monster-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        
        // Set name
        if (options.name) {
            monster.name = options.name;
        }
        
        // Set HP
        if (options.hp !== undefined) {
            monster.hp = options.hp;
            monster.maxHp = options.hp;
        } else if (options.rollHP && monster.hpFormula) {
            // Roll HP
            const hpRoll = await this.dice.roll(monster.hpFormula, { silent: true });
            monster.hp = hpRoll.total;
            monster.maxHp = hpRoll.total;
        }
        
        // Add to monsters array
        return this.addMonster(monster);
    }

    /**
     * Get all parties
     * @returns {Array} Parties
     */
    getParties() {
        return [...this.parties];
    }

    /**
     * Get a party by ID
     * @param {string} partyId - Party ID
     * @returns {Object|null} Party or null if not found
     */
    getParty(partyId) {
        return this.parties.find(party => party.id === partyId) || null;
    }

    /**
     * Create a party
     * @param {string} name - Party name
     * @param {Array} playerIds - Array of player IDs
     * @returns {Promise<Object>} Created party
     */
    async createParty(name, playerIds = []) {
        // Generate party ID
        const partyId = `party-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        
        // Create party object
        const party = {
            id: partyId,
            name: name || 'New Party',
            playerIds: [...playerIds],
            created: Date.now(),
            modified: Date.now()
        };
        
        // Add to parties array
        this.parties.push(party);
        
        // Save roster
        await this._saveRoster();
        
        return party;
    }

    /**
     * Update a party
     * @param {string} partyId - Party ID
     * @param {Object} updates - Updates to apply
     * @returns {Promise<Object|null>} Updated party or null if not found
     */
    async updateParty(partyId, updates) {
        // Find party
        const index = this.parties.findIndex(party => party.id === partyId);
        if (index === -1) {
            console.warn(`Party not found: ${partyId}`);
            return null;
        }
        
        // Update party
        this.parties[index] = { 
            ...this.parties[index], 
            ...updates,
            modified: Date.now()
        };
        
        // Save roster
        await this._saveRoster();
        
        return this.parties[index];
    }

    /**
     * Remove a party
     * @param {string} partyId - Party ID
     * @returns {Promise<boolean>} Success status
     */
    async removeParty(partyId) {
        // Find party
        const index = this.parties.findIndex(party => party.id === partyId);
        if (index === -1) {
            console.warn(`Party not found: ${partyId}`);
            return false;
        }
        
        // Remove party
        this.parties.splice(index, 1);
        
        // Save roster
        await this._saveRoster();
        
        return true;
    }

    /**
     * Add a player to a party
     * @param {string} partyId - Party ID
     * @param {string} playerId - Player ID
     * @returns {Promise<Object|null>} Updated party or null if not found
     */
    async addPlayerToParty(partyId, playerId) {
        // Find party
        const party = this.getParty(partyId);
        if (!party) {
            console.warn(`Party not found: ${partyId}`);
            return null;
        }
        
        // Check if player exists
        const player = this.getPlayer(playerId);
        if (!player) {
            console.warn(`Player not found: ${playerId}`);
            return null;
        }
        
        // Check if player is already in party
        if (party.playerIds.includes(playerId)) {
            return party;
        }
        
        // Add player to party
        party.playerIds.push(playerId);
        party.modified = Date.now();
        
        // Save roster
        await this._saveRoster();
        
        return party;
    }

    /**
     * Remove a player from a party
     * @param {string} partyId - Party ID
     * @param {string} playerId - Player ID
     * @returns {Promise<Object|null>} Updated party or null if not found
     */
    async removePlayerFromParty(partyId, playerId) {
        // Find party
        const party = this.getParty(partyId);
        if (!party) {
            console.warn(`Party not found: ${partyId}`);
            return null;
        }
        
        // Remove player from party
        party.playerIds = party.playerIds.filter(id => id !== playerId);
        party.modified = Date.now();
        
        // Save roster
        await this._saveRoster();
        
        return party;
    }

    /**
     * Get players in a party
     * @param {string} partyId - Party ID
     * @returns {Array} Players in party
     */
    getPartyPlayers(partyId) {
        // Find party
        const party = this.getParty(partyId);
        if (!party) {
            console.warn(`Party not found: ${partyId}`);
            return [];
        }
        
        // Get players
        return party.playerIds
            .map(playerId => this.getPlayer(playerId))
            .filter(player => player !== null);
    }

    /**
     * Calculate average party level
     * @param {string} partyId - Party ID
     * @returns {number} Average party level
     */
    calculateAveragePartyLevel(partyId) {
        const players = this.getPartyPlayers(partyId);
        if (players.length === 0) {
            return 1;
        }
        
        const totalLevel = players.reduce((sum, player) => sum + (player.level || 1), 0);
        return Math.round(totalLevel / players.length);
    }

    /**
     * Search monsters by name
     * @param {string} query - Search query
     * @returns {Array} Matching monsters
     */
    searchMonsters(query) {
        if (!query) return this.monsters;
        
        const lowerQuery = query.toLowerCase();
        
        return this.monsters.filter(monster => 
            monster.name.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Search monster templates by name
     * @param {string} query - Search query
     * @returns {Array} Matching templates
     */
    searchMonsterTemplates(query) {
        if (!query) return this.monsterTemplates;
        
        const lowerQuery = query.toLowerCase();
        
        return this.monsterTemplates.filter(template => 
            template.name.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Search players by name
     * @param {string} query - Search query
     * @returns {Array} Matching players
     */
    searchPlayers(query) {
        if (!query) return this.players;
        
        const lowerQuery = query.toLowerCase();
        
        return this.players.filter(player => 
            player.name.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Filter monsters by CR
     * @param {string|number} minCR - Minimum CR
     * @param {string|number} maxCR - Maximum CR
     * @returns {Array} Filtered monsters
     */
    filterMonstersByCR(minCR, maxCR) {
        // Convert CR to numeric value
        const convertCR = (cr) => {
            if (typeof cr === 'number') return cr;
            if (cr === '1/8') return 0.125;
            if (cr === '1/4') return 0.25;
            if (cr === '1/2') return 0.5;
            return parseFloat(cr) || 0;
        };
        
        const minValue = convertCR(minCR);
        const maxValue = convertCR(maxCR);
        
        return this.monsterTemplates.filter(monster => {
            const monsterCR = convertCR(monster.cr);
            return monsterCR >= minValue && monsterCR <= maxValue;
        });
    }

    /**
     * Filter monsters by type
     * @param {string} type - Monster type
     * @returns {Array} Filtered monsters
     */
    filterMonstersByType(type) {
        if (!type) return this.monsterTemplates;
        
        return this.monsterTemplates.filter(monster => 
            monster.type === type || monster.monsterType === type
        );
    }

    /**
     * Filter monsters by environment
     * @param {string} environment - Environment
     * @returns {Array} Filtered monsters
     */
    filterMonstersByEnvironment(environment) {
        if (!environment) return this.monsterTemplates;
        
        return this.monsterTemplates.filter(monster => 
            monster.environment && monster.environment.includes(environment)
        );
    }

    /**
     * Get all monster types
     * @returns {Array} Monster types
     */
    getMonsterTypes() {
        const types = new Set();
        
        this.monsterTemplates.forEach(monster => {
            if (monster.monsterType) {
                types.add(monster.monsterType);
            }
        });
        
        return Array.from(types).sort();
    }

    /**
     * Get all monster environments
     * @returns {Array} Monster environments
     */
    getMonsterEnvironments() {
        const environments = new Set();
        
        this.monsterTemplates.forEach(monster => {
            if (monster.environment && Array.isArray(monster.environment)) {
                monster.environment.forEach(env => environments.add(env));
            } else if (monster.environment && typeof monster.environment === 'string') {
                environments.add(monster.environment);
            }
        });
        
        return Array.from(environments).sort();
    }

    /**
     * Get all monster CRs
     * @returns {Array} Monster CRs
     */
    getMonsterCRs() {
        const crs = new Set();
        
        this.monsterTemplates.forEach(monster => {
            if (monster.cr) {
                crs.add(monster.cr.toString());
            }
        });
        
        // Sort CRs
        return Array.from(crs).sort((a, b) => {
            // Convert CR to numeric value for sorting
            const convertCR = (cr) => {
                if (cr === '1/8') return 0.125;
                if (cr === '1/4') return 0.25;
                if (cr === '1/2') return 0.5;
                return parseFloat(cr) || 0;
            };
            
            return convertCR(a) - convertCR(b);
        });
    }

    /**
     * Calculate initiative modifier from ability scores
     * @private
     * @param {Object} character - Character object
     * @returns {number} Initiative modifier
     */
    _calculateInitiativeModifier(character) {
        if (!character.abilities || !character.abilities.dex) {
            return 0;
        }
        
        // Base initiative modifier is DEX modifier
        let modifier = Math.floor((character.abilities.dex - 10) / 2);
        
        // Check for features that modify initiative
        if (character.features) {
            // Alert feat
            if (character.features.some(f => f.name === 'Alert')) {
                modifier += 5;
            }
            
            // Jack of All Trades (half proficiency to initiative)
            if (character.features.some(f => f.name === 'Jack of All Trades')) {
                const profBonus = this._getProficiencyBonus(character);
                modifier += Math.floor(profBonus / 2);
            }
        }
        
        return modifier;
    }

    /**
     * Get proficiency bonus based on level or CR
     * @private
     * @param {Object} character - Character object
     * @returns {number} Proficiency bonus
     */
    _getProficiencyBonus(character) {
        // Use explicit proficiency bonus if available
        if (character.proficiencyBonus !== undefined) {
            return character.proficiencyBonus;
        }
        
        // Calculate from level or CR
        if (character.type === 'pc' && character.level) {
            return Math.floor((character.level - 1) / 4) + 2;
        } else if (character.cr) {
            let cr = character.cr;
            
            // Convert string CR to number
            if (typeof cr === 'string') {
                if (cr === '1/8') cr = 0.125;
                else if (cr === '1/4') cr = 0.25;
                else if (cr === '1/2') cr = 0.5;
                else cr = parseFloat(cr);
            }
            
            return Math.max(2, Math.floor((cr - 1) / 4) + 2);
        }
        
        // Default
        return 2;
    }

    /**
     * Import monsters from JSON
     * @param {string} json - JSON string
     * @returns {Promise<Array>} Imported monsters
     */
    async importMonstersFromJSON(json) {
        try {
            const data = JSON.parse(json);
            let monsters = [];
            
            // Handle different JSON formats
            if (Array.isArray(data)) {
                monsters = data;
            } else if (data.monsters && Array.isArray(data.monsters)) {
                monsters = data.monsters;
            } else if (typeof data === 'object') {
                monsters = [data];
            }
            
            // Validate and add monsters
            const importedMonsters = [];
            
            for (const monster of monsters) {
                // Validate monster
                if (!monster.name) {
                    console.warn('Skipping monster without name');
                    continue;
                }
                
                // Generate new ID
                monster.id = `template-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
                
                // Add as template
                const importedMonster = await this.addMonsterTemplate(monster);
                importedMonsters.push(importedMonster);
            }
            
            return importedMonsters;
        } catch (error) {
            console.error('Error importing monsters:', error);
            return [];
        }
    }

    /**
     * Export monsters to JSON
     * @param {Array} monsterIds - Array of monster IDs
     * @returns {string} JSON string
     */
    exportMonstersToJSON(monsterIds) {
        // Get monsters
        const monsters = monsterIds.map(id => this.getMonsterTemplate(id)).filter(m => m !== null);
        
        // Create export object
        const exportData = {
            monsters: monsters.map(monster => {
                // Create a copy without the ID
                const { id, ...monsterData } = monster;
                return monsterData;
            })
        };
        
        return JSON.stringify(exportData, null, 2);
    }

    /**
     * Import players from JSON
     * @param {string} json - JSON string
     * @returns {Promise<Array>} Imported players
     */
    async importPlayersFromJSON(json) {
        try {
            const data = JSON.parse(json);
            let players = [];
            
            // Handle different JSON formats
            if (Array.isArray(data)) {
                players = data;
            } else if (data.players && Array.isArray(data.players)) {
                players = data.players;
            } else if (typeof data === 'object') {
                players = [data];
            }
            
            // Validate and add players
            const importedPlayers = [];
            
            for (const player of players) {
                // Validate player
                if (!player.name) {
                    console.warn('Skipping player without name');
                    continue;
                }
                
                // Generate new ID
                player.id = `player-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
                
                // Add player
                const importedPlayer = await this.addPlayer(player);
                importedPlayers.push(importedPlayer);
            }
            
            return importedPlayers;
        } catch (error) {
            console.error('Error importing players:', error);
            return [];
        }
    }

    /**
     * Export players to JSON
     * @param {Array} playerIds - Array of player IDs
     * @returns {string} JSON string
     */
    exportPlayersToJSON(playerIds) {
        // Get players
        const players = playerIds.map(id => this.getPlayer(id)).filter(p => p !== null);
        
        // Create export object
        const exportData = {
            players: players.map(player => {
                // Create a copy without the ID
                const { id, ...playerData } = player;
                return playerData;
            })
        };
        
        return JSON.stringify(exportData, null, 2);
    }

    /**
     * Create a default player
     * @param {string} name - Player name
     * @returns {Promise<Object>} Created player
     */
    async createDefaultPlayer(name) {
        const player = {
            name: name || 'New Player',
            type: 'pc',
            level: 1,
            race: 'Human',
            class: 'Fighter',
            maxHp: 10,
            hp: 10,
            ac: 10,
            abilities: {
                str: 10,
                dex: 10,
                con: 10,
                int: 10,
                wis: 10,
                cha: 10
            },
            initiativeModifier: 0
        };
        
        return await this.addPlayer(player);
    }

    /**
     * Create a default monster
     * @param {string} name - Monster name
     * @returns {Promise<Object>} Created monster
     */
    async createDefaultMonster(name) {
        const monster = {
            name: name || 'New Monster',
            type: 'monster',
            monsterType: 'Humanoid',
            cr: '1',
            maxHp: 10,
            hp: 10,
            ac: 10,
            abilities: {
                str: 10,
                dex: 10,
                con: 10,
                int: 10,
                wis: 10,
                cha: 10
            },
            initiativeModifier: 0
        };
        
        return await this.addMonsterTemplate(monster);
    }

    /**
     * Roll HP for a monster
     * @param {string} monsterId - Monster ID
     * @returns {Promise<Object|null>} Updated monster or null if not found
     */
    async rollMonsterHP(monsterId) {
        // Find monster
        const monster = this.getMonster(monsterId);
        if (!monster) {
            console.warn(`Monster not found: ${monsterId}`);
            return null;
        }
        
        // Check if monster has HP formula
        if (!monster.hpFormula) {
            console.warn(`Monster has no HP formula: ${monsterId}`);
            return monster;
        }
        
        // Roll HP
        const hpRoll = await this.dice.roll(monster.hpFormula, { silent: true });
        
        // Update monster
        return await this.updateMonster(monsterId, {
            hp: hpRoll.total,
            maxHp: hpRoll.total
        });
    }

    /**
     * Create multiple monsters from a template
     * @param {string} templateId - Template ID
     * @param {number} count - Number of monsters to create
     * @param {Object} options - Creation options
     * @returns {Promise<Array>} Created monsters
     */
       async createMultipleMonsters(templateId, count, options = {}) {
        const monsters = [];
        
        for (let i = 0; i < count; i++) {
            // Create monster name with number
            const customOptions = { ...options };
            if (!customOptions.name) {
                const template = this.getMonsterTemplate(templateId);
                if (template) {
                    customOptions.name = `${template.name} ${i + 1}`;
                }
            }
            
            // Create monster
            const monster = await this.createMonsterFromTemplate(templateId, customOptions);
            if (monster) {
                monsters.push(monster);
            }
        }
        
        return monsters;
    }

    /**
     * Clone a player
     * @param {string} playerId - Player ID
     * @param {string} newName - New player name
     * @returns {Promise<Object|null>} Cloned player or null if not found
     */
    async clonePlayer(playerId, newName = null) {
        // Find player
        const player = this.getPlayer(playerId);
        if (!player) {
            console.warn(`Player not found: ${playerId}`);
            return null;
        }
        
        // Clone player
        const clonedPlayer = { ...player };
        
        // Generate new ID
        clonedPlayer.id = `player-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        
        // Set new name
        if (newName) {
            clonedPlayer.name = newName;
        } else {
            clonedPlayer.name = `${player.name} (Copy)`;
        }
        
        // Add to players array
        return await this.addPlayer(clonedPlayer);
    }

    /**
     * Clone a monster
     * @param {string} monsterId - Monster ID
     * @param {string} newName - New monster name
     * @returns {Promise<Object|null>} Cloned monster or null if not found
     */
    async cloneMonster(monsterId, newName = null) {
        // Find monster
        const monster = this.getMonster(monsterId);
        if (!monster) {
            console.warn(`Monster not found: ${monsterId}`);
            return null;
        }
        
        // Clone monster
        const clonedMonster = { ...monster };
        
        // Generate new ID
        clonedMonster.id = `monster-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        
        // Set new name
        if (newName) {
            clonedMonster.name = newName;
        } else {
            clonedMonster.name = `${monster.name} (Copy)`;
        }
        
        // Add to monsters array
        return await this.addMonster(clonedMonster);
    }

    /**
     * Clone a monster template
     * @param {string} templateId - Template ID
     * @param {string} newName - New template name
     * @returns {Promise<Object|null>} Cloned template or null if not found
     */
    async cloneMonsterTemplate(templateId, newName = null) {
        // Find template
        const template = this.getMonsterTemplate(templateId);
        if (!template) {
            console.warn(`Monster template not found: ${templateId}`);
            return null;
        }
        
        // Clone template
        const clonedTemplate = { ...template };
        
        // Generate new ID
        clonedTemplate.id = `template-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        
        // Set new name
        if (newName) {
            clonedTemplate.name = newName;
        } else {
            clonedTemplate.name = `${template.name} (Copy)`;
        }
        
        // Add to templates array
        return await this.addMonsterTemplate(clonedTemplate);
    }

    /**
     * Get monster CR as a number
     * @param {Object} monster - Monster object
     * @returns {number} CR as a number
     */
    getCRValue(monster) {
        if (!monster.cr) return 0;
        
        // Convert CR to numeric value
        if (typeof monster.cr === 'number') return monster.cr;
        if (monster.cr === '1/8') return 0.125;
        if (monster.cr === '1/4') return 0.25;
        if (monster.cr === '1/2') return 0.5;
        return parseFloat(monster.cr) || 0;
    }

    /**
     * Format CR for display
     * @param {string|number} cr - Challenge rating
     * @returns {string} Formatted CR
     */
    formatCR(cr) {
        if (cr === 0.125) return '1/8';
        if (cr === 0.25) return '1/4';
        if (cr === 0.5) return '1/2';
        return cr.toString();
    }

    /**
     * Calculate XP from CR
     * @param {string|number} cr - Challenge rating
     * @returns {number} XP value
     */
    calculateXPFromCR(cr) {
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
        
        // Convert CR to string for lookup
        const crString = cr.toString();
        
        return crToXP[crString] || 10;
    }

    /**
     * Get ability modifier
     * @param {number} score - Ability score
     * @returns {number} Ability modifier
     */
    getAbilityModifier(score) {
        return Math.floor((score - 10) / 2);
    }

    /**
     * Format ability modifier for display
     * @param {number} modifier - Ability modifier
     * @returns {string} Formatted modifier
     */
    formatAbilityModifier(modifier) {
        return modifier >= 0 ? `+${modifier}` : `${modifier}`;
    }

    /**
     * Calculate average HP from HP formula
     * @param {string} formula - HP formula (e.g., "3d8+6")
     * @returns {number} Average HP
     */
    calculateAverageHP(formula) {
        if (!formula) return 0;
        
        // Parse formula
        const match = formula.match(/(\d+)d(\d+)(?:\s*([+-])\s*(\d+))?/);
        if (!match) return 0;
        
        const [_, diceCount, diceSides, sign, bonus] = match;
        
        // Calculate average
        const diceAverage = (parseInt(diceSides) + 1) / 2;
        let average = parseInt(diceCount) * diceAverage;
        
        // Add bonus
        if (bonus) {
            average += (sign === '+' ? 1 : -1) * parseInt(bonus);
        }
        
        return Math.floor(average);
    }

    /**
     * Create HP formula from average HP and Constitution
     * @param {number} averageHP - Average HP
     * @param {number} conScore - Constitution score
     * @param {number} hitDice - Number of hit dice
     * @param {string} hitDieType - Hit die type (d6, d8, d10, d12)
     * @returns {string} HP formula
     */
    createHPFormula(averageHP, conScore, hitDice, hitDieType) {
        // Calculate Constitution modifier
        const conMod = this.getAbilityModifier(conScore);
        
        // Calculate Constitution bonus
        const conBonus = conMod * hitDice;
        
        // Calculate base HP (without Con bonus)
        const baseHP = averageHP - conBonus;
        
        // Create formula
        return `${hitDice}${hitDieType}${conMod >= 0 ? '+' : ''}${conBonus}`;
    }

    /**
     * Get monster size from size category
     * @param {string} size - Size category
     * @returns {string} Hit die type
     */
    getHitDieFromSize(size) {
        switch (size.toLowerCase()) {
            case 'tiny': return 'd4';
            case 'small': return 'd6';
            case 'medium': return 'd8';
            case 'large': return 'd10';
            case 'huge': return 'd12';
            case 'gargantuan': return 'd20';
            default: return 'd8';
        }
    }

    /**
     * Get all player classes
     * @returns {Array} Player classes
     */
    getPlayerClasses() {
        const classes = new Set();
        
        this.players.forEach(player => {
            if (player.class) {
                classes.add(player.class);
            }
        });
        
        return Array.from(classes).sort();
    }

    /**
     * Get all player races
     * @returns {Array} Player races
     */
    getPlayerRaces() {
        const races = new Set();
        
        this.players.forEach(player => {
            if (player.race) {
                races.add(player.race);
            }
        });
        
        return Array.from(races).sort();
    }

    /**
     * Filter players by level
     * @param {number} minLevel - Minimum level
     * @param {number} maxLevel - Maximum level
     * @returns {Array} Filtered players
     */
    filterPlayersByLevel(minLevel, maxLevel) {
        return this.players.filter(player => {
            const level = player.level || 1;
            return level >= minLevel && level <= maxLevel;
        });
    }

    /**
     * Filter players by class
     * @param {string} className - Class name
     * @returns {Array} Filtered players
     */
    filterPlayersByClass(className) {
        if (!className) return this.players;
        
        return this.players.filter(player => 
            player.class && player.class.toLowerCase() === className.toLowerCase()
        );
    }

    /**
     * Filter players by race
     * @param {string} race - Race name
     * @returns {Array} Filtered players
     */
    filterPlayersByRace(race) {
        if (!race) return this.players;
        
        return this.players.filter(player => 
            player.race && player.race.toLowerCase() === race.toLowerCase()
        );
    }

    /**
     * Get standard monster sizes
     * @returns {Array} Monster sizes
     */
    getStandardMonsterSizes() {
        return ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'];
    }

    /**
     * Get standard monster types
     * @returns {Array} Monster types
     */
    getStandardMonsterTypes() {
        return [
            'Aberration',
            'Beast',
            'Celestial',
            'Construct',
            'Dragon',
            'Elemental',
            'Fey',
            'Fiend',
            'Giant',
            'Humanoid',
            'Monstrosity',
            'Ooze',
            'Plant',
            'Undead'
        ];
    }

    /**
     * Get standard monster alignments
     * @returns {Array} Monster alignments
     */
    getStandardMonsterAlignments() {
        return [
            'Lawful Good',
            'Neutral Good',
            'Chaotic Good',
            'Lawful Neutral',
            'Neutral',
            'Chaotic Neutral',
            'Lawful Evil',
            'Neutral Evil',
            'Chaotic Evil',
            'Unaligned',
            'Any Alignment'
        ];
    }

    /**
     * Create a monster stat block HTML
     * @param {string} monsterId - Monster ID
     * @returns {string} HTML stat block
     */
    createMonsterStatBlock(monsterId) {
        // Find monster
        const monster = this.getMonsterTemplate(monsterId);
        if (!monster) {
            return '<div class="stat-block">Monster not found</div>';
        }
        
        // Format ability scores
        const formatAbilityScore = (score) => {
            const modifier = this.getAbilityModifier(score);
            return `${score} (${this.formatAbilityModifier(modifier)})`;
        };
        
        // Create HTML
        return `
            <div class="stat-block">
                <div class="creature-heading">
                    <h1>${monster.name}</h1>
                    <h2>${monster.size || 'Medium'} ${monster.monsterType || 'creature'}, ${monster.alignment || 'unaligned'}</h2>
                </div>
                <svg height="5" width="100%" class="tapered-rule">
                    <polyline points="0,0 400,2.5 0,5"></polyline>
                </svg>
                <div class="top-stats">
                    <div class="property-line first">
                        <h4>Armor Class</h4>
                        <p>${monster.ac || 10}${monster.acType ? ` (${monster.acType})` : ''}</p>
                    </div>
                    <div class="property-line">
                        <h4>Hit Points</h4>
                        <p>${monster.maxHp || 0}${monster.hpFormula ? ` (${monster.hpFormula})` : ''}</p>
                    </div>
                    <div class="property-line">
                        <h4>Speed</h4>
                        <p>${monster.speed || '30 ft.'}</p>
                    </div>
                    <svg height="5" width="100%" class="tapered-rule">
                        <polyline points="0,0 400,2.5 0,5"></polyline>
                    </svg>
                    <div class="abilities">
                        <div class="ability-strength">
                            <h4>STR</h4>
                            <p>${formatAbilityScore(monster.abilities?.str || 10)}</p>
                        </div>
                        <div class="ability-dexterity">
                            <h4>DEX</h4>
                            <p>${formatAbilityScore(monster.abilities?.dex || 10)}</p>
                        </div>
                        <div class="ability-constitution">
                            <h4>CON</h4>
                            <p>${formatAbilityScore(monster.abilities?.con || 10)}</p>
                        </div>
                        <div class="ability-intelligence">
                            <h4>INT</h4>
                            <p>${formatAbilityScore(monster.abilities?.int || 10)}</p>
                        </div>
                        <div class="ability-wisdom">
                            <h4>WIS</h4>
                            <p>${formatAbilityScore(monster.abilities?.wis || 10)}</p>
                        </div>
                        <div class="ability-charisma">
                            <h4>CHA</h4>
                            <p>${formatAbilityScore(monster.abilities?.cha || 10)}</p>
                        </div>
                    </div>
                    <svg height="5" width="100%" class="tapered-rule">
                        <polyline points="0,0 400,2.5 0,5"></polyline>
                    </svg>
                    ${monster.savingThrows ? `
                    <div class="property-line">
                        <h4>Saving Throws</h4>
                        <p>${monster.savingThrows}</p>
                    </div>
                    ` : ''}
                    ${monster.skills ? `
                    <div class="property-line">
                        <h4>Skills</h4>
                        <p>${monster.skills}</p>
                    </div>
                    ` : ''}
                    ${monster.damageResistances ? `
                    <div class="property-line">
                        <h4>Damage Resistances</h4>
                        <p>${monster.damageResistances}</p>
                    </div>
                    ` : ''}
                    ${monster.damageImmunities ? `
                    <div class="property-line">
                        <h4>Damage Immunities</h4>
                        <p>${monster.damageImmunities}</p>
                    </div>
                    ` : ''}
                    ${monster.conditionImmunities ? `
                    <div class="property-line">
                        <h4>Condition Immunities</h4>
                        <p>${monster.conditionImmunities}</p>
                    </div>
                    ` : ''}
                    ${monster.senses ? `
                    <div class="property-line">
                        <h4>Senses</h4>
                        <p>${monster.senses}</p>
                    </div>
                    ` : ''}
                    ${monster.languages ? `
                    <div class="property-line">
                        <h4>Languages</h4>
                        <p>${monster.languages}</p>
                    </div>
                    ` : ''}
                    <div class="property-line last">
                        <h4>Challenge</h4>
                        <p>${monster.cr || '0'} (${this.calculateXPFromCR(monster.cr || '0')} XP)</p>
                    </div>
                </div>
                <svg height="5" width="100%" class="tapered-rule">
                    <polyline points="0,0 400,2.5 0,5"></polyline>
                </svg>
                ${monster.traits && monster.traits.length > 0 ? `
                <div class="properties">
                    ${monster.traits.map(trait => `
                    <div class="property-block">
                        <h4>${trait.name}.</h4>
                        <p>${trait.description}</p>
                    </div>
                    `).join('')}
                </div>
                ` : ''}
                ${monster.actions && monster.actions.length > 0 ? `
                <div class="actions">
                    <h3>Actions</h3>
                    ${monster.actions.map(action => `
                    <div class="property-block">
                        <h4>${action.name}.</h4>
                        <p>${action.description}</p>
                    </div>
                    `).join('')}
                </div>
                ` : ''}
                ${monster.reactions && monster.reactions.length > 0 ? `
                <div class="reactions">
                    <h3>Reactions</h3>
                    ${monster.reactions.map(reaction => `
                    <div class="property-block">
                        <h4>${reaction.name}.</h4>
                        <p>${reaction.description}</p>
                    </div>
                    `).join('')}
                </div>
                ` : ''}
                ${monster.legendaryActions && monster.legendaryActions.length > 0 ? `
                <div class="legendary-actions">
                    <h3>Legendary Actions</h3>
                    <p>${monster.legendaryActionsDescription || `The ${monster.name} can take 3 legendary actions, choosing from the options below. Only one legendary action option can be used at a time and only at the end of another creature's turn. The ${monster.name} regains spent legendary actions at the start of its turn.`}</p>
                    ${monster.legendaryActions.map(action => `
                    <div class="property-block">
                        <h4>${action.name}.</h4>
                        <p>${action.description}</p>
                    </div>
                    `).join('')}
                </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Create a player character sheet HTML
     * @param {string} playerId - Player ID
     * @returns {string} HTML character sheet
     */
    createPlayerCharacterSheet(playerId) {
        // Find player
        const player = this.getPlayer(playerId);
        if (!player) {
            return '<div class="character-sheet">Player not found</div>';
        }
        
        // Format ability scores
        const formatAbilityScore = (score) => {
            const modifier = this.getAbilityModifier(score);
            return `${score} (${this.formatAbilityModifier(modifier)})`;
        };
        
        // Create HTML
        return `
            <div class="character-sheet">
                <div class="character-header">
                    <h1>${player.name}</h1>
                    <h2>${player.race || 'Human'} ${player.class || 'Fighter'} ${player.level || 1}</h2>
                </div>
                <div class="character-info">
                    <div class="info-group">
                        <div class="info-item">
                            <h4>Armor Class</h4>
                            <p>${player.ac || 10}</p>
                        </div>
                        <div class="info-item">
                            <h4>Hit Points</h4>
                            <p>${player.hp || 0} / ${player.maxHp || 0}</p>
                        </div>
                        <div class="info-item">
                            <h4>Initiative</h4>
                            <p>${this.formatAbilityModifier(player.initiativeModifier || 0)}</p>
                        </div>
                        <div class="info-item">
                            <h4>Speed</h4>
                            <p>${player.speed || '30 ft.'}</p>
                        </div>
                    </div>
                    <div class="abilities">
                        <div class="ability">
                            <h4>STR</h4>
                            <p>${formatAbilityScore(player.abilities?.str || 10)}</p>
                        </div>
                        <div class="ability">
                            <h4>DEX</h4>
                            <p>${formatAbilityScore(player.abilities?.dex || 10)}</p>
                        </div>
                        <div class="ability">
                            <h4>CON</h4>
                            <p>${formatAbilityScore(player.abilities?.con || 10)}</p>
                        </div>
                        <div class="ability">
                            <h4>INT</h4>
                            <p>${formatAbilityScore(player.abilities?.int || 10)}</p>
                        </div>
                        <div class="ability">
                            <h4>WIS</h4>
                            <p>${formatAbilityScore(player.abilities?.wis || 10)}</p>
                        </div>
                        <div class="ability">
                            <h4>CHA</h4>
                            <p>${formatAbilityScore(player.abilities?.cha || 10)}</p>
                        </div>
                    </div>
                    ${player.savingThrows ? `
                    <div class="info-block">
                        <h4>Saving Throws</h4>
                        <p>${player.savingThrows}</p>
                    </div>
                    ` : ''}
                    ${player.skills ? `
                    <div class="info-block">
                        <h4>Skills</h4>
                        <p>${player.skills}</p>
                    </div>
                    ` : ''}
                    ${player.features && player.features.length > 0 ? `
                    <div class="features">
                        <h3>Features</h3>
                        ${player.features.map(feature => `
                        <div class="feature">
                            <h4>${feature.name}</h4>
                            <p>${feature.description}</p>
                        </div>
                        `).join('')}
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
}

// Export the Roster class
export default Roster;
