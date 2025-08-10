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
import { createComponent, ComponentType, Container, Panel, Button, Modal } from './ui.js';

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
      errorModal: null
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
      icon: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>',
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
    this.ui.sidebar = new Container({
      className: 'jct-sidebar',
      layout: 'vertical',
      gap: 16,
      padding: 16
    });
    
    // Create initiative panel
    this.ui.initiativeList = new Panel({
      className: 'jct-initiative-panel',
      title: 'Initiative Order',
      collapsible: true,
      elevation: 1,
      headerActions: [
        {
          icon: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>',
          onClick: () => this.addCombatant()
        },
        {
          icon: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z"/></svg>',
          onClick: () => this.sortInitiative()
        }
      ]
    });
    
    // Create initiative list
    this._createInitiativeList();
    
    // Create combat controls
    this.ui.combatControls = new Panel({
      className: 'jct-combat-controls',
      title: 'Combat Controls',
      collapsible: true,
      elevation: 1
    });
    
    // Create combat control buttons
    this._createCombatControls();
    
    // Add panels to sidebar
    this.ui.sidebar.addChild(this.ui.initiativeList);
    this.ui.sidebar.addChild(this.ui.combatControls);
    
    // Create stats panel
    this.ui.statPanel = new Panel({
      className: 'jct-stat-panel',
      title: 'Combat Statistics',
      collapsible: true,
      collapsed: true,
      elevation: 1
    });
    
    // Create stats content
    this._createStatsPanel();
    
    // Add stats panel to sidebar
    this.ui.sidebar.addChild(this.ui.statPanel);
    
    // Add sidebar to content
    this.ui.content.addChild(this.ui.sidebar);
  }

  /**
   * Create the initiative list
   * @private
   */
  _createInitiativeList() {
    const initiativeContainer = new Container({
      className: 'jct-initiative-list',
      layout: 'vertical',
      gap: 8,
      padding: 0
    });
    
    // Add empty state message if no combatants
    if (this.combat.combatants.length === 0) {
      const emptyState = createComponent(ComponentType.TEXT, {
        className: 'jct-empty-state',
        text: 'No combatants added yet. Click the + button to add combatants.'
      });
      
      initiativeContainer.addChild(emptyState);
    } else {
      // Add combatants to initiative list
      for (const combatant of this.combat.initiative) {
        const combatantItem = this._createCombatantItem(combatant);
        initiativeContainer.addChild(combatantItem);
      }
    }
    
    this.ui.initiativeList.addChild(initiativeContainer);
  }

  /**
   * Create a combatant item for the initiative list
   * @param {Object} combatant - The combatant data
   * @returns {Component} The combatant item component
   * @private
   */
  _createCombatantItem(combatant) {
    const isActive = this.combat.active === combatant.id;
    
    const item = new Container({
      className: `jct-combatant-item ${isActive ? 'jct-active-combatant' : ''}`,
      layout: 'horizontal',
      gap: 8,
      padding: 8,
      align: 'center',
      justify: 'between'
    });
    
    // Left section with initiative and name
    const leftSection = new Container({
      layout: 'horizontal',
      gap: 8,
      align: 'center'
    });
    
    // Initiative number
    const initiative = createComponent(ComponentType.TEXT, {
      className: 'jct-initiative-number',
      text: combatant.initiative.toString()
    });
    
    // Combatant name
    const name = createComponent(ComponentType.TEXT, {
      className: 'jct-combatant-name',
      text: combatant.name
    });
    
    leftSection.addChild(initiative);
    leftSection.addChild(name);
    
    // Right section with HP and actions
    const rightSection = new Container({
      layout: 'horizontal',
      gap: 8,
      align: 'center'
    });
    
    // HP display
    const hpContainer = new Container({
      className: 'jct-hp-container',
      layout: 'horizontal',
      gap: 4,
      align: 'center'
    });
    
    const hpText = createComponent(ComponentType.TEXT, {
      className: 'jct-hp-text',
      text: `${combatant.hp.current}/${combatant.hp.max}`
    });
    
    hpContainer.addChild(hpText);
    
    // Actions
    const actionsContainer = new Container({
      className: 'jct-combatant-actions',
      layout: 'horizontal',
      gap: 4
    });
    
    // Edit button
    const editButton = new Button({
      className: 'jct-combatant-action',
      icon: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>',
      onClick: () => this.editCombatant(combatant.id)
    });
    
    // Remove button
    const removeButton = new Button({
      className: 'jct-combatant-action',
      icon: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',
      onClick: () => this.removeCombatant(combatant.id)
    });
    
    actionsContainer.addChild(editButton);
    actionsContainer.addChild(removeButton);
    
    rightSection.addChild(hpContainer);
    rightSection.addChild(actionsContainer);
    
    item.addChild(leftSection);
    item.addChild(rightSection);
    
    // Add click handler to select combatant
    item.addEventListener('click', () => {
      this.selectCombatant(combatant.id);
    });
    
    return item;
  }

  /**
   * Create the combat controls
   * @private
   */
  _createCombatControls() {
    const controlsContainer = new Container({
      className: 'jct-controls-container',
      layout: 'vertical',
      gap: 16,
      padding: 8
    });
    
    // Combat status
    const statusContainer = new Container({
      className: 'jct-combat-status',
      layout: 'horizontal',
      gap: 8,
      justify: 'between',
      align: 'center'
    });
    
    const roundLabel = createComponent(ComponentType.TEXT, {
      className: 'jct-round-label',
      text: 'Round:'
    });
    
    const roundValue = createComponent(ComponentType.TEXT, {
      className: 'jct-round-value',
      text: this.combat.round.toString()
    });
    
    const turnLabel = createComponent(ComponentType.TEXT, {
      className: 'jct-turn-label',
      text: 'Turn:'
    });
    
    const turnValue = createComponent(ComponentType.TEXT, {
      className: 'jct-turn-value',
      text: this.combat.turn.toString()
    });
    
    statusContainer.addChild(roundLabel);
    statusContainer.addChild(roundValue);
    statusContainer.addChild(turnLabel);
    statusContainer.addChild(turnValue);
    
    // Combat buttons
    const buttonsContainer = new Container({
      className: 'jct-combat-buttons',
      layout: 'horizontal',
      gap: 8,
      justify: 'center',
      wrap: true
    });
    
    // Start/pause button
    const startPauseButton = new Button({
      className: 'jct-combat-button',
      label: this.combatState === CombatState.ACTIVE ? 'Pause' : 'Start',
      icon: this.combatState === CombatState.ACTIVE 
        ? '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>'
        : '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>',
      onClick: () => this.toggleCombat()
    });
    
    // Next turn button
    const nextTurnButton = new Button({
      className: 'jct-combat-button',
      label: 'Next Turn',
      icon: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>',
      onClick: () => this.nextTurn()
    });
    
    // Previous turn button
    const prevTurnButton = new Button({
      className: 'jct-combat-button',
      label: 'Prev Turn',
      icon: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>',
      onClick: () => this.previousTurn()
    });
    
    // Next round button
    const nextRoundButton = new Button({
      className: 'jct-combat-button',
      label: 'Next Round',
      icon: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>',
      onClick: () => this.nextRound()
    });
    
    // End combat button
    const endCombatButton = new Button({
      className: 'jct-combat-button',
      label: 'End Combat',
      icon: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
      onClick: () => this.endCombat()
    });
    
    buttonsContainer.addChild(startPauseButton);
    buttonsContainer.addChild(nextTurnButton);
    buttonsContainer.addChild(prevTurnButton);
    buttonsContainer.addChild(nextRoundButton);
    buttonsContainer.addChild(endCombatButton);
    
    // Add containers to controls
    controlsContainer.addChild(statusContainer);
    controlsContainer.addChild(buttonsContainer);
    
    this.ui.combatControls.addChild(controlsContainer);
  }

  /**
   * Create the stats panel
   * @private
   */
  _createStatsPanel() {
    const statsContainer = new Container({
      className: 'jct-stats-container',
      layout: 'vertical',
      gap: 16,
      padding: 8
    });
    
    // Add empty state or stats content based on combat state
    if (this.combatState === CombatState.INACTIVE) {
      const emptyState = createComponent(ComponentType.TEXT, {
        className: 'jct-empty-state',
        text: 'Combat statistics will appear here once combat has started.'
      });
      
      statsContainer.addChild(emptyState);
    } else {
      // Add actual stats content
      this._createStatsContent(statsContainer);
    }
    
    this.ui.statPanel.addChild(statsContainer);
  }

  /**
   * Create stats content
   * @param {Container} container - The container to add stats to
   * @private
   */
  _createStatsContent(container) {
    // Get combat stats from analyzer
    const stats = this.combatAnalyzer.getCombatStats();
    
    if (!stats) {
      const emptyState = createComponent(ComponentType.TEXT, {
        className: 'jct-empty-state',
        text: 'No statistics available yet.'
      });
      
      container.addChild(emptyState);
      return;
    }
    
    // Combat duration
    const durationContainer = new Container({
      className: 'jct-stat-item',
      layout: 'horizontal',
      gap: 8,
      justify: 'between'
    });
    
    const durationLabel = createComponent(ComponentType.TEXT, {
      className: 'jct-stat-label',
      text: 'Duration:'
    });
    
    const durationValue = createComponent(ComponentType.TEXT, {
      className: 'jct-stat-value',
      text: this._formatDuration(stats.duration)
    });
    
    durationContainer.addChild(durationLabel);
    durationContainer.addChild(durationValue);
    
    // Total damage
    const damageContainer = new Container({
      className: 'jct-stat-item',
      layout: 'horizontal',
      gap: 8,
      justify: 'between'
    });
    
    const damageLabel = createComponent(ComponentType.TEXT, {
      className: 'jct-stat-label',
      text: 'Total Damage:'
    });
    
    const damageValue = createComponent(ComponentType.TEXT, {
      className: 'jct-stat-value',
      text: stats.totalDamageDealt.toString()
    });
    
    damageContainer.addChild(damageLabel);
    damageContainer.addChild(damageValue);
    
    // Total healing
    const healingContainer = new Container({
      className: 'jct-stat-item',
      layout: 'horizontal',
      gap: 8,
      justify: 'between'
    });
    
    const healingLabel = createComponent(ComponentType.TEXT, {
      className: 'jct-stat-label',
      text: 'Total Healing:'
    });
    
    const healingValue = createComponent(ComponentType.TEXT, {
      className: 'jct-stat-value',
      text: stats.totalHealingDone.toString()
    });
    
    healingContainer.addChild(healingLabel);
    healingContainer.addChild(healingValue);
    
    // Add stats to container
    container.addChild(durationContainer);
    container.addChild(damageContainer);
    container.addChild(healingContainer);
    
    // Add view detailed stats button
    const viewStatsButton = new Button({
      label: 'View Detailed Stats',
      onClick: () => this.openDetailedStats()
    });
    
    container.addChild(viewStatsButton);
  }

    /**
   * Create the main content area
   * @private
   */
  _createMainContent() {
    const mainContent = new Container({
      className: 'jct-main-content',
      layout: 'vertical',
      gap: 16,
      padding: 16
    });
    
    // Create tactical view
    this.ui.tacticalView = new Panel({
      className: 'jct-tactical-view',
      title: 'Tactical Map',
      collapsible: true,
      elevation: 1
    });
    
    // Create tactical map
    this._createTacticalMap();
    
    // Create combat log
    const combatLog = new Panel({
      className: 'jct-combat-log',
      title: 'Combat Log',
      collapsible: true,
      elevation: 1
    });
    
    // Create log content
    this._createCombatLog(combatLog);
    
    // Add panels to main content
    mainContent.addChild(this.ui.tacticalView);
    mainContent.addChild(combatLog);
    
    // Add main content to content area
    this.ui.content.addChild(mainContent);
  }

  /**
 * Create the tactical map
 * @private
 */
_createTacticalMap() {
  const mapContainer = new Container({
    className: 'jct-map-container',
    layout: 'vertical',
    gap: 8,
    padding: 8
  });
  
  // Create map canvas container
  const canvasContainer = createComponent(ComponentType.CUSTOM, {
    className: 'jct-map-canvas-container'
  });
  
  // Create canvas element
  const canvas = document.createElement('canvas');
  canvas.className = 'jct-map-canvas';
  canvas.width = 800;
  canvas.height = 600;
  
  // Store canvas reference for later use
  this.tacticalCanvas = canvas;
  
  // Add canvas to container - Add a check to prevent null reference error
  if (canvasContainer && canvasContainer.element) {
    canvasContainer.element.appendChild(canvas);
  } else {
    console.error('Canvas container element is null or undefined');
    // Create a fallback container if needed
    const fallbackContainer = document.createElement('div');
    fallbackContainer.className = 'jct-map-canvas-container';
    fallbackContainer.appendChild(canvas);
    canvasContainer = { element: fallbackContainer };
  }
  
} 
    // Create map controls
    const controlsContainer = new Container({
      className: 'jct-map-controls',
      layout: 'horizontal',
      gap: 8,
      justify: 'center',
      wrap: true
    });
    
    // Zoom controls
    const zoomInButton = new Button({
      label: 'Zoom In',
      icon: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zm2.5-4h-2v2H9v-2H7V9h2V7h1v2h2v1z"/></svg>',
      onClick: () => this.zoomMap(1.2)
    });
    
    const zoomOutButton = new Button({
      label: 'Zoom Out',
      icon: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM7 9h5v1H7z"/></svg>',
      onClick: () => this.zoomMap(0.8)
    });
    
    const resetViewButton = new Button({
      label: 'Reset View',
      icon: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>',
      onClick: () => this.resetMapView()
    });
    
    // Grid controls
    const toggleGridButton = new Button({
      label: 'Toggle Grid',
      icon: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 20H4v-4h4v4zm0-6H4v-4h4v4zm0-6H4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4z"/></svg>',
      onClick: () => this.toggleGrid()
    });
    
    const clearMapButton = new Button({
      label: 'Clear Map',
      icon: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M15 16h4v2h-4zm0-8h7v2h-7zm0 4h6v2h-6zM3 18c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V8H3v10zM14 5h-3l-1-1H6L5 5H2v2h12z"/></svg>',
      onClick: () => this.clearMap()
    });
    
    controlsContainer.addChild(zoomInButton);
    controlsContainer.addChild(zoomOutButton);
    controlsContainer.addChild(resetViewButton);
    controlsContainer.addChild(toggleGridButton);
    controlsContainer.addChild(clearMapButton);
    
    // Add containers to map container
    mapContainer.addChild(canvasContainer);
    mapContainer.addChild(controlsContainer);
    
    // Add map container to tactical view
    this.ui.tacticalView.addChild(mapContainer);
    
    // Initialize tactical map
    this._initializeTacticalMap();
  }

  /**
   * Initialize the tactical map
   * @private
   */
  _initializeTacticalMap() {
    // This will be called after the canvas is added to the DOM
    setTimeout(() => {
      if (this.tacticalCanvas) {
        // Initialize the tactical manager with the canvas
        this.tacticalManager.initialize(this.tacticalCanvas);
        
        // Draw the initial map
        this.tacticalManager.drawMap();
      }
    }, 0);
  }

  /**
   * Create the combat log
   * @param {Panel} panel - The panel to add the log to
   * @private
   */
  _createCombatLog(panel) {
    const logContainer = new Container({
      className: 'jct-log-container',
      layout: 'vertical',
      gap: 8,
      padding: 8
    });
    
    // Create log entries
    if (this.combat.log.length === 0) {
      const emptyState = createComponent(ComponentType.TEXT, {
        className: 'jct-empty-state',
        text: 'Combat log will appear here during combat.'
      });
      
      logContainer.addChild(emptyState);
    } else {
      // Add log entries
      for (const entry of this.combat.log) {
        const logEntry = this._createLogEntry(entry);
        logContainer.addChild(logEntry);
      }
    }
    
    // Add log controls
    const logControls = new Container({
      className: 'jct-log-controls',
      layout: 'horizontal',
      gap: 8,
      justify: 'end'
    });
    
    const clearLogButton = new Button({
      label: 'Clear Log',
      onClick: () => this.clearCombatLog()
    });
    
    logControls.addChild(clearLogButton);
    
    // Add containers to panel
    panel.addChild(logContainer);
    panel.addChild(logControls);
  }

  /**
   * Create a log entry component
   * @param {Object} entry - The log entry data
   * @returns {Component} The log entry component
   * @private
   */
  _createLogEntry(entry) {
    const logEntry = new Container({
      className: `jct-log-entry jct-log-${entry.type || 'info'}`,
      layout: 'vertical',
      gap: 4,
      padding: 8
    });
    
    // Create timestamp
    const timestamp = createComponent(ComponentType.TEXT, {
      className: 'jct-log-timestamp',
      text: this._formatTimestamp(entry.timestamp)
    });
    
    // Create message
    const message = createComponent(ComponentType.TEXT, {
      className: 'jct-log-message',
      text: entry.message
    });
    
    logEntry.addChild(timestamp);
    logEntry.addChild(message);
    
    return logEntry;
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
      padding: 16,
      justify: 'between',
      align: 'center'
    });
    
    // Create version info
    const versionInfo = createComponent(ComponentType.TEXT, {
      className: 'jct-version-info',
      text: 'Jesster\'s Combat Tracker v2.3.1'
    });
    
    // Create status
    const statusContainer = new Container({
      className: 'jct-status-container',
      layout: 'horizontal',
      gap: 8,
      align: 'center'
    });
    
    const statusIcon = createComponent(ComponentType.ICON, {
      className: 'jct-status-icon',
      icon: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>'
    });
    
    const statusText = createComponent(ComponentType.TEXT, {
      className: 'jct-status-text',
      text: 'Ready'
    });
    
    statusContainer.addChild(statusIcon);
    statusContainer.addChild(statusText);
    
    // Add elements to footer
    this.ui.footer.addChild(versionInfo);
    this.ui.footer.addChild(statusContainer);
    
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
      title: 'Loading',
      content: 'Please wait...',
      closable: false,
      closeOnEscape: false,
      closeOnBackdropClick: false
    });
    
    // Create error modal
    this.ui.errorModal = new Modal({
      title: 'Error',
      content: 'An error occurred.',
      footer: [
        {
          label: 'OK',
          variant: ComponentVariant.PRIMARY,
          onClick: () => this.ui.errorModal.close()
        }
      ]
    });
    
    // Render modals
    this.ui.loadingModal.render(document.body);
    this.ui.errorModal.render(document.body);
  }

  /**
   * Set up event listeners
   * @private
   */
  _setupEventListeners() {
    // Listen for tactical manager events
    this.tacticalManager.addListener((event, data) => {
      switch (event) {
        case 'combatantMoved':
          this._handleCombatantMoved(data);
          break;
        case 'battlefieldResized':
          this._handleBattlefieldResized(data);
          break;
        // Add more event handlers as needed
      }
    });
    
    // Listen for combat analyzer events
    this.combatAnalyzer.addListener((event, data) => {
      switch (event) {
        case 'combatStarted':
          this._handleCombatStarted(data);
          break;
        case 'combatEnded':
          this._handleCombatEnded(data);
          break;
        case 'turnChanged':
          this._handleTurnChanged(data);
          break;
        // Add more event handlers as needed
      }
    });
    
    // Listen for window resize events
    window.addEventListener('resize', () => {
      this._handleWindowResize();
    });
    
    // Listen for beforeunload to warn about unsaved changes
    window.addEventListener('beforeunload', (e) => {
      if (this.hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    });
  }

  /**
   * Set up auto-save
   * @private
   */
  _setupAutoSave() {
    this.autoSaveTimer = setInterval(() => {
      if (this.hasUnsavedChanges()) {
        this.saveData(true); // Auto-save
      }
    }, this.options.autoSaveInterval);
  }

  /**
   * Load saved data
   * @private
   */
  _loadData() {
    try {
      const savedData = localStorage.getItem(this.options.storageKey);
      
      if (savedData) {
        const data = JSON.parse(savedData);
        
        // Load combat data
        if (data.combat) {
          this.combat = data.combat;
        }
        
        // Load tactical data
        if (data.tactical) {
          this.tacticalManager.loadFromData(data.tactical);
        }
        
        // Load stats data
        if (data.stats) {
          this.statTracker.loadFromData(data.stats);
        }
        
        // Load combat analyzer data
        if (data.analyzer) {
          this.combatAnalyzer.loadFromData(data.analyzer);
        }
        
        // Update combat state
        this.combatState = data.combatState || CombatState.INACTIVE;
        
        this._dispatchEvent('dataLoaded', { data });
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
      this._showError('Failed to load saved data. Starting with default settings.');
    }
  }

  /**
   * Save data
   * @param {boolean} isAutoSave - Whether this is an auto-save
   * @returns {boolean} True if save was successful
   */
  saveData(isAutoSave = false) {
    try {
      if (!isAutoSave) {
        this.state = AppState.SAVING;
        this._updateStatus('Saving...');
      }
      
      const data = {
        combat: this.combat,
        tactical: this.tacticalManager.saveToData(),
        stats: this.statTracker.saveToData(),
        analyzer: this.combatAnalyzer.saveToData(),
        combatState: this.combatState,
        savedAt: new Date().toISOString()
      };
      
      localStorage.setItem(this.options.storageKey, JSON.stringify(data));
      
      if (!isAutoSave) {
        this.state = AppState.READY;
        this._updateStatus('Saved successfully');
        this._dispatchEvent('dataSaved', { data });
      }
      
      return true;
    } catch (error) {
      console.error('Error saving data:', error);
      
      if (!isAutoSave) {
        this.state = AppState.ERROR;
        this._showError('Failed to save data. Please try again.');
        this._updateStatus('Save failed');
      }
      
      return false;
    }
  }

  /**
   * Load data from file
   */
  loadData() {
    // Create file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length === 0) return;
      
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          
          // Show confirmation dialog
          this._showConfirmation(
            'Load Data',
            'Loading this file will replace your current combat data. Continue?',
            () => {
              // Load the data
              this.state = AppState.LOADING;
              this._updateStatus('Loading data...');
              
              // Load combat data
              if (data.combat) {
                this.combat = data.combat;
              }
              
              // Load tactical data
              if (data.tactical) {
                this.tacticalManager.loadFromData(data.tactical);
              }
              
              // Load stats data
              if (data.stats) {
                this.statTracker.loadFromData(data.stats);
              }
              
              // Load combat analyzer data
              if (data.analyzer) {
                this.combatAnalyzer.loadFromData(data.analyzer);
              }
              
              // Update combat state
              this.combatState = data.combatState || CombatState.INACTIVE;
              
              // Update UI
              this._refreshUI();
              
              this.state = AppState.READY;
              this._updateStatus('Data loaded successfully');
              this._dispatchEvent('dataLoaded', { data });
            }
          );
        } catch (error) {
          console.error('Error parsing data file:', error);
          this._showError('Failed to load data file. The file may be corrupted or invalid.');
        }
      };
      
      reader.onerror = () => {
        this._showError('Failed to read the file. Please try again.');
      };
      
      reader.readAsText(file);
    });
    
    // Trigger file selection
    fileInput.click();
  }

  /**
   * Export data to file
   */
  exportData() {
    try {
      const data = {
        combat: this.combat,
        tactical: this.tacticalManager.saveToData(),
        stats: this.statTracker.saveToData(),
        analyzer: this.combatAnalyzer.saveToData(),
        combatState: this.combatState,
        exportedAt: new Date().toISOString(),
        version: '2.3.1'
      };
      
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      // Create download link
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(dataBlob);
      downloadLink.download = `combat-tracker-${new Date().toISOString().slice(0, 10)}.json`;
      
      // Trigger download
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      this._updateStatus('Data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      this._showError('Failed to export data. Please try again.');
    }
  }

  /**
   * Check if there are unsaved changes
   * @returns {boolean} True if there are unsaved changes
   */
  hasUnsavedChanges() {
    // This is a simplified check - in a real app, you'd compare with last saved state
    return this.combatState === CombatState.ACTIVE || 
           this.combat.combatants.length > 0;
  }

  /**
   * Refresh the UI
   * @private
   */
  _refreshUI() {
    // Re-create the entire UI
    if (this.ui.mainContainer) {
      this.ui.mainContainer.destroy();
    }
    
    this._createUI();
  }

  /**
   * Update the status display
   * @param {string} message - The status message
   * @private
   */
  _updateStatus(message) {
    const statusContainer = this.ui.footer.findChild('jct-status-container');
    
    if (statusContainer) {
      const statusText = statusContainer.findChild('jct-status-text');
      
      if (statusText && statusText.element) {
        statusText.element.textContent = message;
      }
    }
  }

  /**
   * Show an error message
   * @param {string} message - The error message
   * @private
   */
  _showError(message) {
    if (this.ui.errorModal) {
      // Update error content
      this.ui.errorModal.setContent(message);
      
      // Show the modal
      this.ui.errorModal.open();
    } else {
      // Fallback to alert
      alert(`Error: ${message}`);
    }
  }

  /**
   * Show a confirmation dialog
   * @param {string} title - The dialog title
   * @param {string} message - The dialog message
   * @param {Function} onConfirm - Function to call when confirmed
   * @param {Function} onCancel - Function to call when canceled
   * @private
   */
  _showConfirmation(title, message, onConfirm, onCancel) {
    // Create confirmation dialog
    const confirmDialog = new Dialog({
      title,
      content: message,
      footer: [
        {
          label: 'Cancel',
          onClick: () => {
            confirmDialog.close();
            if (onCancel) onCancel();
          }
        },
        {
          label: 'Confirm',
          variant: ComponentVariant.PRIMARY,
          onClick: () => {
            confirmDialog.close();
            if (onConfirm) onConfirm();
          }
        }
      ]
    });
    
    // Render and show dialog
    confirmDialog.render(document.body);
    confirmDialog.open();
  }

  /**
   * Format a timestamp
   * @param {number|string|Date} timestamp - The timestamp to format
   * @returns {string} The formatted timestamp
   * @private
   */
  _formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  }

  /**
   * Format a duration
   * @param {number} milliseconds - The duration in milliseconds
   * @returns {string} The formatted duration
   * @private
   */
  _formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Add an event listener
   * @param {string} event - The event name
   * @param {Function} listener - The event listener
   * @returns {Function} Function to remove the listener
   */
  addEventListener(event, listener) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    
    this.eventListeners.get(event).push(listener);
    
    // Return function to remove the listener
    return () => {
      this.removeEventListener(event, listener);
    };
  }

  /**
   * Remove an event listener
   * @param {string} event - The event name
   * @param {Function} listener - The event listener
   * @returns {boolean} True if the listener was removed
   */
  removeEventListener(event, listener) {
    if (!this.eventListeners.has(event)) {
      return false;
    }
    
    const listeners = this.eventListeners.get(event);
    const index = listeners.indexOf(listener);
    
    if (index === -1) {
      return false;
    }
    
    // Remove from array
    listeners.splice(index, 1);
    
    // Clean up empty arrays
    if (listeners.length === 0) {
      this.eventListeners.delete(event);
    }
    
    return true;
  }

  /**
   * Dispatch an event
   * @param {string} event - The event name
   * @param {Object} data - The event data
   * @private
   */
  _dispatchEvent(event, data) {
    if (!this.eventListeners.has(event)) {
      return;
    }
    
    const listeners = this.eventListeners.get(event);
    
    for (const listener of listeners) {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    }
  }

  /**
   * Handle window resize
   * @private
   */
  _handleWindowResize() {
    // Resize tactical map if needed
    if (this.tacticalCanvas) {
      const container = this.tacticalCanvas.parentElement;
      
      if (container) {
        // Resize canvas to fit container
        this.tacticalCanvas.width = container.clientWidth;
        this.tacticalCanvas.height = container.clientHeight;
        
        // Redraw map
        this.tacticalManager.drawMap();
      }
    }
  }

  /**
   * Handle combatant moved event
   * @param {Object} data - The event data
   * @private
   */
  _handleCombatantMoved(data) {
    // Update combat log
    this.addLogEntry({
      type: 'movement',
      message: `${data.combatant.name} moved from ${JSON.stringify(data.from)} to ${JSON.stringify(data.to)}.`
    });
  }

  /**
   * Handle battlefield resized event
   * @param {Object} data - The event data
   * @private
   */
  _handleBattlefieldResized(data) {
    // Update combat log
    this.addLogEntry({
      type: 'info',
      message: `Battlefield resized to ${data.width}x${data.height}.`
    });
  }

  /**
   * Handle combat started event
   * @param {Object} data - The event data
   * @private
   */
  _handleCombatStarted(data) {
    // Update combat state
    this.combatState = CombatState.ACTIVE;
    
    // Update combat data
    this.combat.startTime = data.startTime;
    this.combat.round = data.round;
    this.combat.turn = data.turn;
    
    // Update UI
    this._updateCombatControls();
    
    // Add log entry
    this.addLogEntry({
      type: 'combat',
      message: 'Combat started.'
    });
  }

  /**
   * Handle combat ended event
   * @param {Object} data - The event data
   * @private
   */
  _handleCombatEnded(data) {
    // Update combat state
    this.combatState = CombatState.FINISHED;
    
    // Update combat data
    this.combat.endTime = data.endTime;
    
    // Update UI
    this._updateCombatControls();
    
    // Add log entry
    this.addLogEntry({
      type: 'combat',
      message: 'Combat ended.'
    });
    
    // Show combat summary
    this._showCombatSummary();
  }

  /**
   * Handle turn changed event
   * @param {Object} data - The event data
   * @private
   */
  _handleTurnChanged(data) {
    // Update combat data
    this.combat.round = data.round;
    this.combat.turn = data.turn;
    this.combat.active = data.activeId;
    
    // Update UI
    this._updateCombatControls();
    this._updateInitiativeList();
    
    // Add log entry
    const activeCombatant = this.getCombatant(data.activeId);
    
    if (activeCombatant) {
      this.addLogEntry({
        type: 'turn',
        message: `Round ${data.round}, Turn ${data.turn}: ${activeCombatant.name}'s turn.`
      });
    }
  }

  /**
   * Update combat controls
   * @private
   */
  _updateCombatControls() {
    // Re-create combat controls
    if (this.ui.combatControls) {
      this.ui.combatControls.element.innerHTML = '';
      this._createCombatControls();
    }
  }

  /**
   * Update initiative list
   * @private
   */
  _updateInitiativeList() {
    // Re-create initiative list
    if (this.ui.initiativeList) {
      // Find and clear the initiative list container
      const listContainer = this.ui.initiativeList.findChild('jct-initiative-list');
      
      if (listContainer) {
        listContainer.element.innerHTML = '';
        
        // Add empty state message if no combatants
        if (this.combat.combatants.length === 0) {
          const emptyState = createComponent(ComponentType.TEXT, {
            className: 'jct-empty-state',
            text: 'No combatants added yet. Click the + button to add combatants.'
          });
          
          listContainer.addChild(emptyState);
        } else {
          // Add combatants to initiative list
          for (const combatant of this.combat.initiative) {
            const combatantItem = this._createCombatantItem(combatant);
            listContainer.addChild(combatantItem);
          }
        }
      }
    }
  }

    /**
   * Show combat summary
   * @private
   */
  _showCombatSummary() {
    // Get combat stats
    const stats = this.combatAnalyzer.getCombatStats();
    
    if (!stats) return;
    
    // Create summary dialog
    const summaryDialog = new Dialog({
      title: 'Combat Summary',
      width: 600,
      content: this._createCombatSummaryContent(stats),
      footer: [
        {
          label: 'Close',
          onClick: () => summaryDialog.close()
        },
        {
          label: 'Export Stats',
          variant: ComponentVariant.PRIMARY,
          onClick: () => {
            this.exportCombatStats();
            summaryDialog.close();
          }
        }
      ]
    });
    
    // Render and show dialog
    summaryDialog.render(document.body);
    summaryDialog.open();
  }

  /**
   * Create combat summary content
   * @param {Object} stats - The combat statistics
   * @returns {Component} The summary content component
   * @private
   */
  _createCombatSummaryContent(stats) {
    const container = new Container({
      layout: 'vertical',
      gap: 16,
      padding: 8
    });
    
    // Combat overview
    const overviewPanel = new Panel({
      title: 'Overview',
      elevation: 1
    });
    
    const overviewContainer = new Container({
      layout: 'vertical',
      gap: 8,
      padding: 16
    });
    
    // Duration
    const durationContainer = new Container({
      layout: 'horizontal',
      gap: 8,
      justify: 'between'
    });
    
    const durationLabel = createComponent(ComponentType.TEXT, {
      className: 'jct-stat-label',
      text: 'Duration:'
    });
    
    const durationValue = createComponent(ComponentType.TEXT, {
      className: 'jct-stat-value',
      text: this._formatDuration(stats.duration)
    });
    
    durationContainer.addChild(durationLabel);
    durationContainer.addChild(durationValue);
    
    // Rounds
    const roundsContainer = new Container({
      layout: 'horizontal',
      gap: 8,
      justify: 'between'
    });
    
    const roundsLabel = createComponent(ComponentType.TEXT, {
      className: 'jct-stat-label',
      text: 'Total Rounds:'
    });
    
    const roundsValue = createComponent(ComponentType.TEXT, {
      className: 'jct-stat-value',
      text: stats.totalRounds.toString()
    });
    
    roundsContainer.addChild(roundsLabel);
    roundsContainer.addChild(roundsValue);
    
    // Turns
    const turnsContainer = new Container({
      layout: 'horizontal',
      gap: 8,
      justify: 'between'
    });
    
    const turnsLabel = createComponent(ComponentType.TEXT, {
      className: 'jct-stat-label',
      text: 'Total Turns:'
    });
    
    const turnsValue = createComponent(ComponentType.TEXT, {
      className: 'jct-stat-value',
      text: stats.totalTurns.toString()
    });
    
    turnsContainer.addChild(turnsLabel);
    turnsContainer.addChild(turnsValue);
    
    overviewContainer.addChild(durationContainer);
    overviewContainer.addChild(roundsContainer);
    overviewContainer.addChild(turnsContainer);
    
    overviewPanel.addChild(overviewContainer);
    
    // Damage statistics
    const damagePanel = new Panel({
      title: 'Damage Statistics',
      elevation: 1
    });
    
    const damageContainer = new Container({
      layout: 'vertical',
      gap: 8,
      padding: 16
    });
    
    // Total damage
    const totalDamageContainer = new Container({
      layout: 'horizontal',
      gap: 8,
      justify: 'between'
    });
    
    const totalDamageLabel = createComponent(ComponentType.TEXT, {
      className: 'jct-stat-label',
      text: 'Total Damage Dealt:'
    });
    
    const totalDamageValue = createComponent(ComponentType.TEXT, {
      className: 'jct-stat-value',
      text: stats.totalDamageDealt.toString()
    });
    
    totalDamageContainer.addChild(totalDamageLabel);
    totalDamageContainer.addChild(totalDamageValue);
    
    // Average damage per round
    const avgDamageContainer = new Container({
      layout: 'horizontal',
      gap: 8,
      justify: 'between'
    });
    
    const avgDamageLabel = createComponent(ComponentType.TEXT, {
      className: 'jct-stat-label',
      text: 'Average Damage Per Round:'
    });
    
    const avgDamageValue = createComponent(ComponentType.TEXT, {
      className: 'jct-stat-value',
      text: stats.averageDamagePerRound.toFixed(1)
    });
    
    avgDamageContainer.addChild(avgDamageLabel);
    avgDamageContainer.addChild(avgDamageValue);
    
    // Highest damage in one round
    const highestDamageContainer = new Container({
      layout: 'horizontal',
      gap: 8,
      justify: 'between'
    });
    
    const highestDamageLabel = createComponent(ComponentType.TEXT, {
      className: 'jct-stat-label',
      text: 'Highest Damage in One Round:'
    });
    
    const highestDamageValue = createComponent(ComponentType.TEXT, {
      className: 'jct-stat-value',
      text: stats.highestDamageInOneRound.toString()
    });
    
    highestDamageContainer.addChild(highestDamageLabel);
    highestDamageContainer.addChild(highestDamageValue);
    
    damageContainer.addChild(totalDamageContainer);
    damageContainer.addChild(avgDamageContainer);
    damageContainer.addChild(highestDamageContainer);
    
    damagePanel.addChild(damageContainer);
    
    // Combatant statistics
    const combatantsPanel = new Panel({
      title: 'Combatant Statistics',
      elevation: 1
    });
    
    const combatantsContainer = new Container({
      layout: 'vertical',
      gap: 16,
      padding: 16
    });
    
    // Create table of combatant stats
    const combatantsTable = new Table({
      columns: [
        { field: 'name', label: 'Name' },
        { field: 'damageDealt', label: 'Damage Dealt' },
        { field: 'damageTaken', label: 'Damage Taken' },
        { field: 'healing', label: 'Healing Done' },
        { field: 'kills', label: 'Kills' }
      ],
      data: stats.combatantStats || [],
      sortable: true,
      sortColumn: 'damageDealt',
      sortDirection: 'desc'
    });
    
    combatantsContainer.addChild(combatantsTable);
    combatantsPanel.addChild(combatantsContainer);
    
    // Add all panels to container
    container.addChild(overviewPanel);
    container.addChild(damagePanel);
    container.addChild(combatantsPanel);
    
    return container;
  }

  /**
   * Export combat stats
   */
  exportCombatStats() {
    try {
      // Get combat stats
      const stats = this.combatAnalyzer.getCombatStats();
      
      if (!stats) {
        this._showError('No combat statistics available to export.');
        return;
      }
      
      // Format stats for export
      const exportData = {
        combatName: this.combat.name,
        date: new Date().toISOString(),
        duration: stats.duration,
        totalRounds: stats.totalRounds,
        totalTurns: stats.totalTurns,
        totalDamageDealt: stats.totalDamageDealt,
        totalHealingDone: stats.totalHealingDone,
        averageDamagePerRound: stats.averageDamagePerRound,
        highestDamageInOneRound: stats.highestDamageInOneRound,
        combatantStats: stats.combatantStats,
        roundByRoundStats: stats.roundByRoundStats
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      // Create download link
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(dataBlob);
      downloadLink.download = `combat-stats-${new Date().toISOString().slice(0, 10)}.json`;
      
      // Trigger download
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      this._updateStatus('Combat statistics exported successfully');
    } catch (error) {
      console.error('Error exporting combat stats:', error);
      this._showError('Failed to export combat statistics. Please try again.');
    }
  }

  /**
   * Add a log entry
   * @param {Object} entry - The log entry
   */
  addLogEntry(entry) {
    // Create log entry with timestamp
    const logEntry = {
      timestamp: entry.timestamp || new Date().getTime(),
      type: entry.type || 'info',
      message: entry.message
    };
    
    // Add to combat log
    this.combat.log.push(logEntry);
    
    // Update log display if rendered
    const logContainer = document.querySelector('.jct-log-container');
    
    if (logContainer) {
      const logEntryComponent = this._createLogEntry(logEntry);
      logEntryComponent.render(logContainer);
      
      // Scroll to bottom
      logContainer.scrollTop = logContainer.scrollHeight;
    }
  }

  /**
   * Clear the combat log
   */
  clearCombatLog() {
    // Show confirmation dialog
    this._showConfirmation(
      'Clear Combat Log',
      'Are you sure you want to clear the combat log? This cannot be undone.',
      () => {
        // Clear log
        this.combat.log = [];
        
        // Update log display
        const logContainer = document.querySelector('.jct-log-container');
        
        if (logContainer) {
          logContainer.innerHTML = '';
          
          const emptyState = createComponent(ComponentType.TEXT, {
            className: 'jct-empty-state',
            text: 'Combat log will appear here during combat.'
          });
          
          emptyState.render(logContainer);
        }
        
        this._updateStatus('Combat log cleared');
      }
    );
  }

  /**
   * Start a new combat
   */
  newCombat() {
    // Show confirmation dialog if there's an active combat
    if (this.combatState !== CombatState.INACTIVE && this.combat.combatants.length > 0) {
      this._showConfirmation(
        'New Combat',
        'Starting a new combat will end the current one. Are you sure?',
        () => this._createNewCombat()
      );
    } else {
      this._createNewCombat();
    }
  }

  /**
   * Create a new combat
   * @private
   */
  _createNewCombat() {
    // Reset combat data
    this.combat = {
      id: generateId(),
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
    
    // Reset combat state
    this.combatState = CombatState.INACTIVE;
    
    // Reset tactical manager
    this.tacticalManager.clear();
    
    // Reset combat analyzer
    this.combatAnalyzer.reset();
    
    // Reset stat tracker
    this.statTracker.reset();
    
    // Update UI
    this._refreshUI();
    
    this._updateStatus('New combat created');
    this._dispatchEvent('newCombat', { combat: this.combat });
  }

  /**
   * Add a combatant
   */
  addCombatant() {
    // Create combatant dialog
    const dialog = new Dialog({
      title: 'Add Combatant',
      width: 500,
      content: this._createCombatantForm(),
      footer: [
        {
          label: 'Cancel',
          onClick: () => dialog.close()
        },
        {
          label: 'Add',
          variant: ComponentVariant.PRIMARY,
          onClick: () => {
            // Get form data
            const form = document.getElementById('combatant-form');
            
            if (form) {
              const formData = new FormData(form);
              
              // Create combatant
              const combatant = {
                id: generateId(),
                name: formData.get('name') || 'Unnamed',
                initiative: parseInt(formData.get('initiative'), 10) || 0,
                hp: {
                  max: parseInt(formData.get('maxHp'), 10) || 10,
                  current: parseInt(formData.get('currentHp'), 10) || 10
                },
                ac: parseInt(formData.get('ac'), 10) || 10,
                type: formData.get('type') || 'monster',
                stats: {
                  str: parseInt(formData.get('str'), 10) || 10,
                  dex: parseInt(formData.get('dex'), 10) || 10,
                  con: parseInt(formData.get('con'), 10) || 10,
                  int: parseInt(formData.get('int'), 10) || 10,
                  wis: parseInt(formData.get('wis'), 10) || 10,
                  cha: parseInt(formData.get('cha'), 10) || 10
                },
                conditions: [],
                notes: formData.get('notes') || ''
              };
              
              // Add to combat
              this.combat.combatants.push(combatant);
              
              // Add to initiative order
              this._addToInitiative(combatant);
              
              // Update UI
              this._updateInitiativeList();
              
              // Add log entry
              this.addLogEntry({
                type: 'info',
                message: `${combatant.name} added to combat.`
              });
              
              dialog.close();
              this._updateStatus(`${combatant.name} added to combat`);
            }
          }
        }
      ]
    });
    
    // Render and show dialog
    dialog.render(document.body);
    dialog.open();
  }

  /**
   * Create combatant form
   * @returns {Component} The form component
   * @private
   */
  _createCombatantForm() {
    const container = new Container({
      layout: 'vertical',
      gap: 16,
      padding: 8
    });
    
    // Create form element
    const form = document.createElement('form');
    form.id = 'combatant-form';
    
    // Basic info section
    const basicInfo = new Container({
      layout: 'vertical',
      gap: 8
    });
    
    const nameInput = new Input({
      label: 'Name',
      name: 'name',
      required: true,
      placeholder: 'Enter combatant name'
    });
    
    const typeSelect = new Select({
      label: 'Type',
      name: 'type',
      options: [
        { value: 'player', label: 'Player' },
        { value: 'monster', label: 'Monster' },
        { value: 'npc', label: 'NPC' }
      ],
      value: 'monster'
    });
    
    const initiativeInput = new Input({
      label: 'Initiative',
      name: 'initiative',
      inputType: 'number',
      value: '10'
    });
    
    basicInfo.addChild(nameInput);
    basicInfo.addChild(typeSelect);
    basicInfo.addChild(initiativeInput);
    
    // Combat stats section
    const combatStats = new Container({
      layout: 'horizontal',
      gap: 8,
      wrap: true
    });
    
    const maxHpInput = new Input({
      label: 'Max HP',
      name: 'maxHp',
      inputType: 'number',
      value: '10'
    });
    
    const currentHpInput = new Input({
      label: 'Current HP',
      name: 'currentHp',
      inputType: 'number',
      value: '10'
    });
    
    const acInput = new Input({
      label: 'AC',
      name: 'ac',
      inputType: 'number',
      value: '10'
    });
    
    combatStats.addChild(maxHpInput);
    combatStats.addChild(currentHpInput);
    combatStats.addChild(acInput);
    
    // Ability scores section
    const abilityScores = new Container({
      layout: 'horizontal',
      gap: 8,
      wrap: true
    });
    
    const strInput = new Input({
      label: 'STR',
      name: 'str',
      inputType: 'number',
      value: '10'
    });
    
    const dexInput = new Input({
      label: 'DEX',
      name: 'dex',
      inputType: 'number',
      value: '10'
    });
    
    const conInput = new Input({
      label: 'CON',
      name: 'con',
      inputType: 'number',
      value: '10'
    });
    
    const intInput = new Input({
      label: 'INT',
      name: 'int',
      inputType: 'number',
      value: '10'
    });
    
    const wisInput = new Input({
      label: 'WIS',
      name: 'wis',
      inputType: 'number',
      value: '10'
    });
    
    const chaInput = new Input({
      label: 'CHA',
      name: 'cha',
      inputType: 'number',
      value: '10'
    });
    
    abilityScores.addChild(strInput);
    abilityScores.addChild(dexInput);
    abilityScores.addChild(conInput);
    abilityScores.addChild(intInput);
    abilityScores.addChild(wisInput);
    abilityScores.addChild(chaInput);
    
    // Notes section
    const notesInput = new Input({
      label: 'Notes',
      name: 'notes',
      inputType: 'textarea',
      placeholder: 'Enter any notes about this combatant'
    });
    
    // Add sections to form
    basicInfo.render(form);
    
    const combatStatsHeading = document.createElement('h3');
    combatStatsHeading.textContent = 'Combat Stats';
    form.appendChild(combatStatsHeading);
    
    combatStats.render(form);
    
    const abilityScoresHeading = document.createElement('h3');
    abilityScoresHeading.textContent = 'Ability Scores';
    form.appendChild(abilityScoresHeading);
    
    abilityScores.render(form);
    
    const notesHeading = document.createElement('h3');
    notesHeading.textContent = 'Notes';
    form.appendChild(notesHeading);
    
    notesInput.render(form);
    
    // Add form to container
    container.element.appendChild(form);
    
    return container;
  }

  /**
   * Edit a combatant
   * @param {string} id - The combatant ID
   */
  editCombatant(id) {
    const combatant = this.getCombatant(id);
    
    if (!combatant) {
      this._showError('Combatant not found.');
      return;
    }
    
    // Create edit dialog
    const dialog = new Dialog({
      title: `Edit ${combatant.name}`,
      width: 500,
      content: this._createCombatantEditForm(combatant),
      footer: [
        {
          label: 'Cancel',
          onClick: () => dialog.close()
        },
        {
          label: 'Save',
          variant: ComponentVariant.PRIMARY,
          onClick: () => {
            // Get form data
            const form = document.getElementById('combatant-edit-form');
            
            if (form) {
              const formData = new FormData(form);
              
              // Update combatant
              combatant.name = formData.get('name') || combatant.name;
              combatant.initiative = parseInt(formData.get('initiative'), 10) || combatant.initiative;
              combatant.hp.max = parseInt(formData.get('maxHp'), 10) || combatant.hp.max;
              combatant.hp.current = parseInt(formData.get('currentHp'), 10) || 0;
              combatant.ac = parseInt(formData.get('ac'), 10) || combatant.ac;
              combatant.type = formData.get('type') || combatant.type;
              combatant.stats = {
                str: parseInt(formData.get('str'), 10) || combatant.stats.str,
                dex: parseInt(formData.get('dex'), 10) || combatant.stats.dex,
                con: parseInt(formData.get('con'), 10) || combatant.stats.con,
                int: parseInt(formData.get('int'), 10) || combatant.stats.int,
                wis: parseInt(formData.get('wis'), 10) || combatant.stats.wis,
                cha: parseInt(formData.get('cha'), 10) || combatant.stats.cha
              };
              combatant.notes = formData.get('notes') || combatant.notes;
              
              // Update initiative order
              this._sortInitiative();
              
              // Update UI
              this._updateInitiativeList();
              
              // Add log entry
              this.addLogEntry({
                type: 'info',
                message: `${combatant.name} was updated.`
              });
              
              dialog.close();
              this._updateStatus(`${combatant.name} updated`);
            }
          }
        }
      ]
    });
    
    // Render and show dialog
    dialog.render(document.body);
    dialog.open();
  }

  /**
   * Create combatant edit form
   * @param {Object} combatant - The combatant to edit
   * @returns {Component} The form component
   * @private
   */
  _createCombatantEditForm(combatant) {
    const container = new Container({
      layout: 'vertical',
      gap: 16,
      padding: 8
    });
    
    // Create form element
    const form = document.createElement('form');
    form.id = 'combatant-edit-form';
    
    // Basic info section
    const basicInfo = new Container({
      layout: 'vertical',
      gap: 8
    });
    
    const nameInput = new Input({
      label: 'Name',
      name: 'name',
      required: true,
      value: combatant.name
    });
    
    const typeSelect = new Select({
      label: 'Type',
      name: 'type',
      options: [
        { value: 'player', label: 'Player' },
        { value: 'monster', label: 'Monster' },
        { value: 'npc', label: 'NPC' }
      ],
      value: combatant.type
    });
    
    const initiativeInput = new Input({
      label: 'Initiative',
      name: 'initiative',
      inputType: 'number',
      value: combatant.initiative.toString()
    });
    
    basicInfo.addChild(nameInput);
    basicInfo.addChild(typeSelect);
    basicInfo.addChild(initiativeInput);
    
    // Combat stats section
    const combatStats = new Container({
      layout: 'horizontal',
      gap: 8,
      wrap: true
    });
    
    const maxHpInput = new Input({
      label: 'Max HP',
      name: 'maxHp',
      inputType: 'number',
      value: combatant.hp.max.toString()
    });
    
    const currentHpInput = new Input({
      label: 'Current HP',
      name: 'currentHp',
      inputType: 'number',
      value: combatant.hp.current.toString()
    });
    
    const acInput = new Input({
      label: 'AC',
      name: 'ac',
      inputType: 'number',
      value: combatant.ac.toString()
    });
    
    combatStats.addChild(maxHpInput);
    combatStats.addChild(currentHpInput);
    combatStats.addChild(acInput);
    
    // Ability scores section
    const abilityScores = new Container({
      layout: 'horizontal',
      gap: 8,
      wrap: true
    });
    
    const strInput = new Input({
      label: 'STR',
      name: 'str',
      inputType: 'number',
      value: combatant.stats.str.toString()
    });
    
    const dexInput = new Input({
      label: 'DEX',
      name: 'dex',
      inputType: 'number',
      value: combatant.stats.dex.toString()
    });
    
    const conInput = new Input({
      label: 'CON',
      name: 'con',
      inputType: 'number',
      value: combatant.stats.con.toString()
    });
    
    const intInput = new Input({
      label: 'INT',
      name: 'int',
      inputType: 'number',
      value: combatant.stats.int.toString()
    });
    
    const wisInput = new Input({
      label: 'WIS',
      name: 'wis',
      inputType: 'number',
      value: combatant.stats.wis.toString()
    });
    
    const chaInput = new Input({
      label: 'CHA',
      name: 'cha',
      inputType: 'number',
      value: combatant.stats.cha.toString()
    });
    
    abilityScores.addChild(strInput);
    abilityScores.addChild(dexInput);
    abilityScores.addChild(conInput);
    abilityScores.addChild(intInput);
    abilityScores.addChild(wisInput);
    abilityScores.addChild(chaInput);
    
    // Notes section
    const notesInput = new Input({
      label: 'Notes',
      name: 'notes',
      inputType: 'textarea',
      value: combatant.notes || ''
    });
    
    // Add sections to form
    basicInfo.render(form);
    
    const combatStatsHeading = document.createElement('h3');
    combatStatsHeading.textContent = 'Combat Stats';
    form.appendChild(combatStatsHeading);
    
    combatStats.render(form);
    
    const abilityScoresHeading = document.createElement('h3');
    abilityScoresHeading.textContent = 'Ability Scores';
    form.appendChild(abilityScoresHeading);
    
    abilityScores.render(form);
    
    const notesHeading = document.createElement('h3');
    notesHeading.textContent = 'Notes';
    form.appendChild(notesHeading);
    
    notesInput.render(form);
    
    // Add form to container
    container.element.appendChild(form);
    
    return container;
  }

  /**
   * Remove a combatant
   * @param {string} id - The combatant ID
   */
  removeCombatant(id) {
    const combatant = this.getCombatant(id);
    
    if (!combatant) {
      this._showError('Combatant not found.');
      return;
    }
    
    // Show confirmation dialog
    this._showConfirmation(
      'Remove Combatant',
      `Are you sure you want to remove ${combatant.name} from combat?`,
      () => {
        // Remove from combatants array
        this.combat.combatants = this.combat.combatants.filter(c => c.id !== id);
        
        // Remove from initiative order
        this.combat.initiative = this.combat.initiative.filter(c => c.id !== id);
        
        // Update active combatant if needed
        if (this.combat.active === id) {
          this._advanceTurn();
        }
        
        // Update UI
        this._updateInitiativeList();
        
        // Add log entry
        this.addLogEntry({
          type: 'info',
          message: `${combatant.name} was removed from combat.`
        });
        
        this._updateStatus(`${combatant.name} removed from combat`);
      }
    );
  }

  /**
   * Get a combatant by ID
   * @param {string} id - The combatant ID
   * @returns {Object|null} The combatant or null if not found
   */
  getCombatant(id) {
    return this.combat.combatants.find(c => c.id === id) || null;
  }

  /**
   * Select a combatant
   * @param {string} id - The combatant ID
   */
  selectCombatant(id) {
    const combatant = this.getCombatant(id);
    
    if (!combatant) {
      return;
    }
    
    // Update UI to show selected combatant
    const items = document.querySelectorAll('.jct-combatant-item');
    
    items.forEach(item => {
      item.classList.remove('jct-selected-combatant');
    });
    
    const selectedItem = document.querySelector(`.jct-combatant-item[data-id="${id}"]`);
    
    if (selectedItem) {
      selectedItem.classList.add('jct-selected-combatant');
    }
    
    // Dispatch event
    this._dispatchEvent('combatantSelected', { combatant });
  }

  /**
   * Add a combatant to the initiative order
   * @param {Object} combatant - The combatant to add
   * @private
   */
  _addToInitiative(combatant) {
    this.combat.initiative.push(combatant);
    this._sortInitiative();
  }

  /**
   * Sort the initiative order
   */
  sortInitiative() {
    this._sortInitiative();
    this._updateInitiativeList();
    
    // Add log entry
    this.addLogEntry({
      type: 'info',
      message: 'Initiative order sorted.'
    });
  }

    /**
   * Sort the initiative order
   * @private
   */
  _sortInitiative() {
    // Sort by initiative (highest to lowest)
    this.combat.initiative.sort((a, b) => b.initiative - a.initiative);
  }

  /**
   * Toggle combat state (start/pause)
   */
  toggleCombat() {
    if (this.combatState === CombatState.ACTIVE) {
      // Pause combat
      this.combatState = CombatState.PAUSED;
      
      // Update UI
      this._updateCombatControls();
      
      // Add log entry
      this.addLogEntry({
        type: 'combat',
        message: 'Combat paused.'
      });
      
      this._updateStatus('Combat paused');
      this._dispatchEvent('combatPaused', {});
    } else {
      // Start combat
      if (this.combat.combatants.length === 0) {
        this._showError('Cannot start combat with no combatants.');
        return;
      }
      
      if (this.combatState === CombatState.INACTIVE) {
        // New combat
        this.combatState = CombatState.ACTIVE;
        this.combat.round = 1;
        this.combat.turn = 1;
        this.combat.startTime = new Date().getTime();
        
        // Set active combatant to first in initiative
        if (this.combat.initiative.length > 0) {
          this.combat.active = this.combat.initiative[0].id;
        }
        
        // Initialize combat analyzer
        this.combatAnalyzer.startCombat({
          combatants: this.combat.combatants,
          startTime: this.combat.startTime
        });
        
        // Add log entry
        this.addLogEntry({
          type: 'combat',
          message: 'Combat started.'
        });
        
        this._updateStatus('Combat started');
        this._dispatchEvent('combatStarted', { 
          round: this.combat.round,
          turn: this.combat.turn,
          active: this.combat.active
        });
      } else if (this.combatState === CombatState.PAUSED) {
        // Resume combat
        this.combatState = CombatState.ACTIVE;
        
        // Add log entry
        this.addLogEntry({
          type: 'combat',
          message: 'Combat resumed.'
        });
        
        this._updateStatus('Combat resumed');
        this._dispatchEvent('combatResumed', {});
      } else if (this.combatState === CombatState.FINISHED) {
        // Restart combat
        this.combatState = CombatState.ACTIVE;
        this.combat.round = 1;
        this.combat.turn = 1;
        this.combat.startTime = new Date().getTime();
        this.combat.endTime = null;
        
        // Set active combatant to first in initiative
        if (this.combat.initiative.length > 0) {
          this.combat.active = this.combat.initiative[0].id;
        }
        
        // Reset combat analyzer
        this.combatAnalyzer.startCombat({
          combatants: this.combat.combatants,
          startTime: this.combat.startTime
        });
        
        // Add log entry
        this.addLogEntry({
          type: 'combat',
          message: 'Combat restarted.'
        });
        
        this._updateStatus('Combat restarted');
        this._dispatchEvent('combatStarted', { 
          round: this.combat.round,
          turn: this.combat.turn,
          active: this.combat.active
        });
      }
      
      // Update UI
      this._updateCombatControls();
      this._updateInitiativeList();
    }
  }

  /**
   * Advance to the next turn
   */
  nextTurn() {
    if (this.combatState !== CombatState.ACTIVE && this.combatState !== CombatState.PAUSED) {
      this._showError('Combat is not active.');
      return;
    }
    
    this._advanceTurn();
    
    // Update UI
    this._updateCombatControls();
    this._updateInitiativeList();
    
    // Add log entry
    const activeCombatant = this.getCombatant(this.combat.active);
    
    if (activeCombatant) {
      this.addLogEntry({
        type: 'turn',
        message: `Round ${this.combat.round}, Turn ${this.combat.turn}: ${activeCombatant.name}'s turn.`
      });
    }
    
    this._updateStatus(`Round ${this.combat.round}, Turn ${this.combat.turn}`);
    this._dispatchEvent('turnChanged', { 
      round: this.combat.round,
      turn: this.combat.turn,
      activeId: this.combat.active
    });
  }

  /**
   * Go back to the previous turn
   */
  previousTurn() {
    if (this.combatState !== CombatState.ACTIVE && this.combatState !== CombatState.PAUSED) {
      this._showError('Combat is not active.');
      return;
    }
    
    this._regressTurn();
    
    // Update UI
    this._updateCombatControls();
    this._updateInitiativeList();
    
    // Add log entry
    const activeCombatant = this.getCombatant(this.combat.active);
    
    if (activeCombatant) {
      this.addLogEntry({
        type: 'turn',
        message: `Returned to Round ${this.combat.round}, Turn ${this.combat.turn}: ${activeCombatant.name}'s turn.`
      });
    }
    
    this._updateStatus(`Round ${this.combat.round}, Turn ${this.combat.turn}`);
    this._dispatchEvent('turnChanged', { 
      round: this.combat.round,
      turn: this.combat.turn,
      activeId: this.combat.active
    });
  }

  /**
   * Advance to the next round
   */
  nextRound() {
    if (this.combatState !== CombatState.ACTIVE && this.combatState !== CombatState.PAUSED) {
      this._showError('Combat is not active.');
      return;
    }
    
    // Increment round
    this.combat.round++;
    this.combat.turn = 1;
    
    // Set active combatant to first in initiative
    if (this.combat.initiative.length > 0) {
      this.combat.active = this.combat.initiative[0].id;
    }
    
    // Update UI
    this._updateCombatControls();
    this._updateInitiativeList();
    
    // Add log entry
    this.addLogEntry({
      type: 'round',
      message: `Round ${this.combat.round} started.`
    });
    
    this._updateStatus(`Round ${this.combat.round} started`);
    this._dispatchEvent('roundChanged', { 
      round: this.combat.round,
      turn: this.combat.turn,
      activeId: this.combat.active
    });
  }

  /**
   * End the combat
   */
  endCombat() {
    if (this.combatState === CombatState.INACTIVE) {
      this._showError('No active combat to end.');
      return;
    }
    
    // Show confirmation dialog
    this._showConfirmation(
      'End Combat',
      'Are you sure you want to end the current combat?',
      () => {
        // End combat
        this.combatState = CombatState.FINISHED;
        this.combat.endTime = new Date().getTime();
        
        // Notify combat analyzer
        this.combatAnalyzer.endCombat({
          endTime: this.combat.endTime
        });
        
        // Update UI
        this._updateCombatControls();
        
        // Add log entry
        this.addLogEntry({
          type: 'combat',
          message: 'Combat ended.'
        });
        
        this._updateStatus('Combat ended');
        this._dispatchEvent('combatEnded', { 
          duration: this.combat.endTime - this.combat.startTime
        });
        
        // Show combat summary
        this._showCombatSummary();
      }
    );
  }

  /**
   * Advance to the next turn
   * @private
   */
  _advanceTurn() {
    if (this.combat.initiative.length === 0) {
      return;
    }
    
    // Find current active combatant index
    const activeIndex = this.combat.initiative.findIndex(c => c.id === this.combat.active);
    
    // Calculate next index
    let nextIndex = activeIndex + 1;
    
    // Check if we need to start a new round
    if (nextIndex >= this.combat.initiative.length) {
      nextIndex = 0;
      this.combat.round++;
      this.combat.turn = 1;
      
      // Notify listeners of round change
      this._dispatchEvent('roundChanged', { 
        round: this.combat.round,
        turn: this.combat.turn
      });
    } else {
      this.combat.turn++;
    }
    
    // Set active combatant
    this.combat.active = this.combat.initiative[nextIndex].id;
    
    // Notify combat analyzer
    this.combatAnalyzer.advanceTurn({
      round: this.combat.round,
      turn: this.combat.turn,
      activeId: this.combat.active
    });
  }

  /**
   * Go back to the previous turn
   * @private
   */
  _regressTurn() {
    if (this.combat.initiative.length === 0) {
      return;
    }
    
    // Find current active combatant index
    const activeIndex = this.combat.initiative.findIndex(c => c.id === this.combat.active);
    
    // Calculate previous index
    let prevIndex = activeIndex - 1;
    
    // Check if we need to go to previous round
    if (prevIndex < 0) {
      if (this.combat.round > 1) {
        prevIndex = this.combat.initiative.length - 1;
        this.combat.round--;
        this.combat.turn = this.combat.initiative.length;
        
        // Notify listeners of round change
        this._dispatchEvent('roundChanged', { 
          round: this.combat.round,
          turn: this.combat.turn
        });
      } else {
        // Can't go before first turn of first round
        prevIndex = 0;
      }
    } else {
      this.combat.turn--;
    }
    
    // Set active combatant
    this.combat.active = this.combat.initiative[prevIndex].id;
    
    // Notify combat analyzer
    this.combatAnalyzer.regressTurn({
      round: this.combat.round,
      turn: this.combat.turn,
      activeId: this.combat.active
    });
  }

  /**
   * Zoom the tactical map
   * @param {number} factor - The zoom factor
   */
  zoomMap(factor) {
    this.tacticalManager.zoom(factor);
  }

  /**
   * Reset the tactical map view
   */
  resetMapView() {
    this.tacticalManager.resetView();
  }

  /**
   * Toggle the grid on the tactical map
   */
  toggleGrid() {
    this.tacticalManager.toggleGrid();
  }

  /**
   * Clear the tactical map
   */
  clearMap() {
    // Show confirmation dialog
    this._showConfirmation(
      'Clear Map',
      'Are you sure you want to clear the tactical map? This cannot be undone.',
      () => {
        this.tacticalManager.clear();
        
        // Add log entry
        this.addLogEntry({
          type: 'info',
          message: 'Tactical map cleared.'
        });
        
        this._updateStatus('Tactical map cleared');
      }
    );
  }

  /**
   * Open the settings dialog
   */
  openSettings() {
    // Create settings dialog
    const dialog = new Dialog({
      title: 'Settings',
      width: 600,
      content: this._createSettingsContent(),
      footer: [
        {
          label: 'Cancel',
          onClick: () => dialog.close()
        },
        {
          label: 'Save',
          variant: ComponentVariant.PRIMARY,
          onClick: () => {
            // Save settings
            this._saveSettings();
            dialog.close();
          }
        }
      ]
    });
    
    // Render and show dialog
    dialog.render(document.body);
    dialog.open();
  }

  /**
   * Create settings content
   * @returns {Component} The settings content component
   * @private
   */
  _createSettingsContent() {
    const container = new Container({
      layout: 'vertical',
      gap: 16,
      padding: 8
    });
    
    // Create tabs for different settings categories
    const tabs = new Tabs({
      tabs: [
        {
          label: 'General',
          content: this._createGeneralSettingsTab()
        },
        {
          label: 'Appearance',
          content: this._createAppearanceSettingsTab()
        },
        {
          label: 'Combat',
          content: this._createCombatSettingsTab()
        },
        {
          label: 'Map',
          content: this._createMapSettingsTab()
        },
        {
          label: 'About',
          content: this._createAboutTab()
        }
      ]
    });
    
    container.addChild(tabs);
    
    return container;
  }

  /**
   * Create general settings tab
   * @returns {Component} The general settings component
   * @private
   */
  _createGeneralSettingsTab() {
    const container = new Container({
      layout: 'vertical',
      gap: 16,
      padding: 8
    });
    
    // Auto-save settings
    const autoSaveContainer = new Container({
      layout: 'vertical',
      gap: 8
    });
    
    const autoSaveHeading = createComponent(ComponentType.HEADING, {
      level: 3,
      text: 'Auto-Save'
    });
    
    const autoSaveToggle = new Toggle({
      label: 'Enable auto-save',
      checked: this.options.autoSave,
      onChange: (e) => {
        this.options.autoSave = e.checked;
      }
    });
    
    const autoSaveIntervalInput = new Input({
      label: 'Auto-save interval (seconds)',
      inputType: 'number',
      value: (this.options.autoSaveInterval / 1000).toString(),
      min: 10,
      max: 3600,
      onChange: (e) => {
        const value = parseInt(e.target.value, 10);
        if (value >= 10 && value <= 3600) {
          this.options.autoSaveInterval = value * 1000;
        }
      }
    });
    
    autoSaveContainer.addChild(autoSaveHeading);
    autoSaveContainer.addChild(autoSaveToggle);
    autoSaveContainer.addChild(autoSaveIntervalInput);
    
    // Data management
    const dataContainer = new Container({
      layout: 'vertical',
      gap: 8
    });
    
    const dataHeading = createComponent(ComponentType.HEADING, {
      level: 3,
      text: 'Data Management'
    });
    
    const exportButton = new Button({
      label: 'Export All Data',
      onClick: () => this.exportData()
    });
    
    const importButton = new Button({
      label: 'Import Data',
      onClick: () => this.loadData()
    });
    
    const clearDataButton = new Button({
      label: 'Clear All Data',
      variant: ComponentVariant.ERROR,
      onClick: () => {
        this._showConfirmation(
          'Clear All Data',
          'Are you sure you want to clear all data? This cannot be undone.',
          () => {
            localStorage.removeItem(this.options.storageKey);
            this._createNewCombat();
            this._updateStatus('All data cleared');
          }
        );
      }
    });
    
    dataContainer.addChild(dataHeading);
    dataContainer.addChild(exportButton);
    dataContainer.addChild(importButton);
    dataContainer.addChild(clearDataButton);
    
    // Add containers to tab
    container.addChild(autoSaveContainer);
    container.addChild(dataContainer);
    
    return container;
  }

  /**
   * Create appearance settings tab
   * @returns {Component} The appearance settings component
   * @private
   */
  _createAppearanceSettingsTab() {
    const container = new Container({
      layout: 'vertical',
      gap: 16,
      padding: 8
    });
    
    // Theme settings
    const themeContainer = new Container({
      layout: 'vertical',
      gap: 8
    });
    
    const themeHeading = createComponent(ComponentType.HEADING, {
      level: 3,
      text: 'Theme'
    });
    
    // Get available themes
    const themes = this.themeManager.getAllThemes();
    const themeOptions = themes.map(theme => ({
      value: theme.id,
      label: theme.name
    }));
    
    const themeSelect = new Select({
      label: 'Select Theme',
      options: themeOptions,
      value: this.themeManager.getActiveTheme().id,
      onChange: (e) => {
        this.themeManager.applyTheme(e.target.value);
      }
    });
    
    themeContainer.addChild(themeHeading);
    themeContainer.addChild(themeSelect);
    
    // Font size settings
    const fontContainer = new Container({
      layout: 'vertical',
      gap: 8
    });
    
    const fontHeading = createComponent(ComponentType.HEADING, {
      level: 3,
      text: 'Font Size'
    });
    
    const fontSizeRadioGroup = new RadioGroup({
      name: 'fontSize',
      label: 'Select Font Size',
      options: [
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' }
      ],
      value: 'medium',
      layout: 'horizontal'
    });
    
    fontContainer.addChild(fontHeading);
    fontContainer.addChild(fontSizeRadioGroup);
    
    // Add containers to tab
    container.addChild(themeContainer);
    container.addChild(fontContainer);
    
    return container;
  }

  /**
   * Create combat settings tab
   * @returns {Component} The combat settings component
   * @private
   */
  _createCombatSettingsTab() {
    const container = new Container({
      layout: 'vertical',
      gap: 16,
      padding: 8
    });
    
    // Initiative settings
    const initiativeContainer = new Container({
      layout: 'vertical',
      gap: 8
    });
    
    const initiativeHeading = createComponent(ComponentType.HEADING, {
      level: 3,
      text: 'Initiative'
    });
    
    const groupSimilarToggle = new Toggle({
      label: 'Group similar monsters in initiative',
      checked: false
    });
    
    const tieBreakSelect = new Select({
      label: 'Initiative Tie Breaker',
      options: [
        { value: 'dex', label: 'Dexterity' },
        { value: 'random', label: 'Random' },
        { value: 'none', label: 'None (GM decides)' }
      ],
      value: 'dex'
    });
    
    initiativeContainer.addChild(initiativeHeading);
    initiativeContainer.addChild(groupSimilarToggle);
    initiativeContainer.addChild(tieBreakSelect);
    
    // Health tracking settings
    const healthContainer = new Container({
      layout: 'vertical',
      gap: 8
    });
    
    const healthHeading = createComponent(ComponentType.HEADING, {
      level: 3,
      text: 'Health Tracking'
    });
    
    const showHealthToggle = new Toggle({
      label: 'Show exact HP for monsters',
      checked: true
    });
    
    const autoDeathToggle = new Toggle({
      label: 'Automatically mark creatures at 0 HP as defeated',
      checked: true
    });
    
    healthContainer.addChild(healthHeading);
    healthContainer.addChild(showHealthToggle);
    healthContainer.addChild(autoDeathToggle);
    
    // Add containers to tab
    container.addChild(initiativeContainer);
    container.addChild(healthContainer);
    
    return container;
  }

  /**
   * Create map settings tab
   * @returns {Component} The map settings component
   * @private
   */
  _createMapSettingsTab() {
    const container = new Container({
      layout: 'vertical',
      gap: 16,
      padding: 8
    });
    
    // Grid settings
    const gridContainer = new Container({
      layout: 'vertical',
      gap: 8
    });
    
    const gridHeading = createComponent(ComponentType.HEADING, {
      level: 3,
      text: 'Grid'
    });
    
    const gridTypeRadioGroup = new RadioGroup({
      name: 'gridType',
      label: 'Grid Type',
      options: [
        { value: 'square', label: 'Square' },
        { value: 'hex', label: 'Hexagonal' }
      ],
      value: 'square',
      layout: 'horizontal'
    });
    
    const gridSizeInput = new Input({
      label: 'Grid Size (pixels)',
      inputType: 'number',
      value: '50',
      min: 20,
      max: 100
    });
    
    const gridColorInput = new Input({
      label: 'Grid Color',
      inputType: 'color',
      value: '#000000'
    });
    
    gridContainer.addChild(gridHeading);
    gridContainer.addChild(gridTypeRadioGroup);
    gridContainer.addChild(gridSizeInput);
    gridContainer.addChild(gridColorInput);
    
    // Token settings
    const tokenContainer = new Container({
      layout: 'vertical',
      gap: 8
    });
    
    const tokenHeading = createComponent(ComponentType.HEADING, {
      level: 3,
      text: 'Tokens'
    });
    
    const snapToGridToggle = new Toggle({
      label: 'Snap tokens to grid',
      checked: true
    });
    
    const showLabelsToggle = new Toggle({
      label: 'Show token labels',
      checked: true
    });
    
    tokenContainer.addChild(tokenHeading);
    tokenContainer.addChild(snapToGridToggle);
    tokenContainer.addChild(showLabelsToggle);
    
    // Add containers to tab
    container.addChild(gridContainer);
    container.addChild(tokenContainer);
    
    return container;
  }

  /**
   * Create about tab
   * @returns {Component} The about component
   * @private
   */
  _createAboutTab() {
    const container = new Container({
      layout: 'vertical',
      gap: 16,
      padding: 8
    });
    
    // App info
    const appInfo = createComponent(ComponentType.TEXT, {
      text: "Jesster's Combat Tracker v2.3.1"
    });
    
    const description = createComponent(ComponentType.TEXT, {
      text: "A comprehensive combat tracker for tabletop role-playing games."
    });
    
    const copyright = createComponent(ComponentType.TEXT, {
      text: "© 2025 Jesster. All rights reserved."
    });
    
    // Credits
    const creditsHeading = createComponent(ComponentType.HEADING, {
      level: 3,
      text: 'Credits'
    });
    
    const creditsList = createComponent(ComponentType.TEXT, {
      text: "Developed by Jesster\nUI Design by Jesster\nIcon assets from Material Design Icons"
    });
    
    // Add components to container
    container.addChild(appInfo);
    container.addChild(description);
    container.addChild(copyright);
    container.addChild(creditsHeading);
    container.addChild(creditsList);
    
    return container;
  }

  /**
   * Save settings
   * @private
   */
  _saveSettings() {
    // Settings are saved as they're changed in the UI
    // This method is called when the settings dialog is closed with "Save"
    
    // Update auto-save timer if needed
    if (this.options.autoSave) {
      if (this.autoSaveTimer) {
        clearInterval(this.autoSaveTimer);
      }
      
      this._setupAutoSave();
    } else if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
    
    // Save options to localStorage
    try {
      localStorage.setItem('jct-options', JSON.stringify(this.options));
    } catch (error) {
      console.error('Error saving options:', error);
    }
    
    this._updateStatus('Settings saved');
  }

  /**
   * Open the help dialog
   */
  openHelp() {
    // Create help dialog
    const dialog = new Dialog({
      title: 'Help',
      width: 700,
      content: this._createHelpContent(),
      footer: [
        {
          label: 'Close',
          onClick: () => dialog.close()
        }
      ]
    });
    
    // Render and show dialog
    dialog.render(document.body);
    dialog.open();
  }

  /**
   * Create help content
   * @returns {Component} The help content component
   * @private
   */
  _createHelpContent() {
    const container = new Container({
      layout: 'vertical',
      gap: 16,
      padding: 8
    });
    
    // Create tabs for different help categories
    const tabs = new Tabs({
      tabs: [
        {
          label: 'Getting Started',
          content: this._createGettingStartedHelp()
        },
        {
          label: 'Combat',
          content: this._createCombatHelp()
        },
        {
          label: 'Tactical Map',
          content: this._createMapHelp()
        },
        {
          label: 'Keyboard Shortcuts',
          content: this._createShortcutsHelp()
        },
        {
          label: 'FAQ',
          content: this._createFaqHelp()
        }
      ]
    });
    
    container.addChild(tabs);
    
    return container;
  }

  /**
   * Create getting started help content
   * @returns {Component} The getting started help component
   * @private
   */
  _createGettingStartedHelp() {
    const container = new Container({
      layout: 'vertical',
      gap: 16,
      padding: 8
    });
    
    const heading = createComponent(ComponentType.HEADING, {
      level: 2,
      text: 'Getting Started'
    });
    
    const intro = createComponent(ComponentType.TEXT, {
      text: "Welcome to Jesster's Combat Tracker! This tool helps you manage combat encounters for tabletop role-playing games. Here's how to get started:"
    });
    
    const steps = new Container({
      layout: 'vertical',
      gap: 8
    });
    
    const step1 = createComponent(ComponentType.TEXT, {
      text: "1. Add combatants by clicking the + button in the Initiative panel."
    });
    
    const step2 = createComponent(ComponentType.TEXT, {
      text: "2. Enter initiative values for each combatant."
    });
    
    const step3 = createComponent(ComponentType.TEXT, {
      text: "3. Click 'Start' to begin combat."
    });
    
    const step4 = createComponent(ComponentType.TEXT, {
      text: "4. Use the combat controls to advance turns and rounds."
    });
    
    const step5 = createComponent(ComponentType.TEXT, {
      text: "5. Track damage, conditions, and other effects during combat."
    });
    
    steps.addChild(step1);
    steps.addChild(step2);
    steps.addChild(step3);
    steps.addChild(step4);
    steps.addChild(step5);
    
    container.addChild(heading);
    container.addChild(intro);
    container.addChild(steps);
    
    return container;
  }

  /**
   * Create combat help content
   * @returns {Component} The combat help component
   * @private
   */
  _createCombatHelp() {
    const container = new Container({
      layout: 'vertical',
      gap: 16,
      padding: 8
    });
    
    const heading = createComponent(ComponentType.HEADING, {
      level: 2,
      text: 'Combat'
    });
    
    const intro = createComponent(ComponentType.TEXT, {
      text: "The combat tracker helps you manage initiative order, track health and conditions, and keep the game flowing smoothly."
    });
    
    // Initiative section
    const initiativeHeading = createComponent(ComponentType.HEADING, {
      level: 3,
      text: 'Initiative'
    });
    
    const initiativeText = createComponent(ComponentType.TEXT, {
      text: "Initiative determines the order in which combatants act. You can manually enter initiative values or use the built-in dice roller. Click the sort button to arrange combatants in initiative order."
    });
    
    // Turns and rounds section
    const turnsHeading = createComponent(ComponentType.HEADING, {
      level: 3,
      text: 'Turns and Rounds'
    });
    
    const turnsText = createComponent(ComponentType.TEXT, {
      text: "Each combatant takes one turn per round. Use the Next Turn button to advance to the next combatant. When all combatants have acted, a new round begins. The active combatant is highlighted in the initiative list."
    });
    
    // Health tracking section
    const healthHeading = createComponent(ComponentType.HEADING, {
      level: 3,
      text: 'Health Tracking'
    });
    
    const healthText = createComponent(ComponentType.TEXT, {
      text: "Click on a combatant to edit their health. You can apply damage or healing, and track temporary hit points. Combatants at 0 HP can be marked as unconscious or dead."
    });
    
    // Add sections to container
    container.addChild(heading);
    container.addChild(intro);
    container.addChild(initiativeHeading);
    container.addChild(initiativeText);
    container.addChild(turnsHeading);
    container.addChild(turnsText);
    container.addChild(healthHeading);
    container.addChild(healthText);
    
    return container;
  }

    /**
   * Create map help content
   * @returns {Component} The map help component
   * @private
   */
  _createMapHelp() {
    const container = new Container({
      layout: 'vertical',
      gap: 16,
      padding: 8
    });
    
    const heading = createComponent(ComponentType.HEADING, {
      level: 2,
      text: 'Tactical Map'
    });
    
    const intro = createComponent(ComponentType.TEXT, {
      text: "The tactical map allows you to visualize combat encounters and track positioning of combatants."
    });
    
    // Navigation section
    const navHeading = createComponent(ComponentType.HEADING, {
      level: 3,
      text: 'Navigation'
    });
    
    const navText = createComponent(ComponentType.TEXT, {
      text: "- Pan: Click and drag on the map\n- Zoom: Use the zoom buttons or mouse wheel\n- Reset: Click the Reset View button to return to the default view"
    });
    
    // Tokens section
    const tokensHeading = createComponent(ComponentType.HEADING, {
      level: 3,
      text: 'Tokens'
    });
    
    const tokensText = createComponent(ComponentType.TEXT, {
      text: "- Add: Drag a combatant from the initiative list onto the map\n- Move: Click and drag a token\n- Select: Click on a token to select it\n- Remove: Right-click on a token and select Remove"
    });
    
    // Terrain section
    const terrainHeading = createComponent(ComponentType.HEADING, {
      level: 3,
      text: 'Terrain and Objects'
    });
    
    const terrainText = createComponent(ComponentType.TEXT, {
      text: "- Draw: Use the drawing tools to add walls, doors, and other terrain features\n- Erase: Use the eraser tool to remove terrain\n- Objects: Add objects like tables, chairs, and other props from the object library"
    });
    
    // Add sections to container
    container.addChild(heading);
    container.addChild(intro);
    container.addChild(navHeading);
    container.addChild(navText);
    container.addChild(tokensHeading);
    container.addChild(tokensText);
    container.addChild(terrainHeading);
    container.addChild(terrainText);
    
    return container;
  }

  /**
   * Create shortcuts help content
   * @returns {Component} The shortcuts help component
   * @private
   */
  _createShortcutsHelp() {
    const container = new Container({
      layout: 'vertical',
      gap: 16,
      padding: 8
    });
    
    const heading = createComponent(ComponentType.HEADING, {
      level: 2,
      text: 'Keyboard Shortcuts'
    });
    
    const intro = createComponent(ComponentType.TEXT, {
      text: "Use these keyboard shortcuts to speed up your workflow:"
    });
    
    // Create shortcuts table
    const shortcutsTable = new Table({
      columns: [
        { field: 'key', label: 'Key', width: '150px' },
        { field: 'action', label: 'Action' }
      ],
      data: [
        { key: 'N', action: 'New combat' },
        { key: 'S', action: 'Save data' },
        { key: 'Space', action: 'Start/pause combat' },
        { key: 'Right Arrow', action: 'Next turn' },
        { key: 'Left Arrow', action: 'Previous turn' },
        { key: 'R', action: 'Next round' },
        { key: 'A', action: 'Add combatant' },
        { key: 'D', action: 'Damage selected combatant' },
        { key: 'H', action: 'Heal selected combatant' },
        { key: 'C', action: 'Add condition to selected combatant' },
        { key: 'Delete', action: 'Remove selected combatant' },
        { key: 'Ctrl+Z', action: 'Undo' },
        { key: 'Ctrl+Y', action: 'Redo' },
        { key: 'F1', action: 'Open help' }
      ]
    });
    
    container.addChild(heading);
    container.addChild(intro);
    container.addChild(shortcutsTable);
    
    return container;
  }

  /**
   * Create FAQ help content
   * @returns {Component} The FAQ help component
   * @private
   */
  _createFaqHelp() {
    const container = new Container({
      layout: 'vertical',
      gap: 16,
      padding: 8
    });
    
    const heading = createComponent(ComponentType.HEADING, {
      level: 2,
      text: 'Frequently Asked Questions'
    });
    
    // FAQ items
    const faq1Heading = createComponent(ComponentType.HEADING, {
      level: 3,
      text: 'How do I save my combat data?'
    });
    
    const faq1Text = createComponent(ComponentType.TEXT, {
      text: "Your data is automatically saved to your browser's local storage. You can also manually save by clicking the Save button in the header. To export your data for backup or sharing, use the Export option in the Settings menu."
    });
    
    const faq2Heading = createComponent(ComponentType.HEADING, {
      level: 3,
      text: 'Can I import monsters from other sources?'
    });
    
    const faq2Text = createComponent(ComponentType.TEXT, {
      text: "Yes! You can import monsters from JSON files using the Import option in the Settings menu. The file format should match the application's data structure."
    });
    
    const faq3Heading = createComponent(ComponentType.HEADING, {
      level: 3,
      text: 'How do I track conditions like Poisoned or Stunned?'
    });
    
    const faq3Text = createComponent(ComponentType.TEXT, {
      text: "Select a combatant and click the 'Add Condition' button. Choose from the list of conditions or create a custom one. Conditions appear as icons next to the combatant in the initiative list."
    });
    
    const faq4Heading = createComponent(ComponentType.HEADING, {
      level: 3,
      text: 'Can I use this offline?'
    });
    
    const faq4Text = createComponent(ComponentType.TEXT, {
      text: "Yes! Once you've loaded the application, it works entirely in your browser and doesn't require an internet connection. You can also install it as a Progressive Web App for easier offline access."
    });
    
    // Add FAQ items to container
    container.addChild(heading);
    container.addChild(faq1Heading);
    container.addChild(faq1Text);
    container.addChild(faq2Heading);
    container.addChild(faq2Text);
    container.addChild(faq3Heading);
    container.addChild(faq3Text);
    container.addChild(faq4Heading);
    container.addChild(faq4Text);
    
    return container;
  }

  /**
   * Open detailed stats dialog
   */
  openDetailedStats() {
    // Get combat stats
    const stats = this.combatAnalyzer.getCombatStats();
    
    if (!stats) {
      this._showError('No combat statistics available.');
      return;
    }
    
    // Create stats dialog
    const dialog = new Dialog({
      title: 'Detailed Combat Statistics',
      width: 800,
      content: this._createDetailedStatsContent(stats),
      footer: [
        {
          label: 'Close',
          onClick: () => dialog.close()
        },
        {
          label: 'Export Stats',
          variant: ComponentVariant.PRIMARY,
          onClick: () => {
            this.exportCombatStats();
            dialog.close();
          }
        }
      ]
    });
    
    // Render and show dialog
    dialog.render(document.body);
    dialog.open();
  }

  /**
   * Create detailed stats content
   * @param {Object} stats - The combat statistics
   * @returns {Component} The detailed stats component
   * @private
   */
  _createDetailedStatsContent(stats) {
    const container = new Container({
      layout: 'vertical',
      gap: 16,
      padding: 8
    });
    
    // Create tabs for different stat categories
    const tabs = new Tabs({
      tabs: [
        {
          label: 'Overview',
          content: this._createStatsOverviewTab(stats)
        },
        {
          label: 'Combatants',
          content: this._createCombatantsStatsTab(stats)
        },
        {
          label: 'Damage',
          content: this._createDamageStatsTab(stats)
        },
        {
          label: 'Round by Round',
          content: this._createRoundByRoundStatsTab(stats)
        }
      ]
    });
    
    container.addChild(tabs);
    
    return container;
  }

  /**
   * Create stats overview tab
   * @param {Object} stats - The combat statistics
   * @returns {Component} The stats overview component
   * @private
   */
  _createStatsOverviewTab(stats) {
    const container = new Container({
      layout: 'vertical',
      gap: 16,
      padding: 8
    });
    
    // Combat info
    const infoPanel = new Panel({
      title: 'Combat Information',
      elevation: 1
    });
    
    const infoContainer = new Container({
      layout: 'vertical',
      gap: 8,
      padding: 16
    });
    
    // Duration
    const durationContainer = new Container({
      layout: 'horizontal',
      gap: 8,
      justify: 'between'
    });
    
    const durationLabel = createComponent(ComponentType.TEXT, {
      className: 'jct-stat-label',
      text: 'Duration:'
    });
    
    const durationValue = createComponent(ComponentType.TEXT, {
      className: 'jct-stat-value',
      text: this._formatDuration(stats.duration)
    });
    
    durationContainer.addChild(durationLabel);
    durationContainer.addChild(durationValue);
    
    // Rounds
    const roundsContainer = new Container({
      layout: 'horizontal',
      gap: 8,
      justify: 'between'
    });
    
    const roundsLabel = createComponent(ComponentType.TEXT, {
      className: 'jct-stat-label',
      text: 'Total Rounds:'
    });
    
    const roundsValue = createComponent(ComponentType.TEXT, {
      className: 'jct-stat-value',
      text: stats.totalRounds.toString()
    });
    
    roundsContainer.addChild(roundsLabel);
    roundsContainer.addChild(roundsValue);
    
    // Turns
    const turnsContainer = new Container({
      layout: 'horizontal',
      gap: 8,
      justify: 'between'
    });
    
    const turnsLabel = createComponent(ComponentType.TEXT, {
      className: 'jct-stat-label',
      text: 'Total Turns:'
    });
    
    const turnsValue = createComponent(ComponentType.TEXT, {
      className: 'jct-stat-value',
      text: stats.totalTurns.toString()
    });
    
    turnsContainer.addChild(turnsLabel);
    turnsContainer.addChild(turnsValue);
    
    // Average round time
    const avgRoundContainer = new Container({
      layout: 'horizontal',
      gap: 8,
      justify: 'between'
    });
    
    const avgRoundLabel = createComponent(ComponentType.TEXT, {
      className: 'jct-stat-label',
      text: 'Average Time Per Round:'
    });
    
    const avgRoundValue = createComponent(ComponentType.TEXT, {
      className: 'jct-stat-value',
      text: this._formatDuration(stats.averageTimePerRound)
    });
    
    avgRoundContainer.addChild(avgRoundLabel);
    avgRoundContainer.addChild(avgRoundValue);
    
    infoContainer.addChild(durationContainer);
    infoContainer.addChild(roundsContainer);
    infoContainer.addChild(turnsContainer);
    infoContainer.addChild(avgRoundContainer);
    
    infoPanel.addChild(infoContainer);
    
    // Summary stats
    const summaryPanel = new Panel({
      title: 'Combat Summary',
      elevation: 1
    });
    
    const summaryContainer = new Container({
      layout: 'vertical',
      gap: 8,
      padding: 16
    });
    
    // Total damage
    const damageContainer = new Container({
      layout: 'horizontal',
      gap: 8,
      justify: 'between'
    });
    
    const damageLabel = createComponent(ComponentType.TEXT, {
      className: 'jct-stat-label',
      text: 'Total Damage Dealt:'
    });
    
    const damageValue = createComponent(ComponentType.TEXT, {
      className: 'jct-stat-value',
      text: stats.totalDamageDealt.toString()
    });
    
    damageContainer.addChild(damageLabel);
    damageContainer.addChild(damageValue);
    
    // Total healing
    const healingContainer = new Container({
      layout: 'horizontal',
      gap: 8,
      justify: 'between'
    });
    
    const healingLabel = createComponent(ComponentType.TEXT, {
      className: 'jct-stat-label',
      text: 'Total Healing Done:'
    });
    
    const healingValue = createComponent(ComponentType.TEXT, {
      className: 'jct-stat-value',
      text: stats.totalHealingDone.toString()
    });
    
    healingContainer.addChild(healingLabel);
    healingContainer.addChild(healingValue);
    
    // Highest damage in one round
    const highestDamageContainer = new Container({
      layout: 'horizontal',
      gap: 8,
      justify: 'between'
    });
    
    const highestDamageLabel = createComponent(ComponentType.TEXT, {
      className: 'jct-stat-label',
      text: 'Highest Damage in One Round:'
    });
    
    const highestDamageValue = createComponent(ComponentType.TEXT, {
      className: 'jct-stat-value',
      text: `${stats.highestDamageInOneRound} (Round ${stats.highestDamageRound})`
    });
    
    highestDamageContainer.addChild(highestDamageLabel);
    highestDamageContainer.addChild(highestDamageValue);
    
    // Total conditions applied
    const conditionsContainer = new Container({
      layout: 'horizontal',
      gap: 8,
      justify: 'between'
    });
    
    const conditionsLabel = createComponent(ComponentType.TEXT, {
      className: 'jct-stat-label',
      text: 'Total Conditions Applied:'
    });
    
    const conditionsValue = createComponent(ComponentType.TEXT, {
      className: 'jct-stat-value',
      text: stats.totalConditionsApplied.toString()
    });
    
    conditionsContainer.addChild(conditionsLabel);
    conditionsContainer.addChild(conditionsValue);
    
    summaryContainer.addChild(damageContainer);
    summaryContainer.addChild(healingContainer);
    summaryContainer.addChild(highestDamageContainer);
    summaryContainer.addChild(conditionsContainer);
    
    summaryPanel.addChild(summaryContainer);
    
    // Add panels to container
    container.addChild(infoPanel);
    container.addChild(summaryPanel);
    
    return container;
  }

  /**
   * Create combatants stats tab
   * @param {Object} stats - The combat statistics
   * @returns {Component} The combatants stats component
   * @private
   */
  _createCombatantsStatsTab(stats) {
    const container = new Container({
      layout: 'vertical',
      gap: 16,
      padding: 8
    });
    
    // Create table of combatant stats
    const combatantsTable = new Table({
      columns: [
        { field: 'name', label: 'Name', width: '150px' },
        { field: 'damageDealt', label: 'Damage Dealt' },
        { field: 'damageTaken', label: 'Damage Taken' },
        { field: 'healing', label: 'Healing Done' },
        { field: 'kills', label: 'Kills' },
        { field: 'turnCount', label: 'Turns Taken' },
        { field: 'avgDamagePerTurn', label: 'Avg Damage/Turn', 
          formatter: value => value.toFixed(1) }
      ],
      data: stats.combatantStats || [],
      sortable: true,
      sortColumn: 'damageDealt',
      sortDirection: 'desc'
    });
    
    container.addChild(combatantsTable);
    
    return container;
  }

  /**
   * Create damage stats tab
   * @param {Object} stats - The combat statistics
   * @returns {Component} The damage stats component
   * @private
   */
  _createDamageStatsTab(stats) {
    const container = new Container({
      layout: 'vertical',
      gap: 16,
      padding: 8
    });
    
    // Damage by type panel
    const damageTypePanel = new Panel({
      title: 'Damage by Type',
      elevation: 1
    });
    
    const damageTypeContainer = new Container({
      layout: 'vertical',
      gap: 8,
      padding: 16
    });
    
    // Create table of damage by type
    const damageTypeTable = new Table({
      columns: [
        { field: 'type', label: 'Damage Type', width: '150px' },
        { field: 'amount', label: 'Amount' },
        { field: 'percentage', label: 'Percentage', 
          formatter: value => `${value.toFixed(1)}%` }
      ],
      data: stats.damageByType || [],
      sortable: true,
      sortColumn: 'amount',
      sortDirection: 'desc'
    });
    
    damageTypeContainer.addChild(damageTypeTable);
    damageTypePanel.addChild(damageTypeContainer);
    
    // Damage sources panel
    const sourcePanel = new Panel({
      title: 'Top Damage Sources',
      elevation: 1
    });
    
    const sourceContainer = new Container({
      layout: 'vertical',
      gap: 8,
      padding: 16
    });
    
    // Create table of damage sources
    const sourceTable = new Table({
      columns: [
        { field: 'source', label: 'Source', width: '150px' },
        { field: 'amount', label: 'Amount' },
        { field: 'percentage', label: 'Percentage', 
          formatter: value => `${value.toFixed(1)}%` }
      ],
      data: stats.topDamageSources || [],
      sortable: true,
      sortColumn: 'amount',
      sortDirection: 'desc'
    });
    
    sourceContainer.addChild(sourceTable);
    sourcePanel.addChild(sourceContainer);
    
    // Add panels to container
    container.addChild(damageTypePanel);
    container.addChild(sourcePanel);
    
    return container;
  }

  /**
   * Create round by round stats tab
   * @param {Object} stats - The combat statistics
   * @returns {Component} The round by round stats component
   * @private
   */
  _createRoundByRoundStatsTab(stats) {
    const container = new Container({
      layout: 'vertical',
      gap: 16,
      padding: 8
    });
    
    // Create table of round by round stats
    const roundsTable = new Table({
      columns: [
        { field: 'round', label: 'Round', width: '80px' },
        { field: 'damageDealt', label: 'Damage Dealt' },
        { field: 'healingDone', label: 'Healing Done' },
        { field: 'conditionsApplied', label: 'Conditions Applied' },
        { field: 'duration', label: 'Duration', 
          formatter: value => this._formatDuration(value) }
      ],
      data: stats.roundByRoundStats || [],
      sortable: true,
      sortColumn: 'round',
      sortDirection: 'asc'
    });
    
    container.addChild(roundsTable);
    
    return container;
  }

  /**
   * Destroy the application
   */
  destroy() {
    // Clear auto-save timer
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
    
    // Destroy UI components
    if (this.ui.mainContainer) {
      this.ui.mainContainer.destroy();
    }
    
    if (this.ui.loadingModal) {
      this.ui.loadingModal.destroy();
    }
    
    if (this.ui.errorModal) {
      this.ui.errorModal.destroy();
    }
    
    // Remove event listeners
    window.removeEventListener('resize', this._handleWindowResize);
    
    // Clear event listeners
    this.eventListeners.clear();
    
    // Save data before destroying
    this.saveData(true);
  }
}

/**
 * Generate a unique ID
 * @returns {string} A unique ID
 */
function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Create a combat tracker application
 * @param {Object} options - Configuration options
 * @returns {CombatTrackerApp} A new combat tracker application instance
 */
export function createCombatTrackerApp(options = {}) {
  return new CombatTrackerApp(options);
}

// Export the main application functions and classes
export default {
  createCombatTrackerApp,
  CombatTrackerApp,
  AppState,
  CombatState
};
