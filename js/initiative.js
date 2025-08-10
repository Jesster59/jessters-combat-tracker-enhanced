/**
 * Initiative module for Jesster's Combat Tracker
 * Handles initiative-specific functionality
 */
class Initiative {
    constructor(dice, settings) {
        // Store references to other modules
        this.dice = dice;
        this.settings = settings;
        
        // Initiative systems
        this.systems = [
            {
                id: 'standard',
                name: 'Standard',
                description: 'Each combatant rolls initiative individually and acts in initiative order.'
            },
            {
                id: 'group',
                name: 'Group',
                description: 'Monsters of the same type share initiative. Players roll individually.'
            },
            {
                id: 'popcorn',
                name: 'Popcorn',
                description: 'After a combatant acts, they choose who goes next.'
            },
            {
                id: 'side',
                name: 'Side Initiative',
                description: 'Players roll as a group, monsters roll as a group. Highest side goes first, then alternates.'
            }
        ];
        
        // Current system
        this.currentSystem = this.settings.getInitiativeSystem();
        
        console.log("Initiative module initialized");
    }

    /**
     * Get all initiative systems
     * @returns {Array} Initiative systems
     */
    getSystems() {
        return [...this.systems];
    }

    /**
     * Get an initiative system by ID
     * @param {string} id - System ID
     * @returns {Object|null} Initiative system or null if not found
     */
    getSystem(id) {
        return this.systems.find(system => system.id === id) || null;
    }

    /**
     * Get the current initiative system
     * @returns {Object} Current initiative system
     */
    getCurrentSystem() {
        return this.getSystem(this.currentSystem) || this.getSystem('standard');
    }

    /**
     * Set the current initiative system
     * @param {string} systemId - System ID
     * @returns {boolean} Success status
     */
    setSystem(systemId) {
        const system = this.getSystem(systemId);
        if (!system) {
            console.warn(`Initiative system not found: ${systemId}`);
            return false;
        }
        
        this.currentSystem = systemId;
        this.settings.set('initiativeSystem', systemId);
        
        return true;
    }

    /**
     * Calculate initiative modifier from ability scores
     * @param {Object} abilities - Ability scores object
     * @returns {number} Initiative modifier
     */
    calculateInitiativeModifier(abilities) {
        if (!abilities || !abilities.dex) {
            return 0;
        }
        
        // Base initiative modifier is DEX modifier
        let modifier = Math.floor((abilities.dex - 10) / 2);
        
        return modifier;
    }

    /**
     * Roll initiative for a combatant
     * @param {Object} combatant - Combatant object
     * @returns {Promise<Object>} Initiative result
     */
    async rollForCombatant(combatant) {
        // Get initiative modifier
        const modifier = combatant.initiativeModifier !== undefined ? 
            combatant.initiativeModifier : 
            this.calculateInitiativeModifier(combatant.abilities);
        
        // Roll initiative
        const rollResult = await this.dice.rollInitiative(
            combatant.name,
            modifier,
            { 
                advantage: combatant.initiativeAdvantage, 
                disadvantage: combatant.initiativeDisadvantage 
            }
        );
        
        // Return result
        return {
            combatant,
            initiative: rollResult.total,
            roll: rollResult,
            modifier
        };
    }

    /**
     * Roll group initiative
     * @param {Array} combatants - Array of combatants
     * @returns {Promise<Object>} Group initiative result
     */
    async rollGroupInitiative(combatants) {
        // Group combatants by type
        const groups = {};
        
        // Process each combatant
        for (const combatant of combatants) {
            // Determine group key
            let groupKey;
            
            if (combatant.type === 'pc') {
                // Each PC is its own group
                groupKey = combatant.id;
            } else {
                // Group monsters by name (without numbers)
                groupKey = combatant.name.replace(/\s+\d+$/, '');
            }
            
            // Initialize group if it doesn't exist
            if (!groups[groupKey]) {
                groups[groupKey] = {
                    name: groupKey,
                    combatants: [],
                    initiative: null,
                    roll: null,
                    modifier: 0
                };
            }
            
            // Add combatant to group
            groups[groupKey].combatants.push(combatant);
            
            // Use highest modifier in the group
            const modifier = combatant.initiativeModifier !== undefined ? 
                combatant.initiativeModifier : 
                this.calculateInitiativeModifier(combatant.abilities);
            
            if (modifier > groups[groupKey].modifier) {
                groups[groupKey].modifier = modifier;
            }
        }
        
        // Roll initiative for each group
        const results = [];
        
        for (const groupKey in groups) {
            const group = groups[groupKey];
            
            // Roll initiative for this group
            const rollResult = await this.dice.rollInitiative(
                group.name,
                group.modifier,
                {} // No advantage/disadvantage for groups
            );
            
            // Store initiative result
            group.initiative = rollResult.total;
            group.roll = rollResult;
            
            // Add to results
            results.push(group);
        }
        
        return {
            groups,
            results
        };
    }

    /**
     * Roll side initiative
     * @param {Array} combatants - Array of combatants
     * @returns {Promise<Object>} Side initiative result
     */
    async rollSideInitiative(combatants) {
        // Separate combatants into players and monsters
        const players = combatants.filter(c => c.type === 'pc');
        const monsters = combatants.filter(c => c.type === 'monster');
        
        // Calculate modifiers (use highest in each group)
        let playerModifier = 0;
        let monsterModifier = 0;
        
        for (const player of players) {
            const modifier = player.initiativeModifier !== undefined ? 
                player.initiativeModifier : 
                this.calculateInitiativeModifier(player.abilities);
            
            if (modifier > playerModifier) {
                playerModifier = modifier;
            }
        }
        
        for (const monster of monsters) {
            const modifier = monster.initiativeModifier !== undefined ? 
                monster.initiativeModifier : 
                this.calculateInitiativeModifier(monster.abilities);
            
            if (modifier > monsterModifier) {
                monsterModifier = modifier;
            }
        }
        
        // Roll initiative for each side
        const playerRoll = await this.dice.rollInitiative(
            'Players',
            playerModifier,
            {} // No advantage/disadvantage for sides
        );
        
        const monsterRoll = await this.dice.rollInitiative(
            'Monsters',
            monsterModifier,
            {} // No advantage/disadvantage for sides
        );
        
        // Determine which side goes first
        const playerInitiative = playerRoll.total;
        const monsterInitiative = monsterRoll.total;
        const playersFirst = playerInitiative >= monsterInitiative;
        
        return {
            players: {
                combatants: players,
                initiative: playerInitiative,
                roll: playerRoll,
                modifier: playerModifier
            },
            monsters: {
                combatants: monsters,
                initiative: monsterInitiative,
                roll: monsterRoll,
                modifier: monsterModifier
            },
            playersFirst
        };
    }

    /**
     * Sort combatants by initiative
     * @param {Array} combatants - Array of combatants
     * @returns {Array} Sorted combatants
     */
    sortByInitiative(combatants) {
        return [...combatants].sort((a, b) => {
            // Sort by initiative (descending)
            if (b.initiative !== a.initiative) {
                return b.initiative - a.initiative;
            }
            
            // If initiative is tied, sort by dexterity if available
            if (a.abilities && b.abilities && a.abilities.dex !== b.abilities.dex) {
                return b.abilities.dex - a.abilities.dex;
            }
            
            // If still tied, sort by name
            return a.name.localeCompare(b.name);
        });
    }

    /**
     * Create initiative order based on the current system
     * @param {Array} combatants - Array of combatants
     * @returns {Promise<Array>} Initiative order
     */
    async createInitiativeOrder(combatants) {
        switch (this.currentSystem) {
            case 'group':
                return this._createGroupInitiativeOrder(combatants);
            case 'popcorn':
                return this._createPopcornInitiativeOrder(combatants);
            case 'side':
                return this._createSideInitiativeOrder(combatants);
            case 'standard':
            default:
                return this._createStandardInitiativeOrder(combatants);
        }
    }

    /**
     * Create standard initiative order
     * @private
     * @param {Array} combatants - Array of combatants
     * @returns {Array} Initiative order
     */
    _createStandardInitiativeOrder(combatants) {
        // Sort by initiative
        return this.sortByInitiative(combatants);
    }

    /**
     * Create group initiative order
     * @private
     * @param {Array} combatants - Array of combatants
     * @returns {Promise<Array>} Initiative order
     */
    async _createGroupInitiativeOrder(combatants) {
        // Roll group initiative
        const { groups } = await this.rollGroupInitiative(combatants);
        
        // Create initiative order
        const initiativeOrder = [];
        
        // Sort groups by initiative
        const sortedGroups = Object.values(groups).sort((a, b) => b.initiative - a.initiative);
        
        // Add combatants to initiative order
        for (const group of sortedGroups) {
            // Sort combatants within group (PCs by initiative, monsters alphabetically)
            const sortedCombatants = group.combatants.sort((a, b) => {
                if (a.type === 'pc' && b.type === 'pc') {
                    // Sort PCs by their individual initiative
                    return b.initiative - a.initiative;
                } else if (a.type === 'monster' && b.type === 'monster') {
                    // Sort monsters alphabetically
                    return a.name.localeCompare(b.name);
                } else {
                    // PCs before monsters
                    return a.type === 'pc' ? -1 : 1;
                }
            });
            
            // Add to initiative order
            initiativeOrder.push(...sortedCombatants);
        }
        
        return initiativeOrder;
    }

    /**
     * Create popcorn initiative order
     * @private
     * @param {Array} combatants - Array of combatants
     * @returns {Array} Initiative order
     */
    _createPopcornInitiativeOrder(combatants) {
        // For popcorn initiative, we start with standard initiative order
        // but the actual order will be determined during combat
        return this.sortByInitiative(combatants);
    }

    /**
     * Create side initiative order
     * @private
     * @param {Array} combatants - Array of combatants
     * @returns {Promise<Array>} Initiative order
     */
    async _createSideInitiativeOrder(combatants) {
        // Roll side initiative
        const { players, monsters, playersFirst } = await this.rollSideInitiative(combatants);
        
        // Create initiative order
        const initiativeOrder = [];
        
        // Sort players and monsters
        const sortedPlayers = this.sortByInitiative(players.combatants);
        const sortedMonsters = this.sortByInitiative(monsters.combatants);
        
        // Alternate between sides
        if (playersFirst) {
            // Players go first
            initiativeOrder.push(...sortedPlayers);
            initiativeOrder.push(...sortedMonsters);
        } else {
            // Monsters go first
            initiativeOrder.push(...sortedMonsters);
            initiativeOrder.push(...sortedPlayers);
        }
        
        return initiativeOrder;
    }

    /**
     * Get initiative modifier string
     * @param {number} modifier - Initiative modifier
     * @returns {string} Formatted modifier string
     */
    getModifierString(modifier) {
        if (modifier === 0) return '+0';
        return modifier > 0 ? `+${modifier}` : `${modifier}`;
    }

    /**
     * Format initiative roll result
     * @param {Object} rollResult - Roll result
     * @returns {string} Formatted roll result
     */
    formatRollResult(rollResult) {
        if (!rollResult) return '';
        
        // For advantage/disadvantage
        if (rollResult.results && rollResult.results[0] && rollResult.results[0].rolls) {
            const [roll1, roll2] = rollResult.results[0].rolls;
            const useRoll = rollResult.results[0].useRoll;
            const isAdvantage = rollResult.advantage;
            const isDisadvantage = rollResult.disadvantage;
            
            if (isAdvantage || isDisadvantage) {
                return `${roll1}${roll1 === useRoll ? '*' : ''}, ${roll2}${roll2 === useRoll ? '*' : ''} ${isAdvantage ? '(adv)' : '(dis)'}`;
            }
        }
        
        // For normal rolls
        return `${rollResult.total}`;
    }

    /**
     * Check if a combatant has advantage on initiative
     * @param {Object} combatant - Combatant object
     * @returns {boolean} True if combatant has advantage
     */
    hasAdvantage(combatant) {
        // Check for features that grant initiative advantage
        
        // Alert feat
        if (combatant.features && combatant.features.some(f => 
            f.name.toLowerCase() === 'alert' || 
            f.description.toLowerCase().includes('advantage on initiative')
        )) {
            return true;
        }
        
        // Barbarian's Feral Instinct
        if (combatant.classes && combatant.classes.some(c => 
            c.name.toLowerCase() === 'barbarian' && c.level >= 7
        )) {
            return true;
        }
        
        // Custom initiative advantage flag
        return combatant.initiativeAdvantage === true;
    }

    /**
     * Check if a combatant has disadvantage on initiative
     * @param {Object} combatant - Combatant object
     * @returns {boolean} True if combatant has disadvantage
     */
    hasDisadvantage(combatant) {
        // Check for conditions that impose disadvantage
        if (combatant.conditions) {
            const disadvantageConditions = ['poisoned', 'frightened'];
            for (const condition of combatant.conditions) {
                if (disadvantageConditions.includes(condition.id)) {
                    return true;
                }
            }
        }
        
        // Custom initiative disadvantage flag
        return combatant.initiativeDisadvantage === true;
    }

    /**
     * Get initiative bonus for a combatant
     * @param {Object} combatant - Combatant object
     * @returns {number} Initiative bonus
     */
    getInitiativeBonus(combatant) {
        // Start with base modifier
        let bonus = combatant.initiativeModifier !== undefined ? 
            combatant.initiativeModifier : 
            this.calculateInitiativeModifier(combatant.abilities);
        
        // Add bonuses from features
        
        // Alert feat (+5)
        if (combatant.features && combatant.features.some(f => f.name.toLowerCase() === 'alert')) {
            bonus += 5;
        }
        
        // Jack of All Trades (half proficiency to initiative)
        if (combatant.features && combatant.features.some(f => 
            f.name.toLowerCase() === 'jack of all trades' || 
            f.description.toLowerCase().includes('jack of all trades')
        )) {
            const profBonus = this._getProficiencyBonus(combatant);
            bonus += Math.floor(profBonus / 2);
        }
        
        // Remarkable Athlete (half proficiency to initiative)
        if (combatant.features && combatant.features.some(f => 
            f.name.toLowerCase() === 'remarkable athlete' || 
            f.description.toLowerCase().includes('remarkable athlete')
        )) {
            const profBonus = this._getProficiencyBonus(combatant);
            bonus += Math.floor(profBonus / 2);
        }
        
        return bonus;
    }

    /**
     * Get proficiency bonus for a combatant
     * @private
     * @param {Object} combatant - Combatant object
     * @returns {number} Proficiency bonus
     */
    _getProficiencyBonus(combatant) {
        // Use explicit proficiency bonus if available
        if (combatant.proficiencyBonus !== undefined) {
            return combatant.proficiencyBonus;
        }
        
        // Calculate from level or CR
        if (combatant.type === 'pc' && combatant.level) {
            return Math.floor((combatant.level - 1) / 4) + 2;
        } else if (combatant.cr) {
            let cr = combatant.cr;
            
            // Convert string CR to number
            if (typeof cr === 'string') {
                if (cr === '1/8') cr = 0.125;
                else if (cr === '1/4') cr = 0.25;
                else if (cr === '1/2') cr = 0.5;
                else cr = parseFloat(cr);
            }
            
            return Math.max(2, Math.floor((cr - 1) / 4) + 2);
        }
        
        // Default
        return 2;
    }

    /**
     * Get initiative tiebreaker value for a combatant
     * @param {Object} combatant - Combatant object
     * @returns {number} Tiebreaker value
     */
    getTiebreakerValue(combatant) {
        // Use DEX as tiebreaker
        if (combatant.abilities && combatant.abilities.dex) {
            return combatant.abilities.dex;
        }
        
        return 10; // Default DEX
    }

    /**
     * Reroll initiative for a combatant
     * @param {Object} combatant - Combatant object
     * @returns {Promise<Object>} Initiative result
     */
    async rerollInitiative(combatant) {
        return await this.rollForCombatant(combatant);
    }
}

// Export the Initiative class
export default Initiative;
