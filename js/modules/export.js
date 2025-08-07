/**
 * Export Manager for Jesster's Combat Tracker
 * Handles exporting and importing data
 */
class ExportManager {
    constructor(app) {
        this.app = app;
        console.log("Export Manager initialized");
    }
    
    /**
     * Export the combat log
     */
    exportCombatLog() {
        try {
            const log = this.app.state.combatLog;
            if (log.length === 0) {
                this.app.showAlert('The combat log is empty.');
                return;
            }
            
            // Format the log
            const formattedLog = log.join('\n');
            
            // Create a timestamp for the filename
            const now = new Date();
            const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
            
            // Create a download link
            const blob = new Blob([formattedLog], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `combat_log_${timestamp}.txt`;
            document.body.appendChild(a);
            a.click();
            
            // Clean up
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 0);
            
            this.app.logEvent('Combat log exported.');
        } catch (error) {
            console.error('Error exporting combat log:', error);
            this.app.showAlert(`Error exporting combat log: ${error.message}`);
        }
    }
    
    /**
     * Save the current combat state
     */
    saveCombatState() {
        try {
            // Create a state object
            const state = {
                version: this.app.state.version,
                creatures: this.app.combat.getAllCreatures(),
                combatStarted: this.app.state.combatStarted,
                currentTurn: this.app.state.currentTurn,
                roundNumber: this.app.state.roundNumber,
                combatLog: this.app.state.combatLog,
                savedAt: new Date().toISOString()
            };
            
            // Show a modal to name the save
            const modal = this.app.ui.createModal({
                title: 'Save Combat State',
                content: `
                    <div class="space-y-4">
                        <div>
                            <label class="block text-gray-300 mb-2">Save Name:</label>
                            <input type="text" id="save-name" class="w-full bg-gray-700 text-white px-3 py-2 rounded" value="Combat ${new Date().toLocaleDateString()}" required>
                        </div>
                        
                        <div class="flex justify-end space-x-2">
                            <button class="cancel-btn bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                                Cancel
                            </button>
                            <button class="save-btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                Save
                            </button>
                        </div>
                    </div>
                `,
                width: 'max-w-md'
            });
            
            // Add event listeners
            const saveNameInput = modal.querySelector('#save-name');
            const cancelBtn = modal.querySelector('.cancel-btn');
            const saveBtn = modal.querySelector('.save-btn');
            
            cancelBtn.addEventListener('click', () => {
                this.app.ui.closeModal(modal);
            });
            
            saveBtn.addEventListener('click', async () => {
                const saveName = saveNameInput.value.trim();
                if (!saveName) {
                    this.app.showAlert('Please enter a name for the save.');
                    return;
                }
                
                // Add the name to the state
                state.name = saveName;
                
                // Save to storage
                try {
                    await this.app.storage.saveCombatState(state);
                    this.app.showAlert(`Combat state "${saveName}" saved successfully!`);
                    this.app.ui.closeModal(modal);
                } catch (error) {
                    console.error('Error saving combat state:', error);
                    this.app.showAlert(`Error saving combat state: ${error.message}`);
                }
            });
        } catch (error) {
            console.error('Error preparing combat state for save:', error);
            this.app.showAlert(`Error preparing combat state: ${error.message}`);
        }
    }
    
    /**
     * Load a saved combat state
     */
    async loadCombatState() {
        try {
            // Get all saved states
            const savedStates = await this.app.storage.getAllCombatStates();
            
            if (savedStates.length === 0) {
                this.app.showAlert('No saved combat states found.');
                return;
            }
            
            // Show a modal to select a save
            const modal = this.app.ui.createModal({
                title: 'Load Combat State',
                content: `
                    <div class="space-y-4">
                        <div id="saved-states-list" class="space-y-2 max-h-[400px] overflow-y-auto">
                            ${savedStates.map(state => `
                                <div class="bg-gray-700 p-3 rounded flex justify-between items-center">
                                    <div>
                                        <p class="font-semibold">${state.name || 'Unnamed Save'}</p>
                                        <p class="text-sm text-gray-400">
                                            ${state.savedAt ? new Date(state.savedAt).toLocaleString() : 'Unknown date'}
                                            | ${state.creatures ? state.creatures.length : 0} creatures
                                            | Round ${state.roundNumber || 1}
                                        </p>
                                    </div>
                                    <div class="flex space-x-2">
                                        <button class="load-state-btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm" data-id="${state.id}">
                                            Load
                                        </button>
                                        <button class="delete-state-btn bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm" data-id="${state.id}">
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="flex justify-end">
                            <button class="close-btn bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                                Close
                            </button>
                        </div>
                    </div>
                `,
                width: 'max-w-2xl'
            });
            
            // Add event listeners
            const closeBtn = modal.querySelector('.close-btn');
            
            closeBtn.addEventListener('click', () => {
                this.app.ui.closeModal(modal);
            });
            
            // Add event listeners for load buttons
            modal.querySelectorAll('.load-state-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const stateId = btn.dataset.id;
                    const state = await this.app.storage.getCombatState(stateId);
                    
                    if (state) {
                        this.app.showConfirm('Loading this state will replace your current combat. Are you sure?', async () => {
                            try {
                                // Load the state
                                await this.loadState(state);
                                this.app.showAlert(`Combat state "${state.name}" loaded successfully!`);
                                this.app.ui.closeModal(modal);
                            } catch (error) {
                                console.error('Error loading combat state:', error);
                                this.app.showAlert(`Error loading combat state: ${error.message}`);
                            }
                        });
                    }
                });
            });
            
            // Add event listeners for delete buttons
            modal.querySelectorAll('.delete-state-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const stateId = btn.dataset.id;
                    const state = await this.app.storage.getCombatState(stateId);
                    
                    if (state) {
                        this.app.showConfirm(`Are you sure you want to delete the save "${state.name}"?`, async () => {
                            try {
                                await this.app.storage.deleteCombatState(stateId);
                                this.app.showAlert(`Save "${state.name}" deleted successfully!`);
                                this.loadCombatState(); // Refresh the modal
                            } catch (error) {
                                console.error('Error deleting combat state:', error);
                                this.app.showAlert(`Error deleting save: ${error.message}`);
                            }
                        });
                    }
                });
            });
        } catch (error) {
            console.error('Error loading saved combat states:', error);
            this.app.showAlert(`Error loading saved states: ${error.message}`);
        }
    }
    
    /**
     * Load a state object into the app
     * @param {Object} state - The state to load
     */
    async loadState(state) {
        try {
            // Clear current state
            this.app.combat.clearCombatants();
            
            // Load creatures
            if (state.creatures && Array.isArray(state.creatures)) {
                for (const creature of state.creatures) {
                    this.app.combat.addCreature(creature);
                }
            }
            
            // Load combat state
            this.app.state.combatStarted = state.combatStarted || false;
            this.app.state.currentTurn = state.currentTurn || null;
            this.app.state.roundNumber = state.roundNumber || 1;
            
            // Load combat log
            if (state.combatLog && Array.isArray(state.combatLog)) {
                this.app.state.combatLog = state.combatLog;
                this.app.ui.renderCombatLog();
            }
            
            // Update UI
            this.app.ui.renderCreatures();
            this.app.ui.renderInitiativeOrder();
            this.app.updatePlayerView();
            
            // Log the event
            this.app.logEvent(`Combat state "${state.name}" loaded.`);
            
            return true;
        } catch (error) {
            console.error('Error applying loaded state:', error);
            throw new Error(`Error applying loaded state: ${error.message}`);
        }
    }
    
    /**
     * Export data as JSON file
     * @param {Object} data - The data to export
     * @param {string} filename - The filename to use
     */
    exportJSON(data, filename) {
        try {
            // Convert data to JSON string
            const jsonString = JSON.stringify(data, null, 2);
            
            // Create a download link
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            
            // Clean up
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 0);
            
            return true;
        } catch (error) {
            console.error('Error exporting JSON:', error);
            this.app.showAlert(`Error exporting data: ${error.message}`);
            return false;
        }
    }
    
    /**
     * Import data from JSON file
     * @param {File} file - The file to import
     * @returns {Promise<Object>} - The imported data
     */
    async importJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    resolve(data);
                } catch (error) {
                    reject(new Error(`Invalid JSON file: ${error.message}`));
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Error reading file'));
            };
            
            reader.readAsText(file);
        });
    }
    
    /**
     * Show import file dialog
     * @param {Function} onImport - Callback function when import is successful
     */
    showImportDialog(onImport) {
        // Create a file input element
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
        
        // Add event listener for file selection
        fileInput.addEventListener('change', async (event) => {
            if (event.target.files.length > 0) {
                const file = event.target.files[0];
                
                try {
                    const data = await this.importJSON(file);
                    onImport(data);
                } catch (error) {
                    this.app.showAlert(`Error importing file: ${error.message}`);
                }
            }
            
            // Clean up
            document.body.removeChild(fileInput);
        });
        
        // Trigger file selection dialog
        fileInput.click();
    }
}
