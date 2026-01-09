/**
 * Date Utilities
 * Helper functions for date and time operations
 */

const DateUtils = {
    /**
     * Format date to readable string
     */
    formatDate(date, format = 'MMM DD, YYYY') {
        if (!date) return '';
        date = new Date(date);
        
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        const year = date.getFullYear();
        const month = months[date.getMonth()];
        const monthNum = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dayName = days[date.getDay()];
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return format
            .replace('YYYY', year)
            .replace('MM', monthNum)
            .replace('MMM', month)
            .replace('DD', day)
            .replace('D', date.getDate())
            .replace('ddd', dayName)
            .replace('HH', hours)
            .replace('mm', minutes);
    },

    /**
     * Get start of day
     */
    getStartOfDay(date = new Date()) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
    },

    /**
     * Get end of day
     */
    getEndOfDay(date = new Date()) {
        const d = new Date(date);
        d.setHours(23, 59, 59, 999);
        return d;
    },

    /**
     * Get start of week
     */
    getStartOfWeek(date = new Date(), startDay = 0) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
        return d;
    },

    /**
     * Get end of week
     */
    getEndOfWeek(date = new Date()) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + 7;
        d.setDate(diff);
        d.setHours(23, 59, 59, 999);
        return d;
    },

    /**
     * Get start of month
     */
    getStartOfMonth(date = new Date()) {
        const d = new Date(date);
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
        return d;
    },

    /**
     * Get end of month
     */
    getEndOfMonth(date = new Date()) {
        const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        d.setHours(23, 59, 59, 999);
        return d;
    },

    /**
     * Add days to date
     */
    addDays(date, days) {
        const d = new Date(date);
        d.setDate(d.getDate() + days);
        return d;
    },

    /**
     * Add months to date
     */
    addMonths(date, months) {
        const d = new Date(date);
        d.setMonth(d.getMonth() + months);
        return d;
    },

    /**
     * Get difference in days
     */
    daysBetween(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2 - d1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    },

    /**
     * Check if date is today
     */
    isToday(date) {
        const today = new Date();
        const d = new Date(date);
        return d.getDate() === today.getDate() &&
               d.getMonth() === today.getMonth() &&
               d.getFullYear() === today.getFullYear();
    },

    /**
     * Check if date is in the past
     */
    isPast(date) {
        return new Date(date) < new Date();
    },

    /**
     * Check if date is in the future
     */
    isFuture(date) {
        return new Date(date) > new Date();
    },

    /**
     * Check if date is within this week
     */
    isThisWeek(date) {
        const d = new Date(date);
        const now = new Date();
        const weekStart = this.getStartOfWeek(now);
        const weekEnd = this.getEndOfWeek(now);
        return d >= weekStart && d <= weekEnd;
    },

    /**
     * Check if date is within this month
     */
    isThisMonth(date) {
        const d = new Date(date);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    },

    /**
     * Get days in month
     */
    getDaysInMonth(date) {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    },

    /**
     * Get first day of month (0-6)
     */
    getFirstDayOfMonth(date) {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    },

    /**
     * Format time duration
     */
    formatDuration(minutes) {
        if (minutes < 60) {
            return `${minutes}m`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (mins === 0) {
            return `${hours}h`;
        }
        return `${hours}h ${mins}m`;
    },

    /**
     * Get relative time string
     */
    getRelativeTime(date) {
        const now = new Date();
        const d = new Date(date);
        const diffMs = now - d;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return this.formatDate(date, 'MMM DD');
    },

    /**
     * Parse ISO date string
     */
    parseISODate(dateString) {
        return new Date(dateString);
    },

    /**
     * Convert to ISO date string
     */
    toISODate(date) {
        return new Date(date).toISOString();
    },

    /**
     * Get week number of year
     */
    getWeekNumber(date = new Date()) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    },

    /**
     * Get all dates in range
     */
    getDateRange(startDate, endDate) {
        const dates = [];
        let current = new Date(startDate);
        
        while (current <= endDate) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
        
        return dates;
    },

    /**
     * Check if it's a weekend
     */
    isWeekend(date = new Date()) {
        const day = new Date(date).getDay();
        return day === 0 || day === 6;
    },

    /**
     * Get next occurrence of day
     */
    getNextOccurrenceOfDay(targetDay) {
        const date = new Date();
        const currentDay = date.getDay();
        let daysAhead = targetDay - currentDay;
        
        if (daysAhead <= 0) {
            daysAhead += 7;
        }
        
        date.setDate(date.getDate() + daysAhead);
        return date;
    }
};

window.DateUtils = DateUtils;
