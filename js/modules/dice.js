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
      this.app.audio.play('diceRoll');
      
      return result;
    } catch (error) {
      console.error("Error rolling dice:", error);
      return "Error";
    }
  }
  
  parseDiceExpression(expression) {
    // Trim whitespace
    expression = expression.trim();
    
    // Basic validation
    if (!expression) {
      throw new Error("Empty dice expression");
    }
    
    // Handle simple numbers
    if (/^\d+$/.test(expression)) {
      return parseInt(expression);
    }
    
    // Advanced dice notation regex
    // Supports: XdY, XdYkh/klZ, XdY+Z, XdY-Z
    const diceRegex = /^(\d+)d(\d+)(kh|kl)?(\d+)?([+-]\d+)?$/i;
    const match = expression.match(diceRegex);
    
    if (!match) {
      throw new Error("Invalid dice expression: " + expression);
    }
    
    const numDice = parseInt(match[1]);
    const dieSize = parseInt(match[2]);
    const keepType = match[3] ? match[3].toLowerCase() : null;
    const keepCount = match[4] ? parseInt(match[4]) : null;
    const modifier = match[5] ? parseInt(match[5]) : 0;
    
    // Validate dice parameters
    if (numDice <= 0 || dieSize <= 0) {
      throw new Error("Invalid dice parameters");
    }
    
    if (keepType && keepCount <= 0) {
      throw new Error("Invalid keep count");
    }
    
    // Roll the dice
    let rolls = [];
    for (let i = 0; i < numDice; i++) {
      rolls.push(Math.floor(Math.random() * dieSize) + 1);
    }
    
    // Handle keep highest/lowest
    if (keepType && keepCount) {
      rolls.sort((a, b) => keepType === 'kh' ? b - a : a - b);
      rolls = rolls.slice(0, keepCount);
    }
    
    // Sum the rolls
    const sum = rolls.reduce((a, b) => a + b, 0) + modifier;
    
    return sum;
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
