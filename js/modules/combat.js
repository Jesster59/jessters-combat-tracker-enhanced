/**
 * Combat Manager for Jesster's Combat Tracker
 * Handles combat flow, initiative, turns, etc.
 */
class CombatManager {
  constructor(app) {
    this.app = app;
    this.playerViewWindow = null;
  }
  
  async rollAllInitiative() {
    const heroCards = Array.from(document.querySelectorAll('#heroes-list .combatant-card'));
    const monsterCards = Array.from(document.querySelectorAll('#monsters-list .combatant-card'));
    
    if (heroCards.length === 0 && monsterCards.length === 0) {
      this.app.showAlert("Please add some combatants before rolling initiative!");
      return;
    }
    
    this.app.logEvent("Rolling initiative for all combatants...");
    
    // Roll for heroes
    for (const card of heroCards) {
      await this.rollInitiativeForCard(card);
    }
    
    // Roll for monsters
    for (const card of monsterCards) {
      await this.rollInitiativeForCard(card);
    }
    
    this.app.showAlert("Initiative rolled for all combatants!", "Initiative");
    
    // Enable the Start Combat button
    const startCombatBtn = document.getElementById('start-combat-btn');
    if (startCombatBtn) startCombatBtn.disabled = false;
  }
  
  async rollInitiativeForCard(card) {
    const initiativeInput = card.querySelector('.initiative-input');
    if (!initiativeInput) return;
    
    // Roll 1d20
    const roll = Math.floor(Math.random() * 20) + 1;
    
    // Add a small modifier based on card type (just for demonstration)
    const modifier = card.dataset.type === 'hero' ? 2 : 1;
    const totalInit = roll + modifier;
    
    // Set the initiative value
    initiativeInput.value = totalInit;
    
    // Log the roll
    const name = card.querySelector('.combatant-name')?.textContent || 'Unknown';
    this.app.logEvent(`${name} rolled initiative: ${totalInit} (d20: ${roll}, mod: ${modifier}).`);
    
    return totalInit;
  }
  
  startCombat() {
    if (this.app.state.combatStarted) return;
    
    const heroCards = Array.from(document.querySelectorAll('#heroes-list .combatant-card'));
    const monsterCards = Array.from(document.querySelectorAll('#monsters-list .combatant-card'));
    
    if (heroCards.length === 0 && monsterCards.length === 0) {
      this.app.showAlert("Please add at least one combatant before starting combat.");
      return;
    }
    
    // Sort all combatants by initiative (highest first)
    const allCombatants = [...heroCards, ...monsterCards];
    
    const sortedCombatants = allCombatants.sort((a, b) => {
      const aInit = parseInt(a.querySelector('.initiative-input').value) || 0;
      const bInit = parseInt(b.querySelector('.initiative-input').value) || 0;
      return bInit - aInit;
    });
    
    // Set the current turn to the first combatant
    if (sortedCombatants.length > 0) {
      this.app.state.currentTurn = sortedCombatants[0].id;
      
      // Log the initiative order
      const orderNames = sortedCombatants.map(card => {
        const name = card.querySelector('.combatant-name').textContent;
        const init = card.querySelector('.initiative-input').value;
        return `${name} (${init})`;
      }).join(', ');
      
      this.app.logEvent(`Initiative order: ${orderNames}`);
    }
    
    // Start combat
    this.app.state.combatStarted = true;
    this.app.state.roundNumber = 1;
    
    // Update UI
    document.getElementById('round-counter').textContent = '1';
    document.getElementById('start-combat-btn').disabled = true;
    document.getElementById('roll-all-btn').disabled = true;
    document.getElementById('end-turn-btn').disabled = false;
    
    this.updateTurnIndicator();
    this.app.logEvent("Combat Started!");
  }
  
  endTurn() {
    if (!this.app.state.combatStarted) return;
    
    // Get all combatants in initiative order
    const allCombatants = [
      ...Array.from(document.querySelectorAll('#heroes-list .combatant-card')),
      ...Array.from(document.querySelectorAll('#monsters-list .combatant-card'))
    ];
    
    // Sort by initiative
    const sortedCombatants = allCombatants.sort((a, b) => {
      const aInit = parseInt(a.querySelector('.initiative-input').value) || 0;
      const bInit = parseInt(b.querySelector('.initiative-input').value) || 0;
      return bInit - aInit;
    });
    
    // Find current combatant index
    const currentIndex = sortedCombatants.findIndex(card => card.id === this.app.state.currentTurn);
    
    if (currentIndex === -1) {
      // Current combatant not found, start from beginning
      if (sortedCombatants.length > 0) {
        this.app.state.currentTurn = sortedCombatants[0].id;
      }
      return;
    }
    
    // Get current combatant name for logging
    const currentName = sortedCombatants[currentIndex].querySelector('.combatant-name').textContent;
    this.app.logEvent(`${currentName}'s turn ends.`);
    
    // Move to next combatant
    const nextIndex = (currentIndex + 1) % sortedCombatants.length;
    
    // If we're looping back to the first combatant, it's a new round
    if (nextIndex === 0) {
      this.app.state.roundNumber++;
      document.getElementById('round-counter').textContent = this.app.state.roundNumber;
      this.app.logEvent(`Round ${this.app.state.roundNumber} begins.`);
    }
    
    // Set new current turn
    this.app.state.currentTurn = sortedCombatants[nextIndex].id;
    
    // Log new turn
    const nextName = sortedCombatants[nextIndex].querySelector('.combatant-name').textContent;
    this.app.logEvent(`${nextName}'s turn begins.`);
    
    // Update UI
    this.updateTurnIndicator();
  }
  
  resetCombat() {
    // Reset combat state
    this.app.state.combatStarted = false;
    this.app.state.roundNumber = 1;
    this.app.state.currentTurn = null;
    
    // Update UI
    document.getElementById('round-counter').textContent = '1';
    document.getElementById('turn-indicator').textContent = 'Waiting to Start';
    
    // Clear active turn highlights
    document.querySelectorAll('.active-turn').forEach(el => {
      el.classList.remove('active-turn');
    });
    
    // Reset initiative values
    document.querySelectorAll('.initiative-input').forEach(input => {
      input.value = '';
    });
    
    // Reset buttons
    document.getElementById('start-combat-btn').disabled = true;
    document.getElementById('roll-all-btn').disabled = false;
    document.getElementById('end-turn-btn').disabled = true;
    
    this.app.logEvent("Combat Reset.");
  }
  
  endCombat() {
    this.app.showConfirm("This will clear the board and end combat. Are you sure?", () => {
      // Reset combat state
      this.resetCombat();
      
      // Clear combatants
      document.getElementById('heroes-list').innerHTML = '';
      document.getElementById('monsters-list').innerHTML = '';
      
      this.app.logEvent("Combat Ended and board cleared.");
    });
  }
  
  updateTurnIndicator() {
    // Clear all active turn highlights
    document.querySelectorAll('.active-turn').forEach(el => {
      el.classList.remove('active-turn');
    });
    
    const turnIndicator = document.getElementById('turn-indicator');
    if (!turnIndicator) return;
    
    if (!this.app.state.combatStarted) {
      turnIndicator.textContent = 'Waiting to Start';
      return;
    }
    
    // Highlight individual combatant
    const currentCard = document.getElementById(this.app.state.currentTurn);
    if (currentCard) {
      currentCard.classList.add('active-turn');
      const name = currentCard.querySelector('.combatant-name').textContent;
      turnIndicator.textContent = `${name}'s Turn`;
    } else {
      turnIndicator.textContent = 'Error: Combatant not found';
    }
  }
}
