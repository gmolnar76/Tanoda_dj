/* Időbélyeg10.10 18:22*/

// Globális változók

// Globális változók
let currentHighlightedCell = null;
let hibasValaszok = [];
let hibaGyakorisagAdatok = {};
let felhasznaloEredmenyei = [];
let hibaGyakorisagMap = {};
// Scoring mode: when false (default), practice mode is active and no points are awarded
let scoringEnabled = false;

// Dinamikus tábla generálás
function createPitagoraszTable(size = 10) {
    const tableContainer = document.getElementById('pythagoras-table');
    if (!tableContainer) return;
    tableContainer.innerHTML = '';
    tableContainer.style.display = 'grid';
    tableContainer.style.gridTemplateColumns = `repeat(${size+1}, 1fr)`;
    tableContainer.style.gridTemplateRows = `repeat(${size+1}, 1fr)`;
    for (let j = 0; j <= size; j++) {
        const cell = document.createElement('div');
        cell.className = 'pythagoras-grid-item';
        if (j === 0) {
            cell.textContent = 'X';
            cell.className += ' pythagoras-header-cell';
        } else {
            cell.textContent = j;
            cell.className += ' pythagoras-header-cell';
        }
        tableContainer.appendChild(cell);
    }
    for (let i = 1; i <= size; i++) {
        const headerCell = document.createElement('div');
        headerCell.className = 'pythagoras-grid-item pythagoras-header-cell';
        headerCell.textContent = i;
        tableContainer.appendChild(headerCell);
        for (let j = 1; j <= size; j++) {
            const cell = document.createElement('div');
            cell.className = 'pythagoras-grid-item';
            const eredmeny = i * j;
            cell.dataset.eredmeny = eredmeny;
            cell.dataset.szorzo = i;
            cell.dataset.szorzando = j;
            cell.id = `pythagoras-cell-${i}-${j}`;
            cell.title = `${i} × ${j} = ${eredmeny}`;
            tableContainer.appendChild(cell);
        }
    }
}

// Heatmap és badge helper függvények (minimal, működő implementáció)
function updateHeatmap(szorzo, szorzando, isCorrect) {
    const a = Math.abs(szorzo), b = Math.abs(szorzando);
    const key = `${a}-${b}`;
    if (typeof hibaGyakorisagMap !== 'object') hibaGyakorisagMap = {};
    if (!Number.isFinite(hibaGyakorisagMap[key])) hibaGyakorisagMap[key] = 0;

    // Növeljük a hibaszámot ha rossz, esetleg csökkentjük ha javítva
    if (!isCorrect) {
        hibaGyakorisagMap[key] += 1;
    } else {
        hibaGyakorisagMap[key] = Math.max(0, hibaGyakorisagMap[key] - 1);
    }

    const level = Math.min(5, Math.floor(hibaGyakorisagMap[key]));
    const cell = document.getElementById(`pythagoras-cell-${a}-${b}`);
    if (!cell) return;
    for (let i = 0; i <= 5; i++) cell.classList.remove(`heatmap-${i}`);
    cell.classList.add(`heatmap-${level}`);
}

function addBadgeToCell(szorzo, szorzando, type) {
    const a = Math.abs(szorzo), b = Math.abs(szorzando);
    const cell = document.getElementById(`pythagoras-cell-${a}-${b}`);
    if (!cell) return;

    cell.style.position = cell.style.position || 'relative';
    let container = cell.querySelector('.pythagoras-cell-badge');
    if (!container) {
        container = document.createElement('div');
        container.className = 'pythagoras-cell-badge';
        container.style.position = 'absolute';
        container.style.top = '4px';
        container.style.right = '4px';
        container.style.display = 'flex';
        container.style.gap = '4px';
        cell.appendChild(container);
    }

    if (container.querySelectorAll('.pythagoras-badge-icon').length >= 3) return;

    const badge = document.createElement('div');
    badge.className = 'pythagoras-badge-icon pythagoras-badge-' + (type || 'info');
    badge.textContent = type === 'correct' ? '✓' : (type === 'error' ? '✗' : '•');
    badge.style.fontSize = '0.8em';
    badge.style.padding = '0 4px';
    badge.style.color = 'white';
    badge.style.background = (type === 'correct' ? 'green' : (type === 'error' ? 'crimson' : 'gray'));
    badge.style.borderRadius = '6px';
    container.appendChild(badge);
}

function renderPitagoraszTable(userData, size) {
    const tableContainer = document.getElementById('pythagoras-table');
    if (!tableContainer) return;
    tableContainer.style.display = 'grid';
    tableContainer.style.gridTemplateColumns = `repeat(${size+1}, 1fr)`;
    tableContainer.style.gridTemplateRows = `repeat(${size+1}, 1fr)`;
    const { megoldottFeladatok, hibasValaszok } = userData;
    for (let j = 0; j <= size; j++) {
        const cell = document.createElement('div');
        if (j === 0) {
            cell.className = 'pythagoras-grid-item pythagoras-header-cell';
            cell.textContent = 'X';
        } else {
            cell.className = 'pythagoras-grid-item pythagoras-header-cell';
            cell.textContent = j;
        }
        tableContainer.appendChild(cell);
    }
    for (let i = 1; i <= size; i++) {
        const headerCell = document.createElement('div');
        headerCell.className = 'pythagoras-grid-item pythagoras-header-cell';
        headerCell.textContent = i;
        tableContainer.appendChild(headerCell);
        for (let j = 1; j <= size; j++) {
            const cell = document.createElement('div');
            cell.className = 'pythagoras-grid-item';
            const eredmeny = i * j;
            cell.dataset.eredmeny = eredmeny;
            cell.dataset.szorzo = i;
            cell.dataset.szorzando = j;
            cell.id = `pythagoras-cell-${i}-${j}`;
            cell.title = `${i} × ${j} = ${eredmeny}`;
            cell.addEventListener('click', () => cellClickHandler(i, j));
            // Állapot szerinti színezés
            let state = 'pythagoras-neutral';
            if (megoldottFeladatok && Array.isArray(megoldottFeladatok)) {
                const megoldva = megoldottFeladatok.some(
                    f => (f.szorzo === i && f.szorzando === j) || (f.szorzo === j && f.szorzando === i)
                );
                if (megoldva) {
                    cell.textContent = eredmeny;
                    state = 'pythagoras-correct';
                }
            }
            if (hibasValaszok && Array.isArray(hibasValaszok)) {
                const hibas = hibasValaszok.some(
                    f => (f.szorzo === i && f.szorzando === j) || (f.szorzo === j && f.szorzando === i)
                );
                if (hibas) {
                    state = 'pythagoras-error';
                }
            }
            cell.classList.add(state);
            tableContainer.appendChild(cell);
        }
    }
    // Hibás válaszok betöltése
    if (hibasValaszok && Array.isArray(hibasValaszok) && hibasValaszok.length > 0) {
        restoreHibasValaszok(hibasValaszok);
    }
}
// --- DINAMIKUS TÁBLA MÉRET JAVÍTÁS VÉGE ---

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
        cell.className = 'pythagoras-grid-item';
        
        if (j === 0) {
            // A bal felső sarok cella (fejléc)
            cell.textContent = 'X';
            cell.className += ' pythagoras-header-cell';
        } else {
            // Felső fejléc cellák (szorzók)
            cell.textContent = j;
            cell.className += ' pythagoras-header-cell';
        }
        
        tableContainer.appendChild(cell);
    }
    
    // Ezután létrehozzuk a többi sort
    for (let i = 1; i <= 22; i++) {
        // Először a bal oldali fejléc cellát (szorzandók)
        const headerCell = document.createElement('div');
        headerCell.className = 'pythagoras-grid-item pythagoras-header-cell';
        headerCell.textContent = i;
        tableContainer.appendChild(headerCell);
        
        // Majd a belső cellákat
        for (let j = 1; j <= 22; j++) {
            const cell = document.createElement('div');
            cell.className = 'pythagoras-grid-item';
            
            // Csak az eredmény alapértékét tároljuk a data attribútumban
            const eredmeny = i * j;
            cell.dataset.eredmeny = eredmeny;
            cell.dataset.szorzo = i;
            cell.dataset.szorzando = j;
            cell.id = `pythagoras-cell-${i}-${j}`;
            cell.title = `${i} × ${j} = ${eredmeny}`;
            
            tableContainer.appendChild(cell);
        }
    }
}

// Pitagorasz-tábla renderelése a felhasználó adataival
function renderPitagoraszTable(userData) {
    const tableContainer = document.getElementById('pythagoras-table');
    if (!tableContainer) return;
    
    const { megoldottFeladatok, hibasValaszok } = userData;
    
    // Először létrehozzuk a fejléc sort (0-adik sor) - csak az első sor header-cell
    for (let j = 0; j <= 22; j++) {
        const cell = document.createElement('div');
        
        if (j === 0) {
            // A bal felső sarok cella (fejléc)
            cell.className = 'pythagoras-grid-item pythagoras-header-cell';
            cell.textContent = 'X';
        } else {
            // Felső fejléc cellák (szorzók)
            cell.className = 'pythagoras-grid-item pythagoras-header-cell';
            cell.textContent = j;
        }
        
        tableContainer.appendChild(cell);
    }
    
    // Ezután létrehozzuk a többi sort
    for (let i = 1; i <= 22; i++) {
        // Bal oldali fejléc cella
        const headerCell = document.createElement('div');
        headerCell.className = 'pythagoras-grid-item pythagoras-header-cell';
        headerCell.textContent = i;
        tableContainer.appendChild(headerCell);

        // Belső cellák
        for (let j = 1; j <= 22; j++) {
            const cell = document.createElement('div');
            cell.className = 'pythagoras-grid-item';
            const eredmeny = i * j;
            cell.dataset.eredmeny = eredmeny;
            cell.dataset.szorzo = i;
            cell.dataset.szorzando = j;
            cell.id = `pythagoras-cell-${i}-${j}`;
            cell.title = `${i} × ${j} = ${eredmeny}`;
            cell.addEventListener('click', () => cellClickHandler(i, j));

            // Állapot szerinti színezés
            let state = 'pythagoras-neutral';
            if (megoldottFeladatok && Array.isArray(megoldottFeladatok)) {
                const megoldva = megoldottFeladatok.some(
                    f => (f.szorzo === i && f.szorzando === j) || (f.szorzo === j && f.szorzando === i)
                );
                if (megoldva) {
                    cell.textContent = eredmeny;
                    state = 'pythagoras-correct';
                }
            }
            if (hibasValaszok && Array.isArray(hibasValaszok)) {
                const hibas = hibasValaszok.some(
                    f => (f.szorzo === i && f.szorzando === j) || (f.szorzo === j && f.szorzando === i)
                );
                if (hibas) {
                    state = 'pythagoras-error';
                }
            }
            cell.classList.add(state);
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
    const cellId = `pythagoras-cell-${Math.abs(szorzo)}-${Math.abs(szorzando)}`;
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
        const cellId = `pythagoras-cell-${szorzo}-${szorzando}`;
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

    // Hozzáadjuk a felhasználó megoldott feladataihoz (csak ha pontozás engedélyezve)
    if (scoringEnabled) {
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
}

// Reset practice session: clear user results, errors, heatmap and badges from table
function resetPracticeSession(persist = true) {
    const doClientReset = () => {
        felhasznaloEredmenyei = [];
        hibasValaszok = [];
        hibaGyakorisagMap = {};
        hibaGyakorisagAdatok = {};
        currentHighlightedCell = null;

        const cells = document.querySelectorAll('.pythagoras-grid-item');
        cells.forEach(cell => {
            // keep header cells as-is
            if (cell.classList.contains('pythagoras-header-cell')) return;

            // remove state classes
            cell.classList.remove('pythagoras-correct', 'pythagoras-error', 'pythagoras-neutral', 'hibas', 'hibas-ertek', 'revealed', 'current-highlight');
            for (let i = 0; i <= 5; i++) cell.classList.remove(`heatmap-${i}`);

            // remove badges container if present
            const badgeContainer = cell.querySelector('.pythagoras-cell-badge');
            if (badgeContainer) badgeContainer.remove();

            // clear displayed value (keep title/data attributes)
            cell.textContent = '';
        });
    };

    if (persist) {
        fetch('/egesz_szamok/szorzas/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({ mod: 'reset_pitagorasz' })
        })
        .then(response => {
            if (!response.ok) throw new Error('Reset request failed');
            return response.json().catch(() => ({ status: 'ok' }));
        })
        .then(data => {
            console.log('Szerver reset sikeres:', data);
        })
        .catch(error => {
            console.error('Hiba a reset küldésekor:', error);
        })
        .finally(() => {
            doClientReset();
            
            // Small delay to ensure DB consistency before fetching fresh stats
            setTimeout(() => {
                console.log('Friss statisztikák lekérése...');
                // Add timestamp to avoid caching
                fetch(`/egesz_szamok/szorzas/?t=${Date.now()}`, {
                    headers: { 'X-Requested-With': 'XMLHttpRequest' }
                })
                .then(resp => {
                    if (!resp.ok) throw new Error('Network response was not ok');
                    return resp.json();
                })
                .then(data => {
                    console.log('Friss statisztikák megérkeztek:', data);
                    const payload = {
                        efficiency: data.hatekonysag || 0,
                        correct: data.megoldott_feladatok || [],
                        incorrect: data.hibas_valaszok || [],
                        gyenge_pontok: data.gyenge_pontok || [],
                        total_points: data.osszes_pont || 0
                    };
                    if (typeof window.updateDashboardStats === 'function') {
                        window.updateDashboardStats(payload);
                    }
                })
                .catch(err => {
                    console.error('Hiba a statisztikák frissítésekor:', err);
                    // Fallback: zero out counters manually if fetch fails
                    const helyes = document.getElementById('helyes-szam');
                    const helytelen = document.getElementById('helytelen-szam');
                    if (helyes) helyes.textContent = '0';
                    if (helytelen) helytelen.textContent = '0';
                });
            }, 300);
        });
    } else {
        doClientReset();
    }
}

// Enable or disable scoring (use false for practice mode)
function setPitagorasScoring(enabled) {
    scoringEnabled = !!enabled;
}

// Expose control helpers for templates/buttons
window.resetPracticeSession = resetPracticeSession;
window.setPitagorasScoring = setPitagorasScoring;

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

// Dynamic grid size handling
function setTableSize(size, btn) {
    // Update active button
    document.querySelectorAll('.table-filter .filter-btn').forEach(b =>
        b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    // Update grid template dynamically
    const table = document.getElementById('pythagoras-table');
    if (table) {
        table.style.gridTemplateColumns = `repeat(${size + 1}, 1fr)`;
        table.style.gridTemplateRows = `repeat(${size + 1}, 1fr)`;
    }

    // Rebuild table with new size
    if (typeof createPitagoraszTable === 'function') {
        createPitagoraszTable(size);
    }
}

// Aspect ratio fallback for older browsers
if (!CSS.supports('aspect-ratio', '1/1')) {
    console.log('Aspect ratio not supported, using JS fallback');

    function enforceSquareCells() {
        const cells = document.querySelectorAll('.pythagoras-grid-item');
        cells.forEach(cell => {
            const width = cell.offsetWidth;
            cell.style.height = width + 'px';
        });
    }

    // Run on load and resize
    window.addEventListener('load', enforceSquareCells);
    window.addEventListener('resize', enforceSquareCells);
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