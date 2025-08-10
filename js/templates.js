/**
 * Jesster's Combat Tracker
 * Templates Module
 * Version 2.3.1
 * 
 * This module provides template management functionality for saving and reusing
 * combatants, encounters, and other game elements.
 */

/**
 * Template types
 */
const TemplateType = {
  COMBATANT: 'combatant',
  ENCOUNTER: 'encounter',
  MAP: 'map',
  CUSTOM: 'custom'
};

/**
 * Template collection class
 */
class TemplateCollection {
  /**
   * Create a template collection
   * @param {string} type - Template type
   * @param {string} name - Collection name
   */
  constructor(type, name) {
    this.type = type;
    this.name = name;
    this.templates = [];
  }

  /**
   * Add a template
   * @param {Object} template - Template data
   * @returns {Object} The added template
   */
  addTemplate(template) {
    const newTemplate = {
      id: template.id || `template_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: template.name || 'Unnamed Template',
      description: template.description || '',
      data: template.data || {},
      tags: template.tags || [],
      createdAt: template.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.templates.push(newTemplate);
    return newTemplate;
  }

  /**
   * Get a template by ID
   * @param {string} id - Template ID
   * @returns {Object|null} The template or null if not found
   */
  getTemplate(id) {
    return this.templates.find(t => t.id === id) || null;
  }

  /**
   * Update a template
   * @param {string} id - Template ID
   * @param {Object} updates - Template updates
   * @returns {Object|null} The updated template or null if not found
   */
  updateTemplate(id, updates) {
    const template = this.getTemplate(id);
    
    if (!template) return null;
    
    Object.assign(template, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    
    return template;
  }

  /**
   * Remove a template
   * @param {string} id - Template ID
   * @returns {boolean} True if template was removed
   */
  removeTemplate(id) {
    const index = this.templates.findIndex(t => t.id === id);
    
    if (index === -1) return false;
    
    this.templates.splice(index, 1);
    return true;
  }

  /**
   * Search templates
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Array} Matching templates
   */
  searchTemplates(query, options = {}) {
    if (!query) return [...this.templates];
    
    const searchFields = options.fields || ['name', 'description', 'tags'];
    const lowerQuery = query.toLowerCase();
    
    return this.templates.filter(template => {
      return searchFields.some(field => {
        if (field === 'tags' && Array.isArray(template.tags)) {
          return template.tags.some(tag => 
            tag.toLowerCase().includes(lowerQuery)
          );
        }
        
        if (typeof template[field] === 'string') {
          return template[field].toLowerCase().includes(lowerQuery);
        }
        
        return false;
      });
    });
  }

  /**
   * Get templates by tag
   * @param {string} tag - Tag to filter by
   * @returns {Array} Templates with the specified tag
   */
  getTemplatesByTag(tag) {
    if (!tag) return [...this.templates];
    
    const lowerTag = tag.toLowerCase();
    
    return this.templates.filter(template => 
      template.tags && template.tags.some(t => t.toLowerCase() === lowerTag)
    );
  }

  /**
   * Export collection to JSON
   * @returns {string} JSON string
   */
  exportToJson() {
    return JSON.stringify({
      type: this.type,
      name: this.name,
      templates: this.templates
    }, null, 2);
  }

  /**
   * Import collection from JSON
   * @param {string} json - JSON string
   * @returns {boolean} True if import was successful
   */
  importFromJson(json) {
    try {
      const data = JSON.parse(json);
      
      if (data.type !== this.type) {
        throw new Error(`Template type mismatch: expected ${this.type}, got ${data.type}`);
      }
      
      this.name = data.name || this.name;
      this.templates = data.templates || [];
      
      return true;
    } catch (error) {
      console.error('Error importing templates:', error);
      return false;
    }
  }
}

/**
 * Template manager class
 */
class TemplateManager {
  /**
   * Create a template manager
   */
  constructor() {
    this.collections = new Map();
    this.listeners = [];
  }

  /**
   * Create a template collection
   * @param {string} type - Template type
   * @param {string} name - Collection name
   * @returns {TemplateCollection} The created collection
   */
  createCollection(type, name) {
    const collection = new TemplateCollection(type, name);
    this.collections.set(`${type}:${name}`, collection);
    
    this._notifyListeners('collectionCreated', { type, name, collection });
    
    return collection;
  }

  /**
   * Get a template collection
   * @param {string} type - Template type
   * @param {string} name - Collection name
   * @returns {TemplateCollection|null} The collection or null if not found
   */
  getCollection(type, name) {
    return this.collections.get(`${type}:${name}`) || null;
  }

  /**
   * Get all collections of a type
   * @param {string} type - Template type
   * @returns {Array} Collections of the specified type
   */
  getCollectionsByType(type) {
    const result = [];
    
    for (const [key, collection] of this.collections.entries()) {
      if (key.startsWith(`${type}:`)) {
        result.push(collection);
      }
    }
    
    return result;
  }

  /**
   * Remove a template collection
   * @param {string} type - Template type
   * @param {string} name - Collection name
   * @returns {boolean} True if collection was removed
   */
  removeCollection(type, name) {
    const key = `${type}:${name}`;
    const collection = this.collections.get(key);
    
    if (!collection) return false;
    
    this.collections.delete(key);
    
    this._notifyListeners('collectionRemoved', { type, name, collection });
    
    return true;
  }

    /**
   * Add a template
   * @param {string} type - Template type
   * @param {string} collectionName - Collection name
   * @param {Object} template - Template data
   * @returns {Object|null} The added template or null if collection not found
   */
  addTemplate(type, collectionName, template) {
    const collection = this.getCollection(type, collectionName);
    
    if (!collection) return null;
    
    const newTemplate = collection.addTemplate(template);
    
    this._notifyListeners('templateAdded', {
      type,
      collectionName,
      template: newTemplate
    });
    
    return newTemplate;
  }

  /**
   * Get a template
   * @param {string} type - Template type
   * @param {string} collectionName - Collection name
   * @param {string} id - Template ID
   * @returns {Object|null} The template or null if not found
   */
  getTemplate(type, collectionName, id) {
    const collection = this.getCollection(type, collectionName);
    
    if (!collection) return null;
    
    return collection.getTemplate(id);
  }

  /**
   * Update a template
   * @param {string} type - Template type
   * @param {string} collectionName - Collection name
   * @param {string} id - Template ID
   * @param {Object} updates - Template updates
   * @returns {Object|null} The updated template or null if not found
   */
  updateTemplate(type, collectionName, id, updates) {
    const collection = this.getCollection(type, collectionName);
    
    if (!collection) return null;
    
    const updatedTemplate = collection.updateTemplate(id, updates);
    
    if (updatedTemplate) {
      this._notifyListeners('templateUpdated', {
        type,
        collectionName,
        template: updatedTemplate
      });
    }
    
    return updatedTemplate;
  }

  /**
   * Remove a template
   * @param {string} type - Template type
   * @param {string} collectionName - Collection name
   * @param {string} id - Template ID
   * @returns {boolean} True if template was removed
   */
  removeTemplate(type, collectionName, id) {
    const collection = this.getCollection(type, collectionName);
    
    if (!collection) return false;
    
    const removed = collection.removeTemplate(id);
    
    if (removed) {
      this._notifyListeners('templateRemoved', {
        type,
        collectionName,
        id
      });
    }
    
    return removed;
  }

  /**
   * Search templates across all collections
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Array} Matching templates with collection info
   */
  searchAllTemplates(query, options = {}) {
    const results = [];
    
    for (const [key, collection] of this.collections.entries()) {
      const [type, name] = key.split(':');
      
      if (options.type && type !== options.type) {
        continue;
      }
      
      const matches = collection.searchTemplates(query, options);
      
      matches.forEach(template => {
        results.push({
          type,
          collectionName: name,
          template
        });
      });
    }
    
    return results;
  }

  /**
   * Export all collections to JSON
   * @returns {string} JSON string
   */
  exportAllToJson() {
    const data = {
      version: '2.3.1',
      collections: []
    };
    
    for (const [key, collection] of this.collections.entries()) {
      const [type, name] = key.split(':');
      
      data.collections.push({
        type,
        name,
        templates: collection.templates
      });
    }
    
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import collections from JSON
   * @param {string} json - JSON string
   * @returns {boolean} True if import was successful
   */
  importFromJson(json) {
    try {
      const data = JSON.parse(json);
      
      if (!data.collections || !Array.isArray(data.collections)) {
        throw new Error('Invalid template data format');
      }
      
      data.collections.forEach(collectionData => {
        const { type, name, templates } = collectionData;
        
        if (!type || !name) {
          console.warn('Skipping collection with missing type or name');
          return;
        }
        
        // Get or create collection
        let collection = this.getCollection(type, name);
        
        if (!collection) {
          collection = this.createCollection(type, name);
        }
        
        // Add templates
        if (templates && Array.isArray(templates)) {
          templates.forEach(template => {
            // Skip if template with same ID already exists
            if (collection.getTemplate(template.id)) {
              return;
            }
            
            collection.addTemplate(template);
          });
        }
      });
      
      this._notifyListeners('templatesImported', { data });
      
      return true;
    } catch (error) {
      console.error('Error importing templates:', error);
      return false;
    }
  }

  /**
   * Save templates to local storage
   * @param {string} key - Storage key
   * @returns {boolean} True if save was successful
   */
  saveToLocalStorage(key = 'jct-templates') {
    try {
      const json = this.exportAllToJson();
      localStorage.setItem(key, json);
      return true;
    } catch (error) {
      console.error('Error saving templates to local storage:', error);
      return false;
    }
  }

  /**
   * Load templates from local storage
   * @param {string} key - Storage key
   * @returns {boolean} True if load was successful
   */
  loadFromLocalStorage(key = 'jct-templates') {
    try {
      const json = localStorage.getItem(key);
      
      if (!json) return false;
      
      return this.importFromJson(json);
    } catch (error) {
      console.error('Error loading templates from local storage:', error);
      return false;
    }
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
        console.error('Error in template manager listener:', error);
      }
    });
  }
}

/**
 * Create a template manager
 * @returns {TemplateManager} A new template manager instance
 */
export function createTemplateManager() {
  return new TemplateManager();
}

/**
 * Create a template collection
 * @param {string} type - Template type
 * @param {string} name - Collection name
 * @returns {TemplateCollection} A new template collection instance
 */
export function createTemplateCollection(type, name) {
  return new TemplateCollection(type, name);
}

export { TemplateType };

export default {
  createTemplateManager,
  createTemplateCollection,
  TemplateType
};
