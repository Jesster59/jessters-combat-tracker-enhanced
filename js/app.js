// js/app.js - CORRECTED VERSION

// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Import our modules
import { UIManager } from "./modules/ui.js";
import { CombatManager } from "./modules/combat.js";
import { RosterManager } from "./modules/roster.js";
import { MonsterManager } from "./modules/monsters.js";
import { DiceManager } from "./modules/dice.js";
import { DataManager } from "./modules/data.js";
import { AudioManager } from "./modules/audio.js";
import { ThemeManager } from "./modules/theme.js";
import { ActionHistory } from "./modules/history.js";
import { SpellTracker } from "./modules/spells.js";
import { EncounterBuilder } from "./modules/encounter.js";

/**
 * Main application class for Jesster's Combat Tracker Enhanced
 */
class JesstersCombatTracker {
  constructor() {
    this.version = "3.0.2"; // Updated version number
    this.elements = {};
    this.state = {
      combatLog: [],
      combatStarted: false,
      currentTurn: null,
      roundNumber: 1
    };
    
    // Firebase related properties
    this.firebase = null;
    this.db = null;
    this.auth = null;
    this.userId = null;
    this.offlineMode = false;
    
    // Initialize managers
    this.ui = new UIManager(this);
    this.combat = new CombatManager(this);
    this.roster = new RosterManager(this);
    this.monsters = new MonsterManager(this);
    this.dice = new DiceManager(this);
    this.data = new DataManager(this);
    this.audio = new AudioManager(this);
    this.theme = new ThemeManager(this);
    this.history = new ActionHistory(this);
    this.spells = new SpellTracker(this);
    this.encounter = new EncounterBuilder(this);
    
    console.log(`Jesster's Combat Tracker v${this.version} initializing...`);
  }
  
  async init() {
    try {
      // --- CORRECTED ORDER OF OPERATIONS ---

      // 1. Render the main UI structure into the placeholder div
      this.ui.renderInitialUI();

      // 2. NOW that the elements exist, cache them
      this.ui.cacheDOMElements();
      
      // 3. NOW that we have references, set up the event listeners
      this.ui.setupEventListeners();

      // Initialize Firebase if config is available
      if (typeof __firebase_config !== 'undefined') {
        await this.initFirebase();
      } else {
        this.offlineMode = true;
        console.log("Firebase config not found. Running in offline mode.");
      }
      
      // Initialize managers that need initialization
      this.theme.init();
      this.audio.init();
      
      // Load data
      await this.data.loadInitialData();
      
      this.logEvent(`Jesster's Combat Tracker v${this.version} initialized successfully.`);
      console.log(`Jesster's Combat Tracker v${this.version} initialized successfully.`);

    } catch (error) {
      console.error("Error initializing application:", error);
      this.offlineMode = true;
      this.logEvent(`Error initializing application: ${error.message}. Running in offline mode.`);
      
      // Still try to initialize UI in offline mode
      this.ui.renderInitialUI();
      this.ui.cacheDOMElements();
      this.ui.setupEventListeners();
    }
  }
  
  async initFirebase() {
    try {
      const app = initializeApp(__firebase_config);
      this.firebase = app;
      this.db = getFirestore(app);
      this.auth = getAuth(app);
      
      // Try to sign in anonymously
      const userCredential = await signInAnonymously(this.auth);
      this.userId = userCredential.user.uid;
      
      // Listen for auth state changes
      onAuthStateChanged(this.auth, (user) => {
        if (user) {
          this.userId = user.uid;
          console.log("Firebase authenticated. User ID:", this.userId);
        } else {
          this.userId = null;
          console.log("Firebase user signed out.");
        }
      });
      
      console.log("Firebase initialized successfully.");
      return true;
    } catch (error) {
      console.error("Firebase initialization failed:", error);
      this.offlineMode = true;
      return false;
    }
  }
  
  logEvent(message) {
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
    this.state.combatLog.push(`[${timestamp}] ${message}`);
    this.ui.renderCombatLog();
  }
  
  showAlert(message, title = 'Notification') {
    this.ui.showAlert(message, title);
    this.logEvent(`Alert: ${title} - ${message}`);
  }
  
  showConfirm(message, onConfirm) {
    this.ui.showConfirm(message, onConfirm);
  }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new JesstersCombatTracker();
  app.init();
  
  // Make app available globally for debugging
  window.jessterApp = app;
});
