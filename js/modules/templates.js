/**
 * Jesster's Combat Tracker
 * Templates Module
 * Version 2.3.1
 * 
 * This module handles templates for encounters, monsters, players, and other game elements.
 */

/**
 * Template types
 */
export const TemplateType = {
  ENCOUNTER: 'encounter',
  MONSTER: 'monster',
  PLAYER: 'player',
  SPELL: 'spell',
  ITEM: 'item',
  FEATURE: 'feature',
  CONDITION: 'condition',
  BATTLEFIELD: 'battlefield',
  CUSTOM: 'custom'
};

/**
 * Class representing a template
 */
export class Template {
  /**
   * Create a template
   * @param {Object} data - Template data
   */
  constructor(data = {}) {
    this.id = data.id || generateId();
    this.name = data.name || 'Unnamed Template';
    this.type = data.type || TemplateType.CUSTOM;
    this.description = data.description || '';
    this.tags = data.tags || [];
    this.author = data.author || '';
    this.version = data.version || '1.0.0';
    this.created = data.created || new Date().toISOString();
    this.modified = data.modified || new Date().toISOString();
    this.content = data.content || {};
    this.metadata = data.metadata || {};
    this.customProperties = data.customProperties || {};
  }

  /**
   * Update the template
   * @param {Object} updates - The updates to apply
   */
  update(updates) {
    // Apply updates
    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created') {
        this[key] = value;
      }
    });
    
    // Update modified timestamp
    this.modified = new Date().toISOString();
  }

  /**
   * Clone the template
   * @param {Object} overrides - Properties to override in the clone
   * @returns {Template} A new template instance
   */
  clone(overrides = {}) {
    // Create a deep copy of the template
    const clone = new Template({
      id: generateId(), // Always generate a new ID
      name: `${this.name} (Copy)`,
      type: this.type,
      description: this.description,
      tags: [...this.tags],
      author: this.author,
      version: this.version,
      created: new Date().toISOString(), // New creation date
      modified: new Date().toISOString(),
      content: JSON.parse(JSON.stringify(this.content)),
      metadata: JSON.parse(JSON.stringify(this.metadata)),
      customProperties: JSON.parse(JSON.stringify(this.customProperties))
    });
    
    // Apply overrides
    Object.entries(overrides).forEach(([key, value]) => {
      clone[key] = value;
    });
    
    return clone;
  }

  /**
   * Apply the template to an object
   * @param {Object} target - The target object
   * @param {Object} options - Application options
   * @returns {Object} The modified target
   */
  applyTo(target, options = {}) {
    const {
      overwrite = true,
      properties = null,
      exclude = []
    } = options;
    
    // Determine which properties to apply
    const contentKeys = properties || Object.keys(this.content);
    
    // Apply each property
    for (const key of contentKeys) {
      // Skip excluded properties
      if (exclude.includes(key)) {
        continue;
      }
      
      // Skip if property exists and we're not overwriting
      if (!overwrite && target[key] !== undefined) {
        continue;
      }
      
      // Apply the property
      if (this.content[key] !== undefined) {
        // Deep copy for objects and arrays
        if (typeof this.content[key] === 'object' && this.content[key] !== null) {
          target[key] = JSON.parse(JSON.stringify(this.content[key]));
        } else {
          target[key] = this.content[key];
        }
      }
    }
    
    return target;
  }

  /**
   * Create a template from an object
   * @param {Object} source - The source object
   * @param {Object} options - Creation options
   * @returns {Template} A new template
   */
  static fromObject(source, options = {}) {
    const {
      name = 'Template from Object',
      type = TemplateType.CUSTOM,
      description = '',
      properties = null,
      exclude = ['id'],
      metadata = {}
    } = options;
    
    // Determine which properties to include
    const contentKeys = properties || Object.keys(source);
    
    // Create content object
    const content = {};
    
    for (const key of contentKeys) {
      // Skip excluded properties
      if (exclude.includes(key)) {
        continue;
      }
      
      // Deep copy for objects and arrays
      if (typeof source[key] === 'object' && source[key] !== null) {
        content[key] = JSON.parse(JSON.stringify(source[key]));
      } else {
        content[key] = source[key];
      }
    }
    
    // Create the template
    return new Template({
      name,
      type,
      description,
      content,
      metadata
    });
  }

  /**
   * Convert the template to a plain object
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      description: this.description,
      tags: [...this.tags],
      author: this.author,
      version: this.version,
      created: this.created,
      modified: this.modified,
      content: JSON.parse(JSON.stringify(this.content)),
      metadata: JSON.parse(JSON.stringify(this.metadata)),
      customProperties: JSON.parse(JSON.stringify(this.customProperties))
    };
  }

  /**
   * Create a template from JSON
   * @param {Object} json - The JSON data
   * @returns {Template} A new template instance
   */
  static fromJSON(json) {
    return new Template(json);
  }
}

/**
 * Class for managing templates
 */
export class TemplateManager {
  /**
   * Create a template manager
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      ...options
    };
    
    this.templates = new Map();
    this.listeners = [];
  }

  /**
   * Add a template
   * @param {Template|Object} template - The template to add
   * @returns {Template} The added template
   */
  addTemplate(template) {
    // Convert to Template instance if needed
    const templateInstance = template instanceof Template ? template : new Template(template);
    
    // Add to templates map
    this.templates.set(templateInstance.id, templateInstance);
    
    // Notify listeners
    this._notifyListeners('templateAdded', { template: templateInstance });
    
    return templateInstance;
  }

  /**
   * Get a template by ID
   * @param {string} id - The template ID
   * @returns {Template|null} The template or null if not found
   */
  getTemplate(id) {
    return this.templates.get(id) || null;
  }

  /**
   * Update a template
   * @param {string} id - The ID of the template to update
   * @param {Object} updates - The updates to apply
   * @returns {Template|null} The updated template or null if not found
   */
  updateTemplate(id, updates) {
    const template = this.getTemplate(id);
    
    if (!template) {
      return null;
    }
    
    // Apply updates
    template.update(updates);
    
    // Notify listeners
    this._notifyListeners('templateUpdated', { template });
    
    return template;
  }

  /**
   * Remove a template
   * @param {string} id - The ID of the template to remove
   * @returns {boolean} True if the template was removed
   */
  removeTemplate(id) {
    const template = this.getTemplate(id);
    
    if (!template) {
      return false;
    }
    
    // Remove from templates map
    this.templates.delete(id);
    
    // Notify listeners
    this._notifyListeners('templateRemoved', { template });
    
    return true;
  }

  /**
   * Get all templates
   * @returns {Array} Array of templates
   */
  getAllTemplates() {
    return Array.from(this.templates.values());
  }

  /**
   * Get templates by type
   * @param {string} type - The template type
   * @returns {Array} Array of templates of the specified type
   */
  getTemplatesByType(type) {
    return this.getAllTemplates().filter(template => template.type === type);
  }

  /**
   * Get templates by tag
   * @param {string} tag - The tag to search for
   * @returns {Array} Array of templates with the specified tag
   */
  getTemplatesByTag(tag) {
    return this.getAllTemplates().filter(template => template.tags.includes(tag));
  }

  /**
   * Search for templates
   * @param {string} query - The search query
   * @param {Object} options - Search options
   * @returns {Array} Matching templates
   */
  searchTemplates(query, options = {}) {
    if (!query) return this.getAllTemplates();
    
    const normalizedQuery = query.toLowerCase();
    const results = [];
    
    // Filter options
    const {
      type = null,
      tags = [],
      author = null,
      exactMatch = false
    } = options;
    
    for (const template of this.templates.values()) {
      // Apply filters
      if (type !== null && template.type !== type) continue;
      if (tags.length > 0 && !tags.every(tag => template.tags.includes(tag))) continue;
      if (author !== null && template.author !== author) continue;
      
      // Check for match
      const nameMatch = exactMatch
        ? template.name.toLowerCase() === normalizedQuery
        : template.name.toLowerCase().includes(normalizedQuery);
      
      const descriptionMatch = !exactMatch && 
        template.description.toLowerCase().includes(normalizedQuery);
      
      if (nameMatch || descriptionMatch) {
        results.push(template);
      }
    }
    
    return results;
  }

  /**
   * Clone a template
   * @param {string} id - The ID of the template to clone
   * @param {Object} overrides - Properties to override in the clone
   * @returns {Template|null} The cloned template or null if not found
   */
  cloneTemplate(id, overrides = {}) {
    const template = this.getTemplate(id);
    
    if (!template) {
      return null;
    }
    
    // Clone the template
    const clone = template.clone(overrides);
    
    // Add the clone to the manager
    this.addTemplate(clone);
    
    return clone;
  }

  /**
   * Create a template from an object
   * @param {Object} source - The source object
   * @param {Object} options - Creation options
   * @returns {Template} The created template
   */
  createTemplateFromObject(source, options = {}) {
    const template = Template.fromObject(source, options);
    
    // Add the template to the manager
    this.addTemplate(template);
    
    return template;
  }

  /**
   * Apply a template to an object
   * @param {string} id - The template ID
   * @param {Object} target - The target object
   * @param {Object} options - Application options
   * @returns {Object|null} The modified target or null if template not found
   */
  applyTemplate(id, target, options = {}) {
    const template = this.getTemplate(id);
    
    if (!template) {
      return null;
    }
    
    // Apply the template
    const result = template.applyTo(target, options);
    
    // Notify listeners
    this._notifyListeners('templateApplied', { template, target });
    
    return result;
  }

  /**
   * Import templates from JSON
   * @param {string} json - JSON string of templates
   * @returns {Object} Import results
   */
  importFromJSON(json) {
    try {
      const data = JSON.parse(json);
      
      if (!data.templates || !Array.isArray(data.templates)) {
        throw new Error('Invalid template data: templates array missing');
      }
      
      const results = {
        imported: 0,
        failed: 0,
        templates: []
      };
      
      // Import templates
      data.templates.forEach(templateData => {
        try {
          const template = new Template(templateData);
          this.addTemplate(template);
          results.imported++;
          results.templates.push(template);
        } catch (error) {
          console.error(`Error importing template ${templateData.name || 'unknown'}:`, error);
          results.failed++;
        }
      });
      
      // Notify listeners
      this._notifyListeners('templatesImported', results);
      
      return results;
    } catch (error) {
      console.error('Error importing templates:', error);
      return {
        imported: 0,
        failed: 0,
        error: error.message
      };
    }
  }

  /**
   * Export templates to JSON
   * @param {Array} templateIds - IDs of templates to export (all if not specified)
   * @returns {string} JSON string of templates
   */
  exportToJSON(templateIds = null) {
    let templates;
    
    if (templateIds) {
      templates = templateIds.map(id => this.getTemplate(id)).filter(Boolean);
    } else {
      templates = this.getAllTemplates();
    }
    
    return JSON.stringify({
      templates,
      version: '2.3.1',
      exportDate: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Add a listener for template manager events
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
        console.error('Error in template manager listener:', error);
      }
    });
  }
}

/**
 * Class for encounter templates
 */
export class EncounterTemplate extends Template {
  /**
   * Create an encounter template
   * @param {Object} data - Template data
   */
  constructor(data = {}) {
    super({
      ...data,
      type: TemplateType.ENCOUNTER
    });
    
    // Ensure required content properties
    this.content.combatants = this.content.combatants || [];
    this.content.round = this.content.round || 0;
    this.content.turn = this.content.turn || 0;
    this.content.active = this.content.active || null;
    this.content.initiative = this.content.initiative || [];
    this.content.battlefield = this.content.battlefield || null;
  }

  /**
   * Apply the template to create a new encounter
   * @param {Object} options - Application options
   * @returns {Object} The created encounter
   */
  createEncounter(options = {}) {
    const {
      encounterFactory = null,
      overrides = {}
    } = options;
    
    // Create base encounter object
    const encounter = {
      id: generateId(),
      name: this.name,
      description: this.description,
      combatants: JSON.parse(JSON.stringify(this.content.combatants)),
      round: this.content.round,
      turn: this.content.turn,
      active: this.content.active,
      initiative: JSON.parse(JSON.stringify(this.content.initiative)),
      battlefield: this.content.battlefield ? JSON.parse(JSON.stringify(this.content.battlefield)) : null,
      ...overrides
    };
    
    // Use factory if provided
    if (encounterFactory && typeof encounterFactory.createEncounter === 'function') {
      return encounterFactory.createEncounter(encounter);
    }
    
    return encounter;
  }

  /**
   * Create an encounter template from an existing encounter
   * @param {Object} encounter - The encounter object
   * @param {Object} options - Creation options
   * @returns {EncounterTemplate} The created template
   */
  static fromEncounter(encounter, options = {}) {
    const {
      name = encounter.name || 'Encounter Template',
      description = encounter.description || '',
      includeBattlefield = true,
      includeInitiative = true
    } = options;
    
    // Create content object
    const content = {
      combatants: JSON.parse(JSON.stringify(encounter.combatants || [])),
      round: 0,
      turn: 0,
      active: null
    };
    
    // Include initiative if requested
    if (includeInitiative && encounter.initiative) {
      content.initiative = JSON.parse(JSON.stringify(encounter.initiative));
    }
    
    // Include battlefield if requested
    if (includeBattlefield && encounter.battlefield) {
      content.battlefield = JSON.parse(JSON.stringify(encounter.battlefield));
    }
    
    // Create the template
    return new EncounterTemplate({
      name,
      description,
      content,
      metadata: {
        originalEncounterId: encounter.id,
        createdFrom: 'encounter'
      }
    });
  }
}

/**
 * Class for monster templates
 */
export class MonsterTemplate extends Template {
  /**
   * Create a monster template
   * @param {Object} data - Template data
   */
  constructor(data = {}) {
    super({
      ...data,
      type: TemplateType.MONSTER
    });
    
    // Ensure required content properties
    this.content.name = this.content.name || this.name;
    this.content.type = this.content.type || 'monster';
    this.content.size = this.content.size || 'medium';
    this.content.hp = this.content.hp || { value: 10, max: 10 };
    this.content.ac = this.content.ac || 10;
    this.content.abilities = this.content.abilities || {
      str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10
    };
  }

  /**
   * Apply the template to create a new monster
   * @param {Object} options - Application options
   * @returns {Object} The created monster
   */
  createMonster(options = {}) {
    const {
      monsterFactory = null,
      overrides = {}
    } = options;
    
    // Create base monster object
    const monster = {
      id: generateId(),
      ...JSON.parse(JSON.stringify(this.content)),
      ...overrides
    };
    
    // Use factory if provided
    if (monsterFactory && typeof monsterFactory.createMonster === 'function') {
      return monsterFactory.createMonster(monster);
    }
    
    return monster;
  }

  /**
   * Create a monster template from an existing monster
   * @param {Object} monster - The monster object
   * @param {Object} options - Creation options
   * @returns {MonsterTemplate} The created template
   */
  static fromMonster(monster, options = {}) {
    const {
      name = monster.name ? `${monster.name} Template` : 'Monster Template',
      description = monster.description || '',
      exclude = ['id', 'uuid', 'currentHp']
    } = options;
    
    // Create content object by copying monster properties
    const content = {};
    
    for (const [key, value] of Object.entries(monster)) {
      if (!exclude.includes(key)) {
        content[key] = JSON.parse(JSON.stringify(value));
      }
    }
    
    // Create the template
    return new MonsterTemplate({
      name,
      description,
      content,
      metadata: {
        originalMonsterId: monster.id,
        createdFrom: 'monster'
      }
    });
  }
}

/**
 * Class for player templates
 */
export class PlayerTemplate extends Template {
  /**
   * Create a player template
   * @param {Object} data - Template data
   */
  constructor(data = {}) {
    super({
      ...data,
      type: TemplateType.PLAYER
    });
    
    // Ensure required content properties
    this.content.name = this.content.name || this.name;
    this.content.playerName = this.content.playerName || '';
    this.content.race = this.content.race || '';
    this.content.classes = this.content.classes || [];
    this.content.level = this.content.level || 1;
    this.content.hp = this.content.hp || { value: 10, max: 10 };
    this.content.ac = this.content.ac || 10;
    this.content.abilities = this.content.abilities || {
      str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10
    };
  }

  /**
   * Apply the template to create a new player character
   * @param {Object} options - Application options
   * @returns {Object} The created player character
   */
  createPlayer(options = {}) {
    const {
      playerFactory = null,
      overrides = {}
    } = options;
    
    // Create base player object
    const player = {
      id: generateId(),
      ...JSON.parse(JSON.stringify(this.content)),
      ...overrides
    };
    
    // Use factory if provided
    if (playerFactory && typeof playerFactory.createPlayer === 'function') {
      return playerFactory.createPlayer(player);
    }
    
    return player;
  }

  /**
   * Create a player template from an existing player character
   * @param {Object} player - The player character object
   * @param {Object} options - Creation options
   * @returns {PlayerTemplate} The created template
   */
  static fromPlayer(player, options = {}) {
    const {
      name = player.name ? `${player.name} Template` : 'Player Template',
      description = player.description || '',
      exclude = ['id', 'uuid', 'currentHp', 'temporaryHp', 'conditions']
    } = options;
    
    // Create content object by copying player properties
    const content = {};
    
    for (const [key, value] of Object.entries(player)) {
      if (!exclude.includes(key)) {
        content[key] = JSON.parse(JSON.stringify(value));
      }
    }
    
    // Create the template
    return new PlayerTemplate({
      name,
      description,
      content,
      metadata: {
        originalPlayerId: player.id,
        createdFrom: 'player'
      }
    });
  }
}

/**
 * Class for spell templates
 */
export class SpellTemplate extends Template {
  /**
   * Create a spell template
   * @param {Object} data - Template data
   */
  constructor(data = {}) {
    super({
      ...data,
      type: TemplateType.SPELL
    });
    
    // Ensure required content properties
    this.content.name = this.content.name || this.name;
    this.content.level = this.content.level !== undefined ? this.content.level : 0;
    this.content.school = this.content.school || 'evocation';
    this.content.castingTime = this.content.castingTime || 'action';
    this.content.range = this.content.range || 'self';
    this.content.components = this.content.components || { V: true, S: true, M: false };
    this.content.duration = this.content.duration || 'instantaneous';
    this.content.description = this.content.description || '';
  }

  /**
   * Apply the template to create a new spell
   * @param {Object} options - Application options
   * @returns {Object} The created spell
   */
  createSpell(options = {}) {
    const {
      spellFactory = null,
      overrides = {}
    } = options;
    
    // Create base spell object
    const spell = {
      id: generateId(),
      ...JSON.parse(JSON.stringify(this.content)),
      ...overrides
    };
    
    // Use factory if provided
    if (spellFactory && typeof spellFactory.createSpell === 'function') {
      return spellFactory.createSpell(spell);
    }
    
    return spell;
  }

  /**
   * Create a spell template from an existing spell
   * @param {Object} spell - The spell object
   * @param {Object} options - Creation options
   * @returns {SpellTemplate} The created template
   */
  static fromSpell(spell, options = {}) {
    const {
      name = spell.name ? `${spell.name} Template` : 'Spell Template',
      description = spell.description || '',
      exclude = ['id', 'uuid']
    } = options;
    
    // Create content object by copying spell properties
    const content = {};
    
    for (const [key, value] of Object.entries(spell)) {
      if (!exclude.includes(key)) {
        content[key] = JSON.parse(JSON.stringify(value));
      }
    }
    
    // Create the template
    return new SpellTemplate({
      name,
      description,
      content,
      metadata: {
        originalSpellId: spell.id,
        createdFrom: 'spell'
      }
    });
  }
}

/**
 * Class for item templates
 */
export class ItemTemplate extends Template {
  /**
   * Create an item template
   * @param {Object} data - Template data
   */
  constructor(data = {}) {
    super({
      ...data,
      type: TemplateType.ITEM
    });
    
    // Ensure required content properties
    this.content.name = this.content.name || this.name;
    this.content.type = this.content.type || 'item';
    this.content.rarity = this.content.rarity || 'common';
    this.content.description = this.content.description || '';
    this.content.weight = this.content.weight || 0;
    this.content.value = this.content.value || 0;
  }

  /**
   * Apply the template to create a new item
   * @param {Object} options - Application options
   * @returns {Object} The created item
   */
  createItem(options = {}) {
    const {
      itemFactory = null,
      overrides = {}
    } = options;
    
    // Create base item object
    const item = {
      id: generateId(),
      ...JSON.parse(JSON.stringify(this.content)),
      ...overrides
    };
    
    // Use factory if provided
    if (itemFactory && typeof itemFactory.createItem === 'function') {
      return itemFactory.createItem(item);
    }
    
    return item;
  }

  /**
   * Create an item template from an existing item
   * @param {Object} item - The item object
   * @param {Object} options - Creation options
   * @returns {ItemTemplate} The created template
   */
  static fromItem(item, options = {}) {
    const {
      name = item.name ? `${item.name} Template` : 'Item Template',
      description = item.description || '',
      exclude = ['id', 'uuid']
    } = options;
    
    // Create content object by copying item properties
    const content = {};
    
    for (const [key, value] of Object.entries(item)) {
      if (!exclude.includes(key)) {
        content[key] = JSON.parse(JSON.stringify(value));
      }
    }
    
    // Create the template
    return new ItemTemplate({
      name,
      description,
      content,
      metadata: {
        originalItemId: item.id,
        createdFrom: 'item'
      }
    });
  }
}

/**
 * Class for battlefield templates
 */
export class BattlefieldTemplate extends Template {
  /**
   * Create a battlefield template
   * @param {Object} data - Template data
   */
  constructor(data = {}) {
    super({
      ...data,
      type: TemplateType.BATTLEFIELD
    });
    
    // Ensure required content properties
    this.content.width = this.content.width || 20;
    this.content.height = this.content.height || 20;
    this.content.gridType = this.content.gridType || 'square';
    this.content.cellSize = this.content.cellSize || 5;
    this.content.cells = this.content.cells || [];
    this.content.features = this.content.features || [];
  }

  /**
   * Apply the template to create a new battlefield
   * @param {Object} options - Application options
   * @returns {Object} The created battlefield
   */
  createBattlefield(options = {}) {
    const {
      battlefieldFactory = null,
      overrides = {}
    } = options;
    
    // Create base battlefield object
    const battlefield = {
      id: generateId(),
      ...JSON.parse(JSON.stringify(this.content)),
      ...overrides
    };
    
    // Use factory if provided
    if (battlefieldFactory && typeof battlefieldFactory.createBattlefield === 'function') {
      return battlefieldFactory.createBattlefield(battlefield);
    }
    
    return battlefield;
  }

  /**
   * Create a battlefield template from an existing battlefield
   * @param {Object} battlefield - The battlefield object
   * @param {Object} options - Creation options
   * @returns {BattlefieldTemplate} The created template
   */
  static fromBattlefield(battlefield, options = {}) {
    const {
      name = battlefield.name || 'Battlefield Template',
      description = battlefield.description || '',
      exclude = ['id', 'uuid', 'combatants']
    } = options;
    
    // Create content object by copying battlefield properties
    const content = {};
    
    for (const [key, value] of Object.entries(battlefield)) {
      if (!exclude.includes(key)) {
        content[key] = JSON.parse(JSON.stringify(value));
      }
    }
    
    // Create the template
    return new BattlefieldTemplate({
      name,
      description,
      content,
      metadata: {
        originalBattlefieldId: battlefield.id,
        createdFrom: 'battlefield'
      }
    });
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
 * Class for feature templates
 */
export class FeatureTemplate extends Template {
  /**
   * Create a feature template
   * @param {Object} data - Template data
   */
  constructor(data = {}) {
    super({
      ...data,
      type: TemplateType.FEATURE
    });
    
    // Ensure required content properties
    this.content.name = this.content.name || this.name;
    this.content.description = this.content.description || '';
    this.content.source = this.content.source || '';
    this.content.requirements = this.content.requirements || [];
    this.content.effects = this.content.effects || [];
  }

  /**
   * Apply the template to create a new feature
   * @param {Object} options - Application options
   * @returns {Object} The created feature
   */
  createFeature(options = {}) {
    const {
      featureFactory = null,
      overrides = {}
    } = options;
    
    // Create base feature object
    const feature = {
      id: generateId(),
      ...JSON.parse(JSON.stringify(this.content)),
      ...overrides
    };
    
    // Use factory if provided
    if (featureFactory && typeof featureFactory.createFeature === 'function') {
      return featureFactory.createFeature(feature);
    }
    
    return feature;
  }

  /**
   * Create a feature template from an existing feature
   * @param {Object} feature - The feature object
   * @param {Object} options - Creation options
   * @returns {FeatureTemplate} The created template
   */
  static fromFeature(feature, options = {}) {
    const {
      name = feature.name ? `${feature.name} Template` : 'Feature Template',
      description = feature.description || '',
      exclude = ['id', 'uuid']
    } = options;
    
    // Create content object by copying feature properties
    const content = {};
    
    for (const [key, value] of Object.entries(feature)) {
      if (!exclude.includes(key)) {
        content[key] = JSON.parse(JSON.stringify(value));
      }
    }
    
    // Create the template
    return new FeatureTemplate({
      name,
      description,
      content,
      metadata: {
        originalFeatureId: feature.id,
        createdFrom: 'feature'
      }
    });
  }
}

/**
 * Class for condition templates
 */
export class ConditionTemplate extends Template {
  /**
   * Create a condition template
   * @param {Object} data - Template data
   */
  constructor(data = {}) {
    super({
      ...data,
      type: TemplateType.CONDITION
    });
    
    // Ensure required content properties
    this.content.name = this.content.name || this.name;
    this.content.description = this.content.description || '';
    this.content.effects = this.content.effects || [];
    this.content.duration = this.content.duration || { type: 'indefinite' };
    this.content.icon = this.content.icon || '';
    this.content.color = this.content.color || '#888888';
  }

  /**
   * Apply the template to create a new condition
   * @param {Object} options - Application options
   * @returns {Object} The created condition
   */
  createCondition(options = {}) {
    const {
      conditionFactory = null,
      overrides = {}
    } = options;
    
    // Create base condition object
    const condition = {
      id: generateId(),
      ...JSON.parse(JSON.stringify(this.content)),
      ...overrides
    };
    
    // Use factory if provided
    if (conditionFactory && typeof conditionFactory.createCondition === 'function') {
      return conditionFactory.createCondition(condition);
    }
    
    return condition;
  }

  /**
   * Create a condition template from an existing condition
   * @param {Object} condition - The condition object
   * @param {Object} options - Creation options
   * @returns {ConditionTemplate} The created template
   */
  static fromCondition(condition, options = {}) {
    const {
      name = condition.name ? `${condition.name} Template` : 'Condition Template',
      description = condition.description || '',
      exclude = ['id', 'uuid', 'appliedAt', 'appliedBy']
    } = options;
    
    // Create content object by copying condition properties
    const content = {};
    
    for (const [key, value] of Object.entries(condition)) {
      if (!exclude.includes(key)) {
        content[key] = JSON.parse(JSON.stringify(value));
      }
    }
    
    // Create the template
    return new ConditionTemplate({
      name,
      description,
      content,
      metadata: {
        originalConditionId: condition.id,
        createdFrom: 'condition'
      }
    });
  }
}

/**
 * Class for custom templates
 */
export class CustomTemplate extends Template {
  /**
   * Create a custom template
   * @param {Object} data - Template data
   */
  constructor(data = {}) {
    super({
      ...data,
      type: TemplateType.CUSTOM
    });
  }

  /**
   * Apply the template to create a new custom object
   * @param {Object} options - Application options
   * @returns {Object} The created object
   */
  createCustomObject(options = {}) {
    const {
      customFactory = null,
      overrides = {}
    } = options;
    
    // Create base object
    const customObject = {
      id: generateId(),
      ...JSON.parse(JSON.stringify(this.content)),
      ...overrides
    };
    
    // Use factory if provided
    if (customFactory && typeof customFactory.createCustomObject === 'function') {
      return customFactory.createCustomObject(customObject);
    }
    
    return customObject;
  }

  /**
   * Create a custom template from an existing object
   * @param {Object} object - The object
   * @param {Object} options - Creation options
   * @returns {CustomTemplate} The created template
   */
  static fromObject(object, options = {}) {
    const {
      name = 'Custom Template',
      description = '',
      exclude = ['id', 'uuid']
    } = options;
    
    // Create content object by copying object properties
    const content = {};
    
    for (const [key, value] of Object.entries(object)) {
      if (!exclude.includes(key)) {
        content[key] = JSON.parse(JSON.stringify(value));
      }
    }
    
    // Create the template
    return new CustomTemplate({
      name,
      description,
      content,
      metadata: {
        originalObjectId: object.id,
        createdFrom: 'object'
      }
    });
  }
}

/**
 * Factory for creating templates based on type
 */
export class TemplateFactory {
  /**
   * Create a template of the specified type
   * @param {string} type - The template type
   * @param {Object} data - Template data
   * @returns {Template} The created template
   */
  static createTemplate(type, data = {}) {
    switch (type) {
      case TemplateType.ENCOUNTER:
        return new EncounterTemplate(data);
      case TemplateType.MONSTER:
        return new MonsterTemplate(data);
      case TemplateType.PLAYER:
        return new PlayerTemplate(data);
      case TemplateType.SPELL:
        return new SpellTemplate(data);
      case TemplateType.ITEM:
        return new ItemTemplate(data);
      case TemplateType.FEATURE:
        return new FeatureTemplate(data);
      case TemplateType.CONDITION:
        return new ConditionTemplate(data);
      case TemplateType.BATTLEFIELD:
        return new BattlefieldTemplate(data);
      case TemplateType.CUSTOM:
      default:
        return new CustomTemplate(data);
    }
  }

  /**
   * Create a template from an existing object
   * @param {Object} object - The source object
   * @param {string} type - The template type
   * @param {Object} options - Creation options
   * @returns {Template} The created template
   */
  static createTemplateFromObject(object, type, options = {}) {
    switch (type) {
      case TemplateType.ENCOUNTER:
        return EncounterTemplate.fromEncounter(object, options);
      case TemplateType.MONSTER:
        return MonsterTemplate.fromMonster(object, options);
      case TemplateType.PLAYER:
        return PlayerTemplate.fromPlayer(object, options);
      case TemplateType.SPELL:
        return SpellTemplate.fromSpell(object, options);
      case TemplateType.ITEM:
        return ItemTemplate.fromItem(object, options);
      case TemplateType.FEATURE:
        return FeatureTemplate.fromFeature(object, options);
      case TemplateType.CONDITION:
        return ConditionTemplate.fromCondition(object, options);
      case TemplateType.BATTLEFIELD:
        return BattlefieldTemplate.fromBattlefield(object, options);
      case TemplateType.CUSTOM:
      default:
        return CustomTemplate.fromObject(object, options);
    }
  }
}

/**
 * Class for template collections
 */
export class TemplateCollection {
  /**
   * Create a template collection
   * @param {Object} data - Collection data
   */
  constructor(data = {}) {
    this.id = data.id || generateId();
    this.name = data.name || 'Unnamed Collection';
    this.description = data.description || '';
    this.author = data.author || '';
    this.version = data.version || '1.0.0';
    this.created = data.created || new Date().toISOString();
    this.modified = data.modified || new Date().toISOString();
    this.templates = new Map();
    
    // Add templates if provided
    if (data.templates && Array.isArray(data.templates)) {
      data.templates.forEach(template => {
        this.addTemplate(template);
      });
    }
  }

  /**
   * Add a template to the collection
   * @param {Template|Object} template - The template to add
   * @returns {Template} The added template
   */
  addTemplate(template) {
    // Convert to Template instance if needed
    const templateInstance = template instanceof Template 
      ? template 
      : TemplateFactory.createTemplate(template.type || TemplateType.CUSTOM, template);
    
    // Add to templates map
    this.templates.set(templateInstance.id, templateInstance);
    
    // Update modified timestamp
    this.modified = new Date().toISOString();
    
    return templateInstance;
  }

  /**
   * Get a template by ID
   * @param {string} id - The template ID
   * @returns {Template|null} The template or null if not found
   */
  getTemplate(id) {
    return this.templates.get(id) || null;
  }

  /**
   * Remove a template from the collection
   * @param {string} id - The ID of the template to remove
   * @returns {boolean} True if the template was removed
   */
  removeTemplate(id) {
    const result = this.templates.delete(id);
    
    if (result) {
      // Update modified timestamp
      this.modified = new Date().toISOString();
    }
    
    return result;
  }

  /**
   * Get all templates in the collection
   * @returns {Array} Array of templates
   */
  getAllTemplates() {
    return Array.from(this.templates.values());
  }

  /**
   * Get templates by type
   * @param {string} type - The template type
   * @returns {Array} Array of templates of the specified type
   */
  getTemplatesByType(type) {
    return this.getAllTemplates().filter(template => template.type === type);
  }

  /**
   * Export the collection to JSON
   * @returns {string} JSON string of the collection
   */
  toJSON() {
    return JSON.stringify({
      id: this.id,
      name: this.name,
      description: this.description,
      author: this.author,
      version: this.version,
      created: this.created,
      modified: this.modified,
      templates: this.getAllTemplates()
    }, null, 2);
  }

  /**
   * Create a collection from JSON
   * @param {string} json - JSON string of the collection
   * @returns {TemplateCollection} The created collection
   */
  static fromJSON(json) {
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    
    return new TemplateCollection(data);
  }
}

/**
 * Class for managing template collections
 */
export class TemplateCollectionManager {
  /**
   * Create a template collection manager
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      ...options
    };
    
    this.collections = new Map();
    this.listeners = [];
  }

  /**
   * Add a collection
   * @param {TemplateCollection|Object} collection - The collection to add
   * @returns {TemplateCollection} The added collection
   */
  addCollection(collection) {
    // Convert to TemplateCollection instance if needed
    const collectionInstance = collection instanceof TemplateCollection 
      ? collection 
      : new TemplateCollection(collection);
    
    // Add to collections map
    this.collections.set(collectionInstance.id, collectionInstance);
    
    // Notify listeners
    this._notifyListeners('collectionAdded', { collection: collectionInstance });
    
    return collectionInstance;
  }

  /**
   * Get a collection by ID
   * @param {string} id - The collection ID
   * @returns {TemplateCollection|null} The collection or null if not found
   */
  getCollection(id) {
    return this.collections.get(id) || null;
  }

  /**
   * Remove a collection
   * @param {string} id - The ID of the collection to remove
   * @returns {boolean} True if the collection was removed
   */
  removeCollection(id) {
    const collection = this.getCollection(id);
    
    if (!collection) {
      return false;
    }
    
    // Remove from collections map
    this.collections.delete(id);
    
    // Notify listeners
    this._notifyListeners('collectionRemoved', { collection });
    
    return true;
  }

  /**
   * Get all collections
   * @returns {Array} Array of collections
   */
  getAllCollections() {
    return Array.from(this.collections.values());
  }

  /**
   * Import collections from JSON
   * @param {string} json - JSON string of collections
   * @returns {Object} Import results
   */
  importFromJSON(json) {
    try {
      const data = JSON.parse(json);
      
      if (!data.collections || !Array.isArray(data.collections)) {
        throw new Error('Invalid collection data: collections array missing');
      }
      
      const results = {
        imported: 0,
        failed: 0,
        collections: []
      };
      
      // Import collections
      data.collections.forEach(collectionData => {
        try {
          const collection = new TemplateCollection(collectionData);
          this.addCollection(collection);
          results.imported++;
          results.collections.push(collection);
        } catch (error) {
          console.error(`Error importing collection ${collectionData.name || 'unknown'}:`, error);
          results.failed++;
        }
      });
      
      // Notify listeners
      this._notifyListeners('collectionsImported', results);
      
      return results;
    } catch (error) {
      console.error('Error importing collections:', error);
      return {
        imported: 0,
        failed: 0,
        error: error.message
      };
    }
  }

  /**
   * Export collections to JSON
   * @param {Array} collectionIds - IDs of collections to export (all if not specified)
   * @returns {string} JSON string of collections
   */
  exportToJSON(collectionIds = null) {
    let collections;
    
    if (collectionIds) {
      collections = collectionIds.map(id => this.getCollection(id)).filter(Boolean);
    } else {
      collections = this.getAllCollections();
    }
    
    return JSON.stringify({
      collections,
      version: '2.3.1',
      exportDate: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Add a listener for collection manager events
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
        console.error('Error in collection manager listener:', error);
      }
    });
  }
}

/**
 * Create a template
 * @param {Object} data - Template data
 * @returns {Template} A new template instance
 */
export function createTemplate(data = {}) {
  return new Template(data);
}

/**
 * Create a template manager
 * @param {Object} options - Configuration options
 * @returns {TemplateManager} A new template manager instance
 */
export function createTemplateManager(options = {}) {
  return new TemplateManager(options);
}

/**
 * Create an encounter template
 * @param {Object} data - Template data
 * @returns {EncounterTemplate} A new encounter template instance
 */
export function createEncounterTemplate(data = {}) {
  return new EncounterTemplate(data);
}

/**
 * Create a monster template
 * @param {Object} data - Template data
 * @returns {MonsterTemplate} A new monster template instance
 */
export function createMonsterTemplate(data = {}) {
  return new MonsterTemplate(data);
}

/**
 * Create a player template
 * @param {Object} data - Template data
 * @returns {PlayerTemplate} A new player template instance
 */
export function createPlayerTemplate(data = {}) {
  return new PlayerTemplate(data);
}

/**
 * Create a spell template
 * @param {Object} data - Template data
 * @returns {SpellTemplate} A new spell template instance
 */
export function createSpellTemplate(data = {}) {
  return new SpellTemplate(data);
}

/**
 * Create an item template
 * @param {Object} data - Template data
 * @returns {ItemTemplate} A new item template instance
 */
export function createItemTemplate(data = {}) {
  return new ItemTemplate(data);
}

/**
 * Create a feature template
 * @param {Object} data - Template data
 * @returns {FeatureTemplate} A new feature template instance
 */
export function createFeatureTemplate(data = {}) {
  return new FeatureTemplate(data);
}

/**
 * Create a condition template
 * @param {Object} data - Template data
 * @returns {ConditionTemplate} A new condition template instance
 */
export function createConditionTemplate(data = {}) {
  return new ConditionTemplate(data);
}

/**
 * Create a battlefield template
 * @param {Object} data - Template data
 * @returns {BattlefieldTemplate} A new battlefield template instance
 */
export function createBattlefieldTemplate(data = {}) {
  return new BattlefieldTemplate(data);
}

/**
 * Create a custom template
 * @param {Object} data - Template data
 * @returns {CustomTemplate} A new custom template instance
 */
export function createCustomTemplate(data = {}) {
  return new CustomTemplate(data);
}

/**
 * Create a template collection
 * @param {Object} data - Collection data
 * @returns {TemplateCollection} A new template collection instance
 */
export function createTemplateCollection(data = {}) {
  return new TemplateCollection(data);
}

/**
 * Create a template collection manager
 * @param {Object} options - Configuration options
 * @returns {TemplateCollectionManager} A new template collection manager instance
 */
export function createTemplateCollectionManager(options = {}) {
  return new TemplateCollectionManager(options);
}

// Export the main template functions and classes
export default {
  createTemplate,
  createTemplateManager,
  createEncounterTemplate,
  createMonsterTemplate,
  createPlayerTemplate,
  createSpellTemplate,
  createItemTemplate,
  createFeatureTemplate,
  createConditionTemplate,
  createBattlefieldTemplate,
  createCustomTemplate,
  createTemplateCollection,
  createTemplateCollectionManager,
  TemplateType,
  TemplateFactory
};
