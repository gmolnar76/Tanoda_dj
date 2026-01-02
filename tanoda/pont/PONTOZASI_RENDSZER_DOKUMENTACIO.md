# Pontozási Rendszer - Teljes Dokumentáció

## Áttekintés

Egy átfogó, gamification elemekkel bővített pontozási rendszer, amely **egyszerűsített**, **moduláris** és **átlátható** pontozási logikát használ.

---

## Főbb Funkciók

### 1. Központi Pontozási Szolgáltatás
- **Egyszerűsített pontozási képletek** - Könnyebben követhető és karbantartható
- **Moduláris bónusz rendszer** - Kategóriánként testreszabható
- **Automatikus XP és szintkezelés**
- **Badge ellenőrzés és jutalmak**
- **Streak (sorozat) nyilvántartás**

### 2. Gamification Elemek

#### Szintek & Rangok
- **5 rang**: Kezdő → Haladó → Szakértő → Mester → Nagymester
- **Exponenciális XP skála**: 100 * (1.2^(szint-1))
- **Automatikus szintnövekedés** XP alapján

#### Badges (Kitűzők)
- **12+ előre definiált badge** különböző kategóriákban:
  - Teljesítmény: Pontszám alapú (100, 500, 1000 pont)
  - Szint: Szint elérés alapú (5., 10. szint)
  - Sorozat: Egymást követő napok (3, 7, 30 nap)
  - Hatékonyság: Átlagos teljesítmény (80%, 95%)
  - Speciális: Feladat típus alapú (50 szorzás, 30 kvíz)

#### Streak Rendszer
- **Napi aktivitás követés**
- **Leghosszabb sorozat** rekord
- **Automatikus frissítés** minden feladatnál

### 3. Real-time Frissítés
- **Auto-frissülő navbar** pontszám
- **Animált pontszám növekedés**
- **Értesítések**: Szintnövekedés, új badge, streak rekord
- **Opcionális polling** (30mp-enként)

### 4. API Endpoint-ok

```
GET  /pont/api/aktualis/       - Teljes felhasználói státusz
GET  /pont/api/szint/           - Szint információk
GET  /pont/api/badges/          - Badge-ek (megszerzett + elérhető)
GET  /pont/api/streak/          - Streak információk
GET  /pont/api/leaderboard/     - Rangsor (top 10)
```

---

## Modellek

### PontozasiKategoria
Definiálja a különböző feladattípusok pontozási paramétereit.

**Mezők:**
- `kod`: Egyedi azonosító (pl. 'szorzas_gyakorlas')
- `nev`: Megjelenített név
- `alap_pont`: Alapértelmezett pont
- `max_pont`: Maximum pontszám
- `ikon`: Font Awesome ikon

### UserLevel
Felhasználói szint és rang kezelése.

**Mezők:**
- `szint`: Jelenlegi szint (1-től kezdődik)
- `xp`: Tapasztalati pont
- `kovetkezo_szint_xp`: Szükséges XP a következő szinthez
- `rang`: Rang neve (Kezdő, Haladó, stb.)

**Metódusok:**
- `szint_noveles_ellenorzes()`: Auto-szintnövelés XP alapján

### Badge
Kitűző definíciók.

**Mezők:**
- `kod`: Egyedi azonosító
- `nev`, `leiras`: Megjelenítés
- `ikon`: Emoji vagy FA ikon
- `tipus`: teljesitmeny | sorozat | specialis | kihivas
- `feltetel`: JSON - megszerzési feltételek
- `pont_ertek`: XP jutalom
- `ritka`: Boolean - ritka badge

### UserBadge
Felhasználó által megszerzett badge-ek.

**Mezők:**
- `user`: FK → User
- `badge`: FK → Badge
- `megszerzve`: DateTime

**Constraints:**
- `unique_together`: ['user', 'badge']

### Streak
Sorozat (egymást követő napok) nyilvántartása.

**Mezők:**
- `aktualis_sorozat`: Jelenlegi sorozat hossza
- `leghosszabb_sorozat`: Rekord
- `osszes_aktiv_nap`: Összes aktív nap
- `utolso_aktivitas`: Utolsó dátum

**Metódusok:**
- `frissit()`: Automatikus frissítés az aktuális dátum alapján

---

## ScoringService

### `szamol_pontot(kategoria, nehezsegi_szint, valaszido, **kwargs)`

Kiszámítja a pontszámot a kategória és paraméterek alapján.

**Paraméterek:**
- `kategoria`: 'szorzas_gyakorlas' | 'pythagoras_quiz' | 'geometria' | 'programozas'
- `nehezsegi_szint`: 1-10
- `valaszido`: másodpercben (opcionális)
- `**kwargs`: További paraméterek (pl. szorzo, szorzando)

**Return:** `(pontszam, max_pontszam)`

**Példa:**
```python
pont, max_pont = ScoringService.szamol_pontot(
    kategoria='pythagoras_quiz',
    nehezsegi_szint=2,
    valaszido=5.3,
    szorzo=7,
    szorzando=8
)
```

### `hozzaad_pontot(user, kategoria, pontszam, max_pontszam)`

Hozzáadja a pontot és frissíti az összes gamification elemet.

**Return:** Dict
```python
{
    'pontszam': 14,
    'max_pontszam': 20,
    'osszes_pont': 1234,
    'hatekonysag': 87.5,
    'szint': {
        'jelenlegi': 6,
        'xp': 450,
        'kovetkezo_szint_xp': 500,
        'rang': 'Haladó',
        'szint_novekedett': False
    },
    'streak': {
        'aktualis': 5,
        'leghosszabb': 12,
        'uj_rekord': False
    },
    'uj_badges': [
        {'kod': 'elso_lepesek', 'nev': 'Első lépések', 'ikon': '🎯'}
    ]
}
```

### `get_user_stats(user)`

Lekéri a felhasználó teljes statisztikáját.

**Return:** Dict (teljes státusz info)

---

## Pontozási Rendszer

### Szorzás Gyakorlás (`szorzas_gyakorlas`)

**Alap:** 10 * nehézség
**Max:** 20 * nehézség

**Bónuszok:**
- **Gyorsasági:**
  - < 5s: +2 * nehézség
  - < 10s: +1 * nehézség
- **Komplexitási:**
  - max(|a|, |b|) > 10: +2 * nehézség
  - max(|a|, |b|) > 5: +1 * nehézség
- **Speciális:**
  - Negatív számok: +2 * nehézség
  - Négyzet (a == b): +3 * nehézség

### Pythagorasz Kvíz (`pythagoras_quiz`)

**Alap:** 10 * nehézség
**Max:** 20 * nehézség

**Bónuszok:**
- **Gyorsasági:**
  - < 3s: +3 * nehézség
  - < 7s: +2 * nehézség
  - < 12s: +1 * nehézség
- **Komplexitási:**
  - a * b > 50: +2 * nehézség
  - a * b > 20: +1 * nehézség

---

## Integráció

### 1. Pythagorasz Quiz

```python
# egesz_szamok/views.py
from pont.scoring_service import ScoringService

# Pontozás számítás
pontszam, max_pontszam = ScoringService.szamol_pontot(
    kategoria='pythagoras_quiz',
    nehezsegi_szint=difficulty,
    valaszido=response_time,
    szorzo=szorzo,
    szorzando=szorzando
)

# Pont hozzáadása + gamification
scoring_result = ScoringService.hozzaad_pontot(
    request.user,
    'pythagoras_quiz',
    pontszam,
    max_pontszam
)

# Eredmény visszaküldése
return JsonResponse({
    'correct': True,
    'points_earned': pontszam,
    'total_points': scoring_result['osszes_pont'],
    'szint': scoring_result['szint'],
    'streak': scoring_result['streak'],
    'uj_badges': scoring_result['uj_badges']
})
```

### 2. React Frontend

```javascript
// Ha helyes a válasz
const data = await response.json();

// Custom event kiváltása
document.dispatchEvent(new CustomEvent('points-earned', {
    detail: { scoring_result: data }
}));
```

A `real_time_scoring.js` automatikusan:
- Frissíti a navbar pontszámot
- Megjeleníti a szintnövekedés értesítést
- Megmutatja az új badge-eket
- Jelzi a streak rekordot

---

## Frontend Komponensek

### Navbar Frissítés

**HTML:**
```html
<button class="btn btn-warning">
    Pontszám: <span id="navbar-osszes-pont">0</span>
</button>
```

**JavaScript:**
```javascript
// real_time_scoring.js automatikusan kezeli
realTimeScoring.updateNavbarPoints();
```

### Értesítések Konténer

```html
<div id="gamification-notifications"></div>
```

### Gamification stílusok betöltése

```html
<link rel="stylesheet" href="{% static 'css/pont/gamification.css' %}">
<script src="{% static 'js/pont/real_time_scoring.js' %}"></script>
```

---

## Telepítés és Használat

### 1. Migráció futtatása

```bash
python manage.py migrate pont
```

### 2. Alapértelmezett elemek létrehozása

```bash
python manage.py init_gamification
```

Ez létrehozza:
- 4 pontozási kategóriát
- 12 badge-et (teljesítmény, szint, sorozat, hatékonyság, speciális)

### 3. Template-ekben

```html
{% load static %}

<!-- CSS -->
<link rel="stylesheet" href="{% static 'css/pont/gamification.css' %}">

<!-- JavaScript -->
<script src="{% static 'js/pont/real_time_scoring.js' %}"></script>

<!-- Értesítések konténer -->
<div id="gamification-notifications"></div>
```

### 4. Új feladat integrálása

```python
# views.py
from pont.scoring_service import ScoringService

def my_task_view(request):
    # ... feladat ellenőrzés ...

    if helyes:
        # Pontozás
        pont, max = ScoringService.szamol_pontot(
            kategoria='uj_kategoria',
            nehezsegi_szint=szint
        )

        # Hozzáadás
        result = ScoringService.hozzaad_pontot(
            request.user,
            'uj_kategoria',
            pont,
            max
        )

        return JsonResponse(result)
```

---

## Badge Feltételek

Badge feltételek JSON formátumban:

```python
# Pontszám alapú
{'tipus': 'osszes_pont', 'ertek': 500}

# Szint alapú
{'tipus': 'szint', 'ertek': 10}

# Streak alapú
{'tipus': 'streak', 'ertek': 7}

# Feladat szám alapú
{'tipus': 'feladat_szam', 'kategoria': 'pythagoras_quiz', 'ertek': 30}

# Hatékonyság alapú
{'tipus': 'hatekonysag', 'ertek': 80}
```

---

## Hibaelhárítás

### Navbar nem frissül

1. Ellenőrizd, hogy a `real_time_scoring.js` betöltődött
2. Konzolban `window.realTimeScoring` elérhető?
3. Van `#navbar-osszes-pont` elem?

### Badge nem jelenik meg

1. Futott az `init_gamification` command?
2. Jó a feltétel JSON formátum?
3. Console log a `_teljesiti_badge_feltetelt()` metódusban

### XP nem növekszik

1. `ScoringService.hozzaad_pontot()` meghívásra került?
2. Migráció lefutott?
3. UserLevel objektum létezik a userhez?

---

## Továbbfejlesztési Lehetőségek

1. **WebSocket integráció** - Real-time frissítés polling helyett
2. **Többnyelvűség** - i18n támogatás
3. **Testreszabható badge-ek** - Admin felületen keresztül
4. **Csapat versenyek** - Csoportos leaderboard
5. **Napi/heti kihívások** - Időkorlátos feladatok
6. **Badge kategóriák** - Még több badge típus
7. **Szint jutalmak** - Különleges tartalmak szintenként
8. **Profil testreszabás** - Avatárok, rangok

---

## Összefoglalás

✅ **Egyszerűsített pontozás** - Átlátható képletek
✅ **Moduláris rendszer** - Könnyen bővíthető
✅ **Gamification** - Szintek, badge-ek, streak
✅ **Real-time** - Automatikus frissítés
✅ **API-alapú** - RESTful endpoint-ok
✅ **Integrált** - Pythagorasz quiz támogatás
✅ **Dokumentált** - Részletes leírás

**Készítve:** 2025-12-30
**Verzió:** 1.0.0
