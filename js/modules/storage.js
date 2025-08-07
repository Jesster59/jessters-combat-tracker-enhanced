/**
 * Storage Manager for Jesster's Combat Tracker
 * Handles data persistence using localStorage and IndexedDB
 */
class StorageManager {
    constructor(app) {
        this.app = app;
        this.db = null;
        this.dbName = 'JesstersCombatTrackerDB';
        this.dbVersion = 1;
        this.stores = {
            characters: 'characters',
            monsters: 'monsters',
            encounters: 'encounters',
            parties: 'parties',
            settings: 'settings',
            combatStates: 'combatStates'
        };
    }
    
    /**
     * Initialize the storage manager
     */
    async init() {
        try {
            // Check if IndexedDB is supported
            if (!window.indexedDB) {
                console.warn("Your browser doesn't support IndexedDB. Falling back to localStorage.");
                return;
            }
            
            // Open the database
            const openRequest = indexedDB.open(this.dbName, this.dbVersion);
            
            // Create object stores if needed
            openRequest.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores
                if (!db.objectStoreNames.contains(this.stores.characters)) {
                    db.createObjectStore(this.stores.characters, { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains(this.stores.monsters)) {
                    db.createObjectStore(this.stores.monsters, { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains(this.stores.encounters)) {
                    db.createObjectStore(this.stores.encounters, { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains(this.stores.parties)) {
                    db.createObjectStore(this.stores.parties, { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains(this.stores.settings)) {
                    db.createObjectStore(this.stores.settings, { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains(this.stores.combatStates)) {
                    db.createObjectStore(this.stores.combatStates, { keyPath: 'id' });
                }
            };
            
            // Handle success
            return new Promise((resolve, reject) => {
                openRequest.onsuccess = (event) => {
                    this.db = event.target.result;
                    console.log("IndexedDB initialized successfully");
                    resolve();
                };
                
                openRequest.onerror = (event) => {
                    console.error("Error opening IndexedDB:", event.target.error);
                    reject(event.target.error);
                };
            });
        } catch (error) {
            console.error("Error initializing storage:", error);
            throw error;
        }
    }
    
        /**
     * Save data to IndexedDB
     * @param {string} storeName - The name of the object store
     * @param {Object} data - The data to save
     * @returns {Promise<string>} - The ID of the saved data
     */
    async saveToIndexedDB(storeName, data) {
        if (!this.db) {
            return this.saveToLocalStorage(storeName, data);
        }
        
        try {
            return new Promise((resolve, reject) => {
                // Ensure data has an ID
                if (!data.id) {
                    data.id = this.app.utils.generateUUID();
                }
                
                // Start a transaction
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                
                // Add or update the data
                const request = store.put(data);
                
                request.onsuccess = () => {
                    resolve(data.id);
                };
                
                request.onerror = (event) => {
                    console.error(`Error saving to ${storeName}:`, event.target.error);
                    reject(event.target.error);
                };
            });
        } catch (error) {
            console.error(`Error saving to ${storeName}:`, error);
            return this.saveToLocalStorage(storeName, data);
        }
    }
    
    /**
     * Get data from IndexedDB
     * @param {string} storeName - The name of the object store
     * @param {string} id - The ID of the data to get
     * @returns {Promise<Object>} - The retrieved data
     */
    async getFromIndexedDB(storeName, id) {
        if (!this.db) {
            return this.getFromLocalStorage(storeName, id);
        }
        
        try {
            return new Promise((resolve, reject) => {
                // Start a transaction
                const transaction = this.db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                
                // Get the data
                const request = store.get(id);
                
                request.onsuccess = (event) => {
                    resolve(event.target.result);
                };
                
                request.onerror = (event) => {
                    console.error(`Error getting from ${storeName}:`, event.target.error);
                    reject(event.target.error);
                };
            });
        } catch (error) {
            console.error(`Error getting from ${storeName}:`, error);
            return this.getFromLocalStorage(storeName, id);
        }
    }
    
    /**
     * Get all data from IndexedDB
     * @param {string} storeName - The name of the object store
     * @returns {Promise<Array>} - The retrieved data
     */
    async getAllFromIndexedDB(storeName) {
        if (!this.db) {
            return this.getAllFromLocalStorage(storeName);
        }
        
        try {
            return new Promise((resolve, reject) => {
                // Start a transaction
                const transaction = this.db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                
                // Get all data
                const request = store.getAll();
                
                request.onsuccess = (event) => {
                    resolve(event.target.result);
                };
                
                request.onerror = (event) => {
                    console.error(`Error getting all from ${storeName}:`, event.target.error);
                    reject(event.target.error);
                };
            });
        } catch (error) {
            console.error(`Error getting all from ${storeName}:`, error);
            return this.getAllFromLocalStorage(storeName);
        }
    }
    
    /**
     * Delete data from IndexedDB
     * @param {string} storeName - The name of the object store
     * @param {string} id - The ID of the data to delete
     * @returns {Promise<boolean>} - Whether the deletion was successful
     */
    async deleteFromIndexedDB(storeName, id) {
        if (!this.db) {
            return this.deleteFromLocalStorage(storeName, id);
        }
        
        try {
            return new Promise((resolve, reject) => {
                // Start a transaction
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                
                // Delete the data
                const request = store.delete(id);
                
                request.onsuccess = () => {
                    resolve(true);
                };
                
                request.onerror = (event) => {
                    console.error(`Error deleting from ${storeName}:`, event.target.error);
                    reject(event.target.error);
                };
            });
        } catch (error) {
            console.error(`Error deleting from ${storeName}:`, error);
            return this.deleteFromLocalStorage(storeName, id);
        }
    }
    
    /**
     * Save data to localStorage
     * @param {string} storeName - The name of the store
     * @param {Object} data - The data to save
     * @returns {string} - The ID of the saved data
     */
    saveToLocalStorage(storeName, data) {
        try {
            // Ensure data has an ID
            if (!data.id) {
                data.id = this.app.utils.generateUUID();
            }
            
            // Get existing data
            const existingData = this.getAllFromLocalStorage(storeName);
            
            // Find and update or add new data
            const index = existingData.findIndex(item => item.id === data.id);
            if (index !== -1) {
                existingData[index] = data;
            } else {
                existingData.push(data);
            }
            
            // Save back to localStorage
            localStorage.setItem(`jesstersCombatTracker_${storeName}`, JSON.stringify(existingData));
            
            return data.id;
        } catch (error) {
            console.error(`Error saving to localStorage (${storeName}):`, error);
            throw error;
        }
    }
    
    /**
     * Get data from localStorage
     * @param {string} storeName - The name of the store
     * @param {string} id - The ID of the data to get
     * @returns {Object|null} - The retrieved data
     */
    getFromLocalStorage(storeName, id) {
        try {
            const allData = this.getAllFromLocalStorage(storeName);
            return allData.find(item => item.id === id) || null;
        } catch (error) {
            console.error(`Error getting from localStorage (${storeName}):`, error);
            return null;
        }
    }
    
    /**
     * Get all data from localStorage
     * @param {string} storeName - The name of the store
     * @returns {Array} - The retrieved data
     */
    getAllFromLocalStorage(storeName) {
        try {
            const data = localStorage.getItem(`jesstersCombatTracker_${storeName}`);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error(`Error getting all from localStorage (${storeName}):`, error);
            return [];
        }
    }
    
    /**
     * Delete data from localStorage
     * @param {string} storeName - The name of the store
     * @param {string} id - The ID of the data to delete
     * @returns {boolean} - Whether the deletion was successful
     */
    deleteFromLocalStorage(storeName, id) {
        try {
            // Get existing data
            const existingData = this.getAllFromLocalStorage(storeName);
            
            // Filter out the data to delete
            const newData = existingData.filter(item => item.id !== id);
            
            // Save back to localStorage
            localStorage.setItem(`jesstersCombatTracker_${storeName}`, JSON.stringify(newData));
            
            return true;
        } catch (error) {
            console.error(`Error deleting from localStorage (${storeName}):`, error);
            return false;
        }
    }
    
    /**
     * Save a character
     * @param {Object} character - The character to save
     * @returns {Promise<string>} - The ID of the saved character
     */
    async saveCharacter(character) {
        return this.saveToIndexedDB(this.stores.characters, character);
    }
    
    /**
     * Get a character
     * @param {string} id - The ID of the character to get
     * @returns {Promise<Object>} - The retrieved character
     */
    async getCharacter(id) {
        return this.getFromIndexedDB(this.stores.characters, id);
    }
    
    /**
     * Get all characters
     * @returns {Promise<Array>} - The retrieved characters
     */
    async getAllCharacters() {
        return this.getAllFromIndexedDB(this.stores.characters);
    }
    
    /**
     * Delete a character
     * @param {string} id - The ID of the character to delete
     * @returns {Promise<boolean>} - Whether the deletion was successful
     */
    async deleteCharacter(id) {
        return this.deleteFromIndexedDB(this.stores.characters, id);
    }
    
    /**
     * Save a monster
     * @param {Object} monster - The monster to save
     * @returns {Promise<string>} - The ID of the saved monster
     */
    async saveMonster(monster) {
        return this.saveToIndexedDB(this.stores.monsters, monster);
    }
    
    /**
     * Get a monster
     * @param {string} id - The ID of the monster to get
     * @returns {Promise<Object>} - The retrieved monster
     */
    async getMonster(id) {
        return this.getFromIndexedDB(this.stores.monsters, id);
    }
    
    /**
     * Get all monsters
     * @returns {Promise<Array>} - The retrieved monsters
     */
    async getAllMonsters() {
        return this.getAllFromIndexedDB(this.stores.monsters);
    }
    
    /**
     * Delete a monster
     * @param {string} id - The ID of the monster to delete
     * @returns {Promise<boolean>} - Whether the deletion was successful
     */
    async deleteMonster(id) {
        return this.deleteFromIndexedDB(this.stores.monsters, id);
    }
    
    /**
     * Save an encounter
     * @param {Object} encounter - The encounter to save
     * @returns {Promise<string>} - The ID of the saved encounter
     */
    async saveEncounter(encounter) {
        return this.saveToIndexedDB(this.stores.encounters, encounter);
    }
    
    /**
     * Get an encounter
     * @param {string} id - The ID of the encounter to get
     * @returns {Promise<Object>} - The retrieved encounter
     */
    async getEncounter(id) {
        return this.getFromIndexedDB(this.stores.encounters, id);
    }
    
    /**
     * Get all encounters
     * @returns {Promise<Array>} - The retrieved encounters
     */
    async getAllEncounters() {
        return this.getAllFromIndexedDB(this.stores.encounters);
    }
    
    /**
     * Delete an encounter
     * @param {string} id - The ID of the encounter to delete
     * @returns {Promise<boolean>} - Whether the deletion was successful
     */
    async deleteEncounter(id) {
        return this.deleteFromIndexedDB(this.stores.encounters, id);
    }
    
    /**
     * Save a party
     * @param {Object} party - The party to save
     * @returns {Promise<string>} - The ID of the saved party
     */
    async saveParty(party) {
        return this.saveToIndexedDB(this.stores.parties, party);
    }
    
    /**
     * Get a party
     * @param {string} id - The ID of the party to get
     * @returns {Promise<Object>} - The retrieved party
     */
    async getParty(id) {
        return this.getFromIndexedDB(this.stores.parties, id);
    }
    
    /**
     * Get all parties
     * @returns {Promise<Array>} - The retrieved parties
     */
    async getAllParties() {
        return this.getAllFromIndexedDB(this.stores.parties);
    }
    
    /**
     * Delete a party
     * @param {string} id - The ID of the party to delete
     * @returns {Promise<boolean>} - Whether the deletion was successful
     */
    async deleteParty(id) {
        return this.deleteFromIndexedDB(this.stores.parties, id);
    }
    
    /**
     * Save a combat state
     * @param {Object} state - The combat state to save
     * @returns {Promise<string>} - The ID of the saved combat state
     */
    async saveCombatState(state) {
        // Add timestamp if not present
        if (!state.timestamp) {
            state.timestamp = Date.now();
        }
        
        return this.saveToIndexedDB(this.stores.combatStates, state);
    }
    
    /**
     * Get a combat state
     * @param {string} id - The ID of the combat state to get
     * @returns {Promise<Object>} - The retrieved combat state
     */
    async getCombatState(id) {
        return this.getFromIndexedDB(this.stores.combatStates, id);
    }
    
    /**
     * Get all combat states
     * @returns {Promise<Array>} - The retrieved combat states
     */
    async getAllCombatStates() {
        return this.getAllFromIndexedDB(this.stores.combatStates);
    }
    
    /**
     * Delete a combat state
     * @param {string} id - The ID of the combat state to delete
     * @returns {Promise<boolean>} - Whether the deletion was successful
     */
    async deleteCombatState(id) {
        return this.deleteFromIndexedDB(this.stores.combatStates, id);
    }
    
    /**
     * Save settings
     * @param {Object} settings - The settings to save
     * @returns {Promise<string>} - The ID of the saved settings
     */
    async saveSettings(settings) {
        // Always use the same ID for settings
        settings.id = 'app-settings';
        return this.saveToIndexedDB(this.stores.settings, settings);
    }
    
    /**
     * Get settings
     * @returns {Promise<Object>} - The retrieved settings
     */
    async getSettings() {
        return this.getFromIndexedDB(this.stores.settings, 'app-settings');
    }
}
