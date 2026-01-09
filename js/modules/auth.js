/**
 * Authentication Module
 * Handles user registration, login, and logout
 */

const AuthModule = {
    /**
     * Initialize auth listeners
     */
    init() {
        // Listen for auth state changes
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.handleUserLogin(user);
            } else {
                this.handleUserLogout();
            }
        });

        // Bind form events
        this.bindEvents();
    },

    /**
     * Bind auth form events
     */
    bindEvents() {
        const loginForm = document.getElementById('login-form-element');
        const signupForm = document.getElementById('signup-form-element');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }
    },

    /**
     * Handle login form submission
     */
    async handleLogin(event) {
        event.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            UIHelpers.showNotification('Please fill in all fields', 'error');
            return;
        }

        const loader = UIHelpers.showLoader('Signing in...');

        try {
            await firebase.auth().signInWithEmailAndPassword(email, password);
            UIHelpers.hideLoader(loader);
            UIHelpers.showNotification('Login successful!', 'success');
        } catch (error) {
            UIHelpers.hideLoader(loader);
            this.handleAuthError(error);
        }
    },

    /**
     * Handle signup form submission
     */
    async handleSignup(event) {
        event.preventDefault();

        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const timezone = document.getElementById('signup-timezone').value;

        if (!name || !email || !password || !timezone) {
            UIHelpers.showNotification('Please fill in all fields', 'error');
            return;
        }

        if (!UIHelpers.isValidEmail(email)) {
            UIHelpers.showNotification('Please enter a valid email', 'error');
            return;
        }

        if (password.length < 6) {
            UIHelpers.showNotification('Password must be at least 6 characters', 'error');
            return;
        }

        const loader = UIHelpers.showLoader('Creating account...');

        try {
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
            
            // Set display name
            await userCredential.user.updateProfile({
                displayName: name
            });

            // Create user document in Firestore
            await this.createUserDocument(userCredential.user, name, timezone);

            UIHelpers.hideLoader(loader);
            UIHelpers.showNotification('Account created successfully!', 'success');
        } catch (error) {
            UIHelpers.hideLoader(loader);
            this.handleAuthError(error);
        }
    },

    /**
     * Create user document in Realtime Database
     */
    async createUserDocument(user, displayName, timezone) {
        const userRef = database.ref('users/' + user.uid);

        const userData = {
            userId: user.uid,
            displayName: displayName,
            email: user.email,
            timezone: timezone,
            locale: 'en-US',
            theme: 'light',
            accentColor: 'violet',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            preferences: {
                emailNotifications: true,
                pushNotifications: true,
                analyticsEnabled: true,
                defaultCalendarView: 'monthly',
                defaultTaskView: 'list',
                weekStartDay: 0
            }
        };

        await userRef.set(userData);
    },

    /**
     * Handle user login
     */
    async handleUserLogin(user) {
        // Load user data from Realtime Database
        try {
            const userSnapshot = await database.ref('users/' + user.uid).once('value');
            let userData = userSnapshot.val();

            // If user document doesn't exist, create it
            if (!userSnapshot.exists()) {
                userData = {
                    userId: user.uid,
                    displayName: user.displayName || user.email.split('@')[0],
                    email: user.email,
                    timezone: 'UTC',
                    locale: 'en-US',
                    theme: 'light',
                    accentColor: 'violet',
                    createdAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString(),
                    preferences: {
                        emailNotifications: true,
                        pushNotifications: true,
                        analyticsEnabled: true,
                        defaultCalendarView: 'monthly',
                        defaultTaskView: 'list',
                        weekStartDay: 0
                    }
                };
                await database.ref('users/' + user.uid).set(userData);
            }
            
            // Update state
            StateManager.setState('currentUser', {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || userData.displayName,
                ...userData
            });
            
            StateManager.setState('isAuthenticated', true);

            // Load user data
            await this.loadUserData(user.uid);

            // Show main app
            this.showMainApp();
        } catch (error) {
            console.error('Error loading user data:', error);
            UIHelpers.showNotification('Error loading user data: ' + error.message, 'error');
        }
    },

    /**
     * Handle user logout
     */
    handleUserLogout() {
        // Clear state
        StateManager.setState('currentUser', null);
        StateManager.setState('isAuthenticated', false);
        StateManager.clearAll();

        // Show auth screen
        this.showAuthScreen();
    },

    /**
     * Load user data from Realtime Database
     */
    async loadUserData(userId) {
        try {
            // Load events
            const eventsSnapshot = await database.ref('events').orderByChild('userId').equalTo(userId).once('value');
            const events = [];
            eventsSnapshot.forEach(child => {
                events.push({ id: child.key, ...child.val() });
            });
            StateManager.setState('events', events);

            // Load tasks
            const tasksSnapshot = await database.ref('tasks').orderByChild('userId').equalTo(userId).once('value');
            const tasks = [];
            tasksSnapshot.forEach(child => {
                tasks.push({ id: child.key, ...child.val() });
            });
            StateManager.setState('tasks', tasks);

            // Load goals
            const goalsSnapshot = await database.ref('goals').orderByChild('userId').equalTo(userId).once('value');
            const goals = [];
            goalsSnapshot.forEach(child => {
                goals.push({ id: child.key, ...child.val() });
            });
            StateManager.setState('goals', goals);

            // Load habits
            const habitsSnapshot = await database.ref('habits').orderByChild('userId').equalTo(userId).once('value');
            const habits = [];
            habitsSnapshot.forEach(child => {
                habits.push({ id: child.key, ...child.val() });
            });
            StateManager.setState('habits', habits);

            // Load notes
            const notesSnapshot = await database.ref('notes').orderByChild('userId').equalTo(userId).once('value');
            const notes = [];
            notesSnapshot.forEach(child => {
                notes.push({ id: child.key, ...child.val() });
            });
            StateManager.setState('notes', notes);
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    },

    /**
     * Logout user
     */
    async logout() {
        const confirmed = await UIHelpers.showConfirmation('Are you sure you want to logout?', 'Logout');
        
        if (confirmed) {
            try {
                await firebase.auth().signOut();
                UIHelpers.showNotification('Logged out successfully', 'success');
            } catch (error) {
                UIHelpers.showNotification('Error logging out', 'error');
            }
        }
    },

    /**
     * Handle authentication errors
     */
    handleAuthError(error) {
        let message = 'An error occurred';

        switch (error.code) {
            case 'auth/weak-password':
                message = 'Password should be at least 6 characters';
                break;
            case 'auth/email-already-in-use':
                message = 'Email is already in use';
                break;
            case 'auth/invalid-email':
                message = 'Invalid email address';
                break;
            case 'auth/user-not-found':
                message = 'User not found';
                break;
            case 'auth/wrong-password':
                message = 'Wrong password';
                break;
            case 'auth/too-many-requests':
                message = 'Too many login attempts. Please try again later';
                break;
            default:
                message = error.message;
        }

        UIHelpers.showNotification(message, 'error');
    },

    /**
     * Show main app
     */
    showMainApp() {
        UIHelpers.hide('auth-container');
        UIHelpers.show('main-app');
        
        // Set user avatar with initials
        const currentUser = StateManager.getValue('currentUser');
        if (currentUser) {
            const initials = (currentUser.displayName || currentUser.email)
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .substring(0, 2);
            
            const userAvatar = document.getElementById('user-avatar');
            if (userAvatar) {
                userAvatar.textContent = initials;
                userAvatar.style.display = 'flex';
                userAvatar.style.alignItems = 'center';
                userAvatar.style.justifyContent = 'center';
                userAvatar.style.fontSize = '0.8rem';
            }
        }
        
        // Initialize app modules
        if (window.DashboardModule) DashboardModule.init();
        if (window.CalendarModule) CalendarModule.init();
        if (window.TasksModule) TasksModule.init();
        if (window.NotesModule) NotesModule.init();
    },

    /**
     * Show auth screen
     */
    showAuthScreen() {
        UIHelpers.show('auth-container');
        UIHelpers.hide('main-app');
    }
};

window.AuthModule = AuthModule;
