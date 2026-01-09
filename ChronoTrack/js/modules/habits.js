/**
 * Habits Module
 * Handles habit tracking
 */

const HabitsModule = {
    isBound: false,
    /**
     * Initialize habits module
     */
    init() {
        this.render();
        this.bindEvents();
    },

    /**
     * Render habits
     */
    render() {
        const state = StateManager.getState();
        const habitsList = document.getElementById('habits-list');
        if (!habitsList) return;

        if (state.habits.length === 0) {
            habitsList.innerHTML = '<p class="empty-state">No habits yet. Create one to start tracking!</p>';
            return;
        }

        habitsList.innerHTML = state.habits.map(habit => this.renderHabitCard(habit)).join('');
    },

    /**
     * Render habit card
     */
    renderHabitCard(habit) {
        const today = DateUtils.formatDate(DateUtils.getStartOfDay(), 'YYYY-MM-DD');
        const isCompletedToday = habit.completions && habit.completions[today];

        return `
            <div class="card" style="margin-bottom: 12px;">
                <div class="card-header">
                    <div style="flex: 1;">
                        <h3 class="card-title">${habit.title}</h3>
                        <p style="color: var(--text-secondary); font-size: 14px; margin: 0;">
                            Frequency: ${habit.frequency}
                        </p>
                    </div>
                    <span class="badge badge-primary">${habit.category}</span>
                </div>
                <div class="card-content">
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 12px;">
                        <div style="text-align: center;">
                            <div style="font-size: 24px; font-weight: bold; color: var(--primary-color);">🔥</div>
                            <p style="color: var(--text-secondary); margin: 4px 0;">Current Streak</p>
                            <p style="font-weight: bold; margin: 0;">${habit.currentStreak || 0}</p>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 24px; font-weight: bold; color: var(--success-color);">🏆</div>
                            <p style="color: var(--text-secondary); margin: 4px 0;">Longest Streak</p>
                            <p style="font-weight: bold; margin: 0;">${habit.longestStreak || 0}</p>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 24px; font-weight: bold; color: var(--accent-color);">📊</div>
                            <p style="color: var(--text-secondary); margin: 4px 0;">Success Rate</p>
                            <p style="font-weight: bold; margin: 0;">${habit.successRate || 0}%</p>
                        </div>
                    </div>
                    <div class="progress-bar" style="margin-bottom: 12px;">
                        <div class="progress-fill" style="width: ${habit.successRate || 0}%;"></div>
                    </div>
                </div>
                <div class="card-footer">
                    <button class="btn btn-small ${isCompletedToday ? 'btn-primary' : 'btn-secondary'}" 
                            onclick="HabitsModule.toggleHabit('${habit.id}')">
                        ${isCompletedToday ? '✓ Done Today' : 'Mark as Done'}
                    </button>
                    <button class="btn btn-small btn-secondary" onclick="HabitsModule.editHabit('${habit.id}')">Edit</button>
                    <button class="btn btn-small btn-secondary" onclick="HabitsModule.deleteHabit('${habit.id}')" style="color: var(--danger-color);">Delete</button>
                </div>
            </div>
        `;
    },

    /**
     * Toggle habit completion
     */
    async toggleHabit(habitId) {
        const habit = StateManager.getFromCollection('habits', habitId);
        if (!habit) return;

        const today = DateUtils.formatDate(DateUtils.getStartOfDay(), 'YYYY-MM-DD');
        const isCompletedToday = habit.completions && habit.completions[today];

        const updatedHabit = {
            ...habit,
            completions: {
                ...(habit.completions || {}),
                [today]: !isCompletedToday
            }
        };

        // Update streak
        if (!isCompletedToday) {
            // Mark as done - increase streak if consecutive
            const yesterday = DateUtils.formatDate(DateUtils.addDays(DateUtils.getStartOfDay(), -1), 'YYYY-MM-DD');
            const completedYesterday = habit.completions && habit.completions[yesterday];
            
            if (completedYesterday) {
                updatedHabit.currentStreak = (habit.currentStreak || 0) + 1;
                updatedHabit.longestStreak = Math.max(updatedHabit.currentStreak, habit.longestStreak || 0);
            } else {
                updatedHabit.currentStreak = 1;
                updatedHabit.longestStreak = Math.max(1, habit.longestStreak || 0);
            }
        } else {
            // Unmark as done - reset streak
            updatedHabit.currentStreak = 0;
        }

        try {
            await database.ref('habits/' + habitId).update(updatedHabit);
            StateManager.updateInCollection('habits', habitId, updatedHabit);
            this.render();
            
            const message = !isCompletedToday ? 'Great job! Habit completed!' : 'Habit unmarked';
            UIHelpers.showNotification(message, 'success');
        } catch (error) {
            console.error('Error updating habit:', error);
            UIHelpers.showNotification('Error updating habit', 'error');
        }
    },

    /**
     * Edit habit
     */
    editHabit(habitId) {
        const habit = StateManager.getFromCollection('habits', habitId);
        if (!habit) return;

        document.getElementById('habit-title').value = habit.title;
        document.getElementById('habit-frequency').value = habit.frequency || 'daily';
        document.getElementById('habit-category').value = habit.category || 'health';

        const form = document.getElementById('create-habit-form');
        form.dataset.editHabitId = habitId;
        form.querySelector('button[type="submit"]').textContent = 'Update Habit';

        UIHelpers.openModal('create-habit-modal');
    },

    /**
     * Delete habit
     */
    async deleteHabit(habitId) {
        const confirmed = await UIHelpers.showConfirmation('Are you sure you want to delete this habit?', 'Delete Habit');
        
        if (confirmed) {
            try {
                await database.ref('habits/' + habitId).remove();
                StateManager.removeFromCollection('habits', habitId);
                this.render();
                UIHelpers.showNotification('Habit deleted', 'success');
            } catch (error) {
                console.error('Error deleting habit:', error);
                UIHelpers.showNotification('Error deleting habit', 'error');
            }
        }
    },

    /**
     * Bind events
     */
    bindEvents() {
        if (this.isBound) return;
        this.isBound = true;
        const createHabitForm = document.getElementById('create-habit-form');
        if (createHabitForm) {
            createHabitForm.addEventListener('submit', (e) => this.handleCreateHabit(e));
        }
    },

    /**
     * Handle create habit form submission
     */
    async handleCreateHabit(event) {
        event.preventDefault();

        const form = event.target;
        const editHabitId = form.dataset.editHabitId;
        const title = document.getElementById('habit-title').value;
        const frequency = document.getElementById('habit-frequency').value;
        const category = document.getElementById('habit-category').value;

        const currentUser = StateManager.getValue('currentUser');
        if (!currentUser) return;

        if (editHabitId) {
            const habitData = {
                title,
                frequency,
                category
            };

            try {
                await database.ref('habits/' + editHabitId).update(habitData);
                StateManager.updateInCollection('habits', editHabitId, habitData);
                UIHelpers.showNotification('Habit updated successfully!', 'success');
                UIHelpers.closeModal('create-habit-modal');
                this.render();
                delete form.dataset.editHabitId;
                form.querySelector('button[type="submit"]').textContent = 'Create Habit';
            } catch (error) {
                console.error('Error updating habit:', error);
                UIHelpers.showNotification('Failed to update habit', 'error');
            }
        } else {
            const habitData = {
                userId: currentUser.uid,
                title,
                frequency,
                category,
                completions: {},
                currentStreak: 0,
                longestStreak: 0,
                createdAt: new Date().toISOString()
            };

            try {
                const newHabitRef = database.ref('habits').push();
                await newHabitRef.set(habitData);

                StateManager.addToCollection('habits', { id: newHabitRef.key, ...habitData });
                UIHelpers.showNotification('Habit created successfully!', 'success');
                UIHelpers.closeModal('create-habit-modal');
                this.render();
            } catch (error) {
                console.error('Error creating habit:', error);
                UIHelpers.showNotification('Failed to create habit', 'error');
            }
        }
    }
};

window.HabitsModule = HabitsModule;

// Global functions
window.createHabit = function() { 
    const form = document.getElementById('create-habit-form');
    form.reset();
    delete form.dataset.editHabitId;
    form.querySelector('button[type="submit"]').textContent = 'Create Habit';
    UIHelpers.openModal('create-habit-modal'); 
}
