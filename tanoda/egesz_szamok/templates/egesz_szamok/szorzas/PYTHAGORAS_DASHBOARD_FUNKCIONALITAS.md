# Pythagoras Multiplication Table Widget - Funkcionális Dokumentáció

## Áttekintés

A Pythagoras Tábla Widget egy interaktív szorzás gyakorló eszköz, amely integrálva van a szorzás gyakorló dashboardba (`dashboard_szorzas.html`). A widget vizuális visszajelzést nyújt a tanulói haladásról egy színkódolt heatmap rendszeren keresztül, és lehetővé teszi a gyakorló feladatok közvetlen generálását a cellákra kattintva.

**Widget Helye**: 2. sor, jobb oldali oszlop (Medium Widget)
**Template**: `egesz_szamok/widgets/widget_pythagoras.html`
**Fő CSS**: `static/css/szorzas/gyakorlo/pythagoras.css`
**JavaScript**: `static/js/szorzas/gyakorlo/pitagorasz_tabla.js`

---

## Vizuális Dizájn

### Tiszta Fekete Esztétika (#000000)

A widget tiszta fekete (`#000000`) hátteret használ neon akcent színekkel a kontraszthoz:
- **Alap szín**: Tiszta fekete háttér minden cellán és konténeren
- **Akcent színek**:
  - Neon Zöld (`#4ecca3`) - Helyes válaszok, fejlécek
  - Neon Cyan (`#00d4ff`) - Hover állapotok, kiemelések
  - Neon Pink (`#ff6b9d`) - Hibák, figyelmeztetések
  - Neon Narancs (`#ff8c42`) - Részleges elsajátítás
- **Glass Effekt**: Félig átlátszó keretek, inner shadows és finom fényhatások révén érhető el

### Grid Elrendezés

**Struktúra**: 23×23 CSS Grid (sorok/oszlopok 0-22)
- **0. sor**: Fejléc sor az 1-22 szorzókkal
- **0. oszlop**: Fejléc oszlop az 1-22 szorzandókkal
- **Cella (0,0)**: "X" jelölő (bal felső sarok)
- **Adat cellák**: 22×22 grid a szorzási eredményekből

**Aspect Ratio**:
- **Konténer**: Szigorú 1:1 aspect ratio `aspect-ratio: 1/1` használatával
- **Egyéni cellák**: Minden cella 1:1 aspect ratio-t tart fenn képernyőméretetől függetlenül
- **Responsive**: A konténer 400px-ről (desktop) 250px-re (mobil) skálázódik, miközben megtartja a négyzet cellákat

---

## Interaktív Funkciók

### 1. Cella Kattintás - Gyakorló Feladat Generálás

**Funkció**: Bármely adat cellára (nem fejléc) kattintva gyakorló feladatot generál

**Munkafolyamat**:
1. A felhasználó rákattint a (sor, oszlop) pozícióban lévő cellára, amely `sor × oszlop`-ot reprezentál
2. A JavaScript meghívja a `cellClickHandler(szorzo, szorzando)` függvényt (256. sor)
3. AJAX POST hívás a `/egesz_szamok/szorzas/` végpontra:
   ```json
   {
     "mod": "cellavalasztas",
     "szorzo": sor,
     "szorzando": oszlop
   }
   ```
4. A szerver visszaad új feladat adatokat
5. A UI frissíti a fő feladat widget-et a kiválasztott szorzással
6. Az input mező automatikusan fókuszba kerül a válasz megadásához

**Kód Hivatkozás**:
- `pitagorasz_tabla.js` 256-300. sorok (`cellClickHandler`, `generateExerciseForCell`)

### 2. Hover Effektek

**Vizuális Visszajelzés**:
- **Border Szín**: Neon cyan-ra változik (`var(--neon-cyan)`)
- **Glow Effekt**: Cyan árnyék jelenik meg a cella körül
- **Scale**: A cella enyhén megnagyobbodik (`transform: scale(1.05)`)
- **Z-index**: A cella a szomszédok fölé emelkedik (`z-index: 5`)

**CSS**: `pythagoras.css` 52-59. sorok

### 3. Szűrés Szorzótábla Szerint

**Vezérlő**: Legördülő menü a widget fejlécében (7-18. sor a template-ben)

**Opciók**:
- "Mind" - Minden cella teljes átlátszósággal
- "2-es tábla" - "10-es tábla" - Adott tábla kiemelése

**Viselkedés**:
- Kiválasztott tábla cellái: Teljes átlátszóság (1.0), zöld háttér kiemelés
- Egyéb cellák: Csökkentett átlátszóság (0.3), nincs háttér
- Fejléc cellák: Érintetlenek (mindig láthatóak)

**JavaScript**: `widget_pythagoras.html` 60-81. sorok (`filterPythagorasTable`)

### 4. Méret Opciók

**Vezérlő**: Négy gomb a heatmap jelmagyarázat alatt

**Méretek**:
- **10×10**: Kompakt nézet (csak 1-10 szorzótábla)
- **12×12**: Standard nézet (1-12 szorzótáblák)
- **15×15**: Kiterjesztett nézet
- **20×20**: Teljes nézet (1-20 táblák)

**Viselkedés**:
- Az aktív gomb zöld akcentet kap (`border-color: var(--neon-green)`)
- Kattintásra újraépíti a teljes táblát az új méretekkel
- A grid template dinamikusan frissül
- Az aspect ratio minden méretnél megmarad

**JavaScript**: `pitagorasz_tabla.js` 413-430. sorok (`setTableSize`)

### 5. Widget Nagyítás/Kicsinyítés

**Vezérlő**: Nagyítás gomb a widget fejlécében (`fa-expand` ikon)

**Viselkedés**:
- **Nagyított Állapot**: A widget modal overlay-vé válik (90vw × 90vh max)
- **Sötét Overlay**: Félig átlátszó fekete háttér (`rgba(0, 0, 0, 0.7)`)
- **Pozíció**: Fix, képernyő közepén
- **Bezárás**: Overlay-re kattintva vagy compress gomb
- **Ikon Váltás**: `fa-expand` ↔ `fa-compress`

**JavaScript**: `widget_pythagoras.html` 105-132. sorok (`expandWidget`)

---

## Heatmap Színkódolás Rendszer

### Cél
A tanuló elsajátítottságának és hibagyakoriságának vizuális reprezentációja minden szorzási tényhez.

### Szín Skála (6 Szint)

A heatmap **border színt és glow intenzitást** használ fekete háttereken:

1. **Szint 0** (Nincs Hiba - Tökéletes)
   - Border: `rgba(0, 200, 0, 0.8)` - Élénk zöld
   - Glow: `0 0 8px rgba(0, 200, 0, 0.4)`
   - Jelentés: A feladatot elsőre helyesen megválaszolta

2. **Szint 1** (1 Hiba)
   - Border: `rgba(150, 200, 0, 0.8)` - Sárgászöld
   - Glow: `0 0 8px rgba(150, 200, 0, 0.5)`
   - Jelentés: Kisebb nehézség, többnyire helyes

3. **Szint 2** (2 Hiba)
   - Border: `rgba(255, 200, 0, 0.8)` - Sárga
   - Glow: `0 0 8px rgba(255, 200, 0, 0.6)`
   - Jelentés: Közepes nehézség

4. **Szint 3** (3 Hiba)
   - Border: `rgba(255, 150, 0, 0.8)` - Narancs
   - Glow: `0 0 10px rgba(255, 150, 0, 0.6)`
   - Jelentés: Jelentős nehézség

5. **Szint 4** (4 Hiba)
   - Border: `rgba(255, 100, 0, 0.8)` - Sötét narancs
   - Glow: `0 0 10px rgba(255, 100, 0, 0.7)`
   - Jelentés: Magas hibagyakoriság

6. **Szint 5** (5+ Hiba)
   - Border: `rgba(255, 0, 0, 0.9)` - Élénk piros
   - Glow: `0 0 12px rgba(255, 0, 0, 0.6)`
   - Jelentés: Kritikus gyengeség, célzott gyakorlás szükséges

### Heatmap Frissítési Logika

**Függvény**: `updateHeatmap(szorzo, szorzando, isCorrect)` (11-39. sorok)

**Folyamat**:
1. Hibák követése `hibaGyakorisagMap` objektumban: `{"1-1": 0, "1-2": 3, ...}`
2. Helytelen válasznál: Hibaszámláló növelése az adott cellához
3. Helyes válasznál: Nincs változás a hibaszámlálóban (történeti nehézséget mutat)
4. CSS osztály alkalmazása `heatmap-0`-tól `heatmap-5`-ig a számláló alapján
5. A heatmap munkamenetek között is megmarad az adatbázison keresztül

**CSS**: `pythagoras.css` 199-228. sorok

### Heatmap Jelmagyarázat

**Hely**: A tábla grid alatt
**Megjelenítés**: Vízszintes flex layout három elemmel:
- **Zöld Négyzet**: "Helyes"
- **Piros Négyzet**: "Hibás"
- **Szürke Négyzet**: "Nem próbált"

**Stílus**: Fekete háttér finom kerettel és inner glow-val

---

## Badge és Hibaszámláló Rendszer

### Badge Rendszer

**Cél**: Vizuális jelzők a válasz történetről minden cellán

**Típusok**:
1. **Helyes Badge** (Zöld Pipa ✓)
   - Osztály: `badge-correct`
   - Háttér: `linear-gradient(135deg, #00ff00, #00aa00)`
   - Glow: `0 0 4px rgba(0, 255, 0, 0.6)`

2. **Hiba Badge** (Piros X ✗)
   - Osztály: `badge-error`
   - Háttér: `linear-gradient(135deg, #ff0000, #aa0000)`
   - Glow: `0 0 4px rgba(255, 0, 0, 0.6)`

**Pozicionálás**:
- Konténer: `.cell-badge` - abszolút pozicionált jobb felső sarok
- Maximum: 3 badge cellánként (túlzsúfoltság megelőzése)
- A legrégebbi eltávolítása a limit elérésekor

**Függvény**: `addBadgeToCell(szorzo, szorzando, type)` (42-89. sorok)

### Hibaszámláló

**Cél**: Numerikus megjelenítés a hibák össz számának egy szorzási tényhez

**Megjelenés**:
- Piros tabletta alakú számláló (`border-radius: 3px`)
- Pozíció: Bal alsó sarok a cellában
- Háttér: `rgba(255, 0, 0, 0.9)`
- Betűtípus: 7px vastag fehér szöveg
- Dinamikusan frissül ahogy a hibák gyűlnek

**Növekedési Logika**:
- Létrehozva az első hibánál
- Növekszik minden további hibánál
- Megmarad amíg a cellát többször helyesen meg nem válaszolják

**CSS**: `pythagoras.css` 155-169. sorok

---

## Integráció a Gyakorló Modullal

### Adatfolyam

1. **Betöltési Fázis**:
   - A dashboard template rendereli a widget-et
   - A JavaScript meghívja a `createPitagoraszTable()` DOMContentLoaded eseménynél
   - A `fetchUserData()` lekéri a tanuló történetét `/egesz_szamok/pitagorasz-adatok/`-ról
   - A válasz tartalmazza:
     - `megoldott_feladatok`: Helyesen megoldott feladatok tömbje
     - `hibas_valaszok`: Hibák tömbje metaadatokkal

2. **Megjelenítési Fázis**:
   - A `renderPitagoraszTable(userData)` felépíti a 23×23 grid-et
   - A helyesen megválaszolt cellák `.revealed` osztályt kapnak és megjelenítik az eredményt
   - A hiba cellák `.hibas` osztályt kapnak
   - A heatmap osztályok alkalmazása hibagyakoriság alapján

3. **Interakciós Fázis**:
   - Felhasználó rákattint cellára → gyakorló feladat generálás
   - Felhasználó válaszol a fő feladat widget-ben
   - Válasz beküldése → szerver validáció
   - **Ha helyes**:
     - Hívja az `updatePitagoraszTable(szorzo, szorzando, eredmeny)` függvényt
     - Zöld badge hozzáadása, heatmap frissítése
     - Hiba stílus eltávolítása ha korábban hibás volt
   - **Ha hibás**:
     - Piros badge hozzáadása, hibaszámláló növelése
     - Heatmap frissítése a következő hiba szintre
     - A cella kattintható marad újrapróbálkozáshoz

4. **Perzisztencia**:
   - Minden adat felhasználónként mentve az adatbázisba
   - Következő munkamenet betölti az előző állapotot
   - A heatmap a kumulatív tanulási történetet tükrözi

### Kulcs Függvények

- **`createPitagoraszTable()`** (92. sor): Belépési pont, adatok lekérése
- **`fetchUserData()`** (110. sor): AJAX hívás a szerverhez
- **`renderPitagoraszTable(userData)`** (184. sor): Grid építése felhasználói adatokkal
- **`highlightCorrectAnswer(szorzo, szorzando, eredmeny)`** (303. sor): Vizuális visszajelzés
- **`updatePitagoraszTable(szorzo, szorzando, eredmeny)`** (350. sor): Frissítés helyes válasz után
- **`restoreHibasValaszok(hibasValaszokData)`** (325. sor): Hiba állapot visszaállítása

---

## Technikai Implementáció Részletek

### CSS Architektúra

**Fájl Struktúra**:
```
static/css/
├── dashboard/
│   ├── dashboard-base.css      # Globális téma változók
│   ├── widgets.css             # Widget alap stílusok
│   └── responsive.css          # Breakpoint definíciók
└── szorzas/gyakorlo/
    └── pythagoras.css          # Pythagoras-specifikus stílusok
```

**Kulcs Változók** (a `dashboard-base.css`-ből):
```css
--neon-green: #4ecca3
--neon-cyan: #00d4ff
--neon-pink: #ff6b9d
--neon-orange: #ff8c42
--border-radius-md: 16px
--transition-fast: 0.2s ease
```

### Grid Rendszer

**Konténer**:
```css
.pitagorasz-tabla {
    display: grid;
    grid-template-columns: repeat(23, 1fr);
    grid-template-rows: repeat(23, 1fr);
    aspect-ratio: 1 / 1;
    max-width: 400px;
}
```

**Cellák**:
```css
.pitagorasz-tabla .grid-item {
    aspect-ratio: 1 / 1;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}
```

**Responsive Skálázás**:
- Desktop (>992px): 400px max
- Tablet (768-992px): 350px max
- Mobil (576-768px): 300px max
- Kis mobil (<576px): 250px max

### JavaScript Architektúra

**Globális Állapot**:
```javascript
let currentHighlightedCell = null;        // Aktuálisan kiválasztott cella
let hibasValaszok = [];                   // Hiba objektumok tömbje
let felhasznaloEredmenyei = {};          // Felhasználó megoldott feladatai
let hibaGyakorisagMap = {};              // Hibagyakoriság: {"1-1": 3, ...}
```

**Esemény Kötés**:
- Cella kattintások kötése a `renderPitagoraszTable()`-ben (230. sor)
- Szűrő legördülő inline `onchange` kezelőt használ
- Méret gombok inline `onclick` kezelőket használnak
- Billentyűzet: Enter gomb kiváltja a válasz ellenőrzést

### Teljesítmény Megfontolások

1. **DOM Frissítések**: Cellák egyszer létrehozva, osztályok kapcsolgatva (nem újralétrehozva)
2. **Esemény Delegáció**: Javítható lenne cella kattintások delegálásával a konténerre
3. **Caching**: Felhasználói adatok egyszer lekérve betöltéskor, memóriában cache-elve
4. **Animációk**: CSS transitions (GPU-gyorsított) vs JavaScript
5. **Lazy Loading**: A tábla igény szerint épül, nem előre renderelt HTML-ben

---

## Felhasználói Munkafolyamat

### Tipikus Munkamenet Folyamat

1. **Dashboard Betöltés**
   - Tanuló bejelentkezik és a "Szorzás Gyakorló"-ra navigál
   - Pythagoras widget megjelenik a 2. sor, jobb oldali oszlopban
   - Tábla betöltődik a tanuló előző haladásával (zöld felfedett cellák, piros hiba cellák)
   - Heatmap mutatja a színkódolt nehézségi szinteket

2. **Haladás Felfedezése**
   - Tanuló hover-el a cellákon a szorzási tények megtekintéséhez
   - Zöld cellák jelzik az elsajátított tényeket
   - Piros/narancs cellák mutatják a gyakorlást igénylő területeket
   - Hibaszámlálók mutatják a specifikus nehéz pontokat

3. **Célzott Gyakorlás**
   - Tanuló azonosít egy piros/narancs cellát (pl. 7×8)
   - Rákattint arra a cellára
   - A fő feladat widget frissül "7 × 8 = ?" -ra
   - Tanuló beírja a választ
   - Azonnali visszajelzés:
     - Helyes → Cella zöldre vált, badge hozzáadva, heatmap javul
     - Helytelen → Piros badge, hibaszámláló növekszik, heatmap rosszabbodik

4. **Szűrők Használata**
   - Tanuló a 7-es szorzótáblára szeretne fókuszálni
   - Kiválasztja "7-es tábla" a legördülőből
   - Csak a 7. sor és 7. oszlop kiemelve
   - Egyéb cellák 30%-os átlátszóságra fakulnak
   - Tanuló szisztematikusan végigdolgozhatja a teljes táblát

5. **Nézet Beállítása**
   - Tanuló túlterhelőnek találja a 23×23-at
   - Rákattint a "10×10" gombra
   - Tábla leszűkül az alapvető tényekre (1-10)
   - Grid tökéletesen négyzetes marad
   - Visszaválthat 20×20-ra átfogó nézethez

6. **Teljes Képernyős Fókusz**
   - Tanuló nagyobb nézetet szeretne
   - Rákattint a nagyítás gombra a fejlécben
   - Widget modal overlay-vé válik (90% viewport)
   - Sötét háttér összpontosítja a figyelmet
   - Cellák nagyobbak és könnyebben láthatóak/kattinthatóak
   - Kattintás kívülre vagy compress gomb a visszatéréshez

7. **Haladás Követése**
   - Idővel egyre több cella válik zöldé
   - Heatmap vörös/narancsról zöld/sárgára tolódik
   - Badge rendszer mutatja a válasz történetet
   - Tanuló vizuálisan látja a javulást
   - Gamification pontok jutalmazzák a sorok/oszlopok befejezését

---

## Hozzáférhetőségi Megfontolások

1. **Billentyűzet Navigáció**:
   - Tab-bal végighaladás a szűrő legördülőn, méret gombokon, nagyítás gombon
   - Nyíl gombok navigálhatnak a grid-ben (jövőbeli fejlesztés)
   - Enter/Space cellák aktiválásához (jövőbeli fejlesztés)

2. **Képernyőolvasók**:
   - Cella címek kontextust adnak: "7 × 8 = 56"
   - Fejléc cellák tisztán címkézettek
   - ARIA címkék az interaktív vezérlőkön

3. **Szín Kontraszt**:
   - Tiszta fekete hátterek biztosítják a magas kontrasztot a neon színekkel
   - Szöveg mindig fehér/világos sötét háttereken
   - Border jelzők kiegészítik a csak színből álló heatmap-et

4. **Érintési Célpontok**:
   - Cellák megfelelően skálázódnak mobilon (min 22px)
   - Gombok megfelelnek a 44×44px minimumnak érintőképernyőkön
   - Megfelelő távolság megakadályozza a rossz érintéseket

5. **Csökkentett Mozgás**:
   - CSS tiszteletben tartja a `prefers-reduced-motion`-t (a `responsive.css`-ben)
   - Animációk letiltva érzékeny felhasználóknál

---

## Kód Hivatkozások

### Fájlok
1. **Widget Template**: `tanoda/egesz_szamok/templates/egesz_szamok/widgets/widget_pythagoras.html`
2. **Dashboard**: `tanoda/egesz_szamok/templates/egesz_szamok/dashboard_szorzas.html`
3. **Fő CSS**: `tanoda/static/css/szorzas/gyakorlo/pythagoras.css`
4. **Alap Téma**: `tanoda/static/css/dashboard/dashboard-base.css`
5. **Widget Stílusok**: `tanoda/static/css/dashboard/widgets.css`
6. **JavaScript**: `tanoda/static/js/szorzas/gyakorlo/pitagorasz_tabla.js`

### Kulcs Kód Szekciók
- Grid generálás: `pitagorasz_tabla.js` 184-253. sorok
- Heatmap frissítés: `pitagorasz_tabla.js` 11-39. sorok
- Badge rendszer: `pitagorasz_tabla.js` 42-89. sorok
- Cella kattintás kezelő: `pitagorasz_tabla.js` 256-300. sorok
- Szűrő függvény: `widget_pythagoras.html` 60-81. sorok
- Méret beállítás: `pitagorasz_tabla.js` 413-430. sorok
- CSS Grid layout: `pythagoras.css` 14-27. sorok
- Cella stílus: `pythagoras.css` 30-50. sorok
- Heatmap CSS: `pythagoras.css` 199-228. sorok

---

## Verzió Történet

- **v1.0** (Kezdeti): Alap 22×22 grid kattintási funkcióval
- **v1.5**: Heatmap rendszer hozzáadva 6 szintű színkódolással
- **v2.0**: Badge és hibaszámláló rendszer implementálva
- **v2.5**: Szűrés tábla szerint és méret opciók hozzáadva
- **v3.0**: Tiszta fekete újratervezés neon akcentekkel
- **v3.1**: Szigorú 1:1 aspect ratio kikényszerítés minden breakpointnál

---

## Függelék: Tervezési Indoklás

### Miért Tiszta Fekete (#000000)?

1. **Maximum Kontraszt**: Neon színek drámaian kiemelkednek a tiszta fekete ellen
2. **OLED-Barát**: Valódi fekete energiát takarít meg OLED/AMOLED képernyőkön
3. **Fókusz**: Sötét hátterek csökkentik a szemfáradtságot gyenge fényviszonyok között
4. **Modern Esztétika**: Igazodik a kortárs dark mode trendekhez
5. **Gamification**: "Játék-szerű" atmoszférát teremt, amely elkötelezi a tanulókat

### Miért Szigorúan Négyzet Alakú Cellák?

1. **Vizuális Konzisztencia**: Egységes formák minden képernyőméreten
2. **Szimmetria**: A szorzás kommutatív (a×b = b×a), a négyzetek ezt tükrözik
3. **Kiszámítható Elrendezés**: Tanulók mindig tudják, mire számíthatnak
4. **Könnyebb Célzás**: Négyzet célpontok könnyebben kattinthatóak/érinthetőek mint téglalapok
5. **Professzionális Megjelenés**: A grid csiszoltnak és szándékosnak tűnik

### Miért Heatmap Fekete Alapon?

- **Border + Glow Módszer**: Színek jelzik az állapotot anélkül, hogy eltakarnák a fekete alapot
- **Rétegzett Információ**: Fekete = alap, border = állapot, glow = intenzitás
- **Konzisztens Háttér**: Minden cella ugyanazzal az alappal rendelkezik, csak az akcentek változnak
- **Hozzáférhetőség**: Border jelzők működnek színvak felhasználóknál is

---

*Dokumentáció létrehozva: 2026. január 2.*
*Verzió: 3.1*
*Szerző: Claude Code AI Asszisztens*
