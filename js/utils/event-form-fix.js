/**
 * Create Event Form - Inline Fix
 * This ensures the form submission works properly
 */

(function() {
    // Ensure form is properly bound after DOM loads
    function ensureFormBound() {
        const form = document.getElementById('create-event-form');
        if (!form) return;
        
        // Check if already bound
        if (form._boundByFix) return;
        
        // Remove old listeners and add new one
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        
        const updatedForm = document.getElementById('create-event-form');
        updatedForm._boundByFix = true;
        
        updatedForm.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (window.CalendarModule && window.CalendarModule.handleCreateEvent) {
                window.CalendarModule.handleCreateEvent(e);
            } else {
                console.error('CalendarModule not found');
            }
        });
    }
    
    // Wait for calendar module to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ensureFormBound);
    } else {
        ensureFormBound();
    }
    
    // Also try to bind after a short delay to ensure all modules are loaded
    setTimeout(ensureFormBound, 100);
    setTimeout(ensureFormBound, 500);
})();

// Global submit function
window.submitCreateEventForm = function() {
    const form = document.getElementById('create-event-form');
    if (!form) {
        console.error('Form not found');
        return;
    }
    
    // Validate required fields
    const title = document.getElementById('event-title').value.trim();
    const date = document.getElementById('event-date').value;
    
    if (!title) {
        if (window.UIHelpers && window.UIHelpers.showNotification) {
            window.UIHelpers.showNotification('Please enter an event title', 'warning');
        } else {
            alert('Please enter an event title');
        }
        return;
    }
    
    if (!date) {
        if (window.UIHelpers && window.UIHelpers.showNotification) {
            window.UIHelpers.showNotification('Please select a date', 'warning');
        } else {
            alert('Please select a date');
        }
        return;
    }
    
    // Dispatch submit event
    const event = new Event('submit', { bubbles: true, cancelable: true });
    const result = form.dispatchEvent(event);
    
    if (!result) {
        console.error('Form submission was cancelled');
    }
};
