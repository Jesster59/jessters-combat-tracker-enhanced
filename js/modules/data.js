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
}
