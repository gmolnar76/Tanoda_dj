"""
Management command az alapértelmezett gamification elemek inicializálásához
"""

from django.core.management.base import BaseCommand
from pont.models import Badge, PontozasiKategoria


class Command(BaseCommand):
    help = 'Inicializálja az alapértelmezett badge-eket és pontozási kategóriákat'

    def handle(self, *args, **options):
        self.stdout.write('Pontozasi kategoriak letrehozasa...')
        self.create_kategoriak()

        self.stdout.write('\nBadge-ek letrehozasa...')
        self.create_badges()

        self.stdout.write(self.style.SUCCESS('\n[OK] Gamification elemek sikeresen inicializalva!'))

    def create_kategoriak(self):
        """Pontozási kategóriák létrehozása"""
        kategoriak = [
            {
                'kod': 'szorzas_gyakorlas',
                'nev': 'Szorzás gyakorlás',
                'leiras': 'Szorzótábla és szorzás gyakorlatok',
                'alap_pont': 10,
                'max_pont': 20,
                'ikon': 'fa-times'
            },
            {
                'kod': 'pythagoras_quiz',
                'nev': 'Pythagorasz kvíz',
                'leiras': 'Pythagorasz táblás szorzáskvíz',
                'alap_pont': 10,
                'max_pont': 20,
                'ikon': 'fa-table'
            },
            {
                'kod': 'geometria',
                'nev': 'Geometria',
                'leiras': 'Geometriai feladatok és alakzatok',
                'alap_pont': 15,
                'max_pont': 30,
                'ikon': 'fa-shapes'
            },
            {
                'kod': 'programozas',
                'nev': 'Programozás',
                'leiras': 'Blockly és programozási feladatok',
                'alap_pont': 20,
                'max_pont': 40,
                'ikon': 'fa-code'
            },
        ]

        for kat_data in kategoriak:
            kat, created = PontozasiKategoria.objects.get_or_create(
                kod=kat_data['kod'],
                defaults=kat_data
            )
            if created:
                self.stdout.write(f'  [+] Letrehozva: {kat.nev}')
            else:
                self.stdout.write(f'  [*] Mar letezik: {kat.nev}')

    def create_badges(self):
        """Badge-ek létrehozása"""
        badges = [
            # Teljesítmény badge-ek
            {
                'kod': 'elso_lepesek',
                'nev': 'Első lépések',
                'leiras': 'Szerezz meg az első 100 pontot',
                'ikon': '🎯',
                'tipus': 'teljesitmeny',
                'feltetel': {'tipus': 'osszes_pont', 'ertek': 100},
                'pont_ertek': 50
            },
            {
                'kod': 'szorgalmas_tanulo',
                'nev': 'Szorgalmas tanuló',
                'leiras': 'Szerezz meg 500 pontot',
                'ikon': '📚',
                'tipus': 'teljesitmeny',
                'feltetel': {'tipus': 'osszes_pont', 'ertek': 500},
                'pont_ertek': 100
            },
            {
                'kod': 'bajnok',
                'nev': 'Bajnok',
                'leiras': 'Szerezz meg 1000 pontot',
                'ikon': '🏆',
                'tipus': 'teljesitmeny',
                'feltetel': {'tipus': 'osszes_pont', 'ertek': 1000},
                'pont_ertek': 200,
                'ritka': True
            },
            # Szint badge-ek
            {
                'kod': 'szint_5',
                'nev': 'Haladó',
                'leiras': 'Érj el 5. szintet',
                'ikon': '⭐',
                'tipus': 'teljesitmeny',
                'feltetel': {'tipus': 'szint', 'ertek': 5},
                'pont_ertek': 100
            },
            {
                'kod': 'szint_10',
                'nev': 'Szakértő',
                'leiras': 'Érj el 10. szintet',
                'ikon': '🌟',
                'tipus': 'teljesitmeny',
                'feltetel': {'tipus': 'szint', 'ertek': 10},
                'pont_ertek': 200,
                'ritka': True
            },
            # Sorozat badge-ek
            {
                'kod': 'hetfo_hero',
                'nev': 'Hétfő hős',
                'leiras': 'Gyakorolj 3 egymást követő napon',
                'ikon': '🔥',
                'tipus': 'sorozat',
                'feltetel': {'tipus': 'streak', 'ertek': 3},
                'pont_ertek': 75
            },
            {
                'kod': 'kitarto',
                'nev': 'Kitartó',
                'leiras': 'Gyakorolj 7 egymást követő napon',
                'ikon': '💪',
                'tipus': 'sorozat',
                'feltetel': {'tipus': 'streak', 'ertek': 7},
                'pont_ertek': 150,
                'ritka': True
            },
            {
                'kod': 'legendas',
                'nev': 'Legendás',
                'leiras': 'Gyakorolj 30 egymást követő napon',
                'ikon': '👑',
                'tipus': 'sorozat',
                'feltetel': {'tipus': 'streak', 'ertek': 30},
                'pont_ertek': 500,
                'ritka': True
            },
            # Hatékonyság badge-ek
            {
                'kod': 'pontos',
                'nev': 'Pontos',
                'leiras': 'Érj el 80% átlagos hatékonyságot',
                'ikon': '🎯',
                'tipus': 'teljesitmeny',
                'feltetel': {'tipus': 'hatekonysag', 'ertek': 80},
                'pont_ertek': 150
            },
            {
                'kod': 'tokeletes',
                'nev': 'Tökéletes',
                'leiras': 'Érj el 95% átlagos hatékonyságot',
                'ikon': '💎',
                'tipus': 'teljesitmeny',
                'feltetel': {'tipus': 'hatekonysag', 'ertek': 95},
                'pont_ertek': 300,
                'ritka': True
            },
            # Feladat specifikus badge-ek
            {
                'kod': 'szorzas_mester',
                'nev': 'Szorzás mester',
                'leiras': 'Oldj meg 50 szorzási feladatot',
                'ikon': '✖️',
                'tipus': 'specialis',
                'feltetel': {'tipus': 'feladat_szam', 'kategoria': 'szorzas_gyakorlas', 'ertek': 50},
                'pont_ertek': 100
            },
            {
                'kod': 'pythagoras_guru',
                'nev': 'Pythagoras guru',
                'leiras': 'Oldjál meg 30 Pythagoras kvízt',
                'ikon': '📊',
                'tipus': 'specialis',
                'feltetel': {'tipus': 'feladat_szam', 'kategoria': 'pythagoras_quiz', 'ertek': 30},
                'pont_ertek': 100
            },
        ]

        for badge_data in badges:
            badge, created = Badge.objects.get_or_create(
                kod=badge_data['kod'],
                defaults=badge_data
            )
            if created:
                ritka_text = ' (Ritka)' if badge_data.get('ritka') else ''
                self.stdout.write(f'  [+] Letrehozva: {badge.nev}{ritka_text}')
            else:
                self.stdout.write(f'  [*] Mar letezik: {badge.nev}')
