/**
 * Jesster's Combat Tracker
 * Theme Module
 * Version 2.3.1
 * 
 * This module provides theming functionality for the application.
 */

/**
 * Theme mode
 */
export const ThemeMode = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

/**
 * Default themes
 */
const DEFAULT_THEMES = [
  {
    id: 'light',
    name: 'Light',
    mode: ThemeMode.LIGHT,
    colors: {
      primary: '#3f51b5',
      secondary: '#f50057',
      background: '#ffffff',
      surface: '#f5f5f5',
      text: '#212121',
      textSecondary: '#757575',
      border: '#e0e0e0',
      error: '#f44336',
      warning: '#ff9800',
      success: '#4caf50',
      info: '#2196f3'
    }
  },
  {
    id: 'dark',
    name: 'Dark',
    mode: ThemeMode.DARK,
    colors: {
      primary: '#7986cb',
      secondary: '#ff4081',
      background: '#121212',
      surface: '#1e1e1e',
      text: '#ffffff',
      textSecondary: '#b0b0b0',
      border: '#333333',
      error: '#f44336',
      warning: '#ff9800',
      success: '#4caf50',
      info: '#2196f3'
    }
  },
  {
    id: 'blue',
    name: 'Blue',
    mode: ThemeMode.LIGHT,
    colors: {
      primary: '#1976d2',
      secondary: '#dc004e',
      background: '#ffffff',
      surface: '#f5f5f5',
      text: '#212121',
      textSecondary: '#757575',
      border: '#e0e0e0',
      error: '#f44336',
      warning: '#ff9800',
      success: '#4caf50',
      info: '#2196f3'
    }
  },
  {
    id: 'green',
    name: 'Green',
    mode: ThemeMode.LIGHT,
    colors: {
      primary: '#388e3c',
      secondary: '#d32f2f',
      background: '#ffffff',
      surface: '#f5f5f5',
      text: '#212121',
      textSecondary: '#757575',
      border: '#e0e0e0',
      error: '#f44336',
      warning: '#ff9800',
      success: '#4caf50',
      info: '#2196f3'
    }
  },
  {
    id: 'purple',
    name: 'Purple',
    mode: ThemeMode.LIGHT,
    colors: {
      primary: '#7b1fa2',
      secondary: '#c2185b',
      background: '#ffffff',
      surface: '#f5f5f5',
      text: '#212121',
      textSecondary: '#757575',
      border: '#e0e0e0',
      error: '#f44336',
      warning: '#ff9800',
      success: '#4caf50',
      info: '#2196f3'
    }
  },
  {
    id: 'high-contrast',
    name: 'High Contrast',
    mode: ThemeMode.LIGHT,
    colors: {
      primary: '#000000',
      secondary: '#d50000',
      background: '#ffffff',
      surface: '#f0f0f0',
      text: '#000000',
      textSecondary: '#505050',
      border: '#000000',
      error: '#d50000',
      warning: '#ff6d00',
      success: '#00c853',
      info: '#0091ea'
    }
  },
  {
    id: 'system',
    name: 'System',
    mode: ThemeMode.SYSTEM,
    colors: {} // Will be set based on system preference
  }
];

/**
 * Theme manager class
 */
class ThemeManager {
  /**
   * Create a theme manager
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      defaultTheme: 'system',
      autoApply: true,
      ...options
    };
    
    this.themes = [...DEFAULT_THEMES];
    this.activeTheme = null;
    this.listeners = [];
    
    // Initialize
    this._initialize();
  }

  /**
   * Initialize the theme manager
   * @private
   */
  _initialize() {
    // Set up system theme detection
    this._setupSystemThemeDetection();
    
    // Apply default theme
    const defaultThemeId = this.options.defaultTheme;
    const savedThemeId = localStorage.getItem('jct-theme');
    
    const themeId = savedThemeId || defaultThemeId;
    
    if (this.options.autoApply) {
      this.applyTheme(themeId);
    } else {
      this.activeTheme = this.getTheme(themeId);
    }
  }

  /**
   * Set up system theme detection
   * @private
   */
  _setupSystemThemeDetection() {
    // Check if system supports dark mode detection
    if (window.matchMedia) {
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      // Set initial system theme
      this._updateSystemTheme(darkModeQuery.matches);
      
      // Listen for changes
      try {
        // Chrome & Firefox
        darkModeQuery.addEventListener('change', (e) => {
          this._updateSystemTheme(e.matches);
        });
      } catch (error) {
        // Safari
        darkModeQuery.addListener((e) => {
          this._updateSystemTheme(e.matches);
        });
      }
    }
  }

  /**
   * Update system theme
   * @param {boolean} isDark - Whether system theme is dark
   * @private
   */
  _updateSystemTheme(isDark) {
    // Find system theme
    const systemTheme = this.themes.find(theme => theme.id === 'system');
    
    if (systemTheme) {
      // Get base theme based on system preference
      const baseTheme = this.themes.find(theme => 
        theme.id === (isDark ? 'dark' : 'light')
      );
      
      if (baseTheme) {
        // Update system theme colors
        systemTheme.colors = { ...baseTheme.colors };
        
        // Update active theme if it's system
        if (this.activeTheme && this.activeTheme.id === 'system') {
          this._applyThemeToDOM(systemTheme);
        }
      }
    }
  }

  /**
   * Get a theme by ID
   * @param {string} id - Theme ID
   * @returns {Object|null} The theme or null if not found
   */
  getTheme(id) {
    return this.themes.find(theme => theme.id === id) || null;
  }

  /**
   * Get all themes
   * @returns {Array} All themes
   */
  getAllThemes() {
    return [...this.themes];
  }

  /**
   * Get the active theme
   * @returns {Object} The active theme
   */
  getActiveTheme() {
    return this.activeTheme || this.getTheme('light');
  }

  /**
   * Add a custom theme
   * @param {Object} theme - Theme data
   * @returns {Object|null} The added theme or null if invalid
   */
  addTheme(theme) {
    if (!theme || !theme.id || !theme.name || !theme.colors) {
      console.error('Invalid theme data');
      return null;
    }
    
    // Check if theme with same ID already exists
    const existingIndex = this.themes.findIndex(t => t.id === theme.id);
    
    if (existingIndex !== -1) {
      // Replace existing theme
      this.themes[existingIndex] = { ...theme };
      
      // Update active theme if needed
      if (this.activeTheme && this.activeTheme.id === theme.id) {
        this.activeTheme = this.themes[existingIndex];
        
        if (this.options.autoApply) {
          this._applyThemeToDOM(this.activeTheme);
        }
      }
      
      this._notifyListeners('themeUpdated', { theme: this.themes[existingIndex] });
      
      return this.themes[existingIndex];
    }
    
    // Add new theme
    this.themes.push({ ...theme });
    
    this._notifyListeners('themeAdded', { theme });
    
    return theme;
  }

  /**
   * Remove a theme
   * @param {string} id - Theme ID
   * @returns {boolean} True if theme was removed
   */
  removeTheme(id) {
    // Don't allow removing default themes
    if (['light', 'dark', 'system'].includes(id)) {
      console.error('Cannot remove default themes');
      return false;
    }
    
    const index = this.themes.findIndex(theme => theme.id === id);
    
    if (index === -1) return false;
    
    const theme = this.themes[index];
    this.themes.splice(index, 1);
    
    // Switch to default theme if active theme was removed
    if (this.activeTheme && this.activeTheme.id === id) {
      this.applyTheme(this.options.defaultTheme);
    }
    
    this._notifyListeners('themeRemoved', { theme });
    
    return true;
  }

  /**
   * Apply a theme
   * @param {string} id - Theme ID
   * @returns {boolean} True if theme was applied
   */
  applyTheme(id) {
    const theme = this.getTheme(id);
    
    if (!theme) {
      console.error(`Theme not found: ${id}`);
      return false;
    }
    
    this.activeTheme = theme;
    
    // Save theme preference
    localStorage.setItem('jct-theme', id);
    
    // Apply theme to DOM
    if (this.options.autoApply) {
      this._applyThemeToDOM(theme);
    }
    
    this._notifyListeners('themeChanged', { theme });
    
    return true;
  }

  /**
   * Apply theme to DOM
   * @param {Object} theme - Theme to apply
   * @private
   */
  _applyThemeToDOM(theme) {
    // Set theme mode class on body
    document.body.classList.remove('jct-theme-light', 'jct-theme-dark');
    
    let mode = theme.mode;
    
    // Handle system theme
    if (mode === ThemeMode.SYSTEM) {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      mode = prefersDark ? ThemeMode.DARK : ThemeMode.LIGHT;
    }
    
    document.body.classList.add(`jct-theme-${mode}`);
    
    // Set CSS variables
    const root = document.documentElement;
    
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--jct-${key}`, value);
    });
  }

  /**
   * Add event listener
   * @param {Function} listener - Event listener function
   * @returns {Function} Function to remove the listener
   */
  addListener(listener) {
    this.listeners.push(listener);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index !== -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify listeners of an event
   * @param {string} event - Event name
   * @param {Object} data - Event data
   * @private
   */
  _notifyListeners(event, data) {
    this.listeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Error in theme manager listener:', error);
      }
    });
  }
}

/**
 * Create a theme manager
 * @param {Object} options - Configuration options
 * @returns {ThemeManager} A new theme manager instance
 */
export function createThemeManager(options = {}) {
  return new ThemeManager(options);
}

export default {
  createThemeManager,
  ThemeMode
};
