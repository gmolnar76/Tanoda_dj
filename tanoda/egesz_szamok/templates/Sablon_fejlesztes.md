Dolgozz Django template rendszerben. A cél: az evf6 szülősablont (parent layout) gondold újra és ehhez a modern, kártyás, dark dashboard UI-hoz igazítsd a teljes “Egész számok / Szorzás” felületet.

Referencia dizájn (kötelező irány):
f:/WEB/Tanoda_Dj/tanoda/egesz_szamok/templates/egesz_szamok/szorzas/GUI_.jpg
(A kinézet legyen ehhez nagyon hasonló: sötét háttér, üveg/soft-shadow kártyák, neon akcentek, moduláris widgetek, modern ikonok, dashboard elrendezés.)

A jelenlegi oldal, amit át kell formálni (funkció marad, UI változik):
http://127.0.0.1:8002/egesz_szamok/szorzas/

1) Architektúra / template bontás

Az evf6 szülősablont alakítsd át úgy, hogy gyermeksablononként lehessen felépíteni a modulokat. A menü is lehet külön gyermeksablon/partial.

Követelmény:

Legyen egy modern, új evf6 parent (pl. evf6_base.html vagy a meglévő evf6 átírása).

Legyenek gyereksablonok a következő modulokra:

Szorzás gyakorló modul (a jelenlegi oldal fő funkciója)

Fejlődési grafikon modul (progress / stat / chart widget)

Püthagorasz tábla modul (interaktív táblázat / kiemelés / szűrés)

A menü legyen külön include/child (pl. partials/sidebar.html vagy menu_child.html).

Kérlek, úgy építsd fel, hogy a modulok dashboard widgetként is meg tudjanak jelenni egy “áttekintő” oldalon.

2) UI cél: modern dashboard (GUI alapján)

A layout legyen:

Bal oldali sidebar (ikon + szekciók): Szorzás / Püthagorasz / Fejlődési grafikon / Beállítások (ha kell).

Felső rész: cím + rövid státusz (pl. “Mai gyakorlás”).

Középen és jobbra: kártyák (widgets) rácsban.

Kártyák: lekerekített, finom árnyék, “glass” jelleg (de olvasható kontraszttal).

Akcent színek: neon/cyber jelleg (de ne legyen giccses, inkább prémium).

Reszponzív: desktopon 2–3 oszlop, mobilon 1 oszlop.

3) Funkcionális elvárások (ne ronts el semmit)

Backend logika lehetőleg maradjon érintetlen: csak template + CSS + minimális JS.

A szorzás gyakorló feladatgenerálás / ellenőrzés működjön tovább.

A Püthagorasz tábla legyen beépítve:

minimum 1–12 (vagy 1–20, ha már tudja a projekt)

legyen hover kiemelés, sor/oszlop highlight, és opcionálisan “szorzótényező” szűrő (pl. csak 7-es tábla).

A fejlődési grafikon modul:

ha nincs adat, legyen “placeholder” (szép üres állapot).

ha van adat (található a contextben), jeleníts meg “pontszám / idő / hibák” trendet.

lehet Chart.js, de csak ha már van a projektben; ha nincs, akkor minimal vanilla + egyszerű progress bar oké.

4) Konkrét kimeneteket kérek tőled

Adj:

Fájlszerkezet javaslatot (melyik template hova kerül).

Konkrét Django template kódot a következőkhöz:

evf6 parent (base)

sidebar/menu partial

szorzás gyereksablon

pythagoras gyereksablon

fejlődési grafikon gyereksablon

CSS (külön fájl preferált, pl. egesz_szamok/static/egesz_szamok/css/dashboard.css)

Minimális JS, ha kell (highlight, interakciók)

Rövid “hogyan kötöm be” leírás (extends/include blockok)

5) Kódminőség és stílus

Legyen tiszta, moduláris: block content, block sidebar, block extra_css, block extra_js.

Ne legyen inline CSS káosz; csak ahol indokolt.

Használj hozzáférhető kontrasztot (sötét UI-n is jól olvasható).

Használj magyar feliratokat a UI-ban.

A dizájn legyen “tanulóbarát”: nagy gombok, jól látszó feedback (helyes/hibás).

6) Extra: “dashboard overview” (opcionális, de nagyon jó)

Ha belefér, készíts egy “áttekintő” oldalt, ahol:

bal oldalt a szorzás gyakorló “mini”

középen a Püthagorasz tábla “mini”

jobb oldalt a fejlődési grafikon “mini”
És minden widgetből van egy “Megnyitás” gomb a teljes nézetre.

Fontos: a vizuális irányt a GUI_.jpg határozza meg. Ezt vedd alapnak, és ehhez igazítsd a komponenseket.