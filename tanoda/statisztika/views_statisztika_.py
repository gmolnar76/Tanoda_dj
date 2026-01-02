import json
from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required, user_passes_test
from django.db.models import Avg, Count, Sum, F, Q
import datetime

from account.models import Profile
from .models import (
    SzorzasGyakorlatSession, HelyesValasz, HibasValasz, 
    SzintStatisztika, Osztaly, Tanulo, TanuloTeljesitmeny
)

def is_teacher_or_staff(user):
    """Ellenőrzi, hogy a felhasználó tanár vagy admin-e"""
    return user.is_staff or hasattr(user, 'profile') and user.profile.is_teacher

@login_required
@user_passes_test(is_teacher_or_staff)
def admin_dashboard(request):
    """Admin dashboard főoldal"""
    active_card = request.GET.get('view', 'statisztika')
    selected_class = request.GET.get('osztaly', None)
    time_range = request.GET.get('idoszak', 'hetente')
    
    # Statisztikai adatok összegyűjtése
    statisztika = get_statisztikai_adatok(time_range)
    
    # Osztályok lekérdezése
    osztalyok = list(Osztaly.objects.values('id', 'nev').order_by('nev'))
    
    # Osztályok teljesítménye
    osztalyok_teljesitmenye = get_osztaly_teljesitmenyek(time_range)
    
    # Problémás területek
    problemas_teruletek = get_problemas_teruletek(selected_class)
    
    # Ha van kiválasztott osztály, a tanulók listáját is lekérjük
    tanulo_lista = []
    if selected_class:
        tanulo_lista = get_tanulolist_for_class(selected_class)
    
    # Módszerek hatékonysága
    modszerek = get_modszer_hatekonysagok()
    
    context = {
        'active_card': active_card,
        'selected_class': selected_class,
        'time_range': time_range,
        'statisztika': statisztika,
        'osztalyok': json.dumps(osztalyok),
        'osztalyok_teljesitmenye': json.dumps(osztalyok_teljesitmenye),
        'problemas_teruletek': json.dumps(problemas_teruletek),
        'tanulo_lista': json.dumps(tanulo_lista) if tanulo_lista else None,
        'modszerek': json.dumps(modszerek),
    }
    
    return render(request, 'admin/admin_dashboard.html', context)

def get_statisztikai_adatok(time_range):
    """Összesített statisztikai adatok lekérdezése"""
    # Releváns időszak meghatározása
    idoszak_kezdete = get_idoszak_kezdete(time_range)
    
    # Osztályok és tanulók száma
    osztalyok_szama = Osztaly.objects.count()
    tanulok_szama = Tanulo.objects.count()
    
    # Megoldott feladatok száma
    feladatok_szama = HelyesValasz.objects.filter(
        szorzasgyakorlatsession__user__profile__created_at__gte=idoszak_kezdete
    ).count()
    
    # Átlagos pontszám
    atlag_pontszam = TanuloTeljesitmeny.objects.filter(
        timestamp__gte=idoszak_kezdete
    ).aggregate(avg_pont=Avg('pontszam'))['avg_pont'] or 0
    
    # Javulás az előző időszakhoz képest
    elozo_idoszak_kezdete = get_elozo_idoszak_kezdete(time_range)
    jelenlegi_atlag = TanuloTeljesitmeny.objects.filter(
        timestamp__gte=idoszak_kezdete
    ).aggregate(avg=Avg('teljesitmeny'))['avg'] or 0
    
    elozo_atlag = TanuloTeljesitmeny.objects.filter(
        timestamp__gte=elozo_idoszak_kezdete,
        timestamp__lt=idoszak_kezdete
    ).aggregate(avg=Avg('teljesitmeny'))['avg'] or 0
    
    if elozo_atlag > 0:
        javulas_elozo_hethez = ((jelenlegi_atlag - elozo_atlag) / elozo_atlag) * 100
    else:
        javulas_elozo_hethez = 0
    
    # Átlagos napi gyakorlás percben
    atlagos_gyakorlas_perc_nap = 18  # Példa érték
    
    return {
        'osztalyok_szama': osztalyok_szama,
        'tanulok_szama': tanulok_szama,
        'feladatok_szama': feladatok_szama,
        'atlag_pontszam': round(atlag_pontszam),
        'javulas_elozo_hethez': round(javulas_elozo_hethez, 1),
        'atlagos_gyakorlas_perc_nap': atlagos_gyakorlas_perc_nap
    }

def get_osztaly_teljesitmenyek(time_range):
    """Osztályok teljesítményének lekérdezése"""
    idoszak_kezdete = get_idoszak_kezdete(time_range)
    
    osztalyok = Osztaly.objects.all()
    eredmenyek = []
    
    for osztaly in osztalyok:
        # Az osztály tanulóinak teljesítménye
        tanulok_teljesitmenye = TanuloTeljesitmeny.objects.filter(
            tanulo__osztaly=osztaly,
            timestamp__gte=idoszak_kezdete
        ).aggregate(
            avg_teljesitmeny=Avg('teljesitmeny'),
            feladatok_szama=Sum('feladatok_szama')
        )
        
        eredmenyek.append({
            'nev': osztaly.nev,
            'teljesitmeny': round(tanulok_teljesitmenye['avg_teljesitmeny'] or 0),
            'feladatokSzama': tanulok_teljesitmenye['feladatok_szama'] or 0
        })
    
    return eredmenyek

def get_problemas_teruletek(selected_class=None):
    """Problémás területek azonosítása"""
    # Ha van kiválasztott osztály, csak annak adatait nézzük
    if selected_class:
        hibas_valaszok = HibasValasz.objects.filter(
            user__profile__tanulo__osztaly__nev=selected_class,
            javitva=False
        )
    else:
        hibas_valaszok = HibasValasz.objects.filter(javitva=False)
    
    # Csoportosítás szorzópárok szerint
    problemas_teruletek_dict = {}
    for hiba in hibas_valaszok:
        kulcs = f"{hiba.szorzo}×{hiba.szorzando}"
        if kulcs not in problemas_teruletek_dict:
            problemas_teruletek_dict[kulcs] = {'hibak': 0, 'osszes': 0}
        problemas_teruletek_dict[kulcs]['hibak'] += 1
    
    # Összes próbálkozás lekérdezése
    for kulcs, ertek in problemas_teruletek_dict.items():
        szorzo, szorzando = kulcs.split('×')
        osszes_proba = HelyesValasz.objects.filter(
            szorzo=szorzo, 
            szorzando=szorzando
        ).count() + ertek['hibak']
        
        ertek['osszes'] = osszes_proba
        if osszes_proba > 0:
            ertek['arany'] = round(100 - ((ertek['hibak'] / osszes_proba) * 100))
        else:
            ertek['arany'] = 0
    
    # Rendezés helyességi arány szerint növekvő sorrendben
    problemas_teruletek = [
        {'feladat': kulcs, 'helyesValaszArany': ertek['arany']}
        for kulcs, ertek in problemas_teruletek_dict.items()
        if ertek['osszes'] >= 10  # Csak ha elég próbálkozás volt
    ]
    
    problemas_teruletek.sort(key=lambda x: x['helyesValaszArany'])
    
    return problemas_teruletek[:5]  # Top 5 legproblémásabb terület

def get_tanulolist_for_class(selected_class):
    """Tanulók listájának lekérdezése az adott osztályhoz"""
    tanulok = Tanulo.objects.filter(osztaly__nev=selected_class)
    
    tanulo_lista = []
    for tanulo in tanulok:
        # Teljesítmény adatok lekérdezése
        teljesitmeny_adatok = TanuloTeljesitmeny.objects.filter(
            tanulo=tanulo
        ).order_by('-timestamp').first()
        
        if teljesitmeny_adatok:
            tanulo_lista.append({
                'id': tanulo.id,
                'nev': tanulo.user.get_full_name() or tanulo.user.username,
                'osztaly': selected_class,
                'pontszam': teljesitmeny_adatok.pontszam,
                'teljesitmeny': teljesitmeny_adatok.teljesitmeny,
                'gyakorlasIdeje': teljesitmeny_adatok.gyakorlas_ideje
            })
        else:
            # Ha nincs teljesítmény adat, alapértékeket adunk meg
            tanulo_lista.append({
                'id': tanulo.id,
                'nev': tanulo.user.get_full_name() or tanulo.user.username,
                'osztaly': selected_class,
                'pontszam': 0,
                'teljesitmeny': 0,
                'gyakorlasIdeje': 0
            })
    
    return tanulo_lista

def get_modszer_hatekonysagok():
    """Tanítási módszerek hatékonyságának lekérdezése"""
    # Ez egy példa implementáció, valós adatbázis alapján kellene módosítani
    return [
        {"nev": "Gyakorlás", "javulas_szazalek": 15},
        {"nev": "Játékos tanulás", "javulas_szazalek": 22},
        {"nev": "Vizuális segédanyagok", "javulas_szazalek": 18},
        {"nev": "Kihívások", "javulas_szazalek": 25},
        {"nev": "Csoportmunka", "javulas_szazalek": 12}
    ]

def get_idoszak_kezdete(time_range):
    """Időszak kezdő dátumának meghatározása"""
    ma = datetime.date.today()
    
    if time_range == 'naponta':
        return datetime.datetime.combine(ma, datetime.time.min)
    elif time_range == 'hetente':
        return datetime.datetime.combine(ma - datetime.timedelta(days=ma.weekday()), datetime.time.min)
    elif time_range == 'havonta':
        return datetime.datetime.combine(datetime.date(ma.year, ma.month, 1), datetime.time.min)
    elif time_range == 'felevente':
        if ma.month <= 6:
            return datetime.datetime.combine(datetime.date(ma.year, 1, 1), datetime.time.min)
        else:
            return datetime.datetime.combine(datetime.date(ma.year, 7, 1), datetime.time.min)
    else:
        # Alapértelmezett: 1 hét
        return datetime.datetime.combine(ma - datetime.timedelta(days=7), datetime.time.min)

def get_elozo_idoszak_kezdete(time_range):
    """Előző időszak kezdő dátumának meghatározása"""
    jelenlegi_idoszak_kezdete = get_idoszak_kezdete(time_range)
    ma = datetime.date.today()
    
    if time_range == 'naponta':
        return jelenlegi_idoszak_kezdete - datetime.timedelta(days=1)
    elif time_range == 'hetente':
        return jelenlegi_idoszak_kezdete - datetime.timedelta(days=7)
    elif time_range == 'havonta':
        # Előző hónap első napja
        if ma.month == 1:
            return datetime.datetime.combine(datetime.date(ma.year - 1, 12, 1), datetime.time.min)
        else:
            return datetime.datetime.combine(datetime.date(ma.year, ma.month - 1, 1), datetime.time.min)
    elif time_range == 'felevente':
        if ma.month <= 6:
            return datetime.datetime.combine(datetime.date(ma.year - 1, 7, 1), datetime.time.min)
        else:
            return datetime.datetime.combine(datetime.date(ma.year, 1, 1), datetime.time.min)
    else:
        # Alapértelmezett: előző hét
        return jelenlegi_idoszak_kezdete - datetime.timedelta(days=7)

@login_required
@user_passes_test(is_teacher_or_staff)
def api_tanulok(request, osztaly_id=None):
    """API végpont a tanulók adatainak lekérdezéséhez"""
    if osztaly_id:
        tanulok = Tanulo.objects.filter(osztaly_id=osztaly_id)
    else:
        tanulok = Tanulo.objects.all()
    
    tanulok_data = [
        {
            'id': tanulo.id,
            'nev': tanulo.user.get_full_name() or tanulo.user.username,
            'osztaly_id': tanulo.osztaly_id,
            'osztaly_nev': tanulo.osztaly.nev,
            'email': tanulo.user.email
        }
        for tanulo in tanulok
    ]
    
    return JsonResponse({'tanulok': tanulok_data})

@login_required
@user_passes_test(is_teacher_or_staff)
def api_teljesitmeny(request, tanulo_id):
    """API végpont egy tanuló teljesítményadatainak lekérdezéséhez"""
    try:
        tanulo = Tanulo.objects.get(id=tanulo_id)
    except Tanulo.DoesNotExist:
        return JsonResponse({'error': 'A tanuló nem található'}, status=404)
    
    # Utolsó 30 nap teljesítménye
    start_date = datetime.date.today() - datetime.timedelta(days=30)
    teljesitmenyek = TanuloTeljesitmeny.objects.filter(
        tanulo=tanulo,
        timestamp__gte=start_date
    ).order_by('timestamp')
    
    data = [
        {
            'datum': t.timestamp.strftime('%Y-%m-%d'),
            'pontszam': t.pontszam,
            'teljesitmeny': t.teljesitmeny,
            'gyakorlas_ideje': t.gyakorlas_ideje
        }
        for t in teljesitmenyek
    ]
    
    return JsonResponse({
        'tanulo': {
            'id': tanulo.id,
            'nev': tanulo.user.get_full_name() or tanulo.user.username,
            'osztaly': tanulo.osztaly.nev
        },
        'teljesitmenyek': data
    })