/**
 * Notes module for Jesster's Combat Tracker
 * Handles note-taking functionality
 */
class Notes {
    constructor(storage) {
        // Store reference to storage module
        this.storage = storage;
        
        // Notes data
        this.notes = [];
        this.categories = [];
        this.tags = [];
        
        // Current note
        this.currentNoteId = null;
        
        // Load notes data
        this._loadNotes();
        
        console.log("Notes module initialized");
    }

    /**
     * Load notes data from storage
     * @private
     */
    async _loadNotes() {
        try {
            // Load notes
            const notes = await this.storage.load('notes', { useLocalStorage: true });
            if (notes && Array.isArray(notes)) {
                this.notes = notes;
            }
            
            // Load categories
            const categories = await this.storage.load('noteCategories', { useLocalStorage: true });
            if (categories && Array.isArray(categories)) {
                this.categories = categories;
            } else {
                // Create default categories
                this.categories = [
                    { id: 'combat', name: 'Combat', color: '#ff5555' },
                    { id: 'npc', name: 'NPCs', color: '#5555ff' },
                    { id: 'location', name: 'Locations', color: '#55aa55' },
                    { id: 'quest', name: 'Quests', color: '#aa55aa' },
                    { id: 'lore', name: 'Lore', color: '#aaaa55' }
                ];
                await this._saveCategories();
            }
            
            // Extract all tags from notes
            this._updateTagsList();
        } catch (error) {
            console.error('Error loading notes:', error);
        }
    }

    /**
     * Save notes to storage
     * @private
     */
    async _saveNotes() {
        try {
            await this.storage.save('notes', this.notes, { useLocalStorage: true });
        } catch (error) {
            console.error('Error saving notes:', error);
        }
    }

    /**
     * Save categories to storage
     * @private
     */
    async _saveCategories() {
        try {
            await this.storage.save('noteCategories', this.categories, { useLocalStorage: true });
        } catch (error) {
            console.error('Error saving note categories:', error);
        }
    }

    /**
     * Update tags list from notes
     * @private
     */
    _updateTagsList() {
        const tagSet = new Set();
        
        this.notes.forEach(note => {
            if (note.tags && Array.isArray(note.tags)) {
                note.tags.forEach(tag => tagSet.add(tag));
            }
        });
        
        this.tags = Array.from(tagSet).sort();
    }

    /**
     * Create a new note
     * @param {Object} noteData - Note data
     * @param {string} noteData.title - Note title
     * @param {string} noteData.content - Note content
     * @param {string} noteData.categoryId - Category ID
     * @param {Array} noteData.tags - Tags
     * @returns {Promise<Object>} Created note
     */
    async createNote(noteData) {
        // Generate ID
        const noteId = `note-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        
        // Create note object
        const note = {
            id: noteId,
            title: noteData.title || 'Untitled Note',
            content: noteData.content || '',
            categoryId: noteData.categoryId || null,
            tags: noteData.tags || [],
            created: Date.now(),
            modified: Date.now(),
            pinned: noteData.pinned || false,
            archived: false
        };
        
        // Add to notes array
        this.notes.push(note);
        
        // Update tags list
        this._updateTagsList();
        
        // Save notes
        await this._saveNotes();
        
        // Set as current note
        this.currentNoteId = noteId;
        
        return note;
    }

    /**
     * Get a note by ID
     * @param {string} noteId - Note ID
     * @returns {Object|null} Note or null if not found
     */
    getNote(noteId) {
        return this.notes.find(note => note.id === noteId) || null;
    }

    /**
     * Update a note
     * @param {string} noteId - Note ID
     * @param {Object} updates - Updates to apply
     * @returns {Promise<Object|null>} Updated note or null if not found
     */
    async updateNote(noteId, updates) {
        // Find note
        const index = this.notes.findIndex(note => note.id === noteId);
        if (index === -1) {
            console.warn(`Note not found: ${noteId}`);
            return null;
        }
        
        // Update note
        this.notes[index] = {
            ...this.notes[index],
            ...updates,
            modified: Date.now()
        };
        
        // Update tags list
        this._updateTagsList();
        
        // Save notes
        await this._saveNotes();
        
        return this.notes[index];
    }

    /**
     * Delete a note
     * @param {string} noteId - Note ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteNote(noteId) {
        // Find note
        const index = this.notes.findIndex(note => note.id === noteId);
        if (index === -1) {
            console.warn(`Note not found: ${noteId}`);
            return false;
        }
        
        // Remove note
        this.notes.splice(index, 1);
        
        // Update current note if deleted
        if (this.currentNoteId === noteId) {
            this.currentNoteId = null;
        }
        
        // Update tags list
        this._updateTagsList();
        
        // Save notes
        await this._saveNotes();
        
        return true;
    }

    /**
     * Get all notes
     * @returns {Array} All notes
     */
    getAllNotes() {
        return [...this.notes];
    }

    /**
     * Get active notes (not archived)
     * @returns {Array} Active notes
     */
    getActiveNotes() {
        return this.notes.filter(note => !note.archived);
    }

    /**
     * Get archived notes
     * @returns {Array} Archived notes
     */
    getArchivedNotes() {
        return this.notes.filter(note => note.archived);
    }

    /**
     * Get pinned notes
     * @returns {Array} Pinned notes
     */
    getPinnedNotes() {
        return this.notes.filter(note => note.pinned);
    }

    /**
     * Get notes by category
     * @param {string} categoryId - Category ID
     * @returns {Array} Notes in category
     */
    getNotesByCategory(categoryId) {
        return this.notes.filter(note => note.categoryId === categoryId);
    }

    /**
     * Get notes by tag
     * @param {string} tag - Tag
     * @returns {Array} Notes with tag
     */
    getNotesByTag(tag) {
        return this.notes.filter(note => note.tags && note.tags.includes(tag));
    }

    /**
     * Search notes
     * @param {string} query - Search query
     * @returns {Array} Matching notes
     */
    searchNotes(query) {
        if (!query) return this.getActiveNotes();
        
        const lowerQuery = query.toLowerCase();
        
        return this.notes.filter(note => 
            !note.archived && (
                note.title.toLowerCase().includes(lowerQuery) ||
                note.content.toLowerCase().includes(lowerQuery) ||
                (note.tags && note.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
            )
        );
    }

    /**
     * Set current note
     * @param {string} noteId - Note ID
     * @returns {Object|null} Current note or null if not found
     */
    setCurrentNote(noteId) {
        const note = this.getNote(noteId);
        if (!note) {
            console.warn(`Note not found: ${noteId}`);
            return null;
        }
        
        this.currentNoteId = noteId;
        return note;
    }

    /**
     * Get current note
     * @returns {Object|null} Current note or null if none
     */
    getCurrentNote() {
        if (!this.currentNoteId) return null;
        return this.getNote(this.currentNoteId);
    }

    /**
     * Create a category
     * @param {Object} categoryData - Category data
     * @param {string} categoryData.name - Category name
     * @param {string} categoryData.color - Category color
     * @returns {Promise<Object>} Created category
     */
    async createCategory(categoryData) {
        // Generate ID
        const categoryId = `category-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        
        // Create category object
        const category = {
            id: categoryId,
            name: categoryData.name || 'New Category',
            color: categoryData.color || '#808080'
        };
        
        // Add to categories array
        this.categories.push(category);
        
        // Save categories
        await this._saveCategories();
        
        return category;
    }

    /**
     * Get a category by ID
     * @param {string} categoryId - Category ID
     * @returns {Object|null} Category or null if not found
     */
    getCategory(categoryId) {
        return this.categories.find(category => category.id === categoryId) || null;
    }

    /**
     * Update a category
     * @param {string} categoryId - Category ID
     * @param {Object} updates - Updates to apply
     * @returns {Promise<Object|null>} Updated category or null if not found
     */
    async updateCategory(categoryId, updates) {
        // Find category
        const index = this.categories.findIndex(category => category.id === categoryId);
        if (index === -1) {
            console.warn(`Category not found: ${categoryId}`);
            return null;
        }
        
        // Update category
        this.categories[index] = {
            ...this.categories[index],
            ...updates
        };
        
        // Save categories
        await this._saveCategories();
        
        return this.categories[index];
    }

    /**
     * Delete a category
     * @param {string} categoryId - Category ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteCategory(categoryId) {
        // Find category
        const index = this.categories.findIndex(category => category.id === categoryId);
        if (index === -1) {
            console.warn(`Category not found: ${categoryId}`);
            return false;
        }
        
        // Remove category
        this.categories.splice(index, 1);
        
        // Update notes with this category
        const notesToUpdate = this.notes.filter(note => note.categoryId === categoryId);
        for (const note of notesToUpdate) {
            await this.updateNote(note.id, { categoryId: null });
        }
        
        // Save categories
        await this._saveCategories();
        
        return true;
    }

    /**
     * Get all categories
     * @returns {Array} All categories
     */
    getAllCategories() {
        return [...this.categories];
    }

    /**
     * Get all tags
     * @returns {Array} All tags
     */
    getAllTags() {
        return [...this.tags];
    }

    /**
     * Add a tag to a note
     * @param {string} noteId - Note ID
     * @param {string} tag - Tag to add
     * @returns {Promise<Object|null>} Updated note or null if not found
     */
    async addTagToNote(noteId, tag) {
        // Find note
        const note = this.getNote(noteId);
        if (!note) {
            console.warn(`Note not found: ${noteId}`);
            return null;
        }
        
        // Initialize tags array if it doesn't exist
        if (!note.tags) {
            note.tags = [];
        }
        
        // Add tag if it doesn't already exist
        if (!note.tags.includes(tag)) {
            note.tags.push(tag);
            
            // Update note
            return await this.updateNote(noteId, { tags: note.tags });
        }
        
        return note;
    }

    /**
     * Remove a tag from a note
     * @param {string} noteId - Note ID
     * @param {string} tag - Tag to remove
     * @returns {Promise<Object|null>} Updated note or null if not found
     */
    async removeTagFromNote(noteId, tag) {
        // Find note
        const note = this.getNote(noteId);
        if (!note) {
            console.warn(`Note not found: ${noteId}`);
            return null;
        }
        
        // Remove tag
        if (note.tags) {
            note.tags = note.tags.filter(t => t !== tag);
            
            // Update note
            return await this.updateNote(noteId, { tags: note.tags });
        }
        
        return note;
    }

    /**
     * Pin a note
     * @param {string} noteId - Note ID
     * @returns {Promise<Object|null>} Updated note or null if not found
     */
    async pinNote(noteId) {
        return await this.updateNote(noteId, { pinned: true });
    }

    /**
     * Unpin a note
     * @param {string} noteId - Note ID
     * @returns {Promise<Object|null>} Updated note or null if not found
     */
    async unpinNote(noteId) {
        return await this.updateNote(noteId, { pinned: false });
    }

    /**
     * Archive a note
     * @param {string} noteId - Note ID
     * @returns {Promise<Object|null>} Updated note or null if not found
     */
    async archiveNote(noteId) {
        return await this.updateNote(noteId, { archived: true });
    }

    /**
     * Unarchive a note
     * @param {string} noteId - Note ID
     * @returns {Promise<Object|null>} Updated note or null if not found
     */
    async unarchiveNote(noteId) {
        return await this.updateNote(noteId, { archived: false });
    }

    /**
     * Export notes to JSON
     * @param {Array} noteIds - Array of note IDs to export (all if not provided)
     * @returns {string} JSON string
     */
    exportNotesToJSON(noteIds = null) {
        // Get notes to export
        const notesToExport = noteIds 
            ? this.notes.filter(note => noteIds.includes(note.id))
            : this.notes;
        
        // Create export object
        const exportData = {
            notes: notesToExport,
            categories: this.categories,
            exportDate: Date.now()
        };
        
        return JSON.stringify(exportData, null, 2);
    }

    /**
     * Import notes from JSON
     * @param {string} json - JSON string
     * @returns {Promise<Object>} Import result
     */
    async importNotesFromJSON(json) {
        try {
            const data = JSON.parse(json);
            
            // Validate data
            if (!data.notes || !Array.isArray(data.notes)) {
                throw new Error('Invalid notes data');
            }
            
            // Import categories if available
            if (data.categories && Array.isArray(data.categories)) {
                // Generate new IDs for categories
                const categoryIdMap = {};
                
                for (const category of data.categories) {
                    // Check if category with same name already exists
                    const existingCategory = this.categories.find(c => c.name === category.name);
                    
                    if (existingCategory) {
                        // Use existing category
                        categoryIdMap[category.id] = existingCategory.id;
                    } else {
                        // Create new category
                        const newCategory = await this.createCategory({
                            name: category.name,
                            color: category.color
                        });
                        
                        categoryIdMap[category.id] = newCategory.id;
                    }
                }
                
                // Update category IDs in notes
                data.notes.forEach(note => {
                    if (note.categoryId && categoryIdMap[note.categoryId]) {
                        note.categoryId = categoryIdMap[note.categoryId];
                    }
                });
            }
            
            // Import notes
            const importedNotes = [];
            
            for (const note of data.notes) {
                // Generate new ID
                const noteId = `note-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
                
                // Create note object
                const newNote = {
                    id: noteId,
                    title: note.title || 'Imported Note',
                    content: note.content || '',
                    categoryId: note.categoryId || null,
                    tags: note.tags || [],
                    created: Date.now(),
                    modified: Date.now(),
                    pinned: note.pinned || false,
                    archived: note.archived || false
                };
                
                // Add to notes array
                this.notes.push(newNote);
                importedNotes.push(newNote);
            }
            
            // Update tags list
            this._updateTagsList();
            
            // Save notes
            await this._saveNotes();
            
            return {
                success: true,
                importedCount: importedNotes.length,
                notes: importedNotes
            };
        } catch (error) {
            console.error('Error importing notes:', error);
            
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Create a note from combat
     * @param {Object} combat - Combat object
     * @returns {Promise<Object>} Created note
     */
    async createNoteFromCombat(combat) {
        // Generate title
        const title = `Combat Notes - ${new Date().toLocaleDateString()}`;
        
        // Generate content
        let content = `# Combat Summary\n\n`;
        
        // Add round and turn info
        content += `**Round:** ${combat.round}\n`;
        
        // Add combatants
        content += `\n## Combatants\n\n`;
        
        combat.combatants.forEach(combatant => {
            content += `- **${combatant.name}** `;
            content += `(HP: ${combatant.hp}/${combatant.maxHp || '?'}, `;
            content += `AC: ${combatant.ac || '?'}, `;
            content += `Initiative: ${combatant.initiative || '?'})\n`;
            
            // Add conditions
            if (combatant.conditions && combatant.conditions.length > 0) {
                content += `  - Conditions: ${combatant.conditions.map(c => c.name).join(', ')}\n`;
            }
        });
        
        // Add history
        if (combat.history && combat.history.length > 0) {
            content += `\n## Combat Log\n\n`;
            
            // Get last 20 history entries
            const recentHistory = combat.history.slice(-20);
            
            recentHistory.forEach(entry => {
                const timestamp = new Date(entry.timestamp).toLocaleTimeString();
                
                switch (entry.type) {
                    case 'combat-start':
                        content += `- **${timestamp}** Combat started\n`;
                        break;
                    case 'round-start':
                        content += `- **${timestamp}** Round ${entry.data.round} started\n`;
                        break;
                    case 'turn-start':
                        content += `- **${timestamp}** ${entry.data.combatantName}'s turn started\n`;
                        break;
                    case 'damage':
                        content += `- **${timestamp}** ${entry.data.combatantName} took ${entry.data.damage} damage\n`;
                        break;
                    case 'healing':
                        content += `- **${timestamp}** ${entry.data.combatantName} healed ${entry.data.healing} HP\n`;
                        break;
                    case 'condition-applied':
                        content += `- **${timestamp}** ${entry.data.combatantName} gained condition: ${entry.data.conditionName}\n`;
                        break;
                    case 'condition-removed':
                        content += `- **${timestamp}** ${entry.data.combatantName} lost condition: ${entry.data.conditionName}\n`;
                        break;
                    case 'death-save':
                        content += `- **${timestamp}** ${entry.data.combatantName} rolled death save: ${entry.data.result}\n`;
                        break;
                    case 'combatant-defeated':
                        content += `- **${timestamp}** ${entry.data.combatantName} was defeated\n`;
                        break;
                }
            });
        }
        
        // Create note
        return await this.createNote({
            title,
            content,
            categoryId: 'combat',
            tags: ['combat', 'encounter']
        });
    }

    /**
     * Create a note from an NPC
     * @param {Object} npc - NPC object
     * @returns {Promise<Object>} Created note
     */
    async createNoteFromNPC(npc) {
        // Generate title
        const title = `NPC: ${npc.name}`;
        
        // Generate content
        let content = `# ${npc.name}\n\n`;
        
        if (npc.race || npc.class) {
            content += `**${npc.race || ''} ${npc.class || ''}**\n\n`;
        }
        
        if (npc.alignment) {
            content += `**Alignment:** ${npc.alignment}\n\n`;
        }
        
        if (npc.appearance) {
            content += `## Appearance\n\n${npc.appearance}\n\n`;
        }
        
        if (npc.personality) {
            content += `## Personality\n\n${npc.personality}\n\n`;
        }
        
        if (npc.motivation) {
            content += `## Motivation\n\n${npc.motivation}\n\n`;
        }
        
        if (npc.secret) {
            content += `## Secret\n\n${npc.secret}\n\n`;
        }
        
        if (npc.voice) {
            content += `## Voice\n\n${npc.voice}\n\n`;
        }
        
        // Create note
        return await this.createNote({
            title,
            content,
            categoryId: 'npc',
            tags: ['npc', 'character']
        });
    }

    /**
     * Create a note from a location
     * @param {Object} location - Location object
     * @returns {Promise<Object>} Created note
     */
    async createNoteFromLocation(location) {
        // Generate title
        const title = `Location: ${location.name}`;
        
        // Generate content
        let content = `# ${location.name}\n\n`;
        
        if (location.type) {
            content += `**Type:** ${location.type}\n\n`;
        }
        
        if (location.description) {
            content += `## Description\n\n${location.description}\n\n`;
        }
        
        if (location.features) {
            content += `## Notable Features\n\n${location.features}\n\n`;
        }
        
        if (location.inhabitants) {
            content += `## Inhabitants\n\n${location.inhabitants}\n\n`;
        }
        
        if (location.secrets) {
            content += `## Secrets\n\n${location.secrets}\n\n`;
        }
        
        // Create note
        return await this.createNote({
            title,
            content,
            categoryId: 'location',
            tags: ['location', location.type || 'place']
        });
    }

    /**
     * Sort notes by a field
     * @param {Array} notes - Notes to sort
     * @param {string} field - Field to sort by (created, modified, title)
     * @param {boolean} ascending - Sort ascending
     * @returns {Array} Sorted notes
     */
    sortNotes(notes, field = 'modified', ascending = false) {
        return [...notes].sort((a, b) => {
            let valueA, valueB;
            
            switch (field) {
                case 'created':
                    valueA = a.created;
                    valueB = b.created;
                    break;
                case 'title':
                    valueA = a.title.toLowerCase();
                    valueB = b.title.toLowerCase();
                    break;
                case 'modified':
                default:
                    valueA = a.modified;
                    valueB = b.modified;
                    break;
            }
            
            if (valueA < valueB) return ascending ? -1 : 1;
            if (valueA > valueB) return ascending ? 1 : -1;
            return 0;
        });
    }

    /**
     * Get note statistics
     * @returns {Object} Note statistics
     */
    getNoteStatistics() {
        return {
            total: this.notes.length,
            active: this.getActiveNotes().length,
            archived: this.getArchivedNotes().length,
            pinned: this.getPinnedNotes().length,
            categories: this.categories.map(category => ({
                id: category.id,
                name: category.name,
                count: this.getNotesByCategory(category.id).length
            })),
            tags: this.tags.map(tag => ({
                name: tag,
                count: this.getNotesByTag(tag).length
            }))
        };
    }

    /**
     * Parse markdown content to HTML
     * @param {string} markdown - Markdown content
     * @returns {string} HTML content
     */
    parseMarkdown(markdown) {
        if (!markdown) return '';
        
        // Simple markdown parser
        let html = markdown;
        
        // Headers
        html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
        html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
        html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
        
        // Bold
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Italic
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Lists
        html = html.replace(/^- (.*?)$/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*?<\/li>)\n(?!<li>)/g, '$1</ul>\n');
        html = html.replace(/(?<!<\/ul>\n)(<li>)/g, '<ul>$1');
        
        // Paragraphs
        html = html.replace(/^(?!<[uh]|<li)(.+)$/gm, '<p>$1</p>');
        
        // Line breaks
        html = html.replace(/\n\n/g, '<br>');
        
        return html;
    }
}

// Export the Notes class
export default Notes;
