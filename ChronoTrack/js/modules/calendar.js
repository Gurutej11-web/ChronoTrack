/**
 * Calendar Module
 * Handles calendar display and event management
 */

const CalendarModule = {
    currentMonth: new Date(),
    selectedDate: null,
    isBound: false,

    /**
     * Initialize calendar
     */
    init() {
        this.render();
        this.bindEvents();
    },

    /**
     * Render calendar
     */
    render() {
        this.renderMonthYear();
        this.renderCalendarGrid();
    },

    /**
     * Render month and year
     */
    renderMonthYear() {
        const monthYearEl = document.getElementById('calendar-month-year');
        if (monthYearEl) {
            const months = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
            monthYearEl.textContent = `${months[this.currentMonth.getMonth()]} ${this.currentMonth.getFullYear()}`;
        }
    },

    /**
     * Render calendar grid
     */
    renderCalendarGrid() {
        const calendarGrid = document.getElementById('calendar-grid');
        if (!calendarGrid) return;

        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();
        const firstDay = DateUtils.getFirstDayOfMonth(this.currentMonth);
        const daysInMonth = DateUtils.getDaysInMonth(this.currentMonth);
        const state = StateManager.getState();

        let html = '';

        // Day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        html += '<div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; margin-bottom: 10px;">';
        dayHeaders.forEach(day => {
            html += `<div style="text-align: center; font-weight: bold; padding: 10px; background-color: var(--bg-secondary);">${day}</div>`;
        });
        html += '</div>';

        // Calendar days
        html += '<div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px;">';

        // Empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            html += '<div style="background-color: var(--bg-secondary); padding: 10px; min-height: 80px;"></div>';
        }

        // Days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = DateUtils.formatDate(date, 'YYYY-MM-DD');
            const dayEvents = (state.events || []).filter(event => {
                const eventDate = (event.date || '').split('T')[0];
                return eventDate === dateStr;
            });

            const priorityRank = { high: 3, medium: 2, low: 1, normal: 0 };
            const topPriority = dayEvents.reduce((max, evt) => {
                const rank = priorityRank[evt.priority || 'normal'] || 0;
                return rank > max ? rank : max;
            }, 0);

            const borderPalette = ['var(--border-color)', 'var(--priority-low)', 'var(--priority-medium)', 'var(--priority-high)'];

            const isToday = DateUtils.isToday(date);
            const bgColor = isToday ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-primary)';
            const borderColor = isToday ? 'var(--primary-color)' : borderPalette[topPriority];

            html += `
                <div style="background-color: ${bgColor}; border: 2px solid ${borderColor}; padding: 10px; min-height: 80px; cursor: pointer; transition: all 0.2s ease;" 
                     onmouseover="this.style.transform='scale(1.02)'" 
                     onmouseout="this.style.transform='scale(1)'"
                     onclick="CalendarModule.openDayView(new Date(${year}, ${month}, ${day}))">
                    <div style="font-weight: bold; margin-bottom: 5px; color: var(--text-primary);">${day}</div>
                    <div style="font-size: 12px;">
                        ${dayEvents.slice(0, 2).map(e => {
                            const priorityClass = `priority-${e.priority || 'normal'}`;
                            return `
                                <div class="event-chip ${priorityClass}" style="cursor: pointer;" onclick="event.stopPropagation(); CalendarModule.openEventDetail('${e.id}')">
                                    ${e.title}
                                </div>
                            `;
                        }).join('')}
                        ${dayEvents.length > 2 ? `<div style="color: var(--text-muted);">+${dayEvents.length - 2} more</div>` : ''}
                    </div>
                </div>
            `;
        }

        // Empty cells for days after month ends
        const totalCells = firstDay + daysInMonth;
        const remainingCells = 42 - totalCells; // 6 rows * 7 days
        for (let i = 0; i < remainingCells; i++) {
            html += '<div style="background-color: var(--bg-secondary); padding: 10px; min-height: 80px;"></div>';
        }

        html += '</div>';
        calendarGrid.innerHTML = html;
    },

    /**
     * Open day view modal for selected date
     */
    openDayView(date) {
        this.selectedDate = date;
        const dateStr = DateUtils.formatDate(date, 'YYYY-MM-DD');
        const state = StateManager.getState();
        const dayEvents = (state.events || []).filter(event => {
            const eventDate = (event.date || '').split('T')[0];
            return eventDate === dateStr;
        });

        const titleEl = document.getElementById('day-view-title');
        const eventsEl = document.getElementById('day-view-events');

        if (!titleEl || !eventsEl) return;

        titleEl.textContent = DateUtils.formatDate(date, 'dddd, MMM DD, YYYY');
        
        if (dayEvents.length === 0) {
            eventsEl.innerHTML = '<p class="empty-state">No events for this day</p>';
        } else {
            eventsEl.innerHTML = dayEvents.map(event => `
                <div class="card" style="margin-bottom: 15px;">
                    <div class="card-header">
                        <h3 class="card-title" style="margin: 0;">${event.title}</h3>
                    </div>
                    <div class="card-content" style="padding: var(--spacing-lg);">
                        ${event.time ? `<p><strong>Time:</strong> ${event.time}</p>` : ''}
                        ${event.category ? `<p><strong>Category:</strong> ${event.category}</p>` : ''}
                        <p><strong>Priority:</strong> <span class="badge priority-${event.priority || 'normal'}">${(event.priority || 'normal').toUpperCase()}</span></p>
                        ${event.description ? `<p><strong>Description:</strong> ${event.description}</p>` : ''}
                    </div>
                    <div style="display: flex; gap: var(--spacing-md); padding: var(--spacing-lg); border-top: 1px solid var(--border-color);">
                        <button class="btn btn-small btn-primary" onclick="CalendarModule.editEvent('${event.id}')">Edit</button>
                        <button class="btn btn-small btn-danger" onclick="CalendarModule.deleteEvent('${event.id}')">Delete</button>
                    </div>
                </div>
            `).join('');
        }

        UIHelpers.openModal('day-view-modal');
    },

    /**
     * Create event for selected date
     */
    createEventForSelectedDate() {
        if (!this.selectedDate) {
            UIHelpers.showNotification('Please select a date', 'warning');
            return;
        }

        // Format date as YYYY-MM-DD to ensure correct date
        const year = this.selectedDate.getFullYear();
        const month = String(this.selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(this.selectedDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        const form = document.getElementById('create-event-form');
        form.reset();
        delete form.dataset.editEventId;
        const submitBtn = document.getElementById('create-event-submit');
        if (submitBtn) submitBtn.textContent = 'Create Event';
        document.getElementById('event-date').value = dateStr;
        const prioritySelect = document.getElementById('event-priority');
        if (prioritySelect) prioritySelect.value = 'normal';

        UIHelpers.closeModal('day-view-modal');
        UIHelpers.openModal('create-event-modal');
    },

    /**
     * Previous month
     */
    previousMonth() {
        this.currentMonth = DateUtils.addMonths(this.currentMonth, -1);
        this.render();
    },

    /**
     * Next month
     */
    nextMonth() {
        this.currentMonth = DateUtils.addMonths(this.currentMonth, 1);
        this.render();
    },

    /**
     * Edit event
     */
    editEvent(eventId) {
        const event = StateManager.getFromCollection('events', eventId);
        if (!event) return;

        document.getElementById('event-title').value = event.title;
        document.getElementById('event-date').value = event.date;
        document.getElementById('event-time').value = event.time || '';
        document.getElementById('event-category').value = event.category || 'meeting';
        document.getElementById('event-description').value = event.description || '';
        const prioritySelect = document.getElementById('event-priority');
        if (prioritySelect) prioritySelect.value = event.priority || 'normal';

        const form = document.getElementById('create-event-form');
        form.dataset.editEventId = eventId;
        const submitBtn = document.getElementById('create-event-submit');
        if (submitBtn) submitBtn.textContent = 'Update Event';

        UIHelpers.closeModal('day-view-modal');
        UIHelpers.openModal('create-event-modal');
    },

    /**
     * Delete event
     */
    async deleteEvent(eventId) {
        const confirmed = await UIHelpers.showConfirmation('Are you sure you want to delete this event?', 'Delete Event');
        
        if (!confirmed) return;

        try {
            await database.ref('events/' + eventId).remove();
            StateManager.removeFromCollection('events', eventId);
            this.openDayView(this.selectedDate);
            this.render();
            UIHelpers.showNotification('Event deleted', 'success');
        } catch (error) {
            console.error('Error deleting event:', error);
            UIHelpers.showNotification('Error deleting event', 'error');
        }
    },

    /**
     * Open event detail modal
     */
    openEventDetail(eventId) {
        const event = StateManager.getFromCollection('events', eventId);
        if (!event) return;

        const body = document.getElementById('event-detail-body');
        const titleEl = document.getElementById('event-detail-title');
        const editBtn = document.getElementById('event-detail-edit-btn');
        const deleteBtn = document.getElementById('event-detail-delete-btn');

        if (!body || !titleEl || !editBtn || !deleteBtn) return;

        titleEl.textContent = event.title || 'Event';
        const priorityClass = `priority-${event.priority || 'normal'}`;

        body.innerHTML = `
            <div style="display: grid; gap: 10px;">
                <div><strong>Date:</strong> ${DateUtils.formatDate(new Date(`${event.date}T00:00:00`), 'MMM DD, YYYY')}</div>
                ${event.time ? `<div><strong>Time:</strong> ${event.time}</div>` : ''}
                <div><strong>Category:</strong> ${event.category || 'General'}</div>
                <div><strong>Priority:</strong> <span class="badge ${priorityClass}">${(event.priority || 'normal').toUpperCase()}</span></div>
                <div><strong>Description:</strong><br>${event.description || 'No description'}</div>
            </div>
        `;

        editBtn.onclick = () => {
            UIHelpers.closeModal('event-detail-modal');
            this.editEvent(eventId);
        };
        deleteBtn.onclick = () => this.deleteEvent(eventId);

        UIHelpers.openModal('event-detail-modal');
    },

    /**
     * Bind events
     */
    bindEvents() {
        // Create event form
        const createEventForm = document.getElementById('create-event-form');
        if (this.isBound) return;
        this.isBound = true;

        if (createEventForm) {
            createEventForm.addEventListener('submit', (e) => this.handleCreateEvent(e));
        }
    },

    /**
     * Handle create event form submission
     */
    async handleCreateEvent(eventObj) {
        eventObj.preventDefault();

        const form = eventObj.target;
        const editEventId = form.dataset.editEventId;
        const title = document.getElementById('event-title').value;
        const date = document.getElementById('event-date').value;
        const time = document.getElementById('event-time').value;
        const category = document.getElementById('event-category').value;
        const description = document.getElementById('event-description').value;
        const priority = document.getElementById('event-priority').value || 'normal';
        
        // Create proper ISO date string to prevent timezone issues
        const startTimeIso = time ? new Date(`${date}T${time}`).toISOString() : new Date(`${date}T00:00`).toISOString();

        const currentUser = StateManager.getValue('currentUser');
        if (!currentUser) return;

        if (editEventId) {
            const eventData = {
                title,
                date,
                time: time || null,
                category,
                description,
                priority,
                startTime: startTimeIso
            };

            try {
                await database.ref('events/' + editEventId).update(eventData);
                StateManager.updateInCollection('events', editEventId, eventData);
                UIHelpers.showNotification('Event updated successfully!', 'success');
                UIHelpers.closeModal('create-event-modal');
                this.render();
                if (this.selectedDate) {
                    this.openDayView(this.selectedDate);
                }
                delete form.dataset.editEventId;
                const submitBtn = document.getElementById('create-event-submit');
                if (submitBtn) submitBtn.textContent = 'Create Event';
            } catch (error) {
                console.error('Error updating event:', error);
                UIHelpers.showNotification('Failed to update event', 'error');
            }
        } else {
            const eventData = {
                userId: currentUser.uid,
                title,
                date,
                time: time || null,
                category,
                description,
                priority,
                startTime: startTimeIso,
                createdAt: new Date().toISOString()
            };

            try {
                const newEventRef = database.ref('events').push();
                await newEventRef.set(eventData);

                StateManager.addToCollection('events', { id: newEventRef.key, ...eventData });

                UIHelpers.showNotification('Event created successfully!', 'success');
                UIHelpers.closeModal('create-event-modal');
                this.render();
                if (this.selectedDate) {
                    this.openDayView(this.selectedDate);
                }
            } catch (error) {
                console.error('Error creating event:', error);
                UIHelpers.showNotification('Failed to create event', 'error');
            }
        }
    }
};

window.CalendarModule = CalendarModule;

// Global functions for onclick handlers
window.previousMonth = function() { CalendarModule.previousMonth(); }
window.nextMonth = function() { CalendarModule.nextMonth(); }
