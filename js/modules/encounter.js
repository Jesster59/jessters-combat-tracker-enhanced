/**
 * Encounter Builder for Jesster's Combat Tracker
 * Handles encounter building and management
 */
class EncounterBuilder {
  constructor(app) {
    this.app = app;
    this.currentEncounter = {
      name: '',
      description: '',
      monsters: [],
      environment: '',
      difficulty: 'medium'
    };
  }
  
  createEncounter(encounterData) {
    this.currentEncounter = {
      id: `encounter-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: encounterData.name || 'New Encounter',
      description: encounterData.description || '',
      monsters: encounterData.monsters || [],
      environment: encounterData.environment || '',
      difficulty: encounterData.difficulty || 'medium'
    };
    
    // Save to data manager
    this.app.data.addEncounter(this.currentEncounter);
    
    return this.currentEncounter;
  }
  
  loadEncounter(encounterId) {
    const encounter = this.app.data.encounters.find(e => e.id === encounterId);
    if (encounter) {
      this.currentEncounter = { ...encounter };
      return true;
    }
    return false;
  }
  
  startEncounter() {
    // Clear existing monsters
    document.getElementById('monsters-list').innerHTML = '';
    
    // Add all monsters from the encounter
    this.currentEncounter.monsters.forEach(monster => {
      this.app.monsters.addMonsterToCombat(monster);
    });
    
    this.app.logEvent(`Started encounter: ${this.currentEncounter.name}`);
  }
  
  calculateDifficulty(partyLevel, partySize) {
    // Calculate encounter difficulty based on party level and size
    // This would be implemented in a real application
    return 'medium';
  }
}
