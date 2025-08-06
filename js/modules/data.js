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
  if (!this.app.db || !this.app.userId) {
    throw new Error("Firebase not initialized or user not authenticated");
  }
  
  const db = this.app.db;
  const userId = this.app.userId;
  
  try {
    // Import Firestore functions
    const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js");
    
    // Load heroes
    const heroesDocRef = doc(db, `users/${userId}/data/heroes`);
    const heroesDoc = await getDoc(heroesDocRef);
    if (heroesDoc.exists()) {
      this.heroes = heroesDoc.data().heroes || [];
    }
    
    // Load monsters
    const monstersDocRef = doc(db, `users/${userId}/data/monsters`);
    const monstersDoc = await getDoc(monstersDocRef);
    if (monstersDoc.exists()) {
      this.monsters = monstersDoc.data().monsters || [];
    }
    
    // Load encounters
    const encountersDocRef = doc(db, `users/${userId}/data/encounters`);
    const encountersDoc = await getDoc(encountersDocRef);
    if (encountersDoc.exists()) {
      this.encounters = encountersDoc.data().encounters || [];
    }
    
    console.log("Data loaded from Firebase");
  } catch (error) {
    console.error("Error loading from Firebase:", error);
    throw error;
  }
}

async saveToFirebase() {
  if (!this.app.db || !this.app.userId) {
    throw new Error("Firebase not initialized or user not authenticated");
  }
  
  const db = this.app.db;
  const userId = this.app.userId;
  
  try {
    // Import Firestore functions
    const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js");
    
    // Save heroes
    await setDoc(doc(db, `users/${userId}/data/heroes`), {
      heroes: this.heroes,
      updatedAt: new Date()
    });
    
    // Save monsters
    await setDoc(doc(db, `users/${userId}/data/monsters`), {
      monsters: this.monsters,
      updatedAt: new Date()
    });
    
    // Save encounters
    await setDoc(doc(db, `users/${userId}/data/encounters`), {
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
