/**
 * Settings Manager for Jesster's Combat Tracker
 * Handles application settings and preferences
 */
class SettingsManager {
    constructor(app) {
        this.app = app;
        this.settings = {
            // Default settings
            theme: 'dark',
            critRule: 'perkins', // 'perkins' or 'raw'
            initiativeRule: 'standard', // 'standard' or 'group'
            autoRollMonsterHP: true,
            autoRollInitiative: false,
            confirmOnDelete: true,
            showDiceRolls: true,
            showConditionDescriptions: true,
            autoSave: true,
            autoSaveInterval: 5, // minutes
            playerViewRefreshRate: 5, // seconds
            enableKeyboardShortcuts: true,
            enableSoundEffects: true,
            enableBackgroundMusic: false,
            soundVolume: 0.5,
            musicVolume: 0.3
        };
        console.log("Settings Manager initialized");
    }
    
    /**
     * Load settings from storage
     */
    async loadSettings() {
        try {
            const savedSettings = await this.app.storage.getSettings();
            if (savedSettings) {
                // Merge saved settings with defaults
                this.settings = { ...this.settings, ...savedSettings };
            }
            
            // Apply settings
            this.applySettings();
            
            console.log("Settings loaded");
        } catch (error) {
            console.error("Error loading settings:", error);
        }
    }
    
    /**
     * Save settings to storage
     */
    async saveSettings() {
        try {
            await this.app.storage.saveSettings(this.settings);
            console.log("Settings saved");
        } catch (error) {
            console.error("Error saving settings:", error);
        }
    }
    
    /**
     * Apply settings to the application
     */
    applySettings() {
        // Apply theme
        document.documentElement.classList.toggle('dark-theme', this.settings.theme === 'dark');
        document.documentElement.classList.toggle('light-theme', this.settings.theme === 'light');
        
        // Apply audio settings
        if (this.app.audio) {
            this.app.audio.soundEnabled = this.settings.enableSoundEffects;
            this.app.audio.musicEnabled = this.settings.enableBackgroundMusic;
            this.app.audio.soundVolume = this.settings.soundVolume;
            this.app.audio.musicVolume = this.settings.musicVolume;
            this.app.audio.updateAudioControlsUI();
        }
        
        // Apply keyboard shortcuts
        if (this.app.keyboard) {
            this.app.keyboard.enabled = this.settings.enableKeyboardShortcuts;
        }
    }
    
    /**
     * Get a setting value
     * @param {string} key - The setting key
     * @param {*} defaultValue - The default value if the setting is not found
     * @returns {*} - The setting value
     */
    getSetting(key, defaultValue = null) {
        return this.settings[key] !== undefined ? this.settings[key] : defaultValue;
    }
    
    /**
     * Set a setting value
     * @param {string} key - The setting key
     * @param {*} value - The setting value
     */
    setSetting(key, value) {
        this.settings[key] = value;
        this.applySettings();
        this.saveSettings();
    }
    
    /**
     * Open the settings modal
     */
    openSettingsModal() {
        const modal = this.app.ui.createModal({
            title: 'Settings',
            content: `
                <div class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- General Settings -->
                        <div>
                            <h3 class="text-lg font-semibold text-primary-300 mb-4">General Settings</h3>
                            
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-gray-300 mb-2">Theme:</label>
                                    <select id="setting-theme" class="w-full bg-gray-700 text-white px-3 py-2 rounded">
                                        <option value="dark" ${this.settings.theme === 'dark' ? 'selected' : ''}>Dark</option>
                                        <option value="light" ${this.settings.theme === 'light' ? 'selected' : ''}>Light</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label class="block text-gray-300 mb-2">Critical Hit Rule:</label>
                                    <select id="setting-crit-rule" class="w-full bg-gray-700 text-white px-3 py-2 rounded">
                                        <option value="perkins" ${this.settings.critRule === 'perkins' ? 'selected' : ''}>Perkins Rule (Max + Roll)</option>
                                        <option value="raw" ${this.settings.critRule === 'raw' ? 'selected' : ''}>RAW (Double Dice)</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label class="block text-gray-300 mb-2">Initiative Rule:</label>
                                    <select id="setting-initiative-rule" class="w-full bg-gray-700 text-white px-3 py-2 rounded">
                                        <option value="standard" ${this.settings.initiativeRule === 'standard' ? 'selected' : ''}>Standard (Individual)</option>
                                        <option value="group" ${this.settings.initiativeRule === 'group' ? 'selected' : ''}>Group (By Type)</option>
                                    </select>
                                </div>
                                
                                <div class="flex items-center justify-between">
                                    <label class="text-gray-300">Auto-roll Monster HP:</label>
                                    <input type="checkbox" id="setting-auto-roll-hp" class="form-checkbox h-5 w-5 text-blue-600" ${this.settings.autoRollMonsterHP ? 'checked' : ''}>
                                </div>
                                
                                <div class="flex items-center justify-between">
                                    <label class="text-gray-300">Auto-roll Initiative:</label>
                                    <input type="checkbox" id="setting-auto-roll-initiative" class="form-checkbox h-5 w-5 text-blue-600" ${this.settings.autoRollInitiative ? 'checked' : ''}>
                                </div>
                                
                                <div class="flex items-center justify-between">
                                    <label class="text-gray-300">Confirm on Delete:</label>
                                    <input type="checkbox" id="setting-confirm-delete" class="form-checkbox h-5 w-5 text-blue-600" ${this.settings.confirmOnDelete ? 'checked' : ''}>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Display Settings -->
                        <div>
                            <h3 class="text-lg font-semibold text-primary-300 mb-4">Display Settings</h3>
                            
                            <div class="space-y-4">
                                <div class="flex items-center justify-between">
                                    <label class="text-gray-300">Show Dice Rolls:</label>
                                    <input type="checkbox" id="setting-show-dice-rolls" class="form-checkbox h-5 w-5 text-blue-600" ${this.settings.showDiceRolls ? 'checked' : ''}>
                                </div>
                                
                                <div class="flex items-center justify-between">
                                    <label class="text-gray-300">Show Condition Descriptions:</label>
                                    <input type="checkbox" id="setting-show-condition-desc" class="form-checkbox h-5 w-5 text-blue-600" ${this.settings.showConditionDescriptions ? 'checked' : ''}>
                                </div>
                                
                                <div>
                                    <label class="block text-gray-300 mb-2">Player View Refresh Rate (seconds):</label>
                                    <input type="number" id="setting-player-refresh" class="w-full bg-gray-700 text-white px-3 py-2 rounded" min="1" max="30" value="${this.settings.playerViewRefreshRate}">
                                </div>
                            </div>
                            
                            <h3 class="text-lg font-semibold text-primary-300 mb-4 mt-6">Auto-Save</h3>
                            
                            <div class="space-y-4">
                                <div class="flex items-center justify-between">
                                    <label class="text-gray-300">Enable Auto-Save:</label>
                                    <input type="checkbox" id="setting-auto-save" class="form-checkbox h-5 w-5 text-blue-600" ${this.settings.autoSave ? 'checked' : ''}>
                                </div>
                                
                                <div>
                                    <label class="block text-gray-300 mb-2">Auto-Save Interval (minutes):</label>
                                    <input type="number" id="setting-auto-save-interval" class="w-full bg-gray-700 text-white px-3 py-2 rounded" min="1" max="60" value="${this.settings.autoSaveInterval}">
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Controls Settings -->
                    <div>
                        <h3 class="text-lg font-semibold text-primary-300 mb-4">Controls</h3>
                        
                        <div class="space-y-4">
                            <div class="flex items-center justify-between">
                                <label class="text-gray-300">Enable Keyboard Shortcuts:</label>
                                <input type="checkbox" id="setting-keyboard-shortcuts" class="form-checkbox h-5 w-5 text-blue-600" ${this.settings.enableKeyboardShortcuts ? 'checked' : ''}>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Audio Settings -->
                    <div>
                        <h3 class="text-lg font-semibold text-primary-300 mb-4">Audio</h3>
                        
                        <div class="space-y-4">
                            <div class="flex items-center justify-between">
                                <label class="text-gray-300">Enable Sound Effects:</label>
                                <input type="checkbox" id="setting-sound-effects" class="form-checkbox h-5 w-5 text-blue-600" ${this.settings.enableSoundEffects ? 'checked' : ''}>
                            </div>
                            
                            <div>
                                <label class="block text-gray-300 mb-2">Sound Volume:</label>
                                <input type="range" id="setting-sound-volume" class="w-full" min="0" max="1" step="0.1" value="${this.settings.soundVolume}">
                            </div>
                            
                            <div class="flex items-center justify-between">
                                <label class="text-gray-300">Enable Background Music:</label>
                                <input type="checkbox" id="setting-background-music" class="form-checkbox h-5 w-5 text-blue-600" ${this.settings.enableBackgroundMusic ? 'checked' : ''}>
                            </div>
                            
                            <div>
                                <label class="block text-gray-300 mb-2">Music Volume:</label>
                                <input type="range" id="setting-music-volume" class="w-full" min="0" max="1" step="0.1" value="${this.settings.musicVolume}">
                            </div>
                        </div>
                    </div>
                    
                    <!-- Actions -->
                    <div class="flex justify-end space-x-2">
                        <button id="settings-reset-btn" class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                            Reset to Defaults
                        </button>
                        <button id="settings-save-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Save Settings
                        </button>
                    </div>
                </div>
            `,
            width: 'max-w-4xl'
        });
        
        // Add event listeners
        const resetBtn = modal.querySelector('#settings-reset-btn');
        const saveBtn = modal.querySelector('#settings-save-btn');
        
        resetBtn.addEventListener('click', () => {
            this.app.showConfirm('Are you sure you want to reset all settings to their default values?', () => {
                // Reset settings to defaults
                this.settings = {
                    theme: 'dark',
                    critRule: 'perkins',
                    initiativeRule: 'standard',
                    autoRollMonsterHP: true,
                    autoRollInitiative: false,
                    confirmOnDelete: true,
                    showDiceRolls: true,
                    showConditionDescriptions: true,
                    autoSave: true,
                    autoSaveInterval: 5,
                    playerViewRefreshRate: 5,
                    enableKeyboardShortcuts: true,
                    enableSoundEffects: true,
                    enableBackgroundMusic: false,
                    soundVolume: 0.5,
                    musicVolume: 0.3
                };
                
                // Apply and save settings
                this.applySettings();
                this.saveSettings();
                
                // Close and reopen the modal to reflect changes
                this.app.ui.closeModal(modal);
                this.openSettingsModal();
                
                this.app.showAlert('Settings have been reset to defaults.');
            });
        });
        
        saveBtn.addEventListener('click', () => {
            // Update settings from form values
            this.settings.theme = modal.querySelector('#setting-theme').value;
            this.settings.critRule = modal.querySelector('#setting-crit-rule').value;
            this.settings.initiativeRule = modal.querySelector('#setting-initiative-rule').value;
            this.settings.autoRollMonsterHP = modal.querySelector('#setting-auto-roll-hp').checked;
            this.settings.autoRollInitiative = modal.querySelector('#setting-auto-roll-initiative').checked;
            this.settings.confirmOnDelete = modal.querySelector('#setting-confirm-delete').checked;
            this.settings.showDiceRolls = modal.querySelector('#setting-show-dice-rolls').checked;
            this.settings.showConditionDescriptions = modal.querySelector('#setting-show-condition-desc').checked;
            this.settings.playerViewRefreshRate = parseInt(modal.querySelector('#setting-player-refresh').value);
            this.settings.autoSave = modal.querySelector('#setting-auto-save').checked;
            this.settings.autoSaveInterval = parseInt(modal.querySelector('#setting-auto-save-interval').value);
            this.settings.enableKeyboardShortcuts = modal.querySelector('#setting-keyboard-shortcuts').checked;
            this.settings.enableSoundEffects = modal.querySelector('#setting-sound-effects').checked;
            this.settings.soundVolume = parseFloat(modal.querySelector('#setting-sound-volume').value);
            this.settings.enableBackgroundMusic = modal.querySelector('#setting-background-music').checked;
            this.settings.musicVolume = parseFloat(modal.querySelector('#setting-music-volume').value);
            
            // Apply and save settings
            this.applySettings();
            this.saveSettings();
            
            // Close the modal
            this.app.ui.closeModal(modal);
            
            this.app.showAlert('Settings saved successfully.');
        });
    }
}
