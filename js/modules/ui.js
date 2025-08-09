/**
 * UI module for Jesster's Combat Tracker
 * Handles user interface components, rendering, and interactions
 */
class UI {
    constructor(settings) {
        // Store reference to the settings module
        this.settings = settings;
        
        // UI state
        this.activeTab = 'combat';
        this.modalStack = [];
        this.toastQueue = [];
        this.isProcessingToasts = false;
        this.draggedElement = null;
        this.dropTarget = null;
        this.resizeObservers = [];
        this.tooltips = [];
        
        // UI elements cache
        this.elements = {};
        
        // Event handlers
        this.eventHandlers = {};
        
        console.log("UI module initialized");
    }

    /**
     * Initialize the UI
     * @param {Object} appElements - Main app elements
     */
    init(appElements = {}) {
        // Store references to main app elements
        this.elements = {
            ...appElements,
            body: document.body,
            app: document.getElementById('app') || document.body,
            modal: document.getElementById('modal-container'),
            toast: document.getElementById('toast-container')
        };
        
        // Create UI containers if they don't exist
        this._createUIContainers();
        
        // Apply theme from settings
        this.settings.applyTheme();
        
        // Initialize tooltips
        this._initTooltips();
        
        // Initialize tab navigation
        this._initTabNavigation();
        
        // Initialize global event listeners
        this._initEventListeners();
    }

    /**
     * Create UI containers if they don't exist
     * @private
     */
    _createUIContainers() {
        // Create modal container if it doesn't exist
        if (!this.elements.modal) {
            const modalContainer = document.createElement('div');
            modalContainer.id = 'modal-container';
            modalContainer.className = 'modal-container hidden';
            document.body.appendChild(modalContainer);
            this.elements.modal = modalContainer;
        }
        
        // Create toast container if it doesn't exist
        if (!this.elements.toast) {
            const toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
            this.elements.toast = toastContainer;
        }
    }

    /**
     * Initialize tooltips
     * @private
     */
    _initTooltips() {
        // Clear existing tooltips
        this.tooltips.forEach(tooltip => {
            if (tooltip.element) {
                tooltip.element.removeEventListener('mouseenter', tooltip.mouseEnterHandler);
                tooltip.element.removeEventListener('mouseleave', tooltip.mouseLeaveHandler);
                tooltip.element.removeEventListener('focus', tooltip.mouseEnterHandler);
                tooltip.element.removeEventListener('blur', tooltip.mouseLeaveHandler);
            }
        });
        this.tooltips = [];
        
        // Find all elements with data-tooltip attribute
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        
        tooltipElements.forEach(element => {
            const tooltip = element.getAttribute('data-tooltip');
            if (!tooltip) return;
            
            const mouseEnterHandler = () => this.showTooltip(element, tooltip);
            const mouseLeaveHandler = () => this.hideTooltip(element);
            
            element.addEventListener('mouseenter', mouseEnterHandler);
            element.addEventListener('mouseleave', mouseLeaveHandler);
            element.addEventListener('focus', mouseEnterHandler);
            element.addEventListener('blur', mouseLeaveHandler);
            
            this.tooltips.push({
                element,
                mouseEnterHandler,
                mouseLeaveHandler
            });
        });
    }

    /**
     * Initialize tab navigation
     * @private
     */
    _initTabNavigation() {
        // Find all tab navigation links
        const tabLinks = document.querySelectorAll('[data-tab-link]');
        
        tabLinks.forEach(link => {
            const tabId = link.getAttribute('data-tab-link');
            if (!tabId) return;
            
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(tabId);
            });
        });
        
        // Activate default tab
        this.switchTab(this.activeTab);
    }

    /**
     * Initialize global event listeners
     * @private
     */
    _initEventListeners() {
        // Listen for keyboard shortcuts
        document.addEventListener('keydown', this._handleKeyDown.bind(this));
        
        // Listen for resize events
        window.addEventListener('resize', this._handleResize.bind(this));
        
        // Listen for visibility change
        document.addEventListener('visibilitychange', this._handleVisibilityChange.bind(this));
        
        // Listen for online/offline events
        window.addEventListener('online', this._handleOnlineStatus.bind(this));
        window.addEventListener('offline', this._handleOnlineStatus.bind(this));
    }

    /**
     * Handle keyboard shortcuts
     * @private
     * @param {KeyboardEvent} event - Keyboard event
     */
    _handleKeyDown(event) {
        // Close modal with Escape key
        if (event.key === 'Escape' && this.modalStack.length > 0) {
            this.closeModal();
            event.preventDefault();
            return;
        }
        
        // Dispatch event to registered handlers
        if (this.eventHandlers.keydown) {
            this.eventHandlers.keydown.forEach(handler => handler(event));
        }
    }

    /**
     * Handle window resize
     * @private
     */
    _handleResize() {
        // Notify resize observers
        this.resizeObservers.forEach(observer => observer());
        
        // Dispatch event to registered handlers
        if (this.eventHandlers.resize) {
            this.eventHandlers.resize.forEach(handler => handler());
        }
    }

    /**
     * Handle visibility change
     * @private
     */
    _handleVisibilityChange() {
        const isVisible = document.visibilityState === 'visible';
        
        // Dispatch event to registered handlers
        if (this.eventHandlers.visibilityChange) {
            this.eventHandlers.visibilityChange.forEach(handler => handler(isVisible));
        }
    }

    /**
     * Handle online/offline status
     * @private
     */
    _handleOnlineStatus() {
        const isOnline = navigator.onLine;
        
        // Show toast notification
        if (isOnline) {
            this.showToast('You are back online', 'success');
        } else {
            this.showToast('You are offline. Some features may be unavailable.', 'warning', 0);
        }
        
        // Dispatch event to registered handlers
        if (this.eventHandlers.onlineStatus) {
            this.eventHandlers.onlineStatus.forEach(handler => handler(isOnline));
        }
    }

    /**
     * Register an event handler
     * @param {string} eventType - Event type
     * @param {Function} handler - Event handler
     * @returns {Function} Function to unregister the handler
     */
    on(eventType, handler) {
        if (!this.eventHandlers[eventType]) {
            this.eventHandlers[eventType] = [];
        }
        
        this.eventHandlers[eventType].push(handler);
        
        // Return function to unregister the handler
        return () => {
            this.off(eventType, handler);
        };
    }

    /**
     * Unregister an event handler
     * @param {string} eventType - Event type
     * @param {Function} handler - Event handler
     */
    off(eventType, handler) {
        if (!this.eventHandlers[eventType]) return;
        
        this.eventHandlers[eventType] = this.eventHandlers[eventType].filter(h => h !== handler);
    }

    /**
     * Add a resize observer
     * @param {Function} observer - Resize observer function
     * @returns {Function} Function to remove the observer
     */
    addResizeObserver(observer) {
        this.resizeObservers.push(observer);
        
        // Return function to remove the observer
        return () => {
            this.resizeObservers = this.resizeObservers.filter(o => o !== observer);
        };
    }

    /**
     * Switch to a different tab
     * @param {string} tabId - Tab ID
     */
    switchTab(tabId) {
        // Update active tab
        this.activeTab = tabId;
        
        // Update tab links
        const tabLinks = document.querySelectorAll('[data-tab-link]');
        tabLinks.forEach(link => {
            const linkTabId = link.getAttribute('data-tab-link');
            if (linkTabId === tabId) {
                link.classList.add('active');
                link.setAttribute('aria-selected', 'true');
            } else {
                link.classList.remove('active');
                link.setAttribute('aria-selected', 'false');
            }
        });
        
        // Update tab content
        const tabContents = document.querySelectorAll('[data-tab-content]');
        tabContents.forEach(content => {
            const contentTabId = content.getAttribute('data-tab-content');
            if (contentTabId === tabId) {
                content.classList.remove('hidden');
                content.setAttribute('aria-hidden', 'false');
            } else {
                content.classList.add('hidden');
                content.setAttribute('aria-hidden', 'true');
            }
        });
        
        // Dispatch tab change event
        if (this.eventHandlers.tabChange) {
            this.eventHandlers.tabChange.forEach(handler => handler(tabId));
        }
    }

    /**
     * Show a modal dialog
     * @param {string} title - Modal title
     * @param {string} content - Modal content (HTML)
     * @param {Object} options - Modal options
     * @param {boolean} options.closable - Whether the modal can be closed
     * @param {boolean} options.wide - Whether the modal should be wide
     * @param {boolean} options.fullscreen - Whether the modal should be fullscreen
     * @param {Function} options.onClose - Callback when modal is closed
     * @returns {Object} Modal control object
     */
    showModal(title, content, options = {}) {
        const {
            closable = true,
            wide = false,
            fullscreen = false,
            onClose = null
        } = options;
        
        // Create modal element
        const modalId = `modal-${Date.now()}`;
        const modalElement = document.createElement('div');
        modalElement.id = modalId;
        modalElement.className = `modal ${wide ? 'modal-wide' : ''} ${fullscreen ? 'modal-fullscreen' : ''}`;
        modalElement.setAttribute('role', 'dialog');
        modalElement.setAttribute('aria-modal', 'true');
        modalElement.setAttribute('aria-labelledby', `${modalId}-title`);
        
        // Create modal content
        modalElement.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 id="${modalId}-title" class="modal-title">${title}</h2>
                    ${closable ? '<button class="modal-close" aria-label="Close">×</button>' : ''}
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        
        // Add modal to container
        this.elements.modal.appendChild(modalElement);
        this.elements.modal.classList.remove('hidden');
        
        // Add to modal stack
        this.modalStack.push({
            id: modalId,
            element: modalElement,
            onClose
        });
        
        // Add event listeners
        if (closable) {
            const closeButton = modalElement.querySelector('.modal-close');
            closeButton.addEventListener('click', () => this.closeModal(modalId));
            
            // Close on click outside
            modalElement.addEventListener('click', (e) => {
                if (e.target === modalElement) {
                    this.closeModal(modalId);
                }
            });
        }
        
        // Initialize tooltips in modal
        this._initTooltips();
        
        // Return modal control object
        return {
            id: modalId,
            close: () => this.closeModal(modalId),
            getElement: () => modalElement
        };
    }

    /**
     * Close a modal dialog
     * @param {string} modalId - Modal ID (optional, closes the top modal if not provided)
     * @returns {boolean} Success status
     */
    closeModal(modalId = null) {
        // If no modal ID is provided, close the top modal
        if (!modalId && this.modalStack.length > 0) {
            modalId = this.modalStack[this.modalStack.length - 1].id;
        }
        
        // Find the modal in the stack
        const modalIndex = this.modalStack.findIndex(modal => modal.id === modalId);
        if (modalIndex === -1) return false;
        
        // Get the modal
        const modal = this.modalStack[modalIndex];
        
        // Remove the modal from the DOM
        if (modal.element && modal.element.parentNode) {
            modal.element.parentNode.removeChild(modal.element);
        }
        
        // Remove the modal from the stack
        this.modalStack.splice(modalIndex, 1);
        
        // Hide the modal container if there are no more modals
        if (this.modalStack.length === 0) {
            this.elements.modal.classList.add('hidden');
        }
        
        // Call the onClose callback
        if (modal.onClose) {
            modal.onClose();
        }
        
        return true;
    }

    /**
     * Show a confirmation dialog
     * @param {string} title - Dialog title
     * @param {string} message - Dialog message
     * @param {Object} options - Dialog options
     * @param {string} options.confirmText - Confirm button text
     * @param {string} options.cancelText - Cancel button text
     * @param {string} options.confirmClass - Confirm button CSS class
     * @returns {Promise<boolean>} Promise that resolves to true if confirmed, false if cancelled
     */
    showConfirmation(title, message, options = {}) {
        const {
            confirmText = 'Confirm',
            cancelText = 'Cancel',
            confirmClass = 'bg-red-600 hover:bg-red-700'
        } = options;
        
        return new Promise((resolve) => {
            // Create confirmation dialog content
            const content = `
                <div class="confirmation-dialog">
                    <p class="mb-4">${message}</p>
                    <div class="flex justify-end space-x-2">
                        <button id="confirm-cancel" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                            ${cancelText}
                        </button>
                        <button id="confirm-ok" class="${confirmClass} text-white font-bold py-2 px-4 rounded">
                            ${confirmText}
                        </button>
                    </div>
                </div>
            `;
            
            // Show the modal
            const modal = this.showModal(title, content);
            
            // Add event listeners
            const confirmButton = document.getElementById('confirm-ok');
            const cancelButton = document.getElementById('confirm-cancel');
            
            confirmButton.addEventListener('click', () => {
                modal.close();
                resolve(true);
            });
            
            cancelButton.addEventListener('click', () => {
                modal.close();
                resolve(false);
            });
            
            // Focus the cancel button by default (safer option)
            cancelButton.focus();
        });
    }

    /**
     * Show a prompt dialog
     * @param {string} title - Dialog title
     * @param {string} message - Dialog message
     * @param {string} defaultValue - Default input value
     * @param {Object} options - Dialog options
     * @param {string} options.confirmText - Confirm button text
     * @param {string} options.cancelText - Cancel button text
     * @param {string} options.inputType - Input type (text, number, etc.)
     * @param {string} options.placeholder - Input placeholder
     * @returns {Promise<string|null>} Promise that resolves to the input value if confirmed, null if cancelled
     */
    showPrompt(title, message, defaultValue = '', options = {}) {
        const {
            confirmText = 'OK',
            cancelText = 'Cancel',
            inputType = 'text',
            placeholder = ''
        } = options;
        
        return new Promise((resolve) => {
            // Create prompt dialog content
            const content = `
                <div class="prompt-dialog">
                    <p class="mb-2">${message}</p>
                    <input 
                        type="${inputType}" 
                        id="prompt-input" 
                        class="w-full p-2 border border-gray-300 rounded mb-4" 
                        value="${defaultValue}"
                        placeholder="${placeholder}"
                    >
                    <div class="flex justify-end space-x-2">
                        <button id="prompt-cancel" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                            ${cancelText}
                        </button>
                        <button id="prompt-ok" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            ${confirmText}
                        </button>
                    </div>
                </div>
            `;
            
            // Show the modal
            const modal = this.showModal(title, content);
            
            // Add event listeners
            const promptInput = document.getElementById('prompt-input');
            const confirmButton = document.getElementById('prompt-ok');
            const cancelButton = document.getElementById('prompt-cancel');
            
            confirmButton.addEventListener('click', () => {
                modal.close();
                resolve(promptInput.value);
            });
            
            cancelButton.addEventListener('click', () => {
                modal.close();
                resolve(null);
            });
            
            // Handle Enter key
            promptInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    modal.close();
                    resolve(promptInput.value);
                }
            });
            
            // Focus the input
            promptInput.focus();
            promptInput.select();
        });
    }

    /**
     * Show a toast notification
     * @param {string} message - Toast message
     * @param {string} type - Toast type (info, success, warning, error)
     * @param {number} duration - Toast duration in milliseconds (0 for persistent)
     */
    showToast(message, type = 'info', duration = 3000) {
        // Add toast to queue
        this.toastQueue.push({ message, type, duration });
        
        // Process queue if not already processing
        if (!this.isProcessingToasts) {
            this._processToastQueue();
        }
    }

    /**
     * Process toast queue
     * @private
     */
    async _processToastQueue() {
        if (this.toastQueue.length === 0) {
            this.isProcessingToasts = false;
            return;
        }
        
        this.isProcessingToasts = true;
        
        // Get the next toast
        const { message, type, duration } = this.toastQueue.shift();
        
        // Create toast element
        const toastId = `toast-${Date.now()}`;
        const toastElement = document.createElement('div');
        toastElement.id = toastId;
        toastElement.className = `toast toast-${type}`;
        toastElement.setAttribute('role', 'alert');
        
        // Add icon based on type
        let icon = '';
        switch (type) {
            case 'success':
                icon = '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>';
                break;
            case 'warning':
                icon = '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>';
                break;
            case 'error':
                icon = '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>';
                break;
            default: // info
                icon = '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>';
                break;
        }
        
        // Create toast content
        toastElement.innerHTML = `
            <div class="toast-content">
                <div class="toast-icon">${icon}</div>
                <div class="toast-message">${message}</div>
                <button class="toast-close" aria-label="Close">×</button>
            </div>
            ${duration > 0 ? '<div class="toast-progress"></div>' : ''}
        `;
        
        // Add to container
        this.elements.toast.appendChild(toastElement);
        
        // Animate in
        setTimeout(() => {
            toastElement.classList.add('show');
        }, 10);
        
        // Add progress animation if duration > 0
        if (duration > 0) {
            const progressBar = toastElement.querySelector('.toast-progress');
            progressBar.style.animationDuration = `${duration}ms`;
        }
        
        // Add close button event listener
        const closeButton = toastElement.querySelector('.toast-close');
        closeButton.addEventListener('click', () => {
            this._removeToast(toastId);
        });
        
        // Auto-remove after duration (if not persistent)
        if (duration > 0) {
            await new Promise(resolve => setTimeout(resolve, duration));
            this._removeToast(toastId);
        }
        
        // Process next toast
        this._processToastQueue();
    }

    /**
     * Remove a toast
     * @private
     * @param {string} toastId - Toast ID
     */
    _removeToast(toastId) {
        const toastElement = document.getElementById(toastId);
        if (!toastElement) return;
        
        // Animate out
        toastElement.classList.remove('show');
        
        // Remove after animation
        setTimeout(() => {
            if (toastElement.parentNode) {
                toastElement.parentNode.removeChild(toastElement);
            }
        }, 300);
    }

    /**
     * Show a tooltip
     * @param {HTMLElement} element - Element to show tooltip for
     * @param {string} content - Tooltip content
     */
    showTooltip(element, content) {
        // Check if tooltip already exists
        let tooltip = element.querySelector('.tooltip');
        if (tooltip) return;
        
        // Create tooltip element
        tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = content;
        tooltip.setAttribute('role', 'tooltip');
        
        // Add to element
        element.appendChild(tooltip);
        
        // Position tooltip
        this._positionTooltip(element, tooltip);
    }

    /**
     * Hide a tooltip
     * @param {HTMLElement} element - Element to hide tooltip for
     */
    hideTooltip(element) {
        const tooltip = element.querySelector('.tooltip');
        if (tooltip) {
            tooltip.parentNode.removeChild(tooltip);
        }
    }

    /**
     * Position a tooltip
     * @private
     * @param {HTMLElement} element - Element to position tooltip for
     * @param {HTMLElement} tooltip - Tooltip element
     */
    _positionTooltip(element, tooltip) {
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        // Default position (top)
        let top = rect.top - tooltipRect.height - 5;
        let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        
        // Check if tooltip would go off the top of the screen
        if (top < 5) {
            // Position below element
            top = rect.bottom + 5;
            tooltip.classList.add('tooltip-bottom');
        } else {
            tooltip.classList.add('tooltip-top');
        }
        
        // Check if tooltip would go off the left of the screen
        if (left < 5) {
            left = 5;
        }
        
        // Check if tooltip would go off the right of the screen
        if (left + tooltipRect.width > window.innerWidth - 5) {
            left = window.innerWidth - tooltipRect.width - 5;
        }
        
        // Set position
        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
    }

    /**
     * Show a loading spinner
     * @param {HTMLElement} container - Container element
     * @param {string} message - Loading message
     * @returns {Object} Loading spinner control object
     */
    showLoading(container, message = 'Loading...') {
        // Create loading element
        const loadingId = `loading-${Date.now()}`;
        const loadingElement = document.createElement('div');
        loadingElement.id = loadingId;
        loadingElement.className = 'loading-container';
        loadingElement.setAttribute('role', 'status');
        loadingElement.setAttribute('aria-live', 'polite');
        
        // Create loading content
        loadingElement.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-message">${message}</div>
        `;
        
        // Add to container
        container.appendChild(loadingElement);
        
        // Return control object
        return {
            id: loadingId,
            update: (newMessage) => {
                const messageElement = loadingElement.querySelector('.loading-message');
                if (messageElement) {
                    messageElement.textContent = newMessage;
                }
            },
            remove: () => {
                if (loadingElement.parentNode) {
                    loadingElement.parentNode.removeChild(loadingElement);
                }
            }
        };
    }

    /**
     * Enable drag and drop for an element
     * @param {HTMLElement} element - Element to make draggable
     * @param {Object} options - Drag options
     * @param {string} options.dragHandle - Selector for drag handle
     * @param {Function} options.onDragStart - Callback when drag starts
     * @param {Function} options.onDragEnd - Callback when drag ends
     * @param {Function} options.onDragOver - Callback when dragging over a target
     * @param {Function} options.onDrop - Callback when dropped on a target
     */
    enableDragDrop(element, options = {}) {
        const {
            dragHandle = null,
            onDragStart = null,
            onDragEnd = null,
            onDragOver = null,
            onDrop = null
        } = options;
        
        // Make element draggable
        element.setAttribute('draggable', 'true');
        
        // Add drag handle if specified
        if (dragHandle) {
            const handle = element.querySelector(dragHandle);
            if (handle) {
                handle.classList.add('drag-handle');
                handle.addEventListener('mousedown', () => {
                    element.setAttribute('draggable', 'true');
                });
                handle.addEventListener('mouseup', () => {
                    element.setAttribute('draggable', 'false');
                });
            }
        }
        
        // Add drag event listeners
        element.addEventListener('dragstart', (e) => {
            this.draggedElement = element;
            element.classList.add('dragging');
            
            // Set drag data
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', element.id);
            
            // Set drag image
            const dragImage = element.cloneNode(true);
            dragImage.style.opacity = '0.7';
            dragImage.style.position = 'absolute';
            dragImage.style.top = '-1000px';
            document.body.appendChild(dragImage);
            e.dataTransfer.setDragImage(dragImage, 0, 0);
            
            // Call onDragStart callback
            if (onDragStart) {
                onDragStart(element, e);
            }
            
            // Remove drag image after dragstart
            setTimeout(() => {
                document.body.removeChild(dragImage);
            }, 0);
        });
        
        element.addEventListener('dragend', (e) => {
            this.draggedElement = null;
            element.classList.remove('dragging');
            
            // Call onDragEnd callback
            if (onDragEnd) {
                onDragEnd(element, this.dropTarget, e);
            }
            
            this.dropTarget = null;
        });
        
        // Add drop target event listeners
        const dropTargets = document.querySelectorAll('.drop-target');
        dropTargets.forEach(target => {
            target.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                
                this.dropTarget = target;
                target.classList.add('drag-over');
                
                                // Call onDragOver callback
                if (onDragOver) {
                    onDragOver(element, target, e);
                }
            });
            
            target.addEventListener('dragleave', (e) => {
                target.classList.remove('drag-over');
                if (this.dropTarget === target) {
                    this.dropTarget = null;
                }
            });
            
            target.addEventListener('drop', (e) => {
                e.preventDefault();
                target.classList.remove('drag-over');
                
                // Call onDrop callback
                if (onDrop && this.draggedElement) {
                    onDrop(this.draggedElement, target, e);
                }
            });
        });
    }

    /**
     * Create a tabbed interface
     * @param {HTMLElement} container - Container element
     * @param {Object[]} tabs - Tab definitions
     * @param {string} tabs[].id - Tab ID
     * @param {string} tabs[].label - Tab label
     * @param {string} tabs[].content - Tab content (HTML)
     * @param {boolean} tabs[].active - Whether the tab is active
     * @returns {Object} Tabbed interface control object
     */
    createTabbedInterface(container, tabs) {
        // Create tab container
        const tabId = `tabs-${Date.now()}`;
        const tabContainer = document.createElement('div');
        tabContainer.id = tabId;
        tabContainer.className = 'tabbed-interface';
        
        // Create tab navigation
        const tabNav = document.createElement('div');
        tabNav.className = 'tab-nav';
        tabNav.setAttribute('role', 'tablist');
        
        // Create tab content container
        const tabContent = document.createElement('div');
        tabContent.className = 'tab-content';
        
        // Add tabs
        let activeTabId = null;
        tabs.forEach(tab => {
            // Create tab button
            const tabButton = document.createElement('button');
            tabButton.id = `${tabId}-tab-${tab.id}`;
            tabButton.className = 'tab-button';
            tabButton.textContent = tab.label;
            tabButton.setAttribute('role', 'tab');
            tabButton.setAttribute('aria-controls', `${tabId}-panel-${tab.id}`);
            
            // Create tab panel
            const tabPanel = document.createElement('div');
            tabPanel.id = `${tabId}-panel-${tab.id}`;
            tabPanel.className = 'tab-panel';
            tabPanel.innerHTML = tab.content;
            tabPanel.setAttribute('role', 'tabpanel');
            tabPanel.setAttribute('aria-labelledby', `${tabId}-tab-${tab.id}`);
            
            // Set active tab
            if (tab.active || activeTabId === null) {
                activeTabId = tab.id;
                tabButton.classList.add('active');
                tabButton.setAttribute('aria-selected', 'true');
                tabPanel.classList.add('active');
            } else {
                tabButton.setAttribute('aria-selected', 'false');
                tabPanel.classList.add('hidden');
            }
            
            // Add click event
            tabButton.addEventListener('click', () => {
                // Deactivate all tabs
                tabNav.querySelectorAll('.tab-button').forEach(button => {
                    button.classList.remove('active');
                    button.setAttribute('aria-selected', 'false');
                });
                
                tabContent.querySelectorAll('.tab-panel').forEach(panel => {
                    panel.classList.remove('active');
                    panel.classList.add('hidden');
                });
                
                // Activate clicked tab
                tabButton.classList.add('active');
                tabButton.setAttribute('aria-selected', 'true');
                tabPanel.classList.add('active');
                tabPanel.classList.remove('hidden');
                
                // Update active tab ID
                activeTabId = tab.id;
            });
            
            // Add to containers
            tabNav.appendChild(tabButton);
            tabContent.appendChild(tabPanel);
        });
        
        // Add to container
        tabContainer.appendChild(tabNav);
        tabContainer.appendChild(tabContent);
        container.appendChild(tabContainer);
        
        // Return control object
        return {
            id: tabId,
            getActiveTab: () => activeTabId,
            setActiveTab: (tabId) => {
                const tabButton = document.getElementById(`${tabId}-tab-${tabId}`);
                if (tabButton) {
                    tabButton.click();
                }
            },
            addTab: (tab) => {
                // Create tab button
                const tabButton = document.createElement('button');
                tabButton.id = `${tabId}-tab-${tab.id}`;
                tabButton.className = 'tab-button';
                tabButton.textContent = tab.label;
                tabButton.setAttribute('role', 'tab');
                tabButton.setAttribute('aria-controls', `${tabId}-panel-${tab.id}`);
                tabButton.setAttribute('aria-selected', 'false');
                
                // Create tab panel
                const tabPanel = document.createElement('div');
                tabPanel.id = `${tabId}-panel-${tab.id}`;
                tabPanel.className = 'tab-panel hidden';
                tabPanel.innerHTML = tab.content;
                tabPanel.setAttribute('role', 'tabpanel');
                tabPanel.setAttribute('aria-labelledby', `${tabId}-tab-${tab.id}`);
                
                // Add click event
                tabButton.addEventListener('click', () => {
                    // Deactivate all tabs
                    tabNav.querySelectorAll('.tab-button').forEach(button => {
                        button.classList.remove('active');
                        button.setAttribute('aria-selected', 'false');
                    });
                    
                    tabContent.querySelectorAll('.tab-panel').forEach(panel => {
                        panel.classList.remove('active');
                        panel.classList.add('hidden');
                    });
                    
                    // Activate clicked tab
                    tabButton.classList.add('active');
                    tabButton.setAttribute('aria-selected', 'true');
                    tabPanel.classList.add('active');
                    tabPanel.classList.remove('hidden');
                    
                    // Update active tab ID
                    activeTabId = tab.id;
                });
                
                // Add to containers
                tabNav.appendChild(tabButton);
                tabContent.appendChild(tabPanel);
                
                // Activate if specified
                if (tab.active) {
                    tabButton.click();
                }
            },
            removeTab: (tabId) => {
                const tabButton = document.getElementById(`${tabId}-tab-${tabId}`);
                const tabPanel = document.getElementById(`${tabId}-panel-${tabId}`);
                
                if (tabButton) {
                    tabButton.parentNode.removeChild(tabButton);
                }
                
                if (tabPanel) {
                    tabPanel.parentNode.removeChild(tabPanel);
                }
                
                // If active tab was removed, activate first tab
                if (activeTabId === tabId) {
                    const firstTabButton = tabNav.querySelector('.tab-button');
                    if (firstTabButton) {
                        firstTabButton.click();
                    } else {
                        activeTabId = null;
                    }
                }
            }
        };
    }

    /**
     * Create a collapsible section
     * @param {HTMLElement} container - Container element
     * @param {string} title - Section title
     * @param {string} content - Section content (HTML)
     * @param {Object} options - Options
     * @param {boolean} options.expanded - Whether the section is expanded
     * @param {string} options.titleClass - CSS class for the title
     * @param {string} options.contentClass - CSS class for the content
     * @returns {Object} Collapsible section control object
     */
    createCollapsible(container, title, content, options = {}) {
        const {
            expanded = false,
            titleClass = '',
            contentClass = ''
        } = options;
        
        // Create collapsible container
        const collapsibleId = `collapsible-${Date.now()}`;
        const collapsibleContainer = document.createElement('div');
        collapsibleContainer.id = collapsibleId;
        collapsibleContainer.className = 'collapsible';
        
        // Create header
        const header = document.createElement('div');
        header.className = `collapsible-header ${titleClass}`;
        header.innerHTML = `
            <span class="collapsible-title">${title}</span>
            <span class="collapsible-icon">${expanded ? '▼' : '►'}</span>
        `;
        
        // Create content
        const contentElement = document.createElement('div');
        contentElement.className = `collapsible-content ${contentClass}`;
        contentElement.innerHTML = content;
        
        // Set initial state
        if (!expanded) {
            contentElement.style.display = 'none';
        }
        
        // Add click event
        header.addEventListener('click', () => {
            const isExpanded = contentElement.style.display !== 'none';
            const icon = header.querySelector('.collapsible-icon');
            
            if (isExpanded) {
                contentElement.style.display = 'none';
                icon.textContent = '►';
            } else {
                contentElement.style.display = 'block';
                icon.textContent = '▼';
            }
        });
        
        // Add to container
        collapsibleContainer.appendChild(header);
        collapsibleContainer.appendChild(contentElement);
        container.appendChild(collapsibleContainer);
        
        // Return control object
        return {
            id: collapsibleId,
            isExpanded: () => contentElement.style.display !== 'none',
            expand: () => {
                contentElement.style.display = 'block';
                header.querySelector('.collapsible-icon').textContent = '▼';
            },
            collapse: () => {
                contentElement.style.display = 'none';
                header.querySelector('.collapsible-icon').textContent = '►';
            },
            toggle: () => {
                const isExpanded = contentElement.style.display !== 'none';
                if (isExpanded) {
                    contentElement.style.display = 'none';
                    header.querySelector('.collapsible-icon').textContent = '►';
                } else {
                    contentElement.style.display = 'block';
                    header.querySelector('.collapsible-icon').textContent = '▼';
                }
            },
            updateContent: (newContent) => {
                contentElement.innerHTML = newContent;
            },
            updateTitle: (newTitle) => {
                header.querySelector('.collapsible-title').textContent = newTitle;
            }
        };
    }

    /**
     * Create a context menu
     * @param {HTMLElement} element - Element to attach context menu to
     * @param {Object[]} items - Menu items
     * @param {string} items[].label - Item label
     * @param {Function} items[].action - Item action
     * @param {boolean} items[].divider - Whether to add a divider after this item
     * @param {string} items[].icon - Item icon (HTML)
     */
    createContextMenu(element, items) {
        // Add context menu event
        element.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            
            // Remove any existing context menus
            document.querySelectorAll('.context-menu').forEach(menu => {
                menu.parentNode.removeChild(menu);
            });
            
            // Create context menu
            const menuId = `context-menu-${Date.now()}`;
            const menu = document.createElement('div');
            menu.id = menuId;
            menu.className = 'context-menu';
            menu.setAttribute('role', 'menu');
            
            // Add items
            items.forEach(item => {
                if (item.divider) {
                    const divider = document.createElement('div');
                    divider.className = 'context-menu-divider';
                    menu.appendChild(divider);
                } else {
                    const menuItem = document.createElement('div');
                    menuItem.className = 'context-menu-item';
                    menuItem.setAttribute('role', 'menuitem');
                    menuItem.innerHTML = `
                        ${item.icon ? `<span class="context-menu-icon">${item.icon}</span>` : ''}
                        <span class="context-menu-label">${item.label}</span>
                    `;
                    
                    // Add click event
                    menuItem.addEventListener('click', () => {
                        // Close menu
                        document.body.removeChild(menu);
                        
                        // Call action
                        if (item.action) {
                            item.action();
                        }
                    });
                    
                    menu.appendChild(menuItem);
                }
            });
            
            // Position menu
            menu.style.top = `${e.clientY}px`;
            menu.style.left = `${e.clientX}px`;
            
            // Add to body
            document.body.appendChild(menu);
            
            // Adjust position if menu goes off screen
            const menuRect = menu.getBoundingClientRect();
            if (menuRect.right > window.innerWidth) {
                menu.style.left = `${window.innerWidth - menuRect.width - 5}px`;
            }
            if (menuRect.bottom > window.innerHeight) {
                menu.style.top = `${window.innerHeight - menuRect.height - 5}px`;
            }
            
            // Close menu on click outside
            const closeMenu = (e) => {
                if (!menu.contains(e.target)) {
                    document.body.removeChild(menu);
                    document.removeEventListener('click', closeMenu);
                }
            };
            
            // Add delay to prevent immediate closing
            setTimeout(() => {
                document.addEventListener('click', closeMenu);
            }, 100);
        });
    }

    /**
     * Create a dropdown menu
     * @param {HTMLElement} button - Button element
     * @param {Object[]} items - Menu items
     * @param {string} items[].label - Item label
     * @param {Function} items[].action - Item action
     * @param {boolean} items[].divider - Whether to add a divider after this item
     * @param {string} items[].icon - Item icon (HTML)
     */
    createDropdownMenu(button, items) {
        // Create dropdown container
        const dropdownId = `dropdown-${Date.now()}`;
        const dropdown = document.createElement('div');
        dropdown.id = dropdownId;
        dropdown.className = 'dropdown';
        
        // Create dropdown menu
        const menu = document.createElement('div');
        menu.className = 'dropdown-menu hidden';
        menu.setAttribute('role', 'menu');
        
        // Add items
        items.forEach(item => {
            if (item.divider) {
                const divider = document.createElement('div');
                divider.className = 'dropdown-divider';
                menu.appendChild(divider);
            } else {
                const menuItem = document.createElement('div');
                menuItem.className = 'dropdown-item';
                menuItem.setAttribute('role', 'menuitem');
                menuItem.innerHTML = `
                    ${item.icon ? `<span class="dropdown-icon">${item.icon}</span>` : ''}
                    <span class="dropdown-label">${item.label}</span>
                `;
                
                // Add click event
                menuItem.addEventListener('click', () => {
                    // Close menu
                    menu.classList.add('hidden');
                    
                    // Call action
                    if (item.action) {
                        item.action();
                    }
                });
                
                menu.appendChild(menuItem);
            }
        });
        
        // Add to container
        dropdown.appendChild(menu);
        button.parentNode.insertBefore(dropdown, button.nextSibling);
        
        // Position menu
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Toggle menu
            menu.classList.toggle('hidden');
            
            // Position menu
            const buttonRect = button.getBoundingClientRect();
            menu.style.top = `${buttonRect.bottom}px`;
            menu.style.left = `${buttonRect.left}px`;
            
            // Adjust position if menu goes off screen
            const menuRect = menu.getBoundingClientRect();
            if (menuRect.right > window.innerWidth) {
                menu.style.left = `${window.innerWidth - menuRect.width - 5}px`;
            }
        });
        
        // Close menu on click outside
        document.addEventListener('click', (e) => {
            if (!button.contains(e.target) && !menu.contains(e.target)) {
                menu.classList.add('hidden');
            }
        });
    }

    /**
     * Show an alert
     * @param {string} message - Alert message
     * @param {string} type - Alert type (info, success, warning, error)
     */
    showAlert(message, type = 'info') {
        // Create alert element
        const alertId = `alert-${Date.now()}`;
        const alertElement = document.createElement('div');
        alertElement.id = alertId;
        alertElement.className = `alert alert-${type}`;
        alertElement.setAttribute('role', 'alert');
        
        // Add icon based on type
        let icon = '';
        switch (type) {
            case 'success':
                icon = '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>';
                break;
            case 'warning':
                icon = '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>';
                break;
            case 'error':
                icon = '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>';
                break;
            default: // info
                icon = '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>';
                break;
        }
        
        // Create alert content
        alertElement.innerHTML = `
            <div class="alert-content">
                <div class="alert-icon">${icon}</div>
                <div class="alert-message">${message}</div>
                <button class="alert-close" aria-label="Close">×</button>
            </div>
        `;
        
        // Add to app container
        this.elements.app.appendChild(alertElement);
        
        // Add close button event listener
        const closeButton = alertElement.querySelector('.alert-close');
        closeButton.addEventListener('click', () => {
            alertElement.parentNode.removeChild(alertElement);
        });
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alertElement.parentNode) {
                alertElement.parentNode.removeChild(alertElement);
            }
        }, 5000);
    }

    /**
     * Create a form with validation
     * @param {HTMLElement} container - Container element
     * @param {Object[]} fields - Form fields
     * @param {string} fields[].name - Field name
     * @param {string} fields[].label - Field label
     * @param {string} fields[].type - Field type
     * @param {string} fields[].placeholder - Field placeholder
     * @param {boolean} fields[].required - Whether the field is required
     * @param {string} fields[].value - Field value
     * @param {Function} fields[].validate - Validation function
     * @param {Object} options - Form options
     * @param {string} options.submitText - Submit button text
     * @param {string} options.cancelText - Cancel button text
     * @param {Function} options.onSubmit - Submit callback
     * @param {Function} options.onCancel - Cancel callback
     * @returns {Object} Form control object
     */
    createForm(container, fields, options = {}) {
        const {
            submitText = 'Submit',
            cancelText = 'Cancel',
            onSubmit = null,
            onCancel = null
        } = options;
        
        // Create form element
        const formId = `form-${Date.now()}`;
        const form = document.createElement('form');
        form.id = formId;
        form.className = 'form';
        form.noValidate = true;
        
        // Add fields
        fields.forEach(field => {
            const fieldId = `${formId}-${field.name}`;
            const fieldContainer = document.createElement('div');
            fieldContainer.className = 'form-group';
            
            // Create label
            const label = document.createElement('label');
            label.htmlFor = fieldId;
            label.className = 'form-label';
            label.textContent = field.label;
            if (field.required) {
                label.innerHTML += ' <span class="required">*</span>';
            }
            
            // Create input
            let input;
            if (field.type === 'textarea') {
                input = document.createElement('textarea');
                input.rows = field.rows || 3;
            } else if (field.type === 'select') {
                input = document.createElement('select');
                if (field.options) {
                    field.options.forEach(option => {
                        const optionElement = document.createElement('option');
                        optionElement.value = option.value;
                        optionElement.textContent = option.label;
                        if (option.value === field.value) {
                            optionElement.selected = true;
                        }
                        input.appendChild(optionElement);
                    });
                }
            } else {
                input = document.createElement('input');
                input.type = field.type || 'text';
            }
            
            input.id = fieldId;
            input.name = field.name;
            input.className = 'form-control';
            
            if (field.placeholder) {
                input.placeholder = field.placeholder;
            }
            
            if (field.required) {
                input.required = true;
            }
            
            if (field.value !== undefined) {
                input.value = field.value;
            }
            
            if (field.min !== undefined) {
                input.min = field.min;
            }
            
            if (field.max !== undefined) {
                input.max = field.max;
            }
            
            if (field.step !== undefined) {
                input.step = field.step;
            }
            
            if (field.pattern) {
                input.pattern = field.pattern;
            }
            
            // Create error message container
            const errorContainer = document.createElement('div');
            errorContainer.className = 'form-error hidden';
            errorContainer.id = `${fieldId}-error`;
            
            // Add validation
            input.addEventListener('blur', () => {
                this._validateField(input, field.validate, errorContainer);
            });
            
            // Add to container
            fieldContainer.appendChild(label);
            fieldContainer.appendChild(input);
            fieldContainer.appendChild(errorContainer);
            form.appendChild(fieldContainer);
        });
        
        // Add buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'form-buttons';
        
        if (cancelText) {
            const cancelButton = document.createElement('button');
            cancelButton.type = 'button';
            cancelButton.className = 'btn btn-secondary';
            cancelButton.textContent = cancelText;
            
            cancelButton.addEventListener('click', () => {
                if (onCancel) {
                    onCancel();
                }
            });
            
            buttonContainer.appendChild(cancelButton);
        }
        
        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.className = 'btn btn-primary';
        submitButton.textContent = submitText;
        
        buttonContainer.appendChild(submitButton);
        form.appendChild(buttonContainer);
        
        // Add submit event
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Validate all fields
            let isValid = true;
            const formData = {};
            
            fields.forEach(field => {
                const input = form.elements[field.name];
                const errorContainer = document.getElementById(`${input.id}-error`);
                
                const fieldValid = this._validateField(input, field.validate, errorContainer);
                if (!fieldValid) {
                    isValid = false;
                }
                
                // Collect form data
                formData[field.name] = input.value;
            });
            
            // Submit if valid
            if (isValid && onSubmit) {
                onSubmit(formData);
            }
        });
        
        // Add to container
        container.appendChild(form);
        
        // Return form control object
        return {
            id: formId,
            getValues: () => {
                const formData = {};
                fields.forEach(field => {
                    formData[field.name] = form.elements[field.name].value;
                });
                return formData;
            },
            setValues: (values) => {
                Object.entries(values).forEach(([name, value]) => {
                    if (form.elements[name]) {
                        form.elements[name].value = value;
                    }
                });
            },
            validate: () => {
                let isValid = true;
                fields.forEach(field => {
                    const input = form.elements[field.name];
                    const errorContainer = document.getElementById(`${input.id}-error`);
                    
                    const fieldValid = this._validateField(input, field.validate, errorContainer);
                    if (!fieldValid) {
                        isValid = false;
                    }
                });
                return isValid;
            },
            reset: () => {
                form.reset();
                form.querySelectorAll('.form-error').forEach(error => {
                    error.classList.add('hidden');
                    error.textContent = '';
                });
            }
        };
    }

    /**
     * Validate a form field
     * @private
     * @param {HTMLElement} input - Input element
     * @param {Function} validateFn - Custom validation function
     * @param {HTMLElement} errorContainer - Error container element
     * @returns {boolean} Whether the field is valid
     */
    _validateField(input, validateFn, errorContainer) {
        // Clear previous error
        errorContainer.classList.add('hidden');
        errorContainer.textContent = '';
        
        // Check if field is required and empty
        if (input.required && !input.value.trim()) {
            errorContainer.textContent = 'This field is required';
            errorContainer.classList.remove('hidden');
            return false;
        }
        
        // Check pattern
        if (input.pattern && input.value) {
            const regex = new RegExp(input.pattern);
            if (!regex.test(input.value)) {
                errorContainer.textContent = 'Please enter a valid value';
                errorContainer.classList.remove('hidden');
                return false;
            }
        }
        
        // Check min/max for number inputs
        if (input.type === 'number' && input.value) {
            const value = parseFloat(input.value);
            
            if (input.min !== undefined && value < parseFloat(input.min)) {
                errorContainer.textContent = `Value must be at least ${input.min}`;
                errorContainer.classList.remove('hidden');
                return false;
            }
            
            if (input.max !== undefined && value > parseFloat(input.max)) {
                errorContainer.textContent = `Value must be at most ${input.max}`;
                errorContainer.classList.remove('hidden');
                return false;
            }
        }
        
        // Custom validation
        if (validateFn && input.value) {
            const error = validateFn(input.value);
            if (error) {
                errorContainer.textContent = error;
                errorContainer.classList.remove('hidden');
                return false;
            }
        }
        
        return true;
    }
}

// Export the UI class
export default UI;
