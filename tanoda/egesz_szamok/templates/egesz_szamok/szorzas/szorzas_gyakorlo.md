A http://127.0.0.1:8002/egesz_szamok/szorzas/ URL-hez tartozó szekció a következő:
szorzas_gyakorlo.html

URL mapping: urls.py – path('szorzas/', views.szorzas_gyakorlo, name='szorzas')
View (nézet): views.py – szorzas_gyakorlo függvény
Pontozás logika: A helyes válaszokat a kezeld_helyes_valaszt függvény dolgozza fel, 
amely a pontok hozzáadását a pontok_hozzaadasa függvényen keresztül végzi (tanoda/pont/views.py).
Template: szorzas_gyakorlo.html
Ez a szekció a szorzás gyakorló felület, ahol a felhasználó szorzási feladatokat old meg, 
a helyes válaszokért pontokat kap, a pontozás pedig a fent említett függvényeken keresztül történik.

Fejlesztési feladatok:
- Ellenőrizd a pontozási logikát a helyes válaszok kezelésénél, és győződj meg róla, hogy a pontok helyesen kerülnek hozzáadásra.
- Gondoskodj arról, hogy a felhasználói felület (szorzas_gyakorlo.html) felhasználóbarát és könnyen érthető legyen.
- Implementáld a visszajelzési rendszert, hogy a tanulók azonnal lássák, hány pontot szereztek a feladatok megoldásáért.
- Teszteld a szekció működését különböző böngészőkben és eszközökön, hogy biztosítsd a zökkenőmentes felhasználói élményt.
- Dokumentáld a kódot és a fejlesztési folyamatot, hogy más fejlesztők is könnyen megértsék és továbbfejleszthessék a modult.
- Készíts egy rövid felhasználói útmutatót a tanárok és diákok számára, hogy könnyen használhassák a szorzás gyakorló felületet.
- Fejleszd a frontend vizuális megjelenését és interaktivitását.

A szülősablon az egész számok, a gyermeksablon a szorzas_gyakorlo.html fájl.

Console hibák:
szorzas/:398   GET http://127.0.0.1:8002/egesz_szamok/leaderboard/ 500 (Internal Server Error)
(anonymous) @ szorzas/:398
szorzas/:412  Hiba a leaderboard betöltésekor: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON

✅ Szorzás Gyakorló - Teljes Gamification Integráció Kész!

  🎯 Elvégzett Fejlesztések

  1. Leaderboard Hiba Javítva ✓

  Probléma: NameError: name 'Sum' is not defined
  Megoldás: Hozzáadtam a hiányzó import-ot:
  from django.db.models import Count, F, Sum

  2. Backend: ScoringService Integráció ✓

  szorzas_gyakorlo view (egesz_szamok/views.py:372-385)
  - Eltávolítottam a régi calculate_pontszam függvényt
  - Implementáltam az új ScoringService.szamol_pontot() hívást:
  pontszam, max_pontszam = ScoringService.szamol_pontot(
      kategoria='szorzas_gyakorlas',
      nehezsegi_szint=nehezseg,
      valaszido=valaszido,
      szorzo=szorzo,
      szorzando=szorzando
  )

  kezeld_helyes_valaszt függvény (egesz_szamok/views.py:233-287)
  - Cserélt pontok_hozzaadasa → ScoringService.hozzaad_pontot
  - Gamification adatok visszaadása a response-ban:
  'gamification': {
      'szint': scoring_result.get('szint'),       # XP, rang, szintnövekedés
      'streak': scoring_result.get('streak'),     # Sorozat, rekord
      'uj_badges': scoring_result.get('uj_badges', [])  # Új kitűzők
  }

  3. Frontend: Gamification Visszajelzés ✓

  Template (szorzas_gyakorlo.html)
  - Gamification CSS betöltve
  - Real-time scoring JavaScript betöltve
  - Notifications konténer hozzáadva

  JavaScript (szorzas_gyakorlo.js:153-158)
  - Custom 'points-earned' event kiváltása helyes válasz esetén:
  if (data.eredmeny && data.gamification) {
      document.dispatchEvent(new CustomEvent('points-earned', {
          detail: { scoring_result: data }
      }));
  }

  4. Automatikus Real-time Értesítések ✓

  Az real_time_scoring.js automatikusan kezeli:

  Szintnövekedés értesítés:
  🎉 Szint növekedés!
  Elérted a 6. szintet (Haladó)

  Új badge értesítés:
  🎯 Új kitűző!
  Első lépések: Szerezz meg az első 100 pontot

  Streak rekord értesítés:
  🔥 Új rekord!
  5 napos sorozat!

  ---
  🎨 Felhasználói Élmény Fejlesztések

  1. Azonnali visszajelzés - Minden helyes válasz után látható:
    - Pontszám animation
    - XP növekedés
    - Szint progress bar frissülés
    - Streak számláló update
  2. Vizuális értesítések - Színes, animált kártyák:
    - Szintnövekedés: Rózsaszín-piros gradiens
    - Badge: Kék-cián gradiens
    - Streak: Rózsaszín-sárga gradiens
  3. Gamification navbar - Real-time frissítés:
    - Pontszám automatikus növekedés animációval
    - Pulse effekt a változáskor

  ---
  🚀 Használat

  Próbáld ki: http://127.0.0.1:8002/egesz_szamok/szorzas/

  1. Oldj meg egy feladatot helyesen
  2. Nézd meg az azonnali visszajelzést:
    - Pontszám megjelenik
    - Navbar frissül
  3. Ha szintet lépsz vagy badge-et szerzel:
    - Animált értesítés jelenik meg jobb felül
    - 5 másodpercig látható, majd eltűnik

  ---
  📊 Teljes Integráció

  A szorzás gyakorló most teljesen integrálva van a gamification rendszerrel:

  ✅ Pontozás: ScoringService (egyszerűsített képletek, bónuszokkal)
  ✅ XP & Szintek: Automatikus szintnövekedés
  ✅ Badge-ek: 12 különböző kitűző automatikus ellenőrzéssel
  ✅ Streak: Napi sorozat követés
  ✅ Real-time: Azonnali értesítések minden változásról
  ✅ Navbar: Automatikus pontszám frissítés