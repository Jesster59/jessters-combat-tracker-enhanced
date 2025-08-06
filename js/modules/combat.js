/**
 * Combat Manager for Jesster's Combat Tracker
 * Handles combat flow, initiative, turns, etc.
 */
export class CombatManager {
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
    
    // Get the combatant's initiative modifier
    let modifier = 0;
    const hiddenData = card.querySelector('.hidden-data');
    
    if (card.dataset.type === 'hero') {
      // For heroes, use DEX modifier
      const dex = parseInt(hiddenData?.dataset.dex || 10);
      modifier = Math.floor((dex - 10) / 2);
    } else {
      // For monsters, use initiative modifier or DEX
      const initMod = hiddenData?.dataset.initMod;
      if (initMod && !isNaN(parseInt(initMod))) {
        modifier = parseInt(initMod);
      } else {
        const dex = parseInt(hiddenData?.dataset.dex || 10);
        modifier = Math.floor((dex - 10) / 2);
      }
    }
    
    // Roll 1d20 + modifier
    const roll = await this.app.dice.roll('1d20');
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
    
    // Determine initiative order
    const initiativeType = document.getElementById('initiative-type')?.value || 'dynamic';
    
    if (initiativeType === 'normal') {
      this.determineNormalInitiative();
    } else if (initiativeType === 'team') {
      this.determineTeamInitiative();
    } else {
      // Default to dynamic initiative
      this.determineDynamicInitiative();
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
  
  determineNormalInitiative() {
    // Sort all combatants by initiative (highest first)
    const allCombatants = [
      ...Array.from(document.querySelectorAll('#heroes-list .combatant-card')),
      ...Array.from(document.querySelectorAll('#monsters-list .combatant-card'))
    ];
    
    // Sort by initiative, then DEX, then PP
    const sortedCombatants = allCombatants.sort((a, b) => {
      const aInit = parseInt(a.querySelector('.initiative-input').value) || 0;
      const bInit = parseInt(b.querySelector('.initiative-input').value) || 0;
      
      // Primary sort by initiative
      if (aInit !== bInit) return bInit - aInit;
      
      // Tiebreaker: DEX score
      const aHiddenData = a.querySelector('.hidden-data');
      const bHiddenData = b.querySelector('.hidden-data');
      const aDex = parseInt(aHiddenData?.dataset.dex || 10);
      const bDex = parseInt(bHiddenData?.dataset.dex || 10);
      
      if (aDex !== bDex) return bDex - aDex;
      
      // Final tiebreaker: Passive Perception
      const aPP = parseInt(a.querySelector('.pp-input')?.value || 10);
      const bPP = parseInt(b.querySelector('.pp-input')?.value || 10);
      
      return bPP - aPP;
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
  }
  
  determineDynamicInitiative() {
    // Compare highest initiative between heroes and monsters
    const heroCards = Array.from(document.querySelectorAll('#heroes-list .combatant-card'));
    const monsterCards = Array.from(document.querySelectorAll('#monsters-list .combatant-card'));
    
    const highestHeroInit = Math.max(0, ...heroCards.map(card => 
      parseInt(card.querySelector('.initiative-input').value) || 0
    ));
    
    const highestMonsterInit = Math.max(0, ...monsterCards.map(card => 
      parseInt(card.querySelector('.initiative-input').value) || 0
    ));
    
    // Set current turn to the side with highest initiative
    this.app.state.currentTurn = highestHeroInit >= highestMonsterInit ? 'heroes' : 'monsters';
    
    this.app.logEvent(`Dynamic Initiative: Heroes (${highestHeroInit}) vs Monsters (${highestMonsterInit}). ${this.app.state.currentTurn} go first.`);
  }
  
  determineTeamInitiative() {
    // Similar to dynamic, but roll a single initiative for each team
    // This would be implemented in a real application
    this.app.state.currentTurn = 'heroes'; // Default for now
    this.app.logEvent("Team Initiative: Heroes go first.");
  }
  
  endTurn() {
    if (!this.app.state.combatStarted) return;
    
    const initiativeType = document.getElementById('initiative-type')?.value || 'dynamic';
    
    if (initiativeType === 'normal') {
      this.endNormalInitiativeTurn();
    } else if (initiative
  endTurn() {
    if (!this.app.state.combatStarted) return;
    
    const initiativeType = document.getElementById('initiative-type')?.value || 'dynamic';
    
    if (initiativeType === 'normal') {
      this.endNormalInitiativeTurn();
    } else if (initiativeType === 'team') {
      this.endTeamInitiativeTurn();
    } else {
      // Default to dynamic initiative
      this.endDynamicInitiativeTurn();
    }
    
    // Update UI
    this.updateTurnIndicator();
    this.app.audio.play('turnEnd');
    
    // Update player view
    this.updatePlayerView();
  }
  
  endNormalInitiativeTurn() {
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
    
    // Process end of turn effects
    this.processEndOfTurnEffects(sortedCombatants[currentIndex]);
    
    // Move to next combatant
    const nextIndex = (currentIndex + 1) % sortedCombatants.length;
    
    // If we're looping back to the first combatant, it's a new round
    if (nextIndex === 0) {
      this.app.state.roundNumber++;
      document.getElementById('round-counter').textContent = this.app.state.roundNumber;
      this.app.logEvent(`Round ${this.app.state.roundNumber} begins.`);
      this.app.audio.play('roundStart');
      
      // Reset action economy for all combatants
      this.resetActionEconomy();
    }
    
    // Set new current turn
    this.app.state.currentTurn = sortedCombatants[nextIndex].id;
    
    // Log new turn
    const nextName = sortedCombatants[nextIndex].querySelector('.combatant-name').textContent;
    this.app.logEvent(`${nextName}'s turn begins.`);
  }
  
  endDynamicInitiativeTurn() {
    // In dynamic initiative, teams alternate turns
    const currentTurn = this.app.state.currentTurn;
    
    // Log end of turn
    this.app.logEvent(`${currentTurn === 'heroes' ? 'Heroes' : 'Monsters'} turn ends.`);
    
    // Process end of turn effects for the current team
    const selector = currentTurn === 'heroes' ? '#heroes-list .combatant-card' : '#monsters-list .combatant-card';
    const teamCards = Array.from(document.querySelectorAll(selector));
    teamCards.forEach(card => this.processEndOfTurnEffects(card));
    
    // Switch teams
    const nextTurn = currentTurn === 'heroes' ? 'monsters' : 'heroes';
    
    // Check if this completes a round
    if (nextTurn === 'heroes') {
      this.app.state.roundNumber++;
      document.getElementById('round-counter').textContent = this.app.state.roundNumber;
      this.app.logEvent(`Round ${this.app.state.roundNumber} begins.`);
      this.app.audio.play('roundStart');
      
      // Reset action economy for all combatants
      this.resetActionEconomy();
      
      // Re-roll initiative for dynamic initiative
      this.app.logEvent("Re-rolling initiative for new round...");
      this.rollAllInitiative().then(() => {
        // Determine which team goes first in the new round
        this.determineDynamicInitiative();
        this.updateTurnIndicator();
        this.updatePlayerView();
      });
      return;
    }
    
    // Set new current turn
    this.app.state.currentTurn = nextTurn;
    
    // Log new turn
    this.app.logEvent(`${nextTurn === 'heroes' ? 'Heroes' : 'Monsters'} turn begins.`);
  }
  
  endTeamInitiativeTurn() {
    // Similar to dynamic, but without re-rolling each round
    const currentTurn = this.app.state.currentTurn;
    
    // Log end of turn
    this.app.logEvent(`${currentTurn === 'heroes' ? 'Heroes' : 'Monsters'} turn ends.`);
    
    // Process end of turn effects for the current team
    const selector = currentTurn === 'heroes' ? '#heroes-list .combatant-card' : '#monsters-list .combatant-card';
    const teamCards = Array.from(document.querySelectorAll(selector));
    teamCards.forEach(card => this.processEndOfTurnEffects(card));
    
    // Switch teams
    const nextTurn = currentTurn === 'heroes' ? 'monsters' : 'heroes';
    
    // Check if this completes a round
    if (nextTurn === 'heroes') {
      this.app.state.roundNumber++;
      document.getElementById('round-counter').textContent = this.app.state.roundNumber;
      this.app.logEvent(`Round ${this.app.state.roundNumber} begins.`);
      this.app.audio.play('roundStart');
      
      // Reset action economy for all combatants
      this.resetActionEconomy();
    }
    
    // Set new current turn
    this.app.state.currentTurn = nextTurn;
    
    // Log new turn
    this.app.logEvent(`${nextTurn === 'heroes' ? 'Heroes' : 'Monsters'} turn begins.`);
  }
  
  processEndOfTurnEffects(card) {
    // Process conditions that end at the end of turn
    const hiddenData = card.querySelector('.hidden-data');
    if (!hiddenData) return;
    
    try {
      const conditions = JSON.parse(hiddenData.dataset.conditionsData || '[]');
      const updatedConditions = [];
      const removedConditions = [];
      
      conditions.forEach(condition => {
        if (condition.roundsLeft !== null && condition.roundsLeft > 0) {
          condition.roundsLeft--;
          if (condition.roundsLeft === 0) {
            removedConditions.push(condition.name);
          } else {
            updatedConditions.push(condition);
          }
        } else {
          updatedConditions.push(condition);
        }
      });
      
      // Update conditions on the card
      hiddenData.dataset.conditionsData = JSON.stringify(updatedConditions);
      
      // Update condition display
      this.updateConditionDisplay(card);
      
      // Log removed conditions
      if (removedConditions.length > 0) {
        const name = card.querySelector('.combatant-name').textContent;
        removedConditions.forEach(condName => {
          this.app.logEvent(`Condition '${condName}' expired on ${name}.`);
        });
      }
    } catch (error) {
      console.error("Error processing end of turn effects:", error);
    }
  }
  
  resetActionEconomy() {
    // Reset action, bonus action, and reaction checkboxes for all combatants
    document.querySelectorAll('.action-check, .bonus-action-check, .reaction-check').forEach(checkbox => {
      checkbox.checked = false;
    });
    
    this.app.logEvent("Action economy reset for new round.");
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
    
    const initiativeType = document.getElementById('initiative-type')?.value || 'dynamic';
    
    if (initiativeType === 'normal') {
      // Highlight individual combatant
      const currentCard = document.getElementById(this.app.state.currentTurn);
      if (currentCard) {
        currentCard.classList.add('active-turn');
        const name = currentCard.querySelector('.combatant-name').textContent;
        turnIndicator.textContent = `${name}'s Turn`;
      } else {
        turnIndicator.textContent = 'Error: Combatant not found';
      }
    } else {
      // Highlight team column
      const column = this.app.state.currentTurn === 'heroes' ? 
        document.getElementById('heroes-column') : 
        document.getElementById('monsters-column');
      
      if (column) {
        column.classList.add('active-turn');
      }
      
      turnIndicator.textContent = this.app.state.currentTurn === 'heroes' ? 
        "Heroes' Turn" : "Monsters' Turn";
    }
  }
  
  updateConditionDisplay(card) {
    const conditionsListDiv = card.querySelector('.conditions-list');
    if (!conditionsListDiv) return;
    
    const hiddenData = card.querySelector('.hidden-data');
    if (!hiddenData) return;
    
    try {
      const conditions = JSON.parse(hiddenData.dataset.conditionsData || '[]');
      
      conditionsListDiv.innerHTML = '';
      
      conditions.forEach(cond => {
        const tag = document.createElement('span');
        tag.className = 'condition-tag bg-yellow-500 text-black text-xs font-semibold px-2 py-1 rounded-full';
        tag.textContent = cond.name + (cond.roundsLeft !== null ? ` (${cond.roundsLeft})` : '');
        
        if (cond.roundsLeft !== null) {
          tag.dataset.rounds = cond.roundsLeft;
        }
        
        // Add click handler to edit/remove condition
        tag.addEventListener('click', () => this.editCondition(card, cond));
        
        conditionsListDiv.appendChild(tag);
      });
    } catch (error) {
      console.error("Error updating condition display:", error);
    }
  }
  
  editCondition(card, condition) {
    const name = card.querySelector('.combatant-name').textContent;
    
    const newRounds = prompt(
      `Edit rounds for ${condition.name} on ${name} (currently ${condition.roundsLeft !== null ? condition.roundsLeft : 'permanent'}). 
      Enter 0 or leave blank to remove, or a new number of rounds:`,
      condition.roundsLeft !== null ? condition.roundsLeft : ''
    );
    
    if (newRounds === null) return; // User cancelled
    
    const hiddenData = card.querySelector('.hidden-data');
    if (!hiddenData) return;
    
    try {
      let conditions = JSON.parse(hiddenData.dataset.conditionsData || '[]');
      
      if (newRounds === '' || parseInt(newRounds) === 0) {
        // Remove the condition
        conditions = conditions.filter(c => c.name !== condition.name);
        this.app.logEvent(`Removed condition '${condition.name}' from ${name}.`);
      } else {
        // Update the condition
        const roundsNum = parseInt(newRounds);
        if (!isNaN(roundsNum) && roundsNum > 0) {
          const existingIndex = conditions.findIndex(c => c.name === condition.name);
          if (existingIndex >= 0) {
            conditions[existingIndex].roundsLeft = roundsNum;
          } else {
            conditions.push({ name: condition.name, roundsLeft: roundsNum });
          }
          this.app.logEvent(`Updated '${condition.name}' on ${name} to ${roundsNum} rounds.`);
        } else {
          this.app.showAlert("Invalid number of rounds entered. Condition not changed.");
        }
      }
      
      // Update conditions data
      hiddenData.dataset.conditionsData = JSON.stringify(conditions);
      
      // Update condition display
      this.updateConditionDisplay(card);
      
      // Update player view
      this.updatePlayerView();
    } catch (error) {
      console.error("Error editing condition:", error);
    }
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
    
    // Reset action economy
    this.resetActionEconomy();
    
    // Reset buttons
    document.getElementById('start-combat-btn').disabled = true;
    document.getElementById('roll-all-btn').disabled = false;
    document.getElementById('end-turn-btn').disabled = true;
    
    this.app.logEvent("Combat Reset.");
    
    // Update player view
    this.updatePlayerView();
  }
  
  endCombat() {
    this.app.showConfirm("This will clear the board and end combat. Are you sure?", () => {
      // Reset combat state
      this.resetCombat();
      
      // Clear combatants
      document.getElementById('heroes-list').innerHTML = '';
      document.getElementById('monsters-list').innerHTML = '';
      
      this.app.logEvent("Combat Ended and board cleared.");
      this.app.audio.play('victory');
      
      // Update player view
      this.updatePlayerView();
    });
  }
  
  openOrRefreshPlayerView() {
    if (this.playerViewWindow && !this.playerViewWindow.closed) {
      // Refresh existing window
      this.updatePlayerView();
      this.playerViewWindow.focus();
      this.app.logEvent("Player view refreshed.");
    } else {
      // Open new window
      this.playerViewWindow = window.open('', 'JessterPlayerView', 'width=800,height=600');
      if (this.playerViewWindow) {
        this.updatePlayerView();
        this.app.logEvent("Player view opened.");
      } else {
        this.app.showAlert("Could not open player view. Please check your popup blocker settings.");
      }
    }
  }
  
  updatePlayerView() {
    if (!this.playerViewWindow || this.playerViewWindow.closed) return;
    
    // Generate HTML for player view
    const html = this.generatePlayerViewHTML();
    
    // Update the player view window
    this.playerViewWindow.document.open();
    this.playerViewWindow.document.write(html);
    this.playerViewWindow.document.close();
  }
  
  generatePlayerViewHTML() {
    // This would generate the HTML for the player view
    // For brevity, I'm providing a simplified version
    
    const roundInfo = this.app.state.combatStarted ? 
      `<h1 class="text-3xl font-bold">Round ${this.app.state.roundNumber}</h1>` : 
      '<h1 class="text-3xl font-bold">Prepare for Combat</h1>';
    
    const turnInfo = this.app.state.combatStarted ? 
      `<p class="text-2xl font-bold text-yellow-400 mt-2">${this.getTurnDisplayText()}</p>` : 
      '';
    
    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Combat Tracker - Player View</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Inter', sans-serif;
            background-color: #1a202c;
            color: #e2e8f0;
          }
        </style>
      </head>
      <body class="p-4">
        <div class="text-center mb-6">
          ${roundInfo}
          ${turnInfo}
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 class="text-2xl font-semibold mb-4 text-center text-blue-400">Heroes</h2>
            <div id="heroes-list-player" class="space-y-3">
              ${this.generatePlayerViewCombatants('heroes')}
            </div>
          </div>
          
          <div>
            <h2 class="text-2xl font-semibold mb-4 text-center text-red-400">Monsters</h2>
            <div id="monsters-list-player" class="space-y-3">
              ${this.generatePlayerViewCombatants('monsters')}
            </div>
          </div>
        </div>
      </body>
      </html>`;
  }
  
  getTurnDisplayText() {
    const initiativeType = document.getElementById('initiative-type')?.value || 'dynamic';
    
    if (initiativeType === 'normal') {
      const currentCard = document.getElementById(this.app.state.currentTurn);
      if (currentCard) {
        const name = currentCard.querySelector('.combatant-name').textContent;
        return `${name}'s Turn`;
      }
      return 'Current Turn';
    } else {
      return this.app.state.currentTurn === 'heroes' ? "Heroes' Turn" : "Monsters' Turn";
    }
  }
  
  generatePlayerViewCombatants(type) {
    // Generate HTML for combatants in player view
    // This would be more detailed in a real implementation
    const selector = type === 'heroes' ? '#heroes-list .combatant-card' : '#monsters-list .combatant-card';
    const cards = Array.from(document.querySelectorAll(selector));
    
    if (cards.length === 0) {
      return '<p class="text-gray-500 text-center">No combatants.</p>';
    }
    
    return cards.map(card => {
      const name = card.querySelector('.combatant-name').textContent;
      const initiative = card.querySelector('.initiative-input').value;
      const isActive = card.classList.contains('active-turn');
      
      return `
        <div class="bg-gray-800 p-3 rounded-lg ${isActive ? 'border-2 border-yellow-400' : ''}">
          <div class="flex justify-between items-center">
            <span class="font-bold">${name}</span>
            <span class="text-xl font-bold">${initiative}</span>
          </div>
        </div>
      `;
    }).join('');
  }
  
  getCombatState() {
    // Get the current state of combat for saving/loading
    return {
      combatStarted: this.app.state.combatStarted,
      roundNumber: this.app.state.roundNumber,
      currentTurn: this.app.state.currentTurn,
      heroes: this.getCombatantsData('#heroes-list .combatant-card'),
      monsters: this.getCombatantsData('#monsters-list .combatant-card')
    };
  }
  
  getCombatantsData(selector) {
    // Get data for all combatants matching the selector
    return Array.from(document.querySelectorAll(selector)).map(card => {
      // Extract all relevant data from the card
      // This would be more detailed in a real implementation
      return {
        id: card.id,
        name: card.querySelector('.combatant-name').textContent,
        initiative: card.querySelector('.initiative-input').value,
        // Add more properties as needed
      };
    });
  }
}
