/**
 * Event Form Handler Fix
 * Ensures create event form submission works properly
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('create-event-form');
    if (form && !form.dataset.handlerAttached) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            if (CalendarModule && CalendarModule.handleCreateEvent) {
                CalendarModule.handleCreateEvent(e);
            }
        });
        form.dataset.handlerAttached = 'true';
    }
});

// Global function to submit form
window.submitCreateEventForm = function() {
    const form = document.getElementById('create-event-form');
    if (form) {
        const event = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(event);
    }
}
