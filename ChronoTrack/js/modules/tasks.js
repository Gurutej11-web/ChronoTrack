/**
 * Tasks Module
 * Handles task management and display
 */

const TasksModule = {
    currentView: 'list',
    isBound: false,

    /**
     * Initialize tasks module
     */
    init() {
        this.render();
        this.bindEvents();
    },

    /**
     * Render tasks
     */
    render() {
        if (this.currentView === 'list') {
            this.renderListView();
        } else {
            this.renderBoardView();
        }
    },

    /**
     * Render list view
     */
    renderListView() {
        const state = StateManager.getState();
        const taskList = document.getElementById('task-list');
        if (!taskList) return;

        const baseTasks = state.tasks || [];
        const query = (StateManager.getValue('searchQuery') || '').toLowerCase();

        const tasks = baseTasks
            .filter(task => !query || task.title.toLowerCase().includes(query) || (task.description || '').toLowerCase().includes(query))
            .sort((a, b) => {
            // Sort by due date, then by priority
            const dateA = new Date(a.dueDate);
            const dateB = new Date(b.dueDate);
            if (dateA.getTime() !== dateB.getTime()) return dateA - dateB;
            
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });

        if (tasks.length === 0) {
            taskList.innerHTML = '<p class="empty-state">No tasks yet. Create one to get started!</p>';
            return;
        }

        taskList.innerHTML = tasks.map(task => {
            const isOverdue = DateUtils.isPast(task.dueDate) && task.status !== 'completed';
            const statusClass = {
                'completed': 'status-completed',
                'in-progress': 'status-in-progress',
                'pending': 'status-pending',
                'overdue': 'status-overdue'
            }[isOverdue ? 'overdue' : task.status];

            return `
                <div class="card" style="margin-bottom: 12px;">
                    <div class="card-header">
                        <div style="flex: 1;">
                            <h3 class="card-title" style="text-decoration: ${task.status === 'completed' ? 'line-through' : 'none'};">${task.title}</h3>
                            <p style="color: var(--text-secondary); font-size: 14px; margin: 0;">
                                Due: ${DateUtils.formatDate(new Date(task.dueDate), 'MMM DD, YYYY')}
                            </p>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <span class="badge badge-primary">${task.priority} priority</span>
                            <span class="badge ${statusClass}">${task.status}</span>
                        </div>
                    </div>
                    ${task.description ? `<div class="card-content"><p>${task.description}</p></div>` : ''}
                    <div class="card-footer">
                        <button class="btn btn-small btn-secondary" onclick="TasksModule.editTask('${task.id}')">Edit</button>
                        <button class="btn btn-small btn-${task.status === 'completed' ? 'secondary' : 'primary'}" 
                                onclick="TasksModule.toggleTaskStatus('${task.id}')">
                            ${task.status === 'completed' ? 'Undo' : 'Complete'}
                        </button>
                        <button class="btn btn-small btn-secondary" onclick="TasksModule.deleteTask('${task.id}')" style="color: var(--danger-color);">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * Render board view (Kanban)
     */
    renderBoardView() {
        const state = StateManager.getState();
        const boardEl = document.getElementById('tasks-board-view');
        if (!boardEl) return;

        const query = (StateManager.getValue('searchQuery') || '').toLowerCase();
        const baseTasks = state.tasks || [];
        const filteredTasks = baseTasks.filter(task => !query || task.title.toLowerCase().includes(query) || (task.description || '').toLowerCase().includes(query));

        const statuses = ['pending', 'in-progress', 'completed', 'overdue'];
        const tasksByStatus = {};

        statuses.forEach(status => {
            tasksByStatus[status] = filteredTasks.filter(task => {
                const isOverdue = DateUtils.isPast(task.dueDate) && task.status !== 'completed';
                return isOverdue ? status === 'overdue' : task.status === status;
            });
        });

        let html = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">';

        statuses.forEach(status => {
            const statusLabel = {
                'pending': 'To Do',
                'in-progress': 'In Progress',
                'completed': 'Done',
                'overdue': 'Overdue'
            }[status];

            const tasks = tasksByStatus[status] || [];

            html += `
                <div style="background-color: var(--bg-secondary); border-radius: 8px; padding: 16px;">
                    <h3 style="margin-top: 0;">${statusLabel} (${tasks.length})</h3>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        ${tasks.map(task => `
                            <div class="card" style="cursor: move;">
                                <h4 class="card-title">${task.title}</h4>
                                <p style="color: var(--text-secondary); font-size: 12px; margin: 0;">
                                    ${DateUtils.formatDate(new Date(task.dueDate), 'MMM DD')}
                                </p>
                                <div style="margin-top: 8px;">
                                    <span class="badge badge-primary">${task.priority}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });

        html += '</div>';
        boardEl.innerHTML = html;
    },

    /**
     * Set task view
     */
    setTaskView(view, trigger) {
        this.currentView = view;
        
        // Update button states
        document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
        if (trigger) trigger.classList.add('active');

        // Update visibility
        UIHelpers.toggleElement('tasks-list-view', view === 'list');
        UIHelpers.toggleElement('tasks-board-view', view === 'board');

        this.render();
    },

    /**
     * Toggle task status
     */
    async toggleTaskStatus(taskId) {
        const task = StateManager.getFromCollection('tasks', taskId);
        if (!task) return;

        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        const updatedTask = {
            ...task,
            status: newStatus,
            completedAt: newStatus === 'completed' ? new Date().toISOString() : null
        };

        try {
            await database.ref('tasks/' + taskId).update(updatedTask);
            StateManager.updateInCollection('tasks', taskId, updatedTask);
            this.render();
            
            UIHelpers.showNotification(`Task marked as ${newStatus}`, 'success');
            if (newStatus === 'completed' && UIHelpers.triggerConfetti) {
                UIHelpers.triggerConfetti();
            }
        } catch (error) {
            console.error('Error updating task:', error);
            UIHelpers.showNotification('Error updating task', 'error');
        }
    },

    /**
     * Edit task
     */
    editTask(taskId) {
        const task = StateManager.getFromCollection('tasks', taskId);
        if (!task) return;

        // Populate the form with existing data
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-description').value = task.description || '';
        document.getElementById('task-priority').value = task.priority || 'medium';
        document.getElementById('task-category').value = task.category || 'work';
        document.getElementById('task-due-date').value = task.dueDate || '';

        // Store the task ID in the form for updating
        const form = document.getElementById('create-task-form');
        form.dataset.editTaskId = taskId;

        // Change button text
        form.querySelector('button[type="submit"]').textContent = 'Update Task';

        UIHelpers.openModal('create-task-modal');
    },

    /**
     * Delete task
     */
    async deleteTask(taskId) {
        const confirmed = await UIHelpers.showConfirmation('Are you sure you want to delete this task?', 'Delete Task');
        
        if (confirmed) {
            try {
                await database.ref('tasks/' + taskId).remove();
                StateManager.removeFromCollection('tasks', taskId);
                this.render();
                UIHelpers.showNotification('Task deleted', 'success');
            } catch (error) {
                console.error('Error deleting task:', error);
                UIHelpers.showNotification('Error deleting task', 'error');
            }
        }
    },

    /**
     * Bind events
     */
    bindEvents() {
        if (this.isBound) return;
        this.isBound = true;
        // Search functionality
        const searchInput = document.getElementById('task-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                StateManager.setState('searchQuery', e.target.value);
                this.render();
            });
        }

        // Create task form
        const createTaskForm = document.getElementById('create-task-form');
        if (createTaskForm) {
            createTaskForm.addEventListener('submit', (e) => this.handleCreateTask(e));
        }
    },

    /**
     * Handle create task form submission
     */
    async handleCreateTask(event) {
        event.preventDefault();

        const form = event.target;
        const editTaskId = form.dataset.editTaskId;
        const title = document.getElementById('task-title').value;
        const description = document.getElementById('task-description').value;
        const priority = document.getElementById('task-priority').value;
        const category = document.getElementById('task-category').value;
        const dueDate = document.getElementById('task-due-date').value;

        const currentUser = StateManager.getValue('currentUser');
        if (!currentUser) return;

        if (editTaskId) {
            // Update existing task
            const taskData = {
                title,
                description,
                priority,
                category,
                dueDate: dueDate || null,
                updatedAt: new Date().toISOString()
            };

            try {
                await database.ref('tasks/' + editTaskId).update(taskData);
                StateManager.updateInCollection('tasks', editTaskId, taskData);
                UIHelpers.showNotification('Task updated successfully!', 'success');
                UIHelpers.closeModal('create-task-modal');
                this.render();
                delete form.dataset.editTaskId;
                form.querySelector('button[type="submit"]').textContent = 'Create Task';
            } catch (error) {
                console.error('Error updating task:', error);
                UIHelpers.showNotification('Failed to update task', 'error');
            }
        } else {
            // Create new task
            const taskData = {
                userId: currentUser.uid,
                title,
                description,
                priority,
                category,
                dueDate: dueDate || null,
                status: 'pending',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            try {
                const newTaskRef = database.ref('tasks').push();
                await newTaskRef.set(taskData);

                // Add to state
                StateManager.addToCollection('tasks', { id: newTaskRef.key, ...taskData });

                UIHelpers.showNotification('Task created successfully!', 'success');
                UIHelpers.closeModal('create-task-modal');
                this.render();
            } catch (error) {
                console.error('Error creating task:', error);
                UIHelpers.showNotification('Failed to create task', 'error');
            }
        }
    },

    /**
     * Filter tasks by search query
     */
    filterTasks() {
        // No-op kept for backward compatibility; filtering now handled in render based on searchQuery
        this.render();
    }
};

window.TasksModule = TasksModule;

// Global functions
window.createTask = function() { 
    const form = document.getElementById('create-task-form');
    form.reset();
    delete form.dataset.editTaskId;
    form.querySelector('button[type="submit"]').textContent = 'Create Task';
    UIHelpers.openModal('create-task-modal'); 
}
window.setTaskView = function(view, el) { TasksModule.setTaskView(view, el); }
