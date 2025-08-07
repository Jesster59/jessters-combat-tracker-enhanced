/**
 * Initiative Tracker for Jesster's Combat Tracker
 * Handles initiative ordering, ties, and manual adjustments
 */
class InitiativeTracker {
  constructor(app) {
    this.app = app;
    this.initiativeOrder = [];
    this.currentIndex = 0;
    this.draggedElement = null;
    this.draggedOverElement = null;
    console.log("Initiative.js loaded successfully");
  }
  
  /**
   * Initialize the initiative tracker
   */
  init() {
    // Create the initiative sidebar if it doesn't exist
    this.createInitiativeSidebar();
    
    // Add event listener for initiative type changes
    const initiativeTypeSelect = document.getElementById('initiative-type');
    if (initiativeTypeSelect) {
      initiativeTypeSelect.addEventListener('change', () => {
        this.updateInitiativeDisplay();
      });
    }
  }
  
  /**
   * Create the initiative sidebar
   */
  createInitiativeSidebar() {
    // Check if sidebar already exists
    if (document.getElementById('initiative-sidebar')) return;
    
    // Create the sidebar container
    const sidebar = document.createElement('div');
    sidebar.id = 'initiative-sidebar';
    sidebar.className = 'fixed right-0 top-0 h-full bg-gray-800 w-64 shadow-lg transform translate-x-full transition-transform duration-300 ease-in-out z-40 flex flex-col';
    
    // Create the sidebar content
    sidebar.innerHTML = `
      <div class="p-4 border-b border-gray-700 flex justify-between items-center">
        <h3 class="text-xl font-bold text-yellow-400">Initiative Order</h3>
        <button id="close-initiative-sidebar" class="text-gray-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="p-4 border-b border-gray-700">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-gray-400">Drag to reorder</span>
          <button id="roll-initiative-btn" class="bg-yellow-600 hover:bg-yellow-700 text-white text-xs py-1 px-2 rounded">
            Roll All
          </button>
        </div>
      </div>
      <div id="initiative-list" class="flex-1 overflow-y-auto p-2">
        <!-- Initiative items will be inserted here -->
      </div>
      <div class="p-4 border-t border-gray-700">
        <button id="apply-initiative-order" class="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded">
          Apply Order
        </button>
      </div>
    `;
    
    // Add the sidebar to the document
    document.body.appendChild(sidebar);
    
    // Add event listeners
    document.getElementById('close-initiative-sidebar').addEventListener('click', () => {
      this.toggleInitiativeSidebar(false);
    });
    
    document.getElementById('roll-initiative-btn').addEventListener('click', () => {
      this.app.combat.rollAllInitiative();
    });
    
    document.getElementById('apply-initiative-order').addEventListener('click', () => {
      this.applyInitiativeOrder();
      this.toggleInitiativeSidebar(false);
    });
    
    // Create toggle button for the sidebar
    this.createInitiativeSidebarToggle();
  }
  
  /**
   * Create the toggle button for the initiative sidebar
   */
  createInitiativeSidebarToggle() {
    // Check if toggle already exists
    if (document.getElementById('initiative-sidebar-toggle')) return;
    
    // Create the toggle button
    const toggle = document.createElement('button');
    toggle.id = 'initiative-sidebar-toggle';
    toggle.className = 'fixed right-0 top-1/2 transform -translate-y-1/2 bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-2 rounded-l-lg shadow-lg z-30';
    toggle.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    `;
    
    // Add event listener
    toggle.addEventListener('click', () => {
      this.toggleInitiativeSidebar();
    });
    
    // Add the toggle to the document
    document.body.appendChild(toggle);
  }
  
  /**
   * Toggle the initiative sidebar
   * @param {boolean} [show] - Force show or hide
   */
  toggleInitiativeSidebar(show) {
    const sidebar = document.getElementById('initiative-sidebar');
    if (!sidebar) return;
    
    const isVisible = !sidebar.classList.contains('translate-x-full');
    
    if (show === undefined) {
      // Toggle
      if (isVisible) {
        sidebar.classList.add('translate-x-full');
      } else {
        this.updateInitiativeList();
        sidebar.classList.remove('translate-x-full');
      }
    } else if (show) {
      // Force show
      this.updateInitiativeList();
      sidebar.classList.remove('translate-x-full');
    } else {
      // Force hide
      sidebar.classList.add('translate-x-full');
    }
  }
  
  /**
   * Update the initiative list in the sidebar
   */
  updateInitiativeList() {
    const listElement = document.getElementById('initiative-list');
    if (!listElement) return;
    
    // Clear the list
    listElement.innerHTML = '';
    
    // Get all combatants
    const allCombatants = [
      ...Array.from(document.querySelectorAll('#heroes-list .combatant-card')),
      ...Array.from(document.querySelectorAll('#monsters-list .combatant-card'))
    ];
    
    // Sort by initiative
    const sortedCombatants = this.getSortedCombatants(allCombatants);
    
    // Store the current initiative order
    this.initiativeOrder = sortedCombatants.map(card => card.id);
    
    // Create the list items
    sortedCombatants.forEach((card, index) => {
      const name = card.querySelector('.combatant-name').textContent;
      const initiative = card.querySelector('.initiative-input').value || '0';
      const type = card.dataset.type;
      const isActive = card.classList.contains('active-turn');
      
      const item = document.createElement('div');
      item.className = `initiative-item p-2 mb-2 rounded-lg bg-gray-700 cursor-move flex items-center ${isActive ? 'border-2 border-yellow-400' : ''}`;
      item.dataset.id = card.id;
      item.dataset.index = index;
      item.draggable = true;
      
      // Get DEX modifier for display
      const hiddenData = card.querySelector('.hidden-data');
      let dexMod = 0;
      if (hiddenData && hiddenData.dataset.dex) {
        const dex = parseInt(hiddenData.dataset.dex) || 10;
        dexMod = Math.floor((dex - 10) / 2);
      }
      
      item.innerHTML = `
        <div class="flex-shrink-0 mr-2 text-center w-8 font-bold ${isActive ? 'text-yellow-400' : 'text-gray-300'}">
          ${initiative}
        </div>
        <div class="flex-grow">
          <div class="font-semibold ${type === 'hero' ? 'text-blue-300' : 'text-red-300'}">${name}</div>
          <div class="text-xs text-gray-400">DEX: ${dexMod >= 0 ? '+' : ''}${dexMod}</div>
        </div>
        <div class="flex-shrink-0 ml-2">
          <input type="number" class="initiative-adjust bg-gray-600 w-12 text-center rounded" value="${initiative}">
        </div>
      `;
      
      // Add drag and drop event listeners
      item.addEventListener('dragstart', (e) => this.handleDragStart(e));
      item.addEventListener('dragover', (e) => this.handleDragOver(e));
      item.addEventListener('dragleave', (e) => this.handleDragLeave(e));
      item.addEventListener('drop', (e) => this.handleDrop(e));
      item.addEventListener('dragend', (e) => this.handleDragEnd(e));
      
      // Add initiative adjustment event listener
      const initiativeInput = item.querySelector('.initiative-adjust');
      initiativeInput.addEventListener('change', (e) => {
        const newInitiative = e.target.value;
        const cardInitiativeInput = card.querySelector('.initiative-input');
        if (cardInitiativeInput) {
          cardInitiativeInput.value = newInitiative;
          this.updateInitiativeList(); // Refresh the list to reflect new order
        }
      });
      
      listElement.appendChild(item);
    });
  }
  
  /**
   * Get combatants sorted by initiative
   * @param {Array} combatants - Array of combatant elements
   * @returns {Array} - Sorted array of combatant elements
   */
  getSortedCombatants(combatants) {
    return combatants.sort((a, b) => {
      const aInit = parseInt(a.querySelector('.initiative-input').value) || 0;
      const bInit = parseInt(b.querySelector('.initiative-input').value) || 0;
      
      // If initiatives are tied, check DEX modifier
      if (aInit === bInit) {
        const aHiddenData = a.querySelector('.hidden-data');
        const bHiddenData = b.querySelector('.hidden-data');
        
        const aDex = aHiddenData ? parseInt(aHiddenData.dataset.dex) || 10 : 10;
        const bDex = bHiddenData ? parseInt(bHiddenData.dataset.dex) || 10 : 10;
        
        const aDexMod = Math.floor((aDex - 10) / 2);
        const bDexMod = Math.floor((bDex - 10) / 2);
        
        return bDexMod - aDexMod;
      }
      
      return bInit - aInit;
    });
  }
  
  /**
   * Handle drag start event
   * @param {DragEvent} e - The drag event
   */
  handleDragStart(e) {
    this.draggedElement = e.target;
    e.target.classList.add('bg-gray-600');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', e.target.dataset.id);
  }
  
  /**
   * Handle drag over event
   * @param {DragEvent} e - The drag event
   */
  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const target = e.target.closest('.initiative-item');
    if (target && target !== this.draggedElement) {
      this.draggedOverElement = target;
      
      // Add visual indicator
      const allItems = document.querySelectorAll('.initiative-item');
      allItems.forEach(item => {
        if (item !== this.draggedElement) {
          item.classList.remove('border-t-2', 'border-b-2', 'border-yellow-400');
        }
      });
      
      const draggedIndex = parseInt(this.draggedElement.dataset.index);
      const targetIndex = parseInt(target.dataset.index);
      
      if (draggedIndex < targetIndex) {
        target.classList.add('border-b-2', 'border-yellow-400');
      } else {
        target.classList.add('border-t-2', 'border-yellow-400');
      }
    }
  }
  
  /**
   * Handle drag leave event
   * @param {DragEvent} e - The drag event
   */
  handleDragLeave(e) {
    const target = e.target.closest('.initiative-item');
    if (target) {
      target.classList.remove('border-t-2', 'border-b-2', 'border-yellow-400');
    }
  }
  
  /**
   * Handle drop event
   * @param {DragEvent} e - The drag event
   */
  handleDrop(e) {
    e.preventDefault();
    
    const target = e.target.closest('.initiative-item');
    if (!target || target === this.draggedElement) return;
    
    const draggedId = e.dataTransfer.getData('text/plain');
    const draggedIndex = this.initiativeOrder.indexOf(draggedId);
    const targetIndex = this.initiativeOrder.indexOf(target.dataset.id);
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      // Reorder the initiative array
      this.initiativeOrder.splice(draggedIndex, 1);
      this.initiativeOrder.splice(targetIndex, 0, draggedId);
      
      // Update the UI
      this.updateInitiativeList();
    }
  }
  
  /**
   * Handle drag end event
   * @param {DragEvent} e - The drag event
   */
  handleDragEnd(e) {
    e.target.classList.remove('bg-gray-600');
    
    // Remove all drag indicators
    const allItems = document.querySelectorAll('.initiative-item');
    allItems.forEach(item => {
      item.classList.remove('border-t-2', 'border-b-2', 'border-yellow-400');
    });
    
    this.draggedElement = null;
    this.draggedOverElement = null;
  }
  
  /**
   * Apply the current initiative order to the combat tracker
   */
  applyInitiativeOrder() {
    // Update the app's initiative order
    if (this.app.combat) {
      this.app.combat.setInitiativeOrder(this.initiativeOrder);
      this.app.logEvent("Initiative order manually adjusted.");
    }
  }
  
  /**
   * Update the initiative display based on the current initiative type
   */
  updateInitiativeDisplay() {
    const initiativeType = document.getElementById('initiative-type')?.value || 'dynamic';
    const toggle = document.getElementById('initiative-sidebar-toggle');
    
    if (toggle) {
      // Only show the toggle for normal initiative
      if (initiativeType === 'normal') {
        toggle.classList.remove('hidden');
      } else {
        toggle.classList.add('hidden');
        this.toggleInitiativeSidebar(false); // Hide the sidebar
      }
    }
  }
  
  /**
   * Add initiative modifier display to a combatant card
   * @param {HTMLElement} card - The combatant card element
   */
  addInitiativeModifierDisplay(card) {
    if (!card) return;
    
    // Check if initiative modifier display already exists
    if (card.querySelector('.initiative-modifier-display')) return;
    
    // Get the initiative input
    const initiativeInput = card.querySelector('.initiative-input');
    if (!initiativeInput) return;
    
    // Get the DEX modifier
    const hiddenData = card.querySelector('.hidden-data');
    let dexMod = 0;
    if (hiddenData && hiddenData.dataset.dex) {
      const dex = parseInt(hiddenData.dataset.dex) || 10;
      dexMod = Math.floor((dex - 10) / 2);
    }
    
    // Create the modifier display
    const modifierDisplay = document.createElement('div');
    modifierDisplay.className = 'initiative-modifier-display text-xs text-gray-400 text-center';
    modifierDisplay.textContent = `DEX: ${dexMod >= 0 ? '+' : ''}${dexMod}`;
    
    // Insert after the initiative input
    initiativeInput.parentNode.insertBefore(modifierDisplay, initiativeInput.nextSibling);
  }
}
