# --- TEST ONLY: Pythagoras Widget Test Environment ---
from django.contrib.admin.views.decorators import staff_member_required

# ...existing code...

# Test-only view for Pythagoras widget in isolated environment
@staff_member_required
def pythagoras_testwidget_view(request):
    """Staff-only: Render the test parent template for the Pythagoras widget."""
    return render(request, 'egesz_szamok/widgets/testwidget/widget_pythagoras_testcopy.html')
# Időbélyeg10.10 17:51*/

from django.shortcuts import render
from django.http import JsonResponse, HttpResponseBadRequest
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
import random
import json
from pont.views import pontok_hozzaadasa
from pont.models import OsszesitettPontszam, Pontszam, Kihivas
from pont.scoring_service import ScoringService

from django.db import models, IntegrityError, transaction
from django.db.models import Count, F, Sum
from .models import (
    SzorzasGyakorlatSession, HelyesValasz, SzorzasiSzabaly, MegoldasiModszer, 
    HibasValasz, SzintStatisztika, HibaStatisztika
)
from kerdoiv.models import Kerdoiv # Import Kerdoiv
from kerdoiv.forms import KerdoivKitoltesForm # Import the form

def szorzas_tobbjegyuvel(request):
    context = {
        'aktiv_modul': 'szorzas_tobbjegyuvel',
    }
    return render(request, 'egesz_szamok/szorzas/szorzas_tobbjegyuvel.html', context)

def szorzasok(request):
    context = {
        'aktiv_modul': 'szorzasok',
    }
    return render(request, 'egesz_szamok/szorzas/szorzasok.html', context)

@login_required
def szorzas_helyiertek_matrix(request):
    """Helyiérték mátrix nézet a szorzás műveletekhez"""
    
    # AJAX kérés kezelése feladat generáláshoz
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        szorzo = random.randint(1000, 9999)  # 4 jegyű szám
        szorzando = random.randint(100, 999)  # 3 jegyű szám
        return JsonResponse({
            'szorzo': szorzo,
            'szorzando': szorzando
        })
    
    # Normál oldalbetöltés
    context = {
        'aktiv_modul': 'szorzas_helyiertek_matrix',
        'szorzo': random.randint(1000, 9999),  # Kezdeti 4 jegyű szám
        'szorzando': random.randint(100, 999),  # Kezdeti 3 jegyű szám
    }
    
    if request.method == 'POST':
        # Itt kezeljük majd a válaszok ellenőrzését
        pass
        
    return render(request, 'egesz_szamok/szorzas/szorzas_helyiertek_matrix.html', context)

@login_required
def egesz_szamok_main(request):
    aktiv_modul = request.GET.get('modul', 'szorzas')
    context = {
        'aktiv_modul': aktiv_modul,
    }
    if aktiv_modul == 'szorzas':
        return render(request, 'egesz_szamok/dashboard_szorzas.html', context)
    elif aktiv_modul == 'szorzas_tobbjegyuvel':
        return render(request, 'egesz_szamok/szorzas/szorzas_tobbjegyuvel.html', context)
    elif aktiv_modul == 'szorzasok':
        return render(request, 'egesz_szamok/szorzas/szorzasok.html', context)
    elif aktiv_modul == 'szorzas_helyiertek_matrix':
        return render(request, 'egesz_szamok/szorzas/szorzas_helyiertek_matrix.html', context)
    elif aktiv_modul == 'kordinata':
        return render(request, 'plotly/kordinata/kordinata.html', context)
    elif aktiv_modul == 'blockly':
        return render(request, 'blockly/blockly.html', context)
    elif aktiv_modul == 'ciklusok':
        return render(request, 'egesz_szamok/ciklusok/ciklusok.html', context)
    
    return render(request, 'egesz_szamok/eg_szamok_szorzasa.html', context)



NEHEZSEGI_SZINTEK = {
    1: {"min": 2, "max": 5, "negativ": False},
    2: {"min": 2, "max": 10, "negativ": False},
    3: {"min": 2, "max": 12, "szorzo": [10, 100], "negativ": False},
    4: {"min": 2, "max": 20, "nulla_esely": 0.05, "negativ": False},
    5: {"min": -12, "max": 12, "negativ": True},
    6: {"min": 10, "max": 99, "szorzo_min": 2, "szorzo_max": 9, "negativ": False},
    7: {"min": -20, "max": 20, "negativ": True},
    8: {"min": 10, "max": 99, "negativ": False},
    9: {"min": 100, "max": 999, "szorzo_min": 10, "szorzo_max": 99, "negativ": False},
    10: {"min": 1, "max": 22, "negyzetszamok": True, "negativ": False}
}

# Új függvény a számok generálásához
def general_szamokat(nehezseg, user):
    """Generates numbers for a specific difficulty level."""
    szint_beallitasok = NEHEZSEGI_SZINTEK[nehezseg]
    session, _ = SzorzasGyakorlatSession.objects.get_or_create(user=user)

    megoldott_feladatok = set(session.helyes_valaszok.filter(
        nehezsegi_szint=nehezseg
    ).values_list('szorzo', 'szorzando'))

    hibas_valaszok = set(HibasValasz.objects.filter(
        user=user, 
        javitva=False, 
        nehezsegi_szint=nehezseg
    ).values_list('szorzo', 'szorzando'))

    max_probalkozas = 100
    for _ in range(max_probalkozas):
        szorzo, szorzando = general_uj_szampar(szint_beallitasok)
        if (abs(szorzo), abs(szorzando)) in hibas_valaszok or (abs(szorzo), abs(szorzando)) not in megoldott_feladatok:
            return szorzo, szorzando

    return general_uj_szampar(szint_beallitasok)

def general_uj_szampar(szint_beallitasok):
    """Generates a pair of numbers based on the difficulty settings."""
    specialis_szam_esely = 0.05  # 5% chance for special numbers like 0, 10, 100

    if random.random() < specialis_szam_esely:
        specialis_szam = random.choice([0, 10, 100])
        if random.choice([True, False]):
            szorzo = specialis_szam
            szorzando = random.randint(szint_beallitasok['min'], szint_beallitasok['max'])
        else:
            szorzando = specialis_szam
            szorzo = random.randint(szint_beallitasok['min'], szint_beallitasok['max'])

        if szint_beallitasok.get('negativ'):
            if random.choice([True, False]):
                szorzo *= -1
            else:
                szorzando *= -1

        return szorzo, szorzando

    if szint_beallitasok.get('negyzetszamok'):
        szorzo = random.randint(szint_beallitasok['min'], int(szint_beallitasok['max']**0.5))
        szorzando = szorzo
    else:
        szorzo = random.randint(szint_beallitasok['min'], szint_beallitasok['max'])
        if 'szorzo_min' in szint_beallitasok and 'szorzo_max' in szint_beallitasok:
            szorzando = random.randint(szint_beallitasok['szorzo_min'], szint_beallitasok['szorzo_max'])
        else:
            szorzando = random.randint(szint_beallitasok['min'], szint_beallitasok['max'])

    if szint_beallitasok.get('negativ'):
        szorzo *= random.choice([-1, 1])
        szorzando *= random.choice([-1, 1])

    while szorzo in [10, 100] or szorzando in [10, 100]:
        if szorzo in [10, 100]:
            szorzo = random.randint(szint_beallitasok['min'], szint_beallitasok['max'])
        if szorzando in [10, 100]:
            szorzando = random.randint(szint_beallitasok['min'], szint_beallitasok['max'])

    return szorzo, szorzando




# Új függvények a statisztikák kezelésére
def frissit_szint_statisztika(user, nehezseg, helyes):
    with transaction.atomic():
        stat, created = SzintStatisztika.objects.get_or_create(
            user=user,
            nehezsegi_szint=nehezseg
        )
        stat.frissit(helyes)

def frissit_hiba_statisztika(user, szorzo, szorzando):
    with transaction.atomic():
        stat, created = HibaStatisztika.objects.get_or_create(
            user=user,
            szorzo=szorzo,
            szorzando=szorzando
        )
        stat.noveli_hiba_szamat()

# Új függvény az adaptív nehézség kezelésére
def szint_ellenorzes(user, aktualis_nehezseg, helyes):
    with transaction.atomic():
        session, _ = SzorzasGyakorlatSession.objects.get_or_create(user=user)
        szint_stat, _ = SzintStatisztika.objects.get_or_create(
            user=user,
            nehezsegi_szint=aktualis_nehezseg
        )
        
        # Frissítjük a statisztikát
        szint_stat.frissit(helyes)
        
        # Ellenőrizzük, hogy szükséges-e a nehézségi szint módosítása
        if szint_stat.osszes_valasz_szama >= 81:
            if szint_stat.teljesitesi_arany > 80 and aktualis_nehezseg < 10:
                session.aktualis_nehezsegi_szint = min(aktualis_nehezseg + 1, 10)
            elif szint_stat.teljesitesi_arany < 50 and aktualis_nehezseg > 1:
                session.aktualis_nehezsegi_szint = max(aktualis_nehezseg - 1, 1)
        
        session.save()
        return session.aktualis_nehezsegi_szint



# Új függvények a válaszok kezelésére
def kezeld_helyes_valaszt(request, szorzo, szorzando, pontszam, max_pontszam, mod, nehezseg):
    with transaction.atomic():
        # Helyes válasz létrehozása vagy frissítése
        helyes_valasz_obj, created = HelyesValasz.objects.update_or_create(
            szorzo=abs(szorzo),
            szorzando=abs(szorzando),
            defaults={
                'eredmeny': abs(szorzo * szorzando),
                'nehezsegi_szint': nehezseg
            }
        )

        # Releváns szabály kiválasztása és hozzárendelése
        releváns_szabaly = valassz_releváns_szabalyt(szorzo, szorzando)
        helyes_valasz_obj.alkalmazott_szabaly = releváns_szabaly
        helyes_valasz_obj.save()

        # Session frissítése
        session, _ = SzorzasGyakorlatSession.objects.get_or_create(user=request.user)
        session.helyes_valaszok.add(helyes_valasz_obj)
        session.save()

        # Pontszám hozzáadása ScoringService-szel + Gamification
        if mod == 'gyakorlo':
            scoring_result = ScoringService.hozzaad_pontot(
                request.user,
                'szorzas_gyakorlas',
                int(pontszam),
                max_pontszam
            )
        else:  # kihívás mód
            Kihivas.objects.create(
                user=request.user,
                tevekenyseg='szorzas_kihivas',
                pontszam=int(pontszam),
                max_pontszam=max_pontszam
            )
            scoring_result = {
                'osszes_pont': 0,
                'hatekonysag': 0,
                'szint': None,
                'streak': None,
                'uj_badges': []
            }

        # Összesített pontszám frissítése
        osszesitett, _ = OsszesitettPontszam.objects.get_or_create(user=request.user)
        osszesitett.frissit()

        # Szint statisztika frissítése
        frissit_szint_statisztika(request.user, nehezseg, True)

        # Szint ellenőrzés
        uj_nehezseg = szint_ellenorzes(request.user, nehezseg, True)

        # Válasz összeállítása gamification adatokkal
        response = {
            'eredmeny': True,
            'helyes_valasz': szorzo * szorzando,
            'pontszam': pontszam,
            'max_pontszam': max_pontszam,
            'osszes_pont': scoring_result.get('osszes_pont', osszesitett.osszes_pont),
            'hatekonysag': scoring_result.get('hatekonysag', round(osszesitett.atlag_hatekonysag, 2)),
            'szabaly': {
                'leiras': getattr(releváns_szabaly, 'leiras', 'Nincs elérhető leírás'),
                'magyarazat': getattr(releváns_szabaly, 'magyarazat', 'Nincs elérhető magyarázat')
            },
            'uj_nehezseg': uj_nehezseg,
            'gyenge_pontok': gyenge_pontok_azonositasa(request.user),
            # Gamification adatok
            'gamification': {
                'szint': scoring_result.get('szint'),
                'streak': scoring_result.get('streak'),
                'uj_badges': scoring_result.get('uj_badges', [])
            }
        }

        return response

def valassz_releváns_szabalyt(szorzo, szorzando):
    if szorzo == szorzando:
        szabaly = SzorzasiSzabaly.objects.filter(leiras__contains="négyzetre emelés").first()
    elif szorzo == 10 or szorzando == 10:  # "vagy" helyett "or"
        szabaly = SzorzasiSzabaly.objects.filter(leiras__contains="tízzel való szorzás").first()
    else:
        szabaly = SzorzasiSzabaly.objects.order_by('?').first()
    
    if szabaly is None:
        szabaly = SzorzasiSzabaly.objects.create(
            leiras="Általános szorzási szabály",
            magyarazat="Szorzáskor a tényezők sorrendje felcserélhető."
        )
    return szabaly



# Új függvény a gyenge pontok azonosítására
def gyenge_pontok_azonositasa(user, limit=5):
    gyenge_pontok = HibaStatisztika.objects.filter(user=user) \
        .annotate(
            hiba_arany=F('hibak_szama') / (F('hibak_szama') + Count('user__pontszamok__pontszam', filter=models.Q(user__pontszamok__tevekenyseg='szorzas_gyakorlas')))
        ) \
        .order_by('-hiba_arany', '-hibak_szama')[:limit]
    
    return [
        {
            'szorzo': pont.szorzo,
            'szorzando': pont.szorzando,
            'hibak_szama': pont.hibak_szama,
            'hiba_arany': pont.hiba_arany
        }
        for pont in gyenge_pontok
    ]


def kezeld_hibas_valaszt(request, szorzo, szorzando, felhasznalo_valasz, nehezseg):
    helyes_valasz = szorzo * szorzando
    megoldasi_modszer = valassz_megoldasi_modszert(szorzo, szorzando)
    
    # Létrehozzuk a hibás választ
    hibas_valasz = HibasValasz.objects.create(
        user=request.user,
        szorzo=szorzo,
        szorzando=szorzando,
        hibas_eredmeny=felhasznalo_valasz,
        helyes_eredmeny=helyes_valasz,
        nehezsegi_szint=nehezseg  # Hozzáadott nehézségi szint
    )

    # Hiba statisztika frissítése
    frissit_hiba_statisztika(request.user, szorzo, szorzando)
    
    # Szint statisztika frissítése
    frissit_szint_statisztika(request.user, nehezseg, False)

    uj_nehezseg = szint_ellenorzes(request.user, nehezseg, False)

    # Gyenge pontok azonosítása
    gyenge_pontok = gyenge_pontok_azonositasa(request.user)

    return {
        'eredmeny': False,
        'helyes_valasz': helyes_valasz,
        'modszer': {
            'leiras': getattr(megoldasi_modszer, 'leiras', 'Nincs elérhető leírás'),
            'alkalmazas': getattr(megoldasi_modszer, 'alkalmazas', 'Nincs elérhető alkalmazási módszer')
        },
        'uj_nehezseg': uj_nehezseg,
        'gyenge_pontok': gyenge_pontok
    }


@login_required
@require_http_methods(["GET", "POST"])
def szorzas_gyakorlo(request):
    if request.method == 'POST':
        try:
            content_type = request.META.get('CONTENT_TYPE', '')
            if 'application/json' in content_type:
                try:
                    data = json.loads(request.body)
                except json.JSONDecodeError:
                    data = request.POST
            else:
                data = request.POST

            mod = data.get('mod', 'gyakorlo')
            print(f"POST kérés - mod: {mod}, user: {request.user}")

            # Handle special server-side reset request from widget
            if mod == 'reset_pitagorasz':
                print(f"Resetting Pitagorasz for user: {request.user}")
                # Clear user-side practice state: remove wrong answers, solved tasks and reset stats
                with transaction.atomic():
                    # Clear session stored solved tasks and M2M relations
                    session, _ = SzorzasGyakorlatSession.objects.get_or_create(user=request.user)
                    session.megoldott_feladatok = []
                    session.gyenge_pontok = {}
                    session.aktualis_nehezsegi_szint = 1
                    session.save()
                    session.helyes_valaszok.clear()

                    # Delete detailed wrong answers for this user
                    deleted_hibas, _ = HibasValasz.objects.filter(user=request.user).delete()
                    print(f"Deleted {deleted_hibas} HibasValasz records")

                    # Delete aggregated error stats and per-level stats for a clean start
                    deleted_hiba_stat, _ = HibaStatisztika.objects.filter(user=request.user).delete()
                    print(f"Deleted {deleted_hiba_stat} HibaStatisztika records")
                    
                    deleted_szint_stat, _ = SzintStatisztika.objects.filter(user=request.user).delete()
                    print(f"Deleted {deleted_szint_stat} SzintStatisztika records")

                return JsonResponse({
                    'status': 'ok', 
                    'message': f'Pitagorasz adatbázis resetelve. Törölve: {deleted_hibas} hiba.',
                    'deleted_count': deleted_hibas
                })

            szorzo = int(data.get('szorzo', 0))
            szorzando = int(data.get('szorzando', 0))
            felhasznalo_valasz = int(data.get('valasz', 0))
            valaszido = float(data.get('valaszido', 0) or 0)
            nehezseg = int(data.get('nehezseg', 1))

        except (ValueError, TypeError, json.JSONDecodeError):
            return HttpResponseBadRequest('Érvénytelen bemenet')

        helyes_valasz = szorzo * szorzando
        eredmeny = felhasznalo_valasz == helyes_valasz

        if eredmeny:
            # Pontozás új ScoringService-szel
            pontszam, max_pontszam = ScoringService.szamol_pontot(
                kategoria='szorzas_gyakorlas',
                nehezsegi_szint=nehezseg,
                valaszido=valaszido,
                szorzo=szorzo,
                szorzando=szorzando
            )
            response_data = kezeld_helyes_valaszt(request, szorzo, szorzando, pontszam, max_pontszam, mod, nehezseg)
        else:
            response_data = kezeld_hibas_valaszt(request, szorzo, szorzando, felhasznalo_valasz, nehezseg)

        return JsonResponse(response_data)

    else:  # GET kérés
        if request.GET.get('statisztika') == 'kihivas':
            return kihivas_statisztika(request)
        
        session, _ = SzorzasGyakorlatSession.objects.get_or_create(user=request.user)
        nehezseg = session.aktualis_nehezsegi_szint
        szorzo, szorzando = general_szamokat(nehezseg, request.user)

        print(f"GET kérés - Generált szorzó: {szorzo}, szorzandó: {szorzando}")

        osszesitett, _ = OsszesitettPontszam.objects.get_or_create(user=request.user)
        
        megoldott_feladatok = list(session.helyes_valaszok.values('szorzo', 'szorzando', 'eredmeny'))
        
        # Frissített kód: Részletesebb hibás válaszok lekérdezése
        hibas_valaszok = list(HibasValasz.objects.filter(
            user=request.user, 
            javitva=False
        ).values(
            'szorzo', 
            'szorzando', 
            'hibas_eredmeny',  # Hozzáadva a hibás eredmény
            'helyes_eredmeny',  # Hozzáadva a helyes eredmény
            'javitva'           # Javítási állapot
        ))

        gyenge_pontok = gyenge_pontok_azonositasa(request.user)

        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'szorzo': szorzo,
                'szorzando': szorzando,
                'osszes_pont': osszesitett.osszes_pont,
                'hatekonysag': round(osszesitett.atlag_hatekonysag, 2),
                'nehezseg': nehezseg,
                'megoldott_feladatok': megoldott_feladatok,
                'hibas_valaszok': hibas_valaszok,  # Ez most már részletesebb adatokat tartalmaz
                'gyenge_pontok': gyenge_pontok,
            })
        else:
            context = {
                'aktiv_modul': 'szorzas',
                'szorzo': szorzo,
                'szorzando': szorzando,
                'osszes_pont': osszesitett.osszes_pont,
                'hatekonysag': round(osszesitett.atlag_hatekonysag, 2),
                'nehezseg': nehezseg,
                'megoldott_feladatok': json.dumps(megoldott_feladatok),
                'hibas_valaszok': json.dumps(hibas_valaszok),  # Ez most már részletesebb adatokat tartalmaz
                'gyenge_pontok': json.dumps(gyenge_pontok),
            }
            return render(request, 'egesz_szamok/dashboard_szorzas.html', context)
        

        
def calculate_pontszam(szorzo, szorzando, valaszido, nehezseg):
    pontszam = 10 * nehezseg
    
    if max(abs(szorzo), abs(szorzando)) > 10:
        pontszam += 2 * nehezseg
    elif max(abs(szorzo), abs(szorzando)) > 5:
        pontszam += 1 * nehezseg
    
    if valaszido < 5:
        pontszam += 2 * nehezseg
    elif valaszido < 10:
        pontszam += 1 * nehezseg

    if szorzo < 0 or szorzando < 0:  # "vagy" helyett "or"
        pontszam += 2 * nehezseg

    if szorzo == szorzando:
        pontszam += 3 * nehezseg

    return pontszam

def kihivas_statisztika(request):
    # Implementáld a kihívás statisztika logikáját
    pass



@login_required
def felhasznalo_statisztika(request):
    szint_statisztikak = SzintStatisztika.objects.filter(user=request.user)
    hiba_statisztikak = HibaStatisztika.objects.filter(user=request.user).order_by('-hibak_szama')[:10]
    gyenge_pontok = gyenge_pontok_azonositasa(request.user)

    context = {
        'szint_statisztikak': szint_statisztikak,
        'hiba_statisztikak': hiba_statisztikak,
        'gyenge_pontok': gyenge_pontok,
    }
    return render(request, 'egesz_szamok/felhasznalo_statisztika.html', context)

@login_required
def kihivas_statisztika(request):
    kihivasok = Kihivas.objects.filter(user=request.user, tevekenyseg='szorzas_kihivas').order_by('-datum')[:10]
    
    statisztika = {
        'osszes_kihivas': kihivasok.count(),
        'atlag_pontszam': kihivasok.aggregate(models.Avg('pontszam'))['pontszam__avg'] or 0,
        'legjobb_pontszam': kihivasok.aggregate(models.Max('pontszam'))['pontszam__max'] or 0,
        'utolso_kihivasok': list(kihivasok.values('datum', 'pontszam'))
    }
    
    return JsonResponse(statisztika)



def valassz_releváns_szabalyt(szorzo, szorzando):
    if szorzo == szorzando:
        szabaly = SzorzasiSzabaly.objects.filter(leiras__contains="négyzetre emelés").first()
    elif szorzo == 10 or szorzando == 10:
        szabaly = SzorzasiSzabaly.objects.filter(leiras__contains="tízzel való szorzás").first()
    else:
        szabaly = SzorzasiSzabaly.objects.order_by('?').first()
    
    if szabaly is None:
        szabaly = SzorzasiSzabaly.objects.create(
            leiras="Általános szorzási szabály",
            magyarazat="Szorzáskor a tényezők sorrendje felcserélhető."
        )
    return szabaly

def valassz_megoldasi_modszert(szorzo, szorzando):
    if max(abs(szorzo), abs(szorzando)) > 10:
        modszer = MegoldasiModszer.objects.filter(leiras__contains="nagy számok szorzása").first()
    else:
        modszer = MegoldasiModszer.objects.order_by('?').first()
    
    if modszer is None:
        modszer = MegoldasiModszer.objects.create(
            leiras="Általános szorzási módszer",
            alkalmazas="Szorozd össze a számokat számjegyenként, és add össze a részeredményeket."
        )
    return modszer


@login_required
@require_http_methods(["POST"])
def nullaz_pontszam(request):
    Pontszam.objects.filter(user=request.user).delete()
    osszesitett, _ = OsszesitettPontszam.objects.get_or_create(user=request.user)
    osszesitett.osszes_pont = 0
    osszesitett.atlag_hatekonysag = 0
    osszesitett.save()
    
    SzorzasGyakorlatSession.objects.filter(user=request.user).delete()
    
    return JsonResponse({
        'osszes_pont': osszesitett.osszes_pont,
        'hatekonysag': osszesitett.atlag_hatekonysag
    })


@login_required
def pythagoras_view(request):
    # Session kezelés a meglévő logika alapján
    session, _ = SzorzasGyakorlatSession.objects.get_or_create(user=request.user)
    
    # Lekérjük a felhasználó helyes és hibás válaszait
    helyes_valaszok = HelyesValasz.objects.filter(
        szorzasgyakorlatsession__user=request.user
    )
    hibas_valaszok = HibasValasz.objects.filter(
        user=request.user,
        javitva=False
    )

    context = {
        'aktiv_modul': 'pythagoras',
        'helyes_valaszok': helyes_valaszok,
        'hibas_valaszok': hibas_valaszok,
        'nehezsegi_szint': session.aktualis_nehezsegi_szint
    }
    
    return render(request, 'egesz_szamok/szorzas/pythagoras.html', context)

@login_required
def pitagorasz_adatok_view(request):
    """
    Végpont a felhasználóspecifikus adatok lekérésére a Pitagorasz-táblához
    """
    # A felhasználó helyes válaszai - javított lekérdezés
    helyes_valaszok = HelyesValasz.objects.filter(
        szorzasgyakorlatsession__user=request.user
    )
    
    # A felhasználó hibás válaszai
    hibas_valaszok = HibasValasz.objects.filter(
        user=request.user
    ).values('szorzo', 'szorzando', 'hibas_eredmeny', 'javitva')
    
    # A gyenge pontok azonosítása
    gyenge_pontok = gyenge_pontok_azonositasa(request.user)
    
    # Az adatok összegyűjtése JSON válaszhoz
    megoldott_feladatok = [
        {
            'szorzo': helyes.szorzo, 
            'szorzando': helyes.szorzando, 
            'eredmeny': helyes.eredmeny
        } for helyes in helyes_valaszok
    ]
    
    hibas_valaszok_lista = list(hibas_valaszok)
    
    return JsonResponse({
        'megoldott_feladatok': megoldott_feladatok,
        'hibas_valaszok': hibas_valaszok_lista,
        'gyenge_pontok': gyenge_pontok
    })

@login_required
def pythagoras_tabla_view(request):
    print("--- pythagoras_tabla_view futtatása ---") # Debug start
    context = {'aktiv_modul': 'pythagoras'} # Hozzáadva az aktiv_modul
    kerdoiv_form = None
    kerdoiv_instance = None

    # Próbáljuk meg lekérni az első aktív kérdőívet
    try:
        print("Aktív kérdőív keresése...") # Debug search
        kerdoiv_instance = Kerdoiv.objects.filter(aktiv=True).first()

        if kerdoiv_instance:
            print(f"Talált aktív kérdőív: ID={kerdoiv_instance.id}, Cím='{kerdoiv_instance.cim}'") # Debug found
            kerdesek = kerdoiv_instance.kerdesek.prefetch_related('valaszlehetosegek').order_by('sorrend', 'id')
            print(f"Kérdések száma: {kerdesek.count()}") # Debug question count

            if kerdesek.exists():
                 print("Űrlap létrehozása...") # Debug form creation
                 kerdoiv_form = KerdoivKitoltesForm(kerdesek=kerdesek)
                 context['kerdoiv_id_for_action'] = kerdoiv_instance.id # ID az action URL-hez
                 print("Űrlap sikeresen létrehozva.") # Debug form success
            else:
                 print(f"HIBA: A '{kerdoiv_instance.cim}' kérdőívhez nincsenek kérdések társítva.") # Debug no questions
        else:
             print("HIBA: Nem található aktív kérdőív az adatbázisban.") # Debug not found
    except Exception as e:
        # Hiba esetén logolhatunk, de ne akasszuk meg az oldal betöltését
        print(f"HIBA a kérdőív lekérésekor vagy form létrehozásakor: {e}") # Debug exception
        # Itt érdemes lehet a teljes traceback-et is logolni fejlesztés közben:
        # import traceback
        # traceback.print_exc()
        pass # A form None marad

    context['form'] = kerdoiv_form # Átadjuk a formot (lehet None)
    print(f"Rendereléshez átadott form: {'Van' if kerdoiv_form else 'Nincs'}") # Debug context
    print("--- pythagoras_tabla_view vége ---") # Debug end

    return render(request, 'egesz_szamok/szorzas/pythagoras.html', context)

@login_required
def leaderboard_view(request):
    # Get top 10 users from OsszesitettPontszam
    top_users = OsszesitettPontszam.objects.select_related('user').order_by('-osszes_pont')[:10]
    
    leaderboard = []
    for entry in top_users:
        leaderboard.append({
            'username': entry.user.get_full_name() or entry.user.username or entry.user.email,
            'total_points': entry.osszes_pont,
            'is_current_user': entry.user == request.user
        })
    
    # Get current user's rank and points
    user_rank = None
    user_points = 0
    
    user_entry = OsszesitettPontszam.objects.filter(user=request.user).first()
    if user_entry:
        user_points = user_entry.osszes_pont
        # Calculate rank (1-based)
        user_rank = OsszesitettPontszam.objects.filter(osszes_pont__gt=user_points).count() + 1
            
    return JsonResponse({
        'leaderboard': leaderboard,
        'user_rank': user_rank,
        'user_points': user_points
    })

@login_required
def ciklusok_view(request):
    """Ciklusok gyakorlását lehetővé tevő nézet, amely a Blockly és Three.js integrációját használja."""
    context = {
        'aktiv_modul': 'ciklusok',
    }
    return render(request, 'egesz_szamok/ciklusok/ciklusok.html', context)

@login_required
@require_http_methods(["GET"])
def pythagoras_quiz_questions(request):
    """
    API endpoint a Pythagorasz quiz kérdések generálásához.
    Visszaad egy JSON listát szorzási feladatokkal.
    """
    # Kérdések száma, alapértelmezetten 10
    num_questions = int(request.GET.get('count', 10))

    # Nehézségi szint (1-10)
    difficulty = int(request.GET.get('difficulty', 2))

    questions = []
    session, _ = SzorzasGyakorlatSession.objects.get_or_create(user=request.user)

    # Generáljunk egyedi kérdéseket
    generated_pairs = set()

    for i in range(num_questions):
        # Próbáljunk egyedi számpárt generálni
        attempts = 0
        while attempts < 20:
            szorzo, szorzando = general_szamokat(difficulty, request.user)
            pair = (abs(szorzo), abs(szorzando))

            if pair not in generated_pairs:
                generated_pairs.add(pair)
                break
            attempts += 1

        questions.append({
            'id': i + 1,
            'question': f'Mennyi {szorzo} × {szorzando}?',
            'szorzo': szorzo,
            'szorzando': szorzando,
            'correct_answer': szorzo * szorzando
        })

    return JsonResponse({
        'questions': questions,
        'total': len(questions),
        'difficulty': difficulty,
        'user': request.user.username
    })

@login_required
@require_http_methods(["POST"])
def pythagoras_quiz_check_answer(request):
    """
    API endpoint a válasz ellenőrzésére és pontozásra.
    Frissített verzió a ScoringService használatával + gamification.
    """
    try:
        data = json.loads(request.body)

        szorzo = int(data.get('szorzo'))
        szorzando = int(data.get('szorzando'))
        user_answer = int(data.get('answer'))
        response_time = float(data.get('response_time', 0))
        difficulty = int(data.get('difficulty', 2))

        correct_answer = szorzo * szorzando
        is_correct = user_answer == correct_answer

        if is_correct:
            # Új pontozási rendszer használata
            pontszam, max_pontszam = ScoringService.szamol_pontot(
                kategoria='pythagoras_quiz',
                nehezsegi_szint=difficulty,
                valaszido=response_time,
                szorzo=szorzo,
                szorzando=szorzando
            )

            # Helyes válasz rögzítése és gamification frissítés
            scoring_result = ScoringService.hozzaad_pontot(
                request.user,
                'pythagoras_quiz',
                pontszam,
                max_pontszam
            )

            # Session frissítése (meglévő logika)
            session, _ = SzorzasGyakorlatSession.objects.get_or_create(user=request.user)
            helyes_valasz_obj, _ = HelyesValasz.objects.update_or_create(
                szorzo=abs(szorzo),
                szorzando=abs(szorzando),
                defaults={
                    'eredmeny': abs(szorzo * szorzando),
                    'nehezsegi_szint': difficulty
                }
            )
            session.helyes_valaszok.add(helyes_valasz_obj)

            # Szint statisztika frissítése
            frissit_szint_statisztika(request.user, difficulty, True)
            uj_nehezseg = szint_ellenorzes(request.user, difficulty, True)

            return JsonResponse({
                'correct': True,
                'points_earned': pontszam,
                'max_points': max_pontszam,
                'total_points': scoring_result['osszes_pont'],
                'efficiency': scoring_result['hatekonysag'],
                'new_difficulty': uj_nehezseg,
                # Gamification adatok
                'szint': scoring_result['szint'],
                'streak': scoring_result['streak'],
                'uj_badges': scoring_result['uj_badges']
            })
        else:
            # Hibás válasz rögzítése
            response_data = kezeld_hibas_valaszt(
                request, szorzo, szorzando, user_answer, difficulty
            )

            return JsonResponse({
                'correct': False,
                'correct_answer': correct_answer,
                'explanation': response_data['modszer'],
                'new_difficulty': response_data['uj_nehezseg'],
                'weak_points': response_data['gyenge_pontok']
            })

    except (ValueError, TypeError, json.JSONDecodeError, KeyError) as e:
        return HttpResponseBadRequest(f'Érvénytelen kérés: {str(e)}')

@login_required
@require_http_methods(["GET"])
def pythagoras_quiz_status(request):
    """
    API endpoint a felhasználó aktuális státuszának lekérésére.
    """
    osszesitett, _ = OsszesitettPontszam.objects.get_or_create(user=request.user)
    session, _ = SzorzasGyakorlatSession.objects.get_or_create(user=request.user)

    # Szint statisztikák
    current_level_stats = SzintStatisztika.objects.filter(
        user=request.user,
        nehezsegi_szint=session.aktualis_nehezsegi_szint
    ).first()

    return JsonResponse({
        'total_points': osszesitett.osszes_pont,
        'efficiency': round(osszesitett.atlag_hatekonysag, 2),
        'current_difficulty': session.aktualis_nehezsegi_szint,
        'level_stats': {
            'correct_answers': current_level_stats.helyes_valaszok_szama if current_level_stats else 0,
            'total_answers': current_level_stats.osszes_valasz_szama if current_level_stats else 0,
            'success_rate': round(current_level_stats.teljesitesi_arany, 2) if current_level_stats else 0
        } if current_level_stats else None
    })


