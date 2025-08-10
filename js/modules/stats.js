/**
 * Jesster's Combat Tracker
 * Stats Module
 * Version 2.3.1
 * 
 * This module handles statistics tracking, dice rolling, and probability calculations.
 */

/**
 * Dice types
 */
export const DiceType = {
  D4: 'd4',
  D6: 'd6',
  D8: 'd8',
  D10: 'd10',
  D12: 'd12',
  D20: 'd20',
  D100: 'd100'
};

/**
 * Roll types
 */
export const RollType = {
  NORMAL: 'normal',
  ADVANTAGE: 'advantage',
  DISADVANTAGE: 'disadvantage',
  CRITICAL: 'critical',
  CRITICAL_FAIL: 'criticalFail'
};

/**
 * Stat types
 */
export const StatType = {
  DAMAGE_DEALT: 'damageDealt',
  DAMAGE_TAKEN: 'damageTaken',
  HEALING_DONE: 'healingDone',
  HEALING_RECEIVED: 'healingReceived',
  ATTACKS_MADE: 'attacksMade',
  ATTACKS_HIT: 'attacksHit',
  CRITICAL_HITS: 'criticalHits',
  CRITICAL_FAILS: 'criticalFails',
  KILLS: 'kills',
  DEATHS: 'deaths',
  SPELLS_CAST: 'spellsCast',
  SAVING_THROWS: 'savingThrows',
  SAVING_THROWS_SUCCEEDED: 'savingThrowsSucceeded',
  ROUNDS_ACTIVE: 'roundsActive',
  CONDITIONS_APPLIED: 'conditionsApplied',
  CUSTOM: 'custom'
};

/**
 * Class for rolling dice
 */
export class DiceRoller {
  /**
   * Create a dice roller
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      randomFunction: options.randomFunction || Math.random,
      recordRolls: options.recordRolls !== undefined ? options.recordRolls : true,
      maxRollHistory: options.maxRollHistory || 100,
      ...options
    };
    
    this.rollHistory = [];
    this.listeners = [];
  }

  /**
   * Roll a die
   * @param {number|string} die - The die size (e.g., 20 or 'd20')
   * @returns {number} The roll result
   */
  roll(die) {
    // Parse die size
    const dieSize = this._parseDieSize(die);
    
    // Roll the die
    const result = Math.floor(this.options.randomFunction() * dieSize) + 1;
    
    // Record the roll
    if (this.options.recordRolls) {
      this._recordRoll({ die: dieSize, result });
    }
    
    return result;
  }

  /**
   * Roll multiple dice
   * @param {number} count - The number of dice to roll
   * @param {number|string} die - The die size (e.g., 20 or 'd20')
   * @returns {Object} The roll results
   */
  rollMultiple(count, die) {
    // Parse die size
    const dieSize = this._parseDieSize(die);
    
    // Roll the dice
    const rolls = [];
    let total = 0;
    
    for (let i = 0; i < count; i++) {
      const result = Math.floor(this.options.randomFunction() * dieSize) + 1;
      rolls.push(result);
      total += result;
    }
    
    // Record the roll
    if (this.options.recordRolls) {
      this._recordRoll({ die: dieSize, count, rolls, total });
    }
    
    return { rolls, total };
  }

  /**
   * Roll a die with advantage (roll twice, take the higher result)
   * @param {number|string} die - The die size (e.g., 20 or 'd20')
   * @returns {Object} The roll results
   */
  rollWithAdvantage(die) {
    // Parse die size
    const dieSize = this._parseDieSize(die);
    
    // Roll the die twice
    const roll1 = Math.floor(this.options.randomFunction() * dieSize) + 1;
    const roll2 = Math.floor(this.options.randomFunction() * dieSize) + 1;
    
    // Determine the result
    const result = Math.max(roll1, roll2);
    
    // Record the roll
    if (this.options.recordRolls) {
      this._recordRoll({
        die: dieSize,
        rolls: [roll1, roll2],
        result,
        type: RollType.ADVANTAGE
      });
    }
    
    return {
      rolls: [roll1, roll2],
      result,
      type: RollType.ADVANTAGE
    };
  }

  /**
   * Roll a die with disadvantage (roll twice, take the lower result)
   * @param {number|string} die - The die size (e.g., 20 or 'd20')
   * @returns {Object} The roll results
   */
  rollWithDisadvantage(die) {
    // Parse die size
    const dieSize = this._parseDieSize(die);
    
    // Roll the die twice
    const roll1 = Math.floor(this.options.randomFunction() * dieSize) + 1;
    const roll2 = Math.floor(this.options.randomFunction() * dieSize) + 1;
    
    // Determine the result
    const result = Math.min(roll1, roll2);
    
    // Record the roll
    if (this.options.recordRolls) {
      this._recordRoll({
        die: dieSize,
        rolls: [roll1, roll2],
        result,
        type: RollType.DISADVANTAGE
      });
    }
    
    return {
      rolls: [roll1, roll2],
      result,
      type: RollType.DISADVANTAGE
    };
  }

  /**
   * Roll dice based on a formula (e.g., '2d6+3')
   * @param {string} formula - The dice formula
   * @returns {Object} The roll results
   */
  rollFormula(formula) {
    // Parse the formula
    const { diceCount, dieSize, modifier, modifierValue } = this._parseFormula(formula);
    
    // Roll the dice
    const rolls = [];
    let total = 0;
    
    for (let i = 0; i < diceCount; i++) {
      const result = Math.floor(this.options.randomFunction() * dieSize) + 1;
      rolls.push(result);
      total += result;
    }
    
    // Apply the modifier
    if (modifier === '+') {
      total += modifierValue;
    } else if (modifier === '-') {
      total -= modifierValue;
    }
    
    // Record the roll
    if (this.options.recordRolls) {
      this._recordRoll({
        formula,
        diceCount,
        dieSize,
        rolls,
        modifier,
        modifierValue,
        total
      });
    }
    
    return {
      formula,
      diceCount,
      dieSize,
      rolls,
      modifier,
      modifierValue,
      total
    };
  }

  /**
   * Roll an attack
   * @param {Object} options - Attack options
   * @returns {Object} The attack roll results
   */
  rollAttack(options = {}) {
    const {
      advantage = false,
      disadvantage = false,
      criticalRange = 20,
      criticalFailRange = 1,
      modifier = 0,
      die = 20
    } = options;
    
    // Parse die size
    const dieSize = this._parseDieSize(die);
    
    // Determine roll type
    let rollType = RollType.NORMAL;
    let rolls = [];
    let result = 0;
    
    if (advantage && !disadvantage) {
      rollType = RollType.ADVANTAGE;
      const roll1 = Math.floor(this.options.randomFunction() * dieSize) + 1;
      const roll2 = Math.floor(this.options.randomFunction() * dieSize) + 1;
      rolls = [roll1, roll2];
      result = Math.max(roll1, roll2);
    } else if (disadvantage && !advantage) {
      rollType = RollType.DISADVANTAGE;
      const roll1 = Math.floor(this.options.randomFunction() * dieSize) + 1;
      const roll2 = Math.floor(this.options.randomFunction() * dieSize) + 1;
      rolls = [roll1, roll2];
      result = Math.min(roll1, roll2);
    } else {
      rollType = RollType.NORMAL;
      result = Math.floor(this.options.randomFunction() * dieSize) + 1;
      rolls = [result];
    }
    
    // Check for critical hit or fail
    let isCriticalHit = false;
    let isCriticalFail = false;
    
    if (result >= criticalRange) {
      isCriticalHit = true;
      rollType = RollType.CRITICAL;
    } else if (result <= criticalFailRange) {
      isCriticalFail = true;
      rollType = RollType.CRITICAL_FAIL;
    }
    
    // Apply modifier
    const total = result + modifier;
    
    // Record the roll
    if (this.options.recordRolls) {
      this._recordRoll({
        die: dieSize,
        rolls,
        result,
        modifier,
        total,
        type: rollType,
        isCriticalHit,
        isCriticalFail
      });
    }
    
    return {
      rolls,
      result,
      modifier,
      total,
      type: rollType,
      isCriticalHit,
      isCriticalFail
    };
  }

  /**
   * Roll damage
   * @param {Object} options - Damage options
   * @returns {Object} The damage roll results
   */
  rollDamage(options = {}) {
    const {
      formula,
      critical = false,
      criticalMultiplier = 2,
      criticalBonusDice = 0,
      damageType = null
    } = options;
    
    // Parse the formula
    const { diceCount, dieSize, modifier, modifierValue } = this._parseFormula(formula);
    
    // Calculate dice count based on critical hit
    let effectiveDiceCount = diceCount;
    if (critical) {
      effectiveDiceCount = diceCount * criticalMultiplier + criticalBonusDice;
    }
    
    // Roll the dice
    const rolls = [];
    let diceTotal = 0;
    
    for (let i = 0; i < effectiveDiceCount; i++) {
      const result = Math.floor(this.options.randomFunction() * dieSize) + 1;
      rolls.push(result);
      diceTotal += result;
    }
    
    // Apply the modifier (only once, not multiplied on critical)
    let total = diceTotal;
    if (modifier === '+') {
      total += modifierValue;
    } else if (modifier === '-') {
      total -= modifierValue;
    }
    
    // Record the roll
    if (this.options.recordRolls) {
      this._recordRoll({
        formula,
        diceCount: effectiveDiceCount,
        dieSize,
        rolls,
        diceTotal,
        modifier,
        modifierValue,
        total,
        critical,
        damageType
      });
    }
    
    return {
      formula,
      diceCount: effectiveDiceCount,
      dieSize,
      rolls,
      diceTotal,
      modifier,
      modifierValue,
      total,
      critical,
      damageType
    };
  }

  /**
   * Roll a saving throw
   * @param {Object} options - Saving throw options
   * @returns {Object} The saving throw results
   */
  rollSavingThrow(options = {}) {
    const {
      dc = 10,
      modifier = 0,
      advantage = false,
      disadvantage = false,
      ability = null
    } = options;
    
    // Roll the d20
    let rollType = RollType.NORMAL;
    let rolls = [];
    let result = 0;
    
    if (advantage && !disadvantage) {
      rollType = RollType.ADVANTAGE;
      const roll1 = Math.floor(this.options.randomFunction() * 20) + 1;
      const roll2 = Math.floor(this.options.randomFunction() * 20) + 1;
      rolls = [roll1, roll2];
      result = Math.max(roll1, roll2);
    } else if (disadvantage && !advantage) {
      rollType = RollType.DISADVANTAGE;
      const roll1 = Math.floor(this.options.randomFunction() * 20) + 1;
      const roll2 = Math.floor(this.options.randomFunction() * 20) + 1;
      rolls = [roll1, roll2];
      result = Math.min(roll1, roll2);
    } else {
      rollType = RollType.NORMAL;
      result = Math.floor(this.options.randomFunction() * 20) + 1;
      rolls = [result];
    }
    
    // Apply modifier
    const total = result + modifier;
    
    // Check if the save succeeds
    const success = total >= dc;
    
    // Record the roll
    if (this.options.recordRolls) {
      this._recordRoll({
        die: 20,
        rolls,
        result,
        modifier,
        total,
        dc,
        success,
        type: rollType,
        ability
      });
    }
    
    return {
      rolls,
      result,
      modifier,
      total,
      dc,
      success,
      type: rollType,
      ability
    };
  }

  /**
   * Get the roll history
   * @returns {Array} The roll history
   */
  getRollHistory() {
    return [...this.rollHistory];
  }

  /**
   * Clear the roll history
   */
  clearRollHistory() {
    this.rollHistory = [];
    this._notifyListeners('historyCleared', {});
  }

  /**
   * Add a listener for dice roller events
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
   * Record a roll in the history
   * @param {Object} roll - The roll to record
   * @private
   */
  _recordRoll(roll) {
    // Add timestamp
    const rollWithTimestamp = {
      ...roll,
      timestamp: Date.now()
    };
    
    // Add to history
    this.rollHistory.unshift(rollWithTimestamp);
    
    // Limit history size
    if (this.rollHistory.length > this.options.maxRollHistory) {
      this.rollHistory.pop();
    }
    
    // Notify listeners
    this._notifyListeners('roll', rollWithTimestamp);
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
        console.error('Error in dice roller listener:', error);
      }
    });
  }

  /**
   * Parse a die size
   * @param {number|string} die - The die size (e.g., 20 or 'd20')
   * @returns {number} The die size as a number
   * @private
   */
  _parseDieSize(die) {
    if (typeof die === 'number') {
      return die;
    }
    
    if (typeof die === 'string') {
      const match = die.match(/d(\d+)/i);
      if (match) {
        return parseInt(match[1], 10);
      }
    }
    
    return 6; // Default to d6
  }

  /**
   * Parse a dice formula
   * @param {string} formula - The dice formula (e.g., '2d6+3')
   * @returns {Object} The parsed formula
   * @private
   */
  _parseFormula(formula) {
    // Default values
    let diceCount = 1;
    let dieSize = 6;
    let modifier = '';
    let modifierValue = 0;
    
    // Parse the formula
    const match = formula.match(/(\d+)?d(\d+)(?:([-+])(\d+))?/i);
    
    if (match) {
      if (match[1]) {
        diceCount = parseInt(match[1], 10);
      }
      
      dieSize = parseInt(match[2], 10);
      
      if (match[3] && match[4]) {
        modifier = match[3];
        modifierValue = parseInt(match[4], 10);
      }
    }
    
    return { diceCount, dieSize, modifier, modifierValue };
  }
}

/**
 * Class for tracking statistics
 */
export class StatTracker {
  /**
   * Create a stat tracker
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      trackHistory: options.trackHistory !== undefined ? options.trackHistory : true,
      maxHistoryEntries: options.maxHistoryEntries || 1000,
      ...options
    };
    
    this.stats = new Map();
    this.history = [];
    this.listeners = [];
    
    // Initialize default stats
    this._initializeDefaultStats();
  }

  /**
   * Initialize default stats
   * @private
   */
  _initializeDefaultStats() {
    Object.values(StatType).forEach(type => {
      this.stats.set(type, {
        total: 0,
        count: 0,
        average: 0,
        min: null,
        max: null
      });
    });
  }

  /**
   * Record a stat
   * @param {string} type - The stat type
   * @param {number} value - The stat value
   * @param {Object} metadata - Additional metadata
   * @returns {Object} The updated stat
   */
  recordStat(type, value, metadata = {}) {
    // Get or create the stat
    let stat = this.stats.get(type);
    
    if (!stat) {
      stat = {
        total: 0,
        count: 0,
        average: 0,
        min: null,
        max: null
      };
      this.stats.set(type, stat);
    }
    
    // Update the stat
    stat.total += value;
    stat.count++;
    stat.average = stat.total / stat.count;
    
    if (stat.min === null || value < stat.min) {
      stat.min = value;
    }
    
    if (stat.max === null || value > stat.max) {
      stat.max = value;
    }
    
    // Record in history
    if (this.options.trackHistory) {
      const entry = {
        type,
        value,
        timestamp: Date.now(),
        ...metadata
      };
      
      this.history.unshift(entry);
      
      // Limit history size
      if (this.history.length > this.options.maxHistoryEntries) {
        this.history.pop();
      }
    }
    
    // Notify listeners
    this._notifyListeners('statRecorded', { type, value, stat, metadata });
    
    return stat;
  }

  /**
   * Get a stat
   * @param {string} type - The stat type
   * @returns {Object|null} The stat or null if not found
   */
  getStat(type) {
    return this.stats.get(type) || null;
  }

  /**
   * Get all stats
   * @returns {Object} All stats
   */
  getAllStats() {
    const allStats = {};
    
    for (const [type, stat] of this.stats.entries()) {
      allStats[type] = { ...stat };
    }
    
    return allStats;
  }

  /**
   * Get stat history
   * @param {string} type - The stat type (all types if not specified)
   * @returns {Array} The stat history
   */
  getHistory(type = null) {
    if (type) {
      return this.history.filter(entry => entry.type === type);
    }
    
    return [...this.history];
  }

  /**
   * Reset a stat
   * @param {string} type - The stat type
   */
  resetStat(type) {
    this.stats.set(type, {
      total: 0,
      count: 0,
      average: 0,
      min: null,
      max: null
    });
    
    // Remove from history
    if (this.options.trackHistory) {
      this.history = this.history.filter(entry => entry.type !== type);
    }
    
    // Notify listeners
    this._notifyListeners('statReset', { type });
  }

  /**
   * Reset all stats
   */
  resetAllStats() {
    this._initializeDefaultStats();
    this.history = [];
    
    // Notify listeners
    this._notifyListeners('allStatsReset', {});
  }

  /**
   * Add a listener for stat tracker events
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
        console.error('Error in stat tracker listener:', error);
      }
    });
  }

  /**
   * Export stats to JSON
   * @param {boolean} includeHistory - Whether to include history
   * @returns {string} JSON string of stats
   */
  exportToJSON(includeHistory = true) {
    const data = {
      stats: this.getAllStats(),
      timestamp: new Date().toISOString()
    };
    
    if (includeHistory && this.options.trackHistory) {
      data.history = this.history;
    }
    
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import stats from JSON
   * @param {string} json - JSON string of stats
   * @returns {boolean} True if import was successful
   */
  importFromJSON(json) {
    try {
      const data = JSON.parse(json);
      
      if (!data.stats) {
        return false;
      }
      
      // Import stats
      for (const [type, stat] of Object.entries(data.stats)) {
        this.stats.set(type, { ...stat });
      }
      
      // Import history
      if (data.history && this.options.trackHistory) {
        this.history = [...data.history];
      }
      
      // Notify listeners
      this._notifyListeners('statsImported', { data });
      
      return true;
    } catch (error) {
      console.error('Error importing stats:', error);
      return false;
    }
  }
}

/**
 * Class for calculating probabilities
 */
export class ProbabilityCalculator {
  /**
   * Calculate the probability of rolling at least a target value on a die
   * @param {number} target - The target value
   * @param {number|string} die - The die size (e.g., 20 or 'd20')
   * @returns {number} The probability (0-1)
   */
  static rollAtLeast(target, die) {
    // Parse die size
    const dieSize = this._parseDieSize(die);
    
    // Calculate probability
    const successfulOutcomes = dieSize - target + 1;
    return Math.max(0, Math.min(1, successfulOutcomes / dieSize));
  }

  /**
   * Calculate the probability of rolling at most a target value on a die
   * @param {number} target - The target value
   * @param {number|string} die - The die size (e.g., 20 or 'd20')
   * @returns {number} The probability (0-1)
   */
  static rollAtMost(target, die) {
    // Parse die size
    const dieSize = this._parseDieSize(die);
    
    // Calculate probability
    return Math.max(0, Math.min(1, target / dieSize));
  }

  /**
   * Calculate the probability of rolling exactly a target value on a die
   * @param {number} target - The target value
   * @param {number|string} die - The die size (e.g., 20 or 'd20')
   * @returns {number} The probability (0-1)
   */
  static rollExactly(target, die) {
    // Parse die size
    const dieSize = this._parseDieSize(die);
    
    // Check if target is possible
    if (target < 1 || target > dieSize) {
      return 0;
    }
    
    // Calculate probability
    return 1 / dieSize;
  }

  /**
   * Calculate the probability of rolling with advantage and getting at least a target value
   * @param {number} target - The target value
   * @param {number|string} die - The die size (e.g., 20 or 'd20')
   * @returns {number} The probability (0-1)
   */
  static rollWithAdvantageAtLeast(target, die) {
    // Parse die size
    const dieSize = this._parseDieSize(die);
    
    // Calculate probability of failing on a single roll
    const failureProbability = (target - 1) / dieSize;
    
    // With advantage, you fail only if both rolls fail
    return 1 - (failureProbability * failureProbability);
  }

  /**
   * Calculate the probability of rolling with disadvantage and getting at least a target value
   * @param {number} target - The target value
   * @param {number|string} die - The die size (e.g., 20 or 'd20')
   * @returns {number} The probability (0-1)
   */
  static rollWithDisadvantageAtLeast(target, die) {
    // Parse die size
    const dieSize = this._parseDieSize(die);
    
    // Calculate probability of succeeding on a single roll
    const successProbability = (dieSize - target + 1) / dieSize;
    
    // With disadvantage, you succeed only if both rolls succeed
    return successProbability * successProbability;
  }

  /**
   * Calculate the probability of hitting an AC with an attack bonus
   * @param {number} ac - The armor class to hit
   * @param {number} bonus - The attack bonus
   * @param {Object} options - Additional options
   * @returns {number} The probability (0-1)
   */
  static hitProbability(ac, bonus, options = {}) {
    const {
      advantage = false,
      disadvantage = false,
      criticalRange = 20,
      criticalFailRange = 1
    } = options;
    
    // Calculate the target number needed on the d20
    const targetRoll = Math.max(criticalFailRange + 1, Math.min(criticalRange - 1, ac - bonus));
    
    // Calculate the probability based on advantage/disadvantage
    if (advantage && !disadvantage) {
      return this.rollWithAdvantageAtLeast(targetRoll, 20);
    } else if (disadvantage && !advantage) {
      return this.rollWithDisadvantageAtLeast(targetRoll, 20);
    } else {
      return this.rollAtLeast(targetRoll, 20);
    }
  }

  /**
   * Calculate the probability of succeeding on a saving throw
   * @param {number} dc - The difficulty class
   * @param {number} bonus - The saving throw bonus
   * @param {Object} options - Additional options
   * @returns {number} The probability (0-1)
   */
  static saveProbability(dc, bonus, options = {}) {
    const {
      advantage = false,
      disadvantage = false
    } = options;
    
    // Calculate the target number needed on the d20
    const targetRoll = Math.max(1, Math.min(20, dc - bonus));
    
    // Calculate the probability based on advantage/disadvantage
    if (advantage && !disadvantage) {
      return this.rollWithAdvantageAtLeast(targetRoll, 20);
    } else if (disadvantage && !advantage) {
      return this.rollWithDisadvantageAtLeast(targetRoll, 20);
    } else {
      return this.rollAtLeast(targetRoll, 20);
    }
  }

  /**
   * Calculate the average result of a dice formula
   * @param {string} formula - The dice formula (e.g., '2d6+3')
   * @returns {number} The average result
   */
  static averageRoll(formula) {
    // Parse the formula
    const { diceCount, dieSize, modifier, modifierValue } = this._parseFormula(formula);
    
    // Calculate the average roll for a single die
    const averageDieRoll = (dieSize + 1) / 2;
    
    // Calculate the total average
    let average = diceCount * averageDieRoll;
    
    // Apply the modifier
    if (modifier === '+') {
      average += modifierValue;
    } else if (modifier === '-') {
      average -= modifierValue;
    }
    
    return average;
  }

    /**
   * Calculate the maximum result of a dice formula
   * @param {string} formula - The dice formula (e.g., '2d6+3')
   * @returns {number} The maximum result
   */
  static maximumRoll(formula) {
    // Parse the formula
    const { diceCount, dieSize, modifier, modifierValue } = this._parseFormula(formula);
    
    // Calculate the maximum roll
    let maximum = diceCount * dieSize;
    
    // Apply the modifier
    if (modifier === '+') {
      maximum += modifierValue;
    } else if (modifier === '-') {
      maximum -= modifierValue;
    }
    
    return maximum;
  }

  /**
   * Calculate the probability distribution for a dice formula
   * @param {string} formula - The dice formula (e.g., '2d6+3')
   * @returns {Object} The probability distribution
   */
  static probabilityDistribution(formula) {
    // Parse the formula
    const { diceCount, dieSize, modifier, modifierValue } = this._parseFormula(formula);
    
    // Calculate the distribution
    const distribution = {};
    
    // Initialize with zero probability
    const min = this.minimumRoll(formula);
    const max = this.maximumRoll(formula);
    
    for (let i = min; i <= max; i++) {
      distribution[i] = 0;
    }
    
    // Calculate the probability for each outcome
    this._calculateDiceDistribution(diceCount, dieSize, distribution, 0, 1, modifier, modifierValue);
    
    return distribution;
  }

  /**
   * Calculate the probability of rolling at least a target value with a dice formula
   * @param {number} target - The target value
   * @param {string} formula - The dice formula (e.g., '2d6+3')
   * @returns {number} The probability (0-1)
   */
  static rollFormulaAtLeast(target, formula) {
    const distribution = this.probabilityDistribution(formula);
    
    let probability = 0;
    for (const [outcome, chance] of Object.entries(distribution)) {
      if (parseInt(outcome, 10) >= target) {
        probability += chance;
      }
    }
    
    return probability;
  }

  /**
   * Calculate the probability of rolling at most a target value with a dice formula
   * @param {number} target - The target value
   * @param {string} formula - The dice formula (e.g., '2d6+3')
   * @returns {number} The probability (0-1)
   */
  static rollFormulaAtMost(target, formula) {
    const distribution = this.probabilityDistribution(formula);
    
    let probability = 0;
    for (const [outcome, chance] of Object.entries(distribution)) {
      if (parseInt(outcome, 10) <= target) {
        probability += chance;
      }
    }
    
    return probability;
  }

  /**
   * Calculate the probability of rolling exactly a target value with a dice formula
   * @param {number} target - The target value
   * @param {string} formula - The dice formula (e.g., '2d6+3')
   * @returns {number} The probability (0-1)
   */
  static rollFormulaExactly(target, formula) {
    const distribution = this.probabilityDistribution(formula);
    return distribution[target] || 0;
  }

  /**
   * Calculate the dice distribution recursively
   * @param {number} diceCount - The number of dice
   * @param {number} dieSize - The die size
   * @param {Object} distribution - The distribution object to fill
   * @param {number} currentSum - The current sum
   * @param {number} currentProbability - The current probability
   * @param {string} modifier - The modifier type
   * @param {number} modifierValue - The modifier value
   * @private
   */
  static _calculateDiceDistribution(
    diceCount,
    dieSize,
    distribution,
    currentSum,
    currentProbability,
    modifier,
    modifierValue
  ) {
    if (diceCount === 0) {
      // Apply modifier to the final sum
      let finalSum = currentSum;
      if (modifier === '+') {
        finalSum += modifierValue;
      } else if (modifier === '-') {
        finalSum -= modifierValue;
      }
      
      // Add to the distribution
      distribution[finalSum] = (distribution[finalSum] || 0) + currentProbability;
      return;
    }
    
    // Roll each possible value for the current die
    for (let i = 1; i <= dieSize; i++) {
      this._calculateDiceDistribution(
        diceCount - 1,
        dieSize,
        distribution,
        currentSum + i,
        currentProbability / dieSize,
        modifier,
        modifierValue
      );
    }
  }

  /**
   * Parse a die size
   * @param {number|string} die - The die size (e.g., 20 or 'd20')
   * @returns {number} The die size as a number
   * @private
   */
  static _parseDieSize(die) {
    if (typeof die === 'number') {
      return die;
    }
    
    if (typeof die === 'string') {
      const match = die.match(/d(\d+)/i);
      if (match) {
        return parseInt(match[1], 10);
      }
    }
    
    return 6; // Default to d6
  }

  /**
   * Parse a dice formula
   * @param {string} formula - The dice formula (e.g., '2d6+3')
   * @returns {Object} The parsed formula
   * @private
   */
  static _parseFormula(formula) {
    // Default values
    let diceCount = 1;
    let dieSize = 6;
    let modifier = '';
    let modifierValue = 0;
    
    // Parse the formula
    const match = formula.match(/(\d+)?d(\d+)(?:([-+])(\d+))?/i);
    
    if (match) {
      if (match[1]) {
        diceCount = parseInt(match[1], 10);
      }
      
      dieSize = parseInt(match[2], 10);
      
      if (match[3] && match[4]) {
        modifier = match[3];
        modifierValue = parseInt(match[4], 10);
      }
    }
    
    return { diceCount, dieSize, modifier, modifierValue };
  }
}

/**
 * Class for analyzing combat statistics
 */
export class CombatAnalyzer {
  /**
   * Create a combat analyzer
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      ...options
    };
    
    this.combats = [];
    this.currentCombat = null;
  }

  /**
   * Start tracking a new combat
   * @param {Object} combatData - Initial combat data
   * @returns {Object} The combat object
   */
  startCombat(combatData = {}) {
    // End current combat if one is in progress
    if (this.currentCombat) {
      this.endCombat();
    }
    
    // Create new combat object
    this.currentCombat = {
      id: combatData.id || generateId(),
      name: combatData.name || `Combat ${this.combats.length + 1}`,
      startTime: Date.now(),
      endTime: null,
      rounds: 0,
      turns: 0,
      participants: new Map(),
      events: [],
      ...combatData
    };
    
    // Initialize participants
    if (combatData.participants) {
      combatData.participants.forEach(participant => {
        this.addParticipant(participant);
      });
    }
    
    return this.currentCombat;
  }

  /**
   * End the current combat
   * @returns {Object|null} The ended combat object
   */
  endCombat() {
    if (!this.currentCombat) {
      return null;
    }
    
    // Set end time
    this.currentCombat.endTime = Date.now();
    
    // Calculate duration
    this.currentCombat.duration = this.currentCombat.endTime - this.currentCombat.startTime;
    
    // Add to combats list
    this.combats.push(this.currentCombat);
    
    const endedCombat = this.currentCombat;
    this.currentCombat = null;
    
    return endedCombat;
  }

  /**
   * Add a participant to the current combat
   * @param {Object} participant - The participant data
   * @returns {boolean} True if the participant was added
   */
  addParticipant(participant) {
    if (!this.currentCombat) {
      return false;
    }
    
    // Create participant object
    const participantObj = {
      id: participant.id || generateId(),
      name: participant.name || 'Unknown',
      type: participant.type || 'creature',
      initiative: participant.initiative || 0,
      startingHp: participant.hp || 0,
      currentHp: participant.hp || 0,
      maxHp: participant.maxHp || participant.hp || 0,
      ac: participant.ac || 10,
      damageDealt: 0,
      damageTaken: 0,
      healingDone: 0,
      healingReceived: 0,
      attacksMade: 0,
      attacksHit: 0,
      criticalHits: 0,
      criticalFails: 0,
      savingThrows: 0,
      savingThrowsSucceeded: 0,
      turnsActive: 0,
      roundsActive: 0,
      conditionsApplied: [],
      conditionsReceived: [],
      ...participant
    };
    
    // Add to participants map
    this.currentCombat.participants.set(participantObj.id, participantObj);
    
    // Record event
    this._recordEvent('participantAdded', { participant: participantObj });
    
    return true;
  }

  /**
   * Remove a participant from the current combat
   * @param {string} participantId - The participant ID
   * @returns {boolean} True if the participant was removed
   */
  removeParticipant(participantId) {
    if (!this.currentCombat) {
      return false;
    }
    
    // Check if participant exists
    if (!this.currentCombat.participants.has(participantId)) {
      return false;
    }
    
    // Get participant
    const participant = this.currentCombat.participants.get(participantId);
    
    // Remove from participants map
    this.currentCombat.participants.delete(participantId);
    
    // Record event
    this._recordEvent('participantRemoved', { participant });
    
    return true;
  }

  /**
   * Start a new round
   * @returns {number} The new round number
   */
  startRound() {
    if (!this.currentCombat) {
      return 0;
    }
    
    // Increment round counter
    this.currentCombat.rounds++;
    
    // Record event
    this._recordEvent('roundStarted', { round: this.currentCombat.rounds });
    
    return this.currentCombat.rounds;
  }

  /**
   * Start a participant's turn
   * @param {string} participantId - The participant ID
   * @returns {boolean} True if the turn was started
   */
  startTurn(participantId) {
    if (!this.currentCombat) {
      return false;
    }
    
    // Check if participant exists
    if (!this.currentCombat.participants.has(participantId)) {
      return false;
    }
    
    // Get participant
    const participant = this.currentCombat.participants.get(participantId);
    
    // Increment turn counter
    this.currentCombat.turns++;
    
    // Increment participant's turns active
    participant.turnsActive++;
    
    // Increment participant's rounds active
    participant.roundsActive = Math.max(participant.roundsActive, this.currentCombat.rounds);
    
    // Record event
    this._recordEvent('turnStarted', { participant });
    
    return true;
  }

  /**
   * End a participant's turn
   * @param {string} participantId - The participant ID
   * @returns {boolean} True if the turn was ended
   */
  endTurn(participantId) {
    if (!this.currentCombat) {
      return false;
    }
    
    // Check if participant exists
    if (!this.currentCombat.participants.has(participantId)) {
      return false;
    }
    
    // Get participant
    const participant = this.currentCombat.participants.get(participantId);
    
    // Record event
    this._recordEvent('turnEnded', { participant });
    
    return true;
  }

  /**
   * Record damage dealt
   * @param {string} attackerId - The attacker ID
   * @param {string} targetId - The target ID
   * @param {number} damage - The damage amount
   * @param {Object} metadata - Additional metadata
   * @returns {boolean} True if the damage was recorded
   */
  recordDamage(attackerId, targetId, damage, metadata = {}) {
    if (!this.currentCombat) {
      return false;
    }
    
    // Check if participants exist
    if (!this.currentCombat.participants.has(attackerId) || !this.currentCombat.participants.has(targetId)) {
      return false;
    }
    
    // Get participants
    const attacker = this.currentCombat.participants.get(attackerId);
    const target = this.currentCombat.participants.get(targetId);
    
    // Update stats
    attacker.damageDealt += damage;
    target.damageTaken += damage;
    
    // Update target's HP
    target.currentHp = Math.max(0, target.currentHp - damage);
    
    // Record event
    this._recordEvent('damageDealt', {
      attacker,
      target,
      damage,
      damageType: metadata.damageType || 'unspecified',
      critical: metadata.critical || false,
      targetHp: target.currentHp
    });
    
    return true;
  }

  /**
   * Record healing done
   * @param {string} healerId - The healer ID
   * @param {string} targetId - The target ID
   * @param {number} healing - The healing amount
   * @param {Object} metadata - Additional metadata
   * @returns {boolean} True if the healing was recorded
   */
  recordHealing(healerId, targetId, healing, metadata = {}) {
    if (!this.currentCombat) {
      return false;
    }
    
    // Check if participants exist
    if (!this.currentCombat.participants.has(healerId) || !this.currentCombat.participants.has(targetId)) {
      return false;
    }
    
    // Get participants
    const healer = this.currentCombat.participants.get(healerId);
    const target = this.currentCombat.participants.get(targetId);
    
    // Update stats
    healer.healingDone += healing;
    target.healingReceived += healing;
    
    // Update target's HP
    target.currentHp = Math.min(target.maxHp, target.currentHp + healing);
    
    // Record event
    this._recordEvent('healingDone', {
      healer,
      target,
      healing,
      healingType: metadata.healingType || 'unspecified',
      targetHp: target.currentHp
    });
    
    return true;
  }

  /**
   * Record an attack
   * @param {string} attackerId - The attacker ID
   * @param {string} targetId - The target ID
   * @param {boolean} hit - Whether the attack hit
   * @param {Object} metadata - Additional metadata
   * @returns {boolean} True if the attack was recorded
   */
  recordAttack(attackerId, targetId, hit, metadata = {}) {
    if (!this.currentCombat) {
      return false;
    }
    
    // Check if participants exist
    if (!this.currentCombat.participants.has(attackerId) || !this.currentCombat.participants.has(targetId)) {
      return false;
    }
    
    // Get participants
    const attacker = this.currentCombat.participants.get(attackerId);
    const target = this.currentCombat.participants.get(targetId);
    
    // Update stats
    attacker.attacksMade++;
    
    if (hit) {
      attacker.attacksHit++;
      
      if (metadata.critical) {
        attacker.criticalHits++;
      }
    } else if (metadata.criticalFail) {
      attacker.criticalFails++;
    }
    
    // Record event
    this._recordEvent('attackMade', {
      attacker,
      target,
      hit,
      critical: metadata.critical || false,
      criticalFail: metadata.criticalFail || false,
      attackRoll: metadata.attackRoll || null,
      damageRoll: metadata.damageRoll || null
    });
    
    return true;
  }

  /**
   * Record a saving throw
   * @param {string} participantId - The participant ID
   * @param {boolean} success - Whether the save succeeded
   * @param {Object} metadata - Additional metadata
   * @returns {boolean} True if the saving throw was recorded
   */
  recordSavingThrow(participantId, success, metadata = {}) {
    if (!this.currentCombat) {
      return false;
    }
    
    // Check if participant exists
    if (!this.currentCombat.participants.has(participantId)) {
      return false;
    }
    
    // Get participant
    const participant = this.currentCombat.participants.get(participantId);
    
    // Update stats
    participant.savingThrows++;
    
    if (success) {
      participant.savingThrowsSucceeded++;
    }
    
    // Record event
    this._recordEvent('savingThrow', {
      participant,
      success,
      ability: metadata.ability || null,
      dc: metadata.dc || null,
      roll: metadata.roll || null
    });
    
    return true;
  }

  /**
   * Record a condition applied
   * @param {string} sourceId - The source ID
   * @param {string} targetId - The target ID
   * @param {string} condition - The condition
   * @param {Object} metadata - Additional metadata
   * @returns {boolean} True if the condition was recorded
   */
  recordCondition(sourceId, targetId, condition, metadata = {}) {
    if (!this.currentCombat) {
      return false;
    }
    
    // Check if participants exist
    if (!this.currentCombat.participants.has(sourceId) || !this.currentCombat.participants.has(targetId)) {
      return false;
    }
    
    // Get participants
    const source = this.currentCombat.participants.get(sourceId);
    const target = this.currentCombat.participants.get(targetId);
    
    // Update stats
    source.conditionsApplied.push(condition);
    target.conditionsReceived.push(condition);
    
    // Record event
    this._recordEvent('conditionApplied', {
      source,
      target,
      condition,
      duration: metadata.duration || null
    });
    
    return true;
  }

  /**
   * Record a custom event
   * @param {string} eventType - The event type
   * @param {Object} eventData - The event data
   */
  recordCustomEvent(eventType, eventData = {}) {
    if (!this.currentCombat) {
      return false;
    }
    
    // Record event
    this._recordEvent(eventType, eventData);
    
    return true;
  }

  /**
   * Record an event
   * @param {string} type - The event type
   * @param {Object} data - The event data
   * @private
   */
  _recordEvent(type, data) {
    if (!this.currentCombat) {
      return;
    }
    
    // Create event object
    const event = {
      type,
      timestamp: Date.now(),
      round: this.currentCombat.rounds,
      turn: this.currentCombat.turns,
      ...data
    };
    
    // Add to events list
    this.currentCombat.events.push(event);
  }

  /**
   * Get the current combat
   * @returns {Object|null} The current combat
   */
  getCurrentCombat() {
    return this.currentCombat;
  }

  /**
   * Get all combats
   * @returns {Array} All combats
   */
  getAllCombats() {
    return [...this.combats];
  }

  /**
   * Get a combat by ID
   * @param {string} combatId - The combat ID
   * @returns {Object|null} The combat or null if not found
   */
  getCombat(combatId) {
    return this.combats.find(combat => combat.id === combatId) || null;
  }

  /**
   * Get combat statistics
   * @param {string} combatId - The combat ID (current combat if not specified)
   * @returns {Object} The combat statistics
   */
  getCombatStats(combatId = null) {
    // Get the combat
    const combat = combatId
      ? this.getCombat(combatId)
      : this.currentCombat;
    
    if (!combat) {
      return null;
    }
    
    // Calculate statistics
    const stats = {
      id: combat.id,
      name: combat.name,
      rounds: combat.rounds,
      turns: combat.turns,
      duration: combat.endTime ? combat.endTime - combat.startTime : Date.now() - combat.startTime,
      participants: [],
      totalDamageDealt: 0,
      totalHealingDone: 0,
      averageDamagePerRound: 0,
      averageHealingPerRound: 0,
      mostDamageDealt: { participant: null, amount: 0 },
      mostDamageTaken: { participant: null, amount: 0 },
      mostHealingDone: { participant: null, amount: 0 },
      mostAttacksHit: { participant: null, amount: 0 },
      highestCriticalRate: { participant: null, rate: 0 }
    };
    
    // Process participants
    for (const participant of combat.participants.values()) {
      // Calculate participant stats
      const participantStats = {
        id: participant.id,
        name: participant.name,
        type: participant.type,
        damageDealt: participant.damageDealt,
        damageTaken: participant.damageTaken,
        healingDone: participant.healingDone,
        healingReceived: participant.healingReceived,
        attacksMade: participant.attacksMade,
        attacksHit: participant.attacksHit,
        criticalHits: participant.criticalHits,
        criticalFails: participant.criticalFails,
        savingThrows: participant.savingThrows,
        savingThrowsSucceeded: participant.savingThrowsSucceeded,
        turnsActive: participant.turnsActive,
        roundsActive: participant.roundsActive,
        hitRate: participant.attacksMade > 0 ? participant.attacksHit / participant.attacksMade : 0,
        criticalRate: participant.attacksHit > 0 ? participant.criticalHits / participant.attacksHit : 0,
        saveSuccessRate: participant.savingThrows > 0 ? participant.savingThrowsSucceeded / participant.savingThrows : 0,
        damagePerTurn: participant.turnsActive > 0 ? participant.damageDealt / participant.turnsActive : 0,
        healingPerTurn: participant.turnsActive > 0 ? participant.healingDone / participant.turnsActive : 0
      };
      
      // Add to participants list
      stats.participants.push(participantStats);
      
      // Update totals
      stats.totalDamageDealt += participant.damageDealt;
      stats.totalHealingDone += participant.healingDone;
      
      // Update records
      if (participant.damageDealt > stats.mostDamageDealt.amount) {
        stats.mostDamageDealt = { participant: participantStats, amount: participant.damageDealt };
      }
      
      if (participant.damageTaken > stats.mostDamageTaken.amount) {
        stats.mostDamageTaken = { participant: participantStats, amount: participant.damageTaken };
      }
      
      if (participant.healingDone > stats.mostHealingDone.amount) {
        stats.mostHealingDone = { participant: participantStats, amount: participant.healingDone };
      }
      
      if (participant.attacksHit > stats.mostAttacksHit.amount) {
        stats.mostAttacksHit = { participant: participantStats, amount: participant.attacksHit };
      }
      
      if (participantStats.criticalRate > stats.highestCriticalRate.rate) {
        stats.highestCriticalRate = { participant: participantStats, rate: participantStats.criticalRate };
      }
    }
    
    // Calculate averages
    if (combat.rounds > 0) {
      stats.averageDamagePerRound = stats.totalDamageDealt / combat.rounds;
      stats.averageHealingPerRound = stats.totalHealingDone / combat.rounds;
    }
    
    return stats;
  }

  /**
   * Get participant statistics
   * @param {string} participantId - The participant ID
   * @param {string} combatId - The combat ID (current combat if not specified)
   * @returns {Object} The participant statistics
   */
  getParticipantStats(participantId, combatId = null) {
    // Get the combat
    const combat = combatId
      ? this.getCombat(combatId)
      : this.currentCombat;
    
    if (!combat) {
      return null;
    }
    
    // Check if participant exists
    if (!combat.participants.has(participantId)) {
      return null;
    }
    
    // Get participant
    const participant = combat.participants.get(participantId);
    
    // Calculate statistics
    const stats = {
      id: participant.id,
      name: participant.name,
      type: participant.type,
      damageDealt: participant.damageDealt,
      damageTaken: participant.damageTaken,
      healingDone: participant.healingDone,
      healingReceived: participant.healingReceived,
      attacksMade: participant.attacksMade,
      attacksHit: participant.attacksHit,
      criticalHits: participant.criticalHits,
      criticalFails: participant.criticalFails,
      savingThrows: participant.savingThrows,
      savingThrowsSucceeded: participant.savingThrowsSucceeded,
      turnsActive: participant.turnsActive,
      roundsActive: participant.roundsActive,
      hitRate: participant.attacksMade > 0 ? participant.attacksHit / participant.attacksMade : 0,
      criticalRate: participant.attacksHit > 0 ? participant.criticalHits / participant.attacksHit : 0,
      saveSuccessRate: participant.savingThrows > 0 ? participant.savingThrowsSucceeded / participant.savingThrows : 0,
      damagePerTurn: participant.turnsActive > 0 ? participant.damageDealt / participant.turnsActive : 0,
      healingPerTurn: participant.turnsActive > 0 ? participant.healingDone / participant.turnsActive : 0,
      conditionsApplied: participant.conditionsApplied,
      conditionsReceived: participant.conditionsReceived
    };
    
    // Get events related to this participant
    stats.events = combat.events.filter(event => {
      return (
        (event.participant && event.participant.id === participantId) ||
        (event.attacker && event.attacker.id === participantId) ||
        (event.target && event.target.id === participantId) ||
        (event.healer && event.healer.id === participantId) ||
        (event.source && event.source.id === participantId)
      );
    });
    
    return stats;
  }

  /**
   * Export combat data to JSON
   * @param {string} combatId - The combat ID (all combats if not specified)
   * @returns {string} JSON string of combat data
   */
  exportToJSON(combatId = null) {
    if (combatId) {
      // Export a specific combat
      const combat = this.getCombat(combatId);
      
      if (!combat) {
        return '{}';
      }
      
      // Convert participants map to array
      const exportCombat = {
        ...combat,
        participants: Array.from(combat.participants.values())
      };
      
      return JSON.stringify(exportCombat, null, 2);
    } else {
      // Export all combats
      const exportCombats = this.combats.map(combat => {
        return {
          ...combat,
          participants: Array.from(combat.participants.values())
        };
      });
      
      return JSON.stringify({
        combats: exportCombats,
        timestamp: new Date().toISOString()
      }, null, 2);
    }
  }

  /**
   * Import combat data from JSON
   * @param {string} json - JSON string of combat data
   * @returns {boolean} True if import was successful
   */
  importFromJSON(json) {
    try {
      const data = JSON.parse(json);
      
      if (data.combats && Array.isArray(data.combats)) {
        // Import multiple combats
        data.combats.forEach(combatData => {
          this._importCombat(combatData);
        });
      } else {
        // Import a single combat
        this._importCombat(data);
      }
      
      return true;
    } catch (error) {
      console.error('Error importing combat data:', error);
      return false;
    }
  }

  /**
   * Import a combat
   * @param {Object} combatData - The combat data
   * @private
   */
  _importCombat(combatData) {
    // Create a new combat object
    const combat = {
      id: combatData.id || generateId(),
      name: combatData.name || `Imported Combat ${this.combats.length + 1}`,
      startTime: combatData.startTime || Date.now(),
      endTime: combatData.endTime || null,
      rounds: combatData.rounds || 0,
      turns: combatData.turns || 0,
      participants: new Map(),
      events: combatData.events || []
    };
    
    // Import participants
    if (combatData.participants && Array.isArray(combatData.participants)) {
      combatData.participants.forEach(participant => {
        combat.participants.set(participant.id, { ...participant });
      });
    }
    
    // Add to combats list
    this.combats.push(combat);
  }
}

/**
 * Class for visualizing statistics
 */
export class StatsVisualizer {
  /**
   * Create a stats visualizer
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      colors: options.colors || [
        '#4e79a7', '#f28e2c', '#e15759', '#76b7b2', 
        '#59a14f', '#edc949', '#af7aa1', '#ff9da7', 
        '#9c755f', '#bab0ab'
      ],
      ...options
    };
  }

  /**
   * Generate data for a bar chart
   * @param {Object} data - The data to visualize
   * @param {Object} options - Chart options
   * @returns {Object} The chart data
   */
  generateBarChartData(data, options = {}) {
    const {
      valueKey = 'value',
      labelKey = 'label',
      sortBy = 'value', // 'value', 'label', or null for no sorting
      sortDirection = 'desc', // 'asc' or 'desc'
      limit = null
    } = options;
    
    // Convert data to array if it's an object
    let dataArray = Array.isArray(data) ? [...data] : Object.entries(data).map(([key, value]) => ({
      [labelKey]: key,
      [valueKey]: value
    }));
    
    // Sort data
    if (sortBy) {
      dataArray.sort((a, b) => {
        const aValue = sortBy === 'value' ? a[valueKey] : a[labelKey];
        const bValue = sortBy === 'value' ? b[valueKey] : b[labelKey];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        } else {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
      });
    }
    
    // Apply limit
    if (limit && dataArray.length > limit) {
      dataArray = dataArray.slice(0, limit);
    }
    
    // Generate colors
    const colors = dataArray.map((_, index) => this.options.colors[index % this.options.colors.length]);
    
    return {
      labels: dataArray.map(item => item[labelKey]),
      datasets: [{
        data: dataArray.map(item => item[valueKey]),
        backgroundColor: colors
      }]
    };
  }

  /**
   * Generate data for a pie chart
   * @param {Object} data - The data to visualize
   * @param {Object} options - Chart options
   * @returns {Object} The chart data
   */
  generatePieChartData(data, options = {}) {
    const {
      valueKey = 'value',
      labelKey = 'label',
      sortBy = null, // 'value', 'label', or null for no sorting
      sortDirection = 'desc', // 'asc' or 'desc'
      limit = null,
      otherLabel = 'Other'
    } = options;
    
    // Convert data to array if it's an object
    let dataArray = Array.isArray(data) ? [...data] : Object.entries(data).map(([key, value]) => ({
      [labelKey]: key,
      [valueKey]: value
    }));
    
    // Sort data
    if (sortBy) {
      dataArray.sort((a, b) => {
        const aValue = sortBy === 'value' ? a[valueKey] : a[labelKey];
        const bValue = sortBy === 'value' ? b[valueKey] : b[labelKey];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        } else {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
      });
    }
    
    // Apply limit with "Other" category
    let otherValue = 0;
    if (limit && dataArray.length > limit) {
      const visibleData = dataArray.slice(0, limit);
      const hiddenData = dataArray.slice(limit);
      
      otherValue = hiddenData.reduce((sum, item) => sum + item[valueKey], 0);
      dataArray = visibleData;
      
      if (otherValue > 0) {
        dataArray.push({
          [labelKey]: otherLabel,
          [valueKey]: otherValue
        });
      }
    }
    
    // Generate colors
    const colors = dataArray.map((_, index) => this.options.colors[index % this.options.colors.length]);
    
    return {
      labels: dataArray.map(item => item[labelKey]),
      datasets: [{
        data: dataArray.map(item => item[valueKey]),
        backgroundColor: colors
      }]
    };
  }

  /**
   * Generate data for a line chart
   * @param {Array} data - The data to visualize
   * @param {Object} options - Chart options
   * @returns {Object} The chart data
   */
  generateLineChartData(data, options = {}) {
    const {
      xKey = 'x',
      yKey = 'y',
      labelKey = 'label',
      datasets = null,
      sortByX = true
    } = options;
    
    // Handle multiple datasets
    if (datasets) {
      const result = {
        labels: [],
        datasets: []
      };
      
      // Process each dataset
      datasets.forEach((dataset, index) => {
        const color = this.options.colors[index % this.options.colors.length];
        
        // Sort data if needed
        const datasetData = sortByX ? [...dataset.data].sort((a, b) => a[xKey] - b[xKey]) : dataset.data;
        
        // Add to result
        result.datasets.push({
          label: dataset.label,
          data: datasetData.map(item => ({ x: item[xKey], y: item[yKey] })),
          borderColor: color,
          backgroundColor: this._adjustAlpha(color, 0.2)
        });
        
        // Collect all x values for labels
        datasetData.forEach(item => {
          if (!result.labels.includes(item[xKey])) {
            result.labels.push(item[xKey]);
          }
        });
      });
      
      // Sort labels
      if (sortByX) {
        result.labels.sort((a, b) => a - b);
      }
      
      return result;
    } else {
      // Single dataset
      // Sort data if needed
      const sortedData = sortByX ? [...data].sort((a, b) => a[xKey] - b[xKey]) : data;
      
      return {
        labels: sortedData.map(item => item[xKey]),
        datasets: [{
          label: options.label || '',
          data: sortedData.map(item => item[yKey]),
          borderColor: this.options.colors[0],
          backgroundColor: this._adjustAlpha(this.options.colors[0], 0.2)
        }]
      };
    }
  }

  /**
   * Generate data for a radar chart
   * @param {Array} data - The data to visualize
   * @param {Object} options - Chart options
   * @returns {Object} The chart data
   */
  generateRadarChartData(data, options = {}) {
    const {
      labelKey = 'label',
      datasets = null
    } = options;
    
    // Handle multiple datasets
    if (datasets) {
      const result = {
        labels: [],
        datasets: []
      };
      
      // Collect all labels
      datasets.forEach(dataset => {
        dataset.data.forEach(item => {
          if (!result.labels.includes(item[labelKey])) {
            result.labels.push(item[labelKey]);
          }
        });
      });
      
      // Process each dataset
      datasets.forEach((dataset, index) => {
        const color = this.options.colors[index % this.options.colors.length];
        
        // Create a map of label to value
        const valueMap = {};
        dataset.data.forEach(item => {
          valueMap[item[labelKey]] = item.value;
        });
        
        // Add to result
        result.datasets.push({
          label: dataset.label,
          data: result.labels.map(label => valueMap[label] || 0),
          borderColor: color,
          backgroundColor: this._adjustAlpha(color, 0.2)
        });
      });
      
      return result;
    } else {
      // Single dataset
      return {
        labels: data.map(item => item[labelKey]),
        datasets: [{
          label: options.label || '',
          data: data.map(item => item.value),
          borderColor: this.options.colors[0],
          backgroundColor: this._adjustAlpha(this.options.colors[0], 0.2)
        }]
      };
    }
  }

  /**
   * Generate data for a scatter plot
   * @param {Array} data - The data to visualize
   * @param {Object} options - Chart options
   * @returns {Object} The chart data
   */
  generateScatterPlotData(data, options = {}) {
    const {
      xKey = 'x',
      yKey = 'y',
      labelKey = 'label',
      datasets = null
    } = options;
    
    // Handle multiple datasets
    if (datasets) {
      return {
        datasets: datasets.map((dataset, index) => {
          const color = this.options.colors[index % this.options.colors.length];
          
          return {
            label: dataset.label,
            data: dataset.data.map(item => ({ x: item[xKey], y: item[yKey] })),
            backgroundColor: color
          };
        })
      };
    } else {
      // Single dataset
      return {
        datasets: [{
          label: options.label || '',
          data: data.map(item => ({ x: item[xKey], y: item[yKey] })),
          backgroundColor: this.options.colors[0]
        }]
      };
    }
  }

  /**
   * Generate a table from data
   * @param {Array} data - The data to visualize
   * @param {Object} options - Table options
   * @returns {Object} The table data
   */
  generateTableData(data, options = {}) {
    const {
      columns = null,
      sortBy = null,
      sortDirection = 'asc',
      limit = null
    } = options;
    
    // Determine columns if not provided
    let tableColumns = columns;
    if (!tableColumns && data.length > 0) {
      tableColumns = Object.keys(data[0]).map(key => ({
        id: key,
        label: key.charAt(0).toUpperCase() + key.slice(1),
        type: typeof data[0][key]
      }));
    }
    
    // Sort data
    let sortedData = [...data];
    if (sortBy) {
      sortedData.sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        } else {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
      });
    }
    
    // Apply limit
    if (limit && sortedData.length > limit) {
      sortedData = sortedData.slice(0, limit);
    }
    
    return {
      columns: tableColumns,
      rows: sortedData
    };
  }

  /**
   * Generate a summary of statistics
   * @param {Object} stats - The statistics to summarize
   * @returns {Array} The summary data
   */
  generateStatsSummary(stats) {
    const summary = [];
    
    // Process each stat
    for (const [key, value] of Object.entries(stats)) {
      if (typeof value === 'object' && value !== null) {
        // Skip complex objects
        if (Array.isArray(value)) {
          summary.push({
            label: this._formatLabel(key),
            value: value.length,
            type: 'count'
          });
        } else {
          // Check for common stat patterns
          if ('total' in value && 'count' in value) {
            summary.push({
              label: this._formatLabel(key),
              value: value.total,
              average: value.count > 0 ? value.total / value.count : 0,
              count: value.count,
              type: 'aggregate'
            });
          } else if ('min' in value && 'max' in value) {
            summary.push({
              label: this._formatLabel(key),
              min: value.min,
              max: value.max,
              average: value.average || null,
              type: 'range'
            });
          }
        }
      } else {
        // Simple value
        summary.push({
          label: this._formatLabel(key),
          value,
          type: typeof value
        });
      }
    }
    
    return summary;
  }

  /**
   * Format a label from a camelCase or snake_case key
   * @param {string} key - The key to format
   * @returns {string} The formatted label
   * @private
   */
  _formatLabel(key) {
    // Replace underscores and camelCase with spaces
    return key
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  /**
   * Adjust the alpha (transparency) of a color
   * @param {string} color - The color to adjust
   * @param {number} alpha - The alpha value (0-1)
   * @returns {string} The adjusted color
   * @private
   */
  _adjustAlpha(color, alpha) {
    // Handle hex colors
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    // Handle rgb colors
    if (color.startsWith('rgb(')) {
      const rgb = color.match(/\d+/g);
      return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
    }
    
    // Handle rgba colors
    if (color.startsWith('rgba(')) {
      const rgba = color.match(/\d+/g);
      return `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${alpha})`;
    }
    
    return color;
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
 * Create a dice roller
 * @param {Object} options - Configuration options
 * @returns {DiceRoller} A new dice roller instance
 */
export function createDiceRoller(options = {}) {
  return new DiceRoller(options);
}

/**
 * Create a stat tracker
 * @param {Object} options - Configuration options
 * @returns {StatTracker} A new stat tracker instance
 */
export function createStatTracker(options = {}) {
  return new StatTracker(options);
}

/**
 * Create a combat analyzer
 * @param {Object} options - Configuration options
 * @returns {CombatAnalyzer} A new combat analyzer instance
 */
export function createCombatAnalyzer(options = {}) {
  return new CombatAnalyzer(options);
}

/**
 * Create a stats visualizer
 * @param {Object} options - Configuration options
 * @returns {StatsVisualizer} A new stats visualizer instance
 */
export function createStatsVisualizer(options = {}) {
  return new StatsVisualizer(options);
}

/**
 * Roll a die
 * @param {number|string} die - The die size (e.g., 20 or 'd20')
 * @returns {number} The roll result
 */
export function rollDie(die) {
  const dieSize = typeof die === 'number' ? die : parseInt(die.replace(/\D/g, ''), 10) || 6;
  return Math.floor(Math.random() * dieSize) + 1;
}

/**
 * Roll dice based on a formula (e.g., '2d6+3')
 * @param {string} formula - The dice formula
 * @returns {Object} The roll results
 */
export function rollDice(formula) {
  const roller = new DiceRoller({ recordRolls: false });
  return roller.rollFormula(formula);
}

/**
 * Calculate the average result of a dice formula
 * @param {string} formula - The dice formula (e.g., '2d6+3')
 * @returns {number} The average result
 */
export function calculateAverageRoll(formula) {
  return ProbabilityCalculator.averageRoll(formula);
}

/**
 * Calculate the probability of rolling at least a target value
 * @param {number} target - The target value
 * @param {number|string} die - The die size (e.g., 20 or 'd20')
 * @returns {number} The probability (0-1)
 */
export function calculateProbability(target, die) {
  return ProbabilityCalculator.rollAtLeast(target, die);
}

// Export the main stats functions and classes
export default {
  createDiceRoller,
  createStatTracker,
  createCombatAnalyzer,
  createStatsVisualizer,
  rollDie,
  rollDice,
  calculateAverageRoll,
  calculateProbability,
  DiceType,
  RollType,
  StatType
};
