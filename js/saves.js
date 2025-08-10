/**
 * Jesster's Combat Tracker
 * Saves Module
 * Version 2.3.1
 * 
 * This module handles saving and loading data, including encounters, characters, and settings.
 * It supports multiple storage methods including localStorage, IndexedDB, and file system.
 */

/**
 * Storage types
 */
export const StorageType = {
  LOCAL_STORAGE: 'localStorage',
  INDEXED_DB: 'indexedDB',
  FILE_SYSTEM: 'fileSystem',
  CLOUD: 'cloud'
};

/**
 * Save types
 */
export const SaveType = {
  ENCOUNTER: 'encounter',
  PLAYER: 'player',
  MONSTER: 'monster',
  SETTINGS: 'settings',
  TEMPLATE: 'template',
  BACKUP: 'backup'
};

/**
 * Class for managing saves
 */
export class SaveManager {
  /**
   * Create a save manager
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      defaultStorageType: options.defaultStorageType || StorageType.LOCAL_STORAGE,
      autoSave: options.autoSave !== undefined ? options.autoSave : true,
      autoSaveInterval: options.autoSaveInterval || 60000, // 1 minute
      maxAutoSaves: options.maxAutoSaves || 5,
      backupInterval: options.backupInterval || 86400000, // 1 day
      maxBackups: options.maxBackups || 3,
      ...options
    };
    
    this.storageHandlers = {
      [StorageType.LOCAL_STORAGE]: new LocalStorageHandler(),
      [StorageType.INDEXED_DB]: new IndexedDBHandler(),
      [StorageType.FILE_SYSTEM]: new FileSystemHandler(),
      [StorageType.CLOUD]: options.cloudHandler || null
    };
    
    this.listeners = [];
    this.autoSaveTimer = null;
    this.backupTimer = null;
    this.lastSaveTime = Date.now();
    this.lastBackupTime = Date.now();
    
    // Initialize
    this._init();
  }

  /**
   * Initialize the save manager
   * @private
   */
  async _init() {
    // Initialize storage handlers
    for (const handler of Object.values(this.storageHandlers)) {
      if (handler) {
        try {
          await handler.init();
        } catch (error) {
          console.error(`Failed to initialize storage handler:`, error);
        }
      }
    }
    
    // Start auto-save timer if enabled
    if (this.options.autoSave) {
      this._startAutoSave();
    }
    
    // Start backup timer
    this._startBackupTimer();
    
    // Notify listeners
    this._notifyListeners('initialized', {});
  }

  /**
   * Start the auto-save timer
   * @private
   */
  _startAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
    
    this.autoSaveTimer = setInterval(() => {
      this.autoSave();
    }, this.options.autoSaveInterval);
  }

  /**
   * Start the backup timer
   * @private
   */
  _startBackupTimer() {
    if (this.backupTimer) {
      clearInterval(this.backupTimer);
    }
    
    this.backupTimer = setInterval(() => {
      this.createBackup();
    }, this.options.backupInterval);
  }

  /**
   * Perform an auto-save
   */
  async autoSave() {
    try {
      // Get current state from listeners
      const state = this._getStateFromListeners();
      
      if (!state) {
        return;
      }
      
      // Create auto-save name with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const saveName = `autosave-${timestamp}`;
      
      // Save the state
      await this.saveEncounter(saveName, state, true);
      
      // Clean up old auto-saves
      await this._cleanupAutoSaves();
      
      this.lastSaveTime = Date.now();
      this._notifyListeners('autoSave', { name: saveName });
    } catch (error) {
      console.error('Auto-save failed:', error);
      this._notifyListeners('autoSaveFailed', { error });
    }
  }

  /**
   * Create a backup of all data
   */
  async createBackup() {
    try {
      // Get all data to back up
      const data = {
        encounters: await this.getAllEncounters(),
        players: await this.getAllPlayers(),
        monsters: await this.getAllMonsters(),
        settings: await this.getSettings(),
        templates: await this.getAllTemplates(),
        version: '2.3.1',
        timestamp: new Date().toISOString()
      };
      
      // Create backup name with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `backup-${timestamp}`;
      
      // Save the backup
      await this.saveData(SaveType.BACKUP, backupName, data);
      
      // Clean up old backups
      await this._cleanupBackups();
      
      this.lastBackupTime = Date.now();
      this._notifyListeners('backupCreated', { name: backupName });
      
      return backupName;
    } catch (error) {
      console.error('Backup failed:', error);
      this._notifyListeners('backupFailed', { error });
      throw error;
    }
  }

  /**
   * Clean up old auto-saves
   * @private
   */
  async _cleanupAutoSaves() {
    try {
      // Get all auto-saves
      const autoSaves = await this.getAutoSaves();
      
      // Sort by date (newest first)
      autoSaves.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // Keep only the most recent ones
      if (autoSaves.length > this.options.maxAutoSaves) {
        for (let i = this.options.maxAutoSaves; i < autoSaves.length; i++) {
          await this.deleteEncounter(autoSaves[i].name);
        }
      }
    } catch (error) {
      console.error('Failed to clean up auto-saves:', error);
    }
  }

  /**
   * Clean up old backups
   * @private
   */
  async _cleanupBackups() {
    try {
      // Get all backups
      const backups = await this.getBackups();
      
      // Sort by date (newest first)
      backups.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // Keep only the most recent ones
      if (backups.length > this.options.maxBackups) {
        for (let i = this.options.maxBackups; i < backups.length; i++) {
          await this.deleteData(SaveType.BACKUP, backups[i].name);
        }
      }
    } catch (error) {
      console.error('Failed to clean up backups:', error);
    }
  }

  /**
   * Get state from listeners
   * @returns {Object|null} The current state or null if no listeners provide state
   * @private
   */
  _getStateFromListeners() {
    let state = null;
    
    for (const listener of this.listeners) {
      if (typeof listener.getState === 'function') {
        state = listener.getState();
        if (state) break;
      }
    }
    
    return state;
  }

  /**
   * Save an encounter
   * @param {string} name - The name of the save
   * @param {Object} data - The encounter data to save
   * @param {boolean} isAutoSave - Whether this is an auto-save
   * @param {string} storageType - The storage type to use
   * @returns {Promise<Object>} The saved data
   */
  async saveEncounter(name, data, isAutoSave = false, storageType = null) {
    const storage = this._getStorageHandler(storageType);
    
    // Add metadata
    const saveData = {
      ...data,
      meta: {
        name,
        date: new Date().toISOString(),
        isAutoSave,
        version: '2.3.1'
      }
    };
    
    try {
      await storage.saveData(SaveType.ENCOUNTER, name, saveData);
      this._notifyListeners('encounterSaved', { name, isAutoSave });
      return saveData;
    } catch (error) {
      this._notifyListeners('saveFailed', { name, error });
      throw error;
    }
  }

  /**
   * Load an encounter
   * @param {string} name - The name of the save to load
   * @param {string} storageType - The storage type to use
   * @returns {Promise<Object>} The loaded data
   */
  async loadEncounter(name, storageType = null) {
    const storage = this._getStorageHandler(storageType);
    
    try {
      const data = await storage.loadData(SaveType.ENCOUNTER, name);
      this._notifyListeners('encounterLoaded', { name, data });
      return data;
    } catch (error) {
      this._notifyListeners('loadFailed', { name, error });
      throw error;
    }
  }

  /**
   * Delete an encounter
   * @param {string} name - The name of the save to delete
   * @param {string} storageType - The storage type to use
   * @returns {Promise<boolean>} True if the save was deleted
   */
  async deleteEncounter(name, storageType = null) {
    const storage = this._getStorageHandler(storageType);
    
    try {
      await storage.deleteData(SaveType.ENCOUNTER, name);
      this._notifyListeners('encounterDeleted', { name });
      return true;
    } catch (error) {
      this._notifyListeners('deleteFailed', { name, error });
      throw error;
    }
  }

  /**
   * Get all encounters
   * @param {string} storageType - The storage type to use
   * @returns {Promise<Array>} Array of encounter metadata
   */
  async getAllEncounters(storageType = null) {
    const storage = this._getStorageHandler(storageType);
    
    try {
      const encounters = await storage.getAllData(SaveType.ENCOUNTER);
      return encounters.map(encounter => ({
        name: encounter.meta?.name || 'Unknown',
        date: encounter.meta?.date || new Date().toISOString(),
        isAutoSave: encounter.meta?.isAutoSave || false,
        version: encounter.meta?.version || '2.3.1'
      }));
    } catch (error) {
      console.error('Failed to get encounters:', error);
      return [];
    }
  }

  /**
   * Get auto-saves
   * @param {string} storageType - The storage type to use
   * @returns {Promise<Array>} Array of auto-save metadata
   */
  async getAutoSaves(storageType = null) {
    const encounters = await this.getAllEncounters(storageType);
    return encounters.filter(encounter => encounter.isAutoSave);
  }

  /**
   * Save a player
   * @param {string} name - The name of the save
   * @param {Object} data - The player data to save
   * @param {string} storageType - The storage type to use
   * @returns {Promise<Object>} The saved data
   */
  async savePlayer(name, data, storageType = null) {
    const storage = this._getStorageHandler(storageType);
    
    // Add metadata
    const saveData = {
      ...data,
      meta: {
        name,
        date: new Date().toISOString(),
        version: '2.3.1'
      }
    };
    
    try {
      await storage.saveData(SaveType.PLAYER, name, saveData);
      this._notifyListeners('playerSaved', { name });
      return saveData;
    } catch (error) {
      this._notifyListeners('saveFailed', { name, error });
      throw error;
    }
  }

  /**
   * Load a player
   * @param {string} name - The name of the save to load
   * @param {string} storageType - The storage type to use
   * @returns {Promise<Object>} The loaded data
   */
  async loadPlayer(name, storageType = null) {
    const storage = this._getStorageHandler(storageType);
    
    try {
      const data = await storage.loadData(SaveType.PLAYER, name);
      this._notifyListeners('playerLoaded', { name, data });
      return data;
    } catch (error) {
      this._notifyListeners('loadFailed', { name, error });
      throw error;
    }
  }

  /**
   * Delete a player
   * @param {string} name - The name of the save to delete
   * @param {string} storageType - The storage type to use
   * @returns {Promise<boolean>} True if the save was deleted
   */
  async deletePlayer(name, storageType = null) {
    const storage = this._getStorageHandler(storageType);
    
    try {
      await storage.deleteData(SaveType.PLAYER, name);
      this._notifyListeners('playerDeleted', { name });
      return true;
    } catch (error) {
      this._notifyListeners('deleteFailed', { name, error });
      throw error;
    }
  }

  /**
   * Get all players
   * @param {string} storageType - The storage type to use
   * @returns {Promise<Array>} Array of player metadata
   */
  async getAllPlayers(storageType = null) {
    const storage = this._getStorageHandler(storageType);
    
    try {
      const players = await storage.getAllData(SaveType.PLAYER);
      return players.map(player => ({
        name: player.meta?.name || 'Unknown',
        date: player.meta?.date || new Date().toISOString(),
        version: player.meta?.version || '2.3.1'
      }));
    } catch (error) {
      console.error('Failed to get players:', error);
      return [];
    }
  }

  /**
   * Save a monster
   * @param {string} name - The name of the save
   * @param {Object} data - The monster data to save
   * @param {string} storageType - The storage type to use
   * @returns {Promise<Object>} The saved data
   */
  async saveMonster(name, data, storageType = null) {
    const storage = this._getStorageHandler(storageType);
    
    // Add metadata
    const saveData = {
      ...data,
      meta: {
        name,
        date: new Date().toISOString(),
        version: '2.3.1'
      }
    };
    
    try {
      await storage.saveData(SaveType.MONSTER, name, saveData);
      this._notifyListeners('monsterSaved', { name });
      return saveData;
    } catch (error) {
      this._notifyListeners('saveFailed', { name, error });
      throw error;
    }
  }

  /**
   * Load a monster
   * @param {string} name - The name of the save to load
   * @param {string} storageType - The storage type to use
   * @returns {Promise<Object>} The loaded data
   */
  async loadMonster(name, storageType = null) {
    const storage = this._getStorageHandler(storageType);
    
    try {
      const data = await storage.loadData(SaveType.MONSTER, name);
      this._notifyListeners('monsterLoaded', { name, data });
      return data;
    } catch (error) {
      this._notifyListeners('loadFailed', { name, error });
      throw error;
    }
  }

  /**
   * Delete a monster
   * @param {string} name - The name of the save to delete
   * @param {string} storageType - The storage type to use
   * @returns {Promise<boolean>} True if the save was deleted
   */
  async deleteMonster(name, storageType = null) {
    const storage = this._getStorageHandler(storageType);
    
    try {
      await storage.deleteData(SaveType.MONSTER, name);
      this._notifyListeners('monsterDeleted', { name });
      return true;
    } catch (error) {
      this._notifyListeners('deleteFailed', { name, error });
      throw error;
    }
  }

  /**
   * Get all monsters
   * @param {string} storageType - The storage type to use
   * @returns {Promise<Array>} Array of monster metadata
   */
  async getAllMonsters(storageType = null) {
    const storage = this._getStorageHandler(storageType);
    
    try {
      const monsters = await storage.getAllData(SaveType.MONSTER);
      return monsters.map(monster => ({
        name: monster.meta?.name || 'Unknown',
        date: monster.meta?.date || new Date().toISOString(),
        version: monster.meta?.version || '2.3.1'
      }));
    } catch (error) {
      console.error('Failed to get monsters:', error);
      return [];
    }
  }

  /**
   * Save settings
   * @param {Object} data - The settings data to save
   * @param {string} storageType - The storage type to use
   * @returns {Promise<Object>} The saved data
   */
  async saveSettings(data, storageType = null) {
    const storage = this._getStorageHandler(storageType);
    
    // Add metadata
    const saveData = {
      ...data,
      meta: {
        date: new Date().toISOString(),
        version: '2.3.1'
      }
    };
    
    try {
      await storage.saveData(SaveType.SETTINGS, 'settings', saveData);
      this._notifyListeners('settingsSaved', { data: saveData });
      return saveData;
    } catch (error) {
      this._notifyListeners('saveFailed', { name: 'settings', error });
      throw error;
    }
  }

  /**
   * Load settings
   * @param {string} storageType - The storage type to use
   * @returns {Promise<Object>} The loaded settings
   */
  async getSettings(storageType = null) {
    const storage = this._getStorageHandler(storageType);
    
    try {
      const data = await storage.loadData(SaveType.SETTINGS, 'settings');
      this._notifyListeners('settingsLoaded', { data });
      return data;
    } catch (error) {
      // Settings not found is not an error
      if (error.name === 'NotFoundError') {
        return {};
      }
      
      this._notifyListeners('loadFailed', { name: 'settings', error });
      throw error;
    }
  }

  /**
   * Save a template
   * @param {string} name - The name of the template
   * @param {Object} data - The template data to save
   * @param {string} storageType - The storage type to use
   * @returns {Promise<Object>} The saved data
   */
  async saveTemplate(name, data, storageType = null) {
    const storage = this._getStorageHandler(storageType);
    
    // Add metadata
    const saveData = {
      ...data,
      meta: {
        name,
        date: new Date().toISOString(),
        version: '2.3.1'
      }
    };
    
    try {
      await storage.saveData(SaveType.TEMPLATE, name, saveData);
      this._notifyListeners('templateSaved', { name });
      return saveData;
    } catch (error) {
      this._notifyListeners('saveFailed', { name, error });
      throw error;
    }
  }

  /**
   * Load a template
   * @param {string} name - The name of the template to load
   * @param {string} storageType - The storage type to use
   * @returns {Promise<Object>} The loaded data
   */
  async loadTemplate(name, storageType = null) {
    const storage = this._getStorageHandler(storageType);
    
    try {
      const data = await storage.loadData(SaveType.TEMPLATE, name);
      this._notifyListeners('templateLoaded', { name, data });
      return data;
    } catch (error) {
      this._notifyListeners('loadFailed', { name, error });
      throw error;
    }
  }

  /**
   * Delete a template
   * @param {string} name - The name of the template to delete
   * @param {string} storageType - The storage type to use
   * @returns {Promise<boolean>} True if the template was deleted
   */
  async deleteTemplate(name, storageType = null) {
    const storage = this._getStorageHandler(storageType);
    
    try {
      await storage.deleteData(SaveType.TEMPLATE, name);
      this._notifyListeners('templateDeleted', { name });
      return true;
    } catch (error) {
      this._notifyListeners('deleteFailed', { name, error });
      throw error;
    }
  }

  /**
   * Get all templates
   * @param {string} storageType - The storage type to use
   * @returns {Promise<Array>} Array of template metadata
   */
  async getAllTemplates(storageType = null) {
    const storage = this._getStorageHandler(storageType);
    
    try {
      const templates = await storage.getAllData(SaveType.TEMPLATE);
      return templates.map(template => ({
        name: template.meta?.name || 'Unknown',
        date: template.meta?.date || new Date().toISOString(),
        version: template.meta?.version || '2.3.1'
      }));
    } catch (error) {
      console.error('Failed to get templates:', error);
      return [];
    }
  }

  /**
   * Save generic data
   * @param {string} type - The type of data
   * @param {string} name - The name of the save
   * @param {Object} data - The data to save
   * @param {string} storageType - The storage type to use
   * @returns {Promise<Object>} The saved data
   */
  async saveData(type, name, data, storageType = null) {
    const storage = this._getStorageHandler(storageType);
    
    // Add metadata
    const saveData = {
      ...data,
      meta: {
        name,
        date: new Date().toISOString(),
        version: '2.3.1'
      }
    };
    
    try {
      await storage.saveData(type, name, saveData);
      this._notifyListeners('dataSaved', { type, name });
      return saveData;
    } catch (error) {
      this._notifyListeners('saveFailed', { type, name, error });
      throw error;
    }
  }

  /**
   * Load generic data
   * @param {string} type - The type of data
   * @param {string} name - The name of the save to load
   * @param {string} storageType - The storage type to use
   * @returns {Promise<Object>} The loaded data
   */
  async loadData(type, name, storageType = null) {
    const storage = this._getStorageHandler(storageType);
    
    try {
      const data = await storage.loadData(type, name);
      this._notifyListeners('dataLoaded', { type, name, data });
      return data;
    } catch (error) {
      this._notifyListeners('loadFailed', { type, name, error });
      throw error;
    }
  }

  /**
   * Delete generic data
   * @param {string} type - The type of data
   * @param {string} name - The name of the save to delete
   * @param {string} storageType - The storage type to use
   * @returns {Promise<boolean>} True if the save was deleted
   */
  async deleteData(type, name, storageType = null) {
    const storage = this._getStorageHandler(storageType);
    
    try {
      await storage.deleteData(type, name);
      this._notifyListeners('dataDeleted', { type, name });
      return true;
    } catch (error) {
      this._notifyListeners('deleteFailed', { type, name, error });
      throw error;
    }
  }

  /**
   * Get all data of a specific type
   * @param {string} type - The type of data
   * @param {string} storageType - The storage type to use
   * @returns {Promise<Array>} Array of data items
   */
  async getAllDataOfType(type, storageType = null) {
    const storage = this._getStorageHandler(storageType);
    
    try {
      return await storage.getAllData(type);
    } catch (error) {
      console.error(`Failed to get data of type ${type}:`, error);
      return [];
    }
  }

  /**
   * Get backups
   * @param {string} storageType - The storage type to use
   * @returns {Promise<Array>} Array of backup metadata
   */
  async getBackups(storageType = null) {
    const storage = this._getStorageHandler(storageType);
    
    try {
      const backups = await storage.getAllData(SaveType.BACKUP);
      return backups.map(backup => ({
        name: backup.meta?.name || 'Unknown',
        date: backup.meta?.date || new Date().toISOString(),
        version: backup.meta?.version || '2.3.1'
      }));
    } catch (error) {
      console.error('Failed to get backups:', error);
      return [];
    }
  }

  /**
   * Restore from a backup
   * @param {string} name - The name of the backup to restore
   * @param {string} storageType - The storage type to use
   * @returns {Promise<Object>} The restored data
   */
  async restoreFromBackup(name, storageType = null) {
    try {
      // Load the backup
      const backup = await this.loadData(SaveType.BACKUP, name, storageType);
      
      if (!backup) {
        throw new Error(`Backup ${name} not found`);
      }
      
      // Restore encounters
      if (backup.encounters) {
        for (const encounter of backup.encounters) {
          await this.saveEncounter(encounter.name, encounter, false, storageType);
        }
      }
      
      // Restore players
      if (backup.players) {
        for (const player of backup.players) {
          await this.savePlayer(player.name, player, storageType);
        }
      }
      
      // Restore monsters
      if (backup.monsters) {
        for (const monster of backup.monsters) {
          await this.saveMonster(monster.name, monster, storageType);
        }
      }
      
      // Restore settings
      if (backup.settings) {
        await this.saveSettings(backup.settings, storageType);
      }
      
      // Restore templates
      if (backup.templates) {
        for (const template of backup.templates) {
          await this.saveTemplate(template.name, template, storageType);
        }
      }
      
      this._notifyListeners('backupRestored', { name });
      return backup;
    } catch (error) {
      this._notifyListeners('restoreFailed', { name, error });
      throw error;
    }
  }

  /**
   * Export data to a file
   * @param {string} type - The type of data to export
   * @param {string} name - The name of the save to export
   * @returns {Promise<Blob>} The exported data as a Blob
   */
  async exportToFile(type, name) {
    try {
      // Load the data
      const data = await this.loadData(type, name);
      
      if (!data) {
        throw new Error(`Data ${name} of type ${type} not found`);
      }
      
      // Convert to JSON
      const json = JSON.stringify(data, null, 2);
      
      // Create a Blob
      const blob = new Blob([json], { type: 'application/json' });
      
      this._notifyListeners('dataExported', { type, name });
      return blob;
    } catch (error) {
      this._notifyListeners('exportFailed', { type, name, error });
      throw error;
    }
  }

  /**
   * Import data from a file
   * @param {File} file - The file to import
   * @returns {Promise<Object>} The imported data
   */
  async importFromFile(file) {
    try {
      // Read the file
      const text = await readFileAsText(file);
      
      // Parse the JSON
      const data = JSON.parse(text);
      
      if (!data || !data.meta) {
        throw new Error('Invalid data format');
      }
      
      // Determine the type and name
      const type = determineDataType(data);
      const name = data.meta.name || file.name.replace(/\.[^/.]+$/, '');
      
      // Save the data
      await this.saveData(type, name, data);
      
      this._notifyListeners('dataImported', { type, name, data });
      return { type, name, data };
    } catch (error) {
      this._notifyListeners('importFailed', { error });
      throw error;
    }
  }

  /**
   * Get a storage handler
   * @param {string} type - The storage type
   * @returns {Object} The storage handler
   * @private
   */
  _getStorageHandler(type) {
    const storageType = type || this.options.defaultStorageType;
    const handler = this.storageHandlers[storageType];
    
    if (!handler) {
      throw new Error(`Storage handler for type ${storageType} not found`);
    }
    
    return handler;
  }

  /**
   * Add a listener for save manager events
   * @param {Function|Object} listener - The listener function or object
   * @returns {Function} Function to remove the listener
   */
  addListener(listener) {
    if (typeof listener !== 'function' && typeof listener !== 'object') {
      console.error('Listener must be a function or an object');
      return () => {};
    }
    
    this.listeners.push(listener);
    
    // Return a function to remove this listener
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners of an event
   * @param {string} event - The event name
   * @param {Object} data - The event data
   * @private
   */
    _notifyListeners(event, data) {
    this.listeners.forEach(listener => {
      try {
        if (typeof listener === 'function') {
          listener(event, data);
        } else if (typeof listener === 'object' && typeof listener.onSaveEvent === 'function') {
          listener.onSaveEvent(event, data);
        }
      } catch (error) {
        console.error('Error in save manager listener:', error);
      }
    });
  }

  /**
   * Enable auto-save
   * @param {number} interval - The auto-save interval in milliseconds
   */
  enableAutoSave(interval = null) {
    this.options.autoSave = true;
    
    if (interval) {
      this.options.autoSaveInterval = interval;
    }
    
    this._startAutoSave();
    this._notifyListeners('autoSaveEnabled', { interval: this.options.autoSaveInterval });
  }

  /**
   * Disable auto-save
   */
  disableAutoSave() {
    this.options.autoSave = false;
    
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
    
    this._notifyListeners('autoSaveDisabled', {});
  }

  /**
   * Set the maximum number of auto-saves to keep
   * @param {number} max - The maximum number of auto-saves
   */
  setMaxAutoSaves(max) {
    this.options.maxAutoSaves = max;
    this._cleanupAutoSaves();
  }

  /**
   * Set the backup interval
   * @param {number} interval - The backup interval in milliseconds
   */
  setBackupInterval(interval) {
    this.options.backupInterval = interval;
    
    if (this.backupTimer) {
      clearInterval(this.backupTimer);
    }
    
    this._startBackupTimer();
  }

  /**
   * Set the maximum number of backups to keep
   * @param {number} max - The maximum number of backups
   */
  setMaxBackups(max) {
    this.options.maxBackups = max;
    this._cleanupBackups();
  }

  /**
   * Get the auto-save status
   * @returns {Object} The auto-save status
   */
  getAutoSaveStatus() {
    return {
      enabled: this.options.autoSave,
      interval: this.options.autoSaveInterval,
      maxAutoSaves: this.options.maxAutoSaves,
      lastSaveTime: this.lastSaveTime
    };
  }

  /**
   * Get the backup status
   * @returns {Object} The backup status
   */
  getBackupStatus() {
    return {
      interval: this.options.backupInterval,
      maxBackups: this.options.maxBackups,
      lastBackupTime: this.lastBackupTime
    };
  }

  /**
   * Check if a storage type is available
   * @param {string} storageType - The storage type to check
   * @returns {Promise<boolean>} True if the storage type is available
   */
  async isStorageAvailable(storageType) {
    try {
      const handler = this.storageHandlers[storageType];
      
      if (!handler) {
        return false;
      }
      
      return await handler.isAvailable();
    } catch (error) {
      return false;
    }
  }

  /**
   * Get available storage types
   * @returns {Promise<Array>} Array of available storage types
   */
  async getAvailableStorageTypes() {
    const available = [];
    
    for (const [type, handler] of Object.entries(this.storageHandlers)) {
      if (handler && await handler.isAvailable()) {
        available.push(type);
      }
    }
    
    return available;
  }

  /**
   * Set the default storage type
   * @param {string} storageType - The storage type to use
   * @returns {Promise<boolean>} True if the storage type was set
   */
  async setDefaultStorageType(storageType) {
    if (await this.isStorageAvailable(storageType)) {
      this.options.defaultStorageType = storageType;
      this._notifyListeners('defaultStorageChanged', { storageType });
      return true;
    }
    
    return false;
  }

  /**
   * Get the default storage type
   * @returns {string} The default storage type
   */
  getDefaultStorageType() {
    return this.options.defaultStorageType;
  }

  /**
   * Clean up all storage
   * @returns {Promise<boolean>} True if the storage was cleaned up
   */
  async cleanupStorage() {
    try {
      for (const handler of Object.values(this.storageHandlers)) {
        if (handler) {
          await handler.cleanup();
        }
      }
      
      this._notifyListeners('storageCleanup', {});
      return true;
    } catch (error) {
      console.error('Failed to clean up storage:', error);
      return false;
    }
  }
}

/**
 * Base class for storage handlers
 */
class StorageHandler {
  /**
   * Initialize the storage handler
   * @returns {Promise<void>}
   */
  async init() {
    // To be implemented by subclasses
  }

  /**
   * Check if the storage is available
   * @returns {Promise<boolean>} True if the storage is available
   */
  async isAvailable() {
    // To be implemented by subclasses
    return false;
  }

  /**
   * Save data
   * @param {string} type - The type of data
   * @param {string} name - The name of the save
   * @param {Object} data - The data to save
   * @returns {Promise<void>}
   */
  async saveData(type, name, data) {
    // To be implemented by subclasses
  }

  /**
   * Load data
   * @param {string} type - The type of data
   * @param {string} name - The name of the save
   * @returns {Promise<Object>} The loaded data
   */
  async loadData(type, name) {
    // To be implemented by subclasses
    return null;
  }

  /**
   * Delete data
   * @param {string} type - The type of data
   * @param {string} name - The name of the save
   * @returns {Promise<void>}
   */
  async deleteData(type, name) {
    // To be implemented by subclasses
  }

  /**
   * Get all data of a specific type
   * @param {string} type - The type of data
   * @returns {Promise<Array>} Array of data items
   */
  async getAllData(type) {
    // To be implemented by subclasses
    return [];
  }

  /**
   * Clean up the storage
   * @returns {Promise<void>}
   */
  async cleanup() {
    // To be implemented by subclasses
  }
}

/**
 * Local storage handler
 */
class LocalStorageHandler extends StorageHandler {
  /**
   * Initialize the local storage handler
   * @returns {Promise<void>}
   */
  async init() {
    // Nothing to initialize for localStorage
  }

  /**
   * Check if local storage is available
   * @returns {Promise<boolean>} True if local storage is available
   */
  async isAvailable() {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Save data to local storage
   * @param {string} type - The type of data
   * @param {string} name - The name of the save
   * @param {Object} data - The data to save
   * @returns {Promise<void>}
   */
  async saveData(type, name, data) {
    try {
      const key = this._getStorageKey(type, name);
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        throw new Error('Local storage quota exceeded');
      }
      throw error;
    }
  }

  /**
   * Load data from local storage
   * @param {string} type - The type of data
   * @param {string} name - The name of the save
   * @returns {Promise<Object>} The loaded data
   */
  async loadData(type, name) {
    const key = this._getStorageKey(type, name);
    const data = localStorage.getItem(key);
    
    if (!data) {
      const error = new Error(`Data not found: ${type}/${name}`);
      error.name = 'NotFoundError';
      throw error;
    }
    
    try {
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`Failed to parse data: ${error.message}`);
    }
  }

  /**
   * Delete data from local storage
   * @param {string} type - The type of data
   * @param {string} name - The name of the save
   * @returns {Promise<void>}
   */
  async deleteData(type, name) {
    const key = this._getStorageKey(type, name);
    localStorage.removeItem(key);
  }

  /**
   * Get all data of a specific type from local storage
   * @param {string} type - The type of data
   * @returns {Promise<Array>} Array of data items
   */
  async getAllData(type) {
    const prefix = `jct_${type}_`;
    const keys = [];
    
    // Find all keys with the prefix
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(prefix)) {
        keys.push(key);
      }
    }
    
    // Load all data
    const data = [];
    for (const key of keys) {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          data.push(JSON.parse(item));
        }
      } catch (error) {
        console.error(`Failed to parse data for key ${key}:`, error);
      }
    }
    
    return data;
  }

  /**
   * Clean up local storage
   * @returns {Promise<void>}
   */
  async cleanup() {
    const prefix = 'jct_';
    const keysToRemove = [];
    
    // Find all keys with the prefix
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }
    
    // Remove all keys
    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }
  }

  /**
   * Get the storage key for a type and name
   * @param {string} type - The type of data
   * @param {string} name - The name of the save
   * @returns {string} The storage key
   * @private
   */
  _getStorageKey(type, name) {
    return `jct_${type}_${name}`;
  }
}

/**
 * IndexedDB storage handler
 */
class IndexedDBHandler extends StorageHandler {
  /**
   * Create an IndexedDB storage handler
   */
  constructor() {
    super();
    this.dbName = 'JessterCombatTracker';
    this.dbVersion = 1;
    this.db = null;
  }

  /**
   * Initialize the IndexedDB storage handler
   * @returns {Promise<void>}
   */
  async init() {
    if (!window.indexedDB) {
      throw new Error('IndexedDB is not supported in this browser');
    }
    
    try {
      this.db = await this._openDatabase();
    } catch (error) {
      console.error('Failed to open IndexedDB:', error);
      throw error;
    }
  }

  /**
   * Check if IndexedDB is available
   * @returns {Promise<boolean>} True if IndexedDB is available
   */
  async isAvailable() {
    if (!window.indexedDB) {
      return false;
    }
    
    try {
      const db = await this._openDatabase();
      db.close();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Save data to IndexedDB
   * @param {string} type - The type of data
   * @param {string} name - The name of the save
   * @param {Object} data - The data to save
   * @returns {Promise<void>}
   */
  async saveData(type, name, data) {
    if (!this.db) {
      await this.init();
    }
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction([type], 'readwrite');
        const store = transaction.objectStore(type);
        
        const request = store.put({ id: name, data });
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Load data from IndexedDB
   * @param {string} type - The type of data
   * @param {string} name - The name of the save
   * @returns {Promise<Object>} The loaded data
   */
  async loadData(type, name) {
    if (!this.db) {
      await this.init();
    }
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction([type], 'readonly');
        const store = transaction.objectStore(type);
        
        const request = store.get(name);
        
        request.onsuccess = () => {
          if (request.result) {
            resolve(request.result.data);
          } else {
            const error = new Error(`Data not found: ${type}/${name}`);
            error.name = 'NotFoundError';
            reject(error);
          }
        };
        
        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Delete data from IndexedDB
   * @param {string} type - The type of data
   * @param {string} name - The name of the save
   * @returns {Promise<void>}
   */
  async deleteData(type, name) {
    if (!this.db) {
      await this.init();
    }
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction([type], 'readwrite');
        const store = transaction.objectStore(type);
        
        const request = store.delete(name);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Get all data of a specific type from IndexedDB
   * @param {string} type - The type of data
   * @returns {Promise<Array>} Array of data items
   */
  async getAllData(type) {
    if (!this.db) {
      await this.init();
    }
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction([type], 'readonly');
        const store = transaction.objectStore(type);
        
        const request = store.getAll();
        
        request.onsuccess = () => {
          resolve(request.result.map(item => item.data));
        };
        
        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Clean up IndexedDB
   * @returns {Promise<void>}
   */
  async cleanup() {
    if (!this.db) {
      await this.init();
    }
    
    const storeNames = Array.from(this.db.objectStoreNames);
    
    for (const storeName of storeNames) {
      await this._clearObjectStore(storeName);
    }
  }

  /**
   * Clear an object store
   * @param {string} storeName - The name of the object store
   * @returns {Promise<void>}
   * @private
   */
  async _clearObjectStore(storeName) {
    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        
        const request = store.clear();
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Open the IndexedDB database
   * @returns {Promise<IDBDatabase>} The database
   * @private
   */
  async _openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores for each save type if they don't exist
        const storeNames = [
          SaveType.ENCOUNTER,
          SaveType.PLAYER,
          SaveType.MONSTER,
          SaveType.SETTINGS,
          SaveType.TEMPLATE,
          SaveType.BACKUP
        ];
        
        for (const storeName of storeNames) {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'id' });
          }
        }
      };
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

/**
 * File system storage handler
 */
class FileSystemHandler extends StorageHandler {
  /**
   * Create a file system storage handler
   */
  constructor() {
    super();
    this.fileSystem = null;
    this.baseDir = null;
  }

  /**
   * Initialize the file system storage handler
   * @returns {Promise<void>}
   */
  async init() {
    // Check if the File System Access API is available
    if (!('showDirectoryPicker' in window)) {
      return;
    }
    
    // We don't automatically request directory access on init
    // This will be done when the user explicitly chooses to use file system storage
  }

  /**
   * Check if the File System Access API is available
   * @returns {Promise<boolean>} True if the API is available
   */
  async isAvailable() {
    return 'showDirectoryPicker' in window;
  }

  /**
   * Request access to a directory
   * @returns {Promise<boolean>} True if access was granted
   */
  async requestDirectoryAccess() {
    try {
      // Show the directory picker
      const dirHandle = await window.showDirectoryPicker({
        id: 'jct-data',
        mode: 'readwrite',
        startIn: 'documents'
      });
      
      // Store the directory handle
      this.baseDir = dirHandle;
      
      return true;
    } catch (error) {
      console.error('Failed to get directory access:', error);
      return false;
    }
  }

  /**
   * Save data to the file system
   * @param {string} type - The type of data
   * @param {string} name - The name of the save
   * @param {Object} data - The data to save
   * @returns {Promise<void>}
   */
  async saveData(type, name, data) {
    if (!this.baseDir) {
      const granted = await this.requestDirectoryAccess();
      if (!granted) {
        throw new Error('Directory access not granted');
      }
    }
    
    try {
      // Get or create the type directory
      let typeDir;
      try {
        typeDir = await this.baseDir.getDirectoryHandle(type, { create: true });
      } catch (error) {
        throw new Error(`Failed to access directory for ${type}: ${error.message}`);
      }
      
      // Create or open the file
      const fileName = `${name}.json`;
      const fileHandle = await typeDir.getFileHandle(fileName, { create: true });
      
      // Write the data
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(data, null, 2));
      await writable.close();
    } catch (error) {
      throw new Error(`Failed to save data: ${error.message}`);
    }
  }

  /**
   * Load data from the file system
   * @param {string} type - The type of data
   * @param {string} name - The name of the save
   * @returns {Promise<Object>} The loaded data
   */
  async loadData(type, name) {
    if (!this.baseDir) {
      const granted = await this.requestDirectoryAccess();
      if (!granted) {
        throw new Error('Directory access not granted');
      }
    }
    
    try {
      // Get the type directory
      const typeDir = await this.baseDir.getDirectoryHandle(type);
      
      // Get the file
      const fileName = `${name}.json`;
      const fileHandle = await typeDir.getFileHandle(fileName);
      
      // Read the file
      const file = await fileHandle.getFile();
      const text = await file.text();
      
      // Parse the data
      return JSON.parse(text);
    } catch (error) {
      if (error.name === 'NotFoundError') {
        const notFoundError = new Error(`Data not found: ${type}/${name}`);
        notFoundError.name = 'NotFoundError';
        throw notFoundError;
      }
      
      throw new Error(`Failed to load data: ${error.message}`);
    }
  }

  /**
   * Delete data from the file system
   * @param {string} type - The type of data
   * @param {string} name - The name of the save
   * @returns {Promise<void>}
   */
  async deleteData(type, name) {
    if (!this.baseDir) {
      const granted = await this.requestDirectoryAccess();
      if (!granted) {
        throw new Error('Directory access not granted');
      }
    }
    
    try {
      // Get the type directory
      const typeDir = await this.baseDir.getDirectoryHandle(type);
      
      // Delete the file
      const fileName = `${name}.json`;
      await typeDir.removeEntry(fileName);
    } catch (error) {
      if (error.name !== 'NotFoundError') {
        throw new Error(`Failed to delete data: ${error.message}`);
      }
    }
  }

  /**
   * Get all data of a specific type from the file system
   * @param {string} type - The type of data
   * @returns {Promise<Array>} Array of data items
   */
  async getAllData(type) {
    if (!this.baseDir) {
      const granted = await this.requestDirectoryAccess();
      if (!granted) {
        return [];
      }
    }
    
    try {
      // Get the type directory
      let typeDir;
      try {
        typeDir = await this.baseDir.getDirectoryHandle(type);
      } catch (error) {
        if (error.name === 'NotFoundError') {
          return [];
        }
        throw error;
      }
      
      // Get all files in the directory
      const data = [];
      for await (const entry of typeDir.values()) {
        if (entry.kind === 'file' && entry.name.endsWith('.json')) {
          try {
            // Read the file
            const fileHandle = await typeDir.getFileHandle(entry.name);
            const file = await fileHandle.getFile();
            const text = await file.text();
            
            // Parse the data
            const parsedData = JSON.parse(text);
            data.push(parsedData);
          } catch (error) {
            console.error(`Failed to read file ${entry.name}:`, error);
          }
        }
      }
      
      return data;
    } catch (error) {
      console.error(`Failed to get data of type ${type}:`, error);
      return [];
    }
  }

  /**
   * Clean up the file system storage
   * @returns {Promise<void>}
   */
  async cleanup() {
    if (!this.baseDir) {
      return;
    }
    
    try {
      // Get all directories
      const storeNames = [
        SaveType.ENCOUNTER,
        SaveType.PLAYER,
        SaveType.MONSTER,
        SaveType.SETTINGS,
        SaveType.TEMPLATE,
        SaveType.BACKUP
      ];
      
      for (const storeName of storeNames) {
        try {
          // Get the directory
          const dir = await this.baseDir.getDirectoryHandle(storeName);
          
          // Delete all files in the directory
          for await (const entry of dir.values()) {
            if (entry.kind === 'file') {
              await dir.removeEntry(entry.name);
            }
          }
        } catch (error) {
          if (error.name !== 'NotFoundError') {
            console.error(`Failed to clean up directory ${storeName}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Failed to clean up file system storage:', error);
    }
  }
}

/**
 * Read a file as text
 * @param {File} file - The file to read
 * @returns {Promise<string>} The file contents
 */
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

/**
 * Determine the type of data
 * @param {Object} data - The data to check
 * @returns {string} The data type
 */
function determineDataType(data) {
  // Check for specific properties that indicate the data type
  if (data.combatants && data.round) {
    return SaveType.ENCOUNTER;
  }
  
  if (data.classes && data.abilities) {
    return SaveType.PLAYER;
  }
  
  if (data.challengeRating && data.type && data.size) {
    return SaveType.MONSTER;
  }
  
  if (data.templates) {
    return SaveType.TEMPLATE;
  }
  
  // Default to settings
  return SaveType.SETTINGS;
}

/**
 * Create a new save manager
 * @param {Object} options - Configuration options
 * @returns {SaveManager} A new save manager instance
 */
export function createSaveManager(options = {}) {
  return new SaveManager(options);
}

// Export the main save functions and classes
export default {
  createSaveManager,
  StorageType,
  SaveType
};
