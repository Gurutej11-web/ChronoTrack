/**
 * Main Application Entry Point
 * Initializes the application and handles page navigation
 */

class ChronoTrackApp {
    constructor() {
        this.currentPage = 'dashboard';
        this.initializeApp();
    }

    /**
     * Initialize application
     */
    initializeApp() {
        // Set up event listeners
        this.setupGlobalListeners();
        this.setupThemeToggle();
        this.setupNavigation();
        this.setupSearch();
        
        // Display initial date/time
        this.updateDateTime();
        setInterval(() => this.updateDateTime(), 60000);
    }

    /**
     * Set up global event listeners
     */
    setupGlobalListeners() {
        // Listen for theme changes (optional, can be removed if causing issues)
        // StateManager.subscribe((state) => {
        //     if (state.currentPage !== this.currentPage) {
        //         this.navigateTo(state.currentPage);
        //     }
        // });
    }

    /**
     * Set up theme toggle
     */
    setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentTheme = StateManager.getTheme();
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                
                document.body.classList.remove(currentTheme === 'light' ? 'light-theme' : 'dark-theme');
                document.body.classList.add(newTheme === 'light' ? 'light-theme' : 'dark-theme');
                
                StateManager.setTheme(newTheme);
                themeToggle.textContent = newTheme === 'light' ? '🌙' : '☀️';
            });
        }
    }

    /**
     * Set up navigation
     */
    setupNavigation() {
        // Listen for nav item clicks
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
                if (page) this.navigateTo(page);
            });
        });

        // User menu dropdown
        const userAvatar = document.getElementById('user-avatar');
        const userDropdown = document.getElementById('user-dropdown');
        
        if (userAvatar && userDropdown) {
            userAvatar.addEventListener('click', () => {
                userDropdown.classList.toggle('active');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!userAvatar.contains(e.target) && !userDropdown.contains(e.target)) {
                    userDropdown.classList.remove('active');
                }
            });
        }
    }

    /**
     * Set up global search
     */
    setupSearch() {
        const searchInput = document.getElementById('global-search');
        if (searchInput) {
            const debouncedSearch = UIHelpers.debounce((query) => {
                this.performGlobalSearch(query);
            }, 300);

            searchInput.addEventListener('input', (e) => {
                debouncedSearch(e.target.value);
            });
        }
    }

    /**
     * Perform global search across all collections
     */
    performGlobalSearch(query) {
        if (!query) {
            StateManager.setState('searchQuery', '');
            return;
        }

        const state = StateManager.getState();
        const lowerQuery = query.toLowerCase();

        const results = {
            tasks: state.tasks.filter(t => t.title.toLowerCase().includes(lowerQuery)),
            events: state.events.filter(e => e.title.toLowerCase().includes(lowerQuery)),
            goals: state.goals.filter(g => g.title.toLowerCase().includes(lowerQuery)),
            notes: state.notes.filter(n => n.title.toLowerCase().includes(lowerQuery)),
            habits: state.habits.filter(h => h.title.toLowerCase().includes(lowerQuery))
        };

        // Could display search results in a dropdown or modal
        console.log('Search results:', results);
    }

    /**
     * Navigate to page
     */
    navigateTo(page) {
        // Update state
        StateManager.setState('currentPage', page);
        this.currentPage = page;

        // Hide all pages
        const allPages = document.querySelectorAll('.page-container');
        allPages.forEach(p => {
            p.classList.add('hidden');
        });

        // Show selected page
        const pageEl = document.getElementById(`${page}-page`);
        if (pageEl) {
            pageEl.classList.remove('hidden');
        }

        // Update nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Mark current nav item as active
        const activeItem = document.querySelector(`.nav-item[onclick*="'${page}'"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }

        // Initialize page-specific modules
        this.initializePageModule(page);
    }

    /**
     * Initialize page-specific modules
     */
    initializePageModule(page) {
        switch(page) {
            case 'dashboard':
                if (DashboardModule) DashboardModule.init();
                break;
            case 'calendar':
                if (CalendarModule) CalendarModule.init();
                break;
            case 'tasks':
                if (TasksModule) TasksModule.init();
                break;
            case 'goals':
                if (GoalsModule) GoalsModule.init();
                break;
            case 'habits':
                if (HabitsModule) HabitsModule.init();
                break;
            case 'notes':
                if (NotesModule) NotesModule.init();
                break;
            case 'expenses':
                if (ExpensesModule) ExpensesModule.init();
                break;
            case 'time-tracking':
                if (TimeTrackingModule) TimeTrackingModule.init();
                break;
            case 'analytics':
                if (AnalyticsModule) AnalyticsModule.init();
                break;
            case 'profile':
                this.initializeProfilePage();
                break;
            case 'preferences':
                this.initializePreferencesPage();
                break;
        }
    }

    initializeProfilePage() {
        const currentUser = StateManager.getValue('currentUser');
        if (!currentUser) return;

        // Set user email
        document.getElementById('profile-email').textContent = currentUser.email;

        // Set user avatar initials
        const email = currentUser.email || 'User';
        const initials = email.charAt(0).toUpperCase();
        document.getElementById('profile-avatar').textContent = initials;

        // Load profile data from database
        database.ref('users/' + currentUser.uid).once('value', snapshot => {
            const userData = snapshot.val();
            if (userData) {
                document.getElementById('profile-name').value = userData.displayName || '';
                document.getElementById('profile-bio').value = userData.bio || '';
            }
        });
    }

    initializePreferencesPage() {
        // Settings are auto-saved via toggleTheme and localStorage
        // This can be expanded for more preference options
    }

    /**
     * Update date and time display
     */
    updateDateTime() {
        const dateEl = document.getElementById('current-date-display');
        if (dateEl) {
            dateEl.textContent = DateUtils.formatDate(new Date(), 'dddd, MMMM DD, YYYY');
        }
    }
}

// Global navigation functions
window.navigateTo = function(page) {
    window.app.navigateTo(page);
}

window.goToProfile = function() {
    window.app.navigateTo('profile');
}

window.goToPreferences = function() {
    window.app.navigateTo('preferences');
}

window.saveProfileSettings = function() {
    const currentUser = StateManager.getValue('currentUser');
    if (!currentUser) return;
    
    const name = document.getElementById('profile-name').value;
    const bio = document.getElementById('profile-bio').value;
    
    database.ref('users/' + currentUser.uid).update({
        displayName: name,
        bio: bio
    }).then(() => {
        UIHelpers.showNotification('Profile saved successfully!', 'success');
    }).catch(error => {
        console.error('Error saving profile:', error);
        UIHelpers.showNotification('Failed to save profile', 'error');
    });
}

window.toggleTheme = function() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    StateManager.setState({ theme: newTheme });
    
    UIHelpers.showNotification(`Switched to ${newTheme} mode`, 'success');
}

window.changePassword = function() {
    UIHelpers.showNotification('Password change coming soon', 'info');
}

window.exportData = function() {
    const state = StateManager.getState();
    const dataToExport = {
        tasks: state.tasks,
        events: state.events,
        goals: state.goals,
        habits: state.habits,
        notes: state.notes,
        expenses: state.expenses,
        timeLogs: state.timeLogs,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chronotrack-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    UIHelpers.showNotification('Data exported successfully!', 'success');
}

window.deleteAccount = async function() {
    const confirmed = await UIHelpers.showConfirmation('Are you sure you want to delete your account? This cannot be undone.', 'Delete Account');
    if (confirmed) {
        const currentUser = StateManager.getValue('currentUser');
        if (currentUser) {
            database.ref('users/' + currentUser.uid).remove();
            currentUser.delete().then(() => {
                UIHelpers.showNotification('Account deleted', 'success');
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }).catch(error => {
                console.error('Error deleting account:', error);
                UIHelpers.showNotification('Failed to delete account', 'error');
            });
        }
    }
}

window.logout = function() {
    AuthModule.logout();
}

window.toggleAuthForms = function(e) {
    if (e) e.preventDefault();
    
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    console.log('Toggle called. Login active:', loginForm.classList.contains('active'));
    
    if (loginForm.classList.contains('active')) {
        loginForm.classList.remove('active');
        signupForm.classList.add('active');
    } else {
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
    }
}

// Handle sidebar toggle on mobile
window.toggleSidebar = function() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ChronoTrackApp();
    AuthModule.init();
});
