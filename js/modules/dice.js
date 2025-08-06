/**
 * Dice Manager for Jesster's Combat Tracker
 * Handles dice rolling functionality
 */
class DiceManager {
  constructor(app) {
    this.app = app;
  }
  
  async roll(diceExpression) {
    // Simple dice roller
    try {
      const result = this.parseDiceExpression(diceExpression);
      return result;
    } catch (error) {
      console.error("Error rolling dice:", error);
      return 0;
    }
  }
  
  parseDiceExpression(expression) {
    // Very simple parser for now
    if (expression.includes('d')) {
      const parts = expression.split('d');
      const count = parts[0] ? parseInt(parts[0]) : 1;
      const sides = parseInt(parts[1]);
      
      let total = 0;
      for (let i = 0; i < count; i++) {
        total += Math.floor(Math.random() * sides) + 1;
      }
      return total;
    } else {
      return parseInt(expression) || 0;
    }
  }
}
