// szorzas_core.js - ESM Core Logic Module
// Main multiplication practice logic

import { messageHandler, szorzasMessageHandler } from '../../szor_messages.js';
import { talaljMegfeleloTrukkot } from '../../fejszamolas_tippek.js';
import { SzorzasState } from './szorzas_state.js';
import { SzorzasAPI } from './szorzas_api.js';

export class SzorzasCore {
    constructor() {
        this.state = new SzorzasState();
        this.api = new SzorzasAPI();
        this.elements = {};
        this.initDOMElements();
        this.attachEventListeners();
    }

    initDOMElements() {
        this.elements = {
            szorzo: document.getElementById('szorzo'),
            szorzando: document.getElementById('szorzando'),
            valaszInput: document.getElementById('valasz'),
            eredmenyDiv: document.getElementById('eredmeny'),
            pontszamElem: document.getElementById('osszes-pont'),
            hatekonysagElem: document.getElementById('hatekonysag'),
            hatekonysagProgress: document.getElementById('hatekonysag-progress'),
            resetBtn: document.getElementById('reset-btn'),
            ellenorzesBtn: document.getElementById('ellenorzes-btn'),
            kihivasStartBtn: document.getElementById('kihivas-start'),
            kihivasStopBtn: document.getElementById('kihivas-stop-btn'),
            kihivasFeladatContainer: document.getElementById('kihivas-feladat-container'),
            // Mode toggle elements - button-based toggle
            modeToggleContainer: document.getElementById('mode-toggle'),
            modeButtons: document.querySelectorAll('#mode-toggle .mode-btn'),
            kihivasIdoElem: document.getElementById('kihivas-ido'),
            kihivasFeladatSzamElem: document.getElementById('kihivas-feladat-szam'),
            kihivasEredmenyDiv: document.getElementById('kihivas-eredmeny'),
            tippBtn: document.getElementById('tipp-btn'),
            nehezsegKijelzo: document.getElementById('nehezseg-kijelzo'),
            navbarPontszam: document.getElementById('navbar-osszes-pont')
        };
    }

    attachEventListeners() {
        // Enter key handler on answer input
        if (this.elements.valaszInput) {
            this.elements.valaszInput.addEventListener('input', () => this.adjustInputWidth());

            this.elements.valaszInput.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();

                    if (this.state.eredmenyMegjelenitve) {
                        console.log('Enter key pressed when result is showing, generating new task');
                        this.ujFeladat();
                        return;
                    }

                    console.log('Enter key pressed, triggering ellenorzes function.');
                    if (!this.state.isProcessing && !this.elements.valaszInput.disabled) {
                        this.ellenorzes();
                    } else {
                        console.log('Processing in progress or input is disabled');
                    }
                }
            });
        }

        // Button click handlers
        if (this.elements.ellenorzesBtn) {
            this.elements.ellenorzesBtn.addEventListener('click', () => {
                if (this.state.eredmenyMegjelenitve) {
                    this.ujFeladat();
                } else {
                    this.ellenorzes();
                }
            });
        }

        if (this.elements.resetBtn) {
            this.elements.resetBtn.addEventListener('click', () => this.resetGame());
        }

        if (this.elements.tippBtn) {
            this.elements.tippBtn.addEventListener('click', () => this.tippMegjelenitese());
        }

        if (this.elements.kihivasStartBtn) {
            this.elements.kihivasStartBtn.addEventListener('click', () => this.inditKihivas());
        }

        if (this.elements.kihivasStopBtn) {
            this.elements.kihivasStopBtn.addEventListener('click', () => {
                const confirm = window.confirm('Biztosan leállítod a kihívást? Az eddigi eredmények elvesznek.');
                if (confirm) {
                    this.megallitKihivas();
                    this.ujFeladat(); // Load new normal task
                }
            });
        }

        // Mode toggle handler - button-based toggle
        if (this.elements.modeButtons && this.elements.modeButtons.length > 0) {
            this.elements.modeButtons.forEach(btn => {
                if (!btn.disabled) {
                    btn.addEventListener('click', (e) => {
                        const modeAttr = e.currentTarget.getAttribute('data-mode');

                        // Challenge button is an action button, not a toggle
                        if (modeAttr === 'challenge') {
                            this.inditKihivas();
                            return;
                        }

                        // Map 'scoring' to 'scored' for internal state
                        const newMode = modeAttr === 'scoring' ? 'scored' : modeAttr;
                        if (newMode === 'practice' || newMode === 'scored') {
                            // Check if challenge is running
                            if (this.state.kihivasMode) {
                                const confirm = window.confirm('Kihívás folyamatban! Biztosan kilépsz? Az eddigi eredmények elvesznek.');
                                if (confirm) {
                                    this.megallitKihivas();
                                    this.switchGameMode(newMode);
                                }
                            } else {
                                this.switchGameMode(newMode);
                            }
                        }
                    });
                }
            });
        }
        this.updateModeUI();
    }

    // Switch between practice and scored mode
    switchGameMode(mode) {
        this.state.setGameMode(mode);
        this.updateModeUI();

        const modeName = mode === 'practice' ? 'Gyakorló' : 'Pontozásos';
        szorzasMessageHandler.showInfo(`${modeName} mód aktiválva!`, {
            header: mode === 'practice' ? '📚 Gyakorlás' : '🏆 Verseny',
            duration: 2000
        });

        // Reset current task attempts
        this.state.currentTaskAttempts = 0;

        console.log(`✅ Game mode switched to: ${mode}`);
    }

    // Update UI based on current mode
    updateModeUI() {
        // Update button-based toggle - add/remove 'active' class
        if (this.elements.modeButtons && this.elements.modeButtons.length > 0) {
            const currentMode = this.state.gameMode;
            this.elements.modeButtons.forEach(btn => {
                const btnMode = btn.getAttribute('data-mode');
                // Map internal 'scored' to template 'scoring'
                const mappedMode = currentMode === 'scored' ? 'scoring' : currentMode;

                if (btnMode === mappedMode) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }
    }

    // Update action buttons (Check vs New Task)
    updateActionButtonsUI() {
        if (!this.elements.ellenorzesBtn) return;

        const btnIcon = this.elements.ellenorzesBtn.querySelector('i');

        if (this.state.eredmenyMegjelenitve) {
            // Show "New Task" state
            if (btnIcon) {
                btnIcon.className = 'fas fa-arrow-right';
            }
            this.elements.ellenorzesBtn.classList.add('btn-success-glow');
            this.elements.ellenorzesBtn.title = 'Új feladat kérése [Enter]';
        } else {
            // Show "Check" state
            if (btnIcon) {
                btnIcon.className = 'fas fa-check';
            }
            this.elements.ellenorzesBtn.classList.remove('btn-success-glow');
            this.elements.ellenorzesBtn.title = 'Ellenőrzés [Enter]';
        }

        // Disable buttons during processing
        const isProcessing = this.state.isProcessing;
        this.elements.ellenorzesBtn.disabled = isProcessing;
        if (this.elements.resetBtn) this.elements.resetBtn.disabled = isProcessing;
        if (this.elements.tippBtn) this.elements.tippBtn.disabled = isProcessing || this.state.eredmenyMegjelenitve;
    }

    // Adjust input width based on content
    adjustInputWidth() {
        const input = this.elements.valaszInput;
        if (!input) return;

        const charCount = input.value.length || 1;
        // Calculate width: base 80px + 20px per character
        const newWidth = Math.max(100, charCount * 22 + 40);
        input.style.width = `${newWidth}px`;
    }

    async ujFeladat() {
        // Reset state flags
        this.state.eredmenyMegjelenitve = false;
        this.state.setProcessing(true);
        this.updateActionButtonsUI();

        try {
            const data = await this.api.fetchNewTask();
            this.renderTask(data);

            this.state.kezdoIdo = new Date();
            this.elements.valaszInput.disabled = false;
            this.elements.valaszInput.focus();

            // Animate numbers
            this.animateNumber(this.elements.szorzo);
            this.animateNumber(this.elements.szorzando);

            // Update difficulty level
            if (data.nehezseg !== undefined) {
                this.frissitNehezsegSzint(data.nehezseg);
            }

            // Show calculation tip
            const trukk = talaljMegfeleloTrukkot(this.state.szorzo, this.state.szorzando);
            if (trukk) {
                szorzasMessageHandler.showInfo(`<strong>Fejszámolási tipp:</strong> ${trukk.leiras}`, {
                    header: 'Segítség a fejszámoláshoz',
                    clickToClose: true
                });
            }

            this.state.setProcessing(false);
            this.updateActionButtonsUI();
        } catch (error) {
            console.error('Hiba az új feladat lekérésekor:', error);
            szorzasMessageHandler.showError('Hiba történt az új feladat betöltésekor. Kérjük, próbálja újra.');
            this.state.setProcessing(false);
            this.updateActionButtonsUI();
        }
    }

    renderTask(data) {
        this.state.szorzo = data.szorzo;
        this.state.szorzando = data.szorzando;

        this.elements.szorzo.textContent = this.state.szorzo;
        this.elements.szorzando.textContent = this.state.szorzando;
        this.elements.valaszInput.value = '';
        this.adjustInputWidth();

        if (this.elements.eredmenyDiv) {
            this.elements.eredmenyDiv.style.display = 'none';
        }

        // Update statistics and performance chart
        this.frissitStatisztika(data);
        this.frissitTeljesitmenyGrafikon(data);
    }

    async ellenorzes() {
        // Prevent parallel requests
        if (this.state.isProcessing) {
            console.log('Feldolgozás folyamatban, kérjük várjon...');
            return;
        }

        const valasz = parseInt(this.elements.valaszInput.value);
        if (isNaN(valasz)) {
            szorzasMessageHandler.showWarning('Kérlek, adj meg egy számot!');
            return;
        }

        this.state.setProcessing(true);
        this.elements.valaszInput.disabled = true;
        this.updateActionButtonsUI();

        const valaszIdo = this.state.getElapsedTime();

        // Clear previous messages
        szorzasMessageHandler.clearMessages();

        try {
            const data = await this.api.checkAnswer({
                szorzo: this.state.szorzo,
                szorzando: this.state.szorzando,
                valasz: valasz,
                valaszido: valaszIdo,
                nehezseg: this.state.nehezsegSzint,
                kihivas_mode: this.state.kihivasMode
            });

            console.log('Szerver válasz:', data);

            this.handleAnswerResult(data);

            // Decide what to do based on mode
            if (this.state.kihivasMode) {
                // Challenge mode: automatic progression
                this.state.eredmenyMegjelenitve = true;
                this.state.kihivasFeladatSzam++;
                this.frissitKihivasKijelzot();

                if (this.state.kihivasFeladatSzam >= 10) {
                    this.befejezKihivas();
                    this.state.setProcessing(false);
                    this.updateActionButtonsUI();
                } else {
                    setTimeout(() => {
                        this.ujFeladat();
                    }, 1500);
                }
            } else if (this.state.isScoredMode() && data.eredmeny) {
                // PONTOZÁSOS MÓD + HELYES VÁLASZ: Azonnal új feladat (gyorsaság számít!)
                this.state.eredmenyMegjelenitve = false; // NE várjon Enter-re
                this.updateActionButtonsUI();
                setTimeout(() => {
                    this.ujFeladat();
                }, 800); // Rövid delay a visszajelzés olvashatóságához
            } else if (this.state.isPracticeMode() && this.state.currentTaskAttempts === 1) {
                // GYAKORLÓ MÓD + ELSŐ HIBA: Második esély, NE jelöljük eredményként
                this.state.setProcessing(false);
                this.elements.valaszInput.disabled = false;
                this.elements.valaszInput.select(); // Kijelöljük a hibás választ
                this.elements.valaszInput.focus();
                this.updateActionButtonsUI();
            } else {
                // MINDEN MÁS ESET: Manuális Enter nyomás szükséges
                this.state.eredmenyMegjelenitve = true;
                this.state.setProcessing(false);
                this.elements.valaszInput.disabled = false;
                this.elements.valaszInput.focus();
                this.updateActionButtonsUI();
            }
        } catch (error) {
            console.error('Hiba az ellenőrzés során:', error);
            szorzasMessageHandler.showError('Hiba történt az ellenőrzés során. Kérjük, próbálja újra.');
            this.state.setProcessing(false);
            this.state.eredmenyMegjelenitve = false;
            this.updateActionButtonsUI();
        }
    }

    handleAnswerResult(data) {
        const isPractice = this.state.isPracticeMode();
        const isCorrect = data.eredmeny;

        if (isCorrect) {
            // HELYES VÁLASZ
            this.state.incrementCorrect();
            this.state.currentTaskAttempts = 0;

            if (isPractice) {
                // Gyakorló mód: Részletes visszajelzés
                szorzasMessageHandler.showSuccess(
                    `Helyes! ${data.szabaly || ''}`,
                    { header: '✓ Jó válasz', duration: 2000 }
                );
            } else {
                // Pontozásos mód: Gyors visszajelzés + pontszám
                szorzasMessageHandler.showSuccess(
                    `Helyes! +${data.pontszam} pont`,
                    { header: '🎯 Helyes', duration: 1000 }
                );
            }
        } else {
            // HIBÁS VÁLASZ
            this.state.currentTaskAttempts++;

            if (isPractice && this.state.currentTaskAttempts === 1) {
                // Gyakorló mód: ELSŐ hibánál visszakérdezés + szabály
                const szabaly = data.modszer || data.szabaly || 'Gondolkozz a helyiérték szerinti bontáson!';
                szorzasMessageHandler.showWarning(
                    `<p><strong>Biztos ez a jó válasz?</strong></p>
                    <p class="mt-2">💡 <em>${szabaly}</em></p>
                    <p class="mt-2 small">Próbáld újra, vagy nyomj Enter-t a helyes válaszhoz.</p>`,
                    { header: '🤔 Ellenőrizd!', clickToClose: true, duration: 0 }
                );
                // NE jelöljük meg mint eredmenyMegjelenitve - adjunk második esélyt
                this.state.eredmenyMegjelenitve = false;
                return; // Kilépés - várunk új válaszra
            } else {
                // Gyakorló mód (második hiba) vagy Pontozásos mód: Helyes válasz megjelenítése
                const header = isPractice ? '❌ Helytelen' : '⚠️ Rossz válasz';
                const message = isPractice
                    ? `A helyes válasz: <strong>${data.helyes_valasz}</strong><br><small>${data.modszer || ''}</small>`
                    : `Helyes: <strong>${data.helyes_valasz}</strong>`;

                szorzasMessageHandler.showError(message, { header, duration: isPractice ? 3000 : 1500 });
                this.state.currentTaskAttempts = 0;
            }
        }

        // Update Pythagorean table
        this.frissitPitagoraszTabla(this.state.szorzo, this.state.szorzando, isCorrect);

        // Update statistics
        this.state.osszPontszam += data.pontszam || 0;
        this.state.incrementTask();
        this.frissitStatisztika(data);
        this.frissitTeljesitmenyGrafikon(data);

        // Gamification event (csak pontozásos módban)
        if (isCorrect && !isPractice && data.gamification) {
            document.dispatchEvent(new CustomEvent('points-earned', {
                detail: { scoring_result: data }
            }));
        }

        // Update difficulty
        if (data.uj_nehezseg !== undefined) {
            this.frissitNehezsegSzint(data.uj_nehezseg);
        }
    }

    frissitStatisztika(data) {
        if (this.elements.pontszamElem) {
            this.elements.pontszamElem.textContent = data.osszes_pont || 0;
        }

        // Update state counts if data contains lists
        if (data.megoldott_feladatok && Array.isArray(data.megoldott_feladatok)) {
            this.state.helyesValaszokSzama = data.megoldott_feladatok.length;
        }
        if (data.hibas_valaszok && Array.isArray(data.hibas_valaszok)) {
            // We don't have a direct 'hibasValaszokSzama' in state, but we can infer total tasks
            // if we assume state.osszesFeladat should be correct
            const hibasCount = data.hibas_valaszok.length;
            this.state.osszesFeladat = this.state.helyesValaszokSzama + hibasCount;
        }

        const hatekonysag = data.hatekonysag || 0;
        if (this.elements.hatekonysagElem) {
            this.elements.hatekonysagElem.textContent = hatekonysag.toFixed(2);
        }

        if (this.elements.hatekonysagProgress) {
            this.elements.hatekonysagProgress.style.width = `${hatekonysag}%`;
            this.elements.hatekonysagProgress.textContent = `${hatekonysag.toFixed(2)}%`;
            this.elements.hatekonysagProgress.setAttribute('aria-valuenow', hatekonysag);
        }

        // Update navbar score
        if (this.elements.navbarPontszam) {
            this.elements.navbarPontszam.textContent = data.osszes_pont || 0;
        }

        // Call external dashboard stats update if available
        if (typeof window.updateDashboardStats === 'function') {
            window.updateDashboardStats({
                efficiency: hatekonysag,
                correct: data.helyes_valaszok || data.megoldott_feladatok,
                incorrect: data.hibas_valaszok,
                gyenge_pontok: data.gyenge_pontok,
                total_points: data.osszes_pont
            });
        }

        // Update efficiency ring if available
        if (typeof window.updateEfficiencyRing === 'function') {
            window.updateEfficiencyRing(hatekonysag);
        }
    }

    frissitTeljesitmenyGrafikon(data) {
        this.state.addTeljesitmenyData(data.pontszam || 0);
        if (this.state.teljesitmenyAdatok.length > 10) {
            this.state.teljesitmenyAdatok.shift();
        }

        // Use React Performance Chart instead of Plotly
        if (window.performanceChartInstance && typeof window.performanceChartInstance.update === 'function') {
            window.performanceChartInstance.update(this.state.teljesitmenyAdatok);
        } else {
            console.warn('Performance Chart React instance not initialized yet');
            // Try to initialize if not already done
            setTimeout(() => {
                if (window.initPerformanceChart) {
                    window.performanceChartInstance = window.initPerformanceChart(
                        'teljesitmeny-grafikon',
                        this.state.teljesitmenyAdatok
                    );
                }
            }, 100);
        }
    }

    frissitNehezsegSzint(ujSzint) {
        this.state.nehezsegSzint = ujSzint;

        if (this.elements.nehezsegKijelzo) {
            // Display difficulty level with gold stars
            let csillagok = '';
            for (let i = 0; i < ujSzint; i++) {
                csillagok += '<i class="fas fa-star" style="color: gold;"></i>';
            }
            this.elements.nehezsegKijelzo.innerHTML = csillagok;
            this.elements.nehezsegKijelzo.style.backgroundColor = 'transparent';
            this.elements.nehezsegKijelzo.classList.add('mt-2');
        }
    }

    animateNumber(element) {
        if (!element) return;

        element.style.transform = 'scale(1.2)';
        element.style.transition = 'transform 0.3s ease';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 300);
    }

    async resetGame() {
        if (!confirm('Biztosan alaphelyzetbe állítod a játékot?')) {
            return;
        }

        try {
            const data = await this.api.resetGame();

            this.state.reset();
            this.frissitStatisztika(data);
            this.frissitTeljesitmenyGrafikon({pontszam: 0});
            this.frissitNehezsegSzint(1);

            await this.ujFeladat();
            szorzasMessageHandler.showWarning('A játék alaphelyzetbe állítva.');
        } catch (error) {
            console.error('Hiba a játék alaphelyzetbe állítása során:', error);
            szorzasMessageHandler.showError('Hiba történt a játék alaphelyzetbe állítása során. Kérjük, próbálja újra.');
        }
    }

    tippMegjelenitese() {
        const trukk = talaljMegfeleloTrukkot(this.state.szorzo, this.state.szorzando);

        if (trukk) {
            szorzasMessageHandler.showInfo(
                `<p><strong>${trukk.leiras}</strong></p>
                <p>${trukk.magyarazat}</p>
                <p><strong>Módszer:</strong> ${trukk.trick}</p>`,
                { header: 'Fejszámolási tipp', clickToClose: true }
            );
        } else {
            szorzasMessageHandler.showInfo(
                `<p>Bonts fel számokat kisebb részekre, amit könnyebb fejben szorozni.</p>
                <p>Például: ${this.state.szorzo} × ${this.state.szorzando} esetén dolgozz helyiértékek szerint.</p>`,
                { header: 'Általános fejszámolási tipp', clickToClose: true }
            );
        }
    }

    frissitPitagoraszTabla(szorzo, szorzando, helyes) {
        // Check if Pythagorean table update functions are available (global functions)
        if (typeof updatePitagoraszTable === 'function') {
            const eredmeny = szorzo * szorzando;

            if (helyes) {
                // Update table with correct answer (green highlight)
                updatePitagoraszTable(szorzo, szorzando, eredmeny);
            } else {
                // Mark as error and update heatmap and badge
                if (typeof updateHeatmap === 'function') {
                    updateHeatmap(szorzo, szorzando, false);
                }
                if (typeof addBadgeToCell === 'function') {
                    addBadgeToCell(szorzo, szorzando, 'error');
                }
                console.log(`Hibás válasz rögzítve a táblán: ${szorzo} × ${szorzando}`);
            }
        } else {
            console.warn('Pitagorasz tábla frissítő függvények nem érhetők el');
        }
    }

    // Challenge mode methods
    inditKihivas() {
        this.state.kihivasMode = true;
        this.state.kihivasFeladatSzam = 0;
        this.state.kihivasHelyesValaszok = 0;

        if (this.elements.kihivasFeladatContainer) {
            this.elements.kihivasFeladatContainer.style.display = 'block';
        }

        const normalMode = document.getElementById('normal-mode');
        if (normalMode) {
            normalMode.style.display = 'none';
        }

        let kihivasIdo = 60; // 60 seconds for challenge
        this.state.kihivasIdozito = setInterval(() => {
            kihivasIdo--;
            if (this.elements.kihivasIdoElem) {
                this.elements.kihivasIdoElem.textContent = kihivasIdo;
            }
            if (kihivasIdo <= 0) {
                this.befejezKihivas();
            }
        }, 1000);

        this.ujFeladat();
    }

    befejezKihivas() {
        clearInterval(this.state.kihivasIdozito);
        this.state.kihivasMode = false;

        if (this.elements.kihivasFeladatContainer) {
            this.elements.kihivasFeladatContainer.style.display = 'none';
        }

        const normalMode = document.getElementById('normal-mode');
        if (normalMode) {
            normalMode.style.display = 'block';
        }

        const eredmenyHtml = `
            <h3>Kihívás eredménye</h3>
            <p>Helyes válaszok: ${this.state.kihivasHelyesValaszok} / 10</p>
            <p>Összpontszám: ${this.state.osszPontszam}</p>
        `;

        if (this.elements.kihivasEredmenyDiv) {
            this.elements.kihivasEredmenyDiv.innerHTML = eredmenyHtml;
            this.elements.kihivasEredmenyDiv.style.display = 'block';
        }

        // Fetch challenge statistics
        fetch('/egesz_szamok/szorzas/?statisztika=kihivas')
            .then(response => response.json())
            .then(statisztika => {
                if (this.elements.kihivasEredmenyDiv) {
                    this.elements.kihivasEredmenyDiv.innerHTML += `
                        <h4>Kihívás statisztikák</h4>
                        <p>Összes kihívás: ${statisztika.osszes_kihivas}</p>
                        <p>Átlagos pontszám: ${statisztika.atlag_pontszam.toFixed(2)}</p>
                        <p>Legjobb pontszám: ${statisztika.legjobb_pontszam}</p>
                    `;
                }
            })
            .catch(error => {
                console.error('Hiba a kihívás statisztikák lekérésekor:', error);
            });
    }

    megallitKihivas() {
        // Stop the challenge without showing results
        clearInterval(this.state.kihivasIdozito);
        this.state.kihivasMode = false;
        this.state.kihivasFeladatSzam = 0;
        this.state.kihivasHelyesValaszok = 0;

        if (this.elements.kihivasFeladatContainer) {
            this.elements.kihivasFeladatContainer.style.display = 'none';
        }

        if (this.elements.kihivasEredmenyDiv) {
            this.elements.kihivasEredmenyDiv.style.display = 'none';
        }

        const normalMode = document.getElementById('normal-mode');
        if (normalMode) {
            normalMode.style.display = 'block';
        }

        szorzasMessageHandler.showInfo('Kihívás megszakítva', {
            header: '⏹️ Leállítva',
            duration: 2000
        });

        console.log('✅ Challenge stopped by user');
    }

    frissitKihivasKijelzot() {
        if (this.elements.kihivasFeladatSzamElem) {
            this.elements.kihivasFeladatSzamElem.textContent = this.state.kihivasFeladatSzam;
        }
    }

    // Initialize the app
    async init() {
        // Set initial difficulty level
        this.frissitNehezsegSzint(1);

        // Load first task
        await this.ujFeladat();

        console.log('✅ SzorzasCore initialized');
    }
}

// Export initialization function with global access
export function initSzorzasCore() {
    const instance = new SzorzasCore();
    window.szorzasCore = instance; // Global access for debugging
    instance.init();
    return instance;
}
