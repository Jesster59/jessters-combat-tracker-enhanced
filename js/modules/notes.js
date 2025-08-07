/**
 * Combat Notes Manager for Jesster's Combat Tracker
 * Handles notes for combatants and the overall encounter
 */
class CombatNotesManager {
  constructor(app) {
    this.app = app;
    this.notes = {
      encounter: '',
      combatants: {}
    };
    console.log("Notes.js loaded successfully");
  }
  
  /**
   * Initialize the notes manager
   */
  init() {
    // Create the notes panel if it doesn't exist
    this.createNotesPanel();
    
    // Create toggle button for the notes panel
    this.createNotesPanelToggle();
  }
  
  /**
   * Create the notes panel
   */
  createNotesPanel() {
    // Check if panel already exists
    if (document.getElementById('notes-panel')) return;
    
    // Create the panel container
    const panel = document.createElement('div');
    panel.id = 'notes-panel';
    panel.className = 'fixed left-0 top-0 h-full bg-gray-800 w-80 shadow-lg transform -translate-x-full transition-transform duration-300 ease-in-out z-40 flex flex-col';
    
    // Create the panel content
    panel.innerHTML = `
      <div class="p-4 border-b border-gray-700 flex justify-between items-center">
        <h3 class="text-xl font-bold text-blue-400">Combat Notes</h3>
        <button id="close-notes-panel" class="text-gray-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="p-4 border-b border-gray-700">
        <h4 class="text-lg font-semibold text-gray-300 mb-2">Encounter Notes</h4>
        <textarea id="encounter-notes" class="w-full h-32 bg-gray-700 text-white rounded p-2" placeholder="Add notes about this encounter..."></textarea>
      </div>
      <div class="flex-1 overflow-y-auto p-4">
        <h4 class="text-lg font-semibold text-gray-300 mb-2">Combatant Notes</h4>
        <div id="combatant-notes-list" class="space-y-4">
          <!-- Combatant notes will be inserted here -->
        </div>
      </div>
      <div class="p-4 border-t border-gray-700">
        <button id="save-all-notes" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">
          Save All Notes
        </button>
      </div>
    `;
    
    // Add the panel to the document
    document.body.appendChild(panel);
    
    // Add event listeners
    document.getElementById('close-notes-panel').addEventListener('click', () => {
      this.toggleNotesPanel(false);
    });
    
    document.getElementById('save-all-notes').addEventListener('click', () => {
      this.saveAllNotes();
      this.toggleNotesPanel(false);
    });
    
    // Set up auto-save for encounter notes
    const encounterNotesTextarea = document.getElementById('encounter-notes');
    encounterNotesTextarea.addEventListener('input', () => {
      this.notes.encounter = encounterNotesTextarea.value;
    });
    
    // Load saved notes
    this.loadNotes();
  }
  
  /**
   * Create the toggle button for the notes panel
   */
  createNotesPanelToggle() {
    // Check if toggle already exists
    if (document.getElementById('notes-panel-toggle')) return;
    
    // Create the toggle button
    const toggle = document.createElement('button');
    toggle.id = 'notes-panel-toggle';
    toggle.className = 'fixed left-0 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-2 rounded-r-lg shadow-lg z-30';
    toggle.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
      </svg>
    `;
    
    // Add event listener
    toggle.addEventListener('click', () => {
      this.toggleNotesPanel();
    });
    
    // Add the toggle to the document
    document.body.appendChild(toggle);
  }
  
  /**
   * Toggle the notes panel
   * @param {boolean} [show] - Force show or hide
   */
  toggleNotesPanel(show) {
    const panel = document.getElementById('notes-panel');
    if (!panel) return;
    
    const isVisible = !panel.classList.contains('-translate-x-full');
    
    if (show === undefined) {
      // Toggle
      if (isVisible) {
        panel.classList.add('-translate-x-full');
      } else {
        this.updateCombatantNotesList();
        panel.classList.remove('-translate-x-full');
      }
    } else if (show) {
      // Force show
      this.updateCombatantNotesList();
      panel.classList.remove('-translate-x-full');
    } else {
      // Force hide
      panel.classList.add('-translate-x-full');
    }
  }
  
  /**
   * Update the combatant notes list in the panel
   */
  updateCombatantNotesList() {
    const listElement = document.getElementById('combatant-notes-list');
    if (!listElement) return;
    
    // Clear the list
    listElement.innerHTML = '';
    
    // Get all combatants
    const allCombatants = [
      ...Array.from(document.querySelectorAll('#heroes-list .combatant-card')),
      ...Array.from(document.querySelectorAll('#monsters-list .combatant-card'))
    ];
    
    if (allCombatants.length === 0) {
      listElement.innerHTML = '<p class="text-gray-500">No combatants added yet.</p>';
      return;
    }
    
    // Create note sections for each combatant
    allCombatants.forEach(card => {
      const id = card.id;
      const name = card.querySelector('.combatant-name').textContent;
      const type = card.dataset.type;
      
      const noteSection = document.createElement('div');
      noteSection.className = 'combatant-note-section';
      noteSection.innerHTML = `
        <div class="flex items-center justify-between mb-1">
          <h5 class="font-medium ${type === 'hero' ? 'text-blue-300' : 'text-red-300'}">${name}</h5>
          <span class="text-xs text-gray-400">${type === 'hero' ? 'Hero' : 'Monster'}</span>
        </div>
        <textarea id="note-${id}" class="w-full h-20 bg-gray-700 text-white rounded p-2 text-sm" placeholder="Notes for ${name}...">${this.notes.combatants[id] || ''}</textarea>
      `;
      
      // Add event listener for auto-save
      const textarea = noteSection.querySelector(`#note-${id}`);
      textarea.addEventListener('input', () => {
        this.notes.combatants[id] = textarea.value;
      });
      
      listElement.appendChild(noteSection);
    });
  }
  
  /**
   * Save all notes
   */
  saveAllNotes() {
    // Save encounter notes
    const encounterNotesTextarea = document.getElementById('encounter-notes');
    if (encounterNotesTextarea) {
      this.notes.encounter = encounterNotesTextarea.value;
    }
    
    // Save combatant notes
    const combatantTextareas = document.querySelectorAll('#combatant-notes-list textarea');
    combatantTextareas.forEach(textarea => {
      const id = textarea.id.replace('note-', '');
      this.notes.combatants[id] = textarea.value;
    });
    
    // Save to localStorage
    this.saveNotesToStorage();
    
    this.app.logEvent("Combat notes saved.");
  }
  
  /**
   * Load notes from storage
   */
  loadNotes() {
    try {
      const savedNotes = localStorage.getItem('jesstersCombatNotes');
      if (savedNotes) {
        this.notes = JSON.parse(savedNotes);
        
        // Update the encounter notes textarea
        const encounterNotesTextarea = document.getElementById('encounter-notes');
        if (encounterNotesTextarea) {
          encounterNotesTextarea.value = this.notes.encounter || '';
        }
      }
    } catch (error) {
      console.error("Error loading notes:", error);
    }
  }
  
  /**
   * Save notes to storage
   */
  saveNotesToStorage() {
    try {
      localStorage.setItem('jesstersCombatNotes', JSON.stringify(this.notes));
    } catch (error) {
      console.error("Error saving notes:", error);
    }
  }
  
  /**
   * Get notes for a specific combatant
   * @param {string} combatantId - The ID of the combatant
   * @returns {string} - The notes for the combatant
   */
  getCombatantNotes(combatantId) {
    return this.notes.combatants[combatantId] || '';
  }
  
  /**
   * Set notes for a specific combatant
   * @param {string} combatantId - The ID of the combatant
   * @param {string} notes - The notes to set
   */
  setCombatantNotes(combatantId, notes) {
    this.notes.combatants[combatantId] = notes;
    this.saveNotesToStorage();
  }
  
  /**
   * Add a note button to a combatant card
   * @param {HTMLElement} card - The combatant card element
   */
  addNoteButtonToCombatantCard(card) {
    if (!card) return;
    
    // Check if note button already exists
    if (card.querySelector('.note-btn')) return;
    
    // Create the note button
    const noteBtn = document.createElement('button');
    noteBtn.className = 'note-btn text-gray-400 hover:text-blue-400 ml-1';
    noteBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    `;
    
    // Add event listener
    noteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.openQuickNoteModal(card.id);
    });
    
    // Find the appropriate place to insert the button
    const cardHeader = card.querySelector('.combatant-header') || card.querySelector('.combatant-name').parentNode;
    cardHeader.appendChild(noteBtn);
  }
  
  /**
   * Open a quick note modal for a combatant
   * @param {string} combatantId - The ID of the combatant
   */
  openQuickNoteModal(combatantId) {
    const card = document.getElementById(combatantId);
    if (!card) return;
    
    const name = card.querySelector('.combatant-name').textContent;
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 flex items-center justify-center z-50 p-4';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    
    modal.innerHTML = `
      <div class="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-md w-full mx-auto">
        <h3 class="text-xl font-bold text-blue-400 mb-4">Notes for ${name}</h3>
        <textarea id="quick-note-textarea" class="w-full h-40 bg-gray-700 text-white rounded p-2" placeholder="Add notes for ${name}...">${this.notes.combatants[combatantId] || ''}</textarea>
        <div class="flex justify-end mt-4 space-x-2">
          <button id="quick-note-cancel" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            Cancel
          </button>
          <button id="quick-note-save" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Save
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('quick-note-cancel').addEventListener('click', () => {
      modal.remove();
    });
    
    document.getElementById('quick-note-save').addEventListener('click', () => {
      const textarea = document.getElementById('quick-note-textarea');
      this.notes.combatants[combatantId] = textarea.value;
      this.saveNotesToStorage();
      modal.remove();
      this.app.logEvent(`Notes updated for ${name}.`);
    });
    
    // Focus the textarea
    setTimeout(() => {
      document.getElementById('quick-note-textarea').focus();
    }, 100);
  }
}
