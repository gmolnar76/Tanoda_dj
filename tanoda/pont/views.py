from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.db import models
from .models import Pontszam, OsszesitettPontszam, UserLevel, Streak, Badge, UserBadge
from .scoring_service import ScoringService

@login_required
def pontszam_osszesites(request):
    """Megjeleníti a felhasználó összesített pontszámát és hatékonyságát."""
    osszesitett, created = OsszesitettPontszam.objects.get_or_create(user=request.user)
    if created or request.GET.get('frissit'):
        osszesitett.frissit()
    
    pontszamok = Pontszam.objects.filter(user=request.user).order_by('-datum')[:10]
    
    context = {
        'osszesitett': osszesitett,
        'pontszamok': pontszamok,
    }
    return render(request, 'pont/osszesites.html', context)

def pontok_hozzaadasa(user, tevekenyseg, pontszam, max_pontszam):
    """Új pontszám hozzáadása és az összesített pontszám frissítése."""
    uj_pontszam = Pontszam.objects.create(
        user=user,
        tevekenyseg=tevekenyseg,
        pontszam=pontszam,
        max_pontszam=max_pontszam
    )
    
    osszesitett, created = OsszesitettPontszam.objects.get_or_create(user=user)
    
    # Frissítjük az összesített pontszámot és hatékonyságot
    osszes_pontszam = Pontszam.objects.filter(user=user).aggregate(models.Sum('pontszam'))['pontszam__sum'] or 0
    osszes_max_pontszam = Pontszam.objects.filter(user=user).aggregate(models.Sum('max_pontszam'))['max_pontszam__sum'] or 1  # Elkerüljük a nullával való osztást
    
    osszesitett.osszes_pont = osszes_pontszam
    osszesitett.atlag_hatekonysag = (osszes_pontszam / osszes_max_pontszam) * 100
    osszesitett.save()
    
    return uj_pontszam, osszesitett

@login_required
def pontszam_torles(request):
    """Törli az összes pontszámot és nullázza az összesített statisztikákat."""
    Pontszam.objects.filter(user=request.user).delete()
    
    osszesitett, _ = OsszesitettPontszam.objects.get_or_create(user=request.user)
    osszesitett.osszes_pont = 0
    osszesitett.atlag_hatekonysag = 0
    osszesitett.save()
    
    return JsonResponse({
        'osszes_pont': osszesitett.osszes_pont,
        'hatekonysag': osszesitett.atlag_hatekonysag
    })

# API Endpoint-ok real-time frissítéshez

@login_required
@require_http_methods(["GET"])
def api_aktualis_pontszam(request):
    """
    API endpoint a felhasználó aktuális pontszámának és státuszának lekérésére.
    Real-time frissítéshez használható.
    """
    stats = ScoringService.get_user_stats(request.user)
    return JsonResponse(stats)

@login_required
@require_http_methods(["GET"])
def api_szint_info(request):
    """API endpoint a felhasználó szintjének és XP-jének lekérésére."""
    user_level, _ = UserLevel.objects.get_or_create(user=request.user)

    return JsonResponse({
        'szint': user_level.szint,
        'xp': user_level.xp,
        'kovetkezo_szint_xp': user_level.kovetkezo_szint_xp,
        'rang': user_level.rang,
        'progress_percent': int((user_level.xp / user_level.kovetkezo_szint_xp) * 100) if user_level.kovetkezo_szint_xp > 0 else 0
    })

@login_required
@require_http_methods(["GET"])
def api_badges(request):
    """API endpoint a felhasználó badge-einek lekérésére."""
    badges = UserBadge.objects.filter(user=request.user).select_related('badge').order_by('-megszerzve')

    badge_lista = [
        {
            'kod': b.badge.kod,
            'nev': b.badge.nev,
            'leiras': b.badge.leiras,
            'ikon': b.badge.ikon,
            'tipus': b.badge.tipus,
            'ritka': b.badge.ritka,
            'megszerzve': b.megszerzve.isoformat()
        }
        for b in badges
    ]

    # Elérhető badge-ek (még nem megszerzettek)
    megszerzett_kodok = set(b.badge.kod for b in badges)
    elerheto_badges = Badge.objects.exclude(kod__in=megszerzett_kodok)

    elerheto_lista = [
        {
            'kod': b.kod,
            'nev': b.nev,
            'leiras': b.leiras,
            'ikon': b.ikon,
            'tipus': b.tipus,
            'ritka': b.ritka
        }
        for b in elerheto_badges
    ]

    return JsonResponse({
        'megszerzett': badge_lista,
        'elerheto': elerheto_lista
    })

@login_required
@require_http_methods(["GET"])
def api_streak(request):
    """API endpoint a felhasználó streak információinak lekérésére."""
    streak, _ = Streak.objects.get_or_create(user=request.user)

    return JsonResponse({
        'aktualis_sorozat': streak.aktualis_sorozat,
        'leghosszabb_sorozat': streak.leghosszabb_sorozat,
        'osszes_aktiv_nap': streak.osszes_aktiv_nap,
        'utolso_aktivitas': streak.utolso_aktivitas.isoformat() if streak.utolso_aktivitas else None
    })

@login_required
@require_http_methods(["GET"])
def api_leaderboard(request):
    """
    API endpoint a rangsor lekérésére.
    Top 10 felhasználó pontszám alapján.
    """
    top_users = OsszesitettPontszam.objects.select_related('user').order_by('-osszes_pont')[:10]

    leaderboard = [
        {
            'rang': idx + 1,
            'username': u.user.username,
            'osszes_pont': u.osszes_pont,
            'hatekonysag': round(u.atlag_hatekonysag, 2),
            'is_current_user': u.user == request.user
        }
        for idx, u in enumerate(top_users)
    ]

    # Jelenlegi felhasználó pozíciója, ha nincs a top 10-ben
    current_user_ossz = OsszesitettPontszam.objects.filter(user=request.user).first()
    if current_user_ossz:
        jobb_felhasznalok = OsszesitettPontszam.objects.filter(osszes_pont__gt=current_user_ossz.osszes_pont).count()
        current_user_rang = jobb_felhasznalok + 1

        return JsonResponse({
            'leaderboard': leaderboard,
            'current_user_rank': current_user_rang,
            'current_user_points': current_user_ossz.osszes_pont
        })

    return JsonResponse({
        'leaderboard': leaderboard,
        'current_user_rank': None,
        'current_user_points': 0
    })

# Továbbfejlesztett pontok_hozzaadasa függvény a ScoringService használatával
def pontok_hozzaadasa_v2(user, kategoria, pontszam, max_pontszam):
    """
    Új verzió a pontok_hozzaadasa függvényhez, a ScoringService használatával.
    Gamification elemekkel bővítve.
    """
    return ScoringService.hozzaad_pontot(user, kategoria, pontszam, max_pontszam)