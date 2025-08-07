/**
 * API Manager for Jesster's Combat Tracker
 * Handles external API interactions
 */
class APIManager {
    constructor(app) {
        this.app = app;
        this.open5eBaseUrl = 'https://api.open5e.com/v1';
        console.log("API Manager initialized");
    }
    
    /**
     * Search for monsters in the Open5e API
     * @param {string} query - The search query
     * @returns {Promise<Array>} - The search results
     */
    async searchMonsters(query) {
        try {
            const response = await fetch(`${this.open5eBaseUrl}/monsters/?search=${encodeURIComponent(query)}&limit=20`);
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            return data.results || [];
        } catch (error) {
            console.error('Error searching monsters:', error);
            this.app.showAlert(`Error searching monsters: ${error.message}`);
            return [];
        }
    }
    
    /**
     * Get a monster by slug from the Open5e API
     * @param {string} slug - The monster slug
     * @returns {Promise<Object|null>} - The monster data
     */
    async getMonster(slug) {
        try {
            const response = await fetch(`${this.open5eBaseUrl}/monsters/${encodeURIComponent(slug)}/`);
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error getting monster:', error);
            this.app.showAlert(`Error getting monster: ${error.message}`);
            return null;
        }
    }
    
    /**
     * Convert Open5e monster data to our format
     * @param {Object} monsterData - The Open5e monster data
     * @returns {Object} - The monster in our format
     */
    convertOpen5eMonster(monsterData) {
        // Calculate ability modifiers
        const getModifier = (score) => Math.floor((score - 10) / 2);
        
        // Parse hit points
        let maxHp = 10;
        const hpMatch = monsterData.hit_points_roll?.match(/(\d+)/);
        if (hpMatch) {
            maxHp = parseInt(hpMatch[1]);
        } else if (typeof monsterData.hit_points === 'number') {
            maxHp = monsterData.hit_points;
        }
        
        // Parse initiative bonus (based on DEX modifier)
        const initiativeBonus = getModifier(monsterData.dexterity);
        
        // Create monster object
        return {
            id: this.app.utils.generateUUID(),
            name: monsterData.name,
            type: 'monster',
            maxHp: maxHp,
            currentHp: maxHp,
            ac: monsterData.armor_class,
            initiativeBonus: initiativeBonus,
            initiative: null,
            conditions: [],
            imageUrl: null,
            // Additional data from Open5e
            size: monsterData.size,
            alignment: monsterData.alignment,
            cr: monsterData.challenge_rating,
            source: 'Open5e SRD',
            abilities: {
                str: monsterData.strength,
                dex: monsterData.dexterity,
                con: monsterData.constitution,
                int: monsterData.intelligence,
                wis: monsterData.wisdom,
                cha: monsterData.charisma
            },
            actions: monsterData.actions || [],
            specialAbilities: monsterData.special_abilities || [],
            legendaryActions: monsterData.legendary_actions || [],
            speed: monsterData.speed,
            senses: monsterData.senses,
            languages: monsterData.languages,
            damageVulnerabilities: monsterData.damage_vulnerabilities,
            damageResistances: monsterData.damage_resistances,
            damageImmunities: monsterData.damage_immunities,
            conditionImmunities: monsterData.condition_immunities
        };
    }
    
    /**
     * Get the D&D Beyond import script
     * @returns {string} - The import script
     */
    getDnDBeyondImportScript() {
        return `
            (function() {
                try {
                    // Get character data
                    const character = {};
                    
                    // Helper function to safely get text content
                    function safeGetText(selector, defaultValue = '') {
                        const element = document.querySelector(selector);
                        return element ? element.textContent.trim() : defaultValue;
                    }
                    
                    // Helper function to safely get integer
                    function safeGetInt(selector, defaultValue = 0) {
                        const text = safeGetText(selector);
                        const value = parseInt(text);
                        return isNaN(value) ? defaultValue : value;
                    }
                    
                    // Basic info
                    character.name = safeGetText('.ddbc-character-name, .ct-character-header-info__character-name');
                    
                    // Try different selectors for classes
                    character.classes = safeGetText('.ddbc-character-summary__classes, .ct-character-header-info__classes');
                    
                    // Try different selectors for level
                    character.level = safeGetInt('.ddbc-character-progression-summary__level, .ct-character-header-info__xp-level, .ct-character-header-info__character-level', 1);
                    
                    // Try different selectors for race and background
                    character.race = safeGetText('.ddbc-character-summary__race, .ct-character-header-info__race');
                    character.background = safeGetText('.ddbc-character-summary__background, .ct-character-header-info__background');
                    
                    // Stats - try different ability score selectors
                    const abilityScores = {};
                    
                    // Try the newer format first
                    document.querySelectorAll('.ddbc-ability-summary, .ct-ability-summary').forEach(element => {
                        const abbr = element.querySelector('.ddbc-ability-summary__abbr, .ct-ability-summary__abbr');
                        const score = element.querySelector('.ddbc-ability-summary__secondary, .ct-ability-summary__secondary');
                        
                        if (abbr && score) {
                            const name = abbr.textContent.trim().toLowerCase();
                            const value = parseInt(score.textContent.trim());
                            if (!isNaN(value)) {
                                abilityScores[name] = value;
                            }
                        }
                    });
                    
                    // If we didn't find abilities, try an alternative approach
                    if (Object.keys(abilityScores).length === 0) {
                        // Look for ability scores in different formats
                        ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach(ability => {
                            const scoreElement = document.querySelector(
                                \`.ct-ability-summary--\${ability} .ct-ability-summary__secondary, \` +
                                \`.ddbc-ability-summary--\${ability} .ddbc-ability-summary__secondary\`
                            );
                            
                            if (scoreElement) {
                                const value = parseInt(scoreElement.textContent.trim());
                                if (!isNaN(value)) {
                                    abilityScores[ability] = value;
                                }
                            }
                        });
                    }
                    
                    // Assign ability scores with defaults
                    character.str = abilityScores.str || 10;
                    character.dex = abilityScores.dex || 10;
                    character.con = abilityScores.con || 10;
                    character.int = abilityScores.int || 10;
                    character.wis = abilityScores.wis || 10;
                    character.cha = abilityScores.cha || 10;
                    
                    // Combat stats - try different selectors
                    character.maxHp = safeGetInt('.ddbc-hit-points__max, .ct-health-summary__hp-item-content--max', 10);
                    character.ac = safeGetInt('.ddbc-armor-class-box__value, .ct-armor-class-box__value', 10);
                    
                    // Initiative - try different selectors
                    character.initiativeBonus = safeGetInt('.ddbc-initiative-box__value, .ct-initiative-box__value', 0);
                    
                    // Passive Perception - try different selectors
                    character.pp = safeGetInt('.ddbc-passive-perception-box__value, .ct-senses__callout-value', 10);
                    
                    // Spell save DC - try different selectors
                    const dcElement = document.querySelector('.ddbc-spell-save-dc__value, .ct-spell-save-dc__value');
                    if (dcElement) {
                        character.dc = parseInt(dcElement.textContent.trim());
                    }
                    
                    // Saving throws - try different selectors
                    character.saves = '';
                    const saveElements = document.querySelectorAll('.ddbc-saving-throws-summary__ability, .ct-saving-throws-summary__ability');
                    
                    saveElements.forEach(element => {
                        const abilityName = element.querySelector('.ddbc-saving-throws-summary__ability-name, .ct-saving-throws-summary__ability-name');
                        const abilityMod = element.querySelector('.ddbc-saving-throws-summary__ability-modifier, .ct-saving-throws-summary__ability-modifier');
                        
                        if (abilityName && abilityMod) {
                            character.saves += abilityName.textContent.trim() + ' ' + abilityMod.textContent.trim() + ', ';
                        }
                    });
                    
                    character.saves = character.saves.replace(/,\\s*$/, '');
                    
                    // Character image - try different selectors
                    const portraitElement = document.querySelector('.ddbc-character-avatar__portrait, .ct-character-avatar__portrait');
                    if (portraitElement && portraitElement.style.backgroundImage) {
                        const bgImage = portraitElement.style.backgroundImage;
                        const urlMatch = bgImage.match(/url\\(['"](.+?)['"]/);
                        if (urlMatch && urlMatch[1]) {
                            character.imageUrl = urlMatch[1];
                        }
                    }
                    
                    // Try to find image in another location if not found
                    if (!character.imageUrl) {
                        const avatarImg = document.querySelector('.ddbc-character-avatar__image, .ct-character-avatar__image');
                        if (avatarImg && avatarImg.src) {
                            character.imageUrl = avatarImg.src;
                        }
                    }
                    
                    // Generate ID
                    character.id = 'dndb-' + Date.now();
                    
                    // Output the character data
                    console.log('Copy the following JSON and paste it into the import field:');
                    console.log(JSON.stringify(character, null, 2));
                    return JSON.stringify(character);
                } catch (error) {
                    console.error('Error extracting character data:', error);
                    return '{"error": "' + error.message + '"}';
                }
            })();
        `;
    }
    
    /**
     * Parse a D&D Beyond character
     * @param {Object} data - The character data
     * @returns {Object} - The parsed character
     */
    parseDnDBeyondCharacter(data) {
        try {
            // Validate required fields
            if (!data.name) {
                throw new Error('Character name is missing');
            }
            
            // Create character object
            const character = {
                id: data.id || `dndb-${Date.now()}`,
                name: data.name,
                maxHp: data.maxHp || 10,
                currentHp: data.maxHp || 10,
                ac: data.ac || 10,
                initiativeBonus: data.initiativeBonus || 0,
                initiative: null,
                conditions: [],
                type: 'hero',
                str: data.str || 10,
                dex: data.dex || 10,
                con: data.con || 10,
                int: data.int || 10,
                wis: data.wis || 10,
                cha: data.cha || 10,
                pp: data.pp || 10,
                dc: data.dc || null,
                saves: data.saves || '',
                imageUrl: data.imageUrl || null,
                notes: `Class: ${data.classes || 'Unknown'}\nRace: ${data.race || 'Unknown'}\nBackground: ${data.background || 'Unknown'}\nLevel: ${data.level || 1}`,
                source: 'D&D Beyond'
            };
            
            return character;
        } catch (error) {
            console.error('Error parsing D&D Beyond character:', error);
            throw new Error(`Error parsing character: ${error.message}`);
        }
    }
}
