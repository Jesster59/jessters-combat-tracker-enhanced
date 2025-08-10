/**
 * Jesster's Combat Tracker
 * Lair Module
 * Version 2.3.1
 * 
 * This module handles lair actions, regional effects, and environmental features
 * for monsters and encounters, adding depth and tactical elements to combat.
 */

/**
 * Types of lair features
 */
export const LairFeatureType = {
  LAIR_ACTION: 'lair_action',
  REGIONAL_EFFECT: 'regional_effect',
  ENVIRONMENTAL_HAZARD: 'environmental_hazard',
  TERRAIN_FEATURE: 'terrain_feature',
  TRAP: 'trap'
};

/**
 * Trigger types for lair features
 */
export const TriggerType = {
  INITIATIVE_20: 'initiative_20',
  INITIATIVE_COUNT: 'initiative_count',
  ROUND_START: 'round_start',
  ROUND_END: 'round_end',
  HEALTH_THRESHOLD: 'health_threshold',
  MOVEMENT: 'movement',
  PROXIMITY: 'proximity',
  DAMAGE_TAKEN: 'damage_taken',
  MANUAL: 'manual',
  RANDOM: 'random'
};

/**
 * Class representing a lair with special features and actions
 */
export class Lair {
  /**
   * Create a lair
   * @param {Object} config - Lair configuration
   */
  constructor(config = {}) {
    this.name = config.name || 'Unknown Lair';
    this.description = config.description || '';
    this.features = config.features || [];
    this.owner = config.owner || null; // Monster that owns this lair
    this.active = config.active !== undefined ? config.active : true;
    this.initiativeCount = config.initiativeCount || 20;
    this.usedActions = new Set();
    this.roundHistory = [];
    this.currentRound = 0;
    this.listeners = [];
  }

  /**
   * Add a feature to the lair
   * @param {Object} feature - The feature to add
   * @returns {Lair} The lair instance for chaining
   */
  addFeature(feature) {
    if (!feature.id) {
      feature.id = generateId();
    }
    this.features.push(feature);
    return this;
  }

  /**
   * Remove a feature from the lair
   * @param {string} featureId - The ID of the feature to remove
   * @returns {boolean} True if the feature was removed
   */
  removeFeature(featureId) {
    const initialLength = this.features.length;
    this.features = this.features.filter(feature => feature.id !== featureId);
    return this.features.length < initialLength;
  }

  /**
   * Get all features of a specific type
   * @param {string} type - The type of features to get
   * @returns {Array} Array of features of the specified type
   */
  getFeaturesByType(type) {
    return this.features.filter(feature => feature.type === type);
  }

  /**
   * Get all available features for the current state
   * @param {Object} state - The current combat state
   * @returns {Array} Array of available features
   */
  getAvailableFeatures(state) {
    if (!this.active) return [];
    
    return this.features.filter(feature => {
      // Skip used actions if they can only be used once per round
      if (
        feature.type === LairFeatureType.LAIR_ACTION &&
        feature.oncePerRound &&
        this.usedActions.has(feature.id)
      ) {
        return false;
      }
      
      // Check if the feature is triggered by the current state
      return this.isFeatureTriggered(feature, state);
    });
  }

  /**
   * Check if a feature is triggered by the current state
   * @param {Object} feature - The feature to check
   * @param {Object} state - The current combat state
   * @returns {boolean} True if the feature is triggered
   */
  isFeatureTriggered(feature, state) {
    if (!feature.trigger) return false;
    
    switch (feature.trigger.type) {
      case TriggerType.INITIATIVE_20:
        return state.initiativeCount === 20;
      
      case TriggerType.INITIATIVE_COUNT:
        return state.initiativeCount === (feature.trigger.value || this.initiativeCount);
      
      case TriggerType.ROUND_START:
        return state.roundStart === true;
      
      case TriggerType.ROUND_END:
        return state.roundEnd === true;
      
      case TriggerType.HEALTH_THRESHOLD:
        if (!this.owner || !feature.trigger.value) return false;
        const threshold = feature.trigger.value;
        const healthPercent = (this.owner.hp / this.owner.maxHp) * 100;
        return healthPercent <= threshold;
      
      case TriggerType.MOVEMENT:
        if (!state.movement || !feature.trigger.value) return false;
        return state.movement.distance >= feature.trigger.value;
      
      case TriggerType.PROXIMITY:
        if (!state.proximity || !feature.trigger.value) return false;
        return state.proximity.distance <= feature.trigger.value;
      
      case TriggerType.DAMAGE_TAKEN:
        if (!state.damageTaken || !feature.trigger.value) return false;
        return state.damageTaken >= feature.trigger.value;
      
      case TriggerType.MANUAL:
        return state.manual === true;
      
      case TriggerType.RANDOM:
        if (!feature.trigger.chance) return false;
        return Math.random() < feature.trigger.chance;
      
      default:
        return false;
    }
  }

  /**
   * Activate a feature
   * @param {string} featureId - The ID of the feature to activate
   * @param {Object} state - The current combat state
   * @returns {Object|null} The activated feature or null if not found/available
   */
  activateFeature(featureId, state) {
    const feature = this.features.find(f => f.id === featureId);
    
    if (!feature) {
      console.warn(`Feature with ID ${featureId} not found`);
      return null;
    }
    
    // Check if the feature is available
    if (!this.isFeatureTriggered(feature, state)) {
      console.warn(`Feature ${feature.name} is not triggered in the current state`);
      return null;
    }
    
    // Mark the action as used if it's a lair action
    if (feature.type === LairFeatureType.LAIR_ACTION) {
      this.usedActions.add(feature.id);
    }
    
    // Apply the feature's effects
    this._applyFeatureEffects(feature, state);
    
    // Notify listeners
    this._notifyListeners('featureActivated', { feature, state });
    
    return feature;
  }

  /**
   * Apply a feature's effects
   * @param {Object} feature - The feature to apply
   * @param {Object} state - The current combat state
   * @private
   */
  _applyFeatureEffects(feature, state) {
    if (!feature.effects) return;
    
    feature.effects.forEach(effect => {
      switch (effect.type) {
        case 'damage':
          this._applyDamageEffect(effect, state);
          break;
        
        case 'condition':
          this._applyConditionEffect(effect, state);
          break;
        
        case 'movement':
          this._applyMovementEffect(effect, state);
          break;
        
        case 'terrain':
          this._applyTerrainEffect(effect, state);
          break;
        
        case 'summon':
          this._applySummonEffect(effect, state);
          break;
        
        case 'custom':
          // Custom effects are handled by the caller
          break;
      }
    });
  }

  /**
   * Apply a damage effect
   * @param {Object} effect - The effect to apply
   * @param {Object} state - The current combat state
   * @private
   */
  _applyDamageEffect(effect, state) {
    if (!effect.targets || !state.combatants) return;
    
    const targets = this._resolveTargets(effect.targets, state);
    const damageAmount = this._resolveDamageAmount(effect, state);
    
    targets.forEach(target => {
      // Apply damage to the target
      if (typeof state.applyDamage === 'function') {
        state.applyDamage(target, damageAmount, effect.damageType || 'unspecified');
      } else {
        // Fallback if no damage function is provided
        target.hp = Math.max(0, target.hp - damageAmount);
      }
    });
  }

  /**
   * Apply a condition effect
   * @param {Object} effect - The effect to apply
   * @param {Object} state - The current combat state
   * @private
   */
  _applyConditionEffect(effect, state) {
    if (!effect.targets || !state.combatants) return;
    
    const targets = this._resolveTargets(effect.targets, state);
    
    targets.forEach(target => {
      // Apply condition to the target
      if (typeof state.applyCondition === 'function') {
        state.applyCondition(target, effect.condition, effect.duration);
      } else {
        // Fallback if no condition function is provided
        if (!target.conditions) target.conditions = [];
        target.conditions.push({
          name: effect.condition,
          duration: effect.duration
        });
      }
    });
  }

  /**
   * Apply a movement effect
   * @param {Object} effect - The effect to apply
   * @param {Object} state - The current combat state
   * @private
   */
  _applyMovementEffect(effect, state) {
    if (!effect.targets || !state.combatants) return;
    
    const targets = this._resolveTargets(effect.targets, state);
    
    targets.forEach(target => {
      // Apply movement to the target
      if (typeof state.moveTarget === 'function') {
        state.moveTarget(target, effect.distance, effect.direction);
      }
      // No fallback for movement as it requires map integration
    });
  }

  /**
   * Apply a terrain effect
   * @param {Object} effect - The effect to apply
   * @param {Object} state - The current combat state
   * @private
   */
  _applyTerrainEffect(effect, state) {
    // Apply terrain changes
    if (typeof state.modifyTerrain === 'function') {
      state.modifyTerrain(effect.area, effect.terrainType, effect.duration);
    }
    // No fallback for terrain as it requires map integration
  }

  /**
   * Apply a summon effect
   * @param {Object} effect - The effect to apply
   * @param {Object} state - The current combat state
   * @private
   */
  _applySummonEffect(effect, state) {
    if (!effect.creature) return;
    
    // Summon creatures
    if (typeof state.summonCreature === 'function') {
      const count = effect.count || 1;
      for (let i = 0; i < count; i++) {
        state.summonCreature(effect.creature, effect.position);
      }
    }
    // No fallback for summoning as it requires combat state integration
  }

  /**
   * Resolve targets for an effect
   * @param {Object} targetSpec - The target specification
   * @param {Object} state - The current combat state
   * @returns {Array} Array of target combatants
   * @private
   */
  _resolveTargets(targetSpec, state) {
    if (!state.combatants) return [];
    
    switch (targetSpec.type) {
      case 'all':
        return state.combatants;
      
      case 'players':
        return state.combatants.filter(c => c.type === 'player');
      
      case 'monsters':
        return state.combatants.filter(c => c.type === 'monster');
      
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
   * Resolve damage amount for an effect
   * @param {Object} effect - The effect
   * @param {Object} state - The current combat state
   * @returns {number} The resolved damage amount
   * @private
   */
  _resolveDamageAmount(effect, state) {
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
   * Start a new round
   * @param {number} roundNumber - The round number
   */
  startRound(roundNumber) {
    this.currentRound = roundNumber;
    this.usedActions.clear();
    
    // Record round start in history
    this.roundHistory.push({
      round: roundNumber,
      actions: [],
      timestamp: new Date()
    });
    
    // Notify listeners
    this._notifyListeners('roundStarted', { round: roundNumber });
  }

  /**
   * End the current round
   */
  endRound() {
    // Notify listeners
    this._notifyListeners('roundEnded', { round: this.currentRound });
  }

  /**
   * Record an action in the current round's history
   * @param {Object} action - The action to record
   */
  recordAction(action) {
    if (this.roundHistory.length === 0) {
      this.startRound(1);
    }
    
    const currentRoundHistory = this.roundHistory[this.roundHistory.length - 1];
    currentRoundHistory.actions.push({
      ...action,
      timestamp: new Date()
    });
  }

  /**
   * Add a listener for lair events
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
        console.error('Error in lair listener:', error);
      }
    });
  }

  /**
   * Activate or deactivate the lair
   * @param {boolean} active - Whether the lair should be active
   */
  setActive(active) {
    this.active = active;
    this._notifyListeners('activeChanged', { active });
  }

  /**
   * Check if the lair is active
   * @returns {boolean} True if the lair is active
   */
  isActive() {
    return this.active;
  }

  /**
   * Set the initiative count for lair actions
   * @param {number} count - The initiative count
   */
  setInitiativeCount(count) {
    this.initiativeCount = count;
  }

  /**
   * Get the initiative count for lair actions
   * @returns {number} The initiative count
   */
  getInitiativeCount() {
    return this.initiativeCount;
  }

  /**
   * Set the owner of this lair
   * @param {Object} monster - The monster that owns this lair
   */
  setOwner(monster) {
    this.owner = monster;
  }

  /**
   * Get the owner of this lair
   * @returns {Object|null} The monster that owns this lair
   */
  getOwner() {
    return this.owner;
  }

  /**
   * Convert the lair to a plain object for serialization
   * @returns {Object} Plain object representation of the lair
   */
  toJSON() {
    return {
      name: this.name,
      description: this.description,
      features: this.features,
      active: this.active,
      initiativeCount: this.initiativeCount,
      ownerId: this.owner ? this.owner.id : null
    };
  }

  /**
   * Create a lair from a plain object
   * @param {Object} data - The plain object data
   * @returns {Lair} A new lair instance
   */
  static fromJSON(data) {
    return new Lair(data);
  }
}

/**
 * Class representing a collection of lair templates
 */
export class LairTemplateLibrary {
  /**
   * Create a lair template library
   */
  constructor() {
    this.templates = {};
    this.categories = {};
    this._initializeDefaultTemplates();
  }

  /**
   * Initialize default lair templates
   * @private
   */
  _initializeDefaultTemplates() {
    // Add default categories
    this.addCategory('dragon', 'Dragon Lairs');
    this.addCategory('undead', 'Undead Lairs');
    this.addCategory('elemental', 'Elemental Lairs');
    this.addCategory('fiend', 'Fiendish Lairs');
    this.addCategory('fey', 'Fey Realms');
    this.addCategory('aberration', 'Aberrant Domains');
    this.addCategory('dungeon', 'Dungeon Features');
    this.addCategory('natural', 'Natural Hazards');
    
    // Add some default templates
    
    // Dragon lair template
    this.addTemplate({
      id: 'dragon_lair',
      name: 'Dragon\'s Lair',
      category: 'dragon',
      description: 'A typical dragon\'s lair with various draconic features.',
      features: [
        {
          id: 'trembling_ground',
          name: 'Trembling Ground',
          description: 'The ground shakes violently, knocking creatures off balance.',
          type: LairFeatureType.LAIR_ACTION,
          trigger: { type: TriggerType.INITIATIVE_COUNT, value: 20 },
          oncePerRound: true,
          effects: [
            {
              type: 'condition',
              condition: 'prone',
              targets: { type: 'area', area: { type: 'circle', radius: 20 } },
              savingThrow: { ability: 'dex', dc: 15 }
            }
          ]
        },
        {
          id: 'falling_debris',
          name: 'Falling Debris',
          description: 'Chunks of the ceiling collapse, dealing damage to those below.',
          type: LairFeatureType.LAIR_ACTION,
          trigger: { type: TriggerType.INITIATIVE_COUNT, value: 20 },
          oncePerRound: true,
          effects: [
            {
              type: 'damage',
              damage: '2d10',
              damageType: 'bludgeoning',
              targets: { type: 'random', count: 3 },
              savingThrow: { ability: 'dex', dc: 15, halfOnSuccess: true }
            }
          ]
        },
        {
          id: 'noxious_gas',
          name: 'Noxious Gas',
          description: 'Poisonous gas fills the area, making it difficult to breathe.',
          type: LairFeatureType.LAIR_ACTION,
          trigger: { type: TriggerType.INITIATIVE_COUNT, value: 20 },
          oncePerRound: true,
          effects: [
            {
              type: 'condition',
              condition: 'poisoned',
              duration: 1,
              targets: { type: 'players' },
              savingThrow: { ability: 'con', dc: 15 }
            }
          ]
        },
        {
          id: 'treasure_reflection',
          name: 'Treasure Reflection',
          description: 'The dragon\'s hoard creates illusory duplicates of the dragon.',
          type: LairFeatureType.REGIONAL_EFFECT,
          trigger: { type: TriggerType.HEALTH_THRESHOLD, value: 50 },
          effects: [
            {
              type: 'summon',
              creature: 'dragon_illusion',
              count: 2,
              duration: 3
            }
          ]
        }
      ]
    });
    
    // Undead lair template
    this.addTemplate({
      id: 'undead_crypt',
      name: 'Ancient Crypt',
      category: 'undead',
      description: 'A haunted crypt filled with restless spirits and animated corpses.',
      features: [
        {
          id: 'grasping_hands',
          name: 'Grasping Hands',
          description: 'Skeletal hands burst from the ground, grasping at the living.',
          type: LairFeatureType.LAIR_ACTION,
          trigger: { type: TriggerType.INITIATIVE_COUNT, value: 20 },
          oncePerRound: true,
          effects: [
            {
              type: 'condition',
              condition: 'restrained',
              duration: 1,
              targets: { type: 'players' },
              savingThrow: { ability: 'str', dc: 14 }
            }
          ]
        },
        {
          id: 'soul_drain',
          name: 'Soul Drain',
          description: 'Spectral energy drains life force from nearby creatures.',
          type: LairFeatureType.LAIR_ACTION,
          trigger: { type: TriggerType.INITIATIVE_COUNT, value: 20 },
          oncePerRound: true,
          effects: [
            {
              type: 'damage',
              damage: '3d6',
              damageType: 'necrotic',
              targets: { type: 'players' },
              savingThrow: { ability: 'con', dc: 14, halfOnSuccess: true }
            }
          ]
        },
        {
          id: 'raise_dead',
          name: 'Raise Dead',
          description: 'The master of the crypt raises fallen enemies as zombies.',
          type: LairFeatureType.LAIR_ACTION,
          trigger: { type: TriggerType.ROUND_END },
          oncePerRound: true,
          effects: [
            {
              type: 'summon',
              creature: 'zombie',
              count: 1
            }
          ]
        },
        {
          id: 'unnatural_darkness',
          name: 'Unnatural Darkness',
          description: 'Magical darkness pervades the area, making it difficult to see.',
          type: LairFeatureType.REGIONAL_EFFECT,
          trigger: { type: TriggerType.MANUAL },
          effects: [
            {
              type: 'terrain',
              terrainType: 'darkness',
              area: { type: 'sphere', radius: 60 },
              duration: -1 // Permanent until dispelled
            }
          ]
        }
      ]
    });
    
    // Elemental lair template
    this.addTemplate({
      id: 'fire_elemental_node',
      name: 'Fire Elemental Node',
      category: 'elemental',
      description: 'A nexus of elemental fire energy with hazardous heat and flames.',
      features: [
        {
          id: 'erupting_flames',
          name: 'Erupting Flames',
          description: 'Geysers of flame burst from the ground in random locations.',
          type: LairFeatureType.LAIR_ACTION,
          trigger: { type: TriggerType.INITIATIVE_COUNT, value: 20 },
          oncePerRound: true,
          effects: [
            {
              type: 'damage',
              damage: '4d6',
              damageType: 'fire',
              targets: { type: 'random', count: 3 },
              savingThrow: { ability: 'dex', dc: 15, halfOnSuccess: true }
            }
          ]
        },
        {
          id: 'smoke_cloud',
          name: 'Smoke Cloud',
          description: 'Thick smoke fills the area, obscuring vision.',
          type: LairFeatureType.LAIR_ACTION,
          trigger: { type: TriggerType.INITIATIVE_COUNT, value: 20 },
          oncePerRound: true,
          effects: [
            {
              type: 'terrain',
              terrainType: 'heavily_obscured',
              area: { type: 'sphere', radius: 20 },
              duration: 1
            }
          ]
        },
        {
          id: 'summon_fire_elementals',
          name: 'Summon Fire Elementals',
          description: 'Small fire elementals are summoned from the elemental plane.',
          type: LairFeatureType.LAIR_ACTION,
          trigger: { type: TriggerType.HEALTH_THRESHOLD, value: 50 },
          effects: [
            {
              type: 'summon',
              creature: 'fire_elemental_minor',
              count: 2
            }
          ]
        },
        {
          id: 'extreme_heat',
          name: 'Extreme Heat',
          description: 'The ambient temperature is dangerously high.',
          type: LairFeatureType.REGIONAL_EFFECT,
          trigger: { type: TriggerType.ROUND_START },
          effects: [
            {
              type: 'damage',
              damage: 2,
              damageType: 'fire',
              targets: { type: 'players' },
              savingThrow: { ability: 'con', dc: 10, negateOnSuccess: true }
            }
          ]
        }
      ]
    });
    
    // Natural hazards template
    this.addTemplate({
      id: 'volcanic_area',
      name: 'Volcanic Area',
      category: 'natural',
      description: 'An active volcanic region with lava flows and toxic gases.',
      features: [
        {
          id: 'lava_geyser',
          name: 'Lava Geyser',
          description: 'A sudden eruption of lava from a crack in the ground.',
          type: LairFeatureType.ENVIRONMENTAL_HAZARD,
          trigger: { type: TriggerType.RANDOM, chance: 0.2 },
          effects: [
            {
              type: 'damage',
              damage: '6d6',
              damageType: 'fire',
              targets: { type: 'area', area: { type: 'line', length: 30, width: 5 } },
              savingThrow: { ability: 'dex', dc: 15, halfOnSuccess: true }
            }
          ]
        },
        {
          id: 'toxic_fumes',
          name: 'Toxic Fumes',
          description: 'Poisonous volcanic gases fill the air.',
          type: LairFeatureType.ENVIRONMENTAL_HAZARD,
          trigger: { type: TriggerType.ROUND_START },
          effects: [
            {
              type: 'condition',
              condition: 'poisoned',
              duration: 1,
              targets: { type: 'all' },
              savingThrow: { ability: 'con', dc: 12 }
            }
          ]
        },
        {
          id: 'unstable_ground',
          name: 'Unstable Ground',
          description: 'The ground is unstable and may collapse under weight.',
          type: LairFeatureType.TERRAIN_FEATURE,
          trigger: { type: TriggerType.MOVEMENT },
          effects: [
            {
              type: 'custom',
              customId: 'ground_collapse',
              savingThrow: { ability: 'dex', dc: 13 }
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
   * @returns {LairTemplateLibrary} The library instance for chaining
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
   * @returns {LairTemplateLibrary} The library instance for chaining
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
   * Create a lair from a template
   * @param {string} templateId - The template ID
   * @param {Object} options - Additional options for the lair
   * @returns {Lair|null} The created lair or null if template not found
   */
  createLairFromTemplate(templateId, options = {}) {
    const template = this.getTemplate(templateId);
    
    if (!template) {
      console.warn(`Template with ID ${templateId} not found`);
      return null;
    }
    
    // Create a deep copy of the template features
    const features = JSON.parse(JSON.stringify(template.features || []));
    
    // Create the lair
    const lair = new Lair({
      name: options.name || template.name,
      description: options.description || template.description,
      features,
      active: options.active !== undefined ? options.active : true,
      initiativeCount: options.initiativeCount || 20,
      owner: options.owner || null
    });
    
    return lair;
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
 * Class for managing environmental effects in an encounter
 */
export class EnvironmentManager {
  /**
   * Create an environment manager
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    this.effects = config.effects || [];
    this.terrain = config.terrain || {};
    this.weather = config.weather || null;
    this.timeOfDay = config.timeOfDay || 'day';
    this.visibility = config.visibility || 'normal';
    this.listeners = [];
  }

  /**
   * Add an environmental effect
   * @param {Object} effect - The effect to add
   * @returns {EnvironmentManager} The manager instance for chaining
   */
  addEffect(effect) {
    if (!effect.id) {
      effect.id = generateId();
    }
    
    this.effects.push(effect);
    this._notifyListeners('effectAdded', { effect });
    return this;
  }

  /**
   * Remove an environmental effect
   * @param {string} effectId - The ID of the effect to remove
   * @returns {boolean} True if the effect was removed
   */
  removeEffect(effectId) {
    const initialLength = this.effects.length;
    this.effects = this.effects.filter(effect => effect.id !== effectId);
    
    if (this.effects.length < initialLength) {
      this._notifyListeners('effectRemoved', { effectId });
      return true;
    }
    
    return false;
  }

  /**
   * Get all environmental effects
   * @returns {Array} All effects
   */
  getAllEffects() {
    return [...this.effects];
  }

  /**
   * Get effects by type
   * @param {string} type - The effect type
   * @returns {Array} Effects of the specified type
   */
  getEffectsByType(type) {
    return this.effects.filter(effect => effect.type === type);
  }

  /**
   * Set terrain for a specific area
   * @param {Object} area - The area to set terrain for
   * @param {string} terrainType - The type of terrain
   * @param {number} duration - Duration in rounds (-1 for permanent)
   * @returns {string} ID of the created terrain feature
   */
  setTerrain(area, terrainType, duration = -1) {
    const id = generateId();
    
    this.terrain[id] = {
      id,
      area,
      type: terrainType,
      duration,
      createdAt: this.getCurrentRound() || 0
    };
    
    this._notifyListeners('terrainChanged', { 
      id, area, terrainType, duration 
    });
    
    return id;
  }

  /**
   * Remove terrain by ID
   * @param {string} id - The terrain ID
   * @returns {boolean} True if terrain was removed
   */
  removeTerrain(id) {
    if (this.terrain[id]) {
      const terrain = this.terrain[id];
      delete this.terrain[id];
      
      this._notifyListeners('terrainRemoved', { id, terrain });
      return true;
    }
    
    return false;
  }

  /**
   * Get all terrain features
   * @returns {Object} All terrain features
   */
  getAllTerrain() {
    return { ...this.terrain };
  }

  /**
   * Set the current weather
   * @param {string} weatherType - The type of weather
   * @param {Object} options - Additional weather options
   * @returns {EnvironmentManager} The manager instance for chaining
   */
  setWeather(weatherType, options = {}) {
    this.weather = {
      type: weatherType,
      intensity: options.intensity || 'moderate',
      effects: options.effects || [],
      ...options
    };
    
    this._notifyListeners('weatherChanged', { weather: this.weather });
    return this;
  }

  /**
   * Get the current weather
   * @returns {Object|null} The current weather
   */
  getWeather() {
    return this.weather;
  }

  /**
   * Set the time of day
   * @param {string} timeOfDay - The time of day
   * @returns {EnvironmentManager} The manager instance for chaining
   */
  setTimeOfDay(timeOfDay) {
    this.timeOfDay = timeOfDay;
    this._notifyListeners('timeOfDayChanged', { timeOfDay });
    return this;
  }

  /**
   * Get the time of day
   * @returns {string} The time of day
   */
  getTimeOfDay() {
    return this.timeOfDay;
  }

  /**
   * Set visibility conditions
   * @param {string} visibility - The visibility level
   * @returns {EnvironmentManager} The manager instance for chaining
   */
  setVisibility(visibility) {
    this.visibility = visibility;
    this._notifyListeners('visibilityChanged', { visibility });
    return this;
  }

  /**
   * Get visibility conditions
   * @returns {string} The visibility level
   */
  getVisibility() {
    return this.visibility;
  }

  /**
   * Update environment for a new round
   * @param {number} round - The current round number
   */
  updateForRound(round) {
    // Update terrain durations
    Object.keys(this.terrain).forEach(id => {
      const terrain = this.terrain[id];
      
      if (terrain.duration > 0) {
        const elapsedRounds = round - terrain.createdAt;
        
        if (elapsedRounds >= terrain.duration) {
          this.removeTerrain(id);
        }
      }
    });
    
    // Update effect durations
    this.effects.forEach((effect, index) => {
      if (effect.duration > 0) {
        effect.remainingDuration = (effect.remainingDuration || effect.duration) - 1;
        
        if (effect.remainingDuration <= 0) {
          this.effects.splice(index, 1);
          this._notifyListeners('effectExpired', { effectId: effect.id });
        }
      }
    });
    
    // Trigger round-based effects
    const triggeredEffects = this.effects.filter(effect => 
      effect.trigger && 
      effect.trigger.type === TriggerType.ROUND_START
    );
    
    triggeredEffects.forEach(effect => {
      this._notifyListeners('effectTriggered', { effect, round });
    });
    
    this._notifyListeners('roundUpdated', { round });
  }

  /**
   * Get the current round number
   * @returns {number|null} The current round or null if not available
   * @private
   */
  getCurrentRound() {
    // This would typically be provided by the combat tracker
    // For now, we'll return null as a placeholder
    return null;
  }

  /**
   * Add a listener for environment events
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
        console.error('Error in environment listener:', error);
      }
    });
  }

  /**
   * Convert the environment manager to a plain object for serialization
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      effects: this.effects,
      terrain: this.terrain,
      weather: this.weather,
      timeOfDay: this.timeOfDay,
      visibility: this.visibility
    };
  }

  /**
   * Create an environment manager from a plain object
   * @param {Object} data - The plain object data
   * @returns {EnvironmentManager} A new environment manager instance
   */
  static fromJSON(data) {
    return new EnvironmentManager(data);
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
 * Create a new lair
 * @param {Object} config - Lair configuration
 * @returns {Lair} A new lair instance
 */
export function createLair(config = {}) {
  return new Lair(config);
}

/**
 * Create a new lair template library
 * @returns {LairTemplateLibrary} A new lair template library instance
 */
export function createLairTemplateLibrary() {
  return new LairTemplateLibrary();
}

/**
 * Create a new environment manager
 * @param {Object} config - Environment configuration
 * @returns {EnvironmentManager} A new environment manager instance
 */
export function createEnvironmentManager(config = {}) {
  return new EnvironmentManager(config);
}

/**
 * Get predefined terrain types
 * @returns {Object} Predefined terrain types
 */
export function getTerrainTypes() {
  return {
    normal: { name: 'Normal', movementCost: 1, description: 'Normal terrain with no special effects.' },
    difficult: { name: 'Difficult Terrain', movementCost: 2, description: 'Costs 2 feet of movement for every 1 foot moved.' },
    water: { name: 'Water', movementCost: 2, description: 'Shallow water that counts as difficult terrain.' },
    deep_water: { name: 'Deep Water', movementCost: 3, description: 'Requires swimming and may cause drowning.' },
    lava: { 
      name: 'Lava', 
      movementCost: 3, 
      description: 'Deals 10d10 fire damage when entered and 10d10 at the start of each turn.',
      damageType: 'fire',
      damageAmount: '10d10'
    },
    ice: { 
      name: 'Ice', 
      movementCost: 1, 
      description: 'Requires a DC 10 Acrobatics check when moving more than half speed or fall prone.',
      savingThrow: { ability: 'dex', dc: 10 }
    },
    rubble: { name: 'Rubble', movementCost: 2, description: 'Broken stones and debris that count as difficult terrain.' },
    mud: { name: 'Mud', movementCost: 2, description: 'Soft, wet earth that counts as difficult terrain.' },
    sand: { name: 'Sand', movementCost: 2, description: 'Loose sand that counts as difficult terrain.' },
    web: { 
      name: 'Web', 
      movementCost: 2, 
      description: 'Sticky webs that count as difficult terrain and may restrain creatures.',
      savingThrow: { ability: 'str', dc: 12 },
      condition: 'restrained'
    },
    darkness: { 
      name: 'Magical Darkness', 
      movementCost: 1, 
      description: 'Area is heavily obscured, blocking vision entirely.',
      visionEffect: 'heavily_obscured'
    },
    fog: { 
      name: 'Fog Cloud', 
      movementCost: 1, 
      description: 'Area is heavily obscured, blocking vision entirely.',
      visionEffect: 'heavily_obscured'
    },
    grease: { 
      name: 'Grease', 
      movementCost: 2, 
      description: 'Slippery surface that may cause creatures to fall prone.',
      savingThrow: { ability: 'dex', dc: 10 },
      condition: 'prone'
    },
    thorns: { 
      name: 'Thorns', 
      movementCost: 2, 
      description: 'Sharp thorns that deal 1d4 piercing damage when moved through.',
      damageType: 'piercing',
      damageAmount: '1d4'
    },
    hallowed: { 
      name: 'Hallowed Ground', 
      movementCost: 1, 
      description: 'Sacred area that affects undead and fiends.',
      creatureTypes: ['undead', 'fiend'],
      effect: 'disadvantage'
    },
    desecrated: { 
      name: 'Desecrated Ground', 
      movementCost: 1, 
      description: 'Unholy area that affects celestials and fey.',
      creatureTypes: ['celestial', 'fey'],
      effect: 'disadvantage'
    }
  };
}

/**
 * Get predefined weather types
 * @returns {Object} Predefined weather types
 */
export function getWeatherTypes() {
  return {
    clear: { 
      name: 'Clear', 
      description: 'Clear skies with good visibility.',
      visibilityEffect: 'normal'
    },
    cloudy: { 
      name: 'Cloudy', 
      description: 'Overcast skies with normal visibility.',
      visibilityEffect: 'normal'
    },
    fog: { 
      name: 'Fog', 
      description: 'Fog reduces visibility.',
      visibilityEffect: 'lightly_obscured',
      intensities: {
        light: { visibilityEffect: 'lightly_obscured', visibilityDistance: 60 },
        moderate: { visibilityEffect: 'lightly_obscured', visibilityDistance: 30 },
        heavy: { visibilityEffect: 'heavily_obscured', visibilityDistance: 10 }
      }
    },
    rain: { 
      name: 'Rain', 
      description: 'Rain reduces visibility and may affect certain actions.',
      visibilityEffect: 'lightly_obscured',
      intensities: {
        light: { visibilityEffect: 'normal', disadvantage: ['perception'] },
        moderate: { visibilityEffect: 'lightly_obscured', disadvantage: ['perception', 'ranged_attacks'] },
        heavy: { visibilityEffect: 'lightly_obscured', disadvantage: ['perception', 'ranged_attacks'], difficult_terrain: true }
      }
    },
    storm: { 
      name: 'Thunderstorm', 
      description: 'Lightning and thunder with heavy rain.',
      visibilityEffect: 'lightly_obscured',
      intensities: {
        light: { visibilityEffect: 'lightly_obscured', disadvantage: ['perception', 'ranged_attacks'] },
        moderate: { 
          visibilityEffect: 'heavily_obscured', 
          disadvantage: ['perception', 'ranged_attacks'], 
          difficult_terrain: true,
          effects: [{ type: 'lightning_strike', chance: 0.05, damage: '4d10', damageType: 'lightning' }]
        },
        heavy: { 
          visibilityEffect: 'heavily_obscured', 
          disadvantage: ['perception', 'ranged_attacks', 'concentration'], 
          difficult_terrain: true,
          effects: [{ type: 'lightning_strike', chance: 0.1, damage: '8d10', damageType: 'lightning' }]
        }
      }
    },
    snow: { 
      name: 'Snow', 
      description: 'Falling snow reduces visibility and creates difficult terrain.',
      visibilityEffect: 'lightly_obscured',
      intensities: {
        light: { visibilityEffect: 'normal', disadvantage: ['perception'] },
        moderate: { visibilityEffect: 'lightly_obscured', disadvantage: ['perception'], difficult_terrain: true },
        heavy: { visibilityEffect: 'heavily_obscured', disadvantage: ['perception', 'ranged_attacks'], difficult_terrain: true }
      }
    },
    sandstorm: { 
      name: 'Sandstorm', 
      description: 'Blowing sand severely reduces visibility and may cause damage.',
      visibilityEffect: 'heavily_obscured',
      intensities: {
        light: { visibilityEffect: 'lightly_obscured', disadvantage: ['perception', 'ranged_attacks'] },
        moderate: { 
          visibilityEffect: 'heavily_obscured', 
          disadvantage: ['perception', 'ranged_attacks'], 
          difficult_terrain: true
        },
        heavy: { 
          visibilityEffect: 'heavily_obscured', 
          disadvantage: ['perception', 'ranged_attacks', 'concentration'], 
          difficult_terrain: true,
          effects: [{ type: 'abrasion', damage: '1d4', damageType: 'slashing', interval: 1 }]
        }
      }
    },
    ash: { 
      name: 'Ash Fall', 
      description: 'Falling volcanic ash reduces visibility and may cause suffocation.',
      visibilityEffect: 'heavily_obscured',
      intensities: {
        light: { visibilityEffect: 'lightly_obscured', disadvantage: ['perception'] },
        moderate: { 
          visibilityEffect: 'heavily_obscured', 
          disadvantage: ['perception', 'ranged_attacks'], 
          difficult_terrain: true
        },
        heavy: { 
          visibilityEffect: 'heavily_obscured', 
          disadvantage: ['perception', 'ranged_attacks', 'concentration'], 
          difficult_terrain: true,
          effects: [{ type: 'suffocation', savingThrow: { ability: 'con', dc: 10 }, condition: 'poisoned' }]
        }
      }
    }
  };
}

/**
 * Get predefined time of day options
 * @returns {Object} Predefined time of day options
 */
export function getTimeOfDayOptions() {
  return {
    dawn: { 
      name: 'Dawn', 
      description: 'Early morning light with long shadows.',
      visibilityEffect: 'lightly_obscured',
      lightLevel: 'dim'
    },
    day: { 
      name: 'Day', 
      description: 'Full daylight with good visibility.',
      visibilityEffect: 'normal',
      lightLevel: 'bright'
    },
    dusk: { 
      name: 'Dusk', 
      description: 'Fading light with long shadows.',
      visibilityEffect: 'lightly_obscured',
      lightLevel: 'dim'
    },
    night: { 
      name: 'Night', 
      description: 'Darkness with limited visibility.',
      visibilityEffect: 'heavily_obscured',
      lightLevel: 'dark'
    },
    night_moon: { 
      name: 'Moonlit Night', 
      description: 'Night with moonlight providing some visibility.',
      visibilityEffect: 'lightly_obscured',
      lightLevel: 'dim'
    }
  };
}

// Export the main lair functions
export default {
  createLair,
  createLairTemplateLibrary,
  createEnvironmentManager,
  LairFeatureType,
  TriggerType,
  getTerrainTypes,
  getWeatherTypes,
  getTimeOfDayOptions
};
