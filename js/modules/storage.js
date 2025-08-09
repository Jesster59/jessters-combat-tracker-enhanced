/**
 * Storage module for Jesster's Combat Tracker
 * Handles data persistence using localStorage, IndexedDB, and optional cloud storage
 */
class Storage {
    constructor() {
        this.dbName = 'JesstersCombatTracker';
        this.dbVersion = 1;
        this.db = null;
        this.isIndexedDBSupported = 'indexedDB' in window;
        this.isLocalStorageSupported = this._checkLocalStorage();
        this.cloudEnabled = false;
        this.cloudConfig = null;
        this.userId = null;
        
        // Initialize IndexedDB if supported
        if (this.isIndexedDBSupported) {
            this._initIndexedDB();
        }
        
        console.log("Storage module initialized");
    }

    /**
     * Check if localStorage is available
     * @private
     * @returns {boolean} True if localStorage is available
     */
    _checkLocalStorage() {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
        } catch (e) {
            console.warn('localStorage not available:', e);
            return false;
        }
    }

    /**
     * Initialize IndexedDB
     * @private
     */
    async _initIndexedDB() {
        if (!this.isIndexedDBSupported) return;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = (event) => {
                console.error('IndexedDB error:', event.target.error);
                this.isIndexedDBSupported = false;
                reject(event.target.error);
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('IndexedDB connection established');
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores if they don't exist
                if (!db.objectStoreNames.contains('roster')) {
                    db.createObjectStore('roster', { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains('monsters')) {
                    db.createObjectStore('monsters', { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains('parties')) {
                    db.createObjectStore('parties', { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains('encounters')) {
                    db.createObjectStore('encounters', { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains('combats')) {
                    db.createObjectStore('combats', { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains('cache')) {
                    const cacheStore = db.createObjectStore('cache', { keyPath: 'id' });
                    cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    }

    /**
     * Configure cloud storage
     * @param {Object} config - Firebase configuration
     * @param {string} userId - User ID for cloud storage
     */
    configureCloudStorage(config, userId) {
        this.cloudConfig = config;
        this.userId = userId;
        this.cloudEnabled = true;
    }

    /**
     * Disable cloud storage
     */
    disableCloudStorage() {
        this.cloudEnabled = false;
    }

    /**
     * Save data to storage
     * @param {string} key - Storage key
     * @param {any} data - Data to store
     * @param {Object} options - Storage options
     * @param {boolean} options.useLocalStorage - Use localStorage instead of IndexedDB
     * @param {boolean} options.useCloud - Use cloud storage
     * @param {string} options.collection - Collection name for cloud storage
     * @returns {Promise<boolean>} Success status
     */
    async save(key, data, options = {}) {
        const { useLocalStorage = false, useCloud = this.cloudEnabled, collection = null } = options;
        
        try {
            // Use localStorage if specified or if IndexedDB is not supported
            if (useLocalStorage || !this.isIndexedDBSupported) {
                if (!this.isLocalStorageSupported) {
                    throw new Error('localStorage is not supported');
                }
                localStorage.setItem(key, JSON.stringify(data));
            } 
            // Use IndexedDB
            else {
                await this._saveToIndexedDB(key, data);
            }
            
            // Save to cloud if enabled and configured
            if (useCloud && this.cloudEnabled && collection) {
                await this._saveToCloud(collection, key, data);
            }
            
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }

    /**
     * Load data from storage
     * @param {string} key - Storage key
     * @param {Object} options - Storage options
     * @param {boolean} options.useLocalStorage - Use localStorage instead of IndexedDB
     * @param {boolean} options.useCloud - Use cloud storage
     * @param {string} options.collection - Collection name for cloud storage
     * @param {boolean} options.preferCloud - Prefer cloud data over local data
     * @returns {Promise<any>} Loaded data
     */
    async load(key, options = {}) {
        const { 
            useLocalStorage = false, 
            useCloud = this.cloudEnabled, 
            collection = null,
            preferCloud = false
        } = options;
        
        try {
            let data = null;
            
            // Try to load from cloud first if preferCloud is true
            if (preferCloud && useCloud && this.cloudEnabled && collection) {
                data = await this._loadFromCloud(collection, key);
                if (data) return data;
            }
            
            // Load from localStorage if specified or if IndexedDB is not supported
            if (useLocalStorage || !this.isIndexedDBSupported) {
                if (!this.isLocalStorageSupported) {
                    throw new Error('localStorage is not supported');
                }
                const item = localStorage.getItem(key);
                data = item ? JSON.parse(item) : null;
            } 
            // Load from IndexedDB
            else {
                data = await this._loadFromIndexedDB(key);
            }
            
            // If data is not found locally and cloud is enabled, try to load from cloud
            if (data === null && useCloud && this.cloudEnabled && collection && !preferCloud) {
                data = await this._loadFromCloud(collection, key);
            }
            
            return data;
        } catch (error) {
            console.error('Error loading data:', error);
            return null;
        }
    }

    /**
     * Delete data from storage
     * @param {string} key - Storage key
     * @param {Object} options - Storage options
     * @param {boolean} options.useLocalStorage - Use localStorage instead of IndexedDB
     * @param {boolean} options.useCloud - Use cloud storage
     * @param {string} options.collection - Collection name for cloud storage
     * @returns {Promise<boolean>} Success status
     */
    async delete(key, options = {}) {
        const { useLocalStorage = false, useCloud = this.cloudEnabled, collection = null } = options;
        
        try {
            // Delete from localStorage if specified or if IndexedDB is not supported
            if (useLocalStorage || !this.isIndexedDBSupported) {
                if (!this.isLocalStorageSupported) {
                    throw new Error('localStorage is not supported');
                }
                localStorage.removeItem(key);
            } 
            // Delete from IndexedDB
            else {
                await this._deleteFromIndexedDB(key);
            }
            
            // Delete from cloud if enabled and configured
            if (useCloud && this.cloudEnabled && collection) {
                await this._deleteFromCloud(collection, key);
            }
            
            return true;
        } catch (error) {
            console.error('Error deleting data:', error);
            return false;
        }
    }

    /**
     * Save data to IndexedDB
     * @private
     * @param {string} storeName - Object store name
     * @param {any} data - Data to store
     * @returns {Promise<void>}
     */
    async _saveToIndexedDB(storeName, data) {
        if (!this.db) {
            await this._initIndexedDB();
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);
            
            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event.target.error);
        });
    }

    /**
     * Load data from IndexedDB
     * @private
     * @param {string} storeName - Object store name
     * @param {string} key - Key to load
     * @returns {Promise<any>}
     */
    async _loadFromIndexedDB(storeName, key = null) {
        if (!this.db) {
            await this._initIndexedDB();
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = key ? store.get(key) : store.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    /**
     * Delete data from IndexedDB
     * @private
     * @param {string} storeName - Object store name
     * @param {string} key - Key to delete
     * @returns {Promise<void>}
     */
    async _deleteFromIndexedDB(storeName, key) {
        if (!this.db) {
            await this._initIndexedDB();
        }
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);
            
            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event.target.error);
        });
    }

    /**
     * Save data to cloud storage
     * @private
     * @param {string} collection - Collection name
     * @param {string} docId - Document ID
     * @param {any} data - Data to store
     * @returns {Promise<void>}
     */
    async _saveToCloud(collection, docId, data) {
        // This is a placeholder for Firebase integration
        // Will be implemented when Firebase is configured
        console.log(`Cloud save: ${collection}/${docId}`);
        return Promise.resolve();
    }

    /**
     * Load data from cloud storage
     * @private
     * @param {string} collection - Collection name
     * @param {string} docId - Document ID
     * @returns {Promise<any>}
     */
    async _loadFromCloud(collection, docId) {
        // This is a placeholder for Firebase integration
        // Will be implemented when Firebase is configured
        console.log(`Cloud load: ${collection}/${docId}`);
        return Promise.resolve(null);
    }

    /**
     * Delete data from cloud storage
     * @private
     * @param {string} collection - Collection name
     * @param {string} docId - Document ID
     * @returns {Promise<void>}
     */
    async _deleteFromCloud(collection, docId) {
        // This is a placeholder for Firebase integration
        // Will be implemented when Firebase is configured
        console.log(`Cloud delete: ${collection}/${docId}`);
        return Promise.resolve();
    }

    /**
     * Get all items from a store
     * @param {string} storeName - Object store name
     * @param {Object} options - Options
     * @param {boolean} options.useLocalStorage - Use localStorage instead of IndexedDB
     * @returns {Promise<Array>} Array of items
     */
    async getAll(storeName, options = {}) {
        const { useLocalStorage = false } = options;
        
        try {
            // Use localStorage if specified or if IndexedDB is not supported
            if (useLocalStorage || !this.isIndexedDBSupported) {
                if (!this.isLocalStorageSupported) {
                    throw new Error('localStorage is not supported');
                }
                
                // Get all items with the prefix
                const prefix = `${storeName}_`;
                const items = [];
                
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key.startsWith(prefix)) {
                        const item = JSON.parse(localStorage.getItem(key));
                        items.push(item);
                    }
                }
                
                return items;
            } 
            // Use IndexedDB
            else {
                return await this._loadFromIndexedDB(storeName);
            }
        } catch (error) {
            console.error('Error getting all items:', error);
            return [];
        }
    }

    /**
     * Clear all data from a store
     * @param {string} storeName - Object store name
     * @param {Object} options - Options
     * @param {boolean} options.useLocalStorage - Use localStorage instead of IndexedDB
     * @param {boolean} options.useCloud - Use cloud storage
     * @param {string} options.collection - Collection name for cloud storage
     * @returns {Promise<boolean>} Success status
     */
    async clearStore(storeName, options = {}) {
        const { useLocalStorage = false, useCloud = this.cloudEnabled, collection = null } = options;
        
        try {
            // Clear localStorage if specified or if IndexedDB is not supported
            if (useLocalStorage || !this.isIndexedDBSupported) {
                if (!this.isLocalStorageSupported) {
                    throw new Error('localStorage is not supported');
                }
                
                // Remove all items with the prefix
                const prefix = `${storeName}_`;
                const keysToRemove = [];
                
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key.startsWith(prefix)) {
                        keysToRemove.push(key);
                    }
                }
                
                keysToRemove.forEach(key => localStorage.removeItem(key));
            } 
            // Clear IndexedDB
            else {
                if (!this.db) {
                    await this._initIndexedDB();
                }
                
                await new Promise((resolve, reject) => {
                    const transaction = this.db.transaction([storeName], 'readwrite');
                    const store = transaction.objectStore(storeName);
                    const request = store.clear();
                    
                    request.onsuccess = () => resolve();
                    request.onerror = (event) => reject(event.target.error);
                });
            }
            
            // Clear cloud if enabled and configured
            if (useCloud && this.cloudEnabled && collection) {
                // This is a placeholder for Firebase integration
                // Will be implemented when Firebase is configured
                console.log(`Cloud clear: ${collection}`);
            }
            
            return true;
        } catch (error) {
            console.error('Error clearing store:', error);
            return false;
        }
    }

    /**
     * Export all data to a JSON file
     * @returns {Promise<Blob>} JSON blob
     */
    async exportData() {
        try {
            const data = {};
            
            // Export data from all stores
            const stores = ['roster', 'monsters', 'parties', 'encounters', 'combats', 'settings'];
            
            for (const store of stores) {
                data[store] = await this.getAll(store);
            }
            
            // Create a JSON blob
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            
            return blob;
        } catch (error) {
            console.error('Error exporting data:', error);
            return null;
        }
    }

    /**
     * Import data from a JSON file
     * @param {Object} data - Imported data
     * @returns {Promise<boolean>} Success status
     */
    async importData(data) {
        try {
            // Import data to all stores
            const stores = ['roster', 'monsters', 'parties', 'encounters', 'combats', 'settings'];
            
            for (const store of stores) {
                if (data[store] && Array.isArray(data[store])) {
                    // Clear existing data
                    await this.clearStore(store);
                    
                    // Import new data
                    for (const item of data[store]) {
                        await this.save(store, item);
                    }
                }
            }
            
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    /**
     * Cache data with expiration
     * @param {string} key - Cache key
     * @param {any} data - Data to cache
     * @param {number} ttl - Time to live in milliseconds
     * @returns {Promise<boolean>} Success status
     */
    async cacheData(key, data, ttl = 3600000) { // Default: 1 hour
        try {
            const cacheItem = {
                id: key,
                data,
                timestamp: Date.now(),
                expiry: Date.now() + ttl
            };
            
            await this._saveToIndexedDB('cache', cacheItem);
            return true;
        } catch (error) {
            console.error('Error caching data:', error);
            return false;
        }
    }

    /**
     * Get cached data
     * @param {string} key - Cache key
     * @returns {Promise<any>} Cached data or null if expired/not found
     */
    async getCachedData(key) {
        try {
            const cacheItem = await this._loadFromIndexedDB('cache', key);
            
            if (!cacheItem) return null;
            
            // Check if cache has expired
            if (cacheItem.expiry < Date.now()) {
                await this._deleteFromIndexedDB('cache', key);
                return null;
            }
            
            return cacheItem.data;
        } catch (error) {
            console.error('Error getting cached data:', error);
            return null;
        }
    }

    /**
     * Clear expired cache items
     * @returns {Promise<number>} Number of items cleared
     */
    async clearExpiredCache() {
        try {
            if (!this.db) {
                await this._initIndexedDB();
            }
            
            const transaction = this.db.transaction(['cache'], 'readwrite');
            const store = transaction.objectStore('cache');
            const index = store.index('timestamp');
            const now = Date.now();
            
            // Get all cache items
            const cacheItems = await new Promise((resolve, reject) => {
                const request = index.openCursor();
                const items = [];
                
                request.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        items.push(cursor.value);
                        cursor.continue();
                    } else {
                        resolve(items);
                    }
                };
                
                request.onerror = (event) => reject(event.target.error);
            });
            
            // Delete expired items
            let deletedCount = 0;
            for (const item of cacheItems) {
                if (item.expiry < now) {
                    await this._deleteFromIndexedDB('cache', item.id);
                    deletedCount++;
                }
            }
            
            return deletedCount;
        } catch (error) {
            console.error('Error clearing expired cache:', error);
            return 0;
        }
    }
}

// Export the Storage class
export default Storage;
