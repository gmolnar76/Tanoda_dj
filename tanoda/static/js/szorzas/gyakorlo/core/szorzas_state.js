// szorzas_state.js - ESM State Management Module
// Manages the state of the multiplication practice application

export class SzorzasState {
    constructor() {
        this.reset();
        this.loadGameMode(); // Load saved game mode
    }

    reset() {
        // Task state
        this.szorzo = 0;
        this.szorzando = 0;
        this.nehezsegSzint = 1;

        // Timing
        this.kezdoIdo = null;

        // Statistics
        this.osszPontszam = 0;
        this.helyesValaszokSzama = 0;
        this.osszesFeladat = 0;
        this.teljesitmenyAdatok = [];

        // Challenge mode (timed)
        this.kihivasMode = false;
        this.kihivasFeladatSzam = 0;
        this.kihivasHelyesValaszok = 0;
        this.kihivasIdozito = null;

        // Game mode: 'practice' (slow, accuracy) or 'scored' (fast, points)
        // Don't reset gameMode - keep it persistent

        // Processing flags
        this.isProcessing = false;
        this.eredmenyMegjelenitve = false;

        // Hibás válasz számlálás (gyakorló módhoz)
        this.currentTaskAttempts = 0;
    }

    // Game mode management
    loadGameMode() {
        const savedMode = localStorage.getItem('szorzas-game-mode');
        this.gameMode = savedMode || 'practice'; // Default: practice mode
    }

    setGameMode(mode) {
        if (mode === 'practice' || mode === 'scored') {
            this.gameMode = mode;
            localStorage.setItem('szorzas-game-mode', mode);
        }
    }

    isPracticeMode() {
        return this.gameMode === 'practice';
    }

    isScoredMode() {
        return this.gameMode === 'scored';
    }

    setProcessing(value) {
        this.isProcessing = value;
    }

    getElapsedTime() {
        if (!this.kezdoIdo) return 0;
        return (new Date() - this.kezdoIdo) / 1000; // seconds
    }

    incrementCorrect() {
        this.helyesValaszokSzama++;
        if (this.kihivasMode) {
            this.kihivasHelyesValaszok++;
        }
    }

    incrementTask() {
        this.osszesFeladat++;
        if (this.kihivasMode) {
            this.kihivasFeladatSzam++;
        }
    }

    updatePontszam(points) {
        this.osszPontszam = points;
    }

    addTeljesitmenyData(dataPoint) {
        this.teljesitmenyAdatok.push(dataPoint);
    }
}
