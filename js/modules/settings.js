/**
 * Settings module for Jesster's Combat Tracker
 * Handles application configuration and user preferences
 */
class Settings {
    constructor(storage) {
        // Store reference to the storage module
        this.storage = storage;
        
        // Default settings
        this.defaults = {
            // General settings
            theme: 'dark',
            fontSize: 'medium',
            soundEnabled: true,
            musicEnabled: false,
            volume: 0.5,
            musicVolume: 0.3,
            confirmations: true,
            autoSave: true,
            autoSaveInterval: 5, // minutes
            
            // Combat settings
            initiativeSystem: 'standard', // standard, group, popcorn, side
            showModifiers: true,
            criticalHitRule: 'double', // double, max
            autoEndTurn: false,
            turnTimer: false,
            turnTimerDuration: 60, // seconds
            turnTimerWarning: 10, // seconds
            turnTimerAutoEnd: false,
            
            // Monster settings
            monsterHpMode: 'average', // average, roll, max
            monsterGroupInitiative: true,
            monsterNameNumbers: true,
            autoGenerateMonsterImages: false,
            monsterImageStyle: 'fantasy',
            
            // Player view settings
            playerViewEnabled: false,
            playerViewTheme: 'dungeon',
            playerViewHpMode: 'descriptive', // exact, descriptive, hidden
            playerViewShowAC: true,
            playerViewShowConditions: true,
            playerViewShowTimer: false,
            
            // Dice settings
            diceAnimations: true,
            diceSound: true,
            advantageMode: 'query', // query, advantage, disadvantage, normal
            showDiceFormulas: true,
            keepDiceHistory: true,
            maxDiceHistory: 20,
            
            // API settings
            useOpen5e: true,
            useDndBeyond: false,
            dndBeyondKey: '',
            geminiApiKey: '',
            
            // Advanced settings
            debugMode: false,
            experimentalFeatures: false,
            cloudSync: false,
            dataRetention: 30, // days
            
            // Accessibility settings
            highContrast: false,
            reducedMotion: false,
            largeTargets: false,
            screenReaderHints: false
        };
        
        // Current settings (will be loaded from storage)
        this.current = { ...this.defaults };
        
        // Initialize settings
        this.init();
        
        console.log("Settings module initialized");
    }

    /**
     * Initialize settings
     */
    async init() {
        // Load settings from storage
        const savedSettings = await this.storage.load('settings', { useLocalStorage: true });
        
        if (savedSettings) {
            // Merge saved settings with defaults (to ensure new settings are included)
            this.current = { ...this.defaults, ...savedSettings };
        }
        
        // Save merged settings back to storage
        await this.save();
    }

    /**
     * Save current settings to storage
     * @returns {Promise<boolean>} Success status
     */
    async save() {
        return await this.storage.save('settings', this.current, { useLocalStorage: true });
    }

    /**
     * Get a setting value
     * @param {string} key - Setting key
     * @param {any} defaultValue - Default value if setting is not found
     * @returns {any} Setting value
     */
    get(key, defaultValue = null) {
        return this.current[key] !== undefined ? this.current[key] : defaultValue;
    }

    /**
     * Set a setting value
     * @param {string} key - Setting key
     * @param {any} value - Setting value
     * @returns {Promise<boolean>} Success status
     */
    async set(key, value) {
        this.current[key] = value;
        return await this.save();
    }

    /**
     * Update multiple settings at once
     * @param {Object} settings - Settings object
     * @returns {Promise<boolean>} Success status
     */
    async update(settings) {
        this.current = { ...this.current, ...settings };
        return await this.save();
    }

    /**
     * Reset settings to defaults
     * @returns {Promise<boolean>} Success status
     */
    async reset() {
        this.current = { ...this.defaults };
        return await this.save();
    }

    /**
     * Reset a specific setting to its default value
     * @param {string} key - Setting key
     * @returns {Promise<boolean>} Success status
     */
    async resetSetting(key) {
        if (this.defaults[key] !== undefined) {
            this.current[key] = this.defaults[key];
            return await this.save();
        }
        return false;
    }

    /**
     * Export settings as JSON
     * @returns {string} JSON string
     */
    exportSettings() {
        return JSON.stringify(this.current, null, 2);
    }

    /**
     * Import settings from JSON
     * @param {string} json - JSON string
     * @returns {Promise<boolean>} Success status
     */
    async importSettings(json) {
        try {
            const settings = JSON.parse(json);
            // Validate settings before importing
            if (typeof settings !== 'object' || settings === null) {
                throw new Error('Invalid settings format');
            }
            
            // Merge with defaults to ensure all required settings exist
            this.current = { ...this.defaults, ...settings };
            return await this.save();
        } catch (error) {
            console.error('Error importing settings:', error);
            return false;
        }
    }

    /**
     * Get all settings
     * @returns {Object} All settings
     */
    getAll() {
        return { ...this.current };
    }

    /**
     * Get default settings
     * @returns {Object} Default settings
     */
    getDefaults() {
        return { ...this.defaults };
    }

    /**
     * Check if a setting exists
     * @param {string} key - Setting key
     * @returns {boolean} True if setting exists
     */
    has(key) {
        return this.current[key] !== undefined;
    }

    /**
     * Get settings by category
     * @param {string} category - Category name (general, combat, monster, etc.)
     * @returns {Object} Category settings
     */
    getCategory(category) {
        const categorySettings = {};
        
        // Define which settings belong to each category
        const categories = {
            general: [
                'theme', 'fontSize', 'soundEnabled', 'musicEnabled', 
                'volume', 'musicVolume', 'confirmations', 'autoSave', 
                'autoSaveInterval'
            ],
            combat: [
                'initiativeSystem', 'showModifiers', 'criticalHitRule',
                'autoEndTurn', 'turnTimer', 'turnTimerDuration',
                'turnTimerWarning', 'turnTimerAutoEnd'
            ],
            monster: [
                'monsterHpMode', 'monsterGroupInitiative', 'monsterNameNumbers',
                'autoGenerateMonsterImages', 'monsterImageStyle'
            ],
            playerView: [
                'playerViewEnabled', 'playerViewTheme', 'playerViewHpMode',
                'playerViewShowAC', 'playerViewShowConditions', 'playerViewShowTimer'
            ],
            dice: [
                'diceAnimations', 'diceSound', 'advantageMode',
                'showDiceFormulas', 'keepDiceHistory', 'maxDiceHistory'
            ],
            api: [
                'useOpen5e', 'useDndBeyond', 'dndBeyondKey', 'geminiApiKey'
            ],
            advanced: [
                'debugMode', 'experimentalFeatures', 'cloudSync', 'dataRetention'
            ],
            accessibility: [
                'highContrast', 'reducedMotion', 'largeTargets', 'screenReaderHints'
            ]
        };
        
        // Get settings for the specified category
        if (categories[category]) {
            categories[category].forEach(key => {
                categorySettings[key] = this.current[key];
            });
        }
        
        return categorySettings;
    }

    /**
     * Apply theme based on current settings
     */
    applyTheme() {
        // Remove any existing theme classes
        document.body.classList.remove('theme-dark', 'theme-light', 'theme-custom');
        
        // Add the current theme class
        document.body.classList.add(`theme-${this.current.theme}`);
        
        // Apply high contrast if enabled
        if (this.current.highContrast) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
        
        // Apply font size
        document.body.classList.remove('font-small', 'font-medium', 'font-large');
        document.body.classList.add(`font-${this.current.fontSize}`);
        
        // Apply reduced motion if enabled
        if (this.current.reducedMotion) {
            document.body.classList.add('reduced-motion');
        } else {
            document.body.classList.remove('reduced-motion');
        }
        
        // Apply large targets if enabled
        if (this.current.largeTargets) {
            document.body.classList.add('large-targets');
        } else {
            document.body.classList.remove('large-targets');
        }
    }

    /**
     * Get D&D Beyond API key
     * @returns {string} API key
     */
    getDndBeyondKey() {
        return this.current.dndBeyondKey || '';
    }

    /**
     * Get Gemini API key
     * @returns {string} API key
     */
    getGeminiApiKey() {
        return this.current.geminiApiKey || '';
    }

    /**
     * Check if debug mode is enabled
     * @returns {boolean} True if debug mode is enabled
     */
    isDebugMode() {
        return this.current.debugMode === true;
    }

    /**
     * Check if experimental features are enabled
     * @returns {boolean} True if experimental features are enabled
     */
    areExperimentalFeaturesEnabled() {
        return this.current.experimentalFeatures === true;
    }

    /**
     * Check if cloud sync is enabled
     * @returns {boolean} True if cloud sync is enabled
     */
    isCloudSyncEnabled() {
        return this.current.cloudSync === true;
    }

    /**
     * Get the data retention period in days
     * @returns {number} Data retention period in days
     */
    getDataRetentionDays() {
        return this.current.dataRetention || 30;
    }

    /**
     * Check if sounds are enabled
     * @returns {boolean} True if sounds are enabled
     */
    areSoundsEnabled() {
        return this.current.soundEnabled === true;
    }

    /**
     * Check if music is enabled
     * @returns {boolean} True if music is enabled
     */
    isMusicEnabled() {
        return this.current.musicEnabled === true;
    }

    /**
     * Get the volume level
     * @returns {number} Volume level (0-1)
     */
    getVolume() {
        return this.current.volume;
    }

    /**
     * Get the music volume level
     * @returns {number} Music volume level (0-1)
     */
    getMusicVolume() {
        return this.current.musicVolume;
    }

    /**
     * Check if confirmations are enabled
     * @returns {boolean} True if confirmations are enabled
     */
    areConfirmationsEnabled() {
        return this.current.confirmations === true;
    }

    /**
     * Check if auto-save is enabled
     * @returns {boolean} True if auto-save is enabled
     */
    isAutoSaveEnabled() {
        return this.current.autoSave === true;
    }

    /**
     * Get the auto-save interval in minutes
     * @returns {number} Auto-save interval in minutes
     */
    getAutoSaveInterval() {
        return this.current.autoSaveInterval || 5;
    }

    /**
     * Get the initiative system
     * @returns {string} Initiative system
     */
    getInitiativeSystem() {
        return this.current.initiativeSystem || 'standard';
    }

    /**
     * Check if modifiers should be shown
     * @returns {boolean} True if modifiers should be shown
     */
    shouldShowModifiers() {
        return this.current.showModifiers === true;
    }

    /**
     * Get the critical hit rule
     * @returns {string} Critical hit rule
     */
    getCriticalHitRule() {
        return this.current.criticalHitRule || 'double';
    }

    /**
     * Check if turn should end automatically
     * @returns {boolean} True if turn should end automatically
     */
    shouldAutoEndTurn() {
        return this.current.autoEndTurn === true;
    }

    /**
     * Check if turn timer is enabled
     * @returns {boolean} True if turn timer is enabled
     */
    isTurnTimerEnabled() {
        return this.current.turnTimer === true;
    }

    /**
     * Get the turn timer duration in seconds
     * @returns {number} Turn timer duration in seconds
     */
    getTurnTimerDuration() {
        return this.current.turnTimerDuration || 60;
    }

    /**
     * Get the turn timer warning threshold in seconds
     * @returns {number} Turn timer warning threshold in seconds
     */
    getTurnTimerWarning() {
        return this.current.turnTimerWarning || 10;
    }

    /**
     * Check if turn timer should end turn automatically
     * @returns {boolean} True if turn timer should end turn automatically
     */
    shouldTurnTimerAutoEnd() {
        return this.current.turnTimerAutoEnd === true;
    }

    /**
     * Get the monster HP mode
     * @returns {string} Monster HP mode
     */
    getMonsterHpMode() {
        return this.current.monsterHpMode || 'average';
    }

    /**
     * Check if monster group initiative is enabled
     * @returns {boolean} True if monster group initiative is enabled
     */
    isMonsterGroupInitiativeEnabled() {
        return this.current.monsterGroupInitiative === true;
    }

    /**
     * Check if monster names should include numbers
     * @returns {boolean} True if monster names should include numbers
     */
    shouldNumberMonsterNames() {
        return this.current.monsterNameNumbers === true;
    }

    /**
     * Check if monster images should be generated automatically
     * @returns {boolean} True if monster images should be generated automatically
     */
    shouldAutoGenerateMonsterImages() {
        return this.current.autoGenerateMonsterImages === true;
    }

    /**
     * Get the monster image style
     * @returns {string} Monster image style
     */
    getMonsterImageStyle() {
        return this.current.monsterImageStyle || 'fantasy';
    }

    /**
     * Check if player view is enabled
     * @returns {boolean} True if player view is enabled
     */
    isPlayerViewEnabled() {
        return this.current.playerViewEnabled === true;
    }

    /**
     * Get the player view theme
     * @returns {string} Player view theme
     */
    getPlayerViewTheme() {
        return this.current.playerViewTheme || 'dungeon';
    }

    /**
     * Get the player view HP mode
     * @returns {string} Player view HP mode
     */
    getPlayerViewHpMode() {
        return this.current.playerViewHpMode || 'descriptive';
    }

    /**
     * Check if player view should show AC
     * @returns {boolean} True if player view should show AC
     */
    shouldPlayerViewShowAC() {
        return this.current.playerViewShowAC === true;
    }

    /**
     * Check if player view should show conditions
     * @returns {boolean} True if player view should show conditions
     */
    shouldPlayerViewShowConditions() {
        return this.current.playerViewShowConditions === true;
    }

    /**
     * Check if player view should show timer
     * @returns {boolean} True if player view should show timer
     */
    shouldPlayerViewShowTimer() {
        return this.current.playerViewShowTimer === true;
    }

    /**
     * Check if dice animations are enabled
     * @returns {boolean} True if dice animations are enabled
     */
    areDiceAnimationsEnabled() {
        return this.current.diceAnimations === true;
    }

    /**
     * Check if dice sound is enabled
     * @returns {boolean} True if dice sound is enabled
     */
    isDiceSoundEnabled() {
        return this.current.diceSound === true;
    }

    /**
     * Get the advantage mode
     * @returns {string} Advantage mode
     */
    getAdvantageMode() {
        return this.current.advantageMode || 'query';
    }

    /**
     * Check if dice formulas should be shown
     * @returns {boolean} True if dice formulas should be shown
     */
    shouldShowDiceFormulas() {
        return this.current.showDiceFormulas === true;
    }

    /**
     * Check if dice history should be kept
     * @returns {boolean} True if dice history should be kept
     */
    shouldKeepDiceHistory() {
        return this.current.keepDiceHistory === true;
    }

    /**
     * Get the maximum dice history size
     * @returns {number} Maximum dice history size
     */
    getMaxDiceHistory() {
        return this.current.maxDiceHistory || 20;
    }

    /**
     * Check if Open5e API should be used
     * @returns {boolean} True if Open5e API should be used
     */
    shouldUseOpen5e() {
        return this.current.useOpen5e === true;
    }

    /**
     * Check if D&D Beyond integration should be used
     * @returns {boolean} True if D&D Beyond integration should be used
     */
    shouldUseDndBeyond() {
        return this.current.useDndBeyond === true;
    }
}

// Export the Settings class
export default Settings;
