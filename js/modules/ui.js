/**
 * Jesster's Combat Tracker
 * UI Module
 * Version 2.3.1
 * 
 * This module handles UI components, rendering, and user interaction.
 */

/**
 * UI component types
 */
export const ComponentType = {
  CONTAINER: 'container',
  PANEL: 'panel',
  CARD: 'card',
  BUTTON: 'button',
  ICON_BUTTON: 'iconButton',
  INPUT: 'input',
  SELECT: 'select',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
  TOGGLE: 'toggle',
  SLIDER: 'slider',
  TABS: 'tabs',
  TABLE: 'table',
  LIST: 'list',
  MODAL: 'modal',
  DIALOG: 'dialog',
  TOOLTIP: 'tooltip',
  DROPDOWN: 'dropdown',
  MENU: 'menu',
  ALERT: 'alert',
  BADGE: 'badge',
  PROGRESS: 'progress',
  AVATAR: 'avatar',
  CHIP: 'chip',
  DIVIDER: 'divider',
  ICON: 'icon',
  TEXT: 'text',
  HEADING: 'heading',
  LINK: 'link',
  IMAGE: 'image',
  GRID: 'grid',
  FORM: 'form',
  CUSTOM: 'custom'
};

/**
 * UI event types
 */
export const EventType = {
  CLICK: 'click',
  DOUBLE_CLICK: 'dblclick',
  MOUSE_DOWN: 'mousedown',
  MOUSE_UP: 'mouseup',
  MOUSE_MOVE: 'mousemove',
  MOUSE_ENTER: 'mouseenter',
  MOUSE_LEAVE: 'mouseleave',
  KEY_DOWN: 'keydown',
  KEY_UP: 'keyup',
  KEY_PRESS: 'keypress',
  FOCUS: 'focus',
  BLUR: 'blur',
  CHANGE: 'change',
  INPUT: 'input',
  SUBMIT: 'submit',
  DRAG_START: 'dragstart',
  DRAG: 'drag',
  DRAG_END: 'dragend',
  DROP: 'drop',
  RESIZE: 'resize',
  SCROLL: 'scroll',
  LOAD: 'load',
  ERROR: 'error',
  CUSTOM: 'custom'
};

/**
 * UI component sizes
 */
export const ComponentSize = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large'
};

/**
 * UI component variants
 */
export const ComponentVariant = {
  DEFAULT: 'default',
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  INFO: 'info',
  OUTLINED: 'outlined',
  CONTAINED: 'contained',
  TEXT: 'text',
  CUSTOM: 'custom'
};

/**
 * Base class for UI components
 */
export class Component {
  /**
   * Create a component
   * @param {Object} options - Component options
   */
  constructor(options = {}) {
    this.id = options.id || generateId();
    this.type = options.type || ComponentType.CUSTOM;
    this.element = null;
    this.parent = null;
    this.children = [];
    this.eventListeners = new Map();
    this.state = { ...options.state };
    this.props = { ...options.props };
    this.styles = options.styles || {};
    this.className = options.className || '';
    this.visible = options.visible !== undefined ? options.visible : true;
    this.enabled = options.enabled !== undefined ? options.enabled : true;
    this.rendered = false;
    this.destroyed = false;
  }

  /**
   * Render the component
   * @param {HTMLElement} container - The container element
   * @returns {HTMLElement} The rendered element
   */
  render(container) {
    if (this.destroyed) {
      throw new Error(`Cannot render destroyed component: ${this.id}`);
    }
    
    // Create element if it doesn't exist
    if (!this.element) {
      this.element = this._createElement();
      this._setupEventListeners();
    }
    
    // Apply common properties
    this._applyCommonProps();
    
    // Append to container if provided
    if (container) {
      container.appendChild(this.element);
      this.parent = container;
    }
    
    // Render children
    this._renderChildren();
    
    this.rendered = true;
    
    return this.element;
  }

  /**
   * Create the component's DOM element
   * @returns {HTMLElement} The created element
   * @protected
   */
  _createElement() {
    return document.createElement('div');
  }

  /**
   * Apply common properties to the element
   * @protected
   */
  _applyCommonProps() {
    if (!this.element) return;
    
    // Set ID
    this.element.id = this.id;
    
    // Set class name
    if (this.className) {
      this.element.className = this.className;
    }
    
    // Add component type class
    this.element.classList.add(`jct-${this.type}`);
    
    // Set visibility
    this.element.style.display = this.visible ? '' : 'none';
    
    // Set enabled state
    if (!this.enabled) {
      this.element.setAttribute('disabled', 'disabled');
      this.element.classList.add('jct-disabled');
    } else {
      this.element.removeAttribute('disabled');
      this.element.classList.remove('jct-disabled');
    }
    
    // Apply styles
    Object.entries(this.styles).forEach(([property, value]) => {
      this.element.style[property] = value;
    });
  }

  /**
   * Set up event listeners
   * @protected
   */
  _setupEventListeners() {
    if (!this.element) return;
    
    // Add event listeners from the map
    for (const [eventType, listeners] of this.eventListeners.entries()) {
      for (const listener of listeners) {
        this.element.addEventListener(eventType, listener);
      }
    }
  }

  /**
   * Render children
   * @protected
   */
  _renderChildren() {
    if (!this.element) return;
    
    for (const child of this.children) {
      child.render(this.element);
    }
  }

  /**
   * Add a child component
   * @param {Component} child - The child component
   * @returns {Component} The added child
   */
  addChild(child) {
    if (this.destroyed) {
      throw new Error(`Cannot add child to destroyed component: ${this.id}`);
    }
    
    this.children.push(child);
    
    // Render the child if this component is already rendered
    if (this.rendered && this.element) {
      child.render(this.element);
    }
    
    return child;
  }

  /**
   * Remove a child component
   * @param {Component|string} child - The child component or its ID
   * @returns {boolean} True if the child was removed
   */
  removeChild(child) {
    const childId = typeof child === 'string' ? child : child.id;
    const index = this.children.findIndex(c => c.id === childId);
    
    if (index === -1) {
      return false;
    }
    
    const removedChild = this.children[index];
    
    // Remove from DOM if rendered
    if (removedChild.element && removedChild.element.parentNode) {
      removedChild.element.parentNode.removeChild(removedChild.element);
    }
    
    // Remove from children array
    this.children.splice(index, 1);
    
    return true;
  }

  /**
   * Find a child component by ID
   * @param {string} id - The child ID
   * @returns {Component|null} The child component or null if not found
   */
  findChild(id) {
    // Direct children
    for (const child of this.children) {
      if (child.id === id) {
        return child;
      }
    }
    
    // Recursive search in children
    for (const child of this.children) {
      const found = child.findChild(id);
      if (found) {
        return found;
      }
    }
    
    return null;
  }

  /**
   * Add an event listener
   * @param {string} eventType - The event type
   * @param {Function} listener - The event listener
   * @returns {Function} Function to remove the listener
   */
  addEventListener(eventType, listener) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    
    this.eventListeners.get(eventType).push(listener);
    
    // Add to element if already created
    if (this.element) {
      this.element.addEventListener(eventType, listener);
    }
    
    // Return function to remove the listener
    return () => {
      this.removeEventListener(eventType, listener);
    };
  }

  /**
   * Remove an event listener
   * @param {string} eventType - The event type
   * @param {Function} listener - The event listener
   * @returns {boolean} True if the listener was removed
   */
  removeEventListener(eventType, listener) {
    if (!this.eventListeners.has(eventType)) {
      return false;
    }
    
    const listeners = this.eventListeners.get(eventType);
    const index = listeners.indexOf(listener);
    
    if (index === -1) {
      return false;
    }
    
    // Remove from array
    listeners.splice(index, 1);
    
    // Remove from element if created
    if (this.element) {
      this.element.removeEventListener(eventType, listener);
    }
    
    // Clean up empty arrays
    if (listeners.length === 0) {
      this.eventListeners.delete(eventType);
    }
    
    return true;
  }

  /**
   * Update the component state
   * @param {Object} updates - The state updates
   * @param {boolean} render - Whether to re-render the component
   * @returns {Object} The updated state
   */
  setState(updates, render = true) {
    // Update state
    this.state = {
      ...this.state,
      ...updates
    };
    
    // Re-render if requested
    if (render && this.rendered) {
      this.update();
    }
    
    return this.state;
  }

  /**
   * Update the component props
   * @param {Object} updates - The prop updates
   * @param {boolean} render - Whether to re-render the component
   * @returns {Object} The updated props
   */
  setProps(updates, render = true) {
    // Update props
    this.props = {
      ...this.props,
      ...updates
    };
    
    // Re-render if requested
    if (render && this.rendered) {
      this.update();
    }
    
    return this.props;
  }

  /**
   * Update the component
   * @returns {HTMLElement} The updated element
   */
  update() {
    if (!this.rendered || this.destroyed) {
      return this.element;
    }
    
    // Apply common properties
    this._applyCommonProps();
    
    // Update children
    for (const child of this.children) {
      child.update();
    }
    
    return this.element;
  }

  /**
   * Show the component
   */
  show() {
    if (this.visible) return;
    
    this.visible = true;
    
    if (this.element) {
      this.element.style.display = '';
    }
  }

  /**
   * Hide the component
   */
  hide() {
    if (!this.visible) return;
    
    this.visible = false;
    
    if (this.element) {
      this.element.style.display = 'none';
    }
  }

  /**
   * Enable the component
   */
  enable() {
    if (this.enabled) return;
    
    this.enabled = true;
    
    if (this.element) {
      this.element.removeAttribute('disabled');
      this.element.classList.remove('jct-disabled');
    }
  }

  /**
   * Disable the component
   */
  disable() {
    if (!this.enabled) return;
    
    this.enabled = false;
    
    if (this.element) {
      this.element.setAttribute('disabled', 'disabled');
      this.element.classList.add('jct-disabled');
    }
  }

  /**
   * Destroy the component
   */
  destroy() {
    if (this.destroyed) return;
    
    // Destroy children first
    for (const child of [...this.children]) {
      child.destroy();
    }
    
    // Remove from DOM
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    
    // Clear event listeners
    if (this.element) {
      for (const [eventType, listeners] of this.eventListeners.entries()) {
        for (const listener of listeners) {
          this.element.removeEventListener(eventType, listener);
        }
      }
    }
    
    // Clear references
    this.eventListeners.clear();
    this.children = [];
    this.element = null;
    this.parent = null;
    this.rendered = false;
    this.destroyed = true;
  }
}

/**
 * Container component
 */
export class Container extends Component {
  /**
   * Create a container
   * @param {Object} options - Container options
   */
  constructor(options = {}) {
    super({
      ...options,
      type: ComponentType.CONTAINER
    });
    
    this.layout = options.layout || 'vertical';
    this.gap = options.gap !== undefined ? options.gap : 8;
    this.padding = options.padding !== undefined ? options.padding : 16;
    this.align = options.align || 'start';
    this.justify = options.justify || 'start';
    this.wrap = options.wrap !== undefined ? options.wrap : false;
  }

  /**
   * Apply common properties to the element
   * @protected
   */
  _applyCommonProps() {
    super._applyCommonProps();
    
    if (!this.element) return;
    
    // Set container styles
    this.element.style.display = this.visible ? 'flex' : 'none';
    this.element.style.flexDirection = this.layout === 'vertical' ? 'column' : 'row';
    this.element.style.gap = `${this.gap}px`;
    this.element.style.padding = `${this.padding}px`;
    this.element.style.alignItems = this._getAlignValue();
    this.element.style.justifyContent = this._getJustifyValue();
    this.element.style.flexWrap = this.wrap ? 'wrap' : 'nowrap';
  }

  /**
   * Get CSS align-items value
   * @returns {string} The CSS value
   * @private
   */
  _getAlignValue() {
    switch (this.align) {
      case 'start': return 'flex-start';
      case 'end': return 'flex-end';
      case 'center': return 'center';
      case 'stretch': return 'stretch';
      default: return 'flex-start';
    }
  }

  /**
   * Get CSS justify-content value
   * @returns {string} The CSS value
   * @private
   */
  _getJustifyValue() {
    switch (this.justify) {
      case 'start': return 'flex-start';
      case 'end': return 'flex-end';
      case 'center': return 'center';
      case 'between': return 'space-between';
      case 'around': return 'space-around';
      case 'evenly': return 'space-evenly';
      default: return 'flex-start';
    }
  }
}

/**
 * Panel component
 */
export class Panel extends Component {
  /**
   * Create a panel
   * @param {Object} options - Panel options
   */
  constructor(options = {}) {
    super({
      ...options,
      type: ComponentType.PANEL
    });
    
    this.title = options.title || '';
    this.collapsible = options.collapsible !== undefined ? options.collapsible : false;
    this.collapsed = options.collapsed !== undefined ? options.collapsed : false;
    this.headerActions = options.headerActions || [];
    this.footerActions = options.footerActions || [];
    this.padding = options.padding !== undefined ? options.padding : 16;
    this.elevation = options.elevation !== undefined ? options.elevation : 1;
    this.contentElement = null;
    this.headerElement = null;
    this.footerElement = null;
  }

  /**
   * Create the component's DOM element
   * @returns {HTMLElement} The created element
   * @protected
   */
  _createElement() {
    const panel = document.createElement('div');
    
    // Create header if title or collapsible
    if (this.title || this.collapsible || this.headerActions.length > 0) {
      this.headerElement = document.createElement('div');
      this.headerElement.className = 'jct-panel-header';
      
      // Add title
      if (this.title) {
        const titleElement = document.createElement('div');
        titleElement.className = 'jct-panel-title';
        titleElement.textContent = this.title;
        this.headerElement.appendChild(titleElement);
      }
      
      // Add collapse button if collapsible
      if (this.collapsible) {
        const collapseButton = document.createElement('button');
        collapseButton.className = 'jct-panel-collapse-button';
        collapseButton.innerHTML = this.collapsed ? '▶' : '▼';
        collapseButton.addEventListener('click', () => this.toggleCollapse());
        this.headerElement.appendChild(collapseButton);
      }
      
      // Add header actions
      if (this.headerActions.length > 0) {
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'jct-panel-actions';
        
        for (const action of this.headerActions) {
          if (action instanceof Component) {
            action.render(actionsContainer);
          } else if (typeof action === 'object') {
            const button = new Button(action);
            button.render(actionsContainer);
          }
        }
        
        this.headerElement.appendChild(actionsContainer);
      }
      
      panel.appendChild(this.headerElement);
    }
    
    // Create content area
    this.contentElement = document.createElement('div');
    this.contentElement.className = 'jct-panel-content';
    
    if (this.collapsed) {
      this.contentElement.style.display = 'none';
    }
    
    panel.appendChild(this.contentElement);
    
    // Create footer if there are actions
    if (this.footerActions.length > 0) {
      this.footerElement = document.createElement('div');
      this.footerElement.className = 'jct-panel-footer';
      
      for (const action of this.footerActions) {
        if (action instanceof Component) {
          action.render(this.footerElement);
        } else if (typeof action === 'object') {
          const button = new Button(action);
          button.render(this.footerElement);
        }
      }
      
      panel.appendChild(this.footerElement);
    }
    
    return panel;
  }

  /**
   * Apply common properties to the element
   * @protected
   */
  _applyCommonProps() {
    super._applyCommonProps();
    
    if (!this.element) return;
    
    // Set panel styles
    this.element.style.boxShadow = `var(--shadow-${this.elevation})`;
    
    // Set content padding
    if (this.contentElement) {
      this.contentElement.style.padding = `${this.padding}px`;
    }
  }

  /**
   * Render children
   * @protected
   */
  _renderChildren() {
    if (!this.contentElement) return;
    
    for (const child of this.children) {
      child.render(this.contentElement);
    }
  }

  /**
   * Toggle collapse state
   */
  toggleCollapse() {
    if (!this.collapsible) return;
    
    this.collapsed = !this.collapsed;
    
    if (this.contentElement) {
      this.contentElement.style.display = this.collapsed ? 'none' : '';
    }
    
    // Update collapse button
    if (this.headerElement) {
      const collapseButton = this.headerElement.querySelector('.jct-panel-collapse-button');
      if (collapseButton) {
        collapseButton.innerHTML = this.collapsed ? '▶' : '▼';
      }
    }
  }

  /**
   * Collapse the panel
   */
  collapse() {
    if (!this.collapsible || this.collapsed) return;
    this.toggleCollapse();
  }

  /**
   * Expand the panel
   */
  expand() {
    if (!this.collapsible || !this.collapsed) return;
    this.toggleCollapse();
  }
}

/**
 * Card component
 */
export class Card extends Component {
  /**
   * Create a card
   * @param {Object} options - Card options
   */
  constructor(options = {}) {
    super({
      ...options,
      type: ComponentType.CARD
    });
    
    this.title = options.title || '';
    this.subtitle = options.subtitle || '';
    this.image = options.image || null;
    this.imagePosition = options.imagePosition || 'top';
    this.actions = options.actions || [];
    this.padding = options.padding !== undefined ? options.padding : 16;
    this.elevation = options.elevation !== undefined ? options.elevation : 1;
    this.contentElement = null;
    this.headerElement = null;
    this.footerElement = null;
  }

  /**
   * Create the component's DOM element
   * @returns {HTMLElement} The created element
   * @protected
   */
  _createElement() {
    const card = document.createElement('div');
    
    // Add image if provided and position is top
    if (this.image && this.imagePosition === 'top') {
      this._createImageElement(card);
    }
    
    // Create header if title or subtitle
    if (this.title || this.subtitle) {
      this.headerElement = document.createElement('div');
      this.headerElement.className = 'jct-card-header';
      
      // Add title
      if (this.title) {
        const titleElement = document.createElement('div');
        titleElement.className = 'jct-card-title';
        titleElement.textContent = this.title;
        this.headerElement.appendChild(titleElement);
      }
      
      // Add subtitle
      if (this.subtitle) {
        const subtitleElement = document.createElement('div');
        subtitleElement.className = 'jct-card-subtitle';
        subtitleElement.textContent = this.subtitle;
        this.headerElement.appendChild(subtitleElement);
      }
      
      card.appendChild(this.headerElement);
    }
    
    // Add image if provided and position is middle
    if (this.image && this.imagePosition === 'middle') {
      this._createImageElement(card);
    }
    
    // Create content area
    this.contentElement = document.createElement('div');
    this.contentElement.className = 'jct-card-content';
    card.appendChild(this.contentElement);
    
    // Add image if provided and position is bottom
    if (this.image && this.imagePosition === 'bottom') {
      this._createImageElement(card);
    }
    
    // Create footer if there are actions
    if (this.actions.length > 0) {
      this.footerElement = document.createElement('div');
      this.footerElement.className = 'jct-card-footer';
      
      for (const action of this.actions) {
        if (action instanceof Component) {
          action.render(this.footerElement);
        } else if (typeof action === 'object') {
          const button = new Button(action);
          button.render(this.footerElement);
        }
      }
      
      card.appendChild(this.footerElement);
    }
    
    return card;
  }

  /**
   * Create image element
   * @param {HTMLElement} container - The container element
   * @private
   */
  _createImageElement(container) {
    const imageContainer = document.createElement('div');
    imageContainer.className = 'jct-card-image';
    
    if (typeof this.image === 'string') {
      // Image URL
      const img = document.createElement('img');
      img.src = this.image;
      img.alt = this.title || 'Card image';
      imageContainer.appendChild(img);
    } else if (this.image instanceof Component) {
      // Component
      this.image.render(imageContainer);
    }
    
    container.appendChild(imageContainer);
  }

  /**
   * Apply common properties to the element
   * @protected
   */
  _applyCommonProps() {
    super._applyCommonProps();
    
    if (!this.element) return;
    
    // Set card styles
    this.element.style.boxShadow = `var(--shadow-${this.elevation})`;
    
    // Set content padding
    if (this.contentElement) {
      this.contentElement.style.padding = `${this.padding}px`;
    }
  }

  /**
   * Render children
   * @protected
   */
  _renderChildren() {
    if (!this.contentElement) return;
    
    for (const child of this.children) {
      child.render(this.contentElement);
    }
  }
}

/**
 * Button component
 */
export class Button extends Component {
  /**
   * Create a button
   * @param {Object} options - Button options
   */
  constructor(options = {}) {
    super({
      ...options,
      type: ComponentType.BUTTON
    });
    
    this.label = options.label || '';
    this.icon = options.icon || null;
    this.variant = options.variant || ComponentVariant.DEFAULT;
    this.size = options.size || ComponentSize.MEDIUM;
    this.fullWidth = options.fullWidth !== undefined ? options.fullWidth : false;
    this.onClick = options.onClick || null;
  }

  /**
   * Create the component's DOM element
   * @returns {HTMLElement} The created element
   * @protected
   */
  _createElement() {
    const button = document.createElement('button');
    
    // Add icon if provided
    if (this.icon) {
      const iconElement = document.createElement('span');
      iconElement.className = 'jct-button-icon';
      
      if (typeof this.icon === 'string') {
        iconElement.innerHTML = this.icon;
      } else if (this.icon instanceof Component) {
        this.icon.render(iconElement);
      }
      
      button.appendChild(iconElement);
    }
    
    // Add label if provided
    if (this.label) {
      const labelElement = document.createElement('span');
      labelElement.className = 'jct-button-label';
      labelElement.textContent = this.label;
      button.appendChild(labelElement);
    }
    
    // Add click handler
    if (this.onClick) {
      button.addEventListener('click', this.onClick);
    }
    
    return button;
  }

  /**
   * Apply common properties to the element
   * @protected
   */
  _applyCommonProps() {
    super._applyCommonProps();
    
    if (!this.element) return;
    
    // Add variant class
    this.element.classList.add(`jct-button-${this.variant}`);
    
    // Add size class
    this.element.classList.add(`jct-button-${this.size}`);
    
    // Set full width
    if (this.fullWidth) {
      this.element.style.width = '100%';
    }
  }

  /**
   * Set the button label
   * @param {string} label - The new label
   */
  setLabel(label) {
    this.label = label;
    
    if (this.element) {
      const labelElement = this.element.querySelector('.jct-button-label');
      
      if (labelElement) {
        labelElement.textContent = label;
      } else if (label) {
        // Create label element if it doesn't exist
        const newLabelElement = document.createElement('span');
        newLabelElement.className = 'jct-button-label';
        newLabelElement.textContent = label;
        this.element.appendChild(newLabelElement);
      }
    }
  }

  /**
   * Set the button icon
   * @param {string|Component} icon - The new icon
   */
  setIcon(icon) {
    this.icon = icon;
    
    if (this.element) {
      let iconElement = this.element.querySelector('.jct-button-icon');
      
      if (iconElement) {
        // Clear existing icon
        iconElement.innerHTML = '';
      } else {
        // Create icon element if it doesn't exist
        iconElement = document.createElement('span');
        iconElement.className = 'jct-button-icon';
        
        // Insert at the beginning
        if (this.element.firstChild) {
          this.element.insertBefore(iconElement, this.element.firstChild);
        } else {
          this.element.appendChild(iconElement);
        }
      }
      
      // Set new icon
      if (typeof icon === 'string') {
        iconElement.innerHTML = icon;
      } else if (icon instanceof Component) {
        icon.render(iconElement);
      }
    }
  }

  /**
   * Click the button programmatically
   */
  click() {
    if (this.element && this.enabled) {
      this.element.click();
    }
  }
}

/**
 * Icon Button component
 */
export class IconButton extends Button {
  /**
   * Create an icon button
   * @param {Object} options - Button options
   */
  constructor(options = {}) {
    super({
      ...options,
      type: ComponentType.ICON_BUTTON
    });
  }

  /**
   * Apply common properties to the element
   * @protected
   */
  _applyCommonProps() {
    super._applyCommonProps();
    
    if (!this.element) return;
    
    // Add icon button class
    this.element.classList.add('jct-icon-button');
  }
}

/**
 * Input component
 */
export class Input extends Component {
  /**
   * Create an input
   * @param {Object} options - Input options
   */
  constructor(options = {}) {
    super({
      ...options,
      type: ComponentType.INPUT
    });
    
    this.inputType = options.inputType || 'text';
    this.label = options.label || '';
    this.placeholder = options.placeholder || '';
    this.value = options.value || '';
    this.name = options.name || '';
    this.required = options.required !== undefined ? options.required : false;
    this.readOnly = options.readOnly !== undefined ? options.readOnly : false;
    this.autoFocus = options.autoFocus !== undefined ? options.autoFocus : false;
    this.helperText = options.helperText || '';
    this.errorText = options.errorText || '';
    this.hasError = options.hasError !== undefined ? options.hasError : false;
    this.min = options.min !== undefined ? options.min : null;
    this.max = options.max !== undefined ? options.max : null;
    this.step = options.step !== undefined ? options.step : null;
    this.pattern = options.pattern || null;
    this.onChange = options.onChange || null;
    this.onFocus = options.onFocus || null;
    this.onBlur = options.onBlur || null;
    this.onInput = options.onInput || null;
    this.onKeyDown = options.onKeyDown || null;
    this.onKeyUp = options.onKeyUp || null;
    this.inputElement = null;
    this.labelElement = null;
    this.helperElement = null;
  }

  /**
   * Create the component's DOM element
   * @returns {HTMLElement} The created element
   * @protected
   */
  _createElement() {
    const container = document.createElement('div');
    
    // Create label if provided
    if (this.label) {
      this.labelElement = document.createElement('label');
      this.labelElement.className = 'jct-input-label';
      this.labelElement.textContent = this.label;
      
      if (this.required) {
        const requiredMark = document.createElement('span');
        requiredMark.className = 'jct-input-required';
        requiredMark.textContent = '*';
        this.labelElement.appendChild(requiredMark);
      }
      
      container.appendChild(this.labelElement);
    }
    
    // Create input element
    this.inputElement = document.createElement('input');
    this.inputElement.className = 'jct-input-field';
    this.inputElement.type = this.inputType;
    this.inputElement.value = this.value;
    this.inputElement.placeholder = this.placeholder;
    
    if (this.name) {
      this.inputElement.name = this.name;
    }
    
    if (this.required) {
      this.inputElement.required = true;
    }
    
    if (this.readOnly) {
      this.inputElement.readOnly = true;
    }
    
    if (this.autoFocus) {
      this.inputElement.autofocus = true;
    }
    
    if (this.min !== null) {
      this.inputElement.min = this.min;
    }
    
    if (this.max !== null) {
      this.inputElement.max = this.max;
    }
    
    if (this.step !== null) {
      this.inputElement.step = this.step;
    }
    
    if (this.pattern) {
      this.inputElement.pattern = this.pattern;
    }
    
    // Add event listeners
    if (this.onChange) {
      this.inputElement.addEventListener('change', this.onChange);
    }
    
    if (this.onFocus) {
      this.inputElement.addEventListener('focus', this.onFocus);
    }
    
    if (this.onBlur) {
      this.inputElement.addEventListener('blur', this.onBlur);
    }
    
    if (this.onInput) {
      this.inputElement.addEventListener('input', this.onInput);
    }
    
    if (this.onKeyDown) {
      this.inputElement.addEventListener('keydown', this.onKeyDown);
    }
    
    if (this.onKeyUp) {
      this.inputElement.addEventListener('keyup', this.onKeyUp);
    }
    
    container.appendChild(this.inputElement);
    
    // Create helper text or error text
    if (this.helperText || this.errorText) {
      this.helperElement = document.createElement('div');
      this.helperElement.className = 'jct-input-helper';
      
      if (this.hasError) {
        this.helperElement.classList.add('jct-input-error');
        this.helperElement.textContent = this.errorText || this.helperText;
      } else {
        this.helperElement.textContent = this.helperText;
      }
      
      container.appendChild(this.helperElement);
    }
    
    return container;
  }

  /**
   * Apply common properties to the element
   * @protected
   */
  _applyCommonProps() {
    super._applyCommonProps();
    
    if (!this.element || !this.inputElement) return;
    
    // Update input state
    this.inputElement.disabled = !this.enabled;
    
    // Update error state
    if (this.hasError) {
      this.element.classList.add('jct-has-error');
      this.inputElement.classList.add('jct-input-error');
      
      if (this.helperElement) {
        this.helperElement.classList.add('jct-input-error');
        this.helperElement.textContent = this.errorText || this.helperText;
      }
    } else {
      this.element.classList.remove('jct-has-error');
      this.inputElement.classList.remove('jct-input-error');
      
      if (this.helperElement) {
        this.helperElement.classList.remove('jct-input-error');
        this.helperElement.textContent = this.helperText;
      }
    }
  }

  /**
   * Get the input value
   * @returns {string} The input value
   */
  getValue() {
    return this.inputElement ? this.inputElement.value : this.value;
  }

  /**
   * Set the input value
   * @param {string} value - The new value
   */
  setValue(value) {
    this.value = value;
    
    if (this.inputElement) {
      this.inputElement.value = value;
    }
  }

  /**
   * Set error state
   * @param {boolean} hasError - Whether the input has an error
   * @param {string} errorText - The error text
   */
  setError(hasError, errorText = '') {
    this.hasError = hasError;
    
    if (errorText) {
      this.errorText = errorText;
    }
    
    this._applyCommonProps();
  }

  /**
   * Focus the input
   */
  focus() {
    if (this.inputElement && this.enabled) {
      this.inputElement.focus();
    }
  }

  /**
   * Blur the input
   */
  blur() {
    if (this.inputElement) {
      this.inputElement.blur();
    }
  }

  /**
   * Select all text in the input
   */
  selectAll() {
    if (this.inputElement && this.enabled) {
      this.inputElement.select();
    }
  }
}

/**
 * Select component
 */
export class Select extends Component {
  /**
   * Create a select
   * @param {Object} options - Select options
   */
  constructor(options = {}) {
    super({
      ...options,
      type: ComponentType.SELECT
    });
    
    this.label = options.label || '';
    this.options = options.options || [];
    this.value = options.value !== undefined ? options.value : '';
    this.name = options.name || '';
    this.required = options.required !== undefined ? options.required : false;
    this.multiple = options.multiple !== undefined ? options.multiple : false;
    this.helperText = options.helperText || '';
    this.errorText = options.errorText || '';
    this.hasError = options.hasError !== undefined ? options.hasError : false;
    this.onChange = options.onChange || null;
    this.onFocus = options.onFocus || null;
    this.onBlur = options.onBlur || null;
    this.selectElement = null;
    this.labelElement = null;
    this.helperElement = null;
  }

  /**
   * Create the component's DOM element
   * @returns {HTMLElement} The created element
   * @protected
   */
  _createElement() {
    const container = document.createElement('div');
    
    // Create label if provided
    if (this.label) {
      this.labelElement = document.createElement('label');
      this.labelElement.className = 'jct-select-label';
      this.labelElement.textContent = this.label;
      
      if (this.required) {
        const requiredMark = document.createElement('span');
        requiredMark.className = 'jct-select-required';
        requiredMark.textContent = '*';
        this.labelElement.appendChild(requiredMark);
      }
      
      container.appendChild(this.labelElement);
    }
    
    // Create select element
    this.selectElement = document.createElement('select');
    this.selectElement.className = 'jct-select-field';
    
    if (this.name) {
      this.selectElement.name = this.name;
    }
    
    if (this.required) {
      this.selectElement.required = true;
    }
    
    if (this.multiple) {
      this.selectElement.multiple = true;
    }
    
    // Add options
    this._populateOptions();
    
    // Add event listeners
    if (this.onChange) {
      this.selectElement.addEventListener('change', this.onChange);
    }
    
    if (this.onFocus) {
      this.selectElement.addEventListener('focus', this.onFocus);
    }
    
    if (this.onBlur) {
      this.selectElement.addEventListener('blur', this.onBlur);
    }
    
    container.appendChild(this.selectElement);
    
    // Create helper text or error text
    if (this.helperText || this.errorText) {
      this.helperElement = document.createElement('div');
      this.helperElement.className = 'jct-select-helper';
      
      if (this.hasError) {
        this.helperElement.classList.add('jct-select-error');
        this.helperElement.textContent = this.errorText || this.helperText;
      } else {
        this.helperElement.textContent = this.helperText;
      }
      
      container.appendChild(this.helperElement);
    }
    
    return container;
  }

  /**
   * Populate select options
   * @private
   */
  _populateOptions() {
    if (!this.selectElement) return;
    
    // Clear existing options
    this.selectElement.innerHTML = '';
    
    // Add options
    for (const option of this.options) {
      const optionElement = document.createElement('option');
      
      if (typeof option === 'string') {
        optionElement.value = option;
        optionElement.textContent = option;
      } else {
        optionElement.value = option.value;
        optionElement.textContent = option.label || option.value;
        
        if (option.disabled) {
          optionElement.disabled = true;
        }
      }
      
      this.selectElement.appendChild(optionElement);
    }
    
    // Set value
    if (this.multiple && Array.isArray(this.value)) {
      for (const value of this.value) {
        for (const option of this.selectElement.options) {
          if (option.value === value) {
            option.selected = true;
          }
        }
      }
    } else {
      this.selectElement.value = this.value;
    }
  }

  /**
   * Apply common properties to the element
   * @protected
   */
  _applyCommonProps() {
    super._applyCommonProps();
    
    if (!this.element || !this.selectElement) return;
    
    // Update select state
    this.selectElement.disabled = !this.enabled;
    
    // Update error state
    if (this.hasError) {
      this.element.classList.add('jct-has-error');
      this.selectElement.classList.add('jct-select-error');
      
      if (this.helperElement) {
        this.helperElement.classList.add('jct-select-error');
        this.helperElement.textContent = this.errorText || this.helperText;
      }
    } else {
      this.element.classList.remove('jct-has-error');
      this.selectElement.classList.remove('jct-select-error');
      
      if (this.helperElement) {
        this.helperElement.classList.remove('jct-select-error');
        this.helperElement.textContent = this.helperText;
      }
    }
  }

  /**
   * Get the select value
   * @returns {string|Array} The select value
   */
  getValue() {
    if (!this.selectElement) {
      return this.value;
    }
    
    if (this.multiple) {
      return Array.from(this.selectElement.selectedOptions).map(option => option.value);
    }
    
    return this.selectElement.value;
  }

  /**
   * Set the select value
   * @param {string|Array} value - The new value
   */
  setValue(value) {
    this.value = value;
    
    if (this.selectElement) {
      if (this.multiple && Array.isArray(value)) {
        for (const option of this.selectElement.options) {
          option.selected = value.includes(option.value);
        }
      } else {
        this.selectElement.value = value;
      }
    }
  }

  /**
   * Set the select options
   * @param {Array} options - The new options
   */
  setOptions(options) {
    this.options = options;
    
    if (this.selectElement) {
      this._populateOptions();
    }
  }

  /**
   * Set error state
   * @param {boolean} hasError - Whether the select has an error
   * @param {string} errorText - The error text
   */
  setError(hasError, errorText = '') {
    this.hasError = hasError;
    
    if (errorText) {
      this.errorText = errorText;
    }
    
    this._applyCommonProps();
  }

  /**
   * Focus the select
   */
  focus() {
    if (this.selectElement && this.enabled) {
      this.selectElement.focus();
    }
  }

  /**
   * Blur the select
   */
  blur() {
    if (this.selectElement) {
      this.selectElement.blur();
    }
  }
}

/**
 * Checkbox component
 */
export class Checkbox extends Component {
  /**
   * Create a checkbox
   * @param {Object} options - Checkbox options
   */
  constructor(options = {}) {
    super({
      ...options,
      type: ComponentType.CHECKBOX
    });
    
    this.label = options.label || '';
    this.checked = options.checked !== undefined ? options.checked : false;
    this.name = options.name || '';
    this.value = options.value || 'on';
    this.indeterminate = options.indeterminate !== undefined ? options.indeterminate : false;
    this.onChange = options.onChange || null;
    this.checkboxElement = null;
    this.labelElement = null;
  }

  /**
   * Create the component's DOM element
   * @returns {HTMLElement} The created element
   * @protected
   */
  _createElement() {
    const container = document.createElement('div');
    
    // Create checkbox input
    this.checkboxElement = document.createElement('input');
    this.checkboxElement.type = 'checkbox';
    this.checkboxElement.className = 'jct-checkbox-input';
    this.checkboxElement.checked = this.checked;
    this.checkboxElement.indeterminate = this.indeterminate;
    
    if (this.name) {
      this.checkboxElement.name = this.name;
    }
    
    if (this.value) {
      this.checkboxElement.value = this.value;
    }
    
    // Add event listener
    if (this.onChange) {
      this.checkboxElement.addEventListener('change', this.onChange);
    }
    
    container.appendChild(this.checkboxElement);
    
    // Create label if provided
    if (this.label) {
      this.labelElement = document.createElement('label');
      this.labelElement.className = 'jct-checkbox-label';
      this.labelElement.textContent = this.label;
      this.labelElement.htmlFor = this.id;
      container.appendChild(this.labelElement);
    }
    
    return container;
  }

  /**
   * Apply common properties to the element
   * @protected
   */
  _applyCommonProps() {
    super._applyCommonProps();
    
    if (!this.element || !this.checkboxElement) return;
    
    // Update checkbox state
    this.checkboxElement.disabled = !this.enabled;
    this.checkboxElement.checked = this.checked;
    this.checkboxElement.indeterminate = this.indeterminate;
  }

  /**
   * Get the checkbox checked state
   * @returns {boolean} The checked state
   */
  isChecked() {
    return this.checkboxElement ? this.checkboxElement.checked : this.checked;
  }

  /**
   * Set the checkbox checked state
   * @param {boolean} checked - The new checked state
   */
  setChecked(checked) {
    this.checked = checked;
    this.indeterminate = false;
    
    if (this.checkboxElement) {
      this.checkboxElement.checked = checked;
      this.checkboxElement.indeterminate = false;
    }
  }

  /**
   * Set the checkbox to indeterminate state
   * @param {boolean} indeterminate - The new indeterminate state
   */
  setIndeterminate(indeterminate) {
    this.indeterminate = indeterminate;
    
    if (this.checkboxElement) {
      this.checkboxElement.indeterminate = indeterminate;
    }
  }

  /**
   * Toggle the checkbox
   * @returns {boolean} The new checked state
   */
  toggle() {
    const newChecked = !this.checked;
    this.setChecked(newChecked);
    return newChecked;
  }
}

/**
 * Radio component
 */
export class Radio extends Component {
  /**
   * Create a radio button
   * @param {Object} options - Radio options
   */
  constructor(options = {}) {
    super({
      ...options,
      type: ComponentType.RADIO
    });
    
    this.label = options.label || '';
    this.checked = options.checked !== undefined ? options.checked : false;
    this.name = options.name || '';
    this.value = options.value || '';
    this.onChange = options.onChange || null;
    this.radioElement = null;
    this.labelElement = null;
  }

  /**
   * Create the component's DOM element
   * @returns {HTMLElement} The created element
   * @protected
   */
  _createElement() {
    const container = document.createElement('div');
    
    // Create radio input
    this.radioElement = document.createElement('input');
    this.radioElement.type = 'radio';
    this.radioElement.className = 'jct-radio-input';
    this.radioElement.checked = this.checked;
    
    if (this.name) {
      this.radioElement.name = this.name;
    }
    
    if (this.value) {
      this.radioElement.value = this.value;
    }
    
    // Add event listener
    if (this.onChange) {
      this.radioElement.addEventListener('change', this.onChange);
    }
    
    container.appendChild(this.radioElement);
    
    // Create label if provided
    if (this.label) {
      this.labelElement = document.createElement('label');
      this.labelElement.className = 'jct-radio-label';
      this.labelElement.textContent = this.label;
      this.labelElement.htmlFor = this.id;
      container.appendChild(this.labelElement);
    }
    
    return container;
  }

  /**
   * Apply common properties to the element
   * @protected
   */
  _applyCommonProps() {
    super._applyCommonProps();
    
    if (!this.element || !this.radioElement) return;
    
    // Update radio state
    this.radioElement.disabled = !this.enabled;
    this.radioElement.checked = this.checked;
  }

  /**
   * Get the radio checked state
   * @returns {boolean} The checked state
   */
  isChecked() {
    return this.radioElement ? this.radioElement.checked : this.checked;
  }

  /**
   * Set the radio checked state
   * @param {boolean} checked - The new checked state
   */
  setChecked(checked) {
    this.checked = checked;
    
    if (this.radioElement) {
      this.radioElement.checked = checked;
    }
  }
}

/**
 * Radio Group component
 */
export class RadioGroup extends Component {
  /**
   * Create a radio group
   * @param {Object} options - Radio group options
   */
  constructor(options = {}) {
    super({
      ...options,
      type: 'radioGroup'
    });
    
    this.name = options.name || generateId();
    this.options = options.options || [];
    this.value = options.value || '';
    this.label = options.label || '';
    this.layout = options.layout || 'vertical';
    this.onChange = options.onChange || null;
    this.radios = [];
  }

  /**
   * Create the component's DOM element
   * @returns {HTMLElement} The created element
   * @protected
   */
  _createElement() {
    const container = document.createElement('div');
    
    // Add label if provided
    if (this.label) {
      const labelElement = document.createElement('div');
      labelElement.className = 'jct-radio-group-label';
      labelElement.textContent = this.label;
      container.appendChild(labelElement);
    }
    
    // Create options container
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'jct-radio-group-options';
    optionsContainer.classList.add(`jct-layout-${this.layout}`);
    
    // Create radio buttons
    for (const option of this.options) {
      const radio = new Radio({
        label: option.label || option.value,
        value: option.value,
        name: this.name,
        checked: this.value === option.value,
        enabled: this.enabled && !option.disabled,
        onChange: (e) => {
          if (e.target.checked) {
            this.value = option.value;
            
            // Update other radios
            for (const r of this.radios) {
              if (r !== radio) {
                r.setChecked(false);
              }
            }
            
            // Call onChange handler
            if (this.onChange) {
              this.onChange({
                target: this,
                value: this.value
              });
            }
          }
        }
      });
      
      this.radios.push(radio);
      radio.render(optionsContainer);
    }
    
    container.appendChild(optionsContainer);
    
    return container;
  }

  /**
   * Apply common properties to the element
   * @protected
   */
  _applyCommonProps() {
    super._applyCommonProps();
    
    // Update radio states
    for (const radio of this.radios) {
      radio.enabled = this.enabled;
      radio.update();
    }
  }

  /**
   * Get the selected value
   * @returns {string} The selected value
   */
  getValue() {
    return this.value;
  }

  /**
   * Set the selected value
   * @param {string} value - The value to select
   */
  setValue(value) {
    this.value = value;
    
    // Update radio buttons
    for (const radio of this.radios) {
      radio.setChecked(radio.value === value);
    }
  }

  /**
   * Set the radio options
   * @param {Array} options - The new options
   */
  setOptions(options) {
    this.options = options;
    
    // Re-render if already rendered
    if (this.rendered) {
      this.radios = [];
      
      if (this.element) {
        const parent = this.element.parentNode;
        this.element.remove();
        this.element = this._createElement();
        
        if (parent) {
          parent.appendChild(this.element);
        }
      }
    }
  }
}

/**
 * Toggle component
 */
export class Toggle extends Component {
  /**
   * Create a toggle
   * @param {Object} options - Toggle options
   */
  constructor(options = {}) {
    super({
      ...options,
      type: ComponentType.TOGGLE
    });
    
    this.label = options.label || '';
    this.checked = options.checked !== undefined ? options.checked : false;
    this.name = options.name || '';
    this.value = options.value || 'on';
    this.onChange = options.onChange || null;
    this.toggleElement = null;
    this.labelElement = null;
    this.trackElement = null;
    this.thumbElement = null;
  }

  /**
   * Create the component's DOM element
   * @returns {HTMLElement} The created element
   * @protected
   */
  _createElement() {
    const container = document.createElement('div');
    
    // Create toggle track and thumb
    this.toggleElement = document.createElement('div');
    this.toggleElement.className = 'jct-toggle';
    
    this.trackElement = document.createElement('div');
    this.trackElement.className = 'jct-toggle-track';
    
    this.thumbElement = document.createElement('div');
    this.thumbElement.className = 'jct-toggle-thumb';
    
    this.trackElement.appendChild(this.thumbElement);
    this.toggleElement.appendChild(this.trackElement);
    
    // Create hidden input for form submission
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.className = 'jct-toggle-input';
    input.checked = this.checked;
    
    if (this.name) {
      input.name = this.name;
    }
    
    if (this.value) {
      input.value = this.value;
    }
    
    this.toggleElement.appendChild(input);
    
    // Add event listener
    this.toggleElement.addEventListener('click', (e) => {
      if (!this.enabled) return;
      
      this.checked = !this.checked;
      input.checked = this.checked;
      this._updateToggleState();
      
      if (this.onChange) {
        this.onChange({
          target: this,
          checked: this.checked
        });
      }
    });
    
    container.appendChild(this.toggleElement);
    
    // Create label if provided
    if (this.label) {
      this.labelElement = document.createElement('label');
      this.labelElement.className = 'jct-toggle-label';
      this.labelElement.textContent = this.label;
      container.appendChild(this.labelElement);
    }
    
    return container;
  }

  /**
   * Apply common properties to the element
   * @protected
   */
  _applyCommonProps() {
    super._applyCommonProps();
    
    if (!this.element || !this.toggleElement) return;
    
    // Update toggle state
    this._updateToggleState();
  }

  /**
   * Update toggle visual state
   * @private
   */
  _updateToggleState() {
    if (!this.toggleElement) return;
    
    if (this.checked) {
      this.toggleElement.classList.add('jct-toggle-checked');
    } else {
      this.toggleElement.classList.remove('jct-toggle-checked');
    }
    
    if (!this.enabled) {
      this.toggleElement.classList.add('jct-toggle-disabled');
    } else {
      this.toggleElement.classList.remove('jct-toggle-disabled');
    }
  }

  /**
   * Get the toggle checked state
   * @returns {boolean} The checked state
   */
  isChecked() {
    return this.checked;
  }

  /**
   * Set the toggle checked state
   * @param {boolean} checked - The new checked state
   */
  setChecked(checked) {
    this.checked = checked;
    
    if (this.toggleElement) {
      const input = this.toggleElement.querySelector('input');
      if (input) {
        input.checked = checked;
      }
      
      this._updateToggleState();
    }
  }

  /**
   * Toggle the state
   * @returns {boolean} The new checked state
   */
  toggle() {
    const newChecked = !this.checked;
    this.setChecked(newChecked);
    return newChecked;
  }
}

/**
 * Slider component
 */
export class Slider extends Component {
  /**
   * Create a slider
   * @param {Object} options - Slider options
   */
  constructor(options = {}) {
    super({
      ...options,
      type: ComponentType.SLIDER
    });
    
    this.label = options.label || '';
    this.min = options.min !== undefined ? options.min : 0;
    this.max = options.max !== undefined ? options.max : 100;
    this.step = options.step !== undefined ? options.step : 1;
    this.value = options.value !== undefined ? options.value : this.min;
    this.showValue = options.showValue !== undefined ? options.showValue : false;
    this.name = options.name || '';
    this.onChange = options.onChange || null;
    this.onInput = options.onInput || null;
    this.sliderElement = null;
    this.labelElement = null;
    this.valueElement = null;
  }

    /**
   * Create the component's DOM element
   * @returns {HTMLElement} The created element
   * @protected
   */
  _createElement() {
    const container = document.createElement('div');
    
    // Create label if provided
    if (this.label) {
      this.labelElement = document.createElement('label');
      this.labelElement.className = 'jct-slider-label';
      this.labelElement.textContent = this.label;
      container.appendChild(this.labelElement);
    }
    
    // Create slider container
    const sliderContainer = document.createElement('div');
    sliderContainer.className = 'jct-slider-container';
    
    // Create slider input
    this.sliderElement = document.createElement('input');
    this.sliderElement.type = 'range';
    this.sliderElement.className = 'jct-slider-input';
    this.sliderElement.min = this.min;
    this.sliderElement.max = this.max;
    this.sliderElement.step = this.step;
    this.sliderElement.value = this.value;
    
    if (this.name) {
      this.sliderElement.name = this.name;
    }
    
    // Add event listeners
    if (this.onChange) {
      this.sliderElement.addEventListener('change', (e) => {
        this.value = parseFloat(e.target.value);
        
        if (this.valueElement) {
          this.valueElement.textContent = this.value;
        }
        
        this.onChange({
          target: this,
          value: this.value
        });
      });
    }
    
    if (this.onInput) {
      this.sliderElement.addEventListener('input', (e) => {
        this.value = parseFloat(e.target.value);
        
        if (this.valueElement) {
          this.valueElement.textContent = this.value;
        }
        
        this.onInput({
          target: this,
          value: this.value
        });
      });
    }
    
    sliderContainer.appendChild(this.sliderElement);
    
    // Create value display if enabled
    if (this.showValue) {
      this.valueElement = document.createElement('div');
      this.valueElement.className = 'jct-slider-value';
      this.valueElement.textContent = this.value;
      sliderContainer.appendChild(this.valueElement);
    }
    
    container.appendChild(sliderContainer);
    
    return container;
  }

  /**
   * Apply common properties to the element
   * @protected
   */
  _applyCommonProps() {
    super._applyCommonProps();
    
    if (!this.element || !this.sliderElement) return;
    
    // Update slider state
    this.sliderElement.disabled = !this.enabled;
    this.sliderElement.value = this.value;
    
    if (this.valueElement) {
      this.valueElement.textContent = this.value;
    }
  }

  /**
   * Get the slider value
   * @returns {number} The slider value
   */
  getValue() {
    return this.value;
  }

  /**
   * Set the slider value
   * @param {number} value - The new value
   */
  setValue(value) {
    // Ensure value is within range
    value = Math.max(this.min, Math.min(this.max, value));
    this.value = value;
    
    if (this.sliderElement) {
      this.sliderElement.value = value;
    }
    
    if (this.valueElement) {
      this.valueElement.textContent = value;
    }
  }

  /**
   * Set the slider range
   * @param {number} min - The minimum value
   * @param {number} max - The maximum value
   */
  setRange(min, max) {
    this.min = min;
    this.max = max;
    
    if (this.sliderElement) {
      this.sliderElement.min = min;
      this.sliderElement.max = max;
    }
    
    // Ensure value is within new range
    this.setValue(this.value);
  }
}

/**
 * Tabs component
 */
export class Tabs extends Component {
  /**
   * Create a tabs component
   * @param {Object} options - Tabs options
   */
  constructor(options = {}) {
    super({
      ...options,
      type: ComponentType.TABS
    });
    
    this.tabs = options.tabs || [];
    this.activeTab = options.activeTab !== undefined ? options.activeTab : 0;
    this.onChange = options.onChange || null;
    this.tabsElement = null;
    this.contentElement = null;
    this.tabElements = [];
    this.contentElements = [];
  }

  /**
   * Create the component's DOM element
   * @returns {HTMLElement} The created element
   * @protected
   */
  _createElement() {
    const container = document.createElement('div');
    
    // Create tabs header
    this.tabsElement = document.createElement('div');
    this.tabsElement.className = 'jct-tabs-header';
    
    // Create tab content container
    this.contentElement = document.createElement('div');
    this.contentElement.className = 'jct-tabs-content';
    
    // Create tabs and content
    for (let i = 0; i < this.tabs.length; i++) {
      const tab = this.tabs[i];
      
      // Create tab button
      const tabElement = document.createElement('div');
      tabElement.className = 'jct-tab';
      tabElement.textContent = tab.label;
      
      if (i === this.activeTab) {
        tabElement.classList.add('jct-tab-active');
      }
      
      tabElement.addEventListener('click', () => {
        if (!this.enabled) return;
        this.setActiveTab(i);
      });
      
      this.tabElements.push(tabElement);
      this.tabsElement.appendChild(tabElement);
      
      // Create tab content
      const contentElement = document.createElement('div');
      contentElement.className = 'jct-tab-pane';
      
      if (i === this.activeTab) {
        contentElement.classList.add('jct-tab-pane-active');
      } else {
        contentElement.style.display = 'none';
      }
      
      // Add content
      if (tab.content instanceof Component) {
        tab.content.render(contentElement);
      } else if (typeof tab.content === 'string') {
        contentElement.innerHTML = tab.content;
      }
      
      this.contentElements.push(contentElement);
      this.contentElement.appendChild(contentElement);
    }
    
    container.appendChild(this.tabsElement);
    container.appendChild(this.contentElement);
    
    return container;
  }

  /**
   * Apply common properties to the element
   * @protected
   */
  _applyCommonProps() {
    super._applyCommonProps();
    
    if (!this.element) return;
    
    // Update tab states
    for (let i = 0; i < this.tabElements.length; i++) {
      if (i === this.activeTab) {
        this.tabElements[i].classList.add('jct-tab-active');
        this.contentElements[i].classList.add('jct-tab-pane-active');
        this.contentElements[i].style.display = '';
      } else {
        this.tabElements[i].classList.remove('jct-tab-active');
        this.contentElements[i].classList.remove('jct-tab-pane-active');
        this.contentElements[i].style.display = 'none';
      }
    }
  }

  /**
   * Get the active tab index
   * @returns {number} The active tab index
   */
  getActiveTab() {
    return this.activeTab;
  }

  /**
   * Set the active tab
   * @param {number} index - The tab index to activate
   */
  setActiveTab(index) {
    if (index < 0 || index >= this.tabs.length || index === this.activeTab) {
      return;
    }
    
    const previousTab = this.activeTab;
    this.activeTab = index;
    
    this._applyCommonProps();
    
    // Call onChange handler
    if (this.onChange) {
      this.onChange({
        target: this,
        previousTab,
        activeTab: this.activeTab
      });
    }
  }

  /**
   * Add a new tab
   * @param {Object} tab - The tab to add
   * @param {boolean} setActive - Whether to set the new tab as active
   * @returns {number} The index of the new tab
   */
  addTab(tab, setActive = false) {
    this.tabs.push(tab);
    
    // Re-render if already rendered
    if (this.rendered) {
      this.tabElements = [];
      this.contentElements = [];
      
      if (this.element) {
        const parent = this.element.parentNode;
        this.element.remove();
        this.element = this._createElement();
        
        if (parent) {
          parent.appendChild(this.element);
        }
      }
    }
    
    const newIndex = this.tabs.length - 1;
    
    if (setActive) {
      this.setActiveTab(newIndex);
    }
    
    return newIndex;
  }

  /**
   * Remove a tab
   * @param {number} index - The index of the tab to remove
   * @returns {boolean} True if the tab was removed
   */
  removeTab(index) {
    if (index < 0 || index >= this.tabs.length) {
      return false;
    }
    
    this.tabs.splice(index, 1);
    
    // Adjust active tab if needed
    if (this.activeTab >= this.tabs.length) {
      this.activeTab = Math.max(0, this.tabs.length - 1);
    }
    
    // Re-render if already rendered
    if (this.rendered) {
      this.tabElements = [];
      this.contentElements = [];
      
      if (this.element) {
        const parent = this.element.parentNode;
        this.element.remove();
        this.element = this._createElement();
        
        if (parent) {
          parent.appendChild(this.element);
        }
      }
    }
    
    return true;
  }
}

/**
 * Table component
 */
export class Table extends Component {
  /**
   * Create a table
   * @param {Object} options - Table options
   */
  constructor(options = {}) {
    super({
      ...options,
      type: ComponentType.TABLE
    });
    
    this.columns = options.columns || [];
    this.data = options.data || [];
    this.selectable = options.selectable !== undefined ? options.selectable : false;
    this.multiSelect = options.multiSelect !== undefined ? options.multiSelect : false;
    this.selectedRows = options.selectedRows || [];
    this.sortable = options.sortable !== undefined ? options.sortable : false;
    this.sortColumn = options.sortColumn || null;
    this.sortDirection = options.sortDirection || 'asc';
    this.pagination = options.pagination !== undefined ? options.pagination : false;
    this.pageSize = options.pageSize || 10;
    this.currentPage = options.currentPage || 0;
    this.onRowClick = options.onRowClick || null;
    this.onSelectionChange = options.onSelectionChange || null;
    this.onSort = options.onSort || null;
    this.onPageChange = options.onPageChange || null;
    this.tableElement = null;
    this.headerElement = null;
    this.bodyElement = null;
    this.footerElement = null;
    this.rowElements = [];
  }

  /**
   * Create the component's DOM element
   * @returns {HTMLElement} The created element
   * @protected
   */
  _createElement() {
    const container = document.createElement('div');
    container.className = 'jct-table-container';
    
    // Create table
    this.tableElement = document.createElement('table');
    this.tableElement.className = 'jct-table';
    
    // Create header
    this.headerElement = document.createElement('thead');
    this.headerElement.className = 'jct-table-header';
    
    const headerRow = document.createElement('tr');
    
    // Add selection column if selectable
    if (this.selectable) {
      const selectHeaderCell = document.createElement('th');
      selectHeaderCell.className = 'jct-table-select-cell';
      
      if (this.multiSelect) {
        const selectAllCheckbox = document.createElement('input');
        selectAllCheckbox.type = 'checkbox';
        selectAllCheckbox.className = 'jct-table-select-all';
        selectAllCheckbox.checked = this.selectedRows.length === this.data.length;
        
        selectAllCheckbox.addEventListener('change', (e) => {
          if (!this.enabled) return;
          
          if (e.target.checked) {
            // Select all rows
            this.selectedRows = this.data.map((_, index) => index);
          } else {
            // Deselect all rows
            this.selectedRows = [];
          }
          
          this._updateRowSelection();
          
          if (this.onSelectionChange) {
            this.onSelectionChange({
              target: this,
              selectedRows: this.selectedRows,
              selectedData: this.getSelectedData()
            });
          }
        });
        
        selectHeaderCell.appendChild(selectAllCheckbox);
      }
      
      headerRow.appendChild(selectHeaderCell);
    }
    
    // Add column headers
    for (const column of this.columns) {
      const headerCell = document.createElement('th');
      headerCell.className = 'jct-table-header-cell';
      
      if (column.width) {
        headerCell.style.width = column.width;
      }
      
      // Add column label
      const labelContainer = document.createElement('div');
      labelContainer.className = 'jct-table-header-content';
      labelContainer.textContent = column.label || column.field || '';
      
      // Add sort indicator if sortable
      if (this.sortable && column.sortable !== false) {
        labelContainer.classList.add('jct-table-sortable');
        
        const sortIndicator = document.createElement('span');
        sortIndicator.className = 'jct-table-sort-indicator';
        
        if (this.sortColumn === column.field) {
          sortIndicator.textContent = this.sortDirection === 'asc' ? '▲' : '▼';
          labelContainer.classList.add('jct-table-sorted');
        }
        
        labelContainer.appendChild(sortIndicator);
        
        // Add click handler for sorting
        labelContainer.addEventListener('click', () => {
          if (!this.enabled) return;
          
          let direction = 'asc';
          
          if (this.sortColumn === column.field) {
            direction = this.sortDirection === 'asc' ? 'desc' : 'asc';
          }
          
          this.sortColumn = column.field;
          this.sortDirection = direction;
          
          this._sortData();
          this._renderTableBody();
          
          if (this.onSort) {
            this.onSort({
              target: this,
              column: column.field,
              direction
            });
          }
        });
      }
      
      headerCell.appendChild(labelContainer);
      headerRow.appendChild(headerCell);
    }
    
    this.headerElement.appendChild(headerRow);
    this.tableElement.appendChild(this.headerElement);
    
    // Create body
    this.bodyElement = document.createElement('tbody');
    this.bodyElement.className = 'jct-table-body';
    this.tableElement.appendChild(this.bodyElement);
    
    // Render table body
    this._renderTableBody();
    
    container.appendChild(this.tableElement);
    
    // Create footer with pagination if enabled
    if (this.pagination) {
      this.footerElement = document.createElement('div');
      this.footerElement.className = 'jct-table-footer';
      
      this._renderPagination();
      
      container.appendChild(this.footerElement);
    }
    
    return container;
  }

  /**
   * Render the table body
   * @private
   */
  _renderTableBody() {
    if (!this.bodyElement) return;
    
    // Clear existing rows
    this.bodyElement.innerHTML = '';
    this.rowElements = [];
    
    // Get data for current page
    const data = this.pagination
      ? this.data.slice(this.currentPage * this.pageSize, (this.currentPage + 1) * this.pageSize)
      : this.data;
    
    // Create rows
    for (let i = 0; i < data.length; i++) {
      const rowData = data[i];
      const rowIndex = this.pagination ? this.currentPage * this.pageSize + i : i;
      const row = document.createElement('tr');
      row.className = 'jct-table-row';
      
      // Add selected class if row is selected
      if (this.selectedRows.includes(rowIndex)) {
        row.classList.add('jct-table-row-selected');
      }
      
      // Add selection cell if selectable
      if (this.selectable) {
        const selectCell = document.createElement('td');
        selectCell.className = 'jct-table-select-cell';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'jct-table-select-row';
        checkbox.checked = this.selectedRows.includes(rowIndex);
        
        checkbox.addEventListener('change', (e) => {
          if (!this.enabled) return;
          
          if (e.target.checked) {
            // Select row
            if (!this.multiSelect) {
              this.selectedRows = [rowIndex];
            } else if (!this.selectedRows.includes(rowIndex)) {
              this.selectedRows.push(rowIndex);
            }
          } else {
            // Deselect row
            this.selectedRows = this.selectedRows.filter(index => index !== rowIndex);
          }
          
          this._updateRowSelection();
          
          if (this.onSelectionChange) {
            this.onSelectionChange({
              target: this,
              selectedRows: this.selectedRows,
              selectedData: this.getSelectedData()
            });
          }
        });
        
        selectCell.appendChild(checkbox);
        row.appendChild(selectCell);
      }
      
      // Add data cells
      for (const column of this.columns) {
        const cell = document.createElement('td');
        cell.className = 'jct-table-cell';
        
        // Get cell value
        let value = rowData[column.field];
        
        // Format value if formatter is provided
        if (column.formatter && typeof column.formatter === 'function') {
          value = column.formatter(value, rowData, rowIndex);
        }
        
        // Set cell content
        if (value instanceof Component) {
          value.render(cell);
        } else if (value !== undefined && value !== null) {
          cell.textContent = value;
        }
        
        row.appendChild(cell);
      }
      
      // Add row click handler
      if (this.onRowClick || this.selectable) {
        row.addEventListener('click', (e) => {
          if (!this.enabled) return;
          
          // Skip if click was on checkbox
          if (e.target.closest('.jct-table-select-cell')) {
            return;
          }
          
          // Toggle selection if selectable
          if (this.selectable) {
            const isSelected = this.selectedRows.includes(rowIndex);
            
            if (isSelected) {
              this.selectedRows = this.selectedRows.filter(index => index !== rowIndex);
            } else {
              if (!this.multiSelect) {
                this.selectedRows = [rowIndex];
              } else {
                this.selectedRows.push(rowIndex);
              }
            }
            
            this._updateRowSelection();
            
            if (this.onSelectionChange) {
              this.onSelectionChange({
                target: this,
                selectedRows: this.selectedRows,
                selectedData: this.getSelectedData()
              });
            }
          }
          
          // Call row click handler
          if (this.onRowClick) {
            this.onRowClick({
              target: this,
              rowIndex,
              rowData,
              originalEvent: e
            });
          }
        });
      }
      
      this.rowElements.push(row);
      this.bodyElement.appendChild(row);
    }
    
    // Add empty row if no data
    if (data.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.className = 'jct-table-empty-row';
      
      const emptyCell = document.createElement('td');
      emptyCell.className = 'jct-table-empty-cell';
      emptyCell.colSpan = this.columns.length + (this.selectable ? 1 : 0);
      emptyCell.textContent = 'No data';
      
      emptyRow.appendChild(emptyCell);
      this.bodyElement.appendChild(emptyRow);
    }
  }

  /**
   * Render pagination controls
   * @private
   */
  _renderPagination() {
    if (!this.footerElement || !this.pagination) return;
    
    // Clear existing content
    this.footerElement.innerHTML = '';
    
    // Create pagination container
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'jct-table-pagination';
    
    // Calculate total pages
    const totalPages = Math.ceil(this.data.length / this.pageSize);
    
    // Create page size selector
    const pageSizeContainer = document.createElement('div');
    pageSizeContainer.className = 'jct-table-page-size';
    
    const pageSizeLabel = document.createElement('span');
    pageSizeLabel.textContent = 'Rows per page:';
    pageSizeContainer.appendChild(pageSizeLabel);
    
    const pageSizeSelect = document.createElement('select');
    pageSizeSelect.className = 'jct-table-page-size-select';
    
    [5, 10, 25, 50, 100].forEach(size => {
      const option = document.createElement('option');
      option.value = size;
      option.textContent = size;
      option.selected = this.pageSize === size;
      pageSizeSelect.appendChild(option);
    });
    
    pageSizeSelect.addEventListener('change', (e) => {
      if (!this.enabled) return;
      
      const newPageSize = parseInt(e.target.value, 10);
      this.pageSize = newPageSize;
      this.currentPage = 0; // Reset to first page
      
      this._renderTableBody();
      this._renderPagination();
      
      if (this.onPageChange) {
        this.onPageChange({
          target: this,
          page: this.currentPage,
          pageSize: this.pageSize
        });
      }
    });
    
    pageSizeContainer.appendChild(pageSizeSelect);
    paginationContainer.appendChild(pageSizeContainer);
    
    // Create page info
    const pageInfo = document.createElement('div');
    pageInfo.className = 'jct-table-page-info';
    
    const start = this.currentPage * this.pageSize + 1;
    const end = Math.min((this.currentPage + 1) * this.pageSize, this.data.length);
    pageInfo.textContent = `${start}-${end} of ${this.data.length}`;
    
    paginationContainer.appendChild(pageInfo);
    
    // Create page navigation
    const pageNav = document.createElement('div');
    pageNav.className = 'jct-table-page-nav';
    
    // First page button
    const firstPageButton = document.createElement('button');
    firstPageButton.className = 'jct-table-page-button';
    firstPageButton.innerHTML = '«';
    firstPageButton.disabled = this.currentPage === 0 || !this.enabled;
    
    firstPageButton.addEventListener('click', () => {
      if (!this.enabled || this.currentPage === 0) return;
      
      this.currentPage = 0;
      this._renderTableBody();
      this._renderPagination();
      
      if (this.onPageChange) {
        this.onPageChange({
          target: this,
          page: this.currentPage,
          pageSize: this.pageSize
        });
      }
    });
    
    pageNav.appendChild(firstPageButton);
    
    // Previous page button
    const prevPageButton = document.createElement('button');
    prevPageButton.className = 'jct-table-page-button';
    prevPageButton.innerHTML = '‹';
    prevPageButton.disabled = this.currentPage === 0 || !this.enabled;
    
    prevPageButton.addEventListener('click', () => {
      if (!this.enabled || this.currentPage === 0) return;
      
      this.currentPage--;
      this._renderTableBody();
      this._renderPagination();
      
      if (this.onPageChange) {
        this.onPageChange({
          target: this,
          page: this.currentPage,
          pageSize: this.pageSize
        });
      }
    });
    
    pageNav.appendChild(prevPageButton);
    
    // Page number
    const pageNumber = document.createElement('span');
    pageNumber.className = 'jct-table-page-number';
    pageNumber.textContent = `${this.currentPage + 1} / ${totalPages}`;
    
    pageNav.appendChild(pageNumber);
    
    // Next page button
    const nextPageButton = document.createElement('button');
    nextPageButton.className = 'jct-table-page-button';
    nextPageButton.innerHTML = '›';
    nextPageButton.disabled = this.currentPage >= totalPages - 1 || !this.enabled;
    
    nextPageButton.addEventListener('click', () => {
      if (!this.enabled || this.currentPage >= totalPages - 1) return;
      
      this.currentPage++;
      this._renderTableBody();
      this._renderPagination();
      
      if (this.onPageChange) {
        this.onPageChange({
          target: this,
          page: this.currentPage,
          pageSize: this.pageSize
        });
      }
    });
    
    pageNav.appendChild(nextPageButton);
    
    // Last page button
    const lastPageButton = document.createElement('button');
    lastPageButton.className = 'jct-table-page-button';
    lastPageButton.innerHTML = '»';
    lastPageButton.disabled = this.currentPage >= totalPages - 1 || !this.enabled;
    
    lastPageButton.addEventListener('click', () => {
      if (!this.enabled || this.currentPage >= totalPages - 1) return;
      
      this.currentPage = totalPages - 1;
      this._renderTableBody();
      this._renderPagination();
      
      if (this.onPageChange) {
        this.onPageChange({
          target: this,
          page: this.currentPage,
          pageSize: this.pageSize
        });
      }
    });
    
    pageNav.appendChild(lastPageButton);
    
    paginationContainer.appendChild(pageNav);
    this.footerElement.appendChild(paginationContainer);
  }

  /**
   * Update row selection state
   * @private
   */
  _updateRowSelection() {
    // Update row elements
    for (let i = 0; i < this.rowElements.length; i++) {
      const rowIndex = this.pagination ? this.currentPage * this.pageSize + i : i;
      const isSelected = this.selectedRows.includes(rowIndex);
      
      if (isSelected) {
        this.rowElements[i].classList.add('jct-table-row-selected');
      } else {
        this.rowElements[i].classList.remove('jct-table-row-selected');
      }
      
      // Update checkbox
      if (this.selectable) {
        const checkbox = this.rowElements[i].querySelector('.jct-table-select-row');
        if (checkbox) {
          checkbox.checked = isSelected;
        }
      }
    }
    
    // Update select all checkbox
    if (this.selectable && this.multiSelect) {
      const selectAllCheckbox = this.headerElement.querySelector('.jct-table-select-all');
      if (selectAllCheckbox) {
        selectAllCheckbox.checked = this.selectedRows.length === this.data.length;
      }
    }
  }

  /**
   * Sort data based on current sort column and direction
   * @private
   */
  _sortData() {
    if (!this.sortable || !this.sortColumn) return;
    
    const column = this.columns.find(col => col.field === this.sortColumn);
    
    if (!column) return;
    
    this.data.sort((a, b) => {
      let valueA = a[this.sortColumn];
      let valueB = b[this.sortColumn];
      
      // Use custom sorter if provided
      if (column.sorter && typeof column.sorter === 'function') {
        return column.sorter(valueA, valueB, a, b) * (this.sortDirection === 'asc' ? 1 : -1);
      }
      
      // Default sorting logic
      if (valueA === valueB) return 0;
      
      if (valueA === null || valueA === undefined) return this.sortDirection === 'asc' ? -1 : 1;
      if (valueB === null || valueB === undefined) return this.sortDirection === 'asc' ? 1 : -1;
      
      if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase();
      }
      
      if (typeof valueB === 'string') {
        valueB = valueB.toLowerCase();
      }
      
      if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
      
      return 0;
    });
  }

  /**
   * Apply common properties to the element
   * @protected
   */
  _applyCommonProps() {
    super._applyCommonProps();
    
    if (!this.element) return;
    
    // Update table state
    if (!this.enabled) {
      this.element.classList.add('jct-table-disabled');
    } else {
      this.element.classList.remove('jct-table-disabled');
    }
  }

  /**
   * Get the selected data
   * @returns {Array} The selected data
   */
  getSelectedData() {
    return this.selectedRows.map(index => this.data[index]);
  }

  /**
   * Set the selected rows
   * @param {Array} indices - The indices of rows to select
   */
  setSelectedRows(indices) {
    this.selectedRows = indices.filter(index => index >= 0 && index < this.data.length);
    
    if (this.rendered) {
      this._updateRowSelection();
    }
  }

    /**
   * Set the table data
   * @param {Array} data - The new data
   */
  setData(data) {
    this.data = data || [];
    this.selectedRows = [];
    this.currentPage = 0;
    
    if (this.rendered) {
      this._sortData();
      this._renderTableBody();
      
      if (this.pagination) {
        this._renderPagination();
      }
    }
  }

  /**
   * Set the table columns
   * @param {Array} columns - The new columns
   */
  setColumns(columns) {
    this.columns = columns || [];
    
    // Re-render if already rendered
    if (this.rendered) {
      this.rowElements = [];
      
      if (this.element) {
        const parent = this.element.parentNode;
        this.element.remove();
        this.element = this._createElement();
        
        if (parent) {
          parent.appendChild(this.element);
        }
      }
    }
  }

  /**
   * Sort the table by a column
   * @param {string} column - The column field to sort by
   * @param {string} direction - The sort direction ('asc' or 'desc')
   */
  sortBy(column, direction = 'asc') {
    if (!this.sortable) return;
    
    this.sortColumn = column;
    this.sortDirection = direction === 'desc' ? 'desc' : 'asc';
    
    if (this.rendered) {
      this._sortData();
      this._renderTableBody();
    }
  }

  /**
   * Go to a specific page
   * @param {number} page - The page number (0-based)
   */
  goToPage(page) {
    if (!this.pagination) return;
    
    const totalPages = Math.ceil(this.data.length / this.pageSize);
    this.currentPage = Math.max(0, Math.min(page, totalPages - 1));
    
    if (this.rendered) {
      this._renderTableBody();
      this._renderPagination();
    }
  }
}

/**
 * List component
 */
export class List extends Component {
  /**
   * Create a list
   * @param {Object} options - List options
   */
  constructor(options = {}) {
    super({
      ...options,
      type: ComponentType.LIST
    });
    
    this.items = options.items || [];
    this.selectable = options.selectable !== undefined ? options.selectable : false;
    this.multiSelect = options.multiSelect !== undefined ? options.multiSelect : false;
    this.selectedItems = options.selectedItems || [];
    this.itemHeight = options.itemHeight || null;
    this.virtualized = options.virtualized !== undefined ? options.virtualized : false;
    this.onItemClick = options.onItemClick || null;
    this.onSelectionChange = options.onSelectionChange || null;
    this.listElement = null;
    this.itemElements = [];
  }

  /**
   * Create the component's DOM element
   * @returns {HTMLElement} The created element
   * @protected
   */
  _createElement() {
    const container = document.createElement('div');
    container.className = 'jct-list-container';
    
    // Create list
    this.listElement = document.createElement('ul');
    this.listElement.className = 'jct-list';
    
    if (this.selectable) {
      this.listElement.classList.add('jct-list-selectable');
    }
    
    // Render items
    this._renderItems();
    
    container.appendChild(this.listElement);
    
    return container;
  }

  /**
   * Render list items
   * @private
   */
  _renderItems() {
    if (!this.listElement) return;
    
    // Clear existing items
    this.listElement.innerHTML = '';
    this.itemElements = [];
    
    // Create items
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      const listItem = document.createElement('li');
      listItem.className = 'jct-list-item';
      
      // Set fixed height if specified
      if (this.itemHeight) {
        listItem.style.height = `${this.itemHeight}px`;
      }
      
      // Add selected class if item is selected
      if (this.selectedItems.includes(i)) {
        listItem.classList.add('jct-list-item-selected');
      }
      
      // Add item content
      if (item instanceof Component) {
        item.render(listItem);
      } else if (typeof item === 'object' && item.content) {
        if (item.content instanceof Component) {
          item.content.render(listItem);
        } else {
          listItem.textContent = item.content;
        }
      } else {
        listItem.textContent = String(item);
      }
      
      // Add item click handler
      listItem.addEventListener('click', (e) => {
        if (!this.enabled) return;
        
        // Handle selection
        if (this.selectable) {
          const isSelected = this.selectedItems.includes(i);
          
          if (isSelected) {
            this.selectedItems = this.selectedItems.filter(index => index !== i);
          } else {
            if (!this.multiSelect) {
              this.selectedItems = [i];
            } else {
              this.selectedItems.push(i);
            }
          }
          
          this._updateItemSelection();
          
          if (this.onSelectionChange) {
            this.onSelectionChange({
              target: this,
              selectedItems: this.selectedItems,
              selectedData: this.getSelectedData()
            });
          }
        }
        
        // Call item click handler
        if (this.onItemClick) {
          this.onItemClick({
            target: this,
            itemIndex: i,
            itemData: this.items[i],
            originalEvent: e
          });
        }
      });
      
      this.itemElements.push(listItem);
      this.listElement.appendChild(listItem);
    }
    
    // Add empty message if no items
    if (this.items.length === 0) {
      const emptyItem = document.createElement('li');
      emptyItem.className = 'jct-list-empty';
      emptyItem.textContent = 'No items';
      this.listElement.appendChild(emptyItem);
    }
  }

  /**
   * Update item selection state
   * @private
   */
  _updateItemSelection() {
    // Update item elements
    for (let i = 0; i < this.itemElements.length; i++) {
      const isSelected = this.selectedItems.includes(i);
      
      if (isSelected) {
        this.itemElements[i].classList.add('jct-list-item-selected');
      } else {
        this.itemElements[i].classList.remove('jct-list-item-selected');
      }
    }
  }

  /**
   * Apply common properties to the element
   * @protected
   */
  _applyCommonProps() {
    super._applyCommonProps();
    
    if (!this.element) return;
    
    // Update list state
    if (!this.enabled) {
      this.element.classList.add('jct-list-disabled');
    } else {
      this.element.classList.remove('jct-list-disabled');
    }
  }

  /**
   * Get the selected data
   * @returns {Array} The selected data
   */
  getSelectedData() {
    return this.selectedItems.map(index => this.items[index]);
  }

  /**
   * Set the selected items
   * @param {Array} indices - The indices of items to select
   */
  setSelectedItems(indices) {
    this.selectedItems = indices.filter(index => index >= 0 && index < this.items.length);
    
    if (this.rendered) {
      this._updateItemSelection();
    }
  }

  /**
   * Set the list items
   * @param {Array} items - The new items
   */
  setItems(items) {
    this.items = items || [];
    this.selectedItems = [];
    
    if (this.rendered) {
      this._renderItems();
    }
  }

  /**
   * Add an item to the list
   * @param {*} item - The item to add
   * @param {number} index - The index to add at (end if not specified)
   * @returns {number} The index of the added item
   */
  addItem(item, index = null) {
    if (index === null || index >= this.items.length) {
      this.items.push(item);
      index = this.items.length - 1;
    } else {
      this.items.splice(index, 0, item);
      
      // Update selected indices
      this.selectedItems = this.selectedItems.map(i => (i >= index ? i + 1 : i));
    }
    
    if (this.rendered) {
      this._renderItems();
    }
    
    return index;
  }

  /**
   * Remove an item from the list
   * @param {number} index - The index of the item to remove
   * @returns {*} The removed item or undefined if not found
   */
  removeItem(index) {
    if (index < 0 || index >= this.items.length) {
      return undefined;
    }
    
    const removedItem = this.items.splice(index, 1)[0];
    
    // Update selected indices
    this.selectedItems = this.selectedItems
      .filter(i => i !== index)
      .map(i => (i > index ? i - 1 : i));
    
    if (this.rendered) {
      this._renderItems();
    }
    
    return removedItem;
  }
}

/**
 * Modal component
 */
export class Modal extends Component {
  /**
   * Create a modal
   * @param {Object} options - Modal options
   */
  constructor(options = {}) {
    super({
      ...options,
      type: ComponentType.MODAL
    });
    
    this.title = options.title || '';
    this.content = options.content || null;
    this.footer = options.footer || null;
    this.closable = options.closable !== undefined ? options.closable : true;
    this.closeOnEscape = options.closeOnEscape !== undefined ? options.closeOnEscape : true;
    this.closeOnBackdropClick = options.closeOnBackdropClick !== undefined ? options.closeOnBackdropClick : true;
    this.width = options.width || null;
    this.height = options.height || null;
    this.onOpen = options.onOpen || null;
    this.onClose = options.onClose || null;
    this.isOpen = false;
    this.backdropElement = null;
    this.modalElement = null;
    this.headerElement = null;
    this.bodyElement = null;
    this.footerElement = null;
    this.closeButton = null;
    this.escapeListener = null;
  }

  /**
   * Create the component's DOM element
   * @returns {HTMLElement} The created element
   * @protected
   */
  _createElement() {
    // Create backdrop
    this.backdropElement = document.createElement('div');
    this.backdropElement.className = 'jct-modal-backdrop';
    this.backdropElement.style.display = 'none';
    
    // Add backdrop click handler
    if (this.closeOnBackdropClick) {
      this.backdropElement.addEventListener('click', (e) => {
        if (e.target === this.backdropElement) {
          this.close();
        }
      });
    }
    
    // Create modal container
    this.modalElement = document.createElement('div');
    this.modalElement.className = 'jct-modal';
    
    // Set dimensions if specified
    if (this.width) {
      this.modalElement.style.width = typeof this.width === 'number' ? `${this.width}px` : this.width;
    }
    
    if (this.height) {
      this.modalElement.style.height = typeof this.height === 'number' ? `${this.height}px` : this.height;
    }
    
    // Create header if title or closable
    if (this.title || this.closable) {
      this.headerElement = document.createElement('div');
      this.headerElement.className = 'jct-modal-header';
      
      // Add title
      if (this.title) {
        const titleElement = document.createElement('h3');
        titleElement.className = 'jct-modal-title';
        titleElement.textContent = this.title;
        this.headerElement.appendChild(titleElement);
      }
      
      // Add close button if closable
      if (this.closable) {
        this.closeButton = document.createElement('button');
        this.closeButton.className = 'jct-modal-close';
        this.closeButton.innerHTML = '×';
        this.closeButton.addEventListener('click', () => this.close());
        this.headerElement.appendChild(this.closeButton);
      }
      
      this.modalElement.appendChild(this.headerElement);
    }
    
    // Create body
    this.bodyElement = document.createElement('div');
    this.bodyElement.className = 'jct-modal-body';
    
    // Add content
    if (this.content) {
      if (this.content instanceof Component) {
        this.content.render(this.bodyElement);
      } else if (typeof this.content === 'string') {
        this.bodyElement.innerHTML = this.content;
      }
    }
    
    this.modalElement.appendChild(this.bodyElement);
    
    // Create footer if provided
    if (this.footer) {
      this.footerElement = document.createElement('div');
      this.footerElement.className = 'jct-modal-footer';
      
      if (Array.isArray(this.footer)) {
        // Array of buttons or components
        for (const item of this.footer) {
          if (item instanceof Component) {
            item.render(this.footerElement);
          } else if (typeof item === 'object') {
            const button = new Button(item);
            button.render(this.footerElement);
          }
        }
      } else if (this.footer instanceof Component) {
        this.footer.render(this.footerElement);
      } else if (typeof this.footer === 'string') {
        this.footerElement.innerHTML = this.footer;
      }
      
      this.modalElement.appendChild(this.footerElement);
    }
    
    this.backdropElement.appendChild(this.modalElement);
    
    return this.backdropElement;
  }

  /**
   * Apply common properties to the element
   * @protected
   */
  _applyCommonProps() {
    super._applyCommonProps();
    
    if (!this.element) return;
    
    // Update modal state
    if (!this.enabled) {
      this.modalElement.classList.add('jct-modal-disabled');
    } else {
      this.modalElement.classList.remove('jct-modal-disabled');
    }
  }

  /**
   * Render children
   * @protected
   */
  _renderChildren() {
    if (!this.bodyElement) return;
    
    for (const child of this.children) {
      child.render(this.bodyElement);
    }
  }

  /**
   * Set up escape key listener
   * @private
   */
  _setupEscapeListener() {
    if (!this.closeOnEscape) return;
    
    this.escapeListener = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        this.close();
      }
    };
    
    document.addEventListener('keydown', this.escapeListener);
  }

  /**
   * Remove escape key listener
   * @private
   */
  _removeEscapeListener() {
    if (this.escapeListener) {
      document.removeEventListener('keydown', this.escapeListener);
      this.escapeListener = null;
    }
  }

  /**
   * Open the modal
   */
  open() {
    if (this.isOpen || !this.element) return;
    
    // Show the modal
    this.element.style.display = 'flex';
    document.body.classList.add('jct-modal-open');
    
    // Set up escape key listener
    this._setupEscapeListener();
    
    this.isOpen = true;
    
    // Call open handler
    if (this.onOpen) {
      this.onOpen({ target: this });
    }
  }

  /**
   * Close the modal
   */
  close() {
    if (!this.isOpen || !this.element) return;
    
    // Hide the modal
    this.element.style.display = 'none';
    document.body.classList.remove('jct-modal-open');
    
    // Remove escape key listener
    this._removeEscapeListener();
    
    this.isOpen = false;
    
    // Call close handler
    if (this.onClose) {
      this.onClose({ target: this });
    }
  }

  /**
   * Set the modal title
   * @param {string} title - The new title
   */
  setTitle(title) {
    this.title = title;
    
    if (this.headerElement) {
      const titleElement = this.headerElement.querySelector('.jct-modal-title');
      
      if (titleElement) {
        titleElement.textContent = title;
      } else if (title) {
        // Create title element if it doesn't exist
        const newTitleElement = document.createElement('h3');
        newTitleElement.className = 'jct-modal-title';
        newTitleElement.textContent = title;
        this.headerElement.insertBefore(newTitleElement, this.headerElement.firstChild);
      }
    }
  }

  /**
   * Set the modal content
   * @param {string|Component} content - The new content
   */
  setContent(content) {
    this.content = content;
    
    if (this.bodyElement) {
      // Clear existing content
      this.bodyElement.innerHTML = '';
      
      // Add new content
      if (content instanceof Component) {
        content.render(this.bodyElement);
      } else if (typeof content === 'string') {
        this.bodyElement.innerHTML = content;
      }
    }
  }

  /**
   * Set the modal footer
   * @param {string|Component|Array} footer - The new footer
   */
  setFooter(footer) {
    this.footer = footer;
    
    if (this.footerElement) {
      // Clear existing footer
      this.footerElement.innerHTML = '';
      
      if (Array.isArray(footer)) {
        // Array of buttons or components
        for (const item of footer) {
          if (item instanceof Component) {
            item.render(this.footerElement);
          } else if (typeof item === 'object') {
            const button = new Button(item);
            button.render(this.footerElement);
          }
        }
      } else if (footer instanceof Component) {
        footer.render(this.footerElement);
      } else if (typeof footer === 'string') {
        this.footerElement.innerHTML = footer;
      }
    }
  }

  /**
   * Destroy the component
   */
  destroy() {
    // Remove escape key listener
    this._removeEscapeListener();
    
    // Remove modal-open class from body if open
    if (this.isOpen) {
      document.body.classList.remove('jct-modal-open');
    }
    
    super.destroy();
  }
}

/**
 * Dialog component
 */
export class Dialog extends Modal {
  /**
   * Create a dialog
   * @param {Object} options - Dialog options
   */
  constructor(options = {}) {
    super({
      ...options,
      type: ComponentType.DIALOG
    });
  }

  /**
   * Apply common properties to the element
   * @protected
   */
  _applyCommonProps() {
    super._applyCommonProps();
    
    if (!this.element) return;
    
    // Add dialog class
    this.element.classList.add('jct-dialog');
    
    if (this.modalElement) {
      this.modalElement.classList.add('jct-dialog-modal');
    }
  }
}

/**
 * Tooltip component
 */
export class Tooltip extends Component {
  /**
   * Create a tooltip
   * @param {Object} options - Tooltip options
   */
  constructor(options = {}) {
    super({
      ...options,
      type: ComponentType.TOOLTIP
    });
    
    this.content = options.content || '';
    this.position = options.position || 'top';
    this.trigger = options.trigger || 'hover';
    this.delay = options.delay !== undefined ? options.delay : 200;
    this.target = options.target || null;
    this.isOpen = false;
    this.tooltipElement = null;
    this.arrowElement = null;
    this.showTimeout = null;
    this.hideTimeout = null;
  }

  /**
   * Create the component's DOM element
   * @returns {HTMLElement} The created element
   * @protected
   */
  _createElement() {
    const tooltip = document.createElement('div');
    tooltip.className = 'jct-tooltip';
    tooltip.style.display = 'none';
    
    // Add position class
    tooltip.classList.add(`jct-tooltip-${this.position}`);
    
    // Create arrow
    this.arrowElement = document.createElement('div');
    this.arrowElement.className = 'jct-tooltip-arrow';
    tooltip.appendChild(this.arrowElement);
    
    // Create content
    const contentElement = document.createElement('div');
    contentElement.className = 'jct-tooltip-content';
    
    if (this.content instanceof Component) {
      this.content.render(contentElement);
    } else if (typeof this.content === 'string') {
      contentElement.textContent = this.content;
    }
    
    tooltip.appendChild(contentElement);
    
    this.tooltipElement = tooltip;
    
    // Attach to target if provided
    if (this.target) {
      this.attachToTarget(this.target);
    }
    
    return tooltip;
  }

  /**
   * Apply common properties to the element
   * @protected
   */
  _applyCommonProps() {
    super._applyCommonProps();
    
    if (!this.element) return;
    
    // Update tooltip state
    if (!this.enabled) {
      this.element.classList.add('jct-tooltip-disabled');
    } else {
      this.element.classList.remove('jct-tooltip-disabled');
    }
  }

  /**
   * Attach the tooltip to a target element
   * @param {HTMLElement|Component} target - The target element
   */
  attachToTarget(target) {
    // Get the target element
    const targetElement = target instanceof Component ? target.element : target;
    
    if (!targetElement || !(targetElement instanceof HTMLElement)) {
      console.error('Invalid tooltip target');
      return;
    }
    
    this.target = targetElement;
    
    // Add event listeners based on trigger
    if (this.trigger === 'hover' || this.trigger === 'both') {
      targetElement.addEventListener('mouseenter', () => this.show());
      targetElement.addEventListener('mouseleave', () => this.hide());
    }
    
    if (this.trigger === 'click' || this.trigger === 'both') {
      targetElement.addEventListener('click', () => this.toggle());
    }
    
    if (this.trigger === 'focus') {
      targetElement.addEventListener('focus', () => this.show());
      targetElement.addEventListener('blur', () => this.hide());
    }
    
    // Add tooltip reference to target
    targetElement._tooltip = this;
  }

  /**
   * Position the tooltip relative to the target
   * @private
   */
  _positionTooltip() {
    if (!this.element || !this.target) return;
    
    const targetRect = this.target.getBoundingClientRect();
    const tooltipRect = this.element.getBoundingClientRect();
    
    let top, left;
    
    switch (this.position) {
      case 'top':
        top = targetRect.top - tooltipRect.height;
        left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'bottom':
        top = targetRect.bottom;
        left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'left':
        top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
        left = targetRect.left - tooltipRect.width;
        break;
      case 'right':
        top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
        left = targetRect.right;
        break;
      default:
        top = targetRect.top - tooltipRect.height;
        left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
    }
    
    // Adjust position to keep tooltip within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    if (left < 0) {
      left = 0;
    } else if (left + tooltipRect.width > viewportWidth) {
      left = viewportWidth - tooltipRect.width;
    }
    
    if (top < 0) {
      top = 0;
    } else if (top + tooltipRect.height > viewportHeight) {
      top = viewportHeight - tooltipRect.height;
    }
    
    // Set position
    this.element.style.top = `${top + window.scrollY}px`;
    this.element.style.left = `${left + window.scrollX}px`;
  }

  /**
   * Show the tooltip
   */
  show() {
    if (this.isOpen || !this.element || !this.enabled) return;
    
    // Clear any pending hide timeout
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
    
    // Set show timeout
    this.showTimeout = setTimeout(() => {
      // Append to body if not already
      if (!this.element.parentNode) {
        document.body.appendChild(this.element);
      }
      
      // Show the tooltip
      this.element.style.display = 'block';
      
      // Position the tooltip
      this._positionTooltip();
      
      this.isOpen = true;
    }, this.delay);
  }

  /**
   * Hide the tooltip
   */
  hide() {
    if (!this.isOpen || !this.element) return;
    
    // Clear any pending show timeout
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = null;
    }
    
    // Set hide timeout
    this.hideTimeout = setTimeout(() => {
      // Hide the tooltip
      this.element.style.display = 'none';
      
      this.isOpen = false;
    }, this.delay);
  }

  /**
   * Toggle the tooltip
   */
  toggle() {
    if (this.isOpen) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Set the tooltip content
   * @param {string|Component} content - The new content
   */
  setContent(content) {
    this.content = content;
    
    if (this.element) {
      const contentElement = this.element.querySelector('.jct-tooltip-content');
      
      if (contentElement) {
        // Clear existing content
        contentElement.innerHTML = '';
        
        // Add new content
        if (content instanceof Component) {
          content.render(contentElement);
        } else if (typeof content === 'string') {
          contentElement.textContent = content;
        }
      }
    }
  }

  /**
   * Set the tooltip position
   * @param {string} position - The new position ('top', 'bottom', 'left', 'right')
   */
  setPosition(position) {
    this.position = position;
    
    if (this.element) {
      // Remove existing position classes
      this.element.classList.remove('jct-tooltip-top', 'jct-tooltip-bottom', 'jct-tooltip-left', 'jct-tooltip-right');
      
      // Add new position class
      this.element.classList.add(`jct-tooltip-${position}`);
      
      // Reposition if open
      if (this.isOpen) {
        this._positionTooltip();
      }
    }
  }

  /**
   * Destroy the component
   */
  destroy() {
    // Clear timeouts
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = null;
    }
    
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
    
    // Remove tooltip reference from target
    if (this.target && this.target._tooltip === this) {
      delete this.target._tooltip;
    }
    
    super.destroy();
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
 * Create a component
 * @param {string} type - The component type
 * @param {Object} options - Component options
 * @returns {Component} A new component instance
 */
export function createComponent(type, options = {}) {
  switch (type) {
    case ComponentType.CONTAINER:
      return new Container(options);
    case ComponentType.PANEL:
      return new Panel(options);
    case ComponentType.CARD:
      return new Card(options);
    case ComponentType.BUTTON:
      return new Button(options);
    case ComponentType.ICON_BUTTON:
      return new IconButton(options);
    case ComponentType.INPUT:
      return new Input(options);
    case ComponentType.SELECT:
      return new Select(options);
    case ComponentType.CHECKBOX:
      return new Checkbox(options);
    case ComponentType.RADIO:
      return new Radio(options);
    case ComponentType.TOGGLE:
      return new Toggle(options);
    case ComponentType.SLIDER:
      return new Slider(options);
    case ComponentType.TABS:
      return new Tabs(options);
    case ComponentType.TABLE:
      return new Table(options);
    case ComponentType.LIST:
      return new List(options);
    case ComponentType.MODAL:
      return new Modal(options);
    case ComponentType.DIALOG:
      return new Dialog(options);
    case ComponentType.TOOLTIP:
      return new Tooltip(options);
    default:
      return new Component(options);
  }
}

// Export the main UI functions and classes
export default {
  createComponent,
  Component,
  Container,
  Panel,
  Card,
  Button,
  IconButton,
  Input,
  Select,
  Checkbox,
  Radio,
  RadioGroup,
  Toggle,
  Slider,
  Tabs,
  Table,
  List,
  Modal,
  Dialog,
  Tooltip,
  ComponentType,
  EventType,
  ComponentSize,
  ComponentVariant
};
