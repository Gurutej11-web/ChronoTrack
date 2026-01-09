/**
 * Dashboard Module
 * Handles dashboard display and updates
 */

const DashboardModule = {
    /**
     * Initialize dashboard
     */
    init() {
        this.render();
        this.bindEvents();
        this.setupListeners();
    },

    /**
     * Render dashboard
     */
    render() {
        const state = StateManager.getState();
        
        // Update current date
        const dateEl = document.getElementById('current-date-display');
        if (dateEl) {
            dateEl.textContent = DateUtils.formatDate(new Date(), 'dddd, MMM DD, YYYY');
        }

        // Update stats
        this.updateStats();
        this.renderTodayEvents();
        this.renderTodayHabits();
        this.renderActiveGoals();
    },

    /**
     * Update statistics
     */
    updateStats() {
        const state = StateManager.getState();
        const today = DateUtils.getStartOfDay();
        
        // Today's tasks
        const todayTasks = state.tasks.filter(task => {
            const taskDate = new Date(task.dueDate);
            return taskDate >= today && taskDate <= DateUtils.getEndOfDay();
        });
        
        document.getElementById('today-tasks').textContent = todayTasks.length;

        // Completed tasks
        const completedTasks = todayTasks.filter(t => t.status === 'completed');
        document.getElementById('completed-tasks').textContent = completedTasks.length;

        // Habits completed today
        const habitsCompletedToday = state.habits.filter(habit => {
            const dateKey = DateUtils.formatDate(today, 'YYYY-MM-DD');
            return habit.completions && habit.completions[dateKey];
        });
        
        document.getElementById('habits-completed').textContent = habitsCompletedToday.length;

        // Current streak (average of all habits)
        const totalStreak = state.habits.reduce((sum, habit) => sum + (habit.currentStreak || 0), 0);
        const avgStreak = state.habits.length > 0 ? Math.round(totalStreak / state.habits.length) : 0;
        document.getElementById('current-streak').textContent = avgStreak;
    },

    /**
     * Render today's events
     */
    renderTodayEvents() {
        const state = StateManager.getState();
        const today = DateUtils.getStartOfDay();
        const eventsList = document.getElementById('today-events-list');
        
        if (!eventsList) return;

        const todayEvents = state.events.filter(event => {
            const eventDate = new Date(event.startTime);
            return eventDate >= today && eventDate <= DateUtils.getEndOfDay();
        }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

        if (todayEvents.length === 0) {
            eventsList.innerHTML = '<p class="empty-state">No events scheduled</p>';
            return;
        }

        eventsList.innerHTML = todayEvents.map(event => `
            <div class="event-card" style="margin-bottom: 12px; padding: 12px; background-color: var(--bg-secondary); border-radius: 6px;">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <h4 style="margin: 0 0 4px 0;">${event.title}</h4>
                        <p style="color: var(--text-secondary); font-size: 14px; margin: 0;">
                            ${DateUtils.formatDate(new Date(event.startTime), 'HH:mm')} - ${DateUtils.formatDate(new Date(event.endTime), 'HH:mm')}
                        </p>
                    </div>
                    <span class="badge badge-primary">${event.category}</span>
                </div>
            </div>
        `).join('');
    },

    /**
     * Render today's habits
     */
    renderTodayHabits() {
        const state = StateManager.getState();
        const habitsList = document.getElementById('today-habits-list');
        
        if (!habitsList) return;

        if (state.habits.length === 0) {
            habitsList.innerHTML = '<p class="empty-state">No habits set up</p>';
            return;
        }

        const today = DateUtils.formatDate(DateUtils.getStartOfDay(), 'YYYY-MM-DD');
        
        habitsList.innerHTML = state.habits.map(habit => {
            const isCompleted = habit.completions && habit.completions[today];
            
            return `
                <div class="habit-card" style="margin-bottom: 12px; padding: 12px; background-color: var(--bg-secondary); border-radius: 6px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="flex: 1;">
                            <h4 style="margin: 0 0 4px 0;">${habit.title}</h4>
                            <p style="color: var(--text-secondary); font-size: 14px; margin: 0;">
                                🔥 ${habit.currentStreak || 0} day streak
                            </p>
                        </div>
                        <button class="btn btn-small ${isCompleted ? 'btn-primary' : 'btn-secondary'}" 
                                onclick="DashboardModule.toggleHabitToday('${habit.id}')">
                            ${isCompleted ? '✓ Done' : 'Mark Done'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * Render active goals
     */
    renderActiveGoals() {
        const state = StateManager.getState();
        const goalsList = document.getElementById('active-goals-list');
        
        if (!goalsList) return;

        const activeGoals = state.goals.filter(g => g.status === 'active');

        if (activeGoals.length === 0) {
            goalsList.innerHTML = '<p class="empty-state">No active goals</p>';
            return;
        }

        goalsList.innerHTML = activeGoals.slice(0, 3).map(goal => `
            <div class="goal-card" style="margin-bottom: 12px; padding: 12px; background-color: var(--bg-secondary); border-radius: 6px;">
                <h4 style="margin: 0 0 8px 0;">${goal.title}</h4>
                <div class="progress-bar" style="height: 6px; margin-bottom: 8px;">
                    <div class="progress-fill" style="width: ${goal.progress || 0}%;"></div>
                </div>
                <p style="color: var(--text-secondary); font-size: 14px; margin: 0;">
                    ${goal.progress || 0}% complete
                </p>
            </div>
        `).join('');
    },

    /**
     * Toggle habit completion for today
     */
    async toggleHabitToday(habitId) {
        const habit = StateManager.getFromCollection('habits', habitId);
        if (!habit) return;

        const today = DateUtils.formatDate(DateUtils.getStartOfDay(), 'YYYY-MM-DD');
        const isCompleted = habit.completions && habit.completions[today];

        const updatedHabit = {
            ...habit,
            completions: {
                ...habit.completions,
                [today]: !isCompleted
            }
        };

        try {
            await database.ref('habits/' + habitId).update(updatedHabit);
            StateManager.updateInCollection('habits', habitId, updatedHabit);
            this.render();
            
            const message = !isCompleted ? 'Great job! Habit completed!' : 'Habit unmarked';
            UIHelpers.showNotification(message, 'success');
        } catch (error) {
            console.error('Error updating habit:', error);
            UIHelpers.showNotification('Error updating habit', 'error');
        }
    },

    /**
     * Bind events
     */
    bindEvents() {
        // Add event listeners for interactive elements
    },

    /**
     * Setup state listeners
     */
    setupListeners() {
        StateManager.subscribe(() => {
            this.render();
        });
    }
};

window.DashboardModule = DashboardModule;
