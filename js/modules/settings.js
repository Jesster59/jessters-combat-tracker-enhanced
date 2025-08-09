/**
 * Settings module for Jesster's Combat Tracker
 * Handles application settings and preferences
 */
class Settings {
    constructor(storage) {
        // Store reference to storage module
        this.storage = storage;
        
        // Default settings
        this.defaults = {
            // General settings
            theme: 'auto',
            fontSize: 'medium',
            language: 'en',
            confirmBeforeDelete: true,
            autosaveInterval: 60, // seconds
            
            // Combat settings
            initiativeSystem: 'standard',
            groupSimilarMonsters: true,
            showDefeatedCombatants: true,
            highlightActiveTurn: true,
            autoRollMonsterInitiative: true,
            autoRollNPCInitiative: true,
            advantageMode: 'query', // query, advantage, disadvantage, normal
            
            // Timer settings
            turnTimerEnabled: false,
            turnTimerDuration: 60, // seconds
            turnTimerWarning: 10, // seconds
            turnTimerAutoEnd: false,
            turnTimerSound: true,
            
            // Dice settings
            diceAnimationsEnabled: true,
            diceSoundEnabled: true,
            keepDiceHistory: true,
            maxDiceHistory: 50,
            
            // Audio settings
            soundsEnabled: true,
            musicEnabled: false,
            volume: 0.7,
            musicVolume: 0.3,
            
            // Display settings
            showHPValues: true,
            showHPPercentage: true,
            showACValues: true,
            showInitiativeValues: true,
            showConditionIcons: true,
            
            // API settings
            openAIApiKey: '',
            
            // Advanced settings
            debugMode: false,
            experimentalFeatures: false,
            dataExportFormat: 'json',
            
            // User preferences
            recentEncounters: [],
            pinnedEncounters: [],
            lastView: 'combat',
            sidebarCollapsed: false,
            notesPanelWidth: 300,
            statBlocksEnabled: true
        };
        
        // Current settings
        this.settings = { ...this.defaults };
        
        // Load settings
        this._loadSettings();
        
        console.log("Settings module initialized");
    }

    /**
     * Load settings from storage
     * @private
     */
    async _loadSettings() {
        try {
            const savedSettings = await this.storage.load('settings', { useLocalStorage: true });
            if (savedSettings) {
                // Merge saved settings with defaults
                this.settings = { ...this.defaults, ...savedSettings };
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    /**
     * Save settings to storage
     * @private
     */
    async _saveSettings() {
        try {
            await this.storage.save('settings', this.settings, { useLocalStorage: true });
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    /**
     * Get a setting value
     * @param {string} key - Setting key
     * @param {*} defaultValue - Default value if setting is not found
     * @returns {*} Setting value
     */
    get(key, defaultValue = undefined) {
        if (this.settings[key] !== undefined) {
            return this.settings[key];
        }
        
        return defaultValue !== undefined ? defaultValue : this.defaults[key];
    }

    /**
     * Set a setting value
     * @param {string} key - Setting key
     * @param {*} value - Setting value
     * @returns {Promise<boolean>} Success status
     */
    async set(key, value) {
        // Update setting
        this.settings[key] = value;
        
        // Save settings
        await this._saveSettings();
        
        return true;
    }

    /**
     * Reset a setting to its default value
     * @param {string} key - Setting key
     * @returns {Promise<boolean>} Success status
     */
    async reset(key) {
        if (this.defaults[key] !== undefined) {
            this.settings[key] = this.defaults[key];
            await this._saveSettings();
            return true;
        }
        
        return false;
    }

    /**
     * Reset all settings to defaults
     * @returns {Promise<boolean>} Success status
     */
    async resetAll() {
        this.settings = { ...this.defaults };
        await this._saveSettings();
        return true;
    }

    /**
     * Get all settings
     * @returns {Object} All settings
     */
    getAll() {
        return { ...this.settings };
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
        return this.settings[key] !== undefined || this.defaults[key] !== undefined;
    }

    /**
     * Get theme setting
     * @returns {string} Theme (light, dark, auto)
     */
    getTheme() {
        return this.get('theme');
    }

    /**
     * Set theme setting
     * @param {string} theme - Theme (light, dark, auto)
     * @returns {Promise<boolean>} Success status
     */
    async setTheme(theme) {
        if (['light', 'dark', 'auto'].includes(theme)) {
            return await this.set('theme', theme);
        }
        return false;
    }

    /**
     * Get font size setting
     * @returns {string} Font size (small, medium, large)
     */
    getFontSize() {
        return this.get('fontSize');
    }

    /**
     * Set font size setting
     * @param {string} fontSize - Font size (small, medium, large)
     * @returns {Promise<boolean>} Success status
     */
    async setFontSize(fontSize) {
        if (['small', 'medium', 'large'].includes(fontSize)) {
            return await this.set('fontSize', fontSize);
        }
        return false;
    }

    /**
     * Get language setting
     * @returns {string} Language code
     */
    getLanguage() {
        return this.get('language');
    }

    /**
     * Set language setting
     * @param {string} language - Language code
     * @returns {Promise<boolean>} Success status
     */
    async setLanguage(language) {
        return await this.set('language', language);
    }

    /**
     * Check if confirm before delete is enabled
     * @returns {boolean} True if enabled
     */
    shouldConfirmBeforeDelete() {
        return this.get('confirmBeforeDelete');
    }

    /**
     * Set confirm before delete setting
     * @param {boolean} enabled - Whether to confirm before delete
     * @returns {Promise<boolean>} Success status
     */
    async setConfirmBeforeDelete(enabled) {
        return await this.set('confirmBeforeDelete', !!enabled);
    }

    /**
     * Get autosave interval
     * @returns {number} Autosave interval in seconds
     */
    getAutosaveInterval() {
        return this.get('autosaveInterval');
    }

    /**
     * Set autosave interval
     * @param {number} interval - Autosave interval in seconds
     * @returns {Promise<boolean>} Success status
     */
    async setAutosaveInterval(interval) {
        return await this.set('autosaveInterval', Math.max(0, interval));
    }

    /**
     * Get initiative system
     * @returns {string} Initiative system
     */
    getInitiativeSystem() {
        return this.get('initiativeSystem');
    }

    /**
     * Set initiative system
     * @param {string} system - Initiative system
     * @returns {Promise<boolean>} Success status
     */
    async setInitiativeSystem(system) {
        if (['standard', 'group', 'popcorn', 'side'].includes(system)) {
            return await this.set('initiativeSystem', system);
        }
        return false;
    }

    /**
     * Check if group similar monsters is enabled
     * @returns {boolean} True if enabled
     */
    shouldGroupSimilarMonsters() {
        return this.get('groupSimilarMonsters');
    }

    /**
     * Set group similar monsters setting
     * @param {boolean} enabled - Whether to group similar monsters
     * @returns {Promise<boolean>} Success status
     */
    async setGroupSimilarMonsters(enabled) {
        return await this.set('groupSimilarMonsters', !!enabled);
    }

    /**
     * Check if show defeated combatants is enabled
     * @returns {boolean} True if enabled
     */
    shouldShowDefeatedCombatants() {
        return this.get('showDefeatedCombatants');
    }

    /**
     * Set show defeated combatants setting
     * @param {boolean} enabled - Whether to show defeated combatants
     * @returns {Promise<boolean>} Success status
     */
    async setShowDefeatedCombatants(enabled) {
        return await this.set('showDefeatedCombatants', !!enabled);
    }

    /**
     * Check if highlight active turn is enabled
     * @returns {boolean} True if enabled
     */
    shouldHighlightActiveTurn() {
        return this.get('highlightActiveTurn');
    }

    /**
     * Set highlight active turn setting
     * @param {boolean} enabled - Whether to highlight active turn
     * @returns {Promise<boolean>} Success status
     */
    async setHighlightActiveTurn(enabled) {
        return await this.set('highlightActiveTurn', !!enabled);
    }

    /**
     * Check if auto roll monster initiative is enabled
     * @returns {boolean} True if enabled
     */
    shouldAutoRollMonsterInitiative() {
        return this.get('autoRollMonsterInitiative');
    }

    /**
     * Set auto roll monster initiative setting
     * @param {boolean} enabled - Whether to auto roll monster initiative
     * @returns {Promise<boolean>} Success status
     */
    async setAutoRollMonsterInitiative(enabled) {
        return await this.set('autoRollMonsterInitiative', !!enabled);
    }

    /**
     * Check if auto roll NPC initiative is enabled
     * @returns {boolean} True if enabled
     */
    shouldAutoRollNPCInitiative() {
        return this.get('autoRollNPCInitiative');
    }

    /**
     * Set auto roll NPC initiative setting
     * @param {boolean} enabled - Whether to auto roll NPC initiative
     * @returns {Promise<boolean>} Success status
     */
    async setAutoRollNPCInitiative(enabled) {
        return await this.set('autoRollNPCInitiative', !!enabled);
    }

    /**
     * Get advantage mode
     * @returns {string} Advantage mode
     */
    getAdvantageMode() {
        return this.get('advantageMode');
    }

    /**
     * Set advantage mode
     * @param {string} mode - Advantage mode
     * @returns {Promise<boolean>} Success status
     */
    async setAdvantageMode(mode) {
        if (['query', 'advantage', 'disadvantage', 'normal'].includes(mode)) {
            return await this.set('advantageMode', mode);
        }
        return false;
    }

    /**
     * Check if turn timer is enabled
     * @returns {boolean} True if enabled
     */
    isTurnTimerEnabled() {
        return this.get('turnTimerEnabled');
    }

    /**
     * Set turn timer enabled setting
     * @param {boolean} enabled - Whether turn timer is enabled
     * @returns {Promise<boolean>} Success status
     */
    async setTurnTimerEnabled(enabled) {
        return await this.set('turnTimerEnabled', !!enabled);
    }

    /**
     * Get turn timer duration
     * @returns {number} Turn timer duration in seconds
     */
    getTurnTimerDuration() {
        return this.get('turnTimerDuration');
    }

    /**
     * Set turn timer duration
     * @param {number} duration - Turn timer duration in seconds
     * @returns {Promise<boolean>} Success status
     */
    async setTurnTimerDuration(duration) {
        return await this.set('turnTimerDuration', Math.max(5, duration));
    }

    /**
     * Get turn timer warning threshold
     * @returns {number} Turn timer warning threshold in seconds
     */
    getTurnTimerWarning() {
        return this.get('turnTimerWarning');
    }

    /**
     * Set turn timer warning threshold
     * @param {number} warning - Turn timer warning threshold in seconds
     * @returns {Promise<boolean>} Success status
     */
    async setTurnTimerWarning(warning) {
        return await this.set('turnTimerWarning', Math.max(1, warning));
    }

    /**
     * Check if turn timer auto end is enabled
     * @returns {boolean} True if enabled
     */
    shouldTurnTimerAutoEnd() {
        return this.get('turnTimerAutoEnd');
    }

    /**
     * Set turn timer auto end setting
     * @param {boolean} enabled - Whether turn timer auto end is enabled
     * @returns {Promise<boolean>} Success status
     */
    async setTurnTimerAutoEnd(enabled) {
        return await this.set('turnTimerAutoEnd', !!enabled);
    }

    /**
     * Check if turn timer sound is enabled
     * @returns {boolean} True if enabled
     */
    isTurnTimerSoundEnabled() {
        return this.get('turnTimerSound');
    }

    /**
     * Set turn timer sound setting
     * @param {boolean} enabled - Whether turn timer sound is enabled
     * @returns {Promise<boolean>} Success status
     */
    async setTurnTimerSound(enabled) {
        return await this.set('turnTimerSound', !!enabled);
    }

    /**
     * Check if dice animations are enabled
     * @returns {boolean} True if enabled
     */
    areDiceAnimationsEnabled() {
        return this.get('diceAnimationsEnabled');
    }

    /**
     * Set dice animations setting
     * @param {boolean} enabled - Whether dice animations are enabled
     * @returns {Promise<boolean>} Success status
     */
    async setDiceAnimationsEnabled(enabled) {
        return await this.set('diceAnimationsEnabled', !!enabled);
    }

    /**
     * Check if dice sound is enabled
     * @returns {boolean} True if enabled
     */
    isDiceSoundEnabled() {
        return this.get('diceSoundEnabled');
    }

    /**
     * Set dice sound setting
     * @param {boolean} enabled - Whether dice sound is enabled
     * @returns {Promise<boolean>} Success status
     */
    async setDiceSoundEnabled(enabled) {
        return await this.set('diceSoundEnabled', !!enabled);
    }

    /**
     * Check if keep dice history is enabled
     * @returns {boolean} True if enabled
     */
    shouldKeepDiceHistory() {
        return this.get('keepDiceHistory');
    }

    /**
     * Set keep dice history setting
     * @param {boolean} enabled - Whether to keep dice history
     * @returns {Promise<boolean>} Success status
     */
    async setKeepDiceHistory(enabled) {
        return await this.set('keepDiceHistory', !!enabled);
    }

    /**
     * Get maximum dice history size
     * @returns {number} Maximum dice history size
     */
    getMaxDiceHistory() {
        return this.get('maxDiceHistory');
    }

    /**
     * Set maximum dice history size
     * @param {number} size - Maximum dice history size
     * @returns {Promise<boolean>} Success status
     */
    async setMaxDiceHistory(size) {
        return await this.set('maxDiceHistory', Math.max(10, size));
    }

    /**
     * Check if sounds are enabled
     * @returns {boolean} True if enabled
     */
    areSoundsEnabled() {
        return this.get('soundsEnabled');
    }

    /**
     * Set sounds enabled setting
     * @param {boolean} enabled - Whether sounds are enabled
     * @returns {Promise<boolean>} Success status
     */
    async setSoundsEnabled(enabled) {
        return await this.set('soundsEnabled', !!enabled);
    }

    /**
     * Check if music is enabled
     * @returns {boolean} True if enabled
     */
    isMusicEnabled() {
        return this.get('musicEnabled');
    }

    /**
     * Set music enabled setting
     * @param {boolean} enabled - Whether music is enabled
     * @returns {Promise<boolean>} Success status
     */
    async setMusicEnabled(enabled) {
        return await this.set('musicEnabled', !!enabled);
    }

    /**
     * Get volume level
     * @returns {number} Volume level (0-1)
     */
    getVolume() {
        return this.get('volume');
    }

    /**
     * Set volume level
     * @param {number} volume - Volume level (0-1)
     * @returns {Promise<boolean>} Success status
     */
    async setVolume(volume) {
        return await this.set('volume', Math.max(0, Math.min(1, volume)));
    }

    /**
     * Get music volume level
     * @returns {number} Music volume level (0-1)
     */
    getMusicVolume() {
        return this.get('musicVolume');
    }

    /**
     * Set music volume level
     * @param {number} volume - Music volume level (0-1)
     * @returns {Promise<boolean>} Success status
     */
    async setMusicVolume(volume) {
        return await this.set('musicVolume', Math.max(0, Math.min(1, volume)));
    }

    /**
     * Check if show HP values is enabled
     * @returns {boolean} True if enabled
     */
    shouldShowHPValues() {
        return this.get('showHPValues');
    }

    /**
     * Set show HP values setting
     * @param {boolean} enabled - Whether to show HP values
     * @returns {Promise<boolean>} Success status
     */
    async setShowHPValues(enabled) {
        return await this.set('showHPValues', !!enabled);
    }

    /**
     * Check if show HP percentage is enabled
     * @returns {boolean} True if enabled
     */
    shouldShowHPPercentage() {
        return this.get('showHPPercentage');
    }

    /**
     * Set show HP percentage setting
     * @param {boolean} enabled - Whether to show HP percentage
     * @returns {Promise<boolean>} Success status
     */
    async setShowHPPercentage(enabled) {
        return await this.set('showHPPercentage', !!enabled);
    }

    /**
     * Check if show AC values is enabled
     * @returns {boolean} True if enabled
     */
    shouldShowACValues() {
        return this.get('showACValues');
    }

    /**
     * Set show AC values setting
     * @param {boolean} enabled - Whether to show AC values
     * @returns {Promise<boolean>} Success status
     */
    async setShowACValues(enabled) {
        return await this.set('showACValues', !!enabled);
    }

    /**
     * Check if show initiative values is enabled
     * @returns {boolean} True if enabled
     */
    shouldShowInitiativeValues() {
        return this.get('showInitiativeValues');
    }

    /**
     * Set show initiative values setting
     * @param {boolean} enabled - Whether to show initiative values
     * @returns {Promise<boolean>} Success status
     */
    async setShowInitiativeValues(enabled) {
        return await this.set('showInitiativeValues', !!enabled);
    }

    /**
     * Check if show condition icons is enabled
     * @returns {boolean} True if enabled
     */
    shouldShowConditionIcons() {
        return this.get('showConditionIcons');
    }

    /**
     * Set show condition icons setting
     * @param {boolean} enabled - Whether to show condition icons
     * @returns {Promise<boolean>} Success status
     */
    async setShowConditionIcons(enabled) {
        return await this.set('showConditionIcons', !!enabled);
    }

    /**
     * Get OpenAI API key
     * @returns {string} OpenAI API key
     */
    getOpenAIApiKey() {
        return this.get('openAIApiKey');
    }

    /**
     * Set OpenAI API key
     * @param {string} apiKey - OpenAI API key
     * @returns {Promise<boolean>} Success status
     */
    async setOpenAIApiKey(apiKey) {
        return await this.set('openAIApiKey', apiKey);
    }

    /**
     * Check if debug mode is enabled
     * @returns {boolean} True if enabled
     */
    isDebugModeEnabled() {
        return this.get('debugMode');
    }

    /**
     * Set debug mode setting
     * @param {boolean} enabled - Whether debug mode is enabled
     * @returns {Promise<boolean>} Success status
     */
    async setDebugMode(enabled) {
        return await this.set('debugMode', !!enabled);
    }

    /**
     * Check if experimental features are enabled
     * @returns {boolean} True if enabled
     */
    areExperimentalFeaturesEnabled() {
        return this.get('experimentalFeatures');
    }

    /**
     * Set experimental features setting
     * @param {boolean} enabled - Whether experimental features are enabled
     * @returns {Promise<boolean>} Success status
     */
    async setExperimentalFeatures(enabled) {
        return await this.set('experimentalFeatures', !!enabled);
    }

    /**
     * Get data export format
     * @returns {string} Data export format
     */
    getDataExportFormat() {
        return this.get('dataExportFormat');
    }

    /**
     * Set data export format
     * @param {string} format - Data export format
     * @returns {Promise<boolean>} Success status
     */
    async setDataExportFormat(format) {
        if (['json', 'csv'].includes(format)) {
            return await this.set('dataExportFormat', format);
        }
        return false;
    }

    /**
     * Get recent encounters
     * @returns {Array} Recent encounters
     */
    getRecentEncounters() {
        return this.get('recentEncounters');
    }

    /**
     * Add encounter to recent encounters
     * @param {string} encounterId - Encounter ID
     * @returns {Promise<boolean>} Success status
     */
    async addRecentEncounter(encounterId) {
        const recentEncounters = this.getRecentEncounters();
        
        // Remove if already exists
        const index = recentEncounters.indexOf(encounterId);
        if (index !== -1) {
            recentEncounters.splice(index, 1);
        }
        
        // Add to beginning
        recentEncounters.unshift(encounterId);
        
        // Limit to 10 recent encounters
        if (recentEncounters.length > 10) {
            recentEncounters.pop();
        }
        
        return await this.set('recentEncounters', recentEncounters);
    }

    /**
     * Get pinned encounters
     * @returns {Array} Pinned encounters
     */
    getPinnedEncounters() {
        return this.get('pinnedEncounters');
    }

    /**
     * Pin an encounter
     * @param {string} encounterId - Encounter ID
     * @returns {Promise<boolean>} Success status
     */
    async pinEncounter(encounterId) {
        const pinnedEncounters = this.getPinnedEncounters();
        
        // Check if already pinned
        if (pinnedEncounters.includes(encounterId)) {
            return true;
        }
        
        // Add to pinned encounters
        pinnedEncounters.push(encounterId);
        
        return await this.set('pinnedEncounters', pinnedEncounters);
    }

    /**
     * Unpin an encounter
     * @param {string} encounterId - Encounter ID
     * @returns {Promise<boolean>} Success status
     */
    async unpinEncounter(encounterId) {
        const pinnedEncounters = this.getPinnedEncounters();
        
        // Remove from pinned encounters
        const index = pinnedEncounters.indexOf(encounterId);
        if (index !== -1) {
            pinnedEncounters.splice(index, 1);
            return await this.set('pinnedEncounters', pinnedEncounters);
        }
        
        return false;
    }

    /**
     * Get last view
     * @returns {string} Last view
     */
    getLastView() {
        return this.get('lastView');
    }

    /**
     * Set last view
     * @param {string} view - View name
     * @returns {Promise<boolean>} Success status
     */
    async setLastView(view) {
        return await this.set('lastView', view);
    }

    /**
     * Check if sidebar is collapsed
     * @returns {boolean} True if collapsed
     */
    isSidebarCollapsed() {
        return this.get('sidebarCollapsed');
    }

    /**
     * Set sidebar collapsed setting
     * @param {boolean} collapsed - Whether sidebar is collapsed
     * @returns {Promise<boolean>} Success status
     */
    async setSidebarCollapsed(collapsed) {
        return await this.set('sidebarCollapsed', !!collapsed);
    }

    /**
     * Get notes panel width
     * @returns {number} Notes panel width in pixels
     */
    getNotesPanelWidth() {
        return this.get('notesPanelWidth');
    }

    /**
     * Set notes panel width
     * @param {number} width - Notes panel width in pixels
     * @returns {Promise<boolean>} Success status
     */
    async setNotesPanelWidth(width) {
        return await this.set('notesPanelWidth', Math.max(200, Math.min(600, width)));
    }

    /**
     * Check if stat blocks are enabled
     * @returns {boolean} True if enabled
     */
    areStatBlocksEnabled() {
        return this.get('statBlocksEnabled');
    }

    /**
     * Set stat blocks enabled setting
     * @param {boolean} enabled - Whether stat blocks are enabled
     * @returns {Promise<boolean>} Success status
     */
    async setStatBlocksEnabled(enabled) {
        return await this.set('statBlocksEnabled', !!enabled);
    }

    /**
     * Export settings to JSON
     * @returns {string} JSON string
     */
    exportToJSON() {
        return JSON.stringify(this.settings, null, 2);
    }

    /**
     * Import settings from JSON
     * @param {string} json - JSON string
     * @returns {Promise<boolean>} Success status
     */
    async importFromJSON(json) {
        try {
            const importedSettings = JSON.parse(json);
            
            // Validate settings
            if (typeof importedSettings !== 'object') {
                throw new Error('Invalid settings format');
            }
            
            // Merge with current settings
            this.settings = { ...this.settings, ...importedSettings };
            
            // Save settings
            await this._saveSettings();
            
            return true;
        } catch (error) {
            console.error('Error importing settings:', error);
            return false;
        }
    }

    /**
     * Apply theme to document
     */
    applyTheme() {
        const theme = this.getTheme();
        const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        
        // Set data-theme attribute on document element
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        
        // Add/remove dark-theme class on body
        if (isDark) {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    }

    /**
     * Apply font size to document
     */
    applyFontSize() {
        const fontSize = this.getFontSize();
        
        // Remove existing font size classes
        document.body.classList.remove('font-small', 'font-medium', 'font-large');
        
        // Add new font size class
        document.body.classList.add(`font-${fontSize}`);
    }

    /**
     * Apply all settings to document
     */
    applySettings() {
        this.applyTheme();
        this.applyFontSize();
    }

    /**
     * Get settings categories
     * @returns {Array} Settings categories
     */
    getSettingsCategories() {
        return [
            {
                id: 'general',
                name: 'General',
                icon: 'settings',
                settings: ['theme', 'fontSize', 'language', 'confirmBeforeDelete', 'autosaveInterval']
            },
            {
                id: 'combat',
                name: 'Combat',
                icon: 'swords',
                settings: ['initiativeSystem', 'groupSimilarMonsters', 'showDefeatedCombatants', 'highlightActiveTurn', 'autoRollMonsterInitiative', 'autoRollNPCInitiative', 'advantageMode']
            },
            {
                id: 'timer',
                name: 'Timer',
                icon: 'clock',
                settings: ['turnTimerEnabled', 'turnTimerDuration', 'turnTimerWarning', 'turnTimerAutoEnd', 'turnTimerSound']
            },
            {
                id: 'dice',
                name: 'Dice',
                icon: 'dice',
                settings: ['diceAnimationsEnabled', 'diceSoundEnabled', 'keepDiceHistory', 'maxDiceHistory']
            },
            {
                id: 'audio',
                name: 'Audio',
                icon: 'volume',
                settings: ['soundsEnabled', 'musicEnabled', 'volume', 'musicVolume']
            },
            {
                id: 'display',
                name: 'Display',
                icon: 'monitor',
                settings: ['showHPValues', 'showHPPercentage', 'showACValues', 'showInitiativeValues', 'showConditionIcons', 'statBlocksEnabled']
            },
            {
                id: 'api',
                name: 'API',
                icon: 'cloud',
                settings: ['openAIApiKey']
            },
            {
                id: 'advanced',
                name: 'Advanced',
                icon: 'tool',
                settings: ['debugMode', 'experimentalFeatures', 'dataExportFormat']
            }
        ];
    }

    /**
     * Get setting metadata
     * @param {string} key - Setting key
     * @returns {Object|null} Setting metadata or null if not found
     */
    getSettingMetadata(key) {
        const metadata = {
                        theme: {
                type: 'select',
                label: 'Theme',
                description: 'Application color theme',
                options: [
                    { value: 'light', label: 'Light' },
                    { value: 'dark', label: 'Dark' },
                    { value: 'auto', label: 'Auto (System)' }
                ]
            },
            fontSize: {
                type: 'select',
                label: 'Font Size',
                description: 'Application font size',
                options: [
                    { value: 'small', label: 'Small' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'large', label: 'Large' }
                ]
            },
            language: {
                type: 'select',
                label: 'Language',
                description: 'Application language',
                options: [
                    { value: 'en', label: 'English' },
                    { value: 'es', label: 'Español' },
                    { value: 'fr', label: 'Français' },
                    { value: 'de', label: 'Deutsch' }
                ]
            },
            confirmBeforeDelete: {
                type: 'boolean',
                label: 'Confirm Before Delete',
                description: 'Show confirmation dialog before deleting items'
            },
            autosaveInterval: {
                type: 'number',
                label: 'Autosave Interval',
                description: 'Time between automatic saves (in seconds)',
                min: 0,
                max: 3600,
                step: 10
            },
            initiativeSystem: {
                type: 'select',
                label: 'Initiative System',
                description: 'System used for initiative order',
                options: [
                    { value: 'standard', label: 'Standard' },
                    { value: 'group', label: 'Group' },
                    { value: 'popcorn', label: 'Popcorn' },
                    { value: 'side', label: 'Side Initiative' }
                ]
            },
            groupSimilarMonsters: {
                type: 'boolean',
                label: 'Group Similar Monsters',
                description: 'Group monsters of the same type in the initiative order'
            },
            showDefeatedCombatants: {
                type: 'boolean',
                label: 'Show Defeated Combatants',
                description: 'Show defeated combatants in the initiative order'
            },
            highlightActiveTurn: {
                type: 'boolean',
                label: 'Highlight Active Turn',
                description: 'Highlight the active combatant\'s turn'
            },
            autoRollMonsterInitiative: {
                type: 'boolean',
                label: 'Auto-Roll Monster Initiative',
                description: 'Automatically roll initiative for monsters'
            },
            autoRollNPCInitiative: {
                type: 'boolean',
                label: 'Auto-Roll NPC Initiative',
                description: 'Automatically roll initiative for NPCs'
            },
            advantageMode: {
                type: 'select',
                label: 'Advantage Mode',
                description: 'Default advantage mode for rolls',
                options: [
                    { value: 'query', label: 'Ask Each Time' },
                    { value: 'advantage', label: 'Always Advantage' },
                    { value: 'disadvantage', label: 'Always Disadvantage' },
                    { value: 'normal', label: 'Normal Roll' }
                ]
            },
            turnTimerEnabled: {
                type: 'boolean',
                label: 'Enable Turn Timer',
                description: 'Enable timer for combatant turns'
            },
            turnTimerDuration: {
                type: 'number',
                label: 'Turn Timer Duration',
                description: 'Duration of turn timer (in seconds)',
                min: 5,
                max: 300,
                step: 5
            },
            turnTimerWarning: {
                type: 'number',
                label: 'Turn Timer Warning',
                description: 'Time remaining when warning is shown (in seconds)',
                min: 1,
                max: 60,
                step: 1
            },
            turnTimerAutoEnd: {
                type: 'boolean',
                label: 'Auto-End Turn',
                description: 'Automatically end turn when timer expires'
            },
            turnTimerSound: {
                type: 'boolean',
                label: 'Turn Timer Sound',
                description: 'Play sound when turn timer expires'
            },
            diceAnimationsEnabled: {
                type: 'boolean',
                label: 'Dice Animations',
                description: 'Show animations when rolling dice'
            },
            diceSoundEnabled: {
                type: 'boolean',
                label: 'Dice Sound',
                description: 'Play sound when rolling dice'
            },
            keepDiceHistory: {
                type: 'boolean',
                label: 'Keep Dice History',
                description: 'Save history of dice rolls'
            },
            maxDiceHistory: {
                type: 'number',
                label: 'Max Dice History',
                description: 'Maximum number of dice rolls to keep in history',
                min: 10,
                max: 200,
                step: 10
            },
            soundsEnabled: {
                type: 'boolean',
                label: 'Enable Sounds',
                description: 'Enable sound effects'
            },
            musicEnabled: {
                type: 'boolean',
                label: 'Enable Music',
                description: 'Enable background music'
            },
            volume: {
                type: 'range',
                label: 'Sound Volume',
                description: 'Volume level for sound effects',
                min: 0,
                max: 1,
                step: 0.1
            },
            musicVolume: {
                type: 'range',
                label: 'Music Volume',
                description: 'Volume level for background music',
                min: 0,
                max: 1,
                step: 0.1
            },
            showHPValues: {
                type: 'boolean',
                label: 'Show HP Values',
                description: 'Show hit point values for combatants'
            },
            showHPPercentage: {
                type: 'boolean',
                label: 'Show HP Percentage',
                description: 'Show hit point percentage for combatants'
            },
            showACValues: {
                type: 'boolean',
                label: 'Show AC Values',
                description: 'Show armor class values for combatants'
            },
            showInitiativeValues: {
                type: 'boolean',
                label: 'Show Initiative Values',
                description: 'Show initiative values for combatants'
            },
            showConditionIcons: {
                type: 'boolean',
                label: 'Show Condition Icons',
                description: 'Show icons for conditions on combatants'
            },
            openAIApiKey: {
                type: 'password',
                label: 'OpenAI API Key',
                description: 'API key for OpenAI integration'
            },
            debugMode: {
                type: 'boolean',
                label: 'Debug Mode',
                description: 'Enable debug logging and features'
            },
            experimentalFeatures: {
                type: 'boolean',
                label: 'Experimental Features',
                description: 'Enable experimental features'
            },
            dataExportFormat: {
                type: 'select',
                label: 'Data Export Format',
                description: 'Format for exporting data',
                options: [
                    { value: 'json', label: 'JSON' },
                    { value: 'csv', label: 'CSV' }
                ]
            },
            statBlocksEnabled: {
                type: 'boolean',
                label: 'Enable Stat Blocks',
                description: 'Show detailed stat blocks for monsters and characters'
            }
        };
        
        return metadata[key] || null;
    }

    /**
     * Listen for system theme changes
     */
    listenForThemeChanges() {
        // Only listen if theme is set to auto
        if (this.getTheme() !== 'auto') return;
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            this.applyTheme();
        });
    }
}

// Export the Settings class
export default Settings;
