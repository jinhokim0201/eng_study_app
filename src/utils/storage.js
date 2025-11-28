// Utility for safe local storage access
// Handles QuotaExceededError and other storage issues gracefully

const memoryStorage = new Map();

export const safeLocalStorage = {
    getItem: (key) => {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            console.warn(`Error reading from localStorage key "${key}":`, error);
            return memoryStorage.get(key) || null;
        }
    },

    setItem: (key, value) => {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            console.warn(`Error writing to localStorage key "${key}":`, error);
            // Fallback to memory storage so the app doesn't crash
            memoryStorage.set(key, value);

            // If it's a quota error, we might want to alert the user or just silently fail for now
            // The ErrorBoundary caught this before, now we catch it here.
        }
    },

    removeItem: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.warn(`Error removing from localStorage key "${key}":`, error);
            memoryStorage.delete(key);
        }
    }
};
