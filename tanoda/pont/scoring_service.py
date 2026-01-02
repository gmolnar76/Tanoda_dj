"""
Központi pontozási szolgáltatás
Egyszerűsített, átlátható és moduláris pontozási rendszer
"""

from typing import Dict, Tuple, Optional, List
from .models import Pontszam, OsszesitettPontszam, UserLevel, Streak, Badge, UserBadge, PontozasiKategoria
from django.db import transaction


# Pontozási konfigurációk kategóriánként
PONTOZASI_RENDSZER = {
    'szorzas_gyakorlas': {
        'alap': 10,
        'max': 20,
        'bonusz_szabalyok': {
            'gyorsasag': [
                {'feltetel': lambda t: t < 5, 'pont': 2, 'szorzo': True},
                {'feltetel': lambda t: t < 10, 'pont': 1, 'szorzo': True},
            ],
            'komplexitas': [
                {'feltetel': lambda x, y: max(abs(x), abs(y)) > 10, 'pont': 2, 'szorzo': True},
                {'feltetel': lambda x, y: max(abs(x), abs(y)) > 5, 'pont': 1, 'szorzo': True},
            ],
            'specialis': [
                {'feltetel': lambda x, y: (x < 0 or y < 0), 'pont': 2, 'szorzo': True},
                {'feltetel': lambda x, y: x == y, 'pont': 3, 'szorzo': True},
            ]
        }
    },
    'pythagoras_quiz': {
        'alap': 10,
        'max': 20,
        'bonusz_szabalyok': {
            'gyorsasag': [
                {'feltetel': lambda t: t < 3, 'pont': 3, 'szorzo': True},
                {'feltetel': lambda t: t < 7, 'pont': 2, 'szorzo': True},
                {'feltetel': lambda t: t < 12, 'pont': 1, 'szorzo': True},
            ],
            'komplexitas': [
                {'feltetel': lambda x, y: (x * y) > 50, 'pont': 2, 'szorzo': True},
                {'feltetel': lambda x, y: (x * y) > 20, 'pont': 1, 'szorzo': True},
            ]
        }
    },
    'geometria': {
        'alap': 15,
        'max': 30,
        'bonusz_szabalyok': {}
    },
    'programozas': {
        'alap': 20,
        'max': 40,
        'bonusz_szabalyok': {}
    }
}


class ScoringService:
    """Központi pontozási szolgáltatás"""

    @staticmethod
    def szamol_pontot(
        kategoria: str,
        nehezsegi_szint: int = 1,
        valaszido: Optional[float] = None,
        **kwargs
    ) -> Tuple[int, int]:
        """
        Kiszámítja a megszerzett pontszámot és a max pontszámot.

        Args:
            kategoria: Pontozási kategória kódja (pl. 'szorzas_gyakorlas')
            nehezsegi_szint: Nehézségi szint (1-10)
            valaszido: Válaszadási idő másodpercben
            **kwargs: További paraméterek (pl. szorzo, szorzando)

        Returns:
            Tuple[int, int]: (megszerzett_pont, max_pont)
        """
        if kategoria not in PONTOZASI_RENDSZER:
            # Alapértelmezett pontozás ismeretlen kategóriához
            return 10 * nehezsegi_szint, 20 * nehezsegi_szint

        config = PONTOZASI_RENDSZER[kategoria]

        # Alap pont
        pont = config['alap'] * nehezsegi_szint
        max_pont = config['max'] * nehezsegi_szint

        # Bónuszok alkalmazása
        bonusz_szabalyok = config.get('bonusz_szabalyok', {})

        # Gyorsasági bónusz
        if valaszido is not None and 'gyorsasag' in bonusz_szabalyok:
            for szabaly in bonusz_szabalyok['gyorsasag']:
                if szabaly['feltetel'](valaszido):
                    if szabaly.get('szorzo', False):
                        pont += szabaly['pont'] * nehezsegi_szint
                    else:
                        pont += szabaly['pont']
                    break  # Csak az első illeszkedő szabály

        # Komplexitási bónusz (ha van szorzo és szorzando)
        szorzo = kwargs.get('szorzo')
        szorzando = kwargs.get('szorzando')
        if szorzo is not None and szorzando is not None and 'komplexitas' in bonusz_szabalyok:
            for szabaly in bonusz_szabalyok['komplexitas']:
                if szabaly['feltetel'](szorzo, szorzando):
                    if szabaly.get('szorzo', False):
                        pont += szabaly['pont'] * nehezsegi_szint
                    else:
                        pont += szabaly['pont']
                    break

        # Speciális bónuszok
        if szorzo is not None and szorzando is not None and 'specialis' in bonusz_szabalyok:
            for szabaly in bonusz_szabalyok['specialis']:
                if szabaly['feltetel'](szorzo, szorzando):
                    if szabaly.get('szorzo', False):
                        pont += szabaly['pont'] * nehezsegi_szint
                    else:
                        pont += szabaly['pont']
                    # Speciális bónuszok halmozhatók, nem break

        # Biztosítjuk, hogy ne lépjük túl a max pontot
        pont = min(pont, max_pont)

        return pont, max_pont

    @staticmethod
    @transaction.atomic
    def hozzaad_pontot(user, kategoria: str, pontszam: int, max_pontszam: int) -> Dict:
        """
        Hozzáad pontot a felhasználóhoz és frissíti a kapcsolódó elemeket.

        Args:
            user: Felhasználó objektum
            kategoria: Kategória kódja
            pontszam: Megszerzett pont
            max_pontszam: Maximum pont

        Returns:
            Dict: Eredmény információk
        """
        # Pontszám rögzítése
        uj_pontszam = Pontszam.objects.create(
            user=user,
            tevekenyseg=kategoria,
            pontszam=pontszam,
            max_pontszam=max_pontszam
        )

        # Összesített pontszám frissítése
        osszesitett, _ = OsszesitettPontszam.objects.get_or_create(user=user)
        osszesitett.frissit()

        # XP hozzáadása és szint ellenőrzés
        user_level, _ = UserLevel.objects.get_or_create(user=user)
        regi_szint = user_level.szint
        user_level.xp += pontszam
        user_level.szint_noveles_ellenorzes()
        uj_szint = user_level.szint
        szint_novekedett = uj_szint > regi_szint

        # Streak frissítése
        streak, _ = Streak.objects.get_or_create(user=user)
        regi_sorozat = streak.aktualis_sorozat
        streak.frissit()
        uj_sorozat = streak.aktualis_sorozat

        # Badge-ek ellenőrzése
        uj_badges = ScoringService._ellenorizz_badges(user)

        return {
            'pontszam': pontszam,
            'max_pontszam': max_pontszam,
            'osszes_pont': osszesitett.osszes_pont,
            'hatekonysag': round(osszesitett.atlag_hatekonysag, 2),
            'szint': {
                'jelenlegi': uj_szint,
                'xp': user_level.xp,
                'kovetkezo_szint_xp': user_level.kovetkezo_szint_xp,
                'rang': user_level.rang,
                'szint_novekedett': szint_novekedett,
                'regi_szint': regi_szint if szint_novekedett else None
            },
            'streak': {
                'aktualis': uj_sorozat,
                'leghosszabb': streak.leghosszabb_sorozat,
                'uj_rekord': uj_sorozat > regi_sorozat and uj_sorozat == streak.leghosszabb_sorozat
            },
            'uj_badges': [{'kod': b.badge.kod, 'nev': b.badge.nev, 'ikon': b.badge.ikon} for b in uj_badges]
        }

    @staticmethod
    def _ellenorizz_badges(user) -> List[UserBadge]:
        """
        Ellenőrzi, hogy megszerzett-e új badge-eket a felhasználó.

        Returns:
            List[UserBadge]: Újonnan megszerzett badge-ek
        """
        uj_badges = []

        # Lekérjük az összes badge-et
        osszes_badge = Badge.objects.all()
        mar_megszerzett_kodok = set(
            UserBadge.objects.filter(user=user).values_list('badge__kod', flat=True)
        )

        for badge in osszes_badge:
            if badge.kod in mar_megszerzett_kodok:
                continue  # Már megvan

            # Ellenőrizzük a feltételeket
            if ScoringService._teljesiti_badge_feltetelt(user, badge):
                try:
                    user_badge = UserBadge.objects.create(user=user, badge=badge)
                    uj_badges.append(user_badge)

                    # XP hozzáadása
                    if badge.pont_ertek > 0:
                        user_level, _ = UserLevel.objects.get_or_create(user=user)
                        user_level.xp += badge.pont_ertek
                        user_level.szint_noveles_ellenorzes()
                except:
                    pass  # Egyediség megszorítás miatt

        return uj_badges

    @staticmethod
    def _teljesiti_badge_feltetelt(user, badge: Badge) -> bool:
        """
        Ellenőrzi, hogy a felhasználó teljesíti-e a badge feltételét.

        Args:
            user: Felhasználó
            badge: Badge objektum

        Returns:
            bool: Teljesíti-e a feltételt
        """
        feltetel = badge.feltetel

        if not feltetel:
            return False

        feltetel_tipus = feltetel.get('tipus')

        if feltetel_tipus == 'osszes_pont':
            osszesitett = OsszesitettPontszam.objects.filter(user=user).first()
            if osszesitett:
                return osszesitett.osszes_pont >= feltetel.get('ertek', 0)

        elif feltetel_tipus == 'szint':
            user_level = UserLevel.objects.filter(user=user).first()
            if user_level:
                return user_level.szint >= feltetel.get('ertek', 0)

        elif feltetel_tipus == 'streak':
            streak = Streak.objects.filter(user=user).first()
            if streak:
                return streak.aktualis_sorozat >= feltetel.get('ertek', 0)

        elif feltetel_tipus == 'feladat_szam':
            kategoria = feltetel.get('kategoria')
            szam = Pontszam.objects.filter(user=user, tevekenyseg=kategoria).count()
            return szam >= feltetel.get('ertek', 0)

        elif feltetel_tipus == 'hatekonysag':
            osszesitett = OsszesitettPontszam.objects.filter(user=user).first()
            if osszesitett:
                return osszesitett.atlag_hatekonysag >= feltetel.get('ertek', 0)

        return False

    @staticmethod
    def get_user_stats(user) -> Dict:
        """
        Lekéri a felhasználó teljes statisztikáját.

        Returns:
            Dict: Statisztikák
        """
        osszesitett, _ = OsszesitettPontszam.objects.get_or_create(user=user)
        user_level, _ = UserLevel.objects.get_or_create(user=user)
        streak, _ = Streak.objects.get_or_create(user=user)

        badges = UserBadge.objects.filter(user=user).select_related('badge')

        return {
            'osszes_pont': osszesitett.osszes_pont,
            'hatekonysag': round(osszesitett.atlag_hatekonysag, 2),
            'szint': {
                'jelenlegi': user_level.szint,
                'xp': user_level.xp,
                'kovetkezo_szint_xp': user_level.kovetkezo_szint_xp,
                'rang': user_level.rang,
                'progress_percent': int((user_level.xp / user_level.kovetkezo_szint_xp) * 100)
            },
            'streak': {
                'aktualis': streak.aktualis_sorozat,
                'leghosszabb': streak.leghosszabb_sorozat,
                'osszes_aktiv_nap': streak.osszes_aktiv_nap
            },
            'badges': [
                {
                    'kod': b.badge.kod,
                    'nev': b.badge.nev,
                    'leiras': b.badge.leiras,
                    'ikon': b.badge.ikon,
                    'ritka': b.badge.ritka,
                    'megszerzve': b.megszerzve.isoformat()
                }
                for b in badges
            ]
        }
