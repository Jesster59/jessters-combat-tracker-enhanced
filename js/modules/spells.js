/**
 * Jesster's Combat Tracker
 * Spells Module
 * Version 2.3.1
 * 
 * This module handles spell data, casting, and management,
 * providing a comprehensive system for working with spells.
 */

/**
 * Spell schools
 */
export const SpellSchool = {
  ABJURATION: 'abjuration',
  CONJURATION: 'conjuration',
  DIVINATION: 'divination',
  ENCHANTMENT: 'enchantment',
  EVOCATION: 'evocation',
  ILLUSION: 'illusion',
  NECROMANCY: 'necromancy',
  TRANSMUTATION: 'transmutation'
};

/**
 * Spell components
 */
export const SpellComponent = {
  VERBAL: 'V',
  SOMATIC: 'S',
  MATERIAL: 'M'
};

/**
 * Spell casting times
 */
export const SpellCastingTime = {
  ACTION: 'action',
  BONUS_ACTION: 'bonus action',
  REACTION: 'reaction',
  MINUTE: 'minute',
  HOUR: 'hour',
  RITUAL: 'ritual'
};

/**
 * Spell durations
 */
export const SpellDuration = {
  INSTANTANEOUS: 'instantaneous',
  CONCENTRATION: 'concentration',
  ROUND: 'round',
  MINUTE: 'minute',
  HOUR: 'hour',
  DAY: 'day',
  SPECIAL: 'special'
};

/**
 * Spell ranges
 */
export const SpellRange = {
  SELF: 'self',
  TOUCH: 'touch',
  SIGHT: 'sight',
  FEET: 'feet',
  MILES: 'miles',
  UNLIMITED: 'unlimited'
};

/**
 * Spell area types
 */
export const SpellAreaType = {
  CONE: 'cone',
  CUBE: 'cube',
  CYLINDER: 'cylinder',
  LINE: 'line',
  SPHERE: 'sphere',
  SQUARE: 'square'
};

/**
 * Spell damage types
 */
export const SpellDamageType = {
  ACID: 'acid',
  BLUDGEONING: 'bludgeoning',
  COLD: 'cold',
  FIRE: 'fire',
  FORCE: 'force',
  LIGHTNING: 'lightning',
  NECROTIC: 'necrotic',
  PIERCING: 'piercing',
  POISON: 'poison',
  PSYCHIC: 'psychic',
  RADIANT: 'radiant',
  SLASHING: 'slashing',
  THUNDER: 'thunder'
};

/**
 * Spell save types
 */
export const SpellSaveType = {
  STR: 'str',
  DEX: 'dex',
  CON: 'con',
  INT: 'int',
  WIS: 'wis',
  CHA: 'cha',
  NONE: 'none'
};

/**
 * Class representing a spell
 */
export class Spell {
  /**
   * Create a spell
   * @param {Object} data - Spell data
   */
  constructor(data = {}) {
    this.id = data.id || generateId();
    this.name = data.name || 'Unknown Spell';
    this.level = data.level !== undefined ? data.level : 0;
    this.school = data.school || SpellSchool.EVOCATION;
    this.castingTime = data.castingTime || SpellCastingTime.ACTION;
    this.range = data.range || { type: SpellRange.SELF, distance: 0 };
    this.components = data.components || { V: true, S: true, M: false };
    this.materials = data.materials || '';
    this.duration = data.duration || { type: SpellDuration.INSTANTANEOUS, length: 0 };
    this.concentration = data.concentration !== undefined ? data.concentration : false;
    this.ritual = data.ritual !== undefined ? data.ritual : false;
    this.description = data.description || '';
    this.higherLevels = data.higherLevels || '';
    this.classes = data.classes || [];
    this.source = data.source || '';
    this.page = data.page || '';
    this.damageType = data.damageType || null;
    this.damage = data.damage || {};
    this.saveType = data.saveType || SpellSaveType.NONE;
    this.area = data.area || null;
    this.targets = data.targets || 'one creature';
    this.healing = data.healing || null;
    this.conditions = data.conditions || [];
    this.tags = data.tags || [];
    this.customProperties = data.customProperties || {};
  }

  /**
   * Get the spell level as a string
   * @returns {string} The spell level
   */
  getLevelString() {
    if (this.level === 0) {
      return 'Cantrip';
    }
    
    return `Level ${this.level}`;
  }

  /**
   * Get the spell components as a string
   * @returns {string} The spell components
   */
  getComponentsString() {
    const components = [];
    
    if (this.components.V) components.push('V');
    if (this.components.S) components.push('S');
    if (this.components.M) {
      if (this.materials) {
        components.push(`M (${this.materials})`);
      } else {
        components.push('M');
      }
    }
    
    return components.join(', ');
  }

  /**
   * Get the spell duration as a string
   * @returns {string} The spell duration
   */
  getDurationString() {
    let durationStr = '';
    
    if (this.concentration) {
      durationStr += 'Concentration, ';
    }
    
    switch (this.duration.type) {
      case SpellDuration.INSTANTANEOUS:
        durationStr += 'Instantaneous';
        break;
      case SpellDuration.ROUND:
        durationStr += `${this.duration.length} ${this.duration.length === 1 ? 'round' : 'rounds'}`;
        break;
      case SpellDuration.MINUTE:
        durationStr += `${this.duration.length} ${this.duration.length === 1 ? 'minute' : 'minutes'}`;
        break;
      case SpellDuration.HOUR:
        durationStr += `${this.duration.length} ${this.duration.length === 1 ? 'hour' : 'hours'}`;
        break;
      case SpellDuration.DAY:
        durationStr += `${this.duration.length} ${this.duration.length === 1 ? 'day' : 'days'}`;
        break;
      case SpellDuration.SPECIAL:
        durationStr += 'Special';
        break;
      default:
        durationStr += 'Instantaneous';
    }
    
    return durationStr;
  }

  /**
   * Get the spell range as a string
   * @returns {string} The spell range
   */
  getRangeString() {
    switch (this.range.type) {
      case SpellRange.SELF:
        return 'Self';
      case SpellRange.TOUCH:
        return 'Touch';
      case SpellRange.SIGHT:
        return 'Sight';
      case SpellRange.FEET:
        return `${this.range.distance} feet`;
      case SpellRange.MILES:
        return `${this.range.distance} ${this.range.distance === 1 ? 'mile' : 'miles'}`;
      case SpellRange.UNLIMITED:
        return 'Unlimited';
      default:
        return 'Self';
    }
  }

  /**
   * Get the spell area as a string
   * @returns {string} The spell area
   */
  getAreaString() {
    if (!this.area) {
      return '';
    }
    
    switch (this.area.type) {
      case SpellAreaType.CONE:
        return `${this.area.size}-foot cone`;
      case SpellAreaType.CUBE:
        return `${this.area.size}-foot cube`;
      case SpellAreaType.CYLINDER:
        return `${this.area.radius}-foot radius, ${this.area.height}-foot high cylinder`;
      case SpellAreaType.LINE:
        return `Line ${this.area.length} feet long and ${this.area.width} feet wide`;
      case SpellAreaType.SPHERE:
        return `${this.area.radius}-foot-radius sphere`;
      case SpellAreaType.SQUARE:
        return `${this.area.size}-foot square`;
      default:
        return '';
    }
  }

  /**
   * Get the spell damage at a specific level
   * @param {number} level - The spell level
   * @returns {Object|null} The damage information
   */
  getDamageAtLevel(level) {
    // For cantrips, use character level
    if (this.level === 0) {
      return this.damage[level] || this.damage[1] || null;
    }
    
    // For leveled spells, use spell slot level
    const spellLevel = Math.max(this.level, level);
    return this.damage[spellLevel] || null;
  }

  /**
   * Get the spell healing at a specific level
   * @param {number} level - The spell level
   * @returns {Object|null} The healing information
   */
  getHealingAtLevel(level) {
    // For cantrips, use character level
    if (this.level === 0) {
      return this.healing?.[level] || this.healing?.[1] || null;
    }
    
    // For leveled spells, use spell slot level
    const spellLevel = Math.max(this.level, level);
    return this.healing?.[spellLevel] || null;
  }

  /**
   * Check if the spell is available to a specific class
   * @param {string} className - The class name
   * @returns {boolean} True if the spell is available to the class
   */
  isAvailableToClass(className) {
    return this.classes.some(cls => 
      cls.toLowerCase() === className.toLowerCase()
    );
  }

  /**
   * Convert the spell to a plain object for serialization
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      level: this.level,
      school: this.school,
      castingTime: this.castingTime,
      range: this.range,
      components: this.components,
      materials: this.materials,
      duration: this.duration,
      concentration: this.concentration,
      ritual: this.ritual,
      description: this.description,
      higherLevels: this.higherLevels,
      classes: this.classes,
      source: this.source,
      page: this.page,
      damageType: this.damageType,
      damage: this.damage,
      saveType: this.saveType,
      area: this.area,
      targets: this.targets,
      healing: this.healing,
      conditions: this.conditions,
      tags: this.tags,
      customProperties: this.customProperties
    };
  }

  /**
   * Create a spell from a plain object
   * @param {Object} data - The plain object data
   * @returns {Spell} A new spell instance
   */
  static fromJSON(data) {
    return new Spell(data);
  }
}

/**
 * Class representing a spell database
 */
export class SpellDatabase {
  /**
   * Create a spell database
   */
  constructor() {
    this.spells = {};
    this.sources = [];
    this.listeners = [];
  }

  /**
   * Add a spell to the database
   * @param {Spell|Object} spell - The spell to add
   * @returns {Spell} The added spell
   */
  addSpell(spell) {
    // Convert to Spell instance if needed
    const spellInstance = spell instanceof Spell ? spell : new Spell(spell);
    
    this.spells[spellInstance.id] = spellInstance;
    
    // Add source if not already present
    if (spellInstance.source && !this.sources.includes(spellInstance.source)) {
      this.sources.push(spellInstance.source);
    }
    
    // Notify listeners
    this._notifyListeners('spellAdded', { spell: spellInstance });
    
    return spellInstance;
  }

  /**
   * Get a spell by ID
   * @param {string} id - The spell ID
   * @returns {Spell|null} The spell or null if not found
   */
  getSpell(id) {
    return this.spells[id] || null;
  }

  /**
   * Get a spell by name
   * @param {string} name - The spell name
   * @returns {Spell|null} The spell or null if not found
   */
  getSpellByName(name) {
    const normalizedName = name.toLowerCase();
    
    return Object.values(this.spells).find(
      spell => spell.name.toLowerCase() === normalizedName
    ) || null;
  }

  /**
   * Remove a spell from the database
   * @param {string} id - The ID of the spell to remove
   * @returns {boolean} True if the spell was removed
   */
  removeSpell(id) {
    if (this.spells[id]) {
      const spell = this.spells[id];
      delete this.spells[id];
      
      // Notify listeners
      this._notifyListeners('spellRemoved', { spell });
      
      return true;
    }
    
    return false;
  }

  /**
   * Update a spell in the database
   * @param {string} id - The ID of the spell to update
   * @param {Object} updates - The updates to apply
   * @returns {Spell|null} The updated spell or null if not found
   */
  updateSpell(id, updates) {
    const spell = this.getSpell(id);
    
    if (!spell) {
      return null;
    }
    
    // Apply updates
    Object.entries(updates).forEach(([key, value]) => {
      spell[key] = value;
    });
    
    // Notify listeners
    this._notifyListeners('spellUpdated', { spell });
    
    return spell;
  }

  /**
   * Get all spells
   * @returns {Array} Array of spells
   */
  getAllSpells() {
    return Object.values(this.spells);
  }

  /**
   * Get spells by level
   * @param {number} level - The spell level
   * @returns {Array} Spells of the specified level
   */
  getSpellsByLevel(level) {
    return Object.values(this.spells).filter(
      spell => spell.level === level
    );
  }

  /**
   * Get spells by school
   * @param {string} school - The spell school
   * @returns {Array} Spells of the specified school
   */
  getSpellsBySchool(school) {
    return Object.values(this.spells).filter(
      spell => spell.school === school
    );
  }

  /**
   * Get spells by class
   * @param {string} className - The class name
   * @returns {Array} Spells available to the specified class
   */
  getSpellsByClass(className) {
    return Object.values(this.spells).filter(
      spell => spell.isAvailableToClass(className)
    );
  }

  /**
   * Search for spells
   * @param {string} query - The search query
   * @param {Object} options - Search options
   * @returns {Array} Matching spells
   */
  searchSpells(query, options = {}) {
    if (!query) return [];
    
    const normalizedQuery = query.toLowerCase();
    const results = [];
    
    // Filter options
    const {
      level = null,
      school = null,
      className = null,
      concentration = null,
      ritual = null,
      source = null,
      damageType = null,
      saveType = null,
      exactMatch = false
    } = options;
    
    for (const spell of Object.values(this.spells)) {
      // Apply filters
      if (level !== null && spell.level !== level) continue;
      if (school !== null && spell.school !== school) continue;
      if (className !== null && !spell.isAvailableToClass(className)) continue;
      if (concentration !== null && spell.concentration !== concentration) continue;
      if (ritual !== null && spell.ritual !== ritual) continue;
      if (source !== null && spell.source !== source) continue;
      if (damageType !== null && spell.damageType !== damageType) continue;
      if (saveType !== null && spell.saveType !== saveType) continue;
      
      // Check for match
      const nameMatch = exactMatch
        ? spell.name.toLowerCase() === normalizedQuery
        : spell.name.toLowerCase().includes(normalizedQuery);
      
      const descriptionMatch = !exactMatch && 
        spell.description.toLowerCase().includes(normalizedQuery);
      
      if (nameMatch || descriptionMatch) {
        results.push(spell);
      }
    }
    
    return results;
  }

  /**
   * Import spells from JSON
   * @param {string} json - JSON string of spells
   * @returns {Object} Import results
   */
  importFromJSON(json) {
    try {
      const data = JSON.parse(json);
      
      if (!data.spells || !Array.isArray(data.spells)) {
        throw new Error('Invalid spell data: spells array missing');
      }
      
      const results = {
        imported: 0,
        failed: 0,
        spells: []
      };
      
      // Import spells
      data.spells.forEach(spellData => {
        try {
          const spell = new Spell(spellData);
          this.addSpell(spell);
          results.imported++;
          results.spells.push(spell);
        } catch (error) {
          console.error(`Error importing spell ${spellData.name || 'unknown'}:`, error);
          results.failed++;
        }
      });
      
      // Notify listeners
      this._notifyListeners('spellsImported', results);
      
      return results;
    } catch (error) {
      console.error('Error importing spells:', error);
      return {
        imported: 0,
        failed: 0,
        error: error.message
      };
    }
  }

  /**
   * Export spells to JSON
   * @param {Array} spellIds - IDs of spells to export (all if not specified)
   * @returns {string} JSON string of spells
   */
  exportToJSON(spellIds = null) {
    let spells;
    
    if (spellIds) {
      spells = spellIds.map(id => this.getSpell(id)).filter(Boolean);
    } else {
      spells = this.getAllSpells();
    }
    
    return JSON.stringify({
      spells,
      version: '2.3.1',
      exportDate: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Add a listener for spell database events
   * @param {Function} listener - The listener function
   * @returns {Function} Function to remove the listener
   */
  addListener(listener) {
    if (typeof listener !== 'function') {
      console.error('Listener must be a function');
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
        listener(event, data);
      } catch (error) {
        console.error('Error in spell database listener:', error);
      }
    });
  }
}

/**
 * Class for managing spell slots
 */
export class SpellSlotManager {
  /**
   * Create a spell slot manager
   * @param {Object} data - Spell slot data
   */
  constructor(data = {}) {
    this.maxSlots = data.maxSlots || {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0
    };
    
    this.usedSlots = data.usedSlots || {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0
    };
    
    this.listeners = [];
  }

  /**
   * Set the maximum number of spell slots for a level
   * @param {number} level - The spell level
   * @param {number} count - The maximum number of slots
   */
  setMaxSlots(level, count) {
    if (level < 1 || level > 9) {
      console.error(`Invalid spell level: ${level}`);
      return;
    }
    
    this.maxSlots[level] = Math.max(0, count);
    
    // Ensure used slots doesn't exceed max
    if (this.usedSlots[level] > this.maxSlots[level]) {
      this.usedSlots[level] = this.maxSlots[level];
    }
    
    this._notifyListeners('slotsChanged', { level, max: this.maxSlots[level], used: this.usedSlots[level] });
  }

  /**
   * Get the maximum number of spell slots for a level
   * @param {number} level - The spell level
   * @returns {number} The maximum number of slots
   */
  getMaxSlots(level) {
    if (level < 1 || level > 9) {
      return 0;
    }
    
    return this.maxSlots[level];
  }

  /**
   * Get the number of used spell slots for a level
   * @param {number} level - The spell level
   * @returns {number} The number of used slots
   */
  getUsedSlots(level) {
    if (level < 1 || level > 9) {
      return 0;
    }
    
    return this.usedSlots[level];
  }

  /**
   * Get the number of available spell slots for a level
   * @param {number} level - The spell level
   * @returns {number} The number of available slots
   */
  getAvailableSlots(level) {
    if (level < 1 || level > 9) {
      return 0;
    }
    
    return Math.max(0, this.maxSlots[level] - this.usedSlots[level]);
  }

  /**
   * Use a spell slot
   * @param {number} level - The spell level
   * @returns {boolean} True if the slot was used
   */
  useSlot(level) {
    if (level < 1 || level > 9) {
      return false;
    }
    
    if (this.usedSlots[level] >= this.maxSlots[level]) {
      return false;
    }
    
    this.usedSlots[level]++;
    this._notifyListeners('slotUsed', { level, used: this.usedSlots[level], available: this.getAvailableSlots(level) });
    
    return true;
  }

  /**
   * Restore a spell slot
   * @param {number} level - The spell level
   * @returns {boolean} True if the slot was restored
   */
  restoreSlot(level) {
    if (level < 1 || level > 9) {
      return false;
    }
    
    if (this.usedSlots[level] <= 0) {
      return false;
    }
    
    this.usedSlots[level]--;
    this._notifyListeners('slotRestored', { level, used: this.usedSlots[level], available: this.getAvailableSlots(level) });
    
    return true;
  }

  /**
   * Reset all spell slots (restore to max)
   */
  resetSlots() {
    for (let level = 1; level <= 9; level++) {
      this.usedSlots[level] = 0;
    }
    
    this._notifyListeners('slotsReset', { maxSlots: { ...this.maxSlots }, usedSlots: { ...this.usedSlots } });
  }

  /**
   * Add a listener for spell slot events
   * @param {Function} listener - The listener function
   * @returns {Function} Function to remove the listener
   */
  addListener(listener) {
    if (typeof listener !== 'function') {
      console.error('Listener must be a function');
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
        listener(event, data);
      } catch (error) {
        console.error('Error in spell slot manager listener:', error);
      }
    });
  }

  /**
   * Convert the spell slot manager to a plain object for serialization
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      maxSlots: { ...this.maxSlots },
      usedSlots: { ...this.usedSlots }
    };
  }

  /**
   * Create a spell slot manager from a plain object
   * @param {Object} data - The plain object data
   * @returns {SpellSlotManager} A new spell slot manager instance
   */
  static fromJSON(data) {
    return new SpellSlotManager(data);
  }
}

/**
 * Class for managing prepared spells
 */
export class PreparedSpellManager {
  /**
   * Create a prepared spell manager
   * @param {Object} data - Prepared spell data
   */
  constructor(data = {}) {
    this.preparedSpells = new Set(data.preparedSpells || []);
    this.maxPrepared = data.maxPrepared || 0;
    this.alwaysPrepared = new Set(data.alwaysPrepared || []);
    this.listeners = [];
  }

  /**
   * Set the maximum number of prepared spells
   * @param {number} count - The maximum number of prepared spells
   */
  setMaxPrepared(count) {
    this.maxPrepared = Math.max(0, count);
    this._notifyListeners('maxPreparedChanged', { maxPrepared: this.maxPrepared });
  }

  /**
   * Get the maximum number of prepared spells
   * @returns {number} The maximum number of prepared spells
   */
  getMaxPrepared() {
    return this.maxPrepared;
  }

  /**
   * Get the number of prepared spells
   * @returns {number} The number of prepared spells
   */
  getPreparedCount() {
    return this.preparedSpells.size;
  }

  /**
   * Get the number of available preparation slots
   * @returns {number} The number of available slots
   */
  getAvailableSlots() {
    // Always prepared spells don't count against the limit
    return Math.max(0, this.maxPrepared - this.preparedSpells.size);
  }

  /**
   * Check if a spell is prepared
   * @param {string} spellId - The spell ID
   * @returns {boolean} True if the spell is prepared
   */
  isSpellPrepared(spellId) {
    return this.preparedSpells.has(spellId) || this.alwaysPrepared.has(spellId);
  }

  /**
   * Prepare a spell
   * @param {string} spellId - The spell ID
   * @returns {boolean} True if the spell was prepared
   */
  prepareSpell(spellId) {
    // Check if already prepared
    if (this.preparedSpells.has(spellId) || this.alwaysPrepared.has(spellId)) {
      return false;
    }
    
    // Check if at max prepared
    if (this.preparedSpells.size >= this.maxPrepared) {
      return false;
    }
    
    this.preparedSpells.add(spellId);
    this._notifyListeners('spellPrepared', { spellId, preparedCount: this.preparedSpells.size });
    
    return true;
  }

  /**
   * Unprepare a spell
   * @param {string} spellId - The spell ID
   * @returns {boolean} True if the spell was unprepared
   */
  unprepareSpell(spellId) {
    // Can't unprepare always prepared spells
    if (this.alwaysPrepared.has(spellId)) {
      return false;
    }
    
    if (!this.preparedSpells.has(spellId)) {
      return false;
    }
    
    this.preparedSpells.delete(spellId);
    this._notifyListeners('spellUnprepared', { spellId, preparedCount: this.preparedSpells.size });
    
    return true;
  }

  /**
   * Add a spell to the always prepared list
   * @param {string} spellId - The spell ID
   * @returns {boolean} True if the spell was added
   */
  addAlwaysPrepared(spellId) {
    if (this.alwaysPrepared.has(spellId)) {
      return false;
    }
    
    // Remove from regular prepared if present
    this.preparedSpells.delete(spellId);
    
    this.alwaysPrepared.add(spellId);
    this._notifyListeners('alwaysPreparedAdded', { spellId });
    
    return true;
  }

  /**
   * Remove a spell from the always prepared list
   * @param {string} spellId - The spell ID
   * @returns {boolean} True if the spell was removed
   */
  removeAlwaysPrepared(spellId) {
    if (!this.alwaysPrepared.has(spellId)) {
      return false;
    }
    
    this.alwaysPrepared.delete(spellId);
    this._notifyListeners('alwaysPreparedRemoved', { spellId });
    
    return true;
  }

  /**
   * Get all prepared spell IDs
   * @returns {Array} Array of prepared spell IDs
   */
  getAllPreparedSpells() {
    return [...this.preparedSpells, ...this.alwaysPrepared];
  }

    /**
   * Reset prepared spells
   */
  resetPreparedSpells() {
    this.preparedSpells.clear();
    this._notifyListeners('preparedSpellsReset', {});
  }

  /**
   * Add a listener for prepared spell events
   * @param {Function} listener - The listener function
   * @returns {Function} Function to remove the listener
   */
  addListener(listener) {
    if (typeof listener !== 'function') {
      console.error('Listener must be a function');
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
        listener(event, data);
      } catch (error) {
        console.error('Error in prepared spell manager listener:', error);
      }
    });
  }

  /**
   * Convert the prepared spell manager to a plain object for serialization
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      preparedSpells: [...this.preparedSpells],
      maxPrepared: this.maxPrepared,
      alwaysPrepared: [...this.alwaysPrepared]
    };
  }

  /**
   * Create a prepared spell manager from a plain object
   * @param {Object} data - The plain object data
   * @returns {PreparedSpellManager} A new prepared spell manager instance
   */
  static fromJSON(data) {
    return new PreparedSpellManager(data);
  }
}

/**
 * Class for managing spellcasting
 */
export class SpellcastingManager {
  /**
   * Create a spellcasting manager
   * @param {Object} data - Spellcasting data
   */
  constructor(data = {}) {
    this.spellcaster = data.spellcaster || null;
    this.spellcastingAbility = data.spellcastingAbility || 'int';
    this.spellSaveDC = data.spellSaveDC || 10;
    this.spellAttackBonus = data.spellAttackBonus || 0;
    this.spellSlotManager = data.spellSlotManager || new SpellSlotManager();
    this.preparedSpellManager = data.preparedSpellManager || new PreparedSpellManager();
    this.knownSpells = new Map();
    this.listeners = [];
    
    // Initialize known spells
    if (data.knownSpells) {
      data.knownSpells.forEach(spell => {
        this.knownSpells.set(spell.id, spell);
      });
    }
  }

  /**
   * Set the spellcasting ability
   * @param {string} ability - The spellcasting ability
   */
  setSpellcastingAbility(ability) {
    this.spellcastingAbility = ability;
    this._notifyListeners('spellcastingAbilityChanged', { ability });
  }

  /**
   * Set the spell save DC
   * @param {number} dc - The spell save DC
   */
  setSpellSaveDC(dc) {
    this.spellSaveDC = dc;
    this._notifyListeners('spellSaveDCChanged', { dc });
  }

  /**
   * Set the spell attack bonus
   * @param {number} bonus - The spell attack bonus
   */
  setSpellAttackBonus(bonus) {
    this.spellAttackBonus = bonus;
    this._notifyListeners('spellAttackBonusChanged', { bonus });
  }

  /**
   * Add a spell to the known spells
   * @param {Spell|Object} spell - The spell to add
   * @returns {Spell} The added spell
   */
  addKnownSpell(spell) {
    // Convert to Spell instance if needed
    const spellInstance = spell instanceof Spell ? spell : new Spell(spell);
    
    this.knownSpells.set(spellInstance.id, spellInstance);
    this._notifyListeners('knownSpellAdded', { spell: spellInstance });
    
    return spellInstance;
  }

  /**
   * Remove a spell from the known spells
   * @param {string} spellId - The ID of the spell to remove
   * @returns {boolean} True if the spell was removed
   */
  removeKnownSpell(spellId) {
    if (!this.knownSpells.has(spellId)) {
      return false;
    }
    
    const spell = this.knownSpells.get(spellId);
    this.knownSpells.delete(spellId);
    
    // Also remove from prepared spells if present
    this.preparedSpellManager.unprepareSpell(spellId);
    this.preparedSpellManager.removeAlwaysPrepared(spellId);
    
    this._notifyListeners('knownSpellRemoved', { spell });
    
    return true;
  }

  /**
   * Get a known spell by ID
   * @param {string} spellId - The spell ID
   * @returns {Spell|null} The spell or null if not found
   */
  getKnownSpell(spellId) {
    return this.knownSpells.get(spellId) || null;
  }

  /**
   * Get all known spells
   * @returns {Array} Array of known spells
   */
  getAllKnownSpells() {
    return Array.from(this.knownSpells.values());
  }

  /**
   * Get known spells by level
   * @param {number} level - The spell level
   * @returns {Array} Spells of the specified level
   */
  getKnownSpellsByLevel(level) {
    return Array.from(this.knownSpells.values()).filter(
      spell => spell.level === level
    );
  }

  /**
   * Get all prepared spells
   * @returns {Array} Array of prepared spells
   */
  getAllPreparedSpells() {
    const preparedIds = this.preparedSpellManager.getAllPreparedSpells();
    return preparedIds.map(id => this.knownSpells.get(id)).filter(Boolean);
  }

  /**
   * Cast a spell
   * @param {string} spellId - The ID of the spell to cast
   * @param {number} level - The level to cast the spell at (for upcasting)
   * @param {Object} options - Casting options
   * @returns {Object} The result of casting the spell
   */
  castSpell(spellId, level = null, options = {}) {
    const spell = this.knownSpells.get(spellId);
    
    if (!spell) {
      return { success: false, error: 'Spell not found' };
    }
    
    // Check if the spell is prepared (if required)
    const requiresPreparation = options.requirePreparation !== false;
    if (requiresPreparation && !this.preparedSpellManager.isSpellPrepared(spellId)) {
      return { success: false, error: 'Spell not prepared' };
    }
    
    // Determine the casting level
    const castingLevel = level || spell.level;
    
    // Handle cantrips
    if (spell.level === 0) {
      return this._castCantrip(spell, options);
    }
    
    // Handle leveled spells
    return this._castLeveledSpell(spell, castingLevel, options);
  }

  /**
   * Cast a cantrip
   * @param {Spell} spell - The cantrip to cast
   * @param {Object} options - Casting options
   * @returns {Object} The result of casting the cantrip
   * @private
   */
  _castCantrip(spell, options) {
    // Cantrips don't use spell slots
    const result = {
      success: true,
      spell,
      level: 0,
      casterLevel: options.casterLevel || 1
    };
    
    // Calculate damage based on caster level
    if (spell.damage) {
      result.damage = spell.getDamageAtLevel(options.casterLevel || 1);
    }
    
    // Calculate healing based on caster level
    if (spell.healing) {
      result.healing = spell.getHealingAtLevel(options.casterLevel || 1);
    }
    
    this._notifyListeners('spellCast', result);
    
    return result;
  }

  /**
   * Cast a leveled spell
   * @param {Spell} spell - The spell to cast
   * @param {number} level - The level to cast the spell at
   * @param {Object} options - Casting options
   * @returns {Object} The result of casting the spell
   * @private
   */
  _castLeveledSpell(spell, level, options) {
    // Check if the level is valid
    if (level < spell.level) {
      return { success: false, error: 'Cannot cast at lower level than spell level' };
    }
    
    // Check if we have a spell slot available
    const useSpellSlot = options.useSpellSlot !== false;
    if (useSpellSlot && !this.spellSlotManager.useSlot(level)) {
      return { success: false, error: 'No spell slot available' };
    }
    
    const result = {
      success: true,
      spell,
      level,
      slotUsed: useSpellSlot
    };
    
    // Calculate damage
    if (spell.damage) {
      result.damage = spell.getDamageAtLevel(level);
    }
    
    // Calculate healing
    if (spell.healing) {
      result.healing = spell.getHealingAtLevel(level);
    }
    
    this._notifyListeners('spellCast', result);
    
    return result;
  }

  /**
   * Add a listener for spellcasting events
   * @param {Function} listener - The listener function
   * @returns {Function} Function to remove the listener
   */
  addListener(listener) {
    if (typeof listener !== 'function') {
      console.error('Listener must be a function');
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
        listener(event, data);
      } catch (error) {
        console.error('Error in spellcasting manager listener:', error);
      }
    });
  }

  /**
   * Convert the spellcasting manager to a plain object for serialization
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      spellcaster: this.spellcaster,
      spellcastingAbility: this.spellcastingAbility,
      spellSaveDC: this.spellSaveDC,
      spellAttackBonus: this.spellAttackBonus,
      spellSlotManager: this.spellSlotManager.toJSON(),
      preparedSpellManager: this.preparedSpellManager.toJSON(),
      knownSpells: Array.from(this.knownSpells.values()).map(spell => spell.toJSON())
    };
  }

  /**
   * Create a spellcasting manager from a plain object
   * @param {Object} data - The plain object data
   * @returns {SpellcastingManager} A new spellcasting manager instance
   */
  static fromJSON(data) {
    // Create the manager with basic properties
    const manager = new SpellcastingManager({
      spellcaster: data.spellcaster,
      spellcastingAbility: data.spellcastingAbility,
      spellSaveDC: data.spellSaveDC,
      spellAttackBonus: data.spellAttackBonus,
      spellSlotManager: SpellSlotManager.fromJSON(data.spellSlotManager || {}),
      preparedSpellManager: PreparedSpellManager.fromJSON(data.preparedSpellManager || {})
    });
    
    // Add known spells
    if (data.knownSpells && Array.isArray(data.knownSpells)) {
      data.knownSpells.forEach(spellData => {
        manager.addKnownSpell(Spell.fromJSON(spellData));
      });
    }
    
    return manager;
  }
}

/**
 * Class for calculating spell damage
 */
export class SpellDamageCalculator {
  /**
   * Calculate damage for a spell
   * @param {Spell} spell - The spell
   * @param {number} level - The casting level
   * @param {Object} options - Calculation options
   * @returns {Object} The calculated damage
   */
  static calculateDamage(spell, level, options = {}) {
    if (!spell.damage) {
      return { total: 0 };
    }
    
    // Get the damage for this level
    const levelDamage = spell.getDamageAtLevel(level);
    
    if (!levelDamage) {
      return { total: 0 };
    }
    
    // Parse the damage formula
    const { diceCount, diceSize, bonus } = this._parseDamageFormula(levelDamage.formula);
    
    // Roll the dice
    const rolls = [];
    let total = 0;
    
    for (let i = 0; i < diceCount; i++) {
      const roll = options.rollFunction
        ? options.rollFunction(diceSize)
        : Math.floor(Math.random() * diceSize) + 1;
      
      rolls.push(roll);
      total += roll;
    }
    
    // Add bonus
    total += bonus;
    
    // Apply modifiers
    if (options.spellcastingAbilityModifier && levelDamage.addAbilityModifier) {
      total += options.spellcastingAbilityModifier;
    }
    
    return {
      formula: levelDamage.formula,
      rolls,
      bonus,
      total,
      damageType: spell.damageType
    };
  }

  /**
   * Calculate healing for a spell
   * @param {Spell} spell - The spell
   * @param {number} level - The casting level
   * @param {Object} options - Calculation options
   * @returns {Object} The calculated healing
   */
  static calculateHealing(spell, level, options = {}) {
    if (!spell.healing) {
      return { total: 0 };
    }
    
    // Get the healing for this level
    const levelHealing = spell.getHealingAtLevel(level);
    
    if (!levelHealing) {
      return { total: 0 };
    }
    
    // Parse the healing formula
    const { diceCount, diceSize, bonus } = this._parseDamageFormula(levelHealing.formula);
    
    // Roll the dice
    const rolls = [];
    let total = 0;
    
    for (let i = 0; i < diceCount; i++) {
      const roll = options.rollFunction
        ? options.rollFunction(diceSize)
        : Math.floor(Math.random() * diceSize) + 1;
      
      rolls.push(roll);
      total += roll;
    }
    
    // Add bonus
    total += bonus;
    
    // Apply modifiers
    if (options.spellcastingAbilityModifier && levelHealing.addAbilityModifier) {
      total += options.spellcastingAbilityModifier;
    }
    
    return {
      formula: levelHealing.formula,
      rolls,
      bonus,
      total
    };
  }

  /**
   * Parse a damage formula
   * @param {string} formula - The damage formula (e.g., "2d6+3")
   * @returns {Object} The parsed formula
   * @private
   */
  static _parseDamageFormula(formula) {
    // Default values
    let diceCount = 0;
    let diceSize = 0;
    let bonus = 0;
    
    // Parse the formula
    const diceMatch = formula.match(/(\d+)d(\d+)/);
    if (diceMatch) {
      diceCount = parseInt(diceMatch[1], 10);
      diceSize = parseInt(diceMatch[2], 10);
    }
    
    // Parse bonus
    const bonusMatch = formula.match(/[+-]\s*(\d+)/);
    if (bonusMatch) {
      bonus = parseInt(bonusMatch[0], 10);
    }
    
    return { diceCount, diceSize, bonus };
  }
}

/**
 * Class for generating random spells
 */
export class SpellGenerator {
  /**
   * Create a spell generator
   * @param {Object} options - Generator options
   */
  constructor(options = {}) {
    this.options = {
      nameGenerator: options.nameGenerator || null,
      ...options
    };
  }

  /**
   * Generate a random spell
   * @param {Object} params - Generation parameters
   * @returns {Spell} The generated spell
   */
  generateSpell(params = {}) {
    const {
      level = this._getRandomLevel(),
      school = this._getRandomSchool(),
      damageType = this._getRandomDamageType(),
      name = this._generateName(school, level)
    } = params;
    
    // Create base spell data
    const spellData = {
      name,
      level,
      school,
      castingTime: this._getRandomCastingTime(level),
      range: this._getRandomRange(level, school),
      components: this._getRandomComponents(),
      duration: this._getRandomDuration(level, school),
      concentration: this._shouldBeConcentration(level, school),
      ritual: this._shouldBeRitual(level, school),
      description: this._generateDescription(level, school),
      classes: this._getRandomClasses(),
      source: 'Generated'
    };
    
    // Add damage for damaging spells
    if (this._shouldDealDamage(level, school)) {
      spellData.damageType = damageType;
      spellData.damage = this._generateDamage(level);
      spellData.saveType = this._getRandomSaveType();
    }
    
    // Add healing for healing spells
    if (this._shouldHeal(level, school)) {
      spellData.healing = this._generateHealing(level);
    }
    
    // Add area effect for area spells
    if (this._shouldHaveArea(level, school)) {
      spellData.area = this._generateArea(level);
    }
    
    // Create the spell
    return new Spell(spellData);
  }

  /**
   * Get a random spell level
   * @returns {number} A random level
   * @private
   */
  _getRandomLevel() {
    // Weight lower levels more heavily
    const weights = [3, 3, 2, 2, 2, 1, 1, 1, 1];
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < weights.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return i;
      }
    }
    
    return 0;
  }

  /**
   * Get a random spell school
   * @returns {string} A random school
   * @private
   */
  _getRandomSchool() {
    const schools = Object.values(SpellSchool);
    return schools[Math.floor(Math.random() * schools.length)];
  }

  /**
   * Get a random damage type
   * @returns {string} A random damage type
   * @private
   */
  _getRandomDamageType() {
    const damageTypes = Object.values(SpellDamageType);
    return damageTypes[Math.floor(Math.random() * damageTypes.length)];
  }

  /**
   * Generate a spell name
   * @param {string} school - The spell school
   * @param {number} level - The spell level
   * @returns {string} A generated name
   * @private
   */
  _generateName(school, level) {
    if (this.options.nameGenerator) {
      return this.options.nameGenerator.generateName({ school, level });
    }
    
    // Simple fallback name generation
    const prefixes = {
      [SpellSchool.ABJURATION]: ['Shield', 'Ward', 'Protection', 'Barrier', 'Armor'],
      [SpellSchool.CONJURATION]: ['Summon', 'Call', 'Conjure', 'Create', 'Gate'],
      [SpellSchool.DIVINATION]: ['Detect', 'Locate', 'Identify', 'Foresee', 'Scry'],
      [SpellSchool.ENCHANTMENT]: ['Charm', 'Dominate', 'Command', 'Compel', 'Suggestion'],
      [SpellSchool.EVOCATION]: ['Blast', 'Bolt', 'Ray', 'Burst', 'Strike'],
      [SpellSchool.ILLUSION]: ['Phantom', 'Illusory', 'Disguise', 'Mirage', 'Image'],
      [SpellSchool.NECROMANCY]: ['Death', 'Drain', 'Blight', 'Wither', 'Necrotic'],
      [SpellSchool.TRANSMUTATION]: ['Transform', 'Alter', 'Change', 'Mutate', 'Polymorph']
    };
    
    const suffixes = {
      [SpellSchool.ABJURATION]: ['Protection', 'Defense', 'Sanctuary', 'Resilience', 'Warding'],
      [SpellSchool.CONJURATION]: ['Entity', 'Creature', 'Being', 'Portal', 'Manifestation'],
      [SpellSchool.DIVINATION]: ['Sight', 'Vision', 'Revelation', 'Insight', 'Knowledge'],
      [SpellSchool.ENCHANTMENT]: ['Mind', 'Will', 'Thought', 'Emotion', 'Control'],
      [SpellSchool.EVOCATION]: ['Fire', 'Ice', 'Lightning', 'Energy', 'Force'],
      [SpellSchool.ILLUSION]: ['Form', 'Appearance', 'Deception', 'Disguise', 'Veil'],
      [SpellSchool.NECROMANCY]: ['Soul', 'Spirit', 'Corpse', 'Undeath', 'Decay'],
      [SpellSchool.TRANSMUTATION]: ['Form', 'Shape', 'Essence', 'Nature', 'Substance']
    };
    
    const adjectives = {
      0: ['Minor', 'Lesser', 'Small', 'Subtle', 'Gentle'],
      1: ['Basic', 'Simple', 'Common', 'Modest', 'Mild'],
      2: ['Moderate', 'Firm', 'Solid', 'Steady', 'Stable'],
      3: ['Greater', 'Major', 'Potent', 'Strong', 'Powerful'],
      4: ['Intense', 'Mighty', 'Formidable', 'Substantial', 'Significant'],
      5: ['Magnificent', 'Excellent', 'Superior', 'Dominant', 'Prevailing'],
      6: ['Extraordinary', 'Remarkable', 'Exceptional', 'Outstanding', 'Superb'],
      7: ['Legendary', 'Mythical', 'Fabled', 'Storied', 'Renowned'],
      8: ['Supreme', 'Ultimate', 'Paramount', 'Consummate', 'Transcendent'],
      9: ['Godly', 'Divine', 'Celestial', 'Omnipotent', 'Almighty']
    };
    
    // Get random elements
    const schoolPrefixes = prefixes[school] || prefixes[SpellSchool.EVOCATION];
    const schoolSuffixes = suffixes[school] || suffixes[SpellSchool.EVOCATION];
    const levelAdjectives = adjectives[level] || adjectives[0];
    
    const prefix = schoolPrefixes[Math.floor(Math.random() * schoolPrefixes.length)];
    const suffix = schoolSuffixes[Math.floor(Math.random() * schoolSuffixes.length)];
    const adjective = levelAdjectives[Math.floor(Math.random() * levelAdjectives.length)];
    
    // Format name based on level
    if (level === 0) {
      return `${prefix} Cantrip`;
    } else if (level <= 3) {
      return `${prefix} of ${suffix}`;
    } else if (level <= 6) {
      return `${adjective} ${prefix} of ${suffix}`;
    } else {
      return `${adjective} ${prefix} of ${suffix}`;
    }
  }

  /**
   * Get a random casting time
   * @param {number} level - The spell level
   * @returns {string} A random casting time
   * @private
   */
  _getRandomCastingTime(level) {
    const options = [
      SpellCastingTime.ACTION,
      SpellCastingTime.BONUS_ACTION,
      SpellCastingTime.REACTION
    ];
    
    // Higher level spells are more likely to have longer casting times
    if (level >= 3) {
      options.push(SpellCastingTime.MINUTE);
    }
    
    if (level >= 6) {
      options.push(SpellCastingTime.HOUR);
    }
    
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Get a random range
   * @param {number} level - The spell level
   * @param {string} school - The spell school
   * @returns {Object} A random range
   * @private
   */
  _getRandomRange(level, school) {
    const options = [
      { type: SpellRange.SELF, distance: 0 },
      { type: SpellRange.TOUCH, distance: 0 },
      { type: SpellRange.FEET, distance: 30 },
      { type: SpellRange.FEET, distance: 60 },
      { type: SpellRange.FEET, distance: 120 }
    ];
    
    // Higher level spells can have longer ranges
    if (level >= 3) {
      options.push({ type: SpellRange.FEET, distance: 300 });
    }
    
    if (level >= 6) {
      options.push({ type: SpellRange.FEET, distance: 500 });
      options.push({ type: SpellRange.MILES, distance: 1 });
    }
    
    if (level >= 8) {
      options.push({ type: SpellRange.SIGHT, distance: 0 });
      options.push({ type: SpellRange.UNLIMITED, distance: 0 });
    }
    
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Get random components
   * @returns {Object} Random components
   * @private
   */
  _getRandomComponents() {
    // Most spells have verbal and somatic components
    const verbal = Math.random() < 0.9;
    const somatic = Math.random() < 0.8;
    const material = Math.random() < 0.5;
    
    return {
      V: verbal,
      S: somatic,
      M: material
    };
  }

  /**
   * Get a random duration
   * @param {number} level - The spell level
   * @param {string} school - The spell school
   * @returns {Object} A random duration
   * @private
   */
  _getRandomDuration(level, school) {
    // Evocation spells are often instantaneous
    if (school === SpellSchool.EVOCATION && Math.random() < 0.7) {
      return { type: SpellDuration.INSTANTANEOUS, length: 0 };
    }
    
    const options = [
      { type: SpellDuration.INSTANTANEOUS, length: 0 },
      { type: SpellDuration.ROUND, length: 1 },
      { type: SpellDuration.MINUTE, length: 1 },
      { type: SpellDuration.MINUTE, length: 10 }
    ];
    
    // Higher level spells can have longer durations
    if (level >= 3) {
      options.push({ type: SpellDuration.HOUR, length: 1 });
      options.push({ type: SpellDuration.HOUR, length: 8 });
    }
    
    if (level >= 5) {
      options.push({ type: SpellDuration.DAY, length: 1 });
    }
    
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Determine if a spell should require concentration
   * @param {number} level - The spell level
   * @param {string} school - The spell school
   * @returns {boolean} True if the spell should require concentration
   * @private
   */
  _shouldBeConcentration(level, school) {
    // Evocation spells are less likely to require concentration
    if (school === SpellSchool.EVOCATION) {
      return Math.random() < 0.3;
    }
    
    // Higher level spells are more likely to require concentration
    const baseChance = 0.4;
    const levelFactor = level * 0.05;
    
    return Math.random() < (baseChance + levelFactor);
  }

  /**
   * Determine if a spell should be a ritual
   * @param {number} level - The spell level
   * @param {string} school - The spell school
   * @returns {boolean} True if the spell should be a ritual
   * @private
   */
  _shouldBeRitual(level, school) {
    // Cantrips are never rituals
    if (level === 0) {
      return false;
    }
    
    // Divination spells are more likely to be rituals
    if (school === SpellSchool.DIVINATION) {
      return Math.random() < 0.4;
    }
    
    // Base chance for other spells
    return Math.random() < 0.15;
  }

  /**
   * Generate a spell description
   * @param {number} level - The spell level
   * @param {string} school - The spell school
   * @returns {string} A generated description
   * @private
   */
  _generateDescription(level, school) {
    // Simple placeholder description
    return `A ${level === 0 ? 'cantrip' : `level ${level} spell`} of the ${school} school.`;
  }

    /**
   * Get random classes for a spell
   * @returns {Array} Random classes
   * @private
   */
  _getRandomClasses() {
    const allClasses = [
      'Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger', 'Sorcerer', 'Warlock', 'Wizard', 'Artificer'
    ];
    
    // Randomly select 1-3 classes
    const numClasses = Math.floor(Math.random() * 3) + 1;
    const classes = [];
    
    // Shuffle the classes
    const shuffled = [...allClasses].sort(() => 0.5 - Math.random());
    
    // Take the first numClasses
    for (let i = 0; i < numClasses; i++) {
      classes.push(shuffled[i]);
    }
    
    return classes;
  }

  /**
   * Determine if a spell should deal damage
   * @param {number} level - The spell level
   * @param {string} school - The spell school
   * @returns {boolean} True if the spell should deal damage
   * @private
   */
  _shouldDealDamage(level, school) {
    // Evocation spells are more likely to deal damage
    if (school === SpellSchool.EVOCATION) {
      return Math.random() < 0.8;
    }
    
    // Necromancy spells often deal damage
    if (school === SpellSchool.NECROMANCY) {
      return Math.random() < 0.6;
    }
    
    // Base chance for other schools
    return Math.random() < 0.4;
  }

  /**
   * Determine if a spell should heal
   * @param {number} level - The spell level
   * @param {string} school - The spell school
   * @returns {boolean} True if the spell should heal
   * @private
   */
  _shouldHeal(level, school) {
    // Evocation and necromancy spells can heal
    if (school === SpellSchool.EVOCATION || school === SpellSchool.NECROMANCY) {
      return Math.random() < 0.3;
    }
    
    // Conjuration spells sometimes heal
    if (school === SpellSchool.CONJURATION) {
      return Math.random() < 0.2;
    }
    
    // Base chance for other schools
    return Math.random() < 0.1;
  }

  /**
   * Determine if a spell should have an area effect
   * @param {number} level - The spell level
   * @param {string} school - The spell school
   * @returns {boolean} True if the spell should have an area effect
   * @private
   */
  _shouldHaveArea(level, school) {
    // Cantrips rarely have area effects
    if (level === 0) {
      return Math.random() < 0.1;
    }
    
    // Evocation spells often have area effects
    if (school === SpellSchool.EVOCATION) {
      return Math.random() < 0.6;
    }
    
    // Conjuration spells sometimes have area effects
    if (school === SpellSchool.CONJURATION) {
      return Math.random() < 0.4;
    }
    
    // Base chance for other schools
    return Math.random() < 0.3;
  }

  /**
   * Generate damage for a spell
   * @param {number} level - The spell level
   * @returns {Object} The generated damage
   * @private
   */
  _generateDamage(level) {
    const damage = {};
    
    // Cantrips scale with character level
    if (level === 0) {
      damage[1] = { formula: '1d10', addAbilityModifier: false };
      damage[5] = { formula: '2d10', addAbilityModifier: false };
      damage[11] = { formula: '3d10', addAbilityModifier: false };
      damage[17] = { formula: '4d10', addAbilityModifier: false };
    } else {
      // Leveled spells scale with spell slot level
      for (let i = level; i <= 9; i++) {
        const baseDice = level + 1;
        const additionalDice = i - level;
        const totalDice = baseDice + additionalDice;
        
        damage[i] = { formula: `${totalDice}d6`, addAbilityModifier: false };
      }
    }
    
    return damage;
  }

  /**
   * Generate healing for a spell
   * @param {number} level - The spell level
   * @returns {Object} The generated healing
   * @private
   */
  _generateHealing(level) {
    const healing = {};
    
    // Cantrips scale with character level
    if (level === 0) {
      healing[1] = { formula: '1d4', addAbilityModifier: true };
      healing[5] = { formula: '2d4', addAbilityModifier: true };
      healing[11] = { formula: '3d4', addAbilityModifier: true };
      healing[17] = { formula: '4d4', addAbilityModifier: true };
    } else {
      // Leveled spells scale with spell slot level
      for (let i = level; i <= 9; i++) {
        const baseDice = level;
        const additionalDice = i - level;
        const totalDice = baseDice + additionalDice;
        
        healing[i] = { formula: `${totalDice}d8`, addAbilityModifier: true };
      }
    }
    
    return healing;
  }

  /**
   * Generate an area effect for a spell
   * @param {number} level - The spell level
   * @returns {Object} The generated area
   * @private
   */
  _generateArea(level) {
    const areaTypes = Object.values(SpellAreaType);
    const type = areaTypes[Math.floor(Math.random() * areaTypes.length)];
    
    // Size scales with level
    const baseSize = 10;
    const sizeMultiplier = 1 + (level * 0.5);
    const size = Math.floor(baseSize * sizeMultiplier);
    
    switch (type) {
      case SpellAreaType.CONE:
        return { type, size };
      case SpellAreaType.CUBE:
        return { type, size };
      case SpellAreaType.CYLINDER:
        return { type, radius: Math.floor(size / 2), height: size };
      case SpellAreaType.LINE:
        return { type, length: size * 3, width: 5 };
      case SpellAreaType.SPHERE:
        return { type, radius: Math.floor(size / 2) };
      case SpellAreaType.SQUARE:
        return { type, size };
      default:
        return { type: SpellAreaType.SPHERE, radius: Math.floor(size / 2) };
    }
  }

  /**
   * Get a random save type
   * @returns {string} A random save type
   * @private
   */
  _getRandomSaveType() {
    const saveTypes = Object.values(SpellSaveType);
    return saveTypes[Math.floor(Math.random() * saveTypes.length)];
  }
}

/**
 * Class for parsing spell descriptions
 */
export class SpellParser {
  /**
   * Create a spell parser
   */
  constructor() {
    this.patterns = {
      level: /(\d)(?:st|nd|rd|th)-level (\w+)/i,
      cantrip: /(\w+) cantrip/i,
      castingTime: /Casting Time: (.+)$/im,
      range: /Range: (.+)$/im,
      components: /Components: (.+)$/im,
      duration: /Duration: (.+)$/im,
      classes: /Classes: (.+)$/im,
      damage: /(\d+d\d+(?:\s*\+\s*\d+)?) (\w+) damage/i,
      healing: /regains? (\d+d\d+(?:\s*\+\s*\d+)?) hit points/i,
      saveType: /must make a (\w+) saving throw/i,
      area: /(\d+)-foot(?:-radius)? (\w+)/i
    };
  }

  /**
   * Parse a spell from text
   * @param {string} text - The spell text
   * @returns {Spell} The parsed spell
   */
  parse(text) {
    const spellData = {
      name: this._parseName(text),
      level: this._parseLevel(text),
      school: this._parseSchool(text),
      castingTime: this._parseCastingTime(text),
      range: this._parseRange(text),
      components: this._parseComponents(text),
      duration: this._parseDuration(text),
      concentration: this._hasConcentration(text),
      ritual: this._isRitual(text),
      description: this._parseDescription(text),
      classes: this._parseClasses(text)
    };
    
    // Parse damage
    const damageInfo = this._parseDamage(text);
    if (damageInfo) {
      spellData.damageType = damageInfo.type;
      spellData.damage = damageInfo.damage;
    }
    
    // Parse healing
    const healingInfo = this._parseHealing(text);
    if (healingInfo) {
      spellData.healing = healingInfo;
    }
    
    // Parse save type
    const saveType = this._parseSaveType(text);
    if (saveType) {
      spellData.saveType = saveType;
    }
    
    // Parse area
    const area = this._parseArea(text);
    if (area) {
      spellData.area = area;
    }
    
    return new Spell(spellData);
  }

  /**
   * Parse the spell name
   * @param {string} text - The spell text
   * @returns {string} The spell name
   * @private
   */
  _parseName(text) {
    // Assume the first line is the name
    const firstLine = text.split('\n')[0].trim();
    return firstLine;
  }

  /**
   * Parse the spell level and school
   * @param {string} text - The spell text
   * @returns {number} The spell level
   * @private
   */
  _parseLevel(text) {
    // Check for leveled spell
    const levelMatch = text.match(this.patterns.level);
    if (levelMatch) {
      return parseInt(levelMatch[1], 10);
    }
    
    // Check for cantrip
    const cantripMatch = text.match(this.patterns.cantrip);
    if (cantripMatch) {
      return 0;
    }
    
    return 0;
  }

  /**
   * Parse the spell school
   * @param {string} text - The spell text
   * @returns {string} The spell school
   * @private
   */
  _parseSchool(text) {
    // Check for leveled spell
    const levelMatch = text.match(this.patterns.level);
    if (levelMatch && levelMatch[2]) {
      const schoolName = levelMatch[2].toLowerCase();
      return this._normalizeSchool(schoolName);
    }
    
    // Check for cantrip
    const cantripMatch = text.match(this.patterns.cantrip);
    if (cantripMatch && cantripMatch[1]) {
      const schoolName = cantripMatch[1].toLowerCase();
      return this._normalizeSchool(schoolName);
    }
    
    return SpellSchool.EVOCATION;
  }

  /**
   * Normalize a school name
   * @param {string} schoolName - The school name
   * @returns {string} The normalized school
   * @private
   */
  _normalizeSchool(schoolName) {
    const schoolMap = {
      'abjuration': SpellSchool.ABJURATION,
      'conjuration': SpellSchool.CONJURATION,
      'divination': SpellSchool.DIVINATION,
      'enchantment': SpellSchool.ENCHANTMENT,
      'evocation': SpellSchool.EVOCATION,
      'illusion': SpellSchool.ILLUSION,
      'necromancy': SpellSchool.NECROMANCY,
      'transmutation': SpellSchool.TRANSMUTATION
    };
    
    return schoolMap[schoolName] || SpellSchool.EVOCATION;
  }

  /**
   * Parse the casting time
   * @param {string} text - The spell text
   * @returns {string} The casting time
   * @private
   */
  _parseCastingTime(text) {
    const match = text.match(this.patterns.castingTime);
    if (!match) return SpellCastingTime.ACTION;
    
    const castingTimeText = match[1].toLowerCase();
    
    if (castingTimeText.includes('action')) {
      return SpellCastingTime.ACTION;
    } else if (castingTimeText.includes('bonus action')) {
      return SpellCastingTime.BONUS_ACTION;
    } else if (castingTimeText.includes('reaction')) {
      return SpellCastingTime.REACTION;
    } else if (castingTimeText.includes('minute')) {
      return SpellCastingTime.MINUTE;
    } else if (castingTimeText.includes('hour')) {
      return SpellCastingTime.HOUR;
    } else if (castingTimeText.includes('ritual')) {
      return SpellCastingTime.RITUAL;
    }
    
    return SpellCastingTime.ACTION;
  }

  /**
   * Parse the range
   * @param {string} text - The spell text
   * @returns {Object} The range
   * @private
   */
  _parseRange(text) {
    const match = text.match(this.patterns.range);
    if (!match) return { type: SpellRange.SELF, distance: 0 };
    
    const rangeText = match[1].toLowerCase();
    
    if (rangeText.includes('self')) {
      return { type: SpellRange.SELF, distance: 0 };
    } else if (rangeText.includes('touch')) {
      return { type: SpellRange.TOUCH, distance: 0 };
    } else if (rangeText.includes('sight')) {
      return { type: SpellRange.SIGHT, distance: 0 };
    } else if (rangeText.includes('unlimited')) {
      return { type: SpellRange.UNLIMITED, distance: 0 };
    } else {
      // Try to parse distance
      const distanceMatch = rangeText.match(/(\d+) (feet|foot|ft\.?|miles?)/i);
      if (distanceMatch) {
        const distance = parseInt(distanceMatch[1], 10);
        const unit = distanceMatch[2].toLowerCase();
        
        if (unit.includes('mile')) {
          return { type: SpellRange.MILES, distance };
        } else {
          return { type: SpellRange.FEET, distance };
        }
      }
    }
    
    return { type: SpellRange.SELF, distance: 0 };
  }

  /**
   * Parse the components
   * @param {string} text - The spell text
   * @returns {Object} The components
   * @private
   */
  _parseComponents(text) {
    const match = text.match(this.patterns.components);
    if (!match) return { V: true, S: true, M: false };
    
    const componentsText = match[1];
    
    const components = {
      V: componentsText.includes('V'),
      S: componentsText.includes('S'),
      M: componentsText.includes('M')
    };
    
    // Extract material components
    if (components.M) {
      const materialMatch = componentsText.match(/M\s*\(([^)]+)\)/i);
      if (materialMatch) {
        components.materials = materialMatch[1].trim();
      }
    }
    
    return components;
  }

  /**
   * Parse the duration
   * @param {string} text - The spell text
   * @returns {Object} The duration
   * @private
   */
  _parseDuration(text) {
    const match = text.match(this.patterns.duration);
    if (!match) return { type: SpellDuration.INSTANTANEOUS, length: 0 };
    
    const durationText = match[1].toLowerCase();
    
    if (durationText.includes('instantaneous')) {
      return { type: SpellDuration.INSTANTANEOUS, length: 0 };
    } else if (durationText.includes('round')) {
      const lengthMatch = durationText.match(/(\d+) round/i);
      const length = lengthMatch ? parseInt(lengthMatch[1], 10) : 1;
      return { type: SpellDuration.ROUND, length };
    } else if (durationText.includes('minute')) {
      const lengthMatch = durationText.match(/(\d+) minute/i);
      const length = lengthMatch ? parseInt(lengthMatch[1], 10) : 1;
      return { type: SpellDuration.MINUTE, length };
    } else if (durationText.includes('hour')) {
      const lengthMatch = durationText.match(/(\d+) hour/i);
      const length = lengthMatch ? parseInt(lengthMatch[1], 10) : 1;
      return { type: SpellDuration.HOUR, length };
    } else if (durationText.includes('day')) {
      const lengthMatch = durationText.match(/(\d+) day/i);
      const length = lengthMatch ? parseInt(lengthMatch[1], 10) : 1;
      return { type: SpellDuration.DAY, length };
    } else if (durationText.includes('special')) {
      return { type: SpellDuration.SPECIAL, length: 0 };
    }
    
    return { type: SpellDuration.INSTANTANEOUS, length: 0 };
  }

  /**
   * Check if the spell requires concentration
   * @param {string} text - The spell text
   * @returns {boolean} True if the spell requires concentration
   * @private
   */
  _hasConcentration(text) {
    const match = text.match(this.patterns.duration);
    if (!match) return false;
    
    return match[1].toLowerCase().includes('concentration');
  }

  /**
   * Check if the spell is a ritual
   * @param {string} text - The spell text
   * @returns {boolean} True if the spell is a ritual
   * @private
   */
  _isRitual(text) {
    return text.toLowerCase().includes('ritual');
  }

  /**
   * Parse the spell description
   * @param {string} text - The spell text
   * @returns {string} The spell description
   * @private
   */
  _parseDescription(text) {
    // Find the description section
    const lines = text.split('\n');
    let descriptionStarted = false;
    let description = '';
    
    for (const line of lines) {
      if (line.startsWith('At Higher Levels')) {
        break;
      }
      
      if (descriptionStarted) {
        description += line + '\n';
      } else if (line.match(/^[A-Z]/)) {
        descriptionStarted = true;
        description = line + '\n';
      }
    }
    
    return description.trim();
  }

  /**
   * Parse the classes
   * @param {string} text - The spell text
   * @returns {Array} The classes
   * @private
   */
  _parseClasses(text) {
    const match = text.match(this.patterns.classes);
    if (!match) return [];
    
    return match[1].split(',').map(cls => cls.trim());
  }

  /**
   * Parse damage information
   * @param {string} text - The spell text
   * @returns {Object|null} The damage information
   * @private
   */
  _parseDamage(text) {
    const match = text.match(this.patterns.damage);
    if (!match) return null;
    
    const formula = match[1];
    const damageType = this._normalizeDamageType(match[2]);
    
    // Create damage object
    const damage = {
      1: { formula, addAbilityModifier: false }
    };
    
    return {
      type: damageType,
      damage
    };
  }

  /**
   * Normalize a damage type
   * @param {string} damageType - The damage type
   * @returns {string} The normalized damage type
   * @private
   */
  _normalizeDamageType(damageType) {
    const typeMap = {
      'acid': SpellDamageType.ACID,
      'bludgeoning': SpellDamageType.BLUDGEONING,
      'cold': SpellDamageType.COLD,
      'fire': SpellDamageType.FIRE,
      'force': SpellDamageType.FORCE,
      'lightning': SpellDamageType.LIGHTNING,
      'necrotic': SpellDamageType.NECROTIC,
      'piercing': SpellDamageType.PIERCING,
      'poison': SpellDamageType.POISON,
      'psychic': SpellDamageType.PSYCHIC,
      'radiant': SpellDamageType.RADIANT,
      'slashing': SpellDamageType.SLASHING,
      'thunder': SpellDamageType.THUNDER
    };
    
    return typeMap[damageType.toLowerCase()] || SpellDamageType.FORCE;
  }

  /**
   * Parse healing information
   * @param {string} text - The spell text
   * @returns {Object|null} The healing information
   * @private
   */
  _parseHealing(text) {
    const match = text.match(this.patterns.healing);
    if (!match) return null;
    
    const formula = match[1];
    
    // Create healing object
    return {
      1: { formula, addAbilityModifier: true }
    };
  }

  /**
   * Parse save type
   * @param {string} text - The spell text
   * @returns {string|null} The save type
   * @private
   */
  _parseSaveType(text) {
    const match = text.match(this.patterns.saveType);
    if (!match) return null;
    
    const saveTypeMap = {
      'strength': SpellSaveType.STR,
      'dexterity': SpellSaveType.DEX,
      'constitution': SpellSaveType.CON,
      'intelligence': SpellSaveType.INT,
      'wisdom': SpellSaveType.WIS,
      'charisma': SpellSaveType.CHA
    };
    
    return saveTypeMap[match[1].toLowerCase()] || SpellSaveType.NONE;
  }

  /**
   * Parse area information
   * @param {string} text - The spell text
   * @returns {Object|null} The area information
   * @private
   */
  _parseArea(text) {
    const match = text.match(this.patterns.area);
    if (!match) return null;
    
    const size = parseInt(match[1], 10);
    const areaType = match[2].toLowerCase();
    
    const areaTypeMap = {
      'cone': SpellAreaType.CONE,
      'cube': SpellAreaType.CUBE,
      'cylinder': SpellAreaType.CYLINDER,
      'line': SpellAreaType.LINE,
      'sphere': SpellAreaType.SPHERE,
      'square': SpellAreaType.SQUARE
    };
    
    const type = areaTypeMap[areaType] || SpellAreaType.SPHERE;
    
    if (type === SpellAreaType.SPHERE || type === SpellAreaType.CYLINDER) {
      return { type, radius: size };
    } else {
      return { type, size };
    }
  }
}

/**
 * Generate a unique ID
 * @returns {string} A unique ID
 */
function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Create a new spell
 * @param {Object} data - Spell data
 * @returns {Spell} A new spell instance
 */
export function createSpell(data = {}) {
  return new Spell(data);
}

/**
 * Create a new spell database
 * @returns {SpellDatabase} A new spell database instance
 */
export function createSpellDatabase() {
  return new SpellDatabase();
}

/**
 * Create a new spell slot manager
 * @param {Object} data - Spell slot data
 * @returns {SpellSlotManager} A new spell slot manager instance
 */
export function createSpellSlotManager(data = {}) {
  return new SpellSlotManager(data);
}

/**
 * Create a new prepared spell manager
 * @param {Object} data - Prepared spell data
 * @returns {PreparedSpellManager} A new prepared spell manager instance
 */
export function createPreparedSpellManager(data = {}) {
  return new PreparedSpellManager(data);
}

/**
 * Create a new spellcasting manager
 * @param {Object} data - Spellcasting data
 * @returns {SpellcastingManager} A new spellcasting manager instance
 */
export function createSpellcastingManager(data = {}) {
  return new SpellcastingManager(data);
}

/**
 * Create a new spell generator
 * @param {Object} options - Generator options
 * @returns {SpellGenerator} A new spell generator instance
 */
export function createSpellGenerator(options = {}) {
  return new SpellGenerator(options);
}

/**
 * Create a new spell parser
 * @returns {SpellParser} A new spell parser instance
 */
export function createSpellParser() {
  return new SpellParser();
}

/**
 * Calculate spell damage
 * @param {Spell} spell - The spell
 * @param {number} level - The casting level
 * @param {Object} options - Calculation options
 * @returns {Object} The calculated damage
 */
export function calculateSpellDamage(spell, level, options = {}) {
  return SpellDamageCalculator.calculateDamage(spell, level, options);
}

/**
 * Calculate spell healing
 * @param {Spell} spell - The spell
 * @param {number} level - The casting level
 * @param {Object} options - Calculation options
 * @returns {Object} The calculated healing
 */
export function calculateSpellHealing(spell, level, options = {}) {
  return SpellDamageCalculator.calculateHealing(spell, level, options);
}

// Export the main spell functions and classes
export default {
  createSpell,
  createSpellDatabase,
  createSpellSlotManager,
  createPreparedSpellManager,
  createSpellcastingManager,
  createSpellGenerator,
  createSpellParser,
  calculateSpellDamage,
  calculateSpellHealing,
  SpellSchool,
  SpellComponent,
  SpellCastingTime,
  SpellDuration,
  SpellRange,
  SpellAreaType,
  SpellDamageType,
  SpellSaveType
};
