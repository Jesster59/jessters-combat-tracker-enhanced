/**
 * Storage Manager for Jesster's Combat Tracker
 * Handles saving and loading data from localStorage
 */
class StorageManager {
    constructor(app) {
        this.app = app;
        this.storagePrefix = 'jesstersCombatTracker_';
        console.log("Storage Manager initialized");
    }
    
    /**
     * Save data to localStorage
     * @param {string} key - The key to save under
     * @param {any} data - The data to save
     * @returns {boolean} - Whether the save was successful
     */
    saveData(key, data) {
        try {
            const serializedData = JSON.stringify(data);
            localStorage.setItem(this.storagePrefix + key, serializedData);
            return true;
        } catch (error) {
            console.error(`Error saving data for key ${key}:`, error);
            return false;
        }
    }
    
    /**
     * Load data from localStorage
     * @param {string} key - The key to load
     * @param {any} defaultValue - The default value if the key doesn't exist
     * @returns {any} - The loaded data or defaultValue if not found
     */
    loadData(key, defaultValue = null) {
        try {
            const serializedData = localStorage.getItem(this.storagePrefix + key);
            if (serializedData === null) {
                return defaultValue;
            }
            return JSON.parse(serializedData);
        } catch (error) {
            console.error(`Error loading data for key ${key}:`, error);
            return defaultValue;
        }
    }
    
    /**
     * Remove data from localStorage
     * @param {string} key - The key to remove
     * @returns {boolean} - Whether the removal was successful
     */
    removeData(key) {
        try {
            localStorage.removeItem(this.storagePrefix + key);
            return true;
        } catch (error) {
            console.error(`Error removing data for key ${key}:`, error);
            return false;
        }
    }
    
    /**
     * Check if a key exists in localStorage
     * @param {string} key - The key to check
     * @returns {boolean} - Whether the key exists
     */
    hasData(key) {
        return localStorage.getItem(this.storagePrefix + key) !== null;
    }
    
    /**
     * Save the current combat state
     * @param {string} name - The name to save the state under
     * @returns {boolean} - Whether the save was successful
     */
    saveCombatState(name = null) {
        // Generate a name if not provided
        if (!name) {
            const date = new Date();
            name = `Combat ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        }
        
        // Get the current state
        const state = {
            name: name,
            creatures: this.app.combat.getAllCreatures(),
            roundNumber: this.app.state.roundNumber,
            currentTurn: this.app.state.currentTurn,
            combatStarted: this.app.state.combatStarted,
            savedAt: new Date().toISOString()
        };
        
        // Get existing saved states
        let savedStates = this.loadData('savedCombatStates', []);
        
        // Add the new state
        savedStates.push(state);
        
        // Save back to localStorage
        const success = this.saveData('savedCombatStates', savedStates);
        
        if (success) {
            this.app.logEvent(`Combat state saved as "${name}".`);
        } else {
            this.app.showAlert('Failed to save combat state.');
        }
        
        return success;
    }
    
    /**
     * Load a saved combat state
     * @param {number} index - The index of the state to load
     * @returns {boolean} - Whether the load was successful
     */
    loadCombatState(index) {
        // Get saved states
        const savedStates = this.loadData('savedCombatStates', []);
        
        // Check if the index is valid
        if (index < 0 || index >= savedStates.length) {
            this.app.showAlert('Invalid saved state index.');
            return false;
        }
        
        // Get the state to load
        const state = savedStates[index];
        
        // Confirm if combat is in progress
        if (this.app.state.combatStarted) {
            this.app.showConfirm('Combat is in progress. Loading a saved state will end the current combat. Continue?', () => {
                this.app.combat.endCombat();
                this.loadCombatStateData(state);
            });
        } else {
            this.loadCombatStateData(state);
        }
        
        return true;
    }
    
        /**
     * Load combat state data
     * @param {Object} state - The state to load
     */
    loadCombatStateData(state) {
        // Clear existing creatures
        this.app.combat.clearCombatants();
        
        // Add creatures from the state
        state.creatures.forEach(creature => {
            this.app.combat.addCreature(creature);
        });
        
        // Set combat state
        this.app.state.roundNumber = state.roundNumber;
        this.app.state.currentTurn = state.currentTurn;
        this.app.state.combatStarted = state.combatStarted;
        
        // Update UI
        this.app.ui.renderCreatures();
        this.app.ui.renderInitiativeOrder();
        this.app.updatePlayerView();
        
        this.app.logEvent(`Combat state "${state.name}" loaded.`);
    }
    
    /**
     * Delete a saved combat state
     * @param {number} index - The index of the state to delete
     * @returns {boolean} - Whether the deletion was successful
     */
    deleteCombatState(index) {
        // Get saved states
        let savedStates = this.loadData('savedCombatStates', []);
        
        // Check if the index is valid
        if (index < 0 || index >= savedStates.length) {
            this.app.showAlert('Invalid saved state index.');
            return false;
        }
        
        // Get the name of the state for logging
        const stateName = savedStates[index].name;
        
        // Remove the state
        savedStates.splice(index, 1);
        
        // Save back to localStorage
        const success = this.saveData('savedCombatStates', savedStates);
        
        if (success) {
            this.app.logEvent(`Combat state "${stateName}" deleted.`);
        } else {
            this.app.showAlert('Failed to delete combat state.');
        }
        
        return success;
    }
    
    /**
     * Save an encounter
     * @param {string} name - The name of the encounter
     * @param {string} description - The description of the encounter
     * @returns {string|null} - The ID of the saved encounter or null if failed
     */
    saveEncounter(name, description = '') {
        const creatures = this.app.combat.getAllCreatures();
        if (creatures.length === 0) {
            this.app.showAlert('No creatures to save.');
            return null;
        }
        
        const encounter = {
            id: this.app.utils.generateUUID(),
            name: name,
            description: description,
            creatures: creatures,
            savedAt: new Date().toISOString()
        };
        
        // Get existing encounters
        let encounters = this.loadData('encounters', []);
        
        // Add new encounter
        encounters.push(encounter);
        
        // Save back to localStorage
        const success = this.saveData('encounters', encounters);
        
        if (success) {
            this.app.logEvent(`Encounter "${name}" saved.`);
            return encounter.id;
        } else {
            this.app.showAlert('Failed to save encounter.');
            return null;
        }
    }
    
    /**
     * Load an encounter
     * @param {string} encounterId - The ID of the encounter to load
     * @returns {boolean} - Whether the load was successful
     */
    loadEncounter(encounterId) {
        // Get existing encounters
        const encounters = this.loadData('encounters', []);
        
        // Find the encounter
        const encounter = encounters.find(e => e.id === encounterId);
        if (!encounter) {
            this.app.showAlert('Encounter not found.');
            return false;
        }
        
        // Confirm if combat is in progress
        if (this.app.state.combatStarted) {
            this.app.showConfirm('Combat is in progress. Loading an encounter will end the current combat. Continue?', () => {
                this.app.combat.endCombat();
                this.loadEncounterData(encounter);
            });
        } else {
            this.loadEncounterData(encounter);
        }
        
        return true;
    }
    
    /**
     * Load encounter data
     * @param {Object} encounter - The encounter to load
     */
    loadEncounterData(encounter) {
        // Clear existing creatures
        this.app.combat.clearCombatants();
        
        // Add creatures from the encounter
        encounter.creatures.forEach(creature => {
            // Generate new IDs to avoid conflicts
            creature.id = this.app.utils.generateUUID();
            this.app.combat.addCreature(creature);
        });
        
        this.app.logEvent(`Encounter "${encounter.name}" loaded.`);
    }
    
    /**
     * Delete an encounter
     * @param {string} encounterId - The ID of the encounter to delete
     * @returns {boolean} - Whether the deletion was successful
     */
    deleteEncounter(encounterId) {
        // Get existing encounters
        let encounters = this.loadData('encounters', []);
        
        // Find the encounter
        const encounterIndex = encounters.findIndex(e => e.id === encounterId);
        if (encounterIndex === -1) {
            this.app.showAlert('Encounter not found.');
            return false;
        }
        
        // Get the name for logging
        const encounterName = encounters[encounterIndex].name;
        
        // Remove the encounter
        encounters.splice(encounterIndex, 1);
        
        // Save back to localStorage
        const success = this.saveData('encounters', encounters);
        
        if (success) {
            this.app.logEvent(`Encounter "${encounterName}" deleted.`);
        } else {
            this.app.showAlert('Failed to delete encounter.');
        }
        
        return success;
    }
    
    /**
     * Export all data to a JSON object
     * @returns {Object} - All data as a JSON object
     */
    async exportAllData() {
        const data = {
            version: this.app.version,
            exportDate: new Date().toISOString(),
            settings: this.app.settings.getAllSettings(),
            savedCombatStates: this.loadData('savedCombatStates', []),
            encounters: this.loadData('encounters', []),
            customMonsters: this.loadData('customMonsters', []),
            customHeroes: this.loadData('customHeroes', [])
        };
        
        return data;
    }
    
    /**
     * Import data from a JSON object
     * @param {Object} data - The data to import
     * @returns {Object} - Results of the import
     */
    async importData(data) {
        const results = {
            settings: false,
            combatStates: 0,
            encounters: 0,
            monsters: 0,
            heroes: 0
        };
        
        try {
            // Import settings
            if (data.settings) {
                this.app.settings.importSettings(data.settings);
                results.settings = true;
            }
            
            // Import saved combat states
            if (data.savedCombatStates && Array.isArray(data.savedCombatStates)) {
                const existingStates = this.loadData('savedCombatStates', []);
                const newStates = [...existingStates, ...data.savedCombatStates];
                this.saveData('savedCombatStates', newStates);
                results.combatStates = data.savedCombatStates.length;
            }
            
            // Import encounters
            if (data.encounters && Array.isArray(data.encounters)) {
                const existingEncounters = this.loadData('encounters', []);
                const newEncounters = [...existingEncounters, ...data.encounters];
                this.saveData('encounters', newEncounters);
                results.encounters = data.encounters.length;
            }
            
            // Import custom monsters
            if (data.customMonsters && Array.isArray(data.customMonsters)) {
                const existingMonsters = this.loadData('customMonsters', []);
                const newMonsters = [...existingMonsters, ...data.customMonsters];
                this.saveData('customMonsters', newMonsters);
                results.monsters = data.customMonsters.length;
            }
            
            // Import custom heroes
            if (data.customHeroes && Array.isArray(data.customHeroes)) {
                const existingHeroes = this.loadData('customHeroes', []);
                const newHeroes = [...existingHeroes, ...data.customHeroes];
                this.saveData('customHeroes', newHeroes);
                results.heroes = data.customHeroes.length;
            }
            
            return results;
        } catch (error) {
            console.error('Error importing data:', error);
            throw new Error('Failed to import data: ' + error.message);
        }
    }
    
    /**
     * Save a custom monster
     * @param {Object} monster - The monster to save
     * @returns {boolean} - Whether the save was successful
     */
    saveCustomMonster(monster) {
        // Ensure the monster has an ID
        if (!monster.id) {
            monster.id = this.app.utils.generateUUID();
        }
        
        // Get existing custom monsters
        let customMonsters = this.loadData('customMonsters', []);
        
        // Check if the monster already exists
        const existingIndex = customMonsters.findIndex(m => m.id === monster.id);
        if (existingIndex !== -1) {
            // Update existing monster
            customMonsters[existingIndex] = monster;
        } else {
            // Add new monster
            customMonsters.push(monster);
        }
        
        // Save back to localStorage
        return this.saveData('customMonsters', customMonsters);
    }
    
    /**
     * Save a custom hero
     * @param {Object} hero - The hero to save
     * @returns {boolean} - Whether the save was successful
     */
    saveCustomHero(hero) {
        // Ensure the hero has an ID
        if (!hero.id) {
            hero.id = this.app.utils.generateUUID();
        }
        
        // Get existing custom heroes
        let customHeroes = this.loadData('customHeroes', []);
        
        // Check if the hero already exists
        const existingIndex = customHeroes.findIndex(h => h.id === hero.id);
        if (existingIndex !== -1) {
            // Update existing hero
            customHeroes[existingIndex] = hero;
        } else {
            // Add new hero
            customHeroes.push(hero);
        }
        
        // Save back to localStorage
        return this.saveData('customHeroes', customHeroes);
    }
}
