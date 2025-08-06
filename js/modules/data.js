/**
 * Data Manager for Jesster's Combat Tracker
 * Handles data storage and retrieval
 */
export class DataManager {
  constructor(app) {
    this.app = app;
    this.heroRoster = [];
    this.monsterManual = [];
    this.parties = [];
    this.encounters = [];
    this.dicePresets = [];
  }
  
  async loadInitialData() {
    if (this.app.offlineMode) {
      this.loadFromLocalStorage();
    } else {
      // Data will be loaded via Firebase listeners
      // We don't need to do anything here
      console.log("Waiting for Firebase data...");
    }
  }
  
  loadFromLocalStorage() {
    this.heroRoster = JSON.parse(localStorage.getItem('jesstersRoster')) || [];
    this.monsterManual = JSON.parse(localStorage.getItem('jesstersManual')) || [];
    this.parties = JSON.parse(localStorage.getItem('jesstersParties')) || [];
    this.encounters = JSON.parse(localStorage.getItem('jesstersEncounters')) || [];
    this.dicePresets = JSON.parse(localStorage.getItem('jesstersDicePresets')) || [];
    
    console.log("Data loaded from local storage.");
  }
  
  saveToLocalStorage() {
    localStorage.setItem('jesstersRoster', JSON.stringify(this.heroRoster));
    localStorage.setItem('jesstersManual', JSON.stringify(this.monsterManual));
    localStorage.setItem('jesstersParties', JSON.stringify(this.parties));
    localStorage.setItem('jesstersEncounters', JSON.stringify(this.encounters));
    localStorage.setItem('jesstersDicePresets', JSON.stringify(this.dicePresets));
  }
  
    async saveHero(heroData) {
    if (this.app.offlineMode) {
      const existingIndex = this.heroRoster.findIndex(h => h.id === heroData.id);
      if (existingIndex > -1) {
        this.heroRoster[existingIndex] = heroData;
        this.app.logEvent(`Updated hero '${heroData.name}' in roster.`);
      } else {
        this.heroRoster.push(heroData);
        this.app.logEvent(`Saved new hero '${heroData.name}' to roster.`);
      }
      this.saveToLocalStorage();
      return true;
    } else if (this.app.userId) {
      try {
        const collectionPath = `artifacts/${this.app.appId}/users/${this.app.userId}/jesstersRoster`;
        const docRef = this.app.db.collection(collectionPath).doc(heroData.id);
        await docRef.set(heroData);
        this.app.logEvent(`Saved hero '${heroData.name}' to roster.`);
        return true;
      } catch (err) {
        console.error("Error saving hero:", err);
        this.app.showAlert("Failed to save hero to the database.");
        return false;
      }
    }
    return false;
  }
  
  async deleteHero(heroId) {
    const heroName = this.heroRoster.find(h => h.id === heroId)?.name || 'Unnamed Hero';
    
    if (this.app.offlineMode) {
      this.heroRoster = this.heroRoster.filter(h => h.id !== heroId);
      this.saveToLocalStorage();
      this.app.logEvent(`Deleted hero '${heroName}' from roster.`);
      return true;
    } else if (this.app.userId) {
      try {
        const collectionPath = `artifacts/${this.app.appId}/users/${this.app.userId}/jesstersRoster`;
        const docRef = this.app.db.collection(collectionPath).doc(heroId);
        await docRef.delete();
        this.app.logEvent(`Deleted hero '${heroName}' from roster.`);
        return true;
      } catch (err) {
        console.error("Error deleting hero:", err);
        this.app.showAlert("Failed to delete hero from the database.");
        return false;
      }
    }
    return false;
  }
  
  async saveMonster(monsterData) {
    if (this.app.offlineMode) {
      const existingIndex = this.monsterManual.findIndex(m => m.id === monsterData.id);
      if (existingIndex > -1) {
        this.monsterManual[existingIndex] = monsterData;
        this.app.logEvent(`Updated monster '${monsterData.name}' in manual.`);
      } else {
        this.monsterManual.push(monsterData);
        this.app.logEvent(`Saved new monster '${monsterData.name}' to manual.`);
      }
      this.saveToLocalStorage();
      return true;
    } else if (this.app.userId) {
      try {
        const collectionPath = `artifacts/${this.app.appId}/users/${this.app.userId}/jesstersManual`;
        const docRef = this.app.db.collection(collectionPath).doc(monsterData.id);
        await docRef.set(monsterData);
        this.app.logEvent(`Saved monster '${monsterData.name}' to manual.`);
        return true;
      } catch (err) {
        console.error("Error saving monster:", err);
        this.app.showAlert("Failed to save monster to the database.");
        return false;
      }
    }
    return false;
  }
  
  async deleteMonster(monsterId) {
    const monsterName = this.monsterManual.find(m => m.id === monsterId)?.name || 'Unnamed Monster';
    
    if (this.app.offlineMode) {
      this.monsterManual = this.monsterManual.filter(m => m.id !== monsterId);
      this.saveToLocalStorage();
      this.app.logEvent(`Deleted monster '${monsterName}' from manual.`);
      return true;
    } else if (this.app.userId) {
      try {
        const collectionPath = `artifacts/${this.app.appId}/users/${this.app.userId}/jesstersManual`;
        const docRef = this.app.db.collection(collectionPath).doc(monsterId);
        await docRef.delete();
        this.app.logEvent(`Deleted monster '${monsterName}' from manual.`);
        return true;
      } catch (err) {
        console.error("Error deleting monster:", err);
        this.app.showAlert("Failed to delete monster from the database.");
        return false;
      }
    }
    return false;
  }
  
  async saveParty(partyData) {
    const partyId = partyData.id || crypto.randomUUID();
    const dataToSave = { ...partyData, id: partyId };
    
    if (this.app.offlineMode) {
      const existingIndex = this.parties.findIndex(p => p.id === partyId);
      if (existingIndex > -1) {
        this.parties[existingIndex] = dataToSave;
        this.app.logEvent(`Updated party '${partyData.name}'.`);
      } else {
        this.parties.push(dataToSave);
        this.app.logEvent(`Saved new party '${partyData.name}'.`);
      }
      this.saveToLocalStorage();
      return true;
    } else if (this.app.userId) {
      try {
        const collectionPath = `artifacts/${this.app.appId}/users/${this.app.userId}/jesstersParties`;
        const docRef = this.app.db.collection(collectionPath).doc(partyId);
        await docRef.set(dataToSave);
        this.app.logEvent(`Saved party '${partyData.name}'.`);
        return true;
      } catch (err) {
        console.error("Error saving party:", err);
        this.app.showAlert("Failed to save party to the database.");
        return false;
      }
    }
    return false;
  }
  
  async deleteParty(partyId) {
    const partyName = this.parties.find(p => p.id === partyId)?.name || 'Unnamed Party';
    
    if (this.app.offlineMode) {
      this.parties = this.parties.filter(p => p.id !== partyId);
      this.saveToLocalStorage();
      this.app.logEvent(`Deleted party '${partyName}'.`);
      return true;
    } else if (this.app.userId) {
      try {
        const collectionPath = `artifacts/${this.app.appId}/users/${this.app.userId}/jesstersParties`;
        const docRef = this.app.db.collection(collectionPath).doc(partyId);
        await docRef.delete();
        this.app.logEvent(`Deleted party '${partyName}'.`);
        return true;
      } catch (err) {
        console.error("Error deleting party:", err);
        this.app.showAlert("Failed to delete party from the database.");
        return false;
      }
    }
    return false;
  }
  
  async saveEncounter(encounterData) {
    const encounterId = encounterData.id || crypto.randomUUID();
    const dataToSave = { ...encounterData, id: encounterId };
    
    if (this.app.offlineMode) {
      const existingIndex = this.encounters.findIndex(e => e.id === encounterId);
      if (existingIndex > -1) {
        this.encounters[existingIndex] = dataToSave;
        this.app.logEvent(`Updated encounter '${encounterData.name}'.`);
      } else {
        this.encounters.push(dataToSave);
        this.app.logEvent(`Saved new encounter '${encounterData.name}'.`);
      }
      this.saveToLocalStorage();
      return true;
    } else if (this.app.userId) {
      try {
        const collectionPath = `artifacts/${this.app.appId}/users/${this.app.userId}/jesstersEncounters`;
        const docRef = this.app.db.collection(collectionPath).doc(encounterId);
        await docRef.set(dataToSave);
        this.app.logEvent(`Saved encounter '${encounterData.name}'.`);
        return true;
      } catch (err) {
        console.error("Error saving encounter:", err);
        this.app.showAlert("Failed to save encounter to the database.");
        return false;
      }
    }
    return false;
  }
  
  async deleteEncounter(encounterId) {
    const encounterName = this.encounters.find(e => e.id === encounterId)?.name || 'Unnamed Encounter';
    
    if (this.app.offlineMode) {
      this.encounters = this.encounters.filter(e => e.id !== encounterId);
      this.saveToLocalStorage();
      this.app.logEvent(`Deleted encounter '${encounterName}'.`);
      return true;
    } else if (this.app.userId) {
      try {
        const collectionPath = `artifacts/${this.app.appId}/users/${this.app.userId}/jesstersEncounters`;
        const docRef = this.app.db.collection(collectionPath).doc(encounterId);
        await docRef.delete();
        this.app.logEvent(`Deleted encounter '${encounterName}'.`);
        return true;
      } catch (err) {
        console.error("Error deleting encounter:", err);
        this.app.showAlert("Failed to delete encounter from the database.");
        return false;
      }
    }
    return false;
  }
  
  async saveDicePreset(presetData) {
    const presetId = presetData.id || crypto.randomUUID();
    const dataToSave = { ...presetData, id: presetId };
    
    if (this.app.offlineMode) {
      const existingIndex = this.dicePresets.findIndex(p => p.id === presetId);
      if (existingIndex > -1) {
        this.dicePresets[existingIndex] = dataToSave;
      } else {
        this.dicePresets.push(dataToSave);
      }
      this.saveToLocalStorage();
      return true;
    } else if (this.app.userId) {
      try {
        const collectionPath = `artifacts/${this.app.appId}/users/${this.app.userId}/jesstersDicePresets`;
        const docRef = this.app.db.collection(collectionPath).doc(presetId);
        await docRef.set(dataToSave);
        return true;
      } catch (err) {
        console.error("Error saving dice preset:", err);
        this.app.showAlert("Failed to save dice preset to the database.");
        return false;
      }
    }
    return false;
  }
  
  async deleteDicePreset(presetId) {
    if (this.app.offlineMode) {
      this.dicePresets = this.dicePresets.filter(p => p.id !== presetId);
      this.saveToLocalStorage();
      return true;
    } else if (this.app.userId) {
      try {
        const collectionPath = `artifacts/${this.app.appId}/users/${this.app.userId}/jesstersDicePresets`;
        const docRef = this.app.db.collection(collectionPath).doc(presetId);
        await docRef.delete();
        return true;
      } catch (err) {
        console.error("Error deleting dice preset:", err);
        this.app.showAlert("Failed to delete dice preset from the database.");
        return false;
      }
    }
    return false;
  }
}
