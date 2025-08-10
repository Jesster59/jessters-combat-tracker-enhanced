/**
 * Jesster's Combat Tracker
 * History Module
 * Version 2.3.1
 * 
 * This module handles tracking and managing the history of combat events,
 * allowing users to review past actions and maintain a log of what happened
 * during encounters.
 */

/**
 * Event types for combat history
 */
export const EventType = {
  COMBAT_START: 'combat_start',
  COMBAT_END: 'combat_end',
  ROUND_START: 'round_start',
  TURN_START: 'turn_start',
  DAMAGE: 'damage',
  HEALING: 'healing',
  CONDITION_ADDED: 'condition_added',
  CONDITION_REMOVED: 'condition_removed',
  DEATH: 'death',
  REVIVAL: 'revival',
  DICE_ROLL: 'dice_roll',
  SPELL_CAST: 'spell_cast',
  ACTION_USED: 'action_used',
  NOTE: 'note',
  INITIATIVE_ROLL: 'initiative_roll',
  CUSTOM: 'custom'
};

/**
 * Class representing the combat history manager
 */
export class CombatHistory {
  constructor() {
    this.events = [];
    this.currentEncounterId = null;
    this.currentEncounterName = null;
    this.currentRound = 0;
    this.filters = {
      eventTypes: Object.values(EventType),
      combatants: [],
      rounds: [],
      searchText: ''
    };
    this.listeners = [];
  }

  /**
   * Initialize the history for a new encounter
   * @param {string} encounterId - The ID of the encounter
   * @param {string} encounterName - The name of the encounter
   */
  initializeEncounter(encounterId, encounterName) {
    this.currentEncounterId = encounterId;
    this.currentEncounterName = encounterName;
    this.currentRound = 0;
    
    // Add combat start event
    this.addEvent({
      type: EventType.COMBAT_START,
      description: `Combat started: ${encounterName}`,
      timestamp: new Date()
    });
  }

  /**
   * End the current encounter
   */
  endEncounter() {
    if (!this.currentEncounterId) return;
    
    // Add combat end event
    this.addEvent({
      type: EventType.COMBAT_END,
      description: `Combat ended: ${this.currentEncounterName}`,
      timestamp: new Date()
    });
    
    this.currentEncounterId = null;
    this.currentEncounterName = null;
    this.currentRound = 0;
  }

  /**
   * Start a new round
   * @param {number} roundNumber - The round number
   */
  startRound(roundNumber) {
    this.currentRound = roundNumber;
    
    // Add round start event
    this.addEvent({
      type: EventType.ROUND_START,
      round: roundNumber,
      description: `Round ${roundNumber} started`,
      timestamp: new Date()
    });
  }

  /**
   * Record the start of a combatant's turn
   * @param {Object} combatant - The combatant whose turn is starting
   */
  startTurn(combatant) {
    if (!combatant) return;
    
    // Add turn start event
    this.addEvent({
      type: EventType.TURN_START,
      round: this.currentRound,
      actorId: combatant.id,
      actorName: combatant.name,
      actorType: combatant.type,
      description: `${combatant.name}'s turn`,
      timestamp: new Date()
    });
  }

  /**
   * Record damage dealt to a combatant
   * @param {Object} target - The combatant taking damage
   * @param {number} amount - The amount of damage
   * @param {string} damageType - The type of damage
   * @param {Object} source - The source of the damage
   */
  recordDamage(target, amount, damageType = 'unspecified', source = null) {
    if (!target || amount <= 0) return;
    
    let description = `${target.name} takes ${amount} ${damageType} damage`;
    if (source) {
      description += ` from ${source.name}`;
    }
    
    // Add damage event
    this.addEvent({
      type: EventType.DAMAGE,
      round: this.currentRound,
      targetId: target.id,
      targetName: target.name,
      targetType: target.type,
      actorId: source ? source.id : null,
      actorName: source ? source.name : null,
      actorType: source ? source.type : null,
      amount: amount,
      damageType: damageType,
      description: description,
      timestamp: new Date()
    });
    
    // Check if this damage killed the target
    if (target.hp <= 0) {
      this.recordDeath(target, source);
    }
  }

  /**
   * Record healing received by a combatant
   * @param {Object} target - The combatant being healed
   * @param {number} amount - The amount of healing
   * @param {Object} source - The source of the healing
   */
  recordHealing(target, amount, source = null) {
    if (!target || amount <= 0) return;
    
    let description = `${target.name} heals ${amount} hit points`;
    if (source) {
      description += ` from ${source.name}`;
    }
    
    // Add healing event
    this.addEvent({
      type: EventType.HEALING,
      round: this.currentRound,
      targetId: target.id,
      targetName: target.name,
      targetType: target.type,
      actorId: source ? source.id : null,
      actorName: source ? source.name : null,
      actorType: source ? source.type : null,
      amount: amount,
      description: description,
      timestamp: new Date()
    });
    
    // Check if this healing revived the target
    if (target.hp > 0 && this._wasDeadBefore(target)) {
      this.recordRevival(target, source);
    }
  }

  /**
   * Record a condition being applied to a combatant
   * @param {Object} target - The combatant receiving the condition
   * @param {Object} condition - The condition being applied
   * @param {Object} source - The source of the condition
   */
  recordConditionAdded(target, condition, source = null) {
    if (!target || !condition) return;
    
    const conditionName = condition.name || condition;
    let description = `${target.name} is now ${conditionName}`;
    if (source) {
      description += ` due to ${source.name}`;
    }
    
    // Add condition event
    this.addEvent({
      type: EventType.CONDITION_ADDED,
      round: this.currentRound,
      targetId: target.id,
      targetName: target.name,
      targetType: target.type,
      actorId: source ? source.id : null,
      actorName: source ? source.name : null,
      actorType: source ? source.type : null,
      conditionId: condition.id || condition,
      conditionName: conditionName,
      duration: condition.duration,
      description: description,
      timestamp: new Date()
    });
  }

  /**
   * Record a condition being removed from a combatant
   * @param {Object} target - The combatant losing the condition
   * @param {Object} condition - The condition being removed
   * @param {boolean} expired - Whether the condition expired naturally
   */
  recordConditionRemoved(target, condition, expired = false) {
    if (!target || !condition) return;
    
    const conditionName = condition.name || condition;
    let description = `${target.name} is no longer ${conditionName}`;
    if (expired) {
      description += ` (expired)`;
    }
    
    // Add condition removal event
    this.addEvent({
      type: EventType.CONDITION_REMOVED,
      round: this.currentRound,
      targetId: target.id,
      targetName: target.name,
      targetType: target.type,
      conditionId: condition.id || condition,
      conditionName: conditionName,
      expired: expired,
      description: description,
      timestamp: new Date()
    });
  }

  /**
   * Record the death of a combatant
   * @param {Object} target - The combatant who died
   * @param {Object} killer - The combatant who caused the death
   */
  recordDeath(target, killer = null) {
    if (!target) return;
    
    let description = `${target.name} ${target.type === 'player' ? 'falls unconscious' : 'dies'}`;
    if (killer) {
      description += ` from ${killer.name}'s attack`;
    }
    
    // Add death event
    this.addEvent({
      type: EventType.DEATH,
      round: this.currentRound,
      targetId: target.id,
      targetName: target.name,
      targetType: target.type,
      actorId: killer ? killer.id : null,
      actorName: killer ? killer.name : null,
      actorType: killer ? killer.type : null,
      description: description,
      timestamp: new Date()
    });
  }

  /**
   * Record the revival of a combatant
   * @param {Object} target - The combatant being revived
   * @param {Object} source - The source of the revival
   */
  recordRevival(target, source = null) {
    if (!target) return;
    
    let description = `${target.name} ${target.type === 'player' ? 'regains consciousness' : 'is revived'}`;
    if (source) {
      description += ` thanks to ${source.name}`;
    }
    
    // Add revival event
    this.addEvent({
      type: EventType.REVIVAL,
      round: this.currentRound,
      targetId: target.id,
      targetName: target.name,
      targetType: target.type,
      actorId: source ? source.id : null,
      actorName: source ? source.name : null,
      actorType: source ? source.type : null,
      description: description,
      timestamp: new Date()
    });
  }

  /**
   * Record a dice roll
   * @param {string} formula - The dice formula rolled
   * @param {number} result - The result of the roll
   * @param {Object} roller - The combatant who rolled
   * @param {string} purpose - The purpose of the roll
   */
  recordDiceRoll(formula, result, roller = null, purpose = '') {
    let description = `Dice Roll: ${formula} = ${result}`;
    if (purpose) {
      description += ` (${purpose})`;
    }
    if (roller) {
      description = `${roller.name} rolls ${description}`;
    }
    
    // Add dice roll event
    this.addEvent({
      type: EventType.DICE_ROLL,
      round: this.currentRound,
      actorId: roller ? roller.id : null,
      actorName: roller ? roller.name : null,
      actorType: roller ? roller.type : null,
      formula: formula,
      result: result,
      purpose: purpose,
      description: description,
      timestamp: new Date()
    });
  }

  /**
   * Record a spell being cast
   * @param {Object} caster - The combatant casting the spell
   * @param {string} spellName - The name of the spell
   * @param {number} spellLevel - The level the spell was cast at
   * @param {Array} targets - The targets of the spell
   */
  recordSpellCast(caster, spellName, spellLevel = 0, targets = []) {
    if (!caster || !spellName) return;
    
    let description = `${caster.name} casts ${spellName}`;
    if (spellLevel > 0) {
      description += ` at level ${spellLevel}`;
    }
    
    if (targets.length > 0) {
      const targetNames = targets.map(t => t.name).join(', ');
      description += ` targeting ${targetNames}`;
    }
    
    // Add spell cast event
    this.addEvent({
      type: EventType.SPELL_CAST,
      round: this.currentRound,
      actorId: caster.id,
      actorName: caster.name,
      actorType: caster.type,
      spellName: spellName,
      spellLevel: spellLevel,
      targets: targets.map(t => ({ id: t.id, name: t.name, type: t.type })),
      description: description,
      timestamp: new Date()
    });
  }

  /**
   * Record an action being used
   * @param {Object} actor - The combatant using the action
   * @param {string} actionName - The name of the action
   * @param {string} actionType - The type of action (action, bonus, reaction)
   * @param {Object} target - The target of the action
   */
  recordActionUsed(actor, actionName, actionType = 'action', target = null) {
    if (!actor || !actionName) return;
    
    let description = `${actor.name} uses ${actionName}`;
    if (actionType !== 'action') {
      description += ` (${actionType})`;
    }
    
    if (target) {
      description += ` on ${target.name}`;
    }
    
    // Add action event
    this.addEvent({
      type: EventType.ACTION_USED,
      round: this.currentRound,
      actorId: actor.id,
      actorName: actor.name,
      actorType: actor.type,
      targetId: target ? target.id : null,
      targetName: target ? target.name : null,
      targetType: target ? target.type : null,
      actionName: actionName,
      actionType: actionType,
      description: description,
      timestamp: new Date()
    });
  }

  /**
   * Record initiative rolls
   * @param {Array} combatants - The combatants with their initiative rolls
   */
  recordInitiativeRolls(combatants) {
    if (!combatants || combatants.length === 0) return;
    
    // Add initiative roll event
    this.addEvent({
      type: EventType.INITIATIVE_ROLL,
      round: 0,
      rolls: combatants.map(c => ({
        id: c.id,
        name: c.name,
        type: c.type,
        initiative: c.initiative,
        modifier: c.initiativeModifier || 0
      })),
      description: `Initiative rolled for ${combatants.length} combatants`,
      timestamp: new Date()
    });
  }

  /**
   * Add a custom note to the history
   * @param {string} note - The note text
   * @param {Object} actor - The combatant associated with the note
   */
  addNote(note, actor = null) {
    if (!note) return;
    
    let description = note;
    if (actor) {
      description = `${actor.name}: ${note}`;
    }
    
    // Add note event
    this.addEvent({
      type: EventType.NOTE,
      round: this.currentRound,
      actorId: actor ? actor.id : null,
      actorName: actor ? actor.name : null,
      actorType: actor ? actor.type : null,
      note: note,
      description: description,
      timestamp: new Date()
    });
  }

  /**
   * Add a custom event to the history
   * @param {Object} event - The event to add
   */
  addEvent(event) {
    // Ensure the event has the encounter ID and name
    const enrichedEvent = {
      ...event,
      encounterId: this.currentEncounterId,
      encounterName: this.currentEncounterName
    };
    
    // Add the event to the history
    this.events.push(enrichedEvent);
    
    // Notify listeners
    this._notifyListeners(enrichedEvent);
  }

  /**
   * Get all events in the history
   * @returns {Array} All history events
   */
  getAllEvents() {
    return [...this.events];
  }

  /**
   * Get events for a specific encounter
   * @param {string} encounterId - The ID of the encounter
   * @returns {Array} Events for the specified encounter
   */
  getEncounterEvents(encounterId) {
    return this.events.filter(event => event.encounterId === encounterId);
  }

  /**
   * Get events for the current encounter
   * @returns {Array} Events for the current encounter
   */
  getCurrentEncounterEvents() {
    return this.events.filter(event => event.encounterId === this.currentEncounterId);
  }

  /**
   * Get events for a specific round
   * @param {number} round - The round number
   * @param {string} encounterId - The ID of the encounter (optional, defaults to current)
   * @returns {Array} Events for the specified round
   */
  getRoundEvents(round, encounterId = null) {
    const targetEncounterId = encounterId || this.currentEncounterId;
    return this.events.filter(event => 
      event.encounterId === targetEncounterId && 
      event.round === round
    );
  }

  /**
   * Get events for a specific combatant
   * @param {string} combatantId - The ID of the combatant
   * @returns {Array} Events involving the specified combatant
   */
  getCombatantEvents(combatantId) {
    return this.events.filter(event => 
      event.actorId === combatantId || 
      event.targetId === combatantId
    );
  }

  /**
   * Get events of a specific type
   * @param {string} eventType - The type of events to get
   * @returns {Array} Events of the specified type
   */
  getEventsByType(eventType) {
    return this.events.filter(event => event.type === eventType);
  }

  /**
   * Get filtered events based on current filters
   * @returns {Array} Filtered events
   */
  getFilteredEvents() {
    return this.events.filter(event => {
      // Filter by event type
      if (!this.filters.eventTypes.includes(event.type)) {
        return false;
      }
      
      // Filter by combatant
      if (this.filters.combatants.length > 0) {
        const combatantInvolved = 
          this.filters.combatants.includes(event.actorId) || 
          this.filters.combatants.includes(event.targetId);
        
        if (!combatantInvolved) {
          return false;
        }
      }
      
      // Filter by round
      if (this.filters.rounds.length > 0) {
        if (!this.filters.rounds.includes(event.round)) {
          return false;
        }
      }
      
      // Filter by search text
      if (this.filters.searchText) {
        const searchLower = this.filters.searchText.toLowerCase();
        const descriptionLower = event.description ? event.description.toLowerCase() : '';
        
        if (!descriptionLower.includes(searchLower)) {
          return false;
        }
      }
      
      return true;
    });
  }

  /**
   * Set filters for event retrieval
   * @param {Object} filters - The filters to apply
   */
  setFilters(filters) {
    this.filters = {
      ...this.filters,
      ...filters
    };
  }

  /**
   * Clear all filters
   */
  clearFilters() {
    this.filters = {
      eventTypes: Object.values(EventType),
      combatants: [],
      rounds: [],
      searchText: ''
    };
  }

  /**
   * Clear all history events
   */
  clearHistory() {
    this.events = [];
    this.currentEncounterId = null;
    this.currentEncounterName = null;
    this.currentRound = 0;
  }

  /**
   * Clear history for a specific encounter
   * @param {string} encounterId - The ID of the encounter to clear
   */
  clearEncounterHistory(encounterId) {
    this.events = this.events.filter(event => event.encounterId !== encounterId);
  }

  /**
   * Export history to JSON
   * @returns {string} JSON string of history data
   */
  exportToJSON() {
    return JSON.stringify({
      events: this.events,
      version: '2.3.1',
      exportDate: new Date().toISOString()
    });
  }

  /**
   * Import history from JSON
   * @param {string} json - JSON string of history data
   * @returns {boolean} True if import was successful
   */
  importFromJSON(json) {
    try {
      const data = JSON.parse(json);
      
      if (!data.events || !Array.isArray(data.events)) {
        console.error('Invalid history data: events array missing');
        return false;
      }
      
      // Replace current events or merge with existing
      this.events = data.events;
      return true;
    } catch (error) {
      console.error('Error importing history:', error);
      return false;
    }
  }

  /**
   * Add a listener for new events
   * @param {Function} listener - The listener function
   * @returns {Function} Function to remove the listener
   */
  addListener(listener) {
    if (typeof listener !== 'function') {
      console.error('Listener must be a function');
      return () => {};
    }
    
    this.listeners.push(listener);
    
    // Return a function to remove this listener
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners of a new event
   * @param {Object} event - The event that was added
   * @private
   */
  _notifyListeners(event) {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in history listener:', error);
      }
    });
  }

  /**
   * Check if a combatant was dead before
   * @param {Object} combatant - The combatant to check
   * @returns {boolean} True if the combatant was dead before
   * @private
   */
  _wasDeadBefore(combatant) {
    if (!combatant) return false;
    
    // Look for the most recent death event for this combatant
    const deathEvents = this.events
      .filter(event => 
        event.type === EventType.DEATH && 
        event.targetId === combatant.id
      )
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    if (deathEvents.length === 0) {
      return false;
    }
    
    // Look for revival events after the most recent death
    const lastDeath = deathEvents[0];
    const lastDeathTime = new Date(lastDeath.timestamp);
    
    const revivalEvents = this.events
      .filter(event => 
        event.type === EventType.REVIVAL && 
        event.targetId === combatant.id && 
        new Date(event.timestamp) > lastDeathTime
      );
    
    // If there are no revival events after the last death, the combatant was dead
    return revivalEvents.length === 0;
  }

  /**
   * Generate a summary of an encounter
   * @param {string} encounterId - The ID of the encounter to summarize
   * @returns {Object} Encounter summary
   */
  generateEncounterSummary(encounterId) {
    const targetEncounterId = encounterId || this.currentEncounterId;
    if (!targetEncounterId) return null;
    
    const encounterEvents = this.getEncounterEvents(targetEncounterId);
    if (encounterEvents.length === 0) return null;
    
    // Get basic encounter info
    const firstEvent = encounterEvents[0];
    const encounterName = firstEvent.encounterName || 'Unknown Encounter';
    const startTime = new Date(firstEvent.timestamp);
    
    // Find end time (if combat has ended)
    const endEvent = encounterEvents.find(event => event.type === EventType.COMBAT_END);
    const endTime = endEvent ? new Date(endEvent.timestamp) : null;
    
    // Calculate duration
    const durationMs = endTime ? endTime - startTime : new Date() - startTime;
    const durationMinutes = Math.floor(durationMs / 60000);
    const durationSeconds = Math.floor((durationMs % 60000) / 1000);
    
    // Find the highest round reached
    const maxRound = Math.max(...encounterEvents.map(event => event.round || 0));
    
    // Count events by type
    const eventCounts = {};
    Object.values(EventType).forEach(type => {
      eventCounts[type] = encounterEvents.filter(event => event.type === type).length;
    });
    
    // Calculate total damage dealt and healing done
    const totalDamage = encounterEvents
      .filter(event => event.type === EventType.DAMAGE)
      .reduce((sum, event) => sum + (event.amount || 0), 0);
    
    const totalHealing = encounterEvents
      .filter(event => event.type === EventType.HEALING)
      .reduce((sum, event) => sum + (event.amount || 0), 0);
    
    // Count deaths and revivals
    const deaths = encounterEvents.filter(event => event.type === EventType.DEATH);
    const revivals = encounterEvents.filter(event => event.type === EventType.REVIVAL);
    
    // Find all combatants involved
    const combatants = new Set();
    encounterEvents.forEach(event => {
      if (event.actorId) combatants.add(event.actorId);
      if (event.targetId) combatants.add(event.targetId);
    });
    
    // Find most active combatant
    const combatantActivityCount = {};
    encounterEvents.forEach(event => {
      if (event.actorId) {
        combatantActivityCount[event.actorId] = (combatantActivityCount[event.actorId] || 0) + 1;
      }
      if (event.targetId) {
        combatantActivityCount[event.targetId] = (combatantActivityCount[event.targetId] || 0) + 1;
      }
    });
    
    let mostActiveId = null;
    let mostActiveCount = 0;
    let mostActiveName = null;
    
    Object.entries(combatantActivityCount).forEach(([id, count]) => {
      if (count > mostActiveCount) {
        mostActiveCount = count;
        mostActiveId = id;
        
        // Find the name of this combatant
        const eventWithCombatant = encounterEvents.find(event => 
          (event.actorId === id && event.actorName) || 
          (event.targetId === id && event.targetName)
        );
        
        if (eventWithCombatant) {
          mostActiveName = eventWithCombatant.actorId === id ? 
            eventWithCombatant.actorName : 
            eventWithCombatant.targetName;
        }
      }
    });
    
    // Return the summary
    return {
      encounterId: targetEncounterId,
      encounterName,
      startTime,
      endTime,
      duration: `${durationMinutes}m ${durationSeconds}s`,
      rounds: maxRound,
      eventCounts,
      totalDamage,
      totalHealing,
      deaths: deaths.length,
      revivals: revivals.length,
      combatantCount: combatants.size,
      mostActive: {
        id: mostActiveId,
        name: mostActiveName,
        activityCount: mostActiveCount
      },
      isComplete: !!endEvent
    };
  }

  /**
   * Generate a narrative summary of an encounter
   * @param {string} encounterId - The ID of the encounter
   * @returns {string} Narrative summary
   */
  generateNarrativeSummary(encounterId) {
    const summary = this.generateEncounterSummary(encounterId);
    if (!summary) return 'No encounter data available.';
    
    let narrative = `# ${summary.encounterName}\n\n`;
    
    // Add basic info
    narrative += `**Date:** ${summary.startTime.toLocaleDateString()}\n`;
    narrative += `**Duration:** ${summary.duration}\n`;
    narrative += `**Rounds:** ${summary.rounds}\n\n`;
    
    // Add combat statistics
    narrative += `## Combat Statistics\n\n`;
    narrative += `- **Total Damage Dealt:** ${summary.totalDamage}\n`;
    narrative += `- **Total Healing Done:** ${summary.totalHealing}\n`;
    narrative += `- **Deaths:** ${summary.deaths}\n`;
    narrative += `- **Revivals:** ${summary.revivals}\n`;
    narrative += `- **Combatants:** ${summary.combatantCount}\n`;
    
    if (summary.mostActive.name) {
      narrative += `- **Most Active:** ${summary.mostActive.name}\n`;
    }
    
    // Add round-by-round summary
    narrative += `\n## Round-by-Round Summary\n\n`;
    
    const events = this.getEncounterEvents(encounterId);
    let currentRound = 0;
    
    events.forEach(event => {
      // Skip certain event types for the narrative
      if ([EventType.DICE_ROLL, EventType.INITIATIVE_ROLL].includes(event.type)) {
        return;
      }
      
      // Add round headers
      if (event.round > currentRound) {
        currentRound = event.round;
        narrative += `\n### Round ${currentRound}\n\n`;
      }
      
      // Add the event description
      if (event.description) {
        narrative += `- ${event.description}\n`;
      }
    });
    
    // Add conclusion
    if (summary.isComplete) {
      narrative += `\n## Conclusion\n\n`;
      narrative += `The encounter ended after ${summary.rounds} rounds and lasted ${summary.duration}.\n`;
    } else {
      narrative += `\n## Status\n\n`;
      narrative += `The encounter is still in progress.\n`;
    }
    
    return narrative;
  }
}

/**
 * Create a new combat history instance
 * @returns {CombatHistory} A new combat history instance
 */
export function createCombatHistory() {
  return new CombatHistory();
}

/**
 * Format an event for display
 * @param {Object} event - The event to format
 * @returns {Object} Formatted event
 */
export function formatEvent(event) {
  if (!event) return null;
  
  // Create a copy of the event
  const formattedEvent = { ...event };
  
    // Format timestamp
  if (event.timestamp) {
    const date = new Date(event.timestamp);
    formattedEvent.formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    formattedEvent.formattedDate = date.toLocaleDateString();
  }
  
  // Add CSS classes based on event type
  formattedEvent.cssClass = `event-${event.type}`;
  
  // Add icon based on event type
  formattedEvent.icon = getEventIcon(event.type);
  
  // Add color based on event type
  formattedEvent.color = getEventColor(event.type);
  
  return formattedEvent;
}

/**
 * Get an icon for an event type
 * @param {string} eventType - The event type
 * @returns {string} Icon class name
 */
export function getEventIcon(eventType) {
  switch (eventType) {
    case EventType.COMBAT_START:
      return 'fas fa-play-circle';
    case EventType.COMBAT_END:
      return 'fas fa-stop-circle';
    case EventType.ROUND_START:
      return 'fas fa-hourglass-start';
    case EventType.TURN_START:
      return 'fas fa-user-clock';
    case EventType.DAMAGE:
      return 'fas fa-heart-broken';
    case EventType.HEALING:
      return 'fas fa-heart';
    case EventType.CONDITION_ADDED:
      return 'fas fa-exclamation-triangle';
    case EventType.CONDITION_REMOVED:
      return 'fas fa-check-circle';
    case EventType.DEATH:
      return 'fas fa-skull';
    case EventType.REVIVAL:
      return 'fas fa-hand-holding-medical';
    case EventType.DICE_ROLL:
      return 'fas fa-dice-d20';
    case EventType.SPELL_CAST:
      return 'fas fa-magic';
    case EventType.ACTION_USED:
      return 'fas fa-running';
    case EventType.NOTE:
      return 'fas fa-sticky-note';
    case EventType.INITIATIVE_ROLL:
      return 'fas fa-sort-numeric-down';
    case EventType.CUSTOM:
      return 'fas fa-asterisk';
    default:
      return 'fas fa-info-circle';
  }
}

/**
 * Get a color for an event type
 * @param {string} eventType - The event type
 * @returns {string} Color hex code
 */
export function getEventColor(eventType) {
  switch (eventType) {
    case EventType.COMBAT_START:
      return '#4CAF50'; // Green
    case EventType.COMBAT_END:
      return '#9E9E9E'; // Gray
    case EventType.ROUND_START:
      return '#2196F3'; // Blue
    case EventType.TURN_START:
      return '#03A9F4'; // Light Blue
    case EventType.DAMAGE:
      return '#F44336'; // Red
    case EventType.HEALING:
      return '#8BC34A'; // Light Green
    case EventType.CONDITION_ADDED:
      return '#FF9800'; // Orange
    case EventType.CONDITION_REMOVED:
      return '#FFEB3B'; // Yellow
    case EventType.DEATH:
      return '#9C27B0'; // Purple
    case EventType.REVIVAL:
      return '#00BCD4'; // Cyan
    case EventType.DICE_ROLL:
      return '#607D8B'; // Blue Gray
    case EventType.SPELL_CAST:
      return '#E91E63'; // Pink
    case EventType.ACTION_USED:
      return '#795548'; // Brown
    case EventType.NOTE:
      return '#009688'; // Teal
    case EventType.INITIATIVE_ROLL:
      return '#3F51B5'; // Indigo
    case EventType.CUSTOM:
      return '#673AB7'; // Deep Purple
    default:
      return '#9E9E9E'; // Gray
  }
}

/**
 * Group events by round
 * @param {Array} events - The events to group
 * @returns {Object} Events grouped by round
 */
export function groupEventsByRound(events) {
  const grouped = {};
  
  events.forEach(event => {
    const round = event.round || 0;
    if (!grouped[round]) {
      grouped[round] = [];
    }
    grouped[round].push(event);
  });
  
  return grouped;
}

/**
 * Group events by combatant
 * @param {Array} events - The events to group
 * @returns {Object} Events grouped by combatant ID
 */
export function groupEventsByCombatant(events) {
  const grouped = {};
  
  events.forEach(event => {
    // Add to actor's group
    if (event.actorId) {
      if (!grouped[event.actorId]) {
        grouped[event.actorId] = {
          id: event.actorId,
          name: event.actorName,
          type: event.actorType,
          events: []
        };
      }
      grouped[event.actorId].events.push(event);
    }
    
    // Add to target's group if different from actor
    if (event.targetId && event.targetId !== event.actorId) {
      if (!grouped[event.targetId]) {
        grouped[event.targetId] = {
          id: event.targetId,
          name: event.targetName,
          type: event.targetType,
          events: []
        };
      }
      grouped[event.targetId].events.push(event);
    }
  });
  
  return grouped;
}

/**
 * Group events by type
 * @param {Array} events - The events to group
 * @returns {Object} Events grouped by type
 */
export function groupEventsByType(events) {
  const grouped = {};
  
  events.forEach(event => {
    const type = event.type;
    if (!grouped[type]) {
      grouped[type] = [];
    }
    grouped[type].push(event);
  });
  
  return grouped;
}

/**
 * Sort events by timestamp
 * @param {Array} events - The events to sort
 * @param {boolean} ascending - Sort in ascending order (oldest first)
 * @returns {Array} Sorted events
 */
export function sortEventsByTime(events, ascending = true) {
  return [...events].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return ascending ? timeA - timeB : timeB - timeA;
  });
}

/**
 * Filter events by time range
 * @param {Array} events - The events to filter
 * @param {Date} startTime - The start time
 * @param {Date} endTime - The end time
 * @returns {Array} Filtered events
 */
export function filterEventsByTimeRange(events, startTime, endTime) {
  return events.filter(event => {
    const eventTime = new Date(event.timestamp).getTime();
    return eventTime >= startTime.getTime() && eventTime <= endTime.getTime();
  });
}

/**
 * Search events by text
 * @param {Array} events - The events to search
 * @param {string} searchText - The text to search for
 * @returns {Array} Matching events
 */
export function searchEvents(events, searchText) {
  if (!searchText || searchText.trim() === '') {
    return events;
  }
  
  const normalizedSearch = searchText.toLowerCase().trim();
  
  return events.filter(event => {
    // Search in description
    if (event.description && event.description.toLowerCase().includes(normalizedSearch)) {
      return true;
    }
    
    // Search in actor name
    if (event.actorName && event.actorName.toLowerCase().includes(normalizedSearch)) {
      return true;
    }
    
    // Search in target name
    if (event.targetName && event.targetName.toLowerCase().includes(normalizedSearch)) {
      return true;
    }
    
    // Search in spell name
    if (event.spellName && event.spellName.toLowerCase().includes(normalizedSearch)) {
      return true;
    }
    
    // Search in action name
    if (event.actionName && event.actionName.toLowerCase().includes(normalizedSearch)) {
      return true;
    }
    
    // Search in condition name
    if (event.conditionName && event.conditionName.toLowerCase().includes(normalizedSearch)) {
      return true;
    }
    
    // Search in note
    if (event.note && event.note.toLowerCase().includes(normalizedSearch)) {
      return true;
    }
    
    return false;
  });
}

/**
 * Calculate statistics for a combatant from events
 * @param {string} combatantId - The ID of the combatant
 * @param {Array} events - The events to analyze
 * @returns {Object} Combatant statistics
 */
export function calculateCombatantStats(combatantId, events) {
  if (!combatantId || !events || events.length === 0) {
    return null;
  }
  
  // Filter events related to this combatant
  const combatantEvents = events.filter(event => 
    event.actorId === combatantId || event.targetId === combatantId
  );
  
  if (combatantEvents.length === 0) {
    return null;
  }
  
  // Get combatant name and type
  const combatantInfo = combatantEvents.find(event => 
    (event.actorId === combatantId && event.actorName) || 
    (event.targetId === combatantId && event.targetName)
  );
  
  const name = combatantInfo ? 
    (combatantInfo.actorId === combatantId ? combatantInfo.actorName : combatantInfo.targetName) : 
    'Unknown';
  
  const type = combatantInfo ? 
    (combatantInfo.actorId === combatantId ? combatantInfo.actorType : combatantInfo.targetType) : 
    'unknown';
  
  // Calculate damage dealt
  const damageDealt = combatantEvents
    .filter(event => event.type === EventType.DAMAGE && event.actorId === combatantId)
    .reduce((total, event) => total + (event.amount || 0), 0);
  
  // Calculate damage taken
  const damageTaken = combatantEvents
    .filter(event => event.type === EventType.DAMAGE && event.targetId === combatantId)
    .reduce((total, event) => total + (event.amount || 0), 0);
  
  // Calculate healing done
  const healingDone = combatantEvents
    .filter(event => event.type === EventType.HEALING && event.actorId === combatantId)
    .reduce((total, event) => total + (event.amount || 0), 0);
  
  // Calculate healing received
  const healingReceived = combatantEvents
    .filter(event => event.type === EventType.HEALING && event.targetId === combatantId)
    .reduce((total, event) => total + (event.amount || 0), 0);
  
  // Count spells cast
  const spellsCast = combatantEvents
    .filter(event => event.type === EventType.SPELL_CAST && event.actorId === combatantId)
    .length;
  
  // Count actions used
  const actionsUsed = combatantEvents
    .filter(event => event.type === EventType.ACTION_USED && event.actorId === combatantId)
    .length;
  
  // Count conditions received
  const conditionsReceived = combatantEvents
    .filter(event => event.type === EventType.CONDITION_ADDED && event.targetId === combatantId)
    .length;
  
  // Count deaths
  const deaths = combatantEvents
    .filter(event => event.type === EventType.DEATH && event.targetId === combatantId)
    .length;
  
  // Count revivals
  const revivals = combatantEvents
    .filter(event => event.type === EventType.REVIVAL && event.targetId === combatantId)
    .length;
  
  // Calculate turns taken
  const turnsTaken = combatantEvents
    .filter(event => event.type === EventType.TURN_START && event.actorId === combatantId)
    .length;
  
  // Calculate average damage per turn
  const averageDamagePerTurn = turnsTaken > 0 ? damageDealt / turnsTaken : 0;
  
  // Calculate average healing per turn
  const averageHealingPerTurn = turnsTaken > 0 ? healingDone / turnsTaken : 0;
  
  // Find most common action
  const actionCounts = {};
  combatantEvents
    .filter(event => event.type === EventType.ACTION_USED && event.actorId === combatantId)
    .forEach(event => {
      actionCounts[event.actionName] = (actionCounts[event.actionName] || 0) + 1;
    });
  
  let mostCommonAction = null;
  let mostCommonActionCount = 0;
  
  Object.entries(actionCounts).forEach(([action, count]) => {
    if (count > mostCommonActionCount) {
      mostCommonAction = action;
      mostCommonActionCount = count;
    }
  });
  
  // Find most common spell
  const spellCounts = {};
  combatantEvents
    .filter(event => event.type === EventType.SPELL_CAST && event.actorId === combatantId)
    .forEach(event => {
      spellCounts[event.spellName] = (spellCounts[event.spellName] || 0) + 1;
    });
  
  let mostCommonSpell = null;
  let mostCommonSpellCount = 0;
  
  Object.entries(spellCounts).forEach(([spell, count]) => {
    if (count > mostCommonSpellCount) {
      mostCommonSpell = spell;
      mostCommonSpellCount = count;
    }
  });
  
  return {
    id: combatantId,
    name,
    type,
    damageDealt,
    damageTaken,
    healingDone,
    healingReceived,
    spellsCast,
    actionsUsed,
    conditionsReceived,
    deaths,
    revivals,
    turnsTaken,
    averageDamagePerTurn,
    averageHealingPerTurn,
    mostCommonAction,
    mostCommonActionCount,
    mostCommonSpell,
    mostCommonSpellCount
  };
}

/**
 * Generate a timeline visualization data
 * @param {Array} events - The events to visualize
 * @returns {Object} Timeline visualization data
 */
export function generateTimelineData(events) {
  if (!events || events.length === 0) {
    return { rounds: [], events: [] };
  }
  
  // Group events by round
  const roundGroups = groupEventsByRound(events);
  
  // Create timeline rounds
  const rounds = Object.keys(roundGroups)
    .map(round => parseInt(round, 10))
    .sort((a, b) => a - b)
    .map(round => ({
      round,
      events: roundGroups[round].length
    }));
  
  // Create timeline events
  const timelineEvents = events.map(event => {
    const formattedEvent = formatEvent(event);
    
    return {
      id: `event-${event.timestamp}-${Math.random().toString(36).substr(2, 9)}`,
      round: event.round || 0,
      time: new Date(event.timestamp),
      type: event.type,
      description: event.description,
      icon: formattedEvent.icon,
      color: formattedEvent.color,
      actorId: event.actorId,
      actorName: event.actorName,
      targetId: event.targetId,
      targetName: event.targetName
    };
  });
  
  return {
    rounds,
    events: timelineEvents
  };
}

/**
 * Generate a damage report
 * @param {Array} events - The events to analyze
 * @returns {Object} Damage report data
 */
export function generateDamageReport(events) {
  if (!events || events.length === 0) {
    return { combatants: [], damageByType: {} };
  }
  
  // Get all damage events
  const damageEvents = events.filter(event => event.type === EventType.DAMAGE);
  
  // Group by combatant
  const combatantGroups = {};
  
  damageEvents.forEach(event => {
    // Track damage dealt
    if (event.actorId) {
      if (!combatantGroups[event.actorId]) {
        combatantGroups[event.actorId] = {
          id: event.actorId,
          name: event.actorName,
          type: event.actorType,
          damageDealt: 0,
          damageTaken: 0,
          damageDealtByType: {}
        };
      }
      
      combatantGroups[event.actorId].damageDealt += (event.amount || 0);
      
      // Track damage by type
      const damageType = event.damageType || 'unspecified';
      combatantGroups[event.actorId].damageDealtByType[damageType] = 
        (combatantGroups[event.actorId].damageDealtByType[damageType] || 0) + (event.amount || 0);
    }
    
    // Track damage taken
    if (event.targetId) {
      if (!combatantGroups[event.targetId]) {
        combatantGroups[event.targetId] = {
          id: event.targetId,
          name: event.targetName,
          type: event.targetType,
          damageDealt: 0,
          damageTaken: 0,
          damageDealtByType: {}
        };
      }
      
      combatantGroups[event.targetId].damageTaken += (event.amount || 0);
    }
  });
  
  // Convert to array and sort by damage dealt
  const combatants = Object.values(combatantGroups)
    .sort((a, b) => b.damageDealt - a.damageDealt);
  
  // Calculate damage by type across all combatants
  const damageByType = {};
  
  damageEvents.forEach(event => {
    const damageType = event.damageType || 'unspecified';
    damageByType[damageType] = (damageByType[damageType] || 0) + (event.amount || 0);
  });
  
  return {
    combatants,
    damageByType
  };
}

/**
 * Generate a healing report
 * @param {Array} events - The events to analyze
 * @returns {Object} Healing report data
 */
export function generateHealingReport(events) {
  if (!events || events.length === 0) {
    return { combatants: [] };
  }
  
  // Get all healing events
  const healingEvents = events.filter(event => event.type === EventType.HEALING);
  
  // Group by combatant
  const combatantGroups = {};
  
  healingEvents.forEach(event => {
    // Track healing done
    if (event.actorId) {
      if (!combatantGroups[event.actorId]) {
        combatantGroups[event.actorId] = {
          id: event.actorId,
          name: event.actorName,
          type: event.actorType,
          healingDone: 0,
          healingReceived: 0
        };
      }
      
      combatantGroups[event.actorId].healingDone += (event.amount || 0);
    }
    
    // Track healing received
    if (event.targetId) {
      if (!combatantGroups[event.targetId]) {
        combatantGroups[event.targetId] = {
          id: event.targetId,
          name: event.targetName,
          type: event.targetType,
          healingDone: 0,
          healingReceived: 0
        };
      }
      
      combatantGroups[event.targetId].healingReceived += (event.amount || 0);
    }
  });
  
  // Convert to array and sort by healing done
  const combatants = Object.values(combatantGroups)
    .sort((a, b) => b.healingDone - a.healingDone);
  
  return {
    combatants
  };
}

/**
 * Generate a spell usage report
 * @param {Array} events - The events to analyze
 * @returns {Object} Spell usage report data
 */
export function generateSpellReport(events) {
  if (!events || events.length === 0) {
    return { casters: [], spells: [] };
  }
  
  // Get all spell cast events
  const spellEvents = events.filter(event => event.type === EventType.SPELL_CAST);
  
  // Group by caster
  const casterGroups = {};
  
  // Track spell usage
  const spellUsage = {};
  
  spellEvents.forEach(event => {
    if (!event.actorId || !event.spellName) return;
    
    // Track caster
    if (!casterGroups[event.actorId]) {
      casterGroups[event.actorId] = {
        id: event.actorId,
        name: event.actorName,
        type: event.actorType,
        spellsCast: 0,
        spellsByLevel: {
          0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0
        },
        favoriteSpell: null,
        favoriteSpellCount: 0
      };
    }
    
    casterGroups[event.actorId].spellsCast++;
    
    // Track spell level
    const level = event.spellLevel || 0;
    casterGroups[event.actorId].spellsByLevel[level]++;
    
    // Track spell usage
    const spellName = event.spellName;
    if (!spellUsage[spellName]) {
      spellUsage[spellName] = {
        name: spellName,
        count: 0,
        casters: new Set()
      };
    }
    
    spellUsage[spellName].count++;
    spellUsage[spellName].casters.add(event.actorId);
    
    // Update favorite spell
    const currentCount = casterGroups[event.actorId].favoriteSpellCount;
    const spellCount = spellEvents.filter(e => 
      e.actorId === event.actorId && e.spellName === spellName
    ).length;
    
    if (spellCount > currentCount) {
      casterGroups[event.actorId].favoriteSpell = spellName;
      casterGroups[event.actorId].favoriteSpellCount = spellCount;
    }
  });
  
  // Convert to arrays and sort
  const casters = Object.values(casterGroups)
    .sort((a, b) => b.spellsCast - a.spellsCast);
  
  const spells = Object.values(spellUsage)
    .map(spell => ({
      ...spell,
      casters: Array.from(spell.casters)
    }))
    .sort((a, b) => b.count - a.count);
  
  return {
    casters,
    spells
  };
}

/**
 * Generate a condition report
 * @param {Array} events - The events to analyze
 * @returns {Object} Condition report data
 */
export function generateConditionReport(events) {
  if (!events || events.length === 0) {
    return { conditions: [], combatants: [] };
  }
  
  // Get condition events
  const conditionAddedEvents = events.filter(event => event.type === EventType.CONDITION_ADDED);
  const conditionRemovedEvents = events.filter(event => event.type === EventType.CONDITION_REMOVED);
  
  // Track conditions by type
  const conditionCounts = {};
  
  conditionAddedEvents.forEach(event => {
    if (!event.conditionName) return;
    
    const conditionName = event.conditionName;
    if (!conditionCounts[conditionName]) {
      conditionCounts[conditionName] = {
        name: conditionName,
        count: 0,
        averageDuration: 0,
        totalDuration: 0,
        instances: 0
      };
    }
    
    conditionCounts[conditionName].count++;
    
    // Calculate duration if we can find a matching removal
    const removalEvent = conditionRemovedEvents.find(removal => 
      removal.targetId === event.targetId && 
      removal.conditionName === conditionName &&
      new Date(removal.timestamp) > new Date(event.timestamp)
    );
    
    if (removalEvent) {
      const durationMs = new Date(removalEvent.timestamp) - new Date(event.timestamp);
      const durationRounds = event.round && removalEvent.round ? 
        removalEvent.round - event.round : 
        Math.floor(durationMs / 60000); // Estimate 1 minute per round
      
      conditionCounts[conditionName].totalDuration += durationRounds;
      conditionCounts[conditionName].instances++;
    }
  });
  
  // Calculate average durations
  Object.values(conditionCounts).forEach(condition => {
    if (condition.instances > 0) {
      condition.averageDuration = condition.totalDuration / condition.instances;
    }
  });
  
  // Track conditions by combatant
  const combatantConditions = {};
  
  conditionAddedEvents.forEach(event => {
    if (!event.targetId || !event.conditionName) return;
    
    if (!combatantConditions[event.targetId]) {
      combatantConditions[event.targetId] = {
        id: event.targetId,
        name: event.targetName,
        type: event.targetType,
        conditionCount: 0,
        conditions: {}
      };
    }
    
    combatantConditions[event.targetId].conditionCount++;
    
    const conditionName = event.conditionName;
    if (!combatantConditions[event.targetId].conditions[conditionName]) {
      combatantConditions[event.targetId].conditions[conditionName] = 0;
    }
    
    combatantConditions[event.targetId].conditions[conditionName]++;
  });
  
  // Convert to arrays and sort
  const conditions = Object.values(conditionCounts)
    .sort((a, b) => b.count - a.count);
  
  const combatants = Object.values(combatantConditions)
    .sort((a, b) => b.conditionCount - a.conditionCount);
  
  return {
    conditions,
    combatants
  };
}

// Export the main history functions
export default {
  EventType,
  CombatHistory,
  createCombatHistory,
  formatEvent,
  getEventIcon,
  getEventColor,
  groupEventsByRound,
  groupEventsByCombatant,
  groupEventsByType,
  sortEventsByTime,
  filterEventsByTimeRange,
  searchEvents,
  calculateCombatantStats,
  generateTimelineData,
  generateDamageReport,
  generateHealingReport,
  generateSpellReport,
  generateConditionReport
};
