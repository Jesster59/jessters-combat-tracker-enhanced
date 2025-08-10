/**
 * Jesster's Combat Tracker
 * Legendary Module
 * Version 2.3.1
 * 
 * This module handles legendary actions, mythic actions, and other special abilities
 * for powerful creatures, allowing them to act outside their normal turn.
 */

/**
 * Types of special actions
 */
export const SpecialActionType = {
  LEGENDARY: 'legendary',
  MYTHIC: 'mythic',
  LAIR: 'lair',
  REACTION: 'reaction',
  BONUS_ACTION: 'bonus_action',
  VILLAIN_ACTION: 'villain_action',
  PARAGON_ACTION: 'paragon_action',
  RECHARGE: 'recharge'
};

/**
 * Class representing a creature with special actions
 */
export class LegendaryCreature {
  /**
   * Create a legendary creature
   * @param {Object} config - Creature configuration
   */
  constructor(config = {}) {
    this.id = config.id || generateId();
    this.name = config.name || 'Unknown Creature';
    this.actions = config.actions || [];
    this.maxLegendaryActions = config.maxLegendaryActions || 3;
    this.maxMythicActions = config.maxMythicActions || 0;
    this.remainingLegendaryActions = config.remainingLegendaryActions !== undefined 
      ? config.remainingLegendaryActions 
      : this.maxLegendaryActions;
    this.remainingMythicActions = config.remainingMythicActions !== undefined 
      ? config.remainingMythicActions 
      : this.maxMythicActions;
    this.mythicPhaseActive = config.mythicPhaseActive || false;
    this.resistances = config.resistances || [];
    this.immunities = config.immunities || [];
    this.vulnerabilities = config.vulnerabilities || [];
    this.rechargeAbilities = config.rechargeAbilities || [];
    this.paragonPhases = config.paragonPhases || 0;
    this.currentParagonPhase = config.currentParagonPhase || 0;
    this.villainActionsPerRound = config.villainActionsPerRound || 0;
    this.usedVillainActionsThisRound = config.usedVillainActionsThisRound || 0;
    this.listeners = [];
    this.actionHistory = [];
  }

  /**
   * Add an action to the creature
   * @param {Object} action - The action to add
   * @returns {LegendaryCreature} The creature instance for chaining
   */
  addAction(action) {
    if (!action.id) {
      action.id = generateId();
    }
    
    this.actions.push(action);
    this._notifyListeners('actionAdded', { action });
    return this;
  }

  /**
   * Remove an action from the creature
   * @param {string} actionId - The ID of the action to remove
   * @returns {boolean} True if the action was removed
   */
  removeAction(actionId) {
    const initialLength = this.actions.length;
    this.actions = this.actions.filter(action => action.id !== actionId);
    
    if (this.actions.length < initialLength) {
      this._notifyListeners('actionRemoved', { actionId });
      return true;
    }
    
    return false;
  }

  /**
   * Get all actions of a specific type
   * @param {string} type - The type of actions to get
   * @returns {Array} Actions of the specified type
   */
  getActionsByType(type) {
    return this.actions.filter(action => action.type === type);
  }

  /**
   * Get all available actions for the current state
   * @param {Object} state - The current combat state
   * @returns {Array} Available actions
   */
  getAvailableActions(state) {
    return this.actions.filter(action => {
      // Check if the action is available based on its type
      switch (action.type) {
        case SpecialActionType.LEGENDARY:
          return this.remainingLegendaryActions >= (action.cost || 1);
        
        case SpecialActionType.MYTHIC:
          return this.mythicPhaseActive && this.remainingMythicActions >= (action.cost || 1);
        
        case SpecialActionType.VILLAIN_ACTION:
          return this.usedVillainActionsThisRound < this.villainActionsPerRound;
        
        case SpecialActionType.PARAGON_ACTION:
          return this.currentParagonPhase > 0;
        
        case SpecialActionType.RECHARGE:
          const rechargeAbility = this.rechargeAbilities.find(ability => ability.actionId === action.id);
          return rechargeAbility && rechargeAbility.charged;
        
        case SpecialActionType.REACTION:
          return this._canUseReaction(action, state);
        
        case SpecialActionType.BONUS_ACTION:
          return state.isCreatureTurn && !state.usedBonusAction;
        
        default:
          return true;
      }
    });
  }

  /**
   * Check if a reaction can be used
   * @param {Object} reaction - The reaction to check
   * @param {Object} state - The current combat state
   * @returns {boolean} True if the reaction can be used
   * @private
   */
  _canUseReaction(reaction, state) {
    if (state.usedReaction) return false;
    
    // Check if the reaction trigger matches the current state
    if (!reaction.trigger || !state.trigger) return false;
    
    switch (reaction.trigger.type) {
      case 'attacked':
        return state.trigger.type === 'attacked' && 
               (!reaction.trigger.range || state.trigger.range <= reaction.trigger.range);
      
      case 'damaged':
        return state.trigger.type === 'damaged' && 
               (!reaction.trigger.damageType || state.trigger.damageType === reaction.trigger.damageType);
      
      case 'spell_cast':
        return state.trigger.type === 'spell_cast' && 
               (!reaction.trigger.spellLevel || state.trigger.spellLevel >= reaction.trigger.spellLevel);
      
      case 'movement':
        return state.trigger.type === 'movement' && 
               (!reaction.trigger.distance || state.trigger.distance >= reaction.trigger.distance);
      
      default:
        return false;
    }
  }

  /**
   * Use an action
   * @param {string} actionId - The ID of the action to use
   * @param {Object} state - The current combat state
   * @param {Object} options - Additional options
   * @returns {Object|null} The result of the action or null if action not found/available
   */
  useAction(actionId, state, options = {}) {
    const action = this.actions.find(a => a.id === actionId);
    
    if (!action) {
      console.warn(`Action with ID ${actionId} not found`);
      return null;
    }
    
    // Check if the action is available
    const availableActions = this.getAvailableActions(state);
    if (!availableActions.some(a => a.id === actionId)) {
      console.warn(`Action ${action.name} is not available in the current state`);
      return null;
    }
    
    // Apply the action's effects
    const result = this._applyActionEffects(action, state, options);
    
    // Update action usage based on type
    switch (action.type) {
      case SpecialActionType.LEGENDARY:
        this.remainingLegendaryActions -= (action.cost || 1);
        break;
      
      case SpecialActionType.MYTHIC:
        this.remainingMythicActions -= (action.cost || 1);
        break;
      
      case SpecialActionType.VILLAIN_ACTION:
        this.usedVillainActionsThisRound++;
        break;
      
      case SpecialActionType.RECHARGE:
        // Mark the ability as discharged
        const rechargeAbility = this.rechargeAbilities.find(ability => ability.actionId === action.id);
        if (rechargeAbility) {
          rechargeAbility.charged = false;
        }
        break;
      
      case SpecialActionType.REACTION:
        // Mark reaction as used
        if (state.setReactionUsed) {
          state.setReactionUsed(true);
        }
        break;
      
      case SpecialActionType.BONUS_ACTION:
        // Mark bonus action as used
        if (state.setBonusActionUsed) {
          state.setBonusActionUsed(true);
        }
        break;
    }
    
    // Record the action in history
    this.actionHistory.push({
      actionId,
      actionName: action.name,
      actionType: action.type,
      timestamp: new Date(),
      round: state.round || 0,
      result
    });
    
    // Notify listeners
    this._notifyListeners('actionUsed', { action, result, options });
    
    return result;
  }

  /**
   * Apply an action's effects
   * @param {Object} action - The action to apply
   * @param {Object} state - The current combat state
   * @param {Object} options - Additional options
   * @returns {Object} The result of the action
   * @private
   */
  _applyActionEffects(action, state, options) {
    const result = {
      success: true,
      effects: []
    };
    
    if (!action.effects) return result;
    
    action.effects.forEach(effect => {
      try {
        const effectResult = this._applyEffect(effect, state, options);
        result.effects.push(effectResult);
      } catch (error) {
        console.error(`Error applying effect for action ${action.name}:`, error);
        result.success = false;
      }
    });
    
    return result;
  }

  /**
   * Apply a single effect
   * @param {Object} effect - The effect to apply
   * @param {Object} state - The current combat state
   * @param {Object} options - Additional options
   * @returns {Object} The result of the effect
   * @private
   */
  _applyEffect(effect, state, options) {
    const result = {
      type: effect.type,
      success: true
    };
    
    switch (effect.type) {
      case 'damage':
        result.damageResult = this._applyDamageEffect(effect, state, options);
        break;
      
      case 'healing':
        result.healingResult = this._applyHealingEffect(effect, state, options);
        break;
      
      case 'condition':
        result.conditionResult = this._applyConditionEffect(effect, state, options);
        break;
      
      case 'movement':
        result.movementResult = this._applyMovementEffect(effect, state, options);
        break;
      
      case 'summon':
        result.summonResult = this._applySummonEffect(effect, state, options);
        break;
      
      case 'aoe':
        result.aoeResult = this._applyAoeEffect(effect, state, options);
        break;
      
      case 'save':
        result.saveResult = this._applySaveEffect(effect, state, options);
        break;
      
      case 'custom':
        // Custom effects are handled by the caller
        result.customData = effect.data;
        break;
    }
    
    return result;
  }

  /**
   * Apply a damage effect
   * @param {Object} effect - The effect to apply
   * @param {Object} state - The current combat state
   * @param {Object} options - Additional options
   * @returns {Object} The result of the damage effect
   * @private
   */
  _applyDamageEffect(effect, state, options) {
    const targets = this._resolveTargets(effect.targets, state, options);
    const result = {
      targets: [],
      totalDamage: 0
    };
    
    targets.forEach(target => {
      // Calculate damage for this target
      let damage = this._calculateDamage(effect, target, state);
      
      // Apply damage to the target
      if (typeof state.applyDamage === 'function') {
        const damageResult = state.applyDamage(target, damage, effect.damageType || 'unspecified');
        result.targets.push({
          id: target.id,
          name: target.name,
          damage: damageResult.damage,
          originalDamage: damage,
          damageType: effect.damageType,
          resistanceApplied: damageResult.resistanceApplied,
          immunityApplied: damageResult.immunityApplied,
          vulnerabilityApplied: damageResult.vulnerabilityApplied
        });
        result.totalDamage += damageResult.damage;
      } else {
        // Fallback if no damage function is provided
        target.hp = Math.max(0, target.hp - damage);
        result.targets.push({
          id: target.id,
          name: target.name,
          damage,
          originalDamage: damage,
          damageType: effect.damageType
        });
        result.totalDamage += damage;
      }
    });
    
    return result;
  }

  /**
   * Apply a healing effect
   * @param {Object} effect - The effect to apply
   * @param {Object} state - The current combat state
   * @param {Object} options - Additional options
   * @returns {Object} The result of the healing effect
   * @private
   */
  _applyHealingEffect(effect, state, options) {
    const targets = this._resolveTargets(effect.targets, state, options);
    const result = {
      targets: [],
      totalHealing: 0
    };
    
    targets.forEach(target => {
      // Calculate healing for this target
      let healing = this._calculateHealing(effect, target, state);
      
      // Apply healing to the target
      if (typeof state.applyHealing === 'function') {
        const healingResult = state.applyHealing(target, healing);
        result.targets.push({
          id: target.id,
          name: target.name,
          healing: healingResult.healing,
          originalHealing: healing
        });
        result.totalHealing += healingResult.healing;
      } else {
        // Fallback if no healing function is provided
        const maxHp = target.maxHp || target.hp;
        target.hp = Math.min(maxHp, target.hp + healing);
        result.targets.push({
          id: target.id,
          name: target.name,
          healing,
          originalHealing: healing
        });
        result.totalHealing += healing;
      }
    });
    
    return result;
  }

  /**
   * Apply a condition effect
   * @param {Object} effect - The effect to apply
   * @param {Object} state - The current combat state
   * @param {Object} options - Additional options
   * @returns {Object} The result of the condition effect
   * @private
   */
  _applyConditionEffect(effect, state, options) {
    const targets = this._resolveTargets(effect.targets, state, options);
    const result = {
      targets: [],
      successes: 0,
      failures: 0
    };
    
    targets.forEach(target => {
      // Check for saving throw if applicable
      let saved = false;
      if (effect.savingThrow) {
        saved = this._checkSavingThrow(target, effect.savingThrow, state);
      }
      
      // Apply condition if target failed save or no save required
      if (!saved || (saved && !effect.savingThrow.negateOnSuccess)) {
        // Determine duration
        let duration = effect.duration;
        if (saved && effect.savingThrow.halfDurationOnSuccess) {
          duration = Math.ceil(duration / 2);
        }
        
        // Apply condition to the target
        if (typeof state.applyCondition === 'function') {
          const conditionResult = state.applyCondition(target, effect.condition, duration);
          result.targets.push({
            id: target.id,
            name: target.name,
            condition: effect.condition,
            duration,
            saved,
            success: conditionResult.success
          });
          
          if (conditionResult.success) {
            result.successes++;
          } else {
            result.failures++;
          }
        } else {
          // Fallback if no condition function is provided
          if (!target.conditions) target.conditions = [];
          target.conditions.push({
            name: effect.condition,
            duration
          });
          
          result.targets.push({
            id: target.id,
            name: target.name,
            condition: effect.condition,
            duration,
            saved,
            success: true
          });
          
          result.successes++;
        }
      } else {
        // Target saved and negates the effect
        result.targets.push({
          id: target.id,
          name: target.name,
          condition: effect.condition,
          saved,
          success: false
        });
        
        result.failures++;
      }
    });
    
    return result;
  }

  /**
   * Apply a movement effect
   * @param {Object} effect - The effect to apply
   * @param {Object} state - The current combat state
   * @param {Object} options - Additional options
   * @returns {Object} The result of the movement effect
   * @private
   */
  _applyMovementEffect(effect, state, options) {
    const targets = this._resolveTargets(effect.targets, state, options);
    const result = {
      targets: [],
      successes: 0,
      failures: 0
    };
    
    targets.forEach(target => {
      // Check for saving throw if applicable
      let saved = false;
      if (effect.savingThrow) {
        saved = this._checkSavingThrow(target, effect.savingThrow, state);
      }
      
      // Apply movement if target failed save or no save required
      if (!saved || (saved && !effect.savingThrow.negateOnSuccess)) {
        // Determine distance
        let distance = effect.distance;
        if (saved && effect.savingThrow.halfDistanceOnSuccess) {
          distance = Math.ceil(distance / 2);
        }
        
        // Apply movement to the target
        if (typeof state.moveTarget === 'function') {
          const movementResult = state.moveTarget(target, distance, effect.direction);
          result.targets.push({
            id: target.id,
            name: target.name,
            distance,
            direction: effect.direction,
            saved,
            success: movementResult.success,
            newPosition: movementResult.newPosition
          });
          
          if (movementResult.success) {
            result.successes++;
          } else {
            result.failures++;
          }
        } else {
          // No fallback for movement as it requires map integration
          result.targets.push({
            id: target.id,
            name: target.name,
            distance,
            direction: effect.direction,
            saved,
            success: false
          });
          
          result.failures++;
        }
      } else {
        // Target saved and negates the effect
        result.targets.push({
          id: target.id,
          name: target.name,
          saved,
          success: false
        });
        
        result.failures++;
      }
    });
    
    return result;
  }

  /**
   * Apply a summon effect
   * @param {Object} effect - The effect to apply
   * @param {Object} state - The current combat state
   * @param {Object} options - Additional options
   * @returns {Object} The result of the summon effect
   * @private
   */
  _applySummonEffect(effect, state, options) {
    if (!effect.creature) {
      return { success: false, reason: 'No creature specified' };
    }
    
    const result = {
      summonedCreatures: [],
      success: false
    };
    
    // Summon creatures
    if (typeof state.summonCreature === 'function') {
      const count = effect.count || 1;
      for (let i = 0; i < count; i++) {
        const summonResult = state.summonCreature(effect.creature, effect.position);
        
        if (summonResult.success) {
          result.summonedCreatures.push(summonResult.creature);
        }
      }
      
      result.success = result.summonedCreatures.length > 0;
    }
    
    return result;
  }

  /**
   * Apply an area of effect
   * @param {Object} effect - The effect to apply
   * @param {Object} state - The current combat state
   * @param {Object} options - Additional options
   * @returns {Object} The result of the area effect
   * @private
   */
  _applyAoeEffect(effect, state, options) {
    const result = {
      area: effect.area,
      targets: [],
      effects: []
    };
    
    // Get targets in the area
    let targets = [];
    if (typeof state.getCombatantsInArea === 'function') {
      targets = state.getCombatantsInArea(effect.area);
    } else if (state.combatants) {
      // Fallback: assume all combatants are affected
      targets = state.combatants;
    }
    
    result.targets = targets.map(t => ({ id: t.id, name: t.name }));
    
    // Apply sub-effects to each target
    if (effect.effects) {
      effect.effects.forEach(subEffect => {
        // Override targets with the ones in the area
        const effectWithTargets = {
          ...subEffect,
          targets: { type: 'specific', ids: targets.map(t => t.id) }
        };
        
        const effectResult = this._applyEffect(effectWithTargets, state, options);
        result.effects.push(effectResult);
      });
    }
    
    return result;
  }

  /**
   * Apply a saving throw effect
   * @param {Object} effect - The effect to apply
   * @param {Object} state - The current combat state
   * @param {Object} options - Additional options
   * @returns {Object} The result of the saving throw effect
   * @private
   */
  _applySaveEffect(effect, state, options) {
    const targets = this._resolveTargets(effect.targets, state, options);
    const result = {
      targets: [],
      successes: 0,
      failures: 0
    };
    
    targets.forEach(target => {
      const saved = this._checkSavingThrow(target, effect, state);
      
      result.targets.push({
        id: target.id,
        name: target.name,
        saved
      });
      
      if (saved) {
        result.successes++;
      } else {
        result.failures++;
      }
      
      // Apply success and failure effects
      if (saved && effect.onSuccess) {
        const successEffects = Array.isArray(effect.onSuccess) ? effect.onSuccess : [effect.onSuccess];
        successEffects.forEach(successEffect => {
          // Override targets with just this target
          const effectWithTarget = {
            ...successEffect,
            targets: { type: 'specific', ids: [target.id] }
          };
          
          this._applyEffect(effectWithTarget, state, options);
        });
      } else if (!saved && effect.onFailure) {
        const failureEffects = Array.isArray(effect.onFailure) ? effect.onFailure : [effect.onFailure];
        failureEffects.forEach(failureEffect => {
          // Override targets with just this target
          const effectWithTarget = {
            ...failureEffect,
            targets: { type: 'specific', ids: [target.id] }
          };
          
          this._applyEffect(effectWithTarget, state, options);
        });
      }
    });
    
    return result;
  }

  /**
   * Resolve targets for an effect
   * @param {Object} targetSpec - The target specification
   * @param {Object} state - The current combat state
   * @param {Object} options - Additional options
   * @returns {Array} Array of target combatants
   * @private
   */
  _resolveTargets(targetSpec, state, options) {
    if (!targetSpec) {
      // Default to selected targets if no target spec is provided
      return options.targets || [];
    }
    
    if (!state.combatants) return [];
    
    switch (targetSpec.type) {
      case 'all':
        return state.combatants;
      
      case 'players':
        return state.combatants.filter(c => c.type === 'player');
      
      case 'monsters':
        return state.combatants.filter(c => c.type === 'monster');
      
      case 'allies':
        return state.combatants.filter(c => c.type === this.type);
      
      case 'enemies':
        return state.combatants.filter(c => c.type !== this.type);
      
      case 'self':
        return state.combatants.filter(c => c.id === this.id);
      
      case 'random':
        return this._getRandomTargets(state.combatants, targetSpec.count || 1);
      
      case 'area':
        if (typeof state.getCombatantsInArea === 'function') {
          return state.getCombatantsInArea(targetSpec.area);
        }
        return [];
      
      case 'specific':
        if (targetSpec.ids) {
          return state.combatants.filter(c => targetSpec.ids.includes(c.id));
        }
        return [];
      
      case 'selected':
        return options.targets || [];
      
      default:
        return [];
    }
  }

  /**
   * Get random targets from a list of combatants
   * @param {Array} combatants - List of combatants
   * @param {number} count - Number of targets to select
   * @returns {Array} Array of selected combatants
   * @private
   */
  _getRandomTargets(combatants, count) {
    if (!combatants || combatants.length === 0) return [];
    
    // Shuffle the array
    const shuffled = [...combatants].sort(() => 0.5 - Math.random());
    
    // Take the first n elements
    return shuffled.slice(0, Math.min(count, combatants.length));
  }

  /**
   * Calculate damage for an effect
   * @param {Object} effect - The damage effect
   * @param {Object} target - The target
   * @param {Object} state - The current combat state
   * @returns {number} The calculated damage
   * @private
   */
  _calculateDamage(effect, target, state) {
    if (typeof effect.damage === 'number') {
      return effect.damage;
    }
    
    if (typeof effect.damage === 'string' && effect.damage.includes('d')) {
      // Roll dice for damage
      if (typeof state.rollDice === 'function') {
        return state.rollDice(effect.damage);
      } else {
        // Simple dice rolling fallback
        return rollDice(effect.damage);
      }
    }
    
    return 0;
  }

  /**
   * Calculate healing for an effect
   * @param {Object} effect - The healing effect
   * @param {Object} target - The target
   * @param {Object} state - The current combat state
   * @returns {number} The calculated healing
   * @private
   */
  _calculateHealing(effect, target, state) {
    if (typeof effect.healing === 'number') {
      return effect.healing;
    }
    
    if (typeof effect.healing === 'string' && effect.healing.includes('d')) {
      // Roll dice for healing
      if (typeof state.rollDice === 'function') {
        return state.rollDice(effect.healing);
      } else {
        // Simple dice rolling fallback
        return rollDice(effect.healing);
      }
    }
    
    return 0;
  }

  /**
   * Check if a target succeeds on a saving throw
   * @param {Object} target - The target making the save
   * @param {Object} saveInfo - Information about the saving throw
   * @param {Object} state - The current combat state
   * @returns {boolean} True if the save succeeds
   * @private
   */
  _checkSavingThrow(target, saveInfo, state) {
    if (!saveInfo || !saveInfo.ability || !saveInfo.dc) {
      return false;
    }
    
    // Get the target's saving throw bonus
    let saveBonus = 0;
    
    if (target.savingThrows && target.savingThrows[saveInfo.ability]) {
      saveBonus = target.savingThrows[saveInfo.ability];
    } else if (target.abilities) {
      // Calculate from ability score
      const abilityScore = target.abilities[saveInfo.ability] || 10;
      saveBonus = Math.floor((abilityScore - 10) / 2);
    }
    
    // Roll the save
    let roll;
    if (typeof state.rollD20 === 'function') {
      roll = state.rollD20();
    } else {
      // Simple d20 roll fallback
      roll = Math.floor(Math.random() * 20) + 1;
    }
    
    // Check for advantage/disadvantage
    if (saveInfo.advantage) {
      const secondRoll = typeof state.rollD20 === 'function' ? state.rollD20() : Math.floor(Math.random() * 20) + 1;
      roll = Math.max(roll, secondRoll);
    } else if (saveInfo.disadvantage) {
      const secondRoll = typeof state.rollD20 === 'function' ? state.rollD20() : Math.floor(Math.random() * 20) + 1;
      roll = Math.min(roll, secondRoll);
    }
    
    // Natural 20 always succeeds, natural 1 always fails
    if (roll === 20) return true;
    if (roll === 1) return false;
    
    // Check if the save succeeds
    return (roll + saveBonus) >= saveInfo.dc;
  }

  /**
   * Reset legendary actions
   */
  resetLegendaryActions() {
    this.remainingLegendaryActions = this.maxLegendaryActions;
    this._notifyListeners('legendaryActionsReset', { 
      count: this.remainingLegendaryActions 
    });
  }

  /**
   * Reset mythic actions
   */
  resetMythicActions() {
    this.remainingMythicActions = this.maxMythicActions;
    this._notifyListeners('mythicActionsReset', { 
      count: this.remainingMythicActions 
    });
  }

  /**
   * Reset villain actions for a new round
   */
  resetVillainActions() {
    this.usedVillainActionsThisRound = 0;
    this._notifyListeners('villainActionsReset', { 
      count: this.villainActionsPerRound 
    });
  }

    /**
   * Activate mythic phase
   */
  activateMythicPhase() {
    this.mythicPhaseActive = true;
    this.resetMythicActions();
    this._notifyListeners('mythicPhaseActivated', {});
  }

  /**
   * Deactivate mythic phase
   */
  deactivateMythicPhase() {
    this.mythicPhaseActive = false;
    this.remainingMythicActions = 0;
    this._notifyListeners('mythicPhaseDeactivated', {});
  }

  /**
   * Advance to the next paragon phase
   * @returns {boolean} True if advanced to a new phase, false if no more phases
   */
  advanceParagonPhase() {
    if (this.currentParagonPhase < this.paragonPhases) {
      this.currentParagonPhase++;
      this._notifyListeners('paragonPhaseAdvanced', { 
        phase: this.currentParagonPhase,
        totalPhases: this.paragonPhases
      });
      return true;
    }
    return false;
  }

  /**
   * Attempt to recharge abilities
   * @param {Object} state - The current combat state
   */
  attemptRecharge(state) {
    this.rechargeAbilities.forEach(ability => {
      if (!ability.charged) {
        // Roll for recharge
        let roll;
        if (typeof state.rollD6 === 'function') {
          roll = state.rollD6();
        } else {
          // Simple d6 roll fallback
          roll = Math.floor(Math.random() * 6) + 1;
        }
        
        // Check if the ability recharges
        if (roll >= ability.threshold) {
          ability.charged = true;
          this._notifyListeners('abilityRecharged', { 
            abilityId: ability.actionId,
            roll
          });
        }
      }
    });
  }

  /**
   * Add a recharge ability
   * @param {string} actionId - The ID of the action that recharges
   * @param {number} threshold - The minimum roll required to recharge (1-6)
   * @param {boolean} initiallyCharged - Whether the ability starts charged
   * @returns {LegendaryCreature} The creature instance for chaining
   */
  addRechargeAbility(actionId, threshold = 5, initiallyCharged = true) {
    // Check if the action exists
    const action = this.actions.find(a => a.id === actionId);
    if (!action) {
      console.warn(`Action with ID ${actionId} not found`);
      return this;
    }
    
    // Set the action type to recharge
    action.type = SpecialActionType.RECHARGE;
    
    // Add to recharge abilities
    this.rechargeAbilities.push({
      actionId,
      threshold,
      charged: initiallyCharged
    });
    
    return this;
  }

  /**
   * Add a listener for legendary creature events
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
        console.error('Error in legendary creature listener:', error);
      }
    });
  }

  /**
   * Convert the legendary creature to a plain object for serialization
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      actions: this.actions,
      maxLegendaryActions: this.maxLegendaryActions,
      maxMythicActions: this.maxMythicActions,
      remainingLegendaryActions: this.remainingLegendaryActions,
      remainingMythicActions: this.remainingMythicActions,
      mythicPhaseActive: this.mythicPhaseActive,
      resistances: this.resistances,
      immunities: this.immunities,
      vulnerabilities: this.vulnerabilities,
      rechargeAbilities: this.rechargeAbilities,
      paragonPhases: this.paragonPhases,
      currentParagonPhase: this.currentParagonPhase,
      villainActionsPerRound: this.villainActionsPerRound,
      usedVillainActionsThisRound: this.usedVillainActionsThisRound
    };
  }

  /**
   * Create a legendary creature from a plain object
   * @param {Object} data - The plain object data
   * @returns {LegendaryCreature} A new legendary creature instance
   */
  static fromJSON(data) {
    return new LegendaryCreature(data);
  }
}

/**
 * Class representing a library of legendary action templates
 */
export class LegendaryActionLibrary {
  /**
   * Create a legendary action library
   */
  constructor() {
    this.templates = {};
    this.categories = {};
    this._initializeDefaultTemplates();
  }

  /**
   * Initialize default legendary action templates
   * @private
   */
  _initializeDefaultTemplates() {
    // Add default categories
    this.addCategory('dragon', 'Dragon Actions');
    this.addCategory('undead', 'Undead Actions');
    this.addCategory('fiend', 'Fiendish Actions');
    this.addCategory('fey', 'Fey Actions');
    this.addCategory('elemental', 'Elemental Actions');
    this.addCategory('aberration', 'Aberrant Actions');
    this.addCategory('monstrosity', 'Monstrous Actions');
    this.addCategory('celestial', 'Celestial Actions');
    
    // Add some default templates
    
    // Dragon legendary actions
    this.addTemplate({
      id: 'dragon_legendary_actions',
      name: 'Dragon Legendary Actions',
      category: 'dragon',
      description: 'Standard legendary actions for dragons.',
      maxLegendaryActions: 3,
      actions: [
        {
          id: 'dragon_tail_attack',
          name: 'Tail Attack',
          description: 'The dragon makes a tail attack.',
          type: SpecialActionType.LEGENDARY,
          cost: 1,
          effects: [
            {
              type: 'damage',
              damage: '2d8+6',
              damageType: 'bludgeoning',
              targets: { type: 'selected' },
              savingThrow: { ability: 'dex', dc: 15, halfOnSuccess: true }
            }
          ]
        },
        {
          id: 'dragon_wing_attack',
          name: 'Wing Attack',
          description: 'The dragon beats its wings, causing nearby creatures to be pushed back.',
          type: SpecialActionType.LEGENDARY,
          cost: 2,
          effects: [
            {
              type: 'aoe',
              area: { type: 'sphere', radius: 15 },
              effects: [
                {
                  type: 'damage',
                  damage: '2d6+6',
                  damageType: 'bludgeoning',
                  savingThrow: { ability: 'dex', dc: 15, halfOnSuccess: true }
                },
                {
                  type: 'movement',
                  distance: 15,
                  direction: 'away',
                  savingThrow: { ability: 'str', dc: 15, negateOnSuccess: true }
                }
              ]
            }
          ]
        },
        {
          id: 'dragon_frightful_presence',
          name: 'Frightful Presence',
          description: 'The dragon exudes an aura of fear, potentially frightening nearby creatures.',
          type: SpecialActionType.LEGENDARY,
          cost: 2,
          effects: [
            {
              type: 'condition',
              condition: 'frightened',
              duration: 1,
              targets: { type: 'area', area: { type: 'sphere', radius: 30 } },
              savingThrow: { ability: 'wis', dc: 15, negateOnSuccess: true }
            }
          ]
        }
      ]
    });
    
    // Undead legendary actions
    this.addTemplate({
      id: 'lich_legendary_actions',
      name: 'Lich Legendary Actions',
      category: 'undead',
      description: 'Legendary actions for a powerful undead spellcaster.',
      maxLegendaryActions: 3,
      actions: [
        {
          id: 'lich_cantrip',
          name: 'Cantrip',
          description: 'The lich casts a cantrip.',
          type: SpecialActionType.LEGENDARY,
          cost: 1,
          effects: [
            {
              type: 'damage',
              damage: '3d10',
              damageType: 'necrotic',
              targets: { type: 'selected' }
            }
          ]
        },
        {
          id: 'lich_paralyzing_touch',
          name: 'Paralyzing Touch',
          description: 'The lich uses its paralyzing touch.',
          type: SpecialActionType.LEGENDARY,
          cost: 2,
          effects: [
            {
              type: 'damage',
              damage: '3d6',
              damageType: 'cold',
              targets: { type: 'selected' }
            },
            {
              type: 'condition',
              condition: 'paralyzed',
              duration: 1,
              targets: { type: 'selected' },
              savingThrow: { ability: 'con', dc: 18, negateOnSuccess: true }
            }
          ]
        },
        {
          id: 'lich_frightening_gaze',
          name: 'Frightening Gaze',
          description: 'The lich fixes its gaze on one creature it can see within 10 feet of it.',
          type: SpecialActionType.LEGENDARY,
          cost: 2,
          effects: [
            {
              type: 'condition',
              condition: 'frightened',
              duration: 1,
              targets: { type: 'selected' },
              savingThrow: { ability: 'wis', dc: 18, negateOnSuccess: true }
            }
          ]
        },
        {
          id: 'lich_disrupt_life',
          name: 'Disrupt Life',
          description: 'Each non-undead creature within 20 feet of the lich must make a Constitution saving throw against the lich\'s spell save DC, taking 21 (6d6) necrotic damage on a failed save, or half as much damage on a successful one.',
          type: SpecialActionType.LEGENDARY,
          cost: 3,
          effects: [
            {
              type: 'aoe',
              area: { type: 'sphere', radius: 20 },
              effects: [
                {
                  type: 'damage',
                  damage: '6d6',
                  damageType: 'necrotic',
                  savingThrow: { ability: 'con', dc: 18, halfOnSuccess: true }
                }
              ]
            }
          ]
        }
      ]
    });
    
    // Fiend legendary actions
    this.addTemplate({
      id: 'pit_fiend_legendary_actions',
      name: 'Pit Fiend Legendary Actions',
      category: 'fiend',
      description: 'Legendary actions for a powerful devil.',
      maxLegendaryActions: 3,
      actions: [
        {
          id: 'pit_fiend_attack',
          name: 'Attack',
          description: 'The pit fiend makes one melee attack.',
          type: SpecialActionType.LEGENDARY,
          cost: 1,
          effects: [
            {
              type: 'damage',
              damage: '2d6+8',
              damageType: 'slashing',
              targets: { type: 'selected' }
            }
          ]
        },
        {
          id: 'pit_fiend_fireball',
          name: 'Fireball',
          description: 'The pit fiend hurls a ball of fire that explodes at a point it can see within 120 feet of it.',
          type: SpecialActionType.LEGENDARY,
          cost: 2,
          effects: [
            {
              type: 'aoe',
              area: { type: 'sphere', radius: 20 },
              effects: [
                {
                  type: 'damage',
                  damage: '8d6',
                  damageType: 'fire',
                  savingThrow: { ability: 'dex', dc: 18, halfOnSuccess: true }
                }
              ]
            }
          ]
        },
        {
          id: 'pit_fiend_teleport',
          name: 'Teleport',
          description: 'The pit fiend magically teleports, along with any equipment it is wearing or carrying, up to 60 feet to an unoccupied space it can see.',
          type: SpecialActionType.LEGENDARY,
          cost: 2,
          effects: [
            {
              type: 'movement',
              distance: 60,
              direction: 'teleport',
              targets: { type: 'self' }
            }
          ]
        }
      ]
    });
    
    // Mythic actions
    this.addTemplate({
      id: 'dragon_mythic_actions',
      name: 'Dragon Mythic Actions',
      category: 'dragon',
      description: 'Mythic actions for an ancient dragon.',
      maxMythicActions: 2,
      actions: [
        {
          id: 'mythic_breath_weapon',
          name: 'Mythic Breath Weapon',
          description: 'The dragon recharges its breath weapon and uses it.',
          type: SpecialActionType.MYTHIC,
          cost: 1,
          effects: [
            {
              type: 'aoe',
              area: { type: 'cone', length: 90 },
              effects: [
                {
                  type: 'damage',
                  damage: '16d10',
                  damageType: 'fire',
                  savingThrow: { ability: 'dex', dc: 22, halfOnSuccess: true }
                }
              ]
            }
          ]
        },
        {
          id: 'mythic_shockwave',
          name: 'Mythic Shockwave',
          description: 'The dragon slams its tail into the ground, creating a shockwave.',
          type: SpecialActionType.MYTHIC,
          cost: 1,
          effects: [
            {
              type: 'aoe',
              area: { type: 'sphere', radius: 30 },
              effects: [
                {
                  type: 'damage',
                  damage: '4d10',
                  damageType: 'thunder',
                  savingThrow: { ability: 'dex', dc: 22, halfOnSuccess: true }
                },
                {
                  type: 'condition',
                  condition: 'prone',
                  duration: 1,
                  savingThrow: { ability: 'str', dc: 22, negateOnSuccess: true }
                }
              ]
            }
          ]
        },
        {
          id: 'mythic_recovery',
          name: 'Mythic Recovery',
          description: 'The dragon regains 10d12 hit points as its mythic power surges.',
          type: SpecialActionType.MYTHIC,
          cost: 2,
          effects: [
            {
              type: 'healing',
              healing: '10d12',
              targets: { type: 'self' }
            }
          ]
        }
      ]
    });
    
    // Villain actions
    this.addTemplate({
      id: 'villain_actions',
      name: 'Villain Actions',
      category: 'monstrosity',
      description: 'Special actions that a villain can take once per round.',
      villainActionsPerRound: 1,
      actions: [
        {
          id: 'villain_counterattack',
          name: 'Counterattack',
          description: 'When the villain is hit by an attack, they can immediately make an attack against their attacker.',
          type: SpecialActionType.VILLAIN_ACTION,
          effects: [
            {
              type: 'damage',
              damage: '2d8+5',
              damageType: 'slashing',
              targets: { type: 'selected' }
            }
          ]
        },
        {
          id: 'villain_rally',
          name: 'Rally Minions',
          description: 'The villain rallies their minions, granting them advantage on their next attack.',
          type: SpecialActionType.VILLAIN_ACTION,
          effects: [
            {
              type: 'custom',
              data: {
                effect: 'advantage_on_next_attack',
                duration: 1
              },
              targets: { type: 'allies' }
            }
          ]
        },
        {
          id: 'villain_escape',
          name: 'Tactical Retreat',
          description: 'The villain moves up to their speed without provoking opportunity attacks.',
          type: SpecialActionType.VILLAIN_ACTION,
          effects: [
            {
              type: 'movement',
              distance: 30,
              direction: 'any',
              targets: { type: 'self' }
            }
          ]
        }
      ]
    });
    
    // Paragon actions
    this.addTemplate({
      id: 'paragon_actions',
      name: 'Paragon Actions',
      category: 'monstrosity',
      description: 'Actions for a paragon monster with multiple phases.',
      paragonPhases: 3,
      actions: [
        {
          id: 'paragon_phase_shift',
          name: 'Phase Shift',
          description: 'The creature shifts to its next form, regaining some hit points and gaining new abilities.',
          type: SpecialActionType.PARAGON_ACTION,
          effects: [
            {
              type: 'healing',
              healing: '50',
              targets: { type: 'self' }
            },
            {
              type: 'custom',
              data: {
                effect: 'transform',
                newForm: 'next_phase'
              },
              targets: { type: 'self' }
            }
          ]
        },
        {
          id: 'paragon_multi_attack',
          name: 'Multi-Attack',
          description: 'The creature makes multiple attacks as part of a single action.',
          type: SpecialActionType.PARAGON_ACTION,
          effects: [
            {
              type: 'damage',
              damage: '2d8+5',
              damageType: 'slashing',
              targets: { type: 'selected' }
            },
            {
              type: 'damage',
              damage: '2d8+5',
              damageType: 'slashing',
              targets: { type: 'selected' }
            }
          ]
        },
        {
          id: 'paragon_aoe_attack',
          name: 'Area Attack',
          description: 'The creature makes an attack that affects multiple targets.',
          type: SpecialActionType.PARAGON_ACTION,
          effects: [
            {
              type: 'aoe',
              area: { type: 'sphere', radius: 15 },
              effects: [
                {
                  type: 'damage',
                  damage: '4d6',
                  damageType: 'force',
                  savingThrow: { ability: 'dex', dc: 15, halfOnSuccess: true }
                }
              ]
            }
          ]
        }
      ]
    });
    
    // Reaction templates
    this.addTemplate({
      id: 'common_reactions',
      name: 'Common Reactions',
      category: 'monstrosity',
      description: 'Common reaction abilities for monsters.',
      actions: [
        {
          id: 'shield_parry',
          name: 'Shield Parry',
          description: 'The creature uses its shield to block an attack, potentially increasing its AC against that attack.',
          type: SpecialActionType.REACTION,
          trigger: { type: 'attacked', range: 5 },
          effects: [
            {
              type: 'custom',
              data: {
                effect: 'increase_ac',
                amount: 2,
                duration: 1
              },
              targets: { type: 'self' }
            }
          ]
        },
        {
          id: 'opportunity_attack',
          name: 'Opportunity Attack',
          description: 'The creature makes an attack against a target that moves out of its reach.',
          type: SpecialActionType.REACTION,
          trigger: { type: 'movement', distance: 5 },
          effects: [
            {
              type: 'damage',
              damage: '1d8+4',
              damageType: 'slashing',
              targets: { type: 'selected' }
            }
          ]
        },
        {
          id: 'spell_reflection',
          name: 'Spell Reflection',
          description: 'When the creature succeeds on a saving throw against a spell, it can reflect the spell back at the caster.',
          type: SpecialActionType.REACTION,
          trigger: { type: 'spell_cast', spellLevel: 1 },
          effects: [
            {
              type: 'custom',
              data: {
                effect: 'reflect_spell'
              },
              targets: { type: 'selected' }
            }
          ]
        }
      ]
    });
    
    // Recharge abilities
    this.addTemplate({
      id: 'recharge_abilities',
      name: 'Recharge Abilities',
      category: 'monstrosity',
      description: 'Abilities that recharge on a dice roll.',
      rechargeAbilities: [
        {
          actionId: 'breath_weapon',
          threshold: 5,
          charged: true
        }
      ],
      actions: [
        {
          id: 'breath_weapon',
          name: 'Breath Weapon (Recharge 5-6)',
          description: 'The creature exhales destructive energy in a 30-foot cone.',
          type: SpecialActionType.RECHARGE,
          effects: [
            {
              type: 'aoe',
              area: { type: 'cone', length: 30 },
              effects: [
                {
                  type: 'damage',
                  damage: '8d6',
                  damageType: 'fire',
                  savingThrow: { ability: 'dex', dc: 15, halfOnSuccess: true }
                }
              ]
            }
          ]
        }
      ]
    });
  }

  /**
   * Add a category to the library
   * @param {string} id - The category ID
   * @param {string} name - The category name
   * @returns {LegendaryActionLibrary} The library instance for chaining
   */
  addCategory(id, name) {
    this.categories[id] = { id, name };
    return this;
  }

  /**
   * Get all categories
   * @returns {Object} The categories
   */
  getCategories() {
    return { ...this.categories };
  }

  /**
   * Add a template to the library
   * @param {Object} template - The template to add
   * @returns {LegendaryActionLibrary} The library instance for chaining
   */
  addTemplate(template) {
    if (!template.id) {
      template.id = generateId();
    }
    
    this.templates[template.id] = template;
    return this;
  }

  /**
   * Get a template by ID
   * @param {string} id - The template ID
   * @returns {Object|null} The template or null if not found
   */
  getTemplate(id) {
    return this.templates[id] || null;
  }

  /**
   * Get all templates
   * @returns {Object} All templates
   */
  getAllTemplates() {
    return { ...this.templates };
  }

  /**
   * Get templates by category
   * @param {string} categoryId - The category ID
   * @returns {Array} Templates in the category
   */
  getTemplatesByCategory(categoryId) {
    return Object.values(this.templates).filter(
      template => template.category === categoryId
    );
  }

  /**
   * Remove a template from the library
   * @param {string} id - The template ID
   * @returns {boolean} True if the template was removed
   */
  removeTemplate(id) {
    if (this.templates[id]) {
      delete this.templates[id];
      return true;
    }
    return false;
  }

  /**
   * Create a legendary creature from a template
   * @param {string} templateId - The template ID
   * @param {Object} options - Additional options for the creature
   * @returns {LegendaryCreature|null} The created creature or null if template not found
   */
  createCreatureFromTemplate(templateId, options = {}) {
    const template = this.getTemplate(templateId);
    
    if (!template) {
      console.warn(`Template with ID ${templateId} not found`);
      return null;
    }
    
    // Create a deep copy of the template actions
    const actions = JSON.parse(JSON.stringify(template.actions || []));
    
    // Create the creature
    const creature = new LegendaryCreature({
      name: options.name || template.name,
      actions,
      maxLegendaryActions: options.maxLegendaryActions || template.maxLegendaryActions || 3,
      maxMythicActions: options.maxMythicActions || template.maxMythicActions || 0,
      mythicPhaseActive: options.mythicPhaseActive || template.mythicPhaseActive || false,
      resistances: options.resistances || template.resistances || [],
      immunities: options.immunities || template.immunities || [],
      vulnerabilities: options.vulnerabilities || template.vulnerabilities || [],
      paragonPhases: options.paragonPhases || template.paragonPhases || 0,
      villainActionsPerRound: options.villainActionsPerRound || template.villainActionsPerRound || 0
    });
    
    // Add recharge abilities if present
    if (template.rechargeAbilities) {
      template.rechargeAbilities.forEach(ability => {
        creature.addRechargeAbility(
          ability.actionId,
          ability.threshold,
          ability.charged
        );
      });
    }
    
    return creature;
  }

  /**
   * Search for templates by name or description
   * @param {string} query - The search query
   * @returns {Array} Matching templates
   */
  searchTemplates(query) {
    if (!query) return [];
    
    const normalizedQuery = query.toLowerCase();
    
    return Object.values(this.templates).filter(template => {
      return (
        template.name.toLowerCase().includes(normalizedQuery) ||
        template.description.toLowerCase().includes(normalizedQuery)
      );
    });
  }

  /**
   * Import templates from JSON
   * @param {string} json - JSON string of templates
   * @returns {number} Number of templates imported
   */
  importFromJSON(json) {
    try {
      const data = JSON.parse(json);
      
      if (!data.templates || !Array.isArray(data.templates)) {
        console.error('Invalid template data: templates array missing');
        return 0;
      }
      
      let importCount = 0;
      
      // Import categories first
      if (data.categories && Array.isArray(data.categories)) {
        data.categories.forEach(category => {
          if (category.id && category.name) {
            this.addCategory(category.id, category.name);
          }
        });
      }
      
      // Import templates
      data.templates.forEach(template => {
        if (template.id && template.name) {
          this.addTemplate(template);
          importCount++;
        }
      });
      
      return importCount;
    } catch (error) {
      console.error('Error importing templates:', error);
      return 0;
    }
  }

  /**
   * Export templates to JSON
   * @param {Array} templateIds - IDs of templates to export (all if not specified)
   * @returns {string} JSON string of templates
   */
  exportToJSON(templateIds = null) {
    const templates = templateIds 
      ? templateIds.map(id => this.templates[id]).filter(Boolean)
      : Object.values(this.templates);
    
    const categories = Object.values(this.categories);
    
    return JSON.stringify({
      categories,
      templates,
      version: '2.3.1',
      exportDate: new Date().toISOString()
    }, null, 2);
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
 * Roll dice based on a dice notation string
 * @param {string} notation - The dice notation (e.g., "2d6+3")
 * @returns {number} The result of the roll
 */
function rollDice(notation) {
  // Simple dice roller implementation
  try {
    // Parse the notation
    const match = notation.match(/^(\d+)d(\d+)(?:([+-])(\d+))?$/i);
    
    if (!match) {
      console.warn(`Invalid dice notation: ${notation}`);
      return 0;
    }
    
    const count = parseInt(match[1], 10);
    const sides = parseInt(match[2], 10);
    const operator = match[3] || '';
    const modifier = match[4] ? parseInt(match[4], 10) : 0;
    
    // Roll the dice
    let total = 0;
    for (let i = 0; i < count; i++) {
      total += Math.floor(Math.random() * sides) + 1;
    }
    
    // Apply modifier
    if (operator === '+') {
      total += modifier;
    } else if (operator === '-') {
      total -= modifier;
    }
    
    return total;
  } catch (error) {
    console.error('Error rolling dice:', error);
    return 0;
  }
}

/**
 * Create a new legendary creature
 * @param {Object} config - Creature configuration
 * @returns {LegendaryCreature} A new legendary creature instance
 */
export function createLegendaryCreature(config = {}) {
  return new LegendaryCreature(config);
}

/**
 * Create a new legendary action library
 * @returns {LegendaryActionLibrary} A new legendary action library instance
 */
export function createLegendaryActionLibrary() {
  return new LegendaryActionLibrary();
}

/**
 * Class for managing legendary resistance
 */
export class LegendaryResistance {
  /**
   * Create a legendary resistance manager
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    this.maxUses = config.maxUses || 3;
    this.remainingUses = config.remainingUses !== undefined ? config.remainingUses : this.maxUses;
    this.creatureId = config.creatureId;
    this.listeners = [];
  }

  /**
   * Use legendary resistance to succeed on a saving throw
   * @returns {boolean} True if legendary resistance was used successfully
   */
  useResistance() {
    if (this.remainingUses <= 0) {
      return false;
    }
    
    this.remainingUses--;
    this._notifyListeners('resistanceUsed', { 
      remainingUses: this.remainingUses,
      maxUses: this.maxUses
    });
    
    return true;
  }

  /**
   * Reset legendary resistance uses
   */
  reset() {
    this.remainingUses = this.maxUses;
    this._notifyListeners('resistanceReset', { 
      remainingUses: this.remainingUses,
      maxUses: this.maxUses
    });
  }

  /**
   * Add a listener for legendary resistance events
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
        console.error('Error in legendary resistance listener:', error);
      }
    });
  }

  /**
   * Convert the legendary resistance to a plain object for serialization
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      maxUses: this.maxUses,
      remainingUses: this.remainingUses,
      creatureId: this.creatureId
    };
  }

  /**
   * Create a legendary resistance from a plain object
   * @param {Object} data - The plain object data
   * @returns {LegendaryResistance} A new legendary resistance instance
   */
  static fromJSON(data) {
    return new LegendaryResistance(data);
  }
}

/**
 * Class for managing mythic traits
 */
export class MythicTrait {
  /**
   * Create a mythic trait manager
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    this.name = config.name || 'Mythic Trait';
    this.description = config.description || '';
    this.triggerCondition = config.triggerCondition || 'hp_threshold';
    this.triggerValue = config.triggerValue || 0;
    this.active = config.active || false;
    this.creatureId = config.creatureId;
    this.actions = config.actions || [];
    this.bonuses = config.bonuses || [];
    this.listeners = [];
  }

  /**
   * Activate the mythic trait
   * @returns {boolean} True if the trait was activated
   */
  activate() {
    if (this.active) {
      return false;
    }
    
    this.active = true;
    this._notifyListeners('traitActivated', { name: this.name });
    
    return true;
  }

  /**
   * Deactivate the mythic trait
   */
  deactivate() {
    if (!this.active) {
      return false;
    }
    
    this.active = false;
    this._notifyListeners('traitDeactivated', { name: this.name });
    
    return true;
  }

  /**
   * Check if the mythic trait should trigger based on a state
   * @param {Object} state - The current state to check against
   * @returns {boolean} True if the trait should trigger
   */
  shouldTrigger(state) {
    if (this.active) {
      return false; // Already active
    }
    
    switch (this.triggerCondition) {
      case 'hp_threshold':
        if (!state.creature) return false;
        const hpPercent = (state.creature.hp / state.creature.maxHp) * 100;
        return hpPercent <= this.triggerValue;
      
      case 'round_number':
        return state.round >= this.triggerValue;
      
      case 'damage_taken':
        return state.damageTaken >= this.triggerValue;
      
      case 'allies_defeated':
        return state.alliesDefeated >= this.triggerValue;
      
      case 'manual':
        return state.manualTrigger === true;
      
      default:
        return false;
    }
  }

  /**
   * Add a listener for mythic trait events
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
        console.error('Error in mythic trait listener:', error);
      }
    });
  }

  /**
   * Convert the mythic trait to a plain object for serialization
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      name: this.name,
      description: this.description,
      triggerCondition: this.triggerCondition,
      triggerValue: this.triggerValue,
      active: this.active,
      creatureId: this.creatureId,
      actions: this.actions,
      bonuses: this.bonuses
    };
  }

  /**
   * Create a mythic trait from a plain object
   * @param {Object} data - The plain object data
   * @returns {MythicTrait} A new mythic trait instance
   */
  static fromJSON(data) {
    return new MythicTrait(data);
  }
}

/**
 * Create a legendary resistance manager
 * @param {Object} config - Configuration options
 * @returns {LegendaryResistance} A new legendary resistance instance
 */
export function createLegendaryResistance(config = {}) {
  return new LegendaryResistance(config);
}

/**
 * Create a mythic trait
 * @param {Object} config - Configuration options
 * @returns {MythicTrait} A new mythic trait instance
 */
export function createMythicTrait(config = {}) {
  return new MythicTrait(config);
}

/**
 * Get predefined legendary action templates for a creature type
 * @param {string} creatureType - The type of creature
 * @returns {Object|null} Predefined legendary actions or null if not found
 */
export function getPredefinedLegendaryActions(creatureType) {
  const library = new LegendaryActionLibrary();
  
  // Map creature types to template categories
  const typeToCategory = {
    'dragon': 'dragon',
    'undead': 'undead',
    'fiend': 'fiend',
    'fey': 'fey',
    'elemental': 'elemental',
    'aberration': 'aberration',
    'monstrosity': 'monstrosity',
    'celestial': 'celestial'
  };
  
  const category = typeToCategory[creatureType.toLowerCase()] || null;
  if (!category) return null;
  
  // Get templates for this category
  const templates = library.getTemplatesByCategory(category);
  
  // Return the first template if found
  return templates.length > 0 ? templates[0] : null;
}

// Export the main legendary functions
export default {
  createLegendaryCreature,
  createLegendaryActionLibrary,
  createLegendaryResistance,
  createMythicTrait,
  getPredefinedLegendaryActions,
  SpecialActionType
};
