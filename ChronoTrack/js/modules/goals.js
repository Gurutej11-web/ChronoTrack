/**
 * Goals Module
 * Handles goal management and tracking
 */

const GoalsModule = {
    isBound: false,
    /**
     * Initialize goals module
     */
    init() {
        this.render();
        this.bindEvents();
    },

    /**
     * Render goals
     */
    render() {
        this.renderShortTermGoals();
        this.renderLongTermGoals();
    },

    /**
     * Render short-term goals
     */
    renderShortTermGoals() {
        const state = StateManager.getState();
        const shortTermList = document.getElementById('short-goals-list');
        if (!shortTermList) return;

        const shortTermGoals = state.goals.filter(g => g.type === 'short-term' && g.status === 'active');

        if (shortTermGoals.length === 0) {
            shortTermList.innerHTML = '<p class="empty-state">No short-term goals</p>';
            return;
        }

        shortTermList.innerHTML = shortTermGoals.map(goal => this.renderGoalCard(goal)).join('');
    },

    /**
     * Render long-term goals
     */
    renderLongTermGoals() {
        const state = StateManager.getState();
        const longTermList = document.getElementById('long-goals-list');
        if (!longTermList) return;

        const longTermGoals = state.goals.filter(g => g.type === 'long-term' && g.status === 'active');

        if (longTermGoals.length === 0) {
            longTermList.innerHTML = '<p class="empty-state">No long-term goals</p>';
            return;
        }

        longTermList.innerHTML = longTermGoals.map(goal => this.renderGoalCard(goal)).join('');
    },

    /**
     * Render goal card
     */
    renderGoalCard(goal) {
        const daysLeft = DateUtils.daysBetween(new Date(), goal.targetDate);
        const milestonesCompleted = (goal.milestones || []).filter(m => m.completed).length;
        const totalMilestones = (goal.milestones || []).length;

        return `
            <div class="card" style="margin-bottom: 12px;">
                <div class="card-header">
                    <div style="flex: 1;">
                        <h3 class="card-title">${goal.title}</h3>
                        <p style="color: var(--text-secondary); font-size: 14px; margin: 0;">
                            Target: ${DateUtils.formatDate(new Date(goal.targetDate), 'MMM DD, YYYY')} (${daysLeft} days left)
                        </p>
                    </div>
                    <span class="badge badge-primary">${goal.category}</span>
                </div>
                <div class="card-content">
                    <p>${goal.description}</p>
                    <div style="margin-top: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <span style="font-size: 14px;">Progress</span>
                            <span style="font-weight: bold;">${goal.progress || 0}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${goal.progress || 0}%;"></div>
                        </div>
                    </div>
                    ${totalMilestones > 0 ? `
                        <div style="margin-top: 12px;">
                            <p style="font-size: 14px; margin: 0 0 8px 0;">Milestones: ${milestonesCompleted}/${totalMilestones}</p>
                            ${goal.milestones.map(milestone => `
                                <div style="padding: 4px 0; font-size: 14px;">
                                    <input type="checkbox" ${milestone.completed ? 'checked' : ''} onchange="GoalsModule.toggleMilestone('${goal.id}', '${milestone.id}')">
                                    <span style="text-decoration: ${milestone.completed ? 'line-through' : 'none'};">${milestone.title}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="card-footer">
                    <button class="btn btn-small btn-secondary" onclick="GoalsModule.editGoal('${goal.id}')">Edit</button>
                    <button class="btn btn-small btn-secondary" onclick="GoalsModule.deleteGoal('${goal.id}')" style="color: var(--danger-color);">Delete</button>
                </div>
            </div>
        `;
    },

    /**
     * Toggle milestone completion
     */
    async toggleMilestone(goalId, milestoneId) {
        const goal = StateManager.getFromCollection('goals', goalId);
        if (!goal) return;

        const updatedMilestones = goal.milestones.map(m => {
            if (m.id === milestoneId) {
                return { ...m, completed: !m.completed, completedAt: !m.completed ? new Date().toISOString() : null };
            }
            return m;
        });

        const completedCount = updatedMilestones.filter(m => m.completed).length;
        const newProgress = Math.round((completedCount / updatedMilestones.length) * 100);

        const updatedGoal = {
            ...goal,
            milestones: updatedMilestones,
            progress: newProgress
        };

        try {
            await database.ref('goals/' + goalId).update(updatedGoal);
            StateManager.updateInCollection('goals', goalId, updatedGoal);
            this.render();
            UIHelpers.showNotification('Milestone updated', 'success');
        } catch (error) {
            console.error('Error updating milestone:', error);
            UIHelpers.showNotification('Error updating milestone', 'error');
        }
    },

    /**
     * Edit goal
     */
    editGoal(goalId) {
        const goal = StateManager.getFromCollection('goals', goalId);
        if (!goal) return;

        document.getElementById('goal-title').value = goal.title;
        document.getElementById('goal-description').value = goal.description || '';
        document.getElementById('goal-target-date').value = goal.targetDate || '';
        document.getElementById('goal-milestones').value = (goal.milestones || []).map(m => m.text || m.title).join('\n');

        const form = document.getElementById('create-goal-form');
        form.dataset.editGoalId = goalId;
        form.querySelector('button[type="submit"]').textContent = 'Update Goal';

        UIHelpers.openModal('create-goal-modal');
    },

    /**
     * Delete goal
     */
    async deleteGoal(goalId) {
        const confirmed = await UIHelpers.showConfirmation('Are you sure you want to delete this goal?', 'Delete Goal');
        
        if (confirmed) {
            try {
                await database.ref('goals/' + goalId).remove();
                StateManager.removeFromCollection('goals', goalId);
                this.render();
                UIHelpers.showNotification('Goal deleted', 'success');
            } catch (error) {
                console.error('Error deleting goal:', error);
                UIHelpers.showNotification('Error deleting goal', 'error');
            }
        }
    },

    /**
     * Bind events
     */
    bindEvents() {
        if (this.isBound) return;
        this.isBound = true;
        const createGoalForm = document.getElementById('create-goal-form');
        if (createGoalForm) {
            createGoalForm.addEventListener('submit', (e) => this.handleCreateGoal(e));
        }
    },

    /**
     * Handle create goal form submission
     */
    async handleCreateGoal(event) {
        event.preventDefault();

        const form = event.target;
        const editGoalId = form.dataset.editGoalId;
        const title = document.getElementById('goal-title').value;
        const description = document.getElementById('goal-description').value;
        const targetDate = document.getElementById('goal-target-date').value;
        const milestonesText = document.getElementById('goal-milestones').value;

        const currentUser = StateManager.getValue('currentUser');
        if (!currentUser) return;

        const milestones = milestonesText
            .split('\n')
            .filter(m => m.trim())
            .map(m => ({ id: Math.random().toString(36).substr(2, 9), text: m.trim(), completed: false }));

        if (editGoalId) {
            const goalData = {
                title,
                description,
                targetDate: targetDate || null,
                milestones,
                updatedAt: new Date().toISOString()
            };

            try {
                await database.ref('goals/' + editGoalId).update(goalData);
                StateManager.updateInCollection('goals', editGoalId, goalData);
                UIHelpers.showNotification('Goal updated successfully!', 'success');
                UIHelpers.closeModal('create-goal-modal');
                this.render();
                delete form.dataset.editGoalId;
                form.querySelector('button[type="submit"]').textContent = 'Create Goal';
            } catch (error) {
                console.error('Error updating goal:', error);
                UIHelpers.showNotification('Failed to update goal', 'error');
            }
        } else {
            const goalData = {
                userId: currentUser.uid,
                title,
                description,
                targetDate: targetDate || null,
                milestones,
                progress: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            try {
                const newGoalRef = database.ref('goals').push();
                await newGoalRef.set(goalData);

                StateManager.addToCollection('goals', { id: newGoalRef.key, ...goalData });

                UIHelpers.showNotification('Goal created successfully!', 'success');
                UIHelpers.closeModal('create-goal-modal');
                this.render();
            } catch (error) {
                console.error('Error creating goal:', error);
                UIHelpers.showNotification('Failed to create goal', 'error');
            }
        }
    }
};

window.GoalsModule = GoalsModule;

// Global functions
window.createGoal = function() { 
    const form = document.getElementById('create-goal-form');
    form.reset();
    delete form.dataset.editGoalId;
    form.querySelector('button[type="submit"]').textContent = 'Create Goal';
    UIHelpers.openModal('create-goal-modal'); 
}
