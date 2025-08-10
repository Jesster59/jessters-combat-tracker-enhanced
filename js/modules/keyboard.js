/**
 * Jesster's Combat Tracker
 * Keyboard Module
 * Version 2.3.1
 * 
 * This module handles keyboard shortcuts and hotkeys for the application,
 * allowing users to perform common actions quickly without using the mouse.
 */

/**
 * Default keyboard shortcuts configuration
 */
const DEFAULT_SHORTCUTS = {
  nextTurn: { key: 'Space', description: 'Move to next turn' },
  previousTurn: { key: 'Shift+Space', description: 'Move to previous turn' },
  addPlayer: { key: 'Ctrl+P', description: 'Add player' },
  addMonster: { key: 'Ctrl+M', description: 'Add monster' },
  rollInitiative: { key: 'Ctrl+I', description: 'Roll initiative' },
  rollDice: { key: 'Ctrl+R', description: 'Roll dice' },
  saveEncounter: { key: 'Ctrl+S', description: 'Save encounter' },
  loadEncounter: { key: 'Ctrl+O', description: 'Load encounter' },
  clearEncounter: { key: 'Ctrl+Shift+C', description: 'Clear encounter' },
  toggleFullscreen: { key: 'F11', description: 'Toggle fullscreen' },
  help: { key: 'F1', description: 'Show help' },
  undo: { key: 'Ctrl+Z', description: 'Undo last action' },
  redo: { key: 'Ctrl+Y', description: 'Redo last action' },
  search: { key: 'Ctrl+F', description: 'Search' },
  togglePanel: { key: 'Ctrl+B', description: 'Toggle sidebar' },
  focusDiceInput: { key: 'D', description: 'Focus dice input' },
  focusSearchInput: { key: '/', description: 'Focus search input' },
  selectNextCombatant: { key: 'ArrowDown', description: 'Select next combatant' },
  selectPreviousCombatant: { key: 'ArrowUp', description: 'Select previous combatant' },
  increaseDamage: { key: '+', description: 'Increase damage/healing amount' },
  decreaseDamage: { key: '-', description: 'Decrease damage/healing amount' },
  applyDamage: { key: 'Enter', description: 'Apply damage/healing' },
  toggleCondition: { key: 'C', description: 'Toggle condition panel' },
  toggleNotes: { key: 'N', description: 'Toggle notes panel' },
  toggleHistory: { key: 'H', description: 'Toggle history panel' },
  toggleSettings: { key: 'S', description: 'Toggle settings panel' },
  escape: { key: 'Escape', description: 'Close dialog/cancel action' }
};

/**
 * Class representing a keyboard shortcut manager
 */
export class KeyboardManager {
  /**
   * Create a keyboard manager
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.shortcuts = { ...DEFAULT_SHORTCUTS };
    this.handlers = {};
    this.enabled = true;
    this.contextStack = ['global']; // Context stack with global as default
    this.customShortcuts = {};
    this.ignoredElements = ['INPUT', 'TEXTAREA', 'SELECT'];
    this.modifierState = {
      ctrl: false,
      alt: false,
      shift: false,
      meta: false
    };
    
    // Apply options
    if (options.shortcuts) {
      this.updateShortcuts(options.shortcuts);
    }
    
    if (options.ignoredElements) {
      this.ignoredElements = options.ignoredElements;
    }
    
    // Bind event handlers
    this._handleKeyDown = this._handleKeyDown.bind(this);
    this._handleKeyUp = this._handleKeyUp.bind(this);
    this._handleBlur = this._handleBlur.bind(this);
    
    // Initialize
    this._init();
  }
  
  /**
   * Initialize the keyboard manager
   * @private
   */
  _init() {
    // Add event listeners
    document.addEventListener('keydown', this._handleKeyDown);
    document.addEventListener('keyup', this._handleKeyUp);
    window.addEventListener('blur', this._handleBlur);
  }
  
  /**
   * Handle keydown events
   * @param {KeyboardEvent} event - The keyboard event
   * @private
   */
  _handleKeyDown(event) {
    // Update modifier state
    this._updateModifierState(event);
    
    // Skip if disabled or if target is an ignored element
    if (!this.enabled || this._shouldIgnoreEvent(event)) {
      return;
    }
    
    // Get the shortcut key representation
    const shortcutKey = this._getShortcutKey(event);
    
    // Check if this shortcut exists in the current context
    const currentContext = this.contextStack[this.contextStack.length - 1];
    const handler = this._findHandler(shortcutKey, currentContext);
    
    if (handler) {
      // Prevent default browser action if we have a handler
      event.preventDefault();
      
      // Execute the handler
      handler(event);
    }
  }
  
  /**
   * Handle keyup events
   * @param {KeyboardEvent} event - The keyboard event
   * @private
   */
  _handleKeyUp(event) {
    // Update modifier state
    this._updateModifierState(event);
  }
  
  /**
   * Handle window blur events
   * @private
   */
  _handleBlur() {
    // Reset modifier state when window loses focus
    this.modifierState = {
      ctrl: false,
      alt: false,
      shift: false,
      meta: false
    };
  }
  
  /**
   * Update the state of modifier keys
   * @param {KeyboardEvent} event - The keyboard event
   * @private
   */
  _updateModifierState(event) {
    this.modifierState.ctrl = event.ctrlKey;
    this.modifierState.alt = event.altKey;
    this.modifierState.shift = event.shiftKey;
    this.modifierState.meta = event.metaKey;
  }
  
  /**
   * Check if the event should be ignored
   * @param {KeyboardEvent} event - The keyboard event
   * @returns {boolean} True if the event should be ignored
   * @private
   */
  _shouldIgnoreEvent(event) {
    // Ignore events from form elements unless they're explicitly handled
    if (this.ignoredElements.includes(event.target.tagName)) {
      // Special case for Escape key which we always want to handle
      if (event.key === 'Escape') {
        return false;
      }
      
      // Special case for Enter key in search inputs
      if (event.key === 'Enter' && event.target.getAttribute('data-allow-enter') === 'true') {
        return false;
      }
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Get a string representation of a keyboard shortcut from an event
   * @param {KeyboardEvent} event - The keyboard event
   * @returns {string} The shortcut key representation
   * @private
   */
  _getShortcutKey(event) {
    const key = event.key;
    const parts = [];
    
    if (event.ctrlKey) parts.push('Ctrl');
    if (event.altKey) parts.push('Alt');
    if (event.shiftKey) parts.push('Shift');
    if (event.metaKey) parts.push('Meta');
    
    // Handle special case for Space key
    if (key === ' ') {
      parts.push('Space');
    } else if (key.length === 1) {
      // For single character keys, use uppercase
      parts.push(key.toUpperCase());
    } else {
      // For special keys like Enter, Escape, etc.
      parts.push(key);
    }
    
    return parts.join('+');
  }
  
  /**
   * Find a handler for a shortcut in the given context
   * @param {string} shortcutKey - The shortcut key
   * @param {string} context - The context to search in
   * @returns {Function|null} The handler function or null if not found
   * @private
   */
  _findHandler(shortcutKey, context) {
    // Check context-specific handlers first
    if (this.handlers[context] && this.handlers[context][shortcutKey]) {
      return this.handlers[context][shortcutKey];
    }
    
    // Check global handlers if not in global context
    if (context !== 'global' && this.handlers.global && this.handlers.global[shortcutKey]) {
      return this.handlers.global[shortcutKey];
    }
    
    return null;
  }
  
  /**
   * Register a keyboard shortcut handler
   * @param {string} action - The action identifier
   * @param {Function} handler - The handler function
   * @param {string} context - The context for this shortcut
   * @returns {KeyboardManager} The keyboard manager instance for chaining
   */
  register(action, handler, context = 'global') {
    if (typeof handler !== 'function') {
      console.error(`Handler for "${action}" must be a function`);
      return this;
    }
    
    // Get the shortcut key for this action
    const shortcut = this._getShortcutForAction(action);
    
    if (!shortcut) {
      console.warn(`No shortcut defined for action "${action}"`);
      return this;
    }
    
    // Initialize context if needed
    if (!this.handlers[context]) {
      this.handlers[context] = {};
    }
    
    // Register the handler
    this.handlers[context][shortcut.key] = handler;
    
    return this;
  }
  
  /**
   * Unregister a keyboard shortcut handler
   * @param {string} action - The action identifier
   * @param {string} context - The context for this shortcut
   * @returns {KeyboardManager} The keyboard manager instance for chaining
   */
  unregister(action, context = 'global') {
    // Get the shortcut key for this action
    const shortcut = this._getShortcutForAction(action);
    
    if (!shortcut) {
      return this;
    }
    
    // Remove the handler if it exists
    if (this.handlers[context] && this.handlers[context][shortcut.key]) {
      delete this.handlers[context][shortcut.key];
    }
    
    return this;
  }
  
  /**
   * Get the shortcut configuration for an action
   * @param {string} action - The action identifier
   * @returns {Object|null} The shortcut configuration or null if not found
   * @private
   */
  _getShortcutForAction(action) {
    // Check custom shortcuts first
    if (this.customShortcuts[action]) {
      return this.customShortcuts[action];
    }
    
    // Fall back to default shortcuts
    return this.shortcuts[action];
  }
  
  /**
   * Update keyboard shortcuts configuration
   * @param {Object} shortcuts - The new shortcuts configuration
   * @returns {KeyboardManager} The keyboard manager instance for chaining
   */
  updateShortcuts(shortcuts) {
    // Store custom shortcuts
    this.customShortcuts = { ...shortcuts };
    
    // Re-register all handlers with new shortcuts
    this._reregisterHandlers();
    
    return this;
  }
  
  /**
   * Re-register all handlers with updated shortcuts
   * @private
   */
  _reregisterHandlers() {
    // Store old handlers
    const oldHandlers = { ...this.handlers };
    
    // Clear current handlers
    this.handlers = {};
    
    // Re-register all handlers
    Object.entries(oldHandlers).forEach(([context, contextHandlers]) => {
      Object.entries(contextHandlers).forEach(([shortcutKey, handler]) => {
        // Find the action for this shortcut key
        const action = this._findActionForShortcutKey(shortcutKey);
        
        if (action) {
          this.register(action, handler, context);
        }
      });
    });
  }
  
  /**
   * Find the action for a shortcut key
   * @param {string} shortcutKey - The shortcut key
   * @returns {string|null} The action or null if not found
   * @private
   */
  _findActionForShortcutKey(shortcutKey) {
    // Check default shortcuts
    for (const [action, shortcut] of Object.entries(this.shortcuts)) {
      if (shortcut.key === shortcutKey) {
        return action;
      }
    }
    
    // Check custom shortcuts
    for (const [action, shortcut] of Object.entries(this.customShortcuts)) {
      if (shortcut.key === shortcutKey) {
        return action;
      }
    }
    
    return null;
  }
  
  /**
   * Push a new context onto the context stack
   * @param {string} context - The context to push
   * @returns {KeyboardManager} The keyboard manager instance for chaining
   */
  pushContext(context) {
    this.contextStack.push(context);
    return this;
  }
  
  /**
   * Pop the top context from the context stack
   * @returns {string|null} The popped context or null if stack is empty
   */
  popContext() {
    if (this.contextStack.length <= 1) {
      return null; // Don't pop the global context
    }
    
    return this.contextStack.pop();
  }
  
  /**
   * Replace the current context with a new one
   * @param {string} context - The new context
   * @returns {KeyboardManager} The keyboard manager instance for chaining
   */
  setContext(context) {
    if (this.contextStack.length <= 1) {
      this.contextStack = ['global', context];
    } else {
      this.contextStack[this.contextStack.length - 1] = context;
    }
    
    return this;
  }
  
  /**
   * Get the current context
   * @returns {string} The current context
   */
  getCurrentContext() {
    return this.contextStack[this.contextStack.length - 1];
  }
  
  /**
   * Enable keyboard shortcuts
   * @returns {KeyboardManager} The keyboard manager instance for chaining
   */
  enable() {
    this.enabled = true;
    return this;
  }
  
  /**
   * Disable keyboard shortcuts
   * @returns {KeyboardManager} The keyboard manager instance for chaining
   */
  disable() {
    this.enabled = false;
    return this;
  }
  
  /**
   * Check if keyboard shortcuts are enabled
   * @returns {boolean} True if enabled
   */
  isEnabled() {
    return this.enabled;
  }
  
  /**
   * Get all registered shortcuts
   * @returns {Object} The shortcuts configuration
   */
  getShortcuts() {
    // Combine default and custom shortcuts
    const result = { ...this.shortcuts };
    
    // Override with custom shortcuts
    Object.entries(this.customShortcuts).forEach(([action, shortcut]) => {
      result[action] = shortcut;
    });
    
    return result;
  }
  
  /**
   * Get shortcuts for a specific context
   * @param {string} context - The context
   * @returns {Object} The shortcuts for the context
   */
  getContextShortcuts(context) {
    const result = {};
    
    // Get all shortcuts
    const allShortcuts = this.getShortcuts();
    
    // Filter to those that have handlers in this context
    if (this.handlers[context]) {
      Object.entries(allShortcuts).forEach(([action, shortcut]) => {
        if (this.handlers[context][shortcut.key]) {
          result[action] = shortcut;
        }
      });
    }
    
    return result;
  }
  
  /**
   * Reset shortcuts to defaults
   * @returns {KeyboardManager} The keyboard manager instance for chaining
   */
  resetToDefaults() {
    this.customShortcuts = {};
    this._reregisterHandlers();
    return this;
  }
  
  /**
   * Clean up event listeners
   */
  destroy() {
    document.removeEventListener('keydown', this._handleKeyDown);
    document.removeEventListener('keyup', this._handleKeyUp);
    window.removeEventListener('blur', this._handleBlur);
  }
}

/**
 * Create a keyboard shortcut help overlay
 * @param {Object} shortcuts - The shortcuts configuration
 * @returns {HTMLElement} The created overlay element
 */
export function createShortcutHelpOverlay(shortcuts) {
  // Create overlay container
  const overlay = document.createElement('div');
  overlay.className = 'jct-shortcut-help-overlay';
  
  // Create content
  const content = document.createElement('div');
  content.className = 'jct-shortcut-help-content';
  
  // Create header
  const header = document.createElement('div');
  header.className = 'jct-shortcut-help-header';
  header.innerHTML = `
    <h2>Keyboard Shortcuts</h2>
    <button class="jct-shortcut-help-close" aria-label="Close">×</button>
  `;
  
  // Create shortcuts list
  const shortcutsList = document.createElement('div');
  shortcutsList.className = 'jct-shortcut-help-list';
  
  // Group shortcuts by category
  const categories = {
    'Combat': ['nextTurn', 'previousTurn', 'rollInitiative', 'clearEncounter'],
    'Combatants': ['addPlayer', 'addMonster', 'selectNextCombatant', 'selectPreviousCombatant'],
    'Actions': ['rollDice', 'increaseDamage', 'decreaseDamage', 'applyDamage', 'toggleCondition'],
    'Interface': ['toggleFullscreen', 'togglePanel', 'toggleNotes', 'toggleHistory', 'toggleSettings', 'escape'],
    'General': ['saveEncounter', 'loadEncounter', 'undo', 'redo', 'search', 'help', 'focusDiceInput', 'focusSearchInput']
  };
  
  // Add shortcuts by category
  Object.entries(categories).forEach(([category, actions]) => {
    const categoryElement = document.createElement('div');
    categoryElement.className = 'jct-shortcut-category';
    categoryElement.innerHTML = `<h3>${category}</h3>`;
    
    const categoryList = document.createElement('ul');
    
    actions.forEach(action => {
      if (shortcuts[action]) {
        const shortcut = shortcuts[action];
        const listItem = document.createElement('li');
        listItem.innerHTML = `
          <span class="jct-shortcut-description">${shortcut.description}</span>
          <span class="jct-shortcut-key">${formatShortcutKey(shortcut.key)}</span>
        `;
        categoryList.appendChild(listItem);
      }
    });
    
    categoryElement.appendChild(categoryList);
    shortcutsList.appendChild(categoryElement);
  });
  
  // Add close button event
  content.appendChild(header);
  content.appendChild(shortcutsList);
  overlay.appendChild(content);
  
  // Add close button event
  const closeButton = overlay.querySelector('.jct-shortcut-help-close');
  closeButton.addEventListener('click', () => {
    overlay.classList.add('closing');
    setTimeout(() => {
      overlay.remove();
    }, 300); // Match transition duration
  });
  
  // Add escape key handler
  const escapeHandler = (event) => {
    if (event.key === 'Escape') {
      closeButton.click();
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);
  
  return overlay;
}

/**
 * Format a shortcut key for display
 * @param {string} key - The shortcut key
 * @returns {string} The formatted shortcut key
 */
export function formatShortcutKey(key) {
  // Replace key names with symbols where appropriate
  return key
    .replace(/\+/g, ' + ')
    .replace(/Ctrl/g, isMac() ? '⌘' : 'Ctrl')
    .replace(/Alt/g, isMac() ? '⌥' : 'Alt')
    .replace(/Shift/g, '⇧')
    .replace(/Meta/g, isMac() ? '⌘' : 'Win')
    .replace(/ArrowUp/g, '↑')
    .replace(/ArrowDown/g, '↓')
    .replace(/ArrowLeft/g, '←')
    .replace(/ArrowRight/g, '→')
    .replace(/Enter/g, '↵')
    .replace(/Escape/g, 'Esc');
}

/**
 * Check if the current platform is macOS
 * @returns {boolean} True if the platform is macOS
 */
export function isMac() {
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
}

/**
 * Create a keyboard manager instance
 * @param {Object} options - Configuration options
 * @returns {KeyboardManager} The keyboard manager instance
 */
export function createKeyboardManager(options = {}) {
  return new KeyboardManager(options);
}

/**
 * Show the keyboard shortcut help overlay
 * @param {Object} shortcuts - The shortcuts configuration
 */
export function showShortcutHelp(shortcuts) {
  // Remove any existing overlay
  const existingOverlay = document.querySelector('.jct-shortcut-help-overlay');
  if (existingOverlay) {
    existingOverlay.remove();
  }
  
  // Create and add the overlay
  const overlay = createShortcutHelpOverlay(shortcuts);
  document.body.appendChild(overlay);
  
  // Trigger animation
  setTimeout(() => {
    overlay.classList.add('visible');
  }, 10);
}

// Export the main keyboard functions
export default {
  createKeyboardManager,
  showShortcutHelp,
  formatShortcutKey,
  isMac,
  DEFAULT_SHORTCUTS
};
