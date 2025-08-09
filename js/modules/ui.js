/**
 * UI module for Jesster's Combat Tracker
 * Handles user interface components
 */
class UI {
    constructor(settings) {
        // Store reference to settings module
        this.settings = settings;
        
        // UI elements
        this.elements = {};
        
        // Modal stack
        this.modalStack = [];
        
        // Toast notifications
        this.toasts = [];
        this.toastContainer = null;
        
        // Drag state
        this.dragState = {
            dragging: false,
            element: null,
            offsetX: 0,
            offsetY: 0
        };
        
        // Resize state
        this.resizeState = {
            resizing: false,
            element: null,
            startWidth: 0,
            startHeight: 0,
            startX: 0,
            startY: 0
        };
        
        // Event listeners
        this.eventListeners = {};
        
        console.log("UI module initialized");
    }

    /**
     * Initialize UI
     */
    init() {
        // Create toast container
        this._createToastContainer();
        
        // Add global event listeners
        this._addGlobalEventListeners();
        
        // Apply settings
        this.applySettings();
    }

    /**
     * Create toast container
     * @private
     */
    _createToastContainer() {
        // Create container if it doesn't exist
        if (!this.toastContainer) {
            this.toastContainer = document.createElement('div');
            this.toastContainer.className = 'toast-container';
            document.body.appendChild(this.toastContainer);
        }
    }

    /**
     * Add global event listeners
     * @private
     */
    _addGlobalEventListeners() {
        // Document click listener for closing dropdowns
        document.addEventListener('click', (event) => {
            const dropdowns = document.querySelectorAll('.dropdown.active');
            dropdowns.forEach(dropdown => {
                if (!dropdown.contains(event.target)) {
                    dropdown.classList.remove('active');
                }
            });
        });
        
        // Escape key listener for closing modals
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.modalStack.length > 0) {
                this.closeModal();
            }
        });
        
        // Window resize listener
        window.addEventListener('resize', () => {
            this._triggerEvent('windowResize');
        });
    }

    /**
     * Apply settings to UI
     */
    applySettings() {
        // Apply theme
        this.applyTheme();
        
        // Apply font size
        this.applyFontSize();
    }

    /**
     * Apply theme
     */
    applyTheme() {
        const theme = this.settings.getTheme();
        const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        
        // Set data-theme attribute on document element
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        
        // Add/remove dark-theme class on body
        if (isDark) {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    }

    /**
     * Apply font size
     */
    applyFontSize() {
        const fontSize = this.settings.getFontSize();
        
        // Remove existing font size classes
        document.body.classList.remove('font-small', 'font-medium', 'font-large');
        
        // Add new font size class
        document.body.classList.add(`font-${fontSize}`);
    }

    /**
     * Get element by ID
     * @param {string} id - Element ID
     * @returns {HTMLElement} Element
     */
    getElement(id) {
        // Check if element is already cached
        if (this.elements[id]) {
            return this.elements[id];
        }
        
        // Get element
        const element = document.getElementById(id);
        
        // Cache element
        if (element) {
            this.elements[id] = element;
        }
        
        return element;
    }

    /**
     * Create element
     * @param {string} tag - Element tag
     * @param {Object} options - Element options
     * @param {string} options.id - Element ID
     * @param {string|Array} options.className - Element class name(s)
     * @param {Object} options.attributes - Element attributes
     * @param {Object} options.style - Element style
     * @param {string|HTMLElement} options.content - Element content
     * @param {Array} options.children - Element children
     * @returns {HTMLElement} Created element
     */
    createElement(tag, options = {}) {
        // Create element
        const element = document.createElement(tag);
        
        // Set ID
        if (options.id) {
            element.id = options.id;
            this.elements[options.id] = element;
        }
        
        // Set class name
        if (options.className) {
            if (Array.isArray(options.className)) {
                element.className = options.className.join(' ');
            } else {
                element.className = options.className;
            }
        }
        
        // Set attributes
        if (options.attributes) {
            Object.entries(options.attributes).forEach(([key, value]) => {
                element.setAttribute(key, value);
            });
        }
        
        // Set style
        if (options.style) {
            Object.entries(options.style).forEach(([key, value]) => {
                element.style[key] = value;
            });
        }
        
        // Set content
        if (options.content) {
            if (typeof options.content === 'string') {
                element.innerHTML = options.content;
            } else {
                element.appendChild(options.content);
            }
        }
        
        // Add children
        if (options.children) {
            options.children.forEach(child => {
                element.appendChild(child);
            });
        }
        
        return element;
    }

    /**
     * Show element
     * @param {string|HTMLElement} element - Element ID or element
     */
    showElement(element) {
        // Get element
        const el = typeof element === 'string' ? this.getElement(element) : element;
        
        // Show element
        if (el) {
            el.style.display = '';
        }
    }

    /**
     * Hide element
     * @param {string|HTMLElement} element - Element ID or element
     */
    hideElement(element) {
        // Get element
        const el = typeof element === 'string' ? this.getElement(element) : element;
        
        // Hide element
        if (el) {
            el.style.display = 'none';
        }
    }

    /**
     * Toggle element
     * @param {string|HTMLElement} element - Element ID or element
     * @returns {boolean} New visibility state
     */
    toggleElement(element) {
        // Get element
        const el = typeof element === 'string' ? this.getElement(element) : element;
        
        // Toggle element
        if (el) {
            const isHidden = el.style.display === 'none';
            el.style.display = isHidden ? '' : 'none';
            return isHidden;
        }
        
        return false;
    }

    /**
     * Add class to element
     * @param {string|HTMLElement} element - Element ID or element
     * @param {string} className - Class name
     */
    addClass(element, className) {
        // Get element
        const el = typeof element === 'string' ? this.getElement(element) : element;
        
        // Add class
        if (el) {
            el.classList.add(className);
        }
    }

    /**
     * Remove class from element
     * @param {string|HTMLElement} element - Element ID or element
     * @param {string} className - Class name
     */
    removeClass(element, className) {
        // Get element
        const el = typeof element === 'string' ? this.getElement(element) : element;
        
        // Remove class
        if (el) {
            el.classList.remove(className);
        }
    }

    /**
     * Toggle class on element
     * @param {string|HTMLElement} element - Element ID or element
     * @param {string} className - Class name
     * @returns {boolean} New class state
     */
    toggleClass(element, className) {
        // Get element
        const el = typeof element === 'string' ? this.getElement(element) : element;
        
        // Toggle class
        if (el) {
            return el.classList.toggle(className);
        }
        
        return false;
    }

    /**
     * Set element content
     * @param {string|HTMLElement} element - Element ID or element
     * @param {string|HTMLElement} content - Content
     */
    setContent(element, content) {
        // Get element
        const el = typeof element === 'string' ? this.getElement(element) : element;
        
        // Set content
        if (el) {
            if (typeof content === 'string') {
                el.innerHTML = content;
            } else {
                el.innerHTML = '';
                el.appendChild(content);
            }
        }
    }

    /**
     * Append content to element
     * @param {string|HTMLElement} element - Element ID or element
     * @param {string|HTMLElement} content - Content
     */
    appendContent(element, content) {
        // Get element
        const el = typeof element === 'string' ? this.getElement(element) : element;
        
        // Append content
        if (el) {
            if (typeof content === 'string') {
                el.innerHTML += content;
            } else {
                el.appendChild(content);
            }
        }
    }

    /**
     * Clear element content
     * @param {string|HTMLElement} element - Element ID or element
     */
    clearContent(element) {
        // Get element
        const el = typeof element === 'string' ? this.getElement(element) : element;
        
        // Clear content
        if (el) {
            el.innerHTML = '';
        }
    }

    /**
     * Show modal
     * @param {Object} options - Modal options
     * @param {string} options.title - Modal title
     * @param {string|HTMLElement} options.content - Modal content
     * @param {Array} options.buttons - Modal buttons
     * @param {string} options.size - Modal size (small, medium, large)
     * @param {boolean} options.closeOnClickOutside - Close modal when clicking outside
     * @param {boolean} options.showCloseButton - Show close button
     * @returns {HTMLElement} Modal element
     */
    showModal(options = {}) {
        // Default options
        const {
            title = '',
            content = '',
            buttons = [],
            size = 'medium',
            closeOnClickOutside = true,
            showCloseButton = true
        } = options;
        
        // Create modal backdrop
        const backdrop = this.createElement('div', {
            className: 'modal-backdrop'
        });
        
        // Create modal
        const modal = this.createElement('div', {
            className: ['modal', `modal-${size}`]
        });
        
        // Create modal header
        const header = this.createElement('div', {
            className: 'modal-header'
        });
        
        // Create modal title
        const titleElement = this.createElement('h2', {
            className: 'modal-title',
            content: title
        });
        
        // Add title to header
        header.appendChild(titleElement);
        
        // Add close button
        if (showCloseButton) {
            const closeButton = this.createElement('button', {
                className: 'modal-close',
                content: '×'
            });
            
            // Add click event
            closeButton.addEventListener('click', () => {
                this.closeModal();
            });
            
            header.appendChild(closeButton);
        }
        
        // Add header to modal
        modal.appendChild(header);
        
        // Create modal body
        const body = this.createElement('div', {
            className: 'modal-body'
        });
        
        // Add content to body
        if (typeof content === 'string') {
            body.innerHTML = content;
        } else {
            body.appendChild(content);
        }
        
        // Add body to modal
        modal.appendChild(body);
        
        // Create modal footer
        if (buttons.length > 0) {
            const footer = this.createElement('div', {
                className: 'modal-footer'
            });
            
            // Add buttons
            buttons.forEach(button => {
                const buttonElement = this.createElement('button', {
                    className: ['modal-button', button.className || ''],
                    content: button.text || 'Button'
                });
                
                // Add click event
                if (button.onClick) {
                    buttonElement.addEventListener('click', () => {
                        button.onClick(modal);
                    });
                }
                
                footer.appendChild(buttonElement);
            });
            
            // Add footer to modal
            modal.appendChild(footer);
        }
        
        // Add click event to backdrop
        if (closeOnClickOutside) {
            backdrop.addEventListener('click', (event) => {
                if (event.target === backdrop) {
                    this.closeModal();
                }
            });
        }
        
        // Add modal to backdrop
        backdrop.appendChild(modal);
        
        // Add backdrop to body
        document.body.appendChild(backdrop);
        
        // Add to modal stack
        this.modalStack.push({
            backdrop,
            modal,
            options
        });
        
        // Add modal-open class to body
        document.body.classList.add('modal-open');
        
        // Return modal
        return modal;
    }

    /**
     * Close modal
     * @param {HTMLElement} [modalToClose] - Specific modal to close (closes top modal if not provided)
     * @returns {boolean} Success status
     */
    closeModal(modalToClose = null) {
        // Check if there are any modals
        if (this.modalStack.length === 0) {
            return false;
        }
        
        // Find modal to close
        let modalIndex = this.modalStack.length - 1; // Default to top modal
        
        if (modalToClose) {
            // Find specific modal
            modalIndex = this.modalStack.findIndex(item => item.modal === modalToClose);
            
            if (modalIndex === -1) {
                return false;
            }
        }
        
        // Get modal
        const { backdrop } = this.modalStack[modalIndex];
        
        // Remove modal from stack
        this.modalStack.splice(modalIndex, 1);
        
        // Remove backdrop from body
        document.body.removeChild(backdrop);
        
        // Remove modal-open class from body if no more modals
        if (this.modalStack.length === 0) {
            document.body.classList.remove('modal-open');
        }
        
        return true;
    }

    /**
     * Close all modals
     */
    closeAllModals() {
        // Close all modals
        while (this.modalStack.length > 0) {
            this.closeModal();
        }
    }

    /**
     * Show confirmation dialog
     * @param {Object} options - Dialog options
     * @param {string} options.title - Dialog title
     * @param {string} options.message - Dialog message
     * @param {string} options.confirmText - Confirm button text
     * @param {string} options.cancelText - Cancel button text
     * @param {Function} options.onConfirm - Confirm callback
     * @param {Function} options.onCancel - Cancel callback
     * @returns {HTMLElement} Modal element
     */
    showConfirmation(options = {}) {
        // Default options
        const {
            title = 'Confirmation',
            message = 'Are you sure?',
            confirmText = 'Confirm',
            cancelText = 'Cancel',
            onConfirm = () => {},
            onCancel = () => {}
        } = options;
        
        // Create content
        const content = this.createElement('div', {
            className: 'confirmation-dialog',
            content: message
        });
        
        // Create buttons
        const buttons = [
            {
                text: cancelText,
                className: 'button-secondary',
                onClick: (modal) => {
                    this.closeModal(modal);
                    onCancel();
                }
            },
            {
                text: confirmText,
                className: 'button-primary',
                onClick: (modal) => {
                    this.closeModal(modal);
                    onConfirm();
                }
            }
        ];
        
        // Show modal
        return this.showModal({
            title,
            content,
            buttons,
            size: 'small'
        });
    }

    /**
     * Show alert dialog
     * @param {Object} options - Dialog options
     * @param {string} options.title - Dialog title
     * @param {string} options.message - Dialog message
     * @param {string} options.buttonText - Button text
     * @param {Function} options.onClose - Close callback
     * @returns {HTMLElement} Modal element
     */
    showAlert(options = {}) {
        // Default options
        const {
            title = 'Alert',
            message = '',
            buttonText = 'OK',
            onClose = () => {}
        } = options;
        
        // Create content
        const content = this.createElement('div', {
            className: 'alert-dialog',
            content: message
        });
        
        // Create buttons
        const buttons = [
            {
                text: buttonText,
                className: 'button-primary',
                onClick: (modal) => {
                    this.closeModal(modal);
                    onClose();
                }
            }
        ];
        
        // Show modal
        return this.showModal({
            title,
            content,
            buttons,
            size: 'small'
        });
    }

    /**
     * Show prompt dialog
     * @param {Object} options - Dialog options
     * @param {string} options.title - Dialog title
     * @param {string} options.message - Dialog message
     * @param {string} options.defaultValue - Default input value
     * @param {string} options.placeholder - Input placeholder
     * @param {string} options.confirmText - Confirm button text
     * @param {string} options.cancelText - Cancel button text
     * @param {Function} options.onConfirm - Confirm callback
     * @param {Function} options.onCancel - Cancel callback
     * @returns {HTMLElement} Modal element
     */
    showPrompt(options = {}) {
        // Default options
        const {
            title = 'Prompt',
            message = '',
            defaultValue = '',
            placeholder = '',
            confirmText = 'OK',
            cancelText = 'Cancel',
            onConfirm = () => {},
            onCancel = () => {}
        } = options;
        
        // Create content
        const content = this.createElement('div', {
            className: 'prompt-dialog'
        });
        
        // Add message
        if (message) {
            const messageElement = this.createElement('p', {
                content: message
            });
            content.appendChild(messageElement);
        }
        
        // Add input
        const input = this.createElement('input', {
            attributes: {
                type: 'text',
                value: defaultValue,
                placeholder
            }
        });
        content.appendChild(input);
        
        // Create buttons
        const buttons = [
            {
                text: cancelText,
                className: 'button-secondary',
                onClick: (modal) => {
                    this.closeModal(modal);
                    onCancel();
                }
            },
            {
                text: confirmText,
                className: 'button-primary',
                onClick: (modal) => {
                    this.closeModal(modal);
                    onConfirm(input.value);
                }
            }
        ];
        
        // Show modal
        const modal = this.showModal({
            title,
            content,
            buttons,
            size: 'small'
        });
        
        // Focus input
        setTimeout(() => {
            input.focus();
            input.select();
        }, 100);
        
        return modal;
    }

    /**
     * Show toast notification
     * @param {Object} options - Toast options
     * @param {string} options.message - Toast message
     * @param {string} options.type - Toast type (info, success, warning, error)
     * @param {number} options.duration - Toast duration in milliseconds
     * @returns {HTMLElement} Toast element
     */
    showToast(options = {}) {
        // Default options
        const {
            message = '',
            type = 'info',
            duration = 3000
        } = options;
        
        // Create toast
        const toast = this.createElement('div', {
            className: ['toast', `toast-${type}`],
            content: message
        });
        
        // Add toast to container
        this.toastContainer.appendChild(toast);
        
        // Add to toasts array
        this.toasts.push(toast);
        
        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Hide toast after duration
        setTimeout(() => {
            this.hideToast(toast);
        }, duration);
        
        return toast;
    }

    /**
     * Hide toast notification
     * @param {HTMLElement} toast - Toast element
     */
    hideToast(toast) {
        // Remove show class
        toast.classList.remove('show');
        
        // Remove toast after animation
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            
            // Remove from toasts array
            const index = this.toasts.indexOf(toast);
            if (index !== -1) {
                this.toasts.splice(index, 1);
            }
        }, 300);
    }

    /**
     * Show loading spinner
     * @param {Object} options - Spinner options
     * @param {string} options.message - Spinner message
     * @param {boolean} options.overlay - Show overlay
     * @returns {HTMLElement} Spinner element
     */
    showSpinner(options = {}) {
        // Default options
        const {
            message = 'Loading...',
            overlay = true
        } = options;
        
        // Create spinner container
        const container = this.createElement('div', {
            className: ['spinner-container', overlay ? 'with-overlay' : '']
        });
        
        // Create spinner
        const spinner = this.createElement('div', {
            className: 'spinner'
        });
        container.appendChild(spinner);
        
        // Add message
        if (message) {
            const messageElement = this.createElement('div', {
                className: 'spinner-message',
                content: message
            });
            container.appendChild(messageElement);
        }
        
        // Add to body
        document.body.appendChild(container);
        
        return container;
    }

    /**
     * Hide loading spinner
     * @param {HTMLElement} spinner - Spinner element
     */
    hideSpinner(spinner) {
        // Remove spinner
        if (spinner && spinner.parentNode) {
            spinner.parentNode.removeChild(spinner);
        }
    }

    /**
     * Make element draggable
     * @param {HTMLElement} element - Element to make draggable
     * @param {HTMLElement} handle - Drag handle (defaults to element)
     */
    makeDraggable(element, handle = null) {
        // Use element as handle if not provided
        const dragHandle = handle || element;
        
        // Add draggable attribute
        element.setAttribute('draggable', 'true');
        
        // Add drag handle class
        dragHandle.classList.add('drag-handle');
        
        // Add mousedown event
        dragHandle.addEventListener('mousedown', (event) => {
            // Only handle left mouse button
            if (event.button !== 0) return;
            
            // Prevent default
            event.preventDefault();
            
            // Get element position
            const rect = element.getBoundingClientRect();
            
            // Set drag state
            this.dragState = {
                dragging: true,
                element,
                offsetX: event.clientX - rect.left,
                offsetY: event.clientY - rect.top
            };
            
            // Add dragging class
            element.classList.add('dragging');
        });
        
        // Add mousemove event
        document.addEventListener('mousemove', (event) => {
            // Check if dragging
            if (!this.dragState.dragging || this.dragState.element !== element) return;
            
            // Prevent default
            event.preventDefault();
            
            // Calculate new position
            const x = event.clientX - this.dragState.offsetX;
            const y = event.clientY - this.dragState.offsetY;
            
            // Set element position
            element.style.left = `${x}px`;
            element.style.top = `${y}px`;
        });
        
        // Add mouseup event
        document.addEventListener('mouseup', () => {
            // Check if dragging
            if (!this.dragState.dragging || this.dragState.element !== element) return;
            
            // Reset drag state
            this.dragState = {
                dragging: false,
                element: null,
                offsetX: 0,
                offsetY: 0
            };
            
            // Remove dragging class
            element.classList.remove('dragging');
        });
    }

    /**
     * Make element resizable
     * @param {HTMLElement} element - Element to make resizable
     * @param {Object} options - Resize options
     * @param {boolean} options.minWidth - Minimum width
     * @param {boolean} options.minHeight - Minimum height
     * @param {boolean} options.maxWidth - Maximum width
     * @param {boolean} options.maxHeight - Maximum height
     * @param {boolean} options.preserveAspectRatio - Preserve aspect ratio
     */
    makeResizable(element, options = {}) {
        // Default options
        const {
            minWidth = 100,
            minHeight = 100,
            maxWidth = Infinity,
            maxHeight = Infinity,
            preserveAspectRatio = false
        } = options;
        
        // Add resizable class
        element.classList.add('resizable');
        
        // Create resize handle
        const handle = this.createElement('div', {
            className: 'resize-handle'
        });
        
        // Add handle to element
        element.appendChild(handle);
        
        // Add mousedown event
        handle.addEventListener('mousedown', (event) => {
            // Only handle left mouse button
            if (event.button !== 0) return;
            
            // Prevent default
            event.preventDefault();
            
            // Get element dimensions
            const rect = element.getBoundingClientRect();
            
            // Set resize state
            this.resizeState = {
                resizing: true,
                element,
                startWidth: rect.width,
                startHeight: rect.height,
                startX: event.clientX,
                startY: event.clientY,
                aspectRatio: preserveAspectRatio ? rect.width / rect.height : null
            };
            
            // Add resizing class
            element.classList.add('resizing');
        });
        
        // Add mousemove event
        document.addEventListener('mousemove', (event) => {
            // Check if resizing
            if (!this.resizeState.resizing || this.resizeState.element !== element) return;
            
            // Prevent default
            event.preventDefault();
            
            // Calculate new dimensions
            let width = this.resizeState.startWidth + (event.clientX - this.resizeState.startX);
            let height = this.resizeState.startHeight + (event.clientY - this.resizeState.startY);
            
            // Apply aspect ratio
            if (this.resizeState.aspectRatio) {
                height = width / this.resizeState.aspectRatio;
            }
            
            // Apply min/max constraints
            width = Math.max(minWidth, Math.min(maxWidth, width));
            height = Math.max(minHeight, Math.min(maxHeight, height));
            
            // Set element dimensions
            element.style.width = `${width}px`;
            element.style.height = `${height}px`;
        });
        
        // Add mouseup event
        document.addEventListener('mouseup', () => {
            // Check if resizing
            if (!this.resizeState.resizing || this.resizeState.element !== element) return;
            
            // Reset resize state
            this.resizeState = {
                resizing: false,
                element: null,
                startWidth: 0,
                startHeight: 0,
                startX: 0,
                startY: 0,
                aspectRatio: null
            };
            
            // Remove resizing class
            element.classList.remove('resizing');
        });
    }

    /**
     * Create tabs
     * @param {string|HTMLElement} container - Container element ID or element
     * @param {Array} tabs - Tab definitions
     * @param {Object} options - Tab options
     * @returns {Object} Tab controller
     */
    createTabs(container, tabs, options = {}) {
        // Get container
        const containerElement = typeof container === 'string' ? this.getElement(container) : container;
        
        // Default options
        const {
            activeTab = 0,
            onTabChange = null
        } = options;
        
        // Create tab container
        const tabContainer = this.createElement('div', {
            className: 'tab-container'
        });
        
        // Create tab header
        const tabHeader = this.createElement('div', {
            className: 'tab-header'
        });
        
        // Create tab content
        const tabContent = this.createElement('div', {
            className: 'tab-content'
        });
        
        // Create tab buttons and panels
        const tabButtons = [];
        const tabPanels = [];
        
        tabs.forEach((tab, index) => {
            // Create tab button
            const tabButton = this.createElement('button', {
                className: ['tab-button', index === activeTab ? 'active' : ''],
                content: tab.label
            });
            
            // Create tab panel
            const tabPanel = this.createElement('div', {
                className: ['tab-panel', index === activeTab ? 'active' : ''],
                content: tab.content
            });
            
            // Add click event
            tabButton.addEventListener('click', () => {
                // Deactivate all tabs
                tabButtons.forEach(button => button.classList.remove('active'));
                tabPanels.forEach(panel => panel.classList.remove('active'));
                
                // Activate this tab
                tabButton.classList.add('active');
                tabPanel.classList.add('active');
                
                // Call onTabChange callback
                if (onTabChange) {
                    onTabChange(index, tab);
                }
            });
            
            // Add to arrays
            tabButtons.push(tabButton);
            tabPanels.push(tabPanel);
            
            // Add to containers
            tabHeader.appendChild(tabButton);
            tabContent.appendChild(tabPanel);
        });
        
        // Add to tab container
        tabContainer.appendChild(tabHeader);
        tabContainer.appendChild(tabContent);
        
        // Add to container
        containerElement.appendChild(tabContainer);
        
        // Return tab controller
        return {
            container: tabContainer,
            header: tabHeader,
            content: tabContent,
            buttons: tabButtons,
            panels: tabPanels,
                        setActiveTab: (index) => {
                // Check if index is valid
                if (index < 0 || index >= tabs.length) {
                    return false;
                }
                
                // Deactivate all tabs
                tabButtons.forEach(button => button.classList.remove('active'));
                tabPanels.forEach(panel => panel.classList.remove('active'));
                
                // Activate selected tab
                tabButtons[index].classList.add('active');
                tabPanels[index].classList.add('active');
                
                // Call onTabChange callback
                if (onTabChange) {
                    onTabChange(index, tabs[index]);
                }
                
                return true;
            },
            getActiveTabIndex: () => {
                return tabButtons.findIndex(button => button.classList.contains('active'));
            }
        };
    }

    /**
     * Create accordion
     * @param {string|HTMLElement} container - Container element ID or element
     * @param {Array} sections - Accordion sections
     * @param {Object} options - Accordion options
     * @returns {Object} Accordion controller
     */
    createAccordion(container, sections, options = {}) {
        // Get container
        const containerElement = typeof container === 'string' ? this.getElement(container) : container;
        
        // Default options
        const {
            multipleOpen = false,
            initialOpen = []
        } = options;
        
        // Create accordion container
        const accordionContainer = this.createElement('div', {
            className: 'accordion-container'
        });
        
        // Create sections
        const sectionElements = [];
        
        sections.forEach((section, index) => {
            // Create section
            const sectionElement = this.createElement('div', {
                className: 'accordion-section'
            });
            
            // Create header
            const header = this.createElement('div', {
                className: 'accordion-header',
                content: section.title
            });
            
            // Create content
            const content = this.createElement('div', {
                className: 'accordion-content',
                content: section.content
            });
            
            // Check if initially open
            if (initialOpen.includes(index)) {
                sectionElement.classList.add('open');
            } else {
                content.style.display = 'none';
            }
            
            // Add click event
            header.addEventListener('click', () => {
                // Check if open
                const isOpen = sectionElement.classList.contains('open');
                
                // Close other sections if not multiple open
                if (!multipleOpen && !isOpen) {
                    sectionElements.forEach(el => {
                        el.classList.remove('open');
                        el.querySelector('.accordion-content').style.display = 'none';
                    });
                }
                
                // Toggle section
                sectionElement.classList.toggle('open');
                content.style.display = sectionElement.classList.contains('open') ? '' : 'none';
            });
            
            // Add to section
            sectionElement.appendChild(header);
            sectionElement.appendChild(content);
            
            // Add to container
            accordionContainer.appendChild(sectionElement);
            
            // Add to array
            sectionElements.push(sectionElement);
        });
        
        // Add to container
        containerElement.appendChild(accordionContainer);
        
        // Return accordion controller
        return {
            container: accordionContainer,
            sections: sectionElements,
            openSection: (index) => {
                // Check if index is valid
                if (index < 0 || index >= sections.length) {
                    return false;
                }
                
                // Close other sections if not multiple open
                if (!multipleOpen) {
                    sectionElements.forEach((el, i) => {
                        if (i !== index) {
                            el.classList.remove('open');
                            el.querySelector('.accordion-content').style.display = 'none';
                        }
                    });
                }
                
                // Open section
                sectionElements[index].classList.add('open');
                sectionElements[index].querySelector('.accordion-content').style.display = '';
                
                return true;
            },
            closeSection: (index) => {
                // Check if index is valid
                if (index < 0 || index >= sections.length) {
                    return false;
                }
                
                // Close section
                sectionElements[index].classList.remove('open');
                sectionElements[index].querySelector('.accordion-content').style.display = 'none';
                
                return true;
            },
            toggleSection: (index) => {
                // Check if index is valid
                if (index < 0 || index >= sections.length) {
                    return false;
                }
                
                // Check if open
                const isOpen = sectionElements[index].classList.contains('open');
                
                // Close other sections if not multiple open and opening this section
                if (!multipleOpen && !isOpen) {
                    sectionElements.forEach((el, i) => {
                        if (i !== index) {
                            el.classList.remove('open');
                            el.querySelector('.accordion-content').style.display = 'none';
                        }
                    });
                }
                
                // Toggle section
                sectionElements[index].classList.toggle('open');
                sectionElements[index].querySelector('.accordion-content').style.display = 
                    sectionElements[index].classList.contains('open') ? '' : 'none';
                
                return true;
            }
        };
    }

    /**
     * Create dropdown
     * @param {string|HTMLElement} container - Container element ID or element
     * @param {Object} options - Dropdown options
     * @returns {Object} Dropdown controller
     */
    createDropdown(container, options = {}) {
        // Get container
        const containerElement = typeof container === 'string' ? this.getElement(container) : container;
        
        // Default options
        const {
            label = 'Select',
            items = [],
            selectedIndex = -1,
            onChange = null
        } = options;
        
        // Create dropdown container
        const dropdownContainer = this.createElement('div', {
            className: 'dropdown'
        });
        
        // Create dropdown button
        const button = this.createElement('button', {
            className: 'dropdown-button',
            content: label
        });
        
        // Create dropdown menu
        const menu = this.createElement('div', {
            className: 'dropdown-menu'
        });
        
        // Create dropdown items
        const itemElements = [];
        
        items.forEach((item, index) => {
            // Create item
            const itemElement = this.createElement('div', {
                className: ['dropdown-item', index === selectedIndex ? 'selected' : ''],
                content: item.label
            });
            
            // Add click event
            itemElement.addEventListener('click', () => {
                // Update selected item
                itemElements.forEach(el => el.classList.remove('selected'));
                itemElement.classList.add('selected');
                
                // Update button text
                button.textContent = item.label;
                
                // Close dropdown
                dropdownContainer.classList.remove('active');
                
                // Call onChange callback
                if (onChange) {
                    onChange(index, item);
                }
            });
            
            // Add to menu
            menu.appendChild(itemElement);
            
            // Add to array
            itemElements.push(itemElement);
        });
        
        // Set initial selection
        if (selectedIndex >= 0 && selectedIndex < items.length) {
            button.textContent = items[selectedIndex].label;
        }
        
        // Add click event to button
        button.addEventListener('click', (event) => {
            // Prevent propagation
            event.stopPropagation();
            
            // Toggle dropdown
            dropdownContainer.classList.toggle('active');
        });
        
        // Add to container
        dropdownContainer.appendChild(button);
        dropdownContainer.appendChild(menu);
        containerElement.appendChild(dropdownContainer);
        
        // Return dropdown controller
        return {
            container: dropdownContainer,
            button,
            menu,
            items: itemElements,
            setSelectedIndex: (index) => {
                // Check if index is valid
                if (index < 0 || index >= items.length) {
                    return false;
                }
                
                // Update selected item
                itemElements.forEach(el => el.classList.remove('selected'));
                itemElements[index].classList.add('selected');
                
                // Update button text
                button.textContent = items[index].label;
                
                // Call onChange callback
                if (onChange) {
                    onChange(index, items[index]);
                }
                
                return true;
            },
            getSelectedIndex: () => {
                return itemElements.findIndex(item => item.classList.contains('selected'));
            },
            open: () => {
                dropdownContainer.classList.add('active');
            },
            close: () => {
                dropdownContainer.classList.remove('active');
            },
            toggle: () => {
                dropdownContainer.classList.toggle('active');
                return dropdownContainer.classList.contains('active');
            }
        };
    }

    /**
     * Create tooltip
     * @param {string|HTMLElement} element - Element ID or element
     * @param {string} content - Tooltip content
     * @param {Object} options - Tooltip options
     * @returns {Object} Tooltip controller
     */
    createTooltip(element, content, options = {}) {
        // Get element
        const el = typeof element === 'string' ? this.getElement(element) : element;
        
        // Default options
        const {
            position = 'top',
            delay = 500,
            className = ''
        } = options;
        
        // Create tooltip element
        const tooltip = this.createElement('div', {
            className: ['tooltip', `tooltip-${position}`, className],
            content
        });
        
        // Add to body
        document.body.appendChild(tooltip);
        
        // Hide tooltip initially
        tooltip.style.opacity = '0';
        tooltip.style.visibility = 'hidden';
        
        // Variables
        let showTimeout = null;
        let visible = false;
        
        // Show tooltip function
        const showTooltip = () => {
            // Clear timeout
            if (showTimeout) {
                clearTimeout(showTimeout);
            }
            
            // Set timeout
            showTimeout = setTimeout(() => {
                // Get element position
                const rect = el.getBoundingClientRect();
                
                // Calculate position
                let left, top;
                
                switch (position) {
                    case 'top':
                        left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2);
                        top = rect.top - tooltip.offsetHeight - 10;
                        break;
                    case 'bottom':
                        left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2);
                        top = rect.bottom + 10;
                        break;
                    case 'left':
                        left = rect.left - tooltip.offsetWidth - 10;
                        top = rect.top + (rect.height / 2) - (tooltip.offsetHeight / 2);
                        break;
                    case 'right':
                        left = rect.right + 10;
                        top = rect.top + (rect.height / 2) - (tooltip.offsetHeight / 2);
                        break;
                }
                
                // Set position
                tooltip.style.left = `${left}px`;
                tooltip.style.top = `${top}px`;
                
                // Show tooltip
                tooltip.style.opacity = '1';
                tooltip.style.visibility = 'visible';
                
                // Set visible flag
                visible = true;
            }, delay);
        };
        
        // Hide tooltip function
        const hideTooltip = () => {
            // Clear timeout
            if (showTimeout) {
                clearTimeout(showTimeout);
            }
            
            // Hide tooltip
            tooltip.style.opacity = '0';
            tooltip.style.visibility = 'hidden';
            
            // Set visible flag
            visible = false;
        };
        
        // Add event listeners
        el.addEventListener('mouseenter', showTooltip);
        el.addEventListener('mouseleave', hideTooltip);
        el.addEventListener('focus', showTooltip);
        el.addEventListener('blur', hideTooltip);
        
        // Return tooltip controller
        return {
            element: tooltip,
            show: () => {
                showTooltip();
                // Show immediately
                if (showTimeout) {
                    clearTimeout(showTimeout);
                }
                tooltip.style.opacity = '1';
                tooltip.style.visibility = 'visible';
                visible = true;
            },
            hide: hideTooltip,
            isVisible: () => visible,
            setContent: (newContent) => {
                tooltip.innerHTML = newContent;
            },
            destroy: () => {
                // Remove event listeners
                el.removeEventListener('mouseenter', showTooltip);
                el.removeEventListener('mouseleave', hideTooltip);
                el.removeEventListener('focus', showTooltip);
                el.removeEventListener('blur', hideTooltip);
                
                // Remove tooltip
                if (tooltip.parentNode) {
                    tooltip.parentNode.removeChild(tooltip);
                }
            }
        };
    }

    /**
     * Create progress bar
     * @param {string|HTMLElement} container - Container element ID or element
     * @param {Object} options - Progress bar options
     * @returns {Object} Progress bar controller
     */
    createProgressBar(container, options = {}) {
        // Get container
        const containerElement = typeof container === 'string' ? this.getElement(container) : container;
        
        // Default options
        const {
            value = 0,
            max = 100,
            showText = true,
            textFormat = 'percent', // percent, value, custom
            customText = null,
            className = ''
        } = options;
        
        // Create progress bar container
        const progressContainer = this.createElement('div', {
            className: ['progress-container', className]
        });
        
        // Create progress bar
        const progressBar = this.createElement('div', {
            className: 'progress-bar'
        });
        
        // Create progress text
        const progressText = this.createElement('div', {
            className: 'progress-text'
        });
        
        // Set initial value
        const percent = Math.min(100, Math.max(0, (value / max) * 100));
        progressBar.style.width = `${percent}%`;
        
        // Set initial text
        if (showText) {
            let text;
            
            switch (textFormat) {
                case 'percent':
                    text = `${Math.round(percent)}%`;
                    break;
                case 'value':
                    text = `${value}/${max}`;
                    break;
                case 'custom':
                    text = customText ? customText(value, max, percent) : `${value}/${max}`;
                    break;
            }
            
            progressText.textContent = text;
        } else {
            progressText.style.display = 'none';
        }
        
        // Add to container
        progressContainer.appendChild(progressBar);
        progressContainer.appendChild(progressText);
        containerElement.appendChild(progressContainer);
        
        // Return progress bar controller
        return {
            container: progressContainer,
            bar: progressBar,
            text: progressText,
            setValue: (newValue) => {
                // Calculate percent
                const newPercent = Math.min(100, Math.max(0, (newValue / max) * 100));
                
                // Update bar
                progressBar.style.width = `${newPercent}%`;
                
                // Update text
                if (showText) {
                    let text;
                    
                    switch (textFormat) {
                        case 'percent':
                            text = `${Math.round(newPercent)}%`;
                            break;
                        case 'value':
                            text = `${newValue}/${max}`;
                            break;
                        case 'custom':
                            text = customText ? customText(newValue, max, newPercent) : `${newValue}/${max}`;
                            break;
                    }
                    
                    progressText.textContent = text;
                }
                
                return newPercent;
            },
            setMax: (newMax) => {
                // Update max
                max = newMax;
                
                // Recalculate percent
                const currentValue = (progressBar.style.width.replace('%', '') / 100) * max;
                const newPercent = Math.min(100, Math.max(0, (currentValue / newMax) * 100));
                
                // Update bar
                progressBar.style.width = `${newPercent}%`;
                
                // Update text
                if (showText) {
                    let text;
                    
                    switch (textFormat) {
                        case 'percent':
                            text = `${Math.round(newPercent)}%`;
                            break;
                        case 'value':
                            text = `${currentValue}/${newMax}`;
                            break;
                        case 'custom':
                            text = customText ? customText(currentValue, newMax, newPercent) : `${currentValue}/${newMax}`;
                            break;
                    }
                    
                    progressText.textContent = text;
                }
                
                return newMax;
            }
        };
    }

    /**
     * Add event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     * @returns {string} Listener ID
     */
    addEventListener(event, callback) {
        // Generate ID
        const id = `listener-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        
        // Initialize event array if needed
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = {};
        }
        
        // Add listener
        this.eventListeners[event][id] = callback;
        
        // Return ID
        return id;
    }

    /**
     * Remove event listener
     * @param {string} event - Event name
     * @param {string} id - Listener ID
     * @returns {boolean} Success status
     */
    removeEventListener(event, id) {
        // Check if event exists
        if (!this.eventListeners[event]) {
            return false;
        }
        
        // Check if listener exists
        if (!this.eventListeners[event][id]) {
            return false;
        }
        
        // Remove listener
        delete this.eventListeners[event][id];
        
        return true;
    }

    /**
     * Trigger event
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    _triggerEvent(event, data) {
        // Check if event exists
        if (!this.eventListeners[event]) {
            return;
        }
        
        // Call listeners
        Object.values(this.eventListeners[event]).forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in ${event} event listener:`, error);
            }
        });
    }

    /**
     * Create form
     * @param {string|HTMLElement} container - Container element ID or element
     * @param {Array} fields - Form fields
     * @param {Object} options - Form options
     * @returns {Object} Form controller
     */
    createForm(container, fields, options = {}) {
        // Get container
        const containerElement = typeof container === 'string' ? this.getElement(container) : container;
        
        // Default options
        const {
            submitText = 'Submit',
            cancelText = 'Cancel',
            onSubmit = null,
            onCancel = null,
            showCancel = true,
            className = ''
        } = options;
        
        // Create form
        const form = this.createElement('form', {
            className: ['ui-form', className]
        });
        
        // Create form fields
        const formFields = {};
        
        fields.forEach(field => {
            // Create field container
            const fieldContainer = this.createElement('div', {
                className: ['form-field', field.className || '']
            });
            
            // Create label
            if (field.label) {
                const label = this.createElement('label', {
                    content: field.label
                });
                
                // Add required indicator
                if (field.required) {
                    label.innerHTML += ' <span class="required">*</span>';
                }
                
                fieldContainer.appendChild(label);
            }
            
            // Create input
            let input;
            
            switch (field.type) {
                case 'text':
                case 'email':
                case 'password':
                case 'number':
                case 'date':
                case 'time':
                case 'color':
                    input = this.createElement('input', {
                        attributes: {
                            type: field.type,
                            name: field.name,
                            value: field.value || '',
                            placeholder: field.placeholder || '',
                            required: field.required || false,
                            min: field.min,
                            max: field.max,
                            step: field.step
                        }
                    });
                    break;
                case 'textarea':
                    input = this.createElement('textarea', {
                        attributes: {
                            name: field.name,
                            placeholder: field.placeholder || '',
                            required: field.required || false,
                            rows: field.rows || 3
                        },
                        content: field.value || ''
                    });
                    break;
                case 'select':
                    input = this.createElement('select', {
                        attributes: {
                            name: field.name,
                            required: field.required || false
                        }
                    });
                    
                    // Add options
                    if (field.options) {
                        field.options.forEach(option => {
                            const optionElement = this.createElement('option', {
                                attributes: {
                                    value: option.value
                                },
                                content: option.label
                            });
                            
                            // Set selected
                            if (option.value === field.value) {
                                optionElement.selected = true;
                            }
                            
                            input.appendChild(optionElement);
                        });
                    }
                    break;
                case 'checkbox':
                    input = this.createElement('input', {
                        attributes: {
                            type: 'checkbox',
                            name: field.name,
                            checked: field.value || false,
                            required: field.required || false
                        }
                    });
                    break;
                case 'radio':
                    // Create radio group
                    input = this.createElement('div', {
                        className: 'radio-group'
                    });
                    
                    // Add options
                    if (field.options) {
                        field.options.forEach(option => {
                            const radioContainer = this.createElement('div', {
                                className: 'radio-option'
                            });
                            
                            const radioInput = this.createElement('input', {
                                attributes: {
                                    type: 'radio',
                                    name: field.name,
                                    value: option.value,
                                    checked: option.value === field.value,
                                    required: field.required || false
                                }
                            });
                            
                            const radioLabel = this.createElement('label', {
                                content: option.label
                            });
                            
                            radioContainer.appendChild(radioInput);
                            radioContainer.appendChild(radioLabel);
                            input.appendChild(radioContainer);
                        });
                    }
                    break;
                default:
                    input = this.createElement('input', {
                        attributes: {
                            type: 'text',
                            name: field.name,
                            value: field.value || '',
                            placeholder: field.placeholder || '',
                            required: field.required || false
                        }
                    });
            }
            
            // Add help text
            if (field.help) {
                const helpText = this.createElement('div', {
                    className: 'help-text',
                    content: field.help
                });
                
                fieldContainer.appendChild(input);
                fieldContainer.appendChild(helpText);
            } else {
                fieldContainer.appendChild(input);
            }
            
            // Add to form
            form.appendChild(fieldContainer);
            
            // Add to fields object
            formFields[field.name] = input;
        });
        
        // Create buttons container
        const buttonsContainer = this.createElement('div', {
            className: 'form-buttons'
        });
        
        // Create submit button
        const submitButton = this.createElement('button', {
            attributes: {
                type: 'submit'
            },
            className: 'button-primary',
            content: submitText
        });
        
        // Create cancel button
        let cancelButton = null;
        if (showCancel) {
            cancelButton = this.createElement('button', {
                attributes: {
                    type: 'button'
                },
                className: 'button-secondary',
                content: cancelText
            });
            
            // Add click event
            cancelButton.addEventListener('click', (event) => {
                event.preventDefault();
                
                if (onCancel) {
                    onCancel();
                }
            });
            
            buttonsContainer.appendChild(cancelButton);
        }
        
        // Add submit button
        buttonsContainer.appendChild(submitButton);
        
        // Add buttons to form
        form.appendChild(buttonsContainer);
        
        // Add submit event
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            
            // Get form data
            const formData = new FormData(form);
            const data = {};
            
            // Convert FormData to object
            for (const [key, value] of formData.entries()) {
                data[key] = value;
            }
            
            // Handle checkboxes (they're only included when checked)
            fields.forEach(field => {
                if (field.type === 'checkbox' && !data[field.name]) {
                    data[field.name] = false;
                }
            });
            
            if (onSubmit) {
                onSubmit(data, form);
            }
        });
        
        // Add to container
        containerElement.appendChild(form);
        
        // Return form controller
        return {
            form,
            fields: formFields,
            getData: () => {
                // Get form data
                const formData = new FormData(form);
                const data = {};
                
                // Convert FormData to object
                for (const [key, value] of formData.entries()) {
                    data[key] = value;
                }
                
                // Handle checkboxes (they're only included when checked)
                fields.forEach(field => {
                    if (field.type === 'checkbox' && !data[field.name]) {
                        data[field.name] = false;
                    }
                });
                
                return data;
            },
            setData: (data) => {
                // Set form data
                fields.forEach(field => {
                    if (data[field.name] !== undefined) {
                        const input = formFields[field.name];
                        
                        switch (field.type) {
                            case 'checkbox':
                                input.checked = !!data[field.name];
                                break;
                            case 'radio':
                                const radioInputs = input.querySelectorAll('input[type="radio"]');
                                radioInputs.forEach(radio => {
                                    radio.checked = radio.value === data[field.name];
                                });
                                break;
                            case 'select':
                                const options = input.querySelectorAll('option');
                                options.forEach(option => {
                                    option.selected = option.value === data[field.name];
                                });
                                break;
                            case 'textarea':
                                input.value = data[field.name];
                                break;
                            default:
                                input.value = data[field.name];
                        }
                    }
                });
            },
            reset: () => {
                form.reset();
            },
            validate: () => {
                return form.checkValidity();
            },
            submit: () => {
                form.dispatchEvent(new Event('submit'));
            }
        };
    }
}

// Export the UI class
export default UI;
