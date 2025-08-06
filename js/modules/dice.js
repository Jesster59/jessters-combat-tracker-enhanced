/**
 * Dice Manager for Jesster's Combat Tracker
 * Handles dice rolling functionality
 */
class DiceManager {
  constructor(app) {
    this.app = app;
    this.history = [];
  }
  
  async roll(expression) {
    try {
      // Parse the dice expression
      const result = this.parseDiceExpression(expression);
      
      // Add to history
      this.history.unshift({
        expression: expression,
        result: result,
        timestamp: new Date()
      });
      
      // Keep history limited to last 50 rolls
      if (this.history.length > 50) {
        this.history.pop();
      }
      
      // Play sound
      if (this.app.audio) {
        this.app.audio.play('diceRoll');
      }
      
      return result;
    } catch (error) {
      console.error("Error rolling dice:", error);
      return "Error";
    }
  }
  
  parseDiceExpression(expression) {
    // Trim whitespace
    expression = expression.trim().toLowerCase();
    
    // Basic validation
    if (!expression) {
      throw new Error("Empty dice expression");
    }
    
    // Handle simple numbers
    if (/^\d+$/.test(expression)) {
      return parseInt(expression);
    }
    
    // Check for standard dice notation first (e.g., 2d6, 1d20)
    const standardDiceRegex = /^(\d+)d(\d+)$/;
    const standardMatch = expression.match(standardDiceRegex);
    
    if (standardMatch) {
      const numDice = parseInt(standardMatch[1]);
      const dieSize = parseInt(standardMatch[2]);
      
      if (numDice <= 0 || dieSize <= 0) {
        throw new Error("Invalid dice parameters");
      }
      
      // Roll the dice
      let sum = 0;
      for (let i = 0; i < numDice; i++) {
        sum += Math.floor(Math.random() * dieSize) + 1;
      }
      
      return sum;
    }
    
    // Check for advantage/disadvantage notation (e.g., 2d20kh1, 2d20kl1)
    const advantageRegex = /^(\d+)d(\d+)(kh|kl)(\d+)$/;
    const advantageMatch = expression.match(advantageRegex);
    
    if (advantageMatch) {
      const numDice = parseInt(advantageMatch[1]);
      const dieSize = parseInt(advantageMatch[2]);
      const keepType = advantageMatch[3]; // 'kh' or 'kl'
      const keepCount = parseInt(advantageMatch[4]);
      
      if (numDice <= 0 || dieSize <= 0 || keepCount <= 0 || keepCount > numDice) {
        throw new Error("Invalid dice parameters");
      }
      
      // Roll the dice
      let rolls = [];
      for (let i = 0; i < numDice; i++) {
        rolls.push(Math.floor(Math.random() * dieSize) + 1);
      }
      
      // Sort based on keep type
      rolls.sort((a, b) => keepType === 'kh' ? b - a : a - b);
      
      // Keep only the specified number of dice
      rolls = rolls.slice(0, keepCount);
      
      // Sum the kept dice
      return rolls.reduce((sum, roll) => sum + roll, 0);
    }
    
    // Check for dice with modifiers (e.g., 2d6+3, 1d8-2)
    const modifierRegex = /^(\d+)d(\d+)([+-]\d+)$/;
    const modifierMatch = expression.match(modifierRegex);
    
    if (modifierMatch) {
      const numDice = parseInt(modifierMatch[1]);
      const dieSize = parseInt(modifierMatch[2]);
      const modifier = parseInt(modifierMatch[3]); // Includes the sign
      
      if (numDice <= 0 || dieSize <= 0) {
        throw new Error("Invalid dice parameters");
      }
      
      // Roll the dice
      let sum = 0;
      for (let i = 0; i < numDice; i++) {
        sum += Math.floor(Math.random() * dieSize) + 1;
      }
      
      // Apply modifier
      sum += modifier;
      
      return sum;
    }
    
    // If we get here, the expression didn't match any of our patterns
    throw new Error("Invalid dice expression: " + expression);
  }
  
  getHistory() {
    return this.history;
  }
  
  clearHistory() {
    this.history = [];
  }
  
  rollMultiple(expressions) {
    return Promise.all(expressions.map(expr => this.roll(expr)));
  }
  
  rollStats() {
    // Roll 4d6 drop lowest, six times
    return this.rollMultiple(Array(6).fill('4d6kh3'));
  }
  
  rollAdvantage() {
    return this.roll('2d20kh1');
  }
  
  rollDisadvantage() {
    return this.roll('2d20kl1');
  }
}
