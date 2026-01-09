# ChronoTrack - Personal Time & Productivity Tracker

A Firebase-powered web application for managing time, tasks, goals, habits, and personal productivity.

## Project Structure

```
ChronoTrack/
├── css/
│   ├── variables.css      # CSS custom properties and theme colors
│   ├── base.css          # Base styles and typography
│   ├── layout.css        # Layout and grid systems
│   ├── components.css    # Component-specific styles
│   ├── themes.css        # Light/dark theme definitions
│   └── responsive.css    # Mobile and responsive design
├── js/
│   ├── firebase-config.js # Firebase initialization and config
│   ├── app.js            # Main application entry point
│   ├── modules/
│   │   ├── auth.js       # Authentication module
│   │   ├── dashboard.js  # Dashboard module
│   │   ├── calendar.js   # Calendar module
│   │   ├── tasks.js      # Tasks module
│   │   ├── goals.js      # Goals module
│   │   ├── habits.js     # Habits module
│   │   ├── notes.js      # Notes module
│   │   ├── expenses.js   # Expenses, time tracking, analytics
│   │   ├── time-tracking.js
│   │   └── analytics.js
│   └── utils/
│       ├── date-utils.js      # Date and time utilities
│       ├── state-manager.js   # Global state management
│       └── ui-helpers.js      # UI utility functions
├── assets/
│   ├── icons/   # Application icons
│   └── images/  # Images and graphics
├── pages/       # Additional page templates (optional)
├── index.html   # Main entry point
└── README.md    # This file
```

## Features

### Core Features
- **Dashboard**: Quick overview of tasks, events, habits, and goals
- **Calendar**: Monthly calendar view with event management
- **Tasks**: Task creation, organization, priority levels, and status tracking
- **Goals**: Short-term and long-term goal tracking with milestones
- **Habits**: Daily habit tracking with streak counters
- **Notes & Journal**: Rich text notes with tags and linking
- **Expense Tracking**: Track and categorize expenses
- **Time Logging**: Log and categorize time spent on activities
- **Analytics**: Visual insights into productivity patterns

### User Features
- **Authentication**: Secure Firebase authentication
- **User Profiles**: Customizable display names and avatars
- **Preferences**: Timezone, language, theme, and notification settings
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on desktop, tablet, and mobile

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Firebase (Authentication, Firestore Database)
- **State Management**: Custom StateManager
- **Utilities**: DateUtils for date operations, UIHelpers for UI functions

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Firebase account and project

### Setup Instructions

1. **Clone or download the project**
   ```bash
   # If using git
   git clone <repository-url>
   cd ChronoTrack
   ```

2. **Create a Firebase project**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project
   - Enable Firestore Database
   - Enable Authentication (Email/Password)

3. **Configure Firebase credentials**
   - In the Firebase Console, go to Project Settings
   - Copy your Firebase config
   - Update `js/firebase-config.js` with your credentials:
   ```javascript
   const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_AUTH_DOMAIN",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_STORAGE_BUCKET",
       messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
       appId: "YOUR_APP_ID"
   };
   ```

4. **Set up Firestore Rules**
   - Copy the rules from `js/firebase-config.js` comments
   - Paste them in Firestore Rules section
   - Publish the rules

5. **Open the application**
   - Open `index.html` in a web browser
   - Or use a local server: `python -m http.server 8000`
   - Navigate to `http://localhost:8000`

## Usage

### Creating an Account
1. Click "Sign Up" on the login page
2. Enter your name, email, password, and timezone
3. Click "Create Account"

### Adding Tasks
1. Navigate to Tasks section
2. Click "+ New Task"
3. Fill in task details and click save

### Tracking Habits
1. Go to Habits section
2. Create a habit with frequency
3. Mark daily completions to build streaks

### Setting Goals
1. Navigate to Goals
2. Create short-term or long-term goals
3. Add milestones and track progress

### Managing Notes
1. Go to Notes section
2. Create new notes or journal entries
3. Use tags for organization

## Firebase Data Structure

### Users Collection
```javascript
{
    userId: "unique-user-id",
    displayName: "User Name",
    email: "user@example.com",
    timezone: "UTC",
    theme: "light",
    preferences: { ... }
}
```

### Events, Tasks, Goals, Habits, Notes
Each collection stores user-specific data with proper security rules.

## Customization

### Changing Colors
Edit `css/variables.css` to modify:
- Primary color
- Secondary color
- Accent colors
- Category colors
- Status colors

### Adding New Pages
1. Add HTML structure to `index.html`
2. Create corresponding module in `js/modules/`
3. Add CSS styles to appropriate stylesheet
4. Initialize module in `app.js`

### Theme Customization
- Light/Dark themes defined in `css/themes.css`
- Add new custom themes by extending theme variables

## Development

### Module Architecture
Each feature has its own module:
- **Initialization**: `module.init()` sets up the page
- **Rendering**: `module.render()` displays content
- **Event Handling**: `module.bindEvents()` sets up listeners
- **State Management**: Uses global `StateManager`

### Adding Features
1. Create module in `js/modules/`
2. Follow module pattern (init, render, bind events)
3. Use `StateManager` for state
4. Use `UIHelpers` for UI operations
5. Use `DateUtils` for date operations

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Tips

- Lazy load data for large collections
- Use debouncing for search
- Cache user preferences in localStorage
- Optimize Firestore queries with indexes

## Security

- All user data is private to their account
- Firebase authentication handles password security
- Firestore rules enforce user-level access control
- No sensitive data stored in localStorage

## Future Enhancements

- Mobile app (React Native/Flutter)
- Collaborative features and shared calendars
- AI-powered scheduling suggestions
- Integration with external calendars
- Advanced analytics and reports
- Voice commands and natural language processing
- Offline mode with sync

## Support & Contribution

For issues, feature requests, or contributions, please refer to the project repository.

## License

This project is provided as-is for personal use.

---

**ChronoTrack**: Your Personal Operating System for Time Management
