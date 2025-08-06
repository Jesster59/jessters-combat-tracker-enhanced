/**
 * Main application class for Jesster's Combat Tracker Enhanced
 */
class JesstersCombatTracker {
  constructor() {
    this.version = "3.0.6"; // Updated version number
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
    
    console.log("Jesster's Combat Tracker v" + this.version + " initializing...");
  }
  
  async init() {
    try {
      // First, directly render the UI without relying on cached elements
      console.log("Rendering initial UI...");
      const appContainer = document.getElementById('app-container');
      if (!appContainer) {
        throw new Error("Fatal error: #app-container not found in the document");
      }
      
      // Render the UI directly
      this.ui.renderInitialUI(appContainer);
      
      // Give the browser a moment to render the UI before caching elements
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Now that the UI is rendered, cache the elements
      console.log("Caching DOM elements...");
      this.ui.cacheDOMElements();
      
      // Set up event listeners
      console.log("Setting up event listeners...");
      this.ui.setupEventListeners();

      // Initialize Firebase
      try {
        const firebaseInitialized = this.initFirebase();
        if (!firebaseInitialized) {
          this.offlineMode = true;
          console.log("Running in offline mode due to Firebase initialization failure.");
          this.logEvent("Running in offline mode. Your data will be saved locally.");
        }
      } catch (error) {
        this.offlineMode = true;
        console.error("Firebase initialization error:", error);
        this.logEvent("Firebase error. Running in offline mode.");
      }
      
      // Initialize managers that need initialization
      this.theme.init();
      this.audio.init();
      
      // Load data
      await this.data.loadInitialData();
      
      this.logEvent("Jesster's Combat Tracker v" + this.version + " initialized successfully.");
      console.log("Jesster's Combat Tracker v" + this.version + " initialized successfully.");

    } catch (error) {
      console.error("Error initializing application:", error);
      this.offlineMode = true;
      
      // Try to log the error if the UI is available
      try {
        this.logEvent("Error initializing application: " + error.message + ". Running in offline mode.");
      } catch (e) {
        // If logging fails, just console.error
        console.error("Could not log error to UI:", e);
      }
    }
  }
  
  initFirebase() {
    try {
      console.log("Initializing Firebase...");
      
      // Use the globally available Firebase objects
      if (typeof firebase === 'undefined') {
        console.error("Firebase is not defined. Make sure Firebase scripts are loaded.");
        return false;
      }
      
      this.firebase = firebase;
      this.db = firebase.firestore();
      this.auth = firebase.auth();
      
      // Try to sign in anonymously
      console.log("Signing in anonymously...");
      var self = this;
      this.auth.signInAnonymously().then(function(userCredential) {
        self.userId = userCredential.user.uid;
        console.log("Firebase authenticated. User ID:", self.userId);
      }).catch(function(error) {
        console.error("Anonymous sign-in failed:", error);
        self.offlineMode = true;
      });
      
      // Listen for auth state changes
      this.auth.onAuthStateChanged(function(user) {
        if (user) {
          self.userId = user.uid;
          console.log("Firebase authenticated. User ID:", self.userId);
        } else {
          self.userId = null;
          console.log("Firebase user signed out.");
          self.offlineMode = true;
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
    var timestamp = new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
    this.state.combatLog.push("[" + timestamp + "] " + message);
    this.ui.renderCombatLog();
  }
  
  showAlert(message, title) {
    if (!title) title = 'Notification';
    this.ui.showAlert(message, title);
    this.logEvent("Alert: " + title + " - " + message);
  }
  
  showConfirm(message, onConfirm) {
    this.ui.showConfirm(message, onConfirm);
  }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  var app = new JesstersCombatTracker();
  app.init();
  
  // Make app available globally for debugging
  window.jessterApp = app;
});
