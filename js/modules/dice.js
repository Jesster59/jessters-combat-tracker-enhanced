/**
 * Dice Manager for Jesster's Combat Tracker
 * Handles dice rolling functionality
 */
export class DiceManager {
  constructor(app) {
    this.app = app;
  }
  
  async roll(diceString) {
    if (!diceString) return 0;
    
    // Clean up the dice string
    const cleanedString = String(diceString).toLowerCase().replace(/\s/g, '');
    
    // Check if it's a simple number
    if (/^-?\d+$/.test(cleanedString)) {
      return parseInt(cleanedString, 10);
    }
    
    // Parse dice notation (e.g., "2d6+3")
    const diceRegex = /(\d+)?d(\d+)([+\-]\d+)?/;
    const match = cleanedString.match(diceRegex);
    
    if (!match) {
      console.error(`Invalid dice string: ${diceString}`);
      return 0;
    }
    
    const numDice = match[1] ? parseInt(match[1], 10) : 1;
    const numSides = parseInt(match[2], 10);
    const modifier = match[3] ? parseInt(match[3], 10) : 0;
    
    // Roll the dice
    let total = 0;
    const rolls = [];
    
    for (let i = 0; i < numDice; i++) {
      const roll = Math.floor(Math.random() * numSides) + 1;
      rolls.push(roll);
      total += roll;
    }
    
    // Add modifier
    total += modifier;
    
    // Log the roll
    const rollsText = rolls.join(', ');
    const modifierText = modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : '';
    this.app.logEvent(`Rolled ${diceString}: ${total} [${rollsText}]${modifierText}`);
    
    return total;
  }
  
  async rollWithAdvantage(diceString) {
    const roll1 = await this.roll(diceString);
    const roll2 = await this.roll(diceString);
    const result = Math.max(roll1, roll2);
    
    this.app.logEvent(`Rolled ${diceString} with advantage: ${result} (${roll1}, ${roll2})`);
    
    return result;
  }
  
  async rollWithDisadvantage(diceString) {
    const roll1 = await this.roll(diceString);
    const roll2 = await this.roll(diceString);
    const result = Math.min(roll1, roll2);
    
    this.app.logEvent(`Rolled ${diceString} with disadvantage: ${result} (${roll1}, ${roll2})`);
    
    return result;
  }
}
