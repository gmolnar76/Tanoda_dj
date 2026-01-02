// keyboard_shortcuts.js - ESM Keyboard Shortcuts Module
// Global keyboard shortcuts for the multiplication practice app

import { szorzasMessageHandler } from '../../szor_messages.js';

export function initKeyboardShortcuts(szorzasCore) {
    document.addEventListener('keydown', (event) => {
        // Ignore ALL keys if typing in input field (Enter is handled in szorzas_core.js)
        if (event.target.tagName === 'INPUT') {
            return; // Input mezőben minden billentyűt ignorálunk, mert ott a core kezeli
        }

        switch (event.key.toLowerCase()) {
            case 'r':
                // Reset game
                event.preventDefault();
                szorzasCore.resetGame();
                break;

            case 't':
                // Show tip
                event.preventDefault();
                szorzasCore.tippMegjelenitese();
                break;

            case 'c':
                // Start challenge mode
                event.preventDefault();
                if (!szorzasCore.state.kihivasMode) {
                    szorzasCore.inditKihivas();
                }
                break;

            case 'n':
                // New task (if result is showing)
                event.preventDefault();
                if (szorzasCore.state.eredmenyMegjelenitve) {
                    szorzasCore.ujFeladat();
                }
                break;

            case '?':
            case 'h':
                // Show keyboard shortcuts help
                event.preventDefault();
                showKeyboardShortcutsHelp();
                break;
        }
    });

    console.log('✅ Keyboard shortcuts initialized');
}

function showKeyboardShortcutsHelp() {
    szorzasMessageHandler.showInfo(`
        <h4 style="margin-top: 0; color: #4ecca3;">⌨️ Billentyűparancsok</h4>
        <ul style="text-align: left; list-style: none; padding: 0; margin: 0;">
            <li style="padding: 5px 0;"><strong>Enter</strong> - Válasz elküldése / Új feladat</li>
            <li style="padding: 5px 0;"><strong>R</strong> - Újraindítás</li>
            <li style="padding: 5px 0;"><strong>T</strong> - Tipp megjelenítése</li>
            <li style="padding: 5px 0;"><strong>C</strong> - Kihívás indítása</li>
            <li style="padding: 5px 0;"><strong>N</strong> - Új feladat (ha már van eredmény)</li>
            <li style="padding: 5px 0;"><strong>H / ?</strong> - Súgó megjelenítése</li>
        </ul>
    `, {
        header: '⌨️ Billentyűparancsok',
        clickToClose: true
    });
}
