from django.db import models
from django.conf import settings
from django.utils import timezone

class Pontszam(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='pontszamok')
    tevekenyseg = models.CharField(max_length=100)
    pontszam = models.IntegerField(default=0)
    max_pontszam = models.IntegerField(default=0)
    datum = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name = "Pontszám"
        verbose_name_plural = "Pontszámok"

    def __str__(self):
        return f"{self.user.username} - {self.tevekenyseg}: {self.pontszam}/{self.max_pontszam} pont"

    def hatekonysag(self):
        """Kiszámítja a pontszám hatékonyságát százalékban."""
        if self.max_pontszam > 0:
            return (self.pontszam / self.max_pontszam) * 100
        return 0

class OsszesitettPontszam(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='osszesitett_pontszam')
    osszes_pont = models.IntegerField(default=0)
    atlag_hatekonysag = models.FloatField(default=0)
    utolso_frissites = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} összesített pontszáma: {self.osszes_pont}"

    def frissit(self):
        """Frissíti az összesített pontszámot és átlag hatékonyságot."""
        pontszamok = Pontszam.objects.filter(user=self.user)
        self.osszes_pont = sum(p.pontszam for p in pontszamok)
        
        if pontszamok:
            self.atlag_hatekonysag = sum(p.hatekonysag() for p in pontszamok) / pontszamok.count()
        else:
            self.atlag_hatekonysag = 0
        
        self.save()

class Kihivas(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='kihivasok')
    tevekenyseg = models.CharField(max_length=100)
    pontszam = models.IntegerField(default=0)
    max_pontszam = models.IntegerField(default=0)
    datum = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name = "Kihívás"
        verbose_name_plural = "Kihívások"

    def __str__(self):
        return f"{self.user.username} - {self.tevekenyseg}: {self.pontszam}/{self.max_pontszam} pont"

    def hatekonysag(self):
        """Kiszámítja a kihívás hatékonyságát százalékban."""
        if self.max_pontszam > 0:
            return (self.pontszam / self.max_pontszam) * 100
        return 0

class PontozasiKategoria(models.Model):
    """Pontozási kategóriák definíciója (szorzás, geometria, programozás, stb.)"""
    kod = models.CharField(max_length=50, unique=True, help_text="Egyedi kód (pl. 'szorzas_gyakorlas')")
    nev = models.CharField(max_length=100, help_text="Megjelenítendő név")
    leiras = models.TextField(blank=True)
    alap_pont = models.IntegerField(default=10, help_text="Alapértelmezett pontszám")
    max_pont = models.IntegerField(default=20, help_text="Maximum pontszám")
    ikon = models.CharField(max_length=50, blank=True, help_text="Font Awesome ikon kód")
    aktiv = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Pontozási kategória"
        verbose_name_plural = "Pontozási kategóriák"

    def __str__(self):
        return self.nev

class UserLevel(models.Model):
    """Felhasználói szint/rang rendszer"""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='szint')
    szint = models.IntegerField(default=1, help_text="Jelenlegi szint")
    xp = models.IntegerField(default=0, help_text="Tapasztalati pont")
    kovetkezo_szint_xp = models.IntegerField(default=100, help_text="Következő szinthez szükséges XP")
    rang = models.CharField(max_length=50, default="Kezdő", help_text="Rang neve")

    class Meta:
        verbose_name = "Felhasználói szint"
        verbose_name_plural = "Felhasználói szintek"

    def __str__(self):
        return f"{self.user.username} - Szint {self.szint} ({self.rang})"

    def szint_noveles_ellenorzes(self):
        """Ellenőrzi, hogy elérte-e a következő szintet"""
        while self.xp >= self.kovetkezo_szint_xp:
            self.szint += 1
            self.xp -= self.kovetkezo_szint_xp
            self.kovetkezo_szint_xp = self._szamol_kovetkezo_szint_xp()
            self.rang = self._szamol_rang()
        self.save()

    def _szamol_kovetkezo_szint_xp(self):
        """Kiszámítja a következő szinthez szükséges XP-t"""
        return int(100 * (1.2 ** (self.szint - 1)))

    def _szamol_rang(self):
        """Kiszámítja a rangot a szint alapján"""
        if self.szint < 5:
            return "Kezdő"
        elif self.szint < 10:
            return "Haladó"
        elif self.szint < 20:
            return "Szakértő"
        elif self.szint < 30:
            return "Mester"
        else:
            return "Nagymester"

class Badge(models.Model):
    """Kitűző/jelvény definíciók"""
    TIPUS_CHOICES = [
        ('teljesitmeny', 'Teljesítmény'),
        ('sorozat', 'Sorozat'),
        ('specialis', 'Speciális'),
        ('kihivas', 'Kihívás'),
    ]

    kod = models.CharField(max_length=50, unique=True)
    nev = models.CharField(max_length=100)
    leiras = models.TextField()
    ikon = models.CharField(max_length=50, help_text="Font Awesome ikon vagy emoji")
    tipus = models.CharField(max_length=20, choices=TIPUS_CHOICES, default='teljesitmeny')
    feltetel = models.JSONField(default=dict, help_text="Megszerzési feltételek JSON formátumban")
    pont_ertek = models.IntegerField(default=0, help_text="XP jutalom a badge megszerzéséért")
    ritka = models.BooleanField(default=False, help_text="Ritka badge")

    class Meta:
        verbose_name = "Kitűző"
        verbose_name_plural = "Kitűzők"

    def __str__(self):
        return f"{self.nev} ({'Ritka' if self.ritka else 'Közönséges'})"

class UserBadge(models.Model):
    """Felhasználó által megszerzett kitűzők"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='badges')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    megszerzve = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name = "Felhasználói kitűző"
        verbose_name_plural = "Felhasználói kitűzők"
        unique_together = ['user', 'badge']

    def __str__(self):
        return f"{self.user.username} - {self.badge.nev}"

class Streak(models.Model):
    """Sorozat (egymást követő napok) nyilvántartása"""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='streak')
    aktualis_sorozat = models.IntegerField(default=0, help_text="Jelenlegi sorozat hossza (napokban)")
    leghosszabb_sorozat = models.IntegerField(default=0, help_text="Leghosszabb sorozat")
    utolso_aktivitas = models.DateField(null=True, blank=True)
    osszes_aktiv_nap = models.IntegerField(default=0)

    class Meta:
        verbose_name = "Sorozat"
        verbose_name_plural = "Sorozatok"

    def __str__(self):
        return f"{self.user.username} - {self.aktualis_sorozat} nap"

    def frissit(self):
        """Frissíti a sorozatot az aktuális dátum alapján"""
        from datetime import date, timedelta

        ma = date.today()

        if self.utolso_aktivitas is None:
            # Első aktivitás
            self.aktualis_sorozat = 1
            self.leghosszabb_sorozat = 1
            self.osszes_aktiv_nap = 1
            self.utolso_aktivitas = ma
        elif self.utolso_aktivitas == ma:
            # Ma már volt aktivitás, nem növeljük
            pass
        elif self.utolso_aktivitas == ma - timedelta(days=1):
            # Tegnap volt aktivitás, folytatódik a sorozat
            self.aktualis_sorozat += 1
            self.osszes_aktiv_nap += 1
            self.utolso_aktivitas = ma
            if self.aktualis_sorozat > self.leghosszabb_sorozat:
                self.leghosszabb_sorozat = self.aktualis_sorozat
        else:
            # Megszakadt a sorozat
            self.aktualis_sorozat = 1
            self.osszes_aktiv_nap += 1
            self.utolso_aktivitas = ma

        self.save()