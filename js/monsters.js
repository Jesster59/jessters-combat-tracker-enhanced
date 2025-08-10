/**
 * Jesster's Combat Tracker
 * Monsters Module
 * Version 2.3.1
 * 
 * This module handles monster data, stats, abilities, and management,
 * providing a comprehensive system for working with monster entities.
 */

/**
 * Monster size categories
 */
export const MonsterSize = {
  TINY: 'tiny',
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
  HUGE: 'huge',
  GARGANTUAN: 'gargantuan'
};

/**
 * Monster types
 */
export const MonsterType = {
  ABERRATION: 'aberration',
  BEAST: 'beast',
  CELESTIAL: 'celestial',
  CONSTRUCT: 'construct',
  DRAGON: 'dragon',
  ELEMENTAL: 'elemental',
  FEY: 'fey',
  FIEND: 'fiend',
  GIANT: 'giant',
  HUMANOID: 'humanoid',
  MONSTROSITY: 'monstrosity',
  OOZE: 'ooze',
  PLANT: 'plant',
  UNDEAD: 'undead'
};

/**
 * Challenge ratings
 */
export const ChallengeRating = {
  CR0: { value: 0, xp: 0, text: '0' },
  CR1_8: { value: 0.125, xp: 25, text: '1/8' },
  CR1_4: { value: 0.25, xp: 50, text: '1/4' },
  CR1_2: { value: 0.5, xp: 100, text: '1/2' },
  CR1: { value: 1, xp: 200, text: '1' },
  CR2: { value: 2, xp: 450, text: '2' },
  CR3: { value: 3, xp: 700, text: '3' },
  CR4: { value: 4, xp: 1100, text: '4' },
  CR5: { value: 5, xp: 1800, text: '5' },
  CR6: { value: 6, xp: 2300, text: '6' },
  CR7: { value: 7, xp: 2900, text: '7' },
  CR8: { value: 8, xp: 3900, text: '8' },
  CR9: { value: 9, xp: 5000, text: '9' },
  CR10: { value: 10, xp: 5900, text: '10' },
  CR11: { value: 11, xp: 7200, text: '11' },
  CR12: { value: 12, xp: 8400, text: '12' },
  CR13: { value: 13, xp: 10000, text: '13' },
  CR14: { value: 14, xp: 11500, text: '14' },
  CR15: { value: 15, xp: 13000, text: '15' },
  CR16: { value: 16, xp: 15000, text: '16' },
  CR17: { value: 17, xp: 18000, text: '17' },
  CR18: { value: 18, xp: 20000, text: '18' },
  CR19: { value: 19, xp: 22000, text: '19' },
  CR20: { value: 20, xp: 25000, text: '20' },
  CR21: { value: 21, xp: 33000, text: '21' },
  CR22: { value: 22, xp: 41000, text: '22' },
  CR23: { value: 23, xp: 50000, text: '23' },
  CR24: { value: 24, xp: 62000, text: '24' },
  CR25: { value: 25, xp: 75000, text: '25' },
  CR26: { value: 26, xp: 90000, text: '26' },
  CR27: { value: 27, xp: 105000, text: '27' },
  CR28: { value: 28, xp: 120000, text: '28' },
  CR29: { value: 29, xp: 135000, text: '29' },
  CR30: { value: 30, xp: 155000, text: '30' }
};

/**
 * Ability score names
 */
export const AbilityScore = {
  STR: 'str',
  DEX: 'dex',
  CON: 'con',
  INT: 'int',
  WIS: 'wis',
  CHA: 'cha'
};

/**
 * Damage types
 */
export const DamageType = {
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
 * Condition types
 */
export const ConditionType = {
  BLINDED: 'blinded',
  CHARMED: 'charmed',
  DEAFENED: 'deafened',
  EXHAUSTION: 'exhaustion',
  FRIGHTENED: 'frightened',
  GRAPPLED: 'grappled',
  INCAPACITATED: 'incapacitated',
  INVISIBLE: 'invisible',
  PARALYZED: 'paralyzed',
  PETRIFIED: 'petrified',
  POISONED: 'poisoned',
  PRONE: 'prone',
  RESTRAINED: 'restrained',
  STUNNED: 'stunned',
  UNCONSCIOUS: 'unconscious'
};

/**
 * Class representing a monster
 */
export class Monster {
  /**
   * Create a monster
   * @param {Object} data - Monster data
   */
  constructor(data = {}) {
    this.id = data.id || generateId();
    this.name = data.name || 'Unknown Monster';
    this.size = data.size || MonsterSize.MEDIUM;
    this.type = data.type || MonsterType.HUMANOID;
    this.subtype = data.subtype || '';
    this.alignment = data.alignment || 'unaligned';
    this.ac = data.ac || 10;
    this.acType = data.acType || '';
    this.hp = data.hp || 10;
    this.maxHp = data.maxHp || this.hp;
    this.hpFormula = data.hpFormula || '';
    this.speed = data.speed || { walk: 30 };
    this.abilities = data.abilities || {
      str: 10,
      dex: 10,
      con: 10,
      int: 10,
      wis: 10,
      cha: 10
    };
    this.savingThrows = data.savingThrows || {};
    this.skills = data.skills || {};
    this.damageVulnerabilities = data.damageVulnerabilities || [];
    this.damageResistances = data.damageResistances || [];
    this.damageImmunities = data.damageImmunities || [];
    this.conditionImmunities = data.conditionImmunities || [];
    this.senses = data.senses || {};
    this.languages = data.languages || [];
    this.challengeRating = data.challengeRating || ChallengeRating.CR0;
    this.traits = data.traits || [];
    this.actions = data.actions || [];
    this.bonusActions = data.bonusActions || [];
    this.reactions = data.reactions || [];
    this.legendaryActions = data.legendaryActions || [];
    this.legendaryActionCount = data.legendaryActionCount || 0;
    this.mythicActions = data.mythicActions || [];
    this.lairActions = data.lairActions || [];
    this.regionalEffects = data.regionalEffects || [];
    this.spellcasting = data.spellcasting || null;
    this.environment = data.environment || [];
    this.source = data.source || '';
    this.description = data.description || '';
    this.notes = data.notes || '';
    this.image = data.image || '';
    this.token = data.token || '';
    this.initiative = data.initiative || 0;
    this.initiativeModifier = this.getAbilityModifier('dex');
    this.currentConditions = data.currentConditions || [];
    this.temporaryHp = data.temporaryHp || 0;
    this.customProperties = data.customProperties || {};
    this.tags = data.tags || [];
    this.isTemplate = data.isTemplate || false;
    this.templateName = data.templateName || '';
    this.instanceCount = data.instanceCount || 0;
    this.instanceId = data.instanceId || '';
  }

  /**
   * Get the ability modifier for a given ability score
   * @param {string} ability - The ability score name
   * @returns {number} The ability modifier
   */
  getAbilityModifier(ability) {
    const score = this.abilities[ability] || 10;
    return Math.floor((score - 10) / 2);
  }

  /**
   * Get the proficiency bonus based on challenge rating
   * @returns {number} The proficiency bonus
   */
  getProficiencyBonus() {
    const cr = this.challengeRating.value;
    return Math.max(2, Math.ceil(cr / 4) + 1);
  }

  /**
   * Get the passive perception score
   * @returns {number} The passive perception score
   */
  getPassivePerception() {
    const wisModifier = this.getAbilityModifier('wis');
    const profBonus = this.getProficiencyBonus();
    const hasSkill = this.skills.perception !== undefined;
    
    return 10 + wisModifier + (hasSkill ? profBonus : 0);
  }

  /**
   * Roll initiative for the monster
   * @param {Function} rollFunction - Optional function to use for rolling
   * @returns {number} The initiative roll result
   */
  rollInitiative(rollFunction) {
    const dexModifier = this.getAbilityModifier('dex');
    
    let roll;
    if (typeof rollFunction === 'function') {
      roll = rollFunction();
    } else {
      roll = Math.floor(Math.random() * 20) + 1;
    }
    
    this.initiative = roll + dexModifier;
    return this.initiative;
  }

  /**
   * Apply damage to the monster
   * @param {number} amount - The amount of damage
   * @param {string} damageType - The type of damage
   * @returns {Object} Result of the damage application
   */
  applyDamage(amount, damageType = '') {
    if (amount <= 0) return { damage: 0 };
    
    // Check for damage vulnerabilities, resistances, and immunities
    let multiplier = 1;
    let resistanceApplied = false;
    let vulnerabilityApplied = false;
    let immunityApplied = false;
    
    if (damageType) {
      if (this.damageVulnerabilities.includes(damageType)) {
        multiplier = 2;
        vulnerabilityApplied = true;
      } else if (this.damageResistances.includes(damageType)) {
        multiplier = 0.5;
        resistanceApplied = true;
      } else if (this.damageImmunities.includes(damageType)) {
        multiplier = 0;
        immunityApplied = true;
      }
    }
    
    // Calculate actual damage
    const actualDamage = Math.floor(amount * multiplier);
    
    // Apply damage to temporary HP first
    let remainingDamage = actualDamage;
    let tempHpDamage = 0;
    
    if (this.temporaryHp > 0) {
      tempHpDamage = Math.min(this.temporaryHp, remainingDamage);
      this.temporaryHp -= tempHpDamage;
      remainingDamage -= tempHpDamage;
    }
    
    // Apply remaining damage to regular HP
    this.hp = Math.max(0, this.hp - remainingDamage);
    
    return {
      damage: actualDamage,
      hpDamage: remainingDamage,
      tempHpDamage,
      resistanceApplied,
      vulnerabilityApplied,
      immunityApplied
    };
  }

  /**
   * Apply healing to the monster
   * @param {number} amount - The amount of healing
   * @returns {Object} Result of the healing application
   */
  applyHealing(amount) {
    if (amount <= 0) return { healing: 0 };
    
    const oldHp = this.hp;
    this.hp = Math.min(this.maxHp, this.hp + amount);
    const actualHealing = this.hp - oldHp;
    
    return { healing: actualHealing };
  }

  /**
   * Add temporary hit points to the monster
   * @param {number} amount - The amount of temporary hit points
   * @returns {number} The new temporary hit points
   */
  addTemporaryHp(amount) {
    if (amount <= 0) return this.temporaryHp;
    
    // Temporary HP doesn't stack, take the higher value
    this.temporaryHp = Math.max(this.temporaryHp, amount);
    
    return this.temporaryHp;
  }

  /**
   * Apply a condition to the monster
   * @param {string} condition - The condition to apply
   * @param {number} duration - The duration in rounds (-1 for indefinite)
   * @returns {boolean} True if the condition was applied
   */
  applyCondition(condition, duration = -1) {
    // Check if the monster is immune to this condition
    if (this.conditionImmunities.includes(condition)) {
      return false;
    }
    
    // Check if the monster already has this condition
    const existingCondition = this.currentConditions.find(c => c.name === condition);
    
    if (existingCondition) {
      // Update the duration if the new duration is longer
      if (duration > existingCondition.duration || duration === -1) {
        existingCondition.duration = duration;
      }
    } else {
      // Add the new condition
      this.currentConditions.push({
        name: condition,
        duration,
        appliedAt: Date.now()
      });
    }
    
    return true;
  }

  /**
   * Remove a condition from the monster
   * @param {string} condition - The condition to remove
   * @returns {boolean} True if the condition was removed
   */
  removeCondition(condition) {
    const initialLength = this.currentConditions.length;
    this.currentConditions = this.currentConditions.filter(c => c.name !== condition);
    
    return this.currentConditions.length < initialLength;
  }

  /**
   * Check if the monster has a specific condition
   * @param {string} condition - The condition to check
   * @returns {boolean} True if the monster has the condition
   */
  hasCondition(condition) {
    return this.currentConditions.some(c => c.name === condition);
  }

  /**
   * Update conditions at the end of the monster's turn
   * @returns {Array} Conditions that were removed
   */
  updateConditions() {
    const removedConditions = [];
    
    this.currentConditions = this.currentConditions.filter(condition => {
      // Skip conditions with indefinite duration
      if (condition.duration === -1) return true;
      
      // Decrease duration
      condition.duration--;
      
      // Remove if duration is up
      if (condition.duration <= 0) {
        removedConditions.push(condition.name);
        return false;
      }
      
      return true;
    });
    
    return removedConditions;
  }

  /**
   * Get a trait by name
   * @param {string} name - The name of the trait
   * @returns {Object|null} The trait or null if not found
   */
  getTrait(name) {
    return this.traits.find(trait => trait.name === name) || null;
  }

  /**
   * Get an action by name
   * @param {string} name - The name of the action
   * @returns {Object|null} The action or null if not found
   */
  getAction(name) {
    return this.actions.find(action => action.name === name) || null;
  }

  /**
   * Get a legendary action by name
   * @param {string} name - The name of the legendary action
   * @returns {Object|null} The legendary action or null if not found
   */
  getLegendaryAction(name) {
    return this.legendaryActions.find(action => action.name === name) || null;
  }

  /**
   * Check if the monster can cast a specific spell
   * @param {string} spellName - The name of the spell
   * @returns {boolean} True if the monster can cast the spell
   */
  canCastSpell(spellName) {
    if (!this.spellcasting) return false;
    
    // Check all spell lists
    for (const key in this.spellcasting.spells) {
      if (this.spellcasting.spells[key].includes(spellName)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Create a copy of this monster
   * @param {boolean} asTemplate - Whether to create a copy as a template
   * @returns {Monster} A new monster instance
   */
  clone(asTemplate = false) {
    const clone = new Monster(this);
    
    if (asTemplate) {
      clone.isTemplate = true;
      clone.templateName = this.name;
      clone.id = generateId();
    } else {
      // Generate a new ID for the clone
      clone.id = generateId();
      
      // If this is an instance from a template, increment the instance count
      if (this.isTemplate) {
        clone.isTemplate = false;
        clone.instanceCount = 1;
        clone.templateName = this.name;
      } else if (this.templateName) {
        clone.instanceCount = this.instanceCount + 1;
      }
      
      // Generate an instance ID if needed
      if (clone.templateName) {
        clone.instanceId = `${clone.templateName}-${clone.instanceCount}`;
        clone.name = `${clone.templateName} ${clone.instanceCount}`;
      }
    }
    
    return clone;
  }

  /**
   * Create a scaled version of this monster
   * @param {number} targetCR - The target challenge rating value
   * @returns {Monster} A new scaled monster instance
   */
  scale(targetCR) {
    // Find the target CR object
    let targetCRObject = null;
    for (const key in ChallengeRating) {
      if (ChallengeRating[key].value === targetCR) {
        targetCRObject = ChallengeRating[key];
        break;
      }
    }
    
    if (!targetCRObject) {
      console.warn(`Invalid target CR: ${targetCR}`);
      return this.clone();
    }
    
    const originalCR = this.challengeRating.value;
    const scaleFactor = targetCR / originalCR;
    
    // Create a clone to modify
    const scaled = this.clone();
    scaled.challengeRating = targetCRObject;
    
    // Scale HP
    scaled.maxHp = Math.round(scaled.maxHp * scaleFactor);
    scaled.hp = scaled.maxHp;
    
    // Scale damage for actions
    scaled.actions = scaled.actions.map(action => {
      if (action.damage) {
        // Simple scaling for damage
        if (typeof action.damage === 'number') {
          action.damage = Math.round(action.damage * scaleFactor);
        } else if (action.damage.average) {
          action.damage.average = Math.round(action.damage.average * scaleFactor);
        }
      }
      return action;
    });
    
    // Scale legendary actions if present
    if (scaled.legendaryActions.length > 0) {
      scaled.legendaryActions = scaled.legendaryActions.map(action => {
        if (action.damage) {
          if (typeof action.damage === 'number') {
            action.damage = Math.round(action.damage * scaleFactor);
          } else if (action.damage.average) {
            action.damage.average = Math.round(action.damage.average * scaleFactor);
          }
        }
        return action;
      });
    }
    
    // Update name to indicate scaling
    scaled.name = `${this.name} (CR ${targetCRObject.text})`;
    
    return scaled;
  }

  /**
   * Convert the monster to a combatant object for the combat tracker
   * @returns {Object} A combatant object
   */
  toCombatant() {
    return {
      id: this.id,
      name: this.name,
      type: 'monster',
      monsterType: this.type,
      hp: this.hp,
      maxHp: this.maxHp,
      ac: this.ac,
      initiative: this.initiative,
      initiativeModifier: this.initiativeModifier,
      conditions: [...this.currentConditions],
      temporaryHp: this.temporaryHp,
      size: this.size,
      cr: this.challengeRating.text,
      abilities: { ...this.abilities },
      savingThrows: { ...this.savingThrows },
      damageResistances: [...this.damageResistances],
      damageImmunities: [...this.damageImmunities],
      damageVulnerabilities: [...this.damageVulnerabilities],
      conditionImmunities: [...this.conditionImmunities],
      legendaryActions: this.legendaryActionCount > 0,
      legendaryActionCount: this.legendaryActionCount,
      mythicActions: this.mythicActions.length > 0,
      lairActions: this.lairActions.length > 0,
      image: this.image,
      token: this.token,
      notes: this.notes,
      source: this.source,
      templateName: this.templateName,
      instanceId: this.instanceId,
      tags: [...this.tags]
    };
  }

  /**
   * Convert the monster to a plain object for serialization
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      size: this.size,
      type: this.type,
      subtype: this.subtype,
      alignment: this.alignment,
      ac: this.ac,
      acType: this.acType,
      hp: this.hp,
      maxHp: this.maxHp,
      hpFormula: this.hpFormula,
      speed: this.speed,
      abilities: this.abilities,
      savingThrows: this.savingThrows,
      skills: this.skills,
      damageVulnerabilities: this.damageVulnerabilities,
      damageResistances: this.damageResistances,
      damageImmunities: this.damageImmunities,
      conditionImmunities: this.conditionImmunities,
      senses: this.senses,
      languages: this.languages,
      challengeRating: this.challengeRating,
      traits: this.traits,
      actions: this.actions,
      bonusActions: this.bonusActions,
      reactions: this.reactions,
      legendaryActions: this.legendaryActions,
      legendaryActionCount: this.legendaryActionCount,
      mythicActions: this.mythicActions,
      lairActions: this.lairActions,
      regionalEffects: this.regionalEffects,
      spellcasting: this.spellcasting,
      environment: this.environment,
      source: this.source,
      description: this.description,
      notes: this.notes,
      image: this.image,
      token: this.token,
      initiative: this.initiative,
      initiativeModifier: this.initiativeModifier,
      currentConditions: this.currentConditions,
      temporaryHp: this.temporaryHp,
      customProperties: this.customProperties,
      tags: this.tags,
      isTemplate: this.isTemplate,
      templateName: this.templateName,
      instanceCount: this.instanceCount,
      instanceId: this.instanceId
    };
  }

  /**
   * Create a monster from a plain object
   * @param {Object} data - The plain object data
   * @returns {Monster} A new monster instance
   */
  static fromJSON(data) {
    return new Monster(data);
  }
}

/**
 * Class representing a monster database
 */
export class MonsterDatabase {
  /**
   * Create a monster database
   * @param {Object} options - Database options
   */
  constructor(options = {}) {
    this.monsters = {};
    this.templates = {};
    this.customMonsters = {};
    this.sources = options.sources || [];
    this.tags = options.tags || [];
    this.filters = {
      cr: null,
      type: null,
      size: null,
      source: null,
      tags: [],
      search: ''
    };
    this.listeners = [];
  }

  /**
   * Add a monster to the database
   * @param {Monster|Object} monster - The monster to add
   * @param {boolean} isCustom - Whether this is a custom monster
   * @returns {Monster} The added monster
   */
  addMonster(monster, isCustom = false) {
    // Convert to Monster instance if needed
    const monsterInstance = monster instanceof Monster ? monster : new Monster(monster);
    
    // Determine where to store the monster
    const storage = isCustom ? this.customMonsters : this.monsters;
    
    // Store as template if marked as such
    if (monsterInstance.isTemplate) {
      this.templates[monsterInstance.id] = monsterInstance;
    } else {
      storage[monsterInstance.id] = monsterInstance;
    }
    
    // Notify listeners
    this._notifyListeners('monsterAdded', { monster: monsterInstance, isCustom });
    
    return monsterInstance;
  }

  /**
   * Get a monster by ID
   * @param {string} id - The monster ID
   * @returns {Monster|null} The monster or null if not found
   */
  getMonster(id) {
    return this.monsters[id] || this.customMonsters[id] || this.templates[id] || null;
  }

  /**
   * Remove a monster from the database
   * @param {string} id - The ID of the monster to remove
   * @returns {boolean} True if the monster was removed
   */
  removeMonster(id) {
    // Check all storage locations
    if (this.monsters[id]) {
      const monster = this.monsters[id];
      delete this.monsters[id];
      this._notifyListeners('monsterRemoved', { monster, isCustom: false });
      return true;
    }
    
    if (this.customMonsters[id]) {
      const monster = this.customMonsters[id];
      delete this.customMonsters[id];
      this._notifyListeners('monsterRemoved', { monster, isCustom: true });
      return true;
    }
    
    if (this.templates[id]) {
      const monster = this.templates[id];
      delete this.templates[id];
      this._notifyListeners('monsterRemoved', { monster, isTemplate: true });
      return true;
    }
    
    return false;
  }

  /**
   * Update a monster in the database
   * @param {string} id - The ID of the monster to update
   * @param {Object} updates - The updates to apply
   * @returns {Monster|null} The updated monster or null if not found
   */
  updateMonster(id, updates) {
    // Find the monster in all storage locations
    let monster = this.getMonster(id);
    
    if (!monster) {
      return null;
    }
    
    // Determine storage location
    const isCustom = !!this.customMonsters[id];
    const isTemplate = !!this.templates[id];
    
    // Apply updates
    Object.entries(updates).forEach(([key, value]) => {
      monster[key] = value;
    });
    
    // Notify listeners
    this._notifyListeners('monsterUpdated', { monster, isCustom, isTemplate });
    
    return monster;
  }

  /**
   * Get all monsters
   * @param {boolean} includeCustom - Whether to include custom monsters
   * @param {boolean} includeTemplates - Whether to include templates
   * @returns {Array} Array of monsters
   */
  getAllMonsters(includeCustom = true, includeTemplates = false) {
    const result = [...Object.values(this.monsters)];
    
    if (includeCustom) {
      result.push(...Object.values(this.customMonsters));
    }
    
    if (includeTemplates) {
      result.push(...Object.values(this.templates));
    }
    
    return result;
  }

  /**
   * Get all custom monsters
   * @returns {Array} Array of custom monsters
   */
  getCustomMonsters() {
    return Object.values(this.customMonsters);
  }

  /**
   * Get all monster templates
   * @returns {Array} Array of monster templates
   */
  getTemplates() {
    return Object.values(this.templates);
  }

  /**
   * Search for monsters
   * @param {string} query - The search query
   * @param {Object} options - Search options
   * @returns {Array} Matching monsters
   */
  searchMonsters(query, options = {}) {
    const {
      includeCustom = true,
      includeTemplates = false,
      limit = 0,
      exactMatch = false
    } = options;
    
    if (!query) return [];
    
    const normalizedQuery = query.toLowerCase();
    const monsters = this.getAllMonsters(includeCustom, includeTemplates);
    
    let results;
    
    if (exactMatch) {
      results = monsters.filter(monster => 
        monster.name.toLowerCase() === normalizedQuery
      );
    } else {
      results = monsters.filter(monster => 
        monster.name.toLowerCase().includes(normalizedQuery) ||
        monster.type.toLowerCase().includes(normalizedQuery) ||
        (monster.subtype && monster.subtype.toLowerCase().includes(normalizedQuery))
      );
    }
    
    // Apply limit if specified
    if (limit > 0) {
      results = results.slice(0, limit);
    }
    
    return results;
  }

    /**
   * Filter monsters based on criteria
   * @param {Object} filters - Filter criteria
   * @returns {Array} Filtered monsters
   */
  filterMonsters(filters = {}) {
    // Merge with existing filters
    this.filters = {
      ...this.filters,
      ...filters
    };
    
    // Get all monsters
    const monsters = this.getAllMonsters(true, false);
    
    // Apply filters
    return monsters.filter(monster => {
      // Filter by CR
      if (this.filters.cr !== null && monster.challengeRating.value !== this.filters.cr) {
        return false;
      }
      
      // Filter by type
      if (this.filters.type !== null && monster.type !== this.filters.type) {
        return false;
      }
      
      // Filter by size
      if (this.filters.size !== null && monster.size !== this.filters.size) {
        return false;
      }
      
      // Filter by source
      if (this.filters.source !== null && monster.source !== this.filters.source) {
        return false;
      }
      
      // Filter by tags
      if (this.filters.tags.length > 0) {
        const hasAllTags = this.filters.tags.every(tag => monster.tags.includes(tag));
        if (!hasAllTags) {
          return false;
        }
      }
      
      // Filter by search text
      if (this.filters.search) {
        const searchText = this.filters.search.toLowerCase();
        const nameMatch = monster.name.toLowerCase().includes(searchText);
        const typeMatch = monster.type.toLowerCase().includes(searchText);
        const subtypeMatch = monster.subtype && monster.subtype.toLowerCase().includes(searchText);
        
        if (!nameMatch && !typeMatch && !subtypeMatch) {
          return false;
        }
      }
      
      return true;
    });
  }

  /**
   * Clear all filters
   */
  clearFilters() {
    this.filters = {
      cr: null,
      type: null,
      size: null,
      source: null,
      tags: [],
      search: ''
    };
  }

  /**
   * Get monsters by challenge rating
   * @param {number} cr - The challenge rating value
   * @returns {Array} Monsters with the specified CR
   */
  getMonstersByCR(cr) {
    return this.getAllMonsters().filter(monster => monster.challengeRating.value === cr);
  }

  /**
   * Get monsters by type
   * @param {string} type - The monster type
   * @returns {Array} Monsters of the specified type
   */
  getMonstersByType(type) {
    return this.getAllMonsters().filter(monster => monster.type === type);
  }

  /**
   * Get monsters by environment
   * @param {string} environment - The environment
   * @returns {Array} Monsters found in the specified environment
   */
  getMonstersByEnvironment(environment) {
    return this.getAllMonsters().filter(monster => 
      monster.environment && monster.environment.includes(environment)
    );
  }

  /**
   * Get monsters by tag
   * @param {string} tag - The tag to search for
   * @returns {Array} Monsters with the specified tag
   */
  getMonstersByTag(tag) {
    return this.getAllMonsters().filter(monster => 
      monster.tags && monster.tags.includes(tag)
    );
  }

  /**
   * Create an instance from a template
   * @param {string} templateId - The template ID
   * @param {Object} options - Instance options
   * @returns {Monster|null} The created instance or null if template not found
   */
  createInstanceFromTemplate(templateId, options = {}) {
    const template = this.templates[templateId];
    
    if (!template) {
      console.warn(`Template with ID ${templateId} not found`);
      return null;
    }
    
    // Create a clone of the template
    const instance = template.clone(false);
    
    // Apply options
    if (options.name) {
      instance.name = options.name;
    }
    
    if (options.hp) {
      instance.hp = options.hp;
      instance.maxHp = options.hp;
    }
    
    if (options.ac) {
      instance.ac = options.ac;
    }
    
    // Add to database
    const isCustom = options.isCustom || false;
    this.addMonster(instance, isCustom);
    
    return instance;
  }

  /**
   * Import monsters from JSON
   * @param {string} json - JSON string of monsters
   * @param {boolean} asCustom - Whether to import as custom monsters
   * @returns {Object} Import results
   */
  importFromJSON(json, asCustom = true) {
    try {
      const data = JSON.parse(json);
      
      if (!data.monsters || !Array.isArray(data.monsters)) {
        throw new Error('Invalid monster data: monsters array missing');
      }
      
      const results = {
        imported: 0,
        failed: 0,
        monsters: []
      };
      
      // Import monsters
      data.monsters.forEach(monsterData => {
        try {
          const monster = new Monster(monsterData);
          this.addMonster(monster, asCustom);
          results.imported++;
          results.monsters.push(monster);
        } catch (error) {
          console.error(`Error importing monster ${monsterData.name || 'unknown'}:`, error);
          results.failed++;
        }
      });
      
      // Import sources if present
      if (data.sources && Array.isArray(data.sources)) {
        data.sources.forEach(source => {
          if (!this.sources.includes(source)) {
            this.sources.push(source);
          }
        });
      }
      
      // Import tags if present
      if (data.tags && Array.isArray(data.tags)) {
        data.tags.forEach(tag => {
          if (!this.tags.includes(tag)) {
            this.tags.push(tag);
          }
        });
      }
      
      // Notify listeners
      this._notifyListeners('monstersImported', results);
      
      return results;
    } catch (error) {
      console.error('Error importing monsters:', error);
      return {
        imported: 0,
        failed: 0,
        error: error.message
      };
    }
  }

  /**
   * Export monsters to JSON
   * @param {Array} monsterIds - IDs of monsters to export (all if not specified)
   * @param {boolean} includeCustomOnly - Whether to include only custom monsters
   * @returns {string} JSON string of monsters
   */
  exportToJSON(monsterIds = null, includeCustomOnly = false) {
    let monsters;
    
    if (monsterIds) {
      monsters = monsterIds.map(id => this.getMonster(id)).filter(Boolean);
    } else if (includeCustomOnly) {
      monsters = this.getCustomMonsters();
    } else {
      monsters = this.getAllMonsters(true, false);
    }
    
    return JSON.stringify({
      monsters,
      sources: this.sources,
      tags: this.tags,
      version: '2.3.1',
      exportDate: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Add a listener for monster database events
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
        console.error('Error in monster database listener:', error);
      }
    });
  }

  /**
   * Add a source to the database
   * @param {string} source - The source to add
   * @returns {boolean} True if the source was added
   */
  addSource(source) {
    if (!this.sources.includes(source)) {
      this.sources.push(source);
      this._notifyListeners('sourceAdded', { source });
      return true;
    }
    return false;
  }

  /**
   * Remove a source from the database
   * @param {string} source - The source to remove
   * @returns {boolean} True if the source was removed
   */
  removeSource(source) {
    const index = this.sources.indexOf(source);
    if (index !== -1) {
      this.sources.splice(index, 1);
      this._notifyListeners('sourceRemoved', { source });
      return true;
    }
    return false;
  }

  /**
   * Add a tag to the database
   * @param {string} tag - The tag to add
   * @returns {boolean} True if the tag was added
   */
  addTag(tag) {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
      this._notifyListeners('tagAdded', { tag });
      return true;
    }
    return false;
  }

  /**
   * Remove a tag from the database
   * @param {string} tag - The tag to remove
   * @returns {boolean} True if the tag was removed
   */
  removeTag(tag) {
    const index = this.tags.indexOf(tag);
    if (index !== -1) {
      this.tags.splice(index, 1);
      this._notifyListeners('tagRemoved', { tag });
      return true;
    }
    return false;
  }

  /**
   * Add a tag to a monster
   * @param {string} monsterId - The ID of the monster
   * @param {string} tag - The tag to add
   * @returns {boolean} True if the tag was added
   */
  addTagToMonster(monsterId, tag) {
    const monster = this.getMonster(monsterId);
    
    if (!monster) {
      return false;
    }
    
    if (!monster.tags.includes(tag)) {
      monster.tags.push(tag);
      
      // Add to global tags if not present
      this.addTag(tag);
      
      this._notifyListeners('monsterTagAdded', { monster, tag });
      return true;
    }
    
    return false;
  }

  /**
   * Remove a tag from a monster
   * @param {string} monsterId - The ID of the monster
   * @param {string} tag - The tag to remove
   * @returns {boolean} True if the tag was removed
   */
  removeTagFromMonster(monsterId, tag) {
    const monster = this.getMonster(monsterId);
    
    if (!monster) {
      return false;
    }
    
    const index = monster.tags.indexOf(tag);
    if (index !== -1) {
      monster.tags.splice(index, 1);
      this._notifyListeners('monsterTagRemoved', { monster, tag });
      return true;
    }
    
    return false;
  }

  /**
   * Get all available monster types
   * @returns {Array} Array of monster types
   */
  getMonsterTypes() {
    return Object.values(MonsterType);
  }

  /**
   * Get all available monster sizes
   * @returns {Array} Array of monster sizes
   */
  getMonsterSizes() {
    return Object.values(MonsterSize);
  }

  /**
   * Get all available challenge ratings
   * @returns {Array} Array of challenge ratings
   */
  getChallengeRatings() {
    return Object.values(ChallengeRating);
  }

  /**
   * Get all available sources
   * @returns {Array} Array of sources
   */
  getSources() {
    return [...this.sources];
  }

  /**
   * Get all available tags
   * @returns {Array} Array of tags
   */
  getTags() {
    return [...this.tags];
  }

  /**
   * Get monsters suitable for an encounter of a specific difficulty
   * @param {number} partyLevel - The average party level
   * @param {number} partySize - The number of players
   * @param {string} difficulty - The desired difficulty (easy, medium, hard, deadly)
   * @returns {Array} Suitable monsters
   */
  getMonstersForEncounter(partyLevel, partySize, difficulty) {
    // Calculate XP threshold based on party level and difficulty
    const xpThresholds = calculateXPThresholds(partyLevel, partySize);
    const targetXP = xpThresholds[difficulty];
    
    if (!targetXP) {
      return [];
    }
    
    // Get all monsters
    const allMonsters = this.getAllMonsters();
    
    // Filter monsters by XP
    const maxXP = targetXP * 1.5; // Allow some flexibility
    return allMonsters.filter(monster => {
      const monsterXP = monster.challengeRating.xp;
      return monsterXP > 0 && monsterXP <= maxXP;
    });
  }

  /**
   * Generate a random encounter
   * @param {number} partyLevel - The average party level
   * @param {number} partySize - The number of players
   * @param {Object} options - Encounter options
   * @returns {Object} The generated encounter
   */
  generateRandomEncounter(partyLevel, partySize, options = {}) {
    const {
      difficulty = 'medium',
      environment = null,
      monsterType = null,
      maxMonsters = 10,
      preferredCR = null
    } = options;
    
    // Calculate XP threshold based on party level and difficulty
    const xpThresholds = calculateXPThresholds(partyLevel, partySize);
    const targetXP = xpThresholds[difficulty];
    
    if (!targetXP) {
      return { monsters: [], totalXP: 0, difficulty };
    }
    
    // Get all monsters
    let availableMonsters = this.getAllMonsters();
    
    // Filter by environment if specified
    if (environment) {
      availableMonsters = availableMonsters.filter(monster => 
        monster.environment && monster.environment.includes(environment)
      );
    }
    
    // Filter by monster type if specified
    if (monsterType) {
      availableMonsters = availableMonsters.filter(monster => 
        monster.type === monsterType
      );
    }
    
    // Filter out monsters that are too powerful individually
    const maxIndividualXP = targetXP * 0.75;
    availableMonsters = availableMonsters.filter(monster => 
      monster.challengeRating.xp <= maxIndividualXP
    );
    
    // Sort by CR, with preferred CR first if specified
    availableMonsters.sort((a, b) => {
      if (preferredCR !== null) {
        const aDiff = Math.abs(a.challengeRating.value - preferredCR);
        const bDiff = Math.abs(b.challengeRating.value - preferredCR);
        if (aDiff !== bDiff) {
          return aDiff - bDiff;
        }
      }
      return b.challengeRating.value - a.challengeRating.value;
    });
    
    // Generate encounter
    const encounter = {
      monsters: [],
      totalXP: 0,
      difficulty
    };
    
    // Try to fill the encounter
    let remainingXP = targetXP;
    let monsterCount = 0;
    
    while (remainingXP > 0 && monsterCount < maxMonsters && availableMonsters.length > 0) {
      // Find a monster that fits within remaining XP
      const monster = availableMonsters.find(m => m.challengeRating.xp <= remainingXP);
      
      if (!monster) {
        // No suitable monster found, try a weaker one
        const weakestMonster = availableMonsters[availableMonsters.length - 1];
        
        // If even the weakest monster is too strong, stop
        if (weakestMonster.challengeRating.xp > remainingXP) {
          break;
        }
        
        encounter.monsters.push(weakestMonster);
        remainingXP -= weakestMonster.challengeRating.xp;
        monsterCount++;
      } else {
        encounter.monsters.push(monster);
        remainingXP -= monster.challengeRating.xp;
        monsterCount++;
      }
    }
    
    // Calculate total XP
    encounter.totalXP = encounter.monsters.reduce((sum, monster) => 
      sum + monster.challengeRating.xp, 0
    );
    
    // Apply encounter multiplier based on number of monsters
    encounter.adjustedXP = applyEncounterMultiplier(encounter.totalXP, encounter.monsters.length);
    
    // Determine actual difficulty
    encounter.actualDifficulty = getDifficultyFromXP(encounter.adjustedXP, partyLevel, partySize);
    
    return encounter;
  }
}

/**
 * Class for parsing monster stat blocks from text
 */
export class MonsterParser {
  /**
   * Create a monster parser
   */
  constructor() {
    this.patterns = {
      name: /^#\s+(.+)$/m,
      sizeTypeAlignment: /^(\w+) (\w+)(?: \((.+)\))?, ((?:any |lawful |neutral |chaotic |evil |good )+)$/i,
      armorClass: /^Armor Class (\d+)(?: \((.+)\))?$/i,
      hitPoints: /^Hit Points (\d+)(?: \((.+)\))?$/i,
      speed: /^Speed (.+)$/i,
      abilityScores: /^(\d+) \(\s*([+-]\d+)\s*\)\s+(\d+) \(\s*([+-]\d+)\s*\)\s+(\d+) \(\s*([+-]\d+)\s*\)\s+(\d+) \(\s*([+-]\d+)\s*\)\s+(\d+) \(\s*([+-]\d+)\s*\)\s+(\d+) \(\s*([+-]\d+)\s*\)$/,
      savingThrows: /^Saving Throws (.+)$/i,
      skills: /^Skills (.+)$/i,
      damageVulnerabilities: /^Damage Vulnerabilities (.+)$/i,
      damageResistances: /^Damage Resistances (.+)$/i,
      damageImmunities: /^Damage Immunities (.+)$/i,
      conditionImmunities: /^Condition Immunities (.+)$/i,
      senses: /^Senses (.+)$/i,
      languages: /^Languages (.+)$/i,
      challengeRating: /^Challenge (\d+\/?\d*) \(([,\d]+) XP\)$/i,
      trait: /^(?:\*\*)?([^.!?]+)(?:\.\*\*)? (.+)$/i,
      action: /^(?:\*\*)?([^.!?]+)(?:\.\*\*)? (.+)$/i,
      legendaryAction: /^(?:\*\*)?([^.!?]+)(?:\.\*\*)? (.+)$/i,
      spellcasting: /^(?:\*\*)?Spellcasting(?:\.\*\*)? (.+)$/i
    };
  }

  /**
   * Parse a monster stat block from text
   * @param {string} text - The stat block text
   * @returns {Monster} The parsed monster
   */
  parse(text) {
    const monsterData = {
      traits: [],
      actions: [],
      legendaryActions: [],
      bonusActions: [],
      reactions: []
    };
    
    // Extract name
    const nameMatch = text.match(this.patterns.name);
    if (nameMatch) {
      monsterData.name = nameMatch[1].trim();
    }
    
    // Extract size, type, and alignment
    const sizeTypeMatch = text.match(this.patterns.sizeTypeAlignment);
    if (sizeTypeMatch) {
      monsterData.size = this._parseSize(sizeTypeMatch[1]);
      monsterData.type = this._parseType(sizeTypeMatch[2]);
      monsterData.subtype = sizeTypeMatch[3] || '';
      monsterData.alignment = sizeTypeMatch[4].trim();
    }
    
    // Extract armor class
    const acMatch = text.match(this.patterns.armorClass);
    if (acMatch) {
      monsterData.ac = parseInt(acMatch[1], 10);
      monsterData.acType = acMatch[2] || '';
    }
    
    // Extract hit points
    const hpMatch = text.match(this.patterns.hitPoints);
    if (hpMatch) {
      monsterData.hp = parseInt(hpMatch[1], 10);
      monsterData.maxHp = monsterData.hp;
      monsterData.hpFormula = hpMatch[2] || '';
    }
    
    // Extract speed
    const speedMatch = text.match(this.patterns.speed);
    if (speedMatch) {
      monsterData.speed = this._parseSpeed(speedMatch[1]);
    }
    
    // Extract ability scores
    const abilityMatch = text.match(this.patterns.abilityScores);
    if (abilityMatch) {
      monsterData.abilities = {
        str: parseInt(abilityMatch[1], 10),
        dex: parseInt(abilityMatch[3], 10),
        con: parseInt(abilityMatch[5], 10),
        int: parseInt(abilityMatch[7], 10),
        wis: parseInt(abilityMatch[9], 10),
        cha: parseInt(abilityMatch[11], 10)
      };
    }
    
    // Extract saving throws
    const savesMatch = text.match(this.patterns.savingThrows);
    if (savesMatch) {
      monsterData.savingThrows = this._parseSavingThrows(savesMatch[1]);
    }
    
    // Extract skills
    const skillsMatch = text.match(this.patterns.skills);
    if (skillsMatch) {
      monsterData.skills = this._parseSkills(skillsMatch[1]);
    }
    
    // Extract damage vulnerabilities
    const vulnMatch = text.match(this.patterns.damageVulnerabilities);
    if (vulnMatch) {
      monsterData.damageVulnerabilities = this._parseDamageTypes(vulnMatch[1]);
    }
    
    // Extract damage resistances
    const resistMatch = text.match(this.patterns.damageResistances);
    if (resistMatch) {
      monsterData.damageResistances = this._parseDamageTypes(resistMatch[1]);
    }
    
    // Extract damage immunities
    const immuneMatch = text.match(this.patterns.damageImmunities);
    if (immuneMatch) {
      monsterData.damageImmunities = this._parseDamageTypes(immuneMatch[1]);
    }
    
    // Extract condition immunities
    const condImmuneMatch = text.match(this.patterns.conditionImmunities);
    if (condImmuneMatch) {
      monsterData.conditionImmunities = this._parseConditions(condImmuneMatch[1]);
    }
    
    // Extract senses
    const sensesMatch = text.match(this.patterns.senses);
    if (sensesMatch) {
      monsterData.senses = this._parseSenses(sensesMatch[1]);
    }
    
    // Extract languages
    const langMatch = text.match(this.patterns.languages);
    if (langMatch) {
      monsterData.languages = this._parseLanguages(langMatch[1]);
    }
    
    // Extract challenge rating
    const crMatch = text.match(this.patterns.challengeRating);
    if (crMatch) {
      monsterData.challengeRating = this._parseCR(crMatch[1], parseInt(crMatch[2].replace(/,/g, ''), 10));
    }
    
    // Extract traits, actions, and legendary actions
    this._parseTraitsAndActions(text, monsterData);
    
    // Create the monster
    return new Monster(monsterData);
  }

  /**
   * Parse size string to enum value
   * @param {string} sizeStr - The size string
   * @returns {string} The size enum value
   * @private
   */
  _parseSize(sizeStr) {
    const sizes = {
      tiny: MonsterSize.TINY,
      small: MonsterSize.SMALL,
      medium: MonsterSize.MEDIUM,
      large: MonsterSize.LARGE,
      huge: MonsterSize.HUGE,
      gargantuan: MonsterSize.GARGANTUAN
    };
    
    return sizes[sizeStr.toLowerCase()] || MonsterSize.MEDIUM;
  }

  /**
   * Parse type string to enum value
   * @param {string} typeStr - The type string
   * @returns {string} The type enum value
   * @private
   */
  _parseType(typeStr) {
    const types = {
      aberration: MonsterType.ABERRATION,
      beast: MonsterType.BEAST,
      celestial: MonsterType.CELESTIAL,
      construct: MonsterType.CONSTRUCT,
      dragon: MonsterType.DRAGON,
      elemental: MonsterType.ELEMENTAL,
      fey: MonsterType.FEY,
      fiend: MonsterType.FIEND,
      giant: MonsterType.GIANT,
      humanoid: MonsterType.HUMANOID,
      monstrosity: MonsterType.MONSTROSITY,
      ooze: MonsterType.OOZE,
      plant: MonsterType.PLANT,
      undead: MonsterType.UNDEAD
    };
    
    return types[typeStr.toLowerCase()] || MonsterType.HUMANOID;
  }

  /**
   * Parse speed string to object
   * @param {string} speedStr - The speed string
   * @returns {Object} The speed object
   * @private
   */
  _parseSpeed(speedStr) {
    const speed = { walk: 0 };
    const parts = speedStr.split(', ');
    
    parts.forEach(part => {
      const match = part.match(/(\w+) (\d+) ft\.?/i);
      if (match) {
        const type = match[1].toLowerCase();
        const value = parseInt(match[2], 10);
        speed[type] = value;
      } else if (part.match(/(\d+) ft\.?/i)) {
        // Default walking speed
        const walkMatch = part.match(/(\d+) ft\.?/i);
        speed.walk = parseInt(walkMatch[1], 10);
      }
    });
    
    return speed;
  }

  /**
   * Parse saving throws string to object
   * @param {string} savesStr - The saving throws string
   * @returns {Object} The saving throws object
   * @private
   */
  _parseSavingThrows(savesStr) {
    const saves = {};
    const parts = savesStr.split(', ');
    
    parts.forEach(part => {
      const match = part.match(/(\w+) ([+-]\d+)/i);
      if (match) {
        const ability = match[1].toLowerCase().substring(0, 3);
        const bonus = parseInt(match[2], 10);
        saves[ability] = bonus;
      }
    });
    
    return saves;
  }

  /**
   * Parse skills string to object
   * @param {string} skillsStr - The skills string
   * @returns {Object} The skills object
   * @private
   */
  _parseSkills(skillsStr) {
    const skills = {};
    const parts = skillsStr.split(', ');
    
    parts.forEach(part => {
      const match = part.match(/(\w+(?:\s\w+)*) ([+-]\d+)/i);
      if (match) {
        const skill = match[1].toLowerCase().replace(/\s+/g, '');
        const bonus = parseInt(match[2], 10);
        skills[skill] = bonus;
      }
    });
    
    return skills;
  }

  /**
   * Parse damage types string to array
   * @param {string} damageStr - The damage types string
   * @returns {Array} The damage types array
   * @private
   */
  _parseDamageTypes(damageStr) {
    if (damageStr.toLowerCase() === 'none') {
      return [];
    }
    
    return damageStr.split(', ')
      .map(type => type.toLowerCase().trim())
      .filter(Boolean);
  }

  /**
   * Parse conditions string to array
   * @param {string} conditionsStr - The conditions string
   * @returns {Array} The conditions array
   * @private
   */
  _parseConditions(conditionsStr) {
    if (conditionsStr.toLowerCase() === 'none') {
      return [];
    }
    
    return conditionsStr.split(', ')
      .map(condition => condition.toLowerCase().trim())
      .filter(Boolean);
  }

  /**
   * Parse senses string to object
   * @param {string} sensesStr - The senses string
   * @returns {Object} The senses object
   * @private
   */
  _parseSenses(sensesStr) {
    const senses = {};
    const parts = sensesStr.split(', ');
    
    parts.forEach(part => {
      const match = part.match(/(\w+(?:\s\w+)*) (\d+) ft\.?/i);
      if (match) {
        const sense = match[1].toLowerCase().replace(/\s+/g, '');
        const range = parseInt(match[2], 10);
        senses[sense] = range;
      } else if (part.match(/passive Perception (\d+)/i)) {
        const ppMatch = part.match(/passive Perception (\d+)/i);
        senses.passivePerception = parseInt(ppMatch[1], 10);
      }
    });
    
    return senses;
  }

  /**
   * Parse languages string to array
   * @param {string} languagesStr - The languages string
   * @returns {Array} The languages array
   * @private
   */
  _parseLanguages(languagesStr) {
    if (languagesStr.toLowerCase() === 'none' || languagesStr.toLowerCase() === '--') {
      return [];
    }
    
    return languagesStr.split(', ')
      .map(lang => lang.trim())
      .filter(Boolean);
  }

    /**
   * Parse challenge rating string to object
   * @param {string} crStr - The CR string
   * @param {number} xp - The XP value
   * @returns {Object} The CR object
   * @private
   */
  _parseCR(crStr, xp) {
    let value;
    
    if (crStr.includes('/')) {
      // Fractional CR
      const [numerator, denominator] = crStr.split('/').map(Number);
      value = numerator / denominator;
    } else {
      value = parseInt(crStr, 10);
    }
    
    // Find matching CR from enum
    for (const key in ChallengeRating) {
      if (ChallengeRating[key].value === value) {
        return ChallengeRating[key];
      }
    }
    
    // Create custom CR if not found
    return {
      value,
      xp,
      text: crStr
    };
  }

  /**
   * Parse traits and actions from text
   * @param {string} text - The stat block text
   * @param {Object} monsterData - The monster data object to populate
   * @private
   */
  _parseTraitsAndActions(text, monsterData) {
    // Split text into sections
    const sections = text.split(/\n\s*\n/);
    
    let currentSection = null;
    
    for (const section of sections) {
      if (section.match(/^Traits$/i)) {
        currentSection = 'traits';
        continue;
      } else if (section.match(/^Actions$/i)) {
        currentSection = 'actions';
        continue;
      } else if (section.match(/^Bonus Actions$/i)) {
        currentSection = 'bonusActions';
        continue;
      } else if (section.match(/^Reactions$/i)) {
        currentSection = 'reactions';
        continue;
      } else if (section.match(/^Legendary Actions$/i)) {
        currentSection = 'legendaryActions';
        continue;
      }
      
      if (!currentSection) continue;
      
      // Parse traits or actions
      const lines = section.split('\n');
      let currentItem = null;
      
      for (const line of lines) {
        if (!line.trim()) continue;
        
        // Check if this is a new trait/action
        const match = line.match(this.patterns.trait);
        
        if (match) {
          // Save previous item if exists
          if (currentItem) {
            monsterData[currentSection].push(currentItem);
          }
          
          // Start new item
          currentItem = {
            name: match[1].trim(),
            description: match[2].trim()
          };
        } else if (currentItem) {
          // Continue previous item description
          currentItem.description += ' ' + line.trim();
        }
      }
      
      // Add the last item
      if (currentItem) {
        monsterData[currentSection].push(currentItem);
      }
    }
    
    // Parse spellcasting trait
    this._parseSpellcasting(text, monsterData);
  }

  /**
   * Parse spellcasting information
   * @param {string} text - The stat block text
   * @param {Object} monsterData - The monster data object to populate
   * @private
   */
  _parseSpellcasting(text, monsterData) {
    const spellcastingMatch = text.match(/Spellcasting[.\s\S]*?(?=\n\n|$)/i);
    
    if (!spellcastingMatch) return;
    
    const spellcastingText = spellcastingMatch[0];
    
    // Extract spellcasting ability and level
    const abilityMatch = spellcastingText.match(/spellcasting ability is (\w+)/i);
    const levelMatch = spellcastingText.match(/(\d+)(?:st|nd|rd|th)-level spellcaster/i);
    
    if (!abilityMatch || !levelMatch) return;
    
    const spellcastingAbility = abilityMatch[1].toLowerCase().substring(0, 3);
    const spellcasterLevel = parseInt(levelMatch[1], 10);
    
    // Extract spell save DC and attack bonus
    const dcMatch = spellcastingText.match(/spell save DC (\d+)/i);
    const attackMatch = spellcastingText.match(/([+-]\d+) to hit/i);
    
    const spellSaveDC = dcMatch ? parseInt(dcMatch[1], 10) : null;
    const spellAttackBonus = attackMatch ? parseInt(attackMatch[1], 10) : null;
    
    // Extract spell lists
    const spells = {
      cantrips: [],
      level1: [],
      level2: [],
      level3: [],
      level4: [],
      level5: [],
      level6: [],
      level7: [],
      level8: [],
      level9: []
    };
    
    // Cantrips
    const cantripsMatch = spellcastingText.match(/Cantrips \(at will\): ([^.]+)/i);
    if (cantripsMatch) {
      spells.cantrips = cantripsMatch[1].split(', ').map(s => s.trim());
    }
    
    // Spell levels
    for (let i = 1; i <= 9; i++) {
      const levelRegex = new RegExp(`${getOrdinal(i)} level \\((?:\\d+ slots?|at will)\\): ([^.]+)`, 'i');
      const levelMatch = spellcastingText.match(levelRegex);
      
      if (levelMatch) {
        spells[`level${i}`] = levelMatch[1].split(', ').map(s => s.trim());
      }
    }
    
    // Create spellcasting object
    monsterData.spellcasting = {
      ability: spellcastingAbility,
      level: spellcasterLevel,
      dc: spellSaveDC,
      attackBonus: spellAttackBonus,
      spells
    };
  }
}

/**
 * Class for generating random monsters
 */
export class MonsterGenerator {
  /**
   * Create a monster generator
   * @param {Object} options - Generator options
   */
  constructor(options = {}) {
    this.options = {
      nameGenerator: options.nameGenerator || null,
      database: options.database || null
    };
  }

  /**
   * Generate a random monster
   * @param {Object} params - Generation parameters
   * @returns {Monster} The generated monster
   */
  generateMonster(params = {}) {
    const {
      cr = 1,
      type = this._getRandomType(),
      size = this._getRandomSize(),
      name = this._generateName(type)
    } = params;
    
    // Find CR object
    let crObject = null;
    for (const key in ChallengeRating) {
      if (ChallengeRating[key].value === cr) {
        crObject = ChallengeRating[key];
        break;
      }
    }
    
    if (!crObject) {
      crObject = ChallengeRating.CR1;
    }
    
    // Generate base stats based on CR
    const stats = this._generateStatsForCR(cr);
    
    // Create monster data
    const monsterData = {
      name,
      size,
      type,
      alignment: this._getRandomAlignment(),
      ac: stats.ac,
      hp: stats.hp,
      maxHp: stats.hp,
      speed: { walk: 30 },
      abilities: stats.abilities,
      challengeRating: crObject,
      traits: [],
      actions: []
    };
    
    // Add traits based on type
    this._addTraitsBasedOnType(monsterData);
    
    // Add actions
    this._addActions(monsterData);
    
    // Add legendary actions for higher CR monsters
    if (cr >= 5 && Math.random() < 0.3) {
      this._addLegendaryActions(monsterData);
    }
    
    return new Monster(monsterData);
  }

  /**
   * Get a random monster type
   * @returns {string} A random monster type
   * @private
   */
  _getRandomType() {
    const types = Object.values(MonsterType);
    return types[Math.floor(Math.random() * types.length)];
  }

  /**
   * Get a random monster size
   * @returns {string} A random monster size
   * @private
   */
  _getRandomSize() {
    const sizes = Object.values(MonsterSize);
    return sizes[Math.floor(Math.random() * sizes.length)];
  }

  /**
   * Get a random alignment
   * @returns {string} A random alignment
   * @private
   */
  _getRandomAlignment() {
    const alignments = [
      'lawful good',
      'neutral good',
      'chaotic good',
      'lawful neutral',
      'neutral',
      'chaotic neutral',
      'lawful evil',
      'neutral evil',
      'chaotic evil',
      'unaligned'
    ];
    
    return alignments[Math.floor(Math.random() * alignments.length)];
  }

  /**
   * Generate a name for the monster
   * @param {string} type - The monster type
   * @returns {string} A generated name
   * @private
   */
  _generateName(type) {
    if (this.options.nameGenerator) {
      return this.options.nameGenerator.generateName({ type });
    }
    
    // Simple fallback name generation
    const prefixes = [
      'Ancient', 'Dire', 'Fell', 'Giant', 'Greater', 'Lesser',
      'Mighty', 'Primeval', 'Savage', 'Shadow', 'Venomous', 'Wild'
    ];
    
    const typeNames = {
      [MonsterType.ABERRATION]: ['Horror', 'Abomination', 'Monstrosity', 'Thing'],
      [MonsterType.BEAST]: ['Wolf', 'Bear', 'Lion', 'Tiger', 'Eagle', 'Shark'],
      [MonsterType.CELESTIAL]: ['Angel', 'Deva', 'Guardian', 'Protector'],
      [MonsterType.CONSTRUCT]: ['Golem', 'Automaton', 'Sentinel', 'Defender'],
      [MonsterType.DRAGON]: ['Drake', 'Wyrm', 'Dragon', 'Wyvern'],
      [MonsterType.ELEMENTAL]: ['Elemental', 'Spirit', 'Entity', 'Force'],
      [MonsterType.FEY]: ['Sprite', 'Pixie', 'Nymph', 'Satyr'],
      [MonsterType.FIEND]: ['Demon', 'Devil', 'Fiend', 'Hellspawn'],
      [MonsterType.GIANT]: ['Giant', 'Titan', 'Colossus', 'Behemoth'],
      [MonsterType.HUMANOID]: ['Warrior', 'Hunter', 'Raider', 'Marauder'],
      [MonsterType.MONSTROSITY]: ['Beast', 'Creature', 'Monster', 'Predator'],
      [MonsterType.OOZE]: ['Slime', 'Ooze', 'Pudding', 'Jelly'],
      [MonsterType.PLANT]: ['Shambler', 'Creeper', 'Thorn', 'Vine'],
      [MonsterType.UNDEAD]: ['Zombie', 'Skeleton', 'Ghoul', 'Wraith']
    };
    
    const typeOptions = typeNames[type] || ['Creature'];
    const prefix = Math.random() < 0.5 ? prefixes[Math.floor(Math.random() * prefixes.length)] + ' ' : '';
    const typeName = typeOptions[Math.floor(Math.random() * typeOptions.length)];
    
    return prefix + typeName;
  }

  /**
   * Generate stats based on challenge rating
   * @param {number} cr - The challenge rating
   * @returns {Object} Generated stats
   * @private
   */
  _generateStatsForCR(cr) {
    // Base stats that scale with CR
    const hp = Math.floor(15 + (cr * 15));
    const ac = Math.floor(12 + (cr * 0.5));
    const profBonus = Math.max(2, Math.ceil(cr / 4) + 1);
    
    // Generate ability scores
    const abilities = {
      str: this._generateAbilityScore(10 + cr),
      dex: this._generateAbilityScore(10 + cr * 0.5),
      con: this._generateAbilityScore(10 + cr * 0.75),
      int: this._generateAbilityScore(10),
      wis: this._generateAbilityScore(10 + cr * 0.25),
      cha: this._generateAbilityScore(10)
    };
    
    return {
      hp,
      ac,
      profBonus,
      abilities
    };
  }

  /**
   * Generate a random ability score around a target value
   * @param {number} target - The target value
   * @returns {number} The generated ability score
   * @private
   */
  _generateAbilityScore(target) {
    // Generate a score within ±4 of the target
    const min = Math.max(3, Math.floor(target) - 4);
    const max = Math.min(20, Math.floor(target) + 4);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Add traits based on monster type
   * @param {Object} monsterData - The monster data to modify
   * @private
   */
  _addTraitsBasedOnType(monsterData) {
    const typeTraits = {
      [MonsterType.ABERRATION]: [
        { name: 'Alien Mind', description: 'The creature has advantage on saving throws against being charmed or frightened.' }
      ],
      [MonsterType.BEAST]: [
        { name: 'Keen Senses', description: 'The creature has advantage on Wisdom (Perception) checks that rely on smell.' }
      ],
      [MonsterType.CELESTIAL]: [
        { name: 'Divine Awareness', description: 'The creature knows if it hears a lie.' },
        { name: 'Healing Touch', description: 'The creature can touch another creature to heal 1d8 hit points once per day.' }
      ],
      [MonsterType.CONSTRUCT]: [
        { name: 'Immutable Form', description: 'The creature is immune to any spell or effect that would alter its form.' },
        { name: 'Magic Resistance', description: 'The creature has advantage on saving throws against spells and other magical effects.' }
      ],
      [MonsterType.DRAGON]: [
        { name: 'Legendary Resistance', description: 'If the creature fails a saving throw, it can choose to succeed instead. It can use this ability three times per day.' }
      ],
      [MonsterType.ELEMENTAL]: [
        { name: 'Elemental Nature', description: 'The creature doesn\'t require air, food, drink, or sleep.' }
      ],
      [MonsterType.FEY]: [
        { name: 'Fey Charm', description: 'The creature has advantage on saving throws against being charmed, and magic can\'t put it to sleep.' }
      ],
      [MonsterType.FIEND]: [
        { name: 'Devil\'s Sight', description: 'Magical darkness doesn\'t impede the creature\'s darkvision.' },
        { name: 'Magic Resistance', description: 'The creature has advantage on saving throws against spells and other magical effects.' }
      ],
      [MonsterType.GIANT]: [
        { name: 'Powerful Build', description: 'The creature counts as one size larger when determining its carrying capacity and the weight it can push, drag, or lift.' }
      ],
      [MonsterType.HUMANOID]: [
        { name: 'Tactical Mind', description: 'The creature has advantage on attack rolls against a creature if at least one of the creature\'s allies is within 5 feet of the creature and the ally isn\'t incapacitated.' }
      ],
      [MonsterType.MONSTROSITY]: [
        { name: 'Unusual Nature', description: 'The creature has advantage on saving throws against disease.' }
      ],
      [MonsterType.OOZE]: [
        { name: 'Amorphous', description: 'The creature can move through a space as narrow as 1 inch wide without squeezing.' },
        { name: 'Transparent', description: 'Even when the creature is in plain sight, it takes a successful DC 15 Wisdom (Perception) check to spot it if it has neither moved nor attacked. A creature that tries to enter the ooze\'s space while unaware of it is surprised by the ooze.' }
      ],
      [MonsterType.PLANT]: [
        { name: 'False Appearance', description: 'While the creature remains motionless, it is indistinguishable from a normal plant.' }
      ],
      [MonsterType.UNDEAD]: [
        { name: 'Undead Nature', description: 'The creature doesn\'t require air, food, drink, or sleep.' },
        { name: 'Undead Fortitude', description: 'If damage reduces the creature to 0 hit points, it must make a Constitution saving throw with a DC of 5 + the damage taken, unless the damage is radiant or from a critical hit. On a success, the creature drops to 1 hit point instead.' }
      ]
    };
    
    // Add 1-2 traits based on type
    const traits = typeTraits[monsterData.type] || [];
    if (traits.length > 0) {
      const numTraits = Math.min(traits.length, 1 + Math.floor(Math.random() * 2));
      
      // Shuffle and take the first numTraits
      const shuffled = [...traits].sort(() => 0.5 - Math.random());
      monsterData.traits.push(...shuffled.slice(0, numTraits));
    }
    
    // Add a random generic trait
    const genericTraits = [
      { name: 'Ambusher', description: 'The creature has advantage on attack rolls against any creature it has surprised.' },
      { name: 'Pack Tactics', description: 'The creature has advantage on attack rolls against a creature if at least one of the creature\'s allies is within 5 feet of the creature and the ally isn\'t incapacitated.' },
      { name: 'Nimble Escape', description: 'The creature can take the Disengage or Hide action as a bonus action on each of its turns.' },
      { name: 'Regeneration', description: 'The creature regains 3 hit points at the start of its turn if it has at least 1 hit point.' },
      { name: 'Keen Senses', description: 'The creature has advantage on Wisdom (Perception) checks.' }
    ];
    
    if (Math.random() < 0.7) {
      const randomTrait = genericTraits[Math.floor(Math.random() * genericTraits.length)];
      monsterData.traits.push(randomTrait);
    }
  }

  /**
   * Add actions to the monster
   * @param {Object} monsterData - The monster data to modify
   * @private
   */
  _addActions(monsterData) {
    // Add a melee attack
    const cr = monsterData.challengeRating.value;
    const strMod = Math.floor((monsterData.abilities.str - 10) / 2);
    const dexMod = Math.floor((monsterData.abilities.dex - 10) / 2);
    const profBonus = Math.max(2, Math.ceil(cr / 4) + 1);
    
    // Determine if the monster uses strength or dexterity for attacks
    const usesDex = dexMod > strMod || Math.random() < 0.3;
    const attackMod = usesDex ? dexMod : strMod;
    const attackBonus = attackMod + profBonus;
    
    // Generate damage based on CR
    const damageDice = Math.max(1, Math.floor(cr / 2));
    const damageBonus = usesDex ? dexMod : strMod;
    const damageType = this._getRandomDamageType();
    
    // Create melee attack
    const meleeAttack = {
      name: this._getRandomAttackName(usesDex, damageType),
      description: `Melee Weapon Attack: +${attackBonus} to hit, reach 5 ft., one target. Hit: ${damageDice}d6 + ${damageBonus} ${damageType} damage.`
    };
    
    monsterData.actions.push(meleeAttack);
    
    // Add a ranged attack for some monsters
    if (Math.random() < 0.4) {
      const rangedAttackBonus = dexMod + profBonus;
      const rangedDamageDice = Math.max(1, Math.floor(cr / 3));
      const rangedDamageType = this._getRandomDamageType();
      
      const rangedAttack = {
        name: this._getRandomRangedAttackName(rangedDamageType),
        description: `Ranged Weapon Attack: +${rangedAttackBonus} to hit, range 60/120 ft., one target. Hit: ${rangedDamageDice}d6 + ${dexMod} ${rangedDamageType} damage.`
      };
      
      monsterData.actions.push(rangedAttack);
    }
    
    // Add a special attack for higher CR monsters
    if (cr >= 3 && Math.random() < 0.6) {
      const specialAttack = this._generateSpecialAttack(monsterData);
      monsterData.actions.push(specialAttack);
    }
  }

  /**
   * Add legendary actions to the monster
   * @param {Object} monsterData - The monster data to modify
   * @private
   */
  _addLegendaryActions(monsterData) {
    monsterData.legendaryActionCount = 3;
    
    // Basic attack as legendary action
    const basicAttack = {
      name: 'Attack',
      description: 'The creature makes one weapon attack.'
    };
    
    // Movement legendary action
    const movement = {
      name: 'Move',
      description: 'The creature moves up to half its speed without provoking opportunity attacks.'
    };
    
    // Special legendary action based on type
    const specialActions = {
      [MonsterType.ABERRATION]: {
        name: 'Psychic Pulse',
        description: 'The creature emits a pulse of psychic energy. Each creature within 10 feet must succeed on a DC 14 Intelligence saving throw or take 4 (1d8) psychic damage.'
      },
      [MonsterType.DRAGON]: {
        name: 'Wing Attack (Costs 2 Actions)',
        description: 'The creature beats its wings. Each creature within 10 feet must succeed on a DC 15 Dexterity saving throw or take 7 (2d6) bludgeoning damage and be knocked prone.'
      },
      [MonsterType.FIEND]: {
        name: 'Hellish Rebuke (Costs 2 Actions)',
        description: 'In response to being damaged by a creature within 60 feet, the creature forces that creature to make a DC 14 Dexterity saving throw. The creature takes 10 (3d6) fire damage on a failed save, or half as much damage on a successful one.'
      },
      [MonsterType.UNDEAD]: {
        name: 'Horrifying Visage',
        description: 'Each creature within 30 feet that can see the creature must succeed on a DC 14 Wisdom saving throw or be frightened for 1 minute.'
      }
    };
    
    // Add legendary actions
    monsterData.legendaryActions = [basicAttack, movement];
    
    // Add special legendary action if available for this type
    if (specialActions[monsterData.type]) {
      monsterData.legendaryActions.push(specialActions[monsterData.type]);
    }
  }

  /**
   * Generate a special attack based on monster type
   * @param {Object} monsterData - The monster data
   * @returns {Object} A special attack
   * @private
   */
  _generateSpecialAttack(monsterData) {
    const cr = monsterData.challengeRating.value;
    const saveDC = 8 + Math.max(2, Math.ceil(cr / 4) + 1) + 
                  Math.floor((Math.max(...Object.values(monsterData.abilities)) - 10) / 2);
    
    const specialAttacks = {
      [MonsterType.ABERRATION]: {
        name: 'Mind Blast',
        description: `The creature emits psychic energy in a 30-foot cone. Each creature in that area must succeed on a DC ${saveDC} Intelligence saving throw or take 10 (3d6) psychic damage and be stunned for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success.`
      },
      [MonsterType.BEAST]: {
        name: 'Pounce',
        description: `If the creature moves at least 20 feet straight toward a creature and then hits it with a claw attack on the same turn, that target must succeed on a DC ${saveDC} Strength saving throw or be knocked prone. If the target is prone, the creature can make one bite attack against it as a bonus action.`
      },
      [MonsterType.CELESTIAL]: {
        name: 'Healing Touch',
        description: `The creature touches another creature. The target magically regains 10 (3d6) hit points and is freed from any curse, disease, poison, blindness, or deafness.`
      },
      [MonsterType.CONSTRUCT]: {
        name: 'Slam',
        description: `The creature slams its fists into the ground, creating a shockwave. Each creature within 10 feet must succeed on a DC ${saveDC} Dexterity saving throw or take 10 (3d6) thunder damage and be knocked prone.`
      },
      [MonsterType.DRAGON]: {
        name: 'Breath Weapon (Recharge 5-6)',
        description: `The creature exhales destructive energy in a 30-foot cone. Each creature in that area must make a DC ${saveDC} Dexterity saving throw, taking 21 (6d6) fire damage on a failed save, or half as much damage on a successful one.`
      },
      [MonsterType.ELEMENTAL]: {
        name: 'Whirlwind',
        description: `Each creature within 5 feet of the creature must succeed on a DC ${saveDC} Strength saving throw or be pushed 10 feet away and knocked prone.`
      },
      [MonsterType.FEY]: {
        name: 'Charm',
        description: `The creature targets one humanoid it can see within 30 feet. If the target can see the creature, the target must succeed on a DC ${saveDC} Wisdom saving throw or be magically charmed for 1 day. The charmed target obeys the creature's verbal commands. If the target suffers any harm, it can repeat the saving throw, ending the effect on a success.`
      },
      [MonsterType.FIEND]: {
        name: 'Hellfire',
        description: `The creature hurls a ball of fire at a point it can see within 60 feet. Each creature in a 10-foot-radius sphere centered on that point must make a DC ${saveDC} Dexterity saving throw, taking 14 (4d6) fire damage on a failed save, or half as much damage on a successful one.`
      },
      [MonsterType.GIANT]: {
        name: 'Rock',
        description: `The creature hurls a rock at a point it can see within 60 feet. Each creature within 5 feet of that point must make a DC ${saveDC} Dexterity saving throw, taking 17 (5d6) bludgeoning damage on a failed save, or half as much damage on a successful one.`
      },
      [MonsterType.HUMANOID]: {
        name: 'Leadership',
        description: `For 1 minute, the creature can utter a special command or warning whenever a nonhostile creature that it can see within 30 feet of it makes an attack roll or a saving throw. The creature can add a d4 to its roll provided it can hear and understand the creature. A creature can benefit from only one Leadership die at a time.`
      },
      [MonsterType.MONSTROSITY]: {
        name: 'Web (Recharge 5-6)',
        description: `The creature shoots a web at a creature it can see within 30 feet. The target must make a DC ${saveDC} Dexterity saving throw. On a failed save, the target is restrained by webbing. As an action, the restrained target can make a DC ${saveDC} Strength check, bursting the webbing on a success.`
      },
      [MonsterType.OOZE]: {
        name: 'Engulf',
        description: `The creature moves up to its speed. While doing so, it can enter Large or smaller creatures' spaces. Whenever the creature enters a creature's space, the target must make a DC ${saveDC} Dexterity saving throw. On a successful save, the target can choose to be pushed 5 feet back or to the side of the ooze. On a failed save, the ooze enters the target's space, and the target takes 10 (3d6) acid damage and is engulfed.`
      },
      [MonsterType.PLANT]: {
        name: 'Entangling Plants',
        description: `Plants sprout in a 15-foot radius centered on the creature, withering away after 1 minute. For the duration, that area is difficult terrain. A creature in the area when the plants appear must succeed on a DC ${saveDC} Strength saving throw or be restrained by the plants. A creature can use its action to make a DC ${saveDC} Strength check, freeing itself or another entangled creature within reach on a success.`
      },
      [MonsterType.UNDEAD]: {
        name: 'Life Drain',
        description: `The creature targets one creature it can see within 5 feet of it. The target must succeed on a DC ${saveDC} Constitution saving throw or take 14 (4d6) necrotic damage. The target's hit point maximum is reduced by an amount equal to the damage taken. This reduction lasts until the target finishes a long rest.`
      }
    };
    
    // Get special attack for this type or use a generic one
    return specialAttacks[monsterData.type] || {
      name: 'Multiattack',
      description: 'The creature makes two attacks.'
    };
  }

  /**
   * Get a random damage type
   * @returns {string} A random damage type
   * @private
   */
  _getRandomDamageType() {
    const damageTypes = [
      'slashing', 'piercing', 'bludgeoning',
      'fire', 'cold', 'lightning', 'acid', 'poison',
      'necrotic', 'radiant', 'force', 'psychic', 'thunder'
    ];
    
    // Physical damage types are more common
    const physicalWeight = 3;
    const weightedTypes = [
      ...Array(physicalWeight).fill('slashing'),
      ...Array(physicalWeight).fill('piercing'),
      ...Array(physicalWeight).fill('bludgeoning'),
      ...damageTypes.slice(3)
    ];
    
    return weightedTypes[Math.floor(Math.random() * weightedTypes.length)];
  }

    /**
   * Get a random attack name
   * @param {boolean} usesDex - Whether the attack uses dexterity
   * @param {string} damageType - The damage type
   * @returns {string} A random attack name
   * @private
   */
  _getRandomAttackName(usesDex, damageType) {
    const strengthAttacks = {
      'slashing': ['Slash', 'Cleave', 'Sword', 'Axe', 'Claw'],
      'piercing': ['Stab', 'Pierce', 'Impale', 'Spike', 'Horn'],
      'bludgeoning': ['Slam', 'Crush', 'Pummel', 'Bash', 'Smash'],
      'fire': ['Burning Strike', 'Flame Slash', 'Inferno Blade'],
      'cold': ['Frost Strike', 'Ice Blade', 'Freezing Slash'],
      'lightning': ['Lightning Strike', 'Thunder Blade', 'Shock Slash'],
      'acid': ['Acid Slash', 'Corrosive Strike', 'Dissolving Blade'],
      'poison': ['Venomous Strike', 'Toxic Slash', 'Poisoned Blade'],
      'necrotic': ['Death Strike', 'Soul Slash', 'Withering Blade'],
      'radiant': ['Radiant Strike', 'Holy Slash', 'Divine Blade'],
      'force': ['Force Strike', 'Arcane Slash', 'Magical Blade'],
      'psychic': ['Mind Slash', 'Psychic Strike', 'Thought Blade'],
      'thunder': ['Thunder Strike', 'Sonic Slash', 'Booming Blade']
    };
    
    const dexterityAttacks = {
      'slashing': ['Slice', 'Swift Cut', 'Dagger', 'Rapier'],
      'piercing': ['Jab', 'Quick Stab', 'Needle', 'Dart'],
      'bludgeoning': ['Strike', 'Quick Blow', 'Baton', 'Staff'],
      'fire': ['Burning Jab', 'Swift Flame', 'Fire Dart'],
      'cold': ['Frost Jab', 'Swift Ice', 'Freezing Dart'],
      'lightning': ['Lightning Jab', 'Swift Shock', 'Electric Dart'],
      'acid': ['Acid Jab', 'Swift Corrosion', 'Dissolving Dart'],
      'poison': ['Venomous Jab', 'Swift Toxin', 'Poisoned Dart'],
      'necrotic': ['Death Jab', 'Swift Decay', 'Withering Dart'],
      'radiant': ['Radiant Jab', 'Swift Light', 'Divine Dart'],
      'force': ['Force Jab', 'Swift Arcana', 'Magical Dart'],
      'psychic': ['Mind Jab', 'Swift Thought', 'Psychic Dart'],
      'thunder': ['Thunder Jab', 'Swift Boom', 'Sonic Dart']
    };
    
    const attackList = usesDex ? dexterityAttacks[damageType] : strengthAttacks[damageType];
    
    if (!attackList) {
      return usesDex ? 'Quick Strike' : 'Strike';
    }
    
    return attackList[Math.floor(Math.random() * attackList.length)];
  }

  /**
   * Get a random ranged attack name
   * @param {string} damageType - The damage type
   * @returns {string} A random ranged attack name
   * @private
   */
  _getRandomRangedAttackName(damageType) {
    const rangedAttacks = {
      'slashing': ['Thrown Blade', 'Chakram', 'Boomerang'],
      'piercing': ['Bow Shot', 'Crossbow Bolt', 'Thrown Spear', 'Javelin'],
      'bludgeoning': ['Thrown Rock', 'Sling Stone', 'Hurled Object'],
      'fire': ['Fire Bolt', 'Flame Dart', 'Burning Arrow'],
      'cold': ['Ice Shard', 'Frost Bolt', 'Freezing Arrow'],
      'lightning': ['Lightning Bolt', 'Shock Arrow', 'Electric Dart'],
      'acid': ['Acid Spray', 'Corrosive Bolt', 'Dissolving Arrow'],
      'poison': ['Poison Dart', 'Toxic Shot', 'Venomous Arrow'],
      'necrotic': ['Death Bolt', 'Soul Arrow', 'Withering Shot'],
      'radiant': ['Radiant Bolt', 'Holy Arrow', 'Divine Shot'],
      'force': ['Force Bolt', 'Arcane Arrow', 'Magical Shot'],
      'psychic': ['Mind Dart', 'Psychic Bolt', 'Thought Arrow'],
      'thunder': ['Thunder Bolt', 'Sonic Arrow', 'Booming Shot']
    };
    
    const attackList = rangedAttacks[damageType];
    
    if (!attackList) {
      return 'Ranged Attack';
    }
    
    return attackList[Math.floor(Math.random() * attackList.length)];
  }
}

/**
 * Calculate XP thresholds for a party
 * @param {number} level - The average party level
 * @param {number} partySize - The number of players
 * @returns {Object} XP thresholds by difficulty
 */
function calculateXPThresholds(level, partySize) {
  // XP thresholds by character level
  const thresholdsByLevel = {
    1: { easy: 25, medium: 50, hard: 75, deadly: 100 },
    2: { easy: 50, medium: 100, hard: 150, deadly: 200 },
    3: { easy: 75, medium: 150, hard: 225, deadly: 400 },
    4: { easy: 125, medium: 250, hard: 375, deadly: 500 },
    5: { easy: 250, medium: 500, hard: 750, deadly: 1100 },
    6: { easy: 300, medium: 600, hard: 900, deadly: 1400 },
    7: { easy: 350, medium: 750, hard: 1100, deadly: 1700 },
    8: { easy: 450, medium: 900, hard: 1400, deadly: 2100 },
    9: { easy: 550, medium: 1100, hard: 1600, deadly: 2400 },
    10: { easy: 600, medium: 1200, hard: 1900, deadly: 2800 },
    11: { easy: 800, medium: 1600, hard: 2400, deadly: 3600 },
    12: { easy: 1000, medium: 2000, hard: 3000, deadly: 4500 },
    13: { easy: 1100, medium: 2200, hard: 3400, deadly: 5100 },
    14: { easy: 1250, medium: 2500, hard: 3800, deadly: 5700 },
    15: { easy: 1400, medium: 2800, hard: 4300, deadly: 6400 },
    16: { easy: 1600, medium: 3200, hard: 4800, deadly: 7200 },
    17: { easy: 2000, medium: 3900, hard: 5900, deadly: 8800 },
    18: { easy: 2100, medium: 4200, hard: 6300, deadly: 9500 },
    19: { easy: 2400, medium: 4900, hard: 7300, deadly: 10900 },
    20: { easy: 2800, medium: 5700, hard: 8500, deadly: 12700 }
  };
  
  // Get thresholds for the given level
  const levelThresholds = thresholdsByLevel[level] || thresholdsByLevel[1];
  
  // Multiply by party size
  return {
    easy: levelThresholds.easy * partySize,
    medium: levelThresholds.medium * partySize,
    hard: levelThresholds.hard * partySize,
    deadly: levelThresholds.deadly * partySize
  };
}

/**
 * Apply encounter multiplier based on number of monsters
 * @param {number} xp - The total XP
 * @param {number} monsterCount - The number of monsters
 * @returns {number} The adjusted XP
 */
function applyEncounterMultiplier(xp, monsterCount) {
  let multiplier = 1;
  
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
  
  return Math.floor(xp * multiplier);
}

/**
 * Get difficulty level from XP
 * @param {number} xp - The encounter XP
 * @param {number} level - The average party level
 * @param {number} partySize - The number of players
 * @returns {string} The difficulty level
 */
function getDifficultyFromXP(xp, level, partySize) {
  const thresholds = calculateXPThresholds(level, partySize);
  
  if (xp >= thresholds.deadly) {
    return 'deadly';
  } else if (xp >= thresholds.hard) {
    return 'hard';
  } else if (xp >= thresholds.medium) {
    return 'medium';
  } else if (xp >= thresholds.easy) {
    return 'easy';
  } else {
    return 'trivial';
  }
}

/**
 * Get ordinal suffix for a number
 * @param {number} n - The number
 * @returns {string} The ordinal (1st, 2nd, 3rd, etc.)
 */
function getOrdinal(n) {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
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
 * Create a new monster
 * @param {Object} data - Monster data
 * @returns {Monster} A new monster instance
 */
export function createMonster(data = {}) {
  return new Monster(data);
}

/**
 * Create a new monster database
 * @param {Object} options - Database options
 * @returns {MonsterDatabase} A new monster database instance
 */
export function createMonsterDatabase(options = {}) {
  return new MonsterDatabase(options);
}

/**
 * Create a new monster parser
 * @returns {MonsterParser} A new monster parser instance
 */
export function createMonsterParser() {
  return new MonsterParser();
}

/**
 * Create a new monster generator
 * @param {Object} options - Generator options
 * @returns {MonsterGenerator} A new monster generator instance
 */
export function createMonsterGenerator(options = {}) {
  return new MonsterGenerator(options);
}

/**
 * Calculate the proficiency bonus for a challenge rating
 * @param {number} cr - The challenge rating
 * @returns {number} The proficiency bonus
 */
export function calculateProficiencyBonus(cr) {
  return Math.max(2, Math.ceil(cr / 4) + 1);
}

/**
 * Calculate the ability modifier for a score
 * @param {number} score - The ability score
 * @returns {number} The ability modifier
 */
export function calculateAbilityModifier(score) {
  return Math.floor((score - 10) / 2);
}

/**
 * Calculate the CR from stats
 * @param {Object} stats - Monster stats
 * @returns {Object} The calculated CR
 */
export function calculateCR(stats) {
  const { hp, ac, damagePerRound, attackBonus, saveDC } = stats;
  
  // Calculate defensive CR
  let defensiveCR = 0;
  if (hp <= 6) defensiveCR = 0;
  else if (hp <= 35) defensiveCR = 1/8;
  else if (hp <= 49) defensiveCR = 1/4;
  else if (hp <= 70) defensiveCR = 1/2;
  else if (hp <= 85) defensiveCR = 1;
  else if (hp <= 100) defensiveCR = 2;
  else if (hp <= 115) defensiveCR = 3;
  else if (hp <= 130) defensiveCR = 4;
  else if (hp <= 145) defensiveCR = 5;
  else if (hp <= 160) defensiveCR = 6;
  else if (hp <= 175) defensiveCR = 7;
  else if (hp <= 190) defensiveCR = 8;
  else if (hp <= 205) defensiveCR = 9;
  else if (hp <= 220) defensiveCR = 10;
  else if (hp <= 235) defensiveCR = 11;
  else if (hp <= 250) defensiveCR = 12;
  else if (hp <= 265) defensiveCR = 13;
  else if (hp <= 280) defensiveCR = 14;
  else if (hp <= 295) defensiveCR = 15;
  else if (hp <= 310) defensiveCR = 16;
  else if (hp <= 325) defensiveCR = 17;
  else if (hp <= 340) defensiveCR = 18;
  else if (hp <= 355) defensiveCR = 19;
  else if (hp <= 400) defensiveCR = 20;
  else if (hp <= 445) defensiveCR = 21;
  else if (hp <= 490) defensiveCR = 22;
  else if (hp <= 535) defensiveCR = 23;
  else if (hp <= 580) defensiveCR = 24;
  else if (hp <= 625) defensiveCR = 25;
  else if (hp <= 670) defensiveCR = 26;
  else if (hp <= 715) defensiveCR = 27;
  else if (hp <= 760) defensiveCR = 28;
  else if (hp <= 805) defensiveCR = 29;
  else defensiveCR = 30;
  
  // Adjust defensive CR based on AC
  const expectedAC = {
    0: 13, '1/8': 13, '1/4': 13, '1/2': 13,
    1: 13, 2: 13, 3: 13, 4: 14, 5: 15,
    6: 15, 7: 15, 8: 16, 9: 16, 10: 17,
    11: 17, 12: 17, 13: 18, 14: 18, 15: 18,
    16: 18, 17: 19, 18: 19, 19: 19, 20: 19,
    21: 19, 22: 19, 23: 19, 24: 19, 25: 19,
    26: 19, 27: 19, 28: 19, 29: 19, 30: 19
  };
  
  const acDifference = ac - expectedAC[defensiveCR];
  const acAdjustment = Math.floor(acDifference / 2);
  defensiveCR = Math.max(0, defensiveCR + acAdjustment);
  
  // Calculate offensive CR
  let offensiveCR = 0;
  if (damagePerRound <= 1) offensiveCR = 0;
  else if (damagePerRound <= 3) offensiveCR = 1/8;
  else if (damagePerRound <= 5) offensiveCR = 1/4;
  else if (damagePerRound <= 8) offensiveCR = 1/2;
  else if (damagePerRound <= 14) offensiveCR = 1;
  else if (damagePerRound <= 20) offensiveCR = 2;
  else if (damagePerRound <= 26) offensiveCR = 3;
  else if (damagePerRound <= 32) offensiveCR = 4;
  else if (damagePerRound <= 38) offensiveCR = 5;
  else if (damagePerRound <= 44) offensiveCR = 6;
  else if (damagePerRound <= 50) offensiveCR = 7;
  else if (damagePerRound <= 56) offensiveCR = 8;
  else if (damagePerRound <= 62) offensiveCR = 9;
  else if (damagePerRound <= 68) offensiveCR = 10;
  else if (damagePerRound <= 74) offensiveCR = 11;
  else if (damagePerRound <= 80) offensiveCR = 12;
  else if (damagePerRound <= 86) offensiveCR = 13;
  else if (damagePerRound <= 92) offensiveCR = 14;
  else if (damagePerRound <= 98) offensiveCR = 15;
  else if (damagePerRound <= 104) offensiveCR = 16;
  else if (damagePerRound <= 110) offensiveCR = 17;
  else if (damagePerRound <= 116) offensiveCR = 18;
  else if (damagePerRound <= 122) offensiveCR = 19;
  else if (damagePerRound <= 140) offensiveCR = 20;
  else if (damagePerRound <= 158) offensiveCR = 21;
  else if (damagePerRound <= 176) offensiveCR = 22;
  else if (damagePerRound <= 194) offensiveCR = 23;
  else if (damagePerRound <= 212) offensiveCR = 24;
  else if (damagePerRound <= 230) offensiveCR = 25;
  else if (damagePerRound <= 248) offensiveCR = 26;
  else if (damagePerRound <= 266) offensiveCR = 27;
  else if (damagePerRound <= 284) offensiveCR = 28;
  else if (damagePerRound <= 302) offensiveCR = 29;
  else offensiveCR = 30;
  
  // Adjust offensive CR based on attack bonus or save DC
  const expectedBonus = {
    0: 3, '1/8': 3, '1/4': 3, '1/2': 3,
    1: 3, 2: 3, 3: 4, 4: 5, 5: 6,
    6: 6, 7: 6, 8: 7, 9: 7, 10: 7,
    11: 8, 12: 8, 13: 8, 14: 8, 15: 8,
    16: 9, 17: 10, 18: 10, 19: 10, 20: 10,
    21: 11, 22: 11, 23: 11, 24: 12, 25: 12,
    26: 12, 27: 13, 28: 13, 29: 13, 30: 14
  };
  
  const bonusToUse = Math.max(attackBonus, saveDC - 8);
  const bonusDifference = bonusToUse - expectedBonus[offensiveCR];
  const bonusAdjustment = Math.floor(bonusDifference / 2);
  offensiveCR = Math.max(0, offensiveCR + bonusAdjustment);
  
  // Average the defensive and offensive CRs
  const finalCR = (defensiveCR + offensiveCR) / 2;
  
  // Find the closest CR from the enum
  let closestCR = null;
  let minDifference = Infinity;
  
  for (const key in ChallengeRating) {
    const cr = ChallengeRating[key];
    const difference = Math.abs(cr.value - finalCR);
    
    if (difference < minDifference) {
      minDifference = difference;
      closestCR = cr;
    }
  }
  
  return closestCR || ChallengeRating.CR0;
}

// Export the main monster functions and classes
export default {
  createMonster,
  createMonsterDatabase,
  createMonsterParser,
  createMonsterGenerator,
  calculateProficiencyBonus,
  calculateAbilityModifier,
  calculateCR,
  MonsterSize,
  MonsterType,
  ChallengeRating,
  AbilityScore,
  DamageType,
  ConditionType
};
