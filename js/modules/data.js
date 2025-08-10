/**
 * Jesster's Combat Tracker
 * Data Management Module
 * Version 2.3.1
 * 
 * This module handles data loading, saving, and management for the application.
 * It provides functions for working with local storage, file imports/exports,
 * and data validation.
 */

// Default application data structure
const DEFAULT_APP_DATA = {
  version: '2.3.1',
  settings: {
    theme: 'default',
    diceRollAnimation: true,
    autoSave: true,
    autoSaveInterval: 5, // minutes
    compactMode: false,
    showHPValues: true,
    confirmOnDelete: true,
    initiativeOptions: {
      skipDefeated: true,
      groupSimilar: false,
      rerollTies: true,
      addDexModifier: true
    },
    soundEffects: {
      enabled: true,
      volume: 0.5,
      combatStart: true,
      combatEnd: true,
      criticalHit: true,
      criticalMiss: true,
      playerTurn: true,
      monsterTurn: true
    },
    keyBindings: {
      nextTurn: 'Space',
      previousTurn: 'Shift+Space',
      addMonster: 'Ctrl+M',
      addPlayer: 'Ctrl+P',
      rollInitiative: 'Ctrl+I',
      clearEncounter: 'Ctrl+Shift+C'
    },
    displayOptions: {
      showConditionIcons: true,
      showPortraits: true,
      showInitiativeValues: true,
      highlightActiveCreature: true,
      alternateRowColors: true,
      showGridOnMaps: true
    }
  },
  encounters: [],
  customMonsters: [],
  players: [],
  notes: [],
  maps: [],
  combatHistory: [],
  customConditions: [],
  customSpells: [],
  customItems: []
};

/**
 * Load application data from local storage
 * @returns {Object} The loaded application data
 */
export function loadAppData() {
  try {
    const storedData = localStorage.getItem('jct_appData');
    
    if (!storedData) {
      console.log('No stored data found, using default data');
      return { ...DEFAULT_APP_DATA };
    }
    
    const parsedData = JSON.parse(storedData);
    
    // Check version and migrate if necessary
    if (parsedData.version !== DEFAULT_APP_DATA.version) {
      console.log(`Data version mismatch: ${parsedData.version} vs ${DEFAULT_APP_DATA.version}`);
      return migrateData(parsedData);
    }
    
    return parsedData;
  } catch (error) {
    console.error('Error loading app data:', error);
    return { ...DEFAULT_APP_DATA };
  }
}

/**
 * Save application data to local storage
 * @param {Object} appData - The application data to save
 * @returns {boolean} True if save was successful
 */
export function saveAppData(appData) {
  try {
    // Ensure version is current
    const dataToSave = {
      ...appData,
      version: DEFAULT_APP_DATA.version
    };
    
    localStorage.setItem('jct_appData', JSON.stringify(dataToSave));
    return true;
  } catch (error) {
    console.error('Error saving app data:', error);
    return false;
  }
}

/**
 * Clear all application data from local storage
 * @returns {boolean} True if clear was successful
 */
export function clearAppData() {
  try {
    localStorage.removeItem('jct_appData');
    return true;
  } catch (error) {
    console.error('Error clearing app data:', error);
    return false;
  }
}

/**
 * Migrate data from an older version to the current version
 * @param {Object} oldData - The data in the old format
 * @returns {Object} The migrated data in the current format
 */
function migrateData(oldData) {
  console.log(`Migrating data from version ${oldData.version} to ${DEFAULT_APP_DATA.version}`);
  
  // Start with default data structure
  const migratedData = { ...DEFAULT_APP_DATA };
  
  // Copy over compatible data
  if (oldData.settings) {
    migratedData.settings = {
      ...migratedData.settings,
      ...oldData.settings
    };
  }
  
  if (oldData.encounters) {
    migratedData.encounters = [...oldData.encounters];
  }
  
  if (oldData.players) {
    migratedData.players = [...oldData.players];
  }
  
  if (oldData.customMonsters) {
    migratedData.customMonsters = [...oldData.customMonsters];
  }
  
  if (oldData.notes) {
    migratedData.notes = [...oldData.notes];
  }
  
  // Handle version-specific migrations
  if (oldData.version === '2.0.0') {
    // Migrate from 2.0.0 to 2.1.0
    console.log('Applying 2.0.0 -> 2.1.0 migrations');
    
    // Example: Convert old condition format to new format
    if (oldData.encounters) {
      migratedData.encounters = oldData.encounters.map(encounter => {
        if (encounter.combatants) {
          encounter.combatants = encounter.combatants.map(combatant => {
            if (combatant.conditions && Array.isArray(combatant.conditions)) {
              combatant.conditions = combatant.conditions.map(condition => {
                if (typeof condition === 'string') {
                  return {
                    id: condition,
                    name: condition,
                    duration: null
                  };
                }
                return condition;
              });
            }
            return combatant;
          });
        }
        return encounter;
      });
    }
  }
  
  if (oldData.version === '2.1.0' || oldData.version === '2.2.0') {
    // Migrate from 2.1.0/2.2.0 to 2.3.0
    console.log('Applying 2.1.0/2.2.0 -> 2.3.0 migrations');
    
    // Example: Add new combatHistory field
    if (!oldData.combatHistory) {
      migratedData.combatHistory = [];
    } else {
      migratedData.combatHistory = [...oldData.combatHistory];
    }
  }
  
  return migratedData;
}

/**
 * Export application data to a JSON file
 * @param {Object} appData - The application data to export
 * @returns {boolean} True if export was successful
 */
export function exportToFile(appData) {
  try {
    const dataStr = JSON.stringify(appData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `jct_backup_${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    return true;
  } catch (error) {
    console.error('Error exporting data:', error);
    return false;
  }
}

/**
 * Import application data from a JSON file
 * @param {File} file - The file to import
 * @returns {Promise<Object>} A promise that resolves to the imported data
 */
export function importFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        
        // Validate the imported data
        if (!validateImportedData(importedData)) {
          reject(new Error('Invalid data format'));
          return;
        }
        
        // Migrate if necessary
        if (importedData.version !== DEFAULT_APP_DATA.version) {
          resolve(migrateData(importedData));
        } else {
          resolve(importedData);
        }
      } catch (error) {
        console.error('Error parsing imported file:', error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      reject(error);
    };
    
    reader.readAsText(file);
  });
}

/**
 * Validate imported data structure
 * @param {Object} data - The data to validate
 * @returns {boolean} True if the data is valid
 */
function validateImportedData(data) {
  // Check for required top-level properties
  if (!data || typeof data !== 'object') {
    console.error('Invalid data: not an object');
    return false;
  }
  
  if (!data.version || typeof data.version !== 'string') {
    console.error('Invalid data: missing or invalid version');
    return false;
  }
  
  if (!data.settings || typeof data.settings !== 'object') {
    console.error('Invalid data: missing or invalid settings');
    return false;
  }
  
  // Check for required arrays
  const requiredArrays = ['encounters', 'players', 'customMonsters', 'notes'];
  for (const arrayName of requiredArrays) {
    if (!Array.isArray(data[arrayName])) {
      console.error(`Invalid data: ${arrayName} is not an array`);
      return false;
    }
  }
  
  return true;
}

/**
 * Load SRD monsters from the data file
 * @returns {Promise<Array>} A promise that resolves to the monster data
 */
export async function loadSRDMonsters() {
  try {
    const response = await fetch('./data/monsters-srd.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.monsters || [];
  } catch (error) {
    console.error('Error loading SRD monsters:', error);
    return [];
  }
}

/**
 * Load SRD spells from the data file
 * @returns {Promise<Array>} A promise that resolves to the spell data
 */
export async function loadSRDSpells() {
  try {
    const response = await fetch('./data/spells-srd.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.spells || [];
  } catch (error) {
    console.error('Error loading SRD spells:', error);
    return [];
  }
}

/**
 * Load environment data from the data file
 * @returns {Promise<Array>} A promise that resolves to the environment data
 */
export async function loadEnvironments() {
  try {
    const response = await fetch('./data/environments.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.environments || [];
  } catch (error) {
    console.error('Error loading environments:', error);
    return [];
  }
}

/**
 * Load available themes from the data file
 * @returns {Promise<Array>} A promise that resolves to the theme data
 */
export async function loadThemes() {
  try {
    const response = await fetch('./data/themes.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.themes || [];
  } catch (error) {
    console.error('Error loading themes:', error);
    return [];
  }
}

/**
 * Save an encounter to the stored encounters list
 * @param {Object} appData - The current application data
 * @param {Object} encounter - The encounter to save
 * @returns {Object} The updated application data
 */
export function saveEncounter(appData, encounter) {
  // Create a copy of the app data
  const updatedData = { ...appData };
  
  // Check if this is an update to an existing encounter
  if (encounter.id) {
    const index = updatedData.encounters.findIndex(e => e.id === encounter.id);
    if (index !== -1) {
      // Update existing encounter
      updatedData.encounters[index] = {
        ...encounter,
        lastModified: new Date().toISOString()
      };
    } else {
      // Add as new with existing ID
      updatedData.encounters.push({
        ...encounter,
        lastModified: new Date().toISOString()
      });
    }
  } else {
    // Add new encounter with generated ID
    updatedData.encounters.push({
      ...encounter,
      id: `encounter-${Date.now()}`,
      created: new Date().toISOString(),
      lastModified: new Date().toISOString()
    });
  }
  
  return updatedData;
}

/**
 * Delete an encounter from the stored encounters list
 * @param {Object} appData - The current application data
 * @param {string} encounterId - The ID of the encounter to delete
 * @returns {Object} The updated application data
 */
export function deleteEncounter(appData, encounterId) {
  // Create a copy of the app data
  const updatedData = { ...appData };
  
  // Filter out the encounter with the specified ID
  updatedData.encounters = updatedData.encounters.filter(e => e.id !== encounterId);
  
  return updatedData;
}

/**
 * Save a player character to the stored players list
 * @param {Object} appData - The current application data
 * @param {Object} player - The player character to save
 * @returns {Object} The updated application data
 */
export function savePlayer(appData, player) {
  // Create a copy of the app data
  const updatedData = { ...appData };
  
  // Check if this is an update to an existing player
  if (player.id) {
    const index = updatedData.players.findIndex(p => p.id === player.id);
    if (index !== -1) {
      // Update existing player
      updatedData.players[index] = {
        ...player,
        lastModified: new Date().toISOString()
      };
    } else {
      // Add as new with existing ID
      updatedData.players.push({
        ...player,
        lastModified: new Date().toISOString()
      });
    }
  } else {
    // Add new player with generated ID
    updatedData.players.push({
      ...player,
      id: `player-${Date.now()}`,
      created: new Date().toISOString(),
      lastModified: new Date().toISOString()
    });
  }
  
  return updatedData;
}

/**
 * Delete a player character from the stored players list
 * @param {Object} appData - The current application data
 * @param {string} playerId - The ID of the player to delete
 * @returns {Object} The updated application data
 */
export function deletePlayer(appData, playerId) {
  // Create a copy of the app data
  const updatedData = { ...appData };
  
  // Filter out the player with the specified ID
  updatedData.players = updatedData.players.filter(p => p.id !== playerId);
  
  return updatedData;
}

/**
 * Save a custom monster to the stored custom monsters list
 * @param {Object} appData - The current application data
 * @param {Object} monster - The custom monster to save
 * @returns {Object} The updated application data
 */
export function saveCustomMonster(appData, monster) {
  // Create a copy of the app data
  const updatedData = { ...appData };
  
  // Check if this is an update to an existing monster
  if (monster.id) {
    const index = updatedData.customMonsters.findIndex(m => m.id === monster.id);
    if (index !== -1) {
      // Update existing monster
      updatedData.customMonsters[index] = {
        ...monster,
        lastModified: new Date().toISOString()
      };
    } else {
      // Add as new with existing ID
      updatedData.customMonsters.push({
        ...monster,
        lastModified: new Date().toISOString()
      });
    }
  } else {
    // Add new monster with generated ID
    updatedData.customMonsters.push({
      ...monster,
      id: `monster-${Date.now()}`,
      created: new Date().toISOString(),
      lastModified: new Date().toISOString()
    });
  }
  
  return updatedData;
}

/**
 * Delete a custom monster from the stored custom monsters list
 * @param {Object} appData - The current application data
 * @param {string} monsterId - The ID of the monster to delete
 * @returns {Object} The updated application data
 */
export function deleteCustomMonster(appData, monsterId) {
  // Create a copy of the app data
  const updatedData = { ...appData };
  
  // Filter out the monster with the specified ID
  updatedData.customMonsters = updatedData.customMonsters.filter(m => m.id !== monsterId);
  
  return updatedData;
}

/**
 * Save a note to the stored notes list
 * @param {Object} appData - The current application data
 * @param {Object} note - The note to save
 * @returns {Object} The updated application data
 */
export function saveNote(appData, note) {
  // Create a copy of the app data
  const updatedData = { ...appData };
  
  // Check if this is an update to an existing note
  if (note.id) {
    const index = updatedData.notes.findIndex(n => n.id === note.id);
    if (index !== -1) {
      // Update existing note
      updatedData.notes[index] = {
        ...note,
        lastModified: new Date().toISOString()
      };
    } else {
      // Add as new with existing ID
      updatedData.notes.push({
        ...note,
        lastModified: new Date().toISOString()
      });
    }
  } else {
    // Add new note with generated ID
    updatedData.notes.push({
      ...note,
      id: `note-${Date.now()}`,
      created: new Date().toISOString(),
      lastModified: new Date().toISOString()
    });
  }
  
  return updatedData;
}

/**
 * Delete a note from the stored notes list
 * @param {Object} appData - The current application data
 * @param {string} noteId - The ID of the note to delete
 * @returns {Object} The updated application data
 */
export function deleteNote(appData, noteId) {
  // Create a copy of the app data
  const updatedData = { ...appData };
  
  // Filter out the note with the specified ID
  updatedData.notes = updatedData.notes.filter(n => n.id !== noteId);
  
  return updatedData;
}

/**
 * Save combat history to the stored combat history list
 * @param {Object} appData - The current application data
 * @param {Object} combatRecord - The combat record to save
 * @returns {Object} The updated application data
 */
export function saveCombatHistory(appData, combatRecord) {
  // Create a copy of the app data
  const updatedData = { ...appData };
  
  // Add the combat record with a timestamp
  updatedData.combatHistory.push({
    ...combatRecord,
    id: `combat-${Date.now()}`,
    timestamp: new Date().toISOString()
  });
  
  // Limit the history to the most recent 50 records
  if (updatedData.combatHistory.length > 50) {
    updatedData.combatHistory = updatedData.combatHistory.slice(-50);
  }
  
  return updatedData;
}

/**
 * Clear all combat history
 * @param {Object} appData - The current application data
 * @returns {Object} The updated application data
 */
export function clearCombatHistory(appData) {
  // Create a copy of the app data
  const updatedData = { ...appData };
  
  // Clear the combat history
  updatedData.combatHistory = [];
  
  return updatedData;
}

/**
 * Update application settings
 * @param {Object} appData - The current application data
 * @param {Object} newSettings - The new settings to apply
 * @returns {Object} The updated application data
 */
export function updateSettings(appData, newSettings) {
  // Create a copy of the app data
  const updatedData = { ...appData };
  
  // Merge the new settings with the existing settings
  updatedData.settings = {
    ...updatedData.settings,
    ...newSettings
  };
  
  return updatedData;
}

/**
 * Reset application settings to defaults
 * @param {Object} appData - The current application data
 * @returns {Object} The updated application data
 */
export function resetSettings(appData) {
  // Create a copy of the app data
  const updatedData = { ...appData };
  
  // Reset settings to default
  updatedData.settings = { ...DEFAULT_APP_DATA.settings };
  
  return updatedData;
}

/**
 * Get a monster by ID from either SRD or custom monsters
 * @param {string} id - The monster ID
 * @param {Array} srdMonsters - The SRD monsters list
 * @param {Array} customMonsters - The custom monsters list
 * @returns {Object|null} The monster object or null if not found
 */
export function getMonsterById(id, srdMonsters, customMonsters) {
  // Check custom monsters first
  const customMonster = customMonsters.find(m => m.id === id);
  if (customMonster) {
    return customMonster;
  }
  
  // Then check SRD monsters
  const srdMonster = srdMonsters.find(m => m.id === id);
  if (srdMonster) {
    return srdMonster;
  }
  
  return null;
}

/**
 * Get a spell by ID from either SRD or custom spells
 * @param {string} id - The spell ID
 * @param {Array} srdSpells - The SRD spells list
 * @param {Array} customSpells - The custom spells list
 * @returns {Object|null} The spell object or null if not found
 */
export function getSpellById(id, srdSpells, customSpells) {
  // Check custom spells first
  const customSpell = customSpells.find(s => s.id === id);
  if (customSpell) {
    return customSpell;
  }
  
  // Then check SRD spells
  const srdSpell = srdSpells.find(s => s.id === id);
  if (srdSpell) {
    return srdSpell;
  }
  
  return null;
}

/**
 * Get an environment by ID
 * @param {string} id - The environment ID
 * @param {Array} environments - The environments list
 * @returns {Object|null} The environment object or null if not found
 */
export function getEnvironmentById(id, environments) {
  return environments.find(e => e.id === id) || null;
}

/**
 * Search for monsters by name, type, or CR
 * @param {string} query - The search query
 * @param {Array} srdMonsters - The SRD monsters list
 * @param {Array} customMonsters - The custom monsters list
 * @returns {Array} The matching monsters
 */
export function searchMonsters(query, srdMonsters, customMonsters) {
  if (!query || query.trim() === '') {
    return [...customMonsters, ...srdMonsters];
  }
  
  const normalizedQuery = query.toLowerCase().trim();
  const results = [];
  
  // Search custom monsters first
  customMonsters.forEach(monster => {
    if (
      monster.name.toLowerCase().includes(normalizedQuery) ||
      monster.type.toLowerCase().includes(normalizedQuery) ||
      monster.cr.toString() === normalizedQuery
    ) {
      results.push({ ...monster, isCustom: true });
    }
  });
  
  // Then search SRD monsters
  srdMonsters.forEach(monster => {
    if (
      monster.name.toLowerCase().includes(normalizedQuery) ||
      monster.type.toLowerCase().includes(normalizedQuery) ||
      monster.cr.toString() === normalizedQuery
    ) {
      results.push({ ...monster, isCustom: false });
    }
  });
  
  return results;
}

/**
 * Search for spells by name, level, or school
 * @param {string} query - The search query
 * @param {Array} srdSpells - The SRD spells list
 * @param {Array} customSpells - The custom spells list
 * @returns {Array} The matching spells
 */
export function searchSpells(query, srdSpells, customSpells) {
  if (!query || query.trim() === '') {
    return [...customSpells, ...srdSpells];
  }
  
  const normalizedQuery = query.toLowerCase().trim();
  const results = [];
  
  // Search custom spells first
  customSpells.forEach(spell => {
    if (
      spell.name.toLowerCase().includes(normalizedQuery) ||
      spell.school.toLowerCase().includes(normalizedQuery) ||
      spell.level.toString() === normalizedQuery
    ) {
      results.push({ ...spell, isCustom: true });
    }
  });
  
  // Then search SRD spells
  srdSpells.forEach(spell => {
    if (
      spell.name.toLowerCase().includes(normalizedQuery) ||
      spell.school.toLowerCase().includes(normalizedQuery) ||
      spell.level.toString() === normalizedQuery
    ) {
      results.push({ ...spell, isCustom: false });
    }
  });
  
  return results;
}

/**
 * Filter monsters by criteria
 * @param {Array} monsters - The monsters to filter
 * @param {Object} filters - The filter criteria
 * @returns {Array} The filtered monsters
 */
export function filterMonsters(monsters, filters) {
  return monsters.filter(monster => {
    // Filter by CR range
    if (filters.minCR !== undefined && parseFloat(monster.cr) < filters.minCR) {
      return false;
    }
    if (filters.maxCR !== undefined && parseFloat(monster.cr) > filters.maxCR) {
      return false;
    }
    
    // Filter by type
    if (filters.types && filters.types.length > 0 && !filters.types.includes(monster.type)) {
      return false;
    }
    
    // Filter by environment
    if (filters.environments && filters.environments.length > 0) {
      if (!monster.environment || !monster.environment.some(env => filters.environments.includes(env))) {
        return false;
      }
    }
    
    // Filter by size
    if (filters.sizes && filters.sizes.length > 0 && !filters.sizes.includes(monster.size)) {
      return false;
    }
    
    return true;
  });
}

/**
 * Filter spells by criteria
 * @param {Array} spells - The spells to filter
 * @param {Object} filters - The filter criteria
 * @returns {Array} The filtered spells
 */
export function filterSpells(spells, filters) {
  return spells.filter(spell => {
    // Filter by level range
    if (filters.minLevel !== undefined && spell.level < filters.minLevel) {
      return false;
    }
    if (filters.maxLevel !== undefined && spell.level > filters.maxLevel) {
      return false;
    }
    
    // Filter by school
    if (filters.schools && filters.schools.length > 0 && !filters.schools.includes(spell.school)) {
      return false;
    }
    
    // Filter by class
    if (filters.classes && filters.classes.length > 0) {
      if (!spell.tags || !spell.tags.some(tag => filters.classes.includes(tag))) {
        return false;
      }
    }
    
    // Filter by casting time
    if (filters.castingTimes && filters.castingTimes.length > 0) {
      const normalizedCastingTime = spell.castingTime.toLowerCase();
      if (!filters.castingTimes.some(time => normalizedCastingTime.includes(time))) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Generate a random encounter based on parameters
 * @param {Object} params - The encounter parameters
 * @param {Array} srdMonsters - The SRD monsters list
 * @param {Array} customMonsters - The custom monsters list
 * @param {Array} environments - The environments list
 * @returns {Object} The generated encounter
 */
export function generateRandomEncounter(params, srdMonsters, customMonsters, environments) {
  const { 
    partyLevel, 
    partySize, 
    difficulty, 
    environment, 
    monsterTypes = [],
    excludedMonsters = []
  } = params;
  
  // Calculate target XP based on party level, size, and difficulty
  const xpThresholds = calculateXPThresholds(partyLevel, partySize, difficulty);
  
  // Get all available monsters
  const allMonsters = [...srdMonsters, ...customMonsters];
  
  // Filter monsters by criteria
  let availableMonsters = allMonsters.filter(monster => {
    // Exclude specific monsters
    if (excludedMonsters.includes(monster.id)) {
      return false;
    }
    
    // Filter by CR (appropriate for party level)
    const cr = parseFloat(monster.cr);
    if (cr > partyLevel + 5 || cr < Math.max(0, partyLevel - 5)) {
      return false;
    }
    
    // Filter by environment
    if (environment && monster.environment) {
      if (!monster.environment.includes(environment)) {
        return false;
      }
    }
    
    // Filter by monster types
    if (monsterTypes.length > 0) {
      if (!monsterTypes.includes(monster.type)) {
        return false;
      }
    }
    
    return true;
  });
  
  // If no monsters match the criteria, return an empty encounter
  if (availableMonsters.length === 0) {
    return {
      name: "Random Encounter",
      description: "No suitable monsters found for the given criteria.",
      combatants: []
    };
  }
  
  // Sort by CR
  availableMonsters.sort((a, b) => parseFloat(a.cr) - parseFloat(b.cr));
  
  // Select monsters to meet the XP threshold
  const selectedMonsters = [];
  let currentXP = 0;
  const targetXP = xpThresholds.target;
  const maxXP = xpThresholds.max;
  
  // Try to get close to the target XP without exceeding max XP
  while (currentXP < targetXP && available

_Note: `JCT 2.3.1.html` and `image.png` were excluded from the analysis due to size limit. Please upload again or start a new conversation if your question is related to them._
/**
 * Data Manager for Jesster's Combat Tracker
 * Handles data storage and retrieval
 */
class DataManager {
  constructor(app) {
    this.app = app;
    this.heroes = [];
    this.monsters = [];
    this.encounters = [];
  }
  
  loadInitialData() {
    console.log("Loading initial data...");
    this.loadFromLocalStorage();
    return Promise.resolve(); // Return a resolved promise for async compatibility
  }
  
  loadFromLocalStorage() {
    try {
      // Load heroes
      const heroesJson = localStorage.getItem('jesster_heroes');
      if (heroesJson) {
        this.heroes = JSON.parse(heroesJson);
      }
      
      // Load monsters
      const monstersJson = localStorage.getItem('jesster_monsters');
      if (monstersJson) {
        this.monsters = JSON.parse(monstersJson);
      }
      
      // Load encounters
      const encountersJson = localStorage.getItem('jesster_encounters');
      if (encountersJson) {
        this.encounters = JSON.parse(encountersJson);
      }
      
      console.log("Data loaded from localStorage");
    } catch (error) {
      console.error("Error loading from localStorage:", error);
    }
  }
  
  saveToLocalStorage() {
    try {
      localStorage.setItem('jesster_heroes', JSON.stringify(this.heroes));
      localStorage.setItem('jesster_monsters', JSON.stringify(this.monsters));
      localStorage.setItem('jesster_encounters', JSON.stringify(this.encounters));
      console.log("Data saved to localStorage");
      return true;
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      return false;
    }
  }
  
  loadFromFirebase() {
    if (!this.app.db || !this.app.userId) {
      throw new Error("Firebase not initialized or user not authenticated");
    }
    
    const db = this.app.db;
    const userId = this.app.userId;
    
    try {
      // Load heroes
      db.collection('users').doc(userId).collection('data').doc('heroes').get()
        .then(doc => {
          if (doc.exists) {
            this.heroes = doc.data().heroes || [];
          }
        });
      
      // Load monsters
      db.collection('users').doc(userId).collection('data').doc('monsters').get()
        .then(doc => {
          if (doc.exists) {
            this.monsters = doc.data().monsters || [];
          }
        });
      
      // Load encounters
      db.collection('users').doc(userId).collection('data').doc('encounters').get()
        .then(doc => {
          if (doc.exists) {
            this.encounters = doc.data().encounters || [];
          }
        });
      
      console.log("Data loaded from Firebase");
    } catch (error) {
      console.error("Error loading from Firebase:", error);
      throw error;
    }
  }
  
  saveToFirebase() {
    if (!this.app.db || !this.app.userId) {
      throw new Error("Firebase not initialized or user not authenticated");
    }
    
    const db = this.app.db;
    const userId = this.app.userId;
    
    try {
      // Save heroes
      db.collection('users').doc(userId).collection('data').doc('heroes').set({
        heroes: this.heroes,
        updatedAt: new Date()
      });
      
      // Save monsters
      db.collection('users').doc(userId).collection('data').doc('monsters').set({
        monsters: this.monsters,
        updatedAt: new Date()
      });
      
      // Save encounters
      db.collection('users').doc(userId).collection('data').doc('encounters').set({
        encounters: this.encounters,
        updatedAt: new Date()
      });
      
      console.log("Data saved to Firebase");
      return true;
    } catch (error) {
      console.error("Error saving to Firebase:", error);
      throw error;
    }
  }
  
  saveData() {
    if (this.app.offlineMode) {
      // Save to localStorage in offline mode
      return this.saveToLocalStorage();
    } else {
      // Try to save to Firebase
      try {
        this.saveToFirebase();
        // Also save to localStorage as backup
        this.saveToLocalStorage();
        return true;
      } catch (error) {
        console.error("Error saving to Firebase:", error);
        // Fall back to localStorage
        return this.saveToLocalStorage();
      }
    }
  }
  
  // Methods to add/update/delete heroes
  addHero(hero) {
    // Generate ID if not provided
    if (!hero.id) {
      hero.id = `hero-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    }
    
    this.heroes.push(hero);
    this.saveData();
    return hero;
  }
  
  updateHero(heroId, updatedHero) {
    const index = this.heroes.findIndex(h => h.id === heroId);
    if (index >= 0) {
      this.heroes[index] = { ...this.heroes[index], ...updatedHero };
      this.saveData();
      return this.heroes[index];
    }
    return null;
  }
  
  deleteHero(heroId) {
    const index = this.heroes.findIndex(h => h.id === heroId);
    if (index >= 0) {
      const deleted = this.heroes.splice(index, 1)[0];
      this.saveData();
      return deleted;
    }
    return null;
  }
  
  // Methods to add/update/delete custom monsters
  addCustomMonster(monster) {
    // Generate ID if not provided
    if (!monster.id) {
      monster.id = `monster-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    }
    
    this.monsters.push(monster);
    this.saveData();
    return monster;
  }
  
  updateCustomMonster(monsterId, updatedMonster) {
    const index = this.monsters.findIndex(m => m.id === monsterId);
    if (index >= 0) {
      this.monsters[index] = { ...this.monsters[index], ...updatedMonster };
      this.saveData();
      return this.monsters[index];
    }
    return null;
  }
  
  deleteCustomMonster(monsterId) {
    const index = this.monsters.findIndex(m => m.id === monsterId);
    if (index >= 0) {
      const deleted = this.monsters.splice(index, 1)[0];
      this.saveData();
      return deleted;
    }
    return null;
  }
}
  // Try to get close to the target XP without exceeding max XP
  while (currentXP < targetXP && availableMonsters.length > 0) {
    // Calculate how much XP we still need
    const remainingXP = targetXP - currentXP;
    
    // Find monsters that won't exceed our max XP if added
    const suitableMonsters = availableMonsters.filter(monster => {
      const monsterXP = calculateMonsterXP(monster);
      return currentXP + monsterXP <= maxXP;
    });
    
    if (suitableMonsters.length === 0) {
      break; // No suitable monsters left
    }
    
    // Select a random monster from the suitable ones
    const randomIndex = Math.floor(Math.random() * suitableMonsters.length);
    const selectedMonster = suitableMonsters[randomIndex];
    
    // Add the monster to our selection
    selectedMonsters.push(selectedMonster);
    
    // Update current XP
    currentXP += calculateMonsterXP(selectedMonster);
    
    // Optionally remove the monster from available monsters to prevent duplicates
    // This is a design choice - comment out if you want to allow duplicates
    availableMonsters = availableMonsters.filter(m => m.id !== selectedMonster.id);
  }
  
  // Create combatants from selected monsters
  const combatants = selectedMonsters.map((monster, index) => {
    return {
      id: `combatant-${Date.now()}-${index}`,
      name: monster.name,
      monsterId: monster.id,
      hp: monster.hp,
      maxHp: monster.hp,
      ac: monster.ac,
      initiative: 0,
      type: 'monster',
      conditions: []
    };
  });
  
  // Generate encounter name and description
  let encounterName = "Random Encounter";
  let encounterDescription = "";
  
  if (selectedMonsters.length === 1) {
    encounterName = `Encounter with ${selectedMonsters[0].name}`;
    encounterDescription = `A single ${selectedMonsters[0].name} appears.`;
  } else if (selectedMonsters.length > 1) {
    // Group monsters by type
    const monsterGroups = {};
    selectedMonsters.forEach(monster => {
      if (!monsterGroups[monster.name]) {
        monsterGroups[monster.name] = 0;
      }
      monsterGroups[monster.name]++;
    });
    
    // Create description from groups
    const groupDescriptions = Object.entries(monsterGroups).map(([name, count]) => {
      return count === 1 ? `1 ${name}` : `${count} ${name}s`;
    });
    
    encounterName = "Mixed Monster Encounter";
    encounterDescription = `An encounter featuring ${groupDescriptions.join(', ')}.`;
  }
  
  // Add environment information if available
  if (environment) {
    const environmentInfo = environments.find(e => e.id === environment);
    if (environmentInfo) {
      encounterDescription += ` Set in a ${environmentInfo.name.toLowerCase()} environment.`;
    }
  }
  
  return {
    name: encounterName,
    description: encounterDescription,
    environment: environment || null,
    difficulty: difficulty,
    combatants: combatants,
    xpTotal: currentXP,
    xpPerPlayer: Math.floor(currentXP / partySize)
  };
}

/**
 * Calculate XP thresholds for an encounter
 * @param {number} partyLevel - The average party level
 * @param {number} partySize - The number of players
 * @param {string} difficulty - The encounter difficulty
 * @returns {Object} The XP thresholds
 */
function calculateXPThresholds(partyLevel, partySize, difficulty) {
  // XP thresholds by character level (easy, medium, hard, deadly)
  const xpThresholdsByLevel = {
    1: [25, 50, 75, 100],
    2: [50, 100, 150, 200],
    3: [75, 150, 225, 400],
    4: [125, 250, 375, 500],
    5: [250, 500, 750, 1100],
    6: [300, 600, 900, 1400],
    7: [350, 750, 1100, 1700],
    8: [450, 900, 1400, 2100],
    9: [550, 1100, 1600, 2400],
    10: [600, 1200, 1900, 2800],
    11: [800, 1600, 2400, 3600],
    12: [1000, 2000, 3000, 4500],
    13: [1100, 2200, 3400, 5100],
    14: [1250, 2500, 3800, 5700],
    15: [1400, 2800, 4300, 6400],
    16: [1600, 3200, 4800, 7200],
    17: [2000, 3900, 5900, 8800],
    18: [2100, 4200, 6300, 9500],
    19: [2400, 4900, 7300, 10900],
    20: [2800, 5700, 8500, 12700]
  };
  
  // Ensure level is within bounds
  const level = Math.max(1, Math.min(20, Math.floor(partyLevel)));
  
  // Get the thresholds for this level
  const thresholds = xpThresholdsByLevel[level];
  
  // Determine the difficulty index
  let difficultyIndex;
  switch (difficulty.toLowerCase()) {
    case 'easy':
      difficultyIndex = 0;
      break;
    case 'medium':
      difficultyIndex = 1;
      break;
    case 'hard':
      difficultyIndex = 2;
      break;
    case 'deadly':
      difficultyIndex = 3;
      break;
    default:
      difficultyIndex = 1; // Default to medium
  }
  
  // Calculate the target XP based on party size and difficulty
  const baseXP = thresholds[difficultyIndex] * partySize;
  
  // Return both target and maximum (to avoid going too far over)
  return {
    target: baseXP,
    max: baseXP * 1.25 // Allow up to 25% over the target
  };
}

/**
 * Calculate XP value for a monster based on CR
 * @param {Object} monster - The monster object
 * @returns {number} The XP value
 */
function calculateMonsterXP(monster) {
  // XP values by CR
  const xpByCR = {
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
  
  // Get the CR as a string
  const cr = monster.cr.toString();
  
  // Return the XP value for this CR
  return xpByCR[cr] || 0;
}

/**
 * Save a map to the stored maps list
 * @param {Object} appData - The current application data
 * @param {Object} map - The map to save
 * @returns {Object} The updated application data
 */
export function saveMap(appData, map) {
  // Create a copy of the app data
  const updatedData = { ...appData };
  
  // Check if this is an update to an existing map
  if (map.id) {
    const index = updatedData.maps.findIndex(m => m.id === map.id);
    if (index !== -1) {
      // Update existing map
      updatedData.maps[index] = {
        ...map,
        lastModified: new Date().toISOString()
      };
    } else {
      // Add as new with existing ID
      updatedData.maps.push({
        ...map,
        lastModified: new Date().toISOString()
      });
    }
  } else {
    // Add new map with generated ID
    updatedData.maps.push({
      ...map,
      id: `map-${Date.now()}`,
      created: new Date().toISOString(),
      lastModified: new Date().toISOString()
    });
  }
  
  return updatedData;
}

/**
 * Delete a map from the stored maps list
 * @param {Object} appData - The current application data
 * @param {string} mapId - The ID of the map to delete
 * @returns {Object} The updated application data
 */
export function deleteMap(appData, mapId) {
  // Create a copy of the app data
  const updatedData = { ...appData };
  
  // Filter out the map with the specified ID
  updatedData.maps = updatedData.maps.filter(m => m.id !== mapId);
  
  return updatedData;
}

/**
 * Save a custom condition to the stored custom conditions list
 * @param {Object} appData - The current application data
 * @param {Object} condition - The custom condition to save
 * @returns {Object} The updated application data
 */
export function saveCustomCondition(appData, condition) {
  // Create a copy of the app data
  const updatedData = { ...appData };
  
  // Check if this is an update to an existing condition
  if (condition.id) {
    const index = updatedData.customConditions.findIndex(c => c.id === condition.id);
    if (index !== -1) {
      // Update existing condition
      updatedData.customConditions[index] = {
        ...condition,
        lastModified: new Date().toISOString()
      };
    } else {
      // Add as new with existing ID
      updatedData.customConditions.push({
        ...condition,
        lastModified: new Date().toISOString()
      });
    }
  } else {
    // Add new condition with generated ID
    updatedData.customConditions.push({
      ...condition,
      id: `condition-${Date.now()}`,
      created: new Date().toISOString(),
      lastModified: new Date().toISOString()
    });
  }
  
  return updatedData;
}

/**
 * Delete a custom condition from the stored custom conditions list
 * @param {Object} appData - The current application data
 * @param {string} conditionId - The ID of the condition to delete
 * @returns {Object} The updated application data
 */
export function deleteCustomCondition(appData, conditionId) {
  // Create a copy of the app data
  const updatedData = { ...appData };
  
  // Filter out the condition with the specified ID
  updatedData.customConditions = updatedData.customConditions.filter(c => c.id !== conditionId);
  
  return updatedData;
}

/**
 * Save a custom spell to the stored custom spells list
 * @param {Object} appData - The current application data
 * @param {Object} spell - The custom spell to save
 * @returns {Object} The updated application data
 */
export function saveCustomSpell(appData, spell) {
  // Create a copy of the app data
  const updatedData = { ...appData };
  
  // Check if this is an update to an existing spell
  if (spell.id) {
    const index = updatedData.customSpells.findIndex(s => s.id === spell.id);
    if (index !== -1) {
      // Update existing spell
      updatedData.customSpells[index] = {
        ...spell,
        lastModified: new Date().toISOString()
      };
    } else {
      // Add as new with existing ID
      updatedData.customSpells.push({
        ...spell,
        lastModified: new Date().toISOString()
      });
    }
  } else {
    // Add new spell with generated ID
    updatedData.customSpells.push({
      ...spell,
      id: `spell-${Date.now()}`,
      created: new Date().toISOString(),
      lastModified: new Date().toISOString()
    });
  }
  
  return updatedData;
}

/**
 * Delete a custom spell from the stored custom spells list
 * @param {Object} appData - The current application data
 * @param {string} spellId - The ID of the spell to delete
 * @returns {Object} The updated application data
 */
export function deleteCustomSpell(appData, spellId) {
  // Create a copy of the app data
  const updatedData = { ...appData };
  
  // Filter out the spell with the specified ID
  updatedData.customSpells = updatedData.customSpells.filter(s => s.id !== spellId);
  
  return updatedData;
}

/**
 * Save a custom item to the stored custom items list
 * @param {Object} appData - The current application data
 * @param {Object} item - The custom item to save
 * @returns {Object} The updated application data
 */
export function saveCustomItem(appData, item) {
  // Create a copy of the app data
  const updatedData = { ...appData };
  
  // Check if this is an update to an existing item
  if (item.id) {
    const index = updatedData.customItems.findIndex(i => i.id === item.id);
    if (index !== -1) {
      // Update existing item
      updatedData.customItems[index] = {
        ...item,
        lastModified: new Date().toISOString()
      };
    } else {
      // Add as new with existing ID
      updatedData.customItems.push({
        ...item,
        lastModified: new Date().toISOString()
      });
    }
  } else {
    // Add new item with generated ID
    updatedData.customItems.push({
      ...item,
      id: `item-${Date.now()}`,
      created: new Date().toISOString(),
      lastModified: new Date().toISOString()
    });
  }
  
  return updatedData;
}

/**
 * Delete a custom item from the stored custom items list
 * @param {Object} appData - The current application data
 * @param {string} itemId - The ID of the item to delete
 * @returns {Object} The updated application data
 */
export function deleteCustomItem(appData, itemId) {
  // Create a copy of the app data
  const updatedData = { ...appData };
  
  // Filter out the item with the specified ID
  updatedData.customItems = updatedData.customItems.filter(i => i.id !== itemId);
  
  return updatedData;
}

/**
 * Check if the browser supports local storage
 * @returns {boolean} True if local storage is supported
 */
export function isLocalStorageSupported() {
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
 * Estimate the local storage usage
 * @returns {Object} Storage usage information
 */
export function getStorageUsage() {
  try {
    let totalSize = 0;
    let itemCount = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      totalSize += key.length + value.length;
      itemCount++;
    }
    
    // Convert to KB
    const sizeInKB = totalSize / 1024;
    
    // Estimate percentage used (5MB is typical limit)
    const percentUsed = (sizeInKB / 5120) * 100;
    
    return {
      sizeBytes: totalSize,
      sizeKB: sizeInKB.toFixed(2),
      percentUsed: percentUsed.toFixed(2),
      itemCount
    };
  } catch (e) {
    console.error('Error calculating storage usage:', e);
    return {
      sizeBytes: 0,
      sizeKB: '0.00',
      percentUsed: '0.00',
      itemCount: 0
    };
  }
}

/**
 * Create a backup of all application data
 * @param {Object} appData - The current application data
 * @returns {string} Backup filename
 */
export function createBackup(appData) {
  try {
    // Add timestamp to backup
    const backupData = {
      ...appData,
      backupTimestamp: new Date().toISOString()
    };
    
    // Create backup file
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const backupFilename = `jct_backup_${new Date().toISOString().replace(/:/g, '-')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', backupFilename);
    linkElement.click();
    
    return backupFilename;
  } catch (error) {
    console.error('Error creating backup:', error);
    return null;
  }
}

/**
 * Restore application data from a backup
 * @param {Object} backupData - The backup data to restore
 * @returns {Object} The restored application data
 */
export function restoreFromBackup(backupData) {
  try {
    // Validate backup data
    if (!validateImportedData(backupData)) {
      throw new Error('Invalid backup data format');
    }
    
    // Migrate if necessary
    if (backupData.version !== DEFAULT_APP_DATA.version) {
      return migrateData(backupData);
    }
    
    return backupData;
  } catch (error) {
    console.error('Error restoring from backup:', error);
    return null;
  }
}

/**
 * Calculate the estimated encounter difficulty
 * @param {Array} combatants - The combatants in the encounter
 * @param {number} partyLevel - The average party level
 * @param {number} partySize - The number of players
 * @returns {Object} Encounter difficulty information
 */
export function calculateEncounterDifficulty(combatants, partyLevel, partySize) {
  // Filter to just get monsters
  const monsters = combatants.filter(c => c.type === 'monster');
  
  // Calculate total XP
  let totalXP = 0;
  monsters.forEach(monster => {
    // If we have the monster's CR, use it to calculate XP
    if (monster.cr) {
      totalXP += calculateMonsterXP({ cr: monster.cr });
    } else if (monster.monsterId) {
      // If we have a monster ID but no CR, we'd need to look it up
      // This would require access to the monster database
      // For now, we'll just use a placeholder
      totalXP += 100; // Placeholder
    }
  });
  
  // Apply multiplier based on number of monsters
  let multiplier = 1;
  const monsterCount = monsters.length;
  
  if (monsterCount === 2) {
    multiplier = 1.5;
  } else if (monsterCount >= 3 && monsterCount <= 6) {
    multiplier = 2;
  } else if (monsterCount >= 7 && monsterCount <= 10) {
    multiplier = 2.5;
  } else if (monsterCount >= 11 && monsterCount <= 14) {
    multiplier = 3;
  } else if (monsterCount >= 15) {
    multiplier = 4;
  }
  
  const adjustedXP = totalXP * multiplier;
  
  // Calculate thresholds for the party
  const thresholds = {
    easy: 0,
    medium: 0,
    hard: 0,
    deadly: 0
  };
  
  // XP thresholds by character level (easy, medium, hard, deadly)
  const xpThresholdsByLevel = {
    1: [25, 50, 75, 100],
    2: [50, 100, 150, 200],
    3: [75, 150, 225, 400],
    4: [125, 250, 375, 500],
    5: [250, 500, 750, 1100],
    6: [300, 600, 900, 1400],
    7: [350, 750, 1100, 1700],
    8: [450, 900, 1400, 2100],
    9: [550, 1100, 1600, 2400],
    10: [600, 1200, 1900, 2800],
    11: [800, 1600, 2400, 3600],
    12: [1000, 2000, 3000, 4500],
    13: [1100, 2200, 3400, 5100],
    14: [1250, 2500, 3800, 5700],
    15: [1400, 2800, 4300, 6400],
    16: [1600, 3200, 4800, 7200],
    17: [2000, 3900, 5900, 8800],
    18: [2100, 4200, 6300, 9500],
    19: [2400, 4900, 7300, 10900],
    20: [2800, 5700, 8500, 12700]
  };
  
  // Ensure level is within bounds
  const level = Math.max(1, Math.min(20, Math.floor(partyLevel)));
  
  // Get the thresholds for this level
  const levelThresholds = xpThresholdsByLevel[level];
  
  // Calculate party thresholds
  thresholds.easy = levelThresholds[0] * partySize;
  thresholds.medium = levelThresholds[1] * partySize;
  thresholds.hard = levelThresholds[2] * partySize;
  thresholds.deadly = levelThresholds[3] * partySize;
  
  // Determine difficulty
  let difficulty = 'trivial';
  if (adjustedXP >= thresholds.deadly) {
    difficulty = 'deadly';
  } else if (adjustedXP >= thresholds.hard) {
    difficulty = 'hard';
  } else if (adjustedXP >= thresholds.medium) {
    difficulty = 'medium';
  } else if (adjustedXP >= thresholds.easy) {
    difficulty = 'easy';
  }
  
  return {
    totalXP,
    adjustedXP,
    xpPerPlayer: Math.floor(totalXP / partySize),
    multiplier,
    thresholds,
    difficulty
  };
}

// Export default app data for use in other modules
export const defaultAppData = DEFAULT_APP_DATA;
