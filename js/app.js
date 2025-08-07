/**
 * Main Application for Jesster's Combat Tracker
 */
class CombatTrackerApp {
    constructor() {
        // App state
        this.state = {
            version: '1.0.0',
            combatStarted: false,
            combatStartTime: null,
            roundNumber: 1,
            currentTurn: null,
            combatLog: [],
            playerViewWindow: null
        };
        
        // Initialize modules
        this.utils = new Utils(this);
        this.storage = new StorageManager(this);
        this.ui = new UIManager(this);
        this.combat = new CombatManager(this);
        this.dice = new DiceRoller(this);
        this.damage = new DamageTracker(this);
        this.conditions = new ConditionsManager(this);
        this.audio = new AudioManager(this);
        this.settings = new SettingsManager(this);
        this.keyboard = new KeyboardManager(this);
        this.help = new HelpManager(this);
        this.export = new ExportManager(this);
        this.api = new APIManager(this);
        
        console.log("Combat Tracker App initialized");
    }
    
    /**
     * Initialize the application
     */
    async init() {
        try {
            // Initialize storage first
            await this.storage.init();
            
            // Load settings
            await this.settings.loadSettings();
            
            // Initialize other modules
            await this.conditions.init();
            await this.audio.init();
            await this.keyboard.init();
            await this.help.init();
            
            // Initialize UI last
            await this.ui.init();
            
            // Add keyboard event listener
            document.addEventListener('keydown', (event) => {
                this.keyboard.handleKeyDown(event);
            });
            
            // Log initialization
            this.logEvent('Application initialized');
            console.log("Combat Tracker App ready");
        } catch (error) {
            console.error("Error initializing app:", error);
        }
    }
    
    /**
     * Log an event to the combat log
     * @param {string} message - The message to log
     */
    logEvent(message) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `[${timestamp}] ${message}`;
        
        this.state.combatLog.push(logEntry);
        if (this.ui && typeof this.ui.renderCombatLog === 'function') {
            this.ui.renderCombatLog();
        }
    }
    
    /**
     * Show an alert message
     * @param {string} message - The message to show
     * @param {string} [title='Alert'] - The title of the alert
     */
    showAlert(message, title = 'Alert') {
        if (this.ui && typeof this.ui.showAlert === 'function') {
            this.ui.showAlert(message, title);
        } else {
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
            if (confirm(`${title}: ${message}`)) {
                onConfirm();
            }
        }
    }
    
    /**
     * Update the player view
     */
    updatePlayerView() {
        if (this.state.playerViewWindow && !this.state.playerViewWindow.closed) {
            if (this.ui && typeof this.ui.generatePlayerViewHTML === 'function') {
                const html = this.ui.generatePlayerViewHTML();
                this.state.playerViewWindow.document.open();
                this.state.playerViewWindow.document.write(html);
                this.state.playerViewWindow.document.close();
            }
        }
    }
}
