/**
 * Jesster's Combat Tracker
 * Search Module
 * Version 2.3.1
 * 
 * This module handles searching and filtering functionality across different data types
 * like monsters, players, and encounters.
 */

/**
 * Search result types
 */
export const SearchResultType = {
  MONSTER: 'monster',
  PLAYER: 'player',
  ENCOUNTER: 'encounter',
  SPELL: 'spell',
  ITEM: 'item',
  FEATURE: 'feature',
  TEMPLATE: 'template'
};

/**
 * Search modes
 */
export const SearchMode = {
  BASIC: 'basic',
  ADVANCED: 'advanced',
  FUZZY: 'fuzzy',
  EXACT: 'exact'
};

/**
 * Class for handling search operations
 */
export class SearchEngine {
  /**
   * Create a search engine
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      defaultMode: options.defaultMode || SearchMode.BASIC,
      fuzzyThreshold: options.fuzzyThreshold || 0.6,
      maxResults: options.maxResults || 100,
      searchDelay: options.searchDelay || 300,
      enableHighlighting: options.enableHighlighting !== undefined ? options.enableHighlighting : true,
      ...options
    };
    
    this.dataProviders = {
      [SearchResultType.MONSTER]: options.monsterProvider || null,
      [SearchResultType.PLAYER]: options.playerProvider || null,
      [SearchResultType.ENCOUNTER]: options.encounterProvider || null,
      [SearchResultType.SPELL]: options.spellProvider || null,
      [SearchResultType.ITEM]: options.itemProvider || null,
      [SearchResultType.FEATURE]: options.featureProvider || null,
      [SearchResultType.TEMPLATE]: options.templateProvider || null
    };
    
    this.searchCache = new Map();
    this.searchTimeout = null;
    this.lastQuery = '';
    this.listeners = [];
  }

  /**
   * Set a data provider for a specific result type
   * @param {string} type - The result type
   * @param {Object} provider - The data provider
   */
  setDataProvider(type, provider) {
    if (!Object.values(SearchResultType).includes(type)) {
      console.warn(`Unknown search result type: ${type}`);
      return;
    }
    
    this.dataProviders[type] = provider;
    this.clearCache(type);
  }

  /**
   * Get a data provider for a specific result type
   * @param {string} type - The result type
   * @returns {Object|null} The data provider
   */
  getDataProvider(type) {
    return this.dataProviders[type] || null;
  }

  /**
   * Search across all data types
   * @param {string} query - The search query
   * @param {Object} options - Search options
   * @returns {Promise<Object>} The search results
   */
  async search(query, options = {}) {
    const searchOptions = {
      mode: options.mode || this.options.defaultMode,
      types: options.types || Object.values(SearchResultType),
      filters: options.filters || {},
      maxResults: options.maxResults || this.options.maxResults,
      ...options
    };
    
    // Clear timeout if there's a pending search
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    // Store the query
    this.lastQuery = query;
    
    // Return empty results for empty query
    if (!query || query.trim() === '') {
      const emptyResults = this._createEmptyResults(searchOptions.types);
      this._notifyListeners('searchCompleted', { query, results: emptyResults, options: searchOptions });
      return emptyResults;
    }
    
    // Check cache for exact match
    const cacheKey = this._getCacheKey(query, searchOptions);
    if (this.searchCache.has(cacheKey)) {
      const cachedResults = this.searchCache.get(cacheKey);
      this._notifyListeners('searchCompleted', { query, results: cachedResults, options: searchOptions, fromCache: true });
      return cachedResults;
    }
    
    // Notify that search has started
    this._notifyListeners('searchStarted', { query, options: searchOptions });
    
    // Create a promise that will resolve after the search delay
    return new Promise(resolve => {
      this.searchTimeout = setTimeout(async () => {
        try {
          // Perform the search
          const results = await this._performSearch(query, searchOptions);
          
          // Cache the results
          this.searchCache.set(cacheKey, results);
          
          // Notify listeners
          this._notifyListeners('searchCompleted', { query, results, options: searchOptions });
          
          resolve(results);
        } catch (error) {
          console.error('Search failed:', error);
          
          // Notify listeners of error
          this._notifyListeners('searchFailed', { query, error, options: searchOptions });
          
          // Return empty results on error
          const emptyResults = this._createEmptyResults(searchOptions.types);
          resolve(emptyResults);
        }
      }, this.options.searchDelay);
    });
  }

  /**
   * Perform the actual search
   * @param {string} query - The search query
   * @param {Object} options - Search options
   * @returns {Promise<Object>} The search results
   * @private
   */
  async _performSearch(query, options) {
    const results = this._createEmptyResults(options.types);
    const normalizedQuery = this._normalizeQuery(query);
    
    // Search each enabled type
    const searchPromises = options.types.map(async type => {
      const provider = this.dataProviders[type];
      
      if (!provider) {
        return;
      }
      
      try {
        let typeResults;
        
        // Use the appropriate search method based on the mode
        switch (options.mode) {
          case SearchMode.ADVANCED:
            typeResults = await this._performAdvancedSearch(normalizedQuery, type, provider, options);
            break;
          case SearchMode.FUZZY:
            typeResults = await this._performFuzzySearch(normalizedQuery, type, provider, options);
            break;
          case SearchMode.EXACT:
            typeResults = await this._performExactSearch(normalizedQuery, type, provider, options);
            break;
          case SearchMode.BASIC:
          default:
            typeResults = await this._performBasicSearch(normalizedQuery, type, provider, options);
            break;
        }
        
        // Apply filters
        if (options.filters && options.filters[type]) {
          typeResults = this._applyFilters(typeResults, options.filters[type]);
        }
        
        // Apply result limit
        const maxTypeResults = options.maxResultsPerType || Math.ceil(options.maxResults / options.types.length);
        if (typeResults.length > maxTypeResults) {
          typeResults = typeResults.slice(0, maxTypeResults);
        }
        
        // Add to results
        results[type] = typeResults;
        results.totalCount += typeResults.length;
      } catch (error) {
        console.error(`Search failed for type ${type}:`, error);
      }
    });
    
    // Wait for all searches to complete
    await Promise.all(searchPromises);
    
    return results;
  }

  /**
   * Perform a basic search
   * @param {string} query - The normalized search query
   * @param {string} type - The result type
   * @param {Object} provider - The data provider
   * @param {Object} options - Search options
   * @returns {Promise<Array>} The search results
   * @private
   */
  async _performBasicSearch(query, type, provider, options) {
    // Get all data from the provider
    const allData = await this._getDataFromProvider(provider);
    
    // Filter data based on the query
    return allData.filter(item => {
      // Check if any searchable field contains the query
      return this._getSearchableFields(item, type).some(field => {
        const fieldValue = this._getFieldValue(item, field);
        if (typeof fieldValue !== 'string') return false;
        
        return fieldValue.toLowerCase().includes(query);
      });
    }).map(item => this._createSearchResult(item, type, query));
  }

  /**
   * Perform an advanced search with query syntax
   * @param {string} query - The normalized search query
   * @param {string} type - The result type
   * @param {Object} provider - The data provider
   * @param {Object} options - Search options
   * @returns {Promise<Array>} The search results
   * @private
   */
  async _performAdvancedSearch(query, type, provider, options) {
    // Parse the query into conditions
    const conditions = this._parseAdvancedQuery(query);
    
    // Get all data from the provider
    const allData = await this._getDataFromProvider(provider);
    
    // Filter data based on the conditions
    return allData.filter(item => {
      // Check if the item matches all conditions
      return conditions.every(condition => {
        const { field, operator, value } = condition;
        
        // Get the field value
        let fieldValue;
        if (field === '*') {
          // Check all searchable fields
          return this._getSearchableFields(item, type).some(searchField => {
            const searchFieldValue = this._getFieldValue(item, searchField);
            return this._evaluateCondition(searchFieldValue, operator, value);
          });
        } else {
          fieldValue = this._getFieldValue(item, field);
          return this._evaluateCondition(fieldValue, operator, value);
        }
      });
    }).map(item => this._createSearchResult(item, type, query));
  }

  /**
   * Perform a fuzzy search
   * @param {string} query - The normalized search query
   * @param {string} type - The result type
   * @param {Object} provider - The data provider
   * @param {Object} options - Search options
   * @returns {Promise<Array>} The search results
   * @private
   */
  async _performFuzzySearch(query, type, provider, options) {
    // Get all data from the provider
    const allData = await this._getDataFromProvider(provider);
    
    // Calculate fuzzy matches
    const results = [];
    
    for (const item of allData) {
      // Check each searchable field
      let bestScore = 0;
      let bestMatch = '';
      
      for (const field of this._getSearchableFields(item, type)) {
        const fieldValue = this._getFieldValue(item, field);
        if (typeof fieldValue !== 'string') continue;
        
        const score = this._calculateFuzzyScore(query, fieldValue.toLowerCase());
        
        if (score > bestScore) {
          bestScore = score;
          bestMatch = fieldValue;
        }
      }
      
      // Add to results if score is above threshold
      if (bestScore >= this.options.fuzzyThreshold) {
        results.push({
          ...this._createSearchResult(item, type, query),
          score: bestScore,
          match: bestMatch
        });
      }
    }
    
    // Sort by score (highest first)
    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Perform an exact search
   * @param {string} query - The normalized search query
   * @param {string} type - The result type
   * @param {Object} provider - The data provider
   * @param {Object} options - Search options
   * @returns {Promise<Array>} The search results
   * @private
   */
  async _performExactSearch(query, type, provider, options) {
    // Get all data from the provider
    const allData = await this._getDataFromProvider(provider);
    
    // Filter data based on exact matches
    return allData.filter(item => {
      // Check if any searchable field exactly matches the query
      return this._getSearchableFields(item, type).some(field => {
        const fieldValue = this._getFieldValue(item, field);
        if (typeof fieldValue !== 'string') return false;
        
        return fieldValue.toLowerCase() === query;
      });
    }).map(item => this._createSearchResult(item, type, query));
  }

  /**
   * Apply filters to search results
   * @param {Array} results - The search results
   * @param {Object} filters - The filters to apply
   * @returns {Array} The filtered results
   * @private
   */
  _applyFilters(results, filters) {
    if (!filters || Object.keys(filters).length === 0) {
      return results;
    }
    
    return results.filter(result => {
      // Check if the result matches all filters
      return Object.entries(filters).every(([field, value]) => {
        const fieldValue = this._getFieldValue(result.item, field);
        
        // Handle array values (OR condition)
        if (Array.isArray(value)) {
          return value.length === 0 || value.some(v => this._matchesFilter(fieldValue, v));
        }
        
        return this._matchesFilter(fieldValue, value);
      });
    });
  }

  /**
   * Check if a field value matches a filter value
   * @param {*} fieldValue - The field value
   * @param {*} filterValue - The filter value
   * @returns {boolean} True if the field matches the filter
   * @private
   */
  _matchesFilter(fieldValue, filterValue) {
    // Handle null/undefined
    if (fieldValue === null || fieldValue === undefined) {
      return filterValue === null || filterValue === undefined;
    }
    
    // Handle arrays (check if any element matches)
    if (Array.isArray(fieldValue)) {
      return fieldValue.some(v => this._matchesFilter(v, filterValue));
    }
    
    // Handle objects (check if any property matches)
    if (typeof fieldValue === 'object') {
      return Object.values(fieldValue).some(v => this._matchesFilter(v, filterValue));
    }
    
    // Handle numbers
    if (typeof fieldValue === 'number') {
      if (typeof filterValue === 'object') {
        // Range filter
        if (filterValue.min !== undefined && fieldValue < filterValue.min) return false;
        if (filterValue.max !== undefined && fieldValue > filterValue.max) return false;
        return true;
      }
      
      return fieldValue === Number(filterValue);
    }
    
    // Handle strings
    if (typeof fieldValue === 'string') {
      if (typeof filterValue === 'string') {
        return fieldValue.toLowerCase().includes(filterValue.toLowerCase());
      }
      
      return String(fieldValue) === String(filterValue);
    }
    
    // Handle booleans
    if (typeof fieldValue === 'boolean') {
      if (typeof filterValue === 'string') {
        return fieldValue === (filterValue.toLowerCase() === 'true');
      }
      
      return fieldValue === filterValue;
    }
    
    // Default comparison
    return fieldValue === filterValue;
  }

  /**
   * Parse an advanced query string into conditions
   * @param {string} query - The query string
   * @returns {Array} Array of conditions
   * @private
   */
  _parseAdvancedQuery(query) {
    // Simple parser for field:value syntax
    const conditions = [];
    const parts = query.split(/\s+(?=\w+:)/);
    
    for (const part of parts) {
      if (part.includes(':')) {
        // Field:value syntax
        const [field, ...valueParts] = part.split(':');
        let value = valueParts.join(':').trim();
        let operator = '=';
        
        // Check for operators
        if (value.startsWith('>=')) {
          operator = '>=';
          value = value.substring(2).trim();
        } else if (value.startsWith('<=')) {
          operator = '<=';
          value = value.substring(2).trim();
        } else if (value.startsWith('>')) {
          operator = '>';
          value = value.substring(1).trim();
        } else if (value.startsWith('<')) {
          operator = '<';
          value = value.substring(1).trim();
        } else if (value.startsWith('!')) {
          operator = '!=';
          value = value.substring(1).trim();
        }
        
        conditions.push({
          field: field.trim(),
          operator,
          value
        });
      } else {
        // Simple text search
        conditions.push({
          field: '*',
          operator: '=',
          value: part.trim()
        });
      }
    }
    
    return conditions;
  }

  /**
   * Evaluate a condition
   * @param {*} fieldValue - The field value
   * @param {string} operator - The operator
   * @param {*} conditionValue - The condition value
   * @returns {boolean} True if the condition is met
   * @private
   */
  _evaluateCondition(fieldValue, operator, conditionValue) {
    // Handle null/undefined
    if (fieldValue === null || fieldValue === undefined) {
      return operator === '!=' ? conditionValue !== null : conditionValue === null;
    }
    
    // Handle arrays
    if (Array.isArray(fieldValue)) {
      return fieldValue.some(v => this._evaluateCondition(v, operator, conditionValue));
    }
    
    // Convert to appropriate types
    let typedFieldValue = fieldValue;
    let typedConditionValue = conditionValue;
    
    if (typeof fieldValue === 'number') {
      typedConditionValue = Number(conditionValue);
    } else if (typeof fieldValue === 'boolean') {
      typedConditionValue = conditionValue.toLowerCase() === 'true';
    } else {
      // String comparison
      if (typeof fieldValue === 'string') {
        typedFieldValue = fieldValue.toLowerCase();
      } else {
        typedFieldValue = String(fieldValue).toLowerCase();
      }
      
      typedConditionValue = String(conditionValue).toLowerCase();
    }
    
    // Evaluate based on operator
    switch (operator) {
      case '=':
        if (typeof typedFieldValue === 'string') {
          return typedFieldValue.includes(typedConditionValue);
        }
        return typedFieldValue === typedConditionValue;
      case '!=':
        if (typeof typedFieldValue === 'string') {
          return !typedFieldValue.includes(typedConditionValue);
        }
        return typedFieldValue !== typedConditionValue;
      case '>':
        return typedFieldValue > typedConditionValue;
      case '>=':
        return typedFieldValue >= typedConditionValue;
      case '<':
        return typedFieldValue < typedConditionValue;
      case '<=':
        return typedFieldValue <= typedConditionValue;
      default:
        return false;
    }
  }

  /**
   * Calculate a fuzzy match score
   * @param {string} query - The search query
   * @param {string} text - The text to match against
   * @returns {number} The match score (0-1)
   * @private
   */
  _calculateFuzzyScore(query, text) {
    // Simple implementation of a fuzzy match algorithm
    if (text.includes(query)) {
      return 1.0;
    }
    
    let score = 0;
    let queryIndex = 0;
    let consecutiveMatches = 0;
    
    // Check for characters in sequence
    for (let i = 0; i < text.length && queryIndex < query.length; i++) {
      if (text[i] === query[queryIndex]) {
        score += 0.1;
        score += consecutiveMatches * 0.1; // Bonus for consecutive matches
        queryIndex++;
        consecutiveMatches++;
      } else {
        consecutiveMatches = 0;
      }
    }
    
    // Normalize score based on query length
    score = queryIndex === query.length ? score / query.length : 0;
    
    // Bonus for matching at start of words
    if (text.startsWith(query)) {
      score += 0.3;
    } else {
      const words = text.split(/\s+/);
      for (const word of words) {
        if (word.startsWith(query)) {
          score += 0.2;
          break;
        }
      }
    }
    
    return Math.min(1, score);
  }

  /**
   * Get searchable fields for an item based on its type
   * @param {Object} item - The item to get fields for
   * @param {string} type - The item type
   * @returns {Array} Array of field names
   * @private
   */
  _getSearchableFields(item, type) {
    // Default searchable fields by type
    const defaultFields = {
      [SearchResultType.MONSTER]: ['name', 'type', 'subtype', 'size', 'alignment', 'cr', 'source'],
      [SearchResultType.PLAYER]: ['name', 'playerName', 'race', 'class', 'background'],
      [SearchResultType.ENCOUNTER]: ['name', 'description', 'location'],
      [SearchResultType.SPELL]: ['name', 'school', 'level', 'classes', 'description'],
      [SearchResultType.ITEM]: ['name', 'type', 'rarity', 'description'],
      [SearchResultType.FEATURE]: ['name', 'source', 'description'],
      [SearchResultType.TEMPLATE]: ['name', 'type', 'description']
    };
    
    // Get provider-specific fields if available
    const provider = this.dataProviders[type];
    const providerFields = provider && typeof provider.getSearchableFields === 'function'
      ? provider.getSearchableFields()
      : defaultFields[type] || ['name'];
    
    return providerFields;
  }

  /**
   * Get a field value from an item
   * @param {Object} item - The item to get the field from
   * @param {string} field - The field name
   * @returns {*} The field value
   * @private
   */
  _getFieldValue(item, field) {
    // Handle nested fields (e.g., 'meta.name')
    if (field.includes('.')) {
      const parts = field.split('.');
      let value = item;
      
      for (const part of parts) {
        if (value === null || value === undefined) {
          return undefined;
        }
        
        value = value[part];
      }
      
      return value;
    }
    
    // Special case for 'class' field in player items
    if (field === 'class' && item.classes) {
      if (Array.isArray(item.classes)) {
        return item.classes.map(c => c.name || c).join(', ');
      }
      return item.classes;
    }
    
    // Special case for 'cr' field in monster items
    if (field === 'cr' && item.challengeRating) {
      if (typeof item.challengeRating === 'object') {
        return item.challengeRating.text || item.challengeRating.value;
      }
      return item.challengeRating;
    }
    
    return item[field];
  }

  /**
   * Create a search result object
   * @param {Object} item - The item
   * @param {string} type - The result type
   * @param {string} query - The search query
   * @returns {Object} The search result
   * @private
   */
  _createSearchResult(item, type, query) {
    // Get the display name
    let name = item.name || 'Unknown';
    let description = '';
    
    // Get type-specific description
    switch (type) {
      case SearchResultType.MONSTER:
        description = `${item.size || ''} ${item.type || ''}, CR ${
          item.challengeRating?.text || item.challengeRating || '?'
        }`;
        break;
      case SearchResultType.PLAYER:
        description = this._formatPlayerDescription(item);
        break;
      case SearchResultType.ENCOUNTER:
        description = item.description || `${item.combatants?.length || 0} combatants`;
        break;
      case SearchResultType.SPELL:
        description = `Level ${item.level || 0} ${item.school || ''} spell`;
        break;
      case SearchResultType.ITEM:
        description = `${item.rarity || ''} ${item.type || 'item'}`;
        break;
      default:
        description = item.description || '';
    }
    
    // Create the result object
    const result = {
      id: item.id || generateId(),
      name,
      description,
      type,
      item
    };
    
    // Add highlighting if enabled
    if (this.options.enableHighlighting) {
      result.highlights = this._generateHighlights(item, type, query);
    }
    
    return result;
  }

  /**
   * Format a player description
   * @param {Object} player - The player item
   * @returns {string} The formatted description
   * @private
   */
  _formatPlayerDescription(player) {
    let description = '';
    
    // Add race
    if (player.race) {
      description += player.race;
    }
    
    // Add classes
    if (player.classes && player.classes.length > 0) {
      if (description) description += ' ';
      
      description += player.classes.map(cls => {
        return `${cls.name || cls} ${cls.level || ''}`.trim();
      }).join(', ');
    }
    
    // Add level if not included in classes
    if (!description.includes('level') && player.level) {
      description += ` Level ${player.level}`;
    }
    
    return description || 'Player Character';
  }

  /**
   * Generate highlights for search results
   * @param {Object} item - The item
   * @param {string} type - The result type
   * @param {string} query - The search query
   * @returns {Object} The highlights
   * @private
   */
  _generateHighlights(item, type, query) {
    const highlights = {};
    const normalizedQuery = this._normalizeQuery(query);
    
    // Check each searchable field
    for (const field of this._getSearchableFields(item, type)) {
      const fieldValue = this._getFieldValue(item, field);
      
      if (typeof fieldValue === 'string') {
        const normalizedValue = fieldValue.toLowerCase();
        
        if (normalizedValue.includes(normalizedQuery)) {
          // Find all occurrences
          const indices = [];
          let startIndex = 0;
          
          while (true) {
            const index = normalizedValue.indexOf(normalizedQuery, startIndex);
            if (index === -1) break;
            
            indices.push({
              start: index,
              end: index + normalizedQuery.length
            });
            
            startIndex = index + 1;
          }
          
          if (indices.length > 0) {
            highlights[field] = {
              value: fieldValue,
              indices
            };
          }
        }
      }
    }
    
    return highlights;
  }

  /**
   * Normalize a query string
   * @param {string} query - The query string
   * @returns {string} The normalized query
   * @private
   */
  _normalizeQuery(query) {
    return query.toLowerCase().trim();
  }

  /**
   * Get data from a provider
   * @param {Object} provider - The data provider
   * @returns {Promise<Array>} The data
   * @private
   */
  async _getDataFromProvider(provider) {
    if (!provider) {
      return [];
    }
    
    if (typeof provider.getData === 'function') {
      return await provider.getData();
    }
    
    if (typeof provider.getAllItems === 'function') {
      return await provider.getAllItems();
    }
    
    if (Array.isArray(provider)) {
      return provider;
    }
    
    return [];
  }

  /**
   * Create empty results object
   * @param {Array} types - The result types
   * @returns {Object} The empty results
   * @private
   */
  _createEmptyResults(types) {
    const results = {
      totalCount: 0
    };
    
    types.forEach(type => {
      results[type] = [];
    });
    
    return results;
  }

  /**
   * Get a cache key for a query and options
   * @param {string} query - The search query
   * @param {Object} options - The search options
   * @returns {string} The cache key
   * @private
   */
  _getCacheKey(query, options) {
    const { mode, types, filters } = options;
    return `${query}|${mode}|${types.join(',')}|${JSON.stringify(filters)}`;
  }

  /**
   * Clear the search cache
   * @param {string} type - The result type to clear (all if not specified)
   */
  clearCache(type = null) {
    if (type) {
      // Clear cache entries for the specified type
      for (const [key, value] of this.searchCache.entries()) {
        if (key.includes(type)) {
          this.searchCache.delete(key);
        }
      }
    } else {
      // Clear all cache
      this.searchCache.clear();
    }
  }

  /**
   * Add a listener for search events
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
        console.error('Error in search engine listener:', error);
      }
    });
  }
}

/**
 * Class for indexing and searching data
 */
export class SearchIndex {
  /**
   * Create a search index
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      caseSensitive: options.caseSensitive || false,
      tokenizer: options.tokenizer || this._defaultTokenizer,
      stemmer: options.stemmer || this._defaultStemmer,
      stopWords: options.stopWords || this._getDefaultStopWords(),
      ...options
    };
    
    this.documents = new Map();
    this.index = new Map();
    this.fields = options.fields || ['name', 'description'];
  }

    /**
   * Add a document to the index
   * @param {Object} document - The document to add
   * @param {string} id - The document ID (generated if not provided)
   * @returns {string} The document ID
   */
  addDocument(document, id = null) {
    // Generate ID if not provided
    const docId = id || generateId();
    
    // Store the document
    this.documents.set(docId, document);
    
    // Index the document
    this._indexDocument(docId, document);
    
    return docId;
  }

  /**
   * Remove a document from the index
   * @param {string} id - The document ID
   * @returns {boolean} True if the document was removed
   */
  removeDocument(id) {
    if (!this.documents.has(id)) {
      return false;
    }
    
    // Get the document
    const document = this.documents.get(id);
    
    // Remove from index
    this._removeFromIndex(id, document);
    
    // Remove from documents
    this.documents.delete(id);
    
    return true;
  }

  /**
   * Update a document in the index
   * @param {string} id - The document ID
   * @param {Object} document - The updated document
   * @returns {boolean} True if the document was updated
   */
  updateDocument(id, document) {
    if (!this.documents.has(id)) {
      return false;
    }
    
    // Remove old document from index
    this._removeFromIndex(id, this.documents.get(id));
    
    // Store the updated document
    this.documents.set(id, document);
    
    // Index the updated document
    this._indexDocument(id, document);
    
    return true;
  }

  /**
   * Search the index
   * @param {string} query - The search query
   * @param {Object} options - Search options
   * @returns {Array} The search results
   */
  search(query, options = {}) {
    const searchOptions = {
      limit: options.limit || 100,
      threshold: options.threshold || 0,
      fields: options.fields || this.fields,
      ...options
    };
    
    // Tokenize the query
    const tokens = this._tokenizeAndStem(query);
    
    if (tokens.length === 0) {
      return [];
    }
    
    // Get matching documents with scores
    const results = this._findMatchingDocuments(tokens, searchOptions);
    
    // Sort by score (highest first)
    results.sort((a, b) => b.score - a.score);
    
    // Apply limit
    if (searchOptions.limit > 0 && results.length > searchOptions.limit) {
      return results.slice(0, searchOptions.limit);
    }
    
    return results;
  }

  /**
   * Clear the index
   */
  clear() {
    this.documents.clear();
    this.index.clear();
  }

  /**
   * Get the number of documents in the index
   * @returns {number} The document count
   */
  getDocumentCount() {
    return this.documents.size;
  }

  /**
   * Set the fields to index
   * @param {Array} fields - The field names
   */
  setFields(fields) {
    this.fields = fields;
    
    // Re-index all documents
    this.reindex();
  }

  /**
   * Reindex all documents
   */
  reindex() {
    // Clear the index
    this.index.clear();
    
    // Re-index all documents
    for (const [id, document] of this.documents.entries()) {
      this._indexDocument(id, document);
    }
  }

  /**
   * Index a document
   * @param {string} id - The document ID
   * @param {Object} document - The document to index
   * @private
   */
  _indexDocument(id, document) {
    // Process each field
    for (const field of this.fields) {
      const value = this._getFieldValue(document, field);
      
      if (value === null || value === undefined) {
        continue;
      }
      
      // Tokenize and stem the field value
      const tokens = this._tokenizeAndStem(String(value));
      
      // Add tokens to the index
      for (const token of tokens) {
        if (!this.index.has(token)) {
          this.index.set(token, new Map());
        }
        
        const tokenIndex = this.index.get(token);
        
        if (!tokenIndex.has(id)) {
          tokenIndex.set(id, { count: 0, fields: new Set() });
        }
        
        const docEntry = tokenIndex.get(id);
        docEntry.count++;
        docEntry.fields.add(field);
      }
    }
  }

  /**
   * Remove a document from the index
   * @param {string} id - The document ID
   * @param {Object} document - The document to remove
   * @private
   */
  _removeFromIndex(id, document) {
    // Process each field
    for (const field of this.fields) {
      const value = this._getFieldValue(document, field);
      
      if (value === null || value === undefined) {
        continue;
      }
      
      // Tokenize and stem the field value
      const tokens = this._tokenizeAndStem(String(value));
      
      // Remove tokens from the index
      for (const token of tokens) {
        if (this.index.has(token)) {
          const tokenIndex = this.index.get(token);
          
          if (tokenIndex.has(id)) {
            tokenIndex.delete(id);
            
            // Remove the token entry if empty
            if (tokenIndex.size === 0) {
              this.index.delete(token);
            }
          }
        }
      }
    }
  }

  /**
   * Find documents matching the tokens
   * @param {Array} tokens - The search tokens
   * @param {Object} options - Search options
   * @returns {Array} The matching documents with scores
   * @private
   */
  _findMatchingDocuments(tokens, options) {
    const scores = new Map();
    const docCount = this.documents.size;
    
    // Calculate TF-IDF score for each token and document
    for (const token of tokens) {
      if (!this.index.has(token)) {
        continue;
      }
      
      const tokenIndex = this.index.get(token);
      const idf = Math.log(docCount / tokenIndex.size);
      
      for (const [docId, entry] of tokenIndex.entries()) {
        // Check if document has the required fields
        if (options.fields && options.fields.length > 0) {
          const hasRequiredField = options.fields.some(field => entry.fields.has(field));
          if (!hasRequiredField) {
            continue;
          }
        }
        
        // Calculate score
        const tf = entry.count;
        const score = tf * idf;
        
        // Add to scores
        if (!scores.has(docId)) {
          scores.set(docId, 0);
        }
        
        scores.set(docId, scores.get(docId) + score);
      }
    }
    
    // Create results array
    const results = [];
    
    for (const [docId, score] of scores.entries()) {
      // Skip if below threshold
      if (score < options.threshold) {
        continue;
      }
      
      // Add to results
      results.push({
        id: docId,
        item: this.documents.get(docId),
        score
      });
    }
    
    return results;
  }

  /**
   * Tokenize and stem text
   * @param {string} text - The text to process
   * @returns {Array} The processed tokens
   * @private
   */
  _tokenizeAndStem(text) {
    // Tokenize
    const tokens = this.options.tokenizer(text);
    
    // Filter stop words
    const filteredTokens = this.options.stopWords.length > 0
      ? tokens.filter(token => !this.options.stopWords.includes(token))
      : tokens;
    
    // Stem
    return filteredTokens.map(token => this.options.stemmer(token));
  }

  /**
   * Default tokenizer function
   * @param {string} text - The text to tokenize
   * @returns {Array} The tokens
   * @private
   */
  _defaultTokenizer(text) {
    if (!text) return [];
    
    // Convert to lowercase if not case sensitive
    const processedText = this.options?.caseSensitive ? text : text.toLowerCase();
    
    // Split on non-alphanumeric characters
    return processedText
      .split(/[^\p{L}\p{N}]+/u)
      .filter(token => token.length > 0);
  }

  /**
   * Default stemmer function (identity function)
   * @param {string} token - The token to stem
   * @returns {string} The stemmed token
   * @private
   */
  _defaultStemmer(token) {
    return token;
  }

  /**
   * Get default stop words
   * @returns {Array} Array of stop words
   * @private
   */
  _getDefaultStopWords() {
    return [
      'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for',
      'if', 'in', 'into', 'is', 'it', 'no', 'not', 'of', 'on', 'or',
      'such', 'that', 'the', 'their', 'then', 'there', 'these', 'they',
      'this', 'to', 'was', 'will', 'with'
    ];
  }

  /**
   * Get a field value from an object
   * @param {Object} obj - The object
   * @param {string} field - The field name
   * @returns {*} The field value
   * @private
   */
  _getFieldValue(obj, field) {
    // Handle nested fields (e.g., 'meta.name')
    if (field.includes('.')) {
      const parts = field.split('.');
      let value = obj;
      
      for (const part of parts) {
        if (value === null || value === undefined) {
          return undefined;
        }
        
        value = value[part];
      }
      
      return value;
    }
    
    return obj[field];
  }
}

/**
 * Class for filtering data
 */
export class DataFilter {
  /**
   * Create a data filter
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      caseSensitive: options.caseSensitive || false,
      ...options
    };
    
    this.filters = new Map();
  }

  /**
   * Add a filter
   * @param {string} field - The field to filter on
   * @param {*} value - The filter value
   * @param {string} operator - The filter operator
   * @returns {DataFilter} The filter instance for chaining
   */
  addFilter(field, value, operator = '=') {
    this.filters.set(field, { value, operator });
    return this;
  }

  /**
   * Remove a filter
   * @param {string} field - The field to remove the filter for
   * @returns {boolean} True if the filter was removed
   */
  removeFilter(field) {
    return this.filters.delete(field);
  }

  /**
   * Clear all filters
   */
  clearFilters() {
    this.filters.clear();
  }

  /**
   * Get all filters
   * @returns {Object} The filters
   */
  getFilters() {
    const filters = {};
    
    for (const [field, filter] of this.filters.entries()) {
      filters[field] = filter;
    }
    
    return filters;
  }

  /**
   * Apply filters to data
   * @param {Array} data - The data to filter
   * @returns {Array} The filtered data
   */
  applyFilters(data) {
    if (!data || !Array.isArray(data)) {
      return [];
    }
    
    if (this.filters.size === 0) {
      return data;
    }
    
    return data.filter(item => this._matchesFilters(item));
  }

  /**
   * Check if an item matches all filters
   * @param {Object} item - The item to check
   * @returns {boolean} True if the item matches all filters
   * @private
   */
  _matchesFilters(item) {
    for (const [field, filter] of this.filters.entries()) {
      const fieldValue = this._getFieldValue(item, field);
      
      if (!this._matchesFilter(fieldValue, filter.value, filter.operator)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Check if a field value matches a filter
   * @param {*} fieldValue - The field value
   * @param {*} filterValue - The filter value
   * @param {string} operator - The filter operator
   * @returns {boolean} True if the field matches the filter
   * @private
   */
  _matchesFilter(fieldValue, filterValue, operator) {
    // Handle null/undefined
    if (fieldValue === null || fieldValue === undefined) {
      return operator === '!=' ? filterValue !== null : filterValue === null;
    }
    
    // Handle arrays (check if any element matches)
    if (Array.isArray(fieldValue)) {
      return fieldValue.some(v => this._matchesFilter(v, filterValue, operator));
    }
    
    // Handle objects (check if any property matches)
    if (typeof fieldValue === 'object') {
      return Object.values(fieldValue).some(v => this._matchesFilter(v, filterValue, operator));
    }
    
    // Convert to appropriate types
    let typedFieldValue = fieldValue;
    let typedFilterValue = filterValue;
    
    if (typeof fieldValue === 'number') {
      typedFilterValue = Number(filterValue);
    } else if (typeof fieldValue === 'boolean') {
      if (typeof filterValue === 'string') {
        typedFilterValue = filterValue.toLowerCase() === 'true';
      }
    } else {
      // String comparison
      if (typeof fieldValue === 'string' && typeof filterValue === 'string') {
        if (!this.options.caseSensitive) {
          typedFieldValue = fieldValue.toLowerCase();
          typedFilterValue = filterValue.toLowerCase();
        }
      } else {
        typedFieldValue = String(fieldValue);
        typedFilterValue = String(filterValue);
        
        if (!this.options.caseSensitive) {
          typedFieldValue = typedFieldValue.toLowerCase();
          typedFilterValue = typedFilterValue.toLowerCase();
        }
      }
    }
    
    // Evaluate based on operator
    switch (operator) {
      case '=':
        if (typeof typedFieldValue === 'string' && typeof typedFilterValue === 'string') {
          return typedFieldValue.includes(typedFilterValue);
        }
        return typedFieldValue === typedFilterValue;
      case '==':
        return typedFieldValue === typedFilterValue;
      case '!=':
        return typedFieldValue !== typedFilterValue;
      case '>':
        return typedFieldValue > typedFilterValue;
      case '>=':
        return typedFieldValue >= typedFilterValue;
      case '<':
        return typedFieldValue < typedFilterValue;
      case '<=':
        return typedFieldValue <= typedFilterValue;
      case 'contains':
        if (typeof typedFieldValue === 'string' && typeof typedFilterValue === 'string') {
          return typedFieldValue.includes(typedFilterValue);
        }
        return false;
      case 'startsWith':
        if (typeof typedFieldValue === 'string' && typeof typedFilterValue === 'string') {
          return typedFieldValue.startsWith(typedFilterValue);
        }
        return false;
      case 'endsWith':
        if (typeof typedFieldValue === 'string' && typeof typedFilterValue === 'string') {
          return typedFieldValue.endsWith(typedFilterValue);
        }
        return false;
      case 'in':
        if (Array.isArray(typedFilterValue)) {
          return typedFilterValue.includes(typedFieldValue);
        }
        return false;
      case 'notIn':
        if (Array.isArray(typedFilterValue)) {
          return !typedFilterValue.includes(typedFieldValue);
        }
        return true;
      default:
        return false;
    }
  }

  /**
   * Get a field value from an object
   * @param {Object} obj - The object
   * @param {string} field - The field name
   * @returns {*} The field value
   * @private
   */
  _getFieldValue(obj, field) {
    // Handle nested fields (e.g., 'meta.name')
    if (field.includes('.')) {
      const parts = field.split('.');
      let value = obj;
      
      for (const part of parts) {
        if (value === null || value === undefined) {
          return undefined;
        }
        
        value = value[part];
      }
      
      return value;
    }
    
    return obj[field];
  }
}

/**
 * Class for sorting data
 */
export class DataSorter {
  /**
   * Create a data sorter
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      caseSensitive: options.caseSensitive || false,
      ...options
    };
    
    this.sortFields = [];
  }

  /**
   * Add a sort field
   * @param {string} field - The field to sort by
   * @param {boolean} ascending - Whether to sort in ascending order
   * @returns {DataSorter} The sorter instance for chaining
   */
  addSortField(field, ascending = true) {
    this.sortFields.push({ field, ascending });
    return this;
  }

  /**
   * Remove a sort field
   * @param {string} field - The field to remove
   * @returns {boolean} True if the field was removed
   */
  removeSortField(field) {
    const initialLength = this.sortFields.length;
    this.sortFields = this.sortFields.filter(sort => sort.field !== field);
    
    return this.sortFields.length < initialLength;
  }

  /**
   * Clear all sort fields
   */
  clearSortFields() {
    this.sortFields = [];
  }

  /**
   * Get all sort fields
   * @returns {Array} The sort fields
   */
  getSortFields() {
    return [...this.sortFields];
  }

  /**
   * Apply sorting to data
   * @param {Array} data - The data to sort
   * @returns {Array} The sorted data
   */
  applySort(data) {
    if (!data || !Array.isArray(data)) {
      return [];
    }
    
    if (this.sortFields.length === 0) {
      return data;
    }
    
    // Create a copy of the data to avoid modifying the original
    const sortedData = [...data];
    
    // Sort the data
    sortedData.sort((a, b) => {
      for (const { field, ascending } of this.sortFields) {
        const valueA = this._getFieldValue(a, field);
        const valueB = this._getFieldValue(b, field);
        
        const comparison = this._compareValues(valueA, valueB);
        
        if (comparison !== 0) {
          return ascending ? comparison : -comparison;
        }
      }
      
      return 0;
    });
    
    return sortedData;
  }

  /**
   * Compare two values
   * @param {*} a - The first value
   * @param {*} b - The second value
   * @returns {number} The comparison result
   * @private
   */
  _compareValues(a, b) {
    // Handle null/undefined
    if (a === null || a === undefined) {
      return b === null || b === undefined ? 0 : -1;
    }
    
    if (b === null || b === undefined) {
      return 1;
    }
    
    // Handle different types
    const typeA = typeof a;
    const typeB = typeof b;
    
    if (typeA !== typeB) {
      // Sort by type name
      return typeA.localeCompare(typeB);
    }
    
    // Handle specific types
    switch (typeA) {
      case 'number':
        return a - b;
      case 'boolean':
        return a === b ? 0 : (a ? 1 : -1);
      case 'string':
        if (this.options.caseSensitive) {
          return a.localeCompare(b);
        } else {
          return a.toLowerCase().localeCompare(b.toLowerCase());
        }
      case 'object':
        // Handle arrays
        if (Array.isArray(a) && Array.isArray(b)) {
          // Compare array length
          const lengthComparison = a.length - b.length;
          if (lengthComparison !== 0) {
            return lengthComparison;
          }
          
          // Compare elements
          for (let i = 0; i < a.length; i++) {
            const elementComparison = this._compareValues(a[i], b[i]);
            if (elementComparison !== 0) {
              return elementComparison;
            }
          }
          
          return 0;
        }
        
        // Handle dates
        if (a instanceof Date && b instanceof Date) {
          return a.getTime() - b.getTime();
        }
        
        // Convert objects to strings
        return String(a).localeCompare(String(b));
      default:
        // Convert to strings
        return String(a).localeCompare(String(b));
    }
  }

  /**
   * Get a field value from an object
   * @param {Object} obj - The object
   * @param {string} field - The field name
   * @returns {*} The field value
   * @private
   */
  _getFieldValue(obj, field) {
    // Handle nested fields (e.g., 'meta.name')
    if (field.includes('.')) {
      const parts = field.split('.');
      let value = obj;
      
      for (const part of parts) {
        if (value === null || value === undefined) {
          return undefined;
        }
        
        value = value[part];
      }
      
      return value;
    }
    
    return obj[field];
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
 * Create a search engine
 * @param {Object} options - Configuration options
 * @returns {SearchEngine} A new search engine instance
 */
export function createSearchEngine(options = {}) {
  return new SearchEngine(options);
}

/**
 * Create a search index
 * @param {Object} options - Configuration options
 * @returns {SearchIndex} A new search index instance
 */
export function createSearchIndex(options = {}) {
  return new SearchIndex(options);
}

/**
 * Create a data filter
 * @param {Object} options - Configuration options
 * @returns {DataFilter} A new data filter instance
 */
export function createDataFilter(options = {}) {
  return new DataFilter(options);
}

/**
 * Create a data sorter
 * @param {Object} options - Configuration options
 * @returns {DataSorter} A new data sorter instance
 */
export function createDataSorter(options = {}) {
  return new DataSorter(options);
}

/**
 * Highlight text with HTML tags
 * @param {string} text - The text to highlight
 * @param {string} query - The query to highlight
 * @param {Object} options - Highlighting options
 * @returns {string} The highlighted text
 */
export function highlightText(text, query, options = {}) {
  if (!text || !query) {
    return text;
  }
  
  const highlightOptions = {
    tag: options.tag || 'mark',
    className: options.className || 'highlight',
    caseSensitive: options.caseSensitive || false,
    ...options
  };
  
  const normalizedText = highlightOptions.caseSensitive ? text : text.toLowerCase();
  const normalizedQuery = highlightOptions.caseSensitive ? query : query.toLowerCase();
  
  let result = '';
  let lastIndex = 0;
  
  // Find all occurrences of the query
  let index = normalizedText.indexOf(normalizedQuery);
  
  while (index !== -1) {
    // Add text before the match
    result += text.substring(lastIndex, index);
    
    // Add the highlighted match
    const match = text.substring(index, index + query.length);
    result += `<${highlightOptions.tag} class="${highlightOptions.className}">${match}</${highlightOptions.tag}>`;
    
    // Update indices
    lastIndex = index + query.length;
    index = normalizedText.indexOf(normalizedQuery, lastIndex);
  }
  
  // Add remaining text
  result += text.substring(lastIndex);
  
  return result;
}

// Export the main search functions
export default {
  createSearchEngine,
  createSearchIndex,
  createDataFilter,
  createDataSorter,
  highlightText,
  SearchResultType,
  SearchMode
};
