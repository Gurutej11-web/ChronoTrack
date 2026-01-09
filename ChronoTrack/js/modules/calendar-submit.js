/**
 * Calendar Form Submission Handler
 * This file provides a workaround for form submission outside the form element
 */

// Submit create event form
window.submitCreateEventForm = function() {
    const form = document.getElementById('create-event-form');
    if (form) {
        // Manually trigger form validation and submission
        const title = document.getElementById('event-title').value;
        const date = document.getElementById('event-date').value;
        
        if (!title) {
            UIHelpers.showNotification('Please enter an event title', 'warning');
            return;
        }
        
        if (!date) {
            UIHelpers.showNotification('Please select a date', 'warning');
            return;
        }
        
        // Trigger form submission
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }
}
