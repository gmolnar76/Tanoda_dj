// main.js - ESM Entry Point for Multiplication Practice Application
// Initializes all modules and coordinates their interaction

import { initSzorzasCore } from './core/szorzas_core.js';
import { initLeaderboard } from './widgets/leaderboard_loader.js';
import { initThemeManager } from './utils/theme_manager.js';
import { initKeyboardShortcuts } from './utils/keyboard_shortcuts.js';

// Initialize application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing Szorzás Gyakorló Application...');

    // 1. Initialize Theme Manager (first, to apply theme immediately)
    const themeManager = initThemeManager();

    // 2. Initialize Core Logic (main application logic)
    const szorzasCore = initSzorzasCore();

    // 3. Initialize Leaderboard Loader (with auto-refresh)
    const leaderboardLoader = initLeaderboard();

    // 4. Initialize Keyboard Shortcuts
    initKeyboardShortcuts(szorzasCore);

    // 5. Initialize Pythagorean Table (legacy global function, if available)
    if (typeof buildPitagoraszTable === 'function') {
        buildPitagoraszTable(10);
        console.log('✅ Pythagorean table initialized (legacy function)');
    } else {
        console.warn('⚠️ buildPitagoraszTable function not found (legacy script may not be loaded)');
    }

    // 6. Apply dark background to input (if exists)
    const valaszInput = document.getElementById('valasz');
    if (valaszInput) {
        valaszInput.style.backgroundColor = '#333'; // Dark gray background
        valaszInput.style.color = '#fff'; // White text
    }

    console.log('✅ Szorzás Gyakorló Application initialized successfully!');
    console.log('📊 Loaded modules:', {
        themeManager,
        szorzasCore,
        leaderboardLoader
    });
});
