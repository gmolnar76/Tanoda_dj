let aktualisFeladat = {};
let cellakLezarva = false;
let tablazatMod = 'alatta'; // 'alatta' vagy 'mellette'
let maradekOszlopok = {}; // A maradékok tárolására oszloponként

function generalFeladat() {
    const szorzandoHossz = getCheckedLength('sz1');
    const szorzoHossz = getCheckedLength('sz2');
    
    const szorzando = generateRandomNumber(szorzandoHossz);
    const szorzo = generateRandomNumber(szorzoHossz);
    
    aktualisFeladat = { 
        szam1: szorzando, 
        szam2: szorzo, 
        eredmeny: szorzando * szorzo 
    };

    tablazatMod = 'mellette';
    maradekOszlopok = {};
    renderTablazat();
    updateInstructions('start');
}

function renderTablazat() {
    const szorzandoHossz = getCheckedLength('sz1');
    const szorzoHossz = getCheckedLength('sz2');
    const maxHossz = Math.max(szorzandoHossz, szorzoHossz);
    const eredmenyHossz = szorzandoHossz + szorzoHossz;

    let html = '<table class="szorzas-tabla">';
    
    if (tablazatMod === 'alatta') {
        html += renderSzorzandoSor(maxHossz);
        html += renderSzorzoSor(maxHossz);
        html += '<tr><td colspan="' + (maxHossz + 2) + '" class="vastag-vonal"></td></tr>';
        html += renderReszeredmenySorok(szorzoHossz, eredmenyHossz);
        html += '<tr><td colspan="' + (eredmenyHossz + 2) + '" class="vonal"></td></tr>';
        html += renderVegeredmenySor(eredmenyHossz);
    } else {
        html += '<tr>';
        html += renderSzorzandoSor(szorzandoHossz, false);
        html += '<td class="muvelet-jel">×</td>'; // Szorzásjel hozzáadva a "mellette" verzióhoz
        html += renderSzorzoSor(szorzoHossz, false);
        html += '</tr>';
        html += '<tr><td colspan="' + (szorzandoHossz + szorzoHossz + 3) + '" class="vastag-vonal"></td></tr>';
        html += renderReszeredmenySorok(szorzoHossz, eredmenyHossz);
        html += '<tr><td colspan="' + (eredmenyHossz + 1) + '" class="vonal"></td></tr>';
        html += renderVegeredmenySor(eredmenyHossz);
    }

    html += '</table>';
    document.getElementById('szorzas-racs').innerHTML = html;

    renderDragolhatoSzamok();
    renderMaradekBuborek();
    updateOsszegzes();

    cellakLezarva = false;
    document.getElementById('eredmeny').innerHTML = '';
}


function renderSzorzandoSor(maxHossz, withRowStart = true) {
    let html = withRowStart ? '<tr>' : '';
    html += tablazatMod === 'alatta' ? '<td></td>' : '';
    for (let i = 0; i < maxHossz; i++) {
        const index = aktualisFeladat.szam1.toString().length - maxHossz + i;
        if (index >= 0) {
            html += `<td class="szam-cella">${aktualisFeladat.szam1.toString()[index]}</td>`;
        } else {
            html += '<td></td>';
        }
    }
    html += withRowStart ? '</tr>' : '';
    return html;
}

function renderSzorzoSor(maxHossz, withRowStart = true) {
    let html = withRowStart ? '<tr>' : '';
    if (tablazatMod === 'alatta') {
        html += '<td class="muvelet-jel">×</td>';
    }
    for (let i = 0; i < maxHossz; i++) {
        const index = aktualisFeladat.szam2.toString().length - maxHossz + i;
        if (index >= 0) {
            html += `<td class="szam-cella">${aktualisFeladat.szam2.toString()[index]}</td>`;
        } else {
            html += '<td></td>';
        }
    }
    html += withRowStart ? '</tr>' : '';
    return html;
}

function renderReszeredmenySorok(szorzoHossz, oszlopokSzama) {
    let html = '';
    for (let i = 0; i < szorzoHossz; i++) {
        html += '<tr>';
        for (let j = 0; j < oszlopokSzama; j++) {
            html += `
                <td>
                    <div class="ures-cella" data-sor="${i}" data-oszlop="${j}">
                        <span class="cella-ertek"></span>
                        <sup class="maradek-kitevo"></sup>
                    </div>
                </td>
            `;
        }
        html += '</tr>';
    }
    return html;
}

function renderVegeredmenySor(oszlopokSzama) {
    let html = '<tr>';
    html += tablazatMod === 'alatta' ? '<td></td>' : '';
    for (let j = 0; j < oszlopokSzama; j++) {
        html += `<td>
            <div class="ures-cella" data-sor="eredmeny" data-oszlop="${j}">
                <span class="cella-ertek"></span>
                <sup class="maradek-kitevo"></sup>
            </div>
        </td>`;
    }
    html += '</tr>';
    return html;
}

/*                                                  drag & drop                             */

function renderDragolhatoSzamok() {
    let html = '<div class="d-flex flex-column align-items-center">';
    for (let i = 1; i <= 9; i += 3) {
        html += '<div class="d-flex justify-content-center">';
        for (let j = i; j < i + 3; j++) {
            html += `<div class="drag-szam m-1" draggable="true" data-szam="${j}">
                        <img src="/static/images/szam_gombok/${j}-square.svg" alt="${j}" class="szam-ikon" draggable="false">
                     </div>`;
        }
        html += '</div>';
    }
    html += '<div class="d-flex justify-content-center">';
    html += `<div class="drag-szam m-1" draggable="true" data-szam="0">
                <img src="/static/images/szam_gombok/0-square.svg" alt="0" class="szam-ikon" draggable="false">
             </div>`;
    html += '</div>';
    html += '</div>';
    document.getElementById('szam-paletta').innerHTML = html;

    const dragSzamok = document.querySelectorAll('.drag-szam');
    dragSzamok.forEach(szam => {
        szam.addEventListener('dragstart', drag);
    });
}


function valtTablazatMod() {
    tablazatMod = tablazatMod === 'alatta' ? 'mellette' : 'alatta';
    renderTablazat();
    const gomb = document.getElementById('tablazat-mod-btn');
    if (gomb) {
        gomb.textContent = tablazatMod === 'alatta' ? 'Váltás mellette módra' : 'Váltás alatta módra';
    }
}

function getCheckedLength(name) {
    const checkedRadio = document.querySelector(`input[name="${name}"]:checked`);
    return checkedRadio ? parseInt(checkedRadio.value) : 1;
}


function generateRandomNumber(length) {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function drag(event) {
    let target = event.target;
    
    // Ha a cél egy kép, keressük meg a szülő div-et
    if (target.tagName.toLowerCase() === 'img') {
        target = target.parentElement;
    }
    
    const szam = target.getAttribute('data-szam');
    if (szam !== null) {
        event.dataTransfer.setData("text", szam);
    } else {
        console.error('Nincs data-szam attribútum:', target);
    }
}

function allowDrop(event) {
    event.preventDefault();
}


function drop(event) {
    event.preventDefault();
    const szam = event.dataTransfer.getData("text");
    const targetCell = event.target.closest('.ures-cella');
    
    if (targetCell && !cellakLezarva) {
        const cellaErtek = targetCell.querySelector('.cella-ertek');
        const maradekKitevo = targetCell.querySelector('.maradek-kitevo');
        
        if (szam && !isNaN(parseInt(szam))) {
            let ertek = parseInt(szam);
            const oszlop = parseInt(targetCell.dataset.oszlop);
            
            // Hozzáadjuk az előző maradékot, ha van
            if (maradekOszlopok[oszlop]) {
                ertek += maradekOszlopok[oszlop];
                delete maradekOszlopok[oszlop];
            }
            
            if (ertek >= 10) {
                const ujErtek = ertek % 10;
                const ujMaradek = Math.floor(ertek / 10);
                
                cellaErtek.textContent = ujErtek;
                
                // Maradék megjelenítése kitevőként
                maradekKitevo.textContent = ujMaradek;
                maradekKitevo.style.display = 'block'; // Fontos!
                
                // Maradék tárolása a következő oszlophoz
                const kovetkezoOszlop = oszlop - 1;
                if (kovetkezoOszlop >= 0) {
                    maradekOszlopok[kovetkezoOszlop] = (maradekOszlopok[kovetkezoOszlop] || 0) + ujMaradek;
                }
            } else {
                cellaErtek.textContent = ertek;
                maradekKitevo.style.display = 'none';
            }
            
            targetCell.classList.add('filled');
        }
    }
}

/*                      ----------------------                          MARADÉK  drag & drop               ----------------------              */


function renderMaradekBuborek() {
    const maradekKontener = document.getElementById('maradek-kontener');
    maradekKontener.innerHTML = '';
    Object.keys(maradekOszlopok).forEach(oszlop => {
        const maradek = maradekOszlopok[oszlop];
        const buborek = document.createElement('div');
        buborek.className = 'maradek-buborek';
        buborek.textContent = maradek;
        buborek.style.left = `${oszlop * 50}px`; // 50px cellaszélesség feltételezve
        buborek.draggable = true;
        buborek.addEventListener('dragstart', maradekDragStart);
        maradekKontener.appendChild(buborek);
    });
}

function maradekDragStart(event) {
    const oszlop = Math.floor(event.target.offsetLeft / 50);
    event.dataTransfer.setData('text/plain', JSON.stringify({
        tipus: 'maradek',
        ertek: maradekOszlopok[oszlop],
        oszlop: oszlop
    }));
}

function handleMaradekDrop(event, targetOszlop) {
    const data = JSON.parse(event.dataTransfer.getData('text'));
    if (data.tipus === 'maradek') {
        delete maradekOszlopok[data.oszlop];
        maradekOszlopok[targetOszlop] = (maradekOszlopok[targetOszlop] || 0) + data.ertek;
        renderMaradekBuborek();
    }
}



/*                      ----------------------                          MARADÉK  drag & drop               ----------------------              */





/*                      ----------------------                     INTERAKCIÓK ANIMÁCIÓK     MARADÉK  drag & drop               ----------------------              */




function cellaDragStart(event) {
    if (!cellakLezarva) {
        const cellaErtek = event.target.querySelector('.cella-ertek');
        const content = cellaErtek.textContent;
        if (content) {
            event.dataTransfer.setData("text/plain", content);
            cellaErtek.textContent = '';
            event.target.classList.remove('filled');
            event.target.querySelector('.maradek-kitevo').textContent = '';
        }
    }
}


function cellaDrop(event) {
    event.preventDefault();
    const data = JSON.parse(event.dataTransfer.getData('text'));
    const targetCell = event.target.closest('.ures-cella');
    
    if (targetCell && !cellakLezarva) {
        if (data.tipus === 'cella' || data.tipus === 'szam') {
            targetCell.textContent = data.ertek;
            targetCell.classList.add('filled');
            checkForMaradek(targetCell);
        } else if (data.tipus === 'maradek') {
            handleMaradekDrop(event, parseInt(targetCell.dataset.oszlop));
        }
    }
}

function checkForMaradek(cell) {
    const ertek = parseInt(cell.textContent);
    if (ertek >= 10) {
        const maradek = Math.floor(ertek / 10);
        cell.textContent = ertek % 10;
        const oszlop = parseInt(cell.dataset.oszlop);
        maradekOszlopok[oszlop - 1] = (maradekOszlopok[oszlop - 1] || 0) + maradek;
        renderMaradekBuborek();
        animateMaradek(cell, maradek);
    }
}

function animateMaradek(cell, maradek) {
    const animation = cell.animate([
        { opacity: 1, transform: 'translateY(0)' },
        { opacity: 0, transform: 'translateY(-20px)' }
    ], {
        duration: 500,
        easing: 'ease-out'
    });
    
    animation.onfinish = () => {
        const buborek = document.querySelector(`.maradek-buborek[style*="left: ${(parseInt(cell.dataset.oszlop) - 1) * 50}px"]`);
        if (buborek) {
            buborek.animate([
                { transform: 'scale(1)' },
                { transform: 'scale(1.2)' },
                { transform: 'scale(1)' }
            ], {
                duration: 300,
                easing: 'ease-in-out'
            });
        }
    };
}

function updateMaradekKitevok() {
    const cellak = document.querySelectorAll('.ures-cella');
    cellak.forEach(cella => {
        const oszlop = parseInt(cella.dataset.oszlop);
        const maradekKitevo = cella.querySelector('.maradek-kitevo');
        
        if (maradekOszlopok[oszlop]) {
            maradekKitevo.textContent = maradekOszlopok[oszlop];
            maradekKitevo.style.opacity = '1';
            
            setTimeout(() => {
                maradekKitevo.style.transition = 'opacity 0.5s';
                maradekKitevo.style.opacity = '0';
            }, 1000);
            
            delete maradekOszlopok[oszlop];
        }
    });
}


/*                      ----------------------                     INTERAKCIÓK ANIMÁCIÓK     MARADÉK  drag & drop               ----------------------              */



/*                      ----------------------                     Ellenőrzés és visszajelzés                    ----------------------              */



function ellenorzes() {
    const reszeredmenyek = [];
    const vegeredmeny = [];
    let helyes = true;
    let pontszam = 0;

    const szorzoHossz = getCheckedLength('sz2');
    const maxOszlop = document.querySelectorAll('.ures-cella[data-sor="eredmeny"]').length;

    // Részeredmények ellenőrzése
    for (let i = 0; i < szorzoHossz; i++) {
        let sorErtek = '';
        for (let j = 0; j < maxOszlop; j++) {
            const cella = document.querySelector(`.ures-cella[data-sor="${i}"][data-oszlop="${j}"]`);
            if (cella && cella.textContent) {
                sorErtek += cella.textContent;
            }
        }
        reszeredmenyek.push(parseInt(sorErtek) || 0);

        const vartErtek = aktualisFeladat.szam1 * parseInt(aktualisFeladat.szam2.toString()[szorzoHossz - 1 - i]);
        if (reszeredmenyek[i] === vartErtek) {
            pontszam += 1; // 1 pont minden helyes részeredményért
        } else {
            helyes = false;
            jelolHibas(i);
        }
    }


    // Végeredmény ellenőrzése
    for (let j = 0; j < maxOszlop; j++) {
        const cella = document.querySelector(`.ures-cella[data-sor="eredmeny"][data-oszlop="${j}"]`);
        if (cella && cella.textContent) {
            vegeredmeny.unshift(cella.textContent);
        }
    }
    const vegeredmenySzam = parseInt(vegeredmeny.join('')) || 0;
    if (vegeredmenySzam === aktualisFeladat.eredmeny) {
        pontszam += 2; // 2 pont a helyes végeredményért
    } else {
        helyes = false;
        jelolHibas('eredmeny');
    }

    // Ha minden helyes, extra pont
    if (helyes) {
        pontszam += 3; // 3 extra pont, ha minden helyes
    }

    visszajelzesKijelzese(helyes, pontszam);
    updatePontszam(pontszam);
    updateOsszegzes();
    
    if (helyes) {
        cellakLezarva = true;
        updateInstructions('final');
    } else {
        updateInstructions('next');
    }
}

/* 
Megkeresi az összegzéshez szükséges DOM elemeket
Kiszámítja és megjeleníti a részeredményeket soronként
Kiszámítja és megjeleníti a végeredményt
Hibakezelést tartalmaz
Folyamatosan frissíti az eredményeket, ahogy a felhasználó kitölti a cellákat

A függvényt a többi függvény mellé kell elhelyezni, és már hivatkozik rá a renderTablazat  
*/

function updateOsszegzes() {
    const osszegzesDiv = document.getElementById('osszegzes');
    const reszeredmenyekDiv = document.getElementById('reszeredmenyek');
    const vegeredmenyDiv = document.getElementById('vegeredmeny');

    if (!osszegzesDiv || !reszeredmenyekDiv || !vegeredmenyDiv) {
        console.warn('Összegzés elemek nem találhatók');
        return;
    }

    try {
        // Részeredmények számítása és megjelenítése
        let reszeredmenyek = [];
        const szorzoHossz = getCheckedLength('sz2');
        
        for (let i = 0; i < szorzoHossz; i++) {
            let sorErtek = '';
            const sorCellak = document.querySelectorAll(`.ures-cella[data-sor="${i}"]`);
            sorCellak.forEach(cella => {
                const cellaErtek = cella.querySelector('.cella-ertek');
                if (cellaErtek && cellaErtek.textContent) {
                    sorErtek += cellaErtek.textContent;
                }
            });
            if (sorErtek) {
                reszeredmenyek.push(parseInt(sorErtek) || 0);
            }
        }

        // Részeredmények HTML generálása
        let reszeredmenyekHTML = '<div class="reszeredmenyek-lista">';
        reszeredmenyek.forEach((ertek, index) => {
            reszeredmenyekHTML += `
                <div class="reszeredmeny-sor">
                    <span class="reszeredmeny-sorszam">${index + 1}. részeredmény:</span>
                    <span class="reszeredmeny-ertek">${ertek}</span>
                </div>
            `;
        });
        reszeredmenyekHTML += '</div>';
        reszeredmenyekDiv.innerHTML = reszeredmenyekHTML;

        // Végeredmény számítása és megjelenítése
        let vegErtek = '';
        const vegeredmenyCellak = document.querySelectorAll('.ures-cella[data-sor="eredmeny"]');
        vegeredmenyCellak.forEach(cella => {
            const cellaErtek = cella.querySelector('.cella-ertek');
            if (cellaErtek && cellaErtek.textContent) {
                vegErtek = cellaErtek.textContent + vegErtek;
            }
        });

        vegeredmenyDiv.innerHTML = `
            <div class="vegeredmeny-box">
                <span class="vegeredmeny-cimke">Végeredmény:</span>
                <span class="vegeredmeny-ertek">${vegErtek || '?'}</span>
            </div>
        `;

    } catch (error) {
        console.error('Hiba az összegzés frissítésekor:', error);
    }
}





function visszajelzesKijelzese(helyes, pontszam) {
    const eredmenyDiv = document.getElementById('eredmeny');
    if (helyes) {
        eredmenyDiv.innerHTML = `<div class="alert alert-success">Gratulálok! Minden számítás helyes! Elért pontszám: ${pontszam}</div>`;
    } else {
        eredmenyDiv.innerHTML = `<div class="alert alert-danger">Sajnos van hiba a számításban. Próbáld újra! Elért pontszám: ${pontszam}</div>`;
    }
}

function updatePontszam(ujPontszam) {
    let osszPontszam = parseInt(localStorage.getItem('osszPontszam')) || 0;
    osszPontszam += ujPontszam;
    localStorage.setItem('osszPontszam', osszPontszam);

    // Frissítjük a pontszám kijelzőt, ha van ilyen elem
    const pontszamKijelzo = document.getElementById('pontszam-kijelzo');
    if (pontszamKijelzo) {
        pontszamKijelzo.textContent = `Összpontszám: ${osszPontszam}`;
    }
}

/*
    const eredmenyDiv = document.getElementById('eredmeny');
    if (helyes) {
        eredmenyDiv.innerHTML = '<div class="alert alert-success">Gratulálok! Minden számítás helyes!</div>';
        cellakLezarva = true;
        updateInstructions('final');
    } else {
        eredmenyDiv.innerHTML = '<div class="alert alert-danger">Sajnos van hiba a számításban. Próbáld újra!</div>';
        updateInstructions('next');
        feloldCellak();
    }

    // Pontszám számítás és frissítés
    const pontszam = helyes ? calculatePontszam() : 0;
    updatePontszam(pontszam);

    // Pitagorasz tábla frissítése
    if (helyes) {
        updatePitagoraszTable(aktualisFeladat.szam1, aktualisFeladat.szam2, aktualisFeladat.eredmeny);
    }
}
*/


function calculatePontszam() {
    // Itt implementálhatjuk a pontszám számítás logikáját
    // Például: nehézség alapján, vagy a megoldás gyorsasága alapján
    return 10; // Egyszerű példa: minden helyes megoldás 10 pont
}

function updatePontszam(pontszam) {
    // Itt frissíthetjük a felhasználói felületen a pontszámot
    const pontszamElem = document.getElementById('pontszam');
    if (pontszamElem) {
        const jelenlegiPontszam = parseInt(pontszamElem.textContent) || 0;
        pontszamElem.textContent = jelenlegiPontszam + pontszam;
    }
}

function jelolHibas(sor) {
    const cellak = document.querySelectorAll(`.ures-cella[data-sor="${sor}"]`);
    cellak.forEach(cella => {
        cella.classList.add('hibas');
    });
}

function feloldCellak() {
    cellakLezarva = false;
    const filledCells = document.querySelectorAll('.ures-cella.filled');
    filledCells.forEach(cell => {
        cell.draggable = true;
        cell.addEventListener('dragstart', cellaDragStart);
    });
}



function resetJeloles() {
    const cellak = document.querySelectorAll('.ures-cella');
    cellak.forEach(cella => {
        cella.classList.remove('hibas');
    });
}



function updateInstructions(step) {
    const alertContainer = document.getElementById('alert-container');
    let instructions = '';
    switch(step) {
        case 'start':
            instructions = `
                <h5>Kezdő lépések:</h5>
                <ol>
                    <li>Nézd meg a szorzandó és szorzó számokat.</li>
                    <li>Kezdd a szorzást a szorzó jobb szélső számjegyével.</li>
                    <li>Húzd a részeredményeket a megfelelő helyekre.</li>
                </ol>
            `;
            break;
        case 'next':
            instructions = `
                <h5>Következő lépések:</h5>
                <ol>
                    <li>Folytasd a szorzást a szorzó következő számjegyével.</li>
                    <li>Ne felejtsd el a maradékot hozzáadni!</li>
                    <li>Ismételd, amíg az összes számjeggyel nem szoroztál.</li>
                </ol>
            `;
            break;
        case 'final':
            instructions = `
                <h5>Utolsó lépések:</h5>
                <ol>
                    <li>Add össze a részeredményeket.</li>
                    <li>Ellenőrizd a végeredményt.</li>
                    <li>Ha kész vagy, kattints az "Ellenőrzés" gombra!</li>
                </ol>
            `;
            break;
    }
    alertContainer.innerHTML = instructions;
}


document.addEventListener('DOMContentLoaded', function() {
    const radioButtons = document.querySelectorAll('.helyiertek-valaszto input[type="radio"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', generalFeladat);
    });

    //const szorzasRacs = document.getElementById('szorzas-racs');
    //szorzasRacs.addEventListener('dragover', allowDrop);
    //szorzasRacs.addEventListener('drop', drop);
    //const ellenorzesBtn = document.getElementById('ellenorzes-btn');
    //const ujFeladatBtn = document.getElementById('uj-feladat-btn');
    //const feloldBtn = document.getElementById('felold-btn');
    //const tablazatModBtn = document.getElementById('tablazat-mod-btn');

    //szorzasRacs.addEventListener('dragover', allowDrop);
    //szorzasRacs.addEventListener('drop', drop);
    //ellenorzesBtn.addEventListener('click', ellenorzes);
    //ujFeladatBtn.addEventListener('click', generalFeladat);
    //feloldBtn.addEventListener('click', feloldCellak);
    //tablazatModBtn.addEventListener('click', valtTablazatMod);//

    const szorzasRacs = document.getElementById('szorzas-racs');
    szorzasRacs.addEventListener('dragover', allowDrop);
    szorzasRacs.addEventListener('drop', drop);

    document.getElementById('ellenorzes-btn').addEventListener('click', ellenorzes);
    document.getElementById('uj-feladat-btn').addEventListener('click', generalFeladat);
    document.getElementById('felold-btn').addEventListener('click', feloldCellak);
    document.getElementById('tablazat-mod-btn').addEventListener('click', valtTablazatMod);
    document.getElementById('maradek-kezeles-btn').addEventListener('click', kezelMaradekokat);


    initializeEventListeners();
    generalFeladat();  // Kezdeti feladat generálása
});

function initializeEventListeners() {
    document.querySelectorAll('.helyiertek-valaszto input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', generalFeladat);
    });

    document.getElementById('ellenorzes-btn').addEventListener('click', ellenorzes);
    document.getElementById('uj-feladat-btn').addEventListener('click', generalFeladat);
    document.getElementById('felold-btn').addEventListener('click', feloldCellak);
    document.getElementById('tablazat-mod-btn').addEventListener('click', valtTablazatMod);
}

function kezelMaradekokat() {
    // Implementáld a maradékok kezelését
    const maradekMegjelenito = document.getElementById('maradek-megjelenito');
    const maradekMagyarazat = document.getElementById('maradek-magyarazat');
    
    // Példa implementáció:
    let maradekHTML = '';
    Object.entries(maradekOszlopok).forEach(([oszlop, ertek]) => {
        maradekHTML += `<div class="maradek-buborek" data-oszlop="${oszlop}">${ertek}</div>`;
    });
    maradekMegjelenito.querySelector('#maradek-sor').innerHTML = maradekHTML;

    maradekMagyarazat.querySelector('#maradek-leiras').textContent = 
        'A maradékok az egyes oszlopokban keletkező 10 feletti értékek, amiket a következő oszlophoz kell adni.';
}