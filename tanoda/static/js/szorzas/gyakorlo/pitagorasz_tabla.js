/* Időbélyeg10.10 18:22*/

// Globális változók
let currentHighlightedCell = null;
let hibasValaszok = [];
let hibaGyakorisagAdatok = {}; // Hibagyakoriság tárolására
let felhasznaloEredmenyei = {}; // Felhasználó eredményeinek tárolására
let hibaGyakorisagMap = {}; // Heatmap error frequency tracking: {"1-1": 0, "1-2": 3, ...}

// Update heatmap visualization based on error frequency
function updateHeatmap(szorzo, szorzando, isCorrect) {
    const key = `${szorzo}-${szorzando}`;

    // Initialize error count if doesn't exist
    if (!hibaGyakorisagMap[key]) {
        hibaGyakorisagMap[key] = 0;
    }

    // Increment error count if answer was incorrect
    if (!isCorrect) {
        hibaGyakorisagMap[key]++;
    }

    // Apply heatmap class to cell
    const cellId = `cell-${szorzo}-${szorzando}`;
    const cell = document.getElementById(cellId);

    if (cell) {
        // Remove old heatmap classes
        for (let i = 0; i <= 5; i++) {
            cell.classList.remove(`heatmap-${i}`);
        }

        // Add new heatmap class based on error count
        const errorCount = hibaGyakorisagMap[key];
        const heatmapLevel = Math.min(errorCount, 5);
        cell.classList.add(`heatmap-${heatmapLevel}`);
    }
}

// Add badge to cell (correct or error badge)
function addBadgeToCell(szorzo, szorzando, type) {
    const cellId = `cell-${szorzo}-${szorzando}`;
    const cell = document.getElementById(cellId);

    if (!cell) return;

    // Make cell position relative for absolute badges
    cell.style.position = 'relative';

    // Create badge container if doesn't exist
    let badgeContainer = cell.querySelector('.cell-badge');
    if (!badgeContainer) {
        badgeContainer = document.createElement('div');
        badgeContainer.className = 'cell-badge';
        cell.appendChild(badgeContainer);
    }

    // Check if badge already exists - prevent duplicates
    const existingBadge = badgeContainer.querySelector(`.badge-${type}`);
    if (existingBadge) return; // Don't add duplicate badges

    // Limit total badges to 3 to prevent overcrowding
    const existingBadges = badgeContainer.querySelectorAll('.badge-icon');
    if (existingBadges.length >= 3) {
        // Remove oldest badge if at limit
        existingBadges[0].remove();
    }

    // Add badge icon
    const badge = document.createElement('div');
    badge.className = `badge-icon badge-${type}`;
    badge.innerHTML = type === 'correct' ? '✓' : '✗';
    badgeContainer.appendChild(badge);

    // Update error counter
    if (type === 'error') {
        let errorCounter = cell.querySelector('.error-counter');
        if (!errorCounter) {
            errorCounter = document.createElement('div');
            errorCounter.className = 'error-counter';
            errorCounter.textContent = '1';
            cell.appendChild(errorCounter);
        } else {
            const count = parseInt(errorCounter.textContent) + 1;
            errorCounter.textContent = count.toString();
        }
    }
}

// A Pitagorasz-tábla létrehozása a felhasználó adataival
function createPitagoraszTable() {
    const tableContainer = document.getElementById('pitagorasz-tabla');
    if (!tableContainer) return;
    
    tableContainer.innerHTML = '';  // Töröljük a meglévő tartalmat
    
    // Lekérjük a felhasználó adatait az adatbázisból
    fetchUserData().then(userData => {
        // Az adatok megérkezése után generáljuk a táblát
        renderPitagoraszTable(userData);
    }).catch(error => {
        console.error('Hiba a felhasználói adatok lekérésekor:', error);
        // Hiba esetén üres táblát jelenítünk meg
        renderEmptyPitagoraszTable();
    });
}

// Felhasználói adatok lekérése az adatbázisból
function fetchUserData() {
    return fetch('/egesz_szamok/pitagorasz-adatok/', {
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Hálózati hiba történt');
        }
        return response.json();
    })
    .then(data => {
        // Adatok feldolgozása és tárolása
        felhasznaloEredmenyei = data.megoldott_feladatok || [];
        hibasValaszok = data.hibas_valaszok || [];
        
        return {
            megoldottFeladatok: felhasznaloEredmenyei,
            hibasValaszok: hibasValaszok
        };
    });
}

// Üres Pitagorasz-tábla renderelése (hiba esetén)
function renderEmptyPitagoraszTable() {
    const tableContainer = document.getElementById('pitagorasz-tabla');
    if (!tableContainer) return;
    
    // Először létrehozzuk a fejléc sort (0-adik sor)
    for (let j = 0; j <= 22; j++) {
        const cell = document.createElement('div');
        cell.className = 'grid-item';
        
        if (j === 0) {
            // A bal felső sarok cella (fejléc)
            cell.textContent = 'X';
            cell.className += ' header-cell';
        } else {
            // Felső fejléc cellák (szorzók)
            cell.textContent = j;
            cell.className += ' header-cell';
        }
        
        tableContainer.appendChild(cell);
    }
    
    // Ezután létrehozzuk a többi sort
    for (let i = 1; i <= 22; i++) {
        // Először a bal oldali fejléc cellát (szorzandók)
        const headerCell = document.createElement('div');
        headerCell.className = 'grid-item header-cell';
        headerCell.textContent = i;
        tableContainer.appendChild(headerCell);
        
        // Majd a belső cellákat
        for (let j = 1; j <= 22; j++) {
            const cell = document.createElement('div');
            cell.className = 'grid-item';
            
            // Csak az eredmény alapértékét tároljuk a data attribútumban
            const eredmeny = i * j;
            cell.dataset.eredmeny = eredmeny;
            cell.dataset.szorzo = i;
            cell.dataset.szorzando = j;
            cell.id = `cell-${i}-${j}`;
            cell.title = `${i} × ${j} = ${eredmeny}`;
            
            tableContainer.appendChild(cell);
        }
    }
}

// Pitagorasz-tábla renderelése a felhasználó adataival
function renderPitagoraszTable(userData) {
    const tableContainer = document.getElementById('pitagorasz-tabla');
    if (!tableContainer) return;
    
    const { megoldottFeladatok, hibasValaszok } = userData;
    
    // Először létrehozzuk a fejléc sort (0-adik sor) - csak az első sor header-cell
    for (let j = 0; j <= 22; j++) {
        const cell = document.createElement('div');
        
        if (j === 0) {
            // A bal felső sarok cella (fejléc)
            cell.className = 'grid-item header-cell';
            cell.textContent = 'X';
        } else {
            // Felső fejléc cellák (szorzók)
            cell.className = 'grid-item header-cell';
            cell.textContent = j;
        }
        
        tableContainer.appendChild(cell);
    }
    
    // Ezután létrehozzuk a többi sort
    for (let i = 1; i <= 22; i++) {
        // Először a bal oldali fejléc cellát (szorzandók) - csak az első oszlop header-cell
        const headerCell = document.createElement('div');
        headerCell.className = 'grid-item header-cell';
        headerCell.textContent = i;
        tableContainer.appendChild(headerCell);
        
        // Majd a belső cellákat
        for (let j = 1; j <= 22; j++) {
            const cell = document.createElement('div');
            cell.className = 'grid-item';
            
            const eredmeny = i * j;
            cell.dataset.eredmeny = eredmeny;
            cell.dataset.szorzo = i;
            cell.dataset.szorzando = j;
            cell.id = `cell-${i}-${j}`;
            
            // Tooltip alapértelmezetten
            cell.title = `${i} × ${j} = ${eredmeny}`;
            
            // Kattintás eseménykezelő - csak a belső cellákhoz
            cell.addEventListener('click', () => cellClickHandler(i, j));
            
            // Ellenőrizzük, hogy a felhasználó megoldotta-e már ezt a feladatot
            if (megoldottFeladatok && Array.isArray(megoldottFeladatok)) {
                const megoldva = megoldottFeladatok.some(
                    f => (f.szorzo === i && f.szorzando === j) || 
                         (f.szorzo === j && f.szorzando === i)
                );
                
                if (megoldva) {
                    cell.textContent = eredmeny;
                    cell.classList.add('revealed');
                }
            }
            
            tableContainer.appendChild(cell);
        }
    }
    
    // Hibás válaszok betöltése
    if (hibasValaszok && Array.isArray(hibasValaszok) && hibasValaszok.length > 0) {
        restoreHibasValaszok(hibasValaszok);
    }
}

// Cellára kattintás kezelése
function cellClickHandler(szorzo, szorzando) {
    // Új gyakorlófeladat generálása erre a cellára
    generateExerciseForCell(szorzo, szorzando);
}

// Új gyakorlófeladat generálása egy cellára kattintáskor
function generateExerciseForCell(szorzo, szorzando) {
    // Itt küldhetünk egy kérést a szervernek, hogy állítson be egy konkrét feladatot
    fetch('/egesz_szamok/szorzas/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
            mod: 'cellavalasztas',
            szorzo: szorzo,
            szorzando: szorzando
        })
    })
    .then(response => response.json())
    .then(data => {
        // Frissítjük a feladatot a felületen
        const szorzoElem = document.getElementById('szorzo');
        const szorzandoElem = document.getElementById('szorzando');
        const valaszInput = document.getElementById('valasz');
        
        if (szorzoElem && szorzandoElem && valaszInput) {
            szorzoElem.textContent = data.szorzo;
            szorzandoElem.textContent = data.szorzando;
            valaszInput.value = '';
            valaszInput.focus();
            
            // Animáljuk a számokat, ha van ilyen függvény
            if (typeof animaljaSzamokat === 'function') {
                animaljaSzamokat(szorzoElem);
                animaljaSzamokat(szorzandoElem);
            }
        }
    })
    .catch(error => {
        console.error('Hiba a feladat beállításakor:', error);
    });
}

// Helyes válasz kiemelése
function highlightCorrectAnswer(szorzo, szorzando, eredmeny) {
    const cellId = `cell-${Math.abs(szorzo)}-${Math.abs(szorzando)}`;
    const cell = document.getElementById(cellId);
    
    if (cell) {
        // Távolítsuk el az előző kiemelést
        if (currentHighlightedCell) {
            currentHighlightedCell.classList.remove('current-highlight');
        }
        
        // Állítsuk be az új cellát
        cell.textContent = Math.abs(eredmeny);
        cell.classList.add('revealed');
        cell.classList.add('current-highlight');
        cell.classList.remove('hibas');  // Távolítsuk el a hibás jelölést, ha volt
        
        // Frissítsük a jelenleg kiemelt cellát
        currentHighlightedCell = cell;
    }
}

// Hibás válaszok visszaállítása
function restoreHibasValaszok(hibasValaszokData) {
    hibasValaszok = hibasValaszokData;
    
    // Megjelenítjük a hibákat a táblán - egyszerűsített módon
    hibasValaszok.forEach(valasz => {
        const szorzo = Math.abs(valasz.szorzo);
        const szorzando = Math.abs(valasz.szorzando);
        const cellId = `cell-${szorzo}-${szorzando}`;
        const cell = document.getElementById(cellId);
        
        if (cell) {
            // Csak jelöljük a hibás cellákat
            cell.classList.add('hibas');
            
            // Ha a hibának van eredménye, megjelenítjük
            if (valasz.hibas_eredmeny !== undefined && !valasz.javitva) {
                cell.textContent = valasz.hibas_eredmeny;
                cell.classList.add('hibas-ertek');
                cell.title = `${szorzo} × ${szorzando} = ${szorzo * szorzando}\nHibás válasz: ${valasz.hibas_eredmeny}`;
            }
        }
    });
}

// Pitagorasz-tábla frissítése
function updatePitagoraszTable(szorzo, szorzando, eredmeny) {
    highlightCorrectAnswer(szorzo, szorzando, eredmeny);

    // Update heatmap with correct answer
    updateHeatmap(szorzo, szorzando, true);

    // Add correct badge
    addBadgeToCell(szorzo, szorzando, 'correct');

    // Távolítsuk el a hibás jelölést, ha ez egy korábban hibás válasz volt
    const index = hibasValaszok.findIndex(v => v.szorzo === Math.abs(szorzo) && v.szorzando === Math.abs(szorzando));
    if (index !== -1) {
        hibasValaszok[index].javitva = true;

        // Frissítjük a táblát is
        const cellId = `cell-${Math.abs(szorzo)}-${Math.abs(szorzando)}`;
        const cell = document.getElementById(cellId);
        if (cell) {
            cell.classList.remove('hibas', 'hibas-ertek');
            cell.textContent = Math.abs(eredmeny);
        }
    }

    // Hozzáadjuk a felhasználó megoldott feladataihoz
    if (!felhasznaloEredmenyei.some(f =>
        (f.szorzo === szorzo && f.szorzando === szorzando) ||
        (f.szorzo === szorzando && f.szorzando === szorzo)
    )) {
        felhasznaloEredmenyei.push({
            szorzo: szorzo,
            szorzando: szorzando,
            eredmeny: eredmeny
        });
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

// Backwards-compat shim for legacy callers
if (typeof window.buildPitagoraszTable !== 'function') {
    window.buildPitagoraszTable = function(size) {
        if (typeof createPitagoraszTable === 'function') {
            return createPitagoraszTable(size);
        }
        console.warn('buildPitagoraszTable shim called but createPitagoraszTable is not defined');
    };
}

// Inicializálás
document.addEventListener('DOMContentLoaded', () => {
    createPitagoraszTable();

    const valaszInput = document.getElementById('valasz');
    const ellenorzesBtn = document.getElementById('ellenorzes-btn');

    if (valaszInput && ellenorzesBtn) {
        valaszInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                ellenorzesBtn.click();
            }
        });
    }
});