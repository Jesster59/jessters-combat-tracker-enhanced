/**
 * Damage Tracker for Jesster's Combat Tracker
 * Handles damage calculations and tracking
 */
class DamageTracker {
  constructor(app) {
    this.app = app;
    this.damageTypes = [
      'acid', 'bludgeoning', 'cold', 'fire', 'force', 'lightning',
      'necrotic', 'piercing', 'poison', 'psychic', 'radiant', 'slashing', 'thunder'
    ];
    console.log("Damage.js loaded successfully");
  }
  
  /**
   * Apply damage to a creature
   * @param {string} creatureId - The ID of the creature
   * @param {number} damage - The amount of damage
   * @param {string} damageType - The type of damage
   */
  applyDamage(creatureId, damage, damageType = 'bludgeoning') {
    const card = document.getElementById(creatureId);
    if (!card) {
      console.error(`Creature with ID ${creatureId} not found`);
      return;
    }
    
    const hpInput = card.querySelector('.hp-input');
    const tempHpInput = card.querySelector('.temp-hp-input');
    const combatantName = card.querySelector('.combatant-name').textContent.replace(/\s*\(SRD\s+\d+\.\d+\)$/, '');
    
    let currentHp = parseInt(hpInput.value) || 0;
    let tempHp = parseInt(tempHpInput.value) || 0;
    let damageRemaining = damage;
    
    // Apply damage to temp HP first
    if (tempHp > 0) {
      const tempHpTaken = Math.min(tempHp, damageRemaining);
      tempHp -= tempHpTaken;
      damageRemaining -= tempHpTaken;
      tempHpInput.value = tempHp > 0 ? tempHp : '';
      this.app.logEvent(`${combatantName} took ${tempHpTaken} damage to temporary HP. ${tempHp > 0 ? `(${tempHp} temp HP remaining)` : 'No temp HP left.'}`);
    }
    
    // Apply remaining damage to current HP
    if (damageRemaining > 0) {
      currentHp -= damageRemaining;
      hpInput.value = currentHp;
      this.app.logEvent(`${combatantName} took ${damageRemaining} damage to health.`);
    }
    
    // Trigger HP change logic for concentration, death saves, logging
    const event = { target: hpInput };
    if (this.app.ui && typeof this.app.ui.handleHpChange === 'function') {
      this.app.ui.handleHpChange(event);
    }
    
    // Play sound effect
    if (this.app.audio) {
      this.app.audio.play('hit');
    }
    
    return true;
  }
  
  /**
   * Apply healing to a creature
   * @param {string} creatureId - The ID of the creature
   * @param {number} healing - The amount of healing
   */
  applyHealing(creatureId, healing) {
    const card = document.getElementById(creatureId);
    if (!card) {
      console.error(`Creature with ID ${creatureId} not found`);
      return;
    }
    
    const hpInput = card.querySelector('.hp-input');
    const maxHp = parseInt(hpInput.dataset.maxHp) || 0;
    let currentHp = parseInt(hpInput.value) || 0;
    const combatantName = card.querySelector('.combatant-name').textContent.replace(/\s*\(SRD\s+\d+\.\d+\)$/, '');
    
    // Apply healing
    const oldHp = currentHp;
    currentHp = Math.min(maxHp, currentHp + healing);
    const actualHealing = currentHp - oldHp;
    
    hpInput.value = currentHp;
    this.app.logEvent(`${combatantName} heals ${actualHealing} HP. HP: ${currentHp}/${maxHp}`);
    
    // Trigger HP change logic
    const event = { target: hpInput };
    if (this.app.ui && typeof this.app.ui.handleHpChange === 'function') {
      this.app.ui.handleHpChange(event);
    }
    
    // Play sound effect
    if (this.app.audio) {
      this.app.audio.play('heal');
    }
    
    return true;
  }
}
