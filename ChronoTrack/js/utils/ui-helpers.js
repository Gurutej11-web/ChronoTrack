/**
 * UI Helpers
 * Common UI utility functions
 */

const UIHelpers = {
    /**
     * Show notification
     */
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 16px 20px;
            background-color: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            box-shadow: var(--shadow-lg);
            z-index: var(--z-notification);
            animation: slideInRight 300ms ease-out;
        `;

        // Add color based on type
        const colors = {
            success: 'var(--success-color)',
            error: 'var(--danger-color)',
            warning: 'var(--warning-color)',
            info: 'var(--primary-color)'
        };

        notification.style.borderLeftColor = colors[type] || colors.info;
        notification.style.borderLeftWidth = '4px';
        notification.style.paddingLeft = '16px';

        document.body.appendChild(notification);

        if (duration > 0) {
            setTimeout(() => {
                notification.remove();
            }, duration);
        }

        return notification;
    },

    /**
     * Show confirmation dialog
     */
    showConfirmation(message, title = 'Confirm') {
        return new Promise((resolve) => {
            const backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop active';
            backdrop.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            `;
            
            const modalContent = document.createElement('div');
            modalContent.style.cssText = `
                background-color: var(--bg-primary);
                border-radius: var(--radius-lg);
                box-shadow: var(--shadow-xl);
                max-width: 400px;
                width: 90%;
                padding: 0;
                z-index: 10000;
                animation: slideUp 300ms ease-out;
            `;
            
            const header = document.createElement('div');
            header.style.cssText = `
                padding: var(--spacing-lg);
                border-bottom: 1px solid var(--border-color);
                display: flex;
                justify-content: space-between;
                align-items: center;
            `;
            header.innerHTML = `
                <h2 style="margin: 0; font-size: var(--font-size-xl); font-weight: var(--font-weight-semibold);">${title}</h2>
            `;
            
            const body = document.createElement('div');
            body.style.cssText = `
                padding: var(--spacing-lg);
            `;
            body.innerHTML = `<p style="margin: 0; color: var(--text-primary); line-height: 1.6;">${message}</p>`;
            
            const footer = document.createElement('div');
            footer.style.cssText = `
                padding: var(--spacing-lg);
                border-top: 1px solid var(--border-color);
                display: flex;
                gap: var(--spacing-md);
                justify-content: flex-end;
                flex-wrap: wrap;
            `;
            
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'btn btn-secondary';
            cancelBtn.textContent = 'Cancel';
            cancelBtn.style.cursor = 'pointer';
            
            const confirmBtn = document.createElement('button');
            confirmBtn.className = 'btn btn-primary';
            confirmBtn.textContent = 'Confirm';
            confirmBtn.style.cursor = 'pointer';
            
            footer.appendChild(cancelBtn);
            footer.appendChild(confirmBtn);
            
            modalContent.appendChild(header);
            modalContent.appendChild(body);
            modalContent.appendChild(footer);
            backdrop.appendChild(modalContent);
            document.body.appendChild(backdrop);

            cancelBtn.addEventListener('click', () => {
                backdrop.remove();
                resolve(false);
            });

            confirmBtn.addEventListener('click', () => {
                backdrop.remove();
                resolve(true);
            });

            // Allow ESC key to close
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    backdrop.remove();
                    document.removeEventListener('keydown', handleEscape);
                    resolve(false);
                }
            };
            document.addEventListener('keydown', handleEscape);
        });
    },

    /**
     * Show loading spinner
     */
    showLoader(text = 'Loading...') {
        const loader = document.createElement('div');
        loader.className = 'loading-overlay active';
        loader.innerHTML = `
            <div style="text-align: center;">
                <div class="spinner"></div>
                <p style="margin-top: 16px; color: white;">${text}</p>
            </div>
        `;

        document.body.appendChild(loader);
        return loader;
    },

    /**
     * Hide loader
     */
    hideLoader(loader) {
        if (loader && loader.parentNode) {
            loader.remove();
        }
    },

    /**
     * Toggle element visibility
     */
    toggleElement(element, show = null) {
        if (typeof element === 'string') {
            element = document.getElementById(element) || document.querySelector(element);
        }

        if (!element) return;

        if (show === null) {
            element.classList.toggle('hidden');
        } else if (show) {
            element.classList.remove('hidden');
        } else {
            element.classList.add('hidden');
        }
    },

    /**
     * Show element
     */
    show(element) {
        this.toggleElement(element, true);
    },

    /**
     * Hide element
     */
    hide(element) {
        this.toggleElement(element, false);
    },

    /**
     * Get form data
     */
    getFormData(formElement) {
        const formData = new FormData(formElement);
        const data = {};

        for (let [key, value] of formData.entries()) {
            if (data[key]) {
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }

        return data;
    },

    /**
     * Disable form
     */
    disableForm(formElement) {
        Array.from(formElement.elements).forEach(el => {
            el.disabled = true;
        });
    },

    /**
     * Enable form
     */
    enableForm(formElement) {
        Array.from(formElement.elements).forEach(el => {
            el.disabled = false;
        });
    },

    /**
     * Clear form
     */
    clearForm(formElement) {
        formElement.reset();
    },

    /**
     * Validate email
     */
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    /**
     * Validate required fields
     */
    validateRequired(fields) {
        const errors = {};
        
        fields.forEach(field => {
            if (!field.value || field.value.trim() === '') {
                errors[field.name] = `${field.name} is required`;
            }
        });

        return Object.keys(errors).length === 0 ? null : errors;
    },

    /**
     * Show form errors
     */
    showFormErrors(formElement, errors) {
        // Clear existing error messages
        formElement.querySelectorAll('.form-error').forEach(el => el.remove());

        // Show new errors
        Object.keys(errors).forEach(fieldName => {
            const field = formElement.elements[fieldName];
            if (field) {
                const errorEl = document.createElement('div');
                errorEl.className = 'form-error';
                errorEl.textContent = errors[fieldName];
                field.parentNode.appendChild(errorEl);
            }
        });
    },

    /**
     * Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Copy to clipboard
     */
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Copied to clipboard!', 'success');
        }).catch(() => {
            this.showNotification('Failed to copy', 'error');
        });
    },

    /**
     * Animate element
     */
    animate(element, animationName, duration = 300) {
        return new Promise((resolve) => {
            element.style.animation = `${animationName} ${duration}ms ease-out`;
            setTimeout(() => {
                element.style.animation = '';
                resolve();
            }, duration);
        });
    },

    /**
     * Format currency
     */
    formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },

    /**
     * Create element with attributes
     */
    createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);

        Object.keys(attributes).forEach(key => {
            if (key === 'className') {
                element.className = attributes[key];
            } else if (key === 'style') {
                Object.assign(element.style, attributes[key]);
            } else {
                element.setAttribute(key, attributes[key]);
            }
        });

        if (content) {
            if (typeof content === 'string') {
                element.innerHTML = content;
            } else {
                element.appendChild(content);
            }
        }

        return element;
    },

    /**
     * Scroll to element
     */
    scrollToElement(element, behavior = 'smooth') {
        if (typeof element === 'string') {
            element = document.getElementById(element) || document.querySelector(element);
        }

        if (element) {
            element.scrollIntoView({ behavior });
        }
    },

    /**
     * Is element in viewport
     */
    isElementInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    /**
     * Open modal
     */
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    },

    /**
     * Close modal
     */
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
            // Reset form if exists
            const form = modal.querySelector('form');
            if (form) form.reset();
        }
    },

    /**
     * Trigger a small confetti effect
     */
    triggerConfetti() {
        const colors = [
            getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#6366f1',
            getComputedStyle(document.documentElement).getPropertyValue('--secondary-color').trim() || '#ec4899',
            getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#f59e0b',
            getComputedStyle(document.documentElement).getPropertyValue('--success-color').trim() || '#10b981'
        ];

        const pieces = 24;
        for (let i = 0; i < pieces; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.left = `${Math.random() * 100}vw`;
            piece.style.backgroundColor = colors[i % colors.length];
            piece.style.animationDelay = `${Math.random() * 0.2}s`;
            piece.style.transform = `rotate(${Math.random() * 360}deg)`;
            document.body.appendChild(piece);

            setTimeout(() => piece.remove(), 1400);
        }
    },

    /**
     * Get query parameter
     */
    getQueryParam(param) {
        const searchParams = new URLSearchParams(window.location.search);
        return searchParams.get(param);
    },

    /**
     * Set page title
     */
    setPageTitle(title) {
        document.title = `${title} | ChronoTrack`;
    }
};

window.UIHelpers = UIHelpers;
