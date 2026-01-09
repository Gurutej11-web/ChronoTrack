/**
 * State Manager
 * Global state management for the application
 */

class StateManagerClass {
    constructor() {
        this.state = {
            currentUser: null,
            isAuthenticated: false,
            currentPage: 'dashboard',
            dashboardWidgets: [],
            events: [],
            tasks: [],
            goals: [],
            habits: [],
            notes: [],
            expenses: [],
            timeLogs: [],
            selectedDate: new Date(),
            theme: localStorage.getItem('theme') || 'light',
            sidebarOpen: true,
            filters: {
                taskStatus: 'all',
                taskPriority: 'all',
                taskCategory: 'all',
                eventCategory: 'all',
                habitStatus: 'all'
            },
            searchQuery: ''
        };

        this.listeners = [];
    }

    /**
     * Get current state
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Get specific state value
     */
    getValue(key) {
        const keys = key.split('.');
        let value = this.state;
        
        for (let k of keys) {
            value = value[k];
            if (value === undefined) return null;
        }
        
        return value;
    }

    /**
     * Set state value
     */
    setState(key, value) {
        const keys = key.split('.');
        const lastKey = keys.pop();
        let obj = this.state;

        for (let k of keys) {
            if (!obj[k]) obj[k] = {};
            obj = obj[k];
        }

        obj[lastKey] = value;
        this.notifyListeners();
    }

    /**
     * Update multiple values
     */
    updateState(updates) {
        Object.keys(updates).forEach(key => {
            this.setState(key, updates[key]);
        });
    }

    /**
     * Add listener for state changes
     */
    subscribe(listener) {
        this.listeners.push(listener);
        
        // Return unsubscribe function
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    /**
     * Notify all listeners
     */
    notifyListeners() {
        this.listeners.forEach(listener => listener(this.state));
    }

    /**
     * Clear specific collection
     */
    clearCollection(name) {
        this.setState(name, []);
    }

    /**
     * Clear all data
     */
    clearAll() {
        this.state = {
            currentUser: null,
            isAuthenticated: false,
            currentPage: 'dashboard',
            dashboardWidgets: [],
            events: [],
            tasks: [],
            goals: [],
            habits: [],
            notes: [],
            expenses: [],
            timeLogs: [],
            selectedDate: new Date(),
            theme: 'light',
            sidebarOpen: true,
            filters: {
                taskStatus: 'all',
                taskPriority: 'all',
                taskCategory: 'all',
                eventCategory: 'all',
                habitStatus: 'all'
            },
            searchQuery: ''
        };
        this.notifyListeners();
    }

    /**
     * Reset filters
     */
    resetFilters() {
        this.setState('filters', {
            taskStatus: 'all',
            taskPriority: 'all',
            taskCategory: 'all',
            eventCategory: 'all',
            habitStatus: 'all'
        });
    }

    /**
     * Add item to collection
     */
    addToCollection(collectionName, item) {
        const collection = this.state[collectionName] || [];
        collection.push(item);
        this.setState(collectionName, collection);
    }

    /**
     * Update item in collection
     */
    updateInCollection(collectionName, itemId, updates) {
        const collection = this.state[collectionName] || [];
        const index = collection.findIndex(item => item.id === itemId || item[Object.keys(item)[0]] === itemId);
        
        if (index !== -1) {
            collection[index] = { ...collection[index], ...updates };
            this.setState(collectionName, [...collection]);
        }
    }

    /**
     * Remove item from collection
     */
    removeFromCollection(collectionName, itemId) {
        const collection = this.state[collectionName] || [];
        const filtered = collection.filter(item => item.id !== itemId && item[Object.keys(item)[0]] !== itemId);
        this.setState(collectionName, filtered);
    }

    /**
     * Get collection
     */
    getCollection(collectionName) {
        return this.state[collectionName] || [];
    }

    /**
     * Get item from collection
     */
    getFromCollection(collectionName, itemId) {
        const collection = this.state[collectionName] || [];
        return collection.find(item => item.id === itemId || item[Object.keys(item)[0]] === itemId);
    }

    /**
     * Get filtered collection
     */
    getFilteredCollection(collectionName, filterFn) {
        const collection = this.state[collectionName] || [];
        return collection.filter(filterFn);
    }

    /**
     * Save theme preference
     */
    setTheme(theme) {
        this.setState('theme', theme);
        localStorage.setItem('theme', theme);
    }

    /**
     * Get theme
     */
    getTheme() {
        return this.state.theme;
    }
}

// Create singleton instance
const StateManager = new StateManagerClass();
window.StateManager = StateManager;
