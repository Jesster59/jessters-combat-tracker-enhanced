/**
 * API module for Jesster's Combat Tracker
 * Handles external API integrations
 */
class API {
    constructor(settings) {
        // Store reference to settings module
        this.settings = settings;
        
        // API configuration
        this.config = {
            dnd5e: {
                baseUrl: 'https://www.dnd5eapi.co/api',
                enabled: true
            },
            openAI: {
                baseUrl: 'https://api.openai.com/v1',
                apiKey: this.settings.get('openAIApiKey') || '',
                enabled: !!this.settings.get('openAIApiKey')
            },
            customApis: this.settings.get('customApis') || []
        };
        
        // Cache for API responses
        this.cache = {
            dnd5e: {},
            openAI: {},
            custom: {}
        };
        
        // Rate limiting
        this.rateLimits = {
            dnd5e: {
                requestsPerMinute: 60,
                requestCount: 0,
                resetTime: Date.now() + 60000
            },
            openAI: {
                requestsPerMinute: 20,
                requestCount: 0,
                resetTime: Date.now() + 60000
            }
        };
        
        console.log("API module initialized");
    }

    /**
     * Initialize the API module
     */
    init() {
        // Reset rate limits every minute
        setInterval(() => this._resetRateLimits(), 60000);
    }

    /**
     * Reset rate limits
     * @private
     */
    _resetRateLimits() {
        Object.keys(this.rateLimits).forEach(api => {
            this.rateLimits[api].requestCount = 0;
            this.rateLimits[api].resetTime = Date.now() + 60000;
        });
    }

    /**
     * Check if rate limit is exceeded
     * @private
     * @param {string} api - API name
     * @returns {boolean} True if rate limit is exceeded
     */
    _isRateLimited(api) {
        const limit = this.rateLimits[api];
        if (!limit) return false;
        
        // Reset if time has passed
        if (Date.now() > limit.resetTime) {
            limit.requestCount = 0;
            limit.resetTime = Date.now() + 60000;
        }
        
        return limit.requestCount >= limit.requestsPerMinute;
    }

    /**
     * Increment rate limit counter
     * @private
     * @param {string} api - API name
     */
    _incrementRateLimit(api) {
        const limit = this.rateLimits[api];
        if (!limit) return;
        
        limit.requestCount++;
    }

    /**
     * Make a fetch request with error handling
     * @private
     * @param {string} url - URL to fetch
     * @param {Object} options - Fetch options
     * @returns {Promise<Object>} Response data
     */
    async _fetchWithErrorHandling(url, options = {}) {
        try {
            const response = await fetch(url, options);
            
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`API fetch error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get data from the D&D 5e API
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @param {boolean} options.useCache - Whether to use cached data
     * @returns {Promise<Object>} API response
     */
    async getDnd5eData(endpoint, options = {}) {
        const { useCache = true } = options;
        
        // Check if API is enabled
        if (!this.config.dnd5e.enabled) {
            throw new Error('D&D 5e API is disabled');
        }
        
        // Check rate limit
        if (this._isRateLimited('dnd5e')) {
            throw new Error('D&D 5e API rate limit exceeded');
        }
        
        // Normalize endpoint
        const normalizedEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
        
        // Check cache
        if (useCache && this.cache.dnd5e[normalizedEndpoint]) {
            return this.cache.dnd5e[normalizedEndpoint];
        }
        
        // Increment rate limit counter
        this._incrementRateLimit('dnd5e');
        
        // Make request
        const url = `${this.config.dnd5e.baseUrl}/${normalizedEndpoint}`;
        const data = await this._fetchWithErrorHandling(url);
        
        // Cache response
        if (useCache) {
            this.cache.dnd5e[normalizedEndpoint] = data;
        }
        
        return data;
    }

    /**
     * Get a monster from the D&D 5e API
     * @param {string} monsterName - Monster name or index
     * @returns {Promise<Object>} Monster data
     */
    async getMonster(monsterName) {
        // Convert monster name to index format
        const index = monsterName.toLowerCase().replace(/\s+/g, '-');
        
        try {
            const monster = await this.getDnd5eData(`monsters/${index}`);
            
            // Transform monster data to our format
            return this._transformMonsterData(monster);
        } catch (error) {
            console.error(`Error fetching monster ${monsterName}:`, error);
            throw error;
        }
    }

    /**
     * Search monsters in the D&D 5e API
     * @param {string} query - Search query
     * @returns {Promise<Array>} Search results
     */
    async searchMonsters(query) {
        try {
            const results = await this.getDnd5eData(`monsters?name=${encodeURIComponent(query)}`);
            
            return results.results || [];
        } catch (error) {
            console.error(`Error searching monsters:`, error);
            throw error;
        }
    }

    /**
     * Get a spell from the D&D 5e API
     * @param {string} spellName - Spell name or index
     * @returns {Promise<Object>} Spell data
     */
    async getSpell(spellName) {
        // Convert spell name to index format
        const index = spellName.toLowerCase().replace(/\s+/g, '-');
        
        try {
            return await this.getDnd5eData(`spells/${index}`);
        } catch (error) {
            console.error(`Error fetching spell ${spellName}:`, error);
            throw error;
        }
    }

    /**
     * Search spells in the D&D 5e API
     * @param {string} query - Search query
     * @returns {Promise<Array>} Search results
     */
    async searchSpells(query) {
        try {
            const results = await this.getDnd5eData(`spells?name=${encodeURIComponent(query)}`);
            
            return results.results || [];
        } catch (error) {
            console.error(`Error searching spells:`, error);
            throw error;
        }
    }

    /**
     * Transform monster data from D&D 5e API format to our format
     * @private
     * @param {Object} apiMonster - Monster data from API
     * @returns {Object} Transformed monster data
     */
    _transformMonsterData(apiMonster) {
        // Extract ability scores
        const abilities = {
            str: apiMonster.strength || 10,
            dex: apiMonster.dexterity || 10,
            con: apiMonster.constitution || 10,
            int: apiMonster.intelligence || 10,
            wis: apiMonster.wisdom || 10,
            cha: apiMonster.charisma || 10
        };
        
        // Create HP formula
        let hpFormula = '';
        if (apiMonster.hit_points_roll) {
            hpFormula = apiMonster.hit_points_roll;
        } else if (apiMonster.hit_dice) {
            const conMod = Math.floor((abilities.con - 10) / 2);
            const conBonus = conMod * apiMonster.hit_dice;
            hpFormula = `${apiMonster.hit_dice}d${apiMonster.hit_dice_size || 8}${conMod >= 0 ? '+' : ''}${conBonus}`;
        }
        
        // Transform actions
        const actions = apiMonster.actions ? apiMonster.actions.map(action => ({
            name: action.name,
            description: action.desc
        })) : [];
        
        // Transform special abilities
        const traits = apiMonster.special_abilities ? apiMonster.special_abilities.map(ability => ({
            name: ability.name,
            description: ability.desc
        })) : [];
        
        // Transform legendary actions
        const legendaryActions = apiMonster.legendary_actions ? apiMonster.legendary_actions.map(action => ({
            name: action.name,
            description: action.desc
        })) : [];
        
        // Transform reactions
        const reactions = apiMonster.reactions ? apiMonster.reactions.map(reaction => ({
            name: reaction.name,
            description: reaction.desc
        })) : [];
        
        // Create monster object
        return {
            id: `monster-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            name: apiMonster.name,
            type: 'monster',
            monsterType: apiMonster.type,
            size: apiMonster.size,
            alignment: apiMonster.alignment,
            ac: apiMonster.armor_class,
            acType: apiMonster.armor_desc,
            hp: apiMonster.hit_points,
            maxHp: apiMonster.hit_points,
            hpFormula: hpFormula,
            speed: this._formatSpeed(apiMonster.speed),
            abilities: abilities,
            savingThrows: this._formatSavingThrows(apiMonster.proficiencies),
            skills: this._formatSkills(apiMonster.proficiencies),
            damageResistances: (apiMonster.damage_resistances || []).join(', '),
            damageImmunities: (apiMonster.damage_immunities || []).join(', '),
            conditionImmunities: (apiMonster.condition_immunities || []).map(c => c.name).join(', '),
            senses: this._formatSenses(apiMonster.senses),
            languages: apiMonster.languages,
            cr: apiMonster.challenge_rating,
            xp: apiMonster.xp,
            traits: traits,
            actions: actions,
            reactions: reactions,
            legendaryActions: legendaryActions,
            environment: apiMonster.environment || [],
            source: 'D&D 5e API'
        };
    }

    /**
     * Format speed from API format
     * @private
     * @param {Object} speed - Speed object from API
     * @returns {string} Formatted speed
     */
    _formatSpeed(speed) {
        if (!speed) return '30 ft.';
        
        const parts = [];
        
        if (speed.walk) parts.push(`${speed.walk}`);
        if (speed.fly) parts.push(`fly ${speed.fly}`);
        if (speed.swim) parts.push(`swim ${speed.swim}`);
        if (speed.climb) parts.push(`climb ${speed.climb}`);
        if (speed.burrow) parts.push(`burrow ${speed.burrow}`);
        
        return parts.join(', ');
    }

    /**
     * Format saving throws from API proficiencies
     * @private
     * @param {Array} proficiencies - Proficiencies array from API
     * @returns {string} Formatted saving throws
     */
    _formatSavingThrows(proficiencies) {
        if (!proficiencies) return '';
        
        const saves = proficiencies.filter(p => p.proficiency.name.startsWith('Saving Throw:'));
        
        if (saves.length === 0) return '';
        
        return saves.map(save => {
            const ability = save.proficiency.name.split(':')[1].trim();
            const value = save.value >= 0 ? `+${save.value}` : save.value;
            return `${ability} ${value}`;
        }).join(', ');
    }

    /**
     * Format skills from API proficiencies
     * @private
     * @param {Array} proficiencies - Proficiencies array from API
     * @returns {string} Formatted skills
     */
    _formatSkills(proficiencies) {
        if (!proficiencies) return '';
        
        const skills = proficiencies.filter(p => p.proficiency.name.startsWith('Skill:'));
        
        if (skills.length === 0) return '';
        
        return skills.map(skill => {
            const skillName = skill.proficiency.name.split(':')[1].trim();
            const value = skill.value >= 0 ? `+${skill.value}` : skill.value;
            return `${skillName} ${value}`;
        }).join(', ');
    }

    /**
     * Format senses from API format
     * @private
     * @param {Object} senses - Senses object from API
     * @returns {string} Formatted senses
     */
    _formatSenses(senses) {
        if (!senses) return 'passive Perception 10';
        
        const parts = [];
        
        if (senses.darkvision) parts.push(`darkvision ${senses.darkvision}`);
        if (senses.blindsight) parts.push(`blindsight ${senses.blindsight}`);
        if (senses.tremorsense) parts.push(`tremorsense ${senses.tremorsense}`);
        if (senses.truesight) parts.push(`truesight ${senses.truesight}`);
        
        parts.push(`passive Perception ${senses.passive_perception || 10}`);
        
        return parts.join(', ');
    }

    /**
     * Generate text using OpenAI API
     * @param {string} prompt - Text prompt
     * @param {Object} options - Generation options
     * @param {string} options.model - Model to use (default: gpt-3.5-turbo)
     * @param {number} options.maxTokens - Maximum tokens to generate
     * @param {number} options.temperature - Temperature for generation
     * @returns {Promise<string>} Generated text
     */
    async generateText(prompt, options = {}) {
        // Check if API is enabled
        if (!this.config.openAI.enabled) {
            throw new Error('OpenAI API is disabled. Please set your API key in settings.');
        }
        
        // Check if API key is set
        if (!this.config.openAI.apiKey) {
            throw new Error('OpenAI API key is not set');
        }
        
        // Check rate limit
        if (this._isRateLimited('openAI')) {
            throw new Error('OpenAI API rate limit exceeded');
        }
        
        // Get options
        const {
            model = 'gpt-3.5-turbo',
            maxTokens = 500,
            temperature = 0.7
        } = options;
        
        // Increment rate limit counter
        this._incrementRateLimit('openAI');
        
        // Prepare request
        const url = `${this.config.openAI.baseUrl}/chat/completions`;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.openAI.apiKey}`
        };
        
        const body = JSON.stringify({
            model: model,
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant for a D&D 5e game master."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: maxTokens,
            temperature: temperature
        });
        
        // Make request
        try {
            const response = await this._fetchWithErrorHandling(url, {
                method: 'POST',
                headers,
                body
            });
            
            // Extract generated text
            if (response.choices && response.choices.length > 0) {
                return response.choices[0].message.content.trim();
            } else {
                throw new Error('No text generated');
            }
        } catch (error) {
            console.error('Error generating text:', error);
            throw error;
        }
    }

    /**
     * Generate a random encounter description
     * @param {Object} encounter - Encounter object
     * @returns {Promise<string>} Generated description
     */
    async generateEncounterDescription(encounter) {
        // Create prompt
        const monsterNames = encounter.monsters.map(m => m.name).join(', ');
        const environment = encounter.environment || 'dungeon';
        const difficulty = encounter.difficulty ? encounter.difficulty.difficulty : 'medium';
        
        const prompt = `Create a brief, evocative description for a D&D 5e encounter with the following monsters: ${monsterNames}. 
        The encounter takes place in a ${environment} environment and is of ${difficulty} difficulty. 
        Include atmospheric details and a tactical setup for the encounter.
        Keep it under 200 words.`;
        
        // Generate description
        return await this.generateText(prompt, {
            maxTokens: 300,
            temperature: 0.8
        });
    }

    /**
     * Generate monster tactics
     * @param {Object} monster - Monster object
     * @returns {Promise<string>} Generated tactics
     */
    async generateMonsterTactics(monster) {
        // Create prompt
        const prompt = `Create tactical advice for a D&D 5e game master on how to effectively use a ${monster.name} (CR ${monster.cr}) in combat.
        Consider the monster's abilities, strengths, and weaknesses.
        Include advice on positioning, ability usage, and target prioritization.
        Keep it under 150 words.`;
        
        // Generate tactics
        return await this.generateText(prompt, {
            maxTokens: 250,
            temperature: 0.7
        });
    }

    /**
     * Generate a random NPC
     * @param {Object} options - NPC options
     * @param {string} options.race - NPC race
     * @param {string} options.class - NPC class
     * @param {string} options.alignment - NPC alignment
     * @returns {Promise<Object>} Generated NPC
     */
    async generateNPC(options = {}) {
        const {
            race = '',
            class: npcClass = '',
            alignment = ''
        } = options;
        
        // Create prompt
        let prompt = `Create a D&D 5e NPC with the following format:
        Name: [Full name]
        Race: ${race || '[Random race]'}
        Class/Occupation: ${npcClass || '[Random class or occupation]'}
        Alignment: ${alignment || '[Random alignment]'}
        Appearance: [Brief physical description]
        Personality: [Key personality traits]
        Motivation: [What drives this character]
        Secret: [A secret or hidden aspect]
        Voice: [How they speak]
        
        Return only the filled out template with no additional text.`;
        
        // Generate NPC
        const npcText = await this.generateText(prompt, {
            maxTokens: 350,
            temperature: 0.8
        });
        
        // Parse NPC text
        return this._parseNPCText(npcText);
    }

    /**
     * Parse NPC text into an object
     * @private
     * @param {string} npcText - NPC text
     * @returns {Object} NPC object
     */
    _parseNPCText(npcText) {
        const npc = {
            id: `npc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            type: 'npc'
        };
        
        // Extract fields
        const fields = [
            { key: 'name', pattern: /Name:\s*(.+)/ },
            { key: 'race', pattern: /Race:\s*(.+)/ },
            { key: 'class', pattern: /Class\/Occupation:\s*(.+)/ },
            { key: 'alignment', pattern: /Alignment:\s*(.+)/ },
            { key: 'appearance', pattern: /Appearance:\s*(.+)/ },
            { key: 'personality', pattern: /Personality:\s*(.+)/ },
            { key: 'motivation', pattern: /Motivation:\s*(.+)/ },
            { key: 'secret', pattern: /Secret:\s*(.+)/ },
            { key: 'voice', pattern: /Voice:\s*(.+)/ }
        ];
        
        fields.forEach(field => {
            const match = npcText.match(field.pattern);
            if (match && match[1]) {
                npc[field.key] = match[1].trim();
            }
        });
        
        return npc;
    }

    /**
     * Generate a random treasure hoard
     * @param {number} cr - Challenge rating
     * @returns {Promise<Object>} Generated treasure
     */
    async generateTreasureHoard(cr = 5) {
        // Create prompt
        const prompt = `Generate a D&D 5e treasure hoard for CR ${cr} using the standard treasure tables.
        Format the result as a JSON object with the following structure:
        {
          "coins": { "cp": 0, "sp": 0, "gp": 0, "pp": 0 },
          "gems": [{ "value": 0, "description": "" }],
          "art": [{ "value": 0, "description": "" }],
          "magicItems": [{ "name": "", "rarity": "", "description": "" }]
        }
        Include only the JSON with no additional text.`;
        
        // Generate treasure
        const treasureText = await this.generateText(prompt, {
            maxTokens: 500,
            temperature: 0.7
        });
        
        // Parse treasure JSON
        try {
            // Extract JSON from the response
            const jsonMatch = treasureText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No valid JSON found in response');
            }
            
            const treasureJson = jsonMatch[0];
            return JSON.parse(treasureJson);
        } catch (error) {
            console.error('Error parsing treasure JSON:', error);
            throw error;
        }
    }

    /**
     * Make a request to a custom API
     * @param {string} apiId - Custom API ID
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @returns {Promise<Object>} API response
     */
    async callCustomApi(apiId, endpoint, options = {}) {
        // Find custom API
        const api = this.config.customApis.find(api => api.id === apiId);
        if (!api) {
            throw new Error(`Custom API not found: ${apiId}`);
        }
        
        // Normalize endpoint
        const normalizedEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
        
        // Prepare request
        const url = `${api.baseUrl}/${normalizedEndpoint}`;
        const headers = { ...api.headers };
        
        // Add authentication if provided
        if (api.authType === 'bearer' && api.authToken) {
            headers['Authorization'] = `Bearer ${api.authToken}`;
        } else if (api.authType === 'basic' && api.username && api.password) {
            const auth = btoa(`${api.username}:${api.password}`);
            headers['Authorization'] = `Basic ${auth}`;
        }
        
        // Make request
        try {
            return await this._fetchWithErrorHandling(url, {
                method: options.method || 'GET',
                headers,
                body: options.body ? JSON.stringify(options.body) : undefined
            });
        } catch (error) {
            console.error(`Error calling custom API ${apiId}:`, error);
            throw error;
        }
    }

    /**
     * Add a custom API
     * @param {Object} api - Custom API configuration
     * @returns {Promise<boolean>} Success status
     */
    async addCustomApi(api) {
        // Generate ID if not provided
        if (!api.id) {
            api.id = `api-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        }
        
        // Add to custom APIs
        this.config.customApis.push(api);
        
        // Save to settings
        await this.settings.set('customApis', this.config.customApis);
        
        return true;
    }

    /**
     * Update a custom API
     * @param {string} apiId - Custom API ID
     * @param {Object} updates - Updates to apply
     * @returns {Promise<boolean>} Success status
     */
    async updateCustomApi(apiId, updates) {
        // Find custom API
        const index = this.config.customApis.findIndex(api => api.id === apiId);
        if (index === -1) {
            throw new Error(`Custom API not found: ${apiId}`);
        }
        
        // Update API
        this.config.customApis[index] = { ...this.config.customApis[index], ...updates };
        
        // Save to settings
        await this.settings.set('customApis', this.config.customApis);
        
        return true;
    }

    /**
     * Remove a custom API
     * @param {string} apiId - Custom API ID
     * @returns {Promise<boolean>} Success status
     */
    async removeCustomApi(apiId) {
        // Find custom API
        const index = this.config.customApis.findIndex(api => api.id === apiId);
        if (index === -1) {
            throw new Error(`Custom API not found: ${apiId}`);
        }
        
        // Remove API
        this.config.customApis.splice(index, 1);
        
        // Save to settings
        await this.settings.set('customApis', this.config.customApis);
        
        return true;
    }

    /**
     * Get all custom APIs
     * @returns {Array} Custom APIs
     */
    getCustomApis() {
        return [...this.config.customApis];
    }

    /**
     * Set OpenAI API key
     * @param {string} apiKey - API key
     * @returns {Promise<boolean>} Success status
     */
    async setOpenAIApiKey(apiKey) {
        // Update config
        this.config.openAI.apiKey = apiKey;
        this.config.openAI.enabled = !!apiKey;
        
        // Save to settings
        await this.settings.set('openAIApiKey', apiKey);
        
        return true;
    }

    /**
     * Check if OpenAI API is enabled
     * @returns {boolean} Enabled status
     */
    isOpenAIEnabled() {
        return this.config.openAI.enabled;
    }

    /**
     * Clear API cache
     * @param {string} api - API name (dnd5e, openAI, custom, or all)
     * @returns {boolean} Success status
     */
    clearCache(api = 'all') {
        if (api === 'all') {
            this.cache = {
                dnd5e: {},
                openAI: {},
                custom: {}
            };
        } else if (this.cache[api]) {
            this.cache[api] = {};
        } else {
            return false;
        }
        
        return true;
    }

    /**
     * Get cache size
     * @returns {Object} Cache sizes
     */
    getCacheSize() {
        return {
            dnd5e: Object.keys(this.cache.dnd5e).length,
            openAI: Object.keys(this.cache.openAI).length,
            custom: Object.keys(this.cache.custom).length
        };
    }

    /**
     * Get rate limit status
     * @returns {Object} Rate limit status
     */
    getRateLimitStatus() {
        const now = Date.now();
        
        return {
            dnd5e: {
                remaining: Math.max(0, this.rateLimits.dnd5e.requestsPerMinute - this.rateLimits.dnd5e.requestCount),
                resetsIn: Math.max(0, Math.ceil((this.rateLimits.dnd5e.resetTime - now) / 1000))
            },
            openAI: {
                remaining: Math.max(0, this.rateLimits.openAI.requestsPerMinute - this.rateLimits.openAI.requestCount),
                resetsIn: Math.max(0, Math.ceil((this.rateLimits.openAI.resetTime - now) / 1000))
            }
        };
    }
}

// Export the API class
export default API;
