/**
 * Dice Manager for Jesster's Combat Tracker
 * Handles dice rolling functionality
 */
export class DiceManager {
  constructor(app) {
    this.app = app;
    this.rollHistory = [];
  }
  
  async roll(diceExpression) {
    // Parse the dice expression (e.g., "2d6+3")
    try {
      const result = this.parseDiceExpression(diceExpression);
      
      // Add to roll history
      this.rollHistory.push({
        expression: diceExpression,
        result: result,
        timestamp: new Date()
      });
      
      // Play dice sound
      this.app.audio.play('diceRoll');
      
      return result;
    } catch (error) {
      console.error("Error rolling dice:", error);
      this.app.showAlert(`Invalid dice expression: ${diceExpression}`);
      return 0;
    }
  }
  
  parseDiceExpression(expression) {
    // Remove all spaces
    expression = expression.replace(/\s+/g, '');
    
    // Basic validation
    if (!expression.match(/^(\d*d\d+|\d+)([+\-*/](\d*d\d+|\d+))*$/i)) {
      throw new Error(`Invalid dice expression: ${expression}`);
    }
    
    // Split by operators while keeping the operators
    const tokens = expression.split(/([+\-*/])/);
    
    let total = 0;
    let currentOperator = '+';
    
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i].trim();
      
      if (token === '+' || token === '-' || token === '*' || token === '/') {
        currentOperator = token;
        continue;
      }
      
      let value;
      
      if (token.toLowerCase().includes('d')) {
        // It's a dice roll
        value = this.rollDice(token);
      } else {
        // It's a number
        value = parseInt(token);
      }
      
      // Apply the operator
      switch (currentOperator) {
        case '+':
          total += value;
          break;
        case '-':
          total -= value;
          break;
        case '*':
          total *= value;
          break;
        case '/':
          total = Math.floor(total / value);
          break;
      }
    }
    
    return total;
  }
  
  rollDice(diceNotation) {
    // Parse dice notation (e.g., "2d6")
    const [count, sides] = diceNotation.toLowerCase().split('d');
    const numDice = count === '' ? 1 : parseInt(count);
    const numSides = parseInt(sides);
    
    if (isNaN(numDice) || isNaN(numSides) || numDice < 1 || numSides < 1) {
      throw new Error(`Invalid dice notation: ${diceNotation}`);
    }
    
    // Roll the dice
    let total = 0;
    for (let i = 0; i < numDice; i++) {
      total += Math.floor(Math.random() * numSides) + 1;
    }
    
    return total;
  }
}
