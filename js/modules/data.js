/**
 * Data Manager for Jesster's Combat Tracker
 * Handles data storage and retrieval
 */
export class DataManager {
  constructor(app) {
    this.app = app;
    this.heroes = [];
    this.monsters = [];
    this.encounters = [];
  }
  
  async loadInitialData() {
    console.log("Waiting for Firebase data...");
    
    try {
      if (this.app.offlineMode) {
        // Load from localStorage in offline mode
        this.loadFromLocalStorage();
      } else {
        // Try to load from Firebase
        await this.loadFromFirebase();
      }
      
      console.log("Data loaded successfully");
    } catch (error) {
      console.error("Error loading data:", error);
      
      // Fall back to localStorage
      this.loadFromLocalStorage();
    }
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
  
  async loadFromFirebase() {
    // This would be implemented in a real application
    // For now, just fall back to localStorage
    this.loadFromLocalStorage();
  }
  
  saveToLocalStorage() {
    try {
      localStorage.setItem('jesster_heroes', JSON.stringify(this.heroes));
      localStorage.setItem('jesster_monsters', JSON.stringify(this.monsters));
      localStorage.setItem('jesster_encounters', JSON.stringify(this.encounters));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      this.app.showAlert("Could not save data to localStorage. Your browser may have storage restrictions enabled.");
    }
  }
}
