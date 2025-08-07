/**
 * API Manager for Jesster's Combat Tracker
 * Handles interactions with external APIs like D&D Beyond and Open5e
 */
class ApiManager {
    constructor(app) {
        this.app = app;
        this.open5eBaseUrl = 'https://api.open5e.com/v1';
        this.open5eCache = {
            monsters: new Map(),
            spells: new Map(),
            searchResults: new Map()
        };
        this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
    }
    
    /**
     * Initialize the API manager
     */
    async init() {
        console.log("API Manager initialized");
    }
    
    /**
     * Search for monsters in the Open5e API
     * @param {string} query - The search query
     * @returns {Promise<Array>} - The search results
     */
    async searchMonsters(query) {
        try {
            // Check cache first
            const cacheKey = `monster-search-${query}`;
            const cachedResults = this.getCachedItem('searchResults', cacheKey);
            if (cachedResults) {
                return cachedResults;
            }
            
            // Make API request
            const response = await fetch(`${this.open5eBaseUrl}/monsters/?search=${encodeURIComponent(query)}&limit=50`);
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Cache results
            this.setCachedItem('searchResults', cacheKey, data.results);
            
            // Also cache individual monsters
            data.results.forEach(monster => {
                this.setCachedItem('monsters', monster.slug, monster);
            });
            
            return data.results;
        } catch (error) {
            console.error("Error searching monsters:", error);
            this.app.showAlert(`Error searching monsters: ${error.message}`, "API Error");
            return [];
        }
    }
    
    /**
     * Get a monster by slug from the Open5e API
     * @param {string} slug - The monster slug
     * @returns {Promise<Object>} - The monster data
     */
    async getMonster(slug) {
        try {
            // Check cache first
            const cachedMonster = this.getCachedItem('monsters', slug);
            if (cachedMonster) {
                return cachedMonster;
            }
            
            // Make API request
            const response = await fetch(`${this.open5eBaseUrl}/monsters/${slug}/`);
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }
            
            const monster = await response.json();
            
            // Cache monster
            this.setCachedItem('monsters', slug, monster);
            
            return monster;
        } catch (error) {
            console.error(`Error getting monster ${slug}:`, error);
            this.app.showAlert(`Error getting monster: ${error.message}`, "API Error");
            return null;
        }
    }
    
    /**
     * Search for spells in the Open5e API
     * @param {string} query - The search query
     * @returns {Promise<Array>} - The search results
     */
    async searchSpells(query) {
        try {
            // Check cache first
            const cacheKey = `spell-search-${query}`;
            const cachedResults = this.getCachedItem('searchResults', cacheKey);
            if (cachedResults) {
                return cachedResults;
            }
            
            // Make API request
            const response = await fetch(`${this.open5eBaseUrl}/spells/?search=${encodeURIComponent(query)}&limit=50`);
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Cache results
            this.setCachedItem('searchResults', cacheKey, data.results);
            
            // Also cache individual spells
            data.results.forEach(spell => {
                this.setCachedItem('spells', spell.slug, spell);
            });
            
            return data.results;
        } catch (error) {
            console.error("Error searching spells:", error);
            this.app.showAlert(`Error searching spells: ${error.message}`, "API Error");
            return [];
        }
    }
    
    /**
     * Get a spell by slug from the Open5e API
     * @param {string} slug - The spell slug
     * @returns {Promise<Object>} - The spell data
     */
    async getSpell(slug) {
        try {
            // Check cache first
            const cachedSpell = this.getCachedItem('spells', slug);
            if (cachedSpell) {
                return cachedSpell;
            }
            
            // Make API request
            const response = await fetch(`${this.open5eBaseUrl}/spells/${slug}/`);
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }
            
            const spell = await response.json();
            
            // Cache spell
            this.setCachedItem('spells', slug, spell);
            
            return spell;
        } catch (error) {
            console.error(`Error getting spell ${slug}:`, error);
            this.app.showAlert(`Error getting spell: ${error.message}`, "API Error");
            return null;
        }
    }
    
    /**
     * Parse D&D Beyond character data from JSON
     * @param {Object} dndbData - The D&D Beyond character data
     * @returns {Object} - The parsed character data
     */
    parseDnDBeyondCharacter(dndbData) {
        try {
            // Create character object from D&D Beyond data
            return {
                id: this.app.utils.generateUUID(),
                name: dndbData.name || 'Unknown Character',
                maxHp: dndbData.hp || 10,
                ac: dndbData.ac || 10,
                initiativeBonus: dndbData.initiative || 0,
                pp: dndbData.pp || 10,
                dc: dndbData.spellDC || null,
                str: dndbData.str || 10,
                dex: dndbData.dex || 10,
                con: dndbData.con || 10,
                int: dndbData.int || 10,
                wis: dndbData.wis || 10,
                cha: dndbData.cha || 10,
                strMod: dndbData.strMod || 0,
                dexMod: dndbData.dexMod || 0,
                conMod: dndbData.conMod || 0,
                intMod: dndbData.intMod || 0,
                wisMod: dndbData.wisMod || 0,
                chaMod: dndbData.chaMod || 0,
                saves: this.formatSaves(dndbData),
                classes: dndbData.classes || '',
                level: dndbData.level || 1,
                profBonus: dndbData.profBonus || 2,
                speed: dndbData.speed || '30 ft.',
                source: 'dndbeyond',
                sourceId: dndbData.id || null,
                notes: this.formatDnDBeyondNotes(dndbData),
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
        } catch (error) {
            console.error("Error parsing D&D Beyond character:", error);
            throw new Error(`Error parsing character: ${error.message}`);
        }
    }
    
    /**
     * Format saves from D&D Beyond data
     * @param {Object} dndbData - The D&D Beyond character data
     * @returns {string} - The formatted saves
     */
    formatSaves(dndbData) {
        const saves = [];
        
        if (dndbData.strMod !== undefined) {
            saves.push(`STR ${dndbData.strMod >= 0 ? '+' : ''}${dndbData.strMod}`);
        }
        
        if (dndbData.dexMod !== undefined) {
            saves.push(`DEX ${dndbData.dexMod >= 0 ? '+' : ''}${dndbData.dexMod}`);
        }
        
        if (dndbData.conMod !== undefined) {
            saves.push(`CON ${dndbData.conMod >= 0 ? '+' : ''}${dndbData.conMod}`);
        }
        
        if (dndbData.intMod !== undefined) {
            saves.push(`INT ${dndbData.intMod >= 0 ? '+' : ''}${dndbData.intMod}`);
        }
        
        if (dndbData.wisMod !== undefined) {
            saves.push(`WIS ${dndbData.wisMod >= 0 ? '+' : ''}${dndbData.wisMod}`);
        }
        
        if (dndbData.chaMod !== undefined) {
            saves.push(`CHA ${dndbData.chaMod >= 0 ? '+' : ''}${dndbData.chaMod}`);
        }
        
        return saves.join(', ');
    }
    
    /**
     * Format notes from D&D Beyond data
     * @param {Object} dndbData - The D&D Beyond character data
     * @returns {string} - The formatted notes
     */
    formatDnDBeyondNotes(dndbData) {
        const notes = [];
        
        if (dndbData.classes) {
            notes.push(`Class: ${dndbData.classes}`);
        }
        
        if (dndbData.level) {
            notes.push(`Level: ${dndbData.level}`);
        }
        
        if (dndbData.profBonus) {
            notes.push(`Proficiency Bonus: +${dndbData.profBonus}`);
        }
        
        if (dndbData.speed) {
            notes.push(`Speed: ${dndbData.speed}`);
        }
        
        if (dndbData.race) {
            notes.push(`Race: ${dndbData.race}`);
        }
        
        if (dndbData.background) {
            notes.push(`Background: ${dndbData.background}`);
        }
        
        return notes.join('\n');
    }
    
    /**
     * Get a cached item
     * @param {string} cacheType - The type of cache
     * @param {string} key - The cache key
     * @returns {*} - The cached item or null
     */
    getCachedItem(cacheType, key) {
        const cache = this.open5eCache[cacheType];
        if (!cache) return null;
        
        const item = cache.get(key);
        if (!item) return null;
        
        // Check if cache has expired
        if (Date.now() - item.timestamp > this.cacheExpiry) {
            cache.delete(key);
            return null;
        }
        
        return item.data;
    }
    
    /**
     * Set a cached item
     * @param {string} cacheType - The type of cache
     * @param {string} key - The cache key
     * @param {*} data - The data to cache
     */
    setCachedItem(cacheType, key, data) {
        const cache = this.open5eCache[cacheType];
        if (!cache) return;
        
        cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }
    
    /**
     * Clear the API cache
     */
    clearCache() {
        this.open5eCache.monsters.clear();
        this.open5eCache.spells.clear();
        this.open5eCache.searchResults.clear();
    }
    
    /**
     * Generate D&D Beyond character import script
     * @returns {string} - The import script
     */
    getDnDBeyondImportScript() {
        return `
const charData = { 
    name: document.querySelector('.ddbc-character-name')?.textContent?.trim(),
    classes: Array.from(document.querySelectorAll('.ddbc-character-summary__classes .ddbc-character-summary__class')).map(el => el.textContent.trim()).join(', '),
    level: parseInt(document.querySelector('.ddbc-character-progression-summary__level')?.textContent),
    race: document.querySelector('.ddbc-character-summary__race')?.textContent?.trim(),
    background: document.querySelector('.ddbc-character-summary__background')?.textContent?.trim(),
    ac: parseInt(document.querySelector('.ddbc-armor-class-box__value')?.textContent),
    hp: parseInt(document.querySelector('.ct-health-summary__hp-item--max .ct-health-summary__hp-number')?.textContent),
    str: parseInt(document.querySelector('.ddbc-ability-summary[data-ability="str"] .ddbc-ability-summary__secondary')?.textContent),
    dex: parseInt(document.querySelector('.ddbc-ability-summary[data-ability="dex"] .ddbc-ability-summary__secondary')?.textContent),
    con: parseInt(document.querySelector('.ddbc-ability-summary[data-ability="con"] .ddbc-ability-summary__secondary')?.textContent),
    int: parseInt(document.querySelector('.ddbc-ability-summary[data-ability="int"] .ddbc-ability-summary__secondary')?.textContent),
    wis: parseInt(document.querySelector('.ddbc-ability-summary[data-ability="wis"] .ddbc-ability-summary__secondary')?.textContent),
    cha: parseInt(document.querySelector('.ddbc-ability-summary[data-ability="cha"] .ddbc-ability-summary__secondary')?.textContent),
    strMod: parseInt(document.querySelector('.ddbc-ability-summary[data-ability="str"] .ddbc-ability-summary__primary')?.textContent),
    dexMod: parseInt(document.querySelector('.ddbc-ability-summary[data-ability="dex"] .ddbc-ability-summary__primary')?.textContent),
    conMod: parseInt(document.querySelector('.ddbc-ability-summary[data-ability="con"] .ddbc-ability-summary__primary')?.textContent),
    intMod: parseInt(document.querySelector('.ddbc-ability-summary[data-ability="int"] .ddbc-ability-summary__primary')?.textContent),
    wisMod: parseInt(document.querySelector('.ddbc-ability-summary[data-ability="wis"] .ddbc-ability-summary__primary')?.textContent),
    chaMod: parseInt(document.querySelector('.ddbc-ability-summary[data-ability="cha"] .ddbc-ability-summary__primary')?.textContent),
    initiative: parseInt(document.querySelector('.ddbc-initiative-box__value')?.textContent),
    profBonus: parseInt(document.querySelector('.ddbc-proficiency-bonus__value')?.textContent),
    speed: document.querySelector('.ddbc-distance-number__number')?.textContent,
    pp: parseInt(document.querySelector('.ct-senses__callout-value')?.textContent),
    spellDC: document.querySelector('.ct-spell-stats__dc-value') ? parseInt(document.querySelector('.ct-spell-stats__dc-value').textContent) : null,
    id: document.location.pathname.split('/').pop()
};
console.log(JSON.stringify(charData));
        `;
    }
}
