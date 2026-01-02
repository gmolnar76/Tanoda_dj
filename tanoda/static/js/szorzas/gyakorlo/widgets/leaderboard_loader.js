// leaderboard_loader.js - ESM Leaderboard Widget Loader Module
// Handles leaderboard data fetching and rendering

import { SzorzasAPI } from '../core/szorzas_api.js';

export class LeaderboardLoader {
    constructor() {
        this.api = new SzorzasAPI();
        this.refreshInterval = 30000; // 30 seconds
        this.intervalId = null;
        this.elements = {
            leaderboard: document.getElementById('leaderboard'),
            emptyState: document.getElementById('leaderboard-empty'),
            userPosition: document.getElementById('user-position'),
            userRankBadge: document.getElementById('user-rank-badge'),
            userScore: document.getElementById('user-score')
        };
    }

    async load() {
        try {
            const data = await this.api.fetchLeaderboard();
            this.render(data);
        } catch (error) {
            console.error('Hiba a leaderboard betöltésekor:', error);
            this.renderError();
        }
    }

    render(data) {
        if (!this.elements.leaderboard) return;

        // Check if leaderboard data exists
        if (!data.leaderboard || data.leaderboard.length === 0) {
            if (this.elements.emptyState) {
                this.elements.emptyState.style.display = 'block';
            }
            return;
        }

        // Hide empty state
        if (this.elements.emptyState) {
            this.elements.emptyState.style.display = 'none';
        }

        // Clear existing leaderboard
        this.elements.leaderboard.innerHTML = '';

        // Render leaderboard items
        data.leaderboard.forEach((user, index) => {
            const rank = index + 1;
            const listItem = document.createElement('li');
            listItem.className = 'leaderboard-item';

            // Rank badge with medal colors
            let rankClass = 'default';
            if (rank === 1) rankClass = 'gold';
            else if (rank === 2) rankClass = 'silver';
            else if (rank === 3) rankClass = 'bronze';

            listItem.innerHTML = `
                <div class="leaderboard-rank ${rankClass}">${rank}</div>
                <div class="leaderboard-user">
                    <span class="leaderboard-name">${this.escapeHtml(user.username)}</span>
                </div>
                <span class="leaderboard-score">${user.total_points} pont</span>
            `;

            this.elements.leaderboard.appendChild(listItem);
        });

        // Check if current user is in top 5 (if user is authenticated)
        this.renderUserPosition(data);
    }

    renderUserPosition(data) {
        // This part relies on Django template to inject user email
        // We check if user is in top 5, if not, show their position separately
        if (this.elements.userPosition && data.user_rank) {
            const userInTop5 = data.leaderboard.some(u => u.is_current_user);

            if (!userInTop5) {
                this.elements.userPosition.style.display = 'block';

                if (this.elements.userRankBadge) {
                    this.elements.userRankBadge.textContent = data.user_rank;
                }

                if (this.elements.userScore && data.user_points !== undefined) {
                    this.elements.userScore.textContent = `${data.user_points} pont`;
                }
            } else {
                this.elements.userPosition.style.display = 'none';
            }
        }
    }

    renderError() {
        if (this.elements.emptyState) {
            this.elements.emptyState.style.display = 'block';
            const emptyText = this.elements.emptyState.querySelector('p');
            if (emptyText) {
                emptyText.textContent = 'Nem sikerült betölteni a ranglistát.';
            }
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    startAutoRefresh() {
        // Initial load
        this.load();

        // Auto-refresh every 30 seconds
        this.intervalId = setInterval(() => {
            this.load();
        }, this.refreshInterval);

        console.log('✅ Leaderboard auto-refresh started (30s interval)');
    }

    stopAutoRefresh() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('⛔ Leaderboard auto-refresh stopped');
        }
    }
}

// Export initialization function
export function initLeaderboard() {
    const loader = new LeaderboardLoader();
    loader.startAutoRefresh();
    window.leaderboardLoader = loader; // Global access
    return loader;
}
