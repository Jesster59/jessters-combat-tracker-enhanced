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
            type: 'monster',
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
                    
                    // Basic info
                    character.name = document.querySelector('.ddbc-character-name').textContent.trim();
                    character.classes = document.querySelector('.ddbc-character-summary__classes').textContent.trim();
                    character.level = parseInt(document.querySelector('.ddbc-character-progression-summary__level').textContent.trim()) || 1;
                    character.race = document.querySelector('.ddbc-character-summary__race').textContent.trim();
                    character.background = document.querySelector('.ddbc-character-summary__background').textContent.trim();
                    
                    // Stats
                    const abilityScores = {};
                    document.querySelectorAll('.ddbc-ability-summary').forEach(element => {
                        const name = element.querySelector('.ddbc-ability-summary__abbr').textContent.trim().toLowerCase();
                        const score = parseInt(element.querySelector('.ddbc-ability-summary__secondary').textContent.trim());
                        abilityScores[name] = score;
                    });
                    
                    character.str = abilityScores.str || 10;
                    character.dex = abilityScores.dex || 10;
                    character.con = abilityScores.con || 10;
                    character.int = abilityScores.int || 10;
                    character.wis = abilityScores.wis || 10;
                    character.cha = abilityScores.cha || 10;
                    
                    // Combat stats
                    character.maxHp = parseInt(document.querySelector('.ddbc-hit-points__max').textContent.trim()) || 10;
                    character.ac = parseInt(document.querySelector('.ddbc-armor-class-box__value').textContent.trim()) || 10;
                    
                    // Initiative
                    const initiativeElement = document.querySelector('.ddbc-initiative-box__value');
                    character.initiativeBonus = parseInt(initiativeElement ? initiativeElement.textContent.trim() : '0') || 0;
                    
                    // Passive Perception
                    const passivePerceptionElement = document.querySelector('.ddbc-passive-perception-box__value');
                    character.pp = parseInt(passivePerceptionElement ? passivePerceptionElement.textContent.trim() : '10') || 10;
                    
                    // Spell save DC
                    const spellSaveDcElement = document.querySelector('.ddbc-spell-save-dc__value');
                    if (spellSaveDcElement) {
                        character.dc = parseInt(spellSaveDcElement.textContent.trim()) || null;
                    }
                    
                    // Saving throws
                    character.saves = '';
                    document.querySelectorAll('.ddbc-saving-throws-summary__ability').forEach(element => {
                        const ability = element.querySelector('.ddbc-saving-throws-summary__ability-name').textContent.trim();
                        const bonus = element.querySelector('.ddbc-saving-throws-summary__ability-modifier').textContent.trim();
                        character.saves += ability + ' ' + bonus + ', ';
                    });
                    character.saves = character.saves.replace(/,\\s*$/, '');
                    
                    // Character image
                    const portraitElement = document.querySelector('.ddbc-character-avatar__portrait');
                    if (portraitElement && portraitElement.style.backgroundImage) {
                        const bgImage = portraitElement.style.backgroundImage;
                        const urlMatch = bgImage.match(/url\\(['"](.+?)['"]/);
                        if (urlMatch && urlMatch[1]) {
                            character.imageUrl = urlMatch[1];
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
