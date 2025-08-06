/**
 * Data Manager for Jesster's Combat Tracker
 * Handles data storage and retrieval
 */
class DataManager {
  constructor(app) {
    this.app = app;
    this.heroes = [];
    this.monsters = [];
    this.encounters = [];
  }
  
  loadInitialData() {
    console.log("Loading initial data...");
    this.loadFromLocalStorage();
    return Promise.resolve(); // Return a resolved promise for async compatibility
  }
  
  loadFromLocalStorage() {
    try {
      // Load heroes
      const heroesJson = localStorage.getItem('jesster_heroes');
      if (heroesJson) {
        this.heroes = JSON.parse(heroesJson);
      }
      
      // Load monsters
      const monstersJson = localStorage.getItem('jesster_monsters');
      if (monstersJson) {
        this.monsters = JSON.parse(monstersJson);
      }
      
      // Load encounters
      const encountersJson = localStorage.getItem('jesster_encounters');
      if (encountersJson) {
        this.encounters = JSON.parse(encountersJson);
      }
      
      console.log("Data loaded from localStorage");
    } catch (error) {
      console.error("Error loading from localStorage:", error);
    }
  }
  
  saveToLocalStorage() {
    try {
      localStorage.setItem('jesster_heroes', JSON.stringify(this.heroes));
      localStorage.setItem('jesster_monsters', JSON.stringify(this.monsters));
      localStorage.setItem('jesster_encounters', JSON.stringify(this.encounters));
      console.log("Data saved to localStorage");
      return true;
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      return false;
    }
  }
  
  loadFromFirebase() {
    if (!this.app.db || !this.app.userId) {
      throw new Error("Firebase not initialized or user not authenticated");
    }
    
    const db = this.app.db;
    const userId = this.app.userId;
    
    try {
      // Load heroes
      db.collection('users').doc(userId).collection('data').doc('heroes').get()
        .then(doc => {
          if (doc.exists) {
            this.heroes = doc.data().heroes || [];
          }
        });
      
      // Load monsters
      db.collection('users').doc(userId).collection('data').doc('monsters').get()
        .then(doc => {
          if (doc.exists) {
            this.monsters = doc.data().monsters || [];
          }
        });
      
      // Load encounters
      db.collection('users').doc(userId).collection('data').doc('encounters').get()
        .then(doc => {
          if (doc.exists) {
            this.encounters = doc.data().encounters || [];
          }
        });
      
      console.log("Data loaded from Firebase");
    } catch (error) {
      console.error("Error loading from Firebase:", error);
      throw error;
    }
  }
  
  saveToFirebase() {
    if (!this.app.db || !this.app.userId) {
      throw new Error("Firebase not initialized or user not authenticated");
    }
    
    const db = this.app.db;
    const userId = this.app.userId;
    
    try {
      // Save heroes
      db.collection('users').doc(userId).collection('data').doc('heroes').set({
        heroes: this.heroes,
        updatedAt: new Date()
      });
      
      // Save monsters
      db.collection('users').doc(userId).collection('data').doc('monsters').set({
        monsters: this.monsters,
        updatedAt: new Date()
      });
      
      // Save encounters
      db.collection('users').doc(userId).collection('data').doc('encounters').set({
        encounters: this.encounters,
        updatedAt: new Date()
      });
      
      console.log("Data saved to Firebase");
      return true;
    } catch (error) {
      console.error("Error saving to Firebase:", error);
      throw error;
    }
  }
  
  saveData() {
    if (this.app.offlineMode) {
      // Save to localStorage in offline mode
      return this.saveToLocalStorage();
    } else {
      // Try to save to Firebase
      try {
        this.saveToFirebase();
        // Also save to localStorage as backup
        this.saveToLocalStorage();
        return true;
      } catch (error) {
        console.error("Error saving to Firebase:", error);
        // Fall back to localStorage
        return this.saveToLocalStorage();
      }
    }
  }
  
  // Methods to add/update/delete heroes
  addHero(hero) {
    // Generate ID if not provided
    if (!hero.id) {
      hero.id = `hero-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    }
    
    this.heroes.push(hero);
    this.saveData();
    return hero;
  }
  
  updateHero(heroId, updatedHero) {
    const index = this.heroes.findIndex(h => h.id === heroId);
    if (index >= 0) {
      this.heroes[index] = { ...this.heroes[index], ...updatedHero };
      this.saveData();
      return this.heroes[index];
    }
    return null;
  }
  
  deleteHero(heroId) {
    const index = this.heroes.findIndex(h => h.id === heroId);
    if (index >= 0) {
      const deleted = this.heroes.splice(index, 1)[0];
      this.saveData();
      return deleted;
    }
    return null;
  }
  
  // Methods to add/update/delete custom monsters
  addCustomMonster(monster) {
    // Generate ID if not provided
    if (!monster.id) {
      monster.id = `monster-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    }
    
    this.monsters.push(monster);
    this.saveData();
    return monster;
  }
  
  updateCustomMonster(monsterId, updatedMonster) {
    const index = this.monsters.findIndex(m => m.id === monsterId);
    if (index >= 0) {
      this.monsters[index] = { ...this.monsters[index], ...updatedMonster };
      this.saveData();
      return this.monsters[index];
    }
    return null;
  }
  
  deleteCustomMonster(monsterId) {
    const index = this.monsters.findIndex(m => m.id === monsterId);
    if (index >= 0) {
      const deleted = this.monsters.splice(index, 1)[0];
      this.saveData();
      return deleted;
    }
    return null;
  }
}
