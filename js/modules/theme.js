/**
 * Jesster's Combat Tracker
 * Theme Module
 * Version 2.3.1
 * 
 * This module handles theming and appearance customization for the application.
 */

/**
 * Theme modes
 */
export const ThemeMode = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
  CUSTOM: 'custom'
};

/**
 * Color schemes
 */
export const ColorScheme = {
  DEFAULT: 'default',
  CLASSIC: 'classic',
  FANTASY: 'fantasy',
  MODERN: 'modern',
  HORROR: 'horror',
  SCIFI: 'scifi',
  CUSTOM: 'custom'
};

/**
 * Font sizes
 */
export const FontSize = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
  XLARGE: 'xlarge',
  CUSTOM: 'custom'
};

/**
 * Default theme colors
 */
const DEFAULT_COLORS = {
  light: {
    primary: '#3f51b5',
    secondary: '#f50057',
    background: '#ffffff',
    surface: '#f5f5f5',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
    success: '#4caf50',
    text: {
      primary: '#212121',
      secondary: '#757575',
      disabled: '#9e9e9e',
      hint: '#9e9e9e'
    },
    divider: '#e0e0e0',
    elevation: {
      1: 'rgba(0, 0, 0, 0.05)',
      2: 'rgba(0, 0, 0, 0.07)',
      3: 'rgba(0, 0, 0, 0.08)',
      4: 'rgba(0, 0, 0, 0.09)',
      6: 'rgba(0, 0, 0, 0.11)',
      8: 'rgba(0, 0, 0, 0.12)',
      12: 'rgba(0, 0, 0, 0.14)',
      16: 'rgba(0, 0, 0, 0.15)',
      24: 'rgba(0, 0, 0, 0.16)'
    }
  },
  dark: {
    primary: '#7986cb',
    secondary: '#ff4081',
    background: '#121212',
    surface: '#1e1e1e',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
    success: '#4caf50',
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
      disabled: '#6c6c6c',
      hint: '#6c6c6c'
    },
    divider: '#2e2e2e',
    elevation: {
      1: 'rgba(255, 255, 255, 0.05)',
      2: 'rgba(255, 255, 255, 0.07)',
      3: 'rgba(255, 255, 255, 0.08)',
      4: 'rgba(255, 255, 255, 0.09)',
      6: 'rgba(255, 255, 255, 0.11)',
      8: 'rgba(255, 255, 255, 0.12)',
      12: 'rgba(255, 255, 255, 0.14)',
      16: 'rgba(255, 255, 255, 0.15)',
      24: 'rgba(255, 255, 255, 0.16)'
    }
  }
};

/**
 * Color scheme presets
 */
const COLOR_SCHEMES = {
  default: {
    light: {
      primary: '#3f51b5',
      secondary: '#f50057'
    },
    dark: {
      primary: '#7986cb',
      secondary: '#ff4081'
    }
  },
  classic: {
    light: {
      primary: '#8b0000',
      secondary: '#006400',
      background: '#f5f5dc'
    },
    dark: {
      primary: '#b22222',
      secondary: '#228b22',
      background: '#2d2d1e'
    }
  },
  fantasy: {
    light: {
      primary: '#4b0082',
      secondary: '#b8860b',
      background: '#fffaf0'
    },
    dark: {
      primary: '#9370db',
      secondary: '#daa520',
      background: '#1a1a0f'
    }
  },
  modern: {
    light: {
      primary: '#1976d2',
      secondary: '#388e3c',
      background: '#ffffff'
    },
    dark: {
      primary: '#42a5f5',
      secondary: '#66bb6a',
      background: '#121212'
    }
  },
  horror: {
    light: {
      primary: '#880e4f',
      secondary: '#bf360c',
      background: '#f0f0f0'
    },
    dark: {
      primary: '#d81b60',
      secondary: '#ff3d00',
      background: '#0a0a0a'
    }
  },
  scifi: {
    light: {
      primary: '#0d47a1',
      secondary: '#00bcd4',
      background: '#e8eaf6'
    },
    dark: {
      primary: '#2962ff',
      secondary: '#00e5ff',
      background: '#0a192f'
    }
  }
};

/**
 * Default font settings
 */
const DEFAULT_FONTS = {
  base: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    fontSize: '16px',
    lineHeight: 1.5
  },
  headings: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    fontWeight: 500,
    lineHeight: 1.2
  },
  monospace: {
    fontFamily: "'Roboto Mono', 'Courier New', monospace",
    fontSize: '0.9em'
  },
  sizes: {
    small: {
      scale: 0.875
    },
    medium: {
      scale: 1
    },
    large: {
      scale: 1.125
    },
    xlarge: {
      scale: 1.25
    }
  }
};

/**
 * Default spacing values
 */
const DEFAULT_SPACING = {
  unit: 8,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
};

/**
 * Default border radius values
 */
const DEFAULT_BORDER_RADIUS = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: '50%'
};

/**
 * Default transition settings
 */
const DEFAULT_TRANSITIONS = {
  duration: {
    shortest: 150,
    shorter: 200,
    short: 250,
    standard: 300,
    complex: 375,
    enteringScreen: 225,
    leavingScreen: 195
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)'
  }
};

/**
 * Default shadows
 */
const DEFAULT_SHADOWS = {
  light: [
    'none',
    '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
    '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)',
    '0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)',
    '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
    '0px 3px 5px -1px rgba(0,0,0,0.2),0px 5px 8px 0px rgba(0,0,0,0.14),0px 1px 14px 0px rgba(0,0,0,0.12)',
    '0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)',
    '0px 4px 5px -2px rgba(0,0,0,0.2),0px 7px 10px 1px rgba(0,0,0,0.14),0px 2px 16px 1px rgba(0,0,0,0.12)',
    '0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)',
    '0px 5px 6px -3px rgba(0,0,0,0.2),0px 9px 12px 1px rgba(0,0,0,0.14),0px 3px 16px 2px rgba(0,0,0,0.12)',
    '0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)',
    '0px 6px 7px -4px rgba(0,0,0,0.2),0px 11px 15px 1px rgba(0,0,0,0.14),0px 4px 20px 3px rgba(0,0,0,0.12)',
    '0px 7px 8px -4px rgba(0,0,0,0.2),0px 12px 17px 2px rgba(0,0,0,0.14),0px 5px 22px 4px rgba(0,0,0,0.12)',
    '0px 7px 8px -4px rgba(0,0,0,0.2),0px 13px 19px 2px rgba(0,0,0,0.14),0px 5px 24px 4px rgba(0,0,0,0.12)',
    '0px 7px 9px -4px rgba(0,0,0,0.2),0px 14px 21px 2px rgba(0,0,0,0.14),0px 5px 26px 4px rgba(0,0,0,0.12)',
    '0px 8px 9px -5px rgba(0,0,0,0.2),0px 15px 22px 2px rgba(0,0,0,0.14),0px 6px 28px 5px rgba(0,0,0,0.12)',
    '0px 8px 10px -5px rgba(0,0,0,0.2),0px 16px 24px 2px rgba(0,0,0,0.14),0px 6px 30px 5px rgba(0,0,0,0.12)',
    '0px 8px 11px -5px rgba(0,0,0,0.2),0px 17px 26px 2px rgba(0,0,0,0.14),0px 6px 32px 5px rgba(0,0,0,0.12)',
    '0px 9px 11px -5px rgba(0,0,0,0.2),0px 18px 28px 2px rgba(0,0,0,0.14),0px 7px 34px 6px rgba(0,0,0,0.12)',
    '0px 9px 12px -6px rgba(0,0,0,0.2),0px 19px 29px 2px rgba(0,0,0,0.14),0px 7px 36px 6px rgba(0,0,0,0.12)',
    '0px 10px 13px -6px rgba(0,0,0,0.2),0px 20px 31px 3px rgba(0,0,0,0.14),0px 8px 38px 7px rgba(0,0,0,0.12)',
    '0px 10px 13px -6px rgba(0,0,0,0.2),0px 21px 33px 3px rgba(0,0,0,0.14),0px 8px 40px 7px rgba(0,0,0,0.12)',
    '0px 10px 14px -6px rgba(0,0,0,0.2),0px 22px 35px 3px rgba(0,0,0,0.14),0px 8px 42px 7px rgba(0,0,0,0.12)',
    '0px 11px 14px -7px rgba(0,0,0,0.2),0px 23px 36px 3px rgba(0,0,0,0.14),0px 9px 44px 8px rgba(0,0,0,0.12)',
    '0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)'
  ],
  dark: [
    'none',
    '0px 2px 1px -1px rgba(255,255,255,0.12),0px 1px 1px 0px rgba(255,255,255,0.08),0px 1px 3px 0px rgba(255,255,255,0.04)',
    '0px 3px 1px -2px rgba(255,255,255,0.12),0px 2px 2px 0px rgba(255,255,255,0.08),0px 1px 5px 0px rgba(255,255,255,0.04)',
    '0px 3px 3px -2px rgba(255,255,255,0.12),0px 3px 4px 0px rgba(255,255,255,0.08),0px 1px 8px 0px rgba(255,255,255,0.04)',
    '0px 2px 4px -1px rgba(255,255,255,0.12),0px 4px 5px 0px rgba(255,255,255,0.08),0px 1px 10px 0px rgba(255,255,255,0.04)',
    '0px 3px 5px -1px rgba(255,255,255,0.12),0px 5px 8px 0px rgba(255,255,255,0.08),0px 1px 14px 0px rgba(255,255,255,0.04)',
    '0px 3px 5px -1px rgba(255,255,255,0.12),0px 6px 10px 0px rgba(255,255,255,0.08),0px 1px 18px 0px rgba(255,255,255,0.04)',
    '0px 4px 5px -2px rgba(255,255,255,0.12),0px 7px 10px 1px rgba(255,255,255,0.08),0px 2px 16px 1px rgba(255,255,255,0.04)',
    '0px 5px 5px -3px rgba(255,255,255,0.12),0px 8px 10px 1px rgba(255,255,255,0.08),0px 3px 14px 2px rgba(255,255,255,0.04)',
    '0px 5px 6px -3px rgba(255,255,255,0.12),0px 9px 12px 1px rgba(255,255,255,0.08),0px 3px 16px 2px rgba(255,255,255,0.04)',
    '0px 6px 6px -3px rgba(255,255,255,0.12),0px 10px 14px 1px rgba(255,255,255,0.08),0px 4px 18px 3px rgba(255,255,255,0.04)',
    '0px 6px 7px -4px rgba(255,255,255,0.12),0px 11px 15px 1px rgba(255,255,255,0.08),0px 4px 20px 3px rgba(255,255,255,0.04)',
    '0px 7px 8px -4px rgba(255,255,255,0.12),0px 12px 17px 2px rgba(255,255,255,0.08),0px 5px 22px 4px rgba(255,255,255,0.04)',
    '0px 7px 8px -4px rgba(255,255,255,0.12),0px 13px 19px 2px rgba(255,255,255,0.08),0px 5px 24px 4px rgba(255,255,255,0.04)',
    '0px 7px 9px -4px rgba(255,255,255,0.12),0px 14px 21px 2px rgba(255,255,255,0.08),0px 5px 26px 4px rgba(255,255,255,0.04)',
    '0px 8px 9px -5px rgba(255,255,255,0.12),0px 15px 22px 2px rgba(255,255,255,0.08),0px 6px 28px 5px rgba(255,255,255,0.04)',
    '0px 8px 10px -5px rgba(255,255,255,0.12),0px 16px 24px 2px rgba(255,255,255,0.08),0px 6px 30px 5px rgba(255,255,255,0.04)',
    '0px 8px 11px -5px rgba(255,255,255,0.12),0px 17px 26px 2px rgba(255,255,255,0.08),0px 6px 32px 5px rgba(255,255,255,0.04)',
    '0px 9px 11px -5px rgba(255,255,255,0.12),0px 18px 28px 2px rgba(255,255,255,0.08),0px 7px 34px 6px rgba(255,255,255,0.04)',
    '0px 9px 12px -6px rgba(255,255,255,0.12),0px 19px 29px 2px rgba(255,255,255,0.08),0px 7px 36px 6px rgba(255,255,255,0.04)',
    '0px 10px 13px -6px rgba(255,255,255,0.12),0px 20px 31px 3px rgba(255,255,255,0.08),0px 8px 38px 7px rgba(255,255,255,0.04)',
    '0px 10px 13px -6px rgba(255,255,255,0.12),0px 21px 33px 3px rgba(255,255,255,0.08),0px 8px 40px 7px rgba(255,255,255,0.04)',
    '0px 10px 14px -6px rgba(255,255,255,0.12),0px 22px 35px 3px rgba(255,255,255,0.08),0px 8px 42px 7px rgba(255,255,255,0.04)',
    '0px 11px 14px -7px rgba(255,255,255,0.12),0px 23px 36px 3px rgba(255,255,255,0.08),0px 9px 44px 8px rgba(255,255,255,0.04)',
    '0px 11px 15px -7px rgba(255,255,255,0.12),0px 24px 38px 3px rgba(255,255,255,0.08),0px 9px 46px 8px rgba(255,255,255,0.04)'
  ]
};

/**
 * Default z-index values
 */
const DEFAULT_Z_INDEX = {
  mobileStepper: 1000,
  fab: 1050,
  speedDial: 1050,
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500,
  dialog: 1600,
  popup: 1700
};

/**
 * Class representing a theme
 */
export class Theme {
  /**
   * Create a theme
   * @param {Object} options - Theme options
   */
  constructor(options = {}) {
    this.id = options.id || generateId();
    this.name = options.name || 'Custom Theme';
    this.mode = options.mode || ThemeMode.SYSTEM;
    this.colorScheme = options.colorScheme || ColorScheme.DEFAULT;
    this.fontSize = options.fontSize || FontSize.MEDIUM;
    
    // Initialize colors
    this.colors = this._initializeColors(options.colors);
    
    // Initialize fonts
    this.fonts = this._initializeFonts(options.fonts);
    
    // Initialize spacing
    this.spacing = this._initializeSpacing(options.spacing);
    
    // Initialize border radius
    this.borderRadius = this._initializeBorderRadius(options.borderRadius);
    
    // Initialize transitions
    this.transitions = this._initializeTransitions(options.transitions);
    
    // Initialize shadows
    this.shadows = this._initializeShadows(options.shadows);
    
    // Initialize z-index
    this.zIndex = this._initializeZIndex(options.zIndex);
    
    // Custom properties
    this.customProperties = options.customProperties || {};
  }

  /**
   * Initialize colors based on mode and color scheme
   * @param {Object} customColors - Custom color overrides
   * @returns {Object} The initialized colors
   * @private
   */
  _initializeColors(customColors = {}) {
    // Start with default colors
    const baseColors = JSON.parse(JSON.stringify(DEFAULT_COLORS));
    
    // Apply color scheme if not custom
    if (this.colorScheme !== ColorScheme.CUSTOM && COLOR_SCHEMES[this.colorScheme]) {
      const schemeColors = COLOR_SCHEMES[this.colorScheme];
      
      // Apply scheme colors to both light and dark modes
      Object.keys(schemeColors).forEach(mode => {
        Object.assign(baseColors[mode], schemeColors[mode]);
      });
    }
    
    // Apply custom colors if provided
    if (customColors) {
      // Apply to both light and dark if specific mode not provided
      if (customColors.light) {
        this._deepMerge(baseColors.light, customColors.light);
      }
      
      if (customColors.dark) {
        this._deepMerge(baseColors.dark, customColors.dark);
      }
      
      // Apply non-mode-specific colors to both modes
      const { light, dark, ...commonColors } = customColors;
      if (Object.keys(commonColors).length > 0) {
        this._deepMerge(baseColors.light, commonColors);
        this._deepMerge(baseColors.dark, commonColors);
      }
    }
    
    return baseColors;
  }

  /**
   * Initialize fonts
   * @param {Object} customFonts - Custom font overrides
   * @returns {Object} The initialized fonts
   * @private
   */
  _initializeFonts(customFonts = {}) {
    // Start with default fonts
    const baseFonts = JSON.parse(JSON.stringify(DEFAULT_FONTS));
    
    // Apply font size scaling
    if (this.fontSize !== FontSize.CUSTOM && baseFonts.sizes[this.fontSize]) {
      const scale = baseFonts.sizes[this.fontSize].scale;
      baseFonts.base.fontSize = `${parseFloat(baseFonts.base.fontSize) * scale}px`;
    }
    
    // Apply custom fonts if provided
    if (customFonts) {
      this._deepMerge(baseFonts, customFonts);
    }
    
    return baseFonts;
  }

  /**
   * Initialize spacing
   * @param {Object} customSpacing - Custom spacing overrides
   * @returns {Object} The initialized spacing
   * @private
   */
  _initializeSpacing(customSpacing = {}) {
    // Start with default spacing
    const baseSpacing = JSON.parse(JSON.stringify(DEFAULT_SPACING));
    
    // Apply custom spacing if provided
    if (customSpacing) {
      Object.assign(baseSpacing, customSpacing);
    }
    
    return baseSpacing;
  }

  /**
   * Initialize border radius
   * @param {Object} customBorderRadius - Custom border radius overrides
   * @returns {Object} The initialized border radius
   * @private
   */
  _initializeBorderRadius(customBorderRadius = {}) {
    // Start with default border radius
    const baseBorderRadius = JSON.parse(JSON.stringify(DEFAULT_BORDER_RADIUS));
    
    // Apply custom border radius if provided
    if (customBorderRadius) {
      Object.assign(baseBorderRadius, customBorderRadius);
    }
    
    return baseBorderRadius;
  }

  /**
   * Initialize transitions
   * @param {Object} customTransitions - Custom transition overrides
   * @returns {Object} The initialized transitions
   * @private
   */
  _initializeTransitions(customTransitions = {}) {
    // Start with default transitions
    const baseTransitions = JSON.parse(JSON.stringify(DEFAULT_TRANSITIONS));
    
    // Apply custom transitions if provided
    if (customTransitions) {
      this._deepMerge(baseTransitions, customTransitions);
    }
    
    return baseTransitions;
  }

  /**
   * Initialize shadows
   * @param {Object} customShadows - Custom shadow overrides
   * @returns {Object} The initialized shadows
   * @private
   */
  _initializeShadows(customShadows = {}) {
    // Start with default shadows
    const baseShadows = JSON.parse(JSON.stringify(DEFAULT_SHADOWS));
    
    // Apply custom shadows if provided
    if (customShadows) {
      if (customShadows.light) {
        Object.assign(baseShadows.light, customShadows.light);
      }
      
      if (customShadows.dark) {
        Object.assign(baseShadows.dark, customShadows.dark);
      }
    }
    
    return baseShadows;
  }

  /**
   * Initialize z-index
   * @param {Object} customZIndex - Custom z-index overrides
   * @returns {Object} The initialized z-index
   * @private
   */
  _initializeZIndex(customZIndex = {}) {
    // Start with default z-index
    const baseZIndex = JSON.parse(JSON.stringify(DEFAULT_Z_INDEX));
    
    // Apply custom z-index if provided
    if (customZIndex) {
      Object.assign(baseZIndex, customZIndex);
    }
    
    return baseZIndex;
  }

  /**
   * Deep merge two objects
   * @param {Object} target - The target object
   * @param {Object} source - The source object
   * @returns {Object} The merged object
   * @private
   */
  _deepMerge(target, source) {
    for (const key in source) {
      if (source[key] instanceof Object && key in target && target[key] instanceof Object) {
        this._deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    
    return target;
  }

  /**
   * Get the current mode based on system preference
   * @returns {string} The current mode
   */
  getCurrentMode() {
    if (this.mode === ThemeMode.SYSTEM) {
      // Check system preference
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? ThemeMode.DARK
        : ThemeMode.LIGHT;
    }
    
    return this.mode;
  }

  /**
   * Get the current colors based on mode
   * @returns {Object} The current colors
   */
  getCurrentColors() {
    const mode = this.getCurrentMode();
    return this.colors[mode === ThemeMode.DARK ? 'dark' : 'light'];
  }

  /**
   * Get the current shadows based on mode
   * @returns {Array} The current shadows
   */
  getCurrentShadows() {
    const mode = this.getCurrentMode();
    return this.shadows[mode === ThemeMode.DARK ? 'dark' : 'light'];
  }

    /**
   * Generate CSS variables for the theme
   * @returns {Object} Object with CSS variables string and variable map
   */
  generateCssVariables() {
    const mode = this.getCurrentMode();
    const colors = this.getCurrentColors();
    const shadows = this.getCurrentShadows();
    
    const variables = {
      // Colors
      '--color-primary': colors.primary,
      '--color-secondary': colors.secondary,
      '--color-background': colors.background,
      '--color-surface': colors.surface,
      '--color-error': colors.error,
      '--color-warning': colors.warning,
      '--color-info': colors.info,
      '--color-success': colors.success,
      '--color-text-primary': colors.text.primary,
      '--color-text-secondary': colors.text.secondary,
      '--color-text-disabled': colors.text.disabled,
      '--color-text-hint': colors.text.hint,
      '--color-divider': colors.divider,
      
      // Fonts
      '--font-family-base': this.fonts.base.fontFamily,
      '--font-size-base': this.fonts.base.fontSize,
      '--line-height-base': this.fonts.base.lineHeight,
      '--font-family-headings': this.fonts.headings.fontFamily,
      '--font-weight-headings': this.fonts.headings.fontWeight,
      '--line-height-headings': this.fonts.headings.lineHeight,
      '--font-family-monospace': this.fonts.monospace.fontFamily,
      '--font-size-monospace': this.fonts.monospace.fontSize,
      
      // Spacing
      '--spacing-unit': `${this.spacing.unit}px`,
      '--spacing-xs': `${this.spacing.xs}px`,
      '--spacing-sm': `${this.spacing.sm}px`,
      '--spacing-md': `${this.spacing.md}px`,
      '--spacing-lg': `${this.spacing.lg}px`,
      '--spacing-xl': `${this.spacing.xl}px`,
      '--spacing-xxl': `${this.spacing.xxl}px`,
      
      // Border radius
      '--border-radius-xs': `${this.borderRadius.xs}px`,
      '--border-radius-sm': `${this.borderRadius.sm}px`,
      '--border-radius-md': `${this.borderRadius.md}px`,
      '--border-radius-lg': `${this.borderRadius.lg}px`,
      '--border-radius-xl': `${this.borderRadius.xl}px`,
      '--border-radius-round': this.borderRadius.round,
      
      // Transitions
      '--transition-duration-shortest': `${this.transitions.duration.shortest}ms`,
      '--transition-duration-shorter': `${this.transitions.duration.shorter}ms`,
      '--transition-duration-short': `${this.transitions.duration.short}ms`,
      '--transition-duration-standard': `${this.transitions.duration.standard}ms`,
      '--transition-duration-complex': `${this.transitions.duration.complex}ms`,
      '--transition-easing-ease-in-out': this.transitions.easing.easeInOut,
      '--transition-easing-ease-out': this.transitions.easing.easeOut,
      '--transition-easing-ease-in': this.transitions.easing.easeIn,
      '--transition-easing-sharp': this.transitions.easing.sharp,
      
      // Mode
      '--theme-mode': mode
    };
    
    // Add elevation variables
    Object.entries(colors.elevation).forEach(([level, value]) => {
      variables[`--elevation-${level}`] = value;
    });
    
    // Add shadow variables
    shadows.forEach((shadow, index) => {
      variables[`--shadow-${index}`] = shadow;
    });
    
    // Add z-index variables
    Object.entries(this.zIndex).forEach(([key, value]) => {
      variables[`--z-index-${key}`] = value;
    });
    
    // Add custom properties
    Object.entries(this.customProperties).forEach(([key, value]) => {
      variables[`--${key}`] = value;
    });
    
    // Generate CSS string
    const cssString = Object.entries(variables)
      .map(([key, value]) => `${key}: ${value};`)
      .join('\n');
    
    return { variables, cssString };
  }

  /**
   * Apply the theme to the document
   * @param {string} selector - CSS selector for the element to apply the theme to
   * @returns {Object} The applied CSS variables
   */
  applyTheme(selector = ':root') {
    const { variables, cssString } = this.generateCssVariables();
    
    // Find or create style element
    let styleEl = document.getElementById('jct-theme-style');
    
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'jct-theme-style';
      document.head.appendChild(styleEl);
    }
    
    // Set the CSS
    styleEl.textContent = `${selector} {\n${cssString}\n}`;
    
    // Add theme class to body
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${this.getCurrentMode()}`);
    
    return variables;
  }

  /**
   * Create a CSS style object for a component
   * @param {string} component - The component name
   * @param {Object} styles - The styles to apply
   * @returns {Object} The style object with CSS variables
   */
  createStyles(component, styles) {
    const mode = this.getCurrentMode();
    const colors = this.getCurrentColors();
    const shadows = this.getCurrentShadows();
    
    // Process styles to replace theme tokens with CSS variables
    const processedStyles = {};
    
    for (const [selector, rules] of Object.entries(styles)) {
      processedStyles[selector] = {};
      
      for (const [property, value] of Object.entries(rules)) {
        // Replace color tokens
        if (typeof value === 'string' && value.startsWith('theme.')) {
          const parts = value.split('.');
          
          if (parts[1] === 'colors') {
            // Handle nested color properties
            if (parts.length === 3) {
              processedStyles[selector][property] = `var(--color-${parts[2]})`;
            } else if (parts.length === 4) {
              processedStyles[selector][property] = `var(--color-${parts[2]}-${parts[3]})`;
            }
          } else if (parts[1] === 'spacing') {
            processedStyles[selector][property] = `var(--spacing-${parts[2]})`;
          } else if (parts[1] === 'borderRadius') {
            processedStyles[selector][property] = `var(--border-radius-${parts[2]})`;
          } else if (parts[1] === 'shadows') {
            const shadowIndex = parseInt(parts[2], 10);
            processedStyles[selector][property] = `var(--shadow-${shadowIndex})`;
          } else if (parts[1] === 'zIndex') {
            processedStyles[selector][property] = `var(--z-index-${parts[2]})`;
          } else {
            // Pass through unknown values
            processedStyles[selector][property] = value;
          }
        } else {
          // Pass through regular values
          processedStyles[selector][property] = value;
        }
      }
    }
    
    return processedStyles;
  }

  /**
   * Convert the theme to a plain object
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      mode: this.mode,
      colorScheme: this.colorScheme,
      fontSize: this.fontSize,
      colors: this.colors,
      fonts: this.fonts,
      spacing: this.spacing,
      borderRadius: this.borderRadius,
      transitions: this.transitions,
      shadows: this.shadows,
      zIndex: this.zIndex,
      customProperties: this.customProperties
    };
  }

  /**
   * Create a theme from JSON
   * @param {Object} json - The JSON data
   * @returns {Theme} A new theme instance
   */
  static fromJSON(json) {
    return new Theme(json);
  }
}

/**
 * Class for managing themes
 */
export class ThemeManager {
  /**
   * Create a theme manager
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      defaultTheme: 'default',
      storageKey: 'jct-theme',
      autoApply: true,
      ...options
    };
    
    this.themes = new Map();
    this.activeThemeId = null;
    this.listeners = [];
    
    // Initialize with built-in themes
    this._initializeBuiltInThemes();
    
    // Load saved theme if available
    this._loadSavedTheme();
  }

  /**
   * Initialize built-in themes
   * @private
   */
  _initializeBuiltInThemes() {
    // Default light theme
    this.addTheme(new Theme({
      id: 'default',
      name: 'Default',
      mode: ThemeMode.LIGHT,
      colorScheme: ColorScheme.DEFAULT
    }));
    
    // Default dark theme
    this.addTheme(new Theme({
      id: 'default-dark',
      name: 'Default Dark',
      mode: ThemeMode.DARK,
      colorScheme: ColorScheme.DEFAULT
    }));
    
    // System theme
    this.addTheme(new Theme({
      id: 'system',
      name: 'System',
      mode: ThemeMode.SYSTEM,
      colorScheme: ColorScheme.DEFAULT
    }));
    
    // Fantasy theme
    this.addTheme(new Theme({
      id: 'fantasy',
      name: 'Fantasy',
      mode: ThemeMode.LIGHT,
      colorScheme: ColorScheme.FANTASY
    }));
    
    // Fantasy dark theme
    this.addTheme(new Theme({
      id: 'fantasy-dark',
      name: 'Fantasy Dark',
      mode: ThemeMode.DARK,
      colorScheme: ColorScheme.FANTASY
    }));
    
    // Horror theme
    this.addTheme(new Theme({
      id: 'horror',
      name: 'Horror',
      mode: ThemeMode.DARK,
      colorScheme: ColorScheme.HORROR
    }));
    
    // Sci-fi theme
    this.addTheme(new Theme({
      id: 'scifi',
      name: 'Sci-Fi',
      mode: ThemeMode.DARK,
      colorScheme: ColorScheme.SCIFI
    }));
  }

  /**
   * Load saved theme from storage
   * @private
   */
  _loadSavedTheme() {
    try {
      const savedThemeId = localStorage.getItem(this.options.storageKey);
      
      if (savedThemeId && this.themes.has(savedThemeId)) {
        this.activeThemeId = savedThemeId;
      } else {
        this.activeThemeId = this.options.defaultTheme;
      }
      
      // Apply theme if auto-apply is enabled
      if (this.options.autoApply) {
        this.applyTheme(this.activeThemeId);
      }
    } catch (error) {
      console.error('Error loading saved theme:', error);
      this.activeThemeId = this.options.defaultTheme;
    }
  }

  /**
   * Save theme ID to storage
   * @param {string} themeId - The theme ID to save
   * @private
   */
  _saveTheme(themeId) {
    try {
      localStorage.setItem(this.options.storageKey, themeId);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  }

  /**
   * Add a theme
   * @param {Theme|Object} theme - The theme to add
   * @returns {Theme} The added theme
   */
  addTheme(theme) {
    // Convert to Theme instance if needed
    const themeInstance = theme instanceof Theme ? theme : new Theme(theme);
    
    // Add to themes map
    this.themes.set(themeInstance.id, themeInstance);
    
    // Notify listeners
    this._notifyListeners('themeAdded', { theme: themeInstance });
    
    return themeInstance;
  }

  /**
   * Get a theme by ID
   * @param {string} id - The theme ID
   * @returns {Theme|null} The theme or null if not found
   */
  getTheme(id) {
    return this.themes.get(id) || null;
  }

  /**
   * Get the active theme
   * @returns {Theme|null} The active theme or null if none
   */
  getActiveTheme() {
    return this.activeThemeId ? this.getTheme(this.activeThemeId) : null;
  }

  /**
   * Apply a theme
   * @param {string} id - The ID of the theme to apply
   * @returns {boolean} True if the theme was applied
   */
  applyTheme(id) {
    const theme = this.getTheme(id);
    
    if (!theme) {
      return false;
    }
    
    // Apply the theme
    const variables = theme.applyTheme();
    
    // Update active theme
    this.activeThemeId = id;
    
    // Save to storage
    this._saveTheme(id);
    
    // Notify listeners
    this._notifyListeners('themeChanged', { theme, variables });
    
    return true;
  }

  /**
   * Remove a theme
   * @param {string} id - The ID of the theme to remove
   * @returns {boolean} True if the theme was removed
   */
  removeTheme(id) {
    // Don't allow removing the active theme
    if (id === this.activeThemeId) {
      return false;
    }
    
    const theme = this.getTheme(id);
    
    if (!theme) {
      return false;
    }
    
    // Remove from themes map
    this.themes.delete(id);
    
    // Notify listeners
    this._notifyListeners('themeRemoved', { theme });
    
    return true;
  }

  /**
   * Update a theme
   * @param {string} id - The ID of the theme to update
   * @param {Object} updates - The updates to apply
   * @returns {Theme|null} The updated theme or null if not found
   */
  updateTheme(id, updates) {
    const theme = this.getTheme(id);
    
    if (!theme) {
      return null;
    }
    
    // Create a new theme with the updates
    const updatedTheme = new Theme({
      ...theme.toJSON(),
      ...updates
    });
    
    // Replace the theme
    this.themes.set(id, updatedTheme);
    
    // Re-apply if this is the active theme
    if (id === this.activeThemeId && this.options.autoApply) {
      updatedTheme.applyTheme();
    }
    
    // Notify listeners
    this._notifyListeners('themeUpdated', { theme: updatedTheme });
    
    return updatedTheme;
  }

  /**
   * Get all themes
   * @returns {Array} Array of themes
   */
  getAllThemes() {
    return Array.from(this.themes.values());
  }

  /**
   * Create a new theme based on an existing theme
   * @param {string} sourceId - The ID of the source theme
   * @param {Object} overrides - Properties to override in the new theme
   * @returns {Theme|null} The new theme or null if source not found
   */
  createThemeFrom(sourceId, overrides = {}) {
    const sourceTheme = this.getTheme(sourceId);
    
    if (!sourceTheme) {
      return null;
    }
    
    // Create a new theme based on the source
    const newTheme = new Theme({
      ...sourceTheme.toJSON(),
      id: generateId(),
      name: overrides.name || `${sourceTheme.name} (Copy)`,
      ...overrides
    });
    
    // Add the new theme
    this.addTheme(newTheme);
    
    return newTheme;
  }

  /**
   * Import themes from JSON
   * @param {string} json - JSON string of themes
   * @returns {Object} Import results
   */
  importFromJSON(json) {
    try {
      const data = JSON.parse(json);
      
      if (!data.themes || !Array.isArray(data.themes)) {
        throw new Error('Invalid theme data: themes array missing');
      }
      
      const results = {
        imported: 0,
        failed: 0,
        themes: []
      };
      
      // Import themes
      data.themes.forEach(themeData => {
        try {
          const theme = new Theme(themeData);
          this.addTheme(theme);
          results.imported++;
          results.themes.push(theme);
        } catch (error) {
          console.error(`Error importing theme ${themeData.name || 'unknown'}:`, error);
          results.failed++;
        }
      });
      
      // Notify listeners
      this._notifyListeners('themesImported', results);
      
      return results;
    } catch (error) {
      console.error('Error importing themes:', error);
      return {
        imported: 0,
        failed: 0,
        error: error.message
      };
    }
  }

  /**
   * Export themes to JSON
   * @param {Array} themeIds - IDs of themes to export (all if not specified)
   * @returns {string} JSON string of themes
   */
  exportToJSON(themeIds = null) {
    let themes;
    
    if (themeIds) {
      themes = themeIds.map(id => this.getTheme(id)).filter(Boolean);
    } else {
      themes = this.getAllThemes();
    }
    
    return JSON.stringify({
      themes,
      version: '2.3.1',
      exportDate: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Add a listener for theme manager events
   * @param {Function} listener - The listener function
   * @returns {Function} Function to remove the listener
   */
  addListener(listener) {
    if (typeof listener !== 'function') {
      console.error('Listener must be a function');
      return () => {};
    }
    
    this.listeners.push(listener);
    
    // Return a function to remove this listener
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners of an event
   * @param {string} event - The event name
   * @param {Object} data - The event data
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
 * Class for creating UI component styles based on the current theme
 */
export class StyleGenerator {
  /**
   * Create a style generator
   * @param {Theme|ThemeManager} theme - The theme or theme manager to use
   */
  constructor(theme) {
    if (theme instanceof ThemeManager) {
      this.themeManager = theme;
      this.theme = theme.getActiveTheme();
      
      // Listen for theme changes
      this.removeListener = theme.addListener((event, data) => {
        if (event === 'themeChanged') {
          this.theme = data.theme;
        }
      });
    } else {
      this.theme = theme instanceof Theme ? theme : new Theme(theme);
      this.themeManager = null;
      this.removeListener = null;
    }
    
    this.styleCache = new Map();
  }

  /**
   * Get the current theme
   * @returns {Theme} The current theme
   */
  getTheme() {
    if (this.themeManager) {
      return this.themeManager.getActiveTheme();
    }
    
    return this.theme;
  }

  /**
   * Create styles for a component
   * @param {string} componentName - The component name
   * @param {Object|Function} styleDefinition - The style definition or function
   * @returns {Object} The generated styles
   */
  createStyles(componentName, styleDefinition) {
    const theme = this.getTheme();
    
    // Check cache
    const cacheKey = `${componentName}-${theme.id}`;
    
    if (this.styleCache.has(cacheKey)) {
      return this.styleCache.get(cacheKey);
    }
    
    // Generate styles
    let styles;
    
    if (typeof styleDefinition === 'function') {
      styles = styleDefinition(theme);
    } else {
      styles = theme.createStyles(componentName, styleDefinition);
    }
    
    // Cache styles
    this.styleCache.set(cacheKey, styles);
    
    return styles;
  }

  /**
   * Clear the style cache
   * @param {string} componentName - The component name (all if not specified)
   */
  clearCache(componentName = null) {
    if (componentName) {
      // Clear cache for specific component
      for (const key of this.styleCache.keys()) {
        if (key.startsWith(`${componentName}-`)) {
          this.styleCache.delete(key);
        }
      }
    } else {
      // Clear all cache
      this.styleCache.clear();
    }
  }

  /**
   * Clean up resources
   */
  dispose() {
    if (this.removeListener) {
      this.removeListener();
      this.removeListener = null;
    }
    
    this.styleCache.clear();
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
 * Create a theme
 * @param {Object} options - Theme options
 * @returns {Theme} A new theme instance
 */
export function createTheme(options = {}) {
  return new Theme(options);
}

/**
 * Create a theme manager
 * @param {Object} options - Configuration options
 * @returns {ThemeManager} A new theme manager instance
 */
export function createThemeManager(options = {}) {
  return new ThemeManager(options);
}

/**
 * Create a style generator
 * @param {Theme|ThemeManager} theme - The theme or theme manager to use
 * @returns {StyleGenerator} A new style generator instance
 */
export function createStyleGenerator(theme) {
  return new StyleGenerator(theme);
}

/**
 * Get system color scheme preference
 * @returns {string} The system color scheme preference
 */
export function getSystemColorScheme() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? ThemeMode.DARK
    : ThemeMode.LIGHT;
}

/**
 * Listen for system color scheme changes
 * @param {Function} callback - The callback function
 * @returns {Function} Function to remove the listener
 */
export function listenForColorSchemeChanges(callback) {
  if (!window.matchMedia) {
    return () => {};
  }
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const listener = (e) => {
    callback(e.matches ? ThemeMode.DARK : ThemeMode.LIGHT);
  };
  
  // Add listener
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', listener);
  } else if (mediaQuery.addListener) {
    // Older browsers
    mediaQuery.addListener(listener);
  }
  
  // Return function to remove listener
  return () => {
    if (mediaQuery.removeEventListener) {
      mediaQuery.removeEventListener('change', listener);
    } else if (mediaQuery.removeListener) {
      // Older browsers
      mediaQuery.removeListener(listener);
    }
  };
}

// Export the main theme functions and classes
export default {
  createTheme,
  createThemeManager,
  createStyleGenerator,
  getSystemColorScheme,
  listenForColorSchemeChanges,
  ThemeMode,
  ColorScheme,
  FontSize
};
