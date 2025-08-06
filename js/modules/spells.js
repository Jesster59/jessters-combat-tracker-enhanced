/**
 * Spell Tracker for Jesster's Combat Tracker
 * Handles spell tracking and management
 */
class SpellTracker {
  constructor(app) {
    this.app = app;
    this.spellList = [];
  }
  
  trackSpell(spellData) {
    // Add a spell to track
    const spell = {
      id: `spell-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: spellData.name,
      caster: spellData.caster,
      level: spellData.level || 0,
      duration: spellData.duration || '1 minute',
      concentration: spellData.concentration || false,
      startRound: this.app.state.roundNumber,
      endRound: this.calculateEndRound(spellData.duration),
      effects: spellData.effects || []
    };
    
    this.spellList.push(spell);
    this.app.logEvent(`${spell.caster} cast ${spell.name}.`);
    
    return spell;
  }
  
  calculateEndRound(duration) {
    // Calculate when the spell ends based on duration
    // This is a simplified version
    const currentRound = this.app.state.roundNumber;
    
    if (duration.includes('round')) {
      const rounds = parseInt(duration) || 1;
      return currentRound + rounds;
    } else if (duration.includes('minute')) {
      const minutes = parseInt(duration) || 1;
      return currentRound + (minutes * 10); // Assuming 10 rounds per minute
    } else if (duration.includes('hour')) {
      const hours = parseInt(duration) || 1;
      return currentRound + (hours * 600); // Assuming 600 rounds per hour
    } else {
      return currentRound + 10; // Default to 1 minute (10 rounds)
    }
  }
  
  checkExpiredSpells() {
    // Check for spells that have expired
    const currentRound = this.app.state.roundNumber;
    const expiredSpells = this.spellList.filter(spell => spell.endRound <= currentRound);
    
    expiredSpells.forEach(spell => {
      this.app.logEvent(`${spell.name} cast by ${spell.caster} has expired.`);
      this.removeSpell(spell.id);
    });
    
    return expiredSpells;
  }
  
  removeSpell(spellId) {
    // Remove a spell from tracking
    const index = this.spellList.findIndex(spell => spell.id === spellId);
    if (index >= 0) {
      const spell = this.spellList[index];
      this.spellList.splice(index, 1);
      return spell;
    }
    return null;
  }
  
  getActiveSpells() {
    return this.spellList;
  }
}
