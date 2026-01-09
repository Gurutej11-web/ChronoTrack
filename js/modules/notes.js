/**
 * Notes Module
 * Handles notes and journaling
 */

const NotesModule = {
    currentNoteId: null,
    isBound: false,

    /**
     * Initialize notes module
     */
    init() {
        this.render();
        this.bindEvents();
    },

    /**
     * Render notes list
     */
    render() {
        this.renderNotesList();
    },

    /**
     * Render notes list
     */
    renderNotesList() {
        const state = StateManager.getState();
        const notesList = document.getElementById('notes-list');
        if (!notesList) return;

        const notes = (state.notes || []).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        if (notes.length === 0) {
            notesList.innerHTML = '<p class="empty-state">No notes yet</p>';
            return;
        }

        notesList.innerHTML = notes.map(note => `
            <div class="note-card" onclick="NotesModule.openNoteDetail('${note.id}')">
                <h3 style="margin: 0 0 8px 0; color: var(--text-primary);">${note.title || 'Untitled'}</h3>
                <p style="color: var(--text-secondary); font-size: 13px; margin: 0 0 8px 0; line-height: 1.5;">
                    ${(note.content || '').substring(0, 100)}${(note.content || '').length > 100 ? '...' : ''}
                </p>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <small style="color: var(--text-muted);">${DateUtils.getRelativeTime(note.updatedAt)}</small>
                    <div style="margin-top: 4px;">
                        ${(note.tags || []).map(tag => `<span class="tag" style="font-size: 11px; padding: 2px 6px;">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    },

    /**
     * Open create note modal
     */
    openCreateModal() {
        const modal = document.getElementById('create-note-modal');
        if (modal) {
            modal.classList.remove('hidden');
            document.getElementById('new-note-title').value = '';
            document.getElementById('new-note-content').value = '';
            document.getElementById('new-note-tags').value = '';
            document.getElementById('new-note-title').focus();
        }
    },

    /**
     * Create note from modal
     */
    async createNote(title, content, tagsString) {
        const currentUser = StateManager.getValue('currentUser');
        if (!currentUser) {
            UIHelpers.showNotification('User not authenticated', 'error');
            return;
        }

        const tags = tagsString ? tagsString.split(',').map(t => t.trim()).filter(t => t) : [];

        const newNote = {
            title: title || 'Untitled Note',
            content: content || '',
            type: 'note',
            tags: tags,
            linkedTo: { eventId: null, taskId: null, goalId: null },
            isPinned: false,
            color: '#ffffff',
            userId: currentUser.uid,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        try {
            const newNoteRef = await database.ref('notes').push(newNote);
            newNote.id = newNoteRef.key;
            
            StateManager.addToCollection('notes', newNote);
            UIHelpers.closeModal('create-note-modal');
            this.render();
            UIHelpers.showNotification('Note created successfully', 'success');
        } catch (error) {
            console.error('Error creating note:', error);
            UIHelpers.showNotification('Error creating note', 'error');
        }
    },

    /**
     * Open note detail modal
     */
    openNoteDetail(noteId) {
        const note = StateManager.getFromCollection('notes', noteId);
        if (!note) return;

        this.currentNoteId = noteId;

        // Populate modal fields
        document.getElementById('note-detail-title').textContent = note.title || 'Untitled';
        document.getElementById('note-detail-title-edit').value = note.title || '';
        document.getElementById('note-detail-content-edit').value = note.content || '';
        document.getElementById('note-detail-tags-edit').value = (note.tags || []).join(', ');

        // Show modal
        const modal = document.getElementById('note-detail-modal');
        if (modal) {
            modal.classList.remove('hidden');
            document.getElementById('note-detail-content-edit').focus();
        }
    },

    /**
     * Save current note
     */
    async saveCurrentNote() {
        if (!this.currentNoteId) return;

        const note = StateManager.getFromCollection('notes', this.currentNoteId);
        if (!note) return;

        const titleInput = document.getElementById('note-detail-title-edit');
        const contentEl = document.getElementById('note-detail-content-edit');
        const tagsInput = document.getElementById('note-detail-tags-edit');

        if (!titleInput || !contentEl) return;

        const tags = tagsInput.value ? tagsInput.value.split(',').map(t => t.trim()).filter(t => t) : [];

        const updatedNote = {
            ...note,
            title: titleInput.value || 'Untitled Note',
            content: contentEl.value,
            tags: tags,
            updatedAt: new Date().toISOString()
        };

        try {
            await database.ref('notes/' + this.currentNoteId).update(updatedNote);
            StateManager.updateInCollection('notes', this.currentNoteId, updatedNote);
            UIHelpers.closeModal('note-detail-modal');
            this.render();
            UIHelpers.showNotification('Note saved successfully', 'success');
        } catch (error) {
            console.error('Error saving note:', error);
            UIHelpers.showNotification('Error saving note', 'error');
        }
    },

    /**
     * Delete current note
     */
    async deleteCurrentNote() {
        if (!this.currentNoteId) return;

        const confirmed = await UIHelpers.showConfirmation('Are you sure you want to delete this note?', 'Delete Note');
        
        if (confirmed) {
            try {
                await database.ref('notes/' + this.currentNoteId).remove();
                StateManager.removeFromCollection('notes', this.currentNoteId);
                
                this.currentNoteId = null;
                UIHelpers.closeModal('note-detail-modal');
                this.render();
                
                UIHelpers.showNotification('Note deleted successfully', 'success');
            } catch (error) {
                console.error('Error deleting note:', error);
                UIHelpers.showNotification('Error deleting note', 'error');
            }
        }
    },

    /**
     * Bind events
     */
    bindEvents() {
        if (this.isBound) return;
        this.isBound = true;

        // Create note form submission
        const createNoteForm = document.getElementById('create-note-form');
        if (createNoteForm) {
            createNoteForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const title = document.getElementById('new-note-title').value.trim();
                const content = document.getElementById('new-note-content').value.trim();
                const tags = document.getElementById('new-note-tags').value;
                
                if (!title && !content) {
                    UIHelpers.showNotification('Please enter a title or content', 'warning');
                    return;
                }
                
                this.createNote(title, content, tags);
            });
        }

        // Auto-save note periodically
        setInterval(() => {
            if (this.currentNoteId && document.getElementById('note-detail-modal') && 
                !document.getElementById('note-detail-modal').classList.contains('hidden')) {
                // Note is open, auto-save
                this.saveCurrentNote();
            }
        }, 30000); // Save every 30 seconds
    }
};

window.NotesModule = NotesModule;
