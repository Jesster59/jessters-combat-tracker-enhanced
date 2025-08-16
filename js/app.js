/**
 * Jesster's Combat Tracker
 * Main Application Module
 * Version 2.3.1
 * 
 * This module serves as the main entry point for the application,
 * tying together all the other modules.
 */

import { createDiceRoller, createStatTracker, createCombatAnalyzer } from './stats.js';
import { createTacticalCombatManager } from './tactical.js';
import { createTemplateManager, createTemplateCollection } from './templates.js';
import { createThemeManager, ThemeMode } from './theme.js';
import { createComponent, ComponentType, Container, Panel, Button, Modal, Dialog, Input, Select, Toggle, RadioGroup, Table, ComponentVariant } from './ui.js';

/**
 * Application state
 */
const AppState = {
  INITIALIZING: 'initializing',
  READY: 'ready',
  LOADING: 'loading',
  SAVING: 'saving',
  ERROR: 'error'
};

/**
 * Combat state
 */
const CombatState = {
  INACTIVE: 'inactive',
  ACTIVE: 'active',
  PAUSED: 'paused',
  FINISHED: 'finished'
};

/**
 * Main application class
 */
export class CombatTrackerApp {
  /**
   * Create a combat tracker application
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      containerId: 'jct-app',
      storageKey: 'jct-data',
      autoSave: true,
      autoSaveInterval: 60000, // 1 minute
      defaultTheme: 'system',
      ...options
    };
    
    // Application state
    this.state = AppState.INITIALIZING;
    this.combatState = CombatState.INACTIVE;
    this.initialized = false;
    this.container = null;
    this.autoSaveTimer = null;
    
    // Core modules
    this.diceRoller = createDiceRoller();
    this.statTracker = createStatTracker();
    this.combatAnalyzer = createCombatAnalyzer();
    this.tacticalManager = createTacticalCombatManager();
    this.templateManager = createTemplateManager();
    this.themeManager = createThemeManager({
      defaultTheme: this.options.defaultTheme,
      autoApply: true
    });
    
    // UI components
    this.ui = {
      mainContainer: null,
      sidebar: null,
      content: null,
      header: null,
      footer: null,
      combatControls: null,
      initiativeList: null,
      tacticalView: null,
      statPanel: null,
      loadingModal: null,
      errorModal: null,
      canvasContainer: null 
    };
    
    // Combat data
    this.combat = {
      id: null,
      name: 'New Combat',
      round: 0,
      turn: 0,
      initiative: [],
      combatants: [],
      active: null,
      log: [],
      startTime: null,
      endTime: null
    };
    
    // Event listeners
    this.eventListeners = new Map();
    
    // Initialize the application
    this._initialize();
  }

  /**
   * Initialize the application
   * @private
   */
  _initialize() {
    // Find container element
    this.container = document.getElementById(this.options.containerId);
    
    if (!this.container) {
      console.error(`Container element with ID "${this.options.containerId}" not found`);
      this.state = AppState.ERROR;
      return;
    }
    
    // Load saved data
    this._loadData();
    
    // Create UI
    this._createUI();
    
    // Set up event listeners
    this._setupEventListeners();
    
    // Set up auto-save
    if (this.options.autoSave) {
      this._setupAutoSave();
    }
    
    // Mark as initialized
    this.initialized = true;
    this.state = AppState.READY;
    
    // Initialize the tactical map *after* the main UI has been rendered
    this._initializeTacticalMap();
    
    // Dispatch initialized event
    this._dispatchEvent('initialized', { app: this });
  }

  /**
   * Create the user interface
   * @private
   */
  _createUI() {
    // Create main container
    this.ui.mainContainer = new Container({
      className: 'jct-main-container',
      layout: 'vertical',
      gap: 0,
      padding: 0
    });
    
    // Create header
    this._createHeader();
    
    // Create content area
    this._createContent();
    
    // Create footer
    this._createFooter();
    
    // Create modals
    this._createModals();
    
    // Render main container
    this.ui.mainContainer.render(this.container);
  }

  /**
   * Create the header
   * @private
   */
  _createHeader() {
    this.ui.header = new Container({
      className: 'jct-header',
      layout: 'horizontal',
      gap: 16,
      padding: 16,
      justify: 'between',
      align: 'center'
    });
    
    // Create logo/title
    const logoContainer = new Container({
      className: 'jct-logo-container',
      layout: 'horizontal',
      gap: 8,
      align: 'center'
    });
    
    const logo = createComponent(ComponentType.ICON, {
      className: 'jct-logo',
      icon: '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm0 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>'
    });
    
    const title = createComponent(ComponentType.HEADING, {
      className: 'jct-title',
      level: 1,
      text: "Jesster's Combat Tracker"
    });
    
    logoContainer.addChild(logo);
    logoContainer.addChild(title);
    this.ui.header.addChild(logoContainer);
    
    // Create header actions
    const actionsContainer = new Container({
      className: 'jct-header-actions',
      layout: 'horizontal',
      gap: 8
    });
    
    // Create new combat button
    const newCombatButton = new Button({
      label: 'New Combat',
      icon: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>',
      onClick: () => this.newCombat()
    });
    
    // Create save button
    const saveButton = new Button({
      label: 'Save',
      icon: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>',
      onClick: () => this.saveData()
    });
    
    // Create load button
    const loadButton = new Button({
      label: 'Load',
      icon: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm-2 16c-2.05 0-3.81-1.24-4.58-3h1.71c.63.9 1.68 1.5 2.87 1.5 1.93 0 3.5-1.57 3.5-3.5S13.93 9.5 12 9.5c-1.35 0-2.52.78-3.1 1.9l1.6 1.6h-4V9l1.3 1.3C8.69 8.92 10.23 8 12 8c2.76 0 5 2.24 5 5s-2.24 5-5 5z"/></svg>',
      onClick: () => this.loadData()
    });
    
    // Create settings button
    const settingsButton = new Button({
      label: 'Settings',
      icon: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12-.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>',
      onClick: () => this.openSettings()
    });
    
    // Create help button
    const helpButton = new Button({
      label: 'Help',
      icon: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>',
      onClick: () => this.openHelp()
    });
    
    actionsContainer.addChild(newCombatButton);
    actionsContainer.addChild(saveButton);
    actionsContainer.addChild(loadButton);
    actionsContainer.addChild(settingsButton);
    actionsContainer.addChild(helpButton);
    
    this.ui.header.addChild(actionsContainer);
    
    // Add header to main container
    this.ui.mainContainer.addChild(this.ui.header);
  }

  /**
   * Create the content area
   * @private
   */
  _createContent() {
    this.ui.content = new Container({
      className: 'jct-content',
      layout: 'horizontal',
      gap: 0,
      padding: 0
    });
    
    // Create sidebar
    this._createSidebar();
    
    // Create main content
    this._createMainContent();
    
    // Add content to main container
    this.ui.mainContainer.addChild(this.ui.content);
  }

  /**
   * Create the sidebar
   * @private
   */
  _createSidebar() {
    this.ui.sidebar = new Panel({
      className: 'jct-sidebar',
      title: 'Initiative',
      collapsible: true
    });
    
    // Create combat controls
    this.ui.combatControls = new Container({
      className: 'jct-combat-controls',
      layout: 'horizontal',
      gap: 8,
      padding: 8
    });
    
    // Create initiative list
    this.ui.initiativeList = new Container({
      className: 'jct-initiative-list',
      layout: 'vertical',
      gap: 8,
      padding: 8
    });
    
    this.ui.sidebar.addChild(this.ui.combatControls);
    this.ui.sidebar.addChild(this.ui.initiativeList);
    
    // Add sidebar to content
    this.ui.content.addChild(this.ui.sidebar);
  }

  /**
   * Create the main content area
   * @private
   */
  _createMainContent() {
    const mainContent = new Container({
      className: 'jct-main-content',
      layout: 'vertical',
      gap: 0,
      padding: 0
    });
    
    // Create tactical view
    this.ui.tacticalView = new Panel({
      className: 'jct-tactical-view',
      title: 'Tactical Map'
    });
    
    // FIX: Create a container for the canvas, but don't create the canvas itself yet.
    // The canvas will be created and appended in _initializeTacticalMap after the UI is rendered.
    this.ui.canvasContainer = new Container({
      className: 'jct-canvas-container'
    });
    this.ui.tacticalView.addChild(this.ui.canvasContainer);
    
    // Create stat panel
    this.ui.statPanel = new Panel({
      className: 'jct-stat-panel',
      title: 'Statistics'
    });
    
    mainContent.addChild(this.ui.tacticalView);
    mainContent.addChild(this.ui.statPanel);
    
    // Add main content to content area
    this.ui.content.addChild(mainContent);
  }

  /**
   * Create the footer
   * @private
   */
  _createFooter() {
    this.ui.footer = new Container({
      className: 'jct-footer',
      layout: 'horizontal',
      gap: 16,
      padding: 8,
      justify: 'between',
      align: 'center'
    });
    
    const statusText = createComponent(ComponentType.TEXT, {
      className: 'jct-status-text',
      text: 'Ready'
    });
    
    const versionText = createComponent(ComponentType.TEXT, {
      className: 'jct-version-text',
      text: `v${this.options.version || '2.3.1'}`
    });
    
    this.ui.footer.addChild(statusText);
    this.ui.footer.addChild(versionText);
    
    // Add footer to main container
    this.ui.mainContainer.addChild(this.ui.footer);
  }

  /**
   * Create modals
   * @private
   */
  _createModals() {
    // Create loading modal
    this.ui.loadingModal = new Modal({
      id: 'jct-loading-modal',
      title: 'Loading...',
      content: '<div class="jct-spinner"></div>',
      closable: false
    });
    
    // Create error modal
    this.ui.errorModal = new Dialog({
      id: 'jct-error-modal',
      title: 'Error',
      content: '',
      footer: [
        {
          label: 'Close',
          variant: ComponentVariant.PRIMARY,
          onClick: () => this.ui.errorModal.close()
        }
      ]
    });
    
    // Render modals (they will be hidden by default)
    this.ui.loadingModal.render(this.container);
    this.ui.errorModal.render(this.container);
  }

  /**
   * Initialize the tactical map
   * @private
   */
  _initializeTacticalMap() {
    // FIX: This function is now called *after* _createUI has rendered the elements.
    // The canvas container element should now exist in the DOM.
    if (this.ui.canvasContainer && this.ui.canvasContainer.element) {
      const canvas = document.createElement('canvas');
      canvas.id = 'jct-tactical-canvas';
      this.ui.canvasContainer.element.appendChild(canvas);
      this.tacticalManager.initialize(canvas);
      this.tacticalManager.drawMap();
    } else {
      console.error('Canvas container not found for tactical map initialization.');
    }
  }

  /**
   * Set up event listeners
   * @private
   */
  _setupEventListeners() {
    // Add listeners for module events here
  }

  /**
   * Set up auto-save
   * @private
   */
  _setupAutoSave() {
    this.autoSaveTimer = setInterval(() => {
      this.saveData();
    }, this.options.autoSaveInterval);
  }

  /**
   * Load saved data
   * @private
   */
  _loadData() {
    // Load data from storage
    const savedData = localStorage.getItem(this.options.storageKey);
    
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        this.combat = data.combat || this.combat;
        this.templateManager.importFromJson(JSON.stringify(data.templates || {}));
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }

  /**
   * Save data
   */
  saveData() {
    this.state = AppState.SAVING;
    
    const dataToSave = {
      combat: this.combat,
      templates: JSON.parse(this.templateManager.exportAllToJson())
    };
    
    localStorage.setItem(this.options.storageKey, JSON.stringify(dataToSave));
    
    this.state = AppState.READY;
    console.log('Data saved.');
  }

  /**
   * Start a new combat
   */
  newCombat() {
    this.combat = {
      id: `combat_${Date.now()}`,
      name: 'New Combat',
      round: 0,
      turn: 0,
      initiative: [],
      combatants: [],
      active: null,
      log: [],
      startTime: null,
      endTime: null
    };
    
    this.combatState = CombatState.INACTIVE;
    this._updateUI();
    console.log('New combat started.');
  }

  /**
   * Open settings
   */
  openSettings() {
    console.log('Opening settings...');
    // Implementation for opening settings modal/view
  }

  /**
   * Open help
   */
  openHelp() {
    console.log('Opening help...');
    // Implementation for opening help modal/view
  }

  /**
   * Update the UI based on the current state
   * @private
   */
  _updateUI() {
    // Update UI elements based on application and combat state
  }

  /**
   * Add an event listener
   * @param {string} eventName - The name of the event
   * @param {Function} callback - The callback function
   */
  addEventListener(eventName, callback) {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }
    this.eventListeners.get(eventName).push(callback);
  }

  /**
   * Dispatch an event
   * @param {string} eventName - The name of the event
   * @param {Object} data - The event data
   * @private
   */
  _dispatchEvent(eventName, data) {
    if (this.eventListeners.has(eventName)) {
      this.eventListeners.get(eventName).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${eventName}:`, error);
        }
      });
    }
  }
}

/**
 * Create a new combat tracker application instance
 * @param {Object} options - Configuration options
 * @returns {CombatTrackerApp} A new application instance
 */
export function createCombatTrackerApp(options = {}) {
  return new CombatTrackerApp(options);
}
