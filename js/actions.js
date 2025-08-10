/**
 * Jesster's Combat Tracker
 * Redux Actions
 * Version 2.3.1
 * 
 * This file contains all the Redux action creators for the application.
 * Actions are payloads of information that send data from the application
 * to the store. They are the only source of information for the store.
 */

// Action Types
export const ActionTypes = {
  // Initiative Tracker Actions
  ADD_COMBATANT: 'ADD_COMBATANT',
  REMOVE_COMBATANT: 'REMOVE_COMBATANT',
  UPDATE_COMBATANT: 'UPDATE_COMBATANT',
  SET_ACTIVE_COMBATANT: 'SET_ACTIVE_COMBATANT',
  NEXT_TURN: 'NEXT_TURN',
  PREVIOUS_TURN: 'PREVIOUS_TURN',
  ROLL_INITIATIVE: 'ROLL_INITIATIVE',
  SORT_INITIATIVE: 'SORT_INITIATIVE',
  CLEAR_COMBAT: 'CLEAR_COMBAT',
  START_COMBAT: 'START_COMBAT',
  END_COMBAT: 'END_COMBAT',
  SET_ROUND: 'SET_ROUND',
  
  // Health and Damage Actions
  APPLY_DAMAGE: 'APPLY_DAMAGE',
  APPLY_HEALING: 'APPLY_HEALING',
  SET_TEMPORARY_HP: 'SET_TEMPORARY_HP',
  SET_MAX_HP: 'SET_MAX_HP',
  
  // Condition Actions
  ADD_CONDITION: 'ADD_CONDITION',
  REMOVE_CONDITION: 'REMOVE_CONDITION',
  UPDATE_CONDITION: 'UPDATE_CONDITION',
  
  // Encounter Actions
  LOAD_ENCOUNTER: 'LOAD_ENCOUNTER',
  SAVE_ENCOUNTER: 'SAVE_ENCOUNTER',
  DELETE_ENCOUNTER: 'DELETE_ENCOUNTER',
  UPDATE_ENCOUNTER: 'UPDATE_ENCOUNTER',
  
  // Monster Actions
  ADD_MONSTER: 'ADD_MONSTER',
  LOAD_MONSTER: 'LOAD_MONSTER',
  LOAD_MONSTERS: 'LOAD_MONSTERS',
  
  // UI Actions
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_THEME: 'SET_THEME',
  SHOW_MODAL: 'SHOW_MODAL',
  HIDE_MODAL: 'HIDE_MODAL',
  SET_VIEW: 'SET_VIEW',
  TOGGLE_COMPACT_MODE: 'TOGGLE_COMPACT_MODE',
  
  // Dice Actions
  ROLL_DICE: 'ROLL_DICE',
  CLEAR_DICE_HISTORY: 'CLEAR_DICE_HISTORY',
  
  // Note Actions
  ADD_NOTE: 'ADD_NOTE',
  UPDATE_NOTE: 'UPDATE_NOTE',
  DELETE_NOTE: 'DELETE_NOTE',
  
  // Settings Actions
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  RESET_SETTINGS: 'RESET_SETTINGS',
  
  // Data Actions
  LOAD_DATA: 'LOAD_DATA',
  SAVE_DATA: 'SAVE_DATA',
  IMPORT_DATA: 'IMPORT_DATA',
  EXPORT_DATA: 'EXPORT_DATA',
  
  // Environment Actions
  SET_ENVIRONMENT: 'SET_ENVIRONMENT',
  ADD_ENVIRONMENT_EFFECT: 'ADD_ENVIRONMENT_EFFECT',
  REMOVE_ENVIRONMENT_EFFECT: 'REMOVE_ENVIRONMENT_EFFECT',
  
  // Spell Actions
  CAST_SPELL: 'CAST_SPELL',
  END_SPELL_EFFECT: 'END_SPELL_EFFECT',
  
  // Time Tracking Actions
  ADVANCE_TIME: 'ADVANCE_TIME',
  SET_TIME: 'SET_TIME',
  
  // Error Handling
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // App State
  INITIALIZE_APP: 'INITIALIZE_APP',
  SET_LOADING: 'SET_LOADING'
};

// Initiative Tracker Actions
/**
 * Add a new combatant to the initiative order
 * @param {Object} combatant - The combatant to add
 * @returns {Object} Action
 */
export const addCombatant = (combatant) => ({
  type: ActionTypes.ADD_COMBATANT,
  payload: {
    combatant: {
      id: combatant.id || `combatant-${Date.now()}`,
      name: combatant.name || 'New Combatant',
      initiative: combatant.initiative || 0,
      hp: combatant.hp || 0,
      maxHp: combatant.maxHp || 0,
      tempHp: combatant.tempHp || 0,
      ac: combatant.ac || 10,
      type: combatant.type || 'monster', // 'player', 'monster', 'npc'
      conditions: combatant.conditions || [],
      notes: combatant.notes || '',
      stats: combatant.stats || {},
      active: false,
      visible: combatant.visible !== undefined ? combatant.visible : true,
      ...combatant
    }
  }
});

/**
 * Remove a combatant from the initiative order
 * @param {string} id - The ID of the combatant to remove
 * @returns {Object} Action
 */
export const removeCombatant = (id) => ({
  type: ActionTypes.REMOVE_COMBATANT,
  payload: { id }
});

/**
 * Update a combatant's properties
 * @param {string} id - The ID of the combatant to update
 * @param {Object} updates - The properties to update
 * @returns {Object} Action
 */
export const updateCombatant = (id, updates) => ({
  type: ActionTypes.UPDATE_COMBATANT,
  payload: { id, updates }
});

/**
 * Set the active combatant in the initiative order
 * @param {string} id - The ID of the combatant to set as active
 * @returns {Object} Action
 */
export const setActiveCombatant = (id) => ({
  type: ActionTypes.SET_ACTIVE_COMBATANT,
  payload: { id }
});

/**
 * Advance to the next turn in initiative order
 * @returns {Object} Action
 */
export const nextTurn = () => ({
  type: ActionTypes.NEXT_TURN
});

/**
 * Go back to the previous turn in initiative order
 * @returns {Object} Action
 */
export const previousTurn = () => ({
  type: ActionTypes.PREVIOUS_TURN
});

/**
 * Roll initiative for all combatants that don't have an initiative value
 * @returns {Object} Action
 */
export const rollInitiative = () => ({
  type: ActionTypes.ROLL_INITIATIVE
});

/**
 * Sort the initiative order from highest to lowest
 * @returns {Object} Action
 */
export const sortInitiative = () => ({
  type: ActionTypes.SORT_INITIATIVE
});

/**
 * Clear all combatants from the initiative tracker
 * @returns {Object} Action
 */
export const clearCombat = () => ({
  type: ActionTypes.CLEAR_COMBAT
});

/**
 * Start combat, setting the first combatant as active
 * @returns {Object} Action
 */
export const startCombat = () => ({
  type: ActionTypes.START_COMBAT
});

/**
 * End combat, clearing the active combatant
 * @returns {Object} Action
 */
export const endCombat = () => ({
  type: ActionTypes.END_COMBAT
});

/**
 * Set the current combat round
 * @param {number} round - The round number to set
 * @returns {Object} Action
 */
export const setRound = (round) => ({
  type: ActionTypes.SET_ROUND,
  payload: { round }
});

// Health and Damage Actions
/**
 * Apply damage to a combatant
 * @param {string} id - The ID of the combatant
 * @param {number} amount - The amount of damage to apply
 * @param {string} damageType - The type of damage (optional)
 * @returns {Object} Action
 */
export const applyDamage = (id, amount, damageType = null) => ({
  type: ActionTypes.APPLY_DAMAGE,
  payload: { id, amount, damageType }
});

/**
 * Apply healing to a combatant
 * @param {string} id - The ID of the combatant
 * @param {number} amount - The amount of healing to apply
 * @returns {Object} Action
 */
export const applyHealing = (id, amount) => ({
  type: ActionTypes.APPLY_HEALING,
  payload: { id, amount }
});

/**
 * Set temporary hit points for a combatant
 * @param {string} id - The ID of the combatant
 * @param {number} amount - The amount of temporary HP to set
 * @returns {Object} Action
 */
export const setTemporaryHp = (id, amount) => ({
  type: ActionTypes.SET_TEMPORARY_HP,
  payload: { id, amount }
});

/**
 * Set maximum hit points for a combatant
 * @param {string} id - The ID of the combatant
 * @param {number} maxHp - The maximum HP to set
 * @returns {Object} Action
 */
export const setMaxHp = (id, maxHp) => ({
  type: ActionTypes.SET_MAX_HP,
  payload: { id, maxHp }
});

// Condition Actions
/**
 * Add a condition to a combatant
 * @param {string} combatantId - The ID of the combatant
 * @param {Object} condition - The condition to add
 * @returns {Object} Action
 */
export const addCondition = (combatantId, condition) => ({
  type: ActionTypes.ADD_CONDITION,
  payload: {
    combatantId,
    condition: {
      id: condition.id || `condition-${Date.now()}`,
      name: condition.name,
      duration: condition.duration || null,
      startRound: condition.startRound || null,
      endRound: condition.endRound || null,
      saveDC: condition.saveDC || null,
      saveType: condition.saveType || null,
      source: condition.source || null,
      ...condition
    }
  }
});

/**
 * Remove a condition from a combatant
 * @param {string} combatantId - The ID of the combatant
 * @param {string} conditionId - The ID of the condition to remove
 * @returns {Object} Action
 */
export const removeCondition = (combatantId, conditionId) => ({
  type: ActionTypes.REMOVE_CONDITION,
  payload: { combatantId, conditionId }
});

/**
 * Update a condition on a combatant
 * @param {string} combatantId - The ID of the combatant
 * @param {string} conditionId - The ID of the condition to update
 * @param {Object} updates - The properties to update
 * @returns {Object} Action
 */
export const updateCondition = (combatantId, conditionId, updates) => ({
  type: ActionTypes.UPDATE_CONDITION,
  payload: { combatantId, conditionId, updates }
});

// Encounter Actions
/**
 * Load an encounter into the initiative tracker
 * @param {Object} encounter - The encounter to load
 * @returns {Object} Action
 */
export const loadEncounter = (encounter) => ({
  type: ActionTypes.LOAD_ENCOUNTER,
  payload: { encounter }
});

/**
 * Save the current state as an encounter
 * @param {string} name - The name of the encounter
 * @param {string} description - The description of the encounter (optional)
 * @returns {Object} Action
 */
export const saveEncounter = (name, description = '') => ({
  type: ActionTypes.SAVE_ENCOUNTER,
  payload: { name, description }
});

/**
 * Delete a saved encounter
 * @param {string} id - The ID of the encounter to delete
 * @returns {Object} Action
 */
export const deleteEncounter = (id) => ({
  type: ActionTypes.DELETE_ENCOUNTER,
  payload: { id }
});

/**
 * Update a saved encounter
 * @param {string} id - The ID of the encounter to update
 * @param {Object} updates - The properties to update
 * @returns {Object} Action
 */
export const updateEncounter = (id, updates) => ({
  type: ActionTypes.UPDATE_ENCOUNTER,
  payload: { id, updates }
});

// Monster Actions
/**
 * Add a monster to the initiative tracker
 * @param {Object} monster - The monster to add
 * @param {number} quantity - The number of this monster to add (optional)
 * @returns {Object} Action
 */
export const addMonster = (monster, quantity = 1) => ({
  type: ActionTypes.ADD_MONSTER,
  payload: { monster, quantity }
});

/**
 * Load a monster from the database
 * @param {string} id - The ID of the monster to load
 * @returns {Object} Action
 */
export const loadMonster = (id) => ({
  type: ActionTypes.LOAD_MONSTER,
  payload: { id }
});

/**
 * Load multiple monsters from the database
 * @param {Array} ids - The IDs of the monsters to load
 * @returns {Object} Action
 */
export const loadMonsters = (ids) => ({
  type: ActionTypes.LOAD_MONSTERS,
  payload: { ids }
});

// UI Actions
/**
 * Toggle the sidebar visibility
 * @returns {Object} Action
 */
export const toggleSidebar = () => ({
  type: ActionTypes.TOGGLE_SIDEBAR
});

/**
 * Set the application theme
 * @param {string} theme - The theme ID to set
 * @returns {Object} Action
 */
export const setTheme = (theme) => ({
  type: ActionTypes.SET_THEME,
  payload: { theme }
});

/**
 * Show a modal dialog
 * @param {string} modalType - The type of modal to show
 * @param {Object} modalProps - The properties to pass to the modal (optional)
 * @returns {Object} Action
 */
export const showModal = (modalType, modalProps = {}) => ({
  type: ActionTypes.SHOW_MODAL,
  payload: { modalType, modalProps }
});

/**
 * Hide the currently visible modal dialog
 * @returns {Object} Action
 */
export const hideModal = () => ({
  type: ActionTypes.HIDE_MODAL
});

/**
 * Set the current view in the application
 * @param {string} view - The view to display
 * @returns {Object} Action
 */
export const setView = (view) => ({
  type: ActionTypes.SET_VIEW,
  payload: { view }
});

/**
 * Toggle compact mode for the initiative tracker
 * @returns {Object} Action
 */
export const toggleCompactMode = () => ({
  type: ActionTypes.TOGGLE_COMPACT_MODE
});

// Dice Actions
/**
 * Roll dice and record the result
 * @param {string} formula - The dice formula to roll (e.g., "2d6+3")
 * @param {string} label - A label for the roll (optional)
 * @returns {Object} Action
 */
export const rollDice = (formula, label = '') => ({
  type: ActionTypes.ROLL_DICE,
  payload: { formula, label }
});

/**
 * Clear the dice roll history
 * @returns {Object} Action
 */
export const clearDiceHistory = () => ({
  type: ActionTypes.CLEAR_DICE_HISTORY
});

// Note Actions
/**
 * Add a new note
 * @param {Object} note - The note to add
 * @returns {Object} Action
 */
export const addNote = (note) => ({
  type: ActionTypes.ADD_NOTE,
  payload: {
    note: {
      id: note.id || `note-${Date.now()}`,
      title: note.title || 'New Note',
      content: note.content || '',
      createdAt: note.createdAt || new Date().toISOString(),
      updatedAt: note.updatedAt || new Date().toISOString(),
      tags: note.tags || [],
      ...note
    }
  }
});

/**
 * Update an existing note
 * @param {string} id - The ID of the note to update
 * @param {Object} updates - The properties to update
 * @returns {Object} Action
 */
export const updateNote = (id, updates) => ({
  type: ActionTypes.UPDATE_NOTE,
  payload: {
    id,
    updates: {
      ...updates,
      updatedAt: new Date().toISOString()
    }
  }
});

/**
 * Delete a note
 * @param {string} id - The ID of the note to delete
 * @returns {Object} Action
 */
export const deleteNote = (id) => ({
  type: ActionTypes.DELETE_NOTE,
  payload: { id }
});

// Settings Actions
/**
 * Update application settings
 * @param {Object} settings - The settings to update
 * @returns {Object} Action
 */
export const updateSettings = (settings) => ({
  type: ActionTypes.UPDATE_SETTINGS,
  payload: { settings }
});

/**
 * Reset settings to default values
 * @returns {Object} Action
 */
export const resetSettings = () => ({
  type: ActionTypes.RESET_SETTINGS
});

// Data Actions
/**
 * Load data from storage
 * @returns {Object} Action
 */
export const loadData = () => ({
  type: ActionTypes.LOAD_DATA
});

/**
 * Save data to storage
 * @returns {Object} Action
 */
export const saveData = () => ({
  type: ActionTypes.SAVE_DATA
});

/**
 * Import data from a file
 * @param {Object} data - The data to import
 * @returns {Object} Action
 */
export const importData = (data) => ({
  type: ActionTypes.IMPORT_DATA,
  payload: { data }
});

/**
 * Export data to a file
 * @returns {Object} Action
 */
export const exportData = () => ({
  type: ActionTypes.EXPORT_DATA
});

// Environment Actions
/**
 * Set the current environment
 * @param {string} environmentId - The ID of the environment to set
 * @returns {Object} Action
 */
export const setEnvironment = (environmentId) => ({
  type: ActionTypes.SET_ENVIRONMENT,
  payload: { environmentId }
});

/**
 * Add an environmental effect
 * @param {Object} effect - The effect to add
 * @returns {Object} Action
 */
export const addEnvironmentEffect = (effect) => ({
  type: ActionTypes.ADD_ENVIRONMENT_EFFECT,
  payload: {
    effect: {
      id: effect.id || `effect-${Date.now()}`,
      name: effect.name || 'New Effect',
      description: effect.description || '',
      duration: effect.duration || null,
      ...effect
    }
  }
});

/**
 * Remove an environmental effect
 * @param {string} effectId - The ID of the effect to remove
 * @returns {Object} Action
 */
export const removeEnvironmentEffect = (effectId) => ({
  type: ActionTypes.REMOVE_ENVIRONMENT_EFFECT,
  payload: { effectId }
});

// Spell Actions
/**
 * Cast a spell
 * @param {string} spellId - The ID of the spell to cast
 * @param {string} casterId - The ID of the caster
 * @param {number} level - The level at which to cast the spell (optional)
 * @param {Array} targets - The targets of the spell (optional)
 * @returns {Object} Action
 */
export const castSpell = (spellId, casterId, level = null, targets = []) => ({
  type: ActionTypes.CAST_SPELL,
  payload: { spellId, casterId, level, targets }
});

/**
 * End a spell effect
 * @param {string} effectId - The ID of the spell effect to end
 * @returns {Object} Action
 */
export const endSpellEffect = (effectId) => ({
  type: ActionTypes.END_SPELL_EFFECT,
  payload: { effectId }
});

// Time Tracking Actions
/**
 * Advance time by a specified amount
 * @param {number} amount - The amount of time to advance
 * @param {string} unit - The unit of time ('round', 'minute', 'hour', 'day')
 * @returns {Object} Action
 */
export const advanceTime = (amount, unit) => ({
  type: ActionTypes.ADVANCE_TIME,
  payload: { amount, unit }
});

/**
 * Set the current time
 * @param {Object} time - The time to set
 * @returns {Object} Action
 */
export const setTime = (time) => ({
  type: ActionTypes.SET_TIME,
  payload: { time }
});

// Error Handling
/**
 * Set an error message
 * @param {string} message - The error message
 * @param {string} type - The type of error (optional)
 * @returns {Object} Action
 */
export const setError = (message, type = 'error') => ({
  type: ActionTypes.SET_ERROR,
  payload: { message, type }
});

/**
 * Clear the current error message
 * @returns {Object} Action
 */
export const clearError = () => ({
  type: ActionTypes.CLEAR_ERROR
});

// App State
/**
 * Initialize the application
 * @returns {Object} Action
 */
export const initializeApp = () => ({
  type: ActionTypes.INITIALIZE_APP
});

/**
 * Set the loading state
 * @param {boolean} isLoading - Whether the app is loading
 * @param {string} loadingMessage - A message to display while loading (optional)
 * @returns {Object} Action
 */
export const setLoading = (isLoading, loadingMessage = '') => ({
  type: ActionTypes.SET_LOADING,
  payload: { isLoading, loadingMessage }
});
