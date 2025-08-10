/**
 * Jesster's Combat Tracker
 * AI Module
 * Version 2.3.1
 * 
 * This module provides AI functionality for the combat tracker,
 * including monster behavior, combat suggestions, and automated actions.
 */

import { rollDice } from './dice.js';
import { getConditionById } from './conditions.js';
import { calculateModifier, calculateCR } from './utils.js';

/**
 * AI difficulty levels
 */
export const AIDifficulty = {
  BASIC: 'basic',      // Simple, predictable behavior
  STANDARD: 'standard', // Balanced, somewhat strategic
  ADVANCED: 'advanced',  // More complex, tactical behavior
  EXPERT: 'expert'     // Highly optimized, challenging behavior
};

/**
 * AI behavior types
 */
export const AIBehaviorType = {
  AGGRESSIVE: 'aggressive',   // Focuses on dealing maximum damage
  DEFENSIVE: 'defensive',     // Prioritizes survival and protection
  SUPPORT: 'support',         // Focuses on buffing allies and debuffing enemies
  BALANCED: 'balanced',       // Mix of offensive and defensive actions
  COWARDLY: 'cowardly',       // Tries to avoid damage, may flee
  BERSERK: 'berserk',         // Attacks with disregard for self-preservation
  PROTECTIVE: 'protective',    // Prioritizes protecting allies
  TACTICAL: 'tactical'        // Makes decisions based on battlefield positioning
};

/**
 * Class representing the AI system
 */
export class CombatAI {
  constructor(difficulty = AIDifficulty.STANDARD) {
    this.difficulty = difficulty;
    this.memory = new Map(); // Store information about combatants
    this.threatAssessments = new Map(); // Track threat levels
    this.behaviorOverrides = new Map(); // Custom behavior settings
  }

  /**
   * Set the difficulty level of the AI
   * @param {string} difficulty - The difficulty level
   */
  setDifficulty(difficulty) {
    if (Object.values(AIDifficulty).includes(difficulty)) {
      this.difficulty = difficulty;
    } else {
      console.warn(`Invalid AI difficulty: ${difficulty}`);
    }
  }

  /**
   * Set a behavior override for a specific monster
   * @param {string} monsterId - The ID of the monster
   * @param {string} behaviorType - The behavior type to use
   * @param {Object} options - Additional behavior options
   */
  setBehaviorOverride(monsterId, behaviorType, options = {}) {
    if (Object.values(AIBehaviorType).includes(behaviorType)) {
      this.behaviorOverrides.set(monsterId, { type: behaviorType, options });
    } else {
      console.warn(`Invalid behavior type: ${behaviorType}`);
    }
  }

  /**
   * Clear a behavior override for a specific monster
   * @param {string} monsterId - The ID of the monster
   */
  clearBehaviorOverride(monsterId) {
    this.behaviorOverrides.delete(monsterId);
  }

  /**
   * Determine the next action for a monster
   * @param {Object} monster - The monster taking the action
   * @param {Array} combatants - All combatants in the encounter
   * @param {Object} environment - The current environment
   * @returns {Object} The recommended action
   */
  determineAction(monster, combatants, environment) {
    // Update memory and assess threats
    this._updateMemory(monster, combatants);
    this._assessThreats(monster, combatants);
    
    // Get behavior type (use override if available)
    const behaviorType = this._getBehaviorType(monster);
    
    // Filter out allies and enemies
    const allies = combatants.filter(c => c.type === monster.type || (c.faction && c.faction === monster.faction));
    const enemies = combatants.filter(c => c.type !== monster.type && (!c.faction || c.faction !== monster.faction));
    
    // Get available actions for the monster
    const availableActions = this._getAvailableActions(monster);
    
    // Determine the best action based on behavior type and difficulty
    switch (behaviorType) {
      case AIBehaviorType.AGGRESSIVE:
        return this._determineAggressiveAction(monster, availableActions, enemies, allies, environment);
      case AIBehaviorType.DEFENSIVE:
        return this._determineDefensiveAction(monster, availableActions, enemies, allies, environment);
      case AIBehaviorType.SUPPORT:
        return this._determineSupportAction(monster, availableActions, enemies, allies, environment);
      case AIBehaviorType.COWARDLY:
        return this._determineCowardlyAction(monster, availableActions, enemies, allies, environment);
      case AIBehaviorType.BERSERK:
        return this._determineBerserkAction(monster, availableActions, enemies, allies, environment);
      case AIBehaviorType.PROTECTIVE:
        return this._determineProtectiveAction(monster, availableActions, enemies, allies, environment);
      case AIBehaviorType.TACTICAL:
        return this._determineTacticalAction(monster, availableActions, enemies, allies, environment);
      case AIBehaviorType.BALANCED:
      default:
        return this._determineBalancedAction(monster, availableActions, enemies, allies, environment);
    }
  }

  /**
   * Get the behavior type for a monster
   * @param {Object} monster - The monster
   * @returns {string} The behavior type
   * @private
   */
  _getBehaviorType(monster) {
    // Check for behavior override
    if (this.behaviorOverrides.has(monster.id)) {
      return this.behaviorOverrides.get(monster.id).type;
    }
    
    // Check for monster-specific behavior
    if (monster.behavior && Object.values(AIBehaviorType).includes(monster.behavior)) {
      return monster.behavior;
    }
    
    // Determine behavior based on monster type and stats
    const hpPercentage = (monster.hp / monster.maxHp) * 100;
    
    // Wounded monsters may change behavior
    if (hpPercentage < 25) {
      // Low intelligence monsters become berserk when badly wounded
      if (monster.abilities && monster.abilities.int < 8) {
        return AIBehaviorType.BERSERK;
      }
      // Higher intelligence monsters become more defensive
      else if (monster.abilities && monster.abilities.int > 14) {
        return AIBehaviorType.DEFENSIVE;
      }
      // Average intelligence monsters may flee
      else {
        return AIBehaviorType.COWARDLY;
      }
    }
    
    // Default behaviors based on monster role or type
    if (monster.role === 'support' || (monster.spellcasting && monster.spellcasting.spells)) {
      return AIBehaviorType.SUPPORT;
    } else if (monster.role === 'defender' || monster.type === 'construct') {
      return AIBehaviorType.PROTECTIVE;
    } else if (monster.role === 'striker' || monster.type === 'fiend') {
      return AIBehaviorType.AGGRESSIVE;
    } else if (monster.role === 'controller' || monster.type === 'fey') {
      return AIBehaviorType.TACTICAL;
    }
    
    // Default to balanced behavior
    return AIBehaviorType.BALANCED;
  }

  /**
   * Update the AI's memory about combatants
   * @param {Object} monster - The monster whose memory is being updated
   * @param {Array} combatants - All combatants in the encounter
   * @private
   */
  _updateMemory(monster, combatants) {
    combatants.forEach(combatant => {
      if (!this.memory.has(combatant.id)) {
        this.memory.set(combatant.id, {
          firstSeen: Date.now(),
          knownHP: combatant.hp,
          knownMaxHP: combatant.maxHp,
          damageDealt: 0,
          healingReceived: 0,
          actionHistory: [],
          conditions: [...(combatant.conditions || [])]
        });
      } else {
        const memory = this.memory.get(combatant.id);
        
        // Track damage taken
        if (combatant.hp < memory.knownHP) {
          memory.damageDealt += (memory.knownHP - combatant.hp);
        }
        
        // Track healing received
        if (combatant.hp > memory.knownHP) {
          memory.healingReceived += (combatant.hp - memory.knownHP);
        }
        
        // Update known values
        memory.knownHP = combatant.hp;
        memory.knownMaxHP = combatant.maxHp;
        
        // Update conditions
        memory.conditions = [...(combatant.conditions || [])];
        
        this.memory.set(combatant.id, memory);
      }
    });
  }

  /**
   * Assess threat levels of enemies
   * @param {Object} monster - The monster assessing threats
   * @param {Array} combatants - All combatants in the encounter
   * @private
   */
  _assessThreats(monster, combatants) {
    const enemies = combatants.filter(c => c.type !== monster.type && (!c.faction || c.faction !== monster.faction));
    
    enemies.forEach(enemy => {
      let threatScore = 0;
      const memory = this.memory.get(enemy.id);
      
      // Base threat on damage dealt
      if (memory) {
        threatScore += memory.damageDealt * 2;
      }
      
      // Consider enemy's remaining HP
      const hpPercentage = (enemy.hp / enemy.maxHp) * 100;
      if (hpPercentage < 25) {
        threatScore *= 0.5; // Wounded enemies are less threatening
      }
      
      // Consider enemy's conditions
      if (enemy.conditions && enemy.conditions.length > 0) {
        const debilitatingConditions = ['paralyzed', 'stunned', 'unconscious', 'incapacitated'];
        const hasDebilitatingCondition = enemy.conditions.some(c => 
          debilitatingConditions.includes(c.id || c)
        );
        
        if (hasDebilitatingCondition) {
          threatScore *= 0.25; // Severely reduced threat if debilitated
        }
      }
      
      // Consider enemy's apparent role
      if (enemy.spellcasting && enemy.spellcasting.spells) {
        threatScore *= 1.5; // Spellcasters are more threatening
      }
      
      // Store the threat assessment
      this.threatAssessments.set(enemy.id, threatScore);
    });
  }

  /**
   * Get available actions for a monster
   * @param {Object} monster - The monster
   * @returns {Array} Available actions
   * @private
   */
  _getAvailableActions(monster) {
    const actions = [];
    
    // Add basic actions
    actions.push({ type: 'dodge', name: 'Dodge', value: 'dodge' });
    actions.push({ type: 'dash', name: 'Dash', value: 'dash' });
    actions.push({ type: 'disengage', name: 'Disengage', value: 'disengage' });
    actions.push({ type: 'hide', name: 'Hide', value: 'hide' });
    
    // Add monster-specific actions
    if (monster.actions) {
      monster.actions.forEach(action => {
        // Skip actions that can't be used (e.g., recharge abilities that aren't recharged)
        if (action.usage && action.usage.type === 'recharge' && !action.recharged) {
          return;
        }
        
        actions.push({
          type: 'attack',
          name: action.name,
          value: action.name,
          action: action
        });
      });
    }
    
    // Add legendary actions if available and it's not the monster's turn
    if (monster.legendaryActions && !monster.isActive) {
      monster.legendaryActions.forEach(action => {
        actions.push({
          type: 'legendary',
          name: `Legendary: ${action.name}`,
          value: action.name,
          action: action,
          cost: action.cost || 1
        });
      });
    }
    
    // Add spells if the monster can cast spells
    if (monster.spellcasting && monster.spellcasting.spells) {
      // Add cantrips
      if (monster.spellcasting.spells.cantrips) {
        monster.spellcasting.spells.cantrips.forEach(spell => {
          actions.push({
            type: 'spell',
            name: `Spell: ${spell}`,
            value: spell,
            level: 0,
            spell: spell
          });
        });
      }
      
      // Add leveled spells if slots are available
      for (let level = 1; level <= 9; level++) {
        const levelKey = `level${level}`;
        if (monster.spellcasting.spells[levelKey] && 
            monster.spellcasting.slots && 
            monster.spellcasting.slots[levelKey] > 0) {
          monster.spellcasting.spells[levelKey].forEach(spell => {
            actions.push({
              type: 'spell',
              name: `Spell (${level}): ${spell}`,
              value: spell,
              level: level,
              spell: spell
            });
          });
        }
      }
    }
    
    return actions;
  }

  /**
   * Determine the best aggressive action
   * @param {Object} monster - The monster taking the action
   * @param {Array} availableActions - Available actions
   * @param {Array} enemies - Enemy combatants
   * @param {Array} allies - Allied combatants
   * @param {Object} environment - The current environment
   * @returns {Object} The recommended action
   * @private
   */
  _determineAggressiveAction(monster, availableActions, enemies, allies, environment) {
    if (enemies.length === 0) {
      return { type: 'none', description: 'No enemies to attack' };
    }
    
    // Prioritize attack actions
    const attackActions = availableActions.filter(a => a.type === 'attack');
    if (attackActions.length > 0) {
      // Find the attack that would deal the most damage
      let bestAttack = attackActions[0];
      let highestDamage = this._estimateAttackDamage(bestAttack.action);
      
      attackActions.forEach(attack => {
        const estimatedDamage = this._estimateAttackDamage(attack.action);
        if (estimatedDamage > highestDamage) {
          highestDamage = estimatedDamage;
          bestAttack = attack;
        }
      });
      
      // Find the best target based on threat and vulnerability
      const bestTarget = this._findBestTarget(enemies, bestAttack.action);
      
      return {
        type: 'attack',
        action: bestAttack.action,
        target: bestTarget,
        description: `Attack ${bestTarget.name} with ${bestAttack.name}`
      };
    }
    
    // If no attack actions, try spells
    const damageSpells = availableActions.filter(a => a.type === 'spell' && this._isOffensiveSpell(a.spell));
    if (damageSpells.length > 0) {
      // Sort by spell level (highest first)
      damageSpells.sort((a, b) => b.level - a.level);
      
      const bestSpell = damageSpells[0];
      const targets = this._findSpellTargets(bestSpell.spell, enemies);
      
      return {
        type: 'spell',
        spell: bestSpell.spell,
        level: bestSpell.level,
        targets: targets,
        description: `Cast ${bestSpell.spell} at ${targets.map(t => t.name).join(', ')}`
      };
    }
    
    // If no attacks or spells, use a basic action
    if (this._shouldDodge(monster, enemies)) {
      return { type: 'dodge', description: 'Take the Dodge action' };
    }
    
    return { type: 'dash', description: 'Take the Dash action to close distance' };
  }

  /**
   * Determine the best defensive action
   * @param {Object} monster - The monster taking the action
   * @param {Array} availableActions - Available actions
   * @param {Array} enemies - Enemy combatants
   * @param {Array} allies - Allied combatants
   * @param {Object} environment - The current environment
   * @returns {Object} The recommended action
   * @private
   */
  _determineDefensiveAction(monster, availableActions, enemies, allies, environment) {
    // Check if monster is in danger
    const isInDanger = this._isInDanger(monster, enemies);
    
    // If in danger, prioritize defensive options
    if (isInDanger) {
      // Look for defensive spells
      const defensiveSpells = availableActions.filter(a => a.type === 'spell' && this._isDefensiveSpell(a.spell));
      if (defensiveSpells.length > 0) {
        // Sort by spell level (highest first)
        defensiveSpells.sort((a, b) => b.level - a.level);
        
        const bestSpell = defensiveSpells[0];
        return {
          type: 'spell',
          spell: bestSpell.spell,
          level: bestSpell.level,
          targets: [monster],
          description: `Cast ${bestSpell.spell} defensively`
        };
      }
      
      // Consider disengaging if surrounded
      const surroundingEnemies = this._getAdjacentEnemies(monster, enemies);
      if (surroundingEnemies.length > 1) {
        return { type: 'disengage', description: 'Take the Disengage action to retreat' };
      }
      
      // Dodge if no other good options
      return { type: 'dodge', description: 'Take the Dodge action for protection' };
    }
    
    // If not in immediate danger, consider a mix of offense and defense
    // Try to use ranged attacks or spells to stay at a safe distance
    const rangedAttacks = availableActions.filter(a => 
      a.type === 'attack' && a.action.attack && a.action.attack.type === 'ranged'
    );
    
    if (rangedAttacks.length > 0) {
      const bestAttack = rangedAttacks[0];
      const bestTarget = this._findBestTarget(enemies, bestAttack.action);
      
      return {
        type: 'attack',
        action: bestAttack.action,
        target: bestTarget,
        description: `Attack ${bestTarget.name} from a distance with ${bestAttack.name}`
      };
    }
    
    // If no ranged attacks, fall back to standard aggressive behavior but more cautiously
    return this._determineAggressiveAction(monster, availableActions, enemies, allies, environment);
  }

  /**
   * Determine the best support action
   * @param {Object} monster - The monster taking the action
   * @param {Array} availableActions - Available actions
   * @param {Array} enemies - Enemy combatants
   * @param {Array} allies - Allied combatants
   * @param {Object} environment - The current environment
   * @returns {Object} The recommended action
   * @private
   */
  _determineSupportAction(monster, availableActions, enemies, allies, environment) {
    // Check if any allies need healing
    const alliesNeedingHealing = allies.filter(ally => {
      const hpPercentage = (ally.hp / ally.maxHp) * 100;
      return hpPercentage < 50;
    });
    
    // Look for healing spells if allies need healing
    if (alliesNeedingHealing.length > 0) {
      const healingSpells = availableActions.filter(a => a.type === 'spell' && this._isHealingSpell(a.spell));
      if (healingSpells.length > 0) {
        // Sort by spell level (highest first)
        healingSpells.sort((a, b) => b.level - a.level);
        
        const bestSpell = healingSpells[0];
        // Target the most wounded ally
        alliesNeedingHealing.sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp));
        const target = alliesNeedingHealing[0];
        
        return {
          type: 'spell',
          spell: bestSpell.spell,
          level: bestSpell.level,
          targets: [target],
          description: `Cast ${bestSpell.spell} to heal ${target.name}`
        };
      }
    }
    
    // Look for buff spells for allies
    const buffSpells = availableActions.filter(a => a.type === 'spell' && this._isBuffSpell(a.spell));
    if (buffSpells.length > 0 && allies.length > 0) {
      // Sort by spell level (highest first)
      buffSpells.sort((a, b) => b.level - a.level);
      
      const bestSpell = buffSpells[0];
      // Target the ally that would benefit most (usually the strongest fighter)
      const target = this._findBestBuffTarget(allies);
      
      return {
        type: 'spell',
        spell: bestSpell.spell,
        level: bestSpell.level,
        targets: [target],
        description: `Cast ${bestSpell.spell} to buff ${target.name}`
      };
    }
    
    // Look for debuff spells for enemies
    const debuffSpells = availableActions.filter(a => a.type === 'spell' && this._isDebuffSpell(a.spell));
    if (debuffSpells.length > 0 && enemies.length > 0) {
      // Sort by spell level (highest first)
      debuffSpells.sort((a, b) => b.level - a.level);
      
      const bestSpell = debuffSpells[0];
      // Target the most threatening enemy
      const target = this._findMostThreateningEnemy(enemies);
      
      return {
        type: 'spell',
        spell: bestSpell.spell,
        level: bestSpell.level,
        targets: [target],
        description: `Cast ${bestSpell.spell} to debuff ${target.name}`
      };
    }
    
    // If no support actions are available, fall back to defensive behavior
    return this._determineDefensiveAction(monster, availableActions, enemies, allies, environment);
  }

  /**
   * Determine the best balanced action
   * @param {Object} monster - The monster taking the action
   * @param {Array} availableActions - Available actions
   * @param {Array} enemies - Enemy combatants
   * @param {Array} allies - Allied combatants
   * @param {Object} environment - The current environment
   * @returns {Object} The recommended action
   * @private
   */
  _determineBalancedAction(monster, availableActions, enemies, allies, environment) {
    // Check monster's health to determine if it should be more aggressive or defensive
    const hpPercentage = (monster.hp / monster.maxHp) * 100;
    
    if (hpPercentage < 30) {
      // Low health, be more defensive
      return this._determineDefensiveAction(monster, availableActions, enemies, allies, environment);
    } else if (hpPercentage > 70) {
      // High health, be more aggressive
      return this._determineAggressiveAction(monster, availableActions, enemies, allies, environment);
    }
    
    // Medium health, mix strategies
    // 50% chance to be aggressive, 30% chance to be defensive, 20% chance to be supportive
    const strategyRoll = Math.random() * 100;
    
    if (strategyRoll < 50) {
      return this._determineAggressiveAction(monster, availableActions, enemies, allies, environment);
    } else if (strategyRoll < 80) {
      return this._determineDefensiveAction(monster, availableActions, enemies, allies, environment);
    } else {
      return this._determineSupportAction(monster, availableActions, enemies, allies, environment);
    }
  }

  /**
   * Determine the best cowardly action
   * @param {Object} monster - The monster taking the action
   * @param {Array} availableActions - Available actions
   * @param {Array} enemies - Enemy combatants
   * @param {Array} allies - Allied combatants
   * @param {Object} environment - The current environment
   * @returns {Object} The recommended action
   * @private
   */
  _determineCowardlyAction(monster, availableActions, enemies, allies, environment) {
    // Check if monster is in danger
    const isInDanger = this._isInDanger(monster, enemies);
    
    // If in danger, prioritize escape
    if (isInDanger) {
      // Look for invisibility or similar escape spells
      const escapeSpells = availableActions.filter(a => 
        a.type === 'spell' && ['invisibility', 'misty step', 'dimension door', 'teleport'].includes(a.spell)
      );
      
      if (escapeSpells.length > 0) {
        const bestSpell = escapeSpells[0];
        return {
          type: 'spell',
          spell: bestSpell.spell,
          level: bestSpell.level,
          targets: [monster],
          description: `Cast ${bestSpell.spell} to escape`
        };
      }
      
      // If no escape spells, disengage and dash away
      return { type: 'disengage', description: 'Take the Disengage action to flee' };
    }
    
    // If not in immediate danger, consider ranged attacks
    const rangedAttacks = availableActions.filter(a => 
      a.type === 'attack' && a.action.attack && a.action.attack.type === 'ranged'
    );
    
    if (rangedAttacks.length > 0) {
      const bestAttack = rangedAttacks[0];
      const bestTarget = this._findBestTarget(enemies, bestAttack.action);
      
      return {
        type: 'attack',
        action: bestAttack.action,
        target: bestTarget,
        description: `Attack ${bestTarget.name} from a safe distance with ${bestAttack.name}`
      };
    }
    
    // If no ranged attacks, hide or dodge
    if (environment && environment.features && environment.features.some(f => f.provideCover)) {
      return { type: 'hide', description: 'Take the Hide action behind cover' };
    }
    
    return { type: 'dodge', description: 'Take the Dodge action defensively' };
  }

  /**
   * Determine the best berserk action
   * @param {Object} monster - The monster taking the action
   * @param {Array} availableActions - Available actions
   * @param {Array} enemies - Enemy combatants
   * @param {Array} allies - Allied combatants
   * @param {Object} environment - The current environment
   * @returns {Object} The recommended action
   * @private
   */
  _determineBerserkAction(monster, availableActions, enemies, allies, environment) {
    if (enemies.length === 0) {
      return { type: 'none', description: 'No enemies to attack' };
    }
    
    // Always prioritize the closest enemy
    const closestEnemy = this._findClosestEnemy(monster, enemies);
    
    // Prioritize melee attacks
    const meleeAttacks = availableActions.filter(a => 
      a.type === 'attack' && a.action.attack && a.action.attack.type === 'melee'
    );
    
    if (meleeAttacks.length > 0) {
      // Find the attack that would deal the most damage
      let bestAttack = meleeAttacks[0];
      let highestDamage = this._estimateAttackDamage(bestAttack.action);
      
      meleeAttacks.forEach(attack => {
        const estimatedDamage = this._estimateAttackDamage(attack.action);
        if (estimatedDamage > highestDamage) {
          highestDamage = estimatedDamage;
          bestAttack = attack;
        }
      });
      
      return {
        type: 'attack',
        action: bestAttack.action,
        target: closestEnemy,
        description: `Furiously attack ${closestEnemy.name} with ${bestAttack.name}`
      };
    }
    
    // If no melee attacks, dash toward the enemy
    return { 
      type: 'dash', 
      target: closestEnemy,
      description: `Dash toward ${closestEnemy.name} in a rage` 
    };
  }

  /**
   * Determine the best protective action
   * @param {Object} monster - The monster taking the action
   * @param {Array} availableActions - Available actions
   * @param {Array} enemies - Enemy combatants
   * @param {Array} allies - Allied combatants
   * @param {Object} environment - The current environment
   * @returns {Object} The recommended action
   * @private
   */
  _determineProtectiveAction(monster, availableActions, enemies, allies, environment) {
    if (allies.length === 0) {
      // No allies to protect, fall back to balanced behavior
      return this._determineBalancedAction(monster, availableActions, enemies, allies, environment);
    }
    
    // Find the most vulnerable ally
    const vulnerableAlly = allies.find(ally => {
      const hpPercentage = (ally.hp / ally.maxHp) * 100;
      return hpPercentage < 30;
    }) || allies[0];
    
    // Check if any enemies are threatening the vulnerable ally
    const threateningEnemies = enemies.filter(enemy => 
      this._isTargetingAlly(enemy, vulnerableAlly)
    );
    
    if (threateningEnemies.length > 0) {
      // Prioritize attacks against enemies threatening allies
      const attackActions = availableActions.filter(a => a.type === 'attack');
      if (attackActions.length > 0) {
        const bestAttack = attackActions[0];
        const bestTarget = threateningEnemies[0];
        
        return {
          type: 'attack',
          action: bestAttack.action,
          target: bestTarget,
          description: `Attack ${bestTarget.name} to protect ${vulnerableAlly.name}`
        };
      }
      
      // If no attacks available, try to position between the ally and enemies
      return { 
        type: 'protect', 
        target: vulnerableAlly,
        description: `Move to protect ${vulnerableAlly.name}` 
      };
    }
    
    // If no immediate threats to allies, look for protective spells
    const protectiveSpells = availableActions.filter(a => 
      a.type === 'spell' && this._isProtectiveSpell(a.spell)
    );
    
    if (protectiveSpells.length > 0) {
      const bestSpell = protectiveSpells[0];
           return {
        type: 'spell',
        spell: bestSpell.spell,
        level: bestSpell.level,
        targets: [vulnerableAlly],
        description: `Cast ${bestSpell.spell} to protect ${vulnerableAlly.name}`
      };
    }
    
    // If no protective options, position strategically and use dodge
    return { 
      type: 'dodge', 
      description: 'Take the Dodge action while protecting allies' 
    };
  }

  /**
   * Determine the best tactical action
   * @param {Object} monster - The monster taking the action
   * @param {Array} availableActions - Available actions
   * @param {Array} enemies - Enemy combatants
   * @param {Array} allies - Allied combatants
   * @param {Object} environment - The current environment
   * @returns {Object} The recommended action
   * @private
   */
  _determineTacticalAction(monster, availableActions, enemies, allies, environment) {
    // Tactical monsters consider battlefield control and positioning
    
    // Check if there are area control spells available
    const controlSpells = availableActions.filter(a => 
      a.type === 'spell' && this._isControlSpell(a.spell)
    );
    
    if (controlSpells.length > 0 && enemies.length > 1) {
      // Find groups of enemies for area effects
      const enemyGroups = this._findEnemyGroups(enemies);
      if (enemyGroups.length > 0) {
        // Sort groups by size (largest first)
        enemyGroups.sort((a, b) => b.length - a.length);
        
        const largestGroup = enemyGroups[0];
        if (largestGroup.length >= 2) {
          const bestSpell = controlSpells[0];
          return {
            type: 'spell',
            spell: bestSpell.spell,
            level: bestSpell.level,
            targets: largestGroup,
            description: `Cast ${bestSpell.spell} on group of ${largestGroup.length} enemies`
          };
        }
      }
    }
    
    // Check for tactical positioning opportunities
    const hasAdvantageousPosition = this._hasAdvantageousPosition(monster, enemies, environment);
    if (!hasAdvantageousPosition) {
      // Move to a better position
      return { 
        type: 'position', 
        description: 'Move to a tactically advantageous position' 
      };
    }
    
    // If already in a good position, consider the best attack
    const attackActions = availableActions.filter(a => a.type === 'attack');
    if (attackActions.length > 0) {
      // Find the most vulnerable target
      const vulnerableTarget = this._findMostVulnerableEnemy(enemies);
      
      // Find the best attack for this target
      let bestAttack = attackActions[0];
      attackActions.forEach(attack => {
        if (this._isAttackEffectiveAgainst(attack.action, vulnerableTarget)) {
          bestAttack = attack;
        }
      });
      
      return {
        type: 'attack',
        action: bestAttack.action,
        target: vulnerableTarget,
        description: `Tactically attack ${vulnerableTarget.name} with ${bestAttack.name}`
      };
    }
    
    // Fall back to balanced behavior if no tactical options are available
    return this._determineBalancedAction(monster, availableActions, enemies, allies, environment);
  }

  /**
   * Estimate the damage of an attack
   * @param {Object} action - The attack action
   * @returns {number} Estimated average damage
   * @private
   */
  _estimateAttackDamage(action) {
    if (!action.attack) {
      return 0;
    }
    
    let estimatedDamage = 0;
    
    // Calculate damage from dice formula
    if (action.attack.damage) {
      estimatedDamage = this._calculateAverageDamage(action.attack.damage);
    }
    
    // Add additional damage if present
    if (action.attack.additionalDamage) {
      estimatedDamage += this._calculateAverageDamage(action.attack.additionalDamage);
    }
    
    return estimatedDamage;
  }

  /**
   * Calculate average damage from a dice formula
   * @param {string} formula - The dice formula (e.g., "2d6+3")
   * @returns {number} Average damage
   * @private
   */
  _calculateAverageDamage(formula) {
    // Simple average calculation for common dice formulas
    const diceRegex = /(\d+)d(\d+)(?:\s*\+\s*(\d+))?/;
    const match = formula.match(diceRegex);
    
    if (!match) {
      return 0;
    }
    
    const numDice = parseInt(match[1], 10);
    const diceType = parseInt(match[2], 10);
    const modifier = match[3] ? parseInt(match[3], 10) : 0;
    
    // Average value of a die is (max + min) / 2
    const averageDieValue = (diceType + 1) / 2;
    return (numDice * averageDieValue) + modifier;
  }

  /**
   * Find the best target for an attack
   * @param {Array} enemies - Enemy combatants
   * @param {Object} action - The attack action
   * @returns {Object} The best target
   * @private
   */
  _findBestTarget(enemies, action) {
    if (enemies.length === 0) {
      return null;
    }
    
    // Sort enemies by threat level (highest first)
    const sortedEnemies = [...enemies].sort((a, b) => {
      const threatA = this.threatAssessments.get(a.id) || 0;
      const threatB = this.threatAssessments.get(b.id) || 0;
      return threatB - threatA;
    });
    
    // Prioritize enemies that are already wounded
    const woundedEnemies = sortedEnemies.filter(enemy => {
      const hpPercentage = (enemy.hp / enemy.maxHp) * 100;
      return hpPercentage < 50;
    });
    
    if (woundedEnemies.length > 0) {
      return woundedEnemies[0];
    }
    
    // If no wounded enemies, target the highest threat
    return sortedEnemies[0];
  }

  /**
   * Find targets for a spell
   * @param {string} spellName - The name of the spell
   * @param {Array} enemies - Enemy combatants
   * @returns {Array} Suitable targets
   * @private
   */
  _findSpellTargets(spellName, enemies) {
    // For area effect spells, find groups of enemies
    if (this._isAreaSpell(spellName)) {
      const enemyGroups = this._findEnemyGroups(enemies);
      if (enemyGroups.length > 0) {
        // Return the largest group
        return enemyGroups.reduce((largest, group) => 
          group.length > largest.length ? group : largest, []
        );
      }
    }
    
    // For single-target spells, find the most appropriate target
    if (this._isDebuffSpell(spellName)) {
      // Target the most threatening enemy
      return [this._findMostThreateningEnemy(enemies)];
    }
    
    if (this._isOffensiveSpell(spellName)) {
      // Target the most vulnerable enemy
      return [this._findMostVulnerableEnemy(enemies)];
    }
    
    // Default to the highest threat enemy
    return [this._findBestTarget(enemies, null)];
  }

  /**
   * Find groups of enemies that are close to each other
   * @param {Array} enemies - Enemy combatants
   * @returns {Array} Groups of enemies
   * @private
   */
  _findEnemyGroups(enemies) {
    const groups = [];
    const processed = new Set();
    
    enemies.forEach(enemy => {
      if (processed.has(enemy.id)) {
        return;
      }
      
      const group = [enemy];
      processed.add(enemy.id);
      
      // Find other enemies within 15 feet (typical AoE radius)
      enemies.forEach(other => {
        if (enemy.id !== other.id && !processed.has(other.id) && this._isWithinDistance(enemy, other, 15)) {
          group.push(other);
          processed.add(other.id);
        }
      });
      
      if (group.length > 1) {
        groups.push(group);
      }
    });
    
    return groups;
  }

  /**
   * Check if two combatants are within a certain distance
   * @param {Object} combatant1 - First combatant
   * @param {Object} combatant2 - Second combatant
   * @param {number} distance - Distance in feet
   * @returns {boolean} True if within distance
   * @private
   */
  _isWithinDistance(combatant1, combatant2, distance) {
    // If position data is available, use it
    if (combatant1.position && combatant2.position) {
      const dx = combatant1.position.x - combatant2.position.x;
      const dy = combatant1.position.y - combatant2.position.y;
      const actualDistance = Math.sqrt(dx * dx + dy * dy) * 5; // Assuming 5 feet per grid square
      return actualDistance <= distance;
    }
    
    // If no position data, use a simple approximation
    // Assume combatants are adjacent if they've attacked each other recently
    const memory1 = this.memory.get(combatant1.id);
    const memory2 = this.memory.get(combatant2.id);
    
    if (memory1 && memory1.actionHistory) {
      const recentActions = memory1.actionHistory.slice(-3);
      if (recentActions.some(action => action.target === combatant2.id)) {
        return true;
      }
    }
    
    if (memory2 && memory2.actionHistory) {
      const recentActions = memory2.actionHistory.slice(-3);
      if (recentActions.some(action => action.target === combatant1.id)) {
        return true;
      }
    }
    
    // Default to false if we can't determine
    return false;
  }

  /**
   * Find the most threatening enemy
   * @param {Array} enemies - Enemy combatants
   * @returns {Object} The most threatening enemy
   * @private
   */
  _findMostThreateningEnemy(enemies) {
    if (enemies.length === 0) {
      return null;
    }
    
    return enemies.reduce((mostThreatening, enemy) => {
      const threatA = this.threatAssessments.get(mostThreatening.id) || 0;
      const threatB = this.threatAssessments.get(enemy.id) || 0;
      return threatB > threatA ? enemy : mostThreatening;
    }, enemies[0]);
  }

  /**
   * Find the most vulnerable enemy
   * @param {Array} enemies - Enemy combatants
   * @returns {Object} The most vulnerable enemy
   * @private
   */
  _findMostVulnerableEnemy(enemies) {
    if (enemies.length === 0) {
      return null;
    }
    
    return enemies.reduce((mostVulnerable, enemy) => {
      const vulnerabilityA = this._calculateVulnerability(mostVulnerable);
      const vulnerabilityB = this._calculateVulnerability(enemy);
      return vulnerabilityB > vulnerabilityA ? enemy : mostVulnerable;
    }, enemies[0]);
  }

  /**
   * Calculate a vulnerability score for a combatant
   * @param {Object} combatant - The combatant
   * @returns {number} Vulnerability score
   * @private
   */
  _calculateVulnerability(combatant) {
    let score = 0;
    
    // Low HP increases vulnerability
    const hpPercentage = (combatant.hp / combatant.maxHp) * 100;
    score += (100 - hpPercentage) / 10;
    
    // Low AC increases vulnerability
    if (combatant.ac) {
      score += Math.max(0, 20 - combatant.ac);
    }
    
    // Debilitating conditions increase vulnerability
    if (combatant.conditions && combatant.conditions.length > 0) {
      const vulnerableConditions = ['prone', 'restrained', 'stunned', 'paralyzed'];
      combatant.conditions.forEach(condition => {
        const conditionId = condition.id || condition;
        if (vulnerableConditions.includes(conditionId)) {
          score += 5;
        }
      });
    }
    
    return score;
  }

  /**
   * Find the best ally to buff
   * @param {Array} allies - Allied combatants
   * @returns {Object} The best ally to buff
   * @private
   */
  _findBestBuffTarget(allies) {
    if (allies.length === 0) {
      return null;
    }
    
    // Prioritize allies that are actively fighting
    const fightingAllies = allies.filter(ally => {
      const memory = this.memory.get(ally.id);
      return memory && memory.damageDealt > 0;
    });
    
    if (fightingAllies.length > 0) {
      // Sort by damage dealt (highest first)
      fightingAllies.sort((a, b) => {
        const memoryA = this.memory.get(a.id);
        const memoryB = this.memory.get(b.id);
        return memoryB.damageDealt - memoryA.damageDealt;
      });
      
      return fightingAllies[0];
    }
    
    // If no allies are actively fighting, choose the one with highest HP
    return allies.reduce((strongest, ally) => 
      ally.hp > strongest.hp ? ally : strongest, allies[0]
    );
  }

  /**
   * Find the closest enemy to a combatant
   * @param {Object} combatant - The combatant
   * @param {Array} enemies - Enemy combatants
   * @returns {Object} The closest enemy
   * @private
   */
  _findClosestEnemy(combatant, enemies) {
    if (enemies.length === 0) {
      return null;
    }
    
    // If position data is available, use it
    if (combatant.position) {
      return enemies.reduce((closest, enemy) => {
        if (!enemy.position) {
          return closest;
        }
        
        const distanceToCurrent = this._calculateDistance(combatant, closest);
        const distanceToEnemy = this._calculateDistance(combatant, enemy);
        
        return distanceToEnemy < distanceToCurrent ? enemy : closest;
      }, enemies[0]);
    }
    
    // If no position data, use a simple approximation
    // Assume enemies that have attacked or been attacked recently are closer
    const memory = this.memory.get(combatant.id);
    if (memory && memory.actionHistory && memory.actionHistory.length > 0) {
      const recentTargets = memory.actionHistory
        .slice(-3)
        .map(action => action.target)
        .filter(target => target);
      
      if (recentTargets.length > 0) {
        const recentEnemy = enemies.find(enemy => recentTargets.includes(enemy.id));
        if (recentEnemy) {
          return recentEnemy;
        }
      }
    }
    
    // Default to a random enemy if we can't determine
    return enemies[Math.floor(Math.random() * enemies.length)];
  }

  /**
   * Calculate distance between two combatants
   * @param {Object} combatant1 - First combatant
   * @param {Object} combatant2 - Second combatant
   * @returns {number} Distance in feet
   * @private
   */
  _calculateDistance(combatant1, combatant2) {
    if (!combatant1.position || !combatant2.position) {
      return Infinity;
    }
    
    const dx = combatant1.position.x - combatant2.position.x;
    const dy = combatant1.position.y - combatant2.position.y;
    return Math.sqrt(dx * dx + dy * dy) * 5; // Assuming 5 feet per grid square
  }

  /**
   * Get enemies adjacent to a combatant
   * @param {Object} combatant - The combatant
   * @param {Array} enemies - Enemy combatants
   * @returns {Array} Adjacent enemies
   * @private
   */
  _getAdjacentEnemies(combatant, enemies) {
    return enemies.filter(enemy => this._isWithinDistance(combatant, enemy, 5));
  }

  /**
   * Check if a combatant is in danger
   * @param {Object} combatant - The combatant
   * @param {Array} enemies - Enemy combatants
   * @returns {boolean} True if in danger
   * @private
   */
  _isInDanger(combatant, enemies) {
    // Low HP is a danger sign
    const hpPercentage = (combatant.hp / combatant.maxHp) * 100;
    if (hpPercentage < 30) {
      return true;
    }
    
    // Multiple adjacent enemies is dangerous
    const adjacentEnemies = this._getAdjacentEnemies(combatant, enemies);
    if (adjacentEnemies.length > 1) {
      return true;
    }
    
    // Being targeted by ranged attackers while in the open is dangerous
    const rangedAttackers = enemies.filter(enemy => {
      const memory = this.memory.get(enemy.id);
      if (!memory || !memory.actionHistory) {
        return false;
      }
      
      return memory.actionHistory.some(action => 
        action.type === 'attack' && 
        action.attackType === 'ranged' && 
        action.target === combatant.id
      );
    });
    
    if (rangedAttackers.length > 0) {
      // Check if combatant has cover
      if (!combatant.hasCover) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Check if a monster should use the dodge action
   * @param {Object} monster - The monster
   * @param {Array} enemies - Enemy combatants
   * @returns {boolean} True if should dodge
   * @private
   */
  _shouldDodge(monster, enemies) {
    // Dodge if low on health and surrounded
    const hpPercentage = (monster.hp / monster.maxHp) * 100;
    const adjacentEnemies = this._getAdjacentEnemies(monster, enemies);
    
    return hpPercentage < 30 && adjacentEnemies.length > 0;
  }

  /**
   * Check if an enemy is targeting a specific ally
   * @param {Object} enemy - The enemy
   * @param {Object} ally - The ally
   * @returns {boolean} True if targeting
   * @private
   */
  _isTargetingAlly(enemy, ally) {
    const memory = this.memory.get(enemy.id);
    if (!memory || !memory.actionHistory || memory.actionHistory.length === 0) {
      return false;
    }
    
    // Check the last 3 actions
    const recentActions = memory.actionHistory.slice(-3);
    return recentActions.some(action => action.target === ally.id);
  }

  /**
   * Check if a monster has an advantageous position
   * @param {Object} monster - The monster
   * @param {Array} enemies - Enemy combatants
   * @param {Object} environment - The environment
   * @returns {boolean} True if has advantageous position
   * @private
   */
  _hasAdvantageousPosition(monster, enemies, environment) {
    // If the monster has cover, that's advantageous
    if (monster.hasCover) {
      return true;
    }
    
    // If the monster is on high ground, that's advantageous
    if (monster.position && monster.position.elevation > 0) {
      return true;
    }
    
    // If the monster is at optimal range for its attacks, that's advantageous
    const hasRangedAttacks = monster.actions && monster.actions.some(action => 
      action.attack && action.attack.type === 'ranged'
    );
    
    if (hasRangedAttacks) {
      // Check if any enemies are within 30 feet (too close for ranged)
      const tooCloseEnemies = enemies.filter(enemy => 
        this._isWithinDistance(monster, enemy, 30)
      );
      
      if (tooCloseEnemies.length === 0) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Check if an attack is effective against a target
   * @param {Object} attack - The attack
   * @param {Object} target - The target
   * @returns {boolean} True if effective
   * @private
   */
  _isAttackEffectiveAgainst(attack, target) {
    // If we know the target has vulnerabilities
    if (target.damageVulnerabilities && attack.attack.damageType) {
      if (target.damageVulnerabilities.includes(attack.attack.damageType)) {
        return true;
      }
    }
    
    // If we know the target has resistances
    if (target.damageResistances && attack.attack.damageType) {
      if (target.damageResistances.includes(attack.attack.damageType)) {
        return false;
      }
    }
    
    // If the target has low AC and this is an attack roll
    if (target.ac && attack.attack.toHit) {
      if (target.ac < 13 && attack.attack.toHit > 5) {
        return true;
      }
    }
    
    // If the target has failed saving throws of this type before
    if (attack.attack.savingThrow) {
      const memory = this.memory.get(target.id);
      if (memory && memory.actionHistory) {
        const similarSaves = memory.actionHistory.filter(action => 
          action.type === 'savingThrow' && 
          action.ability === attack.attack.savingThrow.ability &&
          action.success === false
        );
        
        if (similarSaves.length > 0) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Check if a spell is an offensive spell
   * @param {string} spellName - The name of the spell
   * @returns {boolean} True if offensive
   * @private
   */
  _isOffensiveSpell(spellName) {
    const offensiveSpells = [
      'fireball', 'magic missile', 'lightning bolt', 'cone of cold',
      'acid splash', 'fire bolt', 'eldritch blast', 'disintegrate',
      'chain lightning', 'meteor swarm', 'blight', 'cloudkill'
    ];
    
    return offensiveSpells.includes(spellName.toLowerCase());
  }

  /**
   * Check if a spell is a defensive spell
   * @param {string} spellName - The name of the spell
   * @returns {boolean} True if defensive
   * @private
   */
  _isDefensiveSpell(spellName) {
    const defensiveSpells = [
      'shield', 'mage armor', 'blur', 'mirror image', 'stoneskin',
      'fire shield', 'globe of invulnerability', 'sanctuary',
      'greater invisibility', 'invisibility'
    ];
    
    return defensiveSpells.includes(spellName.toLowerCase());
  }

  /**
   * Check if a spell is a healing spell
   * @param {string} spellName - The name of the spell
   * @returns {boolean} True if healing
   * @private
   */
  _isHealingSpell(spellName) {
    const healingSpells = [
      'cure wounds', 'healing word', 'mass cure wounds', 'heal',
      'mass healing word', 'regenerate', 'power word heal'
    ];
    
    return healingSpells.includes(spellName.toLowerCase());
  }

  /**
   * Check if a spell is a buff spell
   * @param {string} spellName - The name of the spell
   * @returns {boolean} True if buff
   * @private
   */
  _isBuffSpell(spellName) {
    const buffSpells = [
      'bless', 'haste', 'heroism', 'enhance ability', 'greater invisibility',
      'stoneskin', 'freedom of movement', 'death ward', 'holy weapon'
    ];
    
    return buffSpells.includes(spellName.toLowerCase());
  }

  /**
   * Check if a spell is a debuff spell
   * @param {string} spellName - The name of the spell
   * @returns {boolean} True if debuff
   * @private
   */
  _isDebuffSpell(spellName) {
    const debuffSpells = [
      'bane', 'slow', 'hold person', 'hold monster', 'blindness/deafness',
      'bestow curse', 'feeblemind', 'contagion', 'dominate person',
      'dominate monster'
    ];
    
    return debuffSpells.includes(spellName.toLowerCase());
  }

  /**
   * Check if a spell is a control spell
   * @param {string} spellName - The name of the spell
   * @returns {boolean} True if control
   * @private
   */
  _isControlSpell(spellName) {
    const controlSpells = [
      'web', 'entangle', 'grease', 'hypnotic pattern', 'sleet storm',
      'wall of fire', 'wall of force', 'forcecage', 'maze',
      'black tentacles', 'spike growth'
    ];
    
    return controlSpells.includes(spellName.toLowerCase());
  }

  /**
   * Check if a spell is a protective spell
   * @param {string} spellName - The name of the spell
   * @returns {boolean} True if protective
   * @private
   */
  _isProtectiveSpell(spellName) {
    const protectiveSpells = [
      'shield of faith', 'protection from evil and good', 'warding bond',
      'sanctuary', 'beacon of hope', 'death ward', 'aura of life',
      'aura of purity'
    ];
    
    return protectiveSpells.includes(spellName.toLowerCase());
  }

  /**
   * Check if a spell is an area effect spell
   * @param {string} spellName - The name of the spell
   * @returns {boolean} True if area effect
   * @private
   */
  _isAreaSpell(spellName) {
    const areaSpells = [
      'fireball', 'lightning bolt', 'cone of cold', 'burning hands',
      'thunderwave', 'shatter', 'spirit guardians', 'flame strike',
      'cloudkill', 'meteor swarm', 'sunburst', 'earthquake'
    ];
    
    return areaSpells.includes(spellName.toLowerCase());
  }
}

/**
 * Generate a combat suggestion for a player character
 * @param {Object} character - The player character
 * @param {Array} combatants - All combatants in the encounter
 * @param {Object} environment - The current environment
 * @returns {Object} Suggested action
 */
export function generateCombatSuggestion(character, combatants, environment) {
  // Create a temporary AI instance for generating suggestions
  const ai = new CombatAI(AIDifficulty.EXPERT);
  
  // Treat the character as a monster for AI purposes
  const monsterLikeCharacter = {
    ...character,
    type: 'player' // Ensure it's recognized as a player
  };
  
  // Use the AI to determine the best action
  return ai.determineAction(monsterLikeCharacter, combatants, environment);
}

/**
 * Generate a tactical assessment of the current combat situation
 * @param {Array} combatants - All combatants in the encounter
 * @param {Object} environment - The current environment
 * @returns {Object} Tactical assessment
 */
export function generateTacticalAssessment(combatants, environment) {
  const players = combatants.filter(c => c.type === 'player');
  const monsters = combatants.filter(c => c.type === 'monster');
  const npcs = combatants.filter(c => c.type === 'npc');
  
  // Calculate team health percentages
  const playerHealthPercentage = players.length > 0 ? 
    players.reduce((sum, p) => sum + (p.hp / p.maxHp), 0) / players.length * 100 : 0;
  
  const monsterHealthPercentage = monsters.length > 0 ? 
    monsters.reduce((sum, m) => sum + (m.hp / m.maxHp), 0) / monsters.length * 100 : 0;
  
  // Identify vulnerable combatants
  const vulnerablePlayers = players.filter(p => (p.hp / p.maxHp) < 0.3);
  const vulnerableMonsters = monsters.filter(m => (m.hp / m.maxHp) < 0.3);
  
  // Identify combatants with conditions
  const debuffedPlayers = players.filter(p => p.conditions && p.conditions.length > 0);
  const debuffedMonsters = monsters.filter(m => m.conditions && m.conditions.length > 0);
  
  // Estimate encounter difficulty
  let difficulty = 'moderate';
  if (playerHealthPercentage < 40 && monsterHealthPercentage > 60) {
    difficulty = 'deadly';
  } else if (playerHealthPercentage > 70 && monsterHealthPercentage < 30) {
    difficulty = 'easy';
  } else if (vulnerablePlayers.length > players.length / 3) {
    difficulty = 'hard';
  }
  
  // Generate tactical advice
  let advice = [];
  
  if (vulnerablePlayers.length > 0) {
    advice.push(`Protect or heal ${vulnerablePlayers.map(p => p.name).join(', ')}.`);
  }
  
  if (vulnerableMonsters.length > 0) {
    advice.push(`Focus attacks on ${vulnerableMonsters.map(m => m.name).join(', ')}.`);
  }
  
  if (debuffedPlayers.length > 0) {
    advice.push(`Remove conditions from ${debuffedPlayers.map(p => p.name).join(', ')}.`);
  }
  
  // Environmental advice
  if (environment) {
    if (environment.hazards && environment.hazards.length > 0) {
      advice.push(`Watch out for environmental hazards: ${environment.hazards.map(h => h.name).join(', ')}.`);
    }
    
        if (environment.features && environment.features.some(f => f.provideCover)) {
      advice.push("Use available cover to protect vulnerable allies.");
    }
  }
  
  return {
    difficulty,
    playerHealthPercentage,
    monsterHealthPercentage,
    vulnerablePlayers,
    vulnerableMonsters,
    debuffedPlayers,
    debuffedMonsters,
    advice
  };
}

/**
 * Generate a monster strategy based on its type and abilities
 * @param {Object} monster - The monster
 * @returns {Object} Strategy information
 */
export function generateMonsterStrategy(monster) {
  // Determine monster role based on stats and abilities
  let role = 'balanced';
  let tacticalNotes = [];
  
  // Check if monster has abilities
  if (monster.abilities) {
    const { str, dex, con, int, wis, cha } = monster.abilities;
    
    // High STR and CON suggests a tank/brute
    if (str >= 18 && con >= 16) {
      role = 'brute';
      tacticalNotes.push("This creature is physically powerful and can withstand significant damage.");
    }
    // High DEX suggests a skirmisher
    else if (dex >= 16 && dex > str) {
      role = 'skirmisher';
      tacticalNotes.push("This creature is agile and likely to use hit-and-run tactics.");
    }
    // High INT or WIS with spellcasting suggests a caster
    else if ((int >= 14 || wis >= 14) && monster.spellcasting) {
      role = 'caster';
      tacticalNotes.push("This creature relies on spells and should be kept at a distance.");
    }
    // High CHA suggests a leader or social manipulator
    else if (cha >= 16) {
      role = 'leader';
      tacticalNotes.push("This creature may have abilities that buff allies or control the battlefield.");
    }
  }
  
  // Check for special abilities that suggest tactics
  if (monster.traits) {
    // Check for regeneration
    const regeneration = monster.traits.find(trait => 
      trait.name.toLowerCase().includes('regeneration')
    );
    
    if (regeneration) {
      tacticalNotes.push("This creature regenerates hit points and will be difficult to take down without specific damage types.");
    }
    
    // Check for resistances and immunities
    if (monster.damageResistances && monster.damageResistances.length > 0) {
      tacticalNotes.push(`Resistant to: ${monster.damageResistances.join(', ')}.`);
    }
    
    if (monster.damageImmunities && monster.damageImmunities.length > 0) {
      tacticalNotes.push(`Immune to: ${monster.damageImmunities.join(', ')}.`);
    }
    
    if (monster.conditionImmunities && monster.conditionImmunities.length > 0) {
      tacticalNotes.push(`Immune to conditions: ${monster.conditionImmunities.join(', ')}.`);
    }
  }
  
  // Check for special movement types
  if (monster.speed) {
    const specialMovement = [];
    if (monster.speed.fly) specialMovement.push(`fly ${monster.speed.fly} ft.`);
    if (monster.speed.swim) specialMovement.push(`swim ${monster.speed.swim} ft.`);
    if (monster.speed.climb) specialMovement.push(`climb ${monster.speed.climb} ft.`);
    if (monster.speed.burrow) specialMovement.push(`burrow ${monster.speed.burrow} ft.`);
    
    if (specialMovement.length > 0) {
      tacticalNotes.push(`Special movement: ${specialMovement.join(', ')}.`);
    }
  }
  
  // Check for legendary actions
  if (monster.legendaryActions && monster.legendaryActions.length > 0) {
    tacticalNotes.push("This creature has legendary actions and can act outside its turn.");
  }
  
  // Generate behavior pattern based on role and intelligence
  let behaviorPattern = '';
  const intelligence = monster.abilities ? monster.abilities.int : 10;
  
  switch (role) {
    case 'brute':
      behaviorPattern = intelligence < 8 ? 
        "Will charge directly at the strongest-looking opponent." : 
        "Will focus on eliminating weaker targets first.";
      break;
    case 'skirmisher':
      behaviorPattern = "Will attack opportunistically and retreat when threatened.";
      break;
    case 'caster':
      behaviorPattern = intelligence < 12 ? 
        "Will use its most powerful spells first." : 
        "Will strategically control the battlefield with spells.";
      break;
    case 'leader':
      behaviorPattern = "Will coordinate with allies and prioritize buffing them.";
      break;
    default:
      behaviorPattern = "Will adapt tactics based on the situation.";
  }
  
  // Determine likely first actions
  let likelyFirstActions = [];
  
  // Check for powerful area effects
  const areaAttacks = monster.actions ? monster.actions.filter(action => 
    action.attack && action.attack.type === 'breath' || 
    (action.description && action.description.toLowerCase().includes('area'))
  ) : [];
  
  if (areaAttacks.length > 0) {
    likelyFirstActions.push(`Use ${areaAttacks[0].name} if multiple targets are grouped together.`);
  }
  
  // Check for summoning abilities
  const summoningActions = monster.actions ? monster.actions.filter(action => 
    action.description && action.description.toLowerCase().includes('summon')
  ) : [];
  
  if (summoningActions.length > 0) {
    likelyFirstActions.push(`Use ${summoningActions[0].name} to call for reinforcements.`);
  }
  
  // Default attack action if nothing special
  if (likelyFirstActions.length === 0 && monster.actions && monster.actions.length > 0) {
    const standardAttack = monster.actions.find(action => action.attack) || monster.actions[0];
    likelyFirstActions.push(`Attack with ${standardAttack.name}.`);
  }
  
  return {
    role,
    intelligence,
    tacticalNotes,
    behaviorPattern,
    likelyFirstActions,
    suggestedBehaviorType: _suggestBehaviorType(monster)
  };
}

/**
 * Suggest a behavior type based on monster characteristics
 * @param {Object} monster - The monster
 * @returns {string} Suggested behavior type
 * @private
 */
function _suggestBehaviorType(monster) {
  // Default to balanced
  let behaviorType = AIBehaviorType.BALANCED;
  
  // If no abilities are defined, return default
  if (!monster.abilities) {
    return behaviorType;
  }
  
  const { str, dex, con, int, wis, cha } = monster.abilities;
  
  // Low intelligence creatures tend toward simpler behaviors
  if (int < 6) {
    // Strong but dumb = berserk
    if (str >= 16) {
      return AIBehaviorType.BERSERK;
    }
    // Weak but dumb = cowardly
    if (str < 10 && con < 10) {
      return AIBehaviorType.COWARDLY;
    }
  }
  
  // High intelligence creatures are more tactical
  if (int >= 14) {
    return AIBehaviorType.TACTICAL;
  }
  
  // Creatures with high wisdom tend to be more defensive
  if (wis >= 14 && wis > int) {
    return AIBehaviorType.DEFENSIVE;
  }
  
  // Strong creatures tend to be aggressive
  if (str >= 16 && str >= dex) {
    return AIBehaviorType.AGGRESSIVE;
  }
  
  // Dexterous creatures tend to be tactical
  if (dex >= 16 && dex > str) {
    return AIBehaviorType.TACTICAL;
  }
  
  // Charismatic creatures tend to be supportive
  if (cha >= 16 && cha >= str && cha >= dex) {
    return AIBehaviorType.SUPPORT;
  }
  
  // Check for specific monster types that suggest behaviors
  if (monster.type) {
    switch (monster.type.toLowerCase()) {
      case 'construct':
      case 'elemental':
        return AIBehaviorType.PROTECTIVE;
      case 'fiend':
      case 'monstrosity':
        return AIBehaviorType.AGGRESSIVE;
      case 'fey':
      case 'celestial':
        return AIBehaviorType.TACTICAL;
      case 'undead':
        return int >= 10 ? AIBehaviorType.TACTICAL : AIBehaviorType.AGGRESSIVE;
      case 'dragon':
        return AIBehaviorType.TACTICAL;
    }
  }
  
  return behaviorType;
}

/**
 * Generate a combat narrative for an action
 * @param {Object} actor - The acting creature
 * @param {Object} action - The action taken
 * @param {Object} target - The target of the action (if any)
 * @param {Object} result - The result of the action
 * @returns {string} Narrative description
 */
export function generateCombatNarrative(actor, action, target, result) {
  if (!actor || !action) {
    return "The battle continues...";
  }
  
  const actorName = actor.name;
  const targetName = target ? target.name : null;
  
  // Generate different narratives based on action type
  switch (action.type) {
    case 'attack':
      return _generateAttackNarrative(actorName, action, targetName, result);
    case 'spell':
      return _generateSpellNarrative(actorName, action, targetName, result);
    case 'dodge':
      return `${actorName} takes a defensive stance, ready to dodge incoming attacks.`;
    case 'dash':
      return `${actorName} dashes across the battlefield with urgency.`;
    case 'disengage':
      return `${actorName} carefully disengages from combat, avoiding opportunity attacks.`;
    case 'hide':
      return `${actorName} attempts to hide from view, seeking concealment.`;
    case 'help':
      return `${actorName} helps ${targetName}, providing assistance with their next action.`;
    case 'legendary':
      return `${actorName} uses a legendary action: ${action.name}.`;
    default:
      return `${actorName} takes action in the battle.`;
  }
}

/**
 * Generate a narrative for an attack action
 * @param {string} actorName - Name of the attacker
 * @param {Object} action - The attack action
 * @param {string} targetName - Name of the target
 * @param {Object} result - The result of the attack
 * @returns {string} Narrative description
 * @private
 */
function _generateAttackNarrative(actorName, action, targetName, result) {
  if (!result) {
    return `${actorName} attacks ${targetName} with ${action.name}.`;
  }
  
  const { hit, damage, critical, damageRoll } = result;
  
  // Critical hit
  if (critical) {
    const criticalPhrases = [
      `${actorName} lands a devastating critical hit on ${targetName} with ${action.name}, dealing ${damage} damage!`,
      `With incredible precision, ${actorName} critically strikes ${targetName} using ${action.name} for ${damage} damage!`,
      `${actorName}'s ${action.name} finds a vital spot on ${targetName}, dealing a critical ${damage} damage!`
    ];
    return criticalPhrases[Math.floor(Math.random() * criticalPhrases.length)];
  }
  
  // Hit
  if (hit) {
    // Vary description based on damage amount relative to target's max HP
    if (target && target.maxHp) {
      const damagePercentage = (damage / target.maxHp) * 100;
      
      if (damagePercentage >= 50) {
        return `${actorName} delivers a massive blow to ${targetName} with ${action.name}, dealing a staggering ${damage} damage!`;
      } else if (damagePercentage >= 25) {
        return `${actorName} strikes ${targetName} with ${action.name}, dealing a significant ${damage} damage.`;
      } else if (damagePercentage >= 10) {
        return `${actorName} hits ${targetName} with ${action.name}, dealing ${damage} damage.`;
      } else {
        return `${actorName}'s ${action.name} connects with ${targetName}, dealing ${damage} damage.`;
      }
    }
    
    // Default hit description
    return `${actorName} hits ${targetName} with ${action.name}, dealing ${damage} damage.`;
  }
  
  // Miss
  const missPhrases = [
    `${actorName} attacks with ${action.name}, but misses ${targetName}.`,
    `${targetName} dodges ${actorName}'s ${action.name} attack.`,
    `${actorName}'s ${action.name} fails to connect with ${targetName}.`,
    `${targetName} deflects ${actorName}'s ${action.name} attack.`
  ];
  return missPhrases[Math.floor(Math.random() * missPhrases.length)];
}

/**
 * Generate a narrative for a spell action
 * @param {string} actorName - Name of the spellcaster
 * @param {Object} action - The spell action
 * @param {string} targetName - Name of the target
 * @param {Object} result - The result of the spell
 * @returns {string} Narrative description
 * @private
 */
function _generateSpellNarrative(actorName, action, targetName, result) {
  const spellName = action.spell;
  
  // Specific narratives for common spells
  switch (spellName.toLowerCase()) {
    case 'fireball':
      return `${actorName} launches a fireball that explodes in a fiery burst!`;
    case 'magic missile':
      return `${actorName} conjures glowing darts of magical force that unerringly strike ${targetName}.`;
    case 'cure wounds':
      return `${actorName} channels healing energy into ${targetName}, mending their wounds.`;
    case 'shield':
      return `${actorName} raises a magical shield, deflecting the incoming attack.`;
    case 'counterspell':
      return `${actorName} disrupts the weave of magic, countering the spell.`;
  }
  
  // Generic spell narratives based on result
  if (!result) {
    return `${actorName} casts ${spellName}${targetName ? ` on ${targetName}` : ''}.`;
  }
  
  if (result.success === false) {
    return `${actorName} casts ${spellName}, but it has no effect${targetName ? ` on ${targetName}` : ''}.`;
  }
  
  if (result.damage) {
    return `${actorName} casts ${spellName}, dealing ${result.damage} damage${targetName ? ` to ${targetName}` : ''}.`;
  }
  
  if (result.healing) {
    return `${actorName} casts ${spellName}, restoring ${result.healing} hit points${targetName ? ` to ${targetName}` : ''}.`;
  }
  
  return `${actorName} casts ${spellName} with magical flourish${targetName ? `, affecting ${targetName}` : ''}.`;
}

/**
 * Generate a death narrative for a creature
 * @param {Object} creature - The creature that died
 * @param {Object} killer - The creature that dealt the killing blow
 * @param {Object} action - The action that killed the creature
 * @returns {string} Death narrative
 */
export function generateDeathNarrative(creature, killer, action) {
  if (!creature) {
    return "A combatant falls in battle.";
  }
  
  const creatureName = creature.name;
  const killerName = killer ? killer.name : null;
  const actionName = action ? action.name : null;
  
  // Different narratives based on creature type
  let narratives = [];
  
  switch (creature.type) {
    case 'undead':
      narratives = [
        `${creatureName} collapses into a pile of dust and bone.`,
        `${creatureName} lets out an unearthly wail as it dissolves into shadow.`,
        `${creatureName} crumbles away, its unnatural animation finally ceasing.`
      ];
      break;
    case 'construct':
      narratives = [
        `${creatureName} shudders and falls still, its magical animation fading.`,
        `${creatureName} breaks apart, pieces of it scattering across the ground.`,
        `${creatureName} powers down with a mechanical grinding sound.`
      ];
      break;
    case 'elemental':
      narratives = [
        `${creatureName} dissipates, returning to its native elemental plane.`,
        `${creatureName} loses cohesion and dissolves into its base elements.`,
        `${creatureName} flickers and fades, its elemental energy dispersing.`
      ];
      break;
    case 'player':
      narratives = [
        `${creatureName} collapses to the ground, grievously wounded and unconscious.`,
        `${creatureName} falls unconscious, hovering at death's door.`,
        `${creatureName}'s eyes roll back as they collapse from their wounds.`
      ];
      break;
    default:
      narratives = [
        `${creatureName} falls to the ground, defeated.`,
        `${creatureName} collapses from its wounds.`,
        `${creatureName} breathes its last and lies still.`
      ];
  }
  
  // Add killer information if available
  let narrative = narratives[Math.floor(Math.random() * narratives.length)];
  
  if (killerName && actionName) {
    narrative += ` ${killerName}'s ${actionName} proved to be the fatal blow.`;
  } else if (killerName) {
    narrative += ` ${killerName} stands victorious over the fallen foe.`;
  }
  
  return narrative;
}

/**
 * Generate a description of a critical hit
 * @param {Object} attacker - The attacking creature
 * @param {Object} target - The target creature
 * @param {Object} attack - The attack that scored a critical hit
 * @returns {string} Critical hit description
 */
export function generateCriticalHitDescription(attacker, target, attack) {
  if (!attacker || !target || !attack) {
    return "A devastating critical hit lands!";
  }
  
  const attackerName = attacker.name;
  const targetName = target.name;
  const attackName = attack.name;
  
  // Different descriptions based on damage type
  const damageType = attack.attack ? attack.attack.damageType : 'generic';
  
  switch (damageType) {
    case 'slashing':
      return [
        `${attackerName}'s ${attackName} slices deep into ${targetName}, drawing a spray of blood!`,
        `${attackerName} finds a gap in ${targetName}'s defenses, cutting deeply with ${attackName}!`,
        `${targetName} reels as ${attackerName}'s ${attackName} leaves a grievous wound!`
      ][Math.floor(Math.random() * 3)];
    
    case 'piercing':
      return [
        `${attackerName}'s ${attackName} finds a vulnerable spot, piercing straight through ${targetName}'s defenses!`,
        `${attackerName} drives ${attackName} deep into ${targetName} with precision!`,
        `${targetName} gasps as ${attackerName}'s ${attackName} strikes a vital area!`
      ][Math.floor(Math.random() * 3)];
    
    case 'bludgeoning':
      return [
        `${attackerName}'s ${attackName} connects with bone-crushing force, staggering ${targetName}!`,
        `${targetName} is sent reeling from the tremendous impact of ${attackerName}'s ${attackName}!`,
        `A sickening crack echoes as ${attackerName}'s ${attackName} lands with devastating force on ${targetName}!`
      ][Math.floor(Math.random() * 3)];
    
    case 'fire':
      return [
        `${attackerName}'s ${attackName} erupts with intense heat, searing ${targetName}'s flesh!`,
        `${targetName} screams as ${attackerName}'s ${attackName} engulfs them in scorching flames!`,
        `${attackerName}'s ${attackName} burns with white-hot intensity, leaving ${targetName} badly charred!`
      ][Math.floor(Math.random() * 3)];
    
    case 'cold':
      return [
        `${attackerName}'s ${attackName} freezes the air around ${targetName}, causing frostbite on contact!`,
        `${targetName}'s movements slow as ${attackerName}'s ${attackName} chills them to the bone!`,
        `${attackerName}'s ${attackName} creates a blast of intense cold that crystallizes on ${targetName}'s skin!`
      ][Math.floor(Math.random() * 3)];
    
    case 'lightning':
      return [
        `${attackerName}'s ${attackName} arcs with blinding electricity, shocking ${targetName} violently!`,
        `${targetName} convulses as ${attackerName}'s ${attackName} courses electricity through their body!`,
        `A thunderous crack accompanies ${attackerName}'s ${attackName} as it electrifies ${targetName}!`
      ][Math.floor(Math.random() * 3)];
    
    case 'acid':
      return [
        `${attackerName}'s ${attackName} splashes corrosive acid, melting ${targetName}'s flesh!`,
        `${targetName} howls as ${attackerName}'s ${attackName} dissolves through armor and skin!`,
        `${attackerName}'s ${attackName} leaves smoking, sizzling wounds across ${targetName}'s body!`
      ][Math.floor(Math.random() * 3)];
    
    case 'poison':
      return [
        `${attackerName}'s ${attackName} delivers a potent toxin, causing ${targetName}'s veins to darken visibly!`,
        `${targetName} pales as ${attackerName}'s ${attackName} injects a deadly venom!`,
        `${attackerName}'s ${attackName} leaves ${targetName} sickened and disoriented with toxic effect!`
      ][Math.floor(Math.random() * 3)];
    
    case 'psychic':
      return [
        `${attackerName}'s ${attackName} shatters ${targetName}'s mental defenses, causing blood to trickle from their nose!`,
        `${targetName} clutches their head in agony as ${attackerName}'s ${attackName} tears through their mind!`,
        `${attackerName}'s ${attackName} causes ${targetName} to scream as horrific visions flood their consciousness!`
      ][Math.floor(Math.random() * 3)];
    
    case 'radiant':
      return [
        `${attackerName}'s ${attackName} blazes with divine light, searing ${targetName} from within!`,
        `${targetName} is momentarily blinded as ${attackerName}'s ${attackName} burns with holy radiance!`,
        `${attackerName}'s ${attackName} channels pure radiant energy, leaving glowing wounds on ${targetName}!`
      ][Math.floor(Math.random() * 3)];
    
    case 'necrotic':
      return [
        `${attackerName}'s ${attackName} drains the life force from ${targetName}, causing their flesh to wither!`,
        `${targetName}'s skin blackens and shrivels where ${attackerName}'s ${attackName} touches!`,
        `${attackerName}'s ${attackName} envelops ${targetName} in dark energy, draining their vitality!`
      ][Math.floor(Math.random() * 3)];
    
    case 'force':
      return [
        `${attackerName}'s ${attackName} strikes with pure magical force, knocking ${targetName} back violently!`,
        `${targetName} is hammered by the irresistible power of ${attackerName}'s ${attackName}!`,
        `${attackerName}'s ${attackName} warps the very air as it smashes into ${targetName} with arcane might!`
      ][Math.floor(Math.random() * 3)];
    
    default:
      return [
        `${attackerName} lands a devastating critical hit on ${targetName} with ${attackName}!`,
        `${targetName} reels from the exceptional precision of ${attackerName}'s ${attackName}!`,
        `${attackerName}'s ${attackName} finds a vital spot, dealing a critical blow to ${targetName}!`
      ][Math.floor(Math.random() * 3)];
  }
}

/**
 * Generate a description of a natural 1 (critical failure)
 * @param {Object} attacker - The attacking creature
 * @param {Object} attack - The attack that critically failed
 * @returns {string} Critical failure description
 */
export function generateCriticalFailureDescription(attacker, attack) {
  if (!attacker || !attack) {
    return "A catastrophic failure occurs!";
  }
  
  const attackerName = attacker.name;
  const attackName = attack.name;
  
  const failures = [
    `${attackerName} fumbles with ${attackName}, completely missing the mark.`,
    `${attackerName}'s grip slips, sending ${attackName} off in the wrong direction.`,
    `${attackerName} loses balance while attempting to use ${attackName}.`,
    `${attackerName}'s ${attackName} goes comically wide, hitting nothing but air.`,
    `${attackerName} misjudges the distance, and ${attackName} falls short of the target.`,
    `${attackerName} puts too much force into ${attackName}, throwing off their aim entirely.`,
    `A moment of hesitation causes ${attackerName}'s ${attackName} to falter.`,
    `${attackerName} trips slightly, causing ${attackName} to go astray.`,
    `${attackerName} blinks at the wrong moment, completely missing with ${attackName}.`,
    `${attackerName}'s ${attackName} catches on their own equipment, foiling the attack.`
  ];
  
  return failures[Math.floor(Math.random() * failures.length)];
}

/**
 * Generate a description of a condition being applied
 * @param {Object} target - The target creature
 * @param {Object} condition - The condition being applied
 * @param {Object} source - The source of the condition (creature or effect)
 * @returns {string} Condition application description
 */
export function generateConditionDescription(target, condition, source) {
  if (!target || !condition) {
    return "A condition takes effect.";
  }
  
  const targetName = target.name;
  const conditionName = condition.name || condition;
  const sourceName = source ? source.name : null;
  
  // Different descriptions based on condition type
  switch (conditionName.toLowerCase()) {
    case 'blinded':
      return sourceName ? 
        `${targetName} is blinded by ${sourceName}, unable to see!` : 
        `${targetName} is blinded, their vision obscured!`;
    
    case 'charmed':
      return sourceName ? 
        `${targetName} is charmed by ${sourceName}, regarding them as a friend.` : 
        `${targetName} is charmed, their hostility replaced with affection.`;
    
    case 'deafened':
      return sourceName ? 
        `${targetName} is deafened by ${sourceName}, unable to hear!` : 
        `${targetName} is deafened, sounds muffled to nothing!`;
    
    case 'frightened':
      return sourceName ? 
        `${targetName} is frightened by ${sourceName}, terror evident in their eyes!` : 
        `${targetName} is frightened, overcome with fear!`;
    
    case 'grappled':
      return sourceName ? 
        `${targetName} is grappled by ${sourceName}, unable to move freely!` : 
        `${targetName} is grappled, their movement restricted!`;
    
    case 'incapacitated':
      return sourceName ? 
        `${targetName} is incapacitated by ${sourceName}, unable to take actions!` : 
        `${targetName} is incapacitated, unable to act!`;
    
    case 'invisible':
      return sourceName ? 
        `${targetName} is made invisible by ${sourceName}, fading from view!` : 
        `${targetName} becomes invisible, disappearing from sight!`;
    
    case 'paralyzed':
      return sourceName ? 
        `${targetName} is paralyzed by ${sourceName}, their muscles locking up completely!` : 
        `${targetName} is paralyzed, frozen in place!`;
    
    case 'petrified':
      return sourceName ? 
        `${targetName} is petrified by ${sourceName}, their flesh hardening to stone!` : 
        `${targetName} is petrified, transformed into a stone statue!`;
    
    case 'poisoned':
      return sourceName ? 
        `${targetName} is poisoned by ${sourceName}, their skin taking on a sickly hue!` : 
        `${targetName} is poisoned, sickness overtaking them!`;
    
    case 'prone':
      return sourceName ? 
        `${targetName} is knocked prone by ${sourceName}, falling to the ground!` : 
        `${targetName} falls prone, hitting the ground hard!`;
    
    case 'restrained':
      return sourceName ? 
        `${targetName} is restrained by ${sourceName}, struggling against their bonds!` : 
        `${targetName} is restrained, their movement severely limited!`;
    
    case 'stunned':
      return sourceName ? 
        `${targetName} is stunned by ${sourceName}, momentarily dazed and reeling!` : 
        `${targetName} is stunned, unable to think clearly!`;
    
    case 'unconscious':
      return sourceName ? 
        `${targetName} is rendered unconscious by ${sourceName}, collapsing in a heap!` : 
        `${targetName} falls unconscious, slumping to the ground!`;
    
    default:
      return sourceName ? 
        `${targetName} is affected by ${conditionName} from ${sourceName}!` : 
        `${targetName} is affected by ${conditionName}!`;
  }
}

// Export the main AI class and utility functions
export default CombatAI;
