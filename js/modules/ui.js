/**
 * Jesster's Combat Tracker
 * UI Components Module
 * Version 2.3.1
 * 
 * This module provides UI components for building the application interface.
 */

/**
 * Component types
 */
export const ComponentType = {
  CONTAINER: 'container',
  PANEL: 'panel',
  BUTTON: 'button',
  TEXT: 'text',
  HEADING: 'heading',
  INPUT: 'input',
  SELECT: 'select',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
  TOGGLE: 'toggle',
  ICON: 'icon',
  TABLE: 'table',
  TABS: 'tabs',
  CUSTOM: 'custom'
};

/**
 * Component variants
 */
export const ComponentVariant = {
  DEFAULT: 'default',
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  INFO: 'info'
};

/**
 * Base component class
 */
class Component {
  /**
   * Create a component
   * @param {Object} options - Component options
   */
  constructor(options = {}) {
    this.options = options;
    this.element = null;
    this.children = [];
    this.eventListeners = [];
  }

  /**
   * Render the component
   * @param {HTMLElement|Component} parent - Parent element or component
   * @returns {HTMLElement} The rendered element
   */
  render(parent) {
    if (!this.element) {
      this.element = this.createElement();
    }

    const parentElement = parent instanceof Component ? parent.element : parent;
    
    if (parentElement) {
      parentElement.appendChild(this.element);
    }

    this.renderChildren();
    return this.element;
  }

  /**
   * Create the component's DOM element
   * @returns {HTMLElement} The created element
   */
  createElement() {
    const element = document.createElement('div');
    
    if (this.options.className) {
      element.className = this.options.className;
    }
    
    if (this.options.id) {
      element.id = this.options.id;
    }
    
    if (this.options.attributes) {
      Object.entries(this.options.attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
    }
    
    if (this.options.style) {
      Object.entries(this.options.style).forEach(([key, value]) => {
        element.style[key] = value;
      });
    }
    
    return element;
  }

  /**
   * Render child components
   */
  renderChildren() {
    this.children.forEach(child => {
      child.render(this.element);
    });
  }

  /**
   * Add a child component
   * @param {Component} child - Child component
   * @returns {Component} This component for chaining
   */
  addChild(child) {
    this.children.push(child);
    
    if (this.element) {
      child.render(this.element);
    }
    
    return this;
  }

  /**
   * Remove a child component
   * @param {Component} child - Child component to remove
   * @returns {boolean} True if the child was removed
   */
  removeChild(child) {
    const index = this.children.indexOf(child);
    
    if (index !== -1) {
      this.children.splice(index, 1);
      
      if (child.element && child.element.parentNode === this.element) {
        this.element.removeChild(child.element);
      }
      
      return true;
    }
    
    return false;
  }

  /**
   * Find a child element by class name
   * @param {string} className - Class name to find
   * @returns {Component|null} The found component or null
   */
  findChild(className) {
    // Check direct children first
    for (const child of this.children) {
      if (child.element && child.element.classList.contains(className)) {
        return child;
      }
    }
    
    // Check descendants
    for (const child of this.children) {
      const found = child.findChild(className);
      if (found) {
        return found;
      }
    }
    
    return null;
  }

  /**
   * Add an event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   * @returns {Component} This component for chaining
   */
  addEventListener(event, callback) {
    if (this.element) {
      this.element.addEventListener(event, callback);
      this.eventListeners.push({ event, callback });
    }
    
    return this;
  }

  /**
   * Remove an event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   * @returns {Component} This component for chaining
   */
  removeEventListener(event, callback) {
    if (this.element) {
      this.element.removeEventListener(event, callback);
      
      const index = this.eventListeners.findIndex(
        listener => listener.event === event && listener.callback === callback
      );
      
      if (index !== -1) {
        this.eventListeners.splice(index, 1);
      }
    }
    
    return this;
  }

  /**
   * Destroy the component
   */
  destroy() {
    // Remove event listeners
    this.eventListeners.forEach(({ event, callback }) => {
      if (this.element) {
        this.element.removeEventListener(event, callback);
      }
    });
    
    // Destroy children
    this.children.forEach(child => {
      child.destroy();
    });
    
    // Remove from DOM
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    
    // Clear references
    this.element = null;
    this.children = [];
    this.eventListeners = [];
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
      className: `jct-container ${options.className || ''}`.trim(),
      ...options
    });
  }

  /**
   * Create the container element
   * @returns {HTMLElement} The created element
   */
  createElement() {
    const element = super.createElement();
    
    // Apply layout options
    if (this.options.layout) {
      element.classList.add(`jct-layout-${this.options.layout}`);
    }
    
    if (this.options.gap !== undefined) {
      element.style.gap = `${this.options.gap}px`;
    }
    
    if (this.options.padding !== undefined) {
      element.style.padding = `${this.options.padding}px`;
    }
    
    if (this.options.justify) {
      element.style.justifyContent = this._getJustifyValue(this.options.justify);
    }
    
    if (this.options.align) {
      element.style.alignItems = this._getAlignValue(this.options.align);
    }
    
    if (this.options.wrap) {
      element.style.flexWrap = 'wrap';
    }
    
    return element;
  }

  /**
   * Get justify content value
   * @param {string} value - Justify value
   * @returns {string} CSS justify-content value
   * @private
   */
  _getJustifyValue(value) {
    switch (value) {
      case 'start': return 'flex-start';
      case 'end': return 'flex-end';
      case 'center': return 'center';
      case 'between': return 'space-between';
      case 'around': return 'space-around';
      case 'evenly': return 'space-evenly';
      default: return value;
    }
  }

  /**
   * Get align items value
   * @param {string} value - Align value
   * @returns {string} CSS align-items value
   * @private
   */
  _getAlignValue(value) {
    switch (value) {
      case 'start': return 'flex-start';
      case 'end': return 'flex-end';
      case 'center': return 'center';
      case 'stretch': return 'stretch';
      case 'baseline': return 'baseline';
      default: return value;
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
      className: `jct-panel ${options.className || ''}`.trim(),
      ...options
    });
    
    this.headerContainer = null;
    this.contentContainer = null;
    this.collapsed = options.collapsed || false;
  }

  /**
   * Create the panel element
   * @returns {HTMLElement} The created element
   */
  createElement() {
    const element = super.createElement();
    
    // Apply elevation
    if (this.options.elevation !== undefined) {
      element.classList.add(`jct-elevation-${this.options.elevation}`);
    }
    
    // Create header
    this.headerContainer = document.createElement('div');
    this.headerContainer.className = 'jct-panel-header';
    
    // Create title
    if (this.options.title) {
      const title = document.createElement('h2');
      title.className = 'jct-panel-title';
      title.textContent = this.options.title;
      this.headerContainer.appendChild(title);
    }
    
    // Create header actions
    if (this.options.headerActions && this.options.headerActions.length > 0) {
      const actionsContainer = document.createElement('div');
      actionsContainer.className = 'jct-panel-actions';
      
      this.options.headerActions.forEach(action => {
        const button = document.createElement('button');
        button.className = 'jct-panel-action';
        button.innerHTML = action.icon || '';
        button.title = action.title || '';
        button.addEventListener('click', action.onClick);
        actionsContainer.appendChild(button);
      });
      
      this.headerContainer.appendChild(actionsContainer);
    }
    
    // Add collapse button if collapsible
    if (this.options.collapsible) {
      const collapseButton = document.createElement('button');
      collapseButton.className = 'jct-panel-collapse';
      collapseButton.innerHTML = this.collapsed 
        ? '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>'
        : '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>';
      
      collapseButton.addEventListener('click', () => this.toggleCollapse());
      this.headerContainer.appendChild(collapseButton);
    }
    
    element.appendChild(this.headerContainer);
    
    // Create content container
    this.contentContainer = document.createElement('div');
    this.contentContainer.className = 'jct-panel-content';
    
    if (this.collapsed) {
      this.contentContainer.style.display = 'none';
    }
    
    element.appendChild(this.contentContainer);
    
    return element;
  }

  /**
   * Toggle panel collapse state
   */
  toggleCollapse() {
    this.collapsed = !this.collapsed;
    
    if (this.contentContainer) {
      this.contentContainer.style.display = this.collapsed ? 'none' : '';
    }
    
    // Update collapse button icon
    const collapseButton = this.element.querySelector('.jct-panel-collapse');
    if (collapseButton) {
      collapseButton.innerHTML = this.collapsed 
        ? '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>'
        : '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>';
    }
  }

  /**
   * Render child components
   */
  renderChildren() {
    this.children.forEach(child => {
      child.render(this.contentContainer);
    });
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
      className: `jct-button ${options.className || ''}`.trim(),
      ...options
    });
  }

  /**
   * Create the button element
   * @returns {HTMLElement} The created element
   */
  createElement() {
    const element = document.createElement('button');
    
    if (this.options.className) {
      element.className = this.options.className;
    }
    
    if (this.options.id) {
      element.id = this.options.id;
    }
    
    if (this.options.disabled) {
      element.disabled = true;
    }
    
    if (this.options.variant) {
      element.classList.add(`jct-button-${this.options.variant}`);
    }
    
    // Create button content
    const contentContainer = document.createElement('span');
    contentContainer.className = 'jct-button-content';
    
    if (this.options.icon) {
      const iconContainer = document.createElement('span');
      iconContainer.className = 'jct-button-icon';
      iconContainer.innerHTML = this.options.icon;
      contentContainer.appendChild(iconContainer);
    }
    
    if (this.options.label) {
      const labelContainer = document.createElement('span');
      labelContainer.className = 'jct-button-label';
      labelContainer.textContent = this.options.label;
      contentContainer.appendChild(labelContainer);
    }
    
    element.appendChild(contentContainer);
    
    // Add click handler
    if (this.options.onClick) {
      element.addEventListener('click', this.options.onClick);
      this.eventListeners.push({ event: 'click', callback: this.options.onClick });
    }
    
    return element;
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
      className: `jct-modal ${options.className || ''}`.trim(),
      ...options
    });
    
    this.isOpen = false;
    this.backdropElement = null;
    this.modalElement = null;
    this.headerElement = null;
    this.contentElement = null;
    this.footerElement = null;
  }

  /**
   * Create the modal element
   * @returns {HTMLElement} The created element
   */
  createElement() {
    // Create modal container
    const element = super.createElement();
    element.style.display = 'none';
    
    // Create backdrop
    this.backdropElement = document.createElement('div');
    this.backdropElement.className = 'jct-modal-backdrop';
    
    if (this.options.closeOnBackdropClick !== false) {
      this.backdropElement.addEventListener('click', (e) => {
        if (e.target === this.backdropElement) {
          this.close();
        }
      });
    }
    
    element.appendChild(this.backdropElement);
    
    // Create modal dialog
    this.modalElement = document.createElement('div');
    this.modalElement.className = 'jct-modal-dialog';
    
    if (this.options.width) {
      this.modalElement.style.width = `${this.options.width}px`;
    }
    
    if (this.options.height) {
      this.modalElement.style.height = `${this.options.height}px`;
    }
    
    // Create header
    this.headerElement = document.createElement('div');
    this.headerElement.className = 'jct-modal-header';
    
    if (this.options.title) {
      const title = document.createElement('h2');
      title.className = 'jct-modal-title';
      title.textContent = this.options.title;
      this.headerElement.appendChild(title);
    }
    
    if (this.options.closable !== false) {
      const closeButton = document.createElement('button');
      closeButton.className = 'jct-modal-close';
      closeButton.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
      closeButton.addEventListener('click', () => this.close());
      this.headerElement.appendChild(closeButton);
    }
    
    this.modalElement.appendChild(this.headerElement);
    
    // Create content
    this.contentElement = document.createElement('div');
    this.contentElement.className = 'jct-modal-content';
    
    if (typeof this.options.content === 'string') {
      this.contentElement.innerHTML = this.options.content;
    } else if (this.options.content instanceof Component) {
      this.options.content.render(this.contentElement);
    }
    
    this.modalElement.appendChild(this.contentElement);
    
    // Create footer if needed
    if (this.options.footer && this.options.footer.length > 0) {
      this.footerElement = document.createElement('div');
      this.footerElement.className = 'jct-modal-footer';
      
      this.options.footer.forEach(button => {
        const buttonElement = new Button({
          label: button.label,
          variant: button.variant,
          onClick: button.onClick
        });
        
        buttonElement.render(this.footerElement);
      });
      
      this.modalElement.appendChild(this.footerElement);
    }
    
    this.backdropElement.appendChild(this.modalElement);
    
    // Set up keyboard events
    if (this.options.closeOnEscape !== false) {
      document.addEventListener('keydown', this._handleKeyDown);
      this.eventListeners.push({ 
        event: 'keydown', 
        callback: this._handleKeyDown,
        target: document
      });
    }
    
    return element;
  }

  /**
   * Handle keydown events
   * @param {KeyboardEvent} e - Keyboard event
   * @private
   */
  _handleKeyDown = (e) => {
    if (e.key === 'Escape' && this.isOpen) {
      this.close();
    }
  }

  /**
   * Open the modal
   */
  open() {
    if (this.element) {
      this.element.style.display = '';
      this.isOpen = true;
      
      // Add class to body to prevent scrolling
      document.body.classList.add('jct-modal-open');
      
      // Focus the first focusable element
      setTimeout(() => {
        const focusable = this.modalElement.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusable.length > 0) {
          focusable[0].focus();
        }
      }, 0);
    }
  }

  /**
   * Close the modal
   */
  close() {
    if (this.element) {
      this.element.style.display = 'none';
      this.isOpen = false;
      
      // Remove class from body
      document.body.classList.remove('jct-modal-open');
    }
  }

  /**
   * Set modal content
   * @param {string|Component} content - Modal content
   */
  setContent(content) {
    if (this.contentElement) {
      this.contentElement.innerHTML = '';
      
      if (typeof content === 'string') {
        this.contentElement.innerHTML = content;
      } else if (content instanceof Component) {
        content.render(this.contentElement);
      }
    }
  }

  /**
   * Destroy the modal
   */
  destroy() {
    // Remove document event listeners
    this.eventListeners.forEach(({ event, callback, target }) => {
      if (target) {
        target.removeEventListener(event, callback);
      }
    });
    
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
      className: `jct-dialog ${options.className || ''}`.trim(),
      ...options
    });
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
      className: `jct-input-container ${options.className || ''}`.trim(),
      ...options
    });
    
    this.inputElement = null;
  }

  /**
   * Create the input element
   * @returns {HTMLElement} The created element
   */
  createElement() {
    const element = super.createElement();
    
    // Create label if provided
    if (this.options.label) {
      const label = document.createElement('label');
      label.className = 'jct-input-label';
      label.textContent = this.options.label;
      
      if (this.options.id) {
        label.htmlFor = this.options.id;
      }
      
      element.appendChild(label);
    }
    
    // Create input wrapper
    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'jct-input-wrapper';
    
    // Create input element
    if (this.options.inputType === 'textarea') {
      this.inputElement = document.createElement('textarea');
    } else {
      this.inputElement = document.createElement('input');
      this.inputElement.type = this.options.inputType || 'text';
    }
    
    this.inputElement.className = 'jct-input';
    
    if (this.options.id) {
      this.inputElement.id = this.options.id;
    }
    
    if (this.options.name) {
      this.inputElement.name = this.options.name;
    }
    
    if (this.options.value !== undefined) {
      this.inputElement.value = this.options.value;
    }
    
    if (this.options.placeholder) {
      this.inputElement.placeholder = this.options.placeholder;
    }
    
    if (this.options.required) {
      this.inputElement.required = true;
    }
    
    if (this.options.disabled) {
      this.inputElement.disabled = true;
    }
    
    if (this.options.min !== undefined) {
      this.inputElement.min = this.options.min;
    }
    
    if (this.options.max !== undefined) {
      this.inputElement.max = this.options.max;
    }
    
    if (this.options.step !== undefined) {
      this.inputElement.step = this.options.step;
    }
    
    if (this.options.pattern) {
      this.inputElement.pattern = this.options.pattern;
    }
    
    // Add event listeners
    if (this.options.onChange) {
      this.inputElement.addEventListener('change', this.options.onChange);
      this.eventListeners.push({ event: 'change', callback: this.options.onChange });
    }
    
    if (this.options.onInput) {
      this.inputElement.addEventListener('input', this.options.onInput);
      this.eventListeners.push({ event: 'input', callback: this.options.onInput });
    }
    
    if (this.options.onFocus) {
      this.inputElement.addEventListener('focus', this.options.onFocus);
      this.eventListeners.push({ event: 'focus', callback: this.options.onFocus });
    }
    
    if (this.options.onBlur) {
      this.inputElement.addEventListener('blur', this.options.onBlur);
      this.eventListeners.push({ event: 'blur', callback: this.options.onBlur });
    }
    
    inputWrapper.appendChild(this.inputElement);
    
    // Add icon if provided
    if (this.options.icon) {
      const iconContainer = document.createElement('div');
      iconContainer.className = 'jct-input-icon';
      iconContainer.innerHTML = this.options.icon;
      inputWrapper.appendChild(iconContainer);
    }
    
    element.appendChild(inputWrapper);
    
    // Add help text if provided
    if (this.options.helpText) {
      const helpText = document.createElement('div');
      helpText.className = 'jct-input-help';
      helpText.textContent = this.options.helpText;
      element.appendChild(helpText);
    }
    
    return element;
  }

  /**
   * Get input value
   * @returns {string} The input value
   */
  getValue() {
    return this.inputElement ? this.inputElement.value : '';
  }

  /**
   * Set input value
   * @param {string} value - The value to set
   */
  setValue(value) {
    if (this.inputElement) {
      this.inputElement.value = value;
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
      className: `jct-select-container ${options.className || ''}`.trim(),
      ...options
    });
    
    this.selectElement = null;
  }

  /**
   * Create the select element
   * @returns {HTMLElement} The created element
   */
  createElement() {
    const element = super.createElement();
    
    // Create label if provided
    if (this.options.label) {
      const label = document.createElement('label');
      label.className = 'jct-select-label';
      label.textContent = this.options.label;
      
      if (this.options.id) {
        label.htmlFor = this.options.id;
      }
      
      element.appendChild(label);
    }
    
    // Create select wrapper
    const selectWrapper = document.createElement('div');
    selectWrapper.className = 'jct-select-wrapper';
    
    // Create select element
    this.selectElement = document.createElement('select');
    this.selectElement.className = 'jct-select';
    
    if (this.options.id) {
      this.selectElement.id = this.options.id;
    }
    
    if (this.options.name) {
      this.selectElement.name = this.options.name;
    }
    
    if (this.options.required) {
      this.selectElement.required = true;
    }
    
    if (this.options.disabled) {
      this.selectElement.disabled = true;
    }
    
    if (this.options.multiple) {
      this.selectElement.multiple = true;
    }
    
    // Add options
    if (this.options.options && Array.isArray(this.options.options)) {
      this.options.options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        
        if (option.disabled) {
          optionElement.disabled = true;
        }
        
        if (this.options.value !== undefined && option.value === this.options.value) {
          optionElement.selected = true;
        }
        
        this.selectElement.appendChild(optionElement);
      });
    }
    
    // Add event listeners
    if (this.options.onChange) {
      this.selectElement.addEventListener('change', this.options.onChange);
      this.eventListeners.push({ event: 'change', callback: this.options.onChange });
    }
    
    selectWrapper.appendChild(this.selectElement);
    
    // Add dropdown icon
    const iconContainer = document.createElement('div');
    iconContainer.className = 'jct-select-icon';
    iconContainer.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>';
    selectWrapper.appendChild(iconContainer);
    
    element.appendChild(selectWrapper);
    
    // Add help text if provided
    if (this.options.helpText) {
      const helpText = document.createElement('div');
      helpText.className = 'jct-select-help';
      helpText.textContent = this.options.helpText;
      element.appendChild(helpText);
    }
    
    return element;
  }

  /**
   * Get select value
   * @returns {string|string[]} The select value(s)
   */
  getValue() {
    if (!this.selectElement) {
      return this.options.multiple ? [] : '';
    }
    
    if (this.options.multiple) {
      return Array.from(this.selectElement.selectedOptions).map(option => option.value);
    }
    
    return this.selectElement.value;
  }

  /**
   * Set select value
   * @param {string|string[]} value - The value(s) to set
   */
  setValue(value) {
    if (!this.selectElement) {
      return;
    }
    
    if (this.options.multiple && Array.isArray(value)) {
      Array.from(this.selectElement.options).forEach(option => {
        option.selected = value.includes(option.value);
      });
    } else {
      this.selectElement.value = value;
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
      className: `jct-toggle-container ${options.className || ''}`.trim(),
      ...options
    });
    
    this.inputElement = null;
  }

  /**
 * Create the toggle element
 * @returns {HTMLElement} The created element
 */
createElement() {
  const element = super.createElement();
  
  // Create label container
  const label = document.createElement('label');
  label.className = 'jct-toggle-label';
  
  // Create input element
  this.inputElement = document.createElement('input');
  this.inputElement.type = 'checkbox';
  this.inputElement.className = 'jct-toggle-input';
  
  if (this.options.id) {
    this.inputElement.id = this.options.id;
  }
  
  if (this.options.name) {
    this.inputElement.name = this.options.name;
  }
  
  if (this.options.checked) {
    this.inputElement.checked = true;
  }
  
  if (this.options.disabled) {
    this.inputElement.disabled = true;
  }
  
  // Add event listeners
  if (this.options.onChange) {
    this.inputElement.addEventListener('change', (e) => {
      this.options.onChange({
        checked: this.inputElement.checked,
        target: this.inputElement
      });
    });
    
    this.eventListeners.push({ 
      event: 'change', 
      callback: this.options.onChange 
    });
  }
  
  label.appendChild(this.inputElement);
  
  // Create toggle track and thumb
  const track = document.createElement('span');
  track.className = 'jct-toggle-track';
  
  const thumb = document.createElement('span');
  thumb.className = 'jct-toggle-thumb';
  
  track.appendChild(thumb);
  label.appendChild(track);
  
  // Add label text if provided
  if (this.options.label) {
    const text = document.createElement('span');
    text.className = 'jct-toggle-text';
    text.textContent = this.options.label;
    label.appendChild(text);
  }
  
  element.appendChild(label);
  
  return element;
}

/**
 * Get toggle checked state
 * @returns {boolean} The checked state
 */
isChecked() {
  return this.inputElement ? this.inputElement.checked : false;
}

/**
 * Set toggle checked state
 * @param {boolean} checked - The checked state to set
 */
setChecked(checked) {
  if (this.inputElement) {
    this.inputElement.checked = checked;
  }
}
}

/**
 * Radio group component
 */
export class RadioGroup extends Component {
/**
 * Create a radio group
 * @param {Object} options - Radio group options
 */
constructor(options = {}) {
  super({
    className: `jct-radio-group ${options.className || ''}`.trim(),
    ...options
  });
  
  this.radioElements = [];
}

/**
 * Create the radio group element
 * @returns {HTMLElement} The created element
 */
createElement() {
  const element = super.createElement();
  
  // Create label if provided
  if (this.options.label) {
    const label = document.createElement('div');
    label.className = 'jct-radio-group-label';
    label.textContent = this.options.label;
    element.appendChild(label);
  }
  
  // Create radio container
  const radioContainer = document.createElement('div');
  radioContainer.className = `jct-radio-container jct-layout-${this.options.layout || 'vertical'}`;
  
  // Add radio options
  if (this.options.options && Array.isArray(this.options.options)) {
    this.options.options.forEach((option, index) => {
      const radioWrapper = document.createElement('label');
      radioWrapper.className = 'jct-radio-wrapper';
      
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.className = 'jct-radio-input';
      radio.name = this.options.name;
      radio.value = option.value;
      
      if (this.options.id) {
        radio.id = `${this.options.id}-${index}`;
      }
      
      if (this.options.value === option.value) {
        radio.checked = true;
      }
      
      if (option.disabled) {
        radio.disabled = true;
      }
      
      // Add event listeners
      if (this.options.onChange) {
        radio.addEventListener('change', (e) => {
          if (radio.checked) {
            this.options.onChange({
              value: radio.value,
              target: radio
            });
          }
        });
        
        this.eventListeners.push({ 
          event: 'change', 
          callback: this.options.onChange 
        });
      }
      
      this.radioElements.push(radio);
      
      // Create radio custom appearance
      const radioMark = document.createElement('span');
      radioMark.className = 'jct-radio-mark';
      
      // Add label text
      const text = document.createElement('span');
      text.className = 'jct-radio-text';
      text.textContent = option.label;
      
      radioWrapper.appendChild(radio);
      radioWrapper.appendChild(radioMark);
      radioWrapper.appendChild(text);
      
      radioContainer.appendChild(radioWrapper);
    });
  }
  
  element.appendChild(radioContainer);
  
  return element;
}

/**
 * Get selected value
 * @returns {string} The selected value
 */
getValue() {
  const checkedRadio = this.radioElements.find(radio => radio.checked);
  return checkedRadio ? checkedRadio.value : '';
}

/**
 * Set selected value
 * @param {string} value - The value to select
 */
setValue(value) {
  this.radioElements.forEach(radio => {
    radio.checked = radio.value === value;
  });
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
    className: `jct-table-container ${options.className || ''}`.trim(),
    ...options
  });
  
  this.tableElement = null;
  this.tbodyElement = null;
  this.sortColumn = options.sortColumn || '';
  this.sortDirection = options.sortDirection || 'asc';
}

/**
 * Create the table element
 * @returns {HTMLElement} The created element
 */
createElement() {
  const element = super.createElement();
  
  // Create table element
  this.tableElement = document.createElement('table');
  this.tableElement.className = 'jct-table';
  
  // Create table header
  if (this.options.columns && Array.isArray(this.options.columns)) {
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    this.options.columns.forEach(column => {
      const th = document.createElement('th');
      
      if (column.width) {
        th.style.width = column.width;
      }
      
      // Create header content
      const headerContent = document.createElement('div');
      headerContent.className = 'jct-table-header-content';
      headerContent.textContent = column.label;
      
      // Add sort indicator if sortable
      if (this.options.sortable && column.field) {
        th.classList.add('jct-sortable');
        
        if (column.field === this.sortColumn) {
          th.classList.add(`jct-sort-${this.sortDirection}`);
        }
        
        const sortIcon = document.createElement('span');
        sortIcon.className = 'jct-sort-icon';
        sortIcon.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>';
        headerContent.appendChild(sortIcon);
        
        // Add click handler for sorting
        th.addEventListener('click', () => this._handleSort(column.field));
      }
      
      th.appendChild(headerContent);
      headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    this.tableElement.appendChild(thead);
  }
  
  // Create table body
  this.tbodyElement = document.createElement('tbody');
  this._renderRows();
  this.tableElement.appendChild(this.tbodyElement);
  
  element.appendChild(this.tableElement);
  
  return element;
}

/**
 * Render table rows
 * @private
 */
_renderRows() {
  if (!this.tbodyElement) return;
  
  // Clear existing rows
  this.tbodyElement.innerHTML = '';
  
  // Get sorted data
  let data = this.options.data || [];
  
  if (this.options.sortable && this.sortColumn) {
    data = [...data].sort((a, b) => {
      const aValue = a[this.sortColumn];
      const bValue = b[this.sortColumn];
      
      if (aValue === bValue) return 0;
      
      const direction = this.sortDirection === 'asc' ? 1 : -1;
      
      if (aValue === null || aValue === undefined) return direction;
      if (bValue === null || bValue === undefined) return -direction;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * direction;
      }
      
      return (aValue < bValue ? -1 : 1) * direction;
    });
  }
  
  // Render rows
  data.forEach((rowData, rowIndex) => {
    const row = document.createElement('tr');
    
    if (this.options.onRowClick) {
      row.classList.add('jct-clickable');
      row.addEventListener('click', () => this.options.onRowClick(rowData, rowIndex));
    }
    
    this.options.columns.forEach(column => {
      const cell = document.createElement('td');
      
      // Format cell value
      let value = rowData[column.field];
      
      if (column.formatter && typeof column.formatter === 'function') {
        value = column.formatter(value, rowData);
      }
      
      cell.textContent = value !== undefined && value !== null ? value : '';
      
      row.appendChild(cell);
    });
    
    this.tbodyElement.appendChild(row);
  });
  
  // Add empty state if no data
  if (data.length === 0) {
    const emptyRow = document.createElement('tr');
    const emptyCell = document.createElement('td');
    emptyCell.colSpan = this.options.columns.length;
    emptyCell.className = 'jct-table-empty';
    emptyCell.textContent = this.options.emptyText || 'No data available';
    emptyRow.appendChild(emptyCell);
    this.tbodyElement.appendChild(emptyRow);
  }
}

/**
 * Handle column sort
 * @param {string} column - Column field to sort by
 * @private
 */
_handleSort(column) {
  if (this.sortColumn === column) {
    // Toggle direction
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    // New sort column
    this.sortColumn = column;
    this.sortDirection = 'asc';
  }
  
  // Update sort indicators
  if (this.tableElement) {
    const headers = this.tableElement.querySelectorAll('th');
    
    headers.forEach(header => {
      header.classList.remove('jct-sort-asc', 'jct-sort-desc');
    });
    
    const activeHeader = Array.from(headers).find(
      header => header.textContent.includes(
        this.options.columns.find(col => col.field === column)?.label
      )
    );
    
    if (activeHeader) {
      activeHeader.classList.add(`jct-sort-${this.sortDirection}`);
    }
  }
  
  // Re-render rows with new sort
  this._renderRows();
}

/**
 * Set table data
 * @param {Array} data - Table data
 */
setData(data) {
  this.options.data = data;
  this._renderRows();
}
}

/**
 * Tabs component
 */
export class Tabs extends Component {
/**
 * Create tabs
 * @param {Object} options - Tabs options
 */
constructor(options = {}) {
  super({
    className: `jct-tabs-container ${options.className || ''}`.trim(),
    ...options
  });
  
  this.activeTab = options.activeTab || 0;
  this.tabButtons = [];
  this.tabPanels = [];
}

/**
 * Create the tabs element
 * @returns {HTMLElement} The created element
 */
createElement() {
  const element = super.createElement();
  
  // Create tabs header
  const tabsHeader = document.createElement('div');
  tabsHeader.className = 'jct-tabs-header';
  
  // Create tab buttons
  if (this.options.tabs && Array.isArray(this.options.tabs)) {
    this.options.tabs.forEach((tab, index) => {
      const tabButton = document.createElement('button');
      tabButton.className = 'jct-tab-button';
      tabButton.textContent = tab.label;
      
      if (index === this.activeTab) {
        tabButton.classList.add('jct-active');
      }
      
      tabButton.addEventListener('click', () => this.setActiveTab(index));
      
      this.tabButtons.push(tabButton);
      tabsHeader.appendChild(tabButton);
    });
  }
  
  element.appendChild(tabsHeader);
  
  // Create tab content
  const tabsContent = document.createElement('div');
  tabsContent.className = 'jct-tabs-content';
  
  // Create tab panels
  if (this.options.tabs && Array.isArray(this.options.tabs)) {
    this.options.tabs.forEach((tab, index) => {
      const tabPanel = document.createElement('div');
      tabPanel.className = 'jct-tab-panel';
      
      if (index !== this.activeTab) {
        tabPanel.style.display = 'none';
      }
      
      if (typeof tab.content === 'string') {
        tabPanel.innerHTML = tab.content;
      } else if (tab.content instanceof Component) {
        tab.content.render(tabPanel);
      }
      
      this.tabPanels.push(tabPanel);
      tabsContent.appendChild(tabPanel);
    });
  }
  
  element.appendChild(tabsContent);
  
  return element;
}

/**
 * Set active tab
 * @param {number} index - Tab index to activate
 */
setActiveTab(index) {
  if (index < 0 || index >= this.tabButtons.length) {
    return;
  }
  
  // Update active tab
  this.activeTab = index;
  
  // Update tab buttons
  this.tabButtons.forEach((button, i) => {
    if (i === index) {
      button.classList.add('jct-active');
    } else {
      button.classList.remove('jct-active');
    }
  });
  
  // Update tab panels
  this.tabPanels.forEach((panel, i) => {
    if (i === index) {
      panel.style.display = '';
    } else {
      panel.style.display = 'none';
    }
  });
  
  // Call onChange callback if provided
  if (this.options.onChange) {
    this.options.onChange(index);
  }
}
}

/**
 * Create a component based on type
 * @param {string} type - Component type
 * @param {Object} options - Component options
 * @returns {Component} The created component
 */
export function createComponent(type, options = {}) {
switch (type) {
  case ComponentType.CONTAINER:
    return new Container(options);
  case ComponentType.PANEL:
    return new Panel(options);
  case ComponentType.BUTTON:
    return new Button(options);
  case ComponentType.INPUT:
    return new Input(options);
  case ComponentType.SELECT:
    return new Select(options);
  case ComponentType.TOGGLE:
    return new Toggle(options);
  case ComponentType.RADIO:
    return new RadioGroup(options);
  case ComponentType.TABLE:
    return new Table(options);
  case ComponentType.TABS:
    return new Tabs(options);
  case ComponentType.TEXT:
    const textComponent = new Component({
      className: `jct-text ${options.className || ''}`.trim(),
      ...options
    });
    
    const originalCreateElement = textComponent.createElement.bind(textComponent);
    textComponent.createElement = () => {
      const element = originalCreateElement();
      element.textContent = options.text || '';
      return element;
    };
    
    return textComponent;
  case ComponentType.HEADING:
    const headingComponent = new Component({
      className: `jct-heading jct-heading-${options.level || 2} ${options.className || ''}`.trim(),
      ...options
    });
    
    const originalHeadingCreateElement = headingComponent.createElement.bind(headingComponent);
    headingComponent.createElement = () => {
      const element = document.createElement(`h${options.level || 2}`);
      
      if (headingComponent.options.className) {
        element.className = headingComponent.options.className;
      }
      
      if (headingComponent.options.id) {
        element.id = headingComponent.options.id;
      }
      
      element.textContent = options.text || '';
      
      return element;
    };
    
    return headingComponent;
  case ComponentType.ICON:
    const iconComponent = new Component({
      className: `jct-icon ${options.className || ''}`.trim(),
      ...options
    });
    
    const originalIconCreateElement = iconComponent.createElement.bind(iconComponent);
    iconComponent.createElement = () => {
      const element = originalIconCreateElement();
      element.innerHTML = options.icon || '';
      return element;
    };
    
    return iconComponent;
  case ComponentType.CUSTOM:
    return new Component(options);
  default:
    return new Component(options);
}
}

export default {
Component,
Container,
Panel,
Button,
Modal,
Dialog,
Input,
Select,
Toggle,
RadioGroup,
Table,
Tabs,
createComponent,
ComponentType,
ComponentVariant
};
