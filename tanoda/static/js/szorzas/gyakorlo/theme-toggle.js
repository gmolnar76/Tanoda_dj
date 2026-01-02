// Theme management for szorzas gyakorlo
const THEME_KEY = 'szorzas-gyakorlo-theme';

// Initialize theme on page load
function initThemeToggle() {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';

    // Apply theme to body
    document.body.classList.toggle('light-theme', savedTheme === 'light');

    // Update toggle button icon
    updateThemeIcon(savedTheme);
}

// Toggle between dark and light themes
function toggleTheme() {
    const currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    // Apply new theme
    document.body.classList.toggle('light-theme', newTheme === 'light');

    // Save to localStorage for persistence
    localStorage.setItem(THEME_KEY, newTheme);

    // Update toggle button icon
    updateThemeIcon(newTheme);

    // Show notification if message handler is available
    if (typeof szorzasMessageHandler !== 'undefined') {
        const themeName = newTheme === 'light' ? 'Világos' : 'Sötét';
        szorzasMessageHandler.showInfo(
            `${themeName} téma aktiválva!`,
            { header: '🎨 Téma váltás' }
        );
    }
}

// Update theme toggle button icon
function updateThemeIcon(theme) {
    const toggleBtn = document.querySelector('.theme-toggle');
    if (toggleBtn) {
        toggleBtn.innerHTML = theme === 'light'
            ? '<i class="fas fa-moon"></i>'
            : '<i class="fas fa-sun"></i>';

        toggleBtn.title = theme === 'light'
            ? 'Váltás sötét témára'
            : 'Váltás világos témára';
    }
}

// Initialize theme when DOM is ready
document.addEventListener('DOMContentLoaded', initThemeToggle);
