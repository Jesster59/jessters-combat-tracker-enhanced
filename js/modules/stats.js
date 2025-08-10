/**
 * Jesster's Combat Tracker
 * Statistics and Dice Module
 * Version 2.3.1
 * 
 * This module provides dice rolling and combat statistics functionality.
 */

/**
 * Dice roller class
 */
class DiceRoller {
  /**
   * Create a dice roller
   */
  constructor() {
    this.history = [];
    this.maxHistoryLength = 20;
  }

  /**
   * Roll dice
   * @param {string} expression - Dice expression (e.g., "2d6+3")
   * @returns {Object} Roll result
   */
  roll(expression) {
    try {
      const result = this._parseAndRoll(expression);
      
      // Add to history
      this.history.unshift({
        expression,
        result: result.total,
        breakdown: result.breakdown,
        timestamp: new Date().getTime()
      });
      
      // Trim history if needed
      if (this.history.length > this.maxHistoryLength) {
        this.history.pop();
      }
      
      return result;
    } catch (error) {
      console.error('Error rolling dice:', error);
      return {
        success: false,
        error: error.message,
        total: 0,
        rolls: [],
        breakdown: ''
      };
    }
  }

  /**
   * Parse and roll dice expression
   * @param {string} expression - Dice expression
   * @returns {Object} Roll result
   * @private
   */
  _parseAndRoll(expression) {
    // Remove whitespace
    expression = expression.replace(/\s+/g, '');
    
    // Validate expression
    if (!expression.match(/^(\d*d\d+|\d+)([+\-*/](\d*d\d+|\d+))*$/i)) {
      throw new Error('Invalid dice expression');
    }
    
    // Split into terms
    const terms = this._splitIntoTerms(expression);
    
    // Roll each term and calculate total
    let total = 0;
    let breakdown = '';
    let operator = '+';
    const rolls = [];
    
    for (const term of terms) {
      if (['+', '-', '*', '/'].includes(term)) {
        operator = term;
        breakdown += ` ${operator} `;
        continue;
      }
      
      // Check if term is a die roll or a number
      if (term.toLowerCase().includes('d')) {
        const [count, sides] = term.toLowerCase().split('d');
        const dieCount = count === '' ? 1 : parseInt(count, 10);
        const dieSides = parseInt(sides, 10);
        
        // Validate die parameters
        if (dieCount < 1 || dieSides < 1 || dieCount > 100 || dieSides > 1000) {
          throw new Error('Invalid die parameters');
        }
        
        // Roll the dice
        const dieRolls = [];
        for (let i = 0; i < dieCount; i++) {
          const roll = Math.floor(Math.random() * dieSides) + 1;
          dieRolls.push(roll);
        }
        
        const dieTotal = dieRolls.reduce((sum, roll) => sum + roll, 0);
        rolls.push({ die: term, rolls: dieRolls, total: dieTotal });
        
        // Add to breakdown
        breakdown += `[${dieRolls.join(', ')}]`;
        
        // Apply operator
        switch (operator) {
          case '+': total += dieTotal; break;
          case '-': total -= dieTotal; break;
          case '*': total *= dieTotal; break;
          case '/': total = Math.floor(total / dieTotal); break;
        }
      } else {
        // Term is a number
        const num = parseInt(term, 10);
        
        // Add to breakdown
        breakdown += num;
        
        // Apply operator
        switch (operator) {
          case '+': total += num; break;
          case '-': total -= num; break;
          case '*': total *= num; break;
          case '/': total = Math.floor(total / num); break;
        }
      }
    }
    
    return {
      success: true,
      total,
      rolls,
      breakdown
    };
  }

  /**
   * Split expression into terms
   * @param {string} expression - Dice expression
   * @returns {string[]} Array of terms
   * @private
   */
  _splitIntoTerms(expression) {
    const terms = [];
    let currentTerm = '';
    
    for (let i = 0; i < expression.length; i++) {
      const char = expression[i];
      
      if (['+', '-', '*', '/'].includes(char)) {
        if (currentTerm) {
          terms.push(currentTerm);
          currentTerm = '';
        }
        terms.push(char);
      } else {
        currentTerm += char;
      }
    }
    
    if (currentTerm) {
      terms.push(currentTerm);
    }
    
    return terms;
  }

  /**
   * Get roll history
   * @returns {Array} Roll history
   */
  getHistory() {
    return this.history;
  }

  /**
   * Clear roll history
   */
  clearHistory() {
    this.history = [];
  }
}

/**
 * Stat tracker class
 */
class StatTracker {
  /**
   * Create a stat tracker
   */
  constructor() {
    this.stats = {
      damageDealt: 0,
      damageByType: {},
      damageSources: {},
      healingDone: 0,
      conditionsApplied: 0,
      kills: 0,
      combatantStats: {}
    };
  }

  /**
   * Track damage
   * @param {Object} data - Damage data
   */
  trackDamage(data) {
    const { amount, type, source, target } = data;
    
    if (!amount || amount <= 0) return;
    
    // Update total damage
    this.stats.damageDealt += amount;
    
    // Update damage by type
    if (type) {
      this.stats.damageByType[type] = (this.stats.damageByType[type] || 0) + amount;
    }
    
    // Update damage sources
    if (source) {
      this.stats.damageSources[source] = (this.stats.damageSources[source] || 0) + amount;
    }
    
    // Update combatant stats
    if (source) {
      if (!this.stats.combatantStats[source]) {
        this.stats.combatantStats[source] = {
          damageDealt: 0,
          damageTaken: 0,
          healing: 0,
          kills: 0
        };
      }
      
      this.stats.combatantStats[source].damageDealt += amount;
    }
    
    if (target) {
      if (!this.stats.combatantStats[target]) {
        this.stats.combatantStats[target] = {
          damageDealt: 0,
          damageTaken: 0,
          healing: 0,
          kills: 0
        };
      }
      
      this.stats.combatantStats[target].damageTaken += amount;
    }
  }

  /**
   * Track healing
   * @param {Object} data - Healing data
   */
  trackHealing(data) {
    const { amount, source, target } = data;
    
    if (!amount || amount <= 0) return;
    
    // Update total healing
    this.stats.healingDone += amount;
    
    // Update combatant stats
    if (source) {
      if (!this.stats.combatantStats[source]) {
        this.stats.combatantStats[source] = {
          damageDealt: 0,
          damageTaken: 0,
          healing: 0,
          kills: 0
        };
      }
      
      this.stats.combatantStats[source].healing += amount;
    }
  }

  /**
   * Track condition
   * @param {Object} data - Condition data
   */
  trackCondition(data) {
    // Increment conditions applied
    this.stats.conditionsApplied++;
  }

  /**
   * Track kill
   * @param {Object} data - Kill data
   */
  trackKill(data) {
    const { source } = data;
    
    // Increment total kills
    this.stats.kills++;
    
    // Update combatant stats
    if (source) {
      if (!this.stats.combatantStats[source]) {
        this.stats.combatantStats[source] = {
          damageDealt: 0,
          damageTaken: 0,
          healing: 0,
          kills: 0
        };
      }
      
      this.stats.combatantStats[source].kills++;
    }
  }

  /**
   * Get all stats
   * @returns {Object} All stats
   */
  getStats() {
    return this.stats;
  }

  /**
   * Reset all stats
   */
  reset() {
    this.stats = {
      damageDealt: 0,
      damageByType: {},
      damageSources: {},
      healingDone: 0,
      conditionsApplied: 0,
      kills: 0,
      combatantStats: {}
    };
  }

  /**
   * Save stats to data object
   * @returns {Object} Stats data
   */
  saveToData() {
    return { ...this.stats };
  }

  /**
   * Load stats from data object
   * @param {Object} data - Stats data
   */
  loadFromData(data) {
    if (data) {
      this.stats = { ...data };
    }
  }
}

/**
 * Combat analyzer class
 */
class CombatAnalyzer {
  /**
   * Create a combat analyzer
   */
  constructor() {
    this.listeners = [];
    this.combatData = {
      active: false,
      startTime: null,
      endTime: null,
      rounds: [],
      currentRound: 0,
      currentTurn: 0,
      combatants: [],
      turnHistory: []
    };
  }

  /**
   * Start combat
   * @param {Object} data - Combat start data
   */
  startCombat(data) {
    const { combatants, startTime } = data;
    
    this.combatData = {
      active: true,
      startTime: startTime || new Date().getTime(),
      endTime: null,
      rounds: [{
        round: 1,
        startTime: startTime || new Date().getTime(),
        endTime: null,
        turns: [],
        damageDealt: 0,
        healingDone: 0,
        conditionsApplied: 0
      }],
      currentRound: 1,
      currentTurn: 1,
      combatants: combatants || [],
      turnHistory: []
    };
    
    this._notifyListeners('combatStarted', {
      startTime: this.combatData.startTime,
      round: 1,
      turn: 1
    });
  }

  /**
   * End combat
   * @param {Object} data - Combat end data
   */
  endCombat(data) {
    const { endTime } = data;
    
    this.combatData.active = false;
    this.combatData.endTime = endTime || new Date().getTime();
    
    // End current round
    if (this.combatData.rounds.length > 0) {
      const currentRound = this.combatData.rounds[this.combatData.rounds.length - 1];
      currentRound.endTime = this.combatData.endTime;
    }
    
    this._notifyListeners('combatEnded', {
      endTime: this.combatData.endTime,
      duration: this.combatData.endTime - this.combatData.startTime
    });
  }

  /**
   * Advance turn
   * @param {Object} data - Turn data
   */
  advanceTurn(data) {
    const { round, turn, activeId } = data;
    
    // Update current round/turn
    this.combatData.currentRound = round;
    this.combatData.currentTurn = turn;
    
    // Ensure round exists
    if (round > this.combatData.rounds.length) {
      // End previous round
      if (this.combatData.rounds.length > 0) {
        const prevRound = this.combatData.rounds[this.combatData.rounds.length - 1];
        prevRound.endTime = new Date().getTime();
      }
      
            // Create new round
      this.combatData.rounds.push({
        round,
        startTime: new Date().getTime(),
        endTime: null,
        turns: [],
        damageDealt: 0,
        healingDone: 0,
        conditionsApplied: 0
      });
    }
    
    // Add turn to history
    this.combatData.turnHistory.push({
      round,
      turn,
      activeId,
      timestamp: new Date().getTime()
    });
    
    // Add turn to current round
    const currentRound = this.combatData.rounds[this.combatData.rounds.length - 1];
    currentRound.turns.push({
      turn,
      activeId,
      startTime: new Date().getTime(),
      endTime: null,
      actions: []
    });
    
    this._notifyListeners('turnChanged', {
      round,
      turn,
      activeId
    });
  }

  /**
   * Regress turn
   * @param {Object} data - Turn data
   */
  regressTurn(data) {
    const { round, turn, activeId } = data;
    
    // Update current round/turn
    this.combatData.currentRound = round;
    this.combatData.currentTurn = turn;
    
    // Add turn to history
    this.combatData.turnHistory.push({
      round,
      turn,
      activeId,
      timestamp: new Date().getTime(),
      regressed: true
    });
    
    this._notifyListeners('turnChanged', {
      round,
      turn,
      activeId,
      regressed: true
    });
  }

  /**
   * Track action
   * @param {Object} data - Action data
   */
  trackAction(data) {
    const { type, source, target, amount, details } = data;
    
    // Add action to current turn
    if (this.combatData.rounds.length > 0) {
      const currentRound = this.combatData.rounds[this.combatData.rounds.length - 1];
      
      if (currentRound.turns.length > 0) {
        const currentTurn = currentRound.turns[currentRound.turns.length - 1];
        
        currentTurn.actions.push({
          type,
          source,
          target,
          amount,
          details,
          timestamp: new Date().getTime()
        });
        
        // Update round statistics
        if (type === 'damage' && amount) {
          currentRound.damageDealt += amount;
        } else if (type === 'healing' && amount) {
          currentRound.healingDone += amount;
        } else if (type === 'condition') {
          currentRound.conditionsApplied++;
        }
      }
    }
    
    this._notifyListeners('actionTracked', data);
  }

  /**
   * Get combat stats
   * @returns {Object} Combat statistics
   */
  getCombatStats() {
    if (!this.combatData.startTime) {
      return null;
    }
    
    // Calculate duration
    const endTime = this.combatData.endTime || new Date().getTime();
    const duration = endTime - this.combatData.startTime;
    
    // Calculate total rounds and turns
    const totalRounds = this.combatData.rounds.length;
    const totalTurns = this.combatData.turnHistory.filter(turn => !turn.regressed).length;
    
    // Calculate damage statistics
    let totalDamageDealt = 0;
    let totalHealingDone = 0;
    let totalConditionsApplied = 0;
    let highestDamageInOneRound = 0;
    let highestDamageRound = 0;
    
    this.combatData.rounds.forEach(round => {
      totalDamageDealt += round.damageDealt;
      totalHealingDone += round.healingDone;
      totalConditionsApplied += round.conditionsApplied;
      
      if (round.damageDealt > highestDamageInOneRound) {
        highestDamageInOneRound = round.damageDealt;
        highestDamageRound = round.round;
      }
    });
    
    // Calculate average damage per round
    const averageDamagePerRound = totalRounds > 0 ? totalDamageDealt / totalRounds : 0;
    
    // Calculate average time per round
    const averageTimePerRound = totalRounds > 0 ? duration / totalRounds : 0;
    
    // Prepare combatant stats
    const combatantStats = [];
    const combatantMap = new Map();
    
    // First, create a map of combatant IDs to names
    this.combatData.combatants.forEach(combatant => {
      combatantMap.set(combatant.id, combatant.name);
    });
    
    // Process turn history to count turns per combatant
    const turnCounts = {};
    this.combatData.turnHistory.forEach(turn => {
      if (!turn.regressed && turn.activeId) {
        turnCounts[turn.activeId] = (turnCounts[turn.activeId] || 0) + 1;
      }
    });
    
    // Process actions to build combatant stats
    const combatantData = {};
    
    this.combatData.rounds.forEach(round => {
      round.turns.forEach(turn => {
        turn.actions.forEach(action => {
          if (action.source) {
            if (!combatantData[action.source]) {
              combatantData[action.source] = {
                id: action.source,
                name: combatantMap.get(action.source) || action.source,
                damageDealt: 0,
                damageTaken: 0,
                healing: 0,
                kills: 0,
                turnCount: turnCounts[action.source] || 0
              };
            }
            
            if (action.type === 'damage' && action.amount) {
              combatantData[action.source].damageDealt += action.amount;
            } else if (action.type === 'healing' && action.amount) {
              combatantData[action.source].healing += action.amount;
            } else if (action.type === 'kill') {
              combatantData[action.source].kills++;
            }
          }
          
          if (action.target && action.type === 'damage' && action.amount) {
            if (!combatantData[action.target]) {
              combatantData[action.target] = {
                id: action.target,
                name: combatantMap.get(action.target) || action.target,
                damageDealt: 0,
                damageTaken: 0,
                healing: 0,
                kills: 0,
                turnCount: turnCounts[action.target] || 0
              };
            }
            
            combatantData[action.target].damageTaken += action.amount;
          }
        });
      });
    });
    
    // Convert to array and calculate averages
    Object.values(combatantData).forEach(data => {
      data.avgDamagePerTurn = data.turnCount > 0 ? data.damageDealt / data.turnCount : 0;
      combatantStats.push(data);
    });
    
    // Prepare damage by type
    const damageByType = [];
    const damageTypeMap = {};
    
    this.combatData.rounds.forEach(round => {
      round.turns.forEach(turn => {
        turn.actions.forEach(action => {
          if (action.type === 'damage' && action.amount && action.details && action.details.damageType) {
            const type = action.details.damageType;
            damageTypeMap[type] = (damageTypeMap[type] || 0) + action.amount;
          }
        });
      });
    });
    
    Object.entries(damageTypeMap).forEach(([type, amount]) => {
      damageByType.push({
        type,
        amount,
        percentage: totalDamageDealt > 0 ? (amount / totalDamageDealt) * 100 : 0
      });
    });
    
    // Prepare top damage sources
    const topDamageSources = [];
    const sourceMap = {};
    
    this.combatData.rounds.forEach(round => {
      round.turns.forEach(turn => {
        turn.actions.forEach(action => {
          if (action.type === 'damage' && action.amount && action.details && action.details.source) {
            const source = action.details.source;
            sourceMap[source] = (sourceMap[source] || 0) + action.amount;
          }
        });
      });
    });
    
    Object.entries(sourceMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([source, amount]) => {
        topDamageSources.push({
          source,
          amount,
          percentage: totalDamageDealt > 0 ? (amount / totalDamageDealt) * 100 : 0
        });
      });
    
    // Prepare round-by-round stats
    const roundByRoundStats = this.combatData.rounds.map(round => {
      const roundDuration = round.endTime 
        ? round.endTime - round.startTime 
        : (new Date().getTime() - round.startTime);
      
      return {
        round: round.round,
        damageDealt: round.damageDealt,
        healingDone: round.healingDone,
        conditionsApplied: round.conditionsApplied,
        duration: roundDuration,
        turnCount: round.turns.length
      };
    });
    
    return {
      duration,
      totalRounds,
      totalTurns,
      totalDamageDealt,
      totalHealingDone,
      totalConditionsApplied,
      averageDamagePerRound,
      averageTimePerRound,
      highestDamageInOneRound,
      highestDamageRound,
      combatantStats,
      damageByType,
      topDamageSources,
      roundByRoundStats
    };
  }

  /**
   * Add event listener
   * @param {Function} listener - Event listener function
   * @returns {Function} Function to remove the listener
   */
  addListener(listener) {
    this.listeners.push(listener);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index !== -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify listeners of an event
   * @param {string} event - Event name
   * @param {Object} data - Event data
   * @private
   */
  _notifyListeners(event, data) {
    this.listeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Error in combat analyzer listener:', error);
      }
    });
  }

  /**
   * Reset combat analyzer
   */
  reset() {
    this.combatData = {
      active: false,
      startTime: null,
      endTime: null,
      rounds: [],
      currentRound: 0,
      currentTurn: 0,
      combatants: [],
      turnHistory: []
    };
  }

  /**
   * Save combat data to object
   * @returns {Object} Combat data
   */
  saveToData() {
    return { ...this.combatData };
  }

  /**
   * Load combat data from object
   * @param {Object} data - Combat data
   */
  loadFromData(data) {
    if (data) {
      this.combatData = { ...data };
    }
  }
}

/**
 * Create a dice roller
 * @returns {DiceRoller} A new dice roller instance
 */
export function createDiceRoller() {
  return new DiceRoller();
}

/**
 * Create a stat tracker
 * @returns {StatTracker} A new stat tracker instance
 */
export function createStatTracker() {
  return new StatTracker();
}

/**
 * Create a combat analyzer
 * @returns {CombatAnalyzer} A new combat analyzer instance
 */
export function createCombatAnalyzer() {
  return new CombatAnalyzer();
}

export default {
  createDiceRoller,
  createStatTracker,
  createCombatAnalyzer
};
