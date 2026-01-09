# ChronoTrack Setup Guide

## Quick Start

### Step 1: Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (e.g., "ChronoTrack")
3. Register a web app in the project settings
4. Copy your Firebase config credentials

### Step 2: Update Firebase Config

Open `js/firebase-config.js` and replace the placeholder values:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### Step 3: Set Up Firestore Rules

1. In Firebase Console, go to Firestore Database → Rules
2. Replace the rules with the Firestore Rules from `js/firebase-config.js` comments
3. Click Publish

### Step 4: Enable Authentication

1. In Firebase Console, go to Authentication
2. Enable "Email/Password" sign-in method
3. Optional: Enable additional providers (Google, GitHub, etc.)

### Step 5: Run the Application

#### Option A: Using a Local Server (Recommended)

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js
npx http-server
```

Then open: `http://localhost:8000`

#### Option B: Direct File Access

Simply double-click `index.html` to open in browser (works for local development, but may have CORS issues).

#### Option C: Deploy to Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## First-Time Usage

### Creating an Account
1. Open the app in your browser
2. Click "Sign Up"
3. Fill in your details:
   - Display Name
   - Email
   - Password (min 6 characters)
   - Timezone
4. Click "Create Account"
5. You'll be logged in automatically

### Exploring Features

**Dashboard**
- See overview of today's tasks, events, habits, and goals
- Toggle habit completion with "Mark Done" buttons

**Calendar**
- View monthly calendar with events
- Click on dates to see event details
- Create new events (feature coming soon)

**Tasks**
- Create tasks with title, description, due date, and priority
- Switch between List and Kanban board views
- Mark tasks as completed or delete them

**Goals**
- Set short-term and long-term goals
- Track milestones and progress
- Monitor time remaining

**Habits**
- Create daily, weekly, or custom habits
- Build streaks by marking daily completions
- Track success rate and longest streak

**Notes**
- Create and organize notes
- Use tags for categorization
- Auto-saves every 30 seconds
- Link notes to events or tasks

**Expenses**
- Log expenses with categories
- View spending breakdown
- Track expenses by month

**Analytics**
- View productivity metrics
- Track task completion rates
- Monitor habit consistency
- Analyze time usage patterns

## Features Overview

### Core Functionality
- ✅ User authentication with Firebase
- ✅ Task management with priorities
- ✅ Goal tracking with milestones
- ✅ Habit tracking with streaks
- ✅ Calendar view
- ✅ Notes and journaling
- ✅ Expense tracking
- ✅ Light/Dark theme toggle
- ✅ Responsive design (desktop, tablet, mobile)

### Coming Soon
- 📝 Advanced event creation modal
- 📊 Analytics visualizations
- 🔔 Notifications and reminders
- 📱 Mobile app
- 👥 Shared calendars and collaboration
- 🤖 AI-powered scheduling

## Customization

### Change Primary Color

Edit `css/variables.css`:

```css
:root {
    --primary-color: #6366f1;  /* Change this */
    /* ... */
}
```

### Add Custom Categories

Edit `css/themes.css` to add new expense/event categories:

```css
.category-custom {
    background-color: rgba(0, 0, 0, 0.1);
    color: #000000;
}
```

### Modify Sidebar Navigation

Edit `index.html` in the sidebar section to add/remove menu items.

## Troubleshooting

### Firebase Connection Issues
- Check that credentials in `js/firebase-config.js` are correct
- Verify Firebase project is active
- Check browser console for error messages

### Can't Sign In
- Verify email and password are correct
- Check that Email/Password auth is enabled in Firebase
- Clear browser cache and cookies

### Data Not Saving
- Open browser DevTools (F12)
- Check Console and Network tabs for errors
- Verify Firestore Rules allow your user access
- Check user quota in Firebase Console

### Styling Issues
- Clear browser cache (Ctrl+Shift+Delete)
- Check that all CSS files are linked in `index.html`
- Verify CSS file paths are correct

### Mobile Display Issues
- Open DevTools and toggle device toolbar
- Check responsive CSS media queries in `css/responsive.css`
- Adjust viewport meta tag if needed

## Browser DevTools Tips

### Check Application State
Open browser console and type:
```javascript
StateManager.getState()
```

### Access Firebase Database
```javascript
StateManager.getCollection('tasks')
```

### Test Date Utilities
```javascript
DateUtils.formatDate(new Date(), 'MMM DD, YYYY')
```

## Performance Optimization

### For Better Performance
1. Minimize Firestore reads/writes
2. Use pagination for large collections
3. Cache user preferences
4. Lazy load modules when needed
5. Use debouncing for search

### Monitor Usage
- Check Firebase Console for database usage
- Monitor authentication usage
- Review Firestore indexes for query optimization

## Security Best Practices

1. ✅ Keep Firebase credentials in config
2. ✅ Never commit real credentials to version control
3. ✅ Use environment variables for production
4. ✅ Enable Firestore Rules for data protection
5. ✅ Regularly update dependencies

## Next Steps

1. **Add Sample Data**: Create a few tasks, habits, and goals to explore
2. **Customize Colors**: Change theme colors in `css/variables.css`
3. **Enable Notifications**: (Coming soon)
4. **Set Up Backup**: Enable automatic backups in Firebase
5. **Share Calendars**: (Collaboration feature coming soon)

## Support

For issues or questions:
1. Check browser console (F12) for error messages
2. Review Firebase Console for database/auth errors
3. Check this README for common solutions
4. Review code comments in relevant modules

## Project Structure Reference

```
ChronoTrack/
├── index.html          # Main entry point
├── README.md           # Project documentation
├── SETUP.md            # This file
├── css/               # All stylesheets
├── js/                # All JavaScript code
├── assets/            # Images and icons
└── pages/             # Additional pages (optional)
```

---

**Ready to get productive with ChronoTrack!** 🚀
