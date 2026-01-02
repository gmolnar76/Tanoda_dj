// Globális változók
let szorzo, szorzando, nehezsegSzint = 1;
let kezdoIdo;
let osszPontszam = 0;
let helyesValaszokSzama = 0;
let osszesFeladat = 0;
let teljesitmenyAdatok = [];
let kihivasMode = false;
let kihivasFeladatSzam = 0;
let kihivasHelyesValaszok = 0;
let kihivasIdozito;
let isProcessing = false; // Flag változó a párhuzamos kérések elkerülésére
let eredmenyMegjelenitve = false; // Flag változó annak jelzésére, hogy az eredmény épp látható

// Importáljuk az egységesített üzenetkezelőt és a fejszámolás tippeket
import { messageHandler, szorzasMessageHandler } from '../szor_messages.js';
import { talaljMegfeleloTrukkot } from '../fejszamolas_tippek.js';

// DOM elemek
const szorzoElem = document.getElementById('szorzo');
const szorzandoElem = document.getElementById('szorzando');
const valaszInput = document.getElementById('valasz');
const eredmenyDiv = document.getElementById('eredmeny');
const pontszamElem = document.getElementById('osszes-pont');
const hatekonysagElem = document.getElementById('hatekonysag');
const hatekonysagProgress = document.getElementById('hatekonysag-progress');
const resetBtn = document.getElementById('reset-btn');
const ellenorzesBtn = document.getElementById('ellenorzes-btn');
const kihivasStartBtn = document.getElementById('kihivas-start');
const kihivasFeladatContainer = document.getElementById('kihivas-feladat-container');
const kihivasIdoElem = document.getElementById('kihivas-ido');
const kihivasFeladatSzamElem = document.getElementById('kihivas-feladat-szam');
const kihivasEredmenyDiv = document.getElementById('kihivas-eredmeny');
const tippBtn = document.getElementById('tipp-btn');

// Új feladat generálása
function ujFeladat() {
    // Alaphelyzetbe állítjuk a állapotjelzőket
    eredmenyMegjelenitve = false;
    isProcessing = true;
    
    fetch('/egesz_szamok/szorzas/', {
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        szorzo = data.szorzo;
        szorzando = data.szorzando;
        szorzoElem.textContent = szorzo;
        szorzandoElem.textContent = szorzando;
        valaszInput.value = '';
        eredmenyDiv.style.display = 'none';
        
        frissitStatisztika(data);
        frissitTeljesitmenyGrafikon(data);
        
        kezdoIdo = new Date();
        valaszInput.disabled = false;
        valaszInput.focus();
        
        animaljaSzamokat(szorzoElem);
        animaljaSzamokat(szorzandoElem);

        if (data.nehezseg !== undefined) {
            frissitNehezsegSzint(data.nehezseg);
        }
        
        // Fejszámolási tipp megjelenítése az új feladathoz
        const trukk = talaljMegfeleloTrukkot(szorzo, szorzando);
        if (trukk) {
            szorzasMessageHandler.showInfo(`<strong>Fejszámolási tipp:</strong> ${trukk.leiras}`, {
                header: 'Segítség a fejszámoláshoz',
                clickToClose: true
            });
        }
        
        // Feldolgozás befejezve
        isProcessing = false;
    })
    .catch(error => {
        console.error('Hiba az új feladat lekérésekor:', error);
        szorzasMessageHandler.showError('Hiba történt az új feladat betöltésekor. Kérjük, próbálja újra.');
        isProcessing = false;
    });
}

// Válasz ellenőrzése
function ellenorzes() {
    // Ha már feldolgozás alatt van egy kérés, ne indítsunk újat
    if (isProcessing) {
        console.log('Feldolgozás folyamatban, kérjük várjon...');
        return;
    }

    const valasz = parseInt(valaszInput.value);
    if (isNaN(valasz)) {
        szorzasMessageHandler.showWarning('Kérlek, adj meg egy számot!');
        return;
    }

    // Jelezzük, hogy feldolgozás alatt van
    isProcessing = true;
    valaszInput.disabled = true;
    
    const valaszIdo = (new Date() - kezdoIdo) / 1000;
    
    // Töröljünk minden korábbi üzenetet az új üzenet előtt
    szorzasMessageHandler.clearMessages();

    fetch('/egesz_szamok/szorzas/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
            mod: 'gyakorlo',
            szorzo: szorzo,
            szorzando: szorzando,
            valasz: valasz,
            valaszido: valaszIdo,
            nehezseg: nehezsegSzint,
            kihivas_mode: kihivasMode
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Hálózati hiba történt.');
        }
        return response.json();
    })
    .then(data => {
        console.log('Szerver válasz:', data);  // Debug: kiírjuk a szerver válaszát
        
        if (data.eredmeny) {
            szorzasMessageHandler.showSuccess(`Helyes! Pontszám: ${data.pontszam}`, data.szabaly);
            helyesValaszokSzama++;
            if (kihivasMode) {
                kihivasHelyesValaszok++;
            }
        } else {
            szorzasMessageHandler.showError(`Helytelen. A helyes válasz: ${data.helyes_valasz}`, data.modszer);
        }

        // Update Pythagorean table with the answer result
        frissitPitagoraszTabla(szorzo, szorzando, data.eredmeny);

        osszPontszam += data.pontszam || 0;
        osszesFeladat++;
        frissitStatisztika(data);
        frissitTeljesitmenyGrafikon(data);

        // Gamification esemény kiváltása helyes válasz esetén
        if (data.eredmeny && data.gamification) {
            document.dispatchEvent(new CustomEvent('points-earned', {
                detail: { scoring_result: data }
            }));
        }

        if (data.uj_nehezseg !== undefined) {
            frissitNehezsegSzint(data.uj_nehezseg);
        }

        // Jelezzük, hogy eredmény látható, így az Enter billentyű új feladatot indíthat
        eredmenyMegjelenitve = true;

        if (kihivasMode) {
            kihivasFeladatSzam++;
            frissitKihivasKijelzot();
            if (kihivasFeladatSzam >= 10) {
                befejezKihivas();
                isProcessing = false; // Felszabadítjuk a feldolgozást
            } else {
                setTimeout(() => {
                    ujFeladat();
                }, 1500);
            }
        } else {
            // Manual progression only - user must press Enter for next task
            // No auto-advance timer (removed for manual control)

            // A feldolgozás befejezését jelezzük, így Enter billentyűvel tovább lehet lépni
            isProcessing = false;
        }
    })
    .catch(error => {
        console.error('Hiba az ellenőrzés során:', error);
        szorzasMessageHandler.showError('Hiba történt az ellenőrzés során. Kérjük, próbálja újra.');
        isProcessing = false; // Hiba esetén is felszabadítjuk a feldolgozást
        eredmenyMegjelenitve = false;
    });
}

// Új függvény a gyenge pontok megjelenítésére
function showGyengePontok(gyengePontok) {
    const gyengePontokDiv = document.getElementById('gyenge-pontok');
    if (!gyengePontokDiv) return;

    let html = '<h3>Gyenge pontok:</h3><ul>';
    gyengePontok.forEach(pont => {
        html += `<li>${pont.szorzo} * ${pont.szorzando} (Hibák száma: ${pont.hibak_szama}, Hiba arány: ${pont.hiba_arany.toFixed(2)})</li>`;
    });
    html += '</ul>';

    gyengePontokDiv.innerHTML = html;
    gyengePontokDiv.style.display = 'block';
}

// A nehézségi szint frissítésére
function frissitNehezsegSzint(ujSzint) {
    nehezsegSzint = ujSzint;
    const nehezsegKijelzo = document.getElementById('nehezseg-kijelzo');
    if (nehezsegKijelzo) {
        // Nehézségi szint kijelzése arany csillagokkal
        let csillagok = '';
        for (let i = 0; i < ujSzint; i++) {
            csillagok += '<i class="fas fa-star" style="color: gold;"></i>';
        }
        nehezsegKijelzo.innerHTML = csillagok;
        nehezsegKijelzo.style.backgroundColor = 'transparent';
        nehezsegKijelzo.classList.add('mt-2');
    }
}

// Statisztika frissítése
function frissitStatisztika(data) {
    if (pontszamElem) {
        pontszamElem.textContent = data.osszes_pont || 0;
    }

    const hatekonysag = data.hatekonysag || 0;
    if (hatekonysagElem) {
        hatekonysagElem.textContent = hatekonysag.toFixed(2);
    }
    if (hatekonysagProgress) {
        hatekonysagProgress.style.width = `${hatekonysag}%`;
        hatekonysagProgress.textContent = `${hatekonysag.toFixed(2)}%`;
        hatekonysagProgress.setAttribute('aria-valuenow', hatekonysag);
    }

    const navbarPontszam = document.getElementById('navbar-osszes-pont');
    if (navbarPontszam) {
        navbarPontszam.textContent = data.osszes_pont || 0;
    }
}

// Teljesítmény grafikon frissítése (React + Recharts)
function frissitTeljesitmenyGrafikon(data) {
    teljesitmenyAdatok.push(data.pontszam || 0);
    if (teljesitmenyAdatok.length > 10) teljesitmenyAdatok.shift();

    // Use React Performance Chart instead of Plotly
    if (window.performanceChartInstance && typeof window.performanceChartInstance.update === 'function') {
        window.performanceChartInstance.update(teljesitmenyAdatok);
    } else {
        console.warn('Performance Chart React instance not initialized yet');
        // Try to initialize if not already done
        setTimeout(() => {
            if (window.initPerformanceChart) {
                window.performanceChartInstance = window.initPerformanceChart('teljesitmeny-grafikon', teljesitmenyAdatok);
            }
        }, 100);
    }
}

// Számok animálása
function animaljaSzamokat(element) {
    element.style.transform = 'scale(1.2)';
    element.style.transition = 'transform 0.3s ease';
    setTimeout(() => {
        element.style.transform = 'scale(1)';
    }, 300);
}

// Nehézségi szint kijelző frissítése
function frissitNehezsegKijelzot(szint) {
    frissitNehezsegSzint(szint || nehezsegSzint);
}

// Kihívás mód kezelése
function inditKihivas() {
    kihivasMode = true;
    kihivasFeladatSzam = 0;
    kihivasHelyesValaszok = 0;
    kihivasFeladatContainer.style.display = 'block';
    document.getElementById('normal-mode').style.display = 'none';
    
    let kihivasIdo = 60; // 60 másodperc a kihívásra
    kihivasIdozito = setInterval(() => {
        kihivasIdo--;
        kihivasIdoElem.textContent = kihivasIdo;
        if (kihivasIdo <= 0) {
            befejezKihivas();
        }
    }, 1000);

    ujFeladat();
}

function befejezKihivas() {
    clearInterval(kihivasIdozito);
    kihivasMode = false;
    kihivasFeladatContainer.style.display = 'none';
    document.getElementById('normal-mode').style.display = 'block';
    
    const eredmenyHtml = `
        <h3>Kihívás eredménye</h3>
        <p>Helyes válaszok: ${kihivasHelyesValaszok} / 10</p>
        <p>Összpontszám: ${osszPontszam}</p>
    `;
    
    kihivasEredmenyDiv.innerHTML = eredmenyHtml;
    kihivasEredmenyDiv.style.display = 'block';

    fetch('/egesz_szamok/szorzas/?statisztika=kihivas')
    .then(response => response.json())
    .then(statisztika => {
        kihivasEredmenyDiv.innerHTML += `
            <h4>Kihívás statisztikák</h4>
            <p>Összes kihívás: ${statisztika.osszes_kihivas}</p>
            <p>Átlagos pontszám: ${statisztika.atlag_pontszam.toFixed(2)}</p>
            <p>Legjobb pontszám: ${statisztika.legjobb_pontszam}</p>
        `;
    })
    .catch(error => {
        console.error('Hiba a kihívás statisztikák lekérésekor:', error);
    });
}

function frissitKihivasKijelzot() {
    kihivasFeladatSzamElem.textContent = kihivasFeladatSzam;
}

// Játék alaphelyzetbe állítása
function resetGame() {
    fetch('/egesz_szamok/nullaz/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        osszPontszam = 0;
        helyesValaszokSzama = 0;
        osszesFeladat = 0;
        nehezsegSzint = 1;
        teljesitmenyAdatok = [];
        frissitStatisztika(data);
        frissitTeljesitmenyGrafikon({pontszam: 0});
        frissitNehezsegSzint(1); // Alapértelmezett 1. szint beállítása
        ujFeladat();
        szorzasMessageHandler.showWarning('A játék alaphelyzetbe állítva.');
    })
    .catch(error => {
        console.error('Hiba a játék alaphelyzetbe állítása során:', error);
        szorzasMessageHandler.showError('Hiba történt a játék alaphelyzetbe állítása során. Kérjük, próbálja újra.');
    });
}

// Tipp megjelenítése kérésre
function tippMegjelenitese() {
    const trukk = talaljMegfeleloTrukkot(szorzo, szorzando);
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
            <p>Például: ${szorzo} × ${szorzando} esetén dolgozz helyiértékek szerint.</p>`, 
            { header: 'Általános fejszámolási tipp', clickToClose: true }
        );
    }
}

// CSRF token lekérése
function getCookie(name) {
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

// Eseménykezelők beállítása
document.addEventListener('DOMContentLoaded', () => {
    valaszInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Megakadályozzuk az űrlap küldését
            
            // Ha az eredmény már megjelenítve van, új feladat generálása Enter lenyomásra
            if (eredmenyMegjelenitve) {
                console.log('Enter key pressed when result is showing, generating new task');

                // Új feladat generálása (manuális továbblépés)
                ujFeladat();
                return;
            }
            
            // Egyébként normál ellenőrzés indítása, ha nincs folyamatban más
            console.log('Enter key pressed, triggering ellenorzes function.');
            if (!isProcessing && !valaszInput.disabled) {
                ellenorzes();
            } else {
                console.log('A kérés feldolgozás alatt vagy az input le van tiltva');
            }
        }
    });

    ellenorzesBtn.addEventListener('click', ellenorzes);
    resetBtn.addEventListener('click', resetGame);
    
    // Tipp gomb eseménykezelő
    if (tippBtn) {
        tippBtn.addEventListener('click', tippMegjelenitese);
    }
    
    if (kihivasStartBtn) {
        kihivasStartBtn.addEventListener('click', inditKihivas);
    }

    // Kezdő nehézségi szint beállítása
    frissitNehezsegSzint(1);

    ujFeladat();  // Kezdő feladat betöltése

    // Global keyboard shortcuts
    document.addEventListener('keydown', (event) => {
        // Ignore if typing in input field (Enter is handled separately)
        if (event.target.tagName === 'INPUT' && event.key !== 'Enter') {
            return;
        }

        switch(event.key.toLowerCase()) {
            case 'r':
                // Reset game
                event.preventDefault();
                resetGame();
                break;

            case 't':
                // Show tip
                event.preventDefault();
                tippMegjelenitese();
                break;

            case 'c':
                // Start challenge
                event.preventDefault();
                if (!kihivasMode && kihivasStartBtn) {
                    inditKihivas();
                }
                break;

            case 'n':
                // New task (if result is showing)
                event.preventDefault();
                if (eredmenyMegjelenitve) {
                    ujFeladat();
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
});

// Show keyboard shortcuts help modal
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

// Frissíti a Pitagorasz táblát a helyes és hibás válaszok alapján
function frissitPitagoraszTabla(szorzo, szorzando, helyes) {
    // Check if Pythagorean table update functions are available
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
