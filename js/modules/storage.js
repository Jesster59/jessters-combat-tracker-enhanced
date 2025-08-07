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
