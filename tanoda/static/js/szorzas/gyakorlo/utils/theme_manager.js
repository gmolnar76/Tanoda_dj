// theme_manager.js - ESM Theme Management Module
// Handles light/dark theme switching with localStorage persistence

import { szorzasMessageHandler } from '../../szor_messages.js';

const THEME_KEY = 'szorzas-gyakorlo-theme';

export class ThemeManager {
    constructor() {
        this.currentTheme = this.loadTheme();
        this.toggleBtn = document.querySelector('.theme-toggle');
        this.initTheme();
        this.attachEventListeners();
    }

    loadTheme() {
        const savedTheme = localStorage.getItem(THEME_KEY);
        return savedTheme || 'dark'; // Default to dark theme
    }

    saveTheme(theme) {
        localStorage.setItem(THEME_KEY, theme);
    }

    initTheme() {
        // Apply theme on page load
        document.body.classList.toggle('light-theme', this.currentTheme === 'light');
        this.updateIcon();
    }

    toggleTheme() {
        // Toggle between light and dark
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';

        // Apply theme to body
        document.body.classList.toggle('light-theme', this.currentTheme === 'light');

        // Save to localStorage
        this.saveTheme(this.currentTheme);

        // Update icon
        this.updateIcon();

        // Show notification
        this.showNotification();

        console.log(`✅ Theme switched to: ${this.currentTheme}`);
    }

    updateIcon() {
        if (!this.toggleBtn) return;

        const themeName = this.currentTheme === 'light' ? 'Váltás sötét témára' : 'Váltás világos témára';

        // Update button icon
        this.toggleBtn.innerHTML = this.currentTheme === 'light'
            ? '<i class="fas fa-moon"></i>'
            : '<i class="fas fa-sun"></i>';

        this.toggleBtn.title = themeName;
    }

    showNotification() {
        const themeName = this.currentTheme === 'light' ? 'Világos' : 'Sötét';

        if (typeof szorzasMessageHandler !== 'undefined') {
            szorzasMessageHandler.showInfo(
                `${themeName} téma aktiválva!`,
                {
                    header: '🎨 Téma váltás',
                    duration: 2000
                }
            );
        }
    }

    attachEventListeners() {
        if (this.toggleBtn) {
            // Remove any existing onclick attribute (if present)
            this.toggleBtn.removeAttribute('onclick');

            // Add event listener
            this.toggleBtn.addEventListener('click', () => this.toggleTheme());

            console.log('✅ Theme toggle event listener attached');
        } else {
            console.warn('⚠️ Theme toggle button not found');
        }
    }
}

// Export initialization function
export function initThemeManager() {
    const manager = new ThemeManager();
    window.themeManager = manager; // Global access
    return manager;
}
