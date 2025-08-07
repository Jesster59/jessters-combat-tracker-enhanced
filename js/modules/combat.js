/**
 * Combat Manager for Jesster's Combat Tracker
 * Handles combat flow, creatures, and turn management
 */
class CombatManager {
  constructor(app) {
    this.app = app;
    this.creatures = [];
    console.log("Combat.js loaded successfully");
  }
  
  /**
   * Add a creature to combat
   * @param {Object} creature - The creature to add
   */
  addCreature(creature) {
    this.creatures.push(creature);
    this.app.logEvent(`${creature.name} (${creature.type}) added to combat.`);
    this.app.ui.renderCreatures();
  }
  
  /**
   * Remove a creature from combat
   * @param {string} creatureId - The ID of the creature to remove
   */
  removeCreature(creatureId) {
    const creature = this.getCreature(creatureId);
    if (creature) {
      this.creatures = this.creatures.filter(c => c.id !== creatureId);
      this.app.logEvent(`${creature.name} removed from combat.`);
      this.app.ui.renderCreatures();
      this.app.ui.renderInitiativeOrder();
    }
  }
  
  /**
   * Get a creature by ID
   * @param {string} creatureId - The ID of the creature
   * @returns {Object|null} - The creature or null if not found
   */
  getCreature(creatureId) {
    return this.creatures.find(c => c.id === creatureId) || null;
  }
  
  /**
   * Start combat
   */
  startCombat() {
    if (this.creatures.length === 0) {
      this.app.showAlert('Add some creatures before starting combat!');
      return;
    }
    
    this.app.state.combatStarted = true;
    this.app.state.combatStartTime = new Date();
    this.app.state.roundNumber = 1;
    
    this.app.logEvent('Combat started!');
    this.app.ui.updateCombatStatus();
    this.app.audio.play('combatStart');
    
    // Auto-roll initiative if not already rolled
    const hasInitiative = this.creatures.some(c => c.initiative !== null);
    if (!hasInitiative) {
      this.rollInitiativeForAll();
    } else {
      this.startFirstTurn();
    }
  }
  
  /**
   * End combat
   */
  endCombat() {
    this.app.showConfirm('Are you sure you want to end combat?', () => {
      this.app.state.combatStarted = false;
      this.app.state.currentTurn = null;
      this.app.state.roundNumber = 1;
      this.app.state.combatStartTime = null;
      
      // Reset all creatures' initiative
      this.creatures.forEach(creature => {
        creature.initiative = null;
        creature.conditions = [];
      });
      
      this.app.logEvent('Combat ended.');
      this.app.ui.updateCombatStatus();
      this.app.ui.renderCreatures();
      this.app.ui.renderInitiativeOrder();
    });
  }
  
  /**
   * Roll initiative for all creatures
   */
  rollInitiativeForAll() {
    this.creatures.forEach(creature => {
      const roll = this.app.dice.roll('1d20');
      creature.initiative = roll.total + creature.initiativeModifier;
      this.app.logEvent(`${creature.name} rolls initiative: ${roll.total} + ${creature.initiativeModifier} = ${creature.initiative}`);
    });
    
    this.app.ui.renderInitiativeOrder();
    this.app.ui.renderCreatures();
    
    if (this.app.state.combatStarted) {
      this.startFirstTurn();
    }
  }
  
  /**
 * Start the first turn
 */
startFirstTurn() {
  const sortedCreatures = this.creatures
    .filter(c => c.initiative !== null)
    .sort((a, b) => b.initiative - a.initiative);
  
  if (sortedCreatures.length > 0) {
    this.app.state.currentTurn = sortedCreatures[0].id;
    this.app.logEvent(`${sortedCreatures[0].name}'s turn begins!`);
    this.app.ui.renderCreatures();
    this.app.ui.renderInitiativeOrder();
    this.app.audio.play('turnStart'); // REPLACE THIS LINE (was 'turnStart')
  }
}
  
  /**
   * Move to the next turn
   */
  nextTurn() {
    if (!this.app.state.combatStarted) return;
    
    const sortedCreatures = this.creatures
      .filter(c => c.initiative !== null)
      .sort((a, b) => b.initiative - a.initiative);
    
    if (sortedCreatures.length === 0) return;
    
    const currentIndex = sortedCreatures.findIndex(c => c.id === this.app.state.currentTurn);
    let nextIndex = currentIndex + 1;
    
    // If we've reached the end, start a new round
    if (nextIndex >= sortedCreatures.length) {
      nextIndex = 0;
      this.app.state.roundNumber++;
      this.app.logEvent(`--- Round ${this.app.state.roundNumber} begins ---`);
      this.app.audio.play('roundStart');
    }
    
    this.app.state.currentTurn = sortedCreatures[nextIndex].id;
    this.app.logEvent(`${sortedCreatures[nextIndex].name}'s turn begins!`);
    
    this.app.ui.updateCombatStatus();
    this.app.ui.renderCreatures();
    this.app.ui.renderInitiativeOrder();
    this.app.audio.play('turnEnd');
  }
  
  /**
   * Get creatures sorted by initiative
   * @returns {Array} - Sorted creatures array
   */
  getInitiativeOrder() {
    return this.creatures
      .filter(c => c.initiative !== null)
      .sort((a, b) => b.initiative - a.initiative);
  }
  
  /**
   * Get the current turn creature
   * @returns {Object|null} - The creature whose turn it is
   */
  getCurrentTurnCreature() {
    return this.getCreature(this.app.state.currentTurn);
  }
  
  /**
   * Check if a creature is dead
   * @param {string} creatureId - The creature ID
   * @returns {boolean} - True if the creature is dead
   */
  isCreatureDead(creatureId) {
    const creature = this.getCreature(creatureId);
    return creature ? creature.currentHP <= 0 : false;
  }
  
  /**
   * Get all living creatures
   * @returns {Array} - Array of living creatures
   */
  getLivingCreatures() {
    return this.creatures.filter(c => c.currentHP > 0);
  }
  
  /**
   * Get all dead creatures
   * @returns {Array} - Array of dead creatures
   */
  getDeadCreatures() {
    return this.creatures.filter(c => c.currentHP <= 0);
  }
  
  /**
   * Add a condition to a creature
   * @param {string} creatureId - The creature ID
   * @param {string} condition - The condition to add
   */
  addCondition(creatureId, condition) {
    const creature = this.getCreature(creatureId);
    if (creature && !creature.conditions.includes(condition)) {
      creature.conditions.push(condition);
      this.app.logEvent(`${creature.name} gains condition: ${condition}`);
      this.app.ui.renderCreatures();
    }
  }
  
  /**
   * Remove a condition from a creature
   * @param {string} creatureId - The creature ID
   * @param {string} condition - The condition to remove
   */
  removeCondition(creatureId, condition) {
    const creature = this.getCreature(creatureId);
    if (creature) {
      creature.conditions = creature.conditions.filter(c => c !== condition);
      this.app.logEvent(`${creature.name} loses condition: ${condition}`);
      this.app.ui.renderCreatures();
    }
  }
  
  /**
   * Clear all conditions from a creature
   * @param {string} creatureId - The creature ID
   */
  clearConditions(creatureId) {
    const creature = this.getCreature(creatureId);
    if (creature) {
      creature.conditions = [];
      this.app.logEvent(`${creature.name} has all conditions cleared`);
      this.app.ui.renderCreatures();
    }
  }
  
  /**
   * Reset combat (clear all creatures and state)
   */
  resetCombat() {
    this.app.showConfirm('Are you sure you want to reset combat? This will remove all creatures.', () => {
      this.creatures = [];
      this.app.state.combatStarted = false;
      this.app.state.currentTurn = null;
      this.app.state.roundNumber = 1;
      this.app.state.combatStartTime = null;
      
      this.app.logEvent('Combat reset - all creatures removed.');
      this.app.ui.updateCombatStatus();
      this.app.ui.renderCreatures();
      this.app.ui.renderInitiativeOrder();
    });
  }
}
