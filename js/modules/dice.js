/**
 * Dice Roller for Jesster's Combat Tracker
 * Handles dice rolling and results display
 */
class DiceRoller {
  constructor(app) {
    this.app = app;
    this.rollHistory = [];
    console.log("Dice.js loaded successfully");
  }
  
  /**
   * Roll dice based on a dice expression
   * @param {string} expression - The dice expression (e.g., "2d6+3")
   * @returns {Promise<number>} - The result of the roll
   */
  async roll(expression) {
    // Parse the expression
    const parsedExpression = this.parseExpression(expression);
    if (!parsedExpression) {
      throw new Error(`Invalid dice expression: ${expression}`);
    }
    
    // Roll the dice
    const result = this.calculateRoll(parsedExpression);
    
    // Add to history
    this.rollHistory.push({
      expression,
      result,
      timestamp: new Date()
    });
    
    // Play sound effect
    this.app.audio.play('diceRoll');
    
    return result.total;
  }
  
  /**
   * Roll dice and display the result
   * @param {string} expression - The dice expression (e.g., "2d6+3")
   */
  async rollAndDisplay(expression) {
    try {
      // Parse the expression
      const parsedExpression = this.parseExpression(expression);
      if (!parsedExpression) {
        this.app.showAlert(`Invalid dice expression: ${expression}`, 'Error');
        return;
      }
      
      // Roll the dice
      const result = this.calculateRoll(parsedExpression);
      
      // Add to history
      this.rollHistory.push({
        expression,
        result,
        timestamp: new Date()
      });
      
      // Play sound effect
      this.app.audio.play('diceRoll');
      
      // Display the result
      this.displayRollResult(expression, result);
      
      // Log the roll
      this.app.logEvent(`Dice Roll: ${expression} = ${result.total}`);
    } catch (error) {
      console.error("Error rolling dice:", error);
      this.app.showAlert(`Error rolling dice: ${error.message}`, 'Error');
    }
  }
  
  /**
   * Parse a dice expression
   * @param {string} expression - The dice expression (e.g., "2d6+3")
   * @returns {Object|null} - The parsed expression or null if invalid
   */
  parseExpression(expression) {
    // Trim whitespace
    expression = expression.trim();
    
    // Check for empty expression
    if (!expression) return null;
    
    // Handle simple numbers
    if (/^\d+$/.test(expression)) {
      return {
        type: 'number',
        value: parseInt(expression)
      };
    }
    
    // Handle dice expressions with advantage/disadvantage notation
    const advantageMatch = /^(\d+)d(\d+)(kh|kl)(\d+)([+-]\d+)?$/.exec(expression);
    if (advantageMatch) {
      const [, count, sides, keepType, keepCount, modifier] = advantageMatch;
      return {
        type: 'dice',
        count: parseInt(count),
        sides: parseInt(sides),
        keepType: keepType === 'kh' ? 'highest' : 'lowest',
        keepCount: parseInt(keepCount),
        modifier: modifier ? parseInt(modifier) : 0
      };
    }
    
    // Handle standard dice expressions
    const diceMatch = /^(\d+)d(\d+)([+-]\d+)?$/.exec(expression);
    if (diceMatch) {
      const [, count, sides, modifier] = diceMatch;
      return {
        type: 'dice',
        count: parseInt(count),
        sides: parseInt(sides),
        modifier: modifier ? parseInt(modifier) : 0
      };
    }
    
    return null;
  }
  
  /**
   * Calculate the result of a roll
   * @param {Object} parsedExpression - The parsed dice expression
   * @returns {Object} - The roll result
   */
  calculateRoll(parsedExpression) {
    if (parsedExpression.type === 'number') {
      return {
        rolls: [],
        total: parsedExpression.value
      };
    }
    
    // Roll the dice
    const rolls = [];
    for (let i = 0; i < parsedExpression.count; i++) {
      rolls.push(Math.floor(Math.random() * parsedExpression.sides) + 1);
    }
    
    // Sort rolls for advantage/disadvantage
    let keptRolls = [...rolls];
    if (parsedExpression.keepType) {
      // Sort rolls
      const sortedRolls = [...rolls].sort((a, b) => parsedExpression.keepType === 'highest' ? b - a : a - b);
      // Keep only the specified number of rolls
      keptRolls = sortedRolls.slice(0, parsedExpression.keepCount);
    }
    
    // Calculate total
    const diceTotal = keptRolls.reduce((sum, roll) => sum + roll, 0);
    const total = diceTotal + parsedExpression.modifier;
    
    return {
      rolls,
      keptRolls,
      diceTotal,
      modifier: parsedExpression.modifier,
      total
    };
  }
  
  /**
   * Display the result of a roll
   * @param {string} expression - The original dice expression
   * @param {Object} result - The roll result
   */
  displayRollResult(expression, result) {
    const resultsElement = document.getElementById('dice-results');
    if (!resultsElement) return;
    
    // Create the result element
    const resultElement = document.createElement('div');
    resultElement.className = 'dice-result bg-gray-700 p-2 rounded mt-2 flex justify-between items-center';
    
    // Format the rolls display
    let rollsDisplay = result.rolls.map(roll => `<span class="dice-roll">${roll}</span>`).join(', ');
    
    // If using advantage/disadvantage, highlight kept rolls
    if (result.keptRolls && result.keptRolls.length !== result.rolls.length) {
      rollsDisplay = result.rolls.map(roll => {
        const isKept = result.keptRolls.includes(roll);
        return `<span class="dice-roll ${isKept ? 'text-green-400' : 'text-gray-500'}">${roll}</span>`;
      }).join(', ');
    }
    
    // Format the modifier display
    const modifierDisplay = result.modifier !== 0 ? 
      `<span class="text-blue-400">${result.modifier >= 0 ? '+' : ''}${result.modifier}</span>` : 
      '';
    
    resultElement.innerHTML = `
      <div>
        <span class="font-bold">${expression}:</span>
        <span class="ml-2">[${rollsDisplay}]${modifierDisplay} = <span class="text-yellow-400 font-bold">${result.total}</span></span>
      </div>
      <button class="clear-roll-btn text-gray-400 hover:text-red-400">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    `;
    
    // Add event listener to clear button
    resultElement.querySelector('.clear-roll-btn').addEventListener('click', () => {
      resultElement.remove();
    });
    
    // Add the result to the results element
    resultsElement.prepend(resultElement);
    
    // Limit the number of displayed results
    const maxResults = 5;
    const results = resultsElement.querySelectorAll('.dice-result');
    if (results.length > maxResults) {
      for (let i = maxResults; i < results.length; i++) {
        results[i].remove();
      }
    }
  }
  
  /**
   * Open the dice history modal
   */
  openDiceHistoryModal() {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 flex items-center justify-center z-50 p-4';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    
    modal.innerHTML = `
      <div class="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-lg w-full mx-auto">
        <h3 class="text-xl font-bold text-indigo-400 mb-4">Dice Roll History</h3>
        
        <div class="max-h-96 overflow-y-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-gray-700">
                <th class="px-4 py-2">Expression</th>
                <th class="px-4 py-2">Result</th>
                <th class="px-4 py-2">Time</th>
              </tr>
            </thead>
            <tbody id="dice-history-table">
              ${this.rollHistory.length === 0 ? 
                '<tr><td colspan="3" class="px-4 py-2 text-center text-gray-500">No dice rolls yet.</td></tr>' : 
                this.rollHistory.slice().reverse().map(roll => `
                  <tr class="border-t border-gray-700">
                    <td class="px-4 py-2">${roll.expression}</td>
                    <td class="px-4 py-2 font-bold text-yellow-400">${roll.result.total}</td>
                    <td class="px-4 py-2 text-gray-400">${this.formatTime(roll.timestamp)}</td>
                  </tr>
                `).join('')
              }
            </tbody>
          </table>
        </div>
        
        <div class="flex justify-end mt-4 space-x-2">
          <button id="clear-dice-history-btn" class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
            Clear History
          </button>
          <button id="dice-history-close-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            Close
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('dice-history-close-btn').addEventListener('click', () => {
      modal.remove();
    });
    
    document.getElementById('clear-dice-history-btn').addEventListener('click', () => {
      this.rollHistory = [];
      document.getElementById('dice-history-table').innerHTML = '<tr><td colspan="3" class="px-4 py-2 text-center text-gray-500">No dice rolls yet.</td></tr>';
      this.app.logEvent("Dice roll history cleared.");
    });
  }
  
  /**
   * Format a timestamp
   * @param {Date} timestamp - The timestamp to format
   * @returns {string} - The formatted timestamp
   */
  formatTime(timestamp) {
    const hours = timestamp.getHours().toString().padStart(2, '0');
    const minutes = timestamp.getMinutes().toString().padStart(2, '0');
    const seconds = timestamp.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }
  
  /**
   * Add dice history button to the dice roller
   */
  addDiceHistoryButton() {
    // Add a button to the dice roller section
    const diceRoller = document.querySelector('.dice-roller');
    if (!diceRoller) return;
    
    const historyBtn = document.createElement('button');
    historyBtn.id = 'dice-history-btn';
    historyBtn.className = 'bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1 px-3 rounded text-sm';
    historyBtn.textContent = 'History';
    historyBtn.addEventListener('click', () => this.openDiceHistoryModal());
    
    // Find the right place to insert the button
    const diceInput = document.getElementById('dice-input');
    if (diceInput) {
      diceInput.parentNode.insertBefore(historyBtn, diceInput);
    }
  }
}
