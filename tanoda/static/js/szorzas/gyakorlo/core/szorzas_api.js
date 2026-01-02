// szorzas_api.js - ESM API Layer Module
// Handles all HTTP requests to the backend

export class SzorzasAPI {
    constructor() {
        this.baseURL = '/egesz_szamok';
    }

    /**
     * Fetch a new multiplication task
     * @returns {Promise<Object>} Task data
     */
    async fetchNewTask() {
        const response = await fetch(`${this.baseURL}/szorzas/`, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    /**
     * Check the answer for the current task
     * @param {Object} payload - Answer data
     * @returns {Promise<Object>} Result data
     */
    async checkAnswer(payload) {
        const response = await fetch(`${this.baseURL}/szorzas/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.getCookie('csrftoken'),
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                mod: 'gyakorlo',
                ...payload
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    /**
     * Reset the game statistics
     * @returns {Promise<Object>} Reset confirmation
     */
    async resetGame() {
        const response = await fetch(`${this.baseURL}/nullaz/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': this.getCookie('csrftoken'),
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    /**
     * Fetch the leaderboard data
     * @returns {Promise<Object>} Leaderboard data
     */
    async fetchLeaderboard() {
        const response = await fetch(`${this.baseURL}/leaderboard/`, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    /**
     * Get a cookie value by name (for CSRF token)
     * @param {string} name - Cookie name
     * @returns {string|null} Cookie value
     */
    getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
}
