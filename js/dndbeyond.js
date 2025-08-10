/**
 * Jesster's Combat Tracker
 * D&D Beyond Integration Module
 * Version 2.3.1
 * 
 * This module handles integration with D&D Beyond, allowing users to import
 * characters, monsters, and other data from D&D Beyond into the combat tracker.
 * 
 * Note: This integration uses client-side parsing of publicly accessible data
 * and does not access any private D&D Beyond API endpoints.
 */

/**
 * Configuration for D&D Beyond integration
 */
const DDB_CONFIG = {
  // Base URLs
  characterUrl: 'https://www.dndbeyond.com/characters/',
  monsterUrl: 'https://www.dndbeyond.com/monsters/',
  spellUrl: 'https://www.dndbeyond.com/spells/',
  itemUrl: 'https://www.dndbeyond.com/magic-items/',
  
  // Selectors for parsing
  selectors: {
    character: {
      name: '.ct-character-tidbits__name',
      level: '.ct-character-level-box__level-number',
      hp: '.ct-health-summary__hp-number',
      ac: '.ct-armor-class__value',
      stats: '.ct-ability-summary__score',
      profBonus: '.ct-proficiency-bonus-box__value',
      initiative: '.ct-initiative-box__value',
      speed: '.ct-speed-box__box-value',
      classes: '.ct-classes-info__classes',
      race: '.ct-race__name',
      savingThrows: '.ct-saving-throws-summary__ability-modifier',
      skills: '.ct-skills__item'
    },
    monster: {
      name: '.mon-stat-block__name',
      type: '.mon-stat-block__meta',
      ac: '.mon-stat-block__attribute-value',
      hp: '.mon-stat-block__attribute-data-value',
      speed: '.mon-stat-block__attribute-data-value',
      stats: '.ability-block__score',
      savingThrows: '.mon-stat-block__attribute-data-value',
      skills: '.mon-stat-block__attribute-data-value',
      senses: '.mon-stat-block__attribute-data-value',
      languages: '.mon-stat-block__attribute-data-value',
      cr: '.mon-stat-block__attribute-data-value',
      traits: '.mon-stat-block__description-block',
      actions: '.mon-stat-block__description-block'
    }
  }
};

/**
 * Import a character from D&D Beyond
 * @param {string} url - The URL of the D&D Beyond character sheet
 * @returns {Promise<Object>} A promise that resolves to the imported character data
 */
export async function importCharacterFromDDB(url) {
  try {
    // Validate URL
    if (!isValidDDBUrl(url, 'character')) {
      throw new Error('Invalid D&D Beyond character URL');
    }
    
    // Extract character ID from URL
    const characterId = extractIdFromUrl(url);
    
    // Fetch character data
    const characterData = await fetchCharacterData(characterId);
    
    // Parse character data
    return parseCharacterData(characterData);
  } catch (error) {
    console.error('Error importing character from D&D Beyond:', error);
    throw error;
  }
}

/**
 * Import a monster from D&D Beyond
 * @param {string} url - The URL of the D&D Beyond monster page
 * @returns {Promise<Object>} A promise that resolves to the imported monster data
 */
export async function importMonsterFromDDB(url) {
  try {
    // Validate URL
    if (!isValidDDBUrl(url, 'monster')) {
      throw new Error('Invalid D&D Beyond monster URL');
    }
    
    // Extract monster ID from URL
    const monsterId = extractIdFromUrl(url);
    
    // Fetch monster data
    const monsterData = await fetchMonsterData(monsterId);
    
    // Parse monster data
    return parseMonsterData(monsterData);
  } catch (error) {
    console.error('Error importing monster from D&D Beyond:', error);
    throw error;
  }
}

/**
 * Import a spell from D&D Beyond
 * @param {string} url - The URL of the D&D Beyond spell page
 * @returns {Promise<Object>} A promise that resolves to the imported spell data
 */
export async function importSpellFromDDB(url) {
  try {
    // Validate URL
    if (!isValidDDBUrl(url, 'spell')) {
      throw new Error('Invalid D&D Beyond spell URL');
    }
    
    // Extract spell ID from URL
    const spellId = extractIdFromUrl(url);
    
    // Fetch spell data
    const spellData = await fetchSpellData(spellId);
    
    // Parse spell data
    return parseSpellData(spellData);
  } catch (error) {
    console.error('Error importing spell from D&D Beyond:', error);
    throw error;
  }
}

/**
 * Import a magic item from D&D Beyond
 * @param {string} url - The URL of the D&D Beyond magic item page
 * @returns {Promise<Object>} A promise that resolves to the imported item data
 */
export async function importItemFromDDB(url) {
  try {
    // Validate URL
    if (!isValidDDBUrl(url, 'item')) {
      throw new Error('Invalid D&D Beyond magic item URL');
    }
    
    // Extract item ID from URL
    const itemId = extractIdFromUrl(url);
    
    // Fetch item data
    const itemData = await fetchItemData(itemId);
    
    // Parse item data
    return parseItemData(itemData);
  } catch (error) {
    console.error('Error importing item from D&D Beyond:', error);
    throw error;
  }
}

/**
 * Import a character from a D&D Beyond character sheet JSON export
 * @param {Object} jsonData - The exported character JSON data
 * @returns {Object} The imported character data
 */
export function importCharacterFromJSON(jsonData) {
  try {
    // Validate that this is a D&D Beyond character export
    if (!jsonData || !jsonData.character || !jsonData.character.name) {
      throw new Error('Invalid D&D Beyond character JSON format');
    }
    
    // Parse the character data from the JSON
    return parseCharacterJSON(jsonData);
  } catch (error) {
    console.error('Error importing character from JSON:', error);
    throw error;
  }
}

/**
 * Check if a URL is a valid D&D Beyond URL
 * @param {string} url - The URL to check
 * @param {string} type - The type of resource ('character', 'monster', 'spell', 'item')
 * @returns {boolean} True if the URL is valid
 */
function isValidDDBUrl(url, type) {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  // Check if URL is from D&D Beyond
  if (!url.includes('dndbeyond.com')) {
    return false;
  }
  
  // Check if URL is for the correct resource type
  switch (type) {
    case 'character':
      return url.includes('/characters/');
    case 'monster':
      return url.includes('/monsters/');
    case 'spell':
      return url.includes('/spells/');
    case 'item':
      return url.includes('/magic-items/');
    default:
      return false;
  }
}

/**
 * Extract the resource ID from a D&D Beyond URL
 * @param {string} url - The D&D Beyond URL
 * @returns {string} The extracted ID
 */
function extractIdFromUrl(url) {
  // Extract the ID from the URL
  // URLs are typically in the format: https://www.dndbeyond.com/resource-type/12345-resource-name
  const matches = url.match(/\/(\d+)(?:-|$)/);
  
  if (!matches || matches.length < 2) {
    throw new Error('Could not extract ID from URL');
  }
  
  return matches[1];
}

/**
 * Fetch character data from D&D Beyond
 * @param {string} characterId - The D&D Beyond character ID
 * @returns {Promise<Object>} A promise that resolves to the character data
 */
async function fetchCharacterData(characterId) {
  try {
    // Construct the character URL
    const url = `${DDB_CONFIG.characterUrl}${characterId}`;
    
    // Fetch the character page
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Get the HTML content
    const html = await response.text();
    
    // Create a DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Check if the page contains character data
    if (!doc.querySelector(DDB_CONFIG.selectors.character.name)) {
      throw new Error('Could not find character data on the page');
    }
    
    return doc;
  } catch (error) {
    console.error('Error fetching character data:', error);
    throw error;
  }
}

/**
 * Fetch monster data from D&D Beyond
 * @param {string} monsterId - The D&D Beyond monster ID
 * @returns {Promise<Object>} A promise that resolves to the monster data
 */
async function fetchMonsterData(monsterId) {
  try {
    // Construct the monster URL
    const url = `${DDB_CONFIG.monsterUrl}${monsterId}`;
    
    // Fetch the monster page
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Get the HTML content
    const html = await response.text();
    
    // Create a DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Check if the page contains monster data
    if (!doc.querySelector(DDB_CONFIG.selectors.monster.name)) {
      throw new Error('Could not find monster data on the page');
    }
    
    return doc;
  } catch (error) {
    console.error('Error fetching monster data:', error);
    throw error;
  }
}

/**
 * Fetch spell data from D&D Beyond
 * @param {string} spellId - The D&D Beyond spell ID
 * @returns {Promise<Object>} A promise that resolves to the spell data
 */
async function fetchSpellData(spellId) {
  try {
    // Construct the spell URL
    const url = `${DDB_CONFIG.spellUrl}${spellId}`;
    
    // Fetch the spell page
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Get the HTML content
    const html = await response.text();
    
    // Create a DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    return doc;
  } catch (error) {
    console.error('Error fetching spell data:', error);
    throw error;
  }
}

/**
 * Fetch item data from D&D Beyond
 * @param {string} itemId - The D&D Beyond item ID
 * @returns {Promise<Object>} A promise that resolves to the item data
 */
async function fetchItemData(itemId) {
  try {
    // Construct the item URL
    const url = `${DDB_CONFIG.itemUrl}${itemId}`;
    
    // Fetch the item page
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Get the HTML content
    const html = await response.text();
    
    // Create a DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    return doc;
  } catch (error) {
    console.error('Error fetching item data:', error);
    throw error;
  }
}

/**
 * Parse character data from a D&D Beyond character page
 * @param {Document} doc - The parsed HTML document
 * @returns {Object} The parsed character data
 */
function parseCharacterData(doc) {
  try {
    const selectors = DDB_CONFIG.selectors.character;
    
    // Extract basic character information
    const name = doc.querySelector(selectors.name)?.textContent.trim() || 'Unknown Character';
    const levelElement = doc.querySelector(selectors.level);
    const level = levelElement ? parseInt(levelElement.textContent.trim(), 10) : 1;
    
    // Extract HP
    const hpElement = doc.querySelector(selectors.hp);
    const hp = hpElement ? parseInt(hpElement.textContent.trim(), 10) : 10;
    
    // Extract AC
    const acElement = doc.querySelector(selectors.ac);
    const ac = acElement ? parseInt(acElement.textContent.trim(), 10) : 10;
    
    // Extract ability scores
    const statElements = doc.querySelectorAll(selectors.stats);
    const abilities = {
      str: 10,
      dex: 10,
      con: 10,
      int: 10,
      wis: 10,
      cha: 10
    };
    
    if (statElements.length >= 6) {
      abilities.str = parseInt(statElements[0].textContent.trim(), 10) || 10;
      abilities.dex = parseInt(statElements[1].textContent.trim(), 10) || 10;
      abilities.con = parseInt(statElements[2].textContent.trim(), 10) || 10;
      abilities.int = parseInt(statElements[3].textContent.trim(), 10) || 10;
      abilities.wis = parseInt(statElements[4].textContent.trim(), 10) || 10;
      abilities.cha = parseInt(statElements[5].textContent.trim(), 10) || 10;
    }
    
    // Extract proficiency bonus
    const profBonusElement = doc.querySelector(selectors.profBonus);
    const profBonus = profBonusElement ? 
      parseInt(profBonusElement.textContent.trim().replace('+', ''), 10) : 
      Math.ceil(level / 4) + 1;
    
    // Extract initiative
    const initiativeElement = doc.querySelector(selectors.initiative);
    const initiative = initiativeElement ? 
      parseInt(initiativeElement.textContent.trim().replace('+', ''), 10) : 
      Math.floor((abilities.dex - 10) / 2);
    
    // Extract speed
    const speedElement = doc.querySelector(selectors.speed);
    const speed = speedElement ? 
      parseInt(speedElement.textContent.trim().replace(' ft.', ''), 10) : 
      30;
    
    // Extract race
    const raceElement = doc.querySelector(selectors.race);
    const race = raceElement ? raceElement.textContent.trim() : 'Unknown';
    
    // Extract class information
    const classElement = doc.querySelector(selectors.classes);
    let characterClass = 'Unknown';
    if (classElement) {
      characterClass = classElement.textContent.trim()
        .replace(/\s+/g, ' ')
        .replace(/Level \d+/g, '')
        .trim();
    }
    
    // Extract saving throws
    const savingThrowElements = doc.querySelectorAll(selectors.savingThrows);
    const savingThrows = {};
    const abilityAbbreviations = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
    
    if (savingThrowElements.length >= 6) {
      for (let i = 0; i < 6; i++) {
        const value = savingThrowElements[i].textContent.trim();
        savingThrows[abilityAbbreviations[i]] = parseInt(value.replace('+', ''), 10) || 0;
      }
    }
    
    // Extract skills
    const skillElements = doc.querySelectorAll(selectors.skills);
    const skills = {};
    
    skillElements.forEach(element => {
      const skillName = element.querySelector('.ct-skills__col--skill')?.textContent.trim().toLowerCase();
      const skillValue = element.querySelector('.ct-skills__col--modifier')?.textContent.trim();
      
      if (skillName && skillValue) {
        skills[skillName] = parseInt(skillValue.replace('+', ''), 10) || 0;
      }
    });
    
    // Construct the character object
    return {
      id: `ddb-character-${Date.now()}`,
      name,
      type: 'player',
      level,
      hp,
      maxHp: hp,
      tempHp: 0,
      ac,
      initiative,
      speed,
      abilities,
      profBonus,
      race,
      class: characterClass,
      savingThrows,
      skills,
      source: 'dndbeyond',
      sourceUrl: doc.URL
    };
  } catch (error) {
    console.error('Error parsing character data:', error);
    throw error;
  }
}

/**
 * Parse monster data from a D&D Beyond monster page
 * @param {Document} doc - The parsed HTML document
 * @returns {Object} The parsed monster data
 */
function parseMonsterData(doc) {
  try {
    const selectors = DDB_CONFIG.selectors.monster;
    
    // Extract basic monster information
    const name = doc.querySelector(selectors.name)?.textContent.trim() || 'Unknown Monster';
    
    // Extract type, size, and alignment
    const metaElement = doc.querySelector(selectors.type);
    let type = 'unknown';
    let size = 'Medium';
    let alignment = 'unaligned';
    
    if (metaElement) {
      const metaText = metaElement.textContent.trim();
      
      // Extract size
      const sizeMatch = metaText.match(/^(Tiny|Small|Medium|Large|Huge|Gargantuan)/i);
      if (sizeMatch) {
        size = sizeMatch[1];
      }
      
      // Extract type
      const typeMatch = metaText.match(/(aberration|beast|celestial|construct|dragon|elemental|fey|fiend|giant|humanoid|monstrosity|ooze|plant|undead)/i);
      if (typeMatch) {
        type = typeMatch[1].toLowerCase();
      }
      
      // Extract alignment
      const alignmentMatch = metaText.match(/(lawful|neutral|chaotic|unaligned)\s+(good|neutral|evil)/i);
      if (alignmentMatch) {
        alignment = `${alignmentMatch[1].toLowerCase()} ${alignmentMatch[2].toLowerCase()}`;
      } else if (metaText.includes('unaligned')) {
        alignment = 'unaligned';
      }
    }
    
    // Extract AC
    const acElements = doc.querySelectorAll(selectors.ac);
    let ac = 10;
    let acType = '';
    
    if (acElements.length > 0) {
      const acText = acElements[0].textContent.trim();
      const acMatch = acText.match(/(\d+)/);
      if (acMatch) {
        ac = parseInt(acMatch[1], 10);
      }
      
      const acTypeMatch = acText.match(/\(([^)]+)\)/);
      if (acTypeMatch) {
        acType = acTypeMatch[1];
      }
    }
    
    // Extract HP
    const hpElements = doc.querySelectorAll(selectors.hp);
    let hp = 10;
    let hpDice = '';
    
    if (hpElements.length > 1) {
      const hpText = hpElements[1].textContent.trim();
      const hpMatch = hpText.match(/(\d+)/);
      if (hpMatch) {
        hp = parseInt(hpMatch[1], 10);
      }
      
      const hpDiceMatch = hpText.match(/\(([^)]+)\)/);
      if (hpDiceMatch) {
        hpDice = hpDiceMatch[1];
      }
    }
    
    // Extract speed
    const speedElements = doc.querySelectorAll(selectors.speed);
    const speed = { walk: 30 };
    
    if (speedElements.length > 2) {
      const speedText = speedElements[2].textContent.trim();
      
      // Extract walking speed
      const walkMatch = speedText.match(/(\d+)\s*ft\./);
      if (walkMatch) {
        speed.walk = parseInt(walkMatch[1], 10);
      }
      
      // Extract other speeds
      const flyMatch = speedText.match(/fly\s+(\d+)\s*ft\./i);
      if (flyMatch) {
        speed.fly = parseInt(flyMatch[1], 10);
      }
      
      const swimMatch = speedText.match(/swim\s+(\d+)\s*ft\./i);
      if (swimMatch) {
        speed.swim = parseInt(swimMatch[1], 10);
      }
      
      const climbMatch = speedText.match(/climb\s+(\d+)\s*ft\./i);
      if (climbMatch) {
        speed.climb = parseInt(climbMatch[1], 10);
      }
      
      const burrowMatch = speedText.match(/burrow\s+(\d+)\s*ft\./i);
      if (burrowMatch) {
        speed.burrow = parseInt(burrowMatch[1], 10);
      }
    }
    
    // Extract ability scores
    const statElements = doc.querySelectorAll(selectors.stats);
    const abilities = {
      str: 10,
      dex: 10,
      con: 10,
      int: 10,
      wis: 10,
      cha: 10
    };
    
    if (statElements.length >= 6) {
      abilities.str = parseInt(statElements[0].textContent.trim(), 10) || 10;
      abilities.dex = parseInt(statElements[1].textContent.trim(), 10) || 10;
      abilities.con = parseInt(statElements[2].textContent.trim(), 10) || 10;
      abilities.int = parseInt(statElements[3].textContent.trim(), 10) || 10;
      abilities.wis = parseInt(statElements[4].textContent.trim(), 10) || 10;
      abilities.cha = parseInt(statElements[5].textContent.trim(), 10) || 10;
    }
    
    // Extract CR
    const crElements = doc.querySelectorAll(selectors.cr);
    let cr = '0';
    
    for (const element of crElements) {
      const text = element.textContent.trim();
      if (text.includes('Challenge')) {
        const crMatch = text.match(/Challenge\s+([\d/]+)/);
        if (crMatch) {
          cr = crMatch[1];
        }
        break;
      }
    }
    
    // Extract traits, actions, and legendary actions
    const traits = [];
    const actions = [];
    const legendaryActions = [];
    
    const descriptionBlocks = doc.querySelectorAll(selectors.traits);
    let currentSection = null;
    
    for (const block of descriptionBlocks) {
      const heading = block.querySelector('h3');
      
      if (heading) {
        const headingText = heading.textContent.trim();
        
        if (headingText === 'Actions') {
          currentSection = 'actions';
          continue;
        } else if (headingText === 'Legendary Actions') {
          currentSection = 'legendaryActions';
          continue;
        } else if (headingText === 'Traits') {
          currentSection = 'traits';
          continue;
        }
      }
      
      const nameElement = block.querySelector('.mon-stat-block__description-block-heading');
      const descriptionElement = block.querySelector('.mon-stat-block__description-block-content');
      
      if (nameElement && descriptionElement) {
        const name = nameElement.textContent.trim();
        const description = descriptionElement.textContent.trim();
        
        const item = { name, description };
        
        if (currentSection === 'actions') {
          actions.push(item);
        } else if (currentSection === 'legendaryActions') {
          legendaryActions.push(item);
        } else if (currentSection === 'traits') {
          traits.push(item);
        }
      }
    }
    
    // Construct the monster object
    return {
      id: `ddb-monster-${Date.now()}`,
      name,
      size,
      type,
      alignment,
      ac,
      acType,
      hp,
      maxHp: hp,
      hpDice,
      speed,
      abilities,
      cr,
      traits,
      actions,
      legendaryActions: legendaryActions.length > 0 ? legendaryActions : undefined,
      source: 'dndbeyond',
      sourceUrl: doc.URL
    };
  } catch (error) {
    console.error('Error parsing monster data:', error);
    throw error;
  }
}

/**
 * Parse spell data from a D&D Beyond spell page
 * @param {Document} doc - The parsed HTML document
 * @returns {Object} The parsed spell data
 */
function parseSpellData(doc) {
  try {
    // Extract spell name
    const nameElement = doc.querySelector('.page-title');
    const name = nameElement ? nameElement.textContent.trim() : 'Unknown Spell';
    
    // Extract spell level and school
    const levelSchoolElement = doc.querySelector('.ddb-statblock-item-level');
    let level = 0;
    let school = 'evocation';
    
    if (levelSchoolElement) {
      const text = levelSchoolElement.textContent.trim();
      
      // Extract level
      const levelMatch = text.match(/(\d+)(?:st|nd|rd|th)-level/);
      if (levelMatch) {
        level = parseInt(levelMatch[1], 10);
      } else if (text.includes('Cantrip')) {
        level = 0;
      }
      
      // Extract school
      const schoolMatch = text.match(/(abjuration|conjuration|divination|enchantment|evocation|illusion|necromancy|transmutation)/i);
      if (schoolMatch) {
        school = schoolMatch[1].toLowerCase();
      }
    }
    
    // Extract casting time
    const castingTimeElement = doc.querySelector('.ddb-statblock-item-casting-time');
    let castingTime = '1 action';
    
    if (castingTimeElement) {
      castingTime = castingTimeElement.textContent.replace('Casting Time:', '').trim();
    }
    
    // Extract range
    const rangeElement = doc.querySelector('.ddb-statblock-item-range');
    let range = 'Self';
    
    if (rangeElement) {
      range = rangeElement.textContent.replace('Range:', '').trim();
    }
    
    // Extract components
    const componentsElement = doc.querySelector('.ddb-statblock-item-components');
    const components = {
      verbal: false,
      somatic: false,
      material: false,
      materials: ''
    };
    
    if (componentsElement) {
      const text = componentsElement.textContent.replace('Components:', '').trim();
      
      components.verbal = text.includes('V');
      components.somatic = text.includes('S');
      components.material = text.includes('M');
      
      const materialsMatch = text.match(/\(([^)]+)\)/);
      if (materialsMatch) {
        components.materials = materialsMatch[1];
      }
    }
    
    // Extract duration
    const durationElement = doc.querySelector('.ddb-statblock-item-duration');
    let duration = 'Instantaneous';
    
    if (durationElement) {
      duration = durationElement.textContent.replace('Duration:', '').trim();
    }
    
    // Extract description
    const descriptionElement = doc.querySelector('.ddb-statblock-description');
    let description = '';
    
    if (descriptionElement) {
      description = descriptionElement.textContent.trim();
    }
    
    // Extract higher level casting info
    const atHigherLevelsElement = doc.querySelector('.ddb-statblock-item-at-higher-levels');
    let atHigherLevels = '';
    
    if (atHigherLevelsElement) {
      atHigherLevels = atHigherLevelsElement.textContent.replace('At Higher Levels:', '').trim();
    }
    
    // Extract classes
    const classesElement = doc.querySelector('.ddb-statblock-item-classes');
    const tags = [];
    
    if (classesElement) {
      const text = classesElement.textContent.replace('Classes:', '').trim();
      const classes = text.split(',').map(c => c.trim().toLowerCase());
      
      classes.forEach(c => {
        if (c) tags.push(c);
      });
    }
    
    // Add spell level tag
    if (level === 0) {
      tags.push('cantrip');
    } else {
      tags.push(`level${level}`);
    }
    
    // Add school tag
    tags.push(school);
    
    // Construct the spell object
    return {
      id: `ddb-spell-${Date.now()}`,
      name,
      level,
      school,
      castingTime,
      range,
      components,
      duration,
      description,
      atHigherLevels,
      tags,
      source: 'dndbeyond',
      sourceUrl: doc.URL
    };
  } catch (error) {
    console.error('Error parsing spell data:', error);
    throw error;
  }
}

/**
 * Parse item data from a D&D Beyond item page
 * @param {Document} doc - The parsed HTML document
 * @returns {Object} The parsed item data
 */
function parseItemData(doc) {
  try {
    // Extract item name
    const nameElement = doc.querySelector('.page-title');
    const name = nameElement ? nameElement.textContent.trim() : 'Unknown Item';
    
    // Extract item type and rarity
    const typeRarityElement = doc.querySelector('.ddb-statblock-item-type');
    let type = 'Wondrous item';
    let rarity = 'uncommon';
    
    if (typeRarityElement) {
      const text = typeRarityElement.textContent.trim();
      
      // Extract type
      const typeMatch = text.match(/^([^,]+)/);
      if (typeMatch) {
        type = typeMatch[1].trim();
      }
      
      // Extract rarity
      const rarityMatch = text.match(/(common|uncommon|rare|very rare|legendary|artifact)/i);
      if (rarityMatch) {
        rarity = rarityMatch[1].toLowerCase();
      }
    }
    
        // Extract attunement requirement
    const attunementElement = doc.querySelector('.ddb-statblock-item-attunement');
    let attunement = false;
    let attunementRequirements = '';
    
    if (attunementElement) {
      attunement = true;
      const text = attunementElement.textContent.replace('Requires Attunement', '').trim();
      
      if (text && text !== '') {
        attunementRequirements = text.replace(/^\s*by\s+/i, '');
      }
    }
    
    // Extract description
    const descriptionElement = doc.querySelector('.ddb-statblock-description');
    let description = '';
    
    if (descriptionElement) {
      description = descriptionElement.textContent.trim();
    }
    
    // Construct the item object
    return {
      id: `ddb-item-${Date.now()}`,
      name,
      type,
      rarity,
      attunement,
      attunementRequirements,
      description,
      source: 'dndbeyond',
      sourceUrl: doc.URL
    };
  } catch (error) {
    console.error('Error parsing item data:', error);
    throw error;
  }
}

/**
 * Parse character data from a D&D Beyond character JSON export
 * @param {Object} jsonData - The exported character JSON data
 * @returns {Object} The parsed character data
 */
function parseCharacterJSON(jsonData) {
  try {
    const character = jsonData.character;
    
    // Extract basic character information
    const name = character.name || 'Unknown Character';
    
    // Calculate level
    let level = 0;
    if (character.classes && Array.isArray(character.classes)) {
      character.classes.forEach(cls => {
        level += cls.level || 0;
      });
    }
    level = level || 1; // Default to level 1 if no classes found
    
    // Extract HP
    const hp = character.overrideHitPoints || character.baseHitPoints || 10;
    
    // Extract AC
    const ac = character.armorClass || 10;
    
    // Extract ability scores
    const abilities = {
      str: 10,
      dex: 10,
      con: 10,
      int: 10,
      wis: 10,
      cha: 10
    };
    
    if (character.stats) {
      abilities.str = character.stats.find(s => s.id === 1)?.value || 10;
      abilities.dex = character.stats.find(s => s.id === 2)?.value || 10;
      abilities.con = character.stats.find(s => s.id === 3)?.value || 10;
      abilities.int = character.stats.find(s => s.id === 4)?.value || 10;
      abilities.wis = character.stats.find(s => s.id === 5)?.value || 10;
      abilities.cha = character.stats.find(s => s.id === 6)?.value || 10;
    }
    
    // Extract proficiency bonus
    const profBonus = Math.ceil(level / 4) + 1;
    
    // Extract initiative
    const initiative = Math.floor((abilities.dex - 10) / 2);
    
    // Extract speed
    const speed = character.race?.weightSpeeds?.normal || 30;
    
    // Extract race
    const race = character.race?.fullName || 'Unknown';
    
    // Extract class information
    let characterClass = 'Unknown';
    if (character.classes && Array.isArray(character.classes) && character.classes.length > 0) {
      characterClass = character.classes.map(cls => `${cls.definition?.name || 'Unknown'} ${cls.level || 0}`).join(', ');
    }
    
    // Extract saving throws
    const savingThrows = {};
    const abilityAbbreviations = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
    
    if (character.modifiers && character.modifiers.class) {
      const savingThrowMods = character.modifiers.class.filter(mod => 
        mod.type === 'proficiency' && 
        mod.subType === 'saving-throw'
      );
      
      savingThrowMods.forEach(mod => {
        const statId = mod.statId;
        if (statId >= 1 && statId <= 6) {
          const ability = abilityAbbreviations[statId - 1];
          const abilityMod = Math.floor((abilities[ability] - 10) / 2);
          savingThrows[ability] = abilityMod + profBonus;
        }
      });
    }
    
    // Fill in missing saving throws with ability modifiers
    abilityAbbreviations.forEach(ability => {
      if (!savingThrows[ability]) {
        savingThrows[ability] = Math.floor((abilities[ability] - 10) / 2);
      }
    });
    
    // Extract skills
    const skills = {};
    const skillMap = {
      1: 'athletics',
      2: 'acrobatics',
      3: 'sleight of hand',
      4: 'stealth',
      5: 'arcana',
      6: 'history',
      7: 'investigation',
      8: 'nature',
      9: 'religion',
      10: 'animal handling',
      11: 'insight',
      12: 'medicine',
      13: 'perception',
      14: 'survival',
      15: 'deception',
      16: 'intimidation',
      17: 'performance',
      18: 'persuasion'
    };
    
    if (character.modifiers && character.modifiers.class) {
      const skillMods = character.modifiers.class.filter(mod => 
        mod.type === 'proficiency' && 
        mod.subType === 'skill'
      );
      
      skillMods.forEach(mod => {
        const skillId = mod.skillId;
        if (skillMap[skillId]) {
          const skillName = skillMap[skillId];
          const abilityMap = {
            'athletics': 'str',
            'acrobatics': 'dex',
            'sleight of hand': 'dex',
            'stealth': 'dex',
            'arcana': 'int',
            'history': 'int',
            'investigation': 'int',
            'nature': 'int',
            'religion': 'int',
            'animal handling': 'wis',
            'insight': 'wis',
            'medicine': 'wis',
            'perception': 'wis',
            'survival': 'wis',
            'deception': 'cha',
            'intimidation': 'cha',
            'performance': 'cha',
            'persuasion': 'cha'
          };
          
          const ability = abilityMap[skillName];
          const abilityMod = Math.floor((abilities[ability] - 10) / 2);
          skills[skillName] = abilityMod + profBonus;
        }
      });
    }
    
    // Construct the character object
    return {
      id: `ddb-character-${Date.now()}`,
      name,
      type: 'player',
      level,
      hp,
      maxHp: hp,
      tempHp: 0,
      ac,
      initiative,
      speed,
      abilities,
      profBonus,
      race,
      class: characterClass,
      savingThrows,
      skills,
      source: 'dndbeyond',
      sourceUrl: character.readonlyUrl || ''
    };
  } catch (error) {
    console.error('Error parsing character JSON:', error);
    throw error;
  }
}

/**
 * Check if a character is publicly accessible on D&D Beyond
 * @param {string} characterId - The D&D Beyond character ID
 * @returns {Promise<boolean>} A promise that resolves to true if the character is accessible
 */
export async function isCharacterAccessible(characterId) {
  try {
    // Construct the character URL
    const url = `${DDB_CONFIG.characterUrl}${characterId}`;
    
    // Fetch the character page
    const response = await fetch(url);
    
    // If the response is ok, the character is accessible
    return response.ok;
  } catch (error) {
    console.error('Error checking character accessibility:', error);
    return false;
  }
}

/**
 * Get a list of public characters for the current D&D Beyond user
 * @returns {Promise<Array>} A promise that resolves to an array of character summaries
 */
export async function getPublicCharacters() {
  try {
    // Check if the user is logged in to D&D Beyond
    const isLoggedIn = document.cookie.includes('DDB_') || document.cookie.includes('CobaltSession');
    
    if (!isLoggedIn) {
      throw new Error('User is not logged in to D&D Beyond');
    }
    
    // Fetch the characters list page
    const response = await fetch('https://www.dndbeyond.com/characters');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Get the HTML content
    const html = await response.text();
    
    // Create a DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Find character cards
    const characterCards = doc.querySelectorAll('.ddb-characters-list-item');
    const characters = [];
    
    characterCards.forEach(card => {
      const nameElement = card.querySelector('.ddb-characters-list-item-name');
      const linkElement = card.querySelector('a.ddb-characters-list-item-link');
      const levelElement = card.querySelector('.ddb-characters-list-item-level');
      const raceClassElement = card.querySelector('.ddb-characters-list-item-race-class');
      
      if (nameElement && linkElement) {
        const name = nameElement.textContent.trim();
        const url = linkElement.href;
        const idMatch = url.match(/\/characters\/(\d+)/);
        const id = idMatch ? idMatch[1] : null;
        
        let level = 1;
        if (levelElement) {
          const levelMatch = levelElement.textContent.match(/Level (\d+)/);
          if (levelMatch) {
            level = parseInt(levelMatch[1], 10);
          }
        }
        
        let raceClass = '';
        if (raceClassElement) {
          raceClass = raceClassElement.textContent.trim();
        }
        
        if (id) {
          characters.push({
            id,
            name,
            level,
            raceClass,
            url
          });
        }
      }
    });
    
    return characters;
  } catch (error) {
    console.error('Error getting public characters:', error);
    return [];
  }
}

/**
 * Extract a character ID from a D&D Beyond character sheet URL
 * @param {string} url - The D&D Beyond character sheet URL
 * @returns {string|null} The character ID or null if not found
 */
export function extractCharacterId(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }
  
  // Check if URL is from D&D Beyond
  if (!url.includes('dndbeyond.com/characters')) {
    return null;
  }
  
  // Extract the ID from the URL
  const matches = url.match(/\/characters\/(\d+)/);
  
  if (!matches || matches.length < 2) {
    return null;
  }
  
  return matches[1];
}

/**
 * Extract a monster ID from a D&D Beyond monster page URL
 * @param {string} url - The D&D Beyond monster page URL
 * @returns {string|null} The monster ID or null if not found
 */
export function extractMonsterId(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }
  
  // Check if URL is from D&D Beyond
  if (!url.includes('dndbeyond.com/monsters')) {
    return null;
  }
  
  // Extract the ID from the URL
  const matches = url.match(/\/monsters\/(\d+)/);
  
  if (!matches || matches.length < 2) {
    return null;
  }
  
  return matches[1];
}

/**
 * Check if the browser is currently on D&D Beyond
 * @returns {boolean} True if on D&D Beyond
 */
export function isOnDndBeyond() {
  return window.location.hostname.includes('dndbeyond.com');
}

/**
 * Create a D&D Beyond character sheet URL from a character ID
 * @param {string} characterId - The D&D Beyond character ID
 * @returns {string} The character sheet URL
 */
export function createCharacterUrl(characterId) {
  return `${DDB_CONFIG.characterUrl}${characterId}`;
}

/**
 * Create a D&D Beyond monster page URL from a monster ID
 * @param {string} monsterId - The D&D Beyond monster ID
 * @returns {string} The monster page URL
 */
export function createMonsterUrl(monsterId) {
  return `${DDB_CONFIG.monsterUrl}${monsterId}`;
}

/**
 * Create a D&D Beyond spell page URL from a spell ID
 * @param {string} spellId - The D&D Beyond spell ID
 * @returns {string} The spell page URL
 */
export function createSpellUrl(spellId) {
  return `${DDB_CONFIG.spellUrl}${spellId}`;
}

/**
 * Create a D&D Beyond item page URL from an item ID
 * @param {string} itemId - The D&D Beyond item ID
 * @returns {string} The item page URL
 */
export function createItemUrl(itemId) {
  return `${DDB_CONFIG.itemUrl}${itemId}`;
}

/**
 * Get the D&D Beyond configuration
 * @returns {Object} The D&D Beyond configuration
 */
export function getDndBeyondConfig() {
  return { ...DDB_CONFIG };
}

/**
 * Check if D&D Beyond integration is available in the current browser environment
 * @returns {boolean} True if integration is available
 */
export function isIntegrationAvailable() {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }
  
  // Check if fetch API is available
  if (typeof fetch !== 'function') {
    return false;
  }
  
  // Check if DOMParser is available
  if (typeof DOMParser !== 'function') {
    return false;
  }
  
  return true;
}

/**
 * Create a browser extension message for D&D Beyond integration
 * @param {string} action - The action to perform
 * @param {Object} data - The data for the action
 * @returns {Object} The message object
 */
export function createExtensionMessage(action, data) {
  return {
    source: 'jct',
    action,
    data
  };
}

/**
 * Listen for messages from a browser extension
 * @param {Function} callback - The callback function to handle messages
 * @returns {Function} A function to remove the event listener
 */
export function listenForExtensionMessages(callback) {
  if (typeof window === 'undefined') {
    return () => {};
  }
  
  const messageHandler = (event) => {
    // Check if the message is from our extension
    if (event.data && event.data.source === 'jct_extension') {
      callback(event.data);
    }
  };
  
  window.addEventListener('message', messageHandler);
  
  // Return a function to remove the event listener
  return () => {
    window.removeEventListener('message', messageHandler);
  };
}

/**
 * Send a message to a browser extension
 * @param {Object} message - The message to send
 * @returns {boolean} True if the message was sent
 */
export function sendExtensionMessage(message) {
  if (typeof window === 'undefined') {
    return false;
  }
  
  try {
    window.postMessage({
      ...message,
      source: 'jct'
    }, '*');
    return true;
  } catch (error) {
    console.error('Error sending extension message:', error);
    return false;
  }
}

/**
 * Convert a D&D Beyond character to a combat tracker combatant
 * @param {Object} character - The D&D Beyond character
 * @returns {Object} The combatant object
 */
export function convertCharacterToCombatant(character) {
  return {
    id: `combatant-${Date.now()}`,
    name: character.name,
    type: 'player',
    hp: character.hp,
    maxHp: character.maxHp,
    tempHp: character.tempHp || 0,
    ac: character.ac,
    initiative: 0, // Will be rolled
    initiativeModifier: character.initiative || 0,
    conditions: [],
    source: 'dndbeyond',
    sourceId: character.id,
    sourceUrl: character.sourceUrl,
    abilities: character.abilities,
    level: character.level,
    race: character.race,
    class: character.class,
    speed: character.speed
  };
}

/**
 * Convert a D&D Beyond monster to a combat tracker combatant
 * @param {Object} monster - The D&D Beyond monster
 * @returns {Object} The combatant object
 */
export function convertMonsterToCombatant(monster) {
  return {
    id: `combatant-${Date.now()}`,
    name: monster.name,
    type: 'monster',
    hp: monster.hp,
    maxHp: monster.hp,
    tempHp: 0,
    ac: monster.ac,
    initiative: 0, // Will be rolled
    initiativeModifier: Math.floor((monster.abilities.dex - 10) / 2),
    conditions: [],
    source: 'dndbeyond',
    sourceId: monster.id,
    sourceUrl: monster.sourceUrl,
    abilities: monster.abilities,
    cr: monster.cr,
    size: monster.size,
    monsterType: monster.type,
    alignment: monster.alignment
  };
}

// Export the main integration functions
export default {
  importCharacterFromDDB,
  importMonsterFromDDB,
  importSpellFromDDB,
  importItemFromDDB,
  importCharacterFromJSON,
  isCharacterAccessible,
  getPublicCharacters,
  extractCharacterId,
  extractMonsterId,
  isOnDndBeyond,
  isIntegrationAvailable,
  convertCharacterToCombatant,
  convertMonsterToCombatant
};
