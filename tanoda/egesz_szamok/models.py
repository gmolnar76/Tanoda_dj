from django.db import models
from django.contrib.auth import get_user_model
from django.conf import settings

User = get_user_model()

# Import vNext models for Django to discover them
from .models_vnext import (
    LearningSession,
    LearningEvent,
    Attempt,
    UserLevelProgress,
    GridCellState,
    MasteryState,
    LearningModule,
    LearningMode,
    CellState,
)

class SzorzasiSzabaly(models.Model):
    leiras = models.CharField(max_length=255)
    magyarazat = models.TextField()
    nehezsegi_szint = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.leiras} (Szint: {self.nehezsegi_szint})"

class MegoldasiModszer(models.Model):
    leiras = models.CharField(max_length=255)
    alkalmazas = models.TextField()
    nehezsegi_szint = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.leiras} (Szint: {self.nehezsegi_szint})"

class HelyesValasz(models.Model):
    szorzo = models.IntegerField()
    szorzando = models.IntegerField()
    eredmeny = models.IntegerField()
    alkalmazott_szabaly = models.ForeignKey(SzorzasiSzabaly, on_delete=models.SET_NULL, null=True, blank=True)
    nehezsegi_szint = models.IntegerField(default=1)

    class Meta:
        unique_together = ('szorzo', 'szorzando')

    def __str__(self):
        return f"{self.szorzo} * {self.szorzando} = {self.eredmeny} (Szint: {self.nehezsegi_szint})"

class SzorzasGyakorlatSession(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    aktualis_nehezsegi_szint = models.IntegerField(default=1)
    megoldott_feladatok = models.JSONField(default=list)
    helyes_valaszok = models.ManyToManyField(HelyesValasz)
    utolso_frissites = models.DateTimeField(auto_now=True)
    aktualis_nehezsegi_szint = models.IntegerField(default=1)
    gyenge_pontok = models.JSONField(default=dict)

    def __str__(self):
        return f"Session for {self.user.username} (Szint: {self.aktualis_nehezsegi_szint})"

class HibasValasz(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    szorzo = models.IntegerField()
    szorzando = models.IntegerField()
    hibas_eredmeny = models.IntegerField()
    helyes_eredmeny = models.IntegerField()
    datum = models.DateTimeField(auto_now_add=True)
    javitva = models.BooleanField(default=False)
    javitasok_szama = models.IntegerField(default=0)
    nehezsegi_szint = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.user.username}: {self.szorzo} * {self.szorzando} = {self.hibas_eredmeny} (Helyes: {self.helyes_eredmeny}, Szint: {self.nehezsegi_szint})"

    class Meta:
        verbose_name = "Hibás válasz"
        verbose_name_plural = "Hibás válaszok"

class SzintStatisztika(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    nehezsegi_szint = models.IntegerField()
    helyes_valaszok_szama = models.IntegerField(default=0)
    osszes_valasz_szama = models.IntegerField(default=0)
    teljesitesi_arany = models.FloatField(default=0.0)

    class Meta:
        unique_together = ('user', 'nehezsegi_szint')

    def __str__(self):
        return f"{self.user.username} - Szint {self.nehezsegi_szint}: {self.teljesitesi_arany:.2f}%"

    def frissit(self, helyes):
        self.osszes_valasz_szama += 1
        if helyes:
            self.helyes_valaszok_szama += 1
        self.teljesitesi_arany = (self.helyes_valaszok_szama / self.osszes_valasz_szama) * 100
        self.save()

class HibaStatisztika(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    szorzo = models.IntegerField()
    szorzando = models.IntegerField()
    hibak_szama = models.IntegerField(default=0)
    utolso_hiba_datum = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'szorzo', 'szorzando')

    def __str__(self):
        return f"{self.user.username}: {self.szorzo} * {self.szorzando} - Hibák: {self.hibak_szama}"

    def noveli_hiba_szamat(self):
        self.hibak_szama += 1
        self.save()

class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    points = models.IntegerField(default=0)
    badges = models.JSONField(default=list)  # Assuming badges are stored as a list of strings

    def __str__(self):
        return f"{self.user.username} - Points: {self.points}"