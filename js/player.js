/**
 * Jesster's Combat Tracker
 * Player Module
 * Version 2.3.1
 * 
 * This module handles player character data, stats, abilities, and management,
 * providing a comprehensive system for working with player entities.
 */

/**
 * Character classes
 */
export const CharacterClass = {
  ARTIFICER: 'artificer',
  BARBARIAN: 'barbarian',
  BARD: 'bard',
  CLERIC: 'cleric',
  DRUID: 'druid',
  FIGHTER: 'fighter',
  MONK: 'monk',
  PALADIN: 'paladin',
  RANGER: 'ranger',
  ROGUE: 'rogue',
  SORCERER: 'sorcerer',
  WARLOCK: 'warlock',
  WIZARD: 'wizard',
  BLOOD_HUNTER: 'blood_hunter',
  CUSTOM: 'custom'
};

/**
 * Character races
 */
export const CharacterRace = {
  DRAGONBORN: 'dragonborn',
  DWARF: 'dwarf',
  ELF: 'elf',
  GNOME: 'gnome',
  HALF_ELF: 'half-elf',
  HALF_ORC: 'half-orc',
  HALFLING: 'halfling',
  HUMAN: 'human',
  TIEFLING: 'tiefling',
  AARAKOCRA: 'aarakocra',
  GENASI: 'genasi',
  GOLIATH: 'goliath',
  AASIMAR: 'aasimar',
  BUGBEAR: 'bugbear',
  FIRBOLG: 'firbolg',
  GOBLIN: 'goblin',
  HOBGOBLIN: 'hobgoblin',
  KENKU: 'kenku',
  KOBOLD: 'kobold',
  LIZARDFOLK: 'lizardfolk',
  ORC: 'orc',
  TABAXI: 'tabaxi',
  TRITON: 'triton',
  YUAN_TI: 'yuan-ti',
  TORTLE: 'tortle',
  CHANGELING: 'changeling',
  KALASHTAR: 'kalashtar',
  SHIFTER: 'shifter',
  WARFORGED: 'warforged',
  GITH: 'gith',
  CENTAUR: 'centaur',
  LOXODON: 'loxodon',
  MINOTAUR: 'minotaur',
  SIMIC_HYBRID: 'simic hybrid',
  VEDALKEN: 'vedalken',
  VERDAN: 'verdan',
  LOCATHAH: 'locathah',
  GRUNG: 'grung',
  CUSTOM: 'custom'
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
 * Skill names
 */
export const Skill = {
  ACROBATICS: 'acrobatics',
  ANIMAL_HANDLING: 'animal handling',
  ARCANA: 'arcana',
  ATHLETICS: 'athletics',
  DECEPTION: 'deception',
  HISTORY: 'history',
  INSIGHT: 'insight',
  INTIMIDATION: 'intimidation',
  INVESTIGATION: 'investigation',
  MEDICINE: 'medicine',
  NATURE: 'nature',
  PERCEPTION: 'perception',
  PERFORMANCE: 'performance',
  PERSUASION: 'persuasion',
  RELIGION: 'religion',
  SLEIGHT_OF_HAND: 'sleight of hand',
  STEALTH: 'stealth',
  SURVIVAL: 'survival'
};

/**
 * Skill to ability score mapping
 */
export const SkillAbilities = {
  [Skill.ACROBATICS]: AbilityScore.DEX,
  [Skill.ANIMAL_HANDLING]: AbilityScore.WIS,
  [Skill.ARCANA]: AbilityScore.INT,
  [Skill.ATHLETICS]: AbilityScore.STR,
  [Skill.DECEPTION]: AbilityScore.CHA,
  [Skill.HISTORY]: AbilityScore.INT,
  [Skill.INSIGHT]: AbilityScore.WIS,
  [Skill.INTIMIDATION]: AbilityScore.CHA,
  [Skill.INVESTIGATION]: AbilityScore.INT,
  [Skill.MEDICINE]: AbilityScore.WIS,
  [Skill.NATURE]: AbilityScore.INT,
  [Skill.PERCEPTION]: AbilityScore.WIS,
  [Skill.PERFORMANCE]: AbilityScore.CHA,
  [Skill.PERSUASION]: AbilityScore.CHA,
  [Skill.RELIGION]: AbilityScore.INT,
  [Skill.SLEIGHT_OF_HAND]: AbilityScore.DEX,
  [Skill.STEALTH]: AbilityScore.DEX,
  [Skill.SURVIVAL]: AbilityScore.WIS
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
 * Class representing a player character
 */
export class Player {
  /**
   * Create a player character
   * @param {Object} data - Player character data
   */
  constructor(data = {}) {
    this.id = data.id || generateId();
    this.name = data.name || 'New Character';
    this.playerName = data.playerName || '';
    this.race = data.race || '';
    this.classes = data.classes || [{ name: CharacterClass.FIGHTER, level: 1 }];
    this.background = data.background || '';
    this.alignment = data.alignment || 'Neutral';
    this.experiencePoints = data.experiencePoints || 0;
    this.inspiration = data.inspiration || false;
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
    this.proficiencyBonus = data.proficiencyBonus || 2;
    this.armorClass = data.armorClass || 10;
    this.initiative = data.initiative || 0;
    this.initiativeModifier = this.getAbilityModifier('dex');
    this.speed = data.speed || 30;
    this.maxHitPoints = data.maxHitPoints || 10;
    this.currentHitPoints = data.currentHitPoints !== undefined ? data.currentHitPoints : this.maxHitPoints;
    this.temporaryHitPoints = data.temporaryHitPoints || 0;
    this.hitDice = data.hitDice || this._calculateHitDice();
    this.deathSaves = data.deathSaves || { successes: 0, failures: 0 };
    this.attacks = data.attacks || [];
    this.equipment = data.equipment || [];
    this.features = data.features || [];
    this.traits = data.traits || {
      personality: [],
      ideals: [],
      bonds: [],
      flaws: []
    };
    this.spellcasting = data.spellcasting || null;
    this.resources = data.resources || [];
    this.currentConditions = data.currentConditions || [];
    this.exhaustionLevel = data.exhaustionLevel || 0;
    this.defenses = data.defenses || {
      resistances: [],
      immunities: [],
      vulnerabilities: []
    };
    this.senses = data.senses || {};
    this.languages = data.languages || [];
    this.notes = data.notes || '';
    this.image = data.image || '';
    this.token = data.token || '';
    this.customProperties = data.customProperties || {};
    this.isActive = data.isActive !== undefined ? data.isActive : true;
  }

  /**
   * Get the character level
   * @returns {number} The character level
   */
  getLevel() {
    return this.classes.reduce((total, cls) => total + cls.level, 0);
  }

  /**
   * Get the primary class
   * @returns {Object} The primary class
   */
  getPrimaryClass() {
    if (this.classes.length === 0) {
      return { name: CharacterClass.FIGHTER, level: 1 };
    }
    
    // Find the class with the highest level
    return this.classes.reduce((highest, current) => 
      current.level > highest.level ? current : highest
    );
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
   * Get the saving throw modifier for a given ability
   * @param {string} ability - The ability score name
   * @returns {number} The saving throw modifier
   */
  getSavingThrowModifier(ability) {
    const abilityMod = this.getAbilityModifier(ability);
    const isProficient = this.savingThrows[ability] || false;
    
    return abilityMod + (isProficient ? this.proficiencyBonus : 0);
  }

  /**
   * Get the skill modifier for a given skill
   * @param {string} skill - The skill name
   * @returns {number} The skill modifier
   */
  getSkillModifier(skill) {
    const ability = SkillAbilities[skill] || AbilityScore.DEX;
    const abilityMod = this.getAbilityModifier(ability);
    const proficiency = this.skills[skill] || 0;
    
    // Proficiency can be 0 (none), 0.5 (half), 1 (proficient), or 2 (expertise)
    return abilityMod + (proficiency * this.proficiencyBonus);
  }

  /**
   * Get the passive perception score
   * @returns {number} The passive perception score
   */
  getPassivePerception() {
    return 10 + this.getSkillModifier(Skill.PERCEPTION);
  }

  /**
   * Roll initiative for the player
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
   * Apply damage to the player
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
      if (this.defenses.vulnerabilities.includes(damageType)) {
        multiplier = 2;
        vulnerabilityApplied = true;
      } else if (this.defenses.resistances.includes(damageType)) {
        multiplier = 0.5;
        resistanceApplied = true;
      } else if (this.defenses.immunities.includes(damageType)) {
        multiplier = 0;
        immunityApplied = true;
      }
    }
    
    // Calculate actual damage
    const actualDamage = Math.floor(amount * multiplier);
    
    // Apply damage to temporary HP first
    let remainingDamage = actualDamage;
    let tempHpDamage = 0;
    
    if (this.temporaryHitPoints > 0) {
      tempHpDamage = Math.min(this.temporaryHitPoints, remainingDamage);
      this.temporaryHitPoints -= tempHpDamage;
      remainingDamage -= tempHpDamage;
    }
    
    // Apply remaining damage to regular HP
    this.currentHitPoints = Math.max(0, this.currentHitPoints - remainingDamage);
    
    // Handle unconsciousness
    if (this.currentHitPoints === 0) {
      this.applyCondition('unconscious');
    }
    
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
   * Apply healing to the player
   * @param {number} amount - The amount of healing
   * @returns {Object} Result of the healing application
   */
  applyHealing(amount) {
    if (amount <= 0) return { healing: 0 };
    
    const oldHp = this.currentHitPoints;
    this.currentHitPoints = Math.min(this.maxHitPoints, this.currentHitPoints + amount);
    const actualHealing = this.currentHitPoints - oldHp;
    
    // Remove unconscious condition if healed above 0 HP
    if (oldHp === 0 && this.currentHitPoints > 0) {
      this.removeCondition('unconscious');
    }
    
    return { healing: actualHealing };
  }

  /**
   * Add temporary hit points to the player
   * @param {number} amount - The amount of temporary hit points
   * @returns {number} The new temporary hit points
   */
  addTemporaryHp(amount) {
    if (amount <= 0) return this.temporaryHitPoints;
    
    // Temporary HP doesn't stack, take the higher value
    this.temporaryHitPoints = Math.max(this.temporaryHitPoints, amount);
    
    return this.temporaryHitPoints;
  }

  /**
   * Apply a condition to the player
   * @param {string} condition - The condition to apply
   * @param {number} duration - The duration in rounds (-1 for indefinite)
   * @returns {boolean} True if the condition was applied
   */
  applyCondition(condition, duration = -1) {
    // Check if the player is immune to this condition
    if (this.defenses.immunities.includes(condition)) {
      return false;
    }
    
    // Check if the player already has this condition
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
    
    // Special handling for exhaustion
    if (condition === ConditionType.EXHAUSTION) {
      this.exhaustionLevel = Math.min(6, this.exhaustionLevel + 1);
    }
    
    return true;
  }

  /**
   * Remove a condition from the player
   * @param {string} condition - The condition to remove
   * @returns {boolean} True if the condition was removed
   */
  removeCondition(condition) {
    const initialLength = this.currentConditions.length;
    this.currentConditions = this.currentConditions.filter(c => c.name !== condition);
    
    // Special handling for exhaustion
    if (condition === ConditionType.EXHAUSTION && this.exhaustionLevel > 0) {
      this.exhaustionLevel--;
    }
    
    return this.currentConditions.length < initialLength;
  }

  /**
   * Check if the player has a specific condition
   * @param {string} condition - The condition to check
   * @returns {boolean} True if the player has the condition
   */
  hasCondition(condition) {
    return this.currentConditions.some(c => c.name === condition);
  }

  /**
   * Update conditions at the end of the player's turn
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
   * Make a death saving throw
   * @param {Function} rollFunction - Optional function to use for rolling
   * @returns {Object} Result of the death save
   */
  makeDeathSave(rollFunction) {
    // Only make death saves if at 0 HP
    if (this.currentHitPoints > 0) {
      return { success: false, critical: false, result: 0, message: 'Character is not dying' };
    }
    
    let roll;
    if (typeof rollFunction === 'function') {
      roll = rollFunction();
    } else {
      roll = Math.floor(Math.random() * 20) + 1;
    }
    
    // Critical success: regain 1 HP and become conscious
    if (roll === 20) {
      this.currentHitPoints = 1;
      this.removeCondition('unconscious');
      this.deathSaves.successes = 0;
      this.deathSaves.failures = 0;
      
      return { 
        success: true, 
        critical: true, 
        result: roll, 
        message: 'Critical success! Regained 1 HP and consciousness.' 
      };
    }
    
    // Critical failure: counts as two failures
    if (roll === 1) {
      this.deathSaves.failures += 2;
      
      // Check for death
      if (this.deathSaves.failures >= 3) {
        return { 
          success: false, 
          critical: true, 
          result: roll, 
          message: 'Critical failure! Character has died.' 
        };
      }
      
      return { 
        success: false, 
        critical: true, 
        result: roll, 
        message: `Critical failure! ${this.deathSaves.failures} failures.` 
      };
    }
    
    // Regular success (10 or higher)
    if (roll >= 10) {
      this.deathSaves.successes++;
      
      // Check for stabilization
      if (this.deathSaves.successes >= 3) {
        this.deathSaves.successes = 0;
        this.deathSaves.failures = 0;
        
        return { 
          success: true, 
          critical: false, 
          result: roll, 
          message: 'Character is stable but unconscious.' 
        };
      }
      
      return { 
        success: true, 
        critical: false, 
        result: roll, 
        message: `Success! ${this.deathSaves.successes} successes.` 
      };
    }
    
    // Regular failure
    this.deathSaves.failures++;
    
    // Check for death
    if (this.deathSaves.failures >= 3) {
      return { 
        success: false, 
        critical: false, 
        result: roll, 
        message: 'Character has died.' 
      };
    }
    
    return { 
      success: false, 
      critical: false, 
      result: roll, 
      message: `Failure! ${this.deathSaves.failures} failures.` 
    };
  }

  /**
   * Take a short rest
   * @param {number} hitDiceToUse - Number of hit dice to use for healing
   * @param {Function} rollFunction - Optional function to use for rolling
   * @returns {Object} Result of the short rest
   */
  takeShortRest(hitDiceToUse = 0, rollFunction) {
    const result = {
      hitDiceUsed: 0,
      healingDone: 0,
      resourcesRecovered: []
    };
    
    // Use hit dice for healing
    hitDiceToUse = Math.min(hitDiceToUse, this._getAvailableHitDice());
    
    for (let i = 0; i < hitDiceToUse; i++) {
      const hitDieResult = this._useHitDie(rollFunction);
      
      if (hitDieResult.used) {
        result.hitDiceUsed++;
        result.healingDone += hitDieResult.healing;
      }
    }
    
    // Recover resources that recharge on a short rest
    this.resources.forEach(resource => {
      if (resource.rechargeOn === 'short' || resource.rechargeOn === 'any') {
        const oldValue = resource.current;
        resource.current = resource.max;
        
        result.resourcesRecovered.push({
          name: resource.name,
          recovered: resource.current - oldValue
        });
      }
    });
    
    return result;
  }

  /**
   * Take a long rest
   * @returns {Object} Result of the long rest
   */
  takeLongRest() {
    const result = {
      hpRecovered: 0,
      hitDiceRecovered: 0,
      resourcesRecovered: [],
      conditionsRemoved: []
    };
    
    // Recover HP
    const oldHp = this.currentHitPoints;
    this.currentHitPoints = this.maxHitPoints;
    result.hpRecovered = this.currentHitPoints - oldHp;
    
    // Recover hit dice (up to half of max)
    const maxRecoverable = Math.max(1, Math.floor(this._getMaxHitDice() / 2));
    const hitDiceToRecover = Math.min(maxRecoverable, this._getMaxHitDice() - this._getAvailableHitDice());
    
    this.hitDice.forEach(hd => {
      if (result.hitDiceRecovered < hitDiceToRecover && hd.current < hd.max) {
        const recovered = Math.min(hd.max - hd.current, hitDiceToRecover - result.hitDiceRecovered);
        hd.current += recovered;
        result.hitDiceRecovered += recovered;
      }
    });
    
    // Recover all resources
    this.resources.forEach(resource => {
      const oldValue = resource.current;
      resource.current = resource.max;
      
      result.resourcesRecovered.push({
        name: resource.name,
        recovered: resource.current - oldValue
      });
    });
    
    // Remove exhaustion
    if (this.exhaustionLevel > 0) {
      this.exhaustionLevel--;
      if (this.exhaustionLevel === 0) {
        result.conditionsRemoved.push(ConditionType.EXHAUSTION);
      }
    }
    
    // Reset death saves
    this.deathSaves.successes = 0;
    this.deathSaves.failures = 0;
    
    return result;
  }

  /**
   * Use a hit die for healing
   * @param {Function} rollFunction - Optional function to use for rolling
   * @returns {Object} Result of using the hit die
   * @private
   */
  _useHitDie(rollFunction) {
    // Find an available hit die
    const availableHitDie = this.hitDice.find(hd => hd.current > 0);
    
    if (!availableHitDie) {
      return { used: false, healing: 0 };
    }
    
    // Roll the hit die
    let roll;
    if (typeof rollFunction === 'function') {
      roll = rollFunction(availableHitDie.size);
    } else {
      const dieSize = parseInt(availableHitDie.size.replace('d', ''), 10);
      roll = Math.floor(Math.random() * dieSize) + 1;
    }
    
    // Add Constitution modifier
    const conMod = this.getAbilityModifier('con');
    const healing = Math.max(1, roll + conMod);
    
    // Apply healing
    this.currentHitPoints = Math.min(this.maxHitPoints, this.currentHitPoints + healing);
    
    // Reduce available hit dice
    availableHitDie.current--;
    
    return { used: true, healing };
  }

  /**
   * Get the total number of available hit dice
   * @returns {number} The number of available hit dice
   * @private
   */
  _getAvailableHitDice() {
    return this.hitDice.reduce((total, hd) => total + hd.current, 0);
  }

  /**
   * Get the maximum number of hit dice
   * @returns {number} The maximum number of hit dice
   * @private
   */
  _getMaxHitDice() {
    return this.hitDice.reduce((total, hd) => total + hd.max, 0);
  }

  /**
   * Calculate hit dice based on classes
   * @returns {Array} The calculated hit dice
   * @private
   */
  _calculateHitDice() {
    const hitDice = [];
    const hitDieByClass = {
      [CharacterClass.ARTIFICER]: 'd8',
      [CharacterClass.BARBARIAN]: 'd12',
      [CharacterClass.BARD]: 'd8',
      [CharacterClass.CLERIC]: 'd8',
      [CharacterClass.DRUID]: 'd8',
      [CharacterClass.FIGHTER]: 'd10',
      [CharacterClass.MONK]: 'd8',
      [CharacterClass.PALADIN]: 'd10',
      [CharacterClass.RANGER]: 'd10',
      [CharacterClass.ROGUE]: 'd8',
      [CharacterClass.SORCERER]: 'd6',
      [CharacterClass.WARLOCK]: 'd8',
      [CharacterClass.WIZARD]: 'd6',
      [CharacterClass.BLOOD_HUNTER]: 'd10',
      [CharacterClass.CUSTOM]: 'd8'
    };
    
    // Group hit dice by size
    const hitDiceMap = {};
    
    this.classes.forEach(cls => {
      const dieSize = hitDieByClass[cls.name] || 'd8';
      
      if (!hitDiceMap[dieSize]) {
        hitDiceMap[dieSize] = 0;
      }
      
      hitDiceMap[dieSize] += cls.level;
    });
    
    // Convert to array format
    for (const [size, count] of Object.entries(hitDiceMap)) {
      hitDice.push({
        size,
        max: count,
        current: count
      });
    }
    
    return hitDice;
  }

  /**
   * Add a resource to the player
   * @param {string} name - The resource name
   * @param {number} max - The maximum value
   * @param {string} rechargeOn - When the resource recharges ('short', 'long', 'any', 'none')
   * @returns {Object} The added resource
   */
  addResource(name, max, rechargeOn = 'long') {
    const resource = {
      name,
      max,
      current: max,
      rechargeOn
    };
    
    this.resources.push(resource);
    return resource;
  }

  /**
   * Use a resource
   * @param {string} name - The resource name
   * @param {number} amount - The amount to use
   * @returns {boolean} True if the resource was used successfully
   */
  useResource(name, amount = 1) {
    const resource = this.resources.find(r => r.name === name);
    
    if (!resource || resource.current < amount) {
      return false;
    }
    
    resource.current -= amount;
    return true;
  }

  /**
   * Recover a resource
   * @param {string} name - The resource name
   * @param {number} amount - The amount to recover
   * @returns {boolean} True if the resource was recovered successfully
   */
  recoverResource(name, amount = 1) {
    const resource = this.resources.find(r => r.name === name);
    
    if (!resource) {
      return false;
    }
    
    resource.current = Math.min(resource.max, resource.current + amount);
    return true;
  }

  /**
   * Add an attack to the player
   * @param {Object} attack - The attack to add
   * @returns {Object} The added attack
   */
  addAttack(attack) {
    if (!attack.id) {
      attack.id = generateId();
    }
    
    this.attacks.push(attack);
    return attack;
  }

  /**
   * Remove an attack from the player
   * @param {string} attackId - The ID of the attack to remove
   * @returns {boolean} True if the attack was removed
   */
  removeAttack(attackId) {
    const initialLength = this.attacks.length;
    this.attacks = this.attacks.filter(a => a.id !== attackId);
    
    return this.attacks.length < initialLength;
  }

  /**
   * Add equipment to the player
   * @param {Object} item - The equipment to add
   * @returns {Object} The added equipment
   */
  addEquipment(item) {
    if (!item.id) {
      item.id = generateId();
    }
    
    this.equipment.push(item);
    return item;
  }

    /**
   * Remove equipment from the player
   * @param {string} itemId - The ID of the equipment to remove
   * @returns {boolean} True if the equipment was removed
   */
  removeEquipment(itemId) {
    const initialLength = this.equipment.length;
    this.equipment = this.equipment.filter(item => item.id !== itemId);
    
    return this.equipment.length < initialLength;
  }

  /**
   * Add a feature to the player
   * @param {Object} feature - The feature to add
   * @returns {Object} The added feature
   */
  addFeature(feature) {
    if (!feature.id) {
      feature.id = generateId();
    }
    
    this.features.push(feature);
    return feature;
  }

  /**
   * Remove a feature from the player
   * @param {string} featureId - The ID of the feature to remove
   * @returns {boolean} True if the feature was removed
   */
  removeFeature(featureId) {
    const initialLength = this.features.length;
    this.features = this.features.filter(feature => feature.id !== featureId);
    
    return this.features.length < initialLength;
  }

  /**
   * Add a spell to the player's spellcasting
   * @param {Object} spell - The spell to add
   * @param {number} level - The spell level
   * @returns {boolean} True if the spell was added
   */
  addSpell(spell, level) {
    if (!this.spellcasting) {
      this.spellcasting = {
        ability: 'int',
        spells: {
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
        },
        slots: {
          level1: { max: 0, used: 0 },
          level2: { max: 0, used: 0 },
          level3: { max: 0, used: 0 },
          level4: { max: 0, used: 0 },
          level5: { max: 0, used: 0 },
          level6: { max: 0, used: 0 },
          level7: { max: 0, used: 0 },
          level8: { max: 0, used: 0 },
          level9: { max: 0, used: 0 }
        }
      };
    }
    
    if (!spell.id) {
      spell.id = generateId();
    }
    
    const levelKey = level === 0 ? 'cantrips' : `level${level}`;
    
    if (!this.spellcasting.spells[levelKey]) {
      return false;
    }
    
    // Check if the spell is already in the list
    if (this.spellcasting.spells[levelKey].some(s => s.name === spell.name)) {
      return false;
    }
    
    this.spellcasting.spells[levelKey].push(spell);
    return true;
  }

  /**
   * Remove a spell from the player's spellcasting
   * @param {string} spellId - The ID of the spell to remove
   * @returns {boolean} True if the spell was removed
   */
  removeSpell(spellId) {
    if (!this.spellcasting) {
      return false;
    }
    
    let removed = false;
    
    // Check all spell levels
    for (const levelKey in this.spellcasting.spells) {
      const initialLength = this.spellcasting.spells[levelKey].length;
      this.spellcasting.spells[levelKey] = this.spellcasting.spells[levelKey].filter(spell => spell.id !== spellId);
      
      if (this.spellcasting.spells[levelKey].length < initialLength) {
        removed = true;
        break;
      }
    }
    
    return removed;
  }

  /**
   * Use a spell slot
   * @param {number} level - The spell slot level
   * @returns {boolean} True if the spell slot was used
   */
  useSpellSlot(level) {
    if (!this.spellcasting || level < 1 || level > 9) {
      return false;
    }
    
    const levelKey = `level${level}`;
    const slots = this.spellcasting.slots[levelKey];
    
    if (!slots || slots.used >= slots.max) {
      return false;
    }
    
    slots.used++;
    return true;
  }

  /**
   * Recover a spell slot
   * @param {number} level - The spell slot level
   * @returns {boolean} True if the spell slot was recovered
   */
  recoverSpellSlot(level) {
    if (!this.spellcasting || level < 1 || level > 9) {
      return false;
    }
    
    const levelKey = `level${level}`;
    const slots = this.spellcasting.slots[levelKey];
    
    if (!slots || slots.used <= 0) {
      return false;
    }
    
    slots.used--;
    return true;
  }

  /**
   * Get the spell save DC
   * @returns {number} The spell save DC
   */
  getSpellSaveDC() {
    if (!this.spellcasting) {
      return 8;
    }
    
    const abilityMod = this.getAbilityModifier(this.spellcasting.ability);
    return 8 + this.proficiencyBonus + abilityMod;
  }

  /**
   * Get the spell attack bonus
   * @returns {number} The spell attack bonus
   */
  getSpellAttackBonus() {
    if (!this.spellcasting) {
      return 0;
    }
    
    const abilityMod = this.getAbilityModifier(this.spellcasting.ability);
    return this.proficiencyBonus + abilityMod;
  }

  /**
   * Level up the character
   * @param {string} className - The class to level up
   * @param {Object} options - Level up options
   * @returns {Object} Result of the level up
   */
  levelUp(className, options = {}) {
    // Find the class to level up
    const classToLevel = this.classes.find(c => c.name === className);
    
    if (!classToLevel) {
      // Add a new class
      this.classes.push({
        name: className,
        level: 1,
        subclass: options.subclass || ''
      });
      
      return this._processLevelUp(className, 1, options);
    }
    
    // Level up existing class
    classToLevel.level++;
    
    // Add subclass if specified and not already set
    if (options.subclass && !classToLevel.subclass) {
      classToLevel.subclass = options.subclass;
    }
    
    return this._processLevelUp(className, classToLevel.level, options);
  }

  /**
   * Process level up changes
   * @param {string} className - The class being leveled up
   * @param {number} newLevel - The new level in this class
   * @param {Object} options - Level up options
   * @returns {Object} Result of the level up
   * @private
   */
  _processLevelUp(className, newLevel, options) {
    const result = {
      className,
      newLevel,
      totalLevel: this.getLevel(),
      changes: []
    };
    
    // Update proficiency bonus
    const oldProfBonus = this.proficiencyBonus;
    this.proficiencyBonus = Math.ceil(this.getLevel() / 4) + 1;
    
    if (this.proficiencyBonus !== oldProfBonus) {
      result.changes.push({
        type: 'proficiencyBonus',
        old: oldProfBonus,
        new: this.proficiencyBonus
      });
    }
    
    // Update hit points
    if (options.hitPoints) {
      const oldMaxHp = this.maxHitPoints;
      this.maxHitPoints += options.hitPoints;
      this.currentHitPoints += options.hitPoints;
      
      result.changes.push({
        type: 'hitPoints',
        old: oldMaxHp,
        new: this.maxHitPoints,
        gained: options.hitPoints
      });
    }
    
    // Update hit dice
    const oldHitDice = [...this.hitDice];
    this.hitDice = this._calculateHitDice();
    
    result.changes.push({
      type: 'hitDice',
      old: oldHitDice,
      new: this.hitDice
    });
    
    // Add features if provided
    if (options.features && Array.isArray(options.features)) {
      options.features.forEach(feature => {
        this.addFeature(feature);
        
        result.changes.push({
          type: 'feature',
          feature
        });
      });
    }
    
    // Update spell slots if provided
    if (options.spellSlots && this.spellcasting) {
      for (const level in options.spellSlots) {
        const levelKey = `level${level}`;
        
        if (this.spellcasting.slots[levelKey]) {
          const oldMax = this.spellcasting.slots[levelKey].max;
          this.spellcasting.slots[levelKey].max += options.spellSlots[level];
          
          result.changes.push({
            type: 'spellSlots',
            level,
            old: oldMax,
            new: this.spellcasting.slots[levelKey].max,
            gained: options.spellSlots[level]
          });
        }
      }
    }
    
    // Add resources if provided
    if (options.resources && Array.isArray(options.resources)) {
      options.resources.forEach(resource => {
        const existingResource = this.resources.find(r => r.name === resource.name);
        
        if (existingResource) {
          const oldMax = existingResource.max;
          existingResource.max += resource.max;
          existingResource.current += resource.max;
          
          result.changes.push({
            type: 'resourceUpdated',
            name: resource.name,
            old: oldMax,
            new: existingResource.max,
            gained: resource.max
          });
        } else {
          this.addResource(resource.name, resource.max, resource.rechargeOn);
          
          result.changes.push({
            type: 'resourceAdded',
            resource
          });
        }
      });
    }
    
    return result;
  }

  /**
   * Convert the player to a combatant object for the combat tracker
   * @returns {Object} A combatant object
   */
  toCombatant() {
    return {
      id: this.id,
      name: this.name,
      type: 'player',
      playerName: this.playerName,
      hp: this.currentHitPoints,
      maxHp: this.maxHitPoints,
      ac: this.armorClass,
      initiative: this.initiative,
      initiativeModifier: this.initiativeModifier,
      conditions: [...this.currentConditions],
      temporaryHitPoints: this.temporaryHitPoints,
      classes: this.classes.map(c => `${c.name} ${c.level}`).join(', '),
      level: this.getLevel(),
      abilities: { ...this.abilities },
      savingThrows: { ...this.savingThrows },
      skills: { ...this.skills },
      passivePerception: this.getPassivePerception(),
      speed: this.speed,
      spellSaveDC: this.getSpellSaveDC(),
      spellAttackBonus: this.getSpellAttackBonus(),
      proficiencyBonus: this.proficiencyBonus,
      image: this.image,
      token: this.token,
      notes: this.notes,
      isActive: this.isActive
    };
  }

  /**
   * Convert the player to a plain object for serialization
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      playerName: this.playerName,
      race: this.race,
      classes: this.classes,
      background: this.background,
      alignment: this.alignment,
      experiencePoints: this.experiencePoints,
      inspiration: this.inspiration,
      abilities: this.abilities,
      savingThrows: this.savingThrows,
      skills: this.skills,
      proficiencyBonus: this.proficiencyBonus,
      armorClass: this.armorClass,
      initiative: this.initiative,
      initiativeModifier: this.initiativeModifier,
      speed: this.speed,
      maxHitPoints: this.maxHitPoints,
      currentHitPoints: this.currentHitPoints,
      temporaryHitPoints: this.temporaryHitPoints,
      hitDice: this.hitDice,
      deathSaves: this.deathSaves,
      attacks: this.attacks,
      equipment: this.equipment,
      features: this.features,
      traits: this.traits,
      spellcasting: this.spellcasting,
      resources: this.resources,
      currentConditions: this.currentConditions,
      exhaustionLevel: this.exhaustionLevel,
      defenses: this.defenses,
      senses: this.senses,
      languages: this.languages,
      notes: this.notes,
      image: this.image,
      token: this.token,
      customProperties: this.customProperties,
      isActive: this.isActive
    };
  }

  /**
   * Create a player from a plain object
   * @param {Object} data - The plain object data
   * @returns {Player} A new player instance
   */
  static fromJSON(data) {
    return new Player(data);
  }
}

/**
 * Class representing a player database
 */
export class PlayerDatabase {
  /**
   * Create a player database
   */
  constructor() {
    this.players = {};
    this.listeners = [];
  }

  /**
   * Add a player to the database
   * @param {Player|Object} player - The player to add
   * @returns {Player} The added player
   */
  addPlayer(player) {
    // Convert to Player instance if needed
    const playerInstance = player instanceof Player ? player : new Player(player);
    
    this.players[playerInstance.id] = playerInstance;
    
    // Notify listeners
    this._notifyListeners('playerAdded', { player: playerInstance });
    
    return playerInstance;
  }

  /**
   * Get a player by ID
   * @param {string} id - The player ID
   * @returns {Player|null} The player or null if not found
   */
  getPlayer(id) {
    return this.players[id] || null;
  }

  /**
   * Remove a player from the database
   * @param {string} id - The ID of the player to remove
   * @returns {boolean} True if the player was removed
   */
  removePlayer(id) {
    if (this.players[id]) {
      const player = this.players[id];
      delete this.players[id];
      
      // Notify listeners
      this._notifyListeners('playerRemoved', { player });
      
      return true;
    }
    
    return false;
  }

  /**
   * Update a player in the database
   * @param {string} id - The ID of the player to update
   * @param {Object} updates - The updates to apply
   * @returns {Player|null} The updated player or null if not found
   */
  updatePlayer(id, updates) {
    const player = this.getPlayer(id);
    
    if (!player) {
      return null;
    }
    
    // Apply updates
    Object.entries(updates).forEach(([key, value]) => {
      player[key] = value;
    });
    
    // Notify listeners
    this._notifyListeners('playerUpdated', { player });
    
    return player;
  }

  /**
   * Get all players
   * @returns {Array} Array of players
   */
  getAllPlayers() {
    return Object.values(this.players);
  }

  /**
   * Get active players
   * @returns {Array} Array of active players
   */
  getActivePlayers() {
    return Object.values(this.players).filter(player => player.isActive);
  }

  /**
   * Search for players
   * @param {string} query - The search query
   * @returns {Array} Matching players
   */
  searchPlayers(query) {
    if (!query) return [];
    
    const normalizedQuery = query.toLowerCase();
    
    return Object.values(this.players).filter(player => 
      player.name.toLowerCase().includes(normalizedQuery) ||
      player.playerName.toLowerCase().includes(normalizedQuery)
    );
  }

  /**
   * Import players from JSON
   * @param {string} json - JSON string of players
   * @returns {Object} Import results
   */
  importFromJSON(json) {
    try {
      const data = JSON.parse(json);
      
      if (!data.players || !Array.isArray(data.players)) {
        throw new Error('Invalid player data: players array missing');
      }
      
      const results = {
        imported: 0,
        failed: 0,
        players: []
      };
      
      // Import players
      data.players.forEach(playerData => {
        try {
          const player = new Player(playerData);
          this.addPlayer(player);
          results.imported++;
          results.players.push(player);
        } catch (error) {
          console.error(`Error importing player ${playerData.name || 'unknown'}:`, error);
          results.failed++;
        }
      });
      
      // Notify listeners
      this._notifyListeners('playersImported', results);
      
      return results;
    } catch (error) {
      console.error('Error importing players:', error);
      return {
        imported: 0,
        failed: 0,
        error: error.message
      };
    }
  }

  /**
   * Export players to JSON
   * @param {Array} playerIds - IDs of players to export (all if not specified)
   * @returns {string} JSON string of players
   */
  exportToJSON(playerIds = null) {
    let players;
    
    if (playerIds) {
      players = playerIds.map(id => this.getPlayer(id)).filter(Boolean);
    } else {
      players = this.getAllPlayers();
    }
    
    return JSON.stringify({
      players,
      version: '2.3.1',
      exportDate: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Add a listener for player database events
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
        console.error('Error in player database listener:', error);
      }
    });
  }
}

/**
 * Class for generating character sheets
 */
export class CharacterSheetGenerator {
  /**
   * Create a character sheet generator
   */
  constructor() {
    this.templates = {
      default: `
        <div class="character-sheet">
          <div class="character-header">
            <h1>{{name}}</h1>
            <div class="character-subtitle">
              {{race}} {{classesText}} | {{alignment}}
            </div>
            <div class="character-player">Player: {{playerName}}</div>
          </div>
          
          <div class="character-main">
            <div class="character-abilities">
              {{#each abilities}}
              <div class="ability-score">
                <div class="ability-name">{{name}}</div>
                <div class="ability-value">{{value}}</div>
                <div class="ability-modifier">{{modifier}}</div>
              </div>
              {{/each}}
            </div>
            
            <div class="character-combat">
              <div class="combat-stat">
                <div class="stat-name">Armor Class</div>
                <div class="stat-value">{{armorClass}}</div>
              </div>
              <div class="combat-stat">
                <div class="stat-name">Initiative</div>
                <div class="stat-value">{{initiativeModifier}}</div>
              </div>
              <div class="combat-stat">
                <div class="stat-name">Speed</div>
                <div class="stat-value">{{speed}} ft.</div>
              </div>
              <div class="combat-stat hp">
                <div class="stat-name">Hit Points</div>
                <div class="stat-value">{{currentHitPoints}} / {{maxHitPoints}}</div>
              </div>
              <div class="combat-stat">
                <div class="stat-name">Hit Dice</div>
                <div class="stat-value">{{hitDiceText}}</div>
              </div>
            </div>
            
            <div class="character-skills">
              <h3>Skills</h3>
              {{#each skillModifiers}}
              <div class="skill">
                <span class="skill-name">{{name}}</span>
                <span class="skill-modifier">{{modifier}}</span>
              </div>
              {{/each}}
            </div>
          </div>
          
          <div class="character-features">
            <h3>Features & Traits</h3>
            <ul>
              {{#each features}}
              <li><strong>{{name}}:</strong> {{description}}</li>
              {{/each}}
            </ul>
          </div>
          
          {{#if hasSpells}}
          <div class="character-spells">
            <h3>Spellcasting</h3>
            <div class="spell-info">
              <div>Spellcasting Ability: {{spellcastingAbility}}</div>
              <div>Spell Save DC: {{spellSaveDC}}</div>
              <div>Spell Attack Bonus: +{{spellAttackBonus}}</div>
            </div>
            
            {{#if hasCantrips}}
            <h4>Cantrips</h4>
            <ul class="spell-list">
              {{#each spellcasting.spells.cantrips}}
              <li>{{name}}</li>
              {{/each}}
            </ul>
            {{/if}}
            
            {{#each spellLevels}}
            <h4>Level {{level}} Spells ({{slots.used}}/{{slots.max}} slots used)</h4>
            <ul class="spell-list">
              {{#each spells}}
              <li>{{name}}</li>
              {{/each}}
            </ul>
            {{/each}}
          </div>
          {{/if}}
          
          <div class="character-equipment">
            <h3>Equipment</h3>
            <ul>
              {{#each equipment}}
              <li>{{name}}{{#if quantity}} ({{quantity}}){{/if}}</li>
              {{/each}}
            </ul>
          </div>
        </div>
      `
    };
  }

  /**
   * Generate a character sheet for a player
   * @param {Player} player - The player
   * @param {string} templateName - The template to use
   * @returns {string} The generated character sheet HTML
   */
  generateSheet(player, templateName = 'default') {
    const template = this.templates[templateName] || this.templates.default;
    
    // Prepare data for the template
    const data = this._prepareTemplateData(player);
    
    // Replace template variables
    return this._renderTemplate(template, data);
  }

  /**
   * Prepare data for the template
   * @param {Player} player - The player
   * @returns {Object} The prepared data
   * @private
   */
  _prepareTemplateData(player) {
    // Format classes text
    const classesText = player.classes
      .map(c => `${c.name} ${c.level}${c.subclass ? ` (${c.subclass})` : ''}`)
      .join(', ');
    
    // Format ability scores
    const abilities = Object.entries(player.abilities).map(([key, value]) => {
      const modifier = player.getAbilityModifier(key);
      return {
        name: key.toUpperCase(),
        value,
        modifier: modifier >= 0 ? `+${modifier}` : modifier
      };
    });
    
    // Format skill modifiers
    const skillModifiers = Object.values(Skill).map(skill => {
      const modifier = player.getSkillModifier(skill);
      return {
        name: skill.charAt(0).toUpperCase() + skill.slice(1),
        modifier: modifier >= 0 ? `+${modifier}` : modifier
      };
    });
    
    // Format hit dice
    const hitDiceText = player.hitDice
      .map(hd => `${hd.current}/${hd.max}${hd.size}`)
      .join(', ');
    
    // Format spell levels
    const spellLevels = [];
    if (player.spellcasting) {
      for (let i = 1; i <= 9; i++) {
        const levelKey = `level${i}`;
        const slots = player.spellcasting.slots[levelKey];
        
        if (slots && slots.max > 0) {
          spellLevels.push({
            level: i,
            slots,
            spells: player.spellcasting.spells[levelKey] || []
          });
        }
      }
    }
    
    return {
      ...player,
      classesText,
      abilities,
      skillModifiers,
      hitDiceText,
      spellLevels,
      hasSpells: player.spellcasting !== null,
      hasCantrips: player.spellcasting && player.spellcasting.spells.cantrips.length > 0,
      spellcastingAbility: player.spellcasting ? player.spellcasting.ability.toUpperCase() : '',
      spellSaveDC: player.getSpellSaveDC(),
      spellAttackBonus: player.getSpellAttackBonus()
    };
  }

  /**
   * Render a template with data
   * @param {string} template - The template string
   * @param {Object} data - The data to render
   * @returns {string} The rendered template
   * @private
   */
  _renderTemplate(template, data) {
    let result = template;
    
    // Replace simple variables
    result = result.replace(/\{\{([^#\/\{]+?)\}\}/g, (match, key) => {
      const trimmedKey = key.trim();
      return this._getNestedProperty(data, trimmedKey) || '';
    });
    
    // Handle each loops
    result = this._processEachBlocks(result, data);
    
    // Handle if conditions
    result = this._processIfBlocks(result, data);
    
    return result;
  }

  /**
   * Process each blocks in the template
   * @param {string} template - The template string
   * @param {Object} data - The data to render
   * @returns {string} The processed template
   * @private
   */
  _processEachBlocks(template, data) {
    const eachRegex = /\{\{#each\s+([^\}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
    
    return template.replace(eachRegex, (match, path, content) => {
      const items = this._getNestedProperty(data, path.trim());
      
      if (!Array.isArray(items)) {
        return '';
      }
      
      return items.map(item => {
        let itemContent = content;
        
        // Replace item properties
        itemContent = itemContent.replace(/\{\{([^#\/\{]+?)\}\}/g, (m, key) => {
          const trimmedKey = key.trim();
          return item[trimmedKey] !== undefined ? item[trimmedKey] : '';
        });
        
        return itemContent;
      }).join('');
    });
  }

  /**
   * Process if blocks in the template
   * @param {string} template - The template string
   * @param {Object} data - The data to render
   * @returns {string} The processed template
   * @private
   */
  _processIfBlocks(template, data) {
    const ifRegex = /\{\{#if\s+([^\}]+)\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/if\}\}/g;
    
    return template.replace(ifRegex, (match, condition, ifContent, elseContent = '') => {
      const value = this._getNestedProperty(data, condition.trim());
      
      if (value) {
        return this._renderTemplate(ifContent, data);
      } else {
        return this._renderTemplate(elseContent, data);
      }
    });
  }

  /**
   * Get a nested property from an object
   * @param {Object} obj - The object
   * @param {string} path - The property path
   * @returns {*} The property value
   * @private
   */
  _getNestedProperty(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Add a template
   * @param {string} name - The template name
   * @param {string} template - The template string
   */
  addTemplate(name, template) {
    this.templates[name] = template;
  }

  /**
   * Remove a template
   * @param {string} name - The template name
   * @returns {boolean} True if the template was removed
   */
  removeTemplate(name) {
    if (name === 'default') {
      return false;
    }
    
    if (this.templates[name]) {
      delete this.templates[name];
      return true;
    }
    
    return false;
  }

  /**
   * Get all template names
   * @returns {Array} Array of template names
   */
  getTemplateNames() {
    return Object.keys(this.templates);
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
 * Calculate the ability modifier for a score
 * @param {number} score - The ability score
 * @returns {number} The ability modifier
 */
export function calculateAbilityModifier(score) {
  return Math.floor((score - 10) / 2);
}

/**
 * Calculate the proficiency bonus for a level
 * @param {number} level - The character level
 * @returns {number} The proficiency bonus
 */
export function calculateProficiencyBonus(level) {
  return Math.ceil(level / 4) + 1;
}

/**
 * Calculate the experience points needed for a level
 * @param {number} level - The character level
 * @returns {number} The experience points needed
 */
export function calculateXPForLevel(level) {
  const xpThresholds = [
    0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
    85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000
  ];
  
  if (level < 1) return 0;
  if (level > 20) return xpThresholds[19];
  
  return xpThresholds[level - 1];
}

/**
 * Calculate the level from experience points
 * @param {number} xp - The experience points
 * @returns {number} The character level
 */
export function calculateLevelFromXP(xp) {
  const xpThresholds = [
    0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
    85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000
  ];
  
  for (let i = 19; i >= 0; i--) {
    if (xp >= xpThresholds[i]) {
      return i + 1;
    }
  }
  
  return 1;
}

/**
 * Get the ability score increase levels
 * @returns {Array} Array of levels that grant ability score increases
 */
export function getAbilityScoreIncreaseLevels() {
  return [4, 8, 12, 16, 19];
}

/**
 * Create a new player
 * @param {Object} data - Player data
 * @returns {Player} A new player instance
 */
export function createPlayer(data = {}) {
  return new Player(data);
}

/**
 * Create a new player database
 * @returns {PlayerDatabase} A new player database instance
 */
export function createPlayerDatabase() {
  return new PlayerDatabase();
}

/**
 * Create a new character sheet generator
 * @returns {CharacterSheetGenerator} A new character sheet generator instance
 */
export function createCharacterSheetGenerator() {
  return new CharacterSheetGenerator();
}

/**
 * Class for generating random characters
 */
export class CharacterGenerator {
  /**
   * Create a character generator
   * @param {Object} options - Generator options
   */
  constructor(options = {}) {
    this.options = {
      nameGenerator: options.nameGenerator || null,
      minLevel: options.minLevel || 1,
      maxLevel: options.maxLevel || 10,
      ...options
    };
  }

  /**
   * Generate a random character
   * @param {Object} params - Generation parameters
   * @returns {Player} The generated character
   */
  generateCharacter(params = {}) {
    const {
      level = this._getRandomLevel(),
      race = this._getRandomRace(),
      className = this._getRandomClass(),
      alignment = this._getRandomAlignment(),
      name = this._generateName(race),
      playerName = params.playerName || ''
    } = params;
    
    // Generate ability scores
    const abilities = this._generateAbilityScores(className);
    
    // Create the character
    const character = new Player({
      name,
      playerName,
      race,
      classes: [{ name: className, level }],
      alignment,
      abilities,
      maxHitPoints: this._calculateHitPoints(className, level, abilities.con),
      armorClass: this._calculateArmorClass(abilities.dex)
    });
    
    // Set proficiency bonus
    character.proficiencyBonus = calculateProficiencyBonus(level);
    
    // Add saving throw proficiencies
    this._addSavingThrowProficiencies(character, className);
    
    // Add skill proficiencies
    this._addSkillProficiencies(character, className);
    
    // Add class features
    this._addClassFeatures(character, className, level);
    
    // Add equipment
    this._addStartingEquipment(character, className);
    
    // Add spellcasting if applicable
    this._addSpellcasting(character, className, level);
    
    return character;
  }

  /**
   * Get a random level
   * @returns {number} A random level
   * @private
   */
  _getRandomLevel() {
    const min = this.options.minLevel;
    const max = this.options.maxLevel;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Get a random race
   * @returns {string} A random race
   * @private
   */
  _getRandomRace() {
    const races = Object.values(CharacterRace);
    // Exclude custom race
    const filteredRaces = races.filter(race => race !== CharacterRace.CUSTOM);
    return filteredRaces[Math.floor(Math.random() * filteredRaces.length)];
  }

  /**
   * Get a random class
   * @returns {string} A random class
   * @private
   */
  _getRandomClass() {
    const classes = Object.values(CharacterClass);
    // Exclude custom class
    const filteredClasses = classes.filter(cls => cls !== CharacterClass.CUSTOM);
    return filteredClasses[Math.floor(Math.random() * filteredClasses.length)];
  }

  /**
   * Get a random alignment
   * @returns {string} A random alignment
   * @private
   */
  _getRandomAlignment() {
    const alignments = [
      'Lawful Good',
      'Neutral Good',
      'Chaotic Good',
      'Lawful Neutral',
      'Neutral',
      'Chaotic Neutral',
      'Lawful Evil',
      'Neutral Evil',
      'Chaotic Evil'
    ];
    
    return alignments[Math.floor(Math.random() * alignments.length)];
  }

  /**
   * Generate a name for the character
   * @param {string} race - The character race
   * @returns {string} A generated name
   * @private
   */
  _generateName(race) {
    if (this.options.nameGenerator) {
      return this.options.nameGenerator.generateName({ race });
    }
    
    // Simple fallback name generation
    const prefixes = [
      'Ar', 'Bal', 'Bel', 'Cal', 'Cor', 'Dar', 'El', 'Fal', 'Gar', 'Hal',
      'Jor', 'Kal', 'Lor', 'Mal', 'Nor', 'Orin', 'Pax', 'Quin', 'Ral', 'Sal',
      'Tal', 'Ur', 'Val', 'Wil', 'Xan', 'Yor', 'Zan'
    ];
    
    const suffixes = [
      'adin', 'amar', 'aran', 'bard', 'don', 'eth', 'fin', 'gan', 'hal', 'ian',
      'jos', 'kan', 'lin', 'mor', 'net', 'ore', 'pian', 'qar', 'ros', 'sar',
      'thas', 'uel', 'vain', 'wen', 'xus', 'yor', 'zar'
    ];
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    return prefix + suffix;
  }

  /**
   * Generate ability scores
   * @param {string} className - The character class
   * @returns {Object} The generated ability scores
   * @private
   */
  _generateAbilityScores(className) {
    // Generate six scores using 4d6 drop lowest
    const scores = [];
    for (let i = 0; i < 6; i++) {
      const rolls = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ];
      
      // Drop the lowest roll
      rolls.sort((a, b) => a - b);
      rolls.shift();
      
      // Sum the remaining rolls
      scores.push(rolls.reduce((sum, roll) => sum + roll, 0));
    }
    
    // Sort scores in descending order
    scores.sort((a, b) => b - a);
    
    // Assign scores based on class priorities
    const classPriorities = {
      [CharacterClass.ARTIFICER]: [AbilityScore.INT, AbilityScore.CON, AbilityScore.DEX, AbilityScore.WIS, AbilityScore.CHA, AbilityScore.STR],
      [CharacterClass.BARBARIAN]: [AbilityScore.STR, AbilityScore.CON, AbilityScore.DEX, AbilityScore.WIS, AbilityScore.CHA, AbilityScore.INT],
      [CharacterClass.BARD]: [AbilityScore.CHA, AbilityScore.DEX, AbilityScore.CON, AbilityScore.INT, AbilityScore.WIS, AbilityScore.STR],
      [CharacterClass.CLERIC]: [AbilityScore.WIS, AbilityScore.CON, AbilityScore.STR, AbilityScore.DEX, AbilityScore.CHA, AbilityScore.INT],
      [CharacterClass.DRUID]: [AbilityScore.WIS, AbilityScore.CON, AbilityScore.DEX, AbilityScore.INT, AbilityScore.CHA, AbilityScore.STR],
      [CharacterClass.FIGHTER]: [AbilityScore.STR, AbilityScore.CON, AbilityScore.DEX, AbilityScore.WIS, AbilityScore.CHA, AbilityScore.INT],
      [CharacterClass.MONK]: [AbilityScore.DEX, AbilityScore.WIS, AbilityScore.CON, AbilityScore.STR, AbilityScore.INT, AbilityScore.CHA],
      [CharacterClass.PALADIN]: [AbilityScore.STR, AbilityScore.CHA, AbilityScore.CON, AbilityScore.WIS, AbilityScore.DEX, AbilityScore.INT],
      [CharacterClass.RANGER]: [AbilityScore.DEX, AbilityScore.WIS, AbilityScore.CON, AbilityScore.STR, AbilityScore.INT, AbilityScore.CHA],
      [CharacterClass.ROGUE]: [AbilityScore.DEX, AbilityScore.CON, AbilityScore.INT, AbilityScore.WIS, AbilityScore.CHA, AbilityScore.STR],
      [CharacterClass.SORCERER]: [AbilityScore.CHA, AbilityScore.CON, AbilityScore.DEX, AbilityScore.INT, AbilityScore.WIS, AbilityScore.STR],
      [CharacterClass.WARLOCK]: [AbilityScore.CHA, AbilityScore.CON, AbilityScore.DEX, AbilityScore.WIS, AbilityScore.INT, AbilityScore.STR],
      [CharacterClass.WIZARD]: [AbilityScore.INT, AbilityScore.CON, AbilityScore.DEX, AbilityScore.WIS, AbilityScore.CHA, AbilityScore.STR],
      [CharacterClass.BLOOD_HUNTER]: [AbilityScore.STR, AbilityScore.DEX, AbilityScore.CON, AbilityScore.INT, AbilityScore.WIS, AbilityScore.CHA],
      [CharacterClass.CUSTOM]: [AbilityScore.STR, AbilityScore.DEX, AbilityScore.CON, AbilityScore.INT, AbilityScore.WIS, AbilityScore.CHA]
    };
    
    const priorities = classPriorities[className] || classPriorities[CharacterClass.FIGHTER];
    
    // Assign scores based on priorities
    const abilities = {};
    for (let i = 0; i < priorities.length; i++) {
      abilities[priorities[i]] = scores[i];
    }
    
    return abilities;
  }

  /**
   * Calculate hit points
   * @param {string} className - The character class
   * @param {number} level - The character level
   * @param {number} conScore - The Constitution score
   * @returns {number} The calculated hit points
   * @private
   */
  _calculateHitPoints(className, level, conScore) {
    const conModifier = calculateAbilityModifier(conScore);
    
    // Get hit die size by class
    const hitDieByClass = {
      [CharacterClass.ARTIFICER]: 8,
      [CharacterClass.BARBARIAN]: 12,
      [CharacterClass.BARD]: 8,
      [CharacterClass.CLERIC]: 8,
      [CharacterClass.DRUID]: 8,
      [CharacterClass.FIGHTER]: 10,
      [CharacterClass.MONK]: 8,
      [CharacterClass.PALADIN]: 10,
      [CharacterClass.RANGER]: 10,
      [CharacterClass.ROGUE]: 8,
      [CharacterClass.SORCERER]: 6,
      [CharacterClass.WARLOCK]: 8,
      [CharacterClass.WIZARD]: 6,
      [CharacterClass.BLOOD_HUNTER]: 10,
      [CharacterClass.CUSTOM]: 8
    };
    
    const hitDie = hitDieByClass[className] || 8;
    
    // First level gets maximum hit die + CON modifier
    let hp = hitDie + conModifier;
    
    // Additional levels get average hit die + CON modifier
    if (level > 1) {
      const averageHitDie = Math.floor(hitDie / 2) + 1;
      hp += (averageHitDie + conModifier) * (level - 1);
    }
    
    return Math.max(1, hp);
  }

  /**
   * Calculate armor class
   * @param {number} dexScore - The Dexterity score
   * @returns {number} The calculated armor class
   * @private
   */
  _calculateArmorClass(dexScore) {
    const dexModifier = calculateAbilityModifier(dexScore);
    
    // Base AC is 10 + DEX modifier (unarmored)
    return 10 + dexModifier;
  }

  /**
   * Add saving throw proficiencies
   * @param {Player} character - The character
   * @param {string} className - The character class
   * @private
   */
  _addSavingThrowProficiencies(character, className) {
    const savingThrowsByClass = {
      [CharacterClass.ARTIFICER]: [AbilityScore.CON, AbilityScore.INT],
      [CharacterClass.BARBARIAN]: [AbilityScore.STR, AbilityScore.CON],
      [CharacterClass.BARD]: [AbilityScore.DEX, AbilityScore.CHA],
      [CharacterClass.CLERIC]: [AbilityScore.WIS, AbilityScore.CHA],
      [CharacterClass.DRUID]: [AbilityScore.INT, AbilityScore.WIS],
      [CharacterClass.FIGHTER]: [AbilityScore.STR, AbilityScore.CON],
      [CharacterClass.MONK]: [AbilityScore.STR, AbilityScore.DEX],
      [CharacterClass.PALADIN]: [AbilityScore.WIS, AbilityScore.CHA],
      [CharacterClass.RANGER]: [AbilityScore.STR, AbilityScore.DEX],
      [CharacterClass.ROGUE]: [AbilityScore.DEX, AbilityScore.INT],
      [CharacterClass.SORCERER]: [AbilityScore.CON, AbilityScore.CHA],
      [CharacterClass.WARLOCK]: [AbilityScore.WIS, AbilityScore.CHA],
      [CharacterClass.WIZARD]: [AbilityScore.INT, AbilityScore.WIS],
      [CharacterClass.BLOOD_HUNTER]: [AbilityScore.DEX, AbilityScore.INT],
      [CharacterClass.CUSTOM]: [AbilityScore.STR, AbilityScore.DEX]
    };
    
    const proficientSaves = savingThrowsByClass[className] || [AbilityScore.STR, AbilityScore.CON];
    
    proficientSaves.forEach(ability => {
      character.savingThrows[ability] = true;
    });
  }

  /**
   * Add skill proficiencies
   * @param {Player} character - The character
   * @param {string} className - The character class
   * @private
   */
  _addSkillProficiencies(character, className) {
    const skillsByClass = {
      [CharacterClass.ARTIFICER]: [
        [Skill.ARCANA, Skill.HISTORY, Skill.INVESTIGATION, Skill.MEDICINE, Skill.NATURE, Skill.PERCEPTION, Skill.SLEIGHT_OF_HAND],
        2
      ],
      [CharacterClass.BARBARIAN]: [
        [Skill.ANIMAL_HANDLING, Skill.ATHLETICS, Skill.INTIMIDATION, Skill.NATURE, Skill.PERCEPTION, Skill.SURVIVAL],
        2
      ],
      [CharacterClass.BARD]: [
        Object.values(Skill),
        3
      ],
      [CharacterClass.CLERIC]: [
        [Skill.HISTORY, Skill.INSIGHT, Skill.MEDICINE, Skill.PERSUASION, Skill.RELIGION],
        2
      ],
      [CharacterClass.DRUID]: [
        [Skill.ARCANA, Skill.ANIMAL_HANDLING, Skill.INSIGHT, Skill.MEDICINE, Skill.NATURE, Skill.PERCEPTION, Skill.RELIGION, Skill.SURVIVAL],
        2
      ],
      [CharacterClass.FIGHTER]: [
        [Skill.ACROBATICS, Skill.ANIMAL_HANDLING, Skill.ATHLETICS, Skill.HISTORY, Skill.INSIGHT, Skill.INTIMIDATION, Skill.PERCEPTION, Skill.SURVIVAL],
        2
      ],
      [CharacterClass.MONK]: [
        [Skill.ACROBATICS, Skill.ATHLETICS, Skill.HISTORY, Skill.INSIGHT, Skill.RELIGION, Skill.STEALTH],
        2
      ],
      [CharacterClass.PALADIN]: [
        [Skill.ATHLETICS, Skill.INSIGHT, Skill.INTIMIDATION, Skill.MEDICINE, Skill.PERSUASION, Skill.RELIGION],
        2
      ],
      [CharacterClass.RANGER]: [
        [Skill.ANIMAL_HANDLING, Skill.ATHLETICS, Skill.INSIGHT, Skill.INVESTIGATION, Skill.NATURE, Skill.PERCEPTION, Skill.STEALTH, Skill.SURVIVAL],
        3
      ],
      [CharacterClass.ROGUE]: [
        [Skill.ACROBATICS, Skill.ATHLETICS, Skill.DECEPTION, Skill.INSIGHT, Skill.INTIMIDATION, Skill.INVESTIGATION, Skill.PERCEPTION, Skill.PERFORMANCE, Skill.PERSUASION, Skill.SLEIGHT_OF_HAND, Skill.STEALTH],
        4
      ],
      [CharacterClass.SORCERER]: [
        [Skill.ARCANA, Skill.DECEPTION, Skill.INSIGHT, Skill.INTIMIDATION, Skill.PERSUASION, Skill.RELIGION],
        2
      ],
      [CharacterClass.WARLOCK]: [
        [Skill.ARCANA, Skill.DECEPTION, Skill.HISTORY, Skill.INTIMIDATION, Skill.INVESTIGATION, Skill.NATURE, Skill.RELIGION],
        2
      ],
      [CharacterClass.WIZARD]: [
        [Skill.ARCANA, Skill.HISTORY, Skill.INSIGHT, Skill.INVESTIGATION, Skill.MEDICINE, Skill.RELIGION],
        2
      ],
      [CharacterClass.BLOOD_HUNTER]: [
        [Skill.ACROBATICS, Skill.ARCANA, Skill.ATHLETICS, Skill.HISTORY, Skill.INSIGHT, Skill.INVESTIGATION, Skill.RELIGION, Skill.SURVIVAL],
        2
      ],
      [CharacterClass.CUSTOM]: [
        Object.values(Skill),
        2
      ]
    };
    
    const [availableSkills, count] = skillsByClass[className] || [Object.values(Skill), 2];
    
    // Randomly select skills
    const shuffledSkills = [...availableSkills].sort(() => 0.5 - Math.random());
    const selectedSkills = shuffledSkills.slice(0, count);
    
    selectedSkills.forEach(skill => {
      character.skills[skill] = 1; // Proficient
    });
  }

  /**
   * Add class features
   * @param {Player} character - The character
   * @param {string} className - The character class
   * @param {number} level - The character level
   * @private
   */
  _addClassFeatures(character, className, level) {
    const basicFeatures = {
      [CharacterClass.ARTIFICER]: [
        { name: 'Magical Tinkering', description: 'You can imbue mundane objects with minor magical effects.' },
        { name: 'Spellcasting', description: 'You can cast artificer spells using Intelligence as your spellcasting ability.' }
      ],
      [CharacterClass.BARBARIAN]: [
        { name: 'Rage', description: 'You can enter a rage as a bonus action, gaining advantages in combat.' },
        { name: 'Unarmored Defense', description: 'While not wearing armor, your AC equals 10 + DEX modifier + CON modifier.' }
      ],
      [CharacterClass.BARD]: [
        { name: 'Bardic Inspiration', description: 'You can inspire others through stirring words or music.' },
        { name: 'Spellcasting', description: 'You can cast bard spells using Charisma as your spellcasting ability.' }
      ],
      [CharacterClass.CLERIC]: [
        { name: 'Divine Domain', description: 'You choose a domain that grants you domain spells and other features.' },
        { name: 'Spellcasting', description: 'You can cast cleric spells using Wisdom as your spellcasting ability.' }
      ],
      [CharacterClass.DRUID]: [
        { name: 'Druidic', description: 'You know Druidic, the secret language of druids.' },
        { name: 'Spellcasting', description: 'You can cast druid spells using Wisdom as your spellcasting ability.' }
      ],
      [CharacterClass.FIGHTER]: [
        { name: 'Fighting Style', description: 'You adopt a particular style of fighting as your specialty.' },
        { name: 'Second Wind', description: 'You have a limited well of stamina that you can draw on to protect yourself from harm.' }
      ],
      [CharacterClass.MONK]: [
        { name: 'Unarmored Defense', description: 'While not wearing armor and not using a shield, your AC equals 10 + DEX modifier + WIS modifier.' },
        { name: 'Martial Arts', description: 'Your practice of martial arts gives you mastery of combat styles that use unarmed strikes and monk weapons.' }
      ],
      [CharacterClass.PALADIN]: [
        { name: 'Divine Sense', description: 'You can detect the presence of celestial, fiend, or undead creatures.' },
        { name: 'Lay on Hands', description: 'You have a pool of healing power that replenishes when you take a long rest.' }
      ],
      [CharacterClass.RANGER]: [
        { name: 'Favored Enemy', description: 'You have significant experience studying, tracking, hunting, and even talking to a certain type of enemy.' },
        { name: 'Natural Explorer', description: 'You are particularly familiar with one type of natural environment and are adept at traveling and surviving in such regions.' }
      ],
      [CharacterClass.ROGUE]: [
        { name: 'Expertise', description: 'You gain expertise in two of your skill proficiencies.' },
        { name: 'Sneak Attack', description: 'You know how to strike subtly and exploit a foe\'s distraction.' }
      ],
      [CharacterClass.SORCERER]: [
        { name: 'Sorcerous Origin', description: 'You choose a source of your innate magical power.' },
        { name: 'Spellcasting', description: 'You can cast sorcerer spells using Charisma as your spellcasting ability.' }
      ],
      [CharacterClass.WARLOCK]: [
        { name: 'Otherworldly Patron', description: 'You have struck a bargain with an otherworldly being.' },
        { name: 'Pact Magic', description: 'Your arcane research and the magic bestowed on you by your patron have given you facility with spells.' }
      ],
      [CharacterClass.WIZARD]: [
        { name: 'Arcane Recovery', description: 'You have learned to regain some of your magical energy by studying your spellbook.' },
        { name: 'Spellcasting', description: 'You can cast wizard spells using Intelligence as your spellcasting ability.' }
      ],
      [CharacterClass.BLOOD_HUNTER]: [
        { name: 'Hunter\'s Bane', description: 'You have survived the Hunter\'s Bane, a dangerous alchemical process that alters your life\'s blood.' },
        { name: 'Crimson Rite', description: 'You can imbue your weapon strikes with elemental energy.' }
      ],
      [CharacterClass.CUSTOM]: [
        { name: 'Custom Feature', description: 'A custom class feature.' }
      ]
    };
    
    // Add basic features
    const features = basicFeatures[className] || [];
    features.forEach(feature => {
      character.addFeature(feature);
    });
    
    // Add level-specific features
    if (level >= 2) {
      const level2Features = {
        [CharacterClass.BARBARIAN]: { name: 'Reckless Attack', description: 'You can throw aside all concern for defense to attack with fierce desperation.' },
        [CharacterClass.BARD]: { name: 'Jack of All Trades', description: 'You can add half your proficiency bonus to any ability check you make that doesn\'t already include your proficiency bonus.' },
        [CharacterClass.FIGHTER]: { name: 'Action Surge', description: 'You can push yourself beyond your normal limits for a moment.' },
        [CharacterClass.MONK]: { name: 'Ki', description: 'Your training allows you to harness the mystic energy of ki.' },
        [CharacterClass.PALADIN]: { name: 'Divine Smite', description: 'When you hit a creature with a melee weapon attack, you can expend one spell slot to deal radiant damage.' },
        [CharacterClass.RANGER]: { name: 'Spellcasting', description: 'You have learned to use the magical essence of nature to cast spells.' },
        [CharacterClass.ROGUE]: { name: 'Cunning Action', description: 'Your quick thinking and agility allow you to move and act quickly.' }
      };
      
      if (level2Features[className]) {
        character.addFeature(level2Features[className]);
      }
    }
    
    if (level >= 3) {
      const level3Features = {
        [CharacterClass.BARBARIAN]: { name: 'Primal Path', description: 'You choose a path that shapes the nature of your rage.' },
        [CharacterClass.BARD]: { name: 'Bard College', description: 'You delve into the advanced techniques of a bard college.' },
        [CharacterClass.FIGHTER]: { name: 'Martial Archetype', description: 'You choose an archetype that you strive to emulate in your combat styles and techniques.' },
        [CharacterClass.MONK]: { name: 'Monastic Tradition', description: 'You commit yourself to a monastic tradition.' },
        [CharacterClass.PALADIN]: { name: 'Sacred Oath', description: 'You swear the oath that binds you as a paladin forever.' },
        [CharacterClass.RANGER]: { name: 'Ranger Archetype', description: 'You choose an archetype that you strive to emulate.' },
        [CharacterClass.ROGUE]: { name: 'Roguish Archetype', description: 'You choose an archetype that you emulate in the exercise of your rogue abilities.' }
      };
      
      if (level3Features[className]) {
        character.addFeature(level3Features[className]);
      }
    }
  }

  /**
   * Add starting equipment
   * @param {Player} character - The character
   * @param {string} className - The character class
   * @private
   */
  _addStartingEquipment(character, className) {
    const basicEquipment = [
      { name: 'Backpack', quantity: 1 },
      { name: 'Bedroll', quantity: 1 },
      { name: 'Rations (1 day)', quantity: 5 },
      { name: 'Waterskin', quantity: 1 },
      { name: 'Rope, hempen (50 feet)', quantity: 1 }
    ];
    
    const classEquipment = {
      [CharacterClass.ARTIFICER]: [
        { name: 'Leather armor', quantity: 1 },
        { name: 'Thieves\' tools', quantity: 1 },
        { name: 'Tinker\'s tools', quantity: 1 },
        { name: 'Light crossbow', quantity: 1 },
        { name: 'Bolts', quantity: 20 }
      ],
      [CharacterClass.BARBARIAN]: [
        { name: 'Greataxe', quantity: 1 },
        { name: 'Handaxe', quantity: 2 },
        { name: 'Javelin', quantity: 4 },
        { name: 'Explorer\'s pack', quantity: 1 }
      ],
            [CharacterClass.BARD]: [
        { name: 'Rapier', quantity: 1 },
        { name: 'Lute', quantity: 1 },
        { name: 'Leather armor', quantity: 1 },
        { name: 'Dagger', quantity: 1 },
        { name: 'Diplomat\'s pack', quantity: 1 }
      ],
      [CharacterClass.CLERIC]: [
        { name: 'Mace', quantity: 1 },
        { name: 'Scale mail', quantity: 1 },
        { name: 'Light crossbow', quantity: 1 },
        { name: 'Bolts', quantity: 20 },
        { name: 'Shield', quantity: 1 },
        { name: 'Holy symbol', quantity: 1 }
      ],
      [CharacterClass.DRUID]: [
        { name: 'Leather armor', quantity: 1 },
        { name: 'Explorer\'s pack', quantity: 1 },
        { name: 'Shield', quantity: 1 },
        { name: 'Scimitar', quantity: 1 },
        { name: 'Druidic focus', quantity: 1 }
      ],
      [CharacterClass.FIGHTER]: [
        { name: 'Chain mail', quantity: 1 },
        { name: 'Longsword', quantity: 1 },
        { name: 'Shield', quantity: 1 },
        { name: 'Light crossbow', quantity: 1 },
        { name: 'Bolts', quantity: 20 }
      ],
      [CharacterClass.MONK]: [
        { name: 'Shortsword', quantity: 1 },
        { name: 'Dart', quantity: 10 },
        { name: 'Explorer\'s pack', quantity: 1 }
      ],
      [CharacterClass.PALADIN]: [
        { name: 'Chain mail', quantity: 1 },
        { name: 'Longsword', quantity: 1 },
        { name: 'Shield', quantity: 1 },
        { name: 'Javelin', quantity: 5 },
        { name: 'Holy symbol', quantity: 1 }
      ],
      [CharacterClass.RANGER]: [
        { name: 'Scale mail', quantity: 1 },
        { name: 'Shortsword', quantity: 2 },
        { name: 'Longbow', quantity: 1 },
        { name: 'Arrows', quantity: 20 },
        { name: 'Explorer\'s pack', quantity: 1 }
      ],
      [CharacterClass.ROGUE]: [
        { name: 'Shortsword', quantity: 1 },
        { name: 'Shortbow', quantity: 1 },
        { name: 'Arrows', quantity: 20 },
        { name: 'Leather armor', quantity: 1 },
        { name: 'Thieves\' tools', quantity: 1 },
        { name: 'Burglar\'s pack', quantity: 1 }
      ],
      [CharacterClass.SORCERER]: [
        { name: 'Light crossbow', quantity: 1 },
        { name: 'Bolts', quantity: 20 },
        { name: 'Arcane focus', quantity: 1 },
        { name: 'Dagger', quantity: 2 },
        { name: 'Explorer\'s pack', quantity: 1 }
      ],
      [CharacterClass.WARLOCK]: [
        { name: 'Light crossbow', quantity: 1 },
        { name: 'Bolts', quantity: 20 },
        { name: 'Arcane focus', quantity: 1 },
        { name: 'Dagger', quantity: 2 },
        { name: 'Leather armor', quantity: 1 },
        { name: 'Scholar\'s pack', quantity: 1 }
      ],
      [CharacterClass.WIZARD]: [
        { name: 'Quarterstaff', quantity: 1 },
        { name: 'Arcane focus', quantity: 1 },
        { name: 'Spellbook', quantity: 1 },
        { name: 'Scholar\'s pack', quantity: 1 }
      ],
      [CharacterClass.BLOOD_HUNTER]: [
        { name: 'Longsword', quantity: 1 },
        { name: 'Light crossbow', quantity: 1 },
        { name: 'Bolts', quantity: 20 },
        { name: 'Leather armor', quantity: 1 },
        { name: 'Explorer\'s pack', quantity: 1 }
      ],
      [CharacterClass.CUSTOM]: [
        { name: 'Dagger', quantity: 1 },
        { name: 'Leather armor', quantity: 1 }
      ]
    };
    
    // Add basic equipment
    basicEquipment.forEach(item => {
      character.addEquipment(item);
    });
    
    // Add class-specific equipment
    const equipment = classEquipment[className] || [];
    equipment.forEach(item => {
      character.addEquipment(item);
    });
    
    // Add gold
    const goldByClass = {
      [CharacterClass.ARTIFICER]: 5,
      [CharacterClass.BARBARIAN]: 2,
      [CharacterClass.BARD]: 5,
      [CharacterClass.CLERIC]: 5,
      [CharacterClass.DRUID]: 2,
      [CharacterClass.FIGHTER]: 5,
      [CharacterClass.MONK]: 5,
      [CharacterClass.PALADIN]: 5,
      [CharacterClass.RANGER]: 5,
      [CharacterClass.ROGUE]: 4,
      [CharacterClass.SORCERER]: 3,
      [CharacterClass.WARLOCK]: 4,
      [CharacterClass.WIZARD]: 4,
      [CharacterClass.BLOOD_HUNTER]: 4,
      [CharacterClass.CUSTOM]: 3
    };
    
    const gold = goldByClass[className] || 3;
    character.addEquipment({ name: 'Gold pieces', quantity: gold * 10 });
  }

  /**
   * Add spellcasting to the character
   * @param {Player} character - The character
   * @param {string} className - The character class
   * @param {number} level - The character level
   * @private
   */
  _addSpellcasting(character, className, level) {
    const spellcastingClasses = [
      CharacterClass.ARTIFICER,
      CharacterClass.BARD,
      CharacterClass.CLERIC,
      CharacterClass.DRUID,
      CharacterClass.PALADIN,
      CharacterClass.RANGER,
      CharacterClass.SORCERER,
      CharacterClass.WARLOCK,
      CharacterClass.WIZARD
    ];
    
    if (!spellcastingClasses.includes(className)) {
      return;
    }
    
    // Determine spellcasting ability
    const spellcastingAbility = {
      [CharacterClass.ARTIFICER]: AbilityScore.INT,
      [CharacterClass.BARD]: AbilityScore.CHA,
      [CharacterClass.CLERIC]: AbilityScore.WIS,
      [CharacterClass.DRUID]: AbilityScore.WIS,
      [CharacterClass.PALADIN]: AbilityScore.CHA,
      [CharacterClass.RANGER]: AbilityScore.WIS,
      [CharacterClass.SORCERER]: AbilityScore.CHA,
      [CharacterClass.WARLOCK]: AbilityScore.CHA,
      [CharacterClass.WIZARD]: AbilityScore.INT
    }[className];
    
    // Initialize spellcasting
    character.spellcasting = {
      ability: spellcastingAbility,
      spells: {
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
      },
      slots: {
        level1: { max: 0, used: 0 },
        level2: { max: 0, used: 0 },
        level3: { max: 0, used: 0 },
        level4: { max: 0, used: 0 },
        level5: { max: 0, used: 0 },
        level6: { max: 0, used: 0 },
        level7: { max: 0, used: 0 },
        level8: { max: 0, used: 0 },
        level9: { max: 0, used: 0 }
      }
    };
    
    // Set spell slots based on class and level
    this._setSpellSlots(character, className, level);
    
    // Add some basic spells
    this._addBasicSpells(character, className, level);
  }

  /**
   * Set spell slots based on class and level
   * @param {Player} character - The character
   * @param {string} className - The character class
   * @param {number} level - The character level
   * @private
   */
  _setSpellSlots(character, className, level) {
    // Full casters: Bard, Cleric, Druid, Sorcerer, Wizard
    const fullCasters = [
      CharacterClass.BARD,
      CharacterClass.CLERIC,
      CharacterClass.DRUID,
      CharacterClass.SORCERER,
      CharacterClass.WIZARD
    ];
    
    // Half casters: Artificer, Paladin, Ranger
    const halfCasters = [
      CharacterClass.ARTIFICER,
      CharacterClass.PALADIN,
      CharacterClass.RANGER
    ];
    
    // Special case: Warlock
    const isWarlock = className === CharacterClass.WARLOCK;
    
    if (fullCasters.includes(className)) {
      // Full caster spell slots
      if (level >= 1) {
        character.spellcasting.slots.level1.max = level >= 1 ? (level === 1 ? 2 : level >= 3 ? 4 : 3) : 0;
      }
      if (level >= 3) {
        character.spellcasting.slots.level2.max = level >= 3 ? (level >= 5 ? 3 : 2) : 0;
      }
      if (level >= 5) {
        character.spellcasting.slots.level3.max = level >= 5 ? (level >= 7 ? 3 : 2) : 0;
      }
      if (level >= 7) {
        character.spellcasting.slots.level4.max = level >= 7 ? (level >= 9 ? 3 : 1) : 0;
      }
      if (level >= 9) {
        character.spellcasting.slots.level5.max = level >= 9 ? (level >= 18 ? 3 : level >= 10 ? 2 : 1) : 0;
      }
      if (level >= 11) {
        character.spellcasting.slots.level6.max = level >= 11 ? (level >= 19 ? 2 : 1) : 0;
      }
      if (level >= 13) {
        character.spellcasting.slots.level7.max = level >= 13 ? (level >= 20 ? 2 : 1) : 0;
      }
      if (level >= 15) {
        character.spellcasting.slots.level8.max = level >= 15 ? 1 : 0;
      }
      if (level >= 17) {
        character.spellcasting.slots.level9.max = level >= 17 ? 1 : 0;
      }
    } else if (halfCasters.includes(className)) {
      // Half caster spell slots (round up for Artificer)
      const effectiveLevel = className === CharacterClass.ARTIFICER ? 
        Math.ceil(level / 2) : Math.floor(level / 2);
      
      if (level >= 2) {
        character.spellcasting.slots.level1.max = effectiveLevel >= 1 ? (effectiveLevel >= 3 ? 4 : effectiveLevel >= 2 ? 3 : 2) : 0;
      }
      if (level >= 5) {
        character.spellcasting.slots.level2.max = effectiveLevel >= 3 ? (effectiveLevel >= 5 ? 3 : 2) : 0;
      }
      if (level >= 9) {
        character.spellcasting.slots.level3.max = effectiveLevel >= 5 ? (effectiveLevel >= 7 ? 3 : 2) : 0;
      }
      if (level >= 13) {
        character.spellcasting.slots.level4.max = effectiveLevel >= 7 ? (effectiveLevel >= 9 ? 3 : 1) : 0;
      }
      if (level >= 17) {
        character.spellcasting.slots.level5.max = effectiveLevel >= 9 ? 2 : 0;
      }
    } else if (isWarlock) {
      // Warlock spell slots
      const pactMagicSlots = {
        1: { count: 1, level: 1 },
        2: { count: 2, level: 1 },
        3: { count: 2, level: 2 },
        4: { count: 2, level: 2 },
        5: { count: 2, level: 3 },
        6: { count: 2, level: 3 },
        7: { count: 2, level: 4 },
        8: { count: 2, level: 4 },
        9: { count: 2, level: 5 },
        10: { count: 2, level: 5 },
        11: { count: 3, level: 5 },
        12: { count: 3, level: 5 },
        13: { count: 3, level: 5 },
        14: { count: 3, level: 5 },
        15: { count: 3, level: 5 },
        16: { count: 3, level: 5 },
        17: { count: 4, level: 5 },
        18: { count: 4, level: 5 },
        19: { count: 4, level: 5 },
        20: { count: 4, level: 5 }
      };
      
      const pactMagic = pactMagicSlots[level] || { count: 0, level: 0 };
      
      if (pactMagic.level > 0) {
        const slotKey = `level${pactMagic.level}`;
        character.spellcasting.slots[slotKey].max = pactMagic.count;
      }
    }
  }

  /**
   * Add basic spells to the character
   * @param {Player} character - The character
   * @param {string} className - The character class
   * @param {number} level - The character level
   * @private
   */
  _addBasicSpells(character, className, level) {
    // Basic cantrips by class
    const cantrips = {
      [CharacterClass.ARTIFICER]: [
        { name: 'Mending', description: 'This spell repairs a single break or tear in an object.' },
        { name: 'Light', description: 'You touch one object that is no larger than 10 feet in any dimension. Until the spell ends, the object sheds bright light.' }
      ],
      [CharacterClass.BARD]: [
        { name: 'Vicious Mockery', description: 'You unleash a string of insults laced with subtle enchantments at a creature you can see within range.' },
        { name: 'Minor Illusion', description: 'You create a sound or an image of an object within range that lasts for the duration.' }
      ],
      [CharacterClass.CLERIC]: [
        { name: 'Sacred Flame', description: 'Flame-like radiance descends on a creature that you can see within range.' },
        { name: 'Guidance', description: 'You touch one willing creature. Once before the spell ends, the target can roll a d4 and add the number rolled to one ability check of its choice.' }
      ],
      [CharacterClass.DRUID]: [
        { name: 'Druidcraft', description: 'Whispering to the spirits of nature, you create one of the following effects within range.' },
        { name: 'Produce Flame', description: 'A flickering flame appears in your hand. The flame remains there for the duration and harms neither you nor your equipment.' }
      ],
      [CharacterClass.PALADIN]: [],
      [CharacterClass.RANGER]: [],
      [CharacterClass.SORCERER]: [
        { name: 'Fire Bolt', description: 'You hurl a mote of fire at a creature or object within range.' },
        { name: 'Prestidigitation', description: 'This spell is a minor magical trick that novice spellcasters use for practice.' }
      ],
      [CharacterClass.WARLOCK]: [
        { name: 'Eldritch Blast', description: 'A beam of crackling energy streaks toward a creature within range.' },
        { name: 'Minor Illusion', description: 'You create a sound or an image of an object within range that lasts for the duration.' }
      ],
      [CharacterClass.WIZARD]: [
        { name: 'Mage Hand', description: 'A spectral, floating hand appears at a point you choose within range.' },
        { name: 'Fire Bolt', description: 'You hurl a mote of fire at a creature or object within range.' }
      ]
    };
    
    // Basic 1st level spells by class
    const level1Spells = {
      [CharacterClass.ARTIFICER]: [
        { name: 'Cure Wounds', description: 'A creature you touch regains a number of hit points equal to 1d8 + your spellcasting ability modifier.' },
        { name: 'Identify', description: 'You choose one object that you must touch throughout the casting of the spell.' }
      ],
      [CharacterClass.BARD]: [
        { name: 'Healing Word', description: 'A creature of your choice that you can see within range regains hit points equal to 1d4 + your spellcasting ability modifier.' },
        { name: 'Charm Person', description: 'You attempt to charm a humanoid you can see within range.' }
      ],
      [CharacterClass.CLERIC]: [
        { name: 'Cure Wounds', description: 'A creature you touch regains a number of hit points equal to 1d8 + your spellcasting ability modifier.' },
        { name: 'Bless', description: 'You bless up to three creatures of your choice within range.' }
      ],
      [CharacterClass.DRUID]: [
        { name: 'Entangle', description: 'Grasping weeds and vines sprout from the ground in a 20-foot square.' },
        { name: 'Healing Word', description: 'A creature of your choice that you can see within range regains hit points equal to 1d4 + your spellcasting ability modifier.' }
      ],
      [CharacterClass.PALADIN]: [
        { name: 'Cure Wounds', description: 'A creature you touch regains a number of hit points equal to 1d8 + your spellcasting ability modifier.' },
        { name: 'Divine Favor', description: 'Your prayer empowers you with divine radiance. Until the spell ends, your weapon attacks deal an extra 1d4 radiant damage on a hit.' }
      ],
      [CharacterClass.RANGER]: [
        { name: 'Hunter\'s Mark', description: 'You choose a creature you can see within range and mystically mark it as your quarry.' },
        { name: 'Cure Wounds', description: 'A creature you touch regains a number of hit points equal to 1d8 + your spellcasting ability modifier.' }
      ],
      [CharacterClass.SORCERER]: [
        { name: 'Magic Missile', description: 'You create three glowing darts of magical force.' },
        { name: 'Shield', description: 'An invisible barrier of magical force appears and protects you.' }
      ],
      [CharacterClass.WARLOCK]: [
        { name: 'Hex', description: 'You place a curse on a creature that you can see within range.' },
        { name: 'Charm Person', description: 'You attempt to charm a humanoid you can see within range.' }
      ],
      [CharacterClass.WIZARD]: [
        { name: 'Magic Missile', description: 'You create three glowing darts of magical force.' },
        { name: 'Shield', description: 'An invisible barrier of magical force appears and protects you.' }
      ]
    };
    
    // Add cantrips
    const classCantrips = cantrips[className] || [];
    classCantrips.forEach(spell => {
      character.addSpell(spell, 0);
    });
    
    // Add 1st level spells if the character has spell slots
    if (character.spellcasting.slots.level1.max > 0) {
      const classSpells = level1Spells[className] || [];
      classSpells.forEach(spell => {
        character.addSpell(spell, 1);
      });
    }
    
    // Add higher level spells based on character level
    if (level >= 3 && character.spellcasting.slots.level2.max > 0) {
      const level2Spell = { name: 'Invisibility', description: 'A creature you touch becomes invisible until the spell ends.' };
      character.addSpell(level2Spell, 2);
    }
    
    if (level >= 5 && character.spellcasting.slots.level3.max > 0) {
      const level3Spell = { name: 'Fireball', description: 'A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame.' };
      character.addSpell(level3Spell, 3);
    }
  }
}

/**
 * Create a new character generator
 * @param {Object} options - Generator options
 * @returns {CharacterGenerator} A new character generator instance
 */
export function createCharacterGenerator(options = {}) {
  return new CharacterGenerator(options);
}

// Export the main player functions
export default {
  createPlayer,
  createPlayerDatabase,
  createCharacterSheetGenerator,
  createCharacterGenerator,
  calculateAbilityModifier,
  calculateProficiencyBonus,
  calculateXPForLevel,
  calculateLevelFromXP,
  getAbilityScoreIncreaseLevels,
  CharacterClass,
  CharacterRace,
  AbilityScore,
  Skill,
  SkillAbilities,
  ConditionType
};
