/**
 * Real-time pontozási rendszer
 * Auto-frissítés és gamification értesítések
 */

class RealTimeScoring {
    constructor() {
        this.isPolling = false;
        this.pollInterval = null;
        this.lastUpdate = null;
    }

    /**
     * Inicializálja a real-time scoring rendszert
     */
    init() {
        // Kezdeti betöltés
        this.updateNavbarPoints();

        // Eseményfigyelők beállítása
        this.setupEventListeners();

        // Auto-polling indítása (opcionális)
        // this.startPolling(30000); // 30 másodpercenként
    }

    /**
     * Frissíti a navbar pontszámot
     */
    async updateNavbarPoints() {
        try {
            const response = await fetch('/pont/api/aktualis/');
            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();

            // Navbar pontszám frissítése
            const pontszamElement = document.getElementById('navbar-osszes-pont');
            if (pontszamElement) {
                const currentPoints = parseInt(pontszamElement.textContent) || 0;
                const newPoints = data.osszes_pont;

                // Animált frissítés, ha változott
                if (currentPoints !== newPoints) {
                    this.animatePointsUpdate(pontszamElement, currentPoints, newPoints);
                }
            }

            // Szint információ frissítése (ha van ilyen elem)
            this.updateLevelInfo(data.szint);

            // Streak információ frissítése (ha van)
            this.updateStreakInfo(data.streak);

            this.lastUpdate = Date.now();
        } catch (error) {
            console.error('Hiba a pontszám frissítésekor:', error);
        }
    }

    /**
     * Animált pontszám frissítés
     */
    animatePointsUpdate(element, from, to) {
        const duration = 500; // ms
        const start = Date.now();
        const diff = to - from;

        const animate = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);

            const current = Math.floor(from + diff * this.easeOutQuad(progress));
            element.textContent = current;

            // Highlight effekt
            element.parentElement.classList.add('points-updated');
            setTimeout(() => {
                element.parentElement.classList.remove('points-updated');
            }, 300);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    /**
     * Easing függvény
     */
    easeOutQuad(t) {
        return t * (2 - t);
    }

    /**
     * Szint információ frissítése
     */
    updateLevelInfo(szintData) {
        if (!szintData) return;

        const levelElement = document.getElementById('user-level');
        if (levelElement) {
            levelElement.textContent = szintData.jelenlegi;
        }

        const rangElement = document.getElementById('user-rang');
        if (rangElement) {
            rangElement.textContent = szintData.rang;
        }

        const xpProgressElement = document.getElementById('xp-progress');
        if (xpProgressElement) {
            xpProgressElement.style.width = `${szintData.progress_percent}%`;
        }
    }

    /**
     * Streak információ frissítése
     */
    updateStreakInfo(streakData) {
        if (!streakData) return;

        const streakElement = document.getElementById('user-streak');
        if (streakElement) {
            streakElement.textContent = streakData.aktualis;
        }
    }

    /**
     * Gamification értesítés megjelenítése
     */
    showNotification(type, data) {
        const container = document.getElementById('gamification-notifications');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `gamification-notification ${type}`;

        let content = '';

        switch (type) {
            case 'level-up':
                content = `
                    <div class="notification-icon">🎉</div>
                    <div class="notification-content">
                        <h4>Szint növekedés!</h4>
                        <p>Elérted a ${data.szint}. szintet (${data.rang})</p>
                    </div>
                `;
                break;

            case 'badge':
                content = `
                    <div class="notification-icon">${data.ikon}</div>
                    <div class="notification-content">
                        <h4>Új kitűző!</h4>
                        <p>${data.nev}: ${data.leiras}</p>
                    </div>
                `;
                break;

            case 'streak':
                content = `
                    <div class="notification-icon">🔥</div>
                    <div class="notification-content">
                        <h4>Új rekord!</h4>
                        <p>${data.napok} napos sorozat!</p>
                    </div>
                `;
                break;
        }

        notification.innerHTML = content;
        container.appendChild(notification);

        // Animáció
        setTimeout(() => notification.classList.add('show'), 10);

        // Auto-eltüntetés 5 másodperc után
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    /**
     * Eseményfigyelők beállítása
     */
    setupEventListeners() {
        // Custom event-ek figyelése
        document.addEventListener('points-earned', (e) => {
            const { scoring_result } = e.detail;

            // Pontszám frissítése
            this.updateNavbarPoints();

            // Szint növekedés ellenőrzése
            if (scoring_result.szint && scoring_result.szint.szint_novekedett) {
                this.showNotification('level-up', {
                    szint: scoring_result.szint.jelenlegi,
                    rang: scoring_result.szint.rang
                });
            }

            // Új badge-ek ellenőrzése
            if (scoring_result.uj_badges && scoring_result.uj_badges.length > 0) {
                scoring_result.uj_badges.forEach(badge => {
                    this.showNotification('badge', badge);
                });
            }

            // Streak rekord ellenőrzése
            if (scoring_result.streak && scoring_result.streak.uj_rekord) {
                this.showNotification('streak', {
                    napok: scoring_result.streak.aktualis
                });
            }
        });

        // Visibility change - frissítés amikor a felhasználó visszatér
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.updateNavbarPoints();
            }
        });
    }

    /**
     * Polling indítása
     */
    startPolling(interval = 30000) {
        if (this.isPolling) return;

        this.isPolling = true;
        this.pollInterval = setInterval(() => {
            this.updateNavbarPoints();
        }, interval);
    }

    /**
     * Polling leállítása
     */
    stopPolling() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
        this.isPolling = false;
    }
}

// Globális példány létrehozása
const realTimeScoring = new RealTimeScoring();

// Auto-inicializálás amikor a DOM betöltődött
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => realTimeScoring.init());
} else {
    realTimeScoring.init();
}

// Exportálás globális használatra
window.realTimeScoring = realTimeScoring;
