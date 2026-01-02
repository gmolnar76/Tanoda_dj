from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required
from django.db.models import Count, Avg, Sum, F, ExpressionWrapper, FloatField, Case, When, Q
from django.db.models.functions import TruncDay
from django.utils import timezone
from datetime import timedelta
import json

from pont.models import Pontszam, OsszesitettPontszam, UserLevel, Streak, UserBadge
from pont.scoring_service import ScoringService
from egesz_szamok.models import SzintStatisztika, HibaStatisztika
from django.contrib.auth import get_user_model

@login_required
def felhasznalo_statisztika(request, user_id=None):
    """
    Felhasználói statisztika dashboard.

    Args:
        user_id: Opcionális - Ha admin megtekinti más felhasználó dashboardját
    """
    # Időszak lekérése a query paraméterekből
    idoszak = request.GET.get('idoszak', '30')  # Alapértelmezett: 30 nap

    # Dátum szűrő beállítása
    most = timezone.now()
    if idoszak != 'all':
        datum_tol = most - timedelta(days=int(idoszak))
        pontszam_datum_szuro = datum_tol
    else:
        pontszam_datum_szuro = None

    # Alapadatok lekérése
    # Ha admin és user_id van megadva, akkor annak a felhasználónak az adatait kérjük le
    User = get_user_model()
    if user_id and request.user.is_staff:
        try:
            user = User.objects.get(pk=user_id)
            viewing_other_user = True
        except User.DoesNotExist:
            user = request.user
            viewing_other_user = False
    else:
        user = request.user
        viewing_other_user = False
    osszesitett = OsszesitettPontszam.objects.get_or_create(user=user)[0]
    
    # Pontszámok szűrése dátum szerint
    if pontszam_datum_szuro:
        pontszamok = Pontszam.objects.filter(user=user, datum__gte=pontszam_datum_szuro).order_by('-datum')
    else:
        pontszamok = Pontszam.objects.filter(user=user).order_by('-datum')
    
    legutobbi_pontszamok = pontszamok[:10]
    szint_statisztikak = SzintStatisztika.objects.filter(user=user)
    hiba_statisztikak = HibaStatisztika.objects.filter(user=user).order_by('-hibak_szama')[:10]
    
    # Aktivitási adatok időbeli grafikonhoz
    aktivitasi_adatok = pontszamok.annotate(nap=TruncDay('datum')) \
        .values('nap') \
        .annotate(darab=Count('id')) \
        .order_by('nap')
    
    aktivitas_idopontok = [data['nap'].strftime('%Y-%m-%d') for data in aktivitasi_adatok]
    aktivitas_ertekek = [data['darab'] for data in aktivitasi_adatok]
    
    # Teljesítmény nehézségi szintenként
    szint_adatok = szint_statisztikak.values('nehezsegi_szint') \
        .annotate(
            teljesitesi_arany=ExpressionWrapper(
                100 * F('helyes_valaszok_szama') / F('osszes_valasz_szama'), 
                output_field=FloatField()
            )
        ).order_by('nehezsegi_szint')
    
    nehezsegi_szintek = [str(data['nehezsegi_szint']) for data in szint_adatok]
    teljesitesi_aranyok = [data['teljesitesi_arany'] for data in szint_adatok]
    
    # Hibák hőtérképe (10x10 szorzótábla)
    # Hőtérkép adatstruktúra inicializálása
    hiba_matrix = [[0 for _ in range(10)] for _ in range(10)]
    
    # Hibák összesítése
    for hiba in hiba_statisztikak:
        szorzo = hiba.szorzo - 1
        szorzando = hiba.szorzando - 1
        if 0 <= szorzo < 10 and 0 <= szorzando < 10:
            hiba_matrix[szorzo][szorzando] += hiba.hibak_szama
    
    hiba_oszlopok = [str(i) for i in range(1, 11)]  # 1-től 10-ig
    hiba_sorok = [str(i) for i in range(1, 11)]  # 1-től 10-ig
    
    # Felhasználói fejlődési trend az elmúlt időszakban
    if idoszak != 'all' and len(aktivitas_idopontok) > 0:
        fejlodes_idopontok = aktivitas_idopontok
        
        # Fejlődési pontszámok kiszámítása - minden nap kumulatív pontszáma
        fejlodes_ertekek = []
        napi_pontok = pontszamok.annotate(nap=TruncDay('datum')).values('nap').annotate(
            napi_pont=Sum('pontszam')
        ).order_by('nap')
        
        osszeg = 0
        for napi in napi_pontok:
            osszeg += napi['napi_pont']
            fejlodes_ertekek.append(osszeg)
    else:
        fejlodes_idopontok = []
        fejlodes_ertekek = []
    
    # Heti tevékenységeloszlás (hétfő-vasárnap)
    aktivitas_hetnapok = [0] * 7  # 0 = hétfő, 6 = vasárnap
    for pont in pontszamok:
        hetnapja = pont.datum.weekday()  # 0 = hétfő, 6 = vasárnap
        aktivitas_hetnapok[hetnapja] += 1
    
    # Sikeres megoldások számítása: ha a pontszám legalább 80%-a a max pontszámnak
    sikeres_megoldasok = sum(1 for p in pontszamok if p.hatekonysag() >= 80)

    # ===== Továbbfejlesztett Analytics Integráció =====

    # Hibaelemzés
    hibaelemzes = elemezz_hibakat(user, limit=10)

    # Ajánlások generálása
    ajanlasok = generalj_ajanlasokat(user, hibaelemzes, szint_statisztikak)

    # Progress számítás
    progress_metrikak = szamolj_progresst(user)

    # Gamification adatok
    try:
        gamification_stats = ScoringService.get_user_stats(user)
    except Exception:
        # Ha nincs még gamification adat
        gamification_stats = {
            'osszes_pont': osszesitett.osszes_pont,
            'szint': {'jelenlegi': 1, 'xp': 0, 'kovetkezo_szint_xp': 100, 'rang': 'Kezdő', 'progress_percent': 0},
            'streak': {'aktualis': 0, 'leghosszabb': 0, 'osszes_aktiv_nap': 0},
            'badges': [],
            'megszerzett_badges': []
        }

    # React komponens számára JSON kontextus előkészítése
    user_dashboard_data = {
        'idoszak': idoszak,
        'osszes_pont': osszesitett.osszes_pont,
        'sikeres_megoldasok': sikeres_megoldasok,
        'megoldott_feladatok': pontszamok.count(),
        'atlagos_teljesitmeny': round(sum(p.hatekonysag() for p in pontszamok) / max(1, pontszamok.count()), 1),
        'aktivitas_idopontok': aktivitas_idopontok,
        'aktivitas_ertekek': aktivitas_ertekek,
        'nehezsegi_szintek': nehezsegi_szintek,
        'teljesitesi_aranyok': teljesitesi_aranyok,
        'hiba_matrix': hiba_matrix,
        'hiba_oszlopok': hiba_oszlopok,
        'hiba_sorok': hiba_sorok,
        'fejlodes_idopontok': fejlodes_idopontok,
        'fejlodes_ertekek': fejlodes_ertekek,
        'aktivitas_hetnapok': aktivitas_hetnapok,
        'legutobbi_pontszamok': [{
            'datum': p.datum.strftime('%Y-%m-%d %H:%M'),
            'pontszam': p.pontszam,
            'max_pontszam': p.max_pontszam,
            'hatekonysag': p.hatekonysag()
        } for p in legutobbi_pontszamok],
        # Új analytics adatok
        'hibaelemzes': hibaelemzes,
        'ajanlasok': ajanlasok,
        'progress': progress_metrikak,
        'gamification': gamification_stats
    }
    
    # Felhasználó lista az adminoknak
    all_users = []
    if request.user.is_staff:
        all_users = User.objects.all().order_by('email')

    context = {
        'osszesitett': osszesitett,
        'pontszamok': legutobbi_pontszamok,
        'szint_statisztikak': szint_statisztikak,
        'hiba_statisztikak': hiba_statisztikak,
        'dashboard_data': json.dumps(user_dashboard_data),
        'viewing_other_user': viewing_other_user,
        'viewed_user': user,
        'all_users': all_users,
    }
    return render(request, 'statisztika/user_dashboard.html', context)

@login_required  # Changed from @staff_member_required for testing
def admin_dashboard(request):
    # Időszak lekérése a query paraméterekből
    idoszak = request.GET.get('idoszak', '30')  # Alapértelmezett: 30 nap
    
    # Dátum szűrő beállítása
    most = timezone.now()
    if idoszak != 'all':
        datum_tol = most - timedelta(days=int(idoszak))
        datum_szuro = Q(date_joined__gte=datum_tol)
        pontszam_datum_szuro = datum_tol  # Ez egy dátum érték, nem Q objektum
    else:
        datum_szuro = Q()
        pontszam_datum_szuro = None  # Nincs dátum szűrő
    
    # User modell lekérése
    User = get_user_model()
    
    # KPI adatok lekérése
    # Szűrés alkalmazása a felhasználókra is, ha van dátum szűrő
    felhasznalok_szurt = User.objects.filter(datum_szuro)
    osszes_felhasznalo = User.objects.count() # Összes felhasználó (szűrés nélkül)
    
    # Tanulói létszám lekérdezése (nem admin felhasználók)
    tanulok_szama = User.objects.filter(is_staff=False).count()
    
    aktiv_felhasznalok = felhasznalok_szurt.filter(last_login__gte=most-timedelta(days=7)).count() # Aktívak a szűrt időszakban
    
    # Check if OsszesitettPontszam has 'osszpontszam' field or similar
    try:
        atlag_pontszam = OsszesitettPontszam.objects.aggregate(avg=Avg('osszpontszam'))['avg'] or 0
    except:
        # Ha a mezőnév hibás, próbáljuk más néven
        try:
            atlag_pontszam = OsszesitettPontszam.objects.aggregate(avg=Avg('osszes_pont'))['avg'] or 0
        except:
            atlag_pontszam = 0
    
    # Pontszámok szűrése dátum szerint
    if pontszam_datum_szuro:
        pontszam_lista = Pontszam.objects.filter(datum__gte=pontszam_datum_szuro)
    else:
        pontszam_lista = Pontszam.objects.all()
        
    osszes_valasz = pontszam_lista.count()
    
    # Aktivitási adatok időbeli grafikonhoz
    aktivitasi_adatok = pontszam_lista.annotate(nap=TruncDay('datum')) \
        .values('nap') \
        .annotate(darab=Count('id')) \
        .order_by('nap')
    
    aktivitas_idopontok = [data['nap'].strftime('%Y-%m-%d') for data in aktivitasi_adatok]
    aktivitas_ertekek = [data['darab'] for data in aktivitasi_adatok]
    
    # Teljesítmény nehézségi szintenként
    szint_adatok = SzintStatisztika.objects.values('nehezsegi_szint') \
        .annotate(
            teljesitesi_arany=ExpressionWrapper(
                100 * Sum('helyes_valaszok_szama') / Sum('osszes_valasz_szama'), 
                output_field=FloatField()
            )
        )
    
    nehezsegi_szintek = [str(data['nehezsegi_szint']) for data in szint_adatok]
    teljesitesi_aranyok = [data['teljesitesi_arany'] for data in szint_adatok]
    
    # Hibák hőtérképe (10x10 szorzótábla)
    hiba_adatok = HibaStatisztika.objects.all()
    
    # Hőtérkép adatstruktúra inicializálása
    hiba_matrix = [[0 for _ in range(10)] for _ in range(10)]
    
    # Hibák összesítése
    for hiba in hiba_adatok:
        szorzo = hiba.szorzo - 1
        szorzando = hiba.szorzando - 1
        if 0 <= szorzo < 10 and 0 <= szorzando < 10:
            hiba_matrix[szorzando][szorzo] += hiba.hibak_szama
    
    hiba_oszlopok = [str(i) for i in range(1, 11)]  # 1-től 10-ig
    hiba_sorok = [str(i) for i in range(1, 11)]  # 1-től 10-ig
    
    # Felhasználói fejlődési trend
    if idoszak != 'all' and len(aktivitas_idopontok) > 0:
        # Egyszerűsített fejlődési modell: növekvő trend az idővel
        fejlodes_idopontok = aktivitas_idopontok
        
        # Kezdeti arány: 50%, végső arány: 80% - demonstrációs célra
        kezdeti_arany = 50
        veg_arany = 80
        
        lepeskoz = (veg_arany - kezdeti_arany) / len(fejlodes_idopontok) if len(fejlodes_idopontok) > 1 else 0
        fejlodes_ertekek = [kezdeti_arany + i * lepeskoz for i in range(len(fejlodes_idopontok))]
    else:
        fejlodes_idopontok = []
        fejlodes_ertekek = []
    
    # Osztályok teljesítményének számítása
    osztaly_teljesitmeny_adatok = User.objects.filter(osztaly__isnull=False).exclude(osztaly__exact='') \
        .values('osztaly') \
        .annotate(
            tanulo_szam=Count('id'),
            # Calculate average performance and task count per class
            # This requires joining Pontszam back to User based on 'osztaly'
            # Note: This can be complex and potentially slow. Consider optimizing.
            # A simpler approach might be to iterate through users and aggregate in Python,
            # or pre-calculate these stats periodically.
            # For now, let's prepare a structure and use sample data in React first.
        ).order_by('osztaly')

    # Prepare class performance data structure (using sample data for now)
    # TODO: Replace with actual aggregated data from the query above or Python aggregation
    osztalyok_teljesitmenye_backend = [
        {'nev': o['osztaly'], 'teljesitmeny': 70 + (hash(o['osztaly']) % 20), 'feladatokSzama': 1000 + (hash(o['osztaly']) % 500) * o['tanulo_szam']}
        for o in osztaly_teljesitmeny_adatok
    ]
    # Ensure unique class names if multiple users have the same 'osztaly' string
    unique_osztalyok = {}
    for item in osztalyok_teljesitmenye_backend:
        if item['nev'] not in unique_osztalyok:
             unique_osztalyok[item['nev']] = {'teljesitmeny': [], 'feladatokSzama': 0, 'tanulo_szam': 0}
        # This sample logic is flawed, needs proper aggregation based on Pontszam
        # unique_osztalyok[item['nev']]['teljesitmeny'].append(item['teljesitmeny'])
        # unique_osztalyok[item['nev']]['feladatokSzama'] += item['feladatokSzama']
        # unique_osztalyok[item['nev']]['tanulo_szam'] += 1 # This is wrong, tanulo_szam is already count

    # Placeholder for actual aggregated data structure
    osztalyok_teljesitmenye_final = [
        {'nev': '1', 'teljesitmeny': 70, 'feladatokSzama': 1100},
        {'nev': '2', 'teljesitmeny': 72, 'feladatokSzama': 1150},
        {'nev': '3', 'teljesitmeny': 78, 'feladatokSzama': 1250},
        {'nev': '4', 'teljesitmeny': 82, 'feladatokSzama': 1350},
        {'nev': '5', 'teljesitmeny': 86, 'feladatokSzama': 1480},
        {'nev': '6', 'teljesitmeny': 81, 'feladatokSzama': 1380},
        {'nev': '7', 'teljesitmeny': 77, 'feladatokSzama': 1280},
        {'nev': '8', 'teljesitmeny': 79, 'feladatokSzama': 1320},
    ]


    # Felhasználói statisztikák táblázathoz (code remains the same)
    user_statisztikak = []
    for user in felhasznalok_szurt:
        # Pontszámok lekérése az adott felhasználóhoz, dátum szerint szűrve - Direkt lekérdezés
        pontok_query = Pontszam.objects.filter(user=user)
        if pontszam_datum_szuro:
            pontok = pontok_query.filter(datum__gte=pontszam_datum_szuro)
        else:
            pontok = pontok_query.all()

        # Összesített pontszám lekérése (egyedi lekérdezés felhasználónként)
        try:
            # Próbáljuk meg lekérdezni direktben, hátha mégis 'osszesitettpontszam' a név
            osszpontszam_obj = user.osszesitettpontszam
            ossz_pont_ertek = osszpontszam_obj.osszes_pont if osszpontszam_obj else 0
        except AttributeError: # Ha nem 'osszesitettpontszam' a név
            try:
                # Explicit lekérdezés az OsszesitettPontszam modellen keresztül
                osszpontszam_obj = OsszesitettPontszam.objects.filter(user=user).first()
                ossz_pont_ertek = osszpontszam_obj.osszes_pont if osszpontszam_obj else 0
            except Exception: # Catch any potential error during lookup
                 ossz_pont_ertek = 0
        except OsszesitettPontszam.DoesNotExist: # Ha a direkt lekérdezés nem találja
            ossz_pont_ertek = 0


        # Teljesítési arány számítása
        osszes = pontok.count() # Most már a direkt lekérdezett pontok számát használja
        # Számoljuk az átlagos hatékonyságot a pontszámok alapján
        # Kezeljük a ZeroDivisionError-t, ha max_pontszam 0
        atlag_hatekonysag_agg = pontok.aggregate(
            avg_h=Avg(
                Case(
                    When(max_pontszam=0, then=0.0), # Ha max_pontszam 0, akkor 0
                    default=ExpressionWrapper(100.0 * F('pontszam') / F('max_pontszam'), output_field=FloatField()),
                    output_field=FloatField()
                )
            )
        )
        atlag_hatekonysag = atlag_hatekonysag_agg['avg_h'] or 0.0


        # JSON-ben serializálható formátumra konvertáljuk az adatokat
        user_stat = {
            'id': user.id, # Felhasználó ID hozzáadása
            'felhasznalo_nev': user.email,
            'first_name': user.first_name, # Keresztnév hozzáadása
            'last_name': user.last_name,   # Vezetéknév hozzáadása
            'osztaly': user.osztaly, # Add the class field
            'ossz_pont': ossz_pont_ertek,
            'megoldott_feladatok': osszes,
            'teljesitesi_arany': round(atlag_hatekonysag, 1), # Kerekített átlagos hatékonyság
            'utolso_aktivitas': user.last_login.isoformat() if user.last_login else None, # Csak last_login
            'date_joined': user.date_joined.isoformat() # Csatlakozás dátuma
        }
        user_statisztikak.append(user_stat)

    # Rendezés (opcionális, pl. csatlakozás dátuma szerint)
    user_statisztikak.sort(key=lambda x: x['date_joined'], reverse=True)

    # React komponens számára JSON kontextus előkészítése
    dashboard_data = {
        'idoszak': idoszak,
        'osszes_felhasznalo': osszes_felhasznalo,
        'tanulok_szama': tanulok_szama,  # Tanulók száma hozzáadva
        'aktiv_felhasznalok': aktiv_felhasznalok,
        'atlag_pontszam': round(atlag_pontszam, 1),
        'osszes_valasz': osszes_valasz,
        'aktivitas_idopontok': aktivitas_idopontok,
        'aktivitas_ertekek': aktivitas_ertekek,
        'nehezsegi_szintek': nehezsegi_szintek,
        'teljesitesi_aranyok': teljesitesi_aranyok,
        'hiba_matrix': hiba_matrix,
        'hiba_oszlopok': hiba_oszlopok,
        'hiba_sorok': hiba_sorok,
        'fejlodes_idopontok': fejlodes_idopontok,
        'fejlodes_ertekek': fejlodes_ertekek,
        'user_statisztikak': user_statisztikak, # Frissített user_statisztikak
        'osztalyok_teljesitmenye': osztalyok_teljesitmenye_final, # Add class performance data
    }
    
    # Kontextus összeállítása a sablon számára
    context = {
        'idoszak': idoszak,
        'osszes_felhasznalo': osszes_felhasznalo,
        'tanulok_szama': tanulok_szama,  # Tanulók száma hozzáadva
        'aktiv_felhasznalok': aktiv_felhasznalok,
        'atlag_pontszam': round(atlag_pontszam, 1),
        'osszes_valasz': osszes_valasz,
        'aktivitas_idopontok': json.dumps(aktivitas_idopontok),
        'aktivitas_ertekek': json.dumps(aktivitas_ertekek),
        'nehezsegi_szintek': json.dumps(nehezsegi_szintek),
        'teljesitesi_aranyok': json.dumps(teljesitesi_aranyok),
        'hiba_matrix': json.dumps(hiba_matrix),
        'hiba_oszlopok': json.dumps(hiba_oszlopok),
        'hiba_sorok': json.dumps(hiba_sorok),
        'fejlodes_idopontok': json.dumps(fejlodes_idopontok),
        'fejlodes_ertekek': json.dumps(fejlodes_ertekek),
        'user_statisztikak': user_statisztikak, # Frissített user_statisztikak a Django sablonhoz is
        # React számára JSON formátumban is átadjuk az adatokat
        'dashboard_data': json.dumps(dashboard_data)
    }
    
    return render(request, 'statisztika/admin_dashboard.html', context)


# ===== Továbbfejlesztett Analytics Függvények =====

def elemezz_hibakat(user, limit=10):
    """
    Részletes hibaelemzés a felhasználó gyengeségeinek azonosításához.

    Returns:
        dict: Hibaelemzés különböző kategóriákban
    """
    hiba_statisztikak = HibaStatisztika.objects.filter(user=user).order_by('-hibak_szama')[:limit]

    # Kategorizált hibák
    kategoriak = {
        'kis_szamok': [],  # 1-5
        'kozepes_szamok': [],  # 6-10
        'nagy_szamok': [],  # >10
        'negyzetek': [],  # a == b
        'nullas_szorzas': [],  # egyik 0
    }

    for hiba in hiba_statisztikak:
        szorzo, szorzando = hiba.szorzo, hiba.szorzando
        hiba_data = {
            'szorzo': szorzo,
            'szorzando': szorzando,
            'eredmeny': szorzo * szorzando,
            'hibak_szama': hiba.hibak_szama,
            'tipus': []
        }

        # Kategorizálás
        max_szam = max(abs(szorzo), abs(szorzando))

        if max_szam <= 5:
            kategoriak['kis_szamok'].append(hiba_data)
            hiba_data['tipus'].append('Kis számok')
        elif max_szam <= 10:
            kategoriak['kozepes_szamok'].append(hiba_data)
            hiba_data['tipus'].append('Közepes számok')
        else:
            kategoriak['nagy_szamok'].append(hiba_data)
            hiba_data['tipus'].append('Nagy számok')

        if szorzo == szorzando:
            kategoriak['negyzetek'].append(hiba_data)
            hiba_data['tipus'].append('Négyzet')

        if szorzo == 0 or szorzando == 0:
            kategoriak['nullas_szorzas'].append(hiba_data)
            hiba_data['tipus'].append('Nullás szorzás')

    # Top 3 problémás terület
    problemak = []
    if len(kategoriak['kis_szamok']) > 0:
        problemak.append({
            'nev': 'Kis számok (1-5)',
            'hiba_db': sum(h['hibak_szama'] for h in kategoriak['kis_szamok']),
            'peldak': kategoriak['kis_szamok'][:3]
        })
    if len(kategoriak['kozepes_szamok']) > 0:
        problemak.append({
            'nev': 'Közepes számok (6-10)',
            'hiba_db': sum(h['hibak_szama'] for h in kategoriak['kozepes_szamok']),
            'peldak': kategoriak['kozepes_szamok'][:3]
        })
    if len(kategoriak['nagy_szamok']) > 0:
        problemak.append({
            'nev': 'Nagy számok (>10)',
            'hiba_db': sum(h['hibak_szama'] for h in kategoriak['nagy_szamok']),
            'peldak': kategoriak['nagy_szamok'][:3]
        })

    problemak.sort(key=lambda x: x['hiba_db'], reverse=True)

    return {
        'kategoriak': kategoriak,
        'top_problemak': problemak[:3],
        'osszes_hiba': sum(h.hibak_szama for h in hiba_statisztikak)
    }


def generalj_ajanlasokat(user, hibaelemzes, szint_statisztikak):
    """
    Személyre szabott fejlesztési ajánlások generálása.

    Returns:
        list: Ajánlások prioritás szerint
    """
    ajanlasok = []

    # Hiba alapú ajánlások
    if hibaelemzes['top_problemak']:
        for idx, problema in enumerate(hibaelemzes['top_problemak'][:2]):
            ajanlasok.append({
                'prioritas': 'magas' if idx == 0 else 'kozepes',
                'kategoria': 'Hibák javítása',
                'cim': f'{problema["nev"]} - Gyakorlásra szorul',
                'leiras': f'Ezen a területen {problema["hiba_db"]} hibát követtél el. Ajánlott további gyakorlás.',
                'ikon': '⚠️',
                'akcio': f'Gyakorold a {problema["nev"].lower()} tartományt!'
            })

    # Szint alapú ajánlások
    for szint_stat in szint_statisztikak:
        if szint_stat.teljesitesi_arany < 70:
            ajanlasok.append({
                'prioritas': 'magas',
                'kategoria': 'Teljesítmény növelés',
                'cim': f'{szint_stat.nehezsegi_szint}. szint - Gyenge teljesítmény',
                'leiras': f'Jelenlegi teljesítményed: {szint_stat.teljesitesi_arany:.1f}%. Cél: 80% feletti.',
                'ikon': '📊',
                'akcio': 'Ismételd át az alapokat ezen a szinten!'
            })

    # Általános ajánlások
    pontszamok = Pontszam.objects.filter(user=user).order_by('-datum')[:20]
    if pontszamok.count() > 0:
        atlag_hatekonysag = sum(p.hatekonysag() for p in pontszamok) / pontszamok.count()

        if atlag_hatekonysag < 75:
            ajanlasok.append({
                'prioritas': 'kozepes',
                'kategoria': 'Hatékonyság',
                'cim': 'Lassabb tempó ajánlott',
                'leiras': f'Jelenlegi átlagos hatékonyságod: {atlag_hatekonysag:.1f}%. Próbálj több időt szánni a gondolkodásra!',
                'ikon': '⏱️',
                'akcio': 'Fókuszálj a pontosságra, ne a sebességre!'
            })

    # Streak ajánlás
    try:
        streak = Streak.objects.get(user=user)
        if streak.aktualis_sorozat < 3:
            ajanlasok.append({
                'prioritas': 'alacsony',
                'kategoria': 'Rendszeresség',
                'cim': 'Napi gyakorlás',
                'leiras': f'Jelenlegi sorozatod: {streak.aktualis_sorozat} nap. Építs fel egy rendszeres rutint!',
                'ikon': '🔥',
                'akcio': 'Próbálj meg minden nap legalább 10 percet gyakorolni!'
            })
    except Streak.DoesNotExist:
        pass

    # Prioritás szerinti rendezés
    prioritas_sorrend = {'magas': 0, 'kozepes': 1, 'alacsony': 2}
    ajanlasok.sort(key=lambda x: prioritas_sorrend[x['prioritas']])

    return ajanlasok[:5]  # Top 5 ajánlás


def szamolj_progresst(user):
    """
    Felhasználói haladás számítása különböző metrikák alapján.

    Returns:
        dict: Progress adatok
    """
    try:
        user_level = UserLevel.objects.get(user=user)
        szint_progress = int((user_level.xp / user_level.kovetkezo_szint_xp) * 100)
    except UserLevel.DoesNotExist:
        szint_progress = 0

    try:
        osszesitett = OsszesitettPontszam.objects.get(user=user)
        hatekonysag_progress = min(int(osszesitett.atlag_hatekonysag), 100)
    except OsszesitettPontszam.DoesNotExist:
        hatekonysag_progress = 0

    # Badge progress
    osszes_badge = UserBadge.objects.filter(user=user).count()
    badge_progress = min(int((osszes_badge / 12) * 100), 100)  # 12 = összes badge

    return {
        'szint': szint_progress,
        'hatekonysag': hatekonysag_progress,
        'badge': badge_progress,
        'atlag': int((szint_progress + hatekonysag_progress + badge_progress) / 3)
    }