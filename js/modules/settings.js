/**
 * Settings Manager for Jesster's Combat Tracker
 * Handles application settings
 */
class SettingsManager {
    constructor(app) {
        this.app = app;
        this.settings = {
            theme: 'theme-default',
            soundEnabled: true,
            musicEnabled: false,
            soundVolume: 0.5,
            musicVolume: 0.3,
            autoSave: true,
            autoSaveInterval: 5, // minutes
            playerViewRefreshRate: 5, // seconds
            confirmEndCombat: true,
            showHotbar: true,
            showAudioControls: true,
            diceRollMode: 'normal', // normal, 3d, text
            keyboardShortcutsEnabled: true
        };
        console.log("Settings Manager initialized");
    }
    
    /**
     * Initialize the settings manager
     */
    async init() {
        // Load settings from storage
        this.loadSettings();
        
        // Apply initial settings
        this.applySettings();
        
        console.log("Settings Manager initialized");
    }
    
    /**
     * Load settings from storage
     */
    loadSettings() {
        const savedSettings = this.app.storage.loadData('settings', null);
        if (savedSettings) {
            this.settings = { ...this.settings, ...savedSettings };
        }
    }
    
    /**
     * Save settings to storage
     */
    saveSettings() {
        this.app.storage.saveData('settings', this.settings);
    }
    
    /**
     * Apply settings to the application
     */
    applySettings() {
        // Apply theme
        document.documentElement.className = this.settings.theme;
        
        // Apply audio settings
        if (this.app.audio) {
            this.app.audio.setEnabled(this.settings.soundEnabled);
            this.app.audio.setVolume(this.settings.soundVolume);
            
            if (this.settings.musicEnabled) {
                this.app.audio.startBackgroundMusic();
            } else {
                this.app.audio.stopBackgroundMusic();
            }
        }
        
        // Apply hotbar visibility
        const hotbar = document.getElementById('action-hotbar');
        if (hotbar) {
            hotbar.style.display = this.settings.showHotbar ? 'block' : 'none';
        }
        
        // Apply audio controls visibility
        const audioControls = document.getElementById('audio-controls');
        if (audioControls) {
            audioControls.style.display = this.settings.showAudioControls ? 'flex' : 'none';
        }
        
        // Apply keyboard shortcuts
        if (this.app.keyboard) {
            this.app.keyboard.setEnabled(this.settings.keyboardShortcutsEnabled);
        }
    }
    
    /**
     * Get a setting value
     * @param {string} key - The setting key
     * @param {any} defaultValue - The default value if the setting doesn't exist
     * @returns {any} - The setting value
     */
    getSetting(key, defaultValue = null) {
        return this.settings[key] !== undefined ? this.settings[key] : defaultValue;
    }
    
    /**
     * Set a setting value
     * @param {string} key - The setting key
     * @param {any} value - The setting value
     */
    setSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        this.applySettings();
    }
    
    /**
     * Set the theme
     * @param {string} theme - The theme name
     */
    setTheme(theme) {
        this.settings.theme = theme;
        this.saveSettings();
        
        // Apply theme
        document.documentElement.className = theme;
        
        // Update UI elements that depend on theme
        this.app.ui.updateThemeElements();
    }
    
    /**
     * Import settings from an object
     * @param {Object} settings - The settings to import
     */
    importSettings(settings) {
        this.settings = { ...this.settings, ...settings };
        this.saveSettings();
        this.applySettings();
    }
    
    /**
     * Open the settings modal
     */
    openSettingsModal() {
        const modal = this.app.ui.createModal({
            title: 'Settings',
            content: `
                <div class="space-y-6">
                    <div class="space-y-4">
                        <h3 class="text-lg font-semibold border-b border-gray-700 pb-2">Appearance</h3>
                        
                        <div>
                            <label class="block text-gray-300 mb-2">Theme:</label>
                            <select id="theme-select" class="w-full bg-gray-700 text-white px-3 py-2 rounded">
                                <option value="theme-default" ${this.settings.theme === 'theme-default' ? 'selected' : ''}>Default (Dark)</option>
                                <option value="theme-light" ${this.settings.theme === 'theme-light' ? 'selected' : ''}>Light Mode</option>
                                <option value="theme-high-contrast" ${this.settings.theme === 'theme-high-contrast' ? 'selected' : ''}>High Contrast</option>
                                <option value="theme-fantasy" ${this.settings.theme === 'theme-fantasy' ? 'selected' : ''}>Fantasy</option>
                                                        <select id="theme-select" class="w-full bg-gray-700 text-white px-3 py-2 rounded">
                                <option value="theme-default" ${this.settings.theme === 'theme-default' ? 'selected' : ''}>Default (Dark)</option>
                                <option value="theme-light" ${this.settings.theme === 'theme-light' ? 'selected' : ''}>Light Mode</option>
                                <option value="theme-high-contrast" ${this.settings.theme === 'theme-high-contrast' ? 'selected' : ''}>High Contrast</option>
                                <option value="theme-fantasy" ${this.settings.theme === 'theme-fantasy' ? 'selected' : ''}>Fantasy</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-gray-300 mb-2">Dice Roll Display:</label>
                            <select id="dice-roll-mode" class="w-full bg-gray-700 text-white px-3 py-2 rounded">
                                <option value="normal" ${this.settings.diceRollMode === 'normal' ? 'selected' : ''}>Normal</option>
                                <option value="3d" ${this.settings.diceRollMode === '3d' ? 'selected' : ''}>3D Dice</option>
                                <option value="text" ${this.settings.diceRollMode === 'text' ? 'selected' : ''}>Text Only</option>
                            </select>
                        </div>
                        
                        <div class="flex items-center justify-between">
                            <label class="text-gray-300">Show Hotbar:</label>
                            <label class="switch">
                                <input type="checkbox" id="show-hotbar" ${this.settings.showHotbar ? 'checked' : ''}>
                                <span class="slider round"></span>
                            </label>
                        </div>
                        
                        <div class="flex items-center justify-between">
                            <label class="text-gray-300">Show Audio Controls:</label>
                            <label class="switch">
                                <input type="checkbox" id="show-audio-controls" ${this.settings.showAudioControls ? 'checked' : ''}>
                                <span class="slider round"></span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="space-y-4">
                        <h3 class="text-lg font-semibold border-b border-gray-700 pb-2">Audio</h3>
                        
                        <div class="flex items-center justify-between">
                            <label class="text-gray-300">Sound Effects:</label>
                            <label class="switch">
                                <input type="checkbox" id="sound-enabled" ${this.settings.soundEnabled ? 'checked' : ''}>
                                <span class="slider round"></span>
                            </label>
                        </div>
                        
                        <div>
                            <label class="block text-gray-300 mb-2">Sound Volume:</label>
                            <input type="range" id="sound-volume" class="w-full" min="0" max="1" step="0.1" value="${this.settings.soundVolume}">
                            <div class="flex justify-between text-xs text-gray-400 mt-1">
                                <span>0%</span>
                                <span>50%</span>
                                <span>100%</span>
                            </div>
                        </div>
                        
                        <div class="flex items-center justify-between">
                            <label class="text-gray-300">Background Music:</label>
                            <label class="switch">
                                <input type="checkbox" id="music-enabled" ${this.settings.musicEnabled ? 'checked' : ''}>
                                <span class="slider round"></span>
                            </label>
                        </div>
                        
                        <div>
                            <label class="block text-gray-300 mb-2">Music Volume:</label>
                            <input type="range" id="music-volume" class="w-full" min="0" max="1" step="0.1" value="${this.settings.musicVolume}">
                            <div class="flex justify-between text-xs text-gray-400 mt-1">
                                <span>0%</span>
                                <span>50%</span>
                                <span>100%</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="space-y-4">
                        <h3 class="text-lg font-semibold border-b border-gray-700 pb-2">Player View</h3>
                        
                        <div>
                            <label class="block text-gray-300 mb-2">Refresh Rate (seconds):</label>
                            <input type="number" id="player-view-refresh-rate" class="w-full bg-gray-700 text-white px-3 py-2 rounded" min="1" max="30" value="${this.settings.playerViewRefreshRate}">
                        </div>
                        
                        <div>
                            <button id="player-view-settings-btn" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded w-full">
                                Configure Player View
                            </button>
                        </div>
                    </div>
                    
                    <div class="space-y-4">
                        <h3 class="text-lg font-semibold border-b border-gray-700 pb-2">Auto-Save</h3>
                        
                        <div class="flex items-center justify-between">
                            <label class="text-gray-300">Enable Auto-Save:</label>
                            <label class="switch">
                                <input type="checkbox" id="auto-save" ${this.settings.autoSave ? 'checked' : ''}>
                                <span class="slider round"></span>
                            </label>
                        </div>
                        
                        <div>
                            <label class="block text-gray-300 mb-2">Auto-Save Interval (minutes):</label>
                            <input type="number" id="auto-save-interval" class="w-full bg-gray-700 text-white px-3 py-2 rounded" min="1" max="60" value="${this.settings.autoSaveInterval}">
                        </div>
                    </div>
                    
                    <div class="space-y-4">
                        <h3 class="text-lg font-semibold border-b border-gray-700 pb-2">Miscellaneous</h3>
                        
                        <div class="flex items-center justify-between">
                            <label class="text-gray-300">Confirm End Combat:</label>
                            <label class="switch">
                                <input type="checkbox" id="confirm-end-combat" ${this.settings.confirmEndCombat ? 'checked' : ''}>
                                <span class="slider round"></span>
                            </label>
                        </div>
                        
                        <div class="flex items-center justify-between">
                            <label class="text-gray-300">Enable Keyboard Shortcuts:</label>
                            <label class="switch">
                                <input type="checkbox" id="keyboard-shortcuts-enabled" ${this.settings.keyboardShortcutsEnabled ? 'checked' : ''}>
                                <span class="slider round"></span>
                            </label>
                        </div>
                        
                        <div>
                            <button id="view-shortcuts-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded w-full">
                                View Keyboard Shortcuts
                            </button>
                        </div>
                    </div>
                    
                    <div class="flex justify-end space-x-2">
                        <button id="reset-settings-btn" class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                            Reset to Default
                        </button>
                        <button id="save-settings-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Save Settings
                        </button>
                    </div>
                </div>
                
                <style>
                    /* Switch styles */
                    .switch {
                        position: relative;
                        display: inline-block;
                        width: 50px;
                        height: 24px;
                    }
                    
                    .switch input {
                        opacity: 0;
                        width: 0;
                        height: 0;
                    }
                    
                    .slider {
                        position: absolute;
                        cursor: pointer;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background-color: #4b5563;
                        transition: .4s;
                    }
                    
                    .slider:before {
                        position: absolute;
                        content: "";
                        height: 16px;
                        width: 16px;
                        left: 4px;
                        bottom: 4px;
                        background-color: white;
                        transition: .4s;
                    }
                    
                    input:checked + .slider {
                        background-color: #4f46e5;
                    }
                    
                    input:focus + .slider {
                        box-shadow: 0 0 1px #4f46e5;
                    }
                    
                    input:checked + .slider:before {
                        transform: translateX(26px);
                    }
                    
                    .slider.round {
                        border-radius: 24px;
                    }
                    
                    .slider.round:before {
                        border-radius: 50%;
                    }
                </style>
            `,
            width: 'max-w-2xl'
        });
        
        // Add event listeners
        const themeSelect = modal.querySelector('#theme-select');
        const diceRollMode = modal.querySelector('#dice-roll-mode');
        const showHotbar = modal.querySelector('#show-hotbar');
        const showAudioControls = modal.querySelector('#show-audio-controls');
        const soundEnabled = modal.querySelector('#sound-enabled');
        const soundVolume = modal.querySelector('#sound-volume');
        const musicEnabled = modal.querySelector('#music-enabled');
        const musicVolume = modal.querySelector('#music-volume');
        const playerViewRefreshRate = modal.querySelector('#player-view-refresh-rate');
        const playerViewSettingsBtn = modal.querySelector('#player-view-settings-btn');
        const autoSave = modal.querySelector('#auto-save');
        const autoSaveInterval = modal.querySelector('#auto-save-interval');
        const confirmEndCombat = modal.querySelector('#confirm-end-combat');
        const keyboardShortcutsEnabled = modal.querySelector('#keyboard-shortcuts-enabled');
        const viewShortcutsBtn = modal.querySelector('#view-shortcuts-btn');
        const resetSettingsBtn = modal.querySelector('#reset-settings-btn');
        const saveSettingsBtn = modal.querySelector('#save-settings-btn');
        
        // Player view settings button
        playerViewSettingsBtn.addEventListener('click', () => {
            this.app.ui.openPlayerViewSettingsModal();
        });
        
        // View shortcuts button
        viewShortcutsBtn.addEventListener('click', () => {
            this.app.keyboard.showShortcutsPanel();
        });
        
        // Reset settings button
        resetSettingsBtn.addEventListener('click', () => {
            this.app.showConfirm('Are you sure you want to reset all settings to default?', () => {
                // Reset to default settings
                this.settings = {
                    theme: 'theme-default',
                    soundEnabled: true,
                    musicEnabled: false,
                    soundVolume: 0.5,
                    musicVolume: 0.3,
                    autoSave: true,
                    autoSaveInterval: 5,
                    playerViewRefreshRate: 5,
                    confirmEndCombat: true,
                    showHotbar: true,
                    showAudioControls: true,
                    diceRollMode: 'normal',
                    keyboardShortcutsEnabled: true
                };
                
                // Save and apply settings
                this.saveSettings();
                this.applySettings();
                
                // Close the modal
                this.app.ui.closeModal(modal.parentNode);
                
                // Show confirmation
                this.app.showAlert('Settings have been reset to default.');
            });
        });
        
        // Save settings button
        saveSettingsBtn.addEventListener('click', () => {
            // Update settings from form values
            this.settings.theme = themeSelect.value;
            this.settings.diceRollMode = diceRollMode.value;
            this.settings.showHotbar = showHotbar.checked;
            this.settings.showAudioControls = showAudioControls.checked;
            this.settings.soundEnabled = soundEnabled.checked;
            this.settings.soundVolume = parseFloat(soundVolume.value);
            this.settings.musicEnabled = musicEnabled.checked;
            this.settings.musicVolume = parseFloat(musicVolume.value);
            this.settings.playerViewRefreshRate = parseInt(playerViewRefreshRate.value);
            this.settings.autoSave = autoSave.checked;
            this.settings.autoSaveInterval = parseInt(autoSaveInterval.value);
            this.settings.confirmEndCombat = confirmEndCombat.checked;
            this.settings.keyboardShortcutsEnabled = keyboardShortcutsEnabled.checked;
            
            // Save and apply settings
            this.saveSettings();
            this.applySettings();
            
            // Close the modal
            this.app.ui.closeModal(modal.parentNode);
            
            // Show confirmation
            this.app.showAlert('Settings saved successfully.');
        });
    }
    
    /**
     * Get all settings
     * @returns {Object} - All settings
     */
    getAllSettings() {
        return { ...this.settings };
    }
}
