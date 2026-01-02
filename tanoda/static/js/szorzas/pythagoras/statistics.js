class Statistics {
    constructor() {
        this.stats = {
            totalPoints: 0,
            correctAnswers: 0,
            totalAttempts: 0,
            streak: 0,
            level: 1
        };
        this.initElements();
    }

    initElements() {
        this.pointsElement = document.getElementById('pontszam');
        this.levelElement = document.getElementById('szint');
    }

    calculatePoints(isCorrect, responseTime) {
        if (!isCorrect) return 0;

        let points = 10; // Alap pontszám
        
        // Idő bónusz (max 10 másodperc)
        points += Math.max(0, 10 - responseTime) * 2;
        
        // Szint bónusz
        points += this.stats.level * 5;
        
        // Streak bónusz
        if (this.stats.streak > 2) {
            points += this.stats.streak * 2;
        }

        return Math.round(points);
    }

    updateStats(isCorrect, points) {
        if (isCorrect) {
            this.stats.streak++;
            this.stats.correctAnswers++;
        } else {
            this.stats.streak = 0;
        }

        this.stats.totalPoints += points;
        this.stats.totalAttempts++;

        this.updateDisplay();
        this.checkLevelProgression();
    }

    updateDisplay() {
        this.pointsElement.textContent = this.stats.totalPoints;
        this.levelElement.textContent = this.stats.level;
    }

    checkLevelProgression() {
        const accuracy = this.stats.correctAnswers / this.stats.totalAttempts;
        if (accuracy > 0.8 && this.stats.streak >= 5 && this.stats.level < 3) {
            this.stats.level++;
            this.updateDisplay();
        }
    }

    async saveStats() {
        try {
            await fetch('/egesz_szamok/szorzas/statisztika/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                },
                body: JSON.stringify(this.stats)
            });
        } catch (error) {
            console.error('Statisztika mentési hiba:', error);
        }
    }
}

export const statistics = new Statistics();