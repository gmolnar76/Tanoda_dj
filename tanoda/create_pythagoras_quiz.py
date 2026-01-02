# create_pythagoras_quiz.py
import os
import django

# Django környezet beállítása (szükséges, ha a manage.py-n kívülről futtatod)
# Ha a manage.py shell < fájlnév módszert használod, ez a rész nem feltétlenül kell,
# de nem árt, ha önállóan is futtatható a script.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tanoda.settings')
django.setup()

from kerdoiv.models import Kerdoiv, Kerdes, Valaszlehetoseg

print("Minta kérdőív létrehozásának megkezdése...")

# --- Kérdőív létrehozása ---
kerdoiv_cim = "Pitagorasz-tábla Kvíz"
kerdoiv_leiras = "Teszteld tudásod a szorzótáblával és a digitális gyökökkel kapcsolatban!"

# Ellenőrizzük, létezik-e már ilyen című kérdőív
kerdoiv, created = Kerdoiv.objects.get_or_create(
    cim=kerdoiv_cim,
    defaults={'leiras': kerdoiv_leiras, 'aktiv': True}
)

if not created:
    print(f"A '{kerdoiv_cim}' kérdőív már létezik.")
    # Eldöntheted, hogy felülírod-e a kérdéseket, vagy hozzáadsz újakat, vagy nem csinálsz semmit.
    # Most: csak akkor hozunk létre kérdéseket, ha a kérdőív új, vagy ha még nincsenek kérdései.
    if not kerdoiv.kerdesek.exists():
        print("A létező kérdőívnek nincsenek kérdései, hozzáadunk újakat.")
        create_questions = True
    else:
        print("A létező kérdőívnek már vannak kérdései, nem adunk hozzá újakat.")
        create_questions = False
else:
    print(f"'{kerdoiv_cim}' kérdőív létrehozva.")
    create_questions = True

# --- Kérdések és válaszok létrehozása ---
if create_questions:
    print("Kérdések létrehozása...")

    # 1. Kérdés: Feleletválasztós (egy helyes)
    kerdes1 = Kerdes.objects.create(
        kerdoiv=kerdoiv,
        szoveg="Mennyi 7 x 8?",
        tipus='FELELETVALASZTOS_EGY',
        pontszam=1,
        sorrend=1
    )
    Valaszlehetoseg.objects.create(kerdes=kerdes1, szoveg="49", helyes=False)
    Valaszlehetoseg.objects.create(kerdes=kerdes1, szoveg="54", helyes=False)
    Valaszlehetoseg.objects.create(kerdes=kerdes1, szoveg="56", helyes=True)
    Valaszlehetoseg.objects.create(kerdes=kerdes1, szoveg="64", helyes=False)
    print(" - Kérdés 1 létrehozva.")

    # 2. Kérdés: Feleletválasztós (több helyes)
    kerdes2 = Kerdes.objects.create(
        kerdoiv=kerdoiv,
        szoveg="Mely számok jelennek meg a 9-es sorában/oszlopában a Pitagorasz-táblán (10x10-es táblán)? (Több helyes válasz)",
        tipus='FELELETVALASZTOS_TOBB',
        pontszam=2,
        sorrend=2
    )
    Valaszlehetoseg.objects.create(kerdes=kerdes2, szoveg="18", helyes=True)
    Valaszlehetoseg.objects.create(kerdes=kerdes2, szoveg="24", helyes=False)
    Valaszlehetoseg.objects.create(kerdes=kerdes2, szoveg="45", helyes=True)
    Valaszlehetoseg.objects.create(kerdes=kerdes2, szoveg="63", helyes=True)
    Valaszlehetoseg.objects.create(kerdes=kerdes2, szoveg="71", helyes=False)
    Valaszlehetoseg.objects.create(kerdes=kerdes2, szoveg="90", helyes=True)
    print(" - Kérdés 2 létrehozva.")

    # 3. Kérdés: Szöveges
    kerdes3 = Kerdes.objects.create(
        kerdoiv=kerdoiv,
        szoveg="Figyeld meg a Pitagorasz-tábla átlóját (1x1, 2x2, 3x3, ...). Milyen számok ezek? Írj le röviden egy mintázatot, amit észreveszel!",
        tipus='SZÖVEGES',
        pontszam=3, # Több pont, mert kifejtős
        sorrend=3
    )
    print(" - Kérdés 3 létrehozva.")

    # 4. Kérdés: Feleletválasztós (egy helyes) - Digitális gyök
    kerdes4 = Kerdes.objects.create(
        kerdoiv=kerdoiv,
        szoveg="Mennyi a 6 x 7 szorzat digitális gyöke?",
        tipus='FELELETVALASZTOS_EGY',
        pontszam=2,
        sorrend=4
    )
    # 6 * 7 = 42 -> 4 + 2 = 6
    Valaszlehetoseg.objects.create(kerdes=kerdes4, szoveg="4", helyes=False)
    Valaszlehetoseg.objects.create(kerdes=kerdes4, szoveg="2", helyes=False)
    Valaszlehetoseg.objects.create(kerdes=kerdes4, szoveg="6", helyes=True)
    Valaszlehetoseg.objects.create(kerdes=kerdes4, szoveg="9", helyes=False)
    print(" - Kérdés 4 létrehozva.")

    print("Minta kérdőív kérdései sikeresen létrehozva/frissítve.")
else:
    print("Nem történt kérdés létrehozás.")

print("Szkript befejezve.")
