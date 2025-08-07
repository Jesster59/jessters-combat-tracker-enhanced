/**
 * Keyboard Manager for Jesster's Combat Tracker
 * Handles keyboard shortcuts and hotkeys
 */
class KeyboardManager {
    constructor(app) {
        this.app = app;
        this.enabled = true;
        this.shortcuts = [
            { key: 'n', description: 'Next Turn', action: () => this.app.combat.nextTurn() },
            { key: 'r', description: 'Roll Initiative', action: () => this.app.combat.rollInitiativeForAll() },
            { key: 's', description: 'Start/End Combat', action: () => this.toggleCombat() },
            { key: 'h', description: 'Add Hero', action: () => this.app.ui.openAddHeroModal() },
            { key: 'm', description: 'Add Monster', action: () => this.app.ui.openAddMonsterModal() },
            { key: 'p', description: 'Toggle Player View', action: () => this.app.ui.openPlayerView() },
            { key: 'd', description: 'Roll d20', action: () => this.app.dice.rollAndDisplay('1d20') },
            { key: '?', description: 'Show Keyboard Shortcuts', action: () => this.showShortcutsModal() },
            { key: 'Escape', description: 'Close Modal', action: () => this.app.ui.closeAllModals() }
        ];
        console.log("Keyboard Manager initialized");
    }
    
    /**
     * Initialize the keyboard manager
     */
    async init() {
        // Load settings
        this.enabled = this.app.settings.getSetting('enableKeyboardShortcuts', true);
    }
    
    /**
     * Handle key down events
     * @param {KeyboardEvent} event - The key event
     */
    handleKeyDown(event) {
        // Skip if keyboard shortcuts are disabled
        if (!this.enabled) return;
        
        // Skip if user is typing in an input field
        if (this.isUserTyping()) return;
        
        // Find matching shortcut
        const shortcut = this.shortcuts.find(s => s.key === event.key);
        if (shortcut) {
            event.preventDefault();
            shortcut.action();
        }
    }
    
    /**
     * Check if the user is currently typing in an input field
     * @returns {boolean} - Whether the user is typing
     */
    isUserTyping() {
        const activeElement = document.activeElement;
        const tagName = activeElement.tagName.toLowerCase();
        
        return (
            tagName === 'input' ||
            tagName === 'textarea' ||
            tagName === 'select' ||
            activeElement.isContentEditable
        );
    }
    
    /**
     * Toggle combat state
     */
    toggleCombat() {
        if (this.app.state.combatStarted) {
            this.app.combat.endCombat();
        } else {
            this.app.combat.startCombat();
        }
    }
    
    /**
     * Show the keyboard shortcuts modal
     */
    showShortcutsModal() {
        const modal = this.app.ui.createModal({
            title: 'Keyboard Shortcuts',
            content: `
                <div class="space-y-4">
                    <p class="text-gray-300 mb-4">The following keyboard shortcuts are available:</p>
                    
                    <table class="w-full">
                        <thead>
                            <tr class="text-left border-b border-gray-700">
                                <th class="pb-2 text-primary-300">Key</th>
                                <th class="pb-2 text-primary-300">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.shortcuts.map(shortcut => `
                                <tr class="border-b border-gray-800">
                                    <td class="py-2"><span class="keyboard-shortcut">${shortcut.key}</span></td>
                                    <td class="py-2">${shortcut.description}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <p class="text-gray-400 text-sm mt-4">Note: Shortcuts are disabled when typing in input fields.</p>
                    
                    <div class="flex justify-end">
                        <button id="shortcuts-close-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Close
                        </button>
                    </div>
                </div>
            `,
            width: 'max-w-lg'
        });
        
        // Add event listener for close button
        const closeBtn = modal.querySelector('#shortcuts-close-btn');
        closeBtn.addEventListener('click', () => {
            this.app.ui.closeModal(modal);
        });
    }
}
