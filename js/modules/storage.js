/**
 * Storage Manager for Jesster's Combat Tracker
 * Handles data persistence using IndexedDB
 */
class StorageManager {
    constructor(app) {
        this.app = app;
        this.dbName = 'JesstersCombatTracker';
        this.dbVersion = 1;
        this.db = null;
        console.log("Storage Manager initialized");
    }
    
    /**
     * Initialize the storage manager
     */
    async init() {
        try {
            this.db = await this.openDatabase();
            console.log("Database initialized");
        } catch (error) {
            console.error("Error initializing database:", error);
        }
    }
    
    /**
     * Open the database
     * @returns {Promise<IDBDatabase>} - The database instance
     */
    openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = (event) => {
                reject(new Error(`Database error: ${event.target.error}`));
            };
            
            request.onsuccess = (event) => {
                resolve(event.target.result);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores if they don't exist
                if (!db.objectStoreNames.contains('characters')) {
                    db.createObjectStore('characters', { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains('monsters')) {
                    db.createObjectStore('monsters', { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains('encounters')) {
                    db.createObjectStore('encounters', { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains('combatStates')) {
                    db.createObjectStore('combatStates', { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'id' });
                }
            };
        });
    }
    
    /**
     * Get all characters
     * @returns {Promise<Array>} - All characters
     */
    async getAllCharacters() {
        return this.getAll('characters');
    }
    
    /**
     * Get a character by ID
     * @param {string} id - The character ID
     * @returns {Promise<Object|null>} - The character or null if not found
     */
    async getCharacter(id) {
        return this.get('characters', id);
    }
    
    /**
     * Save a character
     * @param {Object} character - The character to save
     * @returns {Promise<Object>} - The saved character
     */
    async saveCharacter(character) {
        return this.save('characters', character);
    }
    
    /**
     * Delete a character
     * @param {string} id - The character ID
     * @returns {Promise<boolean>} - Whether the character was deleted
     */
    async deleteCharacter(id) {
        return this.delete('characters', id);
    }
    
    /**
     * Get all monsters
     * @returns {Promise<Array>} - All monsters
     */
    async getAllMonsters() {
        return this.getAll('monsters');
    }
    
    /**
     * Get a monster by ID
     * @param {string} id - The monster ID
     * @returns {Promise<Object|null>} - The monster or null if not found
     */
    async getMonster(id) {
        return this.get('monsters', id);
    }
    
    /**
     * Save a monster
     * @param {Object} monster - The monster to save
     * @returns {Promise<Object>} - The saved monster
     */
    async saveMonster(monster) {
        return this.save('monsters', monster);
    }
    
    /**
     * Delete a monster
     * @param {string} id - The monster ID
     * @returns {Promise<boolean>} - Whether the monster was deleted
     */
    async deleteMonster(id) {
        return this.delete('monsters', id);
    }
    
    /**
     * Get all encounters
     * @returns {Promise<Array>} - All encounters
     */
    async getAllEncounters() {
        return this.getAll('encounters');
    }
    
    /**
     * Get an encounter by ID
     * @param {string} id - The encounter ID
     * @returns {Promise<Object|null>} - The encounter or null if not found
     */
    async getEncounter(id) {
        return this.get('encounters', id);
    }
    
    /**
     * Save an encounter
     * @param {Object} encounter - The encounter to save
     * @returns {Promise<Object>} - The saved encounter
     */
    async saveEncounter(encounter) {
        return this.save('encounters', encounter);
    }
    
    /**
     * Delete an encounter
     * @param {string} id - The encounter ID
     * @returns {Promise<boolean>} - Whether the encounter was deleted
     */
    async deleteEncounter(id) {
        return this.delete('encounters', id);
    }
    
    /**
     * Get all combat states
     * @returns {Promise<Array>} - All combat states
     */
    async getAllCombatStates() {
        return this.getAll('combatStates');
    }
    
    /**
     * Get a combat state by ID
     * @param {string} id - The combat state ID
     * @returns {Promise<Object|null>} - The combat state or null if not found
     */
    async getCombatState(id) {
        return this.get('combatStates', id);
    }
    
    /**
     * Save a combat state
     * @param {Object} state - The combat state to save
     * @returns {Promise<Object>} - The saved combat state
     */
    async saveCombatState(state) {
        // Ensure the state has an ID
        if (!state.id) {
            state.id = this.app.utils.generateUUID();
        }
        
        return this.save('combatStates', state);
    }
    
    /**
     * Delete a combat state
     * @param {string} id - The combat state ID
     * @returns {Promise<boolean>} - Whether the combat state was deleted
     */
    async deleteCombatState(id) {
        return this.delete('combatStates', id);
    }
    
    /**
     * Get settings
     * @returns {Promise<Object|null>} - The settings or null if not found
     */
    async getSettings() {
        return this.get('settings', 'app-settings');
    }
    
    /**
     * Save settings
     * @param {Object} settings - The settings to save
     * @returns {Promise<Object>} - The saved settings
     */
    async saveSettings(settings) {
        return this.save('settings', { id: 'app-settings', ...settings });
    }
    
    /**
     * Get all items from a store
     * @param {string} storeName - The store name
     * @returns {Promise<Array>} - All items in the store
     */
    async getAll(storeName) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            
            try {
                const transaction = this.db.transaction(storeName, 'readonly');
                const store = transaction.objectStore(storeName);
                const request = store.getAll();
                
                request.onsuccess = () => {
                    resolve(request.result);
                };
                
                request.onerror = (event) => {
                    reject(new Error(`Error getting all from ${storeName}: ${event.target.error}`));
                };
            } catch (error) {
                reject(new Error(`Error getting all from ${storeName}: ${error.message}`));
            }
        });
    }
    
    /**
     * Get an item from a store
     * @param {string} storeName - The store name
     * @param {string} id - The item ID
     * @returns {Promise<Object|null>} - The item or null if not found
     */
    async get(storeName, id) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            
            try {
                const transaction = this.db.transaction(storeName, 'readonly');
                const store = transaction.objectStore(storeName);
                const request = store.get(id);
                
                request.onsuccess = () => {
                    resolve(request.result || null);
                };
                
                request.onerror = (event) => {
                    reject(new Error(`Error getting from ${storeName}: ${event.target.error}`));
                };
            } catch (error) {
                reject(new Error(`Error getting from ${storeName}: ${error.message}`));
            }
        });
    }
    
    /**
     * Save an item to a store
     * @param {string} storeName - The store name
     * @param {Object} item - The item to save
     * @returns {Promise<Object>} - The saved item
     */
    async save(storeName, item) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            
            try {
                const transaction = this.db.transaction(storeName, 'readwrite');
                const store = transaction.objectStore(storeName);
                
                // Update the updatedAt timestamp if it exists
                if (item.updatedAt !== undefined) {
                    item.updatedAt = Date.now();
                }
                
                const request = store.put(item);
                
                request.onsuccess = () => {
                    resolve(item);
                };
                
                request.onerror = (event) => {
                    reject(new Error(`Error saving to ${storeName}: ${event.target.error}`));
                };
            } catch (error) {
                reject(new Error(`Error saving to ${storeName}: ${error.message}`));
            }
        });
    }
    
        /**
     * Delete an item from a store
     * @param {string} storeName - The store name
     * @param {string} id - The item ID
     * @returns {Promise<boolean>} - Whether the item was deleted
     */
    async delete(storeName, id) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            
            try {
                const transaction = this.db.transaction(storeName, 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.delete(id);
                
                request.onsuccess = () => {
                    resolve(true);
                };
                
                request.onerror = (event) => {
                    reject(new Error(`Error deleting from ${storeName}: ${event.target.error}`));
                };
            } catch (error) {
                reject(new Error(`Error deleting from ${storeName}: ${error.message}`));
            }
        });
    }
    
    /**
     * Clear a store
     * @param {string} storeName - The store name
     * @returns {Promise<boolean>} - Whether the store was cleared
     */
    async clear(storeName) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            
            try {
                const transaction = this.db.transaction(storeName, 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.clear();
                
                request.onsuccess = () => {
                    resolve(true);
                };
                
                request.onerror = (event) => {
                    reject(new Error(`Error clearing ${storeName}: ${event.target.error}`));
                };
            } catch (error) {
                reject(new Error(`Error clearing ${storeName}: ${error.message}`));
            }
        });
    }
    
    /**
     * Export all data
     * @returns {Promise<Object>} - All data
     */
    async exportAllData() {
        try {
            const characters = await this.getAllCharacters();
            const monsters = await this.getAllMonsters();
            const encounters = await this.getAllEncounters();
            const combatStates = await this.getAllCombatStates();
            const settings = await this.getSettings();
            
            return {
                version: this.app.state.version,
                exportDate: new Date().toISOString(),
                data: {
                    characters,
                    monsters,
                    encounters,
                    combatStates,
                    settings
                }
            };
        } catch (error) {
            console.error('Error exporting data:', error);
            throw new Error(`Error exporting data: ${error.message}`);
        }
    }
    
    /**
     * Import data
     * @param {Object} data - The data to import
     * @returns {Promise<Object>} - Import results
     */
    async importData(data) {
        try {
            // Validate data
            if (!data || !data.version || !data.data) {
                throw new Error('Invalid data format');
            }
            
            // Check version compatibility
            const currentVersion = this.app.state.version.split('.');
            const importVersion = data.version.split('.');
            
            // Major version must match
            if (currentVersion[0] !== importVersion[0]) {
                throw new Error(`Version mismatch: Import data is from version ${data.version}, current version is ${this.app.state.version}`);
            }
            
            const results = {
                characters: 0,
                monsters: 0,
                encounters: 0,
                combatStates: 0,
                settings: false
            };
            
            // Import characters
            if (data.data.characters && Array.isArray(data.data.characters)) {
                for (const character of data.data.characters) {
                    await this.saveCharacter(character);
                    results.characters++;
                }
            }
            
            // Import monsters
            if (data.data.monsters && Array.isArray(data.data.monsters)) {
                for (const monster of data.data.monsters) {
                    await this.saveMonster(monster);
                    results.monsters++;
                }
            }
            
            // Import encounters
            if (data.data.encounters && Array.isArray(data.data.encounters)) {
                for (const encounter of data.data.encounters) {
                    await this.saveEncounter(encounter);
                    results.encounters++;
                }
            }
            
            // Import combat states
            if (data.data.combatStates && Array.isArray(data.data.combatStates)) {
                for (const state of data.data.combatStates) {
                    await this.saveCombatState(state);
                    results.combatStates++;
                }
            }
            
            // Import settings
            if (data.data.settings) {
                await this.saveSettings(data.data.settings);
                results.settings = true;
            }
            
            return results;
        } catch (error) {
            console.error('Error importing data:', error);
            throw new Error(`Error importing data: ${error.message}`);
        }
    }
}
