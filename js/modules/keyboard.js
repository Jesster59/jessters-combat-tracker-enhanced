/**
 * Keyboard Manager for Jesster's Combat Tracker
 * Handles keyboard shortcuts
 */
class KeyboardManager {
    constructor(app) {
        this.app = app;
        this.enabled = true;
        this.shortcuts = {
            // Combat controls
            's': { description: 'Start/End Combat', action: this.toggleCombat.bind(this) },
            'n': { description: 'Next Turn', action: this.nextTurn.bind(this) },
            'i': { description: 'Roll Initiative', action: this.rollInitiative.bind(this) },
            
            // Creature management
            'h': { description: 'Add Hero', action: this.addHero.bind(this) },
            'm': { description: 'Add Monster', action: this.addMonster.bind(this) },
            'Tab': { description: 'Select Next Creature', action: this.selectNextCreature.bind(this) },
            
            // Dice rolling
            'r': { description: 'Roll d20', action: this.rollD20.bind(this) },
            'Shift+r': { description: 'Roll with Advantage', action: this.rollWithAdvantage.bind(this) },
            'Control+r': { description: 'Roll with Disadvantage', action: this.rollWithDisadvantage.bind(this) },
            
            // Other
            'Control+,': { description: 'Open Settings', action: this.openSettings.bind(this) },
            'p': { description: 'Toggle Player View', action: this.togglePlayerView.bind(this) },
            '?': { description: 'Show Shortcuts', action: this.showShortcuts.bind(this) }
        };
        console.log("Keyboard Manager initialized");
    }
    
    /**
     * Initialize the keyboard manager
     */
    init() {
        // Add event listener for keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        
        console.log("Keyboard Manager initialized");
    }
    
    /**
     * Handle keydown events
     * @param {KeyboardEvent} event - The keydown event
     */
    handleKeyDown(event) {
        // Don't handle shortcuts if disabled
        if (!this.enabled) return;
        
        // Don't handle shortcuts if a modal is open
        if (document.querySelector('.modal-backdrop')) return;
        
        // Don't handle shortcuts if an input element is focused
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
        
        // Build the key string
        let keyString = '';
        if (event.ctrlKey) keyString += 'Control+';
        if (event.shiftKey) keyString += 'Shift+';
        if (event.altKey) keyString += 'Alt+';
        keyString += event.key;
        
        // Check if the key string matches a shortcut
        const shortcut = this.shortcuts[keyString];
        if (shortcut) {
            event.preventDefault();
            shortcut.action();
        }
    }
    
    /**
     * Enable or disable keyboard shortcuts
     * @param {boolean} enabled - Whether shortcuts should be enabled
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }
    
    /**
     * Toggle combat
     */
    toggleCombat() {
        if (this.app.state.combatStarted) {
            if (this.app.settings.getSetting('confirmEndCombat', true)) {
                this.app.showConfirm('Are you sure you want to end combat?', () => {
                    this.app.combat.endCombat();
                });
            } else {
                this.app.combat.endCombat();
            }
        } else {
            this.app.combat.startCombat();
        }
    }
    
    /**
     * Next turn
     */
    nextTurn() {
        if (this.app.state.combatStarted) {
            this.app.combat.nextTurn();
        } else {
            this.app.showAlert('Combat has not started yet.');
        }
    }
    
    /**
     * Roll initiative
     */
    rollInitiative() {
        this.app.combat.rollInitiativeForAll();
    }
    
    /**
     * Add hero
     */
    addHero() {
        this.app.ui.openAddHeroModal();
    }
    
    /**
     * Add monster
     */
    addMonster() {
        this.app.ui.openAddMonsterModal();
    }
    
    /**
     * Select next creature
     */
    selectNextCreature() {
        // TODO: Implement creature selection
        console.log('Select next creature');
    }
    
    /**
     * Roll d20
     */
    rollD20() {
        this.app.dice.rollAndDisplay('1d20');
    }
    
    /**
     * Roll with advantage
     */
    rollWithAdvantage() {
        const result = this.app.dice.rollWithAdvantage();
        this.app.dice.displayRollResult(result);
    }
    
    /**
     * Roll with disadvantage
     */
    rollWithDisadvantage() {
        const result = this.app.dice.rollWithDisadvantage();
        this.app.dice.displayRollResult(result);
    }
    
    /**
     * Open settings
     */
    openSettings() {
        this.app.settings.openSettingsModal();
    }
    
    /**
     * Toggle player view
     */
    togglePlayerView() {
        if (this.app.state.playerViewWindow && !this.app.state.playerViewWindow.closed) {
            this.app.state.playerViewWindow.close();
            this.app.state.playerViewWindow = null;
            this.app.logEvent('Player view closed.');
        } else {
            this.app.ui.openPlayerView();
        }
    }
    
    /**
     * Show shortcuts
     */
    showShortcuts() {
        this.showShortcutsPanel();
    }
    
    /**
     * Show the shortcuts panel
     */
    showShortcutsPanel() {
        const modal = this.app.ui.createModal({
            title: 'Keyboard Shortcuts',
            content: `
                <div class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <h3 class="font-semibold mb-2">Combat Controls</h3>
                            <ul class="space-y-2">
                                <li class="flex justify-between">
                                    <span>Start/End Combat</span>
                                    <span class="keyboard-shortcut">S</span>
                                </li>
                                <li class="flex justify-between">
                                    <span>Next Turn</span>
                                    <span class="keyboard-shortcut">N</span>
                                </li>
                                <li class="flex justify-between">
                                    <span>Roll Initiative</span>
                                    <span class="keyboard-shortcut">I</span>
                                </li>
                            </ul>
                        </div>
                        
                        <div>
                            <h3 class="font-semibold mb-2">Creature Management</h3>
                            <ul class="space-y-2">
                                <li class="flex justify-between">
                                    <span>Add Hero</span>
                                    <span class="keyboard-shortcut">H</span>
                                </li>
                                <li class="flex justify-between">
                                    <span>Add Monster</span>
                                    <span class="keyboard-shortcut">M</span>
                                </li>
                                <li class="flex justify-between">
                                    <span>Select Next Creature</span>
                                    <span class="keyboard-shortcut">Tab</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <h3 class="font-semibold mb-2">Dice Rolling</h3>
                            <ul class="space-y-2">
                                <li class="flex justify-between">
                                    <span>Roll d20</span>
                                    <span class="keyboard-shortcut">R</span>
                                </li>
                                <li class="flex justify-between">
                                    <span>Roll with Advantage</span>
                                    <span class="keyboard-shortcut">Shift+R</span>
                                </li>
                                <li class="flex justify-between">
                                    <span>Roll with Disadvantage</span>
                                    <span class="keyboard-shortcut">Ctrl+R</span>
                                </li>
                            </ul>
                        </div>
                        
                        <div>
                            <h3 class="font-semibold mb-2">Other</h3>
                            <ul class="space-y-2">
                                <li class="flex justify-between">
                                    <span>Open Settings</span>
                                    <span class="keyboard-shortcut">Ctrl+,</span>
                                </li>
                                <li class="flex justify-between">
                                    <span>Toggle Player View</span>
                                    <span class="keyboard-shortcut">P</span>
                                </li>
                                <li class="flex justify-between">
                                    <span>Show This Panel</span>
                                    <span class="keyboard-shortcut">?</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="flex justify-end mt-4">
                        <button id="close-shortcuts-btn" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                            Close
                        </button>
                    </div>
                </div>
            `,
            width: 'max-w-2xl'
        });
        
        // Add event listener for close button
        modal.querySelector('#close-shortcuts-btn').addEventListener('click', () => {
            this.app.ui.closeModal(modal.parentNode);
        });
    }
}
