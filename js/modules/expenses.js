/**
 * Expenses Module
 * Handles expense tracking and visualization
 */

const ExpensesModule = {
    isBound: false,
    init() {
        this.render();
        this.bindEvents();
    },

    bindEvents() {
        if (this.isBound) return;
        this.isBound = true;
        const addExpenseForm = document.getElementById('add-expense-form');
        if (addExpenseForm) {
            addExpenseForm.addEventListener('submit', (e) => this.handleAddExpense(e));
        }
    },

    async handleAddExpense(event) {
        event.preventDefault();

        const form = event.target;
        const editExpenseId = form.dataset.editExpenseId;
        const description = document.getElementById('expense-description').value;
        const amount = parseFloat(document.getElementById('expense-amount').value);
        const category = document.getElementById('expense-category').value;
        const date = document.getElementById('expense-date').value;

        const currentUser = StateManager.getValue('currentUser');
        if (!currentUser) return;

        if (editExpenseId) {
            const expenseData = {
                description,
                amount,
                category,
                date
            };

            try {
                await database.ref('expenses/' + editExpenseId).update(expenseData);
                StateManager.updateInCollection('expenses', editExpenseId, expenseData);
                UIHelpers.showNotification('Expense updated successfully!', 'success');
                UIHelpers.closeModal('add-expense-modal');
                this.render();
                delete form.dataset.editExpenseId;
                form.querySelector('button[type="submit"]').textContent = 'Add Expense';
            } catch (error) {
                console.error('Error updating expense:', error);
                UIHelpers.showNotification('Failed to update expense', 'error');
            }
        } else {
            const expenseData = {
                userId: currentUser.uid,
                description,
                amount,
                category,
                date,
                createdAt: new Date().toISOString()
            };

            try {
                const newExpenseRef = database.ref('expenses').push();
                await newExpenseRef.set(expenseData);

                StateManager.addToCollection('expenses', { id: newExpenseRef.key, ...expenseData });

                UIHelpers.showNotification('Expense added successfully!', 'success');
                UIHelpers.closeModal('add-expense-modal');
                this.render();
            } catch (error) {
                console.error('Error adding expense:', error);
                UIHelpers.showNotification('Failed to add expense', 'error');
            }
        }
    },

    render() {
        const state = StateManager.getState();
        const expensesList = document.getElementById('expenses-list');
        if (!expensesList) return;

        if (state.expenses.length === 0) {
            expensesList.innerHTML = '<p class="empty-state">No expenses recorded yet. Click "New Expense" to add one!</p>';
            return;
        }

        const totalSpent = state.expenses.reduce((sum, e) => sum + e.amount, 0);
        const byCategory = {};

        state.expenses.forEach(expense => {
            byCategory[expense.category] = (byCategory[expense.category] || 0) + expense.amount;
        });

        // Sort expenses by date
        const sortedExpenses = [...state.expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

        expensesList.innerHTML = `
            <div class="widget">
                <h3>Total Spent: $${totalSpent.toFixed(2)}</h3>
                <div style="margin-top: 20px;">
                    <h4>By Category</h4>
                    ${Object.entries(byCategory).map(([category, amount]) => `
                        <div style="margin-bottom: 12px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                <span style="text-transform: capitalize;">${category}</span>
                                <span style="font-weight: bold;">$${amount.toFixed(2)}</span>
                            </div>
                            <div class="progress-bar" style="background: var(--bg-tertiary); height: 8px; border-radius: 4px; overflow: hidden;">
                                <div style="width: ${(amount / totalSpent) * 100}%; height: 100%; background: var(--primary-color);"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="widget" style="margin-top: 20px;">
                <h4>Recent Expenses</h4>
                <div class="expense-list">
                    ${sortedExpenses.slice(0, 10).map(expense => `
                        <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border-color); align-items: center;">
                            <div style="flex: 1;">
                                <div style="font-weight: 500;">${expense.description}</div>
                                <div style="font-size: var(--font-size-sm); color: var(--text-muted);">
                                    ${expense.category} • ${DateUtils.formatDate(new Date(expense.date), 'MMM DD, YYYY')}
                                </div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <div style="font-weight: bold; color: var(--danger-color); min-width: 80px; text-align: right;">
                                    -$${expense.amount.toFixed(2)}
                                </div>
                                <button class="btn btn-small btn-secondary" onclick="ExpensesModule.editExpense('${expense.id}')" style="padding: 4px 8px; font-size: 12px;">Edit</button>
                                <button class="btn btn-small btn-secondary" onclick="ExpensesModule.deleteExpense('${expense.id}')" style="padding: 4px 8px; font-size: 12px; color: var(--danger-color);">✕</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    /**
     * Edit expense
     */
    editExpense(expenseId) {
        const expense = StateManager.getFromCollection('expenses', expenseId);
        if (!expense) return;

        document.getElementById('expense-description').value = expense.description;
        document.getElementById('expense-amount').value = expense.amount;
        document.getElementById('expense-category').value = expense.category || 'other';
        document.getElementById('expense-date').value = expense.date;

        const form = document.getElementById('add-expense-form');
        form.dataset.editExpenseId = expenseId;
        form.querySelector('button[type="submit"]').textContent = 'Update Expense';

        UIHelpers.openModal('add-expense-modal');
    },

    /**
     * Delete expense
     */
    async deleteExpense(expenseId) {
        const confirmed = await UIHelpers.showConfirmation('Are you sure you want to delete this expense?', 'Delete Expense');
        
        if (confirmed) {
            try {
                await database.ref('expenses/' + expenseId).remove();
                StateManager.removeFromCollection('expenses', expenseId);
                this.render();
                UIHelpers.showNotification('Expense deleted', 'success');
            } catch (error) {
                console.error('Error deleting expense:', error);
                UIHelpers.showNotification('Error deleting expense', 'error');
            }
        }
    }
};

// Time Tracking Module
const TimeTrackingModule = {
    isBound: false,
    init() {
        this.render();
        this.bindEvents();
    },

    bindEvents() {
        if (this.isBound) return;
        this.isBound = true;
        const logTimeForm = document.getElementById('log-time-form');
        if (logTimeForm) {
            logTimeForm.addEventListener('submit', (e) => this.handleLogTime(e));
        }
    },

    editTimeLog(logId) {
        const log = StateManager.getFromCollection('timeLogs', logId);
        if (!log) return;

        document.getElementById('time-task').value = log.task;
        document.getElementById('time-hours').value = log.hours || 0;
        document.getElementById('time-minutes').value = log.minutes || 0;
        document.getElementById('time-date').value = log.date;
        document.getElementById('time-notes').value = log.notes || '';

        const form = document.getElementById('log-time-form');
        form.dataset.editLogId = logId;
        form.querySelector('button[type="submit"]').textContent = 'Update Time Log';
        UIHelpers.openModal('log-time-modal');
    },

    async deleteTimeLog(logId) {
        const confirmed = await UIHelpers.showConfirmation('Are you sure you want to delete this time log?', 'Delete Time Log');
        if (confirmed) {
            try {
                await database.ref('timeLogs/' + logId).remove();
                StateManager.removeFromCollection('timeLogs', logId);
                UIHelpers.showNotification('Time log deleted successfully!', 'success');
                this.render();
            } catch (error) {
                console.error('Error deleting time log:', error);
                UIHelpers.showNotification('Failed to delete time log', 'error');
            }
        }
    },

    async handleLogTime(event) {
        event.preventDefault();

        const form = event.target;
        const editLogId = form.dataset.editLogId;
        const task = document.getElementById('time-task').value;
        const hours = parseInt(document.getElementById('time-hours').value);
        const minutes = parseInt(document.getElementById('time-minutes').value);
        const date = document.getElementById('time-date').value;
        const notes = document.getElementById('time-notes').value;

        const currentUser = StateManager.getValue('currentUser');
        if (!currentUser) return;

        const durationInMinutes = hours * 60 + minutes;

        if (editLogId) {
            const timeLogData = {
                task,
                hours,
                minutes,
                duration: durationInMinutes,
                date,
                notes
            };

            try {
                await database.ref('timeLogs/' + editLogId).update(timeLogData);
                StateManager.updateInCollection('timeLogs', editLogId, timeLogData);
                UIHelpers.showNotification('Time log updated successfully!', 'success');
                UIHelpers.closeModal('log-time-modal');
                this.render();
                delete form.dataset.editLogId;
                form.querySelector('button[type="submit"]').textContent = 'Log Time';
            } catch (error) {
                console.error('Error updating time log:', error);
                UIHelpers.showNotification('Failed to update time log', 'error');
            }
        } else {
            const timeLogData = {
                userId: currentUser.uid,
                task,
                hours,
                minutes,
                duration: durationInMinutes,
                date,
                notes,
                createdAt: new Date().toISOString()
            };

            try {
                const newLogRef = database.ref('timeLogs').push();
                await newLogRef.set(timeLogData);

                StateManager.addToCollection('timeLogs', { id: newLogRef.key, ...timeLogData });

                UIHelpers.showNotification('Time logged successfully!', 'success');
                UIHelpers.closeModal('log-time-modal');
                this.render();
            } catch (error) {
                console.error('Error logging time:', error);
                UIHelpers.showNotification('Failed to log time', 'error');
            }
        }
    },

    render() {
        const state = StateManager.getState();
        const trackingList = document.getElementById('time-tracking-list');
        if (!trackingList) return;

        if (state.timeLogs.length === 0) {
            trackingList.innerHTML = '<p class="empty-state">No time logs yet. Click "Log Time" to add one!</p>';
            return;
        }

        const totalMinutes = state.timeLogs.reduce((sum, log) => sum + log.duration, 0);
        const totalHours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;

        const sortedLogs = [...state.timeLogs].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        trackingList.innerHTML = `
            <div class="widget" style="margin-bottom: 20px;">
                <h3>Total Time Logged</h3>
                <div style="font-size: 2em; font-weight: bold; color: var(--primary-color); margin-top: 10px;">
                    ${totalHours}h ${remainingMinutes}m
                </div>
            </div>
            <div class="widget">
                <h4>Recent Logs</h4>
                ${sortedLogs.slice(0, 15).map(log => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-color);">
                        <div style="flex: 1;">
                            <div style="font-weight: 500;">${log.task}</div>
                            <div style="font-size: var(--font-size-sm); color: var(--text-muted);">
                                ${DateUtils.formatDate(new Date(log.date), 'MMM DD, YYYY')}
                            </div>
                            ${log.notes ? `<div style="font-size: var(--font-size-sm); margin-top: 4px;">${log.notes}</div>` : ''}
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="font-weight: bold; color: var(--primary-color); text-align: right;">
                                ${log.hours}h ${log.minutes}m
                            </div>
                            <button class="btn btn-small" onclick="TimeTrackingModule.editTimeLog('${log.id}')">✏️ Edit</button>
                            <button class="btn btn-small btn-danger" onclick="TimeTrackingModule.deleteTimeLog('${log.id}')">🗑️ Delete</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
};

// Analytics Module
const AnalyticsModule = {
    init() {
        this.render();
    },

    render() {
        const state = StateManager.getState();
        const analyticsContainer = document.getElementById('analytics-list');
        if (!analyticsContainer) return;

        const tasks = state.tasks || [];
        const habits = state.habits || [];
        const goals = state.goals || [];

        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

        const habitsWithStreaks = habits.filter(h => h.currentStreak > 0).length;
        const avgStreak = habits.length > 0 ? Math.round(habits.reduce((sum, h) => sum + h.currentStreak, 0) / habits.length) : 0;

        const completedGoals = goals.filter(g => g.progress === 100).length;

        analyticsContainer.innerHTML = `
            <div class="grid-2">
                <div class="widget">
                    <h4>Task Completion</h4>
                    <div style="margin-top: 15px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span>${completedTasks} / ${tasks.length}</span>
                            <span style="font-weight: bold; color: var(--primary-color);">${completionRate}%</span>
                        </div>
                        <div style="background: var(--bg-tertiary); height: 12px; border-radius: 6px; overflow: hidden;">
                            <div style="width: ${completionRate}%; height: 100%; background: var(--primary-color); transition: width 0.3s;"></div>
                        </div>
                    </div>
                </div>
                
                <div class="widget">
                    <h4>Habit Streaks</h4>
                    <div style="margin-top: 15px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span>Active: ${habitsWithStreaks}</span>
                            <span style="font-weight: bold; color: var(--success-color);">Avg: ${avgStreak} days</span>
                        </div>
                    </div>
                </div>
                
                <div class="widget">
                    <h4>Goals Progress</h4>
                    <div style="margin-top: 15px;">
                        <div>${completedGoals} / ${goals.length} completed</div>
                    </div>
                </div>
                
                <div class="widget">
                    <h4>This Week</h4>
                    <div style="margin-top: 15px;">
                        <div>Tasks created: ${tasks.filter(t => {
                            const taskDate = new Date(t.createdAt);
                            const weekAgo = new Date();
                            weekAgo.setDate(weekAgo.getDate() - 7);
                            return taskDate >= weekAgo;
                        }).length}</div>
                    </div>
                </div>
            </div>
        `;
    }
};

window.ExpensesModule = ExpensesModule;
window.TimeTrackingModule = TimeTrackingModule;
window.AnalyticsModule = AnalyticsModule;

// Global functions
window.addExpense = function() { 
    const today = new Date().toISOString().split('T')[0];
    const form = document.getElementById('add-expense-form');
    form.reset();
    delete form.dataset.editExpenseId;
    form.querySelector('button[type="submit"]').textContent = 'Add Expense';
    document.getElementById('expense-date').value = today;
    UIHelpers.openModal('add-expense-modal'); 
}
window.startTimeTracking = function() { 
    const today = new Date().toISOString().split('T')[0];
    const form = document.getElementById('log-time-form');
    form.reset();
    delete form.dataset.editLogId;
    form.querySelector('button[type="submit"]').textContent = 'Log Time';
    document.getElementById('time-date').value = today;
    UIHelpers.openModal('log-time-modal'); 
}
