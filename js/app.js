/**
 * Jesster's Combat Tracker
 * Main Application
 * 
 * @version 2.0.0
 * @author Jesster
 */
class JessterCombatTracker {
    constructor() {
        console.log("Initializing Jesster's Combat Tracker v2.0.0");
        
        // Initialize state
        this.state = {
            combatStarted: false,
            roundNumber: 1,
            currentTurn: null,
            combatLog: [],
            normalInitiativeOrder: [],
            currentNormalInitiativeIndex: 0,
            combatStartTime: null,
            playerViewWindow: null,
            version: '2.0.0'
        };
        
        // Initialize modules
        this.utils = new Utils(this);
        this.storage = new StorageManager(this);
        this.api = new ApiManager(this);
        this.ui = new UIManager(this);
        this.dice = new DiceRoller(this);
        this.combat = new CombatManager(this);
        this.conditions = new ConditionsManager(this);
        this.damage = new DamageTracker(this);
        this.saves = new SavingThrowManager(this);
        this.actions = new ActionEconomyTracker(this);
        this.legendary = new LegendaryActionsTracker(this);
        this.lair = new LairActionsTracker(this);
        this.notes = new CombatNotesManager(this);
        this.stats = new CombatStatisticsManager(this);
        this.spells = new SpellTracker(this);
        this.audio = new AudioManager(this);
        this.export = new ExportManager(this);
        this.settings = new SettingsManager(this);
        this.keyboard = new KeyboardManager(this);
        this.help = new HelpManager(this);
        
        // Initialize the app
        this.init();
    }
    
    /**
     * Initialize the application
     */
    async init() {
        try {
            // Load settings first
            await this.settings.loadSettings();
            
            // Initialize UI
            this.ui.init();
            
            // Initialize modules that need initialization
            await Promise.all([
                this.storage.init(),
                this.api.init(),
                this.conditions.init(),
                this.spells.init(),
                this.audio.init(),
                this.keyboard.init(),
                this.help.init()
            ]);
            
            // Set up event listeners
            this.ui.setupEventListeners();
            
            // Log initialization
            this.logEvent("Combat Tracker initialized.");
            console.log("Jesster's Combat Tracker initialized successfully");
        } catch (error) {
            console.error("Error initializing application:", error);
            this.ui.showAlert("Error initializing application. Check console for details.", "Initialization Error");
        }
    }
    
    /**
     * Log an event to the combat log
     * @param {string} message - The message to log
     */
    logEvent(message) {
        // Add timestamp
        const now = new Date();
        const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        const logEntry = `[${timestamp}] ${message}`;
        
        // Add to log
        this.state.combatLog.push(logEntry);
        
        // Update the UI
        if (this.ui && typeof this.ui.renderCombatLog === 'function') {
            this.ui.renderCombatLog();
        }
    }
    
    /**
     * Show an alert message
     * @param {string} message - The message to show
     * @param {string} [title='Notification'] - The title of the alert
     */
    showAlert(message, title = 'Notification') {
        if (this.ui && typeof this.ui.showAlert === 'function') {
            this.ui.showAlert(message, title);
        } else {
            // Fallback to browser alert
            alert(`${title}: ${message}`);
        }
    }
    
    /**
     * Show a confirmation dialog
     * @param {string} message - The message to show
     * @param {Function} onConfirm - The function to call when confirmed
     * @param {string} [title='Confirm'] - The title of the confirmation
     */
    showConfirm(message, onConfirm, title = 'Confirm') {
        if (this.ui && typeof this.ui.showConfirm === 'function') {
            this.ui.showConfirm(message, onConfirm, title);
        } else {
            // Fallback to browser confirm
            if (confirm(message)) {
                onConfirm();
            }
        }
    }
    
    /**
     * Get the current combat duration as a formatted string
     * @returns {string} - The formatted duration
     */
    getCombatDuration() {
        if (!this.state.combatStartTime) return '0m 0s';
        
        const now = new Date();
        const durationMs = now - this.state.combatStartTime;
        
        return this.utils.formatTime(durationMs);
    }
    
    /**
     * Update the player view window
     */
    updatePlayerView() {
        if (this.state.playerViewWindow && !this.state.playerViewWindow.closed) {
            const htmlContent = this.ui.generatePlayerViewHTML();
            this.state.playerViewWindow.document.open();
            this.state.playerViewWindow.document.write(htmlContent);
            this.state.playerViewWindow.document.close();
        }
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.jessterCombatTracker = new JessterCombatTracker();
});
