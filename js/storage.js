/**
 * Storage module for Jesster's Combat Tracker
 * Handles data persistence
 */
class Storage {
    constructor() {
        // Storage options
        this.options = {
            prefix: 'jct_',
            useCompression: true,
            useEncryption: false,
            encryptionKey: '',
            storageType: 'auto', // auto, localStorage, indexedDB, memory
            maxLocalStorageSize: 5 * 1024 * 1024, // 5MB
            maxIndexedDBSize: 50 * 1024 * 1024 // 50MB
        };
        
        // In-memory storage
        this.memoryStorage = {};
        
        // IndexedDB database
        this.db = null;
        this.dbName = 'jessterCombatTracker';
        this.dbVersion = 1;
        
        // Initialize storage
        this._initStorage();
        
        console.log("Storage module initialized");
    }

    /**
     * Initialize storage
     * @private
     */
    async _initStorage() {
        // Check storage type
        if (this.options.storageType === 'auto') {
            // Determine best storage type
            if (this._isIndexedDBAvailable()) {
                this.options.storageType = 'indexedDB';
            } else if (this._isLocalStorageAvailable()) {
                this.options.storageType = 'localStorage';
            } else {
                this.options.storageType = 'memory';
                console.warn('Using in-memory storage. Data will not persist between sessions.');
            }
        }
        
        // Initialize IndexedDB if needed
        if (this.options.storageType === 'indexedDB') {
            await this._initIndexedDB();
        }
    }

    /**
     * Initialize IndexedDB
     * @private
     */
    async _initIndexedDB() {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                console.warn('IndexedDB not supported. Falling back to localStorage.');
                this.options.storageType = 'localStorage';
                resolve();
                return;
            }
            
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = (event) => {
                console.error('IndexedDB error:', event.target.error);
                console.warn('Falling back to localStorage.');
                this.options.storageType = 'localStorage';
                resolve();
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores
                if (!db.objectStoreNames.contains('data')) {
                    db.createObjectStore('data', { keyPath: 'key' });
                }
            };
        });
    }

    /**
     * Check if localStorage is available
     * @private
     * @returns {boolean} True if localStorage is available
     */
    _isLocalStorageAvailable() {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Check if IndexedDB is available
     * @private
     * @returns {boolean} True if IndexedDB is available
     */
    _isIndexedDBAvailable() {
        return !!window.indexedDB;
    }

    /**
     * Get full key with prefix
     * @private
     * @param {string} key - Key
     * @returns {string} Full key with prefix
     */
    _getFullKey(key) {
        return `${this.options.prefix}${key}`;
    }

    /**
     * Compress data
     * @private
     * @param {*} data - Data to compress
     * @returns {string} Compressed data
     */
    _compress(data) {
        if (!this.options.useCompression) {
            return JSON.stringify(data);
        }
        
        try {
            const jsonString = JSON.stringify(data);
            
            // Use LZ-based compression if available
            if (window.LZString) {
                return window.LZString.compress(jsonString);
            }
            
            // Fallback to simple compression
            return jsonString;
        } catch (error) {
            console.error('Compression error:', error);
            return JSON.stringify(data);
        }
    }

    /**
     * Decompress data
     * @private
     * @param {string} compressedData - Compressed data
     * @returns {*} Decompressed data
     */
    _decompress(compressedData) {
        if (!compressedData) return null;
        
        if (!this.options.useCompression) {
            return JSON.parse(compressedData);
        }
        
        try {
            // Use LZ-based decompression if available
            if (window.LZString && typeof compressedData === 'string' && !compressedData.startsWith('{')) {
                const jsonString = window.LZString.decompress(compressedData);
                return JSON.parse(jsonString);
            }
            
            // Fallback to simple decompression
            return JSON.parse(compressedData);
        } catch (error) {
            console.error('Decompression error:', error);
            return null;
        }
    }

    /**
     * Encrypt data
     * @private
     * @param {string} data - Data to encrypt
     * @returns {string} Encrypted data
     */
    _encrypt(data) {
        if (!this.options.useEncryption || !this.options.encryptionKey) {
            return data;
        }
        
        try {
            // Simple XOR encryption for demonstration
            // In a real app, use a proper encryption library
            const key = this.options.encryptionKey;
            let result = '';
            
            for (let i = 0; i < data.length; i++) {
                const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
                result += String.fromCharCode(charCode);
            }
            
            return btoa(result); // Base64 encode
        } catch (error) {
            console.error('Encryption error:', error);
            return data;
        }
    }

    /**
     * Decrypt data
     * @private
     * @param {string} encryptedData - Encrypted data
     * @returns {string} Decrypted data
     */
    _decrypt(encryptedData) {
        if (!this.options.useEncryption || !this.options.encryptionKey) {
            return encryptedData;
        }
        
        try {
            // Simple XOR decryption for demonstration
            const key = this.options.encryptionKey;
            const data = atob(encryptedData); // Base64 decode
            let result = '';
            
            for (let i = 0; i < data.length; i++) {
                const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
                result += String.fromCharCode(charCode);
            }
            
            return result;
        } catch (error) {
            console.error('Decryption error:', error);
            return encryptedData;
        }
    }

    /**
     * Process data for storage
     * @private
     * @param {*} data - Data to process
     * @returns {string} Processed data
     */
    _processForStorage(data) {
        const compressed = this._compress(data);
        return this.options.useEncryption ? this._encrypt(compressed) : compressed;
    }

    /**
     * Process data from storage
     * @private
     * @param {string} data - Data to process
     * @returns {*} Processed data
     */
    _processFromStorage(data) {
        const decrypted = this.options.useEncryption ? this._decrypt(data) : data;
        return this._decompress(decrypted);
    }

    /**
     * Save data to localStorage
     * @private
     * @param {string} key - Key
     * @param {*} data - Data to save
     * @returns {Promise<boolean>} Success status
     */
    async _saveToLocalStorage(key, data) {
        try {
            const fullKey = this._getFullKey(key);
            const processedData = this._processForStorage(data);
            
            // Check size
            if (processedData.length > this.options.maxLocalStorageSize) {
                console.error(`Data for key ${key} exceeds maximum localStorage size`);
                return false;
            }
            
            localStorage.setItem(fullKey, processedData);
            return true;
        } catch (error) {
            console.error(`Error saving to localStorage (${key}):`, error);
            return false;
        }
    }

    /**
     * Load data from localStorage
     * @private
     * @param {string} key - Key
     * @returns {Promise<*>} Loaded data
     */
    async _loadFromLocalStorage(key) {
        try {
            const fullKey = this._getFullKey(key);
            const data = localStorage.getItem(fullKey);
            
            if (data === null) {
                return null;
            }
            
            return this._processFromStorage(data);
        } catch (error) {
            console.error(`Error loading from localStorage (${key}):`, error);
            return null;
        }
    }

    /**
     * Delete data from localStorage
     * @private
     * @param {string} key - Key
     * @returns {Promise<boolean>} Success status
     */
    async _deleteFromLocalStorage(key) {
        try {
            const fullKey = this._getFullKey(key);
            localStorage.removeItem(fullKey);
            return true;
        } catch (error) {
            console.error(`Error deleting from localStorage (${key}):`, error);
            return false;
        }
    }

    /**
     * Save data to IndexedDB
     * @private
     * @param {string} key - Key
     * @param {*} data - Data to save
     * @returns {Promise<boolean>} Success status
     */
    async _saveToIndexedDB(key, data) {
        return new Promise((resolve) => {
            if (!this.db) {
                console.error('IndexedDB not initialized');
                resolve(false);
                return;
            }
            
            try {
                const transaction = this.db.transaction(['data'], 'readwrite');
                const objectStore = transaction.objectStore('data');
                
                const processedData = this._processForStorage(data);
                
                // Check size
                if (processedData.length > this.options.maxIndexedDBSize) {
                    console.error(`Data for key ${key} exceeds maximum IndexedDB size`);
                    resolve(false);
                    return;
                }
                
                const request = objectStore.put({
                    key: key,
                    value: processedData,
                    timestamp: Date.now()
                });
                
                request.onsuccess = () => {
                    resolve(true);
                };
                
                request.onerror = (event) => {
                    console.error(`Error saving to IndexedDB (${key}):`, event.target.error);
                    resolve(false);
                };
            } catch (error) {
                console.error(`Error saving to IndexedDB (${key}):`, error);
                resolve(false);
            }
        });
    }

    /**
     * Load data from IndexedDB
     * @private
     * @param {string} key - Key
     * @returns {Promise<*>} Loaded data
     */
    async _loadFromIndexedDB(key) {
        return new Promise((resolve) => {
            if (!this.db) {
                console.error('IndexedDB not initialized');
                resolve(null);
                return;
            }
            
            try {
                const transaction = this.db.transaction(['data'], 'readonly');
                const objectStore = transaction.objectStore('data');
                const request = objectStore.get(key);
                
                request.onsuccess = (event) => {
                    const result = event.target.result;
                    if (!result) {
                        resolve(null);
                        return;
                    }
                    
                    resolve(this._processFromStorage(result.value));
                };
                
                request.onerror = (event) => {
                    console.error(`Error loading from IndexedDB (${key}):`, event.target.error);
                    resolve(null);
                };
            } catch (error) {
                console.error(`Error loading from IndexedDB (${key}):`, error);
                resolve(null);
            }
        });
    }

    /**
     * Delete data from IndexedDB
     * @private
     * @param {string} key - Key
     * @returns {Promise<boolean>} Success status
     */
    async _deleteFromIndexedDB(key) {
        return new Promise((resolve) => {
            if (!this.db) {
                console.error('IndexedDB not initialized');
                resolve(false);
                return;
            }
            
            try {
                const transaction = this.db.transaction(['data'], 'readwrite');
                const objectStore = transaction.objectStore('data');
                const request = objectStore.delete(key);
                
                request.onsuccess = () => {
                    resolve(true);
                };
                
                request.onerror = (event) => {
                    console.error(`Error deleting from IndexedDB (${key}):`, event.target.error);
                    resolve(false);
                };
            } catch (error) {
                console.error(`Error deleting from IndexedDB (${key}):`, error);
                resolve(false);
            }
        });
    }

    /**
     * Save data to memory storage
     * @private
     * @param {string} key - Key
     * @param {*} data - Data to save
     * @returns {Promise<boolean>} Success status
     */
    async _saveToMemory(key, data) {
        try {
            this.memoryStorage[key] = {
                value: data,
                timestamp: Date.now()
            };
            return true;
        } catch (error) {
            console.error(`Error saving to memory (${key}):`, error);
            return false;
        }
    }

    /**
     * Load data from memory storage
     * @private
     * @param {string} key - Key
     * @returns {Promise<*>} Loaded data
     */
    async _loadFromMemory(key) {
        try {
            const item = this.memoryStorage[key];
            return item ? item.value : null;
        } catch (error) {
            console.error(`Error loading from memory (${key}):`, error);
            return null;
        }
    }

    /**
     * Delete data from memory storage
     * @private
     * @param {string} key - Key
     * @returns {Promise<boolean>} Success status
     */
    async _deleteFromMemory(key) {
        try {
            delete this.memoryStorage[key];
            return true;
        } catch (error) {
            console.error(`Error deleting from memory (${key}):`, error);
            return false;
        }
    }

    /**
     * Save data
     * @param {string} key - Key
     * @param {*} data - Data to save
     * @param {Object} options - Save options
     * @param {boolean} options.useLocalStorage - Force using localStorage
     * @returns {Promise<boolean>} Success status
     */
    async save(key, data, options = {}) {
        // Determine storage type
        let storageType = this.options.storageType;
        if (options.useLocalStorage) {
            storageType = 'localStorage';
        }
        
        // Save data
        switch (storageType) {
            case 'localStorage':
                return await this._saveToLocalStorage(key, data);
            case 'indexedDB':
                return await this._saveToIndexedDB(key, data);
            case 'memory':
                return await this._saveToMemory(key, data);
            default:
                console.error(`Unknown storage type: ${storageType}`);
                return false;
        }
    }

    /**
     * Load data
     * @param {string} key - Key
     * @param {Object} options - Load options
     * @param {boolean} options.useLocalStorage - Force using localStorage
     * @returns {Promise<*>} Loaded data
     */
    async load(key, options = {}) {
        // Determine storage type
        let storageType = this.options.storageType;
        if (options.useLocalStorage) {
            storageType = 'localStorage';
        }
        
        // Load data
        switch (storageType) {
            case 'localStorage':
                return await this._loadFromLocalStorage(key);
            case 'indexedDB':
                return await this._loadFromIndexedDB(key);
            case 'memory':
                return await this._loadFromMemory(key);
            default:
                console.error(`Unknown storage type: ${storageType}`);
                return null;
        }
    }

    /**
     * Delete data
     * @param {string} key - Key
     * @param {Object} options - Delete options
     * @param {boolean} options.useLocalStorage - Force using localStorage
     * @returns {Promise<boolean>} Success status
     */
    async delete(key, options = {}) {
        // Determine storage type
        let storageType = this.options.storageType;
        if (options.useLocalStorage) {
            storageType = 'localStorage';
        }
        
        // Delete data
        switch (storageType) {
            case 'localStorage':
                return await this._deleteFromLocalStorage(key);
            case 'indexedDB':
                return await this._deleteFromIndexedDB(key);
            case 'memory':
                return await this._deleteFromMemory(key);
            default:
                console.error(`Unknown storage type: ${storageType}`);
                return false;
        }
    }

    /**
     * Check if data exists
     * @param {string} key - Key
     * @param {Object} options - Options
     * @param {boolean} options.useLocalStorage - Force using localStorage
     * @returns {Promise<boolean>} True if data exists
     */
    async exists(key, options = {}) {
        const data = await this.load(key, options);
        return data !== null;
    }

    /**
     * Get all keys
     * @param {Object} options - Options
     * @param {boolean} options.useLocalStorage - Force using localStorage
     * @returns {Promise<Array>} Keys
     */
    async getKeys(options = {}) {
        // Determine storage type
        let storageType = this.options.storageType;
        if (options.useLocalStorage) {
            storageType = 'localStorage';
        }
        
        // Get keys
        switch (storageType) {
            case 'localStorage':
                try {
                    const keys = [];
                    const prefix = this.options.prefix;
                    
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key.startsWith(prefix)) {
                            keys.push(key.substring(prefix.length));
                        }
                    }
                    
                    return keys;
                } catch (error) {
                    console.error('Error getting keys from localStorage:', error);
                    return [];
                }
            case 'indexedDB':
                return new Promise((resolve) => {
                    if (!this.db) {
                        console.error('IndexedDB not initialized');
                        resolve([]);
                        return;
                    }
                    
                    try {
                        const transaction = this.db.transaction(['data'], 'readonly');
                        const objectStore = transaction.objectStore('data');
                        const request = objectStore.getAllKeys();
                        
                        request.onsuccess = (event) => {
                            resolve(event.target.result);
                        };
                        
                        request.onerror = (event) => {
                            console.error('Error getting keys from IndexedDB:', event.target.error);
                            resolve([]);
                        };
                    } catch (error) {
                        console.error('Error getting keys from IndexedDB:', error);
                        resolve([]);
                    }
                });
            case 'memory':
                return Object.keys(this.memoryStorage);
            default:
                console.error(`Unknown storage type: ${storageType}`);
                return [];
        }
    }

    /**
     * Get all data
     * @param {string} keyPrefix - Key prefix
     * @param {Object} options - Options
     * @param {boolean} options.useLocalStorage - Force using localStorage
     * @returns {Promise<Array>} Data
     */
    async getAll(keyPrefix = '', options = {}) {
        const keys = await this.getKeys(options);
        const filteredKeys = keyPrefix ? keys.filter(key => key.startsWith(keyPrefix)) : keys;
        
        const results = [];
        for (const key of filteredKeys) {
            const data = await this.load(key, options);
            if (data !== null) {
                results.push(data);
            }
        }
        
        return results;
    }

    /**
     * Clear all data
     * @param {Object} options - Options
     * @param {boolean} options.useLocalStorage - Force using localStorage
     * @returns {Promise<boolean>} Success status
     */
    async clear(options = {}) {
        // Determine storage type
        let storageType = this.options.storageType;
        if (options.useLocalStorage) {
            storageType = 'localStorage';
        }
        
        // Clear data
        switch (storageType) {
            case 'localStorage':
                try {
                    const prefix = this.options.prefix;
                    const keysToRemove = [];
                    
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key.startsWith(prefix)) {
                            keysToRemove.push(key);
                        }
                    }
                    
                    keysToRemove.forEach(key => localStorage.removeItem(key));
                    return true;
                } catch (error) {
                    console.error('Error clearing localStorage:', error);
                    return false;
                }
            case 'indexedDB':
                return new Promise((resolve) => {
                    if (!this.db) {
                        console.error('IndexedDB not initialized');
                        resolve(false);
                        return;
                    }
                    
                    try {
                        const transaction = this.db.transaction(['data'], 'readwrite');
                        const objectStore = transaction.objectStore('data');
                        const request = objectStore.clear();
                        
                        request.onsuccess = () => {
                            resolve(true);
                        };
                        
                        request.onerror = (event) => {
                            console.error('Error clearing IndexedDB:', event.target.error);
                            resolve(false);
                        };
                    } catch (error) {
                        console.error('Error clearing IndexedDB:', error);
                        resolve(false);
                    }
                });
            case 'memory':
                this.memoryStorage = {};
                return true;
            default:
                console.error(`Unknown storage type: ${storageType}`);
                return false;
        }
    }

    /**
     * Set storage options
     * @param {Object} options - Storage options
     * @returns {Promise<boolean>} Success status
     */
    async setOptions(options) {
        // Update options
        this.options = { ...this.options, ...options };
        
        // Reinitialize storage if storage type changed
        if (options.storageType) {
            await this._initStorage();
        }
        
        return true;
    }

    /**
     * Get storage options
     * @returns {Object} Storage options
     */
    getOptions() {
        return { ...this.options };
    }

    /**
     * Get storage type
     * @returns {string} Storage type
     */
    getStorageType() {
        return this.options.storageType;
    }

    /**
     * Get storage usage
     * @returns {Promise<Object>} Storage usage
     */
    async getStorageUsage() {
        switch (this.options.storageType) {
            case 'localStorage':
                try {
                    let totalSize = 0;
                    const prefix = this.options.prefix;
                    
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key.startsWith(prefix)) {
                            totalSize += localStorage.getItem(key).length * 2; // UTF-16 characters (2 bytes each)
                        }
                    }
                    
                    return {
                        used: totalSize,
                        total: this.options.maxLocalStorageSize,
                        percentage: (totalSize / this.options.maxLocalStorageSize) * 100
                    };
                } catch (error) {
                    console.error('Error getting localStorage usage:', error);
                    return { used: 0, total: 0, percentage: 0 };
                }
            case 'indexedDB':
                // Estimating IndexedDB usage is complex and browser-dependent
                // This is a simplified approach
                return new Promise((resolve) => {
                    if (!this.db) {
                        resolve({ used: 0, total: this.options.maxIndexedDBSize, percentage: 0 });
                        return;
                    }
                    
                    try {
                        const transaction = this.db.transaction(['data'], 'readonly');
                        const objectStore = transaction.objectStore('data');
                        const request = objectStore.getAll();
                        
                        request.onsuccess = (event) => {
                            const data = event.target.result;
                            let totalSize = 0;
                            
                            data.forEach(item => {
                                totalSize += (item.value ? item.value.length : 0);
                            });
                            
                            resolve({
                                used: totalSize,
                                total: this.options.maxIndexedDBSize,
                                percentage: (totalSize / this.options.maxIndexedDBSize) * 100
                            });
                        };
                        
                        request.onerror = () => {
                            resolve({ used: 0, total: this.options.maxIndexedDBSize, percentage: 0 });
                        };
                    } catch (error) {
                        console.error('Error getting IndexedDB usage:', error);
                        resolve({ used: 0, total: this.options.maxIndexedDBSize, percentage: 0 });
                    }
                });
            case 'memory':
                let totalSize = 0;
                
                Object.values(this.memoryStorage).forEach(item => {
                    try {
                        totalSize += JSON.stringify(item).length;
                    } catch (e) {
                        // Ignore errors
                    }
                });
                
                return {
                    used: totalSize,
                    total: Infinity,
                    percentage: 0
                };
            default:
                return { used: 0, total: 0, percentage: 0 };
        }
    }

    /**
     * Export all data
     * @returns {Promise<Object>} Exported data
     */
    async exportData() {
        const keys = await this.getKeys();
        const data = {};
        
        for (const key of keys) {
            data[key] = await this.load(key);
        }
        
        return {
            data,
            timestamp: Date.now(),
            version: '1.0'
        };
    }

    /**
     * Import data
     * @param {Object} importData - Data to import
     * @returns {Promise<Object>} Import result
     */
    async importData(importData) {
        if (!importData || !importData.data) {
            return { success: false, message: 'Invalid import data' };
        }
        
        try {
            const keys = Object.keys(importData.data);
            let successCount = 0;
            let failCount = 0;
            
            for (const key of keys) {
                const success = await this.save(key, importData.data[key]);
                if (success) {
                    successCount++;
                } else {
                    failCount++;
                }
            }
            
            return {
                success: true,
                message: `Imported ${successCount} items successfully, ${failCount} failed`,
                successCount,
                failCount,
                totalCount: keys.length
            };
        } catch (error) {
            console.error('Error importing data:', error);
            return { success: false, message: `Error importing data: ${error.message}` };
        }
    }

    /**
     * Backup data to file
     * @param {string} filename - Filename
     * @returns {Promise<boolean>} Success status
     */
    async backupToFile(filename = 'jct-backup.json') {
        try {
            const exportData = await this.exportData();
            const json = JSON.stringify(exportData);
            
            // Create download link
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            
            // Trigger download
            document.body.appendChild(a);
            a.click();
            
            // Clean up
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
            
            return true;
        } catch (error) {
            console.error('Error backing up data:', error);
            return false;
        }
    }

    /**
     * Restore data from file
     * @param {File} file - File to restore from
     * @returns {Promise<Object>} Restore result
     */
    async restoreFromFile(file) {
        return new Promise((resolve) => {
            if (!file) {
                resolve({ success: false, message: 'No file provided' });
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = async (event) => {
                try {
                    const importData = JSON.parse(event.target.result);
                    const result = await this.importData(importData);
                    resolve(result);
                } catch (error) {
                    console.error('Error restoring data:', error);
                    resolve({ success: false, message: `Error restoring data: ${error.message}` });
                }
            };
            
            reader.onerror = () => {
                resolve({ success: false, message: 'Error reading file' });
            };
            
            reader.readAsText(file);
        });
    }
}

// Export the Storage class
export default Storage;
